import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BulkUploadResponse, SopDocument } from '../models/document.model';

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private readonly BASE = 'http://localhost:3000/api/chatbot-sop/sop-documents';

  constructor(private http: HttpClient) {}

  getAll(): Observable<SopDocument[]> {
    return this.http.get<SopDocument[]>(this.BASE);
  }

  uploadSingle(file: File): Observable<SopDocument> {
    const form = new FormData();
    form.append('files', file);
    return this.http.post<SopDocument>(this.BASE, form);
  }

  uploadBulk(files: File[]): Observable<BulkUploadResponse> {
    const form = new FormData();
    files.forEach(f => form.append('files[]', f));
    return this.http.post<BulkUploadResponse>(`${this.BASE}/bulk`, form);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.BASE}/${id}`);
  }
}