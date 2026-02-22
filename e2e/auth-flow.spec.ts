import { test, expect } from '@playwright/test';

const testEmail = `e2e-${Date.now()}@playwright.test`;
const testPassword = 'Test123456';

test.describe('Flow 1: Register → Login → Dashboard', () => {
  test('should register a new account, complete onboarding, and see dashboard', async ({ page }) => {
    await page.goto('/register');

    // Fill register form
    await page.getByLabel('Email').fill(testEmail);
    await page.getByLabel('Mật khẩu').fill(testPassword);
    await page.getByRole('button', { name: /Đăng ký/i }).click();

    // Should redirect to dashboard (shows onboarding for new users)
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    // Complete onboarding by clicking "Bỏ qua" (Skip)
    const skipButton = page.getByRole('button', { name: /Bỏ qua/i });
    await skipButton.waitFor({ timeout: 10000 });
    await skipButton.click();

    // After onboarding, dashboard content should appear
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('/dashboard');
  });

  test('should login with created account and see dashboard', async ({ page }) => {
    await page.goto('/login');

    // Fill login form
    await page.getByLabel('Email').fill(testEmail);
    await page.getByLabel('Mật khẩu').fill(testPassword);
    await page.getByRole('button', { name: /Đăng nhập/i }).click();

    // Should redirect to dashboard (user is now onboarded)
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    expect(page.url()).toContain('/dashboard');
  });
});

test.describe('Flow 2: Add expense → see on dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByLabel('Email').fill(testEmail);
    await page.getByLabel('Mật khẩu').fill(testPassword);
    await page.getByRole('button', { name: /Đăng nhập/i }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
  });

  test('should add an expense and see it reflected', async ({ page }) => {
    // Navigate to expenses page
    await page.goto('/expenses');

    // Wait for page to load (look for the page header, exact match to avoid "Danh sách chi tiêu")
    await page.getByRole('heading', { name: 'Chi tiêu', exact: true }).waitFor({ timeout: 10000 });

    // Click "Thêm chi tiêu" button to open the form
    const addButton = page.getByRole('button', { name: /Thêm chi tiêu/i });
    await addButton.waitFor({ timeout: 5000 });
    await addButton.click();

    // Wait for form to appear, then fill amount
    const amountInput = page.locator('input[inputmode="numeric"]').first();
    await amountInput.waitFor({ timeout: 5000 });
    await amountInput.fill('75000');

    // Submit the form (last "Thêm chi tiêu" button inside the form)
    const submitButton = page.getByRole('button', { name: /Thêm chi tiêu/i }).last();
    await submitButton.click();

    // Wait for the expense to appear in the list (prefixed with minus sign)
    await expect(page.getByText('-75.000 ₫')).toBeVisible({ timeout: 10000 });
  });
});
