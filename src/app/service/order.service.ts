import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { Order, Product } from '../model/models';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/products`).pipe(
      catchError(error => {
        console.error('Error loading products', error);
        return throwError(error);
      })
    );
  }

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/orders`);
  }

  checkOrderLimit(email: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/orders?email=${email}`);
  }

  createOrder(order: Order): Observable<Order> {
    return this.http.post<Order>(`${this.baseUrl}/orders`, order);
  }
  
}
