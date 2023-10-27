import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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

}
