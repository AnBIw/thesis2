import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { importProvidersFrom } from '@angular/core';
import { MatNativeDateModule } from '@angular/material/core';


bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(), // Para usar HttpClient
    provideAnimations(), // Para animaciones
    importProvidersFrom(MatNativeDateModule), // Para Angular Material
  ],
});