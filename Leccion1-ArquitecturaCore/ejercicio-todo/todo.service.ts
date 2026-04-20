// ============================================================
// ARCHIVO: todo.service.ts
// ============================================================
// Un "servicio" en Angular es una clase que:
//   1. Guarda datos (el estado de la aplicación)
//   2. Tiene la lógica de negocio (agregar, borrar, actualizar)
//   3. Se puede compartir entre varios componentes
//
// Piénsalo como el "cerebro" de tu feature.
// El componente solo muestra datos; el servicio los gestiona.

import { Injectable, signal, computed } from '@angular/core';
// ↑ Injectable: le dice a Angular que esta clase puede ser "inyectada"
// ↑ signal:     crea una caja reactiva (un Signal)
// ↑ computed:   crea un Signal que se calcula a partir de otro Signal

import { Todo } from './todo.interface';

// @Injectable es un decorador (una etiqueta especial que empieza con @)
// Le dice a Angular: "esta clase es un servicio"
//
// providedIn: 'root' significa:
//   → Angular crea UNA SOLA instancia de este servicio para toda la app
//   → Cualquier componente que lo pida recibirá el MISMO objeto
//   → Esto se llama "Singleton" — una sola instancia compartida
@Injectable({
  providedIn: 'root'
})
export class TodoService {

  // ─────────────────────────────────────────────
  // ESTADO INTERNO
  // ─────────────────────────────────────────────
  //
  // signal<Todo[]>([]) crea una "caja reactiva" que:
  //   - Contiene un array de Todos: Todo[]
  //   - Empieza vacía: []
  //   - Cuando cambia su valor, Angular actualiza la UI automáticamente
  //
  // El símbolo # hace que la propiedad sea PRIVADA.
  // Solo este servicio puede modificarla directamente.
  // Los componentes solo pueden leerla a través de "todos" (abajo).
  #todos = signal<Todo[]>([]);

  // Esta es la "ventana pública" al estado.
  // Los componentes usarán this.todoService.todos() para leer los datos.
  // El () al final es porque los Signals son funciones — para leer el
  // valor hay que llamarlos.
  readonly todos = this.#todos.asReadonly();
  //                            ↑ asReadonly() evita que alguien de
  //                              fuera pueda llamar .set() en este signal

  // ─────────────────────────────────────────────
  // COMPUTED: Señales derivadas
  // ─────────────────────────────────────────────
  //
  // computed() crea un Signal cuyo valor SE CALCULA automáticamente
  // a partir de otros Signals.
  //
  // Aquí: cada vez que cambie #todos, Angular recalcula cuántos están
  // completados. No tenemos que hacer nada manualmente.
  //
  // Es como una fórmula de Excel: defines la fórmula una vez y Excel
  // la recalcula solo cada vez que cambian los datos.
  readonly completedTodos = computed(() =>
    this.#todos().filter(todo => todo.completed)
  );
  //  ↑ this.#todos()    → lee el valor actual del signal (el array)
  //  ↑ .filter(...)     → devuelve solo los que tienen completed: true

  // Otro computed útil: cuántos quedan pendientes
  readonly pendingCount = computed(() =>
    this.#todos().filter(todo => !todo.completed).length
  );

  // ─────────────────────────────────────────────
  // CONTADOR INTERNO para IDs únicos
  // ─────────────────────────────────────────────
  // Cada Todo necesita un ID único. Usamos un contador simple.
  // Empieza en 0 y sube de 1 en 1 cada vez que agregamos un todo.
  #nextId = 0;

  // ─────────────────────────────────────────────
  // MÉTODO: addTodo
  // ─────────────────────────────────────────────
  // Recibe el texto del nuevo todo y lo agrega al array.
  //
  // title.trim() elimina espacios en blanco al inicio y final.
  // Si alguien escribe "  " (solo espacios), no agregamos nada.
  addTodo(title: string): void {
    const trimmed = title.trim();
    if (!trimmed) return; // Si está vacío, no hacemos nada

    // Creamos el nuevo objeto Todo
    const newTodo: Todo = {
      id: ++this.#nextId, // ++ antes del nombre sube el valor PRIMERO
      title: trimmed,
      completed: false     // siempre empieza como pendiente
    };

    // .update() es la forma de modificar un Signal usando el valor anterior.
    // Recibe una función: (valorActual) => nuevoValor
    //
    // [...current, newTodo] es el "spread operator":
    // crea un NUEVO array con todos los elementos anteriores + el nuevo.
    // Nunca modificamos el array original — siempre creamos uno nuevo.
    // Esto se llama "inmutabilidad" y es importante para la reactividad.
    this.#todos.update(current => [...current, newTodo]);
  }

  // ─────────────────────────────────────────────
  // MÉTODO: toggleTodo
  // ─────────────────────────────────────────────
  // Cambia completed de true a false o viceversa.
  // "Toggle" = interruptor (encender/apagar)
  toggleTodo(id: number): void {
    this.#todos.update(current =>
      current.map(todo =>
        // map() recorre cada elemento y devuelve uno (posiblemente modificado)
        todo.id === id
          ? { ...todo, completed: !todo.completed }
          //  ↑ Si el ID coincide: creamos un nuevo objeto con el mismo todo
          //    pero con completed invertido (!true = false, !false = true)
          //  ↑ { ...todo } copia todas las propiedades del todo original
          : todo
          // ↑ Si el ID NO coincide: devolvemos el todo sin cambios
      )
    );
  }

  // ─────────────────────────────────────────────
  // MÉTODO: removeTodo
  // ─────────────────────────────────────────────
  // Elimina el todo con ese ID del array.
  removeTodo(id: number): void {
    this.#todos.update(current =>
      // filter() devuelve un nuevo array con solo los elementos
      // que cumplen la condición. Aquí: todos EXCEPTO el que tiene este ID.
      current.filter(todo => todo.id !== id)
    );
  }
}
