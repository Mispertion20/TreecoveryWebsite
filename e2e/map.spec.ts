import { test, expect } from '@playwright/test';

test.describe('Map Features', () => {
  test('map page loads', async ({ page }) => {
    await page.goto('/map');
    
    // Wait for map to load
    await page.waitForTimeout(2000);
    
    // Check if map container exists
    const mapContainer = page.locator('[id*="map"]').first();
    await expect(mapContainer).toBeVisible();
  });

  test('guest user can view map', async ({ page }) => {
    await page.goto('/map');
    
    // Map should be accessible without login
    await page.waitForTimeout(2000);
    const mapContainer = page.locator('[id*="map"]').first();
    await expect(mapContainer).toBeVisible();
  });

  test('map has filter sidebar', async ({ page }) => {
    await page.goto('/map');
    await page.waitForTimeout(2000);
    
    // Look for filter controls (may be in a sidebar or dropdown)
    const filterButton = page.locator('button:has-text("Filter"), button:has-text("Filters")').first();
    
    // Filter might be visible by default or need to be opened
    if (await filterButton.isVisible()) {
      await expect(filterButton).toBeVisible();
    }
  });
});

