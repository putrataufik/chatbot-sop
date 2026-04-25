import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly BASE = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.BASE);
  }

  getMe(): Observable<User> {
    return this.http.get<User>(`${this.BASE}/me`);
  }

  getById(id: number): Observable<User> {
    return this.http.get<User>(`${this.BASE}/${id}`);
  }

  update(id: number, data: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${this.BASE}/${id}`, data);
  }

  create(data: { name: string; email: string; password: string; role: 'USER' | 'ADMIN' }): Observable<User> {
    return this.http.post<User>(this.BASE, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.BASE}/${id}`);
  }
}