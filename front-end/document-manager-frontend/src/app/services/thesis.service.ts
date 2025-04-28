import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ThesisTopic } from '../models/thesis-topic.model';

@Injectable({
  providedIn: 'root',
})

export class ThesisService {
    private apiURL = 'http://localhost:3000/thesis-topics';

    constructor(private http: HttpClient) {}

    getThesisTopics(): Observable<ThesisTopic[]> {
        return this.http.get<ThesisTopic[]>(this.apiURL);
    }

    addThesisTopic(thesisTopic: ThesisTopic): Observable<ThesisTopic> {
        return this.http.post<ThesisTopic>(this.apiURL, thesisTopic);
    }

    deleteThesisTopic(id: string): Observable<ThesisTopic> {
        return this.http.delete<ThesisTopic>(`${this.apiURL}/${id}`);
    }

    updateThesisTopic(thesisTopic: ThesisTopic): Observable<ThesisTopic> {
        return this.http.put<ThesisTopic>(`${this.apiURL}/${thesisTopic.id}`, thesisTopic);
    }
}