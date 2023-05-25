import { Component, Injectable, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { stepsMovMaquilas as defaultSteps, defaultStepOptions } from 'src/app/data';
import { ShepherdService } from 'angular-shepherd';
import { MessageService } from 'primeng/api';
import { AppComponent } from 'src/app/app.component';
import moment from 'moment';
import { EstadosService } from 'src/app/Servicios/Estados/estados.service';
import { Table } from 'primeng/table';
import { SolicitudMateriaPrimaService } from 'src/app/Servicios/SolicitudMateriaPrima/SolicitudMateriaPrima.service';
import { DetalleSolicitudMateriaPrimaService } from 'src/app/Servicios/DetalleSolicitudMateriaPrima/DetalleSolicitudMateriaPrima.service';
import { SolicitudMateriaPrimaComponent } from '../Solicitud-Materia-Prima/Solicitud-Materia-Prima.component';
import pdfMake from 'pdfmake/build/pdfmake';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';
import { modelSolicitudMateriaPrima } from 'src/app/Modelo/modelSolicituMateriaPrima';
import { modelDtSolcitudMP } from 'src/app/Modelo/modelDtSolcitudMP';
import { OcompraComponent } from '../ocompra/ocompra.component';

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
  cantAceptadas : number = 0; /** Variable que mostrará el número de solicitudes aceptadas */
  cantFinalizadas : number = 0; /** Variable que mostrará el número de solicitudes finalizadas */
  cantCanceladas : number = 0; /** Variable que mostrará el número de solicitudes canceladas */
  @ViewChild(OcompraComponent) OrdenCompra : OcompraComponent;
  informacionPDF: any;
  arrayMatPrimas : any = []; /** Array que cargará las materias primas de la solicitud seleccionada */
  solicitudSeleccionada : number = 0; /** Nro de la solicitud seleccionada */
  usuarioSolicitante : string = ''
  modalOc : boolean = false;


  constructor(private frmBuilder : FormBuilder,
                  private messageService: MessageService,
                    private shepherdService: ShepherdService,
                      private AppComponent : AppComponent,
                        private servicioEstados : EstadosService,
                          private servicioSolicitudesMP : SolicitudMateriaPrimaService,
                            private servicioDtSolicitudesMP : DetalleSolicitudMateriaPrimaService) {
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
      for (let i = 0; i < datos_estados.length; i++) {
        if (datos_estados[i].estado_Id == 11 || datos_estados[i].estado_Id == 5 || datos_estados[i].estado_Id == 4 || datos_estados[i].estado_Id == 26) this.estados.push(datos_estados[i]);
      }
    });
  }

  /** Función que mostrará el numero de solicitudes por estado. */
  getEstadoSolitudes(){
    this.cantPendientes = 0;
    this.cantAceptadas = 0;
    this.cantFinalizadas = 0;
    this.cantCanceladas = 0;

    this.servicioSolicitudesMP.GetTodo().subscribe(data => {
      for (let index = 0; index < data.length; index++) {
        if(data[index].estado_Id == 11) this.cantPendientes += 1;
        if(data[index].estado_Id == 26) this.cantAceptadas += 1;
        if(data[index].estado_Id == 5) this.cantFinalizadas += 1;
        if(data[index].estado_Id == 4) this.cantCanceladas += 1;
      }
    });
  }

  /** Consulta para cargar información de las solicitudes de materia prima.  */
  consultarFiltros(){
    this.cargando = true;
    this.arrayRegistros = [];
    let solicitud : number = this.formFiltros.value.documento;
    let fechaInicial : any = moment(this.formFiltros.value.fechaDoc).format('YYYY-MM-DD');
    let fechaFinal : any = moment(this.formFiltros.value.fechaFinalDoc).format('YYYY-MM-DD');
    let estado : any = this.formFiltros.value.estadoDoc;
    let tamanoConsulta : number = 0;
    let arrayId : any = [];

    if (fechaInicial == 'Invalid date') fechaInicial = null;
    if (fechaFinal == 'Invalid date') fechaFinal = null;
    if(fechaInicial != null && fechaFinal == null) fechaFinal = fechaInicial;

    if(solicitud != null && estado != null && fechaInicial != null && fechaFinal != null) {
      this.servicioDtSolicitudesMP.GetInfoSolicitud(solicitud).subscribe(data => {
        tamanoConsulta = data.length;
        for (let index = 0; index < data.length; index++) {
          if(!arrayId.includes(data[index].consecutivo) && estado == data[index].estado_Solicitud_Id) {
            this.llenarTabla(data[index]);
            arrayId.push(data[index].consecutivo);
          }
        }
      });
    } else if(solicitud != null && fechaInicial != null && estado != null) {
      this.servicioDtSolicitudesMP.GetInfoSolicitud(solicitud).subscribe(data => {
        tamanoConsulta = data.length;
        for (let index = 0; index < data.length; index++) {
          if(!arrayId.includes(data[index].consecutivo) && estado == data[index].estado_Solicitud_Id) {
            this.llenarTabla(data[index]);
            arrayId.push(data[index].consecutivo);
          }
        }
      });
    } else if(solicitud != null && fechaInicial != null && fechaFinal != null) {
      this.servicioDtSolicitudesMP.GetInfoSolicitud(solicitud).subscribe(data => {
        tamanoConsulta = data.length;
        for (let index = 0; index < data.length; index++) {
          if(!arrayId.includes(data[index].consecutivo)) {
            this.llenarTabla(data[index]);
            arrayId.push(data[index].consecutivo);
          }
        }
      });
    } else if(fechaInicial != null && fechaFinal != null && estado != null) {
      this.servicioSolicitudesMP.getFechasEstado(fechaInicial, fechaFinal, estado).subscribe(data => {
        tamanoConsulta = data.length;
        for (let index = 0; index < data.length; index++) {
          if(!arrayId.includes(data[index].consecutivo)) {
            this.llenarTabla(data[index]);
            arrayId.push(data[index].consecutivo);
          }
        }
      });
    } else if(solicitud != null && fechaInicial != null) {
      this.servicioDtSolicitudesMP.GetInfoSolicitud(solicitud).subscribe(data => {
        tamanoConsulta = data.length;
        for (let index = 0; index < data.length; index++) {
          if(!arrayId.includes(data[index].consecutivo)) {
            this.llenarTabla(data[index]);
            arrayId.push(data[index].consecutivo);
          }
        }
      });

    } else if(solicitud != null && estado != null) {
      this.servicioDtSolicitudesMP.GetInfoSolicitud(solicitud).subscribe(data => {
        tamanoConsulta = data.length;
        for (let index = 0; index < data.length; index++) {
          this.llenarTabla(data[index]);
        }
      });
    } else if(fechaInicial != null && fechaFinal != null) {
      this.servicioSolicitudesMP.getFechas(fechaInicial, fechaFinal).subscribe(data => {
        tamanoConsulta = data.length;
        for (let index = 0; index < data.length; index++) {
          if(!arrayId.includes(data[index].consecutivo)) {
            this.llenarTabla(data[index]);
            arrayId.push(data[index].consecutivo);
          }
        }
      });
    } else if(fechaInicial != null && estado != null) {
      this.servicioSolicitudesMP.getFechasEstado(fechaInicial, fechaInicial, estado).subscribe(data => {
        tamanoConsulta = data.length;
        for (let index = 0; index < data.length; index++) {
          if(!arrayId.includes(data[index].consecutivo)) {
            this.llenarTabla(data[index]);
            arrayId.push(data[index].consecutivo);
          }
        }
      });
    } else if(solicitud != null) {
      this.servicioDtSolicitudesMP.GetInfoSolicitud(solicitud).subscribe(data => {
        tamanoConsulta = data.length;
        for (let index = 0; index < data.length; index++) {
          if(!arrayId.includes(data[index].consecutivo)) {
            this.llenarTabla(data[index]);
            arrayId.push(data[index].consecutivo);
          }
        }
      });
    } else if(estado != null) {
      this.servicioSolicitudesMP.getEstados(estado).subscribe(data => {
        tamanoConsulta = data.length;
        for (let index = 0; index < data.length; index++) {
          if(!arrayId.includes(data[index].consecutivo)) {
            this.llenarTabla(data[index]);
            arrayId.push(data[index].consecutivo);
          }
        }
      });
    } else if(fechaInicial != null) {
      this.servicioSolicitudesMP.getFechas(fechaInicial, fechaInicial).subscribe(data => {
        tamanoConsulta = data.length;
        for (let index = 0; index < data.length; index++) {
          if(!arrayId.includes(data[index].consecutivo)) {
            this.llenarTabla(data[index]);
            arrayId.push(data[index].consecutivo);
          }
        }
      });
    } else {
      this.servicioSolicitudesMP.getFechas(this.today, this.today).subscribe(data => {
        tamanoConsulta = data.length;
        for (let index = 0; index < data.length; index++) {
          if(!arrayId.includes(data[index].consecutivo)) {
            this.llenarTabla(data[index]);
            arrayId.push(data[index].consecutivo);
          }
        }
      });
    }
    console.log(tamanoConsulta);
    setTimeout(() => { this.cargando = false; }, 1500);
  }

  /** Función para limpiar los campos del formulario */
  limpiarCampos() {
    this.formFiltros.reset();
  }

  aplicarFiltro($event, campo : any, valorCampo : string) {
    this.dt1!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);
  }

  /** Llenar array con los registros del encabezado de las solicitudes de materia prima. */
  llenarTabla(datos : any) {
    let solicitudes : any = {
      id : datos.consecutivo,
      fecha : datos.fecha.replace('T00:00:00', ''),
      estado : datos.estado_Solicitud,
    }
    this.arrayRegistros.push(solicitudes);
    console.log(this.arrayRegistros);
  }

   /** Mostrar mensaje de confirmación  */
  mostrarConfirmacion(mensaje : any, titulo?: any) {
   this.messageService.add({severity: 'success', summary: mensaje, detail: titulo, life : 2000});
  }

  /** Mostrar mensaje de error  */
  mostrarError(mensaje : any, titulo?: any) {
   this.messageService.add({severity:'error', summary: mensaje, detail: titulo , life : 5000});
  }

  /** Mostrar mensaje de advertencia */
  mostrarAdvertencia(mensaje : any, titulo?: any) {
   this.messageService.add({severity:'warn', summary: mensaje, detail: titulo , life : 2000});
  }

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
    }, error => this.mostrarError(`Error`, `No se encontró información sobre la solicitud N° ${solicitud_Id}!`));
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
    }, error => this.mostrarError(`Error`, `No se encontró información sobre la solicitud N° ${solicitud_Id}!`));
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
    this.arrayMatPrimas = [];
    this.solicitudSeleccionada = id;

    this.servicioDtSolicitudesMP.GetInfoSolicitud(this.solicitudSeleccionada).subscribe(data => {
      for (let index = 0; index < data.length; index++) {
        this.llenarTablaDetalles(data[index]);
      }
    })
  }

  /** Llenar array con los registros de los detalles de las solicitudes de materia prima. */
  llenarTablaDetalles(data : any) {
    let info : any = {
      Codigo : data.codigo,
      Solicitud : data.consecutivo,
      Id : 0,
      Id_Mp: data.mP_Id,
      Id_Tinta: data.tinta_Id,
      Id_Bopp: data.bopp_Id,
      Nombre : '',
      Cantidad : data.cantidad,
      Medida : data.unidad_Medida,
      Estado : data.estado_MP,
      Usuario : data.usuario
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
    this.usuarioSolicitante = info.Usuario;
    this.arrayMatPrimas.push(info);
  }

  mostrarEleccion(solicitud_Id : number) {
    solicitud_Id = this.solicitudSeleccionada;
    this.messageService.add({severity:'warn', key:'eleccion', summary:'Elección', detail: `Está seguro que desea cancelar la solicitud N° ${solicitud_Id}?`, sticky: true});
  }

  onReject(){
    this.messageService.clear('eleccion');
  }

  cancelarSolicitud(solicitud_Id : number) {
    this.onReject();
    solicitud_Id = this.solicitudSeleccionada;

    this.servicioSolicitudesMP.Get_Id(solicitud_Id).subscribe(data => {
      let modelo : modelSolicitudMateriaPrima = {
        Solicitud_Id : solicitud_Id,
        Usua_Id: data.usua_Id,
        Solicitud_Observacion: data.solicitud_Observacion,
        Solicitud_Fecha: data.solicitud_Fecha,
        Solicitud_Hora: data.solicitud_Hora,
        Estado_Id: 4
      }
      console.log(modelo)
      console.log('----------')
      this.servicioSolicitudesMP.Put(solicitud_Id, modelo).subscribe(updateData => {
        this.cancelarDtlSolicitud();
      },error => this.mostrarError(`No fue posible actualizar el encabezado de la solicitud N° ${solicitud_Id}`));
   });
  }

  cancelarDtlSolicitud(){
    for (let i = 0; i < this.arrayMatPrimas.length; i++) {
      this.servicioDtSolicitudesMP.GetInfoSolicitud(this.arrayMatPrimas[i].Solicitud).subscribe(dataDtSolicitud => {
        let modelo : modelDtSolcitudMP = {
          DtSolicitud_Id : this.arrayMatPrimas[i].Codigo,
          Solicitud_Id: this.arrayMatPrimas[i].Solicitud,
          MatPri_Id: this.arrayMatPrimas[i].Id_Mp,
          Tinta_Id: this.arrayMatPrimas[i].Id_Tinta,
          Bopp_Id: this.arrayMatPrimas[i].Id_Bopp,
          DtSolicitud_Cantidad: this.arrayMatPrimas[i].Cantidad,
          UndMed_Id: this.arrayMatPrimas[i].Medida,
          Estado_Id: 4
        }
        console.log(modelo);
        this.servicioDtSolicitudesMP.Put(this.arrayMatPrimas[i].Codigo, modelo).subscribe(updateData => {
          this.mostrarConfirmacion(`Confirmación`, `Solicitud cancelada exitosamente!`);
          this.getEstadoSolitudes();
        },error => this.mostrarError(`No fue posible actualizar el detalle de la solicitud N° ${this.arrayMatPrimas.Solicitud}`));
      });
    }
  }

  /** Función que cargará el modal de ordenes de compra y allí consultará la solicitud seleccionada. */
  cargarModalCrearOrden(){
    this.modalOc = true;
    this.OrdenCompra.solicitud = true;

    this.OrdenCompra.FormOrdenCompra.patchValue({
      Solicitud : this.solicitudSeleccionada
    });
    this.OrdenCompra.consultarSolicitudMP();
  }
}
