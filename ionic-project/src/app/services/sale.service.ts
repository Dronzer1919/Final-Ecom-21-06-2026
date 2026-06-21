import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SaleItem {
  product: string | { _id: string; name: string };
  quantity: number;
  price: number;
  discount?: number;
  tax?: number;
  total: number;
}

export interface Sale {
  _id?: string;
  saleNumber?: string;
  customer?: string | { _id: string; name: string };
  biller?: string | { _id: string; name: string };
  warehouse?: string | { _id: string; name: string };
  store?: string | { _id: string; name: string };
  items?: SaleItem[];
  subTotal?: number;
  discount?: number;
  tax?: number;
  total?: number;
  paid?: number;
  due?: number;
  paymentStatus?: 'Paid' | 'Partial' | 'Unpaid';
  paymentMethod?: string;
  notes?: string;
  status?: 'Draft' | 'Completed' | 'Cancelled';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SaleResponse {
  success: boolean;
  message: string;
  data: {
    sales: Sale[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}

@Injectable({ providedIn: 'root' })
export class SaleService {
  private apiUrl = `${environment.apiUrl}/sales`;

  constructor(private http: HttpClient) {}

  createSale(data: Sale): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  getAllSales(page = 1, limit = 10, search?: string, status?: string): Observable<SaleResponse> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (search) params = params.set('search', search);
    if (status) params = params.set('status', status);
    return this.http.get<SaleResponse>(this.apiUrl, { params });
  }

  getSaleById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  updateSale(id: string, data: Partial<Sale>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteSale(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getSaleReturns(page = 1, limit = 10, search?: string): Observable<SaleResponse> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (search) params = params.set('search', search);
    return this.http.get<SaleResponse>(`${environment.apiUrl}/sale-returns`, { params });
  }
}
