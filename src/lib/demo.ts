/**
 * Demo mode.
 *
 * With no MONGODB_URI configured the app runs as a fully browsable storefront
 * backed by the static catalogue in src/data/catalogue.json — no database, no
 * backend. Browsing, search, filters, product pages and the cart all work.
 *
 * Anything that needs to persist (accounts, orders, payments, enquiries, the
 * admin panel) is disabled and returns DEMO_MESSAGE instead of erroring.
 *
 * Set MONGODB_URI to turn the full backend on.
 */
export const DB_ENABLED = Boolean(process.env.MONGODB_URI);

export const DEMO_MESSAGE =
  "This is a preview deployment running without a database, so this feature is disabled. Connect a database to enable accounts, orders and the admin panel.";

/** Exposed to client components via the layout. */
export const IS_DEMO = !DB_ENABLED;
