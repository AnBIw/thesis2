import { Component, OnInit, OnDestroy } from '@angular/core';
import { DocumentListComponent } from '../document-list/document-list.component';
import { TopicListComponent } from '../topic-list/topic-list.component';
import { ProposeTopicFormComponent } from '../propose-topic-form/propose-topic-form.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { ThesisService } from '../../services/thesis.service';
import { TesisActual } from '../../models/thesis-topic.model';
import { TemaActualService } from '../../services/tema-actual.service';
import { Subscription } from 'rxjs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-student-panel',
    imports: [
      DocumentListComponent,    // Importa el subcomponente de la lista
      TopicListComponent,
      ProposeTopicFormComponent,
      CommonModule,
      FormsModule,
      MatCardModule,
      MatButtonModule,
      MatInputModule,
      MatFormFieldModule,
      MatIconModule,
      MatSnackBarModule,
      MatDialogModule,
    ],
  templateUrl: './student-panel.component.html',
  styleUrl: './student-panel.component.css'
})
export class StudentPanelComponent implements OnInit, OnDestroy {
  StudentName: string = localStorage.getItem('name') || '';
  StudentEmail: string = localStorage.getItem('email') || '';
  showProposeForm: boolean = false;
  tesisActual: TesisActual | null = null;
  private temaActualizadoSubscription: Subscription = new Subscription();

  constructor(
    private thesisService: ThesisService,
    private temaActualService: TemaActualService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadTesisActual();
    this.subscribeToTemaUpdates();
    this.checkPreselectedProposals();
  }

  ngOnDestroy(): void {
    this.temaActualizadoSubscription.unsubscribe();
  }

  private subscribeToTemaUpdates(): void {
    this.temaActualizadoSubscription = this.temaActualService.temaActualizado$.subscribe({
      next: (tesisActual) => {
        console.log('Tema actualizado recibido:', tesisActual);
        this.tesisActual = tesisActual;
      },
      error: (error) => {
        console.error('Error en suscripción de tema actual:', error);
      }
    });
  }

  loadTesisActual(): void {
    // Primero verificar localStorage para cambios inmediatos
    const localTesis = localStorage.getItem('tesisActual');
    if (localTesis) {
      this.tesisActual = JSON.parse(localTesis);
      return;
    }

    // Si no está en localStorage, consultar al servidor
    this.thesisService.getStudentTesisActual(this.StudentName).subscribe({
      next: (data) => {
        this.tesisActual = data;
        if (this.tesisActual) {
          localStorage.setItem('tesisActual', JSON.stringify(this.tesisActual));
        }
      },
      error: (error) => {
        console.log('No hay tema actual asignado o error al cargar:', error);
        this.tesisActual = null;
      }
    });
  }

  getTesisStatus(): string {
    if (this.tesisActual && this.tesisActual.titulo && this.tesisActual.profesor) {
      return `"${this.tesisActual.titulo}" con Prof. ${this.tesisActual.profesor}`;
    }
    return 'Sin tema y sin profesor';
  }

  openProposeTopicForm(): void {
    this.showProposeForm = true;
  }

  closeProposeTopicForm(): void {
    this.showProposeForm = false;
  }

  onTopicProposed(topic: any): void {
    console.log('Tema propuesto:', topic);
    this.showProposeForm = false;
    // Aquí puedes agregar lógica adicional, como mostrar un mensaje de confirmación
    // o actualizar la lista de temas
  }

  // Método para limpiar el tema actual (útil para testing o casos especiales)
  clearTesisActual(): void {
    this.thesisService.clearStudentTesisActual(this.StudentName).subscribe({
      next: () => {
        this.tesisActual = null;
        localStorage.removeItem('tesisActual');
        // Notificar el cambio
        this.temaActualService.notificarTemaLimpiado();
        console.log('Tema actual limpiado');
      },
      error: (error) => {
        console.error('Error al limpiar tema actual', error);
      }
    });
  }

  // Método para refrescar el estado del tema (útil para actualizaciones en tiempo real)
  refreshTesisStatus(): void {
    localStorage.removeItem('tesisActual');
    this.loadTesisActual();
  }

  // Verificar propuestas preseleccionadas con comentarios
  private checkPreselectedProposals(): void {
    console.log('Verificando propuestas preseleccionadas para:', this.StudentName);
    
    this.thesisService.getStudentPreselectedProposals(this.StudentName).subscribe({
      next: (proposals) => {
        console.log('Propuestas preseleccionadas recibidas:', proposals);
        if (proposals.length > 0) {
          console.log('Mostrando notificaciones para', proposals.length, 'propuestas');
          // Mostrar notificaciones de forma secuencial para evitar superposición
          this.showSequentialNotifications(proposals);
        } else {
          console.log('No hay propuestas preseleccionadas para mostrar');
        }
      },
      error: (error) => {
        console.error('Error al cargar propuestas preseleccionadas:', error);
      }
    });
  }

  // Mostrar notificaciones de forma secuencial
  private showSequentialNotifications(proposals: any[]): void {
    let currentIndex = 0;

    const showNext = () => {
      if (currentIndex < proposals.length) {
        const proposal = proposals[currentIndex];
        this.showPreselectionNotification(proposal, () => {
          currentIndex++;
          // Esperar un poco antes de mostrar la siguiente notificación
          setTimeout(showNext, 1000);
        });
      }
    };

    showNext();
  }

  // Mostrar notificación de preselección
  private showPreselectionNotification(proposal: any, onComplete?: () => void): void {
    console.log('Mostrando notificación para propuesta:', proposal.title);
    
    const message = `¡Tu propuesta "${proposal.title}" ha sido preseleccionada!

Comentario del profesor: "${proposal.preselectionComment}"

Propuesta: ${proposal.title}
Profesor: ${proposal.proposedToProfessor}`;

    console.log('Mensaje completo:', message);

    // Usar un snackBar más duradero para mostrar el mensaje completo
    const snackBarRef = this.snackBar.open(
      `¡Propuesta preseleccionada! "${proposal.title}"`, 
      'Ver Detalles', 
      { 
        duration: 8000, // Reducir un poco la duración para que no se acumulen tanto
        panelClass: ['preselection-notification']
      }
    );

    console.log('SnackBar mostrado');

    // Si hace clic en "Ver Detalles", mostrar el mensaje completo
    snackBarRef.onAction().subscribe(() => {
      console.log('Usuario hizo clic en Ver Detalles');
      alert(message);
    });

    // Cuando la notificación se cierre (por tiempo o acción), llamar al callback
    snackBarRef.afterDismissed().subscribe(() => {
      console.log('Notificación cerrada para:', proposal.title);
      if (onComplete) {
        onComplete();
      }
    });
  }
}
