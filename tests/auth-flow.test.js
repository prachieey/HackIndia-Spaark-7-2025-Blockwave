import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  const testUser = {
    name: 'Test User',
    email: `test-${Date.now()}@example.com`,
    password: 'Test@1234',
  };

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001/login');
  });

  test('should allow user to sign up and log in', async ({ page }) => {
    // Test Sign Up
    await test.step('Sign Up', async () => {
      // Click on Create Account link
      await page.getByRole('link', { name: /create a new account/i }).click();
      
      // Fill in the signup form
      await page.getByLabel(/name/i).fill(testUser.name);
      await page.getByLabel(/email/i).fill(testUser.email);
      await page.getByLabel(/password/i).fill(testUser.password);
      
      // Submit the form
      await page.getByRole('button', { name: /create account/i }).click();
      
      // Wait for navigation to complete
      await page.waitForURL(/\/$/);
      
      // Verify user is logged in
      await expect(page.getByText(/welcome|dashboard|home/i).first()).toBeVisible();
      
      // Log out
      await page.getByRole('button', { name: /logout|sign out/i }).click();
    });

    // Test Login
    await test.step('Login', async () => {
      // Go back to login page
      await page.goto('http://localhost:3001/login');
      
      // Fill in login form
      await page.getByLabel(/email/i).fill(testUser.email);
      await page.getByLabel(/password/i).fill(testUser.password);
      
      // Submit the form
      await page.getByRole('button', { name: /sign in/i }).click();
      
      // Wait for navigation to complete
      await page.waitForURL(/\/$/);
      
      // Verify user is logged in
      await expect(page.getByText(/welcome|dashboard|home/i).first()).toBeVisible();
    });
  });

  test('should show error for invalid login', async ({ page }) => {
    // Fill in login form with invalid credentials
    await page.getByLabel(/email/i).fill('invalid@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    
    // Submit the form
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Verify error message is shown
    await expect(page.getByText(/invalid email or password/i).first()).toBeVisible();
  });

  test('should show validation errors', async ({ page }) => {
    // Try to submit empty form
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Verify validation errors
    await expect(page.getByText(/please enter your email/i)).toBeVisible();
    await expect(page.getByText(/please enter your password/i)).toBeVisible();
    
    // Test invalid email format
    await page.getByLabel(/email/i).fill('invalid-email');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.getByText(/please enter a valid email/i)).toBeVisible();
  });
});
