import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import moment from 'moment';
import { Table } from 'primeng/table';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { CreacionPdfService } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';
import { DtPreEntregaRollosService } from 'src/app/Servicios/DetallesPreIngresoRollosDespacho/DtPreEntregaRollos.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { ProcesosService } from 'src/app/Servicios/Procesos/procesos.service';
import { ProductoService } from 'src/app/Servicios/Productos/producto.service';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-Movimientos_PreIngresoProduccion',
  templateUrl: './Movimientos_PreIngresoProduccion.component.html',
  styleUrls: ['./Movimientos_PreIngresoProduccion.component.css']
})
export class Movimientos_PreIngresoProduccionComponent implements OnInit {
  load : boolean = false;
  modeSelected: boolean;
  movements : any[] = [];
  form !: FormGroup; 
  process : any = []; 
  products : any = [];
  storage_Id: number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre: any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol: any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  rol: number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  @ViewChild('dt') dt : Table | undefined;
  infoTable : any = [];
  medida : string = '';
 

  constructor(private AppComponent : AppComponent, 
    private frmBuild : FormBuilder, 
    private svcProcess : ProcesosService, 
    private svcProducts : ProductoService, 
    private svcPreInProduction : DtPreEntregaRollosService, 
    private svcMsjs : MensajesAplicacionService, 
    private svcPDF : CreacionPdfService, 
    private svcBagpro : BagproService,) {
    this.modeSelected = this.AppComponent.temaSeleccionado;
    this.initForm();
   }

  ngOnInit() {
    this.getProcess();
    this.loadProcessByRol();
  }

  //. 
  initForm(){
    this.form = this.frmBuild.group({
      ot : [null,],
      process : [null,],
      startDate : [null,],
      endDate : [null,],
      item : [null,],
      reference : [null,],
    });
  }
  
  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage() {
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.rol = this.AppComponent.storage_Rol;
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

  //.
  loadProcessByRol(){
    if(this.rol == 7) this.form.patchValue({ process : 'EXT' });
    else if(this.rol == 8) this.form.patchValue({ process : 'SELLA' });
    else if(this.rol == 9) this.form.patchValue({ process : 'EMP' });
    else this.form.patchValue({ process : null });
  }

  //.
  searchMovements(){
    this.movements = [];
    this.infoTable = [];
    let startDate : any = this.form.value.startDate;
    let endDate : any = this.form.value.endDate;
    let root : any = this.validateRoot(); 
    this.load = true;
    startDate == null ? startDate = moment().format('YYYY-MM-DD') : startDate = moment(startDate).format('YYYY-MM-DD');
    endDate == null ? endDate = startDate : endDate = moment(endDate).format('YYYY-MM-DD');

    this.svcPreInProduction.GetDataPreInProduction(startDate, endDate, root).subscribe(data => { 
      data.forEach(x => { 
        this.svcBagpro.GetInformactionProductionForTag(x.rollo).subscribe(dataBp => { this.loadDataTable(x, dataBp); }, 
        error => {});
      });
      this.load = false; 
    }, error => { 
      this.svcMsjs.mensajeAdvertencia(`No se encontraron resultados de búsqueda`);
      this.load = false; 
    });
  }

  loadDataTable(dataApp : any, dataBagpro : any) {
    let completeData : any = {
      'OT' : dataApp.orden, 
      'Item' : dataApp.id_Producto, 
      'Referencia' : dataApp.producto, 
      'Rollo' : dataApp.rollo, 
      'Rollo_Bagpro' : dataBagpro[0].item,
      'Cantidad' : dataApp.cantidad, 
      'Und' : dataApp.presentacion, 
      'Proceso' : dataApp.nombreProceso, 
      'Fecha_Ingreso' : dataApp.fecha_Ingreso.replace('T00:00:00', ` - ${dataApp.hora_Ingreso}`),
    }
    this.movements.push(completeData);
    this.infoTable.push(completeData);
  }

  //.
  validateRoot(){
    let process : any = this.form.value.process;
    let ot : any = this.form.value.ot;
    let item : any = this.form.value.item;
    let root : any = ``;

    if(process != null) root += `process=${process}`;
    if(ot != null) root.length > 0 ? root += `&ot=${ot}` : root += `ot=${ot}`; 
    if(item != null) root.length > 0 ? root += `&item=${item}` : root += `item=${item}`;

    if(root.length > 0) root =`?${root}`;
    return root;
  }

  clearLabels(){
    this.form.reset();
    this.movements = [];
    this.infoTable = [];
    this.load = false;
  }

  getProcess = () => this.svcProcess.srvObtenerLista().subscribe(data => this.process = data.filter(x => ['EMP','SELLA','EXT'].includes(x.proceso_Id)));

  getItems = () => this.svcProducts.obtenerItemsLike(this.form.value.reference).subscribe(data => this.products = data);

  selectedItem(){
    this.getItems();
    this.form.patchValue({
      item : this.form.value.reference,
      reference : this.products.find(x => x.prod_Id == this.form.value.reference).prod_Nombre
    });
  }

  //. Función para filtrar la tabla. 
  applyFilter($event, campo : any, valorCampo : string) {
    this.dt!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);
    setTimeout(() => { if(this.dt.filteredValue) this.movements = this.dt!.filteredValue; }, 500); 
    if(!this.dt.filteredValue) this.movements = this.infoTable;  
  }

  calculateTotal = () => this.movements.reduce((a, b) => a + b.Cantidad, 0);

  newPdf(){
    let data : any = this.movements;
    let title : string = `Reporte Preingreso Producción`;
    let content: any[] = this.contentPDF(data);
    this.svcPDF.formatoPDF(title, content);
  }

  //Adición de contenido al pdf. 
  contentPDF(data : any) : any {
    let content : any[] = [];
    let groupedInformation : any = this.groupedInfo(data);
    let detailedInformation : any = this.detailedInfo(data);
    content.push(this.titleInfoConsolidated());
    content.push(this.headerTableConsolidated(groupedInformation));
    content.push(this.tableTotalsConsolidated());
    content.push(this.titleInfoDetails());
    content.push(this.headerTableDetails(detailedInformation));
    return content;
  }

  //Titulo de información consolidada
  titleInfoConsolidated(){
    return {
      text: `Información consolidada de Preingreso\n `,
      alignment: 'center',
      style: 'header', 
      fontSize : 10, 
      bold : true,
    };
  }

  //Encabezado de tabla consolidada
  headerTableConsolidated(data : any) {
    let columns : any[] = ['OT', 'Item', 'Referencia', 'Rollos', 'Cantidad', 'Und'];
    let widths: Array<string> = ['10%', '10%', '50%', '10%', '10%', '10%'];
    return {
      margin: [0, 0, 0, 10],
      
      table : {
        headerRows : 1,
        widths : widths, 
        body : this.builderTableBody(data, columns),
      },
      fontSize : 8,
      layout : {
        fillColor : function(rowIndex) {
          return (rowIndex == 0) ? '#DDDDDD' : null; 
        },
      }
    }
  }

  //Información consolidada de la orden agrupada por OT.
  groupedInfo(data : any){
    let info : any = [];
    data.forEach(x => {
      if(!info.map(y => y.OT).includes(x.OT)) {
        let countOrders : number = data.filter(z => z.OT == x.OT).length;
        let total : number = data.filter(z => z.OT == x.OT).reduce((a, b) => a + b.Cantidad, 0);
        let object : any = {
          'OT' : x.OT,
          'Item' : x.Item, 
          'Referencia' : x.Referencia,
          'Rollos' : countOrders,
          'Cantidad' : this.formatonumeros(total.toFixed(2)),
          'Und' : x.Und 
        }
        info.push(object);
      }
    });
    return info;
  }

  //.Función que retornará el total de kilos, unidades y paquetes consolidados
  tableTotalsConsolidated(){
    let info : any = [];
    info.push([
      { margin: [0, 1, 0, 15], border: [false, true, false, false], alignment: 'right', fontSize: 9, bold: true, text: `Cantidad Total KLS: ${ this.formatonumeros(this.calculateKls())} | UND: ${ this.formatonumeros(this.calculateUnds())} | PAQ: ${ this.formatonumeros(this.calculatePacks())}`, }
    ])
    return info;
  }
  
  //Titulo de información consolidada
  titleInfoDetails(){
    return {
      text: `Información detallada de Preingreso\n `,
      alignment: 'center',
      style: 'header', 
      fontSize : 10, 
      bold : true,
    };
  }

  //Encabezado de tabla consolidada
  headerTableDetails(data :any) {
    let columns : any[] = ['OT', 'Item', 'Referencia', 'Rollo', 'Cantidad', 'Und', 'Proceso', 'Fecha Ingreso',];
    let widths: Array<string> = ['6%','6%','42%','7%','7%','7%','8%','17%'];
    return {
      margin: [0, 0, 0, 0],
      table : {
        headerRows : 1,
        widths : widths, 
        body : this.builderTableBody(data, columns),
      },
      fontSize : 8,
      layout : {
        fillColor : function(rowIndex) {
          return (rowIndex == 0) ? '#DDDDDD' : null; 
        },
      }
    }
  }

  //Información detallada 
  detailedInfo(data : any){
    let info : any = [];
    data.forEach(x => {
      const completeData : any = {
        'OT' : x.OT, 
        'Item' : x.Item, 
        'Referencia' : x.Referencia, 
        'Rollo' : x.Rollo_Bagpro, 
        'Cantidad' : x.Cantidad, 
        'Und' : x.Und, 
        'Proceso' : x.Proceso, 
        'Fecha Ingreso' : x.Fecha_Ingreso,
      }
      info.push(completeData);
    });
    return info;
  }

  //Construir tabla.
  builderTableBody(data, columns) {
    var body = [];
    body.push(columns);
    data.forEach(function (row) {
      var dataRow = [];
      columns.forEach((column) => dataRow.push(row[column].toString()));
      body.push(dataRow);
    });
    return body;
  }

  calculateKls = () => this.movements.filter(x => x.Und == 'Kg').reduce((a, b) => a + b.Cantidad, 0)

  calculateUnds = () => this.movements.filter(x => x.Und == 'Und').reduce((a, b) => a + b.Cantidad, 0)

  calculatePacks = () => this.movements.filter(x => x.Und == 'Paquete').reduce((a, b) => a + b.Cantidad, 0)
}
