# AI Context

## Project Snapshot

BLinkit is a MERN stack multi-seller quick-commerce grocery app. It has a React/Vite frontend in `client` and an Express/Mongoose backend in `server`. The app supports seller storefronts, rich products, catalog filters, account-backed carts and orders, saved addresses, checkout, reviews, per-seller delivery tracking, coupons, authentication, Razorpay APIs, and seller inventory/order management.

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

Optional FreshDash seller setup variables:

```text
FRESHDASH_SELLER_EMAIL=freshdash.operations@local.invalid
FRESHDASH_SELLER_PASSWORD=choose_a_strong_private_password
```

Razorpay keys are optional for browsing and cart development, but required for the real payment flow.

## Main Files

- `client/src/App.jsx`: Frontend route map.
- `client/src/api.js`: API helper.
- `client/src/context/AuthContext.jsx`: Auth state.
- `client/src/context/CartContext.jsx`: Cart state.
- `client/src/pages/Home.jsx`: Product discovery.
- `client/src/pages/ProductDetails.jsx`: Product gallery, options, details, cart actions, and reviews.
- `client/src/pages/Profile.jsx`: Customer details and saved addresses.
- `client/src/pages/Cart.jsx`: Cart management.
- `client/src/pages/Checkout.jsx`: Checkout and payment.
- `client/src/pages/SellerDashboard.jsx`: Seller storefront, product, inventory, and order management.
- `server/app.js`: Express app, route wiring, and shared error handling.
- `server/index.js`: MongoDB startup and HTTP listener.
- `server/middleware/auth.js`: Auth and seller authorization middleware.
- `server/routes/auth.js`: Register, login, current user.
- `server/routes/products.js`: Catalog and seller product APIs.
- `server/routes/cart.js`: Cart APIs.
- `server/routes/coupons.js`: Coupon APIs.
- `server/routes/orders.js`: Order APIs.
- `server/routes/payment.js`: Razorpay APIs.
- `server/routes/sellers.js`: Seller storefront profile APIs.
- `server/models/Review.js`: Customer product reviews.
- `server/test/commerce.test.js`: Isolated commerce integration tests.

## Important Behaviors

- Product filtering supports category, search, brand, price, availability, rating, and discount; sort and pagination are server-backed. Advanced filter/sort controls appear only when a non-empty search is active, while category browsing stays available on the default homepage.
- Product prices can come from a base product or a selected variant. Checkout always reloads product prices and stock from MongoDB.
- Guest carts/orders use a session ID. Authenticated carts/orders use the user account and follow the customer across devices. Guest data is claimed once after login.
- Direct COD orders are created through `/api/orders`; checkout keys make retries idempotent and stock reservations prevent overselling.
- Direct orders use a generated `direct_*` order reference so they do not collide with the unique Razorpay order index.
- Razorpay payment flow uses `/api/payment/create-order` and `/api/payment/verify`.
- Seller APIs require JWT auth and the `seller` role, and product/order mutations verify ownership.
- `npm run setup-freshdash` idempotently creates the built-in FreshDash seller when needed, claims ownerless products, and attaches legacy FreshDash order items and fulfillment records to it.
- `npm run reset-freshdash-password` resets that operations account using the configured password or a generated temporary password.
- Orders contain one fulfillment per seller, with confirmed, preparing, out-for-delivery, and delivered stages.
- Reviews require login; verified-purchase status is derived from delivered orders on the server.
- Customer UI uses a FreshDash-style dark green header, hero image, responsive Shop by Category row, category rail, search-only filter/sort panel, and compact product cards.
- Seller UI uses tabs for products/inventory, customer orders, and seller name/logo settings.

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
