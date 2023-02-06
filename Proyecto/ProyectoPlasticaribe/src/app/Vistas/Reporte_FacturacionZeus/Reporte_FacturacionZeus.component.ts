import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { TreeTable } from 'primeng/treetable';
import { ClientesProductosService } from 'src/app/Servicios/Clientes_Productos/ClientesProductos.service';
import { InventarioZeusService } from 'src/app/Servicios/InventarioZeus/inventario-zeus.service';
import { RolesService } from 'src/app/Servicios/Roles/roles.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-Reporte_FacturacionZeus',
  templateUrl: './Reporte_FacturacionZeus.component.html',
  styleUrls: ['./Reporte_FacturacionZeus.component.css']
})
export class Reporte_FacturacionZeusComponent implements OnInit {
  @ViewChild('tt') tt: TreeTable | undefined;
  formFiltros !: FormGroup; /** Formulario de filtros de busqueda */
  arrayDocumento : any = []; /** Array para cargar la información que se verá en la vista. */
  cargando : boolean = false; /** Variable para indicar la espera en la carga de un proceso. */
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
  arrayConsolidado : any [] = []; //Variable que tendrá la información del consolidado consultado

  constructor(private frmBuilder : FormBuilder,
                @Inject(SESSION_STORAGE) private storage: WebStorageService,
                  private rolService : RolesService,
                    private invetarioZeusService : InventarioZeusService,
                      private servicioCliProd : ClientesProductosService) {

    this.formFiltros = this.frmBuilder.group({
      vendedor: [null],
      idvendedor : [null],
      cliente: [null],
      idcliente : [null],
      item: [null],
      idItem : [null],
      anio1: [null],
      anio2: [null],
    });
  }

  ngOnInit() {
    this.lecturaStorage();
    this.cargarAnios();
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
    this.arrayClientes = [];
    this.arrayItems = [];
    this.arrayVendedores = [];
  }

  /** cargar vendedores al datalist que se encuentra en los filtros de busqueda*/
  cargarVendedores(){
    this.arrayVendedores = [];
    let vendedor : any = this.formFiltros.value.vendedor;
    if(vendedor != null && vendedor.length > 2) this.invetarioZeusService.LikeGetVendedores(vendedor).subscribe(dataUsuarios => { this.arrayVendedores = dataUsuarios; });
  }

  /** cargar clientes al datalist que se encuentra en los filtros de busqueda*/
  cargarClientes(){
    this.arrayClientes = [];
    let cliente : any = this.formFiltros.value.cliente;
    if(cliente != null && cliente.length > 2) this.invetarioZeusService.LikeGetClientes(cliente).subscribe(dataClientes => { this.arrayClientes = dataClientes; });
  }

   /** cargar items al datalist que se encuentra en los filtros de busqueda*/
  cargarProductos(){
    this.arrayItems = [];
    let item : any = this.formFiltros.value.item;
    if(item != null && item.length > 2) this.invetarioZeusService.LikeGetItems(item).subscribe(dataItems => { this.arrayItems = dataItems; });
  }

  /** Función para cargar los años en el combobox de años. */
  cargarAnios(){
    this.arrayAnios = [];
    for (let index = 2019; index < this.anioActual + 1; index++) {
      this.arrayAnios.push(index);
    }
  }

  /** Al momento de seleccionar un vendedor, se cargaran sus clientes en el combobox*/
  seleccionarVendedores(){
    let expresion : any = /^[0-9]*(\.?)[ 0-9]+$/;
    let vendedorSeleccionado : any = this.formFiltros.value.vendedor;

    if(vendedorSeleccionado.match(expresion) != null) {
      this.invetarioZeusService.getVendedoresxId(vendedorSeleccionado).subscribe(dataClientes => {
        for (let index = 0; index < dataClientes.length; index++) {
          this.formFiltros = this.frmBuilder.group({
            vendedor: dataClientes[index].nombvende,
            idvendedor : dataClientes[index].idvende,
            cliente: this.formFiltros.value.cliente,
            idcliente : this.formFiltros.value.idcliente,
            item: this.formFiltros.value.item,
            idItem : this.formFiltros.value.idItem,
            anio1: this.formFiltros.value.anio1,
            anio2: this.formFiltros.value.anio2,
          });
          this.cargarClientesxVendedor(dataClientes[index].idvende);
        }
       });
    } else this.advertencia('Debe elegir un asesor comercial válido!');
  }

  /** Se cargarán los clientes del vendedor seleccionado. */
  cargarClientesxVendedor(vendedor : any){
    this.arrayClientes = [];
    this.invetarioZeusService.getClientesxVendedor(vendedor).subscribe(dataClientes2 => { this.arrayClientes = dataClientes2; });
  }

  /** Al momento de seleccionar un cliente, se cargaran sus items */
  seleccionarClientes() {
    let expresion : any = /^[0-9]*(\.?)[ 0-9]+$/;
    let clienteSeleccionado : any = this.formFiltros.value.cliente;

    if(clienteSeleccionado.match(expresion) != null) {
      this.invetarioZeusService.getClientesxId(clienteSeleccionado).subscribe(dataClientes3 => {
        for (let index = 0; index < dataClientes3.length; index++) {
          this.formFiltros.setValue({
            vendedor: this.formFiltros.value.vendedor,
            idvendedor : this.formFiltros.value.idvendedor,
            cliente: dataClientes3[index].razoncial,
            idcliente : dataClientes3[index].idcliente,
            item: this.formFiltros.value.item,
            idItem : this.formFiltros.value.idItem,
            anio1: this.formFiltros.value.anio1,
            anio2: this.formFiltros.value.anio2,
          });
          this.cargarItemsxClientes(dataClientes3[index].idcliente);
        }
       });
    } else this.advertencia('Debe elegir un cliente válido!');
  }

  cargarItemsxClientes(cliente : any) {
    this.arrayItems = [];
    this.invetarioZeusService.getArticulosxCliente(cliente).subscribe(dataArticulo => {
      for (let index = 0; index < dataArticulo.length; index++) {
        this.arrayItems.push(dataArticulo[index]);
      }
    });
  }

  seleccionarProductos() {
    let expresion : any = /^[0-9]*(\.?)[ 0-9]+$/;
    let itemSeleccionado : any = this.formFiltros.value.item;

    if(itemSeleccionado.match(expresion) != null) {
      this.invetarioZeusService.getArticulosxId(itemSeleccionado).subscribe(dataItems => {
        for (let index = 0; index < dataItems.length; index++) {
          this.formFiltros.setValue({
            vendedor: this.formFiltros.value.vendedor,
            idvendedor : this.formFiltros.value.idvendedor,
            cliente: this.formFiltros.value.cliente,
            idcliente : this.formFiltros.value.idcliente,
            item: dataItems[index].nombre,
            idItem : dataItems[index].codigo,
            anio1: this.formFiltros.value.anio1,
            anio2: this.formFiltros.value.anio2,
          });
        }
      });
    } else this.advertencia('Debe elegir un item válido!');
  }

  aplicarfiltro($event, campo : any, valorCampo : string){
    this.tt!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);
  }

  // Funcion que va a consultar el consolidado de los clientes, productos y vendedores
  consultarConsolidado(){
    this.cargando = true;
    this.arrayConsolidado = [];
    let ruta : string = '';
    let anoInicial : number = this.formFiltros.value.anio1;
    let anoFinal : number = this.formFiltros.value.anio2;
    let cliente : string = this.formFiltros.value.idcliente;
    let producto : any = this.formFiltros.value.idItem;
    let vendedor : any = this.formFiltros.value.idvendedor;
    // producto.toString();
    //if (vendedor.length == 2) vendedor = `0${vendedor}`;
    //else if (vendedor.length == 1) vendedor = `00${vendedor}`;
    if (anoInicial == null) anoInicial = moment().year();
    if (anoFinal == null) anoFinal = anoInicial;

    if (cliente != null && producto != null && vendedor != null) ruta = `?vendedor=${vendedor}&producto=${producto}&cliente=${cliente}`;
    else if (cliente != null && producto != null) ruta = `?producto=${producto}&cliente=${cliente}`;
    else if (cliente != null && vendedor != null) ruta = `?vendedor=${vendedor}&cliente=${cliente}`;
    else if (producto != null && vendedor != null) ruta = `?vendedor=${vendedor}&producto=${producto}`;
    else if (cliente != null) ruta = `?cliente=${cliente}`;
    else if (producto != null) ruta = `?producto=${producto}`;
    else if (vendedor != null) ruta = `?vendedor=${vendedor}`;

    this.invetarioZeusService.GetConsolidadClientesArticulo(anoInicial, anoFinal, ruta).subscribe(datos_consolidado => {
      if(datos_consolidado.length == 0) {
        this.advertencia('No se encontraron resultados de búsqueda con la combinación de filtros seleccionada!')
      } else {
        for (let i = 0; i < datos_consolidado.length; i++) {
          this.llenarConsolidado(datos_consolidado[i]);
        }
      }
      setTimeout(() => { this.cargando = false; }, 10 * datos_consolidado.length);
    });
  }

  // Funcion que va a llenar el array que contendrá la informacion del consolidado
  llenarConsolidado(data : any){
    if (data.mes == 1) data.mes = 'Enero';
    if (data.mes == 2) data.mes = 'Febrero';
    if (data.mes == 3) data.mes = 'Marzo';
    if (data.mes == 4) data.mes = 'Abril';
    if (data.mes == 5) data.mes = 'Mayo';
    if (data.mes == 6) data.mes = 'Junio';
    if (data.mes == 7) data.mes = 'Julio';
    if (data.mes == 8) data.mes = 'Agosto';
    if (data.mes == 9) data.mes = 'Septiembre';
    if (data.mes == 10) data.mes = 'Octubre';
    if (data.mes == 11) data.mes = 'Noviembre';
    if (data.mes == 12) data.mes = 'Diciembre';
    let info : any = {
      Mes : data.mes,
      Ano : data.ano,
      Id_Cliente : data.id_Cliente,
      Cliente : data.cliente,
      Id_Producto : data.id_Producto,
      Producto : data.producto,
      Cantidad : data.cantidad,
      Presentacion : data.presentación,
      Precio : data.precio,
      SubTotal : data.subTotal,
      Id_Vendedor : data.id_Vendedor,
      Vendedor : data.vendedor,
    }
    this.arrayConsolidado.push(info);
  }

  // Funcion que va a calcular el subtotal de lo vendido en un año
  calcularTotalVendidoAno(ano : any){
    let total : number = 0;
    for (let i = 0; i < this.arrayConsolidado.length; i++) {
      if (this.arrayConsolidado[i].Ano == ano) {
        total += this.arrayConsolidado[i].SubTotal;
      }
    }
    return total;
  }

  // Funcion que mostrará una advertencia si no se encuentran registros de búsqueda
  advertencia(mensaje : string) {
    Swal.fire({  icon: 'warning', title: 'Advertencia', text: mensaje, confirmButtonColor: '#ffc107', })
  }

}
