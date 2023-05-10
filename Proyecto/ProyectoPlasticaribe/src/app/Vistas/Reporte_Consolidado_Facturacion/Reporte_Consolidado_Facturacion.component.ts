import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import moment from 'moment';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { InventarioZeusService } from 'src/app/Servicios/InventarioZeus/inventario-zeus.service';
import { AppComponent } from 'src/app/app.component';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';

@Component({
  selector: 'app-Reporte_Consolidado_Facturacion',
  templateUrl: './Reporte_Consolidado_Facturacion.component.html',
  styleUrls: ['./Reporte_Consolidado_Facturacion.component.css']
})
export class Reporte_Consolidado_FacturacionComponent implements OnInit {

  @ViewChild('dt') dt: Table | undefined;
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
  arrayAnios : any = []; /** Array que cargará los años desde 2019 hasta el actual  */
  arrayConsolidado : any [] = []; //Variable que tendrá la información del consolidado consultado
  totalConsulta : number = 0; /** Variable que cargará el valor total de la consulta si se filtra por uno de los campos de la tabla. */
  totalAnio : boolean = true; /** Variable que mostrará el total por año o el valor total segun el filtro seleccionado en la tabla. */
  valorTotalConsulta : number = 0; //Variable que almacenará el costo total de los productos facturdos que trae la consulta
  datosExcel : any [] = []; //Variable que almcaneá la informacion con la que se llenará el excel
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro

  constructor(private frmBuilder : FormBuilder,
                private AppComponent : AppComponent,
                  private invetarioZeusService : InventarioZeusService,
                    private messageService: MessageService) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
    this.formFiltros = this.frmBuilder.group({
      vendedor: [null, Validators.required],
      idvendedor : [null, Validators.required],
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
    setTimeout(() => { this.llenarCampoVendedorLogueado(); }, 500);
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  // Funcion que colocará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = '$1,';
    return number.toString().replace(exp,rep);
  }

  /** llenar el campo del vendedor logueado. */
  llenarCampoVendedorLogueado(){
    if (this.ValidarRol == 2) {
      setTimeout(() => {
        const campoVendedor : any = document.getElementById('campoVendedor');
        campoVendedor.readOnly = true;
      }, 500);
      let vendedor : any = this.storage_Id;
      if (vendedor.toString().length == 2) vendedor = `0${vendedor}`
      else if (vendedor.toString().length == 1) vendedor = `00${vendedor}`
      this.formFiltros.patchValue({ vendedor : vendedor });
      setTimeout(() => { this.seleccionarVendedores(); }, 500);
    }
  }

  /** FuncióN para limpiar los campos del formulario */
  limpiarTodo(){
    this.formFiltros.reset();
    this.arrayClientes = [];
    this.arrayVendedores = [];
    this.llenarCampoVendedorLogueado();
    this.arrayItems = [];
  }

  /** cargar vendedores al datalist que se encuentra en los filtros de busqueda*/
  cargarVendedores(){
    let vendedor : any = this.formFiltros.value.vendedor;
    if(vendedor != null) this.invetarioZeusService.LikeGetVendedores(vendedor).subscribe(dataUsuarios => { this.arrayVendedores = dataUsuarios; });
  }

  /** cargar clientes al datalist que se encuentra en los filtros de busqueda*/
  cargarClientes(){
    let cliente : any = this.formFiltros.value.cliente;
    if(this.formFiltros.value.vendedor == null) {
      if(cliente != null) this.invetarioZeusService.LikeGetClientes(cliente).subscribe(dataClientes => { this.arrayClientes = dataClientes; });
    }
  }

   /** cargar items al datalist que se encuentra en los filtros de busqueda*/
  cargarProductos(){
    let item : any = this.formFiltros.value.item;
    if(this.formFiltros.value.cliente == null) {
      if(item != null) this.invetarioZeusService.LikeGetItems(item).subscribe(dataItems => { this.arrayItems = dataItems; });
    }
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
    let vendedorSeleccionado : any = this.formFiltros.value.vendedor;
    let nuevo : any[] = this.arrayVendedores.filter((item) => item.idvende == vendedorSeleccionado);
    this.formFiltros.patchValue({
      vendedor: nuevo[0].nombvende,
      idvendedor : nuevo[0].idvende,
    });
    this.cargarClientesxVendedor(nuevo[0].idvende);
  }

  /** Se cargarán los clientes del vendedor seleccionado. */
  cargarClientesxVendedor(vendedor : any){
    this.invetarioZeusService.getClientesxVendedor(vendedor).subscribe(dataClientes2 => { this.arrayClientes = dataClientes2; });
  }

  /** Al momento de seleccionar un cliente, se cargaran sus items */
  seleccionarClientes() {
    let expresion : any = /^[0-9]*(\.?)[ 0-9]+$/;
    let clienteSeleccionado : any = this.formFiltros.value.cliente;
    let nuevo : any[] = this.arrayClientes.filter((item) => item.idcliente == clienteSeleccionado);

    if(clienteSeleccionado.match(expresion) != null) {
      this.formFiltros.patchValue({
        cliente: nuevo[0].razoncial,
        idcliente : nuevo[0].idcliente,
      });
      this.cargarItemsxClientes(nuevo[0].idcliente);
    } else {
      if(this.formFiltros.value.vendedor != null) this.cargarClientesxVendedor(this.formFiltros.value.idvendedor);
      else this.arrayClientes = []; this.arrayItems = [];
    }
  }

  /** Cargar los items del cliente seleccionado */
  cargarItemsxClientes(cliente : any) {
    this.invetarioZeusService.getArticulosxCliente(cliente).subscribe(dataArticulo => { this.arrayItems = dataArticulo });
  }

  /** Funcion que se ejecutará al seleccionar un producto. */
  seleccionarProductos() {
    let expresion : any = /^[0-9]*(\.?)[ 0-9]+$/;
    let itemSeleccionado : any = this.formFiltros.value.item;
    let nuevo : any[] = this.arrayItems.filter((item) => item.codigo == itemSeleccionado);

    if(itemSeleccionado.match(expresion) != null) {
      this.formFiltros.patchValue({
        item: nuevo[0].nombre,
        idItem : nuevo[0].codigo,
      });
    } else {
      if (this.formFiltros.value.idcliente != null) this.cargarItemsxClientes(this.formFiltros.value.idcliente);
      else this.arrayItems = [];
    }
  }

  /** Funcion para filtrar busquedas y mostrar el valor total segun el filtro seleccionado. */
  aplicarfiltro($event, campo : any, valorCampo : string){
    this.dt!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);
    setTimeout(() => {
      if(this.dt.filteredValue != null) {
        this.totalAnio = false;
        this.datosExcel = [];
        this.totalConsulta = 0;
        this.valorTotalConsulta = 0;
        for (let i = 0; i < this.dt.filteredValue.length; i++) {
          this.totalConsulta += this.dt.filteredValue[i].SubTotal;
          this.valorTotalConsulta += this.dt.filteredValue[i].SubTotal;
          this.datosExcel.push(this.dt.filteredValue[i])
        }
      } else {
        this.totalAnio = true;
        this.datosExcel = [];
        for (let index = 0; index < this.arrayConsolidado.length; index++) {
          this.calcularTotalVendidoAno(this.arrayConsolidado[index].Ano);
          this.datosExcel.push(this.arrayConsolidado[index])
        }
      }
    }, 500);
  }

  // Funcion que va a consultar el consolidado de los clientes, productos y vendedores
  consultarConsolidado(){
    let vendedor : any = this.formFiltros.value.idvendedor;
    if (vendedor != null) {
      this.cargando = true;
      this.arrayConsolidado = [];
      this.datosExcel = [];
      this.valorTotalConsulta = 0;
      let ruta : string = '';
      let anoInicial : number = this.formFiltros.value.anio1;
      let anoFinal : number = this.formFiltros.value.anio2;
      let cliente : string = this.formFiltros.value.idcliente;
      let nombreCliente : any = this.formFiltros.value.cliente;
      let producto : any = this.formFiltros.value.idItem;
      let nombreItem : any = this.formFiltros.value.item;
      let nombreVendedor : any = this.formFiltros.value.vendedor;
      if (vendedor.length == 2) vendedor = `0${vendedor}`;
      else if (vendedor.length == 1) vendedor = `00${vendedor}`;
      if (producto != null) producto.toString();
      if (anoInicial == null) anoInicial = moment().year();
      if (anoFinal == null) anoFinal = anoInicial;

      if (cliente && nombreCliente && producto && nombreItem && vendedor && nombreVendedor) ruta = `?vendedor=${vendedor}&nombreVendedor=${nombreVendedor}&producto=${producto}&nombreProducto=${nombreItem}&cliente=${cliente}&nombreCliente=${nombreCliente}`;
      else if (cliente && nombreCliente && producto && nombreItem) ruta = `?producto=${producto}&nombreProducto=${nombreItem}&cliente=${cliente}&nombreCliente=${nombreCliente}`;
      else if (cliente && nombreCliente && vendedor && nombreVendedor) ruta = `?vendedor=${vendedor}&nombreVendedor=${nombreVendedor}&cliente=${cliente}&nombreCliente=${nombreCliente}`;
      else if (vendedor && nombreVendedor && producto && nombreItem) ruta = `?vendedor=${vendedor}&nombreVendedor=${nombreVendedor}&producto=${producto}&nombreProducto=${nombreItem}`;
      else if (cliente && nombreCliente) ruta = `?cliente=${cliente}&nombreCliente=${nombreCliente}`;
      else if (producto && nombreItem) ruta = `?producto=${producto}&nombreProducto=${nombreItem}`;
      else if (vendedor && nombreVendedor) ruta = `?vendedor=${vendedor}&nombreVendedor=${nombreVendedor}`;

      this.invetarioZeusService.GetConsolidadClientesArticulo(anoInicial, anoFinal, ruta).subscribe(datos_consolidado => {
        if(datos_consolidado.length == 0) this.mensajeAdvertencia('No se encontraron resultados de búsqueda con la combinación de filtros seleccionada!')
        else {
          for (let i = 0; i < datos_consolidado.length; i++) {
            this.llenarConsolidado(datos_consolidado[i], i);
          }
        }
        setTimeout(() => this.cargando = false, datos_consolidado.length);
      });
    } else this.mensajeAdvertencia(`¡Debe elegir un vendedor!`);
  }

  // Funcion que va a llenar el array que contendrá la informacion del consolidado
  llenarConsolidado(data : any, i : any){
    if (data.devolucion == 0) {
      let info : any = {
        Id : i,
        Ano : `${data.ano}`,
        Id_Cliente : data.id_Cliente,
        Cliente : data.cliente,
        Id_Producto : data.id_Producto,
        Producto : `${data.id_Producto} - ${data.producto} - ${data.presentacion}`,
        Cantidad : data.cantidad,
        Devolucion : data.devolucion,
        Presentacion : data.presentacion,
        Precio : data.precio,
        SubTotal : data.subTotal,
        SubTotalDev : data.cantidad == 0 ? data.subTotal : 0,
        Enero : data.mes == 1 ? data.cantidad : 0,
        Febrero : data.mes == 2 ? data.cantidad : 0,
        Marzo : data.mes == 3 ? data.cantidad : 0,
        Abril : data.mes == 4 ? data.cantidad : 0,
        Mayo : data.mes == 5 ? data.cantidad : 0,
        Junio : data.mes == 6 ? data.cantidad : 0,
        Julio : data.mes == 7 ? data.cantidad : 0,
        Agosto : data.mes == 8 ? data.cantidad : 0,
        Septiembre : data.mes == 9 ? data.cantidad : 0,
        Octubre : data.mes == 10 ? data.cantidad : 0,
        Noviembre : data.mes == 11 ? data.cantidad : 0,
        Diciembre : data.mes == 12 ? data.cantidad : 0,
        Id_Vendedor : data.id_Vendedor,
        Vendedor : data.vendedor,
      }
      this.valorTotalConsulta += info.SubTotal;
      let nuevo = this.arrayConsolidado.findIndex((item) => item.Ano == info.Ano
                  && item.Id_Cliente == info.Id_Cliente
                  && item.Id_Producto == info.Id_Producto
                  && item.Presentacion == info.Presentacion
                  && item.Precio == info.Precio);
      if (nuevo == -1) this.arrayConsolidado.push(info);
      else {
        data.mes == 1 ? this.arrayConsolidado[nuevo].Enero = info.Enero : this.arrayConsolidado[nuevo].Enero;
        data.mes == 2 ? this.arrayConsolidado[nuevo].Febrero = info.Febrero : this.arrayConsolidado[nuevo].Febrero;
        data.mes == 3 ? this.arrayConsolidado[nuevo].Marzo = info.Marzo : this.arrayConsolidado[nuevo].Marzo;
        data.mes == 4 ? this.arrayConsolidado[nuevo].Abril = info.Abril : this.arrayConsolidado[nuevo].Abril;
        data.mes == 5 ? this.arrayConsolidado[nuevo].Mayo = info.Mayo : this.arrayConsolidado[nuevo].Mayo;
        data.mes == 6 ? this.arrayConsolidado[nuevo].Junio = info.Junio : this.arrayConsolidado[nuevo].Junio;
        data.mes == 7 ? this.arrayConsolidado[nuevo].Julio = info.Julio : this.arrayConsolidado[nuevo].Julio;
        data.mes == 8 ? this.arrayConsolidado[nuevo].Agosto = info.Agosto : this.arrayConsolidado[nuevo].Agosto;
        data.mes == 9 ? this.arrayConsolidado[nuevo].Septiembre = info.Septiembre : this.arrayConsolidado[nuevo].Septiembre;
        data.mes == 10 ? this.arrayConsolidado[nuevo].Octubre = info.Octubre : this.arrayConsolidado[nuevo].Octubre;
        data.mes == 11 ? this.arrayConsolidado[nuevo].Noviembre = info.Noviembre : this.arrayConsolidado[nuevo].Noviembre;
        data.mes == 12 ? this.arrayConsolidado[nuevo].Diciembre = info.Diciembre : this.arrayConsolidado[nuevo].Diciembre;
        this.arrayConsolidado[nuevo].SubTotal += info.SubTotal;
        this.arrayConsolidado[nuevo].Precio = (this.arrayConsolidado[nuevo].Precio + info.Precio) / 2;
      }
      this.datosExcel = this.arrayConsolidado;
    }
  }

  // Funcion que va a calcular el subtotal de lo vendido en un año
  calcularTotalVendidoAno(ano : any){
    let total : number = 0;
    let nuevo = this.arrayConsolidado.filter((item) => item.Ano == ano);
    for (let i = 0; i < nuevo.length; i++) {
      total += nuevo[i].SubTotal;
    }
    return total;
  }

  // Funcion que va a exportar a excel la informacion que este cargada en la tabla
  exportarExcel(){
    if (this.arrayConsolidado.length == 0) this.mensajeAdvertencia('Debe haber al menos un pedido en la tabla.');
    else {
      this.cargando = true;
      setTimeout(() => {
        const title = `Consolidado Facturación - ${this.today}`;
        const header = ["Año", "Id Cliente", "Cliente", "Id Producto", "Producto", "Presentación", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre", "Precio Unidad", "SubTotal", "Id vendedor", "Vendedor"];
        let datos : any =[];
        for (const item of this.datosExcel) {
          const datos1  : any = [item.Ano, item.Id_Cliente, item.Cliente, item.Id_Producto, item.Producto, item.Presentacion, item.Enero, item.Febrero, item.Marzo, item.Abril, item.Mayo, item.Junio, item.Julio, item.Agosto, item.Septiembre, item.Octubre, item.Noviembre, item.Diciembre, item.Precio, item.SubTotal, item.Id_Vendedor, item.Vendedor];
          datos.push(datos1);
        }
        let workbook = new Workbook();
        const imageId1 = workbook.addImage({ base64:  logoParaPdf, extension: 'png', });
        let worksheet = workbook.addWorksheet(`Reporte de OT por Procesos - ${this.today}`);
        worksheet.addImage(imageId1, 'A1:C3');
        let titleRow = worksheet.addRow([title]);
        titleRow.font = { name: 'Calibri', family: 4, size: 16, underline: 'double', bold: true };
        worksheet.addRow([]);
        worksheet.addRow([]);
        let headerRow = worksheet.addRow(header);
        headerRow.eachCell((cell, number) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'eeeeee' } }
          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
        });
        worksheet.mergeCells('A1:V3');
        worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };

        datos.forEach(d => {
          let row = worksheet.addRow(d);
          row.alignment = { horizontal : 'center' }
          row.getCell(7).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          row.getCell(8).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          row.getCell(9).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          row.getCell(10).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          row.getCell(11).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          row.getCell(12).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          row.getCell(13).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          row.getCell(14).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          row.getCell(15).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          row.getCell(16).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          row.getCell(17).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          row.getCell(18).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          row.getCell(19).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          row.getCell(20).numFmt = '""#,##0.00;[Red]\-""#,##0.00';

          worksheet.getColumn(1).width = 12;
          worksheet.getColumn(2).width = 15;
          worksheet.getColumn(3).width = 60;
          worksheet.getColumn(4).width = 20;
          worksheet.getColumn(5).width = 50;
          worksheet.getColumn(6).width = 12;
          worksheet.getColumn(7).width = 15;
          worksheet.getColumn(8).width = 15;
          worksheet.getColumn(9).width = 15;
          worksheet.getColumn(10).width = 15;
          worksheet.getColumn(11).width = 15;
          worksheet.getColumn(12).width = 15;
          worksheet.getColumn(13).width = 15;
          worksheet.getColumn(14).width = 15;
          worksheet.getColumn(15).width = 15;
          worksheet.getColumn(16).width = 15;
          worksheet.getColumn(17).width = 15;
          worksheet.getColumn(18).width = 15;
          worksheet.getColumn(19).width = 30;
          worksheet.getColumn(20).width = 30;
          worksheet.getColumn(21).width = 12;
          worksheet.getColumn(22).width = 50;
        });
        setTimeout(() => {
          workbook.xlsx.writeBuffer().then((data) => {
            let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            fs.saveAs(blob, `Consolidado Facturacion - ${this.today}.xlsx`);
          });
          this.cargando = false;
          this.mensajeConfirmacion(`Confirmación`, `¡Archivo de excel generado con éxito!`)
        }, 1000);

      }, 1000);
    }
  }

  // Mostrar mensaje de confirmación
  mensajeConfirmacion(titulo : string, mensaje : any) {
    this.messageService.add({severity: 'success', summary: titulo, detail: mensaje, life: 2000});
  }

  /** Mostrar mensaje de error  */
  mensajeError(titulo : string, mensaje : string) {
    this.messageService.add({severity:'error', summary: titulo, detail: mensaje, life: 2000});
  }

  /** Mostrar mensaje de advertencia */
  mensajeAdvertencia(mensaje : string) {
    this.messageService.add({severity:'warn', summary: `¡Advertencia!`, detail: mensaje, life: 2000});
  }

}
