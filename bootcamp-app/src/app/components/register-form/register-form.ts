import { Component, inject, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-register-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './register-form.html',
  styleUrl: './register-form.css',
})
export class RegisterForm {
  private fb = inject(FormBuilder);

  // Emite los datos al padre cuando el form es válido
  formSubmitted = output<{ name: string; email: string; password: string }>();

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  submitted = signal(false);

  get name() {
    return this.form.get('name');
  }
  get email() {
    return this.form.get('email');
  }
  get password() {
    return this.form.get('password');
  }

  onSubmit() {
    this.submitted.set(true);
    if (this.form.invalid) return;

    // No llama a ningún servicio — solo emite hacia arriba
    this.formSubmitted.emit(this.form.value as any);
    this.form.reset();
    this.submitted.set(false);
  }
}
