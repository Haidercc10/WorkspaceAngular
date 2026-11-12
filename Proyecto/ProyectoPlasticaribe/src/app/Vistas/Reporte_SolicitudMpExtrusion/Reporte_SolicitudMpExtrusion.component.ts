import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ShepherdService } from 'angular-shepherd';
import moment from 'moment';
import pdfMake from 'pdfmake/build/pdfmake';
import { MessageService } from 'primeng/api';
import { DetSolicitudMP_ExtrusionService } from 'src/app/Servicios/DetSolicitudMP_Extrusion/DetSolicitudMP_Extrusion.service';
import { EstadosService } from 'src/app/Servicios/Estados/estados.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { SolicitudMP_ExtrusionService } from 'src/app/Servicios/SolicitudMP_Extrusion/SolicitudMP_Extrusion.service';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';
import { AppComponent } from 'src/app/app.component';
import { AsignacionMateriaPrimaComponent } from '../asignacion-materia-prima/asignacion-materia-prima.component';
import { Table } from 'primeng/table';
import { modelSolicitudMP_Extrusion } from 'src/app/Modelo/modelSolicitudMP_Extrusion';
import { DetallesAsignacionService } from 'src/app/Servicios/DetallesAsgMateriaPrima/detallesAsignacion.service';
import { defaultStepOptions, stepsMovSolicitudesMPExtrusion as defaultSteps } from 'src/app/data';
import { catchError, finalize, map, of, Subject, switchMap, takeUntil } from 'rxjs';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { CreacionPdfService, DatosOTSolicitudPDF } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';
import { ADICIONAL_KG_OT, EstadoSolicitudMaterial, ROLES_VERIFICAR_SOLICITUD } from 'src/app/Modelo/modelFlujoMaterialProduccion';
import { alCambiarTema } from 'src/app/Servicios/Tema/Tema.service';


@Component({
  selector: 'app-Reporte_SolicitudMpExtrusion',
  templateUrl: './Reporte_SolicitudMpExtrusion.component.html',
  styleUrls: ['./Reporte_SolicitudMpExtrusion.component.css']
})
export class Reporte_SolicitudMpExtrusionComponent implements OnInit {
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  private readonly suscripcionTema = alCambiarTema(oscuro => this.modoSeleccionado = oscuro); // mantiene modoSeleccionado al día con el tema
  cargando : boolean = false;
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol
  formFiltros !: FormGroup; /** Formulario de filtros de búsqueda */
  estados : any = []; /** Array que contendrá los estados de las solicitudes */
  arrayRegistros : any = []; /** Array que contendrá la tabla luego de realizar una consulta */
  @ViewChild('dt1') dt1: Table | undefined;
  cantPendientes : number = 0; /** Variable que mostrará el número de solicitudes pendientes */
  cantFinalizadas : number = 0; /** Variable que mostrará el número de solicitudes finalizadas */
  cantCanceladas : number = 0; /** Variable que mostrará el número de solicitudes canceladas */
  @ViewChild(AsignacionMateriaPrimaComponent) AsignacionMatPrima : AsignacionMateriaPrimaComponent;
  informacionPDF: any; /** Variable que contendrá la información del PDF */
  arrayMatPrimas : any = []; /** Array que cargará las materias primas de la solicitud seleccionada */
  solicitudSeleccionada : number = 0; /** Nro de la solicitud seleccionada */
  usuarioSolicitante : string = '' /** Variable que contendrá el nombre del usuario que solicitó la materia prima. */
  modalAsignacion : boolean = false; /** Variable que validará que se cargue o no, el componente del modal de ordenes de compras. */
  private mensajeAsignacionPendiente: { summary: string; detail: string } | null = null;
  cantParciales : number = 0; /** Variable que mostrará el número de solicitudes parciales */
  estadoSolicitud : string = ''; /** Nombre del estado de la solicitud seleccionada, para los mensajes. */
  estadoSolicitudId : number | null = null; /** Estado de la solicitud seleccionada; habilita o deshabilita las acciones. */
  clave : string = ''; /** Variable que contendrá una palabra clave ya sea para finalizar o cancelar una solicitud.*/
  /** Key fija del toast de confirmación. Debe ser constante: si dependiera de `clave`, el toast aún tendría la key anterior al llegar el mensaje y lo descartaría. */
  readonly claveConfirmacion : string = 'confirmarEstadoSolicitud';
  nroSolicitud : number = 0; /// Variable que se usará para almacenar el nro de solicitud al momento de generar el PDF y cargar la información de la solicitud seleccionada.
  arrayId : any = []; /// Array que se usará para almacenar los id de las solicitudes que se muestran en la tabla, esto con el fin de no mostrar solicitudes repetidas en caso de que una solicitud tenga varias materias primas.
  load : boolean = false; /** Variable que indicará si se está cargando información */
  private destroy$ = new Subject<void>(); // Variable para manejar la destrucción de las subscripciones y evitar fugas de memoria

  constructor(private frmBuilder : FormBuilder,
                  private messageService: MessageService,
                    private shepherdService: ShepherdService,
                      private AppComponent : AppComponent,
                        private servicioEstados : EstadosService,
                          private servicioSolicitudesMPExt : SolicitudMP_ExtrusionService,
                            private servicioDtSolicitudesMPExt : DetSolicitudMP_ExtrusionService,
                              private msj : MensajesAplicacionService,
                                private ServicioDetAsignacionesMp : DetallesAsignacionService,
                                  private servicioBagPro : BagproService,
                                    private servicioPDF : CreacionPdfService,
                                ) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
    this.formFiltros = this.frmBuilder.group({
      documento : [null],
      fechaDoc: [null],
      fechaFinalDoc: [null],
      estadoDoc : [null]
    });
  }

  ngOnInit() {
    this.obtenerEstados();
    this.lecturaStorage();
    this.getEstadoSolitudes();
  }

  /** Función que se ejecutará al cerrar el componente para limpiar las subscripciones y evitar fugas de memoria */
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = '$1,';
    return number.toString().replace(exp,rep);
  }

  // Funcion que va a consultar y almacenar los estados que pueden tener los documentos
  obtenerEstados(){
    this.servicioEstados.srvObtenerListaEstados().subscribe(datos_estados => {
      this.estados = datos_estados.filter(item => [11, 5, 4, 12, EstadoSolicitudMaterial.Verificada].includes(item.estado_Id));
    });
  }

  /** Función que mostrará el numero de solicitudes por estado. */
  getEstadoSolitudes(){
    this.cargando = true;
    this.cantPendientes = 0;
    this.cantParciales = 0;
    this.cantFinalizadas = 0;
    this.cantCanceladas = 0;

    this.servicioSolicitudesMPExt.getEstadosSolicitudes()
    .pipe(
      finalize(() => this.cargando = false)
    ).subscribe(data => {
      data.forEach(x => {
        if(x.estado_Id == 11) this.cantPendientes = x.suma;
        if(x.estado_Id == 5) this.cantFinalizadas = x.suma;
        if(x.estado_Id == 4) this.cantCanceladas = x.suma;
        if(x.estado_Id == 12) this.cantParciales = x.suma;
        
      });
    }, error => { 
      this.msj.mensajeError(`Error`, `Error al consultar el estado de las solicitudes`) 
    });
  }

  /** Consulta para cargar información de las solicitudes de materia prima.  */
  consultarFiltros(){
    this.cargando = true;
    this.arrayRegistros = [];
    this.arrayMatPrimas = [];
    this.solicitudSeleccionada = 0;
    this.usuarioSolicitante = '';
    this.estadoSolicitud = '';
    this.estadoSolicitudId = null;
    let solicitud : number = this.formFiltros.value.documento;
    let fechaInicial : any = moment(this.formFiltros.value.fechaDoc).format('YYYY-MM-DD');
    let fechaFinal : any = moment(this.formFiltros.value.fechaFinalDoc).format('YYYY-MM-DD');
    let estado : any = this.formFiltros.value.estadoDoc;
    this.arrayId = [];
    let ruta : any = ``;

    if (fechaInicial == 'Fecha inválida') fechaInicial = null;
    if (fechaFinal == 'Fecha inválida') fechaFinal = null;
    if(fechaInicial == null) fechaInicial = moment().subtract(30, 'days').format('YYYY-MM-DD'); 
    if(fechaInicial != null && fechaFinal == null) fechaFinal = moment().format('YYYY-MM-DD');

    if(solicitud != null) ruta = `id=${solicitud}`;
    if(estado != null) ruta.length > 0 ? ruta += `&estado=${estado}` : ruta += `estado=${estado}` ;
    ruta.length > 0 ? ruta = `?${ruta}` : ruta = ``;

    this.servicioDtSolicitudesMPExt.GetQuerySolicitudesMp_Extrusion(fechaInicial, fechaFinal, ruta)
    .pipe(
      finalize(() => this.cargando = false)
    ).subscribe(data => {
      if(data.length > 0) {
        for (let index = 0; index < data.length; index++) {
          if(!this.arrayId.includes(data[index].id)) {
            this.llenarTabla(data[index]);
            this.arrayId.push(data[index].id);
          }
        }
        /** Se reasigna la referencia para que p-table recalcule totalRecords y el paginador. */
        this.arrayRegistros = [...this.arrayRegistros];
      } else this.msj.mensajeAdvertencia(`Advertencia`, `No se encontraron resultados de busqueda!`);
    }, error => { this.msj.mensajeError(`Error`, `Error al consultar registros de solicitudes de material`)} );
  }

  /** Llenar array con los registros del encabezado de las solicitudes de materia prima. */
  llenarTabla(datos : any){
    let info : any = {
      'id' : datos.id,
      'ot' : datos.ot,
      'fecha' : datos.fecha.replace('T00:00:00', ''),
      'fechaEntrega' : datos.fecha_Entrega ? datos.fecha_Entrega.replace('T00:00:00', '') : '',
      'estadoId' : datos.estado,
      'estado' : datos.nombre_Estado,
    }
    this.arrayRegistros.push(info);
  }

  /** Función para limpiar los campos del formulario */
  limpiarCampos() {
    this.solicitudSeleccionada = 0;
    this.formFiltros.reset();
    this.arrayId = [];
    this.arrayRegistros = [];
    this.arrayMatPrimas = [];
    this.usuarioSolicitante = '';
    this.estadoSolicitud = '';
    this.estadoSolicitudId = null;
  }

  /** Función para filtrar los registros de la tabla */
  aplicarFiltro = ($event, campo : any, valorCampo : string) => this.dt1!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

  /**
   * Genera el PDF de la solicitud de material seleccionada. Primero consulta la solicitud (API) y la OT (BagPro)
   * y luego entrega esos datos al servicio de creación de PDFs. Si la OT no se encuentra en BagPro, el PDF se
   * genera igual indicándolo.
   * @param nroSolicitud Solicitud seleccionada.
   */
  infoSolicitudPDF(nroSolicitud : number){
    if (!nroSolicitud) return this.msj.mensajeAdvertencia(`Advertencia`, `Debe seleccionar una solicitud.`);

    this.cargando = true;
    this.servicioDtSolicitudesMPExt.GetSolicitudMp_Extrusion(nroSolicitud)
      .pipe(
        switchMap((detalles : any[]) => detalles.length == 0
          ? of({ detalles, ot: null })
          : this.servicioBagPro.srvObtenerListaClienteOT_Item(detalles[0].ot).pipe(
            map(datosOT => ({ detalles, ot: this.mapearOTParaPDF(datosOT[0]) })),
            catchError(() => of({ detalles, ot: null }))
          )),
        takeUntil(this.destroy$),
        finalize(() => this.cargando = false)
      )
      .subscribe({
        next: ({ detalles, ot }) => {
          if (detalles.length == 0) return this.msj.mensajeAdvertencia(`Advertencia`, `No se encontraron subcategorías para la solicitud N° ${nroSolicitud}.`);
          this.servicioPDF.solicitudMaterialProduccionPDF(detalles, ot);
          this.msj.mensajeConfirmacion(`Confirmación`, `Generando el PDF de la solicitud N° ${nroSolicitud}; se abrirá en una nueva pestaña.`);
        },
        error: () => this.msj.mensajeError(`Error`, `¡No se pudo obtener la información de la solicitud N° ${nroSolicitud}!`)
      });
  }

  /** Convierte los datos de la OT de BagPro al formato del PDF; null si la OT no existe. */
  private mapearOTParaPDF(datosOT : any) : DatosOTSolicitudPDF | null {
    if (!datosOT) return null;
    const kgOT = Number(datosOT.datosotKg) || 0;
    return {
      cliente: datosOT.clienteNom,
      item: datosOT.clienteItems,
      referencia: datosOT.clienteItemsNom,
      kgOT,
      kgLimite: kgOT * (1 + ADICIONAL_KG_OT),
    };
  }

  /** Cargar detalles de la solicitud en la segunda tabla. */
  cargarDetalleSolicitud(id : number) {
    this.cargando = true;
    this.solicitudSeleccionada = id;
    this.arrayMatPrimas = [];
    this.estadoSolicitud = '';
    this.estadoSolicitudId = null;

    this.servicioDtSolicitudesMPExt.GetSolicitudMp_Extrusion(this.solicitudSeleccionada)
    .pipe(
      finalize(() => { this.cargando = false; })
    ).subscribe(data => {
      data.forEach((item) =>  this.llenarTablaDetalles(item));
    }, error => {
      this.msj.mensajeError(`Error`, 
        `¡No se pudo obtener la información de la solicitud N° ${this.solicitudSeleccionada}!`);
    });
  }

  /** Llenar array con los registros de los detalles de las solicitudes de materia prima. */
  llenarTablaDetalles(data : any) {
    let arrayIds : any = [];

    let info : any = {
      'Codigo' : data.codigo,
      'Solicitud' : data.id,
      'Id' : data.id_Subcategoria,
      'Nombre' : data.subcategoria,
      'Cantidad' : data.cantidad_Pedida,
      'CantAprobada' : data.cantidad_Entregada || 0,
      'CantFaltante' : data.cantidad_Restante || 0,
      'Und_Medida' : data.medida,
      'Usuario' : data.nombre_Usuario,
      'EstadoSolicitud' : data.nombre_Estado,
    }

    this.estadoSolicitud = info.EstadoSolicitud;
    this.estadoSolicitudId = data.estado;
    this.usuarioSolicitante = info.Usuario;
    arrayIds.push(info.Id)

    /*this.ServicioDetAsignacionesMp.GetAsignacionesConSolicitudes(this.solicitudSeleccionada).subscribe(data2 => {
      for (let i = 0; i < data2.length; i++) {
        let infoSolicitud : any = {
          Ident : 0,
          Id_Mp: data2[i].matPri_Id,
          Id_Tinta: data2[i].tinta_Id,
          CantSolicitud : data2[i].cantMP
        }
        if (infoSolicitud.Id_Mp != 84) infoSolicitud.Ident = infoSolicitud.Id_Mp;
        else if (infoSolicitud.Id_Tinta != 2001) infoSolicitud.Ident = infoSolicitud.Id_Tinta;

        if(arrayIds.includes(infoSolicitud.Ident)) info.CantAprobada = infoSolicitud.CantSolicitud;
      }
    });*/

    this.arrayMatPrimas.push(info);
  }

  /** Indica si hay una solicitud seleccionada (habilita "Ver PDF"). */
  get haySolicitudSeleccionada() : boolean {
    return this.solicitudSeleccionada > 0;
  }

  /** Indica si la solicitud seleccionada está pendiente o parcial (habilita "Crear Asignación", "Finalizar" y "Cancelar"). */
  get solicitudActiva() : boolean {
    return this.estadoSolicitudId === EstadoSolicitudMaterial.Pendiente || this.estadoSolicitudId === EstadoSolicitudMaterial.Parcial;
  }

  /**
   * Pide confirmación para finalizar o cancelar la solicitud seleccionada.
   * @param palabraClave 'finalizar' o 'cancelar'; también es la clave del mensaje.
   */
  mostrarEleccion(palabraClave : string) {
    this.clave = palabraClave;
    if (!this.solicitudActiva) {
      this.msj.mensajeAdvertencia(`Advertencia`, `No es posible ${this.clave} solicitudes con estado ${this.estadoSolicitud}!`);
      return;
    }
    this.onReject();
    this.messageService.add({
      severity:'warn',
      key: this.claveConfirmacion,
      summary:'Elección',
      detail: `Está seguro que desea ${this.clave} la solicitud N° ${this.solicitudSeleccionada}?`,
      sticky: true
    });
  }

  /** True si el nombre del usuario solicitante quedó recortado con "..." (habilita su tooltip con el nombre completo). */
  nombreSolicitanteRecortado : boolean = false;

  /**
   * Mide si el texto del usuario solicitante no cabe (está recortado con "..."). Se llama al entrar el cursor al
   * contenedor y no al texto: PrimeNG cancela el tooltip que está por salir si `tooltipDisabled` cambia, así que el
   * valor debe estar listo antes de que el cursor llegue al texto.
   * @param texto Elemento con el nombre del usuario solicitante.
   */
  medirNombreSolicitante(texto : HTMLElement) {
    this.nombreSolicitanteRecortado = texto.scrollWidth > texto.clientWidth;
  }

  /** Indica si el rol del usuario puede marcar solicitudes como verificadas (muestra el botón). */
  get puedeVerificar() : boolean {
    return ROLES_VERIFICAR_SOLICITUD.includes(Number(this.ValidarRol));
  }

  /** Indica si la solicitud seleccionada está finalizada (habilita "Marcar como Verificado"). */
  get solicitudFinalizada() : boolean {
    return this.estadoSolicitudId === EstadoSolicitudMaterial.Finalizada;
  }

  /** Pide confirmación para marcar como verificada la solicitud seleccionada. */
  mostrarVerificacion() {
    this.clave = 'verificar';
    if (!this.solicitudFinalizada) {
      this.msj.mensajeAdvertencia(`Advertencia`, `Solo se pueden verificar solicitudes finalizadas; la solicitud N° ${this.solicitudSeleccionada} está ${this.estadoSolicitud}!`);
      return;
    }
    this.onReject();
    this.messageService.add({
      severity:'warn',
      key: this.claveConfirmacion,
      summary:'Verificar asignación',
      detail: `¿Está seguro que la asignación de la solicitud N° ${this.solicitudSeleccionada} está completada? Se marcará como VERIFICADA.`,
      sticky: true
    });
  }

  /** Ejecuta la acción confirmada con "Sí" según la `clave`: verificar, finalizar o cancelar. */
  confirmarEleccion() {
    if (this.clave == 'verificar') this.verificarSolicitud();
    else this.cancelarFinalizarSolicitud();
  }

  /** Cambia el estado de la solicitud seleccionada a VERIFICADA (55). */
  verificarSolicitud() {
    this.onReject();
    const solicitud_Id : number = this.solicitudSeleccionada;
    this.cargando = true;

    this.servicioSolicitudesMPExt.verificarSolicitud(solicitud_Id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.cargando = false)
      )
      .subscribe({
        next: () => {
          this.msj.mensajeConfirmacion(`Confirmación`, `¡La solicitud N° ${solicitud_Id} se marcó como VERIFICADA!`);
          this.getEstadoSolitudes();
          this.consultarFiltros();
        },
        error: (error) => {
          if (error?.status == 403) this.msj.mensajeAdvertencia(`Advertencia`, `¡Su rol no tiene permiso para verificar solicitudes!`);
          else if (error?.status == 409 || error?.status == 404) this.msj.mensajeAdvertencia(`Advertencia`, typeof error.error == 'string' ? error.error : `No fue posible verificar la solicitud N° ${solicitud_Id}.`);
          else this.msj.mensajeError(`Error`, `¡No fue posible verificar la solicitud N° ${solicitud_Id}!`);
        }
      });
  }

  /** Quitar el mensaje que sale luego de presionar si o no, en el mensaje de cancelar solicitud. */
  onReject = () => this.messageService.clear(this.claveConfirmacion);

  /** Finaliza o cancela (según `clave`) la solicitud seleccionada. */
  cancelarFinalizarSolicitud() {
    this.onReject();
    this.cargando = true;
    const solicitud_Id : number = this.solicitudSeleccionada;

    this.servicioSolicitudesMPExt.GetId(solicitud_Id).subscribe(data => {
      let modelo : modelSolicitudMP_Extrusion = {
        SolMpExt_Id: solicitud_Id,
        SolMpExt_OT: data.solMpExt_OT,
        SolMpExt_Maquina: data.solMpExt_Maquina,
        SolMpExt_Fecha: data.solMpExt_Fecha,
        SolMpExt_Hora: data.solMpExt_Hora,
        SolMpExt_Observacion: data.solMpExt_Observacion,
        Estado_Id: this.clave == 'finalizar' ? 5 : 4,
        Proceso_Id: data.proceso_Id,
        Usua_Id: data.usua_Id, 
        SolMpExt_FechaEstimadaEntrega: data.solMpExt_FechaEstimadaEntrega
      }
      this.servicioSolicitudesMPExt.Put(modelo.SolMpExt_Id, modelo)
      .pipe(
        finalize(() => this.cargando = false)
      ).subscribe(updateData => {
        this.msj.mensajeConfirmacion(`Confirmación`, `Estado de la solicitud N° ${solicitud_Id} actualizado exitosamente!`);
        this.getEstadoSolitudes();
        this.consultarFiltros();
      }, error => {
        this.cargando = false;
        this.msj.mensajeError(`Error`, `No fue posible actualizar la solicitud N° ${solicitud_Id}`);
      });
    });
  }

  /** Función que cargará el modal de ordenes de compra y allí consultará la solicitud seleccionada. */
  cargarModalCrearAsignacion(){
    if(!this.solicitudActiva) {
      this.msj.mensajeAdvertencia(`Advertencia`, `No es posible crear asignaciones con base a solicitudes de materia prima con estado ${this.estadoSolicitud}!`);
    } else {
      this.mensajeAsignacionPendiente = null;
      this.modalAsignacion = true;
      this.AsignacionMatPrima.FormMateriaPrimaRetiro.patchValue({ Solicitud : this.solicitudSeleccionada });
      this.AsignacionMatPrima.consultarSolicitudMaterial(true);
    }
  }

  /**
   * Cierra el popup al completarse la asignación y prepara su mensaje de éxito.
   * @param mensaje Mensaje de confirmación entregado por el formulario de asignación.
   * @returns No retorna un valor.
   */
  finalizarModalAsignacion(mensaje: { summary: string; detail: string }): void {
    this.mensajeAsignacionPendiente = mensaje;
    this.modalAsignacion = false;
  }

  /**
   * Muestra la confirmación después de terminar la animación de cierre del popup y refresca el listado,
   * porque la asignación cambia lo entregado y el estado de la solicitud.
   * @returns No retorna un valor.
   */
  alCerrarModalAsignacion(): void {
    if (!this.mensajeAsignacionPendiente) return;

    const mensaje = this.mensajeAsignacionPendiente;
    this.mensajeAsignacionPendiente = null;
    this.msj.mensajeConfirmacion(mensaje.summary, mensaje.detail);
    this.getEstadoSolitudes();
    this.consultarFiltros();
  }

  /** Consultar solicitudes por estado. */
  consultarPorEstado(estado : number){
    this.arrayRegistros = [];
    this.arrayId = [];
    this.formFiltros.patchValue({estadoDoc : estado});
    this.cargando = true;
    this.consultarFiltros();  
  }

  limpiarTodo(){
    this.formFiltros.reset();
    this.arrayRegistros = [];
    this.arrayMatPrimas = [];
    this.solicitudSeleccionada = 0;
    this.usuarioSolicitante = '';
    this.estadoSolicitud = '';
    this.estadoSolicitudId = null;
    this.clave = '';
  }

  /** Llenar la tabla dependiendo el estado seleccionado */
  llenarTablaConEstados(datos : any){
    let info : any = {
      id : datos.solMpExt_Id,
      ot : datos.solMpExt_OT,
      fecha : '', //datos.solMpExt_Fecha.replace('T00:00:00', ''),
      estadoId : datos.estado_Id,
      estado : datos.estado,
    }
    if(info.estadoId == 5) info.estado = 'Finalizado';
    if(info.estadoId == 11) info.estado = 'Pendiente';
    if(info.estadoId == 4) info.estado = 'Cancelado';
    if(info.estadoId == 12) info.estado = 'Parcial';

    this.arrayRegistros.push(info);
    this.arrayId.push(info.id)
  }

   // Funcion que va a hacer que se inicie el tutorial in-app
  tutorial(){
    this.shepherdService.defaultStepOptions = defaultStepOptions;
    this.shepherdService.modal = true;
    this.shepherdService.confirmCancel = false;
    this.shepherdService.addSteps(defaultSteps);
    this.shepherdService.start();
  }

  /** Calcular la cantidad solicitada de materia prima */
  calcularCantSolicitada() {
    let valor : number = 0;
    for (const solicitud of this.arrayMatPrimas) {
      valor += solicitud.Cantidad
    }
    return valor;
  }

  /** Calcular la cantidad aprobada de materia prima */
  calcularCantAprobada() {
    let valor : number = 0;
    for (const solicitud of this.arrayMatPrimas) {
      valor += solicitud.CantAprobada
    }
    return valor;
  }

  /** Calcular la cantidad faltante de materia prima */
  calcularCantFaltante() {
    let valor : number = 0;
    for (const solicitud of this.arrayMatPrimas) {
      valor += solicitud.CantFaltante
    }
    return valor;
  }

  
}
