import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('WCAG 2.1 AA + TEA Accessibility Audits', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/*', async (route) => {
      const url = route.request().url();
      if (!url.includes('supabase.co')) {
        await route.continue();
        return;
      }
      if (url.includes('patient_profiles')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([{
            id: '048cc2eb-a861-4ad4-ac1a-2fdf916e430b',
            name: 'Pedro',
            pin: '1234',
            equipped_avatar_id: 'avatar-1',
            coins: 150,
            current_level: 'pregamer',
            completed_ways: [],
            homework_way_ids: []
          }])
        });
      } else if (url.includes('steps')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([{
            id: 'step-test',
            level_id: 'pregamer',
            title: 'Test Step',
            ways: [{
              id: 'way-test',
              type: 'choice',
              stimulus: { text: 'Pregunta test' },
              options: [
                { id: 'opt-1', label: 'Sí', isCorrect: true },
                { id: 'opt-2', label: 'No', isCorrect: false }
              ]
            }]
          }])
        });
      } else {
        await route.fulfill({ status: 200, body: JSON.stringify([]) });
      }
    });
  });

  test('Player Login Page', async ({ page }) => {
    await page.addInitScript(() => {
      window.sessionStorage.setItem('way-active-patient', '048cc2eb-a861-4ad4-ac1a-2fdf916e430b');
    });
    await page.goto('/player/login');
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    expect(results.violations).toEqual([]);
    
    // Validaciones TEA adicionales
    await expect(page.getByTestId('pin-key-1')).toHaveAttribute('aria-label', expect.stringContaining('1'));
    const buttons = page.getByTestId(/^pin-key-/);
    const count = await buttons.count();
    expect(count).toBe(12); // 0-9 + DEL + OK
  });

  test('Player Home / LevelSelect', async ({ page }) => {
    await page.addInitScript(() => {
      window.sessionStorage.setItem('way-active-patient', '048cc2eb-a861-4ad4-ac1a-2fdf916e430b');
      window.sessionStorage.setItem('way-active-pin', '1234');
    });
    await page.goto('/player/home');
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    expect(results.violations).toEqual([]);

    // Verificar que todos los WAYs visibles tienen aria-label
    const wayNodes = page.locator('[data-testid^="way-node-"]');
    for (let i = 0; i < await wayNodes.count(); i++) {
      const ariaLabel = await wayNodes.nth(i).getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();
    }
  });

  test('Way Player Page', async ({ page }) => {
    await page.addInitScript(() => {
      window.sessionStorage.setItem('way-active-patient', '048cc2eb-a861-4ad4-ac1a-2fdf916e430b');
      window.sessionStorage.setItem('way-active-pin', '1234');
    });
    await page.goto('/play/pregamer/step-test/way-test');
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    if (results.violations.length > 0) {
      console.log('Way Player Page Violations:', JSON.stringify(results.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.html) })), null, 2));
    }
    expect(results.violations).toEqual([]);

    // Verificar áreas táctiles mínimas (44x44)
    const options = page.getByTestId('choice-option');
    const firstOption = options.first();
    const box = await firstOption.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
  });
});
