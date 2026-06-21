import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TestHttpService {
  constructor(private http: HttpClient) {
    console.log('🔧 TestHttpService created - HttpClient injected:', !!this.http);
  }

  testConnection() {
    console.log('🧪 Testing HTTP connection...');
    return this.http.get('http://localhost:3000/api/banners/active');
  }
}
