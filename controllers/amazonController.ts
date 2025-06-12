import { Request, Response, NextFunction } from 'express';
import { AmazonService } from '../services/amazonService';

const amazonService = new AmazonService();

// Dashboard Stats
export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await amazonService.getDashboardStats();
    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

// Product-related
export const getSingleProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sku = req.params.sku;
    const productData = await amazonService.getSingleProduct(sku);

    const normalizedItemName =
      productData.attributes?.item_name?.[0]?.value ||
      productData.summaries?.[0]?.itemName ||
      'Unknown';

    res.json({
      success: true,
      data: {
        ...productData,
        normalizedItemName
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

export const getProductByASIN = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const asin = req.params.asin;
    const productData = await amazonService.getProductByASIN(asin);

    res.json({
      success: true,
      data: productData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sku = req.params.sku;
    const attributes = req.body;

    const result = await amazonService.updateProduct(sku, attributes);

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

export const getListings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const nextToken = req.query.nextToken as string;
    const listingsData = await amazonService.getListingsItems(nextToken);

    res.json({
      success: true,
      data: listingsData,
      timestamp: new Date().toISOString(),
      count: listingsData.summaries?.length || 0,
      nextToken: listingsData.nextToken || null
    });
  } catch (error) {
    next(error);
  }
};

// Order-related
export const getOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const ordersData = await amazonService.getOrderItems(limit);

    res.json({
      success: true,
      data: ordersData,
      timestamp: new Date().toISOString(),
      count: ordersData.Orders?.length || 0
    });
  } catch (error) {
    next(error);
  }
};
