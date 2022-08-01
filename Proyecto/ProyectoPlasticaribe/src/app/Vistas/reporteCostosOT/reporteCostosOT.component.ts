import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BagproService } from 'src/app/Servicios/Bagpro.service';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { RolesService } from 'src/app/Servicios/roles.service';
import Swal from 'sweetalert2';
import { AsignacionMPService } from 'src/app/Servicios/asignacionMP.service';
import { DetallesAsignacionService } from 'src/app/Servicios/detallesAsignacion.service';
import { MateriaPrimaService } from 'src/app/Servicios/materiaPrima.service';
import { info } from 'console';
import pdfMake from 'pdfmake/build/pdfmake';
import { EstadosService } from 'src/app/Servicios/estados.service';
import { TintasService } from 'src/app/Servicios/tintas.service';
import { DetallesAsignacionTintasService } from 'src/app/Servicios/detallesAsignacionTintas.service';
import { EntradaBOPPService } from 'src/app/Servicios/entrada-BOPP.service';
import { AsignacionBOPPService } from 'src/app/Servicios/asignacionBOPP.service';
import { DetalleAsignacion_BOPPService } from 'src/app/Servicios/detallesAsignacionBOPP.service';
import { DevolucionesService } from 'src/app/Servicios/devoluciones.service';
import { DevolucionesMPService } from 'src/app/Servicios/devolucionesMP.service';

@Component({
  selector: 'app-reporteCostosOT',
  templateUrl: './reporteCostosOT.component.html',
  styleUrls: ['./reporteCostosOT.component.css']
})
export class ReporteCostosOTComponent implements OnInit {

  public infoOT !: FormGroup;
  public load: boolean;

  /* Vaiables*/
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  titulosTabla : any; //Variable que tendrá los titulos de la tabla de materia prima
  ArrayMateriaPrima = []; //Variable quetendrá la información de la materia prima que se asignó en la ot consultada
  ArrayMateriaPrima2 = [];
  totalMPEntregada : number = 0; //Variable que servirá pra almacenar el total de materia prima que se entregó en una OT
  ValorMPEntregada : number = 0; //Variable que almacenará el valor total de la materia entregada a una OT
  titulosTablaprocesos = []; // Variable que almacenará los titulos de la tabla en la que saldrán cada uno de los procesos
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

  constructor( private frmBuilderMateriaPrima : FormBuilder,
                private bagProServices : BagproService,
                  @Inject(SESSION_STORAGE) private storage: WebStorageService,
                    private rolService : RolesService,
                      private asignacionMPService : AsignacionMPService,
                        private detallesAsignacionService : DetallesAsignacionService,
                          private materiaPrimaService : MateriaPrimaService,
                            private tintasService : TintasService,
                              private detallesAsignacionTintasService : DetallesAsignacionTintasService,
                                private boppService : EntradaBOPPService,
                                  private asignacionBOPPService : AsignacionBOPPService,
                                    private detallesAsigBOPPService : DetalleAsignacion_BOPPService,
                                    private devolucionesService : DevolucionesService,
                                      private devolucionesMPService : DevolucionesMPService,) {


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

    this.load = true;
  }

  ngOnInit() {
    this.lecturaStorage();
    this.ColumnasTabla();
    this.ColumnasTablaProcesos();
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
    this.storage_Id = this.storage.get('Id');
    this.storage_Nombre = this.storage.get('Nombre');
    let rol = this.storage.get('Rol');
    this.rolService.srvObtenerLista().subscribe(datos_roles => {
      for (let index = 0; index < datos_roles.length; index++) {
        if (datos_roles[index].rolUsu_Id == rol) {
          this.ValidarRol = rol;
          this.storage_Rol = datos_roles[index].rolUsu_Nombre;
        }
      }
    });
  }

  /* FUNCION PARA RELIZAR CONFIMACIÓN DE SALIDA */
  confimacionSalida(){
    Swal.fire({
      title: '¿Seguro que desea salir?',
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: 'Salir',
      denyButtonText: `No Salir`,
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) window.location.href = "./";
    })
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = '$1,';
    return number.toString().replace(exp,rep);
  }

  // Funcion que llenará el Array de los titulos de la tabla de materia prima
  ColumnasTabla(){
    this.titulosTabla = [];
    this.titulosTabla = [{
      mpId : "Id",
      mpNombre : "Nombre",
      mpCantidad : "Cantidad",
      mpUndMedCant : "Presentación",
      mpPrecioU : "Precio U",
      mpSubTotal : "SubTotal",
      mpProceso : "Proceso"
    }]
  }

  //Funcion para darle el nombre a cada columna de la tabla de procesos
  ColumnasTablaProcesos(){
    this.titulosTablaprocesos = [];
    this.titulosTablaprocesos = [{
      ot : "Info",
      ext : "Extrusión",
      imp : "Impresión",
      rot : "Rotograbado",
      dbld : "Doblado",
      lam : "Laminado",
      emp : "Empaque",
      corte : "Corte",
      sel : "Sellado",
      wik : "Wiketiado",
    }]
  }

  //Funcion que consultará la OT que le sea pasada y mostrará la información general de dicha Orden de Trabajo
  consultaOTBagPro(){
    this.ArrayMateriaPrima = [];
    this.totalMPEntregada = 0;
    this.ValorMPEntregada = 0;
    this.load = false;
    this.valorFinalOT = 0;
    this.diferencia = 0;
    this.diferenciaPorcentaje = 0;
    this.estado = '';
    this.devolucion = 0;

    let ot : number = this.infoOT.value.ot;
    let porcentajeMargen : number = 0;
    this.bagProServices.srvObtenerListaClienteOT_ItemCostos(ot).subscribe(datos_OT => {
      if (datos_OT.length == 0) {
        Swal.fire(`No se encuentran registros de la OT ${ot}`);
        this.load = true;
      } else {
        for (const item of datos_OT) {
          porcentajeMargen = (item.datosmargenKg / item.datoscantKg) * 100;

          this.ordenTrabajo = ot;
          this.NombreCliente = item.clienteNom;
          this.idProducto = item.clienteItems;
          this.nombreProducto = item.clienteItemsNom;
          this.cantProdSinMargenUnd = item.datoscantBolsa;
          this.cantProdSinMargenKg = item.datoscantKg;
          this.CantidadMargen = Math.round(porcentajeMargen);
          this.cantProdConMargenKg = item.datosotKg;
          this.presentacionProducto = item.ptPresentacionNom;
          this.valorUnitarioProdUnd = item.datosvalorBolsa;
          this.valorUnitarioProdKg = item.datosValorKg;
          this.valorEstimadoOT = Math.round(item.datosvalorOt);
          let FechaDatetime = item.fechaCrea;
          let FechaCreacionNueva = FechaDatetime.indexOf("T");
          let fechaCreacionFinal = FechaDatetime.substring(0, FechaCreacionNueva);
          this.fechaOT = fechaCreacionFinal;
          this.usuarioCreador = item.usrCrea;
          if (item.estado == null || item.estado == '' || item.estado == '0') this.estado = 'NULL';
          else if (item.estado == 4) this.estado = '4';
          else if (item.estado == 1) this.estado = '1';

          this.infoOT.setValue({
            ot : ot,
            cliente : item.clienteNom,
            IdProducto : item.clienteItems,
            NombreProducto : item.clienteItemsNom,
            cantProductoSinMargenUnd : item.datoscantBolsa,
            cantProductoSinMargenKg : item.datoscantKg,
            margenAdicional : Math.round(porcentajeMargen) + "%",
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
          this.detallesAsignacionService.srvObtenerListaPorOT(ot).subscribe(datos_asignacionMP => {
            if (datos_asignacionMP.length != 0){
              for (let j = 0; j < datos_asignacionMP.length; j++) {
                this.llenarTablaMP(datos_asignacionMP[j]);
              }
            }
          });

          // this.detallesAsignacionService.srvObtenerListaPorOT(ot).subscribe(datos_asignacionMP => {
          //   if (datos_asignacionMP.length != 0){
          //     for (let j = 0; j < datos_asignacionMP.length; j++) {
          //       this.devolucionesService.srvObtenerListaPorOT(ot).subscribe(datos_devoluciones => {
          //         for (let i = 0; i < datos_devoluciones.length; i++) {
          //           this.devolucionesMPService.srvObtenerListaPorDevId(datos_devoluciones[i].devMatPri_Id).subscribe(datos_devolucionesMP => {
          //             for (let k = 0; k < datos_devolucionesMP.length; k++) {
          //               this.devolucion = datos_devolucionesMP[k].dtDevMatPri_CantidadDevuelta;
          //               this.llenarTablaMP(datos_asignacionMP[j], this.devolucion);
          //               this.devolucion = 0;
          //               break;
          //             }
          //           });
          //           break
          //         }
          //       });
          //     }
          //   }
          // });
          this.detallesAsigBOPPService.srvObtenerListaPorOt(ot).subscribe(datos_asignacionBOPP => {
            for (let j = 0; j < datos_asignacionBOPP.length; j++) {
              this.llenarTablaBOPP(datos_asignacionBOPP[j]);
            }
          });
        }
      }
    });
    this.consultaProceso(ot);
  }

  // Funcion en la que se consultaran los procesos de por los que ha pasado la orden de trabajo y calculará el total de kg o unidades que se hizo en cada uno
  consultaProceso(ot : number){
    this.valorFinalOT = 0;
    this.diferencia = 0;
    this.diferenciaPorcentaje = 0;
    this.cantidadSellandoUnidad = 0;
    let cantExtruida : number;
    let cantImpresa : number;
    let cantSellada : number;
    let cantDoblada : number;
    let cantRotograbada : number;
    let cantWiketiado : number;
    this.cantidadTotalExt = 0;
    this.cantidadTotalImp = 0;
    this.cantidadTotalDbl = 0;
    this.cantidadTotalRot = 0;
    this.cantidadTotalEmpaque = 0;
    this.cantidadTotalCorte = 0;
    this.cantidadTotalLaminado = 0;
    this.cantidadTotalSella = 0;
    this.cantidadTotalWiketiado = 0;
    this.cantidadWiketiadoUnidad = 0;

    this.bagProServices.srvObtenerListaProcExtOt(ot).subscribe(datos_procesos => {
      for (let index = 0; index < datos_procesos.length; index++) {
        if (datos_procesos[index].nomStatus == "EXTRUSION") {
          cantExtruida = datos_procesos[index].extnetokg;
          this.cantidadTotalExt = cantExtruida + this.cantidadTotalExt;
        } else if (datos_procesos[index].nomStatus == "IMPRESION") {
          cantImpresa = datos_procesos[index].extnetokg;
          this.cantidadTotalImp = cantImpresa + this.cantidadTotalImp;
        } else if (datos_procesos[index].nomStatus == "DOBLADO") {
          cantDoblada = datos_procesos[index].extnetokg;
          this.cantidadTotalDbl = cantDoblada + this.cantidadTotalDbl;
        } else if (datos_procesos[index].nomStatus == "ROTOGRABADO") {
          cantRotograbada = datos_procesos[index].extnetokg;
          this.cantidadTotalRot = cantRotograbada + this.cantidadTotalRot;
        } else if (datos_procesos[index].nomStatus == "EMPAQUE") {
          cantRotograbada = datos_procesos[index].extnetokg;
          this.cantidadTotalEmpaque = cantRotograbada + this.cantidadTotalEmpaque;
        } else if (datos_procesos[index].nomStatus == "CORTE") {
          cantRotograbada = datos_procesos[index].extnetokg;
          this.cantidadTotalCorte = cantRotograbada + this.cantidadTotalCorte;
        } else if (datos_procesos[index].nomStatus == "LAMINADO") {
          cantRotograbada = datos_procesos[index].extnetokg;
          this.cantidadTotalLaminado = cantRotograbada + this.cantidadTotalLaminado;
        }
      }
      //SELLADO Y WIKETIADO
      this.bagProServices.srvObtenerListaProcSelladoOT(ot).subscribe(datos_selado => {
        for (let i = 0; i < datos_selado.length; i++) {
          if (datos_selado[i].nomStatus == "SELLADO") {
            cantSellada = datos_selado[i].peso;
            this.cantidadTotalSella = cantSellada + this.cantidadTotalSella;
            this.cantidadSellandoUnidad = this.cantidadSellandoUnidad + datos_selado[i].qty;
          } else if (datos_selado[i].nomStatus == "Wiketiado") {
            cantWiketiado = datos_selado[i].peso;
            this.cantidadTotalWiketiado = cantWiketiado + this.cantidadTotalWiketiado;
            this.cantidadWiketiadoUnidad = this.cantidadWiketiadoUnidad + datos_selado[i].qty;
          }
        }
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
      Ext : Math.round(this.cantidadTotalExt),
      Imp : Math.round(this.cantidadTotalImp),
      Rot : Math.round(this.cantidadTotalRot),
      Dbld : Math.round(this.cantidadTotalDbl),
      Lam : Math.round(this.cantidadTotalLaminado),
      Emp : Math.round(this.cantidadTotalEmpaque),
      Corte : Math.round(this.cantidadTotalCorte),
      Sel : `${this.formatonumeros(Math.round(this.cantidadTotalSella))} KG - ${this.formatonumeros(Math.round(this.cantidadSellandoUnidad))} Und`,
      Wik : `${this.formatonumeros(Math.round(this.cantidadTotalWiketiado))} KG - ${this.formatonumeros(Math.round(this.cantidadWiketiadoUnidad))} Und`,
    }
    this.ArrayProcesos.push(cant);
    for (const item of this.ArrayProcesos) {
      let Sellado = item.Sel;
      let SelladoNuevo = Sellado.indexOf(" KG");
      let SelladoFinal = Sellado.substring(0, SelladoNuevo);
      let wiketiado = item.Wik;
      let wiketiadoNuevo = wiketiado.indexOf(" KG");
      let wiketiadoFinal = wiketiado.substring(0, wiketiadoNuevo);

      if (SelladoFinal == 0 && item.Emp != 0 && wiketiadoFinal == 0) {
        this.bagProServices.srvObtenerListaProcExtOt_fechaFinal(ot).subscribe(datos_extrusion => {
          let empaque : any = [];
          empaque.push(datos_extrusion)
          for (const item of empaque) {
            let FechaDatetime = item.fecha;
            let FechaCreacionNueva = FechaDatetime.indexOf("T");
            let fechaCreacionFinal = FechaDatetime.substring(0, FechaCreacionNueva);
            this.fechaFinalOT = fechaCreacionFinal;
            this.infoOT.setValue({
              ot : ot,
              cliente : this.infoOT.value.cliente,
              IdProducto : this.infoOT.value.IdProducto,
              NombreProducto : this.infoOT.value.NombreProducto,
              cantProductoSinMargenUnd : this.infoOT.value.cantProductoSinMargenUnd,
              cantProductoSinMargenKg : this.infoOT.value.cantProductoSinMargenKg,
              margenAdicional : this.infoOT.value.margenAdicional,
              cantProductoConMargen : this.infoOT.value.cantProductoConMargen,
              PresentacionProducto : this.infoOT.value.PresentacionProducto,
              ValorUnidadProductoUnd : this.infoOT.value.ValorUnidadProductoUnd,
              ValorUnidadProductoKg : this.infoOT.value.ValorUnidadProductoKg,
              ValorEstimadoOt : this.infoOT.value.ValorEstimadoOt,
              fechaInicioOT : this.infoOT.value.fechaInicioOT,
              fechaFinOT : this.fechaFinalOT,
              estadoOT : this.infoOT.value.estadoOT,
            });
          }
        });
        if (this.presentacionProducto == 'Kilo') this.valorFinalOT = item.Emp * this.valorUnitarioProdKg;
        else if (this.presentacionProducto == 'Unidad' || this.presentacionProducto == 'Rollo' || this.presentacionProducto == 'Paquete') {
          this.valorFinalOT = item.Emp * this.valorUnitarioProdUnd;
        }
      } else if (SelladoFinal != 0 && item.Emp == 0 && wiketiadoFinal == 0) {
        this.bagProServices.srvObtenerListaProcSelladoOT_FechaFinal(ot).subscribe(datos_sellado => {
          let sellado : any = [];
          sellado.push(datos_sellado)
          for (const itemSel of sellado) {
            let FechaDatetime = itemSel.fechaEntrada;
            let FechaCreacionNueva = FechaDatetime.indexOf("T");
            let fechaCreacionFinal = FechaDatetime.substring(0, FechaCreacionNueva);
            this.fechaFinalOT = fechaCreacionFinal;
            this.infoOT.setValue({
              ot : ot,
              cliente : this.infoOT.value.cliente,
              IdProducto : this.infoOT.value.IdProducto,
              NombreProducto : this.infoOT.value.NombreProducto,
              cantProductoSinMargenUnd : this.infoOT.value.cantProductoSinMargenUnd,
              cantProductoSinMargenKg : this.infoOT.value.cantProductoSinMargenKg,
              margenAdicional : this.infoOT.value.margenAdicional,
              cantProductoConMargen : this.infoOT.value.cantProductoConMargen,
              PresentacionProducto : this.infoOT.value.PresentacionProducto,
              ValorUnidadProductoUnd : this.infoOT.value.ValorUnidadProductoUnd,
              ValorUnidadProductoKg : this.infoOT.value.ValorUnidadProductoKg,
              ValorEstimadoOt : this.infoOT.value.ValorEstimadoOt,
              fechaInicioOT : this.infoOT.value.fechaInicioOT,
              fechaFinOT : this.fechaFinalOT,
              estadoOT : this.infoOT.value.estadoOT,
            });
            break;
          }
        });
        if (this.presentacionProducto == 'Kilo') this.valorFinalOT = SelladoFinal * this.valorUnitarioProdKg;
        else if (this.presentacionProducto == 'Unidad' || this.presentacionProducto == 'Rollo'|| this.presentacionProducto == 'Paquete') {
          this.valorFinalOT = this.cantidadSellandoUnidad * this.valorUnitarioProdUnd;
        }
      } else if (SelladoFinal == 0 && item.Emp == 0 && wiketiadoFinal != 0) {
        this.bagProServices.srvObtenerListaProcSelladoOT_FechaFinal(ot).subscribe(datos_sellado => {
          let sellado : any = [];
          sellado.push(datos_sellado)
          for (const item of sellado) {
            let FechaDatetime = item.fechaEntrada;
            let FechaCreacionNueva = FechaDatetime.indexOf("T");
            let fechaCreacionFinal = FechaDatetime.substring(0, FechaCreacionNueva);
            this.fechaFinalOT = fechaCreacionFinal;
            this.infoOT.setValue({
              ot : ot,
              cliente : this.infoOT.value.cliente,
              IdProducto : this.infoOT.value.IdProducto,
              NombreProducto : this.infoOT.value.NombreProducto,
              cantProductoSinMargenUnd : this.infoOT.value.cantProductoSinMargenUnd,
              cantProductoSinMargenKg : this.infoOT.value.cantProductoSinMargenKg,
              margenAdicional : this.infoOT.value.margenAdicional,
              cantProductoConMargen : this.infoOT.value.cantProductoConMargen,
              PresentacionProducto : this.infoOT.value.PresentacionProducto,
              ValorUnidadProductoUnd : this.infoOT.value.ValorUnidadProductoUnd,
              ValorUnidadProductoKg : this.infoOT.value.ValorUnidadProductoKg,
              ValorEstimadoOt : this.infoOT.value.ValorEstimadoOt,
              fechaInicioOT : this.infoOT.value.fechaInicioOT,
              fechaFinOT : this.fechaFinalOT,
              estadoOT : this.infoOT.value.estadoOT,
            });
            break;
          }
        });
        if (this.presentacionProducto == 'Kilo') this.valorFinalOT = wiketiadoFinal * this.valorUnitarioProdKg;
        else if (this.presentacionProducto == 'Unidad' || this.presentacionProducto == 'Rollo'|| this.presentacionProducto == 'Paquete') {
          this.valorFinalOT = this.cantidadWiketiadoUnidad * this.valorUnitarioProdUnd;
        }
      } else if (SelladoFinal != 0 && item.Emp == 0 && wiketiadoFinal != 0) {
        this.bagProServices.srvObtenerListaProcSelladoOT_FechaFinal(ot).subscribe(datos_sellado => {
          let sellado : any = [];
          sellado.push(datos_sellado)
          for (const itemOT of sellado) {
            let FechaDatetime = itemOT.fechaEntrada;
            let FechaCreacionNueva = FechaDatetime.indexOf("T");
            let fechaCreacionFinal = FechaDatetime.substring(0, FechaCreacionNueva);
            this.fechaFinalOT = fechaCreacionFinal;
            this.infoOT.setValue({
              ot : ot,
              cliente : this.infoOT.value.cliente,
              IdProducto : this.infoOT.value.IdProducto,
              NombreProducto : this.infoOT.value.NombreProducto,
              cantProductoSinMargenUnd : this.infoOT.value.cantProductoSinMargenUnd,
              cantProductoSinMargenKg : this.infoOT.value.cantProductoSinMargenKg,
              margenAdicional : this.infoOT.value.margenAdicional,
              cantProductoConMargen : this.infoOT.value.cantProductoConMargen,
              PresentacionProducto : this.infoOT.value.PresentacionProducto,
              ValorUnidadProductoUnd : this.infoOT.value.ValorUnidadProductoUnd,
              ValorUnidadProductoKg : this.infoOT.value.ValorUnidadProductoKg,
              ValorEstimadoOt : this.infoOT.value.ValorEstimadoOt,
              fechaInicioOT : this.infoOT.value.fechaInicioOT,
              fechaFinOT :fechaCreacionFinal,
              estadoOT : this.infoOT.value.estadoOT,
            });
            break;
          }
        });
        if (this.presentacionProducto == 'Kilo') this.valorFinalOT = (wiketiadoFinal * this.valorUnitarioProdKg) + (SelladoFinal * this.valorUnitarioProdKg);
        else if (this.presentacionProducto == 'Unidad' || this.presentacionProducto == 'Rollo'|| this.presentacionProducto == 'Paquete') {
          this.valorFinalOT = (this.cantidadWiketiadoUnidad * this.valorUnitarioProdUnd) + (this.cantidadSellandoUnidad * this.valorUnitarioProdUnd);
        }
      }
    }
    this.diferencia = this.valorFinalOT - this.ValorMPEntregada;
    Math.round(this.diferenciaPorcentaje = (this.diferencia / this.valorFinalOT) * 100);
    this.load = true;
  }

  // llenarTablaMP(formulario : any, CantDevuelta : number){
  //   if (formulario.sum == 0) this.load = true;
  //   else {
  //     this.materiaPrimaService.srvObtenerListaPorId(formulario.matPri_Id).subscribe(datos_materiaPrima => {
  //       const infoDoc : any = {
  //         Id : datos_materiaPrima.matPri_Id,
  //         Nombre : datos_materiaPrima.matPri_Nombre,
  //         Cantidad : (formulario.sum - CantDevuelta),
  //         Presentacion : datos_materiaPrima.undMed_Id,
  //         PrecioUnd : this.formatonumeros(datos_materiaPrima.matPri_Precio),
  //         SubTotal : this.formatonumeros(Math.round((formulario.sum - CantDevuelta) * datos_materiaPrima.matPri_Precio)),
  //         Proceso : formulario.proceso_Nombre,
  //       }

  //       this.totalMPEntregada = (this.totalMPEntregada + infoDoc.Cantidad) - CantDevuelta;
  //       this.ValorMPEntregada = this.ValorMPEntregada + ((formulario.sum - CantDevuelta) * datos_materiaPrima.matPri_Precio);
  //       this.ArrayMateriaPrima.push(infoDoc);
  //       this.ArrayMateriaPrima.sort((a,b) => a.Nombre.localeCompare(b.Nombre));
  //       this.ArrayMateriaPrima.sort((a,b) => a.Proceso.localeCompare(b.Proceso));
  //     });
  //     this.load = true;
  //     this.devolucion = 0;
  //   }
  // }

  // Funcion para llenar la tabla con la materia prima que se ha pedido para la OT consultada
  llenarTablaMP(formulario : any){
    if (this.devolucion != 0) {
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
        this.totalMPEntregada = this.totalMPEntregada - infoDoc.Cantidad;
        this.ValorMPEntregada = this.ValorMPEntregada - (formulario.dtDevMatPri_CantidadDevuelta * datos_materiaPrima.matPri_Precio);
        this.ArrayMateriaPrima.push(infoDoc);
        this.ArrayMateriaPrima.sort((a,b) => a.Nombre.localeCompare(b.Nombre));
        this.ArrayMateriaPrima.sort((a,b) => a.Proceso.localeCompare(b.Proceso));
      });
      this.load = true;
    } else {
      this.materiaPrimaService.srvObtenerListaPorId(formulario.matPri_Id).subscribe(datos_materiaPrima => {
        const infoDoc : any = {
          Id : datos_materiaPrima.matPri_Id,
          Nombre : datos_materiaPrima.matPri_Nombre,
          Cantidad : formulario.sum,
          Presentacion : datos_materiaPrima.undMed_Id,
          PrecioUnd : this.formatonumeros(datos_materiaPrima.matPri_Precio),
          SubTotal : this.formatonumeros(Math.round(formulario.sum * datos_materiaPrima.matPri_Precio)),
          Proceso : formulario.proceso_Nombre,
        }

        this.totalMPEntregada = this.totalMPEntregada + infoDoc.Cantidad;
        this.ValorMPEntregada = this.ValorMPEntregada + (formulario.sum * datos_materiaPrima.matPri_Precio);
        this.ArrayMateriaPrima.push(infoDoc);
        this.ArrayMateriaPrima.sort((a,b) => a.Nombre.localeCompare(b.Nombre));
        this.ArrayMateriaPrima.sort((a,b) => a.Proceso.localeCompare(b.Proceso));
      });
      this.load = true;
    }
  }

  // Funcion que servirá para llenar la tabla de materias primas utilizadas con el BOPP que se asignó para la OT consultada
  llenarTablaBOPP(formulario : any){
    let bopp : any = [];
    this.boppService.srvObtenerListaPorId(formulario.bopP_Id).subscribe(datos_bopp => {
      bopp.push(datos_bopp);
      for (const item of bopp) {
        const infoBopp : any = {
          Id : item.bopP_Id,
          Nombre : item.bopP_Nombre,
          Cantidad : formulario.dtAsigBOPP_Cantidad,
          Presentacion : item.undMed_Kg,
          PrecioUnd : this.formatonumeros(item.bopP_Precio),
          SubTotal : this.formatonumeros(Math.round(item.bopP_Precio * formulario.dtAsigBOPP_Cantidad)),
          Proceso : formulario.proceso_Id,
        }
        this.totalMPEntregada = this.totalMPEntregada + infoBopp.Cantidad;
        this.ValorMPEntregada = this.ValorMPEntregada + (Math.round(item.bopP_Precio * formulario.dtAsigBOPP_Cantidad));
        this.ArrayMateriaPrima.push(infoBopp);
      }
    });
    this.load = true;
  }

  // Funcion que servirá para llenar la tabla de materias primas utilizadas con las tintas que se asignaron para la OT consultada
  llenarTablaTintas(){

  }

  // funcion que se encagará de llenar la tabla de los productos en el pdf
  buildTableBody(data, columns) {
    var body = [];
    body.push(columns);
    data.forEach(function(row) {
        var dataRow = [];
        columns.forEach(function(column) {
            dataRow.push(row[column].toString());
        });
        body.push(dataRow);
    });

    return body;
  }

  // Funcion que genera la tabla donde se mostrará la información de los productos pedidos
  table(data, columns) {
    return {
        table: {
          headerRows: 1,
          widths: [20, 185, 40, 60, 50, 60, 40],
          body: this.buildTableBody(data, columns),
        },
        fontSize: 8,
        layout: {
          fillColor: function (rowIndex, node, columnIndex) {
            return (rowIndex == 0) ? '#CCCCCC' : null;
          }
        }
    };
  }

  // Funcion que cargará el PDF con la infomración de la OT
  CargarPDF(){
    if (this.ArrayMateriaPrima.length == 0) Swal.fire("Debe buscar una OT para crear el reporte")
    else {
      for (let i = 0; i < this.ArrayMateriaPrima.length; i++) {
        for (const item of this.ArrayProcesos) {
          let Sellado = item.Sel;
          let SelladoNuevo = Sellado.indexOf(" KG");
          let SelladoFinal = Sellado.substring(0, SelladoNuevo);
          let wiketiado = item.Wik;
          let wiketiadoNuevo = wiketiado.indexOf(" KG");
          let wiketiadoFinal = wiketiado.substring(0, wiketiadoNuevo);

          if (SelladoFinal != 0 && wiketiadoFinal != 0 && item.Emp == 0) {
            const pdfDefinicion : any = {
              info: {
                title: `${this.ordenTrabajo}`
              },
              content : [
                {
                  text: `Plasticaribe S.A.S ---- Reporte de Orden de Trabajo`,
                  alignment: 'center',
                  style: 'titulo',
                },
                '\n \n',
                {
                  text: `Solicitado Por: ${this.storage_Nombre}\n`,
                  alignment: 'right',
                  style: 'header',
                },
                {
                  text: `Fecha Creación OT: ${this.fechaOT}\n`,
                  alignment: 'right',
                  style: 'header',
                },
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
                        `Id Producto: ${this.idProducto}`,
                        `Nombre Producto: ${this.nombreProducto}`,
                        `Presentación: ${this.presentacionProducto}`
                      ],
                      [
                        `Cantidad Und: ${this.formatonumeros(this.cantProdSinMargenUnd)}`,
                        `Cantidad Kg: ${this.formatonumeros(this.cantProdSinMargenKg)}`,
                        `Cantidad Margen: ${this.formatonumeros(this.CantidadMargen)}%`
                      ],
                      [
                        `Cantidad Kg Con Margen: ${this.formatonumeros(this.cantProdConMargenKg)}`,
                        `Valor Unitario Und: ${this.formatonumeros(this.valorUnitarioProdUnd)}`,
                        `Valor Unitario Kg: ${this.formatonumeros(this.valorUnitarioProdKg)}`
                      ],
                    ]
                  },
                  layout: 'lightHorizontalLines',
                  fontSize: 9,
                },
                '\n \n',
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
                        `$${this.formatonumeros(this.valorFinalOT)}`,
                        `${this.formatonumeros(this.cantidadSellandoUnidad + this.cantidadWiketiadoUnidad)}`,
                        `${this.formatonumeros(Math.round(this.cantidadTotalSella + this.cantidadTotalWiketiado))}`
                      ],
                      [
                        `Teorico`,
                        `$${this.formatonumeros(this.valorEstimadoOT)}`,
                        `${this.formatonumeros(Math.round(this.cantProdSinMargenUnd))}`,
                        `${this.formatonumeros(this.cantProdSinMargenKg)}`
                      ],
                    ]
                  },
                  layout: 'lightHorizontalLines',
                  fontSize: 9,
                },
                '\n \n',
                {
                  text: `\n Información detallada de Materia(s) Prima(s) Utilizada \n `,
                  alignment: 'center',
                  style: 'header'
                },

                this.table(this.ArrayMateriaPrima, ['Id', 'Nombre', 'Cantidad', 'Presentacion', 'PrecioUnd', 'SubTotal', 'Proceso']),

                {
                  text: `\n\nValor Total Materia Prima Utilizada: $${this.formatonumeros(this.ValorMPEntregada)}`,
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
                        `Extrusión: ${this.formatonumeros(Math.round(this.cantidadTotalExt))}`,
                        `Impresión: ${this.formatonumeros(Math.round(this.cantidadTotalImp))}`,
                        `Rotograbado: ${this.formatonumeros(Math.round(this.cantidadTotalRot))}`
                      ],
                      [
                        `Doblado: ${this.formatonumeros(Math.round(this.cantidadTotalDbl))}`,
                        `Laminado: ${this.formatonumeros(Math.round(this.cantidadTotalLaminado))}`,
                        `Empaque: ${this.formatonumeros(Math.round(this.cantidadTotalEmpaque))}`
                      ],
                      [
                        `Wiketiado: ${this.formatonumeros(Math.round(this.cantidadTotalWiketiado))}`,
                        `Sellado: ${this.formatonumeros(Math.round(this.cantidadTotalSella))}`,
                        `Corte: ${this.formatonumeros(Math.round(this.cantidadTotalCorte))}`
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
                        `Valor Final de La OT: $${this.formatonumeros(this.valorFinalOT)}`,
                      ],
                      [
                        '',
                        `Diferencia de Costos La OT: $${this.formatonumeros(this.diferencia)}`,
                      ],
                      [
                        '',
                        `Porcentaje de Diferencia de Costos de La OT: ${this.formatonumeros(Math.round(this.diferenciaPorcentaje))}%`,
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
            break;
          } else if (SelladoFinal == 0 && item.Emp != 0) {
            const pdfDefinicion : any = {
              info: {
                title: `${this.ordenTrabajo}`
              },
              content : [
                {
                  text: `Plasticaribe S.A.S ---- Reporte de Orden de Trabajo`,
                  alignment: 'center',
                  style: 'titulo',
                },
                '\n \n',
                {
                  text: `Solicitado Por: ${this.storage_Nombre}\n`,
                  alignment: 'right',
                  style: 'header',
                },
                {
                  text: `Fecha Creación OT: ${this.fechaOT}\n`,
                  alignment: 'right',
                  style: 'header',
                },
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
                        `Id Producto: ${this.idProducto}`,
                        `Nombre Producto: ${this.nombreProducto}`,
                        `Presentación: ${this.presentacionProducto}`
                      ],
                      [
                        `Cantidad Und: ${this.formatonumeros(this.cantProdSinMargenUnd)}`,
                        `Cantidad Kg: ${this.formatonumeros(this.cantProdSinMargenKg)}`,
                        `Cantidad Margen: ${this.formatonumeros(this.CantidadMargen)}%`
                      ],
                      [
                        `Cantidad Kg Con Margen: ${this.formatonumeros(this.cantProdConMargenKg)}`,
                        `Valor Unitario Und: ${this.formatonumeros(this.valorUnitarioProdUnd)}`,
                        `Valor Unitario Kg: ${this.formatonumeros(this.valorUnitarioProdKg)}`
                      ],
                    ]
                  },
                  layout: 'lightHorizontalLines',
                  fontSize: 9,
                },
                '\n \n',
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
                        `$${this.formatonumeros(this.valorFinalOT)}`,
                        `${this.formatonumeros(this.cantProdSinMargenUnd)}`,
                        `${this.formatonumeros(Math.round(this.cantidadTotalEmpaque))}`
                      ],
                      [
                        `Teorico`,
                        `$${this.formatonumeros(this.valorEstimadoOT)}`,
                        `${this.formatonumeros(Math.round(this.cantProdSinMargenUnd))}`,
                        `${this.formatonumeros(this.cantProdSinMargenKg)}`
                      ],
                    ]
                  },
                  layout: 'lightHorizontalLines',
                  fontSize: 9,
                },
                '\n \n',
                {
                  text: `\n Información detallada de Materia(s) Prima(s) Utilizada \n `,
                  alignment: 'center',
                  style: 'header'
                },

                this.table(this.ArrayMateriaPrima, ['Id', 'Nombre', 'Cantidad', 'Presentacion', 'PrecioUnd', 'SubTotal', 'Proceso']),

                {
                  text: `\n\nValor Total Materia Prima Utilizada: $${this.formatonumeros(this.ValorMPEntregada)}`,
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
                        `Extrusión: ${this.formatonumeros(Math.round(this.cantidadTotalExt))}`,
                        `Impresión: ${this.formatonumeros(Math.round(this.cantidadTotalImp))}`,
                        `Rotograbado: ${this.formatonumeros(Math.round(this.cantidadTotalRot))}`
                      ],
                      [
                        `Doblado: ${this.formatonumeros(Math.round(this.cantidadTotalDbl))}`,
                        `Laminado: ${this.formatonumeros(Math.round(this.cantidadTotalLaminado))}`,
                        `Empaque: ${this.formatonumeros(Math.round(this.cantidadTotalEmpaque))}`
                      ],
                      [
                        `Wiketiado: ${this.formatonumeros(Math.round(this.cantidadTotalWiketiado))}`,
                        `Sellado: ${this.formatonumeros(Math.round(this.cantidadTotalSella))}`,
                        `Corte: ${this.formatonumeros(Math.round(this.cantidadTotalCorte))}`
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
                        `Valor Final de La OT: $${this.formatonumeros(this.valorFinalOT)}`,
                      ],
                      [
                        '',
                        `Diferencia de Costos La OT: $${this.formatonumeros(this.diferencia)}`,
                      ],
                      [
                        '',
                        `Porcentaje de Diferencia de Costos de La OT: ${this.formatonumeros(Math.round(this.diferenciaPorcentaje))}%`,
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
            break;

          } else if (SelladoFinal != 0 && item.Emp == 0) {
            const pdfDefinicion : any = {
              info: {
                title: `${this.ordenTrabajo}`
              },
              content : [
                {
                  text: `Plasticaribe S.A.S ---- Reporte de Orden de Trabajo`,
                  alignment: 'center',
                  style: 'titulo',
                },
                '\n \n',
                {
                  text: `Solicitado Por: ${this.storage_Nombre}\n`,
                  alignment: 'right',
                  style: 'header',
                },
                {
                  text: `Fecha Creación OT: ${this.fechaOT}\n`,
                  alignment: 'right',
                  style: 'header',
                },
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
                        `Id Producto: ${this.idProducto}`,
                        `Nombre Producto: ${this.nombreProducto}`,
                        `Presentación: ${this.presentacionProducto}`
                      ],
                      [
                        `Cantidad Und: ${this.formatonumeros(this.cantProdSinMargenUnd)}`,
                        `Cantidad Kg: ${this.formatonumeros(this.cantProdSinMargenKg)}`,
                        `Cantidad Margen: ${this.formatonumeros(this.CantidadMargen)}%`
                      ],
                      [
                        `Cantidad Kg Con Margen: ${this.formatonumeros(this.cantProdConMargenKg)}`,
                        `Valor Unitario Und: ${this.formatonumeros(this.valorUnitarioProdUnd)}`,
                        `Valor Unitario Kg: ${this.formatonumeros(this.valorUnitarioProdKg)}`
                      ],
                    ]
                  },
                  layout: 'lightHorizontalLines',
                  fontSize: 9,
                },
                '\n \n',
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
                        `$${this.formatonumeros(this.valorFinalOT)}`,
                        `${this.formatonumeros(this.cantidadSellandoUnidad)}`,
                        `${this.formatonumeros(Math.round(this.cantidadTotalSella))}`
                      ],
                      [
                        `Teorico`,
                        `$${this.formatonumeros(this.valorEstimadoOT)}`,
                        `${this.formatonumeros(Math.round(this.cantProdSinMargenUnd))}`,
                        `${this.formatonumeros(this.cantProdSinMargenKg)}`
                      ],
                    ]
                  },
                  layout: 'lightHorizontalLines',
                  fontSize: 9,
                },
                '\n \n',
                {
                  text: `\n Información detallada de Materia(s) Prima(s) Utilizada \n `,
                  alignment: 'center',
                  style: 'header'
                },

                this.table(this.ArrayMateriaPrima, ['Id', 'Nombre', 'Cantidad', 'Presentacion', 'PrecioUnd', 'SubTotal', 'Proceso']),

                {
                  text: `\n\nValor Total Materia Prima Utilizada: $${this.formatonumeros(this.ValorMPEntregada)}`,
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
                        `Extrusión: ${this.formatonumeros(Math.round(this.cantidadTotalExt))}`,
                        `Impresión: ${this.formatonumeros(Math.round(this.cantidadTotalImp))}`,
                        `Rotograbado: ${this.formatonumeros(Math.round(this.cantidadTotalRot))}`
                      ],
                      [
                        `Doblado: ${this.formatonumeros(Math.round(this.cantidadTotalDbl))}`,
                        `Laminado: ${this.formatonumeros(Math.round(this.cantidadTotalLaminado))}`,
                        `Empaque: ${this.formatonumeros(Math.round(this.cantidadTotalEmpaque))}`
                      ],
                      [
                        `Wiketiado: ${this.formatonumeros(Math.round(this.cantidadTotalWiketiado))}`,
                        `Sellado: ${this.formatonumeros(Math.round(this.cantidadTotalSella))}`,
                        `Corte: ${this.formatonumeros(Math.round(this.cantidadTotalCorte))}`
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
                        `Valor Final de La OT: $${this.formatonumeros(this.valorFinalOT)}`,
                      ],
                      [
                        '',
                        `Diferencia de Costos La OT: $${this.formatonumeros(this.diferencia)}`,
                      ],
                      [
                        '',
                        `Porcentaje de Diferencia de Costos de La OT: ${this.formatonumeros(Math.round(this.diferenciaPorcentaje))}%`,
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
            break;
          }
          break;
        }
        break;
      }
    }
  }

  // Funcion que cambiará el estado de una Orden de trabajo consultada
  cambiarEstado(){

    let estado : any = this.infoOT.value.estadoOT;

    if (this.ordenTrabajo == 0) Swal.fire(`¡Para poder cambiarle el estado a una Orden de Trabajo primero debe consultar una!`);
    else {


      const data : any = {
        item : this.ordenTrabajo,
        clienteNom : this.NombreCliente,
        clienteItemsNom : this.nombreProducto,
        usrCrea : this.usuarioCreador,
        estado : estado,
      }
      this.bagProServices.srvActualizar(this.ordenTrabajo, data, estado).subscribe(datos_clientesOT => {
        const Toast = Swal.mixin({
          toast: true,
          position: 'center',
          showConfirmButton: false,
          timer: 2200,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
          }
        });
        Toast.fire({
          icon: 'success',
          title: '¡Actualizacion de OT exitosa!'
        });
      });


      // if (estado == 0) {
      //   const data : any = {
      //     item : this.ordenTrabajo,
      //     clienteNom : this.NombreCliente,
      //     clienteItemsNom : this.nombreProducto,
      //     usrCrea : this.usuarioCreador,
      //     estado : estado,
      //   }
      //   this.bagProServices.srvActualizar(this.ordenTrabajo, data, estado).subscribe(datos_clientesOT => {
      //     const Toast = Swal.mixin({
      //       toast: true,
      //       position: 'center',
      //       showConfirmButton: false,
      //       timer: 2200,
      //       timerProgressBar: true,
      //       didOpen: (toast) => {
      //         toast.addEventListener('mouseenter', Swal.stopTimer);
      //         toast.addEventListener('mouseleave', Swal.resumeTimer);
      //       }
      //     });
      //     Toast.fire({
      //       icon: 'success',
      //       title: '¡Actualizacion de OT exitosa!'
      //     });
      //   });

      // } else {
      //   const data : any = {
      //     item : this.ordenTrabajo,
      //     clienteNom : this.NombreCliente,
      //     clienteItemsNom : this.nombreProducto,
      //     usrCrea : this.usuarioCreador,
      //     estado : estado,
      //   }
      //   this.bagProServices.srvActualizar(this.ordenTrabajo, data, estado).subscribe(datos_clientesOT => {
      //     const Toast = Swal.mixin({
      //       toast: true,
      //       position: 'center',
      //       showConfirmButton: false,
      //       timer: 2200,
      //       timerProgressBar: true,
      //       didOpen: (toast) => {
      //         toast.addEventListener('mouseenter', Swal.stopTimer);
      //         toast.addEventListener('mouseleave', Swal.resumeTimer);
      //       }
      //     });
      //     Toast.fire({
      //       icon: 'success',
      //       title: '¡Actualizacion de OT exitosa!'
      //     });
      //   });
      // }
    }
  }

}
