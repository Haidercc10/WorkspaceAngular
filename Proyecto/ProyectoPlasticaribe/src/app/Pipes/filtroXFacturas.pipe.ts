import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroXFacturas'
})
export class FiltroXFacturasPipe implements PipeTransform {

  transform(value: any, arg: any): any {
    /** Si la cantidad de letras insertadas en el campo es menor que 3 muestra toda la tabla. */
    if(arg == '' || arg.length < 1) return value;
    /** Array que mostrará el resultado de lo consultado. */
    const resultadoBusqFacturas = [];

    /** Recorre la variable (item) creada en el ngFor que carga la tabla
    en el HTML */
    for(const item of value) {
      /** Si la columna nombre de la tabla está en lo digitado del campo, muestra las filas asociadas.  */
      if(item.Codigo.toUpperCase().indexOf(arg.toUpperCase()) > -1) {
        resultadoBusqFacturas.push(item);
      }
    }

    return resultadoBusqFacturas;
  }

  }


