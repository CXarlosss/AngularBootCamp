// ❌ FALTABA — El interface Todo (contrato de datos)
// Sin esto, TypeScript no sabe qué forma tiene una tarea
// y no puede avisarte si escribes algo mal
interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

// 🔧 CORREGIDO — faltaba importar Injectable, signal y computed
import { Injectable, signal, computed } from "@angular/core";

@Injectable({ providedIn: "root" }) // ✅ ESTABA BIEN
export class TodoService {

  // 🔧 CORREGIDO — signal<any[]> → signal<Todo[]>
  // "any" desactiva la protección de TypeScript.
  // Con Todo[] TypeScript avisa si intentas poner datos incorrectos.
  public todos = signal<Todo[]>([]);

  // ✅ ESTABA BIEN — computed se actualiza solo cuando cambia todos()
  public completadas = computed(
    () => this.todos().filter((t) => t.completed).length,
  );

  // ✅ ESTABA BIEN
  addTodo(texto: string) {
    const nuevaTarea: Todo = { id: Date.now(), title: texto, completed: false };
    this.todos.update((listaActual) => [...listaActual, nuevaTarea]);
  }

  // ❌ FALTABA — toggleTodo
  // Cambia completed de true→false o false→true
  // map() recorre el array y devuelve uno nuevo con el elemento modificado
  toggleTodo(id: number) {
    this.todos.update((lista: Todo[]) =>
      lista.map((t: Todo) =>
        t.id === id
          ? { ...t, completed: !t.completed } // este: inviértelo
          : t                                  // los demás: sin cambios
      )
    );
  }

  // ❌ FALTABA — removeTodo
  // filter() devuelve un nuevo array SIN el elemento con ese id
  removeTodo(id: number) {
    this.todos.update((lista: Todo[]) => lista.filter((t: Todo) => t.id !== id));
  }
}
