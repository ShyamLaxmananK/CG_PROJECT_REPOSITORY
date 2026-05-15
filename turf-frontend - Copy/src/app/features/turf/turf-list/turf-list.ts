import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TurfService } from '../turf.service';
import { BookingService } from '../../booking/booking.service';

@Component({
  selector: 'app-turf-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './turf-list.html',
  styleUrl: './turf-list.css'
})
export class TurfListComponent implements OnInit {

  turfs: any[] = [];
  loading = true;
  errorMessage = '';

  constructor(
    private turfService: TurfService,
    private bookingService: BookingService,
    private router: Router
  ) {}

  ngOnInit(): void {

    this.turfService.getAllTurfs().subscribe({

      next: (data) => {

        console.log('Turf API response:', data);

        this.turfs = data;
        this.loading = false;

      },

      error: (err) => {

        console.error('Failed to load turfs:', err);

        this.errorMessage = 'Failed to load turfs';
        this.loading = false;

      }

    });

  }

  bookTurf(turfId: number): void {

    this.bookingService.createBooking(turfId)
      .subscribe({

        next: () => {

          // Redirect to confirmation page
          this.router.navigate([
            '/booking-confirmed',
            turfId
          ]);

        },

        error: (err) => {

          console.error(err);

          alert('Booking failed ❌');

        }

      });

  }

  logout(): void {

    localStorage.removeItem('token');

    this.router.navigate(['/login']);

  }

}