import { test, expect } from "@playwright/test";

test("login", async ({ page }) => {
  await page.goto("http://localhost:3000/");
  await expect(page).toHaveTitle("Carbon | Login");
});
