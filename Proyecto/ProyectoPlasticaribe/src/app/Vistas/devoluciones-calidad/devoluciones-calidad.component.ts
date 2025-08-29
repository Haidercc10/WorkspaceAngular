import { Component, Injectable } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ShepherdService } from 'angular-shepherd';
import { info } from 'console';
import moment from 'moment';
import pdfMake from 'pdfmake/build/pdfmake';
import { AppComponent } from 'src/app/app.component';
import { defaultStepOptions } from 'src/app/data';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';
import { modelDevoluciones_Calidad } from 'src/app/Modelo/modelDevoluciones_Calidad';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { EntradaBOPPService } from 'src/app/Servicios/BOPP/entrada-BOPP.service';
import { DetallesAsignacionService } from 'src/app/Servicios/DetallesAsgMateriaPrima/detallesAsignacion.service';
import { DevolucionesMPService } from 'src/app/Servicios/DetallesDevolucionMateriaPrima/devolucionesMP.service';
import { DevolucionesCalidadService } from 'src/app/Servicios/Devoluciones_Calidad/devoluciones-calidad.service';
import { DevolucionesService } from 'src/app/Servicios/DevolucionMateriaPrima/devoluciones.service';
import { EstadosProcesos_OTService } from 'src/app/Servicios/EstadosProcesosOT/EstadosProcesos_OT.service';
import { FallasTecnicasService } from 'src/app/Servicios/FallasTecnicas/FallasTecnicas.service';
import { MateriaPrimaService } from 'src/app/Servicios/MateriaPrima/materiaPrima.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { ProcesosService } from 'src/app/Servicios/Procesos/procesos.service';
import { RequerimientosCalidadService } from 'src/app/Servicios/Requerimientos_Calidad/requerimientos-calidad.service';
import { SedeClienteService } from 'src/app/Servicios/SedeCliente/sede-cliente.service';
import { TintasService } from 'src/app/Servicios/Tintas/tintas.service';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-devoluciones-calidad',
  templateUrl: './devoluciones-calidad.component.html',
  styleUrls: ['./devoluciones-calidad.component.css']
})
export class DevolucionesCalidadComponent {
  public infoOT !: FormGroup;
    load: boolean = true;
  
    /* Vaiables*/
    storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
    storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
    storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
    ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
    ArrayMateriaPrima = []; //Variable quetendrá la información de la materia prima que se asignó en la ot consultada
    ArrayMateriaPrima2 = [];
    totalMPEntregada : number = 0; //Variable que servirá pra almacenar el total de materia prima que se entregó en una OT
    ValorMPEntregada : number = 0; //Variable que almacenará el valor total de la materia entregada a una OT
    ArrayProcesos = []; //Variable que almacenará la informacion de la cantidad en kg que se hizo en cada proceso
    cantidadTotalExt : number = 0; //Variable que va a almacenar el total de la cantidad extruida en una OT
    cantidadTotalImp : number = 0; //Variable que va a almacenar el total de la cantidad impresa en una OT
    cantidadTotalDbl : number = 0; //Variable que va a almacenar el total de la cantidad doblada en una OT
    cantidadTotalRot : number = 0; //Variable que va a almacenar el total de la cantidad Rotograbado en una OT
    cantidadTotalSella : number = 0; //Variable que va a almacenar el total de la cantidad sellada en una OT
    cantidadTotalEmpaque : number = 0; //Variable que va a almacenar el total de la cantidad empacada en una OT
    cantidadTotalCorte : number = 0; //Variable que va a almacenar el total de la cantidad cortada en una OT
    cantidadTotalLaminado : number = 0; //Variable que va a almacenar el total de la cantidad cantidad Total Laminado en una OT
    cantidadTotalWiketiado : number = 0; //Variable que va a almacenar el total de la cantidad cantidad Tota wiketeada en una OT
    valorFinalOT : number = 0; // Variable que almacenará el valor final que tendrá la ot consultada
    diferencia : number = 0; //Variable que servirá para almacenar la diferencia de el valor final de la ot y el valor estimado o inicial
    diferenciaPorcentaje : number = 0; //Variable que servirá para almacenar la diferencia en porcentaje de el valor final de la ot y el valor estimado o inicial
    cantidadSellandoUnidad : number = 0; //Varibale que calculará la cantidad total de unidades selladas, esto se en caso de que la presentación del producto sea en unidad
    cantidadWiketiadoUnidad : number = 0; //Varibale que calculará la cantidad total de unidades en wiketiado, esto se en caso de que la presentación del producto sea en unidad
    cantidadEmpaqueUnidad : number = 0; //Varibale que calculará la cantidad total de unidades en empaque, esto se en caso de que la presentación del producto sea en unidad
    estados = []; //Variable que va a almacenar los estados que tendrá la orden de trabajo
    sumaValorExtruido : number = 0; //Variable que servirá para mostrar el valor total de la materia prima que se utulizó en extrusion
    sumaValorImpresion : number = 0; //Variable que servirá para mostrar el valor total de materia prima utilizada en impresión
    sumaValorRotograbado : number = 0; //Variable que servirá para mostrar el valor total de la materia prima utilizada en rotograbado
    devolucion : number = 0; //Varibale que almacenará la cantidad de materia prima que fue devuelta en una OT
    modeModal : boolean = false;
  
    // Variables globlales que almacenarán la informacion general de la orden de trabajo que se mostrará en el PDF
    ordenTrabajo : number = 0;
    NombreCliente : string;
    idProducto : number;
    nombreProducto : string;
    cantProdSinMargenUnd : number;
    cantProdSinMargenKg : number;
    CantidadMargen : number;
    cantProdConMargenKg : number;
    presentacionProducto : string;
    valorUnitarioProdUnd : number;
    valorUnitarioProdKg : number;
    valorEstimadoOT : number;
    fechaOT : any;
    fechaFinalOT : any;
    usuarioCreador : any;
    estado : any;
    arrayEstados : any = [];
    modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro

    //Nuevos
    fails : any = [];
    process : any = [];
    types : any = ['EXTERNO', 'INTERNO'];
    requirements : any = [];
    devolutions : any = [];
    orderProduction : any = [];
    modalFails = false;
    modalReqs = false;
  
    constructor(private frmBuilderMateriaPrima : FormBuilder,
                  private bagProServices : BagproService,
                    private AppComponent : AppComponent,
                      private detallesAsignacionService : DetallesAsignacionService,
                        private materiaPrimaService : MateriaPrimaService,
                          private devolucionesService : DevolucionesService,
                            private devolucionesMPService : DevolucionesMPService,
                              private boppService : EntradaBOPPService,
                                private tintaService : TintasService,
                                  private estadosProcesos_OTService : EstadosProcesos_OTService,
                                      private shepherdService: ShepherdService,
                                        private msj : MensajesAplicacionService, 
                                          private svFails : FallasTecnicasService, 
                                            private svProcess : ProcesosService, 
                                              private svRequirements : RequerimientosCalidadService,
                                                private svSedes : SedeClienteService,
                                                  private svDevolutions : DevolucionesCalidadService,) {
      this.modoSeleccionado = this.AppComponent.temaSeleccionado;
      this.infoOT = this.frmBuilderMateriaPrima.group({
        ot :[null,Validators.required],
        fail : [null, Validators.required],
        process : [null, Validators.required],
        type : [null, Validators.required],
        requirement : [null, Validators.required],
        weightNet : [null, Validators.required],
        subtotal : [0, Validators.required],
        observation : [null, Validators.required],
        date : [null, Validators.required],
      });
    }
  
    ngOnInit() {
      this.lecturaStorage();
      this.getFails();
      this.getProcess();
      this.getRequirements();
      this.loadDate();
      setInterval(() => this.modoSeleccionado = this.AppComponent.temaSeleccionado, 1000);
    }
  
    tutorial(){
    }
  
    limpiarCampos(){
      this.infoOT.reset();
      this.cantidadTotalExt = 0;
      this.cantidadTotalImp = 0;
      this.cantidadTotalDbl = 0;
      this.cantidadTotalRot = 0;
      this.cantidadTotalEmpaque = 0;
      this.cantidadTotalCorte = 0;
      this.cantidadTotalLaminado = 0;
      this.cantidadTotalSella = 0;
      this.cantidadTotalWiketiado = 0;
      this.ArrayProcesos = [];
      this.valorFinalOT = 0;
      this.ArrayMateriaPrima = [];
      this.totalMPEntregada = 0;
      this.ValorMPEntregada = 0;
      this.diferencia = 0;
      this.diferenciaPorcentaje = 0;
      this.ordenTrabajo = 0;
      this.NombreCliente = '';
      this.idProducto = 0;
      this.nombreProducto = '';
      this.cantProdSinMargenUnd = 0;
      this.cantProdSinMargenKg = 0;
      this.CantidadMargen = 0;
      this.cantProdConMargenKg = 0;
      this.presentacionProducto = '';
      this.valorUnitarioProdUnd = 0;
      this.valorUnitarioProdKg = 0;
      this.valorEstimadoOT = 0;
    }
  
    //Funcion que leerá la informacion que se almacenará en el storage del navegador
    lecturaStorage(){
      this.storage_Id = this.AppComponent.storage_Id;
      this.storage_Nombre = this.AppComponent.storage_Nombre;
      this.ValidarRol = this.AppComponent.storage_Rol;
    }

    //
    getFails = () =>  this.svFails.srvObtenerLista().subscribe(datos => { this.fails = datos.filter((item) => [14].includes(item.tipoFalla_Id)) });
    
    //
    getProcess = () => this.svProcess.srvObtenerLista().subscribe(data => this.process = data);

    //
    getRequirements = () => this.svRequirements.getAll().subscribe(data => this.requirements = data);
  
    // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
    formatonumeros = (number) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g,'$1,');
  
    //Funcion que consultará la OT que le sea pasada y mostrará la información general de dicha Orden de Trabajo
    consultaOTBagPro(){
      let ot : number = this.infoOT.value.ot;
      this.load = false;
      this.bagProServices.srvObtenerListaClienteOT_ItemCostos(ot).subscribe(datos_OT => {
        if (datos_OT) {
          if(datos_OT.length == 0) {
            this.msj.mensajeAdvertencia(`Advertencia`, `No se encuentran registros de la OT ${ot}`); 
            this.clearFields();
          } else this.loadData(datos_OT)
        } else this.loadData(datos_OT);
      });
    }

    loadData(data : any){
      for (const item of data) {
        this.estadosProcesos_OTService.consultaPorOT(item.item).subscribe(dataEPOT => {
          this.svSedes.GetSedeClientexNitBagPro(item.nitCliente).subscribe(info => {
            if(info) {
              if(info.length > 0) this.loadInfoTableOT(item, info, dataEPOT);
              else this.warningMsg(`No se encontró el nit del cliente ${item.clienteNom}, verifique!`); 
            } else this.warningMsg(`No se encontró el ID del cliente ${item.clienteNom}, verifique!`);
          }, error => {
            this.msj.mensajeError(error)
            this.load = true;
          });
        });
      }
    }

    warningMsg(msj : string){
      this.msj.mensajeAdvertencia(`Advertencia`, msj);
      this.load = true;
    }
  
    /// Funcion en la que se consultaran los procesos de por los que ha pasado la orden de trabajo y calculará el total de kg o unidades que se hizo en cada uno
    consultaProceso(ot : number){
      this.valorFinalOT = 0;
      this.diferencia = 0;
      this.diferenciaPorcentaje = 0;
  
      this.bagProServices.srvObtenerListaProcExtOt(ot).subscribe(datos_procesos => {
        this.cantidadTotalExt = datos_procesos.filter(item => item.proceso == 'EXTRUSION').reduce((a,b) => a + b.total, 0);
        this.cantidadTotalImp = datos_procesos.filter(item => item.proceso == 'IMPRESION').reduce((a,b) => a + b.total, 0);
        this.cantidadTotalDbl = datos_procesos.filter(item => item.proceso == 'DOBLADO').reduce((a,b) => a + b.total, 0);
        this.cantidadTotalRot = datos_procesos.filter(item => item.proceso == 'ROTOGRABADO').reduce((a,b) => a + b.total, 0);
        this.cantidadTotalEmpaque = datos_procesos.filter(item => item.proceso == 'EMPAQUE').reduce((a,b) => a + b.total, 0);
        this.cantidadTotalCorte = datos_procesos.filter(item => item.proceso == 'CORTE').reduce((a,b) => a + b.total, 0);
        this.cantidadTotalLaminado = datos_procesos.filter(item => item.proceso == 'LAMINADO').reduce((a,b) => a + b.total, 0);
        
        //SELLADO Y WIKETIADO
        this.bagProServices.srvObtenerListaProcSelladoOT(ot).subscribe(datos_selado => {
          this.cantidadTotalSella = datos_selado.filter(item => item.proceso == 'SELLADO').reduce((a,b) => a + b.totalPeso, 0);
          this.cantidadSellandoUnidad = datos_selado.filter(item => item.proceso == 'SELLADO').reduce((a,b) => a + b.totalUnd, 0);        
          this.cantidadTotalWiketiado = datos_selado.filter(item => item.proceso == 'Wiketiado').reduce((a,b) => a + b.totalPeso, 0);
          this.cantidadWiketiadoUnidad = datos_selado.filter(item => item.proceso == 'Wiketiado').reduce((a,b) => a + b.totalUnd, 0);
          this.cantidadPorcPerdidaProcesoaProceso(ot);
        });
      });
    }
  
    ///Funcion que calcula y guarda la cantidad de perdida que hubo de un proceso a otro
    cantidadPorcPerdidaProcesoaProceso(ot : any){
      this.ArrayProcesos = [];
      this.valorFinalOT = 0;
      this.diferencia = 0;
      this.diferenciaPorcentaje = 0;
      const cant : any = {
        Ot : ot,
        Ext : this.cantidadTotalExt,
        Imp : this.cantidadTotalImp,
        Rot : this.cantidadTotalRot,
        Dbld : this.cantidadTotalDbl,
        Lam : this.cantidadTotalLaminado,
        Emp : this.cantidadTotalEmpaque,
        Corte : this.cantidadTotalCorte,
        Sel : `${this.formatonumeros(Math.round(this.cantidadTotalSella))} KG - ${this.formatonumeros(Math.round(this.cantidadSellandoUnidad))} Und`,
        Wik : `${this.formatonumeros(Math.round(this.cantidadTotalWiketiado))} KG - ${this.formatonumeros(Math.round(this.cantidadWiketiadoUnidad))} Und`,
      }
      this.ArrayProcesos.push(cant);
      for (const item of this.ArrayProcesos) {
        let Sellado = this.cantidadTotalSella;
        let wiketiado = this.cantidadTotalWiketiado;
  
        if (Sellado == 0 && item.Emp != 0 && wiketiado == 0) {
          this.bagProServices.srvObtenerListaProcExtOt_fechaFinal(ot).subscribe(datos_extrusion => {
            this.fechaFinalOT = datos_extrusion.fecha.replace('T00:00:00', '');
            this.infoOT.patchValue({ ot : ot, fechaFinOT : this.fechaFinalOT, });
          });
          if (this.presentacionProducto == 'Kilo') this.valorFinalOT = item.Emp * this.valorUnitarioProdKg;
          else if (this.presentacionProducto == 'Unidad' || this.presentacionProducto == 'Rollo' || this.presentacionProducto == 'Paquete') this.valorFinalOT = item.Emp * this.valorUnitarioProdUnd;
        } else if (Sellado != 0 && item.Emp == 0 && wiketiado == 0) {
          this.bagProServices.srvObtenerListaProcSelladoOT_FechaFinal(ot).subscribe(datos_sellado => {
            this.fechaFinalOT = datos_sellado.fechaEntrada.replace('T00:00:00', '');
            this.infoOT.patchValue({ ot : ot, fechaFinOT : this.fechaFinalOT, });
          });
          if (this.presentacionProducto == 'Kilo') this.valorFinalOT = Sellado * this.valorUnitarioProdKg;
          else if (this.presentacionProducto == 'Unidad' || this.presentacionProducto == 'Rollo'|| this.presentacionProducto == 'Paquete') this.valorFinalOT = this.cantidadSellandoUnidad * this.valorUnitarioProdUnd;
        } else if (Sellado == 0 && item.Emp == 0 && wiketiado != 0) {
          this.bagProServices.srvObtenerListaProcSelladoOT_FechaFinal(ot).subscribe(datos_sellado => {
            this.fechaFinalOT = datos_sellado.fechaEntrada.replace('T00:00:00', '');
            this.infoOT.patchValue({ ot : ot, fechaFinOT : this.fechaFinalOT, });
          });
          if (this.presentacionProducto == 'Kilo') this.valorFinalOT = wiketiado * this.valorUnitarioProdKg;
          else if (this.presentacionProducto == 'Unidad' || this.presentacionProducto == 'Rollo'|| this.presentacionProducto == 'Paquete') this.valorFinalOT = this.cantidadWiketiadoUnidad * this.valorUnitarioProdUnd;
        } else if (Sellado != 0 && item.Emp == 0 && wiketiado != 0) {
          this.bagProServices.srvObtenerListaProcSelladoOT_FechaFinal(ot).subscribe(datos_sellado => {
            this.fechaFinalOT = datos_sellado.fechaEntrada.replace('T00:00:00', '');
            this.infoOT.patchValue({ ot : ot, fechaFinOT : this.fechaFinalOT, });
          });
          if (this.presentacionProducto == 'Kilo') this.valorFinalOT = (wiketiado * this.valorUnitarioProdKg) + (Sellado * this.valorUnitarioProdKg);
          else if (this.presentacionProducto == 'Unidad' || this.presentacionProducto == 'Rollo'|| this.presentacionProducto == 'Paquete') this.valorFinalOT = (this.cantidadWiketiadoUnidad * this.valorUnitarioProdUnd) + (this.cantidadSellandoUnidad * this.valorUnitarioProdUnd);
        }
      }
      this.diferencia = this.valorFinalOT - this.ValorMPEntregada;
      this.diferenciaPorcentaje = (this.diferencia / this.valorFinalOT) * 100;
      this.load = true;
    }
  
    /// Funcion para llenar la tabla con la materia prima asignada para la OT consultada
    llenarTablaMPAsignada(formulario : any){
      const infoDoc : any = {
        Id : formulario.materiaPrima,
        Nombre : formulario.nombreMP,
        Cantidad : formulario.cantMP,
        Presentacion : formulario.undMedida,
        PrecioUnd : this.formatonumeros(formulario.precio),
        SubTotal : this.formatonumeros(Math.round(formulario.subTotal)),
        Proceso : formulario.nombreProceso,
      }
  
      this.totalMPEntregada += infoDoc.Cantidad;
      this.ValorMPEntregada += (formulario.subTotal);
      this.ArrayMateriaPrima.push(infoDoc);
      this.ArrayMateriaPrima.sort((a,b) => a.Nombre.localeCompare(b.Nombre));
      this.ArrayMateriaPrima.sort((a,b) => a.Proceso.localeCompare(b.Proceso));
      this.load = true;
    }
  
    /// Funcion para llenar la tabla con la materia prima devuelta para la OT consultada
    llenarTablaMPDevuelta(formulario : any){
      if (formulario.matPri_Id != 84 && formulario.tinta_Id == 2001 && formulario.bopP_Id == 449) {
        this.materiaPrimaService.srvObtenerListaPorId(formulario.matPri_Id).subscribe(datos_materiaPrima => {
          const infoDoc : any = {
            Id : datos_materiaPrima.matPri_Id,
            Nombre : datos_materiaPrima.matPri_Nombre,
            Cantidad : formulario.dtDevMatPri_CantidadDevuelta,
            Presentacion : datos_materiaPrima.undMed_Id,
            PrecioUnd : this.formatonumeros(datos_materiaPrima.matPri_Precio),
            SubTotal : this.formatonumeros(Math.round(formulario.dtDevMatPri_CantidadDevuelta * datos_materiaPrima.matPri_Precio)),
            Proceso : 'Devolución',
          }
          this.totalMPEntregada -= infoDoc.Cantidad;
          this.ValorMPEntregada -= (formulario.dtDevMatPri_CantidadDevuelta * datos_materiaPrima.matPri_Precio);
          this.ArrayMateriaPrima.push(infoDoc);
          this.ArrayMateriaPrima.sort((a,b) => a.Nombre.localeCompare(b.Nombre));
          this.ArrayMateriaPrima.sort((a,b) => a.Proceso.localeCompare(b.Proceso));
        });
      } else if (formulario.matPri_Id == 84 && formulario.tinta_Id != 2001 && formulario.bopP_Id == 449) {
        this.tintaService.srvObtenerListaPorId(formulario.tinta_Id).subscribe(datos_tinta => {
          const infoDoc : any = {
            Id : datos_tinta.tinta_Id,
            Nombre : datos_tinta.tinta_Nombre,
            Cantidad : formulario.dtDevMatPri_CantidadDevuelta,
            Presentacion : datos_tinta.undMed_Id,
            PrecioUnd : this.formatonumeros(datos_tinta.tinta_Precio),
            SubTotal : this.formatonumeros(Math.round(formulario.dtDevMatPri_CantidadDevuelta * datos_tinta.tinta_Precio)),
            Proceso : 'Devolución',
          }
          this.totalMPEntregada -= infoDoc.Cantidad;
          this.ValorMPEntregada -= (formulario.dtDevMatPri_CantidadDevuelta * datos_tinta.tinta_Precio);
          this.ArrayMateriaPrima.push(infoDoc);
          this.ArrayMateriaPrima.sort((a,b) => a.Nombre.localeCompare(b.Nombre));
          this.ArrayMateriaPrima.sort((a,b) => a.Proceso.localeCompare(b.Proceso));
        });
      } else if (formulario.matPri_Id == 84 && formulario.tinta_Id == 2001 && formulario.bopP_Id != 449) {
        this.boppService.srvObtenerListaPorId(formulario.bopP_Id).subscribe(datos => {
          let datos_bopp : any = [datos];
          for (let i = 0; i < datos_bopp.length; i++) {
            const infoDoc : any = {
              Id : datos_bopp[i].bopP_Id,
              Nombre : datos_bopp[i].bopP_Nombre,
              Cantidad : formulario.dtDevMatPri_CantidadDevuelta,
              Presentacion : datos_bopp[i].undMed_Id,
              PrecioUnd : this.formatonumeros(datos_bopp[i].bopP_Precio),
              SubTotal : this.formatonumeros(Math.round(formulario.dtDevMatPri_CantidadDevuelta * datos_bopp[i].bopP_Precio)),
              Proceso : 'Devolución',
            }
            this.totalMPEntregada -= infoDoc.Cantidad;
            this.ValorMPEntregada -= (formulario.dtDevMatPri_CantidadDevuelta * datos_bopp[i].bopP_Precio);
            this.ArrayMateriaPrima.push(infoDoc);
            this.ArrayMateriaPrima.sort((a,b) => a.Nombre.localeCompare(b.Nombre));
            this.ArrayMateriaPrima.sort((a,b) => a.Proceso.localeCompare(b.Proceso));
          }
        });
      }
      this.load = true;
    }
  
    calcSubtotal() {
      let priceKg : number =  this.orderProduction[0].priceKg;
      let qtyKg : number =  (this.infoOT.value.weightNet) ? (this.infoOT.value.weightNet) : 0;
      this.infoOT.patchValue({ 'subtotal' : (priceKg * qtyKg) });
    }

    clearFields(){
      this.infoOT.reset();
      this.orderProduction = [];
      this.loadDate();
      this.load = true;
    }

    clearAll(){
      this.infoOT.reset();
      this.loadDate();
      this.devolutions = [];
      this.orderProduction = [];
      this.load = true;
    }

    loadInfoTableOT(data : any, sede : any, dataEPOT : any){
      this.orderProduction = [];
      let ot : number = this.infoOT.value.ot;
      let porcentajeMargen = (data.datosmargenKg / data.datosotKg) * 100;
      let initDate : any = dataEPOT ? dataEPOT.length > 0 ? dataEPOT[0].estProcOT_FechaInicio == null ? dataEPOT[0].estProcOT_FechaCreacion.replace('T00:00:00', '') : dataEPOT[0].estProcOT_FechaInicio.replace('T00:00:00', '') : data.fechaCrea : data.fechaCrea;
      let endDate : any = dataEPOT ? dataEPOT.length > 0 ? dataEPOT[0].estProcOT_FechaFinal == null ? dataEPOT[0].estProcOT_FechaCreacion.replace('T00:00:00', '') : dataEPOT[0].estProcOT_FechaFinal.replace('T00:00:00', '') : data.fechaCrea : data.fechaCrea;
      
      this.orderProduction.push({
        'ot' : ot,
        'client' : data.clienteNom,
        'clientId' : sede[0].id_Cliente,
        'item' : data.clienteItems, 
        'reference' : data.clienteItemsNom,
        'presentation' : data.ptPresentacionNom,
        'qtyUnd' : data.datoscantBolsa,
        'qtyKg' : (data.datosotKg - ((data.datosotKg * porcentajeMargen) / 100)).toFixed(2),
        'percentageMargin' : porcentajeMargen.toFixed(2) + "%",
        'marginKg' : data.datosotKg,
        'priceUnd' : data.datosvalorBolsa,
        'priceKg' :  data.datosValorKg, 
        'totalPrice' : data.datosvalorOt,
        'initDate' : initDate, 
        'endDate' : endDate,
      });
      this.msj.mensajeConfirmacion(`Orden de trabajo N° ${this.orderProduction[0].ot} encontrada!`);
      this.load = true;
    }

    //
    loadDevolutionInTable(){
      if(this.infoOT.valid) {
        if(this.validateOrderProduction()) {
          this.load = false;
          this.devolutions.push({
            'ot' : this.orderProduction[0].ot,
            'client' : this.orderProduction[0].client,
            'clientId' : this.orderProduction[0].clientId,
            'item' : this.orderProduction[0].item, 
            'reference' : this.orderProduction[0].reference,
            'fail' :  this.infoOT.value.fail,
            'failName' : this.fails.filter(x => x.falla_Id == this.infoOT.value.fail)[0].falla_Nombre,
            'process' :  this.infoOT.value.process,
            'processName' :  this.process.filter(x => x.proceso_Id == this.infoOT.value.process)[0].proceso_Nombre,
            'typeRejected' :  this.infoOT.value.type,
            'req' :  this.infoOT.value.requirement, 
            'reqName' : this.requirements.filter(x => x.req_Id == this.infoOT.value.requirement)[0].req_Nombre,
            'weight' : this.infoOT.value.weightNet, 
            'weightNet' : this.infoOT.value.weightNet,  
            'price' : this.orderProduction[0].priceKg, 
            'subtotal' : this.infoOT.value.subtotal, 
            'date' : moment(this.infoOT.value.date).format('YYYY-MM-DD'),
            'dateProduction' : this.orderProduction[0].initDate,
            'observation' : this.infoOT.value.observation,
          });
          setTimeout(() => {
            this.msj.mensajeConfirmacion(`OT N° ${this.orderProduction[0].ot} agregada exitosamente!`);
            this.clearFields(); 
          }, 500);
        } else this.msj.mensajeAdvertencia('Advertencia', 'Las ordenes de trabajo no coinciden, verifique!');
      } else this.msj.mensajeAdvertencia('Advertencia', 'Debe llenar todos los campos para continuar!');
    }

    loadDate = () => this.infoOT.patchValue({ 'date' : new Date() });

    totalKg = () => this.devolutions.reduce((a,b) => a += b.weight, 0);

    totalPrice = () => this.devolutions.reduce((a,b) => a += b.subtotal, 0);

    validateOrderProduction(){
      let otForm : number = this.infoOT.value.ot;
      let otTable : number = this.orderProduction[0].ot;
      if(otForm == otTable) {
        return true;
      }
      return false;
    }

    createRegisters(){
      let count : number = 0;
      let arrayLength : number = this.devolutions.length;
      this.load = false;

      this.devolutions.forEach(x => {
        let info : modelDevoluciones_Calidad = {
          'Dvc_Fecha': moment(x.date).format('YYYY-MM-DD'),
          'Dvc_Ano': parseInt(moment().format('YYYY')),
          'Dvc_Mes': moment(x.date).format('MMMM').toUpperCase(),
          'Dvc_OT': x.ot,
          'Cli_Id': x.clientId,
          'Prod_Id': x.item,
          'Falla_Id': x.fail,
          'Proceso_Id': x.process,
          'Req_Id': x.req,
          'Dvc_TipoRechazo': x.typeRejected,
          'Dvc_PesoBruto': x.weightNet,
          'Dvc_PesoNeto': x.weightNet,
          'Dvc_Precio': x.price,
          'Dvc_Subtotal': x.subtotal.toFixed(2),
          'Dvc_FechaProduccion': moment(x.initDate).format('YYYY-MM-DD'),
          'Dvc_FechaRegistro': moment().format('YYYY-MM-DD'),
          'Dvc_Hora': moment().format('HH:mm:ss'),
          'Dvc_Observacion': x.observation
        }
        this.svDevolutions.Post(info).subscribe(data => {
          count++
          if(count == arrayLength) {
            this.msj.mensajeConfirmacion('Registro creado exitosamente!');
            this.clearAll();
          }
        }, error => {
          this.msj.mensajeError('Error', error);
          this.load = true;
        });
      });
    }

    //*
    quitRoll(data : any){
      this.load = false; 
      let index : any = this.devolutions.findIndex(x => x.ot == data.ot);
      this.msj.mensajeAdvertencia(`Advertencia`, `Se ha quitado la OT N° ${data.ot} de la tabla.`);
      this.devolutions.splice(index, 1);
      setTimeout(() => { this.load = true; }, 1000);
    }
}
