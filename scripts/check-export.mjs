import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import process from "node:process";
import { log } from "node:console";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const html = await readFile("out/index.html", "utf8");
const resources = [
  ...html.matchAll(
    /<(?:img|video|source|script|link)\b[^>]*\b(?:src|href)="([^"]+)"/g,
  ),
]
  .map((match) => match[1])
  .filter((url) => url.startsWith("/"));

assert(resources.length > 0, "La build deve contenere risorse locali.");
for (const url of new Set(resources)) {
  assert(url.startsWith(`${basePath}/`), `Prefisso di hosting errato: ${url}`);
  const path = decodeURIComponent(url.slice(basePath.length).split("?")[0]);
  await access(join("out", path));
}
await access("out/.nojekyll");
await access("out/404.html");
const archive = JSON.parse(
  await readFile("src/data/instagram-media.json", "utf8"),
);
for (const post of archive.posts) {
  for (const media of post.media) {
    await access(join("out/assets", media.src));
    if (media.poster) await access(join("out/assets", media.poster.src));
  }
}
log(
  `Export verificato: ${resources.length} riferimenti locali, prefisso ${basePath || "/"}, pagina 404 e .nojekyll presenti.`,
);
