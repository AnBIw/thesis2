import { Component } from '@angular/core';
import { DocumentListComponent } from '../document-list/document-list.component';
import { TopicListComponent } from '../topic-list/topic-list.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-student-panel',
    imports: [
      DocumentListComponent,    // Importa el subcomponente de la lista
      TopicListComponent,
      CommonModule,
      FormsModule,
      MatCardModule,
      MatButtonModule,
      MatInputModule,
      MatFormFieldModule,
    ],
  templateUrl: './student-panel.component.html',
  styleUrl: './student-panel.component.css'
})
export class StudentPanelComponent {
  StudentName: string = localStorage.getItem('name') || ''; // O el nombre real del estudiante
}
