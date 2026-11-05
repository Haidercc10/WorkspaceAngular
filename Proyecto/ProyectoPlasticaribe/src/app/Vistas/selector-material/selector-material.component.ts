import { Component, EventEmitter, forwardRef, HostBinding, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Campo de búsqueda de materiales (materia prima, tintas, BOPP, etc.) por id o por nombre.
 * Reemplaza los `<datalist>` nativos, que dejaban de desplegarse tras seleccionar una opción.
 *
 * Comportamiento con el FormControl:
 * - Mientras se escribe, el control recibe el texto ingresado.
 * - Al seleccionar una opción (clic, flechas + Enter, o Enter con coincidencia exacta de id/nombre),
 *   el control recibe el id de la opción y se emite `seleccionar` con el objeto completo, de modo que
 *   los manejadores existentes (que leen el id desde el control) funcionan sin cambios.
 * - Si se presiona Enter y no hay coincidencia, se emite `consultarTexto` con el texto escrito.
 */
@Component({
  selector: 'app-selector-material',
  templateUrl: './selector-material.component.html',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SelectorMaterialComponent), multi: true }]
})
export class SelectorMaterialComponent implements ControlValueAccessor, OnChanges {

  /** Lista de opciones a mostrar. */
  @Input() opciones: any[] = [];
  /** Propiedad que contiene el id de cada opción (valor que recibe el control al seleccionar). */
  @Input() campoId: string = 'id';
  /** Propiedad que contiene el nombre de cada opción. */
  @Input() campoNombre: string = 'nombre';
  /** Propiedad que se muestra en el campo tras seleccionar. Por defecto, el nombre. */
  @Input() campoTexto?: string;
  /** Propiedad opcional con el stock, que se muestra en cada opción. */
  @Input() campoStock?: string;
  @Input() inputId?: string;
  @Input() readonly: boolean = false;
  /** Cantidad máxima de opciones mostradas al filtrar localmente. */
  @Input() maxResultados: number = 50;
  /** Si es true, no filtra localmente: emite `buscar` y muestra las `opciones` que el padre cargue. */
  @Input() busquedaRemota: boolean = false;
  @Input() minLength: number = 1;

  /** Opción seleccionada; el control ya contiene su id. */
  @Output() seleccionar = new EventEmitter<any>();
  /** Enter sin coincidencia en la lista; el control contiene el texto escrito. */
  @Output() consultarTexto = new EventEmitter<string>();
  /** Búsqueda remota: el padre debe actualizar `opciones` con el resultado. */
  @Output() buscar = new EventEmitter<string>();

  @HostBinding('style.display') display = 'block';
  @HostBinding('class.p-inputwrapper-focus') enfocado = false;
  @HostBinding('class.p-inputwrapper-filled') get lleno() { return this.texto != null && this.texto !== ''; }

  texto: any = '';
  sugerencias: any[] = [];
  deshabilitado = false;
  private seleccionReciente = false;

  private onChange: (valor: any) => void = () => { };
  private onTouched: () => void = () => { };

  get campoMostrado() { return this.campoTexto || this.campoNombre; }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['opciones'] && this.busquedaRemota) this.sugerencias = (this.opciones ?? []).slice(0, this.maxResultados);
  }

  writeValue(valor: any) {
    this.texto = valor ?? '';
  }

  registerOnChange(fn: (valor: any) => void) { this.onChange = fn; }

  registerOnTouched(fn: () => void) { this.onTouched = fn; }

  setDisabledState(deshabilitado: boolean) { this.deshabilitado = deshabilitado; }

  /** Cambio del modelo interno: el texto escrito se propaga al control; las selecciones se manejan en `alSeleccionar`. */
  alCambiarTexto(valor: any) {
    this.texto = valor;
    if (valor !== null && typeof valor === 'object') return;
    this.seleccionReciente = false;
    this.onChange(valor ?? '');
  }

  filtrar(event: { query: string }) {
    const consulta = (event.query ?? '').toString().trim();
    if (this.busquedaRemota) return this.buscar.emit(consulta);
    this.sugerencias = this.coincidencias(consulta).slice(0, this.maxResultados);
  }

  alSeleccionar(event: any) {
    const item = event && 'originalEvent' in event ? event.value : event;
    if (item == null) return;
    this.seleccionReciente = true;
    this.texto = item;
    this.onChange(item[this.campoId]);
    this.seleccionar.emit(item);
  }

  /** Enter: si no se acaba de seleccionar, busca coincidencia exacta (id o nombre) o única; si no hay, emite `consultarTexto`. */
  alPresionarEnter() {
    if (this.seleccionReciente || this.readonly || this.deshabilitado) return;
    const consulta = (this.texto ?? '').toString().trim();
    if (!consulta) return;

    const minuscula = consulta.toLowerCase();
    const fuente = this.busquedaRemota ? (this.opciones ?? []) : this.coincidencias(consulta);
    const exacta = fuente.find(x => x?.[this.campoId]?.toString() === consulta)
      ?? fuente.find(x => x?.[this.campoNombre]?.toString().toLowerCase() === minuscula)
      ?? (fuente.length === 1 ? fuente[0] : null);

    if (exacta) this.alSeleccionar(exacta);
    else this.consultarTexto.emit(consulta);
  }

  alEnfocar() { this.enfocado = true; }

  alDesenfocar() {
    this.enfocado = false;
    this.onTouched();
  }

  /** Opciones cuyo id empieza por la consulta o cuyo nombre la contiene. */
  private coincidencias(consulta: string): any[] {
    const lista = this.opciones ?? [];
    const minuscula = consulta.toLowerCase();
    if (!minuscula) return lista;
    return lista.filter(x =>
      x?.[this.campoId]?.toString().toLowerCase().startsWith(minuscula) ||
      x?.[this.campoNombre]?.toString().toLowerCase().includes(minuscula) ||
      (this.campoTexto && x?.[this.campoTexto]?.toString().toLowerCase().includes(minuscula)));
  }
}
