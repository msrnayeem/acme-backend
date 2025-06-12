# Acme Electronics API Documentation

## Table of Contents
1. [Setup](#setup)
2. [Authentication](#authentication)
3. [Users](#users)
4. [Products](#products)
5. [Categories](#categories)
6. [Reviews](#reviews)
7. [Cart](#cart)

## Setup
```bash
# Clone the repository
git clone https://github.com/logic-matrix/acme-ecommerce-api.git

# Install dependencies
cd acme-ecommerce-api/backend
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your database credentials and JWT secret

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

## Authentication
### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
    "email": "john@example.com",
    "password": "password123"
}
```

## Users
### Get User Profile
```http
GET /api/users/profile
Authorization: Bearer {token}
```

### Update User
```http
PUT /api/users/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
    "name": "Updated Name",
    "email": "updated@example.com"
}
```

## Products
### List Products
```http
GET /api/products?page=1&limit=10
```

### Create Product
```http
POST /api/products
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
    "name": "Product Name",
    "price": 99.99,
    "stock": 100,
    "categoryId": 1,
    "description": "Product description",
    "image": [file]
}
```

## Categories
### List Categories
```http
GET /api/categories
```

### Create Category
```http
POST /api/categories
Authorization: Bearer {token}
Content-Type: application/json

{
    "name": "Electronics"
}
```

## Reviews
### Get Product Reviews
```http
GET /api/reviews/product/{productId}
```

### Create Review
```http
POST /api/reviews
Authorization: Bearer {token}
Content-Type: application/json

{
    "productId": 1,
    "rating": 5,
    "comment": "Great product!"
}
```

## Cart
### View Cart
```http
GET /api/cart
Authorization: Bearer {token}
```

### Add to Cart
```http
POST /api/cart
Authorization: Bearer {token}
Content-Type: application/json

{
    "productId": 1,
    "quantity": 2
}
```

## Response Formats

### Success Response
```json
{
    "success": true,
    "data": {
        // Response data
    }
}
```

### Error Response
```json
{
    "success": false,
    "message": "Error description"
}
```

## Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Dependencies
- Node.js
- Express
- Prisma
- PostgreSQL
- TypeScript
- JWT for authentication
- Multer for file uploads

## Project Structure
```
backend/
├── controllers/   # Request handlers
├── models/        # Database operations
├── routes/        # API routes
├── middlewares/   # Custom middlewares
├── prisma/        # Database schema
└── index.ts       # Entry point
```