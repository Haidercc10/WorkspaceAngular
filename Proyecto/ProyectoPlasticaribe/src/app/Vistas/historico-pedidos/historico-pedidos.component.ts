import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { Table } from 'primeng/table';
import { CreacionExcelService } from 'src/app/Servicios/CreacionExcel/CreacionExcel.service';
import { InventarioZeusService } from 'src/app/Servicios/InventarioZeus/inventario-zeus.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { UsuarioService } from 'src/app/Servicios/Usuarios/usuario.service';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-historico-pedidos',
  templateUrl: './historico-pedidos.component.html',
  styleUrls: ['./historico-pedidos.component.css']
})
export class HistoricoPedidosComponent implements OnInit {
  @ViewChild('dt') dt !: Table;
  cargando: boolean = false;
  modoSeleccionado: boolean = false;
  storage_Id: number = 0;
  ValidarRol: number = 0;
  formFiltros: FormGroup;
  pedidosHistoricos: any[] = [];
  columnasTabla: string[] = [];
  columnasTabla2: string[] = [];
  clientes: any[] = [];
  vendedores: any[] = [];
  displayDialog: boolean = false;
  facturaSeleccionada: any = null;
  estadoPedido: any = [
    'Pendiente', 
    'Parcialmente Satisfecho',
    'Liquidado'
  ];
  selectedSaleOrder: any = null;

  constructor(private AppComponent: AppComponent,
    private frmBuilder: FormBuilder,
    private inventarioZeusService: InventarioZeusService,
    private msj: MensajesAplicacionService,
    private svcExcel: CreacionExcelService,
    private svSales: UsuarioService,
  ) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;

    this.formFiltros = this.frmBuilder.group({
      date1: [null, Validators.required],
      date2: [null, Validators.required],
      client: [null],
      clientId: [null],
      sales: [null],
      oc: [null],
      estado: [[]],
    });


  }

  ngOnInit(): void {
    this.lecturaStorage();
    this.loadRankDates();
    this.obtenerVendedores();
    this.formFiltros.patchValue({ 'estado': [] });
  }

  // Funcion que leera la informacion almacenada en el storage del navegador.
  lecturaStorage() {
    this.storage_Id = this.AppComponent.storage_Id;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  //Función que carga el rango de fechas por defecto para la consulta, 
  // siendo los ultimos 30 dias a partir de la fecha actual.
  loadRankDates() {
    let initialDate = new Date(moment().subtract(30, 'days').format('YYYY-MM-DD'));
    this.formFiltros.patchValue({ 'date1': initialDate, 'date2': new Date(), 'estado': [] });
  }

  // Funcion que valida y arma los parametros opcionales de consulta.
  validarParametrosOpcionales(): string {
    let ruta: string = '';
    let client: string = this.formFiltros.value.clientId?.toString().trim();
    let sales: string | null = this.formFiltros.value.sales?.toString().trim();
    let oc: string = this.formFiltros.value.oc?.toString().trim();

    sales = sales ? String(sales).padStart(3, '0') : null;

    if (client) ruta += `client=${encodeURIComponent(client)}`;
    if (sales) ruta.length > 0 ? ruta += `&sales=${encodeURIComponent(sales)}` : ruta += `sales=${encodeURIComponent(sales)}`;
    if (oc) ruta.length > 0 ? ruta += `&oc=${encodeURIComponent(oc)}` : ruta += `oc=${encodeURIComponent(oc)}`;
    //if (status) ruta.length > 0 ? ruta += `&status=${encodeURIComponent(status)}` : ruta += `status=${encodeURIComponent(status)}`;

    if (ruta.length > 0) ruta = `?${ruta}`;
    return ruta;
  }

  // Funcion que consulta los clientes desde Inventario Zeus para el formulario.
  obtenerClientes() {
    let texto: string = this.formFiltros.value.client?.toString().trim();
    if (!texto) {
      this.clientes = [];
      return;
    }

    this.inventarioZeusService.LikeGetClientes(texto).subscribe(resp => {
      this.clientes = Array.isArray(resp) ? resp : [];
    });
  }

  // Funcion que se ejecuta al seleccionar un cliente para actualizar el formulario.
  clienteSeleccionado() {
    let cliente: any = this.formFiltros.value.client;
    this.formFiltros.patchValue({
      clientId: cliente,
      client: this.clientes.find(x => x.idcliente == cliente).razoncial
    });
  }

  // Funcion que consulta los vendedores desde el servicio de usuarios para el formulario.
  obtenerVendedores() {
    let user: any = this.ValidarRol == 2 ? String(this.storage_Id).padStart(3, '0') : null;

    this.svSales.GetVendedores().subscribe(resp => {
      this.vendedores = user ? resp.filter((x: any) => x.usua_Id === parseInt(`${user}`)) : resp;
    });
  }

  // Funcion que consume el servicio de pedidos historicos.
  consultarPedidosHistoricos() {
    if (this.formFiltros.invalid) {
      this.formFiltros.markAllAsTouched();
      this.msj.mensajeAdvertencia('Debe seleccionar el rango de fechas para consultar.');
      return;
    }
    let status: any = this.formFiltros.value.estado == null ? [''] : this.formFiltros.value.estado;
    this.cargando = true;
    this.pedidosHistoricos = [];
    console.log(status)


    let fecha1: string = moment(this.formFiltros.value.date1).format('YYYY-MM-DD');
    let fecha2: string = moment(this.formFiltros.value.date2).format('YYYY-MM-DD');
    let ruta: string = this.validarParametrosOpcionales();

    
    this.inventarioZeusService.GetTodosPedidos(status, fecha1, fecha2, ruta).subscribe({
      next: (res) => {
        this.pedidosHistoricos = Array.isArray(res) ? res : [];
        this.columnasTabla = this.pedidosHistoricos.length > 0 ? Object.keys(this.pedidosHistoricos[0]) : [];
      },
      error: (error) => {
        this.msj.mensajeAdvertencia('No fue posible consultar los pedidos historicos.', error?.error ?? '');
        this.cargando = false;
      },
      complete: () => this.cargando = false
    });
  }

  //Funcion que limpia los campos del formulario y los resultados de la consulta.
  limpiarCampos() {
    this.formFiltros.reset();
    this.pedidosHistoricos = [];
    this.columnasTabla = [];
    this.clientes = [];
    this.vendedores = [];
    this.selectedSaleOrder = null;
    if (this.dt) this.dt.clear();
    this.loadRankDates();
    this.obtenerVendedores();
  }

  aplicarFiltro = ($event, campo : any, datos : Table) => datos!.filter(($event.target as HTMLInputElement).value, campo, 'contains');

  // Funcion para validar si un valor puede ser tratado como numero.
  esNumero(valor: any): boolean {
    if (typeof valor === 'number') return Number.isFinite(valor);
    if (typeof valor !== 'string') return false;

    const normalizado = valor.trim().replace(/\s/g, '').replace(/,/g, '');
    return normalizado.length > 0 && !isNaN(Number(normalizado));
  }

  // Funcion para dar formato numerico con miles y control de decimales por columna.
  formatoNumero(valor: any, columna: string): string {
    if (!this.esNumero(valor)) return valor;
    const normalizado = typeof valor === 'string' ? valor.trim().replace(/\s/g, '').replace(/,/g, '') : valor;
    const columnasSinDecimales: string[] = ['consecutivo', 'id_cliente', 'id_producto', 'id_vendedor', 'orden_Compra_CLiente', 'factura', 'item', 'detalle'];
    const campo = (columna || '').toLowerCase();

    if (columnasSinDecimales.includes(campo)) {
      return `${Math.trunc(Number(normalizado))}`;
    }

    return Number(normalizado).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // Funcion para validar si una columna debe tener estilo bold.
  esBold(columna: string): boolean {
    const columnasEnBold: string[] = ['consecutivo', 'cliente', 'producto', 'cant_Facturada', 'vendedor', 'costo_Cant_Total', 'estado', 'cantidad'];
    const columnaLower = (columna || '').toLowerCase();
    return columnasEnBold.some(col => col.toLowerCase() === columnaLower);
  }

  // Funcion para renombrar columnas a nombres amigables.
  renombrarColumna(columna: string): string {
    const mapeoColumnas: { [key: string]: string } = {
      'consecutivo': 'Consec.',
      'cliente': 'Cliente',
      'ciudad': 'Ciudad',
      'producto': 'Referencia',
      'cant_Pedida': 'Cant. Pedida',
      'cant_Pendiente': 'Cant. Pendiente',
      'cant_Facturada': 'Cant. Facturada',
      'presentacion': 'Presentación',
      'precioUnidad': 'Precio U.',
      'estado': 'Estado',
      'vendedor': 'Vendedor',
      'orden_Compra_CLiente': 'OC',
      'costo_Cant_Pendiente': 'Costo Cant. Pendiente',
      'costo_Cant_Total': 'Costo Total',
      'fecha_Creacion': 'Fecha Creación',
      'fecha_Entrega': 'Fecha Entrega',
      'id_Producto': 'Item',
      'detalle': 'Detalle',
    };
    return mapeoColumnas[columna] || columna;
  }

  // Funcion que convierte la primera letra de cada clave en mayuscula.
  capitalizarClave(columna: string): string {
    if (!columna) return columna;
    return columna.charAt(0).toUpperCase() + columna.slice(1);
  }

  // Funcion que formatea valores para la exportacion a excel.
  formatoValorExcel(valor: any, columna: string): any {
    const campo = (columna || '').toLowerCase();
    const columnasConFormatoDecimal: string[] = [
      'cant_pedida',
      'cant_pendiente',
      'cant_facturada',
      'cantidad',
      'costo_cant_pendiente',
      'costo_cant_total',
      'preciounidad',
      'valor',
      'total',
    ];

    if (this.esNumero(valor) && columnasConFormatoDecimal.includes(campo)) {
      return Number(typeof valor === 'string' ? valor.trim().replace(/\s/g, '').replace(/,/g, '') : valor)
        .toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    return valor;
  }

  // Funcion que se ejecuta al hacer doble click en un pedido para mostrar la factura relacionada.
  viewFact(pedido: any) {
    if (!pedido || !pedido.consecutivo) return;
    this.selectedSaleOrder = pedido.consecutivo;
    this.inventarioZeusService.getFactForSales(pedido.consecutivo, pedido.id_Producto).subscribe({
      next: (res) => {
        if (res) {
          this.displayDialog = true;
          this.facturaSeleccionada = res;
          this.columnasTabla2 = this.facturaSeleccionada.length > 0 ? Object.keys(this.facturaSeleccionada[0]) : [];
        } else this.msj.mensajeAdvertencia('No se encontró una factura relacionada para el pedido seleccionado.');
      },
      error: (error) => {
        this.msj.mensajeAdvertencia('Error al consultar la factura relacionada.', error?.error ?? '');
      }
    });
  }

  //Funcion que calcula el total de una columna numerica para mostrar en el footer de la tabla.
  totalizador(columna: string, document: any): number | null {
    const campo = (columna || '').toLowerCase();
    const columnasNumericas: string[] = ['cant_pedida', 'cant_pendiente', 'cant_facturada', 'cantidad', 'costo_cant_pendiente', 'costo_cant_total', 'preciounidad', 'valor', 'total', 'subtotal'];

    if (!columnasNumericas.includes(campo)) return null;

    let typeDocument = document == 'factura' ? this.facturaSeleccionada : document == 'pedido' ? this.pedidosHistoricos : null;
    if (!typeDocument) return null;

    return typeDocument.reduce((total: number, item: any) => {
      const valor = item[columna] ?? 0;

      if (this.esNumero(valor)) {
        const numero = Number(typeof valor === 'string' ? valor.trim().replace(/\s/g, '').replace(/,/g, '') : valor);
        return total + numero;
      }
      return total;
    }, 0);
  }

// Funcion utilizada para descargar en excel la informacion de la tabla.
exportExcel() {
  if (this.pedidosHistoricos.length === 0) {
    this.msj.mensajeAdvertencia('No hay registros para exportar.');
    return;
  }

  let date1: string = moment(this.formFiltros.value.date1).format('DD-MM-YYYY');
  let date2: string = moment(this.formFiltros.value.date2).format('DD-MM-YYYY');
  let title: string = `Historico Pedidos de ${date1} a ${date2}`;
  let fill: any = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'eeeeee' } };
  let font: any = { size: 12, bold: true, alignment: 'center', name: 'Calibri' };
  let border: any = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };

  this.cargando = true;
  let workbook = this.svcExcel.formatoExcel(title, true);
  let worksheet = workbook.worksheets[0];

  const headers = this.columnasTabla.length > 0 ? this.columnasTabla : Object.keys(this.pedidosHistoricos[0]);
  const renamedHeaders = headers.map((header) => this.renombrarColumna(header));

  worksheet.addRow(renamedHeaders);

  headers.forEach((_, index) => {
    const cell = worksheet.getCell(5, index + 1);
    cell.fill = fill;
    cell.font = font;
    cell.border = border;
  });

  this.pedidosHistoricos.forEach((pedido) => {
    worksheet.addRow(headers.map((header) => this.formatoValorExcel(pedido[header], header)));
  });

  let concatCells: any = ['A1:R3'];
  concatCells.forEach(cell => worksheet.mergeCells(cell));
  worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'right' };

  headers.forEach((_, index) => {
    worksheet.getColumn(index + 1).width = 22;
  });

  this.svcExcel.creacionExcel(title, workbook);
  this.cargando = false;
}

}
