import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ShepherdService } from 'angular-shepherd';
import moment from 'moment';
import { MessageService } from 'primeng/api';
import { AsignacionMPService } from 'src/app/Servicios/Asignacion_MateriaPrima/asignacionMP.service';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { DetSolicitudMP_ExtrusionService } from 'src/app/Servicios/DetSolicitudMP_Extrusion/DetSolicitudMP_Extrusion.service';
import { DetallesAsignacionService } from 'src/app/Servicios/DetallesAsgMateriaPrima/detallesAsignacion.service';
import { DetallesAsignacionTintasService } from 'src/app/Servicios/DetallesAsgTintas/detallesAsignacionTintas.service';
import { MateriaPrimaService } from 'src/app/Servicios/MateriaPrima/materiaPrima.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { ProcesosService } from 'src/app/Servicios/Procesos/procesos.service';
import { SolicitudMP_ExtrusionService } from 'src/app/Servicios/SolicitudMP_Extrusion/SolicitudMP_Extrusion.service';
import { TintasService } from 'src/app/Servicios/Tintas/tintas.service';
import { UnidadMedidaService } from 'src/app/Servicios/UnidadMedida/unidad-medida.service';
import { AppComponent } from 'src/app/app.component';
import { defaultStepOptions, stepsAsignacionMateriaPrima as defaultSteps } from 'src/app/data';

@Component({
  selector: 'app-SolicitudMP_Extrusion',
  templateUrl: './SolicitudMP_Extrusion.component.html',
  styleUrls: ['./SolicitudMP_Extrusion.component.css']
})
export class SolicitudMP_ExtrusionComponent implements OnInit {

  public FormMateriaPrimaRetiro !: FormGroup;
  public FormMateriaPrimaRetirada !: FormGroup;

  /* Variables*/
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  load: boolean = true; //Variable para validar que aparezca el icono de carga o no
  materiaPrima = []; //Variable que va almacenar el nombre de todas las materias primas existentes en la empresa
  materiasPrimasSeleccionadas : any [] = []; //Variable que va almacenar el nombre de todas las materias primas existentes en la empresa
  materiasPrimasSeleccionada_ID : any [] = []; //Variable que almacenará los ID de las materias primas que se han seleccionado para que no puedan ser elegidas nuevamente
  unidadMedida = []; //Varibale que va a almacenar las unidades de medida registradas en la base de datos
  procesos = []; //Variable que va a almacenar los procesos que tiene la empresa (extrusio, impresion, etc...)
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  error : boolean = false; //Variabla que nos ayudarápara saber si hubo un error
  kgOT : number; //Variable que va alamacenar la cantidad de kilos que se piden en la orden de trabajo
  cantRestante : number = 0; //Variable que va a almacenar la cantidad que resta por asignar de una orden de trabajo
  estadoOT : any; //Variable que va a almacenar el estado de la orden de trabajo
  infoOrdenTrabajo : any [] = []; //Variable en la que se almacenará la información de la orden de trabajo consultada
  categoriasMP : any [] = []; //Variable que almcanará las categorias de la tabla Materia_Prima
  categoriasTintas : any [] = []; //Variable que almcanará las categorias de la tabla Tintas

  otImpresion : any [] = []; //Variable que va a almacenar las diferentes ordenes de trabajo que contiene la orden de trabajo de impresión
  categoriasSeleccionadas : any [] = [];
  soloTintas : boolean = false;
  mpSeleccionada : any = [];
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro

  constructor(private materiaPrimaService : MateriaPrimaService,
                private unidadMedidaService : UnidadMedidaService,
                  private procesosService : ProcesosService,
                    private frmBuilderMateriaPrima : FormBuilder,
                      private AppComponent : AppComponent,
                        private asignacionMPService : AsignacionMPService,
                          private detallesAsignacionService : DetallesAsignacionService,
                            private bagProServices : BagproService,
                              private tintasService : TintasService,
                                private detallesAsignacionTintas : DetallesAsignacionTintasService,
                                  private messageService: MessageService,
                                    private shepherdService: ShepherdService,
                                      private mensajeService : MensajesAplicacionService,
                                        private servicioSolicitudMpExt : SolicitudMP_ExtrusionService,
                                          private servicioDetSolicitudMpExt : DetSolicitudMP_ExtrusionService) {

    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
    this.FormMateriaPrimaRetiro = this.frmBuilderMateriaPrima.group({
      OTRetiro : [null, Validators.required],
      OTImp : [''],
      FechaRetiro : [this.today, Validators.required],
      Maquina : [null, Validators.required],
      kgOt : [null, Validators.required],
      ProcesoRetiro : ['', Validators.required],
      ObservacionRetiro : [''],
    });

    this.FormMateriaPrimaRetirada = this.frmBuilderMateriaPrima.group({
      MpIdRetirada : ['', Validators.required],
      MpNombreRetirada: ['', Validators.required],
      MpCantidadRetirada : [null, Validators.required],
      MpUnidadMedidaRetirada: ['', Validators.required],
      Categoria : ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.lecturaStorage();
    this.obtenerUnidadMedida();
    this.obtenerProcesos();
    this.obtenerMateriaPrima();
    this.consultarCategorias();
    this.FormMateriaPrimaRetiro.patchValue({ ProcesoRetiro : 'EXT' });
    this.FormMateriaPrimaRetirada.patchValue({ MpUnidadMedidaRetirada : 'Kg' })
  }

  // Funcion que va a hacer que se inicie el tutorial in-app
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
  LimpiarCampos() {
    this.FormMateriaPrimaRetirada.reset();
    this.FormMateriaPrimaRetiro.reset();
    this.FormMateriaPrimaRetiro.patchValue({ FechaRetiro : this.today, });
    this.cantRestante = 0;
    this.kgOT = 0;
    this.load = true;
    this.materiasPrimasSeleccionada_ID = [];
    this.materiasPrimasSeleccionadas = [];
    this.error = false;
    this.soloTintas = false;
    this.categoriasSeleccionadas = [];
    this.infoOrdenTrabajo = [];
  }

  //Funcion que limpiará los campos de la materia pirma entrante
  limpiarCamposMP = () => this.FormMateriaPrimaRetirada.reset();

  //Funcion que va almacenar todas las unidades de medida existentes en la empresa
  obtenerUnidadMedida = () => this.unidadMedidaService.srvObtenerLista().subscribe(data => { this.unidadMedida = data });

  //Funcion que se encagará de obtener los procesos de la empresa
  obtenerProcesos = () => this.procesosService.srvObtenerLista().subscribe(data => this.procesos = data.filter((item) => item.proceso_Id != 'TINTAS'));

  //Funcion que va a recorrer las materias primas para almacenar el nombre de todas
  obtenerMateriaPrima(){
    this.materiaPrimaService.getMpTintaBopp().subscribe(data => {
      this.materiaPrima = data.filter((item) => item.categoria != 6)
      this.materiaPrima.sort((a,b) => a.nombre.localeCompare(b.nombre));
    });
  }

  // Funcion que va a consultar las categorias de las tablas Materia_Prima, Tintas y BOPP
  consultarCategorias(){
    this.materiaPrimaService.GetCategoriasMateriaPrima().subscribe(datos => this.categoriasMP = datos);
    this.tintasService.GetCategoriasTintas().subscribe(datos => this.categoriasTintas = datos);
  }

  // Funcion que va a consultar la orden de trabajo para saber que cantidad de materia prima se ha asignado y que cantidad se ha devuelto con respecto a la cantidad que se debe hacer en kg
  infoOT(){
    this.error = false;
    let ot : string = this.FormMateriaPrimaRetiro.value.OTRetiro;
    this.bagProServices.srvObtenerListaClienteOT_Item(ot).subscribe(datos_procesos => {
      if (datos_procesos.length != 0) {
        for (let index = 0; index < datos_procesos.length; index++) {
          let adicional : number = datos_procesos[index].datosotKg * 0.05;
          this.kgOT = datos_procesos[index].datosotKg + adicional;
          this.estadoOT = datos_procesos[index].estado;
          this.FormMateriaPrimaRetiro.patchValue({ kgOt : parseFloat(datos_procesos[index].datosotKg + adicional), });
          this.detallesAsignacionService.getMateriasPrimasAsignadas(parseInt(ot)).subscribe(datos_asignacion => {
            this.cantRestante = this.kgOT - datos_asignacion;
            this.infoOrdenTrabajo = [{
              ot : ot,
              cliente : datos_procesos[index].clienteNom,
              item : datos_procesos[index].clienteItemsNom,
              kg : this.kgOT,
            }];
          });
          break;
        }
      } else this.mensajeService.mensajeAdvertencia(`Advertencia`, `La OT N° ${ot} no se encuentra registrada en BagPro`);
    }, () => this.mensajeService.mensajeError(`¡Error!`, `¡Error al consultar la OT ${ot}!`));
  }

  //Funcion que va a mostrar el nombre de la materia prima
  cambiarNombreMateriaPrima(dato : number){
    let id : number = dato == 1 ? this.FormMateriaPrimaRetirada.value.MpIdRetirada : this.FormMateriaPrimaRetirada.value.MpNombreRetirada;
    this.materiaPrimaService.getInfoMpTintaBopp(id).subscribe(datos_materiaPrima => {
      for (let i = 0; i < datos_materiaPrima.length; i++) {
        if (this.categoriasMP.includes(datos_materiaPrima[i].categoria) || this.categoriasTintas.includes(datos_materiaPrima[i].categoria)) {
          if (![84, 2001, 88, 89, 2072].includes(datos_materiaPrima[i].id)) {
            this.FormMateriaPrimaRetirada.patchValue({
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
      }
    }, () => {
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
          let info : any = {
            Id : this.FormMateriaPrimaRetirada.value.MpIdRetirada,
            Id_Mp: 84,
            Id_Tinta: 2001,
            Nombre : this.FormMateriaPrimaRetirada.value.MpNombreRetirada,
            Cantidad : this.FormMateriaPrimaRetirada.value.MpCantidadRetirada,
            Und_Medida : this.FormMateriaPrimaRetirada.value.MpUnidadMedidaRetirada,
            Categoria : this.FormMateriaPrimaRetirada.value.Categoria,
            Stock : this.FormMateriaPrimaRetirada.value.MpStockRetirada,
          }
          if (this.categoriasTintas.includes(categoria)) info.Id_Tinta = info.Id;
          else if (this.categoriasMP.includes(categoria)) info.Id_Mp = info.Id;
          this.categoriasSeleccionadas.push(this.FormMateriaPrimaRetirada.value.Categoria);
          this.materiasPrimasSeleccionada_ID.push(this.FormMateriaPrimaRetirada.value.MpIdRetirada);
          this.materiasPrimasSeleccionadas.push(info);
          this.FormMateriaPrimaRetirada.reset();
        } else this.mensajeService.mensajeAdvertencia(`Advertencia`, `La materia prima ${this.FormMateriaPrimaRetirada.value.MpNombreRetirada} ya ha sido seleccionada!`);
      } else this.mensajeService.mensajeAdvertencia(`Advertencia`, `La cantidad a solicitar debe ser mayor a cero (0)!`);
    } else this.mensajeService.mensajeAdvertencia(`Advertencia`, `Hay campos vacios en el formulario de materia prima!`);
  }

  // Funcion que va a calcular la cantidad de materia prima asignada
  calcularMateriaPrimaAsignada() : number {
    let total : number = 0;
    for (let i = 0; i < this.materiasPrimasSeleccionadas.length; i++) {
      total += this.materiasPrimasSeleccionadas[i].Cantidad;
    }
    return total;
  }

  // Funcion que va a quitar la materia prima
  quitarMateriaPrima(data : any){
    this.onReject('eleccion');
    data = this.mpSeleccionada;
    this.materiasPrimasSeleccionadas.splice(this.materiasPrimasSeleccionadas.findIndex((item) => item.Id == data.Id), 1);
    this.materiasPrimasSeleccionada_ID.splice(this.materiasPrimasSeleccionada_ID.findIndex((item) => item == data.Id), 1);
  }

  // Funcion que hará validaciones antes de realizar la asignación
  validarCamposVaciosRetirada(){
    let maquina : number = this.FormMateriaPrimaRetiro.value.Maquina;
    let proceso : string = this.FormMateriaPrimaRetiro.value.ProcesoRetiro;
    if (this.FormMateriaPrimaRetiro.valid) {
      if (this.materiasPrimasSeleccionadas.length != 0){
        if ((maquina >= 1 && maquina != 0) && (proceso != null && proceso != '')) this.asignacionMateriaPrima();
        else this.mensajeService.mensajeAdvertencia(`Advertencia`, 'Debe diligenciar los campos maquina y proceso, verifique!');
      } else this.mensajeService.mensajeAdvertencia(`Advertencia`, 'Debe seleccionar minimo una materia prima para crear la solicitud!');
    } else this.mensajeService.mensajeAdvertencia(`Advertencia`, 'Debe llenar los campos vacios!');
  }

  //Funcion que asignará la materia prima a una Orden de trabajo y Proceso y lo guardará en la base de datos
  asignacionMateriaPrima(){
    let idOrdenTrabajo : number = this.FormMateriaPrimaRetiro.value.OTRetiro;
    this.load = false;
    if (!this.error) {
      if (this.estadoOT == null || this.estadoOT == '' || this.estadoOT == '0') {
        setTimeout(() => {
          if (this.calcularMateriaPrimaAsignada() <= this.cantRestante) this.crearAsignacion();
          else {
            this.load = true;
            if (this.ValidarRol != 1) this.mensajeService.mensajeAdvertencia(`¡Advertencia!`, `¡La cantidad a solicitar supera el limite de kilos permitidos para la OT ${idOrdenTrabajo}, Debe solicitar permisos a un usuario administrador.`);
            else if (this.ValidarRol == 1) this.confirmarAsignacion(idOrdenTrabajo);
          }
        }, 2000);
      } else if (this.estadoOT == 4 || this.estadoOT == 1) {
        this.mensajeService.mensajeAdvertencia(`Advertencia`, `¡No es posible crear solicitudes a la OT ${idOrdenTrabajo}, porque ya se encuentra cerrada!`);
        this.load = true;
      }
    } else this.load = true;
  }

  // Crear Asignacion
  crearAsignacion(){
    this.onReject('asignacion');
    this.load = false;
    const solicitud : any = {
      SolMpExt_Id : 0,
      SolMpExt_OT : this.FormMateriaPrimaRetiro.value.OTRetiro,
      SolMpExt_Maquina : this.FormMateriaPrimaRetiro.value.Maquina,
      SolMpExt_Observacion : this.FormMateriaPrimaRetiro.value.ObservacionRetiro,
      Estado_Id : 11,
      Usua_Id : this.storage_Id,
      SolMpExt_Fecha : this.today,
      SolMpExt_Hora : moment().format('H:mm:ss'),
    }
    this.asignacionMPService.srvGuardar(solicitud).subscribe((datos) => this.obtenerProcesoId(datos.asigMp_Id), () => {
      this.error = true;
      this.mensajeService.mensajeError(`¡Error!`, `¡Error al crear la solicitud de material!`);
      this.load = true;
    });
  }

  // Funcion que se encargará de consultar el Id del proceso y hacer el ingreso de las materia primas asignadas
  obtenerProcesoId(asigncaion : number){
    if (!this.error) {
      for (let index = 0; index < this.materiasPrimasSeleccionadas.length; index++) {
        let idMateriaPrima = this.materiasPrimasSeleccionadas[index].Id;
        let cantidadMateriaPrima = this.materiasPrimasSeleccionadas[index].Cantidad;
        let presentacionMateriaPrima = this.materiasPrimasSeleccionadas[index].Und_Medida;
        if (this.materiasPrimasSeleccionadas[index].Id_Mp == 84 && this.materiasPrimasSeleccionadas[index].Id_Tinta != 2001) {
          const datosDetallesAsignacion : any = {
            AsigMp_Id : asigncaion,
            Tinta_Id : idMateriaPrima,
            DtAsigTinta_Cantidad : cantidadMateriaPrima,
            UndMed_Id : presentacionMateriaPrima,
            Proceso_Id : this.materiasPrimasSeleccionadas[index].Proceso,
          }
          this.detallesAsignacionTintas.srvGuardar(datosDetallesAsignacion).subscribe(() => {}, () => {
            this.error = true;
            this.load = true;
            this.mensajeService.mensajeError(`¡Error!`, `¡Error al insertar la tinta asignada ${this.materiasPrimasSeleccionadas[index].Nombre}!`);
          });
        } else if (this.materiasPrimasSeleccionadas[index].Id_Mp != 84 && this.materiasPrimasSeleccionadas[index].Id_Tinta == 2001 && !this.soloTintas) {
          const datosDetallesAsignacion : any = {
            AsigMp_Id : asigncaion,
            MatPri_Id : idMateriaPrima,
            DtAsigMp_Cantidad : cantidadMateriaPrima,
            UndMed_Id : presentacionMateriaPrima,
            Proceso_Id : this.materiasPrimasSeleccionadas[index].Proceso,
          }
          this.detallesAsignacionService.srvGuardar(datosDetallesAsignacion).subscribe(() => {}, () => {
            this.error = true;
            this.load = true;
            this.mensajeService.mensajeError(`¡Error!`, `¡Error al insertar la materia prima asignada ${this.materiasPrimasSeleccionadas[index].Nombre}!`);
          });
        }
      }
      setTimeout(() => !this.error ? this.asignacionExitosa() : null, 2500);
    }
  }

  // Funcion que va a enviar un mensaje de confirmación indicando que la asignacion se creó bien
  asignacionExitosa() {
    if (!this.error && !this.soloTintas) this.mensajeService.mensajeConfirmacion(`¡Asignación Creada!`, `Asignación creada satisfactoriamente!`);
    else if (this.soloTintas && this.calcularMateriaPrimaAsignada() > this.cantRestante) this.mensajeService.mensajeConfirmacion(`¡Asignación Creada!`, `Solo se crearon las asignaciones de tintas!`);
    this.LimpiarCampos();
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

  /** Cerrar Dialogo de eliminación*/
  onReject = (dato : any) => this.messageService.clear(dato);

  /** Función para mostrar una elección de eliminación de OT/Rollo de la tabla. */
  mostrarEleccion(item : any){
    this.mpSeleccionada = item;
    this.messageService.add({severity:'warn', key:'eleccion', summary:'Elección', detail: `Está seguro que desea quitar la materia prima de la asignación?`, sticky: true});
  }

  confirmarAsignacion = (OT : any) => this.messageService.add({severity:'warn', key:'asignacion', summary:'Confirmar Elección', detail: `La cantidad a asignar supera el limite de Kg permitidos para la OT ${OT}, ¿Desea asignar de todas formas?`, sticky: true});


}
