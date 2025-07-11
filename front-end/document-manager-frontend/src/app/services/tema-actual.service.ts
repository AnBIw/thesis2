import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { TesisActual } from '../models/thesis-topic.model';

@Injectable({
  providedIn: 'root'
})
export class TemaActualService {
  private temaActualizadoSubject = new Subject<TesisActual | null>();
  
  // Observable que otros componentes pueden suscribirse
  temaActualizado$ = this.temaActualizadoSubject.asObservable();

  // Método para notificar que el tema actual ha sido actualizado
  notificarTemaActualizado(tesisActual: TesisActual | null): void {
    this.temaActualizadoSubject.next(tesisActual);
  }

  // Método para notificar que el tema actual ha sido limpiado
  notificarTemaLimpiado(): void {
    this.temaActualizadoSubject.next(null);
  }
}
