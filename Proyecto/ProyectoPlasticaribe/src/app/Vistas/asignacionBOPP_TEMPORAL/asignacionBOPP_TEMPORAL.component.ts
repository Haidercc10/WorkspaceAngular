import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShepherdService } from 'angular-shepherd';
import moment from 'moment';
import { MessageService } from 'primeng/api';
import { modelEntradas_Salidas_MP } from 'src/app/Modelo/modelEntradas_Salidas_MP';
import { modeloMovimientos_Entradas_MP } from 'src/app/Modelo/modeloMovimientos_Entradas_MP';
import { AsignacionBOPPService } from 'src/app/Servicios/Asignacion_Bopp/asignacionBOPP.service';
import { EntradaBOPPService } from 'src/app/Servicios/BOPP/entrada-BOPP.service';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { DetalleAsignacion_BOPPService } from 'src/app/Servicios/DetallesAsgBopp/detallesAsignacionBOPP.service';
import { Entradas_Salidas_MPService } from 'src/app/Servicios/Entradas_Salidas_MP/Entradas_Salidas_MP.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { Movimientos_Entradas_MPService } from 'src/app/Servicios/Movimientos_Entradas_MP/Movimientos_Entradas_MP.service';
import { AppComponent } from 'src/app/app.component';
import { defaultStepOptions, stepAsignacionBopp as defaultSteps } from 'src/app/data';

@Component({
  selector: 'app-asignacionBOPP_TEMPORAL',
  templateUrl: './asignacionBOPP_TEMPORAL.component.html',
  styleUrls: ['./asignacionBOPP_TEMPORAL.component.css']
})

export class AsignacionBOPP_TEMPORALComponent implements OnInit {

  public load: boolean = true;
  public FormAsignacionBopp !: FormGroup;
  public FormularioBOPP !: FormGroup;
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  ArrayBOPP = []; //Varibale que almacenará los BOPP existentes
  ArrayBoppPedida = []; //variable que almacenará el BOPPP pedido por una orden de trabajo
  boppSeleccionado : any; //Variable que almacenará la informacion del bopp que haya sido selccionado
  ordenesTrabajo = [ ]; //Variable que almacenará las ordenes de trabajo que se consulten {ot : 121333}, {ot : 121334}, {ot : 121335}
  cantidadKG : number = 0; //Variable almacenará la cantidad en kilogramos pedida en la OT
  arrayOT : any = [];
  itemSeleccionado : any;
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  kgOT : number; //Variable que va alamacenar la cantidad de kilos que se piden en la orden de trabajo
  hora : any = moment().format('H:mm:ss'); //Variable que va a almacenar la hora actual
  entradas : any = [];
  salidas : any = [];
  idAsignacion : number;

  constructor(private FormBuilderAsignacion : FormBuilder,
                private FormBuilderBOPP : FormBuilder,
                  private AppComponent : AppComponent,
                    private boppService : EntradaBOPPService,
                      private asignacionBOPPService : AsignacionBOPPService,
                        private detallesAsignacionBOPPService : DetalleAsignacion_BOPPService,
                          private bagProService : BagproService,
                            private messageService: MessageService,
                              private shepherdService: ShepherdService,
                                private msj : MensajesAplicacionService,
                                  private srvMovEntradasMP : Movimientos_Entradas_MPService,
                                    private srvMovSalidasMP : Entradas_Salidas_MPService,) {

    this.FormAsignacionBopp = this.FormBuilderAsignacion.group({
      AsgBopp_OT : ['', Validators.required],
      AsgBopp_Ancho : [0, Validators.required],
      AsgBopp_Fecha : [this.today, Validators.required],
      AsgBopp_Observacion: ['', Validators.required],
      AsgBopp_Estado: ['', Validators.required],
      AsgBopp_Producto: ['', Validators.required],
    });

    this.FormularioBOPP = this.FormBuilderBOPP.group({
      boppNombre : ['', Validators.required],
      boppSerial: ['', Validators.required],
      boppCantidad : ['', Validators.required],
      boppGenerico : [null, Validators.required],
      boppId : [null, Validators.required],
    });

    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
  }

  ngOnInit(): void {
    this.lecturaStorage();
    this.obtenerBOPP();
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  // funcion que limpiara los campos donde se selecciona en bopp
  limpiarCamposBOPP = () => this.FormularioBOPP.reset();

  //funcion qeu limpiará todos los campos
  limpiarTodosLosCampos(){
    this.FormAsignacionBopp.patchValue({
      AsgBopp_OT : '',
      AsgBopp_Ancho : 0,
      AsgBopp_Fecha : this.today,
      AsgBopp_Observacion: '',
      AsgBopp_Estado: '',
    });
    this.FormularioBOPP.reset();
    this.ArrayBoppPedida = [];
    this.ordenesTrabajo = [];
    this.cantidadKG = 0;
    this.arrayOT = [];
    this.load = true;
  }

  //Funcion que buscará y mostrará los BOPP existentes
  obtenerBOPP = () => this.boppService.GetBoppConExistencias().subscribe(datos => this.ArrayBOPP = datos);

  //funcion que buscará la informacion de una orden de trabajo
  infoOT(){
    let ordenTrabajo : string = this.FormAsignacionBopp.value.AsgBopp_OT;
    if (this.ordenesTrabajo.length == 0) {
      this.bagProService.srvObtenerListaClienteOT_Item(ordenTrabajo).subscribe(datos_OT => {
        for (const item of datos_OT) {
          this.arrayOT.push(ordenTrabajo);
          if (item.estado == null || item.estado == '' || item.estado == '0') {
            let adicional : number = item.datosotKg * 0.02;
            this.kgOT = item.datosotKg + adicional;
            const infoOT : any = {
              ot : item.item,
              cliente : item.clienteNom,
              micras : item.extCalibre,
              ancho : item.ptAnchopt,
              item : item.clienteItems,
              referencia : item.clienteItemsNom,
              kg : item.datosotKg,
              cantPedida : 0,
              und : item.ptPresentacionNom.trim(),
            }
            infoOT.und == 'Kilo' ? infoOT.cantPedida = item.datosotKg : infoOT.und == 'Unidad' ? infoOT.cantPedida = item.datoscantBolsa : infoOT.und == 'Paquete' ? item.datoscantBolsa : infoOT.cantPedida = item.datosotKg;
            infoOT.und == 'Kilo' ? infoOT.und = 'Kg' : infoOT.und == 'Unidad' ? infoOT.und = 'Und' : infoOT.und == 'Paquete' ? infoOT.und = 'Paquete' : infoOT.und = 'Kg';
            this.ordenesTrabajo.push(infoOT);
            this.FormAsignacionBopp.patchValue({ AsgBopp_OT : '', AsgBopp_Fecha : this.today, });
            this.cantidadKG = item.datosotKg + this.cantidadKG;
          } else if (item.estado == 4 || item.estado == 1) this.msj.mensajeAdvertencia(`Advertencia`, `No es posible asignar a la ${ordenTrabajo}, ya se encuentra cerrada!`);
        }
      });
    } else {
      if (!this.arrayOT.includes(ordenTrabajo)) {
        this.arrayOT.push(ordenTrabajo);
        this.bagProService.srvObtenerListaClienteOT_Item(ordenTrabajo).subscribe(datos_OT => {
          for (const itemOT of datos_OT) {
            if (itemOT.estado == null || itemOT.estado == '' || itemOT.estado == '0') {
              let adicional : number = itemOT.datosotKg * 0.02;
              this.kgOT = itemOT.datosotKg + adicional;
              const infoOT : any = {
                ot : itemOT.item,
                cliente : itemOT.clienteNom,
                micras : itemOT.extCalibre,
                ancho : itemOT.ptAnchopt,
                item : itemOT.clienteItems,
                referencia : itemOT.clienteItemsNom,
                kg : itemOT.datosotKg,
                cantPedida : itemOT.datosotKg,
                und : itemOT.ptPresentacionNom.trim(),
              }
              infoOT.und == 'Kilo' ? infoOT.cantPedida = itemOT.datosotKg : infoOT.und == 'Unidad' ? infoOT.cantPedida = itemOT.datoscantBolsa : infoOT.und == 'Paquete' ? infoOT.cantPedida = itemOT.datoscantBolsa : infoOT.cantPedida = itemOT.datosotKg;
              infoOT.und == 'Kilo' ? infoOT.und = 'Kg' : infoOT.und == 'Unidad' ? infoOT.und = 'Und' : infoOT.und == 'Paquete' ? infoOT.und = 'Paquete' : infoOT.und = 'Kg';
              this.ordenesTrabajo.push(infoOT);
              this.cantidadKG = itemOT.datosotKg + this.cantidadKG;
              this.FormAsignacionBopp.patchValue({ AsgBopp_OT : '', AsgBopp_Fecha : this.today, });
            } else if (itemOT.estado == 4 || itemOT.estado == 1) this.msj.mensajeAdvertencia(`¡Advertencia!`, `No es posible asignar a la ${ordenTrabajo}, ya se encuentra cerrada!`);
          }
        });
      } else this.msj.mensajeAdvertencia(`¡Advertencia!`, `¡La OT ${ordenTrabajo} ya se encuentra en la tabla!`);
    }
  }

  /** Función para mostrar una elección de eliminación de OT/Rollo de la tabla. */
  mostrarEleccion(item : any, eleccion : any, mensaje : any){
    if (eleccion == 'OT') this.itemSeleccionado = item; mensaje = `Está seguro que desea eliminar la OT ${item.ot} de la tabla?`;
    if (eleccion == 'Bopp') this.boppSeleccionado = item; mensaje = `Está seguro que desea eliminar el rollo ${item.Serial} de la tabla?`;
    this.messageService.add({severity:'warn', key: eleccion, summary: 'Elección', detail: mensaje, sticky: true});
  }

  // Función para quitar una Ot de la tabla
  QuitarOrdenTrabajo(data : any) {
    this.messageService.clear('OT');
    data = this.itemSeleccionado;
    this.cantidadKG = this.cantidadKG - data.kg;
    this.ordenesTrabajo.splice(this.ordenesTrabajo.findIndex((item) => item.ot == data.ot), 1);
    this.arrayOT.splice(this.arrayOT.findIndex((item) => item.ot == data.ot), 1);
    this.msj.mensajeConfirmacion(`Confirmación`, 'OT eliminada de la tabla!');
  }

  // funcion que buscará la informacion del rollo seleccionado
  BOPPSeleccionado(){
    let serial : any = this.FormularioBOPP.value.boppNombre;
    let nuevo : any [] = this.ArrayBOPP.filter((item) => item.bopP_Serial == serial);
    this.FormularioBOPP.patchValue({
      boppId: nuevo[0].bopP_Id,
      boppGenerico: nuevo[0].boppGen_Id,
      boppSerial: nuevo[0].bopP_Serial,
      boppNombre: nuevo[0].bopP_Nombre,
      boppCantidad: nuevo[0].bopP_Stock
    });
  }

  // funcion que quitará un rollo de la tabla
  quitarBOPP(data : any){
    this.messageService.clear('Bopp');
    data = this.boppSeleccionado;
    this.ArrayBoppPedida.splice(this.ArrayBoppPedida.findIndex((item) => item.Serial == data.Serial), 1);
    this.msj.mensajeConfirmacion(`Confirmación`, 'BOPP eliminado de la tabla!');
  }

  // funcion que validará que haya un rollo seleccionado para asignar
  validarCamposBOPP = () => this.FormularioBOPP.valid ? this.cargarBOPPTabla() : this.msj.mensajeAdvertencia('Advertencia', `Debe cargar al menos un rollo!`);

  //funcion que cargará la informacion de los rollos en la tabla
  cargarBOPPTabla(){
    if (this.ArrayBoppPedida.some(x => x.Serial == this.FormularioBOPP.value.boppSerial)) this.msj.mensajeAdvertencia(`Advertencia`, `El rollo ya se encuentra en la tabla!`);
    else {
      let info : any = {
        Id : this.FormularioBOPP.value.boppId,
        IdBoppGenerico : this.FormularioBOPP.value.boppGenerico,
        Serial : this.FormularioBOPP.value.boppSerial,
        Nombre : this.FormularioBOPP.value.boppNombre,
        Cantidad : this.FormularioBOPP.value.boppCantidad,
        Cantidad2 : this.FormularioBOPP.value.boppCantidad,
        Cantidad3 : this.FormularioBOPP.value.boppCantidad,
      }
      this.ArrayBoppPedida.push(info);
      setTimeout(() => this.FormularioBOPP.reset(), 1000); 
    }
  }

  // Funcion que va a contar la cantidad de kg que van a ser asignados
  calcularCantidadAsignar = () => this.ArrayBoppPedida.map(x => x.Cantidad2).reduce((a, b) => a + b, 0);

  // funcion que validará los campos para poder realizar la asignación
  validarAsignacion(){
    if (this.ordenesTrabajo.length > 0){
      if (this.ArrayBoppPedida.length > 0) this.asignarBOPP();
      else this.msj.mensajeAdvertencia(`Advertencia`, `Debe cargar minimo un rollo!`);
    } else this.msj.mensajeAdvertencia(`Advertencia`, `Debe cargar minimo una Orden de Trabajo!`);
  }

  // funcion que creará la asignacion de rollo
  asignarBOPP(){
    this.load = false;
    const datos : any = {
      AsigBOPP_FechaEntrega : this.today,
      AsigBOPP_Observacion : this.FormAsignacionBopp.value.AsgBopp_Observacion == null ? '' : (this.FormAsignacionBopp.value.AsgBopp_Observacion).toUpperCase(),
      Usua_Id : this.storage_Id,
      Estado_Id : 13,
      AsigBOPP_Hora : moment().format('H:mm:ss'),
    }
    this.asignacionBOPPService.srvGuardar(datos).subscribe(data => this.detallesAsginacionBOPP(data.asigBOPP_Id), () => this.msj.mensajeError(`Error`, `Se ha producido un error al momento de crear la asignación!`));
  }

  // funcion que creará los detalles de la asignacion de rollos
  detallesAsginacionBOPP(idAsignacion : any){
    this.idAsignacion = idAsignacion;
    let documento : string;
    for (let i = 0; i < this.ordenesTrabajo.length; i++) {
      for (let j = 0; j < this.ArrayBoppPedida.length; j++) {
        this.boppService.srvObtenerListaPorSerial(this.ArrayBoppPedida[j].Serial).subscribe(datos_bopp => {
          for (let k = 0; k < datos_bopp.length; k++) {
            if (datos_bopp[k].bopP_Serial == this.ArrayBoppPedida[j].Serial) {
              if (datos_bopp[k].catMP_Id == 6) documento = 'ASIGBOPP';
              else if (datos_bopp[k].catMP_Id == 14) documento = 'ASIGBOPA';
              else if (datos_bopp[k].catMP_Id == 15) documento = 'ASIGPOLY';
              let datos : any = {
                AsigBOPP_Id : idAsignacion,
                BOPP_Id : datos_bopp[k].bopP_Id,
                DtAsigBOPP_Cantidad : this.ArrayBoppPedida[j].Cantidad2 / this.ordenesTrabajo.length,
                UndMed_Id : 'Kg',
                Proceso_Id : 'CORTE',
                DtAsigBOPP_OrdenTrabajo : this.ordenesTrabajo[i].ot,
                Estado_OrdenTrabajo : 14,
                TpDoc_Id : documento,
              }
              this.detallesAsignacionBOPPService.srvGuardar(datos).subscribe(null, () => this.msj.mensajeError(`Error`, `Se ha producido un error al momento de crear la asignación del rollo!`));
            }
          }
        });
      }
    }
    setTimeout(() => {
      this.moverBopp();
      this.cargar_MovEntradasMP();
    }, 5000);
  }

  //funcion que va a mover el inventario de los rollos
  moverBopp(){
    for (let i = 0; i < this.ArrayBoppPedida.length; i++) {
      this.boppService.srvObtenerListaPorSerial(this.ArrayBoppPedida[i].Serial).subscribe(datos_bopp => {
        for (let j = 0; j < datos_bopp.length; j++) {
          let cantidad = datos_bopp[j].bopP_Stock - this.ArrayBoppPedida[i].Cantidad2;
          this.boppService.PutInventarioBiorientado(datos_bopp[j].bopP_Id, cantidad).subscribe(() => {
            this.obtenerBOPP();
            this.msj.mensajeConfirmacion(`Asignación exitosa`,`Se ha creado exitosamente la asignación de rollos!`);
            setTimeout(() => this.limpiarTodosLosCampos(), 2000);
          }, () => this.msj.mensajeError(`Error`, `Se ha producido un error al momento de mover el inventario del rollo ${this.ArrayBoppPedida[i].Nombre}!`));
        }
      });
    }
  }

  /** Cerrar Dialogo de eliminación de OT/rollos.*/
  onReject = (dato : any) => this.messageService.clear(dato);

  /** Función que mostrará un tutorial describiendo paso a paso cada funcionalidad de la aplicación */
  verTutorial() {
    this.shepherdService.defaultStepOptions = defaultStepOptions;
    this.shepherdService.modal = true;
    this.shepherdService.confirmCancel = false;
    this.shepherdService.addSteps(defaultSteps);
    this.shepherdService.start();
  } 

  //Función que actualizara la información de las entradas de materia prima disponibles.
  cargar_MovEntradasMP(){
    let salidaReal : number = 0;
    
    for (let index = 0; index < this.ArrayBoppPedida.length; index++) {
      this.ArrayBoppPedida[index].Cantidad3 = this.ArrayBoppPedida[index].Cantidad2;
      this.srvMovEntradasMP.GetInventarioxMaterial(this.ArrayBoppPedida[index].Id).subscribe(data => {
        if (data.length > 0) {
          for (let i = 0; i < data.length; i++) {
            let detalle : modeloMovimientos_Entradas_MP = {
              Id: data[i].id,
              MatPri_Id: data[i].matPri_Id,
              Tinta_Id: data[i].tinta_Id,
              Bopp_Id: data[i].bopp_Id,
              Cantidad_Entrada: data[i].cantidad_Entrada,
              UndMed_Id: data[i].undMed_Id,
              Precio_RealUnitario: data[i].precio_RealUnitario,
              Tipo_Entrada: data[i].tipo_Entrada,
              Codigo_Entrada: data[i].codigo_Entrada,
              Estado_Id: data[i].estado_Id,
              Cantidad_Asignada: data[i].cantidad_Asignada,
              Cantidad_Disponible: data[i].cantidad_Disponible,
              Observacion: data[i].observacion,
              Fecha_Entrada: data[i].fecha_Entrada,
              Hora_Entrada: data[i].hora_Entrada,
              Precio_EstandarUnitario: data[i].precio_EstandarUnitario
            }
            
            if(this.ArrayBoppPedida[index].Cantidad3 > detalle.Cantidad_Disponible){
              salidaReal = detalle.Cantidad_Disponible;
              this.ArrayBoppPedida[index].Cantidad3 -= salidaReal;
              detalle.Cantidad_Asignada += salidaReal;
              detalle.Cantidad_Disponible = 0;
              detalle.Estado_Id = 5;
            } else if(this.ArrayBoppPedida[index].Cantidad3 == detalle.Cantidad_Disponible) {
              salidaReal = this.ArrayBoppPedida[index].Cantidad3;
              detalle.Cantidad_Asignada += detalle.Cantidad_Disponible;
              detalle.Cantidad_Disponible = 0;
              detalle.Estado_Id = 5;
              this.ArrayBoppPedida[index].Cantidad3 = 0;
            } else if(this.ArrayBoppPedida[index].Cantidad3 < detalle.Cantidad_Disponible) {
              salidaReal = this.ArrayBoppPedida[index].Cantidad3;
              detalle.Cantidad_Asignada += this.ArrayBoppPedida[index].Cantidad3;
              detalle.Cantidad_Disponible -= this.ArrayBoppPedida[index].Cantidad3;
              detalle.Estado_Id = 19;
              this.ArrayBoppPedida[index].Cantidad3 = 0;
            }
            this.actualizar_MovEntradasMP(detalle);
            this.guardar_Salidas(detalle, salidaReal);
          }
        }
      }); 
    }  
  }

  //Función que actualizará la información de los movimientos de entrada de la materia prima.
  actualizar_MovEntradasMP(detalle : any){
    this.srvMovEntradasMP.Put(detalle.Id, detalle).subscribe(null, () => this.msj.mensajeError(`Error`, `No fue posible actualizar la información de la entrada de la materia prima, por favor verifique!`));
  }

  //Función que colocará la información de la salida de la materia prima en el array de salidas. 
  guardar_Salidas(info : any, salidaReal : number){
    if(this.ordenesTrabajo.length > 0) {
      for (let i = 0; i < this.ordenesTrabajo.length; i++) {
        let salidas : modelEntradas_Salidas_MP = {
          Id_Entrada: info.Id,
          Tipo_Salida: 'ASIGBOPP', 
          Codigo_Salida: this.idAsignacion, 
          Tipo_Entrada: info.Tipo_Entrada, 
          Codigo_Entrada: info.Codigo_Entrada,
          Fecha_Registro: this.today,
          Hora_Registro: this.hora,
          MatPri_Id: 84, 
          Tinta_Id: 2001,
          Bopp_Id: info.Bopp_Id,
          Cantidad_Salida: (salidaReal / this.ordenesTrabajo.length), 
          Orden_Trabajo: this.ordenesTrabajo[i].ot,
          Prod_Id : this.ordenesTrabajo[i].item,
          Cant_PedidaOT: this.ordenesTrabajo[i].cantPedida,
          UndMed_Id: this.ordenesTrabajo[i].und
        }
        this.srvMovSalidasMP.Post(salidas).subscribe(null, () => this.msj.mensajeError(`Error`, `No fue posible crear la salida de la BOPP, por favor verifique!`));
      }
    }
  }
}
