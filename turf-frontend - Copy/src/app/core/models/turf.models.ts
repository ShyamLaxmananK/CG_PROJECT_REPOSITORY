export interface Turf {
  id: number;
  name: string;
  location: string;
  pricePerHour: number;
  ownerUsername: string;
}

export interface TurfPayload {
  name: string;
  location: string;
  pricePerHour: number;
}
