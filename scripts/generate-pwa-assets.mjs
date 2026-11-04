/**
 * Generates the committed UNTOUCH PWA icons and iOS launch images from the
 * existing flame mark. Run with: npm run assets:pwa
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const iconDir = path.join(root, "public", "icons");
const splashDir = path.join(root, "public", "splash");

const ICON_SIZES = [72, 96, 128, 144, 152, 167, 180, 192, 256, 384, 512];
const MASKABLE_SIZES = [192, 512];

function mark(scale = 1, monochrome = false) {
  const flame = monochrome ? "#ffffff" : "#c4551f";
  const inner = monochrome ? "#ffffff" : "#e2b25d";
  const ring = monochrome ? "#ffffff" : "#f2ece1";
  const dot = monochrome ? "#ffffff" : "#f2ece1";
  return `
    <g transform="translate(256 256) scale(${scale}) translate(-256 -256)">
      <circle cx="256" cy="256" r="168" fill="none" stroke="${ring}" stroke-opacity="0.22" stroke-width="8"/>
      <path d="M256 120c51.2 68.8 84.8 108.8 84.8 164.8a84.8 84.8 0 1 1-169.6 0C171.2 228.8 204.8 188.8 256 120Z" fill="none" stroke="${flame}" stroke-width="16" stroke-linejoin="round"/>
      <path d="M256 260c18.4 25.6 28.8 40.8 28.8 60.8a28.8 28.8 0 1 1-57.6 0c0-20 10.4-35.2 28.8-60.8Z" fill="${inner}"/>
      <circle cx="360" cy="152" r="20.8" fill="${dot}"/>
    </g>`;
}

function iconSvg(size, { maskable = false, monochrome = false } = {}) {
  const background = monochrome
    ? ""
    : `<rect width="512" height="512" fill="url(#icon-bg)"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
    <defs>
      <radialGradient id="icon-bg" cx="50%" cy="34%" r="76%">
        <stop offset="0" stop-color="#241813"/>
        <stop offset="0.55" stop-color="#100e0c"/>
        <stop offset="1" stop-color="#0a0908"/>
      </radialGradient>
    </defs>
    ${background}
    ${mark(maskable ? 0.82 : 1, monochrome)}
  </svg>`;
}

function splashSvg(width, height) {
  const short = Math.min(width, height);
  const markSize = short * 0.3;
  const markScale = markSize / 512;
  const wordSize = short * 0.071;
  const tagSize = short * 0.0185;
  const centerX = width / 2;
  const centerY = height * 0.45;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <radialGradient id="bg" cx="50%" cy="42%" r="72%">
        <stop offset="0" stop-color="#231711"/>
        <stop offset="0.48" stop-color="#100e0c"/>
        <stop offset="1" stop-color="#0a0908"/>
      </radialGradient>
      <radialGradient id="glow" cx="50%" cy="50%" r="50%">
        <stop offset="0" stop-color="#c4551f" stop-opacity="0.18"/>
        <stop offset="1" stop-color="#c4551f" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#bg)"/>
    <ellipse cx="${centerX}" cy="${centerY}" rx="${short * 0.46}" ry="${short * 0.46}" fill="url(#glow)"/>
    <g transform="translate(${centerX - markSize / 2} ${centerY - markSize / 2}) scale(${markScale})">
      ${mark(1, false)}
    </g>
    <g font-family="DejaVu Serif, Georgia, 'Times New Roman', serif" text-anchor="middle" fill="#f2ece1">
      <text x="${centerX}" y="${centerY + markSize * 0.76}" font-size="${wordSize}" letter-spacing="${wordSize * 0.25}">UNTOUCH</text>
    </g>
    <g font-family="DejaVu Sans, Helvetica, Arial, sans-serif" text-anchor="middle" fill="#f2ece1" fill-opacity="0.38">
      <text x="${centerX}" y="${centerY + markSize * 0.76 + tagSize * 2.8}" font-size="${tagSize}" letter-spacing="${tagSize * 0.34}">FIRE · SPICE · QUIET LUXURY</text>
    </g>
  </svg>`;
}

const SPLASHES = [
  [640, 1136, "320x568@2"],
  [750, 1334, "375x667@2"],
  [828, 1792, "414x896@2"],
  [1125, 2436, "375x812@3"],
  [1170, 2532, "390x844@3"],
  [1242, 2688, "414x896@3"],
  [1284, 2778, "428x926@3"],
  [1290, 2796, "430x932@3"],
  [1320, 2868, "440x956@3"],
  [1488, 2266, "744x1133@2"],
  [1536, 2048, "768x1024@2"],
  [1620, 2160, "810x1080@2"],
  [1640, 2360, "820x1180@2"],
  [1668, 2388, "834x1194@2"],
  [2048, 2732, "1024x1366@2"],
];

await mkdir(iconDir, { recursive: true });
await mkdir(splashDir, { recursive: true });

for (const size of ICON_SIZES) {
  await sharp(Buffer.from(iconSvg(size))).png().toFile(path.join(iconDir, `icon-${size}.png`));
}
for (const size of MASKABLE_SIZES) {
  await sharp(Buffer.from(iconSvg(size, { maskable: true })))
    .png()
    .toFile(path.join(iconDir, `maskable-${size}.png`));
}
await sharp(Buffer.from(iconSvg(512, { monochrome: true })))
  .png()
  .toFile(path.join(iconDir, "monochrome-512.png"));
await sharp(Buffer.from(iconSvg(180)))
  .png()
  .toFile(path.join(iconDir, "apple-touch-icon.png"));

for (const [width, height, label] of SPLASHES) {
  await sharp(Buffer.from(splashSvg(width, height)))
    .png({ compressionLevel: 9, palette: true })
    .toFile(path.join(splashDir, `apple-splash-${width}x${height}.png`));
  console.log(`splash ${label} → apple-splash-${width}x${height}.png`);
}

console.log(`Generated ${ICON_SIZES.length} icons, ${MASKABLE_SIZES.length} maskable icons, monochrome, Apple touch icon and ${SPLASHES.length} launch images.`);
