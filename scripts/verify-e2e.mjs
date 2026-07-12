// End-to-end browser verification: mobile layout, cart flow, checkout w/ mock payment.
import { chromium } from "playwright-core";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const BASE = "http://localhost:3000";
const OUT = process.cwd();

const browser = await chromium.launch({ executablePath: CHROME, headless: true });

// ── Mobile layout check ─────────────────────────────────────────
const mob = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
});
const mp = await mob.newPage();
await mp.goto(BASE, { waitUntil: "networkidle" });
const overflow = await mp.evaluate(
  () => document.documentElement.scrollWidth - document.documentElement.clientWidth
);
console.log("mobile horizontal overflow px:", overflow);
await mp.screenshot({ path: `${OUT}/m-home.png`, fullPage: false });
await mp.goto(`${BASE}/products`, { waitUntil: "networkidle" });
await mp.screenshot({ path: `${OUT}/m-products.png` });
await mob.close();

// ── Desktop interactive flow ────────────────────────────────────
const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));

// 1. product detail → add to cart → drawer
await page.goto(`${BASE}/products/botanical-whipped-body-lotion`, { waitUntil: "networkidle" });
await page.getByRole("radio", { name: "Sandalwood" }).click();
await page.getByRole("button", { name: "Add to Cart" }).click();
await page.waitForTimeout(600);
await page.getByRole("button", { name: "View Cart" }).click();
await page.waitForTimeout(700);
const drawerText = await page.getByRole("dialog", { name: "Shopping cart" }).textContent();
console.log("cart drawer has item:", drawerText.includes("Botanical Whipped"), "| scent:", drawerText.includes("Sandalwood"));
await page.screenshot({ path: `${OUT}/e2e-drawer.png` });

// 2. proceed to checkout → redirected to login → register a fresh user
await page.getByRole("link", { name: "Proceed to Checkout" }).click();
await page.waitForURL("**/login**");
console.log("redirected to login:", page.url().includes("/login"));
await page.getByRole("link", { name: "Create an account" }).click();
await page.waitForURL("**/register**");
const email = `e2e${Date.now()}@test.in`;
await page.fill("#name", "E2E Shopper");
await page.fill("#email", email);
await page.fill("#password", "password123");
await page.getByRole("button", { name: "Create Account" }).click();
await page.waitForURL("**/account**", { timeout: 10000 });
console.log("registered and landed on:", new URL(page.url()).pathname);

// 3. back to checkout — cart persisted?
await page.goto(`${BASE}/checkout`, { waitUntil: "networkidle" });
const summary = await page.textContent("body");
console.log("checkout shows item:", summary.includes("Botanical Whipped"));

// 4. fill address, submit invalid first (validation), then valid
await page.getByRole("button", { name: /^Pay/ }).click();
await page.waitForTimeout(400);
const hasErrors = await page.locator(".form-error").count();
console.log("validation errors shown on empty form:", hasErrors > 0);

await page.fill("#fullName", "E2E Shopper");
await page.fill("#phone", "9876501234");
await page.fill("#line1", "44 Test Lane, Sector 5");
await page.fill("#city", "Jaipur");
await page.fill("#state", "Rajasthan");
await page.fill("#pincode", "302017");
await page.getByRole("button", { name: /^Pay/ }).click();

// 5. mock payment dialog → simulate success
await page.getByRole("button", { name: "Simulate successful payment" }).click({ timeout: 10000 });
await page.waitForURL("**/account/orders/**", { timeout: 15000 });
console.log("order confirmation url:", new URL(page.url()).pathname + new URL(page.url()).search);
await page.waitForTimeout(1200);
const confText = await page.textContent("body");
console.log("confirmation banner:", confText.includes("your order is confirmed"));
console.log("order number shown:", /TB-[A-Z0-9]+/.test(confText));
await page.screenshot({ path: `${OUT}/e2e-confirmation.png`, fullPage: true });

// 6. cart cleared?
const cartCount = await page.evaluate(() => JSON.parse(localStorage.getItem("tb-cart-v1") ?? "[]").length);
console.log("cart cleared after order:", cartCount === 0);

console.log("page JS errors:", errors.length ? errors : "none");
await browser.close();
