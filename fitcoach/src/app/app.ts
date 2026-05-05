import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChatStore } from './state/chat.store';
import { WorkoutEventsService } from './core/services/workout-events.service';
import { ChatService } from './core/services/chat.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class App implements OnInit {
  private chatStore    = inject(ChatStore);
  private events       = inject(WorkoutEventsService);
  private chatService  = inject(ChatService);

  ngOnInit(): void {
    // Suscribir el chat a los eventos de workout completado
    this.events.workoutCompleted$.subscribe(async (event) => {
      const volume = Math.round(event.totalVolume).toLocaleString('es-ES');
      await this.chatService.sendMessage(
        event.clientId,
        event.coachId,
        `${event.clientName} completó un entrenamiento — ${event.totalSets} series · ${volume} kg de volumen`,
        'system'
      );
    });
  }
}
