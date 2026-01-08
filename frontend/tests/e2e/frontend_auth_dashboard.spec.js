import { test, expect } from '@playwright/test';

test('Registro, login y acceso a dashboard', async ({ page }) => {
  await page.goto('http://localhost:5174/login');
  if (!(await page.isVisible('[data-testid="go-register-btn"]'))) {
    await page.goto('http://localhost:5174/');
  }
  await page.waitForSelector('[data-testid="go-register-btn"]', { state: 'visible', timeout: 10000 });
  await page.click('[data-testid="go-register-btn"]');
  const email = `testuser${Date.now()}@example.com`;
  await page.fill('input[type="text"]:visible', 'Test User');
  await page.fill('input[type="email"]:visible', email);
  await page.fill('input[type="password"]:visible', 'Test12345!');
  await page.click('button[type="submit"]:visible');
  await page.waitForSelector('button[data-testid="go-register-btn"]', { state: 'visible', timeout: 10000 });
  await page.waitForTimeout(1500);
  const emailInput = await page.$('input[type="email"]:visible');
  const passInput = await page.$('input[type="password"]:visible');
  if (emailInput) await emailInput.fill('');
  if (passInput) await passInput.fill('');
  await page.fill('input[type="email"]:visible', email);
  await page.fill('input[type="password"]:visible', 'Test12345!');
  await page.waitForTimeout(500);
  await page.click('button[type="submit"]:visible');
  await page.waitForSelector('main, .dashboard, [data-testid="dashboard"]', { timeout: 10000 });
});
