import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  private apiUrl = 'http://localhost:3000/documents'; // Ajusta la URL según tu backend

  constructor(private http: HttpClient) {}

  uploadDocument(file: File, description: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', description);
    return this.http.post(`${this.apiUrl}/upload`, formData);
  }

  getDocuments(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }

  getDocumentById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  previewDocument(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/preview/${id}`, { responseType: 'blob' });
  }

  downloadDocument(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download/${id}`, { responseType: 'blob' });
  }

  deleteDocument(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
  
}