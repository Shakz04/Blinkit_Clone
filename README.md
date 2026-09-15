# Blinkit Clone - MERN Stack

A quick commerce (grocery delivery) clone with cart functionality, built with MongoDB, Express, React, and Node.js.

## Features

- **Register & Login** as User or Seller
- **Product listing** with categories (Vegetables, Fruits, Dairy, Groceries, etc.)
- **Seller storefronts** with clickable seller names, logos, descriptions, and seller-owned catalogs
- **Product pages** with galleries, pack-size options, stock, ingredients, nutrition, ratings, and reviews
- **Search, filters, sorting, and pagination** across the catalog, with advanced controls shown only for active search results
- **Add to cart** with quantity controls (+/−)
- **Account-backed cart and orders** that follow signed-in customers across devices
- **Customer profiles and saved addresses**
- **Cart page** with order summary and item management
- **Checkout** with delivery address form and Razorpay payment
- **Seller Dashboard** – manage storefront identity, products, stock, variants, customer orders, and delivery stages
- **Order tracking** – real seller-managed progress, ETA, and delivery-partner information per seller
- **Order success** page after payment
- **Blinkit-inspired UI** with green theme and clean layout

## Prerequisites

- Node.js 18+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

## Setup

### 1. Install dependencies

```bash
npm run install-all
```

Or manually:

```bash
npm install
cd client && npm install
cd ../server && npm install
```

### 2. Configure environment

Copy the server env example and edit if needed:

```bash
cd server
copy .env.example .env
```

Edit `server/.env` and set your MongoDB URI and Razorpay keys:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/blinkit

# Get from https://dashboard.razorpay.com (use Test mode keys for development)
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```

### 3. Seed the database

```bash
cd server
npm run seed
```

To assign existing ownerless FreshDash products and orders without reseeding or deleting data:

```bash
cd server
npm run setup-freshdash
```

The command creates a seller account for FreshDash when needed, prints a generated temporary password, and can be run repeatedly without duplicating assignments. Configure `FRESHDASH_SELLER_EMAIL` and `FRESHDASH_SELLER_PASSWORD` in `server/.env` when fixed credentials are preferred. Use `npm run reset-freshdash-password` to generate or apply a new password.

### 4. Run the app

From the project root:

```bash
npm run dev
```

This starts both:
- **Backend** at http://localhost:5000
- **Frontend** at http://localhost:5173

## Project Structure

```
BLinkit/
├── client/          # React (Vite) frontend
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       └── api.js
├── server/          # Express backend
│   ├── models/
│   ├── routes/
│   ├── index.js
│   └── seed.js
└── package.json
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register (body: name, email, password, role) |
| POST | /api/auth/login | Login (body: email, password) |
| GET | /api/auth/me | Get current user (Bearer token) |
| GET | /api/products | Get products (search/filter/sort/pagination query parameters) |
| POST | /api/products | Add product (seller, Bearer token) |
| GET | /api/products/:id | Get product details |
| PUT | /api/products/:id | Edit owned product (seller) |
| DELETE | /api/products/:id | Archive owned product (seller) |
| GET/POST | /api/products/:id/reviews | Read or save product reviews |
| GET | /api/products/seller/mine | Get seller's products (Bearer token) |
| GET | /api/products/categories | Get categories |
| GET | /api/sellers/:id | Get public seller storefront profile |
| PUT | /api/sellers/me | Update seller name, logo, and description |
| PUT | /api/auth/me | Update customer profile |
| POST/PUT/DELETE | /api/auth/addresses/:id? | Manage saved addresses |
| GET | /api/cart/:sessionId | Get cart |
| POST | /api/cart/:sessionId/items | Add to cart |
| PUT | /api/cart/:sessionId/items/:productId | Update quantity |
| DELETE | /api/cart/:sessionId/items/:productId | Remove item |
| DELETE | /api/cart/:sessionId | Clear cart |
| POST | /api/cart/merge | Move guest cart/order data into a signed-in account |
| GET | /api/orders/seller/mine | Get orders containing the seller's products |
| PUT | /api/orders/:id/fulfillment | Advance an owned fulfillment and update delivery details |
| POST | /api/payment/create-order | Create Razorpay order |
| POST | /api/payment/verify | Verify payment |
