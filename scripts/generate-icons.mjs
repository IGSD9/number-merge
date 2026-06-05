import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, "../public/icons");

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="#4f46e5"/>
  <text x="256" y="300" text-anchor="middle" font-family="system-ui,sans-serif" font-size="200" font-weight="700" fill="#ffffff">NM</text>
</svg>
`;

async function generateIcon(size) {
  const buffer = await sharp(Buffer.from(svg)).resize(size, size).png().toBuffer();
  await writeFile(join(iconsDir, `icon-${size}.png`), buffer);
}

await mkdir(iconsDir, { recursive: true });
await generateIcon(192);
await generateIcon(512);
console.log("Generated public/icons/icon-192.png and icon-512.png");
