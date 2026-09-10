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

  public formEncabezado !: FormGroup;
  public formMP !: FormGroup;

  /* Variables*/
  storage_Id: number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre: any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol: any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol: number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  load: boolean = true; //Variable para validar que aparezca el icono de carga o no
  materiaPrima: any = []; //Variable que va almacenar el nombre de todas las materias primas existentes en la empresa
  subcategoriasSeleccionadas: any[] = []; //Variable que va almacenar el nombre de todas las materias primas existentes en la empresa
  idSubcategorias: any[] = []; //Variable que almacenará los ID de las materias primas que se han seleccionado para que no puedan ser elegidas nuevamente
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
  subcategoriesInModal : any[] = [];
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
    this.formEncabezado = this.frmBuilderMateriaPrima.group({
      ot: [null, Validators.required],
      fecha: [this.today, Validators.required],
      maq: [null, Validators.required],
      kgOt: [null, Validators.required],
      proceso: ['', Validators.required],
      observacion: [''],
      Solicitud: [null],
    });

    this.formMP = this.frmBuilderMateriaPrima.group({
      subcat_Id: [null, Validators.required],
      subcat_Nombre: [null, Validators.required],
      stock: [null, Validators.required],
      cantidad: [null, Validators.required],
      und: [null, Validators.required],
      Categoria: [null],
    });
  }

  ngOnInit(): void {
    this.lecturaStorage();
    this.obtenerProcesos();
    this.ultimoConsecutivoSolicitud();
    setInterval(() => this.modoSeleccionado = this.AppComponent.temaSeleccionado, 1000);
    this.formEncabezado.patchValue({ 'proceso': this.validateProcess(), });
    //this.formMP.patchValue({ und: 'Kg' });
  }

  //Función que se encarga de limpiar los recursos cuando el componente se destruye
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
    this.subcategoriesInModal = [];
    this.materials = [];
    this.materiaPrimaService.getSubcategories().subscribe(datos => {
      this.materials = datos;
      this.viewSubcategories = true;
      this.subcategoriesInModal = this.materials.reduce((a: any, b: any) => {
        if (!a.map(x => x.id_Subcategoria).includes(b.id_Subcategoria)) a = [...a, b];
        else {
          let index = a.findIndex(x => x.id_Subcategoria == b.id_Subcategoria);
          a[index] = { ...a[index], stock: a[index].stock + b.stock };
        }
        return a;
      }, []);
      this.subcategoriesInModal.sort((a, b) => Number(b.stock) - Number(a.stock));
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
    this.formMP.reset();
    this.formEncabezado.reset();
    this.formEncabezado.patchValue({ fecha: moment().format('YYYY-MM-DD'), });
    this.ultimoConsecutivoSolicitud();
    this.formMP.patchValue({ und: 'Kg' });
    this.cantRestante = 0;
    this.kgOT = 0;
    this.load = true;
    this.idSubcategorias = [];
    this.subcategoriasSeleccionadas = [];
    this.error = false;
    this.soloTintas = false;
    this.categoriasSeleccionadas = [];
    this.infoOrdenTrabajo = [];
    this.esSolicitud = false;
    this.nroSolicitud = 0;
  }

  //Funcion que limpiará los campos de la materia pirma entrante
  limpiarCamposMP() {
    this.formMP.reset();
    this.formMP.patchValue({ und: 'Kg' });
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


  // Funcion que va a consultar la orden de trabajo para saber que cantidad de materia prima 
  // se ha asignado y que cantidad se ha devuelto con respecto a la cantidad que se debe hacer en kg
  infoOT() {
    this.load = false;
    let ot: string = this.formEncabezado.value.ot;
    this.bagProServices.srvObtenerListaClienteOT_Item(ot).pipe(takeUntil(this.destroy$)).subscribe(data => {
      if (data.length > 0) {
        let adicional: number = (data[0].datosotKg * 0.05);
        this.kgOT = data[0].datosotKg + adicional;
        this.estadoOT = data[0].estado;
        this.formEncabezado.patchValue({ kgOt: parseFloat(data[0].datosotKg + adicional), });
        this.detallesAsignacionService.getMateriasPrimasAsignadas(parseInt(ot))
        .pipe( takeUntil(this.destroy$))
        .subscribe(dataAsignacion => {
          this.cantRestante = (this.kgOT - dataAsignacion);
          this.loadInfoOT(parseInt(ot), data, dataAsignacion);
          this.mensajeService.mensajeAdvertencia(`Advertencia`, `La orden de trabajo tiene '${this.cantRestante.toFixed(2)}' kg restantes.`);
          this.load = true;
        }, err => {
          this.load = true;
        });
      } else if (data.length == 0) {
        this.load = true;
        this.mensajeService.mensajeAdvertencia(`Advertencia`, `La OT N° ${ot} no existe!`);
      }
    }, error => {
      this.load = true;
      this.mensajeService.mensajeError(`Error`, `Error al consultar la OT ${ot}! ` + error);
    }); 
  }

  // Funcion que va a consultar la informacion de la orden de trabajo
  loadInfoOT(ot: number, datos_procesos: any, datos_asignacion: number) {
    this.infoOrdenTrabajo = [{
      ot: ot,
      cliente: datos_procesos[0].clienteNom,
      item: datos_procesos[0].clienteItems,
      ref: datos_procesos[0].clienteItemsNom,
      kg: this.kgOT,
      kgAsignado: datos_asignacion,
      kgRestante: this.cantRestante,
    }];
  }

  //Funcion que se va a ejecutar al aceptar la materia prima que el usuario desea solicitar
  getAllSubcategories() {
    //this.subcategories = [];
    let material : string = this.formMP.value.subcat_Nombre;

    if(material && material.trim().length > 2) {
      this.materiaPrimaService.getAllSubcategoriesForName(material).subscribe(datos => {
        this.subcategories = datos;
      });
    }
  }

  //Funcion que va a cargar la información de la materia prima seleccionada en los campos correspondientes
  loadMaterialInField() {
    let data : any = this.subcategories.find(x => x.id_Subcategoria == this.formMP.value.subcat_Nombre); 
    
    this.formMP.patchValue({
      'subcat_Id': data.id_Subcategoria,
      'subcat_Nombre': data.subcategoria,
      'cantidad': 0,
      'und': data.und,
      'stock': data.stock,
    });
  }

  // Funcion para colocar la subcategoría seleccionada en la tabla
  validarCamposVaciosMPRetirada() {
    const subcategoryId = this.formMP.value.subcat_Id;
    const quantity = this.formMP.value.cantidad;

    if (this.formMP.valid) {
      if (quantity > 0) {
        if (!this.idSubcategorias.includes(subcategoryId)) {
          if (quantity > this.cantRestante) {
            this.mensajeService.mensajeAdvertencia(`Advertencia`, `La cantidad a solicitar excede la cantidad restante a asignar: ${this.cantRestante.toFixed(2)} Kg!`);
            return;
          }

          this.idSubcategorias.push(subcategoryId);
          this.subcategoriasSeleccionadas.push(this.materialSelected(this.formMP.value));
          this.limpiarCamposMP();
        } else this.mensajeService.mensajeAdvertencia(`Advertencia`, `La subcategoría ${this.formMP.value.subcat_Nombre} ya ha sido seleccionada!`);
      } else this.mensajeService.mensajeAdvertencia(`Advertencia`, `La cantidad a solicitar debe ser mayor a cero (0)!`);
    } else this.mensajeService.mensajeAdvertencia(`Advertencia`, `Hay campos vacíos en el formulario de subcategoría!`);
  }

  // Funcion que va a crear un objeto con la información de la subcategoría seleccionada para luego ser almacenada en el array subcategoriasSeleccionadas
  materialSelected(form: any) {
    const info: any = {
      'Id': form.subcat_Id,
      'Nombre': form.subcat_Nombre,
      'Cantidad': form.cantidad,
      'Und_Medida': form.und,
      'Stock': form.stock,
    }
    return info;
  }

  // Funcion que va a calcular la cantidad de subcategorías solicitadas
  calcularMateriaPrimaSolicitada(): number {
    let total: number = 0;
    for (let i = 0; i < this.subcategoriasSeleccionadas.length; i++) {
      total += this.subcategoriasSeleccionadas[i].Cantidad;
    }
    return total;
  }

  // Funcion que va a quitar la subcategoría seleccionada
  quitarMateriaPrima(data: any) {
    this.onReject('eleccion');
    data = this.mpSeleccionada;
    this.subcategoriasSeleccionadas.splice(this.subcategoriasSeleccionadas.findIndex((item) => item.Id == data.Id), 1);
    this.idSubcategorias.splice(this.idSubcategorias.findIndex((item) => item == data.Id), 1);
  }

  // Funcion que hará validaciones antes de realizar la asignación
  validarCamposVaciosRetirada() {
    let maq: number = this.formEncabezado.value.maq;
    let proceso: string = this.formEncabezado.value.proceso;
    if (this.formEncabezado.valid) {
      if (this.subcategoriasSeleccionadas.length > 0) {
        if ((maq >= 1) && (!['', null].includes(proceso))) {
          this.solicitudMateriaPrima();
        } else this.mensajeService.mensajeAdvertencia(`Advertencia`, 'Debe diligenciar los campos maquina y proceso, verifique!');
      } else this.mensajeService.mensajeAdvertencia(`Advertencia`, 'Debe seleccionar minimo una materia prima para crear la solicitud!');
    } else this.mensajeService.mensajeAdvertencia(`Advertencia`, 'Debe llenar los campos vacios!');
  }

  //Funcion que creará la solicitud de materia prima a una OT Y lo guardará en la base de datos
  solicitudMateriaPrima() {
    const idOrdenTrabajo: number = this.formEncabezado.value.ot;
    const idSolicitud: number = this.formEncabezado.value.Solicitud;
    this.load = false;
    if (this.error) {
      this.load = true;
      return;
    }

    if ([4, 1].includes(this.estadoOT)) {
      this.mensajeService.mensajeAdvertencia(`Advertencia`, `No es posible crear/editar solicitudes a la OT ${idOrdenTrabajo}, porque está cerrada!`);
      this.load = true;
      return;
    }

    const cantidadSolicitada = this.calcularMateriaPrimaSolicitada();
    if (cantidadSolicitada <= this.cantRestante && !this.esSolicitud) {
      this.crearSolicitudMatPrima();
      return;
    }

    this.load = true;
    if (this.ValidarRol != 1) {
      this.mensajeService.mensajeAdvertencia(`Advertencia`, `La cantidad a solicitar supera el limite de kilos permitidos para la OT ${idOrdenTrabajo}, Debe solicitar permisos al administrador.`);
    } else if (this.esSolicitud) {
      this.confirmarEditarSolicitud(idSolicitud);
    } else {
      this.confirmarSolicitud(idOrdenTrabajo);
    }
  }

  // Crear solicitud mat. prima
  crearSolicitudMatPrima() {
    this.onReject('solicitud');
    this.load = false;

    const solicitud: modelSolicitudMP_Extrusion = {
      'SolMpExt_Id': 0,
      'SolMpExt_OT': this.formEncabezado.value.ot,
      'SolMpExt_Maquina': this.formEncabezado.value.maq,
      'SolMpExt_Fecha': this.today,
      'SolMpExt_Hora': moment().format('H:mm:ss'),
      'SolMpExt_Observacion': this.formEncabezado.value.observacion,
      'Estado_Id': 11,
      'Proceso_Id': this.formEncabezado.value.proceso,
      'Usua_Id': this.storage_Id
    }
    this.servicioSolicitudMpExt.Post(solicitud).pipe(takeUntil(this.destroy$)).subscribe({
      next: (datos) => {
        this.nroSolicitud = datos.solMpExt_Id;
        this.crearDetalleSolicitud(this.nroSolicitud);
      },
      error: () => {
        this.error = true;
        this.mensajeService.mensajeError(`Error`, `Error al crear la solicitud de material!`);
        this.load = true;
      }
    });
  }

  // Funcion que se encargará de consultar el Id del proceso y hacer el ingreso de las materia primas asignadas
  crearDetalleSolicitud(solicitud: number) {
    let count: number = 0;
    if (!this.error) {
      this.subcategoriasSeleccionadas.forEach(x => {
        let detallesSolicitud = this.detailsRequest(x, solicitud);
        this.servicioDetSolicitudMpExt.Post(detallesSolicitud).subscribe(() => {
          count++;
          if (count == this.subcategoriasSeleccionadas.length) this.solicitudExitosa();
        }, () => {
          this.error = true;
          this.load = true;
          this.mensajeService.mensajeError(`Error`, `Error al insertar la materia prima solicitada ${x.Nombre}!`);
        });
      });
    }
  }

  // Funcion que se encargará de crear el objeto para hacer la solicitud de materia prima
  detailsRequest(data: any, solicitud: number): modelDetSolicitudMP_Extrusion {
    const detallesSolicitud: modelDetSolicitudMP_Extrusion = {
      'Codigo': 0,
      'SolMpExt_Id': solicitud,
      'SubCatMP_Id': data.Id,
      'SubCatMP_Nombre': data.Nombre,
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
    this.load = true;
    this.informacionPDF = [];
    this.servicioDetSolicitudMpExt.GetSolicitudMp_Extrusion(this.nroSolicitud).pipe(takeUntil(this.destroy$)).subscribe(datosSolicitud => {
      if (datosSolicitud.length === 0) {
        this.mensajeService.mensajeAdvertencia(`Advertencia`, `No se encontraron subcategorías para la solicitud N° ${this.nroSolicitud}.`);
        return;
      }

      this.informacionPDF = datosSolicitud
        .map(dato => this.mapSubcategoryForPdf(dato))
        .sort((a, b) => a.Nombre.localeCompare(b.Nombre));
      this.generarPDF(datosSolicitud[0]);
    }, () => this.mensajeService.mensajeError(`Error`, `¡No se pudo obtener información de la última solicitud creada!`));
  }

  // Mapea la información de la subcategoría para el PDF
  mapSubcategoryForPdf(dato: any) {
    return {
      Id: dato.id_Subcategoria,
      Nombre: dato.subcategoria ?? dato.subcategoria_Nombre,
      Cantidad: Number(dato.cantidad_Pedida ?? dato.cantidad),
      Medida: dato.medida,
    };
  }

  // Genera el PDF de la solicitud
  generarPDF(solicitud: any) {
    const pdfDefinicion: any = {
      info: { title: `Solicitud de material N° ${solicitud.id}` },
      pageSize: { width: 630, height: 760 },
      pageMargins: [25, 125, 25, 35],
      watermark: { text: 'PLASTICARIBE SAS', color: 'red', opacity: 0.05, bold: true },
      header: (currentPage: number, pageCount: number) => this.buildPdfHeader(solicitud.id, currentPage, pageCount),
      content: [
        { text: 'Información de la OT', style: 'sectionTitle' },
        this.buildOrderSummary(),
        { text: 'Subcategorías solicitadas', style: 'sectionTitle' },
        this.buildSubcategoriesTable(),
        this.buildPdfTotal(),
        { text: `\nObservación sobre la solicitud:\n${solicitud.observacion || ''}`, style: 'observation' },
      ],
      styles: {
        sectionTitle: { fontSize: 10, bold: true, alignment: 'center', margin: [0, 12, 0, 6] },
        observation: { fontSize: 9, bold: true },
      }
    };

    pdfMake.createPdf(pdfDefinicion).open();
    this.nroSolicitud = 0;
    setTimeout(() => this.LimpiarCampos(), 1500);
  }

  // Construye el encabezado del PDF
  buildPdfHeader(solicitudId: number, currentPage: number, pageCount: number) {
    return {
      margin: [25, 15, 25, 0],
      columns: [
        { image: logoParaPdf, width: 150, height: 30, margin: [0, 10, 0, 0] },
        {
          width: '*', alignment: 'center', fontSize: 8,
          stack: [
            { text: 'NIT. 800188732', bold: true, fontSize: 10 },
            { text: `Fecha de análisis: ${moment().format('YYYY-MM-DD')}` },
            { text: `Hora: ${moment().format('H:mm:ss')}` },
            { text: `Usuario: ${this.storage_Nombre}` },
            { text: `Solicitud de material N° ${solicitudId}`, bold: true, fontSize: 10 },
          ]
        },
        { width: 65, fontSize: 8, text: `Página: ${currentPage} de ${pageCount}`, margin: [0, 10, 0, 0] },
      ]
    };
  }

  // Construye el resumen de la orden de trabajo
  buildOrderSummary() {
    const order = this.infoOrdenTrabajo[0] || {};
    return {
      table: {
        headerRows: 1,
        widths: [60, 215, 215, 60],
        body: [
          ['OT', 'Cliente', 'Referencia', 'Cantidad'].map(text => ({ text, fillColor: '#bbb', fontSize: 9, bold: true })),
          [order.ot || '', order.cliente || '', order.ref || '', this.formatonumeros(order.kg || 0)],
        ]
      },
      fontSize: 8,
    };
  }

  // Construye la tabla de subcategorías solicitadas
  buildSubcategoriesTable() {
    return {
      table: {
        headerRows: 1,
        widths: [60, 365, 60, 60],
        body: [
          ['Id', 'Subcategoría', 'Cantidad', 'Medida'].map(text => ({ text, fillColor: '#bbb', fontSize: 9, bold: true })),
          ...this.informacionPDF.map(item => [item.Id, item.Nombre, this.formatonumeros(item.Cantidad), item.Medida]),
        ]
      },
      fontSize: 8,
    };
  }

  // Construye la sección del total en el PDF
  buildPdfTotal() {
    return {
      margin: [0, 4, 0, 0],
      table: {
        widths: [365, 60, 60, 60],
        body: [['', { text: 'Peso Total', alignment: 'right', bold: true }, this.formatonumeros(this.calcularMateriaPrimaSolicitada().toFixed(2)), { text: 'Kg', bold: true }]]
      },
      fontSize: 8,
    };
  }

  //Buscar informacion de las solicitudes de materia prima creadas
  consultarSolicitudMaterial() {
    let solicitud: number = this.formEncabezado.value.Solicitud;
    this.idSubcategorias = [];
    this.subcategoriasSeleccionadas = [];

    if (solicitud != null) {
      this.servicioDetSolicitudMpExt.GetSolicitudMp_Extrusion(solicitud).pipe(takeUntil(this.destroy$)).subscribe(data => {
        if (data.length > 0) {
          if (![4, 5].includes(data[0].estado)) {
            this.esSolicitud = true;
            this.load = false;
            this.formEncabezado.patchValue({ ot: data[0].ot, maq: data[0].maq, observacion: data[0].observacion, })
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
    this.idSubcategorias.push(info.Id);
    this.subcategoriasSeleccionadas.push(info);
  }

  /** Editar Solicitudes de material de producción por Id */
  /*editarSolicitud() {
    this.load = false;
    let solicitudId: any = this.formEncabezado.value.Solicitud;
    let maq: number = this.formEncabezado.value.maq;
    let ot: any = this.formEncabezado.value.ot;
    let observacion: any = this.formEncabezado.value.observacion;
    this.servicioSolicitudMpExt.GetId(solicitudId).subscribe(data => {
      const solicitud: modelSolicitudMP_Extrusion = {
        SolMpExt_Id: solicitudId,
        SolMpExt_OT: ot != null ? ot : data.solMpExt_OT,
        SolMpExt_maq: maq != null ? maq : data.solMpExt_maq,
        SolMpExt_Fecha: data.solMpExt_Fecha,
        SolMpExt_Hora: data.solMpExt_Hora,
        SolMpExt_Observacion: observacion != null ? observacion.toString() : '',
        Estado_Id: data.estado_Id,
        Proceso_Id: this.formEncabezado.value.proceso,
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
  }*/

  /** Editar detalles de solicitudes de material de producción por Id */
  /*editarDetallesSolicitud(solicitudId: number) {
    let errorId: boolean = false;
    for (let index = 0; index < this.subcategoriasSeleccionadas.length; index++) {
      this.servicioDetSolicitudMpExt.GetSolicitudesConMatPrimas(solicitudId, this.subcategoriasSeleccionadas[index].Id).subscribe(data1 => {
        if (data1.length == 0) {
          let detSolicitud: modelDetSolicitudMP_Extrusion = {
            Codigo: 0,
            SolMpExt_Id: solicitudId,
            MatPri_Id: this.subcategoriasSeleccionadas[index].Id_Mp,
            Tinta_Id: this.subcategoriasSeleccionadas[index].Id_Tinta,
            DtSolMpExt_Cantidad: this.subcategoriasSeleccionadas[index].Cantidad,
            UndMed_Id: this.subcategoriasSeleccionadas[index].Und_Medida
          }
          this.servicioDetSolicitudMpExt.Post(detSolicitud).subscribe(data2 => { errorId = false; }, error => {
            errorId = true;
            this.mensajeService.mensajeError(`Error`, `No fue posible insertar la solicitud y las materias primas, por favor verifique!`)
          });
        } else {
          let detSolicitud: modelDetSolicitudMP_Extrusion = {
            Codigo: data1[0],
            SolMpExt_Id: solicitudId,
            MatPri_Id: this.subcategoriasSeleccionadas[index].Id_Mp,
            Tinta_Id: this.subcategoriasSeleccionadas[index].Id_Tinta,
            DtSolMpExt_Cantidad: this.subcategoriasSeleccionadas[index].Cantidad,
            UndMed_Id: this.subcategoriasSeleccionadas[index].Und_Medida
          }
          this.servicioDetSolicitudMpExt.Put(data1[0], detSolicitud).subscribe(data3 => { errorId = false; }, error => {
            errorId = true;
            this.mensajeService.mensajeError(`Error`, `No fue posible actualizar la solicitud y las materias primas, por favor verifique!`)
          });
        }
      });
    }
    !errorId ? setTimeout(() => { this.load = true; this.solicitudExitosa(); }, 1000) : this.mensajeService.mensajeError(`Error`, 'No se mostrará la informacion del PDF, por favor, verifique!');
  }*/

  /** Función que obtendrá el ultimo Id de la solicitud */
  ultimoConsecutivoSolicitud() {
    this.servicioSolicitudMpExt.GetUltimaSolicitud().pipe(takeUntil(this.destroy$)).subscribe(data =>
      this.formEncabezado.patchValue({ Solicitud: (data + 1) })
    ), error => {
      this.mensajeService.mensajeError(`Error cargando el N° de solicitud ${error.error.text}`);
    };
  }

  /** Función para eliminar la materia prima de la solicitud de material de la base de datos. */
  eliminarMatPrimaSolicitud(mp: any) {
    mp = this.mpSeleccionada;
    this.servicioDetSolicitudMpExt.GetSolicitudesConMatPrimas(this.formEncabezado.value.Solicitud, mp.Id).subscribe(data => {
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
