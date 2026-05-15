import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    RouterModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {

  username = '';
  password = '';

  loading = false;
  errorMessage = '';

  showPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  login() {

    if (!this.username || !this.password) {
      this.errorMessage = "Please enter username and password";
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const data = {
      username: this.username,
      password: this.password
    };

    this.authService.login(data).subscribe({

      next: (response: any) => {

        // ✅ store token
        localStorage.setItem('token', response.token);

        // ✅ store customerId (required for booking)
        localStorage.setItem('customerId', response.id);

        // decode JWT for role
        const payload = JSON.parse(
          atob(response.token.split('.')[1])
        );

        const role = payload.role || payload.roles;

        if (role.includes('ROLE_OWNER')) {
          this.router.navigate(['/owner-dashboard']);
        } else {
          this.router.navigate(['/turfs']);
        }

      },

      error: () => {

        this.loading = false;
        this.errorMessage = "Invalid username or password";

      }

    });

  }

}