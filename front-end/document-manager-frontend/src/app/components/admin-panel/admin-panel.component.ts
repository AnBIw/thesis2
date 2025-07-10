import { Component } from '@angular/core';
import { DocumentListComponent } from '../document-list/document-list.component';
import { UploadDocumentComponent } from '../upload-document/upload-document.component';
import { TopicListComponent } from '../topic-list/topic-list.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [
    DocumentListComponent,
    UploadDocumentComponent,
    TopicListComponent,
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatOptionModule,
    MatSelectModule,
    FormsModule,
    MatTabsModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './admin-panel.component.html',
  styleUrl: './admin-panel.component.css'
})
export class AdminPanelComponent {
  newUser: {
    email: string;
    name: string;
    password: string;
    role: string;
    specialty?: string; // Solo se usará si el rol es 'professor'
  } = {
      email: '',
      name: '',
      password: '',
      role: '',
      specialty: ''
    };

  constructor(private http: HttpClient, private snackBar: MatSnackBar) { }

  createUser() {
    // Si no es profesor, no enviar specialty
    const userToSend = { ...this.newUser };
    if (userToSend.role !== 'professor') {
      delete userToSend.specialty;
    }

    this.http.post('http://localhost:3000/auth/register', userToSend).subscribe({
      next: (res: any) => {
        this.snackBar.open('Usuario creado exitosamente', 'Cerrar', { duration: 3000 });
        this.newUser = { email: '', name: '', password: '', role: '', specialty: '' };
      },
      error: (err) => {
        this.snackBar.open('Error al crear usuario', 'Cerrar', { duration: 3000 });
      }
    });
  }

  // Validar si el formulario es válido
  isFormValid(): boolean {
    const { name, email, password, role, specialty } = this.newUser;

    // Validaciones básicas
    if (!name?.trim() || !email?.trim() || !password?.trim() || !role?.trim()) {
      return false;
    }

    // Validar email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return false;
    }

    // Validar contraseña mínima
    if (password.length < 8) {
      return false;
    }

    // Si es profesor, validar que tenga especialidades
    if (role === 'professor' && !specialty?.trim()) {
      return false;
    }

    return true;
  }

  toggleMinimize() {
    this.isMinimized = !this.isMinimized;
  }
  isMinimized = false;
}
