import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShepherdService } from 'angular-shepherd';
import moment from 'moment';
import { MessageService } from 'primeng/api';
import { modelDetallesAsignacion } from 'src/app/Modelo/modelDetallesAsignacion';
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
import { MovimientoMPComponent } from '../movimientoMP/movimientoMP.component';
import { finalize, interval, Observable, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-asignacion-materia-prima',
  templateUrl: './asignacion-materia-prima.component.html',
  styleUrls: ['./asignacion-materia-prima.component.css']
})
export class AsignacionMateriaPrimaComponent implements OnInit, OnDestroy {

  @ViewChild('formularioAsignacion') formularioAsignacion!: ElementRef<HTMLFormElement>;
  @Output() asignacionCompletada = new EventEmitter<{ summary: string; detail: string }>();
  public FormMateriaPrimaRetiro !: FormGroup;
  public FormMateriaPrimaRetirada !: FormGroup;

  /* Variables*/
  storage_Id: any; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre: any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol: any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol: any; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  load: boolean = true; //Variable para validar que aparezca el icono de carga o no
  materiaPrima: any = []; //Variable que va almacenar el nombre de todas las materias primas existentes en la empresa
  materiasPrimasSeleccionadas: any = []; //Variable que va almacenar el nombre de todas las materias primas existentes en la empresa
  unidadMedida: any = []; //Varibale que va a almacenar las unidades de medida registradas en la base de datos
  procesos: any = []; //Variable que va a almacenar los procesos que tiene la empresa (extrusio, impresion, etc...)
  today: any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  kgOT: number = 0; //Variable que va alamacenar la cantidad de kilos que se piden en la orden de trabajo
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
  esSolicitud: boolean = false;
  esSolicitudDesdeReporte: boolean = false;
  arrayMatPrimas: any = [];
  hora: any = moment().format('H:mm:ss');
  expandedRows: any = {}; //Variable que controla las filas desplegadas de la tabla de subcategorias
  materialesTotales: any[] = []; //Cache de materiales con su subcategoria e stock, usado al desplegar cada subcategoria
  materialAConfirmar: any = null; //Material pendiente de confirmación antes de enviarlo a la tabla de asignación
  subcategoriaAConfirmar: any = null; //Subcategoria del material pendiente de confirmación
  private destroy$ = new Subject<void>(); // Variable para manejar la destrucción de las subscripciones y evitar fugas de memoria
  private operacionesAsignacionPendientes: number = 0;
  private procesoAsignacionActivo: boolean = false;
  private procesoAsignacionFallido: boolean = false;
  private errorAsignacionMostrado: boolean = false;
  private etapaAsignacion: 'guardando' | 'detalles' | 'movimientos' | 'estadoSolicitud' | 'completada' = 'guardando';
  private asignacionActual: number | null = null;
  private solicitudActual: number | null = null;
  subcategorias: any[] = [];

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
    private servicioSolitudMaterial: SolicitudMP_ExtrusionService,
    private servicioDetlSolitudMaterial: DetSolicitudMP_ExtrusionService,
    private servicioDetAsigMatPrima: DetallesAsignacionService,
    private srvMovEntradasMP: Movimientos_Entradas_MPService,
    private srvMovSalidasMP: Entradas_Salidas_MPService,
    private cmpMovMatPrima: MovimientoMPComponent,
  ) {

    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
    this.FormMateriaPrimaRetiro = this.frmBuilderMateriaPrima.group({
      OTRetiro: [null, Validators.required],
      OTImp: [''],
      Solicitud: [null],
      FechaRetiro: [this.today, Validators.required],
      Maquina: [null, Validators.required],
      kgOt: [null, Validators.required],
      ObservacionRetiro: [''],
      dateIn: [null, Validators.required],
    });

    this.FormMateriaPrimaRetirada = this.frmBuilderMateriaPrima.group({
      MpIdRetirada: ['', Validators.required],
      MpNombreRetirada: ['', Validators.required],
      MpCantidadRetirada: [null, Validators.required],
      MpUnidadMedidaRetirada: ['', Validators.required],
      MpStockRetirada: [null, Validators.required],
      ProcesoRetiro: ['', Validators.required],
      Categoria: ['', Validators.required],
      Precio: [0]
    });
  }

  /** Inicializa los catálogos y sincroniza el tema mientras el componente está activo. */
  ngOnInit(): void {
    this.lecturaStorage();
    this.obtenerUnidadMedida();
    this.obtenerProcesos();
    this.obtenerMateriaPrima();
    this.consultarCategorias();
    this.obtenerMaterialesPorSubcategoria('EXT');
    interval(1000).pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.modoSeleccionado = this.AppComponent.temaSeleccionado;
    });
  }

  /** Cancela las suscripciones activas al destruir el componente. */
  ngOnDestroy() {
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

  /** Limpia los formularios y restablece el modo de consulta de asignación.
   * @returns No retorna un valor.
   */
  LimpiarCampos() {
    this.FormMateriaPrimaRetirada.reset();
    this.FormMateriaPrimaRetiro.reset();
    this.FormMateriaPrimaRetiro.patchValue({ FechaRetiro: this.today, });
    this.cantRestante = 0;
    this.kgOT = 0;
    this.load = true;
    this.materiasPrimasSeleccionadas = [];
    this.soloTintas = false;
    this.categoriasSeleccionadas = [];
    this.infoOrdenTrabajo = [];
    this.esSolicitud = false;
    this.esSolicitudDesdeReporte = false;
    this.arrayMatPrimas = [];
    this.expandedRows = {};
  }

  /**
   * Limpia la solicitud consultada, su OT y máquina, y elimina los datos derivados de esa consulta.
   * @returns No retorna un valor.
   */
  limpiarSolicitudSeleccionada(): void {
    this.FormMateriaPrimaRetiro.patchValue({
      Solicitud: null,
      OTRetiro: null,
      Maquina: null,
    });
    this.infoOrdenTrabajo = [];
    this.materiasPrimasSeleccionadas = [];
    this.subcategorias = [];
    this.arrayMatPrimas = [];
    this.expandedRows = {};
    this.cantRestante = 0;
    this.kgOT = 0;
    this.esSolicitud = false;
  }

  //Funcion que limpiará los campos de la materia pirma entrante
  limpiarCamposMP = () => this.FormMateriaPrimaRetirada.reset();

  //Funcion que va almacenar todas las unidades de medida existentes en la empresa
  obtenerUnidadMedida = () => this.unidadMedidaService.srvObtenerLista().pipe(takeUntil(this.destroy$)).subscribe(data => this.unidadMedida = data);

  //Funcion que se encagará de obtener los procesos de la empresa
  obtenerProcesos = () => this.procesosService.srvObtenerLista().pipe(takeUntil(this.destroy$)).subscribe(data => this.procesos = data.filter((item) => item.proceso_Id != 'TINTAS'));

  //Funcion que va a recorrer las materias primas para almacenar el nombre de todas
  obtenerMateriaPrima() {
    this.materiaPrimaService.getMpTintaBopp().pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.materiaPrima = data.filter((item) => item.categoria != 6);
      this.materiaPrima.sort((a, b) => a.nombre.localeCompare(b.nombre));
    });
  }

  // Funcion que va a consultar las categorias de las tablas Materia_Prima, Tintas y BOPP
  consultarCategorias() {
    this.materiaPrimaService.GetCategoriasMateriaPrima().pipe(takeUntil(this.destroy$)).subscribe(datos => this.categoriasMP = datos);
    this.tintasService.GetCategoriasTintas().pipe(takeUntil(this.destroy$)).subscribe(datos => this.categoriasTintas = datos);
  }

  // Funcion que va a cargar todos los materiales con su subcategoria y stock, para mostrarlos al desplegar cada subcategoria de la solicitud
  obtenerMaterialesPorSubcategoria = (proceso: string) => this.materiaPrimaService.getSubcategories(proceso).pipe(takeUntil(this.destroy$)).subscribe(data => { this.materialesTotales = data; console.log(this.materialesTotales, 'hi') });

  // Funcion que se ejecuta al desplegar una subcategoria y carga sus materiales asociados con stock disponible
  onExpandSubcategoria(event: any) {
    event.data.materialesAsociados = this.materialesTotales.filter(x => x.id_Subcategoria == event.data.Id && x.stock > 0);
  }

  // Funcion que valida y muestra confirmación antes de enviar el material de la tabla expandida hacia la tabla de materias primas a asignar
  agregarMaterialDesdeSubcategoria(material: any, subcategoria: any) {
    const cantidad: number = Number(material.CantidadIngresada);
    if (!cantidad || cantidad <= 0) return this.mensajeService.mensajeAdvertencia(`Advertencia`, `La cantidad a asignar debe ser mayor a cero (0)!`);
    if (cantidad > material.stock) return this.mensajeService.mensajeAdvertencia(`Advertencia`, `La cantidad a asignar supera el stock disponible del material ${material.referencia}!`);
    if (this.materiasPrimasSeleccionadas.map(x => x.Id).includes(material.item)) {
      material.CantidadIngresada = null;
      return this.mensajeService.mensajeAdvertencia(`Advertencia`, `El material ${material.referencia} ya ha sido seleccionado!`);
    }

    const cantidadYaSeleccionada = this.materiasPrimasSeleccionadas.filter(x => x.SubCatMP_Id == subcategoria.Id).reduce((a, b) => a + Number(b.Cantidad || 0), 0);
    if ((cantidadYaSeleccionada + cantidad) > subcategoria.CantFaltante) {
      material.CantidadIngresada = null;
      return this.mensajeService.mensajeAdvertencia(`Advertencia`, `La cantidad total seleccionada de la subcategoria ${subcategoria.Nombre} supera la cantidad faltante por entregar!`);
    }

    this.materialAConfirmar = material;
    this.subcategoriaAConfirmar = subcategoria;
    console.log(material);
    console.log(subcategoria);
    this.messageService.add({ severity: 'warn', key: 'confirmarMaterial', summary: 'Confirmar Elección', detail: `¿Está seguro que desea asignar ${cantidad} ${subcategoria.Und_Medida} del material ${material.referencia}?`, sticky: true });
  }

  /** Confirma y agrega a la tabla de asignación el material validado en agregarMaterialDesdeSubcategoria */
  confirmarAgregarMaterial() {
    const material = this.materialAConfirmar;
    const subcategoria = this.subcategoriaAConfirmar;
    this.onReject('confirmarMaterial');
    if (!material || !subcategoria) return;

    const esTinta = this.categoriasTintas.includes(material.categoria);
    const info: any = {
      SubCatMP_Id: subcategoria.Id,
      Id: material.item,
      Id_Mp: esTinta ? 84 : material.item,
      Id_Tinta: esTinta ? material.item : 2001,
      Nombre: material.referencia,
      Stock: material.stock,
      Cantidad: Number(material.CantidadIngresada),
      CantAprobada: subcategoria.CantAprobada,
      CantOculta: subcategoria.Cantidad,
      CantFaltante: subcategoria.CantFaltante,
      Und_Medida: subcategoria.Und_Medida,
      Proceso: esTinta ? 'IMP' : 'EXT',
      Precio: material.precio,
      Subtotal: material.precio * Number(material.CantidadIngresada)
    }
    this.materiasPrimasSeleccionadas.push(info);
    this.mensajeService.mensajeConfirmacion('Confirmación', `Se ha agregado el material ${material.referencia} correctamente.`);
    material.CantidadIngresada = null;
    this.materialAConfirmar = null;
    this.subcategoriaAConfirmar = null;
  }

  // Funciones que totalizan la tabla de materiales de la subcategoria desplegada
  calcularTotalStockMateriales = (materiales: any[]): number => (materiales || []).reduce((a, b) => a + Number(b.stock || 0), 0);

  calcularTotalCantidadMateriales = (materiales: any[]): number => (materiales || []).reduce((a, b) => a + Number(b.CantidadIngresada || 0), 0);

  // Funcion que va a consultar la orden de trabajo para saber que cantidad de materia prima se ha asignado y que cantidad se ha devuelto con respecto a la cantidad que se debe hacer en kg
  infoOT() {
    let ot: string = this.FormMateriaPrimaRetiro.value.OTRetiro;
    this.load = false;

    if (!ot) {
      this.load = true;
      this.mensajeService.mensajeError(`Error`, `Debe ingresar una OT.`);
      return;
    }

    this.bagProServices.srvObtenerListaClienteOT_Item(ot)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.load = true)
      ).subscribe({
        next: datos_procesos => {
          if (!datos_procesos || datos_procesos.length === 0) {
            this.mensajeService.mensajeError('¡Error!', `La OT N° ${ot} no se encuentra registrada en BagPro.`);
            return;
          }

          for (let index = 0; index < datos_procesos.length; index++) {
            let adicional: number = datos_procesos[index].datosotKg * 0.05;
            this.kgOT = datos_procesos[index].datosotKg + adicional;
            this.estadoOT = datos_procesos[index].estado;
            this.FormMateriaPrimaRetiro.patchValue({ kgOt: parseFloat(datos_procesos[index].datosotKg + adicional) });
            this.cargarInformacionOT(ot, datos_procesos[index]);
            break;
          }
        },
        error: error => {
          const mensaje = error instanceof Error ? error.message : `Error al consultar la OT ${ot}.`;
          this.mensajeService.mensajeError(`Error`, mensaje);
        }
      });
  }

  cargarInformacionOT(ot: string, datos_procesos) {
    this.detallesAsignacionService.getMateriasPrimasAsignadas(parseInt(ot)).pipe(takeUntil(this.destroy$)).subscribe(datos_asignacion => {
      this.cantRestante = this.kgOT - datos_asignacion;

      let info: any = {
        'ot': ot,
        'cliente': datos_procesos.clienteNom,
        'item': datos_procesos.clienteItems,
        'referencia': datos_procesos.clienteItemsNom,
        'kg': this.kgOT,
        'kgRestante': this.cantRestante,
        'cantAsignada': datos_asignacion,
        'cantPedida': datos_procesos.datosotKg,
        'und': datos_procesos.ptPresentacionNom.trim(),
      };
      info.und == 'Kilo' ? info.cantPedida = datos_procesos.datosotKg : info.und == 'Unidad' ? info.cantPedida = datos_procesos.datoscantBolsa : info.und == 'Paquete' ? datos_procesos.datoscantBolsa : info.cantPedida = datos_procesos.datosotKg;
      info.und == 'Kilo' ? info.und = 'Kg' : info.und == 'Unidad' ? info.und = 'Und' : info.und == 'Paquete' ? info.und = 'Paquete' : info.und = 'Kg'
      this.infoOrdenTrabajo = [];
      this.infoOrdenTrabajo.push(info);
    });
  }

  //Funcion que va a mostrar el nombre de la materia prima
  cambiarNombreMateriaPrima(dato: number) {
    this.load = false;
    let id: number = dato == 1 ? this.FormMateriaPrimaRetirada.value.MpIdRetirada : this.FormMateriaPrimaRetirada.value.MpNombreRetirada;

    if (id == null) {
      this.load = true;
      this.mensajeService.mensajeError(`Error`, `Debe ingresar una materia prima.`);
      return;
    }

    this.materiaPrimaService.getInfoMpTintaBopp(id).pipe(takeUntil(this.destroy$), finalize(() => this.load = true)).subscribe({
      next: datos_materiaPrima => {
        for (let i = 0; i < datos_materiaPrima.length; i++) {
          if (this.categoriasMP.includes(datos_materiaPrima[i].categoria) || this.categoriasTintas.includes(datos_materiaPrima[i].categoria)) {
            if (![84, 2001, 88, 89, 2072].includes(datos_materiaPrima[i].id)) {
              this.FormMateriaPrimaRetirada.patchValue({
                MpIdRetirada: datos_materiaPrima[i].id,
                MpNombreRetirada: datos_materiaPrima[i].nombre,
                MpCantidadRetirada: 0,
                MpUnidadMedidaRetirada: datos_materiaPrima[i].undMedida,
                MpStockRetirada: datos_materiaPrima[i].stock,
                ProcesoRetiro: this.categoriasMP.includes(datos_materiaPrima[i].categoria) ? 'EXT' : 'IMP',
                Categoria: datos_materiaPrima[i].categoria,
                Precio: datos_materiaPrima[i].precio
              });
            }
          }
        }
      }, error: error => {
        console.log(error);
        this.limpiarCamposMP();
      }
    });
  }

  // Funcion para colocar la materia prima en la tabla
  validarCamposVaciosMPRetirada() {
    if (this.FormMateriaPrimaRetirada.valid) {
      if (this.FormMateriaPrimaRetirada.value.MpCantidadRetirada != 0) {
        if (!this.materiasPrimasSeleccionadas.map(x => x.Id).includes(this.FormMateriaPrimaRetirada.value.MpIdRetirada)) {
          if (this.FormMateriaPrimaRetirada.value.ProcesoRetiro != '') {
            if (this.FormMateriaPrimaRetirada.value.MpCantidadRetirada <= this.FormMateriaPrimaRetirada.value.MpStockRetirada) this.cargarMateriaPrimaSeleccionada();
            else this.mensajeService.mensajeAdvertencia(`¡Advertencia!`, `¡La cantidad a asignar supera a la cantidad en stock!`);
          } else this.mensajeService.mensajeAdvertencia(`¡Advertencia!`, `¡Debe seleccionar el proceso el cuál va dirigida la materia prima!`);
        } else this.mensajeService.mensajeAdvertencia(`¡Advertencia!`, `¡La materia prima ${this.FormMateriaPrimaRetirada.value.MpNombreRetirada} ya ha sido seleccionada!`);
      } else this.mensajeService.mensajeAdvertencia(`¡Advertencia!`, `¡La cantidad a asignar debe ser mayor a cero (0)!`);
    } else this.mensajeService.mensajeAdvertencia(`¡Advertencia!`, `¡Hay campos vacios en el formulario de materia prima!`);
  }

  cargarMateriaPrimaSeleccionada() {
    let categoria: number = this.FormMateriaPrimaRetirada.value.Categoria;
    let info: any = {
      Id: this.FormMateriaPrimaRetirada.value.MpIdRetirada,
      Id_Mp: 84,
      Id_Tinta: 2001,
      Nombre: this.FormMateriaPrimaRetirada.value.MpNombreRetirada,
      Cantidad: this.FormMateriaPrimaRetirada.value.MpCantidadRetirada,
      Cantidad2: this.FormMateriaPrimaRetirada.value.MpCantidadRetirada,
      CantAprobada: 0,
      CanOculta: 0,
      Und_Medida: this.FormMateriaPrimaRetirada.value.MpUnidadMedidaRetirada,
      Proceso: this.FormMateriaPrimaRetirada.value.ProcesoRetiro,
      Categoria: this.FormMateriaPrimaRetirada.value.Categoria,
      Stock: this.FormMateriaPrimaRetirada.value.MpStockRetirada,
      Precio: this.FormMateriaPrimaRetirada.value.Precio
    }
    if (this.categoriasTintas.includes(categoria)) info.Id_Tinta = info.Id;
    else if (this.categoriasMP.includes(categoria)) info.Id_Mp = info.Id;
    this.categoriasSeleccionadas.push(this.FormMateriaPrimaRetirada.value.Categoria);
    this.materiasPrimasSeleccionadas.push(info);
    this.limpiarCamposMP();
  }

  // Funcion que va a calcular la cantidad de materia prima asignada
  calcularMateriaPrimaAsignada = (): number => this.materiasPrimasSeleccionadas.filter(x => x.Categoria != 18).reduce((a, b) => a + b.Cantidad, 0);

  // Funcion que va a quitar la materia prima
  quitarMateriaPrima(data: any) {
    this.onReject('eleccion');
    data = this.mpSeleccionada;
    this.materiasPrimasSeleccionadas.splice(this.materiasPrimasSeleccionadas.findIndex((item) => item.Id == data.Id), 1);
  }

  /**
   * Valida el formulario y los materiales antes de realizar la asignación.
   * @returns No retorna un valor.
   */
  validarCamposVaciosRetirada() {
    let maquina: number = this.FormMateriaPrimaRetiro.value.Maquina;
    if (this.FormMateriaPrimaRetiro.valid) {
      if (this.materiasPrimasSeleccionadas.length != 0) {
        if (maquina >= 1 && maquina != 0) this.asignacionMateriaPrima();
        else {
          this.load = true;
          this.mensajeService.mensajeAdvertencia(`¡Advertencia!`, '¡El numero de la maquina no es valido!');
        }
      } else {
        this.load = true;
        this.mensajeService.mensajeAdvertencia(`¡Advertencia!`, '¡Debe seleccionar minimo una materia prima para crear la asignación!');
      }
    } else {
      this.load = true;
      this.mensajeService.mensajeAdvertencia(`¡Advertencia!`, '¡Debe llenar los campos vacios!');
      this.scrollToFirstInvalidField();
    }
  }

  /**
   * Desplaza suavemente el formulario hasta el primer control inválido.
   * @returns No retorna un valor.
   */
  private scrollToFirstInvalidField(): void {
    const controlInvalido = this.formularioAsignacion.nativeElement
      .querySelector<HTMLElement>('[formControlName].ng-invalid');

    controlInvalido?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  //3. Funcion que asignará la materia prima a una Orden de trabajo y Proceso y lo guardará en la base de datos
  asignacionMateriaPrima() {
    let idOrdenTrabajo: number = this.FormMateriaPrimaRetiro.value.OTRetiro;

    // Solo las OT en estado 1 o 4 (cerradas) bloquean la asignación
    if (![1, 4].includes(Number(this.estadoOT))) {
      if (this.calcularMateriaPrimaAsignada() <= this.cantRestante) this.crearAsignacion();
      else {
        if (this.categoriasSeleccionadas.includes(7) || this.categoriasSeleccionadas.includes(8)) {
          this.soloTintas = true;
          this.crearAsignacion();
        } else {
          if (![1, 104].includes(this.ValidarRol)) this.mensajeService.mensajeAdvertencia(`¡Advertencia!`, `¡La cantidad a asignar supera el limite de Kg permitidos para la OT ${idOrdenTrabajo}, Debe solicitar permisos a un usuario administrador.`);
          else if ([1, 104].includes(this.ValidarRol)) this.confirmarAsignacion(idOrdenTrabajo);
        }
      }
    } else this.mensajeService.mensajeAdvertencia(`¡Advertencia!`, `¡No es posible asignar a la OT ${idOrdenTrabajo}, porque ya se encuentra cerrada!`);
  }

  /**
   * Crea la asignación e inicia el seguimiento de sus operaciones asociadas.
   * @returns No retorna un valor.
   */
  crearAsignacion() {
    if (this.procesoAsignacionActivo) return;

    this.onReject('asignacion');
    this.load = false;
    this.procesoAsignacionActivo = true;
    this.procesoAsignacionFallido = false;
    this.errorAsignacionMostrado = false;
    this.operacionesAsignacionPendientes = 0;
    this.etapaAsignacion = 'guardando';
    this.asignacionActual = null;
    this.solicitudActual = this.FormMateriaPrimaRetiro.value.Solicitud || 1;

    const datosAsignacion: any = {
      AsigMP_OrdenTrabajo: this.FormMateriaPrimaRetiro.value.OTRetiro,
      AsigMp_FechaEntrega: this.today,
      AsigMp_Observacion: this.FormMateriaPrimaRetiro.value.ObservacionRetiro,
      Estado_Id: 13,
      AsigMp_Maquina: this.FormMateriaPrimaRetiro.value.Maquina,
      Usua_Id: this.storage_Id,
      Estado_OrdenTrabajo: 14,
      AsigMp_Hora: moment().format('H:mm:ss'),
      SolMpExt_Id: this.FormMateriaPrimaRetiro.value.Solicitud == null || this.FormMateriaPrimaRetiro.value.Solicitud == "" ? 1 : this.FormMateriaPrimaRetiro.value.Solicitud,
      AsigMp_FechaRealEntrega: moment(this.FormMateriaPrimaRetiro.value.dateIn).format('YYYY-MM-DD'),
    }

    // Se guarda la asignación en la base de datos, y posteriormente se llama al método para guardar los detalles de la asignación.
    this.ejecutarOperacionAsignacion(
      this.asignacionMPService.srvGuardar(datosAsignacion),
      '¡Error al crear la asignación de materia prima!',
      datos => {
        const asignacion = datos?.asigMp_Id;
        if (asignacion == null) {
          this.fallarProcesoAsignacion('No se recibió el identificador de la asignación creada.');
          return;
        }

        this.asignacionActual = asignacion;
        this.etapaAsignacion = 'detalles';
        this.obtenerProcesoId(asignacion, this.solicitudActual);
      }
    );
  }

  /**
   * Registra los detalles de asignación y actualiza el inventario de los materiales seleccionados.
   * @param asignacion Identificador de la asignación creada.
   * @param solicitud Identificador de la solicitud asociada.
   * @returns No retorna un valor.
   */
  obtenerProcesoId(asignacion: number, solicitud?: any) {
    for (let i = 0; i < this.materiasPrimasSeleccionadas.length; i++) {
      let polietileno_Id = this.materiasPrimasSeleccionadas[i].Id_Mp;
      let tinta_Id = this.materiasPrimasSeleccionadas[i].Id_Tinta;
      let matPrima_Id = this.materiasPrimasSeleccionadas[i].Id;
      let matPrima_Nombre = this.materiasPrimasSeleccionadas[i].Nombre;
      let cantidad = this.materiasPrimasSeleccionadas[i].Cantidad;
      let presentacion = this.materiasPrimasSeleccionadas[i].Und_Medida;
      let proceso = this.materiasPrimasSeleccionadas[i].Proceso;
      let precio = this.materiasPrimasSeleccionadas[i].Precio;

      // Validar antes de asignar si la materia prima es un polietileno o es tinta.
      if (polietileno_Id == 84 && tinta_Id != 2001)
        this.guardarAsignacionTinta(asignacion, matPrima_Id, matPrima_Nombre, cantidad, presentacion, proceso, precio);
      else if (polietileno_Id != 84 && tinta_Id == 2001 && !this.soloTintas)
        this.guardarAsignacionPolietileno(asignacion, matPrima_Id, matPrima_Nombre, cantidad, presentacion, proceso, precio);
    }
  }

  /**
   * Guarda el detalle de una tinta y descuenta su inventario.
   * @param asignacion Identificador de la asignación.
   * @param id_tinta Identificador de la tinta.
   * @param nombreTinta Nombre de la tinta para el mensaje de error.
   * @param cantidad Cantidad asignada.
   * @param presentacion Unidad de medida.
   * @param proceso Identificador del proceso.
   * @param precio Precio unitario.
   * @returns No retorna un valor.
   */
  guardarAsignacionTinta(asignacion, id_tinta, nombreTinta, cantidad, presentacion, proceso, precio) {
    const datosDetallesAsignacionTintas: any = {
      AsigMp_Id: asignacion,
      Tinta_Id: id_tinta,
      DtAsigTinta_Cantidad: cantidad,
      UndMed_Id: presentacion,
      Proceso_Id: proceso,
      DtAsigTinta_Precio: precio,
      DtAsigTinta_Subtotal: precio * cantidad
    }

    this.ejecutarOperacionAsignacion(
      this.detallesAsignacionTintas.srvGuardar(datosDetallesAsignacionTintas),
      `¡Error al insertar la tinta asignada ${nombreTinta}!`
    );
    this.moverInventarioTintas(id_tinta, cantidad);
  }

  /**
   * Guarda el detalle de materia prima y descuenta su inventario.
   * @param asignacion Identificador de la asignación.
   * @param idMatPrima Identificador de la materia prima.
   * @param nombreMatPrima Nombre de la materia prima para el mensaje de error.
   * @param cantidad Cantidad asignada.
   * @param presentacion Unidad de medida.
   * @param proceso Identificador del proceso.
   * @param precio Precio unitario.
   * @returns No retorna un valor.
   */
  guardarAsignacionPolietileno(asignacion, idMatPrima, nombreMatPrima, cantidad, presentacion, proceso, precio) {
    const datosDetallesAsignacion: modelDetallesAsignacion = {
      AsigMp_Id: asignacion,
      MatPri_Id: idMatPrima,
      DtAsigMp_Cantidad: cantidad,
      UndMed_Id: presentacion,
      Proceso_Id: proceso,
      DtAsigMp_Precio: precio,
      DtAsigMp_Subtotal: (precio * cantidad)
    }
    this.ejecutarOperacionAsignacion(
      this.detallesAsignacionService.srvGuardar(datosDetallesAsignacion),
      `¡Error al insertar la materia prima asignada ${nombreMatPrima}!`
    );
    this.moverInventarioMpPedida(idMatPrima, cantidad);
  }

  /**
   * Continúa el proceso por etapas cuando ya terminaron las operaciones actuales.
   * @returns No retorna un valor.
   */
  private avanzarProcesoAsignacion(): void {
    if (!this.procesoAsignacionActivo || this.operacionesAsignacionPendientes > 0) return;

    if (this.procesoAsignacionFallido) {
      this.procesoAsignacionActivo = false;
      return;
    }

    if (this.etapaAsignacion === 'guardando') {
      this.fallarProcesoAsignacion('No se recibió respuesta al crear la asignación.');
      return;
    }

    if (this.etapaAsignacion === 'detalles') {
      this.etapaAsignacion = 'movimientos';
      this.actualizarMovimientosEntradasMP(this.asignacionActual!);
      this.avanzarProcesoAsignacion();
      return;
    }

    if (this.etapaAsignacion === 'movimientos') {
      if (this.esSolicitud) {
        const solicitud = this.solicitudActual;
        if (solicitud === null) {
          this.fallarProcesoAsignacion('No se recibió el identificador de la solicitud.');
          this.avanzarProcesoAsignacion();
          return;
        }

        this.etapaAsignacion = 'estadoSolicitud';
        this.ejecutarOperacionAsignacion(
          this.servicioSolitudMaterial.PutEstadoSolicitud(solicitud),
          '¡Error al actualizar el estado de la solicitud!'
        );
        return;
      }

      this.etapaAsignacion = 'completada';
    } else if (this.etapaAsignacion === 'estadoSolicitud') {
      this.etapaAsignacion = 'completada';
    }

    if (this.etapaAsignacion === 'completada') {
      this.procesoAsignacionActivo = false;
      this.load = true;
      this.asignacionExitosa(this.asignacionActual!, this.solicitudActual);
    }
  }

  /**
   * Ejecuta y contabiliza una operación HTTP que forma parte de la asignación.
   * @param operacion Observable de la operación HTTP.
   * @param mensajeError Mensaje a mostrar si la operación falla.
   * @param alExito Acción a ejecutar con la respuesta exitosa, si aplica.
   * @returns No retorna un valor.
   */
  private ejecutarOperacionAsignacion<T>(
    operacion: Observable<T>,
    mensajeError: string,
    alExito: (respuesta: T) => void = () => undefined
  ): void {
    this.operacionesAsignacionPendientes++;
    operacion.pipe(takeUntil(this.destroy$)).subscribe({
      next: respuesta => alExito(respuesta),
      error: () => {
        this.operacionesAsignacionPendientes--;
        this.fallarProcesoAsignacion(mensajeError);
        this.avanzarProcesoAsignacion();
      },
      complete: () => {
        this.operacionesAsignacionPendientes--;
        this.avanzarProcesoAsignacion();
      }
    });
  }

  /**
   * Detiene el indicador de carga y notifica el primer error de la asignación.
   * @param mensajeError Mensaje que describe la operación fallida.
   * @returns No retorna un valor.
   */
  private fallarProcesoAsignacion(mensajeError: string): void {
    this.procesoAsignacionFallido = true;
    this.load = true;

    if (!this.errorAsignacionMostrado) {
      this.errorAsignacionMostrado = true;
      this.mensajeService.mensajeError('¡Error!', mensajeError);
    }
  }

  /**
   * Prepara el mensaje de éxito, genera el PDF correspondiente y notifica al reporte si aplica.
   * @param asignId Identificador de la asignación creada.
   * @param solicitud Identificador de la solicitud asociada.
   * @returns No retorna un valor.
   */
  asignacionExitosa(asignId: number, solicitud?: any) {
    let data: any = {};
    let summary: string;
    let detail: string;

    if (!this.soloTintas && !this.esSolicitud) {
      summary = '¡Asignación Creada!';
      detail = 'Asignación creada satisfactoriamente!. A continuación se mostrará un PDF en una nueva pestaña.';
      data = { 'Id': asignId, 'Movimiento': 'ASIGMP' };
      this.cmpMovMatPrima.validarTipoMovimiento(data);
    } else if (this.soloTintas && this.calcularMateriaPrimaAsignada() > this.cantRestante && !this.esSolicitud) {
      summary = '¡Asignación Creada!';
      detail = 'Solo se crearon las asignaciones de tintas!';
      data = { 'Id': asignId, 'Movimiento': 'ASIGTINTAS' };
    } else if (this.esSolicitud) {
      summary = 'Confirmación';
      detail = 'Asignación basada en solicitud generada satisfactoriamente!';
      data = { 'Id': asignId, 'Movimiento': 'ASIGMP' };
      this.cmpMovMatPrima.validarTipoMovimiento(data);
    } else {
      summary = '¡Asignación Creada!';
      detail = 'Asignación creada satisfactoriamente.';
    }

    if (this.esSolicitudDesdeReporte) this.asignacionCompletada.emit({ summary, detail });
    else this.mensajeService.mensajeConfirmacion(summary, detail);

    setTimeout(() => this.LimpiarCampos(), 1000);
  }

  /**
   * Consulta y actualiza el stock de la materia prima asignada.
   * @param idMateriaPrima Identificador de la materia prima.
   * @param cantidadMateriaPrima Cantidad que se debe descontar.
   * @returns No retorna un valor.
   */
  moverInventarioMpPedida(idMateriaPrima: number, cantidadMateriaPrima: number) {
    this.ejecutarOperacionAsignacion(
      this.materiaPrimaService.srvObtenerListaPorId(idMateriaPrima),
      `¡Error al consultar el inventario de la materia prima ${idMateriaPrima}!`,
      datosMateriaPrima => {
        const datosMP: any = {
          MatPri_Id: idMateriaPrima,
          MatPri_Nombre: datosMateriaPrima.matPri_Nombre,
          MatPri_Descripcion: datosMateriaPrima.matPri_Descripcion,
          MatPri_Stock: datosMateriaPrima.matPri_Stock - cantidadMateriaPrima,
          UndMed_Id: datosMateriaPrima.undMed_Id,
          CatMP_Id: datosMateriaPrima.catMP_Id,
          MatPri_Precio: datosMateriaPrima.matPri_Precio,
          TpBod_Id: datosMateriaPrima.tpBod_Id,
          MatPri_Fecha: datosMateriaPrima.matPri_Fecha,
          MatPri_Hora: datosMateriaPrima.matPri_Hora,
          MatPri_PrecioEstandar: datosMateriaPrima.matPri_PrecioEstandar,
          SubCatMP_Id: datosMateriaPrima.subCatMP_Id
        };
        this.ejecutarOperacionAsignacion(
          this.materiaPrimaService.srvActualizar(idMateriaPrima, datosMP),
          `¡Error al mover el inventario de la materia prima ${datosMateriaPrima.matPri_Nombre}!`
        );
      }
    );
  }

  /**
   * Consulta y actualiza el stock de la tinta asignada.
   * @param idMateriaPrima Identificador de la tinta.
   * @param cantidad Cantidad que se debe descontar.
   * @returns No retorna un valor.
   */
  moverInventarioTintas(idMateriaPrima: number, cantidad: number) {
    this.ejecutarOperacionAsignacion(
      this.tintasService.srvObtenerListaPorId(idMateriaPrima),
      `¡Error al consultar el inventario de la tinta ${idMateriaPrima}!`,
      datosTintas => {
        const datosActualizacion: any = {
          Tinta_Id: idMateriaPrima,
          Tinta_Nombre: datosTintas.tinta_Nombre,
          Tinta_Descripcion: datosTintas.tinta_Descripcion,
          Tinta_CodigoHexadecimal: datosTintas.tinta_CodigoHexadecimal,
          Tinta_Stock: datosTintas.tinta_Stock - cantidad,
          UndMed_Id: datosTintas.undMed_Id,
          Tinta_Precio: datosTintas.tinta_Precio,
          CatMP_Id: datosTintas.catMP_Id,
          TpBod_Id: datosTintas.tpBod_Id,
          Tinta_InvInicial: datosTintas.tinta_InvInicial,
          Tinta_FechaIngreso: datosTintas.tinta_FechaIngreso,
          Tinta_Hora: datosTintas.tinta_Hora,
          Tinta_PrecioEstandar: datosTintas.tinta_PrecioEstandar,
        };
        this.ejecutarOperacionAsignacion(
          this.tintasService.srvActualizar(idMateriaPrima, datosActualizacion),
          `¡Error al mover el inventario de la tinta ${datosTintas.tinta_Nombre}!`
        );
      }
    );
  }

  /** Cerrar Dialogo de eliminación*/
  onReject = (dato: any) => this.messageService.clear(dato);

  /** Función para mostrar una elección de eliminación de OT/Rollo de la tabla. */
  mostrarEleccion(item: any) {
    this.mpSeleccionada = item;
    this.messageService.add({ severity: 'warn', key: 'eleccion', summary: 'Elección', detail: `Está seguro que desea quitar la materia prima de la asignación?`, sticky: true });
  }

  confirmarAsignacion = (OT: any) => this.messageService.add({ severity: 'warn', key: 'asignacion', summary: 'Confirmar Elección', detail: `La cantidad de Kg a asignar supera el limite de Kg permitidos para la OT ${OT}, ¿Desea continuar con la asignación?`, sticky: true });

  /** Consulta una solicitud e identifica si se abrió desde el reporte.
   * @param subcategoriasSolicitudes Subcategorías cargadas por el reporte, si aplica.
   * @param desdeReporte Indica si la consulta se inició desde el popup del reporte.
   * @returns No retorna un valor.
   */
  consultarSolicitudMaterial(subcategoriasSolicitudes: any, desdeReporte: boolean = false) {
    this.materiasPrimasSeleccionadas = [];
    this.arrayMatPrimas = [];
    this.expandedRows = {};
    this.subcategorias = [];
    let solicitud: number = this.FormMateriaPrimaRetiro.value.Solicitud;
    this.esSolicitud = false;
    this.esSolicitudDesdeReporte = desdeReporte;
    if (desdeReporte) this.FormMateriaPrimaRetiro.patchValue({ dateIn: null });
    this.load = false;

    if (solicitud) {
      this.servicioDetlSolitudMaterial.GetSolicitudMp_Extrusion(solicitud)
        .pipe(takeUntil(this.destroy$), finalize(() => this.load = true))
        .subscribe({
          next: data => {
            if (data.length > 0) {
              if (![4, 5].includes(data[0].estado)) {
                this.load = false;
                this.llenarDatosAsignacion(data);
                subcategoriasSolicitudes ? this.cargarSubcategoriasEnAsignaciones(subcategoriasSolicitudes) : this.construirSubcategoriasDesdeSolicitud(data);
              } else this.mensajeService.mensajeAdvertencia(`Advertencia`, `No es posible cargar solicitudes finalizadas o canceladas!`);
            } else this.mensajeService.mensajeAdvertencia(`Advertencia`, `La solicitud N° ${solicitud} no existe!`);
          }, error: error => {
            const mensaje = error instanceof Error ? error.message : `No se pudo obtener la solicitud de material consultada!`;
            this.mensajeService.mensajeError(`Error`, mensaje);
          }
        });
    } else this.mensajeService.mensajeAdvertencia(`Advertencia`, `El valor ingresado en el campo solicitud no es válido`);
  }

  // Función que llenará los campos de la asignación con la información de la solicitud consultada
  llenarDatosAsignacion(data: any) {
    this.FormMateriaPrimaRetiro.patchValue({
      'OTRetiro': data[0].ot,
      'Maquina': data[0].maquina,
      'ObservacionRetiro': data[0].observacion,
    });
    this.infoOT();
    this.esSolicitud = true;
  }

  /** Construir la tabla de subcategorias con el mismo mapeo que usa el modal de Reporte_SolicitudMpExtrusionComponent */
  construirSubcategoriasDesdeSolicitud(data: any[]) {
    this.subcategorias = data.map(item => ({
      'Codigo': item.codigo,
      'Solicitud': item.id,
      'Id': item.id_Subcategoria,
      'Nombre': item.subcategoria,
      'Cantidad': item.cantidad_Pedida,
      'CantAprobada': item.cantidad_Entregada || 0,
      'CantFaltante': item.cantidad_Restante || 0,
      'Und_Medida': item.medida,
    }));
  }

  llenarInformacionSolicitud(info: any, arrayIds: any[]) {
    this.servicioDetAsigMatPrima.GetAsignacionesConSolicitudes(info.IdSolicitud).pipe(takeUntil(this.destroy$)).subscribe(data2 => {
      for (let i = 0; i < data2.length; i++) {
        let infoAsignaciones: any = {
          Ident: 0,
          Id_Mp: data2[i].matPri_Id,
          Id_Tinta: data2[i].tinta_Id,
          CantAsignaciones: data2[i].cantMP
        }
        if (infoAsignaciones.Id_Mp != 84) infoAsignaciones.Ident = infoAsignaciones.Id_Mp;
        else if (infoAsignaciones.Id_Tinta != 2001) infoAsignaciones.Ident = infoAsignaciones.Id_Tinta;
        if (arrayIds.includes(infoAsignaciones.Ident)) {
          info.CantAprobada = infoAsignaciones.CantAsignaciones;
          info.Cantidad -= infoAsignaciones.CantAsignaciones;
        }
      }
    });
    this.arrayMatPrimas.push(info.Id);
    this.materiasPrimasSeleccionadas.push(info);
  }

  /**
   * Valida que todos los materiales seleccionados tengan stock suficiente.
   * @returns No retorna un valor.
   */
  validarStockMateriales() {
    const stockInsuficiente = this.materiasPrimasSeleccionadas.some(
      material => Number(material.Cantidad) > Number(material.Stock)
    );

    if (stockInsuficiente) {
      this.load = true;
      this.mensajeService.mensajeAdvertencia(
        'Advertencia',
        'Existen materiales con cantidades solicitadas mayores a su stock, por favor, verifique!'
      );
      return;
    }

    this.validarCamposVaciosRetirada();
  }

  //TODO: Función que validará el nuevo estado de la solicitud 
  validarEstadoSolicitud() {
    let cantItemsFinalizados: number = 0;
    let cantItemsParciales: number = 0;
    let cantItems: number = this.arrayMatPrimas.length;
    let estadoSolicitud: number = 0;

    if (this.esSolicitud) {
      for (let index = 0; index < this.arrayMatPrimas.length; index++) {
        if (this.arrayMatPrimas.includes(this.materiasPrimasSeleccionadas.map(x => x.Id)[index])) {
          if ((this.materiasPrimasSeleccionadas[index].Cantidad + this.materiasPrimasSeleccionadas[index].CantAprobada) >= this.materiasPrimasSeleccionadas[index].CantOculta) {
            cantItemsFinalizados += 1;
          } else if ((this.materiasPrimasSeleccionadas[index].Cantidad + this.materiasPrimasSeleccionadas[index].CantAprobada) < this.materiasPrimasSeleccionadas[index].CantOculta) {
            cantItemsParciales += 1;
          }
        }
      }
      if (cantItemsFinalizados == cantItems) estadoSolicitud = 5;
      else if (cantItemsFinalizados < cantItems && cantItemsParciales >= 0) estadoSolicitud = 12;
      else estadoSolicitud = 11;
      this.actualizarEstadoSolicitud(estadoSolicitud);
    }
  }

  //TODO: Actualizar estado de las solicitudes de material de producción.
  actualizarEstadoSolicitud(estado: number) {
    let solicitud_Id: number = this.FormMateriaPrimaRetiro.value.Solicitud;

    this.servicioSolitudMaterial.GetId(solicitud_Id).pipe(takeUntil(this.destroy$)).subscribe(data => {
      let modelo: modelSolicitudMP_Extrusion = {
        SolMpExt_Id: solicitud_Id,
        SolMpExt_OT: data.solMpExt_OT,
        SolMpExt_Maquina: data.solMpExt_Maquina,
        SolMpExt_Fecha: data.solMpExt_Fecha,
        SolMpExt_Hora: data.solMpExt_Hora,
        SolMpExt_Observacion: data.solMpExt_Observacion,
        Estado_Id: estado,
        Proceso_Id: data.proceso_Id,
        Usua_Id: data.usua_Id,
        SolMpExt_FechaEstimadaEntrega: data.solMpExt_FechaEstimadaEntrega
      }
      this.servicioSolitudMaterial.Put(modelo.SolMpExt_Id, modelo).pipe(takeUntil(this.destroy$)).subscribe(() => this.mensajeService.mensajeConfirmacion(`Confirmación`, `Asignación creada exitosamente!`),
        () => this.mensajeService.mensajeError(`Error`, `No fue posible crear la asignación de materia prima!`));
    })
  }

  /**
   * Actualiza las entradas disponibles y registra las salidas asociadas a la asignación.
   * @param idAsignacion Identificador de la asignación.
   * @returns No retorna un valor.
   */
  actualizarMovimientosEntradasMP(idAsignacion: number) {
    this.materiasPrimasSeleccionadas.forEach(mp => {
      mp.Cantidad2 = mp.Cantidad;
      this.ejecutarOperacionAsignacion(
        this.srvMovEntradasMP.GetInventarioxMaterial(mp.Id),
        `No fue posible consultar el inventario del material ${mp.Id}.`,
        data => {
          data.forEach(mov => {
            const detalle: modeloMovimientos_Entradas_MP = {
              'Id': mov.id,
              'MatPri_Id': mov.matPri_Id,
              'Tinta_Id': mov.tinta_Id,
              'Bopp_Id': mov.bopp_Id,
              'Cantidad_Entrada': mov.cantidad_Entrada,
              'UndMed_Id': mov.undMed_Id,
              'Precio_RealUnitario': mov.precio_RealUnitario,
              'Tipo_Entrada': mov.tipo_Entrada,
              'Codigo_Entrada': mov.codigo_Entrada,
              'Estado_Id': mov.estado_Id,
              'Cantidad_Asignada': mov.cantidad_Asignada,
              'Cantidad_Disponible': mov.cantidad_Disponible,
              'Observacion': mov.observacion,
              'Fecha_Entrada': mov.fecha_Entrada,
              'Hora_Entrada': mov.hora_Entrada,
              'Precio_EstandarUnitario': mov.precio_EstandarUnitario
            };
            const id: number | undefined = detalle.Id;
            if (mp.Cantidad2 > 0) {
              let salidaReal: number = 0;
              if (mp.Cantidad2 > detalle.Cantidad_Disponible) {
                salidaReal = detalle.Cantidad_Disponible;
                mp.Cantidad2 -= detalle.Cantidad_Disponible;
                detalle.Cantidad_Asignada += detalle.Cantidad_Disponible;
                detalle.Cantidad_Disponible = 0;
                detalle.Estado_Id = 5;
              } else if (mp.Cantidad2 == detalle.Cantidad_Disponible) {
                salidaReal = mp.Cantidad2;
                detalle.Cantidad_Asignada += detalle.Cantidad_Disponible;
                detalle.Cantidad_Disponible = 0;
                detalle.Estado_Id = 5;
                mp.Cantidad2 = 0;
              } else if (mp.Cantidad2 < detalle.Cantidad_Disponible) {
                salidaReal = mp.Cantidad2;
                detalle.Cantidad_Asignada += mp.Cantidad2;
                detalle.Cantidad_Disponible -= mp.Cantidad2;
                detalle.Estado_Id = 19;
                mp.Cantidad2 = 0;
              }
              if (id !== undefined) {
                this.ejecutarOperacionAsignacion(
                  this.srvMovEntradasMP.Put(id, detalle),
                  'No fue posible actualizar el movimiento de entrada.'
                );
                this.crearRegistrosSalidasMP(detalle, salidaReal, idAsignacion);
              }
            }
          });
        }
      );
    });
  }

  /**
   * Registra el movimiento de salida asociado a una entrada de inventario.
   * @param detalle Movimiento de entrada que origina la salida.
   * @param salidaReal Cantidad que se descuenta de la entrada.
   * @param idAsignacion Identificador de la asignación.
   * @returns No retorna un valor.
   */
  crearRegistrosSalidasMP(detalle: any, salidaReal: number, idAsignacion: number) {
    let salidas: modelEntradas_Salidas_MP = {
      'Id_Entrada': detalle.Id,
      'Tipo_Salida': detalle != 84 && detalle.Bopp_Id == 1 && detalle.Tinta_Id == 2001 ? 'ASIGMP' : 'ASIGTINTAS',
      'Codigo_Salida': idAsignacion,
      'Tipo_Entrada': detalle.Tipo_Entrada,
      'Codigo_Entrada': detalle.Codigo_Entrada,
      'Fecha_Registro': this.today,
      'Hora_Registro': this.hora,
      'MatPri_Id': detalle.MatPri_Id,
      'Tinta_Id': detalle.Tinta_Id,
      'Bopp_Id': detalle.Bopp_Id,
      'Cantidad_Salida': salidaReal,
      'Orden_Trabajo': this.infoOrdenTrabajo[0] == undefined ? 0 : this.infoOrdenTrabajo[0].ot,
      'Prod_Id': this.infoOrdenTrabajo[0] == undefined ? 1 : this.infoOrdenTrabajo[0].item,
      'Cant_PedidaOT': this.infoOrdenTrabajo[0] == undefined ? 0 : this.infoOrdenTrabajo[0].cantPedida,
      'UndMed_Id': this.infoOrdenTrabajo[0] == undefined ? 'Kg' : this.infoOrdenTrabajo[0].und,
    }
    this.ejecutarOperacionAsignacion(
      this.srvMovSalidasMP.Post(salidas),
      'No fue posible crear la salida de material.'
    );
  }

  /** Cargar subcategorias en las asignaciones de materia prima */
  cargarSubcategoriasEnAsignaciones(subcategorias: any) {
    this.subcategorias = [];
    this.subcategorias = subcategorias;
  }
}
