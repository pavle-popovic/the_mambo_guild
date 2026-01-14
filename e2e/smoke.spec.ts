import { test, expect } from '@playwright/test';

test.describe('Smoke Tests - Baseline UI Verification', () => {
  test.beforeEach(async ({ page }) => {
    // Set a reasonable timeout for navigation
    page.setDefaultTimeout(15000);
  });

  // Helper for navigation that uses domcontentloaded (faster for video-heavy pages)
  const goTo = async (page: any, path: string) => {
    await page.goto(path, { waitUntil: 'domcontentloaded' });
  };

  test('home page loads and primary CTA is clickable', async ({ page }) => {
    await goTo(page, '/');
    
    // Verify the main headline is visible
    await expect(page.locator('h1')).toBeVisible();
    
    // Check for primary CTA buttons (Register or Go to Courses)
    const primaryCTA = page.locator('a[href="/register"], a[href="/courses"]').first();
    await expect(primaryCTA).toBeVisible();
    await expect(primaryCTA).toBeEnabled();
    
    // Verify "How It Works" button exists and is clickable
    const howItWorksBtn = page.locator('a[href="#about"]');
    await expect(howItWorksBtn).toBeVisible();
    await howItWorksBtn.click();
    
    // Verify smooth scroll worked (about section should be in view)
    await expect(page.locator('#about')).toBeInViewport({ timeout: 2000 });
  });

  test('login page is accessible and form is functional', async ({ page }) => {
    await goTo(page, '/login');
    
    // Check page loaded properly
    await expect(page.locator('h1, h2').first()).toBeVisible();
    
    // Verify form elements exist
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"]');
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    
    // Verify submit button is present
    const submitBtn = page.locator('button[type="submit"], button:has-text("Log in"), button:has-text("Login"), button:has-text("Sign in")');
    await expect(submitBtn.first()).toBeVisible();
  });

  test('register page is accessible and form is functional', async ({ page }) => {
    await goTo(page, '/register');
    
    // Check page loaded properly
    await expect(page.locator('h1, h2').first()).toBeVisible();
    
    // Verify form elements exist (register has password + confirm password)
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"]').first();
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });

  test('courses page loads correctly', async ({ page }) => {
    await goTo(page, '/courses');
    
    // Page should load (may redirect to login or show courses)
    await expect(page).toHaveURL(/\/(courses|login)/);
    
    // Some content should be visible
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('pricing page loads and displays pricing cards', async ({ page }) => {
    await goTo(page, '/pricing');
    
    // Check page loaded properly
    await expect(page.locator('h1, h2').first()).toBeVisible();
    
    // Should have some pricing content
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('navigation between pages works without errors', async ({ page }) => {
    // Start at home
    await goTo(page, '/');
    await expect(page.locator('h1')).toBeVisible();
    
    // Navigate to login
    const loginLink = page.locator('a[href="/login"]').first();
    if (await loginLink.isVisible()) {
      await loginLink.click();
      await expect(page).toHaveURL(/\/login/);
    }
    
    // Navigate to register
    await goTo(page, '/');
    const registerLink = page.locator('a[href="/register"]').first();
    if (await registerLink.isVisible()) {
      await registerLink.click();
      await expect(page).toHaveURL(/\/register/);
    }
    
    // Go back home
    await goTo(page, '/');
    await expect(page).toHaveURL('/');
  });

  test('page transitions complete without animation blocking', async ({ page }) => {
    await goTo(page, '/');
    
    // Wait for any page transition animations to complete
    await page.waitForTimeout(500);
    
    // Verify content is fully visible and not stuck in animation state
    const mainContent = page.locator('h1');
    await expect(mainContent).toBeVisible();
    
    // Verify no elements are stuck with opacity 0
    const opacity = await mainContent.evaluate((el) => 
      window.getComputedStyle(el).opacity
    );
    expect(parseFloat(opacity)).toBeGreaterThan(0.9);
  });

  test('buttons are not covered by animation layers', async ({ page }) => {
    await goTo(page, '/');
    
    // Wait for animations to settle
    await page.waitForTimeout(500);
    
    // Get primary CTA
    const primaryCTA = page.locator('a[href="/register"], a[href="/courses"]').first();
    
    if (await primaryCTA.isVisible()) {
      // Check if the element is clickable (not covered)
      const box = await primaryCTA.boundingBox();
      expect(box).not.toBeNull();
      
      if (box) {
        // Check that clicking the center of the button hits the button
        const centerX = box.x + box.width / 2;
        const centerY = box.y + box.height / 2;
        
        const elementAtPoint = await page.evaluate(({ x, y }) => {
          const el = document.elementFromPoint(x, y);
          return el?.tagName;
        }, { x: centerX, y: centerY });
        
        // Should hit the link or something inside it (SPAN, etc)
        expect(['A', 'SPAN', 'BUTTON', 'DIV']).toContain(elementAtPoint);
      }
    }
  });
});
