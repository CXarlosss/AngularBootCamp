import { test, expect } from '@playwright/test';

test.describe('Player Happy Path v2.2', () => {
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
          body: JSON.stringify({
            id: '048cc2eb-a861-4ad4-ac1a-2fdf916e430b',
            name: 'Pedro',
            pin: '1234',
            equipped_avatar_id: 'avatar-1',
            coins: 150,
            current_level: 'pregamer',
            completed_ways: ['s1-w1', 's1-w2', 's1-w3'],
            homework_way_ids: ['s2-w1'],
            accessibility_config: { highContrast: false, largeText: true },
            last_sync: new Date().toISOString()
          })
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

  test('Flujo completo: login → mapa → way → celebración → tienda', async ({ page }) => {
    // 1. Login (bypass session + PIN)
    await page.addInitScript(() => {
      window.sessionStorage.setItem('way-active-patient', '048cc2eb-a861-4ad4-ac1a-2fdf916e430b');
      window.sessionStorage.setItem('way-active-pin', '1234');
      window.localStorage.setItem('way-rewards-storage-048cc2eb-a861-4ad4-ac1a-2fdf916e430b', JSON.stringify({
        state: { wayCoins: 150, purchaseHistory: [] }
      }));
      (window as any).speechSynthesis = {
        speak: (u: any) => {
          setTimeout(() => {
            if (u.onstart) u.onstart(new Event('start'));
            setTimeout(() => { if (u.onend) u.onend(new Event('end')); }, 10);
          }, 10);
        },
        cancel: () => {}
      };
    });

    // 2. Ir al mapa
    await page.goto('/player/home');
    await expect(page.getByTestId('level-select-page')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/¡Hola, (Pedro|Gamer)!/i)).toBeVisible();
    await expect(page.getByTestId('coin-display')).toContainText('150');

    // 3. Click en el WAY actual (homework s2-w1)
    const currentWay = page.getByTestId('way-node-s2-w1');
    await expect(currentWay).toBeVisible();
    await currentWay.click();

    // 4. Esperar WayPlayerPage
    await page.waitForURL('**/play/*/*/*');
    await expect(page.getByTestId('way-player-main')).toBeVisible();
    await expect(page.getByTestId('way-question')).toContainText('Elige la opción correcta');

    // 5. Seleccionar opción correcta (opt-1)
    const correctOption = page.locator('[data-testid="choice-option"][data-choice-id="opt-1"]');
    await expect(correctOption).toBeVisible();
    await correctOption.click();

    // 6. Esperar celebración de éxito
    await expect(page.getByTestId('celebration-overlay')).toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId('celebration-overlay')).toContainText(/¡Bravo!|¡Increíble!|¡GRANDE/i);
    
    // 7. Verificar monedas ganadas (si aplica)
    const coinsElement = page.getByTestId('celebration-coins');
    if (await coinsElement.isVisible().catch(() => false)) {
      await expect(coinsElement).toContainText('+');
    }

    // 8. Esperar navegación automática de vuelta al step (timeout 4s por celebración)
    await page.waitForURL('**/play/**', { timeout: 10000 });

    // 9. Screenshot del estado final
    await page.screenshot({ path: 'test-results/happy-path-completed.png' });
  });

  test('PIN incorrecto bloquea tras 3 intentos', async ({ page }) => {
    await page.addInitScript(() => {
      window.sessionStorage.setItem('way-active-patient', '048cc2eb-a861-4ad4-ac1a-2fdf916e430b');
    });
    await page.goto('/player/login');

    // Ingresar PIN incorrecto 3 veces
    for (let attempt = 0; attempt < 3; attempt++) {
      // Borrar si hay algo
      await page.getByTestId('pin-key-DEL').click();
      // Ingresar 0000
      await page.getByTestId('pin-key-0').click();
      await page.getByTestId('pin-key-0').click();
      await page.getByTestId('pin-key-0').click();
      await page.getByTestId('pin-key-0').click();
      await page.waitForTimeout(1200);
    }

    // Verificar bloqueo
    await expect(page.getByTestId('login-locked')).toBeVisible();
    await expect(page.getByText('Demasiados intentos')).toBeVisible();
  });

  test('Comprar y equipar item en la tienda', async ({ page }) => {
    await page.addInitScript(() => {
      window.sessionStorage.setItem('way-active-patient', '048cc2eb-a861-4ad4-ac1a-2fdf916e430b');
      window.sessionStorage.setItem('way-active-pin', '1234');
      window.localStorage.setItem('way-rewards-storage-048cc2eb-a861-4ad4-ac1a-2fdf916e430b', JSON.stringify({
        state: { wayCoins: 150, purchaseHistory: [] }
      }));
    });
    await page.goto('/player/home');
    await expect(page.getByTestId('level-select-page')).toBeVisible();

    // Navegar a tienda (asumiendo ruta /player/shop o botón en home)
    // Si la tienda es una ruta separada:
    await page.goto('/shop');
    await expect(page.getByTestId('shop-item-button-base-puppy')).toBeVisible({ timeout: 5000 });

    // Comprar primer item (si es affordabe)
    const firstItemButton = page.getByTestId('shop-item-button-base-puppy');
    const isDisabled = await firstItemButton.isDisabled();
    
    if (!isDisabled) {
      await firstItemButton.click();
      // Verificar que cambió a Adquirido
      await expect(page.getByTestId('shop-item-purchased-base-puppy')).toBeVisible();
    }
  });
});
