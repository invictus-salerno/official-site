import { expect, test } from "@playwright/test";

test("reveals every section heading with the same impact animation and retains the map", async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.route("https://maps.google.com/**", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: "<html lang='it'><body>Mappa della Polisportiva Linus a Salerno</body></html>",
    }),
  );
  await page.goto("/");
  const headings = page.locator("h2.animated-heading");
  await expect(headings).toHaveCount(6);
  await expect(page.locator("#dove-siamo h2")).not.toHaveAttribute(
    "data-revealed",
  );
  for (const heading of await headings.all()) {
    await heading.scrollIntoViewIfNeeded();
    await expect(heading).toHaveAttribute("data-revealed", "true");
    const lines = heading.locator(".heading-reveal");
    await expect(lines.first()).toHaveCSS(
      "animation-name",
      "heading-impact-enter",
    );
    await expect(lines.first()).toHaveCSS("animation-duration", "0.48s");
    await heading.evaluate(async (element) => {
      await Promise.all(
        element
          .getAnimations({ subtree: true })
          .map((animation) => animation.finished),
      );
    });
    await expect(lines.last()).toHaveCSS("opacity", "1");
  }
  await page.locator("#dove-siamo").scrollIntoViewIfNeeded();
  const map = page.getByTitle("Mappa della Polisportiva Linus a Salerno", {
    exact: true,
  });
  await expect(map).toHaveAttribute("loading", "lazy");
  const url = new URL((await map.getAttribute("src"))!);
  expect(url.searchParams.get("q")).toBe(
    "Polisportiva Linus, Viale delle Querce 1, Salerno",
  );
  expect(url.searchParams.get("output")).toBe("embed");
  await expect(map.contentFrame().locator("body")).toContainText(
    "Polisportiva Linus",
  );
  const bounds = (await map.boundingBox())!;
  expect(bounds.x).toBeGreaterThanOrEqual(0);
  expect(bounds.width).toBeGreaterThan(200);
  expect(bounds.height).toBeGreaterThanOrEqual(240);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(
    page.viewportSize()!.width,
  );
  await expect(page.locator("#dove-siamo a")).toHaveAttribute(
    "href",
    /google.com\/maps\/search/,
  );
  await page
    .locator("#dove-siamo")
    .screenshot({ path: testInfo.outputPath("location-map.png") });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(headings.first().locator(".heading-reveal").first()).toHaveCSS(
    "animation-name",
    "none",
  );
});
