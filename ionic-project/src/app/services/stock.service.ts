import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface StockAdjustment {
  _id?: string;
  product: string | { _id: string; name: string };
  warehouse?: string | { _id: string; name: string };
  adjustmentType: 'add' | 'remove';
  quantity: number;
  reason?: string;
  notes?: string;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StockTransfer {
  _id?: string;
  product: string | { _id: string; name: string };
  fromWarehouse: string | { _id: string; name: string };
  toWarehouse: string | { _id: string; name: string };
  quantity: number;
  notes?: string;
  status?: 'Pending' | 'Completed' | 'Cancelled';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StockItem {
  _id?: string;
  product: string | { _id: string; name: string; itemCode: string };
  warehouse?: string | { _id: string; name: string };
  store?: string | { _id: string; name: string };
  quantity: number;
  quantityAlert?: number;
  price?: number;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StockResponse {
  success: boolean;
  message: string;
  data: {
    items: StockItem[] | StockAdjustment[] | StockTransfer[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}

@Injectable({ providedIn: 'root' })
export class StockService {
  private apiUrl = `${environment.apiUrl}/stock`;

  constructor(private http: HttpClient) {}

  getManageStock(page = 1, limit = 10, search?: string): Observable<any> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (search) params = params.set('search', search);
    return this.http.get(`${this.apiUrl}/manage`, { params });
  }

  getStockAdjustments(page = 1, limit = 10, search?: string): Observable<any> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (search) params = params.set('search', search);
    return this.http.get(`${this.apiUrl}/adjustments`, { params });
  }

  createStockAdjustment(data: Partial<StockAdjustment>): Observable<any> {
    return this.http.post(`${this.apiUrl}/adjustments`, data);
  }

  getStockTransfers(page = 1, limit = 10, search?: string): Observable<any> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (search) params = params.set('search', search);
    return this.http.get(`${this.apiUrl}/transfers`, { params });
  }

  createStockTransfer(data: Partial<StockTransfer>): Observable<any> {
    return this.http.post(`${this.apiUrl}/transfers`, data);
  }
}
