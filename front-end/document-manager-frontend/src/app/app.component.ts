import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet], // RouterOutlet es clave
  template: `
    <!-- Solo el router-outlet, nada más -->
    <router-outlet></router-outlet>
  `,
  styles: []
})
export class AppComponent {}