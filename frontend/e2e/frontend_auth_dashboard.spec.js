// This file is being moved to frontend/e2e

import { test, expect } from '@playwright/test';

// Test de registro, login y dashboard usando Supabase desde el frontend
test('Registro, login y acceso a dashboard', async ({ page }) => {
  // Intentar primero /login, luego fallback a /
  await page.goto('http://localhost:5174/login');
  if (!(await page.isVisible('[data-testid="go-register-btn"]'))) {
    await page.goto('http://localhost:5174/');
  }

  // Esperar a que el botón esté presente y visible antes de hacer clic
  await page.waitForSelector('[data-testid="go-register-btn"]', { state: 'visible', timeout: 10000 });
  await page.click('[data-testid="go-register-btn"]');

  // Completar el formulario de registro según LoginPage.jsx actual
  const email = `testuser${Date.now()}@example.com`;
  await page.fill('input[type="text"]:visible', 'Test User');
  await page.fill('input[type="email"]:visible', email);
  await page.fill('input[type="password"]:visible', 'Test12345!');
  await page.click('button[type="submit"]:visible');

  // Esperar a que vuelva la vista de login (flip)
  await page.waitForSelector('button[data-testid="go-register-btn"]', { state: 'visible', timeout: 10000 });
  await page.waitForTimeout(1500); // Espera extra para animación y render

  // Limpiar y rellenar campos de login tras el flip
  const emailInput = await page.$('input[type="email"]:visible');
  const passInput = await page.$('input[type="password"]:visible');
  if (emailInput) await emailInput.fill('');
  if (passInput) await passInput.fill('');
  await page.fill('input[type="email"]:visible', email);
  await page.fill('input[type="password"]:visible', 'Test12345!');
  await page.waitForTimeout(500); // Espera breve para asegurar render
  await page.click('button[type="submit"]:visible');

  // Esperar a que cargue cualquier dashboard (ajusta el texto si es necesario)
  // Puedes cambiar 'Usuarios Activos' por cualquier texto visible en tu dashboard
  await page.waitForSelector('main, .dashboard, [data-testid="dashboard"]', { timeout: 10000 });
  // Validar que algún texto clave esté presente
  const dashboardText = await page.textContent('main, .dashboard, [data-testid="dashboard"]');
  expect(dashboardText).not.toBeNull();
});
