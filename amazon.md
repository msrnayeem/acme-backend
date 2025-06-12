# Amazon Seller API Integration Guide for Private Single-Seller Application

## Table of Contents
1. [Set Up Seller Central Developer Account](#1-set-up-seller-central-developer-account)
2. [Configure IAM Permissions](#2-configure-iam-permissions)
3. [Set Up Environment Variables](#3-set-up-environment-variables)
4. [Implement Authentication Service](#4-implement-authentication-service)
5. [Key API Endpoints Implementation](#5-key-api-endpoints-implementation)
   - [Product Management](#product-management)
   - [Order Management](#order-management)
6. [Postman Examples](#6-postman-examples)
7. [Best Practices & Improvements](#7-best-practices--improvements)
8. [Additional Resources](#8-additional-resources)

## 1. Set Up Seller Central Developer Account

1. Log in to your Seller Central account
2. Go to Apps & Services > Develop Apps
3. Click "Create new app"
4. Fill in app details (name, description)
5. Set application type as "Web Application"
6. For a private application, use a placeholder URL (e.g., http://localhost) - no actual OAuth redirect is needed
7. Select required API scopes:
   - Listings
   - Orders
   - Reports
   - Notifications
   - Fulfillment
8. Submit the application for review
9. Once approved, generate and securely store your refresh token from the Seller Central developer console

## 2. Configure IAM Permissions

1. Create an IAM user in AWS Console
2. Attach "SellingPartnerAPIAuth" policy
3. Generate access key and secret key
4. Store keys securely in environment variables

## 3. Set Up Environment Variables

```bash
# Amazon Seller API credentials
SPAPI_CLIENT_ID=your_client_id
SPAPI_CLIENT_SECRET=your_client_secret
SPAPI_REFRESH_TOKEN=your_refresh_token
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
SPAPI_REGION=us-east-1
SPAPI_SELLER_ID=your_seller_id
SPAPI_MARKETPLACE_ID=your_marketplace_id
```

## 4. Implement Authentication Service

```typescript
// amazonAuthService.ts
import axios from "axios";
import { createHash } from "crypto";

export async function getAccessToken(): Promise<string> {
  try {
    const clientId = process.env.SPAPI_CLIENT_ID!;
    const clientSecret = process.env.SPAPI_CLIENT_SECRET!;
    const refreshToken = process.env.SPAPI_REFRESH_TOKEN!;
    
    if (!clientId || !clientSecret || !refreshToken) {
      throw new Error("Missing authentication credentials");
    }
    
    const response = await axios.post("https://api.amazon.com/auth/o2/token", {
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    });
    
    return response.data.access_token!;
  } catch (error) {
    console.error("Error getting access token:", error.message);
    throw new Error("Failed to authenticate with Amazon API");
  }
}
```

## 5. Key API Endpoints Implementation

### Product Management

#### Create a Product

```typescript
// amazonService.ts
import aws4 from 'aws4';
import axios from 'axios';
import { getAccessToken } from './amazonAuthService';

export async function createProduct(productData) {
  try {
    const accessToken = await getAccessToken();
    const host = "sellingpartnerapi-na.amazon.com";
    
    const path = `/listings/2021-08-01/items/${process.env.SPAPI_SELLER_ID!}`;
    const url = new URL(`https://${host}${path}`);
    
    const opts = {
      host,
      path: url.pathname,
      service: "execute-api",
      region: process.env.SPAPI_REGION!,
      method: "POST",
      headers: {
        "x-amz-access-token": accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(productData),
    };
    
    aws4.sign(opts, {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    });
    
    const response = await axios.post(url.toString(), productData, {
      headers: opts.headers,
    });
    
    return response.data!;
  } catch (error) {
    console.error("Error creating product:", error.message);
    if (axios.isAxiosError(error) && error.response) {
      console.error("API error details:", error.response.data);
      throw new Error(`Amazon API error (${error.response.status}): ${JSON.stringify(error.response.data)}`);
    }
    throw new Error(`Failed to create product: ${error.message}`);
  }
}
```

#### Get Product Listing

```typescript
// amazonService.ts
import aws4 from 'aws4';
import axios from 'axios';
import { getAccessToken } from './amazonAuthService';

export async function getListingItem(sku: string) {
  try {
    const accessToken = await getAccessToken();
    const host = "sellingpartnerapi-na.amazon.com";
    
    const path = `/listings/2021-08-01/items/${process.env.SPAPI_SELLER_ID!}/${sku}`;
    const url = new URL(`https://${host}${path}`);
    url.searchParams.append('marketplaceIds', process.env.SPAPI_MARKETPLACE_ID!);
    
    const opts = {
      host,
      path: url.pathname + url.search,
      service: "execute-api",
      region: process.env.SPAPI_REGION!,
      method: "GET",
      headers: {
        "x-amz-access-token": accessToken,
      },
    };
    
    aws4.sign(opts, {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    });
    
    const response = await axios.get(url.toString(), {
      headers: opts.headers,
    });
    
    return response.data!;
  } catch (error) {
    console.error(`Error getting listing for SKU ${sku}:`, error.message);
    if (axios.isAxiosError(error) && error.response) {
      console.error("API error details:", error.response.data);
      throw new Error(`Amazon API error (${error.response.status}): ${JSON.stringify(error.response.data)}`);
    }
    throw new Error(`Failed to get product listing: ${error.message}`);
  }
}
```

#### Update Product Listing

```typescript
// amazonService.ts
import aws4 from 'aws4';
import axios from 'axios';
import { getAccessToken } from './amazonAuthService';

export async function patchListingItem(sku: string, patches: any[]) {
  try {
    const accessToken = await getAccessToken();
    const host = "sellingpartnerapi-na.amazon.com";
    
    const path = `/listings/2021-08-01/items/${process.env.SPAPI_SELLER_ID!}/${sku}`;
    const url = new URL(`https://${host}${path}`);
    url.searchParams.append('marketplaceIds', process.env.SPAPI_MARKETPLACE_ID!);
    
    const opts = {
      host,
      path: url.pathname + url.search,
      service: "execute-api",
      region: process.env.SPAPI_REGION!,
      method: "PATCH",
      headers: {
        "x-amz-access-token": accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(patches),
    };
    
    aws4.sign(opts, {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    });
    
    const response = await axios.patch(
      url.toString(),
      JSON.parse(opts.body),
      {
        headers: opts.headers,
      }
    );
    
    return response.data!;
  } catch (error) {
    console.error(`Error updating listing for SKU ${sku}:`, error.message);
    if (axios.isAxiosError(error) && error.response) {
      console.error("API error details:", error.response.data);
      throw new Error(`Amazon API error (${error.response.status}): ${JSON.stringify(error.response.data)}`);
    }
    throw new Error(`Failed to update product listing: ${error.message}`);
  }
}
```

### Order Management

#### Get Orders

```typescript
// amazonService.ts
import aws4 from 'aws4';
import axios from 'axios';
import { getAccessToken } from './amazonAuthService';

export async function getOrders(params = {}) {
  try {
    const accessToken = await getAccessToken();
    const host = "sellingpartnerapi-na.amazon.com";
    
    // Default to orders created in the last 30 days if no date specified
    const defaultParams = {
      MarketplaceIds: process.env.SPAPI_MARKETPLACE_ID!,
      CreatedAfter: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
    
    const queryParams = { ...defaultParams, ...params };
    const queryString = new URLSearchParams(queryParams).toString();
    
    const path = `/orders/v0/orders?${queryString}`;
    const url = new URL(`https://${host}${path}`);
    
    const opts = {
      host,
      path: url.pathname + url.search,
      service: "execute-api",
      region: process.env.SPAPI_REGION!,
      method: "GET",
      headers: {
        "x-amz-access-token": accessToken,
      },
    };
    
    aws4.sign(opts, {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    });
    
    const response = await axios.get(url.toString(), {
      headers: opts.headers,
    });
    
    return response.data!;
  } catch (error) {
    console.error("Error getting orders:", error.message);
    if (axios.isAxiosError(error) && error.response) {
      console.error("API error details:", error.response.data);
      throw new Error(`Amazon API error (${error.response.status}): ${JSON.stringify(error.response.data)}`);
    }
    throw new Error(`Failed to get orders: ${error.message}`);
  }
}
```

#### Get Order Details

```typescript
// amazonService.ts
import aws4 from 'aws4';
import axios from 'axios';
import { getAccessToken } from './amazonAuthService';

export async function getOrderDetails(orderId) {
  try {
    const accessToken = await getAccessToken();
    const host = "sellingpartnerapi-na.amazon.com";
    
    const path = `/orders/v0/orders/${orderId}`;
    const url = new URL(`https://${host}${path}`);
    
    const opts = {
      host,
      path: url.pathname,
      service: "execute-api",
      region: process.env.SPAPI_REGION!,
      method: "GET",
      headers: {
        "x-amz-access-token": accessToken,
      },
    };
    
    aws4.sign(opts, {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    });
    
    const response = await axios.get(url.toString(), {
      headers: opts.headers,
    });
    
    return response.data!;
  } catch (error) {
    console.error(`Error getting details for order ${orderId}:`, error.message);
    if (axios.isAxiosError(error) && error.response) {
      console.error("API error details:", error.response.data);
      throw new Error(`Amazon API error (${error.response.status}): ${JSON.stringify(error.response.data)}`);
    }
    throw new Error(`Failed to get order details: ${error.message}`);
  }
}
```

#### Update Order Status

```typescript
// amazonService.ts
import aws4 from 'aws4';
import axios from 'axios';
import { getAccessToken } from './amazonAuthService';

export async function updateOrderStatus(orderId, status) {
  try {
    const accessToken = await getAccessToken();
    const host = "sellingpartnerapi-na.amazon.com";
    
    const path = `/orders/v0/orders/${orderId}/orderItems`;
    const url = new URL(`https://${host}${path}`);
    
    const opts = {
      host,
      path: url.pathname,
      service: "execute-api",
      region: process.env.SPAPI_REGION!,
      method: "PATCH",
      headers: {
        "x-amz-access-token": accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderItems: [
          {
            orderItemId: "all",
            status: status,
          },
        ],
      }),
    };
    
    aws4.sign(opts, {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    });
    
    const response = await axios.patch(
      url.toString(),
      JSON.parse(opts.body),
      {
        headers: opts.headers,
      }
    );
    
    return response.data!;
  } catch (error) {
    console.error(`Error updating status for order ${orderId}:`, error.message);
    if (axios.isAxiosError(error) && error.response) {
      console.error("API error details:", error.response.data);
      throw new Error(`Amazon API error (${error.response.status}): ${JSON.stringify(error.response.data)}`);
    }
    throw new Error(`Failed to update order status: ${error.message}`);
  }
}
```

## 6. Postman Examples

### Authentication

```markdown
POST https://api.amazon.com/auth/o2/token
Content-Type: application/x-www-form-urlencoded

grant_type=refresh_token&
refresh_token={{refresh_token}}&
client_id={{client_id}}&
client_secret={{client_secret}}
```

### Products

#### Create Product

```markdown
POST https://sellingpartnerapi-na.amazon.com/listings/2021-08-01/items/{{seller_id}}
x-amz-access-token: {{access_token}}
Content-Type: application/json

{
  "productType": "PRODUCT",
  "requirements": "LISTING",
  "attributes": {
    "title": "Example Product",
    "brand": "Your Brand",
    "manufacturer": "Your Company",
    "recommended_browse_nodes": [1234567890],
    "bullet_point": ["Feature 1", "Feature 2"],
    "generic_keyword": ["keyword1", "keyword2"],
    "standard_price": {
      "value": 19.99,
      "currency": "USD"
    }
  }
}
```

#### Get Product Listing

```markdown
GET https://sellingpartnerapi-na.amazon.com/listings/2021-08-01/items/{{seller_id}}/{{sku}}?marketplaceIds={{marketplace_id}}
x-amz-access-token: {{access_token}}
```

#### Update Product Listing

```markdown
PATCH https://sellingpartnerapi-na.amazon.com/listings/2021-08-01/items/{{seller_id}}/{{sku}}?marketplaceIds={{marketplace_id}}
x-amz-access-token: {{access_token}}
Content-Type: application/json

[
  {
    "op": "replace",
    "path": "/attributes/title",
    "value": "Updated Product Title"
  },
  {
    "op": "replace",
    "path": "/attributes/standard_price",
    "value": {
      "value": 24.99,
      "currency": "USD"
    }
  }
]
```

### Orders

#### Get Orders List

```markdown
GET https://sellingpartnerapi-na.amazon.com/orders/v0/orders?MarketplaceIds={{marketplace_id}}&CreatedAfter=2023-01-01T00:00:00Z
x-amz-access-token: {{access_token}}
```

#### Get Order Details

```markdown
GET https://sellingpartnerapi-na.amazon.com/orders/v0/orders/{{order_id}}
x-amz-access-token: {{access_token}}
```

#### Update Order Status

```markdown
PATCH https://sellingpartnerapi-na.amazon.com/orders/v0/orders/{{order_id}}/orderItems
x-amz-access-token: {{access_token}}
Content-Type: application/json

{
  "orderItems": [
    {
      "orderItemId": "all",
      "status": "Shipped"
    }
  ]
}
```