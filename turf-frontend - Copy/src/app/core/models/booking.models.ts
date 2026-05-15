export type BookingStatus = 'CREATED' | 'CONFIRMED' | 'CANCELLED';

export interface Booking {
  id: number;
  turfId: number;
  turfName?: string;
  customerUsername: string;
  slotTime?: string;
  status: BookingStatus;
  bookingTime?: string;
}

export interface CreateBookingPayload {
  turfId: number;
  slotTime: string;
}
