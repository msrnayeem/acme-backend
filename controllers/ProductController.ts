import { Request, Response } from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../models/ProductModel";
import { sendResponse, handleError, RequestHandler } from '../utils/responseHandler';
import multer from "multer";
import fs from "fs";
import path from "path";

export const create: RequestHandler = async (req, res) => {
  try {
    const { name, price, stock, status, categoryId, description } = req.body;
    const files = req.files as Express.Multer.File[];

    if (!name || !price || !stock || !categoryId) {
      sendResponse(
        res,
        400,
        false,
        null,
        "Name, price, stock, and categoryId are required."
      );
      return;
    }

    const imagePaths = files?.map((file) => file.filename) || [];

    const newProduct = await createProduct({
      name,
      price: parseFloat(price),
      stock: parseInt(stock, 10),
      status: status === "true" || status === true,
      images: imagePaths,
      categoryId: parseInt(categoryId, 10),
      ...(description !== undefined && { description }),
    });

    sendResponse(res, 201, true, newProduct);
  } catch (error) {
    handleError(res, error);
  }
};

export const index: RequestHandler = async (_req, res) => {
  try {
    const products = await getAllProducts();
    sendResponse(res, 200, true, products);
  } catch (error) {
    handleError(res, error);
  }
};

// Get a single product by ID
export const show: RequestHandler = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      sendResponse(res, 400, false, null, "Invalid product ID");
      return;
    }

    const product = await getProductById(id);

    if (!product) {
      sendResponse(res, 404, false, null, "Product not found.");
      return;
    }

    sendResponse(res, 200, true, product);
  } catch (error) {
    handleError(res, error);
  }
};

// Update a product
export const update: RequestHandler = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      sendResponse(res, 400, false, null, "Invalid product ID");
      return;
    }

    const { name, price, stock, status, categoryId, description } = req.body;
    const files = req.files as Express.Multer.File[]; // Handle multiple files

    // Check if product exists
    const existingProduct = await getProductById(id);
    if (!existingProduct) {
      sendResponse(res, 404, false, null, "Product not found.");
      return;
    }

    // Delete old images if new images are uploaded
    if (files && files.length > 0) {
      const oldImages = existingProduct.images || [];
      oldImages.forEach((image) => {
        const filePath = path.join(__dirname, "../uploads", image);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath); // Delete the old file
        }
      });
    }

    // Prepare new image paths (use existing images if no new images are uploaded)
    const imagePaths = files?.map((file) => file.filename) || existingProduct.images;

    // Update the product
    const updatedProduct = await updateProduct(id, {
      ...(name !== undefined && { name }),
      ...(price !== undefined && { price: parseFloat(price) }),
      ...(stock !== undefined && { stock: parseInt(stock, 10) }),
      ...(status !== undefined && {
        status: status === "true" || status === true,
      }),
      ...(imagePaths !== undefined && { images: imagePaths }),
      ...(categoryId !== undefined && { categoryId: parseInt(categoryId, 10) }),
      ...(description !== undefined && { description }),
    });

    sendResponse(res, 200, true, updatedProduct);
  } catch (error) {
    handleError(res, error);
  }
};

// Delete a product
export const destroy: RequestHandler = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      sendResponse(res, 400, false, null, "Invalid product ID");
      return;
    }

    const deletedProduct = await deleteProduct(id);
    if (!deletedProduct) {
      sendResponse(res, 404, false, null, "Product not found.");
      return;
    }

    sendResponse(res, 200, true, deletedProduct);
  } catch (error) {
    handleError(res, error);
  }
};
