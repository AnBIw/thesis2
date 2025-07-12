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
import { MatTable, MatTableModule } from '@angular/material/table';

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
    MatTableModule
  ],
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.css'],
})
export class DocumentListComponent implements OnInit {
  documents: any[] = []; // Lista completa de documentos
  filteredDocuments: any[] = []; // Lista filtrada de documentos
  searchControl = new FormControl(''); // Control del campo de búsqueda
  userRole: string = ""

  constructor(private documentService: DocumentService) { }

  ngOnInit(): void {
    this.loadDocuments();
    this.userRole = localStorage.getItem('userRole') || ''; 
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

  confirmDelete(id: string): void {
    if (window.confirm('¿Estás seguro de que deseas eliminar este documento?')) {
      this.deleteDocument(id);
    }
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
    // Si es un rango de años, mantenlo igual
    if (searchTerm.match(/^\d{4}\s*-\s*\d{4}$/)) {
      const [start, end] = searchTerm.split('-').map(y => Number(y.trim()));
      this.filteredDocuments = this.documents.filter((document) => {
        const docYear = Number(document.age);
        return docYear >= start && docYear <= end;
      });
      this.applySort();
      return;
    }
    // Búsqueda por palabras clave
    const keywords = searchTerm.toLowerCase().split(' ').filter(k => k.trim() !== '');
    this.filteredDocuments = this.documents.filter((document) => {
      // Junta todos los campos relevantes en un solo string
      const docText = [
        document.title,
        document.authors,
        document.age,
        document.status,
        document.description
      ].join(' ').toLowerCase();

      // Verifica que TODAS las palabras clave estén presentes
      return keywords.every(keyword => docText.includes(keyword));
    });

    this.applySort();
  }
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  sortBy(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applySort();
  }

  applySort() {
    this.filteredDocuments = [...this.filteredDocuments].sort((a, b) => {
      let valA = a[this.sortColumn];
      let valB = b[this.sortColumn];

      if (this.sortColumn === 'age') {
        const isEmptyA = !valA || isNaN(Number(valA));
        const isEmptyB = !valB || isNaN(Number(valB));
        if (isEmptyA && isEmptyB) return 0;
        if (isEmptyA) return 1;
        if (isEmptyB) return -1;
        valA = Number(valA);
        valB = Number(valB);
      } else {
        // Normaliza para ignorar tildes y mayúsculas/minúsculas
        valA = valA?.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') || '';
        valB = valB?.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') || '';
      }
      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

}