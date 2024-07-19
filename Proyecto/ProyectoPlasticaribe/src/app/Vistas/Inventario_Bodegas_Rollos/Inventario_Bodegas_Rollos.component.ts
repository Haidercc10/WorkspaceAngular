import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShepherdService } from 'angular-shepherd';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import moment from 'moment';
import { Table } from 'primeng/table';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { CreacionExcelService } from 'src/app/Servicios/CreacionExcel/CreacionExcel.service';
import { Detalle_BodegaRollosService } from 'src/app/Servicios/Detalle_BodegaRollos/Detalle_BodegaRollos.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { Ubicaciones_BodegaRollosService } from 'src/app/Servicios/Ubicaciones_BodegaRollos/Ubicaciones_BodegaRollos.service';
import { AppComponent } from 'src/app/app.component';
import { defaultStepOptions, stepsInvenatarioBodegas as defaultSteps } from 'src/app/data';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';

@Component({
  selector: 'app-Inventario_Bodegas_Rollos',
  templateUrl: './Inventario_Bodegas_Rollos.component.html',
  styleUrls: ['./Inventario_Bodegas_Rollos.component.css']
})

export class Inventario_Bodegas_RollosComponent implements OnInit {

  cargando : boolean = false; //Variable para validar que salga o no la imagen de carga
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro

  inventarioTotal : any [] = []; //Variable que almacenará la información del inventario total de todas las bodegas
  inventarioExtrusion : any [] = []; //Variable que almacenará la información del inventario de la bodega de extrusion
  inventarioProductoIntermedio : any [] = []; //Variable que almacenará la información del inventario de la bodega de producto intermedio
  inventarioImpresion : any [] = []; //Variable que almacenará la información del inventario de la bodega de impresio
  inventarioRotograbado : any [] = []; //Variable que almacenará la información del inventario de la bodega de rotograbado
  inventarioSellado : any [] = []; //Variable que almacenará la información del inventario de la bodega de sellado
  inventarioDespacho : any [] = []; //Variable que almacenará la información del inventario de la bodega de despacho
  inventarioDetallado : any [] = []; //Vaariable que almacenará la información del inventario detallado
  inventario : boolean = false; //Variablq que validará si se ve el modal de los rollos o no
  inventoryRolls : any = []; 
  selectedRolls : any = [];
  warehouse : boolean = false;
  changeUbications : boolean = false; 
  form : FormGroup;
  ubications : Array<any> = [];
  subUbications : Array<any> = [];
  allUbications : Array<any> = [];

  @ViewChild('dtProductoIntermedio') dtProductoIntermedio: Table | undefined;
  @ViewChild('dtDetailsProdIntermedio') dtDetailsProdIntermedio: Table | undefined;
  @ViewChild('tableReubication') tableReubication: Table | undefined;

  constructor(private AppComponent : AppComponent,
                private shepherdService: ShepherdService,
                  private msj : MensajesAplicacionService,
                    private bgRollosService : Detalle_BodegaRollosService,
                      private svExcel : CreacionExcelService, 
                        private svBagpro : BagproService, 
                          private formBuilder : FormBuilder, 
                            private svUbicationsStore : Ubicaciones_BodegaRollosService, 
                              private svDetailsStore : Detalle_BodegaRollosService) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
    this.initForm();
  }

  ngOnInit() {
    this.lecturaStorage();
    this.consultarInventario();
    setInterval(() => this.modoSeleccionado = this.AppComponent.temaSeleccionado, 1000);
    this.getAllUbicationsStore();
  }
  
  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  // Funcion que va a hacer que se inicie el tutorial in-app
  tutorial(){
    this.shepherdService.defaultStepOptions = defaultStepOptions;
    this.shepherdService.modal = true;
    this.shepherdService.confirmCancel = false;
    this.shepherdService.addSteps(defaultSteps);
    this.shepherdService.start();
  }

  //*
  initForm(){
    this.form = this.formBuilder.group({
      ubication : [null, Validators.required],
      subUbication : [null],
      observation : [null, Validators.required]
    });
  }

  //*
  clearFields(){
    this.form.reset();
  }

  //*
  getAllUbicationsStore() {
    this.svUbicationsStore.getUbications().subscribe(data => { 
      this.allUbications = data;
      this.ubications = data.reduce((a, b) => {
        if(!a.map(x => x.ubR_Id).includes(b.ubR_Id)) a = [...a, b];
          return a;
      }, []); 
    }, error => {
      this.msj.mensajeError(`Error`, `No fue posible cargar las ubicaciones | ${error.status} ${error.statusText}`)
    }); 
  }

  //*
  getSubUbications() {
    let ubication : any = this.form.value.ubication;
    this.subUbications = this.allUbications.filter(x => x.ubR_Id == ubication);
  }

  //*
  quitRoll(data : any){
    this.cargando = true; 
    let index : any = this.selectedRolls.findIndex(x => x.roll == data.roll);
    this.msj.mensajeAdvertencia(`Advertencia`, `Se ha quitado el rollo N° ${data.roll} de la tabla.`);
    this.selectedRolls.splice(index, 1);
    if(this.selectedRolls.length == 0) this.changeUbications = false;
    setTimeout(() => { this.cargando = false; }, 1000);
  }

  //*
  selectionAll(){
    this.cargando = true;
    if(this.dtDetailsProdIntermedio) {
      if(this.dtDetailsProdIntermedio.filteredValue) this.selectedRolls = this.selectedRolls.concat(this.dtDetailsProdIntermedio.filteredValue);
      else this.selectedRolls = this.selectedRolls.concat(this.inventoryRolls);
    } else this.selectedRolls = this.selectedRolls.concat(this.inventoryRolls);
    console.log(this.selectedRolls);
    setTimeout(() => { this.cargando = false; }, 5);
  }

  deselectionAll(){
    this.cargando = true;
    this.selectedRolls = [];
    setTimeout(() => { this.cargando = false; }, 5);
  }

  //*
  reubicateRolls(){
    this.cargando = true;
    let subUbication : any = [undefined, null].includes(this.form.value.subUbication) ? 0 : this.form.value.subUbication;
    let newUbication : any = this.allUbications.find(x => x.ubR_Id == this.form.value.ubication && x.ubR_SubId == subUbication).ubR_Nomenclatura;
    let observation : any = `El día ${moment().format(`YYYY-MM-DD`)}, el usuario ${this.storage_Nombre} realiza cambio de ubicación hacía ${newUbication} por el siguiente motivo: ${this.form.value.observation}`; 
    
    this.svDetailsStore.putUbicationRoll(newUbication, observation, this.selectedRolls.map(x => x.roll)).subscribe(data => {
      this.changeUbications = false;
      setTimeout(() => { this.clearAfterReubication(); }, 1500); 
    }, error => {
      this.msj.mensajeError(`Error`, `Error actualizando la ubicación de los rollos | ${error.status} ${error.statusText}`);
      this.cargando = false;
    });
  }

  clearAfterReubication(){
    this.msj.mensajeConfirmacion(`Confirmación`, `Ubicación de rollos actualizada exitosamente!`);
    this.cargando = false;
    this.form.reset();
    this.selectedRolls = [];
    this.searchInventoryRolls();
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number: any) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g,'$1,');

  // Funcion que va a buscar la información de los inventarios de las bodegas
  consultarInventario(){
    let num : number = 0;
    this.cargando = true;
    this.inventarioProductoIntermedio = [];

    this.bgRollosService.GetInventarioRollos().subscribe(data => {
      if (data.length == 0) this.cargando = false;
      else {
        for (let i = 0; i < data.length; i++) {
          this.svBagpro.getClientsForOT(data[i].bgRollo_OrdenTrabajo).subscribe(dataBagpro => {
            let info : any = {
              Orden: data[i].bgRollo_OrdenTrabajo,
              Cliente : dataBagpro[0],
              Item: data[i].prod_Id,
              Referencia: data[i].prod_Nombre,
              Cantidad: data[i].cantidad,
              Presentacion: data[i].undMed_Id,
              Rollos: data[i].rollos,
              Bodega: data[i].bgRollo_BodegaActual,
              BodegaActual: data[i].proceso_Nombre,
            }
            //this.inventarioTotal.push(info);
            //if (data[i].bgRollo_BodegaActual == 'EXT') this.inventarioExtrusion.push(info);
            if (data[i].bgRollo_BodegaActual == 'BGPI') this.inventarioProductoIntermedio.push(info);
            //if (data[i].bgRollo_BodegaActual == 'IMP') this.inventarioImpresion.push(info);
            //if (data[i].bgRollo_BodegaActual == 'ROT') this.inventarioRotograbado.push(info);
            //if (data[i].bgRollo_BodegaActual == 'SELLA') this.inventarioSellado.push(info);
            //if (data[i].bgRollo_BodegaActual == 'DESP') this.inventarioDespacho.push(info);
            num += 1;
            if (num == data.length) this.cargando = false;
          });
        }
      }
      
    }, error => {
       this.msj.mensajeError(`Error`, `No fue posible cargar el inventario de rollos`); 
       this.cargando = false
    });
  }

  // Funcion que va a consultar los detalles de las ordenes de trabajo
  consultarDetallesInventario(orden : number, bodega : string){
    let num : number = 0;
    this.inventarioDetallado = [];
    this.bgRollosService.GetInventarioRollos_OrdenTrabajo(orden, bodega).subscribe(data => {
      this.inventario = true;
      for (let i = 0; i < data.length; i++) {
        let info : any = {
          Rollo: data[i].dtBgRollo_Rollo,
          Orden: data[i].bgRollo_OrdenTrabajo,
          Cliente : this.inventarioProductoIntermedio.find(x => x.Orden == data[i].bgRollo_OrdenTrabajo).Cliente,
          Item: data[i].prod_Id,
          Referencia: data[i].prod_Nombre,
          Cantidad: data[i].dtBgRollo_Cantidad,
          Presentacion: data[i].undMed_Id,
          Ubicacion : data[i].dtBgRollo_Ubicacion,
          Fecha: data[i].bgRollo_FechaEntrada.replace('T00:00:00', ''),
          Extrusion: data[i].dtBgRollo_Extrusion ? 'SI' : 'NO',
          ProductoIntermedio: data[i].dtBgRollo_ProdIntermedio ? 'SI' : 'NO',
          Impresion: data[i].dtBgRollo_Impresion ? 'SI' : 'NO',
          Rotograbado: data[i].dtBgRollo_Rotograbado ? 'SI' : 'NO',
          Sellado: data[i].dtBgRollo_Sellado ? 'SI' : 'NO',
          Despacho: data[i].dtBgRollo_Despacho ? 'SI' : 'NO',
        }
        this.inventarioDetallado.push(info);
        if (num == data.length) this.cargando = false;
      }
    }, () => this.cargando = false);
  }

  // Funcion que va a aplicar un filtro de busqueda a las tablas
  aplicarfiltro = ($event : any, campo : any, valorCampo : string, tabla : any) => tabla!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

  // Funcion que va a calcular la cantidad total de kg que hay
  calcularTotalKg(){
    let total : number = 0;
    if(this.dtProductoIntermedio) {
      if(this.dtProductoIntermedio.filteredValue) total = this.dtProductoIntermedio.filteredValue.reduce((a, b) => a += b.Cantidad, 0);
      else total = this.inventarioProductoIntermedio.reduce((a,b) => a += b.Cantidad, 0);
    } else total = this.inventarioProductoIntermedio.reduce((a,b) => a += b.Cantidad, 0);
    return total;
  }

  calcularTotalRollos(){
    let total : number = 0;
    if(this.dtProductoIntermedio) {
      if(this.dtProductoIntermedio.filteredValue) total = this.dtProductoIntermedio.filteredValue.reduce((a, b) => a += b.Rollos, 0);
      else total = this.inventarioProductoIntermedio.reduce((a, b) => a += b.Rollos, 0);
    } else total = this.inventarioProductoIntermedio.reduce((a, b) => a += b.Rollos, 0);
    return total;
  }

  // Funcion que va a crear un archivo de excel
  crearExcel(num : number){
    if(this.inventarioProductoIntermedio.length > 0) {
      this.cargando = true;
      let datos : any [] = [];
      let infoDocumento : any [] = [];
      let title : string = ``;

      if (num == 1) {
        title = `Inventario Bodegas - ${this.today}`;
        datos = this.inventarioTotal;
      } else if (num == 2) {
        title = `Inventario Bodega Extrusión - ${this.today}`;
        datos = this.inventarioExtrusion;
      } else if (num == 3) {
        title = `Inventario Bodega Producto Intermedio - ${this.today}`;
        datos = this.inventarioProductoIntermedio;
      } else if (num == 4) {
        title = `Inventario Bodega Impresión - ${this.today}`;
        datos = this.inventarioImpresion;
      } else if (num == 5) {
        title = `Inventario Bodega Rotograbado - ${this.today}`;
        datos = this.inventarioRotograbado;
      } else if (num == 6) {
        title = `Inventario Bodega Sellado - ${this.today}`;
        datos = this.inventarioSellado;
      } else if (num == 7) {
        title = `Inventario Bodega Despacho - ${this.today}`;
        datos = this.inventarioDespacho;
      }
      setTimeout(() => {
        const header = ["Orden Trabajo", "Cliente", "Item", "Referencia", "Cantidad Kg", "Presentación", "Cantidad Rollos", "Bodega Actual"]
        for (const item of datos) {
          const datos1  : any = [item.Orden, item.Cliente, item.Item, item.Referencia, item.Cantidad, item.Presentacion, item.Rollos, item.BodegaActual];
          infoDocumento.push(datos1);
        }
        let workbook = new Workbook();
        const imageId1 = workbook.addImage({ base64:  logoParaPdf, extension: 'png', });
        let worksheet = workbook.addWorksheet(title);
        worksheet.addImage(imageId1, 'A1:B3');
        let headerRow = worksheet.addRow(header);
        headerRow.eachCell((cell) => {
          cell.fill = {  type: 'pattern', pattern: 'solid', fgColor: { argb: 'eeeeee' }}
          cell.font = { name: 'Calibri', family: 4, size: 12, bold: true }
          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
        });
        worksheet.mergeCells('A1:H3');
        worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getCell('A1').value = title;
        worksheet.getCell('A1').font = { name: 'Calibri', family: 4, size: 16, bold: true };
        infoDocumento.forEach(d => {
          let row = worksheet.addRow(d);
          row.getCell(5).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
        });
        let widths : any = [20, 50, 20, 50, 31, 15, 20, 30];
        let count : number = 0;
        widths.forEach(x => {
          count++
          worksheet.getColumn(count).width = x;
        }); 
        setTimeout(() => {
          workbook.xlsx.writeBuffer().then((data) => {
            let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            fs.saveAs(blob, title + `.xlsx`);
          });
          this.cargando = false;
          this.msj.mensajeConfirmacion(`Confirmación`, `${title} exportado exitosamente!` );
        }, 1000);
      }, 1500);
    } else this.msj.mensajeAdvertencia(`Advertencia`, `No se puede crear el archivo Excel porque no hay datos para exportar`);
  }

  // Funcion que va a crear un excel de los detalles
  crearExcelDetallado(){
    if (this.inventarioDetallado.length > 0) {
      this.cargando = true;
      this.inventario = false;
      let datos : any [] = this.inventarioDetallado;
      let infoDocumento : any [] = [];
      let title : string = `Inventario detallado OT N° ${this.inventarioDetallado[0].Orden}`;

      setTimeout(() => {
        const header = ["Rollo", "OT", "Cliente", "Item", "Referencia", "Cantidad", "Presentación", "Fecha Ingreso", "Ubicación", "Extrusión", "Producto Intermedio", "Impresión", "Rotograbado", "Sellado", "Despacho"]
        for (const item of datos) {
          const datos1  : any = [item.Rollo, item.Orden, item.Cliente, item.Item, item.Referencia, item.Cantidad, item.Presentacion, item.Fecha, item.Ubicacion, item.Extrusion, item.ProductoIntermedio, item.Impresion, item.Rotograbado, item.Sellado, item.Despacho];
          infoDocumento.push(datos1);
        }
        let workbook = new Workbook();
        const imageId1 = workbook.addImage({ base64:  logoParaPdf, extension: 'png', });
        let worksheet = workbook.addWorksheet(title);
        worksheet.addImage(imageId1, 'A1:B3');
        let headerRow = worksheet.addRow(header);
        headerRow.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'eeeeee' }
          }
          cell.font = { name: 'Calibri', family: 4, size: 12, bold: true }
          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
        });
        worksheet.mergeCells('A1:O3');
        worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getCell('A1').value = title;
        worksheet.getCell('A1').font = { name: 'Calibri', family: 4, size: 16, bold: true };
        infoDocumento.forEach(d => {
          let row = worksheet.addRow(d);
          row.getCell(5).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
        });

        let widths : any = [15,10,50,15,50,15,15,15,15,15,25,12,15,12,12]
        let count : number = 0;
        widths.forEach(x => {
          count++
          worksheet.getColumn(count).width = x;
        }); 

        setTimeout(() => {
          workbook.xlsx.writeBuffer().then((data) => {
            let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            fs.saveAs(blob, title + `.xlsx`);
          });
          this.cargando = false;
          this.inventario = true;
          this.msj.mensajeConfirmacion(`Confirmación`, `${title} exportado exitosamente!`);
        }, 1000);
      }, 1500);
    } else this.msj.mensajeAdvertencia(`Advertencia`, `No se puede crear el archivo Excel porque no hay datos para exportar`);
  }

  //* 
  searchInventoryRolls(){
    this.inventoryRolls = [];
    this.cargando = true;

    this.bgRollosService.getInventoryAvailable().subscribe(data => {
      this.cargando = false;
      this.inventoryRolls = data;
      this.inventoryRolls.forEach(x => x.client = this.inventarioProductoIntermedio.find(z => z.Orden == x.ot).Cliente );
    }, error => {
      this.msj.mensajeError(`Error`, `No fue posible consultar el inventario de rollos disponibles`);
      this.cargando = false;
    });
  }

  //* Función que va muestra el inv. de rollos por OT/Detallado actualizado 
  changeTab(event : any){
    let tab : any = event.originalEvent.srcElement.innerText;

    if(tab == 'Producto Intermedio') this.consultarInventario();
    if(tab == 'Producto Intermedio Detallado') this.searchInventoryRolls();
  }

  //*Función que muestra la cantidad total en inventario de lo que haya en la tabla al instante
  qtyTotal(){
    let total : number = 0;
    //setTimeout(() => {
      if(this.dtDetailsProdIntermedio) {
        if(this.dtDetailsProdIntermedio.filteredValue) total = this.dtDetailsProdIntermedio.filteredValue.reduce((a, b) => a += b.qty, 0);
        else total = this.inventoryRolls.reduce((a, b) => a += b.qty, 0);
      } else total = this.inventoryRolls.reduce((a, b) => a += b.qty, 0);
      return total;
    //}, 500);
  }

  //*Función que muestra la cantidad total de rollos que hay en inventario
  qtyTotalRolls(){
    let total : number = 0;
    //setTimeout(() => {
      if(this.dtDetailsProdIntermedio) {
        if(this.dtDetailsProdIntermedio.filteredValue) total = this.dtDetailsProdIntermedio.filteredValue.length;
        else total = this.inventoryRolls.length;
      } else total = this.inventoryRolls.length;
      return total;
    //}, 500);
  }


  //? CREACIÓN DE FORMATO EXCEL
  //* Función para crear excel de rollo a rollo detallado.
  createExcel(){
    let data : any = [];
    if(this.dtDetailsProdIntermedio) { 
      if(this.dtDetailsProdIntermedio.filteredValue) data = this.dtDetailsProdIntermedio.filteredValue;
      else data = this.inventoryRolls; 
    } else data = this.inventoryRolls; 
     
    if(data.length > 0) {
      this.cargando = true;
      setTimeout(() => { this.loadSheetAndStyles(data); }, 500);
      setTimeout(() => { this.cargando = false; }, 1000);
    } else this.msj.mensajeAdvertencia(`No hay datos para exportar`, `Debe haber al menos un registro en la tabla!`);
  }

  //Función que cargará la hoja de cálculo y los estilos.
  loadSheetAndStyles(data : any){  
    let title : any = `Inventario bodega de rollos ${moment().format('DD-MM-YYYY')}`
    let fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'eeeeee' } };
    let border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }, };
    let font = { name: 'Calibri', family: 4, size: 11, bold: true };
    let alignment = { vertical: 'middle', horizontal: 'center', wrapText: true};
    let workbook = this.svExcel.formatoExcel(title, true);

    this.addNewSheet(workbook, title, fill, border, font, alignment, data);
    this.svExcel.creacionExcel(title, workbook);
  }

  //Función para agregar una nueva hoja de calculo.
  addNewSheet(wb : any, title : any, fill : any, border : any, font : any, alignment : any, data : any){
    let fontTitle = { name: 'Calibri', family: 4, size: 15, bold: true };
    let worksheet : any = wb.worksheets[0];
    this.loadStyleTitle(worksheet, title, fontTitle, alignment);
    this.loadHeader(worksheet, fill, border, font, alignment);
    this.loadInfoExcel(worksheet, this.dataExcel(data), border,  alignment);
  }

  //Cargar estilos del titulo de la hoja.
  loadStyleTitle(ws: any, title : any, fontTitle : any, alignment : any){
    ws.getCell('A1').alignment = alignment;
    ws.getCell('A1').font = fontTitle;
    ws.getCell('A1').value = title;
  }

  //Función para cargar los titulos de el header y los estilos.
  loadHeader(ws : any, fill : any, border : any, font : any, alignment : any){
    let rowHeader : any = ['A5','B5','C5','D5','E5','F5','G5','H5','I5']; 
    //ws.addRow([]);
    ws.addRow(this.loadFieldsHeader());
    
    rowHeader.forEach(x => ws.getCell(x).fill = fill);
    rowHeader.forEach(x => ws.getCell(x).alignment = alignment);
    rowHeader.forEach(x => ws.getCell(x).border = border);
    rowHeader.forEach(x => ws.getCell(x).font = font);
    ws.mergeCells('A1:I3');

    this.loadSizeHeader(ws);
  }

  //Función para cargar el tamaño y el alto de las columnas del header.
  loadSizeHeader(ws : any){
    [6,4].forEach(x => ws.getColumn(x).width = 50);
    [2,3,5,8].forEach(x => ws.getColumn(x).width = 10);
    [1].forEach(x => ws.getColumn(x).width = 5);
    [7,9].forEach(x => ws.getColumn(x).width = 15);
  }

 //Función para cargar los nombres de las columnas del header
  loadFieldsHeader(){
    let headerRow = [
      'N°',
      'Rollo',
      'OT',
      'Cliente',
      'Item', 
      'Referencia', 
      'Cantidad',
      'Unidad',
      'Ubicación'
    ];
    return headerRow;
  }

  //Cargar información con los estilos al formato excel. 
  loadInfoExcel(ws : any, data : any, border : any, alignment : any){
    let formatNumber: Array<number> = [7];
    let contador : any = 6;
    let row : any = ['A','B','C','D','E','F','G','H','I']; 

    formatNumber.forEach(x => ws.getColumn(x).numFmt = '""#,##0.00;[Red]\-""#,##0.00');
    data.forEach(x => {
      ws.addRow(x);
      row.forEach(r => {
        ws.getCell(`${r}${contador}`).border = border;
        ws.getCell(`${r}${contador}`).font = { name: 'Calibri', family: 4, size: 10 };
        ws.getCell(`${r}${contador}`).alignment = alignment;
      });
      contador++
    });
    row.forEach(r => ws.getCell(`${r}${contador - 1}`).font = { name: 'Calibri', family: 4, size: 11, bold : true, }); 
  }

  //Agregar fila de totales al formato excel.
  addTotal(info : any){
    info.push([
      '',
      '',
      '',
      '',
      '',
      'DISPONIBLE',
      this.qtyTotal(),
      'TOTAL ROLLOS',
      this.qtyTotalRolls(),
    ]);
  }

  //.Función que contendrá la info al documento excel. 
  dataExcel(data : any){
    let info : any = [];
    let count : number = 0;
    data.forEach(x => {
      info.push([
        count += 1,
        x.roll,
        x.ot,
        x.client,
        x.item,
        x.reference,
        x.qty,
        x.presentation,
        x.ubication,
      ]);
    });
    this.addTotal(info);
    return info;
  }

}

