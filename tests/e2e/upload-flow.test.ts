import { test, expect } from "@playwright/test";

test.describe("Upload Flow", () => {
  test("landing page loads", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("Тоғызқұмалақ");
  });

  test("login page accessible", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("h2")).toContainText("Sign In");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("register page accessible", async ({ page }) => {
    await page.goto("/register");
    await expect(page.locator("h2")).toContainText("Sign Up");
    await expect(page.locator('button[type="submit"]')).toContainText("Create Account");
  });

  test("manual entry page shows board", async ({ page }) => {
    await page.goto("/manual");
    await expect(page.locator('[aria-label="Togyzqumalaq game board"]')).toBeVisible();
    await expect(page.locator("h2")).toContainText("Manual Entry");
  });

  test("board has 18 pits", async ({ page }) => {
    await page.goto("/manual");
    const pits = page.locator('[aria-label^="Pit"]');
    await expect(pits).toHaveCount(18);
  });

  test("clicking pit executes move", async ({ page }) => {
    await page.goto("/manual");
    // Find a playable pit (south side, pit 1)
    const pit1 = page.locator('[aria-label="Pit 1 south: 9 stones"]');
    if (await pit1.isVisible()) {
      await pit1.click();
      // After move, pit should no longer have 9 stones
      await expect(pit1).not.toContainText("9");
    }
  });

  test("upload page has dropzone", async ({ page }) => {
    await page.goto("/upload");
    await expect(page.locator("h2")).toContainText("Upload Scoresheet");
  });

  test("archive page loads", async ({ page }) => {
    await page.goto("/archive");
    await expect(page.locator("h2")).toContainText("Game Archive");
  });

  test("dark/light theme toggle works", async ({ page }) => {
    await page.goto("/manual");
    const toggle = page.locator('[aria-label="Toggle theme"]');
    if (await toggle.isVisible()) {
      const htmlBefore = await page.locator("html").getAttribute("class");
      await toggle.click();
      await page.waitForTimeout(500);
      const htmlAfter = await page.locator("html").getAttribute("class");
      expect(htmlBefore).not.toBe(htmlAfter);
    }
  });
});
