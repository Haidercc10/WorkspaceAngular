import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Table } from 'primeng/table';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-Reporte_CertificadosCalidad',
  templateUrl: './Reporte_CertificadosCalidad.component.html',
  styleUrls: ['./Reporte_CertificadosCalidad.component.css']
})
export class Reporte_CertificadosCalidadComponent implements OnInit {
  load : boolean = true;
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  certificados : any = []; /** Array que contendrá la información de los certificados */
  @ViewChild('dt') dt: Table | undefined; /** Tabla que contendrá la información de los certificados */
  FormFiltros !: FormGroup; /** Formulario que contendrá los filtros de búsqueda */

  constructor(private AppComponent : AppComponent, 
              private fBuilder : FormBuilder) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;

    this.FormFiltros = this.fBuilder.group({
      consecutivo : [null],
      fechaInicio : [null],
      fechaFin : [null],
      ot : [null],
      cliente : [null],
      referencia : [null],
    });            
  }

  ngOnInit() {
  }

  tutorial(){}

  aplicarfiltro($event, campo : any, valorCampo : string){
    this.dt!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);
  }

  consultarCertificados(){
    let consecutivo : any = this.FormFiltros.value.consecutivo
    let ot : any = this.FormFiltros.value.ot
    let cliente : any = this.FormFiltros.value.cliente
    let referencia : any = this.FormFiltros.value.referencia;
    let fechaInicio : any = this.FormFiltros.value.fechaInicio;
    let fechaFin : any = this.FormFiltros.value.fechaFin;
    
  }

  cargarTabla(){
    
  }

  limpiarCampos(){}
  
}
