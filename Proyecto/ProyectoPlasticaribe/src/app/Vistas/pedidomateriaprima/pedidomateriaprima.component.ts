import { Component, OnInit,Inject } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import Swal from 'sweetalert2';
import { RolesService } from 'src/app/Servicios/roles.service';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { MateriaPrimaService } from 'src/app/Servicios/materiaPrima.service';
import { ProveedorService } from 'src/app/Servicios/proveedor.service';
import { MpProveedorService } from 'src/app/Servicios/MpProveedor.service';
import { CategoriaMateriaPrimaService } from 'src/app/Servicios/categoriaMateriaPrima.service';
import { TipoBodegaService } from 'src/app/Servicios/tipoBodega.service';
import { UnidadMedidaService } from 'src/app/Servicios/unidad-medida.service';
import { FactuaMpCompradaService } from 'src/app/Servicios/facturaMpComprada.service';
import { EstadosService } from 'src/app/Servicios/estados.service';
import { TipoEstadosService } from 'src/app/Servicios/tipo-estados.service';
import { FacturaMpService } from 'src/app/Servicios/facturaMp.service';
import { UsuarioService } from 'src/app/Servicios/usuario.service';
import { ProcesosService } from 'src/app/Servicios/procesos.service';
import { AreaService } from 'src/app/Servicios/area.service';
import { TipoDocumentoService } from 'src/app/Servicios/tipoDocumento.service';
import { RemisionService } from 'src/app/Servicios/Remision.service';
import { RemisionesMPService } from 'src/app/Servicios/remisionesMP.service';
import pdfMake from 'pdfmake/build/pdfmake';
import { RemisionFacturaService } from 'src/app/Servicios/remisionFactura.service';
import { AsignacionMPxTintasService } from 'src/app/Servicios/asignacionMPxTintas.service';
import { TintasService } from 'src/app/Servicios/tintas.service';
import { Srv_OrdenesComprasService } from 'src/app/Servicios/Srv_OrdenesCompras.service';
import { ThisReceiver } from '@angular/compiler';
import { OrdenCompra_MateriaPrimaService } from 'src/app/Servicios/OrdenCompra_MateriaPrima.service';

@Component({
  selector: 'app.pedidomateriaprima.component',
  templateUrl: './pedidomateriaprima.component.html',
  styleUrls: ['./Pedidomateriaprima.component.css']
})
export class PedidomateriaprimaComponent implements OnInit {

  public FormMateriaPrimaFactura !: FormGroup;
  public FormMateriaPrima !: FormGroup;
  public FormRemisiones !: FormGroup;

  public consultaRemisiones !: FormGroup;


  public FormMateriaPrimaRetiro !: FormGroup;
  public FormMateriaPrimaRetirada !: FormGroup;

  //Llamar modales, inicializados como falsos para que no se carguen al ingresar a la pagina.
  public ModalCrearProveedor: boolean = false;
  public ModalCrearMateriaPrima: boolean= false;

  /* Vaiables*/
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
  ArrayMateriaPrima : any [] = []; //Variable que tendrá la informacion de los productos que se piden en el nuevo pedido
  ArrayMateriaPrimaRetirada : any [] = []; //Variable que tendrá la informacion de los productos que se piden para uan OT
  AccionBoton = "Agregar"; //Variable que almanará informacio para saber si una materia prima está en edicion o no (Se editará una materia prima cargada en la tabla, no una en la base de datos)
  valorTotal : number = 0; //Variable que guardará el valor total de la factura de entrada de materia prima
  nombreMateriaPrima : string; //Varible que almacenará el nombre de una materia prima consultado o seleccionado
  precioOT : number; //Variable que va a almacenar el precio de la ot consultada
  cantidadTotalExt : number; //Variable que va a almacenar el total de la cantidad extruida en una OT
  cantidadTotalImp : number; //Variable que va a almacenar el total de la cantidad impresa en una OT
  cantidadTotalDbl : number; //Variable que va a almacenar el total de la cantidad doblada en una OT
  proceso : string = ''; //Variable ayudará a almacenar el proceso del cuela se está consultando la ot
  proveedor = [];
  tipodocuemnto = [];
  totalPorcentajePerida : number; //Variable que ayudará a calcular el total de perdida en una OT
  ultimoIdFactura : number = 0;
  validarCamposFacRem : number = 3;
  ultimoIdRemision : number = 0;
  ArrayRemisiones = [];
  precioRemision = [];
  titulosTablaRemisiones = [];
  valorTotalRem = 0;
  mpAgregada = [];
  /* CONSULTAS DE MATERIA PRIMA */
  MpConsultada = [];
  remision : any = [];
  remConFac : any = [];
  validarInputProveedor : any;
  validarInputMP : any;
  keywordProveedor = 'prov_Nombre';
  //keywordMP = 'matPri_Nombre';
  keywordMP = 'name';
  public historyHeading: string = 'Seleccionado Recientemente';
  NombreMatPrima : string = 'Materia Prima';
  public load: boolean;
  public arrayOrdenCompra = [];

  constructor(private materiaPrimaService : MateriaPrimaService,
                private categoriMpService : CategoriaMateriaPrimaService,
                  private tipoBodegaService : TipoBodegaService,
                    private unidadMedidaService : UnidadMedidaService,
                      private estadoService : EstadosService,
                        private tipoEstadoService : TipoEstadosService,
                          private usuarioService : UsuarioService,
                            private procesosService : ProcesosService,
                              private areasService : AreaService,
                                private rolService : RolesService,
                                  private frmBuilderMateriaPrima : FormBuilder,
                                    @Inject(SESSION_STORAGE) private storage: WebStorageService,
                                      private proveedorservices : ProveedorService,
                                        private proveedorMPService : MpProveedorService,
                                          private facturaMpComService : FactuaMpCompradaService,
                                            private facturaMpService : FacturaMpService,
                                              private tipoDocumentoService : TipoDocumentoService,
                                                private remisionService : RemisionService,
                                                  private remisionMPService : RemisionesMPService,
                                                    private remisionFacturaService : RemisionFacturaService,
                                                      private tintasService : TintasService,
                                                        private asignacionMPxTintas : AsignacionMPxTintasService,
                                                          private servicioOCMatPrima : OrdenCompra_MateriaPrimaService) {

    this.FormMateriaPrimaFactura = this.frmBuilderMateriaPrima.group({
      ConsecutivoFactura : ['', Validators.required],
      OrdenCompra : ['', Validators.required],
      MpFactura: [Validators.required],
      MpRemision : [Validators.required],
      //MpingresoFecha: ['', Validators.required],
      proveedor: ['', Validators.required],
      proveedorNombre: ['', Validators.required],
      MpObservacion : ['', Validators.required],
    });

    this.FormMateriaPrima = this.frmBuilderMateriaPrima.group({
      MpId : ['', Validators.required],
      MpNombre: ['', Validators.required],
      MpCantidad : ['', Validators.required],
      MpPrecio: ['', Validators.required],
      MpUnidadMedida: ['', Validators.required],
    });

    this.FormRemisiones = this.frmBuilderMateriaPrima.group({
      idRemision : ['', Validators.required],
    });

    this.FormMateriaPrimaRetiro = this.frmBuilderMateriaPrima.group({
      OTRetiro : ['', Validators.required],
      FechaRetiro : ['', Validators.required],
      UsuarioRetiro : ['', Validators.required],
      AreaRetiro : ['', Validators.required],
      EstadoRetiro : ['', Validators.required],
      ObservacionRetiro : ['', Validators.required],
      ProcesoRetiro : ['', Validators.required],
    });

    this.FormMateriaPrimaRetirada = this.frmBuilderMateriaPrima.group({
      MpIdRetirada : ['', Validators.required],
      MpNombreRetirada: ['', Validators.required],
      MpCantidadRetirada : ['', Validators.required],
      MpPrecioRetirada: ['', Validators.required],
      MpUnidadMedidaRetirada: ['', Validators.required],
      MpStockRetirada: ['', Validators.required],
    });

    this.load = true;
    this.validarInputProveedor = true;
    this.validarInputMP = true;
  }


  ngOnInit(): void {
    this.obtenerUltimoIdFacturaCompra();
    this.lecturaStorage();
    this.fecha();
    this.ColumnasTabla();
    this.ColumnasTablaRemisiones();
    this.obtenerUnidadMedida();
    this.obtenerEstados();
    this.obtenerProcesos();
    this.obtenerProveeedor();
    this.obtenerDocumetno();
    this.obtenerMateriaPrima2();
  }

  onChangeSearchProveedor(val: string) {
    if (val != '') this.validarInputProveedor = false;
    else this.validarInputProveedor = true;
    // fetch remote data from here
    // And reassign the 'data' which is binded to 'data' property.
  }

  onFocusedProveedor(e){
    if (!e.isTrusted) this.validarInputProveedor = false;
    else this.validarInputProveedor = true;
    // do something when input is focused
  }

  onChangeSearchMP(val: string) {
    if (val != '') this.validarInputMP = false;
    else this.validarInputMP = true;
    // fetch remote data from here
    // And reassign the 'data' which is binded to 'data' property.
  }

  onFocusedMP(e){
    if (!e.isTrusted) this.validarInputMP = false;
    else this.validarInputMP = true;
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

    this.FormMateriaPrimaFactura.setValue({
      ConsecutivoFactura : this.ultimoIdFactura,
      OrdenCompra : null,
      MpFactura: null,
      MpRemision : null,
      //MpingresoFecha: this.today,
      proveedor: '',
      proveedorNombre: '',
      MpObservacion : '',
    });
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

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = '$1,';
    return number.toString().replace(exp,rep);
  }

  // Funcion que limpia los todos los campos de la vista
  LimpiarCampos() {
    this.FormMateriaPrimaFactura.setValue({
      ConsecutivoFactura : this.ultimoIdFactura,
      OrdenCompra : null,
      MpFactura: null,
      MpRemision : null,
      //MpingresoFecha: this.today,
      proveedor: '',
      proveedorNombre: '',
      MpObservacion : '',
    });
  }

  //Funcion que limpiará los campos de la materia pirma entrante
  limpiarCamposMP(){
    this.FormMateriaPrima.reset();
  }

  limpiarCamposMPRetirada(){
    this.FormMateriaPrimaRetirada.reset();
  }

  // Función que buscará las materias primas que se utilizan para crear tintas
  obtenerMateriaPrima2(){
    this.asignacionMPxTintas.srvObtenerListaMatPrimas().subscribe(data_materiasPrimas => {
      for (let i = 0; i < data_materiasPrimas.length; i++) {
        if (data_materiasPrimas[i]) {
          let mp : any = {
            id : data_materiasPrimas[i].matPrima,
            name : data_materiasPrimas[i].nombreMP,
          }
          this.materiasPrimas.push(mp);
        }
      }
    });
  }

  //Funcion que consultara una materia prima con base a un ID pasado en la vista
  buscarMpId2(){
    let idMatPrima : number = this.FormMateriaPrima.value.MpId;
    this.materiaPrimaSeleccionada = [];

    this.asignacionMPxTintas.srvObtenerListaMatPrimasPorId(idMatPrima).subscribe(datos_materiaPrima => {
      for (let index = 0; index < datos_materiaPrima.length; index++) {
        let infoMatPrima : any = {
          ID : datos_materiaPrima[index].matPrima,
          Nombre : datos_materiaPrima[index].nombreMP,
          Precio : datos_materiaPrima[index].precioMP,
          Cantidad : '',
          Unidad : datos_materiaPrima[index].unidad,
        }
        this.materiaPrimaSeleccionada.push(infoMatPrima);
      }
        if(this.materiaPrimaSeleccionada.length == 0) {
          this.limpiarCamposMPRetirada();
          Swal.fire('No se encontró la materia prima consultada.');
        } else this.NombreMatPrima = ''; this.cargarInfoMP2();
    });
  }

  //Funcion que consultara una materia prima con base a la que está seleccionada en la vista
  buscarMpSeleccionada2(item){
    this.validarInputMP = false;
    this.FormMateriaPrima.value.MpNombre = item.name;
    let nombreMateriaPrima : string = this.FormMateriaPrima.value.MpNombre;
    this.materiaPrimaSeleccionada = [];

    this.asignacionMPxTintas.srvObtenerListaMatPrimas().subscribe(datos_materiasPrimas => {
      for (let index = 0; index < datos_materiasPrimas.length; index++) {
        if (nombreMateriaPrima == datos_materiasPrimas[index].nombreMP) {
          let infoMatPrima : any = {
            ID : datos_materiasPrimas[index].matPrima,
            Nombre : datos_materiasPrimas[index].nombreMP,
            Precio : datos_materiasPrimas[index].precioMP,
            Cantidad : '',
            Unidad : datos_materiasPrimas[index].unidad,
          }
          this.materiaPrimaSeleccionada.push(infoMatPrima);
          this.cargarInfoMP2();
        }
      }
    });
  }

  //Funcion que llenará la infomacion de materia prima buscada o seleccionada y pasará la informacion a la vista
  cargarInfoMP2(){
    for (const Mp of this.materiaPrimaSeleccionada) {
      this.FormMateriaPrima.setValue({
        MpId : Mp.ID,
        MpNombre : Mp.Nombre,
        MpPrecio : Mp.Precio,
        MpCantidad : '',
        MpUnidadMedida : Mp.Unidad,
      });
    }
  }

  //Funcion que va a buscar y almacenar todos los nombre de las categorias de materia prima
  obtenerNombreCategoriasMp(){
    this.categoriMpService.srvObtenerLista().subscribe(datos_categorias => {
      for (let index = 0; index < datos_categorias.length; index++) {
        this.nombreCategoriasMP.push(datos_categorias[index].catMP_Nombre);
      }
    });
  }

  //Funcion que va almacenar todas las unidades de medida existentes en la empresa
  obtenerUnidadMedida(){
    this.unidadMedidaService.srvObtenerLista().subscribe(datos_unidadesMedida => {
      for (let index = 0; index < datos_unidadesMedida.length; index++) {
        this.unidadMedida.push(datos_unidadesMedida[index].undMed_Id);
      }
    });
  }

  //Funcion que se encargará de buscary almacenar todos los usuarios
  obtenerUsuarios(){
    this.usuarioService.srvObtenerListaUsuario().subscribe(datos_usuarios => {
      for (let index = 0; index < datos_usuarios.length; index++) {
        this.usuarios.push(datos_usuarios[index]);
      }
    });
  }

  obtenerDocumetno(){
    this.tipoDocumentoService.srvObtenerLista().subscribe(datos_documento => {
      for (let index = 0; index < datos_documento.length; index++) {
        this.tipodocuemnto.push(datos_documento[index]);
      }
    });
  }

  obtenerProveeedor(){
    this.proveedorservices.srvObtenerLista().subscribe(datos_proveedor => {
      for (let index = 0; index < datos_proveedor.length; index++) {
        this.proveedor.push(datos_proveedor[index]);
      }
    });
  }

  llenarProveedorSeleccionado(item){
    this.FormMateriaPrimaFactura.value.proveedorNombre = item.prov_Nombre;
    if (this.FormMateriaPrimaFactura.value.proveedorNombre != '') this.validarInputProveedor = false;
    else this.validarInputProveedor = true;
    let proveedorSelccionado : string = this.FormMateriaPrimaFactura.value.proveedorNombre;
    this.proveedorservices.srvObtenerLista().subscribe(datos_proveedores => {
      for (let index = 0; index < datos_proveedores.length; index++) {
        if (datos_proveedores[index].prov_Nombre == proveedorSelccionado) {
          this.FormMateriaPrimaFactura.setValue({
            ConsecutivoFactura : this.FormMateriaPrimaFactura.value.ConsecutivoFactura,
            MpFactura: this.FormMateriaPrimaFactura.value.MpFactura,
            MpRemision : this.FormMateriaPrimaFactura.value.MpRemision,
            MpingresoFecha: this.FormMateriaPrimaFactura.value.MpingresoFecha,
            proveedor : datos_proveedores[index].prov_Id,
            proveedorNombre: this.FormMateriaPrimaFactura.value.proveedorNombre,
            MpObservacion: this.FormMateriaPrimaFactura.value.MpObservacion,
          });
        }
      }
    })
  }

  llenarProvedorId(){
    let proveedorID : string = this.FormMateriaPrimaFactura.value.proveedor
    this.proveedorservices.srvObtenerListaPorId(proveedorID).subscribe(datos_proveedores => {
      this.FormMateriaPrimaFactura.setValue({
        ConsecutivoFactura : this.FormMateriaPrimaFactura.value.ConsecutivoFactura,
        OrdenCompra : this.FormMateriaPrimaFactura.value.OrdenCompra,
        MpFactura: this.FormMateriaPrimaFactura.value.MpFactura,
        MpRemision : this.FormMateriaPrimaFactura.value.MpRemision,
        //MpingresoFecha: this.today,
        proveedor :this.FormMateriaPrimaFactura.value.proveedor,
        proveedorNombre:datos_proveedores.prov_Nombre,
        MpObservacion: this.FormMateriaPrimaFactura.value.MpObservacion,
      });
      if (this.FormMateriaPrimaFactura.value.proveedorNombre != '') this.validarInputProveedor = false;
      else this.validarInputProveedor = true;
    });
  }

  //Funcion que buscará y almacenará todos los estados existententes para documentos
  obtenerEstados(){
    this.tipoEstadoService.srvObtenerListaPorId(1).subscribe(datos_tipoEstados => {
      this.estadoService.srvObtenerListaEstados().subscribe(datos_estados => {
        for (let index = 0; index < datos_estados.length; index++) {
          if (datos_estados[index].tpEstado_Id == datos_tipoEstados.tpEstado_Id) {
            this.estado.push(datos_estados[index].estado_Nombre);
          }
        }
      });
    });
  }

  //Funcion que se encagará de obtener los procesos de la empresa
  obtenerProcesos(){
    this.procesosService.srvObtenerLista().subscribe(datos_procesos => {
      for (let index = 0; index < datos_procesos.length; index++) {
        this.procesos.push(datos_procesos[index]);
      }
    });
  }

  // Funcion que se encargará de obtener todas las areas de la empresa exceptuando ()
  obtenerAreas(){
    this.areas = [];
    let usuarioSeleccionado : string = this.FormMateriaPrimaRetiro.value.UsuarioRetiro;
    this.usuarioService.srvObtenerListaUsuario().subscribe(datos_usuarios => {
      for (let index = 0; index < datos_usuarios.length; index++) {
        if (datos_usuarios[index].usua_Nombre == usuarioSeleccionado) {
          this.areasService.srvObtenerListaPorId(datos_usuarios[index].area_Id).subscribe(datos_areas => {
            this.areas.push(datos_areas);
          });
        }
      }
    });
  }

  obtenerUltimoIdFacturaCompra(){
    let idsFactura = [];
    let idUltimaFactura : number;
    this.facturaMpComService.srvObtenerLista().subscribe(datos_facturas => {
      for (let index = 0; index < datos_facturas.length; index++) {
        idsFactura.push(datos_facturas[index].facco_Id);
      }
      this.ultimoIdFactura = Math.max.apply(null, idsFactura);
      this.ultimoIdFactura = this.ultimoIdFactura + 1;
      this.FormMateriaPrimaFactura.setValue({
        ConsecutivoFactura : this.ultimoIdFactura,
        OrdenCompra : '',
        MpFactura: '',
        MpRemision : '',
        //MpingresoFecha: this.today,
        proveedor: '',
        proveedorNombre: '',
        MpObservacion : '',
      });
    });
  }

  validarFacRem(){
    if (this.FormMateriaPrimaFactura.value.MpRemision != '' && this.FormMateriaPrimaFactura.value.MpFactura == '') this.validarCamposFacRem = 1;
    else if (this.FormMateriaPrimaFactura.value.MpRemision == '' && this.FormMateriaPrimaFactura.value.MpFactura != '') this.validarCamposFacRem = 2;
  }

  validarCampos(){
    if (this.FormMateriaPrimaFactura.value.MpRemision == '' && this.FormMateriaPrimaFactura.value.MpFactura == '') Swal.fire("Los campos 'N° Factura' y 'N° Remisión' no pueden tener información al mismo tiempo, por favor llenar solo uno de estos.");
    else if (this.FormMateriaPrimaFactura.value.MpRemision != '' && this.FormMateriaPrimaFactura.value.MpFactura == '') this.registrarRemisionMP();
    else if (this.FormMateriaPrimaFactura.value.MpRemision == '' && this.FormMateriaPrimaFactura.value.MpFactura != '') this.registrarFacturaMP();
  }

  //Funcion que registrará y guardará en la base de datos la infomacion de la materia prima entrante
  registrarFacturaMP(){
    let consecutivoFactura : string = this.FormMateriaPrimaFactura.value.MpFactura;
    let idProveedor : number = this.FormMateriaPrimaFactura.value.proveedor;
    let observacionFactura : string = this.FormMateriaPrimaFactura.value.MpObservacion;
    let idUsuario : number = this.storage_Id;

    const datosFactura : any = {
      Facco_Codigo : consecutivoFactura,
      Facco_FechaFactura : this.today,
      Facco_FechaVencimiento : this.today,
      Prov_Id : idProveedor,
      Facco_ValorTotal : this.valorTotal,
      Facco_Observacion : observacionFactura,
      Estado_Id : 13,
      Usua_Id : idUsuario,
      TpDoc_Id : 'FCO',
    }
    this.facturaMpComService.srvGuardar(datosFactura).subscribe(datos_facturaCreada => {
      this.obtenerUltimoIdFactura();
    });
  }

  // Funcion que se encargará de obtener el ultimo Id de las facturas
  obtenerUltimoIdFactura(){
    let idsFactura = [];
    this.facturaMpComService.srvObtenerLista().subscribe(datos_facturas => {
      for (let index = 0; index < datos_facturas.length; index++) {
        idsFactura.push(datos_facturas[index].facco_Id);
      }
      this.ultimoIdFactura = Math.max.apply(null, idsFactura);
      this.creacionFacturaMateriaPrima(this.ultimoIdFactura);
    });
  }

  //Funcion que colocará el nombre a las columnas de la tabla en la cual se muestran los productos pedidos por los clientes
  ColumnasTabla(){
    this.titulosTabla = [];
    this.titulosTabla = [{
      mpId : "Id",
      mpNombre : "Nombre",
      mpCantidad : "Cantidad",
      mpUndMedCant : "Und. Cant",
      mpPrecioU : "Precio U",
      mpSubTotal : "SubTotal",
    }]
  }

  //
  validarCamposVaciosMP(){
    if (this.FormMateriaPrima.valid) this.cargarFormMpEnTablas(this.ArrayMateriaPrima)
    else Swal.fire("Hay campos de la Materi Prima vacios")
  }

  //Funcion que envia la informacion de los productos a la tabla.
  cargarFormMpEnTablas(formulario : any){
    let idMateriaPrima : number = this.FormMateriaPrima.value.MpId;
    this.nombreMateriaPrima = this.FormMateriaPrima.value.MpNombre;
    let precioMateriaPrima : number = this.FormMateriaPrima.value.MpPrecio;
    let presentacion : string = this.FormMateriaPrima.value.MpUnidadMedida;
    let cantidad : number = this.FormMateriaPrima.value.MpCantidad;
    let subtotalProd : number = precioMateriaPrima * cantidad;
    let IdTintaReal : number = 2001;
    let IdMatPrimaReal : number = 84;

    this.valorTotal = this.valorTotal + subtotalProd;
    this.formatonumeros(this.valorTotal);

    if (idMateriaPrima > 2000) IdTintaReal = idMateriaPrima;
    else IdMatPrimaReal = idMateriaPrima;

    let productoExt : any = {
      Id : idMateriaPrima,
      Nombre : this.nombreMateriaPrima,
      Cant : cantidad,
      UndCant : presentacion,
      PrecioUnd : precioMateriaPrima,
      SubTotal : subtotalProd,
      MatPrima : IdMatPrimaReal,
      Tinta : IdTintaReal
    }

    this.FormMateriaPrimaFactura.setValue({
      ConsecutivoFactura : this.FormMateriaPrimaFactura.value.ConsecutivoFactura,
      OrdenCompra :  this.FormMateriaPrimaFactura.value.OrdenCompra,
      MpFactura: this.FormMateriaPrimaFactura.value.MpFactura,
      MpRemision : this.FormMateriaPrimaFactura.value.MpRemision,
      //MpingresoFecha: this.today,
      proveedor :this.FormMateriaPrimaFactura.value.proveedor,
      proveedorNombre:this.FormMateriaPrimaFactura.value.proveedorNombre,
      MpObservacion: this.FormMateriaPrimaFactura.value.MpObservacion,
    });

    if (this.AccionBoton == "Agregar" && this.ArrayMateriaPrima.length == 0) this.ArrayMateriaPrima.push(productoExt);
    else if (this.AccionBoton == "Agregar" && this.ArrayMateriaPrima.length != 0) this.ArrayMateriaPrima.push(productoExt);
    else {
      for (let index = 0; index < formulario.length; index++) {
        if(productoExt.Id == this.ArrayMateriaPrima[index].Id) {
          this.ArrayMateriaPrima.splice(index, 1);
          this.AccionBoton = "Agregar";
          this.ArrayMateriaPrima.push(productoExt);
          break;
        }
      }
    }
    this.ArrayMateriaPrima.sort((a,b)=> Number(a.PrecioUnd) - Number(b.PrecioUnd));
    this.limpiarCamposMP();
  }

  //Funcion que creará el registro de la materia que viene en un pedido
  creacionFacturaMateriaPrima(idFactura : number){
    let idMateriaPrima : number;
    let cantidadMateriaPrima : number;
    let presentacionMateriaPrima : string;
    let valorUnitarioMp : number;
    let idTinta : number;

    if (this.ArrayMateriaPrima.length == 0) Swal.fire("Debe cargar minimo una materia prima en la tabla")
    else {
      for (let index = 0; index < this.ArrayMateriaPrima.length; index++) {
        idMateriaPrima = this.ArrayMateriaPrima[index].MatPrima;
        idTinta = this.ArrayMateriaPrima[index].Tinta;
        cantidadMateriaPrima = this.ArrayMateriaPrima[index].Cant;
        presentacionMateriaPrima = this.ArrayMateriaPrima[index].UndCant;
        valorUnitarioMp = this.ArrayMateriaPrima[index].PrecioUnd;

        const datosFacturaMp : any = {
          Facco_Id : idFactura,
          MatPri_Id : idMateriaPrima,
          Tinta_Id : idTinta,
          FaccoMatPri_Cantidad : cantidadMateriaPrima,
          UndMed_Id : presentacionMateriaPrima,
          FaccoMatPri_ValorUnitario : valorUnitarioMp,
        }
        this.facturaMpService.srvGuardar(datosFacturaMp).subscribe(datos_facturaMpCreada => {
        });
        this.cargarRemisionEnFactura(idFactura);
        this.moverInventarioMP();
        this.moverInventarioTintas();
      }
    }
  }

  cargarRemisionEnFactura(idFactura : number){
    for (const rem of this.ArrayRemisiones) {
      const datosFacRem : any = {
        Rem_Id : rem.remisionId,
        Facco_Id : idFactura,
      }
      this.remisionFacturaService.srvGuardar(datosFacRem).subscribe(datosFacRemision => { });
    }
  }

  /**  */
  obtenerUltimoIdRemisionCompra(){
    let idsRemision = [];
    this.remisionService.srvObtenerLista().subscribe(datos_remision => {
      for (let index = 0; index < datos_remision.length; index++) {
        idsRemision.push(datos_remision[index].rem_Id);
      }
      this.ultimoIdRemision = Math.max.apply(null, idsRemision);
      this.ultimoIdRemision = this.ultimoIdRemision + 1;
      this.FormMateriaPrimaFactura.setValue({
        MpFactura: '',
        OrdenCompra : '',
        MpRemision : '',
        //MpingresoFecha: this.today,
        proveedor: '',
        proveedorNombre: '',
        MpObservacion : '',
      });
    });
  }

  //Funcion que registrará y guardará en la base de datos la infomacion de la materia prima entrante en una remisión.
  registrarRemisionMP(){
    let consecutivoRemision : string = this.FormMateriaPrimaFactura.value.MpRemision;
    let idProveedor : number = this.FormMateriaPrimaFactura.value.proveedor;
    let observacionRemision : string = this.FormMateriaPrimaFactura.value.MpObservacion;
    let idUsuario : number = this.storage_Id;

    const datosRemision : any = {
      Rem_Codigo : consecutivoRemision,
      Rem_Fecha : this.today,
      Rem_PrecioEstimado : this.valorTotal,
      Prov_Id : idProveedor,
      Estado_Id : 12,
      Usua_Id : idUsuario,
      TpDoc_Id : 'REM',
      Rem_Observacion : observacionRemision,
    }
    this.remisionService.srvGuardar(datosRemision).subscribe(datos_remisionCreada => {
      this.obtenerUltimoIdRemision();
    });
  }

  // Funcion que se encargará de obtener el ultimo Id de las facturas
  obtenerUltimoIdRemision(){
    let idsRemision = [];
    this.remisionService.srvObtenerLista().subscribe(datos_remision => {
      for (let index = 0; index < datos_remision.length; index++) {
        idsRemision.push(datos_remision[index].rem_Id);
      }
      this.ultimoIdRemision = Math.max.apply(null, idsRemision);
      this.creacionRemisionMateriaPrima(this.ultimoIdRemision);
    });
  }

  //Funcion que creará el registro de la materia que viene en un pedido
  creacionRemisionMateriaPrima(idRemision : number){
    let idMateriaPrima : number;
    let cantidadMateriaPrima : number;
    let presentacionMateriaPrima : string;
    let valorUnitarioMp : number;
    let idTinta : number;

    if (this.ArrayMateriaPrima.length == 0) Swal.fire("Debe cargar minimo una materia prima en la tabla")
    else {
      for (let index = 0; index < this.ArrayMateriaPrima.length; index++) {
        idMateriaPrima = this.ArrayMateriaPrima[index].MatPrima;
        idTinta = this.ArrayMateriaPrima[index].Tinta;
        cantidadMateriaPrima = this.ArrayMateriaPrima[index].Cant;
        presentacionMateriaPrima = this.ArrayMateriaPrima[index].UndCant;
        valorUnitarioMp = this.ArrayMateriaPrima[index].PrecioUnd;

        const datosRemisionMp : any = {
          Rem_Id : idRemision,
          MatPri_Id : idMateriaPrima,
          Tinta_Id : idTinta,
          RemiMatPri_Cantidad : cantidadMateriaPrima,
          UndMed_Id : presentacionMateriaPrima,
          RemiMatPri_ValorUnitario : valorUnitarioMp,
        }
        this.remisionMPService.srvGuardar(datosRemisionMp).subscribe(datos_remisionMpCreada => {
        });
        this.moverInventarioMP();
        this.moverInventarioTintas();
      }
    }
  }

  //Funcion que moverá el inventario de materia prima con base a la materia prima entrante
  moverInventarioMpAgregada(){
    let stockMateriaPrimaInicial : number;
    let stockMateriaPrimaFinal : number;

    for (let index = 0; index < this.ArrayMateriaPrima.length; index++) {

      this.materiaPrimaService.srvObtenerListaPorId(this.ArrayMateriaPrima[index].Id).subscribe(datos_materiaPrima => {
        stockMateriaPrimaInicial = datos_materiaPrima.matPri_Stock;
        stockMateriaPrimaFinal = stockMateriaPrimaInicial + this.ArrayMateriaPrima[index].Cant;
        const datosMP : any = {
          MatPri_Id : this.ArrayMateriaPrima[index].Id,
          MatPri_Nombre : datos_materiaPrima.matPri_Nombre,
          MatPri_Descripcion : datos_materiaPrima.matPri_Descripcion,
          MatPri_Stock : stockMateriaPrimaFinal,
          UndMed_Id : datos_materiaPrima.undMed_Id,
          CatMP_Id : datos_materiaPrima.catMP_Id,
          MatPri_Precio : datos_materiaPrima.matPri_Precio,
          TpBod_Id : datos_materiaPrima.tpBod_Id,
        }
        this.materiaPrimaService.srvActualizar(this.ArrayMateriaPrima[index].Id, datosMP).subscribe(datos_mp_creada => {
          const Toast = Swal.mixin({
            toast: true,
            position: 'center',
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.addEventListener('mouseenter', Swal.stopTimer)
              toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
          });
          Toast.fire({
            icon: 'success',
            title: '¡Registro de factura creado con exito!'
          });
          this.limpiarTodosCampos();
        });
      });
    }
  }


  moverInventarioMP(){
    let stockMateriaPrimaInicial : number;
    let stockMateriaPrimaFinal : number;

    for (let index = 0; index < this.ArrayMateriaPrima.length; index++) {
      this.materiaPrimaService.srvObtenerListaPorId(this.ArrayMateriaPrima[index].MatPrima).subscribe(datos_materiaPrima => {
        stockMateriaPrimaInicial = datos_materiaPrima.matPri_Stock;

        if(this.ArrayMateriaPrima[index].Materia_Prima == 51) stockMateriaPrimaFinal = 0
        else stockMateriaPrimaFinal = stockMateriaPrimaInicial + this.ArrayMateriaPrima[index].Cant;

        const datosMPActualizada : any = {
          MatPri_Id : this.ArrayMateriaPrima[index].MatPrima,
          MatPri_Nombre : datos_materiaPrima.matPri_Nombre,
          MatPri_Descripcion : datos_materiaPrima.matPri_Descripcion,
          MatPri_Stock : stockMateriaPrimaFinal,
          UndMed_Id : datos_materiaPrima.undMed_Id,
          CatMP_Id : datos_materiaPrima.catMP_Id,
          MatPri_Precio : datos_materiaPrima.matPri_Precio,
          TpBod_Id : datos_materiaPrima.tpBod_Id,
        }

        this.materiaPrimaService.srvActualizar(this.ArrayMateriaPrima[index].MatPrima, datosMPActualizada).subscribe(datos_mp_creada => {
        }, error => {
          const Toast = Swal.mixin({
            toast: true,
            position: 'center',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.addEventListener('mouseenter', Swal.stopTimer)
              toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
          });
          Toast.fire({
            icon: 'error',
            title: '¡No restó al inventario de materias primas!'
          });
        });
      }, error => { const Toast = Swal.mixin({
        toast: true,
        position: 'center',
        showConfirmButton: false,
        timer: 1200,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
      });
      Toast.fire({
        icon: 'error',
        title: 'Materia prima no encontrada!'
      });
    });
    }
  }

  //Función que restará a las tintas de categoria diferente a TINTAS TIPO COLORES.
  moverInventarioTintas(){
    let stockMateriaPrimaFinal : number;
    for (let index = 0; index < this.ArrayMateriaPrima.length; index++) {
      this.tintasService.srvObtenerListaPorId(this.ArrayMateriaPrima[index].Tinta).subscribe(datos_tinta => {
        if (this.ArrayMateriaPrima[index].Tinta == 2582) stockMateriaPrimaFinal = 0
        else stockMateriaPrimaFinal = datos_tinta.tinta_Stock + this.ArrayMateriaPrima[index].Cant;
        const datosTintaActualizada : any = {
          Tinta_Id : this.ArrayMateriaPrima[index].Tinta,
          Tinta_Nombre : datos_tinta.tinta_Nombre,
          Tinta_Descripcion : datos_tinta.tinta_Descripcion,
          Tinta_Stock : stockMateriaPrimaFinal,
          Tinta_CodigoHexadecimal : datos_tinta.tinta_CodigoHexadecimal,
          UndMed_Id : datos_tinta.undMed_Id,
          CatMP_Id : datos_tinta.catMP_Id,
          Tinta_Precio : datos_tinta.tinta_Precio,
          TpBod_Id : datos_tinta.tpBod_Id,
          tinta_InvInicial : datos_tinta.tinta_InvInicial,
        }

        this.tintasService.srvActualizar(this.ArrayMateriaPrima[index].Tinta, datosTintaActualizada).subscribe(datos_mp_creada => {
          const Toast = Swal.mixin({
            toast: true,
            position: 'center',
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.addEventListener('mouseenter', Swal.stopTimer)
              toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
          });
          Toast.fire({
            icon: 'success',
            title: '¡Registro de factura/Remisión creado con exito!'
          });
          this.limpiarTodosCampos();
        }, error => {
          const Toast = Swal.mixin({
            toast: true,
            position: 'center',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.addEventListener('mouseenter', Swal.stopTimer)
              toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
          });
          Toast.fire({
            icon: 'error',
            title: '¡No sumó al inventario de tintas!'
          });
        });
      }, error => { const Toast = Swal.mixin({
        toast: true,
        position: 'center',
        showConfirmButton: false,
        timer: 1200,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
      });
      Toast.fire({
        icon: 'error',
        title: '¡Tinta no encontrada!'
      });
    });
    }
  }


  limpiarTodosCampos(){
    this.FormMateriaPrimaFactura.setValue({
      ConsecutivoFactura : this.ultimoIdFactura,
      OrdenCompra : '',
      MpFactura: '',
      MpRemision : '',
      //MpingresoFecha: this.today,
      proveedor: '',
      proveedorNombre: '',
      MpObservacion : '',
    });
    this.FormMateriaPrima.reset();
    this.FormRemisiones.reset();
    this.ArrayMateriaPrima = [];
    this.ArrayRemisiones = [];
    this.valorTotalRem = 0;
    this.valorTotal = 0;
    this.obtenerUltimoIdFacturaCompra();
  }

  // Función para quitar un producto de la tabla
  QuitarProductoTabla(index : number, formulario : any) {
    Swal.fire({
      title: '¿Estás seguro de eliminar la Materia Prima de la Factura/Remisión?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.ArrayMateriaPrima.splice(index, 1);
        Swal.fire('Materia Prima eliminada');
      }
    });
  }

  // Función para editar uno de los productos de la tabla
  EditarProductoTabla(formulario : any) {
    this.AccionBoton = "Editar";
    this.FormMateriaPrima.patchValue({
      MpId : formulario.Id,
      MpNombre: formulario.Nombre,
      MpCantidad: formulario.Cant,
      MpPrecio: formulario.PrecioUnd,
      MpUnidadMedida:formulario.UndCant,
    });
  }

  //Funcion que consultara una materia prima con base a la que está seleccionada en la vista
  buscarMpSeleccionada(item){
    this.FormMateriaPrima.value.MpNombre = item.matPri_Nombre;
    let nombreMateriaPrima : string = this.FormMateriaPrima.value.MpNombre;
    let idMateriaPrima : number; //En el HTML se pasará el nombre de la materia prima pero el input tendrá como valor el Id de la materia prima
    this.materiaPrimaSeleccionada = [];

    this.materiaPrimaService.srvObtenerLista().subscribe(datos_materiasPrimas => {
      for (let index = 0; index < datos_materiasPrimas.length; index++) {
        if (datos_materiasPrimas[index].matPri_Nombre == nombreMateriaPrima) {
          this.categoriMpService.srvObtenerListaPorId(datos_materiasPrimas[index].catMP_Id).subscribe(datos_categoria => {
            this.tipoBodegaService.srvObtenerListaPorId(datos_materiasPrimas[index].tpBod_Id).subscribe(datos_bodega => {
              this.materiaPrimaSeleccionada.push(datos_materiasPrimas[index]);
              this.categoriaMPSeleccionada = datos_categoria.catMP_Nombre;
              this.tipoBodegaMPSeleccionada = datos_bodega.tpBod_Nombre;
              this.cargarInfoMP();
            });
          });
        }
      }
    });
  }

  //Funcion que llenará la infomacion de materia prima buscada o seleccionada y pasará la informacion a la vista
  cargarInfoMP(){
    for (const Mp of this.materiaPrimaSeleccionada) {
      this.FormMateriaPrima.setValue({
        MpId : Mp.matPri_Id,
        MpNombre: Mp.matPri_Nombre,
        MpCantidad: '',
        MpPrecio: Mp.matPri_Precio,
        MpUnidadMedida : Mp.undMed_Id,
      });
      if (this.FormMateriaPrima.value.MpNombre != '') this.validarInputMP = false;
      else this.validarInputMP = true;
    }
  }

  //Funcion que consultara una materia prima con base a un ID pasado en la vista
  buscarMpIdRetirada(){
    let idMateriaPrima : number = this.FormMateriaPrimaRetirada.value.MpIdRetirada;
    this.materiaPrimaSeleccionada = [];
    this.categoriaMPBuscadaID = '';
    this.tipobodegaMPBuscadaId = '';

    this.materiaPrimaService.srvObtenerListaPorId(idMateriaPrima).subscribe(datos_materiaPrima => {
      this.categoriMpService.srvObtenerListaPorId(datos_materiaPrima.catMP_Id).subscribe(datos_categoria => {
        this.tipoBodegaService.srvObtenerListaPorId(datos_materiaPrima.tpBod_Id).subscribe(datos_bodega => {
          this.materiaPrimaSeleccionada.push(datos_materiaPrima);
          this.materiasPrimas.push(datos_materiaPrima);
          this.categoriaMPBuscadaID = datos_categoria.catMP_Nombre;
          this.tipobodegaMPBuscadaId = datos_bodega.tpBod_Nombre;
          this.cargarInfoMPRetirada();
        });
      });
    });
  }

  //Funcion que consultara una materia prima con base a la que está seleccionada en la vista
  buscarMpSeleccionadaRetirada(){
    let nombreMateriaPrima : string = this.FormMateriaPrimaRetirada.value.MpNombreRetirada;
    this.materiaPrimaSeleccionada = [];

    this.materiaPrimaService.srvObtenerLista().subscribe(datos_materiasPrimas => {
      for (let index = 0; index < datos_materiasPrimas.length; index++) {
        if (datos_materiasPrimas[index].matPri_Nombre == nombreMateriaPrima) {
          this.categoriMpService.srvObtenerListaPorId(datos_materiasPrimas[index].catMP_Id).subscribe(datos_categoria => {
            this.tipoBodegaService.srvObtenerListaPorId(datos_materiasPrimas[index].tpBod_Id).subscribe(datos_bodega => {
              this.materiaPrimaSeleccionada.push(datos_materiasPrimas[index]);
              this.categoriaMPSeleccionada = datos_categoria.catMP_Nombre;
              this.tipoBodegaMPSeleccionada = datos_bodega.tpBod_Nombre;
              this.cargarInfoMPRetirada();
            });
          });
        }
      }
    });
  }

  //Funcion que llenará la infomacion de materia prima buscada o seleccionada y pasará la informacion a la vista
  cargarInfoMPRetirada(){
    for (const Mp of this.materiaPrimaSeleccionada) {
      this.FormMateriaPrimaRetirada.setValue({
        MpIdRetirada : Mp.matPri_Id,
        MpNombreRetirada: Mp.matPri_Nombre,
        MpCantidadRetirada: this.FormMateriaPrima.value.MpCantidad,
        MpPrecioRetirada: Mp.matPri_Precio,
        MpUnidadMedidaRetirada : Mp.undMed_Id,
        MpStockRetirada : Mp.matPri_Stock,
      });
    }
  }

  //Consultar Remisiones por Codigo
  consultarIdRemisiones(){
    let idRemision : number = this.FormRemisiones.value.idRemision;
    this.remision = [];
    this.remConFac = [];
    this.load = false;

    this.remisionService.srvObtenerLista().subscribe(datos_remision => {
      for (let index = 0; index < datos_remision.length; index++) {
        if (idRemision == datos_remision[index].rem_Codigo) this.remision.push(datos_remision[index].rem_Id);
      }
    });
    // Llenado de Array con Remisiones con Facturas
    this.remisionFacturaService.srvObtenerLista().subscribe(datos_remisionesFacturas => {
      for (let i = 0; i < datos_remisionesFacturas.length; i++) {
        this.remConFac.push(datos_remisionesFacturas[i].rem_Id);
      }
    });
    // Se esperan unos segundos a que termine el llenado
    setTimeout(() => {
      for (let m = 0; m < this.remConFac.length; m++) {
        for (let l = 0; l < this.remision.length; l++) {
          if (this.remConFac.includes(this.remision[l])) {
            if (this.remision[l] == this.remConFac[m]) this.remision = [];
          }
        }
      }
      if (this.remision.length == 0) Swal.fire(`La remision con el código ${idRemision} ya tiene una factura asignada`)
      else {
        // Recorre el Array de Remisiones y busca cada id para mostrarlo en la tabla
        for (let k = 0; k < this.remision.length; k++) {
          this.remisionService.srvObtenerListaPorId(this.remision[k]).subscribe(datos_remision => {
            this.proveedorservices.srvObtenerListaPorId(datos_remision.prov_Id).subscribe(datos_proveedor => {
              this.usuarioService.srvObtenerListaPorId(datos_remision.usua_Id).subscribe(datos_usuario => {
                this.tipoDocumentoService.srvObtenerListaPorId(datos_remision.tpDoc_Id).subscribe(datos_tipoDocumento => {
                  let datosTablaRemisiones : any = {
                  remisionId : datos_remision.rem_Id,
                  remisionCodigo : datos_remision.rem_Codigo,
                  remisionFecha : datos_remision.rem_Fecha,
                  remisionProveedor : datos_proveedor.prov_Nombre,
                  remisionUsuario :  datos_usuario.usua_Nombre,
                  remisionDocumento : datos_tipoDocumento.tpDoc_Nombre,
                  remisionPrecio : datos_remision.rem_PrecioEstimado
                }
                  this.precioRemision = datosTablaRemisiones.remisionPrecio
                  this.ArrayRemisiones.push(datosTablaRemisiones);
                });
              });
            });
          });
        }
      }
      this.load = true;
    }, 2000);
  }

  ColumnasTablaRemisiones(){
    this.titulosTablaRemisiones = [{
      remId : "Id",
      remCodigo : "Codigo",
      remFecha : "Fecha",
      remProveedor : "Proveedor",
      remUsuario : "Usuario",
      remTipoDoc : "Tipo Doc.",
      remPrecio : "Valor"
    }]
  }

  llenarDocumento(formulario : any){
    let id : any = formulario.remisionId;
    this.mpAgregada = [];
    this.remisionMPService.srvObtenerLista().subscribe(datos_remisionMP => {
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
    this.cargarPDF(formulario);
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

  cargarPDF(formulario : any){
    let id : any = formulario.remisionId;
    this.remisionService.srvObtenerListaPorId(id).subscribe(datos_remision => {
      this.remisionMPService.srvObtenerLista().subscribe(datos_remisionMP => {
        for (let index = 0; index < datos_remisionMP.length; index++) {
          if (datos_remisionMP[index].rem_Id == id) {
            this.usuarioService.srvObtenerListaPorId(datos_remision.usua_Id).subscribe(datos_usuario => {
              this.proveedorservices.srvObtenerListaPorId(datos_remision.prov_Id).subscribe(datos_proveedor => {
                this.materiaPrimaService.srvObtenerListaPorId(datos_remisionMP[index].matPri_Id).subscribe(datos_materiPrima => {
                  for (let mp = 0; mp < this.mpAgregada.length; mp++) {
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
                          text: `Fecha de registro: ${datos_remision.rem_Fecha.replace('T00:00:00', '')}`,
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
  }

  cargarInfoOrdenCompraEnTabla() {
    this.arrayOrdenCompra = [];
    let facturas : any = [];
    let arrayOC : any = [];
    let Orden_Compra : any = this.FormMateriaPrimaFactura.value.OrdenCompra;
    let matPrimaFacco : number;
    let MPReal : any;
    let MPNombreReal : any;
    let MPNoAplica1 : any;
    let MPNombreNA1 : any ;
    let MPNoAplica2 : any;
    let MPNombreNA2 : any;

    if (Orden_Compra != null) {
      this.servicioOCMatPrima.getListaFacturasxOC(Orden_Compra).subscribe(dataFacturas => {
        if(dataFacturas.length > 0) {
           for (let i = 0; i < dataFacturas.length; i++) {
            //facturas.push(dataFacturas[i].facco_Id);
            this.facturaMpService.srvObtenerListaPorFacId(dataFacturas[i].facco_Id).subscribe(dataFacComprasMP => {
              for (let fcmp = 0; fcmp < dataFacComprasMP.length; fcmp++) {

                if(dataFacComprasMP[fcmp].matPri_Id == 84) matPrimaFacco = dataFacComprasMP[fcmp].tinta_Id;
                else if (dataFacComprasMP[fcmp].tinta_Id == 2001) matPrimaFacco = dataFacComprasMP[fcmp].matPri_Id;

                let info : any = {
                  MatPrima : matPrimaFacco,
                  CantidadPedida : dataFacComprasMP[fcmp].faccoMatPri_Cantidad,
                  Unidad : dataFacComprasMP[fcmp].undMed_Id,
                }

              }
            })
           }
        }
      });
      //console.log(`facturas: ${facturas}`);

      this.servicioOCMatPrima.getListaOrdenesComprasxId(Orden_Compra).subscribe(dataOrdenCompra => {
        if(dataOrdenCompra.length == 0) this.modalInfoNoEncontrada();
        else {
          for (let index = 0; index < dataOrdenCompra.length; index++) {

            if (dataOrdenCompra[index].tinta_Id == 2001 && dataOrdenCompra[index].bopP_Id == 1)
            {
              MPReal = dataOrdenCompra[index].matPri_Id;
              MPNombreReal = dataOrdenCompra[index].matPri_Nombre;
              MPNoAplica1 = dataOrdenCompra[index].tinta_Id;
              MPNombreNA1 = dataOrdenCompra[index].tinta_Nombre;
              MPNoAplica2 = dataOrdenCompra[index].bopP_Id;
              MPNombreNA2 = dataOrdenCompra[index].boppGen_Nombre;
            }
            else if (dataOrdenCompra[index].tinta_Id == 2001 && dataOrdenCompra[index].matPri_Id == 84)
            {
              MPReal = dataOrdenCompra[index].bopP_Id;
              MPNombreReal = dataOrdenCompra[index].boppGen_Nombre;
              MPNoAplica1 = dataOrdenCompra[index].tinta_Id;
              MPNombreNA1 = dataOrdenCompra[index].tinta_Nombre;
              MPNoAplica2 =  dataOrdenCompra[index].matPri_Id;
              MPNombreNA2 =  dataOrdenCompra[index].matPri_Id;
            }
            else if (dataOrdenCompra[index].matPri_Id == 84 && dataOrdenCompra[index].bopP_Id == 1)
            {
              MPReal = dataOrdenCompra[index].tinta_Id;
              MPNombreReal = dataOrdenCompra[index].tinta_Nombre;
              MPNoAplica1 = dataOrdenCompra[index].matPri_Id;
              MPNombreNA1 = dataOrdenCompra[index].matPri_Nombre;
              MPNoAplica2 = dataOrdenCompra[index].bopP_Id;
              MPNombreNA2 = dataOrdenCompra[index].boppGen_Nombre
            }

            const InfoOcMatPrima : any = {
                  MatPrima1 : MPReal,
                  Nombre : MPNombreReal,
                  Cantidad : dataOrdenCompra[index].doc_CantidadPedida,
                  Presentacion : dataOrdenCompra[index].undMed_Id,
                  MatPrima2 : MPNoAplica1,
                  MatPrima3 : MPNoAplica2,
            }
              this.arrayOrdenCompra.push(InfoOcMatPrima);
              console.log(arrayOC);
          }
        }
      });
    } else Swal.fire('Debe llenar el campo Nro. Orden Compra');
  }

  modalInfoNoEncontrada() {
    Swal.fire('No se encontró la Orden de Compra solicitada');
  }

  ingresarTodo_OrdenCompra(item : any) {

  }

  ingresoxItem_OrdenCompra(){

  }

  quitarTodosLosItems_Factura() {

  }

  quitarItem_Factura(){

  }



}
