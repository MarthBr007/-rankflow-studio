import { test, expect } from '@playwright/test';

test.describe('Content Generation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should generate landing page content', async ({ page }) => {
    // Select landing page type
    await page.selectOption('select[name="type"]', 'landing');

    // Fill in form
    await page.fill('input[name="topic"]', 'tafelgerei');
    await page.fill('textarea[name="goal"]', 'Een feest organiseren met mooi gedekte tafels');

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for result
    await page.waitForSelector('.result-section', { timeout: 60000 });

    // Check that result contains expected fields
    const seoTitle = await page.textContent('.result-section');
    expect(seoTitle).toBeTruthy();

    // Check that JSON is valid
    const resultData = await page.evaluate(() => {
      const resultElement = document.querySelector('[data-testid="result-data"]');
      if (resultElement) {
        return JSON.parse(resultElement.textContent || '{}');
      }
      return null;
    });

    if (resultData) {
      // Validate JSON structure for landing page
      expect(resultData).toHaveProperty('seo');
      expect(resultData.seo).toHaveProperty('seoTitle');
      expect(resultData.seo).toHaveProperty('metaDescription');
      expect(resultData.seo).toHaveProperty('focusKeyword');
    }
  });

  test('should generate product page content', async ({ page }) => {
    await page.selectOption('select[name="type"]', 'product');

    await page.fill('input[name="productName"]', 'Borden set');
    await page.fill('input[name="category"]', 'Tafelgerei');
    await page.fill('input[name="useCase"]', 'Diner thuis');

    await page.click('button[type="submit"]');

    await page.waitForSelector('.result-section', { timeout: 60000 });

    const resultData = await page.evaluate(() => {
      const resultElement = document.querySelector('[data-testid="result-data"]');
      if (resultElement) {
        return JSON.parse(resultElement.textContent || '{}');
      }
      return null;
    });

    if (resultData) {
      expect(resultData).toHaveProperty('seoTitle');
      expect(resultData).toHaveProperty('title');
    }
  });

  test('should validate form inputs', async ({ page }) => {
    // Try to submit without filling required fields
    await page.click('button[type="submit"]');

    // Check for validation errors
    const validationErrors = await page.$$('.error-message, [role="alert"]');
    expect(validationErrors.length).toBeGreaterThan(0);
  });

  test('should show social media hints', async ({ page }) => {
    await page.selectOption('select[name="type"]', 'social');

    // Check that platform hints are shown
    await page.selectOption('select[name="platform"]', 'Instagram');
    
    const hints = await page.textContent('.form-group');
    expect(hints).toContain('Instagram');
    expect(hints).toContain('2200');
  });
});

