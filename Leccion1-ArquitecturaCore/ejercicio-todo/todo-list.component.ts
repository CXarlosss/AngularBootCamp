// ============================================================
// ARCHIVO: todo-list.component.ts
// ============================================================
// Un componente en Angular tiene tres partes:
//   1. El decorador @Component (configuración)
//   2. La clase TypeScript (lógica)
//   3. El template HTML (vista) — en un archivo separado aquí
//
// Un componente Standalone NO necesita un NgModule.
// Antes: para usar un componente, había que registrarlo en un NgModule.
// Ahora: el componente se describe a sí mismo con standalone: true
//        y declara directamente qué necesita en "imports".

import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
// ↑ Component:              el decorador que convierte una clase en componente
// ↑ ChangeDetectionStrategy: para configurar OnPush
// ↑ inject:                 la forma moderna de pedir dependencias

import { TodoService } from './todo.service';

@Component({
  // ─────────────────────────────────────────
  // selector: el nombre del "custom HTML tag"
  // ─────────────────────────────────────────
  // Cuando Angular ve <app-todo-list> en el HTML, renderiza este componente.
  // Por convención los selectores de componentes empiezan con "app-".
  selector: 'app-todo-list',

  // ─────────────────────────────────────────
  // standalone: true — componente sin NgModule
  // ─────────────────────────────────────────
  // Le dice a Angular que este componente se gestiona a sí mismo.
  // No necesita ser declarado en ningún NgModule.
  standalone: true,

  // ─────────────────────────────────────────
  // imports: dependencias del template
  // ─────────────────────────────────────────
  // Aquí listamos qué otros componentes, directivas o pipes
  // usa este componente en su template.
  //
  // En este caso no importamos nada extra porque:
  //   - @if y @for son parte del core de Angular (no necesitan import)
  //   - No usamos componentes de terceros
  //
  // Si usáramos, por ejemplo, RouterLink o AsyncPipe, los pondríamos aquí.
  imports: [],

  // ─────────────────────────────────────────
  // templateUrl: ruta al archivo HTML
  // ─────────────────────────────────────────
  templateUrl: './todo-list.component.html',

  // ─────────────────────────────────────────
  // changeDetection: OnPush — ¿qué es y por qué?
  // ─────────────────────────────────────────
  // Angular necesita saber cuándo actualizar la pantalla.
  // Por defecto (Default), Angular revisa TODO el árbol de componentes
  // muy frecuentemente — es fácil pero ineficiente.
  //
  // Con OnPush, Angular SOLO re-renderiza este componente cuando:
  //   1. Cambia algún @Input() del componente
  //   2. Se dispara un evento dentro del componente (click, keypress...)
  //   3. Cambia un Signal que el componente está leyendo ← ¡esto nos importa!
  //   4. Se llama manualmente a ChangeDetectorRef.markForCheck()
  //
  // Como usamos Signals, Angular sabe exactamente cuándo cambió el estado
  // y actualiza solo este componente — ni más ni menos.
  // Resultado: aplicación más eficiente.
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoListComponent {

  // ─────────────────────────────────────────
  // inject() — Inyección de dependencias moderna
  // ─────────────────────────────────────────
  // "Inyección de dependencias" suena complicado pero la idea es simple:
  //
  // En vez de que este componente cree su propio TodoService:
  //   ✗ const service = new TodoService(); // malo: cada componente tendría su propia instancia
  //
  // Le PEDIMOS a Angular que nos dé el servicio que ya tiene:
  //   ✓ inject(TodoService) // Angular busca la instancia que creó y nos la da
  //
  // Así todos los componentes comparten el MISMO servicio (mismo estado).
  // Si agregas un todo en un componente, otro componente también lo verá.
  //
  // inject() es la forma moderna. La forma clásica era el constructor:
  //   constructor(public todoService: TodoService) {}
  // Ambas funcionan igual; inject() es más limpia y flexible.
  protected todoService = inject(TodoService);
  // ↑ "protected" significa que solo este componente y sus hijos pueden usarlo
  //   (el template HTML cuenta como parte del componente)

  // ─────────────────────────────────────────
  // MÉTODO: addTodo
  // ─────────────────────────────────────────
  // El template llama a este método cuando el usuario presiona Enter o clic.
  // Recibe la referencia al elemento input (HTMLInputElement).
  //
  // ¿Por qué recibimos el input completo y no solo el string?
  // Para poder limpiar el campo después de agregar el todo.
  addTodo(input: HTMLInputElement): void {
    this.todoService.addTodo(input.value);
    input.value = ''; // limpiamos el campo de texto
    input.focus();    // volvemos el foco al input para poder agregar más
  }
}
