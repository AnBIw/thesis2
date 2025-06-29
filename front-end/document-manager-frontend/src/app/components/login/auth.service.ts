// src/app/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/auth/login';  // Ajusta la URL de tu backend

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string, name: string) {
    return this.http.post<any>(this.apiUrl, { email, password, name }).subscribe({
      next: (response) => {
        localStorage.setItem('userRole', response.user.role);  // Guarda el rol
        localStorage.setItem('name', response.user.name); // Guarda el nombre del profesor
        localStorage.setItem('email', response.user.email); // Guarda el email en localStorage
        this.redirectBasedOnRole(response.user.role);
      },
      error: (error) => {
        alert('Credenciales incorrectas');
      }
    });
  }
  logingest(){
    localStorage.setItem('userRole', 'guest');  // Guarda el rol de invitado
    localStorage.setItem('name', 'Guest'); // Guarda el nombre de invitado
    this.router.navigate(['/guest']);
  }

  private redirectBasedOnRole(role: string) {
    if (role === 'students') {
      this.router.navigate(['/student']);
    } else if (role === 'professor') {
      this.router.navigate(['/professor']);
    }
    else if (role === 'admin') {
      this.router.navigate(['/admin']);
  }
}

  logout() {
    localStorage.removeItem('userRole');
    this.router.navigate(['/login']);
  }
}