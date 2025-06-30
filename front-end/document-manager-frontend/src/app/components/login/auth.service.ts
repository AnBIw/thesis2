// src/app/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/auth/login';

  constructor(private http: HttpClient, private router: Router) { }

  login(email: string, password: string, name: string) {
    return this.http.post<any>(this.apiUrl, { email, password, name }).subscribe({
      next: (response) => {
        localStorage.setItem('userRole', response.user.role);  
        localStorage.setItem('name', response.user.name); 
        localStorage.setItem('email', response.user.email); 
        this.redirectBasedOnRole(response.user.role);
      },
      error: (error) => {
        alert('Credenciales incorrectas');
      }
    });
  }
  logingest() {
    localStorage.setItem('userRole', 'guest');  
    localStorage.setItem('name', 'Guest');
    this.router.navigate(['/guest']);
  }

  private redirectBasedOnRole(role: string) {
    if (role === 'students') {
      this.router.navigate(['/student']);
    } 
    else if (role === 'professor') {
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