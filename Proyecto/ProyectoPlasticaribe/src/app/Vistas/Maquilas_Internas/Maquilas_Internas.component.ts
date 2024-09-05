import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { AppComponent } from 'src/app/app.component';
import { modelMaquilas_Internas } from 'src/app/Modelo/modelMaquilas_Internas';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { ConosService } from 'src/app/Servicios/Conos/conos.service';
import { Maquilas_InternasService } from 'src/app/Servicios/Maquilas_Internas/Maquilas_Internas.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { ProcesosService } from 'src/app/Servicios/Procesos/procesos.service';
import { SedeClienteService } from 'src/app/Servicios/SedeCliente/sede-cliente.service';
import { Servicios_ProduccionService } from 'src/app/Servicios/Servicios_Produccion/Servicios_Produccion.service';
import { UsuarioService } from 'src/app/Servicios/Usuarios/usuario.service';

@Component({
  selector: 'app-Maquilas_Internas',
  templateUrl: './Maquilas_Internas.component.html',
  styleUrls: ['./Maquilas_Internas.component.css']
})

export class Maquilas_InternasComponent implements OnInit {

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
    this.svServicesProduction.GetTodo().subscribe(data => { this.services = data.filter(x => ![3].includes(x.svcProd_Id)); }, error => {
      this.msj.mensajeError(`Error`, `Error al consultar los servicios. | ${error.status} ${error.statusText}`);
    });
  }

  //Función para cargar fechas en el campo. 
  loadDate(){
    console.log(moment().add(7, 'd'));
    
    this.form.patchValue({ 'date' : new Date(moment().add(1, 'd').format('YYYY-MM-DD')) });
  }

  searchOT(){
    this.dataOrderProduction = [];
    this.load = true;
   
    this.svBagPro.GetOrdenDeTrabajo(this.form.value.ot).subscribe(data => {
      let nitCliente : any = data[0].nitCliente == null ? data[0].id_Cliente : data[0].nitCliente;
      this.svSedes.GetSedeClientexNitBagPro(nitCliente).subscribe(sede => {
        this.load = false;
        this.dataOrderProduction.push({
          'client' : sede[0].cliente, 
          'item' : data[0].id_Producto, 
          'reference' : data[0].producto, 
          'unit' : data[0].presentacion == 'Kilo' ? 'Kg' : data[0].presentacion == 'Unidad' ? 'Und' : 'Paquete', 
          'broad1' : data[0].selladoCorte_Ancho, 
          'broad2' : data[0].selladoCorte_Largo, 
          'broad3' : data[0].selladoCorte_Fuelle, 
          'unitExtrusion' : data[0].und_Extrusion, 
          'calibre' : data[0].calibre_Extrusion, 
          'material' : data[0].material.trim(),
          'broadItem' : data[0].selladoCorte_Ancho
        });
        this.buscarDatosConoSeleccionado();
      }, error => {
        this.load = false;
      });
    }, error => {
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
  async getPuertoSerial() {
    try {
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 9600 });
      this.cargarDatosPuertoSerial(port);
    } catch (ex) {
      if (ex.name === 'NotFoundError') this.msj.mensajeError('¡No se encontró báscula conectada!');
      else this.msj.mensajeError(ex);
    }
  }

  //Función que lee los datos del puerto serial
  async cargarDatosPuertoSerial(port: any) {
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
  }

  //Función que convierte un buffer a un valor
  ab2str = (buf) => String.fromCharCode.apply(null, new Uint8Array(buf));

  addService(){
    //this.getPuertoSerial();
    this.load = true;
    this.form.patchValue({ 'weight' : 10.9, 'netWeight' : 10.9 - this.form.get('weightTare').value });
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
              this.loadServicesTable(weight, netWeight);
            } else this.msj.mensajeAdvertencia(`La fecha de servicio no puede ser mayor a la fecha actual`);
          } else this.msj.mensajeAdvertencia(`El peso neto es inválido!`);
        } else this.msj.mensajeAdvertencia(`El peso bruto es inválido!`);
      } else  this.msj.mensajeAdvertencia(`Diligencie todos los campos!`);
      this.load = false;
    }, 500);
  }

  loadServicesTable(weight : number, netWeight : number){
    let operator : any = this.form.get('operator').value;
    let service : any = this.form.get('service').value;

    this.loadedServices.push({
      'operatorId' : operator, 
      'operator' : this.operators.find(x => x.usua_Id == operator).usua_Nombre,
      'serviceId' : service,
      'service' : this.services.find(x => x.svcProd_Id == service).svcProd_Nombre,
      'requestedBy' : this.services.find(x => x.svcProd_Id == service).proceso_Solicita,
      'weight' : weight,
      'netWeight' : netWeight,
      'unit' : 'Kg',
      'valueService' : this.services.find(x => x.svcProd_Id == service).svcProd_Valor,
      'subTotal' : (this.services.find(x => x.svcProd_Id == service).svcProd_Valor) * netWeight, 
      'ot' : this.form.get('ot').value,
      'machine' : this.form.value.machine,
      'date' : moment(this.form.value.date).format('YYYY-MM-DD'),
      'cono' : this.form.value.cono,
      'broadCono' : this.form.value.broadCono,
      'tareCono' : this.form.value.weightTare,
      'item' : this.dataOrderProduction[0].item,
      'observation' : this.form.value.observation,
    });

    this.msj.mensajeConfirmacion(`Confirmación`, `Se agregó correctamente el servicio al operario ${this.operators.find(x => x.usua_Id == operator).usua_Nombre}`);
    this.form.patchValue({ weight : null, netWeight : null, observation : null });
  }

  quitService(data : any){
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
  }

  clearAll(){
    this.load = false;
    this.form.reset();
    this.dataOrderProduction = [];
    this.loadedServices = [];
    this.loadDate();
  }

  createInternalMaquila(){
    this.load = true;
    let count : number = 0;
    this.svInternalMaquila.getLastCodeMaquila().subscribe(code => {
      console.log(code);
      this.loadedServices.forEach(x => {
        let info : modelMaquilas_Internas = {
          'MaqInt_Codigo': code + 1,
          'MaqInt_OT': x.ot,
          'Prod_Id': x.item,
          'Cono_Id': x.cono,
          'Ancho_Cono': x.broadCono,
          'Tara_Cono': x.tareCono,
          'Peso_Bruto': x.weight,
          'Peso_Neto': x.netWeight,
          'Cantidad': x.netWeight,
          'Presentacion': x.unit,
          'MaqInt_Medida': '',
          'Maquina': x.machine,
          'Operario_Id': x.operatorId,
          'MaqInt_Fecha': x.date,
          'Proceso_Id': 'CORTE',
          'Estado_Id': 41,
          'SvcProd_Id': x.serviceId,
          'MaqInt_FechaRegistro': moment().format('YYYY-MM-DD'),
          'MaqInt_HoraRegistro': moment().format('HH:mm:ss'),
          'Creador_Id': this.storage_Id,
          'MaqInt_Observacion' : x.observation,
        }
        this.svInternalMaquila.Post(info).subscribe(data => {
          count++
          if(count == this.loadedServices.length) {
            this.msj.mensajeConfirmacion(`Confirmación`, `Se crearon los servicios de maquila interna exitosamente!`);
            this.clearAll();
          } 
        }, error => {
          this.msj.mensajeError(`Error`, `No fue posible crear el servicio de maquila | ${error.status} ${error.statusText}`);
          this.load = false;
        });
      });
    }, error => {
        this.msj.mensajeError(`Error`, `Error al obtener el último consecutivo de maquilas. | ${error.status} ${error.statusText}`);
        this.load = false;
    });
  }
}
