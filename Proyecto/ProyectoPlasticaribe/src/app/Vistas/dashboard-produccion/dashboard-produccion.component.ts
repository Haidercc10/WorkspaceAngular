import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import moment from 'moment';
import { forkJoin } from 'rxjs';
import { AppComponent } from 'src/app/app.component';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { ProduccionAreasService } from 'src/app/Servicios/ProduciconAreas/ProduccionAreas.service';
import { ProduccionDiariaService } from 'src/app/Servicios/Produccion_Diaria/produccion-diaria.service';
import DataLabelsPlugin from 'chartjs-plugin-datalabels';
import { ReporteProduccionComponent } from '../Reporte-Produccion/Reporte-Produccion.component';
import { DesperdicioService } from 'src/app/Servicios/Desperdicio/desperdicio.service';
import { alCambiarTema } from 'src/app/Servicios/Tema/Tema.service';
import { colorTextoGrafica, COLOR_REJILLA_GRAFICA, colorSerieGrafica } from 'src/app/Servicios/Tema/Paleta';

/** Configuración de un proceso de planta. Es la única fuente para gráficas, indicadores y tablas. */
interface ProcesoDashboard {
  /** Código en Produccion_Diaria (getProductionDay). */
  codigo: string;
  /** Nombre del área en Produccion_Areas (en mayúsculas). */
  area: string;
  nombre: string;
  icono: string;
  /** Sufijo de las clases CSS prd-/meta-/title-/proceso- (color --grafica-N). */
  clase: string;
  /** Posición en la paleta de gráficas (--grafica-N con N = indiceColor + 1). */
  indiceColor: number;
  /** Proceso fijo para el detalle de desperdicios (si no, se usa el de la fila). */
  desperdicio?: string;
}

/** Totales del día de un proceso, calculados una vez por consulta (no en cada ciclo de la vista). */
interface ResumenDia {
  maquinas: any[];
  kg: number;
  meta: number;
  kgDia: number;
  kgNoche: number;
  desperdicio: number;
  porcCumplimiento: number;
  porcDesperdicio: number;
}

/** Totales del mes actual de un área (Produccion_Areas + desperdicio del mes). */
interface ResumenMes {
  meta: number;
  produccion: number;
  /** Producido / meta del mes, en %. */
  porcMeta: number;
  /** Desviación proyectada al cierre del mes frente a la meta, en % (negativo = por debajo). */
  proyeccion: number;
  desperdicio: number;
  porcDesperdicio: number;
}

/** Etiquetas del eje de kg de las gráficas del mes: 100K, 1.2M (formato en-US). */
const FORMATO_EJE = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });

const RESUMEN_DIA_VACIO: ResumenDia = { maquinas: [], kg: 0, meta: 0, kgDia: 0, kgNoche: 0, desperdicio: 0, porcCumplimiento: 0, porcDesperdicio: 0 };
const RESUMEN_MES_VACIO: ResumenMes = { meta: 0, produccion: 0, porcMeta: 0, proyeccion: 0, desperdicio: 0, porcDesperdicio: 0 };

/** Columnas de Produccion_Areas por mes (índice 0 = enero). "producido_OCtubre" es el nombre real de la columna. */
const META_MES = ['meta_Enero', 'meta_Febrero', 'meta_Marzo', 'meta_Abril', 'meta_Mayo', 'meta_Junio',
  'meta_Julio', 'meta_Agosto', 'meta_Septiembre', 'meta_Octubre', 'meta_Noviembre', 'meta_Diciembre'];
const PRODUCIDO_MES = ['producido_Enero', 'producido_Febrero', 'producido_Marzo', 'producido_Abril', 'producido_Mayo', 'producido_Junio',
  'producido_Julio', 'producido_Agosto', 'producido_Septiembre', 'producido_OCtubre', 'producido_Noviembre', 'producido_Diciembre'];

@Component({
  selector: 'app-dashboard-produccion',
  templateUrl: './dashboard-produccion.component.html',
  styleUrls: ['./dashboard-produccion.component.css']
})
export class DashboardProduccionComponent implements OnInit, OnDestroy {
  @ViewChild(ReporteProduccionComponent) cmproduction: ReporteProduccionComponent | undefined;

  /** Hora (24 h) en que cierra el día de producción: el turno noche termina a las 06:59. */
  private static readonly HORA_CIERRE_DIA_PRODUCCION = 7;
  /** Cada cuánto se recargan los datos. */
  private static readonly INTERVALO_RECARGA_MS = 60000;

  /** Procesos en el orden del flujo de planta. */
  readonly procesos: ProcesoDashboard[] = [
    { codigo: 'EXT', area: 'EXTRUSION', nombre: 'Extrusión', icono: 'pi pi-bolt', clase: 'extrusion', indiceColor: 0 },
    { codigo: 'IMP', area: 'IMPRESION', nombre: 'Impresión', icono: 'pi pi-palette', clase: 'impresion', indiceColor: 1 },
    { codigo: 'LAM', area: 'LAMINADO', nombre: 'Laminado', icono: 'pi pi-file', clase: 'laminado', indiceColor: 6 },
    { codigo: 'PERF', area: 'PERFORADO', nombre: 'Perforado', icono: 'pi pi-ellipsis-v', clase: 'perforado', indiceColor: 2 },
    { codigo: 'DBLD', area: 'DOBLADO', nombre: 'Doblado', icono: 'pi pi-map', clase: 'doblado', indiceColor: 7 },
    { codigo: 'EMP', area: 'CORTE', nombre: 'Corte', icono: 'pi pi-database', clase: 'corte', indiceColor: 3, desperdicio: 'CORTE' },
    { codigo: 'SELLA', area: 'SELLADO', nombre: 'Sellado', icono: 'pi pi-box', clase: 'sellado', indiceColor: 4 },
    { codigo: 'CAMISILLA', area: 'CAMISILLA', nombre: 'Camisilla', icono: 'pi pi-bookmark', clase: 'camisilla', indiceColor: 5, desperdicio: 'SELLA' },
  ];
  /** Gráficas del mes en dos columnas: primera y segunda mitad del flujo. */
  readonly columnasMes: ProcesoDashboard[][] = [this.procesos.slice(0, 4), this.procesos.slice(4)];

  ValidarRol: any;
  dateSelected: Date;
  /** true cuando el usuario eligió una fecha en el calendario; la recarga automática la respeta. */
  private fechaElegidaPorUsuario: boolean = false;
  /** true mientras un administrador escribe una meta; la recarga automática no toca las tablas. */
  editandoMeta: boolean = false;
  private temporizadorRecarga: any;

  /** Skeletons de las gráficas del mes: solo en la carga inicial (la recarga automática no los muestra). */
  cargandoMes: boolean = true;
  /** Skeletons del panel de cumplimiento y de las tablas por máquina: carga inicial y cambio de día. */
  cargandoDia: boolean = true;
  /** Filas de relleno de las tablas mientras carga el día. */
  readonly filasCarga = [{}, {}, {}, {}];
  /** Número de la última consulta del día: si el usuario cambia de fecha antes de que llegue una
   *  respuesta, la respuesta vieja se descarta y no pisa los datos de la fecha nueva. */
  private consultaDiaActual = 0;

  /** Filas de getProductionDay de la fecha seleccionada. */
  private productionMachines: any[] = [];
  /** Totales del día por código de proceso. */
  resumenDia: { [codigo: string]: ResumenDia } = {};
  /** Totales del mes por área. */
  resumenMes: { [area: string]: ResumenMes } = {};
  /** Gráfica de barras (producción vs meta del mes) por área. */
  graficasMes: { [area: string]: { data: any, options: any } } = {};
  readonly pluginsGrafica = [DataLabelsPlugin];

  // Modales
  productionReport: boolean = false;
  /** Filtros que se aplican al reporte de producción cuando el diálogo termina de abrirse. */
  private filtrosReporte: { proceso?: string, maquina?: number, turno?: string } | null = null;
  wasteReport: boolean = false;
  arrayModal: any[] = [];

  modoSeleccionado: boolean;
  private readonly suscripcionTema = alCambiarTema(oscuro => this.modoSeleccionado = oscuro); // mantiene modoSeleccionado al día con el tema
  private readonly suscripcionTemaGraficas = alCambiarTema(() => this.construirGraficasMes(), { omitirActual: true }); // recolorea las gráficas al cambiar de tema

  constructor(
    private AppComponent: AppComponent,
    private svMsj: MensajesAplicacionService,
    private svProdAreas: ProduccionAreasService,
    private svDailyProd: ProduccionDiariaService,
    private svDesperdicios: DesperdicioService,
  ) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
  }

  ngOnInit() {
    this.ValidarRol = this.AppComponent.storage_Rol;
    this.dateSelected = this.ultimoDiaProduccionCerrado();
    this.loadDataProduction(true);
    this.temporizadorRecarga = setInterval(() => {
      // Sin fecha elegida, avanza sola al cerrar el día de producción (7:00 a. m.); si cambió el día, con skeletons
      const fechaAnterior = this.fechaSeleccionadaTexto();
      if (!this.fechaElegidaPorUsuario) this.dateSelected = this.ultimoDiaProduccionCerrado();
      this.loadDataProduction(this.fechaSeleccionadaTexto() !== fechaAnterior);
    }, DashboardProduccionComponent.INTERVALO_RECARGA_MS);
  }

  ngOnDestroy() {
    clearInterval(this.temporizadorRecarga);
  }

  /** Solo el administrador (rol 1) puede editar la meta diaria por máquina. */
  get esAdministrador(): boolean { return this.ValidarRol == 1; }

  /** Color del proceso: anillo de cumplimiento, barras de producción y meta. */
  colorProceso(proc: ProcesoDashboard): string {
    return colorSerieGrafica(proc.indiceColor, this.modoSeleccionado);
  }


  /** Totales del día de un proceso (vacío mientras llega la consulta). */
  dia(proc: ProcesoDashboard): ResumenDia { return this.resumenDia[proc.codigo] ?? RESUMEN_DIA_VACIO; }

  /** Totales del mes de un proceso (vacío mientras llega la consulta). */
  mes(proc: ProcesoDashboard): ResumenMes { return this.resumenMes[proc.area] ?? RESUMEN_MES_VACIO; }

  /** false si el proceso no tiene meta en el mes: la gráfica y el resumen muestran "Sin meta" en vez de 0 %. */
  tieneMetaMes(proc: ProcesoDashboard): boolean { return this.mes(proc).meta > 0; }

  /** Máximo del indicador de cumplimiento: 100 %, o más si se superó la meta. */
  maxCumplimiento(proc: ProcesoDashboard): number { return Math.max(100, this.dia(proc).porcCumplimiento); }

  /** Horario del día de producción seleccionado, p. ej. "23/11/2026 07:00 → 24/11/2026 06:59". */
  get rangoDiaProduccion(): string {
    const inicio = moment(this.dateSelected).hour(DashboardProduccionComponent.HORA_CIERRE_DIA_PRODUCCION).minute(0);
    const fin = inicio.clone().add(1, 'day').subtract(1, 'minute');
    return `${inicio.format('DD/MM/YYYY HH:mm')} → ${fin.format('DD/MM/YYYY HH:mm')}`;
  }

  trackProceso = (_: number, proc: ProcesoDashboard) => proc.codigo;

  // ===================== Fechas =====================

  /**
   * Último día de producción cerrado (fecha local, sin desfase UTC).
   * El día de producción D va de D 07:00 a D+1 06:59 (turno día 07:00–17:59, noche 18:00–06:59),
   * así que desde las 7:00 a. m. es ayer y antes de esa hora es antier.
   */
  private ultimoDiaProduccionCerrado(): Date {
    return moment()
      .subtract(DashboardProduccionComponent.HORA_CIERRE_DIA_PRODUCCION, 'hours')
      .subtract(1, 'day')
      .startOf('day')
      .toDate();
  }

  /** Fecha seleccionada en el formato de la API (YYYY-MM-DD). */
  private fechaSeleccionadaTexto(): string {
    return moment(this.dateSelected).format('YYYY-MM-DD');
  }

  /** El usuario eligió una fecha: la recarga automática la respeta en vez de volver a la de por defecto. */
  alElegirFecha() {
    this.fechaElegidaPorUsuario = true;
    this.editandoMeta = false;   // otro día: lo que se estuviera escribiendo ya no aplica
    this.consultarProduccionDia(true);   // el acumulado del mes no depende de la fecha elegida
  }

  // ===================== Carga de datos =====================

  /** @param mostrarCarga true en la carga inicial y al cambiar de día: muestra skeletons mientras llega el día. */
  loadDataProduction(mostrarCarga: boolean = false) {
    this.consultarProduccionMes();
    // Si un administrador está escribiendo una meta, no se recargan las tablas (se perdería lo escrito)
    if (!this.editandoMeta || mostrarCarga) this.consultarProduccionDia(mostrarCarga);
  }

  /**
   * Producción por máquina del día seleccionado (tablas y panel de cumplimiento diario).
   * Con mostrarCarga se ven skeletons; sin él (recarga automática) los datos anteriores se mantienen
   * hasta que llega la respuesta, para que las tablas no parpadeen cada minuto.
   */
  private consultarProduccionDia(mostrarCarga: boolean = false) {
    const fecha = this.fechaSeleccionadaTexto();
    const consulta = ++this.consultaDiaActual;
    if (mostrarCarga) this.cargandoDia = true;
    this.svDailyProd.getProductionDay(fecha, fecha).subscribe({
      next: data => {
        if (consulta !== this.consultaDiaActual) return;   // llegó tarde: ya se pidió otra fecha
        this.productionMachines = data ?? [];
        this.productionMachines.forEach(x => x.metaGuardada = x.goal);
        this.recalcularResumenDia();
        this.cargandoDia = false;
      },
      error: error => {
        if (consulta !== this.consultaDiaActual) return;
        this.productionMachines = [];
        this.recalcularResumenDia();
        this.cargandoDia = false;
        this.svMsj.errorDetallado(error, 'No se pudo consultar la producción diaria por máquina',
          { operacion: `Consultar producción del ${fecha}`, metodo: 'GET' });
      }
    });
  }

  /** Totales del día por proceso. Se llama al recibir datos y al guardar una meta. */
  private recalcularResumenDia() {
    const resumen: { [codigo: string]: ResumenDia } = {};
    for (const proc of this.procesos) {
      const maquinas = this.ordenarMaquinas(this.productionMachines.filter(x => x.process == proc.codigo));
      const conProduccion = maquinas.filter(x => x.weight > 0);
      const kg = this.sumar(maquinas, x => x.weight);
      const meta = this.sumar(conProduccion, x => x.goal);            // meta solo de las máquinas que produjeron
      const desperdicio = this.sumar(maquinas, x => x.waste > 0 ? x.waste : 0);
      resumen[proc.codigo] = {
        maquinas,
        kg,
        meta,
        kgDia: this.sumar(conProduccion, x => x.weightDay),
        kgNoche: this.sumar(conProduccion, x => x.weightNight),
        desperdicio,
        porcCumplimiento: meta > 0 ? Math.round(kg * 100 / meta) : 0,
        porcDesperdicio: kg > 0 ? Math.round(desperdicio * 100 / kg) : 0,
      };
    }
    this.resumenDia = resumen;
  }

  /**
   * Primero las máquinas con producción o desperdicio en el día y después las que están en 0; cada grupo
   * por número de máquina. Así, en procesos con muchas máquinas (Extrusión, Sellado), las que trabajaron
   * se ven sin hacer scroll. Las columnas de la tabla se pueden seguir ordenando con clic.
   */
  private ordenarMaquinas(maquinas: any[]): any[] {
    const tuvoMovimiento = (x: any) => (Number(x.weight) || 0) > 0 || (Number(x.waste) || 0) > 0;
    return [...maquinas].sort((a, b) =>
      Number(tuvoMovimiento(b)) - Number(tuvoMovimiento(a))
      || (Number(a.machine) || 0) - (Number(b.machine) || 0));
  }

  /** Producción y desperdicio del mes actual por área (gráficas de la izquierda): 2 consultas en paralelo. */
  private consultarProduccionMes() {
    forkJoin({
      areas: this.svProdAreas.GetProduccionAreas_Mes(moment().year()),
      desperdicios: this.svDesperdicios.GetDesperdiciosMesPorProceso(),
    }).subscribe({
      next: ({ areas, desperdicios }) => {
        const desperdicioPorProceso = new Map((desperdicios ?? []).map(d => [d.proceso, d.desperdicio]));
        const mesActual = moment().month();
        const resumen: { [area: string]: ResumenMes } = {};

        for (const fila of areas ?? []) {
          const area = (fila.proceso_Nombre ?? '').toUpperCase();
          const meta: number = fila[META_MES[mesActual]] ?? 0;
          const produccion: number = fila[PRODUCIDO_MES[mesActual]] ?? 0;
          const acumulado = resumen[area] ?? { ...RESUMEN_MES_VACIO };
          acumulado.meta += meta;
          acumulado.produccion += produccion;
          acumulado.proyeccion += this.proyeccionMes(meta, produccion);
          acumulado.desperdicio += desperdicioPorProceso.get(fila.proceso_Id) ?? 0;
          resumen[area] = acumulado;
        }
        for (const r of Object.values(resumen)) {
          r.porcMeta = r.meta > 0 ? Math.round(r.produccion * 100 / r.meta) : 0;
          r.porcDesperdicio = r.produccion > 0 ? r.desperdicio * 100 / r.produccion : 0;
        }

        this.resumenMes = resumen;
        this.construirGraficasMes();   // con los datos ya recibidos (antes: setTimeout de 3 s)
        this.cargandoMes = false;
      },
      error: error => {
        this.cargandoMes = false;
        this.svMsj.errorDetallado(error, 'No se pudo consultar la producción y el desperdicio del mes por procesos',
          { operacion: `Consultar producción por áreas ${moment().year()}`, metodo: 'GET' });
      }
    });
  }

  /**
   * Desviación proyectada al cierre del mes frente a la meta, en %: el ritmo de producción de los días
   * corridos llevado al mes completo. 0 si no hay meta o aún no corre el mes (día 1 antes de la 1 a. m.).
   */
  private proyeccionMes(meta: number, produccion: number): number {
    const diasCorridos = (moment().date() - 1) + (moment().hour() / 24);
    if (diasCorridos <= 0 || !(meta > 0)) return 0;
    const proyectado = produccion / diasCorridos * moment().daysInMonth();
    return (proyectado / meta - 1) * 100;
  }

  private sumar(filas: any[], valor: (x: any) => number): number {
    return filas.reduce((total, x) => total + (Number(valor(x)) || 0), 0);
  }

  // ===================== Gráficas del mes =====================

  /** Barras horizontales producción vs meta del mes de cada proceso. También al cambiar de tema. */
  private construirGraficasMes() {
    const colorTexto = colorTextoGrafica(this.modoSeleccionado);
    const graficas: { [area: string]: { data: any, options: any } } = {};
    for (const proc of this.procesos) {
      const color = this.colorProceso(proc);
      const mes = this.mes(proc);
      graficas[proc.area] = {
        data: {
          labels: [''],
          datasets: [
            { label: 'Producción', backgroundColor: color, color: colorTexto, data: [mes.produccion] },
            // Sin meta en el mes (Laminado, Doblado, Perforado): no se dibuja la serie ni su leyenda
            ...(this.tieneMetaMes(proc)
              ? [{ label: 'Meta', backgroundColor: color + '55', borderColor: color, borderWidth: 2, color: colorTexto, data: [mes.meta] }]
              : []),
          ]
        },
        options: {
          indexAxis: 'y',
          plugins: {
            legend: { labels: { color: colorTexto, boxWidth: 24, font: { size: 11 } } },
            tooltip: {
              usePointStyle: true, bodyFont: { size: 13 },
              callbacks: { label: (c: any) => ` ${c.dataset.label}: ${Number(c.raw).toLocaleString('en-US')} Kg` }
            }
          },
          scales: {
            // Ejes en formato en-US y compactos (100K, 1.2M) sin girar, para que no se amontonen
            x: {
              ticks: {
                color: colorTexto, maxRotation: 0, autoSkip: true, maxTicksLimit: 6,
                callback: (valor: number) => FORMATO_EJE.format(valor)
              },
              grid: { color: COLOR_REJILLA_GRAFICA }
            },
            y: { ticks: { color: colorTexto }, grid: { color: COLOR_REJILLA_GRAFICA } }
          }
        }
      };
    }
    this.graficasMes = graficas;
  }

  // ===================== Meta diaria por máquina =====================

  /** Teclas en la celda de meta: Enter guarda y Escape descarta lo escrito. */
  alTeclearMeta(data: any, evento: KeyboardEvent, proceso: string) {
    if (evento.key === 'Enter') this.guardarMeta(data, proceso);
    else if (evento.key === 'Escape') data.goal = data.metaGuardada;
  }

  /**
   * Guarda la meta del día de una máquina (solo administrador). Se llama con Enter y al salir de la celda;
   * no envía nada si la meta no cambió y exige que sea mayor a 0.
   */
  guardarMeta(data: any, proceso: string) {
    this.editandoMeta = false;
    if (!this.esAdministrador) return;

    const meta = Number(data.goal);
    const anterior = data.metaGuardada;
    if (meta === anterior) return;
    if (!(meta > 0)) {
      data.goal = anterior;
      this.svMsj.mensajeAdvertencia('La meta debe ser mayor a 0');
      return;
    }

    // Se marca como guardada antes de la respuesta: el Enter cierra la celda y dispara el blur, que no debe reenviar
    data.metaGuardada = meta;
    this.svDailyProd.putGoalForMachine(data.machine, proceso, this.fechaSeleccionadaTexto(), meta).subscribe({
      next: () => {
        data.percentage = data.weight > 0 ? Math.round(data.weight * 100 / meta) : 0;
        this.recalcularResumenDia();
        this.svMsj.mensajeConfirmacion('¡Meta actualizada!', `Máquina N° ${data.machine}: ${meta.toLocaleString('en-US')} Kg`);
      },
      error: error => {
        data.goal = anterior;
        data.metaGuardada = anterior;
        this.svMsj.errorDetallado(error, `No se pudo guardar la meta de la máquina N° ${data.machine}`,
          { operacion: 'Actualizar meta diaria por máquina', metodo: 'PUT' });
      }
    });
  }

  /** % de desperdicio de una máquina. */
  porcWaste(prod: number, waste: number): number {
    return prod > 0 && waste > 0 ? waste * 100 / prod : 0;
  }

  // ===================== Modales =====================

  /** Abre el reporte de producción de una máquina (y turno, si se indica) del día seleccionado. */
  getDetailsProductionForMachine(process?: string, machine?: number, turn?: string) {
    // El reporte se crea al abrir el diálogo: los filtros se aplican en alMostrarReporteProduccion
    this.filtrosReporte = { proceso: process?.toUpperCase(), maquina: machine, turno: turn };
    this.productionReport = true;
  }

  /** (onShow) del diálogo de producción: el componente del reporte ya existe y puede recibir los filtros. */
  alMostrarReporteProduccion() {
    if (!this.cmproduction || !this.filtrosReporte) return;
    this.cmproduction.formFiltros.patchValue({
      rangoFechas: [new Date(this.dateSelected), new Date(this.dateSelected)],
      proceso: this.filtrosReporte.proceso ?? null,
      Maquina: this.filtrosReporte.maquina ?? null,
      Turno: this.filtrosReporte.turno ?? null,
    });
    this.cmproduction.consultarProduccion();
  }

  /** Detalle de desperdicios de una máquina en el día de producción seleccionado. */
  loadDetailsWaste(process: string, machine: number, waste: number) {
    this.arrayModal = [];
    if (!(waste > 0)) {
      this.svMsj.mensajeAdvertencia('No existen registros de desperdicios');
      return;
    }

    const fecha = this.fechaSeleccionadaTexto();
    const ruta: string = `?process=${process}&machine=${machine}`;
    this.svDesperdicios.getDesperdicio(fecha, fecha, ruta).subscribe({
      next: data => {
        if (data?.length > 0) {
          this.arrayModal = data.map(x => this.filaModalDesperdicio(x));
          this.wasteReport = true;
        } else this.svMsj.mensajeAdvertencia(`No se encontraron registros de desperdicio de la máquina N° ${machine} el ${fecha}`);
      },
      error: error => this.svMsj.errorDetallado(error, 'No se pudo consultar el detalle de desperdicios',
        { operacion: `Consultar desperdicios de la máquina N° ${machine} (${fecha})`, metodo: 'GET' })
    });
  }

  /** Fila de la tabla del modal de desperdicios. "Observacion" es el número de rollo (columna Consec.). */
  private filaModalDesperdicio(datos: any) {
    return {
      'OT': datos.ot,
      'Item': datos.item,
      'Referencia': datos.referencia,
      'Peso': datos.cantidad,
      'Und': datos.presentacion,
      'Proceso': datos.id_Proceso,
      'Material': datos.material,
      'No_Conformidad': datos.falla,
      'Impreso': datos.impreso,
      'Maquina': datos.maquina,
      'Operario': datos.operario,
      'Fecha': (datos.fecha_Registro ?? '').replace('T00:00:00', ''),
      'Hora': datos.hora_Registro,
      'Observacion': datos.observacion,
    };
  }

  totalWasteModal = () => this.arrayModal.reduce((total, x) => total + (x.Peso ?? 0), 0);
}
