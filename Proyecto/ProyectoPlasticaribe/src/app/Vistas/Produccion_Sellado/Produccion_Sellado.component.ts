import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { log } from 'console';
import moment from 'moment';
import { MessageService } from 'primeng/api';
import { Password } from 'primeng/password';
import { Table } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { modelProduccionProcesos } from 'src/app/Modelo/modelProduccionProcesos';
import { modelTrazabilidad_Produccion } from 'src/app/Modelo/modelTrazabilidad_Produccion';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { CodeBarService } from 'src/app/Servicios/CodeBar/code-bar.service';
import { TagProduction_2, modelTagProduction } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';
import { EstadosProcesos_OTService } from 'src/app/Servicios/EstadosProcesosOT/EstadosProcesos_OT.service';
import { MaquinasService } from 'src/app/Servicios/Maquinas/maquinas.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { ProcesosService } from 'src/app/Servicios/Procesos/procesos.service';
import { Produccion_ProcesosService } from 'src/app/Servicios/Produccion_Procesos/Produccion_Procesos.service';
import { ReImpresionEtiquetasService } from 'src/app/Servicios/ReImpresionEtiquetas/ReImpresionEtiquetas.service';
import { SedeClienteService } from 'src/app/Servicios/SedeCliente/sede-cliente.service';
import { TrazabilidadProduccionService } from 'src/app/Servicios/Trazabilidad_Produccion/trazabilidad-produccion.service';
import { TurnosService } from 'src/app/Servicios/Turnos/Turnos.service';
import { UsuarioService } from 'src/app/Servicios/Usuarios/usuario.service';
import { AuthenticationService } from 'src/app/_Services/authentication.service';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-Produccion_Sellado',
  templateUrl: './Produccion_Sellado.component.html',
  styleUrls: ['./Produccion_Sellado.component.css']
})

export class Produccion_SelladoComponent implements OnInit {

  cargando: boolean = false; //Variable de carga
  modoSeleccionado: boolean = false; //Variable de modo de seleccion
  formSellado !: FormGroup; //Formulario de sellado
  turnos: any[] = []; //array que contiene los diferentes turnos
  operarios: any[] = []; //array que contiene los diferentes operarios
  ordenesTrabajo: any[] = []; //array que contiene las diferentes ordenes de trabajo
  produccion: any[] = []; //array que contiene las diferentes producciones
  @ViewChild('dtProduccion') dtProduccion: Table | undefined; //Tabla de produccion
  hoy: any = moment().format('YYYY-MM-DD'); //Fecha actual
  hora: any = moment().format('HH:mm:ss'); //Hora actual
  esSoloLectura: boolean = true;  //Variable que ccolocará el campo cantidad editable o no.
  ordenConsultada: any; //Variable que guardará la orden actual consultada
  procesos: any = [{ Id: 'SELLA', Nombre: 'SELLADO' }, { Id: 'WIKE', Nombre: 'WIKETIADO' }]; //Array que guarda los procesos
  clase: any = ``; //Variable que guardará la clase que tendrá el campo cantidad realizada de la tabla
  cantBultoEstandar: number = 0; //Guardará la cantidad estandar de unidades/paquetes/kilos del bulto del item de la ot consultada
  cantActual: number = 0; //Guardará la cantidad pesada de unidades/paquetes/kilos del bulto del item de la ot consultada
  pesoActual: number = 0; //Guardará el peso actual de unidades/paquetes/kilos del bulto del item de la ot consultada
  medida: string = '';
  storage_Id: any; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre: any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol: any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol: any; //Variable que se usará en la vista para validar el tipo de rol
  maquinaConsultada: any;
  operariosConsultados: any = [];
  url: any = ``;
  repacking: boolean = false;
  maquinas: any = [];
  process: any = []; //Variable que alojará los procesos de los cuales proviene un rollo anterior
  modalRolls: boolean = false;
  rolls: any = [];
  orderProduction: any = null;
  @ViewChild('dt1') dt1: Table | undefined;
  @ViewChild('dt0') dt0: Table | undefined;
  @ViewChild('dt2') dt2: Table | undefined;
  modalPassword = false;
  form !: FormGroup; //Formulario de sellado
  packers: any = []; // Variable que guardará los nombres de los empacadores. 
  packerSelected: any;
  rollsConsolidate: any = [];
  modalAuthorizeWeight: boolean = false;
  formWeight !: FormGroup; //Formulario de autorización de pesos
  usersAuthorized: any = [];
  authUserSelected: any;
  cintaSelected: boolean = false;
  rollsReprint: any = [];
  modalReprint: boolean = false;
  supervisores: any = []
  supervisorSelected: any;

  constructor(private AppComponent: AppComponent,
    private svcTurnos: TurnosService,
    private frmBuilder: FormBuilder,
    private svcUsuarios: UsuarioService,
    private svcBagPro: BagproService,
    private svcMsjs: MensajesAplicacionService,
    private svcProdProcesos: Produccion_ProcesosService,
    private svcCrearPDF: TagProduction_2,
    private svcSedes: SedeClienteService,
    private rePrintService: ReImpresionEtiquetasService,
    private svMachines: MaquinasService,
    private router: Router,
    private svTraceability: TrazabilidadProduccionService,
    private svProcess: ProcesosService,
    private svAuthentication: AuthenticationService,
    private svStatusProcess: EstadosProcesos_OTService,
    private svCodeBar: CodeBarService,
    private msj: MessageService,
  ) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
    this.inicializarForm();
    this.inicializateFormResidues();
    this.initFormAuthorizeWeight();
  }

  ngOnInit() {
    this.lecturaStorage();
    this.getTurnos();
    this.cargarTurnoActual();
    this.url = this.router.url;
    if (this.url == '/reempaque-sellado') this.repacking = true;
    this.getOperarios();
    this.getMachines();
    this.getProcess();
    this.getPackers();
    //this.generateCodeBar()
    this.getUsersAuthorized();
    this.getSupervisores();
    // this.getPuertoSerial();
  }

  generateCodeBar() {
    this.svCodeBar.createTagProduction([]);
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage() {
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  //Función que inicializa los campos del formulario al cargar la vista
  inicializarForm() {
    this.formSellado = this.frmBuilder.group({
      ot: [null],
      turno: [null],
      idOperario: [null],
      cantUnd: [null],
      cantKg: [null],
      pesoTeorico: [null],
      pesoNeto: [null],
      maquina: [null],
      saldo: [false],
      proceso: ['SELLA'],
      mostratDatosProducto: [false],
      etiquetaAsociada: [null,],
      procesoAnterior: [null,],
      otAlterna: [null,],
      packer: [null,],
      minWeight: [null,],
      maxWeight: [null,],
      userAuthorize: [null,],
      cinta: [false],
      supervisor: [null,]
    });
    this.formSellado.get('saldo')?.disable();
  }

  inicializateFormResidues() {
    this.form = this.frmBuilder.group({
      user: [null, Validators.required],
      pass: [null, Validators.required],
    });
  }

  initFormAuthorizeWeight() {
    this.formWeight = this.frmBuilder.group({
      id: [null, Validators.required],
    });
  }

  getUsersAuthorized = () => this.svcUsuarios.getListAuthorizeUsers().subscribe(data => this.usersAuthorized = data, error => this.svcMsjs.mensajeError(error));

  //Función para obtener las maquinas
  getMachines() {
    this.svMachines.getAllMachines().subscribe(data => {
      this.maquinas = data.filter(x => ['SELLA', 'WIKE'].includes(x.proceso_Id));
      this.maquinas.sort((a, b) => Number(a.maq_Numero) - Number(b.maq_Numero));
    }, err => {
      this.svcMsjs.mensajeError('Error', `No fue posible cargar las maquinas | ${err.status} ${err.statusText}`);
    });
  }

  //Función para obtener los procesos.
  getProcess() {
    this.svProcess.srvObtenerLista().subscribe(res => {
      res.filter(x => ['EXT', 'IMP', 'ROT', 'LAM', 'DBLD', 'CORTE', 'EMP', 'MATPRIMA', 'PERF'].includes(x.proceso_Id)).forEach(process => {
        this.process.push({
          order: this.sortArrayProcess(process.proceso_Nombre),
          proceso_Id: process.proceso_Id,
          proceso_Nombre: process.proceso_Nombre,
        });
      });
      this.process.sort((a, b) => Number(a.order) - Number(b.order));
    });
  }

  //Función para ordenar los procesos.  
  sortArrayProcess(process: string) {
    let num: number = 0;
    const processMapping = {
      'EXTRUSION': 1,
      'IMPRESION': 2,
      'ROTOGRABADO': 3,
      'DOBLADO': 4,
      'LAMINADO': 5,
      'CORTE': 6,
      'EMPAQUE': 7,
      'MATPRIMA': 8,
    };
    num = processMapping[process.toUpperCase()];
    return num;
  }

  //Función que carga los puertos seriales
  cargarPuertosSeriales() {
    const serial = (navigator as any).serial;
    serial.getPorts().then((ports: any[]) => {
      ports.forEach((port: any) => {
        port.open({ baudRate: 9600 }).then(async () => this.cargarDatosPuertoSerial(port), (error: any) => this.svcMsjs.mensajeError(`${error}`));
      });
    });
  }

  //Función que obtiene los puertos seriales
  async getPuertoSerial() {
    try {
      const serial = (navigator as any).serial;
      const port = await serial.requestPort();
      await port.open({ baudRate: 9600 });
      this.cargarDatosPuertoSerial(port);
    } catch (ex: any) {
      if (ex.name === 'NotFoundError') this.svcMsjs.mensajeError('¡No se encontró una báscula conectada!');
      else this.svcMsjs.mensajeError(ex);
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
            this.formSellado.patchValue({ cantKg: valor });
          }
        }
      } catch (error) {
        console.log(error);
      } finally {
        reader.releaseLock();
      }
    }
  }

  //Función que convierte un buffer a un valor
  //ab2str = (buf) => String.fromCharCode.apply(null, new Uint8Array(buf));

  ab2str = (buf: ArrayBuffer): string => String.fromCharCode(...Array.from(new Uint8Array(buf)));

  //Función que carga los turnos en el combobox
  getTurnos = () => this.svcTurnos.srvObtenerLista().subscribe(data => this.turnos = data);

  //Función que carga los operarios de sellado
  getOperarios() {
    this.svcUsuarios.GetOperariosProduccion().subscribe(d => {
      if (this.repacking) {
        this.operarios = d.filter(x => x.usua_Id == 0);
        this.formSellado.patchValue({ 'idOperario': [0] });
      } else this.operarios = d.filter(x => x.area_Id == 10 && x.usua_Id != 0);
    });
  }

  //Función que carga los empacadores de la producción de sellado
  getPackers = () => this.svcUsuarios.GetPackersProduction('SELLADO').subscribe(data => { this.packers = data; }, error => console.log(error));

  //Función que carga los supervisores dependiendo del proceso seleccionado
  getSupervisores() {
    this.supervisores = [];
    let process : string = this.formSellado.value.proceso;
    const areas: Record<string, number> = {
      SELLA : 10,
      WIKE : 31,
    };
    if (!process) process = 'SELLA';
    const area = areas[process] ?? 34;
    this.svcUsuarios.getSupervisors(area).subscribe(data => {
      this.supervisores = data;
      //if(['DBLD', 'PERF', 'CORTE', 'LAM', 'ROT', 'EMP'].includes(process)) this.formDatosProduccion.patchValue({ supervisor: data[0].supervisor_Id });
    }, error => console.log(error));
  }

  //Función que carga el turno actual.
  cargarTurnoActual() {
    this.svcBagPro.GetHorarioProceso('SELLADO').subscribe(turno => {
      this.formSellado.patchValue({ turno: turno.toString() });
    });
  }

  //Función que limpia los campos del formulario
  limpiarCampos() {
    let mostratDatosProducto: boolean = this.formSellado.value.mostratDatosProducto;
    this.formSellado.reset();
    this.formSellado.patchValue({ mostratDatosProducto: mostratDatosProducto });
    this.ordenesTrabajo = [];
    this.produccion = [];
    this.cargando = false;
    this.esSoloLectura = true;
    this.clase = ``;
    this.formSellado.get('saldo')?.disable();
    this.cargarTurnoActual();
    this.getMachines();
    this.cantBultoEstandar = 0;
    this.medida = '';
    if (this.repacking) this.formSellado.patchValue({ 'idOperario': [0] });
    this.form.reset();
    this.rolls = [];
    this.rollsConsolidate = [];
    this.modalAuthorizeWeight = false;
  }

  //Función que filtra la info de la tabla
  aplicarfiltro = ($event, campo: any, valorCampo: string) => this.dtProduccion!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

  //Función que habilita/Deshabilita el campo Cantidad de unidades/paquetes para agregar saldos
  habilitarSaldo() {
    if (this.esSoloLectura) {
      this.loadModal();
    } else {
      this.esSoloLectura = true;
    }
  }

  //Cargar modal para solicitar clave para pesar saldo.
  loadModal() {
    this.formSellado.patchValue({ saldo: false });
    this.form.reset();
    this.esSoloLectura = false;
    this.modalPassword = true;
    this.cargando = true;
  }

  //Validar que la contraseña ingresada sea correcta.
  validatePassword() {
    let user: number = this.form.value.user;
    let pass: number = this.form.value.pass;

    this.svcUsuarios.getUsuariosxId(user).subscribe(data => {
      if (data) {
        if (data[0].usua_Contrasena == pass) {
          if ([97, 96, 86, 8, 1, 5, 12, 10].includes(data[0].rolUsu_Id)) this.msjAuthorized();
          else this.msjNoAuthorized();
        } else this.svcMsjs.mensajeError('Error', `Usuario y/o contraseña incorrectos`);
      } else this.msjNoAuthorized();
    }, error => {
      this.svcMsjs.mensajeError('Error', `Usuario y/o contraseña incorrectos | ${error.status} ${error.statusText}`);
      this.cargando = true;
    });
  }

  msjAuthorized() {
    this.modalPassword = false;
    this.cargando = false;
    setTimeout(() => {
      this.formSellado.patchValue({ saldo: true });
      this.esSoloLectura = false;
    }, 1000);
  }

  //Función para enviar un msj de que
  msjNoAuthorized() {
    this.warnMsj('Advertencia', 'Debe solicitar permisos para realizar esta acción.');
    this.cargando = true;
    this.modalPassword = true;
  }

  //Función para reiniciar el check de saldos
  rebootCheckResidues() {
    this.formSellado.patchValue({ saldo: false });
    this.esSoloLectura = true;
    this.modalPassword = false;
    this.cargando = false;
  }

  //Función que busca la orden de trabajo y carga la información
  buscarOT(validacionDatos: boolean = false, newOT?: boolean) {
    this.ordenesTrabajo = [];
    this.produccion = [];
    this.cargarTurnoActual();
    this.getMachines();
    if (newOT) this.formSellado.patchValue({ 'procesoAnterior': null, 'etiquetaAsociada': null, 'otAlterna': null, 'packer': null, 'minWeight': null, 'maxWeight': null, 'userAuthorize': null, 'cinta': false, 'supervisor': null });

    this.svcBagPro.GetOrdenDeTrabajo(this.formSellado.value.ot, `?process=${this.formSellado.value.proceso}`).subscribe(data => {
      console.log('data OT:', data);
      let nitCliente: any = data[0].nitCliente == null ? data[0].id_Cliente : data[0].nitCliente;
      this.svcSedes.GetSedeClientexNitBagPro(nitCliente).subscribe(sede => {
        if (data.length > 0) {
          this.msjTotalProduction(data);
          this.cargarCamposUltimaOT();
          this.ordenesTrabajo = data;
          this.ordenesTrabajo[0].nitCliente = sede[0].id_Cliente;
          this.cantBultoEstandar = data[0].selladoCorte_CantBolsasBulto;
          if (!validacionDatos) {
            let cantUnd: number = data[0].selladoCorte_CantBolsasBulto <= 0 ? this.formSellado.value.cantUnd : data[0].selladoCorte_CantBolsasBulto;
            this.formSellado.patchValue({ 'cantUnd': cantUnd, });
          }
          //Cinta
          if (data[0].producto.includes('CINTA')) this.formSellado.patchValue({ cinta: true });
          else this.formSellado.patchValue({ cinta: false });
          this.formSellado.get('saldo')?.enable();
          this.validarProceso();
          if (!newOT) this.updateStatesProcessOT(data[0].numero_Orden, this.formSellado.value.proceso, data[0].cantidad_Sellado, data[0].peso_Sellado);
          setTimeout(() => this.calcularPesoTeorico(), 500);
          this.claseCantidadRealizada(data[0]);
          this.cargarProduccionSellado(this.formSellado.value.ot, validacionDatos);
        }
      }, () => {
        this.svcMsjs.mensajeError(`Ocurrió un error al consultar el NIT del cliente N° ${nitCliente}!`);
        this.limpiarCampos();
      });
    }, () => {
      this.svcMsjs.mensajeError(`La OT ${this.formSellado.value.ot} no existe!`);
    });
  }

  msjTotalProduction(data: any) {
    let pedida: number = data[0].cantidad_Pedida;
    let sellada: number = data[0].cantidad_Sellado;
    let unit: string = data[0].presentacion;

    if (sellada > pedida) this.svcMsjs.mensajeAdvertencia(`La orden está sobrepasada!`, `Se solicitaron ${pedida.toLocaleString()} y se han producido ${sellada.toLocaleString()} ${unit}.`);
    else if (sellada == pedida) this.svcMsjs.mensajeAdvertencia(`Advertencia`, `La cantidad solicita es igual a la cantidad producida!`);
  }

  //Función que cargará los campos
  cargarCamposUltimaOT() {
    this.ordenConsultada = this.formSellado.value.ot;
    this.maquinaConsultada = this.formSellado.value.maquina;
    this.operariosConsultados = this.formSellado.value.idOperario;
    this.packerSelected = this.formSellado.value.packer;
    this.cintaSelected = this.formSellado.value.cinta;
    this.supervisorSelected = this.formSellado.value.supervisor;
    //this.authUserSelected = this.formSellado.value.userAuthorize;
  }

  //Función que validará el proceso de sellado según la maquina y el item de la orden de trabajo.
  validarProceso() {
    if (this.ordenesTrabajo.length > 0) {
      let esWicket: boolean = this.ordenesTrabajo[0].wicket == null ? false : true;
      if (this.formSellado.value.maquina == 9 && esWicket) this.formSellado.patchValue({ proceso: 'WIKE' });
      else this.formSellado.patchValue({ proceso: 'SELLA' });
    }
  }

  //Función que calcula el peso teorico
  calcularPesoTeorico() {
    if (this.ordenesTrabajo.length > 0) {
      let pesoTeorico: number = 0;
      let minWeight: number = 0;
      let maxWeight: number = 0;
      let pesoMillar: number = this.ordenesTrabajo[0].selladoCorte_PesoMillar;
      let cantidad: number = this.formSellado.value.cantUnd;
      let cantBolsasPaq: number = this.ordenesTrabajo[0].selladoCorte_CantBolsasPaquete;
      if (this.ordenesTrabajo[0].presentacion == 'Kilo') pesoTeorico = cantidad;
      else if (this.ordenesTrabajo[0].presentacion == 'Unidad') pesoTeorico = ((cantidad * pesoMillar) / 1000);
      else if (this.ordenesTrabajo[0].presentacion == 'Paquete' && cantidad == 1) pesoTeorico = (cantidad * pesoMillar);
      else if (this.ordenesTrabajo[0].presentacion == 'Paquete' && cantidad > 1) pesoTeorico = ((cantidad * pesoMillar * cantBolsasPaq) / 1000);
      minWeight = pesoTeorico - (pesoTeorico * 10 / 100);
      maxWeight = pesoTeorico + (pesoTeorico * 10 / 100);
      this.formSellado.patchValue({ 'pesoTeorico': pesoTeorico, 'minWeight': minWeight, 'maxWeight': maxWeight, });
    }
  }

  //Funcion que agrega una clase con un color especifico al campo cantidad realizada de la tabla.
  claseCantidadRealizada(data) {
    if (data.cantidad_Sellado == 0) this.clase = `badge bg-rojo`;
    else if (data.cantidad_Sellado > 0 && data.cantidad_Sellado < data.cantidad_Pedida) this.clase = `badge bg-amarillo`;
    else if (data.cantidad_Sellado >= data.cantidad_Pedida) this.clase = `badge bg-verde`;
    else this.clase = ``;
  }

  //Función que carga la producción de sellado para la OT consultada
  cargarProduccionSellado(ot: any, validacionDatos: boolean) {
    this.svcBagPro.GetProduccionSellado(ot).subscribe(data => {
      if (data.length > 0 && !validacionDatos) {
        this.produccion = data;
        this.cantBultoEstandar = data[0].cantidadUnd;
        this.formSellado.patchValue({ cantUnd: data[data.length - 1].cantidadUnd });
        this.produccion.sort((a, b) => a.bulto - b.bulto);
        this.medida = data[0].presentacion1;
        this.cargando = false;
        this.produccion.sort((a, b) => Number(b.bulto) - Number(a.bulto));
      } else {
        let cantUnd: number = this.formSellado.value.cantUnd || 0;
        this.formSellado.patchValue({ 'cantUnd': cantUnd, 'procesoAnterior': null, 'etiquetaAsociada': null, 'otAlterna': null });
      }
    }, () => this.svcMsjs.mensajeError(`La OT ${ot} no fue encontrada en el proceso de Sellado`));
  }

  //Función que calcula la cantidad de unidades/paquetes
  calcularCantidad = () => this.produccion.reduce((a, b) => a + b.cantidadUnd, 0);

  //Función que calcula el peso de unidades/paquetes
  calcularPeso = () => this.produccion.reduce((a, b) => a + b.peso, 0);

  //Función que valida la entrada del registro
  async validarEntrada() {
    let ot: number = this.formSellado.value.ot;
    let oldProcess: any = this.formSellado.value.procesoAnterior;
    let tag: any = this.formSellado.value.etiquetaAsociada;
    let teoricWeight: number = this.formSellado.value.pesoTeorico;
    let teoricW5PMost: number = (teoricWeight + ((teoricWeight * 10) / 100));
    let teoricW5PLess: number = (teoricWeight - ((teoricWeight * 10) / 100));
    this.cargando = true;
    //this.getPuertoSerial();
    const peso = await this.getPesoDesdeBascula();

    if (peso <= 0) {
      this.svcMsjs.mensajeAdvertencia('Peso inválido', 'No se pudo leer el peso de la báscula');
      this.cargando = false;
      return;
    }
    this.formSellado.patchValue({ cantKg: peso });
    if (this.repacking) this.formSellado.patchValue({ idOperario: [0] });

    if (this.formSellado.valid) {
      if (this.formSellado.value.ot != null && this.formSellado.value.ot != '') {
        if (this.ordenesTrabajo.length > 0) {
          if (ot == this.ordenesTrabajo[0].numero_Orden) {
            if (this.formSellado.value.maquina > 0) {
              if (this.formSellado.value.idOperario != null) {
                if ((this.formSellado.value.idOperario).length < 5) {
                  if (this.formSellado.value.packer) {
                    if (this.formSellado.value.supervisor) {
                      if (oldProcess) {
                        if (tag) {
                          if (tag.toString().length >= 6) {
                            if (this.formSellado.value.cantUnd > 0) {
                              if (this.formSellado.value.cantKg > 1 && this.formSellado.value.cantKg <= 65) {
                                if (this.esSoloLectura) {
                                  if (this.formSellado.value.cantKg >= teoricW5PLess && this.formSellado.value.cantKg <= teoricW5PMost) {
                                    this.createRecordProduction(this.ordenesTrabajo[0], tag, oldProcess);
                                  } else {
                                    if (this.formSellado.value.userAuthorize) this.createRecordProduction(this.ordenesTrabajo[0], tag, oldProcess);
                                    else {
                                      this.warnMsj(`Advertencia`, `La cantidad de kilos debe ser entre ${teoricW5PLess.toFixed(2)} y ${teoricW5PMost.toFixed(2)}!`);
                                      this.modalAuthorizeWeight = true;
                                    }
                                  }
                                } else this.createRecordProduction(this.ordenesTrabajo[0], tag, oldProcess);
                              } else this.warnMsj(`Advertencia`, `¡La cantidad de kilos debe ser mayor a '1' y menor o igual a 65!`);
                            } else this.warnMsj(`Advertencia`, `¡La cantidad en unidades/paquetes debe ser mayor a '0'!`);
                          } else this.warnMsj(`Advertencia`, `¡La cantidad de digitos del rollo madre debe ser mayor a 5!`);
                        } else this.warnMsj(`Advertencia`, `Debe agregar un número de rollo madre válido!`);
                      } else this.warnMsj(`Advertencia`, `Debe elegir el proceso madre de esta producción!`);
                    } else this.warnMsj(`Advertencia`, `Debe seleccionar un supervisor del turno actual!`);
                  } else this.warnMsj(`Advertencia`, `Debe seleccionar el 'Empacador' del rollo/bulto`);
                } else this.warnMsj(`Advertencia`, `¡Un rollo no puede ser pesado por más de 4 operarios, verifique!`);
              } else this.warnMsj(`Advertencia`, `¡Debe seleccionar al menos un operario!`);
            } else this.warnMsj(`Advertencia`, `¡Debe seleccionar una máquina válida!`);
          } else this.warnMsj(`Advertencia`, `La orden de trabajo consultada no coincide con la que desea registrar`);
        } else this.warnMsj(`Advertencia`, `¡No hay ordenes de trabajo consultadas!`);
      } else this.warnMsj(`Advertencia`, `¡Debe consultar una orden de trabajo!`);
    } else this.warnMsj(`Advertencia`, `¡Debe llenar todos los campos!`);

  }

  //Función que obtiene el peso desde la báscula conectada por puerto serial
  async getPesoDesdeBascula(): Promise<number> {
    try {
      const port = await (navigator as any).serial.requestPort();
      await port.open({ baudRate: 9600 });

      const reader = port.readable.getReader();
      let peso = 0;
      let intentos = 0;

      while (intentos < 10) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) {
          let valor = this.ab2str(value);
          valor = valor.replace(/[^\d.-]/g, '');
          let num = parseFloat(valor);
          if (!isNaN(num) && num > 0) {
            peso = num;
            break;
          }
        }
        intentos++;
      }
      reader.releaseLock();
      await port.close();
      return peso;

    } catch (ex: any) {
      if (ex.name === 'NotFoundError') {
        this.svcMsjs.mensajeError('No se encontró una báscula conectada');
        this.cargando = false;
      } else {
        this.svcMsjs.mensajeError(ex);
        this.cargando = false;
      }
      return 0; // Retorna 5 en caso de error
    }
  }

  //Crear registro de producción 
  createRecordProduction(orderProduction: any, tag: number, oldProcess: string,) {
    if (oldProcess == 'MATPRIMA') this.crearEntrada(orderProduction);
    else this.searchOldTag(orderProduction, tag, oldProcess);
  }

  //Buscar rollo madre 
  searchOldTag(dataOrderProduction: any, tag: number, process: any) {
    let ot: number = this.formSellado.value.ot;
    let otAltern: number = this.formSellado.value.otAlterna;
    let orders: any = [];

    if (ot) orders.push(ot);
    if (otAltern) orders.push(otAltern);

    this.svcBagPro.getRollProduction(tag, `?process=${this.changeNameProcess(process)}`).subscribe(data => {
      if (data)
        if (orders.includes(data.ot)) this.crearEntrada(dataOrderProduction, data);
        else this.warnMsj('Advertencia', `La etiqueta asociada no hace parte de la(s) OT's digitada(s)`);
      else this.warnMsj('Advertencia', `La etiqueta asociada no hace parte del proceso de ${this.changeNameProcess(process)}`);
    }, error => {
      this.warnMsj('Advertencia', `No se encontró información de la etiqueta asociada | ${error.status} ${error.statusText}`);
    });
  }

  //Función que crea la entrada y alista el post.
  crearEntrada(orden: any, data?: any) {
    let cinta = this.formSellado.value.cinta;
    this.getMachines();
    this.cargarTurnoActual();
    this.cargando = true;
    let entrada: modelProduccionProcesos = {
      'OT': this.formSellado.value.ot,
      'Numero_Rollo': 0,
      'Prod_Id': orden.id_Producto,
      'Cli_Id': orden.nitCliente,
      'Operario1_Id': this.repacking ? 0 : this.formSellado.value.idOperario[0],
      'Operario2_Id': this.repacking ? 0 : this.formSellado.value.idOperario[1] == undefined ? 0 : this.formSellado.value.idOperario[1],
      'Operario3_Id': this.repacking ? 0 : this.formSellado.value.idOperario[2] == undefined ? 0 : this.formSellado.value.idOperario[2],
      'Operario4_Id': this.repacking ? 0 : this.formSellado.value.idOperario[3] == undefined ? 0 : this.formSellado.value.idOperario[3],
      'Pesado_Entre': this.repacking ? 0 : (this.formSellado.value.idOperario).length,
      'Maquina': this.formSellado.value.maquina,
      'Cono_Id': 'N/A',
      'Ancho_Cono': 0,
      'Tara_Cono': 0,
      'Peso_Bruto': cinta ? Math.round(parseFloat(this.formSellado.value.cantKg)) : parseFloat(this.formSellado.value.cantKg),
      'Peso_Neto': cinta ? Math.round(parseFloat(this.formSellado.value.cantKg)) : parseFloat(this.formSellado.value.cantKg),
      'Cantidad': parseFloat(this.formSellado.value.cantUnd),
      'Peso_Teorico': parseFloat(this.formSellado.value.pesoTeorico),
      'Desviacion': (((parseFloat(this.formSellado.value.cantKg) / parseFloat(this.formSellado.value.pesoTeorico)) * 100) - 100),
      'Precio': this.validarPrecio(orden),
      'Presentacion': orden.presentacion == 'Unidad' ? 'Und' : orden.presentacion == 'Kilo' ? 'Kg' : orden.presentacion,
      'Proceso_Id': this.formSellado.value.proceso,
      'Turno_Id': this.formSellado.value.turno,
      'Envio_Zeus': false,
      'Datos_Etiqueta': `${orden.selladoCorte_Ancho} X ${orden.selladoCorte_Largo}`,
      'Fecha': moment().format('YYYY-MM-DD'),
      'Hora': moment().format('HH:mm:ss'),
      'Creador_Id': this.AppComponent.storage_Id,
      'Etiqueta_Trazabilidad': this.formSellado.value.etiquetaAsociada,
      'Empacador_Id': [undefined, null].includes(this.formSellado.value.packer) ? 0 : this.formSellado.value.packer,
      'Autoriza_Id': this.formSellado.value.userAuthorize,
      'Estado_Rollo': 19,
      'Supervisor_Id': [undefined, null].includes(this.formSellado.value.supervisor) ? 3197 : this.formSellado.value.supervisor
    }
    this.guardarRegistroEntradaNuevo(entrada, data);
  }

  //Función que guarda el registro de entrada y realiza las acciones posteriores al registro.
  guardarRegistroEntradaNuevo(entrada: any, dataTagAssociated?: any) {
    let motherProcess: any = this.formSellado.value.procesoAnterior;
    let otAltern: any = this.formSellado.value.otAlterna;
    let tagAssociated = entrada.Etiqueta_Trazabilidad ? entrada.Etiqueta_Trazabilidad : this.formSellado.value.etiquetaAsociada;
    let supervisorId = this.formSellado.value.supervisor ? this.formSellado.value.supervisor : 3197;

    this.svcProdProcesos.postProduccionProcesos(entrada).subscribe(data => {
      let supervisor = supervisorId ? this.supervisores.find(x => x.supervisor_Id === supervisorId) : null;
      console.log('PostProduccionProcesos', data);
      if (data) {
        if (data.numeroRollo_BagPro) {
          let etiqueta: modelTagProduction = {
            'client': data.cli_Nombre,
            'item': data.prod_Id,
            'reference': data.prod_Nombre,
            'width': 0,
            'height': 0,
            'bellows': 0,
            'und': '',
            'cal': 0,
            'orderProduction': data.ot,
            'material': data.material_Nombre,
            'quantity': data.peso_Neto,
            'quantity2': data.presentacion == 'Kg' ? data.peso_Neto : Math.trunc(data.cantidad),
            'reel': data.numeroRollo_BagPro ? data.numeroRollo_BagPro.toString() : '',
            'presentationItem1': 'Kg',
            'presentationItem2': data.presentacion != 'Kg' ? data.presentacion : 'Kg',
            'productionProcess': data.proceso_Nombre.toUpperCase(),
            'showNameBussiness': true,
            'operator': data.usua_Nombre,
            'copy': false,
            'dataTagForClient': '',
            'showDataTagForClient': this.formSellado.value.mostratDatosProducto ? this.formSellado.value.mostratDatosProducto : '',
            'machine': data.maquina,
            'date': data.fecha.replace('T00:00:00', ''),
            'hour': data.hora,
            'supervisor': supervisor ? supervisor.supervisor_Name : 'N/A',
          }
          this.svcCrearPDF.createTagProduction(etiqueta);
          this.createTraceability2(data, motherProcess, dataTagAssociated);
          this.loadDataInModule(motherProcess, tagAssociated, otAltern, entrada);
        } else {
          this.loadDataInModule(motherProcess, tagAssociated, otAltern, entrada);
          this.svcMsjs.mensajeAdvertencia('La etiqueta aún no está disponible, se intentará obtener en 2 segundos');
          setTimeout(() => {
            this.getEtiquetaPlasticaribe(data, tagAssociated);
          }, 2000);
        }
      } else {
        this.loadDataInModule(motherProcess, tagAssociated, otAltern, entrada);
        this.seeMsgElection();
        this.cargando = false;
      }
    }, error => {
      this.svcMsjs.mensajeError(`Error`, `Error al crear el registro de producción | ${error.status} ${error.statusText} ${error.message}`, 1200000);
    })
  }

  //Mensaje de Advertencia.
  warnMsj(msj1: any, msj2: any) {
    this.svcMsjs.mensajeAdvertencia(msj1, msj2);
    this.cargando = false;
  }

  msjsOldProcess = () => 'Selecciona el proceso madre de donde provino el rollo con el que se realizó esta producción';

  msjsOldRoll = () => 'Presiona "Enter" para cargar el modal de rollos madre.';

  msjsAltOT = () => 'Coloca el número de OT alternativa y presiona enter, para seleccionar un rollo madre de esta producción';

  msjsMinWeight = () => 'Rango de peso (10%) minímo permitido para realizar el pesaje de producción';

  msjsMaxWeight = () => 'Rango de peso (10%) maxímo permitido para realizar el pesaje de producción';



  validarPrecio(datosOrden: any): number {
    let precio: number = 0;
    let maquina: number = this.formSellado.value.maquina;
    let proceso: string = this.formSellado.value.proceso;
    let turno: string = this.formSellado.value.turno;

    if (proceso == 'SELLA') {
      if (maquina == 50) {
        if (turno == 'DIA') precio = datosOrden.selladoCorte_PrecioDia_Wik_Mq50;
        else if (turno == 'NOCHE') precio = datosOrden.selladoCorte_PrecioNoche_Wik_Mq50;
      } else if (maquina == 9) {
        if (turno == 'DIA') precio = datosOrden.selladoCorte_PrecioDia_Wik_Mq9;
        else if (turno == 'NOCHE') precio = datosOrden.selladoCorte_PrecioNoche_Wik_Mq9;
      } else {
        if (turno == 'DIA') precio = datosOrden.selladoCorte_PrecioSelladoDia;
        else if (turno == 'NOCHE') precio = datosOrden.selladoCorte_PrecioSelladoNoche;
      }
    } else if (proceso == 'WIKE') {
      if (maquina == 50) {
        if (turno == 'DIA') precio = datosOrden.selladoCorte_PrecioDia_Wik_Mq50;
        else if (turno == 'NOCHE') precio = datosOrden.selladoCorte_PrecioNoche_Wik_Mq50;
      } else if (maquina == 9) {
        if (turno == 'DIA') precio = datosOrden.selladoCorte_PrecioDia_Wik_Mq9;
        else if (turno == 'NOCHE') precio = datosOrden.selladoCorte_PrecioNoche_Wik_Mq9;
      }
    }
    return precio;
  }

  //Función que guarda el registro del rollo en la BD
  guardarRegistroEntrada(entrada: any, dataTagAssociated?: any) {
    let motherProcess: any = this.formSellado.value.procesoAnterior;
    let otAltern: any = this.formSellado.value.otAlterna;
    this.svcProdProcesos.postProduccionProcesos(entrada).subscribe(data => {
      console.log('PostProduccionProcesos', data);
      this.getEtiquetaPlasticaribe(data, dataTagAssociated);

      //this.crearEtiqueta(data.numero_Rollo, data.peso_Neto, data.cantidad, data.presentacion, false, data.operario1_Id, data.datos_Etiqueta, data, motherProcess, dataTagAssociated);
      //setTimeout(() => {
      if (entrada.Desviacion < 0) this.svcMsjs.mensajeAdvertencia(`¡La cantidad pesada es menor a la esperada!`, `!Registro de rollo de producción creado con éxito¡`, 1200000);
      else this.svcMsjs.mensajeConfirmacion('Confirmación', `Registro de rollo de producción creado con éxito!`);
      this.cargarCamposUltimaOT();
      this.limpiarCampos();
      this.formSellado.patchValue({
        'ot': this.ordenConsultada,
        'maquina': this.maquinaConsultada,
        'idOperario': this.operariosConsultados,
        'procesoAnterior': motherProcess,
        'etiquetaAsociada': entrada.Etiqueta_Trazabilidad,
        'otAlterna': otAltern,
        'packer': this.packerSelected,
        'userAuthorize': this.authUserSelected,
        'cinta': this.cintaSelected,
        'supervisor': this.supervisorSelected
      });
      this.buscarOT();
      //}, 1000);
    }, () => this.svcMsjs.mensajeError(`Error`, `No fue posible crear el registro de entrada de producción!`))
  }

  //Función que muestra un mensaje para elegir imprimir la etiqueta nuevamente
  seeMsgElection = () => this.msj.add({ severity: 'warn', key: 'etiqueta', summary: 'Elección', detail: `No se imprimió la etiqueta, ¿desea tratar de imprimirla nuevamente?`, sticky: true });

  //
  onReject = (key: any) => this.msj.clear(key);

  //Función que carga la información después de crear el registro de producción, para evitar que el usuario tenga que volver a cargar la OT para ver reflejada la información.
  loadDataInModule(motherProcess: any, tagAssociated: any, otAltern: any, entrada: any) {
    if (entrada.Desviacion < 0) this.svcMsjs.mensajeAdvertencia(`¡La cantidad pesada es menor a la esperada!`, `Registro de rollo de producción creado con éxito¡`);
    else this.svcMsjs.mensajeConfirmacion('Confirmación', `Registro de rollo de producción creado con éxito!`);

    this.cargarCamposUltimaOT();
    this.limpiarCampos();
    this.formSellado.patchValue({
      'ot': this.ordenConsultada,
      'maquina': this.maquinaConsultada,
      'idOperario': this.operariosConsultados,
      'procesoAnterior': motherProcess,
      'etiquetaAsociada': tagAssociated,
      'otAlterna': otAltern,
      'packer': this.packerSelected,
      'userAuthorize': this.authUserSelected,
      'cinta': this.cintaSelected,
      'supervisor': this.supervisorSelected
    });
    this.buscarOT();
  }

  //Nueva etiqueta
  getEtiquetaPlasticaribe(data: any, tagAssociated) {
    let motherProcess: any = this.formSellado.value.procesoAnterior;
    this.svcProdProcesos.getEtiquetaForId(data.id).subscribe(etiquetaData => {
      console.log(etiquetaData);
      if (etiquetaData) {
        let etiqueta: modelTagProduction = {
          'client': etiquetaData.cli_Nombre,
          'item': etiquetaData.prod_Id,
          'reference': etiquetaData.prod_Nombre,
          'width': 0,
          'height': 0,
          'bellows': 0,
          'und': '',
          'cal': 0,
          'orderProduction': etiquetaData.ot,
          'material': etiquetaData.material_Nombre,
          'quantity': etiquetaData.peso_Neto,
          'quantity2': etiquetaData.presentacion == 'Kg' ? etiquetaData.peso_Neto : Math.trunc(etiquetaData.cantidad),
          'reel': etiquetaData.numeroRollo_BagPro,
          'presentationItem1': 'Kg',
          'presentationItem2': etiquetaData.presentacion != 'Kg' ? etiquetaData.presentacion : 'Kg',
          'productionProcess': etiquetaData.proceso_Nombre.toUpperCase(),
          'showNameBussiness': true,
          'operator': etiquetaData.usua_Nombre,
          'copy': false,
          'dataTagForClient': '',
          'showDataTagForClient': this.formSellado.value.mostratDatosProducto ? this.formSellado.value.mostratDatosProducto : '',
          'machine': etiquetaData.maquina,
          'date': etiquetaData.fecha.replace('T00:00:00', ''),
          'hour': etiquetaData.hora
        }
        this.svcCrearPDF.createTagProduction(etiqueta);
        this.createTraceability2(etiquetaData, motherProcess, tagAssociated);
        this.modalReprint = false;
      } else {
        console.log('Entrada 2');
      }
    }, error => {

    })
  }

  //* Nueva trazabilidad
  createTraceability2(productionProcess: any, motherProcess: string, infoTagAssociated?: number) {
    this.svTraceability.PostTraceability(this.modelTraceability2(productionProcess, motherProcess, infoTagAssociated)).subscribe(trace => {
    }, error => {
      this.svcMsjs.mensajeError(`Error`, `Error al crear el registro de trazabilidad | ${error.status} ${error.statusText}`);
      this.cargando = false;
    });
  }

  //Nuevo modelo. 
  modelTraceability2(productionPL: any, motherProcess: string, infoTagAssociated?: any) {
    console.log(`modelTraceability2:`, productionPL, motherProcess, infoTagAssociated);

    let info: modelTrazabilidad_Produccion = {
      'Trz_Etiqueta': productionPL.numeroRollo_BagPro,
      'Trz_Ot': productionPL.ot,
      'Prod_Id': productionPL.prod_Id,
      'Cli_Id': productionPL.cli_Id,
      'Proceso_Id': productionPL.proceso_Id,
      'Trz_Fecha': productionPL.fecha,
      'Trz_Hora': productionPL.hora,
      'Trz_PesoNeto': productionPL.peso_Neto,
      'Trz_PesoBruto': productionPL.peso_Bruto,
      'Trz_Cantidad': productionPL.cantidad,
      'Presentacion': productionPL.presentacion,
      'Trz_Maquina': productionPL.maquina,
      'Operario_1': productionPL.operario1_Id,
      'Operario_2': productionPL.operario2_Id == null ? 0 : productionPL.operario2_Id,
      'Operario_3': productionPL.operario3_Id == null ? 0 : productionPL.operario3_Id,
      'Operario_4': productionPL.operario4_Id == null ? 0 : productionPL.operario4_Id,
      'Empacador_Id': [undefined, null].includes(productionPL.empacador_Id) ? 0 : productionPL.empacador_Id,
      'Turno_Id': productionPL.turno_Id,
      'Trz_EtiquetaAnterior': infoTagAssociated ? infoTagAssociated.rollo : this.formSellado.value.etiquetaAsociada,
      'Trz_OtAnterior': infoTagAssociated ? infoTagAssociated.ot : null,
      'Prod_Anterior': infoTagAssociated ? infoTagAssociated.item : 1,
      'Proceso_Anterior': motherProcess,
      'Autoriza_Id': productionPL.autoriza_Id,
    }
    return info;
  }

  //Función que obtiene los datos de la etiqueta para reimpresión
  getDataReprintTag() {
    this.modalReprint = true;
    let ot: number = this.formSellado.value.ot;
    let process: string = this.formSellado.value.proceso;
    this.rollsReprint = [];
    this.onReject('etiqueta');

    this.svcProdProcesos.getEtiquetaForOT(ot, process).subscribe(data => {
      if (data) {
        this.rollsReprint = data;
        this.rollsReprint.sort((a, b) => Number(b.numeroRollo_BagPro) - Number(a.numeroRollo_BagPro));
        console.log(this.rollsReprint);
      }
    }, error => {
      console.log(error);
    })
  }

  //****** Función que guarda el registro del rollo en la BD (Versión 2 para repacking) ******//
  guardarRegistroEntrada2(entrada: any, dataTagAssociated?: any) {
    let motherProcess = this.formSellado.value.procesoAnterior;
    let otAltern = this.formSellado.value.otAlterna;

    this.svcProdProcesos.Post(entrada).subscribe(data => {
      if (!data.numeroRollo_BagPro) {
        this.svcMsjs.mensajeAdvertencia(
          'Etiqueta no disponible aún',
          'El rollo se creó pero la etiqueta aún no está lista'
        );
        return;
      }

      // USAR ROLLO BAGPRO
      this.crearEtiqueta(
        data.numeroRollo_BagPro,   //  CORRECTO
        data.peso_Neto,
        data.cantidad,
        data.presentacion,
        false,
        data.operario1_Id,
        data.datos_Etiqueta,
        data,
        motherProcess,
        dataTagAssociated
      );

      // UI (esto sí puede ir después)
      this.svcMsjs.mensajeConfirmacion(
        'Confirmación',
        'Registro de rollo creado con éxito'
      );

      this.cargarCamposUltimaOT();
      this.limpiarCampos();
      this.formSellado.patchValue({
        'ot': this.ordenConsultada,
        'maquina': this.maquinaConsultada,
        'idOperario': this.operariosConsultados,
        'procesoAnterior': motherProcess,
        'etiquetaAsociada': data.etiqueta_Trazabilidad,
        'otAlterna': otAltern,
        'packer': this.packerSelected,
        'userAuthorize': this.authUserSelected,
        'cinta': this.cintaSelected,
        'supervisor': this.supervisorSelected,
      });

      this.buscarOT();
    },
      () => this.svcMsjs.mensajeError(
        'Error',
        'No fue posible crear el registro de entrada de producción'
      ));
  }

  //Función que crea el pdf de la etiqueta
  crearEtiqueta(rollo: any, cantKg: number, cantUnd: number, medida: any, reimpresion: boolean, operador: any, datosEtiqueta: string = '', productionPL: any, motherProcess: string, tagAssociated?: any) {
    let dataRollo: any = reimpresion ? this.produccion.find(x => x.bulto == rollo).proceso : this.procesos.find(x => x.Id == this.formSellado.value.proceso).Nombre;
    let operario: any;
    if (!reimpresion) operario = this.operarios.filter(x => x.usua_Id == operador);
    else if (reimpresion) operario = this.operarios.filter(x => x.usua_Nombre == operador);

    this.svcBagPro.GetEtiquetaBagpro(rollo, !reimpresion ? 0 : 1).subscribe(data => {
      let etiqueta: modelTagProduction = {
        'client': data[0].cliente,
        'item': data[0].id_Producto,
        'reference': data[0].producto,
        'width': data[0].ancho1_Extrusion,
        'height': data[0].ancho2_Extrusion,
        'bellows': data[0].ancho3_Extrusion,
        'und': data[0].und_Extrusion,
        'cal': data[0].calibre_Extrusion,
        'orderProduction': this.formSellado.value.ot,
        'material': data[0].material,
        'quantity': cantKg,
        'quantity2': medida == 'Kg' ? cantKg : Math.trunc(cantUnd),
        'reel': data[0].bulto,
        'presentationItem1': 'Kg',
        'presentationItem2': medida != 'Kg' ? `${medida}(s)` : 'Kg',
        'productionProcess': (dataRollo).toUpperCase(),
        'showNameBussiness': true,
        'operator': operario[0].usua_Nombre == '0' ? '' : operario[0].usua_Nombre,
        'copy': reimpresion,
        'dataTagForClient': datosEtiqueta,
        'showDataTagForClient': this.formSellado.value.mostratDatosProducto ? this.formSellado.value.mostratDatosProducto : '',
      }
      this.svcCrearPDF.createTagProduction(etiqueta);
      this.createTraceability(productionPL, data, motherProcess, tagAssociated);
    }, () => { this.svcMsjs.mensajeError(`Error`, `No fue posible generar la etiqueta, por favor verifique!`) });
  }

  //Cambiar nombre de proceso de bagpro a plasticaribe
  changeNameProcess(process: string) {
    switch (process) {
      case 'EXT':
        return 'EXTRUSION';
      case 'IMP':
        return 'IMPRESION';
      case 'LAM':
        return 'LAMINADO';
      case 'CORTE':
        return 'CORTE';
      case 'DBLD':
        return 'DOBLADO';
      case 'EMP':
        return 'EMPAQUE';
      case 'SELLA':
        return 'SELLADO';
      case 'ROT':
        return 'ROTOGRABADO';
      case 'MATPRIMA':
        return 'MATPRIMA';
      case 'PERF':
        return 'PERFORADO';
      default:
        return '';
    }
  }

  //Cambiar nombre de proceso de plasticaribe a bagpro
  changeProcessInverse(process: string) {
    switch (process) {
      case 'EXTRUSION':
        return 'EXT';
      case 'IMPRESION':
        return 'IMP';
      case 'LAMINADO':
        return 'LAM';
      case 'CORTE':
        return 'CORTE';
      case 'DOBLADO':
        return 'DBLD';
      case 'EMPAQUE':
        return 'EMP';
      case 'SELLADO':
        return 'SELLA';
      case 'ROTOGRABADO':
        return 'ROT';
      case 'MATPRIMA':
        return 'MATPRIMA';
      case 'PERFORADO':
        return 'PERF';
      default:
        return '';
    }
  }

  //Modelo de trazabilidad
  modelTraceability(productionPL: any, produccionBagPro: any, motherProcess: string, infoTagAssociated?: any) {
    let info: modelTrazabilidad_Produccion = {
      'Trz_Etiqueta': produccionBagPro[0].bulto,
      'Trz_Ot': productionPL.ot,
      'Prod_Id': productionPL.prod_Id,
      'Cli_Id': productionPL.cli_Id,
      'Proceso_Id': productionPL.proceso_Id,
      'Trz_Fecha': productionPL.fecha,
      'Trz_Hora': productionPL.hora,
      'Trz_PesoNeto': productionPL.peso_Neto,
      'Trz_PesoBruto': productionPL.peso_Bruto,
      'Trz_Cantidad': productionPL.cantidad,
      'Presentacion': productionPL.presentacion,
      'Trz_Maquina': productionPL.maquina,
      'Operario_1': productionPL.operario1_Id,
      'Operario_2': productionPL.operario2_Id == null ? 0 : productionPL.operario2_Id,
      'Operario_3': productionPL.operario3_Id == null ? 0 : productionPL.operario3_Id,
      'Operario_4': productionPL.operario4_Id == null ? 0 : productionPL.operario4_Id,
      'Empacador_Id': [undefined, null].includes(productionPL.empacador_Id) ? 0 : productionPL.empacador_Id,
      'Turno_Id': productionPL.turno_Id,
      'Trz_EtiquetaAnterior': infoTagAssociated ? infoTagAssociated.rollo : this.formSellado.value.etiquetaAsociada,
      'Trz_OtAnterior': infoTagAssociated ? infoTagAssociated.ot : null,
      'Prod_Anterior': infoTagAssociated ? infoTagAssociated.item : 1,
      'Proceso_Anterior': motherProcess,
      'Autoriza_Id': productionPL.autoriza_Id,
    }
    return info;
  }

  //Crear registro de trazabilidad. 
  createTraceability(productionProcess: any, infoTagBagPro: any, motherProcess: string, infoTagAssociated?: number) {
    this.svTraceability.PostTraceability(this.modelTraceability(productionProcess, infoTagBagPro, motherProcess, infoTagAssociated)).subscribe(trace => {
    }, error => {
      this.svcMsjs.mensajeError(`Error`, `Error al crear el registro de trazabilidad | ${error.status} ${error.statusText}`);
      this.cargando = false;
    });
  }

  //Validar información de rollos por OT
  validateOrderProduction(typeOT: string) {
    this.rollsConsolidate = [];
    this.rolls = [];
    let ot: number = typeOT == 'altern' ? ![null, '', undefined].includes(this.formSellado.value.otAlterna) ? this.formSellado.value.otAlterna : this.formSellado.value.ot : this.formSellado.value.ot;
    let motherProcess: string = this.formSellado.value.procesoAnterior;

    this.orderProduction = null;

    if (ot && motherProcess) {
      this.cargando = true;
      this.svcBagPro.GetObtenerDatosxProcesos(ot, this.changeNameProcess(motherProcess)).subscribe(data => {
        if (data) {
          if (data.length > 0) {
            this.modalRolls = true;
            this.rolls = data;
            this.cargando = false;
            this.orderProduction = ot;
            this.consolidateProduction();
          } else this.warnMsj(`Advertencia`, `No se encontró producción de la OT ${ot} en ${this.changeNameProcess(motherProcess)}`);
        } else {
          this.warnMsj(`Advertencia`, `No se encontraron rollos de la OT ${ot} en el proceso de ${this.changeNameProcess(motherProcess)}`);
          this.orderProduction = ot;
        }
      }, error => { this.warnMsj(`Error`, `Error al consultar rollos de la OT ${ot} en el proceso de ${this.changeNameProcess(motherProcess)} | ${error.status} ${error.statusText}`); });
    } else this.warnMsj(`Advertencia`, `Debe diligenciar los campos 'Proceso Madre' y 'OT'`);

  }

  consolidateProduction() {
    this.rollsConsolidate = this.rolls.reduce((a, b) => {
      if (!a.map(x => x.item).includes(b.item)) a = [...a, b];
      return a;
    }, []);
  }

  getTotalWeight = () => this.rolls.reduce((a, b) => a += b.peso1, 0);

  totalRolls = () => this.rolls.length;

  //Función para cargar los rollos madres de bulto
  loadMotherRolls(tag: any, process: string) {
    this.modalRolls = false;
    this.formSellado.patchValue({ 'etiquetaAsociada': tag });
    this.svcMsjs.mensajeConfirmacion(`Confirmación`, `Se asoció el rollo madre N° ${tag} del proceso de ${process} exitosamente!`);
  }

  //Filtrar la tabla de los rollos cargados en el modal.
  applyFilter = ($event, campo: any, actionField: any) => this.dt1!.filter(($event.target as HTMLInputElement).value, campo, actionField);

  //Función para inactivar el campo OT alterna
  changeOldProcess() {
    let motherProcess: any = this.formSellado.value.procesoAnterior;
    if (motherProcess == 'MATPRIMA') {
      this.formSellado.patchValue({ etiquetaAsociada: null, otAnterior: null });
    }
  }

  //Actualizar pesaje en estados procesos OT. 
  updateStatesProcessOT(ot: any, process: string, qty: number, weight: number,) {
    this.svStatusProcess.putStatusProcessOT(ot, process, qty, weight).subscribe(dataUpdate => {
      console.log(dataUpdate);
    }, error => {
      console.log(error);
    });
  }

  //
  authorizeWeight() {
    let id: number = this.formWeight.value.id;
    this.svcUsuarios.GetUsersAthorizedForTeoricWeight(id).subscribe(data => {
      if (data) {
        if (data.length > 0) {
          let user: number = data[0].user_Id;
          let index: number = this.usersAuthorized.findIndex(x => x.user_Id == user);
          this.svcMsjs.mensajeConfirmacion(`Confirmación`, `Autorizado exitosamente por ${data[0].userName}!`);
          this.modalAuthorizeWeight = false;
          this.formSellado.patchValue({ 'userAuthorize': this.usersAuthorized[index].user_Id });
          this.formWeight.reset();
        } else this.msjAuthorize(`Advertencia`, `Usuario sin autorización para realizar esta acción!`);
      } else this.msjAuthorize(`Advertencia`, `Usuario no autorizado para realizar esta acción!`);
    }, error => {
      this.msjAuthorize(`Advertencia`, `El usuario no tiene permisos para realizar esta acción!`);
    });
  }

  //Mensaje de advertencia por no autorización de pesos teoricos.
  msjAuthorize(msj1: string, msj2: string) {
    this.svcMsjs.mensajeAdvertencia(msj1, msj2);
    this.formWeight.reset();
  }

}
