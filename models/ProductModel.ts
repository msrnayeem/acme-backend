import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Create product
export const createProduct = async (data: {
  name: string;
  price: number;
  stock: number;
  status?: boolean;
  images: string[];
  categoryId: number;
  description?: string;
}) => {
  return prisma.product.create({
    data: {
      ...data,
      images: data.images,
      description: data.description,
    },
    include: { category: true },
  });
};

// Get all products
export const getAllProducts = async () => {
  return prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
};

// Get product by ID
export const getProductById = async (id: number) => {
  return prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });
};

// Update product
export const updateProduct = async (
  id: number,
  data: Partial<{
    name: string;
    price: number;
    stock: number;
    status: boolean;
    images: string[];
    categoryId: number;
    description?: string;
  }>
) => {
  return prisma.product.update({
    where: { id },
    data,
    include: { category: true },
  });
};

// Delete product
export const deleteProduct = async (id: number) => {
  return prisma.product.delete({
    where: { id },
  });
};
