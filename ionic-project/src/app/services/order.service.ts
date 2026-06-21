import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  discountValue?: number;
  discountType?: string;
}

export interface Order {
  _id?: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  totalAmount?: number;
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  paymentMethod: string;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'paid' | 'refunded';
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/orders`;

  createOrder(orderData: Omit<Order, '_id' | 'createdAt' | 'updatedAt'>): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, orderData);
  }

  getMyOrders(): Observable<any> {
    let queryUserId: string | undefined;
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        queryUserId = user._id || user.id || user.userId;
      } catch (e) {
        console.error('Error parsing user:', e);
      }
    }

    if (queryUserId) {
      return this.http.get(`${this.apiUrl}/my-orders?userId=${queryUserId}`);
    }
    return this.http.get(`${this.apiUrl}/my-orders`);
  }

  getOrderById(orderId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${orderId}`);
  }

  verifyPayment(paymentData: {
    orderId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-payment`, paymentData);
  }

  confirmOrder(orderId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${orderId}/confirm`, {});
  }

  cancelOrder(orderId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${orderId}/cancel`, {});
  }
}
