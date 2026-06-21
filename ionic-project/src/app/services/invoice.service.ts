import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface InvoiceItem {
  product: string | { _id: string; name: string };
  quantity: number;
  price: number;
  discount?: number;
  tax?: number;
  total: number;
}

export interface Invoice {
  _id?: string;
  invoiceNumber?: string;
  customer?: string | { _id: string; name: string };
  customerType?: 'individual' | 'business';
  companyName?: string;
  taxId?: string;
  biller?: string | { _id: string; name: string };
  items?: InvoiceItem[];
  subTotal?: number;
  discount?: number;
  tax?: number;
  total?: number;
  paid?: number;
  due?: number;
  paymentStatus?: 'Paid' | 'Partial' | 'Unpaid';
  paymentMethod?: string;
  notes?: string;
  status?: 'Draft' | 'Sent' | 'Paid' | 'Cancelled';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface InvoiceResponse {
  success: boolean;
  message: string;
  data: {
    invoices: Invoice[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private apiUrl = `${environment.apiUrl}/invoices`;

  constructor(private http: HttpClient) {}

  createInvoice(data: Invoice): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  getAllInvoices(page = 1, limit = 10, search?: string, status?: string): Observable<InvoiceResponse> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (search) params = params.set('search', search);
    if (status) params = params.set('status', status);
    return this.http.get<InvoiceResponse>(this.apiUrl, { params });
  }

  getInvoiceById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  updateInvoice(id: string, data: Partial<Invoice>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteInvoice(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
