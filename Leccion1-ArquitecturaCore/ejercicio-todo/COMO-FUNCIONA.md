# Cómo funciona este ejercicio

## Flujo de datos (de arriba a abajo)

```
TodoService
  │
  │  #todos = signal<Todo[]>([])    ← guarda el estado
  │  completedTodos = computed(...)  ← se calcula automáticamente
  │
  ▼
TodoListComponent
  │
  │  todoService = inject(TodoService)  ← recibe el servicio
  │
  ▼
todo-list.component.html
  │
  │  {{ todoService.todos().length }}   ← lee el signal
  │  @for (todo of todoService.todos()) ← itera el signal
  │  (click)="todoService.toggleTodo()" ← llama métodos del servicio
```

## Por qué Signals son mejores (comparación)

### Sin Signals (antiguo):
```typescript
// El componente tenía que suscribirse a observables y desuscribirse
private subscription = this.service.todos$.subscribe(todos => {
  this.todos = todos;
  this.cdr.markForCheck(); // había que avisar manualmente
});

ngOnDestroy() {
  this.subscription.unsubscribe(); // había que limpiar manualmente
}
```

### Con Signals (moderno):
```typescript
// El template simplemente llama el signal como función
{{ todoService.todos().length }}
// Angular detecta automáticamente que este componente lee este signal
// y lo actualiza cuando cambia. Sin suscripciones, sin limpieza manual.
```

## Los tres métodos del servicio explicados visualmente

### addTodo("Comprar leche")
```
Antes: [{ id:1, title:"Estudiar" }]
Después: [{ id:1, title:"Estudiar" }, { id:2, title:"Comprar leche" }]
```

### toggleTodo(1)
```
Antes: [{ id:1, title:"Estudiar", completed: false }]
Después: [{ id:1, title:"Estudiar", completed: true }]
```

### removeTodo(1)
```
Antes: [{ id:1, title:"Estudiar" }, { id:2, title:"Comprar leche" }]
Después: [{ id:2, title:"Comprar leche" }]
```

## Conceptos clave aprendidos

| Concepto | ¿Qué hace? |
|----------|-----------|
| `signal<T>(valor)` | Crea una caja reactiva con un valor inicial |
| `signal()` | Lee el valor actual del signal |
| `signal.set(nuevo)` | Reemplaza el valor |
| `signal.update(fn)` | Modifica usando el valor anterior |
| `computed(() => ...)` | Signal que se calcula de otros signals |
| `providedIn: 'root'` | Una sola instancia para toda la app |
| `standalone: true` | Componente sin NgModule |
| `OnPush` | Solo re-renderiza cuando cambian signals/inputs |
| `inject(Servicio)` | Pide una dependencia a Angular |
| `@for ... track` | Itera un array de forma eficiente |
| `@if` | Renderizado condicional |
