import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription, finalize } from 'rxjs';
import { CategoriaMateriaPrimaService } from 'src/app/Servicios/CategoriasMateriaPrima/categoriaMateriaPrima.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { SubcategoriasMatPrimaService } from 'src/app/Servicios/Subcategorias_MatPrima/subcategorias-mat-prima.service';
import { TintasService } from 'src/app/Servicios/Tintas/tintas.service';
import { UnidadMedidaService } from 'src/app/Servicios/UnidadMedida/unidad-medida.service';

/** Categorías de tintas, chips y solventes. */
const CATEGORIAS_TINTAS = [7, 8, 13];

/** Código de color en hexadecimal: 3, 6 u 8 dígitos, con o sin #. */
const PATRON_HEXADECIMAL = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

/**
 * Formulario para crear tintas, chips y solventes.
 * Se usa en Reporte de Materia Prima, Asignación de tintas y Órdenes de compra.
 */
@Component({
  selector: 'app-crear-tintas',
  templateUrl: './crear-tintas.component.html',
  styleUrls: ['./crear-tintas.component.css']
})
export class CrearTintasComponent implements OnInit, OnDestroy {

  /** Se emite con la tinta creada (para que la página que lo usa pueda refrescar su información). */
  @Output() creada = new EventEmitter<any>();

  public formularioTintas !: FormGroup; /** Formulario de tintas */
  public unidadMedida : any = [] /** Unidades de medida del combobox. */
  categorias : any [] = []; /** Categorías de tintas, chips y solventes */
  subcategorias : any[] = []; /** Subcategorías de la categoría elegida */
  guardando : boolean = false; //Evita enviar dos veces la misma tinta
  private descripcionEditada : boolean = false; //Si el usuario escribió la descripción, ya no se copia del nombre
  private suscripciones = new Subscription();

  constructor(private frmBuilderCT : FormBuilder,
    private servicioUnidadMedida : UnidadMedidaService,
    private servicioTintas : TintasService,
    private categoriasService : CategoriaMateriaPrimaService,
    private svSubcategorias : SubcategoriasMatPrimaService,
    private mensajeService: MensajesAplicacionService) {

    this.formularioTintas = this.frmBuilderCT.group({
      TintaNombre : [null, [Validators.required, Validators.pattern(/\S/)]],
      TintaDescripcion : [null],
      TintaCodigoHexa: ['', Validators.pattern(PATRON_HEXADECIMAL)],
      TintaUndMedida : ['Kg', Validators.required],
      TintaPrecio: [null, [Validators.required, Validators.min(0)]],
      TintaCategoria : [null, Validators.required],
      TintaSubcategoria : [null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.obtenerUnidadMedida();
    this.obtenerCategorias();
    this.suscripciones.add(this.formularioTintas.get('TintaCategoria')!.valueChanges.subscribe(() => this.obtenerSubcategorias()));
  }

  ngOnDestroy(): void {
    this.suscripciones.unsubscribe();
  }

  /** Cargar categorias en el combobox del modal de tintas */
  obtenerCategorias = () => this.categoriasService.srvObtenerLista().subscribe(datos => this.categorias = (datos ?? []).filter((item) => CATEGORIAS_TINTAS.includes(item.catMP_Id)));

  /** Cargar unidades medidas en combobox */
  obtenerUnidadMedida = () => this.servicioUnidadMedida.srvObtenerLista().subscribe(datos => this.unidadMedida = datos);

  /** Carga las subcategorías de la categoría elegida y limpia la subcategoría anterior. */
  obtenerSubcategorias() {
    const id : number = this.formularioTintas.get('TintaCategoria')?.value;
    this.subcategorias = [];
    this.formularioTintas.patchValue({ TintaSubcategoria: null }, { emitEvent: false });
    if (id == null) return;
    this.svSubcategorias.getSubcategoriesForCategory(id).subscribe(data => this.subcategorias = data ?? []);
  }

  /** Color de 6 dígitos para la vista previa del selector (null si el código está vacío o no es válido). */
  get colorVistaPrevia() : string | null {
    const codigo : string = (this.formularioTintas.value.TintaCodigoHexa ?? '').trim().replace(/^#/, '');
    if (!codigo || !PATRON_HEXADECIMAL.test(codigo)) return null;
    if (codigo.length == 3) return '#' + codigo.split('').map(c => c + c).join(''); //F00 -> FF0000
    return '#' + codigo.substring(0, 6); //Con 8 dígitos se ignora la transparencia
  }

  /** El selector de color entrega el código sin #; se guarda en mayúsculas. */
  elegirColor(color : string | object) {
    if (typeof color !== 'string') return; //Con format="hex" el selector siempre entrega texto
    this.formularioTintas.patchValue({ TintaCodigoHexa: color.replace(/^#/, '').toUpperCase() });
    this.formularioTintas.get('TintaCodigoHexa')?.markAsDirty();
  }

  /** Si el campo quedó vacío/inválido después de tocarlo (para resaltarlo en rojo). */
  invalido = (campo : string) : boolean => {
    const control = this.formularioTintas.get(campo);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  /** Agregar la tinta a la base de datos (la API valida los datos y que el nombre no exista). */
  agregarTintas() {
    if (this.formularioTintas.invalid) {
      this.formularioTintas.markAllAsTouched();
      this.mensajeService.mensajeAdvertencia('Advertencia', '¡Debe llenar los campos obligatorios (*)!');
      return;
    }
    if (this.guardando) return;
    const valores = this.formularioTintas.value;
    const nombre : string = (valores.TintaNombre ?? '').trim();

    this.guardando = true;
    this.servicioTintas.crearTinta({
      Nombre: nombre,
      Descripcion: (valores.TintaDescripcion ?? '').trim() || nombre,
      CodigoHexadecimal: (valores.TintaCodigoHexa ?? '').trim(),
      UndMed_Id: valores.TintaUndMedida,
      CatMP_Id: valores.TintaCategoria,
      SubCatMP_Id: valores.TintaSubcategoria,
      Precio: valores.TintaPrecio,
    }).pipe(finalize(() => this.guardando = false)).subscribe({
      next: data => {
        this.mensajeService.mensajeConfirmacion('¡Tinta creada!', `${data.tinta_Nombre} quedó con el Id ${data.tinta_Id}.`);
        this.creada.emit(data);
        this.limpiarCampos();
      },
      error: error => this.mensajeService.mensajeError('¡No se creó la tinta!',
        typeof error?.error === 'string' && error.error ? error.error : 'Ocurrió un error al crear la tinta, verifique.', 5000),
    });
  }

  /** Limpia todos los campos */
  limpiarCampos() {
    this.formularioTintas.reset({ TintaCodigoHexa: '', TintaUndMedida: 'Kg' }, { emitEvent: false });
    this.subcategorias = [];
    this.descripcionEditada = false;
  }

  /** Valida que los campos esten llenos y crea la tinta. */
  validarCampos = () => this.agregarTintas();

  /** Mientras el usuario no escriba su propia descripción, se llena con el nombre. */
  cargarDescripcion() {
    if (!this.descripcionEditada) this.formularioTintas.patchValue({ TintaDescripcion: this.formularioTintas.value.TintaNombre });
  }

  /** Marca la descripción como escrita por el usuario (si la deja vacía vuelve a copiarse del nombre). */
  editarDescripcion() {
    this.descripcionEditada = !!(this.formularioTintas.value.TintaDescripcion ?? '').trim();
  }
}
