import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChatSession, Message, SubQueryResult, TokenUsageLog } from '../models/chat.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly BASE = `${environment.apiUrl}/chat`;

  constructor(private http: HttpClient) {}

  getSessions(): Observable<ChatSession[]> {
    return this.http.get<ChatSession[]>(`${this.BASE}/sessions`);
  }

  createSession(title: string): Observable<ChatSession> {
    return this.http.post<ChatSession>(`${this.BASE}/sessions`, { title });
  }

  deleteSession(id: number): Observable<void> {
    return this.http.delete<void>(`${this.BASE}/sessions/${id}`);
  }

  getMessages(sessionId: number): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.BASE}/sessions/${sessionId}/messages`);
  }

  sendMessage(sessionId: number, content: string): Observable<Message> {
    return this.http.post<Message>(`${this.BASE}/sessions/${sessionId}/messages`, { content });
  }

  getSubQueries(messageId: number): Observable<SubQueryResult[]> {
    return this.http.get<SubQueryResult[]>(`${this.BASE}/messages/${messageId}/sub-queries`);
  }

  getTokenUsage(messageId: number): Observable<TokenUsageLog> {
    return this.http.get<TokenUsageLog>(`${this.BASE}/messages/${messageId}/token-usage`);
  }
}