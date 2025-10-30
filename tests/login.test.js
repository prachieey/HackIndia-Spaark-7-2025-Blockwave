import { test, expect } from '@playwright/test';

// Test configuration
test.use({
  baseURL: 'http://localhost:3001',
  viewport: { width: 1280, height: 720 },
  timeout: 30000, // Increase timeout to 30 seconds
});

// Test data
const testUser = {
  email: 'test@example.com',
  password: 'Test@1234',
  name: 'Test User'
};

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the login page before each test
    await page.goto('/login');
  });

  test('should display login form', async ({ page }) => {
    // Check if the login form is visible
    await expect(page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();
    await expect(page.getByLabel('Email address')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  });

  test('should show validation errors for empty form submission', async ({ page }) => {
    // Submit the form without filling any fields
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    // Check for validation errors
    await expect(page.getByText('Please enter your email address')).toBeVisible();
    await expect(page.getByText('Please enter your password')).toBeVisible();
  });

  test('should show error for invalid email format', async ({ page }) => {
    // Enter invalid email format
    await page.getByLabel('Email address').fill('invalid-email');
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    // Check for email validation error
    await expect(page.getByText('Please enter a valid email address')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    // Enter invalid credentials
    await page.getByLabel('Email address').fill('wrong@example.com');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    // Check for authentication error
    await expect(page.getByText(/invalid email or password/i)).toBeVisible();
  });

  test('should successfully log in with valid credentials', async ({ page }) => {
    // Enter valid credentials
    await page.getByLabel('Email address').fill(testUser.email);
    await page.getByLabel('Password').fill(testUser.password);
    
    // Submit the form
    await Promise.all([
      page.waitForNavigation(),
      page.getByRole('button', { name: 'Sign in' }).click()
    ]);
    
    // Verify successful login by checking if redirected to dashboard or home page
    await expect(page).toHaveURL(/\/$/); // Should be on the home page
    
    // Check if user is logged in by looking for a logout button or user menu
    await expect(page.getByRole('button', { name: /logout|sign out/i }).first()).toBeVisible();
  });

  test('should redirect to intended page after login', async ({ page }) => {
    // First, try to access a protected page
    await page.goto('/dashboard');
    
    // Should be redirected to login page with redirect parameter
    await expect(page).toHaveURL(/\/login/);
    
    // Now log in
    await page.getByLabel('Email address').fill(testUser.email);
    await page.getByLabel('Password').fill(testUser.password);
    
    await Promise.all([
      page.waitForNavigation(),
      page.getByRole('button', { name: 'Sign in' }).click()
    ]);
    
    // Should be redirected back to the originally requested page
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should show/hide password when toggle is clicked', async ({ page }) => {
    // Enter a password
    const passwordInput = page.getByLabel('Password');
    await passwordInput.fill(testUser.password);
    
    // Password should be hidden by default
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Click the show/hide password toggle
    await page.getByRole('button', { name: /show password/i }).click();
    
    // Password should be visible
    await expect(passwordInput).toHaveAttribute('type', 'text');
    
    // Click again to hide
    await page.getByRole('button', { name: /hide password/i }).click();
    
    // Password should be hidden again
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('should navigate to signup page', async ({ page }) => {
    // Click on the signup link
    await page.getByRole('link', { name: /create a new account/i }).click();
    
    // Should be on the signup page
    await expect(page).toHaveURL(/\/register/);
    await expect(page.getByRole('heading', { name: /create an account/i })).toBeVisible();
  });
});
