import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import moment from 'moment';
import { Table } from 'primeng/table';
import { modelProduccionProcesos } from 'src/app/Modelo/modelProduccionProcesos';
import { modelTrazabilidad_Produccion } from 'src/app/Modelo/modelTrazabilidad_Produccion';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { TagProduction_2, modelTagProduction } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';
import { MaquinasService } from 'src/app/Servicios/Maquinas/maquinas.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { ProcesosService } from 'src/app/Servicios/Procesos/procesos.service';
import { Produccion_ProcesosService } from 'src/app/Servicios/Produccion_Procesos/Produccion_Procesos.service';
import { ReImpresionEtiquetasService } from 'src/app/Servicios/ReImpresionEtiquetas/ReImpresionEtiquetas.service';
import { SedeClienteService } from 'src/app/Servicios/SedeCliente/sede-cliente.service';
import { TrazabilidadProduccionService } from 'src/app/Servicios/Trazabilidad_Produccion/trazabilidad-produccion.service';
import { TurnosService } from 'src/app/Servicios/Turnos/Turnos.service';
import { UsuarioService } from 'src/app/Servicios/Usuarios/usuario.service';
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
  storage_Id: number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre: any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol: any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol: number; //Variable que se usará en la vista para validar el tipo de rol
  maquinaConsultada: number;
  operariosConsultados: any = [];
  url : any = ``;
  repacking : boolean = false;
  maquinas : any = [];
  process : any = []; //Variable que alojará los procesos de los cuales proviene un rollo anterior
  modalRolls : boolean = false;
  rolls : any = [];
  orderProduction : number = null;
  @ViewChild('dt1') dt1: Table | undefined;

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
    private svMachines : MaquinasService,
    private router : Router,
    private svTraceability : TrazabilidadProduccionService,
    private svProcess : ProcesosService,
  ) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
    this.inicializarForm();
  }

  ngOnInit() {
    this.lecturaStorage();
    this.getTurnos();
    this.cargarTurnoActual();
    this.url = this.router.url;
    if(this.url == '/reempaque-sellado') this.repacking = true;
    this.getOperarios();
    this.getMachines();
    this.getProcess();
    // this.getPuertoSerial();
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
      etiquetaAsociada : [null, ],
      procesoAnterior : [null, ],
      otAlterna : [null, ],
    });
    this.formSellado.get('saldo')?.disable();
  }

  //Función para obtener las maquinas
  getMachines = () => this.svMachines.getAllMachines().subscribe(data => { this.maquinas = data.filter(x => ['SELLA', 'WIKE'].includes(x.proceso_Id)) }, err => {});

  //Función para obtener los procesos.
  getProcess() {
    this.svProcess.srvObtenerLista().subscribe(res => {
      res.filter(x => ['EXT', 'IMP', 'ROT', 'LAM', 'DBLD', 'CORTE', 'EMP', 'MATPRIMA'].includes(x.proceso_Id)).forEach(process => {
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
    navigator.serial.getPorts().then(ports => {
      ports.forEach(port => {
        port.open({ baudRate: 9600 }).then(async () => this.cargarDatosPuertoSerial(port), error => this.svcMsjs.mensajeError(`${error}`));
      });
    });
  }

  //Función que obtiene los puertos seriales
  async getPuertoSerial() {
    try {
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 9600 });
      this.cargarDatosPuertoSerial(port);
    } catch (ex) {
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
  ab2str = (buf) => String.fromCharCode.apply(null, new Uint8Array(buf));

  //Función que carga los turnos en el combobox
  getTurnos = () => this.svcTurnos.srvObtenerLista().subscribe(data => this.turnos = data);

  //Función que carga los operarios de sellado
  getOperarios() {
    this.svcUsuarios.GetOperariosProduccion().subscribe(d => { 
      if(this.repacking) {
        this.operarios = d.filter(x => x.usua_Id == 0); 
        this.formSellado.patchValue({ 'idOperario': [0] });
      } else this.operarios = d.filter(x => x.area_Id == 10 && x.usua_Id != 0); 
    });
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
    this.cantBultoEstandar = 0;
    this.medida = '';
    if(this.repacking) this.formSellado.patchValue({ 'idOperario': [0]  });
  }

  //Función que filtra la info de la tabla
  aplicarfiltro = ($event, campo: any, valorCampo: string) => this.dtProduccion!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

  //Función que habilita/Deshabilita el campo Cantidad de unidades/paquetes para agregar saldos
  habilitarSaldo = () => this.esSoloLectura ? this.esSoloLectura = false : this.esSoloLectura = true;

  //Función que busca la orden de trabajo y carga la información
  buscarOT(validacionDatos: boolean = false) {
    this.ordenesTrabajo = [];
    this.produccion = [];
    this.cargarTurnoActual();
    this.svcBagPro.GetOrdenDeTrabajo(this.formSellado.value.ot).subscribe(data => {
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
            this.formSellado.patchValue({ cantUnd: cantUnd });
          }
          this.formSellado.get('saldo')?.enable();
          this.validarProceso();
          setTimeout(() => this.calcularPesoTeorico(), 500);
          this.claseCantidadRealizada(data[0]);
          this.cargarProduccionSellado(this.formSellado.value.ot, validacionDatos);
        }
      }, () => {
        this.svcMsjs.mensajeError(`La OT ${this.formSellado.value.ot} no existe!`);
        this.limpiarCampos();
      });
    }, () => {
      this.svcMsjs.mensajeError(`La OT ${this.formSellado.value.ot} no existe!`);
    });
  }

  msjTotalProduction(data : any){
    let pedida : number = data[0].cantidad_Pedida;
    let sellada : number = data[0].cantidad_Sellado;
    let unit : string = data[0].presentacion;

    if(sellada > pedida) this.svcMsjs.mensajeAdvertencia(`La orden está sobrepasada!`, `Se solicitaron ${pedida.toLocaleString()} y se han producido ${sellada.toLocaleString()} ${unit}.`);
    else if(sellada == pedida) this.svcMsjs.mensajeAdvertencia(`Advertencia`, `La cantidad solicita es igual a la cantidad producida!`);
  }

  //Función que cargará los campos
  cargarCamposUltimaOT() {
    this.ordenConsultada = this.formSellado.value.ot;
    this.maquinaConsultada = this.formSellado.value.maquina;
    this.operariosConsultados = this.formSellado.value.idOperario;
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
      let pesoMillar: number = this.ordenesTrabajo[0].selladoCorte_PesoMillar;
      let cantidad: number = this.formSellado.value.cantUnd;
      let cantBolsasPaq: number = this.ordenesTrabajo[0].selladoCorte_CantBolsasPaquete;
      if (this.ordenesTrabajo[0].presentacion == 'Kilo') pesoTeorico = cantidad;
      else if (this.ordenesTrabajo[0].presentacion == 'Unidad') pesoTeorico = ((cantidad * pesoMillar) / 1000);
      else if (this.ordenesTrabajo[0].presentacion == 'Paquete' && cantidad == 1) pesoTeorico = (cantidad * pesoMillar);
      else if (this.ordenesTrabajo[0].presentacion == 'Paquete' && cantidad > 1) pesoTeorico = ((cantidad * pesoMillar * cantBolsasPaq) / 1000);
      this.formSellado.patchValue({ 'pesoTeorico': pesoTeorico });
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
        this.formSellado.patchValue({ cantUnd: cantUnd });
      }
    }, () => this.svcMsjs.mensajeError(`La OT ${ot} no fue encontrada en el proceso de Sellado`));
  }

  //Función que calcula la cantidad de unidades/paquetes
  calcularCantidad = () => this.produccion.reduce((a, b) => a + b.cantidadUnd, 0);

  //Función que calcula el peso de unidades/paquetes
  calcularPeso = () => this.produccion.reduce((a, b) => a + b.peso, 0);

  //Función que valida la entrada del registro
  validarEntrada() {
    //console.log(this.formSellado);
    let ot : number = this.formSellado.value.ot;
    let oldProcess : any = this.formSellado.value.procesoAnterior;
    let tag : any = this.formSellado.value.etiquetaAsociada;
    this.cargando = true;
    this.getPuertoSerial();
    //this.buscarOT(true);
    if(this.repacking) this.formSellado.patchValue({ idOperario : [0] });
    setTimeout(() => {
      if (this.formSellado.valid) {
        if (this.formSellado.value.ot != null && this.formSellado.value.ot != '') {
          if (this.ordenesTrabajo.length > 0) {
            if(ot == this.ordenesTrabajo[0].numero_Orden) {
              if (this.formSellado.value.maquina > 0) {
                if (this.formSellado.value.idOperario != null) {
                  if ((this.formSellado.value.idOperario).length < 5) {
                    if(oldProcess) {
                      if(tag) {
                        if(tag.toString().length >= 6) {
                          if (this.formSellado.value.cantUnd > 0) {
                            if (this.formSellado.value.cantKg > 1 && this.formSellado.value.cantKg <= 65) {
                              if(oldProcess == 'MATPRIMA') this.crearEntrada(this.ordenesTrabajo[0]); 
                              else this.searchOldTag(this.ordenesTrabajo[0], tag, oldProcess); 
                            } else this.warnMsj(`Advertencia`, `¡La cantidad de kilos debe ser mayor a '1' y menor o igual a 65!`);
                          } else this.warnMsj(`Advertencia`, `¡La cantidad en unidades/paquetes debe ser mayor a '0'!`);
                        } else this.warnMsj(`Advertencia`, `¡La cantidad de digitos del rollo madre debe ser mayor a 5!`);
                      } else this.warnMsj(`Advertencia`, `Debe agregar un número de rollo madre válido!`);
                    } else this.warnMsj(`Advertencia`, `Debe elegir el proceso madre de esta producción!`);
                  } else this.warnMsj(`Advertencia`, `¡Un rollo no puede ser pesado por más de 4 operarios, verifique!`);
                } else this.warnMsj(`Advertencia`, `¡Debe seleccionar al menos un operario!`);
              } else this.warnMsj(`Advertencia`, `¡Debe seleccionar una máquina válida!`);
            } else this.warnMsj(`Advertencia`, `La orden de trabajo consultada no coincide con la que desea registrar`);
          } else this.warnMsj(`Advertencia`, `¡No hay ordenes de trabajo consultadas!`);
        } else this.warnMsj(`Advertencia`, `¡Debe consultar una orden de trabajo!`);
      } else this.warnMsj(`Advertencia`, `¡Debe llenar todos los campos!`);
    }, 500);
  }

  //Mensaje de Advertencia.
  warnMsj(msj1 : any, msj2 : any){
    this.svcMsjs.mensajeAdvertencia(msj1, msj2);
    this.cargando = false;
  }

  msjsOldProcess = () => 'Selecciona el proceso madre de donde provino el rollo con el que se realizó esta producción';

  msjsOldRoll = () => 'Presiona "Enter" para cargar el modal de rollos madre.';

  msjsAltOT = () => 'Coloca el número de OT alternativa y presiona enter, para seleccionar un rollo madre de esta producción';

  //Buscar rollo madre 
  searchOldTag(dataOrderProduction : any, tag : number, process : any){
    this.svcBagPro.getRollProduction(tag, `?process=${this.changeNameProcess(process)}`).subscribe(data => {
      if(data) this.crearEntrada(dataOrderProduction, data);
      else this.svcMsjs.mensajeAdvertencia(`La etiqueta asociada no hace parte del proceso de ${this.changeNameProcess(process)}`);
    }, error => {
      this.svcMsjs.mensajeAdvertencia(`No se encontró información de la etiqueta asociada | ${error.status} ${error.statusText}`);
    });
  }

  //Función que crea la entrada y alista el post.
  crearEntrada(orden: any, data?: any) {
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
      'Peso_Bruto': parseFloat(this.formSellado.value.cantKg),
      'Peso_Neto': parseFloat(this.formSellado.value.cantKg),
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
      'Etiqueta_Trazabilidad' : this.formSellado.value.etiquetaAsociada,
    }
    this.guardarRegistroEntrada(entrada, data);
  }

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
  guardarRegistroEntrada(entrada: any, dataTagAssociated? : any) {
    let motherProcess : any = this.formSellado.value.procesoAnterior; 
    this.svcProdProcesos.Post(entrada).subscribe(data => {
      this.crearEtiqueta(data.numero_Rollo, data.peso_Bruto, data.cantidad, data.presentacion, false, data.operario1_Id, data.datos_Etiqueta, data, motherProcess, dataTagAssociated);
      setTimeout(() => {
        if (entrada.Desviacion < 0) this.svcMsjs.mensajeAdvertencia(`¡La cantidad pesada es menor a la esperada!`, `!Registro de rollo de producción creado con éxito¡`, 1200000);
        else this.svcMsjs.mensajeConfirmacion('Confirmación', `Registro de rollo de producción creado con éxito!`);
        this.cargarCamposUltimaOT();
        this.limpiarCampos();
        this.formSellado.patchValue({ ot: this.ordenConsultada, maquina: this.maquinaConsultada, idOperario: this.operariosConsultados });
        this.buscarOT();
      }, 1000);
    }, () => this.svcMsjs.mensajeError(`Error`, `No fue posible crear el registro de entrada de producción!`))
  }

  //Función que crea el pdf de la etiqueta
  crearEtiqueta(rollo: any, cantKg: number, cantUnd: number, medida: any, reimpresion: boolean, operador: any, datosEtiqueta: string = '', productionPL : any, motherProcess : string, tagAssociated? : any) {
    let dataRollo: any = reimpresion ? this.produccion.find(x => x.bulto == rollo).proceso : this.procesos.find(x => x.Id == this.formSellado.value.proceso).Nombre;
    let operario: any;
    if (!reimpresion) operario = this.operarios.filter(x => x.usua_Id == operador);
    else if (reimpresion) operario = this.operarios.filter(x => x.usua_Nombre == operador);

    this.svcBagPro.GetEtiquetaBagpro(rollo, !reimpresion ? 0 : 1).subscribe(data => {
      let etiqueta: modelTagProduction = {
        'client': this.ordenesTrabajo[0].cliente,
        'item': this.ordenesTrabajo[0].id_Producto,
        'reference': this.ordenesTrabajo[0].producto,
        'width': this.ordenesTrabajo[0].ancho1_Extrusion,
        'height': this.ordenesTrabajo[0].ancho2_Extrusion,
        'bellows': this.ordenesTrabajo[0].ancho3_Extrusion,
        'und': this.ordenesTrabajo[0].und_Extrusion,
        'cal': this.ordenesTrabajo[0].calibre_Extrusion,
        'orderProduction': this.formSellado.value.ot,
        'material': this.ordenesTrabajo[0].material,
        'quantity': cantKg,
        'quantity2': medida == 'Kg' ? cantUnd : Math.trunc(cantUnd),
        'reel': data[0].bulto,
        'presentationItem1': 'Kg',
        'presentationItem2': medida != 'Kg' ? `${medida}(s)` : 'Kg',
        'productionProcess': (dataRollo).toUpperCase(),
        'showNameBussiness': true,
        'operator': operario[0].usua_Nombre == '0' ? '' : operario[0].usua_Nombre,
        'copy': reimpresion,
        'dataTagForClient': datosEtiqueta == '' ? `${this.ordenesTrabajo[0].selladoCorte_Etiqueta_Ancho} X ${this.ordenesTrabajo[0].selladoCorte_Etiqueta_Largo}` : datosEtiqueta,
        showDataTagForClient: this.formSellado.value.mostratDatosProducto,
      }
      this.createTraceability(productionPL, data, motherProcess, tagAssociated);
      this.svcCrearPDF.createTagProduction(etiqueta);
    }, () => { this.svcMsjs.mensajeError(`Error`, `No fue posible generar la etiqueta, por favor verifique!`) });
  }

   //Cambiar nombre de proceso de bagpro a plasticaribe
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
      case 'MATPRIMA' :
        return 'MATPRIMA';
      default :
        return ''; 
    }
   }

  //Cambiar nombre de proceso de plasticaribe a bagpro
  changeProcessInverse(process : string){
    switch (process) {
      case 'EXTRUSION' :
        return 'EXT';
      case 'IMPRESION' :
        return 'IMP';
      case 'LAMINADO' :
        return 'LAM';
      case 'CORTE' :
        return 'CORTE';
      case 'DOBLADO' :
        return 'DBLD';
      case 'EMPAQUE' :
        return 'EMP';
      case 'SELLADO' :
        return 'SELLA';
      case 'ROTOGRABADO' :
        return 'ROT';
      case 'MATPRIMA' :
          return 'MATPRIMA';  
      default :
        return ''; 
    }
  }

  //Modelo de trazabilidad
  modelTraceability(productionPL : any, produccionBagPro : any, motherProcess : string, infoTagAssociated? : any){
    let info : modelTrazabilidad_Produccion = {
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
      'Trz_EtiquetaAnterior': infoTagAssociated ? infoTagAssociated.rollo : this.formSellado.value.etiquetaAsociada,
      'Trz_OtAnterior': infoTagAssociated ? infoTagAssociated.ot : null,
      'Prod_Anterior': infoTagAssociated ? infoTagAssociated.item : 1,
      'Proceso_Anterior': motherProcess,
    } 
    return info;
  }

  //Crear registro de trazabilidad. 
  createTraceability(productionProcess : any, infoTagBagPro : any, motherProcess : string, infoTagAssociated? : number){
    this.svTraceability.PostTraceability(this.modelTraceability(productionProcess, infoTagBagPro, motherProcess, infoTagAssociated)).subscribe(trace => {
    }, error => {
      this.svcMsjs.mensajeError(`Error`, `Error al crear el registro de trazabilidad | ${error.status} ${error.statusText}`);
      this.cargando = false;
    });
  }

  //Validar información de rollos por OT
  validateOrderProduction(typeOT : string){
    this.rolls = [];
    let ot : number = typeOT == 'altern' ? ![null, '', undefined].includes(this.formSellado.value.otAlterna) ? this.formSellado.value.otAlterna : this.formSellado.value.ot : this.formSellado.value.ot;
    let motherProcess : string = this.formSellado.value.procesoAnterior;
    
    this.orderProduction = null;

    if(ot && motherProcess) {
      this.cargando = true;
      this.svcBagPro.GetObtenerDatosxProcesos(ot, this.changeNameProcess(motherProcess)).subscribe(data => {
        if(data) {
          this.modalRolls = true;
          this.rolls = data;
          this.cargando = false;
          this.orderProduction = ot;
        } else {
          this.warnMsj(`Advertencia`, `No se encontraron rollos de la OT ${ot} en el proceso de ${this.changeNameProcess(motherProcess)}`);
          this.orderProduction = ot;
        }
      }, error => {
        this.warnMsj(`Error`, `Error al consultar rollos de la OT ${ot} en el proceso de ${this.changeNameProcess(motherProcess)} | ${error.status} ${error.statusText}`);
      });
    } else {
      this.warnMsj(`Advertencia`, `Debe diligenciar los campos 'Proceso Madre' y 'OT'`);
    }
  }

  //Función para cargar los rollos madres de bulto
  loadMotherRolls(tag : any, process : string){
    this.modalRolls = false;
    this.formSellado.patchValue({ 'etiquetaAsociada' :  tag });
    this.svcMsjs.mensajeConfirmacion(`Confirmación`, `Se asoció el rollo madre N° ${tag} del proceso de ${process} exitosamente!`);
  }

  //Filtrar la tabla de los rollos cargados en el modal.
  applyFilter = ($event, campo : any, actionField : any) => this.dt1!.filter(($event.target as HTMLInputElement).value, campo, actionField);

  //Función para inactivar el campo OT alterna
  changeOldProcess(){
    let motherProcess : any = this.formSellado.value.procesoAnterior;
    if(motherProcess == 'MATPRIMA') {
      this.formSellado.patchValue({ etiquetaAsociada: null, otAnterior : null });
    }
  }
}
