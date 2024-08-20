import { Component, Injectable, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { log } from 'console';
import moment from 'moment';
import { AppComponent } from 'src/app/app.component';
import { modelDetalles_PrecargueDespacho } from 'src/app/Modelo/modelDetalles_PrecargueDespacho';
import { modelPrecargue_Despacho } from 'src/app/Modelo/modelPrecargue_Despacho';
import { CreacionPdfService } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';
import { Detalles_PrecargueDespachoService } from 'src/app/Servicios/Detalles_PrecargueDespacho/Detalles_PrecargueDespacho.service';
import { InventarioZeusService } from 'src/app/Servicios/InventarioZeus/inventario-zeus.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { Precargue_DespachoService } from 'src/app/Servicios/Precargue_Despacho/Precargue_Despacho.service';
import { Produccion_ProcesosService } from 'src/app/Servicios/Produccion_Procesos/Produccion_Procesos.service';
import { ProductoService } from 'src/app/Servicios/Productos/producto.service';

@Injectable({
  providedIn : `root`
})

@Component({
  selector: 'app-Precargue_RollosDespacho',
  templateUrl: './Precargue_RollosDespacho.component.html',
  styleUrls: ['./Precargue_RollosDespacho.component.css']
})
export class Precargue_RollosDespachoComponent implements OnInit {

  load : boolean = false;
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  form !: FormGroup;
  rollsToDispatch : any = [];
  rollsConsolidate : any = [];
  clients : any = [];
  searchIn: boolean | null = null;
  @ViewChild('dt') dt : null | undefined; 
  products : any = [];
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol

  constructor(private AppComponent : AppComponent, 
    private fmBuild : FormBuilder,
    private svZeus : InventarioZeusService,
    private msj : MensajesAplicacionService,
    private svProducts : ProductoService,
    private svProduction : Produccion_ProcesosService,
    private svPreload : Precargue_DespachoService,
    private svDetailsPreload : Detalles_PrecargueDespachoService,
    private svPDF : CreacionPdfService,  
  ) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
    this.initForm();
   }

  ngOnInit() {
    this.lecturaStorage();
  }

  //*
  formatonumeros = (number : any) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  initForm(){
    this.form = this.fmBuild.group({
      roll : [null],
      //process : [null],
      //item : [null, Validators.required], 
      //reference : [null, Validators.required],
      idClient : [null, Validators.required], 
      client : [null, Validators.required],
      observation : [null,], 
    })
  }

  //*
  searchClientsByName() {
    let name = this.form.value.client;
    this.svZeus.getClientByName(name).subscribe(data => this.clients = data);
  }

  //*
  selectClient() {
    let client = this.clients.find(x => x.idcliente == this.form.value.client);
    this.form.patchValue({ 'idClient': client.idcliente, 'client': client.razoncial, });
  }

  //*
  searchProduct() {
    let nombre: string = this.form.value.reference;
    this.svProducts.obtenerItemsLike(nombre).subscribe(resp => this.products = resp);
  }

  //*
  selectedProduct() {
    let product : any = this.form.value.reference;
    this.form.patchValue({
      'item': product,
      'reference': this.products.find(x => x.prod_Id == product).prod_Nombre
    });
  }

  //*
  getItem(){
    this.load = true;
    let item : any = this.form.value.item;
    if(item) {
      this.svProducts.GetProductsById(item).subscribe(data => {
        this.form.patchValue({ 'item': item, 'reference': data[0].prod.prod_Nombre, });
        this.load = false;
      }, error => {
        this.msjs(`Error`, `No se encontró el item N° ${item}`);
        this.form.patchValue({ 'item': null, 'reference': null, });
      });
    } else this.msjs(`Advertencia`, `Debe llenar el campo ITEM`);
  }

  //*
  searchRolls(){
    let roll : number = this.form.value.roll;
    //let client : any = this.form.value.idClient;
    //let clients : any = this.clients.find(x => x.idcliente == client);

    if(this.form.valid) {
      //if(this.rollsToDispatch.length > 0) {
      //  if (!this.rollsToDispatch.map(x => x.idClient).includes(parseInt(client))) {
      //    this.msjs(`Advertencia`, `La orden de precargue solo puede tener un cliente!`);
      //    return;
      //  }
      //}
      this.load = true;
      this.svProduction.getInformationDispatch(roll).subscribe(data => {
        if(!this.rollsToDispatch.map(x => x.roll).includes(roll)) {
          this.rollsToDispatch.unshift(data[0]);
          this.consolidateItems();
          this.msjs(`Confirmación`, `El rollo/bulto N° ${roll} ha sido agregado a la tabla!`);
          this.form.patchValue({ roll : null });
        } else this.msjs(`Advertencia`, `El rollo/bulto N° ${roll} ya se encuentra en la tabla!`);
      }, error => {
        [400, 404].includes(error.status) ? this.msjs(`Advertencia`, `El rollo/bulto N° ${roll} no se encuentra disponible!`) : this.msjs(`Error`, `Error consultando el rollo/bulto N° ${roll}`);
        this.form.patchValue({ roll : null });
      });
    } else this.msjs(`Advertencia`, `Debe llenar todos los campos`);
  }

  //*
  consolidateItems(){
    this.rollsConsolidate = this.rollsToDispatch.reduce((acc, value) => {
      let find = acc.find(x => x.item == value.item);
      if(!find) acc.push(value);
      return acc;
    }, []);
  }

  //*
  qtyRollsItem = (data : any) => this.rollsToDispatch.filter(x => x.item == data.item).length;

  //*
  qtyTotalItem = (data : any) => this.rollsToDispatch.filter(x => x.item == data.item).reduce((a, b) => a += b.qty, 0);

  //*
  weightTotalItem = (data : any) => this.rollsToDispatch.filter(x => x.item == data.item).reduce((a, b) => a += b.weight, 0);

  //*
  quitRoll(data){
    this.load = true;
    
    setTimeout(() => {
      this.msjs(`Advertencia`, `Se quitó el rollo N° ${data.roll} de la tabla!`);
      let index = this.rollsToDispatch.findIndex(x => x.rollo == data.roll && x.ot == data.ot);
      this.rollsToDispatch.splice(index, 1);
      this.load = false;
      this.consolidateItems();
    }, 500); 
  }

  //*
  applyFilter = ($event, campo : any, table : any) => table!.filter(($event.target as HTMLInputElement).value, campo, 'contains');

  //*
  savePreload(){
    if(this.rollsToDispatch.length > 0) {
      this.load = true;
      let info : modelPrecargue_Despacho = {
        Cli_Id: this.form.value.idClient,
        OF_Id: 4472, //OF GENERICA
        Pcd_FechaCrea: moment().format('YYYY-MM-DD'),
        Pcd_HoraCrea: moment().format('HH:mm:ss'),
        Usua_Crea: this.storage_Id,
        Pcd_Observacion: this.form.value.observation,
        Estado_Id: 11,
        Pcd_FechaModifica: moment().format('YYYY-MM-DD'),
        Pcd_HoraModifica: moment().format('HH:mm:ss'),
        Usua_Modifica: 0,
        Pcd_ObservacionModifica: '',
      };
      this.svPreload.Post(info).subscribe(data => { this.saveDetailsPreload(data.pcd_Id); }, error => { 
        this.msjs(`Error`, `Error guardando el encabezado del precargue de despacho`); 
      });
    }
  }

  //*
  saveDetailsPreload(id : number){
    let count : number = 0;
    this.rollsToDispatch.forEach(x => {
      let info : modelDetalles_PrecargueDespacho = {
        'Pcd_Id': id,
        'Prod_Id': x.item,
        'DtlPcd_Rollo': x.roll,
        'DtlPcd_Cantidad': x.qty,
        'UndMed_Id': x.unit,
      }
      this.svDetailsPreload.Post(info).subscribe(data => {
        count += 1;
        if(count == this.rollsToDispatch.length) this.updateStatusRolls(id);
      });
    });
  }

  //*
  updateStatusRolls(id : number){
    let rolls : Array<any> = [];
    this.rollsToDispatch.forEach(x => rolls.push({ 'roll' : x.roll, 'item' : x.item, 'currentStatus' : 19, 'newStatus' : 50, 'envioZeus' : true }));
    this.svProduction.putChangeStateProduction(rolls).subscribe(data => { this.createPDF(id, `creada`) }, error => { 
      this.msjs(`Error`, `Error actualizando el estado de los rollos seleccionados`); 
    });
  }

  clearFields(){
    this.form.reset();
    this.load = false;
  }

  clearAll(){
    this.form.reset();
    this.rollsToDispatch = [];
    this.rollsConsolidate = [];
    this.searchIn = null;
    this.load = false;
  }

  //* Función para acortar msjs 
  msjs(msj1 : string, msj2 : string) {
    this.load = false;
    switch (msj1) {
      case 'Confirmación' :
        return this.msj.mensajeConfirmacion(msj1, msj2);
      case 'Advertencia' : 
        return this.msj.mensajeAdvertencia(msj1, msj2);
      case 'Error' : 
        return this.msj.mensajeError(msj1, msj2);
      default :
        return this.msj.mensajeAdvertencia(`No hay un tipo de mensaje asociado!`); 
    }
  }

  createPDF(id : number, action : string) {
    this.svDetailsPreload.getPreloadId(id).subscribe(data => {
      let title: string = `Orden de Precargue N° ${id}`;
      let content: any[] = this.contentPDF(data);
      this.svPDF.formatoPDF(title, content);
      this.msjs(`Confirmación`, `Orden de precargue N° ${id} ${action} exitosamente!`);
      setTimeout(() => this.clearAll(), 3000);
    }, error => this.msjs(`Error`, `Error al consultar la orden de precargue N° ${id} | ${error.status} ${error.statusText}`));
  }

  contentPDF(data): any[] {
    let content: any[] = [];
    let consolidatedInformation: Array<any> = this.getInfoGroupedPDF(data);
    let informationProducts: Array<any> = this.getInfoDetailsPDF(data);
    content.push(this.infoMovementPDF(data[0]));
    content.push(this.tablaGroupedPDF(consolidatedInformation));
    content.push(this.tableTotals(consolidatedInformation))
    content.push(this.tablaDetailsPDF(informationProducts));
    return content;
  }

  getInfoGroupedPDF(data: any): Array<any> {
    let info: Array<any> = [];
    let contador: number = 0;
    data.forEach(d => {
      if (!info.map(x => x.Item).includes(d.item)) {
        contador++;
        let cantRegistros : number = data.filter(x => x.item == d.item).length;
        let quantity: number = 0;
        let weight: number = 0;
        data.filter(x => x.item == d.item).forEach(x => {
          weight += x.weight,
          quantity += x.qty
        });
        info.push({
          "#": contador,
          "Item": d.item,
          "Referencia": d.reference,
          "Rollos" : cantRegistros,
          "Peso": weight.toFixed(2),
          "Cantidad" : quantity.toFixed(2),
          "Und" : d.und,
        });
      }
    });
    return info;
  }

  getInfoDetailsPDF(data: any): Array<any> {
    let info: Array<any> = [];
    let count: number = 0;

    data.forEach(d => {
      count++;
      info.push({
        "#": count,
        "Rollo": d.roll,
        "OT": d.ot,
        "Item": d.item,
        "Referencia": d.reference,
        "Peso": d.weight,
        "Cantidad" : d.qty, 
        "Und" : d.und,
      });
    });
    return info;
  }

  //Función que muestra una tabla con la información general del ingreso.
  infoMovementPDF(data : any): {} {
    let date1 : any = data.date1.replace('T00:00:00', '');
    let date2 : any = data.date2.replace('T00:00:00', '');
    return {
      margin : [0, 0, 0, 20],
      table: {
        widths: ['34%', '33%', '33%'],
        body: [
          [
            { text: `Información general del movimiento`, colSpan: 3, alignment: 'center', fontSize: 10, bold: true }, {}, {}
          ],
          [
            { text: `Orden Fact.: ${data.of == 4472 ? '' : data.of}`}, 
            { text: `Usuario ingreso: ${data.user1}` },
            { text: `Fecha ingreso: ${data.date1.replace('T00:00:00', '')} ${data.hour1}` },
          ],
          [
            { text: `Estado: ${data.status}`}, 
            { text: `Usuario Modifica: ${data.user2 == 0 ? '' : data.user2}` },
            { text: `Fecha Modifica: ${date1 == date2 ? '' : date2} ${data.hour1 == data.hour2 ? '' : data.hour2}` },
          ],
          [
            { text: `Observación Precargue: ${data.observation1 == null ? '' : data.observation1}`, colSpan: 3, fontSize: 9, }, {}, {}
          ],
          [
            { text: `Observación Orden Fact.: ${data.observation2 == null ? '' : data.observation2}`, colSpan: 3, fontSize: 9, }, {}, {}
          ], 
        ]
      },
      fontSize: 9,
      layout: {
        fillColor: function (rowIndex) {
          return (rowIndex == 0) ? '#DDDDDD' : null;
        }
      }
    }
  }

  //Función que consolida la información por mat. primas
  tablaGroupedPDF(data) {
    let columns: Array<string> = ['#', 'Item', 'Referencia', 'Rollos', 'Peso', 'Cantidad', 'Und'];
    let widths: Array<string> = ['5%', '10%', '45%', '10%', '10%', '10%', '10%'];
    return {
      table: {
        headerRows: 2,
        widths: widths,
        body: this.buildTableBody1(data, columns, 'Consolidado de rollos precargados por Item'),
      },
      fontSize: 8,
      layout: {
        fillColor: function (rowIndex) {
          return (rowIndex <= 1) ? '#DDDDDD' : null;
        }
      }
    };
  }

  //Tabla con materiales recuperados ingresados detallados
  tablaDetailsPDF(data) {
    let columns: Array<string> = ['#', 'Rollo', 'OT', 'Item', 'Referencia', 'Peso', 'Cantidad', 'Und'];
    let widths: Array<string> = ['5%', '9%', '9%', '8%', '45%', '8%', '10%', '6%'];
    return {
      margin: [0, 20],
      table: {
        headerRows: 2,
        widths: widths,
        body: this.buildTableBody2(data, columns, 'Información detallada de rollos precargados'),
      },
      fontSize: 8,
      layout: {
        fillColor: function (rowIndex) {
          return (rowIndex <= 1) ? '#DDDDDD' : null;
        }
      }
    };
  }

  //Tabla con los valores totales de pesos y registros
  tableTotals(data : any){
    return {
      fontSize: 8,
      bold: false,
      table: {
        widths: ['5%', '10%', '45%', '10%', '10%', '10%', '10%'],
        body: [
          [
            { text: ``, bold : true, border: [true, false, false, true], },
            { text: ``, bold : true, border: [false, false, false, true], },
            { text: `Totales`, alignment: 'right', bold : true, border: [false, false, true, true], },
            { text: `${this.formatonumeros((data.reduce((a, b) => a += parseInt(b.Rollos), 0)))}`, bold : true, border: [false, false, true, true], },
            { text: `${this.formatonumeros((data.reduce((a, b) => a += parseFloat(b.Peso), 0)).toFixed(2))}`, bold : true, border: [false, false, true, true], },
            { text: `${this.formatonumeros((data.reduce((a, b) => a += parseFloat(b.Cantidad), 0)).toFixed(2))}`, bold : true, border: [false, false, true, true], },
            { text: ``, bold : true, border: [false, false, true, true], },
          ],
        ],
      }
    }
  }

  buildTableBody1(data, columns, title) {
    var body = [];
    body.push([{ colSpan: 7, text: title, bold: true, alignment: 'center', fontSize: 10 }, '', '', '', '', '', '']);
    body.push(columns);
    data.forEach(function (row) {
      var dataRow = [];
      columns.forEach((column) => dataRow.push(row[column].toString()));
      body.push(dataRow);
    });
    return body;
  }

  buildTableBody2(data, columns, title) {
    var body = [];
    body.push([{ colSpan: 8, text: title, bold: true, alignment: 'center', fontSize: 10 }, '', '', '', '', '', '', '',]);
    body.push(columns);
    data.forEach(function (row) {
      var dataRow = [];
      columns.forEach((column) => dataRow.push(row[column].toString()));
      body.push(dataRow);
    });
    return body;
  }
}
