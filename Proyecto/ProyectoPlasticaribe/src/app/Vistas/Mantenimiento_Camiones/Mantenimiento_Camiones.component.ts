
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { MessageService } from 'primeng/api';
import { modelDtMantenimiento } from 'src/app/Modelo/modelDtMantenimiento';
import { modelMantenimiento } from 'src/app/Modelo/modelMantenimiento';
import { DetallePedido_MantenimientoService } from 'src/app/Servicios/DetallePedido_Mantenimiento/DetallePedido_Mantenimiento.service';
import { Detalle_MantenimientoService } from 'src/app/Servicios/Detalle_Mantenimiento/Detalle_Mantenimiento.service';
import { EstadosService } from 'src/app/Servicios/Estados/estados.service';
import { MantenimientoService } from 'src/app/Servicios/Mantenimiento/Mantenimiento.service';
import { SrvPedido_MttoService } from 'src/app/Servicios/Pedido_Mtto/srvPedido_Mtto.service';
import { ProveedorService } from 'src/app/Servicios/Proveedor/proveedor.service';
import { RolesService } from 'src/app/Servicios/Roles/roles.service';
import Swal from 'sweetalert2';
import {ToastModule} from 'primeng/toast';

@Component({
  selector: 'app-Mantenimiento_Camiones',
  templateUrl: './Mantenimiento_Camiones.component.html',
  styleUrls: ['./Mantenimiento_Camiones.component.css']
})
export class Mantenimiento_CamionesComponent implements OnInit {

  public formConsultarPedidoMtto !: FormGroup; /** Formulario de consulta inicial */
  public formPedidoCompletado !: FormGroup; /** Formulario de campos de pedido al cargar el modal */
  public formMantenimiento !: FormGroup; /**  Formulario de campos de mantenimiento al cargar el modal */
  public cargando : boolean = true; /** Variable booleana usada para mostrar la carga al realizar una acción de consulta a Base de datos. */
  public arrayPedido : any = []; /** Array que se mostrará al momento de consltar en los filtros iniciales */
  public modal : boolean = false; /** Variable que mostrará/ocultará el modal. */
  public arrayDetallePedido : any = []; /** Array que cargara los detalles del pedido en el modal. */
  today : any = moment().format('YYYY-MM-DD');  //Variable que se usará para llenar la fecha actual
  hora : any = moment().format("H:mm:ss"); //Variable que almacenará la hora
  storage_Id : any; /** Variable que mostrará el ID del usuario logueado */
  storage_Nombre : any; /** Variable que mostrará el nombre del usuario logueado  */
  ValidarRol: any;  /** Variable que mostrará el rol del usuario logueado  */
  storage_Rol : any;
  numeroPedido : number; /** variable que mostrará el numero del pedido */
  pedido : boolean = false; /** Variable booleana que mostrará el modal de pedido o no. */
  public arrayDetalleMtto : any =[]; /** Array que cargará los detalles del mantenimiento en el modal. */
  public arrayProveedores : any =[];  /** Array que cargará los proveedores en el modal. */
  public arrayEstados : any = []; /** Array que cargará los estados la tabla de la vista. */
  public precioTotalMtto : number = 0; /** Variable que mostrará el precio total del mantenimiento */
  public PedMtto : string = '' /** Variable que mostrará pedido o mantenimiento en el encabezado del modal */

  constructor(private frmBuilder : FormBuilder,
    @Inject(SESSION_STORAGE) private storage: WebStorageService,
    private servicioPedidoMtto : SrvPedido_MttoService,
    private servicioDetPedMtto : DetallePedido_MantenimientoService,
    private rolService : RolesService,
    private servicioMtto : MantenimientoService,
    private servicioDetMtto : Detalle_MantenimientoService,
    private servicioProveedores : ProveedorService,
    private servicioEstados : EstadosService,
    private messageService: MessageService,
    ) {
    this.inicializarFormulario();
    this.inicializarFormulario2();
    this.inicializarFormularioMtto();
   }

  ngOnInit() {
    this.lecturaStorage();
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

  /** cargar la información de los proveedores al momento de llamar el modal */
  getProveedores(){
    this.servicioProveedores.srvObtenerLista().subscribe(dataProveedores => {
      for (let index = 0; index < dataProveedores.length; index++) {
        this.arrayProveedores.push(dataProveedores[index]);
      }
    });
  }


  /** Cargar Inicialmente los estados del pedido/Mantenimiento */
  getEstados(){
    this.servicioEstados.srvObtenerListaEstados().subscribe(dataEstados => {
      for (let index = 0; index < dataEstados.length; index++) {
        if(dataEstados[index].estado_Id == 11 || dataEstados[index].estado_Id == 16 || dataEstados[index].estado_Id == 17)
        this.arrayEstados.push(dataEstados[index].estado_Nombre);
      }
    });
  }

  /** Inicializar formulario de consulta de pedidos  */
  inicializarFormulario(){
    this.formConsultarPedidoMtto = this.frmBuilder.group({
      idPedido : [null, Validators.required],
      idMtto : [null],
      tipoMov: [null],
      fechaInicio: [null],
      fechaFin: [null],
    });
  }

  /** Inicializar formulario de mantenimiento que estará cargado en el modal al momento de consultar*/
  inicializarFormularioMtto(){
    this.formMantenimiento = this.frmBuilder.group({
      mttoId : [null],
      mttoProveedor : [null],
      mttoFecha: [null],
      mttoEstado: [null],
      mttoUsuario: [null],
      mttoObservacion : [null]
    });
  }

  /** Inicializar Formulario de pedidos que estará cargado en el modal al momento de consultar */
  inicializarFormulario2() {
    this.formPedidoCompletado = this.frmBuilder.group({
      pedFecha : [null],
      pedHora: [null],
      pedUsuario: [null],
      pedEstado: [null],
      pedObservacion : [null],
      proveedor : [null, Validators.required]
    });
  }

  /** Consultar pedidos / mantenimientos */
  consultar(){
    this.cargando = false;
    let pedido : number = this.formConsultarPedidoMtto.value.idPedido;
    let mtto : number = this.formConsultarPedidoMtto.value.idMtto;
    let tipoMov : string = this.formConsultarPedidoMtto.value.tipoMov;
    let fechaInicio : any = this.formConsultarPedidoMtto.value.fechaInicio;
    let fechaFin : any = this.formConsultarPedidoMtto.value.fechaFin;
    let ruta : string = ``;
    this.arrayPedido = [];

    if(fechaInicio == null) fechaInicio = this.today;
    if(fechaFin == null) fechaFin = fechaInicio;
    if(pedido != null && mtto == null) mtto = -1;
    if(pedido == null && mtto != null) pedido = -1;

    if (pedido != null && mtto != null &&  tipoMov != null && fechaInicio != null && fechaFin != null ) { ruta = `?consecutivo=${pedido}&consecutivo2=${mtto}&tipoMov=${tipoMov}`
    } else if(pedido != null && mtto != null &&  tipoMov != null && fechaInicio != null) { ruta = ruta = `?consecutivo=${pedido}&consecutivo2=${mtto}&tipoMov=${tipoMov}`
    } else if(pedido != null &&  mtto != null && fechaInicio != null && fechaFin != null) { ruta = `?consecutivo=${pedido}&consecutivo2=${mtto}`
    } else if(pedido != null && tipoMov != null &&  fechaInicio != null && fechaFin != null) { ruta = `?consecutivo=${pedido}&tipoMov=${tipoMov}`
    } else if(mtto != null &&  tipoMov != null && fechaInicio != null && fechaFin != null) { ruta = `?consecutivo=${pedido}&tipoMov=${tipoMov}`
    } else if(pedido != null && mtto != null &&  tipoMov != null) { ruta = `?consecutivo=${pedido}&consecutivo2=${mtto}&tipoMov=${tipoMov}`
    } else if(pedido != null && mtto != null &&  fechaInicio != null) { ruta = `?consecutivo=${pedido}&consecutivo2=${mtto}`
    } else if(pedido != null && tipoMov != null &&  fechaInicio != null) { ruta = `?consecutivo=${pedido}&tipoMov=${tipoMov}`
    } else if(pedido != null && fechaInicio != null &&  fechaFin != null) { ruta = `?consecutivo=${pedido}`
    } else if(mtto != null && tipoMov != null &&  fechaInicio != null) { ruta = `?consecutivo=${pedido}&tipoMov=${tipoMov}`
    } else if(mtto != null && fechaInicio != null &&  fechaFin != null) { ruta = `?consecutivo2=${mtto}`
    } else if(tipoMov != null && fechaInicio != null &&  fechaFin != null) { ruta = `?tipoMov=${tipoMov}`
    } else if(fechaInicio != null &&  fechaFin != null) { ruta = ruta;
    } else if(tipoMov != null &&  fechaInicio != null) { ruta = `?tipoMov=${tipoMov}`
    } else if(mtto != null &&  fechaInicio != null) { ruta = `?consecutivo2=${mtto}`
    } else if(pedido != null && mtto != null) { ruta = `?consecutivo=${pedido}&consecutivo2=${mtto}`
    } else if(mtto != null && tipoMov != null) { ruta = `?consecutivo2=${mtto}&tipoMov=${tipoMov}`
    } else if(pedido != null && fechaInicio != null) { ruta = `?consecutivo=${pedido}`
    } else if(pedido != null && tipoMov != null) { ruta = `?consecutivo=${pedido}&tipoMov=${tipoMov}`
    } else if(tipoMov != null) {  ruta = `?tipoMov=${tipoMov}`
    }

    this.servicioMtto.GetPedido_Mantenimiento(fechaInicio, fechaFin, ruta).subscribe(dataPedMtto => {
      if(dataPedMtto.length == 0) this.advertenciaNoEncontrado(fechaInicio, fechaFin);
      else
      for (let index = 0; index < dataPedMtto.length; index++) {
        this.cargarTablaInicial(dataPedMtto[index])
      }
    });
    setTimeout(() => {this.cargando = true}, 1000);
  }

  /** Mensaje de advertencia campos vacios */
  advertenciaCamposVacios() {
    Swal.fire({icon: 'warning',  title: 'Advertencia', text: `Debe diligenciar el campo ID Pedido`, confirmButtonColor: '#ffc107', });
  }

  /** Mensaje de advertencia para pedidos no encontrados */
  advertenciaNoEncontrado(fecha1: any, fecha2 : any) {
    if(fecha1 == this.today) {
      setTimeout(() => { Swal.fire({icon: 'warning',  title: 'Advertencia', html: `¡No se encontraron resultados de búsqueda <br> del día de hoy!`, confirmButtonColor: '#ffc107', }); }, 950);
    } else if(fecha1 == this.today && fecha2 == this.today) {
      setTimeout(() => { Swal.fire({icon: 'warning',  title: 'Advertencia', html: `¡No se encontraron resultados de búsqueda <br> del día de hoy!`, confirmButtonColor: '#ffc107', }); }, 950);
    } else {
      setTimeout(() => { Swal.fire({icon: 'warning',  title: 'Advertencia', html: `¡No se encontraron resultados de búsqueda entre las fechas <b> ${fecha1} </b> y <b> ${fecha2} </b> !`, confirmButtonColor: '#ffc107', }); }, 950);
    }

  }

  /** Mensaje de advertencia para pedidos no encontrados */
  advertenciaTipoMovimiento() {
    Swal.fire({icon: 'warning',  title: 'Advertencia', text: `¡Debe especificar el tipo de movimiento!`, confirmButtonColor: '#ffc107', });
  }

  /** Información que se cargará en la tabla inicial luego de realizar la consulta.  */
  cargarTablaInicial(datos : any) {
    const info : any = {
      pedidoId : datos.id_Movimiento,
      tipoMov : datos.tipo_Movimiento,
      fecha : datos.fecha.replace('T00:00:00', ''),
      hora : datos.hora,
      usuario : datos.usuario,
      estado : datos.estado,
      observacion : datos.observacion,
    }
    this.arrayPedido.push(info);
  }

   /** Cargar modal con la información detallada del pedido */
   cargarModalDetallesPedido(item : any){
    this.pedido = true;
    this.arrayProveedores=[];
    this.getProveedores();

    this.cargarEncabezadoPedidoModal(item);
    this.servicioDetPedMtto.GetPedidoxId(item.pedidoId).subscribe(dataDetPedido => {
      for (let index = 0; index < dataDetPedido.length; index++) {
        this.cargarDetallePedidoModal(dataDetPedido[index]);
      }
    });
  }

  /** Cargar detalle del pedido en la tabla alojada en el modal. */
  cargarDetallePedidoModal(datos : any){
    this.arrayDetallePedido =[];
    const info : any = {
      codigo : datos.dtPedMtto_Codigo,
      idActivo : datos.actv_Id,
      activo : datos.actv_Nombre,
      serial : datos.actv_Serial,
      idTipoMtto : datos.tpMtto_Id,
      tipoMtto : datos.tpMtto_Nombre,
      fechaFalla : datos.dtPedMtto_FechaFalla.replace('T00:00:00', ''),
    }
    this.arrayDetallePedido.push(info);
  }

  /** Cargar los campos del modal con la información del pedido */
  cargarEncabezadoPedidoModal(encabezado : any){
    this.formPedidoCompletado.setValue({
      pedFecha : encabezado.fecha,
      pedHora : encabezado.hora,
      pedUsuario: encabezado.usuario,
      pedEstado: encabezado.estado,
      proveedor: 800188732,
      pedObservacion: encabezado.observacion,
    });
  }

  /** Mensaje de advertencia si no hay proceso seleccionado */
  advertenciaAceptarPedido() {
    this.modal = false;
    Swal.fire({
      icon: 'warning',
      title: 'Advertencia',
      html: `¿Está seguro que desea aceptar el pedido de mantenimiento nro. <b>${this.numeroPedido}</b>?`,
      confirmButtonColor: '#ffc107',
      confirmButtonText: 'Si, Aceptar',
      cancelButtonText: `Cancelar`,
      showCancelButton : true,
    }).then((result) => {
      if (result.isConfirmed) this.guardarPedido(this.numeroPedido);
      else this.modal = true;
    });
  }

  /** Funcion que insertará en la base de datos el encabezado del mantenimiento. */
  guardarPedido(idPedido : any){
    this.modal = false;
    let idProveedor : any = this.formPedidoCompletado.value.proveedor;

    const encabezado : modelMantenimiento = {
      PedMtto_Id: idPedido,
      Prov_Id: idProveedor,
      Mtto_FechaInicio: this.today,
      Mtto_FechaFin: this.today,
      Mtto_PrecioTotal: 0,
      Estado_Id: 26,
      Mtto_Observacion: '',
      Mtto_CantDias: 0,
      Usua_Id: this.storage_Id,
      Mtto_FechaRegistro: this.today,
      Mtto_HoraRegistro: this.hora
    }
      this.servicioMtto.Insert(encabezado).subscribe(dataMtto => {
        this.servicioMtto.GetUltimoId().subscribe(dataUltimoMtto => { this.guardarDetallePedido(dataMtto.mtto_Id); });
      }, error => { this.mensajeErrorEncabezado(); });
  }

  /** Funcion que insertará en la base de datos los del mantenimiento. */
  guardarDetallePedido(idMantenimiento : any){
    for (let index = 0; index < this.arrayDetallePedido.length; index++) {
      const detallePedido : modelDtMantenimiento = {
        Mtto_Id: idMantenimiento,
        Actv_Id: this.arrayDetallePedido[index].idActivo,
        TpMtto_Id: this.arrayDetallePedido[index].idTipoMtto,
        DtMtto_Precio: 0,
        DtMtto_Descripcion: '',
        Estado_Id : 11
      }
      this.servicioDetMtto.Insert(detallePedido).subscribe(data_DetalleMtto => { }, error => { this.mensajeErrorDetalle(); })
    }
    this.mensajeConfirmacion();
    this.limpiarCampoPedido();
  }

 /** Mensaje luego de haber cargado la información de los rollos a la BD de manera exitosa. */
  mensajeConfirmacion() {
    this.cargando = false
    setTimeout(() => {
      this.cargando = true;
      Swal.fire({icon: 'success', title: 'Confirmación', text: '¡Entrada de mantenimiento aceptada con éxito!', showConfirmButton: false, timer: 2000 });
    }, 500);
  }

    /**  Si existe algún problema al momento de generar el detalle del pedido a la BD se mostrará un mensaje de error*/
  mensajeErrorDetalle(){
    Swal.fire({
      icon : 'error',
      title : 'Error',
      html : '<b>¡No fue posible generar el detalle del mantenimiento!</b>',
      position: 'center',
      showConfirmButton: false,
      timer: 2000,
    });
    this.cargando = true;
  }

  /** Si existe algún problema al momento de guardar el encabezado a la BD se mostrará un mensaje de error  */
  mensajeErrorEncabezado(){
      Swal.fire({
        icon : 'error',
        title : 'Error',
        html : '<b>¡No fue posible guardar el encabezado del mantenimiento!</b>',
        position: 'center',
        showConfirmButton: false,
        timer: 2000,
      });
      this.cargando = true;
  }

  /** Limpiar todos los campos */
  limpiarCampos(){
      this.formConsultarPedidoMtto.reset();
      this.formPedidoCompletado.reset();
      this.numeroPedido = 0;
      this.arrayDetallePedido =[];
      this.arrayPedido =[];
  }

    /** Limpiar campos de la consulta inicial */
  limpiarCampoPedido(){
      this.formConsultarPedidoMtto.reset();
  }

  /** Consultar el id del pedido en la tabla de mantenimientos, si está allí cargará en el modal
    la info del mantenimiento asociado a ese pedido, sino solo cargará la info del pedido **/
  consultarPedidoEnMtto(item : any){
      this.numeroPedido = 0;

      this.modal = true;
      this.cargando = false;
      this.numeroPedido = item.pedidoId;

      if(item.tipoMov == 'Mantenimiento') {
        this.servicioMtto.GetMantenimientoxId(item.pedidoId).subscribe(dataMtto => {
          for (let index = 0; index < dataMtto.length; index++) {
            this.cargarMantenimiento(dataMtto[index]);
            this.PedMtto = 'Mantenimiento';
          }
        });
      } else if (item.tipoMov == 'Pedido de Mantenimiento') {

        this.servicioMtto.GetPedidoAceptado(item.pedidoId).subscribe(dataPedAceptado => {
          if(dataPedAceptado.length == 0) {
            this.cargarModalDetallesPedido(item);
            this.PedMtto = 'Pedido';
          } else {
            for (let index = 0; index < dataPedAceptado.length; index++) {
              this.cargarMantenimiento(dataPedAceptado[index]);
              this.PedMtto = 'Pedido';
            }
          }
        });

      }
      setTimeout(() => {this.cargando = true; }, 500);
  }

  /** Cargar encabezado/Detalle del mantenimiento en los campos del modal */
  cargarMantenimiento(datosMtto : any){
      this.pedido = false;
      this.arrayProveedores =[];
      this.arrayEstados =[];

      this.getProveedores();
      this.getEstados();

      const encabezadoMtto : any = {
        idMtto : datosMtto.mtto_Id,
        idPedido : datosMtto.pedMtto_Id,
        idProveedor : datosMtto.prov_Id,
        proveedor : datosMtto.prov_Nombre,
        idUsuario : datosMtto.usua_Id,
        usuario : datosMtto.usua_Nombre,
        idEstado : datosMtto.estado_Id,
        estado : datosMtto.estado_Nombre,
        fechaInicial : datosMtto.mtto_FechaInicio.replace('T00:00:00', ''),
        observacion : datosMtto.mtto_Observacion
      }
      this.cargarEncabezadoMttoModal(encabezadoMtto);
      this.obtenerDetalleMantenimiento(encabezadoMtto);
  }

  /** Cargar los campos del modal con la información del pedido */
  cargarEncabezadoMttoModal(encabezadoMto : any){
    this.formMantenimiento.setValue({
      mttoId : encabezadoMto.idMtto,
      mttoProveedor : encabezadoMto.idProveedor,
      mttoFecha: encabezadoMto.fechaInicial,
      mttoEstado: encabezadoMto.estado,
      mttoUsuario: encabezadoMto.usuario,
      mttoObservacion : encabezadoMto.observacion
    });
  }

  /** buscar detalle de mantenimiento por Id de pedido para cargar los datos encontrados en el modal */
  obtenerDetalleMantenimiento(item) {
    this.arrayDetalleMtto = [];
    this.precioTotalMtto = 0;

    this.servicioDetMtto.getDetalleMtto(item.idPedido).subscribe(dataDetalleMtto => {
      for (let index = 0; index < dataDetalleMtto.length; index++) {
        this.cargarDetalleMttoModal(dataDetalleMtto[index]);
        this.precioTotalMtto += dataDetalleMtto[index].dtMtto_Precio;
      }
    })
  }

  /** Cargar tabla del detalle de mantenimiento en el modal */
  cargarDetalleMttoModal(detalleMto : any) {
    const detalle : any = {
      codigo : detalleMto.dtMtto_Codigo,
      idActivo : detalleMto.actv_Id,
      activo : detalleMto.actv_Nombre,
      serial : detalleMto.actv_Serial,
      idTipoMtto :detalleMto.tpMtto_Id,
      tipoMtto : detalleMto.tpMtto_Nombre,
      idEstado : detalleMto.estado_Id,
      estado : detalleMto.estado_Nombre,
      precioMtto : detalleMto.dtMtto_Precio,
      descripcionMtto : detalleMto.dtMtto_Descripcion
    }
    this.arrayDetalleMtto.push(detalle);
  }

  /** Obtener los datos del detalle del mantenimiento por codigo*/
  obtenerCodigoMantenimiento(item : any) {
    this.servicioDetMtto.getCodigoDetalleMtto(item.codigo).subscribe(dataDetalleMtto => {
      for (let index = 0; index < dataDetalleMtto.length; index++) {
        this.getDetalleMttoForUpdate(dataDetalleMtto[index], item.estado, item.precioMtto, item.descripcionMtto);
      }
    });
    this.obtenerPrecio(this.arrayDetalleMtto);
  }

  /** Obtener datos del detalle del mantenimiento por codigo y luego actualizarlo */
  getDetalleMttoForUpdate(detalle : any, estadoMtto : any, precioMtto : any, descripcionMtto : any){
    let estadoNuevo : number;

    if(estadoMtto == 'Pendiente') estadoNuevo = 11;
    else if(estadoMtto == 'En proceso') estadoNuevo = 16;
    else if(estadoMtto == 'Terminada') estadoNuevo = 17;

    const detalleMantenimiento : any = {
      DtMtto_Codigo : detalle.dtMtto_Codigo,
      Mtto_Id : detalle.mtto_Id,
      Actv_Id : detalle.actv_Id,
      TpMtto_Id : detalle.tpMtto_Id,
      Estado_Id : estadoNuevo,
      DtMtto_Descripcion : descripcionMtto,
      DtMtto_Precio : precioMtto,
    }

    //this.obtenerPrecio(detalleMantenimiento.DtMtto_Precio);
    this.actualizarDetallexCodigo(detalleMantenimiento);
  }

  /** Actualizar campos estado y/o precio de la tabla de mantenimiento. */
  actualizarDetallexCodigo(detalleMtto : any){
    this.servicioDetMtto.Put(detalleMtto.DtMtto_Codigo, detalleMtto).subscribe(data => { this.mostrarConfirmacion(); setTimeout(() => { this.obtenerNuevoEstadoEncabezado(detalleMtto.Mtto_Id); }, 1000); }, error => { this.mostrarError(); });
  }

  /** Mostrar mensaje de confirmación al actualizar un estado/precio/descripcion de la tabla de detalles de mantenimiento */
  mostrarConfirmacion() {
    this.messageService.add({severity:'success', detail:'Registro actualizado con éxito!'});
  }

  /** Mostrar mensaje de error al actualizar un estado/precio/descripcion de la tabla de detalles de mantenimiento */
  mostrarError() {
    this.messageService.add({severity:'error', detail:'Error al actualizar el registro!'});
  }

  /** Obtener el ID del proveedor y la observación de un pedido */
  getProveedor_Observacion(){
    let identProveedor : number = this.formMantenimiento.value.mttoProveedor;
    let Observacion : number = this.formMantenimiento.value.mttoObservacion;

    this.servicioMtto.GetPedidoAceptado(this.numeroPedido).subscribe(dataMatto => {
      for (let index = 0; index < dataMatto.length; index++) {
        this.cargarDatosActualizarProveedor(dataMatto[index], identProveedor, Observacion);
      }
    });
  }

  /** cargar la data del pedido para actualizar el proveedor y la observación **/
  cargarDatosActualizarProveedor(datos : any, idProveedor : any, observacion : any){
    const encabezadoMtto : any = {
      Mtto_Id : datos.mtto_Id,
      PedMtto_Id : datos.pedMtto_Id,
      Prov_Id : idProveedor,
      Usua_Id : datos.usua_Id,
      Estado_Id : datos.estado_Id,
      Mtto_FechaInicio : datos.mtto_FechaInicio.replace('T00:00:00', ''),
      Mtto_FechaFin : datos.mtto_FechaFin.replace('T00:00:00', ''),
      Mtto_PrecioTotal :datos.mtto_PrecioTotal,
      Mtto_Observacion : observacion,
      Mtto_CantDias : datos.mtto_CantDias,
      Mtto_FechaRegistro :datos.mtto_FechaRegistro.replace('T00:00:00', ''),
      Mtto_HoraRegistro : datos.mtto_HoraRegistro
    }
    this.actualizarProveedor(encabezadoMtto);
  }

  /** Actualizar el proveedor al momento de realizar de hacer clic sobre un proveedor distinto al cargado inicialmente */
  actualizarProveedor(encabezadoMatto : any){
    this.servicioMtto.Put(encabezadoMatto.Mtto_Id, encabezadoMatto).subscribe(dataProv => { this.mostrarConfirmacion(); }, error => { this.mostrarError(); });
  }

  /** Actualizar precio total al momento de cambiar un precio de detalle */
  obtenerPrecio(datos : any){
    this.precioTotalMtto = 0;
    for (let index = 0; index < datos.length; index++) {
      this.precioTotalMtto += datos[index].precioMtto;
    }
  }

  /** Obtener el nuevo estado del mantenimiento al momento de actualizarlo en el detalle */
  obtenerNuevoEstadoEncabezado(item : any){
    this.servicioMtto.GetMantenimientoxId(item).subscribe(dataEstado => {
      for (let index = 0; index < dataEstado.length; index++) {
        this.cambiarEstadoEncabezado(dataEstado[index]);
      }
    });
  }

  /** Cambia Estado del Mantenimiento en los campos del encabezado*/
  cambiarEstadoEncabezado(encabezado){
    this.formMantenimiento.reset();
    this.formMantenimiento.patchValue({
      mttoId : encabezado.mtto_Id,
      mttoProveedor : encabezado.prov_Id,
      mttoFecha: encabezado.mtto_FechaInicio.replace('T00:00:00', ''),
      mttoEstado: encabezado.estado_Nombre,
      mttoUsuario: encabezado.usua_Nombre,
      mttoObservacion : encabezado.mtto_Observacion
    });
  }
}
