import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ShepherdService } from 'angular-shepherd';
import moment from 'moment';
import pdfMake from 'pdfmake/build/pdfmake';
import { Table } from 'primeng/table';
import { DetalleOrdenMaquilaService } from 'src/app/Servicios/DetalleOrdenMaquila/DetalleOrdenMaquila.service';
import { DtFacturacion_OrdenMaquilaService } from 'src/app/Servicios/DtFacturacion_OrdenMaquila.ts/DtFacturacion_OrdenMaquila.service';
import { EstadosService } from 'src/app/Servicios/Estados/estados.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { Orden_MaquilaService } from 'src/app/Servicios/Orden_Maquila/Orden_Maquila.service';
import { TercerosService } from 'src/app/Servicios/Terceros/Terceros.service';
import { AppComponent } from 'src/app/app.component';
import { defaultStepOptions, stepsMovMaquilas as defaultSteps } from 'src/app/data';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';

@Component({
  selector: 'app-Reporte_Maquilas',
  templateUrl: './Reporte_Maquilas.component.html',
  styleUrls: ['./Reporte_Maquilas.component.css']
})

export class Reporte_MaquilasComponent implements OnInit {

  @ViewChild('dt') dt: Table | undefined;
  FormConsultarFiltros !: FormGroup;
  cargando : boolean = false; //Variable para validar que salga o no la imagen de carga
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol
  estados : any [] = []; //Variable que almacenará los estados que pueden tener las ordenes de compra de materia prima
  registrosConsultados : any [] = []; //Variable que va a almacenar los diferentes registros consultados
  datosPdf : any [] = []; //variable que va a almacenar la informacion del documento consultado
  arrayTerceros : any = []; /** Array que carga la información de los terceros. */
  arrayConsolidado : any [] = []; //Variable que tendrá la información del consolidado consultado
  totalConsulta : number = 0; /** Variable que cargará el valor total de la consulta si se filtra por uno de los campos de la tabla. */
  totalAnio : boolean = true; /** Variable que mostrará el total por año o el valor total segun el filtro seleccionado en la tabla. */
  valorTotalConsulta : number = 0; //Variable que almacenará el costo total de los productos facturdos que trae la consulta
  pesoTotal : number = 0; /** Peso total de la orden de maquila */
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro

  constructor(private frmBuilder : FormBuilder,
                private AppComponent : AppComponent,
                  private estadosService : EstadosService,
                    private ordenMaquilaService : Orden_MaquilaService,
                      private dtOrdenMaquilaService : DetalleOrdenMaquilaService,
                        private dtFacturacion_OMService : DtFacturacion_OrdenMaquilaService,
                          private servicioTerceros : TercerosService,
                            private shepherdService: ShepherdService,
                              private msj : MensajesAplicacionService) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
    this.FormConsultarFiltros = this.frmBuilder.group({
      Documento : [null],
      fechaDoc: [null],
      fechaFinalDoc: [null],
      estadoDoc: [null],
      id_tercero: [null],
      tercero: [null],
    });
  }

  ngOnInit() {
    this.lecturaStorage();
    this.obtenerEstados();
    setInterval(() => this.modoSeleccionado = this.AppComponent.temaSeleccionado, 1000);
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

  // funcion que limpiará todo
  limpiarCampos(){
    this.cargando = false;
    this.FormConsultarFiltros.reset();
    this.datosPdf = [];
    this.registrosConsultados = [];
  }

  // Funcion que va a consultar y almacenar los estados que pueden tener los documentos
  obtenerEstados = () => this.estadosService.srvObtenerListaEstados().subscribe(datos => this.estados = datos.filter(x => [11,5,13,12].includes(x.estado_Id)));

  /** Funcion para filtrar busquedas y mostrar el valor total segun el filtro seleccionado. */
  aplicarfiltro = ($event, campo : any, valorCampo : string) => this.dt!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

  // Funcion que va a calcular el subtotal de lo vendido en un mes
  calcularTotalVendidoAno = (fecha : any) : number => this.arrayConsolidado.filter(x => x.Fecha == fecha).reduce((a,b) => a + b.SubTotal, 0);

  // Funcion que va a calcular el peso de lo vendido en un mes
  calcularTotalPesado = (fecha : any) : number => this.arrayConsolidado.filter(x => x.Fecha == fecha).reduce((a,b) => a + b.Cantidad, 0);

  // funcion que va a consultar los filtros utilizados para traer ka informacion
  consultarFiltros(){
    this.registrosConsultados = [];
    this.arrayConsolidado = [];
    this.valorTotalConsulta = 0;
    this.cargando = true;
    let fechaMesAnterior : any = moment().subtract(1, 'M').format('YYYY-MM-DD');
    let fechaInicial : any = moment(this.FormConsultarFiltros.value.fechaDoc).format('YYYY-MM-DD');
    let fechaFinal : any = moment(this.FormConsultarFiltros.value.fechaFinalDoc).format('YYYY-MM-DD');
    let estado : any = this.FormConsultarFiltros.value.estadoDoc;
    let codigo : any = this.FormConsultarFiltros.value.Documento;
    let tercero : any = this.FormConsultarFiltros.value.id_tercero
    let ruta : string = '', ruta2 : string = '';

    if (fechaInicial == 'Fecha inválida') fechaInicial = fechaMesAnterior;
    if (fechaFinal == 'Fecha inválida') fechaFinal = moment().format('YYYY-MM-DD');

    if (estado != null && codigo != null) ruta = `?doc=${codigo}&estado=${estado}`;
    else if (estado != null) ruta = `?estado=${estado}`;
    else if (codigo != null) ruta = `?doc=${codigo}`;

    this.ordenMaquilaService.GetConsultaDocumentos(fechaInicial, fechaFinal, ruta).subscribe(datos => {
      if(datos.length > 0 ) datos.forEach(data => this.llenarTabla(data));
      else {
        this.msj.mensajeAdvertencia(`Advertencia`,`No se encontraron resultados con los filtros consultados!`);
        this.cargando = false;
      }
      setTimeout(() => this.cargando = false, datos.length * 5);
    }, () => this.msj.mensajeError(`Error`, `¡No fue posible realizar una consulta de los documentos de Maquila!`), () => this.cargando = false);

    if (this.ValidarRol == 1) {
      if (estado != null && codigo != null && tercero != null) ruta2 = `?doc=${codigo}&estado=${estado}&tercero=${tercero}`;
      else if (estado != null && tercero != null) ruta2 = `?estado=${estado}&tercero=${tercero}`;
      else if (codigo != null && tercero != null) ruta2 = `?doc=${codigo}&tercero=${tercero}`;
      else if (estado != null) ruta2 = `?estado=${estado}`;
      else if (codigo != null) ruta2 = `?doc=${codigo}`;
      else if (tercero != null) ruta2 = `?tercero=${tercero}`;

      this.ordenMaquilaService.GetConsultaConsolidado(fechaInicial, fechaFinal, ruta2).subscribe(datos => {
        this.cargando = true;
        datos.forEach(data => this.llenartTablaConsolidado(data));
        setTimeout(() => this.cargando = false, datos.length * 5);
      }, () => {
        this.msj.mensajeError(`Error`, `¡No fue posible realizar una consulta de los documentos de Maquila!`)
        this.cargando = false;
      }, () => this.cargando = false);
    }
  }

  // funcion que va a llenar la tabla con la informacion de cada documento
  llenarTabla(data : any){
    let info : any = {
      Id : data.id,
      Codigo : data.codigo,
      Tipo : data.tipo,
      Tipo_Id : data.tipo_Id,
      Usuario : data.usuario,
      Fecha : data.fecha.replace('T00:00:00', ''),
      Estado : data.estado,
    }
    this.registrosConsultados.push(info);
    this.registrosConsultados.sort((a,b) => a.Id - b.Id);
  }

  // Funcion que va a llenar la tabla del consolidado de facturación de ordenes de maquilas
  llenartTablaConsolidado(data : any) {
    if (data.mes == 1) data.mes = 'Enero';
    if (data.mes == 2) data.mes = 'Febrero';
    if (data.mes == 3) data.mes = 'Marzo';
    if (data.mes == 4) data.mes = 'Abril';
    if (data.mes == 5) data.mes = 'Mayo';
    if (data.mes == 6) data.mes = 'Junio';
    if (data.mes == 7) data.mes = 'Julio';
    if (data.mes == 8) data.mes = 'Agosto';
    if (data.mes == 9) data.mes = 'Septiembre';
    if (data.mes == 10) data.mes = 'Octubre';
    if (data.mes == 11) data.mes = 'Noviembre';
    if (data.mes == 12) data.mes = 'Diciembre';

    let mp_Id : number, mp : string;

    if (data.materiaPrima_Id != 84) {
      mp = data.materiaPrima;
      mp_Id = data.materiaPrima_Id
    } else if (data.tinta_Id != 2001) {
      mp = data.tinta;
      mp_Id = data.tinta_Id;
    } else if (data.bopp_Id != 449) {
      mp = data.bopp;
      mp_Id = data.bopp_Id;
    }

    let info : any = {
      Fecha : `${data.anio} - ${data.mes}`,
      Tercero : data.tercero,
      MateriaPrima_Id : mp_Id,
      MateriaPrima : mp,
      Cantidad : data.cantidad,
      Presentacion : data.presentacion,
      Precio : data.precio,
      SubTotal : data.subTotal,
    }
    this.pesoTotal += data.cantidad;
    this.valorTotalConsulta += data.subTotal;
    this.arrayConsolidado.push(info);
  }

  // Funion que validará el tipo de documento que es para crear el PDF
  validarTipoDocumento(data : any){
    this.datosPdf = [];
    if (data.Tipo_Id == 'OM') this.buscarOrden(data.Id);
    else this.buscarFacturacion(data.Id);
  }

  // Funcion que va a consultar la información de la factura o remisión que se acaba de crear
  buscarFacturacion(id : number){
    this.dtFacturacion_OMService.GetConsultarFacturacion(id).subscribe(datos_facturacion => {
      for (let i = 0; i < datos_facturacion.length; i++) {
        let info : any = {
          Id : 0,
          Id_Mp: datos_facturacion[i].mP_Id,
          Id_Tinta: datos_facturacion[i].tinta_Id,
          Id_Bopp: datos_facturacion[i].bopp_Id,
          Nombre : '',
          Cantidad : this.formatonumeros(datos_facturacion[i].cantidad),
          "Und Medida" : datos_facturacion[i].und_Medida,
          Precio : this.formatonumeros(datos_facturacion[i].precio),
          SubTotal : this.formatonumeros(datos_facturacion[i].cantidad * datos_facturacion[i].precio),
        }
        if (info.Id_Tinta != 2001) {
          info.Id = info.Id_Tinta;
          info.Nombre = datos_facturacion[i].tinta;
        } else if (info.Id_Mp != 84) {
          info.Id = info.Id_Mp;
          info.Nombre = datos_facturacion[i].mp;
        } else if (info.Id_Bopp != 449) {
          info.Id = info.Id_Bopp;
          info.Nombre = datos_facturacion[i].bopp;
        }
        this.datosPdf.push(info);
        this.datosPdf.sort((a,b) => a.Nombre.localeCompare(b.Nombre));
      }
      setTimeout(() => this.crearPDF_Facturacion(id), 2500);
    });
  }

  // Funcion que va a crear un archivo de tipo pdf de la factura o remision que se acaba de crear
  crearPDF_Facturacion(id : number){
    let nombre : string = this.storage_Nombre;
    this.dtFacturacion_OMService.GetConsultarFacturacion(id).subscribe(datos_facturacion => {
      for (let i = 0; i < datos_facturacion.length; i++) {
        const pdfDefinicion : any = {
          info: { title: `${datos_facturacion[i].tipo_Documento} N° ${datos_facturacion[i].codigo_Documento}` },
          pageSize: { width: 630, height: 760 },
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
                { image : logoParaPdf, width : 220, height : 50 },
                {
                  text: `${datos_facturacion[i].tipo_Documento} N° ${id}`,
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
                      text: `${datos_facturacion[i].empresa}`
                    },
                    {
                      border: [false, false, false, false],
                      text: `Fecha`
                    },
                    {
                      border: [false, false, false, true],
                      text: `${datos_facturacion[i].fecha.replace('T00:00:00', ``)} ${datos_facturacion[i].hora}`
                    },
                  ],
                  [
                    {
                      border: [false, false, false, false],
                      text: `NIT Empresa`
                    },
                    {
                      border: [false, false, false, true],
                      text: `${datos_facturacion[i].empresa_Id}`
                    },
                    {
                      border: [false, false, false, false],
                      text: `Ciudad`
                    },
                    {
                      border: [false, false, false, true],
                      text: `${datos_facturacion[i].empresa_Ciudad}`
                    },
                  ],
                  [
                    {
                      border: [false, false, false, false],
                      text: `Dirección`
                    },
                    {
                      border: [false, false, false, true],
                      text: `${datos_facturacion[i].empresa_Direccion}`
                    },
                    {
                      border: [false, false, false, false],
                      text: `Tipo Documento`
                    },
                    {
                      border: [false, false, false, true],
                      text: `${datos_facturacion[i].tipo_Documento}`
                    }
                  ]
                ]
              },
              layout: { defaultBorder: false, },
              fontSize: 9,
            },
            '\n \n',
            {
              text: `Usuario: ${datos_facturacion[i].usuario}\n`,
              alignment: 'left',
              style: 'header',
            },
            '\n \n',
            {
              text: `\n Información detallada del Tercero \n \n`,
              alignment: 'center',
              style: 'header'
            },
            {
              style: 'tablaCliente',
              table: {
                widths: [171, 171, 171],
                style: 'header',
                body: [
                  [
                    `Nombre: ${datos_facturacion[i].tercero}`,
                    `ID: ${datos_facturacion[i].tercero_Id}`,
                    `Tipo de ID: ${datos_facturacion[i].tipo_Id}`,
                  ],
                  [
                    `Telefono: ${datos_facturacion[i].telefono_Tercero}`,
                    `Ciudad: ${datos_facturacion[i].ciudad_Tercero}`,
                    `E-mail: ${datos_facturacion[i].correo_Tercero}`,
                  ],
                ]
              },
              layout: 'lightHorizontalLines',
              fontSize: 11,
            },
            {
              text: `\n\n Información detallada de la(s) Materia(s) Prima(s) \n `,
              alignment: 'center',
              style: 'header'
            },

            this.table(this.datosPdf, ['Id', 'Nombre', 'Cantidad', 'Und Medida', 'Precio', 'SubTotal']),

            {
              style: 'tablaTotales',
              table: {
                widths: [197, '*', 50, '*', '*', 98],
                style: 'header',
                body: [
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
                      text: `$${this.formatonumeros(datos_facturacion[i].valor_Total)}`
                    },
                  ],
                ]
              },
              layout: { defaultBorder: false, },
              fontSize: 8,
            },
            {
              text: `\n \nObservación sobre la Orden: \n ${datos_facturacion[i].observacion}\n`,
              style: 'header',
            }
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

  // Funcion que va a consultar la información de la factura o remisión que se acaba de crear
  buscarOrden(id : number){
    this.cargando = true;
    this.datosPdf = [];
    this.dtOrdenMaquilaService.getInfoOrdenMaquila_Id(id).subscribe(datos_Orden => {
      for (let i = 0; i < datos_Orden.length; i++) {
        let info : any = {
          Id : 0,
          Id_Mp: datos_Orden[i].mP_Id,
          Id_Tinta: datos_Orden[i].tinta_Id,
          Id_Bopp: datos_Orden[i].bopp_Id,
          Nombre : '',
          Cantidad : this.formatonumeros(datos_Orden[i].cantidad),
          "Und Medida" : datos_Orden[i].und_Medida,
          Precio : this.formatonumeros(datos_Orden[i].precio),
          SubTotal : this.formatonumeros(datos_Orden[i].cantidad * datos_Orden[i].precio),
        }
        if (info.Id_Tinta != 2001) {
          info.Id = info.Id_Tinta;
          info.Nombre = datos_Orden[i].tinta;
        } else if (info.Id_Mp != 84) {
          info.Id = info.Id_Mp;
          info.Nombre = datos_Orden[i].mp;
        } else if (info.Id_Bopp != 449) {
          info.Id = info.Id_Bopp;
          info.Nombre = datos_Orden[i].bopp;
        }
        this.datosPdf.push(info);
        this.datosPdf.sort((a,b) => a.Nombre.localeCompare(b.Nombre));
      }
      setTimeout(() => this.crearPDF_Orden(id), 2500);
    }, () => {
      this.msj.mensajeError(`Error`, `¡No se pudo obtener información de la última orden de maquila!`);
      this.cargando = false;
    }, () => this.cargando = false);
  }

  // Funcion que va a crear un archivo de tipo pdf de la factura o remision que se acaba de crear
  crearPDF_Orden(id : number){
    this.dtOrdenMaquilaService.getInfoOrdenMaquila_Id(id).subscribe(datos_orden => {
      for (let i = 0; i < datos_orden.length; i++) {
        let titulo : string = `Orden de Maquila N° ${datos_orden[i].orden}`;
        const pdfDefinicion : any = {
          info: { title: titulo},
          pageSize: { width: 630, height: 760 },
          watermark: { text: 'PLASTICARIBE SAS', color: 'red', opacity: 0.05, bold: true, italics: false },
          pageMargins : [25, 130, 25, 35],
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
                        [{text: `Fecha Doc. ${moment().format('YYYY-MM-DD')} ${moment().format('H:mm:ss')}`, alignment: 'center', fontSize: 8}],
                        [{text: titulo, bold: true, alignment: 'center', fontSize: 10}],
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
                        [{text: `Fecha: `, alignment: 'left', fontSize: 8, bold: true}, {text: datos_orden[i].fecha.replace('T00:00:00', ``), alignment: 'left', fontSize: 8, margin: [0, 0, 30, 0] }],
                        [{text: `Hora: `, alignment: 'left', fontSize: 8, bold: true}, {text: datos_orden[i].hora, alignment: 'left', fontSize: 8, margin: [0, 0, 30, 0] }],
                        [{text: `Usuario: `, alignment: 'left', fontSize: 8, bold: true}, {text: datos_orden[i].usuario, alignment: 'left', fontSize: 8, margin: [0, 0, 30, 0] }],
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
            ];
          },
          content : [
            {
              text: `Información detallada del Tercero \n \n`,
              alignment: 'center',
              style: 'header'
            },
            {
              style: 'tablaCliente',
              table: {
                widths: [210,171, 171],
                style: 'header',
                body: [
                  [
                    `Nombre: ${datos_orden[i].tercero}`,
                    `ID: ${datos_orden[i].tercero_Id}`,
                    `Tipo de ID: ${datos_orden[i].tipo_Id}`,
                  ],
                  [
                    `Telefono: ${datos_orden[i].telefono_Tercero}`,
                    `Ciudad: ${datos_orden[i].ciudad_Tercero}`,
                    `E-mail: ${datos_orden[i].correo_Tercero}`,
                  ],
                ]
              },
              layout: 'lightHorizontalLines',
              fontSize: 9,
            },
            {
              text: `\n\n Información detallada de la(s) Materia(s) Prima(s) \n `,
              alignment: 'center',
              style: 'header'
            },

            this.table(this.datosPdf, ['Id', 'Nombre', 'Cantidad', 'Und Medida', 'Precio', 'SubTotal']),

            {
              style: 'tablaTotales',
              table: {
                widths: [217, '*', 50, '*', 60, 98],
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
                      text: `${this.formatonumeros(datos_orden[i].peso_Total)}`
                    },
                    '',
                    {
                      border: [true, false, true, true],
                      text: `Valor Total`
                    },
                    {
                      border: [false, false, true, true],
                      text: `$${this.formatonumeros(datos_orden[i].valor_Total)}`
                    },
                  ],
                ]
              },
              layout: {
                defaultBorder: false,
              },
              fontSize: 8,
            },
            {
              text: `\n \nObservación sobre la Orden: \n ${datos_orden[i].observacion}\n`,
              style: 'header',
            }
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
    }, () => {
      this.msj.mensajeError(`Error`, `¡No se pudo obtener la información de la última orden de maquila!`);
      this.cargando = false;
    });
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
        widths: [50, 217, 50, 50, 60, 98],
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

  cargarTerceros = () => this.servicioTerceros.getTerceroLike(this.FormConsultarFiltros.value.tercero).subscribe(data => this.arrayTerceros = data);

  seleccionarTerceros(){
    let tercero : any = this.FormConsultarFiltros.value.tercero;
    let nuevo : any[] = this.arrayTerceros.filter((item) => item.tercero_Id == tercero);
    setTimeout(() => this.FormConsultarFiltros.patchValue({tercero: nuevo[0].tercero_Nombre, id_tercero: nuevo[0].tercero_Id }), 30);
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
