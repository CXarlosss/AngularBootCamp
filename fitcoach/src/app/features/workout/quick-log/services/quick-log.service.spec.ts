import { TestBed } from '@angular/core/testing';
import { QuickLogService } from './quick-log.service';

describe('QuickLogService', () => {
  let service: QuickLogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuickLogService);
    sessionStorage.clear();
  });

  describe('adjustWeight', () => {
    it('should round to nearest 0.5kg', () => {
      expect(service.adjustWeight(20, 2.5)).toBe(22.5);
      expect(service.adjustWeight(22.5, 1.25)).toBe(23.5); // 23.75 → 24? No, 23.5
      expect(service.adjustWeight(10, -5)).toBe(5);
    });

    it('should never return negative', () => {
      expect(service.adjustWeight(2, -5)).toBe(0);
    });
  });

  describe('saveLastSet + suggestedWeight', () => {
    it('should suggest last weight for same exercise', () => {
      service.saveLastSet('bench-press', 80, 8, 1);
      expect(service.suggestedWeight()).toBe(80);
      expect(service.suggestedReps()).toBe(8);
    });

    it('should persist to sessionStorage', () => {
      service.saveLastSet('squat', 100, 10, 1);
      const stored = JSON.parse(sessionStorage.getItem('fitcoach_quicklog')!);
      expect(stored.lastWeight).toBe(100);
    });
  });
});
