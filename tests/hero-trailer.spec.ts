import { expect, test } from "@playwright/test";

test("reveals the trailer scene before starting the video with audio on", async ({
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
  const hero = page.locator(".hero-trailer");
  const player = hero.locator(".hero-visual");
  const video = hero.locator("video");
  const title = hero.locator("h1");
  await expect(hero).toHaveAttribute("data-entered", "true");
  await expect(hero).toHaveAttribute("data-ready", "false");
  await expect(player).toHaveCSS("animation-name", "hero-curtain-open");
  await expect(hero.locator(".hero-stage")).toHaveCSS("position", "relative");
  expect(
    await video.evaluate((element: HTMLVideoElement) => element.paused),
  ).toBe(true);
  await expect(video).not.toHaveAttribute("data-first-play-muted");
  await expect(hero.locator(".intro")).toHaveCount(0);
  await expect(page.locator("#corso .course-tagline")).toHaveText(
    "Sports Chanbara. Una passione da condividere.",
  );
  await hero.evaluate((element) => {
    for (const animation of element.getAnimations({ subtree: true })) {
      animation.pause();
      animation.currentTime = 0;
    }
  });
  await page.screenshot({ path: testInfo.outputPath("trailer-title.png") });
  await hero.evaluate((element) => {
    for (const animation of element.getAnimations({ subtree: true }))
      animation.currentTime = 700;
  });
  await page.screenshot({ path: testInfo.outputPath("trailer-opening.png") });
  await hero.evaluate((element) => {
    for (const animation of element.getAnimations({ subtree: true }))
      animation.finish();
  });
  await page.clock.fastForward(1400);
  await page.clock.runFor(100);
  await expect(hero).toHaveAttribute("data-ready", "true");
  await expect(video).toHaveAttribute("data-first-play-muted", "false");
  const audio = player.getByRole("button");
  if ((await audio.getAttribute("data-autoplay-blocked")) === "true")
    await audio.click();
  await expect
    .poll(() =>
      video.evaluate(
        (element: HTMLVideoElement) =>
          !element.paused && element.currentTime > 0,
      ),
    )
    .toBe(true);
  await expect(title.locator(".hero-title-line")).toHaveCount(3);
  await expect(hero.locator(".hero-copy-heading")).toHaveCSS(
    "transform",
    "none",
  );
  await expect(player).toHaveCSS("clip-path", "none");
  await expect(audio).toBeVisible();
  expect((await audio.boundingBox())!.width).toBe(48);
  const headingBox = (await hero.locator(".hero-copy-heading").boundingBox())!;
  const actionsBox = (await hero.locator(".hero-copy-actions").boundingBox())!;
  expect(headingBox.y + headingBox.height).toBeLessThan(actionsBox.y);
  expect(headingBox.x).toBeLessThan(page.viewportSize()!.width * 0.15);
  await page.screenshot({ path: testInfo.outputPath("trailer-ready.png") });
  await page.locator("footer").scrollIntoViewIfNeeded();
  await expect
    .poll(() => video.evaluate((element: HTMLVideoElement) => element.paused))
    .toBe(true);
});

test("keeps the trailer usable with reduced motion, small screens and landscape", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  const hero = page.locator(".hero-trailer");
  await expect(hero).toHaveAttribute("data-ready", "true");
  await expect(hero.locator(".hero-visual")).toHaveCSS(
    "animation-name",
    "none",
  );
  await expect(hero.locator(".hero-title-reveal").first()).toHaveCSS(
    "animation-name",
    "none",
  );
  for (const viewport of [
    { width: 320, height: 568 },
    { width: 844, height: 390 },
  ]) {
    await page.setViewportSize(viewport);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    const heading = (await hero.locator(".hero-copy-heading").boundingBox())!;
    const actions = (await hero.locator(".hero-copy-actions").boundingBox())!;
    expect(heading.x).toBeGreaterThanOrEqual(0);
    expect(heading.x + heading.width).toBeLessThanOrEqual(viewport.width);
    expect(heading.y + heading.height).toBeLessThan(actions.y);
    await expect(hero.locator(".button")).toBeVisible();
    await expect(hero.locator(".hero-foot a")).toBeVisible();
    await hero.screenshot({
      path: testInfo.outputPath(`trailer-${viewport.width}.png`),
    });
  }
  const footer = page.locator("footer");
  await expect(footer.locator(".footer-signature")).toHaveText(
    "ASD Invictus since 2015",
  );
  await footer.scrollIntoViewIfNeeded();
  await expect(
    footer.getByRole("link", { name: "Instagram di ASD Invictus Salerno" }),
  ).toBeVisible();
  await expect(
    footer.getByRole("link", {
      name: "Chat WhatsApp con Maestro Andrea Romano",
    }),
  ).toBeVisible();
});
