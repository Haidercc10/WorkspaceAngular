import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import moment from 'moment';
import { Table } from 'primeng/table';
import { modelProduccionProcesos } from 'src/app/Modelo/modelProduccionProcesos';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { ConosService } from 'src/app/Servicios/Conos/conos.service';
import { TagProduction_2, modelTagProduction } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { Orden_TrabajoService } from 'src/app/Servicios/OrdenTrabajo/Orden_Trabajo.service';
import { ProcesosService } from 'src/app/Servicios/Procesos/procesos.service';
import { Produccion_ProcesosService } from 'src/app/Servicios/Produccion_Procesos/Produccion_Procesos.service';
import { ProductoService } from 'src/app/Servicios/Productos/producto.service';
import { ReImpresionEtiquetasService } from 'src/app/Servicios/ReImpresionEtiquetas/ReImpresionEtiquetas.service';
import { SedeClienteService } from 'src/app/Servicios/SedeCliente/sede-cliente.service';
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
  reference : string = ``;
  url : string = ``; 
  rebobinado : boolean = false;

  @ViewChild('dtProduccion') dtProduccion: Table | undefined;

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
    private svRouter : Router,
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
    });
  }

  ngOnInit() {
    this.url = this.svRouter.url;
    if(this.url = `/rebobinado-corte`) this.rebobinado = true;
    console.log(this.rebobinado);
    
    this.lecturaStorage();
    this.obtenerUnidadMedida();
    this.obtenerConos();
    this.getProcess();
    this.validarProceso();
    this.obtenerOperarios();
    setTimeout(() => this.buscarPuertos(), 1000);
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

  warinigMessage(message: string) {
    this.cargando = false;
    this.msj.mensajeAdvertencia(message);
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
    };
    if (this.ValidarRol != 1) {
      this.proceso = process[this.ValidarRol];
      this.formDatosProduccion.patchValue({ proceso: this.validateProcess() });
    } else {
      this.proceso = this.formDatosProduccion.value.proceso;
      this.validateProcess();
    }
    this.obtenerTurnos();
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
  }

  ab2str = (buf) => String.fromCharCode.apply(null, new Uint8Array(buf));

  eliminarDiacriticos = (texto) => texto.normalize('NFD').replace(/[\u0300-\u036f]/g, "");

  limpiarCampos() {
    this.cargando = false;
    let mostratDatosProducto: boolean = this.formDatosProduccion.value.mostratDatosProducto;
    this.formDatosProduccion.reset();
    this.formDatosProduccion.patchValue({ mostratDatosProducto: mostratDatosProducto });
    this.obtenerTurnos();
    this.datosOrdenTrabajo = [];
    this.rollosPesados = [];
    this.validarProceso();
  }

  getProcess() {
    this.processService.srvObtenerLista().subscribe(res => {
      res.filter(x => ['EXT', 'IMP', 'ROT', 'LAM', 'DBLD', 'CORTE', 'EMP'].includes(x.proceso_Id)).forEach(process => {
        this.process.push({
          order: this.sortArrayProcess(process.proceso_Nombre),
          proceso_Id: process.proceso_Id,
          proceso_Nombre: process.proceso_Nombre,
        });
      });
      this.process.sort((a, b) => Number(a.order) - Number(b.order));
    });
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
      'EMPAQUE': 7
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
        }
        this.operarios = data.filter(x => x.area_Id == validateAreas[this.ValidarRol]);
      }
    });
  }

  obtenerConos() {
    this.conosService.GetConos().subscribe(data => {
      this.conos = data
      this.conos.sort((a, b) => b.cono_Id.localeCompare(a.cono_Id));
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
      if (ancho1 == 0) ancho1 = this.formDatosProduccion.value.anchoProducto;
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

  buscraOrdenTrabajo() {
    this.reference = ``;
    this.obtenerTurnos();
    this.validarProceso();
    if (this.formDatosProduccion.value.proceso) {
      let ordenTrabajo = this.formDatosProduccion.get('ordenTrabajo').value;
      this.cargando = true;
      this.orderProductionsService.GetOrdenTrabajo(ordenTrabajo).subscribe(data => this.putDataOrderProduction(data), () => {
        this.bagproService.GetOrdenDeTrabajo(ordenTrabajo).subscribe(data => this.putDataOrderProduction(data), error => {
          this.errorMessage(`La OT ${ordenTrabajo} no fue encontrada en el proceso ${this.proceso}`, error);
          this.reference = ``;
          this.limpiarCampos();
        });
      });
    } else this.warinigMessage(`¡Debe haber seleccionado un proceso previamente!`);
  }

  putDataOrderProduction(data) {
    this.reference = ``;
    this.datosOrdenTrabajo = data;
    this.datosOrdenTrabajo[0].turno = this.formDatosProduccion.value.turno;
    this.buscarRollosPesados();
    data.forEach(datos => {
      this.clientsService.GetSedeClientexNitBagPro(datos.nitCliente).subscribe(dataClient => {
        dataClient.forEach(cli => {
          this.reference = datos.producto;
          this.datosOrdenTrabajo[0].id_Cliente = cli.id_Cliente;
          this.formDatosProduccion.patchValue({
            idCliente: cli.id_Cliente,
            cliente: datos.cliente,
            item: datos.id_Producto,
            referencia: datos.producto,
            pesoExtruir: datos.peso_Neto,
            ancho1: this.proceso != 'Empaque' ? datos.ancho1_Extrusion : datos.selladoCorte_Ancho,
            ancho2: this.proceso != 'Empaque' ? datos.ancho2_Extrusion : datos.selladoCorte_Largo,
            ancho3: this.proceso != 'Empaque' ? datos.ancho3_Extrusion : datos.selladoCorte_Fuelle,
            undExtrusion: datos.und_Extrusion.trim(),
            calibre: datos.calibre_Extrusion,
            material: datos.material.trim(),
            anchoProducto: datos.selladoCorte_Ancho,
            presentacion: datos.presentacion,
            daipita : this.reference.includes('DAIPITA') && this.validateProcess() == 'EMP' ? 3000 : null,
          });
          this.buscarDatosConoSeleccionado();
        });
      });
    });
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
    this.bagproService.GetDatosRollosPesados(ordenTrabajo, proceso).subscribe(data => {
      this.rollosPesados = data;
      this.rollosPesados.sort((a, b) => b.item - a.item);
      this.cargando = false;
    }, () => this.cargando = false);
  }

  sumarPesoBruto() {
    let total: number = this.rollosPesados.reduce((a, b) => a + b.extBruto, 0);
    return total;
  }

  sumarPesoNeto() {
    let total: number = this.rollosPesados.reduce((a, b) => a + b.extnetokg, 0);
    return total;
  }

  validarDatos() {
    this.buscraOrdenTrabajo();
    this.cargando = true;
    setTimeout(() => {
      if (this.datosOrdenTrabajo.length > 0) {
        if (this.formDatosProduccion.valid) {
          if (this.formDatosProduccion.value.maquina > 0) {
            if (this.formDatosProduccion.value.pesoNeto > 1) {
              if (this.formDatosProduccion.value.proceso == 'EMP') {
                if (this.formDatosProduccion.value.pesoNeto <= 65) this.guardarProduccion();
                else this.warinigMessage(`¡El peso neto debe ser menor a '65' en el proceso de EMPAQUE!`); 
              } else {
                this.guardarProduccion();
              } 
            } else this.warinigMessage(`¡El peso Neto debe ser superior a uno (1)!`);
          } else this.warinigMessage(`¡La maquina no puede ser cero (0)!`);
        } else this.warinigMessage(`¡Todos los campos deben estar diligenciados!`);
      } else this.warinigMessage(`¡Debe buscar la Orden de Trabajo a la que se le añadirá el rollo pesado!`);
    }, 500);
  }

  datosProduccion(daipita : any): modelProduccionProcesos {
    let presentation = this.formDatosProduccion.value.presentacion;
    //let daipita: any = [0, '', null, undefined].includes(this.formDatosProduccion.value.daipita) ? 1 : this.formDatosProduccion.value.daipita;
    //console.log(`datosProduccion: ${daipita}`);    
    if (presentation == 'Kilo') presentation = 'Kg';
    else if (presentation == 'Unidad') presentation = 'Und';
    let datos: modelProduccionProcesos = {
      Numero_Rollo: 0,
      OT: this.formDatosProduccion.value.ordenTrabajo,
      Prod_Id: parseInt(this.formDatosProduccion.value.item),
      Cli_Id: parseInt(this.formDatosProduccion.value.idCliente),
      Operario1_Id: this.formDatosProduccion.value.operario,
      Operario2_Id: null,
      Operario3_Id: null,
      Operario4_Id: null,
      Pesado_Entre: 1,
      Maquina: this.formDatosProduccion.value.maquina,
      Cono_Id: this.formDatosProduccion.value.cono,
      Ancho_Cono: this.formDatosProduccion.value.anchoCono,
      Tara_Cono: this.formDatosProduccion.value.pesoTara,
      Peso_Bruto: this.formDatosProduccion.value.pesoBruto,
      Peso_Neto: this.formDatosProduccion.value.pesoNeto,
      Cantidad: presentation == 'Und' && this.validateProcess() == 'EMP' ? [null, undefined, 0, ''].includes(daipita) ? 1 : daipita : 0,
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
      Rebobinado : this.rebobinado ? true : false,
    }
    return datos;
  }

  guardarProduccion() {
    this.cargando = true;
    let daipita : any = [0, '', null, undefined].includes(this.formDatosProduccion.value.daipita) ? null : this.formDatosProduccion.value.daipita;
    //console.log(`guardarProduccion: ${daipita}`);
    this.produccionProcesosService.Post(this.datosProduccion(daipita)).subscribe(res => {
      this.searchDataTagCreated(res.numero_Rollo, daipita);
      setTimeout(() => {
        let mostratDatosProducto: boolean = this.formDatosProduccion.value.mostratDatosProducto;
        this.formDatosProduccion.reset();
        this.validarProceso();
        this.formDatosProduccion.patchValue({
          ordenTrabajo: res.ot,
          maquina: res.maquina,
          operario: res.operario1_Id,
          cono: res.cono_Id,
          daipita: daipita,
          mostratDatosProducto: mostratDatosProducto,
        });
        //this.buscarRollosPesados();
        this.buscraOrdenTrabajo();
        this.msj.mensajeConfirmacion(`¡Registro creado con exito!`);
      }, 1000);
    }, error => this.errorMessage(`¡Ocurrió un error al registrar el rollo!`, error));
  }

  validateProcess(): 'EXT' | 'IMP' | 'ROT' | 'LAM' | 'DBLD' | 'CORTE' | 'EMP' {
    const processMapping = {
      'EXTRUSION': 'EXT',
      'IMPRESION': 'IMP',
      'ROTOGRABADO': 'ROT',
      'LAMINADO': 'LAM',
      'DOBLADO': 'DBLD',
      'CORTE': 'CORTE',
      'EMPAQUE': 'EMP',
      'SELLADO': 'SELLA',
      'WIKETIADO': 'WIKE'
    };
    let proceso = this.eliminarDiacriticos(this.proceso).toUpperCase();
    return processMapping[proceso] || proceso;
  }

  searchDataTagCreated(reel: number, daipita : any) {
    this.bagproService.GetInformactionProductionForTag(reel).subscribe(res => {
      //console.log(`searchDataTagCreated: ${daipita}`);
      //let daipita: any = [0, '', null, undefined].includes(this.formDatosProduccion.value.daipita) ? this.formDatosProduccion.value.daipita : this.formDatosProduccion.value.daipita;
      res.forEach(data => {
        let dataTagProduction: modelTagProduction = {
          client: data.clienteNombre.trim(),
          item: data.clienteItem.trim(),
          reference: data.clienteItemNombre.trim(),
          width: data.extancho,
          height: data.extlargo,
          bellows: data.extfuelle,
          und: data.extunidad.trim(),
          cal: data.calibre,
          orderProduction: data.ot.trim(),
          material: data.material.trim(),
          quantity: this.validateProcess() != 'EMP' ? data.extBruto : [0, '', null, undefined].includes(daipita) ? data.extBruto : data.extnetokg,
          quantity2: this.validateProcess() != 'EMP' ? data.extnetokg : [0, '', null, undefined].includes(daipita) ? data.extnetokg : daipita,
          reel: data.item,
          presentationItem1: [0, '', null, undefined].includes(daipita) ? 'Kg Bruto' : this.validateProcess() != 'EMP' ? 'Kg Bruto' : 'Kg',
          presentationItem2: [0, '', null, undefined].includes(daipita) ? 'Kg Neto' : this.validateProcess() != 'EMP' ? 'Kg Neto' : 'Und(s)',
          productionProcess: data.nomStatus.trim(),
          showNameBussiness: this.showNameBussiness,
          showDataTagForClient: this.formDatosProduccion.value.mostratDatosProducto,
          operator: data.operador,
        }
        this.createPDFService.createTagProduction(dataTagProduction);
      });
    });
  }

  createTagProduction(code: number, quantity: number, quantity2: number, copy: boolean = false) {
    let proceso = this.eliminarDiacriticos(this.proceso).toUpperCase();
    let data: Array<any> = this.rollosPesados.filter(data => data.item == code);
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

}
