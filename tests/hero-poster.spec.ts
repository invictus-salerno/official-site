import { expect, test } from "@playwright/test";

test.use({
  launchOptions: { args: ["--autoplay-policy=user-gesture-required"] },
});

test("starts the poster without a timer and keeps sound while scrolling", async ({
  page,
}, testInfo) => {
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now() + 1000));
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.addInitScript(() => {
    const originalPlay = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
      if (this.classList.contains("hero-video") && !this.dataset.firstPlayMuted)
        this.dataset.firstPlayMuted = String(this.muted);
      return originalPlay.call(this);
    };
  });
  await page.goto("/");
  const hero = page.locator(".hero-poster");
  const video = hero.locator("video");
  // No clock advancement: playback must not depend on a timeout or intro completion.
  await expect(video).toHaveAttribute("data-first-play-muted", "false");
  await expect(video).toHaveAttribute("autoplay", "");
  await expect(video).toHaveAttribute("preload", "auto");
  await expect(video).toHaveCSS("animation-name", "hero-poster-in");
  await expect(hero.locator(".intro")).toHaveCount(0);
  await expect(page.locator("#corso .course-tagline")).toHaveText(
    "Sports Chanbara. Una passione da condividere.",
  );
  await page.clock.resume();
  const audio = hero.getByRole("button");
  await expect
    .poll(() =>
      video.evaluate(
        (element: HTMLVideoElement) =>
          !element.paused && element.currentTime > 0,
      ),
    )
    .toBe(true);
  if (await video.evaluate((element: HTMLVideoElement) => element.muted))
    await audio.click();
  await expect
    .poll(() =>
      video.evaluate(
        (element: HTMLVideoElement) =>
          !element.paused && !element.muted && element.currentTime > 0,
      ),
    )
    .toBe(true);
  await page.screenshot({ path: testInfo.outputPath("poster-ready.png") });
  await page.locator("footer").scrollIntoViewIfNeeded();
  const before = await video.evaluate(
    (element: HTMLVideoElement) => element.currentTime,
  );
  await expect
    .poll(() =>
      video.evaluate(
        (element: HTMLVideoElement) => !element.paused && !element.muted,
      ),
    )
    .toBe(true);
  await expect
    .poll(() =>
      video.evaluate((element: HTMLVideoElement) => element.currentTime),
    )
    .not.toBe(before);
  await audio.click();
  await expect(audio).toHaveAccessibleName("Attiva audio");
  await page.locator("footer").scrollIntoViewIfNeeded();
  await expect
    .poll(() => video.evaluate((element: HTMLVideoElement) => element.muted))
    .toBe(true);
});

test("prioritizes the video across small screens and landscape with reduced motion", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  const hero = page.locator(".hero-poster");
  await expect(hero.locator("video")).toHaveCSS("animation-name", "none");
  await expect(hero.locator(".hero-title-reveal").first()).toHaveCSS(
    "animation-name",
    "none",
  );
  for (const viewport of [
    { width: 320, height: 568 },
    { width: 390, height: 844 },
    { width: 844, height: 390 },
  ]) {
    await page.setViewportSize(viewport);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    const heading = (await hero.locator(".hero-copy-heading").boundingBox())!;
    const actions = (await hero.locator(".hero-copy-actions").boundingBox())!;
    expect(heading.x).toBeGreaterThanOrEqual(0);
    expect(heading.x + heading.width).toBeLessThanOrEqual(viewport.width);
    expect(heading.y + heading.height).toBeLessThan(actions.y);
    expect(
      await hero
        .locator("h1")
        .evaluate((element) => parseFloat(getComputedStyle(element).fontSize)),
    ).toBeLessThanOrEqual(42);
    const player = (await hero.locator(".hero-visual").boundingBox())!;
    if (viewport.width <= 600) expect(player.width).toBe(viewport.width);
    const audio = (await hero.getByRole("button").boundingBox())!;
    expect(audio.width).toBe(48);
    const stage = (await hero.locator(".hero-stage").boundingBox())!;
    expect(actions.y).toBeGreaterThanOrEqual(stage.y + stage.height);
    expect(heading.x).toBeCloseTo(viewport.width * 0.06, 0);
    expect(heading.y - stage.y).toBeLessThanOrEqual(90);
    await expect(hero.locator(".button")).toBeVisible();
    await expect(hero.locator(".hero-foot a")).toBeVisible();
    const video = hero.locator("video");
    await expect
      .poll(() =>
        video.evaluate((element: HTMLVideoElement) => element.readyState),
      )
      .toBeGreaterThanOrEqual(1);
    await video.evaluate(async (element: HTMLVideoElement) => {
      element.pause();
      await new Promise<void>((resolve) => {
        element.addEventListener("seeked", () => resolve(), { once: true });
        element.currentTime = element.duration - 1;
      });
    });
    const visibleSource = await video.evaluate((element: HTMLVideoElement) => {
      const scale = Math.max(
        element.clientWidth / element.videoWidth,
        element.clientHeight / element.videoHeight,
      );
      return (
        element.parentElement!.clientHeight / (element.videoHeight * scale)
      );
    });
    expect(visibleSource).toBeLessThanOrEqual(0.831);
    await hero.screenshot({
      path: testInfo.outputPath(`poster-${viewport.width}.png`),
    });
  }
});
