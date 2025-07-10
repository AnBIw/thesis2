import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ThesisTopic } from '../models/thesis-topic.model';

export interface ProposedTopic {
    title: string;
    description: string;
    studentName: string;
    justification: string;
    proposedToProfessor: string;
    professorEmail?: string;
    status: 'pending' | 'pre-selected' | 'approved' | 'rejected';
    preselectionComment?: string;
}

@Injectable({
    providedIn: 'root',
})

export class ThesisService {
    //obtener profesores y temas de tesis
    private apiURL = 'http://localhost:3000/auth';
    constructor(private http: HttpClient) { }
    getProfessors(): Observable<{ name: string; specialty: string }[]> {
        return this.http.get<{ name: string; specialty: string }[]>(`${this.apiURL}/profesores`);
    }
    getThesisTopics(): Observable<ThesisTopic[]> {
        return this.http.get<ThesisTopic[]>(`${this.apiURL}/temas`);
    }
    //operaciones con las tesis
    private url1 = 'http://localhost:3000/thesis-topics';

    addThesisTopic(thesisTopic: ThesisTopic): Observable<ThesisTopic> {
        return this.http.post<ThesisTopic>(this.url1, thesisTopic);
    }

    deleteThesisTopic(tittle: string): Observable<ThesisTopic> {
        return this.http.delete<ThesisTopic>(`${this.url1}/${tittle}`);
    }

    updateThesisTopic(thesisTopic: ThesisTopic): Observable<ThesisTopic> {
        return this.http.put<ThesisTopic>(`${this.url1}/${thesisTopic.id}`, thesisTopic);
    }

    enrollStudent(tittle: string, email: string): Observable<void> {
        return this.http.post<void>(`${this.url1}/${tittle}/enroll`, { email });
    }
    unsubscribeStudent(tittle: string, email: string) {
        return this.http.post<void>(`${this.url1}/${tittle}/unroll`, { name, email });
    }

    // Métodos para propuestas de temas de estudiantes
    proposeThesisTopic(proposedTopic: ProposedTopic): Observable<ProposedTopic> {
        return this.http.post<ProposedTopic>(`${this.url1}/propose`, proposedTopic);
    }

    getProposedTopics(): Observable<ProposedTopic[]> {
        return this.http.get<ProposedTopic[]>(`${this.url1}/proposals`);
    }

    preselectProposal(proposalId: string, comment?: string): Observable<ProposedTopic> {
        return this.http.patch<ProposedTopic>(`${this.url1}/proposals/${proposalId}/preselect`, { comment });
    }

    deleteProposal(proposalId: string): Observable<void> {
        return this.http.delete<void>(`${this.url1}/proposals/${proposalId}`);
    }

    updateProposalStatus(proposalId: string, status: 'approved' | 'rejected'): Observable<ProposedTopic> {
        return this.http.patch<ProposedTopic>(`${this.url1}/proposals/${proposalId}`, { status });
    }
}