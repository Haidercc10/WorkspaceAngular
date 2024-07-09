import { Component, Injectable, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { clear, error, log } from 'console';
import { create } from 'domain';
import moment from 'moment';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { CreacionPdfService } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';
import { FallasTecnicasService } from 'src/app/Servicios/FallasTecnicas/FallasTecnicas.service';
import { Ingreso_PeletizadoService } from 'src/app/Servicios/Ingreso_Peletizado/Ingreso_Peletizado.service';
import { MatPrima_Material_PigmentoService } from 'src/app/Servicios/MatPrima_Material_Pigmento/MatPrima_Material_Pigmento.service';
import { MateriaPrimaService } from 'src/app/Servicios/MateriaPrima/materiaPrima.service';
import { MaterialProductoService } from 'src/app/Servicios/MaterialProducto/materialProducto.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { ProcesosService } from 'src/app/Servicios/Procesos/procesos.service';
import { ProductoService } from 'src/app/Servicios/Productos/producto.service';
import { TipoRecuperadoService } from 'src/app/Servicios/TipoRecuperado/tipoRecuperado.service';
import { UnidadMedidaService } from 'src/app/Servicios/UnidadMedida/unidad-medida.service';
import { AppComponent } from 'src/app/app.component';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-Ingreso_Peletizado',
  templateUrl: './Ingreso_Peletizado.component.html',
  styleUrls: ['./Ingreso_Peletizado.component.css']
})
export class Ingreso_PeletizadoComponent implements OnInit {

  load : boolean = false; //Variable que servirá para mostrar el spinner de carga
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  form !: FormGroup; //Variable que contiene el formulario
  materials : any = [];
  typesRecovery : any = [];
  fails : any = [];
  process : any = [];
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  presentations : Array<string> = [];
  matPrimas : any = [];
  products : any = [];  
  modalFails : boolean = false;
  recoveries : Array<modelIngreso_Peletizado> = [];
  productSelected : number; 
  @ViewChild('dt') dt : Table | undefined; 
  indexTable : number = null;
  rolls : any = [];
  typeRecoveries : any = [];
  disableField : boolean = true;
  failsProcess : any = [];

  constructor(private AppComponent : AppComponent, 
    private svMaterials : MaterialProductoService, 
    private svTypesRecovery : TipoRecuperadoService,
    private svFails : FallasTecnicasService,
    private FrmBuilder : FormBuilder,
    private svMsjs : MensajesAplicacionService,
    private svProcess : ProcesosService,
    private svMatPrimas : MateriaPrimaService,
    private svProducts : ProductoService,
    private svUnits : UnidadMedidaService,
    private svBagpro : BagproService,
    private svIngPeletizado : Ingreso_PeletizadoService,
    private svPDF : CreacionPdfService,
    private svMsg : MessageService,
    private svPeleMaterialPigmto : MatPrima_Material_PigmentoService,
  ) { 
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
    this.initForm();
  }

  ngOnInit() {
    this.lecturaStorage();
    this.getMaterials();
    this.getFails();
    this.getProcess();
    this.getUnits();
    //this.getMatPrimas();
    //this.createPDF('2024-06-13', '2024-06-13', '14:55:49', 'creada');
  }

  formatNumbers = (number) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

  //Función para inicializar el formulario.
  initForm(){
    this.form = this.FrmBuilder.group({
      ot : [null],
      roll : [null],
      material : [null, Validators.required],
      typeRecovery : [null, Validators.required],
      fail : [null, Validators.required],
      quantity : [null, Validators.required],
      observation : [null], 
      process : [null, Validators.required],
      item : [null, Validators.required],
      product : [null, Validators.required], 
      mpId : [null, Validators.required],
      matprima : [null, Validators.required],
    });
    this.disableForm();
  }

  //Función para deshabilitar el formulario, excepto el campo proceso.
  disableForm(){
    this.form.disable();
    this.form.get('process')?.enable();
  }

  //Habilitar tipo de recuperado y no conformidad
  enableTypeRecovery() {
    this.getTypesRecovery(this.validateOptions(this.form.value.process));
    this.form.get('typeRecovery')?.enable();
    this.fails = this.failsProcess;
    this.fails = this.fails.filter(x => x.tipoFalla_Id == this.changeFailsForProcess(this.form.value.process));
  } 

  //Habilitar formulario 
  enableForm() {
    this.form.enable();
    this.form.get('roll')?.reset();
  }

  //Función para obtener los diferentes tipos de materiales. 
  getMaterials = () => this.svMaterials.srvObtenerLista().subscribe(data => { this.materials = data }, error => { this.svMsjs.mensajeError(`Error`, `Error al consultar los materiales. | ${error}`); });

  //Función para obtener los tipos de recuperado
  getTypesRecovery = (types : any[]) => this.svTypesRecovery.GetTodo().subscribe(data => { this.typesRecovery = data.filter(x => types.includes(x.tpRecu_Id)) }, error => { this.svMsjs.mensajeError(`Error`, `Error al consultar los tipos de recuperados. | ${error}`); });

  //Función para obtener los tipos de fallas/no conformidades. 
  getFails = () => this.svFails.srvObtenerLista().subscribe(data => { this.failsProcess = data.filter(x => [16,17,18,19,20].includes(x.tipoFalla_Id)) }, error => { this.svMsjs.mensajeError(`Error`, `Error al consultar las no conformidades. | ${error}`); });

  //Función para obtener los procesos.
  getProcess = () => this.svProcess.srvObtenerLista().subscribe(data => { this.process = data.filter(x => [3,4,15,2,1].includes(x.proceso_Codigo)) }, error => { this.svMsjs.mensajeError(`Error`, `Error al consultar los procesos. | ${error}`); });

  //Función para obtener las diferentes presentaciones
  getUnits = () => this.svUnits.srvObtenerLista().subscribe(data => { this.presentations = data.filter(x => x.undMed_Id == 'Kg'); }, error => { this.svMsjs.mensajeError(`Error`, `Error al consultar las presentaciones. | ${error}`); })

  //Función para obtener las materias primas.
  //getMatPrimas = () => this.svMatPrimas.srvObtenerLista().subscribe(data => { this.matPrimas = data.filter(x => [10,4].includes(x.catMP_Id)) }, error => { this.svMsjs.mensajeError(`Error`, `Error al consultar las materias primas. | ${error}`); });
 
  getPeletizadosForMaterial(material : any) {
    this.matPrimas = [];
    this.svMatPrimas.getPeletizados().subscribe(data => { 
      if(data.length > 0) {
        this.matPrimas = data.filter(x => x.matPrima.includes(material)); 
        if(this.matPrimas.length > 0) {
          this.form.patchValue({'mpId' : null, 'matprima' : null})
          this.msjs(`Advertencia`, `Debe asociar una materia prima recuperada de la lista!`);
        } else this.msjs(`Advertencia`, `No se encontró un peletizado asociado al material ${material}`);
      } else this.msjs(`Advertencia`, `No se encontraron peletizados!`);
    }, error => { 
      this.msjs(`Error`, `Error al consultar los materiales recuperados. | ${error.status} ${error.statusText}`); 
    });
  }

  getPeletizadosForParameters(info : any){
    this.svPeleMaterialPigmto.getPeletizadoForMaterialPigment(parseInt(info.id_Material), parseInt(info.id_Pigmento_Extrusion)).subscribe(data => {
      if(data.length > 0) this.form.patchValue({ 'mpId' : data[0].id, 'matprima' : data[0].matPrima, });
      else {
        this.getPeletizadosForMaterial(info.material.trim())
        //this.msjs(`Advertencia`, `No se encontró un peletizado asociado al material ${info.material} y pigmento ${info.pigmento_Extusion}, por favor elija uno del listado!`);
      } 
    }, error => {
      console.log(error);
    });
  }
  
  //Función para mostrar el mostrar el nombre de la materia prima en el campo
  selectMatPrimas(){
    let mp : any = this.form.value.matprima;
    this.form.patchValue({ 'mpId': mp, 'matprima' : this.matPrimas.find(x => x.id == mp).matPrima });
  }

  //Función para obtener los productos
  getProduct() {
    let nombre: string = this.form.value.product;
    this.svProducts.obtenerItemsLike(nombre).subscribe(data => { this.products = data; });
  }

  //Función para seleccionar los productos
  selectProduct(typeSearch? : string) {
    let product: any = typeSearch == 'roll' ? this.form.value.item : this.form.value.product;
    let index : number = this.products.findIndex(x => x.prod_Id == product);
    
    this.form.patchValue({ 'item': product, 'product': this.products[index].prod_Nombre });
  }

  //Función para obtener datos de la OT
  getOrderProduction(){
    let ot : any = this.form.value.ot;
    let typeRecovery : any = this.form.value.typeRecovery;
    this.load = true;

    if(typeRecovery != null) {
      if(![null, undefined, ''].includes(ot)) {
        if(ot.toString().length > 5) {
          this.svBagpro.GetOrdenTrabajo(ot).subscribe(data => {
            this.loadFieldsForOT(data[0]);
          }, error => { 
            this.msjs(`Error`, `${error.error}`);
            this.clearSoloFields(); 
          });
        } else this.msjs(`Advertencia`, `La orden de trabajo no puede tener menos de 6 digitos!`);
      } else this.msjs(`Advertencia`, `Debe seleccionar el tipo de recuperado!`);
    } else this.msjs(`Advertencia`, `Orden de trabajo no válida!`);
  }

  //Cargar campos en función de los datos la OT. 
  loadFieldsForOT(data : any){
    //console.log(this.matPrimas.filter(x => x.matPri_Nombre.includes(data.material)));
    this.getPeletizadosForParameters(data);
    this.form.patchValue({
      'item' :  data.id_Producto, 
      'product' : data.producto,
      'material' : parseInt(data.id_Material),
    });
    this.load = false;
  }

  clearSoloFields(){
    this.form.patchValue({
      ot : null,
      roll : null,
      material : null,
      fail : null,
      quantity : null,
      observation : null, 
      item : null,
      product : null, 
      mpId : null,
      matprima : null,
    });
    this.disableField = false;
  }

  //
  getRollProduction(){
    let roll : any = this.form.value.roll;
    let process : string = this.form.value.process;
    let url : string = ``;
    this.load = true;

    if(process != null) url = `?process=${this.changeNameProcess(process)}`

    if(![null, undefined, ''].includes(roll)) {
      this.svBagpro.getRollProduction(roll, url).subscribe(data => {
        if(![null, undefined, ''].includes(data)) {
          this.loadFieldsForRoll(data);
        } else this.msjs(`Advertencia`, `No se encontró información del rollo/bulto N°${roll} en el proceso de ${this.changeNameProcess(process)}`);
      }, error => { this.msjs(`Error`, `Error al consultar el Rollo N° ${roll} | ${error.error}`); });
    } else this.msjs(`Advertencia`, `Debe diligenciar el número del bulto/rollo`);
  }

  //
  loadFieldsForRoll(data : any){
    this.load = false;
    this.getPeletizadosForParameters(data);
    this.form.patchValue({
      'ot' : data.ot,
      'item' : data.item, 
      'product' : data.referencia,
      'material' : data.id_Material,
    });
    this.getProduct();
  }

  //
  changeNameProcess(process : string){
    switch (process) {
      case 'EXT' :
        return 'EXTRUSION';
      case 'IMP' :
        return 'IMPRESION';
      case 'LAM' :
        return 'LAMINADO';
      case 'CORTE' :
        return 'CORTE';
      case 'DBLD' :
        return 'DOBLADO';
      case 'EMP' :
        return 'EMPAQUE';
      case 'SELLA' :
        return 'SELLADO';
      case 'ROT' :
        return 'ROTOGRABADO';
      default :
        return ''; 
    }
  }

  changeFailsForProcess(process : string){
    switch (process) {
      case 'EXT' :
        return 17;
      case 'IMP' :
        return 18;
      case 'SELLA' :
        return 20;
      case 'ROT' :
        return 19;
      case 'MATPRIMA' :
        return 16;  
      default :
        return 1;   
    }
  }

  //
  validateForm(){
    let roll : any = this.form.value.roll;
    let typeRecovery : any = this.form.value.typeRecovery;
    let processField : string = this.form.value.process;

    if(![null, undefined, ''].includes(typeRecovery)) {
      if(typeRecovery == 'ROLLO') {
        if(processField != null) {
          if(![null, undefined, ''].includes(roll)) {
            if(!this.recoveries.map(x => x.Rollo_Id).includes(roll)) this.searchRollBagPro(processField, roll);
            else this.msjs(`Advertencia`, `El rollo/bulto N° ${roll} ya se encuentra en la tabla!`);
          } else this.msjs(`Advertencia`, `Debe diligenciar el campo rollo/bulto!`);
        } else this.addPeletizado();
      } else this.addPeletizado();
    } else this.msjs(`Advertencia`, `Debe seleccionar el tipo de recuperado!`);
  }

  searchRollBagPro(processField : string, roll : number){
    let ot : any = this.form.value.ot;
    let process = this.changeNameProcess(processField);
    let url : string = process != null ? `?process=${this.changeNameProcess(process)}` : ``; 

    this.svBagpro.getRollProduction(roll, url).subscribe(data => {
      let orderBagPro : any = data.ot;
      if(ot == orderBagPro) this.addPeletizado();
      else this.msjs(`Advertencia`, `El rollo/bulto N° ${roll} no pertenece a la OT N° ${ot}`)
    });        
  }

  //
  addPeletizado(){
    if(this.form.valid) {
      this.recoveries.push({
        'Rollo_Id': [null, undefined, ''].includes(this.form.value.roll) ? 0 : (this.form.value.roll) ,
        'TpRecu_Id': this.form.value.typeRecovery,
        'TpRecu_Nombre': this.typesRecovery.find(x => x.tpRecu_Id == this.form.value.typeRecovery).tpRecu_Nombre,
        'OT': this.form.value.ot,
        'Prod_Id': this.form.value.item,
        'Prod_Nombre' : this.form.value.product,
        'MatPri_Id': this.form.value.mpId,
        'MatPri_Nombre': this.form.value.matprima,
        'Estado_Id': 19,
        'Material_Id': this.form.value.material,
        'Material_Nombre' : this.materials.find(x => x.material_Id == this.form.value.material).material_Nombre,
        'Falla_Id': this.form.value.fail,
        'Falla_Nombre': this.fails.find(x => x.falla_Id == this.form.value.fail).falla_Nombre,
        'Proceso_Id': this.form.value.process,
        'Proceso_Nombre': this.process.find(x => x.proceso_Id == this.form.value.process).proceso_Nombre,
        'IngPel_Area1': false,
        'IngPel_Area2': false,
        'IngPel_Cantidad': this.form.value.quantity,
        'UndMed_Id': 'Kg',
        'IngPel_Observacion': [null, undefined].includes(this.form.value.observation) ? '' : this.form.value.observation,
        'Usua_Id': this.storage_Id,
        'IngPel_FechaIngreso': null,
        'IngPel_HoraIngreso': (moment().format('HH:mm:ss')),
        'Usua_Modifica': 0,
      });
      this.clearFields();
    } else this.msjs(`Advertencia`, `Hay campos requeridos vacios en el formulario`);
  }

  //
  totalQty = () => this.recoveries.reduce((a, b) => a += b.IngPel_Cantidad, 0);

  //.Mostrar mensaje de confirmación
  confirmQuitRecord(index : number) {
    this.indexTable = null;
    this.onReject();
    this.indexTable = index;
    setTimeout(() => {
      this.svMsg.add({ severity: 'warn', key: 'delete', summary: 'Elección', detail: `Esta seguro que desea quitar el registro N° ${this.indexTable + 1} de la tabla?`, sticky: true });
    }, 200);
  }

  //
  quitRecordTable(index : number = this.indexTable) {
    this.onReject();
    this.recoveries.splice(index, 1);
  } 
  
  //
  onReject = () => this.svMsg.clear('delete');

  //
  savePeletizados(){
    let count : number = 0;

    if(this.recoveries.length > 0) {
      this.load = true;
      this.recoveries.forEach(x => {
        this.updateProperties(x);
        this.svIngPeletizado.Post(x).subscribe(data => {
          count++;
          if(this.recoveries.length == count) this.confirmRecordPele(data.ingPel_FechaIngreso, data.ingPel_FechaIngreso, data.ingPel_HoraIngreso);
        }, error => { this.msjs(`Error`, `Error al intentar guardar registros de recuperado!`); });
      });
    } else this.msjs(`Advertencia`, `No hay datos para registrar!`);
  } 
  
  //Función para eliminar propiedades del objeto que crea el registro en la base de datos y que no son necesarios
  updateProperties(data : any){
    delete data.TpRecu_Nombre,
    delete data.Prod_Nombre
    delete data.MatPri_Nombre
    delete data.Material_Nombre
    delete data.Falla_Nombre,
    delete data.Proceso_Nombre,
    data.IngPel_FechaIngreso = moment().format('YYYY-MM-DD'),
    data.IngPel_HoraIngreso = moment().format('HH:mm:ss')
  }

  confirmRecordPele = (date1 : any, date2 : any, hour : string) => this.createPDF(date1, date2, hour, `creado`);

  validateOptions(process : any){
    switch (process) {
      case 'MATPRIMA':
        return ['MEZCLA'];  
      default: 
        return ['ROLLO', 'DESPEDICIO'];
    }
  }

  createPDF(date1 : any, date2 : any, hour : any, action? : string) {
    this.svIngPeletizado.getEntryPeletizado(date1, date2, hour).subscribe(data => {
      let title: string = `Ingreso de Peletizado N° ${data[0].entries.ingPel_Id}-${data[data.length - 1].entries.ingPel_Id}`;
      let content: any[] = this.contentPDF(data);
      this.svPDF.formatoPDF(title, content);
      this.msjs(`Confirmación`, `Ingreso de Peletizado ${action} exitosamente!`);
      setTimeout(() => this.clearAll(), 3000);
    }, error => this.msjs(`Error`, `Error al consultar el ingreso de peletizado N° ${0}! | ${error.error}`));
  }

  contentPDF(data): any[] {
    let content: any[] = [];
    let consolidatedInformation: Array<any> = this.consolidatedInfoPDF(data);
    let informationProducts: Array<any> = this.getInfoMaterialsPDF(data);
    content.push(this.infoMovementPDF(data[0]));
    content.push(this.tableConsolidatedPDF(consolidatedInformation));
    content.push(this.tableTotals(consolidatedInformation))
    content.push(this.tableMaterialsPDF(informationProducts));
    return content;
  }

  consolidatedInfoPDF(data: any): Array<any> {
    let consolidatedInfo: Array<any> = [];
    let count: number = 0;
    data.forEach(d => {
      if (!consolidatedInfo.map(x => x.Id).includes(d.entries.matPri_Id)) {
        count++;
        let qtyRecords : number = data.filter(x => x.entries.matPri_Id == d.entries.matPri_Id).length;
        let totalWeight: number = 0;
        data.filter(x => x.entries.matPri_Id == d.entries.matPri_Id).forEach(x => totalWeight += x.entries.ingPel_Cantidad);
        consolidatedInfo.push({
          "#": count,
          "Id": d.entries.matPri_Id,
          "Material": d.matPrimas.matPrima,
          "Registros": qtyRecords,
          "Peso": this.formatNumbers((totalWeight).toFixed(2)),
          "Presentación": d.entries.undMed_Id
        });
      }
    });
    return consolidatedInfo;
  }

  getInfoMaterialsPDF(data: any): Array<any> {
    let infoProducts: Array<any> = [];
    let count: number = 0;
    data.forEach(d => {
      count++;
      infoProducts.push({
        "#": count,
        "Codigo": d.entries.ingPel_Id,
        "Recuperado": d.entries.tpRecu_Id,
        'Bulto' : d.entries.rollo_Id == null ? '' : d.entries.rollo_Id,
        'OT' : d.entries.ot,
        "Id" : d.entries.matPri_Id,
        "Material": d.matPrimas.matPrima,
        "Peso": this.formatNumbers((d.entries.ingPel_Cantidad).toFixed(2)),
        "Presentación" : d.entries.undMed_Id,
      });
    });
    infoProducts.sort((a, b) => a.Id - b.Id);
    return infoProducts;
  }

  //Función que muestra una tabla con la información general del ingreso.
  infoMovementPDF(data : any): {} {
    return {
      margin : [0, 0, 0, 15],
      table: {
        widths: ['34%', '33%', '33%'],
        body: [
          [
            { text: `Información general del movimiento`, colSpan: 3, alignment: 'center', fontSize: 10, bold: true }, {}, {}
          ],
          [
            { text: `Usuario ingreso: ${data.users.nameUser}` },
            { text: `Fecha ingreso: ${data.entries.ingPel_FechaIngreso.replace('T00:00:00', '')}` },
            { text: `Hora ingreso: ${data.entries.ingPel_HoraIngreso}` },
          ],
          [
            { text: `Usuario modificación: ${data.users.nameUser2 == 0 ? '' : data.users.nameUser2}`, }, 
            { text: `Fecha modificación: ${data.entries.ingPel_FechaModifica == null ? '' : data.entries.ingPel_FechaModifica.replace('T00:00:00', '')}`, }, 
            { text: `Hora modificación: ${data.entries.ingPel_HoraModifica == null ? '' : data.entries.ingPel_HoraModifica}`, } 
          ], 
          [
            { text: `Observación: ${data.entries.ingPel_Observacion}`, colSpan: 3, fontSize: 9 }, {}, {}
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
    let columns: Array<string> = ['#', 'Id', 'Material', 'Registros', 'Peso', 'Presentación'];
    let widths: Array<string> = ['10%', '10%', '40%', '15%', '15%', '10%'];
    return {
      table: {
        headerRows: 2,
        widths: widths,
        body: this.buildTableBody1(data, columns, 'Consolidado de recuperados ingresados'),
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
    let columns: Array<string> = ['#', 'Codigo', 'Recuperado', 'Bulto', 'OT', 'Id', 'Material', 'Peso', 'Presentación'];
    let widths: Array<string> = ['5%', '6%', '14%', '8%', '8%', '5%', '36%', '8%', '10%'];
    return {
      margin: [0, 10],
      table: {
        headerRows: 2,
        widths: widths,
        body: this.buildTableBody2(data, columns, 'Detalles de recuperados ingresados'),
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
    body.push([{ colSpan: 9, text: title, bold: true, alignment: 'center', fontSize: 10 }, '', '', '', '', '', '', '', '']);
    body.push(columns);
    data.forEach(function (row) {
      var dataRow = [];
      columns.forEach((column) => dataRow.push(row[column].toString()));
      body.push(dataRow);
    });
    return body;
  }

  //Función para limpiar campos
  clearFields(){
    this.disableForm(); 
    this.form.reset();
    this.load = false;
    this.disableField = false;
  }

  //Función para limpiar todo.
  clearAll(){
    this.clearFields();
    this.recoveries = [];
  }

  //Función para mostrar los diferentes tipos de msjs.
  msjs(msj1 : string, msj2 : string){
    this.load = false;
    switch (msj1) {
      case 'Confirmación' :
        return this.svMsjs.mensajeConfirmacion(msj1, msj2);
      case 'Advertencia' :
        return this.svMsjs.mensajeAdvertencia(msj1, msj2);
      case 'Error' :
        return this.svMsjs.mensajeError(msj1, msj2);  
      default :
        return this.svMsjs.mensajeAdvertencia(msj1, msj2); 
    }
  }
}

interface modelIngreso_Peletizado {
  IngPel_Id? : number;
  Rollo_Id? : number;
  TpRecu_Id : string;
  TpRecu_Nombre? : string;
  OT? : number;
  Prod_Id : number;
  Prod_Nombre? : string;
  MatPri_Id : number;
  MatPri_Nombre? : string;
  Estado_Id : number;
  Material_Id : number;
  Material_Nombre? : string;
  Falla_Id : number;
  Falla_Nombre? : string;
  Proceso_Id : string;
  Proceso_Nombre? : string;
  IngPel_Area1 : boolean;
  IngPel_Area2 : boolean;
  IngPel_Cantidad : number;
  UndMed_Id : string;
  IngPel_Observacion : string;
  Usua_Id : number;
  IngPel_FechaIngreso : any;
  IngPel_HoraIngreso : string;
  Usua_Modifica : number;
  IngPel_FechaModifica? : any;
  IngPel_HoraModifica? : string;
}
