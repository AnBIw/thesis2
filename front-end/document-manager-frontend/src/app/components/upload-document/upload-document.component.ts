import { Component, EventEmitter, Output } from '@angular/core';import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DocumentService } from '../../services/document.service';

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
  ],
  templateUrl: './upload-document.component.html',
  styleUrls: ['./upload-document.component.css'],

})

export class UploadDocumentComponent {
  file: File | null = null;
  description: string = '';

  @Output() documentUploaded = new EventEmitter<void>(); // Emitir evento después de subir un documento

  constructor(private documentService: DocumentService) {}

  onFileChange(event: any): void {
    this.file = event.target.files[0];
  }

  uploadDocument(): void {
    if (this.file) {
      this.documentService.uploadDocument(this.file, this.description).subscribe({
        next: (response) => {
          console.log('Document uploaded successfully', response);
          alert('Document uploaded successfully');
          this.documentUploaded.emit(); // Emitir evento para recargar la lista
        },
        error: (error) => {
          console.error('Error uploading document', error);
          alert('Error uploading document');
        },
      });
    }
  }
}