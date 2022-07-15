import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import pdfMake from 'pdfmake/build/pdfmake';
import { CategoriaMateriaPrimaService } from 'src/app/Servicios/categoriaMateriaPrima.service';
import { FacturaMpService } from 'src/app/Servicios/facturaMp.service';
import { FactuaMpCompradaService } from 'src/app/Servicios/facturaMpComprada.service';
import { MateriaPrimaService } from 'src/app/Servicios/materiaPrima.service';
import { ProveedorService } from 'src/app/Servicios/proveedor.service';
import { RemisionService } from 'src/app/Servicios/Remision.service';
import { RemisionesMPService } from 'src/app/Servicios/remisionesMP.service';
import { RemisionFacturaService } from 'src/app/Servicios/remisionFactura.service';
import { RolesService } from 'src/app/Servicios/roles.service';
import { TipoBodegaService } from 'src/app/Servicios/tipoBodega.service';
import { TipoDocumentoService } from 'src/app/Servicios/tipoDocumento.service';
import { UsuarioService } from 'src/app/Servicios/usuario.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-consultaFac_Rem_MP',
  templateUrl: './consultaFac_Rem_MP.component.html',
  styleUrls: ['./consultaFac_Rem_MP.component.css']
})
export class ConsultaFac_Rem_MPComponent implements OnInit {

  public FormDocumentos !: FormGroup;

  //Llamar modales, inicializados como falsos para que no se carguen al ingresar a la pagina.
  public ModalCrearProveedor: boolean = false;
  public ModalCrearMateriaPrima: boolean= false;

  /* Vaiables*/
  public page : number; //Variable que tendrá el paginado de la tabla en la que se muestran los pedidos consultados
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  ultimoIdMateriaPrima : number; //Varibale que va a almacenar el id de la ultima materia prima registrada y le va a sumar 1
  materiasPrimas = []; //Variable que va almacenar el nombre de todas las materias primas existentes en la empresa
  materiasPrimasRetiradas = []; //Variable que va almacenar el nombre de todas las materias primas existentes en la empresa
  nombreCategoriasMP = []; //VAriable que va a almacenar el nombre de todas las categorias de materias primas existentes en la empresa
  unidadMedida = []; //Varibale que va a almacenar las unidades de medida registradas en la base de datos
  usuarios = []; //Variable que va a almacenar todos los usuarios de la empresa
  estado = []; //Variable que va a almacenar todos los tipos de estados de documentos
  procesos = []; //Variable que va a almacenar los procesos que tiene la empresa (extrusio, impresion, etc...)
  areas = []; //Varibale que va a almacenar las areas de la empresa
  materiaPrimaBuscadaId = []; //Variable que almacenará la informacion de la materia prima buscada por ID
  categoriaMPBuscadaID : string; //Variable que almacenará el nombre de la categoria de la materia prima buscada por Id
  tipobodegaMPBuscadaId : string; //Variable que almacenará el nombrede la bodega en la que se encuentra la materia prima buscada
  materiaPrimaSeleccionada = []; //Variable que almacenará la informacion de la materia prima seleccionada
  categoriaMPSeleccionada : string; //Variable que almacenará el nombre de la categoria de la materia prima seleccionada
  tipoBodegaMPSeleccionada : string; //Variable que almacenará el nombrede la bodega en la que se encuentra la materia prima seleccionada
  facturaMateriaPrima = []; //Funcion que guardará la informacion de la factura de materia prima comprada que ha sido consultada
  today : any = new Date(); //Variable que se usará para llenar la fecha actual
  titulosTabla = []; //Variable que almacenará los titulos de la tabla de productos que se ve al final de la vista
  ArrayDocumento : any [] = []; //Variable que tendrá la informacion de los productos que se piden en el nuevo pedido
  ArrayMateriaPrimaRetirada : any [] = []; //Variable que tendrá la informacion de los productos que se piden para uan OT
  AccionBoton = "Agregar"; //Variable que almanará informacio para saber si una materia prima está en edicion o no (Se editará una materia prima cargada en la tabla, no una en la base de datos)
  valorTotal : number = 0; //Variable que guardará el valor total de la factura de entrada de materia prima
  nombreMateriaPrima : string; //Varible que almacenará el nombre de una materia prima consultado o seleccionado
  precioOT : number; //Variable que va a almacenar el precio de la ot consultada
  cantidadTotalExt : number; //Variable que va a almacenar el total de la cantidad extruida en una OT
  cantidadTotalImp : number; //Variable que va a almacenar el total de la cantidad impresa en una OT
  cantidadTotalDbl : number; //Variable que va a almacenar el total de la cantidad doblada en una OT
  proceso : string = ''; //Variable ayudará a almacenar el proceso del cuela se está consultando la ot
  totalPorcentajePerida : number; //Variable que ayudará a calcular el total de perdida en una OT

  tipoDocumento = [];
  proveedor = [];
  documentoInfo = [];
  mpAgregada = [];

  remision : any = [];
  remConFac : any = [];

  /* CONSULTAS DE MATERIA PRIMA */
  MpConsultada = [];
  public load: boolean;

  constructor(private materiaPrimaService : MateriaPrimaService,
                private categoriMpService : CategoriaMateriaPrimaService,
                  private tipoBodegaService : TipoBodegaService,
                    private rolService : RolesService,
                      private frmBuilderMateriaPrima : FormBuilder,
                        @Inject(SESSION_STORAGE) private storage: WebStorageService,
                          private tipoDocuemntoService : TipoDocumentoService,
                            private proveedorService : ProveedorService,
                              private remisionService : RemisionService,
                                private remisionMpService : RemisionesMPService,
                                  private facturaCompraService : FactuaMpCompradaService,
                                    private facturaCompraMPService : FacturaMpService,
                                      private usuarioService : UsuarioService,
                                        private remisionFacturaService : RemisionFacturaService) {

    this.FormDocumentos = this.frmBuilderMateriaPrima.group({
      idDocumento : new FormControl(),
      TipoDocumento: new FormControl(),
      proveedores: new FormControl(),
      fecha: new FormControl(),
    });

    this.load = true;
  }


  ngOnInit(): void {
    this.initForms();
    this.lecturaStorage();
    this.ColumnasTabla();
    this.obtenerTipoDocumento();
    this.obtenerProveedor();
  }

  initForms() {
    this.FormDocumentos = this.frmBuilderMateriaPrima.group({
      idDocumento : [,Validators.required],
      TipoDocumento: [, Validators.required],
      proveedores : [, Validators.required],
      fecha: [, Validators.required],
    });
  }

  LimpiarCampos() {
    this.FormDocumentos.reset();
    this.ArrayDocumento = [];
    this.valorTotal = 0;
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = '$1,';
    return number.toString().replace(exp,rep);
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

  /* FUNCION PARA RELIZAR CONFIMACIÓN DE SALIDA */
  confimacionSalida(){
    Swal.fire({
      title: '¿Seguro que desea salir?',
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: 'Salir',
      denyButtonText: `No Salir`,
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) window.location.href = "./";
    })
  }

  obtenerTipoDocumento(){
    this.tipoDocuemntoService.srvObtenerLista().subscribe(datos_tiposDocumentos => {
      for (let index = 0; index < datos_tiposDocumentos.length; index++) {
        this.tipoDocumento.push(datos_tiposDocumentos[index])
      }
    });
  }

  obtenerProveedor(){
    this.proveedorService.srvObtenerLista().subscribe(datos_proveedores => {
      for (let index = 0; index < datos_proveedores.length; index++) {
        this.proveedor.push(datos_proveedores[index]);
        this.proveedor.sort((a, b) => a.prov_Nombre.localeCompare(b.prov_Nombre));
      }
    })
  }

  //Funcion que colocará el nombre a las columnas de la tabla en la cual se muestran los productos pedidos por los clientes
  ColumnasTabla(){
    this.titulosTabla = [];
    this.titulosTabla = [{
      idFact : "Id",
      tipo : "Tipo de Documento",
      FechaFact : "Fecha Registro",
      proveedor : "Proveedor",
      Costo : "Costo Total",
      Ver : "Ver",
    }]
  }

  validarConsulta(){
    this.ArrayDocumento = [];
    this.remision = [];
    this.remConFac = [];
    let idDoc : number = this.FormDocumentos.value.idDocumento;
    let fecha : any = this.FormDocumentos.value.fecha;
    let TipoDocumento : string = this.FormDocumentos.value.TipoDocumento;
    let proveedores : number = this.FormDocumentos.value.proveedores;
    let fechaCreacionFinal : any;
    let fechaEntregaFinal : any;
    let acu : number = 0;


    if (idDoc != null) {
      this.facturaCompraService.srvObtenerListaPorId(idDoc).subscribe(datos_factura => {
        this.lenarTabla(datos_factura);
      }, error => {
        this.remisionService.srvObtenerListaPorId(idDoc).subscribe(datos_remision => {
          this.lenarTabla(datos_remision);
        });
      });
    } else if (fecha != null) {
      this.facturaCompraService.srvObtenerLista().subscribe(datos_factura => {
        for (let index = 0; index < datos_factura.length; index++) {
          let FechaCreacionDatetime = datos_factura[index].facco_FechaFactura;
          let FechaCreacionNueva = FechaCreacionDatetime.indexOf("T");
          fechaCreacionFinal = FechaCreacionDatetime.substring(0, FechaCreacionNueva);
          if (moment(fechaCreacionFinal).isBetween(fecha, undefined)) {
            this.lenarTabla(datos_factura[index]);
          }
        }
      });

      this.remisionService.srvObtenerLista().subscribe(datos_remision => {
        for (let index = 0; index < datos_remision.length; index++) {
          let FechaCreacionDatetime = datos_remision[index].rem_Fecha;
          let FechaCreacionNueva = FechaCreacionDatetime.indexOf("T");
          fechaCreacionFinal = FechaCreacionDatetime.substring(0, FechaCreacionNueva);
          if (moment(fechaCreacionFinal).isBetween(fecha, undefined)) {
            this.lenarTabla(datos_remision[index]);
          }
        }
      })
    } else if (TipoDocumento != null) {
      if (TipoDocumento ==  'FCO') {
        this.facturaCompraService.srvObtenerLista().subscribe(datos_factura => {
          for (let index = 0; index < datos_factura.length; index++) {
            this.lenarTabla(datos_factura[index]);
          }
        }, error => { Swal.fire("No hay facturas registradas"); this.load = true;});
      } else if (TipoDocumento ==  'REM') {
        this.remisionService.srvObtenerLista().subscribe(datos_remision => {
          for (let index = 0; index < datos_remision.length; index++) {
            this.lenarTabla(datos_remision[index]);
          }
        }, error => { Swal.fire("No hay remisiones registradas"); this.load = true;});
      } else if (TipoDocumento == 'Remisiones sin Factura') {
        this.load = false;
        // Llenado d Array con Remisiones
        this.remisionService.srvObtenerLista().subscribe(datos_remision => {
          for (let index = 0; index < datos_remision.length; index++) {
            datos_remision[index].tpDoc_Id = 'Remisiones sin Factura';
            this.remision.push(datos_remision[index].rem_Id);
          }
        }, error => { Swal.fire("No hay remisiones registradas"); this.load = true;});

        // Llenado de Array con Remisiones con Facturas
        this.remisionFacturaService.srvObtenerLista().subscribe(datos_remisionesFacturas => {
          for (let i = 0; i < datos_remisionesFacturas.length; i++) {
            this.remConFac.push(datos_remisionesFacturas[i].rem_Id);
          }
        }, error => { Swal.fire("No hay remisiones registradas"); this.load = true;});

        // Se esperan unos segundos a que termine el llenado
        setTimeout(() => {
          // Variable para validar que un dato en los 2 Array es igual
          let res = 0;
          // Recorre Array con Remisiones
          for (let l = 0; l < this.remision.length; l++) {
            res = 0
            // Recorre Array con Remisiones con Facturas
            for (let m = 0; m < this.remConFac.length; m++) {
              // Pregunta si la remision tiene factura
              if (this.remision.includes(this.remConFac[m])) {
                // Pregunta si el dato de los Arrays es igual
                if (this.remision[l] == this.remConFac[m]) {
                  res = 1;
                  // Quita el dato que es igual del primer Array
                  this.remision.splice(l, 1);
                }
              }
            }
            if (res == 1) continue;
            else continue;
          }

          // Recorre el Array de Remisiones y busca cada id para mostrarlo en la tabla
          for (let k = 0; k < this.remision.length; k++) {
            this.remisionService.srvObtenerListaPorId(this.remision[k]).subscribe(datos_remision => {
              this.lenarTabla(datos_remision);
            });
          }
          this.load = true;
        }, 2000);
      } else if (TipoDocumento == 'Facturas sin Remisiones') {

        this.load = false;
        let facturas = [];
        this.remConFac = [];

        this.facturaCompraService.srvObtenerLista().subscribe(datos_facturas => {
          for (let i = 0; i < datos_facturas.length; i++) {
            facturas.push(datos_facturas[i].facco_Id);
          }
        });

        this.remisionFacturaService.srvObtenerLista().subscribe(datos_remisionesFacturas => {
          for (let j = 0; j < datos_remisionesFacturas.length; j++) {
            this.remConFac.push(datos_remisionesFacturas[j].facco_Id);
          }
        });

        setTimeout(() => {
          // Variable para validar que un dato en los 2 Array es igual
          let res = 0;
          // Recorre Array con Remisiones
          for (let l = 0; l < facturas.length; l++) {
            res = 0
            // Recorre Array con Remisiones con Facturas
            for (let m = 0; m < this.remConFac.length; m++) {
              // Pregunta si la remision tiene factura
              if (facturas.includes(this.remConFac[m])) {
                // Pregunta si el dato de los Arrays es igual
                if (facturas[l] == this.remConFac[m]) {
                  res = 1;
                  // Quita el dato que es igual del primer Array
                  facturas.splice(l, 1);
                }
              }
            }
            if (res == 1) continue;
            else continue;
          }

          // Recorre el Array de Remisiones y busca cada id para mostrarlo en la tabla
          for (let k = 0; k < facturas.length; k++) {
            this.facturaCompraService.srvObtenerListaPorId(facturas[k]).subscribe(datos_factura => {
              this.lenarTabla(datos_factura);
            });
          }
          this.load = true;
        }, 2000);
      }
    } else if (proveedores != null) {
      this.facturaCompraService.srvObtenerListaPorProvId(proveedores).subscribe(datos_factura => {
        for (let index = 0; index < datos_factura.length; index++) {
          if (datos_factura[index].prov_Id == proveedores) {
            this.lenarTabla(datos_factura[index]);
          }
        }

        this.remisionService.srvObtenerListaPorProv(proveedores).subscribe(datos_remision => {
          for (let index = 0; index < datos_remision.length; index++) {
            if (datos_remision[index].prov_Id == proveedores) {
              this.lenarTabla(datos_remision[index]);
            }
          }
        });
      });
    } else {
      this.facturaCompraService.srvObtenerLista().subscribe(datos_factura => {
        for (let index = 0; index < datos_factura.length; index++) {
          this.lenarTabla(datos_factura[index]);
        }

        this.remisionService.srvObtenerLista().subscribe(datos_remision => {
          for (let index = 0; index < datos_remision.length; index++) {
            this.lenarTabla(datos_remision[index]);
          }
        });
      });
    }
  }


  lenarTabla(formulario : any){
    if (formulario.tpDoc_Id == 'FCO') {

      const infoDoc : any = {
        id : formulario.facco_Id,
        codigo : formulario.facco_Codigo,
        tipoDoc : formulario.tpDoc_Id,
        fecha : formulario.facco_FechaFactura,
        proveedor : formulario.prov_Id,
        subTotal : formulario.facco_ValorTotal,
      }
      this.ArrayDocumento.push(infoDoc);
      this.ArrayDocumento.sort((a,b) => b.fecha.localeCompare(a.fecha));
      this.proveedorService.srvObtenerListaPorId(infoDoc.proveedor).subscribe(datos_proveedor => {
        infoDoc.proveedor = datos_proveedor.prov_Nombre;
      });

    } else if (formulario.tpDoc_Id == 'REM') {

      const infoDoc : any = {
        id : formulario.rem_Id,
        codigo : formulario.rem_Codigo,
        tipoDoc : formulario.tpDoc_Id,
        fecha : formulario.rem_Fecha,
        proveedor : formulario.prov_Id,
        subTotal : formulario.rem_PrecioEstimado,
      }
      this.ArrayDocumento.push(infoDoc);
      this.ArrayDocumento.sort((a,b) => b.fecha.localeCompare(a.fecha));
      this.proveedorService.srvObtenerListaPorId(infoDoc.proveedor).subscribe(datos_proveedor => {
        infoDoc.proveedor = datos_proveedor.prov_Nombre;
      });

    } else if (formulario.tpDoc_Id == 'Remisiones sin Factura') {

      const infoDoc : any = {
        id : formulario.rem_Id,
        codigo : formulario.rem_Codigo,
        tipoDoc : formulario.tpDoc_Id,
        fecha : formulario.rem_Fecha,
        proveedor : formulario.prov_Id,
        subTotal : formulario.rem_PrecioEstimado,
      }
      this.ArrayDocumento.push(infoDoc);
      this.ArrayDocumento.sort((a,b) => b.fecha.localeCompare(a.fecha));
      this.proveedorService.srvObtenerListaPorId(infoDoc.proveedor).subscribe(datos_proveedor => {
        infoDoc.proveedor = datos_proveedor.prov_Nombre;
      });
    }
    this.load = true;
  }

  // Funcion que llena el array con los productos que pertenecen al pedido que se consulta
  llenarDocumento(formulario : any){
    let id : any = formulario.id;
    let tipoDoc : any = formulario.tipoDoc;
    this.mpAgregada = [];

    if (tipoDoc == 'FCO') {
      this.facturaCompraMPService.srvObtenerListaPorFacId(id).subscribe(datos_mpFactura => {
        for (let index = 0; index < datos_mpFactura.length; index++) {
          this.materiaPrimaService.srvObtenerListaPorId(datos_mpFactura[index].matPri_Id).subscribe(datos_materiPrima => {
            const mpFactura : any = {
              Id : datos_materiPrima.matPri_Id,
              Nombre : datos_materiPrima.matPri_Nombre,
              Cant : this.formatonumeros(datos_mpFactura[index].faccoMatPri_Cantidad),
              UndCant : datos_mpFactura[index].undMed_Id,
              Stock : datos_materiPrima.matPri_Stock,
              UndStock : datos_materiPrima.undMed_Id,
              PrecioUnd : this.formatonumeros(datos_mpFactura[index].faccoMatPri_ValorUnitario),
              SubTotal : this.formatonumeros(datos_mpFactura[index].faccoMatPri_Cantidad * datos_mpFactura[index].faccoMatPri_ValorUnitario),
            }
            this.mpAgregada.push(mpFactura);
          });
        }
      });
    } else if (tipoDoc == 'REM') {
      this.remisionMpService.srvObtenerListaPorRemId(id).subscribe(datos_remisionMP => {
        for (let index = 0; index < datos_remisionMP.length; index++) {
          this.materiaPrimaService.srvObtenerListaPorId(datos_remisionMP[index].matPri_Id).subscribe(datos_materiPrima => {
            const mpFactura : any = {
              Id : datos_materiPrima.matPri_Id,
              Nombre : datos_materiPrima.matPri_Nombre,
              Cant : this.formatonumeros(datos_remisionMP[index].remiMatPri_Cantidad),
              UndCant : datos_remisionMP[index].undMed_Id,
              Stock : datos_materiPrima.matPri_Stock,
              UndStock : datos_materiPrima.undMed_Id,
              PrecioUnd : this.formatonumeros(datos_remisionMP[index].remiMatPri_ValorUnitario),
              SubTotal : this.formatonumeros(datos_remisionMP[index].remiMatPri_Cantidad * datos_remisionMP[index].remiMatPri_ValorUnitario),
            }
            this.mpAgregada.push(mpFactura);
          })
        }
      });
    } else if (tipoDoc == 'Remisiones sin Factura') {
      this.remisionMpService.srvObtenerListaPorRemId(id).subscribe(datos_remisionMP => {
        for (let index = 0; index < datos_remisionMP.length; index++) {
          this.materiaPrimaService.srvObtenerListaPorId(datos_remisionMP[index].matPri_Id).subscribe(datos_materiPrima => {
            const mpFactura : any = {
              Id : datos_materiPrima.matPri_Id,
              Nombre : datos_materiPrima.matPri_Nombre,
              Cant : this.formatonumeros(datos_remisionMP[index].remiMatPri_Cantidad),
              UndCant : datos_remisionMP[index].undMed_Id,
              Stock : datos_materiPrima.matPri_Stock,
              UndStock : datos_materiPrima.undMed_Id,
              PrecioUnd : this.formatonumeros(datos_remisionMP[index].remiMatPri_ValorUnitario),
              SubTotal : this.formatonumeros(datos_remisionMP[index].remiMatPri_Cantidad * datos_remisionMP[index].remiMatPri_ValorUnitario),
            }
            this.mpAgregada.push(mpFactura);
          });
        }
      });
    }
    this.llenarPDFConBD(formulario);
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
          widths: ['*', '*', '*', '*', '*', '*'],
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

  // Funcion para llenar el pdf con información de la base de datos dependiendo el pedido
  llenarPDFConBD(formulario : any){
    let id : any = formulario.id;
    let tipoDoc : any = formulario.tipoDoc;
    let remisionFactura = [];
    let mpremision = [];
    let infoMp = [];

    if (tipoDoc == 'FCO') {
      this.facturaCompraService.srvObtenerListaPorId(id).subscribe(datos_factura => {
        this.facturaCompraMPService.srvObtenerListaPorFacId(id).subscribe(datos_mpFactura => {
          this.usuarioService.srvObtenerListaPorId(datos_factura.usua_Id).subscribe(datos_usuario => {
            this.proveedorService.srvObtenerListaPorId(datos_factura.prov_Id).subscribe(datos_proveedor => {
              this.remisionFacturaService.srvObtenerListaPorFactId(id).subscribe(datos_remisionFactura => {
                if (datos_remisionFactura.length == 0) {
                  for (let mp = 0; mp < this.mpAgregada.length; mp++) {
                    let FechaEntregaDatetime = datos_factura.facco_FechaFactura;
                    let FechaEntregaNueva = FechaEntregaDatetime.indexOf("T");
                    let fecharegistroFinal = FechaEntregaDatetime.substring(0, FechaEntregaNueva);

                    const pdfDefinicion : any = {
                      info: {
                        title: `${datos_factura.facco_Codigo}`
                      },
                      content : [
                        {
                          text: `Plasticaribe S.A.S ---- Factura de Compra de Materia Prima`,
                          alignment: 'center',
                          style: 'titulo',
                        },
                        '\n \n',
                        {
                          text: `Fecha de registro: ${fecharegistroFinal}`,
                          style: 'header',
                          alignment: 'right',
                        },
                        {
                          text: `Registrado Por: ${datos_usuario.usua_Nombre}\n`,
                          alignment: 'right',
                          style: 'header',
                        },
                        {
                          text: `\n Información detallada del Proveedor \n \n`,
                          alignment: 'center',
                          style: 'header'
                        },
                        {
                          style: 'tablaCliente',
                          table: {
                            widths: ['*', '*', '*'],
                            style: 'header',
                            body: [
                              [
                                `ID: ${datos_proveedor.prov_Id}`,
                                `Tipo de ID: ${datos_proveedor.tipoIdentificacion_Id}`,
                                `Tipo de Cliente: ${datos_proveedor.tpProv_Id}`
                              ],
                              [
                                `Nombre: ${datos_proveedor.prov_Nombre}`,
                                `Telefono: ${datos_proveedor.prov_Telefono}`,
                                `Ciudad: ${datos_proveedor.prov_Ciudad}`
                              ],
                              [
                                `E-mail: ${datos_proveedor.prov_Email}`,
                                ``,
                                ``
                              ]
                            ]
                          },
                          layout: 'lightHorizontalLines',
                          fontSize: 9,
                        },
                        {
                          text: `\n \nObervación sobre la factura: \n ${datos_factura.facco_Observacion}\n`,
                          style: 'header',
                        },
                        {
                          text: `\n Información detallada de Materia(s) Prima(s) comprada(s) \n `,
                          alignment: 'center',
                          style: 'header'
                        },

                        this.table(this.mpAgregada, ['Id', 'Nombre', 'Cant', 'UndCant', 'PrecioUnd', 'SubTotal']),

                        {
                          text: `\n\nValor Total Factura: $${this.formatonumeros(datos_factura.facco_ValorTotal)}`,
                          alignment: 'right',
                          style: 'header',
                        },


                      ],
                      styles: {
                        header: {
                          fontSize: 8,
                          bold: true
                        },
                        titulo: {
                          fontSize: 15,
                          bold: true
                        }
                      }
                    }
                    const pdf = pdfMake.createPdf(pdfDefinicion);
                    pdf.open();
                    break;
                  }

                } else {
                  for (let i = 0; i < datos_remisionFactura.length; i++) {
                    this.remisionService.srvObtenerListaPorId(datos_remisionFactura[i].rem_Id).subscribe(datos_remision => {
                      this.remisionMpService.srvObtenerListaPorRemId(id).subscribe(datos_remisionMP => {
                        this.usuarioService.srvObtenerListaPorId(datos_remision.usua_Id).subscribe(datos_usuario => {
                          this.proveedorService.srvObtenerListaPorId(datos_remision.prov_Id).subscribe(datos_proveedor => {
                            this.materiaPrimaService.srvObtenerListaPorId(datos_remisionMP.matPri_Id).subscribe(datos_materiPrima => {
                              for (let mp = 0; mp < this.mpAgregada.length; mp++) {
                                let FechaEntregaDatetime = datos_factura.facco_FechaFactura;
                                let FechaEntregaNueva = FechaEntregaDatetime.indexOf("T");
                                let fecharegistroFinal = FechaEntregaDatetime.substring(0, FechaEntregaNueva);

                                const pdfDefinicion : any = {
                                  info: {
                                    title: `${datos_factura.facco_Codigo}`
                                  },
                                  content : [
                                    {
                                      text: `Plasticaribe S.A.S ---- Factura de Compra de Materia Prima`,
                                      alignment: 'center',
                                      style: 'titulo',
                                    },
                                    '\n \n',
                                    {
                                      text: `Fecha de registro: ${fecharegistroFinal}`,
                                      style: 'header',
                                      alignment: 'right',
                                    },
                                    {
                                      text: `Registrado Por: ${datos_usuario.usua_Nombre}\n`,
                                      alignment: 'right',
                                      style: 'header',
                                    },
                                    {
                                      text: `\n Información detallada del Proveedor \n \n`,
                                      alignment: 'center',
                                      style: 'header'
                                    },
                                    {
                                      style: 'tablaCliente',
                                      table: {
                                        widths: ['*', '*', '*'],
                                        style: 'header',
                                        body: [
                                          [
                                            `ID: ${datos_proveedor.prov_Id}`,
                                            `Tipo de ID: ${datos_proveedor.tipoIdentificacion_Id}`,
                                            `Tipo de Cliente: ${datos_proveedor.tpProv_Id}`
                                          ],
                                          [
                                            `Nombre: ${datos_proveedor.prov_Nombre}`,
                                            `Telefono: ${datos_proveedor.prov_Telefono}`,
                                            `Ciudad: ${datos_proveedor.prov_Ciudad}`
                                          ],
                                          [
                                            `E-mail: ${datos_proveedor.prov_Email}`,
                                            ``,
                                            ``
                                          ]
                                        ]
                                      },
                                      layout: 'lightHorizontalLines',
                                      fontSize: 9,
                                    },
                                    {
                                      text: `\n \nObervación sobre la factura: \n ${datos_factura.facco_Observacion}\n`,
                                      style: 'header',
                                    },
                                    {
                                      text: `\n Información detallada de Materia(s) Prima(s) comprada(s) \n `,
                                      alignment: 'center',
                                      style: 'header'
                                    },

                                    this.table(this.mpAgregada, ['Id', 'Nombre', 'Cant', 'UndCant', 'PrecioUnd', 'SubTotal']),

                                    {
                                      text: `\n\nValor Total Factura: $${this.formatonumeros(datos_factura.facco_ValorTotal)}`,
                                      alignment: 'right',
                                      style: 'header',
                                    },
                                  ],
                                  styles: {
                                    header: {
                                      fontSize: 8,
                                      bold: true
                                    },
                                    titulo: {
                                      fontSize: 15,
                                      bold: true
                                    }
                                  }
                                }
                                const pdf = pdfMake.createPdf(pdfDefinicion);
                                pdf.open();
                                break;
                              }
                            });
                          });
                        });
                      });
                    });
                  }
                }
              });
            });
          });
        });
      });
    } else if (tipoDoc == 'REM') {
      this.remisionService.srvObtenerListaPorId(id).subscribe(datos_remision => {
        this.remisionMpService.srvObtenerListaPorRemId(id).subscribe(datos_remisionMP => {
          for (let i = 0; i < datos_remisionMP.length; i++) {
            console.log(datos_remisionMP[i].matPri_Id)
            this.usuarioService.srvObtenerListaPorId(datos_remision.usua_Id).subscribe(datos_usuario => {
              this.proveedorService.srvObtenerListaPorId(datos_remision.prov_Id).subscribe(datos_proveedor => {
                this.materiaPrimaService.srvObtenerListaPorId(datos_remisionMP[i].matPri_Id).subscribe(datos_materiPrima => {
                  for (let mp = 0; mp < this.mpAgregada.length; mp++) {
                    let FechaEntregaDatetime = datos_remision.rem_Fecha;
                    let FechaEntregaNueva = FechaEntregaDatetime.indexOf("T");
                    let fecharegistroFinal = FechaEntregaDatetime.substring(0, FechaEntregaNueva);

                    const pdfDefinicion : any = {
                      info: {
                        title: `${datos_remision.rem_Id}`
                      },
                      content : [
                        {
                          text: `Plasticaribe S.A.S ---- Remisión de Compra de Materia Prima`,
                          alignment: 'center',
                          style: 'titulo',
                        },
                        '\n \n',
                        {
                          text: `Fecha de registro: ${fecharegistroFinal}`,
                          style: 'header',
                          alignment: 'right',
                        },
                        {
                          text: `Registrado Por: ${datos_usuario.usua_Nombre}\n`,
                          alignment: 'right',
                          style: 'header',
                        },
                        {
                          text: `\n Información detallada del Proveedor \n \n`,
                          alignment: 'center',
                          style: 'header'
                        },
                        {
                          style: 'tablaCliente',
                          table: {
                            widths: ['*', '*', '*'],
                            style: 'header',
                            body: [
                              [
                                `ID: ${datos_proveedor.prov_Id}`,
                                `Tipo de ID: ${datos_proveedor.tipoIdentificacion_Id}`,
                                `Tipo de Cliente: ${datos_proveedor.tpProv_Id}`
                              ],
                              [
                                `Nombre: ${datos_proveedor.prov_Nombre}`,
                                `Telefono: ${datos_proveedor.prov_Telefono}`,
                                `Ciudad: ${datos_proveedor.prov_Ciudad}`
                              ],
                              [
                                `E-mail: ${datos_proveedor.prov_Email}`,
                                ``,
                                ``
                              ]
                            ]
                          },
                          layout: 'lightHorizontalLines',
                          fontSize: 9,
                        },
                        {
                          text: `\n \nObervación sobre la remisión: \n ${datos_remision.rem_Observacion}\n`,
                          style: 'header',
                        },
                        {
                          text: `\n Información detallada de Materia(s) Prima(s) comprada(s) \n `,
                          alignment: 'center',
                          style: 'header'
                        },

                        this.table(this.mpAgregada, ['Id', 'Nombre', 'Cant', 'UndCant', 'PrecioUnd', 'SubTotal']),

                        {
                          text: `\n\nValor Total Remisión: $${this.formatonumeros(datos_remision.rem_PrecioEstimado)}`,
                          alignment: 'right',
                          style: 'header',
                        },
                      ],
                      styles: {
                        header: {
                          fontSize: 8,
                          bold: true
                        },
                        titulo: {
                          fontSize: 15,
                          bold: true
                        }
                      }
                    }
                    const pdf = pdfMake.createPdf(pdfDefinicion);
                    pdf.open();
                    break;
                  }
                });
              });
            });
            break;
          }
        });
      });
    } else if (tipoDoc == 'Remisiones sin Factura') {
      this.remisionService.srvObtenerListaPorId(id).subscribe(datos_remision => {
        this.remisionMpService.srvObtenerListaPorRemId(id).subscribe(datos_remisionMP => {
            this.usuarioService.srvObtenerListaPorId(datos_remision.usua_Id).subscribe(datos_usuario => {
              this.proveedorService.srvObtenerListaPorId(datos_remision.prov_Id).subscribe(datos_proveedor => {
                this.materiaPrimaService.srvObtenerListaPorId(datos_remisionMP.matPri_Id).subscribe(datos_materiPrima => {
                  for (let mp = 0; mp < this.mpAgregada.length; mp++) {
                    let FechaEntregaDatetime = datos_remision.rem_Fecha;
                    let FechaEntregaNueva = FechaEntregaDatetime.indexOf("T");
                    let fecharegistroFinal = FechaEntregaDatetime.substring(0, FechaEntregaNueva);

                    const pdfDefinicion : any = {
                      info: {
                        title: `${datos_remision.rem_Id}`
                      },
                      content : [
                        {
                          text: `Plasticaribe S.A.S ---- Remisión de Compra de Materia Prima`,
                          alignment: 'center',
                          style: 'titulo',
                        },
                        '\n \n',
                        {
                          text: `Fecha de registro: ${fecharegistroFinal}`,
                          style: 'header',
                          alignment: 'right',
                        },
                        {
                          text: `Registrado Por: ${datos_usuario.usua_Nombre}\n`,
                          alignment: 'right',
                          style: 'header',
                        },
                        {
                          text: `\n Información detallada del Proveedor \n \n`,
                          alignment: 'center',
                          style: 'header'
                        },
                        {
                          style: 'tablaCliente',
                          table: {
                            widths: ['*', '*', '*'],
                            style: 'header',
                            body: [
                              [
                                `ID: ${datos_proveedor.prov_Id}`,
                                `Tipo de ID: ${datos_proveedor.tipoIdentificacion_Id}`,
                                `Tipo de Cliente: ${datos_proveedor.tpProv_Id}`
                              ],
                              [
                                `Nombre: ${datos_proveedor.prov_Nombre}`,
                                `Telefono: ${datos_proveedor.prov_Telefono}`,
                                `Ciudad: ${datos_proveedor.prov_Ciudad}`
                              ],
                              [
                                `E-mail: ${datos_proveedor.prov_Email}`,
                                ``,
                                ``
                              ]
                            ]
                          },
                          layout: 'lightHorizontalLines',
                          fontSize: 9,
                        },
                        {
                          text: `\n \nObervación sobre la remisión: \n ${datos_remision.rem_Observacion}\n`,
                          style: 'header',
                        },
                        {
                          text: `\n Información detallada de Materia(s) Prima(s) comprada(s) \n `,
                          alignment: 'center',
                          style: 'header'
                        },

                        this.table(this.mpAgregada, ['Id', 'Nombre', 'Cant', 'UndCant', 'PrecioUnd', 'SubTotal']),

                        {
                          text: `\n\nValor Total Remisión: $${this.formatonumeros(datos_remision.rem_PrecioEstimado)}`,
                          alignment: 'right',
                          style: 'header',
                        },
                      ],
                      styles: {
                        header: {
                          fontSize: 8,
                          bold: true
                        },
                        titulo: {
                          fontSize: 15,
                          bold: true
                        }
                      }
                    }
                    const pdf = pdfMake.createPdf(pdfDefinicion);
                    pdf.open();
                    break;
                  }
                });
              });
            });
        });
      });
    }
  }

  organizacionPrecioDblClick(){
    this.ArrayDocumento.sort((a,b)=> Number(b.subTotal) - Number(a.subTotal));
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    });
    Toast.fire({
      icon: 'warning',
      title: 'Ordenado por "Precio Total" de mayor a menor'
    });
  }

  //Funcion que organiza los campos de la tabla de pedidos de menor a mayor
  organizacionPrecio(){
    this.ArrayDocumento.sort((a,b)=> Number(a.subTotal) - Number(b.subTotal));
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    });
    Toast.fire({
      icon: 'warning',
      title: 'Ordenado por "Precio Total" de menor a mayor'
    });
  }
}
