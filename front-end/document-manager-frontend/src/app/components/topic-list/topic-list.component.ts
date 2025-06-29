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
import { MatSnackBar } from '@angular/material/snack-bar'; // Importa MatSnackBar para mostrar mensajes

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
  displayedColumns: string[] = ['title', 'description', 'avaliableSlots', 'enrolledStudents'];
  userRole: string = localStorage.getItem('userRole') || '';

  constructor(
    private thesisService: ThesisService,
    private snackBar: MatSnackBar // Agrega esto

  ) {}

  ngOnInit(): void {
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
  //cargo a todos los profesores de la base de datos + especialidades
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
  //cargo los temas de tesis 
  getThesisTopics(): void {
    this.thesisService.getThesisTopics().subscribe(
      (topics) => {
        this.thesisTopics = topics;
        //console.log('Thesis topics loaded:', this.thesisTopics);
      },
      (error) => {
        console.error('Error fetching thesis topics:', error);
      }
    );
  }

  getTopicsByProfessor(professorName: string): ThesisTopic[] {
    return this.thesisTopics.filter((topic) => topic.professor === professorName);
  }

  deleteTopic(tittle : string): void {
  this.thesisService.deleteThesisTopic(tittle).subscribe({
    next: () => {
      this.loadThesisTopics();
    },
    error: (error) => {
      console.error('Error deleting thesis topic', error);
    },
    });
  }

  enrollStudent(title: string): void {
    const studentEmail = localStorage.getItem('email') || '';
    // Cuenta los temas donde el estudiante está inscrito
    const inscripciones = this.thesisTopics.filter(topic =>
      topic.enrolledStudents?.some((s: any) => typeof s === 'string' && s.split(',')[0] === studentEmail)
    ).length;

    if (inscripciones >= 2) {
      this.snackBar.open('Solo puedes inscribirte en 2 temas como máximo.', 'Cerrar', { duration: 3000 });
      return;
    }

    this.thesisService.enrollStudent(title, studentEmail).subscribe({
      next: () => {
        this.loadThesisTopics();
        this.snackBar.open('Estudiante inscrito correctamente', 'Cerrar', { duration: 2000 });
      },
      error: (error) => {
        console.error('Error al inscribir al estudiante', error);
      },
    });
}
  unsubscribeStudent(title: string): void {
    if (confirm('¿Estás seguro que deseas desuscribirte de este tema?')) {
    const studentEmail = localStorage.getItem('email') || '';
    this.thesisService.unsubscribeStudent(title, studentEmail).subscribe({
      next: () => {
        this.loadThesisTopics();
        this.snackBar.open('Estudiante desinscrito correctamente', 'Cerrar', {
          duration: 2000,
        });
      },
      error: (error) => {
        console.error('Error al desuscribir al estudiante', error);
      },
    });
  }
  }
  
}