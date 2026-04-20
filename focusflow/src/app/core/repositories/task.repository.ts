import { Injectable } from '@angular/core';
import { db } from './db';
import { Task, TaskCreateDto } from '../models/task.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable({ providedIn: 'root' })
export class TaskRepository {

  async getAll(userId: string): Promise<Task[]> {
    return db.tasks
      .where('userId').equals(userId)
      .and(t => t.status !== 'archived')
      .toArray();
  }

  async getById(id: string): Promise<Task | undefined> {
    return db.tasks.get(id);
  }

  async create(dto: TaskCreateDto, userId: string): Promise<Task> {
    const task: Task = {
      id: uuidv4(),
      title: dto.title,
      notes: dto.notes,
      status: 'inbox',
      context: {
        energyRequired: dto.context.energyRequired ?? 'medium',
        estimatedMinutes: dto.context.estimatedMinutes ?? 30,
        tags: dto.context.tags ?? [],
        projectId: dto.context.projectId,
      },
      deadline: dto.deadline,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId,
      synced: false,
    };

    await db.tasks.add(task);
    return task;
  }

  async update(id: string, changes: Partial<Task>): Promise<void> {
    await db.tasks.update(id, {
      ...changes,
      updatedAt: new Date(),
      synced: false,
    });
  }

  async delete(id: string): Promise<void> {
    await db.tasks.delete(id);
  }

  async getUnsynced(userId: string): Promise<Task[]> {
    return db.tasks
      .where('[userId+synced]')
      .equals([userId, 0])
      .toArray();
  }
}
