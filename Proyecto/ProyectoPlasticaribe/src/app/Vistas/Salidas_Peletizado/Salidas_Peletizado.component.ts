import { Component, Injectable, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { Table } from 'primeng/table';
import { AppComponent } from 'src/app/app.component';
import { modelDetalles_SalidasPeletizado } from 'src/app/Modelo/modelDetalles_SalidasPeletizado';
import { modelSalidas_Peletizado } from 'src/app/Modelo/modelSalidas_Peletizado';
import { CreacionPdfService } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';
import { Detalles_SalidasPeletizadoService } from 'src/app/Servicios/Detalles_SalidasPeletizado/Detalles_SalidasPeletizado.service';
import { Ingreso_PeletizadoService } from 'src/app/Servicios/Ingreso_Peletizado/Ingreso_Peletizado.service';
import { MateriaPrimaService } from 'src/app/Servicios/MateriaPrima/materiaPrima.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { Salidas_PeletizadoService } from 'src/app/Servicios/Salidas_Peletizado/Salidas_Peletizado.service';
import { UnidadMedidaService } from 'src/app/Servicios/UnidadMedida/unidad-medida.service';

@Injectable({
  providedIn : 'root'
})

@Component({
  selector: 'app-Salidas_Peletizado',
  templateUrl: './Salidas_Peletizado.component.html',
  styleUrls: ['./Salidas_Peletizado.component.css']
})

export class Salidas_PeletizadoComponent implements OnInit {

  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  load : boolean = false;
  presentations : any = []; 
  form !: FormGroup;
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  recoveries : Array<any> = [];
  peletsAvailables : Array<any> = [];
  peletsSelected : Array<any> = [];
  peletsConsolidated : Array<any> = [];
  peletsAvailablesGrouped : Array<any> = [];
  peletsComplete : Array<any> = [];
  @ViewChild('dt1') dt1 : Table | undefined;
  @ViewChild('dt2') dt2 : Table | undefined;
  @ViewChild('dt3') dt3 : Table | undefined;
  fieldFocus : boolean = false;

  constructor(private AppComponent : AppComponent, 
    private frmBuilder : FormBuilder,
    private msj : MensajesAplicacionService,
    private svEntryPeletizado : Ingreso_PeletizadoService, 
    private svRecoveries : MateriaPrimaService, 
    private svPresentations : UnidadMedidaService,
    private svOutputsPeletizado : Salidas_PeletizadoService,
    private svDetailsOutputsPeletizado : Detalles_SalidasPeletizadoService,
    private svPDF : CreacionPdfService,
  ) { 
      this.modoSeleccionado = this.AppComponent.temaSeleccionado;
      this.loadForm();
  }

  ngOnInit() {
    this.lecturaStorage();
    this.getRecoveries();
    this.getPresentations();
    console.clear()
  }

  lecturaStorage() {
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  loadForm(){
    this.form = this.frmBuilder.group({
      recoveryId : [null, Validators.required],
      recovery : [null, Validators.required],
      qty : [25, Validators.required],
      presentation : [null, Validators.required],
      observation : [null],
    });
  }

  clearFields(){
    this.load = false;
    this.form.reset();
    this.form.patchValue({ qty : 25, presentation : 'Kg' });
  }

  clearAll(){
    this.load = false;
    this.form.reset();
    this.peletsAvailables = [];
    this.peletsSelected = [];
    this.peletsConsolidated = [];
    this.form.patchValue({ qty : 25, presentation : 'Kg' });
    this.peletsAvailablesGrouped = [];
  }

  getRecoveries = () => this.svRecoveries.srvObtenerLista().subscribe(data => { this.recoveries = data.filter(x => [10,4].includes(x.catMP_Id)) }, error => { this.msj.mensajeError(`Error al consultar las materias primas. | ${error.status} ${error.statusText}`); });
  
  getPresentations = () => this.svPresentations.srvObtenerLista().subscribe(data => this.presentations = data.filter(x => ['Kg'].includes(x.undMed_Id)), error => { this.msj.mensajeError(`Error al consultar las presentaciones. | ${error.status} ${error.statusText}`); })

  //Función para mostrar el mostrar el nombre de la materia prima en el campo
  selectRecoveries(){
    let mp : any = this.form.value.recovery;
    this.form.patchValue({ 'recoveryId': mp, 'recovery' : this.recoveries.find(x => x.matPri_Id == mp).matPri_Nombre });
  }

  searchPeletizado(){
    this.peletsAvailables = [];
    this.peletsSelected = [];
    this.peletsConsolidated = [];
    this.peletsAvailablesGrouped = [];
    this.fieldFocus = false;

    if(this.form.valid) {
      if(this.form.value.qty <= 0) {
        this.msj.mensajeAdvertencia(`La cantidad de recuperado no puede ser menor o igual a 0`);
        return;
      }
      let mp : number = this.form.value.recoveryId;
      this.load = true;
      this.svEntryPeletizado.getStockPele_Details(mp).subscribe(data => {
        this.loadDataTable(data);
      }, error => {
        error.status == 400 ? this.msj.mensajeAdvertencia(`No se encontraron registros de peletizado asociados a ${this.form.value.recovery}`) : this.msj.mensajeError(`Error consultando ${this.form.value.recovery} en la bodega de Peletizado | ${error.status}`);
        this.load = false;
      });
    } else this.msj.mensajeAdvertencia(`Debe llenar los campos requeridos`);
  }

  loadDataTable(data : any){
    data.forEach(x => {
      this.peletsAvailables.push({
        'code' : x.entries.ingPel_Id,
        'typeRecovery' : x.type_Recovery.id,
        'roll' : x.entries.rollo_Id,
        'ot' : x.entries.ot, 
        'item' : x.product.item,
        'reference' : x.product.reference,
        'weight' : x.entries.ingPel_Cantidad,
        'weight2' : x.entries.ingPel_Cantidad,
        'material' : x.material.material,
        'idMatPrima' : x.matPrimas.id,
        'matPrima' : x.matPrimas.matPrima, 
        'status' : x.statuses.id,
        'statusName' : x.statuses.status,
        'unit' : x.matPrimas.presentation, 
      });
    });
    //this.peletsComplete = this.peletsAvailables;
    //console.log(this.peletsAvailables);
    this.consolidatePeletizado();
    this.load = false;
  }

  onFocus = () => this.fieldFocus = true;

  outFocus(qty : number, qty2 : number) {
    this.consolidatePeletizado();
    if(qty <= qty2) {
      return this.fieldFocus = false;
    } else {
      return this.fieldFocus = true;
    } 
  }

  //!
  selectPeletizados(data){
    this.load = true;
    let index : number = this.peletsAvailables.findIndex(x => x.code == data.code);
    this.peletsAvailables.splice(index, 1);
    this.consolidatePeletizado();
    setTimeout(() => this.load = false, 50);
  }

  //!
  deselectPeletizados(data){
    this.load = true;
    let index : number = this.peletsSelected.findIndex(x => x.code == data.code);
    this.peletsAvailables.splice(index, 1);
    this.consolidatePeletizado();
    setTimeout(() => this.load = false, 50);
  }

  //!
  selectAllPeletizados(){
    this.load = true;
    this.peletsSelected = this.peletsSelected.concat(this.peletsAvailables);
    this.peletsAvailables = [];
    this.consolidatePeletizado();
    setTimeout(() => this.load = false, 50);
  }

  //!
  deselectAllPeletizados(){
    this.load = true;
    this.peletsAvailables = this.peletsAvailables.concat(this.peletsSelected);
    this.peletsSelected = [];
    this.consolidatePeletizado();
    setTimeout(() => this.load = false, 50);
  }

  consolidatePeletizado(){
    this.peletsConsolidated = this.peletsAvailables.reduce((array, object) => {
      let info : any = {
        'id' : object.idMatPrima, 
        'material' : object.matPrima, 
        'qty' : object.weight, 
        'qty2' : object.weight2,
        'presentation' : object.unit, 
        'category' : 'RECUPERADO', 
      }  
      const searchedObject = array.find(x => x.id == info.id);
      if(searchedObject) {
        searchedObject.qty += info.qty;
        searchedObject.qty2 += info.qty2;
        searchedObject.quantity += info.quantity;
        searchedObject.merma1 += info.merma1;
        searchedObject.merma2 += info.merma2;        
      } else array.push(info);
      return array;
    }, []);
  }

  //Validar campos para crear la entrada/salida 
  validateFields(){
    if(this.form.valid) {
      if(this.peletsConsolidated.length > 0) {
        if(this.form.value.recoveryId == this.peletsConsolidated[0].id) {
          if(this.form.value.qty > this.peletsConsolidated[0].qty) {
            this.msj.mensajeAdvertencia(`Advertencia`, `La cantidad de recuperado no puede ser mayor a ${this.peletsConsolidated[0].qty}`);
            return;
          }
          if(this.form.value.qty <= 0) {
            this.msj.mensajeAdvertencia(`Advertencia`, `La cantidad de recuperado no puede ser menor a 0`);
            return;
          }
          this.saveHeaderOutput();
        } else this.msj.mensajeAdvertencia(`Advertencia`, `El material de la tabla debe coincidir con el del campo 'recuperado' del formulario`);
      } else this.msj.mensajeAdvertencia(`Advertencia`, `Debe cargar mínimo un registro de peletizado en la tabla!`);
    }  else this.msj.mensajeAdvertencia(`Advertencia`, `Hay campos vacíos en el formulario!`);
  }

  //Guardar encabezado de peletizado.
  saveHeaderOutput(){
    this.load = true;
    let output : modelSalidas_Peletizado = {
      'MatPri_Id': this.form.value.recoveryId,
      'SalPel_Peso': this.form.value.qty,
      'Usua_Id': this.storage_Id,
      'SalPel_Fecha': moment().format('YYYY-MM-DD'),
      'SalPel_Hora': moment().format('HH:mm:ss'),
      'SalPel_FechaAprobado': moment().format('YYYY-MM-DD'),
      'SalPel_HoraAprobado': moment().format('HH:mm:ss'),
      'Estado_Id': 11,
      'SalPel_Observacion': this.form.value.observation,
      'Usua_Aprueba': 0,
      'UndMed_Id': 'Kg',
    }
    this.svOutputsPeletizado.Post(output).subscribe(data => { this.calculatePeleToAssign(data.salPel_Id); }, error => {
      this.msj.mensajeError(`Error`, `No se pudo crear la salida de peletizado`);
      this.load = false;
    });
  }

  //Calcular peletizado a asignar. 
  calculatePeleToAssign(idOutput : number){
    let recoveries : any = [];
    let qtySelected : number = this.form.value.qty; //this.peletsConsolidated[0].qty; 
    let rest : number = this.peletsConsolidated[0].qty; 
    let currentQty : number = 0; 
    
    for (let index = 0; index < this.peletsAvailables.length; index++) {
      const x = this.peletsAvailables[index];
      currentQty += x.weight; //50 
      console.log(currentQty, qtySelected);
      if(currentQty <= qtySelected) { //50 <= 150 SI // 25 <= 100 SI // 75 <= 40 SI // 60 <= 35 NO
        console.log(1);
        recoveries.push({'code' : x.code, 'quantity' : x.weight, 'typeRecovery' : x.typeRecovery, 'unit' : x.unit }); //50 //25 //40
        currentQty -= x.weight;  // 50 - 50 = 0   // 25 - 25 = 0    // 40 - 40 = 0   // 
        qtySelected -= x.weight; //150 - 50 = 100 // 100 - 25 = 75  // 75 - 40 = 35  //
        rest -= x.weight;        //207 - 50 = 157 // 157 - 25 = 132 // 132 - 40 = 92 //
        if(qtySelected <= 0) break;
      } else {
        console.log(2);
        recoveries.push({'code' : x.code, 'quantity' : qtySelected, 'typeRecovery' : x.typeRecovery, 'unit' : x.unit });
        currentQty -= x.weight;  // 60 - 35 = 25 //
        qtySelected -= x.weight; // 35 - 60 = -25
        rest -= x.weight;
        if(qtySelected <= 0) break;
      }
    }
    console.log(recoveries);
    this.saveDetailsOutput(idOutput, recoveries);
  }

  //Guardar detalles de la salida.
  saveDetailsOutput(idOutput : number, recoveries){
    let count : number = 0;

    recoveries.forEach(x => {
      let details : modelDetalles_SalidasPeletizado = {
        'SalPel_Id': idOutput,
        'IngPel_Id': x.code,
        'TpRecu_Id': x.typeRecovery,
        'DtSalPel_Peso': x.quantity,
        'UndMed_Id': x.unit
      }
      this.svDetailsOutputsPeletizado.Post(details).subscribe(data => {
        count++;
        if(recoveries.length == count) this.updateStatusEntryPele(idOutput, recoveries);
      }, error => {
        this.msj.mensajeError(`Error`, `No se pudo crear el detalle de la salida de peletizado`);
        this.load = false;
      });
    });
  }

  //Actualizar estado de los recuperados seleccionados.
  updateStatusEntryPele(idOutput : number, recoveries : any){
    this.svEntryPeletizado.putEntryPeletizado(recoveries).subscribe(data => {
      this.createPDF(idOutput, `creada`);
    }, error => { 
      this.msj.mensajeError(`Error`, `Error al intentar actualizar el estado de los recuperados seleccionados`); 
      this.load = false;
    });
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatNumbers = (number) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

  //*FUNCIONES PARA EXPORTAR PDF.
  //Función para crear un PDF en base al registro creado.
  createPDF(idOutput : number, action? : string) {
    this.svOutputsPeletizado.GetId(idOutput).subscribe(data => {
      let title: string = `Salida de Peletizado N° ${idOutput}`;
      let content: any[] = this.contentPDF(data);
      this.svPDF.formatoPDF(title, content);
      this.msj.mensajeConfirmacion(`Confirmación`, `Salida de Peletizado ${action} exitosamente!`);
      setTimeout(() => { this.clearAll() } , 3000);
    }, error => this.msj.mensajeError(`Error`, `Error al consultar la salida de peletizado N° ${idOutput} | ${error.status} ${error.statusText}`));
  }

  //Función para colocar la información registrada en el PDF.
  contentPDF(data): any[] {
    let content: any[] = [];
    let consolidatedInformation: Array<any> = this.consolidatedInfoPDF(data);
    let informationProducts: Array<any> = this.getInfoMaterialsPDF(data);
    content.push(this.infoMovementPDF(data[0]));
    content.push(this.infoMaterialRecovery(data[0]))
    content.push(this.tableConsolidatedPDF(consolidatedInformation));
    content.push(this.tableTotals(consolidatedInformation))
    content.push(this.tableMaterialsPDF(informationProducts));
    return content;
  }

  //Funcion para colocar el encabezado de los materiales en la tabla 1
  consolidatedInfoPDF(data: any): Array<any> {
    let consolidatedInfo: Array<any> = [];
    let count: number = 0;
    data.forEach(d => {
      if (!consolidatedInfo.map(x => x.Recuperado).includes(d.details_Ouptuts.tpRecu_Id)) {
        count++;
        let qtyRecords : number = data.filter(x => x.details_Ouptuts.tpRecu_Id == d.details_Ouptuts.tpRecu_Id).length;
        let totalWeight: number = 0;
        data.filter(x => x.details_Ouptuts.tpRecu_Id == d.details_Ouptuts.tpRecu_Id).forEach(x => totalWeight += x.details_Ouptuts.dtSalPel_Peso);
        consolidatedInfo.push({
          "#": count,
          "Codigo": d.details_Ouptuts.ingPel_Id,
          "Recuperado": d.details_Ouptuts.tpRecu_Id,
          "Registros": qtyRecords,
          "Peso": this.formatNumbers((totalWeight).toFixed(2)),
          "Presentación": d.details_Ouptuts.undMed_Id
        });
      }
    });
    return consolidatedInfo;
  }

  //Funcion para colocar los detalles de los materiales en la tabla 2 
  getInfoMaterialsPDF(data: any): Array<any> {
    let infoProducts: Array<any> = [];
    let count: number = 0;
    data.forEach(d => {
      count++;
      infoProducts.push({
        "#": count,
        "Codigo": d.details_Ouptuts.ingPel_Id,
        "Recuperado": d.type_Recovery,
        'Bulto' : d.roll,
        'OT' : d.ot,
        "Peso": this.formatNumbers((d.details_Ouptuts.dtSalPel_Peso).toFixed(2)),
        "Presentación" : d.details_Ouptuts.undMed_Id,
      });
    });
    return infoProducts;
  }

  //Función que muestra una tabla con la información general del ingreso.
  infoMaterialRecovery(data : any): {} {
    return {
      margin : [0, 0, 0, 15],
      table: {
        widths: ['15%', '50%', '15%', '20%'],
        body: [
          [
            { text: `Materia prima recuperada`, colSpan: 4, alignment: 'center', fontSize: 10, bold: true }, {}, {}, {}
          ],
          [
            { text: `Id: ${data.outputs.matPri_Id}` },
            { text: `Mat. Prima: ${data.matPrima}` },
            { text: `Cantidad: ${data.outputs.salPel_Peso}` },
            { text: `Presentacion: ${'Kg'}` },
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

  //Función que muestra una tabla con la información general del ingreso.
  infoMovementPDF(data : any): {} {
    console.log(data);
    return {
      margin : [0, 0, 0, 30],
      table: {
        widths: ['34%', '33%', '33%'],
        body: [
          [
            { text: `Información general del movimiento`, colSpan: 3, alignment: 'center', fontSize: 10, bold: true }, {}, {}
          ],
          [
            { text: `Usuario ingreso: ${data.userName}` },
            { text: `Fecha ingreso: ${data.outputs.salPel_Fecha.replace('T00:00:00', '')}` },
            { text: `Hora ingreso: ${data.outputs.salPel_Hora}` },
          ],
          [
            { text: `Usuario modificación: ${data.outputs.salPel_Hora != data.outputs.salPel_HoraAprobado ? data.userName : ''}`, }, 
            { text: `Fecha modificación: ${data.outputs.salPel_Hora != data.outputs.salPel_HoraAprobado ? data.outputs.salPel_FechaAprobado.replace('T00:00:00', '') : ''}`, }, 
            { text: `Hora modificación: ${data.outputs.salPel_Hora != data.outputs.salPel_HoraAprobado ? data.outputs.salPel_HoraAprobado : ''}`, } 
          ], 
          [
            { text: `Estado: ${data.status}`},
            { text: `Observación: ${data.outputs.salPel_Observacion == null ? '' : data.outputs.salPel_Observacion}`, colSpan: 2, fontSize: 9 }, {}, 
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
  tableConsolidatedPDF(data) {
    let columns: Array<string> = ['#', 'Codigo', 'Recuperado', 'Registros', 'Peso', 'Presentación'];
    let widths: Array<string> = ['10%', '10%', '40%', '15%', '15%', '10%'];
    return {
      table: {
        headerRows: 2,
        widths: widths,
        body: this.buildTableBody1(data, columns, 'Consolidado de salida de tipos de recuperados '),
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
  tableMaterialsPDF(data) {
    let columns: Array<string> = ['#', 'Codigo', 'Recuperado', 'Bulto', 'OT', 'Peso', 'Presentación'];
    let widths: Array<string> = ['10%', '10%', '40%', '10%', '10%', '10%', '10%'];
    return {
      margin: [0, 10],
      table: {
        headerRows: 2,
        widths: widths,
        body: this.buildTableBody2(data, columns, 'Detalles de tipos de recuperado seleccionados'),
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
        widths: ['10%', '10%', '40%', '15%', '15%', '10%'],
        body: [
          [
            { text: ``, bold : true, border: [true, false, false, true], },
            { text: ``, bold : true, border: [false, false, true, true], },
            { text: `Totales`, alignment: 'right', bold : true, border: [false, false, true, true], },
            { text: `${this.formatNumbers((data.reduce((a, b) => a += parseInt(b.Registros), 0)))}`, bold : true, border: [false, false, true, true], },
            { text: `${this.formatNumbers((data.reduce((a, b) => a += parseFloat(b.Peso.replaceAll(',', '')), 0)).toFixed(2))}`, bold : true, border: [false, false, true, true], },
            { text: `Kg`, bold : true, border: [false, false, true, true], },
          ],
        ],
      }
    }
  }

  buildTableBody1(data, columns, title) {
    var body = [];
    body.push([{ colSpan: 6, text: title, bold: true, alignment: 'center', fontSize: 10 }, '', '', '', '', '']);
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
    body.push([{ colSpan: 7, text: title, bold: true, alignment: 'center', fontSize: 10 }, '', '', '', '', '', '']);
    body.push(columns);
    data.forEach(function (row) {
      var dataRow = [];
      columns.forEach((column) => dataRow.push(row[column].toString()));
      body.push(dataRow);
    });
    return body;
  }

  //!
  weightTypesRecoveries = (data) => this.peletsSelected.filter(x => x.typeRecovery == data.typeRecovery).reduce((a, b) => a += b.weight, 0);

  //!
  qtyTypesRecoveries = (data) => this.peletsSelected.filter(x => x.typeRecovery == data.typeRecovery).length;

  //!
  weightTotal = () => this.peletsSelected.reduce((a, b) => a += b.weight, 0);

  //!
  qtyTotal = () => this.peletsSelected.length;

  applyFilter = ($event, campo : any, table : any) => table!.filter(($event.target as HTMLInputElement).value, campo, 'contains');
}
