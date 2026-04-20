import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { Task, CreateTaskDto, UpdateTaskDto } from '../../../core/models/task.model';

@Injectable({ providedIn: 'root' })
export class TasksService {
  private readonly http = inject(HttpClient);

  // Mock que simula latencia real de backend
  private readonly mockTasks: Task[] = [
    {
      id: '1',
      title: 'Implementar Signal Store',
      description: 'Migrar estado global a @ngrx/signals',
      status: 'in-progress',
      priority: 'high',
      assigneeId: 'user-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dueDate: null,
      tags: ['angular', 'ngrx'],
    },
    {
      id: '2',
      title: 'Configurar interceptors',
      description: 'Auth + error handling',
      status: 'done',
      priority: 'critical',
      assigneeId: 'user-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dueDate: null,
      tags: ['angular'],
    },
    {
      id: '3',
      title: 'Diseñar modelos de dominio',
      description: 'Task, User, DTOs',
      status: 'todo',
      priority: 'medium',
      assigneeId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dueDate: null,
      tags: ['arquitectura'],
    },
  ];

  getAll(): Observable<Task[]> {
    return of(this.mockTasks).pipe(delay(1200));
  }

  getById(id: string): Observable<Task> {
    const task = this.mockTasks.find(t => t.id === id)!;
    return of(task).pipe(delay(600));
  }

  create(dto: CreateTaskDto): Observable<Task> {
    const newTask: Task = {
      ...dto,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return of(newTask).pipe(delay(800));
  }

  update(dto: UpdateTaskDto): Observable<Task> {
    const task = this.mockTasks.find(t => t.id === dto.id)!;
    const updated: Task = {
      ...task,
      ...dto,
      updatedAt: new Date().toISOString(),
    };
    return of(updated).pipe(delay(600));
  }

  delete(id: string): Observable<void> {
    return of(undefined).pipe(delay(500));
  }
}
