import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export const API_BASE = 'https://contractexecution-aaa7a9hcazchguc2.southcentralus-01.azurewebsites.net/api';

@Injectable({ providedIn: 'root' })
export class ApiService {
  protected http = inject(HttpClient);

  get<T>(endpoint: string, params?: Record<string, any>): Observable<T> {
    let httpParams = new HttpParams();
    if (params) Object.entries(params).forEach(([k, v]) => { if (v != null) httpParams = httpParams.set(k, v); });
    return this.http.get<T>(`${API_BASE}/${endpoint}`, { params: httpParams });
  }

  getById<T>(endpoint: string, id: any): Observable<T> {
    return this.http.get<T>(`${API_BASE}/${endpoint}/${id}`);
  }

  post<T>(endpoint: string, body: T): Observable<T> {
    return this.http.post<T>(`${API_BASE}/${endpoint}`, body);
  }

  put<T>(endpoint: string, id: any, body: T): Observable<T> {
    return this.http.put<T>(`${API_BASE}/${endpoint}/${id}`, body);
  }

  delete<T>(endpoint: string, id: any): Observable<T> {
    return this.http.delete<T>(`${API_BASE}/${endpoint}/${id}`);
  }
}
