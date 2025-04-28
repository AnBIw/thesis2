import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DocumentService } from '../../services/document.service';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
//import para el buscador
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-document-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.css'],
})
export class DocumentListComponent implements OnInit {
  documents: any[] = []; // Lista completa de documentos
  filteredDocuments: any[] = []; // Lista filtrada de documentos
  searchControl = new FormControl(''); // Control del campo de búsqueda


  constructor(private documentService: DocumentService) {}

  ngOnInit(): void {
    this.loadDocuments();

    // Escuchar cambios en el campo de búsqueda
    this.searchControl.valueChanges
    .pipe(
      debounceTime(300), // Esperar 300ms después de cada tecla
      distinctUntilChanged() // Ignorar si el valor no cambia
    )
    .subscribe((searchTerm) => {
      this.filterDocuments(searchTerm || '');
    });
}

  loadDocuments(): void {
    this.documentService.getDocuments().subscribe({
      next: (response) => {
        this.documents = response;
        this.filteredDocuments = response; // Mostrar todos los documentos al inicio
      },
      error: (error) => {
        console.error('Error loading documents', error);
      },
    });
  }

  onDocumentUploaded(): void {
    this.loadDocuments(); // Recargar la lista de documentos
  }

  previewDocument(id: string): void {
    this.documentService.previewDocument(id).subscribe({
      next: (blob) => {
        const fileURL = URL.createObjectURL(blob);
        window.open(fileURL, '_blank');
      },
      error: (error) => {
        console.error('Error previewing document', error);
        alert('Error previewing document');
      },
    });
  }

  downloadDocument(id: string, filename: string): void {
    this.documentService.downloadDocument(id).subscribe({
      next: (blob) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
      },
      error: (error) => {
        console.error('Error downloading document', error);
      },
    });
  }

  deleteDocument(id: string): void {
    this.documentService.deleteDocument(id).subscribe({
      next: () => {
        this.loadDocuments();
        alert('Document deleted successfully');
      },
      error: (error) => {
        console.error('Error deleting document', error);
      },
    });
  }
  // Funcion del buscador
  filterDocuments(searchTerm: string): void {
    if (!searchTerm) {
      this.filteredDocuments = this.documents; // Si no hay término de búsqueda, mostrar todos los documentos
      return;
    }
    // Filtrar documentos por coincidencia en el nombre del archivo
    this.filteredDocuments = this.documents.filter((document) =>
      document.filename.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  
}