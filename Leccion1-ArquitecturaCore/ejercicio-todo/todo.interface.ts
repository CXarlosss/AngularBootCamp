// ============================================================
// ARCHIVO: todo.interface.ts
// ============================================================
// Un "interface" en TypeScript es un CONTRATO.
// Le dice a TypeScript: "cualquier objeto que diga ser un Todo
// DEBE tener exactamente estas tres propiedades con estos tipos".
//
// ¿Por qué usamos interfaces?
//   → Para que TypeScript nos avise si escribimos mal un nombre
//   → Para que el editor nos ayude con autocompletado
//   → Para que el código sea más fácil de entender

export interface Todo {
  id: number;        // número único que identifica cada todo (1, 2, 3...)
  title: string;     // el texto del todo, ej: "Comprar leche"
  completed: boolean; // true = terminado, false = pendiente
}

// EJEMPLO de objeto válido:
// const miTodo: Todo = { id: 1, title: "Aprender Angular", completed: false }
//
// EJEMPLO de objeto INVÁLIDO (TypeScript daría error):
// const malTodo: Todo = { id: "uno", title: "Hola" }
//   ↑ Error: id debe ser number, no string
//   ↑ Error: falta la propiedad "completed"
