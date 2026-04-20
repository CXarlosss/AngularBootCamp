import { Component, inject } from "@angular/core";
import { TodoService } from "./todo.service";

@Component({
  selector: "app-todo-list",
  standalone: true, // Es independiente, no necesita "padres" complicados
  template: `
    <div>
      <h1>Mi Gestor de Fitness 🦾</h1>

      @if (todoService.todos().length === 0) {
        <p>El buffer está vacío. Añade tu primer entrenamiento.</p>
      }

      <ul>
        @for (item of todoService.todos(); track item.id) {
          <li>
            {{ item.title }}
            <input type="checkbox" [checked]="item.completed" />
          </li>
        }
      </ul>

      <p>Progreso: {{ todoService.completadas() }} completadas</p>
    </div>
  `,
})
export class TodoListComponent {
  // Conectamos el componente con el almacén
  public todoService = inject(TodoService);
}
