import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  error = signal<string | null>(null);
  loading = signal(false);
  submitted = signal(false);

  get email() {
    return this.form.get('email');
  }
  get password() {
    return this.form.get('password');
  }

  onSubmit() {
    this.submitted.set(true);
    if (this.form.invalid) return;

    this.loading.set(true);
    this.error.set(null);

    setTimeout(() => {
      const ok = this.authService.login(this.form.value.email!, this.form.value.password!);

      if (ok) {
        this.router.navigate(['/carrito']);
      } else {
        this.error.set('Email o contraseña incorrectos');
        this.loading.set(false);
      }
    }, 800);
  }
}
