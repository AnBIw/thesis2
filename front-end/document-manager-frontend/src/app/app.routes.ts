import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { ProfessorPanelComponent } from './components/professor-panel/professor-panel.component';
import { AlumnoGuard } from './guards/alumno.guard';
import { ProfesorGuard } from './guards/professor.guard';
import { StudentPanelComponent } from './components/student-panel/student-panel.component';
import { GuestsPanelComponent } from './components/guests-panel/guests-panel.component';
import { AdminPanelComponent } from './components/admin-panel/admin-panel.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { 
      path: 'professor', 
      component: ProfessorPanelComponent,
      canActivate: [ProfesorGuard]  // Solo accesible si está autenticado como profesor
    },
    {
      path: 'student',
      component: StudentPanelComponent,
      canActivate: [AlumnoGuard]  // Solo accesible si está autenticado como alumno
    },
    {
      path: 'guest',
      component: GuestsPanelComponent // Nueva ruta para invitados
    },
        {
      path: 'admin',
      component: AdminPanelComponent,
    },
    { path: '', redirectTo: '/login', pathMatch: 'full' },  // Ruta por defecto -> login
    { path: '**', redirectTo: '/login' }  // Ruta desconocida -> login
  ];