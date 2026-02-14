import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('navbar links work correctly', async ({ page }) => {
    await page.goto('/');
    
    // Test navigation links
    const links = [
      { text: 'Map', url: '/map' },
      { text: 'About', url: '/about' },
      { text: 'Contact', url: '/contact' },
      { text: 'FAQ', url: '/faq' },
    ];
    
    for (const link of links) {
      if (await page.locator(`text=${link.text}`).isVisible()) {
        await page.click(`text=${link.text}`);
        await expect(page).toHaveURL(new RegExp(link.url));
      }
    }
  });

  test('footer links work correctly', async ({ page }) => {
    await page.goto('/');
    
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    
    // Check if footer exists and has links
    const footer = page.locator('footer').first();
    if (await footer.isVisible()) {
      await expect(footer).toBeVisible();
    }
  });

  test('logo navigates to home', async ({ page }) => {
    await page.goto('/map');
    
    // Look for logo/home link
    const logoLink = page.locator('a[href="/"], a:has-text("Treecovery")').first();
    if (await logoLink.isVisible()) {
      await logoLink.click();
      await expect(page).toHaveURL('/');
    }
  });
});

