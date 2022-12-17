import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { AsignacionMPService } from 'src/app/Servicios/Asignacion_MateriaPrima/asignacionMP.service';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { DetallesAsignacionService } from 'src/app/Servicios/DetallesAsgMateriaPrima/detallesAsignacion.service';
import { DetallesAsignacionTintasService } from 'src/app/Servicios/DetallesAsgTintas/detallesAsignacionTintas.service';
import { DevolucionesService } from 'src/app/Servicios/DevolucionMateriaPrima/devoluciones.service';
import { DevolucionesMPService } from 'src/app/Servicios/DetallesDevolucionMateriaPrima/devolucionesMP.service';
import { MateriaPrimaService } from 'src/app/Servicios/MateriaPrima/materiaPrima.service';
import { ProcesosService } from 'src/app/Servicios/Procesos/procesos.service';
import { RolesService } from 'src/app/Servicios/Roles/roles.service';
import { TintasService } from 'src/app/Servicios/Tintas/tintas.service';
import { UnidadMedidaService } from 'src/app/Servicios/UnidadMedida/unidad-medida.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-asignacion-materia-prima',
  templateUrl: './asignacion-materia-prima.component.html',
  styleUrls: ['./asignacion-materia-prima.component.css']
})
export class AsignacionMateriaPrimaComponent implements OnInit {

  public FormMateriaPrimaRetiro !: FormGroup;
  public FormMateriaPrimaRetirada !: FormGroup;

  /* Vaiables*/
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  load: boolean; //Variable para validar que aparezca el icono de carga o no
  materiaPrima = []; //Variable que va almacenar el nombre de todas las materias primas existentes en la empresa
  materiasPrimasSeleccionadas : any [] = []; //Variable que va almacenar el nombre de todas las materias primas existentes en la empresa
  materiasPrimasSeleccionada_ID : any [] = []; //Variable que almacenará los ID de las materias primas que se han seleccionado para que no puedan ser elegidas nuevamente
  unidadMedida = []; //Varibale que va a almacenar las unidades de medida registradas en la base de datos
  procesos = []; //Variable que va a almacenar los procesos que tiene la empresa (extrusio, impresion, etc...)
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  error : boolean = false; //Variabla que nos ayudarápara saber si hubo un error
  kgOT : number; //Variable que va alamacenar la cantidad de kilos que se piden en la orden de trabajo
  cantidadAsignada : number = 0; //Variable que va a almacenar la cantidad materia prima asignada de una orden de trabajo
  cantRestante : number = 0; //Variable que va a almacenar la cantidad que resta por asignar de una orden de trabajo
  estadoOT : any; //Variable que va a almacenar el estado de la orden de trabajo

  otImpresion : any [] = []; //Variable que va a almacenar las diferentes ordenes de trabajo que contiene la orden de trabajo de impresión

  constructor(private materiaPrimaService : MateriaPrimaService,
                private unidadMedidaService : UnidadMedidaService,
                  private procesosService : ProcesosService,
                    private rolService : RolesService,
                      private frmBuilderMateriaPrima : FormBuilder,
                        @Inject(SESSION_STORAGE) private storage: WebStorageService,
                          private asignacionMPService : AsignacionMPService,
                            private detallesAsignacionService : DetallesAsignacionService,
                              private bagProServices : BagproService,
                                private tintasService : TintasService,
                                  private detallesAsignacionTintas : DetallesAsignacionTintasService,
                                    private devolucionesService : DevolucionesService,
                                      private devolucionesMPService : DevolucionesMPService, ) {

    this.FormMateriaPrimaRetiro = this.frmBuilderMateriaPrima.group({
      OTRetiro : [null, Validators.required],
      OTImp : [''],
      FechaRetiro : [this.today, Validators.required],
      Maquina : [null, Validators.required],
      kgOt : [null, Validators.required],
      ObservacionRetiro : [''],
    });

    this.FormMateriaPrimaRetirada = this.frmBuilderMateriaPrima.group({
      MpIdRetirada : ['', Validators.required],
      MpNombreRetirada: ['', Validators.required],
      MpCantidadRetirada : ['', Validators.required],
      MpUnidadMedidaRetirada: ['', Validators.required],
      MpStockRetirada: ['', Validators.required],
      ProcesoRetiro : ['', Validators.required],
      Categoria : ['', Validators.required],
    });

    this.load = true;
  }

  ngOnInit(): void {
    this.lecturaStorage();
    this.obtenerUnidadMedida();
    this.obtenerProcesos();
    this.obtenerMateriaPrima();
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

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = '$1,';
    return number.toString().replace(exp,rep);
  }

  // Funcion que limpia los todos los campos de la vista
  LimpiarCampos() {
    this.FormMateriaPrimaRetirada.reset();
    this.FormMateriaPrimaRetiro = this.frmBuilderMateriaPrima.group({
      OTRetiro : null,
      OTImp : null,
      FechaRetiro : this.today,
      Maquina : null,
      kgOt : null,
      ObservacionRetiro : null,
    });
    this.cantidadAsignada = 0;
    this.cantRestante = 0;
    this.kgOT = 0;
    this.load = true;
    this.materiasPrimasSeleccionada_ID = [];
    this.materiasPrimasSeleccionadas = [];
    this.error = false;
  }

  //Funcion que limpiará los campos de la materia pirma entrante
  limpiarCamposMP(){
    this.FormMateriaPrimaRetirada.reset();
  }

  //Funcion que va almacenar todas las unidades de medida existentes en la empresa
  obtenerUnidadMedida(){
    this.unidadMedidaService.srvObtenerLista().subscribe(datos_unidadesMedida => {
      for (let index = 0; index < datos_unidadesMedida.length; index++) {
        this.unidadMedida.push(datos_unidadesMedida[index].undMed_Id);
      }
    });
  }

  //Funcion que se encagará de obtener los procesos de la empresa
  obtenerProcesos(){
    this.procesosService.srvObtenerLista().subscribe(datos_procesos => {
      for (let index = 0; index < datos_procesos.length; index++) {
        if (datos_procesos[index].proceso_Id != 'TINTAS') this.procesos.push(datos_procesos[index]);
      }
    });
  }

  //Funcion que va a recorrer las materias primas para almacenar el nombre de todas
  obtenerMateriaPrima(){
    this.materiaPrimaService.getMpTintaBopp().subscribe(datos_materiaPrimas => {
      for (let i = 0; i < datos_materiaPrimas.length; i++) {
        if (datos_materiaPrimas[i].categoria != 6) this.materiaPrima.push(datos_materiaPrimas[i]);
        this.materiaPrima.sort((a,b) => a.nombre.localeCompare(b.nombre));
      }
    });
  }

  // Funcion que va a consultar la orden de trabajo para saber que cantidad de materia prima se ha asignado y que cantidad se ha devuelto con respecto a la cantidad que se debe hacer en kg
  infoOT(){
    this.error = false;
    let ot : string = this.FormMateriaPrimaRetiro.value.OTRetiro;
    this.cantRestante = 0;
    this.kgOT = 0;
    let cantAsig : number = 0; //Variable que almacena la cantidad de materia prima que se ha asignado hasta el momento
    let devolucionMP : number = 0; // Varibale que almacenará la cantidad de materia prima devuelta por la ot

    this.load = false;
    this.bagProServices.srvObtenerListaClienteOT_Item(ot).subscribe(datos_procesos => {
      if (datos_procesos.length != 0) {
        for (let index = 0; index < datos_procesos.length; index++) {
          let adicional : number = datos_procesos[index].datosotKg * 0.02;
          this.kgOT = datos_procesos[index].datosotKg + adicional;
          this.estadoOT = datos_procesos[index].estado;
          this.FormMateriaPrimaRetiro.setValue({
            OTRetiro : this.FormMateriaPrimaRetiro.value.OTRetiro,
            OTImp : this.FormMateriaPrimaRetiro.value.OTImp,
            FechaRetiro : this.FormMateriaPrimaRetiro.value.FechaRetiro,
            Maquina : this.FormMateriaPrimaRetiro.value.Maquina,
            kgOt : parseFloat(datos_procesos[index].datosotKg + adicional),
            ObservacionRetiro : this.FormMateriaPrimaRetiro.value.ObservacionRetiro,
          });
          this.asignacionMPService.srvObtenerListaPorOt(ot).subscribe(datos_asignaciones => {
            if (datos_asignaciones.length != 0) {
              for (let index = 0; index < datos_asignaciones.length; index++) {
                if (datos_asignaciones[index].asigMP_OrdenTrabajo == ot) {
                  this.detallesAsignacionService.srvObtenerListaPorAsigId(datos_asignaciones[index].asigMp_Id).subscribe(datos_asignacionMp => {
                    for (let i = 0; i < datos_asignacionMp.length; i++) {
                      cantAsig += datos_asignacionMp[i].dtAsigMp_Cantidad;
                    }
                  });
                }
              }
            }
          }, error => {
            this.load = true;
            this.error = true;
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              html:
              `<b>¡Error al consultar las asignaciones de la OT ${ot}!</b><hr> ` +
              `<spam style="color : #f00;">${error.message}</spam> `,
              showCloseButton: true,
            });
          });
          this.devolucionesService.srvObtenerListaPorOT(ot).subscribe(datos_devoluciones => {
            for (let i = 0; i < datos_devoluciones.length; i++) {
              this.devolucionesMPService.srvObtenerListaPorDevId(datos_devoluciones[i].devMatPri_Id).subscribe(datos_devolucionesMP => {
                for (let j = 0; j < datos_devolucionesMP.length; j++) {
                  if ((datos_devolucionesMP[j].tinta_Id == null || datos_devolucionesMP[j].tinta_Id == 2001) && datos_devolucionesMP[j].matPri_Id != 84 && (datos_devolucionesMP[j].bopp_Id == null || datos_devolucionesMP[j].bopp_Id == 449)) {
                    devolucionMP += datos_devolucionesMP[j].dtDevMatPri_CantidadDevuelta;
                    console.log(datos_devolucionesMP[j]);
                  }
                }
              });
            }
          }, error => {
            this.load = true;
            this.error = true;
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              html:
              `<b>¡Error al consultar las devoluciones de la OT ${ot}!</b><hr> ` +
              `<spam style="color : #f00;">${error.message}</spam> `,
              showCloseButton: true,
            });
          });
          setTimeout(() => {
            this.cantRestante = (this.kgOT - cantAsig) + devolucionMP;
            this.load = true;
          }, 1500);
          break;
        }
      } else {
        Swal.fire(`La orden de trabajo N° ${ot} no se encuentra registrada en BagPro`);
        this.load = true;
      }
    }, error => {
      this.error = true;
      this.load = true;
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        html:
        `<b>¡Error al consultar la OT ${ot}!</b><hr> ` +
        `<spam style="color : #f00;">${error.message}</spam> `,
        showCloseButton: true,
      });
    });
  }

  //Funcion que va a mostrar el nombre de la materia prima
  cambiarNombreMateriaPrima(dato : number){
    let id : number;
    if (dato == 1) id = this.FormMateriaPrimaRetirada.value.MpIdRetirada;
    else if (dato == 2) id = this.FormMateriaPrimaRetirada.value.MpNombreRetirada;
    this.materiaPrimaService.getInfoMpTintaBopp(id).subscribe(datos_materiaPrima => {
      for (let i = 0; i < datos_materiaPrima.length; i++) {
        if (datos_materiaPrima[i].categoria != 6) {
          this.FormMateriaPrimaRetirada = this.frmBuilderMateriaPrima.group({
            MpIdRetirada : datos_materiaPrima[i].id,
            MpNombreRetirada: datos_materiaPrima[i].nombre,
            MpCantidadRetirada : 0,
            MpUnidadMedidaRetirada: datos_materiaPrima[i].undMedida,
            MpStockRetirada: datos_materiaPrima[i].stock,
            ProcesoRetiro : '',
            Categoria : datos_materiaPrima[i].categoria,
          });
        }
      }
    }, error => {
      this.load = true;
      this.error = true;
      this.limpiarCamposMP();
    });
  }

  // Funcion para colocar la materia prima en la tabla
  validarCamposVaciosMPRetirada(){
    let categoria : number = this.FormMateriaPrimaRetirada.value.Categoria;
    if (this.FormMateriaPrimaRetirada.valid) {
      if (this.FormMateriaPrimaRetirada.value.MpCantidadRetirada != 0) {
        if (!this.materiasPrimasSeleccionada_ID.includes(this.FormMateriaPrimaRetirada.value.MpIdRetirada)){
          if (this.FormMateriaPrimaRetirada.value.ProcesoRetiro != '') {
            if (this.FormMateriaPrimaRetirada.value.MpCantidadRetirada <= this.FormMateriaPrimaRetirada.value.MpStockRetirada) {
              let info : any = {
                Id : this.FormMateriaPrimaRetirada.value.MpIdRetirada,
                Id_Mp: 84,
                Id_Tinta: 2001,
                Nombre : this.FormMateriaPrimaRetirada.value.MpNombreRetirada,
                Cantidad : this.FormMateriaPrimaRetirada.value.MpCantidadRetirada,
                Und_Medida : this.FormMateriaPrimaRetirada.value.MpUnidadMedidaRetirada,
                Proceso : this.FormMateriaPrimaRetirada.value.ProcesoRetiro,
              }
              if (categoria == 7 || categoria == 8 || categoria == 13) info.Id_Tinta = info.Id;
              else if (categoria == 1 || categoria == 2 || categoria == 3 || categoria == 4 || categoria == 5 || categoria == 9 || categoria == 10) info.Id_Mp = info.Id;
              this.materiasPrimasSeleccionada_ID.push(this.FormMateriaPrimaRetirada.value.MpIdRetirada);
              this.materiasPrimasSeleccionadas.push(info);
              this.FormMateriaPrimaRetirada.reset();
            } else {
              Swal.fire({
                icon: 'warning',
                title: 'Oops...',
                html:
                `<b>¡La cantidad a asignar supera a la cantidad en stock!</b><hr> `,
              });
            }
          } else {
            Swal.fire({
              icon: 'warning',
              title: 'Oops...',
              html:
              `<b>¡Debe seleccionar hacia que proceso va la materia prima!</b><hr> `,
            });
          }
        } else {
          Swal.fire({
            icon: 'warning',
            title: 'Oops...',
            html:
            `<b>¡La materia prima ${this.FormMateriaPrimaRetirada.value.MpNombreRetirada} ya ha sido seleccionada!</b><hr> `,
          });
        }
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Oops...',
          html:
          `<b>¡La cantidad a asignar debe ser mayor a cero (0)!</b><hr> `,
        });
      }
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Oops...',
        html:
        `<b>¡Hay campos de la materia prima vacios!</b><hr> `,
      });
    }
  }

  // Funcion que va a quitar la materia prima
  quitarMateriaPrima(data : any){
    Swal.fire({
      title: '¿Estás seguro de eliminar la Materia Prima de la Asignación?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        for (let i = 0; i < this.materiasPrimasSeleccionadas.length; i++) {
          if (this.materiasPrimasSeleccionadas[i].Id == data.Id) {
            this.materiasPrimasSeleccionadas.splice(i, 1);
            for (let j = 0; j < this.materiasPrimasSeleccionada_ID.length; j++) {
              if (data.Id == this.materiasPrimasSeleccionada_ID[j]) this.materiasPrimasSeleccionada_ID.splice(j, 1);
            }
            const Toast = Swal.mixin({
              toast: true,
              position: 'center',
              showConfirmButton: false,
              timer: 1500,
              timerProgressBar: true,
              didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer)
                toast.addEventListener('mouseleave', Swal.resumeTimer)
              }
            });
            Toast.fire({
              icon: 'success',
              title: `¡Se ha quitado la Materia Prima ${data.Nombre} de la Asignación!`
            });
          }
        }
      }
    });
  }

  // Funcion que hará validaciones antes de realizar la asignación
  validarCamposVaciosRetirada(){
    let ot : any = this.FormMateriaPrimaRetiro.value.OTRetiro;
    let maquina : number = this.FormMateriaPrimaRetiro.value.Maquina
    if (this.FormMateriaPrimaRetiro.valid) {
      if (this.materiasPrimasSeleccionadas.length != 0){
        if (maquina >= 1 && maquina != 0) this.asignacionMateriaPrima();
        else {
          Swal.fire({
            icon: 'warning',
            title: 'Oops...',
            html:
            `<b>¡El numero de la maquina no es valido!</b><hr> `,
          });
        }
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Oops...',
          html:
          `<b>¡Debe selccionar minimo una materia prima para crear la asignación!</b><hr> `,
        });
      }
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Oops...',
        html:
        `<b>¡Hay campos vaios!</b><hr> `,
      });
    }
  }

  //Funcion que asignará la materia prima a una Orden de trabajo y Proceso y lo guardará en la base de datos
  asignacionMateriaPrima(){
    this.infoOT();
    let idOrdenTrabajo : number = this.FormMateriaPrimaRetiro.value.OTRetiro;
    if (!this.error) {
      if (this.estadoOT == null || this.estadoOT == '' || this.estadoOT == '0') {
        setTimeout(() => {
          this.load = false;
          if (this.cantidadAsignada <= this.cantRestante) this.crearAsignacion();
          else {
            this.load = true;
            if (this.ValidarRol != 1) {
              Swal.fire({
                icon: 'warning',
                title: 'Advertencia',
                html:
                `<b>¡La cantidad a asignar supera el limite de Kg permitidos para la OT ${idOrdenTrabajo}!</b><hr> ` +
                `<spam>Debe solicitar permisos a un usuario administrador.</spam>`,
              })
            } else if (this.ValidarRol == 1) {
              Swal.fire({
                icon: 'warning',
                title: 'Advertencia',
                html:
                `<b>¡La cantidad a asignar supera el limite de Kg permitidos para la OT ${idOrdenTrabajo}!</b><hr> ` +
                `<spam>¿Desea asignar de todas formas?</spam>`,
                showCloseButton: true,
                showCancelButton: true,
                showConfirmButton: true,
                showDenyButton: true,
                confirmButtonText: 'Si',
                denyButtonText: 'No'
              }).then((result) => {
                if (result.isConfirmed) this.crearAsignacion();
              });
            }
          }
        }, 2000);
      } else if (this.estadoOT == 4 || this.estadoOT == 1) {
        Swal.fire({
          icon: 'warning',
          title: 'Oops...',
          html:`<b>¡No es podible asignar a esta orden de trabajo, la OT ${idOrdenTrabajo} se encuentra cerrada.!</b><hr> `,
        });
      }
    }
  }

  // Crear Asignacion
  crearAsignacion(){
    this.load = false;
    const datosAsignacion : any = {
      AsigMP_OrdenTrabajo : this.FormMateriaPrimaRetiro.value.OTRetiro,
      AsigMp_FechaEntrega : this.today,
      AsigMp_Observacion : this.FormMateriaPrimaRetiro.value.ObservacionRetiro,
      Estado_Id : 13,
      AsigMp_Maquina : this.FormMateriaPrimaRetiro.value.Maquina,
      Usua_Id : this.storage_Id,
      Estado_OrdenTrabajo : 14,
      AsigMp_Hora : moment().format('H:mm:ss'),
    }
    this.asignacionMPService.srvGuardar(datosAsignacion).subscribe(datos_asignacionCreada => { this.obtenerUltimoIdAsignacaion(); }, error => {
      this.error = true;
      this.load = true;
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        html:
        '<b>¡Error al crear la asignación de materia prima!</b><hr> ' +
        `<spam style="color : #f00;">${error.message}</spam> `,
        showCloseButton: true,
      });
    });
  }

  //Funcion que va a buscar y obtener el id de la ultima asignacion
  obtenerUltimoIdAsignacaion(){
    if (!this.error) {
      this.asignacionMPService.srvObtenerUltimaAsignacion().subscribe(datos_asignaciones => { this.obtenerProcesoId(datos_asignaciones.asigMp_Id); }, error => {
        this.error = true;
        this.load = true;
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          html:
          '<b>¡No se pudo extraer el ultimo Id de asignación!</b><hr> ' +
          `<spam style="color : #f00;">${error.message}</spam> `,
          showCloseButton: true,
        });
      });
    }
  }

  // Funcion que se encargará de consultar el Id del proceso y hacer el ingreso de las materia primas asignadas
  obtenerProcesoId(asigncaion : number){
    if (!this.error) {
      for (let index = 0; index < this.materiasPrimasSeleccionadas.length; index++) {
        this.procesosService.srvObtenerLista().subscribe(datos_proceso => {
          for (let i = 0; i < datos_proceso.length; i++) {
            if (datos_proceso[i].proceso_Nombre == this.materiasPrimasSeleccionadas[index].Proceso) {
              let idMateriaPrima = this.materiasPrimasSeleccionadas[index].Id;
              let cantidadMateriaPrima = this.materiasPrimasSeleccionadas[index].Cantidad;
              let presentacionMateriaPrima = this.materiasPrimasSeleccionadas[index].Und_Medida;
              if (this.materiasPrimasSeleccionadas[index].Id_Mp == 84 && this.materiasPrimasSeleccionadas[index].Id_Tinta != 2001) {
                const datosDetallesAsignacionTintas : any = {
                  AsigMp_Id : asigncaion,
                  Tinta_Id : idMateriaPrima,
                  DtAsigTinta_Cantidad : cantidadMateriaPrima,
                  UndMed_Id : presentacionMateriaPrima,
                  Proceso_Id : datos_proceso[i].proceso_Id,
                }
                this.detallesAsignacionTintas.srvGuardar(datosDetallesAsignacionTintas).subscribe(datos_asignacionTintas => {}, error => {
                  this.error = true;
                  this.load = true;
                  Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    html:
                    `<b>¡Error al insertar la tinta asignada ${this.materiasPrimasSeleccionadas[index].Nombre}!</b><hr> ` +
                    `<spam style="color : #f00;">${error.message}</spam> `,
                    showCloseButton: true,
                  });
                });
                this.moverInventarioTintas(idMateriaPrima, cantidadMateriaPrima);
              } else if (this.materiasPrimasSeleccionadas[index].Id_Mp != 84 && this.materiasPrimasSeleccionadas[index].Id_Tinta == 2001) {
                const datosDetallesAsignacion : any = {
                  AsigMp_Id : asigncaion,
                  MatPri_Id : idMateriaPrima,
                  DtAsigMp_Cantidad : cantidadMateriaPrima,
                  UndMed_Id : presentacionMateriaPrima,
                  Proceso_Id : datos_proceso[i].proceso_Id,
                }
                this.detallesAsignacionService.srvGuardar(datosDetallesAsignacion).subscribe(datos_asignacionDtallada => {}, error => {
                  this.error = true;
                  this.load = true;
                  Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    html:
                    `<b>¡Error al insertar la materia prima asignada ${this.materiasPrimasSeleccionadas[index].Nombre}!</b><hr> ` +
                    `<spam style="color : #f00;">${error.message}</spam> `,
                    showCloseButton: true,
                  });
                });
                this.moverInventarioMpPedida(idMateriaPrima, cantidadMateriaPrima);
              }
            }
          }
        }, error => {
          this.error = true;
          this.load = true;
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            html:
            '<b>¡Error al consultar el proceso!</b><hr> ' +
            `<spam style="color : #f00;">${error.message}</spam> `,
            showCloseButton: true,
          });
        });
      }
      setTimeout(() => { if (!this.error) this.asignacionExitosa(); }, 3500);
    }
  }

  // Funcion que va a enviar un mensaje de confirmación indicando que la asignacion se creó bien
  asignacionExitosa() {
    if (!this.error) {
      Swal.fire({
        icon: 'success',
        title: '¡Asignacón Creada Satisfactoriamente!',
        html:
        `<b>¡La asignación ha sido creada de manera satisfactoria!</b><hr> `,
        showCloseButton: true,
      });
      this.LimpiarCampos();
    }
  }

  //Funcion que moverá el inventario de materia prima con base a la materia prima saliente
  moverInventarioMpPedida(idMateriaPrima : number, cantidadMateriaPrima : number){
    if (!this.error) {
      let stockMateriaPrimaFinal : number;
      this.materiaPrimaService.srvObtenerListaPorId(idMateriaPrima).subscribe(datos_materiaPrima => {
        stockMateriaPrimaFinal = datos_materiaPrima.matPri_Stock - cantidadMateriaPrima;
        const datosMP : any = {
          MatPri_Id : idMateriaPrima,
          MatPri_Nombre : datos_materiaPrima.matPri_Nombre,
          MatPri_Descripcion : datos_materiaPrima.matPri_Descripcion,
          MatPri_Stock : stockMateriaPrimaFinal,
          UndMed_Id : datos_materiaPrima.undMed_Id,
          CatMP_Id : datos_materiaPrima.catMP_Id,
          MatPri_Precio : datos_materiaPrima.matPri_Precio,
          TpBod_Id : datos_materiaPrima.tpBod_Id,
        }
        this.materiaPrimaService.srvActualizar(idMateriaPrima, datosMP).subscribe(datos_mp_creada => { }, error => {
          this.error = true;
          this.load = true;
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            html:
            `<b>¡Error al mover el invenatario de la materia prima ${datos_materiaPrima.matPri_Nombre}!</b><hr> ` +
            `<spam style="color : #f00;">${error.message}</spam> `,
            showCloseButton: true,
          });
        });
      });
    }
  }

  //Funcion que va a mover el inventario de una tinta
  moverInventarioTintas(idMateriaPrima : number, cantidad : number){
    if(!this.error) {
      this.tintasService.srvObtenerListaPorId(idMateriaPrima).subscribe(datos_tintas => {
        const datosTintas : any = {
          Tinta_Id: idMateriaPrima,
          Tinta_Nombre : datos_tintas.tinta_Nombre,
          Tinta_Descripcion : datos_tintas.tinta_Descripcion,
          Tinta_CodigoHexadecimal : datos_tintas.tinta_CodigoHexadecimal,
          Tinta_Stock : datos_tintas.tinta_Stock - cantidad,
          UndMed_Id : datos_tintas.undMed_Id,
          Tinta_Precio : datos_tintas.tinta_Precio,
          CatMP_Id : datos_tintas.catMP_Id,
          TpBod_Id : datos_tintas.tpBod_Id,
          Tinta_InvInicial : datos_tintas.tinta_InvInicial,
          Tinta_Fecha : datos_tintas.tinta_FechaIngreso,
          Tinta_Hora : datos_tintas.tinta_Hora,
        }
        this.tintasService.srvActualizar(idMateriaPrima, datosTintas).subscribe(datos_tintasActualizada => { }, error => {
          this.error = true;
          this.load = true;
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            html:
            `<b>¡Error al mover el invenatario de la tinta ${datos_tintas.tinta_Nombre}!</b><hr> ` +
            `<spam style="color : #f00;">${error.message}</spam> `,
            showCloseButton: true,
          });
        });
      });
    }
  }

  // Funcion que treará la informacion de las ordenes de trabajo de impresion
  infoOTImpresion(){
    let otImp : string = `${this.FormMateriaPrimaRetiro.value.OTImp}`;
    this.bagProServices.consultarOTImpresion(otImp).subscribe(datos_otImp => {
      for (let i = 0; i < datos_otImp.length; i++) {
        if (datos_otImp[i].ot.trim() != '') this.otImpresion.push(datos_otImp[i].ot.trim());
      }
    });
  }
}
