import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Backend {
  apiUrl = environment.domainAPI;
  constructor(
    private http: HttpClient
  ) { }

  private getHeaders(): HttpHeaders {
    const localStorageLogin = localStorage.getItem('login');
    if (localStorageLogin !== null) {
      const dados = JSON.parse(localStorageLogin);
      const headers = new HttpHeaders({
        'Authorization': 'Bearer ' + dados.accessToken
      });
      return headers;
    }
    return new HttpHeaders();
  }

  get(endpoint: string): Observable<any> {
    const url = this.apiUrl + endpoint;
    return this.http.get(url, { headers: this.getHeaders() });
  }

  post(endpoint: string, data: any): Observable<any> {
    const url = this.apiUrl + endpoint;
    return this.http.post(url, data, { headers: this.getHeaders() });
  }

  put(endpoint: string, data: any): Observable<any> {
    const url = this.apiUrl + endpoint;
    return this.http.put(url, data, { headers: this.getHeaders() });
  }

  delete(endpoint: string): Observable<any> {
    const url = this.apiUrl + endpoint;
    return this.http.delete(url, { headers: this.getHeaders() });
  }
}
