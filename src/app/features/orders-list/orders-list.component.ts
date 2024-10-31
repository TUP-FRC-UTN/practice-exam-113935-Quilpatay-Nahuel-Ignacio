import { Component } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { OrderService } from '../../service/order.service';
import { debounceTime } from 'rxjs';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, ReactiveFormsModule, HttpClientModule],
  templateUrl: './orders-list.component.html',
  styleUrl: './orders-list.component.css',
})
export class OrdersListComponent {
  orders: any[] = [];
  filteredOrders: any[] = [];
  searchControl = new FormControl('');

  constructor(private orderService: OrderService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.loadOrders();

    this.searchControl.valueChanges
      .pipe(debounceTime(300))
      .subscribe((value) => this.filterOrders(value ?? ''));
  }

  loadOrders() {
    this.orderService.getOrders().subscribe(
      (orders) => {
        this.orders = orders;
        this.filteredOrders = orders;
      },
      (error) => {
        console.error('Error loading orders:', error);
      }
    );
  }

  filterOrders(searchTerm: string) {
    if (!searchTerm) {
      this.filteredOrders = this.orders;
    } else {
      const lowerSearchTerm = searchTerm.toLowerCase();
      this.filteredOrders = this.orders.filter(
        (order) =>
          order.customerName.toLowerCase().includes(lowerSearchTerm) ||
          order.email.toLowerCase().includes(lowerSearchTerm)
      );
    }
  }
}
