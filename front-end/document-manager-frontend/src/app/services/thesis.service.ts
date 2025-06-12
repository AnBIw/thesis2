import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ThesisTopic } from '../models/thesis-topic.model';

@Injectable({
  providedIn: 'root',
})

export class ThesisService {
    private apiURL = 'http://localhost:3000/auth'; // Cambia la URL si es necesario

    constructor(private http: HttpClient) {}

    getProfessors(): Observable<{ name: string; specialty: string }[]> {
        return this.http.get<{ name: string; specialty: string }[]>(`${this.apiURL}/profesores`);
    }
      getThesisTopics(): Observable<ThesisTopic[]> {
        return this.http.get<ThesisTopic[]>(`${this.apiURL}/temas`);
    }
    private url1 = 'http://localhost:3000/thesis-topics';

    // getThesisTopics(): Observable<ThesisTopic[]> {
    //     return this.http.get<ThesisTopic[]>(this.url1);
    // }

    addThesisTopic(thesisTopic: ThesisTopic): Observable<ThesisTopic> {
        return this.http.post<ThesisTopic>(this.url1, thesisTopic);
    }

    deleteThesisTopic(tittle: string): Observable<ThesisTopic> {
        return this.http.delete<ThesisTopic>(`${this.url1}/${tittle}`);
    }

    updateThesisTopic(thesisTopic: ThesisTopic): Observable<ThesisTopic> {
        return this.http.put<ThesisTopic>(`${this.url1}/${thesisTopic.id}`, thesisTopic);
    }

    enrollStudent(tittle: string, name: string, email: string): Observable<void> {
        return this.http.post<void>(`${this.url1}/${tittle}/enroll`, { name, email });
      }
}