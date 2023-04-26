import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import moment from 'moment';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { InventarioZeusService } from 'src/app/Servicios/InventarioZeus/inventario-zeus.service';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-Reporte_FacturacionZeus',
  templateUrl: './Reporte_FacturacionZeus.component.html',
  styleUrls: ['./Reporte_FacturacionZeus.component.css']
})

export class Reporte_FacturacionZeusComponent implements OnInit {
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

  constructor(private frmBuilder : FormBuilder,
                private AppComponent : AppComponent,
                  private invetarioZeusService : InventarioZeusService,
                    private messageService: MessageService) {

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

  /** FuncióN para limpiar los campos del formulario */
  limpiarTodo(){
    if(this.ValidarRol == 1) {
      this.formFiltros.reset();
      this.arrayClientes = [];
      this.arrayVendedores = [];
    } else {
      this.formFiltros = this.frmBuilder.group({
        vendedor: this.formFiltros.value.vendedor,
        idvendedor : this.formFiltros.value.idvendedor,
        cliente: [null],
        idcliente : [null],
        item: [null],
        idItem : [null],
        anio1: [null],
        anio2: [null],
      });
    }
    this.arrayItems = [];
  }

  /** cargar vendedores al datalist que se encuentra en los filtros de busqueda*/
  cargarVendedores(){
    this.arrayVendedores = [];
    let vendedor : any = this.formFiltros.value.vendedor;
    if(vendedor != null && vendedor.length > 2) this.invetarioZeusService.LikeGetVendedores(vendedor).subscribe(dataUsuarios => { this.arrayVendedores = dataUsuarios; });
  }

  /** cargar clientes al datalist que se encuentra en los filtros de busqueda*/
  cargarClientes(){
    let cliente : any = this.formFiltros.value.cliente;
    if(this.formFiltros.value.vendedor == null) {
      this.arrayClientes = [];
      if(cliente != null && cliente.length > 2) this.invetarioZeusService.LikeGetClientes(cliente).subscribe(dataClientes => { this.arrayClientes = dataClientes; });
    }
  }

   /** cargar items al datalist que se encuentra en los filtros de busqueda*/
  cargarProductos(){
    let item : any = this.formFiltros.value.item;
    if(this.formFiltros.value.cliente == null) {
      this.arrayItems = [];
      if(item != null && item.length > 2) this.invetarioZeusService.LikeGetItems(item).subscribe(dataItems => { this.arrayItems = dataItems; });
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
    this.formFiltros = this.frmBuilder.group({
      vendedor: nuevo[0].nombvende,
      idvendedor : nuevo[0].idvende,
      cliente: this.formFiltros.value.cliente,
      idcliente : this.formFiltros.value.idcliente,
      item: this.formFiltros.value.item,
      idItem : this.formFiltros.value.idItem,
      anio1: this.formFiltros.value.anio1,
      anio2: this.formFiltros.value.anio2,
    });
    this.cargarClientesxVendedor(nuevo[0].idvende);
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
    let nuevo : any[] = this.arrayClientes.filter((item) => item.idcliente == clienteSeleccionado);

    if(clienteSeleccionado.match(expresion) != null) {
      this.formFiltros.setValue({
        vendedor: this.formFiltros.value.vendedor,
        idvendedor : this.formFiltros.value.idvendedor,
        cliente: nuevo[0].razoncial,
        idcliente : nuevo[0].idcliente,
        item: this.formFiltros.value.item,
        idItem : this.formFiltros.value.idItem,
        anio1: this.formFiltros.value.anio1,
        anio2: this.formFiltros.value.anio2,
      });
      this.cargarItemsxClientes(nuevo[0].idcliente);
    } else {
      if(this.formFiltros.value.vendedor != null) this.cargarClientesxVendedor(this.formFiltros.value.idvendedor);
      else this.arrayClientes = []; this.arrayItems = [];
    }
  }

  /** Cargar los items del cliente seleccionado */
  cargarItemsxClientes(cliente : any) {
    this.arrayItems = [];
    this.invetarioZeusService.getArticulosxCliente(cliente).subscribe(dataArticulo => { this.arrayItems = dataArticulo });
  }

  /** Funcion que se ejecutará al seleccionar un producto. */
  seleccionarProductos() {
    let expresion : any = /^[0-9]*(\.?)[ 0-9]+$/;
    let itemSeleccionado : any = this.formFiltros.value.item;
    let nuevo : any[] = this.arrayItems.filter((item) => item.codigo == itemSeleccionado);

    if(itemSeleccionado.match(expresion) != null) {
      this.formFiltros.setValue({
        vendedor: this.formFiltros.value.vendedor,
        idvendedor : this.formFiltros.value.idvendedor,
        cliente: this.formFiltros.value.cliente,
        idcliente : this.formFiltros.value.idcliente,
        item: nuevo[0].nombre,
        idItem : nuevo[0].codigo,
        anio1: this.formFiltros.value.anio1,
        anio2: this.formFiltros.value.anio2,
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
        this.totalConsulta = 0;
        for (let i = 0; i < this.dt.filteredValue.length; i++) {
          this.totalConsulta += this.dt.filteredValue[i].SubTotal;
        }
      } else {
        this.totalAnio = true;
        for (let index = 0; index < this.arrayConsolidado.length; index++) {
          this.calcularTotalVendidoAno(this.arrayConsolidado[index].Ano);
        }
      }
    }, 500);
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

  // Funcion que va a consultar el consolidado de los clientes, productos y vendedores
  consultarConsolidado(){
    this.cargando = true;
    this.arrayConsolidado = [];
    this.valorTotalConsulta = 0;
    let ruta : string = '';
    let anoInicial : number = this.formFiltros.value.anio1;
    let anoFinal : number = this.formFiltros.value.anio2;
    let cliente : string = this.formFiltros.value.idcliente;
    let nombreCliente : any = this.formFiltros.value.cliente;
    let producto : any = this.formFiltros.value.idItem;
    let nombreItem : any = this.formFiltros.value.item;
    let vendedor : any = this.formFiltros.value.idvendedor;
    let nombreVendedor : any = this.formFiltros.value.vendedor;
    if (vendedor != null) {
      if (vendedor.length == 2) vendedor = `0${vendedor}`;
      else if (vendedor.length == 1) vendedor = `00${vendedor}`;
    }
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
          this.llenarConsolidado(datos_consolidado[i]);
        }
      }
      setTimeout(() => { this.cargando = false; }, datos_consolidado.length);
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
      Presentacion : data.presentacion,
      Precio : data.precio,
      SubTotal : data.subTotal,
      Id_Vendedor : data.id_Vendedor,
      Vendedor : data.vendedor,
    }
    this.valorTotalConsulta += data.subTotal;
    this.arrayConsolidado.push(info);
  }

  // Funcion que va a calcular el subtotal de lo vendido en un año
  calcularTotalVendidoAno(ano : any){
    let total : number = 0;
    for (let i = 0; i < this.arrayConsolidado.length; i++) {
      if (this.arrayConsolidado[i].Ano == ano) total += this.arrayConsolidado[i].SubTotal;
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
        const header = ["Mes", "Año", "Id Cliente", "Cliente", "Id Producto", "Producto", "Cantidad", "Presentación", "Precio Unidad", "SubTotal", "Id vendedor", "Vendedor"];
        let datos : any =[];
        for (const item of this.arrayConsolidado) {
          const datos1  : any = [item.Mes, item.Ano, item.Id_Cliente, item.Cliente, item.Id_Producto, item.Producto, item.Cantidad, item.Presentacion, item.Precio, item.SubTotal, item.Id_Vendedor, item.Vendedor];
          datos.push(datos1);
        }
        let workbook = new Workbook();
        let worksheet = workbook.addWorksheet(`Reporte de OT por Procesos - ${this.today}`);
        let titleRow = worksheet.addRow([title]);
        titleRow.font = { name: 'Calibri', family: 4, size: 16, underline: 'double', bold: true };
        worksheet.addRow([]);
        worksheet.addRow([]);
        let headerRow = worksheet.addRow(header);
        headerRow.eachCell((cell, number) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'eeeeee' } }
          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
        });
        worksheet.mergeCells('A1:L3');
        worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };

        datos.forEach(d => {
          let row = worksheet.addRow(d);
          let mes = row.getCell(1);
          let anio = row.getCell(2);
          let idCliente = row.getCell(3);
          let cliente = row.getCell(4);
          let idProducto = row.getCell(5);
          let producto = row.getCell(6);
          let cantidad = row.getCell(7);
          let presentacion = row.getCell(8);
          let precio = row.getCell(9);
          let subTotal = row.getCell(10);
          let idvendedor = row.getCell(11);
          let vendedor = row.getCell(12);

          mes.alignment = { horizontal : 'center' };
          anio.alignment = { horizontal : 'center' };
          idCliente.alignment = { horizontal : 'center' };
          cliente.alignment = { horizontal : 'center' };
          idProducto.alignment = { horizontal : 'center' };
          producto.alignment = { horizontal : 'center' };
          cantidad.alignment = { horizontal : 'center' };
          presentacion.alignment = { horizontal : 'center' };
          precio.alignment = { horizontal : 'center' };
          subTotal.alignment = { horizontal : 'center' };
          idvendedor.alignment = { horizontal : 'center' };
          vendedor.alignment = { horizontal : 'center' };

          cantidad.numFmt  = '""#,##0.00;[Red]\-""#,##0.00';
          precio.numFmt  = '""#,##0.00;[Red]\-""#,##0.00';
          subTotal.numFmt  = '""#,##0.00;[Red]\-""#,##0.00';

          worksheet.getColumn(1).width = 12;
          worksheet.getColumn(2).width = 12;
          worksheet.getColumn(3).width = 15;
          worksheet.getColumn(4).width = 60;
          worksheet.getColumn(5).width = 12;
          worksheet.getColumn(6).width = 50;
          worksheet.getColumn(7).width = 15;
          worksheet.getColumn(8).width = 15;
          worksheet.getColumn(9).width = 15;
          worksheet.getColumn(10).width = 15;
          worksheet.getColumn(11).width = 12;
          worksheet.getColumn(12).width = 50;
        });
        setTimeout(() => {
          workbook.xlsx.writeBuffer().then((data) => {
            let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            fs.saveAs(blob, `Consolidado Facturacion - ${this.today}.xlsx`);
          });
          this.cargando = false;
          this.mensajeConfirmacion(`Confirmación`, `¡Archivo de excel generado con éxito!`)
        }, 1000);

      }, 1500);
    }
  }

  /** Mostrar mensaje de confirmación  */
  mensajeConfirmacion(titulo : string, mensaje : any) {
    this.messageService.add({severity: 'success', summary: mensaje,  detail: titulo, life: 2000});
   }

  /** Mostrar mensaje de error  */
  mensajeError(titulo : string, mensaje : string) {
  this.messageService.add({severity:'error', summary: mensaje, detail: titulo, life: 2000});
  }

  /** Mostrar mensaje de advertencia */
  mensajeAdvertencia(mensaje : string) {
  this.messageService.add({severity:'warn', summary: `¡Advertencia!`, detail: mensaje, life: 2000});
  }

}
