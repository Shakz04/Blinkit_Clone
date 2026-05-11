# Blinkit Clone - MERN Stack

A quick commerce (grocery delivery) clone with cart functionality, built with MongoDB, Express, React, and Node.js.

## Features

- **Register & Login** as User or Seller
- **Product listing** with categories (Vegetables, Fruits, Dairy, Groceries, etc.)
- **Search** products by name
- **Add to cart** with quantity controls (+/−)
- **Cart page** with order summary and item management
- **Checkout** with delivery address form and Razorpay payment
- **Seller Dashboard** – add products (sellers only)
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
| GET | /api/products | Get all products (query: category, search) |
| POST | /api/products | Add product (seller, Bearer token) |
| GET | /api/products/seller/mine | Get seller's products (Bearer token) |
| GET | /api/products/categories | Get categories |
| GET | /api/cart/:sessionId | Get cart |
| POST | /api/cart/:sessionId/items | Add to cart |
| PUT | /api/cart/:sessionId/items/:productId | Update quantity |
| DELETE | /api/cart/:sessionId/items/:productId | Remove item |
| DELETE | /api/cart/:sessionId | Clear cart |
| POST | /api/payment/create-order | Create Razorpay order |
| POST | /api/payment/verify | Verify payment |
