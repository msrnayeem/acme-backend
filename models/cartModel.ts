import prisma from "../prisma";

// Add item to cart
export const addToCart = async (userId: number, productId: number, quantity: number = 1) => {
    return prisma.cartItem.upsert({
        where: {
            userId_productId: {
                userId,
                productId,
            },
        },
        update: {
            quantity: {
                increment: quantity,
            },
        },
        create: {
            userId,
            productId,
            quantity,
        },
        include: {
            product: {
                select: {
                    name: true,
                    price: true,
                    images: true,
                },
            },
        },
    });
};

// Get user's cart
export const getCart = async (userId: number) => {
    return prisma.cartItem.findMany({
        where: { userId },
        include: {
            product: {
                select: {
                    name: true,
                    price: true,
                    images: true,
                    stock: true,
                },
            },
        },
    });
};

// Update cart item quantity
export const updateCartItem = async (
    userId: number,
    productId: number,
    quantity: number
) => {
    return prisma.cartItem.update({
        where: {
            userId_productId: {
                userId,
                productId,
            },
        },
        data: { quantity },
        include: {
            product: {
                select: {
                    name: true,
                    price: true,
                    images: true,
                },
            },
        },
    });
};

// Remove item from cart
export const removeFromCart = async (userId: number, productId: number) => {
    return prisma.cartItem.delete({
        where: {
            userId_productId: {
                userId,
                productId,
            },
        },
    });
};

// Clear cart
export const clearCart = async (userId: number) => {
    return prisma.cartItem.deleteMany({
        where: { userId },
    });
};