# ROADMAP POST-PILOTAJE (No tocar hasta 2026-05-24)

## 🔴 Riesgos Críticos (Semana 1)
1. **Testing de integración mínimo:** Implementar 3 tests básicos con Playwright (Login PIN -> Way -> Logs; Persistencia F5; Cierre pestaña).
2. **Activación de RLS:** Activar políticas de aislamiento por `therapist_id` antes de añadir un segundo terapeuta.
3. **Rate Limiting en activity_logs:** Añadir debounce (500ms) para evitar saturación de la base de datos por clicks rápidos.

## 🟠 Limitadores de Crecimiento (1-2 meses)
4. **Multi-tenancy real:** Completar el aislamiento total de datos por terapeuta.
5. **Backup de datos clínicos:** Exportación semanal automática a Supabase Storage.
6. **Indicador de Sync visible:** Punto verde/rojo en la UI para indicar estado del circuit breaker/sincronización.

## 🟢 Ideas Nuevas y UX
7. **Notas de sesión para Maite:** Campo de texto libre en `PatientDetailView` con timestamp.
8. **PIN configurable por paciente:** Permitir cambiar el `0000` por defecto desde el panel.
9. **Vista de sesión histórica:** Filtro por fecha en telemetría para ver evolución a largo plazo.

---
**Nota:** Estas ideas se revisarán en la reunión del 24 de mayo con los datos reales del pilotaje. La mitad de ellas se validarán con el uso de Maite y la otra mitad podrían cambiar.
