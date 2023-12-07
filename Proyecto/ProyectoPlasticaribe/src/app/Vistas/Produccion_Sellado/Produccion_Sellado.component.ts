import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import moment from 'moment';
import { Table } from 'primeng/table';
import { modelProduccionProcesos } from 'src/app/Modelo/modelProduccionProcesos';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { CreacionPdfService, modelTagProduction } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { Produccion_ProcesosService } from 'src/app/Servicios/Produccion_Procesos/Produccion_Procesos.service';
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
  hora: any = moment().format('hh:mm:ss'); //Hora actual
  esSoloLectura: boolean = true;  //Variable que ccolocará el campo cantidad editable o no.
  ordenConsultada: any; //Variable que guardará la orden actual consultada
  procesos: any = [{ Id: 'SELLA', Nombre: 'SELLADO' }, { Id: 'WIKE', Nombre: 'WIKETIADO' }]; //Array que guarda los procesos
  clase: any = ``; //Variable que guardará la clase que tendrá el campo cantidad realizada de la tabla
  cantBultoEstandar: number = 0; //Guardará la cantidad estandar de unidades/paquetes/kilos del bulto del item de la ot consultada
  cantActual: number = 0; //Guardará la cantidad pesada de unidades/paquetes/kilos del bulto del item de la ot consultada
  pesoActual: number = 0; //Guardará el peso actual de unidades/paquetes/kilos del bulto del item de la ot consultada  
  medida: string = '';

  constructor(private AppComponent: AppComponent,
    private svcTurnos: TurnosService,
    private frmBuilder: FormBuilder,
    private svcUsuarios: UsuarioService,
    private svcBagPro: BagproService,
    private svcMsjs: MensajesAplicacionService,
    private svcProdProcesos: Produccion_ProcesosService,
    private svcCrearPDF: CreacionPdfService,) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
    this.inicializarForm();
  }

  ngOnInit() {
    this.getTurnos();
    this.getOperarios();
    this.cargarTurnoActual();
    this.cargarPuertosSeriales();
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
    });

    this.formSellado.get('saldo')?.disable();
  }

  //Función que carga los turnos en el combobox
  getTurnos = () => this.svcTurnos.srvObtenerLista().subscribe(data => this.turnos = data);

  //Función que carga los operarios de sellado
  getOperarios = () => this.svcUsuarios.GetOperariosProduccion().subscribe(d => { this.operarios = d.filter(x => x.area_Id == 10); });

  //Función que busca la orden de trabajo y carga la información
  buscarOT() {
    this.ordenesTrabajo = [];
    this.produccion = [];
    this.cargarTurnoActual();
    this.svcBagPro.GetOrdenDeTrabajo(this.formSellado.value.ot).subscribe(data => {
      if (data.length > 0) {
        this.cargando = true;
        this.ordenConsultada = this.formSellado.value.ot;
        this.ordenesTrabajo = data;
        this.cantBultoEstandar = data[0].selladoCorte_CantBolsasBulto;
        this.formSellado.patchValue({ cantUnd: data[0].selladoCorte_CantBolsasBulto });
        this.formSellado.get('saldo')?.enable();
        setTimeout(() => this.calcularPesoTeorico(), 500);
        this.claseCantidadRealizada(data[0]);
        this.cargarProduccionSellado(this.formSellado.value.ot);
      }
    }, () => {
      this.svcMsjs.mensajeError(`La OT ${this.formSellado.value.ot} no existe!`);
      this.limpiarCampos();
    });
  }

  //Función que carga la producción de sellado para la OT consultada
  cargarProduccionSellado(ot: any) {
    this.svcBagPro.GetProduccionSellado(ot).subscribe(data => {
      if (data.length > 0) {
        let qty: any = this.formSellado.value.cantUnd;
        this.produccion = data;
        this.cantBultoEstandar = (qty == 0) ? data[0].cantidadUnd : qty;
        this.formSellado.patchValue({ cantUnd: qty == 0 ? data[0].cantidadUnd : qty });
        this.produccion.sort((a, b) => a.bulto - b.bulto);
        this.medida = data[0].presentacion1;
        this.cargando = false;
      } else this.cargando = false;
    }, () => this.svcMsjs.mensajeError(`La OT ${ot} no fue encontrada en el proceso de Sellado`));
  }

  //Función que carga el turno actual.
  cargarTurnoActual() {
    let horaInicioDia: any = '07:00:00';
    let horaFinDia: any = '18:00:00';
    let horaInicioNoche: any = '18:00:01';
    let horaFinNoche: any = '06:59:59';
    if (this.hora >= horaInicioDia && this.hora < horaFinDia) this.formSellado.patchValue({ turno: 'DIA' });
    else if (this.hora >= horaInicioNoche && this.hora < horaFinNoche) this.formSellado.patchValue({ turno: 'NOCHE' });
  }

  //Función que valida la entrada del registro
  validarEntrada() {
    if (this.formSellado.valid) {
      if (this.formSellado.value.ot != null && this.formSellado.value.ot != '') {
        if (this.ordenesTrabajo.length > 0) {
          if (this.formSellado.value.maquina > 0) {
            if (this.formSellado.value.idOperario != null) {
              if ((this.formSellado.value.idOperario).length < 5) {
                if (this.formSellado.value.cantUnd > 0) {
                  if (this.formSellado.value.cantKg > 0) this.crearEntrada(this.ordenesTrabajo[0]);
                  else this.svcMsjs.mensajeAdvertencia(`Advertencia`, `La cantidad en kilos debe ser mayor que '0'!`);
                } else this.svcMsjs.mensajeAdvertencia(`Advertencia`, `La cantidad en unidades/paquetes debe ser mayor a '0'!`);
              } else this.svcMsjs.mensajeAdvertencia(`Advertencia`, `Un rollo no puede ser pesado por más de 4 operarios, verifique!`);
            } else this.svcMsjs.mensajeAdvertencia(`Advertencia`, `Debe seleccionar al menos un operario!`);
          } else this.svcMsjs.mensajeAdvertencia(`Advertencia`, `Debe seleccionar una máquina válida!`);
        } else this.svcMsjs.mensajeAdvertencia(`Advertencia`, `No hay ordenes de trabajo consultadas!`);
      } else this.svcMsjs.mensajeAdvertencia(`Advertencia`, `Debe consultar una orden de trabajo!`);
    } else this.svcMsjs.mensajeAdvertencia(`Advertencia`, `Debe llenar todos los campos!`);
  }

  //Función que crea la entrada y alista el post.
  crearEntrada(orden: any) {
    this.cargando = true;
    let entrada: modelProduccionProcesos = {
      'OT': this.formSellado.value.ot,
      'Numero_Rollo': 0,
      'Prod_Id': orden.id_Producto,
      'Cli_Id': orden.nitCliente,
      'Operario1_Id': this.formSellado.value.idOperario[0],
      'Operario2_Id': this.formSellado.value.idOperario[1] == undefined ? 0 : this.formSellado.value.idOperario[1],
      'Operario3_Id': this.formSellado.value.idOperario[2] == undefined ? 0 : this.formSellado.value.idOperario[2],
      'Operario4_Id': this.formSellado.value.idOperario[3] == undefined ? 0 : this.formSellado.value.idOperario[3],
      'Pesado_Entre': (this.formSellado.value.idOperario).length,
      'Maquina': this.formSellado.value.maquina,
      'Cono_Id': 'N/A',
      'Ancho_Cono': 0,
      'Tara_Cono': 0,
      'Peso_Bruto': parseFloat(this.formSellado.value.cantKg),
      'Peso_Neto': parseFloat(this.formSellado.value.cantKg),
      'Cantidad': parseFloat(this.formSellado.value.cantUnd),
      'Peso_Teorico': parseFloat(this.formSellado.value.pesoTeorico),
      'Desviacion': 0,
      'Precio': this.validarPrecio(orden),
      'Presentacion': orden.presentacion == 'Unidad' ? 'Und' : orden.presentacion == 'Kilo' ? 'Kg' : orden.presentacion,
      'Proceso_Id': this.formSellado.value.proceso,
      'Turno_Id': this.formSellado.value.turno,
      'Envio_Zeus': false,
      'Datos_Etiqueta': `${orden.selladoCorte_Ancho} X ${orden.selladoCorte_Largo}`,
      'Fecha': this.hoy,
      'Hora': this.hora,
      'Creador_Id': this.AppComponent.storage_Id,
    }
    if (entrada.Presentacion == 'Kg') entrada.Cantidad = entrada.Peso_Bruto;
    else if (entrada.Presentacion == 'Und') entrada.Desviacion = ((entrada.Peso_Bruto - entrada.Peso_Teorico) * 100) / entrada.Peso_Teorico;
    else if (entrada.Presentacion == 'Paquete' && entrada.Cantidad == 1) entrada.Desviacion = ((entrada.Peso_Bruto - entrada.Peso_Teorico) * 100) / entrada.Peso_Teorico;
    else if (entrada.Presentacion == 'Paquete' && entrada.Cantidad > 1) entrada.Desviacion = 0;
    this.guardarRegistroEntrada(entrada);
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
  guardarRegistroEntrada(entrada: any) {
    this.svcProdProcesos.Post(entrada).subscribe(data => {
      this.crearEtiqueta(data.numero_Rollo, data.peso_Bruto, data.cantidad, data.presentacion);
      setTimeout(() => {
        this.svcMsjs.mensajeConfirmacion('Confirmación', `Registro de rollo de producción creado con éxito!`);
        this.limpiarCampos();
        //this.formSellado.patchValue({ ot : this.ordenConsultada});
        //this.buscarOT(); 
      }, 1000);
    }, () => this.svcMsjs.mensajeError(`Error`, `No fue posible crear el registro de entrada de producción!`))
  }

  //Función que limpia los campos del formulario
  limpiarCampos() {
    this.formSellado.reset();
    this.ordenesTrabajo = [];
    this.produccion = [];
    this.cargando = false;
    this.esSoloLectura = true;
    this.clase = ``;
    this.formSellado.get('saldo')?.disable();
    this.cargarTurnoActual();
    this.cantBultoEstandar = 0;
    this.medida = '';
  }

  //Función que filtra la info de la tabla 
  aplicarfiltro = ($event, campo: any, valorCampo: string) => this.dtProduccion!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

  //Función que habilita/Deshabilita el campo Cantidad de unidades/paquetes para agregar saldos 
  habilitarSaldo = () => this.esSoloLectura ? this.esSoloLectura = false : this.esSoloLectura = true;

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
    const port = await navigator.serial.requestPort();
    await port.open({ baudRate: 9600 });
    this.cargarDatosPuertoSerial(port);
  }

  //Función que lee los datos del puerto serial
  async cargarDatosPuertoSerial(port: any) {
    while (port.readable) {
      const reader = port.readable.getReader();
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
            this.formSellado.patchValue({
              cantKg: valor,
            });
          }
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  //Función que convierte un buffer a un valor
  ab2str = (buf) => String.fromCharCode.apply(null, new Uint8Array(buf));

  //Función que crea el pdf de la etiqueta
  crearEtiqueta(rollo: any, cantKg: number, cantUnd: number, medida: any) {
    let proceso: any = this.procesos.find(x => x.Id == this.formSellado.value.proceso);

    let etiqueta: modelTagProduction = {
      client: this.ordenesTrabajo[0].cliente,
      item: this.ordenesTrabajo[0].id_Producto,
      reference: this.ordenesTrabajo[0].producto,
      width: this.ordenesTrabajo[0].ancho1_Extrusion,
      height: this.ordenesTrabajo[0].ancho2_Extrusion,
      bellows: this.ordenesTrabajo[0].ancho3_Extrusion,
      und: this.ordenesTrabajo[0].und_Extrusion,
      cal: this.ordenesTrabajo[0].calibre_Extrusion,
      orderProduction: this.formSellado.value.ot,
      material: this.ordenesTrabajo[0].material,
      quantity: cantUnd,
      quantity2: cantKg,
      reel: rollo,
      presentationItem1: medida != 'Kg' ? `${medida}(s)` : 'Kg',
      presentationItem2: 'Kg',
      productionProcess: proceso.Nombre,
      showNameBussiness: true,
    }
    this.svcCrearPDF.createTagProduction(etiqueta);
  }

  //Función que calcula el peso teorico
  calcularPesoTeorico() {
    if (this.ordenesTrabajo.length > 0) {
      let pesoTeorico: number = 0;
      let pesoMillar: number = this.ordenesTrabajo[0].selladoCorte_PesoMillar;
      let cantidad: number = this.formSellado.value.cantUnd;
      let cantBolsasPaq: number = this.ordenesTrabajo[0].selladoCorte_CantBolsasPaquete;
      if (cantidad > this.cantBultoEstandar) this.svcMsjs.mensajeAdvertencia(`Advertencia`, `El saldo no puede ser mayor a ${this.cantBultoEstandar}`);
      else {
        if (this.ordenesTrabajo[0].presentacion == 'Kilo') pesoTeorico = cantidad;
        else if (this.ordenesTrabajo[0].presentacion == 'Unidad') pesoTeorico = ((cantidad * pesoMillar) / 1000);
        else if (this.ordenesTrabajo[0].presentacion == 'Paquete' && cantidad == 1) pesoTeorico = (cantidad * pesoMillar);
        else if (this.ordenesTrabajo[0].presentacion == 'Paquete' && cantidad > 1) pesoTeorico = ((cantidad * pesoMillar * cantBolsasPaq) / 1000);
        this.formSellado.patchValue({ 'pesoTeorico': pesoTeorico });
      }
    }
  }

  //Funcion que agrega una clase con un color especifico al campo cantidad realizada de la tabla.
  claseCantidadRealizada(data) {
    if (data.cantidad_Sellado == 0) this.clase = `badge bg-rojo`;
    else if (data.cantidad_Sellado > 0 && data.cantidad_Sellado < data.cantidad_Pedida) this.clase = `badge bg-amarillo`;
    else if (data.cantidad_Sellado >= data.cantidad_Pedida) this.clase = `badge bg-verde`;
    else this.clase = ``;
  }

  //Función en desuso
  getPuertoUsb() {
    let device: any;
    navigator.usb.requestDevice({ filters: [{ vendorId: 10473, productId: 643 }] }).then(devices => {
      device = devices;
      return device.open();
    });
  }

  //Función que calcula la cantidad de unidades/paquetes
  calcularCantidad = () => this.produccion.reduce((a, b) => a + b.cantidadUnd, 0);

  //Función que calcula el peso de unidades/paquetes
  calcularPeso = () => this.produccion.reduce((a, b) => a + b.peso, 0);
}
