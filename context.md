# AI Context

## Project Snapshot

BLinkit is a MERN stack quick-commerce grocery app. It has a React/Vite frontend in `client` and an Express/Mongoose backend in `server`. The app supports shopping, cart management, checkout, orders, coupons, authentication, Razorpay payments, and seller product creation. Current UI direction is based on user-provided Google Stitch references and the Velocity Green token set.

## Run Commands

```bash
npm run install-all
npm run dev
```

Frontend:

```bash
cd client
npm run dev
npm run build
npm run lint
```

Backend:

```bash
cd server
npm run dev
npm start
npm run seed
```

## Environment

Expected backend environment variables:

```text
PORT=5000
MONGODB_URI=mongodb://localhost:27017/blinkit
JWT_SECRET=replace_in_production
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```

Razorpay keys are optional for browsing and cart development, but required for the real payment flow.

## Main Files

- `client/src/App.jsx`: Frontend route map.
- `client/src/api.js`: API helper.
- `client/src/context/AuthContext.jsx`: Auth state.
- `client/src/context/CartContext.jsx`: Cart state.
- `client/src/pages/Home.jsx`: Product discovery.
- `client/src/pages/Cart.jsx`: Cart management.
- `client/src/pages/Checkout.jsx`: Checkout and payment.
- `client/src/pages/SellerDashboard.jsx`: Seller product creation.
- `server/index.js`: Express app and MongoDB startup.
- `server/middleware/auth.js`: Auth and seller authorization middleware.
- `server/routes/auth.js`: Register, login, current user.
- `server/routes/products.js`: Catalog and seller product APIs.
- `server/routes/cart.js`: Cart APIs.
- `server/routes/coupons.js`: Coupon APIs.
- `server/routes/orders.js`: Order APIs.
- `server/routes/payment.js`: Razorpay APIs.

## Important Behaviors

- Products list defaults to `inStock: true`.
- Product filtering supports `category` and `search` query parameters.
- Cart APIs are keyed by `sessionId`.
- Orders can be created directly through `/api/orders` for development.
- Direct orders use a generated `direct_*` order reference so they do not collide with the unique Razorpay order index.
- Razorpay payment flow uses `/api/payment/create-order` and `/api/payment/verify`.
- Seller APIs require JWT auth and `seller` role.
- Customer UI uses a FreshDash-style dark green header, hero image, visual categories, category rail, and compact product cards.
- Seller UI uses a two-column portal with add-product form and searchable inventory table.

## AI Instructions For Future Sessions

- Read `memory.md` first.
- Read this `context.md` second.
- Read `rules.md` before making code changes.
- Update `memory.md` after every prompt.
- Update `context.md` when project structure, commands, environment, or core behavior changes.
- Keep changes aligned with existing React, Express, Mongoose, and plain CSS patterns.
- Keep frontend changes aligned with `design.md` and the Stitch reference direction.
- Preserve user edits and avoid unrelated refactors.

## Current Assumptions

- The app is intended as a learning/demo quick-commerce clone, not yet production-hardened.
- MongoDB is the source of truth for products, carts, users, coupons, and orders.
- Frontend styling should continue with CSS modules/files already present, not a new UI library.
- Payment status must be verified server-side before being trusted.
- If Atlas DNS fails locally, run the backend with `MONGODB_URI=mongodb://localhost:27017/blinkit` while local MongoDB is running.
