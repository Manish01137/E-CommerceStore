// Verifies the no-database "demo mode" storefront: browsing, filtering and the
// cart must all work; checkout must degrade with a clear message.
import { chromium } from "playwright-core";

const S =
  "/private/tmp/claude-501/-Users-manishbeniwal-Desktop-E-commerceStore/db8e0fdc-1a05-430e-9b1d-6a63b09bb47e/scratchpad";
const b = await chromium.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
const page = await (await b.newContext({ viewport: { width: 1400, height: 900 } })).newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));

// Browse → filter
await page.goto("http://localhost:3000/products", { waitUntil: "networkidle" });
await page.waitForTimeout(1200);
await page.selectOption('select[aria-label="Filter by category"]', "Face Wash");
await page.waitForTimeout(900);
const cards = await page.locator("article").count();
console.log("face-wash filter shows cards:", cards);

// Product detail → add to cart
await page.goto("http://localhost:3000/products/goat-milk-honey-soap", { waitUntil: "networkidle" });
await page.getByRole("button", { name: "Add to Cart" }).click();
await page.waitForTimeout(700);
await page.getByRole("button", { name: "View Cart" }).click();
await page.waitForTimeout(700);
const drawer = await page.getByRole("dialog", { name: "Shopping cart" }).textContent();
console.log("cart works:", drawer.includes("Goat Milk & Honey"));
await page.screenshot({ path: `${S}/demo-cart.png` });

// Checkout → redirected to login → attempt shows the demo message
await page.getByRole("link", { name: "Proceed to Checkout" }).click();
await page.waitForURL("**/login**");
await page.fill("#email", "someone@example.com");
await page.fill("#password", "password123");
await page.getByRole("button", { name: "Sign In" }).click();
await page.waitForTimeout(1200);
const body = await page.textContent("body");
console.log("demo message shown on login:", body.includes("preview deployment running without a database"));

await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
await page.waitForTimeout(1200);
console.log("demo banner on home:", (await page.textContent("body")).includes("Preview mode"));
await page.screenshot({ path: `${S}/demo-home.png`, clip: { x: 0, y: 0, width: 1400, height: 420 } });

console.log("page JS errors:", errors.length ? errors : "none");
await b.close();
