import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PurchaseItem {
  product: string | { _id: string; name: string };
  quantity: number;
  price: number;
  discount?: number;
  tax?: number;
  total: number;
}

export interface Purchase {
  _id?: string;
  purchaseNumber?: string;
  supplier?: string | { _id: string; name: string };
  warehouse?: string | { _id: string; name: string };
  items?: PurchaseItem[];
  subTotal?: number;
  discount?: number;
  tax?: number;
  total?: number;
  paid?: number;
  due?: number;
  paymentStatus?: 'Paid' | 'Partial' | 'Unpaid';
  paymentMethod?: string;
  notes?: string;
  status?: 'Draft' | 'Ordered' | 'Received' | 'Cancelled';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PurchaseResponse {
  success: boolean;
  message: string;
  data: {
    purchases: Purchase[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}

@Injectable({ providedIn: 'root' })
export class PurchaseService {
  private apiUrl = `${environment.apiUrl}/purchases`;

  constructor(private http: HttpClient) {}

  createPurchase(data: Purchase): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  getAllPurchases(page = 1, limit = 10, search?: string, status?: string): Observable<PurchaseResponse> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (search) params = params.set('search', search);
    if (status) params = params.set('status', status);
    return this.http.get<PurchaseResponse>(this.apiUrl, { params });
  }

  getPurchaseById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  updatePurchase(id: string, data: Partial<Purchase>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deletePurchase(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getPurchaseOrders(page = 1, limit = 10, search?: string): Observable<PurchaseResponse> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (search) params = params.set('search', search);
    return this.http.get<PurchaseResponse>(`${environment.apiUrl}/purchase-orders`, { params });
  }

  getPurchaseReturns(page = 1, limit = 10, search?: string): Observable<PurchaseResponse> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (search) params = params.set('search', search);
    return this.http.get<PurchaseResponse>(`${environment.apiUrl}/purchase-returns`, { params });
  }
}
