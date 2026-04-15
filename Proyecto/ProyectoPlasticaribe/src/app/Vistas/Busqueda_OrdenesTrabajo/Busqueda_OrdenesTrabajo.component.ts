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
import { CreacionExcelService } from 'src/app/Servicios/CreacionExcel/CreacionExcel.service';
import { EstadosProcesos_OTService } from 'src/app/Servicios/EstadosProcesosOT/EstadosProcesos_OT.service';
import { UsuarioService } from 'src/app/Servicios/Usuarios/usuario.service';

@Component({
  selector: 'app-Busqueda_OrdenesTrabajo',
  templateUrl: './Busqueda_OrdenesTrabajo.component.html',
  styleUrls: ['./Busqueda_OrdenesTrabajo.component.css']
})
export class Busqueda_OrdenesTrabajoComponent implements OnInit {

  @ViewChild('dt') dt: Table | undefined;
  cargando: boolean = false;
  ValidarRol : any;
  modoSeleccionado: boolean;
  formFiltros: FormGroup;
  clientes: any[] = [];
  productos: any[] = [];
  materiales: any[] = [];
  pigmentos: any[] = [];
  ordenesConsultadas: any[] = [];
  columnas: any[] = [];
  columnasSeleccionadas: any[] = [];
  sales: any = [];
  storage_Id : any;
  storage_Nombre: any;

  constructor(private frmBuilder: FormBuilder,
    private AppComponent: AppComponent,
    private clientesService: ClientesService,
    private productoService: ProductoService,
    private materialesService: MaterialProductoService,
    private pigmentosService: PigmentoProductoService,
    private bagProService: BagproService,
    private msj: MensajesAplicacionService,
    private zeusService: InventarioZeusService,
    private orden_TrabajoComponent: Orden_TrabajoComponent,
    private svcSedes: SedeClienteService,
    private svExcel: CreacionExcelService,
    private svUsuarios: UsuarioService
  ) {

    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
    this.formFiltros = this.frmBuilder.group({
      buscarPorItem_Ot: ['Item', Validators.required],
      fechaInicio: [null],
      fechaFin: [null],
      idCliente: [null],
      cliente: [null],
      item: [null],
      referencia: [null],
      material: [null],
      pigmento: [null],
      ancho: [null],
      largo: [null],
      fuelle: [null],
      calibre: [null],
      sales: [null,],

    });
  }

  ngOnInit(): void {
    this.obtenerMateriales();
    this.obtenerPigmentos();
    this.lecturaStorage();
  }

  limpiarCampos() {
    this.cargando = false;
    this.formFiltros.reset();
    this.ordenesConsultadas = [];
    this.formFiltros.patchValue({ buscarPorItem_Ot: 'Item' });
  }

  //Crea la función de lectura storage que tengo en otros modulos
  lecturaStorage() {
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
    this.getSales();
  }

  // Funcion que permitirá filtrar la información de la tabla
  aplicarfiltro = ($event, campo: any) => this.dt!.filter(($event.target as HTMLInputElement).value, campo, 'contains');

  // Funcion que va a buscar los materiales que se utilizan en la creación del item en el área de extrusión
  obtenerMateriales = () => this.materialesService.srvObtenerLista().subscribe(materiasProd => this.materiales = materiasProd);

  // Funcion que va a buscar los pigmentos que se utilizan en la creación del item en el área de extrusión
  obtenerPigmentos = () => this.pigmentosService.srvObtenerLista().subscribe(pigmentos => this.pigmentos = pigmentos);

  //
  getClientsBagpro() {
    let nombre = this.formFiltros.value.cliente;
    this.bagProService.GetClientesNombre(nombre).subscribe(data => {
      this.clientes = data;
      //this.clientes.sort((a, b) => a.cli_Nombre.localeCompare(b.cli_Nombre));
    })
  }

  //
  selectClientBagpro() {
    let id_cliente = this.formFiltros.value.cliente;
    let cliente = this.clientes.find(x => x.codBagpro == id_cliente);
    this.formFiltros.patchValue({
      'idCliente': cliente.codBagpro,
      'cliente': cliente.nombreComercial,
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

  //Función que se encarga de 
  getSales() {
    let asesor: any = this.ValidarRol == 2 ? this.AppComponent.storage_Id : null;
    this.svUsuarios.GetVendedores().subscribe(resp => {
      this.sales = resp,
        this.sales = asesor ? this.sales.filter(x => x.usua_Id == asesor) : this.sales
    });
  }

  // Funcion que va a consultar las ordenes de trabajo de la empresa
  consultarOrdenes() {
    this.cargando = true;
    let fechaAnterior: any = moment().subtract(12, 'M').format('YYYY-MM-DD');
    let fechaIncio: any = this.formFiltros.value.fechaInicio != null ? moment(this.formFiltros.value.fechaInicio).format('YYYY-MM-DD') : fechaAnterior;
    let fechaFin: any = this.formFiltros.value.fechaFin != null ? moment(this.formFiltros.value.fechaFin).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD');
    let ruta: string = this.validarRutaConsulta();
    this.bagProService.GetOrdenesTrabajo(fechaIncio, fechaFin, ruta).subscribe(data => {
      this.ordenesConsultadas = data;
      this.llenarColumnas();
    }, () => {
      this.msj.mensajeError(`¡Ocurrió un error al realizar la consulta!`);
      this.cargando = false;
    }, () => this.cargando = false);
  }

  validarRutaConsulta(): string {
    let cliente: any = this.formFiltros.value.idCliente;
    let item: number = this.formFiltros.value.item;
    let material: any = this.formFiltros.value.material;
    let pigmento: number = this.formFiltros.value.pigmento;
    let ancho: any = this.formFiltros.value.ancho;
    let largo: any = this.formFiltros.value.largo;
    let fuelle: any = this.formFiltros.value.fuelle;
    let calibre: any = this.formFiltros.value.calibre;
    let sales: any = this.ValidarRol == 2
      ? `${String(this.storage_Id).padStart(3, '0')}`
      : '';
    let ruta: string = '';

    if (cliente != null) ruta += `cliente=${cliente}`;
    if (item != null) ruta.length > 0 ? ruta += `&item=${item}` : ruta += `item=${item}`;
    if (material != null) ruta.length > 0 ? ruta += `&material=${material}` : ruta += `material=${material}`;
    if (pigmento != null) ruta.length > 0 ? ruta += `&pigmento=${pigmento}` : ruta += `pigmento=${pigmento}`;
    if (ancho != null) ruta.length > 0 ? ruta += `&ancho=${ancho}` : ruta += `ancho=${ancho}`;
    if (largo != null) ruta.length > 0 ? ruta += `&largo=${largo}` : ruta += `largo=${largo}`;
    if (fuelle != null) ruta.length > 0 ? ruta += `&fuelle=${fuelle}` : ruta += `fuelle=${fuelle}`;
    if (calibre != null) ruta.length > 0 ? ruta += `&calibre=${calibre}` : ruta += `calibre=${calibre}`;
    if (sales != null) ruta.length > 0 ? ruta += `&sales=${sales}` : ruta += `sales=${sales}`;
    if (ruta.length > 0) ruta = `?${ruta}`;
    return ruta;
  }

  llenarColumnas() {
    let tipoBusqueda: 'Item' | 'OT' = this.formFiltros.value.buscarPorItem_Ot;
    if (tipoBusqueda == 'Item') this.llenarColumnas_BusquedaPorItem();
    else if (tipoBusqueda == 'OT') this.llenarColumnas_BusquedaPorOT();
    this.columnasSeleccionadas = this.columnas;
  }

  llenarColumnas_BusquedaPorItem() {
    //this.ordenesConsultadas.sort((a,b) => Number(b.ordenTrabajo) - Number(a.ordenTrabajo));
    this.ordenesConsultadas = this.ordenesConsultadas.reduce((a, b) => {
      if (!a.map(x => x.item).includes(b.item)) a = [...a, b];
      return a;
    }, []);
    this.consultarExistenciasItems();
    this.ordenesConsultadas.sort((a, b) => Number(a.ordenTrabajo) - Number(b.ordenTrabajo));
    this.columnas = [
      { header: 'Existencia', field: 'existencia', tipo: 'number' },
      { header: 'Cliente', field: 'cliente', tipo: 'text' },
      { header: 'Item', field: 'item', tipo: 'text' },
      { header: 'Referencia', field: 'referencia', tipo: 'text' },
      { header: 'Cantidad', field: 'cantidad', tipo: 'number' },
      { header: 'Precio', field: 'precio', tipo: 'number' },
      { header: 'Presentación', field: 'presentacion', tipo: 'text' },
      { header: 'Material', field: 'material', tipo: 'text' },
      { header: 'Pigmento', field: 'pigmento', tipo: 'text' },
      { header: 'Und', field: 'undExtrusion', tipo: 'text' },
      { header: 'Calibre', field: 'calibre', tipo: 'number' },
      { header: 'Ancho', field: 'ancho', tipo: 'number' },
      { header: 'Largo', field: 'largo', tipo: 'number' },
      { header: 'Fuelle', field: 'fuelle', tipo: 'number' },
      { header: 'Ult. Fecha', field: 'fechaCreacion', tipo: 'date' },
    ];
  }

  consultarExistenciasItems() {
    for (const ot of this.ordenesConsultadas) {
      let presentacion: string = ot.presentacion;
      if (presentacion == 'Unidad') presentacion = 'UND';
      else if (presentacion == 'Kilo') presentacion = 'KLS';
      else if (presentacion == 'Paquete') presentacion = 'PAQ';
      this.zeusService.getExistenciasProductos(ot.item, presentacion).subscribe(data => ot.existencia = data.length > 0 ? data[0].disponibles : 0);
    }
  }

  llenarColumnas_BusquedaPorOT() {
    this.ordenesConsultadas.sort((a, b) => Number(a.ordenTrabajo) - Number(b.ordenTrabajo));
    this.columnas = [
      { header: 'OT', field: 'ordenTrabajo', tipo: 'text' },
      { header: 'Fecha', field: 'fechaCreacion', tipo: 'date' },
      { header: 'Item', field: 'item', tipo: 'text' },
      { header: 'Referencia', field: 'referencia', tipo: 'text' },
      { header: 'Cantidad', field: 'cantidad', tipo: 'number' },
      { header: 'Precio', field: 'precio', tipo: 'number' },
      { header: 'Presentación', field: 'presentacion', tipo: 'text' },
      { header: 'Material', field: 'material', tipo: 'text' },
      { header: 'Pigmento', field: 'pigmento', tipo: 'text' },
      { header: 'Und', field: 'undExtrusion', tipo: 'text' },
      { header: 'Calibre', field: 'calibre', tipo: 'number' },
      { header: 'Formato', field: 'formato', tipo: 'text' },
      { header: 'Ancho', field: 'ancho', tipo: 'number' },
      { header: 'Largo', field: 'largo', tipo: 'number' },
      { header: 'Fuelle', field: 'fuelle', tipo: 'number' },
      { header: 'Ult. Fecha', field: 'fechaCreacion', tipo: 'date' },
    ];
  }

  crearOrdenTrabajo(data: any) {
    let tipoBusqueda: 'Item' | 'OT' = this.formFiltros.value.buscarPorItem_Ot;
    let tabCrearOrden = document.getElementsByClassName('p-element p-ripple p-tabview-nav-link');
    let tabCrearOrden2 = document.getElementById(tabCrearOrden[0].id) as HTMLDivElement;
    tabCrearOrden2.click();
    this.orden_TrabajoComponent.consultarClientes();
    if (tipoBusqueda == 'Item') {
      this.orden_TrabajoComponent.FormOrdenTrabajo.patchValue({
        Id_Producto: data.item,
        Nombre_Producto: data.referencia,
        Presentacion: data.presentacion == 'Kilo' ? 'Kg' : data.presentacion == 'Unidad' ? 'Und' : data.presentacion,
      });
      this.orden_TrabajoComponent.consultarInfoProducto();
    } else if (tipoBusqueda == 'OT') this.orden_TrabajoComponent.busquedaOTBagPro(data);
  }

  crearCopiaOrdenTrabajo(data: any) {
    let tipoBusqueda: 'Item' | 'OT' = this.formFiltros.value.buscarPorItem_Ot;
    this.orden_TrabajoComponent.consultarClientes();
    this.orden_TrabajoComponent.cargando = true;
    this.orden_TrabajoComponent.FormOrdenTrabajo.patchValue({
      Id_Producto: data.item,
      Nombre_Producto: data.referencia,
      Presentacion: data.presentacion == 'Kilo' ? 'Kg' : data.presentacion == 'Unidad' ? 'Und' : data.presentacion,
    });
    if (tipoBusqueda == 'Item') this.orden_TrabajoComponent.consultarInfoProducto();
    else if (tipoBusqueda == 'OT') this.orden_TrabajoComponent.busquedaOTBagPro(data);
    setTimeout(() => {
      this.orden_TrabajoComponent.FormOrdenTrabajo.patchValue({
        Cantidad: data.cantidad,
        Precio: data.precio,
      });
    }, 1000);
    setTimeout(() => this.orden_TrabajoComponent.guardarOt(), 2500);
  }

  exportExcel() {
    if (this.ordenesConsultadas.length > 0) {
      this.cargando = true;
      setTimeout(() => {
        let title: string = `Ordenes de Trabajo`;
        let fill: any = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'eeeeee' } };
        let font: any = { size: 10, bold: true, alignment: 'center', name: 'Calibri' };
        let border: any = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        let workbook = this.svExcel.formatoExcel(title, true);
        this.addSheet(workbook, fill, font, border, this.infoProduction2(), 1);
        this.svExcel.creacionHoja(workbook, `OTs`, false);
        this.svExcel.creacionExcel(`Ordenes de Trabajo ${moment().format('DD-MM-YYYY')}`, workbook);
        this.cargando = false;
      }, 2000);
    } else this.msj.mensajeAdvertencia(`No hay registros para exportar!`);
  }

  //.Agregar hoja al formato excel.
  addSheet(workbook, fill, font, border, data: any, pageNumber: number) {
    let page = workbook.worksheets[pageNumber - 1];
    this.addHeaderPage2(page, font, border, fill);
    page.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
    this.addInfoExcel2(page, data);
  }

  //.Información de la producción.
  infoProduction2() {
    let info: any = [];
    //this.ordenesConsultadas.sort((a,b) => a.id_Vendedor - b.id_Vendedor);
    this.ordenesConsultadas.forEach(d => {
      info.push([d.ordenTrabajo, d.item, d.fechaCreacion.replace('T00:00:00', ''), d.fecha_Despacho.replace('T00:00:00', ''), d.cliente, d.formato_Extrusion + d.ancho_Extrusion + d.calibre_Extrusion + d.pigmento_Extrusion, d.kilos, d.referencia, d.ancho, d.peso_Metro, d.rodillo, d.material, d.maquinas.toString(), d.color_1, d.color_2, d.color_3, d.color_4, d.color_5, d.color_6, d.color_7, d.color_8, d.anchoReal, d.fuelle_Izquierdo, d.fuelle_Derecho, d.largo, d.fuelle_Fondo, d.tipo_Sellado, d.cant_Unidades, d.peso_Millar, d.cantBolsasxPaquete]);
    });
    //this.addTotalSheet1(info);
    return info;
  }

  //.Agregar información a la hoja del excel.
  addInfoExcel2(worksheet: any, data: any) {
    let formatNumber: Array<number> = [7, 9, 10, 22, 23, 24, 25, 26, 28, 29, 30];
    let contador: any = 6;
    let row: any = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD'];
    formatNumber.forEach(i => worksheet.getColumn(i).numFmt = '""#,##0.00;[Red]\-""#,##0.00');

    data.forEach(d => {
      worksheet.addRow(d)
      row.forEach(r => {
        worksheet.getCell(`${r}${contador}`).font = { name: 'Calibri', family: 4, size: 10 };
      });
      contador++
    });
    //row.forEach(r => worksheet.getCell(`${r}${contador - 1}`).font = { name: 'Calibri', family: 4, size: 11, bold : true, }); 
  }

  //.Agregar encabezado a la hoja del excel.
  addHeaderPage2(worksheet, font, border, fill) {
    let rowHeader: any = ['A5', 'B5', 'C5', 'D5', 'E5', 'F5', 'G5', 'H5', 'I5', 'J5', 'K5', 'L5', 'M5', 'N5', 'O5', 'P5', 'Q5', 'R5', 'S5', 'T5', 'U5', 'V5', 'W5', 'X5', 'Y5', 'Z5', 'AA5', 'AB5', 'AC5', 'AD5']
    worksheet.addRow(['Consecutivo', 'Item', 'Fecha', 'Fecha Despacho', 'Cliente', 'Referencia a Extruir', 'Kilos', 'Nombre Referencia', 'Ancho Final', 'PM', 'Rodillo', 'Material', 'Maquinas',
      'Color 1', 'Color 2', 'Color 3', 'Color 4', 'Color 5', 'Color 6', 'Color 7', 'Color 8', 'Ancho', 'F. Izquierdo', 'F. Derecho', 'Largo', 'F. Fondo', 'Tipo Sellado', 'Cant. Unidades', 'Peso Millar', 'Cant. Bolsas Paq.']);

    rowHeader.forEach(x => worksheet.getCell(x).fill = fill);
    rowHeader.forEach(x => worksheet.getCell(x).font = font);
    rowHeader.forEach(x => worksheet.getCell(x).border = border);

    let concatCells: any = ['A1:AD3'];
    this.stylesPage2(worksheet, concatCells, []);
  }

  //.Estilos de la hoja del excel.
  stylesPage2(worksheet, concatCells, formatNumber) {
    formatNumber.forEach(i => worksheet.getColumn(i).numFmt = '""#,##0.00;[Red]\-""#,##0.00');
    [1, 3, 22, 23, 24].forEach(x => worksheet.getColumn(x).width = 12);
    [6].forEach(x => worksheet.getColumn(x).width = 60);
    [5, 8].forEach(x => worksheet.getColumn(x).width = 50);
    [4, 12, 13, 27, 28, 30].forEach(x => worksheet.getColumn(x).width = 15);
    [2, 7, 9, 10, 11, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 29].forEach(x => worksheet.getColumn(x).width = 10);
    concatCells.forEach(cell => worksheet.mergeCells(cell));
  }

  //Totalizado hoja 1
  addTotalSheet1(info) {
    let data: any = info;
    let count: number = 0;
    let t1: number = 0, t2: number = 0, t3: number = 0, t4: number = 0, t5: number = 0;

    data.forEach(x => {
      let total1 = [null, undefined, '', -1].includes(x[10]) ? t1 += 0 : t1 += x[10];
      let total2 = [null, undefined, '', -1].includes(x[11]) ? t2 += 0 : t2 += x[11];
      let total3 = [null, undefined, '', -1].includes(x[12]) ? t3 += 0 : t3 += x[12];
      let total4 = [null, undefined, '', -1].includes(x[13]) ? t4 += 0 : t4 += x[13];
      let total5 = [null, undefined, '', -1].includes(x[14]) ? t5 += 0 : t5 += x[14];

      if ((data.length - 1) == count) info.push(['', '', '', '', '', '', '', '', '', 'TOTAL', total1, total2, total3, total4, total5, '', '']);
      count++;
    })
  }
}