import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing auth state
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
    });
  });

  test('user can navigate to login page', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Sign In');
    await expect(page).toHaveURL(/.*login/);
    await expect(page.locator('h2')).toContainText('Sign In');
  });

  test('user can navigate to register page', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=Sign up');
    await expect(page).toHaveURL(/.*register/);
    await expect(page.locator('h2')).toContainText('Create Account');
  });

  test('login form validates required fields', async ({ page }) => {
    await page.goto('/login');
    
    const submitButton = page.getByRole('button', { name: /sign in/i });
    await submitButton.click();
    
    // HTML5 validation should prevent submission
    const emailInput = page.getByLabel('Email');
    await expect(emailInput).toBeFocused();
  });

  test('register form validates password strength', async ({ page }) => {
    await page.goto('/register');
    
    const passwordInput = page.getByLabel('Password');
    await passwordInput.fill('weak');
    
    // Check for password strength validation message
    await expect(page.locator('text=/Password must be at least 8 characters long/')).toBeVisible();
  });

  test('register form validates password match', async ({ page }) => {
    await page.goto('/register');
    
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('ValidPass123');
    await page.getByLabel('Confirm Password').fill('DifferentPass123');
    
    // Check for password mismatch message
    await expect(page.locator('text=/Passwords do not match/')).toBeVisible();
  });

  test('user can navigate to forgot password page', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=Forgot password?');
    await expect(page).toHaveURL(/.*forgot-password/);
    await expect(page.locator('h2')).toContainText('Reset Password');
  });

  test('forgot password form submits email', async ({ page }) => {
    await page.goto('/forgot-password');
    
    // Mock the API response
    await page.route('**/api/auth/forgot-password', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Email sent' }),
      });
    });
    
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByRole('button', { name: /send reset link/i }).click();
    
    await expect(page.locator('text=/Check your email/')).toBeVisible();
  });
});

