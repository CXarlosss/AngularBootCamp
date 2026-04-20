import Dexie, { type EntityTable } from 'dexie';
import { Task } from '../models/task.model';

class FocusFlowDB extends Dexie {
  tasks!: EntityTable<Task, 'id'>;

  constructor() {
    super('FocusFlowDB');

    this.version(1).stores({
      tasks: 'id, userId, [userId+status], [userId+synced], deadline, createdAt',
    });
  }
}

export const db = new FocusFlowDB();
