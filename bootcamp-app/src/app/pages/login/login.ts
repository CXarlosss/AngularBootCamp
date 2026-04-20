import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { LoginForm } from '../../components/login-form/login-form';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [LoginForm],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);

  error = signal<string | null>(null);
  loading = signal(false);

  onFormSubmitted(credentials: { email: string; password: string }) {
    this.loading.set(true);
    this.error.set(null);

    // Simulamos delay de red
    setTimeout(() => {
      const success = this.authService.login(credentials.email, credentials.password);

      if (success) {
        this.router.navigate(['/dashboard']);
      } else {
        this.error.set('Email o contraseña incorrectos');
        this.loading.set(false);
      }
    }, 800);
  }
}
