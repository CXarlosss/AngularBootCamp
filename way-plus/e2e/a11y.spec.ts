import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('WCAG 2.1 AA Accessibility Audits', () => {

  test('Player Login Page should not have any automatically detectable accessibility issues', async ({ page }) => {
    // Inject mock session so it goes to the pin screen
    await page.addInitScript(() => {
      window.sessionStorage.setItem('way-active-patient', '048cc2eb-a861-4ad4-ac1a-2fdf916e430b');
    });

    await page.goto('/player');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Player Home Page should not have any automatically detectable accessibility issues', async ({ page }) => {
    await page.addInitScript(() => {
      window.sessionStorage.setItem('way-active-patient', '048cc2eb-a861-4ad4-ac1a-2fdf916e430b');
      window.sessionStorage.setItem('way-active-pin', '1234');
    });

    await page.goto('/player/home');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

});
