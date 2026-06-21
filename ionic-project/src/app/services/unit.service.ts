import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Unit {
  _id?: string;
  name: string;
  shortName: string;
  description?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UnitResponse {
  success: boolean;
  message: string;
  data: {
    units: Unit[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}

@Injectable({ providedIn: 'root' })
export class UnitService {
  private apiUrl = `${environment.apiUrl}/units`;

  constructor(private http: HttpClient) {}

  createUnit(data: Unit): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  getAllUnits(page = 1, limit = 10, search?: string, isActive?: boolean): Observable<UnitResponse> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (search) params = params.set('search', search);
    if (isActive !== undefined) params = params.set('isActive', isActive);
    return this.http.get<UnitResponse>(this.apiUrl, { params });
  }

  getUnitById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  updateUnit(id: string, data: Partial<Unit>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteUnit(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  bulkCreateUnits(data: Partial<Unit>[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/bulk-create`, data);
  }
}
