import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './owner-dashboard.html',
  styleUrl: './owner-dashboard.css'
})
export class OwnerDashboardComponent {

  constructor(private router: Router) {}

  goToAddTurf() {

    this.router.navigate(['/add-turf']);

  }

  logout() {

    localStorage.removeItem('token');

    this.router.navigate(['/login']);

  }

}