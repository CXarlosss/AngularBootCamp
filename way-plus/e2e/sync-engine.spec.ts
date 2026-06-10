import { test, expect } from '@playwright/test';

test.describe('SyncEngine & IndexedDB Integration', () => {
  // Configuración previa común
  test.beforeEach(async ({ page }) => {
    // Inyectamos el estado en sessionStorage antes de navegar
    await page.addInitScript(() => {
      window.sessionStorage.setItem('way-active-patient', '048cc2eb-a861-4ad4-ac1a-2fdf916e430b');
      window.sessionStorage.setItem('way-active-pin', '1234');
    });

    // Vamos a la ruta inicial
    await page.goto('/player');
    
    // Esperamos a que la página cargue algo del DOM
    await page.waitForLoadState('domcontentloaded');
  });

  const getPendingLogsCount = async (page: any) => {
    return await page.evaluate(async () => {
      return new Promise((resolve) => {
        const request = indexedDB.open('way-logs');
        request.onsuccess = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains('queue')) return resolve(0);
          const tx = db.transaction('queue', 'readonly');
          const store = tx.objectStore('queue');
          const getReq = store.get('pending-logs');
          getReq.onsuccess = () => resolve(getReq.result ? getReq.result.length : 0);
          getReq.onerror = () => resolve(0);
        };
        request.onerror = () => resolve(0);
      });
    });
  };

  test('Test 1: Sincronización exitosa en modo online (Happy Path)', async ({ page }) => {
    let logRequestCount = 0;
    await page.route('**/functions/v1/log-activity*', async (route) => {
      if (route.request().method() === 'POST') {
        logRequestCount++;
        await route.fulfill({ status: 201, body: JSON.stringify({ success: true }) });
      } else {
        await route.continue();
      }
    });

    await page.evaluate(async () => {
      const { syncService } = await import('/src/core/services/syncService.ts');
      await syncService.logActivity({
        patientId: '048cc2eb-a861-4ad4-ac1a-2fdf916e430b',
        wayId: 'way-1',
        action: 'way_completed',
        attempts: 1,
        metadata: { timeSpentMs: 1000 }
      });
      await new Promise(r => setTimeout(r, 1000));
    });

    expect(logRequestCount).toBeGreaterThan(0);
    const count = await getPendingLogsCount(page);
    expect(count).toBe(0);
  });

  test('Test 2: Encolamiento offline y posterior volcado (Resiliencia)', async ({ page }) => {
    // Simulamos offline sin cortar la red al dev server
    await page.evaluate(() => {
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
    });

    await page.evaluate(async () => {
      const { syncService } = await import('/src/core/services/syncService.ts');
      await syncService.logActivity({
        patientId: '048cc2eb-a861-4ad4-ac1a-2fdf916e430b',
        wayId: 'way-2',
        action: 'way_completed',
        attempts: 1,
        metadata: { timeSpentMs: 2000 }
      });
      await new Promise(r => setTimeout(r, 500));
    });

    let count = await getPendingLogsCount(page);
    expect(count).toBe(1);

    let logRequestCount = 0;
    await page.route('**/functions/v1/log-activity*', async (route) => {
      if (route.request().method() === 'POST') {
        logRequestCount++;
        await route.fulfill({ status: 201, body: JSON.stringify({ success: true }) });
      } else {
        await route.continue();
      }
    });

    // Restauramos online
    await page.evaluate(() => {
      Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
      window.dispatchEvent(new Event('online'));
    });

    await page.evaluate(async () => {
      const { syncService } = await import('/src/core/services/syncService.ts');
      await syncService.logActivity({
        patientId: '048cc2eb-a861-4ad4-ac1a-2fdf916e430b',
        wayId: 'way-dummy',
        action: 'hint_used'
      });
    });

    await page.waitForTimeout(2000);

    count = await getPendingLogsCount(page);
    expect(count).toBe(0);
    expect(logRequestCount).toBeGreaterThan(0);
  });

  test('Test 3: Lote múltiple de actividades offline y vaciado (Batching)', async ({ page }) => {
    // Simulamos offline
    await page.evaluate(() => {
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
    });

    await page.evaluate(async () => {
      const { syncService } = await import('/src/core/services/syncService.ts');
      await syncService.logActivity({ patientId: '048cc2eb-a861-4ad4-ac1a-2fdf916e430b', wayId: 'way-a', action: 'session_start' });
      await syncService.logActivity({ patientId: '048cc2eb-a861-4ad4-ac1a-2fdf916e430b', wayId: 'way-a', action: 'way_completed' });
      await syncService.logActivity({ patientId: '048cc2eb-a861-4ad4-ac1a-2fdf916e430b', wayId: 'way-b', action: 'way_completed' });
      await new Promise(r => setTimeout(r, 500));
    });

    let count = await getPendingLogsCount(page);
    expect(count).toBe(3);

    let logRequestCount = 0;
    await page.route('**/functions/v1/log-activity*', async (route) => {
      if (route.request().method() === 'POST') {
        logRequestCount++;
        await route.fulfill({ status: 201, body: JSON.stringify({ success: true }) });
      } else {
        await route.continue();
      }
    });

    // Restaurar online
    await page.evaluate(() => {
      Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
      window.dispatchEvent(new Event('online'));
    });

    await page.evaluate(async () => {
      const { syncService } = await import('/src/core/services/syncService.ts');
      await syncService.logActivity({
        patientId: '048cc2eb-a861-4ad4-ac1a-2fdf916e430b',
        wayId: 'way-dummy2',
        action: 'hint_used'
      });
    });

    await page.waitForTimeout(2000);

    count = await getPendingLogsCount(page);
    expect(count).toBe(0);
    expect(logRequestCount).toBeGreaterThan(0);
  });
});
