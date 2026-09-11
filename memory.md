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

- Current prompt: Run the project locally after reporting an Atlas inactivity outage.
- Current file being worked on: Local runtime verification and project memory.
- Current status: Frontend and backend running locally; the configured Atlas database connected successfully.

## Update Log

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
