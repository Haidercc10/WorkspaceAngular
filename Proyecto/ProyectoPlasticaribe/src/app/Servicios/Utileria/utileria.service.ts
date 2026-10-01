import { Injectable } from '@angular/core';
import { MensajesAplicacionService } from '../MensajesAplicacion/MensajesAplicacion.service';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UtileriaService {

  constructor(private msj: MensajesAplicacionService) { }

  // Funcion que colocará la puntuacion a los numeros que se le pasen a la funcion
  formatoNumeros = (number: any) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

  formatearFechaYYYYMMDD(fecha: string | Date): string {
    if (!fecha) {return '';}
    const date = new Date(fecha);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  Notificacion(mensaje1: string, mensaje2: string, tiempo?: number, responseError?: HttpErrorResponse) {
    let titulo: string = mensaje1 ? mensaje1.charAt(0).toUpperCase() + mensaje1.slice(1) : ``; // titulo capitalizado de esta forma ya que siempre vendrá una sola palabra.
    switch (mensaje1.toUpperCase()) {
      case 'CONFIRMACIÓN':
        return this.msj.mensajeConfirmacion(titulo, mensaje2, tiempo);
      case 'CONFIRMACION':
        return this.msj.mensajeConfirmacion(titulo, mensaje2, tiempo);
      case 'ADVERTENCIA':
        return this.msj.mensajeAdvertencia(titulo, mensaje2, tiempo);
      case 'ERROR':
        return this.msj.mensajeError(titulo, mensaje2, tiempo);
      case 'ERRORHTTP':
        const errorhttp : any = responseError;
        return this.msj.errorHttp(mensaje2, errorhttp);
      default:
        return this.msj.mensajeInformacion(`Información`, mensaje2, tiempo);
    }
  }
}
