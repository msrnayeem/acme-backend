import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Create a new category
export const createCategory = (name: string) =>
  prisma.category.create({
    data: {
      name,
    },
  });

// Find a category by name
export const findCategoryByName = (name: string) =>
  prisma.category.findUnique({
    where: { name },
  });

// Find a category by ID
export const findCategoryById = async (id: number) => {
  return await prisma.category.findUnique({
    where: { id },
  });
};

// Update category by ID
export const updateCategoryById = (id: number, name: string) =>
  prisma.category.update({
    where: { id },
    data: {
      name,
    },
  });

// Delete category by ID
export const deleteCategoryById = (id: number) =>
  prisma.category.delete({
    where: { id },
  });

export const getAllCategories = async () => {
  try {
    return await prisma.category.findMany();
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to get categories: ${errorMessage}`);
  }
};

export default prisma;