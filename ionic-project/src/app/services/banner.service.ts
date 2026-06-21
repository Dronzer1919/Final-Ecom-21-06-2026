import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface Banner {
  _id?: string;
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  buttonText?: string;
  buttonLink?: string;
  link?: string;
  isActive?: boolean;
  order?: number;
  startDate?: Date;
  endDate?: Date;
}

@Injectable({
  providedIn: 'root',
})
export class BannerService {
  private apiUrl = `${environment.apiUrl}/banners`;
  private banners = signal<Banner[]>([]);
  private activeBanners = signal<Banner[]>([]);

  constructor(private http: HttpClient) {}

  // Get all banners
  getAllBanners(): Observable<any> {
    console.log('🎨 BannerService: Calling GET', this.apiUrl);
    return this.http.get<any>(this.apiUrl).pipe(
      tap(response => {
        console.log('🎨 BannerService: Response received', response);
        if (response.success && response.data) {
          this.banners.set(response.data);
        }
      })
    );
  }

  // Get active banners only
  getActiveBanners(): Observable<any> {
    const url = `${this.apiUrl}/active`;
    console.log('🎨 BannerService: Calling GET', url);
    return this.http.get<any>(url).pipe(
      tap(response => {
        console.log('🎨 BannerService: Response received', response);
        if (response.success && response.data) {
          this.activeBanners.set(response.data);
        }
      })
    );
  }

  // Get banner by ID
  getBannerById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Get banners signal
  getBannersSignal() {
    return this.banners;
  }

  // Get active banners signal
  getActiveBannersSignal() {
    return this.activeBanners;
  }

  // Create banner
  createBanner(data: Partial<Banner>): Observable<any> {
    return this.http.post<any>(this.apiUrl, data).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.banners.update(list => [...list, response.data]);
        }
      })
    );
  }

  // Update banner
  updateBanner(id: string, data: Partial<Banner>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.banners.update(list => list.map(b => b._id === id ? response.data : b));
        }
      })
    );
  }

  // Delete banner
  deleteBanner(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.banners.update(list => list.filter(b => b._id !== id));
      })
    );
  }
}
