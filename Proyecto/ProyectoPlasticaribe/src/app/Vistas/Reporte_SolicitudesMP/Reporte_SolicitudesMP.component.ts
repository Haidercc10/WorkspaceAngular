import { Component, Injectable, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { stepsMovSolicitudesMP as defaultSteps, defaultStepOptions } from 'src/app/data';
import { ShepherdService } from 'angular-shepherd';
import { MessageService } from 'primeng/api';
import { AppComponent } from 'src/app/app.component';
import moment from 'moment';
import { EstadosService } from 'src/app/Servicios/Estados/estados.service';
import { Table } from 'primeng/table';
import { SolicitudMateriaPrimaService } from 'src/app/Servicios/SolicitudMateriaPrima/SolicitudMateriaPrima.service';
import { DetalleSolicitudMateriaPrimaService } from 'src/app/Servicios/DetalleSolicitudMateriaPrima/DetalleSolicitudMateriaPrima.service';
import pdfMake from 'pdfmake/build/pdfmake';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';
import { modelSolicitudMateriaPrima } from 'src/app/Modelo/modelSolicituMateriaPrima';
import { modelDtSolcitudMP } from 'src/app/Modelo/modelDtSolcitudMP';
import { OcompraComponent } from '../ocompra/ocompra.component';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-Reporte_SolicitudesMP',
  templateUrl: './Reporte_SolicitudesMP.component.html',
  styleUrls: ['./Reporte_SolicitudesMP.component.css']
})
export class Reporte_SolicitudesMPComponent implements OnInit {
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
  @ViewChild(OcompraComponent) OrdenCompra : OcompraComponent;
  informacionPDF: any; /** Variable que contendrá la información del PDF */
  arrayMatPrimas : any = []; /** Array que cargará las materias primas de la solicitud seleccionada */
  solicitudSeleccionada : number = 0; /** Nro de la solicitud seleccionada */
  usuarioSolicitante : string = '' /** Variable que contendrá el nombre del usuario que solicitó la materia prima. */
  modalOc : boolean = false; /** Variable que validará que se cargue o no, el componente del modal de ordenes de compras. */
  cantParciales : number = 0; /** Variable que mostrará el número de solicitudes parciales */
  estadoSolicitud : string = ''; /** Variable que servirá para no permitir cancelar solicitudes en estado cancelado o finalizado. */
  clave : string = ''; /** Variable que contendrá una palabra clave ya sea para finalizar o cancelar una solicitud.*/

  constructor(private frmBuilder : FormBuilder,
                  private messageService: MessageService,
                    private shepherdService: ShepherdService,
                      private AppComponent : AppComponent,
                        private servicioEstados : EstadosService,
                          private servicioSolicitudesMP : SolicitudMateriaPrimaService,
                            private servicioDtSolicitudesMP : DetalleSolicitudMateriaPrimaService,
                              private msj : MensajesAplicacionService) {
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

  /** Función que mostrará un tutorial describiendo paso a paso cada funcionalidad de la aplicación */
  verTutorial() {
    this.shepherdService.defaultStepOptions = defaultStepOptions;
    this.shepherdService.modal = true;
    this.shepherdService.confirmCancel = false;
    this.shepherdService.addSteps(defaultSteps);
    this.shepherdService.start();
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

    this.servicioSolicitudesMP.GetTodo().subscribe(data => {
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

    if (fechaInicial == 'Invalid date') fechaInicial = null;
    if (fechaFinal == 'Invalid date') fechaFinal = null;
    if(fechaInicial != null && fechaFinal == null) fechaFinal = fechaInicial;

    if(solicitud != null && estado != null && fechaInicial != null && fechaFinal != null) {
      this.servicioDtSolicitudesMP.GetInfoSolicitud(solicitud).subscribe(data => {
        for (let index = 0; index < data.length; index++) {
          if(!arrayId.includes(data[index].consecutivo) && estado == data[index].estado_Solicitud_Id) {
            this.llenarTabla(data[index]);
            arrayId.push(data[index].consecutivo);
          }
        }
      }, error => { this.msj.mensajeAdvertencia(`Advertencia`, `No se encontraron resultados con los filtros de búsqueda seleccionados`); });
    } else if(solicitud != null && fechaInicial != null && estado != null) {
      this.servicioDtSolicitudesMP.GetInfoSolicitud(solicitud).subscribe(data => {
        for (let index = 0; index < data.length; index++) {
          if(!arrayId.includes(data[index].consecutivo) && estado == data[index].estado_Solicitud_Id) {
            this.llenarTabla(data[index]);
            arrayId.push(data[index].consecutivo);
          }
        }
      }, error => { this.msj.mensajeAdvertencia(`Advertencia`, `No se encontraron resultados con los filtros de búsqueda seleccionados`); });
    } else if(solicitud != null && fechaInicial != null && fechaFinal != null) {
      this.servicioDtSolicitudesMP.GetInfoSolicitud(solicitud).subscribe(data => {
        for (let index = 0; index < data.length; index++) {
          if(!arrayId.includes(data[index].consecutivo)) {
            this.llenarTabla(data[index]);
            arrayId.push(data[index].consecutivo);
          }
        }
      }, error => { this.msj.mensajeAdvertencia(`Advertencia`, `No se encontraron resultados con los filtros de búsqueda seleccionados`); });
    } else if(fechaInicial != null && fechaFinal != null && estado != null) {
      this.servicioSolicitudesMP.getFechasEstado(fechaInicial, fechaFinal, estado).subscribe(data => {
        for (let index = 0; index < data.length; index++) {
          if(!arrayId.includes(data[index].consecutivo)) {
            this.llenarTabla(data[index]);
            arrayId.push(data[index].consecutivo);
          }
        }
      }, error => { this.msj.mensajeAdvertencia(`Advertencia`, `No se encontraron resultados con los filtros de búsqueda seleccionados`); });
    } else if(solicitud != null && fechaInicial != null) {
      this.servicioDtSolicitudesMP.GetInfoSolicitud(solicitud).subscribe(data => {
        for (let index = 0; index < data.length; index++) {
          if(!arrayId.includes(data[index].consecutivo)) {
            this.llenarTabla(data[index]);
            arrayId.push(data[index].consecutivo);
          }
        }
      }, error => { this.msj.mensajeAdvertencia(`Advertencia`, `No se encontraron resultados con los filtros de búsqueda seleccionados`); });
    } else if(solicitud != null && estado != null) {
      this.servicioDtSolicitudesMP.GetInfoSolicitud(solicitud).subscribe(data => {
        for (let index = 0; index < data.length; index++) {
          this.llenarTabla(data[index]);
        }
      }, error => { this.msj.mensajeAdvertencia(`Advertencia`, `No se encontraron resultados con los filtros de búsqueda seleccionados`); });
    } else if(fechaInicial != null && fechaFinal != null) {
      this.servicioSolicitudesMP.getFechas(fechaInicial, fechaFinal).subscribe(data => {
        for (let index = 0; index < data.length; index++) {
          if(!arrayId.includes(data[index].consecutivo)) {
            this.llenarTabla(data[index]);
            arrayId.push(data[index].consecutivo);
          }
        }
      }, error => { this.msj.mensajeAdvertencia(`Advertencia`, `No se encontraron resultados con los filtros de búsqueda seleccionados`); });
    } else if(fechaInicial != null && estado != null) {
      this.servicioSolicitudesMP.getFechasEstado(fechaInicial, fechaInicial, estado).subscribe(data => {
        for (let index = 0; index < data.length; index++) {
          if(!arrayId.includes(data[index].consecutivo)) {
            this.llenarTabla(data[index]);
            arrayId.push(data[index].consecutivo);
          }
        }
      }, error => { this.msj.mensajeAdvertencia(`Advertencia`, `No se encontraron resultados con los filtros de búsqueda seleccionados`); });
    } else if(solicitud != null) {
      this.servicioDtSolicitudesMP.GetInfoSolicitud(solicitud).subscribe(data => {
        for (let index = 0; index < data.length; index++) {
          if(!arrayId.includes(data[index].consecutivo)) {
            this.llenarTabla(data[index]);
            arrayId.push(data[index].consecutivo);
          }
        }
      }, error => { this.msj.mensajeAdvertencia(`Advertencia`, `No se encontraron resultados con los filtros de búsqueda seleccionados`); });
    } else if(estado != null) {
      this.servicioSolicitudesMP.getEstados(estado).subscribe(data => {
        for (let index = 0; index < data.length; index++) {
          if(!arrayId.includes(data[index].consecutivo)) {
            this.llenarTabla(data[index]);
            arrayId.push(data[index].consecutivo);
          }
        }
      }, error => { this.msj.mensajeAdvertencia(`Advertencia`, `No se encontraron resultados con los filtros de búsqueda seleccionados`); });
    } else if(fechaInicial != null) {
      this.servicioSolicitudesMP.getFechas(fechaInicial, fechaInicial).subscribe(data => {
        for (let index = 0; index < data.length; index++) {
          if(!arrayId.includes(data[index].consecutivo)) {
            this.llenarTabla(data[index]);
            arrayId.push(data[index].consecutivo);
          }
        }
      }, error => { this.msj.mensajeAdvertencia(`Advertencia`, `No se encontraron resultados con los filtros de búsqueda seleccionados`); });
    } else {
      this.servicioSolicitudesMP.getFechas(this.today, this.today).subscribe(data => {
        for (let index = 0; index < data.length; index++) {
          if(!arrayId.includes(data[index].consecutivo)) {
            this.llenarTabla(data[index]);
            arrayId.push(data[index].consecutivo);
          }
        }
      }, error => { this.msj.mensajeAdvertencia(`Advertencia`, `No se encontraron resultados con los filtros de búsqueda seleccionados`); });
    }
    setTimeout(() => { this.cargando = false; }, 1500);
  }

  /** Llenar array con los registros del encabezado de las solicitudes de materia prima. */
  llenarTabla(datos : any){
    let info : any = {
      id : datos.consecutivo,
      fecha : datos.fecha.replace('T00:00:00', ''),
      estado : datos.estado_Solicitud,
    }
    this.arrayRegistros.push(info);
  }

  /** Función para limpiar los campos del formulario */
  limpiarCampos = () => this.formFiltros.reset();

  /** Función para filtrar los registros de la tabla */
  aplicarFiltro = ($event, campo : any, valorCampo : string) => this.dt1!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

  // Funcion que va a consultar los detalles del pdf
  llenarInfoPdf(solicitud_Id : number = 0){
    solicitud_Id = this.solicitudSeleccionada;
    this.informacionPDF = [];
    this.cargando = true;
    if (solicitud_Id == 0) solicitud_Id = parseInt(this.formFiltros.value.documento);
    this.servicioDtSolicitudesMP.GetInfoSolicitud(solicitud_Id).subscribe(data => {
      for (let i = 0; i < data.length; i++) {
        let info : any = {
          Id : 0,
          Id_Mp: data[i].mP_Id,
          Id_Tinta: data[i].tinta_Id,
          Id_Bopp: data[i].bopp_Id,
          Nombre : '',
          Cantidad : this.formatonumeros(data[i].cantidad),
          Medida : data[i].unidad_Medida,
          Estado : data[i].estado_MP,
        }
        if (info.Id_Mp != 84) {
          info.Id = info.Id_Mp;
          info.Nombre = data[i].mp;
        } else if (info.Id_Tinta != 2001) {
          info.Id = info.Id_Tinta;
          info.Nombre = data[i].tinta;
        } else if (info.Id_Bopp != 1) {
          info.Id = info.Id_Bopp;
          info.Nombre = data[i].bopp;
        }
        this.informacionPDF.push(info);
        this.informacionPDF.sort((a,b) => a.Nombre.localeCompare(b.Nombre));
      }
      setTimeout(() => {this.generarPDF(solicitud_Id); }, 1000);
    }, error => this.msj.mensajeError(`Error`, `No se encontró información sobre la solicitud N° ${solicitud_Id}!`));
  }

  // Funcion que va a crear un pdf de las solicitudes de materia prima
  generarPDF(solicitud_Id : number){
    let nombre : string = this.storage_Nombre;
    this.servicioDtSolicitudesMP.GetInfoSolicitud(solicitud_Id).subscribe(data => {
      for (let i = 0; i < data.length; i++) {
        const pdfDefinicion : any = {
          info: {
            title: `Solicitud de Materia Prima N° ${data[i].consecutivo}`
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
          watermark: { text: 'PLASTICARIBE SAS', color: 'red', opacity: 0.05, bold: true, italics: false },
          content : [
            {
              columns: [
                {
                  image : logoParaPdf,
                  width : 220,
                  height : 50,
                  margin : [0, 20]
                },
                {
                  text: `Solicitud de Mat. Prima N° ${data[i].consecutivo}`,
                  alignment: 'right',
                  style: 'titulo',
                  margin: 30
                }
              ]
            },
            '\n \n',
            {
              style: 'tablaEmpresa',
              table: {
                widths: [90, 167, 90, 166],
                style: 'header',
                body: [
                  [
                    {
                      border: [false, false, false, false],
                      text: `Nombre Empresa`
                    },
                    {
                      border: [false, false, false, true],
                      text: `${data[i].empresa}`
                    },
                    {
                      border: [false, false, false, false],
                      text: `Fecha`
                    },
                    {
                      border: [false, false, false, true],
                      text: `${data[i].fecha.replace('T00:00:00', ``)} ${data[i].hora}`
                    },
                  ],
                  [
                    {
                      border: [false, false, false, false],
                      text: `NIT Empresa`
                    },
                    {
                      border: [false, false, false, true],
                      text: `${data[i].empresa_Id}`
                    },
                    {
                      border: [false, false, false, false],
                      text: `Ciudad`
                    },
                    {
                      border: [false, false, false, true],
                      text: `${data[i].empresa_Ciudad}`
                    },
                  ],
                  [
                    {
                      border: [false, false, false, false],
                      text: `Dirección`
                    },
                    {
                      border: [false, false, false, true],
                      text: `${data[i].empresa_Direccion}`
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
              text: `Usuario: ${data[i].usuario}\n`,
              alignment: 'left',
              style: 'header',
            },
            '\n',
            {
              text: `Estado Solicitud: ${data[i].estado_Solicitud}\n`,
              alignment: 'left',
              style: 'header',
            },
            '\n \n',
            {
              text: `\n\n Información detallada de la(s) Materia(s) Prima(s) \n `,
              alignment: 'center',
              style: 'header'
            },

            this.table(this.informacionPDF, ['Id', 'Nombre', 'Cantidad', 'Medida', 'Estado']),

            {
              text: `\n \nObservación sobre la Solicitud: \n ${data[i].observacion}\n`,
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
        this.cargando = false;
        break;
      }
    }, error => this.msj.mensajeError(`Error`, `No se encontró información sobre la solicitud N° ${solicitud_Id}!`));
  }

  // funcion que se encagará de llenar la tabla de los productos en el pdf
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

  // Funcion que genera la tabla donde se mostrará la información de los productos pedidos
  table(data, columns) {
    return {
      table: {
        headerRows: 1,
        widths: [60, 247, 60, 60, 70],
        body: this.buildTableBody(data, columns),
      },
      fontSize: 8,
      layout: {
        fillColor: function (rowIndex, node, columnIndex) {
          return (rowIndex == 0) ? '#CCCCCC' : null;
        }
      }
    };
  }

  /** Cargar detalles de la solicitud en la segunda tabla. */
  cargarDetalleSolicitud(id : number) {
    this.solicitudSeleccionada = id;
    this.arrayMatPrimas = [];
    this.servicioDtSolicitudesMP.GetInfoSolicitud(this.solicitudSeleccionada).subscribe(data => {
      for (let index = 0; index < data.length; index++) {
        this.llenarTablaDetalles(data[index]);
      }
    });
  }

  /** Llenar array con los registros de los detalles de las solicitudes de materia prima. */
  llenarTablaDetalles(data : any) {
    let arrayIds : any = [];
    let arrayOc : any = [];

    let info : any = {
      Codigo : data.codigo,
      Solicitud : data.consecutivo,
      Id : 0,
      Id_Mp: data.mP_Id,
      Id_Tinta: data.tinta_Id,
      Id_Bopp: data.bopp_Id,
      Nombre : '',
      Cantidad : data.cantidad,
      CantAprobada : 0,
      Medida : data.unidad_Medida,
      Estado : data.estado_MP,
      Usuario : data.usuario,
      EstadoSolicitud : data.estado_Solicitud,
    }
    if (info.Id_Mp != 84) {
      info.Id = info.Id_Mp;
      info.Nombre = data.mp;
    } else if (info.Id_Tinta != 2001) {
      info.Id = info.Id_Tinta;
      info.Nombre = data.tinta;
    } else if (info.Id_Bopp != 1) {
      info.Id = info.Id_Bopp;
      info.Nombre = data.bopp;
    }
    this.estadoSolicitud = info.EstadoSolicitud;
    this.usuarioSolicitante = info.Usuario;
    arrayIds.push(info.Id)

    this.servicioDtSolicitudesMP.getRelacionSolicitudesMp_Oc(this.solicitudSeleccionada).subscribe(data2 => {
      for (let i = 0; i < data2.length; i++) {
        let infoOc : any = { Ident : 0, Id_Mp: data2[i].idMatPrima, Id_Tinta: data2[i].idTinta, Id_Bopp: data2[i].idBopp, CantidadOc : data2[i].cantidad }

        if (infoOc.Id_Mp != 84) infoOc.Ident = infoOc.Id_Mp;
        else if (infoOc.Id_Tinta != 2001) infoOc.Ident = infoOc.Id_Tinta;
        else if (infoOc.Id_Bopp != 1) infoOc.Ident = infoOc.Id_Bopp;

        if(arrayIds.includes(infoOc.Ident)) info.CantAprobada = infoOc.CantidadOc;
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

    this.servicioSolicitudesMP.Get_Id(solicitud_Id).subscribe(data => {
      let modelo : modelSolicitudMateriaPrima = {
        Solicitud_Id : solicitud_Id,
        Usua_Id: data.usua_Id,
        Solicitud_Observacion: data.solicitud_Observacion,
        Solicitud_Fecha: data.solicitud_Fecha,
        Solicitud_Hora: data.solicitud_Hora,
        Estado_Id: this.clave == 'finalizar' ? 5 : 4
      }
      this.servicioSolicitudesMP.Put(solicitud_Id, modelo).subscribe(updateData => this.cancelarFinalizarDtlSolicitud(),
      error => this.msj.mensajeError(`¡Error!`, `No fue posible actualizar el encabezado de la solicitud N° ${solicitud_Id}`));
   });
  }

  /** Función que servirá para cancelar los detalles de la solicitud, excepto los que sean diferentes de pendientes */
  cancelarFinalizarDtlSolicitud(){
    let error : boolean = false;
    for (let i = 0; i < this.arrayMatPrimas.length; i++) {
      let modelo : modelDtSolcitudMP = {
        DtSolicitud_Id : this.arrayMatPrimas[i].Codigo,
        Solicitud_Id: this.arrayMatPrimas[i].Solicitud,
        MatPri_Id: this.arrayMatPrimas[i].Id_Mp,
        Tinta_Id: this.arrayMatPrimas[i].Id_Tinta,
        Bopp_Id: this.arrayMatPrimas[i].Id_Bopp,
        DtSolicitud_Cantidad: this.arrayMatPrimas[i].Cantidad,
        UndMed_Id: this.arrayMatPrimas[i].Medida,
        Estado_Id: this.arrayMatPrimas[i].Estado
      }
      if(this.arrayMatPrimas[i].Estado == 'Parcial') {
        modelo.Estado_Id = 5
        this.servicioDtSolicitudesMP.Put(this.arrayMatPrimas[i].Codigo, modelo).subscribe(updateData =>  error = false, err => {
          this.msj.mensajeError(`¡Error!`, `No fue posible actualizar el detalle de la solicitud N° ${this.arrayMatPrimas.Solicitud}`);
          error = true;
        });
      } else if(this.arrayMatPrimas[i].Estado == 'Pendiente') {
        modelo.Estado_Id = 4
        this.servicioDtSolicitudesMP.Put(this.arrayMatPrimas[i].Codigo, modelo).subscribe(updateData => error = false, err => {
          this.msj.mensajeError(`¡Error!`, `No fue posible actualizar el detalle de la solicitud N° ${this.arrayMatPrimas.Solicitud}`);
          error = true;
        });
      }
    }
    setTimeout(() => {
      if(!error) {
        this.cargando = false;
        this.msj.mensajeConfirmacion(`Confirmación`, `Estado de la solicitud actualizado exitosamente!`);
        this.getEstadoSolitudes();
        this.consultarFiltros();
      }
    }, 1000);
  }

  /** Función que cargará el modal de ordenes de compra y allí consultará la solicitud seleccionada. */
  cargarModalCrearOrden(){
    if(this.estadoSolicitud == 'Finalizado' || this.estadoSolicitud == 'Cancelado') {
      this.msj.mensajeAdvertencia(`Advertencia`, `No es posible crear ordenes de compras con base a solicitudes de materia prima con estado ${this.estadoSolicitud}!`);
    } else {
      this.modalOc = true;
      this.OrdenCompra.solicitud = true;
      this.OrdenCompra.FormOrdenCompra.patchValue({Solicitud : this.solicitudSeleccionada});
      this.OrdenCompra.consultarSolicitudMP();
    }
  }

  /** Consultar solicitudes por estado. */
  consultarPorEstado(estado : number){
    this.OrdenCompra.FormOrdenCompra.patchValue({estadoDoc : estado});
    this.consultarFiltros();
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
}
