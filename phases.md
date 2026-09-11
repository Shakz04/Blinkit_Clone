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
- Seed useful demo categories and products.

## Phase 3: Cart

- Create or reuse cart by `sessionId`.
- Add products to cart.
- Increase and decrease item quantities.
- Remove products from cart.
- Clear cart after successful order.
- Keep cart totals accurate in the UI.

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
- Add order tracking status display.
- Prepare status values for future real-time updates.

## Phase 7: Seller Dashboard

- Let sellers add new products.
- Show seller-owned products.
- Present seller-owned products in a searchable inventory table.
- Keep the add-product form in a dedicated left-side panel on desktop.
- Validate required product fields.
- Keep non-sellers out of seller routes.
- Future: edit, delete, stock controls, and seller analytics.

## Phase 8: Hardening

- Add unit and integration tests.
- Improve server validation and production-safe error handling.
- Add environment-specific frontend API base URL.
- Add loading, empty, and failure states across pages.
- Audit accessibility, responsive layout, and keyboard navigation.
- Prepare deployment instructions for frontend, backend, database, and payment keys.
