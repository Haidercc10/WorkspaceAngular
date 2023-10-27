import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import pdfMake from 'pdfmake/build/pdfmake';
import { ClientesService } from 'src/app/Servicios/Clientes/clientes.service';
import { CreacionPdfService } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';
import { InventarioZeusService } from 'src/app/Servicios/InventarioZeus/inventario-zeus.service';
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
                          private pdfService : CreacionPdfService,) {
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
  }

  formatoPDF(){
    this.cargando = true;
    this.dataPDF = this.dataFacturacion;
    let contentPDf : any [] = [];
    let titulo = 'Informe de Ventas';
    this.pdfService.formatoPDF(titulo, contentPDf);
    this.cargando = false;
  }

  pdfFacturaConsolidad(){
    let data : any;

    return data;
  }

  pdfFacturaDetallada(){
    
  }

}
