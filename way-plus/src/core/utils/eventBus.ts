/**
 * eventBus.ts — Bus de eventos tipado para desacoplar stores.
 */

export interface WayPlusEvents {
  WAY_COMPLETED: {
    wayId: string;
    attempts: number;
    isFirstTime: boolean;  // true si es la primera vez que se completa
  };
  STEP_COMPLETED: {
    stepNumber: number;    // 1 = Relajación, 2 = Autonomía, 3 = Asertividad
    totalWays: number;
  };
  DAILY_CHALLENGE_COMPLETED: {
    wayId: string;
  };
  TUTORIAL_COMPLETED: Record<string, never>;
}

export type EventName = keyof WayPlusEvents;
export type EventPayload<E extends EventName> = WayPlusEvents[E];
type Listener<E extends EventName> = (payload: EventPayload<E>) => void;

class EventBus {
  private listeners = new Map<EventName, Set<Listener<any>>>();

  emit<E extends EventName>(event: E, payload: EventPayload<E>): void {
    const handlers = this.listeners.get(event);
    if (!handlers) return;
    for (const handler of [...handlers]) {
      try {
        handler(payload);
      } catch (e) {
        console.error(`[EventBus] Error en handler de "${event}":`, e);
      }
    }
  }

  on<E extends EventName>(event: E, listener: Listener<E>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
    return () => this.off(event, listener);
  }

  off<E extends EventName>(event: E, listener: Listener<E>): void {
    this.listeners.get(event)?.delete(listener);
  }

  _clearAll(): void {
    this.listeners.clear();
  }

  _listenerCount(event: EventName): number {
    return this.listeners.get(event)?.size ?? 0;
  }
}

export const eventBus = new EventBus();
