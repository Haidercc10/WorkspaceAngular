import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { DetallesAsignacionService } from 'src/app/Servicios/DetallesAsgMateriaPrima/detallesAsignacion.service';
import { DevolucionesService } from 'src/app/Servicios/DevolucionMateriaPrima/devoluciones.service';
import { DevolucionesMPService } from 'src/app/Servicios/DetallesDevolucionMateriaPrima/devolucionesMP.service';
import { EntradaBOPPService } from 'src/app/Servicios/BOPP/entrada-BOPP.service';
import { MateriaPrimaService } from 'src/app/Servicios/MateriaPrima/materiaPrima.service';
import { TintasService } from 'src/app/Servicios/Tintas/tintas.service';
import { MessageService } from 'primeng/api';

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

  constructor(private materiaPrimaService : MateriaPrimaService,
                @Inject(SESSION_STORAGE) private storage: WebStorageService,
                  private frmBuilderMateriaPrima : FormBuilder,
                    private devolucionService : DevolucionesService,
                      private devolucionMPService : DevolucionesMPService,
                        private servicioTintas : TintasService,
                          private detallesAsignacionService : DetallesAsignacionService,
                            private boppService : EntradaBOPPService,
                              private messageService: MessageService) {

    this.FormDevolucion = this.frmBuilderMateriaPrima.group({
      ot : ['', Validators.required],
      MpingresoFecha: [this.today, Validators.required],
      MpObservacion : ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.lecturaStorage();
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.storage.get('Id');
    this.storage_Nombre = this.storage.get('Nombre');
    this.ValidarRol = this.storage.get('Rol');
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = '$1,';
    return number.toString().replace(exp,rep);
  }

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
    }, error => { this.mostrarAdvertencia(`Error`, `¡No hay materias primas asignadas a la OT ${ot}!`); });
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
      }, error => { this.mostrarError(`Error`, `¡Error al obtener las devoluciones de la OT ${ot}!`); });
      this.load = true;
    }, 2500);
  }

  //Funcion que va a seleccionar una materia prima
  llenarMateriaPrimaAIngresar(item : any){
    this.load = false;
    for (let i = 0; i < this.materiasPrimasRetiradas.length; i++) {
      if (this.materiasPrimasRetiradas[i].Id == item.Id) this.materiasPrimasRetiradas.splice(i, 1);
    }
    this.materiasPrimas.sort((a,b) => Number(a.Id) - Number(b.Id) );
    setTimeout(() => { this.load = true; }, 50);
  }

  // Funcion que seleccionará y colocará todos los MateriaPrima que se van a insertar
  seleccionarTodosMateriaPrima(item : any){
    this.load = false;
    this.materiasPrimasRetiradas = [];
    this.materiasPrimas.sort((a,b) => Number(a.Id) - Number(b.Id) );
    setTimeout(() => { this.load = true; }, 50);
  }

  //Funcion que va a quitar lo MateriaPrima que se van a insertar
  quitarMateriaPrimaAIngresar(item : any){
    this.load = false;
    for (let i = 0; i < this.materiasPrimas.length; i++) {
      if (this.materiasPrimas[i].Id == item.Id) this.materiasPrimas.splice(i, 1);
    }
    this.materiasPrimasRetiradas.sort((a,b) => Number(a.Id) - Number(b.Id) );
    setTimeout(() => { this.load = true; }, 50);
  }

  // Funcion que va a quitar todos los MateriaPrima que se van a insertar
  quitarTodosMateriaPrima(item : any){
    this.load = false;
    for (let index = 0; index < item.length; index++) {
      if (item[index].Exits == true) this.materiasPrimas.push(item[index]);
    }
    this.materiasPrimasRetiradas.sort((a,b) => Number(a.Id) - Number(b.Id) );
    this.materiasPrimas = [];
    setTimeout(() => { this.load = true; }, 50);
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

      this.devolucionService.srvGuardar(datosDevolucion).subscribe(datos_DevolucionCreada => { this.creacionDevolucionMateriaPrima();
      }, error => { this.mostrarError(`Error`, `¡Error al crear la devolución de materia prima!`); });
    } else this.mostrarAdvertencia(`Advertencia`, `¡Debe seleccionar minimo una materia prima para devolver!`);
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
          this.devolucionMPService.srvGuardar(datosDevolucionMp).subscribe(datos_recuperadoMpCreada => {
          }, error => { this.mostrarError(`Error`, `¡No se ha podido crear la devolución de la materia prima ${this.materiasPrimasRetiradas[i].Nombre}!`); });
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
          this.materiaPrimaService.srvActualizar(this.materiasPrimasRetiradas[index].Id_MateriaPrima, datosMP).subscribe(datos_mp_creada => {
            this.mostrarConfirmacion(`Confirmación`, `Registro de devolución creado con éxito`);
          }, error => { this.mostrarError(`Error`, `¡No se ha podido mover el inventario de la materia prima ${this.materiasPrimasRetiradas[index].Nombre}!`); });
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
          this.servicioTintas.srvActualizar(this.materiasPrimasRetiradas[index].Id_Tinta, datosTintaActualizada).subscribe(datos_mp_creada => {
            this.mostrarConfirmacion(`Confirmación`, `Registro de devolución creado con éxito!`);
          }, error => { this.mostrarError(`Error`, `¡No se ha podido mover el inventario de la materia prima ${this.materiasPrimasRetiradas[index].Nombre}!`); });
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
              Usua_Id : item.usua_Id
            }
            this.boppService.srvActualizar(this.materiasPrimasRetiradas[i].Id_Bopp, datosBOPP).subscribe(datos_boppActualizado => {
              this.mostrarConfirmacion(`Confirmación`, `Registro de devolución creado con éxito!`);
            }, error => { this.mostrarError(`Error`, `¡No se ha podido mover el inventario del bopp ${this.materiasPrimasRetiradas[i].Nombre}!`); });
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

    /** Mostrar mensaje de confirmación  */
  mostrarConfirmacion = (mensaje : any, titulo?: any) => this.messageService.add({severity: 'success', summary: mensaje,  detail: titulo});

  /** Mostrar mensaje de error  */
  mostrarError = (mensaje : any, titulo?: any) => this.messageService.add({severity:'error', summary: mensaje, detail: titulo});

  /** Mostrar mensaje de advertencia */
  mostrarAdvertencia = (mensaje : any, titulo?: any) => this.messageService.add({severity:'warn', summary: mensaje, detail: titulo});
}
