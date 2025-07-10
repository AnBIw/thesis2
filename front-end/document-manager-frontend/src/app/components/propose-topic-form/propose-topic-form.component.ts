import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { ThesisService, ProposedTopic } from '../../services/thesis.service';

@Component({
  selector: 'app-propose-topic-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatSelectModule,
  ],
  templateUrl: './propose-topic-form.component.html',
  styleUrls: ['./propose-topic-form.component.css'],
})
export class ProposeTopicFormComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() topicProposed = new EventEmitter<ProposedTopic>();

  studentName: string = localStorage.getItem('name') || '';
  professors: { name: string; specialty: string }[] = [];
  
  proposedTopic: ProposedTopic = {
    title: '',
    description: '',
    studentName: this.studentName,
    justification: '',
    proposedToProfessor: '',
    status: 'pending'
  };

  constructor(
    private thesisService: ThesisService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadProfessors();
    this.checkProposalLimit();
  }

  loadProfessors(): void {
    this.thesisService.getProfessors().subscribe({
      next: (professors) => {
        this.professors = professors;
      },
      error: (error) => {
        console.error('Error al cargar profesores:', error);
        this.snackBar.open('Error al cargar la lista de profesores', 'Cerrar', {
          duration: 3000,
        });
      }
    });
  }

  // Verificar cuántas propuestas tiene el estudiante actualmente
  checkProposalLimit(): void {
    this.thesisService.getProposedTopics().subscribe({
      next: (proposals) => {
        const myProposals = proposals.filter(p => p.studentName === this.studentName);
        if (myProposals.length >= 3) {
          this.snackBar.open('Ya tienes 3 propuestas. Elimina alguna antes de crear una nueva.', 'Cerrar', {
            duration: 5000,
          });
        }
      },
      error: (error) => {
        console.error('Error al verificar propuestas:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.isFormValid()) {
      // Aquí llamarías al servicio para enviar la propuesta
      this.proposeTopic();
    }
  }

  proposeTopic(): void {
    // Llamar al servicio para enviar la propuesta
    this.thesisService.proposeThesisTopic(this.proposedTopic).subscribe({
      next: (response) => {
        console.log('Propuesta enviada exitosamente:', response);
        
        // Emitir el evento con el tema propuesto
        this.topicProposed.emit(response);
        
        // Mostrar mensaje de confirmación
        this.snackBar.open('¡Propuesta de tema enviada exitosamente!', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });

        // Cerrar el modal
        this.onClose();
      },
      error: (error) => {
        console.error('Error al enviar la propuesta:', error);
        
        // Manejar específicamente el error del límite de propuestas
        let errorMessage = 'Error al enviar la propuesta. Inténtalo de nuevo.';
        if (error.error?.message && error.error.message.includes('No puedes proponer más de 3 temas')) {
          errorMessage = 'Ya tienes 3 propuestas en total. Elimina alguna antes de crear una nueva.';
        }
        
        this.snackBar.open(errorMessage, 'Cerrar', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      }
    });
  }

  onClose(): void {
    this.close.emit();
  }

  isFormValid(): boolean {
    return !!(
      this.proposedTopic.title.trim() &&
      this.proposedTopic.description.trim() &&
      this.proposedTopic.justification.trim() &&
      this.proposedTopic.proposedToProfessor.trim()
    );
  }
}
