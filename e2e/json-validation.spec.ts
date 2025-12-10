import { test, expect } from '@playwright/test';

test.describe('JSON Validation', () => {
  test('should return valid JSON for landing page', async ({ request }) => {
    const response = await request.post('/api/generate', {
      data: {
        type: 'landing',
        topic: 'tafelgerei',
        goal: 'Een feest organiseren',
        region1: 'Haarlem',
        region2: 'Amsterdam',
      },
    });

    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    
    // Validate structure
    expect(data).toHaveProperty('seo');
    expect(data.seo).toHaveProperty('seoTitle');
    expect(data.seo).toHaveProperty('metaDescription');
    expect(data.seo).toHaveProperty('focusKeyword');
    expect(data.seo).toHaveProperty('urlSlug');
    
    // Validate content structure
    expect(data).toHaveProperty('content');
    expect(data.content).toHaveProperty('h1');
    expect(data.content).toHaveProperty('intro');
    
    // Validate SEO title length
    expect(data.seo.seoTitle.length).toBeLessThanOrEqual(60);
    
    // Validate meta description length
    expect(data.seo.metaDescription.length).toBeLessThanOrEqual(155);
  });

  test('should return valid JSON for product page', async ({ request }) => {
    const response = await request.post('/api/generate', {
      data: {
        type: 'product',
        productName: 'Borden set',
        category: 'Tafelgerei',
        useCase: 'Diner thuis',
      },
    });

    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    
    expect(data).toHaveProperty('seoTitle');
    expect(data).toHaveProperty('title');
    expect(data).toHaveProperty('intro');
  });

  test('should handle errors gracefully', async ({ request }) => {
    const response = await request.post('/api/generate', {
      data: {
        type: 'landing',
        // Missing required fields
      },
    });

    // Should return error response
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });
});

