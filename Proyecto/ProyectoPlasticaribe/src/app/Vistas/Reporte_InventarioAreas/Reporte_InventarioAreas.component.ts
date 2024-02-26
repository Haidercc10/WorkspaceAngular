import { Component, OnInit, ViewChild } from '@angular/core';
import moment from 'moment';
import { Table } from 'primeng/table';
import { AppComponent } from 'src/app/app.component';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';
import { Inventario_AreasService } from 'src/app/Servicios/Inventario_Areas/Inventario_Areas.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import { InventInicialDiaService } from 'src/app/Servicios/InvenatiorInicialMateriaPrima/inventInicialDia.service';
import { Inventario_Mes_ProductosService } from 'src/app/Servicios/Inventario_Mes_Productos/Inventario_Mes_Productos.service';
import { EntradaBOPPService } from 'src/app/Servicios/BOPP/entrada-BOPP.service';
import { MateriaPrimaService } from 'src/app/Servicios/MateriaPrima/materiaPrima.service';
import { TintasService } from 'src/app/Servicios/Tintas/tintas.service';
import { ModalGenerarInventarioZeusComponent } from '../modal-generar-inventario-zeus/modal-generar-inventario-zeus.component';

@Component({
  selector: 'app-Reporte_InventarioAreas',
  templateUrl: './Reporte_InventarioAreas.component.html',
  styleUrls: ['./Reporte_InventarioAreas.component.css']
})
export class Reporte_InventarioAreasComponent implements OnInit {
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
 
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  hora : any = moment().format('H:mm:ss'); //Variable que se usará para llenar la hora actual 
  load : boolean = false;
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  rangoFechas : any = []; //Variable que guardará el rango de fechas seleccionado por el usuario
  invMatPrimas : any = []; //Variable que guardará el inventario de las areas.
  invReciclados : any = []; //Variable que guardará el inventario de las areas
  invExtrusion : any = []; //Variable que guardará el inventario de las extrusiones
  invRotograbado : any = []; //Variable que guardará el inventario de las rotograbado
  invSellado : any = []; //Variable que guardará el inventario de las sellado
  invImpresion : any = []; //Variable que guardará el inventario de las impresion
  invMateriales : any = []; //Variable que guardará el inventario de los materiales
  invProductosTerminados : any = []; //Variable que guardará el inventario de los productos terminados
  invPT : any = []; //Variable que guardará el inventario de los productos terminados
  invBopp : any = []; //Variable que guardará el inventario de bopps
  categoriasMatPrima : any = []; //Variable que guardará las categorias de las materias primas
  categoriasTinta : any = []; //Variable que guardará las categorias de las tintas
  categoriasBopp : any = []; //Variable que guardará las categorias de los bopp
  loading : boolean = false;
  invImpresionMP : any = []; //Variable que guardará el inventario de las materias primas de impresion
  invRotograbadoMP : any = []; //Variable que guardará el inventario de las materias primas de rotograbado 
  
  @ViewChild('dtExt') dtExt: Table | undefined; //Tabla que representa el inventario de extrusión
  @ViewChild('dtMat') dtMat: Table | undefined; //Tabla que representa el inventario de materiales en proceso
  @ViewChild('dtImp') dtImp: Table | undefined; //Tabla que representa el inventario de impresion
  @ViewChild('dtRot') dtRot: Table | undefined; //Tabla que representa el inventario de rotograbado
  @ViewChild('dtSella') dtSella: Table | undefined; //Tabla que representa el inventario de sellado
  @ViewChild('dtMatPrima') dtMatPrima: Table | undefined; //Tabla que representa el inventario de materias primas
  @ViewChild('dtReciclados') dtReciclados: Table | undefined; //Tabla que representa el inventario de reciclados
  @ViewChild('dtPT') dtPT: Table | undefined; //Tabla que representa el inventario de productos terminados
  @ViewChild('dtBopp') dtBopp: Table | undefined; //Tabla que representa el inventario de bopps
  @ViewChild('dtImpMP') dtImpMP: Table | undefined; //Tabla que representa el inventario de productos terminados
  @ViewChild('dtRotMP') dtRotMP: Table | undefined; //Tabla que representa el inventario de bopps


  constructor(private AppComponent : AppComponent, 
                private svcInvAreas : Inventario_AreasService,
                  private msj : MensajesAplicacionService, 
                    private svcInvInicialMP : InventInicialDiaService,
                      private svcInvMensualProductos : Inventario_Mes_ProductosService, 
                        private svcBopps : EntradaBOPPService, 
                          private svcMatPrimas : MateriaPrimaService, 
                            private svcTintas : TintasService, 
                              private invProductosZeus : ModalGenerarInventarioZeusComponent) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
   }

  ngOnInit() {
    this.lecturaStorage();
    setInterval(() => this.modoSeleccionado = this.AppComponent.temaSeleccionado, 1000);
    this.consultarCategorias();
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  verTutorial(){}

  //Función que consultará el inventario de todas las areas y lo mostrará en la tabla. 
  consultarInventario(){
    this.invExtrusion = [];
    this.invMateriales = [];
    this.invRotograbado = [];
    this.invSellado = [];
    this.invPT = [];
    this.invImpresion = [];
    this.invMatPrimas = [];
    this.invReciclados = [];
    this.invBopp = [];
    this.invImpresionMP = [];
    this.invRotograbadoMP = [];
    let fecha1 : any = this.rangoFechas.length > 0 ? moment(this.rangoFechas[0]).format('YYYY-MM-DD') : null;
    let fecha2 : any = this.rangoFechas[1] != undefined && this.rangoFechas[1] != null ? moment(this.rangoFechas[1]).format('YYYY-MM-DD') : null;
    
    if(fecha1 != null && fecha2 != null) {
      this.svcInvAreas.GetPorFecha(fecha1, fecha2).subscribe(data => {
        if(data.length > 0) {
          this.load = true;
          data.forEach(x => {
            if(x.id_Area == `EXT` && !x.esMaterial && [1, 3, 7, 61, 85].includes(this.ValidarRol)) this.invExtrusion.push(x);
            if(x.id_Area == `EXT` && x.esMaterial && [1, 3, 7, 61, 85].includes(this.ValidarRol)) this.invMateriales.push(x);
            if(x.id_Area == `ROT` && !x.esMaterial && [1, 63, 61, 89].includes(this.ValidarRol)) this.invRotograbado.push(x);
            if(x.id_Area == `ROT` && x.esMaterial && [1, 63, 61, 89].includes(this.ValidarRol)) this.invRotograbadoMP.push(x);
            if(x.id_Area == `SELLA` && !x.esMaterial && [1, 8, 61, 86].includes(this.ValidarRol)) this.invSellado.push(x);
            if(x.id_Area == `IMP` && !x.esMaterial && [1, 4, 61, 62, 75].includes(this.ValidarRol)) this.invImpresion.push(x);
            if(x.id_Area == `IMP` && x.esMaterial && [1, 4, 61, 62, 75].includes(this.ValidarRol)) this.invImpresionMP.push(x);
          });
          if ([1, 3, 7, 61].includes(this.ValidarRol)) this.inventarioMateriasPrimas(fecha2); 
          if(this.ValidarRol == 1) this.inventarioProductosTerminados(fecha2); 
          else setTimeout(() => { this.load = false; }, 800); 
        } else {
          this.load = true;
          if ([1, 3, 7, 61].includes(this.ValidarRol)) this.inventarioMateriasPrimas(fecha2); 
          if(this.ValidarRol == 1) this.inventarioProductosTerminados(fecha2); 
          else setTimeout(() => { this.load = false; }, 800); 
        }
      });
    } else this.msj.mensajeAdvertencia(`¡Advertencia!`, `Debe seleccionar un rango de fechas válido!`);
  }

  //Función que mostrará el inventario de materias primas y reciclados en la tabla dependiendo la fecha final ingresada en el rango. 
  inventarioMateriasPrimas(fechaFin : any) {
    this.svcInvInicialMP.getMatPrimasInicioMes(fechaFin).subscribe(data => {
      if(data.length > 0) {
        this.invMatPrimas = data.filter(mp => (this.categoriasMatPrima.includes(mp.idCategoria) || this.categoriasTinta.includes(mp.idCategoria)) && mp.idCategoria != 10);
        this.invReciclados = data.filter(mp => mp.idCategoria == 10);
        this.invBopp = data.filter(mp => this.categoriasBopp.includes(mp.idCategoria));
      } 
    });
  }

  //Función que mostrará el inventario de productos terminados en la tabla. 
  inventarioProductosTerminados = (fechaFin : any) => this.svcInvMensualProductos.getInventarioProductoInicioMes(fechaFin).subscribe(data => {this.invPT = data; this.load = false; }, error => { this.load = false; } );

  //Función que mostrará el inventario de biorientados en la tabla. 
  generarInventarioActualBopp() {
    this.invBopp = [];
    this.loading = true;
    this.svcBopps.GetInventarioBoppsGenericos().subscribe(data => {
      for (let index = 0; index < data.length; index++) {
        this.cargarTablaBopp(data[index]);
      }
      this.loading = false;
    });
    
  }

  //Función que cargará el inventario de biorientados a la tabla
  cargarTablaBopp(data : any) {
    let bopp : any = {
      fecha_Inventario : this.today, 
      ot : '', 
      item : data.id, 
      referencia : data.nombre, 
      stock : data.stock, 
      precio : data.precio, 
      subtotal : (data.precio * data.stock), 
    }
    this.invBopp.push(bopp);
  }

  //Función que mostrará el inventario de materias primas o reciclados en sus respectivas tablas.
  generarInventarioActualMatPrimas(tipo : string){
    this.loading = true;
    if(tipo == 'MP') this.invMatPrimas = [];
    if(tipo == 'RC') this.invReciclados = [];
    this.svcMatPrimas.GetInventarioMateriasPrimas().subscribe(data => {
      if(tipo == `MP`) this.invMatPrimas = data.filter(mp => (this.categoriasMatPrima.includes(mp.idCategoria) || this.categoriasTinta.includes(mp.idCategoria)) && mp.idCategoria != 10);
      if(tipo == `RC`) this.invReciclados = data.filter(mp => mp.idCategoria == 10); 
      this.loading = false;
    });
  }

  //Función que mostrará el inventario actual de productos terminados .
  generarInventarioActualPTZeus() {
    this.invPT = [];
    this.invProductosZeus.invetarioProductos();
    this.loading = true;
    setTimeout(() => { 
      this.invProductosTerminados = this.invProductosZeus.ArrayProductoZeus; 
      setTimeout(() => {
        this.invProductosTerminados.forEach(x => {
          let info : any = {
            'fecha_Inventario' : this.today,
            'ot' :  '',
            'item' : x.Id,
            'referencia' : x.Nombre,
            'stock' : x.Cantidad,
            'precio' : x.Precio, 
            'subtotal' : x.Cantidad * x.Precio,
          }
          this.invPT.push(info);
        });
        this.loading = false;
      }, 2000);
    }, 5000);
  }

  //Funciones que calcularán el total de cada inventario.
  calcularTotalExtrusion = () => this.invExtrusion.reduce((acum, valor) => (acum + valor.subtotal), 0);

  calcularTotalRotograbado = () => this.invRotograbado.reduce((acum, valor) => (acum + valor.subtotal), 0);

  calcularTotalSellado = () => this.invSellado.reduce((acum, valor) => (acum + valor.subtotal), 0);

  calcularTotalImpresion = () => this.invImpresion.reduce((acum, valor) => (acum + valor.subtotal), 0);

  calcularTotalMateriales = () => this.invMateriales.reduce((acum, valor) => (acum + valor.subtotal), 0);

  calcularTotalMatPrimas = () => this.invMatPrimas.reduce((acum, valor) => (acum + valor.subtotal), 0);

  calcularTotalReciclados = () => this.invReciclados.reduce((acum, valor) => (acum + valor.subtotal), 0);

  calcularTotalPT = () => this.invPT.reduce((acum, valor) => (acum + valor.subtotal), 0);

  calcularTotalBopp = () => this.invBopp.reduce((acum, valor) => (acum + valor.subtotal), 0);

  calcularTotalRotograbadoMP = () => this.invRotograbadoMP.reduce((acum, valor) => (acum + valor.subtotal), 0);

  calcularTotalImpresionMP = () => this.invImpresionMP.reduce((acum, valor) => (acum + valor.subtotal), 0);

  //Funciones que permitiran realizar filtros en la tabla.
  aplicarfiltroExt = ($event, campo : any, valorCampo : string) => this.dtExt!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

  aplicarfiltroMat = ($event, campo : any, valorCampo : string) => this.dtMat!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

  aplicarfiltroImp = ($event, campo : any, valorCampo : string) => this.dtImp!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);
  
  aplicarfiltroRot = ($event, campo : any, valorCampo : string) => this.dtRot!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

  aplicarfiltroSella = ($event, campo : any, valorCampo : string) => this.dtSella!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

  aplicarfiltroMatPrima = ($event, campo : any, valorCampo : string) => this.dtMatPrima!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

  aplicarfiltroReciclado = ($event, campo : any, valorCampo : string) => this.dtReciclados!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

  aplicarfiltroPT = ($event, campo : any, valorCampo : string) => this.dtPT!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

  aplicarfiltroBopp = ($event, campo : any, valorCampo : string) => this.dtBopp!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

  aplicarfiltroRotMP = ($event, campo : any, valorCampo : string) => this.dtRotMP!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

  aplicarfiltroImpMP = ($event, campo : any, valorCampo : string) => this.dtImpMP!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);
  

  // Funcion que va a crear un excel con la información de los inventarios de cada area
  exportarExcel(){
    let inventario : any = [...this.invExtrusion, ...this.invMateriales, ...this.invMatPrimas, ...this.invPT, ...this.invImpresion, ...this.invRotograbado, ...this.invSellado, ...this.invReciclados, ...this.invImpresionMP, this.invRotograbadoMP];
    if(inventario.length > 0) {
      this.load = true;
      let tituloTotal : string = `INVENTARIO TOTAL`;
      let tituloExtrusion : string = `INVENTARIO EXTRUSIÓN`;
      let tituloRotograbado : string = `INVENTARIO ROTOGRABADO`;
      let tituloRotograbadoMP : string = `INVENTARIO MATERIALES ROTOGRABADO`;
      let tituloSellado : string = `INVENTARIO SELLADO`;
      let tituloImpresion : string = `INVENTARIO IMPRESIÓN`;
      let tituloImpresionMP : string = `INVENTARIO MATERIALES IMPRESIÓN`;
      let tituloMateriales : string = `MATERIALES EN EXTRUSIÓN`;
      let tituloMatPrimas : string = `INVENTARIO DE MATERIA PRIMA`;
      let tituloReciclados : string = `INVENTARIO DE RECICLADOS`;
      let tituloPT : string = `INVENTARIO DE PRODUCTOS TERMINADOS`;
      let tituloBopps : string = `INVENTARIO DE BIORIENTADOS`;
      let unirCeldasHoja : string [] = [];
      let header : string [] = [];

      let workbook = new Workbook();
      const image = workbook.addImage({ base64:  logoParaPdf, extension: 'png', });

      // HOJA 1, INVENTARIO TOTAL
      if([1, 61].includes(this.ValidarRol)) {
        let worksheetTotal = workbook.addWorksheet(`Inventario Total`);
        this.formatoTitulos(worksheetTotal, tituloTotal);
        header = ['Área', 'Total'];
        let headerRowTotales = worksheetTotal.addRow(header);
        this.formatoEncabezado(headerRowTotales);
        this.calcularInvTotal().forEach(d => {
          let row = worksheetTotal.addRow(d);
          let celdas = [1, 2];
          celdas.forEach(cell => {
            row.getCell(cell).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'EAFAF1' } };
            row.getCell(cell).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };
            if (row.getCell(1).value == 'TOTAL') row.getCell(cell).font = { name: 'Calibri', family: 4, size: 11, bold: true };
            worksheetTotal.getColumn(cell).numFmt = '""#,##0.00;[Black]\-""#,##0.00';
            worksheetTotal.getColumn(cell).width = 30;
          });
        });
        unirCeldasHoja = ['A1:B3'];
        unirCeldasHoja.forEach(cell => worksheetTotal.mergeCells(cell));
      }

      //HOJA 2, INVENTARIO EXTRUSIÓN
      if([1, 3, 7, 61].includes(this.ValidarRol)) {
        let worksheetExtrusion = workbook.addWorksheet(`Inventario Extrusión`);
        this.formatoTitulos(worksheetExtrusion, tituloExtrusion, image);
        header = ['Fecha', 'OT', 'Item', 'Referencia', 'Kg', 'Precio', 'SubTotal'];
        let headerRowExtrusion = worksheetExtrusion.addRow(header);
        this.formatoEncabezado(headerRowExtrusion);
        this.formatoCuerpo(this.calcularInvExtrusion(), worksheetExtrusion);
        if(this.ValidarRol != 1) {
          worksheetExtrusion.spliceColumns(6,2);
          worksheetExtrusion.addRow([]);
          worksheetExtrusion.getCell('A1').value = tituloExtrusion;
        } 
      }

      // HOJA 3, INVENTARIO ROTOGRABADO
      if([1, 63, 61].includes(this.ValidarRol)) {
        let worksheetRotograbado = workbook.addWorksheet(`Inventario Rotograbado`);
        this.formatoTitulos(worksheetRotograbado, tituloRotograbado, image);
        header = ['Fecha', 'OT', 'Item', 'Referencia', 'Kg', 'Precio', 'SubTotal'];
        let headerRowRotograbado = worksheetRotograbado.addRow(header);
        this.formatoEncabezado(headerRowRotograbado);
        this.formatoCuerpo(this.calcularInvRotograbado(), worksheetRotograbado);
        if(this.ValidarRol != 1) {
          worksheetRotograbado.spliceColumns(6,2);
          worksheetRotograbado.addRow([]);
          worksheetRotograbado.getCell('A1').value = tituloRotograbado;
        } 
      }

      // HOJA 4, INVENTARIO SELLADO
      if([1, 8, 61].includes(this.ValidarRol)) {
        let worksheetSellado = workbook.addWorksheet(`Inventario Sellado`);
        this.formatoTitulos(worksheetSellado, tituloSellado, image);
        header = ['Fecha', 'OT', 'Item', 'Referencia', 'Kg', 'Precio', 'SubTotal'];
        let headerRowSellado = worksheetSellado.addRow(header);
        this.formatoEncabezado(headerRowSellado);
        this.formatoCuerpo(this.calcularInvSellado(), worksheetSellado);
        if(this.ValidarRol != 1) {
          worksheetSellado.spliceColumns(6,2);
          worksheetSellado.addRow([]);
          worksheetSellado.getCell('A1').value = tituloSellado;
        } 
      }

      // HOJA 5, INVENTARIO IMPRESION
      if([1, 62, 61, 4].includes(this.ValidarRol)) {
        let worksheetImpresion = workbook.addWorksheet(`Inventario Impresión`);
        this.formatoTitulos(worksheetImpresion, tituloImpresion, image);
        header = ['Fecha', 'OT', 'Item', 'Referencia', 'Kg', 'Precio', 'SubTotal'];
        let headerRowImpresion = worksheetImpresion.addRow(header);
        this.formatoEncabezado(headerRowImpresion);
        this.formatoCuerpo(this.calcularInvImpresion(), worksheetImpresion);
        if(this.ValidarRol != 1) {
          worksheetImpresion.spliceColumns(6,2);
          worksheetImpresion.addRow([]);
          worksheetImpresion.getCell('A1').value = tituloImpresion;
        } 
      }

      // HOJA 6, INVENTARIO MATERIA PRIMA
      if([1, 3, 7, 61].includes(this.ValidarRol)) {
        let worksheetMateriaPrima = workbook.addWorksheet(`Inventario Materia Prima`);
        this.formatoTitulos(worksheetMateriaPrima, tituloMatPrimas, image);
        header = ['Fecha', 'OT', 'Item', 'Referencia', 'Kg', 'Precio', 'SubTotal'];
        let headerRowMatPrimas = worksheetMateriaPrima.addRow(header);
        this.formatoEncabezado(headerRowMatPrimas);
        this.formatoCuerpo(this.calcularInvMateriasPrimas(), worksheetMateriaPrima);
        if(this.ValidarRol != 1) {
          worksheetMateriaPrima.spliceColumns(6,2);
          worksheetMateriaPrima.addRow([]);
          worksheetMateriaPrima.getCell('A1').value = tituloMatPrimas;
        } 
      }
      
      // HOJA 7, INVENTARIO RECICLADOS O RECUPERADOS
      if([1, 3, 7, 61].includes(this.ValidarRol)) {
        let worksheetRecuperado = workbook.addWorksheet(`Inventario Recuperado`);
        this.formatoTitulos(worksheetRecuperado, tituloReciclados, image);
        header = ['Fecha', 'OT', 'Item', 'Referencia', 'Kg', 'Precio', 'SubTotal'];
        let headerRowRecuperado = worksheetRecuperado.addRow(header);
        this.formatoEncabezado(headerRowRecuperado);
        this.formatoCuerpo(this.calcularInvRecuperado(), worksheetRecuperado);
        if(this.ValidarRol != 1) {
          worksheetRecuperado.spliceColumns(6,2);
          worksheetRecuperado.addRow([]);
          worksheetRecuperado.getCell('A1').value = tituloReciclados;
        } 
      }

      // HOJA 8, MATERIALES EN EXTRUSION
      if([1, 3, 7, 61].includes(this.ValidarRol)) {
        let worksheetMpExtrusion = workbook.addWorksheet(`Materiales en Extrusión`);
        this.formatoTitulos(worksheetMpExtrusion, tituloMateriales, image);
        header = ['Fecha', 'OT', 'Item', 'Referencia', 'Kg', 'Precio', 'SubTotal'];
        let headerRowMpExtrusion = worksheetMpExtrusion.addRow(header);
        this.formatoEncabezado(headerRowMpExtrusion);
        this.formatoCuerpo(this.calcularMaterialesExtrusion(), worksheetMpExtrusion);
        if(this.ValidarRol != 1) {
          worksheetMpExtrusion.spliceColumns(6,2);
          worksheetMpExtrusion.addRow([]);
          worksheetMpExtrusion.getCell('A1').value = tituloMateriales;
        } 
      }    
      
      // HOJA 9, INVENTARIO DE DESPACHO
      if([1, 61].includes(this.ValidarRol)) {
        let worksheetDespacho = workbook.addWorksheet(`Inventario de Despacho`);
        this.formatoTitulos(worksheetDespacho, tituloPT, image);
        header = ['Fecha', 'OT', 'Item', 'Referencia', 'Kg', 'Precio', 'SubTotal'];
        let headerRowDespacho = worksheetDespacho.addRow(header);
        this.formatoEncabezado(headerRowDespacho);
        this.formatoCuerpo(this.calcularInvDespacho(), worksheetDespacho);
        if(this.ValidarRol != 1) {
          worksheetDespacho.spliceColumns(6,2);
          worksheetDespacho.addRow([]);
          worksheetDespacho.getCell('A1').value = tituloPT;
        } 
      }

      // HOJA 10, INVENTARIO BIORIENTADOS
      if([1, 3, 7, 61, 4].includes(this.ValidarRol)) {
        let worksheetBopp = workbook.addWorksheet(`Inventario Biorientados`);
        this.formatoTitulos(worksheetBopp, tituloBopps, image);
        header = ['Fecha', 'OT', 'Item', 'Referencia', 'Kg', 'Precio', 'SubTotal'];
        let headerRowBopp = worksheetBopp.addRow(header);
        this.formatoEncabezado(headerRowBopp);
        this.formatoCuerpo(this.calcularInvBopps(), worksheetBopp);
        if(this.ValidarRol != 1) {
          worksheetBopp.spliceColumns(6,2);
          worksheetBopp.addRow([]);
          worksheetBopp.getCell('A1').value = tituloBopps;
        } 
      }

      // HOJA 11, INVENTARIO MATERIALES IMPRESION
      if([1, 62, 61, 4].includes(this.ValidarRol)) {
        let worksheetImpresionMP = workbook.addWorksheet(`Inventario Materiales Impresión`);
        this.formatoTitulos(worksheetImpresionMP, tituloImpresionMP, image);
        header = ['Fecha', 'OT', 'Item', 'Referencia', 'Kg', 'Precio', 'SubTotal'];
        let headerRowImpresion = worksheetImpresionMP.addRow(header);
        this.formatoEncabezado(headerRowImpresion);
        this.formatoCuerpo(this.calcularInvImpresionMP(), worksheetImpresionMP);
        if(this.ValidarRol != 1) {
          worksheetImpresionMP.spliceColumns(6,2);
          worksheetImpresionMP.addRow([]);
          worksheetImpresionMP.getCell('A1').value = tituloImpresionMP;
        } 
      }

      // HOJA 12, INVENTARIO MATERIALES ROTOGRABADO
      if([1, 63, 61].includes(this.ValidarRol)) {
        let worksheetRotograbadoMP = workbook.addWorksheet(`Inventario Materiales Rotograbado`);
        this.formatoTitulos(worksheetRotograbadoMP, tituloRotograbadoMP, image);
        header = ['Fecha', 'OT', 'Item', 'Referencia', 'Kg', 'Precio', 'SubTotal'];
        let headerRowRotograbado = worksheetRotograbadoMP.addRow(header);
        this.formatoEncabezado(headerRowRotograbado);
        this.formatoCuerpo(this.calcularInvRotograbadoMP(), worksheetRotograbadoMP);
        if(this.ValidarRol != 1) {
          worksheetRotograbadoMP.spliceColumns(6,2);
          worksheetRotograbadoMP.addRow([]);
          worksheetRotograbadoMP.getCell('A1').value = tituloRotograbadoMP;
        } 
      }

      workbook.xlsx.writeBuffer().then((data) => {
        let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        fs.saveAs(blob, `Inventarios_Areas.xlsx`);
      });
      this.load = false;
    } else this.msj.mensajeAdvertencia(`Advertencia`, 'Debe cargar al menos un registro en la tabla!');
  }

  // funcion que va a generar los titulos de las hojas de excel
  formatoTitulos(worksheet : any, titulo : string, image? : any){
    if (worksheet.name != 'Inventario Total') {
      worksheet.addImage(image, {
        tl: { col: 0.1, row: 0.40 },
        ext: { width: 170, height: 45 },
        editAs: 'oneCell'
      });
    }
    let titleImpresion = worksheet.addRow([titulo]);
    titleImpresion.font = { name: 'Calibri', family: 4, size: 16, underline: 'double', bold: true };
    worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFD5' } };
    worksheet.getCell('A1').border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };
    worksheet.addRow([]);
    if (worksheet.name != 'Inventario Total') worksheet.addRow([]);
  }

  // funcion que va a darle el estilo de los encabezados o titulos de cada columna
  formatoEncabezado(headerRow : any){
    headerRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFD5' } };
      cell.font = { name: 'Calibri', family: 4, size: 11, bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };
    });
  }

  // Funcion que va a darle el estilo a cada celda del cuerpo de la tabla
  formatoCuerpo(data : any, worksheet : any){
    data.forEach(d => {
      let row = worksheet.addRow(d);
      let celdas = [1, 2, 3, 4, 5, 6, 7];
      celdas.forEach(cell => {
        row.getCell(cell).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8DC' } };
        row.getCell(cell).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };
        if (row.getCell(1).value == 'TOTAL') row.getCell(cell).font = { name: 'Calibri', family: 4, size: 11, bold: true };
        if ([5, 6, 7].includes(cell)) row.getCell(cell).numFmt = '#,##0.00';
      });
    });
    [1, 2, 3, 5].forEach(cell => worksheet.getColumn(cell).width = 15);
    [6, 7].forEach(cell => worksheet.getColumn(cell).width = 30);
    [4].forEach(cell => worksheet.getColumn(cell).width = 50);
    let unirCeldasHoja : any = [];
    if([1, 61].includes(this.ValidarRol)) unirCeldasHoja = ['A1:G3'];
    else unirCeldasHoja = ['A1:E3'];
    unirCeldasHoja.forEach(cell => worksheet.mergeCells(cell));
  }

  // Funcion que va a calcular el total de cada area
  calcularInvTotal() : any [] {
    let datos : any [] = [];
    datos = [
      ['RECICLADO', this.calcularTotalReciclados()],
      ['MATERIA PRIMA', this.calcularTotalMatPrimas()],
      ['EXTRUSIÓN', this.calcularTotalMateriales()],
      ['ROLLOS', this.calcularTotalExtrusion()],
      ['IMPRESIÓN', this.calcularTotalImpresion()],
      ['SELLADO', this.calcularTotalSellado()],
      ['ROTOGRABADO', this.calcularTotalRotograbado()],
      ['DESPACHO', this.calcularTotalPT()],
      ['BIORIENTADOS', this.calcularTotalBopp()],
      ['MATERIALES IMPRESIÓN', this.calcularTotalImpresionMP()],
      ['MATERIALES ROTOGRABADO', this.calcularTotalRotograbadoMP()],
      ['TOTAL', this.calcularTotalReciclados() + this.calcularTotalMatPrimas() + this.calcularTotalMateriales() + this.calcularTotalExtrusion() + this.calcularTotalImpresion() + this.calcularTotalSellado() + this.calcularTotalRotograbado() + this.calcularTotalPT() + this.calcularTotalBopp() + this.calcularTotalImpresionMP() + this.calcularTotalRotograbadoMP()],
    ];
    return datos;
  }

  // funcion que va a calcular el total del inventario de extrusion
  calcularInvExtrusion() : any [] {
    let datos : any [] = [];
    this.invExtrusion.forEach(ext => {
      datos.push([
        ext.fecha_Inventario.replace('T00:00:00', ''),
        ext.ot,
        ext.item,
        ext.referencia,
        ext.stock,
        ext.precio,
        ext.subtotal
      ]);
    });
    datos.push([
      'TOTAL',
      '',
      '',
      '',
      this.invExtrusion.reduce((a,b) => a + b.stock, 0),
      '',
      this.invExtrusion.reduce((a,b) => a + b.subtotal, 0)
    ]);
    return datos;
  }

  // Funcion que va a calcular el total del inventario de rotograbado
  calcularInvRotograbado() : any [] {
    let datos : any [] = [];
    this.invRotograbado.forEach(ext => {
      datos.push([
        ext.fecha_Inventario.replace('T00:00:00', ''),
        ext.ot,
        ext.item,
        ext.referencia,
        ext.stock,
        ext.precio,
        ext.subtotal
      ]);
    });
    datos.push([
      'TOTAL',
      '',
      '',
      '',
      this.invRotograbado.reduce((a,b) => a + b.stock, 0),
      '',
      this.invRotograbado.reduce((a,b) => a + b.subtotal, 0)
    ]);
    return datos;
  }

  // Funcion que va a calcular el total del inventario de sellado
  calcularInvSellado() : any [] {
    let datos : any [] = [];
    this.invSellado.forEach(ext => {
      datos.push([
        ext.fecha_Inventario.replace('T00:00:00', ''),
        ext.ot,
        ext.item,
        ext.referencia,
        ext.stock,
        ext.precio,
        ext.subtotal
      ]);
    });
    datos.push([
      'TOTAL',
      '',
      '',
      '',
      this.invSellado.reduce((a,b) => a + b.stock, 0),
      '',
      this.invSellado.reduce((a,b) => a + b.subtotal, 0)
    ]);
    return datos;
  }

  // Funcion que va a calcular el total del inventario de impresion
  calcularInvImpresion() : any [] {
    let datos : any [] = [];
    this.invImpresion.forEach(ext => {
      datos.push([
        ext.fecha_Inventario.replace('T00:00:00', ''),
        ext.ot,
        ext.item,
        ext.referencia,
        ext.stock,
        ext.precio,
        ext.subtotal
      ]);
    });
    datos.push([
      'TOTAL',
      '',
      '',
      '',
      this.invImpresion.reduce((a,b) => a + b.stock, 0),
      '',
      this.invImpresion.reduce((a,b) => a + b.subtotal, 0)
    ]);
    return datos;
  }

  // Funcion que va a calcular el total del inventario de materias primas
  calcularInvMateriasPrimas() : any [] {
    let datos : any [] = [];
    this.invMatPrimas.forEach(ext => {
      datos.push([
        ext.fecha_Inventario.replace('T00:00:00', ''),
        ext.ot,
        ext.item,
        ext.referencia,
        ext.stock,
        ext.precio,
        ext.subtotal
      ]);
    });
    datos.push([
      'TOTAL',
      '',
      '',
      '',
      this.invMatPrimas.reduce((a,b) => a + b.stock, 0),
      '',
      this.invMatPrimas.reduce((a,b) => a + b.subtotal, 0)
    ]);
    return datos;
  }

  // Funcion que va a calcular el total del inventario de reciclado
  calcularInvRecuperado() : any [] {
    let datos : any [] = [];
    this.invReciclados.forEach(ext => {
      datos.push([
        ext.fecha_Inventario.replace('T00:00:00', ''),
        ext.ot,
        ext.item,
        ext.referencia,
        ext.stock,
        ext.precio,
        ext.subtotal
      ]);
    });
    datos.push([
      'TOTAL',
      '',
      '',
      '',
      this.invReciclados.reduce((a,b) => a + b.stock, 0),
      '',
      this.invReciclados.reduce((a,b) => a + b.subtotal, 0)
    ]);
    return datos;
  }

  // Funcion que va a calcular el total de los materiales en extrusion
  calcularMaterialesExtrusion() : any [] {
    let datos : any [] = [];
    this.invMateriales.forEach(ext => {
      datos.push([
        ext.fecha_Inventario.replace('T00:00:00', ''),
        ext.ot,
        ext.item,
        ext.referencia,
        ext.stock,
        ext.precio,
        ext.subtotal
      ]);
    });
    datos.push([
      'TOTAL',
      '',
      '',
      '',
      this.invMateriales.reduce((a,b) => a + b.stock, 0),
      '',
      this.invMateriales.reduce((a,b) => a + b.subtotal, 0)
    ]);
    return datos;
  }

  // Funcion que va a calcular el total de los materiales en despacho
  calcularInvDespacho() : any [] {
    let datos : any [] = [];
    this.invPT.forEach(ext => {
      datos.push([
        ext.fecha_Inventario.replace('T00:00:00', ''),
        ext.ot,
        ext.item,
        ext.referencia,
        ext.stock,
        ext.precio,
        ext.subtotal
      ]);
    });
    datos.push([
      'TOTAL',
      '',
      '',
      '',
      this.invPT.reduce((a,b) => a + b.stock, 0),
      '',
      this.invPT.reduce((a,b) => a + b.subtotal, 0)
    ]);
    return datos;
  }

  // Funcion que va a calcular el total del inventario de bopps
  calcularInvBopps() : any [] {
    let datos : any [] = [];
    this.invBopp.forEach(ext => {
      datos.push([
        ext.fecha_Inventario.replace('T00:00:00', ''),
        ext.ot,
        ext.item,
        ext.referencia,
        ext.stock,
        ext.precio,
        ext.subtotal
      ]);
    });
    datos.push([
      'TOTAL',
      '',
      '',
      '',
      this.invBopp.reduce((a,b) => a + b.stock, 0),
      '',
      this.invBopp.reduce((a,b) => a + b.subtotal, 0)
    ]);
    return datos;
  }

   // Funcion que va a calcular el total del inventario de materiales de impresion
   calcularInvImpresionMP() : any [] {
    let datos : any [] = [];
    this.invImpresionMP.forEach(ext => {
      datos.push([
        ext.fecha_Inventario.replace('T00:00:00', ''),
        ext.ot,
        ext.item,
        ext.referencia,
        ext.stock,
        ext.precio,
        ext.subtotal
      ]);
    });
    datos.push([
      'TOTAL',
      '',
      '',
      '',
      this.invImpresionMP.reduce((a,b) => a + b.stock, 0),
      '',
      this.invImpresionMP.reduce((a,b) => a + b.subtotal, 0)
    ]);
    return datos;
  }

  // Funcion que va a calcular el total del inventario de materiales de rotograbado
  calcularInvRotograbadoMP() : any [] {
    let datos : any [] = [];
    this.invRotograbadoMP.forEach(ext => {
      datos.push([
        ext.fecha_Inventario.replace('T00:00:00', ''),
        ext.ot,
        ext.item,
        ext.referencia,
        ext.stock,
        ext.precio,
        ext.subtotal
      ]);
    });
    datos.push([
      'TOTAL',
      '',
      '',
      '',
      this.invRotograbadoMP.reduce((a,b) => a + b.stock, 0),
      '',
      this.invRotograbadoMP.reduce((a,b) => a + b.subtotal, 0)
    ]);
    return datos;
  }

  //Función que consultará las categorias de todos los tipos de materiales. 
  consultarCategorias(){
    this.svcMatPrimas.GetCategoriasMateriaPrima().subscribe(datos => this.categoriasMatPrima = datos);
    this.svcTintas.GetCategoriasTintas().subscribe(datos => this.categoriasTinta = datos);
    this.svcBopps.GetCategoriasBOPP().subscribe(datos => this.categoriasBopp = datos);
  }
}
