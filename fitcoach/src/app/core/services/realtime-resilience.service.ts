import { Injectable, OnDestroy } from '@angular/core';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from '../supabase.client';

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export interface ChannelFilter {
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  schema: string;
  table: string;
  filter?: string;
}

export interface ResilientChannelOptions {
  /** Nombre único del canal (ej. 'conv:abc_xyz') */
  channelName: string;
  /** Configuración de la suscripción a postgres_changes */
  filters: ChannelFilter[];
  /** Callback invocado con cada payload recibido */
  onMessage: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void;
  /** Callback opcional invocado cuando cambia el estado de conexión */
  onStatusChange?: (status: 'CONNECTED' | 'RECONNECTING' | 'DISCONNECTED') => void;
  /** Tiempo base de backoff en ms. Por defecto: 1000 */
  baseDelayMs?: number;
  /** Máximo número de reintentos. Por defecto: 6 (~63s acumulados) */
  maxRetries?: number;
}

// ─── Constantes ────────────────────────────────────────────────────────────────

const DEFAULT_BASE_DELAY_MS = 1000;
const DEFAULT_MAX_RETRIES   = 6;
const BACKOFF_MULTIPLIER    = 2;
const MAX_JITTER_MS         = 500; // Jitter aleatorio para evitar thundering herd

// ─── Servicio ─────────────────────────────────────────────────────────────────

/**
 * RealtimeResilienceService
 *
 * Wrapper sobre los canales de Supabase Realtime que añade:
 *  - Reconexión automática con Exponential Backoff + Jitter
 *  - Gestión limpia del ciclo de vida (sin memory leaks)
 *  - API unificada para chat.service y today-workout.component
 *
 * Uso:
 *   const handle = this.realtimeResilience.subscribe({ channelName, filters, onMessage });
 *   // Para desuscribirse:
 *   handle.destroy();
 */
@Injectable({ providedIn: 'root' })
export class RealtimeResilienceService implements OnDestroy {

  // Mapa de todos los handles activos para limpieza en ngOnDestroy
  private activeHandles = new Set<ChannelHandle>();

  subscribe(options: ResilientChannelOptions): ChannelHandle {
    const handle = new ChannelHandle(options);
    this.activeHandles.add(handle);

    // Eliminamos del set cuando el handle se destruye externamente
    const originalDestroy = handle.destroy.bind(handle);
    handle.destroy = () => {
      originalDestroy();
      this.activeHandles.delete(handle);
    };

    handle.connect();
    return handle;
  }

  ngOnDestroy(): void {
    this.activeHandles.forEach(h => h.destroy());
    this.activeHandles.clear();
  }
}

// ─── ChannelHandle (clase interna, no exportada como provider) ────────────────

/**
 * Encapsula el ciclo de vida de un único canal Realtime con backoff.
 * No se usa directamente — se obtiene a través de RealtimeResilienceService.subscribe()
 */
export class ChannelHandle {

  private channel: RealtimeChannel | null = null;
  private retryCount  = 0;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private destroyed   = false;

  private readonly channelName:    string;
  private readonly filters:        ChannelFilter[];
  private readonly onMessage:      ResilientChannelOptions['onMessage'];
  private readonly onStatusChange: ResilientChannelOptions['onStatusChange'];
  private readonly baseDelayMs:    number;
  private readonly maxRetries:     number;

  constructor(options: ResilientChannelOptions) {
    this.channelName    = options.channelName;
    this.filters        = options.filters;
    this.onMessage      = options.onMessage;
    this.onStatusChange = options.onStatusChange;
    this.baseDelayMs    = options.baseDelayMs ?? DEFAULT_BASE_DELAY_MS;
    this.maxRetries     = options.maxRetries  ?? DEFAULT_MAX_RETRIES;
  }

  // ── Conexión inicial / reconexión ─────────────────────────────────────────

  connect(): void {
    if (this.destroyed) return;

    this._clearRetryTimer();
    this._cleanupChannel();

    // Construimos el canal con todos los filtros declarados
    let builder = supabase.channel(this.channelName);

    for (const f of this.filters) {
      builder = builder.on(
        'postgres_changes' as never,
        {
          event:  f.event,
          schema: f.schema,
          table:  f.table,
          ...(f.filter ? { filter: f.filter } : {}),
        },
        (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          this.onMessage(payload);
        }
      );
    }

    this.channel = builder.subscribe((status) => {
      console.log(`[Realtime:${this.channelName}] status →`, status);
      this._handleStatus(status);
    });
  }

  // ── Destrucción explícita ─────────────────────────────────────────────────

  destroy(): void {
    this.destroyed = true;
    this._clearRetryTimer();
    this._cleanupChannel();
    console.log(`[Realtime:${this.channelName}] canal destruido.`);
  }

  // ── Gestión de estados ────────────────────────────────────────────────────

  private _handleStatus(status: string): void {
    switch (status) {
      case 'SUBSCRIBED':
        this.retryCount = 0; // Reset al conectar con éxito
        this.onStatusChange?.('CONNECTED');
        break;

      case 'TIMED_OUT':
      case 'CHANNEL_ERROR':
        this.onStatusChange?.('RECONNECTING');
        this._scheduleReconnect();
        break;

      case 'CLOSED':
        // CLOSED puede ser intencional (unsubscribe manual) o por red.
        // Solo reconectamos si el handle sigue activo.
        if (!this.destroyed) {
          this.onStatusChange?.('RECONNECTING');
          this._scheduleReconnect();
        } else {
          this.onStatusChange?.('DISCONNECTED');
        }
        break;
    }
  }

  // ── Exponential Backoff con Jitter ────────────────────────────────────────

  private _scheduleReconnect(): void {
    if (this.destroyed) return;

    if (this.retryCount >= this.maxRetries) {
      console.warn(
        `[Realtime:${this.channelName}] Máximo de reintentos alcanzado (${this.maxRetries}). Se detiene la reconexión.`
      );
      this.onStatusChange?.('DISCONNECTED');
      return;
    }

    const exponentialDelay = this.baseDelayMs * Math.pow(BACKOFF_MULTIPLIER, this.retryCount);
    const jitter           = Math.random() * MAX_JITTER_MS;
    const delay            = Math.round(exponentialDelay + jitter);

    this.retryCount++;
    console.log(
      `[Realtime:${this.channelName}] Reintento ${this.retryCount}/${this.maxRetries} en ${delay}ms...`
    );

    this.retryTimer = setTimeout(() => {
      if (!this.destroyed) this.connect();
    }, delay);
  }

  // ── Limpieza interna ──────────────────────────────────────────────────────

  private _cleanupChannel(): void {
    if (this.channel) {
      this.channel.unsubscribe();
      this.channel = null;
    }
  }

  private _clearRetryTimer(): void {
    if (this.retryTimer !== null) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
  }
}
