import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShepherdService } from 'angular-shepherd';
import moment from 'moment';
import pdfMake from 'pdfmake/build/pdfmake';
import { EntradaBOPPService } from 'src/app/Servicios/BOPP/entrada-BOPP.service';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { DetallesAsignacionService } from 'src/app/Servicios/DetallesAsgMateriaPrima/detallesAsignacion.service';
import { DevolucionesMPService } from 'src/app/Servicios/DetallesDevolucionMateriaPrima/devolucionesMP.service';
import { DevolucionesService } from 'src/app/Servicios/DevolucionMateriaPrima/devoluciones.service';
import { EstadosProcesos_OTService } from 'src/app/Servicios/EstadosProcesosOT/EstadosProcesos_OT.service';
import { MateriaPrimaService } from 'src/app/Servicios/MateriaPrima/materiaPrima.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { TintasService } from 'src/app/Servicios/Tintas/tintas.service';
import { AppComponent } from 'src/app/app.component';
import { defaultStepOptions, stepsReporteCostos as defaultSteps } from 'src/app/data';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';

@Component({
  selector: 'app-reporteCostosOT',
  templateUrl: './reporteCostosOT.component.html',
  styleUrls: ['./reporteCostosOT.component.css']
})
export class ReporteCostosOTComponent implements OnInit {

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
                                      private msj : MensajesAplicacionService) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
    this.infoOT = this.frmBuilderMateriaPrima.group({
      ot : ['',Validators.required],
      cliente : ['',Validators.required],
      IdProducto : ['',Validators.required],
      NombreProducto : ['', Validators.required],
      cantProductoSinMargenUnd : ['', Validators.required],
      cantProductoSinMargenKg : ['', Validators.required],
      margenAdicional : ['', Validators.required],
      cantProductoConMargen : ['', Validators.required],
      PresentacionProducto : ['', Validators.required],
      ValorUnidadProductoUnd : ['', Validators.required],
      ValorUnidadProductoKg : ['', Validators.required],
      ValorEstimadoOt : ['', Validators.required],
      fechaInicioOT : ['', Validators.required],
      fechaFinOT : ['', Validators.required],
      estadoOT : ['', Validators.required],
    });
  }

  ngOnInit() {
    this.lecturaStorage();
    this.cargarEstados();
    this.inhabilitarCampos();
  }

  tutorial(){
    this.shepherdService.defaultStepOptions = defaultStepOptions;
    this.shepherdService.modal = true;
    this.shepherdService.confirmCancel = false;
    this.shepherdService.addSteps(defaultSteps);
    this.shepherdService.start();
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

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g,'$1,');

  //Funcion que consultará la OT que le sea pasada y mostrará la información general de dicha Orden de Trabajo
  consultaOTBagPro(){
    let ot : number = this.infoOT.value.ot;
    this.limpiarCampos();
    this.bagProServices.srvObtenerListaClienteOT_ItemCostos(ot).subscribe(datos_OT => {
      if (datos_OT.length == 0) this.msj.mensajeAdvertencia(`Advertencia`, `No se encuentran registros de la OT ${ot}`);
      else {
        for (const item of datos_OT) {
          let porcentajeMargen = (item.datosmargenKg / item.datosotKg) * 100;

          this.ordenTrabajo = ot;
          this.NombreCliente = item.clienteNom;
          this.idProducto = item.clienteItems;
          this.nombreProducto = item.clienteItemsNom;
          this.cantProdSinMargenUnd = item.datoscantBolsa;
          this.cantProdSinMargenKg = (item.datosotKg - ((item.datosotKg * porcentajeMargen) / 100));
          this.CantidadMargen = Math.round(porcentajeMargen);
          this.cantProdConMargenKg = item.datosotKg;
          this.presentacionProducto = item.ptPresentacionNom;
          this.valorUnitarioProdUnd = item.datosvalorBolsa;
          this.valorUnitarioProdKg = item.datosValorKg;
          this.valorEstimadoOT = Math.round(item.datosvalorOt);
          this.fechaOT = item.fechaCrea.replace('T00:00:00', '');
          this.usuarioCreador = item.usrCrea;
          if (item.estado == null || item.estado == '' || item.estado == '0') this.estado = '0';
          else if (item.estado == 4) this.estado = '4';
          else if (item.estado == 1) this.estado = '1';

          console.log(this.estado)

          this.infoOT.patchValue({
            ot : ot,
            cliente : item.clienteNom,
            IdProducto : item.clienteItems,
            NombreProducto : item.clienteItemsNom,
            cantProductoSinMargenUnd : this.formatonumeros(item.datoscantBolsa),
            cantProductoSinMargenKg : this.formatonumeros((item.datosotKg - ((item.datosotKg * porcentajeMargen) / 100)).toFixed(2)),
            margenAdicional : this.formatonumeros(porcentajeMargen.toFixed(2)) + "%",
            cantProductoConMargen : this.formatonumeros(item.datosotKg),
            PresentacionProducto : item.ptPresentacionNom,
            ValorUnidadProductoUnd : this.formatonumeros(item.datosvalorBolsa),
            ValorUnidadProductoKg : this.formatonumeros(item.datosValorKg),
            ValorEstimadoOt : this.formatonumeros(item.datosvalorOt),
            fechaInicioOT : this.fechaOT,
            fechaFinOT : '',
            estadoOT : this.estado,
          });

          this.devolucionesService.srvObtenerListaPorOT(ot).subscribe(datos_devoluciones => {
            for (let i = 0; i < datos_devoluciones.length; i++) {
              this.devolucionesMPService.srvObtenerListaPorDevId(datos_devoluciones[i].devMatPri_Id).subscribe(datos_devolucionesMP => {
                for (let j = 0; j < datos_devolucionesMP.length; j++) {
                  this.devolucion = datos_devolucionesMP[j].dtDevMatPri_CantidadDevuelta;
                  this.llenarTablaMP(datos_devolucionesMP[j]);
                }
              });
            }
          });
          this.detallesAsignacionService.srvObtenerListaPorAsignacionesOT(ot).subscribe(datos_asignacionMP => {
            if (datos_asignacionMP.length != 0){
              for (let j = 0; j < datos_asignacionMP.length; j++) {
                this.llenarTablaMP(datos_asignacionMP[j]);
              }
            }
          });
        }
        this.consultaProceso(ot);
      }
    });
  }

  // Funcion en la que se consultaran los procesos de por los que ha pasado la orden de trabajo y calculará el total de kg o unidades que se hizo en cada uno
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

  //Funcion que calcula y guarda la cantidad de perdida que hubo de un proceso a otro
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

  // Funcion para llenar la tabla con la materia prima que se ha pedido para la OT consultada
  llenarTablaMP(formulario : any){
    if (this.devolucion != 0) {
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
    } else {
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
  }

  // funcion que se encagará de llenar la tabla de los productos en el pdf
  buildTableBody(data, columns) {
    var body = [];
    body.push(columns);
    data.forEach((row) => {
      var dataRow = [];
      columns.forEach((column) => dataRow.push(row[column].toString()));
      body.push(dataRow);
    });
    return body;
  }

  // Funcion que genera la tabla donde se mostrará la información de los productos pedidos
  table(data, columns) {
    return {
      table: {
        headerRows: 1,
        widths: [30, 200, 50, 55, 60, 60, 60],
        body: this.buildTableBody(data, columns),
      },
      fontSize: 8,
      layout: {
        fillColor: (rowIndex, node, columnIndex) => (rowIndex == 0) ? '#CCCCCC' : null
      }
    };
  }

  // Funcion que se encargará de crear un PDF con la información de la orden de trabajo
  CrearPDF(){
    let nombre : string = this.storage_Nombre;
    if (this.infoOT.valid) {
      this.infoOT.value.ot = 123456;
      let totalKg : number = 0, totalUnd : number = 0;
      let titulo = `Reporte de Costos de la OT ${this.infoOT.value.ot}`;
      this.ArrayProcesos.forEach(item => {
        let Sellado = this.cantidadTotalSella;
        let wiketiado = this.cantidadTotalWiketiado;

        if (Sellado != 0 && wiketiado != 0 && item.Emp == 0) {
          totalUnd = this.cantidadSellandoUnidad + this.cantidadWiketiadoUnidad;
          totalKg = Math.round(this.cantidadTotalSella + this.cantidadTotalWiketiado);
        } else if (Sellado == 0 && item.Emp != 0) {
          totalUnd = this.cantProdSinMargenUnd;
          totalKg = Math.round(this.cantidadTotalEmpaque);
        } else if (Sellado != 0 && item.Emp == 0) {
          totalUnd = this.cantidadSellandoUnidad;
          totalKg = Math.round(this.cantidadTotalSella);
        }
      });

      const pdfDefinicion : any = {
        info: { title: titulo},
        pageSize: { width: 630, height: 760 },
        watermark: { text: 'PLASTICARIBE SAS', color: 'red', opacity: 0.05, bold: true, italics: false },
        pageMargins : [25, 110, 25, 35],
        header: function(currentPage : any, pageCount : any) {
          return [
            {
              margin: [20, 8, 20, 0],
              columns: [
                { image : logoParaPdf, width : 150, height : 30, margin: [20, 25] },
                {
                  width: 300,
                  alignment: 'center',
                  table: {
                    body: [
                      [{text: 'NIT. 800188732', bold: true, alignment: 'center', fontSize: 10}],
                      [{text: `Fecha Doc. ${moment().format('YYYY-MM-DD')} ${moment().format('H:mm:ss')}`, alignment: 'center', fontSize: 8}],
                      [{text: titulo, bold: true, alignment: 'center', fontSize: 10}],
                    ]
                  },
                  layout: 'noBorders',
                  margin: [85, 20],
                },
                {
                  width: '*',
                  alignment: 'center',
                  margin: [20, 20, 20, 0],
                  table: {
                    body: [
                      [{text: `Pagina: `, alignment: 'left', fontSize: 8, bold: true}, { text: `${currentPage.toString() + ' de ' + pageCount}`, alignment: 'left', fontSize: 8, margin: [0, 0, 30, 0] }],
                      [{text: `Fecha: `, alignment: 'left', fontSize: 8, bold: true}, {text: moment().format('YYYY-MM-DD'), alignment: 'left', fontSize: 8, margin: [0, 0, 30, 0] }],
                      [{text: `Hora: `, alignment: 'left', fontSize: 8, bold: true}, {text: moment().format('H:mm:ss'), alignment: 'left', fontSize: 8, margin: [0, 0, 30, 0] }],
                      [{text: `Usuario: `, alignment: 'left', fontSize: 8, bold: true}, {text: nombre, alignment: 'left', fontSize: 8, margin: [0, 0, 30, 0] }],
                    ]
                  },
                  layout: 'noBorders',
                }
              ]
            },
          ];
        },
        content : [
          {
            text: `\n Información detallada de la Orden de Trabajo \n \n`,
            alignment: 'center',
            style: 'header'
          },
          {
            table: {
              widths: [130, 220, '*'],
              style: 'header',
              body: [
                [
                  `N°: ${this.ordenTrabajo}`,
                  `Nombre Cliente: ${this.NombreCliente}`,
                  `Valor de la OT: ${this.formatonumeros(this.valorFinalOT)}`
                ],
                [
                  `Item: ${this.idProducto}`,
                  `Referencia: ${this.nombreProducto}`,
                  `Presentación: ${this.presentacionProducto}`
                ],
                [
                  `Cant Und: ${this.formatonumeros(this.cantProdSinMargenUnd.toFixed(2))}`,
                  `Cant Kg: ${this.formatonumeros(this.cantProdSinMargenKg.toFixed(2))}`,
                  `Cant Margen: ${this.formatonumeros(this.CantidadMargen.toFixed(2))}%`
                ],
                [
                  `Cant Kg Con Margen: ${this.formatonumeros(this.cantProdConMargenKg.toFixed(2))}`,
                  `Valor Unitario Und: ${this.formatonumeros(this.valorUnitarioProdUnd.toFixed(2))}`,
                  `Valor Unitario Kg: ${this.formatonumeros(this.valorUnitarioProdKg.toFixed(2))}`
                ],
              ]
            },
            layout: 'lightHorizontalLines',
            fontSize: 9,
          },
          '\n',
          {
            text: `\n Comparativa \n \n`,
            alignment: 'center',
            style: 'header'
          },
          {
            table: {
              widths: ['*', '*', '*', '*'],
              style: 'header',
              body: [
                [
                  ``,
                  `Valor OT`,
                  `Cantidad Und`,
                  `Cantidad Kg`
                ],
                [
                  `Producido`,
                  `$${this.formatonumeros(this.valorFinalOT.toFixed(2))}`,
                  `${this.formatonumeros(totalUnd)}`,
                  `${this.formatonumeros(totalKg.toFixed(2))}`
                ],
                [
                  `Teorico`,
                  `$${this.formatonumeros(this.valorEstimadoOT.toFixed(2))}`,
                  `${this.formatonumeros(Math.round(this.cantProdSinMargenUnd).toFixed(2))}`,
                  `${this.formatonumeros(this.cantProdSinMargenKg.toFixed(2))}`
                ],
              ]
            },
            layout: 'lightHorizontalLines',
            fontSize: 9,
          },
          '\n',
          {
            text: `\n Información detallada de Materia(s) Prima(s) Utilizada \n `,
            alignment: 'center',
            style: 'header'
          },
          this.table(this.ArrayMateriaPrima, ['Id', 'Nombre', 'Cantidad', 'Presentacion', 'PrecioUnd', 'SubTotal', 'Proceso']),
          {
            text: `\n Valor Total Materia Prima Utilizada: $${this.formatonumeros(this.ValorMPEntregada.toFixed(2))}`,
            alignment: 'right',
            style: 'header',
          },
          '\n \n',
          {
            text: `\n Información detallada de la Producción en cada proceso \n `,
            alignment: 'center',
            style: 'header'
          },
          {
            table: {
              widths: ['*', '*', '*'],
              style: 'header',
              body: [
                [
                  `Extrusión: ${this.formatonumeros(Math.round(this.cantidadTotalExt).toFixed(2))}`,
                  `Impresión: ${this.formatonumeros(Math.round(this.cantidadTotalImp).toFixed(2))}`,
                  `Rotograbado: ${this.formatonumeros(Math.round(this.cantidadTotalRot).toFixed(2))}`
                ],
                [
                  `Doblado: ${this.formatonumeros(Math.round(this.cantidadTotalDbl).toFixed(2))}`,
                  `Laminado: ${this.formatonumeros(Math.round(this.cantidadTotalLaminado).toFixed(2))}`,
                  `Empaque: ${this.formatonumeros(Math.round(this.cantidadTotalEmpaque).toFixed(2))}`
                ],
                [
                  `Wiketiado: ${this.formatonumeros(Math.round(this.cantidadTotalWiketiado).toFixed(2))}`,
                  `Sellado: ${this.formatonumeros(Math.round(this.cantidadTotalSella).toFixed(2))}`,
                  `Corte: ${this.formatonumeros(Math.round(this.cantidadTotalCorte).toFixed(2))}`
                ],
              ]
            },

            layout: {
              fillColor: function (rowIndex, node, columnIndex) {
                return (rowIndex % 2 === 0) ? '#CCCCCC' : null;
              }
            },
            fontSize: 9,
          },
          '\n \n',
          {
            table: {
              widths: [1,'*'],
              style: 'header',
              body: [
                [
                  '',
                  `Valor Final de La OT: $${this.formatonumeros(this.valorFinalOT.toFixed(2))}`,
                ],
                [
                  '',
                  `Diferencia de Costos La OT: $${this.formatonumeros(this.diferencia.toFixed(2))}`,
                ],
                [
                  '',
                  `Porcentaje de Diferencia de Costos de La OT: ${this.formatonumeros(Math.round(this.diferenciaPorcentaje).toFixed(2))}%`,
                ],
              ]
            },
            layout: 'noBorders',
            fontSize: 9,
          },
        ],
        styles: {
          header: {
            fontSize: 10,
            bold: true
          },
          titulo: {
            fontSize: 15,
            bold: true
          }
        }
      }
      const pdf = pdfMake.createPdf(pdfDefinicion);
      pdf.open();

    } else this.msj.mensajeAdvertencia(`Advertencia`, "Debe buscar una OT para crear el reporte");
  }

  // Cambia el estado de la orden de trabajo en la nueva base de datos
  cambiarEstado2(ot : number, estado : any) {
    let estadoFinal;
    this.estadosProcesos_OTService.srvObtenerListaPorOT(ot).subscribe(datos_ot => {
      datos_ot.forEach(item => {
        if (estado == '0') {
          let totalPedido : number = item.estProcOT_CantidadPedida;
          let kgSellado : number = item.estProcOT_SelladoKg;
          let kgEmpaque : number = item.estProcOT_EmpaqueKg;
          if (kgSellado >= totalPedido || kgEmpaque >= totalPedido) estadoFinal = 17 //TERMINADA
          else {
            if ((item.estProcOT_ExtrusionKg == 0
                && item.estProcOT_ImpresionKg == 0
                && item.estProcOT_RotograbadoKg == 0
                && item.estProcOT_LaminadoKg == 0
                && item.estProcOT_CorteKg == 0
                && item.estProcOT_DobladoKg == 0
                && item.estProcOT_SelladoKg == 0
                && item.estProcOT_EmpaqueKg == 0
                && item.estProcOT_WiketiadoKg == 0) && item.estProcOT_CantMatPrimaAsignada > 0) estadoFinal = 14; //ASIGNADA
            else if ((item.estProcOT_ExtrusionKg > 0
              || item.estProcOT_ImpresionKg > 0
              || item.estProcOT_RotograbadoKg > 0
              || item.estProcOT_LaminadoKg > 0
              || item.estProcOT_CorteKg > 0
              || item.estProcOT_DobladoKg > 0
              || item.estProcOT_SelladoKg > 0
              || item.estProcOT_EmpaqueKg > 0
              || item.estProcOT_WiketiadoKg > 0) && item.estProcOT_CantMatPrimaAsignada > 0) estadoFinal = 16; //EN PROCESO
            else estadoFinal = 15; //ABIERTA
          }
        } else if (estado == '4') estadoFinal = 3; //ANULADA
        this.estadosProcesos_OTService.PutEstadoOrdenTrabajo(ot, estadoFinal);
      });
    });
  }

  // Funcion que cambiará el estado de una Orden de trabajo consultada
  cambiarEstado(){
    let estado : any = this.infoOT.value.estadoOT;
    if (this.ordenTrabajo == 0) this.msj.mensajeAdvertencia(`Advertencia`, `¡Para poder cambiarle el estado a una Orden de Trabajo primero debe consultar una!`);
    else {
      const data : any = {
        item : this.ordenTrabajo,
        clienteNom : this.NombreCliente,
        clienteItemsNom : this.nombreProducto,
        usrCrea : this.usuarioCreador,
        estado : estado,
      }
      this.bagProServices.srvActualizar(this.ordenTrabajo, data, estado).subscribe(() => {
        this.cambiarEstado2(this.ordenTrabajo, estado);
        this.msj.mensajeConfirmacion(`Confirmación`, `¡Se ha cambiado el estado de la OT ${this.ordenTrabajo}!`);
      }, () => this.msj.mensajeError(`Error`, 'No se ha podido cambiar el estado de la OT'));
    }
  }

  // Cerrar Orden
  cerrarOrden(){
    if (this.ordenTrabajo == 0) this.msj.mensajeAdvertencia(`Advertencia`, `¡Para poder cambiarle el estado a una Orden de Trabajo primero debe consultar una!`);
    else {
      const data : any = {
        item : this.ordenTrabajo,
        clienteNom : this.NombreCliente,
        clienteItemsNom : this.nombreProducto,
        usrCrea : this.usuarioCreador,
        estado : '1',
      }
      this.bagProServices.srvActualizar(this.ordenTrabajo, data, '1').subscribe(() => {
        this.cambiarEstado2(this.ordenTrabajo, 18);
        this.msj.mensajeConfirmacion(`Confirmación`, `¡Se ha cambiado el estado de la OT ${this.ordenTrabajo} a Cerrada!`);
      }, () => this.msj.mensajeError(`Error`, `No se ha podido cambiar el estado de la OT`));
    }
  }

  inhabilitarCampos = () => setTimeout(() => {
    this.infoOT.disable(); 
    this.infoOT.get('ot').enable();
    this.infoOT.get('estadoOT').enable();
  }, 1000);

  cargarEstados = () => this.arrayEstados = [{valor: '0', nombre: 'Abierto'}, {valor: '4', nombre: 'Anulado'}];
}
