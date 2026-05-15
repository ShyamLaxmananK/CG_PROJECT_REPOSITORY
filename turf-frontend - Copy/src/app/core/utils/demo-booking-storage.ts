import { Booking } from '../models/booking.models';

const LAST_BOOKING_KEY = 'turf.lastBooking';
const DEMO_BOOKINGS_KEY = 'turf.demoBookings';

function readJson<T>(storage: Storage, key: string, fallback: T): T {
  try {
    const value = storage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(storage: Storage, key: string, value: unknown): void {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage failures in demo mode.
  }
}

export function loadLastBooking(): Booking | null {
  return readJson<Booking | null>(sessionStorage, LAST_BOOKING_KEY, null);
}

export function loadDemoBookings(): Booking[] {
  return readJson<Booking[]>(localStorage, DEMO_BOOKINGS_KEY, []);
}

export function storeDemoBooking(booking: Booking): void {
  const filtered = loadDemoBookings().filter((item) => item.id !== booking.id);
  const next = [booking, ...filtered];

  writeJson(localStorage, DEMO_BOOKINGS_KEY, next);
  writeJson(sessionStorage, LAST_BOOKING_KEY, booking);
}

export function updateDemoBooking(
  bookingId: number,
  changes: Partial<Booking>
): Booking | null {
  let updatedBooking: Booking | null = null;

  const next = loadDemoBookings().map((booking) => {
    if (booking.id !== bookingId) {
      return booking;
    }

    updatedBooking = { ...booking, ...changes };
    return updatedBooking;
  });

  writeJson(localStorage, DEMO_BOOKINGS_KEY, next);

  const lastBooking = loadLastBooking();
  if (lastBooking?.id === bookingId) {
    writeJson(sessionStorage, LAST_BOOKING_KEY, {
      ...lastBooking,
      ...changes
    });
  }

  return updatedBooking;
}

export function mergeBookingsWithDemo(bookings: Booking[]): Booking[] {
  const map = new Map<number, Booking>();

  bookings.forEach((booking) => {
    map.set(booking.id, booking);
  });

  loadDemoBookings().forEach((booking) => {
    map.set(booking.id, booking);
  });

  return [...map.values()].sort((left, right) => right.id - left.id);
}
