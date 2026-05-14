import { Injectable } from '@angular/core';
import { MensajesAplicacionService } from '../MensajesAplicacion/MensajesAplicacion.service';

@Injectable({
  providedIn: 'root'
})
export class ImpresionEtiquetasService {
  private initialized = false;

  constructor(
    private svcMsjs: MensajesAplicacionService
  ) { }


  listenPrintResult() {
    if (this.initialized) return;
    this.initialized = true;

    window.electron.receive('print-result', (res) => {

      if (res.success) {
        console.log('✅ Impresión OK');
        return;
      }

      console.error('❌ Error impresión:', res.error);

      // 🔁 Reintento automático (1 vez)
      if (res.data && !res.data.retry) {
        res.data.retry = true;

        setTimeout(() => {
          console.log('🔁 Reintentando impresión...');
          window.electron.send('print-pdf', res.data);
        }, 1000);

        return;
      }

      // ❌ Falló definitivamente
      this.svcMsjs.mensajeError(
        'Error de impresión',
        `No se pudo imprimir la etiqueta ${res.data?.nameTag || ''}`
      );
    });
  }
}
