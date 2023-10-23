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
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { OpedidoproductoService } from 'src/app/Servicios/PedidosProductos/opedidoproducto.service';
import { ProductoService } from 'src/app/Servicios/Productos/producto.service';
import { SedeClienteService } from 'src/app/Servicios/SedeCliente/sede-cliente.service';
import { UnidadMedidaService } from 'src/app/Servicios/UnidadMedida/unidad-medida.service';
import { ZeusContabilidadService } from 'src/app/Servicios/Zeus_Contabilidad/zeusContabilidad.service';
import { AppComponent } from 'src/app/app.component';
import { defaultStepOptions, stepsCrearPedidos as defaultSteps } from 'src/app/data';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';
import { ReportePedidos_ZeusComponent } from '../ReportePedidos_Zeus/ReportePedidos_Zeus.component';

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
  today : any = new Date(); //Variable que se usará para llenar la fecha actual
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
  descuento : number = 0; //Variable que guardará el valor en porcentaje del descuento hecho al cliente
  iva : number = 0; //Variable que gusrdará la cantidad de iva sobre la venta
  productoEliminado : number; //Variable que tendrá el id de un producto que se va a eliminar de la base de datos o de un pedido nuevo
  ultimoPrecio : number = 0; //Variable que almacenará el ultimo precio por el que se facturó un producto
  checked = true; //Variable que va a almancenar la información de si el pedido lleva iva o no
  productosPedidos : any [] = []; //Variable que se llenará con la información de los productos que se enviaron a la base de datos, los productos serán del ultimo pedido creado
  modalMode : boolean = false; //Variable que será true cuando el componente esté apareciendo en un modal
  pedidoEditar : number = 0; //Variable que alamcenará el numero el pedido que se está editando
  fechaUltFacuracion : any; //Variable que mostrará la fecha de la ultima facturacion de un producto seleccionado
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro

  constructor(private pedidoproductoService : OpedidoproductoService,
                private productosServices : ProductoService,
                  private clientesService :ClientesService,
                    private sedesClientesService: SedeClienteService,
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
                                          private msj : MensajesAplicacionService,) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
    //Campos que vienen del formulario
    this.FormPedidoExternoClientes = this.frmBuilderPedExterno.group({
      PedClienteId: [null, Validators.required],
      PedClienteNombre: [null, Validators.required],
      PedSedeCli_Id: [null, Validators.required],
      ciudad_sede: [null, Validators.required],
      PedUsuarioId: [null, Validators.required],
      PedUsuarioNombre: [null, Validators.required],
      PedFechaEnt: moment(this.today).format('YYYY-MM-DD'),
      PedEstadoId: 11,
      PedObservacion: '',
      PedDescuento : 0,
      PedIva : true,
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
    setInterval(() => this.modoSeleccionado = this.AppComponent.temaSeleccionado, 1000);
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
    else this.iva = 0;
  }

  //Cargar modal de crear producto
  LlamarModalCrearProducto = () => this.ModalCrearProductos = true;

  // Funcion para llamar el modal que crea clientes
  LlamarModalCrearCliente = () => this.ModalCrearCliente = true;

  // Funcion para limpiar los campos de el apartado de productos
  LimpiarCamposProductos = () => this.FormPedidoExternoProductos.reset();

  //Funcion que limpiará TODOS los campos de la vista de pedidos
  limpiarTodosCampos(){
    this.closeConfirmacion();
    this.ArrayProducto = [];
    this.descuento = 0;
    this.iva = 19;
    this.pedidosProductos = [];
    this.FormPedidoExternoClientes.reset();
    this.FormPedidoExternoClientes.patchValue({
      PedFechaEnt: moment(this.today).format('YYYY-MM-DD'),
      PedEstadoId: 11,
      PedDescuento : 0,
      PedIva : true,
    });
    this.cargando = false;
    this.presentacion = [];
    this.productosPedidos = [];
    this.FormPedidoExternoProductos.reset();
  }

  // Funcion que va a buscar los posibles clientes a los que se les puede hacer el pedido de productos
  buscarClientes(){
    let nombre : string = this.FormPedidoExternoClientes.value.PedClienteNombre;
    if (![null, '', undefined].includes(nombre) && nombre.length > 3 && this.ValidarRol == 2) this.clientesService.GetClientesVendedores(this.storage_Id, nombre).subscribe(datos => this.cliente = datos);
    else this.cliente = [];
    this.ValidarRol == 1 ? this.clientesService.srvObtenerListaPorEstado(1).subscribe(datos => this.cliente = datos) : null;
    setTimeout(() => this.cliente.sort((a,b) => a.cli_Nombre.localeCompare(b.cli_Nombre)), 500);
  }

  // Funcion que va a buscar el cliente seleccionado
  clienteSeleccionado(){
    let nombre : string = this.FormPedidoExternoClientes.value.PedClienteNombre;
    if (![null, '', undefined].includes(nombre)){
      this.clientesService.srvObtenerListaPorNombreCliente(nombre).subscribe(datos => {
        datos.forEach(cli => {
          this.FormPedidoExternoClientes.patchValue({
            PedClienteNombre: cli.cli_Nombre,
            PedClienteId : cli.cli_Id,
          });
          setTimeout(() => {
            this.ciudadClienteComboBox();
            this.productoCliente();
          }, 100);
        });
      });
    }
  }

  //Funcion para llenar las ciudades del cliente en donde tiene sedes
  ciudadClienteComboBox(){
    this.LimpiarCamposProductos();
    this.sedeCliente=[];
    let cliente: any = this.FormPedidoExternoClientes.value.PedClienteId;
    this.sedesClientesService.srvObtenerListaPorCliente(cliente).subscribe(datos_sedesClientes => {
      this.ciudad = datos_sedesClientes.map(sede => sede.sedeCliente_Ciudad);
      if (datos_sedesClientes.length <= 1 ) {
        this.usuarioVende = datos_sedesClientes.map(x => x.usua_Nombre);
        this.sedeCliente = datos_sedesClientes.map(x => x.sedeCliente_Direccion);
        datos_sedesClientes.forEach(item => {
          this.FormPedidoExternoClientes.patchValue({
            PedSedeCli_Id: item.sedeCliente_Direccion,
            ciudad_sede: item.sedeCliente_Ciudad,
            PedUsuarioNombre: item.usua_Nombre,
            PedUsuarioId: item.usua_Id,
          });
        });
        this.verificarCartera();
      } else {
        this.usuarioVende.push(datos_sedesClientes[0].usua_Nombre);
          this.FormPedidoExternoClientes.patchValue({
            PedUsuarioNombre: datos_sedesClientes[0].usua_Nombre,
            PedUsuarioId: datos_sedesClientes[0].usua_Id,
          });
        this.sedeCliente = [];
      }
    });
  }

  // Funcion que va a llenar el campo de direccion una vez se haya llenado el campo ciudad
  llenarDireccionCliente(){
    let cliente : number = this.FormPedidoExternoClientes.value.PedClienteId;
    let ciudad : string = this.FormPedidoExternoClientes.value.ciudad_sede;
    this.sedesClientesService.GetDireccionesCliente(cliente, ciudad).subscribe(datos_sedesClientes => {
      this.sedeCliente = datos_sedesClientes.map(sede => sede.sedeCliente_Direccion);
      setTimeout(() => {
        if (this.sedeCliente.length <= 1) {
          this.FormPedidoExternoClientes.patchValue({ PedSedeCli_Id: datos_sedesClientes[0].sedeCliente_Direccion, });
          this.verificarCartera();
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
        datos_sedeCliente.forEach(codBagpro => {
          this.zeusCobtabilidadService.GetCarteraClientes(codBagpro.sedeCli_CodBagPro).subscribe(datos => {
            for (let i = 0; i < datos.length; i++) {
              if (this.validarFechasCartera(datos[i])) break;
            }
          }, () => {
            this.msj.mensajeError(`Error`, `¡Error al consultar la cartera del cliente selecionado!`);
            this.limpiarTodosCampos();
          }, () => this.cargando = false);
        });
      }, () => {
        this.msj.mensajeError(`Error`, `¡Ocurrió un error al consultar el cliente seleccionado!`);
        this.cargando = false;
      });
    } else {
      this.msj.mensajeAdvertencia(`Advertencia`, `¡Llene los campos "Cliente", "Ciudad" y "Dirección" para consultar la cartera del cliente!`);
      this.cargando = false;
    }
  }

  validarFechasCartera(datos : any) : boolean {
    let fechaRadicado : any = datos.fecha_Radicado == null ? datos.lapsO_DOC : datos.fecha_Radicado;
    let hoy = moment([moment().year(), moment().month(), moment().date()]);
    let fechaDocumento = moment([moment(fechaRadicado).year(), moment(fechaRadicado).month(), moment(fechaRadicado).date()]);
    if (hoy.diff(fechaDocumento, 'days') >= 70) {
      this.msj.mensajeAdvertencia(`¡El cliente seleccionado tiene un reporte de ${this.formatonumeros(hoy.diff(fechaDocumento, 'days'))} días en cartera, por lo que no será posible crearle un pedido!`);
      this.limpiarTodosCampos();
      return true;
    } else return false;
  }

  // Funcion para cargar los productos de un solo cliente
  productoCliente(){
    this.producto = [];
    this.ClientesProductosService.srvObtenerListaPorNombreCliente(this.FormPedidoExternoClientes.value.PedClienteId).subscribe(datos_clientesProductos => {
      datos_clientesProductos.forEach(prod => this.productosServices.srvObtenerListaPorId(prod.prod_Id).subscribe(datos => this.producto.push(datos)));
    });
  }

  //Funcion encargada de buscar un producto por el id del producto
  buscarProducto(idProducto : any){
    this.presentacion = [];
    if ([null, undefined, ''].includes(idProducto)) this.productoCliente();
    this.zeusService.GetExistenciasArticulo(idProducto.toString()).subscribe(datos_existencis => {
      if (datos_existencis.length > 0) this.productoConExistencia(datos_existencis, idProducto);
      else if (datos_existencis.length == 0) this.productoSinExistencia(idProducto);
    });
  }

  productoSinExistencia(idProducto : number){
    this.unidadMedidaService.srvObtenerLista().subscribe(data => this.presentacion = data.filter(x => ['Und', 'Kg', 'Rollo', 'Paquete'].includes(x.undMed_Id)).map(und => und.undMed_Id));
    this.productosServices.srvObtenerListaPorIdProducto(idProducto).subscribe(datos_producto => {
      this.FormPedidoExternoProductos.patchValue({
        ProdId: datos_producto[0].prod_Id,
        ProdNombre: datos_producto[0].prod_Nombre,
        ProdPrecioUnd: 0,
        ProdUltFacturacion: 0,
        ProdStock: 0,
      });
    });
  }

  productoConExistencia(datos_existencis, idProducto : number){
    datos_existencis.forEach(exis => this.FormPedidoExternoProductos.patchValue({ ProdStock: parseFloat(exis.disponibles) }));
      this.existenciasProductosServices.srvObtenerListaPorIdProducto(idProducto).subscribe(datos_prod => {
        this.presentacion = datos_prod.map(x => x.undMed_Id);
        datos_prod.forEach(prod => {
        this.zeusService.GetPrecioUltimoPrecioFacturado(idProducto.toString(), prod.undMed_Id).subscribe(datos_prodPedido => {
          this.FormPedidoExternoProductos.patchValue({ ProdUltFacturacion: datos_prodPedido.precioUnidad | 0 });
          this.fechaUltFacuracion = datos_prodPedido.fechaDocumento.replace('T00:00:00', '');
        });
        setTimeout(() => {
          this.FormPedidoExternoProductos.patchValue({
            ProdId: prod.prod_Id,
            ProdNombre: prod.prod_Nombre,
            ProdUnidadMedidaCant: prod.undMed_Id,
            ProdPrecioUnd: prod.exProd_PrecioVenta,
          });
        }, 100);
      });
    });
  }

  // VALIDACION PARA CAMPOS VACIOS
  validarCamposVacios(){
    if(this.FormPedidoExternoProductos.valid) this.cargarFormProductoEnTablas();
    else this.msj.mensajeAdvertencia(`Advertencia`, "Hay campos vacios en el formulario de producto");
  }

  // Funcion que envia la informacion de los productos a la tabla.
  cargarFormProductoEnTablas(){
    let precioProducto : number = this.FormPedidoExternoProductos.value.ProdPrecioUnd;
    if (precioProducto > 0 && precioProducto >= this.ultimoPrecio) {
      this.ArrayProducto.push({
        Id : this.FormPedidoExternoProductos.get('ProdId')?.value,
        Nombre : this.FormPedidoExternoProductos.value.ProdNombre,
        Cant : this.FormPedidoExternoProductos.get('ProdCantidad').value,
        UndCant : this.FormPedidoExternoProductos.get('ProdUnidadMedidaCant')?.value,
        PrecioUnd : this.FormPedidoExternoProductos.value.ProdPrecioUnd,
        Stock : this.FormPedidoExternoProductos.get('ProdStock').value,
        SubTotal : (this.FormPedidoExternoProductos.value.ProdPrecioUnd * this.FormPedidoExternoProductos.value.ProdCantidad),
        FechaEntrega : moment(this.FormPedidoExternoProductos.value.ProdFechaEnt).format('YYYY-MM-DD'),
      });
      this.LimpiarCamposProductos();
      this.productoCliente();
    } else this.msj.mensajeAdvertencia(`El precio digitado no puede ser menor al que tiene el producto estipulado $${this.FormPedidoExternoProductos.value.ProdUltFacturacion}`);
  }

  // Funcion que va a retornar el valor total del pedido
  valorTotalPedido() : number{
    let valorTotal : number = 0;
    valorTotal = this.ArrayProducto.reduce((a,b) => a + b.SubTotal, 0);
    return valorTotal;
  }

  // Funcion que va a retornar el valor total mas iva
  valorTotalMasIvaPedido() : number{
    let valorFinal : number = 0;
    valorFinal = (this.valorTotalPedido() * this.iva) / 100;
    return valorFinal;
  }

  // Funcion que va a retornar el valor total menos el descuento
  valorTotalMenosDescuentoPedido(){
    let valorFinal : number = 0;
    valorFinal = (this.valorTotalPedido() * this.descuento) / 100;
    return valorFinal;
  }

  // Funcion que va a retornar el valor final del pedido
  valorFinalPedido() : number{
    let valorFinal : number = 0;
    valorFinal = this.valorTotalPedido() - this.valorTotalMenosDescuentoPedido() + this.valorTotalMasIvaPedido();
    return valorFinal;
  }

  // Funcion que mostrará un modal con la informacion del pedido
  confirmarPedido(){
    let direccionSede : string = this.FormPedidoExternoClientes.value.PedSedeCli_Id;
    let ciudad : string = this.FormPedidoExternoClientes.value.ciudad_sede;
    let clienteNombre : any = this.FormPedidoExternoClientes.value.PedClienteNombre;

    if (this.FormPedidoExternoClientes.valid) {
      if (!this.ArrayProducto.length) this.msj.mensajeAdvertencia(`Advertencia`, 'Debe cargar al menos un producto en la tabla.');
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
          `<b>Valor del Pedido</b> ${this.formatonumeros(this.valorFinalPedido().toFixed(2))}<br>`,
          sticky: true
        });
      }
    } else this.msj.mensajeAdvertencia(`Advertencia`, '¡Hay Campos Vacios!');
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
          PedExt_FechaCreacion: moment(this.today).format('YYYY-MM-DD'),
          PedExt_FechaEntrega: this.FormPedidoExternoClientes.get('PedFechaEnt')?.value,
          Empresa_Id: 800188732,
          PedExt_Codigo: 0,
          SedeCli_Id: datos_sedeCliente[i].sedeCli_Id,
          Usua_Id: datos_sedeCliente[i].usua_Id,
          Estado_Id: 11,
          PedExt_Observacion: observacion.toUpperCase(),
          PedExt_PrecioTotal: this.valorTotalPedido(),
          Creador_Id: this.storage_Id,
          PedExt_Descuento: this.FormPedidoExternoClientes.value.PedDescuento,
          PedExt_Iva: this.iva,
          PedExt_PrecioTotalFinal : this.valorFinalPedido(),
          PedExt_HoraCreacion : moment().format('H:mm:ss'),
        }
        this.pedidoproductoService.srvGuardarPedidosProductos(camposPedido).subscribe(data=> this.crearDetallesPedido(data.pedExt_Id), () => {
          this.msj.mensajeError(`Error`, '¡No se pudo crear el pedido, por favor intente de nuevo!');
          this.cargando = false;
        });
      }
    }, () => {
      this.msj.mensajeError(`Error`, '¡La dirección y la ciudad escogidas no coninciden!');
      this.cargando = false;
    });
  }

  // Funcion que creará los detalles del pedido
  crearDetallesPedido(id_pedido : number){
    let count : number = 0;
    for (let index = 0; index < this.ArrayProducto.length; index++) {
      const productosPedidos : any = {
        Prod_Id: this.ArrayProducto[index].Id,
        PedExt_Id: id_pedido,
        PedExtProd_Cantidad : this.ArrayProducto[index].Cant,
        UndMed_Id : this.ArrayProducto[index].UndCant,
        PedExtProd_PrecioUnitario : this.ArrayProducto[index].PrecioUnd,
        PedExtProd_FechaEntrega : this.ArrayProducto[index].FechaEntrega,
        PedExtProd_CantidadFaltante : this.ArrayProducto[index].Cant,
        PedExtProd_CantidadFacturada : 0,
      }
      this.PedidoProductosService.srvGuardar(productosPedidos).subscribe(() => {
        count ++;
        if (count == this.ArrayProducto.length) {
          this.productosPedido(id_pedido);
          this.limpiarTodosCampos();
          this.msj.mensajeConfirmacion(`¡Pedido creado exitosamente!`, `¡El pedido fue creado de manera satisfactoria!`);
        }
      }, () => {
        this.msj.mensajeError(`Error`, '¡No se pudo crear el pedido correctamente, no se asociarón los productos al encabezado de este mismo!');
        this.cargando = false;
      });
    }
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
            PedExt_PrecioTotal: this.valorTotalPedido(),
            Creador_Id: datos.creador_Id,
            PedExt_Descuento: this.FormPedidoExternoClientes.value.PedDescuento,
            PedExt_Iva: this.iva,
            PedExt_PrecioTotalFinal : this.valorFinalPedido(),
            PedExt_HoraCreacion : datos.pedExt_Hora,
          }
          this.pedidoproductoService.srvActualizarPedidosProductos(this.pedidoEditar,camposPedido).subscribe(() => this.editarDetallesPedido(), () => {
            this.msj.mensajeError(`Error`, '¡No se pudo editar el pedido, por favor intente de nuevo!');
            this.cargando = false;
          });
        }
      }, () => {
        this.msj.mensajeError(`Error`, '¡La dirección y la ciudad escogidas no coninciden!');
        this.cargando = false;
      });
    });
  }

  //Funcion que va a editar la información de los productos del pedido
  editarDetallesPedido(){
    let count : number = 0;
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
          this.PedidoProductosService.srvGuardar(productosPedidos).subscribe(() => {
            count++;
            if (count == this.ArrayProducto.length) {
              this.limpiarTodosCampos();
              this.productosPedido(this.pedidoEditar);
              this.msj.mensajeConfirmacion(`¡Pedido Editado exitosamente!`, `¡El pedido fue editado de manera satisfactoria!`);
            }
          }, () => {
            this.msj.mensajeError(`Error`, '¡No se pudo Editar el pedido, por favor intente de nuevo!');
            this.cargando = false;
          });
        }
      });
    }
  }

  // Funcion que consultará los productos del ultimo pedido creado
  productosPedido(pedido : number){
    this.pedidoproductoService.GetCrearPdfUltPedido(pedido).subscribe(datos_pedido => {
      datos_pedido.forEach(data => {
        let info : any = {
          Item : data.producto_Id,
          Referencia : data.producto,
          Cantidad : this.formatonumeros(data.cantidad),
          Und : data.presentacion,
          Precio : this.formatonumeros(data.precio_Unitario),
          SubTotal : this.formatonumeros(data.subTotal_Producto),
          "Fecha Entrega" : data.fecha_Entrega.replace('T00:00:00', ''),
        }
        this.productosPedidos.push(info);
        this.productosPedidos.sort((a,b) => a.Referencia.localeCompare(b.Referencia));
        if (this.productosPedidos.length == datos_pedido.length) this.crearpdf(pedido);
      });
    });
  }

  // Fucnion para que crear ub pdf apenas se realiza el pedido de productos
  crearpdf(pedido : number){
    this.pedidoproductoService.GetCrearPdfUltPedido(pedido).subscribe(datos_pedido => {
      for (let i = 0; i < datos_pedido.length; i++) {
        let titulo = `Pedido N° ${datos_pedido[i].id_Pedido}`;
        const pdfDefinicion : any = {
          info: { title: titulo },
          pageSize: { width: 630, height: 760 },
          watermark: { text: 'PLASTICARIBE SAS', color: 'red', opacity: 0.05, bold: true, italics: false },
          pageMargins : [25, 100, 25, 35],
          header: function(currentPage : any, pageCount : any) {
            return [
              {
                margin: [20, 8, 20, 0],
                columns: [
                  { image : logoParaPdf, width : 150, height : 30, margin: [20, 25] },
                  {
                    width: 300,
                    alignment: 'center',
                    table: {
                      body: [
                        [{text: 'NIT. 800188732', bold: true, alignment: 'center', fontSize: 10}],
                        [{text: `Fecha Doc. ${moment().format('YYYY-MM-DD')} ${moment().format('H:mm:ss')}`, alignment: 'center', fontSize: 8}],
                        [{text: titulo, bold: true, alignment: 'center', fontSize: 10}],
                      ]
                    },
                    layout: 'noBorders',
                    margin: [85, 20],
                  },
                  {
                    width: '*',
                    alignment: 'center',
                    margin: [20, 20, 20, 0],
                    table: {
                      body: [
                        [{text: `Pagina: `, alignment: 'left', fontSize: 8, bold: true}, { text: `${currentPage.toString() + ' de ' + pageCount}`, alignment: 'left', fontSize: 8, margin: [0, 0, 30, 0] }],
                        [{text: `Fecha: `, alignment: 'left', fontSize: 8, bold: true}, {text: datos_pedido[i].fechaCreacion.replace('T00:00:00', ``), alignment: 'left', fontSize: 8, margin: [0, 0, 30, 0] }],
                        [{text: `Hora: `, alignment: 'left', fontSize: 8, bold: true}, {text: datos_pedido[i].hora, alignment: 'left', fontSize: 8, margin: [0, 0, 30, 0] }],
                      ]
                    },
                    layout: 'noBorders',
                  }
                ]
              },
              {
                margin: [20, 0],
                table: {
                  headerRows: 1,
                  widths: ['*'],
                  body: [
                    [
                      {
                        border: [false, true, false, false],
                        text: ''
                      },
                    ],
                  ]
                },
                layout: { defaultBorder: false, }
              },
            ];
          },
          content : [
            { text: `\n Información del Pedido \n`, alignment: 'center', style: 'header' },
            '\n',
            {
              style: 'tablaEmpresa',
              table: {
                widths: [305, 152, 100],
                style: 'header',
                body: [
                  [
                    { border: [false, false, false, true], text: `Comercial:  ${datos_pedido[i].vendedor_Id} - ${datos_pedido[i].vendedor}`  },
                    { border: [false, false, false, true], text: `Estado del pedido:  ${datos_pedido[i].estado}` },
                    { border: [false, false, false, true], text: `Código:  ${datos_pedido[i].consecutivo}` },
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
                widths: [242, 130, 180],
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
            this.table(this.productosPedidos, ['Item', 'Referencia', 'Cantidad', 'Und', 'Fecha Entrega', 'Precio', 'SubTotal']),
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
            titulo: { fontSize: 20, bold: true },
            subTitulos: { bold: true },
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
      columns.forEach((column) => dataRow.push(row[column].toString()));
      body.push(dataRow);
    });
    return body;
  }

  // Funcion que genera la tabla donde se mostrará la información de los productos pedidos
  table(data, columns) {
    return {
      table: {
        headerRows: 1,
        widths: [40, 177, 40, 50, 61, 50, 98],
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
      this.ArrayProducto.splice(index, 1);
      this.msj.mensajeAdvertencia(`Advertencia`, '¡Se ha quitado el Producto del pedido a crear!');
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
  eliminarProductoPedido = () => this.PedidoProductosService.srvEliminar(this.productoEliminado, this.pedidoEditar).subscribe(() => this.quitarProducto());

  /** Función para quitar mensaje de elección */
  closeConfirmacion = () => this.messageService.clear('confimacionPedido');

  // Funcion que va limpiar el mensage de que le sea pasado
  closeMessage = (key : string) => this.messageService.clear(key);
}
