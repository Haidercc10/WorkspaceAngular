import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroXProducto_RptDespacho'
})
export class FiltroXProducto_RptDespachoPipe implements PipeTransform {

  transform(value: any, arg: any): any {
    /** Si la cantidad de letras insertadas en el campo es menor que 3 muestra toda la tabla. */
    if(arg == '' || arg.length < 3) return value;
    /** Array que mostrará el resultado de lo consultado. */
    const resultadoBusqNombres = [];

    /** Recorre la variable (prodZeus) creada en el ngFor que carga la tabla en el HTML modal-generar-inventario-zeus*/
    for(const item of value) {

      /** Si la columna nombre de la tabla está en lo digitado del campo, muestra las filas asociadas.  */
      if(item.Producto.toUpperCase().indexOf(arg.toUpperCase()) > -1) {
        resultadoBusqNombres.push(item);
      }
    }

    return resultadoBusqNombres;
  }

}
