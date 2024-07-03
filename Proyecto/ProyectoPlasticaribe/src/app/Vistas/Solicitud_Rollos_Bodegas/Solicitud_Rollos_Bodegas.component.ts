import { Component, Injectable, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShepherdService } from 'angular-shepherd';
import moment from 'moment';
import pdfMake from 'pdfmake/build/pdfmake';
import { Table } from 'primeng/table';
import { modelDtSolicitudRollos } from 'src/app/Modelo/modelDtSolicitudRollos';
import { modelSolicitudRollos } from 'src/app/Modelo/modelSolicitudRollos';
import { CreacionPdfService } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';
import { Detalle_BodegaRollosService } from 'src/app/Servicios/Detalle_BodegaRollos/Detalle_BodegaRollos.service';
import { Detalles_SolicitudRollosService } from 'src/app/Servicios/Detalles_SolicitudRollos/Detalles_SolicitudRollos.service';
import { Formato_DocumentosService } from 'src/app/Servicios/Formato_Documentos/Formato_Documentos.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { ProcesosService } from 'src/app/Servicios/Procesos/procesos.service';
import { Solicitud_Rollos_AreasService } from 'src/app/Servicios/Solicitud_Rollos_Areas/Solicitud_Rollos_Areas.service';
import { AppComponent } from 'src/app/app.component';
import { defaultStepOptions, stepsSolicitudRollos as defaultSteps } from 'src/app/data';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-Solicitud_Rollos_Bodegas',
  templateUrl: './Solicitud_Rollos_Bodegas.component.html',
  styleUrls: ['./Solicitud_Rollos_Bodegas.component.css']
})

export class Solicitud_Rollos_BodegasComponent implements OnInit {

  cargando : boolean = false; //Variable para validar que salga o no la imagen de carga
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro

  FormConsultarRollos !: FormGroup; //formulario para consultar y crear un ingreso de rollos
  bodegasSolicitadas : any [] = []; //Variable que va a tener las bodegas a los cuales se les pedirán rollos.
  bodegasSolicitantes : any [] = []; //Variable que va a tener las bodegas que pedirán rollos.
  rollosConsultados : any [] = []; //Variable que almacenará la información de los rollos que hayan sido consultados
  rollosIngresar : any [] = []; //Variable que almcanerá la información de los rollos que van a ser ingresados
  consolidadoProductos : any [] = []; //Variable que almacenará la información consolidad de los rollos que van a ser ingresados
  devolucionRollos : boolean = false; //Variable que va a validar si el tipo de solicitud es una devolución o no
  informacionPdf : any [] = [];
  @ViewChild('dt') dt : Table | undefined; 
  @ViewChild('dt2') dt2 : Table | undefined; 
  @ViewChild('dt3') dt3 : Table | undefined; 

  constructor(private AppComponent : AppComponent,
                private shepherdService: ShepherdService,
                  private mensajeService : MensajesAplicacionService,
                    private frmBuilder : FormBuilder,
                      private procesosService : ProcesosService,
                        private solicitudRollosService : Solicitud_Rollos_AreasService,
                          private dtBgRollosService : Detalle_BodegaRollosService,
                            private dtSolicitudRollosService : Detalles_SolicitudRollosService,
                              private formatoDocsService : Formato_DocumentosService,
                                private svPDF : CreacionPdfService) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;

    this.FormConsultarRollos = this.frmBuilder.group({
      OrdenTrabajo: [null, Validators.required],
      Rollo : [null],
      Observacion : [''],
      BodegaSolicitada : ['BGPI', Validators.required],
      BodegaSolicitante : [null, Validators.required],
      Devolucion : [false]
    });
  }

  ngOnInit() {
    this.lecturaStorage();
    //this.obternerBodegas();
    this.getBodegas();
    setInterval(() => this.modoSeleccionado = this.AppComponent.temaSeleccionado, 1000);
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

  // Funcion que va a consultar las bodegas de los que se van a solicitar rollos
  obternerBodegas(){
    this.procesosService.srvObtenerLista().subscribe(data => {
      switch (this.ValidarRol){
        case 64: //PRODUCTO INTERMEDIO
          this.bodegasSolicitadas = data.filter(item => ['EXT'].includes(item.proceso_Id));
          this.bodegasSolicitantes = data.filter(item => ['BGPI'].includes(item.proceso_Id));
          this.FormConsultarRollos.patchValue({ BodegaSolicitante : 'BGPI' });
          break;
        case 62: //IMPRESION
          this.bodegasSolicitadas = data.filter(item => ['BGPI', 'ROT'].includes(item.proceso_Id));
          this.bodegasSolicitantes = data.filter(item => ['IMP'].includes(item.proceso_Id));
          this.FormConsultarRollos.patchValue({ BodegaSolicitante : 'IMP' });
          break;
        case 63: //ROTOGRABADO
          this.bodegasSolicitadas = data.filter(item => ['BGPI'].includes(item.proceso_Id));
          this.bodegasSolicitantes = data.filter(item => ['ROT'].includes(item.proceso_Id));
          this.FormConsultarRollos.patchValue({ BodegaSolicitante : 'ROT' });
          break;
        case 8: //SELLADO
          this.bodegasSolicitadas = data.filter(item => ['BGPI', 'IMP'].includes(item.proceso_Id));
          this.bodegasSolicitantes = data.filter(item => ['SELLA'].includes(item.proceso_Id));
          this.FormConsultarRollos.patchValue({ BodegaSolicitante : 'SELLA' });
          break;
        case 10: //DESPACHO
          this.bodegasSolicitadas = data.filter(item => ['BGPI', 'EXT', 'SELLA', 'IMP'].includes(item.proceso_Id));
          this.bodegasSolicitantes = data.filter(item => ['DESP'].includes(item.proceso_Id));
          this.FormConsultarRollos.patchValue({ BodegaSolicitante : 'DESP' });
        break;
      default:
        this.bodegasSolicitadas = data.filter(item => ['BGPI', 'EXT', 'SELLA', 'IMP', 'ROT', 'DESP'].includes(item.proceso_Id));
        this.bodegasSolicitantes = data.filter(item => ['BGPI', 'EXT', 'SELLA', 'IMP', 'ROT', 'DESP'].includes(item.proceso_Id));
      }
    });
  }

  //Función para obtener las bodegas solicitada y solicitante.
  getBodegas(){
    this.procesosService.srvObtenerLista().subscribe(data => {
      this.bodegasSolicitadas = data.filter(x => ['BGPI'].includes(x.proceso_Id));
      this.bodegasSolicitantes = data.filter(x => ['SELLA', 'IMP', 'ROT', 'DESP'].includes(x.proceso_Id));
    });
  }

  // funcion que va a limpiar los campos del formulario
  limpiarForm() {
    this.FormConsultarRollos.reset();
    this.devolucionRollos = false;
    this.FormConsultarRollos.patchValue({ Devolucion : false, Observacion : `` });
  }

  // Funcion que va a limpiar todos los campos
  limpiarCampos(){
    this.FormConsultarRollos.reset();
    this.rollosConsultados = [];
    this.rollosIngresar = [];
    this.consolidadoProductos = [];
    this.informacionPdf = [];
    this.cargando = false;
    this.devolucionRollos = false;
    this.FormConsultarRollos.patchValue({ Devolucion : false, Observacion : `` });
  }

  // Funcion que va a consultar los rollos mediante los parametros pasados por el usuario
  consultarRollos(){
    if (this.FormConsultarRollos.valid) {
      let ot : number = this.FormConsultarRollos.value.OrdenTrabajo;
      let rollo : number = this.FormConsultarRollos.value.Rollo;
      let bodega : string = this.FormConsultarRollos.value.BodegaSolicitada;
      let ruta : string = rollo != null ? `?rollo=${rollo}` : '';

      this.cargando = true;
      this.rollosConsultados = [];
      this.rollosIngresar = [];
      this.consolidadoProductos = [];

      this.dtBgRollosService.GetRollosDisponibles(bodega, ot, ruta).subscribe(data => data.forEach(item => this.llenarRollosIngresar(item)), err => {
        this.mensajeService.mensajeError(`¡Error!`, `¡${err.error}!`);
        this.cargando = false;
      });
    } else this.mensajeService.mensajeAdvertencia(`Advertencia`, `Debe llenar los campos 'Bodega' y 'OT'`);
  }

  // Funcion que va a llenar los rollos que estan disponibles para ser ingresados
  llenarRollosIngresar(data : any){
    if(!this.rollosIngresar.map(x => x.Rollo).includes(data.rollo)) {
      let info : any = {
        Ot : data.ot,
        Rollo : parseInt(data.rollo),
        Id_Producto : data.item,
        Producto : data.referencia,
        Cantidad : parseFloat(data.cantidad),
        Presentacion : data.presentacion,
        Proceso : data.bodega,
      }
      this.rollosConsultados.push(info);
      this.rollosConsultados.sort((a,b) => Number(a.Rollo) - Number(b.Rollo) );
      this.cargando = false;
    } else {
      this.mensajeService.mensajeAdvertencia(`Advertencia`, `Ya se utilizaron rollos de la OT N° ${data.ot}`);
      this.cargando = false;
    } 
   
  }

  // Funcion que colocará los rollos que se van a insertar
  llenarRollosAIngresar(item : any){
    this.cargando = true;
    let bodegaSolicitante : any = this.FormConsultarRollos.value.BodegaSolicitante;
    this.rollosConsultados.splice(this.rollosConsultados.findIndex((data) => data.Rollo == item.Rollo), 1);
    let index = this.rollosIngresar.findIndex((data) => data.Rollo == item.Rollo);
    this.rollosIngresar[index].Proceso = this.bodegasSolicitantes.find(x => x.proceso_Id == bodegaSolicitante).proceso_Nombre;
    this.rollosIngresar.sort((a,b) => Number(a.Rollo) - Number(b.Rollo) );
    this.groupProducts();
    setTimeout(() => { this.cargando = false; }, 50);
  }

  // Funcion que seleccionará y colocará todos los rollos que se van a insertar
  seleccionarTodosRollos(){
    this.cargando = true;
    let bodegaSolicitante : any = this.FormConsultarRollos.value.BodegaSolicitante;
    this.rollosConsultados.forEach(x => x.Proceso = this.bodegasSolicitantes.find(x => x.proceso_Id == bodegaSolicitante).proceso_Nombre); 
    this.rollosIngresar = this.rollosIngresar.concat(this.rollosConsultados);
    this.rollosConsultados = [];  
    this.rollosIngresar.sort((a,b) => Number(a.Rollo) - Number(b.Rollo) );
    this.groupProducts();
    setTimeout(() => { this.cargando = false; }, 50);
  }

  //Funcion que va a quitar lo rollos que se van a insertar
  quitarRollosAIngresar(item : any){
    this.cargando = true;
    let bodegaSolicitada : any = this.FormConsultarRollos.value.BodegaSolicitada;
    this.rollosIngresar.splice(this.rollosIngresar.findIndex(data => data.Rollo == item.Rollo), 1);
    let index = this.rollosConsultados.findIndex((data) => data.Rollo == item.Rollo);
    this.rollosConsultados[index].Proceso = this.bodegasSolicitadas.find(x => x.proceso_Id == bodegaSolicitada).proceso_Nombre;
    this.rollosConsultados.sort((a,b) => Number(a.Rollo) - Number(b.Rollo) );
    this.groupProducts();
    setTimeout(() => { this.cargando = false; }, 50);
  }

  // Funcion que va a quitar todos los rollos que se van a insertar
  quitarTodosRollos(){
    this.cargando = true;
    let bodegaSolicitada : any = this.FormConsultarRollos.value.BodegaSolicitada;
    this.rollosIngresar.forEach(x => x.Proceso = this.bodegasSolicitadas.find(x => x.proceso_Id == bodegaSolicitada).proceso_Nombre); 
    this.rollosConsultados = this.rollosConsultados.concat(this.rollosIngresar);
    this.rollosIngresar = [];
    this.rollosConsultados.sort((a,b) => Number(a.Rollo) - Number(b.Rollo) );
    this.groupProducts();
    setTimeout(() => { this.cargando = false; }, 50);
  }

  groupProducts(){
    this.consolidadoProductos = this.rollosIngresar.reduce((a, b) => {
      if(!a.map(x => x.Ot).includes(b.Ot)) a = [...a, b];
      return a;
    }, []);
    this.orderTables();
  }

  orderTables(){
    this.rollosIngresar.sort((a,b) => Number(a.Rollo) - Number(b.Rollo) );
    this.consolidadoProductos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
  }

  qtyConsolidateForOrder = (ot : number) => this.rollosIngresar.filter(x => x.Ot == ot).reduce((a, b) => a += b.Cantidad, 0);
  
  qtyRollsConsolidateForOrder = (ot : number) => this.rollosIngresar.filter(x => x.Ot == ot).length;

  qtyTotalRolls = () => this.rollosIngresar.length;

  qtyTotal = () =>  this.rollosIngresar.reduce((a, b) => a += b.Cantidad, 0);

  // Funcion que permitirá ver el total de lo escogido para cada producto
  GrupoProductos(){
    let producto : any = [];
    this.consolidadoProductos = [];
    for (let i = 0; i < this.rollosIngresar.length; i++) {
      if (!producto.includes(this.rollosIngresar[i].Id_Producto)) {
        let cantidad : number = 0, cantRollo : number = 0;
        for (let j = 0; j < this.rollosIngresar.length; j++) {
          if (this.rollosIngresar[i].Id_Producto == this.rollosIngresar[j].Id_Producto) {
            cantidad += this.rollosIngresar[j].Cantidad;
            cantRollo += 1;
          }
        }
        if (cantRollo > 0){
          producto.push(this.rollosIngresar[i].Id_Producto);
          let info : any = {
            Ot: this.rollosIngresar[i].Ot,
            Id : this.rollosIngresar[i].Id_Producto,
            Nombre : this.rollosIngresar[i].Producto,
            Cantidad : cantidad,
            Rollos: this.rollosIngresar.filter(x => x.Id_Producto == this.rollosIngresar[i].Id_Producto).length,
            Presentacion : this.rollosIngresar[i].Presentacion,
          }
          this.consolidadoProductos.push(info);
        }
      }
    }
    setTimeout(() => {
      this.rollosIngresar.sort((a,b) => Number(a.Rollo) - Number(b.Rollo) );
      this.consolidadoProductos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
      this.cargando = false;
    }, 50);
  }

  // Funcion que va a crear los rollos en la base de datos
  ingresarRollos(){
    if (this.rollosIngresar.length > 0 && this.FormConsultarRollos.valid){
      this.cargando = true;
      const info : modelSolicitudRollos = {
        'Usua_Id': this.storage_Id,
        'SolRollo_FechaSolicitud': moment().format('YYYY-MM-DD'),
        'SolRollo_HoraSolicitud': moment().format('H:mm:ss'),
        'Usua_Respuesta': this.storage_Id,
        'Estado_Id': 48,
        'TpSol_Id': this.devolucionRollos ? 2 : 1,
        'SolRollo_Observacion': this.FormConsultarRollos.value.Observacion == null ? '' : this.FormConsultarRollos.value.Observacion.toUpperCase(),
        'SolRollo_FechaRespuesta': moment().format('YYYY-MM-DD'),
        'SolRollo_HoraRespuesta': moment().format('H:mm:ss'),
      }
      this.solicitudRollosService.Post(info).subscribe(data => this.ingresarDetallesRollos(data.solRollo_Id), err => {
        this.mensajeService.mensajeError(`Ha ocurrido un error al registrar la solicitud de rollos`, `${err.status} ${err.statusText}`);
        this.cargando = false;
      });
    } else this.mensajeService.mensajeAdvertencia(`Advertencia`, `Debe seleccionar mínimo un rollo para realizar la solicitud!`);
  }

  //
  ingresarDetallesRollos(id : number){
    let numRollos : number = 0;
      this.cargando = true;
      for (let i = 0; i < this.rollosIngresar.length; i++) {
        const info : modelDtSolicitudRollos = {
          'DtSolRollo_OrdenTrabajo': this.rollosIngresar[i].Ot,
          'DtSolRollo_Maquina': 0,
          'DtSolRollo_BodegaSolicitante': this.FormConsultarRollos.value.BodegaSolicitante,
          'DtSolRollo_BodegaSolicitada': this.FormConsultarRollos.value.BodegaSolicitada,
          'DtSolRollo_Rollo': this.rollosIngresar[i].Rollo,
          'DtSolRollo_Cantidad': this.rollosIngresar[i].Cantidad,
          'UndMed_Id': this.rollosIngresar[i].Presentacion,
          'Prod_Id': this.rollosIngresar[i].Id_Producto,
          'SolRollo_Id': id
        }
        this.dtSolicitudRollosService.Post(info).subscribe(() => {
          numRollos += 1
          if (numRollos == this.rollosIngresar.length) this.actualizarBodegaRollos(id); //this.createPDF(id, `creada`);
        }, err => {
          this.mensajeService.mensajeError(`Ha ocurrido un error al registrar los detalles de la solicitud`, `${err.status} ${err.statusText}`);
          this.cargando = false;
        });
      }
  }

  actualizarBodegaRollos(idSolicitud : number){
    let rolls : any = [];
    let bodegaSolicitante : any = this.FormConsultarRollos.value.BodegaSolicitante;

    this.rollosIngresar.forEach(x => rolls.push({ 'Rollo' : x.Rollo,  'OT' : x.Ot, }));
    this.dtBgRollosService.putRollsStore(23, bodegaSolicitante, rolls).subscribe(data => {
      this.createPDF(idSolicitud, `creada`);
    }, error => {
      this.mensajeService.mensajeError(`Ha ocurrido un error al actualizar los rollos en la bodega`, `${error.status} ${error.statusText}`);
      this.cargando = false;
    });
  }

  aplicarFiltro = ($event, campo : any, datos : Table) => datos!.filter(($event.target as HTMLInputElement).value, campo, 'contains');

  
  createPDF(id : number, action : string) {
    this.dtSolicitudRollosService.GetInformacionSolicitud(id).subscribe(data => {
      let title: string = `Solicitud de rollos N° ${id}`;
      let content: any[] = this.contentPDF(data);
      this.svPDF.formatoPDF(title, content);
      this.mensajeService.mensajeConfirmacion(`Confirmación`, `Solicitud de rollos a bodega ${action} exitosamente!`);
      setTimeout(() => this.limpiarCampos(), 3000);
    }, error => this.mensajeService.mensajeError(`Error`, `Error al consultar la solicitud de rollos N° ${id} | ${error.status} ${error.statusText}`));
  }

  contentPDF(data): any[] {
    let content: any[] = [];
    let consolidatedInformation: Array<any> = this.getSolicitudPDF(data);
    let informationProducts: Array<any> = this.getDetalleSolicitudPDF(data);
    content.push(this.infoMovementPDF(data[0]));
    content.push(this.tablaIngresoPDF(consolidatedInformation));
    content.push(this.tableTotals(consolidatedInformation))
    content.push(this.tablaDetallesPDF(informationProducts));
    return content;
  }

  getSolicitudPDF(data: any): Array<any> {
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
          "Peso": this.formatonumeros((pesoTotal).toFixed(2)),
          "Peso2": pesoTotal,
          "Presentación" : d.presentacion,
        });
      }
    });
    return info;
  }

  getDetalleSolicitudPDF(data: any): Array<any> {
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
        "Peso": d.cantidad.toFixed(2),
        "Und" : d.presentacion,
        "Solicita" : d.bodega_Solicitante == 'Producto Intermedio' ? 'P. Intermedio' : d.bodega_Solicitante,
        "Entrega" : d.bodega_Solicitada == 'Producto Intermedio' ? 'P. Intermedio' : d.bodega_Solicitada,
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
            { text: `N° Solicitud: ${data.solicitud}` },
            { text: `Tipo Solicitud: ${data.tipo_Solicitud}` },
            { text: `Estado: ${data.estado}` },
          ],
          [
            { text: `Usuario ingreso: ${data.usuario}` },
            { text: `Fecha ingreso: ${data.fecha_Solicitud.replace('T00:00:00', '')}` },
            { text: `Hora ingreso: ${data.hora_Solicitud}` },
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
        body: this.buildTableBody1(data, columns, 'Consolidado de rollos de la solicitud'),
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
    let columns: Array<string> = ['#', 'Rollo', 'Solicita', 'Entrega', 'OT', 'Item', 'Referencia', 'Peso', 'Und'];
    let widths: Array<string> = ['4%', '8%', '12%', '12%', '7%', '7%', '40%', '7%', '3%'];
    return {
      margin: [0, 20],
      table: {
        headerRows: 2,
        widths: widths,
        body: this.buildTableBody2(data, columns, 'Información detallada de los rollos solicitados'),
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
            { text: `${this.formatonumeros((data.reduce((a, b) => a += parseFloat(b.Peso2), 0)).toFixed(2))}`, bold : true, border: [false, false, true, true], },
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