import { Routes } from '@angular/router';

import { MainShellComponent } from './layout/main-shell.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/auth/login.component';
import { RegisterComponent } from './pages/auth/register.component';
import { CustomerDashboardComponent } from './pages/customer/customer-dashboard.component';
import { BookingHistoryComponent } from './pages/customer/booking-history.component';
import { OwnerDashboardComponent } from './pages/owner/owner-dashboard.component';
import { ManageTurfsComponent } from './pages/owner/manage-turfs.component';
import { AdminDashboardComponent } from './pages/admin/admin-dashboard.component';
import { UserManagementComponent } from './pages/admin/user-management.component';
import { TurfCatalogComponent } from './pages/admin/turf-catalog.component';
import { PaymentCenterComponent } from './pages/payments/payment-center.component';
import { BookingWizardComponent } from './pages/booking/booking-wizard.component';
import { BookingSuccessComponent } from './pages/booking/booking-success.component';
import { FaqComponent } from './pages/info/faq.component';
import { ContactComponent } from './pages/info/contact.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const appRoutes: Routes = [
  {
    path: '',
    component: MainShellComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'faq', component: FaqComponent },
      { path: 'contact', component: ContactComponent },
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      {
        path: 'customer',
        canActivate: [authGuard, roleGuard(['CUSTOMER'])],
        children: [
          { path: '', component: CustomerDashboardComponent },
          { path: 'bookings', component: BookingHistoryComponent }
        ]
      },
      {
        path: 'owner',
        canActivate: [authGuard, roleGuard(['OWNER'])],
        children: [
          { path: '', component: OwnerDashboardComponent },
          { path: 'turfs', component: ManageTurfsComponent }
        ]
      },
      {
        path: 'admin',
        canActivate: [authGuard, roleGuard(['ADMIN'])],
        children: [
          { path: '', component: AdminDashboardComponent },
          { path: 'users', component: UserManagementComponent },
          { path: 'turfs', component: TurfCatalogComponent }
        ]
      },
      {
        path: 'booking/:turfId',
        component: BookingWizardComponent,
        canActivate: [authGuard, roleGuard(['CUSTOMER'])]
      },
      {
        path: 'booking-success',
        component: BookingSuccessComponent,
        canActivate: [authGuard, roleGuard(['CUSTOMER'])]
      },
      {
        path: 'payments',
        component: PaymentCenterComponent,
        canActivate: [authGuard, roleGuard(['CUSTOMER'])]
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
