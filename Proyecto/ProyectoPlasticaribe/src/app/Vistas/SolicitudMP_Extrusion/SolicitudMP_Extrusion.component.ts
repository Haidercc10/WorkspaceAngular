import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ShepherdService } from 'angular-shepherd';
import moment from 'moment';
import pdfMake from 'pdfmake/build/pdfmake';
import { MessageService } from 'primeng/api';
import { modelDetSolicitudMP_Extrusion } from 'src/app/Modelo/modelDetSolicitudMP_Extrusion';
import { modelSolicitudMP_Extrusion } from 'src/app/Modelo/modelSolicitudMP_Extrusion';
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
import { defaultStepOptions, stepsSolicitudMaterialProduccion as defaultSteps } from 'src/app/data';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';
import { Table } from 'primeng/table';
import { Subject, takeUntil, } from 'rxjs';

@Component({
  selector: 'app-SolicitudMP_Extrusion',
  templateUrl: './SolicitudMP_Extrusion.component.html',
  styleUrls: ['./SolicitudMP_Extrusion.component.css']
})
export class SolicitudMP_ExtrusionComponent implements OnInit {

  public FormMateriaPrimaRetiro !: FormGroup;
  public FormMateriaPrimaRetirada !: FormGroup;

  /* Variables*/
  storage_Id: number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre: any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol: any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol: number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  load: boolean = true; //Variable para validar que aparezca el icono de carga o no
  materiaPrima: any = []; //Variable que va almacenar el nombre de todas las materias primas existentes en la empresa
  materiasPrimasSeleccionadas: any[] = []; //Variable que va almacenar el nombre de todas las materias primas existentes en la empresa
  materiasPrimasSeleccionada_ID: any[] = []; //Variable que almacenará los ID de las materias primas que se han seleccionado para que no puedan ser elegidas nuevamente
  unidadMedida: any = [{ undMed_Id: 'Kg' }, { undMed_Id: 'Cms' }]; //Varibale que va a almacenar las unidades de medida registradas en la base de datos
  procesos: any = []; //Variable que va a almacenar los procesos que tiene la empresa (extrusio, impresion, etc...)
  today: any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  error: boolean = false; //Variabla que nos ayudarápara saber si hubo un error
  kgOT: number; //Variable que va alamacenar la cantidad de kilos que se piden en la orden de trabajo
  cantRestante: number = 0; //Variable que va a almacenar la cantidad que resta por asignar de una orden de trabajo
  estadoOT: any; //Variable que va a almacenar el estado de la orden de trabajo
  infoOrdenTrabajo: any[] = []; //Variable en la que se almacenará la información de la orden de trabajo consultada
  categoriasMP: any[] = []; //Variable que almcanará las categorias de la tabla Materia_Prima
  categoriasTintas: any[] = []; //Variable que almcanará las categorias de la tabla Tintas

  otImpresion: any[] = []; //Variable que va a almacenar las diferentes ordenes de trabajo que contiene la orden de trabajo de impresión
  categoriasSeleccionadas: any[] = [];
  soloTintas: boolean = false;
  mpSeleccionada: any = [];
  modoSeleccionado: boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  informacionPDF: any = []; //Array que contendrá la información del PDF
  nroSolicitud: number = 9; /** Variable que guardará el ID de la solicitud para crear el pdf. */
  esSolicitud: boolean = false; /** Variable que se encargará de limpiar campos */
  ultimoNroSolicitud: number = 0;
  viewSubcategories: boolean = false; /** Variable para mostrar el modal de subcategorias */
  subcategories: any[] = [];
  materials: any[] = [];
  materialsFiltered: any[] = [];
  viewMaterials: boolean = false;
  @ViewChild('dtSubcategories') dtSubcategories: Table | undefined;
  @ViewChild('dtMaterials') dtMaterials: Table | undefined;
  private destroy$ = new Subject<void>();


  constructor(private materiaPrimaService: MateriaPrimaService,
    private unidadMedidaService: UnidadMedidaService,
    private procesosService: ProcesosService,
    private frmBuilderMateriaPrima: FormBuilder,
    private AppComponent: AppComponent,
    private asignacionMPService: AsignacionMPService,
    private detallesAsignacionService: DetallesAsignacionService,
    private bagProServices: BagproService,
    private tintasService: TintasService,
    private detallesAsignacionTintas: DetallesAsignacionTintasService,
    private messageService: MessageService,
    private shepherdService: ShepherdService,
    private mensajeService: MensajesAplicacionService,
    private servicioSolicitudMpExt: SolicitudMP_ExtrusionService,
    private servicioDetSolicitudMpExt: DetSolicitudMP_ExtrusionService) {

    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
    this.FormMateriaPrimaRetiro = this.frmBuilderMateriaPrima.group({
      OTRetiro: [null, Validators.required],
      OTImp: [''],
      FechaRetiro: [this.today, Validators.required],
      Maquina: [null, Validators.required],
      kgOt: [null, Validators.required],
      ProcesoRetiro: ['', Validators.required],
      ObservacionRetiro: [''],
      Solicitud: [null],
    });

    this.FormMateriaPrimaRetirada = this.frmBuilderMateriaPrima.group({
      MpIdRetirada: ['', Validators.required],
      MpNombreRetirada: ['', Validators.required],
      MpStockRetirada: [null, Validators.required],
      MpCantidadRetirada: [null, Validators.required],
      MpUnidadMedidaRetirada: ['', Validators.required],
      Categoria: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.lecturaStorage();
    this.obtenerProcesos();
    this.obtenerMateriaPrima();
    this.consultarCategorias();
    this.ultimoConsecutivoSolicitud();
    setInterval(() => this.modoSeleccionado = this.AppComponent.temaSeleccionado, 1000);
    this.FormMateriaPrimaRetiro.patchValue({ 'ProcesoRetiro': this.validateProcess(), });
    this.FormMateriaPrimaRetirada.patchValue({ MpUnidadMedidaRetirada: 'Kg' });
  }

  //Función 
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Funcion que va a hacer que se inicie el tutorial in-app
  tutorial() {
    this.shepherdService.defaultStepOptions = defaultStepOptions;
    this.shepherdService.modal = true;
    this.shepherdService.confirmCancel = false;
    this.shepherdService.addSteps(defaultSteps);
    this.shepherdService.start();
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage() {
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  //Funcion que va a consultar el ultimo consecutivo de las solicitudes de materia prima para asignarle el siguiente numero a la nueva solicitud
  validateProcess() {
    let process: string = ``;
    if ([88, 4].includes(this.ValidarRol)) process = 'IMP';
    else if ([7, 85].includes(this.ValidarRol)) process = 'EXT';
    else if ([87, 9].includes(this.ValidarRol)) process = 'EMP';
    else if ([89, 63].includes(this.ValidarRol)) process = 'LAM'
    else process = '';
    return process;
  }

  //Función que va a cargar las subcategorias para mostrarlas en un modal y que el usuario pueda elegir a cual de ellas pertenece la materia prima que desea solicitar
  loadSubcategories() {
    this.subcategories = [];
    this.materials = [];
    this.materiaPrimaService.getSubcategories().subscribe(datos => {
      this.materials = datos;
      this.viewSubcategories = true;
      this.subcategories = this.materials.reduce((a: any, b: any) => {
        if (!a.map(x => x.id_Subcategoria).includes(b.id_Subcategoria)) a = [...a, b];
        else {
          let index = a.findIndex(x => x.id_Subcategoria == b.id_Subcategoria);
          a[index] = { ...a[index], stock: a[index].stock + b.stock };
        }
        return a;
      }, []);
      this.subcategories.sort((a, b) => Number(b.stock) - Number(a.stock));
    });
  }

  // Función que va a filtrar las materias primas dependiendo de la subcategoria que el usuario haya elegido
  filterForSubcategory(data: any) {
    this.materialsFiltered = [];
    this.materialsFiltered = this.materials.filter(x => x.id_Subcategoria == data.id_Subcategoria);
    this.materialsFiltered.sort((a, b) => Number(b.stock) - Number(a.stock));
    this.viewMaterials = true;
  }

  applyFilter = ($event, campo: any, table: any) => table!.filter(($event.target as HTMLInputElement).value, campo, 'contains');

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

  // Funcion que limpia los todos los campos de la vista
  LimpiarCampos() {
    this.FormMateriaPrimaRetirada.reset();
    this.FormMateriaPrimaRetiro.reset();
    this.FormMateriaPrimaRetiro.patchValue({ ProcesoRetiro: 'EXT', FechaRetiro: this.today, });
    this.ultimoConsecutivoSolicitud();
    this.FormMateriaPrimaRetirada.patchValue({ MpUnidadMedidaRetirada: 'Kg' });
    this.cantRestante = 0;
    this.kgOT = 0;
    this.load = true;
    this.materiasPrimasSeleccionada_ID = [];
    this.materiasPrimasSeleccionadas = [];
    this.error = false;
    this.soloTintas = false;
    this.categoriasSeleccionadas = [];
    this.infoOrdenTrabajo = [];
    this.esSolicitud = false;
    this.nroSolicitud = 0;
  }

  //Funcion que limpiará los campos de la materia pirma entrante
  limpiarCamposMP() {
    this.FormMateriaPrimaRetirada.reset();
    this.FormMateriaPrimaRetirada.patchValue({ MpUnidadMedidaRetirada: 'Kg' });
  }

  //Funcion que se encagará de obtener los procesos de la empresa
  obtenerProcesos() {
    this.procesos = [];
    this.procesos = [
      { proceso_Id: 'EXT', proceso_Nombre: 'EXTRUSIÓN' },
      { proceso_Id: 'IMP', proceso_Nombre: 'IMPRESIÓN' },
      { proceso_Id: 'EMP', proceso_Nombre: 'EMPAQUE' },
      { proceso_Id: 'LAM', proceso_Nombre: 'LAMINADO' }
    ];
  }

  //Funcion que va a recorrer las materias primas para almacenar el nombre de todas
  obtenerMateriaPrima() {
    this.materiaPrimaService.getMpTintaBopp().pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.materiaPrima = data.filter((item) => item.categoria != 6)
      this.materiaPrima.sort((a, b) => a.nombre.localeCompare(b.nombre));
    });
  }

  // Funcion que va a consultar las categorias de las tablas Materia_Prima, Tintas y BOPP
  consultarCategorias() {
    this.materiaPrimaService.GetCategoriasMateriaPrima().pipe(takeUntil(this.destroy$)).subscribe(datos => this.categoriasMP = datos);
    this.tintasService.GetCategoriasTintas().pipe(takeUntil(this.destroy$)).subscribe(datos => this.categoriasTintas = datos);
  }

  // Funcion que va a consultar la orden de trabajo para saber que cantidad de materia prima 
  // se ha asignado y que cantidad se ha devuelto con respecto a la cantidad que se debe hacer en kg
  infoOT() {
    this.error = false;
    let ot: string = this.FormMateriaPrimaRetiro.value.OTRetiro;
    this.bagProServices.srvObtenerListaClienteOT_Item(ot).pipe(takeUntil(this.destroy$)).subscribe(datos_procesos => {
      if (datos_procesos.length > 0) {
        let adicional: number = datos_procesos[0].datosotKg * 0.05;
        this.kgOT = datos_procesos[0].datosotKg + adicional;
        this.estadoOT = datos_procesos[0].estado;
        this.FormMateriaPrimaRetiro.patchValue({ kgOt: parseFloat(datos_procesos[0].datosotKg + adicional), });
        this.detallesAsignacionService.getMateriasPrimasAsignadas(parseInt(ot)).pipe(takeUntil(this.destroy$)).subscribe(datos_asignacion => {
          this.cantRestante = this.kgOT - datos_asignacion;
          this.loadInfoOT(parseInt(ot), datos_procesos, datos_asignacion);
        });
      } else this.mensajeService.mensajeAdvertencia(`Advertencia`, `La OT N° ${ot} no se encuentra registrada en BagPro!`);
    }, () => this.mensajeService.mensajeError(`Error`, `Error al consultar la OT ${ot}!`));
  }

  // Funcion que va a consultar la informacion de la orden de trabajo
  loadInfoOT(ot: number, datos_procesos: any, datos_asignacion: number) {
    this.infoOrdenTrabajo = [{
      ot: ot,
      cliente: datos_procesos[0].clienteNom,
      item: datos_procesos[0].clienteItemsNom,
      kg: this.kgOT,
      kgAsignado: datos_asignacion,
      kgRestante: this.cantRestante,
    }];
  }

  //Funcion que va a mostrar el nombre de la materia prima
  cambiarNombreMateriaPrima(dato: number) {
    let id: number = dato == 1 ? this.FormMateriaPrimaRetirada.value.MpIdRetirada : this.FormMateriaPrimaRetirada.value.MpNombreRetirada;
    this.materiaPrimaService.getInfoMpTintaBopp(id).subscribe(datos_materiaPrima => {
      for (let i = 0; i < datos_materiaPrima.length; i++) {
        if (this.categoriasMP.includes(datos_materiaPrima[i].categoria) || this.categoriasTintas.includes(datos_materiaPrima[i].categoria)) {
          if (![84, 2001, 88, 89, 2072].includes(datos_materiaPrima[i].id)) {
            this.loadMaterialInField(datos_materiaPrima[i])
          }
        }
      }
    }, () => {
      this.load = true;
      this.error = true;
      this.limpiarCamposMP();
    });
  }

  //Funcion que va a cargar la información de la materia prima seleccionada en los campos correspondientes
  loadMaterialInField(data: any) {
    this.FormMateriaPrimaRetirada.patchValue({
      'MpIdRetirada': data.id,
      'MpNombreRetirada': data.nombre,
      'MpCantidadRetirada': 0,
      'MpUnidadMedidaRetirada': data.undMedida,
      'MpStockRetirada': data.stock,
      'ProcesoRetiro': '',
      'Categoria': data.categoria,
    });
  }

  // Funcion para colocar la materia prima en la tabla
  validarCamposVaciosMPRetirada() {
    let categoria: number = this.FormMateriaPrimaRetirada.value.Categoria;
    let mpId: any = this.FormMateriaPrimaRetirada.value.MpIdRetirada;
    let qty: number = this.FormMateriaPrimaRetirada.value.MpCantidadRetirada;
    if (this.FormMateriaPrimaRetirada.valid) {
      if (qty > 0) {
        if (!this.materiasPrimasSeleccionada_ID.includes(mpId)) {
          if (qty > this.cantRestante) {
            this.mensajeService.mensajeAdvertencia(`Advertencia`, `La cantidad a solicitar excede la cantidad restante a asignar: ${this.cantRestante} Kg!`);
            return;
          }
          let info = this.materialSelected(this.FormMateriaPrimaRetirada.value);
          if (this.categoriasTintas.includes(categoria)) info.Id_Tinta = info.Id;
          else if (this.categoriasMP.includes(categoria)) info.Id_Mp = info.Id;
          this.categoriasSeleccionadas.push(this.FormMateriaPrimaRetirada.value.Categoria);
          this.materiasPrimasSeleccionada_ID.push(mpId);
          this.materiasPrimasSeleccionadas.push(info);
          this.limpiarCamposMP();
        } else this.mensajeService.mensajeAdvertencia(`Advertencia`, `La materia prima ${this.FormMateriaPrimaRetirada.value.MpNombreRetirada} ya ha sido seleccionada!`);
      } else this.mensajeService.mensajeAdvertencia(`Advertencia`, `La cantidad a solicitar debe ser mayor a cero (0)!`);
    } else this.mensajeService.mensajeAdvertencia(`Advertencia`, `Hay campos vacios en el formulario de materia prima!`);
  }

  // Funcion que va a crear un objeto con la información de la materia prima seleccionada para luego ser almacenada en el array materiasPrimasSeleccionadas
  materialSelected(form: any) {
    let info: any = {
      'Id': form.MpIdRetirada,
      'Id_Mp': 84,
      'Id_Tinta': 2001,
      'Nombre': form.MpNombreRetirada,
      'Cantidad': form.MpCantidadRetirada,
      'Und_Medida': form.MpUnidadMedidaRetirada,
      'Categoria': form.Categoria,
      'Stock': form.MpStockRetirada,
    }
    return info;
  }

  // Funcion que va a calcular la cantidad de materia prima solicitada
  calcularMateriaPrimaSolicitada(): number {
    let total: number = 0;
    for (let i = 0; i < this.materiasPrimasSeleccionadas.length; i++) {
      total += this.materiasPrimasSeleccionadas[i].Cantidad;
    }
    return total;
  }

  // Funcion que va a quitar la materia prima
  quitarMateriaPrima(data: any) {
    this.onReject('eleccion');
    data = this.mpSeleccionada;
    this.materiasPrimasSeleccionadas.splice(this.materiasPrimasSeleccionadas.findIndex((item) => item.Id == data.Id), 1);
    this.materiasPrimasSeleccionada_ID.splice(this.materiasPrimasSeleccionada_ID.findIndex((item) => item == data.Id), 1);
  }

  // Funcion que hará validaciones antes de realizar la asignación
  validarCamposVaciosRetirada() {
    let maquina: number = this.FormMateriaPrimaRetiro.value.Maquina;
    let proceso: string = this.FormMateriaPrimaRetiro.value.ProcesoRetiro;
    if (this.FormMateriaPrimaRetiro.valid) {
      if (this.materiasPrimasSeleccionadas.length != 0) {
        if ((maquina >= 1) && (!['', null].includes(proceso))) {
          this.solicitudMateriaPrima();
        } else this.mensajeService.mensajeAdvertencia(`Advertencia`, 'Debe diligenciar los campos maquina y proceso, verifique!');
      } else this.mensajeService.mensajeAdvertencia(`Advertencia`, 'Debe seleccionar minimo una materia prima para crear la solicitud!');
    } else this.mensajeService.mensajeAdvertencia(`Advertencia`, 'Debe llenar los campos vacios!');
  }

  //Funcion que creará la solicitud de materia prima a una OT Y lo guardará en la base de datos
  solicitudMateriaPrima() {
    let idOrdenTrabajo: number = this.FormMateriaPrimaRetiro.value.OTRetiro;
    let idSolicitud: number = this.FormMateriaPrimaRetiro.value.Solicitud;
    this.load = false;
    if (!this.error) {
      if ([null, '', 0].includes(this.estadoOT)) {
        setTimeout(() => {
          if (this.calcularMateriaPrimaSolicitada() <= this.cantRestante && !this.esSolicitud) this.crearSolicitudMatPrima();
          else if (this.calcularMateriaPrimaSolicitada() <= this.cantRestante && this.esSolicitud) this.editarSolicitud();
          else {
            this.load = true;
            if (this.ValidarRol != 1 && !this.esSolicitud) this.mensajeService.mensajeAdvertencia(`Advertencia`, `La cantidad a solicitar supera el limite de kilos permitidos para la OT ${idOrdenTrabajo}, Debe solicitar permisos al administrador.`);
            else if (this.ValidarRol != 1 && this.esSolicitud) this.mensajeService.mensajeAdvertencia(`Advertencia`, `La cantidad a solicitar supera el limite de kilos permitidos para la OT ${idOrdenTrabajo}, Debe solicitar permisos al administrador.`);
            else if (this.ValidarRol == 1 && !this.esSolicitud) this.confirmarSolicitud(idOrdenTrabajo);
            else if (this.ValidarRol == 1 && this.esSolicitud) this.confirmarEditarSolicitud(idSolicitud);
          }
        }, 2000);
      } else if ([4, 1].includes(this.estadoOT)) {
        this.mensajeService.mensajeAdvertencia(`Advertencia`, `No es posible crear/editar solicitudes a la OT ${idOrdenTrabajo}, porque está cerrada!`);
        this.load = true;
      }
    } else this.load = true;
  }

  // Crear solicitud mat. prima
  crearSolicitudMatPrima() {
    this.onReject('solicitud');
    this.load = false;
    const solicitud: modelSolicitudMP_Extrusion = {
      SolMpExt_Id: 0,
      SolMpExt_OT: this.FormMateriaPrimaRetiro.value.OTRetiro,
      SolMpExt_Maquina: this.FormMateriaPrimaRetiro.value.Maquina,
      SolMpExt_Fecha: this.today,
      SolMpExt_Hora: moment().format('H:mm:ss'),
      SolMpExt_Observacion: this.FormMateriaPrimaRetiro.value.ObservacionRetiro,
      Estado_Id: 11,
      Proceso_Id: this.FormMateriaPrimaRetiro.value.ProcesoRetiro,
      Usua_Id: this.storage_Id
    }
    this.servicioSolicitudMpExt.Post(solicitud).pipe(takeUntil(this.destroy$)).subscribe((datos) => {
      this.crearDetalleSolicitud(datos.solMpExt_Id);
      this.nroSolicitud = datos.solMpExt_Id;
    }, () => {
      this.error = true;
      this.mensajeService.mensajeError(`Error`, `Error al crear la solicitud de material!`);
      this.load = true;
    });
  }

  // Funcion que se encargará de consultar el Id del proceso y hacer el ingreso de las materia primas asignadas
  crearDetalleSolicitud(solicitud: number) {
    let count: number = 0;
    if (!this.error) {
      this.materiasPrimasSeleccionadas.forEach(x => {
        let detallesSolicitud = this.detailsRequest(x, solicitud);
        this.servicioDetSolicitudMpExt.Post(detallesSolicitud).subscribe(() => {
          count++;
          if (count == this.materiasPrimasSeleccionadas.length) this.solicitudExitosa();
        }, () => {
          this.error = true;
          this.load = true;
          this.mensajeService.mensajeError(`Error`, `Error al insertar la materia prima solicitada ${x.Nombre}!`);
        });
      });
    }
  }

  // Funcion que se encargará de crear el objeto para hacer la solicitud de materia prima
  detailsRequest(data : any, solicitud: number): modelDetSolicitudMP_Extrusion   {
    const detallesSolicitud: modelDetSolicitudMP_Extrusion = {
      'Codigo': 0,
      'SolMpExt_Id': solicitud,
      'MatPri_Id': data.Id_Mp,
      'Tinta_Id': data.Id_Tinta,
      'DtSolMpExt_Cantidad': data.Cantidad,
      'UndMed_Id': data.Und_Medida,
    }
    return detallesSolicitud;
  }

  // Funcion que va a enviar un mensaje de confirmación indicando que la asignacion se creó satisfactoriamente.
  solicitudExitosa() {
    if (!this.error && !this.esSolicitud) this.mensajeService.mensajeConfirmacion(`Confirmación`, `Solicitud creada satisfactoriamente!`)
    else if (!this.error && this.esSolicitud) this.mensajeService.mensajeConfirmacion(`Confirmación`, `Solicitud actualizada satisfactoriamente!`)
    this.buscarinfoOrdenCompra();
  }

  /** Cerrar Dialogo de eliminación*/
  onReject = (dato: any) => this.messageService.clear(dato);

  /** Función para mostrar una elección de eliminación de OT/Rollo de la tabla. */
  mostrarEleccion(item: any, accion: string) {
    this.mpSeleccionada = item;
    this.messageService.add({ severity: 'warn', key: 'eleccion', summary: 'Elección', detail: `Está seguro que desea ${accion} la materia prima de la solicitud?`, sticky: true });
  }

  confirmarSolicitud = (OT: any) => this.messageService.add({ severity: 'warn', key: 'solicitud', summary: 'Confirmar Elección', detail: `La cantidad a solicitar supera el limite de Kg permitidos para la OT ${OT}, ¿Desea solicitar de todas formas?`, sticky: true });

  confirmarEditarSolicitud = (Id: any) => this.messageService.add({ severity: 'warn', key: 'solicitud', summary: 'Confirmar Elección', detail: `La cantidad a solicitar supera el limite de Kg permitidos para la OT ${Id}, ¿Desea solicitar de todas formas?`, sticky: true });

  //Buscar informacion de la solicitud creada
  buscarinfoOrdenCompra() {
    //this.onReject('');
    this.load = true;
    setTimeout(() => {
      this.servicioDetSolicitudMpExt.GetSolicitudMp_Extrusion(this.nroSolicitud).pipe(takeUntil(this.destroy$)).subscribe(datos_solicitud => {
        for (let i = 0; i < datos_solicitud.length; i++) {
          let info: any = {
            Id: 0,
            Id_Mp: datos_solicitud[i].matPrima_Id,
            Id_Tinta: datos_solicitud[i].tinta_Id,
            Nombre: '',
            Cantidad: this.formatonumeros(datos_solicitud[i].cantidad),
            Medida: datos_solicitud[i].medida,
          }
          if (info.Id_Mp != 84) {
            info.Id = info.Id_Mp;
            info.Nombre = datos_solicitud[i].matPrima;
          } else if (info.Id_Tinta != 2001) {
            info.Id = info.Id_Tinta;
            info.Nombre = datos_solicitud[i].tinta;
          }
          this.informacionPDF.push(info);
          this.informacionPDF.sort((a, b) => a.Nombre.localeCompare(b.Nombre));
        }
        this.generarPDF(datos_solicitud);
      }, () => this.mensajeService.mensajeError(`Error`, `¡No se pudo obtener información de la última orden de compra creada!`));
    }, 100);
  }

  // Funcion que se encargará de poner la informcaion en el PDF y generarlo
  generarPDF(data: any) {
    let [ot, cliente, item, kg] = [this.infoOrdenTrabajo[0].ot, this.infoOrdenTrabajo[0].cliente, this.infoOrdenTrabajo[0].item, this.formatonumeros(this.infoOrdenTrabajo[0].kg)];
    let nombre: string = this.AppComponent.storage_Nombre;
    for (let i = 0; i < data.length; i++) {
      const pdfDefinicion: any = {
        info: { title: `Solicitud de material N° ${data[i].id}` },
        pageSize: { width: 630, height: 760 },
        watermark: { text: 'PLASTICARIBE SAS', color: 'red', opacity: 0.05, bold: true, italics: false },
        pageMargins: [25, 235, 25, 35],
        header: function (currentPage: any, pageCount: any) {
          return [
            {
              margin: [20, 1, 20, 0],
              columns: [
                { image: logoParaPdf, width: 150, height: 30, margin: [20, 25] },
                {
                  width: 300,
                  alignment: 'center',
                  table: {
                    body: [
                      [{ text: 'NIT. 800188732', bold: true, alignment: 'center', fontSize: 10 }],
                      [{ text: `Fecha de Análisis: ${moment().format('YYYY-MM-DD')}`, alignment: 'center', fontSize: 8 }],
                      [{ text: `Hora: ${moment().format('H:mm:ss')}`, alignment: 'center', fontSize: 8, }],
                      [{ text: `Usuario: ${nombre}`, alignment: 'center', fontSize: 8, }],
                      [{ text: `Solicitud de material N° ${data[i].id}`, bold: true, alignment: 'center', fontSize: 10 }],
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
                      [{ text: `Código: `, alignment: 'left', fontSize: 8, bold: true }, { text: '', alignment: 'left', fontSize: 8, margin: [0, 0, 30, 0] }],
                      [{ text: `Versión: `, alignment: 'left', fontSize: 8, bold: true }, { text: '', alignment: 'left', fontSize: 8, margin: [0, 0, 30, 0] }],
                      [{ text: `Vigencia: `, alignment: 'left', fontSize: 8, bold: true }, { text: '', alignment: 'left', fontSize: 8, margin: [0, 0, 30, 0] }],
                      [{ text: `Página: `, alignment: 'left', fontSize: 8, bold: true }, { text: `${currentPage.toString() + ' de ' + pageCount}`, alignment: 'left', fontSize: 8, margin: [0, 0, 30, 0] }],
                    ]
                  },
                  layout: 'noBorders',
                },
              ],
            },
            {
              margin: [30, 0],
              table: {
                headerRows: 1,
                widths: ['*'],
                body: [
                  [
                    {
                      border: [false, true, false, false],
                      text: '',
                    },
                  ],
                ]
              },
              layout: { defaultBorder: false, }
            },
            /** Titulo tabla OT */
            {
              margin: [20, 0],
              table: {
                headerRows: 1,
                widths: ['*'],
                body: [
                  [
                    { border: [false, false, false, false], text: `Detalles de la Orden de Trabajo`, bold: true, fontSize: 10, alignment: 'center' },
                  ],
                ]
              },
              layout: { defaultBorder: false, }
            },
            /** Encabezado y body tabla OT */
            {
              margin: [20, 0, 20, 28],
              style: 'header2',
              table: {
                headerRows: 1,
                widths: [60, 215, 215, 60],
                body: [
                  [
                    { text: 'OT', fillColor: '#bbb', fontSize: 9, bold: true },
                    { text: 'Cliente', fillColor: '#bbb', fontSize: 9, bold: true },
                    { text: 'Referencia', fillColor: '#bbb', fontSize: 9, bold: true },
                    { text: 'Cantidad', fillColor: '#bbb', fontSize: 9, bold: true },
                  ],
                  [ot, cliente, item, kg],
                ]
              },
              layout: { defaultBorder: false, },
            },
            /** Titulo de tabla materia prima */
            {
              margin: [20, 0],
              table: {
                headerRows: 1,
                widths: ['*'],
                body: [
                  [
                    { border: [false, false, false, false], text: `Materiales de producción solicitados`, bold: true, fontSize: 10, alignment: 'center' },
                  ],
                ]
              },
              layout: { defaultBorder: false, }
            },
            /**Encabezado tabla materia prima */
            {
              margin: [20, 0, 20, 0],
              table: {
                headerRows: 1,
                widths: [60, 372, 60, 60],
                body: [
                  [
                    { text: 'Id', fillColor: '#bbb', fontSize: 9 },
                    { text: 'Materia Prima', fillColor: '#bbb', fontSize: 9 },
                    { text: 'Cantidad', fillColor: '#bbb', fontSize: 9 },
                    { text: 'Medida', fillColor: '#bbb', fontSize: 9 },
                  ],
                ]
              },
              layout: { defaultBorder: false, },
            },
          ]
        },

        content: [
          this.table(this.informacionPDF, ['Id', 'Nombre', 'Cantidad', 'Medida']),
          {
            style: 'tablaTotales',
            table: {
              widths: [365, 60, 60, 60],
              style: 'header',
              body: [
                [
                  '',
                  {
                    border: [true, false, true, true],
                    text: `Peso Total`,
                    alignment: 'right',
                    bold: true
                  },
                  {
                    border: [false, false, true, true],
                    text: `${this.formatonumeros((this.calcularMateriaPrimaSolicitada()).toFixed(2))}`
                  },
                  {
                    border: [false, false, true, true],
                    text: `Kg`,
                    bold: true
                  },
                ],
              ]
            },
            layout: { defaultBorder: false, },
            fontSize: 8,
          },
          {
            text: `\n \nObservación sobre la solicitud: \n ${data[i].observacion}\n`,
            style: 'header',
          }
        ],

        styles: {
          header: { fontSize: 10, bold: true },
          header2: { fontSize: 9, bold: false },
          titulo: { fontSize: 20, bold: true }
        }
      }
      const pdf = pdfMake.createPdf(pdfDefinicion);
      pdf.open();
      this.nroSolicitud = 0;
      setTimeout(() => this.LimpiarCampos(), 1500);
      break;
    }
  }

  // funcion que se encagará de llenar la tabla de los productos en el pdf
  buildTableBody(data: any, columns: any) {
    var body: any[] = [];
    data.forEach(function (row) {
      var dataRow: any[] = [];
      columns.forEach(function (column) {
        dataRow.push(row[column].toString());
      });
      body.push(dataRow);
    });
    return body;
  }

  // Funcion que genera la tabla donde se mostrará la información de los productos pedidos
  table(data: any, columns: any) {
    return {
      table: {
        headerRows: 1,
        widths: [60, 365, 60, 60],
        body: this.buildTableBody(data, columns),
      },
      fontSize: 8,
    };
  }

  //Buscar informacion de las solicitudes de materia prima creadas
  consultarSolicitudMaterial() {
    let solicitud: number = this.FormMateriaPrimaRetiro.value.Solicitud;
    this.materiasPrimasSeleccionada_ID = [];
    this.materiasPrimasSeleccionadas = [];

    if (solicitud != null) {
      this.servicioDetSolicitudMpExt.GetSolicitudMp_Extrusion(solicitud).pipe(takeUntil(this.destroy$)).subscribe(data => {
        if (data.length > 0) {
          if (![4, 5].includes(data[0].estado)) {
            this.esSolicitud = true;
            this.load = false;
            this.FormMateriaPrimaRetiro.patchValue({ OTRetiro: data[0].ot, Maquina: data[0].maquina, ObservacionRetiro: data[0].observacion, })
            setTimeout(() => { this.infoOT(); }, 1000);
            for (let i = 0; i < data.length; i++) {
              this.llenarTablaMpConSolitudMP(data[i])
            }
          } else {
            this.mensajeService.mensajeAdvertencia(`Advertencia`, `No se pueden editar solicitudes con estado finalizado o cancelado!`);
            this.esSolicitud = false;
          }
        } else {
          this.mensajeService.mensajeAdvertencia(`Advertencia`, `La solicitud N° ${solicitud} no existe!`);
          this.infoOrdenTrabajo = [];
        }
      }, () => this.mensajeService.mensajeError(`Error`, `No se pudo obtener la solicitud de material consultada!`));
    } else this.mensajeService.mensajeAdvertencia(`Advertencia`, `El N° de la solicitud no es válido`);
    setTimeout(() => { this.load = true; }, 1500);
  }

  /** Llenar la tabla de materias primas seleccionadas con la info de la solicitud. */
  llenarTablaMpConSolitudMP(datos_solicitud: any) {
    let info: any = {
      Id: 0,
      Id_Mp: datos_solicitud.matPrima_Id,
      Id_Tinta: datos_solicitud.tinta_Id,
      Nombre: '',
      Stock: 0,
      Cantidad: datos_solicitud.cantidad,
      Und_Medida: datos_solicitud.medida,
      Proceso: 'EXT',
    }
    if (info.Id_Mp != 84) {
      info.Id = info.Id_Mp;
      info.Nombre = datos_solicitud.matPrima;
      info.Stock = datos_solicitud.stock_Mp;
    } else if (info.Id_Tinta != 2001) {
      info.Id = info.Id_Tinta;
      info.Nombre = datos_solicitud.tinta;
      info.Stock = datos_solicitud.stock_Tinta;
    }
    this.materiasPrimasSeleccionada_ID.push(info.Id);
    this.materiasPrimasSeleccionadas.push(info);
  }

  /** Editar Solicitudes de material de producción por Id */
  editarSolicitud() {
    this.load = false;
    let solicitudId: any = this.FormMateriaPrimaRetiro.value.Solicitud;
    let maquina: number = this.FormMateriaPrimaRetiro.value.Maquina;
    let ot: any = this.FormMateriaPrimaRetiro.value.OTRetiro;
    let observacion: any = this.FormMateriaPrimaRetiro.value.ObservacionRetiro;
    this.servicioSolicitudMpExt.GetId(solicitudId).subscribe(data => {
      const solicitud: modelSolicitudMP_Extrusion = {
        SolMpExt_Id: solicitudId,
        SolMpExt_OT: ot != null ? ot : data.solMpExt_OT,
        SolMpExt_Maquina: maquina != null ? maquina : data.solMpExt_Maquina,
        SolMpExt_Fecha: data.solMpExt_Fecha,
        SolMpExt_Hora: data.solMpExt_Hora,
        SolMpExt_Observacion: observacion != null ? observacion.toString() : '',
        Estado_Id: data.estado_Id,
        Proceso_Id: this.FormMateriaPrimaRetiro.value.ProcesoRetiro,
        Usua_Id: this.storage_Id
      }
      this.servicioSolicitudMpExt.Put(parseInt(solicitudId), solicitud).subscribe((datos) => {
        this.editarDetallesSolicitud(solicitudId);
        this.nroSolicitud = data.solMpExt_Id;
      }, () => {
        this.error = true;
        this.mensajeService.mensajeError(`Error`, `Error al crear la solicitud de material!`);
        this.load = true;
      });
    });
  }

  /** Editar detalles de solicitudes de material de producción por Id */
  editarDetallesSolicitud(solicitudId: number) {
    let errorId: boolean = false;
    for (let index = 0; index < this.materiasPrimasSeleccionadas.length; index++) {
      this.servicioDetSolicitudMpExt.GetSolicitudesConMatPrimas(solicitudId, this.materiasPrimasSeleccionadas[index].Id).subscribe(data1 => {
        if (data1.length == 0) {
          let detSolicitud: modelDetSolicitudMP_Extrusion = {
            Codigo: 0,
            SolMpExt_Id: solicitudId,
            MatPri_Id: this.materiasPrimasSeleccionadas[index].Id_Mp,
            Tinta_Id: this.materiasPrimasSeleccionadas[index].Id_Tinta,
            DtSolMpExt_Cantidad: this.materiasPrimasSeleccionadas[index].Cantidad,
            UndMed_Id: this.materiasPrimasSeleccionadas[index].Und_Medida
          }
          this.servicioDetSolicitudMpExt.Post(detSolicitud).subscribe(data2 => { errorId = false; }, error => {
            errorId = true;
            this.mensajeService.mensajeError(`Error`, `No fue posible insertar la solicitud y las materias primas, por favor verifique!`)
          });
        } else {
          let detSolicitud: modelDetSolicitudMP_Extrusion = {
            Codigo: data1[0],
            SolMpExt_Id: solicitudId,
            MatPri_Id: this.materiasPrimasSeleccionadas[index].Id_Mp,
            Tinta_Id: this.materiasPrimasSeleccionadas[index].Id_Tinta,
            DtSolMpExt_Cantidad: this.materiasPrimasSeleccionadas[index].Cantidad,
            UndMed_Id: this.materiasPrimasSeleccionadas[index].Und_Medida
          }
          this.servicioDetSolicitudMpExt.Put(data1[0], detSolicitud).subscribe(data3 => { errorId = false; }, error => {
            errorId = true;
            this.mensajeService.mensajeError(`Error`, `No fue posible actualizar la solicitud y las materias primas, por favor verifique!`)
          });
        }
      });
    }
    !errorId ? setTimeout(() => { this.load = true; this.solicitudExitosa(); }, 1000) : this.mensajeService.mensajeError(`Error`, 'No se mostrará la informacion del PDF, por favor, verifique!');
  }

  /** Función que obtendrá el ultimo Id de la solicitud */
  ultimoConsecutivoSolicitud(){
    this.servicioSolicitudMpExt.GetUltimaSolicitud().pipe(takeUntil(this.destroy$)).subscribe(data => 
      this.FormMateriaPrimaRetiro.patchValue({ Solicitud: (data + 1) })
    ), error => { 
      this.mensajeService.mensajeError(`Error cargando el N° de solicitud ${error.error.text}`);
    };
  } 

  /** Función para eliminar la materia prima de la solicitud de material de la base de datos. */
  eliminarMatPrimaSolicitud(mp: any) {
    mp = this.mpSeleccionada;
    this.servicioDetSolicitudMpExt.GetSolicitudesConMatPrimas(this.FormMateriaPrimaRetiro.value.Solicitud, mp.Id).subscribe(data => {
      if (data.length > 0) {
        this.onReject('eleccion');
        for (let i = 0; i < data.length; i++) {
          this.servicioDetSolicitudMpExt.Delete(data[i]).subscribe(() => {
            this.quitarMateriaPrima(mp);
            this.mensajeService.mensajeAdvertencia('Advertencia', `Se ha eliminado definitivamente la materia prima de la solicitud!`);
          }, () => { this.mensajeService.mensajeError(`Error`, `¡No se pudo eliminar la materia prima de la solicitud!`); });
        }
      } else this.quitarMateriaPrima(mp);
    });
  }
}
