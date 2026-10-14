import { test, expect } from "@playwright/test";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import original from "./fixtures/original-site.json";

test("preserves original sections, links, images and contact details", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page).toHaveTitle("ASD Invictus Salerno — Sports Chanbara");
  await expect(page.locator("html")).toHaveAttribute("lang", "it");
  for (const id of original.sectionIds)
    await expect(page.locator(`#${id}`)).toHaveCount(1);
  const links = await page
    .locator("a")
    .evaluateAll((anchors) => anchors.map((a) => a.getAttribute("href")));
  for (const href of original.externalLinks)
    expect(links).toContain(href.replaceAll("&amp;", "&"));
  await expect(page.locator(".contact-number")).toContainText(
    "Maestro Andrea Romano",
  );
  await expect(page.locator(".contact-number strong")).toHaveText(
    "Maestro Andrea Romano",
  );
  await expect(
    page.getByRole("link", { name: "invictussalerno@libero.it" }),
  ).toHaveAttribute("href", "mailto:invictussalerno@libero.it");
  await expect(
    page.locator('.contact a[href="tel:+393887903344"]'),
  ).toHaveCount(2);
  for (const [filename, hash] of Object.entries(original.assets)) {
    const bytes = await readFile(`public/assets/${filename}`);
    expect(createHash("sha256").update(bytes).digest("hex")).toBe(hash);
    const response = await page.request.get(`/assets/${filename}`);
    expect(response.ok()).toBeTruthy();
  }
  // Force lazy images into view before checking decoding and intrinsic dimensions.
  // Exclude the clipped gallery copies in the selector, avoiding hundreds of
  // browser round-trips. Gallery integrity and visible loading have dedicated checks.
  for (const image of await page.locator("img:not(.team-carousel img)").all()) {
    await image.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        image.evaluate(
          (img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
        ),
      )
      .toBe(true);
  }
  expect(errors).toEqual([]);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: testInfo.outputPath("site.png"),
    fullPage: true,
  });
});

test("has no horizontal overflow at phone, tablet or desktop widths", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  for (const width of [320, 375, 390, 600, 768, 900, 1024, 1280, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    const sizes = await page.evaluate(() => ({
      content: document.documentElement.scrollWidth,
      viewport: window.innerWidth,
    }));
    expect(
      sizes.content,
      `horizontal overflow at ${width}px`,
    ).toBeLessThanOrEqual(sizes.viewport);
  }
});

test("mobile menu supports navigation, Escape and keyboard focus", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  const toggle = page.locator('button[aria-controls="primary-navigation"]');
  await expect(page.getByRole("navigation")).toBeHidden();
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Il corso", exact: true })
    .click();
  await expect(page).toHaveURL(/#corso$/);
  await expect(page.getByRole("navigation")).toBeHidden();
  await toggle.click();
  await page.keyboard.press("Escape");
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await page.reload();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Vai al contenuto" }),
  ).toBeFocused();
});

test("plays the training video locally without Instagram UI or requests", async ({
  page,
}, testInfo) => {
  const instagramRequests: string[] = [];
  await page.route("https://www.instagram.com/**", (route) => {
    instagramRequests.push(route.request().url());
    return route.abort();
  });
  await page.goto("/");
  await expect(page.locator("#video iframe")).toHaveCount(0);
  await expect(page.locator("#video .video-card")).toHaveCount(1);
  await expect(page.locator("#video")).not.toContainText(
    "Keep calm and play SpoChan",
  );
  await expect(page.locator("#video .source")).toHaveCount(0);
  const card = page.locator("#video .video-card");
  await expect(page.locator('#video [aria-busy="false"]')).toHaveCount(1);
  await expect(card.locator("a")).toHaveCount(0);
  const video = card.locator("video");
  await expect(video).toHaveAttribute("src", /^\/assets\/instagram\/.+\.mp4$/);
  await expect
    .poll(() => video.evaluate((element: HTMLVideoElement) => element.paused))
    .toBe(true);
  await video.scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      video.evaluate(
        (element: HTMLVideoElement) =>
          !element.paused && element.currentTime > 0 && element.videoWidth > 0,
      ),
    )
    .toBe(true);
  const toggle = card.getByRole("button");
  await expect(toggle).toHaveText("");
  const wasMuted = await video.evaluate(
    (element: HTMLVideoElement) => element.muted,
  );
  await toggle.click();
  await expect
    .poll(() => video.evaluate((element: HTMLVideoElement) => element.muted))
    .toBe(!wasMuted);
  await card.screenshot({ path: testInfo.outputPath("training-video.png") });
  await page.locator("footer").scrollIntoViewIfNeeded();
  await expect
    .poll(() => video.evaluate((element: HTMLVideoElement) => element.paused))
    .toBe(true);
  expect(instagramRequests).toEqual([]);
});

test("changes the training video on each visit and works without storage", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  // A constant random value makes immediate-repeat prevention deterministic.
  await page.addInitScript(() => {
    Math.random = () => 0;
  });
  await page.goto("/");
  let previous: string | null = null;
  for (let visit = 0; visit < 3; visit++) {
    if (visit) await page.reload();
    await expect(page.locator('#video [aria-busy="false"]')).toHaveCount(1);
    const video = page.locator("#video video");
    const source = (await video.getAttribute("src")) ?? "";
    expect(source).toMatch(/^\/assets\/instagram\/.+\.mp4$/);
    expect(source).not.toBe(previous);
    expect(source).not.toContain("ChxGeEmOtgY");
    await video.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        video.evaluate(
          (element: HTMLVideoElement) =>
            !element.paused && element.videoWidth > 0,
        ),
      )
      .toBe(true);
    await page.locator("footer").scrollIntoViewIfNeeded();
    await expect(video).toHaveAttribute("src", source);
    previous = source;
  }
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("Storage disabled", "SecurityError");
      },
    });
  });
  await page.reload();
  await expect(page.locator('#video [aria-busy="false"]')).toHaveCount(1);
  const video = page.locator("#video video");
  await video.scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      video.evaluate(
        (element: HTMLVideoElement) =>
          !element.paused && element.videoWidth > 0,
      ),
    )
    .toBe(true);
  expect(errors).toEqual([]);
});

test("keeps course content and contact links usable without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("http://localhost:3000/");
  await expect(page.locator("#corso")).toContainText("Tetsundo Tanabe");
  await expect(
    page.getByRole("link", { name: "invictussalerno@libero.it" }),
  ).toBeVisible();
  await expect(
    page.locator('.contact a[href="https://wa.me/393887903344"]'),
  ).toBeVisible();
  await context.close();
});
