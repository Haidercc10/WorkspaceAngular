import { Component, OnInit,Inject } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import Swal from 'sweetalert2';
import { RolesService } from 'src/app/Servicios/roles.service';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { MateriaPrimaService } from 'src/app/Servicios/materiaPrima.service';
import { ProveedorService } from 'src/app/Servicios/proveedor.service';
import { Observable } from 'rxjs/internal/Observable';
import {map, startWith} from 'rxjs/operators';
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
import { AsignacionMPService } from 'src/app/Servicios/asignacionMP.service';
import { AreaService } from 'src/app/Servicios/area.service';
import { DetallesAsignacionService } from 'src/app/Servicios/detallesAsignacion.service';
import moment from 'moment';
import * as XLSX from 'xlsx';
import { BagproService } from 'src/app/Servicios/Bagpro.service';
import { TipoDocumentoService } from 'src/app/Servicios/tipoDocumento.service';
import { RemisionService } from 'src/app/Servicios/Remision.service';
import { RemisionesMPService } from 'src/app/Servicios/remisionesMP.service';
import pdfMake from 'pdfmake/build/pdfmake';
import { RemisionFacturaService } from 'src/app/Servicios/remisionFactura.service';

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

  public load: boolean;

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
                                                private asignacionMPService : AsignacionMPService,
                                                  private detallesAsignacionService : DetallesAsignacionService,
                                                    private bagProServices : BagproService,
                                                      private tipoDocumentoService : TipoDocumentoService,
                                                        private remisionService : RemisionService,
                                                          private remisionMPService : RemisionesMPService,
                                                            private remisionFacturaService : RemisionFacturaService) {

    this.FormMateriaPrimaFactura = this.frmBuilderMateriaPrima.group({
      //MateriaPrima
      ConsecutivoFactura : new FormControl(),
      MpFactura: new FormControl(),
      MpRemision : new FormControl(),
      MpingresoFecha: new FormControl(),
      proveedor: new FormControl(),
      proveedorNombre: new FormControl(),
      // tipoDocumento: new FormControl(),
      // MpEstados:new FormControl(),
      // MpOperario:new FormControl(),
      MpObservacion : new FormControl(),
    });

    this.FormMateriaPrima = this.frmBuilderMateriaPrima.group({
      MpId : new FormControl(),
      MpNombre: new FormControl(),
      MpCantidad: new FormControl(),
      MpPrecio: new FormControl(),
      MpUnidadMedida:new FormControl(),
    });

    this.FormRemisiones = this.frmBuilderMateriaPrima.group({
      idRemision : new FormControl(),
    });

    this.FormMateriaPrimaRetiro = this.frmBuilderMateriaPrima.group({
      OTRetiro : new FormControl(),
      FechaRetiro : new FormControl(),
      UsuarioRetiro : new FormControl(),
      AreaRetiro : new FormControl(),
      EstadoRetiro : new FormControl(),
      ObservacionRetiro : new FormControl(),
      ProcesoRetiro : new FormControl(),
    });

    this.FormMateriaPrimaRetirada = this.frmBuilderMateriaPrima.group({
      MpIdRetirada : new FormControl(),
      MpNombreRetirada: new FormControl(),
      MpCantidadRetirada: new FormControl(),
      MpPrecioRetirada: new FormControl(),
      MpUnidadMedidaRetirada:new FormControl(),
      MpStockRetirada : new FormControl(),
    });

    this.load = true;
  }


  ngOnInit(): void {
    this.obtenerUltimoIdFacturaCompra();
    this.initForms();
    this.lecturaStorage();
    this.fecha();
    this.ColumnasTabla();
    this.ColumnasTablaRemisiones();
    this.obtenerUnidadMedida();
    this.obtenerEstados();
    this.obtenerProcesos();
    this.obtenerMateriasPrimasRetiradas();
    this.obtenerProveeedor();
    this.obtenerDocumetno();
    this.obtenerUltimpIDMP();
  }

  initForms() {
    this.FormMateriaPrimaFactura = this.frmBuilderMateriaPrima.group({
      ConsecutivoFactura : ['', Validators.required],
      MpFactura: [Validators.required],
      MpRemision : [Validators.required],
      MpingresoFecha: ['', Validators.required],
      proveedor: ['', Validators.required],
      proveedorNombre: ['', Validators.required],
      // tipoDocumento: ['', Validators.required],
      // MpEstados:['', Validators.required],
      // MpOperario:['', Validators.required],
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
      MpFactura: null,
      MpRemision : null,
      MpingresoFecha: this.today,
      proveedor: '',
      proveedorNombre: '',
      // tipoDocumento: '',
      // MpEstados:'',
      // MpOperario: this.storage_Nombre,
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

  // Funcion que limpia los todos los campos de la vista
  LimpiarCampos() {
    this.FormMateriaPrimaFactura.setValue({
      ConsecutivoFactura : this.ultimoIdFactura,
      MpFactura: null,
      MpRemision : null,
      MpingresoFecha: this.today,
      proveedor: '',
      proveedorNombre: '',
      // tipoDocumento: '',
      // MpEstados:'',
      // MpOperario: this.storage_Nombre,
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

  //Funcion que va a recorrer las materias primas para almacenar el nombre de todas
  obtenerMateriasPrimas(){
    let idProveedor : number = this.FormMateriaPrimaFactura.value.proveedor;
    this.proveedorMPService.srvObtenerLista().subscribe(datos_mpProveedor => {
      for (let index = 0; index < datos_mpProveedor.length; index++) {
        if (datos_mpProveedor[index].prov_Id == idProveedor) {
          this.materiaPrimaService.srvObtenerListaPorId(datos_mpProveedor[index].matPri_Id).subscribe(datos_materiaPrima => {
            this.materiasPrimas.push(datos_materiaPrima);
          });
        }
      }
    });
  }

  //Funcion que va a recorrer las materias primas para almacenar el nombre de todas
  obtenerMateriasPrimasRetiradas(){
    this.materiaPrimaService.srvObtenerLista().subscribe(datos_materiaPrima => {
      for (let index = 0; index < datos_materiaPrima.length; index++) {
        this.materiasPrimasRetiradas.push(datos_materiaPrima[index]);
      }
    });
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
        this.proveedor.push(datos_proveedor[index].prov_Nombre);
      }
    });
  }

  llenarProveedorSeleccionado(){
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
            // tipoDocumento: this.FormMateriaPrimaFactura.value.tipoDocumento,
            // MpEstados: this.FormMateriaPrimaFactura.value.MpEstados,
            // MpOperario: this.FormMateriaPrimaFactura.value.MpOperario,
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
        MpFactura: this.FormMateriaPrimaFactura.value.MpFactura,
        MpRemision : this.FormMateriaPrimaFactura.value.MpRemision,
        MpingresoFecha: this.today,
        proveedor :this.FormMateriaPrimaFactura.value.proveedor,
        proveedorNombre:datos_proveedores.prov_Nombre,
        // tipoDocumento: this.FormMateriaPrimaFactura.value.tipoDocumento,
        // MpEstados: this.FormMateriaPrimaFactura.value.MpEstados,
        // MpOperario: this.FormMateriaPrimaFactura.value.MpOperario,
        MpObservacion: this.FormMateriaPrimaFactura.value.MpObservacion,
      });

    })
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
        MpFactura: '',
        MpRemision : '',
        MpingresoFecha: this.today,
        proveedor: '',
        proveedorNombre: '',
        // tipoDocumento: '',
        // MpEstados:'',
        // MpOperario: this.storage_Nombre,
        MpObservacion : '',
      });
    });
  }

  obtenerUltimpIDMP(){
    let idsMP = [];
    let idUltimaFactura : number;
    this.materiaPrimaService.srvObtenerLista().subscribe(datos_MP => {
      for (let index = 0; index < datos_MP.length; index++) {
        idsMP.push(datos_MP[index].facco_Id);
      }
      this.ultimoIdMateriaPrima = Math.max.apply(null, idsMP);
      this.ultimoIdMateriaPrima = this.ultimoIdFactura + 1;
    });
  }
  //Funacion que crea una materia prima y la guarda en la base de datos
  CreacionMateriaPrima(nombreMateriaPrima : string,
    descripcionMateriaPrima : string,
    stockMateriaPrima : number,
    undMed : string,
    categoriaMateriaPrima : number,
    precioMateriaPrima : number,
    bodega : number,
    proveedor : number){


    const datosMP : any = {
      MatPri_Nombre : nombreMateriaPrima,
      MatPri_Descripcion : descripcionMateriaPrima,
      MatPri_Stock : stockMateriaPrima,
      UndMed_Id : 'Kg',
      CatMP_Id : categoriaMateriaPrima,
      MatPri_Precio : precioMateriaPrima,
      TpBod_Id : 4,
    }

    this.materiaPrimaService.srvGuardar(datosMP).subscribe(datos_mp_creada => {
      this.creacionMpProveedor(this.ultimoIdMateriaPrima, proveedor);
    });

  }

  //Funcion que creará un proveedor y lo guardará en la base de datos
  CreacionProveedor( idProveedor : number,
     TipoIdProveedor : string,
     nombreProveedor : string,
     tipoproveedor : number,
     ciudadProveedor : string,
     telefonoProveedor : string,
     emailProveedor : string){

    const datosProveedor : any = {
      Prov_Id : idProveedor,
      TipoIdentificacion_Id : TipoIdProveedor,
      Prov_Nombre : nombreProveedor,
      TpProv_Id : tipoproveedor,
      Prov_Ciudad : ciudadProveedor,
      Prov_Telefono : telefonoProveedor,
      Prov_Email : emailProveedor,
    }

    this.proveedorservices.srvGuardar(datosProveedor).subscribe(datos_nuevoProveedor => {
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
        title: '¡Proveedor creado con exito!'
      });
    });
  }

  //Funcion qu creará la relacion de materia prima y proveedores
  creacionMpProveedor(idMateriaPrima : number, proveedor : number){
    const datosMpProveedor = {
      Prov_Id : proveedor,
      MatPri_Id : idMateriaPrima,
    }

    this.proveedorMPService.srvGuardar(datosMpProveedor).subscribe(datos_MpProveedorCreado => {
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
        title: '¡Materia Prima creada con exito!'
      });
    });
  }

  validarFacRem(){
    if (this.FormMateriaPrimaFactura.value.MpRemision != '' && this.FormMateriaPrimaFactura.value.MpFactura == '') {
      this.validarCamposFacRem = 1;
    } else if (this.FormMateriaPrimaFactura.value.MpRemision == '' && this.FormMateriaPrimaFactura.value.MpFactura != '') {
      this.validarCamposFacRem = 2;
    }
  }

  validarCampos(){
    if (this.FormMateriaPrimaFactura.value.MpRemision == '' && this.FormMateriaPrimaFactura.value.MpFactura == '') {
      Swal.fire("Los campos 'N° Factura' y 'N° Remisión' no pueden tener información al mismo tiempo, por favor llenar solo uno de estos.");
    } else if (this.FormMateriaPrimaFactura.value.MpRemision != '' && this.FormMateriaPrimaFactura.value.MpFactura == '') {
      this.registrarRemisionMP();
    } else if (this.FormMateriaPrimaFactura.value.MpRemision == '' && this.FormMateriaPrimaFactura.value.MpFactura != '') {
      this.registrarFacturaMP();
    }
  }

  //Funcion que registrará y guardará en la base de datos la infomacion de la materia prima entrante
  registrarFacturaMP(){
    let nombreEstado : string = this.FormMateriaPrimaFactura.value.MpEstados;
    let consecutivoFactura : string = this.FormMateriaPrimaFactura.value.MpFactura;
    // let fechaEntrada : any = this.FormMateriaPrimaFactura.value.MpingresoFecha;
    let idProveedor : number = this.FormMateriaPrimaFactura.value.proveedor;
    let observacionFactura : string = this.FormMateriaPrimaFactura.value.MpObservacion;
    let idEstadoFactura : number;
    let idUsuario : number = this.storage_Id;
    // let tipoDocumento : string = this.FormMateriaPrimaFactura.value.tipoDocumento;

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
    let idUltimaFactura : number;
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

    this.valorTotal = this.valorTotal + subtotalProd;
    this.formatonumeros(this.valorTotal);

    let productoExt : any = {
      Id : idMateriaPrima,
      Nombre : this.nombreMateriaPrima,
      Cant : cantidad,
      UndCant : presentacion,
      PrecioUnd : precioMateriaPrima,
      Stock : this.FormMateriaPrima.value,
      SubTotal : subtotalProd
    }

    this.FormMateriaPrimaFactura.setValue({
      ConsecutivoFactura : this.FormMateriaPrimaFactura.value.ConsecutivoFactura,
      MpFactura: this.FormMateriaPrimaFactura.value.MpFactura,
      MpRemision : this.FormMateriaPrimaFactura.value.MpRemision,
      MpingresoFecha: this.today,
      proveedor :this.FormMateriaPrimaFactura.value.proveedor,
      proveedorNombre:this.FormMateriaPrimaFactura.value.proveedorNombre,
      // tipoDocumento: this.FormMateriaPrimaFactura.value.tipoDocumento,
      // MpEstados: this.FormMateriaPrimaFactura.value.MpEstados,
      // MpOperario: this.FormMateriaPrimaFactura.value.MpOperario,
      MpObservacion: this.FormMateriaPrimaFactura.value.MpObservacion,
    });

    if (this.AccionBoton == "Agregar" && this.ArrayMateriaPrima.length == 0) {
      this.ArrayMateriaPrima.push(productoExt);

    } else if (this.AccionBoton == "Agregar" && this.ArrayMateriaPrima.length != 0){
      this.ArrayMateriaPrima.push(productoExt);
      productoExt = [];
    } else {
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
  }

  //Funcion que creará el registro de la materia que viene en un pedido
  creacionFacturaMateriaPrima(idFactura : number){
    let idMateriaPrima : number;
    let cantidadMateriaPrima : number;
    let presentacionMateriaPrima : string;
    let valorUnitarioMp : number;

    if (this.ArrayMateriaPrima.length == 0) Swal.fire("Debe cargar minimo una materia prima en la tabla")
    else {
      for (let index = 0; index < this.ArrayMateriaPrima.length; index++) {
        idMateriaPrima = this.ArrayMateriaPrima[index].Id;
        cantidadMateriaPrima = this.ArrayMateriaPrima[index].Cant;
        presentacionMateriaPrima = this.ArrayMateriaPrima[index].UndCant;
        valorUnitarioMp = this.ArrayMateriaPrima[index].PrecioUnd;

        const datosFacturaMp : any = {
          Facco_Id : idFactura,
          MatPri_Id : idMateriaPrima,
          FaccoMatPri_Cantidad : cantidadMateriaPrima,
          UndMed_Id : presentacionMateriaPrima,
          FaccoMatPri_ValorUnitario : valorUnitarioMp,
        }
        this.facturaMpService.srvGuardar(datosFacturaMp).subscribe(datos_facturaMpCreada => {
        });
        this.cargarRemisionEnFactura(idFactura);
        this.moverInventarioMpAgregada();
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

  obtenerUltimoIdRemisionCompra(){
    let idsRemision = [];
    let idUltimaRemision : number;
    this.remisionService.srvObtenerLista().subscribe(datos_remision => {
      for (let index = 0; index < datos_remision.length; index++) {
        idsRemision.push(datos_remision[index].rem_Id);
      }
      this.ultimoIdRemision = Math.max.apply(null, idsRemision);
      this.ultimoIdRemision = this.ultimoIdRemision + 1;
      this.FormMateriaPrimaFactura.setValue({
        MpFactura: '',
        MpRemision : '',
        MpingresoFecha: this.today,
        proveedor: '',
        proveedorNombre: '',
        // tipoDocumento: '',
        // MpEstados:'',
        // MpOperario: this.storage_Nombre,
        MpObservacion : '',
      });
    });
  }

  //Funcion que registrará y guardará en la base de datos la infomacion de la materia prima entrante
  registrarRemisionMP(){
    let nombreEstado : string = this.FormMateriaPrimaFactura.value.MpEstados;
    let consecutivoRemision : string = this.FormMateriaPrimaFactura.value.MpRemision;
    // let fechaEntrada : any = this.FormMateriaPrimaFactura.value.MpingresoFecha;
    let idProveedor : number = this.FormMateriaPrimaFactura.value.proveedor;
    let observacionRemision : string = this.FormMateriaPrimaFactura.value.MpObservacion;
    let idEstadoRemision : number;
    let idUsuario : number = this.storage_Id;
    // let tipoDocumento : string = this.FormMateriaPrimaRemision.value.tipoDocumento;

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
    let idUltimaRemision : number;
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

    if (this.ArrayMateriaPrima.length == 0) Swal.fire("Debe cargar minimo una materia prima en la tabla")
    else {
      for (let index = 0; index < this.ArrayMateriaPrima.length; index++) {
        idMateriaPrima = this.ArrayMateriaPrima[index].Id;
        cantidadMateriaPrima = this.ArrayMateriaPrima[index].Cant;
        presentacionMateriaPrima = this.ArrayMateriaPrima[index].UndCant;
        valorUnitarioMp = this.ArrayMateriaPrima[index].PrecioUnd;

        const datosRemisionMp : any = {
          Rem_Id : idRemision,
          MatPri_Id : idMateriaPrima,
          RemiMatPri_Cantidad : cantidadMateriaPrima,
          UndMed_Id : presentacionMateriaPrima,
          RemiMatPri_ValorUnitario : valorUnitarioMp,
        }
        this.remisionMPService.srvGuardar(datosRemisionMp).subscribe(datos_remisionMpCreada => {
        });
      }
      this.moverInventarioMpAgregada();
    }
  }

  //Funcion que moverá el inventario de materia prima con base a la materia prima entrante
  moverInventarioMpAgregada(){
    let idMateriaPrima : number;
    let cantidadMateriaPrima : number;
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

  limpiarTodosCampos(){
    this.FormMateriaPrimaFactura.setValue({
      ConsecutivoFactura : this.ultimoIdFactura,
      MpFactura: '',
      MpRemision : '',
      MpingresoFecha: this.today,
      proveedor: '',
      proveedorNombre: '',
      // tipoDocumento: '',
      // MpEstados:'',
      // MpOperario: this.storage_Nombre,
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

  //Funcion que consultara una materia prima con base a un ID pasado en la vista
  buscarMpId(){
    let idMateriaPrima : number = this.FormMateriaPrima.value.MpId;
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
          this.cargarInfoMP();
        });
      });
    });
  }

  //Funcion que consultara una materia prima con base a la que está seleccionada en la vista
  buscarMpSeleccionada(){
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

  //Funcion que consultará la materia prima por los filtros que se le den
  consultarMateriasPrimas(){
    let idMateriaPrima : number;
    let nombreMateriaPrima : string;
    let consecutivoFactura : any;
    this.MpConsultada = [];

    if (consecutivoFactura != null && (idMateriaPrima != null || nombreMateriaPrima != null)) {
      this.facturaMpComService.srvObtenerLista().subscribe(datos_facturas => {
        for (let index = 0; index < datos_facturas.length; index++) {
          if (datos_facturas[index].facco_Codigo == consecutivoFactura) {
            if (idMateriaPrima != null) {
              this.materiaPrimaService.srvObtenerListaPorId(idMateriaPrima).subscribe(datos_materiaPrima => {
                this.MpConsultada.push(datos_materiaPrima);
              });
            } else if (nombreMateriaPrima != null) {
              this.materiaPrimaService.srvObtenerLista().subscribe(datos_materiaPrima => {
                for (let index = 0; index < datos_materiaPrima.length; index++) {

                }
              });
            }

            this.facturaMateriaPrima.push(datos_facturas[index]);
          }
        }
      });

    } else if (consecutivoFactura != null) {
      this.facturaMpComService.srvObtenerLista().subscribe(datos_facturas => {
        for (let index = 0; index < datos_facturas.length; index++) {
          if (datos_facturas[index].facco_Codigo == consecutivoFactura) {
            this.facturaMateriaPrima.push(datos_facturas[index]);
          }
        }
      });
    } else if (idMateriaPrima != null || nombreMateriaPrima != null) {

    } else {

    }
  }

  //Consultar Remisiones por Codigo
  consultarIdRemisiones(){
    let idRemision : number = this.FormRemisiones.value.idRemision;
    let subtotal : number;
    this.remision = [];
    this.remConFac = [];

    this.load = false;

    this.remisionService.srvObtenerLista().subscribe(datos_remision => {
      for (let index = 0; index < datos_remision.length; index++) {
        if (idRemision == datos_remision[index].rem_Codigo) {
          this.remision.push(datos_remision[index].rem_Id);
        }
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
            if (this.remision[l] == this.remConFac[m]) {
              this.remision = [];
            }
          }
        }
      }

      if (this.remision.length == 0) {
        Swal.fire(`La remision con el código ${idRemision} ya tiene una factura asignada`)
      } else {
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


    //Recorro remisiones según el código ingresado
    /*this.remisionService.srvObtenerLista().subscribe(datosRemisiones => {
      for (let index = 0; index < datosRemisiones.length; index++) {
        if(idRemision == datosRemisiones[index].rem_Codigo) {
          this.remisionFacturaService.srvObtenerLista().subscribe(datos_remFac => {
            for (let remFac = 0; remFac < datos_remFac.length; remFac++) {
              if (datos_remFac[remFac].rem_Id == datosRemisiones[index].rem_Id) {
                validarRemisionesFacturas.push(datos_remFac[remFac]);
                console.log(datos_remFac[remFac]);

              }
           }
          });
        }
      }
    }, error => { console.log(error); })*/


  //  if (validarRemisionesFacturas.length == 0) {

    //Recorro remisiones según el código ingresado
      // this.remisionService.srvObtenerLista().subscribe(datosRemisiones => {
      //   for (let index = 0; index < datosRemisiones.length; index++) {
      //     if(idRemision == datosRemisiones[index].rem_Codigo) {

      //       //Recorro usuarios según el ID para mostrar el nombre en la tabla.
      //       this.usuarioService.srvObtenerListaUsuario().subscribe(datosUsuarios => {
      //         for (let usu = 0; usu < datosUsuarios.length; usu++) {
      //           if(datosRemisiones[index].usua_Id === datosUsuarios[usu].usua_Id) {
      //             //Recorro proveedores según el ID para mostrar el nombre en la tabla.
      //             this.proveedorservices.srvObtenerLista().subscribe(datosProveedor => {
      //               for (let prv = 0; prv < datosProveedor.length; prv++) {
      //                 if (datosRemisiones[index].prov_Id === datosProveedor[prv].prov_Id) {
      //                   //Recorro tipo documento según el ID para mostrar el nombre en la tabla.
      //                   this.tipoDocumentoService.srvObtenerLista().subscribe(datosDocumentos => {
      //                     for (let doc = 0; doc < datosDocumentos.length; doc++) {
      //                       if(datosRemisiones[index].tpDoc_Id === datosDocumentos[doc].tpDoc_Id) {
      //                         //Recorro remisiones_facturascompras para ver lo que va para la tabla.
      //                           this.remisionFacturaService.srvObtenerLista().subscribe(datosRemisiones_Facturas => {
      //                             for (let remFac = 0; remFac < datosRemisiones_Facturas.length; remFac++) {
      //                                //subtotal = datosRemisiones[index].rem_PrecioEstimado;

      //                               let remFac_remisionId : any = [datosRemisiones_Facturas[remFac].rem_Id];
      //                               let propioRemisionId : any = [datosRemisiones[index].rem_Id];

      //                               console.log(remFac_remisionId);
      //                               console.log(propioRemisionId);

      //                               if(remFac_remisionId.includes(propioRemisionId)){

      //                                 Swal.fire('La remisión  "' + propioRemisionId + '" ya tiene una factura asociada.')
      //                                 console.log('Entró acá');
      //                                 //console.log(remFac_remisionId);
      //                                 break;
      //                               } else if (!remFac_remisionId.includes(propioRemisionId)){

      //                                 let datosTablaRemisiones : any = {
      //                                   remisionId : datosRemisiones[index].rem_Id,
      //                                   remisionCodigo : datosRemisiones[index].rem_Codigo,
      //                                   remisionFecha : datosRemisiones[index].rem_Fecha,
      //                                   remisionProveedor : datosProveedor[prv].prov_Nombre,
      //                                   remisionUsuario :  datosUsuarios[usu].usua_Nombre,
      //                                   remisionDocumento : datosDocumentos[doc].tpDoc_Nombre,
      //                                   remisionPrecio : datosRemisiones[index].rem_PrecioEstimado
      //                                 }
      //                                   this.precioRemision = datosTablaRemisiones.remisionPrecio
      //                                   this.ArrayRemisiones.push(datosTablaRemisiones);
      //                                   this.valorTotalRem = this.valorTotalRem + subtotal;
      //                                   this.llenarDocumento(datosRemisiones[index].rem_Id);

      //                                   console.log('Entra');
      //                                   //console.log(datosRemisiones_Facturas[remFac]);
      //                                   break;
      //                               }

      //                             }
      //                           });

      //                         //Array que recibe la variable para agregar en tabla remisiones.
      //                       }
      //                     }
      //                   });
      //                 }
      //               }
      //             });
      //           }
      //         }
      //       });
      //     }
      //   }
      // }, error => { console.log(error); })
    //}
  }

  ColumnasTablaRemisiones(){
    //this.titulosTablaRemisiones = [];
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
  }

  // Funcion para llamar el modal que crea clientes
  LlamarModalCrearProveedor() {
    this.ModalCrearProveedor = true;
  }

  // Funcion para llamar el modal que crea clientes
  LlamarModalCrearMateriaPrima(){
    this.ModalCrearMateriaPrima = true;
  }

}
