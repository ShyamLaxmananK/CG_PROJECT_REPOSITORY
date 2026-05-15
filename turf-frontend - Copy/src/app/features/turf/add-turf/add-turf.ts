import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TurfService } from '../turf.service';

@Component({
  selector: 'app-add-turf',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-turf.html',
  styleUrl: './add-turf.css'
})
export class AddTurfComponent {

  name = '';
  location = '';
  pricePerHour!: number;

  constructor(
    private turfService: TurfService,
    private router: Router
  ) {}

  addTurf() {

    const turfData = {

      name: this.name,
      location: this.location,
      pricePerHour: this.pricePerHour

    };

    this.turfService.addTurf(turfData)
      .subscribe({

        next: () => {

          alert('Turf added successfully ✅');

          this.router.navigate(['/turfs']);

        },

        error: (err) => {

          console.error(err);

          alert('Failed to add turf ❌');

        }

      });

  }

}