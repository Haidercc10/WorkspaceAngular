import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import pdfMake from 'pdfmake/build/pdfmake';
import { AsignacionProductosFacturaService } from 'src/app/Servicios/FacturacionRollos/AsignacionProductosFactura.service';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { ClientesService } from 'src/app/Servicios/Clientes/clientes.service';
import { ClientesProductosService } from 'src/app/Servicios/Clientes_Productos/ClientesProductos.service';
import { DetallesAsignacionProductosFacturaService } from 'src/app/Servicios/DetallesFacturacionRollos/DetallesAsignacionProductosFactura.service';
import { DetallesEntradaRollosService } from 'src/app/Servicios/DetallesEntradasRollosDespacho/DetallesEntradaRollos.service';
import { ExistenciasProductosService } from 'src/app/Servicios/ExistenciasProductos/existencias-productos.service';
import { ProductoService } from 'src/app/Servicios/Productos/producto.service';
import { RolesService } from 'src/app/Servicios/Roles/roles.service';
import { UsuarioService } from 'src/app/Servicios/Usuarios/usuario.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-AsignarProductosFacturas',
  templateUrl: './AsignarProductosFacturas.component.html',
  styleUrls: ['./AsignarProductosFacturas.component.css'],
})

export class AsignarProductosFacturasComponent implements OnInit {

  public FormConsultarProductos !: FormGroup; //formulario para consultar y crear un ingreso de rollos
  public FormEditUnd !: FormGroup;
  public FormEditPaquetes !: FormGroup;

  cargando : boolean = true; //Variable para validar que salga o no la imagen de carga
  today : any = new Date(); //Variable que se usará para llenar la fecha actual
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  checked : boolean = false; //Variable para saber si el checkbox está seleccionado o no
  rollos : any [] = []; //Variable que almacenará los difrentes rollos que se hicieron en la orden de trabajo
  rollosInsertar : any [] = []; //Variable que va a amacenar los diferentes rollos que se van a insertar
  validarRollo : any [] = []; //Variable para validará que el rollo no esté en la tabla
  idProducto : number = 0; //Variable que va a almacenar el id del producto que fue hecho en la ot consultada
  presentacionProducto : string = ''; //Variable que almacenará la presentacion del producto de la orden de trabajo consultada
  rollosAsignados : any [] = []; //Variable que va a almacenar los rollos que fueron asignados a la factura creada
  Productos = [];
  check : boolean; //Variable que nos a ayudar para saber si un rollo ya fue seleccionado
  Total : number = 0; //Variable que va a almacenar la cantidad total de kg de los rollos asignados
  cantidadOT : number = 0; //
  grupoProductos : any [] = []; //Variable que guardará de manera descriminada a cada producto
  cantTotalProducto : number = 0; //Variable que servirá para mostrar la cantidad total de existencias de un producto consultado
  idCliente : any = 0; //variable que va a almacenar el id del cliente seleccionado

  keywordNombresProductos = 'prod_Nombre'; /** Variable de palabra clave para Input Producto. */
  validarInputNombresProductos : any = true; /** Variable para validar input producto */
  arrayProducto=[]; /** Array que guardará los productos en el select input */
  keywordClientes = 'cli_Nombre'; /** Variable de palabra clave para Input Producto. */
  validarInputClientes : any = true; /** Variable para validar input producto */
  arrayClientes=[]; /** Array que guardará los clientes en el select input */
  arrayConductor =[];  /** Array que guardará los conductores en el select input */
  public page : number;
  cantPage : number = 25;
  windowScrolled : any;

  constructor(private frmBuilderPedExterno : FormBuilder,
                private rolService : RolesService,
                  @Inject(SESSION_STORAGE) private storage: WebStorageService,
                    private bagProService : BagproService,
                      private ExistenciasProdService : ExistenciasProductosService,
                        private servicioProducto : ProductoService,
                          private servicioClientes: ClientesService,
                            private servicioClientesProductos : ClientesProductosService,
                              private servicioUsuarios : UsuarioService,
                                private dtEntradaRollo : DetallesEntradaRollosService,
                                  private asgProdFactura : AsignacionProductosFacturaService,
                                    private dtAsgProdFactura : DetallesAsignacionProductosFacturaService,
                                      private productosService : ProductoService,) {

    this.FormConsultarProductos = this.frmBuilderPedExterno.group({
      Factura : ['', Validators.required],
      NotaCredito : [''],
      IdProducto : [''],
      CantidadProducto : [''],
      ProdNombre: [''],
      Cliente: [null, Validators.required],
      Observacion : [''],
    });

    this.FormEditUnd = this.frmBuilderPedExterno.group({
      Cantidad : [''],
    });

    this.FormEditPaquetes = this.frmBuilderPedExterno.group({
      Cantidad : [''],
    });
  }

  ngOnInit() {
    // this.limpiarCampos();
    this.fecha();
    this.lecturaStorage();
    this.ObtenerUsuariosConductores();
    this.llenadoClientes();
  }

  //
  selectEventCliente() {
    let datosNumeros : any = /^[0-9]*(\.?)[ 0-9]+$/;
    this.idCliente = this.FormConsultarProductos.value.Cliente;
    if (this.idCliente.match(datosNumeros) != null){
      this.servicioClientes.srvObtenerListaPorId(this.FormConsultarProductos.value.Cliente).subscribe(datos_cliente => {
        this.FormConsultarProductos = this.frmBuilderPedExterno.group({
          Factura : this.FormConsultarProductos.value.Factura,
          NotaCredito : this.FormConsultarProductos.value.NotaCredito,
          IdProducto : this.FormConsultarProductos.value.IdProducto,
          CantidadProducto : this.FormConsultarProductos.value.CantidadProducto,
          ProdNombre: this.FormConsultarProductos.value.ProdNombre,
          Cliente: datos_cliente.cli_Nombre,
          Observacion : this.FormConsultarProductos.value.Observacion,
        });
      });
    }
  }

  //Funcion que hará que la pagina baje
  scrollToTop(){
    window.scroll(0, 999999999999);
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

  // Funcion para limpiar los campos de la vista
  limpiarCampos(){
    this.FormConsultarProductos.setValue({
      Factura : '',
      NotaCredito : '',
      IdProducto : '',
      CantidadProducto : '',
      ProdNombre: '',
      Cliente: '',
      Observacion : '',
    });
    this.rollos = [];
    this.rollosInsertar = [];
    this.rollosAsignados = [];
    this.validarRollo = [];
    this.grupoProductos = [];
    this.cantTotalProducto = 0;
    this.presentacionProducto = '';
    this.cargando = true;
    this.validarInputClientes = true;
    this.Total = 0;
    // window.location.href = "./asignacion-productos-facturas";
  }

  //Funcion que va a agregar Productos en la tabla
  cargarProducto(item : any){
    if (this.rollosInsertar.length == 0) {
      let info : any = {
        Id : item.Id,
        IdProducto : item.IdProducto,
        Producto : item.Producto,
        Cantidad : item.Cantidad,
        Presentacion : item.Presentacion,
        CantUndPaquetes : item.CantUndPaquetes,
        CantUndRestantes : item.CantUndRestantes,
        CantPaqRestantes : item.CantPaqRestantes,
        CantUndRestantesEnviar : item.CantUndRestantesEnviar,
        CantPaqRestantesEnviar : item.CantPaqRestantesEnviar,
        suma : item.suma,
      }

      this.rollosInsertar.push(info);
      this.validarRollo.push(item.Id);
      this.Total += item.CantPaqRestantes;
      this.cantTotalProducto -= item.CantPaqRestantes;
      this.presentacionProducto = item.Presentacion;
    } else {
      if (!this.validarRollo.includes(item.Id)) {
        let info : any = {
          Id : item.Id,
          IdProducto : item.IdProducto,
          Producto : item.Producto,
          Cantidad : item.Cantidad,
          Presentacion : item.Presentacion,
          CantUndPaquetes : item.CantUndPaquetes,
          CantUndRestantes : item.CantUndRestantes,
          CantPaqRestantes : item.CantPaqRestantes,
          CantUndRestantesEnviar : item.CantUndRestantesEnviar,
          CantPaqRestantesEnviar : item.CantPaqRestantesEnviar,
          suma : item.suma,
        }
        this.rollosInsertar.push(info);
        this.validarRollo.push(item.Id);
        this.Total += item.Cantidad;
        this.cantTotalProducto -= item.CantPaqRestantes;
        this.presentacionProducto = item.Presentacion;
      } else if (this.validarRollo.includes(item.Id)) {
        for (let i = 0; i < this.rollosInsertar.length; i++) {
          if (this.rollosInsertar[i].Id == item.Id) this.rollosInsertar.splice(i,1);
        }
        for (let i = 0; i < this.validarRollo.length; i++) {
          if (this.validarRollo[i] == item.Id) this.validarRollo.splice(i,1);
        }
        this.Total -= item.CantPaqRestantes;
        this.cantTotalProducto -= item.CantPaqRestantes;
        this.presentacionProducto = item.Presentacion;
      }
    }
    for (let i = 0; i < this.rollos.length; i++) {
      if (this.rollos[i].Id == item.Id) this.rollos.splice(i,1);
    }
    setTimeout(() => { this.GrupoProductos(); }, 500);
  }

  // Funcion que va a seleccionar todo lo que hay en la tabla
  selccionarTodo(){
    this.cantTotalProducto = 0;
    this.presentacionProducto = '';
    for (const item of this.rollos) {
      let info : any = {
        Id : item.Id,
        IdProducto : item.IdProducto,
        Producto : item.Producto,
        Cantidad : item.Cantidad,
        Presentacion : item.Presentacion,
        CantUndPaquetes : item.CantUndPaquetes,
        CantUndRestantes : item.CantUndRestantes,
        CantPaqRestantes : item.CantPaqRestantes,
        CantUndRestantesEnviar : item.CantUndRestantesEnviar,
        CantPaqRestantesEnviar : item.CantPaqRestantesEnviar,
        suma : item.suma,
      }
      this.Total += item.CantPaqRestantes;
      this.rollosInsertar.push(info);
      this.validarRollo.push(item.Id);
    }
    setTimeout(() => { this.rollos = []; }, 100);
    setTimeout(() => { this.GrupoProductos(); }, 500);
  }

  // Funcion que se va a encargar de quitar rollos de la tabla inferior
  quitarRollo(item : any){
    let info : any = {
      Id : item.Id,
      IdProducto : item.IdProducto,
      Producto : item.Producto,
      Cantidad : item.Cantidad,
      Presentacion : item.Presentacion,
      CantUndPaquetes : item.CantUndPaquetes,
      CantUndRestantes : item.CantUndRestantesEnviar,
      CantPaqRestantes : item.CantPaqRestantesEnviar,
      CantUndRestantesEnviar : item.CantUndRestantesEnviar,
      CantPaqRestantesEnviar : item.CantPaqRestantesEnviar,
      suma : item.suma,
    }
    this.rollos.push(info);
    this.Total -= item.CantPaqRestantes;
    this.cantTotalProducto += item.CantPaqRestantes;
    this.presentacionProducto = item.Presentacion;
    for (let i = 0; i < this.rollosInsertar.length; i++) {
      if (this.rollosInsertar[i].Id == item.Id) this.rollosInsertar.splice(i,1);
    }
    for (let i = 0; i < this.validarRollo.length; i++) {
      if (this.validarRollo[i] == item.Id) this.validarRollo.splice(i,1);
    }
    setTimeout(() => { this.GrupoProductos(); }, 500);
  }

  // Funcion que va a quitar todo lo que hay en la tabla
  quitarTodo(){
    for (const item of this.rollosInsertar) {
      let info : any = {
        Id : item.Id,
        IdProducto : item.IdProducto,
        Producto : item.Producto,
        Cantidad : item.Cantidad,
        Presentacion : item.Presentacion,
        CantUndPaquetes : item.CantUndPaquetes,
        CantUndRestantes : item.CantUndRestantesEnviar,
        CantPaqRestantes : item.CantPaqRestantesEnviar,
        CantUndRestantesEnviar : item.CantUndRestantesEnviar,
        CantPaqRestantesEnviar : item.CantPaqRestantesEnviar,
        suma : item.suma,
      }
      this.cantTotalProducto += item.CantPaqRestantes;
      this.presentacionProducto = item.Presentacion;
      this.rollos.push(info);
      this.Total = 0;
    }
    setTimeout(() => {
      this.rollosInsertar = [];
      this.validarRollo = [];
    }, 100);
    setTimeout(() => { this.GrupoProductos(); }, 500);
  }

  //Funcion que llanará el array de clientes
  llenadoClientes(){
    this.servicioClientes.srvObtenerLista().subscribe(registrosClientes => {
      for (let index = 0; index < registrosClientes.length; index++) {
        let Clientes : any = registrosClientes[index];
        this.arrayClientes.push(Clientes);
        this.arrayClientes.sort((a,b) => a.cli_Nombre.localeCompare(b.cli_Nombre));
      }
    });
  }

  //Funcion que va mostrar todos los productos a los que está relacionado el cliente selccionado
  obtenerProductosXClientes(){
    this.arrayProducto = [];
    let Client : any = this.FormConsultarProductos.value.Cliente;

    this.servicioClientesProductos.srvObtenerListaPorNombreCliente(Client).subscribe(registrosCliProd => {
      for (let index = 0; index < registrosCliProd.length; index++) {
        this.servicioProducto.srvObtenerPresentacionProducto(registrosCliProd[index].prod_Id).subscribe(registrosPresentProd => {
          for (let j = 0; j < registrosPresentProd.length; j++) {
            this.arrayProducto.push(registrosPresentProd[j]);
          }
        });
      }
    });
  }

  //Funcion que a mostrar los usuarios de tipo conductor
  ObtenerUsuariosConductores() {
    this.servicioUsuarios.srvObtenerListaUsuario().subscribe(registrosUsuarios => {
      for (let index = 0; index < registrosUsuarios.length; index++) {
        this.servicioUsuarios.srvObtenerListaPorIdConductor(registrosUsuarios[index].usua_Id).subscribe(registrosConductores => {
          for (let ind = 0; ind < registrosConductores.length; ind++) {
            this.arrayConductor.push(registrosConductores[ind]);
          }
        });
      }
    });
  }

  // Funcion que va a mostrar por la cantidad deseada
  mostrarRollosPorCantidad(){
    this.cargando = false;
    this.rollos = [];
    this.cantTotalProducto = 0;
    this.presentacionProducto = '';
    let id : number = this.FormConsultarProductos.value.IdProducto;
    this.dtEntradaRollo.srvConsultarProducto(id).subscribe(datos_rollos => {
      console.log(9)
      let rollosExistentes : any [] = [];
      for (let i = 0; i < datos_rollos.length; i++) {
        if (datos_rollos[i].estado_Id == 19 || datos_rollos[i].estado_Id == 24) {
          if (datos_rollos[i].undMed_Rollo == 'Paquete') {
            let info : any = {
              Id : datos_rollos[i].rollo_Id,
              IdProducto : datos_rollos[i].prod_Id,
              Producto : datos_rollos[i].prod_Nombre,
              Cantidad : datos_rollos[i].dtEntRolloProd_Cantidad,
              Presentacion : datos_rollos[i].undMed_Rollo,
              CantUndPaquetes : datos_rollos[i].prod_CantBolsasPaquete,
              CantUndRestantes : datos_rollos[i].prod_CantBolsasRestates,
              CantPaqRestantes : datos_rollos[i].prod_CantPaquetesRestantes,
              CantUndRestantesEnviar : datos_rollos[i].prod_CantBolsasRestates,
              CantPaqRestantesEnviar : datos_rollos[i].prod_CantPaquetesRestantes,
              suma : false,
            }

            this.rollos.push(info);
            rollosExistentes.push(datos_rollos[i].rollo_Id);
            this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
            this.cantTotalProducto += datos_rollos[i].dtEntRolloProd_Cantidad;
            this.presentacionProducto = datos_rollos[i].undMed_Rollo;
            this.FormConsultarProductos.setValue({
              Factura : this.FormConsultarProductos.value.Factura,
              NotaCredito : this.FormConsultarProductos.value.NotaCredito,
              IdProducto : this.FormConsultarProductos.value.IdProducto,
              CantidadProducto : this.FormConsultarProductos.value.CantidadProducto,
              ProdNombre: datos_rollos[i].prod_Nombre,
              Cliente: this.FormConsultarProductos.value.Cliente,
              Observacion : this.FormConsultarProductos.value.Observacion,
            });
            this.validarInputNombresProductos = false;
          } else {
            let info : any = {
              Id : datos_rollos[i].rollo_Id,
              IdProducto : datos_rollos[i].prod_Id,
              Producto : datos_rollos[i].prod_Nombre,
              Cantidad : datos_rollos[i].dtEntRolloProd_Cantidad,
              Presentacion : datos_rollos[i].undMed_Rollo,
              CantUndPaquetes : datos_rollos[i].prod_CantBolsasPaquete,
              CantUndRestantes : datos_rollos[i].prod_CantBolsasRestates,
              CantPaqRestantes : datos_rollos[i].prod_CantBolsasRestates,
              CantUndRestantesEnviar : datos_rollos[i].prod_CantBolsasRestates,
              CantPaqRestantesEnviar : datos_rollos[i].prod_CantPaquetesRestantes,
              suma : false,
            }
            this.rollos.push(info);
            rollosExistentes.push(datos_rollos[i].rollo_Id);
            this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
            this.cantTotalProducto += datos_rollos[i].dtEntRolloProd_Cantidad;
            this.presentacionProducto = datos_rollos[i].undMed_Rollo;
            this.FormConsultarProductos.setValue({
              Factura : this.FormConsultarProductos.value.Factura,
              NotaCredito : this.FormConsultarProductos.value.NotaCredito,
              IdProducto : this.FormConsultarProductos.value.IdProducto,
              CantidadProducto : this.FormConsultarProductos.value.CantidadProducto,
              ProdNombre: datos_rollos[i].prod_Nombre,
              Cliente: this.FormConsultarProductos.value.Cliente,
              Observacion : this.FormConsultarProductos.value.Observacion,
            });
            this.validarInputNombresProductos = false;
          }
        }
      }
    });
    setTimeout(() => {
      let cantidadPedida : number = this.FormConsultarProductos.value.CantidadProducto;
      let sumaCantidad : number = 0;
      this.cantTotalProducto = 0;
      for (let i = 0; i < this.rollos.length; i++) {

        if (sumaCantidad == cantidadPedida) break;
        else if (sumaCantidad >= cantidadPedida) break;
        else if (sumaCantidad < cantidadPedida) {
          sumaCantidad += this.rollos[i].CantPaqRestantes;
          this.rollos[i].suma = true;
          this.cantTotalProducto += this.rollos[i].CantPaqRestantes;
          this.presentacionProducto = this.rollos[i].Presentacion;
        }
      }
      setTimeout(() => {
        let nuevo : any = this.rollos.filter((item) => item.suma === true);
        this.rollos = [];
        this.rollos = nuevo;
        this.cargando = true;
      }, 1000);
    }, 1050);
  }

  // Funcion que permitirá buscar los rollos por el id del producto
  buscarItem(){
    this.rollos = [];
    this.cantTotalProducto = 0;
    this.presentacionProducto = '';
    let id : number = this.FormConsultarProductos.value.IdProducto;
    this.dtEntradaRollo.srvConsultarProducto(id).subscribe(datos_rollos => {
      let rollosExistentes : any [] = [];
      for (let i = 0; i < datos_rollos.length; i++) {
        if (datos_rollos[i].estado_Id == 19 || datos_rollos[i].estado_Id == 24) {
          if (datos_rollos[i].undMed_Rollo == 'Paquete') {
            let info : any = {
              Id : datos_rollos[i].rollo_Id,
              IdProducto : datos_rollos[i].prod_Id,
              Producto : datos_rollos[i].prod_Nombre,
              Cantidad : datos_rollos[i].dtEntRolloProd_Cantidad,
              Presentacion : datos_rollos[i].undMed_Rollo,
              CantUndPaquetes : datos_rollos[i].prod_CantBolsasPaquete,
              CantUndRestantes : datos_rollos[i].prod_CantBolsasRestates,
              CantPaqRestantes : datos_rollos[i].prod_CantPaquetesRestantes,
              CantUndRestantesEnviar : datos_rollos[i].prod_CantBolsasRestates,
              CantPaqRestantesEnviar : datos_rollos[i].prod_CantPaquetesRestantes,
              suma : false,
            }
            if (info.CantPaqRestantes > 0) this.rollos.push(info);
            rollosExistentes.push(datos_rollos[i].rollo_Id);
            this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
            this.cantTotalProducto += datos_rollos[i].prod_CantPaquetesRestantes;
            this.presentacionProducto = datos_rollos[i].undMed_Rollo;
            this.FormConsultarProductos.setValue({
              Factura : this.FormConsultarProductos.value.Factura,
              NotaCredito : this.FormConsultarProductos.value.NotaCredito,
              IdProducto : this.FormConsultarProductos.value.IdProducto,
              CantidadProducto : this.FormConsultarProductos.value.CantidadProducto,
              ProdNombre: datos_rollos[i].prod_Nombre,
              Cliente: this.FormConsultarProductos.value.Cliente,
              Observacion : this.FormConsultarProductos.value.Observacion,
            });
            this.validarInputNombresProductos = false;
          } else {
            let info : any = {
              Id : datos_rollos[i].rollo_Id,
              IdProducto : datos_rollos[i].prod_Id,
              Producto : datos_rollos[i].prod_Nombre,
              Cantidad : datos_rollos[i].dtEntRolloProd_Cantidad,
              Presentacion : datos_rollos[i].undMed_Rollo,
              CantUndPaquetes : datos_rollos[i].prod_CantBolsasPaquete,
              CantUndRestantes : datos_rollos[i].prod_CantBolsasRestates,
              CantPaqRestantes : datos_rollos[i].prod_CantBolsasRestates,
              CantUndRestantesEnviar : datos_rollos[i].prod_CantBolsasRestates,
              CantPaqRestantesEnviar : datos_rollos[i].prod_CantPaquetesRestantes,
              suma : false,
            }
            if (info.CantPaqRestantes > 0) this.rollos.push(info);
            rollosExistentes.push(datos_rollos[i].rollo_Id);
            this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
            this.cantTotalProducto += datos_rollos[i].prod_CantPaquetesRestantes;
            this.presentacionProducto = datos_rollos[i].undMed_Rollo;
            this.FormConsultarProductos.setValue({
              Factura : this.FormConsultarProductos.value.Factura,
              NotaCredito : this.FormConsultarProductos.value.NotaCredito,
              IdProducto : this.FormConsultarProductos.value.IdProducto,
              CantidadProducto : this.FormConsultarProductos.value.CantidadProducto,
              ProdNombre: datos_rollos[i].prod_Nombre,
              Cliente: this.FormConsultarProductos.value.Cliente,
              Observacion : this.FormConsultarProductos.value.Observacion,
            });
            this.validarInputNombresProductos = false;
          }
        }
      }
    });
    setTimeout(() => {
      if (this.rollos.length <= 0) Swal.fire(`El producto ${id} no tiene rollos disponibles`);
    }, 700);
  }

  // Funcion que permitirá ver el total de lo escogido para cada producto
  GrupoProductos(){
    let producto : any = [];
    this.grupoProductos = [];
    this.Total = 0;
    for (let i = 0; i < this.rollosInsertar.length; i++) {
      if (!producto.includes(this.rollosInsertar[i].IdProducto)) {
        let cantidad : number = 0;
        let cantUnidades : number = 0;
        let cantRollo : number = 0;
        for (let j = 0; j < this.rollosInsertar.length; j++) {
          if (this.rollosInsertar[i].IdProducto == this.rollosInsertar[j].IdProducto) {
            cantidad += this.rollosInsertar[j].CantPaqRestantes;
            cantUnidades += this.rollosInsertar[j].CantUndRestantes;
            cantRollo += 1;
          }
        }
        producto.push(this.rollosInsertar[i].IdProducto);
        let info : any = {
          Id : this.rollosInsertar[i].IdProducto,
          Nombre : this.rollosInsertar[i].Producto,
          Cantidad : this.formatonumeros(cantidad.toFixed(2)),
          Cantidad2 : cantidad,
          Rollos: this.formatonumeros(cantRollo.toFixed(2)),
          Presentacion : this.rollosInsertar[i].Presentacion,
          Cant_Unidades : this.formatonumeros(cantUnidades.toFixed(2)),
        }
        this.Total += cantidad;
        this.grupoProductos.push(info);
      }
    }
  }

  // Funcion que a cambiar el valor de la cantidad de unidades asignadas para un paquete
  cambiarCantidadUnidades(item : any){
    let cantidad : number = this.FormEditUnd.value.Cantidad;
    for (let i = 0; i < this.rollosInsertar.length; i++) {
      if (this.rollosInsertar[i].Id == item.Id) {
        if (cantidad <= this.rollosInsertar[i].CantUndRestantesEnviar && cantidad > 0 && cantidad != null && cantidad != undefined) {
          this.rollosInsertar[i].CantUndRestantes = cantidad;
          this.rollosInsertar[i].CantPaqRestantes = cantidad;
          this.GrupoProductos();
        } else {
          Swal.fire("¡La cantidad ingresada no es valida!");
          this.rollosInsertar[i].CantUndRestantes = this.rollosInsertar[i].CantUndRestantesEnviar;
          this.rollosInsertar[i].CantPaqRestantes = this.rollosInsertar[i].CantPaqRestantesEnviar;
        }
      }
    }
  }

  // Funcion que a cambiar el valor de la cantidad de unidades asignadas para un paquete
  cambiarCantidadPaquetes(item : any){
    let cantidad : number = this.FormEditPaquetes.value.Cantidad;
    for (let i = 0; i < this.rollosInsertar.length; i++) {
      if (this.rollosInsertar[i].Id == item.Id) {
        if (cantidad <= this.rollosInsertar[i].CantPaqRestantesEnviar && cantidad > 0 && cantidad != null && cantidad != undefined) {
          this.rollosInsertar[i].CantPaqRestantes = cantidad;
          this.rollosInsertar[i].CantUndRestantes = (this.rollosInsertar[i].CantPaqRestantes * this.rollosInsertar[i].CantUndPaquetes);
          this.GrupoProductos();
        } else {
          Swal.fire("¡La cantidad ingresada no es valida!");
          this.rollosInsertar[i].CantUndRestantes = this.rollosInsertar[i].CantUndRestantesEnviar;
          this.rollosInsertar[i].CantPaqRestantes = this.rollosInsertar[i].CantPaqRestantesEnviar;
        }
      }
    }
  }

  // Funcion para cargar en la base de datos la informacion de una factura a la que se le asignarán rollos
  crearAsignacion(){
    if (this.rollosInsertar.length != 0 && this.FormConsultarProductos.valid && this.FormConsultarProductos.value.Factura != '') {
      this.cargando = false;
      let factura : string = this.FormConsultarProductos.value.Factura;
      let notaCredito : string = this.FormConsultarProductos.value.NotaCredito;
      let cliente : any = this.FormConsultarProductos.value.Cliente;
      let observacion : string = this.FormConsultarProductos.value.Observacion;
      let facturaMayuscula : string = `${factura}`;
      if (notaCredito == '' || notaCredito == null) notaCredito = '';
      else if (notaCredito != '' || notaCredito != null) notaCredito.toUpperCase();
      let info : any = {
        FacturaVta_Id : facturaMayuscula.toUpperCase(),
        NotaCredito_Id : notaCredito,
        Usua_Id : this.storage_Id,
        AsigProdFV_Fecha : this.today,
        AsigProdFV_Hora : moment().format("H:mm:ss"),
        AsigProdFV_Observacion : observacion,
        Cli_Id : this.idCliente,
        Usua_Conductor : 88,
        AsigProdFV_PlacaCamion : '',
        AsigProdFV_FechaEnvio : this.today,
        AsigProdFV_HoraEnvio : moment().format('H:mm:ss'),
      }
      this.asgProdFactura.srvGuardar(info).subscribe(datos_asignacion => {
        this.asgProdFactura.srvObtenerUltimoId().subscribe(datos_ultimaAsg => { this.crearDetallesAsignacion(datos_ultimaAsg.asigProdFV_Id) });
      }, error => {
        const Toast = Swal.mixin({
          toast: true,
          position: 'center',
          showConfirmButton: false,
          timer: 2500,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
          }
        });
        Toast.fire({
          icon: 'error',
          title: '¡Error al asignar los rollos!'
        });
        this.cargando = true;
      });
    } else Swal.fire("¡Hay campos vacios!");
  }

  // Funcion para subir los detalles de la asignacion, es decir, cada rollo que se asignó a la factura
  crearDetallesAsignacion(asignacion : number){
    for (let i = 0; i < this.rollosInsertar.length; i++) {
      let info : any = {
        AsigProdFV_Id : asignacion,
        Prod_Id : this.rollosInsertar[i].IdProducto,
        DtAsigProdFV_Cantidad : this.rollosInsertar[i].CantPaqRestantes,
        UndMed_Id : this.rollosInsertar[i].Presentacion,
        Rollo_Id : this.rollosInsertar[i].Id,
        Prod_CantidadUnidades : this.rollosInsertar[i].CantUndRestantes,
      }
      this.dtAsgProdFactura.srvGuardar(info).subscribe(datos_dtAsignacion => {
      }, error => {
        const Toast = Swal.mixin({
          toast: true,
          position: 'center',
          showConfirmButton: false,
          timer: 2500,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
          }
        });
        Toast.fire({
          icon: 'error',
          title: '¡Error al asignar los rollos!'
        });
        this.cargando = true;
      });
    }
    setTimeout(() => { this.cambiarEstado(); }, this.rollosInsertar.length * 50);
  }

  // Funcion que va a cambiar el estado de los rollos que estan siendo asignados a una factura
  cambiarEstado(){
    let estado : number = 20;
    for (let i = 0; i < this.rollosInsertar.length; i++) {
      this.dtEntradaRollo.srvObtenerVerificarRollo(this.rollosInsertar[i].Id).subscribe(datos_rollos => {
        for (let j = 0; j < datos_rollos.length; j++) {
          if(this.rollosInsertar[i].Presentacion == 'Paquete') {
            let paquetesRestantes : number = datos_rollos[j].prod_CantPaquetesRestantes - this.rollosInsertar[i].CantPaqRestantes;
            if (paquetesRestantes > 0) estado = 19;
            let info : any = {
              DtEntRolloProd_Codigo : datos_rollos[j].dtEntRolloProd_Codigo,
              EntRolloProd_Id : datos_rollos[j].entRolloProd_Id,
              Rollo_Id : datos_rollos[j].rollo_Id,
              DtEntRolloProd_Cantidad : datos_rollos[j].dtEntRolloProd_Cantidad,
              undMed_Rollo : datos_rollos[j].undMed_Rollo,
              Estado_Id : estado,
              dtEntRolloProd_OT : datos_rollos[j].dtEntRolloProd_OT,
              Prod_Id : datos_rollos[j].prod_Id,
              UndMed_Prod : datos_rollos[j].undMed_Prod,
              Prod_CantPaquetesRestantes : (paquetesRestantes),
              Prod_CantBolsasPaquete : datos_rollos[j].prod_CantBolsasPaquete,
              Prod_CantBolsasBulto : datos_rollos[j].prod_CantBolsasBulto,
              Prod_CantBolsasRestates : (datos_rollos[j].prod_CantBolsasRestates - this.rollosInsertar[i].CantUndRestantes),
              Prod_CantBolsasFacturadas : (this.rollosInsertar[i].CantUndRestantes + datos_rollos[j].prod_CantBolsasFacturadas),
              Proceso_Id : datos_rollos[j].proceso_Id,
            }
            this.dtEntradaRollo.srvActualizar(datos_rollos[j].dtEntRolloProd_Codigo, info).subscribe(datos_rolloActuializado => { });
          } else {
            estado = 20;
            if (this.rollosInsertar[i].CantUndRestantes < datos_rollos[j].prod_CantPaquetesRestantes) estado = 19;
            let info : any = {
              DtEntRolloProd_Codigo : datos_rollos[j].dtEntRolloProd_Codigo,
              EntRolloProd_Id : datos_rollos[j].entRolloProd_Id,
              Rollo_Id : datos_rollos[j].rollo_Id,
              DtEntRolloProd_Cantidad : datos_rollos[j].dtEntRolloProd_Cantidad,
              undMed_Rollo : datos_rollos[j].undMed_Rollo,
              Estado_Id : estado,
              dtEntRolloProd_OT : datos_rollos[j].dtEntRolloProd_OT,
              Prod_Id : datos_rollos[j].prod_Id,
              UndMed_Prod : datos_rollos[j].undMed_Prod,
              Prod_CantPaquetesRestantes : (datos_rollos[j].prod_CantPaquetesRestantes - this.rollosInsertar[i].CantUndRestantes),
              Prod_CantBolsasPaquete : datos_rollos[j].prod_CantBolsasPaquete,
              Prod_CantBolsasBulto : datos_rollos[j].prod_CantBolsasBulto,
              Prod_CantBolsasRestates : (datos_rollos[j].prod_CantBolsasRestates - this.rollosInsertar[i].CantUndRestantes),
              Prod_CantBolsasFacturadas : (this.rollosInsertar[i].CantUndRestantes + datos_rollos[j].prod_CantBolsasFacturadas),
              Proceso_Id : datos_rollos[j].proceso_Id,
            }
            this.dtEntradaRollo.srvActualizar(datos_rollos[j].dtEntRolloProd_Codigo, info).subscribe(datos_rolloActuializado => { });
          }
        }
      });
    }
    setTimeout(() => { this.moverInventarioProductos(); }, 4000);
  }

  // Funcion que va a mover el inventario de los productos
  moverInventarioProductos(){
    for (let i = 0; i < this.grupoProductos.length; i++) {
      this.ExistenciasProdService.srvObtenerListaPorIdProductoPresentacion(this.grupoProductos[i].Id, this.grupoProductos[i].Presentacion).subscribe(datos_productos => {
        for (let j = 0; j < datos_productos.length; j++) {
          let info : any = {
            Prod_Id: datos_productos[j].prod_Id,
            exProd_Id : datos_productos[j].exProd_Id,
            ExProd_Cantidad: (datos_productos[j].exProd_Cantidad - this.grupoProductos[i].Cantidad2),
            UndMed_Id: datos_productos[j].undMed_Id,
            TpBod_Id: datos_productos[j].tpBod_Id,
            ExProd_Precio: datos_productos[j].exProd_Precio,
            ExProd_PrecioExistencia: (datos_productos[j].exProd_Cantidad - this.grupoProductos[i].Cantidad2) * datos_productos[j].exProd_PrecioVenta,
            ExProd_PrecioSinInflacion: datos_productos[j].exProd_PrecioSinInflacion,
            TpMoneda_Id: datos_productos[j].tpMoneda_Id,
            ExProd_PrecioVenta: datos_productos[j].exProd_PrecioVenta,
          }
          this.ExistenciasProdService.srvActualizar(datos_productos[j].exProd_Id, info).subscribe(datos_existenciaActualizada => {
            const Toast = Swal.mixin({
              toast: true,
              position: 'center',
              showConfirmButton: false,
              timer: 3500,
              timerProgressBar: true,
              didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer)
                toast.addEventListener('mouseleave', Swal.resumeTimer)
              }
            });
            Toast.fire({
              icon: 'success',
              title: `¡La asignación de los rollos a la factura ${this.FormConsultarProductos.value.Factura.toUpperCase()} fue registrada con exito!`
            });
          });
        }
      });
    }
    this.buscarRolloPDF();
  }

  // Funcion que creará un pdf a base de la informacion ingresada en las asignacion de rollos a facturas
  crearPDF(){
    let factura : string = this.FormConsultarProductos.value.Factura;
    let nombre : string = this.storage.get('Nombre');

    this.dtAsgProdFactura.srvObtenerListaParaPDF(factura.toUpperCase()).subscribe(datos_factura => {
      for (let i = 0; i < datos_factura.length; i++) {
        for (let j = 0; j < this.rollosAsignados.length; j++) {
          const pdfDefinicion : any = {
            info: {
              title: `${factura.toUpperCase()}`
            },
            pageSize: {
              width: 630,
              height: 760
            },
            footer: function(currentPage : any, pageCount : any) {
              return [
                {
                  columns: [
                    { text: `Reporte generado por ${nombre}`, alignment: ' left', fontSize: 8, margin: [30, 0, 0, 0] },
                    { text: `Fecha Expedición Documento ${moment().format('YYYY-MM-DD')} - ${moment().format('H:mm:ss')}`, alignment: 'right', fontSize: 8 },
                    { text: `${currentPage.toString() + ' de ' + pageCount}`, alignment: 'right', fontSize: 8, margin: [0, 0, 30, 0] },
                  ]
                }
              ]
            },
            content : [
              {
                text: `Rollos de la Factura ${factura.toUpperCase()}`,
                alignment: 'right',
                style: 'titulo',
              },
              '\n \n',
              {
                style: 'tablaEmpresa',
                table: {
                  widths: [90, '*', 90, '*'],
                  style: 'header',
                  body: [
                    [
                      {
                        border: [false, false, false, false],
                        text: `Nombre Empresa`
                      },
                      {
                        border: [false, false, false, true],
                        text: `Plasticaribe S.A.S`
                      },
                      {
                        border: [false, false, false, false],
                        text: `Fecha`
                      },
                      {
                        border: [false, false, false, true],
                        text: `${datos_factura[i].asigProdFV_Fecha.replace('T00:00:00', '')}`
                      },
                    ],
                    [
                      {
                        border: [false, false, false, false],
                        text: `Dirección`
                      },
                      {
                        border: [false, false, false, true],
                        text: `${datos_factura[i].empresa_Direccion}`
                      },
                      {
                        border: [false, false, false, false],
                        text: `Ciudad`
                      },
                      {
                        border: [false, false, false, true],
                        text: `${datos_factura[i].empresa_Ciudad}`
                      },
                    ],
                  ]
                },
                layout: {
                  defaultBorder: false,
                },
                fontSize: 9,
              },
              '\n \n',
              {
                text: `Facturado Por: ${datos_factura[i].nombreCreador}\n`,
                alignment: 'left',
                style: 'header',
              },
              '\n \n',
              {
                text: `\n Información detallada de la Factura \n \n`,
                alignment: 'center',
                style: 'header'
              },
              {
                style: 'tablaCliente',
                table: {
                  widths: ['*', '*'],
                  style: 'header',
                  body: [
                    [
                      `Código: ${factura.toUpperCase()}`,
                      `Nota Credito: ${datos_factura[i].notaCredito_Id}`
                    ],
                    [
                      `Id Cliente: ${datos_factura[i].cli_Id}`,
                      `Nombre Cliente: ${datos_factura[i].cli_Nombre}`
                    ]
                  ]
                },
                layout: 'lightHorizontalLines',
                fontSize: 9,
              },
              {
                text: `\n\n Consolidado de producto(s) \n `,
                alignment: 'center',
                style: 'header'
              },
              this.table2(this.grupoProductos, ['Id', 'Nombre', 'Cantidad', 'Rollos', 'Presentacion', 'Cant_Unidades']),
              {
                text: `\n\n Información detallada de producto(s)\n `,
                alignment: 'center',
                style: 'header'
              },

              this.table(this.rollosAsignados, ['Rollo', 'Producto', 'Nombre', 'Cantidad', 'Presentacion', 'Cant_Unidades']),
              {
                text: `\nCant. Total: ${this.formatonumeros(this.Total.toFixed(2))}\n\n`,
                alignment: 'right',
                style: 'header',
              },
              {
                text: `\n \nObservación: \n ${datos_factura[i].asigProdFV_Observacion}\n`,
                style: 'header',
              },
            ],
            styles: {
              header: {
                fontSize: 10,
                bold: true
              },
              titulo: {
                fontSize: 20,
                bold: true
              }
            }
          }
          const pdf = pdfMake.createPdf(pdfDefinicion);
          pdf.open();
          setTimeout(() => { (this.limpiarCampos()); }, 4000);
          break;
        }
        break;
      }
    });
    setTimeout(() => { this.cargando = true; }, 500);
  }

  // Funcion que traerá los rollos que fueron asignados a la factura creada
  buscarRolloPDF(){
    let factura : string = this.FormConsultarProductos.value.Factura;
    this.dtAsgProdFactura.srvObtenerListaParaPDF(factura.toUpperCase()).subscribe(datos_factura => {
      for (let i = 0; i < datos_factura.length; i++) {
        let info : any = {
          Rollo : datos_factura[i].rollo_Id,
          Producto : datos_factura[i].prod_Id,
          Nombre : datos_factura[i].prod_Nombre,
          Cantidad : this.formatonumeros(datos_factura[i].dtAsigProdFV_Cantidad),
          Presentacion : datos_factura[i].undMed_Id,
          Cant_Unidades : `${this.formatonumeros(datos_factura[i].prod_CantidadUnidades)} Und`
        }
        console.log(info);
        this.rollosAsignados.push(info);
        this.rollosAsignados.sort((a,b) => Number(a.Rollo) - Number(b.Rollo));
      }
    });

    this.dtAsgProdFactura.srvObtenerListaParaPDF2(factura.toUpperCase()).subscribe(datos_factura => {
      for (let i = 0; i < datos_factura.length; i++) {
        let info : any = {
          Producto : datos_factura[i].prod_Id,
          Nombre : datos_factura[i].prod_Nombre,
          Cantidad : this.formatonumeros(datos_factura[i].suma),
          Presentacion : datos_factura[i].undMed_Id,
          Cant_Unidades : `${datos_factura[i].SumaUnd} Und`
        }
        this.Productos.push(info);
      }
    });
    setTimeout(() => { this.crearPDF(); }, 500);
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
          widths: [60, 60, 200, 70, 60, 50],
          body: this.buildTableBody(data, columns),
        },
        fontSize: 7,
        layout: {
          fillColor: function (rowIndex, node, columnIndex) {
            return (rowIndex == 0) ? '#CCCCCC' : null;
          }
        }
    };
  }

  // Funcion que genera la tabla donde se mostrará la información de los productos pedidos
  table2(data, columns) {
    return {
        table: {
          headerRows: 1,
          widths: [60, 200, 70, 40, 80, 50],
          body: this.buildTableBody(data, columns),
        },
        fontSize: 7,
        layout: {
          fillColor: function (rowIndex, node, columnIndex) {
            return (rowIndex == 0) ? '#CCCCCC' : null;
          }
        }
    };
  }
}
