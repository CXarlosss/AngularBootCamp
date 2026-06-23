# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: family-flow.spec.ts >> Family Flow Multi-page >> Padre abre link mágico y ve datos reales y cambia de UI
- Location: e2e\family-flow.spec.ts:4:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=✅').first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=✅').first()

```

```yaml
- banner:
  - text: 🧠 WAY+ 🪙 500
  - button "🔊"
  - button "🦄"
- text: 👤
- heading "Progreso de Paciente" [level=1]
- paragraph: 🏫 WAY+ Centro Clínico
- text: 😄 Paciente ha completado 1 retos esta semana 1 Retos semana 10 Min semana 1 Días activo
- heading "Tareas para casa" [level=2]
- text: No hay tareas asignadas por Maite ahora mismo.
- heading "Últimos logros" [level=2]
- text: "🏆 Comenzando la aventura 🐉 Desbloqueó: Dragón Azul"
- navigation:
  - button "🏠 Inicio"
  - button "🧠 Terapeuta"
  - button "📋 Anexos"
  - button "🏪 Tienda"
  - button "🎒 Mochila"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Family Flow Multi-page', () => {
  4  |   test('Padre abre link mágico y ve datos reales y cambia de UI', async ({ page }) => {
  5  |     await page.route('**/*', async (route) => {
  6  |       const url = route.request().url();
  7  |       if (!url.includes('supabase.co')) {
  8  |         await route.continue();
  9  |         return;
  10 |       }
  11 | 
  12 |       if (url.includes('family-auth')) {
  13 |         if (route.request().method() === 'POST') {
  14 |           const body = JSON.parse(route.request().postData() || '{}');
  15 |           if (body.token === 'test-token') {
  16 |             await route.fulfill({
  17 |               status: 200,
  18 |               contentType: 'application/json',
  19 |               body: JSON.stringify({ patient_id: '048cc2eb-a861-4ad4-ac1a-2fdf916e430b', valid: true })
  20 |             });
  21 |           } else {
  22 |             await route.fulfill({ status: 400, body: JSON.stringify({ error: 'invalid token' }) });
  23 |           }
  24 |         }
  25 |       } else if (url.includes('patient_profiles')) {
  26 |         await route.fulfill({
  27 |           status: 200,
  28 |           contentType: 'application/json',
  29 |           body: JSON.stringify([{
  30 |             id: '048cc2eb-a861-4ad4-ac1a-2fdf916e430b',
  31 |             coins: 200,
  32 |             current_level: 'pregamer',
  33 |             completed_ways: ['s1-w1']
  34 |           }])
  35 |         });
  36 |       } else if (url.includes('/patients')) {
  37 |         await route.fulfill({
  38 |           status: 200,
  39 |           contentType: 'application/json',
  40 |           body: JSON.stringify([{
  41 |             id: '048cc2eb-a861-4ad4-ac1a-2fdf916e430b',
  42 |             name: 'Pedro',
  43 |             avatar_emoji: '👦',
  44 |             gender: 'masculino',
  45 |             homework_way_ids: ['s1-w1', 's2-w2']
  46 |           }])
  47 |         });
  48 |       } else if (url.includes('activity_logs')) {
  49 |         await route.fulfill({
  50 |           status: 200,
  51 |           contentType: 'application/json',
  52 |           body: JSON.stringify([
  53 |             { way_id: 's1-w1', action: 'way_completed', created_at: new Date().toISOString(), metadata: { durationSeconds: 600 } }
  54 |           ])
  55 |         });
  56 |       } else {
  57 |         await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
  58 |       }
  59 |     });
  60 | 
  61 | 
  62 |     // 2. Visit family dashboard with test token
  63 |     await page.goto('/family/test-token');
  64 | 
  65 |     // 3. Verify it loads and shows Pedro's progress
  66 |     // Wait for the h1 to appear using getByRole
  67 |     await expect(page.getByRole('heading', { name: /Progreso de (Pedro|Paciente)/i })).toBeVisible({ timeout: 10000 });
  68 | 
  69 |     // Verify stats with simple text locator to avoid span breaks
  70 |     await expect(page.locator('text=1 retos').or(page.locator('text=1 Retos'))).toBeVisible();
  71 | 
  72 |     // Verify homework tracker check
> 73 |     await expect(page.locator('text=✅').first()).toBeVisible();
     |                                                  ^ Error: expect(locator).toBeVisible() failed
  74 |     
  75 |     // Check if there is a reminder button for the pending one
  76 |     const remindButton = page.getByRole('button', { name: /Recordar a Pedro/i });
  77 |     await expect(remindButton).toBeVisible();
  78 |   });
  79 | });
  80 | 
```