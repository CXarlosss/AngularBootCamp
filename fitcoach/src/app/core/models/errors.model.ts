export class WorkoutBlockedError extends Error {
  constructor(message: string = 'DAY_ALREADY_COMPLETED') {
    super(message);
    this.name = 'WorkoutBlockedError';
  }
}
