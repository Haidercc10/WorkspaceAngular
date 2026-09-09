import { Injectable } from '@angular/core';
import { MensajesAplicacionService } from '../MensajesAplicacion/MensajesAplicacion.service';

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

  Notificacion(mensaje1: string, mensaje2: string) {
    switch (mensaje1) {
      case 'Confirmación':
        return this.msj.mensajeConfirmacion(mensaje1, mensaje2);
      case 'Advertencia':
        return this.msj.mensajeAdvertencia(mensaje1, mensaje2);
      case 'Error':
        return this.msj.mensajeError(mensaje1, mensaje2);
      default:
        return this.msj.mensajeAdvertencia(`No hay un tipo de mensaje asociado!`);
    }
  }
}
