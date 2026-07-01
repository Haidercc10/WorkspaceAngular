import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { cA } from '@fullcalendar/core/internal-common';
import { error, log } from 'console';
import { subscribe } from 'diagnostics_channel';
import moment from 'moment';
import { Table } from 'primeng/table';
import { modelProduccionProcesos } from 'src/app/Modelo/modelProduccionProcesos';
import { modelTrazabilidad_Produccion } from 'src/app/Modelo/modelTrazabilidad_Produccion';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { ClientesService } from 'src/app/Servicios/Clientes/clientes.service';
import { ConosService } from 'src/app/Servicios/Conos/conos.service';
import { TagProduction_2, modelTagProduction } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';
import { EstadosProcesos_OTService } from 'src/app/Servicios/EstadosProcesosOT/EstadosProcesos_OT.service';
import { MaquinasService } from 'src/app/Servicios/Maquinas/maquinas.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { Orden_TrabajoService } from 'src/app/Servicios/OrdenTrabajo/Orden_Trabajo.service';
import { ProcesosService } from 'src/app/Servicios/Procesos/procesos.service';
import { Produccion_ProcesosService } from 'src/app/Servicios/Produccion_Procesos/Produccion_Procesos.service';
import { ProductoService } from 'src/app/Servicios/Productos/producto.service';
import { ReImpresionEtiquetasService } from 'src/app/Servicios/ReImpresionEtiquetas/ReImpresionEtiquetas.service';
import { SedeClienteService } from 'src/app/Servicios/SedeCliente/sede-cliente.service';
import { TrazabilidadProduccionService } from 'src/app/Servicios/Trazabilidad_Produccion/trazabilidad-produccion.service';
import { TurnosService } from 'src/app/Servicios/Turnos/Turnos.service';
import { UnidadMedidaService } from 'src/app/Servicios/UnidadMedida/unidad-medida.service';
import { UsuarioService } from 'src/app/Servicios/Usuarios/usuario.service';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-Produccion_Extrusion',
  templateUrl: './Produccion_Extrusion.component.html',
  styleUrls: ['./Produccion_Extrusion.component.css']
})

export class Produccion_ExtrusionComponent implements OnInit, OnDestroy {

  cargando: boolean = false;
  storage_Id: number;
  ValidarRol: number;
  modoSeleccionado: boolean = false;
  formDatosProduccion !: FormGroup;
  formWeight !: FormGroup;
  turnos: Array<any> = [];
  unidadesMedida: Array<any> = [];
  operarios: Array<any> = [];
  conos: Array<any> = [];
  proceso: string = ``;
  process: Array<any> = [];
  rollosPesados: Array<any> = [];
  datosOrdenTrabajo: Array<any> = [];
  showNameBussiness: boolean = true;
  port: SerialPort;
  reader: any;
  reference: string = ``;
  nuevoAnchoProducto: number = null;
  //url : string = ``; 
  rebobinado: boolean = false;
  maquinas: any = [];
  rolls: any = [];
  orderProduction: number = null;
  modalRolls: boolean = false;
  packers: any = [];
  @ViewChild('dt1') dt1: Table | undefined;
  @ViewChild('dt0') dt0: Table | undefined;
  rollsConsolidate: any = [];
  @ViewChild('dtProduccion') dtProduccion: Table | undefined;
  processProduction: boolean = false;
  clase: any = ``;
  client: number = null;
  clientsRestrictionWeight: any = [];
  modalAuthorizeWeight: boolean = false;
  usersAuthorized: any = [];
  supervisores: any = []; //Array de supervisores para medir productividad de supervisores

  constructor(private frmBuilder: FormBuilder,
    private appComponent: AppComponent,
    private turnosService: TurnosService,
    private operariosService: UsuarioService,
    private unidadMedidaService: UnidadMedidaService,
    private conosService: ConosService,
    private productoService: ProductoService,
    private bagproService: BagproService,
    private msj: MensajesAplicacionService,
    private produccionProcesosService: Produccion_ProcesosService,
    private createPDFService: TagProduction_2,
    private clientsService: SedeClienteService,
    private processService: ProcesosService,
    private orderProductionsService: Orden_TrabajoService,
    private rePrintService: ReImpresionEtiquetasService,
    private svMachines: MaquinasService,
    private svTraceability: TrazabilidadProduccionService,
    private svStatusProcess: EstadosProcesos_OTService,
    private svClients: ClientesService,
    private svUsers: UsuarioService,
    //private svRouter : Router,
  ) {

    this.modoSeleccionado = this.appComponent.temaSeleccionado;
    this.formDatosProduccion = this.frmBuilder.group({
      ordenTrabajo: [null, Validators.required],
      idCliente: [null, Validators.required],
      cliente: [null, Validators.required],
      item: [null, Validators.required],
      referencia: [null, Validators.required],
      turno: [null, Validators.required],
      ancho1: [null, Validators.required],
      ancho2: [null, Validators.required],
      ancho3: [null, Validators.required],
      undExtrusion: [null, Validators.required],
      pesoExtruir: [null, Validators.required],
      calibre: [null, Validators.required],
      material: [null, Validators.required],
      maquina: [null, Validators.required],
      operario: [null, Validators.required],
      cono: [null, Validators.required],
      anchoCono: [null, Validators.required],
      pesoTara: [null, Validators.required],
      pesoBruto: [null, Validators.required],
      pesoNeto: [null, Validators.required],
      presentacion: [null, Validators.required],
      daipita: [null],
      proceso: [null, Validators.required],
      anchoProducto: [null],
      mostratDatosProducto: [false],
      edicionAnchoProducto: [false],
      rebobinado: [false],
      etiquetaAsociada: [null,],
      procesoAnterior: [null,],
      otAlterna: [null,],
      packer: [null,],
      pesoMin: [null,],
      pesoMax: [null,],
      observacion: [null,],
      userAuthorize: [null,],
      supervisor: [null,],
    });
    this.initFormAuthorizeWeight();
  }

  ngOnInit() {
    //this.url = this.svRouter.url;
    //if(this.url = `/rebobinado-corte`) this.rebobinado = true;
    //console.log(this.rebobinado);
    this.lecturaStorage();
    this.obtenerUnidadMedida();
    this.obtenerConos();
    this.getProcess();
    this.validarProceso();
    this.obtenerOperarios();
    //setTimeout(() => {
    //this.buscarPuertos()
    this.getMachines();
    
    this.getUsersAuthorized();
    this.getClientsWithRestrictionWeight();
    this.getSupervisores();
    //this.updateStatesProcessOT([]);
    //}, 1000); 
  }

  //Función para obtener las maquinas
  getMachines() {
    this.svMachines.getAllMachines().subscribe(data => {
      this.maquinas = data.filter(x => x.proceso_Id == this.validateProcess());
      this.maquinas.sort((a, b) => Number(a.maq_Numero) - Number(b.maq_Numero));
    }, err => {
      this.msj.mensajeError('Error', 'No fue posible cargar las maquinas');
    });
  }

  async ngOnDestroy() {
    this.reader.releaseLock();
    this.reader.cancel();
    await this.port.close();
  }

  errorMessage(message: string, error: HttpErrorResponse) {
    this.cargando = false;
    this.msj.mensajeError(message, `Error: ${error.statusText} | Status: ${error.status}`);
  }

  warinigMessage(message: string, production?) {
    this.cargando = false;
    this.msj.mensajeAdvertencia(message);
    production ? this.clearWeight() : null;
  }

  clearWeight() {
    this.formDatosProduccion.patchValue({ 'pesoBruto': null, 'pesoNeto': null, })
  }

  exitMessage(message: string) {
    this.cargando = false;
    this.msj.mensajeConfirmacion(message);
  }

  aplicarfiltro = ($event, campo: any, valorCampo: string) => this.dtProduccion!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

  lecturaStorage() {
    this.storage_Id = this.appComponent.storage_Id;
    this.ValidarRol = this.appComponent.storage_Rol;
  }

  validarProceso() {
    const process: any = {
      7: 'Extrusión',
      74: 'Extrusión',
      62: 'Impresión',
      75: 'Impresión',
      63: 'Rotograbado',
      76: 'Rotograbado',
      70: 'Laminado',
      77: 'Laminado',
      71: 'Doblado',
      78: 'Doblado',
      72: 'Corte',
      79: 'Corte',
      9: 'Empaque',
      80: 'Empaque',
      101: 'Perforado',
      81: 'Sellado',
      8: 'Sellado',
    };
    if (this.ValidarRol != 1) {
      this.proceso = process[this.ValidarRol];
      this.formDatosProduccion.patchValue({ proceso: this.validateProcess() });
    } else {
      this.proceso = this.formDatosProduccion.value.proceso;
      this.validateProcess();
    }
    this.obtenerTurnos();
    this.getPackers(this.proceso.toUpperCase());
  }

  //Función que obtiene los clientes con restricción de peso
  getClientsWithRestrictionWeight() {
    this.clientsRestrictionWeight = [];
    this.svClients.getClientsWithRestrictionWeight().subscribe(data => {
      if (data) {
        if (data.length > 0) {
          data.forEach(x => this.clientsRestrictionWeight.push(x.cli_Id));
        } else this.clientsRestrictionWeight = [];
      } else this.clientsRestrictionWeight = [];
      console.log(this.clientsRestrictionWeight);
    }, error => console.log(error));
  }

  //Función que obtiene los puertos seriales
  async getPuertoSerial() {
    try {
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 9600 });
      this.cargarDatosPuertoSerial(port);
    } catch (ex) {
      if (ex.name === 'NotFoundError') this.msj.mensajeError('¡No se encontró una báscula conectada!');
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
            let tara: number = this.formDatosProduccion.value.pesoTara;
            valor = valor.replace(/[^\d.-]/g, '');
            this.formDatosProduccion.patchValue({ 'pesoBruto': valor, 'pesoNeto': valor - tara });
          }
        }
      } catch (error) {
        console.log(error);
      } finally {
        reader.releaseLock();
      }
    }
  }

  //3
  /*chargeSerialPorts() {
    navigator.serial.getPorts().then((ports) => {
      ports.forEach((port) => {
        port.open({ baudRate: 9600 }).then(async () => this.chargeDataFromSerialPort(port), error => this.msj.mensajeError(`${error}`));
      });
    });
  }

  //1
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

  //2
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
            if (!this.cargando) {
              this.formDatosProduccion.patchValue({
                pesoBruto: valor,
                pesoNeto: valor - this.formDatosProduccion.value.pesoTara,
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
  }*/

  ab2str = (buf) => String.fromCharCode.apply(null, new Uint8Array(buf));

  eliminarDiacriticos = (texto) => texto.normalize('NFD').replace(/[\u0300-\u036f]/g, "");

  limpiarCampos(consulta: boolean) {
    this.cargando = false;
    let mostratDatosProducto: boolean = this.formDatosProduccion.value.mostratDatosProducto;
    this.formDatosProduccion.reset();
    this.formDatosProduccion.patchValue({ mostratDatosProducto: mostratDatosProducto });
    this.getMachines();
    this.obtenerTurnos();
    this.datosOrdenTrabajo = [];
    this.rollosPesados = [];
    this.validarProceso();
    consulta ? this.nuevoAnchoProducto = null : null;
    this.rolls = [];
    this.clase = ``;
    this.getClientsWithRestrictionWeight();
  }

  getProcess() {
    this.processService.srvObtenerLista().subscribe(res => {
      res.filter(x => ['EXT', 'IMP', 'ROT', 'LAM', 'DBLD', 'CORTE', 'EMP', 'MATPRIMA', 'PERF', 'SELLA'].includes(x.proceso_Id)).forEach(process => {
        this.process.push({
          order: this.sortArrayProcess(process.proceso_Nombre),
          proceso_Id: process.proceso_Id,
          proceso_Nombre: process.proceso_Nombre,
        });
      });
      this.process.sort((a, b) => Number(a.order) - Number(b.order));
    });
  }

  //Función que carga los empacadores de la producción de corte
  getPackers(process : string) {
    this.operariosService.GetPackersProduction(process).subscribe(data => { this.packers = data; }, error => console.log(error));
  } 

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

  obtenerTurnos() {
    let proceso: string = this.eliminarDiacriticos(this.proceso).toUpperCase();
    this.turnosService.srvObtenerLista().subscribe(data => this.turnos = data.map(x => x.turno_Id));
    this.bagproService.GetHorarioProceso(proceso).subscribe(turno => {
      this.formDatosProduccion.patchValue({ turno: turno.toString() });
      if (this.datosOrdenTrabajo.length > 0) this.datosOrdenTrabajo[0].turno = turno.toString();
    });
  }

  obtenerUnidadMedida() {
    this.unidadMedidaService.srvObtenerLista().subscribe(data => this.unidadesMedida = data.map(x => x.undMed_Id).filter(x => ['Cms', 'Plgs'].includes(x)));
  }

  obtenerOperarios() {
    this.operariosService.GetOperariosProduccion().subscribe(data => {
      if (this.ValidarRol == 1) this.operarios = data;
      else {
        const validateAreas: any = {
          7: 3,
          74: 3,
          62: 19,
          75: 19,
          63: 20,
          76: 20,
          70: 22,
          77: 22,
          71: 25,
          78: 25,
          72: 21,
          79: 21,
          9: 11,
          80: 11,
          101: 36,
          81: 10,
          8: 10,
        }
        this.operarios = data.filter(x => x.area_Id == validateAreas[this.ValidarRol]);
      }
    });
  }

  //Función que carga los supervisores dependiendo del proceso seleccionado
  getSupervisores() {
    this.supervisores = [];
    const process = this.validateProcess();
    const areas: Record<string, number> = {
      DBLD: 25,
      CORTE: 21,
      EMP: 19,
      EXT: 3,
      IMP: 19,
      ROT: 20,
      LAM: 22,
      PERF: 36,
      SELLA: 10,
    };
    const area = areas[process] ?? 34;
    this.svUsers.getSupervisors(area).subscribe(data => {
      this.supervisores = data;
      //if(['DBLD', 'PERF', 'CORTE', 'LAM', 'ROT', 'EMP'].includes(process)) this.formDatosProduccion.patchValue({ supervisor: data[0].supervisor_Id });
    }, error => console.log(error));
  }


  obtenerConos() {
    this.conosService.GetConos().subscribe(data => {
      this.conos = data;
      this.conos.forEach(x => {
        if (x.cono_Id == '3Plg7mm') x.Id = 1;
        if (x.cono_Id == '3Plg10mm') x.Id = 2;
        if (x.cono_Id == 'CALYPSO80') x.Id = 3;
        if (x.cono_Id == 'CALYPCINTA') x.Id = 4;
        if (x.cono_Id == 'CALYGRIS') x.Id = 5;
        if (x.cono_Id == '3Plg11mm') x.Id = 6;
        if (x.cono_Id == '3Plg12mm') x.Id = 7;
        if (x.cono_Id == '3Plg15mm') x.Id = 8;
        if (x.cono_Id == '3Plg19mm') x.Id = 9;
        if (x.cono_Id == '6Plg15mm') x.Id = 10;
        if (x.cono_Id == 'N/A') x.Id = 11;
      });
      this.conos.sort((a, b) => Number(a.Id) - Number(b.Id));
    });
  }

  buscarDatosConoSeleccionado() {
    let cono = this.formDatosProduccion.get('cono').value;
    if (cono) {
      let datosCono = this.conos.find(x => x.cono_Id == cono);
      let ancho: number = datosCono.cono_KgXCmsAncho;
      this.formDatosProduccion.patchValue({ anchoCono: ancho });
      this.validarAnchoCono();
    }
  }

  validarAnchoCono() {
    let ancho: number = 0;
    let ancho1 = this.formDatosProduccion.get('ancho1').value;
    let proceso = this.proceso;

    if (['Empaque', 'Corte', 'Rebobinar'].includes(proceso)) ancho = this.formDatosProduccion.value.anchoProducto;
    else if (['Doblado'].includes(proceso)) {
      if (ancho1 == 0) ancho1 = this.formDatosProduccion.value.anchoProducto;
      ancho = ancho1 / 2;
    } else {
      ancho1 = this.formDatosProduccion.value.anchoProducto;
      ancho = ancho1;
    }
    this.formDatosProduccion.patchValue({
      ancho1: ancho1,
      pesoTara: this.validarTaraCono(ancho)
    });
  }

  validarTaraCono(ancho: number): number {
    let tara: number = 0;
    let anchoCono = this.formDatosProduccion.get('anchoCono').value;
    let undExtrusion = this.formDatosProduccion.get('undExtrusion').value;
    let ancho1 = this.formDatosProduccion.get('ancho1').value;
    if (ancho1 && anchoCono) {
      if (undExtrusion == 'Plgs') tara = ancho * 2.54 * anchoCono;
      else tara = ancho * anchoCono;
    }
    return tara;
  }

  EditarAncho() {
    this.buscarDatosConoSeleccionado();
  }

  buscraOrdenTrabajo(consulta?: boolean) {
    this.client = null;
    this.reference = ``;
    this.obtenerTurnos();
    this.getMachines();
    this.validarProceso();
    if (this.formDatosProduccion.value.proceso) {
      let ordenTrabajo = this.formDatosProduccion.get('ordenTrabajo').value;
      this.cargando = true;
      if (consulta) this.formDatosProduccion.patchValue({ 'procesoAnterior': null, 'etiquetaAsociada': null, 'otAlterna': null, 'packer': null, 'supervisor': null });
      let proceso: string = this.formDatosProduccion.value.proceso == 'DBLD' ? 'DOBLADO' : this.formDatosProduccion.value.proceso;
      this.bagproService.GetOrdenDeTrabajo(ordenTrabajo, `?process=${proceso}`).subscribe(data => {
        let quantity : number = proceso == 'SELLA' ? data[0].cantidad_Sellado : data[0].cantidad_Proceso;
        let weight : number = proceso == 'SELLA' ? data[0].peso_Sellado : data[0].cantidad_Proceso;
        this.putDataOrderProduction(data, consulta);
        if (!consulta) this.updateStatesProcessOT(data[0].numero_Orden, this.formDatosProduccion.value.proceso, quantity, weight);
      }, error => {
        this.errorMessage(`La OT ${ordenTrabajo} no fue encontrada en el proceso ${this.proceso}`, error);
        this.reference = ``;
        this.limpiarCampos(consulta);
      });
    } else this.warinigMessage(`¡Debe haber seleccionado un proceso previamente!`);
  }

  putDataOrderProduction(data, consulta?: boolean) {
    this.reference = ``;
    this.datosOrdenTrabajo = data;
    this.datosOrdenTrabajo[0].turno = this.formDatosProduccion.value.turno;
    this.buscarRollosPesados();
    this.msjTotalProduction(data);
    data.forEach(datos => {
      this.clientsService.GetSedeClientexNitBagPro(datos.nitCliente).subscribe(dataClient => {
        dataClient.forEach(cli => {
          this.reference = datos.producto;
          this.datosOrdenTrabajo[0].id_Cliente = cli.id_Cliente;
          this.client = cli.id_Cliente;

          this.formDatosProduccion.patchValue({
            'idCliente': cli.id_Cliente,
            'cliente': datos.cliente,
            'item': datos.id_Producto,
            'referencia': datos.producto,
            'pesoExtruir': datos.peso_Neto,
            'ancho1': ['Empaque'].includes(this.proceso) ? datos.selladoCorte_Ancho : datos.ancho1_Extrusion,
            'ancho2': ['Empaque'].includes(this.proceso) ? datos.selladoCorte_Largo : datos.ancho2_Extrusion,
            'ancho3': ['Empaque'].includes(this.proceso) ? datos.selladoCorte_Fuelle : datos.ancho3_Extrusion,
            'undExtrusion': datos.und_Extrusion.trim(),
            'calibre': datos.calibre_Extrusion,
            'material': datos.material.trim(),
            'anchoProducto': consulta ? ['Empaque'].includes(this.proceso) ? datos.selladoCorte_Ancho : (datos.ancho1_Extrusion + datos.ancho2_Extrusion + datos.ancho3_Extrusion) : this.nuevoAnchoProducto,
            'presentacion': datos.presentacion,
            'daipita': this.reference.includes('DAIPITA') && this.validateProcess() == 'EMP' ? 3000 : null,
            'edicionAnchoProducto': false,
            'rebobinado': false,
            'pesoMin': datos.selladoCorte_PesoRollo > 0 ? datos.selladoCorte_PesoRollo - 0.5 : null,
            'pesoMax': datos.selladoCorte_PesoRollo > 0 ? datos.selladoCorte_PesoRollo + 0.5 : null,
            'observacion': datos.observacion,
          });
          this.buscarDatosConoSeleccionado();
          this.claseCantidadRealizada(datos)
        });
      }, error => {
        this.errorMessage(`Ocurrió un error al consultar el nit de cliente N° ${datos.nitCliente}`, error);
        this.cargando = false;
      });
    });
  }

  msjTotalProduction(data: any) {
    let sales: number = data[0].peso_Neto;
    let packed: number = this.sumarCantidad();
    let unit: string = data[0].presentacion;

    if (packed > sales) this.warinigMessage(`La orden está sobrepasada. Se solicitaron ${sales.toLocaleString()} y se han producido ${packed.toLocaleString()} ${unit}.`);
    else if (packed == sales) this.warinigMessage(`La cantidad solicitada es igual a la cantidad producida, verifique antes de continuar!`);
  }

  //Funcion que agrega una clase con un color especifico al campo cantidad realizada de la tabla.
  claseCantidadRealizada(data) {
    if (data.cantidad_Proceso == 0) this.clase = `badge bg-rojo`;
    else if (data.cantidad_Proceso > 0 && data.cantidad_Proceso < data.cantidad_Pedida) this.clase = `badge bg-amarillo`;
    else if (data.cantidad_Proceso >= data.cantidad_Pedida) this.clase = `badge bg-verde`;
    else this.clase = ``;
    console.log(this.clase);

  }

  validarPrecio(datosOrden: any): number {
    let precio: number = 0;
    let turno: string = this.formDatosProduccion.value.turno;
    if (turno == 'DIA') precio = datosOrden.selladoCorte_PrecioSelladoDia;
    else if (turno == 'NOCHE') precio = datosOrden.selladoCorte_PrecioSelladoNoche;
    return precio;
  }

  buscarRollosPesados() {
    let proceso: string = this.eliminarDiacriticos(this.proceso).toUpperCase();
    let ordenTrabajo: string = this.formDatosProduccion.value.ordenTrabajo;
    this.rollosPesados = [];
    this.bagproService.getRegistrosPorOT(ordenTrabajo, proceso).subscribe(data => {
      this.rollosPesados = data;
      this.rollosPesados.sort((a, b) => b.id - a.id);
      this.cargando = false;
    }, () => this.cargando = false);
  }

  sumarPesoBruto() {
    let total: number = this.rollosPesados.reduce((a, b) => a + b.peso, 0);
    return total;
  }

  sumarCantidad() {
    let total: number = this.rollosPesados.reduce((a, b) => a + b.cantidad, 0);
    return total;
  }

  //Función que obtiene el peso desde la báscula conectada por puerto serial
  async getPesoDesdeBascula(): Promise<number> {
    try {
      const port = await navigator.serial.requestPort();
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
        console.log('No se encontró una báscula conectada');
        this.cargando = false;
      } else {
        this.msj.mensajeError(ex);
        this.cargando = false;
      }
      return 0; // Retorna 0 en caso de error
    }
  }

  async validarDatos() {
    let ot: any = this.formDatosProduccion.value.ordenTrabajo;
    let oldProcess: any = this.formDatosProduccion.value.procesoAnterior;
    let tag: any = this.formDatosProduccion.value.etiquetaAsociada;
    let pesoMin: any = this.formDatosProduccion.value.pesoMin;
    let pesoMax: any = this.formDatosProduccion.value.pesoMax;
    let tara: number = this.formDatosProduccion.value.pesoTara;
    this.cargando = true;
    //this.getPuertoSerial();

    const peso = await this.getPesoDesdeBascula();

    if (peso <= 0) {
      this.msj.mensajeAdvertencia('Peso inválido', 'No se pudo leer el peso de la báscula');
      this.cargando = false;
      return;
    }
    this.formDatosProduccion.patchValue({ pesoBruto: peso, pesoNeto: peso - tara });
    //setTimeout(() => {
    if (this.datosOrdenTrabajo.length > 0) {
      if (this.formDatosProduccion.valid) {
        if (ot == this.datosOrdenTrabajo[0].numero_Orden) {
          if (this.formDatosProduccion.value.maquina > 0) {
            if (this.formDatosProduccion.value.pesoNeto > 1) {
              if (this.formDatosProduccion.value.proceso == 'EMP') {
                if (this.formDatosProduccion.value.packer) {
                  if (this.formDatosProduccion.value.supervisor) {
                    if (this.formDatosProduccion.value.pesoNeto <= 65) {
                      if (tag) {
                        if (tag.toString().length >= 6) {
                          if (oldProcess) {
                            if (![null, undefined, 0, ''].includes(this.formDatosProduccion.value.anchoProducto)) {
                              if (this.clientsRestrictionWeight.includes(this.client)) {
                                if (pesoMin && pesoMax) {
                                  if (this.formDatosProduccion.value.pesoNeto >= pesoMin && this.formDatosProduccion.value.pesoNeto <= pesoMax) {
                                    this.createRecordProduction(oldProcess, tag);
                                  } else {
                                    if (this.formDatosProduccion.value.userAuthorize) {
                                      this.guardarProduccion();
                                    } else {
                                      this.warinigMessage(`¡El peso neto debe estar entre ${pesoMin} y ${pesoMax}!`, true);
                                      this.modalAuthorizeWeight = true;
                                    }
                                  }
                                } else {
                                  this.warinigMessage(`¡Debe definir el peso mínimo y máximo para la OT N° ${ot} del cliente ${this.formDatosProduccion.value.cliente}!`, true);
                                };
                              } else this.createRecordProduction(oldProcess, tag);

                            } else this.warinigMessage(`¡Debe digitar un ancho de producto válido!`, true);
                          } else this.warinigMessage(`Debe agregar el proceso del que proviene la etiqueta asociada!`, true);
                        } else this.warinigMessage(`¡La cantidad de digitos de la etiqueta asociada debe ser mayor a 5!`, true);
                      } else this.warinigMessage(`Debe llenar el campo 'Etiqueta asociada'!`, true);
                    } else this.warinigMessage(`¡El peso neto debe ser menor a '65' en el proceso de EMPAQUE!`, true);
                  } else this.warinigMessage(`Debe seleccionar el 'Supervisor' del turno actual!`, true);
                } else this.warinigMessage(`Advertencia`, `Debe seleccionar el 'Empacador' del rollo/bulto`);
              } else {
                if (this.formDatosProduccion.value.proceso == 'EXT') {
                  this.guardarProduccion();
                } else {
                  if (tag) {
                    if (tag.toString().length >= 6) {
                      if (oldProcess) {
                        if (![null, undefined, 0, ''].includes(this.formDatosProduccion.value.anchoProducto)) {
                          if (oldProcess == 'MATPRIMA') this.guardarProduccion();
                          else this.searchOldTag(tag, oldProcess);
                        } else this.warinigMessage(`¡Debe digitar un ancho de item válido!`, true);
                      } else this.warinigMessage(`Debe agregar el proceso del que proviene la etiqueta asociada!`, true);
                    } else this.warinigMessage(`¡La cantidad de digitos de la etiqueta asociada debe ser mayor a 5!`, true);
                  } else this.warinigMessage(`Debe llenar el campo 'Etiqueta asociada'!`, true);
                }
              }
            } else this.warinigMessage(`¡El peso Neto debe ser superior a uno (1)!`, true);
          } else this.warinigMessage(`¡La maquina no puede ser cero (0)!`, true);
        } else this.warinigMessage(`¡La OT que desea registrar no coincide con la consultada previamente!`, true);
      } else this.warinigMessage(`¡Todos los campos deben estar diligenciados!`, true);
    } else this.warinigMessage(`¡Debe buscar la Orden de Trabajo a la que se le añadirá el rollo pesado!`, true);
    //}, 500);
  }

  //Función que crea el registro de producción
  createRecordProduction(oldProcess: any, tag: number) {
    if (oldProcess == 'MATPRIMA') this.guardarProduccion();
    else this.searchOldTag(tag, oldProcess);
  }

  //
  searchOldTag(tag: number, process: any) {
    let ot: number = parseInt(this.formDatosProduccion.value.ordenTrabajo);
    let otAltern: number = parseInt(this.formDatosProduccion.value.otAlterna);
    let orders: any = [];

    if (ot) orders.push(ot);
    if (otAltern) orders.push(otAltern);

    this.bagproService.getRollProduction(tag, `?process=${this.changeNameProcess(process)}`).subscribe(data => {
      if (data) {
        if (orders.includes(data.ot)) this.guardarProduccion(data);
        else this.warinigMessage(`La etiqueta asociada no hace parte de la(s) OT's digitada(s)`);
      } else this.warinigMessage(`La etiqueta asociada no hace parte del proceso de ${this.changeNameProcess(process)}`, true);
    }, error => {
      this.warinigMessage(`No se encontró información de la etiqueta asociada | ${error.status} ${error.statusText}`, true);
    });
  }

  //
  datosProduccion(daipita: any): modelProduccionProcesos {
    let presentation = this.formDatosProduccion.value.presentacion;

    if (presentation == 'Kilo') presentation = 'Kg';
    else if (presentation == 'Unidad') presentation = 'Und';
    let datos: modelProduccionProcesos = {
      Numero_Rollo: 0,
      OT: this.formDatosProduccion.value.ordenTrabajo,
      Prod_Id: parseInt(this.formDatosProduccion.value.item),
      Cli_Id: parseInt(this.formDatosProduccion.value.idCliente),
      Operario1_Id: this.formDatosProduccion.value.operario,
      Operario2_Id: 0,
      Operario3_Id: 0,
      Operario4_Id: 0,
      Pesado_Entre: 1,
      Maquina: this.formDatosProduccion.value.maquina,
      Cono_Id: this.formDatosProduccion.value.cono,
      Ancho_Cono: this.formDatosProduccion.value.anchoCono,
      Tara_Cono: this.formDatosProduccion.value.pesoTara,
      Peso_Bruto: this.formDatosProduccion.value.pesoBruto,
      Peso_Neto: this.formDatosProduccion.value.pesoNeto,
      Cantidad: ['Und', 'MTS'].includes(presentation) && this.validateProcess() == 'EMP' ? [null, undefined, 0, ''].includes(daipita) ? 1 : daipita : 1,
      Peso_Teorico: 0,
      Desviacion: 0,
      Precio: this.validarPrecio(this.datosOrdenTrabajo[0]),
      Presentacion: presentation,
      Proceso_Id: this.validateProcess(),
      Turno_Id: this.formDatosProduccion.value.turno,
      Envio_Zeus: false,
      Datos_Etiqueta: '',
      Fecha: moment().format('YYYY-MM-DD'),
      Hora: moment().format('HH:mm:ss'),
      Creador_Id: this.storage_Id,
      Rebobinado: this.formDatosProduccion.value.rebobinado,
      Etiqueta_Trazabilidad: this.formDatosProduccion.value.etiquetaAsociada,
      Empacador_Id: [undefined, null].includes(this.formDatosProduccion.value.packer) ? 0 : this.formDatosProduccion.value.packer,
      Autoriza_Id: this.formDatosProduccion.value.userAuthorize ? this.formDatosProduccion.value.userAuthorize : 0,
      Estado_Rollo: 19,
      Supervisor_Id: [undefined, null].includes(this.formDatosProduccion.value.supervisor) ? 3197 : this.formDatosProduccion.value.supervisor,
    }
    return datos;
  }

  msjsOldProcess = () => 'Selecciona el proceso madre de donde provino el rollo con el que se realizó esta producción';

  msjsOldRoll = () => 'Presiona "Enter" para cargar el modal de rollos madre.';

  msjsAltOT = () => 'Coloca el número de OT alternativa y presiona enter, para seleccionar un rollo madre de esta producción';


  guardarProduccion(infoEtiquetaAsociada?: any) {
    this.cargando = true;
    let rebobinado: boolean = this.formDatosProduccion.value.rebobinado;
    let daipita: any = [0, '', null, undefined].includes(this.formDatosProduccion.value.daipita) ? null : this.formDatosProduccion.value.daipita;
    let motherProcess: any = this.formDatosProduccion.value.procesoAnterior;
    let supervisorId: any = this.formDatosProduccion.value.supervisor;

    this.produccionProcesosService.postProduccionProcesos(this.datosProduccion(daipita)).subscribe(res => {
      //this.getEtiquetaPlasticaribe(res, infoEtiquetaAsociada, daipita, rebobinado);
      let caliber: any = this.formDatosProduccion.value.calibre;
      let dataOrderProduction : any = this.datosOrdenTrabajo[0];
      let widthTotal : number = this.formDatosProduccion.value.anchoProducto; 
      let anchoProducto: any = this.loadWidthForOT2(res, dataOrderProduction, widthTotal) //this.validateProcess() != 'EMP' ? this.loadWidthForOT2(res) : this.formDatosProduccion.value.anchoProducto;
      let und: any = this.formDatosProduccion.value.undExtrusion;
      let supervisor = supervisorId ? this.supervisores.find(x => x.supervisor_Id === supervisorId) : null;
      

      if (res) {
        let etiqueta: modelTagProduction = {
          'client': res.cli_Nombre,
          'item': res.prod_Id,
          'reference': res.prod_Nombre,
          'width': anchoProducto ? anchoProducto : 0,
          'height': 0,
          'bellows': 0,
          'und': und ? und : '',
          'cal': caliber ? caliber : 0,
          'orderProduction': res.ot,
          'material': res.material_Nombre,
          'quantity': this.validateProcess() != 'EMP' ? res.peso_Bruto : [0, '', null, undefined].includes(daipita) ? res.peso_Bruto : res.peso_Neto,
          'quantity2': this.validateProcess() != 'EMP' ? res.peso_Neto : [0, '', null, undefined].includes(daipita) ? res.peso_Neto : daipita,
          'reel': res.numeroRollo_BagPro,
          'presentationItem1': [0, '', null, undefined].includes(daipita) ? 'Kg Bruto' : this.validateProcess() != 'EMP' ? 'Kg Bruto' : 'Kg Neto',
          'presentationItem2': [0, '', null, undefined].includes(daipita) ? 'Kg Neto' : this.validateProcess() != 'EMP' ? 'Kg Neto' : res.presentacion == 'MTS' ? 'Mts' : 'Und(s)',
          'productionProcess': res.proceso_Nombre.toUpperCase(),
          'showNameBussiness': true,
          'operator': rebobinado ? `${res.usua_Nombre + ' RB'}` : `${res.usua_Nombre}`,
          'copy': false,
          'dataTagForClient': '',
          'showDataTagForClient': this.formDatosProduccion.value.mostratDatosProducto ? this.formDatosProduccion.value.mostratDatosProducto : '',
          'machine': res.maquina,
          'date': res.fecha.replace('T00:00:00', ''),
          'hour': res.hora,
          'supervisor': supervisor ? supervisor?.supervisor_Name : '',
        }
        this.createPDFService.createTagProduction(etiqueta);
        this.createTraceability2(res, motherProcess, infoEtiquetaAsociada);
        this.getDataInForm(res, daipita);
      } else {
        this.msj.mensajeError('Error', `Error al crear el registro de producción | No se recibió respuesta del servidor`);
        this.cargando = false;
      }
    }, error => {
      this.errorMessage(`¡Ocurrió un error al registrar el rollo!`, error);
    });
  }

  //Función que cargará el ancho del producto.
  loadWidthForOT2(data: any, orderProduction : any, widthTotal): string {
    if (!data) return '0';

    const anchoCorte = Number(widthTotal);
    const ancho1 = Number(orderProduction.ancho1_Extrusion);
    const ancho2 = Number(orderProduction.ancho2_Extrusion);
    const ancho3 = Number(orderProduction.ancho3_Extrusion);

    if (data.material_Nombre === 'BOPP') {
      return `${anchoCorte}`;
    }

    if (ancho1 > anchoCorte) {
      if(this.validateProcess() == 'EMP') {
        return `${anchoCorte}`;
      }
    }

    const anchos = [ancho1, ancho2, ancho3]
      .filter(x => x > 0);

    return anchos.length ? anchos.join('+') : '0';
  }

  //Función que carga los datos del rollo creado en los campos correspondientes para facilitar la creación de la etiqueta en caso de que el proceso sea diferente a extrusión.
  getDataInForm(res: any, daipita: any) {
    let mostrarDatosProducto: boolean = this.formDatosProduccion.value.mostratDatosProducto;
    let anchoProducto: number = this.formDatosProduccion.value.anchoProducto;
    let edicionAnchoProducto: boolean = this.formDatosProduccion.value.edicionAnchoProducto;
    let motherProcess: string = this.formDatosProduccion.value.procesoAnterior;
    let otAltern: number = this.formDatosProduccion.value.otAlterna;
    let packer: any = this.formDatosProduccion.value.packer;
    let supervisor: any = this.formDatosProduccion.value.supervisor;
    let ot: any = this.formDatosProduccion.value.ordenTrabajo;
    let process: any = this.formDatosProduccion.value.proceso;
    this.formDatosProduccion.reset();
    this.validarProceso();
    if (this.validateProcess() != 'EXT') {
      this.loadDataInFields(res, mostrarDatosProducto, anchoProducto, edicionAnchoProducto, daipita, motherProcess, otAltern, packer, supervisor);
      this.nuevoAnchoProducto = this.formDatosProduccion.value.anchoProducto;
      this.buscraOrdenTrabajo(false);
    } else {
      this.updateEPOTExtrusion(ot, process);
    }
    this.msj.mensajeConfirmacion(`¡Registro creado con exito!`);
  }

  //Nueva etiqueta
  getEtiquetaPlasticaribe(data: any, tagAssociated: any, daipita: any, rebobinado: boolean) {
    console.log('Entré a getEtiquetaPlasticaribe', data, tagAssociated)
    let motherProcess: any = this.formDatosProduccion.value.procesoAnterior;

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
      'quantity': this.validateProcess() != 'EMP' ? data.peso_Bruto : [0, '', null, undefined].includes(daipita) ? data.peso_Bruto : data.peso_Neto,
      'quantity2': this.validateProcess() != 'EMP' ? data.peso_Neto : [0, '', null, undefined].includes(daipita) ? data.peso_Neto : daipita, //data.presentacion == 'Kg' ? data.peso_Neto : Math.trunc(data.cantidad),
      'reel': data.numeroRollo_BagPro,
      'presentationItem1': [0, '', null, undefined].includes(daipita) ? 'Kg Bruto' : this.validateProcess() != 'EMP' ? 'Kg Bruto' : 'Kg',
      'presentationItem2': [0, '', null, undefined].includes(daipita) ? 'Kg Neto' : this.validateProcess() != 'EMP' ? 'Kg Neto' : data.presentacion == 'MTS' ? 'Mts' : 'Und(s)',
      'productionProcess': data.proceso_Nombre.toUpperCase(),
      'showNameBussiness': true,
      'operator': rebobinado ? `${data.usua_Nombre + ' RB'}` : `${data.usua_Nombre}`,
      'copy': false,
      'dataTagForClient': '',
      'showDataTagForClient': this.formDatosProduccion.value.mostratDatosProducto ? this.formDatosProduccion.value.mostratDatosProducto : '',
      'machine': data.maquina,
      'date': data.fecha.replace('T00:00:00', ''),
      'hour': data.hora
    }
    this.createPDFService.createTagProduction(etiqueta);
    this.createTraceability2(data, motherProcess, tagAssociated);
  }

  //* Nueva trazabilidad
  createTraceability2(productionProcess: any, motherProcess: string, infoTagAssociated?: number) {
    this.svTraceability.PostTraceability(this.modelTraceability2(productionProcess, motherProcess, infoTagAssociated)).subscribe(trace => {
    }, error => {
      this.msj.mensajeError(`Error`, `Error al crear el registro de trazabilidad | ${error.status} ${error.statusText}`);
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
      'Trz_EtiquetaAnterior': infoTagAssociated ? infoTagAssociated.rollo : this.formDatosProduccion.value.etiquetaAsociada,
      'Trz_OtAnterior': infoTagAssociated ? infoTagAssociated.ot : null,
      'Prod_Anterior': infoTagAssociated ? infoTagAssociated.item : 1,
      'Proceso_Anterior': motherProcess,
      'Autoriza_Id': productionPL.autoriza_Id,
    }
    return info;
  }

  //Función para actualizar los estados de la OT en el proceso de extrusión
  updateEPOTExtrusion(ordenTrabajo: any, proceso: any) {
    this.bagproService.GetOrdenDeTrabajo(ordenTrabajo, `?process=${proceso}`).subscribe(data => {
      this.updateStatesProcessOT(data[0].numero_Orden, this.formDatosProduccion.value.proceso, data[0].cantidad_Proceso, data[0].cantidad_Proceso);
      this.limpiarCampos(false);
    }, error => {
      console.log(error);
      this.limpiarCampos(false);
    });
  }

  loadDataInFields(productionPL: any, dataProduct: boolean, broadProduct: number, editBroadProduct: boolean, daipita, motherProcess: string, otAltern: number, packer?: any, supervisor?: any) {
    this.formDatosProduccion.patchValue({
      'ordenTrabajo': productionPL.ot,
      'maquina': productionPL.maquina,
      'operario': productionPL.operario1_Id,
      'cono': productionPL.cono_Id,
      'daipita': daipita,
      'mostratDatosProducto': dataProduct,
      'anchoProducto': broadProduct,
      'edicionAnchoProducto': editBroadProduct,
      'rebobinado': false,
      'procesoAnterior': motherProcess,
      'etiquetaAsociada': productionPL.etiqueta_Trazabilidad,
      'otAlterna': otAltern,
      'packer': packer,
      'supervisor': supervisor,
    });
  }

  validateProcess(): 'EXT' | 'IMP' | 'ROT' | 'LAM' | 'DBLD' | 'CORTE' | 'EMP' | 'PERF' | 'SELLA' {
    const processMapping = {
      'EXTRUSION': 'EXT',
      'IMPRESION': 'IMP',
      'ROTOGRABADO': 'ROT',
      'LAMINADO': 'LAM',
      'DOBLADO': 'DBLD',
      'CORTE': 'CORTE',
      'EMPAQUE': 'EMP',
      'SELLADO': 'SELLA',
      'WIKETIADO': 'WIKE',
      'PERFORADO': 'PERF',
    };
    let proceso = this.eliminarDiacriticos(this.proceso).toUpperCase();
    return processMapping[proceso] || proceso;
  }

  searchDataTagCreated(reel: number, daipita: any, rebobinado: boolean, dataProductionProcess: any, infoTagAssociated?: any) {
    let motherProcess: string = this.formDatosProduccion.value.procesoAnterior
    this.bagproService.GetInformactionProductionForTag(reel).subscribe(res => {

      res.forEach(data => {
        let dataTagProduction: modelTagProduction = {
          'client': data.clienteNombre.trim(),
          'item': data.clienteItem.trim(),
          'reference': data.clienteItemNombre.trim(),
          'width': data.extancho,
          'height': data.extlargo,
          'bellows': data.extfuelle,
          'und': data.extunidad.trim(),
          'cal': data.calibre,
          'orderProduction': data.ot.trim(),
          'material': data.material.trim(),
          'quantity': this.validateProcess() != 'EMP' ? data.extBruto : [0, '', null, undefined].includes(daipita) ? data.extBruto : data.extnetokg,
          'quantity2': this.validateProcess() != 'EMP' ? data.extnetokg : [0, '', null, undefined].includes(daipita) ? data.extnetokg : daipita,
          'reel': data.item,
          'presentationItem1': [0, '', null, undefined].includes(daipita) ? 'Kg Bruto' : this.validateProcess() != 'EMP' ? 'Kg Bruto' : 'Kg',
          'presentationItem2': [0, '', null, undefined].includes(daipita) ? 'Kg Neto' : this.validateProcess() != 'EMP' ? 'Kg Neto' : 'Und(s)',
          'productionProcess': data.nomStatus.trim(),
          'showNameBussiness': this.showNameBussiness,
          'showDataTagForClient': this.formDatosProduccion.value.mostratDatosProducto,
          'operator': rebobinado ? `${data.operador + ' RB'}` : `${data.operador}`
        }
        this.createPDFService.createTagProduction(dataTagProduction);
        this.createTraceability(dataProductionProcess, res, motherProcess, infoTagAssociated);
      }, error => {
        console.log(error);
      });
    });
  }

  updateStatesProcessOT(ot: any, process: string, qty: number, weight: number,) {
    this.svStatusProcess.putStatusProcessOT(ot, process, qty, weight).subscribe(dataUpdate => {
      console.log(dataUpdate);
    }, error => {
      console.log(error);
    });
  }

  createTagProduction(code: number, quantity: number, quantity2: number, copy: boolean = false) {
    let proceso = this.eliminarDiacriticos(this.proceso).toUpperCase();
    let data: Array<any> = this.rollosPesados.filter(data => data.id == code);
    let dataTagProduction: modelTagProduction = {
      client: this.formDatosProduccion.value.cliente,
      item: this.formDatosProduccion.value.item,
      reference: this.formDatosProduccion.value.referencia,
      width: this.formDatosProduccion.value.ancho1,
      height: this.formDatosProduccion.value.ancho3,
      bellows: this.formDatosProduccion.value.ancho2,
      und: this.formDatosProduccion.value.undExtrusion,
      cal: this.formDatosProduccion.value.calibre,
      orderProduction: this.formDatosProduccion.value.ordenTrabajo,
      material: this.formDatosProduccion.value.material,
      quantity: quantity,
      quantity2: quantity2,
      reel: code,
      presentationItem1: 'Kg Bruto',
      presentationItem2: 'Kg Neto',
      productionProcess: proceso,
      showNameBussiness: this.showNameBussiness,
      copy: copy,
      showDataTagForClient: this.formDatosProduccion.value.mostratDatosProducto,
      operator: data[0].operador,
    }
    this.createPDFService.createTagProduction(dataTagProduction);
  }

  //Modelo de trazabilidad
  modelTraceability(productionPL: any, produccionBagPro: any, motherProcess: string, infoTagAssociated?: any) {
    let info: modelTrazabilidad_Produccion = {
      'Trz_Etiqueta': produccionBagPro[0].item,
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
      'Trz_EtiquetaAnterior': infoTagAssociated ? infoTagAssociated.rollo : this.formDatosProduccion.value.etiquetaAsociada,
      'Trz_OtAnterior': infoTagAssociated ? infoTagAssociated.ot : null,
      'Prod_Anterior': infoTagAssociated ? infoTagAssociated.item : 1,
      'Proceso_Anterior': motherProcess,
    }
    return info;
  }

  //Crear registro de trazabilidad. 
  createTraceability(productionProcess: any, infoTagBagPro: any, motherProcess: string, infoTagAssociated: number) {
    this.svTraceability.PostTraceability(this.modelTraceability(productionProcess, infoTagBagPro, motherProcess, infoTagAssociated)).subscribe(trace => {
    }, error => {
      this.msj.mensajeError(`Error`, `Error al crear el registro de trazabilidad | ${error.status} ${error.statusText}`);
      this.cargando = false;
    });
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
      default:
        return '';
    }
  }

  //Validar información de rollos por OT
  validateOrderProduction(typeOT: string) {
    this.rollsConsolidate = [];
    this.rolls = [];
    let ot: number = typeOT == 'altern' ? ![null, '', undefined].includes(this.formDatosProduccion.value.otAlterna) ? this.formDatosProduccion.value.otAlterna : this.formDatosProduccion.value.ordenTrabajo : this.formDatosProduccion.value.ordenTrabajo;
    let motherProcess: string = this.formDatosProduccion.value.procesoAnterior;
    this.orderProduction = null;

    if (ot && motherProcess) {
      this.cargando = true;
      this.bagproService.GetObtenerDatosxProcesos(ot, this.changeNameProcess(motherProcess)).subscribe(data => {
        if (data) {
          if (data.length > 0) {
            this.modalRolls = true;
            this.rolls = data;
            this.cargando = false;
            this.orderProduction = ot;
            this.getConsolidateProduction();
          } else {
            this.warinigMessage(`No se encontraron rollos de la OT ${ot} en el proceso de ${this.changeNameProcess(motherProcess)}`);
            this.cargando = false;
          }
        } else {
          this.warinigMessage(`No se encontraron rollos de la OT ${ot} en el proceso de ${this.changeNameProcess(motherProcess)}`);
          this.orderProduction = ot;
        }
      }, error => { this.errorMessage(`Error al consultar rollos de la OT ${ot} en el proceso de ${this.changeNameProcess(motherProcess)}`, error); });
    } else this.warinigMessage(`Debe diligenciar los campos 'Proceso Madre' y 'OT'`);
  }

  //
  getConsolidateProduction() {
    this.rollsConsolidate = this.rolls.reduce((a, b) => {
      if (!a.map(x => x.ot).includes(b.ot)) a = [...a, b];
      return a;
    }, []);
  }

  //Función para cargar los rollos madres de bulto
  loadMotherRolls(tag: any, process: string) {
    this.modalRolls = false;
    this.formDatosProduccion.patchValue({ 'etiquetaAsociada': tag });
    this.exitMessage(`Se asoció el rollo madre N° ${tag} del proceso de ${process} exitosamente!`);
  }

  //Obtener el peso total. 
  getTotalWeight = () => this.rolls.reduce((a, b) => a += b.peso1, 0);

  //Obtener la cantidad de rollos
  totalRolls = () => this.rolls.length;

  //Filtrar la tabla de los rollos cargados en el modal.
  applyFilter = ($event, campo: any, actionField: any) => this.dt1!.filter(($event.target as HTMLInputElement).value, campo, actionField);

  //Función para inactivar el campo OT alterna
  changeOldProcess() {
    let motherProcess: any = this.formDatosProduccion.value.procesoAnterior;
    if (motherProcess == 'MATPRIMA') {
      this.formDatosProduccion.patchValue({ etiquetaAsociada: null, otAnterior: null });
    }
  }

  //Formulario para autorizar peso
  initFormAuthorizeWeight() {
    this.formWeight = this.frmBuilder.group({
      id: [null, Validators.required],
    });
  }

  //Obtener usuarios autorizados
  getUsersAuthorized = () => this.svUsers.getListAuthorizeUsers().subscribe(data => this.usersAuthorized = data, error => this.msj.mensajeError(error));

  //
  authorizeWeight() {
    let id: number = this.formWeight.value.id;
    this.svUsers.GetUsersAthorizedForTeoricWeight(id).subscribe(data => {
      if (data) {
        if (data.length > 0) {
          let user: number = data[0].user_Id;
          let index: number = this.usersAuthorized.findIndex(x => x.user_Id == user);
          this.msj.mensajeConfirmacion(`Confirmación`, `Autorizado exitosamente por ${data[0].userName}!`);
          this.modalAuthorizeWeight = false;
          this.formDatosProduccion.patchValue({ 'userAuthorize': this.usersAuthorized[index].user_Id });
          this.formWeight.reset();
        } else this.msjAuthorize(`Advertencia`, `Usuario sin autorización para realizar esta acción!`);
      } else this.msjAuthorize(`Advertencia`, `Usuario no autorizado para realizar esta acción!`);
    }, error => {
      this.msjAuthorize(`Advertencia`, `El usuario no tiene permisos para realizar esta acción!`);
    });
  }

  //Mensaje de advertencia por no autorización de pesos teoricos.
  msjAuthorize(msj1: string, msj2: string) {
    this.msj.mensajeAdvertencia(msj1, msj2);
    this.formWeight.reset();
  }
}
