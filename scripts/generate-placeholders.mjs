// Generates on-brand placeholder cards for products that don't have real
// photography yet. These are deliberately NOT fake product shots — they are
// branded cards carrying the product name and a discreet "photo coming soon"
// note, so nothing on the storefront misrepresents what's in the jar.
// Replace them by uploading real photos in the admin panel.
// Run: npm run placeholders
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "../public/products");
mkdirSync(outDir, { recursive: true });

const ALMOND = "#eaded0";
const ALMOND_LIGHT = "#f4ede3";
const SAND = "#c7af94";
const EARTH = "#95714f";
const EARTH_DEEP = "#5f4732";
const MOSS = "#8c916c";

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Wrap a title onto at most 3 lines of ~16 chars. */
function wrap(text, max = 16) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (const w of words) {
    if ((line + " " + w).trim().length > max && line) {
      lines.push(line.trim());
      line = w;
    } else {
      line = (line + " " + w).trim();
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 3);
}

const sprig = (x, y, scale, rotate, color, opacity) => `
  <g transform="translate(${x} ${y}) scale(${scale}) rotate(${rotate})" fill="none"
     stroke="${color}" stroke-width="3" stroke-linecap="round" opacity="${opacity}">
    <path d="M0 0 Q 12 -55 7 -120"/>
    <path d="M5 -28 Q 36 -42 52 -35"/><path d="M8 -58 Q 38 -74 56 -68"/>
    <path d="M9 -86 Q 36 -104 52 -100"/>
    <path d="M4 -32 Q -24 -46 -40 -38"/><path d="M7 -62 Q -20 -78 -36 -74"/>
    <path d="M8 -90 Q -16 -106 -30 -104"/>
    <ellipse cx="7" cy="-124" rx="6" ry="11" fill="${color}" stroke="none"/>
  </g>`;

function render(name, category) {
  const lines = wrap(name);
  const startY = 470 - (lines.length - 1) * 34;
  const title = lines
    .map(
      (l, i) =>
        `<text x="400" y="${startY + i * 68}" text-anchor="middle" fill="${EARTH_DEEP}"
           font-family="Georgia, 'Times New Roman', serif" font-size="54">${esc(l)}</text>`
    )
    .join("\n  ");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0%" stop-color="${ALMOND_LIGHT}"/>
      <stop offset="100%" stop-color="${ALMOND}"/>
    </linearGradient>
    <radialGradient id="halo" cx="50%" cy="45%" r="52%">
      <stop offset="0%" stop-color="#fffdf9" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#fffdf9" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="800" height="1000" fill="url(#bg)"/>
  <circle cx="400" cy="450" r="330" fill="url(#halo)"/>
  ${sprig(120, 880, 1.5, -12, MOSS, 0.32)}
  ${sprig(690, 300, 1.25, 155, MOSS, 0.26)}
  ${sprig(660, 940, 1.1, 168, SAND, 0.5)}
  <rect x="70" y="70" width="660" height="860" rx="26" fill="none" stroke="${SAND}" stroke-width="2"/>
  <text x="400" y="300" text-anchor="middle" fill="${MOSS}"
    font-family="Helvetica, Arial, sans-serif" font-size="22" letter-spacing="6"
    font-weight="600">${esc(category.toUpperCase())}</text>
  <line x1="330" y1="330" x2="470" y2="330" stroke="${SAND}" stroke-width="2"/>
  ${title}
  <text x="400" y="690" text-anchor="middle" fill="${EARTH}"
    font-family="Georgia, serif" font-style="italic" font-size="26"
    opacity="0.85">Ethereal Artisan</text>
  <text x="400" y="880" text-anchor="middle" fill="${EARTH}"
    font-family="Helvetica, Arial, sans-serif" font-size="17" letter-spacing="2.5"
    opacity="0.6">PHOTOGRAPHY COMING SOON</text>
</svg>`;
}

// Individual products still awaiting real photography. Each card shows the
// scent big and the category/size small — replace by uploading a real photo.
const pending = [
  // Shea butter soap
  ["shea-butter-rose", "Rose", "Shea Butter Soap"],
  // Goat milk soap
  ["goat-milk-lavender", "Lavender", "Goat Milk Soap"],
  // Botanical soaps
  ["botanical-papaya", "Papaya Kasturi Manjal", "Botanical Soap"],
  ["botanical-rose-lavender", "Rose Lavender", "Botanical Soap"],
  ["botanical-sandalwood", "Sandalwood", "Botanical Soap"],
  ["botanical-neem", "Neem", "Botanical Soap"],
  ["botanical-multani", "Multani Mitti", "Botanical Soap"],
  // Scrub / signature / flower soaps
  ["scrub-ubtan", "Ubtan", "Scrub Soap"],
  ["signature-sandalwood-cinnamon", "Sandalwood Cinnamon", "Signature Soap"],
  ["flower-assorted", "Assorted Flowers", "Flower Soap"],
  // Body wash
  ["bw-soft-lavender", "Soft Lavender", "Body Wash · 200 ml"],
  ["bw-divine-lotus", "Divine Lotus", "Body Wash · 200 ml"],
  ["bw-flower-bouquet", "Flower Bouquet", "Body Wash · 200 ml"],
  ["bw-royal-rose", "Royal Rose", "Body Wash · 200 ml"],
  ["bw-lush-lavender", "Lush Lavender", "Body Wash · 200 ml"],
  ["bw-citrus-lemon", "Citrus Lemon", "Body Wash · 200 ml"],
  ["bw-green-apple", "Green Apple", "Body Wash · 200 ml"],
  // Body lotion 250 g
  ["bl250-vanilla", "Vanilla", "Body Lotion · 250 g"],
  ["bl250-orange", "Orange", "Body Lotion · 250 g"],
  ["bl250-lavender", "Lavender", "Body Lotion · 250 g"],
  ["bl250-cherry-blossom", "Cherry Blossom", "Body Lotion · 250 g"],
  // Body lotion 100 g
  ["bl100-vanilla", "Vanilla", "Body Lotion · 100 g"],
  ["bl100-orange", "Orange", "Body Lotion · 100 g"],
  ["bl100-lavender", "Lavender", "Body Lotion · 100 g"],
  ["bl100-cherry-blossom", "Cherry Blossom", "Body Lotion · 100 g"],
  // Body scrub
  ["body-scrub-dark-rose", "Dark Rose", "Body Scrub · 100 g"],
];

for (const [slug, name, category] of pending) {
  writeFileSync(path.join(outDir, `ph-${slug}.svg`), render(name, category));
  console.log(`✓ ph-${slug}.svg`);
}
console.log(`\n${pending.length} placeholders written to public/products/`);
