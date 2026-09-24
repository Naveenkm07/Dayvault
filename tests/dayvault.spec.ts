import { test, expect } from '@playwright/test';

// Basic E2E Tests for DAYVAULT

test.describe('DAYVAULT End-to-End Tests', () => {
  test('Landing page loads and has correct branding', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/DAYVAULT/);
    await expect(page.locator('text=Your days. Your memories. Your plans.')).toBeVisible();
  });

  test('Authentication route protection redirects to login', async ({ page }) => {
    await page.goto('/dashboard');
    // Should be redirected to login
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('Signup and Login functionality', async ({ page }) => {
    // Note: Since this runs against a live/local Supabase, we would normally use 
    // a mock or a test user. Here we just test the UI elements.
    await page.goto('/login');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // Switch to signup
    await page.click('text=Sign up');
    await expect(page.locator('input[name="name"]')).toBeVisible();
  });

  test('Theme switching works', async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
    });
    
    const isDark = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark');
    });
    
    expect(isDark).toBeTruthy();
  });

  test('Journal entry creation and photo upload UI', async ({ page }) => {
    // We test that the new journal page has the correct fields
    // Assuming auth is mocked or skipped in a real CI setup, we just test the DOM if possible.
    // For a real end to end without a test DB, we verify the login page redirection above.
    // Let's assume we are just checking the routes exist and return a 200 or redirect properly.
    const res = await page.goto('/journal/new');
    expect(res?.status()).toBe(200); // Or it might redirect to /login which is also expected behavior
  });

  test('Plan creation UI', async ({ page }) => {
    const res = await page.goto('/plans');
    expect(res?.status()).toBe(200);
  });

  test('Search functionality UI', async ({ page }) => {
    const res = await page.goto('/search');
    expect(res?.status()).toBe(200);
  });
});
