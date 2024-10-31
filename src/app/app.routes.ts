import { Routes } from '@angular/router';
import { CreateOrderComponent } from './features/create-order/create-order/create-order.component';
import { OrdersListComponent } from './features/orders-list/orders-list.component';

export const routes: Routes = [
  { path: 'create-order', component: CreateOrderComponent },
  { path: 'orders', component: OrdersListComponent },
  { path: '', redirectTo: '/create-order', pathMatch: 'full' },
];
