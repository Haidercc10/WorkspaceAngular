import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import pdfMake from 'pdfmake/build/pdfmake';
import { DetallesDevolucionesProductosService } from 'src/app/Servicios/DetallesDevolucionRollosFacturados/DetallesDevolucionesProductos.service';
import { DetallesEntradaRollosService } from 'src/app/Servicios/DetallesEntradasRollosDespacho/DetallesEntradaRollos.service';
import { DetallesAsignacionProductosFacturaService } from 'src/app/Servicios/DetallesFacturacionRollos/DetallesAsignacionProductosFactura.service';
import { DtPreEntregaRollosService } from 'src/app/Servicios/DetallesPreIngresoRollosDespacho/DtPreEntregaRollos.service';
import { TipoDocumentoService } from 'src/app/Servicios/TipoDocumento/tipoDocumento.service';
import { AppComponent } from 'src/app/app.component';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';
import { defaultStepOptions, stepsMovimientosDespacho as defaultSteps } from 'src/app/data';
import { ShepherdService } from 'angular-shepherd';

@Component({
  selector: 'app-Reporte-Despacho',
  templateUrl: './Reporte-Despacho.component.html',
  styleUrls: ['./Reporte-Despacho.component.css']
})
export class ReporteDespachoComponent implements OnInit {

  cargando : boolean = false; //Variable para validar que salga la animacion de carga
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  FormConsultarFiltros !: FormGroup; //Variable que será el formulario en el que se buscará los filtros
  tiposdocumentos : any [] = [];
  infoDoc : any [] = []; //Variable que almacenará la información que se verá en la tabla
  rollosAsignados : any [] = []; //Variable que va a almacenar los rollos que fueron asignados
  consolidadoRollo : any [] = []; //Variable que va a almacenar el consolidado de la cantidad de rollos ingresados o facturados
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro

  constructor(private AppComponent : AppComponent,
                  private frmBuilder : FormBuilder,
                    private tipoDocService : TipoDocumentoService,
                      private dtAsigFactService : DetallesAsignacionProductosFacturaService,
                        private dtDevolucion : DetallesDevolucionesProductosService,
                          private dtEntradaService : DetallesEntradaRollosService,
                            private preCargueService : DtPreEntregaRollosService,
                              private shepherdService: ShepherdService){

    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
    this.FormConsultarFiltros = this.frmBuilder.group({
      Documento : [null, Validators.required],
      ProdNombre : ['', Validators.required],
      Rollo : ['', Validators.required ],
      Cliente : ['', Validators.required ],
      tipoDoc : ['', Validators.required ],
      fechaDoc: [null, Validators.required],
      fechaFinalDoc: [null, Validators.required],
      estadoRollo: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.lecturaStorage();
    this.obtenerTipoDocumento();
  }

  // Funcion que va a hacer que se inicie el tutorial in-app
  tutorial(){
    this.shepherdService.defaultStepOptions = defaultStepOptions;
    this.shepherdService.modal = true;
    this.shepherdService.confirmCancel = false;
    this.shepherdService.addSteps(defaultSteps);
    this.shepherdService.start();
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

  // Funcion para limpiar los campos de la vista
  limpiarCampos(){
    this.cargando = false;
  }

  // Funcion que va a consultar la información de los tipos de docuemntos
  obtenerTipoDocumento() {
    if (this.ValidarRol == 1 || this.ValidarRol == 9 || this.ValidarRol == 12) this.tiposdocumentos.push('Pre Cargue Empaque');
    if (this.ValidarRol == 1 || this.ValidarRol == 8) this.tiposdocumentos.push('Pre Cargue Sellado');
    if (this.ValidarRol == 1 || this.ValidarRol == 7) this.tiposdocumentos.push('Pre Cargue Extrusión');
    this.tipoDocService.srvObtenerLista().subscribe(data => {
      for(let i = 0; i < data.length; i++) {
        if(data[i].tpDoc_Id == 'ASIGPRODFV'
        && (this.ValidarRol == 1 || this.ValidarRol == 6)) this.tiposdocumentos.push(data[i].tpDoc_Nombre);
        else if (data[i].tpDoc_Id == 'DEVPRODFAC'
        && (this.ValidarRol == 1 || this.ValidarRol == 10 || this.ValidarRol == 7 || this.ValidarRol == 8 || this.ValidarRol == 9)) this.tiposdocumentos.push(data[i].tpDoc_Nombre);
        else if (data[i].tpDoc_Id == 'ENTROLLO'
        && (this.ValidarRol == 1 || this.ValidarRol == 10 || this.ValidarRol == 7 || this.ValidarRol == 8 || this.ValidarRol == 9)) this.tiposdocumentos.push(data[i].tpDoc_Nombre);
        this.tiposdocumentos.sort();
      }
    });
  }

  // Funcion que va a consultar por los filtros que se busquen
  consultarFiltros(){
    this.cargando = true;
    this.infoDoc = [];
    let documento : any = this.FormConsultarFiltros.value.Documento;
    let fechaIni : any = moment(this.FormConsultarFiltros.value.fechaDoc).format('YYYY-MM-DD');
    let fechaFin : any = moment(this.FormConsultarFiltros.value.fechaFinalDoc).format('YYYY-MM-DD');
    if (documento == '') documento = null;
    if (fechaIni == 'Invalid date') fechaIni = null;
    if (fechaFin == 'Invalid date') fechaFin = null;


    if (fechaIni != null && fechaFin != null) {
      this.dtAsigFactService.srvConsultarPorFiltroFechas(fechaIni, fechaFin).subscribe(datos_factura => {
        for (let i = 0; i < datos_factura.length; i++) {
          this.llenarTabla(datos_factura[i]);
        }
      });
    } else if (documento != null) {
      this.dtAsigFactService.srvConsultarPorFiltroFactura(documento, documento).subscribe(datos_factura => {
        for (let i = 0; i < datos_factura.length; i++) {
          this.llenarTabla(datos_factura[i]);
        }
      });
    } else if (fechaIni != null) {
      this.dtAsigFactService.srvConsultarPorFiltroFechas(fechaIni, fechaIni).subscribe(datos_factura => {
        for (let i = 0; i < datos_factura.length; i++) {
          this.llenarTabla(datos_factura[i]);
        }
      });
    } else {
      this.dtAsigFactService.srvConsultarPorFiltroFechas(this.today, this.today).subscribe(datos_factura => {
        for (let i = 0; i < datos_factura.length; i++) {
          this.llenarTabla(datos_factura[i]);
        }
      });
    }
    setTimeout(() => { this.cargando = false; }, 2500);
  }

  // Funcion que se encagará de llenar la tabla con la informacion consultada
  llenarTabla(datos : any){
    if (datos.tipo == 'ASIGPRODFV' && (this.ValidarRol == 1 || this.ValidarRol == 6)) {
      let info : any = {
        Codigo : datos.documento,
        Fecha : datos.fecha.replace('T00:00:00', ''),
        IdTipoDoc : 'ASIGPRODFV',
        TipoDoc : 'Factura',
        Usuario : datos.usuario
      }
      this.infoDoc.push(info);
    } else if (datos.tipo == 'DEVPRODFAC' && (this.ValidarRol == 1 || this.ValidarRol == 10 || this.ValidarRol == 7 || this.ValidarRol == 8 || this.ValidarRol == 9)) {
      let info : any = {
        Codigo : datos.documento,
        Fecha : datos.fecha.replace('T00:00:00', ''),
        IdTipoDoc : 'DEVPRODFAC',
        TipoDoc : 'Devolución',
        Usuario : datos.usuario
      }
      this.infoDoc.push(info);
    } else if (datos.tipo == 'ENTROLLO' && (this.ValidarRol == 1 || this.ValidarRol == 10 || this.ValidarRol == 7 || this.ValidarRol == 8 || this.ValidarRol == 9)) {
      let info : any = {
        Codigo : datos.documento,
        Fecha : datos.fecha.replace('T00:00:00', ''),
        IdTipoDoc : 'ENTROLLO',
        TipoDoc : 'Entrada',
        Usuario : datos.usuario
      }
      this.infoDoc.push(info);
    } else if (datos.tipo == 'Sellado' && (this.ValidarRol == 1 || this.ValidarRol == 8)) {
      let info : any = {
        Codigo : datos.documento,
        Fecha : datos.fecha.replace('T00:00:00', ''),
        IdTipoDoc : 'PRECARGUE',
        TipoDoc : 'Pre Cargue Sellado',
        Usuario : datos.usuario
      }
      this.infoDoc.push(info);
    } else if (datos.tipo == 'Empaque' && (this.ValidarRol == 1 || this.ValidarRol == 9 || this.ValidarRol == 12)) {
      let info : any = {
        Codigo : datos.documento,
        Fecha : datos.fecha.replace('T00:00:00', ''),
        IdTipoDoc : 'PRECARGUE',
        TipoDoc : 'Pre Cargue Empaque',
        Usuario : datos.usuario
      }
      this.infoDoc.push(info);
    } else if (datos.tipo == 'Extrusion' && (this.ValidarRol == 1 || this.ValidarRol == 7)) {
      let info : any = {
        Codigo : datos.documento,
        Fecha : datos.fecha.replace('T00:00:00', ''),
        IdTipoDoc : 'PRECARGUE',
        TipoDoc : 'Pre Cargue Extrusion',
        Usuario : datos.usuario
      }
      this.infoDoc.push(info);
    }
    this.infoDoc.sort((a,b) => a.Codigo.localeCompare(b.Codigo));
    this.infoDoc.sort((a,b) => b.Fecha.localeCompare(a.Fecha));
    this.cargando = true;
  }

  // Funcion que valiará que tipo de documento es el que se quiere ver y redirecciona a otra funcion que empezará con el proceso de crear un PDF
  tipoDocumento(item : any){
    if (item.IdTipoDoc == 'ASIGPRODFV') this.buscarRolloPDFFActura(item.Codigo);
    else if (item.IdTipoDoc == 'DEVPRODFAC') this.buscarRolloPDFDevolucion(item.Codigo);
    else if (item.IdTipoDoc == 'ENTROLLO') this.buscarRolloPDFEntrada(item.Codigo);
    else if (item.IdTipoDoc == 'PRECARGUE') this.buscarrolloPDFPreEntada(item.Codigo, item.Proceso);
  }

  // Funcion que creará un pdf a base de la informacion ingresada en las asignacion de rollos a facturas
  crearPDFFactura(factura){
    let nombre : string = this.storage_Nombre;
    this.dtAsigFactService.srvObtenerListaParaPDF(factura.toUpperCase()).subscribe(datos_factura => {
      for (let i = 0; i < datos_factura.length; i++) {
        for (let j = 0; j < this.rollosAsignados.length; j++) {
          const pdfDefinicion : any = {
            info: {
              title: `${factura.toUpperCase()}`
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
                    text: `Rollos de la Factura ${factura.toUpperCase()}`,
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
                  widths: [90, '*', 90, '*'],
                  style: 'header',
                  body: [
                    [
                      {
                        border: [false, false, false, false],
                        text: `Nombre Empresa`
                      },
                      {
                        border: [false, false, false, true],
                        text: `Plasticaribe S.A.S`
                      },
                      {
                        border: [false, false, false, false],
                        text: `Fecha`
                      },
                      {
                        border: [false, false, false, true],
                        text: `${datos_factura[i].asigProdFV_Fecha.replace('T00:00:00', '')}`
                      },
                    ],
                    [
                      {
                        border: [false, false, false, false],
                        text: `Dirección`
                      },
                      {
                        border: [false, false, false, true],
                        text: `${datos_factura[i].empresa_Direccion}`
                      },
                      {
                        border: [false, false, false, false],
                        text: `Ciudad`
                      },
                      {
                        border: [false, false, false, true],
                        text: `${datos_factura[i].empresa_Ciudad}`
                      },
                    ],
                  ]
                },
                layout: {
                  defaultBorder: false,
                },
                fontSize: 9,
              },
              '\n \n',
              {
                text: `Facturado Por: ${datos_factura[i].nombreCreador}\n`,
                alignment: 'left',
                style: 'header',
              },
              '\n \n',
              {
                text: `\n Información detallada de la Factura \n \n`,
                alignment: 'center',
                style: 'header'
              },
              {
                style: 'tablaCliente',
                table: {
                  widths: ['*', '*'],
                  style: 'header',
                  body: [
                    [
                      `Código: ${factura.toUpperCase()}`,
                      `Nota Credito: ${datos_factura[i].notaCredito_Id}`
                    ],
                    [
                      `Id Cliente: ${datos_factura[i].cli_Id}`,
                      `Nombre Cliente: ${datos_factura[i].cli_Nombre}`
                    ],
                    [
                      `Conductor: ${datos_factura[i].nombreConductor}`,
                      `Placa Camión: ${datos_factura[i].asigProdFV_PlacaCamion}`
                    ]
                  ]
                },
                layout: 'lightHorizontalLines',
                fontSize: 9,
              },
              {
                text: `\n\n Información consolidada de producto(s) facturado(s) \n `,
                alignment: 'center',
                style: 'header'
              },

              this.table2(this.consolidadoRollo, ['Producto', 'Nombre', 'Cantidad', 'Presentacion', 'Rollos']),
              {
                text: `\n\n Información detallada de producto(s) facturado(s) \n `,
                alignment: 'center',
                style: 'header'
              },

              this.table(this.rollosAsignados, ['Rollo', 'Producto', 'Nombre', 'Cantidad', 'Presentacion']),
              {
                text: `\n \nObervación: \n ${datos_factura[i].asigProdFV_Observacion}\n`,
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
        break;
      }
    });
  }

  // Funcion que traerá los rollos que fueron asignados a la factura creada
  buscarRolloPDFFActura(factura){
    this.consolidadoRollo = [];
    this.rollosAsignados = [];
    this.cargando = false;
    this.dtAsigFactService.srvObtenerListaParaPDF(factura.toUpperCase()).subscribe(datos_factura => {
      for (let i = 0; i < datos_factura.length; i++) {
        let info : any = {
          Rollo : datos_factura[i].rollo_Id,
          Producto : datos_factura[i].prod_Id,
          Nombre : datos_factura[i].prod_Nombre,
          Cantidad : this.formatonumeros(datos_factura[i].dtAsigProdFV_Cantidad),
          Presentacion : datos_factura[i].undMed_Id,
        }
        this.rollosAsignados.push(info);
      }
    });

    this.dtAsigFactService.srvObtenerListaParaPDF2(factura.toUpperCase()).subscribe(datos_factura => {
      for (let i = 0; i < datos_factura.length; i++) {
        let info : any = {
          Producto: datos_factura[i].prod_Id,
          Nombre : datos_factura[i].prod_Nombre,
          Cantidad : this.formatonumeros(datos_factura[i].suma),
          Presentacion: datos_factura[i].undMed_Id,
          Rollos : datos_factura[i].cantRollos,
        }
        this.consolidadoRollo.push(info);
      }
    });
    setTimeout(() => { this.crearPDFFactura(factura); }, 2500);
  }

  // Funcion que creará un pdf a base de la informacion ingresada en las asignacion de rollos a facturas
  crearPDFDevolucion(factura){
    let nombre : string = this.storage_Nombre;
    this.dtDevolucion.srvObtenerCrearPDF(factura.toUpperCase()).subscribe(datos_factura => {
      for (let i = 0; i < datos_factura.length; i++) {
        for (let j = 0; j < this.rollosAsignados.length; j++) {
          const pdfDefinicion : any = {
            info: {
              title: `${factura.toUpperCase()}`
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
                    text: `Rollos devueltos de la factura ${factura.toUpperCase()}`,
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
                  widths: [90, '*', 90, '*'],
                  style: 'header',
                  body: [
                    [
                      {
                        border: [false, false, false, false],
                        text: `Nombre Empresa`
                      },
                      {
                        border: [false, false, false, true],
                        text: `Plasticaribe S.A.S`
                      },
                      {
                        border: [false, false, false, false],
                        text: `Fecha`
                      },
                      {
                        border: [false, false, false, true],
                        text: `${datos_factura[i].devProdFact_Fecha.replace('T00:00:00', '')}`
                      },
                    ],
                    [
                      {
                        border: [false, false, false, false],
                        text: `Dirección`
                      },
                      {
                        border: [false, false, false, true],
                        text: `${datos_factura[i].empresa_Direccion}`
                      },
                      {
                        border: [false, false, false, false],
                        text: `Ciudad`
                      },
                      {
                        border: [false, false, false, true],
                        text: `${datos_factura[i].empresa_Ciudad}`
                      },
                    ],
                  ]
                },
                layout: {
                  defaultBorder: false,
                },
                fontSize: 9,
              },
              '\n \n',
              {
                text: `Facturado Por: ${datos_factura[i].nombreCreador}\n`,
                alignment: 'left',
                style: 'header',
              },
              '\n \n',
              {
                text: `\n Información detallada de la Factura \n \n`,
                alignment: 'center',
                style: 'header'
              },
              {
                style: 'tablaCliente',
                table: {
                  widths: ['*', '*'],
                  style: 'header',
                  body: [
                    [
                      `Código: ${factura.toUpperCase()}`,
                      ``
                    ],
                  ]
                },
                layout: 'lightHorizontalLines',
                fontSize: 9,
              },
              '\n \n',
              {
                text: `\n\n Información detallada de los rollos ingresados \n `,
                alignment: 'center',
                style: 'header'
              },

              this.table(this.rollosAsignados, ['Rollo', 'Producto', 'Nombre', 'Cantidad', 'Presentacion']),
              {
                text: `\n \nObervación: \n ${datos_factura[i].devProdFact_Observacion}\n`,
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
        break;
      }
    });
  }

  // Funcion que traerá los rollos que fueron asignados a la factura creada
  buscarRolloPDFDevolucion(factura){
    this.rollosAsignados = [];
    this.consolidadoRollo = [];
    this.cargando = false;
    this.dtDevolucion.srvObtenerCrearPDF(factura.toUpperCase()).subscribe(datos_factura => {
      for (let i = 0; i < datos_factura.length; i++) {
        let info : any = {
          Rollo : datos_factura[i].rollo_Id,
          Producto : datos_factura[i].prod_Id,
          Nombre : datos_factura[i].prod_Nombre,
          Cantidad : this.formatonumeros(datos_factura[i].dtDevProdFact_Cantidad),
          Presentacion : datos_factura[i].undMed_Id,
        }
        this.rollosAsignados.push(info);
      }
    });
    setTimeout(() => { this.crearPDFDevolucion(factura); }, 2500);
  }

  // Funcion que creará un pdf a base de la informacion ingresada en las asignacion de rollos a facturas
  crearPDFEntrada(ot){
    let nombre : string = this.storage_Nombre;
    this.dtEntradaService.srvObtenerCrearPDF(ot).subscribe(datos_factura => {
      for (let i = 0; i < datos_factura.length; i++) {
        for (let j = 0; j < this.rollosAsignados.length; j++) {
          const pdfDefinicion : any = {
            info: {
              title: `${ot}`
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
                    text: `Rollos Ingresados N° ${ot}`,
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
                  widths: [90, '*', 90, '*'],
                  style: 'header',
                  body: [
                    [
                      {
                        border: [false, false, false, false],
                        text: `Nombre Empresa`
                      },
                      {
                        border: [false, false, false, true],
                        text: `Plasticaribe S.A.S`
                      },
                      {
                        border: [false, false, false, false],
                        text: `Fecha`
                      },
                      {
                        border: [false, false, false, true],
                        text: `${datos_factura[i].entRolloProd_Fecha.replace('T00:00:00', '')}`
                      },
                    ],
                    [
                      {
                        border: [false, false, false, false],
                        text: `Dirección`
                      },
                      {
                        border: [false, false, false, true],
                        text: `${datos_factura[i].empresa_Direccion}`
                      },
                      {
                        border: [false, false, false, false],
                        text: `Ciudad`
                      },
                      {
                        border: [false, false, false, true],
                        text: `${datos_factura[i].empresa_Ciudad}`
                      },
                    ],
                  ]
                },
                layout: {
                  defaultBorder: false,
                },
                fontSize: 9,
              },
              '\n \n',
              {
                text: `Ingresados Por: ${datos_factura[i].nombreCreador}\n`,
                alignment: 'left',
                style: 'header',
              },
              '\n \n',
              {
                text: `\n\n Información consolidada de producto(s) ingresados(s) \n `,
                alignment: 'center',
                style: 'header'
              },

              this.table2(this.consolidadoRollo, ['Producto', 'Nombre', 'Cantidad', 'Presentacion', 'Rollos']),
              {
                text: `\n\n Información detallada de los rollos ingresados \n `,
                alignment: 'center',
                style: 'header'
              },

              this.table(this.rollosAsignados, ['Rollo', 'Producto', 'Nombre', 'Cantidad', 'Presentacion']),
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
        break;
      }
    });
  }

  // Funcion que traerá los rollos que fueron asignados a la factura creada
  buscarRolloPDFEntrada(ot){
    this.rollosAsignados = [];
    this.consolidadoRollo = [];
    this.cargando = false;
    this.dtEntradaService.srvObtenerCrearPDF(ot).subscribe(datos_factura => {
      for (let i = 0; i < datos_factura.length; i++) {
        let info : any = {
          Rollo : datos_factura[i].rollo_Id,
          Producto : datos_factura[i].prod_Id,
          Nombre : datos_factura[i].prod_Nombre,
          Cantidad : this.formatonumeros(datos_factura[i].dtEntRolloProd_Cantidad),
          Presentacion : datos_factura[i].undMed_Rollo,
        }
        this.rollosAsignados.push(info);
      }
    });
    this.dtEntradaService.srvObtenerCrearPDF2(ot).subscribe(datos_factura => {
      for (let i = 0; i < datos_factura.length; i++) {
        let info : any = {
          Producto : datos_factura[i].prod_Id,
          Nombre : datos_factura[i].prod_Nombre,
          Cantidad : this.formatonumeros(datos_factura[i].suma),
          Presentacion : datos_factura[i].undMed_Prod,
          Rollos : datos_factura[i].cantRollos,
        }
        this.consolidadoRollo.push(info);
      }
    });
    setTimeout(() => { this.crearPDFEntrada(ot); }, 2500);
  }

  // Funcion que creará un pdf a base de la informacion del pre ingreso de rollos
  crearPDFPreEntrada(ot, proceso){
    let nombre : string = this.storage_Nombre;
    this.preCargueService.srvCrearPDF(ot, proceso).subscribe(datos_factura => {
      for (let i = 0; i < datos_factura.length; i++) {
        for (let j = 0; j < this.rollosAsignados.length; j++) {
          const pdfDefinicion : any = {
            info: {
              title: `${ot}`
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
                    text: `Rollos Pre Ingresados N° ${ot}`,
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
                  widths: [90, '*', 90, '*'],
                  style: 'header',
                  body: [
                    [
                      {
                        border: [false, false, false, false],
                        text: `Nombre Empresa`
                      },
                      {
                        border: [false, false, false, true],
                        text: `Plasticaribe S.A.S`
                      },
                      {
                        border: [false, false, false, false],
                        text: `Fecha`
                      },
                      {
                        border: [false, false, false, true],
                        text: `${datos_factura[i].preEntRollo_Fecha.replace('T00:00:00', '')}`
                      },
                    ],
                    [
                      {
                        border: [false, false, false, false],
                        text: `Dirección`
                      },
                      {
                        border: [false, false, false, true],
                        text: `${datos_factura[i].empresa_Direccion}`
                      },
                      {
                        border: [false, false, false, false],
                        text: `Ciudad`
                      },
                      {
                        border: [false, false, false, true],
                        text: `${datos_factura[i].empresa_Ciudad}`
                      },
                    ],
                  ]
                },
                layout: {
                  defaultBorder: false,
                },
                fontSize: 9,
              },
              '\n \n',
              {
                text: `Ingresados Por: ${datos_factura[i].nombreCreador}\n`,
                alignment: 'left',
                style: 'header',
              },
              '\n \n',
              {
                text: `\n\n Información consolidada de producto(s) ingresados(s) \n `,
                alignment: 'center',
                style: 'header'
              },

              this.table2(this.consolidadoRollo, ['Producto', 'Nombre', 'Cantidad', 'Presentacion', 'Rollos']),
              {
                text: `\n\n Información detallada de los rollos ingresados \n `,
                alignment: 'center',
                style: 'header'
              },

              this.table(this.rollosAsignados, ['Rollo', 'Producto', 'Nombre', 'Cantidad', 'Presentacion']),
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
        break;
      }
    });
  }

  // Funcion que traerá la informacin de los rollos preingresados
  buscarrolloPDFPreEntada(ot : any, proceso : any){
    this.rollosAsignados = [];
    this.consolidadoRollo = [];
    this.cargando = false;
    let cantidadRollos : number = 0;
    this.preCargueService.srvCrearPDF(ot, proceso).subscribe(datos_preIngreso => {
      for (let i = 0; i < datos_preIngreso.length; i++) {
        let info : any = {
          Rollo : datos_preIngreso[i].rollo_Id,
          Producto : datos_preIngreso[i].prod_Id,
          Nombre : datos_preIngreso[i].prod_Nombre,
          Cantidad : this.formatonumeros(datos_preIngreso[i].dtlPreEntRollo_Cantidad),
          Presentacion : datos_preIngreso[i].undMed_Rollo,
        }
        this.rollosAsignados.push(info);
      }
    });
    this.preCargueService.srvCrearPDF2(ot, proceso).subscribe(dato_preIngreso => {
      for (let i = 0; i < dato_preIngreso.length; i++) {
        let info : any = {
          Producto : dato_preIngreso[i].prod_Id,
          Nombre : dato_preIngreso[i].prod_Nombre,
          Cantidad : this.formatonumeros(dato_preIngreso[i].suma),
          Presentacion : dato_preIngreso[i].undMed_Producto,
          Rollos : dato_preIngreso[i].cantRollos,
        }
        this.consolidadoRollo.push(info);
      }
    });
    setTimeout(() => { this.crearPDFPreEntrada(ot, proceso); }, 3000);
  }

  // funcion que se encagará de llenar la tabla de los productos en el pdf
  buildTableBody(data, columns) {
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
        widths: [60, 60, 250, 70, 70],
        body: this.buildTableBody(data, columns),
      },
      fontSize: 9,
      layout: {
        fillColor: function (rowIndex, node, columnIndex) {
          return (rowIndex == 0) ? '#CCCCCC' : null;
        }
      }
    };
  }

  // Funcion que genera la tabla donde se mostrará la información de los productos pedidos
  table2(data, columns) {
    return {
      table: {
        headerRows: 1,
        widths: [60, '*', 70, 100, 50],
        body: this.buildTableBody(data, columns),
      },
      fontSize: 9,
      layout: {
        fillColor: function (rowIndex, node, columnIndex) {
          return (rowIndex == 0) ? '#CCCCCC' : null;
        }
      }
    };
  }

}
