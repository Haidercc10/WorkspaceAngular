import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { BagproService } from 'src/app/Servicios/Bagpro.service';
import { ClientesService } from 'src/app/Servicios/clientes.service';
import { ClientesProductosService } from 'src/app/Servicios/ClientesProductos.service';
import { DetallesEntradaRollosService } from 'src/app/Servicios/DetallesEntradaRollos.service';
import { ExistenciasProductosService } from 'src/app/Servicios/existencias-productos.service';
import { ProductoService } from 'src/app/Servicios/producto.service';
import { RolesService } from 'src/app/Servicios/roles.service';
import { UsuarioService } from 'src/app/Servicios/usuario.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-AsignarProductosFacturas',
  templateUrl: './AsignarProductosFacturas.component.html',
  styleUrls: ['./AsignarProductosFacturas.component.css']
})
export class AsignarProductosFacturasComponent implements OnInit {

  public FormConsultarProductos !: FormGroup; //formulario para consultar y crear un ingreso de rollos

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

  keywordNombresProductos = 'prod_Nombre'; /** Variable de palabra clave para Input Producto. */
  validarInputNombresProductos : any; /** Variable para validar input producto */
  arrayProducto=[]; /** Array que guardará los productos en el select input */
  keywordClientes = 'cli_Nombre'; /** Variable de palabra clave para Input Producto. */
  validarInputClientes : any; /** Variable para validar input producto */
  arrayClientes=[]; /** Array que guardará los clientes en el select input */
  arrayConductor =[];  /** Array que guardará los conductores en el select input */


  constructor(private frmBuilderPedExterno : FormBuilder,
                private rolService : RolesService,
                  @Inject(SESSION_STORAGE) private storage: WebStorageService,
                    private bagProService : BagproService,
                      private ExistenciasProdService : ExistenciasProductosService,
                        private servicioProducto : ProductoService,
                          private servicioClientes: ClientesService,
                            private servicioClientesProductos : ClientesProductosService,
                              private servicioUsuarios : UsuarioService,
                                private dtEntradaRollo : DetallesEntradaRollosService,) {

    this.FormConsultarProductos = this.frmBuilderPedExterno.group({
      Factura : ['', Validators.required],
      ProdNombre: ['', Validators.required ],
      Cliente: ['', Validators.required],
      Conductor: ['', Validators.required],
      PlacaCamion: ['', Validators.required],
      Observacion : [''],
    });
  }

  ngOnInit() {
    this.fecha();
    this.lecturaStorage();
    this.llenadoClientes();
    this.ObtenerUsuariosConductores()
  }

  selectEventProducto(item) {
    this.FormConsultarProductos.value.ProdNombre = item.prod_Id;
    if (this.FormConsultarProductos.value.ProdNombre != '') this.validarInputNombresProductos = false;
    else this.validarInputNombresProductos = true;
    // do something with selected item
  }

  onChangeSearchNombreProductos(val: string) {
    if (val != '') this.validarInputNombresProductos = false;
    else this.validarInputNombresProductos = true;
    // fetch remote data from here
    // And reassign the 'data' which is binded to 'data' property.
  }

  onFocusedNombreProductos(e){
    if (!e.isTrusted) this.validarInputNombresProductos = false;
    else this.validarInputNombresProductos = true;
    // do something when input is focused
  }

  selectEventCliente(item) {
    this.FormConsultarProductos.value.Cliente = item.cli_Id;
    if (this.FormConsultarProductos.value.Cliente != '') this.validarInputClientes = false;
    else this.validarInputClientes = true;
    // do something with selected item
  }


  onChangeSearchClientes(val: string) {
    if (val != '') this.validarInputClientes = false;
    else this.validarInputClientes = true;
    // fetch remote data from here
    // And reassign the 'data' which is binded to 'data' property.
  }

  onFocusedNombreClientes(e){
    if (!e.isTrusted) this.validarInputClientes = false;
    else this.validarInputClientes = true;
    // do something when input is focused
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
    this.FormConsultarProductos.reset();
    this.rollos = [];
    this.rollosInsertar = [];
    this.validarRollo = [];
  }

  //Funcion que va a agregar Productos en la tabla
  cargarProducto(item : any){
    if (this.rollosInsertar.length == 0) {
      let info : any = {
        Id : item.Id,
        Producto : item.Producto,
        Cantidad : item.Cantidad,
        Presentacion : item.Presentacion,
      }
      this.rollosInsertar.push(info);
      this.validarRollo.push(item.Id);
    } else {
      if (!this.validarRollo.includes(item.Id)) {
        let info : any = {
          Id : item.Id,
          Producto : item.Producto,
          Cantidad : item.Cantidad,
          Presentacion : item.Presentacion,
        }
        this.rollosInsertar.push(info);
        this.validarRollo.push(item.Id);
      } else if (this.validarRollo.includes(item.Id)) {
        for (let i = 0; i < this.rollosInsertar.length; i++) {
          if (this.rollosInsertar[i].Id == item.Id) this.rollosInsertar.splice(i,1);
        }
        for (let i = 0; i < this.validarRollo.length; i++) {
          if (this.validarRollo[i] == item.Id) this.validarRollo.splice(i,1);
        }
      }
    }
  }

  //Funcion que llanará el array de clientes
  llenadoClientes(){
    this.servicioClientes.srvObtenerLista().subscribe(registrosClientes => {
      for (let index = 0; index < registrosClientes.length; index++) {
        let Clientes : any = registrosClientes[index];
         this.arrayClientes.push(Clientes);
         //console.log(this.arrayClientes);

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

  // Funcion que va a cargra los rollos disponibles de un producto
  mostrarRollos(item){
    this.FormConsultarProductos.value.ProdNombre = item.prod_Id;
    if (this.FormConsultarProductos.value.ProdNombre != '') this.validarInputNombresProductos = false;
    else this.validarInputNombresProductos = true;
    let producto : any = this.FormConsultarProductos.value.ProdNombre;
    this.dtEntradaRollo.srvConsultarProducto(producto).subscribe(datos_rollos => {
      for (let i = 0; i < datos_rollos.length; i++) {
        let info : any = {
          Id : datos_rollos[i].rollo_Id,
          Cantidad : datos_rollos[i].dtEntRolloProd_Cantidad,
          Presentacion : datos_rollos[i].undMed_Id,
        }
        this.rollos.push(info);
      }
    });
  }

  // Funcion para cargar en la base de datos la informacion de una factura a la que se le asignarán rollos
  crearAsignacion(){

  }

  // Funcion para subir los detalles de la asignacion, es decir, cada rollo que se asignó a la factura
  crearDetallesAsignacion(){

  }

}
