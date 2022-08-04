import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroNombreClientePT'
})
export class FiltroNombreClientePTPipe implements PipeTransform {

  transform(value: any, arg: any): any {
    /** Si la cantidad de letras insertadas en el campo es menor que 3 muestra toda la tabla. */
    if(arg == '' || arg.length < 3) return value;
    /** Array que mostrará el resultado de lo consultado. */
    const resultadoBusqNombres = [];

    /** Recorre la variable (prodZeus) creada en el ngFor que carga la tabla
    en el HTML modal-generar-inventario-zeus*/
    for(const prodZeus of value) {
      /** Si la columna nombre de la tabla está en lo digitado del campo, muestra las filas asociadas.  */
      if(prodZeus.ClienteNombre.toUpperCase().indexOf(arg.toUpperCase()) > -1) {
        resultadoBusqNombres.push(prodZeus);
      }
    }

    return resultadoBusqNombres;
  }
}
