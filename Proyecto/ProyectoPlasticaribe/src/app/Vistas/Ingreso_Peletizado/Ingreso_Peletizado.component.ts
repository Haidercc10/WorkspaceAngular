import { Component, Injectable, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { clear, error, log } from 'console';
import { create } from 'domain';
import moment from 'moment';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { CreacionPdfService } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';
import { DetallesAsignacionService } from 'src/app/Servicios/DetallesAsgMateriaPrima/detallesAsignacion.service';
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
import { CrearMateriaprimaComponent } from '../crear-materiaprima/crear-materiaprima.component';
import { DetallesDevolucionesProductosService } from 'src/app/Servicios/DetallesDevolucionRollosFacturados/DetallesDevolucionesProductos.service';
import { Produccion_ProcesosService } from 'src/app/Servicios/Produccion_Procesos/Produccion_Procesos.service';
import { Crear_FallasComponent } from '../Crear_Fallas/Crear_Fallas.component';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-Ingreso_Peletizado',
  templateUrl: './Ingreso_Peletizado.component.html',
  styleUrls: ['./Ingreso_Peletizado.component.css']
})

export class Ingreso_PeletizadoComponent implements OnInit, OnDestroy {

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
  @ViewChild('dtPeletizado') dtPeletizado : Table | undefined; 
  indexTable : number = null;
  rolls : any = [];
  typeRecoveries : any = [];
  disableField : boolean = true;
  failsProcess : any = [];
  port: SerialPort;
  reader: any;
  modalRecovery : boolean = false;
  @ViewChild(CrearMateriaprimaComponent) createRecovery : CrearMateriaprimaComponent;
  @ViewChild(Crear_FallasComponent) cmpCreateFails : Crear_FallasComponent;
  modalPeletizado : boolean = false;
  peletizado : any = [];
  groupPeletizado : any = [];
  tipoDoc : string = ``; 
  fieldFocus : boolean = false;
  optForm !: FormGroup;
  management : boolean = false;
  selectedItem : any = null;
  dispatch : boolean = false;

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
    private svDetailsAssign : DetallesAsignacionService,
    private svDevolutions : DetallesDevolucionesProductosService,
    private svProdProcess : Produccion_ProcesosService,
    //private createRecovery : CrearMateriaprimaComponent,
  ) { 
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
    this.initForm();
    this.optionalForm();
  }

  ngOnInit() {
    this.lecturaStorage();
    this.getMaterials();
    this.getFails();
    this.getProcess();
    this.getUnits();
    setTimeout(() => this.buscarPuertos(), 1000);
    //this.getMatPrimas();
    //this.createPDF('2024-06-13', '2024-06-13', '14:55:49', 'creada');
  }

  //* BASCULA
  async ngOnDestroy() {
    this.reader.releaseLock();
    this.reader.cancel();
    await this.port.close();
  }

  chargeSerialPorts() {
    navigator.serial.getPorts().then((ports) => {
      ports.forEach((port) => {
        port.open({ baudRate: 9600 }).then(async () => this.chargeDataFromSerialPort(port), error => this.svMsjs.mensajeError(`${error}`));
      });
    });
  }

  async buscarPuertos() {
    this.port = await navigator.serial.requestPort();
    try {
      await this.port.open({ baudRate: 9600 });
      this.chargeDataFromSerialPort(this.port);
    } catch (ex) {
      if (ex.name === 'NotFoundError') this.svMsjs.mensajeError('¡No hay dispositivos conectados!');
      else this.svMsjs.mensajeError(ex);
    }
  }

  async chargeDataFromSerialPort(port: SerialPort) {
    let keepReading: boolean = true;
    while (port.readable && keepReading) {
      this.reader = port.readable.getReader();
      try {
        while (true) {
          const { value, done } = await this.reader.read();
          if (done) {
            this.reader.releaseLock();
            break;
          }
          if (value) {
            let valor = this.ab2str(value);
            valor = valor.replace(/[^\d.-]/g, '');
            if (!this.load) {
              this.form.patchValue({
                quantity: valor,
                diference: valor - this.form.value.weight
              });
            }
          }
        }
      } catch (error) {
        this.svMsjs.mensajeError(error);
      } finally {
        this.reader.releaseLock();
      }
    }
  }

  ab2str = (buf) => String.fromCharCode.apply(null, new Uint8Array(buf));

  formatNumbers = (number) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

  //*NAVEGADOR

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  //*FORMULARIOS

  //Función para inicializar el formulario.
  initForm(){
    this.form = this.FrmBuilder.group({
      ot : [null],
      otValidate : [null, ],
      roll : [null],
      material : [null, Validators.required],
      typeRecovery : [null],
      fail : [null, Validators.required],
      quantity : [null, Validators.required],
      observation : [null], 
      process : [null, Validators.required],
      item : [null, Validators.required],
      product : [null, Validators.required], 
      mpId : [null, Validators.required],
      matprima : [null, Validators.required],
      quantityDoc : [null, Validators.required], 
      diff : [null, Validators.required],
    });
    //this.disableForm();
  }

  //Función para deshabilitar el formulario, excepto el campo proceso.
  disableForm(){
    this.form.disable();
    this.form.get('process')?.enable();
    this.form.get('quantity')?.enable();
  }

  //Habilitar tipo de recuperado y no conformidad
  enableTypeRecovery() {
    this.getTypesRecovery(this.validateOptions(this.form.value.process));
    //this.form.get('typeRecovery')?.enable();
    this.fails = this.failsProcess;
    this.fails = this.fails.filter(x => this.changeFailsForProcess(this.form.value.process).includes(x.tipoFalla_Id));
  } 

  //Habilitar formulario 
  enableForm() {
    this.form.enable();
    this.form.get('roll')?.reset();
  }

  //Cargar campos en función de los datos la OT. 
  loadFieldsForOT(data : any){
    //console.log(this.matPrimas.filter(x => x.matPri_Nombre.includes(data.material)));
    this.getPeletizadosForParameters(data);
    this.form.patchValue({
      'otValidate' : data.numero_Orden,
      'item' :  data.id_Producto, 
      'product' : data.producto,
      'material' : parseInt(data.id_Material),
    });
    this.load = false;
  }

  //Formulario opcional para gestionar devoluciones. 
  optionalForm(){
    this.optForm = this.FrmBuilder.group({
      dv : [null, Validators.required],
      observation : [null],
    });
  }

  //* OBTENER INFO INICIAL

  //Función para obtener los diferentes tipos de materiales. 
  getMaterials = () => this.svMaterials.srvObtenerLista().subscribe(data => { this.materials = data }, error => { this.svMsjs.mensajeError(`Error`, `Error al consultar los materiales. | ${error}`); });

  //Función para obtener los tipos de recuperado
  getTypesRecovery = (types : any[]) => this.svTypesRecovery.GetTodo().subscribe(data => { this.typesRecovery = data.filter(x => types.includes(x.tpRecu_Id)) }, error => { this.svMsjs.mensajeError(`Error`, `Error al consultar los tipos de recuperados. | ${error}`); });

  //Función para obtener los tipos de fallas/no conformidades. 
  getFails = () => this.svFails.srvObtenerLista().subscribe(data => { this.failsProcess = data.filter(x => [13,14,16,17,18,19,20,21,22,].includes(x.tipoFalla_Id)) }, error => { this.svMsjs.mensajeError(`Error`, `Error al consultar las no conformidades. | ${error}`); });

  //Función para obtener los procesos.
  getProcess = () => this.svProcess.srvObtenerLista().subscribe(data => { this.process = data.filter(x => [3,4,15,2,1,14].includes(x.proceso_Codigo)) }, error => { this.svMsjs.mensajeError(`Error`, `Error al consultar los procesos. | ${error}`); });

  //Función para obtener las diferentes presentaciones
  getUnits = () => this.svUnits.srvObtenerLista().subscribe(data => { this.presentations = data.filter(x => x.undMed_Id == 'Kg'); }, error => { this.svMsjs.mensajeError(`Error`, `Error al consultar las presentaciones. | ${error}`); })

  //*MODALES

  loadModalFails(){
    this.modalFails = true;
    setTimeout(() => {
      this.cmpCreateFails.typeFails = this.cmpCreateFails.typeFails.filter(x => [16,17,18,19,20,21].includes(x.tipoFalla_Id));
    }, 1500);
  }

  //Cargar modal para crear recuperado
  loadModalRecovery() {
    this.modalRecovery = true;
    setTimeout(() => {
      this.createRecovery.nombreCategoriasMP = this.createRecovery.nombreCategoriasMP.filter(x => x.catMP_Id == 10);
      this.createRecovery.materiPrima.patchValue({ 'mpCategoria' : 10 });
      this.createRecovery.recovery = true;
      this.fieldFocus = false;
    }, 2000);
    
  }
  //Función para obtener las materias primas.
  //getMatPrimas = () => this.svMatPrimas.srvObtenerLista().subscribe(data => { this.matPrimas = data.filter(x => [10,4].includes(x.catMP_Id)) }, error => { this.svMsjs.mensajeError(`Error`, `Error al consultar las materias primas. | ${error}`); });
  
  //*FUNCIONES EN EL PROCESO

  searchDocument(){
    let process : any = this.form.value.process;
    let ot : any = this.form.value.ot;

    if(process == 'MATPRIMA') this.getOrderProduction();
    else if (process == 'DESP' && ot.toString().length >= 5) this.getOrderProduction();
    else if (process == 'DESP') this.loadDevolutionsPeletizado();
    else this.getOrderProduction();
  }

  //Función para obtener datos de la OT
  getOrderProduction(){
    let ot : any = this.form.value.ot;
    let process : any = this.form.value.process;
    this.load = true;

    if(![null, undefined, ''].includes(ot)) {
      //if(ot.toString().length > 5) {
        this.svBagpro.GetOrdenDeTrabajo(ot).subscribe(data => {
          if(data.length > 0) {
            if(process == 'MATPRIMA') this.getAssignedOrders(ot, data[0]);
            else if(process == 'DESP') this.loadOtWithPeletizado(data[0]);
            else this.loadFieldsForOT(data[0]);
          }
        }, error => { 
          this.msjs(`Error`, `Error consultando la OT/Doc N° ${ot} | ${error.status} ${error.statusText}`);
          this.clearSoloFields(); 
        });
      //} else this.msjs(`Advertencia`, `La orden de trabajo no puede tener menos de 6 digitos!`);
    } else this.msjs(`Advertencia`, `Orden de trabajo no válida!`);
  }

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

  //
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

  loadDevolutionsPeletizado(){
    let dv : any = this.optForm.value.dv;
    this.load = true;

    this.svDevolutions.getInfoDvForPeletizadoById(dv).subscribe(data => {
      if(data.length > 0) {
        this.msjs(`Confirmación`, `La devolución N° ${dv} contiene rollos/bultos para peletizado!`);
        this.dispatch = true;
        this.load = false;
        this.peletizado = data;
        this.consolidatePeletizado();
      } else {
        this.msjs(`Advertencia`, `No se encontraron rollos/bultos para peletizado de la devolución N° ${dv}`);
        this.clearFields();
      } 
    }, error => {
      this.modalPeletizado = false;
      this.msjs(`Error`, `Error consultando la devolución N° ${dv} | ${error.status} ${error.statusText}`);
    })
  }

  loadOtWithPeletizado(info : any){
    this.svProdProcess.getOtSentToPeletizado(this.form.value.ot).subscribe(data => {
      if(data.length > 0) {
        this.msjs(`Confirmación`, `La orden ${this.form.value.ot} cuenta con rollos a peletizar!`);
        this.loadFieldsForOT(info);
      } else this.msjs(`Advertencia`, `La orden ${this.form.value.ot} no cuenta con rollos a peletizar!`);
    }, error => {
      this.msjs(`Error`, `Error al intentar recuperar registros de rollos/bultos para peletizado!`);
    });
  }

  clearSoloFields(){
    this.form.patchValue({
      ot : null,
      otValidation : null,
      roll : null,
      material : null,
      //fail : null,
      quantity : null,
      observation : null, 
      item : null,
      product : null, 
      mpId : null,
      matprima : null,
      quantityDoc : null,
      diff : null, 
    });
    //this.disableField = false;
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
      'otValidate' : data.ot,
      'item' : data.item, 
      'product' : data.referencia,
      'material' : data.id_Material,
    });
    this.getProduct();
  }

  selectProduction(data){

  }

  selectAllProduction(){
    
  }

  quitProduction(){

  }

  onFocus = () => this.fieldFocus = true;

  outFocus(qty : number, qty2 : number, i, data) {
    if(qty <= qty2 && qty > 0) {
      this.groupPeletizado[i].diff = data.weight3 - data.weight2;
      return this.fieldFocus = false;
    } else {
      this.groupPeletizado[i].diff = data.weight3 - data.weight2;
      return this.fieldFocus = true;
    } 
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
        return [17, 22];
      case 'IMP' :
        return [18, 22];
      case 'SELLA' :
        return [20, 22];
      case 'ROT' :
        return [19, 22];
      case 'MATPRIMA' :
        return [16, 22];
      case 'DESP' :
        return [13, 14, 21, 22];    
      default :
        return [1];   
    }
  }

  //
  validateForm(){
    let roll : any = this.form.value.roll;
    
    let processField : string = this.form.value.process;
    let ot : any = this.form.value.ot;
    let otValidate : any = this.form.value.otValidate;

    if(ot == otValidate) {
      if(processField != null) {
        if(![undefined, null, 0, ''].includes(roll)) {
          if(!this.recoveries.map(x => x.Rollo_Id).includes(roll)) this.searchRollBagPro(processField, roll);
          else this.msjs(`Advertencia`, `El rollo/bulto N° ${roll} ya se encuentra en la tabla!`);
        } else this.addPeletizado();
      } else this.msjs(`Advertencia`, `Debe diligenciar el proceso`);
    } else this.msjs(`Advertencia`, `La OT ${otValidate} consultada previamente  no coincide con la que desea agregar ${ot}.`);
  }

  searchRollBagPro(processField : string, roll : number){
    let ot : any = this.form.value.ot;
    let process = this.changeNameProcess(processField);
    
    let url : string = process != null ? `?process=${this.changeNameProcess(process)}` : ``; 

    this.svBagpro.getRollProduction(roll, url).subscribe(data => {
      if(data != null) {
        let orderBagPro : any = data.ot;
        if(ot == orderBagPro) this.addPeletizado();
        else this.msjs(`Advertencia`, `El rollo/bulto N° ${roll} no pertenece a la OT N° ${ot}`)
      } else this.addPeletizado();
    }, error => {
      this.msjs(`Error`, `Error al consultar el Rollo N° ${roll} | ${error.error}`);
    });        
  }

  //*FUNCIONES DE ADICIÓN

  getDataDispatch(){
    this.form.patchValue({ process : 'DESP', })
    this.enableTypeRecovery();
    setTimeout(() => {
      this.form.patchValue({
        'fail' : this.selectedItem.fail_Id, 
        'ot' : this.optForm.value.dv,
        'otValidate' : this.optForm.value.dv,
        'item' : this.selectedItem.item,
        'product' : this.selectedItem.reference,
        'material' : this.selectedItem.id_Material,
        'mpId' : this.selectedItem.matPrima_Id, 
        'matprima' : this.selectedItem.matPrima, 
        'quantityDoc' : this.selectedItem.weight, 
      })
    }, 1000);
    
  }

  //
  addPeletizado(){
    if(this.form.valid) {
      this.recoveries.push({
        'Rollo_Id': [null, undefined, ''].includes(this.form.value.roll) ? 0 : (this.form.value.roll) ,
        'TpRecu_Id': [null, undefined, ''].includes(this.form.value.roll) ? 'PELETIZADO' : 'ROLLO',
        'TpRecu_Nombre': [null, undefined, ''].includes(this.form.value.roll) ? 'PELETIZADO' : 'ROLLO PRODUCCION',
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
        'IngPel_CantInicial': this.form.value.quantity,
        'UndMed_Id': 'Kg',
        'IngPel_Observacion': [null, undefined].includes(this.form.value.observation) ? '' : this.form.value.observation,
        'Usua_Id': this.storage_Id,
        'IngPel_FechaIngreso': null,
        'IngPel_HoraIngreso': (moment().format('HH:mm:ss')),
        'Usua_Modifica': 0,
        'IngPel_Codigo': 0,
      });
      this.clearSoloFields();
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
      this.svIngPeletizado.getLastCodeEntry().subscribe(code => {
      code += 1;  
      this.recoveries.forEach(x => {
        this.updateProperties(x, code);
          this.svIngPeletizado.Post(x).subscribe(data => {
            count++;
            if(this.recoveries.length == count) {
              this.createPDF(data.ingPel_FechaIngreso, data.ingPel_FechaIngreso, data.ingPel_HoraIngreso, `creado`);
            } 
          }, error => { this.msjs(`Error`, `Error al intentar guardar registros de recuperado!`); });
        })
      }, error => { this.msjs(`Error`, `Se encontraron errores en la búsqueda del ultimo código de ingreso de Peletizado.`) });
    } else this.msjs(`Advertencia`, `No hay datos para registrar!`);
  } 

  savePeletizadosByDev(){
    let count : number = 0;
    if(this.groupPeletizado.length > 0) {
      this.load = true;
      this.svIngPeletizado.getLastCodeEntry().subscribe(code => {
      code += 1;  
        this.groupPeletizado.forEach(x => {
          this.svIngPeletizado.Post(this.recordIn(x, code)).subscribe(data => {
            count++;
            if(this.recoveries.length == count) {
              this.createPDF(data.ingPel_FechaIngreso, data.ingPel_FechaIngreso, data.ingPel_HoraIngreso, `creado`);
            } 
          }, error => { this.msjs(`Error`, `Error al intentar guardar registros de recuperado por devolución!`); });
        })
      }, error => { this.msjs(`Error`, `Se encontraron errores en la búsqueda del ultimo código de ingreso de Peletizado.`) });
    } else this.msjs(`Advertencia`, `No hay datos para registrar!`);
  } 

  recordIn(data, codeIn){
    let model : modelIngreso_Peletizado = {
      IngPel_Codigo: codeIn,
      TpRecu_Id: 'ROLLO',
      Prod_Id: data.item,
      MatPri_Id: data.matPrima_Id,
      Estado_Id: 19,
      Material_Id: data.id_Material,
      Falla_Id: data.fail_Id,
      Proceso_Id: 'DESP',
      IngPel_Area1: false,
      IngPel_Area2: false,
      IngPel_Cantidad: data.weight2,
      IngPel_CantInicial: data.weight2,
      UndMed_Id: 'Kg',
      IngPel_Observacion: '',
      Usua_Id: this.storage_Id,
      IngPel_FechaIngreso: moment().format('YYYY-MM-DD'),
      IngPel_HoraIngreso: moment().format('HH:mm:ss'),
      Usua_Modifica: 0
    }
    return model
  }

  
  //Función para eliminar propiedades del objeto que crea el registro en la base de datos y que no son necesarios
  updateProperties(data : any, codeIn){
    delete data.TpRecu_Nombre,
    delete data.Prod_Nombre
    delete data.MatPri_Nombre
    delete data.Material_Nombre
    delete data.Falla_Nombre,
    delete data.Proceso_Nombre,
    data.IngPel_FechaIngreso = moment().format('YYYY-MM-DD'),
    data.IngPel_HoraIngreso = moment().format('HH:mm:ss'), 
    data.IngPel_Codigo = codeIn;
  }
  
  //confirmRecordPele = (date1 : any, date2 : any, hour : string) => this.createPDF(date1, date2, hour, `creado`);
  validateOptions(process : any){
    switch (process) {
      case 'MATPRIMA':
        return ['MEZCLA']; 
      case 'DESP':
        return ['ROLLO', 'BULTO']; 
      case 'SELLA':
        return ['BULTO', 'DESPEDICIO'];    
      default: 
        return ['ROLLO', 'BULTO', 'DESPEDICIO'];
    }
  }

  //*FUNCIONES PARA EXPORTAR PDF.
  //Función para crear un PDF en base al registro creado.
  createPDF(date1 : any, date2 : any, hour : any, action? : string) {
    this.svIngPeletizado.getEntryPeletizado(date1, date2, hour).subscribe(data => {
      let title: string = `Ingreso de Peletizado N° ${data[0].entries.ingPel_Codigo}`;
      let content: any[] = this.contentPDF(data);
      this.svPDF.formatoPDF(title, content);
      this.msjs(`Confirmación`, `Ingreso de Peletizado ${action} exitosamente!`);
      this.clearAll();
    }, error => this.msjs(`Error`, `Error al consultar el ingreso de peletizado N° ${0} | ${error.status} ${error.statusText}`));
  }

  //Función para colocar la información registrada en el PDF.
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

  //Funcion para colocar el encabezado de los materiales en la tabla 1
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

  //Funcion para colocar los detalles de los materiales en la tabla 2 
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
        "Peso": this.formatNumbers((d.entries.ingPel_CantInicial).toFixed(2)),
        "Presentación" : d.entries.undMed_Id,
      });
    });
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
    this.load = false;
    //this.disableForm(); 
    this.form.reset();
    //this.disableField = false;
  }

  //Función para limpiar todo.
  clearAll(){
    this.clearFields();
    this.recoveries = [];
    this.peletizado = [];
    this.groupPeletizado = [];
    this.load = false;
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

  //Valida que la OT tenga asignaciones de material. 
  getAssignedOrders(ot : any, info : any){
    this.svDetailsAssign.GetPolietilenoAsignada(parseInt(ot)).subscribe(data => {
      if(data.length > 0) this.loadFieldsForOT(info);
      else this.msjs(`Advertencia`, `La OT N° ${ot} no tiene asignaciones registradas!`);
    }), error => {
      this.msjs(`Error`, `No se encontró información de asignaciones de la OT N° ${ot} | ${error.status} ${error.statusText}`);
    };
  }

  //Peletizados agrupados del modal.
  consolidatePeletizado(){
    this.groupPeletizado = this.peletizado.reduce((a, b) => {
      if(!a.map(x => x.item).includes(b.item)) {
        a.push({
          'item' : b.item,
          'reference' : b.reference, 
          'weight' : b.weight,
          'weight2' : b.weight2,
          'weight3' : b.weight3,
          'diff' : b.weight3 - b.weight2,
          'id_Material' : b.id_Material,
          'material' : b.material,
          'matPrima_Id' : b.matPrima_Id,
          'matPrima' : b.matPrima, 
          'id_Pigmento_Extrusion' : b.id_Pigmento_Extrusion,
          'pigment' : b.pigment,
          'fail_Id' : b.fail_Id,
          'fail' : b.fail
        });
      } else {
        a.find(x => x.item == b.item).weight += b.weight;
        a.find(x => x.item == b.item).weight2 += b.weight2;
        a.find(x => x.item == b.item).weight3 += b.weight3;
      } 
      return a;
    }, []);
  }

  //quitar peletizados del modal.
  quitPeletizado(index : any){
    this.load = true;
    setTimeout(() => {
      this.peletizado.splice(index, 1);
      this.consolidatePeletizado();
      this.load = false;
    }, 1000);
  }

  //Limpiar información del modal
  clearModalPeletizado(){
    this.peletizado = [];
    this.groupPeletizado = [];
  }

  //Total productos no conformes 
  totalBadProducts = () => this.peletizado.reduce((a, b) => a += b.weight, 0);

  //Total productos no conformes agrupados
  totalBadProductsGrouped1 = () => this.groupPeletizado.reduce((a, b) => a += b.weight, 0);

  totalBadProductsGrouped2 = () => this.groupPeletizado.reduce((a, b) => a += b.weight2, 0);
  
  totalDiffBadProductsGrouped3 = () => this.groupPeletizado.reduce((a, b) => a += b.diff, 0);

  qtyRollsByItem = (item : number) => this.peletizado.filter(x => x.item == item).length;

  qtyTotalRolls = () => this.peletizado.length;
}

interface modelIngreso_Peletizado {
  IngPel_Id? : number;
  IngPel_Codigo : number;
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
  IngPel_CantInicial : number;
  UndMed_Id : string;
  IngPel_Observacion : string;
  Usua_Id : number;
  IngPel_FechaIngreso : any;
  IngPel_HoraIngreso : string;
  Usua_Modifica : number;
  IngPel_FechaModifica? : any;
  IngPel_HoraModifica? : string;

}
