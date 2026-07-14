/**
 * Shown only when the app is running without a database (see lib/demo.ts).
 * Server component — no client JS.
 */
export default function DemoBanner() {
  return (
    <div className="bg-earth-deep px-5 py-2 text-center text-xs text-almond-light/90">
      <span className="font-semibold">Preview mode</span> — browsing, search and
      the cart are live. Checkout, accounts and the admin panel need a database
      and are disabled.
    </div>
  );
}
