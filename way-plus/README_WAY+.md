# WAY+ Design System
Sistema de diseño para aplicación de terapia infantil gamificada.

React 19 + TypeScript + Tailwind CSS + Framer Motion + Zustand

## 📋 Índice
1. Arquitectura
2. Instalación Rápida
3. Tokens de Diseño
4. Componentes Base
5. Accesibilidad
6. Haptics
7. Responsive
8. Convenciones de Código
9. Checklist de Componentes
10. Contribución

## 🏗️ Arquitectura
```text
src/
├── shared/
│   ├── lib/
│   │   ├── wayTheme.ts          # Tokens de diseño
│   │   └── wayResponsive.ts     # Utilidades responsive
│   └── components/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Select.tsx
│       ├── Avatar.tsx
│       ├── BottomNav.tsx
│       ├── InteractiveCard.tsx
│       ├── Modal.tsx
│       ├── Toast.tsx
│       ├── LoadingSpinner.tsx
│       └── CelebrationOverlay.tsx
├── core/
│   ├── services/
│   │   └── hapticService.ts     # Vibración táctil
│   └── hooks/
│       └── useAccessibilitySync.ts
└── index.css                    # CSS global auditado
```

## 🚀 Instalación Rápida

**1. Importar tokens en cada componente**
```tsx
import { GLASS, BTN, TEXT, PROGRESS, STATUS, DECORATIVE, A11Y, way } from '@/shared/lib/wayTheme';
import { rw, RESPONSIVE, MODAL, SAFE, SIZE, HEADER, CONTAINER, TABLE } from '@/shared/lib/wayResponsive';
import { hapticService } from '@/core/services/hapticService';
```

**2. Sincronizar accesibilidad global**
```tsx
// App.tsx
import { useAccessibilitySync } from '@/core/hooks/useAccessibilitySync';

export default function App() {
  useAccessibilitySync(); // ← Una línea, todo sincronizado
  return <YourApp />;
}
```

**3. Asegurar que index.css esté importado**
```tsx
// main.tsx
import './index.css';
```

## 🎨 Tokens de Diseño

**Glassmorphism (GLASS)**

| Token | Clases Tailwind |
|-------|-----------------|
| `GLASS.main` | `bg-white/80 backdrop-blur-md` |
| `GLASS.card` | `bg-white/80 backdrop-blur-md border border-white/20 shadow-xl` |
| `GLASS.cardSolid` | `bg-white/95 backdrop-blur-sm border border-white/30 shadow-lg` |
| `GLASS.header` | `bg-white/90 backdrop-blur-lg border-b border-white/20 shadow-sm` |
| `GLASS.modalOverlay` | `bg-slate-900/40 backdrop-blur-sm` |
| `GLASS.modalContent` | `bg-white/95 backdrop-blur-xl border border-white/30 shadow-2xl rounded-3xl` |
| `GLASS.bottomNav` | `bg-white/90 backdrop-blur-lg border-t border-white/20 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]` |

Uso:
```tsx
<div className={way(GLASS.card, 'p-4 rounded-3xl')}>
  Contenido
</div>
```

**Botones (BTN)**

| Variante | Uso |
|----------|-----|
| `BTN.primary` | Acción principal |
| `BTN.secondary` | Acción alternativa |
| `BTN.ghost` | Acción sutil |
| `BTN.icon` | Solo ícono |
| `BTN.close` | Cerrar modal/drawer |
| `BTN.claim` | Reclamar recompensa |
| `BTN.remind` | Recordatorio |

*Todas incluyen: `min-h-[44px]`, `hover:scale-[1.02]`, `active:scale-95`, `focus-visible:ring-4`, `forced-colors`.*

**Tipografía (TEXT)**

| Token | Tamaño | Uso |
|-------|--------|-----|
| `TEXT.title` | `text-2xl sm:text-3xl` | Título de pantalla |
| `TEXT.subtitle` | `text-lg sm:text-xl` | Subtítulo / sección |
| `TEXT.label` | `text-sm uppercase` | Etiqueta de campo |
| `TEXT.micro` | `text-xs` | Hint, caption, metadata |

**Estados (STATUS)**

| Token | Colores |
|-------|---------|
| `STATUS.completed` | `text-emerald-600 bg-emerald-50 border-emerald-200` |
| `STATUS.current` | `text-indigo-600 bg-indigo-50 border-indigo-200` |
| `STATUS.locked` | `text-slate-400 bg-slate-100 border-slate-200` |
| `STATUS.warning` | `text-amber-600 bg-amber-50 border-amber-200` |
| `STATUS.error` | `text-rose-600 bg-rose-50 border-rose-200` |

**Progress (PROGRESS)**
```tsx
<div className="h-3 w-full rounded-full bg-slate-200/60">
  <div className={PROGRESS.fill('emerald')} style={{ width: '75%' }} />
</div>
// Colores: 'indigo' | 'emerald' | 'amber' | 'violet'
```

**Decorativos (DECORATIVE)**
```tsx
<div className={DECORATIVE.orb('indigo', 'top-right')} aria-hidden="true" />
// Posiciones: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'
```

**Combinador (way)**
```tsx
way(GLASS.card, BTN.primary, isActive && STATUS.current, 'px-8')
// Filtra falsy values y une con espacio
```

## 📱 Responsive

**Grids (RESPONSIVE)**
```tsx
<div className={RESPONSIVE.gridShop}>     {/* 1 col → 2 col */}
<div className={RESPONSIVE.gridAlbum}>    {/* 2 col → 3 col */}
<div className={RESPONSIVE.gridCloset}>   {/* 3 col → 4 col */}
<div className={RESPONSIVE.gridZen}>      {/* 1 col, espaciado amplio */}
<div className={RESPONSIVE.gridSecrets}>  {/* 2 col → 3 col */}
```

**Safe Areas (SAFE)**
```tsx
<div className={way(CONTAINER.containerMobile, SAFE.safeBottom, 'pb-24')}>
```

**Helper (rw)**
```tsx
rw('gridShop', 'mt-4')        // Combina token + clases extra
rw('modalWidth', 'mx-auto')   // Modal centrado
```

## 🧩 Componentes Base

**Button**
```tsx
import { Button } from '@/shared/components/Button';

<Button variant="primary" size="lg" leftIcon={<StarIcon />}>
  Comenzar
</Button>

<Button variant="claim" onClick={handleClaim}>
  Reclamar Recompensa
</Button>

<Button variant="icon" aria-label="Cerrar" noHaptic>
  <XIcon />
</Button>
```

**Input**
```tsx
import { Input } from '@/shared/components/Input';

<Input
  label="Nombre"
  placeholder="Ej: Lucía"
  leftIcon={<UserIcon className="h-5 w-5" />}
  error="Campo requerido"
/>

<Input isTextarea label="Notas" rows={4} />
```

**Select**
```tsx
import { Select } from '@/shared/components/Select';

<Select
  label="Dificultad"
  value={value}
  onChange={setValue}
  options={[
    { value: 'easy', label: 'Fácil', icon: '🟢' },
    { value: 'medium', label: 'Medio', icon: '🟡' },
    { value: 'hard', label: 'Difícil', icon: '🔴' },
  ]}
/>
```

**Modal**
```tsx
import { Modal } from '@/shared/components/Modal';

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirmar"
  primaryAction={{ label: 'Sí', onClick: confirm, variant: 'claim' }}
  secondaryAction={{ label: 'No', onClick: () => setIsOpen(false) }}
>
  <p>¿Estás seguro?</p>
</Modal>
```

**Toast (con hook)**
```tsx
import { ToastContainer, useToast } from '@/shared/components/Toast';

const { toasts, dismissToast, success, error } = useToast();

success('¡Nivel completado!', { duration: 4000 });
error('Error', { action: { label: 'Reintentar', onClick: retry } });

// En App.tsx:
<ToastContainer toasts={toasts} onDismiss={dismissToast} position="top-right" />
```

**LoadingSpinner**
```tsx
import { LoadingSpinner, FullScreenLoader, Skeleton, SkeletonCard } from '@/shared/components/LoadingSpinner';

<LoadingSpinner size="md" />
<FullScreenLoader message="Cargando..." showOrbs />
<Skeleton className="h-4 w-3/4" count={3} />
<SkeletonCard />
```

**CelebrationOverlay**
```tsx
import { CelebrationOverlay } from '@/shared/components/CelebrationOverlay';

<CelebrationOverlay
  isVisible={show}
  onClose={() => setShow(false)}
  title="¡Nivel completado!"
  reward={{ type: 'estrellas', amount: 50, icon: '⭐' }}
  primaryAction={{ label: 'Siguiente nivel', onClick: nextLevel }}
/>
```

## ♿ Accesibilidad

**Reglas Inquebrantables**
1. **Área táctil mínima:** Todo elemento interactivo debe tener `min-h-[44px] min-w-[44px]`
2. **Focus visible:** `focus-visible:ring-4 focus-visible:ring-indigo-500/50 focus-visible:outline-none`
3. **Alto contraste:** `forced-colors:border-2 forced-colors:border-[#1E1B4B]` en TODO interactivo
4. **Reduce motion:** Respetar `prefers-reduced-motion` + clase `.reduce-motion`
5. **Contraste WCAG AA:** NUNCA usar `text-gray-400` sobre fondo claro. Mínimo `text-slate-500`
6. **Labels:** `aria-label`, `aria-describedby`, `aria-live` donde aplique
7. **Roles semánticos:** `role="button"`, `role="alert"`, `role="progressbar"`, etc.

**Sincronización con Store**
```tsx
// El hook useAccessibilitySync maneja automáticamente:
// - document.body.classList.toggle('reduce-motion')
// - document.body.classList.toggle('high-contrast')
// - hapticService.setConfig({ enabled, respectReducedMotion })
```

## 📳 Haptics

**Patrones Disponibles**

| Patrón | Duración | Uso típico |
|--------|----------|------------|
| `click` | `20ms` | Botones, toggles |
| `success` | `50,30,50ms` | Acierto, completado |
| `error` | `100,50,100ms` | Error, bloqueado |
| `celebration` | `50,30,50,30,100ms` | Cofre, nivel completado |
| `milestone` | `30,20,30,20,30,50,100ms` | Reclamar recompensa |

Uso:
```tsx
import { hapticService } from '@/core/services/hapticService';

hapticService.click();        // Click simple
hapticService.success();      // Éxito
hapticService.error();        // Error
hapticService.celebration();  // Celebración
hapticService.milestone();    // Logro

// O directamente:
hapticService.trigger('success');
```

## 📝 Convenciones de Código

**Nomenclatura**
- **Tokens:** MAYÚSCULAS (ej: `GLASS.card`, `BTN.primary`)
- **Funciones helper:** camelCase (ej: `way()`, `rw()`)
- **Componentes:** PascalCase (ej: `Button`, `InteractiveCard`)
- **Hooks:** use + PascalCase (ej: `useToast`, `useAccessibilitySync`)

**Estructura de Componentes**
```tsx
// 1. Imports
// 2. Types/Interfaces
// 3. Constants/Config
// 4. Componente principal
// 5. Sub-componentes (si aplica)
// 6. Iconos inline
// 7. Ejemplos de uso (comentados)
// 8. Export default
```

**CSS**
- CERO archivos `.css` por componente. Todo en Tailwind.
- Usar `way()` para combinar tokens + clases condicionales.
- NUNCA sombras negras puras. Usar `shadow-indigo-500/20`, `shadow-emerald-500/10`.
- Bordes redondeados mínimo `rounded-2xl`, preferible `rounded-3xl`.

## ✅ Checklist de Componentes
Antes de dar por terminado un componente, verificar:

- [ ] Glassmorphism en cards: `GLASS.card`
- [ ] Sombras de color, nunca negras
- [ ] Bordes redondeados: mínimo `rounded-2xl`
- [ ] Área táctil: `min-h-[44px] min-w-[44px]`
- [ ] Focus: `focus-visible:ring-4 focus-visible:ring-indigo-500/50`
- [ ] Hover: `hover:scale-[1.02] hover:-translate-y-0.5`
- [ ] Active: `active:scale-95`
- [ ] `forced-colors` en TODO interactivo
- [ ] `aria-label`, `role`, `aria-live` donde aplique
- [ ] `hapticService.click()` en botones táctiles
- [ ] Respetar `prefers-reduced-motion`
- [ ] Contraste WCAG AA (`text-slate-500` mínimo)
- [ ] Zero archivos `.css` — todo en Tailwind + Framer Motion

## 🤝 Contribución

**Agregar un nuevo componente**
1. Crear archivo en `src/shared/components/NombreComponente.tsx`
2. Importar tokens WAY+ al inicio
3. Seguir la estructura de componentes base existentes
4. Aplicar el checklist de arriba
5. Agregar ejemplos de uso en comentarios al final
6. Exportar como named export + default export

**Agregar un nuevo token**
- Si es glassmorphism → `GLASS`
- Si es color de estado → `STATUS`
- Si es tipografía → `TEXT`
- Si es responsive → `RESPONSIVE` o `MODAL` o `SAFE`
- Documentar en este README

## 🎨 Paleta de Colores WAY+

| Uso | Color Tailwind | Hex |
|-----|----------------|-----|
| Primario | `indigo-500/600` | `#6366F1` / `#4F46E5` |
| Éxito | `emerald-500` | `#10B981` |
| Advertencia | `amber-400/500` | `#FBBF24` / `#F59E0B` |
| Error | `rose-500` | `#F43F5E` |
| Especial | `violet-500` | `#8B5CF6` |
| Texto títulos | `slate-900` | `#0F172A` |
| Texto body | `slate-800` | `#1E293B` |
| Texto labels | `slate-600` | `#475569` |
| Texto micro | `slate-500` | `#64748B` |
| Fondo | `slate-50/100` | `#F8FAFC` / `#F1F5F9` |

## 📄 Licencia
Interno — Uso exclusivo del proyecto de terapia infantil gamificada.
Documentación generada para WAY+ Design System v1.0
