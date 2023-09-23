import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ShepherdService } from 'angular-shepherd';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import moment from 'moment';
import { Table } from 'primeng/table';
import { InventarioZeusService } from 'src/app/Servicios/InventarioZeus/inventario-zeus.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { UsuarioService } from 'src/app/Servicios/Usuarios/usuario.service';
import { ZeusContabilidadService } from 'src/app/Servicios/Zeus_Contabilidad/zeusContabilidad.service';
import { AppComponent } from 'src/app/app.component';
import { defaultStepOptions, stepsReporteFacturacion as defaultSteps } from 'src/app/data';

@Component({
  selector: 'app-prueba-imagen-cat-insumo',
  templateUrl: './prueba-imagen-cat-insumo.component.html',
  styleUrls: ['./prueba-imagen-cat-insumo.component.css']
})

export class PruebaImagenCatInsumoComponent implements OnInit {

  @ViewChild('dt') dt: Table | undefined;
  formFiltros !: FormGroup; /** Formulario de filtros de busqueda */
  cargando : boolean = false; /** Variable para indicar la espera en la carga de un proceso. */
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  Clientes : any = []; /** Array que contendrá la información de los clientes */
  Items : any = []; /** Array que contendrá la información de los items */
  Vendedores : any = []; /** Array que contendrá la información de los vendedores */
  anos : any [] = [2019]; //Variable que almacenará los años desde el 2019 hasta el año actual
  anioActual : number = moment().year(); //Variable que almacenará la información del año actual en princio y luego podrá cambiar a un año seleccionado
  datosFacturacion : any [] = []; //Variable que tendrá la información del consolidado consultado

  constructor(private frmBuilder : FormBuilder,
                private AppComponent : AppComponent,
                  private invetarioZeusService : InventarioZeusService,
                    private usuariosService : UsuarioService,
                      private shepherdService: ShepherdService,
                        private msj : MensajesAplicacionService,
                          private contabilidadZeus :  ZeusContabilidadService,) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
    this.formFiltros = this.frmBuilder.group({
      Vendedor: [null],
      Id_Vendedor : [null],
      Cliente: [null],
      Id_Cliente : [null],
      Referencia: [null],
      Item : [null],
      anio1: [null],
      anio2: [null],
    });
  }

  ngOnInit() {
    this.lecturaStorage();
    this.cargarAnios();
    this.consultarVendedores();
    this.consultarClientes();
  }

  tutorial(){
    this.shepherdService.defaultStepOptions = defaultStepOptions;
    this.shepherdService.modal = true;
    this.shepherdService.confirmCancel = false;
    this.shepherdService.addSteps(defaultSteps);
    this.shepherdService.start();
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  // Funcion que colocará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

  // funcion que va a limpiar todo
  limpiarTodo(){
    this.formFiltros.reset();
    this.consultarVendedores();
    this.datosFacturacion = [];
    this.cargando = false;
  }

  /** Función para cargar los años en el combobox de años. */
  cargarAnios(){
    for (let i = 0; i < this.anos.length; i++) {
      let num_Mayor : number = Math.max(...this.anos);
      if (num_Mayor == moment().year()) break;
      this.anos.push(num_Mayor + 1);
    }
  }

  // Funcion que va a consultar los vendedores
  consultarVendedores(){
    this.usuariosService.GetVendedores().subscribe(data => {
      if (this.ValidarRol == 1) this.Vendedores = data;
      if (this.ValidarRol == 2) {
        this.Vendedores = data.filter(x => x.usua_Id == this.storage_Id);
        let Id_Vendedor : string = `${this.Vendedores[0].usua_Id}`;
        if (Id_Vendedor.length == 1) Id_Vendedor = `00${Id_Vendedor}`;
        else if (Id_Vendedor.length == 2) Id_Vendedor = `0${Id_Vendedor}`;
        this.formFiltros.patchValue({
          Vendedor: this.Vendedores[0].usua_Nombre,
          Id_Vendedor : Id_Vendedor,
        });
      }
    });
  }

  // Funcion que va a colocar a llenar los campos correspondientes del vendedor
  llenarVendedor(){
    let nombre = this.formFiltros.value.Vendedor;
    let vendedor = this.Vendedores.find(x => x.usua_Nombre == nombre);
    let Id_Vendedor : string = `${vendedor.usua_Id}`;
    if (Id_Vendedor.length == 1) Id_Vendedor = `00${Id_Vendedor}`;
    else if (Id_Vendedor.length == 2) Id_Vendedor = `0${Id_Vendedor}`;
    this.formFiltros.patchValue({
      Vendedor: vendedor.usua_Nombre,
      Id_Vendedor : Id_Vendedor,
    });
  }

  // Funcion que va a consultar los clientes
  consultarClientes(){
    this.contabilidadZeus.GetClientes().subscribe(data => this.Clientes = data);
    if (this.ValidarRol == 2) this.Clientes = this.Clientes.filter(x => x.idvende == this.formFiltros.value.Id_Vendedor);
  }

  // Funcion que va a colocar a llenar los campos correspondientes del cliente
  llenarCliente(){
    let nombre = this.formFiltros.value.Cliente;
    let cliente = this.Clientes.find(x => x.idcliente == nombre);
    this.formFiltros.patchValue({
      Cliente: cliente.razoncial,
      Id_Cliente : cliente.idcliente,
    });
  }

  // Funcion que va a consultar los productos segun un se vaya escribiendo el nombre o el codigo del mismo
  consultarProductos = () => this.invetarioZeusService.LikeGetItems(this.formFiltros.value.Referencia).subscribe(dataItems => this.Items = dataItems);

  // Funcion que va a colocar a llenar los campos correspondientes del producto
  llenarProducto(){
    let item = this.formFiltros.value.Referencia;
    let producto = this.Items.find(x => x.codigo == item);
    this.formFiltros.patchValue({
      Item : producto.codigo,
      Referencia: producto.nombre,
    });
  }

  // Funcion que va consultar en la base de datos la infomracion de la facturación
  consultarFacturacion(){
    this.cargando = true;
    this.datosFacturacion = [];
    
    let anoInicial : number = this.formFiltros.value.anio1;
    let anoFinal : number = this.formFiltros.value.anio2;
    let vendedor = this.formFiltros.value.Id_Vendedor;
    let nombreVendedor = this.formFiltros.value.Vendedor;
    let producto = this.formFiltros.value.Item;
    let nombreItem = this.formFiltros.value.Referencia;
    let cliente = this.formFiltros.value.Id_Cliente;
    let nombreCliente = this.formFiltros.value.Cliente;
    
    let ruta : string = '';

    if (vendedor != null) ruta += `vendedor=${vendedor}`;
    if (nombreVendedor != null) ruta.length > 0 ? ruta += `&nombreVendedor=${nombreVendedor}` : ruta += `nombreVendedor=${nombreVendedor}`;
    if (producto != null) ruta.length > 0 ? ruta += `&producto=${producto}` : ruta += `producto=${producto}`;
    if (nombreItem != null) ruta.length > 0 ? ruta += `&nombreProducto=${nombreItem}` : ruta += `nombreProducto=${nombreItem}`;
    if (cliente != null) ruta.length > 0 ? ruta += `&cliente=${cliente}` : ruta += `cliente=${cliente}`;
    if (nombreCliente != null) ruta.length > 0 ? ruta += `&nombreCliente=${nombreCliente}` : ruta += `nombreCliente=${nombreCliente}`;
    if (ruta.length > 0) ruta = `?${ruta}`;

    if (anoInicial == null) anoInicial = moment().year();
    if (anoFinal == null) anoFinal = anoInicial;

    this.invetarioZeusService.GetConsolidadClientesArticulo(anoInicial, anoFinal, ruta).subscribe(data => {
      if (data.length == 0) this.msj.mensajeAdvertencia('¡No se encontraron resultados de bésqueda con la combinación de filtros seleccionada!');
      else data.forEach(x => this.llenarConsolidado(x));
    }, null, () => this.cargando = false);
  }

  // Funcion que va a llenar el array que contendrá la informacion del consolidado
  llenarConsolidado(data : any){
    if (data.devolucion == 0) {
      let info : any = {
        Id : this.datosFacturacion.length == 0 ? 1 : Math.max(...this.datosFacturacion.map(x => x.Id)) + 1,
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
      let nuevo = this.datosFacturacion.findIndex((item) => item.Ano == info.Ano
                  && item.Id_Cliente == info.Id_Cliente
                  && item.Id_Producto == info.Id_Producto
                  && item.Presentacion == info.Presentacion
                  && item.Precio == info.Precio);
      if (nuevo == -1) this.datosFacturacion.push(info);
      else {
        data.mes == 1 ? this.datosFacturacion[nuevo].Enero = info.Enero : this.datosFacturacion[nuevo].Enero;
        data.mes == 2 ? this.datosFacturacion[nuevo].Febrero = info.Febrero : this.datosFacturacion[nuevo].Febrero;
        data.mes == 3 ? this.datosFacturacion[nuevo].Marzo = info.Marzo : this.datosFacturacion[nuevo].Marzo;
        data.mes == 4 ? this.datosFacturacion[nuevo].Abril = info.Abril : this.datosFacturacion[nuevo].Abril;
        data.mes == 5 ? this.datosFacturacion[nuevo].Mayo = info.Mayo : this.datosFacturacion[nuevo].Mayo;
        data.mes == 6 ? this.datosFacturacion[nuevo].Junio = info.Junio : this.datosFacturacion[nuevo].Junio;
        data.mes == 7 ? this.datosFacturacion[nuevo].Julio = info.Julio : this.datosFacturacion[nuevo].Julio;
        data.mes == 8 ? this.datosFacturacion[nuevo].Agosto = info.Agosto : this.datosFacturacion[nuevo].Agosto;
        data.mes == 9 ? this.datosFacturacion[nuevo].Septiembre = info.Septiembre : this.datosFacturacion[nuevo].Septiembre;
        data.mes == 10 ? this.datosFacturacion[nuevo].Octubre = info.Octubre : this.datosFacturacion[nuevo].Octubre;
        data.mes == 11 ? this.datosFacturacion[nuevo].Noviembre = info.Noviembre : this.datosFacturacion[nuevo].Noviembre;
        data.mes == 12 ? this.datosFacturacion[nuevo].Diciembre = info.Diciembre : this.datosFacturacion[nuevo].Diciembre;
        this.datosFacturacion[nuevo].SubTotal += info.SubTotal;
        this.datosFacturacion[nuevo].Precio = (this.datosFacturacion[nuevo].Precio + info.Precio) / 2;
      }
    }
  }

  // Funcion que va a calcular y devolver el valor total de la facturación
  calcularTotal = () => this.datosFacturacion.reduce((acc, item) => acc + item.SubTotal, 0);

  // Funcion que va a calcular y devolver el valor total de lo facturado en un año
  calcularTotalAno = (ano : number) => this.datosFacturacion.filter(x => x.Ano == ano).reduce((acc, item) => acc + item.SubTotal, 0);

  /** Funcion para filtrar busquedas y mostrar el valor total segun el filtro seleccionado. */
  aplicarfiltro = ($event, campo : any, valorCampo : string) => this.dt!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

  // Funcion que va a exportar a excel la informacion que este cargada en la tabla
  exportarExcel(){
    if (this.datosFacturacion.length == 0) this.msj.mensajeAdvertencia(`Advertencia`, 'Debe haber al menos un pedido en la tabla.');
    else {
      this.cargando = true;
      setTimeout(() => {
        const title = `Consolidado Facturación - ${moment().format('DD-MM-YYYY')}`;
        const header = ["Año", "Id Cliente", "Cliente", "Id Producto", "Producto", "Presentación", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre", "Precio Unidad", "SubTotal", "Id vendedor", "Vendedor"];
        let datos : any =[];
        for (const item of this.datosFacturacion) {
          const datos1  : any = [item.Ano, item.Id_Cliente, item.Cliente, item.Id_Producto, item.Producto, item.Presentacion, item.Enero, item.Febrero, item.Marzo, item.Abril, item.Mayo, item.Junio, item.Julio, item.Agosto, item.Septiembre, item.Octubre, item.Noviembre, item.Diciembre, item.Precio, item.SubTotal, item.Id_Vendedor, item.Vendedor];
          datos.push(datos1);
        }
        let workbook = new Workbook();
        let worksheet = workbook.addWorksheet(`Reporte de OT por Procesos - ${moment().format('DD-MM-YYYY')}`);
        let titleRow = worksheet.addRow([title]);
        titleRow.font = { name: 'Calibri', family: 4, size: 16, underline: 'double', bold: true };
        worksheet.addRow([]);
        worksheet.addRow([]);
        let headerRow = worksheet.addRow(header);
        headerRow.eachCell((cell) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'eeeeee' } }
          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
        });
        worksheet.mergeCells('A1:V3');
        worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };

        datos.forEach(d => {
          let row = worksheet.addRow(d);
          row.alignment = { horizontal : 'center' }

          let frtNum : number [] = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
          let width12 : number [] = [1, 6, 21];
          let width15 : number [] = [2, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
          let width30 : number [] = [19, 20];
          let width50 : number [] = [5, 22];

          frtNum.forEach(n => row.getCell(n).numFmt = '""#,##0.00;[Red]\-""#,##0.00');
          width12.forEach(n => worksheet.getColumn(n).width = 12);
          width15.forEach(n => worksheet.getColumn(n).width = 15);
          width30.forEach(n => worksheet.getColumn(n).width = 30);
          width50.forEach(n => worksheet.getColumn(n).width = 50);

          worksheet.getColumn(3).width = 60;
          worksheet.getColumn(4).width = 20;
        });
        setTimeout(() => {
          workbook.xlsx.writeBuffer().then((data) => {
            let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            fs.saveAs(blob, `Consolidado Facturacion - ${moment().format('DD-MM-YYYY')}.xlsx`);
          });
          this.cargando = false;
          this.msj.mensajeConfirmacion(`Confirmación`, `¡Archivo de excel generado con éxito!`)
        }, 1000);
      }, 1000);
    }
  }
}