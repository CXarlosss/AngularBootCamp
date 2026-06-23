# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: player-happy-path.spec.ts >> Player Happy Path >> Pedro entra directamente, juega un way y gana monedas
- Location: e2e\player-happy-path.spec.ts:78:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('button').filter({ hasText: /Way 1/i }).first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('button').filter({ hasText: /Way 1/i }).first()

```

```yaml
- banner:
  - text: 🧠 WAY+ 🪙 0
  - button "🔊"
  - button "🦄"
- button "SALIR"
- text: 🌟 ¡Hola, Gamer! ¿Qué aprendemos hoy? 🪙 0 medallas
- 'heading "STEP 1: Primeros Pasos" [level=2]'
- text: 0/1
- 'button "Way 1: Way 1"': "1"
- text: Way 1
- navigation:
  - button "🏠 Inicio"
  - button "🧠 Terapeuta"
  - button "📋 Anexos"
  - button "🏪 Tienda"
  - button "🎒 Mochila"
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Player Happy Path', () => {
  4   |   test.beforeEach(async ({ page }) => {
  5   |     await page.route('**/*', async (route) => {
  6   |       const url = route.request().url();
  7   |       if (!url.includes('supabase.co')) {
  8   |         await route.continue();
  9   |         return;
  10  |       }
  11  | 
  12  |       if (url.includes('patient_profiles')) {
  13  |         await route.fulfill({
  14  |           status: 200,
  15  |           contentType: 'application/json',
  16  |           body: JSON.stringify([{
  17  |             id: '048cc2eb-a861-4ad4-ac1a-2fdf916e430b',
  18  |             coins: 150,
  19  |             current_level: 'pregamer',
  20  |             completed_ways: ['s1-w1', 's1-w2', 's1-w3'],
  21  |             homework_way_ids: ['s2-w1'],
  22  |             accessibility_config: { highContrast: false, largeText: true }
  23  |           }])
  24  |         });
  25  |       } else if (url.includes('/patients')) {
  26  |         await route.fulfill({
  27  |           status: 200,
  28  |           contentType: 'application/json',
  29  |           body: JSON.stringify([{ 
  30  |             id: '048cc2eb-a861-4ad4-ac1a-2fdf916e430b',
  31  |             name: 'Pedro', 
  32  |             avatar_emoji: '🦄',
  33  |             age: 8,
  34  |             gender: 'boy'
  35  |           }])
  36  |         });
  37  |       } else if (url.includes('activity_logs')) {
  38  |         if (route.request().method() === 'POST') {
  39  |           await route.fulfill({ status: 201, body: JSON.stringify({}) });
  40  |         } else {
  41  |           await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
  42  |         }
  43  |       } else if (url.includes('steps')) {
  44  |         await route.fulfill({
  45  |           status: 200,
  46  |           contentType: 'application/json',
  47  |           body: JSON.stringify([
  48  |             {
  49  |               id: 'step-1',
  50  |               level_id: 'pregamer',
  51  |               title: 'Primeros Pasos',
  52  |               order_index: 1,
  53  |               is_published: true,
  54  |               ways: [
  55  |                 {
  56  |                   id: 's2-w1',
  57  |                   type: 'choice',
  58  |                   title: 'Way 1',
  59  |                   name: 'way 1',
  60  |                   order: 1,
  61  |                   is_published: true,
  62  |                   stimulus: { image: '', text: 'Elige la opción correcta' },
  63  |                   options: [
  64  |                     { id: 'opt-1', label: 'Opción A', isCorrect: true },
  65  |                     { id: 'opt-2', label: 'Opción B', isCorrect: false }
  66  |                   ]
  67  |                 }
  68  |               ]
  69  |             }
  70  |           ])
  71  |         });
  72  |       } else {
  73  |         await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
  74  |       }
  75  |     });
  76  |   });
  77  | 
  78  |   test('Pedro entra directamente, juega un way y gana monedas', async ({ page }) => {
  79  |     // Evitamos el PIN para hacer el test más resiliente, ya que PlayerStartPage o login puede variar
  80  |     await page.addInitScript(() => {
  81  |       window.sessionStorage.setItem('way-active-patient', '048cc2eb-a861-4ad4-ac1a-2fdf916e430b');
  82  |       window.sessionStorage.setItem('way-active-pin', '1234');
  83  |     });
  84  | 
  85  |     // 1. Navegar a /player/home donde carga el LevelSelectPage
  86  |     await page.goto('/player/home');
  87  | 
  88  |     // 2. Verificar que se cargó el mapa (ya sea "Tu camino de hoy" o "Hola, Gamer")
  89  |     await expect(page.getByText(/Tu camino de hoy|¡Hola, Gamer!/i)).toBeVisible({ timeout: 10000 });
  90  | 
  91  |     // 3. Hacer click en el way actual (usamos un localizador robusto por nombre)
  92  |     const currentWay = page.locator('button', { hasText: /Way 1/i }).first();
> 93  |     await expect(currentWay).toBeVisible();
      |                              ^ Error: expect(locator).toBeVisible() failed
  94  |     await currentWay.click();
  95  | 
  96  |     // 4. Esperar navegación al WayPlayer
  97  |     await page.waitForURL('**/play/way/**');
  98  | 
  99  |     // 5. Interactuar con los botones de continuar o finalizar
  100 |     const actionButton = page.getByRole('button', { name: /Continuar|Finalizar|Siguiente|Terminar/i }).first();
  101 |     
  102 |     // Iteramos hasta que aparezca el botón de Finalizar y termine el way
  103 |     let tries = 0;
  104 |     while (tries < 10) {
  105 |       if (await page.getByText(/¡LOGRADO!|¡Genial!|Bien hecho|monedas/i).isVisible()) {
  106 |         break;
  107 |       }
  108 |       if (await actionButton.isVisible()) {
  109 |         await actionButton.click();
  110 |       }
  111 |       await page.waitForTimeout(500);
  112 |       tries++;
  113 |     }
  114 | 
  115 |     // 6. Verificar que volvimos al mapa
  116 |     await page.waitForURL('**/player/home');
  117 | 
  118 |     // 7. Screenshot
  119 |     await page.screenshot({ path: 'test-results/happy-path-completed.png' });
  120 |   });
  121 | });
  122 | 
```