// Generates soft, editorial SVG product images into public/products/.
// Each image: scent-tinted gradient backdrop, botanical sprig, category vessel.
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "../public/products");
mkdirSync(outDir, { recursive: true });

const SCENT_TINTS = {
  lavender: { light: "#ded6e4", mid: "#c3b5cc", deep: "#9d8bab" },
  jasmine: { light: "#f2edda", mid: "#e3dabc", deep: "#c0b28a" },
  sandalwood: { light: "#e7d4bf", mid: "#cfae8a", deep: "#a97f58" },
  rose: { light: "#ecd8d2", mid: "#d9b3ab", deep: "#b98379" },
  citrus: { light: "#f0e4c4", mid: "#e0cd96", deep: "#bda45e" },
};

const CREAM = "#f7f1e8";
const CREAM_SHADE = "#e8dcc9";
const EARTH = "#95714f";
const EARTH_DEEP = "#5f4732";
const MOSS = "#8c916c";
const MOSS_DEEP = "#585c42";
const SAND = "#c7af94";

function sprig(x, y, scale, rotate, color = MOSS) {
  return `<g transform="translate(${x} ${y}) scale(${scale}) rotate(${rotate})" fill="none" stroke="${color}" stroke-width="3.5" stroke-linecap="round">
    <path d="M0 0 Q 14 -60 8 -130"/>
    <path d="M6 -30 Q 40 -46 58 -38" /><path d="M6 -30 Q 34 -22 52 -6" stroke-width="0"/>
    <path d="M9 -62 Q 42 -80 62 -74"/>
    <path d="M10 -92 Q 40 -112 58 -108"/>
    <path d="M5 -34 Q -26 -50 -44 -42"/>
    <path d="M8 -66 Q -22 -84 -40 -80"/>
    <path d="M9 -96 Q -18 -114 -34 -112"/>
    <ellipse cx="8" cy="-135" rx="7" ry="12" fill="${color}" stroke="none" transform="rotate(8 8 -135)"/>
  </g>`;
}

function leafCluster(x, y, scale, color) {
  return `<g transform="translate(${x} ${y}) scale(${scale})" fill="${color}" opacity="0.55">
    <path d="M0 0 C 20 -34 52 -44 84 -40 C 68 -8 36 6 0 0 Z"/>
    <path d="M6 10 C 34 18 52 42 56 72 C 24 62 4 40 6 10 Z" opacity="0.8"/>
  </g>`;
}

const vessels = {
  lotion: `
    <rect x="330" y="380" width="140" height="330" rx="26" fill="${CREAM}"/>
    <rect x="330" y="380" width="46" height="330" rx="23" fill="${CREAM_SHADE}" opacity="0.6"/>
    <rect x="374" y="330" width="52" height="56" rx="8" fill="${SAND}"/>
    <rect x="374" y="316" width="88" height="22" rx="10" fill="${EARTH}"/>
    <rect x="440" y="320" width="26" height="14" rx="6" fill="${EARTH}"/>
    <rect x="352" y="470" width="96" height="140" rx="10" fill="TINT_LIGHT"/>
    <rect x="352" y="470" width="96" height="140" rx="10" fill="none" stroke="TINT_DEEP" stroke-width="1.5" opacity="0.6"/>
    <circle cx="400" cy="516" r="17" fill="none" stroke="TINT_DEEP" stroke-width="2" opacity="0.75"/>
    <path d="M392 522 Q 400 506 408 522" stroke="TINT_DEEP" stroke-width="2" fill="none" opacity="0.75"/>
    <rect x="376" y="556" width="48" height="5" rx="2.5" fill="TINT_DEEP" opacity="0.55"/>
    <rect x="366" y="572" width="68" height="4" rx="2" fill="TINT_DEEP" opacity="0.35"/>
  `,
  cream: `
    <ellipse cx="400" cy="700" rx="128" ry="16" fill="${EARTH_DEEP}" opacity="0.12"/>
    <path d="M282 540 Q 282 500 322 500 L 478 500 Q 518 500 518 540 L 518 660 Q 518 700 478 700 L 322 700 Q 282 700 282 660 Z" fill="${CREAM}"/>
    <path d="M282 540 Q 282 500 322 500 L 360 500 L 360 700 L 322 700 Q 282 700 282 660 Z" fill="${CREAM_SHADE}" opacity="0.6"/>
    <rect x="272" y="452" width="256" height="56" rx="24" fill="${SAND}"/>
    <rect x="272" y="452" width="256" height="24" rx="12" fill="${EARTH}" opacity="0.35"/>
    <rect x="316" y="548" width="168" height="104" rx="8" fill="TINT_LIGHT"/>
    <rect x="316" y="548" width="168" height="104" rx="8" fill="none" stroke="TINT_DEEP" stroke-width="1.5" opacity="0.6"/>
    <circle cx="400" cy="586" r="15" fill="none" stroke="TINT_DEEP" stroke-width="2" opacity="0.75"/>
    <rect x="356" y="616" width="88" height="5" rx="2.5" fill="TINT_DEEP" opacity="0.55"/>
    <rect x="370" y="630" width="60" height="4" rx="2" fill="TINT_DEEP" opacity="0.35"/>
  `,
  salt: `
    <ellipse cx="400" cy="712" rx="120" ry="14" fill="${EARTH_DEEP}" opacity="0.12"/>
    <path d="M306 420 L 494 420 L 486 690 Q 484 712 460 712 L 340 712 Q 316 712 314 690 Z" fill="${CREAM}" opacity="0.9"/>
    <path d="M306 420 L 360 420 L 356 712 L 340 712 Q 316 712 314 690 Z" fill="${CREAM_SHADE}" opacity="0.55"/>
    <path d="M312 540 L 488 540 L 486 690 Q 484 712 460 712 L 340 712 Q 316 712 314 690 Z" fill="TINT_MID" opacity="0.85"/>
    <circle cx="360" cy="600" r="5" fill="#fff" opacity="0.5"/><circle cx="402" cy="640" r="4" fill="#fff" opacity="0.45"/>
    <circle cx="440" cy="590" r="4.5" fill="#fff" opacity="0.5"/><circle cx="378" cy="672" r="4" fill="#fff" opacity="0.4"/>
    <circle cx="430" cy="668" r="5" fill="#fff" opacity="0.45"/>
    <path d="M298 380 Q 400 356 502 380 L 496 424 L 304 424 Z" fill="${EARTH}"/>
    <path d="M298 380 Q 400 356 502 380 L 500 396 Q 400 372 300 396 Z" fill="${EARTH_DEEP}" opacity="0.45"/>
    <rect x="336" y="452" width="128" height="52" rx="6" fill="${CREAM}"/>
    <rect x="352" y="468" width="96" height="5" rx="2.5" fill="TINT_DEEP" opacity="0.6"/>
    <rect x="364" y="482" width="72" height="4" rx="2" fill="TINT_DEEP" opacity="0.4"/>
  `,
  clay: `
    <ellipse cx="400" cy="708" rx="150" ry="16" fill="${EARTH_DEEP}" opacity="0.12"/>
    <path d="M252 560 Q 252 540 276 540 L 524 540 Q 548 540 548 560 Q 548 660 476 700 L 324 700 Q 252 660 252 560 Z" fill="${CREAM}"/>
    <path d="M252 560 Q 252 540 276 540 L 330 540 Q 316 640 340 700 L 324 700 Q 252 660 252 560 Z" fill="${CREAM_SHADE}" opacity="0.6"/>
    <path d="M270 548 Q 400 470 530 548 Q 470 522 400 522 Q 330 522 270 548 Z" fill="TINT_MID"/>
    <path d="M288 546 Q 400 492 512 546 Q 452 528 400 528 Q 348 528 288 546 Z" fill="TINT_DEEP" opacity="0.5"/>
    <rect x="330" y="592" width="140" height="72" rx="8" fill="TINT_LIGHT"/>
    <circle cx="400" cy="618" r="12" fill="none" stroke="TINT_DEEP" stroke-width="2" opacity="0.7"/>
    <rect x="352" y="640" width="96" height="5" rx="2.5" fill="TINT_DEEP" opacity="0.5"/>
  `,
  scrub: `
    <ellipse cx="400" cy="708" rx="118" ry="14" fill="${EARTH_DEEP}" opacity="0.12"/>
    <path d="M292 470 Q 292 440 322 440 L 478 440 Q 508 440 508 470 L 508 668 Q 508 708 468 708 L 332 708 Q 292 708 292 668 Z" fill="${CREAM}"/>
    <path d="M292 470 Q 292 440 322 440 L 362 440 L 362 708 L 332 708 Q 292 708 292 668 Z" fill="${CREAM_SHADE}" opacity="0.6"/>
    <rect x="284" y="392" width="232" height="58" rx="26" fill="${MOSS}"/>
    <rect x="284" y="392" width="232" height="26" rx="13" fill="${MOSS_DEEP}" opacity="0.4"/>
    <rect x="322" y="498" width="156" height="150" rx="8" fill="TINT_LIGHT"/>
    <rect x="322" y="498" width="156" height="150" rx="8" fill="none" stroke="TINT_DEEP" stroke-width="1.5" opacity="0.6"/>
    <circle cx="400" cy="546" r="16" fill="none" stroke="TINT_DEEP" stroke-width="2" opacity="0.75"/>
    <circle cx="393" cy="551" r="2.5" fill="TINT_DEEP" opacity="0.7"/><circle cx="404" cy="543" r="2.5" fill="TINT_DEEP" opacity="0.7"/>
    <rect x="352" y="580" width="96" height="5" rx="2.5" fill="TINT_DEEP" opacity="0.55"/>
    <rect x="364" y="596" width="72" height="4" rx="2" fill="TINT_DEEP" opacity="0.35"/>
  `,
  soap: `
    <ellipse cx="400" cy="672" rx="150" ry="18" fill="${EARTH_DEEP}" opacity="0.14"/>
    <g transform="rotate(-6 400 560)">
      <rect x="268" y="480" width="264" height="160" rx="44" fill="${CREAM}"/>
      <rect x="268" y="480" width="264" height="60" rx="30" fill="#fdfaf5" opacity="0.7"/>
      <rect x="268" y="596" width="264" height="44" rx="22" fill="${CREAM_SHADE}" opacity="0.8"/>
      <circle cx="400" cy="556" r="34" fill="none" stroke="TINT_DEEP" stroke-width="2" opacity="0.6"/>
      <path d="M386 566 Q 400 538 414 566" stroke="TINT_DEEP" stroke-width="2" fill="none" opacity="0.6"/>
      <rect x="340" y="602" width="120" height="5" rx="2.5" fill="TINT_DEEP" opacity="0.45"/>
    </g>
    <g transform="rotate(4 470 470)">
      <rect x="366" y="404" width="210" height="120" rx="34" fill="TINT_MID"/>
      <rect x="366" y="404" width="210" height="44" rx="22" fill="#ffffff" opacity="0.25"/>
    </g>
  `,
};

function render(scent, category) {
  const t = SCENT_TINTS[scent];
  const vessel = vessels[category]
    .replaceAll("TINT_LIGHT", t.light)
    .replaceAll("TINT_MID", t.mid)
    .replaceAll("TINT_DEEP", t.deep);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${t.light}"/>
      <stop offset="100%" stop-color="${t.mid}"/>
    </linearGradient>
    <radialGradient id="halo" cx="50%" cy="42%" r="55%">
      <stop offset="0%" stop-color="#fdfaf5" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="#fdfaf5" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="800" height="1000" fill="url(#bg)"/>
  <circle cx="400" cy="460" r="330" fill="url(#halo)"/>
  ${leafCluster(70, 130, 1.1, t.deep)}
  ${leafCluster(600, 800, 1.3, t.deep)}
  ${sprig(150, 870, 1.4, -14, MOSS_DEEP)}
  ${sprig(660, 320, 1.2, 152, MOSS)}
  ${vessel}
  <rect width="800" height="1000" fill="${EARTH_DEEP}" opacity="0.02"/>
</svg>`;
}

const products = [
  ["lavender-dream-body-lotion", "lavender", "lotion"],
  ["rose-petal-silk-body-lotion", "rose", "lotion"],
  ["botanical-whipped-body-lotion", "jasmine", "lotion"],
  ["sandalwood-saffron-face-cream", "sandalwood", "cream"],
  ["jasmine-night-repair-face-cream", "jasmine", "cream"],
  ["rose-hydra-glow-face-cream", "rose", "cream"],
  ["lavender-himalayan-bath-salt", "lavender", "salt"],
  ["citrus-grove-bath-salt", "citrus", "salt"],
  ["rose-multani-mitti-clay", "rose", "clay"],
  ["sandalwood-vetiver-clay", "sandalwood", "clay"],
  ["coffee-walnut-body-scrub", "sandalwood", "scrub"],
  ["citrus-sugar-glow-scrub", "citrus", "scrub"],
  ["lavender-oat-milk-soap", "lavender", "soap"],
  ["jasmine-honey-soap", "jasmine", "soap"],
  ["sandalwood-turmeric-soap", "sandalwood", "soap"],
  ["rose-geranium-soap", "rose", "soap"],
];

for (const [slug, scent, category] of products) {
  writeFileSync(path.join(outDir, `${slug}.svg`), render(scent, category));
  console.log(`✓ ${slug}.svg`);
}
console.log(`\n${products.length} images written to public/products/`);
