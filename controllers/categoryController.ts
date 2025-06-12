import { Request, Response } from 'express';
import {
    createCategory,
    findCategoryByName,
    findCategoryById,
    updateCategoryById,
    deleteCategoryById,
    getAllCategories,
} from '../models/CategoryModel';
import { sendResponse, handleError, RequestHandler } from '../utils/responseHandler';

export const create: RequestHandler = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            sendResponse(res, 400, false, null, 'Category name is required');
            return;
        }

        const existing = await findCategoryByName(name);
        if (existing) {
            sendResponse(res, 409, false, null, 'Category already exists');
            return;
        }

        const newCategory = await createCategory(name);
        sendResponse(res, 201, true, newCategory);
    } catch (error) {
        handleError(res, error);
    }
};

export const show: RequestHandler = async (req, res) => {
    try {
        const category = await findCategoryById(Number(req.params.id));
        if (!category) {
            sendResponse(res, 404, false, null, 'Category not found');
            return;
        }
        sendResponse(res, 200, true, category);
    } catch (error) {
        handleError(res, error);
    }
};

export const showByName: RequestHandler = async (req, res) => {
    try {
        const category = await findCategoryByName(req.params.name);
        if (!category) {
            sendResponse(res, 404, false, null, 'Category not found');
            return;
        }
        sendResponse(res, 200, true, category);
    } catch (error) {
        handleError(res, error);
    }
};

export const update: RequestHandler = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            sendResponse(res, 400, false, null, 'Category name is required');
            return;
        }

        const updatedCategory = await updateCategoryById(Number(req.params.id), name);
        if (!updatedCategory) {
            sendResponse(res, 404, false, null, 'Category not found');
            return;
        }

        sendResponse(res, 200, true, updatedCategory);
    } catch (error) {
        handleError(res, error);
    }
};

export const destroy: RequestHandler = async (req, res) => {
    try {
        const deletedCategory = await deleteCategoryById(Number(req.params.id));
        if (!deletedCategory) {
            sendResponse(res, 404, false, null, 'Category not found');
            return;
        }
        sendResponse(res, 200, true, deletedCategory);
    } catch (error) {
        handleError(res, error);
    }
};

export const index: RequestHandler = async (req, res) => {
    try {
        const allCategories = await getAllCategories();
        sendResponse(res, 200, true, allCategories);
    } catch (error) {
        handleError(res, error);
    }
};