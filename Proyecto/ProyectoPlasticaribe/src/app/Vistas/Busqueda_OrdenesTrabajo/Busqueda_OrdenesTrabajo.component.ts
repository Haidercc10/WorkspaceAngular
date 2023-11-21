import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { Table } from 'primeng/table';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { ClientesService } from 'src/app/Servicios/Clientes/clientes.service';
import { InventarioZeusService } from 'src/app/Servicios/InventarioZeus/inventario-zeus.service';
import { MaterialProductoService } from 'src/app/Servicios/MaterialProducto/materialProducto.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { PigmentoProductoService } from 'src/app/Servicios/PigmentosProductos/pigmentoProducto.service';
import { ProductoService } from 'src/app/Servicios/Productos/producto.service';
import { AppComponent } from 'src/app/app.component';
import { Orden_TrabajoComponent } from '../Orden_Trabajo/Orden_Trabajo.component';
import { SedeClienteService } from 'src/app/Servicios/SedeCliente/sede-cliente.service';

@Component({
  selector: 'app-Busqueda_OrdenesTrabajo',
  templateUrl: './Busqueda_OrdenesTrabajo.component.html',
  styleUrls: ['./Busqueda_OrdenesTrabajo.component.css']
})
export class Busqueda_OrdenesTrabajoComponent implements OnInit {

  @ViewChild('dt') dt: Table | undefined;
  cargando : boolean = false;
  ValidarRol : number;
  modoSeleccionado : boolean;
  formFiltros : FormGroup;
  clientes : any [] = [];
  productos : any [] = [];
  materiales : any [] = [];
  pigmentos : any [] = [];
  ordenesConsultadas : any [] = [];
  columnas : any [] = [];
  columnasSeleccionadas : any [] = [];

  constructor(private frmBuilder : FormBuilder,
    private AppComponent: AppComponent,
    private clientesService : ClientesService,
    private productoService : ProductoService,
    private materialesService : MaterialProductoService,
    private pigmentosService : PigmentoProductoService,
    private bagProService : BagproService,
    private msj : MensajesAplicacionService,
    private zeusService : InventarioZeusService,
    private orden_TrabajoComponent : Orden_TrabajoComponent,
    private svcSedes : SedeClienteService,) {

    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
    this.formFiltros = this.frmBuilder.group({
      buscarPorItem_Ot : ['Item', Validators.required],
      fechaInicio : [null],
      fechaFin : [null],
      idCliente : [null],
      cliente : [null],
      item : [null],
      referencia : [null],
      material : [null],
      pigmento : [null],
      ancho : [null],
      largo : [null],
      fuelle : [null],
      calibre : [null],
    });
  }

  ngOnInit(): void {
    this.obtenerMateriales();
    this.obtenerPigmentos();
  }

  limpiarCampos(){
    this.cargando = false;
    this.formFiltros.reset();
    this.ordenesConsultadas = [];
  }

  // Funcion que permitirá filtrar la información de la tabla
  aplicarfiltro = ($event, campo : any) => this.dt!.filter(($event.target as HTMLInputElement).value, campo, 'contains');

  // Funcion que va a buscar los materiales que se utilizan en la creación del item en el área de extrusión
  obtenerMateriales = () => this.materialesService.srvObtenerLista().subscribe(materiasProd => this.materiales = materiasProd);

  // Funcion que va a buscar los pigmentos que se utilizan en la creación del item en el área de extrusión
  obtenerPigmentos = () => this.pigmentosService.srvObtenerLista().subscribe(pigmentos => this.pigmentos = pigmentos);

  // Funcion que va a consultar los clientes de la empresa
  consultarClientes = () => {
    let nombre = this.formFiltros.value.cliente;
    this.clientesService.GetSedesClientes_NombreCliente(nombre).subscribe(data => {
      this.clientes = data;
      this.clientes.sort((a, b) => a.cli_Nombre.localeCompare(b.cli_Nombre));
    });
  }

  // Funcion que va a colocar la información del cliente seleccionado en cada campo
  clienteSeleccionado() {
    let id_cliente = this.formFiltros.value.cliente;
    let cliente = this.clientes.find(x => x.sedeCli_CodBagPro == id_cliente);
    this.formFiltros.patchValue({
      idCliente: cliente.sedeCli_CodBagPro,
      cliente: cliente.cli_Nombre,
    });
  }

  // Funcion que va a consultar los productos de la empresa
  consultarProductos() {
    let nombreProducto = this.formFiltros.value.referencia;
    this.productoService.obtenerItemsLike(nombreProducto).subscribe(data => this.productos = data);
  }

  // Funcion que va a colocar la información del producto seleccionado en cada campo
  productoSeleccionado() {
    let id_producto = this.formFiltros.value.referencia;
    let producto = this.productos.find(x => x.prod_Id == id_producto);
    this.formFiltros.patchValue({
      item: producto.prod_Id,
      referencia: producto.prod_Nombre,
    });
  }

  // Funcion que va a consultar las ordenes de trabajo de la empresa
  consultarOrdenes(){
    this.cargando = true;
    let fechaAnterior : any = moment().subtract(12, 'M').format('YYYY-MM-DD');
    let fechaIncio : any = this.formFiltros.value.fechaInicio != null ? moment(this.formFiltros.value.fechaInicio).format('YYYY-MM-DD') : fechaAnterior;
    let fechaFin : any = this.formFiltros.value.fechaFin != null ? moment(this.formFiltros.value.fechaFin).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD');
    let ruta : string = this.validarRutaConsulta();
    this.bagProService.GetOrdenesTrabajo(fechaIncio, fechaFin, ruta).subscribe(data => {
      this.ordenesConsultadas = data;
      this.llenarColumnas();
    }, () => {
      this.msj.mensajeError(`¡Ocurrió un error al realizar la consulta!`);
      this.cargando = false;
    }, () => this.cargando = false);
  }

  validarRutaConsulta() : string {
    let cliente : any = this.formFiltros.value.cliente;
    let item : number = this.formFiltros.value.item;
    let material : any = this.formFiltros.value.material;
    let pigmento : number = this.formFiltros.value.pigmento;
    let ancho : any = this.formFiltros.value.ancho;
    let largo : any = this.formFiltros.value.largo;
    let fuelle : any = this.formFiltros.value.fuelle;
    let calibre : any = this.formFiltros.value.calibre;
    let ruta : string = '';

    if (cliente != null) ruta += `cliente=${cliente}`;
    if (item != null) ruta.length > 0 ? ruta += `&item=${item}` : ruta += `item=${item}`;
    if (material != null) ruta.length > 0 ? ruta += `&material=${material}` : ruta += `material=${material}`;
    if (pigmento != null) ruta.length > 0 ? ruta += `&pigmento=${pigmento}` : ruta += `pigmento=${pigmento}`;
    if (ancho != null) ruta.length > 0 ? ruta += `&ancho=${ancho}` : ruta += `ancho=${ancho}`;
    if (largo != null) ruta.length > 0 ? ruta += `&largo=${largo}` : ruta += `largo=${largo}`;
    if (fuelle != null) ruta.length > 0 ? ruta += `&fuelle=${fuelle}` : ruta += `fuelle=${fuelle}`;
    if (calibre != null) ruta.length > 0 ? ruta += `&calibre=${calibre}` : ruta += `calibre=${calibre}`;
    if (ruta.length > 0) ruta = `?${ruta}`;
    return ruta;
  }

  llenarColumnas() {
    let tipoBusqueda : 'Item' | 'OT' = this.formFiltros.value.buscarPorItem_Ot;
    if (tipoBusqueda == 'Item') this.llenarColumnas_BusquedaPorItem();
    else if (tipoBusqueda == 'OT') this.llenarColumnas_BusquedaPorOT();
    this.columnasSeleccionadas = this.columnas;
  }

  llenarColumnas_BusquedaPorItem(){
    this.ordenesConsultadas.sort((a,b) => Number(b.ordenTrabajo) - Number(a.ordenTrabajo));
    this.ordenesConsultadas = this.ordenesConsultadas.reduce((a,b) => {
      if (!a.map(x => x.item).includes(b.item)) a = [...a, b];
      return a;
    }, []);
    this.consultarExistenciasItems();
    this.ordenesConsultadas.sort((a,b) => Number(a.ordenTrabajo) - Number(b.ordenTrabajo));
    this.columnas = [
      { header: 'Existencia', field: 'existencia', tipo: 'number' },
      { header: 'Cliente', field: 'cliente', tipo: 'text' },
      { header: 'Item', field: 'item', tipo: 'text' },
      { header: 'Precio', field: 'precio', tipo: 'number' },
      { header: 'Referencia', field: 'referencia', tipo: 'text' },
      { header: 'Material', field: 'material', tipo: 'text' },
      { header: 'Pigmento', field: 'pigmento', tipo: 'text' },
      { header: 'Und', field: 'undExtrusion', tipo: 'text' },
      { header: 'Calibre', field: 'calibre', tipo: 'number' },
      { header: 'Ancho', field: 'ancho', tipo: 'number' },
      { header: 'Largo', field: 'largo', tipo: 'number' },
      { header: 'Fuele', field: 'fuelle', tipo: 'number' },
      { header: 'Ult. Fecha', field: 'fechaCreacion', tipo: 'date' },
    ];
  }

  consultarExistenciasItems(){
    for (const ot of this.ordenesConsultadas) {
      let presentacion : string = ot.presentacion;
      if (presentacion == 'Unidad') presentacion = 'UND';
      else if (presentacion == 'Kilo') presentacion = 'KLS';
      else if (presentacion == 'Paquete') presentacion = 'PAQ';      
      this.zeusService.getExistenciasProductos(ot.item, presentacion).subscribe(data => ot.existencia = data.length > 0 ? data[0].disponibles : 0);
    }
  }

  llenarColumnas_BusquedaPorOT(){
    this.columnas = [
      { header: 'OT', field: 'ordenTrabajo', tipo: 'text' },
      { header: 'Fecha', field: 'fechaCreacion', tipo: 'date' },
      { header: 'Item', field: 'item', tipo: 'text' },
      { header: 'Precio', field: 'precio', tipo: 'number' },
      { header: 'Referencia', field: 'referencia', tipo: 'text' },
      { header: 'Material', field: 'material', tipo: 'text' },
      { header: 'Pigmento', field: 'pigmento', tipo: 'text' },
      { header: 'Und', field: 'undExtrusion', tipo: 'text' },
      { header: 'Calibre', field: 'calibre', tipo: 'number' },
      { header: 'Formato', field: 'formato', tipo: 'text' },
      { header: 'Ancho', field: 'ancho', tipo: 'number' },
      { header: 'Largo', field: 'largo', tipo: 'number' },
      { header: 'Fuele', field: 'fuelle', tipo: 'number' },
      { header: 'Ult. Fecha', field: 'fechaCreacion', tipo: 'date' },
    ];
  }

  crearOrdenTrabajo(data : any){
    let tipoBusqueda : 'Item' | 'OT' = this.formFiltros.value.buscarPorItem_Ot;
    let tabCrearOrden = document.getElementsByClassName('p-element p-ripple p-tabview-nav-link');
    let tabCrearOrden2 = document.getElementById(tabCrearOrden[0].id);
    tabCrearOrden2.click();
    this.orden_TrabajoComponent.consultarClientes();
    if (tipoBusqueda == 'Item') {
      this.orden_TrabajoComponent.FormOrdenTrabajo.patchValue({ 
        Id_Producto : data.item,
        Nombre_Producto : data.referencia,
        Presentacion : data.presentacion == 'Kilo' ? 'Kg' : data.presentacion == 'Unidad' ? 'Und' : data.presentacion,
      });
      this.orden_TrabajoComponent.consultarInfoProducto();
    } else if (tipoBusqueda == 'OT') this.orden_TrabajoComponent.busquedaOTBagPro(data);
  }

  crearCopiaOrdenTrabajo(data : any){
    let tipoBusqueda : 'Item' | 'OT' = this.formFiltros.value.buscarPorItem_Ot;
    let tabCrearOrden = document.getElementsByClassName('p-element p-ripple p-tabview-nav-link');
    let tabCrearOrden2 = document.getElementById(tabCrearOrden[0].id);
    tabCrearOrden2.click();
    this.orden_TrabajoComponent.consultarClientes();
    if (tipoBusqueda == 'Item') this.orden_TrabajoComponent.consultarInfoProducto();
    else if (tipoBusqueda == 'OT') this.orden_TrabajoComponent.busquedaOTBagPro(data);
    setTimeout(() => {
      this.orden_TrabajoComponent.FormOrdenTrabajo.patchValue({
        Cantidad: data.cantidad,
        Precio: data.precio,
      });
    }, 1000);
    setTimeout(() => {
      this.orden_TrabajoComponent.guardarOt();
      let tabCrearOrden3 = document.getElementById(tabCrearOrden[1].id);
      tabCrearOrden3.click();
    }, 1500);
  }
  
}