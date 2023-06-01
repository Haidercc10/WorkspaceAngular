import { Component, Injectable, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShepherdService } from 'angular-shepherd';
import moment from 'moment';
import pdfMake from 'pdfmake/build/pdfmake';
import { MessageService } from 'primeng/api';
import { ClientesService } from 'src/app/Servicios/Clientes/clientes.service';
import { ClientesProductosService } from 'src/app/Servicios/Clientes_Productos/ClientesProductos.service';
import { PedidoProductosService } from 'src/app/Servicios/DetallesPedidoProductos/pedidoProductos.service';
import { ExistenciasProductosService } from 'src/app/Servicios/ExistenciasProductos/existencias-productos.service';
import { InventarioZeusService } from 'src/app/Servicios/InventarioZeus/inventario-zeus.service';
import { OpedidoproductoService } from 'src/app/Servicios/PedidosProductos/opedidoproducto.service';
import { ProductoService } from 'src/app/Servicios/Productos/producto.service';
import { SedeClienteService } from 'src/app/Servicios/SedeCliente/sede-cliente.service';
import { UnidadMedidaService } from 'src/app/Servicios/UnidadMedida/unidad-medida.service';
import { UsuarioService } from 'src/app/Servicios/Usuarios/usuario.service';
import { ZeusContabilidadService } from 'src/app/Servicios/Zeus_Contabilidad/zeusContabilidad.service';
import { AppComponent } from 'src/app/app.component';
import { defaultStepOptions, stepsCrearPedidos as defaultSteps } from 'src/app/data';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';
import { ReportePedidos_ZeusComponent } from '../ReportePedidos_Zeus/ReportePedidos_Zeus.component';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-Pedido-Externo',
  templateUrl: './Pedido-Externo.component.html',
  styleUrls: ['./Pedido-Externo.component.css']
})

export class PedidoExternoComponent implements OnInit {

  @ViewChild(ReportePedidos_ZeusComponent) modalReporte_PedidosVendedoresComponent : ReportePedidos_ZeusComponent;

  public FormPedidoExternoClientes !: FormGroup; //Formulario de pedidos cliente
  public FormPedidoExternoProductos!: FormGroup; //Formuladio de pedidos productos
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  cargando : boolean = false; //Variable que va a servir para mostrar o no la imagen de carga
  Ide : number | undefined; //Variable para almacenar el ID del producto que está en la tabla y se va a editar
  id_pedido : number; //Variable que almacenará el ID del pedido que se va a mostrar
  ModalCrearProductos: boolean = false; //Funcion que va a mostrar o no el modal de productos
  ModalCrearCliente: boolean = false; //Funcion que va a mostrar o no el modal de clientes
  ModalSedesClientes: boolean = false; //Funcion que va a mostrar o no el modal de sedes clientes
  clientesSeleccionar : any [] = []; //Variable que almacenará la información de los clientes que pueden ser buscados por el vendedor
  cliente = []; //Variable que almacenará los clientes que estan siendo buscado por el vendedor
  sedeCliente:any=[]; //Varieble que almacenará las direcciones de las sedes de los cliente
  ciudad :any=[]; //Variable que almacenará las ciudades de los clientes
  usuarioVendedor=[]; //Variable que almacenara los nombres de los usuarios vendedores
  producto=[]; //Varibale que gusradará los productos dependiendo del cliente seleccionado
  presentacion = []; //Variable que almacenará la presentacion de unproducto consultado
  usuarioVende=[] //Variable que almacenará la informacion del vendedor de el cliente seleccionado
  pedidosProductos = []; //Variable que se va a almacenar los pedidos consultados
  ArrayProducto : any [] = []; //Variable que tendrá la informacion de los productos que se piden en el nuevo pedido
  valorTotal : number = 0; //Variable que guardará el valor total del pedido
  descuento : number = 0; //Variable que guardará el valor en porcentaje del descuento hecho al cliente
  valorMenosDescuento : number = 0; //Variable que tendrá el valor del de la venta menos el descuento
  iva : number = 0; //Variable que gusrdará la cantidad de iva sobre la venta
  valorMenosIva : number = 0; //Variable que tendrá el valor del de la venta menos el iva
  valorfinal : number = 0; //VAlor final menos em iva y el descuento
  productoEliminado : number; //Variable que tendrá el id de un producto que se va a eliminar de la base de datos o de un pedido nuevo
  ultimoPrecio : number = 0; //Variable que almacenará el ultimo precio por el que se facturó un producto
  checked = true; //Variable que va a almancenar la información de si el pedido lleva iva o no
  productosPedidos : any [] = []; //Variable que se llenará con la información de los productos que se enviaron a la base de datos, los productos serán del ultimo pedido creado
  modalMode : boolean = false; //Variable que será true cuando el componente esté apareciendo en un modal
  pedidoEditar : number = 0; //Variable que alamcenará el numero el pedido que se está editando
  fechaUltFacuracion : any; //Variable que mostrará la fecha de la ultima facturacion de un producto seleccionado
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  arrBirds = [];

  constructor(private pedidoproductoService : OpedidoproductoService,
                private productosServices : ProductoService,
                  private clientesService :ClientesService,
                    private sedesClientesService: SedeClienteService,
                      private usuarioService: UsuarioService,
                        private unidadMedidaService : UnidadMedidaService,
                          private frmBuilderPedExterno : FormBuilder,
                            private existenciasProductosServices : ExistenciasProductosService,
                              private PedidoProductosService : PedidoProductosService,
                                private AppComponent : AppComponent,
                                  private ClientesProductosService : ClientesProductosService,
                                    private zeusService : InventarioZeusService,
                                      private zeusCobtabilidadService : ZeusContabilidadService,
                                        private messageService: MessageService,
                                          private shepherdService: ShepherdService,
                                            private mensajeService : MensajesAplicacionService,) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
    //Campos que vienen del formulario
    this.FormPedidoExternoClientes = this.frmBuilderPedExterno.group({
      PedClienteId: [null, Validators.required],
      PedClienteNombre: [null, Validators.required],
      PedSedeCli_Id: [null, Validators.required],
      ciudad_sede: [null, Validators.required],
      PedUsuarioId: [null, Validators.required],
      PedUsuarioNombre: [null, Validators.required],
      PedFechaEnt: this.today,
      PedEstadoId: 11,
      PedObservacion: '',
      PedDescuento : 0,
      PedIva : 0,
    });

    //Datos para la tabla de productos.
    this.FormPedidoExternoProductos = this.frmBuilderPedExterno.group({
       ProdId: [null, Validators.required],
       ProdNombre: [null, Validators.required],
       ProdCantidad: [null, Validators.required],
       ProdUnidadMedidaCant: [null, Validators.required],
       ProdPrecioUnd: [null, Validators.required],
       ProdUltFacturacion : [null, Validators.required],
       ProdStock: [null, Validators.required],
       ProdFechaEnt: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.lecturaStorage();
    this.checkboxIva();
    this.buscarClientes();
  }

  tutorial(){
    this.shepherdService.defaultStepOptions = defaultStepOptions;
    this.shepherdService.modal = true;
    this.shepherdService.confirmCancel = false;
    this.shepherdService.addSteps(defaultSteps);
    this.shepherdService.start();
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  // Funcion que va a dar un valor a la variable iva dependiendo de si fue seleccionada o no la casilla del iva
  checkboxIva(){
    if (this.checked) this.iva = 19;
    else {
      this.iva = 0;
      this.valorMenosIva = 0;
      this.valorfinal -= this.valorfinal;
    }
    this.ivaDescuento();
  }

  //Funcion que validar si cambia uno de los input se muestre la misma informacion en la parde abajo de la tabla
  ivaDescuento(){
    if (this.valorTotal == 0) {
      this.valorMenosDescuento = 0;
      this.valorMenosIva = 0;
      this.valorfinal = 0;
    } else {
      this.valorMenosDescuento = (this.valorTotal * this.descuento) / 100;
      this.valorMenosIva = (this.valorTotal * this.iva) / 100;
      this.valorfinal = this.valorTotal - this.valorMenosDescuento + this.valorMenosIva;
    }
  }

  //Cargar modal de crear producto
  LlamarModalCrearProducto = () => this.ModalCrearProductos = true;

  // Funcion para llamar el modal que crea clientes
  LlamarModalCrearCliente = () => this.ModalCrearCliente = true;

  // Funcion para limpiar los campos de el apartado de productos
  LimpiarCamposProductos = () => this.FormPedidoExternoProductos.reset();

  //Funcion que limpiará TODOS los campos de la vista de pedidos
  limpiarTodosCampos(){
    this.ArrayProducto = [];
    this.valorTotal = 0;
    this.descuento = 0;
    this.valorMenosDescuento = 0;
    this.iva = 19;
    this.valorMenosIva = 0;
    this.valorfinal = 0;
    this.pedidosProductos = [];
    this.FormPedidoExternoClientes.patchValue({
      PedClienteNombre: null,
      PedClienteId : null,
      PedSedeCli_Id: null,
      ciudad_sede: null,
      PedUsuarioNombre: null,
      PedUsuarioId : null,
      PedFechaEnt: this.today,
      PedEstadoId: 11,
      PedObservacion: null,
      PedDescuento : 0,
      PedIva : 0,
    });
    this.cargando = false;
    this.presentacion = [];
    this.productosPedidos = [];
    this.FormPedidoExternoProductos.reset();
  }

  // Funcion que va a buscar los posibles clientes a los que se les puede hacer el pedido de productos
  buscarClientes(){
    let nombre : string = this.FormPedidoExternoClientes.value.PedClienteNombre;
    if (nombre != null && nombre != '' && nombre != undefined && nombre.length > 3 && this.ValidarRol == 2){
      this.clientesService.GetClientesVendedores(this.storage_Id, nombre).subscribe(datos => this.cliente = datos);
    } else this.cliente = [];
    this.ValidarRol == 1 ? this.clientesService.srvObtenerListaPorEstado(1).subscribe(datos => this.cliente = datos) : null;
    setTimeout(() => this.cliente.sort((a,b) => a.cli_Nombre.localeCompare(b.cli_Nombre)), 500);
  }

  // Funcion que va a buscar el cliente seleccionado
  clienteSeleccionado(){
    let nombre : string = this.FormPedidoExternoClientes.value.PedClienteNombre;
    if (nombre != null && nombre != '' && nombre != undefined){
      this.clientesService.srvObtenerListaPorNombreCliente(nombre).subscribe(datos => {
        for (let i = 0; i < datos.length; i++) {
          this.FormPedidoExternoClientes.patchValue({
            PedClienteNombre: datos[i].cli_Nombre,
            PedClienteId : datos[i].cli_Id,
          });
          setTimeout(() => {
            this.ciudadClienteComboBox();
            this.productoCliente();
          }, 100);
        }
      });
    }
  }

  //Funcion para llenar las ciudades del cliente en donde tiene sedes
  ciudadClienteComboBox(){
    this.LimpiarCamposProductos();
    this.ciudad = [];
    this.sedeCliente=[];
    this.usuarioVende=[];
    let clienteBD: any = this.FormPedidoExternoClientes.value.PedClienteId;
    this.sedesClientesService.srvObtenerListaPorCliente(clienteBD).subscribe(datos_sedesClientes => {
      this.sedeCliente = datos_sedesClientes;
      for (let i = 0; i < datos_sedesClientes.length; i++) {
        this.ciudad.push(datos_sedesClientes[i].sedeCliente_Ciudad);
      }

      if (this.sedeCliente.length <= 1 ) {
        for (const item of this.sedeCliente) {
          this.sedeCliente = [];
          this.usuarioVende.push(item.usua_Nombre);
          this.sedeCliente.push(item.sedeCliente_Direccion);
          this.FormPedidoExternoClientes.patchValue({
            PedSedeCli_Id: item.sedeCliente_Direccion,
            ciudad_sede: item.sedeCliente_Ciudad,
            PedUsuarioNombre: item.usua_Nombre,
            PedUsuarioId: item.usua_Id,
          });
        }
        this.verificarCartera();
      } else {
        for (const item of this.sedeCliente) {
          this.usuarioVende.push(item.usua_Nombre);
          this.FormPedidoExternoClientes.patchValue({
            PedUsuarioNombre: item.usua_Nombre,
            PedUsuarioId: item.usua_Id,
          });
          break;
        }
        this.sedeCliente = [];
      }
    });
  }

  // Funcion que va a llenar el campo de direccion una vez se haya llenado el campo ciudad
  llenarDireccionCliente(){
    let cliente : number = this.FormPedidoExternoClientes.value.PedClienteId;
    let ciudad : string = this.FormPedidoExternoClientes.value.ciudad_sede;
    this.sedeCliente = [];
    this.sedesClientesService.GetDireccionesCliente(cliente, ciudad).subscribe(datos_sedesClientes => {
      for (let i = 0; i < datos_sedesClientes.length; i++) {
        this.sedeCliente.push(datos_sedesClientes[i].sedeCliente_Direccion);
      }
      setTimeout(() => {
        if (this.sedeCliente.length <= 1) {
          for (let i = 0; i < this.sedeCliente.length; i++) {
            this.FormPedidoExternoClientes.patchValue({ PedSedeCli_Id: datos_sedesClientes[i].sedeCliente_Direccion, });
            this.verificarCartera();
          }
        }
      }, 500);
    });
  }

  //Funcion que validará que la sede de cliente escogida no se encuentre reportada en cartera
  verificarCartera(){
    this.cargando = true;
    let direccionSede : string = this.FormPedidoExternoClientes.value.PedSedeCli_Id;
    let ciudad : string = this.FormPedidoExternoClientes.value.ciudad_sede;
    let clienteNombre : any = this.FormPedidoExternoClientes.value.PedClienteNombre;
    if (direccionSede != null && ciudad != null && clienteNombre != null) {
      this.sedesClientesService.srvObtenerListaPorClienteSede(clienteNombre, ciudad, direccionSede).subscribe(datos_sedeCliente => {
        if (datos_sedeCliente.lengrh == 0) !this.cargando;
        for (let j = 0; j < datos_sedeCliente.length; j++) {
          this.zeusCobtabilidadService.getVistasFavUsuario(datos_sedeCliente[j].sedeCli_CodBagPro).subscribe(datos => {
            if (datos.length == 0) this.cargando = false;
            for (let i = 0; i < datos.length; i++) {
              let fechaRadicado : any = datos[i].fecha_Radicado;
              if (datos[i].fecha_Radicado == null) fechaRadicado = datos[i].lapsO_DOC;
              let hoy = moment([moment().year(), moment().month(), moment().date()]);
              let fechaDocumento = moment([moment(fechaRadicado).year(), moment(fechaRadicado).month(), moment(fechaRadicado).date()]);
              if (hoy.diff(fechaDocumento, 'days') >= 70) {
                this.mensajeService.mensajeAdvertencia(`Advertencia`, `¡El cliente seleccionado tiene un reporte de ${this.formatonumeros(hoy.diff(fechaDocumento, 'days'))} días en cartera, por lo que no será posible crearle un pedido!`);
                this.limpiarTodosCampos();
                break;
              } else this.cargando = false;
            }
          }, error => {
            this.mensajeService.mensajeError(`Error`, `¡Error al consultar la cartera del cliente selecionado!`);
            this.limpiarTodosCampos();
          });
        }
      }, error => {
        this.mensajeService.mensajeError(`Error`, `¡Ocurrió un error al consultar el código del cliente seleccionado!`);
        this.cargando = false;
      });
    } else {
      this.mensajeService.mensajeAdvertencia(`Advertencia`, `¡Llene los campos "Cliente", "Ciudad" y "Dirección" para consultar la cartera del cliente!`);
      this.cargando = false;
    }
  }

  // Funcion para cargar los productos de un solo cliente
  productoCliente(){
    this.producto = [];
    this.ClientesProductosService.srvObtenerListaPorNombreCliente(this.FormPedidoExternoClientes.value.PedClienteId).subscribe(datos_clientesProductos => {
      for (let index = 0; index < datos_clientesProductos.length; index++) {
        this.productosServices.srvObtenerListaPorId(datos_clientesProductos[index].prod_Id).subscribe(datos_productos => this.producto.push(datos_productos));
      }
    });
  }

  //Funcion encargada de buscar un producto por el id del producto
  buscarProducto(){
    this.producto = [];
    this.presentacion = [];
    this.ultimoPrecio = 0;
    let idProducto : any = this.FormPedidoExternoProductos.value.ProdNombre;
    if (idProducto == null || idProducto == undefined || idProducto == '') this.productoCliente();

    this.zeusService.GetExistenciasArticulo(idProducto.toString()).subscribe(datos_existencis => {
      if (datos_existencis.length != 0) {
        for (let i = 0; i < datos_existencis.length; i++) {
          this.existenciasProductosServices.srvObtenerListaPorIdProducto(idProducto).subscribe(datos_producto => {
            for (let j = 0; j < datos_producto.length; j++) {
              this.zeusService.GetPrecioUltimoPrecioFacturado(idProducto.toString(), datos_producto[j].undMed_Id).subscribe(datos_productoPedido => {
                this.ultimoPrecio = datos_productoPedido.precioUnidad;
                this.fechaUltFacuracion = datos_productoPedido.fechaDocumento.replace('T00:00:00', '');
              });

              setTimeout(() => {
                this.presentacion.push(datos_producto[j].undMed_Id);
                this.FormPedidoExternoProductos.patchValue({
                  ProdId: datos_producto[j].prod_Id,
                  ProdNombre: datos_producto[j].prod_Nombre,
                  ProdUnidadMedidaCant: datos_producto[j].undMed_Id,
                  ProdPrecioUnd: datos_producto[j].exProd_PrecioVenta.toFixed(2),
                  ProdUltFacturacion: this.formatonumeros(this.ultimoPrecio.toFixed(2)),
                  ProdStock: this.formatonumeros(datos_existencis[i].existencias.toFixed(2)),
                });
              }, 100);
            }
          });
        }
      } else if (datos_existencis.length == 0) {
        this.unidadMedidaService.srvObtenerLista().subscribe(datos_undMed => {
          for (let index = 0; index < datos_undMed.length; index++) {
            this.presentacion.push(datos_undMed[index].undMed_Id);
          }
        });

        this.productosServices.srvObtenerListaPorIdProducto(idProducto).subscribe(datos_producto => {
          for (let i = 0; i < datos_producto.length; i++) {
            this.FormPedidoExternoProductos.patchValue({
              ProdId: datos_producto[i].prod_Id,
              ProdNombre: datos_producto[i].prod_Nombre,
              ProdUnidadMedidaCant: '',
              ProdPrecioUnd: 0,
              ProdUltFacturacion: this.ultimoPrecio,
              ProdStock: 0,
            });
          }
        });
      }
    });
  }

  //Funcion encargada de buscar un producto por el id del producto
  buscarProductoId(){
    let idProducto : number = this.FormPedidoExternoProductos.value.ProdId;
    if (idProducto == null || idProducto == undefined || idProducto == 0) this.productoCliente();
    this.zeusService.GetExistenciasArticulo(idProducto.toString()).subscribe(datos_existencis => {
      if (datos_existencis.length != 0) {
        for (let i = 0; i < datos_existencis.length; i++) {
          this.existenciasProductosServices.srvObtenerListaPorIdProducto(idProducto).subscribe(datos_producto => {
            for (let j = 0; j < datos_producto.length; j++) {
              this.zeusService.GetPrecioUltimoPrecioFacturado(idProducto.toString(), datos_producto[j].undMed_Id).subscribe(datos_productoPedido => {
                this.ultimoPrecio = datos_productoPedido.precioUnidad;
                this.fechaUltFacuracion = datos_productoPedido.fechaDocumento.replace('T00:00:00', '');
              });

              setTimeout(() => {
                this.presentacion.push(datos_producto[j].undMed_Id);
                this.FormPedidoExternoProductos.patchValue({
                  ProdId: datos_producto[j].prod_Id,
                  ProdNombre: datos_producto[j].prod_Nombre,
                  ProdUnidadMedidaCant: datos_producto[j].undMed_Id,
                  ProdPrecioUnd: datos_producto[j].exProd_PrecioVenta.toFixed(2),
                  ProdUltFacturacion: this.ultimoPrecio,
                  ProdStock: datos_existencis[i].existencias,
                });
              }, 100);
            }
          });
        }
      } else if (datos_existencis.length == 0) {
        this.unidadMedidaService.srvObtenerLista().subscribe(datos_undMed => {
          for (let index = 0; index < datos_undMed.length; index++) {
            this.presentacion.push(datos_undMed[index].undMed_Id);
          }
        });

        this.productosServices.srvObtenerListaPorIdProducto(idProducto).subscribe(datos_producto => {
          for (let i = 0; i < datos_producto.length; i++) {
            this.FormPedidoExternoProductos.patchValue({
              ProdId: datos_producto[i].prod_Id,
              ProdNombre: datos_producto[i].prod_Nombre,
              ProdUnidadMedidaCant: '',
              ProdPrecioUnd: 0,
              ProdUltFacturacion: 0,
              ProdStock: 0,
            });
          }
        });
      }
    });
  }

  // VALIDACION PARA CAMPOS VACIOS
  validarCamposVacios(){
    if(this.FormPedidoExternoProductos.valid) this.cargarFormProductoEnTablas(this.ArrayProducto);
    else this.mensajeService.mensajeAdvertencia(`Advertencia`, "Hay campos vacios en el formulario de producto");
  }

  // Funcion que envia la informacion de los productos a la tabla.
  cargarFormProductoEnTablas(_formulario : any){
    this.cargando = true;
    this.ultimoPrecio = 0;
    let idProducto : number = this.FormPedidoExternoProductos.value.ProdId;
    let precioProducto : number = this.FormPedidoExternoProductos.value.ProdPrecioUnd;
    let cantidad : number = this.FormPedidoExternoProductos.value.ProdCantidad;

    this.valorTotal += (precioProducto * cantidad);
    this.ivaDescuento();

    this.zeusService.GetExistenciasArticulo(idProducto.toString()).subscribe(datos_existencias => {
      if (datos_existencias.length == 0) {
        if (precioProducto >= 1) {
          let productoExt : any = {
            Id : this.FormPedidoExternoProductos.get('ProdId')?.value,
            Nombre : this.FormPedidoExternoProductos.value.ProdNombre,
            Cant : this.FormPedidoExternoProductos.get('ProdCantidad').value,
            UndCant : this.FormPedidoExternoProductos.get('ProdUnidadMedidaCant')?.value,
            PrecioUnd : precioProducto,
            Stock : this.formatonumeros(this.FormPedidoExternoProductos.get('ProdStock').value),
            SubTotal : this.FormPedidoExternoProductos.value.ProdPrecioUnd * this.FormPedidoExternoProductos.value.ProdCantidad,
            FechaEntrega : moment(this.FormPedidoExternoProductos.value.ProdFechaEnt).format('YYYY-MM-DD'),
          }
          this.ArrayProducto.push(productoExt);
          this.LimpiarCamposProductos();
          this.productoCliente();
        } else this.mensajeService.mensajeAdvertencia(`Advertencia`, `El precio digitado debe ser mayor a 0`);
      } else if (datos_existencias.length != 0) {
        for (let index = 0; index < datos_existencias.length; index++) {
          if (precioProducto >= this.FormPedidoExternoProductos.value.ProdUltFacturacion) {
            let productoExt : any = {
              Id : this.FormPedidoExternoProductos.get('ProdId')?.value,
              Nombre : this.FormPedidoExternoProductos.value.ProdNombre,
              Cant : this.FormPedidoExternoProductos.get('ProdCantidad').value,
              UndCant : this.FormPedidoExternoProductos.get('ProdUnidadMedidaCant')?.value,
              PrecioUnd : precioProducto,
              Stock : this.formatonumeros(this.FormPedidoExternoProductos.get('ProdStock').value),
              SubTotal : (this.FormPedidoExternoProductos.value.ProdPrecioUnd * this.FormPedidoExternoProductos.value.ProdCantidad),
              FechaEntrega : moment(this.FormPedidoExternoProductos.value.ProdFechaEnt).format('YYYY-MM-DD'),
            }
            this.ArrayProducto.push(productoExt);
            this.LimpiarCamposProductos();
            this.productoCliente();
          } else {
            this.mensajeService.mensajeAdvertencia(`Advertencia`, `El precio digitado no puede ser menor al que tiene el producto estipulado $${this.FormPedidoExternoProductos.value.ProdUltFacturacion}`);
            this.cargando = false;
          }
        }
      }
      this.ArrayProducto.sort((a,b)=> Number(a.PrecioUnd) - Number(b.PrecioUnd));
    });
    setTimeout(() => { this.cargando = false; }, 500);
  }

  // Funcion que mostrará un modal con la informacion del pedido
  confirmarPedido(){
    let direccionSede : string = this.FormPedidoExternoClientes.value.PedSedeCli_Id;
    let ciudad : string = this.FormPedidoExternoClientes.value.ciudad_sede;
    let clienteNombre : any = this.FormPedidoExternoClientes.value.PedClienteNombre;

    if (this.FormPedidoExternoClientes.valid) {
      if (!this.ArrayProducto.length) this.mensajeService.mensajeAdvertencia(`Advertencia`, 'Debe cargar al menos un producto en la tabla.');
      else {
        this.messageService.add({
          severity:'warn',
          key: 'confimacionPedido',
          summary:'Confirmación de Pedido',
          detail:
          `<b>Cliente:</b> ${clienteNombre} <br> ` +
          `<b>Ciudad:</b> ${ciudad} <br>` +
          `<b>Direccion:</b> ${direccionSede} <br>` +
          `<b>Iva:</b> ${this.iva}% <b>Descuento:</b> ${this.formatonumeros(this.descuento.toFixed(2))}% <br>` +
          `<b>Valor del Pedido</b> ${this.formatonumeros(this.valorfinal.toFixed(2))}<br>`,
          sticky: true
        });
      }
    } else this.mensajeService.mensajeAdvertencia(`Advertencia`, '¡Hay Campos Vacios!');
  }

  // Funcion para crear los pedidos de productos y añadirlos a la base de datos
  CrearPedidoExterno() {
    this.cargando = true;
    let direccionSede : string = this.FormPedidoExternoClientes.value.PedSedeCli_Id;
    let ciudad : string = this.FormPedidoExternoClientes.value.ciudad_sede;
    let clienteNombre : any = this.FormPedidoExternoClientes.value.PedClienteNombre;
    let observacion = this.FormPedidoExternoClientes.value.PedObservacion == null ? '' : this.FormPedidoExternoClientes.value.PedObservacion;

    this.sedesClientesService.srvObtenerListaPorClienteSede(clienteNombre, ciudad, direccionSede).subscribe(datos_sedeCliente => {
      for (let i = 0; i < datos_sedeCliente.length; i++) {
        const camposPedido : any = {
          PedExt_FechaCreacion: this.today,
          PedExt_FechaEntrega: this.FormPedidoExternoClientes.get('PedFechaEnt')?.value,
          Empresa_Id: 800188732,
          PedExt_Codigo: 0,
          SedeCli_Id: datos_sedeCliente[i].sedeCli_Id,
          Usua_Id: datos_sedeCliente[i].usua_Id,
          Estado_Id: 11,
          PedExt_Observacion: observacion.toUpperCase(),
          PedExt_PrecioTotal: this.valorTotal,
          Creador_Id: this.storage_Id,
          PedExt_Descuento: this.FormPedidoExternoClientes.value.PedDescuento,
          PedExt_Iva: this.iva,
          PedExt_PrecioTotalFinal : this.valorfinal,
          PedExt_HoraCreacion : moment().format('H:mm:ss'),
        }
        this.pedidoproductoService.srvGuardarPedidosProductos(camposPedido).subscribe(data=> {
          this.crearDetallesPedido();
          setTimeout(() => {
            this.limpiarTodosCampos();
            this.productosPedido(data.pedExt_Id);
          }, 2000);
        }, error => {
          this.mensajeService.mensajeError(`Error`, '¡No se pudo crear el pedido, por favor intente de nuevo!');
          this.cargando = false;
        });
      }
    }, error => {
      this.mensajeService.mensajeError(`Error`, '¡La dirección y la ciudad escogidas no coninciden!');
      this.cargando = false;
    });
  }

  // Funcion que creará los detalles del pedido
  crearDetallesPedido(){
    this.pedidoproductoService.srvObtenerUltimoPedido().subscribe(dataPedExternos =>{
      for (let index = 0; index < this.ArrayProducto.length; index++) {
        const productosPedidos : any = {
          Prod_Id: this.ArrayProducto[index].Id,
          PedExt_Id: dataPedExternos.pedExt_Id,
          PedExtProd_Cantidad : this.ArrayProducto[index].Cant,
          UndMed_Id : this.ArrayProducto[index].UndCant,
          PedExtProd_PrecioUnitario : this.ArrayProducto[index].PrecioUnd,
          PedExtProd_FechaEntrega : this.ArrayProducto[index].FechaEntrega,
          PedExtProd_CantidadFaltante : this.ArrayProducto[index].Cant,
          PedExtProd_CantidadFacturada : 0,
        }
        this.PedidoProductosService.srvGuardar(productosPedidos).subscribe(_registro_pedido_productos => {
          this.mensajeService.mensajeConfirmacion(`¡Pedido creado exitosamente!`, `¡El pedido fue creado de manera satisfactoria!`);
        }, error => {
          this.mensajeService.mensajeError(`Error`, '¡No se pudo crear el pedido correctamente, no se asociarón los productos al encabezado de este mismo!');
          this.cargando = false;
        });
      }
    });
  }

  // Funcion que va a editar la información principal del pedido
  editarPedido(){
    this.cargando = true;
    let direccionSede : string = this.FormPedidoExternoClientes.value.PedSedeCli_Id;
    let ciudad : string = this.FormPedidoExternoClientes.value.ciudad_sede;
    let clienteNombre : any = this.FormPedidoExternoClientes.value.PedClienteNombre;
    let observacion = this.FormPedidoExternoClientes.get('PedObservacion')?.value == null ? '' : this.FormPedidoExternoClientes.get('PedObservacion')?.value;
    this.pedidoproductoService.srvObtenerListaPorId(this.pedidoEditar).subscribe(datos => {
      this.sedesClientesService.srvObtenerListaPorClienteSede(clienteNombre, ciudad, direccionSede).subscribe(datos_sedeCliente => {
        for (let i = 0; i < datos_sedeCliente.length; i++) {
          const camposPedido : any = {
            PedExt_Id : this.pedidoEditar,
            PedExt_FechaCreacion: datos.pedExt_FechaCreacion,
            PedExt_FechaEntrega: datos_sedeCliente[i].pedExt_FechaEntrega,
            Empresa_Id: 800188732,
            PedExt_Codigo: 0,
            SedeCli_Id: datos_sedeCliente[i].sedeCli_Id,
            Usua_Id: datos_sedeCliente[i].usua_Id,
            Estado_Id: 11,
            PedExt_Observacion: observacion.toUpperCase(),
            PedExt_PrecioTotal: this.valorTotal,
            Creador_Id: datos.creador_Id,
            PedExt_Descuento: this.FormPedidoExternoClientes.value.PedDescuento,
            PedExt_Iva: this.iva,
            PedExt_PrecioTotalFinal : this.valorfinal,
            PedExt_HoraCreacion : datos.pedExt_Hora,
          }
          this.pedidoproductoService.srvActualizarPedidosProductos(this.pedidoEditar,camposPedido).subscribe(_data=> {
            this.editarDetallesPedido();
            setTimeout(() => {
              this.mensajeService.mensajeConfirmacion(`¡Pedido creado exitosamente!`, `¡El pedido fue creado de manera satisfactoria!`);
              this.productosPedido(this.pedidoEditar);
              this.limpiarTodosCampos();
            }, 2000);
          }, error => {
            this.mensajeService.mensajeError(`Error`, '¡No se pudo editar el pedido, por favor intente de nuevo!');
            this.cargando = false;
          });
        }
      }, error => {
        this.mensajeService.mensajeError(`Error`, '¡La dirección y la ciudad escogidas no coninciden!');
        this.cargando = false;
      });
    });
  }

  //Funcion que va a editar la información de los productos del pedido
  editarDetallesPedido(){
    for (let index = 0; index < this.ArrayProducto.length; index++) {
      this.PedidoProductosService.srvObtenerListaPorIdProducto_Pedido(this.ArrayProducto[index].Id, this.pedidoEditar).subscribe(datos => {
        if (datos.length == 0) {
          const productosPedidos : any = {
            Prod_Id: this.ArrayProducto[index].Id,
            PedExt_Id: this.pedidoEditar,
            PedExtProd_Cantidad : this.ArrayProducto[index].Cant,
            UndMed_Id : this.ArrayProducto[index].UndCant,
            PedExtProd_PrecioUnitario : this.ArrayProducto[index].PrecioUnd,
            PedExtProd_FechaEntrega : this.ArrayProducto[index].FechaEntrega,
            PedExtProd_CantidadFaltante : this.ArrayProducto[index].Cant,
            PedExtProd_CantidadFacturada : 0,
          }
          this.PedidoProductosService.srvGuardar(productosPedidos).subscribe(_registro_pedido_productos => { }, error => {
            this.mensajeService.mensajeError(`Error`, '¡No se pudo Editar el pedido, por favor intente de nuevo!');
            this.cargando = false;
          });
        }
      });
    }
  }

  // Funcion que consultará los productos del ultimo pedido creado
  productosPedido(pedido : number){
    this.pedidoproductoService.GetCrearPdfUltPedido(pedido).subscribe(datos_pedido => {
      for (let i = 0; i < datos_pedido.length; i++) {
        let info : any = {
          Id : datos_pedido[i].producto_Id,
          Nombre : datos_pedido[i].producto,
          Cantidad : this.formatonumeros(datos_pedido[i].cantidad),
          Und : datos_pedido[i].presentacion,
          Precio : this.formatonumeros(datos_pedido[i].precio_Unitario),
          SubTotal : this.formatonumeros(datos_pedido[i].subTotal_Producto),
          "Fecha Entrega" : datos_pedido[i].fecha_Entrega.replace('T00:00:00', ''),
        }
        this.productosPedidos.push(info);
        this.productosPedidos.sort((a,b) => a.Nombre.localeCompare(b.Nombre));
      }
      setTimeout(() => { this.crearpdf(pedido); }, 1000);
    });
  }

  // Fucnion para que crear ub pdf apenas se realiza el pedido de productos
  crearpdf(pedido : number){
    let usuario = this.storage_Nombre;
    this.pedidoproductoService.GetCrearPdfUltPedido(pedido).subscribe(datos_pedido => {
      for (let i = 0; i < datos_pedido.length; i++) {
        const pdfDefinicion : any = {
          info: { title: `Pedido N° ${datos_pedido[i].id_Pedido}` },
          pageSize: { width: 630, height: 760 },
          footer: function(currentPage : any, pageCount : any) {
            return [
              '\n',
              {
                columns: [
                  { text: `Reporte generado por ${usuario}`, alignment: ' left', fontSize: 8, margin: [30, 0, 0, 0] },
                  { text: `Fecha Expedición Documento ${moment().format('YYYY-MM-DD')} - ${moment().format('H:mm:ss')}`, alignment: 'right', fontSize: 8 },
                  { text: `${currentPage.toString()} de ${pageCount}`, alignment: 'right', fontSize: 8, margin: [0, 0, 30, 0] },
                ]
              }
            ]
          },
          content : [
            {
              columns: [
                { image : logoParaPdf, width : 220, height : 50 },
                { text: `Pedido ${datos_pedido[i].id_Pedido}`, alignment: 'right', style: 'titulo', margin: [0, 30, 0, 0], }
              ]
            },
            '\n \n',
            {
              style: 'tablaEmpresa',
              table: {
                widths: [90, 167, 90, 166],
                style: 'header',
                body: [
                  [
                    { border: [false, false, false, false], text: `Comercial`  },
                    { border: [false, false, false, true], text: `${datos_pedido[i].vendedor_Id} - ${datos_pedido[i].vendedor}`, fontSize: 8 },
                    { border: [false, false, false, false], text: `Fecha de pedido` },
                    { border: [false, false, false, true], text: `${datos_pedido[i].fechaCreacion.replace('T00:00:00', '')}` },
                  ],
                  [
                    { border: [false, false, false, false], text: `Estado del pedido` },
                    { border: [false, false, false, true], text: `${datos_pedido[i].estado}` },
                    { border: [false, false, false, false], text: `Código` },
                    { border: [false, false, false, true], text: `${datos_pedido[i].consecutivo}` },
                  ],
                ]
              },
              layout: { defaultBorder: false, },
              fontSize: 9,
            },
            '\n \n',
            { text: `\n Información detallada del cliente \n \n`, alignment: 'center', style: 'header' },
            {
              style: 'tablaCliente',
              table: {
                widths: [170, 170, 170],
                style: 'header',
                body: [
                  [ `ID: ${datos_pedido[i].cliente_Id}`,  `Tipo de ID: ${datos_pedido[i].tipo_Id}`, `Tipo de Cliente: ${datos_pedido[i].tipo_Cliente}` ],
                  [ `Nombre: ${datos_pedido[i].cliente}`, `Telefono: ${datos_pedido[i].telefono_Cliente}`, `Ciudad: ${datos_pedido[i].ciudad_Cliente}` ],
                  [ `Dirección: ${datos_pedido[i].direccion_Cliente}`, `Codigo Postal: ${datos_pedido[i].codPostal_Cliente}`, `E-mail: ${datos_pedido[i].correo_Cliente}` ]
                ]
              },
              layout: 'lightHorizontalLines',
              fontSize: 9,
            },
            { text: `\n\n Información detallada de producto(s) pedido(s) \n `, alignment: 'center', style: 'header' },
            this.table(this.productosPedidos, ['Id', 'Nombre', 'Cantidad', 'Und', 'Fecha Entrega', 'Precio', 'SubTotal']),
            {
              style: 'tablaTotales',
              table: {
                widths: [275, '*', 98],
                style: 'header',
                body: [
                  [
                    '',
                    { border: [true, false, true, true], text: `SUBTOTAL` },
                    { border: [false, false, true, true], text: `$${this.formatonumeros(datos_pedido[i].precio_Total)}` },
                  ],
                  [
                    '',
                    { border: [true, false, true, true], text: `DESCUENTO (%)` },
                    { border: [false, false, true, true], text: `${datos_pedido[i].descuento}%` },
                  ],
                  [
                    '',
                    { border: [true, false, true, true], text: `SUBTOTAL DESCUENTO` },
                    { border: [false, false, true, true], text: `$${this.formatonumeros((datos_pedido[i].precio_Total * datos_pedido[i].descuento) / 100)}` },
                  ],
                  [
                    '',
                    { border: [true, false, true, true], text: `IVA (%)` },
                    { border: [false, false, true, true], text: `${this.formatonumeros(datos_pedido[i].iva)}%` },
                  ],
                  [
                    '',
                    { border: [true, false, true, true], text: `SUBTOTAL IVA` },
                    { border: [false, false, true, true], text: `$${this.formatonumeros(((datos_pedido[i].precio_Total * datos_pedido[i].iva) / 100))}` },
                  ],
                  [
                    '',
                    { border: [true, false, true, true], text: `TOTAL` },
                    { border: [false, false, true, true], text: `$${this.formatonumeros(datos_pedido[i].precio_Final)}` },
                  ]
                ]
              },
              layout: { defaultBorder: false, },
              fontSize: 8,
            },
            { text: `\n \nObservación sobre el pedido: \n ${datos_pedido[i].observacion}\n`, style: 'header', }
          ],
          styles: {
            header: { fontSize: 10, bold: true },
            general: { fontSize: 8, bold: true },
            titulo: { fontSize: 20, bold: true }
          }
        }
        const pdf = pdfMake.createPdf(pdfDefinicion);
        pdf.open();
        break;
      }
    });

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
        widths: [40, 177, 40, 30, 51, 50, 98],
        body: this.buildTableBody(data, columns),
      },
      fontSize: 8,
      layout: {
        fillColor: function (rowIndex, _node, _columnIndex) {
          return (rowIndex == 0) ? '#CCCCCC' : null;
        }
      }
    };
  }

  // Función para quitar un producto de la tabla
  QuitarProductoTabla(data : any) {
    this.productoEliminado = data.Id;
    this.messageService.add({
      severity:'warn',
      key: 'quitarProducto',
      summary:'¿Estás seguro de eliminar el producto del pedido?',
      detail:
      `<b>Item:</b> ${data.Id} <br> ` +
      `<b>Referencia:</b> ${data.Nombre} <br>` +
      `<b>Cantidad:</b> ${this.formatonumeros(data.Cant)} <br>`,
      sticky: true
    });
  }

  // Funcion que va a quitar de la tabla el producto que haya sido seleccionado
  quitarProducto() {
    let item : any [] = this.ArrayProducto.filter((a) => a.Id == this.productoEliminado);
    let index : number = this.ArrayProducto.findIndex((b) => b.Id == this.productoEliminado);
    for (let i = 0; i < item.length; i++) {
      this.valorTotal -= item[i].SubTotal;
      this.ArrayProducto.splice(index, 1);
      setTimeout(() => { this.ivaDescuento(); }, 200);
      this.mensajeService.mensajeAdvertencia(`Advertencia`, '¡Se ha quitado el Producto del pedido a crear!');
      this.closeMessage('quitarProducto');
      this.productoEliminado = 0;
    }
  }

  //Funcion que va a eliminar de la base de datos un producto del pedido
  eliminarProducto(data : any){
    this.productoEliminado = data.Id;
    this.PedidoProductosService.srvObtenerListaPorIdProducto_Pedido(this.productoEliminado, this.pedidoEditar).subscribe(datos => {
      if (datos.length > 0) {
        this.messageService.add({
          severity:'warn',
          key: 'eliminarProducto',
          summary:'¿Estás seguro de eliminar el producto del pedido?',
          detail:
          `<p>Al eliminar el producto en este apartado de edición se Eliminará Tambien de la Base de Datos</p>` +
          `<b>Item:</b> ${data.Id} <br> ` +
          `<b>Referencia:</b> ${data.Nombre} <br>` +
          `<b>Cantidad:</b> ${this.formatonumeros(data.Cant)} <br>`,
          sticky: true
        });
      } else this.quitarProducto();
    });
  }

  // Funcion que eliminará de la base de datos el producto que se haya seleccionado
  eliminarProductoPedido = () => this.PedidoProductosService.srvEliminar(this.productoEliminado, this.pedidoEditar).subscribe(data => this.quitarProducto());

  /** Función para quitar mensaje de elección */
  closeConfirmacion = () => this.messageService.clear('confimacionPedido');

  // Funcion que va limpiar el mensage de que le sea pasado
  closeMessage = (key : string) => this.messageService.clear(key);
}
