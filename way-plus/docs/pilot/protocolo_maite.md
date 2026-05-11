# WAY+ — Guía de uso para la sesión

## Antes de empezar:
1. Entra en tu panel: localhost:5174/therapist (o la URL que uses).
2. Elige al niño con el que vas a trabajar.
3. Ve a la pestaña "Casa" y marca los ejercicios que quieres que haga esta semana. Pulsa "Guardar tareas".
4. Dale la tablet al niño.

## Durante la sesión:
5. El niño introduce su PIN (por defecto 0000 si no lo cambiaste).
6. Verá sus ejercicios en la parte de arriba, destacados con un icono 🎯.
7. Déjalo jugar. No le digas qué hacer a menos que se atasque.
8. Si necesitas la tablet para otro niño, pulsa el botón "Salir" (esquina superior derecha).

## Después de la sesión:
9. Ve a la pestaña "Telemetría" en el perfil del niño.
10. Mira el feed de actividad y los tiempos por ejercicio.
11. Si quieres llevar datos a una reunión, pulsa "Descargar Historial (CSV)".

---

# Checklist de campo
*Una hoja por niño por semana*

**Semana del:** ___ al ___
**Niño:** _________________
**Terapeuta:** Maite

□ 1. ¿Dejaste ejercicios en "Tu camino de hoy"?
   Cantidad: ___  ¿El niño los hizo todos? Sí / No / Parcial

□ 2. ¿Miraste la pestaña "Telemetría"?
   ¿Te sorprendió algún dato? _________________________________

□ 3. ¿El niño se frustó con algún ejercicio específico?
   Way: _______________  ¿Cuántos intentos hizo? ___

□ 4. ¿Hubo algún momento sin WiFi?
   ¿El niño notó que algo no se guardaba? Sí / No / No estoy segura

□ 5. ¿Los padres preguntaron algo sobre el progreso en casa?
   ___________________________________________________________

□ 6. ¿Hubo pantalla en blanco, cierre inesperado o error visible?
   Sí / No  → Si sí, describe: _________________________________

□ 7. ¿El niño intentó tocar el botón "Salir" o salirse de la app?
   Sí / No

□ 8. ¿Usaste el botón "Descargar Historial (CSV)"?
   Sí / No  → ¿Para qué? _____________________________________

**NOTA LIBRE:** ¿Qué echas en falta o qué te gustaría que hiciera la app?
_____________________________________________________________

---

# Protocolo de emergencia (si algo se rompe)

| Síntoma | Qué hacer | No hacer |
| :--- | :--- | :--- |
| El niño no puede entrar con PIN | Verifica que Maite configuró la tablet desde el panel. Si no, configúrala. | No toques PlayerLoginPage.tsx. |
| Las medallas no suben | Espera 10 segundos y recarga. Si sigue igual, anótalo. | No toques SyncEngine.ts. |
| Pantalla en blanco | Recarga (F5). Si persiste, cierra pestaña y vuelve a entrar. | No toques el bundle ni el router. |
| Maite no ve datos en Telemetría | Asegúrate de que el niño completó al menos un way. Espera 30 segundos. | No toques analyticsService.ts. |
| Error visible en rojo | Screenshot + anota el mensaje. No lo borres. | No toques nada hasta que termine la semana. |

**Regla de oro:** Si se puede solucionar con una recarga o reconfiguración, se hace así. Si no, se anota y se arregla después del pilotaje.

---

# Cuándo nos volvemos a reunir
**Fecha objetivo:** 2 semanas a partir de hoy (2026-05-24).

**Qué necesito que me traigas:**
* Las checklists de campo rellenas (foto o escaneo).
* El CSV descargado de al menos un niño (para ver qué datos capturamos).
* Una lista de 3 cosas que funcionaron bien y 3 cosas que no.
* La pregunta más frecuente de los padres (si la hay).

**Con eso decidiremos:**
Si el siguiente esfuerzo va a UX (diseño de tareas), telemetría (simplificar el panel), infraestructura (IndexedDB/RLS), o features nuevas (Family Hub).

---

# Mi última instrucción
No abras el código esta semana. Ni para un "fix rápido". Ni para "mejorar un color". Ni para "añadir un log".
Si se te ocurre algo, escríbelo en esta lista y déjalo reposar:
