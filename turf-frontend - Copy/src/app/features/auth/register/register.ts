import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {

  username = '';
  password = '';
  role = 'ROLE_CUSTOMER';

  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  register() {

    if (!this.username || !this.password) {

      this.errorMessage = "Please fill all fields";
      return;

    }

    const data = {

      username: this.username,
      password: this.password,
      role: this.role

    };

    this.authService.register(data).subscribe({

      next: () => {

        this.successMessage = "Registration successful ✅";

        setTimeout(() => {

          this.router.navigate(['/login']);

        }, 1500);

      },

      error: () => {

        this.errorMessage = "Registration failed ❌";

      }

    });

  }

}