/**
 * Demo mode.
 *
 * With no DATABASE_URL configured the app runs as a fully browsable storefront
 * backed by the static catalogue in src/data/catalogue.json — no database, no
 * backend. Browsing, search, filters, product pages and the cart all work.
 *
 * Anything that needs to persist (accounts, orders, payments, enquiries, the
 * admin panel) is disabled and returns DEMO_MESSAGE instead of erroring.
 *
 * Set DATABASE_URL (Supabase Postgres) to turn the full backend on.
 */
import { databaseUrl } from "@/lib/env";

export const DB_ENABLED = Boolean(databaseUrl());

export const DEMO_MESSAGE =
  "This is a preview deployment running without a database, so this feature is disabled. Connect a database to enable accounts, orders and the admin panel.";

/** Exposed to client components via the layout. */
export const IS_DEMO = !DB_ENABLED;
