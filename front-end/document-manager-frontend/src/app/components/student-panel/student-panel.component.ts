import { Component } from '@angular/core';
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
    ],
  templateUrl: './student-panel.component.html',
  styleUrl: './student-panel.component.css'
})
export class StudentPanelComponent {
  StudentName: string = localStorage.getItem('name') || ''; // O el nombre real del estudiante
  showProposeForm: boolean = false;

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
}
