import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ShepherdService } from 'angular-shepherd';
import moment from 'moment';
import pdfMake from 'pdfmake/build/pdfmake';
import { Table } from 'primeng/table';
import { modelDtBodegasRollos } from 'src/app/Modelo/modelDtBodegasRollos';
import { modelSolicitudRollos } from 'src/app/Modelo/modelSolicitudRollos';
import { Detalle_BodegaRollosService } from 'src/app/Servicios/Detalle_BodegaRollos/Detalle_BodegaRollos.service';
import { Detalles_SolicitudRollosService } from 'src/app/Servicios/Detalles_SolicitudRollos/Detalles_SolicitudRollos.service';
import { EstadosService } from 'src/app/Servicios/Estados/estados.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { ProcesosService } from 'src/app/Servicios/Procesos/procesos.service';
import { Solicitud_Rollos_AreasService } from 'src/app/Servicios/Solicitud_Rollos_Areas/Solicitud_Rollos_Areas.service';
import { AppComponent } from 'src/app/app.component';
import { defaultStepOptions, stepsMovSolicitudesMP as defaultSteps } from 'src/app/data';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';

@Component({
  selector: 'app-Movimientos_SolicitudRollos',
  templateUrl: './Movimientos_SolicitudRollos.component.html',
  styleUrls: ['./Movimientos_SolicitudRollos.component.css']
})
export class Movimientos_SolicitudRollosComponent implements OnInit {

  cargando : boolean = false; //Variable para validar que salga o no la imagen de carga
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro

  @ViewChild('tblSol') tblSol: Table | undefined;
  FormFiltros !: FormGroup; //Variable que será el formulario donde estarán los filtros de busqueda de las solicitudes
  solicitudes : any [] = []; //Variable que almacenará la información de las solicitudes que sean consultadas
  detallesSolicitud : any [] = []; //Variable que almacenará la información de los detalles de una solicitud
  estadosSolicitudes : any [] = []; //Variable que va a tener la información de los estados que puede tener una solicitud
  tipoSolicitud : any [] = [{Nombre : 'Solicitud', Id : 1}, {Nombre : 'Devolución', Id : 2}]; //Variable que va a almacenar la información de los tipos de solicitudes que se pueden realizar
  bodegasSolicitadas : any [] = []; //Variable que va a almacenar la información de las bodegas que pueden ser solicitadas
  bodegasSolicitantes : any [] = []; //Variable que va a almacenar la información de las bodegas que pueden ser solicitantes
  usuarioSolicitante : string = ''; //Variable que almacenará el nombre del usuario que realizó la solicitud de rollos
  solicitudSeleccionada : number = 0; //Variable que almacenará el numero de la solicitud que se seleccionó
  solicitudesPendientes : number = 0; //Variable que almacenará la cantidad de solicitudes pendientes
  solicitudesCanceladas : number = 0; //Variable que almacenará la cantidad de solicitudes canceladas
  solicitudesFinalizadas : number = 0; //Variable que almacenará la cantidad de solicitudes finalizadas
  informacionPdf : any [] = [];

  constructor(private AppComponent : AppComponent,
                private shepherdService: ShepherdService,
                  private msj : MensajesAplicacionService,
                    private frmBuilder : FormBuilder,
                      private procesosService : ProcesosService,
                        private dtSolicitudService : Detalles_SolicitudRollosService,
                          private estadosService : EstadosService,
                            private solicitudService : Solicitud_Rollos_AreasService,
                              private dtBgRollosService : Detalle_BodegaRollosService,) {

    this.modoSeleccionado = this.AppComponent.temaSeleccionado;

    this.FormFiltros = this.frmBuilder.group({
      Solicitud : [null],
      FechaInicio : [null],
      FechaFin : [null],
      BodegaSolicitada : [null],
      BodegaSolicitante : [null],
      Estado : [11],
      TipoSolicitud : [1],
    });
  }

  ngOnInit() {
    this.lecturaStorage();
    this.obternerBodegas();
    this.obtenerEstados();
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number : any) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  verTutorial() {
    this.shepherdService.defaultStepOptions = defaultStepOptions;
    this.shepherdService.modal = true;
    this.shepherdService.confirmCancel = false;
    this.shepherdService.addSteps(defaultSteps);
    this.shepherdService.start();
  }

  // Funcion que va a consultar las bodegas de los que se van a solicitar rollos
  obternerBodegas(){
    this.procesosService.srvObtenerLista().subscribe(data => {
      if (this.ValidarRol != 1){
        if (this.ValidarRol == 64) { //PRODUCTO INTERMEDIO
          this.bodegasSolicitadas = data.filter(item => ['EXT'].includes(item.proceso_Id));
          this.bodegasSolicitantes = data.filter(item => ['BGPI'].includes(item.proceso_Id));
          this.FormFiltros.patchValue({ BodegaSolicitante : 'BGPI' });
        }
        if (this.ValidarRol == 62) { //IMPRESION
          this.bodegasSolicitadas = data.filter(item => ['BGPI', 'ROT'].includes(item.proceso_Id));
          this.bodegasSolicitantes = data.filter(item => ['IMP'].includes(item.proceso_Id));
          this.FormFiltros.patchValue({ BodegaSolicitante : 'IMP' });
        }
        if (this.ValidarRol == 63) { //ROTOGRABADO
          this.bodegasSolicitadas = data.filter(item => ['BGPI'].includes(item.proceso_Id));
          this.bodegasSolicitantes = data.filter(item => ['ROT'].includes(item.proceso_Id));
          this.FormFiltros.patchValue({ BodegaSolicitante : 'ROT' });
        }
        if (this.ValidarRol == 8) { //SELLADO
          this.bodegasSolicitadas = data.filter(item => ['BGPI', 'IMP'].includes(item.proceso_Id));
          this.bodegasSolicitantes = data.filter(item => ['SELLA'].includes(item.proceso_Id));
          this.FormFiltros.patchValue({ BodegaSolicitante : 'SELLA' });
        }
        if (this.ValidarRol == 10) { //DESPACHO
          this.bodegasSolicitadas = data.filter(item => ['BGPI', 'EXT', 'SELLA', 'IMP'].includes(item.proceso_Id));
          this.bodegasSolicitantes = data.filter(item => ['DESP'].includes(item.proceso_Id));
          this.FormFiltros.patchValue({ BodegaSolicitante : 'DESP' });
        }
      } else {
        this.bodegasSolicitadas = data.filter(item => ['BGPI', 'EXT', 'SELLA', 'IMP', 'ROT'].includes(item.proceso_Id));
        this.bodegasSolicitantes = data.filter(item => ['BGPI', 'EXT', 'SELLA', 'IMP', 'ROT'].includes(item.proceso_Id));
      }
    });
  }

  // Funcion que va a consultar y almacenar los estados que pueden tener los documentos
  obtenerEstados = () => this.estadosService.srvObtenerListaEstados().subscribe(data => this.estadosSolicitudes = data.filter(item => [4,5,11].includes(item.estado_Id)));

  // funcion que va a limpiar los campos del formulario
  limpiarForm = () => this.FormFiltros.reset();

  // Funcion que va a limpiar todos los campos
  limpiarCampos(){
    this.FormFiltros.reset();
    this.solicitudes = [];
    this.detallesSolicitud = [];
    this.usuarioSolicitante = '';
    this.solicitudSeleccionada = 0;
    this.cargando = false;
  }

  // Función para filtrar los registros de la tabla
  aplicarFiltro = ($event, campo : any, valorCampo : string) => this.tblSol!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

  // Función que va a consultar las solicitudes de rollos segun los filtros que se le pasen
  consultarSolicitudes(){
    let solicitud : string = this.FormFiltros.value.Solicitud;
    let fechaInicio : any = moment(this.FormFiltros.value.FechaInicio).format('YYYY-MM-DD') == 'Invalid date' ? this.today : moment(this.FormFiltros.value.FechaInicio).format('YYYY-MM-DD');
    let fechaFin : any = moment(this.FormFiltros.value.FechaFin).format('YYYY-MM-DD') == 'Invalid date' ? fechaInicio : moment(this.FormFiltros.value.FechaFin).format('YYYY-MM-DD');
    let bodegaSolicitada : string = this.FormFiltros.value.BodegaSolicitada;
    let bodegaSolicitante : string = this.FormFiltros.value.BodegaSolicitante;
    let estado : string = this.FormFiltros.value.Estado;
    let tipoSolicitud : number = this.FormFiltros.value.TipoSolicitud;
    let ruta : string = '';
    let numDatos : number = 0;
    this.solicitudes = [];
    this.detallesSolicitud = [];
    this.usuarioSolicitante = '';
    this.solicitudSeleccionada = 0;
    this.cargando = true;

    if (solicitud != null) ruta += `solRollos=${solicitud}`;
    if (bodegaSolicitada != null) ruta.length > 0 ? ruta += `&bgSolicitada=${bodegaSolicitada}` : ruta += `bgSolicitada=${bodegaSolicitada}`;
    if (bodegaSolicitante != null) ruta.length > 0 ? ruta += `&bgSolicitante=${bodegaSolicitante}` : ruta += `bgSolicitante=${bodegaSolicitante}`;
    if (estado != null) ruta.length > 0 ? ruta += `&estado=${estado}` : ruta += `estado=${estado}`;
    if (ruta.length > 0) ruta = `?${ruta}`

    this.dtSolicitudService.GetSolicitudesRealizadas(tipoSolicitud, fechaInicio, fechaFin, ruta).subscribe(data =>{
      for (let i = 0; i < data.length; i++) {
        let info : any = {
          Solicitud: data[i].solicitud,
          Fecha: `${data[i].fecha_Solicitud.replace('T00:00:00', '')} ${data[i].hora_Solicitud}`,
          Estado: data[i].estado,
          BgSolicitada: data[i].bodega_Solicitada,
          BgSolicitante: data[i].bodega_Solicitante,
          Tipo: data[i].tipo_Solicitud,
        }
        this.solicitudes.push(info);
        this.solicitudes.sort((a, b) => Number(a.Solicitud) - Number(b.Solicitud));
        numDatos += 1;
        numDatos == data.length ? this.cargando = false : this.cargando = true;
      }
    }, err => {
      this.msj.mensajeAdvertencia(`¡Advertencia!`, `¡${err.error}!`);
      this.cargando = false;
    });
  }

  // Funcion que va a llenar la tabla de los detalles de los rollos de una solicitud
  consultarDetallesSolicitud(id : number){
    let numDatos : number = 0;
    this.cargando = true;
    this.detallesSolicitud = [];
    this.usuarioSolicitante = '';
    this.solicitudSeleccionada = 0;
    this.dtSolicitudService.GetDetallesSolicitud(id).subscribe(data => {
      for (let i = 0; i < data.length; i++) {
        let info : any = {
          Rollo: data[i].rollo,
          OrdenTrabajo: data[i].orden_Trabajo,
          Maquina: data[i].maquina,
          Item: data[i].item,
          Referencia: data[i].referencia,
          Cantidad: data[i].cantidad,
          Presentacion: data[i].presentacion,
          BodegaActual: data[i].bodega_Solicitada,
          BodegaSiguiente: data[i].bodega_Solicitante,
          TipoSolicitud : data[i].tipoSolicitud,
        }
        this.solicitudSeleccionada = id;
        this.usuarioSolicitante = data[i].usuario;
        this.detallesSolicitud.push(info);
        this.detallesSolicitud.sort((a, b) => Number(a.Rollo) - Number(b.Rollo));
        numDatos += 1;
        numDatos == data.length ? this.cargando = false : this.cargando = true;
      }
    });
  }

  // Funcion que va a cambiar el estado de una solicitud
  finalizarSolicitud(estado : number){
    let estadoNombre: string = estado == 5 ? 'aceptado' : 'cancelado';
    this.solicitudService.Get_Id(this.solicitudSeleccionada).subscribe(data => {
      if (data.estado_Id == 11){
        let info : modelSolicitudRollos = {
          SolRollo_Id: this.solicitudSeleccionada,
          SolRollo_FechaRespuesta: moment().format('YYYY-MM-DD'),
          SolRollo_HoraRespuesta: moment().format('H:mm:ss'),
          Usua_Respuesta : this.storage_Id,
          Usua_Id: data.usua_Id,
          SolRollo_FechaSolicitud: data.solRollo_FechaSolicitud,
          SolRollo_HoraSolicitud: data.solRollo_HoraSolicitud,
          Estado_Id: estado,
          TpSol_Id: data.tpSol_Id,
          SolRollo_Observacion: data.solRollo_Observacion,
        }
        this.solicitudService.Put(this.solicitudSeleccionada, info).subscribe(() => {
          if (estado == 5) this.cambiarBodegaActualRollo();
          else {
            this.limpiarCampos();
            this.msj.mensajeConfirmacion(`¡Se ha cambiado el estado de la solicitud satisfactoriamente!`, ``);
          }
        }, err => {
          this.msj.mensajeError(`No se ha podido cambiado a ${estadoNombre} solicitud!`, `¡${err.error}!`);
          this.cargando = false;
        });
      } else this.msj.mensajeAdvertencia(`¡No puede cambiar el estado!`, `¡No se puede cambiar el estado de solicitudes que ya han sido 'Aceptadas' o 'Finalizadas'!`);
    }, err => this.msj.mensajeAdvertencia(`¡No se encontró información sobre el rollo!`, `¡Es posible que el rollo ya no esté en la bodega solicitada!`));
  }

  // Funcion que va a cambiar la bodega actual del rollo y a actualizar el proceso por el que ha pasado
  cambiarBodegaActualRollo(){
    let numDatos : number = 0;
    for (let i = 0; i < this.detallesSolicitud.length; i++) {
      this.dtBgRollosService.GetInfoRollo(this.detallesSolicitud[i].Rollo, this.detallesSolicitud[i].BodegaActual).subscribe(data => {
        for (let j = 0; j < data.length; j++) {
          let info : modelDtBodegasRollos = {
            BgRollo_Id : data[j].bgRollo_Id,
            Codigo : data[j].codigo,
            BgRollo_OrdenTrabajo : data[j].bgRollo_OrdenTrabajo,
            Prod_Id : data[j].prod_Id,
            DtBgRollo_Rollo : data[j].dtBgRollo_Rollo,
            DtBgRollo_Cantidad : data[j].dtBgRollo_Cantidad,
            UndMed_Id : data[j].undMed_Id,
            BgRollo_BodegaActual : this.detallesSolicitud[i].BodegaSiguiente,
            DtBgRollo_Extrusion : this.detallesSolicitud[i].BodegaSiguiente == 'EXT' || (data[j].dtBgRollo_Extrusion && this.detallesSolicitud[i].TipoSolicitud == 1) ? true : false,
            DtBgRollo_ProdIntermedio : this.detallesSolicitud[i].BodegaSiguiente == 'BGPI' || (data[j].dtBgRollo_ProdIntermedio && this.detallesSolicitud[i].TipoSolicitud == 1) ? true : false,
            DtBgRollo_Impresion : this.detallesSolicitud[i].BodegaSiguiente == 'IMP' || (data[j].dtBgRollo_Impresion && this.detallesSolicitud[i].TipoSolicitud == 1) ? true : false,
            DtBgRollo_Rotograbado : this.detallesSolicitud[i].BodegaSiguiente == 'ROT' || (data[j].dtBgRollo_Rotograbado && this.detallesSolicitud[i].TipoSolicitud == 1) ? true : false,
            DtBgRollo_Sellado : this.detallesSolicitud[i].BodegaSiguiente == 'SELLA' || (data[j].dtBgRollo_Sellado && this.detallesSolicitud[i].TipoSolicitud == 1) ? true : false,
            DtBgRollo_Corte : this.detallesSolicitud[i].BodegaSiguiente == 'CORTE' || (data[j].dtBgRollo_Corte && this.detallesSolicitud[i].TipoSolicitud == 1) ? true : false,
            DtBgRollo_Despacho : this.detallesSolicitud[i].BodegaSiguiente == 'DESP' || (data[j].dtBgRollo_Despacho && this.detallesSolicitud[i].TipoSolicitud == 1) ? true : false,
          }
          this.dtBgRollosService.Put(data[j].codigo, info).subscribe(() => {
            numDatos += 1;
            if (numDatos == this.detallesSolicitud.length) {
              this.limpiarCampos();
              this.msj.mensajeConfirmacion(`¡Se ha cambiado el estado de la solicitud satisfactoriamente!`, ``);
            } else this.cargando = true;
          })
        }
      });
    }
  }

  // Funcion que va a consultar la información con la que se llenará el pdf
  async buscarInformacioPDF(){
    this.informacionPdf = [];
    this.dtSolicitudService.GetInformacionSolicitud(this.solicitudSeleccionada).subscribe(data => {
      this.cargando = true;
      for (let i = 0; i < data.length; i++) {
        let info : any = {
          "Orden Trabajo" : data[i].orden_Trabajo,
          "Rollo" : data[i].rollo,
          "Item" : data[i].item,
          "Referencia" : data[i].referencia,
          "Cantidad" : this.formatonumeros(data[i].cantidad),
          "Presentación" : data[i].presentacion,
        }
        this.informacionPdf.push(info);
      }
    });
    setTimeout(() => this.crearPDF(this.solicitudSeleccionada), 2500);
  }

  // funcion que va a crear un PDF
  crearPDF(solicitud : number){
    let nombre : string = this.storage_Nombre;
    this.dtSolicitudService.GetInformacionSolicitud(solicitud).subscribe(data => {
      for (let i = 0; i < data.length; i++) {
        const pdfDefinicion : any = {
          info: { title: `${data[i].solicitud}` },
          pageSize: { width: 630, height: 760 },
          watermark: { text: 'PLASTICARIBE SAS', color: 'red', opacity: 0.05, bold: true, italics: false },
          pageMargins : [25, 150, 25, 35],
          header: function(currentPage : any, pageCount : any) {
            return [
              {
                margin: [20, 8, 20, 0],
                columns: [
                  { image : logoParaPdf, width : 150, height : 30, margin: [20, 25] },
                  {
                    width: 300,
                    alignment: 'center',
                    table: {
                      body: [
                        [{text: 'NIT. 800188732', bold: true, alignment: 'center', fontSize: 10}],
                        [{text: `Fecha de Análizis: ${moment().format('YYYY-MM-DD')}`, alignment: 'center', fontSize: 8}],
                        [{text: `Solicitud de Rollos ${data[i].solicitud}`, bold: true, alignment: 'center', fontSize: 10}],
                      ]
                    },
                    layout: 'noBorders',
                    margin: [85, 20],
                  },
                  {
                    width: '*',
                    alignment: 'center',
                    margin: [20, 20, 20, 0],
                    table: {
                      body: [
                        [{text: `Pagina: `, alignment: 'left', fontSize: 8, bold: true}, { text: `${currentPage.toString() + ' de ' + pageCount}`, alignment: 'left', fontSize: 8, margin: [0, 0, 30, 0] }],
                        [{text: `Fecha: `, alignment: 'left', fontSize: 8, bold: true}, {text: moment().format('YYYY-MM-DD'), alignment: 'left', fontSize: 8, margin: [0, 0, 30, 0] }],
                        [{text: `Hora: `, alignment: 'left', fontSize: 8, bold: true}, {text: moment().format('H:mm:ss'), alignment: 'left', fontSize: 8, margin: [0, 0, 30, 0] }],
                        [{text: `Usuario: `, alignment: 'left', fontSize: 8, bold: true}, {text: nombre, alignment: 'left', fontSize: 8, margin: [0, 0, 30, 0] }],
                      ]
                    },
                    layout: 'noBorders',
                  }
                ]
              },
              {
                margin: [20, 0],
                table: {
                  headerRows: 1,
                  widths: ['*'],
                  body: [
                    [
                      {
                        border: [false, true, false, false],
                        text: ''
                      },
                    ],
                  ]
                },
                layout: { defaultBorder: false, }
              },
              {
                margin: [20, 0],
                table: {
                  headerRows: 1,
                  widths: ['*', '*'],
                  body: [
                    [
                      { border: [false, false, false, false], text: `Bodega Solicitada:  ${data[i].bodega_Solicitada}`, bold: true, fontSize: 10, alignment: 'center' },
                      { border: [false, false, false, false], text: `Bodega Solicitante:  ${data[i].bodega_Solicitante}`, bold: true, fontSize: 10, alignment: 'center' },
                    ],
                  ]
                },
                layout: { defaultBorder: false, }
              },
              {
                margin: [20, 10, 20, 0],
                table: {
                  headerRows: 1,
                  widths: [55, 50, 50, 270, 50, 60],
                  body: [
                    [
                      { text: 'Orden Trabajo', fillColor: '#bbb', fontSize: 9 },
                      { text: 'Rollo', fillColor: '#bbb', fontSize: 9 },
                      { text: 'Item', fillColor: '#bbb', fontSize: 9 },
                      { text: 'Referencia', fillColor: '#bbb', fontSize: 9 },
                      { text: 'Cantidad', fillColor: '#bbb', fontSize: 9 },
                      { text: 'Presentación', fillColor: '#bbb', fontSize: 9 },
                    ],
                  ]
                },
                layout: { defaultBorder: false, },
              }
            ];
          },
          content : [
            this.table(this.informacionPdf, ['Orden Trabajo', 'Rollo', 'Item', 'Referencia', 'Cantidad', 'Presentación']),
            {
              text: `\n \nObservación sobre la Orden: \n ${data[i].observacion}\n`,
              style: 'header',
            },
          ],
          styles: {
            header: { fontSize: 10, bold: true },
            titulo: { fontSize: 20, bold: true }
          }
        }
        const pdf = pdfMake.createPdf(pdfDefinicion);
        pdf.open();
        this.cargando = false;
        break;
      }
    });
  }

  // funcion que se encagará de llenar la tabla de los rollos en el pdf
  buildTableBody(data : any, columns : any) {
    var body = [];
    data.forEach(function(row) {
      var dataRow = [];
      columns.forEach(function(column) {
        dataRow.push(row[column].toString());
      });
      body.push(dataRow);
    });

    return body;
  }

  // Funcion que genera la tabla donde se mostrará la información de los rollos
  table(data : any, columns : any) {
    return {
      table: {
        widths: [50, 50, 50, '*', 50, 50],
        body: this.buildTableBody(data, columns),
      },
      fontSize: 7,
    };
  }
}
