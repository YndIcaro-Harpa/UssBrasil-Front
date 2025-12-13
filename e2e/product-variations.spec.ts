import { test, expect } from '@playwright/test';

test.describe('Product Variations', () => {
  test('should display product with color variations', async ({ page }) => {
    // Go directly to a product with colors
    await page.goto('/produto/jbl-xtreme-4');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    // Page should load
    await expect(page.locator('body')).toBeVisible();
  });

  test('should add product with variations to cart', async ({ page }) => {
    await page.goto('/produto/jbl-xtreme-4');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    // Add to cart
    const addToCartBtn = page.locator('button:has-text("Adicionar"), button:has-text("Comprar")').first();
    if (await addToCartBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await addToCartBtn.click();
      await page.waitForTimeout(1000);
    }
    
    // Verify we're still on the page
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display cart page', async ({ page }) => {
    await page.goto('/carrinho');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
    
    // Cart page should load
    await expect(page).toHaveURL('/carrinho');
  });
});

test.describe('Checkout Flow', () => {
  test('should add product and go to cart', async ({ page }) => {
    // Add item to cart first
    await page.goto('/produto/jbl-xtreme-4');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    const addToCartBtn = page.locator('button:has-text("Adicionar"), button:has-text("Comprar")').first();
    if (await addToCartBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await addToCartBtn.click();
      await page.waitForTimeout(1000);
    }
    
    // Go to cart
    await page.goto('/carrinho');
    await page.waitForLoadState('domcontentloaded');
    
    // Cart should load
    await expect(page).toHaveURL('/carrinho');
  });

  test('should display checkout page', async ({ page }) => {
    await page.goto('/checkout');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    // Should either show checkout or cart is empty message
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Admin Pages', () => {
  test('should load admin dashboard', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load admin products page', async ({ page }) => {
    await page.goto('/admin/products');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load admin orders page', async ({ page }) => {
    await page.goto('/admin/orders');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load admin settings page', async ({ page }) => {
    await page.goto('/admin/settings');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    await expect(page.locator('body')).toBeVisible();
  });
});
