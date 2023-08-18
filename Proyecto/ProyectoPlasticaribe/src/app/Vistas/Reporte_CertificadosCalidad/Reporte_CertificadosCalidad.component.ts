import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import moment from 'moment';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { Certificados_CalidadService } from 'src/app/Servicios/Certificados_Calidad/Certificados_Calidad.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-Reporte_CertificadosCalidad',
  templateUrl: './Reporte_CertificadosCalidad.component.html',
  styleUrls: ['./Reporte_CertificadosCalidad.component.css']
})
export class Reporte_CertificadosCalidadComponent implements OnInit {
  load : boolean = false;
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  certificados : any = []; /** Array que contendrá la información de los certificados */
  @ViewChild('dt') dt: Table | undefined; /** Tabla que contendrá la información de los certificados */
  FormFiltros !: FormGroup; /** Formulario que contendrá los filtros de búsqueda */
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  parametrosCualitativos : any = ['Calibre', 'Ancho frente', 'Ancho fuelle', 'Largo/Repetición', 'COF']; /** Array que contendrá la información de los parametros cualitativos */

  constructor(private AppComponent : AppComponent, 
                private fBuilder : FormBuilder,
                  private srvCertificados : Certificados_CalidadService, 
                    private msjs : MensajesAplicacionService) {
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
    this.consultarCertificados();
  }

  tutorial(){}

  aplicarfiltro($event, campo : any, valorCampo : string){
    this.dt!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);
  }

  consultarCertificados(){
    this.load = true;
    this.certificados = [];
    let consecutivo : any = this.FormFiltros.value.consecutivo
    let ot : any = this.FormFiltros.value.ot
    let cliente : any = this.FormFiltros.value.cliente
    let referencia : any = this.FormFiltros.value.referencia;
    let fechaInicio : any = this.FormFiltros.value.fechaInicio;
    let fechaFin : any = this.FormFiltros.value.fechaFin;
    let ruta : any = ``;
    
    if(fechaInicio == `Fecha inválida`) fechaInicio = null;
    if(fechaFin == `Fecha inválida`) fechaFin = null;

    fechaInicio == null ? fechaInicio = `2023-08-18` : fechaInicio = moment(fechaInicio).format('YYYY-MM-DD');
    fechaFin == null ? fechaFin = this.today : fechaFin = moment(fechaFin).format('YYYY-MM-DD');

    if(consecutivo != null) ruta += `consec=${consecutivo}`;
    if(ot != null) ruta.length > 0 ? ruta += `&ot=${ot}` : `ot=${ot}`;
    if(cliente != null) ruta.length > 0 ? ruta += `&cliente=${cliente}` : `cliente=${cliente}`;
    if(referencia != null) ruta.length > 0 ?  ruta += `&referencia=${referencia}` : `referencia=${referencia}`;

    this.srvCertificados.GetCertificados(fechaInicio, fechaFin, ruta).subscribe(data => {
      if(data.length > 0) {
        for (let index = 0; index < data.length; index++) {
          this.cargarTabla(data[index]);
        }
      } else this.msjs.mensajeAdvertencia(`Advertencia`, `No se encontraron registros con los filtros consultados`);
    });
    setTimeout(() => { this.load = false; }, 1500);
  }

  cargarTabla(data : any){
    let info : any = {
      Consecutivo : data.consecutivo,
      Fecha : data.fecha_Registro.replace('T00:00:00', ''),
      Cliente : data.cliente,
      Referencia : data.referencia,
      Ot : data.orden_Trabajo,
      Parametros : []
    }
    this.certificados.push(info);
    
    let infoParametros : any = [
      {
        consecutivo : data.consecutivo,
        parametro : `Calibre`,
        unidad : data.unidad_Calibre,
        nominal : data.nominal_Calibre,
        tolerancia : data.tolerancia_Calibre,
        minimo : data.minimo_Calibre, 
        maximo : data.maximo_Calibre,
      },
      {
        consecutivo : data.consecutivo,
        parametro : `Ancho Frente`,
        unidad : data.unidad_AnchoFrente,
        nominal : data.nominal_AnchoFrente,
        tolerancia : data.tolerancia_AnchoFrente,
        minimo : data.minimo_AnchoFrente, 
        maximo : data.maximo_AnchoFrente,
      },
      {
        consecutivo : data.consecutivo,
        parametro : `Ancho Fuelle`,
        unidad : data.unidad_AnchoFuelle,
        nominal : data.nominal_AnchoFuelle,
        tolerancia : data.tolerancia_AnchoFuelle,
        minimo : data.minimo_AnchoFuelle, 
        maximo : data.maximo_AnchoFuelle,
      },
      {
        consecutivo : data.consecutivo,
        parametro : `Largo Repetición`,
        unidad : data.unidad_LargoRepeticion,
        nominal : data.nominal_LargoRepeticion,
        tolerancia : data.tolerancia_LargoRepeticion,
        minimo : data.minimo_LargoRepeticion, 
        maximo : data.maximo_LargoRepeticion,
      },
      {
        consecutivo : data.consecutivo,
        parametro : `COF`,
        unidad : data.unidad_Cof,
        nominal : data.nominal_Cof,
        tolerancia : data.tolerancia_Cof,
        minimo : data.minimo_Cof, 
        maximo : data.maximo_Cof,
      },
      {
        consecutivo : data.consecutivo,
        material : data.material,
        resistencia : data.resistencia,
        sellabilidad : data.sellabilidad,
        transparencia : data.transparencia,
        tratado : data.tratado,
        impresion : data.impresion, 
      }
    ]

    for (let index = 0; index < infoParametros.length; index++) {
      let indice = this.certificados.findIndex(x => x.Consecutivo == infoParametros[index].consecutivo && x.Consecutivo);
      this.certificados[indice].Parametros.push(infoParametros[index]);
      console.log(this.certificados);
    }
  }

  limpiarCampos = () => this.FormFiltros.reset();
  
}
