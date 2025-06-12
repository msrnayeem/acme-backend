import axios, { AxiosResponse } from 'axios';
import { AmazonAuthService } from './amazonAuthService';

export class AmazonService {
  private readonly authService: AmazonAuthService;
  private readonly endpoint: string;
  private readonly marketplaceId: string;
  private readonly sellerId: string;

  constructor() {
    this.authService = new AmazonAuthService();
    this.endpoint = process.env.ENDPOINT || 'https://sellingpartnerapi-na.amazon.com';
    this.marketplaceId = process.env.MARKETPLACE_ID || '';
    this.sellerId = process.env.SELLER_ID || '';
  }

//dashboard stats
async getDashboardStats(): Promise<{ 
  totalOrders: number; 
  totalProducts: number;
  ordersThisMonth: number;
  ordersThisWeek: number;
  ordersToday: number;
}> {
  // ----------- Date calculations (based on current date: 2025-06-11) -----------
  const now = new Date('2025-06-11T14:10:00Z');
  
  // Start of current month (June 2025)
  const startOfMonth = new Date(2025, 5, 1); // June 1, 2025
  
  // Start of current week (June 9, 2025 - Monday)
  const startOfWeek = new Date(2025, 5, 9);
  
  // Start of today (June 11, 2025)
  const startOfToday = new Date(2025, 5, 11);

  try {
    // Fetch orders from last 2 months to capture May and June orders
    const twoMonthsAgo = new Date(2025, 3, 1); // April 1, 2025
    const allOrders = await this.fetchOrdersFromDate(twoMonthsAgo);

    // Calculate period-specific counts
    const ordersThisMonth = allOrders.filter(order => {
      const orderDate = new Date(order.PurchaseDate);
      return orderDate >= startOfMonth;
    }).length;

    const ordersThisWeek = allOrders.filter(order => {
      const orderDate = new Date(order.PurchaseDate);
      return orderDate >= startOfWeek;
    }).length;

    const ordersToday = allOrders.filter(order => {
      const orderDate = new Date(order.PurchaseDate);
      return orderDate >= startOfToday;
    }).length;

    // ----------- Fetch Product Count -----------
    const productPath = `/listings/2021-08-01/items/${this.sellerId}`;
    const productParams = new URLSearchParams({
      marketplaceIds: this.marketplaceId,
    }).toString();
    const productHeaders = await this.authService.createSignedHeaders('GET', productPath, productParams);
    const productResponse: AxiosResponse = await axios.get(
      `${this.endpoint}${productPath}?${productParams}`,
      { headers: productHeaders }
    );
    const totalProducts = productResponse.data.numberOfResults || 0;

    return {
      totalOrders: allOrders.length,
      totalProducts,
      ordersThisMonth,
      ordersThisWeek,
      ordersToday
    };

  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error?.response?.data || error.message);
    throw new Error(
      `Failed to fetch dashboard stats: ${error?.response?.data?.errors?.[0]?.message || error.message}`
    );
  }
}

private async fetchOrdersFromDate(fromDate: Date): Promise<any[]> {
  const allOrders: any[] = [];
  const ordersPath = `/orders/v0/orders`;
  const createdAfter = fromDate.toISOString();
  let ordersQueryParams = `MarketplaceIds=${this.marketplaceId}&CreatedAfter=${createdAfter}&MaxResultsPerPage=100`;
  let ordersNextToken: string | undefined = undefined;

  try {
    do {
      const ordersHeaders = await this.authService.createSignedHeaders('GET', ordersPath, ordersQueryParams);
      const ordersUrl = ordersNextToken
        ? `${this.endpoint}${ordersPath}?NextToken=${encodeURIComponent(ordersNextToken)}`
        : `${this.endpoint}${ordersPath}?${ordersQueryParams}`;
      
      const ordersResponse: AxiosResponse = await axios.get(ordersUrl, { headers: ordersHeaders });
      
      // Use the correct response structure from your working method
      if (ordersResponse.data.payload?.Orders) {
        allOrders.push(...ordersResponse.data.payload.Orders);
      }
      
      ordersNextToken = ordersResponse.data.payload?.NextToken;
      ordersQueryParams = '';
    } while (ordersNextToken);

    return allOrders;

  } catch (error: any) {
    console.error(`Error fetching orders from ${createdAfter}:`, error?.response?.data || error.message);
    return [];
  }
}


  async getListingsItems(nextToken?: string): Promise<any> {
    try {
      const path = `/listings/2021-08-01/items/${this.sellerId}`;
      const params = new URLSearchParams({
        marketplaceIds: this.marketplaceId,
        includedData: 'summaries,attributes,issues,offers,fulfillmentAvailability,procurement',
      });
      if (nextToken) {
        params.append('nextToken', nextToken);
      }
      const queryParams = params.toString();
      console.log(queryParams);
      const headers = await this.authService.createSignedHeaders('GET', path, queryParams);
      const response: AxiosResponse = await axios.get(`${this.endpoint}${path}?${queryParams}`, { headers });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching listings from Amazon:', error?.response?.data || error.message);
      throw new Error(`Failed to fetch listings: ${error?.response?.data?.errors?.[0]?.message || error.message}`);
    }
  }

  async getProductByASIN(asin: string): Promise<any> {
    try {
      const path = `/catalog/2022-04-01/items/${encodeURIComponent(asin)}`;
      const queryParams = `marketplaceIds=${this.marketplaceId}&includedData=attributes,identifiers,images,summaries`;
      const headers = await this.authService.createSignedHeaders('GET', path, queryParams);
      const response: AxiosResponse = await axios.get(`${this.endpoint}${path}?${queryParams}`, { headers });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching product by ASIN:', error.response?.data || error.message);
      throw new Error(`Failed to fetch product by ASIN: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  }

  async getSingleProduct(sku: string): Promise<any> {
    try {
      const path = `/listings/2021-08-01/items/${this.sellerId}/${encodeURIComponent(sku)}`;
      const queryParams = `marketplaceIds=${this.marketplaceId}&includedData=summaries,attributes,issues,offers,fulfillmentAvailability,procurement`;
      const headers = await this.authService.createSignedHeaders('GET', path, queryParams);
      const response: AxiosResponse = await axios.get(`${this.endpoint}${path}?${queryParams}`, { headers });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching product:', {
        sku,
        error: error.response?.data || error.message,
        status: error.response?.status,
      });
      throw new Error(`Failed to fetch product: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  }

  async updateProduct(sku: string, attributes: any): Promise<any> {
    try {
      const path = `/listings/2021-08-01/items/${this.sellerId}/${encodeURIComponent(sku)}`;
      const queryParams = `marketplaceIds=${this.marketplaceId}`;
      const headers = await this.authService.createSignedHeaders('PATCH', path, queryParams);
      const response: AxiosResponse = await axios.patch(`${this.endpoint}${path}?${queryParams}`, attributes, { headers });
      return response.data;
    } catch (error: any) {
      console.error('Error updating product:', error.response?.data || error.message);
      throw new Error(`Failed to update product: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  }

 //orders 
  async getOrderItems(limit: number = 20): Promise<any> {
    try {
      const createdAfter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const path = `/orders/v0/orders`;
      const queryParams = `MarketplaceIds=${this.marketplaceId}&CreatedAfter=${createdAfter}&MaxResultsPerPage=${limit}`;
      const headers = await this.authService.createSignedHeaders('GET', path, queryParams);
      const response: AxiosResponse = await axios.get(`${this.endpoint}${path}?${queryParams}`, { headers });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching orders:', error.response?.data || error.message);
      throw new Error(`Failed to fetch orders: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  }
}