import { Component, Inject, Injectable, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import pdfMake from 'pdfmake/build/pdfmake';
import { AppComponent } from 'src/app/app.component';
import { ClientesService } from 'src/app/Servicios/Clientes/clientes.service';
import { ClientesProductosService } from 'src/app/Servicios/Clientes_Productos/ClientesProductos.service';
import { PedidoProductosService } from 'src/app/Servicios/DetallesPedidoProductos/pedidoProductos.service';
import { ExistenciasProductosService } from 'src/app/Servicios/ExistenciasProductos/existencias-productos.service';
import { InventarioZeusService } from 'src/app/Servicios/InventarioZeus/inventario-zeus.service';
import { OpedidoproductoService } from 'src/app/Servicios/PedidosProductos/opedidoproducto.service';
import { ProductoService } from 'src/app/Servicios/Productos/producto.service';
import { RolesService } from 'src/app/Servicios/Roles/roles.service';
import { SedeClienteService } from 'src/app/Servicios/SedeCliente/sede-cliente.service';
import { UnidadMedidaService } from 'src/app/Servicios/UnidadMedida/unidad-medida.service';
import { UsuarioService } from 'src/app/Servicios/Usuarios/usuario.service';
import Swal from 'sweetalert2';
import { Reporte_PedidosVendedoresComponent } from '../Reporte_PedidosVendedores/Reporte_PedidosVendedores.component';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-Pedido-Externo',
  templateUrl: './Pedido-Externo.component.html',
  styleUrls: ['./Pedido-Externo.component.css']
})

export class PedidoExternoComponent implements OnInit {

  @ViewChild(Reporte_PedidosVendedoresComponent) modalReporte_PedidosVendedoresComponent : Reporte_PedidosVendedoresComponent;

  public FormPedidoExternoClientes !: FormGroup; //Formulario de pedidos cliente
  public FormPedidoExternoProductos!: FormGroup; //Formuladio de pedidos productos
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  cargando : boolean = false; //Variable que va a servir para mostrar o no la imagen de carga
  AccionBoton = "Agregar"; //Variable que almanará informacio para saber si un producto está en edicion o no (Se editará un producto cargado en la tabla, no uno en la base de datos)
  Ide : number | undefined; //Variable para almacenar el ID del producto que está en la tabla y se va a editar
  id_pedido : number; //Variable que almacenará el ID del pedido que se va a mostrar
  ModalCrearProductos: boolean = false; //Funcion que va a mostrar o no el modal de productos
  ModalCrearCliente: boolean = false; //Funcion que va a mostrar o no el modal de clientes
  ModalSedesClientes: boolean = false; //Funcion que va a mostrar o no el modal de sedes clientes
  cliente = []; //Variable que almacenará el nombre de los clientes para pasarlos en la vista
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
  checked = false; //Variable que va a almancenar la información de si el pedido lleva iva o no
  productosPedidos : any [] = []; //Variable que se llenará con la información de los productos que se enviaron a la base de datos, los productos serán del ultimo pedido creado
  modalMode : boolean = false; //Variable que será true cuando el componente esté apareciendo en un modal
  pedidoEditar : number = 0; //Variable que alamcenará el numero el pedido que se está editando

  constructor(private pedidoproductoService : OpedidoproductoService,
                private productosServices : ProductoService,
                  private clientesService :ClientesService,
                    private sedesClientesService: SedeClienteService,
                      private usuarioService: UsuarioService,
                        private unidadMedidaService : UnidadMedidaService,
                          private frmBuilderPedExterno : FormBuilder,
                            private existenciasProductosServices : ExistenciasProductosService,
                              private PedidoProductosService : PedidoProductosService,
                                private rolService : RolesService,
                                  @Inject(SESSION_STORAGE) private storage: WebStorageService,
                                    private ClientesProductosService : ClientesProductosService,
                                      private zeusService : InventarioZeusService,
                                        private appComponent : AppComponent,) {

    //Campos que vienen del formulario
    this.FormPedidoExternoClientes = this.frmBuilderPedExterno.group({
      PedClienteId: [null, Validators.required],
      PedClienteNombre: [null, Validators.required],
      PedSedeCli_Id: [null, Validators.required],
      ciudad_sede: [null, Validators.required],
      PedUsuarioId: [null, Validators.required],
      PedUsuarioNombre: [null, Validators.required],
      PedFechaEnt: [null, Validators.required],
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
    });
  }

  ngOnInit(): void {
    this.clientesComboBox();
    this.lecturaStorage();
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

  // Funcion que va a dar un valor a la variable iva dependiendo de si fue seleccionada o no la casilla del iva
  checkboxIva(){
    if (!this.checked) this.iva = 19;
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
      this.descuento = 0;
      this.valorMenosDescuento = 0;
      this.valorMenosIva = 0;
      this.valorfinal = 0;
    } else {
      this.descuento = this.FormPedidoExternoClientes.value.PedDescuento;
      this.valorMenosDescuento = (this.valorTotal * this.descuento) / 100;
      this.valorMenosIva = (this.valorTotal * this.iva) / 100;
      this.valorfinal = this.valorTotal - this.valorMenosDescuento + this.valorMenosIva;
    }
  }

  //Cargar modal de crear producto
  LlamarModalCrearProducto() {
    this.ModalCrearProductos = true;
  }

  // Funcion para llamar el modal que crea clientes
  LlamarModalCrearCliente() {
    this.ModalCrearCliente = true;
  }

  // Funcion para limpiar los campos de el apartado de productos
  LimpiarCamposProductos(){
    this.FormPedidoExternoProductos.reset();
  }

  //Funcion que limpiará TODOS los campos de la vista de pedidos
  limpiarTodosCampos(){
    this.ArrayProducto = [];
    this.valorTotal = 0;
    this.descuento = 0;
    this.valorMenosDescuento = 0;
    this.iva = 0;
    this.valorMenosIva = 0;
    this.valorfinal = 0;
    this.pedidosProductos = [];
    this.FormPedidoExternoClientes = this.frmBuilderPedExterno.group({
      PedClienteNombre: null,
      PedClienteId : null,
      PedSedeCli_Id: null,
      ciudad_sede: null,
      PedUsuarioNombre: null,
      PedUsuarioId : null,
      PedFechaEnt: null,
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

  /* EMPIEZA A HACE LAS RESPECTIVAS VALIDACIONES PARA MOSTRAR DATOS EN LOS COMBOBOX DESDE QUE ARRANCA LA PAGINA */
  clientesComboBox() {
    this.cliente = [];
    this.usuarioService.srvObtenerListaPorId(this.storage.get('Id')).subscribe(datos_usuarios => {
      this.clientesService.srvObtenerListaPorEstado(1).subscribe(datos_clientes => {
        for (let index = 0; index < datos_clientes.length; index++) {
          if (datos_usuarios.rolUsu_Id == 2) {
            if (datos_clientes[index].usua_Id == this.storage.get('Id')) this.cliente.push(datos_clientes[index]);
          } else this.cliente.push(datos_clientes[index]);
          this.cliente.sort((a,b) => a.cli_Nombre.localeCompare(b.cli_Nombre));
        }
      });
    });
  }

  // Funcion que va a buscar el cliente seleccionado
  clienteSeleccionado(){
    this.clientesService.srvObtenerListaPorId(this.FormPedidoExternoClientes.value.PedClienteNombre).subscribe(datos => {
      this.FormPedidoExternoClientes.setValue({
        PedClienteNombre: datos.cli_Nombre,
        PedClienteId : datos.cli_Id,
        PedSedeCli_Id: this.FormPedidoExternoClientes.value.PedSedeCli_Id,
        ciudad_sede: this.FormPedidoExternoClientes.value.ciudad_sede,
        PedUsuarioNombre: this.FormPedidoExternoClientes.value.PedUsuarioNombre,
        PedUsuarioId: this.FormPedidoExternoClientes.value.PedUsuarioId,
        PedFechaEnt: this.FormPedidoExternoClientes.value.PedFechaEnt,
        PedEstadoId: this.FormPedidoExternoClientes.value.PedEstadoId,
        PedObservacion: this.FormPedidoExternoClientes.value.PedObservacion,
        PedDescuento : this.FormPedidoExternoClientes.value.PedDescuento,
        PedIva : this.FormPedidoExternoClientes.value.PedIva,
      });
      setTimeout(() => {
        this.ciudadClienteComboBox();
        this.productoCliente();
      }, 100);
    });
  }

  //Funcion para llenar las ciudades del cliente en donde tiene sedes
  ciudadClienteComboBox(){
    this.LimpiarCamposProductos();
    this.ciudad = [];
    this.sedeCliente=[];
    this.usuarioVende=[];
    let clienteBD: any = this.FormPedidoExternoClientes.value.PedClienteId;
    this.sedesClientesService.srvObtenerListaPorCliente(clienteBD).subscribe(datos_sedesClientes => {
      for (let i = 0; i < datos_sedesClientes.length; i++) {
        this.ciudad.push(datos_sedesClientes[i].sedeCliente_Ciudad);
        this.sedeCliente.push(datos_sedesClientes[i]);
      }

      if (this.sedeCliente.length <= 1 ) {
        for (const item of this.sedeCliente) {
          this.sedeCliente = [];
          this.usuarioVende.push(item.usua_Nombre);
          this.sedeCliente.push(item.sedeCliente_Direccion);
          this.FormPedidoExternoClientes.setValue({
            PedClienteNombre: this.FormPedidoExternoClientes.value.PedClienteNombre,
            PedClienteId : this.FormPedidoExternoClientes.value.PedClienteId,
            PedSedeCli_Id: item.sedeCliente_Direccion,
            ciudad_sede: item.sedeCliente_Ciudad,
            PedUsuarioNombre: item.usua_Nombre,
            PedUsuarioId: item.usua_Id,
            PedFechaEnt: this.FormPedidoExternoClientes.value.PedFechaEnt,
            PedEstadoId: this.FormPedidoExternoClientes.value.PedEstadoId,
            PedObservacion: this.FormPedidoExternoClientes.value.PedObservacion,
            PedDescuento : this.FormPedidoExternoClientes.value.PedDescuento,
            PedIva : this.FormPedidoExternoClientes.value.PedIva,
          });
        }
      } else {
        for (const item of this.sedeCliente) {
          this.usuarioVende.push(item.usua_Nombre);
          this.FormPedidoExternoClientes.setValue({
            PedClienteNombre: this.FormPedidoExternoClientes.value.PedClienteNombre,
            PedClienteId : this.FormPedidoExternoClientes.value.PedClienteId,
            PedSedeCli_Id: this.FormPedidoExternoClientes.value.PedSedeCli_Id,
            ciudad_sede: this.FormPedidoExternoClientes.value.ciudad_sede,
            PedUsuarioNombre: item.usua_Nombre,
            PedUsuarioId: item.usua_Id,
            PedFechaEnt: this.FormPedidoExternoClientes.value.PedFechaEnt,
            PedEstadoId: this.FormPedidoExternoClientes.value.PedEstadoId,
            PedObservacion: this.FormPedidoExternoClientes.value.PedObservacion,
            PedDescuento : this.FormPedidoExternoClientes.value.PedDescuento,
            PedIva : this.FormPedidoExternoClientes.value.PedIva,
          });
          break;
        }
        this.sedeCliente = [];
        for (let i = 0; i < datos_sedesClientes.length; i++) {
          this.sedeCliente.push(datos_sedesClientes[i].sedeCliente_Direccion);
        }
      }
    });
  }

  // Funcion para cargar los productos de un solo cliente
  productoCliente(){
    this.ClientesProductosService.srvObtenerListaPorNombreCliente(this.FormPedidoExternoClientes.value.PedClienteId).subscribe(datos_clientesProductos => {
      for (let index = 0; index < datos_clientesProductos.length; index++) {
        this.productosServices.srvObtenerListaPorId(datos_clientesProductos[index].prod_Id).subscribe(datos_productos => {
          this.producto.push(datos_productos);
        });
      }
    });
  }

  //Funcion encargada de buscar un producto por el id del producto
  buscarProducto(){
    this.producto = [];
    this.presentacion = [];
    this.ultimoPrecio = 0;
    let idProducto : number = this.FormPedidoExternoProductos.value.ProdNombre;

    this.zeusService.GetExistenciasArticulo(idProducto.toString()).subscribe(datos_existencis => {
      if (datos_existencis.length != 0) {
        for (let i = 0; i < datos_existencis.length; i++) {
          this.existenciasProductosServices.srvObtenerListaPorIdProducto(idProducto).subscribe(datos_producto => {
            for (let j = 0; j < datos_producto.length; j++) {
              this.zeusService.GetPrecioUltimoPrecioFacturado(idProducto.toString(), datos_producto[j].undMed_Id).subscribe(datos_productoPedido => {
                this.ultimoPrecio = datos_productoPedido;
              });

              setTimeout(() => {
                this.presentacion.push(datos_producto[j].undMed_Id);
                this.FormPedidoExternoProductos.setValue({
                  ProdId: datos_producto[j].prod_Id,
                  ProdNombre: datos_producto[j].prod_Nombre,
                  ProdCantidad: this.FormPedidoExternoProductos.value.ProdCantidad,
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
            this.FormPedidoExternoProductos.setValue({
              ProdId: datos_producto[i].prod_Id,
              ProdNombre: datos_producto[i].prod_Nombre,
              ProdCantidad: this.FormPedidoExternoProductos.value.ProdCantidad,
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
    this.producto = [];
    this.presentacion = [];
    let idProducto : number = this.FormPedidoExternoProductos.value.ProdId;

    this.zeusService.GetExistenciasArticulo(idProducto.toString()).subscribe(datos_existencis => {
      if (datos_existencis .length != 0) {
        for (let i = 0; i < datos_existencis.length; i++) {
          this.existenciasProductosServices.srvObtenerListaPorIdProducto(idProducto).subscribe(datos_producto => {
            for (let j = 0; j < datos_producto.length; j++) {
              this.zeusService.GetPrecioUltimoPrecioFacturado(idProducto.toString(), datos_producto[j].undMed_Id).subscribe(datos_productoPedido => { this.ultimoPrecio = datos_productoPedido; });

              setTimeout(() => {
                this.presentacion.push(datos_producto[j].undMed_Id);
                this.FormPedidoExternoProductos.setValue({
                  ProdId: datos_producto[j].prod_Id,
                  ProdNombre: datos_producto[j].prod_Nombre,
                  ProdCantidad: this.FormPedidoExternoProductos.value.ProdCantidad,
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
            this.FormPedidoExternoProductos.setValue({
              ProdId: datos_producto[i].prod_Id,
              ProdNombre: datos_producto[i].prod_Nombre,
              ProdCantidad: this.FormPedidoExternoProductos.value.ProdCantidad,
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

  // VALIDACION PARA CAMPOS VACIOS
  validarCamposVacios(){
    if(this.FormPedidoExternoProductos.valid) this.cargarFormProductoEnTablas(this.ArrayProducto);
    else this.mensajeAdvertencia("Hay campos vacios en el formulario de producto");
  }

  // Funcion que envia la informacion de los productos a la tabla.
  cargarFormProductoEnTablas(formulario : any){
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
          }
          this.ArrayProducto.push(productoExt);
          this.LimpiarCamposProductos();
          this.productoCliente();
        } else this.mensajeAdvertencia(`El precio digitado debe ser mayor a 0`);
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
            }
            this.ArrayProducto.push(productoExt);
            this.LimpiarCamposProductos();
            this.productoCliente();
          } else this.mensajeAdvertencia(`El precio digitado no puede ser menor al que tiene el producto estipulado $${this.FormPedidoExternoProductos.value.ProdUltFacturacion}`);
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
    let mensaje : string = 'Crear Pedido';
    if (this.modalMode) mensaje = 'Editar Pedido';

    if (this.FormPedidoExternoClientes.valid) {
      if (!this.ArrayProducto.length) this.mensajeAdvertencia('Debe cargar al menos un producto en la tabla.');
      else {
        Swal.fire({
          icon: 'warning',
          title: 'Confirmación de Pedido',
          width: 800,
          heightAuto : true,
          html:
          `<b>Cliente:</b> ${clienteNombre} <br> ` +
          `<b>Ciudad:</b> ${ciudad} <br>` +
          `<b>Direccion:</b> ${direccionSede} <br>` +
          `<b>Iva:</b> ${this.iva}% <b>Descuento:</b> ${this.formatonumeros(this.descuento.toFixed(2))}% <br>` +
          `<b>Valor del Pedido</b> ${this.formatonumeros(this.valorfinal.toFixed(2))}<br>`,
          showDenyButton: true,
          showCancelButton: true,
          confirmButtonText: mensaje,
          denyButtonText: `Seguir Editando`,
          cancelButtonText : `Cancelar Pedido`,
        }).then((result) => {
          if (result.isConfirmed) {
            if (!this.modalMode) this.CrearPedidoExterno();
            else this.editarPedido();
          } else if (result.isDenied) {
            const Toast = Swal.mixin({
              toast: true,
              position: 'center',
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true,
              didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer)
                toast.addEventListener('mouseleave', Swal.resumeTimer)
              }
            });
            Toast.fire({
              icon: 'info',
              title: 'Puede seguir editando el pedido'
            });
          } else if (result.isDismissed) this.limpiarTodosCampos();
        });
      }
    } else this.mensajeAdvertencia('¡Hay Campos Vacios!');
  }

  // Funcion para crear los pedidos de productos y añadirlos a la base de datos
  CrearPedidoExterno() {
    this.cargando = true;
    let direccionSede : string = this.FormPedidoExternoClientes.value.PedSedeCli_Id;
    let ciudad : string = this.FormPedidoExternoClientes.value.ciudad_sede;
    let clienteNombre : any = this.FormPedidoExternoClientes.value.PedClienteNombre;

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
          PedExt_Observacion: this.FormPedidoExternoClientes.get('PedObservacion')?.value,
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
        }, error => { this.mensajeError('¡No se pudo crear el pedido, por favor intente de nuevo!', error.message); });
      }
    }, error => { this.mensajeError('¡La dirección y la ciudad escogidas no coninciden!', error.message) });
  }

  // Funcion que creará los detalles del pedido
  crearDetallesPedido(){
    this.pedidoproductoService.srvObtenerUltimoPedido().subscribe(dataPedExternos =>{
      let datos : any = [];
      datos.push(dataPedExternos);
      for (const item of datos) {
        for (let index = 0; index < this.ArrayProducto.length; index++) {
          const productosPedidos : any = {
            Prod_Id: this.ArrayProducto[index].Id,
            PedExt_Id: item.pedExt_Id,
            PedExtProd_Cantidad : this.ArrayProducto[index].Cant,
            UndMed_Id : this.ArrayProducto[index].UndCant,
            PedExtProd_PrecioUnitario : this.ArrayProducto[index].PrecioUnd
          }
          this.PedidoProductosService.srvGuardar(productosPedidos).subscribe(registro_pedido_productos => {
            Swal.fire({icon: 'success', title: 'Pedido Creado Exitosamente', text: 'El pedido fue creado de manera satisfactoria'});
          }, error => { this.mensajeError('¡No se pudo crear el pedido, por favor intente de nuevo!', error.message); });
        }
      }
    });
  }

  // Funcion que va a editar la información principal del pedido
  editarPedido(){
    this.cargando = true;
    let direccionSede : string = this.FormPedidoExternoClientes.value.PedSedeCli_Id;
    let ciudad : string = this.FormPedidoExternoClientes.value.ciudad_sede;
    let clienteNombre : any = this.FormPedidoExternoClientes.value.PedClienteNombre;
    this.pedidoproductoService.srvObtenerListaPorId(this.pedidoEditar).subscribe(datos => {
      this.sedesClientesService.srvObtenerListaPorClienteSede(clienteNombre, ciudad, direccionSede).subscribe(datos_sedeCliente => {
        for (let i = 0; i < datos_sedeCliente.length; i++) {
          const camposPedido : any = {
            PedExt_Id : this.pedidoEditar,
            PedExt_FechaCreacion: datos.pedExt_FechaCreacion,
            PedExt_FechaEntrega: this.FormPedidoExternoClientes.get('PedFechaEnt')?.value,
            Empresa_Id: 800188732,
            PedExt_Codigo: 0,
            SedeCli_Id: datos_sedeCliente[i].sedeCli_Id,
            Usua_Id: datos_sedeCliente[i].usua_Id,
            Estado_Id: 11,
            PedExt_Observacion: this.FormPedidoExternoClientes.get('PedObservacion')?.value,
            PedExt_PrecioTotal: this.valorTotal,
            Creador_Id: datos.creador_Id,
            PedExt_Descuento: this.FormPedidoExternoClientes.value.PedDescuento,
            PedExt_Iva: this.iva,
            PedExt_PrecioTotalFinal : this.valorfinal,
            PedExt_HoraCreacion : datos.pedExt_Hora,
          }
          this.pedidoproductoService.srvActualizarPedidosProductos(this.pedidoEditar,camposPedido).subscribe(data=> {
            this.editarDetallesPedido();
            setTimeout(() => {
              this.limpiarTodosCampos();
              Swal.fire({icon: 'success', title: 'Pedido Editado Exitosamente', text: 'El pedido fue Editado de manera satisfactoria'});
              this.modalReporte_PedidosVendedoresComponent.cargarPedidosPendientes();
              this.productosPedido(this.pedidoEditar);
            }, 2000);
          }, error => { this.mensajeError('¡No se pudo editar el pedido, por favor intente de nuevo!', error.message); });
        }
      }, error => { this.mensajeError('¡La dirección y la ciudad escogidas no coninciden!', error.message) });
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
          }
          this.PedidoProductosService.srvGuardar(productosPedidos).subscribe(registro_pedido_productos => { }, error => {
            this.mensajeError('¡No se pudo Editar el pedido, por favor intente de nuevo!', error.message);
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
                { image : this.appComponent.logoParaPdf, width : 100, height : 80 },
                { text: `Pedido Nro. ${datos_pedido[i].id_Pedido}`, alignment: 'right', style: 'titulo', margin: [0, 30, 0, 0], }
              ]
            },
            '\n \n',
            {
              style: 'tablaEmpresa',
              table: {
                widths: [90, '*', 90, '*'],
                style: 'header',
                body: [
                  [
                    { border: [false, false, false, false], text: `NIT` },
                    { border: [false, false, false, true], text: `${datos_pedido[i].empresa_Id}` },
                    { border: [false, false, false, false], text: `Nombre Empresa` },
                    { border: [false, false, false, true], text: `${datos_pedido[i].empresa}` },
                  ],
                  [
                    { border: [false, false, false, false], text: `Dirección` },
                    { border: [false, false, false, true], text: `${datos_pedido[i].empresa_Direccion}` },
                    { border: [false, false, false, false], text: `Ciudad` },
                    { border: [false, false, false, true], text: `${datos_pedido[i].empresa_Ciudad}` },
                  ],
                  [
                    { border: [false, false, false, false], text: `Fecha de pedido` },
                    { border: [false, false, false, true], text: `${datos_pedido[i].fechaCreacion.replace('T00:00:00', '')}` },
                    { border: [false, false, false, false], text: `Fecha de entrega` },
                    { border: [false, false, false, true], text: `${datos_pedido[i].fechaEntrega.replace('T00:00:00', '')}` },
                  ],
                  [
                    { border: [false, false, false, false], text: `Vendedor` },
                    { border: [false, false, false, true], text: `${datos_pedido[i].vendedor_Id} - ${datos_pedido[i].vendedor}`, fontSize: 8 },
                    { border: [false, false, false, false], text: `Estado del pedido` },
                    { border: [false, false, false, true], text: `${datos_pedido[i].estado}` },
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
            this.table(this.productosPedidos, ['Id', 'Nombre', 'Cantidad', 'Und', 'Precio', 'SubTotal']),
            {
              style: 'tablaTotales',
              table: {
                widths: [256, '*', 98],
                style: 'header',
                body: [
                  [
                    '',
                    { border: [true, false, true, true], text: `SUBTOTAL` },
                    { border: [false, false, true, true], text: `${this.formatonumeros(datos_pedido[i].precio_Total)}` },
                  ],
                  [
                    '',
                    { border: [true, false, true, true], text: `DESCUENTO (%)` },
                    { border: [false, false, true, true], text: `${datos_pedido[i].descuento}%` },
                  ],
                  [
                    '',
                    { border: [true, false, true, true], text: `SUBTOTAL DESCUENTO` },
                    { border: [false, false, true, true], text: `${this.formatonumeros((datos_pedido[i].precio_Total * datos_pedido[i].descuento) / 100)}` },
                  ],
                  [
                    '',
                    { border: [true, false, true, true], text: `IVA (%)` },
                    { border: [false, false, true, true], text: `${this.formatonumeros(datos_pedido[i].iva)}%` },
                  ],
                  [
                    '',
                    { border: [true, false, true, true], text: `SUBTOTAL IVA` },
                    { border: [false, false, true, true], text: `${this.formatonumeros(((datos_pedido[i].precio_Total * datos_pedido[i].iva) / 100))}` },
                  ],
                  [
                    '',
                    { border: [true, false, true, true], text: `TOTAL` },
                    { border: [false, false, true, true], text: `${this.formatonumeros(datos_pedido[i].precio_Final)}` },
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
        widths: [50, 197, 50, 50, 50, 98],
        body: this.buildTableBody(data, columns),
      },
      fontSize: 8,
      layout: {
        fillColor: function (rowIndex, node, columnIndex) {
          return (rowIndex == 0) ? '#CCCCCC' : null;
        }
      }
    };
  }

  // Función para quitar un producto de la tabla
  QuitarProductoTabla(data : any) {
    this.productoEliminado = data.Id
    Swal.fire({
      title: '¿Estás seguro de eliminar el producto del pedido?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        for (let i = 0; i < this.ArrayProducto.length; i++) {
          if (this.ArrayProducto[i].Id == data.Id) {
            this.ArrayProducto.splice(i, 1);
            this.valorTotal -= data.SubTotal;
            setTimeout(() => { this.ivaDescuento(); }, 200);
            this.mensajeAdvertencia('Producto eliminado');
            break;
          }
        }
      }
    });
  }

  //Funcion que va a eliminar de la base de datos un producto del pedido
  eliminarProducto(data : any){
    this.PedidoProductosService.srvObtenerListaPorIdProducto_Pedido(data.Id, this.pedidoEditar).subscribe(datos => {
      if (datos.length > 0) {
        Swal.fire({
          title: '¿Estás seguro de eliminar el producto del pedido?',
          text: `Al eliminar el producto en este apartado de edición se Eliminará Tambien de la Base de Datos`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Eliminar'
        }).then((result) => {
          if (result.isConfirmed) {
            this.PedidoProductosService.srvEliminar(data.Id, this.pedidoEditar).subscribe(datos_Eliminados => {
              for (let i = 0; i < this.ArrayProducto.length; i++) {
                if (this.ArrayProducto[i].Id == data.Id) {
                  this.ArrayProducto.splice(i, 1);
                  this.valorTotal = this.valorTotal - data.SubTotal;
                  this.ivaDescuento();
                  this.mensajeAdvertencia('Producto eliminado');
                  break;
                }
              }
            });
          }
        });
      } else this.QuitarProductoTabla(data);
    });
  }

  // Mensaje de Advertencia
  mensajeAdvertencia(mensaje : string, mensaje2 : string = ''){
    Swal.fire({ icon: 'warning', title: 'Advertencia', html:`<b>${mensaje}</b><hr> ` + `<spam>${mensaje2}</spam>`, showCloseButton: true, });
  }

  // Mensaje de Error
  mensajeError(text : string, error : any = ''){
    Swal.fire({ icon: 'error', title: 'Error', html: `<b>${text}</b><hr> ` +  `<spam style="color : #f00;">${error}</spam> `, showCloseButton: true, });
  }
}
