import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ShepherdService } from 'angular-shepherd';
import moment from 'moment';
import pdfMake from 'pdfmake/build/pdfmake';
import { MessageService } from 'primeng/api';
import { DetSolicitudMP_ExtrusionService } from 'src/app/Servicios/DetSolicitudMP_Extrusion/DetSolicitudMP_Extrusion.service';
import { EstadosService } from 'src/app/Servicios/Estados/estados.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { SolicitudMP_ExtrusionService } from 'src/app/Servicios/SolicitudMP_Extrusion/SolicitudMP_Extrusion.service';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';
import { AppComponent } from 'src/app/app.component';
import { AsignacionMateriaPrimaComponent } from '../asignacion-materia-prima/asignacion-materia-prima.component';
import { Table } from 'primeng/table';
import { modelSolicitudMP_Extrusion } from 'src/app/Modelo/modelSolicitudMP_Extrusion';
import { DetallesAsignacionService } from 'src/app/Servicios/DetallesAsgMateriaPrima/detallesAsignacion.service';
import { defaultStepOptions, stepsMovSolicitudesMPExtrusion as defaultSteps } from 'src/app/data';


@Component({
  selector: 'app-Reporte_SolicitudMpExtrusion',
  templateUrl: './Reporte_SolicitudMpExtrusion.component.html',
  styleUrls: ['./Reporte_SolicitudMpExtrusion.component.css']
})
export class Reporte_SolicitudMpExtrusionComponent implements OnInit {
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  cargando : boolean = false;
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol
  formFiltros !: FormGroup; /** Formulario de filtros de búsqueda */
  estados : any = []; /** Array que contendrá los estados de las solicitudes */
  arrayRegistros : any = []; /** Array que contendrá la tabla luego de realizar una consulta */
  @ViewChild('dt1') dt1: Table | undefined;
  cantPendientes : number = 0; /** Variable que mostrará el número de solicitudes pendientes */
  cantFinalizadas : number = 0; /** Variable que mostrará el número de solicitudes finalizadas */
  cantCanceladas : number = 0; /** Variable que mostrará el número de solicitudes canceladas */
  @ViewChild(AsignacionMateriaPrimaComponent) AsignacionMatPrima : AsignacionMateriaPrimaComponent;
  informacionPDF: any; /** Variable que contendrá la información del PDF */
  arrayMatPrimas : any = []; /** Array que cargará las materias primas de la solicitud seleccionada */
  solicitudSeleccionada : number = 0; /** Nro de la solicitud seleccionada */
  usuarioSolicitante : string = '' /** Variable que contendrá el nombre del usuario que solicitó la materia prima. */
  modalAsignacion : boolean = false; /** Variable que validará que se cargue o no, el componente del modal de ordenes de compras. */
  cantParciales : number = 0; /** Variable que mostrará el número de solicitudes parciales */
  estadoSolicitud : string = ''; /** Variable que servirá para no permitir cancelar solicitudes en estado cancelado o finalizado. */
  clave : string = ''; /** Variable que contendrá una palabra clave ya sea para finalizar o cancelar una solicitud.*/
  nroSolicitud : number = 0;

  constructor(private frmBuilder : FormBuilder,
                  private messageService: MessageService,
                    private shepherdService: ShepherdService,
                      private AppComponent : AppComponent,
                        private servicioEstados : EstadosService,
                          private servicioSolicitudesMPExt : SolicitudMP_ExtrusionService,
                            private servicioDtSolicitudesMPExt : DetSolicitudMP_ExtrusionService,
                              private msj : MensajesAplicacionService,
                                private ServicioDetAsignacionesMp : DetallesAsignacionService) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
    this.formFiltros = this.frmBuilder.group({
      documento : [null],
      fechaDoc: [null],
      fechaFinalDoc: [null],
      estadoDoc : [null]
    });
  }

  ngOnInit() {
    this.obtenerEstados();
    this.lecturaStorage();
    this.getEstadoSolitudes();
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = '$1,';
    return number.toString().replace(exp,rep);
  }

  // Funcion que va a consultar y almacenar los estados que pueden tener los documentos
  obtenerEstados(){
    this.servicioEstados.srvObtenerListaEstados().subscribe(datos_estados => {
      this.estados = datos_estados.filter(item => item.estado_Id == 11 || item.estado_Id == 5 || item.estado_Id == 4 || item.estado_Id == 12);
    });
  }

  /** Función que mostrará el numero de solicitudes por estado. */
  getEstadoSolitudes(){
    this.cantPendientes = 0;
    this.cantParciales = 0;
    this.cantFinalizadas = 0;
    this.cantCanceladas = 0;

    this.servicioSolicitudesMPExt.GetUltimas100Solicitudes().subscribe(data => {
      for (let index = 0; index < data.length; index++) {
        if(data[index].estado_Id == 11) this.cantPendientes += 1;
        if(data[index].estado_Id == 5) this.cantFinalizadas += 1;
        if(data[index].estado_Id == 4) this.cantCanceladas += 1;
        if(data[index].estado_Id == 12) this.cantParciales += 1;
      }
    });
  }

  /** Consulta para cargar información de las solicitudes de materia prima.  */
  consultarFiltros(){
    this.cargando = true;
    this.arrayRegistros = [];
    this.arrayMatPrimas = [];
    let solicitud : number = this.formFiltros.value.documento;
    let fechaInicial : any = moment(this.formFiltros.value.fechaDoc).format('YYYY-MM-DD');
    let fechaFinal : any = moment(this.formFiltros.value.fechaFinalDoc).format('YYYY-MM-DD');
    let estado : any = this.formFiltros.value.estadoDoc;
    let arrayId : any = [];
    let ruta : any = ``;

    if (fechaInicial == 'Invalid date') fechaInicial = null;
    if (fechaFinal == 'Invalid date') fechaFinal = null;
    if(fechaInicial == null) fechaInicial = this.today;
    if(fechaInicial != null && fechaFinal == null) fechaFinal = fechaInicial;

    if(solicitud != null) ruta = `id=${solicitud}`;
    if(estado != null) ruta.length > 0 ? ruta += `&estado=${estado}` : ruta += `estado=${estado}` ;
    ruta.length > 0 ? ruta = `?${ruta}` : ruta = ``;

    this.servicioDtSolicitudesMPExt.GetQuerySolicitudesMp_Extrusion(fechaInicial, fechaFinal, ruta).subscribe(data => {
      if(data.length > 0) {
        for (let index = 0; index < data.length; index++) {
          if(!arrayId.includes(data[index].id)) {
            this.llenarTabla(data[index]);
            arrayId.push(data[index].id);
          }
        }
      } else this.msj.mensajeAdvertencia(`Advertencia`, `No se encontraron resultados de busqueda!`);
    }, error => { this.msj.mensajeError(`Error`, `Error al consultar registros de solicitudes de material`)} );
    setTimeout(() => { this.cargando = false; }, 1500);
  }

  /** Llenar array con los registros del encabezado de las solicitudes de materia prima. */
  llenarTabla(datos : any){
    let info : any = {
      id : datos.id,
      ot : datos.ot,
      fecha : datos.fecha.replace('T00:00:00', ''),
      estadoId : datos.estado,
      estado : datos.nombre_Estado,
    }
    this.arrayRegistros.push(info);
  }

  /** Función para limpiar los campos del formulario */
  limpiarCampos = () => this.formFiltros.reset();

  /** Función para filtrar los registros de la tabla */
  aplicarFiltro = ($event, campo : any, valorCampo : string) => this.dt1!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

  /** Cargar información de la solicitud */
  infoSolicitudPDF(nroSolicitud : number){
    this.informacionPDF = [];
    nroSolicitud = this.solicitudSeleccionada
    this.servicioDtSolicitudesMPExt.GetSolicitudMp_Extrusion(nroSolicitud).subscribe(data => {
      if(data.length > 0) {
        for (let index = 0; index < data.length; index++) {
          this.llenarTablaPDF(data[index]);
        }
        setTimeout(() => { this.generarPDF(data); }, 500);
      } else this.msj.mensajeAdvertencia(`Advertencia`, `No se encontró la solicitud de material N° ${nroSolicitud}`);
    }, error => { this.msj.mensajeError(`Error`, `Error al cargar la información de la solicitud N° ${nroSolicitud}`); });
  }

  /** Cargar tabla de los detalles de la solicitud */
  llenarTablaPDF(datos : any) {
    let info : any = {
      Id : 0,
      Nombre : '',
      Id_Mp : datos.matPrima_Id,
      Id_Tinta : datos.tinta_Id,
      Cantidad : datos.cantidad,
      Stock : 0,
      Und_Medida : datos.medida,
      Proceso : 'EXT',
    }

    if(info.Id_Mp != 84 && info.Id_Tinta == 2001) {
      info.Id = datos.matPrima_Id;
      info.Nombre = datos.matPrima;
      info.Stock = datos.stock_Mp;
    } else if(info.Id_Mp == 84 && info.Id_Tinta != 2001) {
      info.Id = datos.tinta_Id;
      info.Nombre = datos.tinta;
      info.Stock = datos.stock_Tinta;
    }
    this.informacionPDF.push(info);
  }

  // Funcion que se encargará de poner la informcaion en el PDF y generarlo
  generarPDF(datos_solicitud : any){
    let nombre : string = this.AppComponent.storage_Nombre;
    //this.servicioDetlSolMP_Extrusion.getSolicitudMp_Extrusion(this.nroSolicitud).subscribe(datos_solicitud => {
      for (let i = 0; i < datos_solicitud.length; i++) {
        const pdfDefinicion : any = {
          info: {
            title: `Solicitud de material N° ${datos_solicitud[i].id}`
          },
          pageSize: {
            width: 630,
            height: 760
          },
          footer: function(currentPage : any, pageCount : any) {
            return [
              {
                columns: [
                  { text: `Reporte generado por ${nombre}`, alignment: ' left', fontSize: 8, margin: [30, 0, 0, 0] },
                  { text: `Fecha Expedición Documento ${moment().format('YYYY-MM-DD')} - ${moment().format('H:mm:ss')}`, alignment: 'right', fontSize: 8 },
                  { text: `${currentPage.toString() + ' de ' + pageCount}`, alignment: 'right', fontSize: 8, margin: [0, 0, 30, 0] },
                ]
              }
            ]
          },
          watermark: { text: 'Plasticaribe SAS', color: 'red', opacity: 0.05, bold: true, italics: false },
          content : [
            {
              columns: [
                {
                  image : logoParaPdf,
                  width : 220,
                  height : 50
                },
                {
                  text: `Solicitud de material N° ${datos_solicitud[i].id}`,
                  alignment: 'right',
                  style: 'titulo',
                  margin: 12
                }
              ]
            },
            '\n \n',
            {
              style: 'tablaEmpresa',
              table: {
                widths: [90, 167, 75, 181],
                style: 'header',
                body: [
                  [
                    {
                      border: [false, false, false, false],
                      text: `Nombre Empresa`
                    },
                    {
                      border: [false, false, false, true],
                      text: `${datos_solicitud[i].empresa_Nombre}`
                    },
                    {
                      border: [false, false, false, false],
                      text: `Fecha`
                    },
                    {
                      border: [false, false, false, true],
                      text: `${datos_solicitud[i].fecha.replace('T00:00:00', ``)} ${datos_solicitud[i].hora}`
                    },
                  ],
                  [
                    {
                      border: [false, false, false, false],
                      text: `NIT Empresa`
                    },
                    {
                      border: [false, false, false, true],
                      text: `${datos_solicitud[i].empresa_Id}`
                    },
                    {
                      border: [false, false, false, false],
                      text: `Ciudad`
                    },
                    {
                      border: [false, false, false, true],
                      text: `${datos_solicitud[i].empresa_Direccion}`
                    },
                  ],
                  [
                    {
                      border: [false, false, false, false],
                      text: `Dirección`
                    },
                    {
                      border: [false, false, false, true],
                      text: `${datos_solicitud[i].empresa_Direccion}`
                    },
                    {},
                    {}
                  ]
                ]
              },
              layout: {
                defaultBorder: false,
              },
              fontSize: 9,
            },
            '\n \n',
            {
              text: `Usuario: ${datos_solicitud[i].nombre_Usuario}\n`,
              alignment: 'left',
              style: 'header',
            },
            '\n \n',
            {
              text: `\n Materiales de producción solicitados \n `,
              alignment: 'center',
              style: 'header'
            },

            this.table(this.informacionPDF, ['Id', 'Nombre', 'Cantidad', 'Und_Medida', ]),

            {
              style: 'tablaTotales',
              table: {
                widths: ['*', 250, '*', '*'],
                style: 'header',
                body: [
                  [
                    '',
                    {
                      border: [true, false, true, true],
                      text: `Peso Total`,
                      alignment: 'right',
                    },
                    {
                      border: [false, false, true, true],
                      text: `${this.formatonumeros((0).toFixed(2))}`
                    },
                    '',
                  ],
                ]
              },
              layout: { defaultBorder: false, },
              fontSize: 8,
            },
            {
              text: `\n \n Observación sobre la solicitud: \n ${datos_solicitud[i].observacion}\n`,
              style: 'header',
            }
          ],
          styles: {
            header: {
              fontSize: 10,
              bold: true
            },
            titulo: {
              fontSize: 20,
              bold: true
            }
          }
        }
        const pdf = pdfMake.createPdf(pdfDefinicion);
        pdf.open();
        this.nroSolicitud = 0;
        setTimeout(() => this.limpiarCampos(), 1500);
        break;
      }
    //}, () => { this.mensajeService.mensajeError(`Error`, `¡No se pudo obtener la información de la solicitud N° ${this.nroSolicitud}!`); });
  }

  // funcion que se encargará de llenar la tabla en el pdf
  buildTableBody(data : any, columns : any) {
    var body = [];
    body.push(columns);
    data.forEach(function(row) {
      var dataRow = [];
      columns.forEach(function(column) {
        dataRow.push(row[column].toString());
      });
      body.push(dataRow);
    });
    return body;
  }

  // Funcion que genera la tabla donde se mostrará la información
  table(data, columns) {
    return {
      table: {
        headerRows: 1,
        widths: ['*', 250, '*', '*'],
        body: this.buildTableBody(data, columns),
      },
      fontSize: 8,
      layout: {
        fillColor: function (rowIndex) {
          return (rowIndex == 0) ? '#CCCCCC' : null;
        }
      }
    };
  }

  /** Cargar detalles de la solicitud en la segunda tabla. */
  cargarDetalleSolicitud(id : number) {
    this.solicitudSeleccionada = id;
    this.arrayMatPrimas = [];
    this.servicioDtSolicitudesMPExt.GetSolicitudMp_Extrusion(this.solicitudSeleccionada).subscribe(data => {
      for (let index = 0; index < data.length; index++) {
        this.llenarTablaDetalles(data[index]);
      }
    });
  }

  /** Llenar array con los registros de los detalles de las solicitudes de materia prima. */
  llenarTablaDetalles(data : any) {
    let arrayIds : any = [];

    let info : any = {
      Codigo : data.codigo,
      Solicitud : data.id,
      Id : 0,
      Id_Mp: data.matPrima_Id,
      Id_Tinta: data.tinta_Id,
      Nombre : '',
      Cantidad : data.cantidad,
      CantAprobada : 0,
      Und_Medida : data.medida,
      Usuario : data.nombre_Usuario,
      EstadoSolicitud : data.nombre_Estado,
    }
    if (info.Id_Mp != 84) {
      info.Id = info.Id_Mp;
      info.Nombre = data.matPrima;
    } else if (info.Id_Tinta != 2001) {
      info.Id = info.Id_Tinta;
      info.Nombre = data.tinta;
    }

    this.estadoSolicitud = info.EstadoSolicitud;
    this.usuarioSolicitante = info.Usuario;
    arrayIds.push(info.Id)

    this.ServicioDetAsignacionesMp.GetAsignacionesConSolicitudes(this.solicitudSeleccionada).subscribe(data2 => {
      for (let i = 0; i < data2.length; i++) {
        let infoSolicitud : any = {
          Ident : 0,
          Id_Mp: data2[i].matPri_Id,
          Id_Tinta: data2[i].tinta_Id,
          CantSolicitud : data2[i].cantMP
        }
        if (infoSolicitud.Id_Mp != 84) infoSolicitud.Ident = infoSolicitud.Id_Mp;
        else if (infoSolicitud.Id_Tinta != 2001) infoSolicitud.Ident = infoSolicitud.Id_Tinta;

        if(arrayIds.includes(infoSolicitud.Ident)) info.CantAprobada = infoSolicitud.CantSolicitud;
      }
    });

    this.arrayMatPrimas.push(info);
  }

  /** Mostrar mensaje de confirmación al momento de presionar el botón de cancelar solicitud. */
  mostrarEleccion(solicitud_Id : number, palabraClave : string) {
    solicitud_Id = this.solicitudSeleccionada;
    this.clave = palabraClave;
    setTimeout(() => {
      if (this.estadoSolicitud == 'Finalizado' || this.estadoSolicitud == 'Cancelado') this.msj.mensajeAdvertencia(`Advertencia`, `No es posible ${this.clave} solicitudes con estado ${this.estadoSolicitud}!`);
      else this.messageService.add({severity:'warn', key: this.clave, summary:'Elección', detail: `Está seguro que desea ${this.clave} la solicitud N° ${solicitud_Id}?`, sticky: true});
    }, 1000);
  }

  /** Quitar el mensaje que sale luego de presionar si o no, en el mensaje de cancelar solicitud. */
  onReject = () => this.messageService.clear(this.clave);

  /** Función que cancelará una solicitud de materia prima y sus detalles. */
  cancelarFinalizarSolicitud(solicitud_Id : number) {
    this.onReject();
    this.cargando = true;
    solicitud_Id = this.solicitudSeleccionada;

    this.servicioSolicitudesMPExt.GetId(solicitud_Id).subscribe(data => {
      let modelo : modelSolicitudMP_Extrusion = {
        SolMpExt_Id: solicitud_Id,
        SolMpExt_OT: data.solMpExt_OT,
        SolMpExt_Maquina: data.solMpExt_Maquina,
        SolMpExt_Fecha: data.solMpExt_Fecha,
        SolMpExt_Hora: data.solMpExt_Hora,
        SolMpExt_Observacion: data.solMpExt_Observacion,
        Estado_Id: this.clave == 'finalizar' ? 5 : 4,
        Proceso_Id: data.proceso_Id,
        Usua_Id: data.usua_Id
      }
      this.servicioSolicitudesMPExt.Put(modelo.SolMpExt_Id, modelo).subscribe(updateData => {
        this.cargando = false;
        this.msj.mensajeConfirmacion(`Confirmación`, `Estado de la solicitud actualizado exitosamente!`);
        this.getEstadoSolitudes();
        this.consultarFiltros();
       },
      error => this.msj.mensajeError(`Error`, `No fue posible actualizar el encabezado de la solicitud de material N° ${solicitud_Id}`));
   });
  }

  /** Función que cargará el modal de ordenes de compra y allí consultará la solicitud seleccionada. */
  cargarModalCrearAsignacion(){
    if(this.estadoSolicitud == 'Finalizado' || this.estadoSolicitud == 'Cancelado') {
      this.msj.mensajeAdvertencia(`Advertencia`, `No es posible crear asignaciones con base a solicitudes de materia prima con estado ${this.estadoSolicitud}!`);
    } else {
      this.modalAsignacion = true;
      this.AsignacionMatPrima.esSolicitud = true;
      this.AsignacionMatPrima.FormMateriaPrimaRetiro.patchValue({Solicitud : this.solicitudSeleccionada});
      this.AsignacionMatPrima.consultarSolicitudMaterial();
    }
  }

  /** Consultar solicitudes por estado. */
  consultarPorEstado(estado : number){
    this.arrayRegistros = [];
    this.formFiltros.patchValue({estadoDoc : estado});
    this.cargando = true;
    setTimeout(() => {
      this.servicioSolicitudesMPExt.GetUltimas100Solicitudes().subscribe(data => {
        if(data.length > 0) {
          for (let index = 0; index < data.length; index++) {
            if(data[index].estado_Id == estado && data[index].solMpExt_Id != 1) this.llenarTablaConEstados(data[index]);
          }
        }
      });
    }, 500);
    setTimeout(() => { this.cargando = false; }, 1000);
  }

  limpiarTodo(){
    this.formFiltros.reset();
    this.arrayRegistros = [];
    this.arrayMatPrimas = [];
    this.solicitudSeleccionada = 0;
    this.usuarioSolicitante = '';
    this.estadoSolicitud = '';
    this.clave = '';
  }

  /** Llenar la tabla dependiendo el estado seleccionado */
  llenarTablaConEstados(datos : any){
    let info : any = {
      id : datos.solMpExt_Id,
      ot : datos.solMpExt_OT,
      fecha : datos.solMpExt_Fecha.replace('T00:00:00', ''),
      estadoId : datos.estado_Id,
      estado : '',
    }
    if(info.estadoId == 5) info.estado = 'Finalizado';
    if(info.estadoId == 11) info.estado = 'Pendiente';
    if(info.estadoId == 4) info.estado = 'Cancelado';
    if(info.estadoId == 12) info.estado = 'Parcial';

    this.arrayRegistros.push(info);
  }

   // Funcion que va a hacer que se inicie el tutorial in-app
   tutorial(){
    this.shepherdService.defaultStepOptions = defaultStepOptions;
    this.shepherdService.modal = true;
    this.shepherdService.confirmCancel = false;
    this.shepherdService.addSteps(defaultSteps);
    this.shepherdService.start();
  }
}
