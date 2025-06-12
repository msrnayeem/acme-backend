import { Request, Response } from "express";
import prisma from "../prisma";

// Extend the Request interface to include user property
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    userId?: number;
    role?: string;
  };
}

// this enum is used to define the possible statuses of an order.
enum OrderStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

// this will create a new order
export const createOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  // console.log("Authenticated user:", req.user);

  try {
    const userId = req.user?.userId || req.user?.id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized: Missing user ID" });
      return;
    }

    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: "Order items are required" });
      return;
    }

    let totalAmount = 0;

    const validatedItems = await Promise.all(
      items.map(async (item: { productId: number; quantity: number }) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found`);
        }

        if (product.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for ${product.name}. Available: ${product.stock}`
          );
        }

        if (product.price <= 0) {
          throw new Error(`Invalid price for ${product.name}`);
        }

        totalAmount += product.price * item.quantity;

        return {
          productId: product.id,
          quantity: item.quantity,
          price: product.price,
        };
      })
    );

    const newOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId,
          totalAmount,
          status: OrderStatus.PENDING,
          items: {
            create: validatedItems,
          },
        },
        include: {
          items: {
            include: { product: true },
          },
        },
      });

      for (const item of validatedItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return order;
    });

    res.status(201).json(newOrder);
  } catch (error: unknown) {
    console.error("Error creating order:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create order";
    res.status(500).json({ error: errorMessage });
  }
};

// this will get all orders of a user
export const getUserOrders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ error: "Unauthorized: Missing user ID" });
      return;
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(orders);
  } catch (error: unknown) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

// this will get order by id (single order)
export const getOrderById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId || req.user?.id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized: Missing user ID" });
      return;
    }

    // Fetch the order from the database with the associated items and product details
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        items: {
          include: {
            product: true, // Include associated product details
          },
        },
      },
    });

    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    // Ensure the order belongs to the authenticated user (unless admin)
    if (order.userId !== userId && req.user?.role !== "admin") {
      res.status(403).json({ error: "Unauthorized access to order" });
      return;
    }

    res.json(order);
  } catch (error: unknown) {
    console.error("Error fetching order:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch order";
    res.status(500).json({ error: errorMessage });
  }
};

// this will update the single order status (admin only)
export const updateOrderStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized: Missing user ID" });
      return;
    }

    // Fetch user from DB to check if they're admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (user.role !== "admin") {
      res.status(403).json({ error: "Unauthorized: Admin access required" });
      return;
    }

    // Validate status against our enum
    if (!Object.values(OrderStatus).includes(status)) {
      res.status(400).json({ error: "Invalid order status" });
      return;
    }

    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
    });

    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    // Disallow update if already completed or cancelled
    if (
      order.status === OrderStatus.COMPLETED ||
      order.status === OrderStatus.CANCELLED
    ) {
      res.status(400).json({
        error: `Cannot update order with status ${order.status}`,
      });
      return;
    }

    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    res.json(updatedOrder);
  } catch (error: unknown) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: "Failed to update order status" });
  }
};

// this will cancel an order (Reserved for pending orders only a user can cancel their order)
export const cancelOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId || req.user?.id; // Consistent user ID retrieval

    if (!userId) {
      res.status(401).json({ error: "Unauthorized: Missing user ID" });
      return;
    }

    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        items: {
          include: {
            product: true, // Include associated product details
          },
        },
      },
    });

    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    // Ensure the order belongs to the user
    if (order.userId !== userId) {
      res.status(403).json({ error: "Unauthorized to cancel this order" });
      return;
    }

    // Only allow cancellation if order is pending
    if (order.status !== OrderStatus.PENDING) {
      res.status(400).json({
        error: `Cannot cancel order with status ${order.status}`,
      });
      return;
    }

    // Use transaction to cancel the order and restore product stock
    const cancelledOrder = await prisma.$transaction(async (tx) => {
      // Update order status to 'CANCELLED'
      const updatedOrder = await tx.order.update({
        where: { id: parseInt(id) },
        data: { status: OrderStatus.CANCELLED },
        include: {
          items: {
            include: { product: true }, // Include associated product details
          },
        },
      });

      // Restore the product stock
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }

      return updatedOrder;
    });

    res.json(cancelledOrder);
  } catch (error: unknown) {
    console.error("Error cancelling order:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to cancel order";
    res.status(500).json({ error: errorMessage });
  }
};

// this will get all orders (admin only)
export const getAllOrders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized: Missing user ID" });
      return;
    }

    // Retrieve the user from the database
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Check if the user is an admin
    if (user.role !== "admin") {
      res.status(403).json({ error: "Unauthorized" });
      return;
    }

    const { status, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // Fix the type issue with status filtering
    const where = status && typeof status === 'string' && Object.values(OrderStatus).includes(status as OrderStatus) 
      ? { status: status as OrderStatus } 
      : {};

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take,
      }),
      prisma.order.count({ where }),
    ]);

    res.json({
      data: orders,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error: unknown) {
    console.error("Error fetching all orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

// this will delete an order (admin only)
export const deleteOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized: Missing user ID" });
      return;
    }

    // Fetch the user to check if they are an admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.role !== "admin") {
      res.status(403).json({ error: "Access denied: Admins only" });
      return;
    }

    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
    });

    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    // Delete the order and associated items in a transaction
    await prisma.$transaction([
      prisma.orderItem.deleteMany({
        where: { orderId: order.id },
      }),
      prisma.order.delete({
        where: { id: order.id },
      }),
    ]);

    res.json({ message: "Order deleted successfully" });
  } catch (error: unknown) {
    console.error("Error deleting order:", error);
    res.status(500).json({ error: "Failed to delete order" });
  }
};