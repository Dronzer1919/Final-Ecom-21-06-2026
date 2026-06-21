import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface VariantAttribute {
  _id?: string;
  name: string;
  values?: string[];
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface VariantAttributeResponse {
  success: boolean;
  message: string;
  data: {
    attributes: VariantAttribute[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}

@Injectable({ providedIn: 'root' })
export class VariantAttributeService {
  private apiUrl = `${environment.apiUrl}/variant-attributes`;

  constructor(private http: HttpClient) {}

  createAttribute(data: VariantAttribute): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  getAllAttributes(page = 1, limit = 10, search?: string, isActive?: boolean): Observable<VariantAttributeResponse> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (search) params = params.set('search', search);
    if (isActive !== undefined) params = params.set('isActive', isActive);
    return this.http.get<VariantAttributeResponse>(this.apiUrl, { params });
  }

  getAttributeById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  updateAttribute(id: string, data: Partial<VariantAttribute>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteAttribute(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
