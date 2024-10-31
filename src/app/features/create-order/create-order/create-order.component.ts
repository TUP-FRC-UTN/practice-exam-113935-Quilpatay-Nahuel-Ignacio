import { Component } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { map, Observable } from 'rxjs';
import { OrderService } from '../../../service/order.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-order',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './create-order.component.html',
  styleUrl: './create-order.component.css',
})
export class CreateOrderComponent {
  orderForm: FormGroup;
  products: any[] = [];

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    private router: Router
  ) {
    this.orderForm = this.fb.group({
      customerName: ['', [Validators.required, Validators.minLength(3)]],
      email: [
        '',
        [Validators.required, Validators.email],
        [this.emailAsyncValidator.bind(this)],
      ],
      products: this.fb.array(
        [],
        [this.duplicateProductValidator, this.totalQuantityValidator]
      ),
    });
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  get productForms() {
    return this.orderForm.get('products') as FormArray;
  }

  totalQuantityValidator(control: AbstractControl): ValidationErrors | null {
    const formArray = control as FormArray;
    const totalQuantity = formArray.controls.reduce(
      (sum, control) => sum + (control.get('quantity')?.value || 0),
      0
    );

    return totalQuantity > 10 ? { totalQuantityExceeded: true } : null;
  }

  loadProducts() {
    this.orderService
      .getProducts()
      .subscribe((products) => (this.products = products));
  }

  addProduct() {
    const productGroup = this.fb.group({
      productName: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      price: [{ value: 0, disabled: true }],
      stock: [{ value: 0, disabled: true }],
    });

    this.productForms.push(productGroup);
  }

  removeProduct(i: number) {
    this.productForms.removeAt(i);
  }

  duplicateProductValidator(control: AbstractControl): ValidationErrors | null {
    const formArray = control as FormArray;
    const names = formArray.controls.map((c) => c.get('productName')?.value);
    const hasDuplicates = new Set(names).size !== names.length;
    return hasDuplicates ? { duplicate: true } : null;
  }

  emailAsyncValidator(
    control: AbstractControl
  ): Observable<ValidationErrors | null> {
    return this.orderService
      .checkOrderLimit(control.value)
      .pipe(
        map((orders) => (orders.length >= 3 ? { limitExceeded: true } : null))
      );
  }

  onProductSelect(index: number) {
    const productGroup = this.productForms.at(index) as FormGroup;
    const selectedProductName = productGroup.get('productName')?.value;

    const isDuplicate = this.productForms.controls.some(
      (control, idx) =>
        idx !== index &&
        control.get('productName')?.value === selectedProductName
    );

    if (isDuplicate) {
      productGroup.get('productName')?.setErrors({ duplicate: true });
    } else {
      productGroup.get('productName')?.setErrors(null);
    }

    const selectedProduct = this.products.find(
      (product) => product.name === selectedProductName
    );

    if (selectedProduct) {
      productGroup.get('price')?.setValue(selectedProduct.price);
      productGroup.get('stock')?.setValue(selectedProduct.stock);
      if ((productGroup.get('quantity')?.value || 0) > selectedProduct.stock) {
        productGroup.get('quantity')?.setValue(selectedProduct.stock);
      }
    }
  }

  calculateTotal(): number {
    let total = 0;
    this.productForms.controls.forEach((control) => {
      const price = control.get('price')?.value || 0;
      const quantity = control.get('quantity')?.value || 0;
      total += price * quantity;
    });
    return total > 1000 ? total * 0.9 : total;
  }

  submitOrder() {
    if (this.orderForm.invalid) return;

    const orderData = this.orderForm.getRawValue();
    orderData.total = this.calculateTotal();
    orderData.orderCode = this.generateOrderCode(
      orderData.customerName,
      orderData.email
    );

    this.orderService.createOrder(orderData).subscribe(
      (response) => {
        console.log('Order created successfully:', response);
        this.orderForm.reset();
        this.router.navigate(['/orders']);
      },
      (error) => {
        console.error('Error creating order:', error);
      }
    );
  }

  generateOrderCode(name: string, email: string): string {
    return `${name[0].toUpperCase()}${email.slice(-4)}${Date.now()}`;
  }
}
