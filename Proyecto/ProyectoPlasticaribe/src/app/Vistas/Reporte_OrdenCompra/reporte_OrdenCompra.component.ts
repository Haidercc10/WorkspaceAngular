import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import pdfMake from 'pdfmake/build/pdfmake';
import { Table } from 'primeng/table';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';
import { DetallesOrdenesCompraService } from 'src/app/Servicios/DetallesOrdenCompra/DetallesOrdenesCompra.service';
import { EstadosService } from 'src/app/Servicios/Estados/estados.service';
import { OcompraComponent } from '../ocompra/ocompra.component';
import { AppComponent } from 'src/app/app.component';
import { stepsMovOrdenCompra as defaultSteps, defaultStepOptions } from 'src/app/data';
import { ShepherdService } from 'angular-shepherd';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';

@Component({
  selector: 'app-reporte_OrdenCompra',
  templateUrl: './reporte_OrdenCompra.component.html',
  styleUrls: ['./reporte_OrdenCompra.component.css']
})
export class Reporte_OrdenCompraComponent implements OnInit {

  public FormConsultarFiltros !: FormGroup;
  cargando : boolean = false; //Variable para validar que salga o no la imagen de carga
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol
  estados : any [] = []; //Variable que almacenará los estados que pueden tener las ordenes de compra de materia prima
  registrosConsultados : any [] = []; //Variable que va a almacenar los diferentes registros consultados
  datosPdf : any [] = []; //variable que va a almacenar la informacion de la orden de compra consultada

  // Editar Orden de Compra
  @ViewChild(OcompraComponent)  EditarOrdenCompra : OcompraComponent;
  mostrarModal : boolean = false; //Variable que va a mostrar o no, el modal para editar ordenes de compra
  numeroOrdenCompra : number = 0; //Variable que va a almcenar el numero de la orden de compra que se desea editar
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro

  constructor(private frmBuilder : FormBuilder,
                private AppComponent : AppComponent,
                  private estadosService : EstadosService,
                    private dtOrdenCompraService : DetallesOrdenesCompraService,
                        private shepherdService: ShepherdService,
                          private msj : MensajesAplicacionService) {

    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
    this.FormConsultarFiltros = this.frmBuilder.group({
      Documento : [null, Validators.required],
      fechaDoc: [null, Validators.required],
      fechaFinalDoc: [null, Validators.required],
      estadoDoc: [null, Validators.required],
    });
  }

  ngOnInit() {
    this.lecturaStorage();
    this.obtenerEstados();
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

  // Funcion que va a consultar y almacenar los estados que pueden tener las ordenes de compra
  obtenerEstados(){
    this.estadosService.srvObtenerListaEstados().subscribe(datos_estados => {
      for (let i = 0; i < datos_estados.length; i++) {
        if (datos_estados[i].estado_Id == 11 || datos_estados[i].estado_Id == 5 || datos_estados[i].estado_Id == 3 || datos_estados[i].estado_Id == 12) this.estados.push(datos_estados[i]);
      }
    });
  }

  // funcion que limpiará todo
  limpiarCampos(){
    this.cargando = false;
    this.FormConsultarFiltros.reset();
    this.datosPdf = [];
    this.registrosConsultados = [];
  }

  // funcion que va a consultar los filtros utilizados para traer ka informacion
  consultarFiltros(){
    this.cargando = true;
    this.registrosConsultados = [];
    let ocConsultadas : number [] = [];
    let size_query : number;
    let oc : number = this.FormConsultarFiltros.value.Documento;
    let fechaInicial : any = moment(this.FormConsultarFiltros.value.fechaDoc).format('YYYY-MM-DD');
    let fechaFinal : any = moment(this.FormConsultarFiltros.value.fechaFinalDoc).format('YYYY-MM-DD');
    let estado : any = this.FormConsultarFiltros.value.estadoDoc;

    if (fechaInicial == 'Invalid date') fechaInicial = null;
    if (fechaFinal == 'Invalid date') fechaFinal = null;

    if (oc != null && fechaFinal != null && fechaInicial != null && estado != null) {
      this.dtOrdenCompraService.GetOrdenCompra(oc).subscribe(datos_orden => {
        size_query = datos_orden.length;
        for (let i = 0; i < datos_orden.length; i++) {
          if (!ocConsultadas.includes(datos_orden[i].consecutivo)) this.llenarTabla(datos_orden[i]);
          ocConsultadas.push(datos_orden[i].consecutivo);
        }
      }, error => { this.msj.mensajeError(`Error`, `¡No se pudo encontrar información con los filtros consultados!`); });
    } else if (oc != null && fechaFinal != null && fechaInicial) {
      this.dtOrdenCompraService.GetOrdenCompra(oc).subscribe(datos_orden => {
        size_query = datos_orden.length;
        for (let i = 0; i < datos_orden.length; i++) {
          if (!ocConsultadas.includes(datos_orden[i].consecutivo)) this.llenarTabla(datos_orden[i]);
          ocConsultadas.push(datos_orden[i].consecutivo);
        }
      }, error => { this.msj.mensajeError(`Error`, `¡No se pudo encontrar información con los filtros consultados!`); });
    } else if (oc != null && fechaInicial != null && estado != null) {
      this.dtOrdenCompraService.GetOrdenCompra(oc).subscribe(datos_orden => {
        size_query = datos_orden.length;
        for (let i = 0; i < datos_orden.length; i++) {
          if (datos_orden[i].estado_Id == estado && datos_orden[i].fecha == fechaInicial) if (!ocConsultadas.includes(datos_orden[i].consecutivo)) this.llenarTabla(datos_orden[i]);
          ocConsultadas.push(datos_orden[i].consecutivo);
        }
      }, error => { this.msj.mensajeError(`Error`, `¡No se pudo encontrar información con los filtros consultados!`); });
    } else if (fechaFinal != null && fechaInicial != null && estado != null) {
      this.dtOrdenCompraService.GetOrdenCompra_EstadoFechas(estado, fechaInicial, fechaFinal).subscribe(datos_orden => {
        size_query = datos_orden.length;
        for (let i = 0; i < datos_orden.length; i++) {
          if (!ocConsultadas.includes(datos_orden[i].consecutivo)) this.llenarTabla(datos_orden[i]);
          ocConsultadas.push(datos_orden[i].consecutivo);
        }
      }, error => { this.msj.mensajeError(`Error`, `¡No se pudo encontrar información con los filtros consultados!`); });
    } else if (oc != null && fechaInicial != null) {
      this.dtOrdenCompraService.GetOrdenCompra(oc).subscribe(datos_orden => {
        size_query = datos_orden.length;
        for (let i = 0; i < datos_orden.length; i++) {
          if (datos_orden[i].fecha == fechaInicial) this.llenarTabla(datos_orden)[i];
        }
      }, error => { this.msj.mensajeError(`Error`, `¡No se pudo encontrar información con los filtros consultados!`); });
    } else if (oc != null && estado != null) {
      this.dtOrdenCompraService.GetOrdenCompra(oc).subscribe(datos_orden => {
        size_query = datos_orden.length;
        for (let i = 0; i < datos_orden.length; i++) {
          if (datos_orden[i].estado_Id == estado) if (!ocConsultadas.includes(datos_orden[i].consecutivo)) this.llenarTabla(datos_orden[i]);
          ocConsultadas.push(datos_orden[i].consecutivo);
        }
      }, error => { this.msj.mensajeError(`Error`, `¡No se pudo encontrar información con los filtros consultados!`); });
    } else if (fechaInicial != null && estado != null) {
      this.dtOrdenCompraService.GetOrdenCompra_EstadoFechas(estado, fechaInicial, fechaFinal).subscribe(datos_orden => {
        size_query = datos_orden.length;
        for (let i = 0; i < datos_orden.length; i++) {
          if (!ocConsultadas.includes(datos_orden[i].consecutivo)) this.llenarTabla(datos_orden[i]);
          ocConsultadas.push(datos_orden[i].consecutivo);
        }
      }, error => { this.msj.mensajeError(`Error`, `¡No se pudo encontrar información con los filtros consultados!`); });
    } else if (fechaInicial != null && fechaFinal != null) {
      this.dtOrdenCompraService.GetOrdenCompra_fechas(fechaInicial, fechaFinal).subscribe(datos_orden => {
        size_query = datos_orden.length;
        for (let i = 0; i < datos_orden.length; i++) {
          if (!ocConsultadas.includes(datos_orden[i].consecutivo)) this.llenarTabla(datos_orden[i]);
          ocConsultadas.push(datos_orden[i].consecutivo);
        }
      }, error => { this.msj.mensajeError(`Error`, `¡No se pudo encontrar información con los filtros consultados!`); });
    } else if (oc != null) {
      this.dtOrdenCompraService.GetOrdenCompra(oc).subscribe(datos_orden => {
        size_query = datos_orden.length;
        for (let i = 0; i < datos_orden.length; i++) {
          if (!ocConsultadas.includes(datos_orden[i].consecutivo)) this.llenarTabla(datos_orden[i]);
          ocConsultadas.push(datos_orden[i].consecutivo);
        }
      }, error => { this.msj.mensajeError(`Error`, `¡No se pudo encontrar información con los filtros consultados!`); });
    } else if (fechaInicial != null) {
      this.dtOrdenCompraService.GetOrdenCompra_fechas(fechaInicial, fechaInicial).subscribe(datos_orden => {
        size_query = datos_orden.length;
        for (let i = 0; i < datos_orden.length; i++) {
          if (!ocConsultadas.includes(datos_orden[i].consecutivo)) this.llenarTabla(datos_orden[i]);
          ocConsultadas.push(datos_orden[i].consecutivo);
        }
      }, error => { this.msj.mensajeError(`Error`, `¡No se pudo encontrar información con los filtros consultados!`); });
    } else if (estado != null) {
      this.dtOrdenCompraService.GetOrdenCompra_Estado(estado).subscribe(datos_orden => {
        size_query = datos_orden.length;
        for (let i = 0; i < datos_orden.length; i++) {
          if (!ocConsultadas.includes(datos_orden[i].consecutivo)) this.llenarTabla(datos_orden[i]);
          ocConsultadas.push(datos_orden[i].consecutivo);
        }
      }, error => { this.msj.mensajeError(`Error`, `¡No se pudo encontrar información con los filtros consultados!`); });
    } else {
      this.dtOrdenCompraService.GetOrdenCompra_fechas(this.today, this.today).subscribe(datos_orden => {
        size_query = datos_orden.length;
        for (let i = 0; i < datos_orden.length; i++) {
          if (!ocConsultadas.includes(datos_orden[i].consecutivo)) this.llenarTabla(datos_orden[i]);
          ocConsultadas.push(datos_orden[i].consecutivo);
        }
      }, error => { this.msj.mensajeError(`Error`, `¡No se pudo encontrar información con los filtros consultados!`); });
    }
    setTimeout(() => { this.cargando = false; }, 2000);
  }

  // Funcion que servirá para llenar la tabla que se verá que está en la vista con la informacion que devuelve la consulta
  llenarTabla(data : any){
    let info : any = {
      Oc : data.consecutivo,
      Fecha : data.fecha.replace('T00:00:00', ''),
      Estado : data.estado,
      Usuario : data.usuario,
    }
    this.registrosConsultados.push(info);
    this.registrosConsultados.sort((a,b) => Number(a.Oc) - Number(b.Oc));
  }

  // Funcion que limpiará los filtros utilizados en la tabla
  clear(table: Table) {
    table.clear();
  }

  //Buscar informacion de la orden de compra creada
  buscarinfoOrdenCompra(oc : number){
    this.cargando = true;
    this.datosPdf = [];
    this.dtOrdenCompraService.GetOrdenCompra(oc).subscribe(datos_orden => {
      for (let i = 0; i < datos_orden.length; i++) {
        let info : any = {
          Id : 0,
          Id_Mp: datos_orden[i].mP_Id,
          Id_Tinta: datos_orden[i].tinta_Id,
          Id_Bopp: datos_orden[i].bopp_Id,
          Nombre : '',
          Cantidad : this.formatonumeros(datos_orden[i].cantidad),
          Medida : datos_orden[i].unidad_Medida,
          Precio : `$${this.formatonumeros((datos_orden[i].precio_Unitario).toFixed(2))}`,
          SubTotal : `${this.formatonumeros((datos_orden[i].cantidad * datos_orden[i].precio_Unitario).toFixed(2))}`,
        }
        if (info.Id_Mp != 84) {
          info.Id = info.Id_Mp;
          info.Nombre = datos_orden[i].mp;
        } else if (info.Id_Tinta != 2001) {
          info.Id = info.Id_Tinta;
          info.Nombre = datos_orden[i].tinta;
        } else if (info.Id_Bopp != 1) {
          info.Id = info.Id_Bopp;
          info.Nombre = datos_orden[i].bopp;
        }
        this.datosPdf.push(info);
        this.datosPdf.sort((a,b) => a.Nombre.localeCompare(b.Nombre));
      }
      setTimeout(() => {this.generarPDF(oc); }, 2500);
    }, error => { this.msj.mensajeError(`Error`, `¡No se pudo obtener información de la orden de compra N° ${oc}!`); });
  }

  // Funcion que se encargará de poner la informcaion en el PDF y generarlo
  generarPDF(oc : number){
    let nombre : string = this.storage_Nombre;
    this.dtOrdenCompraService.GetOrdenCompra(oc).subscribe(datos_orden => {
      for (let i = 0; i < datos_orden.length; i++) {
        const pdfDefinicion : any = {
          info: {
            title: `Orden de Compra N° ${datos_orden[i].consecutivo}`
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
                  height : 50
                },
                {
                  text: `Orden de Compra de Materia Prima N° ${datos_orden[i].consecutivo}`,
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
                      text: `${datos_orden[i].empresa}`
                    },
                    {
                      border: [false, false, false, false],
                      text: `Fecha`
                    },
                    {
                      border: [false, false, false, true],
                      text: `${datos_orden[i].fecha.replace('T00:00:00', ``)} ${datos_orden[i].hora}`
                    },
                  ],
                  [
                    {
                      border: [false, false, false, false],
                      text: `NIT Empresa`
                    },
                    {
                      border: [false, false, false, true],
                      text: `${datos_orden[i].empresa_Id}`
                    },
                    {
                      border: [false, false, false, false],
                      text: `Ciudad`
                    },
                    {
                      border: [false, false, false, true],
                      text: `${datos_orden[i].empresa_Ciudad}`
                    },
                  ],
                  [
                    {
                      border: [false, false, false, false],
                      text: `Dirección`
                    },
                    {
                      border: [false, false, false, true],
                      text: `${datos_orden[i].empresa_Direccion}`
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
              text: `Usuario: ${datos_orden[i].usuario}\n`,
              alignment: 'left',
              style: 'header',
            },
            '\n \n',
            {
              text: `\n Información detallada del Proveedor \n \n`,
              alignment: 'center',
              style: 'header'
            },
            {
              style: 'tablaCliente',
              table: {
                widths: [171,171, 171],
                style: 'header',
                body: [
                  [
                    {text: `Nombre: ${datos_orden[i].proveedor}`, bold: true},
                    `ID: ${datos_orden[i].proveedor_Id}`,
                    `Tipo de ID: ${datos_orden[i].tipo_Id}`,
                  ],
                  [
                    `Telefono: ${datos_orden[i].telefono_Proveedor}`,
                    `Ciudad: ${datos_orden[i].ciudad_Proveedor}`,
                    `Tipo de Proveedor: ${datos_orden[i].tipo_Proveedor}`
                  ],
                  [
                    `E-mail: ${datos_orden[i].correo_Proveedor}`,
                    '',
                    ''
                  ]
                ]
              },
              layout: 'lightHorizontalLines',
              fontSize: 10,
            },
            {
              text: `\n\n Información detallada de la(s) Materia(s) Prima(s) \n `,
              alignment: 'center',
              style: 'header'
            },

            this.table(this.datosPdf, ['Id', 'Nombre', 'Cantidad', 'Medida', 'Precio', 'SubTotal']),

            {
              style: 'tablaTotales',
              table: {
                widths: [197, '*', 50, '*', '*', 98],
                style: 'header',
                body: [
                  [
                    '',
                    {
                      border: [true, false, true, true],
                      text: `Peso Total`
                    },
                    {
                      border: [false, false, true, true],
                      text: `${this.formatonumeros((datos_orden[i].peso_Total).toFixed(2))}`
                    },
                    '',
                    {
                      border: [true, false, true, true],
                      text: `Subtotal`
                    },
                    {
                      border: [false, false, true, true],
                      text: `$${this.formatonumeros((datos_orden[i].valor_Total).toFixed(2))}`
                    },
                  ],
                  [
                    '',
                    '',
                    '',
                    '',
                    {
                      border: [true, false, true, true],
                      text: `IVA ${datos_orden[i].iva}%`
                    },
                    {
                      border: [false, false, true, true],
                      text: `$${this.formatonumeros(((datos_orden[i].valor_Total * datos_orden[i].iva) / 100).toFixed(2))}`
                    },
                  ],
                  [
                    '',
                    '',
                    '',
                    '',
                    {
                      border: [true, false, true, true],
                      text: `Valor Total`
                    },
                    {
                      border: [false, false, true, true],
                      text: `$${this.formatonumeros((datos_orden[i].valor_Total + ((datos_orden[i].valor_Total * datos_orden[i].iva) / 100)).toFixed(2))}`
                    },
                  ],
                ]
              },
              layout: { defaultBorder: false, },
              fontSize: 8,
            },
            {
              text: `\n \nObservación sobre la Orden: \n ${datos_orden[i].observacion}\n`,
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
    }, error => { this.msj.mensajeError(`Error`, `¡No se pudo obtener información de la orden de compra N° ${oc}!`); });
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
        widths: [50, 197, 50, 50, 50, 98],
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

  // Funcion que abrirá y llenará el modal con la informacion de la orden de compra
  llenarModal(numeroOrden : number){
    if (this.ValidarRol == 1 || this.ValidarRol == 6) {
      this.mostrarModal = true;
      this.numeroOrdenCompra = numeroOrden;
      this.EditarOrdenCompra.edicionOrdenCompra = true;
      this.EditarOrdenCompra.FormOrdenCompra.reset();
      this.EditarOrdenCompra.FormMateriaPrima.reset();
      this.EditarOrdenCompra.FormMateriaPrima.patchValue({ iva : 19 });
      this.EditarOrdenCompra.materiasPrimasSeleccionadas = [];
      this.EditarOrdenCompra.catidadTotalPeso = 0;
      this.EditarOrdenCompra.cantidadTotalPrecio = 0;
      this.EditarOrdenCompra.materiasPrimasSeleccionada_ID = [];
      this.EditarOrdenCompra.consecutivoOrdenCompra = 0;
      this.EditarOrdenCompra.informacionPDF = [];
      this.dtOrdenCompraService.GetOrdenCompra(numeroOrden).subscribe(datos_orden => {
        for (let i = 0; i < datos_orden.length; i++) {
          this.EditarOrdenCompra.FormOrdenCompra.patchValue({
            ConsecutivoOrden : numeroOrden,
            Proveedor : datos_orden[i].proveedor,
            Id_Proveedor : datos_orden[i].proveedor_Id,
            Observacion : datos_orden[i].observacion,
          });
          break;
        }
        for (let i = 0; i < datos_orden.length; i++) {
          let info : any = {
            Id : 0,
            Id_Mp: datos_orden[i].mP_Id,
            Id_Tinta: datos_orden[i].tinta_Id,
            Id_Bopp: datos_orden[i].bopp_Id,
            Nombre : '',
            Cantidad : datos_orden[i].cantidad,
            Und_Medida : datos_orden[i].unidad_Medida,
            Precio : datos_orden[i].precio_Unitario,
            SubTotal : (datos_orden[i].cantidad * datos_orden[i].precio_Unitario),
          };
          if (info.Id_Mp != 84) {
            info.Id = info.Id_Mp;
            info.Nombre = datos_orden[i].mp;
          } else if (info.Id_Tinta != 2001) {
            info.Id = info.Id_Tinta;
            info.Nombre = datos_orden[i].tinta;
          } else if (info.Id_Bopp != 1) {
            info.Id = info.Id_Bopp;
            info.Nombre = datos_orden[i].bopp;
          }
          this.EditarOrdenCompra.materiasPrimasSeleccionadas.push(info);
          this.EditarOrdenCompra.catidadTotalPeso += datos_orden[i].cantidad;
          this.EditarOrdenCompra.cantidadTotalPrecio += (datos_orden[i].cantidad * datos_orden[i].precio_Unitario);
        }
      }, error => { this.msj.mensajeError(`Error`, `¡No se pudo obtener información de la orden de compra N° ${numeroOrden}!`); });
    }
  }

   /** Función que mostrará un tutorial describiendo paso a paso cada funcionalidad de la aplicación */
   verTutorial() {
    this.shepherdService.defaultStepOptions = defaultStepOptions;
    this.shepherdService.modal = true;
    this.shepherdService.confirmCancel = false;
    this.shepherdService.addSteps(defaultSteps);
    this.shepherdService.start();
  }
}
