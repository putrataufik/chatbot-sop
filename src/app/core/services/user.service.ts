import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly BASE = 'http://localhost:3000/api/chatbot-sop/users';

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

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.BASE}/${id}`);
  }
}