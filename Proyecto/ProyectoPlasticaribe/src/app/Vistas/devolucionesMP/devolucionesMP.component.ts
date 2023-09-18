import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShepherdService } from 'angular-shepherd';
import moment from 'moment';
import { modeloMovimientos_Entradas_MP } from 'src/app/Modelo/modeloMovimientos_Entradas_MP';
import { EntradaBOPPService } from 'src/app/Servicios/BOPP/entrada-BOPP.service';
import { DetallesAsignacionService } from 'src/app/Servicios/DetallesAsgMateriaPrima/detallesAsignacion.service';
import { DevolucionesMPService } from 'src/app/Servicios/DetallesDevolucionMateriaPrima/devolucionesMP.service';
import { DevolucionesService } from 'src/app/Servicios/DevolucionMateriaPrima/devoluciones.service';
import { MateriaPrimaService } from 'src/app/Servicios/MateriaPrima/materiaPrima.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { Movimientos_Entradas_MPService } from 'src/app/Servicios/Movimientos_Entradas_MP/Movimientos_Entradas_MP.service';
import { TintasService } from 'src/app/Servicios/Tintas/tintas.service';
import { AppComponent } from 'src/app/app.component';
import { defaultStepOptions, stepsDevolucionesMp as defaultSteps } from 'src/app/data';

@Component({
  selector: 'app-devolucionesMP',
  templateUrl: './devolucionesMP.component.html',
  styleUrls: ['./devolucionesMP.component.css']
})

export class DevolucionesMPComponent implements OnInit {

  public FormDevolucion !: FormGroup;

  /* Vaiables*/
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  materiasPrimas = []; //Variable que va almacenar el nombre de todas las materias primas existentes en la empresa
  materiasPrimasRetiradas = []; //Variable que va almacenar el nombre de todas las materias primas existentes en la empresa
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  load : boolean = true;
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro

  constructor(private materiaPrimaService : MateriaPrimaService,
                private AppComponent : AppComponent,
                  private frmBuilderMateriaPrima : FormBuilder,
                    private devolucionService : DevolucionesService,
                      private devolucionMPService : DevolucionesMPService,
                        private servicioTintas : TintasService,
                          private detallesAsignacionService : DetallesAsignacionService,
                            private boppService : EntradaBOPPService,
                              private shepherdService: ShepherdService,
                                private mensajeService : MensajesAplicacionService,
                                  private svcMovEntradas : Movimientos_Entradas_MPService) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
    this.FormDevolucion = this.frmBuilderMateriaPrima.group({
      ot : ['', Validators.required],
      MpingresoFecha: [this.today, Validators.required],
      MpObservacion : ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.lecturaStorage();
  }

  tutorial(){
    this.shepherdService.defaultStepOptions = defaultStepOptions;
    this.shepherdService.modal = true;
    this.shepherdService.confirmCancel = false;
    this.shepherdService.addSteps(defaultSteps);
    this.shepherdService.start();
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

  // Funcion que limpia los todos los campos de la vista
  LimpiarCampos = () => this.FormDevolucion.patchValue({ ot : '', MpingresoFecha: this.today, MpObservacion : '', });

  // Funcion que va a consultar por OT todas las materia primas asignadas a una orden de trabajo
  consultarOt(){
    this.load = false;
    this.materiasPrimas = [];
    let ot : number = this.FormDevolucion.value.ot;
    this.detallesAsignacionService.srvObtenerListaPorAsignacionesOT(ot).subscribe(datos_asignacionMP => {
      if (datos_asignacionMP.length != 0){
        for (let i = 0; i < datos_asignacionMP.length; i++) {
          let cantidad : number = datos_asignacionMP[i].cantMP;
          let info : any = {
            Id : datos_asignacionMP[i].materiaPrima,
            Id_MateriaPrima : datos_asignacionMP[i].matPri_Id,
            Id_Tinta : datos_asignacionMP[i].tinta_Id,
            Id_Bopp : datos_asignacionMP[i].bopp_Id,
            Nombre : datos_asignacionMP[i].nombreMP,
            Cantidad : cantidad,
            Cantidad_Oculta : cantidad,
            Cantidad_Devuelta : 0,
            Unidad_Medida : datos_asignacionMP[i].undMedida,
            Proceso : datos_asignacionMP[i].proceso,
            Proceso_Nombre : datos_asignacionMP[i].nombreProceso,
          }
          if (info.Id_Bopp == 0) info.Id_Bopp = 449;

          this.materiasPrimas.push(info);
          for (let index = 0; index < this.materiasPrimas.length; index++) {
            this.materiasPrimas[index].Cantidad_Devuelta = this.materiasPrimas[index].Cantidad_Oculta;
          }
        }
      }
    }, () => this.mensajeService.mensajeError(`Error`, `¡No hay materias primas asignadas a la OT ${ot}!`));
    setTimeout(() => {
      this.devolucionMPService.srvObtenerConsultaMov2(ot).subscribe(datos_devolucion => {
        for (let j = 0; j < datos_devolucion.length; j++) {
          for (let i = 0; i < this.materiasPrimas.length; i++) {
            if (this.materiasPrimas[i].Id == datos_devolucion[j].matPri_Id ||
                  this.materiasPrimas[i].Id == datos_devolucion[j].bopP_Id ||
                    this.materiasPrimas[i].Id == datos_devolucion[j].tinta_Id) {
              this.materiasPrimas[i].Cantidad -= datos_devolucion[j].dtDevMatPri_CantidadDevuelta;
              this.materiasPrimas[i].Cantidad_Oculta -= datos_devolucion[j].dtDevMatPri_CantidadDevuelta;
              this.materiasPrimas[i].Cantidad_Devuelta = this.materiasPrimas[i].Cantidad;
            }
          }
        }
      }, () => this.mensajeService.mensajeError(`Error`, `¡Error al obtener las devoluciones de la OT ${ot}!`));
      this.load = true;
    }, 2500);
  }

  //Funcion que va a seleccionar una materia prima
  llenarMateriaPrimaAIngresar(item : any){
    this.load = false;
    this.materiasPrimasRetiradas.splice(this.materiasPrimasRetiradas.findIndex((data) => data.Id == item.Id), 1);
    this.materiasPrimas.sort((a,b) => Number(a.Id) - Number(b.Id) );
    setTimeout(() => this.load = true, 50);
  }

  // Funcion que seleccionará y colocará todos los MateriaPrima que se van a insertar
  seleccionarTodosMateriaPrima(){
    this.load = false;
    this.materiasPrimasRetiradas = [];
    this.materiasPrimas.sort((a,b) => Number(a.Id) - Number(b.Id) );
    setTimeout(() => this.load = true, 50);
  }

  //Funcion que va a quitar lo MateriaPrima que se van a insertar
  quitarMateriaPrimaAIngresar(item : any){
    this.load = false;
    this.materiasPrimas.splice(this.materiasPrimas.findIndex((data) => data.Id == item.Id), 1);
    this.materiasPrimasRetiradas.sort((a,b) => Number(a.Id) - Number(b.Id) );
    setTimeout(() => this.load = true, 50);
  }

  // Funcion que va a quitar todos los MateriaPrima que se van a insertar
  quitarTodosMateriaPrima(){
    this.load = false;
    this.materiasPrimasRetiradas.sort((a,b) => Number(a.Id) - Number(b.Id) );
    this.materiasPrimas = [];
    setTimeout(() => this.load = true, 50);
  }

  //Funcion que registrará y guardará en la base de datos la infomacion de la materia prima entrante
  registrarDevolucion(){
    if (this.materiasPrimasRetiradas.length > 0) {
      const datosDevolucion : any = {
        DevMatPri_OrdenTrabajo : this.FormDevolucion.value.ot,
        DevMatPri_Fecha : this.today,
        DevMatPri_Hora : moment().format('H:mm:ss'),
        DevMatPri_Motivo : this.FormDevolucion.value.MpObservacion,
        Usua_Id : this.storage_Id,
      }
      this.devolucionService.srvGuardar(datosDevolucion).subscribe(() => this.creacionDevolucionMateriaPrima(), () => this.mensajeService.mensajeError(`Error`, `¡Error al crear la devolución de materia prima!`));
    } else this.mensajeService.mensajeAdvertencia(`Advertencia`, `¡Debe seleccionar minimo una materia prima para devolver!`);
  }

  //Funcion que creará el registro de la materia que viene en un pedido
  creacionDevolucionMateriaPrima(){
    this.devolucionService.srvObtenerUltimaDevolucion().subscribe(datos_devolucion => {
      for (let i = 0; i < this.materiasPrimasRetiradas.length; i++) {
        if (this.materiasPrimasRetiradas[i].Cantidad > 0 && !this.materiasPrimasRetiradas[i].Exits) {
          const datosDevolucionMp : any = {
            DevMatPri_Id : datos_devolucion.devMatPri_Id,
            MatPri_Id : this.materiasPrimasRetiradas[i].Id_MateriaPrima,
            Tinta_Id : this.materiasPrimasRetiradas[i].Id_Tinta,
            BOPP_Id : this.materiasPrimasRetiradas[i].Id_Bopp,
            DtDevMatPri_CantidadDevuelta : this.materiasPrimasRetiradas[i].Cantidad_Devuelta,
            UndMed_Id : this.materiasPrimasRetiradas[i].Unidad_Medida,
            Proceso_Id : this.materiasPrimasRetiradas[i].Proceso,
          }
          this.devolucionMPService.srvGuardar(datosDevolucionMp).subscribe(() => {
          }, () => this.mensajeService.mensajeError(`Error`, `¡No se ha podido crear la devolución de la materia prima ${this.materiasPrimasRetiradas[i].Nombre}!`));
        }
      }
    });
    setTimeout(() => {
      this.moverInventarioMpAgregada();
      this.moverInventarioTintas();
      this.moverInventarioBopp();
      setTimeout(() => { this.limpiarTodosCampos(); }, 1000);
    }, (20 * this.materiasPrimasRetiradas.length));
  }

  //Funcion que moverá el inventario de materia prima con base a la materia prima devuelta
  moverInventarioMpAgregada(){
    let stockMateriaPrimaFinal : number;
    for (let index = 0; index < this.materiasPrimasRetiradas.length; index++) {
      if (this.materiasPrimasRetiradas[index].Id_MateriaPrima != 84) {
        this.materiaPrimaService.srvObtenerListaPorId(this.materiasPrimasRetiradas[index].Id_MateriaPrima).subscribe(datos_materiaPrima => {

          if(this.materiasPrimasRetiradas[index].Id_MateriaPrima == 84) stockMateriaPrimaFinal = 0;
          else stockMateriaPrimaFinal = datos_materiaPrima.matPri_Stock + this.materiasPrimasRetiradas[index].Cantidad_Devuelta;

          const datosMP : any = {
            MatPri_Id : this.materiasPrimasRetiradas[index].Id_MateriaPrima,
            MatPri_Nombre : datos_materiaPrima.matPri_Nombre,
            MatPri_Descripcion : datos_materiaPrima.matPri_Descripcion,
            MatPri_Stock : stockMateriaPrimaFinal,
            UndMed_Id : datos_materiaPrima.undMed_Id,
            CatMP_Id : datos_materiaPrima.catMP_Id,
            MatPri_Precio : datos_materiaPrima.matPri_Precio,
            TpBod_Id : datos_materiaPrima.tpBod_Id,
          }
          this.materiaPrimaService.srvActualizar(this.materiasPrimasRetiradas[index].Id_MateriaPrima, datosMP).subscribe(() => {
            this.mensajeService.mensajeConfirmacion(`Confirmación`, `Registro de devolución creado con éxito`);
          }, () => this.mensajeService.mensajeError(`Error`, `¡No se ha podido mover el inventario de la materia prima ${this.materiasPrimasRetiradas[index].Nombre}!`));
        });
      }
    }
  }

  // Funcion que va a mover el inventario de tintas con base a la materia prima devuelta
  moverInventarioTintas() {
    let stockMateriaPrimaFinal : number;
    for (let index = 0; index < this.materiasPrimasRetiradas.length; index++) {
      if (this.materiasPrimasRetiradas[index].Id_Tinta != 2001) {
        this.servicioTintas.srvObtenerListaPorId(this.materiasPrimasRetiradas[index].Id_Tinta).subscribe(datos_tinta => {

          if(this.materiasPrimasRetiradas[index].Id_Tinta == 2001) stockMateriaPrimaFinal = 0;
          else stockMateriaPrimaFinal = datos_tinta.tinta_Stock + this.materiasPrimasRetiradas[index].Cantidad_Devuelta;

          const datosTintaActualizada : any = {
            Tinta_Id : this.materiasPrimasRetiradas[index].Id_Tinta,
            Tinta_Nombre : datos_tinta.tinta_Nombre,
            Tinta_Descripcion : datos_tinta.tinta_Descripcion,
            Tinta_Stock : stockMateriaPrimaFinal,
            Tinta_CodigoHexadecimal : datos_tinta.tinta_CodigoHexadecimal,
            UndMed_Id : datos_tinta.undMed_Id,
            CatMP_Id : datos_tinta.catMP_Id,
            Tinta_Precio : datos_tinta.tinta_Precio,
            TpBod_Id : datos_tinta.tpBod_Id,
            tinta_InvInicial : datos_tinta.tinta_InvInicial,
          }
          this.servicioTintas.srvActualizar(this.materiasPrimasRetiradas[index].Id_Tinta, datosTintaActualizada).subscribe(() => {
            this.mensajeService.mensajeConfirmacion(`Confirmación`, `Registro de devolución creado con éxito!`);
          }, () => this.mensajeService.mensajeError(`Error`, `¡No se ha podido mover el inventario de la materia prima ${this.materiasPrimasRetiradas[index].Nombre}!`));
        });
      }
    }
  }

  // Funcion que va a mover el inventario de bopp con base a la materia prima devuelta
  moverInventarioBopp(){
    let stockMateriaPrimaFinal : number;
    for (let i = 0; i < this.materiasPrimasRetiradas.length; i++) {
      if (this.materiasPrimasRetiradas[i].Id_Bopp != 449) {
        this.boppService.srvObtenerListaPorId(this.materiasPrimasRetiradas[i].Id_Bopp).subscribe(datos_bopp => {
          let bopp : any = [];
          bopp.push(datos_bopp);
          for (const item of bopp) {
            if(this.materiasPrimasRetiradas[i].Id_Bopp == 449) stockMateriaPrimaFinal = 0;
            else stockMateriaPrimaFinal = item.bopP_Stock + this.materiasPrimasRetiradas[i].Cantidad_Devuelta;

            let datosBOPP : any = {
              bopP_Id : item.bopP_Id,
              bopP_Nombre : item.bopP_Nombre,
              bopP_Descripcion : item.bopP_Descripcion,
              bopP_Serial : item.bopP_Serial,
              bopP_CantidadMicras :  item.bopP_CantidadMicras,
              undMed_Id : item.undMed_Id,
              catMP_Id : item.catMP_Id,
              bopP_Precio : item.bopP_Precio,
              tpBod_Id : item.tpBod_Id,
              bopP_FechaIngreso : item.bopP_FechaIngreso,
              bopP_Ancho : item.bopP_Ancho,
              bopP_Stock : stockMateriaPrimaFinal,
              UndMed_Kg : item.undMed_Kg,
              bopP_CantidadInicialKg : item.bopP_CantidadInicialKg,
              Usua_Id : item.usua_Id,
              boppGen_Id : item.boppGen_Id,
              bopP_Hora : item.bopP_Hora,
              bopP_CodigoDoc: item.bopP_CodigoDoc,
              bopP_TipoDoc: item.bopP_TipoDoc,
            }
            this.boppService.srvActualizar(this.materiasPrimasRetiradas[i].Id_Bopp, datosBOPP).subscribe(() => {
              this.mensajeService.mensajeConfirmacion(`Confirmación`, `Registro de devolución creado con éxito!`);
            }, () => this.mensajeService.mensajeError(`Error`, `¡No se ha podido mover el inventario del bopp ${this.materiasPrimasRetiradas[i].Nombre}!`));
          }
        });
      }
    }
  }

  // Funcion que va a limpiar todos los campos
  limpiarTodosCampos(){
    this.load = true;
    this.FormDevolucion.patchValue({ ot : '', MpingresoFecha: this.today, MpObservacion : '', });
    this.materiasPrimas = [];
    this.materiasPrimasRetiradas = [];
  }

  prueba(){
    let ot : any = this.FormDevolucion.value.ot;
    
    this.materiasPrimasRetiradas.forEach(element => {
      if(element.Id_Bopp == 449) element.Id_Bopp = 1;
      this.svcMovEntradas.getEntradasMP(ot, element.Id_MateriaPrima, element.Id_Tinta, element.Id_Bopp).subscribe(datos => {
        if(datos.length > 0) {
          datos.forEach(x => {
            let info : modeloMovimientos_Entradas_MP = {
              Id : x.id,
              MatPri_Id: x.matPri_Id,
              Tinta_Id: x.tinta_Id,
              Bopp_Id: x.bopp_Id,
              Cantidad_Entrada: x.cantidad_Entrada,
              UndMed_Id: x.undMed_Id,
              Precio_RealUnitario: x.precio_RealUnitario,
              Tipo_Entrada: x.tipo_Entrada,
              Codigo_Entrada: x.codigo_Entrada,
              Estado_Id: 19,
              Cantidad_Asignada: (x.cantidad_Asignada - element.Cantidad_Devuelta),
              Cantidad_Disponible: (x.cantidad_Disponible + element.Cantidad_Devuelta),
              Observacion: x.observacion,
              Fecha_Entrada: x.fecha_Entrada,
              Hora_Entrada: x.hora_Entrada,
              Precio_EstandarUnitario: x.precio_EstandarUnitario,
            }
            console.log(info);
            //this.svcMovEntradas.Put(info.Id, info).subscribe(() => { this.mensajeService.mensajeError(`Error`, ``) });
          });
        }
      });
    })
  }
}
