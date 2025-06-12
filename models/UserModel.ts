import prisma from "../prisma";

// CREATE
export const createUser = (email: string, password: string, name?: string) =>
  prisma.user.create({
    data: {
      email,
      password,
      name,
      status: "active", // Default status is active
    },
  });

// READ
export const findUserByEmail = (email: string) =>
  prisma.user.findUnique({ where: { email } });

export const findUserById = async (id: number) =>
  prisma.user.findUnique({ where: { id } });

export const getAllUsers = async (skip = 0, take = 10) =>
  prisma.user.findMany({
    skip,
    take,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true, // Include status
      image: true,
      verified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

// UPDATE
export const updateUserById = async (
  id: number,
  data: Partial<{
    name: string;
    email: string;
    password: string;
    verified: boolean;
    role: string;
    status: "active" | "inactive" | "suspended"; // Reflect enum values
  }>
) => {
  return await prisma.user.update({
    where: { id },
    data,
  });
};

// DELETE
export const deleteUserById = async (id: number) =>
  prisma.user.delete({ where: { id } });

export const updateUserByEmail = (email: string, data: any) =>
  prisma.user.update({
    where: { email },
    data,
  });

export const getUserStats = async () => {
  const [allUsers, activeUsers, inactiveUsers, suspendedUsers] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: { status: "active" },
    }),
    prisma.user.count({
      where: { status: "inactive" },
    }),
    prisma.user.count({
      where: { status: "suspended" },
    }),
  ]);

  return {
    allUsers,
    active: activeUsers,
    inactive: inactiveUsers,
    suspended: suspendedUsers,
  };
};