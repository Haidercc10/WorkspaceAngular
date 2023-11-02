import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import moment from 'moment';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { CreacionPdfService } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';
import { InventarioZeusService } from 'src/app/Servicios/InventarioZeus/inventario-zeus.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { ProductoService } from 'src/app/Servicios/Productos/producto.service';
import { UsuarioService } from 'src/app/Servicios/Usuarios/usuario.service';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-Reporte-Facturacion-Detallada',
  templateUrl: './Reporte-Facturacion-Detallada.component.html',
  styleUrls: ['./Reporte-Facturacion-Detallada.component.css']
})
export class ReporteFacturacionDetalladaComponent implements OnInit {

  cargando : boolean = false;
  modoSeleccionado : boolean = false;
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  formFiltros !: FormGroup;
  dataFacturacion : any [] = [];
  dataPDF : any [] = [];
  vendedores : any [] = [];
  clientes : any [] = [];
  productos : any [] = [];
  infoPdf : any[] = [];
  infoDevoluciones : any[] = [];
  @ViewChild('dtFacturacion') dtFacturacion: Table | undefined;
  @ViewChild('dtDevolucion') dtDevolucion: Table | undefined;
  modal : boolean = false;
  facturasModal : any = [];
  nroFactura : string = ``;

  constructor(private AppComponent : AppComponent,
                private frmBuilder : FormBuilder,
                  private zeusService : InventarioZeusService,
                    private productosService : ProductoService,
                      private vendedorService : UsuarioService,
                        private pdfService : CreacionPdfService,
                          private msj : MensajesAplicacionService, 
                            private msg : MessageService) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;

    this.formFiltros = this.frmBuilder.group({
      rangoFechas : [null],
      idCliente : [null],
      cliente : [null],
      vendedor : [null],
      idProducto : [null],
      producto : [null]
    });
  }

  ngOnInit() {
    this.obtenerVendedores();
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g,'$1,');

  // Funcion que se encargará de limpiar todo
  limpiarCampos(){
    this.formFiltros.reset();
    this.dataFacturacion = [];
    this.clientes = [];
    this.productos = [];
  }

  // Funcion que se encargará de obtener los vendedores
  obtenerVendedores(){
    this.vendedorService.GetVendedores().subscribe(resp => this.vendedores = resp);
  }

  // Funcion que se encargaá de buscar los clientes
  obtenerClientes(){
    let nombre : string = this.formFiltros.value.cliente;
    this.zeusService.LikeGetClientes(nombre).subscribe(resp => this.clientes = resp);
  }

  // Funcion que se encargará de colocar la información de los clientes en cada uno de los campos
  clienteSeleccionado(){
    let cliente : any = this.formFiltros.value.cliente;
    this.formFiltros.patchValue({
      idCliente : cliente,
      cliente : this.clientes.find(x => x.idcliente == cliente).razoncial
    });
  }

  // Funcion que se encargará de buscar los productos
  obtenerProductos(){
    let nombre : string = this.formFiltros.value.producto;
    this.productosService.obtenerItemsLike(nombre).subscribe(resp => this.productos = resp);
  }

  // Funcion que se encargará de colocar la información de los productos en cada uno de los campos
  productoSeleccionado(){
    let producto : any = this.formFiltros.value.producto;
    this.formFiltros.patchValue({
      idProducto : producto,
      producto : this.productos.find(x => x.prod_Id == producto).prod_Nombre
    });
  }

  // Funcion que se encargará de buscar las facturas
  buscarFacturacion(){
    if (this.formFiltros.value.rangoFechas) {
      this.dataFacturacion = [];
      this.cargando = true;
      let fechaInicial : any = moment(this.formFiltros.value.rangoFechas[0]).format('YYYY-MM-DD');
      let fechaFinal : any = moment(this.formFiltros.value.rangoFechas[1]).format('YYYY-MM-DD');

      this.zeusService.GetFacturacionConsolidada(fechaInicial, fechaFinal, this.validarParametrosConsulta(false)).subscribe(res => this.llenarDatosFacturas(res));
      this.zeusService.GetDevolucionesDetalladas(fechaInicial, fechaFinal, 2, this.validarParametrosConsulta(false)).subscribe(res => this.llenarDatosDevoluciones(res));
      this.cargarFacturacionDetallada(fechaInicial, fechaFinal, this.validarParametrosConsulta(true));
      this.cargarDevolucionesDetalladas(fechaInicial, fechaFinal, 1, this.validarParametrosConsulta(false));
      this.colocarNombresVendedores();
      setTimeout(() => this.cargando = false, 2000);
    } else this.msj.mensajeAdvertencia(`¡Debes seleccionar el rango de fechas a buscar!`);
  }

  // Funcion que retornará los parametros adicionales que tendrán las consultas de facturación y de devolución
  validarParametrosConsulta(factura : boolean){
    let cliente : any = this.formFiltros.value.idCliente;
    let vendedor : string = this.formFiltros.value.vendedor;
    let producto : any = this.formFiltros.value.idProducto;
    let ruta : string = ``;
    
    if(vendedor != null && vendedor != '' && vendedor != undefined) {
      if (vendedor.toString().length == 2) vendedor = `0${vendedor}`;
      else if (vendedor.toString().length == 1) vendedor = `00${vendedor}`;
    }
    if (cliente != null) ruta += `cliente=${cliente}`;
    if (vendedor != null) ruta.length > 0 ? ruta += `&vendedor=${vendedor}` : ruta += `vendedor=${vendedor}`;
    if (factura && producto != null) ruta.length > 0 ? ruta += `&item=${producto}` : ruta += `item=${producto}`;
    if (ruta.length > 0) ruta = `?${ruta}`;
    return ruta;
  }

  // Funcion que se encargará de llenar la guardar la información de las facturas
  llenarDatosFacturas(facturas : any []){
    facturas.forEach(fac => {
      this.dataFacturacion.push({
        fecha: fac.fechatra,
        factura: fac.numefac,
        cliente: fac.descritra,
        recibo: ``,
        suma: (fac.valortra)
      });
      this.dataFacturacion.sort((a,b) => a.factura.localeCompare(b.factura));
    });
  }

  // Funcion que se encargará de llenar la guardar la información de las devoluciones
  llenarDatosDevoluciones(devoluciones : any []){
    devoluciones.forEach(dev => {
      this.dataFacturacion.push({
        fecha: dev.fechatra,
        factura: dev.numefac,
        cliente: dev.descritra,
        recibo: `DEVOLUCIÓN`,
        suma: (dev.valortra)
      });
      this.dataFacturacion.sort((a,b) => a.recibo.localeCompare(b.recibo));
    });
  }

  // Funcion que devolverá la información que se mostrará en la tabla de facturas
  tableFacturas(){
    return this.dataFacturacion.filter(x => x.recibo != 'DEVOLUCIÓN');
  }

  // Funcion que devolverá la información que se mostrará en la tabla de devoluciones
  tableDevoluciones(){
    return this.dataFacturacion.filter(x => x.recibo == 'DEVOLUCIÓN');
  }

  // Funcion que devolverá el total de facturas
  totalFacturas(){
    let total : number = 0;
    this.dataFacturacion.forEach(fac => {
      if (fac.recibo != 'DEVOLUCIÓN') total += fac.suma;
    });
    return total;
  }

  // Funcion que devolverá el total de devoluciones
  totalDevoluciones(){
    let total : number = 0;
    this.dataFacturacion.forEach(fac => {
      if (fac.recibo == 'DEVOLUCIÓN') total += fac.suma;
    });
    return total;
  }
  
  // Funcion que se encargará de generar el PDF de la información de las facturas y de las devoluciones realizadas en el rango de fechas seleccionado.
  formatoPDF(){
    if (this.dataFacturacion.length > 0) {
      this.onReject();
      this.cargando = true;
      this.dataPDF = this.dataFacturacion;
      let headerAdicional : any [] = this.headerAdicional();
      let contentPDf : any [] = this.pdfFacturaConsolidad(this.dataPDF);
      let titulo = 'Informe de Ventas';
      this.pdfService.formatoPDF(titulo, contentPDf, headerAdicional);
      setTimeout(() => this.cargando = false, 3000);
    } else this.msj.mensajeAdvertencia(`¡Primero debes buscar la información que se verá en el PDF!`);
  }

  // Funcion que retornará un header adicional al que el PDF tiene por defecto, en este caso son los titulos de cada columna
  headerAdicional(){
    let data : any = [];
    data.push([
      {
        margin: [25, 0],
        fontSize: 10,
        bold: true,
        table: {
          widths: ['10%', '15%', '45%', '15%', '15%'],
          body: [
            [
              { text: `Fecha`, alignment: 'center',  fillColor: '#ccc', border: [true, true, false, true] },
              { text: `Factura`, alignment: 'center',  fillColor: '#ccc', border: [false, true, false, true] },
              { text: `Cliente`, alignment: 'center',  fillColor: '#ccc', border: [false, true, false, true] },
              { text: `Total`, alignment: 'center',  fillColor: '#ccc', border: [false, true, false, true] },
              { text: `RC`, alignment: 'center',  fillColor: '#ccc', border: [false, true, true, true] },
            ]
          ]
        }
      }
    ]);
    return data;
  }

  // Funcion que retornará el contenido del PDF
  pdfFacturaConsolidad(datos : any []){
    let data : any = [];
    data.push([
      {
        margin: 5,
        fontSize: 8,
        border: [true, false, true, false],
        table: {
          dontBreakRows: true,
          widths : ['10%', '15%', '45%', '15%', '15%'],
          body: this.facturas(datos)
        }
      },
    ]);
    return data;
  }

  // Funcion que retornará los datos de las facturas y devoluciones del PDF
  facturas(datos : any []){
    let data : any = [];
    for (let i = 0; i < datos.length; i++) {
      data.push([
        { text: moment(datos[i].fecha).format('YYYY-MM-DD'), margin: 5, border: [false, false, false, false], alignment: 'center', },
        { text: datos[i].factura, margin: 5, border: [false, false, false, false], alignment: 'center', },
        { text: datos[i].cliente, margin: 5, border: [false, false, false, false], alignment: 'left', },
        { text: `$ ${this.formatonumeros(datos[i].suma)}`, margin: 5, border: [false, false, false, false], alignment: 'right', bold: true },
        { text: datos[i].recibo, margin: 5, border: [false, false, false, false], alignment: 'center', bold: true },
      ]);
    }
    data.push([
      { colSpan: 4, border: [false, true, false, false], alignment: 'right', fontSize: 11, bold: true, text: `$ ${this.formatonumeros((this.subTotalFacturacion().toFixed(2)))}`, },
      {},
      {},
      {},
      { border: [false, true, false, false], text: `` },
    ]);
    return data;
  }

  // Funcion que retornará el total de facturas y devolucione
  subTotalFacturacion() : number {
    let total : number = 0;
    total = this.dataPDF.reduce((a,b) => a + b.suma, 0);
    return total;
  }

  // Funcion que retornará el total de IVA
  subTotalIva() : number {
    let total : number = 0;
    total = this.dataPDF.reduce((a,b) => a + b.iva, 0);
    return total;
  }

  //Función que cargará la facturacion detallada segun los filtros especificados
  cargarFacturacionDetallada(fecha1 : any, fecha2 : any, ruta? : string){
    this.infoPdf = []
    this.zeusService.GetFacturacionDetallada(fecha1, fecha2, ruta).subscribe(resp => {
      this.infoPdf = resp;
      this.infoPdf.sort((a, b) => Number(parseInt(a.idVendedor)) - Number(parseInt(b.idVendedor)));
    });
  }

  //Función que cargará las devoluciones detalladas segun los filtros especificados
  cargarDevolucionesDetalladas(fecha1 : any, fecha2 : any, indicadorCPI : any, ruta? : string){
    this.zeusService.GetDevolucionesDetalladas(fecha1, fecha2, indicadorCPI, ruta).subscribe(devoluciones => {
      devoluciones.forEach(dv => {
        let vendedoresDv : any = {
          idVendedor : dv.idvende,
          vendedor : '',
          cliente : dv.descritra,
          fecha : dv.fechatra,
          factura : dv.numefac,
          factura2 : 'DV',
          item : '',
          referencia : '',
          presentacion : '',
          cantidad : 1,
          precio : (-(dv.valortra)),
          valorTotal : (-(dv.valortra)),
        }
        this.infoPdf.push(vendedoresDv); 
      });
      this.colocarNombresVendedores();
      this.infoPdf.sort((a, b) => Number(parseInt(a.idVendedor)) - Number(parseInt(b.idVendedor)));
    }); 
  }

  //Función que colocará el nombre de los vendedores de los registros que vienen de las devoluciones en vacío.
  colocarNombresVendedores(){
    this.infoPdf.forEach(inf => {
      this.vendedores.forEach(ven => {
        if(inf.idVendedor == ven.usua_Id && inf.vendedor == '') inf.vendedor = ven.usua_Nombre;
      });
    });
  }

  //Tabla de encabezado de los items de cada factura
  headerItems(){
    let data : any = [];
    data.push([
      {
        margin: [5, 0],
        fontSize: 8,
        bold: true,
        table: {
          widths: ['12%', '8%', '8%', '39%', '5%', '8%', '10%', '10%'],
          body: [
            [
              { text: `Fecha`, alignment: 'left',  fillColor: '#ccc', border: [false, false, false, false] },
              { text: `Factura`, alignment: 'left',  fillColor: '#ccc', border: [false, false, false, false] },
              { text: `Item`, alignment: 'left',  fillColor: '#ccc', border: [false, false, false, false] },
              { text: `Referencia`, alignment: 'left',  fillColor: '#ccc', border: [false, false, false, false] },
              { text: `Und`, alignment: 'left',  fillColor: '#ccc', border: [false, false, false, false] },
              { text: `Cant.`, alignment: 'left',  fillColor: '#ccc', border: [false, false, false, false] },
              { text: `Precio`, alignment: 'left',  fillColor: '#ccc', border: [false, false, false, false] },
              { text: `Subtotal`, alignment: 'left',  fillColor: '#ccc', border: [false, false, false, false] },
            ]
          ]
        }
      }
    ]);
    return data;
  }

  //Funcion que retornará el contenido del PDF detallado por vendedor
  getFormatoPdfDetallado(){
    this.onReject();
    this.cargando = true;
    let vendedores : any = [];
    let titulo = `Facturación Detallada x Dia`;
    this.infoPdf.forEach(inf => { 
      if(vendedores.map(v => v.id).indexOf(inf.idVendedor) == -1) {
        vendedores.push({ id : inf.idVendedor, nombre : inf.vendedor, clientes : [] });
      }
    });
    setTimeout(() => { 
      this.pdfService.formatoPDF(titulo, this.tablaVendedores(vendedores), {}); 
      this.cargando = false;
    }, 1000); 
  }

  //.Función que llenará la tabla con los vendedores, y los valores totales de ventas y devoluciones
  tablaVendedores(vendedores : any) {
    let data : any = [];
    for (let index = 0; index < vendedores.length; index++) {
      data.push([{
        margin: [5, 10],
          fontSize: 10,
          bold: true,
          table: {
            widths: ['100%'],
            body: this.llenarTablaVendedores(vendedores[index])
          }
      }]);
      data.push(
        [{ margin: [10, 0, 10, 3], border: [false, true, false, false], alignment: 'right', fontSize: 9, bold: true, text: `Total Vendedor: $ ${this.formatonumeros((this.subTotalVendedor(vendedores[index].id)))}`, }], 
        [{ margin: [10, 0, 10, 5], border: [false, true, false, false], alignment: 'right', color : 'red', fontSize: 9, bold: true, text: `Total DV: $ ${this.formatonumeros((this.subTotalDevolucionesVendedor(vendedores[index].id)))}`, },]
      );
    }
    if(vendedores.length > 1){
     data.push(
      [{ margin: [10, 20, 10, 5], border: [true, true, true, false], alignment: 'center', fontSize: 12, bold: true, text: `Total Ventas: $ ${this.formatonumeros((this.totalFacturacion() - this.totalDevolucion()))}`, }],
     );
    }
    return data;
  }

  //.Función que cargará el id y nombre en la tabla de vendedores
  llenarTablaVendedores(vendedores : any) {
    let array : any[] = [];
    array.push(
      [{ text: `${vendedores.id} - ${vendedores.nombre}`, alignment: 'center',  fillColor: '#ccc', border: [true, true, true, true] }, ], 
    )
    array.push([this.getClientesVendedor(vendedores)]);
    return array;
  }
  
  //.Función que retornará los clientes y las facturas por vendedor en el rango de fechas especificado. 
  getClientesVendedor(vendedores : any){
    let data : any = [];
    let clientes : any[] = this.infoPdf.filter(x => x.idVendedor == vendedores.id);  
    clientes.sort((a, b) => a.cliente > b.cliente ? 1 : a.cliente < b.cliente ? -1 : 0);
    let clientesVendedor : any[] = [];
    for (let index = 0; index < clientes.length; index++) {
      if(!clientesVendedor.includes(clientes[index].factura)){
        clientesVendedor.push(clientes[index].factura);
        data.push(this.tablaClientesVendedor(clientes[index]));
      }
    }
    return data;
  }

  //.Función que llenará en la tabla los clientes y facturas de cada vendedor.
  tablaClientesVendedor(clientes : any) {
    let data : any[] = [];
    data.push({
      margin: [0, 5, 0, 5],
        fontSize: 9,
        bold: true,
        colSpan : 2,
        table: {
          dontBreakRows : true,
          widths: ['100%'],
          body: [
            [{ text: `FV${clientes.factura} - ${clientes.cliente}`, alignment: 'left', border: [true, true, true, true] }],
          ], 
        }  
    });
    data.push(this.getItemsClientesVendedor(clientes))
    return data;
  }

  //Función que cargará items que compró cada cliente y las facturas asociadas.
  getItemsClientesVendedor(clientes : any){
    let data : any = [];
    let items : any[] = this.infoPdf.filter(x => x.idVendedor == clientes.idVendedor && x.cliente == clientes.cliente && x.factura == clientes.factura);
    data.push(this.headerItems());
    for (let index = 0; index < items.length; index++) {
      data.push(this.tablaItemsClientesVendedor(items[index]));
    }
    return data;
  }

  //.Función que colocará la información de los items de cada factura en la tabla.
  tablaItemsClientesVendedor(items : any){  
    return {
     margin: [0, 0],
       fontSize: 8,
       bold: false,
       table: {
         widths: ['12%', '8%', '8%', '39%', '5%', '8%', '10%', '10%'],
         body: [
           [
             { text: `${items.fecha}`, alignment: 'left', border: [false, false, false, false], color: items.factura2 == `DV` ? `red` : `black`}, 
             { text: `${items.factura2}`, alignment: items.factura2 == `DV` ? `center` : `left`, border: [false, false, false, false], color: items.factura2 == `DV` ? `red` : `black`}, 
             { text: `${items.item}`, alignment: 'left', border: [false, false, false, false] }, 
             { text: `${items.referencia}`, alignment: 'left', border: [false, false, false, false] }, 
             { text: `${items.presentacion}`, alignment: 'left', border: [false, false, false, false] }, 
             { text: `${this.formatonumeros(items.cantidad)}`, alignment: 'left', border: [false, false, false, false], color: items.factura2 == `DV` ? `red` : `black` }, 
             { text: `${this.formatonumeros(items.precio)}`, alignment: 'left', border: [false, false, false, false], color: items.factura2 == `DV` ? `red` : `black` }, 
             { text: `${this.formatonumeros(items.valorTotal)}`, alignment: 'left', border: [false, false, false, false], color: items.factura2 == `DV` ? `red` : `black`},
           ],
         ],
       }  
    } 
  }

  //Total de facturación en el rango de fechas especificado
  totalFacturacion(){
    let total : number = 0;
    total = this.infoPdf.filter(x => x.factura2 != 'DV').reduce((a,b) => a + b.valorTotal, 0);
    return total;
  }

  //Total de devoluciones en el rango de fechas especificado
  totalDevolucion(){
    let total : number = 0;
    total = this.infoPdf.filter(x => x.factura2 == 'DV').reduce((a,b) => a + b.valorTotal, 0);
    return Math.abs(total);
  }

  //Total de facturación por vendedor
  subTotalVendedor(vendedor : any){
    let subtotal : number = 0;
    subtotal = this.infoPdf.filter(x => x.idVendedor == vendedor && x.valorTotal > 0).reduce((a,b) => a + b.valorTotal, 0);
    return subtotal;
  }

  //Total de devoluciones por vendedor
  subTotalDevolucionesVendedor(vendedor : any){
    let subtotal : number = 0;
    subtotal = this.infoPdf.filter(x => x.idVendedor == vendedor && x.valorTotal < 0).reduce((a,b) => a + b.valorTotal, 0);
    return subtotal;
  }

  //.Función que en que formato se desea exportar la información, si detallado o consolidado. 
  mostrarEleccion(){
    if (this.dataFacturacion.length > 0) {
      this.msg.add({severity:'warn', key: 'eleccion', summary: `Elección`, detail: `En qué tipo de formato desea exportar la información?`, sticky: true});
    } else this.msj.mensajeAdvertencia(`Advertencia`, `No hay registros para exportar!`);
  }

  //.Función que quitará el mensaje de elección de formatos.
  onReject = () => this.msg.clear('eleccion');
  
  //Función que filtrará en la tabla de facturas cuando esta contenga información
  aplicarfiltroFacturacion = ($event, campo : any, valorCampo : string) => this.dtFacturacion!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

  //Función que filtrará en la tabla de devoluciones cuando esta contenga información
  aplicarfiltroDevolucion = ($event, campo : any, valorCampo : string) => this.dtDevolucion!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

  //Función que filtrará la información del array de facturas detalladas y cargará los items de la factura seleccionada. 
  filtrarFactura(facturas : any){
    this.nroFactura = facturas.factura;
    this.modal = true;
    this.facturasModal = [];
    this.facturasModal = this.infoPdf.filter(x => x.factura == facturas.factura);
  }

  //Función que cargará el total de facturas seleccionadas
  totalFacturasModal = () => this.facturasModal.reduce((a, b) => a + b.valorTotal, 0); 
}
