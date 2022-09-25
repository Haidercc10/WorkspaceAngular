import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'BuscarInventarioXProducto'
})
export class BuscarInventarioXProductoPipe implements PipeTransform {

  transform(value: any, arg: any): any {
    /** Si la cantidad de letras insertadas en el campo es menor que 3 muestra toda la tabla. */
    if(arg == '' || arg.length < 2) return value;
    /** Array que mostrará el resultado de lo consultado. */
    const resultadoBusqProdNombres = [];

    /** Recorre la variable (prodZeus) creada en el ngFor que carga la tabla
    en el HTML */
    for(const prodBDNueva of value) {
      /** Si la columna nombre de la tabla está en lo digitado del campo, muestra las filas asociadas.  */
      if(prodBDNueva.NombreItem.toUpperCase().indexOf(arg.toUpperCase()) > -1) {
        resultadoBusqProdNombres.push(prodBDNueva);
      }
    }

    return resultadoBusqProdNombres;
  }
}
