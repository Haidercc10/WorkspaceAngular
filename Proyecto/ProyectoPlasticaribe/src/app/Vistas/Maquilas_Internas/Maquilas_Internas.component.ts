
import { Component, Injectable, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { Table } from 'primeng/table';
import { AppComponent } from 'src/app/app.component';
import { modelMaquilas_Internas } from 'src/app/Modelo/modelMaquilas_Internas';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { ConosService } from 'src/app/Servicios/Conos/conos.service';
import { CreacionPdfService } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';
import { Maquilas_InternasService } from 'src/app/Servicios/Maquilas_Internas/Maquilas_Internas.service';
import { MaterialProductoService } from 'src/app/Servicios/MaterialProducto/materialProducto.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { ProcesosService } from 'src/app/Servicios/Procesos/procesos.service';
import { SedeClienteService } from 'src/app/Servicios/SedeCliente/sede-cliente.service';
import { Servicios_ProduccionService } from 'src/app/Servicios/Servicios_Produccion/Servicios_Produccion.service';
import { UsuarioService } from 'src/app/Servicios/Usuarios/usuario.service';

@Injectable({
  providedIn : 'root'
})

@Component({
  selector: 'app-Maquilas_Internas',
  templateUrl: './Maquilas_Internas.component.html',
  styleUrls: ['./Maquilas_Internas.component.css']
})

export class Maquilas_InternasComponent implements OnInit, OnDestroy {

  load : boolean = false; //Variable para validar que salga o no la imagen de carga
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro

  form !: FormGroup; //formulario para consultar y crear un ingreso de rollos
  process : any [] = [];
  services : any [] = [];
  conos : any [] = [];
  operators : any [] = [];
  dataOrderProduction : any [] = [];
  loadedServices : any = [];
  @ViewChild('dtServices') dtServices: Table;
  turn : any = ``;
  turns : any = [];
  materials : any = [];
  holidays : any = [];
  realServices : any = [];
  selectedService : any = null;
  reader: any;
  port : SerialPort;

  constructor(
    private AppComponent : AppComponent,
    private msj : MensajesAplicacionService,
    private frmBuilder : FormBuilder,
    private svcProcess : ProcesosService,
    private svConos : ConosService,
    private svUsers : UsuarioService,
    private svBagPro : BagproService,
    private svSedes : SedeClienteService,
    private svServicesProduction : Servicios_ProduccionService,
    private svInternalMaquila : Maquilas_InternasService,
    private svPDF : CreacionPdfService,
    private svMaterials : MaterialProductoService
  ) { 
    this.initForm();
  }

  ngOnInit() {
    this.lecturaStorage();
    this.getConos();
    this.getOperators();
    this.getProcess();
    this.loadDate();
    this.getServices();
    this.getCurrentTurn();
    this.getMaterials();
    setTimeout(() => this.buscarPuertos(), 1000);
  }

  async ngOnDestroy() {
    this.reader.releaseLock();
    this.reader.cancel();
    await this.port.close();
    console.log('Maquilas')
  }

  chargeSerialPorts() {
    navigator.serial.getPorts().then((ports) => {
      ports.forEach((port) => {
        port.open({ baudRate: 9600 }).then(async () => this.chargeDataFromSerialPort(port), error => this.msj.mensajeError(`${error}`));
      });
    });
  }

  async buscarPuertos() {
    this.port = await navigator.serial.requestPort();
    try {
      await this.port.open({ baudRate: 9600 });
      this.chargeDataFromSerialPort(this.port);
    } catch (ex) {
      if (ex.name === 'NotFoundError') this.msj.mensajeError('¡No hay dispositivos conectados!');
      else this.msj.mensajeError(ex);
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
                'weight': valor,
                'netWeight' : valor - this.form.get('weightTare').value
              });
            }
          }
        }
      } catch (error) {
        this.msj.mensajeError(error);
      } finally {
        this.reader.releaseLock();
      }
    }
  }

  getHollidays2024(){
    this.holidays = [
      "2024-01-01",
      "2024-01-08",
      "2024-03-24",
      "2024-03-25",
      "2024-03-28",
      "2024-03-29",
      "2024-03-31",
      "2024-05-01",
      "2024-05-13",
      "2024-06-03",
      "2024-06-10",
      "2024-07-01",
      "2024-07-20",
      "2024-08-07",
      "2024-08-19",
      "2024-10-14",
      "2024-11-04",
      "2024-11-11",
      "2024-12-08",
      "2024-12-25",
   ]
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number : any) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  getProcess() {
    this.svcProcess.srvObtenerLista().subscribe(data => { 
      this.process = data;
    }, error => { 
      this.msj.mensajeError(`Error`, `Error al consultar los procesos. | ${error.status} ${error.statusText}`); 
    });
  }

  initForm(){
    this.form = this.frmBuilder.group({
      process: [null, ],
      service: [null, Validators.required],
      ot: [null, Validators.required],
      machine: [null, Validators.required],
      operator: [null, Validators.required],
      broadCono: [null, Validators.required],
      weightTare: [null, ],
      weight: [null, ],
      netWeight: [null],
      date: [null, Validators.required],
      measureUnit: [null ],
      cono: [null, Validators.required],
      observation: [null ],
      broadItem: [null ]
    });  
  }

  getConos() {
    this.svConos.GetConos().subscribe(data => {
      this.conos = data
      this.conos.sort((a, b) => b.cono_Id.localeCompare(a.cono_Id));
    });
  }

  getOperators = () => this.svUsers.GetOperariosProduccion().subscribe(data => { this.operators = data.filter(x => x.area_Id == 11); });

  getServices(){
    this.svServicesProduction.GetTodo().subscribe(data => { this.services = data }, error => {
      this.msj.mensajeError(`Error`, `Error al consultar los servicios. | ${error.status} ${error.statusText}`);
    });
  }

  //Función para cargar fechas en el campo. 
  loadDate(){
    this.form.patchValue({ 'date' : new Date(moment().add(1, 'd').format('YYYY-MM-DD')) });
  }

  getMaterials = () => this.svMaterials.srvObtenerLista().subscribe(data => { this.materials = data; })

  applyFilter = ($event, campo : any, valorCampo : string) => this.dtServices!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

  searchOT(order? : any){
    let ot : any = order ? order : this.form.value.ot;
    this.dataOrderProduction = [];
    this.realServices = [];
    this.load = true;
   
    this.svBagPro.GetOrdenDeTrabajo(ot).subscribe(data => {
      let nitCliente : any = data[0].nitCliente == null ? data[0].id_Cliente : data[0].nitCliente;
      this.svSedes.GetSedeClientexNitBagPro(nitCliente).subscribe(sede => {
        let printed : boolean = data[0].id_Tinta1 == 1 ? false : true;
        this.realServices = this.services.filter(x => x.material_Id == data[0].id_Material && x.impreso == printed);
        this.form.patchValue({ service : this.selectedService })
        
        this.dataOrderProduction.push({
          'ot' : data[0].numero_Orden, 
          'client' : sede[0].cliente, 
          'item' : data[0].id_Producto, 
          'reference' : data[0].producto, 
          'unit' : data[0].presentacion == 'Kilo' ? 'Kg' : data[0].presentacion == 'Unidad' ? 'Und' : 'Paquete', 
          'broad1' : data[0].selladoCorte_Ancho, 
          'broad2' : data[0].selladoCorte_Largo, 
          'broad3' : data[0].selladoCorte_Fuelle, 
          'unitExtrusion' : data[0].und_Extrusion, 
          'calibre' : data[0].calibre_Extrusion, 
          'materialId' : data[0].id_Material,
          'material' : data[0].material.trim(),
          'broadItem' : data[0].selladoCorte_Ancho,
          'printed' : printed,
        });
        this.buscarDatosConoSeleccionado();
        this.getAddedServices(ot);
      }, error => {
        this.load = false;
        this.msj.mensajeAdvertencia(error.status.toString().startsWith('4') ? `El cliente Identificado con NIT/CC N° ${nitCliente}, no está creado!` : `Error consultando el cliente N° ${nitCliente}`)
        this.clearFields();
      });
    }, error => {
      this.load = false;
      this.msj.mensajeError(error.status.toString().startsWith('4') ? `La OT N° ${ot} no existe` : `Error consultando la OT N° ${ot}`);
      this.clearFields();
    });    
  }

  getAddedServices(ot : any){
    this.svInternalMaquila.getInternalsMaquilasForOT(ot).subscribe(data => {
      this.loadedServices = data;
      this.load = false;
    }, error => {
      this.msj.mensajeError(`Error`, `No fue posible consultar la información de la maquila por OT | ${error.status} ${error.statusText}`);
      this.load = false;
    });
  }

  buscarDatosConoSeleccionado() {
    let cono = this.form.get('cono').value;
    if (cono) {
      let datosCono = this.conos.find(x => x.cono_Id == cono);
      let ancho: number = datosCono.cono_KgXCmsAncho;
      this.form.patchValue({ broadCono : ancho });
      this.validarAnchoCono();
    }
  }

  validarAnchoCono() {
    let ancho : number = 0;
    let ancho1 = this.dataOrderProduction[0].broad1;
    let proceso = `Corte`;

    if (['Empaque', 'Corte', 'Rebobinar'].includes(proceso)) ancho = this.dataOrderProduction[0].broadItem;
    else if (['Doblado'].includes(proceso)) {
      if (ancho1 == 0) ancho1 = this.dataOrderProduction[0].broadItem;
      ancho = ancho1 / 2; 
    } else {
      if (ancho1 == 0) ancho1 = this.dataOrderProduction[0].broadItem;
      ancho = ancho1;
    }
    this.dataOrderProduction[0].broad1 = ancho1, 
    this.form.patchValue({ 'weightTare' : this.validarTaraCono(ancho) });  
  }

  validarTaraCono(ancho: number): number {
    let tara: number = 0;
    let anchoCono = this.form.get('broadCono').value;
    let undExtrusion = this.dataOrderProduction[0].unitExtrusion; //this.form.get('undExtrusion').value;
    let ancho1 = this.dataOrderProduction[0].broad1;

    if (ancho1 && anchoCono) {
      if (undExtrusion == 'Plgs') tara = ancho * 2.54 * anchoCono;
      else tara = ancho * anchoCono;
    }
    return tara;
  }

  //Función que obtiene los puertos seriales
  /*async getPuertoSerial() {
    try {
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 9600 });
      this.cargarDatosPuertoSerial(port);
    } catch (ex) {
      if (ex.name === 'NotFoundError') this.msj.mensajeError('¡No se encontró báscula conectada!');
      else this.msj.mensajeError(ex);
    }
  }*/

  //Función que lee los datos del puerto serial
  /*async cargarDatosPuertoSerial(port: any) {
    let reader;
    let keepReading: boolean = true;
    setTimeout(async () => {
      reader.releaseLock();
      reader.cancel();
      await port.close();
    }, 1000);
    while (port.readable && keepReading) {
      reader = port.readable.getReader();
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            reader.releaseLock();
            break;
          }
          if (value) {
            let valor = this.ab2str(value);
            valor = valor.replace(/[^\d.-]/g, '');
            this.form.patchValue({ 'weight' : valor, 'netWeight' : valor - this.form.get('weightTare').value });
          }
        }
      } catch (error) {
        console.log(error);
        this.msj.mensajeError(`Error`, `Error al leer los datos del puerto serial. | ${error.status} ${error.statusText}`);
      } finally {
        reader.releaseLock();
      }
    }
  }*/

  //Función que convierte un buffer a un valor
  ab2str = (buf) => String.fromCharCode.apply(null, new Uint8Array(buf));

  addService(){
    //this.getPuertoSerial();
    this.getCurrentTurn();
    this.load = true;
    //this.form.patchValue({ 'weight' : 15.9, 'netWeight' : 15.9 - this.form.get('weightTare').value });
    let weight : number = this.form.get('weight').value;
    let netWeight : number = this.form.get('netWeight').value;
    let today : any = moment().format('YYYY-MM-DD');
    let dateSelected : any = this.form.get('date').value;

    let initDate = moment([moment(today).year(), moment(today).month() + 1, moment(today).date()]); 
    let endDate = moment([moment(dateSelected).year(), moment(dateSelected).month() + 1, moment(dateSelected).date()]); 

    let days = endDate.diff(initDate, 'days');

    setTimeout(() => {
      if(this.form.valid) {
        if(![0, null, undefined, ''].includes(weight)) {
          if(![0, null, undefined, ''].includes(netWeight)) {
            if(days <= 0) {
              if(this.turn) {
                this.createInternalMaquila();
                //this.loadServicesTable(weight, netWeight);
              } else this.msj.mensajeAdvertencia(`No hay un turno seleccionafo!`);
            } else this.msj.mensajeAdvertencia(`La fecha de servicio no puede ser mayor a la fecha actual`);
          } else this.msj.mensajeAdvertencia(`El peso neto es inválido!`);
        } else this.msj.mensajeAdvertencia(`El peso bruto es inválido!`);
      } else  this.msj.mensajeAdvertencia(`Diligencie todos los campos!`);
      this.load = false;
    }, 500);
  }

  loadServicesTable(weight : number, netWeight : number){
    let ot : any = this.form.value.ot;
    
    if(ot == this.dataOrderProduction[0].ot) {
      let operator : any = this.form.get('operator').value;
      let nameOperator : any = this.operators.find(x => x.usua_Id == operator).usua_Nombre;
      let service : any = this.form.get('service').value;
      let date : any = moment().format('YYYY-MM-DD');
      let valueService : any = this.holidays.map(x => x).includes(date) ? this.services.find(x => x.svcProd_Id == service).svcProd_ValorDomFest : 
                               this.turn == 'DIA' ? this.services.find(x => x.svcProd_Id == service).svcProd_ValorDia : 
                               this.turn == 'NOCHE' ? this.services.find(x => x.svcProd_Id == service).svcProd_ValorNoche : 0;

      this.loadedServices.unshift({
        'operatorId' : operator, 
        'operator' : this.operators.find(x => x.usua_Id == operator).usua_Nombre,
        'serviceId' : service,
        'service' : this.services.find(x => x.svcProd_Id == service).svcProd_Nombre,
        'requestedBy' : this.services.find(x => x.svcProd_Id == service).proceso_Solicita,
        'weight' : weight,
        'netWeight' : netWeight,
        'unit' : 'Kg',
        'valueService' : valueService,
        'subTotal' : (valueService) * netWeight, 
        'ot' : ot,
        'machine' : this.form.value.machine,
        'date' : moment(this.form.value.date).format('YYYY-MM-DD'),
        'cono' : this.form.value.cono,
        'broadCono' : this.form.value.broadCono,
        'tareCono' : this.form.value.weightTare,
        'item' : this.dataOrderProduction[0].item,
        'observation' : this.form.value.observation,
        'materialId' : this.dataOrderProduction[0].materialId, 
        'printed' : this.dataOrderProduction[0].printed
      });
      this.msj.mensajeConfirmacion(`Confirmación`, `Se agregó correctamente el servicio al operario ${nameOperator}`);
      //this.form.patchValue({ weight : null, netWeight : null, observation : null });
    } else {
      this.msj.mensajeAdvertencia(`La OT del servicio no coincide con la OT seleccionada!`);
      //this.form.patchValue({ weight : null, netWeight : null, observation : null })
    } 
  }

  getTotalPay(){
    let data : any = this.dtServices ? this.dtServices.filteredValue ? this.dtServices.filteredValue : this.loadedServices : this.loadedServices;
    return data.reduce((a, b) => a += b.value_Pay, 0);
  }

  getTotalWeight(){
    let data : any = this.dtServices ? this.dtServices.filteredValue ? this.dtServices.filteredValue : this.loadedServices : this.loadedServices;
    return data.reduce((a, b) => a += b.weight, 0);
  }

  getTotalNetWeight(){
    let data : any = this.dtServices ? this.dtServices.filteredValue ? this.dtServices.filteredValue : this.loadedServices : this.loadedServices;
    return data.reduce((a, b) => a += b.netWeight, 0);
  }

  quitService(data : any, ri){
    //console.log((this.loadedServices.length - 1) - ri + 1)
    //console.log((this.loadedServices.length - 1), ri + 1)
    let index : number = this.loadedServices.findIndex(x => x.operatorId == data.operatorId);
    this.load = true;
    setTimeout(() => {
      this.msj.mensajeAdvertencia(`Confirmación`, `Se quitó correctamente el servicio ${data.service} al operario ${data.operator}`);
      this.loadedServices.splice(index, 1);
      this.load = false;
    }, 500);
  }

  clearFields(){
    this.load = false;
    this.form.reset();
    this.dataOrderProduction = [];
    this.loadDate();
    this.realServices = [];
  }

  clearAll(){
    this.load = false;
    this.form.reset();
    this.dataOrderProduction = [];
    this.loadedServices = [];
    this.loadDate();
    this.realServices = [];
  }

  createInternalMaquila(){
    let ot : any = this.form.value.ot;
    this.selectedService = null;
    
    if(ot == this.dataOrderProduction[0].ot) {
      this.load = true;
      let operator : any = this.form.get('operator').value;
      let service : any = this.form.get('service').value;
      let nameOperator : any = this.operators.find(x => x.usua_Id == operator).usua_Nombre;
      let date : any = moment().format('YYYY-MM-DD');
      let valueService : any = this.holidays.map(x => x).includes(date) ? this.services.find(x => x.svcProd_Id == service).svcProd_ValorDomFest : 
                               this.turn == 'DIA' ? this.services.find(x => x.svcProd_Id == service).svcProd_ValorDia : 
                               this.turn == 'NOCHE' ? this.services.find(x => x.svcProd_Id == service).svcProd_ValorNoche : 0;

      this.svInternalMaquila.getLastCodeMaquila().subscribe(code => {
        let info : modelMaquilas_Internas = {
          'MaqInt_Codigo': code + 1,
          'MaqInt_OT': ot,
          'Prod_Id': this.dataOrderProduction[0].item,
          'Cono_Id': this.form.value.cono,
          'Ancho_Cono': this.form.value.broadCono,
          'Tara_Cono': this.form.value.weightTare,
          'Peso_Bruto': this.form.value.weight,
          'Peso_Neto': this.form.value.netWeight,
          'Cantidad': this.form.value.netWeight,
          'Presentacion': 'Kg',
          'MaqInt_Medida': '',
          'Maquina': this.form.value.machine,
          'Operario_Id': this.form.value.operator,
          'MaqInt_Fecha': moment().format('YYYY-MM-DD'),
          'MaqInt_Hora': moment().format('HH:mm:ss'),
          'Proceso_Id': 'CORTE',
          'Estado_Id': 41,
          'SvcProd_Id': this.form.value.service,
          'MaqInt_FechaRegistro': moment().format('YYYY-MM-DD'),
          'MaqInt_HoraRegistro': moment().format('HH:mm:ss'),
          'Creador_Id': this.storage_Id,
          'MaqInt_Observacion': this.form.value.observation,
          'Material_Id': this.dataOrderProduction[0].materialId,
          'Turno_Id': this.turn,
          'Impreso': this.dataOrderProduction[0].printed,
          'MaqInt_ValorPago': valueService
        }
        this.svInternalMaquila.Post(info).subscribe(data => {
          this.selectedService = data.svcProd_Id;
          let info : any = { 'ot': data.maqInt_OT, 'service' : data.svcProd_Id, 'machine' : data.maquina, 'operator' : data.operario_Id, 'cono' : data.cono_Id }
          this.msj.mensajeConfirmacion(`Confirmación`, `Se creó el servicio de maquila interna de ${nameOperator} exitosamente!`);
          this.researchOT(info);
          //this.createPDF(code + 1, info, 'creado');
        }, error => {
          this.msj.mensajeError(`Error`, `No fue posible crear el servicio de maquila | ${error.status} ${error.statusText}`);
          this.load = false;
        });
      }, error => {
          this.msj.mensajeError(`Error`, `Error al obtener el último consecutivo de maquilas. | ${error.status} ${error.statusText}`);
          this.load = false;
      });                         
    } else this.msj.mensajeAdvertencia(`La OT del servicio no coincide con la Información de la Orden de Producción!`);
  }

  researchOT(info){
    setTimeout(() => {
      this.clearAll();
      this.form.patchValue(info);
      setTimeout(() => { this.searchOT(info.ot) }, 1500);
    }, 500);
  }

  getCurrentTurn() {
    this.svBagPro.GetHorarioProceso('EMPAQUE').subscribe(turn => { this.turn = turn.toString(); }, error => { this.msj.mensajeError(`Error`, `Errores encontrados al consultar los turno.`) });
  }

  //*FUNCIONES PARA EXPORTAR PDF.
  //Función para crear un PDF en base al registro creado.
  createPDF(code : any, info : any, action? : string) {
    this.svInternalMaquila.getInternalsMaquilasForCode(code).subscribe(data => {
      let title: string = `Maquila Interna N° ${data[0].code}`;
      let content: any[] = this.contentPDF(data);
      this.svPDF.formatoPDF(title, content);
      setTimeout(() => {
        this.clearAll();
        this.form.patchValue(info);
        setTimeout(() => { this.searchOT(data[0].ot) }, 2000);
      }, 1500);
    }, error => this.msj.mensajeError(`Error`, `Error al consultar el consecutivo de la maquila N° ${code} | ${error.status} ${error.statusText}`));
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
      if (!consolidatedInfo.map(x => x.Id).includes(d.operatorId)) {
        count++;
        let qtyRecords : number = data.filter(x => x.operatorId == d.operatorId).length;
        let totalWeight: number = 0;
        let totalPay: number = 0;
        data.filter(x => x.operatorId == d.operatorId).forEach(x => {
          totalWeight += x.netWeight;
          totalPay += x.netWeight * x.value;
        }); 
        consolidatedInfo.push({
          "#": count,
          "Id": d.operatorId,
          "Operario": d.operator,
          "Registros": qtyRecords,
          "Valor" : `$ ${this.formatonumeros((totalPay).toFixed(2))}`,
          "Peso": this.formatonumeros((totalWeight).toFixed(2)),
          "Presentación": 'Kg'
        });
      }
    });
    return consolidatedInfo;
  }

  //Funcion para colocar los detalles de los materiales en la tabla 2 
  getInfoMaterialsPDF(data: any): Array<any> {
    let info: Array<any> = [];
    let count: number = 0;
    data.forEach(d => {
      count++;
      info.push({
        "#": count,
        "Operario": d.operator,
        'Servicio' : d.service,
        'Solicita' : d.requestedBy,
        "OT" : d.ot,
        "Peso": this.formatonumeros((d.netWeight).toFixed(2)),
        "Und" : 'Kg',
        "Valor": `$ ${this.formatonumeros((d.value).toFixed(2))}`,
        "Subtotal" : `$ ${this.formatonumeros((d.netWeight * d.value).toFixed(2))}`,
      });
    });
    return info;
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
            { text: `Usuario ingreso: ${data.creator}` },
            { text: `Fecha ingreso: ${data.dateSave.replace('T00:00:00', '')}` },
            { text: `Hora ingreso: ${data.hourSave}` },
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
    let columns: Array<string> = ['#', 'Id', 'Operario', 'Registros', 'Peso', 'Presentación', 'Valor'];
    let widths: Array<string> = ['5%', '10%', '30%', '15%', '10%', '15%', '15%'];
    return {
      table: {
        headerRows: 2,
        widths: widths,
        body: this.buildTableBody1(data, columns, 'Consolidado de valores a pagar por operario'),
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
    let columns: Array<string> = ['#', 'Operario', 'Servicio', 'Solicita', 'OT', 'Peso', 'Und', 'Valor', 'Subtotal'];
    let widths: Array<string> = ['3%', '18%', '35%', '7%', '7%', '6%', '3%', '8%', '12%'];
    return {
      margin: [0, 10],
      table: {
        headerRows: 2,
        widths: widths,
        body: this.buildTableBody2(data, columns, 'Detalles de los servicios registrados'),
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
        widths: ['5%', '10%', '30%', '15%', '10%', '15%', '15%'],
        body: [
          [
            { text: ``, bold : true, border: [true, false, false, true], },
            { text: ``, bold : true, border: [false, false, false, true], },
            { text: `Totales`, alignment: 'right', bold : true, border: [false, false, false, true], },
            { text: `${this.formatonumeros((data.reduce((a, b) => a += parseInt(b.Registros), 0)))}`, bold : true, border: [true, false, true, true], },
            { text: `${this.formatonumeros((data.reduce((a, b) => a += parseFloat(b.Peso.replaceAll(',', '')), 0)).toFixed(2))}`, bold : true, border: [false, false, true, true], },
            { text: `Kg`, bold : true, border: [false, false, true, true], },
            { text: `$ ${this.formatonumeros((data.reduce((a, b) => a += parseFloat(b.Valor.replace('$ ', '').replace(',', '')), 0)).toFixed(2))}`, bold : true, border: [false, false, true, true], },
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
    body.push([{ colSpan: 9, text: title, bold: true, alignment: 'center', fontSize: 10 }, '', '', '', '', '', '', '', '']);
    body.push(columns);
    data.forEach(function (row) {
      var dataRow = [];
      columns.forEach((column) => dataRow.push(row[column].toString()));
      body.push(dataRow);
    });
    return body;
  }

}