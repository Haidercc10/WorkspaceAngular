import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { ClientesService } from 'src/app/Servicios/Clientes/clientes.service';
import { InventarioZeusService } from 'src/app/Servicios/InventarioZeus/inventario-zeus.service';
import { ProductoService } from 'src/app/Servicios/Productos/producto.service';
import { RolesService } from 'src/app/Servicios/Roles/roles.service';
import { UsuarioService } from 'src/app/Servicios/Usuarios/usuario.service';

@Component({
  selector: 'app-Reporte_FacturacionZeus',
  templateUrl: './Reporte_FacturacionZeus.component.html',
  styleUrls: ['./Reporte_FacturacionZeus.component.css']
})
export class Reporte_FacturacionZeusComponent implements OnInit {

  formFiltros !: FormGroup; /** Formulario de filtros de busqueda */
  arrayDocumento : any = []; /** Array para cargar la información que se verá en la vista. */
  load : boolean = false; /** Variable para indicar la espera en la carga de un proceso. */
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  arrayClientes : any = []; /** Array que contendrá la información de los clientes */
  arrayItems : any = []; /** Array que contendrá la información de los items */
  arrayVendedores : any = []; /** Array que contendrá la información de los vendedores */
  anos : any [] = [2019]; //Variable que almacenará los años desde el 2019 hasta el año actual
  anioActual : number = moment().year(); //Variable que almacenará la información del año actual en princio y luego podrá cambiar a un año seleccionado
  arrayAnios : any = [];

  constructor(private frmBuilder : FormBuilder,
                @Inject(SESSION_STORAGE) private storage: WebStorageService,
                  private rolService : RolesService,
                    private servicioUsuarios : UsuarioService,
                      private servicioClientes : ClientesService,
                        private servicioProductos : ProductoService,
                          private servicioZeus : InventarioZeusService) { }

  ngOnInit() {
    this.lecturaStorage();
    this.inicializarFormulario();
    this.cargarAnios();
    this.cargarClientes();
  }

  inicializarFormulario(){
    this.formFiltros = this.frmBuilder.group({
      vendedor: [null],
      cliente: [null],
      item: [null],
      anio1: [null],
      anio2: [null],
    });
  }

  /**Leer storage para validar su rol y mostrar el usuario. */
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

  // Funcion que colocará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = '$1,';
    return number.toString().replace(exp,rep);
  }

  /** Funció para limpiar los campos del formulario */
  limpiarTodo(){
    this.formFiltros.reset();
  }

  /** cargar vendedores al datalist que se encuentra en los filtros de busqueda*/
  cargarVendedores(){
    this.arrayVendedores = [];
    let vendedor : any = this.formFiltros.value.vendedor;

    this.servicioZeus.LikeGetVendedores(vendedor).subscribe(dataUsuarios => {
      for (let index = 0; index < dataUsuarios.length; index++) {
        this.arrayVendedores.push(dataUsuarios[index]);
      }
    });
  }

  /** cargar clientes al datalist que se encuentra en los filtros de busqueda*/
  cargarClientes(){
    this.arrayClientes = [];
    let cliente : any = this.formFiltros.value.cliente;

    this.servicioZeus.LikeGetClientes(cliente).subscribe(dataClientes => {
      for (let index = 0; index < dataClientes.length; index++) {
        this.arrayClientes.push(dataClientes[index]);
      }
    });
  }

   /** cargar items al datalist que se encuentra en los filtros de busqueda*/
  cargarProductos(){
    this.arrayItems = [];
    let item : any = this.formFiltros.value.item;

    this.servicioZeus.LikeGetItems(item).subscribe(dataItems => {
      for (let index = 0; index < dataItems.length; index++) {
        this.arrayItems.push(dataItems[index]);
      }
    });
  }

  /** Función para cargar los años en el combobox de años. */
  cargarAnios(){
    this.arrayAnios = [];
    for (let index = 2019; index < this.anioActual + 1; index++) {
      this.arrayAnios.push(index);
    }
  }

}
