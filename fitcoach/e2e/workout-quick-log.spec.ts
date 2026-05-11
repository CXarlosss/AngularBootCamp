import { test, expect } from '@playwright/test';

test.describe('Quick-Log System', () => {
  test.beforeEach(async ({ page }) => {
    // Login y navegar a entrenamiento
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@fitcoach.com');
    await page.fill('[name="password"]', 'test123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/client/today');
  });

  test('should reduce taps per set using quick buttons', async ({ page }) => {
    // Contar taps antes (input manual)
    const weightInput = page.locator('.weight-input').first();
    await weightInput.fill('80');
    
    // Con quick buttons: 1 tap en +2.5
    const quickBtn = page.locator('.quick-btn', { hasText: '+2.5' }).first();
    await quickBtn.click();
    
    // Verificar valor
    await expect(weightInput).toHaveValue('82.5');
  });

  test('should allow undo within grace period', async ({ page }) => {
    // Guardar serie
    await page.locator('.save-btn').first().click();
    
    // Aparece botón undo
    const undoBtn = page.locator('.undo-btn').first();
    await expect(undoBtn).toBeVisible();
    await expect(undoBtn).toContainText('Deshacer (5s)');
    
    // Click undo
    await undoBtn.click();
    
    // Vuelve a estado editable
    await expect(page.locator('.save-btn').first()).toBeVisible();
  });

  test('should validate unrealistic weight', async ({ page }) => {
    const weightInput = page.locator('.weight-input').first();
    await weightInput.fill('500');
    
    // Debería aparecer validación error
    await expect(page.locator('.validation-toast.error')).toBeVisible();
  });
});
