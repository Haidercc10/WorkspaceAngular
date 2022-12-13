import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { modelDtMantenimiento } from 'src/app/Modelo/modelDtMantenimiento';
import { modelMantenimiento } from 'src/app/Modelo/modelMantenimiento';
import { DetallePedido_MantenimientoService } from 'src/app/Servicios/DetallePedido_Mantenimiento/DetallePedido_Mantenimiento.service';
import { Detalle_MantenimientoService } from 'src/app/Servicios/Detalle_Mantenimiento/Detalle_Mantenimiento.service';
import { MantenimientoService } from 'src/app/Servicios/Mantenimiento/Mantenimiento.service';
import { SrvPedido_MttoService } from 'src/app/Servicios/Pedido_Mtto/srvPedido_Mtto.service';
import { RolesService } from 'src/app/Servicios/Roles/roles.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-Mantenimiento_Camiones',
  templateUrl: './Mantenimiento_Camiones.component.html',
  styleUrls: ['./Mantenimiento_Camiones.component.css']
})
export class Mantenimiento_CamionesComponent implements OnInit {

  public formConsultarPedidoMtto !: FormGroup;
  public formPedidoCompletado !: FormGroup;
  public cargando : boolean = true;
  public arrayPedido : any = [];
  public modal : boolean = false;
  public arrayDetallePedido : any = [];
  today : any = moment().format('YYYY-MM-DD');  //Variable que se usará para llenar la fecha actual
  hora : any = moment().format("H:mm:ss"); //Variable que almacenará la hora
  storage_Id : any;
  storage_Nombre : any;
  ValidarRol: any;
  storage_Rol : any;
  numeroPedido : number;
  modalEditarMtto : boolean = false;


  constructor(private frmBuilder : FormBuilder,
    @Inject(SESSION_STORAGE) private storage: WebStorageService,
    private servicioPedidoMtto : SrvPedido_MttoService,
    private servicioDetPedMtto : DetallePedido_MantenimientoService,
    private rolService : RolesService,
    private servicioMtto : MantenimientoService,
    private servicioDetMtto : Detalle_MantenimientoService,
    ) {
    this.inicializarFormulario();
    this.inicializarFormulario2();
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

  /** Inicializar formulario de consulta de pedidos  */
  inicializarFormulario(){
    this.formConsultarPedidoMtto = this.frmBuilder.group({
      idPedido : [null, Validators.required]
    });
  }

  /** Inicializar formulario que estará cargado en el modal al momento de consultar un pedido*/
  inicializarFormulario2(){
    this.formPedidoCompletado = this.frmBuilder.group({
      pedFecha : [null],
      pedHora: [null],
      pedUsuario: [null],
      pedEstado: [null],
      pedObservacion : [null]
    });
  }

  inicializarFormularioMtto() {

  }

  /** Consultar pedidos de mantenimiento por parte de mecanicos */
  consultarPedido(){
    let pedido : number = this.formConsultarPedidoMtto.value.idPedido;

    if(pedido != null){
      this.servicioPedidoMtto.getPedidoMtto(pedido).subscribe(data_Pedido => {
        if(data_Pedido.length == 0){
          this.advertenciaPedidoNoEncontrado(pedido);
        } else {
          for (let index = 0; index < data_Pedido.length; index++) {
            this.cargarTablaInicialPedido(data_Pedido[index]);
          }
        }
      });
    } else {
      this.advertenciaCamposVacios();
    }
  }

  /** Mensaje de advertencia campos vacios */
  advertenciaCamposVacios() {
    Swal.fire({icon: 'warning',  title: 'Advertencia', text: `Debe diligenciar el campo ID Pedido`, confirmButtonColor: '#ffc107', });
  }

  /** Mensaje de advertencia para pedidos no encontrados */
  advertenciaPedidoNoEncontrado(id : any) {
    Swal.fire({icon: 'warning',  title: 'Advertencia', text: `No se encontró el pedido ${id}`, confirmButtonColor: '#ffc107', });
  }

  /** Información que se cargará en la tabla luego de realizar la consulta.  */
  cargarTablaInicialPedido(datos : any) {
    this.arrayPedido = [];
    const info : any = {
      pedidoId : datos.pedMtto_Id,
      fecha : datos.pedMtto_Fecha.replace('T00:00:00', ''),
      hora : datos.pedMtto_Hora,
      usuario : datos.usua_Nombre,
      estado : datos.estado_Nombre,
      observacion : datos.pedMtto_Observacion,
    }
    this.arrayPedido.push(info);
    console.log(this.arrayPedido);
  }

   /** Cargar modal con la información detallada del pedido */
   cargarModalDetallesPedido(item : any){
    this.modal = true;
    this.numeroPedido = 0;

    this.cargarEncabezadoPedidoModal(item);
    this.numeroPedido = item.pedidoId;

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

      const encabezado : modelMantenimiento = {
        PedMtto_Id: idPedido,
        Prov_Id: 800188732,
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
          DtMtto_Descripcion: ''
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
    }, 1000);
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

    limpiarCampos(){
      this.formConsultarPedidoMtto.reset();
      this.formPedidoCompletado.reset();
      this.numeroPedido = 0;
      this.arrayDetallePedido =[];
      this.arrayPedido =[];
    }

    limpiarCampoPedido(){
      this.formConsultarPedidoMtto.reset();
    }

    consultarPedidoEnMtto(item : any){
      this.servicioMtto.GetPedidoAceptado(item.pedidoId).subscribe(dataPedAceptado => {
        if(dataPedAceptado.length != 0) {
          this.modalEditarMtto = true;
          for (let index = 0; index < dataPedAceptado.length; index++) {
            this.cargarMantenimiento(dataPedAceptado[index]);
          }
        } else {
          this.cargarModalDetallesPedido(item);
        }
      });
    }

    cargarMantenimiento(datosMtto : any){

    }
}
