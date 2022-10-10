import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'FiltroXClientes_OTVendedores'
})
export class FiltroXClientes_OTVendedoresPipe implements PipeTransform {

  transform(value: any, arg: any): any {
    if(arg == '' || arg.length < 1) return value;

    const resultadoBusqFacturas = []; /** Array que mostrará el resultado de lo consultado. */

    /** Recorre la variable (item) creada en el ngFor que carga la tabla en el HTML */
    for(const tabla of value) {

      /** Si la columna nombre de la tabla está en lo digitado del campo, muestra las filas asociadas.  */
      if(tabla.cliente.toUpperCase().indexOf(arg.toUpperCase()) > -1) {
        resultadoBusqFacturas.push(tabla);
      }
    }

    return resultadoBusqFacturas;
  }


































}
