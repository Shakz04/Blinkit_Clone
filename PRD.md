# Product Requirements Document

## Product

BLinkit is a quick-commerce grocery delivery web app inspired by Blinkit. It lets shoppers browse grocery products, search and filter by category, manage a cart, apply coupons, place orders, and complete checkout. It also gives sellers a protected dashboard for adding and managing their own products.

## Target Users

- Customers who want fast grocery ordering from a simple web interface.
- Guest shoppers who want to browse and add items before creating an account.
- Registered users who want order history and checkout continuity.
- Sellers who need a lightweight way to add products to the catalog.
- Developers or reviewers evaluating a MERN quick-commerce implementation.

## Core User Goals

- Find grocery products quickly by category or search.
- Add, update, and remove cart items with clear pricing feedback.
- Checkout with a delivery address and payment flow.
- Track or review placed orders.
- Register or log in as either a shopper or seller.
- Allow sellers to add products through a role-protected dashboard.

## Current Feature Set

- User and seller registration.
- Login with JWT-based authentication.
- Product listing with a visual Shop by Category homepage and advanced filters/sorting revealed for active search results.
- Product cards with price, original price, unit, discount, and stock information.
- Stitch-inspired customer UI with sticky green header, visual category browsing, hero banner, and compact product grid.
- Cart stored by `sessionId` with quantity updates.
- Coupon entry UI and coupon routes.
- Checkout page with delivery address capture.
- Razorpay payment order creation and verification when keys are configured.
- Direct order creation route for bypassing Razorpay during development.
- Order success, order history, and tracking pages.
- Seller dashboard protected by seller role.
- Stitch-inspired seller portal with product form and searchable inventory table.

## MVP Requirements

- The home page must show in-stock products and visual category browsing. Brand, price, availability, rating, discount, and sorting controls must appear only after a shopper submits a non-empty search.
- The home page UI must follow the user's Stitch references as a template: dark green header, wide search, category browsing, and dense product cards.
- Users must be able to add products to cart without a full page refresh.
- Cart totals must update when quantities change.
- Checkout must validate required address and payment/order data.
- Authenticated sellers must be able to create products.
- Sellers must manage inventory from a clean portal-style layout with a creation form and product table.
- Non-sellers must not access seller-only product creation.
- API responses must return useful error messages without leaking secrets.

## Future Enhancements

- Product image upload instead of URL-only images.
- Seller product edit/delete actions.
- Admin moderation for sellers, products, coupons, and orders.
- Inventory counts and low-stock warnings.
- Delivery slot selection.
- Real-time order status updates.
- User profile and saved addresses.
- Tests for API routes and core frontend flows.

## Success Metrics

- A shopper can go from homepage to successful order in under 3 minutes.
- Product search and category browsing feel responsive.
- Cart state remains consistent across navigation.
- Seller-only routes are inaccessible to normal users.
- Payment setup failures are handled clearly in development.
