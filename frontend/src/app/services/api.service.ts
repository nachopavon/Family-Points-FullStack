import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly apiUrl = environment.apiUrl;
  private authToken: string | null = null;
  private readonly defaultHeaders = {
    'Content-Type': 'application/json'
  };

  constructor(private http: HttpClient) {
    // Cargar token desde localStorage al inicializar
    this.loadAuthToken();
  }

  private loadAuthToken(): void {
    this.authToken = localStorage.getItem('family-points-token');
  }

  setAuthToken(token: string): void {
    this.authToken = token;
    localStorage.setItem('family-points-token', token);
  }

  clearAuthToken(): void {
    this.authToken = null;
    localStorage.removeItem('family-points-token');
  }

  private getAuthHeaders(): HttpHeaders {
    let headers = new HttpHeaders(this.defaultHeaders);

    if (this.authToken) {
      headers = headers.set('Authorization', `Bearer ${this.authToken}`);
    }

    return headers;
  }

  get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}${endpoint}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      timeout(environment.apiTimeout),
      catchError(this.handleError)
    );
  }

  post<T>(endpoint: string, data?: any): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}${endpoint}`, data, {
      headers: this.getAuthHeaders()
    }).pipe(
      timeout(environment.apiTimeout),
      catchError(this.handleError)
    );
  }

  put<T>(endpoint: string, data?: any): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}${endpoint}`, data, {
      headers: this.getAuthHeaders()
    }).pipe(
      timeout(environment.apiTimeout),
      catchError(this.handleError)
    );
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}${endpoint}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      timeout(environment.apiTimeout),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ha ocurrido un error desconocido';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      if (error.error && error.error.details && Array.isArray(error.error.details)) {
        // Errores de validación específicos
        const validationErrors = error.error.details.map((detail: any) =>
          `${detail.field}: ${detail.message}`
        ).join(', ');
        errorMessage = validationErrors;
      } else if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else {
        errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
    }

    console.error('API Error:', error);
    return throwError(() => errorMessage);
  }
}
