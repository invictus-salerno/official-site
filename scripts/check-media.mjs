import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { log } from "node:console";

const archive = JSON.parse(
  await readFile("src/data/instagram-media.json", "utf8"),
);
assert.equal(archive.from, "2020-01-01");
assert.equal(
  archive.complete,
  true,
  "L’importazione dello storico deve essere completa.",
);
assert(archive.historyVerifiedThrough < archive.from);
assert.deepEqual(archive.unavailable, []);
assert.equal(
  archive.posts.length,
  43,
  "Snapshot verificato del profilo: 43 post dal 2020.",
);
const ids = new Set();
let photos = 0;
let videos = 0;
let restricted = 0;
for (const post of archive.posts) {
  assert(post.publishedAt >= archive.from);
  assert.match(
    post.permalink,
    /^https:\/\/www\.instagram\.com\/asdinvictus_salerno\/(p|reel)\/[\w-]+\/$/,
  );
  assert(post.media.length > 0);
  for (const media of post.media) {
    assert(!ids.has(media.id), `Media duplicato: ${media.id}`);
    ids.add(media.id);
    assert.match(media.src, /^instagram\/[\w-]+-\d+\.(jpg|png|webp|mp4)$/);
    assert(media.width > 0 && media.height > 0);
    const bytes = await readFile(`public/assets/${media.src}`);
    assert.equal(bytes.length, media.bytes);
    assert.equal(
      createHash("sha256").update(bytes).digest("hex"),
      media.sha256,
    );
    if (media.poster) {
      assert.match(
        media.poster.src,
        /^instagram\/[\w-]+-\d+-poster\.(jpg|png|webp)$/,
      );
      const poster = await readFile(`public/assets/${media.poster.src}`);
      assert.equal(poster.length, media.poster.bytes);
      assert.equal(
        createHash("sha256").update(poster).digest("hex"),
        media.poster.sha256,
      );
    }
    if (media.kind === "video") {
      videos++;
      if (media.playback === "instagram") {
        restricted++;
        assert.match(media.restriction, /copyright_blocked=true/);
        assert(!media.src.endsWith(".mp4"));
      } else {
        assert.equal(media.playback, "native");
        assert.equal(bytes.subarray(4, 8).toString(), "ftyp");
      }
    } else {
      photos++;
    }
  }
}
const hero = await readFile("public/assets/keep-calm-and-play-spochan.mp4");
const reel = await readFile("public/assets/instagram/ChxGeEmOtgY-01.mp4");
assert(hero.equals(reel), "L’hero deve riprodurre il reel richiesto.");
log(
  `Media verificati: ${archive.posts.length} post, ${photos} foto, ${videos} video (${restricted} su Instagram), ${ids.size} elementi, hash integri.`,
);
