import { expect, test, type Page } from "@playwright/test";

async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL(/\/account$/);
}

test("collector and administrator smoke flow", async ({ browser, page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Atelier Graded/);

  await page.goto("/cards?graders=PSA&availability=AVAILABLE");
  await expect(page.getByText(/pieces in the catalogue/i)).toBeVisible();

  await login(page, "collector@ateliergraded.demo", "ChangeMeUser!23");
  await page.goto("/cards");
  await page.getByRole("button", { name: /add .* to favorites/i }).first().click();

  await page.getByRole("link", { name: /view demo inventory/i }).first().click();
  await page.getByLabel("Name").fill("Demo Collector");
  await page.getByLabel("Email").fill("collector@ateliergraded.demo");
  await page.getByLabel("Country").fill("United States");
  await page
    .getByLabel("Message")
    .fill("I would like to discuss insured shipping and a serious offer for this card.");
  await page.getByLabel(/privacy policy/i).check();
  await page.getByRole("button", { name: "Send inquiry" }).click();
  await expect(page.getByRole("status")).toContainText(/reference number/i);

  const adminPage = await browser.newPage();
  await login(adminPage, "admin@ateliergraded.demo", "ChangeMeAdmin!23");
  await adminPage.goto("/admin");
  await expect(adminPage.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await adminPage.close();
});
