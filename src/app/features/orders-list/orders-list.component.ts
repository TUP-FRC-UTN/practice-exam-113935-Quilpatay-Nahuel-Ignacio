import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { OrderService } from '../../service/order.service';
import { debounceTime, distinctUntilChanged, map, Observable, startWith, switchMap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, RouterOutlet } from '@angular/router';
import { Order } from '../../model/models';

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, ReactiveFormsModule, HttpClientModule],
  templateUrl: './orders-list.component.html',
  styleUrl: './orders-list.component.css',
})
export class OrdersListComponent {
  private orderService = inject(OrderService);
  
  searchControl = new FormControl('');
  
  private orders$ = this.orderService.getOrders();

  filteredOrders$: Observable<Order[]> = this.searchControl.valueChanges.pipe(
    startWith(''),
    debounceTime(300),
    distinctUntilChanged(),
    map(term => term || ''),
    switchMap(searchTerm => 
      this.orders$.pipe(
        map(orders => this.filterOrders(orders, searchTerm))
      )
    )
  );

  ngOnInit(): void {
    // No need for initialization since we're using startWith('')
  }

  private filterOrders(orders: Order[], searchTerm: string): Order[] {
    if (!searchTerm) return orders;
    
    const term = searchTerm.toLowerCase();
    return orders.filter(order =>
      order.customerName.toLowerCase().includes(term) ||
      order.email.toLowerCase().includes(term)
    );
  }
}
