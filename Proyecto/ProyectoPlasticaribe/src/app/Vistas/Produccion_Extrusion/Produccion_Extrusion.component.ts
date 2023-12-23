import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { modelProduccionProcesos } from 'src/app/Modelo/modelProduccionProcesos';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { ConosService } from 'src/app/Servicios/Conos/conos.service';
import { CreacionPdfService, modelTagProduction } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { Orden_TrabajoService } from 'src/app/Servicios/OrdenTrabajo/Orden_Trabajo.service';
import { ProcesosService } from 'src/app/Servicios/Procesos/procesos.service';
import { Produccion_ProcesosService } from 'src/app/Servicios/Produccion_Procesos/Produccion_Procesos.service';
import { ProductoService } from 'src/app/Servicios/Productos/producto.service';
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
export class Produccion_ExtrusionComponent implements OnInit {

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
    private createPDFService: CreacionPdfService,
    private clientsService: SedeClienteService,
    private processService: ProcesosService,
    private orderProductionsService: Orden_TrabajoService,) {

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
      anchoProducto: [null]
    });
  }

  ngOnInit() {
    this.lecturaStorage();
    this.getProcess();
    this.validarProceso();
    this.obtenerUnidadMedida();
    this.obtenerOperarios();
    this.obtenerConos();
    setTimeout(() => this.buscarPuertos(), 1000);
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage() {
    this.storage_Id = this.appComponent.storage_Id;
    this.ValidarRol = this.appComponent.storage_Rol;
  }

  validarProceso() {
    switch (this.ValidarRol) {
      case 7:
        this.proceso = 'Extrusión';
        break;
      case 74:
        this.proceso = 'Extrusión';
        break;
      case 62:
        this.proceso = 'Impresión';
        break;
      case 75:
        this.proceso = 'Impresión';
        break;
      case 63:
        this.proceso = 'Rotograbado';
        break;
      case 76:
        this.proceso = 'Rotograbado';
        break;
      case 70:
        this.proceso = 'Laminado';
        break;
      case 77:
        this.proceso = 'Laminado';
        break;
      case 71:
        this.proceso = 'Doblado';
        break;
      case 78:
        this.proceso = 'Doblado';
        break;
      case 72:
        this.proceso = 'Corte';
        break;
      case 79:
        this.proceso = 'Corte';
        break;
      case 9:
        this.proceso = 'Empaque';
        break;
      case 80:
        this.proceso = 'Empaque';
        break;
      default:
        this.proceso = this.formDatosProduccion.value.proceso;
        break;
    }
    if (this.ValidarRol != 1) this.formDatosProduccion.patchValue({ proceso: this.validateProcess() });
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
    try {
      const port: SerialPort = await navigator.serial.requestPort();
      await port.open({ baudRate: 9600 });
      this.chargeDataFromSerialPort(port);
    } catch (ex) {
      if (ex.name === 'NotFoundError') this.msj.mensajeError('¡No hay dispositivos conectados!');
      else this.msj.mensajeError(ex);
    }
  }

  async chargeDataFromSerialPort(port: SerialPort) {
    let reader;
    let keepReading: boolean = true;
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
            this.formDatosProduccion.patchValue({
              pesoBruto: valor,
              pesoNeto: valor - this.formDatosProduccion.value.pesoTara,
            });
          }
        }
      } catch (error) {
        console.log(error);
      } finally {
        reader.releaseLock();
      }
    }
  }

  ab2str = (buf) => String.fromCharCode.apply(null, new Uint8Array(buf));

  eliminarDiacriticos = (texto) => texto.normalize('NFD').replace(/[\u0300-\u036f]/g, "");

  limpiarCampos() {
    this.cargando = false;
    this.formDatosProduccion.reset();
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
      this.operarios = data;
      this.operarios.sort((a, b) => a.usua_Nombre.localeCompare(b.usua_Nombre));
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

  consultarDatosProducto() {
    let item = this.formDatosProduccion.get('item').value;
    let datosItem;
    this.productoService.srvObtenerListaPorId(item).subscribe(data => datosItem = data);
    return datosItem.prod_Ancho;
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
    if (this.formDatosProduccion.value.proceso) {
      let ordenTrabajo = this.formDatosProduccion.get('ordenTrabajo').value;
      this.cargando = true;
      this.orderProductionsService.GetOrdenTrabajo(ordenTrabajo).subscribe(data => this.putDataOrderProduction(data), () => {
        this.bagproService.GetOrdenDeTrabajo(ordenTrabajo).subscribe(data => this.putDataOrderProduction(data), () => this.cargando = false, () => this.cargando = false);
      });
    } else this.msj.mensajeAdvertencia(`¡Debe haber seleccionado un proceso previamente!`);
  }

  putDataOrderProduction(data) {
    this.datosOrdenTrabajo = data;
    this.datosOrdenTrabajo[0].turno = this.formDatosProduccion.value.turno;
    this.buscarRollosPesados();
    data.forEach(datos => {
      this.clientsService.GetSedeClientexNitBagPro(datos.nitCliente).subscribe(dataClient => {
        dataClient.forEach(cli => {
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
            presentacion: datos.presentacion
          });
          this.buscarDatosConoSeleccionado();
        });
      });
    });
  }

  buscarRollosPesados() {
    this.rollosPesados = [];
    let proceso: string = this.eliminarDiacriticos(this.proceso).toUpperCase();
    let ordenTrabajo: string = this.formDatosProduccion.value.ordenTrabajo;
    this.bagproService.GetDatosRollosPesados(ordenTrabajo, proceso).subscribe(data => {
      this.rollosPesados = data;
      this.rollosPesados.sort((a, b) => Number(b.item) - Number(a.item));
    }, () => this.cargando = false, () => this.cargando = false);
  }

  sumarPesoBruto() {
    let total: number = 0;
    total = this.rollosPesados.reduce((a, b) => a + b.extBruto, 0);
    return total;
  }

  sumarPesoNeto() {
    let total: number = 0;
    total = this.rollosPesados.reduce((a, b) => a + b.extnetokg, 0);
    return total;
  }

  validarDatos() {
    this.cargando = true;
    this.obtenerTurnos();
    // this.buscarPuertos();
    setTimeout(() => {
      if (this.datosOrdenTrabajo.length > 0) {
        if (this.formDatosProduccion.valid) {
          if (this.formDatosProduccion.value.maquina > 0) {
            if (this.formDatosProduccion.value.pesoNeto > 0) this.guardarProduccion();
            else {
              this.msj.mensajeAdvertencia(`¡El peso Neto debe ser superior a cero (0)!`);
              this.cargando = false;
            }
          } else {
            this.msj.mensajeAdvertencia(`¡La maquina no puede ser cero (0)!`);
            this.cargando = false;
          }
        } else {
          this.msj.mensajeAdvertencia(`¡Todos los campos deben estar diligenciados!`);
          this.cargando = false;
        }
      } else {
        this.msj.mensajeAdvertencia(`¡Debe buscar la Orden de Trabajo a la que se le añadirá el rollo pesado!`);
        this.cargando = false;
      }
    }, 3000);
  }

  datosProduccion() : modelProduccionProcesos {
    let presentation = this.formDatosProduccion.value.presentacion;
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
      Cantidad: presentation == 'Unidad' ? 1 : 0,
      Peso_Teorico: 0,
      Desviacion: 0,
      Precio: 0,
      Presentacion: presentation,
      Proceso_Id: this.validateProcess(),
      Turno_Id: this.formDatosProduccion.value.turno,
      Envio_Zeus: false,
      Datos_Etiqueta: '',
      Fecha: moment().format('YYYY-MM-DD'),
      Hora: moment().format('HH:mm:ss'),
      Creador_Id: this.storage_Id,
    }
    return datos; 
  }

  guardarProduccion() {
    this.cargando = true;    
    this.produccionProcesosService.Post(this.datosProduccion()).subscribe(res => {
      // this.createTagProduction(res.numero_Rollo, res.peso_Bruto, res.peso_Neto);
      this.searchDataTagCreated(res.numero_Rollo);
      this.limpiarCampos();
      this.formDatosProduccion.patchValue({
        ordenTrabajo: res.ot,
        maquina : res.maquina,
        operario : res.operario1_Id,
        cono: res.cono_Id,
      });
      this.buscraOrdenTrabajo();
      this.msj.mensajeConfirmacion(`¡Rollo almacenado!`);
    }, () => {
      this.msj.mensajeError(`¡Ocurrió un error al registrar el rollo!`);
      this.cargando = false;
    });
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

  searchDataTagCreated(reel: number){
    this.bagproService.GetInformactionProductionForTag(reel).subscribe(res => {
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
          quantity: data.extBruto,
          quantity2: data.extnetokg,
          reel: data.item,
          presentationItem1: 'Kg Bruto',
          presentationItem2: 'Kg Neto',
          productionProcess: data.nomStatus.trim(),
          showNameBussiness: this.showNameBussiness,
        }
        this.createPDFService.createTagProduction(dataTagProduction);
      });
    });
  }

  createTagProduction(code: number, quantity: number, quantity2: number, copy: boolean = false) {
    let proceso = this.eliminarDiacriticos(this.proceso).toUpperCase();
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
    }
    this.createPDFService.createTagProduction(dataTagProduction);
  }

}