import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { info } from 'console';
import moment from 'moment';
import pdfMake from 'pdfmake/build/pdfmake';
import { ClientesService } from 'src/app/Servicios/Clientes/clientes.service';
import { CreacionPdfService } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';
import { InventarioZeusService } from 'src/app/Servicios/InventarioZeus/inventario-zeus.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { ProductoService } from 'src/app/Servicios/Productos/producto.service';
import { UsuarioService } from 'src/app/Servicios/Usuarios/usuario.service';
import { AppComponent } from 'src/app/app.component';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';

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

  constructor(private AppComponent : AppComponent,
                private frmBuilder : FormBuilder,
                  private zeusService : InventarioZeusService,
                    private clientesService : ClientesService,
                      private productosService : ProductoService,
                        private vendedorService : UsuarioService,
                          private pdfService : CreacionPdfService,
                            private msj : MensajesAplicacionService) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;

    this.formFiltros = this.frmBuilder.group({
      rangoFechas : [null],
      cliente : [null],
      vendedor : [null],
      producto : [null]
    });
  }

  ngOnInit() {
    this.obtenerVendedores();
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g,'$1,');

  obtenerVendedores(){
    this.vendedorService.GetVendedores().subscribe(resp => this.vendedores = resp);
  }

  obtenerClientes(){
    let nombre : string = this.formFiltros.value.cliente;
    this.clientesService.LikeGetCliente(nombre).subscribe(resp => this.clientes = resp);
  }

  obtenerProductos(){
    let nombre : string = this.formFiltros.value.producto;
    this.productosService.obtenerItemsLike(nombre).subscribe(resp => this.productos = resp);
  }

  buscarFacturacion(){
    if (this.formFiltros.value.rangoFechas) {
      this.cargando = true;
      let fechaInicial : any = moment(this.formFiltros.value.rangoFechas[0]).format('YYYY-MM-DD');
      let fechaFinal : any = moment(this.formFiltros.value.rangoFechas[1]).format('YYYY-MM-DD');
      let cliente : any = this.formFiltros.value.cliente;
      let vendedor : any = this.formFiltros.value.vendedor;
      let producto : any = this.formFiltros.value.producto;
      let ruta : string = ``;

      if (cliente != null) ruta += `cliente=${cliente}`;
      if (vendedor != null) ruta.length > 0 ? ruta += `&vendedor=${vendedor}` : ruta += `vendedor=${vendedor}`;
      if (producto != null) ruta.length > 0 ? ruta += `&item=${producto}` : ruta += `item=${producto}`;
      if (ruta.length > 0) ruta = `?${ruta}`;

      this.zeusService.GetFacturacionConsolidada(fechaInicial, fechaFinal, ruta).subscribe(res => this.llenarDatosFacturas(res));
      this.zeusService.GetDevolucionesDetalladas(fechaInicial, fechaFinal, ruta).subscribe(res => this.llenarDatosDevoluciones(res));
      this.cargarFacturacionDetallada(fechaInicial, fechaFinal, ruta);
      this.cargando = false;
    } else this.msj.mensajeAdvertencia(`¡Debes seleccionar el rango de fechas a buscar!`);
  }

  llenarDatosFacturas(facturas : any []){
    facturas.forEach(fac => {
      this.dataFacturacion.push(fac);
      this.dataFacturacion.sort((a,b) => a.factura.localeCompare(b.factura));
    });
  }

  llenarDatosDevoluciones(devoluciones : any []){
    devoluciones.forEach(dev => {
      this.dataFacturacion.push({
        fecha: dev.fechatra,
        factura: dev.numefac,
        cliente: dev.descritra,
        recibo: `DEVOLUCIÓN`,
        suma: (-(dev.valortra))
      });
      this.dataFacturacion.sort((a,b) => a.recibo.localeCompare(b.recibo));
    });
  }
  
  formatoPDF(){
    this.cargando = true;
    this.dataPDF = this.dataFacturacion;
    console.log(this.dataPDF);
    let headerAdicional : any [] = this.headerAdicional();
    let contentPDf : any [] = this.pdfFacturaConsolidad(this.dataPDF);
    let titulo = 'Informe de Ventas';
    this.pdfService.formatoPDF(titulo, contentPDf, headerAdicional);
    this.cargando = false;
  }

  headerAdicional(){
    let data : any = [];
    data.push([
      {
        margin: [25, 0],
        fontSize: 10,
        bold: true,
        table: {
          widths: ['10%', '15%', '35%', '20%', '20%'],
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

  pdfFacturaConsolidad(datos : any []){
    let data : any = [];
    data.push([
      {
        margin: 5,
        fontSize: 8,
        border: [true, false, true, false],
        table: {
          widths : ['10%', '15%', '35%', '20%', '20%'],
          body: this.facturas(datos)
        }
      },
    ]);
    return data;
  }

  facturas(datos : any []){
    let data : any = [];
    for (let i = 0; i < datos.length; i++) {
      data.push([
        { text: moment(datos[i].fecha).format('YYYY-MM-DD'), margin: 5, border: [false, false, false, false], alignment: 'center', },
        { text: datos[i].factura, margin: 5, border: [false, false, false, false], alignment: 'center', },
        { text: datos[i].cliente, margin: 5, border: [false, false, false, false], alignment: 'left', },
        { text: `$ ${this.formatonumeros(datos[i].suma)}`, margin: 5, border: [false, false, false, false], alignment: 'right', },
        { text: datos[i].recibo, margin: 5, border: [false, false, false, false], alignment: 'center', },
      ]);
    }
    data.push([
      { colSpan: 4, border: [false, true, false, false], alignment: 'right', fontSize: 11, bold: true, text: `$ ${this.formatonumeros((this.subTotalFacturacion()))}`, },
      {},
      {},
      {},
      { border: [false, true, false, false], text: `` },
    ]);
    return data;
  }

  subTotalFacturacion() : number {
    let total : number = 0;
    total = this.dataPDF.reduce((a,b) => a + b.suma, 0);
    return total;
  }

  subTotalIva() : number {
    let total : number = 0;
    total = this.dataPDF.reduce((a,b) => a + b.iva, 0);
    return total;
  }

  cargarFacturacionDetallada(fecha1 : any, fecha2 : any, ruta? : string){
    this.zeusService.GetFacturacionDetallada(fecha1, fecha2, ruta).subscribe(resp => {
      this.infoPdf = resp;
      this.zeusService.GetDevolucionesDetalladas(fecha1, fecha2, ruta).subscribe(devoluciones => {
        devoluciones.forEach(dv => {
          this.infoPdf.push({
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
          })
        })
      }); 
      this.infoPdf.sort((a, b) => Number(parseInt(a.idVendedor)) - Number(parseInt(b.idVendedor)));
    });
  }

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

  getVendedores(informacion : any[]){
    let vendedores : any = [];
    let titulo = `Facturación Detallada x Dia`;
    informacion.forEach(inf => { 
      if(vendedores.map(v => v.id).indexOf(inf.idVendedor) == -1) {
        vendedores.push({ id : inf.idVendedor, nombre : inf.vendedor, clientes : [] });
      }
    });
    this.vendedores = vendedores;
    this.pdfService.formatoPDF(titulo, this.tablaVendedores(vendedores), {});
  }

  tablaVendedores(vendedores : any) {
    let data : any = [];
    for (let index = 0; index < vendedores.length; index++) {
      data.push([{
        margin: [10, 10],
          fontSize: 10,
          bold: true,
          table: {
            dontBreakRows : true,
            widths: ['100%'],
            body: this.llenarTabla(vendedores[index])
          }
      }]);
      data.push([
        { margin: [10, 0, 10, 3], border: [false, true, false, false], alignment: 'right', fontSize: 9, bold: true, text: `Total Vendedor: $ ${this.formatonumeros((this.subTotalVendedor(vendedores[index].id)))}`, },
      ], 
      [
        { margin: [10, 0, 10, 5], border: [false, true, false, false], alignment: 'right', color : 'red', fontSize: 9, bold: true, text: `Total Devoluciones: $ ${this.formatonumeros((this.subTotalDevolucionesVendedor(vendedores[index].id)))}`, },
      ]);
    }
    return data;
  }

  llenarTabla(vendedores : any) {
    let array : any[] = [];
    array.push(
        [
          { text: `${vendedores.id} - ${vendedores.nombre}`, alignment: 'center',  fillColor: '#ccc', border: [true, true, true, true] }, 
        ], 
    )
    array.push([this.getClientesVendedor(vendedores)]);
    return array;
  }
  
  getClientesVendedor(vendedores : any){
    let data : any = [];
    let clientes : any[] = this.infoPdf.filter(x => x.idVendedor == vendedores.id);  
    let clientesVendedor : any[] = [];
    for (let index = 0; index < clientes.length; index++) {
      if(!clientesVendedor.includes(clientes[index].cliente)){
        clientesVendedor.push(clientes[index].cliente);
        data.push(this.tablaClientesVendedor(clientes[index]));
      }
    }
    return data;
  }

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
            [
              { text: `FV${clientes.factura} - ${clientes.cliente}`, alignment: 'left', border: [true, true, true, true] }, 
            ],
          ], 
        }  
    });
    data.push(this.getItemsClientesVendedor(clientes))
    return data;
  }

  getItemsClientesVendedor(clientes : any){
    let data : any = [];
    let items : any[] = this.infoPdf.filter(x => x.idVendedor == clientes.idVendedor && x.cliente == clientes.cliente);
    data.push(this.headerItems());
    for (let index = 0; index < items.length; index++) {
      data.push(this.tablaItemsClientesVendedor(items[index]));
    }
    return data;
  }

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

  total(){
    let total : number = 0;
    total = this.infoPdf.reduce((a,b) => a + b.valorTotal, 0);
    console.log(total);
  }

  subTotalVendedor(vendedor : any){
    let subtotal : number = 0;
    subtotal = this.infoPdf.filter(x => x.idVendedor == vendedor && x.valorTotal > 0).reduce((a,b) => a + b.valorTotal, 0);
    return subtotal;
  }

  subTotalDevolucionesVendedor(vendedor : any){
    let subtotal : number = 0;
    subtotal = this.infoPdf.filter(x => x.idVendedor == vendedor && x.valorTotal < 0).reduce((a,b) => a + b.valorTotal, 0);
    return subtotal;
  }
  
}
