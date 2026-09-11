# Design System

## Brand Direction

BLinkit should feel fast, fresh, and practical. The interface should prioritize shopping speed, readable prices, clear actions, and low-friction checkout. The current visual direction is based on the user's Google Stitch reference screens: a "FreshDash"/Blinkit-style quick-commerce UI with a dark green app bar, white search field, compact category surfaces, product cards, and a clean seller portal.

## Reference Templates

- Blinkit logo reference: green lightning + simple wordmark direction.
- Customer home reference: dark green sticky header, wide search, delivery/profile/cart actions, large produce hero, shop-by-category row, and compact trending product grid.
- Category/catalog reference: left category rail, main category heading, product cards with image-first layout, discount badges, and ADD/stepper controls.
- Seller dashboard reference: fixed green seller header, two-column portal, add-product form on the left, searchable inventory table on the right.
- `velocity_green/DESIGN.md`: source for the Velocity Green token set and compact quick-commerce styling.

## Color Palette

- Primary green: `#006c49`
- Action green: `#10b981`
- Primary dark green: `#005236`
- Page background: `#f8f9fb`
- Muted page background: `#f3f4f6`
- Main text: `#191c1e`
- Secondary text: `#6b7280`
- Muted border/background: `#e5e7eb`
- Placeholder text: `#9ca3af`
- Warm badge background: `#fef3c7`
- Warm badge text: `#92400e`
- White surface: `#ffffff`

## Theme Rules

- Use dark green for the sticky app bar and brand areas.
- Use action green for ADD, steppers, publish buttons, active categories, and high-intent CTAs.
- Use neutral gray backgrounds for page structure.
- Use white for cards, forms, dropdowns, and product surfaces.
- Use warm yellow/brown badges sparingly for counts, roles, discounts, or offers.
- Keep shadows soft and functional.
- Avoid heavy decorative gradients outside brand header or hero surfaces.

## Typography

- Font family: `'Hanken Grotesk', 'Segoe UI', system-ui, -apple-system, sans-serif`.
- Body text should stay readable at `0.95rem` to `1rem`.
- Page headings should be clear and compact, generally `1.25rem` to `1.75rem`.
- Product titles should be short, scannable, and semibold.
- Prices should be visually stronger than descriptions or units.
- Avoid negative letter spacing in new UI.

## Layout

- Use a max content width of `1280px` for main shopping pages.
- Use `1rem` horizontal padding on mobile and small desktop.
- Use responsive CSS grid for product listings.
- Use a 240px desktop category rail beside the main product catalog when space allows.
- Use a category showcase row above the catalog for visual browsing.
- Keep cards compact enough for fast scanning.
- Keep repeated UI elements stable in size so hover or loading states do not shift layout.
- Use sticky navigation for quick access to search, auth, and cart.

## Components

- Header: dark green gradient, sticky, wide white search field, delivery/profile/cart actions.
- Product card: image, title, unit, price, discount, add-to-cart action.
- Product card quantity state: convert ADD into a compact `- count +` stepper.
- Category tabs: desktop vertical category rail with active outlined item; mobile horizontal scroller.
- Cart rows: product summary, quantity controls, remove action.
- Checkout form: concise address fields and payment/order CTA.
- Seller portal: two-column layout with a direct product form and searchable inventory table.
- Error boundary: friendly fallback instead of a blank page.

## Interaction

- Buttons should have clear hover and disabled states.
- Quantity controls should update immediately and preserve layout.
- Search should feel lightweight and direct.
- Forms should show validation close to the failed action.
- Loading and empty states should be calm and brief.

## Accessibility

- Maintain visible focus states for keyboard users.
- Keep color contrast readable on green and white surfaces.
- Use semantic buttons for actions.
- Use labels or accessible names for form controls.
- Do not rely on color alone to communicate status.
