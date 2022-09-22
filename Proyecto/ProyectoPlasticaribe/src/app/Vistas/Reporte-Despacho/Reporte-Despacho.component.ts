import { ThisReceiver } from '@angular/compiler';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import pdfMake from 'pdfmake/build/pdfmake';
import { DetallesAsignacionProductosFacturaService } from 'src/app/Servicios/DetallesAsignacionProductosFactura.service';
import { DetallesDevolucionesProductosService } from 'src/app/Servicios/DetallesDevolucionesProductos.service';
import { DetallesEntradaRollosService } from 'src/app/Servicios/DetallesEntradaRollos.service';
import { EntradaRollosService } from 'src/app/Servicios/EntradaRollos.service';
import { EstadosService } from 'src/app/Servicios/estados.service';
import { ProductoService } from 'src/app/Servicios/producto.service';
import { RolesService } from 'src/app/Servicios/roles.service';
import { TipoDocumentoService } from 'src/app/Servicios/tipoDocumento.service';

@Component({
  selector: 'app-Reporte-Despacho',
  templateUrl: './Reporte-Despacho.component.html',
  styleUrls: ['./Reporte-Despacho.component.css']
})
export class ReporteDespachoComponent implements OnInit {

  public FormConsultarFiltros !: FormGroup;
  public arrayProducto = [];
  public arrayRollo = [];
  public arrayEstadoRollo = [];
  public arrayTipoDoc = [];
  public arrayClientes = [];
  cargando : boolean = true; //Variable para validar que salga o no la imagen de carga
  today : any = new Date(); //Variable que se usará para llenar la fecha actual
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  infoDoc : any [] = []; //Variable que almacenará la información que se verá en la tabla
  public page : number; //Variable que tendrá el paginado de la tabla
  rollosAsignados : any [] = []; //Variable que va a almacenar los rollos que fueron asignados
  keywordProductos = 'prod_Nombre' /** Palabra clave de input productos*/
  validarInputNombresProductos : any = true;
  keywordRollo : any = 'rollo_Id' /** Palabra clave de input rollos*/
  validarInputRollo : any = true;
  keywordRollo2 = 'rollo_Id';

  keywordCliente = 'cli_Nombre';
  validarInputCliente : any;
  public Codigo = ''; /** Variable para pipe de documento */
  public Rollo = ''; /** Variable para pipe de Rollo */
  public Producto = ''; /** Variable para pipe de Producto */
  public Cliente = ''; /** Variable para pipe de Producto */



  constructor(private servicioProducto : ProductoService,
                private frmBuilder : FormBuilder,
                  private rolService : RolesService,
                    @Inject(SESSION_STORAGE) private storage: WebStorageService,
                      private servicioEstados : EstadosService,
                        private servicioTipoDoc : TipoDocumentoService,
                          private ServicioEntradaRollos :  EntradaRollosService,
                            private servicioDtlEntradaRollos: DetallesEntradaRollosService,
                              private dtAsigFactService : DetallesAsignacionProductosFacturaService,
                                private dtDevolucion : DetallesDevolucionesProductosService,
                                  private dtEntradaService : DetallesEntradaRollosService,) {

    this.FormConsultarFiltros = this.frmBuilder.group({
      Documento : [null, Validators.required],
      ProdNombre : [null, Validators.required],
      Rollo : [null, Validators.required ],
      Cliente : [null, Validators.required ],
      tipoDoc : [null, Validators.required ],
      fechaDoc: [null, Validators.required],
      fechaFinalDoc: [null, Validators.required],
      estadoRollo: [null, Validators.required],
    });
  }

  ngOnInit() {
    this.lecturaStorage();
    this.fecha();
    this.llenadoProducto();
    this.llenadoEstadoRollos();
    this.llenadoTipoDocumento();
    this.cambioKeyword();
    this.llenadoRollosIngresados();
    this.cambioKeyword();
  }

  //
  cambioKeyword() {
    this.keywordRollo2 = this.keywordRollo.toString();
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.storage.get('Id');
    this.storage_Nombre = this.storage.get('Nombre');
    let rol = this.storage.get('Rol');
    this.rolService.srvObtenerLista().subscribe(datos_roles => {
      for (let index = 0; index < datos_roles.length; index++) {
        if (datos_roles[index].rolUsu_Id == rol) {
          this.ValidarRol = rol;
          this.storage_Rol = datos_roles[index].rolUsu_Nombre;
        }
      }
    });
  }

  //Funcion que colocará la fecha actual y la colocará en el campo de fecha de pedido
  fecha(){
    this.today = new Date();
    var dd : any = this.today.getDate();
    var mm : any = this.today.getMonth() + 1;
    var yyyy : any = this.today.getFullYear();
    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
    this.today = yyyy + '-' + mm + '-' + dd;
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = '$1,';
    return number.toString().replace(exp,rep);
  }

  //
  onChangeSearchProductos(val) {
    if (val != '') this.validarInputNombresProductos = false;
    else this.validarInputNombresProductos = true;
    // fetch remote data from here
    // And reassign the 'data' which is binded to 'data' property.
  }

  //
  onFocusedProductos(e) {
    if (!e.isTrusted) this.validarInputNombresProductos = false;
    else this.validarInputNombresProductos = true;
    // do something when input is focused
  }

  //
  selectEventProducto(item) {
    this.FormConsultarFiltros.value.Producto = item.prod_Id;
    if (this.FormConsultarFiltros.value.ProdNombre != '') this.validarInputNombresProductos = false;
    else this.validarInputNombresProductos = true;
    // do something with selected item
  }

  //
  onChangeSearchCliente(val) {
    if (val != '') this.validarInputCliente = false;
    else this.validarInputCliente = true;
    // fetch remote data from here
    // And reassign the 'data' which is binded to 'data' property.
  }

  //
  onFocusedCliente(e) {
    if (!e.isTrusted) this.validarInputCliente = false;
    else this.validarInputCliente = true;
    // do something when input is focused
  }

  //
  selectEventCliente(item) {
    this.FormConsultarFiltros.value.Cliente = item.cli_Id;
    if (this.FormConsultarFiltros.value.Cliente != '') this.validarInputCliente = false;
    else this.validarInputCliente = true;
    // do something with selected item
  }

  //
  onChangeSearchRollo(val) {
    if (val != '') this.validarInputRollo = false;
    else this.validarInputRollo = true;
  }

  //
  onFocusedRollo(e) {
    if (!e.isTrusted) this.validarInputRollo = false;
    else this.validarInputRollo = true;
    // do something when input is focused
  }

  //
  selectEventRollo(item) {
    this.FormConsultarFiltros.value.Rollo = item.entRolloProd_Id;
    if (this.FormConsultarFiltros.value.Rollo != '') this.validarInputRollo = false;
    else this.validarInputRollo = true;

    // do something with selected item
  }

  //
  limpiarCampos(){
    this.FormConsultarFiltros.reset();
    this.infoDoc = [];
  }

  /** Cargar Productos en Select Input */
  llenadoProducto(){
    this.servicioProducto.srvObtenerLista().subscribe(registrosProductos => {
      for (let index = 0; index < registrosProductos.length; index++) {
         this.arrayProducto.push(registrosProductos[index]);
         //console.log(this.arrayProducto);
      }
    });
  }

  /** Cargar combo estados rollos */
  llenadoEstadoRollos() {
    this.servicioEstados.srvObtenerEstadosRollos().subscribe(registroEstadosRollos => {
      for (let index = 0; index < registroEstadosRollos.length; index++) {
        this.arrayEstadoRollo.push(registroEstadosRollos[index])
      }
    })
  }

  /** Cargar tipos de documentos a los combos. */
  llenadoTipoDocumento() {
    this.servicioTipoDoc.srvObtenerLista().subscribe(registrosTipoDoc => {
      for(let rtd = 0; rtd < registrosTipoDoc.length; rtd++) {
        if(registrosTipoDoc[rtd].tpDoc_Id == 'ASIGPRODFV'
        || registrosTipoDoc[rtd].tpDoc_Id == 'DEVPRODFAC'
        || registrosTipoDoc[rtd].tpDoc_Id == 'ENTROLLO') {

          this.arrayTipoDoc.push(registrosTipoDoc[rtd])
        }
      }
    });
  }

 /** Cargar rollos desde EntradasRollos_Productos */
  llenadoRollosIngresados() {
    this.servicioDtlEntradaRollos.srvObtenerLista().subscribe(registrosRollos => {
      for (let index = 0; index < registrosRollos.length; index++) {
        let info : any = {
          rollo_Id : `${registrosRollos[index].rollo_Id}`
        }
        this.arrayRollo.push(info);
      }
    });
  }

  // Funcion que va a consultar por los filtros que se busquen
  consultarFiltros(){
    this.cargando = false;
    let documento : any = this.FormConsultarFiltros.value.Documento;
    let fechaIni : any = this.FormConsultarFiltros.value.fechaDoc;
    let fechaFin : any = this.FormConsultarFiltros.value.fechaFinalDoc;

    if (fechaIni != null && fechaFin != null) {
      this.dtAsigFactService.srvConsultarPorFiltroFechas(fechaIni, fechaFin).subscribe(datos_factura => {
        for (let i = 0; i < datos_factura.length; i++) {
          this.llenarTabla(datos_factura[i]);
        }
      });
    } else if (documento != null) {

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
    setTimeout(() => { this.cargando = true; }, 2500);
  }

  // Funcion que se encagará de llenar la tabla con la informacion consultada
  llenarTabla(datos : any){
    if (datos.tipo == 'ASIGPRODFV') {
      let info : any = {
        Codigo : datos.documento,
        IdProducto : datos.prod_Id,
        Producto : datos.prod_Nombre,
        Rollo : datos.rollo,
        Cantidad : datos.cantidad,
        Presentacion : datos.presentacion,
        Fecha : datos.fecha.replace('T00:00:00', ''),
        EstadoRollo : datos.estado_Rollo,
        IdTipoDoc : 'ASIGPRODFV',
        TipoDoc : 'Factura'
      }
      this.infoDoc.push(info);
    } else if (datos.tipo == 'DEVPRODFAC') {
      let info : any = {
        Codigo : datos.documento,
        IdProducto : datos.prod_Id,
        Producto : datos.prod_Nombre,
        Rollo : datos.rollo,
        Cantidad : datos.cantidad,
        Presentacion : datos.presentacion,
        Fecha : datos.fecha.replace('T00:00:00', ''),
        EstadoRollo : datos.estado_Rollo,
        IdTipoDoc : 'DEVPRODFAC',
        TipoDoc : 'Devolución Productos'
      }
      this.infoDoc.push(info);
    } else if (datos.tipo == 'ENTROLLO') {
      let info : any = {
        Codigo : datos.documento,
        IdProducto : datos.prod_Id,
        Producto : datos.prod_Nombre,
        Rollo : datos.rollo,
        Cantidad : datos.cantidad,
        Presentacion : datos.presentacion,
        Fecha : datos.fecha.replace('T00:00:00', ''),
        EstadoRollo : datos.estado_Rollo,
        IdTipoDoc : 'ENTROLLO',
        TipoDoc : 'Entrada Rollo'
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
  }

  // Funcion que creará un pdf a base de la informacion ingresada en las asignacion de rollos a facturas
  crearPDFFactura(factura){
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
            content : [
              {
                text: `Rollos de la Factura ${factura.toUpperCase()}`,
                alignment: 'right',
                style: 'titulo',
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
                text: `\n\n Información detallada de producto(s) pedido(s) \n `,
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
          this.cargando = true;
          break;
        }
        break;
      }
    });
  }

  // Funcion que traerá los rollos que fueron asignados a la factura creada
  buscarRolloPDFFActura(factura){
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
    setTimeout(() => { this.crearPDFFactura(factura); }, 2500);
  }

  // Funcion que creará un pdf a base de la informacion ingresada en las asignacion de rollos a facturas
  crearPDFDevolucion(factura){
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
            content : [
              {
                text: `Rollos devueltos de la factura ${factura.toUpperCase()}`,
                alignment: 'right',
                style: 'titulo',
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
                      `Nota Credito: ${datos_factura[i].notaCredito_Id}`
                    ],
                    [
                      `Id Cliente: ${datos_factura[i].cli_Id}`,
                      `Nombre Cliente: ${datos_factura[i].cli_Nombre}`
                    ]
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
          this.cargando = true;
          break;
        }
        break;
      }
    });
  }

  // Funcion que traerá los rollos que fueron asignados a la factura creada
  buscarRolloPDFDevolucion(factura){
    this.rollosAsignados = [];
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
            content : [
              {
                text: `Rollos Ingresados de la OT ${ot}`,
                alignment: 'right',
                style: 'titulo',
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
          this.cargando = true;
          break;
        }
        break;
      }
    });
  }

  // Funcion que traerá los rollos que fueron asignados a la factura creada
  buscarRolloPDFEntrada(ot){
    this.rollosAsignados = [];
    this.cargando = false;
    this.dtEntradaService.srvObtenerCrearPDF(ot).subscribe(datos_factura => {
      for (let i = 0; i < datos_factura.length; i++) {
        let info : any = {
          Rollo : datos_factura[i].rollo_Id,
          Producto : datos_factura[i].prod_Id,
          Nombre : datos_factura[i].prod_Nombre,
          Cantidad : this.formatonumeros(datos_factura[i].dtEntRolloProd_Cantidad),
          Presentacion : datos_factura[i].undMed_Id,
        }
        this.rollosAsignados.push(info);
      }
    });
    setTimeout(() => { this.crearPDFEntrada(ot); }, 2500);
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
}
