import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-booking-confirmation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-confirmation.html',
  styleUrl: './booking-confirmation.css'
})
export class BookingConfirmationComponent {

  turfId!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {

    this.turfId = Number(
      this.route.snapshot.paramMap.get('turfId')
    );

  }

  goBack() {

    this.router.navigate(['/turfs']);

  }

}