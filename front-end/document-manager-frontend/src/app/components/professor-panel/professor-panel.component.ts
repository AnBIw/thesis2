import { Component } from '@angular/core';
import { AddTopicFormComponent } from '../add-topic-form/add-topic-form.component';
import { DocumentListComponent } from '../document-list/document-list.component';
import { UploadDocumentComponent } from '../upload-document/upload-document.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TopicListComponent } from '../topic-list/topic-list.component';
@Component({
  selector: 'app-professor-panel',
  standalone: true,
  imports: [
    AddTopicFormComponent, // Importa el subcomponente del formulario
    DocumentListComponent,    // Importa el subcomponente de la lista
    UploadDocumentComponent, // Importa el subcomponente de carga de documentos
    TopicListComponent,
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
  ],
  templateUrl: './professor-panel.component.html',
  styleUrls: ['./professor-panel.component.css'],
})
export class ProfessorPanelComponent {}