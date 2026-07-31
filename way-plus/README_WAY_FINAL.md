# WAY+ Design System & Architecture v1.0

> Sistema de diseño y arquitectura para terapia infantil gamificada.
> React 18 + TypeScript + Tailwind CSS + Framer Motion + Zustand + Supabase.

---

## 🏗️ Arquitectura de Carpetas
src/
├── core/
│   ├── services/          # Servicios puros (haptics, analytics, notificaciones)
│   ├── stores/            # Zustand stores (config, onboarding)
│   └── hooks/             # Hooks globales (analytics, accessibility sync)
├── shared/
│   ├── components/        # Componentes base WAY+ (Button, Card, Modal...)
│   ├── hooks/             # Hooks reutilizables (optimistic, offline, virtual)
│   └── lib/               # Tokens de diseño (wayTheme, wayResponsive)
├── features/
│   ├── player/            # Experiencia del niño (niveles, juego, recompensas)
│   ├── therapist/         # Portal del terapeuta (dashboard, informes, PDF)
│   └── parents/           # Panel familiar (resumen, consejos, progreso)
└── tests/e2e/             # Playwright: flujo del niño + accesibilidad

---

## 🎨 Tokens de Diseño

```tsx
import { GLASS, BTN, TEXT, way } from '@/shared/lib';

// Glassmorphism
<div className={way(GLASS.card, 'p-4')}>

// Botón
<button className={way(BTN.primary, BTN.sm)}>

// Helper
<div className={way('base', condition && 'extra', className)}>
```

⚡ Performance Checklist
- [ ] useShallow en Zustand para evitar re-renders
- [ ] React.lazy + Suspense para rutas
- [ ] useVirtualList para listas > 50 items
- [ ] Imágenes WebP/AVIF con lazy loading
- [ ] Framer Motion con reduceMotion check
- [ ] Bundle split: react-vendor, animation-vendor, state-vendor

♿ Accesibilidad Checklist
- [ ] min-h-[44px] min-w-[44px] en todo interactivo
- [ ] aria-label en botones de icono
- [ ] role="button" + aria-disabled en cards clickeables
- [ ] aria-live en toasts y notificaciones
- [ ] prefers-reduced-motion respeta reduce-motion class
- [ ] forced-colors con bordes visibles
- [ ] Jerarquía de headings correcta (h1 → h2 → h3)

🧪 Testing
```bash
npm run test:e2e          # Flujo completo del niño
npm run test:e2e:a11y     # WCAG 2.1 AA con axe-core
npm run build:analyze     # Visualizar bundle
npm run audit             # Script de salud del proyecto
```

🚀 CI/CD
GitHub Actions corre en cada PR:
- Lint + TypeCheck
- E2E tests (Playwright)
- Accesibilidad (axe-core)
- Bundle size check (< 200KB inicial)

🔑 Variables de Entorno
```bash
VITE_POSTHOG_KEY=phc_xxx
VITE_POSTHOG_HOST=https://eu.posthog.com
```

📦 Dependencias Principales
| Paquete | Uso |
| --- | --- |
| react + react-dom | UI |
| tailwindcss | Estilos |
| framer-motion | Animaciones |
| zustand | Estado global |
| @tanstack/react-query | Server state |
| posthog-js | Analytics |
| jspdf | Exportación PDF |
| playwright | E2E testing |
