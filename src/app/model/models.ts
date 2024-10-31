export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  quantity?: number;
}

export interface Order {
  id: string;
  customerName: string;
  email: string;
  products: OrderedProduct[];
  total: number;
  orderCode: string;
  timestamp: string;
}

export interface OrderedProduct {
  productId: string;
  quantity: number;
  stock: number;
  price: number;
}
