import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroXRollo_RptDespacho'
})
export class FiltroXRollo_RptDespachoPipe implements PipeTransform {

  transform(value: any, arg: any): any {
    /** Si la cantidad de letras insertadas en el campo es menor que 3 muestra toda la tabla. */
    if(arg == '' || arg.length < 1) return value;

    const resultadoBusqFacturas = []; /** Array que mostrará el resultado de lo consultado. */

    /** Recorre la variable (item) creada en el ngFor que carga la tabla en el HTML */
    for(const item of value) {

      /** Si la columna nombre de la tabla está en lo digitado del campo, muestra las filas asociadas.  */
      if(item.Rollo.toString().indexOf(arg.toString()) > -1) {
        resultadoBusqFacturas.push(item);
      }
    }

    return resultadoBusqFacturas;
  }
}