// src/app/auth/login/login.component.ts
import { Component } from '@angular/core';
import { AuthService } from '../login/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  respuesta: string = '';
  name: string = '';
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    this.authService.login(this.email, this.password, this.name);
    // Optional: Add response handling
    this.respuesta = 'Login en proceso...';
  }

}
