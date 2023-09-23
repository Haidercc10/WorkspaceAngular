import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShepherdService } from 'angular-shepherd';
import moment from 'moment';
import { MessageService } from 'primeng/api';
import { modelEntradas_Salidas_MP } from 'src/app/Modelo/modelEntradas_Salidas_MP';
import { modelSolicitudMP_Extrusion } from 'src/app/Modelo/modelSolicitudMP_Extrusion';
import { modeloMovimientos_Entradas_MP } from 'src/app/Modelo/modeloMovimientos_Entradas_MP';
import { AsignacionMPService } from 'src/app/Servicios/Asignacion_MateriaPrima/asignacionMP.service';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { DetSolicitudMP_ExtrusionService } from 'src/app/Servicios/DetSolicitudMP_Extrusion/DetSolicitudMP_Extrusion.service';
import { DetallesAsignacionService } from 'src/app/Servicios/DetallesAsgMateriaPrima/detallesAsignacion.service';
import { DetallesAsignacionTintasService } from 'src/app/Servicios/DetallesAsgTintas/detallesAsignacionTintas.service';
import { Entradas_Salidas_MPService } from 'src/app/Servicios/Entradas_Salidas_MP/Entradas_Salidas_MP.service';
import { MateriaPrimaService } from 'src/app/Servicios/MateriaPrima/materiaPrima.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { Movimientos_Entradas_MPService } from 'src/app/Servicios/Movimientos_Entradas_MP/Movimientos_Entradas_MP.service';
import { ProcesosService } from 'src/app/Servicios/Procesos/procesos.service';
import { SolicitudMP_ExtrusionService } from 'src/app/Servicios/SolicitudMP_Extrusion/SolicitudMP_Extrusion.service';
import { TintasService } from 'src/app/Servicios/Tintas/tintas.service';
import { UnidadMedidaService } from 'src/app/Servicios/UnidadMedida/unidad-medida.service';
import { AppComponent } from 'src/app/app.component';
import { defaultStepOptions, stepsAsignacionMateriaPrima as defaultSteps } from 'src/app/data';

@Component({
  selector: 'app-asignacion-materia-prima',
  templateUrl: './asignacion-materia-prima.component.html',
  styleUrls: ['./asignacion-materia-prima.component.css']
})
export class AsignacionMateriaPrimaComponent implements OnInit {

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
  esSolicitud : boolean = false;
  arrayMatPrimas : any =  [];
  hora : any = moment().format('H:mm:ss');

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
                                      private servicioSolitudMaterial : SolicitudMP_ExtrusionService,
                                        private servicioDetlSolitudMaterial : DetSolicitudMP_ExtrusionService,
                                          private servicioDetAsigMatPrima : DetallesAsignacionService, 
                                            private srvMovEntradasMP : Movimientos_Entradas_MPService,
                                              private srvMovSalidasMP : Entradas_Salidas_MPService,) {

    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
    this.FormMateriaPrimaRetiro = this.frmBuilderMateriaPrima.group({
      OTRetiro : [null, Validators.required],
      OTImp : [''],
      Solicitud : [null],
      FechaRetiro : [this.today, Validators.required],
      Maquina : [null, Validators.required],
      kgOt : [null, Validators.required],
      ObservacionRetiro : [''],
    });

    this.FormMateriaPrimaRetirada = this.frmBuilderMateriaPrima.group({
      MpIdRetirada : ['', Validators.required],
      MpNombreRetirada: ['', Validators.required],
      MpCantidadRetirada : [null, Validators.required],
      MpUnidadMedidaRetirada: ['', Validators.required],
      MpStockRetirada: [null, Validators.required],
      ProcesoRetiro : ['', Validators.required],
      Categoria : ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.lecturaStorage();
    this.obtenerUnidadMedida();
    this.obtenerProcesos();
    this.obtenerMateriaPrima();
    this.consultarCategorias();
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
    this.soloTintas = false;
    this.categoriasSeleccionadas = [];
    this.infoOrdenTrabajo = [];
    this.esSolicitud = false;
    this.arrayMatPrimas = [];
  }

  //Funcion que limpiará los campos de la materia pirma entrante
  limpiarCamposMP = () => this.FormMateriaPrimaRetirada.reset();

  //Funcion que va almacenar todas las unidades de medida existentes en la empresa
  obtenerUnidadMedida = () => this.unidadMedidaService.srvObtenerLista().subscribe(data => this.unidadMedida = data);

  //Funcion que se encagará de obtener los procesos de la empresa
  obtenerProcesos = () => this.procesosService.srvObtenerLista().subscribe(data => this.procesos = data.filter((item) => item.proceso_Id != 'TINTAS'));

  //Funcion que va a recorrer las materias primas para almacenar el nombre de todas
  obtenerMateriaPrima(){
    this.materiaPrimaService.getMpTintaBopp().subscribe(data => {
      this.materiaPrima = data.filter((item) => item.categoria != 6);
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
    let ot : string = this.FormMateriaPrimaRetiro.value.OTRetiro;
    this.bagProServices.srvObtenerListaClienteOT_Item(ot).subscribe(datos_procesos => {
      if (datos_procesos.length != 0) {
        for (let index = 0; index < datos_procesos.length; index++) {
          let adicional : number = datos_procesos[index].datosotKg * 0.05;
          this.kgOT = datos_procesos[index].datosotKg + adicional;
          this.estadoOT = datos_procesos[index].estado;
          this.FormMateriaPrimaRetiro.patchValue({ kgOt : parseFloat(datos_procesos[index].datosotKg + adicional), });
          this.detallesAsignacionService.GetPolietilenoAsignada(parseInt(ot)).subscribe(datos_asignacion => {
            this.cantRestante = this.kgOT - datos_asignacion;
            let info : any = {
              ot : ot,
              cliente : datos_procesos[index].clienteNom,
              item : datos_procesos[index].clienteItems,
              referencia : datos_procesos[index].clienteItemsNom,
              kg : this.kgOT,
              kgRestante : this.cantRestante,
              cantAsignada : datos_asignacion,
              cantPedida : datos_procesos[index].datosotKg,
              und : datos_procesos[index].ptPresentacionNom.trim(),
            };
            info.und == 'Kilo' ? info.cantPedida = datos_procesos[index].datosotKg : info.und == 'Unidad' ? info.cantPedida = datos_procesos[index].datoscantBolsa : info.und == 'Paquete' ? datos_procesos[index].datoscantBolsa : info.cantPedida = datos_procesos[index].datosotKg;
            info.und == 'Kilo' ? info.und = 'Kg' : info.und == 'Unidad' ? info.und = 'Und' : info.und == 'Paquete' ? info.und = 'Paquete' : info.und = 'Kg'
            this.infoOrdenTrabajo = [];
            this.infoOrdenTrabajo.push(info);
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
                Cantidad2 : this.FormMateriaPrimaRetirada.value.MpCantidadRetirada,
                CantAprobada : 0,
                CanOculta : 0,
                Und_Medida : this.FormMateriaPrimaRetirada.value.MpUnidadMedidaRetirada,
                Proceso : this.FormMateriaPrimaRetirada.value.ProcesoRetiro,
                Categoria : this.FormMateriaPrimaRetirada.value.Categoria,
                Stock : this.FormMateriaPrimaRetirada.value.MpStockRetirada,
                EntradasDisponibles : [],
                Salidas : [],
              }
              if (this.categoriasTintas.includes(categoria)) info.Id_Tinta = info.Id;
              else if (this.categoriasMP.includes(categoria)) info.Id_Mp = info.Id;
              this.categoriasSeleccionadas.push(this.FormMateriaPrimaRetirada.value.Categoria);
              this.cargar_Entradas(info);
              this.materiasPrimasSeleccionada_ID.push(this.FormMateriaPrimaRetirada.value.MpIdRetirada);
              this.materiasPrimasSeleccionadas.push(info);
              setTimeout(() => this.FormMateriaPrimaRetirada.reset(), 500); 
            } else this.mensajeService.mensajeAdvertencia(`¡Advertencia!`, `¡La cantidad a asignar supera a la cantidad en stock!`);
          } else this.mensajeService.mensajeAdvertencia(`¡Advertencia!`, `¡Debe seleccionar hacia que proceso va la materia prima!`);
        } else this.mensajeService.mensajeAdvertencia(`¡Advertencia!`, `¡La materia prima ${this.FormMateriaPrimaRetirada.value.MpNombreRetirada} ya ha sido seleccionada!`);
      } else this.mensajeService.mensajeAdvertencia(`¡Advertencia!`, `¡La cantidad a asignar debe ser mayor a cero (0)!`);
    } else this.mensajeService.mensajeAdvertencia(`¡Advertencia!`, `¡Hay campos vacios en el formulario de materia prima!`);
  }

  // Funcion que va a calcular la cantidad de materia prima asignada
  calcularMateriaPrimaAsignada = () : number => this.materiasPrimasSeleccionadas.reduce((a,b) => a + b.Cantidad, 0);

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
    if (this.FormMateriaPrimaRetiro.valid) {
      if (this.materiasPrimasSeleccionadas.length != 0){
        if (maquina >= 1 && maquina != 0) this.asignacionMateriaPrima();
        else this.mensajeService.mensajeAdvertencia(`¡Advertencia!`, '¡El numero de la maquina no es valido!');
      } else this.mensajeService.mensajeAdvertencia(`¡Advertencia!`, '¡Debe seleccionar minimo una materia prima para crear la asignación!');
    } else this.mensajeService.mensajeAdvertencia(`¡Advertencia!`, '¡Debe llenar los campos vacios!');
  }

  //Funcion que asignará la materia prima a una Orden de trabajo y Proceso y lo guardará en la base de datos
  asignacionMateriaPrima(){
    let idOrdenTrabajo : number = this.FormMateriaPrimaRetiro.value.OTRetiro;
    if (this.estadoOT == null || this.estadoOT == '' || this.estadoOT == '0') {
      setTimeout(() => {
        if (this.calcularMateriaPrimaAsignada() <= this.cantRestante) this.crearAsignacion();
        else {
          if (this.categoriasSeleccionadas.includes(7) || this.categoriasSeleccionadas.includes(8)){
            this.soloTintas = true;
            this.crearAsignacion();
          } else {
            if (this.ValidarRol != 1) this.mensajeService.mensajeAdvertencia(`¡Advertencia!`, `¡La cantidad a asignar supera el limite de Kg permitidos para la OT ${idOrdenTrabajo}, Debe solicitar permisos a un usuario administrador.`);
            else if (this.ValidarRol == 1) this.confirmarAsignacion(idOrdenTrabajo);
          }
        }
      }, 2000);
    } else if (this.estadoOT == 4 || this.estadoOT == 1) this.mensajeService.mensajeAdvertencia(`¡Advertencia!`, `¡No es posible asignar a la OT ${idOrdenTrabajo}, porque ya se encuentra cerrada!`);
  }

  // Crear Asignacion
  crearAsignacion(){
    this.onReject('asignacion');
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
      SolMpExt_Id : this.FormMateriaPrimaRetiro.value.Solicitud == null || this.FormMateriaPrimaRetiro.value.Solicitud == "" ? 1 : this.FormMateriaPrimaRetiro.value.Solicitud,
    }
    this.asignacionMPService.srvGuardar(datosAsignacion).subscribe((datos) => this.obtenerProcesoId(datos.asigMp_Id), () => {
      this.mensajeService.mensajeError(`¡Error!`, `¡Error al crear la asignación de materia prima!`);
      this.load = true;
    });
  }

  // Funcion que se encargará de consultar el Id del proceso y hacer el ingreso de las materia primas asignadas
  obtenerProcesoId(asigncaion : number){
    let count : number = 0;
    for (let index = 0; index < this.materiasPrimasSeleccionadas.length; index++) {
      let idMateriaPrima = this.materiasPrimasSeleccionadas[index].Id;
      let cantidadMateriaPrima = this.materiasPrimasSeleccionadas[index].Cantidad;
      let presentacionMateriaPrima = this.materiasPrimasSeleccionadas[index].Und_Medida;
      if (this.materiasPrimasSeleccionadas[index].Id_Mp == 84 && this.materiasPrimasSeleccionadas[index].Id_Tinta != 2001) {
        const datosDetallesAsignacionTintas : any = {
          AsigMp_Id : asigncaion,
          Tinta_Id : idMateriaPrima,
          DtAsigTinta_Cantidad : cantidadMateriaPrima,
          UndMed_Id : presentacionMateriaPrima,
          Proceso_Id : this.materiasPrimasSeleccionadas[index].Proceso,
        }
        this.detallesAsignacionTintas.srvGuardar(datosDetallesAsignacionTintas).subscribe(() => count++, () => {
          this.load = true;
          this.mensajeService.mensajeError(`¡Error!`, `¡Error al insertar la tinta asignada ${this.materiasPrimasSeleccionadas[index].Nombre}!`);
        });
        this.moverInventarioTintas(idMateriaPrima, cantidadMateriaPrima);
      } else if (this.materiasPrimasSeleccionadas[index].Id_Mp != 84 && this.materiasPrimasSeleccionadas[index].Id_Tinta == 2001 && !this.soloTintas) {
        const datosDetallesAsignacion : any = {
          AsigMp_Id : asigncaion,
          MatPri_Id : idMateriaPrima,
          DtAsigMp_Cantidad : cantidadMateriaPrima,
          UndMed_Id : presentacionMateriaPrima,
          Proceso_Id : this.materiasPrimasSeleccionadas[index].Proceso,
        }
        this.detallesAsignacionService.srvGuardar(datosDetallesAsignacion).subscribe(() => count++, () => {
          this.load = true;
          this.mensajeService.mensajeError(`¡Error!`, `¡Error al insertar la materia prima asignada ${this.materiasPrimasSeleccionadas[index].Nombre}!`);
        });
        this.moverInventarioMpPedida(idMateriaPrima, cantidadMateriaPrima);
      }
    }
    setTimeout(() => {
      if (count == this.materiasPrimasSeleccionadas.length) {        
        this.actualizar_MovimientosEntradas();
        this.crear_Salidas(asigncaion);
        setTimeout(() => this.asignacionExitosa(), 2000);
      }
     }, 2000);
  }

  // Funcion que va a enviar un mensaje de confirmación indicando que la asignacion se creó bien
  asignacionExitosa() {
    if (!this.soloTintas && !this.esSolicitud) this.mensajeService.mensajeConfirmacion(`¡Asignación Creada!`, `Asignación creada satisfactoriamente!`);
    else if (this.soloTintas && this.calcularMateriaPrimaAsignada() > this.cantRestante && !this.esSolicitud) this.mensajeService.mensajeConfirmacion(`¡Asignación Creada!`, `Solo se crearon las asignaciones de tintas!`);
    else if(this.esSolicitud) this.validarEstadoSolicitud();
    setTimeout(() => { this.LimpiarCampos(); }, 1000); 
  }

  //Funcion que moverá el inventario de materia prima con base a la materia prima saliente
  moverInventarioMpPedida(idMateriaPrima : number, cantidadMateriaPrima : number){
    this.materiaPrimaService.srvObtenerListaPorId(idMateriaPrima).subscribe(datos_materiaPrima => {
      const datosMP : any = {
        MatPri_Id : idMateriaPrima,
        MatPri_Nombre : datos_materiaPrima.matPri_Nombre,
        MatPri_Descripcion : datos_materiaPrima.matPri_Descripcion,
        MatPri_Stock : datos_materiaPrima.matPri_Stock - cantidadMateriaPrima,
        UndMed_Id : datos_materiaPrima.undMed_Id,
        CatMP_Id : datos_materiaPrima.catMP_Id,
        MatPri_Precio : datos_materiaPrima.matPri_Precio,
        TpBod_Id : datos_materiaPrima.tpBod_Id,
        MatPri_Fecha : datos_materiaPrima.matPri_Fecha,
        MatPri_Hora : datos_materiaPrima.matPri_Hora,
        MatPri_PrecioEstandar : datos_materiaPrima.matPri_PrecioEstandar,
      }
      this.materiaPrimaService.srvActualizar(idMateriaPrima, datosMP).subscribe(null, () => {
        this.load = true;
        this.mensajeService.mensajeError(`¡Error!`, `¡Error al mover el inventario de la materia prima ${datos_materiaPrima.matPri_Nombre}!`);
      });
    });
  }

  //Funcion que va a mover el inventario de una tinta
  moverInventarioTintas(idMateriaPrima : number, cantidad : number){
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
        Tinta_FechaIngreso : datos_tintas.tinta_FechaIngreso,
        Tinta_Hora : datos_tintas.tinta_Hora,
        Tinta_PrecioEstandar : datos_tintas.tinta_PrecioEstandar,
      }
      this.tintasService.srvActualizar(idMateriaPrima, datosTintas).subscribe(null, () => {
        this.load = true;
        this.mensajeService.mensajeError(`¡Error!`, `¡Error al mover el inventario de la tinta ${datos_tintas.tinta_Nombre}!`);
      });
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

  //Buscar informacion de las solicitudes de materia prima creadas
  consultarSolicitudMaterial(){
    this.materiasPrimasSeleccionada_ID = [];
    this.materiasPrimasSeleccionadas = [];
    this.arrayMatPrimas = [];
    let solicitud : number = this.FormMateriaPrimaRetiro.value.Solicitud;
    this.esSolicitud = false;
    if(solicitud != null) {
      this.servicioDetlSolitudMaterial.GetSolicitudMp_Extrusion(solicitud).subscribe(data => {
        if(data.length > 0) {
          if(data[0].estado != 4 && data[0].estado != 5) {
            this.load = false;
            this.FormMateriaPrimaRetiro.patchValue({ OTRetiro : data[0].ot, Maquina : data[0].maquina, ObservacionRetiro : data[0].observacion, })
            setTimeout(() => {
              this.infoOT();
              this.esSolicitud = true;
            }, 1000);
            data.forEach(sol => this.llenarTablaMpConSolitudMP(sol));
          } else this.mensajeService.mensajeAdvertencia(`Advertencia`, `No es posible cargar solicitudes finalizadas o canceladas!`);
        } else this.mensajeService.mensajeAdvertencia(`Advertencia`, `La solicitud N° ${solicitud} no existe!`);
      }, () => this.mensajeService.mensajeError(`Error`, `No se pudo obtener la solicitud de material consultada!`));
    } else this.mensajeService.mensajeAdvertencia(`Advertencia`, `El valor ingresado en el campo solicitud no es válido`);
    setTimeout(() => this.load = true, 1500);
  }

  /** Llenar la tabla de materias primas seleccionadas con la info de la solicitud. */
  llenarTablaMpConSolitudMP(datos_solicitud : any) {
    let arrayIds : any = [];

    let info : any = {
      IdSolicitud : datos_solicitud.id,
      Id : 0,
      Id_Mp: datos_solicitud.matPrima_Id,
      Id_Tinta: datos_solicitud.tinta_Id,
      Nombre : '',
      Stock : 0,
      Cantidad : datos_solicitud.cantidad,
      CantAprobada : 0,
      CantOculta : datos_solicitud.cantidad,
      Und_Medida : datos_solicitud.medida,
      Proceso : '',
    }
    if (info.Id_Mp != 84) {
      info.Id = info.Id_Mp;
      info.Nombre = datos_solicitud.matPrima;
      info.Stock = datos_solicitud.stock_Mp;
      info.Proceso = 'EXT';
    } else if (info.Id_Tinta != 2001) {
      info.Id = info.Id_Tinta;
      info.Nombre = datos_solicitud.tinta;
      info.Stock = datos_solicitud.stock_Tinta;
      info.Proceso = 'IMP';
    }
    arrayIds.push(info.Id);

    this.servicioDetAsigMatPrima.GetAsignacionesConSolicitudes(info.IdSolicitud).subscribe(data2 => {
      for (let i = 0; i < data2.length; i++) {
        let infoAsignaciones : any = {
          Ident : 0,
          Id_Mp: data2[i].matPri_Id,
          Id_Tinta: data2[i].tinta_Id,
          CantAsignaciones : data2[i].cantMP
        }
        if (infoAsignaciones.Id_Mp != 84) infoAsignaciones.Ident = infoAsignaciones.Id_Mp;
        else if (infoAsignaciones.Id_Tinta != 2001) infoAsignaciones.Ident = infoAsignaciones.Id_Tinta;

        if(arrayIds.includes(infoAsignaciones.Ident)) {
          info.CantAprobada = infoAsignaciones.CantAsignaciones;
        }
      }
    });
    this.arrayMatPrimas.push(info.Id);
    this.materiasPrimasSeleccionada_ID.push(info.Id);
    this.materiasPrimasSeleccionadas.push(info);
  }

  /** Validar que los materiales de la asignación tengan un stock mayor a la cantidad solicitada */
  validarStockMateriales() {
    let stockMenor : boolean = false;
    for (let index = 0; index < this.materiasPrimasSeleccionadas.length; index++) {
      if(this.materiasPrimasSeleccionadas[index].Cantidad > this.materiasPrimasSeleccionadas[index].Stock) stockMenor = true;
      else stockMenor = false;
      break;
    }
    stockMenor ? this.mensajeService.mensajeAdvertencia(`Advertencia`, `Existen materiales con cantidades solicitadas mayores a su stock, por favor, verifique!`) : this.validarCamposVaciosRetirada();
  }

  /** Función que validará el nuevo estado de la solicitud */
  validarEstadoSolicitud(){
    let cantItemsFinalizados : number = 0;
    let cantItemsParciales : number = 0;
    let cantItems : number = this.arrayMatPrimas.length;
    let estadoSolicitud : number = 0;

    if(this.esSolicitud) {
      for (let index = 0; index < this.arrayMatPrimas.length; index++) {
        if(this.arrayMatPrimas.includes(this.materiasPrimasSeleccionada_ID[index])) {
          if((this.materiasPrimasSeleccionadas[index].Cantidad + this.materiasPrimasSeleccionadas[index].CantAprobada) >= this.materiasPrimasSeleccionadas[index].CantOculta) {
            cantItemsFinalizados += 1;
          } else if((this.materiasPrimasSeleccionadas[index].Cantidad + this.materiasPrimasSeleccionadas[index].CantAprobada) < this.materiasPrimasSeleccionadas[index].CantOculta) {
            cantItemsParciales += 1;
          }
        }
      }
      if(cantItemsFinalizados == cantItems) estadoSolicitud = 5;
      else if(cantItemsFinalizados < cantItems && cantItemsParciales >= 0) estadoSolicitud = 12;
      else estadoSolicitud = 11;
      this.actualizarEstadoSolicitud(estadoSolicitud);
    }
  }

  /** Actualizar estado de las solicitudes de material de producción. */
  actualizarEstadoSolicitud(estado : number){
    let solicitud_Id : number = this.FormMateriaPrimaRetiro.value.Solicitud;

    this.servicioSolitudMaterial.GetId(solicitud_Id).subscribe(data => {
      let modelo : modelSolicitudMP_Extrusion = {
        SolMpExt_Id: solicitud_Id,
        SolMpExt_OT: data.solMpExt_OT,
        SolMpExt_Maquina: data.solMpExt_Maquina,
        SolMpExt_Fecha: data.solMpExt_Fecha,
        SolMpExt_Hora: data.solMpExt_Hora,
        SolMpExt_Observacion: data.solMpExt_Observacion,
        Estado_Id: estado,
        Proceso_Id: data.proceso_Id,
        Usua_Id: data.usua_Id
      }
      this.servicioSolitudMaterial.Put(modelo.SolMpExt_Id, modelo).subscribe(() => this.mensajeService.mensajeConfirmacion(`Confirmación`, `Asignación creada exitosamente!`), 
      () => this.mensajeService.mensajeError(`Error`, `No fue posible crear la asignación de materia prima!`));
    })
  }

  //Función que colocará la información de las entradas de materia prima en el array de entradas disponibles.
  cargar_Entradas(info : any){
    let salidaReal : number = 0;
    this.srvMovEntradasMP.GetInventarioxMaterial(info.Id).subscribe(data => {
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
          if(info.Cantidad2 > 0) {
            if(info.Cantidad2 > detalle.Cantidad_Disponible) {
              salidaReal = detalle.Cantidad_Disponible;
              info.Cantidad2 -= detalle.Cantidad_Disponible;
              detalle.Cantidad_Asignada += detalle.Cantidad_Disponible;
              detalle.Cantidad_Disponible = 0;
              detalle.Estado_Id = 5;
            } else if(info.Cantidad2 == detalle.Cantidad_Disponible) {
              salidaReal = info.Cantidad2;
              detalle.Cantidad_Asignada += detalle.Cantidad_Disponible;
              detalle.Cantidad_Disponible = 0;
              detalle.Estado_Id = 5;
              info.Cantidad2 = 0;
            } else if(info.Cantidad2 < detalle.Cantidad_Disponible) {
              salidaReal = info.Cantidad2;
              detalle.Cantidad_Asignada += info.Cantidad2;
              detalle.Cantidad_Disponible -= info.Cantidad2;
              detalle.Estado_Id = 19;
              info.Cantidad2 = 0;
            }
            this.cargar_Salidas(detalle, info, salidaReal);
            info.EntradasDisponibles.push(detalle);
          }
        }
      }
    });
  }

  //Función que colocará la información de la salida de la materia prima en el array de salidas. 
  cargar_Salidas(detalle : any, info : any, salidaReal : number){
    let categoria : number = this.FormMateriaPrimaRetirada.value.Categoria;

    let salidas : modelEntradas_Salidas_MP = {
      Id_Entrada: detalle.Id,
      Tipo_Salida: this.categoriasMP.includes(categoria) ? 'ASIGMP' : 'ASIGTINTAS',
      Codigo_Salida: 0,
      Tipo_Entrada: detalle.Tipo_Entrada,
      Codigo_Entrada: detalle.Codigo_Entrada,
      Fecha_Registro: this.today,
      Hora_Registro: this.hora,
      MatPri_Id: detalle.MatPri_Id,
      Tinta_Id: detalle.Tinta_Id,
      Bopp_Id: detalle.Bopp_Id,
      Cantidad_Salida: salidaReal,
      Orden_Trabajo: this.infoOrdenTrabajo[0] == undefined ? 0 : this.infoOrdenTrabajo[0].ot,
      Prod_Id: this.infoOrdenTrabajo[0] == undefined ? 1 : this.infoOrdenTrabajo[0].item,
      Cant_PedidaOT: this.infoOrdenTrabajo[0] == undefined ? 0 : this.infoOrdenTrabajo[0].cantPedida,
      UndMed_Id: this.infoOrdenTrabajo[0] == undefined ? 'Kg' : this.infoOrdenTrabajo[0].und
    }
    info.Salidas.push(salidas);
  }

  //Función que actualizará los movimientos de entrada de las materias primas seleccionadas.
  actualizar_MovimientosEntradas(){
    if(this.materiasPrimasSeleccionadas.length > 0) {
      for (let index = 0; index < this.materiasPrimasSeleccionadas.length; index++) {
        for (let i = 0; i < this.materiasPrimasSeleccionadas[index].EntradasDisponibles.length; i++) {
         this.srvMovEntradasMP.Put(this.materiasPrimasSeleccionadas[index].EntradasDisponibles[i].Id, this.materiasPrimasSeleccionadas[index].EntradasDisponibles[i]).subscribe(null, 
         () => this.mensajeService.mensajeError(`Error`, `No fue posible actualizar el movimiento de entrada!`));
        }
      }
    }
  }

  //Función que creará las salidas de las materias primas seleccionadas.
  crear_Salidas(asignacionId : number){
    if(this.materiasPrimasSeleccionadas.length > 0) {
      for (let index = 0; index < this.materiasPrimasSeleccionadas.length; index++) {
        for (let i = 0; i < this.materiasPrimasSeleccionadas[index].Salidas.length; i++) {
          this.materiasPrimasSeleccionadas[index].Salidas[i].Codigo_Salida = asignacionId;
          this.materiasPrimasSeleccionadas[index].Salidas[i].Fecha_Registro = this.today;
          this.materiasPrimasSeleccionadas[index].Salidas[i].Hora_Registro = this.hora;
          this.materiasPrimasSeleccionadas[index].Salidas[i].Prod_Id = this.infoOrdenTrabajo[0].item;
          this.materiasPrimasSeleccionadas[index].Salidas[i].Orden_Trabajo = this.infoOrdenTrabajo[0].ot;
          this.materiasPrimasSeleccionadas[index].Salidas[i].Cant_PedidaOT = this.infoOrdenTrabajo[0].cantPedida;
          this.materiasPrimasSeleccionadas[index].Salidas[i].UndMed_Id = this.infoOrdenTrabajo[0].und;
          this.srvMovSalidasMP.Post(this.materiasPrimasSeleccionadas[index].Salidas[i]).subscribe(null, () => this.mensajeService.mensajeError(`Error`, `No fue posible crear la salida de material!`));
        }
      }
    }
  }
}
