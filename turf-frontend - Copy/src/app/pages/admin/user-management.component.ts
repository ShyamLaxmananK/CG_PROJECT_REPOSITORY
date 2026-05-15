import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { AdminService } from '../../core/services/admin.service';
import { AuthUser } from '../../core/models/auth.models';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="page-section">
      <div class="page-shell stack">
        <div class="section-title">
          <div>
            <div class="tag">Admin users</div>
            <h2>Customers and owners</h2>
          </div>
        </div>

        <div class="grid grid-3">
          <article class="glass-card list-card" *ngFor="let user of users()">
            <div class="section-title">
              <div>
                <h3>{{ user.username || user.fullName }}</h3>
                <p>Customer ID: {{ user.id }}</p>
              </div>
              <span class="tag">{{ user.role }}</span>
            </div>
            <p>Username: {{ user.username || '-' }}</p>
          </article>
        </div>
      </div>
    </section>
  `
})
export class UserManagementComponent {
  private readonly adminService = inject(AdminService);

  readonly users = signal<AuthUser[]>([]);

  constructor() {
    this.adminService.getUsers().subscribe({
      next: (response) => this.users.set(response.items),
      error: () => this.users.set([])
    });
  }
}
