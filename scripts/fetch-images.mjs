/**
 * Downloads the editorial photography used across UNTOUCH and converts it to
 * locally served WebP files in public/img. Run once with `node scripts/fetch-images.mjs`.
 *
 * Source: Unsplash (free to use under the Unsplash License, no attribution required).
 * Files are stored locally so the storefront never depends on hot-linked assets.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import sharp from "sharp";

const OUT = "public/img";

/** name → [unsplash photo id, crop width, aspect (w/h) or null to keep] */
const ASSETS = {
  "hero-plate": ["photo-1544025162-d76694265947", 2000, 0.72],
  "hero-alt": ["photo-1466637574441-749b8f19452f", 1600, 0.75],
  "editorial-fire": ["photo-1556910103-1c02745aae4d", 1800, 1.25],

  "dish-burger": ["photo-1568901346375-23c9450c58cd", 1400, 1.1],
  "dish-burger-2": ["photo-1550547660-d9450f859349", 1400, 1.1],
  "dish-burger-3": ["photo-1553979459-d2229ba7433b", 1400, 1.1],

  "dish-pizza": ["photo-1513104890138-7c749659a591", 1400, 1.1],
  "dish-pizza-2": ["photo-1574071318508-1cdbab80d002", 1400, 1.1],
  "dish-pizza-3": ["photo-1604382354936-07c5d9983bd3", 1400, 1.1],

  "dish-chicken": ["photo-1626082927389-6cd097cdc6ec", 1400, 1.1],
  "dish-chicken-2": ["photo-1562967914-608f82629710", 1400, 1.1],
  "dish-chicken-3": ["photo-1532550907401-a500c9a57435", 1400, 1.1],

  "dish-fries": ["photo-1573080496219-bb080dd4f877", 1400, 1.1],
  "dish-fries-2": ["photo-1518013431117-eb1465fa5752", 1400, 1.1],

  "dish-sandwich": ["photo-1528735602780-2552fd46c7af", 1400, 1.1],
  "dish-sandwich-2": ["photo-1553909489-cd47e0907980", 1400, 1.1],

  "dish-pasta": ["photo-1551183053-bf91a1d81141", 1400, 1.1],
  "dish-pasta-2": ["photo-1621996346565-e3dbc646d9a9", 1400, 1.1],
  "dish-pasta-3": ["photo-1473093295043-cdd812d0e601", 1400, 1.1],

  "dish-dessert": ["photo-1551024506-0bccd828d307", 1400, 1.1],
  "dish-dessert-2": ["photo-1497034825429-c343d7c6a68f", 1400, 1.1],
  "dish-dessert-3": ["photo-1565958011703-44f9829ba187", 1400, 1.1],

  "dish-drink": ["photo-1544145945-f90425340c7e", 1400, 1.1],
  "dish-coffee": ["photo-1495474472287-4d71bcdd2085", 1400, 1.1],
  "dish-cocktail": ["photo-1551538827-9c037cb4f32a", 1400, 1.1],
  "dish-cocktail-2": ["photo-1514362545857-3bc16c4c7d1b", 1400, 1.1],

  "dish-biryani": ["photo-1563379091339-03b21ab4a4f8", 1400, 1.1],
  "dish-shawarma": ["photo-1529193591184-b1d58069ecdd", 1400, 1.1],
  "dish-spread": ["photo-1504674900247-0877df9cc836", 1600, 1.1],

  "atmosphere-1": ["photo-1414235077428-338989a2e8c0", 1600, 1.3],
  "atmosphere-2": ["photo-1517248135467-4c7edcad34c4", 1600, 1.3],
  "atmosphere-3": ["photo-1552566626-52f8b828add9", 1600, 1.3],
  "atmosphere-4": ["photo-1559339352-11d035aa65de", 1600, 1.3],

  "prep-1": ["photo-1424847651672-bf20a4b0982b", 1400, 1.2],
  "prep-2": ["photo-1476224203421-9ac39bcb3327", 1400, 1.2],
  "prep-3": ["photo-1466637574441-749b8f19452f", 1400, 1.2],
};

async function download(id, width) {
  const url = `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;
  const response = await fetch(url, { headers: { "user-agent": "untouch-asset-pipeline" } });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.byteLength < 8000) throw new Error(`tiny payload (${buffer.byteLength}b)`);
  return buffer;
}

await mkdir(OUT, { recursive: true });
const report = [];
let failures = 0;

for (const [name, [id, width, aspect]] of Object.entries(ASSETS)) {
  const target = `${OUT}/${name}.webp`;
  if (existsSync(target)) {
    report.push(`skip  ${name}`);
    continue;
  }
  try {
    const raw = await download(id, width);
    let pipeline = sharp(raw).rotate();
    if (aspect) {
      const meta = await pipeline.metadata();
      const w = meta.width ?? width;
      const h = Math.round(w / aspect);
      pipeline = pipeline.resize(w, h, { position: "attention" });
    }
    const out = await pipeline.webp({ quality: 76, effort: 5 }).toBuffer();
    await writeFile(target, out);
    report.push(`ok    ${name}  ${(out.byteLength / 1024).toFixed(0)}kb`);
  } catch (error) {
    failures += 1;
    report.push(`FAIL  ${name}  ${error.message}`);
  }
}

console.log(report.join("\n"));
console.log(`\n${Object.keys(ASSETS).length} assets · ${failures} failures`);
if (failures) process.exitCode = 1;
