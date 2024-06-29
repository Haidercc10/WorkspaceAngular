import { Component, Injectable, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShepherdService } from 'angular-shepherd';
import moment from 'moment';
import pdfMake from 'pdfmake/build/pdfmake';
import { Table } from 'primeng/table';
import { modelBodegasRollos } from 'src/app/Modelo/modelBodegasRollos';
import { modelDtBodegasRollos } from 'src/app/Modelo/modelDtBodegasRollos';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { Bodegas_RollosService } from 'src/app/Servicios/Bodegas_Rollos/Bodegas_Rollos.service';
import { CreacionPdfService } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';
import { Detalle_BodegaRollosService } from 'src/app/Servicios/Detalle_BodegaRollos/Detalle_BodegaRollos.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { ProcesosService } from 'src/app/Servicios/Procesos/procesos.service';
import { AppComponent } from 'src/app/app.component';
import { defaultStepOptions, stepsBodegas as defaultSteps } from 'src/app/data';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-Ingreso_Rollos_Extrusion',
  templateUrl: './Ingreso_Rollos_Extrusion.component.html',
  styleUrls: ['./Ingreso_Rollos_Extrusion.component.css']
})
export class Ingreso_Rollos_ExtrusionComponent implements OnInit {

  cargando : boolean = false; //Variable para validar que salga o no la imagen de carga
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro

  FormConsultarRollos !: FormGroup; //formulario para consultar y crear un ingreso de rollos
  rollosConsultados : any [] = []; //Variable que almacenará la información de los rollos que hayan sido consultados
  rollosIngresar : any [] = []; //Variable que almcanerá la información de los rollos que van a ser ingresados
  consolidadoProductos : any [] = []; //Variable que almacenará la información consolidad de los rollos que van a ser ingresados
  informacionPdf : any [] = [];

  procesos : any = []; //Variable que cargará los procesos.
  ubicaciones : any = ['IZQUIERDA', 'DERECHA'];
  @ViewChild('dt') dt : Table | undefined; 


  constructor(private AppComponent : AppComponent,
                private shepherdService: ShepherdService,
                  private mensajeService : MensajesAplicacionService,
                    private frmBuilder : FormBuilder,
                      private bagProService : BagproService,
                        private bgRollosService : Bodegas_RollosService,
                          private dtBgRollosService : Detalle_BodegaRollosService,
                            private svProcesos : ProcesosService, 
                              private svPDF : CreacionPdfService) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;

    this.FormConsultarRollos = this.frmBuilder.group({
      Proceso : [null, Validators.required], 
      OrdenTrabajo: [null, Validators.required],
      Rollo : [null],
      Item : [null, Validators.required],
      Referencia: [null, Validators.required],
      Ubicacion : [null, Validators.required],
      Ultimo_Rollo : [null, Validators.required],
      Observacion : [''],
    });
  }

  ngOnInit() {
    this.lecturaStorage();
    setInterval(() => this.modoSeleccionado = this.AppComponent.temaSeleccionado, 1000);
    this.getProcesos();
  }

  // Funcion que va a hacer que se inicie el tutorial in-app
  tutorial(){
    this.shepherdService.defaultStepOptions = defaultStepOptions;
    this.shepherdService.modal = true;
    this.shepherdService.confirmCancel = false;
    this.shepherdService.addSteps(defaultSteps);
    this.shepherdService.start();
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number : any) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  // funcion que va a limpiar los campos del formulario
  limpiarForm = () => this.FormConsultarRollos.reset();

  // Funcion que va a limpiar todos los campos
  limpiarCampos(){
    this.FormConsultarRollos.reset();
    this.rollosIngresar = [];
    this.cargando = false;
  }

  //Función para obtener los procesos.
  getProcesos = () => this.svProcesos.srvObtenerLista().subscribe(data => { this.procesos = data.filter(x => [1,2,3,9,7].includes(x.proceso_Codigo)) }, error => { this.mensajeService.mensajeError(`Error`, `Error al consultar los procesos. | ${error.status} ${error.statusText}`); });

  aplicarFiltro = ($event, campo : any, datos : Table) => datos!.filter(($event.target as HTMLInputElement).value, campo, 'contains');

  cargarRolloTabla(){
    if(this.FormConsultarRollos.value.Ubicacion) {
      if(this.FormConsultarRollos.value.Proceso) {
        if(this.FormConsultarRollos.value.Rollo) {
          let rollo : number = this.FormConsultarRollos.value.Rollo;
          let area :  string = this.FormConsultarRollos.value.Proceso;
          let proceso : string = this.procesos.find(x => x.proceso_Id == area).proceso_Nombre;
          this.cargando = true;

          this.dtBgRollosService.getRollo(rollo, area).subscribe(dataPl => {
            if(dataPl.length == 0) {
              this.bagProService.getRollProduction(rollo, `?process=${proceso.toUpperCase()}`).subscribe(data => {
                if(data != null) this.agregarRollo(data);
                else {
                  this.msjs(`Advertencia`, `No se encontró el rollo N° '${rollo}' en el proceso de '${proceso.toUpperCase()}'`);
                  this.cargarUltimoRollo();
                } 
              }, error => { 
                this.msjs(`Error`, `Error al consultar el rollo N° ${rollo} en BagPro!`); 
                this.cargarUltimoRollo();
              });
            } else {
              this.msjs(`Advertencia`, `El rollo N° '${rollo}' ya está registrado en la bodega`);
              this.cargarUltimoRollo();
            }
          }, error => {
            this.msjs(`Error`, `Se encontraron errores al consultar el rollo N° ${rollo} en Plasticaribe!`); 
            this.cargarUltimoRollo();
          });  
        } else this.mensajeService.mensajeAdvertencia(`Advertencia`, `Debe llenar el campo 'Rollo'`);
      } else this.mensajeService.mensajeAdvertencia(`Advertencia`, `Debe llenar el campo 'Proceso'`);
    } else this.mensajeService.mensajeAdvertencia(`Advertencia`, `Debe llenar el campo 'Ubicación'`);
  }

  agregarRollo(data : any){
    let bulto : any = data.rollo;
    if(!this.rollosIngresar.map(x => x.rollo).includes(bulto)) {
      data.ubicacion = this.FormConsultarRollos.value.Ubicacion;
      data.proceso_Id = this.FormConsultarRollos.value.Proceso;
      this.rollosIngresar.unshift(data); 
      this.mensajeService.mensajeConfirmacion(`Confirmación`, `El rollo N° ${bulto} ha sido agregado a la tabla correctamente`);
      this.FormConsultarRollos.patchValue({ 'OrdenTrabajo' : data.ot, 'Ultimo_Rollo' : data.rollo, 'Item' : data.item, 'Referencia' : `${data.item} - ${data.referencia}`, 'Rollo' : null });
      this.cargando = false; 
    } else {
      this.msjs(`Advertencia`, `El rollo N° ${bulto} ya ha sido ingresado`);
      this.cargarUltimoRollo();
    } 
  }

  cargarUltimoRollo(){
    let data = this.rollosIngresar[0];
    if(![undefined, null].includes(data)) {
      this.FormConsultarRollos.patchValue({ 'Item' : data.item, 'Referencia' : `${data.item} - ${data.referencia}`, 'OrdenTrabajo' : data.ot, 'Ultimo_Rollo' : data.rollo, 'Rollo' : null });
    } else this.FormConsultarRollos.patchValue({ 'Item' : null, 'Referencia' : null, 'OrdenTrabajo' : null, 'Ultimo_Rollo' : null, 'Rollo' : null });
  }

  getRolloOrdenProduccion(){
    let ot : any = this.FormConsultarRollos.value.Proceso;
    let area :  string = this.FormConsultarRollos.value.Proceso;
    let proceso : string = this.procesos.find(x => x.proceso_Id == area).proceso_Nombre;
    this.FormConsultarRollos.patchValue({ 'Item' : null, 'Referencia' : null, 'OrdenTrabajo' : null, 'Ultimo_Rollo' : null, 'Rollo' : null });
     
    this.bagProService.GetDatosRollosPesados(ot, proceso).subscribe(data => {
      console.log(data);
    });
  }

  msjs(msj1 : string, msj2 : string){
    this.FormConsultarRollos.patchValue({ 'Item' : null, 'Referencia' : null, 'OrdenTrabajo' : null, 'Ultimo_Rollo' : null, 'Rollo' : null });
    this.cargando = false;

    switch (msj1) {
      case 'Confirmación' :
        return this.mensajeService.mensajeConfirmacion(msj1, msj2);
      case 'Advertencia' : 
        return this.mensajeService.mensajeAdvertencia(msj1, msj2);
      case 'Error' : 
        return this.mensajeService.mensajeError(msj1, msj2);
      default :
        return this.mensajeService.mensajeAdvertencia(`No hay un tipo de mensaje asociado!`); 
    }
  }

  pesoTotal = () => this.rollosIngresar.reduce((acc, contador) => acc += contador.peso, 0);
  
  totalRollos = () => this.rollosIngresar.length;

  //Funcion que va a quitar lo rollos que se van a insertar
  quitarRolloTabla(item : any){
    this.cargando = true;
    
    setTimeout(() => {
      this.mensajeService.mensajeAdvertencia(`Advertencia`, `Se quitó el rollo N° ${item.rollo} de la tabla!`);
      let index = this.rollosIngresar.findIndex(x => x.rollo == item.rollo && x.ot == item.ot);
      this.rollosIngresar.splice(index, 1);
      this.cargando = false;
      this.cargarUltimoRollo();
    }, 500); 
  }

  // Funcion que va a crear los rollos en la base de datos
  ingresarRollos(){
    if (this.rollosIngresar.length > 0){
      this.cargando = true;
      const info : modelBodegasRollos = {
        'BgRollo_FechaEntrada': moment().format('YYYY-MM-DD'),
        'BgRollo_HoraEntrada': moment().format('H:mm:ss'),
        'BgRollo_FechaModifica': moment().format('YYYY-MM-DD'),
        'BgRollo_HoraModifica': moment().format('H:mm:ss'),
        'BgRollo_Observacion': this.FormConsultarRollos.value.Observacion == null ? '' : this.FormConsultarRollos.value.Observacion.toUpperCase(),
        'Usua_Id': this.storage_Id,
      }
      this.bgRollosService.Post(info).subscribe(data => this.ingresarDetallesRollos(data.bgRollo_Id), error => {
        this.mensajeService.mensajeError(`Error`, `Se encontró un error al ingresar los rollos | ${error.status} ${error.statusText}`);
        this.cargando = false;
      });
    } else this.mensajeService.mensajeAdvertencia(`Advertencia`, `Debe seleccionar agregar mínimo un rollo para crear el ingreso!`);
  }

  //
  ingresarDetallesRollos(id : number){
    let numRollos : number = 0;
    this.rollosIngresar.forEach(x => {
      const info : modelDtBodegasRollos = {
        'BgRollo_Id': id,
        'BgRollo_OrdenTrabajo': x.ot,
        'Prod_Id': parseInt(x.item),
        'DtBgRollo_Rollo': x.rollo,
        'DtBgRollo_Cantidad': x.peso,
        'UndMed_Id': x.unidad,
        'BgRollo_BodegaActual': 'BGPI',
        'DtBgRollo_Extrusion': x.proceso_Id == 'EXT' ? true : false,
        'DtBgRollo_ProdIntermedio': true,
        'DtBgRollo_Impresion': x.proceso_Id == 'IMP' ? true : false,
        'DtBgRollo_Rotograbado': x.proceso_Id == 'ROT' ? true : false,
        'DtBgRollo_Sellado': x.proceso_Id == 'SELLA' ? true : false,
        'DtBgRollo_Corte': x.proceso_Id == 'CORTE' ? true : false,
        'DtBgRollo_Despacho': false,
        'Estado_Id': 19,
        'BgRollo_BodegaInicial': x.proceso_Id,
        'DtBgRollo_Ubicacion': x.ubicacion
      }
      this.dtBgRollosService.Post(info).subscribe(() => {
        numRollos++;
        if (numRollos == this.rollosIngresar.length) this.createPDF(id, `creado`);
      }, error => {
        this.msjs(`Error`, `Ha ocurrido un error al ingresar los rollos | ${error.status} ${error.statusText}`);
        this.cargando = false;
      });
    });
  }

  // Funcion que se va a ejecutar cuando se hayan ingresado todos los rollos
  msjIngresoExitoso(id : number){
    this.mensajeService.mensajeConfirmacion(`Confirmación`, `Se han ingresado los rollos a la bodega correctamente`);
    this.createPDF(id, ``)
  }

  createPDF(id : number, action : string) {
    this.dtBgRollosService.GetInformacionIngreso(id).subscribe(data => {
      let title: string = `Ingreso de rollos N° ${id}`;
      let content: any[] = this.contentPDF(data);
      this.svPDF.formatoPDF(title, content);
      this.msjs(`Confirmación`, `Ingreso de rollos a bodega ${action} exitosamente!`);
      setTimeout(() => this.limpiarCampos(), 3000);
    }, error => this.msjs(`Error`, `Error al consultar el ingreso de rollos N° ${id} | ${error.status} ${error.statusText}`));
  }

  contentPDF(data): any[] {
    let content: any[] = [];
    let consolidatedInformation: Array<any> = this.getInfoIngresoPDF(data);
    let informationProducts: Array<any> = this.getInfoDetallesPDF(data);
    content.push(this.infoMovementPDF(data[0]));
    content.push(this.tablaIngresoPDF(consolidatedInformation));
    content.push(this.tableTotals(consolidatedInformation))
    content.push(this.tablaDetallesPDF(informationProducts));
    return content;
  }

  getInfoIngresoPDF(data: any): Array<any> {
    let info: Array<any> = [];
    let contador: number = 0;
    data.forEach(d => {
      if (!info.map(x => x.OT).includes(d.orden_Trabajo)) {
        contador++;
        let cantRegistros : number = data.filter(x => x.orden_Trabajo == d.orden_Trabajo).length;
        let pesoTotal: number = 0;
        data.filter(x => x.orden_Trabajo == d.orden_Trabajo).forEach(x => pesoTotal += x.cantidad);
        info.push({
          "#": contador,
          "OT": d.orden_Trabajo,
          "Item": d.item,
          "Referencia": d.referencia,
          "Rollos" : cantRegistros,
          "Peso": pesoTotal,
          "Presentación" : d.presentacion,
        });
      }
    });
    return info;
  }

  getInfoDetallesPDF(data: any): Array<any> {
    let info: Array<any> = [];
    let count: number = 0;

    data.forEach(d => {
      count++;
      info.push({
        "#": count,
        "Rollo": d.rollo,
        "OT": d.orden_Trabajo,
        "Item": d.item,
        "Referencia": d.referencia,
        "Peso": d.cantidad,
        "Presentación" : d.presentacion,
        "Bodega" : d.bodega_Inicial,
        "Ubicación" : d.ubicacion,
      });
    });
    info.sort((a, b) => a.OT - b.OT);
    return info;
  }

  //Función que muestra una tabla con la información general del ingreso.
  infoMovementPDF(data : any): {} {
    return {
      margin : [0, 0, 0, 20],
      table: {
        widths: ['34%', '33%', '33%'],
        body: [
          [
            { text: `Información general del movimiento`, colSpan: 3, alignment: 'center', fontSize: 10, bold: true }, {}, {}
          ],
          [
            { text: `Usuario ingreso: ${data.usuario}` },
            { text: `Fecha ingreso: ${data.fecha.replace('T00:00:00', '')}` },
            { text: `Hora ingreso: ${data.hora}` },
          ],
          [
            { text: `Observación: ${data.observacion}`, colSpan: 3, fontSize: 9, }, {}, {}
          ], 
        ]
      },
      fontSize: 9,
      layout: {
        fillColor: function (rowIndex) {
          return (rowIndex == 0) ? '#DDDDDD' : null;
        }
      }
    }
  }

  //Función que consolida la información por mat. primas
  tablaIngresoPDF(data) {
    let columns: Array<string> = ['#', 'OT', 'Item', 'Referencia', 'Rollos', 'Peso', 'Presentación'];
    let widths: Array<string> = ['5%', '10%', '10%', '45%', '10%', '10%', '10%'];
    return {
      table: {
        headerRows: 2,
        widths: widths,
        body: this.buildTableBody1(data, columns, 'Consolidado de rollos ingresados por orden de producción'),
      },
      fontSize: 8,
      layout: {
        fillColor: function (rowIndex) {
          return (rowIndex <= 1) ? '#DDDDDD' : null;
        }
      }
    };
  }

  //Tabla con materiales recuperados ingresados detallados
  tablaDetallesPDF(data) {
    let columns: Array<string> = ['#', 'Rollo', 'Bodega', 'Ubicación', 'OT', 'Item', 'Referencia', 'Peso', 'Presentación'];
    let widths: Array<string> = ['3%', '8%', '6%', '10%', '7%', '7%', '42%', '7%', '10%'];
    return {
      margin: [0, 20],
      table: {
        headerRows: 2,
        widths: widths,
        body: this.buildTableBody2(data, columns, 'Información detallada de rollos ingresados'),
      },
      fontSize: 8,
      layout: {
        fillColor: function (rowIndex) {
          return (rowIndex <= 1) ? '#DDDDDD' : null;
        }
      }
    };
  }

  //Tabla con los valores totales de pesos y registros
  tableTotals(data : any){
    return {
      fontSize: 8,
      bold: false,
      table: {
        widths: ['5%', '10%', '10%', '45%', '10%', '10%', '10%'],
        body: [
          [
            { text: ``, bold : true, border: [true, false, false, true], },
            { text: ``, bold : true, border: [false, false, false, true], },
            { text: ``, bold : true, border: [false, false, false, true], },
            { text: `Totales`, alignment: 'right', bold : true, border: [false, false, true, true], },
            { text: `${this.formatonumeros((data.reduce((a, b) => a += parseInt(b.Rollos), 0)))}`, bold : true, border: [false, false, true, true], },
            { text: `${this.formatonumeros((data.reduce((a, b) => a += parseFloat(b.Peso), 0)).toFixed(2))}`, bold : true, border: [false, false, true, true], },
            { text: `Kg`, bold : true, border: [false, false, true, true], },
          ],
        ],
      }
    }
  }

  buildTableBody1(data, columns, title) {
    var body = [];
    body.push([{ colSpan: 7, text: title, bold: true, alignment: 'center', fontSize: 10 }, '', '', '', '', '', '']);
    body.push(columns);
    data.forEach(function (row) {
      var dataRow = [];
      columns.forEach((column) => dataRow.push(row[column].toString()));
      body.push(dataRow);
    });
    return body;
  }

  buildTableBody2(data, columns, title) {
    var body = [];
    body.push([{ colSpan: 9, text: title, bold: true, alignment: 'center', fontSize: 10 }, '', '', '', '', '', '', '', '']);
    body.push(columns);
    data.forEach(function (row) {
      var dataRow = [];
      columns.forEach((column) => dataRow.push(row[column].toString()));
      body.push(dataRow);
    });
    return body;
  }

}
