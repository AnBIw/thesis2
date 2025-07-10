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
import { MatTableModule } from '@angular/material/table'; 
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'; 

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
    MatSnackBarModule,
  ],
  templateUrl: './topic-list.component.html',
  styleUrls: ['./topic-list.component.css'],
})
export class TopicListComponent implements OnInit {
  thesisTopics: ThesisTopic[] = [];
  professors: { name: string; specialty: string }[] = [];
  proposedTopics: any[] = []; // Propuestas de temas
  displayedColumns: string[] = ['title', 'description', 'avaliableSlots', 'enrolledStudents'];
  userRole: string = localStorage.getItem('userRole') || '';
  email: string = localStorage.getItem('email') || '';
  userName: string = localStorage.getItem('name') || ''; 

  constructor(
    private thesisService: ThesisService,
    private snackBar: MatSnackBar 
  ) { }

  ngOnInit(): void {
    this.loadThesisTopics();
    this.getProfessors();
    this.getThesisTopics();
    this.loadProposedTopics();
  }
  //cargo los temas de tesis
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
      },
      (error) => {
        console.error('Error fetching thesis topics:', error);
      }
    );
  }
  getTopicsByProfessor(professorName: string): ThesisTopic[] {
    return this.thesisTopics.filter((topic) => topic.professor === professorName);
  }
  deleteTopic(tittle: string): void {
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
  isUserEnrolled(topic: any): boolean {
    return Array.isArray(topic.enrolledStudents) &&
      topic.enrolledStudents.some((s: string) => s.split(',')[0] === this.email);
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

  // Cargar propuestas de temas
  loadProposedTopics(): void {
    this.thesisService.getProposedTopics().subscribe({
      next: (response) => {
        this.proposedTopics = response;
      },
      error: (error) => {
        console.error('Error loading proposed topics', error);
      },
    });
  }

  // Método para combinar temas oficiales y propuestas por profesor
  getCombinedTopicsByProfessor(professorName: string): any[] {
    const officialTopics = this.thesisTopics.filter(topic => topic.professor === professorName);
    const proposals = this.proposedTopics.filter(proposal => proposal.proposedToProfessor === professorName);
    
    // Mapear propuestas para que tengan la estructura correcta
    const mappedProposals = proposals.map(proposal => ({
      title: this.canViewProposalDetails(proposal.proposedToProfessor) ? proposal.title : 'Propuesta Privada',
      description: this.canViewProposalDetails(proposal.proposedToProfessor) ? proposal.description : 'Contenido privado - Solo visible para el profesor destinatario',
      avaliableSlots: proposal.status,
      enrolledStudents: [],
      studentName: proposal.studentName,
      isProposal: true,
      status: proposal.status,
      proposalId: proposal._id,
      proposedToProfessor: proposal.proposedToProfessor,
      originalTitle: proposal.title,
      originalDescription: proposal.description,
      justification: proposal.justification,
      preselectionComment: proposal.preselectionComment
    }));

    console.log('Professor:', professorName);
    console.log('Official topics:', officialTopics.length);
    console.log('Proposals:', mappedProposals.length);
    console.log('User role:', this.userRole);
    console.log('User name:', this.userName);

    return [...officialTopics, ...mappedProposals];
  }

  // Obtener la clase CSS para el estado de la propuesta
  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'pre-selected':
        return 'status-preselected';
      case 'approved':
        return 'status-approved';
      case 'rejected':
        return 'status-rejected';
      default:
        return 'status-pending';
    }
  }

  // Obtener el texto del estado traducido
  getStatusText(status: string): string {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'pre-selected':
        return 'Preseleccionada';
      case 'approved':
        return 'Aprobada';
      case 'rejected':
        return 'Rechazada';
      default:
        return 'Pendiente';
    }
  }

  // Verificar si el usuario actual puede ver los detalles de la propuesta
  canViewProposalDetails(professorName: string): boolean {
    return this.userRole === 'professor' && this.userName === professorName;
  }

  // Contar propuestas totales del estudiante actual
  getTotalProposalCount(): number {
    return this.proposedTopics.filter(proposal => 
      proposal.studentName === this.userName
    ).length;
  }

  // Verificar si el estudiante puede proponer más temas
  canProposeMore(): boolean {
    return this.getTotalProposalCount() < 3;
  }

  // Eliminar propuesta (solo para el estudiante que la propuso)
  deleteProposal(proposalId: string): void {
    if (confirm('¿Estás seguro que deseas eliminar esta propuesta?')) {
      this.thesisService.deleteProposal(proposalId).subscribe({
        next: () => {
          this.snackBar.open('Propuesta eliminada correctamente', 'Cerrar', { duration: 3000 });
          this.loadProposedTopics();
        },
        error: (error) => {
          console.error('Error al eliminar propuesta', error);
          this.snackBar.open('Error al eliminar propuesta', 'Cerrar', { duration: 3000 });
        },
      });
    }
  }

  // Preseleccionar propuesta
  preselectProposal(proposalId: string): void {
    const comment = prompt('Comentario sobre la preselección (opcional):');
    
    this.thesisService.preselectProposal(proposalId, comment || '').subscribe({
      next: () => {
        this.snackBar.open('Propuesta preseleccionada exitosamente', 'Cerrar', { duration: 3000 });
        this.loadProposedTopics();
      },
      error: (error) => {
        console.error('Error al preseleccionar propuesta', error);
        this.snackBar.open('Error al preseleccionar propuesta', 'Cerrar', { duration: 3000 });
      },
    });
  }

  // Aprobar propuesta
  approveProposal(proposalId: string): void {
    this.thesisService.updateProposalStatus(proposalId, 'approved').subscribe({
      next: () => {
        this.snackBar.open('Propuesta aprobada exitosamente', 'Cerrar', { duration: 3000 });
        this.loadProposedTopics();
        this.loadThesisTopics(); // Recargar temas porque se creará uno nuevo
      },
      error: (error) => {
        console.error('Error al aprobar propuesta', error);
        this.snackBar.open('Error al aprobar propuesta', 'Cerrar', { duration: 3000 });
      },
    });
  }

  // Rechazar propuesta
  rejectProposal(proposalId: string): void {
    this.thesisService.updateProposalStatus(proposalId, 'rejected').subscribe({
      next: () => {
        this.snackBar.open('Propuesta rechazada', 'Cerrar', { duration: 3000 });
        this.loadProposedTopics();
      },
      error: (error) => {
        console.error('Error al rechazar propuesta', error);
        this.snackBar.open('Error al rechazar propuesta', 'Cerrar', { duration: 3000 });
      },
    });
  }

  // Mostrar detalles completos de la propuesta (solo para el profesor destinatario)
  showProposalDetails(proposal: any): void {
    if (!this.canViewProposalDetails(proposal.proposedToProfessor)) {
      this.snackBar.open('No tienes permisos para ver los detalles de esta propuesta', 'Cerrar', { duration: 3000 });
      return;
    }

    // Incluir comentario de preselección si existe
    let details = `
Título: ${proposal.originalTitle}
Descripción: ${proposal.originalDescription}
Justificación: ${proposal.justification}
Propuesto por: ${proposal.studentName}
Estado: ${this.getStatusText(proposal.status)}`;

    if (proposal.preselectionComment && proposal.status === 'pre-selected') {
      details += `
Comentario de preselección: ${proposal.preselectionComment}`;
    }

    alert(details); // Por simplicidad uso alert, pero podrías usar un modal más elegante
  }

  /**
   * Abre el cliente de correo predeterminado para enviar un email al estudiante
   * @param studentEmail - Email del estudiante
   * @param topic - Información del tema de tesis
   */
  openEmailClient(studentEmail: string, topic: any): void {
    const subject = encodeURIComponent('Consulta sobre Tema de Tesis');
    const body = encodeURIComponent(`Estimado/a estudiante,

IntegraTesis
Espero que se encuentre bien. Me pongo en contacto con usted en relación al tema de tesis en el que se encuentra inscrito/a.

INFORMACIÓN DEL TEMA:
Título: ${topic.title}
Descripción: ${topic.description}
Cupos disponibles: ${topic.avaliableSlots}
Profesor: ${topic.professor || this.userName}

[Escriba aquí su mensaje]

Saludos cordiales,
${this.userName}
Profesor/a - Universidad Austral de Chile`);

    const mailtoLink = `mailto:${studentEmail}?subject=${subject}&body=${body}`;
    
    try {
      window.open(mailtoLink, '_blank');
    } catch (error) {
      console.error('Error al abrir cliente de correo:', error);
      // Fallback: copiar email al portapapeles
      navigator.clipboard.writeText(studentEmail).then(() => {
        this.snackBar.open(`Email copiado al portapapeles: ${studentEmail}`, 'Cerrar', {
          duration: 3000
        });
      });
    }
  }

  // Confirmar que el estudiante vio el estado de su propuesta
  confirmProposalViewed(proposalId: string): void {
    const confirmMessage = '¿Confirmas que has visto el estado de tu propuesta? Esta acción eliminará la propuesta de la tabla.';
    
    if (confirm(confirmMessage)) {
      this.thesisService.deleteProposal(proposalId).subscribe({
        next: () => {
          this.snackBar.open('Propuesta confirmada y eliminada de la vista', 'Cerrar', { duration: 3000 });
          this.loadProposedTopics(); // Recargar para actualizar la vista
        },
        error: (error) => {
          console.error('Error al confirmar propuesta vista', error);
          this.snackBar.open('Error al procesar la confirmación', 'Cerrar', { duration: 3000 });
        },
      });
    }
  }

  // Filtrar y ordenar profesores según el rol del usuario
  getFilteredAndSortedProfessors(): { name: string; specialty: string }[] {
    let filteredProfessors = [...this.professors];

    // Si es profesor, solo mostrar su información al inicio, luego los demás
    if (this.userRole === 'professor') {
      // Separar el profesor actual de los demás
      const currentProfessor = filteredProfessors.filter(prof => prof.name === this.userName);
      const otherProfessors = filteredProfessors.filter(prof => prof.name !== this.userName);
      
      // Retornar el profesor actual primero, luego los demás
      return [...currentProfessor, ...otherProfessors];
    }

    // Para estudiantes y administradores, mostrar todos los profesores
    // pero con el profesor del usuario actual (si existe) al principio
    if (this.userName) {
      const currentProfessor = filteredProfessors.filter(prof => prof.name === this.userName);
      const otherProfessors = filteredProfessors.filter(prof => prof.name !== this.userName);
      return [...currentProfessor, ...otherProfessors];
    }

    return filteredProfessors;
  }

  // Cambiar estado de propuesta ya procesada (para corregir errores)
  toggleProposalStatus(proposalId: string, currentStatus: string): void {
    const newStatus = currentStatus === 'approved' ? 'rejected' : 'approved';
    const confirmMessage = `¿Estás seguro que deseas cambiar el estado de esta propuesta de "${this.getStatusText(currentStatus)}" a "${this.getStatusText(newStatus)}"?`;
    
    if (confirm(confirmMessage)) {
      this.thesisService.updateProposalStatus(proposalId, newStatus).subscribe({
        next: () => {
          this.snackBar.open(`Propuesta cambiada a ${this.getStatusText(newStatus)}`, 'Cerrar', { duration: 3000 });
          this.loadProposedTopics(); // Solo recargar propuestas, no temas oficiales
        },
        error: (error) => {
          console.error('Error al cambiar estado de propuesta', error);
          this.snackBar.open('Error al cambiar estado de propuesta', 'Cerrar', { duration: 3000 });
        },
      });
    }
  }
}