import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { eventBus } from './eventBus';

describe('EventBus', () => {
  beforeEach(() => eventBus._clearAll());
  afterEach(() => eventBus._clearAll());

  it('llama al listener cuando se emite el evento', () => {
    const handler = vi.fn();
    eventBus.on('WAY_COMPLETED', handler);
    eventBus.emit('WAY_COMPLETED', { wayId: 'way-1', attempts: 1, isFirstTime: true });
    expect(handler).toHaveBeenCalledOnce();
    expect(handler).toHaveBeenCalledWith({ wayId: 'way-1', attempts: 1, isFirstTime: true });
  });

  it('no registra el mismo listener dos veces (Set behavior)', () => {
    const handler = vi.fn();
    eventBus.on('WAY_COMPLETED', handler);
    eventBus.on('WAY_COMPLETED', handler);
    eventBus.emit('WAY_COMPLETED', { wayId: 'way-1', attempts: 1, isFirstTime: true });
    expect(handler).toHaveBeenCalledOnce();
  });

  it('continúa llamando a otros listeners si uno lanza error', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const badHandler = vi.fn(() => { throw new Error('crash'); });
    const goodHandler = vi.fn();
    eventBus.on('WAY_COMPLETED', badHandler);
    eventBus.on('WAY_COMPLETED', goodHandler);
    expect(() => 
      eventBus.emit('WAY_COMPLETED', { wayId: 'way-1', attempts: 1, isFirstTime: true })
    ).not.toThrow();
    expect(goodHandler).toHaveBeenCalledOnce();
  });

  it('la función de cleanup devuelta por on() funciona', () => {
    const handler = vi.fn();
    const cleanup = eventBus.on('WAY_COMPLETED', handler);
    cleanup();
    eventBus.emit('WAY_COMPLETED', { wayId: 'way-1', attempts: 1, isFirstTime: true });
    expect(handler).not.toHaveBeenCalled();
  });
});
