import { ExerciseValidationService } from './exercise-validation.service';

describe('ExerciseValidationService', () => {
  let service: ExerciseValidationService;

  beforeEach(() => {
    service = new ExerciseValidationService();
  });

  it('should reject weight above world record', () => {
    const result = service.validate('press-banca', 400, 5);
    expect(result.valid).toBe(false);
    expect(result.severity).toBe('error');
  });

  it('should warn near world record', () => {
    const result = service.validate('press-banca', 300, 5);
    expect(result.valid).toBe(true);
    expect(result.severity).toBe('warning');
  });

  it('should allow normal weight', () => {
    const result = service.validate('press-banca', 80, 8);
    expect(result.valid).toBe(true);
    expect(result.severity).toBe('info');
  });
});
