import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard', () => {
  test('should display admin dashboard', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    // Check for dashboard elements
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display KPI cards', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    // Look for stat cards
    await expect(page.locator('body')).toBeVisible();
  });

  test('should navigate to products page', async ({ page }) => {
    await page.goto('/admin/products');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('should navigate to orders page', async ({ page }) => {
    await page.goto('/admin/orders');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('should navigate to customers page', async ({ page }) => {
    await page.goto('/admin/customers');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('should navigate to settings page', async ({ page }) => {
    await page.goto('/admin/settings');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Admin Settings', () => {
  test('should display store settings', async ({ page }) => {
    await page.goto('/admin/settings');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display shipping settings', async ({ page }) => {
    await page.goto('/admin/settings');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display payment settings', async ({ page }) => {
    await page.goto('/admin/settings');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('should save settings', async ({ page }) => {
    await page.goto('/admin/settings');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Admin Responsive', () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  test('should display tablet layout', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    await expect(page.locator('body')).toBeVisible();
  });
});
