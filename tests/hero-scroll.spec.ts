import { expect, test } from "@playwright/test";

test("shrinks the headline and brings the playing video forward on native scroll", async ({
  page,
}, testInfo) => {
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
  await page.evaluate(() => document.fonts.ready);
  const hero = page.locator(".hero-scroll");
  const player = hero.locator(".hero-visual");
  const video = hero.locator("video");
  const title = hero.locator("h1");
  const audio = player.getByRole("button");
  await expect
    .poll(() =>
      hero.evaluate((element) =>
        element.style.getPropertyValue("--hero-progress"),
      ),
    )
    .toBe("0");
  await expect(hero).toHaveAttribute("data-foreground", "false");
  await expect(audio).toBeHidden();
  expect(
    await video.evaluate((element: HTMLVideoElement) => element.paused),
  ).toBe(true);
  const viewportAtStart = page.viewportSize()!;
  await expect(title.locator(".hero-title-line")).toHaveCount(3);
  await expect(title.locator(".hero-title-reveal").first()).toHaveCSS(
    "animation-name",
    "hero-title-enter",
  );
  await hero.evaluate(async (element) => {
    await Promise.all(
      element
        .getAnimations({ subtree: true })
        .map((animation) => animation.finished),
    );
  });
  await expect(title.locator(".hero-title-reveal").last()).toHaveCSS(
    "opacity",
    "1",
  );
  const initialTitle = await title.boundingBox();
  const initialVideo = await player.boundingBox();
  await expect(video).not.toHaveAttribute("data-first-play-muted");
  if (viewportAtStart.width <= 600) {
    expect(
      Math.abs(
        initialVideo!.x + initialVideo!.width / 2 - viewportAtStart.width / 2,
      ),
    ).toBeLessThan(1);
    const heading = (await hero.locator(".hero-copy-heading").boundingBox())!;
    const actions = (await hero.locator(".hero-copy-actions").boundingBox())!;
    expect(initialVideo!.y).toBeGreaterThanOrEqual(
      heading.y + heading.height + 15,
    );
    expect(initialVideo!.y + initialVideo!.height).toBeLessThanOrEqual(
      actions.y - 15,
    );
    expect(initialVideo!.y + initialVideo!.height).toBeLessThanOrEqual(
      viewportAtStart.height,
    );
  }
  await page.screenshot({ path: testInfo.outputPath("hero-initial.png") });

  const scrollToProgress = async (progress: number) => {
    await hero.evaluate((element, progress) => {
      const stage = element.querySelector<HTMLElement>(".hero-stage")!;
      window.scrollTo({
        top:
          element.getBoundingClientRect().top +
          window.scrollY +
          (element.clientHeight - stage.clientHeight) * progress,
        behavior: "instant",
      });
    }, progress);
  };
  await scrollToProgress(0.2);
  await expect(hero).toHaveAttribute("data-foreground", "false");
  expect(
    await video.evaluate((element: HTMLVideoElement) => element.paused),
  ).toBe(true);
  if (viewportAtStart.width <= 600) {
    await expect
      .poll(async () => {
        const box = (await player.boundingBox())!;
        return Math.abs(box.x + box.width / 2 - viewportAtStart.width / 2);
      })
      .toBeLessThan(1);
  }
  await scrollToProgress(0.7);
  await expect(hero).toHaveAttribute("data-foreground", "true");
  await expect
    .poll(() =>
      video.evaluate(
        (element: HTMLVideoElement) =>
          !element.paused && element.currentTime > 0,
      ),
    )
    .toBe(true);
  await expect(video).toHaveAttribute("data-first-play-muted", "false");
  await expect
    .poll(async () => (await title.boundingBox())!.width)
    .toBeLessThan(initialTitle!.width * 0.8);
  expect((await player.boundingBox())!.width).toBeGreaterThan(
    initialVideo!.width * 1.2,
  );
  await expect(audio).toBeVisible();
  const audioBox = await audio.boundingBox();
  expect(audioBox!.width).toBeCloseTo(48, 0);
  expect(audioBox!.height).toBeCloseTo(48, 0);
  await page.screenshot({ path: testInfo.outputPath("hero-mid-scroll.png") });

  await scrollToProgress(1);
  await expect
    .poll(() =>
      hero.evaluate((element) =>
        Number(element.style.getPropertyValue("--hero-progress")),
      ),
    )
    .toBeGreaterThan(0.99);
  const finalVideo = (await player.boundingBox())!;
  const viewport = page.viewportSize()!;
  expect(
    Math.abs(finalVideo.x + finalVideo.width / 2 - viewport.width / 2),
  ).toBeLessThan(1);
  expect(finalVideo.x).toBeGreaterThanOrEqual(0);
  expect(finalVideo.y).toBeGreaterThanOrEqual(0);
  expect(finalVideo.x + finalVideo.width).toBeLessThanOrEqual(viewport.width);
  expect(finalVideo.y + finalVideo.height).toBeLessThanOrEqual(viewport.height);
  await page.screenshot({ path: testInfo.outputPath("hero-foreground.png") });

  // A faded link becomes readable again before keyboard focus reaches it.
  await hero.locator(".hero-copy .button").focus();
  await expect
    .poll(() =>
      hero.evaluate((element) =>
        Number(element.style.getPropertyValue("--hero-progress")),
      ),
    )
    .toBe(0);
  await expect
    .poll(() => video.evaluate((element: HTMLVideoElement) => element.paused))
    .toBe(true);
  await expect(hero.locator(".hero-copy .button")).toBeFocused();

  // Recompute the scene after phone rotation and on the smallest supported screen.
  for (const viewport of [
    { width: 320, height: 568 },
    { width: 844, height: 390 },
  ]) {
    await page.locator(".hero-copy .button").blur();
    await page.setViewportSize(viewport);
    await scrollToProgress(1);
    await expect
      .poll(async () => {
        const box = (await player.boundingBox())!;
        return Math.abs(box.x + box.width / 2 - viewport.width / 2);
      })
      .toBeLessThan(1);
    const box = (await player.boundingBox())!;
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
    expect((await audio.boundingBox())!.width).toBeCloseTo(48, 0);
    await page.screenshot({
      path: testInfo.outputPath(
        `hero-${viewport.width}x${viewport.height}.png`,
      ),
    });
  }
});

test("respects reduced motion and centers the footer signature below its links", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  await expect(page.locator(".hero-stage")).toHaveCSS("display", "contents");
  await expect(page.locator(".hero h1")).toHaveCSS("transform", "none");
  await expect(page.locator(".hero-title-reveal").first()).toHaveCSS(
    "animation-name",
    "none",
  );
  await expect(page.locator(".hero-video")).toHaveCSS("animation-name", "none");
  await expect(page.locator(".hero")).toHaveAttribute(
    "data-foreground",
    "true",
  );
  await expect(page.locator(".carousel-toolbar")).toHaveText(
    "I nostri successi dal 2020",
  );
  const footer = page.locator("footer");
  const signature = footer.locator(".footer-signature");
  await expect(signature).toHaveText("ASD Invictus since 2015");
  await footer.scrollIntoViewIfNeeded();
  const boxes = await signature.evaluate((element) => {
    const text = element.getBoundingClientRect();
    const footer = element.closest("footer")!;
    const bounds = footer.getBoundingClientRect();
    const socials = footer
      .querySelector(".footer-socials")!
      .getBoundingClientRect();
    return {
      center: text.x + text.width / 2,
      footerCenter: bounds.x + bounds.width / 2,
      top: text.top,
      socialsBottom: socials.bottom,
    };
  });
  expect(Math.abs(boxes.center - boxes.footerCenter)).toBeLessThan(1);
  expect(boxes.top).toBeGreaterThan(boxes.socialsBottom);
  await expect(
    footer.getByRole("link", { name: "Instagram di ASD Invictus Salerno" }),
  ).toBeVisible();
  await expect(
    footer.getByRole("link", {
      name: "Chat WhatsApp con Maestro Andrea Romano",
    }),
  ).toBeVisible();
  await footer.screenshot({ path: testInfo.outputPath("footer.png") });
});
