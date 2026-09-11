# Project Rules

## Use

- Use React function components and hooks.
- Use React Router for navigation.
- Use existing context providers for shared auth and cart state.
- Use `client/src/api.js` for API calls instead of scattering fetch logic.
- Use plain CSS files following existing naming patterns.
- Use the user's Stitch screens as UI reference templates, not pixel-perfect copies.
- Use Velocity Green tokens from `design.md` for new frontend styling.
- Use Express routers for backend endpoints.
- Use Mongoose models for database access.
- Use JWT Bearer tokens for protected routes.
- Use `protect` and `sellerOnly` middleware for seller-only actions.
- Use environment variables for secrets and external service keys.
- Use clear JSON error responses: `{ "error": "Human readable message" }`.
- Use server-side validation for all request bodies.

## Avoid

- Do not commit `.env`, API keys, Razorpay secrets, JWT secrets, or local database credentials.
- Do not trust frontend-only validation for permissions, prices, cart totals, or payment status.
- Do not store plaintext passwords.
- Do not bypass `sellerOnly` for product creation or seller dashboards.
- Do not introduce a second styling system unless the project intentionally migrates.
- Do not copy the Stitch images exactly; translate their structure, spacing, and visual language into this project.
- Do not add unrelated refactors while implementing a feature.
- Do not create duplicate API helpers when `api.js` can be extended.
- Do not leak raw stack traces in production responses.
- Do not hardcode localhost URLs in reusable frontend modules if an environment-based base URL is available.

## AI Working Boundaries

- Read the relevant files before editing.
- Prefer existing project patterns over new architecture.
- Keep changes scoped to the requested feature or fix.
- Update `memory.md` after each prompt or meaningful change.
- Update `context.md` when architecture, flows, commands, or assumptions change.
- Update `design.md` when UI reference direction or tokens change.
- If behavior is unclear, infer conservatively from existing code and document the assumption.
- Preserve user changes in the working tree.
- Use `rg` for project search where available.

## Error Handling Rules

- Backend validation errors should use `400`.
- Auth failures should use `401`.
- Permission failures should use `403`.
- Missing records should use `404`.
- Misconfigured external services should use `503` when the service cannot run.
- Unexpected server failures should use `500`.
- Frontend pages should show readable user-facing errors and avoid blank screens.
- Payment verification must happen on the server using Razorpay signature validation.
- Database writes should be wrapped in `try/catch` route handlers.

## Security Rules

- Hash passwords with bcrypt before saving.
- Sign JWTs with `JWT_SECRET` from environment in production.
- Keep token handling centralized in auth context/API helpers.
- Validate role values against known roles: `user`, `seller`.
- Never accept client-supplied payment success without server verification.
- Treat all client-supplied prices and totals as untrusted for production hardening.

## Quality Rules

- Run the narrowest relevant verification after changes.
- For frontend changes, run `npm run lint` in `client` when practical.
- For backend changes, start or syntax-check the touched route/model where practical.
- Keep docs ASCII unless a file already intentionally uses Unicode.
- Add tests when changing shared logic, auth, payments, or order flows.
