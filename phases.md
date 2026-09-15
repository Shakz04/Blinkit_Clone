# Production Phases

## Phase 0: Project Baseline

- Confirm local setup works.
- Install root, client, and server dependencies.
- Configure `server/.env`.
- Seed MongoDB with sample products.
- Verify frontend and backend run together with `npm run dev`.

## Phase 1: Authentication

- Register users as `user` or `seller`.
- Log in users with JWT token creation.
- Load current user with `/api/auth/me`.
- Protect authenticated frontend routes.
- Enforce seller role for seller-only pages and APIs.

## Phase 2: Product Catalog

- Display in-stock products on the home page.
- Support search by product name and description.
- Support filtering by product category.
- Apply Stitch-inspired shopping UI: sticky dark green header, visual category showcase, desktop category rail, and compact product grid.
- Show product details: name, image, unit, price, original price, discount, stock.
- Provide product pages with galleries, pack-size variants, descriptions, ingredients, nutrition, seller links, and reviews.
- Filter by brand, price, availability, rating, and discount; sort and paginate active search results while keeping the default homepage category-first.
- Seed useful demo categories and products.

## Phase 3: Cart

- Create or reuse cart by `sessionId`.
- Add products to cart.
- Increase and decrease item quantities.
- Remove products from cart.
- Clear cart after successful order.
- Keep cart totals accurate in the UI.
- Keep signed-in carts with customer accounts across devices and merge guest carts once after login.

## Phase 4: Coupons and Pricing

- Validate coupons against cart/order data.
- Show discount feedback in the cart or checkout flow.
- Apply discount to order summary.
- Handle invalid, expired, or ineligible coupon states clearly.

## Phase 5: Checkout and Payment

- Capture delivery address.
- Create Razorpay order when payment keys are configured.
- Verify Razorpay payment signature on the server.
- Create/update order records with payment status.
- Provide a development fallback direct order path.
- Route users to order success after completion.

## Phase 6: Orders and Tracking

- Store placed orders with session, items, total, address, and status.
- Show order history by session.
- Track each seller's fulfillment through confirmed, preparing, out for delivery, and delivered.
- Let sellers provide an ETA and delivery-partner details and show the stored timeline to customers.

## Phase 7: Seller Dashboard

- Let sellers add new products.
- Show seller-owned products.
- Present seller-owned products in a searchable inventory table.
- Keep the add-product form in a dedicated left-side panel on desktop.
- Validate required product fields.
- Keep non-sellers out of seller routes.
- Let sellers configure a public name, logo, description, and storefront.
- Let sellers edit/archive products and manage base or variant stock.
- Let sellers view their part of multi-seller orders and advance delivery progress.
- Show product, active-order, delivered-value, and low-stock summaries.

## Phase 7A: Customer Accounts and Reviews

- Let customers update their personal details and manage up to 10 saved addresses.
- Associate carts and order history with authenticated accounts.
- Let signed-in customers create or update one review per product, including optional photos.
- Derive verified-purchase labels from delivered orders and maintain product rating summaries.

## Phase 8: Hardening

- Add unit and integration tests.
- Improve server validation and production-safe error handling.
- Add environment-specific frontend API base URL.
- Add loading, empty, and failure states across pages.
- Audit accessibility, responsive layout, and keyboard navigation.
- Prepare deployment instructions for frontend, backend, database, and payment keys.
