import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { ThesisService } from '../../services/thesis.service';
import { ThesisTopic } from '../../models/thesis-topic.model';
import { MatTableModule } from '@angular/material/table'; // Importa MatTableModule

@Component({
  selector: 'topic-list',
  standalone: true, 
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatListModule,
    MatIconModule,
    MatTableModule,
  ],
  templateUrl: './topic-list.component.html',
  styleUrls: ['./topic-list.component.css'],
})
export class TopicListComponent implements OnInit {
  thesisTopics: ThesisTopic[] = [];
  professors: { name: string; specialty: string }[] = [];
  displayedColumns: string[] = ['title', 'description', 'avaliableSlots'];
  userRole: string = localStorage.getItem('role') || '';

  constructor(private thesisService: ThesisService) {}

  ngOnInit(): void {
    this.userRole = localStorage.getItem('userRole') || ''; // Obtén el rol del usuario desde localStorage
    console.log('Rol del usuario:', this.userRole); // Verifica el valor del rol
    this.loadThesisTopics();
    this.getProfessors();
    this.getThesisTopics();
  }

  loadThesisTopics(): void {
    this.thesisService.getThesisTopics().subscribe({
      next: (response) => {
        this.thesisTopics = response;
      },
      error: (error) => {
        console.error('Error loading thesis topics', error);
      },
    });
  }
  
  getProfessors(): void {
    this.thesisService.getProfessors().subscribe(
      (professors) => {
        this.professors = professors;
      },
      (error) => {
        console.error('Error fetching professors:', error);
      }
    );
  }

  getThesisTopics(): void {
    this.thesisService.getThesisTopics().subscribe(
      (topics) => {
        this.thesisTopics = topics;
      },
      (error) => {
        console.error('Error fetching thesis topics:', error);
      }
    );
  }

  getTopicsByProfessor(professorName: string): ThesisTopic[] {
    return this.thesisTopics.filter((topic) => topic.professor === professorName);
  }

  deleteTopic(id: string): void {
  this.thesisService.deleteThesisTopic(id).subscribe({
    next: () => {
      this.loadThesisTopics();
    },
    error: (error) => {
      console.error('Error deleting thesis topic', error);
    },
    });
  }

  enrollStudent(topicId: string): void {
    const studentEmail = localStorage.getItem('email') || ''; // Obtén el nombre del estudiante desde localStorage
    if (!studentEmail) {
      console.error('No se encontró el nombre del estudiante en localStorage');
      return;
    }
  
    this.thesisService.enrollStudent(topicId, studentEmail).subscribe({
      next: () => {
        console.log('Estudiante inscrito correctamente');
        this.loadThesisTopics(); // Recargar la lista de temas
      },
      error: (error) => {
        console.error('Error al inscribir al estudiante', error);
      },
    });
  }
}