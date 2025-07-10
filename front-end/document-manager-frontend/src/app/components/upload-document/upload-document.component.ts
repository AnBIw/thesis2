import { Component, EventEmitter, Output } from '@angular/core'; import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DocumentService } from '../../services/document.service';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-upload-document',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIcon
  ],
  templateUrl: './upload-document.component.html',
  styleUrls: ['./upload-document.component.css'],

})

export class UploadDocumentComponent {
  file: File | null = null;
  title: string = '';
  authors: string = '';
  age: string = '';
  status: string = '';
  description: string = '';
  isMinimized = true; // Comienza minimizado

  @Output() documentUploaded = new EventEmitter<void>();

  constructor(private documentService: DocumentService) { }

  onFileChange(event: any): void {
    //carga el archivo seleccionado
    this.file = event.target.files[0];
  }
  //cambia el estado de minimizado
  toggleMinimize() {
    this.isMinimized = !this.isMinimized;
  }

  uploadDocument(): void {
    if (this.file) {
      this.documentService.uploadDocument(
        this.file,
        this.title,
        this.authors,
        this.age,
        this.status,
        this.description
      ).subscribe({
        next: (response) => {
          alert('Document uploaded successfully');
          this.documentUploaded.emit();
        },
        error: (error) => {
          console.error('Error uploading document', error);
          alert('Error uploading document');
        },
      });
    }
  }
}