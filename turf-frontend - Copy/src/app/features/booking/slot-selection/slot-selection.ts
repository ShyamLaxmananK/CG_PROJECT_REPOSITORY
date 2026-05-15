import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-slot-selection',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './slot-selection.html',
  styleUrl: './slot-selection.css'
})
export class SlotSelectionComponent {

  selectedSlot: string | null = null;

  slots = [
    "06:00 AM",
    "07:00 AM",
    "08:00 AM",
    "05:00 PM",
    "06:00 PM",
    "07:00 PM"
  ];

  selectSlot(slot: string) {

    this.selectedSlot = slot;

  }

  confirmBooking() {

    if (!this.selectedSlot) {

      alert("Please select a slot");

      return;

    }

    alert("Slot booked: " + this.selectedSlot);

  }

}