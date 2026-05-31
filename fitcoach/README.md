# Fitcoach

Fitcoach es una aplicación web progresiva (PWA) de entrenamiento y seguimiento deportivo construida con **Angular 21** en un entorno de trabajo **Nx**. Utiliza **Supabase** como backend para la gestión de base de datos y autenticación, y cuenta con un sólido sistema de gestión de estado usando **@ngrx/signals**.

## Características Principales

La aplicación está modularizada en varias funcionalidades (features) clave:

- **Auth**: Gestión de autenticación, registro e inicio de sesión de usuarios.
- **Client**: Panel y funcionalidades orientadas al cliente / atleta.
- **Coach**: Panel y herramientas de gestión exclusivas para entrenadores.
- **Workout**: Creación, visualización, y seguimiento de rutinas de entrenamiento.
- **Gamification**: Sistema de gamificación, medallas, niveles y logros para motivar a los atletas.
- **Messages**: Sistema de chat y mensajería (en tiempo real) entre coach y cliente.
- **Invitations**: Gestión de invitaciones de entrenadores a clientes.

## Stack Tecnológico

- **Frontend**: Angular 21 (Standalone Components)
- **Workspace**: Nx (Arquitectura avanzada de Monorepo)
- **State Management**: @ngrx/signals
- **Backend & BaaS**: Supabase (PostgreSQL, Auth, Realtime)
- **Almacenamiento Local**: IndexedDB (`idb`) para almacenamiento robusto en el cliente.
- **Gráficos**: Chart.js para visualización del progreso y analíticas de datos.
- **PWA**: Angular Service Worker (`@angular/pwa`) para capacidades offline y de instalación nativa.

## Configuración y Ejecución

El proyecto utiliza **Nx** para la orquestación de tareas y construcciones.

### Servidor de Desarrollo local

Para iniciar el servidor local de desarrollo, ejecuta:

```sh
npm start
```
o mediante Nx directamente:
```sh
npx nx serve fitcoach
```

### Build de Producción

Para compilar la aplicación para producción:

```sh
npm run build
```

### Testing

Para ejecutar los tests unitarios:

```sh
npm run test
```

## Estructura de Directorios (Frontend)

El código fuente principal se encuentra en `src/app/`, estructurado de la siguiente manera:

- `core/`: Servicios fundamentales de uso general en la app (Auth, base de datos, utilidades, etc.).
- `features/`: Lógica de las distintas funcionalidades de la aplicación.
- `shared/`: Componentes UI, directivas y pipes genéricos reutilizables.
- `state/`: Store central y gestión de estado global a través de NgRx Signals.

## Base de Datos (Supabase) y Scripts de Desarrollo

- `supabase/`: Contiene los scripts SQL y esquemas de la base de datos, así como la estructura del chat, onboarding y las tablas del modelo de la aplicación.
- Existen también varios scripts `.js` utilitarios en la raíz del proyecto para tareas de administración de bases de datos locales (ej. `setup-fresh.js`, `clean-db.js`, `load-master-day1.js`), permitiendo resetear o popular datos con facilidad durante el desarrollo.
