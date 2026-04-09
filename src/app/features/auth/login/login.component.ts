import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  activeTab: 'login' | 'register' = 'login';
  loading = false;
  error = '';

  loginData = { email: '', password: '' };
  registerData = {
    name: '',
    email: '',
    password: '',
    role: 'USER' as 'USER' | 'ADMIN',
  };

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  login() {
    this.loading = true;
    this.error = '';
    this.auth.login(this.loginData).subscribe({
      next: (res) => {
        console.log('RESPONSE LOGIN:', res);
        this.loading = false;
        const role = res.user?.role;
        console.log('ROLE:', role);
        if (role === 'ADMIN') {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/chat']);
        }
      },
      error: (err) => {
        console.log('ERROR LOGIN:', err);
        this.error = err.error?.message || 'Email atau password salah';
        this.loading = false;
      },
    });
  }

  register() {
    this.loading = true;
    this.error = '';
    this.auth.register(this.registerData).subscribe({
      next: () => {
        this.activeTab = 'login';
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Registrasi gagal';
        this.loading = false;
      },
    });
  }
}
