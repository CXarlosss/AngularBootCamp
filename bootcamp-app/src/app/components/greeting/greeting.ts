import {
  Component,
  input,
  signal,
  computed,
  output,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
} from '@angular/core';

@Component({
  selector: 'app-greeting',
  standalone: true,
  imports: [],
  templateUrl: './greeting.html',
  styleUrl: './greeting.css',
  // changeDetection: ChangeDetectionStrategy.OnPush, // comentado
})
export class Greeting implements OnInit, OnDestroy {
  name = input<string>('Mundo');
  count = signal(0);

  message = computed(() => {
    console.log('🔄 Revisando greeting:', this.name());
    if (this.count() === 0) return 'Aún no has hecho clic';
    if (this.count() < 5) return 'Vas bien';
    return 'Eres un máquina';
  });

  clicked = output<string>();

  ngOnInit() {
    console.log('Componente listo. name =', this.name());
  }

  ngOnDestroy() {
    console.log('Componente destruido. name =', this.name());
  }

  increment() {
    this.count.update((c) => c + 1);
    this.clicked.emit(this.name());
  }
}
