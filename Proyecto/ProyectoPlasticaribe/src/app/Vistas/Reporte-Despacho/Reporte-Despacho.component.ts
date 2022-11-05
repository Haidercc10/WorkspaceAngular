import { ThisReceiver } from '@angular/compiler';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import pdfMake from 'pdfmake/build/pdfmake';
import { BagproService } from 'src/app/Servicios/Bagpro.service';
import { DetallesAsignacionProductosFacturaService } from 'src/app/Servicios/DetallesAsignacionProductosFactura.service';
import { DetallesDevolucionesProductosService } from 'src/app/Servicios/DetallesDevolucionesProductos.service';
import { DetallesEntradaRollosService } from 'src/app/Servicios/DetallesEntradaRollos.service';
import { DtPreEntregaRollosService } from 'src/app/Servicios/DtPreEntregaRollos.service';
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
  rolloFiltrados : any [] = [];
  cargando : boolean = true; //Variable para validar que salga o no la imagen de carga
  today : any = new Date(); //Variable que se usará para llenar la fecha actual
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  infoDoc : any [] = []; //Variable que almacenará la información que se verá en la tabla
  public page : number; //Variable que tendrá el paginado de la tabla
  rollosAsignados : any [] = []; //Variable que va a almacenar los rollos que fueron asignados
  consolidadoRollo : any [] = []; //Variable que va a almacenar el consolidado de la cantidad de rollos ingresados o facturados
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
  public TipoDocumento = '';
  public Estado = '';


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
                                  private dtEntradaService : DetallesEntradaRollosService,
                                    private bagProServise : BagproService,
                                      private preCargueService : DtPreEntregaRollosService,) {

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
        && (this.ValidarRol == 1 || this.ValidarRol == 6)) this.arrayTipoDoc.push(registrosTipoDoc[rtd]);
        else if (registrosTipoDoc[rtd].tpDoc_Id == 'DEVPRODFAC'
        && (this.ValidarRol == 1 || this.ValidarRol == 10 || this.ValidarRol == 7 || this.ValidarRol == 8 || this.ValidarRol == 9)) this.arrayTipoDoc.push(registrosTipoDoc[rtd]);
        else if (registrosTipoDoc[rtd].tpDoc_Id == 'ENTROLLO'
        && (this.ValidarRol == 1 || this.ValidarRol == 10 || this.ValidarRol == 7 || this.ValidarRol == 8 || this.ValidarRol == 9)) this.arrayTipoDoc.push(registrosTipoDoc[rtd]);
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
    this.infoDoc = [];
    let documento : any = this.FormConsultarFiltros.value.Documento;
    let fechaIni : any = this.FormConsultarFiltros.value.fechaDoc;
    let fechaFin : any = this.FormConsultarFiltros.value.fechaFinalDoc;
    if (documento == '') documento = null;
    if (fechaIni == '') documento = null;
    if (fechaFin == '') documento = null;


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
    setTimeout(() => { this.cargando = true; }, 2500);
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
          this.cargando = true;
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
                      ``
                    ],
                    // [
                    //   `Id Cliente: ${datos_factura[i].cli_Id}`,
                    //   `Nombre Cliente: ${datos_factura[i].cli_Nombre}`
                    // ]
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
                text: `Rollos Ingresados N° ${ot}`,
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
            content : [
              {
                text: `Rollos Pre Ingresados N° ${ot}`,
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
          this.cargando = true;
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
