import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { AreaService } from 'src/app/Servicios/area.service';
import { AsignacionMPService } from 'src/app/Servicios/asignacionMP.service';
import { BagproService } from 'src/app/Servicios/Bagpro.service';
import { CategoriaMateriaPrimaService } from 'src/app/Servicios/categoriaMateriaPrima.service';
import { DetallesAsignacionService } from 'src/app/Servicios/detallesAsignacion.service';
import { EstadosService } from 'src/app/Servicios/estados.service';
import { FacturaMpService } from 'src/app/Servicios/facturaMp.service';
import { FactuaMpCompradaService } from 'src/app/Servicios/facturaMpComprada.service';
import { MateriaPrimaService } from 'src/app/Servicios/materiaPrima.service';
import { MpProveedorService } from 'src/app/Servicios/MpProveedor.service';
import { ProcesosService } from 'src/app/Servicios/procesos.service';
import { ProveedorService } from 'src/app/Servicios/proveedor.service';
import { RolesService } from 'src/app/Servicios/roles.service';
import { TipoEstadosService } from 'src/app/Servicios/tipo-estados.service';
import { TipoBodegaService } from 'src/app/Servicios/tipoBodega.service';
import { TipoDocumentoService } from 'src/app/Servicios/tipoDocumento.service';
import { UnidadMedidaService } from 'src/app/Servicios/unidad-medida.service';
import { UsuarioService } from 'src/app/Servicios/usuario.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-asignacion-materia-prima',
  templateUrl: './asignacion-materia-prima.component.html',
  styleUrls: ['./asignacion-materia-prima.component.css']
})
export class AsignacionMateriaPrimaComponent implements OnInit {

  public FormMateriaPrimaFactura !: FormGroup;
  public FormMateriaPrima !: FormGroup;
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
  ultimoId : number = 0;


  /* CONSULTAS DE MATERIA PRIMA */
  MpConsultada = [];

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
                                                      private tipoDocumentoService : TipoDocumentoService) {

    this.FormMateriaPrimaRetiro = this.frmBuilderMateriaPrima.group({
      OTRetiro : new FormControl(),
      FechaRetiro : new FormControl(),
      Maquina : new FormControl(),
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
  }


  ngOnInit(): void {
    this.initForms();
    this.lecturaStorage();
    this.fecha();
    this.ColumnasTabla();
    this.obtenerUnidadMedida();
    this.obtenerUsuarios();
    this.obtenerEstados();
    this.obtenerProcesos();
    this.obtenerMateriasPrimasRetiradas();
  }

  initForms() {
    this.FormMateriaPrimaRetiro = this.frmBuilderMateriaPrima.group({
      OTRetiro : ['', Validators.required],
      FechaRetiro : ['', Validators.required],
      Maquina : ['', Validators.required],
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

    this.FormMateriaPrimaRetiro = this.frmBuilderMateriaPrima.group({
      OTRetiro : '',
      FechaRetiro : this.today,
      Maquina : '',
      UsuarioRetiro : '',
      AreaRetiro : '',
      EstadoRetiro : '',
      ObservacionRetiro : '',
      ProcesoRetiro : '',
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
    this.FormMateriaPrimaRetirada.reset();
  }

  //Funcion que limpiará los campos de la materia pirma entrante
  limpiarCamposMP(){
    this.FormMateriaPrimaRetiro = this.frmBuilderMateriaPrima.group({
      OTRetiro : '',
      FechaRetiro : this.today,
      Maquina : '',
      UsuarioRetiro : '',
      AreaRetiro : '',
      EstadoRetiro : '',
      ObservacionRetiro : '',
      ProcesoRetiro : '',
    });
    this.FormMateriaPrimaRetirada.reset();
    this.ArrayMateriaPrimaRetirada = [];
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

  //Funcion que buscará y almacenará todos los estados existententes para documentos
  obtenerEstados(){
    this.tipoEstadoService.srvObtenerListaPorId(1).subscribe(datos_tipoEstados => {
      this.estadoService.srvObtenerListaEstados().subscribe(datos_estados => {
        for (let index = 0; index < datos_estados.length; index++) {
          if (datos_estados[index].tpEstado_Id == datos_tipoEstados.tpEstado_Id) {
            if (datos_estados[index].estado_Id == 12 || datos_estados[index].estado_Id == 13) {
              this.estado.push(datos_estados[index].estado_Nombre);
            }
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

  //Funcion que asignará la materia prima a una Orden de trabajo y Proceso y lo guardará en la base de datos
  asignacionMateriaPrima(){
    let idOrdenTrabajo : number = this.FormMateriaPrimaRetiro.value.OTRetiro;
    let fechaEntrega : any = this.FormMateriaPrimaRetiro.value.FechaRetiro;
    let observacion : string = this.FormMateriaPrimaRetiro.value.ObservacionRetiro;
    let maquina : number = this.FormMateriaPrimaRetiro.value.Maquina;
    let idUsuario : number;
    let idArea : number;
    let idEstado : number;

    const datosAsignacion : any = {
      AsigMP_OrdenTrabajo : idOrdenTrabajo,
      AsigMp_FechaEntrega : fechaEntrega,
      AsigMp_Observacion : observacion,
      Estado_Id : 13,
      AsigMp_Maquina : maquina,
      Usua_Id : this.storage_Id,
    }
    this.asignacionMPService.srvGuardar(datosAsignacion).subscribe(datos_asignacionCreada => {
      this.obtenerUltimoIdAsignacaion();
    });
  }

  //Funcion que va a buscar y obtener el id de la ultima asignacion
  obtenerUltimoIdAsignacaion(){
    let idsAsignaciones = [];
    this.asignacionMPService.srvObtenerLista().subscribe(datos_asignaciones => {
      for (let index = 0; index < datos_asignaciones.length; index++) {
        idsAsignaciones.push(datos_asignaciones[index].asigMp_Id);
      }
      let ultimoId : number = Math.max.apply(null, idsAsignaciones);
      this.detallesAsignacionMP(ultimoId);
    });
  }

  validarCamposVaciosRetirada(){
    let ot : string = this.FormMateriaPrimaRetiro.value.OTRetiro;
    if (this.FormMateriaPrimaRetiro.valid) this.asignacionMateriaPrima();
    else if (ot.length < 6) Swal.fire("La OT debe tener mas de 6 digitos");
    else Swal.fire("Hay campos de la Materi Prima vacios");
  }

  //Funcion que almacenará de forma detalla la(s) materia prima que se están asignando a una OT y Proceso
  detallesAsignacionMP(idAsignacion : number){
    let idMateriaPrima : number;
    let cantidadMateriaPrima : number;
    let presentacionMateriaPrima : string;
    let proceso : string = this.FormMateriaPrimaRetiro.value.ProcesoRetiro;

    if (this.ArrayMateriaPrimaRetirada.length == 0) Swal.fire("Debe cargar minimo una materia prima en la tabla")
    else {
      for (let index = 0; index < this.ArrayMateriaPrimaRetirada.length; index++) {
        idMateriaPrima = this.ArrayMateriaPrimaRetirada[index].Id;
        cantidadMateriaPrima = this.ArrayMateriaPrimaRetirada[index].Cant;
        presentacionMateriaPrima = this.ArrayMateriaPrimaRetirada[index].UndCant;

        const datosDetallesAsignacion : any = {
          AsigMp_Id : idAsignacion,
          MatPri_Id : idMateriaPrima,
          DtAsigMp_Cantidad : cantidadMateriaPrima,
          UndMed_Id : presentacionMateriaPrima,
          Proceso_Id : proceso,
        }

        this.detallesAsignacionService.srvGuardar(datosDetallesAsignacion).subscribe(datos_asignacionDtallada => {
        });
      }
      this.moverInventarioMpPedida(idMateriaPrima, cantidadMateriaPrima);
    }
  }

  validarCamposVaciosMPRetirada(){
    if (this.FormMateriaPrimaRetirada.valid) this.cargarFormMpRetiradaTablas(this.ArrayMateriaPrimaRetirada)
    else Swal.fire("Hay campos de la Materi Prima vacios")
  }

  // // Funcion que envia la informacion de la materia prima pedida a la tabla.
  cargarFormMpRetiradaTablas(formulario : any){
    let idMateriaPrima : number = this.FormMateriaPrimaRetirada.value.MpIdRetirada;
    this.nombreMateriaPrima = this.FormMateriaPrimaRetirada.value.MpNombreRetirada;
    let precioMateriaPrima : number = this.FormMateriaPrimaRetirada.value.MpPrecioRetirada;
    let presentacion : string = this.FormMateriaPrimaRetirada.value.MpUnidadMedidaRetirada;
    let cantidad : number = this.FormMateriaPrimaRetirada.value.MpCantidadRetirada;
    let subtotalProd : number = precioMateriaPrima * cantidad;

    let productoExt : any = {
      Id : idMateriaPrima,
      Nombre : this.nombreMateriaPrima,
      Cant : cantidad,
      UndCant : presentacion,
      PrecioUnd : precioMateriaPrima,
      Stock : this.FormMateriaPrimaRetirada.value.MpStockRetirada,
      SubTotal : subtotalProd
    }

    if (this.AccionBoton == "Agregar" && this.ArrayMateriaPrimaRetirada.length == 0) {
      this.ArrayMateriaPrimaRetirada.push(productoExt);

    } else if (this.AccionBoton == "Agregar" && this.ArrayMateriaPrimaRetirada.length != 0){
      this.ArrayMateriaPrimaRetirada.push(productoExt);
      productoExt = [];
    } else {
      for (let index = 0; index < formulario.length; index++) {
        if(productoExt.Id == this.ArrayMateriaPrimaRetirada[index].Id) {
          this.ArrayMateriaPrimaRetirada.splice(index, 1);
          this.AccionBoton = "Agregar";
          this.ArrayMateriaPrimaRetirada.push(productoExt);
          break;
        }
      }
    }

    this.FormMateriaPrimaRetirada.setValue({
      MpIdRetirada : '',
      MpNombreRetirada: '',
      MpCantidadRetirada : '',
      MpPrecioRetirada: '',
      MpUnidadMedidaRetirada: '',
      MpStockRetirada: '',
    });
    this.ArrayMateriaPrimaRetirada.sort((a,b)=> Number(a.PrecioUnd) - Number(b.PrecioUnd));
  }

  //Funcion que moverá el inventario de materia prima con base a la materia prima saliente
  moverInventarioMpPedida(idMateriaPrima : number, cantidadMateriaPrima : number){
    let stockMateriaPrimaInicial : number;
    let stockMateriaPrimaFinal : number;

    for (let index = 0; index < this.ArrayMateriaPrimaRetirada.length; index++) {


      this.materiaPrimaService.srvObtenerListaPorId(this.ArrayMateriaPrimaRetirada[index].Id).subscribe(datos_materiaPrima => {
        stockMateriaPrimaInicial = datos_materiaPrima.matPri_Stock;
        stockMateriaPrimaFinal = stockMateriaPrimaInicial - this.ArrayMateriaPrimaRetirada[index].Cant;
        const datosMP : any = {
          MatPri_Id : this.ArrayMateriaPrimaRetirada[index].Id,
          MatPri_Nombre : datos_materiaPrima.matPri_Nombre,
          MatPri_Descripcion : datos_materiaPrima.matPri_Descripcion,
          MatPri_Stock : stockMateriaPrimaFinal,
          UndMed_Id : datos_materiaPrima.undMed_Id,
          CatMP_Id : datos_materiaPrima.catMP_Id,
          MatPri_Precio : datos_materiaPrima.matPri_Precio,
          TpBod_Id : datos_materiaPrima.tpBod_Id,
        }
        this.materiaPrimaService.srvActualizar(this.ArrayMateriaPrimaRetirada[index].Id, datosMP).subscribe(datos_mp_creada => {
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
            title: '¡Registro de Asignación creado con exito!'
          });
          this.FormMateriaPrimaRetiro = this.frmBuilderMateriaPrima.group({
            OTRetiro : '',
            FechaRetiro : this.today,
            Maquina : '',
            UsuarioRetiro : '',
            AreaRetiro : '',
            EstadoRetiro : '',
            ObservacionRetiro : '',
            ProcesoRetiro : '',
          });
          this.ArrayMateriaPrimaRetirada= [];
          this.FormMateriaPrimaRetirada.reset();
        });
      });
    }

  }


  //Funcion que consultara una materia prima con base a un ID pasado en la vista
  buscarMpId(){
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
          this.cargarInfoMP();
        });
      });
    });
  }

  //Funcion que consultara una materia prima con base a la que está seleccionada en la vista
  buscarMpSeleccionada(){
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
      this.FormMateriaPrimaRetirada.setValue({
        MpIdRetirada : Mp.matPri_Id,
        MpNombreRetirada: Mp.matPri_Nombre,
        MpCantidadRetirada : '',
        MpPrecioRetirada: Mp.matPri_Precio,
        MpUnidadMedidaRetirada: Mp.undMed_Id,
        MpStockRetirada: Mp.matPri_Stock,
      });
    }
  }

  // Función para quitar un producto de la tabla
  QuitarProductoTabla(index : number, formulario : any) {
    Swal.fire({
      title: '¿Estás seguro de eliminar la Materia Prima de la Asignación?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.ArrayMateriaPrimaRetirada.splice(index, 1);
        Swal.fire('Materia Prima eliminada');
      }
    });
  }

  // Función para editar uno de los productos de la tabla
  EditarProductoTabla(formulario : any) {
    this.AccionBoton = "Editar";
    this.FormMateriaPrimaRetirada.patchValue({
      MpIdRetirada : formulario.Id,
      MpNombreRetirada: formulario.Nombre,
      MpCantidadRetirada : formulario.Cant,
      MpUnidadMedidaRetirada: formulario.UndCant,
      MpStockRetirada: formulario,
    });
  }



  //Funcion que consultará la materia prima que se ha asignado a la Orden de trabajo buscada
  consultarMpAsignadaOT(){
    let ordenTrabajo : number;
    let operario : any;
    let idOperario : any;
    let fechaAsignacion : any;

    if (operario != null) {
      this.asignacionMPService.srvObtenerLista().subscribe(datos_asignaciones => {
        for (let index = 0; index < datos_asignaciones.length; index++) {
          if (datos_asignaciones[index].usua_Id == idOperario) this.llenadoMpAsignada(datos_asignaciones[index]);
        }
      });
    } else if (fechaAsignacion != null) {
      this.asignacionMPService.srvObtenerLista().subscribe(datos_asignaciones => {
        for (let index = 0; index < datos_asignaciones.length; index++) {
          if (moment(datos_asignaciones[index].asigMp_FechaEntrega).isBetween(fechaAsignacion, undefined)) this.llenadoMpAsignada(datos_asignaciones[index]);
        }
      });
    } else if (ordenTrabajo != null) {
      this.asignacionMPService.srvObtenerLista().subscribe(datos_asignaciones => {
        for (let index = 0; index < datos_asignaciones.length; index++) {
          if (datos_asignaciones[index].asigMP_OrdenTrabajo == ordenTrabajo) this.llenadoMpAsignada(datos_asignaciones[index]);
        }
      });
    } else {
      this.asignacionMPService.srvObtenerLista().subscribe(datos_asignaciones => {
        for (let index = 0; index < datos_asignaciones.length; index++) {
          this.llenadoMpAsignada(datos_asignaciones[index]);
        }
      });
    }
  }

  //Funcion que se encargará de llenar la tabla de Asignaciones en la vista
  llenadoMpAsignada(asignacion : any){

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


  // Funcion para llamar el modal que crea clientes
  LlamarModalCrearProveedor() {
    this.ModalCrearProveedor = true;
  }

  // Funcion para llamar el modal que crea clientes
  LlamarModalCrearMateriaPrima(){
    this.ModalCrearMateriaPrima = true;
  }



}