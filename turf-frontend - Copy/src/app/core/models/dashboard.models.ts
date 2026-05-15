export interface DashboardMetric {
  label: string;
  value: string | number;
  trend?: string;
}

export interface AdminOverview {
  totalCustomers: number;
  totalOwners: number;
  totalBookings: number;
  totalRevenue: number;
  totalTurfs: number;
}
