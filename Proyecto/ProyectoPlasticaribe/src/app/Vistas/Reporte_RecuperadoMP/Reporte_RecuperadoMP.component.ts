import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-Reporte_RecuperadoMP',
  templateUrl: './Reporte_RecuperadoMP.component.html',
  styleUrls: ['./Reporte_RecuperadoMP.component.css']
})
export class Reporte_RecuperadoMPComponent implements OnInit {

  public formReporteRMP !: FormGroup; /** Formulario de filtros */
  public ArrayMateriaPrima = []; /** Array que contendrá los datos de la consulta */

  constructor() { }

  ngOnInit() {
  }

}
