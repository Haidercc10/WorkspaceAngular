import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import moment from 'moment';
import { Table } from 'primeng/table';
import { modelProduccion_Procesos } from 'src/app/Modelo/modelProduccion_Procesos';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
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
  esSaldo : boolean = false;  

  constructor(private AppComponent : AppComponent, 
  private svcTurnos : TurnosService,
  private frmBuilder : FormBuilder, 
  private svcUsuarios : UsuarioService, 
  private svcBagPro : BagproService, 
  private svcMsjs : MensajesAplicacionService) { 
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
    this.inicializarForm();
  }

  ngOnInit() {
    this.getTurnos();
    this.getOperarios();
    this.cargarTurnoActual();
  }

  inicializarForm(){
    this.formSellado = this.frmBuilder.group({
      ot : [null],
      turno : [null],
      idOperario : [null],
      cantUnd : [null],
      cantKg : [null],
      pesoTeorico : [null],
      pesoReal : [null],
      maquina : [null],
      saldo : [false],
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
        this.ordenesTrabajo = data; 
        this.formSellado.patchValue({ cantUnd : data[0].selladoCorte_CantBolsasBulto });
        this.svcBagPro.GetProduccionSellado(this.formSellado.value.ot).subscribe(dataSellado => {
          this.produccion = dataSellado;
          this.cargando = false;
        }, error => { this.svcMsjs.mensajeAdvertencia(`La OT ${this.formSellado.value.ot} no tiene producción en el proceso de Sellado`) });
      } 
    }, error => { this.ordenesNoEncontradas(); });
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
      if(this.formSellado.value.idOperario != null) {
        if( (this.formSellado.value.idOperario).length < 5) {
          if(this.formSellado.value.cantUnd > 0) {
            if(this.formSellado.value.cantKg > 0) {
              if(this.formSellado.value.pesoTeorico > 0) {
                if(this.formSellado.value.pesoReal > 0) {
                  this.crearEntrada(this.ordenesTrabajo[0]);
                } else this.svcMsjs.mensajeAdvertencia(`Advertencia`, `El peso real debe ser mayor a '0'!`);
              }  else this.svcMsjs.mensajeAdvertencia(`Advertencia`, `El peso teórico debe ser mayor a '0'!`);
            }  else this.svcMsjs.mensajeAdvertencia(`Advertencia`, `La cantidad en kilos debe ser mayor que '0'!`);
          } else this.svcMsjs.mensajeAdvertencia(`Advertencia`, `La cantidad en unidades/paquetes debe ser mayor a '0'!`);
        } else this.svcMsjs.mensajeAdvertencia(`Advertencia`, `Un rollo no puede ser pesado por más de 4 operarios, verifique!`);
      } else this.svcMsjs.mensajeAdvertencia(`Advertencia`, `Debe seleccionar al menos un operario!`);  
    } else this.svcMsjs.mensajeAdvertencia(`Advertencia`, `Debe llenar todos los campos!`);
  }

  crearEntrada(orden : any){
    let entrada : modelProduccion_Procesos = {
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
      'Peso_Neto': parseFloat(this.formSellado.value.pesoReal),
      'Cantidad': this.formSellado.value.cantUnd,
      'Peso_Teorico': parseFloat(this.formSellado.value.pesoTeorico),
      'Desviacion': 0,
      'Precio': orden.valorUnidad,
      'Presentacion': orden.presentacion == 'Unidad' ? 'Und' : orden.presentacion == 'Kilo' ? 'Kg' :  orden.presentacion,
      'Proceso_Id': 'SELLA' || 'WIK',
      'Turno_Id': this.formSellado.value.turno,
      'Envio_Zeus': 0,
      'Datos_Etiqueta': `${orden.selladoCorte_Ancho} X ${orden.selladoCorte_Ancho}`,
      'Fecha': this.hoy,
      'Hora': this.hora,
      'Creador_Id': this.AppComponent.storage_Id,
    }
    console.log(entrada);
  }

  limpiarCampos(){
    this.formSellado.reset();
    this.ordenesTrabajo = [];
    this.produccion = [];
    this.cargando = false;
    this.cargarTurnoActual();
  }
  
  aplicarfiltro = ($event, campo : any, valorCampo : string) => this.dtProduccion!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

  getPuertoUsb(){
    let device : any;
    navigator.usb.requestDevice({filters : [{ vendorId : 10473, productId : 643 }]}).then(devices => { 
      device = devices;
      console.log(devices)
      return device.open();
    })
    .then(() => device.selectConfiguration(1))
    .then(() => device.claimInterface(0))
    .then(() => device.controlTransferOut({
      requestType: 'class',
      recipient: 'interface',
      request: 0x22,
      value: 0x01,
      index: 0x00
    }))
    //.then(() => device.transferIn(5, 64))
    //.then(result => {
    //  console.log(result);
    //})
  }

  habilitarSaldo = () => this.formSellado.value.saldo == true ? this.esSaldo = true : this.esSaldo = false;
  
  async getPuertoSerial(){
    const port = await navigator.serial.requestPort();
    await port.open({ baudRate: 9600 });
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
              pesoTeorico : valor,
              pesoReal : valor,
            });
          }
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  ab2str = (buf) => String.fromCharCode.apply(null, new Uint8Array(buf));
}
