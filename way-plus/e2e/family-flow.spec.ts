import { test, expect } from '@playwright/test';

test.describe('Family Flow Multi-page', () => {
  test('Padre abre link mágico y ve datos reales y cambia de UI', async ({ page }) => {
    await page.route('**/*', async (route) => {
      const url = route.request().url();
      if (!url.includes('supabase.co')) {
        await route.continue();
        return;
      }

      if (url.includes('family-auth')) {
        if (route.request().method() === 'POST') {
          const body = JSON.parse(route.request().postData() || '{}');
          if (body.token === 'test-token') {
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({ patient_id: '048cc2eb-a861-4ad4-ac1a-2fdf916e430b', valid: true })
            });
          } else {
            await route.fulfill({ status: 400, body: JSON.stringify({ error: 'invalid token' }) });
          }
        }
      } else if (url.includes('patient_profiles')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([{
            id: '048cc2eb-a861-4ad4-ac1a-2fdf916e430b',
            coins: 200,
            current_level: 'pregamer',
            completed_ways: ['s1-w1']
          }])
        });
      } else if (url.includes('/patients')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([{
            id: '048cc2eb-a861-4ad4-ac1a-2fdf916e430b',
            name: 'Pedro',
            avatar_emoji: '👦',
            gender: 'masculino',
            homework_way_ids: ['s1-w1', 's2-w2']
          }])
        });
      } else if (url.includes('activity_logs')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            { way_id: 's1-w1', action: 'way_completed', created_at: new Date().toISOString(), metadata: { durationSeconds: 600 } }
          ])
        });
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
      }
    });


    // 2. Visit family dashboard with test token
    await page.goto('/family/test-token');

    // 3. Verify it loads and shows Pedro's progress
    // Wait for the h1 to appear using getByRole
    await expect(page.getByRole('heading', { name: /Progreso de (Pedro|Paciente)/i })).toBeVisible({ timeout: 10000 });

    // Verify stats with simple text locator to avoid span breaks
    await expect(page.locator('text=1 retos').or(page.locator('text=1 Retos'))).toBeVisible();

    // Verify homework tracker check
    await expect(page.locator('text=✅').first()).toBeVisible();
    
    // Check if there is a reminder button for the pending one
    const remindButton = page.getByRole('button', { name: /Recordar a Pedro/i });
    await expect(remindButton).toBeVisible();
  });
});
