import { Routes } from '@angular/router';

import { LoginComponent } from './components/login/login';

import { DashboardComponent } from './components/dashboard/dashboard';

import { DealerComponent } from './components/dealer/dealer';

import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard';

import { AdminDealersComponent } from './components/admin-dealers/admin-dealers';

import { DealerDashboardComponent } from './components/dealer-dashboard/dealer-dashboard';

import { DealerAllServicesComponent } from './components/dealer-all-services/dealer-all-services';
import { BookService } from './components/book-service/book-service';
import { DealerExecutiveCarsComponent } from './components/dealer-executive-cars/dealer-executive-cars';
import { BookRentalComponent } from './components/book-rental/book-rental';




export const routes: Routes = [

  { path: '', component: LoginComponent },

  { path: 'login', component: LoginComponent },

  { path: 'dashboard', component: DashboardComponent },

  { path: 'admin-dashboard', component: AdminDashboardComponent },

  { path: 'admin-dealers', component: AdminDealersComponent },

  { path: 'dealer-dashboard', component: DealerDashboardComponent },
  {
    path: 'dealer/services',
    component: DealerAllServicesComponent
  },

  { path: 'dealer', component: DealerComponent },

  { path: 'dealer-executive-cars', component: DealerExecutiveCarsComponent },

  { path: 'book-service', component: BookService },

  { path: 'book-rental', component: BookRentalComponent },

  { path: '**', component: LoginComponent }

];

