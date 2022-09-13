import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import pdfMake from 'pdfmake/build/pdfmake';
import { AsignacionBOPPService } from 'src/app/Servicios/asignacionBOPP.service';
import { AsignacionMPService } from 'src/app/Servicios/asignacionMP.service';
import { AsignacionMPxTintasService } from 'src/app/Servicios/asignacionMPxTintas.service';
import { BagproService } from 'src/app/Servicios/Bagpro.service';
import { CategoriaMateriaPrimaService } from 'src/app/Servicios/categoriaMateriaPrima.service';
import { DetallesAsignacionService } from 'src/app/Servicios/detallesAsignacion.service';
import { DetalleAsignacion_BOPPService } from 'src/app/Servicios/detallesAsignacionBOPP.service';
import { DetallesAsignacionMPxTintasService } from 'src/app/Servicios/detallesAsignacionMPxTintas.service';
import { DetallesAsignacionTintasService } from 'src/app/Servicios/detallesAsignacionTintas.service';
import { Detalles_EntradaTintasService } from 'src/app/Servicios/Detalles_EntradaTintas.service';
import { DevolucionesService } from 'src/app/Servicios/devoluciones.service';
import { DevolucionesMPService } from 'src/app/Servicios/devolucionesMP.service';
import { EntradaBOPPService } from 'src/app/Servicios/entrada-BOPP.service';
import { Entrada_TintaService } from 'src/app/Servicios/Entrada_Tinta.service';
import { FacturaMpService } from 'src/app/Servicios/facturaMp.service';
import { FactuaMpCompradaService } from 'src/app/Servicios/facturaMpComprada.service';
import { InventInicialDiaService } from 'src/app/Servicios/inventInicialDia.service';
import { MateriaPrimaService } from 'src/app/Servicios/materiaPrima.service';
import { ProveedorService } from 'src/app/Servicios/proveedor.service';
import { RecuperadoService } from 'src/app/Servicios/recuperado.service';
import { RecuperadoMPService } from 'src/app/Servicios/recuperadoMP.service';
import { RemisionService } from 'src/app/Servicios/Remision.service';
import { RemisionesMPService } from 'src/app/Servicios/remisionesMP.service';
import { RemisionFacturaService } from 'src/app/Servicios/remisionFactura.service';
import { RolesService } from 'src/app/Servicios/roles.service';
import { TintasService } from 'src/app/Servicios/tintas.service';
import { TipoBodegaService } from 'src/app/Servicios/tipoBodega.service';
import { TipoDocumentoService } from 'src/app/Servicios/tipoDocumento.service';
import { UsuarioService } from 'src/app/Servicios/usuario.service';
import Swal from 'sweetalert2';
import { ModalEditarAsignacionesBOPPComponent } from '../modal-editar-asignaciones-bopp/modal-editar-asignaciones-bopp.component';

@Component({
  selector: 'app-movimientoMP',
  templateUrl: './movimientoMP.component.html',
  styleUrls: ['./movimientoMP.component.css']
})

export class MovimientoMPComponent implements OnInit {

  // Permitirá que se hagan cambios en el modal en que se llaman las asignaciones de bOPP
  @ViewChild(ModalEditarAsignacionesBOPPComponent)  EditarAsignacionesBOPP : ModalEditarAsignacionesBOPPComponent

  public FormDocumentos !: FormGroup;

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
  ArrayBopp = [];
  AccionBoton = "Agregar"; //Variable que almanará informacio para saber si una materia prima está en edicion o no (Se editará una materia prima cargada en la tabla, no una en la base de datos)
  valorTotal : number = 0; //Variable que guardará el valor total de la factura de entrada de materia prima
  nombreMateriaPrima : string; //Varible que almacenará el nombre de una materia prima consultado o seleccionado
  cantidadTotalExt : number; //Variable que va a almacenar el total de la cantidad extruida en una OT
  cantidadTotalImp : number; //Variable que va a almacenar el total de la cantidad impresa en una OT
  cantidadTotalDbl : number; //Variable que va a almacenar el total de la cantidad doblada en una OT
  proceso : string = ''; //Variable ayudará a almacenar el proceso del cuela se está consultando la ot
  totalPorcentajePerida : number; //Variable que ayudará a calcular el total de perdida en una OT
  cantidadTotalSella : number = 0; //Variable que va a almacenar el total de la cantidad sellada en una OT
  cantidadTotalEmpaque : number = 0; //Variable que va a almacenar el total de la cantidad empacada en una OT
  cantidadTotalWiketiado : number = 0; //Variable que va a almacenar el total de la cantidad cantidad Tota wiketeada en una OT
  tintas : any = [] // Variable que almacenará las tintas que se crean o utilizan en la empresa
  asignacion : string;
  recuperadoTipo : string;
  recuperado = 3;
  tipoDocumento = [];
  proveedor = [];
  documentoInfo = [];
  mpAgregada = [];
  totalMPEntregada = 0;
  cantidadTotalKgOT = 0;
  cantRestante : number = 0;
  public load: boolean;
  devolucion : string;
  devolucionN : number = 1;
  factura : number = 1;
  remision : number = 1;
  cantidadKgDevuelta : number = 0;
  asignacionBOPP : string;
  kgProduciodosOT : number = 0;
  /* CONSULTAS DE MATERIA PRIMA */
  MpConsultada = [];
  kgOT : number;
  acumuladorOT = [];
  public identificadorAsignacion : number;
  public modalEdicionAsignacionBOPP : boolean = false;

  modalBOPP : any = 1;
  estadoOtCA : string = ''; //Variable que almacenará el estado de orden de trabajo (Cerrada o Abierta)

  producidoPDF = 0;
  asignadoPDF = 0;
  acumuladorOTPDF = [];
  boppAsignada : any = [];

  ordenesTrabajo = []; //Variable que almacenará las ordenes de trabajo que se consulten
  cantidadKG : number = 0; //Variable almacenará la cantidad en kilogramos pedida en la OT
  arrayOT : any = [];
  otAsignadas : any = [];
  estadoOt : string = ''; //Variable que almacenará el estado de la orden de trabajo (Abierta, Asignada, En proceso, Terminada o Finalizada)

  validarInputMp : any;
  validarInputBOPP : any;
  keywordMp = 'matPri_Nombre';
  keyworTinta = 'tinta_Nombre';
  keywordBOPP = 'bopP_Nombre';

  constructor(private materiaPrimaService : MateriaPrimaService,
                private rolService : RolesService,
                  private frmBuilderMateriaPrima : FormBuilder,
                    @Inject(SESSION_STORAGE) private storage: WebStorageService,
                      private tipoDocuemntoService : TipoDocumentoService,
                        private proveedorService : ProveedorService,
                          private remisionService : RemisionService,
                            private remisionMpService : RemisionesMPService,
                              private facturaCompraMPService : FactuaMpCompradaService,
                                private facturaCompraService : FacturaMpService,
                                  private usuarioService : UsuarioService,
                                    private asignacionService : AsignacionMPService,
                                      private asignacionMpService : DetallesAsignacionService,
                                        private recuperadoService : RecuperadoService,
                                          private recuperadoMPService : RecuperadoMPService,
                                            private bagProServices : BagproService,
                                              private devolucionService : DevolucionesService,
                                                private devolucionMPService : DevolucionesMPService,
                                                  private boppService : EntradaBOPPService,
                                                    private asignacionBOPPService : AsignacionBOPPService,
                                                      private detallesAsgBOPPService : DetalleAsignacion_BOPPService,
                                                        private tintasService : TintasService,
                                                          private entradaTinta : Entrada_TintaService,
                                                            private detallesEntradaTinta : Detalles_EntradaTintasService,
                                                              private detallesAsgTinta : DetallesAsignacionTintasService,
                                                                private detallesAsgMat_Tinta : DetallesAsignacionMPxTintasService,
                                                                  private asgMat_Tinta : AsignacionMPxTintasService,) {

    this.FormDocumentos = this.frmBuilderMateriaPrima.group({
      idDocumento : new FormControl(),
      TipoDocumento: new FormControl(),
      materiaPrima: new FormControl(),
      campoTintas : new FormControl(),
      bopp : new FormControl(),
      fecha: new FormControl(),
      fechaFinal : new FormControl(),
      estado : new FormControl(),
    });
    this.load = true;
    this.validarInputBOPP = true;
    this.validarInputMp = true;
  }


  ngOnInit(): void {
    this.initForms();
    this.lecturaStorage();
    this.ColumnasTabla();
    this.obtenerTipoDocumento();
    this.obtenerMP();
    this.obtenerBOPP();
    this.LimpiarCampos();
    this.fecha();
    this.obtenerTintas();
  }

  selectEventBOPP(item) {
    this.FormDocumentos.value.bopp = item.bopP_Id;
    if (this.FormDocumentos.value.bopp != '') this.validarInputBOPP = false;
    else this.validarInputBOPP = true;
    // do something with selected item
  }

  onChangeSearchBOPP(val: string) {
    if (val != '') this.validarInputBOPP = false;
    else this.validarInputBOPP = true;
    // fetch remote data from here
    // And reassign the 'data' which is binded to 'data' property.
  }

  onFocusedBOPP(e){
    if (!e.isTrusted) this.validarInputBOPP = false;
    else this.validarInputBOPP = true;
    // do something when input is focused
  }

  selectEventMp(item) {
    this.FormDocumentos.value.materiaPrima = item.matPri_Id;
    if (this.FormDocumentos.value.materiaPrima != '') this.validarInputMp = false;
    else this.validarInputMp = true;
    // do something with selected item
  }

  onChangeSearchMp(val: string) {
    if (val != '') this.validarInputMp = false;
    else this.validarInputMp = true;
    // fetch remote data from here
    // And reassign the 'data' which is binded to 'data' property.
  }

  onFocusedMp(e){
    if (!e.isTrusted) this.validarInputMp = false;
    else this.validarInputMp = true;
    // do something when input is focused
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

  initForms() {
    this.FormDocumentos = this.frmBuilderMateriaPrima.group({
      idDocumento : [,Validators.required],
      TipoDocumento: [, Validators.required],
      materiaPrima : [, Validators.required],
      campoTintas : ['', Validators.required],
      bopp : ['', Validators.required],
      fecha: [, Validators.required],
      fechaFinal: [, Validators.required],
      estado : ['', Validators.required],
    });
  }

  LimpiarCampos() {
    this.FormDocumentos.setValue({
      idDocumento : null,
      TipoDocumento: null,
      materiaPrima : '',
      campoTintas : '',
      bopp : '',
      fecha: null,
      fechaFinal: null,
      estado : null,
    });
    this.ArrayDocumento = [];
    this.valorTotal = 0;
    this.totalMPEntregada = 0;
    this.cantRestante = 0;
    this.kgProduciodosOT = 0;
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

  obtenerMP(){
    this.materiaPrimaService.srvObtenerLista().subscribe(datos_materiPrima => {
      for (let index = 0; index < datos_materiPrima.length; index++) {
        this.ArrayMateriaPrimaRetirada.push(datos_materiPrima[index]);
        this.ArrayMateriaPrimaRetirada.sort((a,b) => a.matPri_Nombre.localeCompare(b.matPri_Nombre));
      }
    });
  }

  obtenerTintas(){
    this.tintasService.srvObtenerLista().subscribe(datos_tintas => {
      for (let i = 0; i < datos_tintas.length; i++) {
        this.tintas.push(datos_tintas[i]);
        this.tintas.sort((a,b) => a.tinta_Nombre.localeCompare(b.tinta_Nombre));
      }
    });
  }

  obtenerBOPP(){
    this.boppService.srvObtenerLista().subscribe(datos_bopp => {
      for (let i = 0; i < datos_bopp.length; i++) {
        this.ArrayBopp.push(datos_bopp[i]);
        this.ArrayBopp.sort((a,b) => a.bopP_Nombre.localeCompare(b.bopP_Nombre));
      }
    });
  }

  // Funcion que buscará el BOPP
  buscarBOPPSegunFecha(){
    let fecha : any = this.FormDocumentos.value.fecha;
    let fechaFinal : any = this.FormDocumentos.value.fechaFinal;
    this.ArrayBopp = [];
    let IdBOPP : any = [];

    if (fecha != null && fechaFinal != null) {
      this.asignacionBOPPService.srvObtenerListaPorfechas(fecha, fechaFinal).subscribe(datos_asignaciones => {
        for (let i = 0; i < datos_asignaciones.length; i++) {
          this.detallesAsgBOPPService.srvObtenerListaPorAsignacion(datos_asignaciones[i].asigBOPP_Id).subscribe(datos_detallesBOPP => {
            for (let j = 0; j < datos_detallesBOPP.length; j++) {
              this.boppService.srvObtenerListaPorId(datos_detallesBOPP[j].bopP_Id).subscribe(datos_bopp => {
                let bopp : any = [];
                bopp.push(datos_bopp);
                for (const item of bopp) {
                  if (!IdBOPP.includes(item.bopP_Id)) {
                    IdBOPP.push(item.bopP_Id)
                    this.ArrayBopp.push(item);
                    this.ArrayBopp.sort((a,b) => a.bopP_Nombre.localeCompare(b.bopP_Nombre));
                  } else continue;
                }
              });
            }
          });
        }
      });
    } else if (fecha != null){
      this.asignacionBOPPService.srvObtenerListaPorfecha(fecha).subscribe(datos_asignaciones => {
        for (let i = 0; i < datos_asignaciones.length; i++) {
          this.detallesAsgBOPPService.srvObtenerListaPorAsignacion(datos_asignaciones[i].asigBOPP_Id).subscribe(datos_detallesBOPP => {
            for (let j = 0; j < datos_detallesBOPP.length; j++) {
              this.boppService.srvObtenerListaPorId(datos_detallesBOPP[j].bopP_Id).subscribe(datos_bopp => {
                let bopp : any = [];
                bopp.push(datos_bopp);
                for (const item of bopp) {
                  if (!IdBOPP.includes(item.bopP_Id)) {
                    IdBOPP.push(item.bopP_Id)
                    this.ArrayBopp.push(item);
                    this.ArrayBopp.sort((a,b) => a.bopP_Nombre.localeCompare(b.bopP_Nombre));
                  } else continue;
                }
              });
            }
          });
        }
      });
    }
  }

  //Funcion que colocará el nombre a las columnas de la tabla en la cual se muestran los productos pedidos por los clientes
  ColumnasTabla(){
    this.titulosTabla = [];
    this.titulosTabla = [{
      idFact : "OT / COD. DOCUMENTO",
      tipo : "Tipo de Movimiento",
      FechaFact : "Fecha Registro",
      usuario : "Registrado Por:",
      mp : "Materia Prima",
      cant : "Cantidad",
      estado : "Estado OT",
      Ver : "Ver",
    }]
  }

  consultaOTBagPro(){
    let ot : any = this.FormDocumentos.value.idDocumento;
    this.bagProServices.srvObtenerListaProcExtOt(ot).subscribe(datos_OT => {
      for (let index = 0; index < datos_OT.length; index++) {
        this.cantidadTotalKgOT = datos_OT[index].datosvalorOt;
        break;
      }
    });
  }

  validarConsulta(){
    this.load = false;
    this.ArrayDocumento = [];
    this.asignacion = '';
    this.totalMPEntregada = 0;
    this.factura = 1;
    this.remision = 1;
    this.devolucionN = 1;
    this.kgProduciodosOT = 0;
    this.cantidadTotalEmpaque = 0;
    this.cantidadTotalSella = 0;
    this.cantidadTotalWiketiado = 0;
    this.acumuladorOT = [];
    this.cantRestante = 0;
    this.estadoOt = '';
    this.estadoOtCA = '';
    let idDoc : string = this.FormDocumentos.value.idDocumento;
    let fecha : any = this.FormDocumentos.value.fecha;
    let fechaFinal : any = this.FormDocumentos.value.fechaFinal;
    let TipoDocumento : string = this.FormDocumentos.value.TipoDocumento;
    let materiaPrima : number;
    if (this.FormDocumentos.value.materiaPrima.matPri_Id == undefined) materiaPrima = null;
    else materiaPrima = this.FormDocumentos.value.materiaPrima.matPri_Id;
    let campostinta : any = this.FormDocumentos.value.campoTintas;
    if (this.FormDocumentos.value.campoTintas.tinta_Id == undefined) campostinta = null;
    else campostinta = this.FormDocumentos.value.campoTintas.tinta_Id;
    let boppSelected : number = this.FormDocumentos.value.bopp;
    if (this.FormDocumentos.value.bopp.bopP_Id == undefined) boppSelected = null;
    else boppSelected = this.FormDocumentos.value.bopp.bopP_Id;
    let estado : string = this.FormDocumentos.value.estado;

    if (fecha != null && fechaFinal != null && (materiaPrima != null || boppSelected != null) && TipoDocumento != null) {
      if (this.ValidarRol == 1 || this.ValidarRol == 3) {
        if (materiaPrima != null) {
          if (TipoDocumento == 'Asignación') {
            this.asignacionService.srvObtenerListaPorFechas(fecha, fechaFinal).subscribe(datos_asignacion => {
              if (datos_asignacion.length == 0) {
                this.load = true;
                Swal.fire(`No se encuentras registros de asignaciones entre las fechas ${fecha}, ${fechaFinal} y la materia prima ${fechaFinal}`);
              } else {
                for (let index = 0; index < datos_asignacion.length; index++) {
                  this.asignacionMpService.srvObtenerListaPorAsigId(datos_asignacion[index].asigMp_Id).subscribe(datos_asignacionMP => {
                    for (let i = 0; i < datos_asignacionMP.length; i++) {
                      if (datos_asignacionMP[i].matPri_Id == materiaPrima) {
                        this.asignacion = 'Asignacion';
                        this.lenarTabla(datos_asignacionMP[i], 'Asignación');
                        break;
                      } else continue;
                    }
                  });
                }
              }
            });
          } else if (TipoDocumento == 'Recuperado') {
            this.recuperadoService.srvObtenerListaPorFechas(fecha, fechaFinal).subscribe(datos_recuperado => {
              if (datos_recuperado.length == 0) {
                this.load = true;
                Swal.fire(`No se encuentran registros de recuperado entre las fechas ${fecha}, ${fechaFinal} y la materia prima ${fechaFinal}`);
              } else {
                for (let index = 0; index < datos_recuperado.length; index++) {
                  this.recuperadoMPService.srvObtenerListaPorRecuperadoId(datos_recuperado[index].recMp_Id).subscribe(datos_recuperadoMP => {
                    for (let j = 0; j < datos_recuperadoMP.length; j++) {
                      if (datos_recuperadoMP[j].matPri_Id == materiaPrima) {
                        this.recuperadoTipo = 'RECUP';
                        this.recuperado = 2;
                        this.lenarTabla(datos_recuperadoMP[j], 'Recuperado');
                      }
                    }
                  });
                }
              }
            });
          } else if (TipoDocumento == 'Devoluciones') {
            this.devolucionService.srvObtenerListaPofechas(fecha, fechaFinal).subscribe(datos_devoluciones => {
              if (datos_devoluciones.length == 0) {
                this.load = true;
                Swal.fire(`No se encuentran registros de devoluciones entre las fechas ${fecha}, ${fechaFinal} y la materia prima ${fechaFinal}`);
              } else {
                for (let i = 0; i < datos_devoluciones.length; i++) {
                  this.devolucionMPService.srvObtenerListaPorDevId(datos_devoluciones[i].devMatPri_Id).subscribe(datos_devolucionesMP => {
                    for (let j = 0; j < datos_devolucionesMP.length; j++) {
                      if (datos_devolucionesMP[j].matPri_Id == materiaPrima) {
                        this.devolucion = 'DEVOLUCION';
                        this.lenarTabla(datos_devolucionesMP[j], 'Devoluciones');
                      }
                    }
                  });
                }
              }
            });
          } else if (TipoDocumento == 'FCO') {
            this.facturaCompraMPService.srvObtenerListaPorFechas(fecha, fechaFinal).subscribe(datos_factura => {
              if (datos_factura.length == 0) {
                this.load = true;
                Swal.fire(`No se encuentran registros de facturas entre las fechas ${fecha}, ${fechaFinal} y la materia prima ${fechaFinal}`);
              } else {
                for (let index = 0; index < datos_factura.length; index++) {
                  this.facturaCompraService.srvObtenerListaPorFacId(datos_factura[index].facco_Id).subscribe(datos_facturaMP => {
                    for (let j = 0; j < datos_facturaMP.length; j++) {
                      if (datos_facturaMP[j].matPri_Id == materiaPrima) {
                        this.factura = 2;
                        this.lenarTabla(datos_facturaMP[j], 'FCO');
                        this.factura = 1;
                      }
                    }
                  });
                }
              }
            });
          } else if (TipoDocumento == 'REM') {
            this.remisionService.srvObtenerListaPorFechas(fecha, fechaFinal).subscribe(datos_remision => {
              if (datos_remision.length == 0) {
                this.load = true;
                Swal.fire(`No se encurntran regitros de remisiones entre las fechas ${fecha}, ${fechaFinal} y la materia prima ${fechaFinal}`)
              } else {
                for (let index = 0; index < datos_remision.length; index++) {
                  this.remisionMpService.srvObtenerListaPorRemId(datos_remision[index].rem_Fecha).subscribe(datos_remisionMP => {
                    for (let j = 0; j < datos_remisionMP.length; j++) {
                      if (datos_remisionMP[j].matPri_Id == materiaPrima) {
                        this.lenarTabla(datos_remisionMP[j], 'REM');
                      }
                    }
                  });
                }
              }
            });
          }
        }
      }

      if (this.ValidarRol == 1 || this.ValidarRol == 4) {
        if (boppSelected != null) {
          if (TipoDocumento == 'Asignación de BOPP') {
            this.asignacionBOPPService.srvObtenerListaPorfechas(fecha, fechaFinal).subscribe(datos_asignacionBOPP => {
              for (let i = 0; i < datos_asignacionBOPP.length; i++) {
                this.detallesAsgBOPPService.srvObtenerListaPorAsignacion(datos_asignacionBOPP[i].asigBOPP_Id).subscribe(datos_detallesAsgBOPP => {
                  for (let j = 0; j < datos_detallesAsgBOPP.length; j++) {
                    if (datos_detallesAsgBOPP[j].bopP_Id == boppSelected) {
                      this.asignacionBOPP = 'BOPP';
                      this.lenarTabla(datos_detallesAsgBOPP[j], 'BOPP');
                      this.asignacionBOPP = '';
                    }
                  }
                });
              }
            });
         }
        }
      }
      this.load = true;
    } else if (fecha != null && (materiaPrima != null || boppSelected != null) && TipoDocumento != null) {
      if (this.ValidarRol == 1 || this.ValidarRol == 3) {
        if (materiaPrima != null) {
          if (TipoDocumento == 'Asignación') {
            this.asignacionService.srvObtenerListaPorFecha(fecha).subscribe(datos_asignacion => {
              if (datos_asignacion.length == 0) {
                this.load = true;
                Swal.fire(`No se encuentras registros de asignaciones con la fecha ${fecha} y la materia prima ${fechaFinal}`);
              } else {
                for (let index = 0; index < datos_asignacion.length; index++) {
                  this.asignacionMpService.srvObtenerListaPorAsigId(datos_asignacion[index].asigMp_Id).subscribe(datos_asignacionMP => {
                    for (let i = 0; i < datos_asignacionMP.length; i++) {
                      if (datos_asignacionMP[i].matPri_Id == materiaPrima) {
                        this.asignacion = 'Asignacion';
                        this.lenarTabla(datos_asignacionMP[i], 'Asignacion');
                      }
                    }
                  });
                }
              }
            });
          } else if (TipoDocumento == 'Recuperado') {
            this.recuperadoService.srvObtenerListaPorFecha(fecha).subscribe(datos_recuperado => {
              if (datos_recuperado.length == 0) {
                this.load = true;
                Swal.fire(`No se encuentran registros de recuperado con la fecha ${fecha} y la materia prima ${fechaFinal}`);
              } else {
                for (let index = 0; index < datos_recuperado.length; index++) {
                  this.recuperadoMPService.srvObtenerListaPorRecuperadoId(datos_recuperado[index].recMp_Id).subscribe(datos_recuperadoMP => {
                    for (let j = 0; j < datos_recuperadoMP.length; j++) {
                      if (datos_recuperadoMP[j].matPri_Id == materiaPrima) {
                        this.recuperadoTipo = 'RECUP';
                        this.recuperado = 2;
                        this.lenarTabla(datos_recuperado[index], 'RECUP');
                      }
                    }
                  });
                }
              }
            });
          } else if (TipoDocumento == 'Devoluciones') {
            this.devolucionService.srvObtenerListaPorfecha(fecha).subscribe(datos_devoluciones => {
              if (datos_devoluciones.length == 0) {
                this.load = true;
                Swal.fire(`No se encuentran registros de devoluciones con la fecha ${fecha} y la materia prima ${fechaFinal}`);
              } else {
                for (let i = 0; i < datos_devoluciones.length; i++) {
                  this.devolucionMPService.srvObtenerListaPorDevId(datos_devoluciones[i].devMatPri_Id).subscribe(datos_devolucionesMP => {
                    for (let j = 0; j < datos_devolucionesMP.length; j++) {
                      if (datos_devolucionesMP[j].matPri_Id == materiaPrima) {
                        this.devolucion = 'DEVOLUCION';
                        this.lenarTabla(datos_devoluciones[i], 'DEVOLUCION');
                      }
                    }
                  });
                }
              }
            });
          } else if (TipoDocumento == 'FCO') {
            this.facturaCompraMPService.srvObtenerListaPorFecha(fecha).subscribe(datos_factura => {
              if (datos_factura.length == 0) {
                this.load = true;
                Swal.fire(`No se encuentran registros de facturas con la fecha ${fecha} y la materia prima ${fechaFinal}`);
              } else {
                for (let index = 0; index < datos_factura.length; index++) {
                  this.facturaCompraService.srvObtenerListaPorFacId(datos_factura[index].facco_Id).subscribe(datos_facturaMP => {
                    for (let j = 0; j < datos_facturaMP.length; j++) {
                      if (datos_facturaMP[j].matPri_Id == materiaPrima) {
                        this.factura = 2;
                        this.lenarTabla(datos_facturaMP[j], 'FCO');
                        this.factura = 1;
                      }
                    }
                  });
                }
              }
            });
          } else if (TipoDocumento == 'REM') {
            this.remisionService.srvObtenerListaPorFecha(fecha).subscribe(datos_remision => {
              if (datos_remision.length == 0) {
                this.load = true;
                Swal.fire(`No se encurntran regitros de remisiones con la fecha ${fecha} y la materia prima ${fechaFinal}`)
              } else {
                for (let index = 0; index < datos_remision.length; index++) {
                  this.remisionMpService.srvObtenerListaPorRemId(datos_remision[index].rem_Fecha).subscribe(datos_remisionMP => {
                    for (let j = 0; j < datos_remisionMP.length; j++) {
                      if (datos_remisionMP[j].matPri_Id == materiaPrima) {
                        this.lenarTabla(datos_remisionMP[j], 'REM');
                      }
                    }
                  });
                }
              }
            });
          }
        }
      }

      if (this.ValidarRol == 1 || this.ValidarRol == 4) {
        if (boppSelected != null) {
          if (TipoDocumento == 'Asignación de BOPP') {
           this.asignacionBOPPService.srvObtenerListaPorfecha(fecha).subscribe(dato_asignacionBOPP => {
             if (dato_asignacionBOPP.length == 0) {
               this.load = true;
               Swal.fire(`No se encurntran regitros de asignaciones de BOPP para la OT ${idDoc}`);
             } else {
               for (let i = 0; i < dato_asignacionBOPP.length; i++) {
                 this.detallesAsgBOPPService.srvObtenerListaPorAsignacion(dato_asignacionBOPP[i].asigBOPP_Id).subscribe(datos_detallesAsgBOPP => {
                   for (let j = 0; j < datos_detallesAsgBOPP.length; j++) {
                     if (datos_detallesAsgBOPP[j].bopP_Id == boppSelected) {
                       this.asignacionBOPP = 'BOPP';
                       this.lenarTabla(datos_detallesAsgBOPP[j], 'BOPP');
                       this.asignacionBOPP = '';
                     } else {
                       this.load = true;
                     }
                   }
                 });
               }
             }
           });
         }
        }
      }
      this.load = true;
    } else if (fecha != null && fechaFinal != null && TipoDocumento != null) {
      if (this.ValidarRol == 1 || this.ValidarRol == 3) {
        if (TipoDocumento == 'Asignación') {
          this.asignacionService.srvObtenerListaPorFechas(fecha, fechaFinal).subscribe(datos_asignacion => {
            if (datos_asignacion.length == 0) {
              this.load = true;
              Swal.fire(`No se encuentras registros de asignaciones entre las fechas ${fecha} y ${fechaFinal}`);
            } else {
              for (let index = 0; index < datos_asignacion.length; index++) {
                this.asignacionMpService.srvObtenerListaPorAsigId(datos_asignacion[index].asigMp_Id).subscribe(datos_asignacionMP => {
                  for (let i = 0; i < datos_asignacionMP.length; i++) {
                    this.lenarTabla(datos_asignacionMP[i], 'Asignacion');
                  }
                });
              }
            }
          });
        } else if (TipoDocumento == 'Recuperado') {
          this.recuperadoService.srvObtenerListaPorFechas(fecha, fechaFinal).subscribe(datos_recuperados => {
            if (datos_recuperados.length == 0) {
              this.load = true;
              Swal.fire(`No se encuentran registros de recuperado entre las fechas ${fecha} y ${fechaFinal}`);
            } else {
              for (let i = 0; i < datos_recuperados.length; i++) {
                this.recuperadoMPService.srvObtenerListaPorRecuperadoId(datos_recuperados[i].recMp_Id).subscribe(datos_recuperadosMP => {
                  for (let j = 0; j < datos_recuperadosMP.length; j++) {
                    this.lenarTabla(datos_recuperadosMP[j], 'RECUP');
                  }
                });
              }
            }
          });
        } else if (TipoDocumento == 'Devoluciones') {
          this.devolucionService.srvObtenerListaPofechas(fecha, fechaFinal).subscribe(datos_devoluciones => {
            if (datos_devoluciones.length == 0) {
              this.load = true;
              Swal.fire(`No se encuentran registros de devoluciones entre las fechas ${fecha} y ${fechaFinal}`);
            } else {
              for (let i = 0; i < datos_devoluciones.length; i++) {
                this.devolucionMPService.srvObtenerListaPorDevId(datos_devoluciones[i].devMatPri_Id).subscribe(datos_devolucionesMP => {
                  for (let j = 0; j < datos_devolucionesMP.length; j++) {
                    this.lenarTabla(datos_devolucionesMP[j], 'DEVOLUCION');
                  }
                });
              }
            }
          });
        } else if (TipoDocumento == 'FCO') {
          this.facturaCompraMPService.srvObtenerListaPorFechas(fecha, fechaFinal).subscribe(datos_facturas => {
            if (datos_facturas.length == 0) {
              this.load = true;
              Swal.fire(`No se encuentran registros de facturas entre las fechas ${fecha} y ${fechaFinal}`);
            } else {
              for (let i = 0; i < datos_facturas.length; i++) {
                this.facturaCompraService.srvObtenerListaPorFacId(datos_facturas[i].facco_Id).subscribe(datos_facturasMP => {
                  for (let j = 0; j < datos_facturasMP.length; j++) {
                    this.lenarTabla(datos_facturasMP[j], 'FCO');
                  }
                });
              }
            }
          });
        } else if (TipoDocumento == 'REM') {
          this.remisionService.srvObtenerListaPorFechas(fecha, fechaFinal).subscribe(datos_remisiones => {
            if (datos_remisiones.length == 0) {
              this.load = true;
              Swal.fire(`No se encurntran regitros de remisiones entre las fechas ${fecha} y ${fechaFinal}`)
            } else {
              for (let i = 0; i < datos_remisiones.length; i++) {
                this.remisionMpService.srvObtenerListaPorRemId(datos_remisiones[i].rem_Id).subscribe(datos_remisionesMP => {
                  for (let j = 0; j < datos_remisionesMP.length; j++) {
                    this.lenarTabla(datos_remisionesMP[j], 'REM');
                  }
                });
              }
            }
          });
        }
      }

      if (this.ValidarRol == 1 || this.ValidarRol == 4) {
        if (TipoDocumento == "Asignación de BOPP") {
          this.asignacionBOPPService.srvObtenerListaPorfechas(fecha, fechaFinal).subscribe(datos_asignacionBOPP => {
            for (let i = 0; i < datos_asignacionBOPP.length; i++) {
              this.detallesAsgBOPPService.srvObtenerListaPorAsignacion(datos_asignacionBOPP[i].asigBOPP_Id).subscribe(datos_detallesAsgBOPP => {
                for (let j = 0; j < datos_detallesAsgBOPP.length; j++) this.lenarTabla(datos_detallesAsgBOPP[j], 'BOPP');
              });
            }
          });
        }
      }
      this.load = true;
    } else if (fecha != null && fechaFinal != null && (materiaPrima != null || boppSelected != null)) {
      if (this.ValidarRol == 1 || this.ValidarRol == 3) {
        if (materiaPrima != null) {
          this.asignacionService.srvObtenerListaPorFechas(fecha,fechaFinal).subscribe(datos_asignacion => {
            for (let index = 0; index < datos_asignacion.length; index++) {
              this.asignacionMpService.srvObtenerListaPorAsigId(datos_asignacion[index].asigMp_Id).subscribe(datos_asignacionMP => {
                for (let i = 0; i < datos_asignacionMP.length; i++) {
                  if (datos_asignacionMP[i].matPri_Id == materiaPrima) this.lenarTabla(datos_asignacionMP[i], 'Asignacion');
                }
              });
            }
          });

          this.facturaCompraMPService.srvObtenerListaPorFechas(fecha, fechaFinal).subscribe(datos_factura => {
            for (let i = 0; i < datos_factura.length; i++) {
              this.facturaCompraService.srvObtenerListaPorFacId(datos_factura[i].facco_Id).subscribe(datos_facturaMP => {
                for (let j = 0; j < datos_facturaMP.length; j++) {
                  if (datos_facturaMP[j].matPri_Id == materiaPrima) this.lenarTabla(datos_facturaMP[j], 'FCO');
                }
              });
            }
          });

          this.remisionService.srvObtenerListaPorFechas(fecha, fechaFinal).subscribe(datos_remisiones => {
            for (let i = 0; i < datos_remisiones.length; i++) {
              this.remisionMpService.srvObtenerListaPorRemId(datos_remisiones[i].rem_Id).subscribe(datos_remisionesMP => {
                for (let j = 0; j < datos_remisionesMP.length; j++) {
                  if (datos_remisionesMP[j].matPri_Id == materiaPrima) this.lenarTabla(datos_remisionesMP[j], 'REM');
                }
              });
            }
          });

          this.recuperadoService.srvObtenerListaPorFechas(fecha, fechaFinal).subscribe(datos_recuperados => {
            for (let i = 0; i < datos_recuperados.length; i++) {
              this.recuperadoMPService.srvObtenerListaPorRecuperadoId(datos_recuperados[i].recMp_Id).subscribe(datos_recuperadosMP => {
                for (let j = 0; j < datos_recuperadosMP.length; j++) {
                  if (datos_recuperadosMP[j].matPri_Id == materiaPrima) this.lenarTabla(datos_recuperadosMP[j], 'RECUP');
                }
              });
            }
          });

          this.devolucionService.srvObtenerListaPofechas(fecha, fechaFinal).subscribe(datos_devoluciones => {
            for (let i = 0; i < datos_devoluciones.length; i++) {
              this.devolucionMPService.srvObtenerListaPorDevId(datos_devoluciones[i].devMatPri_Id).subscribe(datos_devolucionesMP => {
                for (let j = 0; j < datos_devolucionesMP.length; j++) {
                  if (datos_devolucionesMP[j].matPri_Id == materiaPrima) this.lenarTabla(datos_devolucionesMP[j], 'DEVOLUCION');
                }
              });
            }
          });
        }
      }

      if (this.ValidarRol == 1 || this.ValidarRol == 4) {
        if (boppSelected != null) {
          this.asignacionBOPPService.srvObtenerListaPorfechas(fecha, fechaFinal).subscribe(datos_asignacionBOPP => {
            if (datos_asignacionBOPP.length == 0) {
              this.load = true;
            } else {
              for (let i = 0; i < datos_asignacionBOPP.length; i++) {
                this.detallesAsgBOPPService.srvObtenerListaPorAsignacion(datos_asignacionBOPP[i].asigBOPP_Id).subscribe(datos_detallesAsgBOPP => {
                  for (let j = 0; j < datos_detallesAsgBOPP.length; j++) {
                    if (datos_detallesAsgBOPP[j].bopP_Id == boppSelected) this.lenarTabla(datos_detallesAsgBOPP[j], 'BOPP');
                  }
                });
              }
            }
          });
        }
      }
      this.load = true;
    } else if (fecha != null && fechaFinal != null) {

      if (this.ValidarRol == 1 || this.ValidarRol == 3) {
        this.asignacionService.srvObtenerListaPorFechas(fecha, fechaFinal).subscribe(datos_asignacion => {
          for (let index = 0; index < datos_asignacion.length; index++) {
            this.asignacionMpService.srvObtenerListaPorAsigId(datos_asignacion[index].asigMp_Id).subscribe(datos_asignacionMP => {
              for (let i = 0; i < datos_asignacionMP.length; i++) {
                this.lenarTabla(datos_asignacionMP[i], 'Asignacion');
              }
            });
          }
        });

        this.facturaCompraMPService.srvObtenerListaPorFechas(fecha, fechaFinal).subscribe(datos_facturas => {
          for (let i = 0; i < datos_facturas.length; i++) {
            this.facturaCompraService.srvObtenerListaPorFacId(datos_facturas[i].facco_Id).subscribe(datos_facturasMP => {
              for (let j = 0; j < datos_facturasMP.length; j++) {
                this.lenarTabla(datos_facturasMP[j], 'FCO');
              }
            });
          }
        });

        this.remisionService.srvObtenerListaPorFechas(fecha, fechaFinal).subscribe(datos_remisiones => {
          for (let i = 0; i < datos_remisiones.length; i++) {
            this.remisionMpService.srvObtenerListaPorRemId(datos_remisiones[i].rem_Id).subscribe(datos_remisionesMP => {
              for (let j = 0; j < datos_remisionesMP.length; j++) {
                this.lenarTabla(datos_remisionesMP[j], 'REM');
              }
            });
          }
        });

        this.recuperadoService.srvObtenerListaPorFechas(fecha, fechaFinal).subscribe(datos_recuperados => {
          for (let i = 0; i < datos_recuperados.length; i++) {
            this.recuperadoMPService.srvObtenerListaPorRecuperadoId(datos_recuperados[i].recMp_Id).subscribe(datos_recuperadosMP => {
              for (let j = 0; j < datos_recuperadosMP.length; j++) {
                this.lenarTabla(datos_recuperadosMP[j], 'RECUP');
              }
            });
          }
        });

        this.devolucionService.srvObtenerListaPofechas(fecha, fechaFinal).subscribe(datos_devoluciones => {
          for (let i = 0; i < datos_devoluciones.length; i++) {
            this.devolucionMPService.srvObtenerListaPorDevId(datos_devoluciones[i].devMatPri_Id).subscribe(datos_devolucionesMP => {
              for (let j = 0; j < datos_devolucionesMP.length; j++) {
                this.lenarTabla(datos_devolucionesMP[j], 'DEVOLUCION');
              }
            });
          }
        });

      }

      if (this.ValidarRol == 1 || this.ValidarRol == 4) {
        this.asignacionBOPPService.srvObtenerListaPorfechas(fecha, fechaFinal).subscribe(datos_asignacionBOPP => {
          if (datos_asignacionBOPP.length == 0) {
            this.load = true;
          } else {
            for (let i = 0; i < datos_asignacionBOPP.length; i++) {
              this.detallesAsgBOPPService.srvObtenerListaPorAsignacion(datos_asignacionBOPP[i].asigBOPP_Id).subscribe(datos_detallesAsgBOPP => {
                for (let j = 0; j < datos_detallesAsgBOPP.length; j++) {
                  this.lenarTabla(datos_detallesAsgBOPP[j], 'BOPP');
                }
              });
            }
          }
        });
      }
      this.load = true;
    } else if (fecha != null && TipoDocumento != null) {
      if (this.ValidarRol == 1 ||this.ValidarRol == 3) {
        if (TipoDocumento == 'Asignación') {
          this.asignacionService.srvObtenerListaPorFecha(fecha).subscribe(datos_asignacion => {
            if (datos_asignacion.length == 0) {
              this.load = true;
              Swal.fire(`No se encuentras registros de asignaciones con la fecha ${fecha}`);
            } else {
              for (let index = 0; index < datos_asignacion.length; index++) {
                this.asignacionMpService.srvObtenerListaPorAsigId(datos_asignacion[index].asigMp_Id).subscribe(datos_asignacionMP => {
                  for (let i = 0; i < datos_asignacionMP.length; i++) {
                    this.lenarTabla(datos_asignacionMP[i], 'Asignacion');
                  }
                });
              }
            }
          });
        } else if (TipoDocumento == 'Recuperado') {
          this.recuperadoService.srvObtenerListaPorFecha(fecha).subscribe(datos_recuperado => {
            if (datos_recuperado.length == 0) {
              this.load = true;
              Swal.fire(`No se encuentran registros de recuperado con la fecha ${fecha}`);
            } else {
              for (let index = 0; index < datos_recuperado.length; index++) {
                this.recuperadoMPService.srvObtenerListaPorRecuperadoId(datos_recuperado[index].recMp_Id).subscribe(datos_recuperadoMP => {
                  for (let j = 0; j < datos_recuperadoMP.length; j++) {
                    this.lenarTabla(datos_recuperado[index], 'RECUP');
                  }
                });
              }
            }
          });
        } else if (TipoDocumento == 'Devoluciones') {
          this.devolucionService.srvObtenerListaPorfecha(fecha).subscribe(datos_devoluciones => {
            if (datos_devoluciones.length == 0) {
              this.load = true;
              Swal.fire(`No se encuentran registros de devoluciones con la fecha ${fecha}`);
            } else {
              for (let i = 0; i < datos_devoluciones.length; i++) {
                this.devolucionMPService.srvObtenerListaPorDevId(datos_devoluciones[i].devMatPri_Id).subscribe(datos_devolucionesMP => {
                  for (let j = 0; j < datos_devolucionesMP.length; j++) {
                    this.lenarTabla(datos_devoluciones[i], 'DEVOLUCION');
                  }
                });
              }
            }
          });
        } else if (TipoDocumento == 'FCO') {
          this.facturaCompraMPService.srvObtenerListaPorFecha(fecha).subscribe(datos_factura => {
            if (datos_factura.length == 0) {
              this.load = true;
              Swal.fire(`No se encuentran registros de facturas con la fecha ${fecha}`);
            } else {
              for (let index = 0; index < datos_factura.length; index++) {
                this.facturaCompraService.srvObtenerListaPorFacId(datos_factura[index].facco_Id).subscribe(datos_facturaMP => {
                  for (let j = 0; j < datos_facturaMP.length; j++) {
                    this.lenarTabla(datos_facturaMP[j], 'FCO');
                  }
                });
              }
            }
          });
        } else if (TipoDocumento == 'REM') {
          this.remisionService.srvObtenerListaPorFecha(fecha).subscribe(datos_remision => {
            if (datos_remision.length == 0) {
              this.load = true;
              Swal.fire(`No se encurntran regitros de remisiones con la fecha ${fecha}`)
            } else {
              for (let index = 0; index < datos_remision.length; index++) {
                this.remisionMpService.srvObtenerListaPorRemId(datos_remision[index].rem_Fecha).subscribe(datos_remisionMP => {
                  for (let j = 0; j < datos_remisionMP.length; j++) {
                    this.lenarTabla(datos_remisionMP[j], 'REM');
                  }
                });
              }
            }
          });
        }
      }

      if (this.ValidarRol == 1 ||this.ValidarRol == 4) {
        if (TipoDocumento == 'Asignación de BOPP') {
          this.asignacionBOPPService.srvObtenerListaPorfecha(fecha).subscribe(dato_asignacionBOPP => {
            if (dato_asignacionBOPP.length == 0) {
              this.load = true;
              Swal.fire(`No se encurntran regitros de asignaciones de BOPP con la fecha ${fecha}`)
            } else {
              for (let i = 0; i < dato_asignacionBOPP.length; i++) {
                this.detallesAsgBOPPService.srvObtenerListaPorAsignacion(dato_asignacionBOPP[i].asigBOPP_Id).subscribe(datos_detallesAsgBOPP => {
                  for (let j = 0; j < datos_detallesAsgBOPP.length; j++) this.lenarTabla(datos_detallesAsgBOPP[j], 'BOPP');
                });
              }
            }
          });
        }
      }
      this.load = true;
    } else if (fecha != null && (materiaPrima != null || boppSelected != null)) {

      if (this.ValidarRol == 1 || this.ValidarRol == 3) {
        if (materiaPrima != null) {
          this.facturaCompraMPService.srvObtenerListaPorFecha(fecha).subscribe(datos_factura => {
            for (let index = 0; index < datos_factura.length; index++) {
              this.facturaCompraService.srvObtenerListaPorFacId(datos_factura[index].facco_Id).subscribe(datos_facturaMP => {
                for (let j = 0; j < datos_facturaMP.length; j++) {
                  if (datos_facturaMP[j].matPri_Id == materiaPrima) this.lenarTabla(datos_facturaMP[j], 'FCO');
                }
              });
            }
          });

          this.remisionService.srvObtenerListaPorFecha(fecha).subscribe(datos_remision => {
            for (let index = 0; index < datos_remision.length; index++) {
              this.remisionMpService.srvObtenerListaPorRemId(datos_remision[index].rem_Fecha).subscribe(datos_remisionMP => {
                for (let j = 0; j < datos_remisionMP.length; j++) {
                  if (datos_remisionMP[j].matPri_Id == materiaPrima) this.lenarTabla(datos_remisionMP[j], 'REM');
                }
              });
            }
          });

          this.asignacionService.srvObtenerListaPorFecha(fecha).subscribe(datos_asignacion => {
            for (let index = 0; index < datos_asignacion.length; index++) {
              this.asignacionMpService.srvObtenerListaPorAsigId(datos_asignacion[index].asigMp_Id).subscribe(datos_asignacionMP => {
                for (let i = 0; i < datos_asignacionMP.length; i++) {
                  if (datos_asignacionMP[i].matPri_Id == materiaPrima) this.lenarTabla(datos_asignacionMP[i], 'Asignacion');
                }
              });
            }
          });

          this.recuperadoService.srvObtenerListaPorFecha(fecha).subscribe(datos_recuperado => {
            for (let index = 0; index < datos_recuperado.length; index++) {
              this.recuperadoMPService.srvObtenerListaPorRecuperadoId(datos_recuperado[index].recMp_Id).subscribe(datos_recuperadoMP => {
                for (let j = 0; j < datos_recuperadoMP.length; j++) {
                  if (datos_recuperadoMP[j].matPri_Id == materiaPrima) this.lenarTabla(datos_recuperado[index], 'RECUP');
                }
              });
            }
          });

          this.devolucionService.srvObtenerListaPorfecha(fecha).subscribe(datos_devoluciones => {
            for (let i = 0; i < datos_devoluciones.length; i++) {
              this.devolucionMPService.srvObtenerListaPorDevId(datos_devoluciones[i].devMatPri_Id).subscribe(datos_devolucionesMP => {
                for (let j = 0; j < datos_devolucionesMP.length; j++) {
                  if (datos_devolucionesMP[j].matPri_Id == materiaPrima) this.lenarTabla(datos_devoluciones[i],  'DEVOLUCION');
                }
              });
            }
          });
        }
      }

      if (this.ValidarRol == 1 || this.ValidarRol == 4) {
        this.asignacionBOPPService.srvObtenerListaPorfecha(fecha).subscribe(dato_asignacionBOPP => {
          if (dato_asignacionBOPP.length == 0) {
            this.load = true;
            Swal.fire(`No se encurntran regitros de asignaciones de BOPP para la OT ${idDoc}`);
          } else {
            for (let i = 0; i < dato_asignacionBOPP.length; i++) {
              this.detallesAsgBOPPService.srvObtenerListaPorAsignacion(dato_asignacionBOPP[i].asigBOPP_Id).subscribe(datos_detallesAsgBOPP => {
                for (let j = 0; j < datos_detallesAsgBOPP.length; j++) {
                  if (datos_detallesAsgBOPP[j].bopP_Id == boppSelected) this.lenarTabla(datos_detallesAsgBOPP[j], 'BOPP');
                  else this.load = true;
                }
              });
            }
          }
        });
      }
      this.load = true;

    } else if ((materiaPrima != null || boppSelected != null) && TipoDocumento != null) {
      if (this.ValidarRol == 1 ||this.ValidarRol == 3) {
        if (materiaPrima != null) {
          if (TipoDocumento == 'Asignación') {
            this.asignacionMpService.srvObtenerListaPorMatPriIdFechaActual(materiaPrima, this.today).subscribe(datos_asgincaionMp => {
              if (datos_asgincaionMp == 0) {
                this.load = true;
              }
              for (let index = 0; index < datos_asgincaionMp.length; index++) {
                this.asignacionService.srvObtenerListaPorId(datos_asgincaionMp[index].asigMp_Id).subscribe(datos_asignacion => {
                  this.lenarTabla(datos_asgincaionMp[index], 'Asignacion');
                });
              }
            });
          } else if (TipoDocumento == 'Recuperado') {
            this.recuperadoMPService.srvObtenerListaPorMatPriIdFechaActual(materiaPrima, this.today).subscribe(datos_recuperadoMP => {
              if (datos_recuperadoMP.length == 0) {
                this.load = true;
              }
              for (let index = 0; index < datos_recuperadoMP.length; index++) {
                this.recuperadoService.srvObtenerListaPorId(datos_recuperadoMP[index].recMp_Id).subscribe(datos_recuperado => {
                  this.lenarTabla(datos_recuperadoMP[index],'RECUP');
                });
              }
            });
          } else if (TipoDocumento == 'Devoluciones') {
            this.devolucionMPService.srvObtenerListaPorMPId(materiaPrima).subscribe(datos_devolucionesMP => {
              if (datos_devolucionesMP.length == 0) {
                this.load = true;
              }
              for (let j = 0; j < datos_devolucionesMP.length; j++) {
                this.lenarTabla(datos_devolucionesMP[j], 'DEVOLUCION');
              }
            });
          } else if (TipoDocumento == 'FCO') {
            this.facturaCompraService.srvObtenerListaPorMpIdFechaActual(materiaPrima, this.today).subscribe(datos_faturaMP => {
              if (datos_faturaMP.length == 0) {
                this.load = true;
              }
              for (let i = 0; i < datos_faturaMP.length; i++) {
                this.lenarTabla(datos_faturaMP[i], 'FCO');
              }
            });
          } else if (TipoDocumento == 'REM') {
            this.remisionMpService.srvObtenerListaPorMpIdFechaActual(materiaPrima, this.today).subscribe(datos_remisionesMP => {
              if (datos_remisionesMP.length == 0) {
                this.load = true;
              }
              for (let i = 0; i < datos_remisionesMP.length; i++) {
                this.lenarTabla(datos_remisionesMP[i], 'REM');
              }
            });
          }
        }
      }

      if (this.ValidarRol == 1 || this.ValidarRol == 4) {
        if (boppSelected != null) {
          if (TipoDocumento == 'Asignación de BOPP') {
            this.detallesAsgBOPPService.srvObtenerListaPorBOPPFechaActual(boppSelected, this.today).subscribe(datos_detallesAsgBOPP => {
              if (datos_detallesAsgBOPP.length == 0) {
                this.load = true;
              }
              for (let i = 0; i < datos_detallesAsgBOPP.length; i++) {
                this.lenarTabla(datos_detallesAsgBOPP[i], 'BOPP');
              }
            });
          }
        }
      }
      this.load = true;
    } else if (fecha != null && idDoc != null) {
      let cantAsig : number = 0; //Variable que almacena la cantidad de materia prima que se ha asignado hasta el momento
      this.load = false;
      if (this.ValidarRol == 1 || this.ValidarRol == 3) {
        this.bagProServices.srvObtenerListaProcExtOt(idDoc).subscribe(datos_procesos => {
          if (datos_procesos.length != 0) {
            for (let index = 0; index < datos_procesos.length; index++) {
              this.kgOT = datos_procesos[index].exttotalextruir;
              this.asignacionService.srvObtenerListaPorFecha_Ot(fecha, idDoc).subscribe(datos_asignaciones => {
                if (datos_asignaciones.length != 0) {
                  for (let index = 0; index < datos_asignaciones.length; index++) {
                    this.asignacionMpService.srvObtenerListaPorAsigId(datos_asignaciones[index].asigMp_Id).subscribe(datos_asignacionMp => {
                      for (let i = 0; i < datos_asignacionMp.length; i++) {
                        cantAsig = cantAsig + datos_asignacionMp[i].dtAsigMp_Cantidad;
                        this.lenarTabla(datos_asignacionMp[i], 'Asignacion');
                      }
                    });
                  }
                }
              });
              setTimeout(() => {
                this.cantRestante = this.kgOT - cantAsig;
              }, 3000);
              break;
            }
          }
        });

        this.facturaCompraMPService.srvObtenerListaPorCodigo(idDoc).subscribe(datos_factura => {
          for (let i = 0; i < datos_factura.length; i++) {
            if (datos_factura[i].facco_FechaFactura == fecha) this.lenarTabla(datos_factura[i], 'FCO');
          }
        });

        this.remisionService.srvObtenerListaPorcodigo(idDoc).subscribe(datos_remision => {
          for (let i = 0; i < datos_remision.length; i++) {
            if (datos_remision[i].recMp_FechaIngreso == fecha) this.lenarTabla(datos_remision[i], 'REM')
          }
        });

        this.devolucionService.srvObtenerListaPorOT(idDoc).subscribe(datos_devoluciones => {
          for (let i = 0; i < datos_devoluciones.length; i++) {
            if (datos_devoluciones[i].devMatPri_Fecha == fecha) this.lenarTabla(datos_devoluciones[i], 'DEVOLUCION');
          }
        });

        this.recuperadoService.srvObtenerListaPorId(idDoc).subscribe(datos_recuperado => {
            this.lenarTabla(datos_recuperado, 'RECUP');
        });
      }

      if (this.ValidarRol == 1 || this.ValidarRol == 4) {
        this.detallesAsgBOPPService.srvObtenerListaPorOt(idDoc).subscribe(datos_detallesAsgBOPP => {
          for (let j = 0; j < datos_detallesAsgBOPP.length; j++) {
            this.lenarTabla(datos_detallesAsgBOPP[j], 'BOPP');
          }
        });
      }
      this.load = true;

    } else if (idDoc != null && TipoDocumento != null) {
      if (this.ValidarRol == 1 || this.ValidarRol == 3) {
        if (TipoDocumento == 'Asignación') {
          this.asignacionService.srvObtenerListaPorOt(idDoc).subscribe(datos_asignacion => {
            if (datos_asignacion.length == 0) {
              this.load = true;
            } else {
              for (let index = 0; index < datos_asignacion.length; index++) {
                this.asignacionMpService.srvObtenerListaPorAsigId(datos_asignacion[index].asigMp_Id).subscribe(datos_asignacionMP => {
                  for (let i = 0; i < datos_asignacionMP.length; i++) {
                    this.lenarTabla(datos_asignacionMP[i], 'Asignación');
                  }
                });
              }
            }
          });
        } else if (TipoDocumento == 'Devoluciones') {
          this.devolucionService.srvObtenerListaPorOT(idDoc).subscribe(datos_devoluciones => {
            if (datos_devoluciones.length == 0) {
              this.load = true;
            } else {
              for (let i = 0; i < datos_devoluciones.length; i++) {
                this.devolucionMPService.srvObtenerListaPorDevId(datos_devoluciones[i].devMatPri_Id).subscribe(datos_devolucionesMP => {
                  for (let j = 0; j < datos_devolucionesMP.length; j++) {
                    this.lenarTabla(datos_devolucionesMP[j], 'DEVOLUCION');
                  }
                });
              }
            }
          });
        }
      }

      if (this.ValidarRol == 1 || this.ValidarRol == 4) {
        if (TipoDocumento == 'Asignación de BOPP') {
          this.detallesAsgBOPPService.srvObtenerListaPorOt(idDoc).subscribe(datos_detallesAsgBOPP => {
            for (let j = 0; j < datos_detallesAsgBOPP.length; j++) {
              this.lenarTabla(datos_detallesAsgBOPP[j], 'BOPP');
            }
          });
        }
      }
      this.load = true;
    } else if (idDoc != null) {
      let cantAsig : number = 0; //Variable que almacena la cantidad de materia prima que se ha asignado hasta el momento
      if (this.ValidarRol == 1 || this.ValidarRol == 3) {
        this.bagProServices.srvObtenerListaClienteOT_Item(idDoc).subscribe(datos_procesos => {
          if (datos_procesos.length != 0) {
            for (let index = 0; index < datos_procesos.length; index++) {
              this.kgOT = datos_procesos[index].datosotKg;
              this.asignacionService.srvObtenerListaPorOt(idDoc).subscribe(datos_asignaciones => {
                if (datos_asignaciones.length != 0) {
                  for (let index = 0; index < datos_asignaciones.length; index++) {
                    if (datos_asignaciones[index].asigMP_OrdenTrabajo == idDoc) {
                      this.asignacionMpService.srvObtenerListaPorAsigId(datos_asignaciones[index].asigMp_Id).subscribe(datos_asignacionMp => {
                        for (let i = 0; i < datos_asignacionMp.length; i++) {
                          this.asignacion = 'Asignacion';
                          cantAsig = cantAsig + datos_asignacionMp[i].dtAsigMp_Cantidad;
                          this.lenarTabla(datos_asignacionMp[i]);
                        }
                      });
                    }
                  }
                }
              });
              setTimeout(() => {
                this.cantRestante = this.kgOT - cantAsig;
                this.load = true;
              }, 2000);
              break;
            }
          }
        }, error => { this.load = true; });

        this.facturaCompraMPService.srvObtenerListaPorCodigo(idDoc).subscribe(datos_factura => {
          for (let i = 0; i < datos_factura.length; i++) {
            this.lenarTabla(datos_factura[i]);
          }
        });

        this.remisionService.srvObtenerListaPorcodigo(idDoc).subscribe(datos_remision => {
          for (let i = 0; i < datos_remision.length; i++) {
            this.lenarTabla(datos_remision[i])
          }
        });

        this.devolucionService.srvObtenerListaPorOT(idDoc).subscribe(datos_devoluciones => {
          for (let i = 0; i < datos_devoluciones.length; i++) {
            this.devolucionMPService.srvObtenerListaPorDevId(datos_devoluciones[i].devMatPri_Id).subscribe(datos_devolucionMP => {
              for (let j = 0; j < datos_devolucionMP.length; j++) {
                this.lenarTabla(datos_devolucionMP[j], 'DEVOLUCION');
              }
            });
          }
        });

        this.recuperadoService.srvObtenerListaPorId(idDoc).subscribe(datos_recuperado => {
          this.lenarTabla(datos_recuperado,  'RECUP');
        });
      }

      if (this.ValidarRol == 1 || this.ValidarRol == 4) {
        this.detallesAsgBOPPService.srvObtenerListaPorOt(idDoc).subscribe(datos_detallesAsgBOPP => {
          for (let j = 0; j < datos_detallesAsgBOPP.length; j++) {
            this.lenarTabla(datos_detallesAsgBOPP[j],  'BOPP');
          }
        });
      }
      this.load = true;

    } else if (fecha != null) {
      if (this.ValidarRol == 1 || this.ValidarRol == 3) {
        this.facturaCompraMPService.srvObtenerListaPorFecha(fecha).subscribe(datos_factura => {
          for (let index = 0; index < datos_factura.length; index++) {
            this.lenarTabla(datos_factura[index], 'FCO');
          }
        });

        this.remisionService.srvObtenerListaPorFecha(fecha).subscribe(datos_remision => {
          for (let index = 0; index < datos_remision.length; index++) {
            this.lenarTabla(datos_remision[index],  'REM');
          }
        });

        this.asignacionService.srvObtenerListaPorFecha(fecha).subscribe(datos_asignacion => {
          for (let index = 0; index < datos_asignacion.length; index++) {
            this.asignacionMpService.srvObtenerListaPorAsigId(datos_asignacion[index].asigMp_Id).subscribe(datos_asignacionMP => {
              for (let i = 0; i < datos_asignacionMP.length; i++) {
                this.lenarTabla(datos_asignacionMP[i], 'Asignacion');
              }
            });
          }
        });

        this.recuperadoService.srvObtenerListaPorFecha(fecha).subscribe(datos_recuperado => {
          for (let index = 0; index < datos_recuperado.length; index++) {
            this.lenarTabla(datos_recuperado[index], 'RECUP');
          }
        });

        this.devolucionService.srvObtenerListaPorfecha(fecha).subscribe(datos_devoluciones => {
          for (let i = 0; i < datos_devoluciones.length; i++) {
            this.lenarTabla(datos_devoluciones[i], 'DEVOLUCION');
          }
        });
      }

      if (this.ValidarRol == 1 || this.ValidarRol == 4) {
        this.asignacionBOPPService.srvObtenerListaPorfecha(fecha).subscribe(dato_asignacionBOPP => {
          if (dato_asignacionBOPP.length == 0) {
            this.load = true;
          } else {
            for (let i = 0; i < dato_asignacionBOPP.length; i++) {
              this.detallesAsgBOPPService.srvObtenerListaPorAsignacion(dato_asignacionBOPP[i].asigBOPP_Id).subscribe(datos_detallesAsgBOPP => {
                for (let j = 0; j < datos_detallesAsgBOPP.length; j++) {
                  this.lenarTabla(datos_detallesAsgBOPP[j], 'BOPP');
                }
              });
            }
          }
        });
      }
      this.load = true;

    } else if (TipoDocumento != null) {
      if (this.ValidarRol == 1 || this.ValidarRol == 3) {
        if (TipoDocumento ==  'FCO') {
          this.facturaCompraMPService.srvObtenerListaPorFecha(this.today).subscribe(datos_facturas => {
            if (datos_facturas.length == 0) this.load = true;
            for (let i = 0; i < datos_facturas.length; i++) {
              this.facturaCompraService.srvObtenerListaPorFacId(datos_facturas[i].facco_Id).subscribe(datos_factura => {
                for (let index = 0; index < datos_factura.length; index++) {
                  this.lenarTabla(datos_factura[index], 'FCO');
                }
              });
            }
          });
        } else if (TipoDocumento ==  'REM') {
          this.remisionService.srvObtenerListaPorFecha(this.today).subscribe(datos_remision => {
            if (datos_remision.length == 0) this.load = true;
            for (let index = 0; index < datos_remision.length; index++) {
              this.lenarTabla(datos_remision[index], 'REM');
            }
          });
        } else if (TipoDocumento == 'Asignación') {
          this.asignacionService.srvObtenerListaPorFecha(this.today).subscribe(datos_asignacion => {
            if (datos_asignacion.length == 0) this.load = true;
            for (let index = 0; index < datos_asignacion.length; index++) {
              this.asignacionMpService.srvObtenerListaPorAsigId(datos_asignacion[index].asigMp_Id).subscribe(datos_asignacionMp => {
                for (let i = 0; i < datos_asignacionMp.length; i++) {
                  if (datos_asignacion[index].asigMp_Id == datos_asignacionMp[i].asigMp_Id) this.lenarTabla(datos_asignacionMp[i], 'Asignacion');
                }
              });
            }
          });
        } else if (TipoDocumento == 'Recuperado') {
          this.recuperadoService.srvObtenerListaPorFecha(this.today).subscribe(datos_recuperado => {
            if (datos_recuperado.length == 0) this.load = true;
            for (let index = 0; index < datos_recuperado.length; index++) {
              this.recuperadoMPService.srvObtenerListaPorRecuperadoId(datos_recuperado[index].recMp_Id).subscribe(datos_recuperadoMP => {
                for (let i = 0; i < datos_recuperadoMP.length; i++) {
                  this.lenarTabla(datos_recuperadoMP[i], 'RECUP');
                }
              });
              break;
            }
          });
        } else if (TipoDocumento == 'Devoluciones') {
          this.devolucionService.srvObtenerListaPorfecha(this.today).subscribe(datos_devoluciones => {
            if (datos_devoluciones.length == 0) this.load = true;
            for (let i = 0; i < datos_devoluciones.length; i++) {
              this.devolucionMPService.srvObtenerListaPorDevId(datos_devoluciones[i].devMatPri_Id).subscribe(datos_devolucionesMP => {
                for (let j = 0; j < datos_devolucionesMP.length; j++) {
                  this.lenarTabla(datos_devolucionesMP[j], 'DEVOLUCION');
                }
              });
            }
          });
        }
      }

      if (this.ValidarRol == 1 || this.ValidarRol == 4){
        if (TipoDocumento == 'Asignación de BOPP') {
          this.asignacionBOPPService.srvObtenerListaPorfecha(this.today).subscribe(datos_asignacionBOPP => {
            if (datos_asignacionBOPP.length == 0) this.load = true;
            for (let index = 0; index < datos_asignacionBOPP.length; index++) {
              this.detallesAsgBOPPService.srvObtenerListaPorAsignacion(datos_asignacionBOPP[index].asigBOPP_Id).subscribe(datos_detallesAsgBOPP => {
                for (let i = 0; i < datos_detallesAsgBOPP.length; i++) {
                  this.lenarTabla(datos_detallesAsgBOPP[i], 'BOPP');
                }
              });
            }
          });
        }
      }
      this.load = true;
    } else if (materiaPrima != null || boppSelected != null || campostinta != null) {
      if (this.ValidarRol == 1 || this.ValidarRol == 3) {
        if (materiaPrima != null) {
          this.facturaCompraService.srvObtenerListaPorMpIdFechaActual(materiaPrima, this.today).subscribe(datos_faturaMP => {
            if (datos_faturaMP.length == 0) this.load = true;
            for (let i = 0; i < datos_faturaMP.length; i++) {
              this.lenarTabla(datos_faturaMP[i], 'FCO');
            }
          });

          this.remisionMpService.srvObtenerListaPorMpIdFechaActual(materiaPrima, this.today).subscribe(datos_remisionesMP => {
            if (datos_remisionesMP.length == 0) this.load = true;
            for (let i = 0; i < datos_remisionesMP.length; i++) {
              this.lenarTabla(datos_remisionesMP[i], 'REM');
            }
          });

          this.asignacionMpService.srvObtenerListaPorMatPriIdFechaActual(materiaPrima, this.today).subscribe(datos_asgincaionMp => {
            if (datos_asgincaionMp.length == 0) this.load = true;
            for (let index = 0; index < datos_asgincaionMp.length; index++) {
              this.asignacionService.srvObtenerListaPorId(datos_asgincaionMp[index].asigMp_Id).subscribe(datos_asignacion => {
                this.lenarTabla(datos_asgincaionMp[index], 'Asignacion');
              });
            }
          });

          this.recuperadoMPService.srvObtenerListaPorMatPriIdFechaActual(materiaPrima, this.today).subscribe(datos_recuperadoMP => {
            if (datos_recuperadoMP.length == 0) this.load = true;
            for (let index = 0; index < datos_recuperadoMP.length; index++) {
              this.recuperadoService.srvObtenerListaPorId(datos_recuperadoMP[index].recMp_Id).subscribe(datos_recuperado => {
                this.lenarTabla(datos_recuperadoMP[index], 'RECUP');
              });
            }
          });

          this.devolucionMPService.srvObtenerListaPorMPId(materiaPrima).subscribe(datos_devolucionesMP => {
            if (datos_devolucionesMP.length == 0) this.load = true;
            for (let j = 0; j < datos_devolucionesMP.length; j++) {
              this.lenarTabla(datos_devolucionesMP[j], 'DEVOLUCION');
            }
          });
        }

        if (campostinta != null) {
          this.entradaTinta.srvObtenerListaPorId(campostinta).subscribe(datos_tintas => {

          });
        }
      }

      if (this.ValidarRol == 1 || this.ValidarRol == 4) {
        this.detallesAsgBOPPService.srvObtenerListaPorBOPPFechaActual(boppSelected, this.today).subscribe(datos_detallesAsgBOPP => {
          if (datos_detallesAsgBOPP.length == 0) this.load = true;
          for (let i = 0; i < datos_detallesAsgBOPP.length; i++) {
            this.lenarTabla(datos_detallesAsgBOPP[i], 'BOPP');
          }
        });
      }
      this.load = true;

    } else if (estado != null) {
      this.load = false;
      if (estado == 'Asignada') {
        this.load = false;
        this.asignacionMpService.srvObtenerListaPorEstadoOT(14).subscribe(datos_asignaciones => {
          if (datos_asignaciones.length) this.load = true;
          for (let i = 0; i < datos_asignaciones.length; i++) {
            this.asignacionService.srvObtenerListaPorOt(datos_asignaciones[i].asigMP_OrdenTrabajo).subscribe(datos_asignacion => {
              for (let j = 0; j < datos_asignacion.length; j++) {
                this.asignacion = 'Asignacion';
                this.estadoOt = 'Asignada';
                this.llenarTablaMP(datos_asignaciones[i], datos_asignaciones[i].asigMP_OrdenTrabajo, datos_asignacion[j].asigMp_Id);
                this.asignacion = '';
                break;
              }
            });
          }
        });

        this.detallesAsgBOPPService.srvObtenerListaPorEstadoOT(14).subscribe(datos_asignacionesBOPP => {
          if (datos_asignacionesBOPP.length == 0) this.load = true;
          for (let i = 0; i < datos_asignacionesBOPP.length; i++) {
            this.detallesAsgBOPPService.srvObtenerListaPorOt(datos_asignacionesBOPP[i].dtAsigBOPP_OrdenTrabajo).subscribe(datos_asignacionBOPP => {
              for (let j = 0; j < datos_asignacionBOPP.length; j++) {
                this.estadoOt = 'Asignada';
                this.lenarTabla(datos_asignacionBOPP[j], 'BOPP');
              }
            });
          }
        });
      } else if (estado == 'En Proceso') {
        this.load = false;
        this.asignacionMpService.srvObtenerListaPorEstadoOT(16).subscribe(datos_asignaciones => {
          if (datos_asignaciones.length == 0) this.load = true;
          for (let i = 0; i < datos_asignaciones.length; i++) {
            this.asignacionService.srvObtenerListaPorOt(datos_asignaciones[i].asigMP_OrdenTrabajo).subscribe(datos_asignacion => {
              for (let j = 0; j < datos_asignacion.length; j++) {
                this.asignacion = 'Asignacion';
                this.estadoOt = 'En proceso';
                this.llenarTablaMP(datos_asignaciones[i], datos_asignaciones[i].asigMP_OrdenTrabajo, datos_asignacion[j].asigMp_Id);
                this.asignacion = '';
                break;
              }
            });
          }
        });

        this.detallesAsgBOPPService.srvObtenerListaPorEstadoOT(16).subscribe(datos_asignacionesBOPP => {
          if (datos_asignacionesBOPP.length) this.load = true;
          for (let i = 0; i < datos_asignacionesBOPP.length; i++) {
            this.detallesAsgBOPPService.srvObtenerListaPorOt(datos_asignacionesBOPP[i].dtAsigBOPP_OrdenTrabajo).subscribe(datos_asignacionBOPP => {
              for (let j = 0; j < datos_asignacionBOPP.length; j++) {
                this.estadoOt = 'Asignada';
                this.lenarTabla(datos_asignacionBOPP[j], 'BOPP');
              }
            });
          }
        });
      } else if (estado == 'Terminada') {
        this.load = false;

        this.asignacionMpService.srvObtenerListaPorEstadoOT(17).subscribe(datos_asignaciones => {
          if (datos_asignaciones.length == 0) this.load = true;
          for (let i = 0; i < datos_asignaciones.length; i++) {
            this.asignacionService.srvObtenerListaPorOt(datos_asignaciones[i].asigMP_OrdenTrabajo).subscribe(datos_asignacion => {
              for (let j = 0; j < datos_asignacion.length; j++) {
                this.asignacion = 'Asignacion';
                this.estadoOt = 'Teminada';
                this.llenarTablaMP(datos_asignaciones[i], datos_asignaciones[i].asigMP_OrdenTrabajo, datos_asignacion[j].asigMp_Id);
                this.asignacion = '';
                break;
              }
            });
          }
        });

        this.detallesAsgBOPPService.srvObtenerListaPorEstadoOT(17).subscribe(datos_asignacionesBOPP => {
          if (datos_asignacionesBOPP.length) this.load = true;
          for (let i = 0; i < datos_asignacionesBOPP.length; i++) {
            this.detallesAsgBOPPService.srvObtenerListaPorOt(datos_asignacionesBOPP[i].dtAsigBOPP_OrdenTrabajo).subscribe(datos_asignacionBOPP => {
              for (let j = 0; j < datos_asignacionBOPP.length; j++) {
                this.estadoOt = 'Asignada';
                this.lenarTabla(datos_asignacionBOPP[j], 'BOPP');
              }
            });
          }
        });

      } else if (estado == 'Finalizada') {
        this.load = false;
        this.asignacionMpService.srvObtenerListaPorEstadoOT(18).subscribe(datos_asignaciones => {
          if (datos_asignaciones.length == 0) this.load = true;
          for (let i = 0; i < datos_asignaciones.length; i++) {
            this.asignacionService.srvObtenerListaPorOt(datos_asignaciones[i].asigMP_OrdenTrabajo).subscribe(datos_asignacion => {
              for (let j = 0; j < datos_asignacion.length; j++) {
                this.asignacion = 'Asignacion';
                this.estadoOt = 'Finalizada';
                this.llenarTablaMP(datos_asignaciones[i], datos_asignaciones[i].asigMP_OrdenTrabajo, datos_asignacion[j].asigMp_Id);
                break;
              }
            });
          }
        });

        this.detallesAsgBOPPService.srvObtenerListaPorEstadoOT(18).subscribe(datos_asignacionesBOPP => {
          if (datos_asignacionesBOPP.length == 0) this.load = true;
          for (let i = 0; i < datos_asignacionesBOPP.length; i++) {
            this.detallesAsgBOPPService.srvObtenerListaPorOt(datos_asignacionesBOPP[i].dtAsigBOPP_OrdenTrabajo).subscribe(datos_asignacionBOPP => {
              for (let j = 0; j < datos_asignacionBOPP.length; j++) {
                this.estadoOt = 'Asignada';
                this.lenarTabla(datos_asignacionesBOPP[i], 'BOPP');
                break;
              }
            });
          }
        });
      }
    } else {
      if (this.ValidarRol == 1 || this.ValidarRol == 3) {
        this.facturaCompraMPService.srvObtenerListaPorFecha(this.today).subscribe(datos_facturas => {
          if (datos_facturas.length == 0) this.load = true;
          for (let i = 0; i < datos_facturas.length; i++) {
            this.facturaCompraService.srvObtenerListaPorFacId(datos_facturas[i].facco_Id).subscribe(datos_factura => {
              for (let index = 0; index < datos_factura.length; index++) {
                this.lenarTabla(datos_factura[index], 'FCO');
              }
            });
          }
        });
        this.remisionService.srvObtenerListaPorFecha(this.today).subscribe(datos_remision => {
          if (datos_remision.length == 0) this.load = true;
          for (let index = 0; index < datos_remision.length; index++) {
            this.lenarTabla(datos_remision[index], 'REM');
          }
        });
        this.recuperadoService.srvObtenerListaPorFecha(this.today).subscribe(datos_recuperado => {
          if (datos_recuperado.length == 0) this.load = true;
          for (let index = 0; index < datos_recuperado.length; index++) {
            this.recuperadoMPService.srvObtenerListaPorRecuperadoId(datos_recuperado[index].recMp_Id).subscribe(datos_recuperadoMP => {
              for (let i = 0; i < datos_recuperadoMP.length; i++) {
                this.lenarTabla(datos_recuperadoMP[i], 'RECUP');
              }
            });
            break;
          }
        });
        this.asignacionService.srvObtenerListaPorFecha(this.today).subscribe(datos_asignacion => {
          if (datos_asignacion.length == 0) this.load = true;
          for (let index = 0; index < datos_asignacion.length; index++) {
            this.asignacionMpService.srvObtenerListaPorAsigId(datos_asignacion[index].asigMp_Id).subscribe(datos_asignacionMp => {
              for (let i = 0; i < datos_asignacionMp.length; i++) {
                if (datos_asignacion[index].asigMp_Id == datos_asignacionMp[i].asigMp_Id) this.lenarTabla(datos_asignacionMp[i], 'Asignacion');
              }
            });
          }
        });
        this.devolucionService.srvObtenerListaPorfecha(this.today).subscribe(datos_devoluciones => {
          if (datos_devoluciones.length == 0) this.load = true;
          for (let i = 0; i < datos_devoluciones.length; i++) {
            this.devolucionMPService.srvObtenerListaPorDevId(datos_devoluciones[i].devMatPri_Id).subscribe(datos_devolucionesMP => {
              for (let j = 0; j < datos_devolucionesMP.length; j++) {
                this.lenarTabla(datos_devolucionesMP[j], 'DEVOLUCION');
              }
            });
          }
        });
        this.entradaTinta
      }
      if (this.ValidarRol == 1 || this.ValidarRol == 4) {
        this.asignacionBOPPService.srvObtenerListaPorfecha(this.today).subscribe(datos_asignacionBOPP => {
          if (datos_asignacionBOPP.length == 0) this.load = true;
          for (let index = 0; index < datos_asignacionBOPP.length; index++) {
            this.detallesAsgBOPPService.srvObtenerListaPorAsignacion(datos_asignacionBOPP[index].asigBOPP_Id).subscribe(datos_detallesAsgBOPP => {
              for (let i = 0; i < datos_detallesAsgBOPP.length; i++) {
                this.lenarTabla(datos_detallesAsgBOPP[i], 'BOPP');
              }
            });
          }
        });
      }
    }
  }

  lenarTabla(formulario : any, tipoDocumento : any = ''){
    if (tipoDocumento == 'FCO') {
      this.facturaCompraMPService.srvObtenerListaPorId(formulario.facco_Id).subscribe(datos_factura => {
        const infoDoc : any = {
          id : datos_factura.facco_Id,
          codigo : datos_factura.facco_Codigo,
          tipoDoc : datos_factura.tpDoc_Id,
          fecha : datos_factura.facco_FechaFactura,
          usuario : datos_factura.usua_Id,
          mp : formulario.matPri_Id,
          cant : formulario.faccoMatPri_Cantidad,
          estado : '',
        }

        this.ArrayDocumento.push(infoDoc);
        this.ArrayDocumento.sort((a,b) => b.fecha.localeCompare(a.fecha));
        this.usuarioService.srvObtenerListaPorId(infoDoc.usuario).subscribe(datos_usuario => {
          infoDoc.usuario = datos_usuario.usua_Nombre;
        });
        this.materiaPrimaService.srvObtenerListaPorId(infoDoc.mp).subscribe(datos_mp => {
          infoDoc.mp = datos_mp.matPri_Nombre
        });
      });

    } else if (tipoDocumento == 'REM') {
      this.remisionService.srvObtenerListaPorId(formulario.rem_Id).subscribe(datos_remision => {
        const infoDoc : any = {
          id : datos_remision.rem_Id,
          codigo : datos_remision.rem_Codigo,
          tipoDoc : datos_remision.tpDoc_Id,
          fecha : datos_remision.rem_Fecha,
          usuario : datos_remision.usua_Id,
          mp : formulario.matPri_Id,
          cant : formulario.remiMatPri_Cantidad,
          estado : '',
        }
        this.ArrayDocumento.push(infoDoc);
        this.ArrayDocumento.sort((a,b) => b.fecha.localeCompare(a.fecha));
        this.usuarioService.srvObtenerListaPorId(infoDoc.usuario).subscribe(datos_usuario => {
          infoDoc.usuario = datos_usuario.usua_Nombre;
        });
        this.materiaPrimaService.srvObtenerListaPorId(infoDoc.mp).subscribe(datos_mp => {
          infoDoc.mp = datos_mp.matPri_Nombre
        });
      });

    } else if (tipoDocumento == 'Asignacion') {
      this.asignacionService.srvObtenerListaPorId(formulario.asigMp_Id).subscribe(datos_asignacion => {
        const infoDoc : any = {
          id : datos_asignacion.asigMp_Id,
          codigo : datos_asignacion.asigMP_OrdenTrabajo,
          tipoDoc : 'ASIGNACION',
          fecha : datos_asignacion.asigMp_FechaEntrega,
          usuario : datos_asignacion.usua_Id,
          mp : formulario.matPri_Id,
          cant : formulario.dtAsigMp_Cantidad,
          estado : this.estadoOt,
        }

        this.ArrayDocumento.push(infoDoc);
        this.usuarioService.srvObtenerListaPorId(infoDoc.usuario).subscribe(datos_usuario => {
          infoDoc.usuario = datos_usuario.usua_Nombre;
        });
        this.totalMPEntregada = this.totalMPEntregada + infoDoc.cant;
        this.ArrayDocumento.sort((a,b) => b.fecha.localeCompare(a.fecha));
        this.formatonumeros(this.totalMPEntregada);
        this.materiaPrimaService.srvObtenerListaPorId(infoDoc.mp).subscribe(datos_mp => {
          infoDoc.mp = datos_mp.matPri_Nombre;
        });
      });
    } else if (tipoDocumento === 'RECUP') {
      this.recuperadoService.srvObtenerListaPorId(formulario.recMp_Id).subscribe(datos_recuperado => {
        const infoDoc : any = {
          id : datos_recuperado.recMp_Id,
          codigo : datos_recuperado.recMp_Id,
          tipoDoc : 'RECUPERADO',
          fecha : datos_recuperado.recMp_FechaIngreso,
          usuario : datos_recuperado.usua_Id,
          mp : formulario.matPri_Id,
          cant : formulario.recMatPri_Cantidad,
          estado : '',
        }
        this.ArrayDocumento.push(infoDoc);
        this.ArrayDocumento.sort((a,b) => b.fecha.localeCompare(a.fecha));
        this.usuarioService.srvObtenerListaPorId(infoDoc.usuario).subscribe(datos_usuario => {
          infoDoc.usuario = datos_usuario.usua_Nombre;
        });
        this.materiaPrimaService.srvObtenerListaPorId(infoDoc.mp).subscribe(datos_mp => {
          infoDoc.mp = datos_mp.matPri_Nombre;
        });
      })
    } else if (tipoDocumento == 'DEVOLUCION') {
      this.devolucionService.srvObtenerListaPorId(formulario.devMatPri_Id).subscribe(datos_devoluciones => {
        const infoDoc : any = {
          id : datos_devoluciones.devMatPri_Id,
          codigo : datos_devoluciones.devMatPri_OrdenTrabajo,
          tipoDoc : 'DEVOLUCION',
          fecha : datos_devoluciones.devMatPri_Fecha,
          usuario : datos_devoluciones.usua_Id,
          mp : formulario.matPri_Id,
          cant : formulario.dtDevMatPri_CantidadDevuelta,
          estado : '',
        }
        this.ArrayDocumento.push(infoDoc);
        this.usuarioService.srvObtenerListaPorId(infoDoc.usuario).subscribe(datos_usuario => {
          infoDoc.usuario = datos_usuario.usua_Nombre;
        });
        this.totalMPEntregada = this.totalMPEntregada + infoDoc.cant;
        this.ArrayDocumento.sort((a,b) => b.fecha.localeCompare(a.fecha));
        this.formatonumeros(this.totalMPEntregada);
        this.materiaPrimaService.srvObtenerListaPorId(infoDoc.mp).subscribe(datos_mp => {
          infoDoc.mp = datos_mp.matPri_Nombre
        });
      });
    } else if (tipoDocumento == 'BOPP') {
      this.asignacionBOPPService.srvObtenerListaPorId(formulario.asigBOPP_Id).subscribe(datos_asignacionBOPP => {
        let bopp : any = [];
        bopp.push(datos_asignacionBOPP);
        for (const item of bopp) {
          const infoDoc : any = {
            id : item.asigBOPP_Id,
            codigo : formulario.dtAsigBOPP_OrdenTrabajo,
            tipoDoc : 'BOPP',
            fecha : item.asigBOPP_FechaEntrega,
            usuario : item.usua_Id,
            mp : formulario.bopP_Id,
            cant : formulario.dtAsigBOPP_Cantidad,
            estado : this.estadoOt,
          }

          this.ArrayDocumento.push(infoDoc);
          this.usuarioService.srvObtenerListaPorId(infoDoc.usuario).subscribe(datos_usuario => {
            infoDoc.usuario = datos_usuario.usua_Nombre;
          });
          this.totalMPEntregada = this.totalMPEntregada + infoDoc.cant;
          this.ArrayDocumento.sort((a,b) => Number(b.codigo) - Number(a.codigo));
          this.ArrayDocumento.sort((a,b) => b.fecha.localeCompare(a.fecha));
          this.formatonumeros(this.totalMPEntregada);
          this.boppService.srvObtenerListaPorId(infoDoc.mp).subscribe(datos_bopp => {
            let boppNombre : any = [];
            boppNombre.push(datos_bopp);
            for (const i of boppNombre) {
              infoDoc.mp = i.bopP_Nombre;
            }
          });
          // LLENARÁ UN ARRAY CON LAS OT Y BUSCARÁ LA PRODUCCION TOTAL DE LAS OT GUARDADAS
          if (!this.acumuladorOT.includes(infoDoc.codigo)) {
            this.acumuladorOT.push(infoDoc.codigo);
            // EMPAQUE
            this.bagProServices.srvObtenerListaProcExtOt(infoDoc.codigo).subscribe(datos_procesos => {
              for (let index = 0; index < datos_procesos.length; index++) {
                if (datos_procesos[index].nomStatus == "EMPAQUE") {
                  this.cantidadTotalEmpaque = datos_procesos[index].extnetokg; + this.cantidadTotalEmpaque;
                  this.kgProduciodosOT += this.cantidadTotalEmpaque;
                }
              }
              //SELLADO Y WIKETIADO
              this.bagProServices.srvObtenerListaProcSelladoOT(infoDoc.codigo).subscribe(datos_selado => {
                for (let i = 0; i < datos_selado.length; i++) {
                  if (datos_selado[i].nomStatus == "SELLADO") {
                    this.cantidadTotalSella = datos_selado[i].peso; + this.cantidadTotalSella;
                    this.kgProduciodosOT += this.cantidadTotalSella;
                  } else if (datos_selado[i].nomStatus == "Wiketiado") {
                    this.cantidadTotalWiketiado = datos_selado[i].peso + this.cantidadTotalWiketiado;
                    this.kgProduciodosOT += this.cantidadTotalWiketiado;
                  }
                }
              });
            });
          }
        }
      });
    } else if (tipoDocumento == 'Entrada_Tintas'){

    }

    setTimeout(() => {
      this.load = true;
    }, 5000);
  }

  llenarTablaMP(formulario : any, ot : any, id : number){
    if (this.asignacion == 'Asignacion') {
      const infoDoc : any = {
        id : id,
        codigo : ot,
        tipoDoc : 'ASIGNACION',
        fecha : formulario.asigMp_FechaEntrega,
        usuario : formulario.usua_Nombre,
        mp : formulario.matPri_Nombre,
        cant : formulario.sum,
        estado : this.estadoOt,
      }

      this.ArrayDocumento.push(infoDoc);
      this.totalMPEntregada = this.totalMPEntregada + infoDoc.cant;
      this.ArrayDocumento.sort((a,b) => Number(b.codigo) - Number(a.codigo));
      this.ArrayDocumento.sort((a,b) => b.fecha.localeCompare(a.fecha));
      this.formatonumeros(this.totalMPEntregada);
    }
    this.load = true;
  }

  // Funcion que llena el array con los productos que pertenecen al pedido que se consulta
  llenarDocumento(formulario : any){
    this.load = false;
    let id : any = formulario.id;
    let tipoDoc : any = formulario.tipoDoc;
    this.mpAgregada = [];
    let otConsultadas = [];
    let acumuladora : number = 0;

    if (tipoDoc == 'FCO') {
      this.facturaCompraService.srvObtenerLista().subscribe(datos_mpFactura => {
        for (let index = 0; index < datos_mpFactura.length; index++) {
          if (id == datos_mpFactura[index].facco_Id) {
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
        }
      });
    } else if (tipoDoc == 'REM') {
      this.remisionMpService.srvObtenerLista().subscribe(datos_remisionMP => {
        for (let index = 0; index < datos_remisionMP.length; index++) {
          if (datos_remisionMP[index].rem_Id == id) {
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
        }
      });
    } else if (tipoDoc == 'ASIGNACION') {
      this.asignacionMpService.srvObtenerListaPorOT(formulario.codigo).subscribe(datos_asignacionMP => {
        for (let index = 0; index < datos_asignacionMP.length; index++) {
          const mpFactura : any = {
            Id : datos_asignacionMP[index].matPri_Id,
            Nombre : datos_asignacionMP[index].matPri_Nombre,
            Cant : this.formatonumeros(datos_asignacionMP[index].sum),
            UndCant : datos_asignacionMP[index].undMed_Id,
            // Stock : datos_materiPrima.matPri_Stock,
            // UndStock : datos_materiPrima.undMed_Id,
            // PrecioUnd : '',
            // SubTotal : '',
          }
          this.mpAgregada.push(mpFactura);
        }
      });
    } else if (tipoDoc == 'RECUPERADO') {
      this.recuperadoMPService.srvObtenerLista().subscribe(datos_mpRecuperada => {
        for (let index = 0; index < datos_mpRecuperada.length; index++) {
          if (datos_mpRecuperada[index].recMp_Id == id) {
            this.materiaPrimaService.srvObtenerListaPorId(datos_mpRecuperada[index].matPri_Id).subscribe(datos_materiPrima => {
              const mpFactura : any = {
                Id : datos_materiPrima.matPri_Id,
                Nombre : datos_materiPrima.matPri_Nombre,
                Cant : this.formatonumeros(datos_mpRecuperada[index].recMatPri_Cantidad),
                UndCant : datos_mpRecuperada[index].undMed_Id,
              }
              this.recuperado = 2;
              this.mpAgregada.push(mpFactura);
            });
          } else continue;
        }
      });
    } else if (tipoDoc == 'DEVOLUCION') {
      this.devolucionMPService.srvObtenerListaPorDevId(id).subscribe(datos_devolucionesMP => {
        for (let i = 0; i < datos_devolucionesMP.length; i++) {
          this.materiaPrimaService.srvObtenerListaPorId(datos_devolucionesMP[i].matPri_Id).subscribe(datos_materiaPrima => {
            const mpFactura : any = {
              Id : datos_materiaPrima.matPri_Id,
              Nombre : datos_materiaPrima.matPri_Nombre,
              Cant : this.formatonumeros(datos_devolucionesMP[i].dtDevMatPri_CantidadDevuelta),
              UndCant : datos_devolucionesMP[i].undMed_Id,
              Stock : datos_materiaPrima.matPri_Stock,
              UndStock : datos_materiaPrima.undMed_Id,
              PrecioUnd : '',
              SubTotal : '',
            }
            this.mpAgregada.push(mpFactura);
          });
        }
      });
    } else if (tipoDoc == 'BOPP') {
      this.boppAsignada = [];
      this.producidoPDF = 0;
      this.asignadoPDF = 0;
      this.acumuladorOTPDF = [];
      this.detallesAsgBOPPService.srvObtenerListaPorAsignacion(id).subscribe(datos_detallesAsgBOPP => {
        for (let i = 0; i < datos_detallesAsgBOPP.length; i++) {
          if (!otConsultadas.includes(datos_detallesAsgBOPP[i].dtAsigBOPP_OrdenTrabajo)) {
            otConsultadas.push(datos_detallesAsgBOPP[i].dtAsigBOPP_OrdenTrabajo);
          }
        }
      });

      setTimeout(() => {
        for (const itemOT of otConsultadas) {
          this.detallesAsgBOPPService.srvObtenerListaPorOt(itemOT).subscribe(datos_detallesAsgBOPP => {
            for (let j = 0; j < datos_detallesAsgBOPP.length; j++) {
              this.boppService.srvObtenerListaPorId(datos_detallesAsgBOPP[j].bopP_Id).subscribe(datos_bopp => {
                let bopp : any = [];
                bopp.push(datos_bopp);
                acumuladora += 1
                for (const item of bopp) {
                  const asignacionBOPP : any = {
                    OT : itemOT,
                    Serial : item.bopP_Serial,
                    Nombre : item.bopP_Nombre,
                  }

                  this.mpAgregada.push(asignacionBOPP);

                  if (!this.boppAsignada.includes(item.bopP_Nombre)) {
                    this.boppAsignada.push(item.bopP_Nombre);
                    this.asignadoPDF += item.bopP_CantidadInicialKg;
                  }

                  // LLENARÁ UN ARRAY CON LAS OT Y BUSCARÁ LA PRODUCCION TOTAL DE LAS OT GUARDADAS
                  if (!this.acumuladorOTPDF.includes(itemOT)) {
                    this.acumuladorOTPDF.push(itemOT);
                    // EMPAQUE
                    this.bagProServices.srvObtenerListaProcExtOt(itemOT).subscribe(datos_procesos => {
                      for (let index = 0; index < datos_procesos.length; index++) {
                        if (datos_procesos[index].nomStatus == "EMPAQUE") {
                          this.producidoPDF += datos_procesos[index].extnetokg;
                        }
                      }
                    });
                  }
                  this.mpAgregada.sort((a,b) => Number(a.OT) - Number(b.OT));
                  break;
                }
              });
            }
          });
        }
      }, 1200);
    }
    setTimeout(() => {
      this.llenarPDFConBD(formulario);
    }, 2500);
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
          widths: [30, '*', 70, 50, 50, 80],
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
  tableAsignacion(data, columns) {
    return {
        table: {
          headerRows: 1,
          widths: [70, '*', 100, 50],
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
  tableAsignacionBOPP(data, columns) {
    return {
      table: {
        headerRows: 1,
        widths: [70, 100, '*'],
        body: this.buildTableBody(data, columns),
      },
      fontSize: 9,
      layout: {
        fillColor: function (rowIndex, node, columnIndex) {
          return (rowIndex == 0) ? '#CCCCCC' : null;
        }
      }
    }
  }

  // Funcion que genera la tabla donde se mostrará la información de las OT
  // tableAsignacionOT(data, columns) {
  //   return {
  //     table: {
  //       headerRows: 1,
  //       widths: [40, '*', '*', 30, 30, 30],
  //       body: this.buildTableBody(data, columns),
  //     },
  //     fontSize: 9,
  //     layout: {
  //       fillColor: function (rowIndex, node, columnIndex) {
  //         return (rowIndex == 0) ? '#CCCCCC' : null;
  //       }
  //     }
  //   }
  // }

  // Funcion para llenar el pdf con información de la base de datos dependiendo el pedido
  llenarPDFConBD(formulario : any){
    let id : number = formulario.id;
    let tipoDoc : any = formulario.tipoDoc;
    let remisionFactura = [];

    if (tipoDoc == 'FCO') {
      this.facturaCompraMPService.srvObtenerListaPorId(id).subscribe(datos_factura => {
        this.facturaCompraService.srvObtenerLista().subscribe(datos_mpFactura => {
          for (let index = 0; index < datos_mpFactura.length; index++) {
            if (id == datos_mpFactura[index].facco_Id) {
              this.usuarioService.srvObtenerListaPorId(datos_factura.usua_Id).subscribe(datos_usuario => {
                this.proveedorService.srvObtenerListaPorId(datos_factura.prov_Id).subscribe(datos_proveedor => {
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
              break;
            }
          }
        });
      });
    } else if (tipoDoc == 'REM') {
      this.remisionService.srvObtenerListaPorId(id).subscribe(datos_remision => {
        this.remisionMpService.srvObtenerLista().subscribe(datos_remisionMP => {
          for (let index = 0; index < datos_remisionMP.length; index++) {
            if (datos_remisionMP[index].rem_Id == id) {
              this.usuarioService.srvObtenerListaPorId(datos_remision.usua_Id).subscribe(datos_usuario => {
                this.proveedorService.srvObtenerListaPorId(datos_remision.prov_Id).subscribe(datos_proveedor => {
                  this.materiaPrimaService.srvObtenerListaPorId(datos_remisionMP[index].matPri_Id).subscribe(datos_materiPrima => {
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
              break
            }
          }
        });
      });
    } else if (tipoDoc == 'ASIGNACION') {
      this.asignacionService.srvObtenerListaPorId(id).subscribe(datos_asignacion => {
        this.asignacionMpService.srvObtenerLista().subscribe(datos_asignacionMP => {
          for (let index = 0; index < datos_asignacionMP.length; index++) {
            if (id === datos_asignacionMP[index].asigMp_Id) {
              this.usuarioService.srvObtenerListaPorId(datos_asignacion.usua_Id).subscribe(datos_usuario => {
                for (let mp = 0; mp < this.mpAgregada.length; mp++) {
                  let FechaEntregaDatetime = datos_asignacion.asigMp_FechaEntrega;
                  let FechaEntregaNueva = FechaEntregaDatetime.indexOf("T");
                  let fecharegistroFinal = FechaEntregaDatetime.substring(0, FechaEntregaNueva);
                  const pdfDefinicion : any = {
                    info: {
                      title: `${datos_asignacion.asigMp_Id}`
                    },
                    content : [
                      {
                        text: `Plasticaribe S.A.S ---- Asignación de Materia Prima`,
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
                        text: `\n Información la Asignación \n \n`,
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
                              `OT: ${datos_asignacion.asigMP_OrdenTrabajo}`,
                              `Maquina: ${datos_asignacion.asigMp_Maquina}`,
                              `Proceso : ${datos_asignacionMP[index].proceso_Id}`
                            ]
                          ]
                        },
                        layout: 'lightHorizontalLines',
                        fontSize: 12,
                      },
                      {
                        text: `\n \nObervación sobre la remisión: \n ${datos_asignacion.asigMp_Observacion}\n`,
                        style: 'header',
                      },
                      {
                        text: `\n Información detallada de Materia(s) Prima(s) asignada(s) \n `,
                        alignment: 'center',
                        style: 'header'
                      },

                      this.tableAsignacion(this.mpAgregada, ['Id', 'Nombre', 'Cant', 'UndCant']),
                    ],
                    styles: {
                      header: {
                        fontSize: 10,
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
            }else continue;
            break;
          }
        })
      });

    } else if (tipoDoc == 'RECUPERADO') {
      this.recuperadoService.srvObtenerListaPorId(id).subscribe(datos_recuperado => {
        this.recuperadoMPService.srvObtenerLista().subscribe(datos_mpRecuperada => {
          for (let index = 0; index < datos_mpRecuperada.length; index++) {
            if (datos_mpRecuperada[index].recMp_Id == id) {
              this.usuarioService.srvObtenerListaPorId(datos_recuperado.usua_Id).subscribe(datos_usuarios => {
                for (let mp = 0; mp < this.mpAgregada.length; mp++) {
                  let FechaEntregaDatetime = datos_recuperado.recMp_FechaIngreso;
                  let FechaEntregaNueva = FechaEntregaDatetime.indexOf("T");
                  let fecharegistroFinal = FechaEntregaDatetime.substring(0, FechaEntregaNueva);
                  const pdfDefinicion : any = {
                    info: {
                      title: `${datos_recuperado.recMp_Id}`
                    },
                    content : [
                      {
                        text: `Plasticaribe S.A.S ---- Recuperado de Materia Prima`,
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
                        text: `Registrado Por: ${datos_usuarios.usua_Nombre}\n`,
                        alignment: 'right',
                        style: 'header',
                      },
                      {
                        text: `\n Información la Asignación \n \n`,
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
                              `Proceso: ${datos_recuperado.proc_Id}`,
                              ``,
                              ``
                            ]
                          ]
                        },
                        layout: 'lightHorizontalLines',
                        fontSize: 9,
                      },
                      {
                        text: `\n \nObervación sobre la remisión: \n ${datos_recuperado.recMp_Observacion}\n`,
                        style: 'header',
                      },
                      {
                        text: `\n Información detallada de Materia(s) Prima(s) asignada(s) \n `,
                        alignment: 'center',
                        style: 'header'
                      },

                      this.tableAsignacion(this.mpAgregada, ['Id', 'Nombre', 'Cant', 'UndCant']),
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
            }else continue;
            break
          }
        });
      });
    } else if (tipoDoc == 'DEVOLUCION') {
      this.devolucionService.srvObtenerListaPorId(id).subscribe(datos_devolucion => {
        this.devolucionMPService.srvObtenerListaPorDevId(id).subscribe(datos_devolucionesMP => {
          for (let i = 0; i < datos_devolucionesMP.length; i++) {
            this.usuarioService.srvObtenerListaPorId(datos_devolucion.usua_Id).subscribe(datos_usuario => {
              for (let j = 0; j < this.mpAgregada.length; j++) {
                let FechaEntregaDatetime = datos_devolucion.devMatPri_Fecha;
                let FechaEntregaNueva = FechaEntregaDatetime.indexOf("T");
                let fecharegistroFinal = FechaEntregaDatetime.substring(0, FechaEntregaNueva);
                const pdfDefinicion : any = {
                  info: {
                    title: `${datos_devolucion.devMatPri_OrdenTrabajo}`
                  },
                  content : [
                    {
                      text: `Plasticaribe S.A.S ---- Devolución de Materia Prima`,
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
                      text: `\n Información la Asignación \n \n`,
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
                            `Orden de Trabajo: ${datos_devolucion.devMatPri_OrdenTrabajo}`,
                            ``,
                            ``
                          ]
                        ]
                      },
                      layout: 'lightHorizontalLines',
                      fontSize: 9,
                    },
                    {
                      text: `\n \nObervación sobre la remisión: \n ${datos_devolucion.devMatPri_Motivo}\n`,
                      style: 'header',
                    },
                    {
                      text: `\n Información detallada de Materia(s) Prima(s) asignada(s) \n `,
                      alignment: 'center',
                      style: 'header'
                    },

                    this.tableAsignacion(this.mpAgregada, ['Id', 'Nombre', 'Cant', 'UndCant']),
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
            break;
          }
        });
      });
    } else if (tipoDoc == 'BOPP') {
      this.asignacionBOPPService.srvObtenerListaPorId(id).subscribe(datos_asignacionBOPP => {
        let boppAsg : any = [];
        boppAsg.push(datos_asignacionBOPP);
        for (const item of boppAsg) {
          this.detallesAsgBOPPService.srvObtenerListaPorAsignacion(id).subscribe(datos_detallesAsgBOPP => {
            for (let i = 0; i < datos_detallesAsgBOPP.length; i++) {
              this.usuarioService.srvObtenerListaPorId(item.usua_Id).subscribe(datos_usuario => {
                for (let mp = 0; mp < this.mpAgregada.length; mp++) {
                  let FechaEntregaDatetime = item.asigBOPP_FechaEntrega;
                  let FechaEntregaNueva = FechaEntregaDatetime.indexOf("T");
                  let fecharegistroFinal = FechaEntregaDatetime.substring(0, FechaEntregaNueva);
                  const pdfDefinicion : any = {
                    info: {
                      title: `Asignación BOPP N° ${item.asigBOPP_Id}`
                    },
                    content : [
                      {
                        text: `Plasticaribe S.A.S ---- Asignación de BOPP`,
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
                        text: `\n Información de la Asignación \n \n`,
                        alignment: 'center',
                        style: 'header'
                      },
                      {
                        text: `\n \nObervación sobre la Asignación: \n ${item.asigBOPP_Observacion}\n`,
                        style: 'header',
                      },

                      {
                        text: `\n Información detallada deL BOPP \n `,
                        alignment: 'center',
                        style: 'header'
                      },

                      this.tableAsignacionBOPP(this.mpAgregada, ['OT', 'Serial', 'Nombre']),

                      {
                        text: `\nCantidad Total de Materia Prima Asignada: ${this.formatonumeros(Math.round(this.asignadoPDF))}`,
                        alignment: 'right',
                        style: 'header',
                      },

                      '\n',
                      {
                        text: `\nProducido por las Ordenes de Trabajo: ${this.formatonumeros(Math.round(this.producidoPDF))}`,
                        alignment: 'right',
                        style: 'header',
                      },
                    ],
                    styles: {
                      header: {
                        fontSize: 10,
                        bold: true
                      },
                      titulo: {
                        fontSize: 15,
                        bold: true
                      }
                    }
                  }
                  this.load = true;
                  const pdf = pdfMake.createPdf(pdfDefinicion);
                  pdf.open();
                  break;
                }
              });
              break;
            }
          });
        }
      });
    }

    this.load = true;
  }

  editarAsignacion(formulario : any){
    if (formulario.tipoDoc == 'BOPP') {
      this.modalBOPP = 2;
      this.identificadorAsignacion = formulario.id;
      this.arrayOT = [];
      let boppAsignada : any = [];
      this.EditarAsignacionesBOPP.ArrayBoppPedida = [];
      this.modalEdicionAsignacionBOPP = true;
      this.asignacionBOPPService.srvObtenerListaPorId(formulario.id).subscribe(datos_asignacionBOPP => {
        this.EditarAsignacionesBOPP.cargarDatos(datos_asignacionBOPP);
      });
      this.detallesAsgBOPPService.srvObtenerListaPorAsignacion(formulario.id).subscribe(datos_detallesAsgBOPP => {
        for (let i = 0; i < datos_detallesAsgBOPP.length; i++) {
          this.boppService.srvObtenerListaPorId(datos_detallesAsgBOPP[i].bopP_Id).subscribe(datos_bopp => {
            let datosBOPPAsg : any = [];
            datosBOPPAsg.push(datos_bopp);
            for (const item of datosBOPPAsg) {
              if (!boppAsignada.includes(item.bopP_Serial)) {
                boppAsignada.push(item.bopP_Serial);

                let bopp : any = {
                  IdAsg : formulario.id,
                  idBOPP : item.bopP_Id,
                  Serial : item.bopP_Serial,
                  Nombre : item.bopP_Nombre,
                }
                this.EditarAsignacionesBOPP.ArrayBoppPedida.push(bopp);
                this.EditarAsignacionesBOPP.idAsignacion = formulario.id;
                this.EditarAsignacionesBOPP.boppRegistrados.push(item.bopP_Serial);
              }
            }
          });
          this.infoOT(datos_detallesAsgBOPP[i].dtAsigBOPP_OrdenTrabajo, formulario.id);
        }
      });
    }
    this.load = true;
  }

  limpiarCamposAlCerrarModal() {
    this.EditarAsignacionesBOPP.limpiarTodosLosCampos();
    this.modalBOPP = 1;
    this.identificadorAsignacion = 0;
  }

  infoOT(ordenTrabajo : number, IdDtAsg : number){
    if (!this.arrayOT.includes(ordenTrabajo)) {
      this.arrayOT.push(ordenTrabajo);
      this.bagProServices.srvObtenerListaClienteOT_Item(ordenTrabajo).subscribe(datos_OT => {
        for (const itemOT of datos_OT) {
          if (itemOT.estado == null || itemOT.estado == '' || itemOT.estado == '0') {
            const infoOT : any = {
              IdDtAsg : IdDtAsg,
              ot : itemOT.item,
              cliente : itemOT.clienteNom,
              micras : itemOT.extCalibre,
              ancho : itemOT.ptAnchopt,
              item : itemOT.clienteItemsNom,
              kg : itemOT.datosotKg,
            }
            this.EditarAsignacionesBOPP.ordenesTrabajo.push(infoOT);
            this.EditarAsignacionesBOPP.otRegistradas.push(ordenTrabajo);
            break;
          } else if (itemOT.estado == 4 || itemOT.estado == 1) Swal.fire(`No es podible asignar a esta orden de trabajo, la OT ${ordenTrabajo} se encuentra cerrada.`);
        }
      });
    }
  }
}
