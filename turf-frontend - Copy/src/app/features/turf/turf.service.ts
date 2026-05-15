import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TurfService {

  constructor(private http: HttpClient) {}

  getAllTurfs(): Observable<any[]> {

    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      Authorization: 'Bearer ' + token
    });

    return this.http.get<any[]>(
      `${environment.apiUrl}/turfs`,
      { headers }
    );
  }

  addTurf(data: any) {

    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json'
    });

    return this.http.post(
      `${environment.apiUrl}/turfs`,
      data,
      { headers }
    );
  }
}