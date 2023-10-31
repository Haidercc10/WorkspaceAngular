import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import moment from 'moment';
import { Table } from 'primeng/table';
import { Certificados_CalidadService } from 'src/app/Servicios/Certificados_Calidad/Certificados_Calidad.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { AppComponent } from 'src/app/app.component';
import { CertificadoCalidadComponent } from '../Certificado-Calidad/Certificado-Calidad.component';
import { ShepherdService } from 'angular-shepherd';
import { defaultStepOptions, stepsMov_CertificadosCalidad as defaultSteps } from 'src/app/data';

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
  parametrosCualitativos : any = []; /** Array que contendrá la información de los parametros cualitativos */
  clientes : any = []; /** Array que contendrá la información de los clientes */
  items : any = []; /** Array que contendrá la información de los items */ 
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente

  constructor(private AppComponent : AppComponent, 
                private fBuilder : FormBuilder,
                  private srvCertificados : Certificados_CalidadService, 
                    private msjs : MensajesAplicacionService,
                      private Certificados : CertificadoCalidadComponent,
                        private shepherdService: ShepherdService) {

    this.modoSeleccionado = this.AppComponent.temaSeleccionado;

    this.FormFiltros = this.fBuilder.group({
      consecutivo : [null],
      fechaInicio : [null],
      fechaFin : [null],
      ot : [null],
      cliente : [null],
      item : [null],
      referencia : [null],
    });            
  }

  ngOnInit() {
    this.lecturaStorage();
    setInterval(() => this.modoSeleccionado = this.AppComponent.temaSeleccionado, 1000);
  }
  
  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  //Función que mostrará un tutorial del uso del módulo
  verTutorial() {
    this.shepherdService.defaultStepOptions = defaultStepOptions;
    this.shepherdService.modal = true;
    this.shepherdService.confirmCancel = false;
    this.shepherdService.addSteps(defaultSteps);
    this.shepherdService.start();
  }

  //Cargar la tabla según los filtros consultados
  aplicarfiltro = ($event, campo : any, valorCampo : string) => this.dt!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

  //Consultar los certificados de calidad con los diferentes filtros
  consultarCertificados(){
    this.load = true;
    this.certificados = [];
    let inicioMes = moment().subtract(1, 'M').format('YYYY-MM-DD');
    let consecutivo : any = this.FormFiltros.value.consecutivo
    let ot : any = this.FormFiltros.value.ot
    let cliente : any = this.FormFiltros.value.cliente
    let referencia : any = this.FormFiltros.value.item;
    let fechaInicio : any = moment(this.FormFiltros.value.fechaInicio).format('YYYY-MM-DD') == `Fecha inválida` ? inicioMes : moment(this.FormFiltros.value.fechaInicio).format('YYYY-MM-DD');
    let fechaFin : any = moment(this.FormFiltros.value.fechaFin).format('YYYY-MM-DD') == `Fecha inválida` ? this.today : moment(this.FormFiltros.value.fechaFin).format('YYYY-MM-DD');
    let ruta : any = ``;

    if(consecutivo != null) ruta += `consec=${consecutivo}`;
    if(ot != null) ruta.length > 0 ? ruta += `&ot=${ot}` : ruta += `ot=${ot}`;
    if(cliente != null) ruta.length > 0 ? ruta += `&cliente=${cliente}` : ruta += `cliente=${cliente}`;
    if(referencia != null) ruta.length > 0 ?  ruta += `&referencia=${referencia}` : ruta += `referencia=${referencia}`;
    if (ruta.length > 0) ruta = `?${ruta}`;

    this.srvCertificados.GetCertificados(fechaInicio, fechaFin, ruta).subscribe(data => data.forEach((info) => this.cargarTablas(info)), (error) => {
      this.load = false;
      this.msjs.mensajeAdvertencia(`Advertencia`, `${error.error}`);
    }, () => this.load = false);
  }

  //Cargar las tablas del reporte
  cargarTablas(data : any){
    let info : any = {
      Consecutivo : data.consecutivo,
      Fecha : data.fecha_Registro.replace('T00:00:00', ''),
      Cliente : data.cliente,
      Referencia : data.referencia,
      Ot : data.orden_Trabajo,
      Cantidad : data.cantidad_Producir,
      Presentacion : data.presentacion_Producto,
      Parametros : [],
      Parametros2 : []
    }
    this.certificados.push(info);
    
    this.srvCertificados.GetParametrosCuantitativos(data.consecutivo).subscribe(datos => {
      for (let i = 0; i < this.parametros2(data).length; i++) {
        let indice = this.certificados.findIndex(x => x.Consecutivo == this.parametros2(data)[i].consecutivo);
        this.certificados[indice].Parametros2.push(this.parametros2(data)[i]);
        for (let j = 0; j < datos.length; j++) {
          let indice = this.certificados.findIndex(x => x.Consecutivo == datos[j].consecutivo);
          this.certificados[indice].Parametros.push(datos[j]);
        }
      }
    });
  }

  // Función que cargará y retornará los parametros cualitativos del reporte
  parametros2(data : any) {
    let parametrosCualitativos  : any = {
      consecutivo : data.consecutivo,
      material : data.material,
      resistencia : data.resistencia,
      sellabilidad : data.sellabilidad,
      transparencia : data.transparencia,
      tratado : data.tratado,
      impresion : data.impresion, 
    };
    return [parametrosCualitativos];
  }

  //.Limpiar los campos del formulario de filtros
  limpiarCampos = () => this.FormFiltros.reset();
  
  //.Cargar los nombres de los clientes en el datalist para luego ser seleccionado
  cargarClientes = () => this.srvCertificados.GetClientes(this.FormFiltros.value.cliente).subscribe(data => this.clientes = data);

  //.Cargar los productos en el array de items
  cargarItems = () => this.srvCertificados.GetItems(this.FormFiltros.value.referencia).subscribe(data => this.items = data);

  //.Intercambiar el id del item por el nombre de la referencia
  seleccionarItems(){
    let itemSeleccionado : any = this.FormFiltros.value.referencia;
    let nuevo : any[] = this.items.filter((itm) => itm.item == itemSeleccionado);
    this.FormFiltros.patchValue({ 
      item : nuevo[0].item, 
      referencia : nuevo[0].referencia,
    });
  }

  // Mostrar formato pdf de los certificados de calidad
  mostrarPdf (consecutivo : number) {
    this.load = true;
    this.Certificados.crearPdfCertificado(consecutivo);
    setTimeout(() => this.load = false, 3000);
  }
}
