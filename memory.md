# Memory

## Purpose

This file records what has been created, what is currently being worked on, and important updates after each prompt. Update it whenever project direction, implementation state, or AI working context changes.

## Created Files

- `PRD.md`: Product requirements, target users, features, success metrics.
- `Architecture.md`: App flow, folder/file structure, tech stack, module responsibilities.
- `rules.md`: Development rules, AI boundaries, security, error handling, quality rules.
- `phases.md`: Production phases from setup through hardening.
- `design.md`: Frontend visual direction, colors, typography, layout, components.
- `memory.md`: Running project memory and prompt-by-prompt update log.
- `context.md`: Compact project context for future AI sessions.

## Current Work

- Current prompt: Restore Shop by Category on the homepage and show sorting/filtering only after a product search.
- Current status: Implementation and automated/browser verification complete; the project remains running locally.

## Update Log

### 2026-09-15 (Homepage Categories and Search Tools)

- Restored a responsive Shop by Category image row on the normal homepage, with active-category styling and a See all action.
- Kept the category rail available for direct browsing while removing the advanced filter/sort panel from the unsearched homepage and category views.
- Made brand, price, availability, rating, discount, and sorting controls appear only after a shopper submits a non-empty product search.
- Starting a new search clears stale category/filter state; clearing the search returns to the normal category-first homepage.
- Confirmed Bakery category browsing, a `biscuits` search, and Price: low to high selection in the running browser.
- Verified frontend lint, production build, and all 14 backend commerce integration tests pass.

### 2026-09-15 (FreshDash Operations)

- Added an idempotent `npm run setup-freshdash` command and reusable provisioning service.
- Added a dedicated FreshDash operations seller account without storing its password in repository files.
- Assigned 20 existing ownerless products and migrated 7 existing order/tracking records in the configured database.
- Verified the FreshDash seller can log in, owns all 20 products, sees all 7 migrated orders, and can see order `6aa92bc3f9c52e095ae178d4` at Confirmed in Manage Orders.
- Updated seeding so future seeded products are assigned to the FreshDash seller automatically.
- Added `npm run reset-freshdash-password` for controlled credential recovery.
- Added integration coverage proving ownerless products and existing tracking records are claimed idempotently; all 14 integration checks pass.
- Replaced the credential-like database value in `.env.example` with a safe local placeholder and documented optional FreshDash seller environment variables.

### 2026-09-15 (Runtime)

- Started the project with `npm run dev`.
- Frontend is running at `http://localhost:5173/` and backend at `http://localhost:5000`.
- Confirmed HTTP 200 responses from the frontend, backend health endpoint, Vite API proxy, and product catalog endpoint.
- Removed a duplicate frontend process on port 5174, leaving one clean development instance.

### 2026-09-15

- Added seller storefront profiles with a seller/store name, logo, description, and public seller page.
- Added clickable seller identity to each product card, product page, cart item, and delivery fulfillment.
- Added product detail pages with image galleries, variants, stock status, ingredients, nutrition, and cart controls.
- Added catalog filtering by brand, price, stock, rating, and discount, plus sorting and pagination.
- Added customer profile editing, saved addresses, account-backed carts/orders, and guest-cart/order migration after login.
- Added ratings, review photos, verified-purchase labels, review updates, and product rating summaries.
- Replaced generated delivery data with seller-managed per-seller order stages, ETA, delivery partner, and customer timelines.
- Expanded seller management with product add/edit/archive, image upload/URL input, variants, stock controls, orders, fulfillment updates, and dashboard summaries.
- Hardened checkout so product prices, discounts, inventory, and seller ownership are calculated and checked on the server; duplicate submissions are idempotent and concurrent checkouts cannot oversell.
- Added isolated integration tests covering seller permissions, profiles, product options, filters, address books, cart merging, checkout, stock reservations, reviews, and tracking.
- Verified frontend lint, production build, 13 integration checks, desktop flows, mobile profile layout, storefront branding, pack-size cart behavior, saved-address checkout, and order tracking.

### 2026-09-11

- Started `npm run dev` outside the sandbox after Vite hit Windows filesystem access restrictions.
- Frontend is available at `http://localhost:5173/`; backend is available at `http://localhost:5000`.
- Backend connected successfully using the existing Atlas configuration in `server/.env`; no database override or application code changes were needed.
- Verified frontend HTTP 200, health through the Vite API proxy, 21 returned products, and 7 returned categories.
- Requested the local app be opened in the Codex browser panel.

### 2026-08-04

- Inspected project root, manifests, README, main React routes, Express server entry, route files, models, and core CSS.
- Confirmed project is a MERN quick-commerce grocery app with React/Vite frontend and Express/MongoDB backend.
- Added initial project planning documentation files requested by the user.
- Read user-provided Stitch seller `code.html` and Velocity Green `DESIGN.md`.
- Updated global frontend design tokens, header, home page, category tabs, product cards, and seller dashboard.
- Updated docs to record the Stitch-inspired UI reference direction.
- Verified `npm run build` in `client` passes after running outside the sandbox.
- `npm run lint` still has pre-existing failures in `CouponBox.jsx`, `AuthContext.jsx`, and `CartContext.jsx`; touched files are clean.
- Ran the project locally: frontend on `http://127.0.0.1:5173/`, backend on `http://localhost:5000`.
- Atlas DNS lookup failed for the configured remote MongoDB URI, so the backend was run against local MongoDB at `mongodb://localhost:27017/blinkit`.
- Fixed JWT signing so auth tokens use the same runtime secret as protected-route verification.
- Fixed direct order creation by assigning a unique local order reference, avoiding duplicate `razorpayOrderId: null` index failures.
- Smoke-tested products, categories, cart, coupons, user auth, seller auth, seller product creation, and direct order creation successfully.
- Razorpay real payment is not fully configured because the environment still contains placeholder Razorpay keys.

## Known Project State

- Frontend routes include home, cart, checkout, order success, orders, track orders, login, register, and seller dashboard.
- Backend routes include auth, products, cart, coupons, orders, payment, and health check.
- Auth uses JWT and bcrypt.
- Seller product creation is protected by auth and seller role middleware.
- Razorpay integration exists but requires environment keys.
- MongoDB connection defaults to `mongodb://localhost:27017/blinkit`.
- UI now follows Velocity Green/FreshDash references without making a pixel-perfect copy.

## Next Useful Updates

- Update this file after each prompt with changed files and decisions.
- Note any commands run for verification.
- Note any known bugs, missing env vars, or blocked work.
- Keep this file short enough to scan quickly.
