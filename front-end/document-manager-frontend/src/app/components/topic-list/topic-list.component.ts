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
import { TemaActualService } from '../../services/tema-actual.service';

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
    private snackBar: MatSnackBar,
    private temaActualService: TemaActualService
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

  /* 
    Lógica de visualización de propuestas:
    
    - ESTUDIANTES: Ven todas las propuestas del profesor, EXCEPTO las aprobadas de otros estudiantes
                  (las propuestas aprobadas propias las ven hasta que confirmen que las vieron)
    
    - PROFESORES/ADMINS: NO ven propuestas aprobadas porque estas se convierten automáticamente 
                        en temas oficiales, evitando duplicación en la vista
    
    Flujo: Propuesta → Aprobada → Tema Oficial + Propuesta visible solo para el estudiante autor
           → Estudiante confirma → Propuesta eliminada, solo queda Tema Oficial
    */
    
  // Método para combinar temas oficiales y propuestas por profesor
  getCombinedTopicsByProfessor(professorName: string): any[] {
    const officialTopics = this.thesisTopics.filter(topic => topic.professor === professorName);
    
    // Filtrar propuestas según el rol del usuario
    let proposals;
    if (this.userRole === 'students') {
      // Para estudiantes: mostrar todas las propuestas dirigidas al profesor
      // Las propuestas aprobadas las verán solo si son suyas (para confirmar que las vieron)
      proposals = this.proposedTopics.filter(proposal => {
        if (proposal.proposedToProfessor !== professorName) return false;
        
        // Si es una propuesta aprobada, solo mostrarla si es del estudiante actual
        if (proposal.status === 'approved') {
          return proposal.studentName === this.userName;
        }
        
        // Para otros estados, mostrar todas
        return true;
      });
    } else {
      // Para profesores y admins: NO mostrar propuestas aprobadas como propuestas separadas
      // Las propuestas aprobadas se muestran integradas en los temas oficiales
      proposals = this.proposedTopics.filter(proposal => 
        proposal.proposedToProfessor === professorName && proposal.status !== 'approved'
      );
    }

    // Para profesores: agregar información de propuestas aprobadas a los temas oficiales correspondientes
    if (this.userRole === 'professor' || this.userRole === 'admin') {
      const approvedProposals = this.proposedTopics.filter(proposal => 
        proposal.proposedToProfessor === professorName && proposal.status === 'approved'
      );

      // Marcar temas oficiales que provienen de propuestas aprobadas
      officialTopics.forEach(topic => {
        const relatedProposal = approvedProposals.find(proposal => 
          proposal.title.trim().toLowerCase() === topic.title.trim().toLowerCase()
        );
        if (relatedProposal) {
          (topic as any).fromApprovedProposal = true;
          (topic as any).originalProposalId = relatedProposal._id;
          (topic as any).proposalStudentName = relatedProposal.studentName;
        }
      });
    }
    
    // Mapear propuestas para que tengan la estructura correcta
    const mappedProposals = proposals.map(proposal => ({
      title: this.canViewProposalDetails(proposal.proposedToProfessor, proposal.studentName) ? proposal.title : 'Propuesta Privada',
      description: this.canViewProposalDetails(proposal.proposedToProfessor, proposal.studentName) ? proposal.description : 'Contenido privado - Solo visible para participantes autorizados',
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
  canViewProposalDetails(professorName: string, studentName?: string): boolean {
    // Los administradores pueden ver todas las propuestas
    if (this.userRole === 'admin') {
      return true;
    }
    
    // Todos los profesores pueden ver las propuestas (para evitar duplicados y permitir coordinación)
    if (this.userRole === 'professor') {
      return true;
    }
    
    // El estudiante que emitió la propuesta puede verla
    if (this.userRole === 'students' && studentName && this.userName === studentName) {
      return true;
    }
    
    // Otros estudiantes no pueden ver propuestas de otros
    return false;
  }

  // Contar propuestas totales del estudiante actual
  getTotalProposalCount(): number {
    return this.proposedTopics.filter(proposal => 
      proposal.studentName === this.userName
    ).length;
  }

  // Verificar si el estudiante puede hacer más propuestas
  canProposeMore(): boolean {
    return this.getTotalProposalCount() < 3;
  }

  // Obtener profesores filtrados y ordenados
  getFilteredAndSortedProfessors(): { name: string; specialty: string }[] {
    // Si el usuario es profesor, poner su información primero
    if (this.userRole === 'professor') {
      const currentProfessor = this.professors.find(prof => prof.name === this.userName);
      const otherProfessors = this.professors.filter(prof => prof.name !== this.userName);
      
      // Ordenar los otros profesores alfabéticamente
      otherProfessors.sort((a, b) => a.name.localeCompare(b.name));
      
      // Retornar el profesor actual primero, seguido de los demás
      return currentProfessor ? [currentProfessor, ...otherProfessors] : otherProfessors;
    }
    
    // Para estudiantes y admin, ordenar alfabéticamente
    return this.professors.sort((a, b) => a.name.localeCompare(b.name));
  }

  // Abrir cliente de email para contactar estudiante
  openEmailClient(studentEmail: string, topic: any): void {
    const subject = encodeURIComponent(`Tema de Tesis: ${topic.title}`);
    const body = encodeURIComponent(`Hola,

Me pongo en contacto contigo sobre el tema de tesis "${topic.title}".

Saludos,
${this.userName}`);
    
    const mailtoLink = `mailto:${studentEmail}?subject=${subject}&body=${body}`;
    window.open(mailtoLink, '_blank');
  }

  // Revertir propuesta aprobada a estado pendiente
  revertApprovedProposal(proposalId: string, topicTitle: string): void {
    if (confirm(`¿Estás seguro de que quieres revertir el tema "${topicTitle}" a propuesta pendiente? Esto eliminará el tema oficial y permitirá revisar nuevamente la propuesta.`)) {
      this.thesisService.changeProposalStatus(proposalId, 'pending').subscribe({
        next: (response) => {
          this.snackBar.open('Propuesta revertida exitosamente a estado pendiente', 'Cerrar', {
            duration: 3000
          });
          
          // Recargar ambas listas para reflejar los cambios
          this.loadThesisTopics();
          this.loadProposedTopics();
        },
        error: (error) => {
          console.error('Error al revertir la propuesta:', error);
          this.snackBar.open('Error al revertir la propuesta', 'Cerrar', {
            duration: 3000
          });
        }
      });
    }
  }

  // Alternar el estado de inscripción de un tema
  toggleRegistration(topic: any): void {
    const newRegistrationState = !topic.registrationOpen;
    const actionText = newRegistrationState ? 'abrir' : 'cerrar';
    
    if (confirm(`¿Estás seguro de que quieres ${actionText} las inscripciones para el tema "${topic.title}"?`)) {
      this.thesisService.toggleTopicRegistration(topic.title, this.userName, newRegistrationState).subscribe({
        next: (response) => {
          this.snackBar.open(`Inscripciones ${newRegistrationState ? 'abiertas' : 'cerradas'} exitosamente`, 'Cerrar', {
            duration: 3000
          });
          
          // Recargar la lista para reflejar los cambios
          this.loadThesisTopics();
        },
        error: (error) => {
          console.error('Error al cambiar el estado de inscripción:', error);
          this.snackBar.open('Error al cambiar el estado de inscripción', 'Cerrar', {
            duration: 3000
          });
        }
      });
    }
  }

  // Mostrar detalles de una propuesta
  showProposalDetails(proposal: any): void {
    const details = `
Título: ${proposal.title}

Descripción: ${proposal.description}

Justificación: ${proposal.justification || 'No proporcionada'}

Propuesto por: ${proposal.studentName}

Estado: ${this.getStatusText(proposal.status)}

${proposal.preselectionComment ? `Comentario del profesor: ${proposal.preselectionComment}` : ''}
    `.trim();

    // Usar alert simple para mostrar los detalles
    // En una implementación más sofisticada, se podría usar un modal
    alert(details);
  }

  // Preseleccionar una propuesta
  preselectProposal(proposalId: string): void {
    const comment = prompt('Comentario para el estudiante (opcional):');
    
    this.thesisService.preselectProposal(proposalId, comment || undefined).subscribe({
      next: (response) => {
        this.snackBar.open('Propuesta preseleccionada exitosamente', 'Cerrar', {
          duration: 3000
        });
        this.loadProposedTopics();
      },
      error: (error) => {
        console.error('Error al preseleccionar propuesta:', error);
        this.snackBar.open('Error al preseleccionar propuesta', 'Cerrar', {
          duration: 3000
        });
      }
    });
  }

  // Aprobar una propuesta
  approveProposal(proposalId: string): void {
    if (confirm('¿Estás seguro de que quieres aprobar esta propuesta? Se creará un tema oficial.')) {
      this.thesisService.changeProposalStatus(proposalId, 'approved').subscribe({
        next: (response) => {
          this.snackBar.open('Propuesta aprobada exitosamente', 'Cerrar', {
            duration: 3000
          });
          this.loadThesisTopics();
          this.loadProposedTopics();
        },
        error: (error) => {
          console.error('Error al aprobar propuesta:', error);
          this.snackBar.open('Error al aprobar propuesta', 'Cerrar', {
            duration: 3000
          });
        }
      });
    }
  }

  // Rechazar una propuesta
  rejectProposal(proposalId: string): void {
    if (confirm('¿Estás seguro de que quieres rechazar esta propuesta?')) {
      this.thesisService.changeProposalStatus(proposalId, 'rejected').subscribe({
        next: (response) => {
          this.snackBar.open('Propuesta rechazada', 'Cerrar', {
            duration: 3000
          });
          this.loadProposedTopics();
        },
        error: (error) => {
          console.error('Error al rechazar propuesta:', error);
          this.snackBar.open('Error al rechazar propuesta', 'Cerrar', {
            duration: 3000
          });
        }
      });
    }
  }

  // Eliminar una propuesta
  deleteProposal(proposalId: string): void {
    if (confirm('¿Estás seguro de que quieres eliminar esta propuesta?')) {
      this.thesisService.deleteProposal(proposalId).subscribe({
        next: (response) => {
          this.snackBar.open('Propuesta eliminada exitosamente', 'Cerrar', {
            duration: 3000
          });
          this.loadProposedTopics();
        },
        error: (error) => {
          console.error('Error al eliminar propuesta:', error);
          this.snackBar.open('Error al eliminar propuesta', 'Cerrar', {
            duration: 3000
          });
        }
      });
    }
  }

  // Alternar estado de propuesta entre aprobada/rechazada
  toggleProposalStatus(proposalId: string, currentStatus: string): void {
    const newStatus = currentStatus === 'approved' ? 'rejected' : 'approved';
    const actionText = newStatus === 'approved' ? 'aprobar' : 'rechazar';
    
    if (confirm(`¿Estás seguro de que quieres ${actionText} esta propuesta?`)) {
      this.thesisService.changeProposalStatus(proposalId, newStatus).subscribe({
        next: (response) => {
          this.snackBar.open(`Propuesta ${newStatus === 'approved' ? 'aprobada' : 'rechazada'} exitosamente`, 'Cerrar', {
            duration: 3000
          });
          this.loadThesisTopics();
          this.loadProposedTopics();
        },
        error: (error) => {
          console.error('Error al cambiar estado de propuesta:', error);
          this.snackBar.open('Error al cambiar estado de propuesta', 'Cerrar', {
            duration: 3000
          });
        }
      });
    }
  }

  // Confirmar que el estudiante ha visto el estado de su propuesta
  confirmProposalViewed(proposalId: string): void {
    this.thesisService.confirmProposalViewed(proposalId, this.userName).subscribe({
      next: (response) => {
        this.snackBar.open('Confirmación registrada', 'Cerrar', {
          duration: 2000
        });
        this.loadProposedTopics();
      },
      error: (error) => {
        console.error('Error al confirmar visualización:', error);
        this.snackBar.open('Error al registrar confirmación', 'Cerrar', {
          duration: 3000
        });
      }
    });
  }
}