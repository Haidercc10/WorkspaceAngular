import { ThisReceiver } from '@angular/compiler';
import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { info } from 'console';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { AsignacionMPService } from 'src/app/Servicios/asignacionMP.service';
import { CategoriaMateriaPrimaService } from 'src/app/Servicios/categoriaMateriaPrima.service';
import { DetallesAsignacionService } from 'src/app/Servicios/detallesAsignacion.service';
import { DevolucionesService } from 'src/app/Servicios/devoluciones.service';
import { DevolucionesMPService } from 'src/app/Servicios/devolucionesMP.service';
import { MateriaPrimaService } from 'src/app/Servicios/materiaPrima.service';
import { ProcesosService } from 'src/app/Servicios/procesos.service';
import { RolesService } from 'src/app/Servicios/roles.service';
import { TintasService } from 'src/app/Servicios/tintas.service';
import { TipoBodegaService } from 'src/app/Servicios/tipoBodega.service';
import { UnidadMedidaService } from 'src/app/Servicios/unidad-medida.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-devolucionesMP',
  templateUrl: './devolucionesMP.component.html',
  styleUrls: ['./devolucionesMP.component.css']
})
export class DevolucionesMPComponent implements OnInit {

  public FormMateriaPrimaRecuperada !: FormGroup;
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
  tipoRecuperado = [];
  totalPorcentajePerida : number; //Variable que ayudará a calcular el total de perdida en una OT
  ultimoIDevolucion: number = 0;
  validarCamposFacRem : number = 3;
  ultimoIdRemision : number = 0;
  ArrayRemisiones = [];
  precioRemision = [];
  titulosTablaRemisiones = [];
  valorTotalRem = 0;
  mpAgregada = [];
  cargando : boolean = true;

  procesoID : string;
  idMateriaPrima : number;
  cantidadMateriaPrima : number;
  presentacionMateriaPrima : string;
  idTinta : number;
  validarInput : boolean = true;
  keyword = 'name';
  public historyHeading: string = 'Seleccionado Recientemente';
  public tituloCampoMP : string = 'Materia Prima';


  constructor(private materiaPrimaService : MateriaPrimaService,
                @Inject(SESSION_STORAGE) private storage: WebStorageService,
                  private categoriMpService : CategoriaMateriaPrimaService,
                    private tipoBodegaService : TipoBodegaService,
                      private unidadMedidaService : UnidadMedidaService,
                        private rolService : RolesService,
                          private frmBuilderMateriaPrima : FormBuilder,
                            private devolucionService : DevolucionesService,
                              private devolucionMPService : DevolucionesMPService,
                                private asignacionService : AsignacionMPService,
                                  private asignacionMPService : DetallesAsignacionService,
                                    private procesosService : ProcesosService,
                                      private servicioTintas : TintasService,) {

    this.FormMateriaPrimaRecuperada = this.frmBuilderMateriaPrima.group({
      //MateriaPrima
      ot : new FormControl(),
      MpingresoFecha: new FormControl(),
      MpObservacion : new FormControl(),
    });

    this.FormMateriaPrima = this.frmBuilderMateriaPrima.group({
      MpId : new FormControl(),
      MpNombre: new FormControl(),
      MpCantidad: new FormControl(),
      MpUnidadMedida:new FormControl(),
      Proceso: new FormControl(),
    });
  }


  ngOnInit(): void {
    this.initForms();
    this.lecturaStorage();
    this.fecha();
    this.ColumnasTabla();
    this.obtenerUnidadMedida();
    this.obtenerMateriasPrimasRetiradas();
    this.obtenerProcesos();
  }

  onChangeSearch(val: string) {
    if (val != '') this.validarInput = false;
    else this.validarInput = true;
    // fetch remote data from here
    // And reassign the 'data' which is binded to 'data' property.
  }

  onFocused(e){
    if (!e.isTrusted) this.validarInput = false;
    else this.validarInput = true;
    // do something when input is focused
  }

  initForms() {
    this.FormMateriaPrimaRecuperada = this.frmBuilderMateriaPrima.group({
      ot : ['', Validators.required],
      MpingresoFecha: ['', Validators.required],
      MpObservacion : ['', Validators.required],
    });

    this.FormMateriaPrima = this.frmBuilderMateriaPrima.group({
      MpId : ['', Validators.required],
      MpNombre: ['', Validators.required],
      MpCantidad : ['', Validators.required],
      MpUnidadMedida: ['', Validators.required],
      Proceso : ['', Validators.required],
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

    this.FormMateriaPrimaRecuperada.setValue({
      ot : '',
      MpingresoFecha: this.today,
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
    this.FormMateriaPrimaRecuperada.setValue({
      ot : '',
      MpingresoFecha: this.today,
      MpObservacion : '',
    });
  }

  //Funcion que limpiará los campos de la materia pirma entrante
  limpiarCamposMP(){
    this.FormMateriaPrima.reset();
  }

  //Funcion que va a recorrer las materias primas para almacenar el nombre de todas
  obtenerMateriasPrimasRetiradas(){
    this.materiaPrimaService.getMatPrimasConTintas().subscribe(datos_materiaPrima => {
      for (let index = 0; index < datos_materiaPrima.length; index++) {
        let mp : any = {
          id : datos_materiaPrima[index].id,
          name : datos_materiaPrima[index].nombre,
        }
        this.materiasPrimas.push(mp);
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

  //Funcion que se encagará de obtener los procesos de la empresa
  obtenerProcesos(){
    this.procesosService.srvObtenerLista().subscribe(datos_procesos => {
      for (let index = 0; index < datos_procesos.length; index++) {
        if (datos_procesos[index].proceso_Id == 'TINTAS') continue;
        else this.procesos.push(datos_procesos[index]);
      }
    });
  }

  //Funcion que registrará y guardará en la base de datos la infomacion de la materia prima entrante
  registrarDevolucion(){
    let observacion : string = this.FormMateriaPrimaRecuperada.value.MpObservacion;
    let ot : string = this.FormMateriaPrimaRecuperada.value.ot;

    const datosDevolucion : any = {
      DevMatPri_OrdenTrabajo : ot,
      DevMatPri_Fecha : this.today,
      DevMatPri_Motivo : observacion,
      Usua_Id : this.storage_Id,
    }

    this.devolucionService.srvGuardar(datosDevolucion).subscribe(datos_DevolucionCreada => {
      this.obtenerUltimoIdDevolucion();
    });
  }

  // Funcion que se encargará de obtener el ultimo Id de las facturas
  obtenerUltimoIdDevolucion(){
    this.devolucionService.srvObtenerUltimaDevolucion().subscribe(datos_devolucion => {
      this.ultimoIDevolucion = datos_devolucion.devMatPri_Id;
      this.obtenerIdProceso();
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
      mpProceso : "Proceso"
    }]
  }

  //
  validarCamposVaciosMP(){
    if (this.FormMateriaPrima.valid) this.cargarFormMpEnTablas(this.ArrayMateriaPrima);
    else Swal.fire("Hay campos de Materia Prima vacios");
  }

  //Funcion que envia la informacion de los productos a la tabla.
  cargarFormMpEnTablas(formulario : any){
    let idMateriaPrima : number = this.FormMateriaPrima.value.MpId;
    this.nombreMateriaPrima = this.FormMateriaPrima.value.MpNombre;
    let presentacion : string = this.FormMateriaPrima.value.MpUnidadMedida;
    let cantidad : number = this.FormMateriaPrima.value.MpCantidad;
    let proceso : string = this.FormMateriaPrima.value.Proceso;
    //let mpTinta : number = 2001;
    //let mpMatPrima : number = 84;

    let productoExt : any = {
      Id : idMateriaPrima,
      MatPrima : 0,
      Tinta : 0,
      Nombre : this.nombreMateriaPrima,
      Cant : cantidad,
      UndCant : presentacion,
      Proceso : proceso,
    }
    if(productoExt.Id > 2000) {
      productoExt.Tinta = idMateriaPrima;
      productoExt.MatPrima = 84;
    } else {
      productoExt.Tinta = 2001;
      productoExt.MatPrima = idMateriaPrima;
    }
    this.setearFormularioSuperior();

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
    console.log(this.ArrayMateriaPrima);
    this.ArrayMateriaPrima.sort((a,b)=> Number(a.PrecioUnd) - Number(b.PrecioUnd));
    this.FormMateriaPrima.reset();
  }

  /** Dejar los campos del primer formulario con los valores que tiene en ese momento. */
  setearFormularioSuperior() {
    this.FormMateriaPrimaRecuperada.setValue({
      ot : this.FormMateriaPrimaRecuperada.value.ot,
      MpingresoFecha: this.today,
      MpObservacion: this.FormMateriaPrimaRecuperada.value.MpObservacion,
    });
  }

  /** Obtener Id del proceso, ya que en la tabla se carga el nombre */
  obtenerIdProceso(){
    this.cargando = false;
    let procesoNombre : string;
    this.idMateriaPrima = 0;
    this.cantidadMateriaPrima = 0;
    this.presentacionMateriaPrima = '';
    this.procesoID = '';

    for (let index = 0; index < this.ArrayMateriaPrima.length; index++) {
      procesoNombre = this.ArrayMateriaPrima[index].Proceso;

     this.procesosService.srvObtenerLista().subscribe(datos_procesos => {
        for (let i = 0; i < datos_procesos.length; i++) {
          if (datos_procesos[i].proceso_Nombre == this.ArrayMateriaPrima[index].Proceso) {
            this.procesoID = '';
            this.idMateriaPrima = this.ArrayMateriaPrima[index].MatPrima;
            this.idTinta = this.ArrayMateriaPrima[index].Tinta;
            this.cantidadMateriaPrima = this.ArrayMateriaPrima[index].Cant;
            this.presentacionMateriaPrima = this.ArrayMateriaPrima[index].UndCant;
            let procesoId = datos_procesos[i].proceso_Id;
            this.creacionDevolucionMateriaPrima(this.ultimoIDevolucion,
                                                this.idMateriaPrima,
                                                this.idTinta,
                                                this.cantidadMateriaPrima,
                                                this.presentacionMateriaPrima,
                                                procesoId);
            this.procesoID = '';
            break;
          }
        }
      });
    }

    setTimeout(() => {
    this.moverInventarioMpAgregada();
    this.moverInventarioTintas();
    setTimeout(() => {
      this.limpiarTodosCampos();
    }, 1500);
    }, 3000);
  }

  //Funcion que creará el registro de la materia que viene en un pedido
  creacionDevolucionMateriaPrima(idDevolucion : number, idMp : number, idTinta : number,  cantidad : number, undMed : string, proceso : string,){
    let ot : string = this.FormMateriaPrimaRecuperada.value.ot;

    if (this.ArrayMateriaPrima.length == 0) Swal.fire("Debe cargar minimo una materia prima en la tabla");
    else {
      const datosDevolucionMp : any = {
        DevMatPri_Id : idDevolucion,
        MatPri_Id : idMp,
        Tinta_Id : idTinta,
        DtDevMatPri_CantidadDevuelta : cantidad,
        UndMed_Id : undMed,
        Proceso_Id : proceso,
      }
        this.devolucionMPService.srvGuardar(datosDevolucionMp).subscribe(datos_recuperadoMpCreada => {
          /* BUSCA EN LA TABLA DE ASIGNACIONES LA OT QUE ESTÁ DEVOLVIENDO MATERIA PRIMA Y LE RESTA LA CANTIDAD QUE SE ESTÁ DEVOLVIENDO
          AL REGISTRO DE ASIGNACION, EJEMPLO: SI SE DEVUELVEN 2KG DE UNA ASIGNACION QUE TENIA 3KG, EL REGISTRO DE ESTA ASIGNACION AHORA
          SERÁ DE 1KG
          this.asignacionService.srvObtenerListaPorOt(ot).subscribe(datos_asignacion => {
            for (let i = 0; i < datos_asignacion.length; i++) {
              this.asignacionMPService.srvObtenerListaPorId(datos_asignacion[i].asigMp_Id, this.ArrayMateriaPrima[index].Id).subscribe(datos_asignacionMP => {
                for (let j = 0; j < datos_asignacionMP.length; j++) {
                  let cantidad : number = datos_asignacionMP[j].dtAsigMp_Cantidad - cantidadMateriaPrima;
                  const data : any = {
                    AsigMp_Id : datos_asignacion[i].asigMp_Id,
                    MatPri_Id : this.ArrayMateriaPrima[index].Id,
                    DtAsigMp_Cantidad : cantidad,
                    UndMed_Id : presentacionMateriaPrima,
                    Proceso_Id : 'EXT',
                  }
                  this.asignacionMPService.srvActualizar(datos_asignacion[i].asigMp_Id, this.ArrayMateriaPrima[index].Id, data).subscribe(datos_asignacionMPActualizada =>{
                  });
                }
              });
            }
          });*/
        });
    }
  }

  //Funcion que moverá el inventario de materia prima con base a la materia prima entrante
  moverInventarioMpAgregada(){
    let stockMateriaPrimaInicial : number;
    let stockMateriaPrimaFinal : number;

    for (let index = 0; index < this.ArrayMateriaPrima.length; index++) {

      this.materiaPrimaService.srvObtenerListaPorId(this.ArrayMateriaPrima[index].MatPrima).subscribe(datos_materiaPrima => {
        stockMateriaPrimaInicial = datos_materiaPrima.matPri_Stock;

        if(this.ArrayMateriaPrima[index].Materia_Prima == 84) stockMateriaPrimaFinal = 0
        else stockMateriaPrimaFinal = stockMateriaPrimaInicial + this.ArrayMateriaPrima[index].Cant;

        const datosMP : any = {
          MatPri_Id : this.ArrayMateriaPrima[index].MatPrima,
          MatPri_Nombre : datos_materiaPrima.matPri_Nombre,
          MatPri_Descripcion : datos_materiaPrima.matPri_Descripcion,
          MatPri_Stock : stockMateriaPrimaFinal,
          UndMed_Id : datos_materiaPrima.undMed_Id,
          CatMP_Id : datos_materiaPrima.catMP_Id,
          MatPri_Precio : datos_materiaPrima.matPri_Precio,
          TpBod_Id : datos_materiaPrima.tpBod_Id,
        }
        this.materiaPrimaService.srvActualizar(this.ArrayMateriaPrima[index].MatPrima, datosMP).subscribe(datos_mp_creada => {
          /*const Toast = Swal.mixin({
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
            title: '¡Registro De Materia Prima Devuelta Creado Con Exito!'
          });
          this.limpiarTodosCampos();*/
        });
      });
    }
  }

  moverInventarioTintas() {
    let stockMateriaPrimaInicial : number;
    let stockMateriaPrimaFinal : number;

    for (let index = 0; index < this.ArrayMateriaPrima.length; index++) {

      this.servicioTintas.srvObtenerListaPorId(this.ArrayMateriaPrima[index].Tinta).subscribe(datos_tinta => {
        stockMateriaPrimaInicial = datos_tinta.tinta_Stock;

        if(this.ArrayMateriaPrima[index].Tinta == 2001) stockMateriaPrimaFinal = 0
        else stockMateriaPrimaFinal = stockMateriaPrimaInicial + this.ArrayMateriaPrima[index].Cant;

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
        console.log(this.ArrayMateriaPrima[index].Tinta);
        this.servicioTintas.srvActualizar(this.ArrayMateriaPrima[index].Tinta, datosTintaActualizada).subscribe(datos_mp_creada => {
          this.mensajeRegistroExitoso();
        });
      });
    }
  }

  /** Mostrar mensaje de confirmación de registro exitoso */
  mensajeRegistroExitoso() {
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
      title: '¡Registro de devolución de Materia Prima creado con éxito!'
    });
  }

  /** Limpiar todos los campos al momento de terminar la devolución. */
  limpiarTodosCampos(){
    this.cargando = true;
    this.FormMateriaPrimaRecuperada.setValue({
      ot : '',
      MpingresoFecha: this.today,
      MpObservacion : '',
    });
    this.FormMateriaPrima.reset();
    this.ArrayMateriaPrima = [];
  }

  // Función para quitar un producto de la tabla
  QuitarProductoTabla(index : number, formulario : any) {
    Swal.fire({
      title: '¿Está seguro de eliminar la Materia Prima de la Devolución?',
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
    //this.categoriaMPBuscadaID = '';
    //this.tipobodegaMPBuscadaId = '';
    /*this.materiaPrimaService.srvObtenerListaPorId(idMateriaPrima).subscribe(datos_materiaPrima => {
      this.categoriMpService.srvObtenerListaPorId(datos_materiaPrima.catMP_Id).subscribe(datos_categoria => {
        this.tipoBodegaService.srvObtenerListaPorId(datos_materiaPrima.tpBod_Id).subscribe(datos_bodega => {
          this.materiaPrimaSeleccionada.push(datos_materiaPrima);
          this.materiasPrimas.push(datos_materiaPrima);
          this.categoriaMPBuscadaID = datos_categoria.catMP_Nombre;
          this.tipobodegaMPBuscadaId = datos_bodega.tpBod_Nombre;
          this.cargarInfoMP();
        });
      });
    });*/

    this.materiaPrimaService.getMatPrimasConTintasxId(idMateriaPrima).subscribe(dataMPTintas => {
      for (let index = 0; index < dataMPTintas.length; index++) {
        let info : any = {
          IdReal : 0,
          IdNoAplica : 0,
          IdMatPrima : dataMPTintas[index].id,
          Nombre : dataMPTintas[index].nombre,
          Presentacion : dataMPTintas[index].medida,
        }
        if (info.IdMatPrima > 2000) { info.IdReal = info.IdMatPrima; info.IdNoAplica = 84 }
        else { info.IdReal = info.IdMatPrima; info.IdNoAplica = 2001 }

        this.materiaPrimaSeleccionada.push(info);
      }

      if(this.materiaPrimaSeleccionada.length == 0){
        this.limpiarCamposMP();
        Swal.fire('No se encontró la materia prima consultada.');
      } else {
        this.tituloCampoMP = '';
        this.cargarInfoMP();
      }
    });

  }

  //Funcion que consultara una materia prima con base a la que está seleccionada en la vista
  buscarMpSeleccionada(item){
    this.validarInput = false;
    this.FormMateriaPrima.value.MpNombre = item.name;
    let nombreMateriaPrima : string = this.FormMateriaPrima.value.MpNombre;
    let idMateriaPrima : number; //En el HTML se pasará el nombre de la materia prima pero el input tendrá como valor el Id de la materia prima
    this.materiaPrimaSeleccionada = [];

    /*this.materiaPrimaService.srvObtenerLista().subscribe(datos_materiasPrimas => {
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
    });*/

    this.materiaPrimaService.getMatPrimasConTintas().subscribe(dataMPTintas => {
      for (let index = 0; index < dataMPTintas.length; index++) {
        if(nombreMateriaPrima == dataMPTintas[index].nombre) {
          let info : any = {
            IdReal : 0,
            IdNoAplica : 0,
            IdMatPrima : dataMPTintas[index].id,
            Nombre : dataMPTintas[index].nombre,
            Presentacion : dataMPTintas[index].medida,
          }
          info.IdReal = info.IdMatPrima;
          this.materiaPrimaSeleccionada.push(info);
        }
      }
      this.tituloCampoMP = '';
      this.cargarInfoMP();
    });

  }

  //Funcion que llenará la infomacion de materia prima buscada o seleccionada y pasará la informacion a la vista
  cargarInfoMP(){
    for (const Mp of this.materiaPrimaSeleccionada) {
      this.FormMateriaPrima.setValue({
        MpId : Mp.IdReal,
        MpNombre: Mp.Nombre,
        MpCantidad: '',
        MpUnidadMedida : Mp.Presentacion,
        Proceso : '',
      });
    }
  }

}

