# Architecture

## Tech Stack

- Frontend: React 19, Vite, React Router.
- Styling: Plain CSS files colocated with pages/components.
- Design reference: User-provided Google Stitch screens plus `velocity_green/DESIGN.md` tokens.
- State: React Context for auth and cart.
- Backend: Node.js, Express, Mongoose.
- Database: MongoDB local or MongoDB Atlas.
- Auth: JWT with bcrypt password hashing.
- Payments: Razorpay SDK with server-side signature verification.
- Tooling: npm scripts, concurrently, ESLint.

## App Flow

1. User opens the React app at `client`.
2. `App.jsx` mounts `AuthProvider` and `CartProvider`.
3. Public routes include home, cart, checkout, orders, tracking, login, and register.
4. The seller route is wrapped in `ProtectedRoute` with `requireSeller`.
5. Frontend API calls go through `client/src/api.js`.
6. Express receives requests under `/api/*`.
7. Route handlers validate input, call Mongoose models, and return JSON.
8. MongoDB stores users, products, carts, coupons, and orders.
9. Checkout either creates a Razorpay order or uses the direct order route during development.
10. Payment verification updates the matching order to `paid`.

## Folder Structure

```text
BLinkit/
  client/
    index.html
    vite.config.js
    src/
      App.jsx
      main.jsx
      api.js
      App.css
      index.css
      assets/
      components/
        CategoryTabs.jsx
        CouponBox.jsx
        ErrorBoundary.jsx
        Header.jsx
        ProductCard.jsx
        ProtectedRoute.jsx
      context/
        AuthContext.jsx
        CartContext.jsx
      pages/
        Cart.jsx
        Checkout.jsx
        Home.jsx
        Login.jsx
        OrderSuccess.jsx
        Orders.jsx
        Register.jsx
        SellerDashboard.jsx
        TrackOrders.jsx
  server/
    index.js
    seed.js
    middleware/
      auth.js
    models/
      Cart.js
      Coupon.js
      Order.js
      Product.js
      User.js
    routes/
      auth.js
      cart.js
      coupons.js
      orders.js
      payment.js
      products.js
  package.json
```

## Backend Modules

- `server/index.js`: Express app setup, middleware, route registration, health check, MongoDB connection.
- `server/middleware/auth.js`: JWT protection and seller authorization.
- `server/models/User.js`: User credentials and roles.
- `server/models/Product.js`: Grocery catalog item data.
- `server/models/Cart.js`: Session cart storage.
- `server/models/Coupon.js`: Coupon rules and discount data.
- `server/models/Order.js`: Order, payment, address, and status records.
- `server/routes/auth.js`: Register, login, current user.
- `server/routes/products.js`: Product list, categories, detail, seller product creation.
- `server/routes/cart.js`: Cart read/update/remove/clear.
- `server/routes/coupons.js`: Coupon validation and discount logic.
- `server/routes/orders.js`: Order creation and lookup by session.
- `server/routes/payment.js`: Razorpay order creation, key lookup, and signature verification.

## Frontend Modules

- `client/src/App.jsx`: Route tree and top-level providers.
- `client/src/api.js`: Central API helper.
- `client/src/context/AuthContext.jsx`: Login session, token storage, current user state.
- `client/src/context/CartContext.jsx`: Cart state and cart API operations.
- `client/src/components/Header.jsx`: Navigation, search, auth links, cart entry.
- `client/src/pages/Home.jsx`: Product browsing, hero banner, visual categories, category rail, search entry, and search-only advanced filter/sort state.
- `client/src/pages/Cart.jsx`: Cart item management and summary.
- `client/src/pages/Checkout.jsx`: Address and payment/order placement.
- `client/src/pages/SellerDashboard.jsx`: Seller portal with product creation and searchable inventory table.

## Deployment Shape

- The frontend can be built with `npm run build` inside `client`.
- The backend runs with `npm start` inside `server`.
- Runtime environment variables belong in `server/.env`.
- MongoDB and Razorpay credentials must be provided outside source control.
