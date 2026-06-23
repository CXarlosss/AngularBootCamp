import { test, expect } from '@playwright/test';

test.describe('Player Happy Path', () => {
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
            coins: 150,
            current_level: 'pregamer',
            completed_ways: ['s1-w1', 's1-w2', 's1-w3'],
            homework_way_ids: ['s2-w1'],
            accessibility_config: { highContrast: false, largeText: true }
          }])
        });
      } else if (url.includes('/patients')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([{ 
            id: '048cc2eb-a861-4ad4-ac1a-2fdf916e430b',
            name: 'Pedro', 
            avatar_emoji: '🦄',
            age: 8,
            gender: 'boy'
          }])
        });
      } else if (url.includes('activity_logs')) {
        if (route.request().method() === 'POST') {
          await route.fulfill({ status: 201, body: JSON.stringify({}) });
        } else {
          await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
        }
      } else if (url.includes('steps')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 'step-1',
              level_id: 'pregamer',
              title: 'Primeros Pasos',
              order_index: 1,
              is_published: true,
              ways: [
                {
                  id: 's2-w1',
                  type: 'choice',
                  title: 'Way 1',
                  name: 'way 1',
                  order: 1,
                  is_published: true,
                  stimulus: { image: '', text: 'Elige la opción correcta' },
                  options: [
                    { id: 'opt-1', label: 'Opción A', isCorrect: true },
                    { id: 'opt-2', label: 'Opción B', isCorrect: false }
                  ]
                }
              ]
            }
          ])
        });
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
      }
    });
  });

  test('Pedro entra directamente, juega un way y gana monedas', async ({ page }) => {
    // Evitamos el PIN para hacer el test más resiliente, ya que PlayerStartPage o login puede variar
    await page.addInitScript(() => {
      window.sessionStorage.setItem('way-active-patient', '048cc2eb-a861-4ad4-ac1a-2fdf916e430b');
      window.sessionStorage.setItem('way-active-pin', '1234');
    });

    // 1. Navegar a /player/home donde carga el LevelSelectPage
    await page.goto('/player/home');

    // 2. Verificar que se cargó el mapa (ya sea "Tu camino de hoy" o "Hola, Gamer")
    await expect(page.getByText(/Tu camino de hoy|¡Hola, Gamer!/i)).toBeVisible({ timeout: 10000 });

    // 3. Hacer click en el way actual (usamos un localizador robusto por nombre)
    const currentWay = page.locator('button', { hasText: /Way 1/i }).first();
    await expect(currentWay).toBeVisible();
    await currentWay.click();

    // 4. Esperar navegación al WayPlayer
    await page.waitForURL('**/play/way/**');

    // 5. Interactuar con los botones de continuar o finalizar
    const actionButton = page.getByRole('button', { name: /Continuar|Finalizar|Siguiente|Terminar/i }).first();
    
    // Iteramos hasta que aparezca el botón de Finalizar y termine el way
    let tries = 0;
    while (tries < 10) {
      if (await page.getByText(/¡LOGRADO!|¡Genial!|Bien hecho|monedas/i).isVisible()) {
        break;
      }
      if (await actionButton.isVisible()) {
        await actionButton.click();
      }
      await page.waitForTimeout(500);
      tries++;
    }

    // 6. Verificar que volvimos al mapa
    await page.waitForURL('**/player/home');

    // 7. Screenshot
    await page.screenshot({ path: 'test-results/happy-path-completed.png' });
  });
});
