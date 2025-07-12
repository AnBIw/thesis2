import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { TesisActual } from '../models/thesis-topic.model';

@Injectable({
  providedIn: 'root'
})
export class TemaActualService {
  private temaActualizadoSubject = new Subject<TesisActual | null>();
  private propuestasActualizadasSubject = new Subject<void>();
  
  // Observable que otros componentes pueden suscribirse
  temaActualizado$ = this.temaActualizadoSubject.asObservable();
  propuestasActualizadas$ = this.propuestasActualizadasSubject.asObservable();

  // Método para notificar que el tema actual ha sido actualizado
  notificarTemaActualizado(tesisActual: TesisActual | null): void {
    this.temaActualizadoSubject.next(tesisActual);
  }

  // Método para notificar que el tema actual ha sido limpiado
  notificarTemaLimpiado(): void {
    this.temaActualizadoSubject.next(null);
  }

  // Método para notificar que las propuestas han sido actualizadas
  notificarPropuestasActualizadas(): void {
    this.propuestasActualizadasSubject.next();
  }
}
