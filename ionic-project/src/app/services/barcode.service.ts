import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Barcode {
  _id?: string;
  name: string;
  code: string;
  description?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BarcodeResponse {
  success: boolean;
  message: string;
  data: {
    barcodes: Barcode[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}

@Injectable({ providedIn: 'root' })
export class BarcodeService {
  private apiUrl = `${environment.apiUrl}/barcodes`;

  constructor(private http: HttpClient) {}

  createBarcode(barcode: Barcode): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, barcode);
  }

  getAllBarcodes(page = 1, limit = 100, search?: string, isActive?: boolean): Observable<BarcodeResponse> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (search) params = params.set('search', search);
    if (isActive !== undefined) params = params.set('isActive', isActive);
    return this.http.get<BarcodeResponse>(this.apiUrl, { params });
  }

  getBarcodeById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  updateBarcode(id: string, barcode: Partial<Barcode>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, barcode);
  }

  deleteBarcode(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
