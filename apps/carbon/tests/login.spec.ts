import { test, expect } from "@playwright/test";

test("login", async ({ page }) => {
  await page.goto("http://localhost:3000/");
  await expect(page).toHaveTitle("Carbon | Login");
  await page.click("id=email");
  await page.locator("id=email").fill("admin@carbon.us.org");
  await page.click("id=password");
  await page.locator("id=password").fill("carbon");
  await page.pause();
  await page.getByRole("button", { name: "Sign In" }).click();
});
