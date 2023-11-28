import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import moment from 'moment';
import { Table } from 'primeng/table';
import { modelProduccionProcesos } from 'src/app/Modelo/modelProduccionProcesos';
import { modelProduccion_Procesos } from 'src/app/Modelo/modelProduccion_Procesos';
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
  
  cargando : boolean = false; //Variable de carga 
  modoSeleccionado : boolean = false; //Variable de modo de seleccion
  formSellado !: FormGroup; //Formulario de sellado
  turnos : any [] = []; //array que contiene los diferentes turnos
  operarios : any [] = []; //array que contiene los diferentes operarios
  ordenesTrabajo : any [] = []; //array que contiene las diferentes ordenes de trabajo
  produccion : any [] = []; //array que contiene las diferentes producciones
  @ViewChild('dtProduccion') dtProduccion : Table | undefined;
  hoy : any = moment().format('YYYY-MM-DD');
  hora : any = moment().format('hh:mm:ss');
  esSoloLectura : boolean = true;  
  ordenConsultada : any;
  procesos : any = [{Id : 'SELLA', Nombre: 'SELLADO'}, {Id : 'WIKE', Nombre: 'WIKETIADO'}]
  clase : any = ``

  constructor(private AppComponent : AppComponent, 
  private svcTurnos : TurnosService,
  private frmBuilder : FormBuilder, 
  private svcUsuarios : UsuarioService, 
  private svcBagPro : BagproService, 
  private svcMsjs : MensajesAplicacionService, 
  private svcProdProcesos : Produccion_ProcesosService, 
  private svcCrearPDF : CreacionPdfService, ) { 
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
    this.inicializarForm();
  }

  ngOnInit() {
    this.getTurnos();
    this.getOperarios();
    this.cargarTurnoActual();
    this.cargarPuertosSeriales();
  }

  inicializarForm(){
    this.formSellado = this.frmBuilder.group({
      ot : [null],
      turno : [null],
      idOperario : [null],
      cantUnd : [null],
      cantKg : [null],
      pesoTeorico : [null],
      pesoNeto : [null],
      maquina : [null],
      saldo : [false],
      proceso : ['SELLA'],
    });
  }

  getTurnos = () => this.svcTurnos.srvObtenerLista().subscribe(data => this.turnos = data);

  getOperarios = () => this.svcUsuarios.GetOperariosProduccion().subscribe(data => this.operarios = data); 

  buscarOT(){
    this.ordenesTrabajo = [];
    this.produccion = [];
    this.cargarTurnoActual();
    this.svcBagPro.GetOrdenDeTrabajo(this.formSellado.value.ot).subscribe(data => { 
      if(data.length > 0) { 
        this.cargando = true;
        this.ordenConsultada = this.formSellado.value.ot;
        this.ordenesTrabajo = data; 
        console.log(this.ordenesTrabajo)
        this.formSellado.patchValue({ cantUnd : data[0].selladoCorte_CantBolsasBulto }); 
        if (data[0].cantidad_Sellado == 0) this.clase = `badge bg-rojo`;
        else if (data[0].cantidad_Sellado > 0 && data[0].cantidad_Sellado < data[0].cantidad_Pedida) this.clase = `badge bg-amarillo`;
        else if(data[0].cantidad_Sellado >= data[0].cantidad_Pedida) this.clase = `badge bg-verde`;
        else this.clase = ``;
        this.cargarProduccionSellado(this.formSellado.value.ot)
      }
    }, error => { this.ordenesNoEncontradas(); });
  }

  cargarProduccionSellado(ot : any){
    this.svcBagPro.GetProduccionSellado(ot).subscribe(data => {
      if(data.length > 0) {
        let qty : any = this.formSellado.value.cantUnd;
        this.produccion = data;
        this.formSellado.patchValue({ cantUnd : qty == 0 ? data[0].cantidadUnd : qty });
        this.produccion.sort((a, b) => a.bulto - b.bulto);
        this.cargando = false;
      } else this.cargando = false;
    }, error => { this.svcMsjs.mensajeError(`La OT ${ot} no fue encontrada en el proceso de Sellado`) });
  }

  ordenesNoEncontradas(){
    this.svcMsjs.mensajeAdvertencia(`Advertencia`, `La OT ${this.formSellado.value.ot} no existe!`);
    this.cargando = false;
    this.ordenesTrabajo = [];
    this.produccion = [];
  }

  cargarTurnoActual(){
    let horaInicioDia : any = '07:00:00';
    let horaFinDia : any = '18:00:00'; 
    let horaInicioNoche : any = '18:00:01'; 
    let horaFinNoche : any = '06:59:59';
    
    if(this.hora >= horaInicioDia && this.hora < horaFinDia) this.formSellado.patchValue({ turno : 'DIA' });
    else if(this.hora >= horaInicioNoche && this.hora < horaFinNoche) this.formSellado.patchValue({ turno : 'NOCHE' });
  }

  validarEntrada(){
    if(this.formSellado.valid) {
      if(this.formSellado.value.maquina > 0) {
        if(this.formSellado.value.idOperario != null) {
          if( (this.formSellado.value.idOperario).length < 5) {
            if(this.formSellado.value.cantUnd > 0) {
              if(this.formSellado.value.cantKg > -2) {
                this.crearEntrada(this.ordenesTrabajo[0]);
              } else this.svcMsjs.mensajeAdvertencia(`Advertencia`, `La cantidad en kilos debe ser mayor que '0'!`);
            } else this.svcMsjs.mensajeAdvertencia(`Advertencia`, `La cantidad en unidades/paquetes debe ser mayor a '0'!`);
          } else this.svcMsjs.mensajeAdvertencia(`Advertencia`, `Un rollo no puede ser pesado por más de 4 operarios, verifique!`);
        } else this.svcMsjs.mensajeAdvertencia(`Advertencia`, `Debe seleccionar al menos un operario!`);  
      } else this.svcMsjs.mensajeAdvertencia(`Advertencia`, `Debe seleccionar una máquina válida!`);
    } else this.svcMsjs.mensajeAdvertencia(`Advertencia`, `Debe llenar todos los campos!`);
  }

  crearEntrada(orden : any){
    this.cargando = true;
    let entrada : modelProduccionProcesos = {
      'OT': this.formSellado.value.ot,
      'Numero_Rollo': 0,
      'Prod_Id': orden.id_Producto,
      'Cli_Id': orden.nitCliente,
      'Operario1_Id': this.formSellado.value.idOperario[0],
      'Operario2_Id': this.formSellado.value.idOperario[1] == undefined ? null : this.formSellado.value.idOperario[1],
      'Operario3_Id': this.formSellado.value.idOperario[2] == undefined ? null : this.formSellado.value.idOperario[2],
      'Operario4_Id': this.formSellado.value.idOperario[3] == undefined ? null : this.formSellado.value.idOperario[3],
      'Pesado_Entre': (this.formSellado.value.idOperario).length,
      'Maquina': this.formSellado.value.maquina,
      'Cono_Id': 'N/A',
      'Ancho_Cono': 0,
      'Tara_Cono': 0,
      'Peso_Bruto': parseFloat(this.formSellado.value.cantKg),
      'Peso_Neto': parseFloat(this.formSellado.value.cantKg),
      'Cantidad': parseFloat(this.formSellado.value.cantUnd),
      'Peso_Teorico': 0,
      'Desviacion': 0,
      'Precio': orden.valorUnidad,
      'Presentacion': orden.presentacion == 'Unidad' ? 'Und' : orden.presentacion == 'Kilo' ? 'Kg' : orden.presentacion,
      'Proceso_Id': this.formSellado.value.proceso,
      'Turno_Id': this.formSellado.value.turno,
      'Envio_Zeus': false,
      'Datos_Etiqueta': `${orden.selladoCorte_Ancho} X ${orden.selladoCorte_Largo}`,
      'Fecha': this.hoy,
      'Hora': this.hora,
      'Creador_Id': this.AppComponent.storage_Id,
    }
    if(entrada.Presentacion == 'Kg') {
      entrada.Peso_Teorico = entrada.Peso_Bruto;
      entrada.Cantidad = entrada.Peso_Bruto;
      entrada.Desviacion = 0;
    } else if(entrada.Presentacion == 'Und') {
      entrada.Peso_Teorico = ((orden.selladoCorte_PesoMillar * this.formSellado.value.cantUnd) / 1000); 
      entrada.Desviacion = ((entrada.Peso_Bruto - entrada.Peso_Teorico) * 100) / entrada.Peso_Teorico;
    } else if(entrada.Presentacion == 'Paquete' && entrada.Cantidad == 1) {
      entrada.Peso_Teorico = (orden.selladoCorte_PesoMillar * this.formSellado.value.cantUnd); 
      entrada.Desviacion = ((entrada.Peso_Bruto - entrada.Peso_Teorico) * 100) / entrada.Peso_Teorico;
    } else if(entrada.Presentacion == 'Paquete' && entrada.Cantidad > 1) {
      entrada.Peso_Teorico = ((entrada.Cantidad * orden.selladoCorte_PesoMillar * orden.selladoCorte_CantBolsasPaquete) / 1000); 
      entrada.Desviacion = 0;
    }
    this.guardarRegistroEntrada(entrada);
  }

  guardarRegistroEntrada(entrada : any){
    this.svcProdProcesos.Post(entrada).subscribe(data => { 
    this.crearEtiqueta(data.numero_Rollo, data.peso_Bruto, data.cantidad, data.presentacion);
    setTimeout(() => {
      this.svcMsjs.mensajeConfirmacion('Confirmación', `Registro de entrada de producción creado con éxito!`);
      this.limpiarCampos();
      this.formSellado.patchValue({ ot : this.ordenConsultada});
      this.buscarOT(); 
    }, 1000); 
    }, error => this.svcMsjs.mensajeError(`Error`, `No fue posible crear el registro de entrada de producción!`))
  }

  limpiarCampos(){
    this.formSellado.reset();
    this.ordenesTrabajo = [];
    this.produccion = [];
    this.cargando = false;
    this.esSoloLectura = true;
    this.clase = ``;
    this.cargarTurnoActual();
  }
  
  aplicarfiltro = ($event, campo : any, valorCampo : string) => this.dtProduccion!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

  habilitarSaldo = () => this.esSoloLectura ? this.esSoloLectura = false : this.esSoloLectura = true;
  
  cargarPuertosSeriales(){
    navigator.serial.getPorts().then(ports => {
      ports.forEach(port => {
        port.open({ baudRate: 9600 }).then(async () => {
          this.cargarDatosPuertoSerial(port);
        }, error => this.svcMsjs.mensajeError(`${error}`));
      });
    });
  }

  async getPuertoSerial(){
    const port = await navigator.serial.requestPort();
    await port.open({ baudRate: 9600 });
    this.cargarDatosPuertoSerial(port);
  }

  async cargarDatosPuertoSerial(port : any) {
    while(port.readable) {
      const reader = port.readable.getReader();
      try {
        while(true) {
          const { value, done } = await reader.read(); 
          if(done) {
            reader.releaseLock();
            break;
          }
          if(value) {
            let valor = this.ab2str(value);
            valor = valor.replace(/[^\d.-]/g, '');
            this.formSellado.patchValue({
              cantKg : valor,
            });
          }
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  ab2str = (buf) => String.fromCharCode.apply(null, new Uint8Array(buf));

  crearEtiqueta(rollo : any, cantKg : number, cantUnd : number, medida : any){
    let proceso : any = this.procesos.find(x => x.Id == this.formSellado.value.proceso);
    
    let etiqueta : modelTagProduction = {
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
      presentationItem1: `${medida}(s)`,
      presentationItem2: 'Kg',
      productionProcess: proceso.Nombre,
      showNameBussiness: true,
    }
    this.svcCrearPDF.createTagProduction(etiqueta);
  }

  //Función en desuso
  getPuertoUsb(){
    let device : any;
    navigator.usb.requestDevice({filters : [{ vendorId : 10473, productId : 643 }]}).then(devices => { 
      device = devices;
      console.log(devices)
      return device.open();
    });
  }
}
