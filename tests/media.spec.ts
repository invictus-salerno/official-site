import { expect, test } from "@playwright/test";
import archive from "../src/data/instagram-media.json";

declare global {
  interface Window {
    heroAttempts: { at: number; muted: boolean }[];
  }
}

const media = archive.posts.flatMap((post) => post.media);

test("applies the requested navigation, hero and ribbon text changes", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".brand > span")).toHaveText("INVICTUS");
  await expect(page.locator("header")).not.toContainText(
    "SALERNO · SPOCHAN TEAM",
  );
  await expect(page.locator('header a[href="#contatti"]')).toHaveCount(0);
  await expect(page.locator(".hero .eyebrow")).toHaveCount(0);
  await expect(page.locator(".hero")).not.toContainText("CORSO PER ADULTI");
  await expect(page.locator(".hero-visual img")).toHaveCount(0);
  await expect(page.locator(".ribbon")).toHaveText(
    "ASD INVICTUS SALERNO ✦ NOT JUST A TEAM",
  );
  await expect(page.locator('.course a[href="#orari"]')).toContainText(
    "Allenati con noi",
  );
});

test("attempts the hero after one second and handles browsers blocking sound", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const attempts: { at: number; muted: boolean }[] = [];
    Object.defineProperty(window, "heroAttempts", { value: attempts });
    const originalPlay = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
      if (!this.classList.contains("hero-video"))
        return originalPlay.call(this);
      attempts.push({ at: performance.now(), muted: this.muted });
      if (!this.muted && attempts.length === 1)
        return Promise.reject(
          new DOMException("Autoplay requires a gesture", "NotAllowedError"),
        );
      return Promise.resolve();
    };
  });
  await page.goto("/");
  const video = page.locator(".hero-video");
  const audioToggle = page.locator(".hero-visual .video-audio-toggle");
  await expect(audioToggle).toHaveAccessibleName("Attiva audio");
  await expect(audioToggle).toHaveAttribute("aria-pressed", "false");
  await expect(audioToggle).toHaveText("");
  await expect(audioToggle.locator("svg path")).toHaveCount(2);
  await expect(page.locator(".hero-visual a")).toHaveCount(0);
  const placement = await audioToggle.evaluate((button) => {
    const control = button.getBoundingClientRect();
    const player = button.parentElement!.getBoundingClientRect();
    return {
      left: control.left - player.left,
      bottom: player.bottom - control.bottom,
      width: control.width,
      height: control.height,
    };
  });
  expect(placement.left).toBeGreaterThanOrEqual(16);
  expect(placement.left).toBeLessThanOrEqual(17);
  expect(placement.bottom).toBe(16);
  expect(placement.width).toBeGreaterThanOrEqual(44);
  expect(placement.height).toBeGreaterThanOrEqual(44);
  const attempts = await page.evaluate(() => window.heroAttempts);
  expect(attempts[0].at).toBeGreaterThanOrEqual(1000);
  expect(attempts[0].muted).toBe(false);
  expect(attempts.some((attempt) => attempt.muted)).toBe(true);
  expect(
    await video.evaluate((element: HTMLVideoElement) => element.volume),
  ).toBe(1);
  await audioToggle.click();
  expect(
    await video.evaluate((element: HTMLVideoElement) => element.muted),
  ).toBe(false);
  await expect(audioToggle).toHaveAccessibleName("Disattiva audio");
  await expect(audioToggle).toHaveAttribute("aria-pressed", "true");
  await expect(audioToggle.locator("svg path")).toHaveCount(3);
  await audioToggle.click();
  await expect(audioToggle).toHaveAccessibleName("Attiva audio");
  await expect(audioToggle).toHaveAttribute("aria-pressed", "false");
  expect(
    await video.evaluate((element: HTMLVideoElement) => element.muted),
  ).toBe(true);
});

test("includes all media in a seamless duplicated track and supports keyboard navigation", async ({
  page,
}) => {
  await page.goto("/#team");
  const carousel = page.getByRole("region", {
    name: "Foto e video del team dal 2020",
  });
  await carousel.scrollIntoViewIfNeeded();
  const groups = carousel.locator(".carousel-group");
  await expect(groups).toHaveCount(2);
  await expect(groups.first().locator("figure")).toHaveCount(media.length);
  await expect(groups.last().locator("figure")).toHaveCount(media.length);
  await expect(groups.last()).toHaveAttribute("aria-hidden", "true");
  expect(await groups.last().locator('a:not([tabindex="-1"])').count()).toBe(0);
  const widths = await groups.evaluateAll((nodes) =>
    nodes.map((node) => node.getBoundingClientRect().width),
  );
  expect(widths[0]).toBe(widths[1]);
  await expect(carousel.getByRole("button")).toHaveCount(0);
  await expect(carousel.locator(".carousel-counter")).toHaveText(
    `1 / ${media.length}`,
  );
  await carousel.focus();
  await page.keyboard.press("ArrowRight");
  await expect(carousel.locator(".carousel-counter")).toHaveText(
    `2 / ${media.length}`,
  );
  await expect
    .poll(() =>
      groups
        .first()
        .locator("figure")
        .nth(1)
        .locator("img")
        .evaluate(
          (img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
        ),
    )
    .toBe(true);
  await page.keyboard.press("ArrowLeft");
  await expect(carousel.locator(".carousel-counter")).toHaveText(
    `1 / ${media.length}`,
  );
  await page.keyboard.press("ArrowLeft");
  await expect(carousel.locator(".carousel-counter")).toHaveText(
    `${media.length} / ${media.length}`,
  );
  await expect(
    groups.first().locator("figure").last().locator("time"),
  ).toHaveAttribute("datetime", "2020-03-02");
  const seamOffset = await carousel
    .locator(".infinite-scroll")
    .evaluate((element) => {
      const animation = element.getAnimations()[0];
      const duration = Number(animation.effect?.getComputedTiming().duration);
      animation.currentTime = duration - 0.01;
      const before =
        element.children[1].firstElementChild!.getBoundingClientRect().x;
      animation.currentTime = duration + 0.01;
      const after =
        element.children[0].firstElementChild!.getBoundingClientRect().x;
      return Math.abs(before - after);
    });
  expect(seamOffset).toBeLessThan(1);
});

test("supports horizontal swipes on mobile without taking over vertical scrolling", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 812 });
  await page.goto("/#team");
  const carousel = page.locator(".team-carousel");
  const viewport = carousel.locator(".scroll-container");
  await expect(carousel.locator("video").first()).toBeVisible();
  expect((await carousel.locator("figure").first().boundingBox())?.width).toBe(
    192,
  );
  await viewport.dispatchEvent("touchstart", {
    touches: [{ identifier: 1, clientX: 280, clientY: 100 }],
  });
  await viewport.dispatchEvent("touchend", {
    changedTouches: [{ identifier: 1, clientX: 120, clientY: 100 }],
  });
  await expect(carousel.locator(".carousel-counter")).toHaveText(
    `2 / ${media.length}`,
  );
  await viewport.dispatchEvent("touchstart", {
    touches: [{ identifier: 2, clientX: 150, clientY: 280 }],
  });
  await viewport.dispatchEvent("touchend", {
    changedTouches: [{ identifier: 2, clientX: 140, clientY: 100 }],
  });
  await expect(carousel.locator(".carousel-counter")).toHaveText(
    `2 / ${media.length}`,
  );
});

test("scrolls continuously at half demo speed and pauses motion on focus", async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const carousel = page.locator(".team-carousel");
  await expect(carousel.locator("video")).toHaveCount(0);
  await carousel.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  const video = carousel
    .locator(".carousel-group")
    .first()
    .locator("figure")
    .first()
    .locator("video");
  await expect
    .poll(() =>
      video.evaluate(
        (element: HTMLVideoElement) =>
          !element.paused && element.currentTime > 0,
      ),
    )
    .toBe(true);
  expect(
    await video.evaluate((element: HTMLVideoElement) => element.muted),
  ).toBe(true);
  const track = carousel.locator(".infinite-scroll");
  expect(
    await track.evaluate(
      (element) => getComputedStyle(element).animationTimingFunction,
    ),
  ).toBe("linear");
  const duration = await track.evaluate(
    (element) =>
      element.getAnimations()[0].effect?.getComputedTiming().duration,
  );
  expect(duration).toBe(media.length * 5000);
  expect((Number(duration) / media.length) * 8).toBe(40000);
  const start = await track.evaluate((element) =>
    Number(element.getAnimations()[0].currentTime),
  );
  await expect
    .poll(() =>
      track.evaluate((element) =>
        Number(element.getAnimations()[0].currentTime),
      ),
    )
    .toBeGreaterThan(start + 100);
  await carousel.focus();
  await expect
    .poll(() =>
      track.evaluate((element) => element.getAnimations()[0].playState),
    )
    .toBe("paused");
  // Navigation is relative to the animation, so establish a fixed position
  // after pausing rather than assuming the earlier checks took under five seconds.
  await track.evaluate((element) => {
    element.getAnimations()[0].currentTime = 0;
  });
  await page.keyboard.press("ArrowRight");
  await expect(carousel.locator(".carousel-counter")).toHaveText(
    `2 / ${media.length}`,
  );
  await expect(
    carousel
      .locator(".carousel-group")
      .first()
      .locator("figure")
      .first()
      .locator("video"),
  ).toHaveCount(0);
  await page.clock.install();
  await page.clock.fastForward(6000);
  await expect(carousel.locator(".carousel-counter")).toHaveText(
    `2 / ${media.length}`,
  );
  await page.locator(".source a").first().focus();
  await page.mouse.move(0, 0);
  await track.evaluate((element) => {
    element.getAnimations()[0].currentTime = 10000;
  });
  await page.clock.fastForward(300);
  await expect(carousel.locator(".carousel-counter")).toHaveText(
    `3 / ${media.length}`,
  );
  await carousel.screenshot({ path: testInfo.outputPath("carousel.png") });
  await page.locator("footer").scrollIntoViewIfNeeded();
  await expect(carousel.locator("video")).toHaveCount(0);
});

test("decodes every locally playable reel in the browser", async ({ page }) => {
  test.setTimeout(60000);
  await page.goto("/");
  const native = media.filter(
    (item) =>
      item.kind === "video" && "playback" in item && item.playback === "native",
  );
  for (const item of native) {
    const result = await page.evaluate(async (src) => {
      const video = document.createElement("video");
      video.muted = true;
      video.playsInline = true;
      video.src = `/assets/${src}`;
      document.body.append(video);
      try {
        await video.play();
        return {
          width: video.videoWidth,
          duration: video.duration,
          error: video.error?.message,
        };
      } finally {
        video.pause();
        video.removeAttribute("src");
        video.load();
        video.remove();
      }
    }, item.src);
    expect(result.width, item.src).toBeGreaterThan(0);
    expect(result.duration, item.src).toBeGreaterThan(0);
    expect(result.error, item.src).toBeUndefined();
  }
});

test("retains restricted videos as linked covers without pretending they autoplay", async ({
  page,
}) => {
  await page.goto("/#team");
  const carousel = page.locator(".team-carousel");
  const restrictedIndex = media.findIndex(
    (item) => "playback" in item && item.playback === "instagram",
  );
  await carousel.focus();
  for (let index = 0; index < restrictedIndex; index++)
    await page.keyboard.press("ArrowRight");
  const card = carousel
    .locator(".carousel-group")
    .first()
    .locator("figure")
    .nth(restrictedIndex);
  const link = card.getByRole("link", { name: "Guarda il video su Instagram" });
  await expect(link).toBeInViewport();
  await expect(card.locator("video")).toHaveCount(0);
  await expect(link).toHaveAttribute("target", "_blank");
  await expect
    .poll(() =>
      card
        .locator("img")
        .evaluate(
          (img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
        ),
    )
    .toBe(true);
});
