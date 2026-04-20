import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import { ChatWindowComponent } from '../../shared/chat/chat-window.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'fc-client-chat',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ChatWindowComponent],
  template: `
    @if (coachId() && coachName()) {
      <fc-chat-window
        [partnerId]="coachId()!"
        [partnerName]="coachName()!"
      />
    } @else {
      <div style="display:flex;align-items:center;justify-content:center;height:100dvh;background:#0a0c12;color:#5F5E5A;font-size:13px">
        Cargando chat...
      </div>
    }
  `,
})
export class ClientChatComponent implements OnInit {
  private auth = inject(AuthService);

  coachId   = signal<string | null>(null);
  coachName = signal<string>('Tu entrenador');

  async ngOnInit(): Promise<void> {
    const profile = this.auth.profile();
    if (profile?.coachId) {
      this.coachId.set(profile.coachId);
    }
  }
}
