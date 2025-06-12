import { Request, Response } from "express";
import {
  createUser,
  findUserById,
  findUserByEmail,
  getAllUsers,
  updateUserById,
  deleteUserById,
  getUserStats,
} from "../models/UserModel";
import bcrypt from "bcrypt";
import { sendResponse, handleError, RequestHandler } from '../utils/responseHandler';

/**
 * Get current user profile
 */
export const getUserProfile: RequestHandler = async (req, res) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      sendResponse(res, 401, false, null, "Unauthorized");
      return;
    }

    const user = await findUserById(userId);

    if (!user) {
      sendResponse(res, 404, false, null, "User not found");
      return;
    }

    const { password, ...safeUser } = user;
    sendResponse(res, 200, true, safeUser);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Get all users with pagination
 */
export const getUsers: RequestHandler = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const users = await getAllUsers(skip, Number(limit));

    sendResponse(res, 200, true, users);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Update user by ID
 */
export const updateUser: RequestHandler = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const { name, email, password, role, status } = req.body;

    if (isNaN(userId)) {
      sendResponse(res, 400, false, null, "Invalid user ID");
      return;
    }

    const existingUser = await findUserById(userId);
    if (!existingUser) {
      sendResponse(res, 404, false, null, "User not found");
      return;
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (status !== undefined) {
      if (!["active", "inactive", "suspended"].includes(status)) {
        sendResponse(res, 400, false, null, "Invalid status value");
        return;
      }
      updateData.status = status;
    }

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await updateUserById(userId, updateData);

    const { password: _, ...safeUser } = updatedUser;

    sendResponse(res, 200, true, safeUser);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Delete user by ID
 */
export const deleteUser: RequestHandler = async (req, res) => {
  try {
    const userId = Number(req.params.id);

    if (isNaN(userId)) {
      sendResponse(res, 400, false, null, "Invalid user ID");
      return;
    }

    const existingUser = await findUserById(userId);
    if (!existingUser) {
      sendResponse(res, 404, false, null, "User not found");
      return;
    }

    if (existingUser.role === "admin") {
      sendResponse(res, 403, false, null, "Admin users cannot be deleted");
      return;
    }

    await deleteUserById(userId);

    sendResponse(res, 200, true, null, "User deleted successfully");
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Get user statistics
 */
export const getUserStatistics: RequestHandler = async (req, res) => {
  try {
    const stats = await getUserStats();

    sendResponse(res, 200, true, stats);
  } catch (error) {
    handleError(res, error);
  }
};
