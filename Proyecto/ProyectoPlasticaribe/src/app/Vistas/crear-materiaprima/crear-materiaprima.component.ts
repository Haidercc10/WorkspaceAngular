import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription, finalize } from 'rxjs';
import { CategoriaMateriaPrimaService } from 'src/app/Servicios/CategoriasMateriaPrima/categoriaMateriaPrima.service';
import { MaterialProductoService } from 'src/app/Servicios/MaterialProducto/materialProducto.service';
import { MateriaPrimaService } from 'src/app/Servicios/MateriaPrima/materiaPrima.service';
import { MatPrima_Material_PigmentoService } from 'src/app/Servicios/MatPrima_Material_Pigmento/MatPrima_Material_Pigmento.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { PigmentoProductoService } from 'src/app/Servicios/PigmentosProductos/pigmentoProducto.service';
import { SubcategoriasMatPrimaService } from 'src/app/Servicios/Subcategorias_MatPrima/subcategorias-mat-prima.service';

/** Categorías de tintas, chips y solventes: se crean desde el formulario de tintas, no desde este. */
const CATEGORIAS_TINTAS = [7, 8, 13];

/**
 * Formulario para crear materias primas (polietilenos y recuperados).
 * Se usa en Reporte de Materia Prima, Asignación de tintas, Órdenes de compra e Ingreso de peletizado.
 * Ingreso de peletizado lo ajusta desde afuera: filtra `nombreCategoriasMP`, fija `mpCategoria` y activa `recovery`.
 */
@Component({
  selector: 'app-crear-materiaprima',
  templateUrl: './crear-materiaprima.component.html',
  styleUrls: ['./crear-materiaprima.component.css']
})
export class CrearMateriaprimaComponent implements OnInit, OnDestroy {

  /** Se emite con la materia prima creada (para que la página que lo usa pueda refrescar su información). */
  @Output() creada = new EventEmitter<any>();

  public materiPrima !: FormGroup; /** Formulario de Materias Primas */
  nombreCategoriasMP : any[] = []; //Categorías de materia prima (sin las de tintas)
  subcategories : any[] = []; //Subcategorías de la categoría elegida
  materials : any[] = []; //Materiales (solo para recuperados)
  pigments : any[] = []; //Pigmentos (solo para recuperados)
  guardando : boolean = false; //Evita enviar dos veces la misma materia prima
  private descripcionEditada : boolean = false; //Si el usuario escribió la descripción, ya no se copia del nombre
  private suscripciones = new Subscription();
  private _recovery : boolean = false;

  /** Modo recuperado (Ingreso de peletizado): pide también el material y el pigmento. */
  get recovery() : boolean { return this._recovery; }
  set recovery(valor : boolean) {
    this._recovery = valor;
    for (const campo of ['mpMaterial', 'mpPigment']) {
      const control = this.materiPrima.get(campo);
      control?.setValidators(valor ? Validators.required : null);
      control?.updateValueAndValidity();
    }
    if (valor && this.materials.length == 0) this.getMaterials();
    if (valor && this.pigments.length == 0) this.getPigments();
  }

  constructor(private materiaPrimaService: MateriaPrimaService,
    private categoriMpService: CategoriaMateriaPrimaService,
    private frmBuilderMateriaPrima: FormBuilder,
    private mensajeService: MensajesAplicacionService,
    private svMaterials: MaterialProductoService,
    private svPigments: PigmentoProductoService,
    private svMMP: MatPrima_Material_PigmentoService,
    private svSubCatMP: SubcategoriasMatPrimaService,
  ) {
    this.materiPrima = this.frmBuilderMateriaPrima.group({
      mpNombre: [null, [Validators.required, Validators.pattern(/\S/)]],
      mpDescripcion: [null],
      mpCategoria: [null, Validators.required],
      mpSubcategory: [null, Validators.required],
      mpValor: [null, [Validators.required, Validators.min(0)]],
      mpMaterial: [null],
      mpPigment: [null],
    });
  }

  ngOnInit() {
    this.obtenerNombreCategoriasMp();
    //Las subcategorías se recargan al cambiar la categoría, también cuando se fija desde afuera (Ingreso de peletizado).
    this.suscripciones.add(this.materiPrima.get('mpCategoria')!.valueChanges.subscribe(() => this.getSubcategoriesForId()));
  }

  ngOnDestroy() {
    this.suscripciones.unsubscribe();
  }

  //Funcion que va a buscar y almacenar las categorias de materia prima (sin las de tintas, chips y solventes)
  obtenerNombreCategoriasMp = () => this.categoriMpService.srvObtenerLista().subscribe(datos => this.nombreCategoriasMP = (datos ?? []).filter(x => !CATEGORIAS_TINTAS.includes(x.catMP_Id)));

  /** Carga las subcategorías de la categoría elegida y limpia la subcategoría si ya no corresponde. */
  getSubcategoriesForId() {
    const id : number = this.materiPrima.get('mpCategoria')?.value;
    this.subcategories = [];
    this.materiPrima.patchValue({ mpSubcategory: null }, { emitEvent: false });
    if (id == null) return;
    this.svSubCatMP.getSubcategoriesForCategory(id).subscribe(data => this.subcategories = data ?? []);
  }

  /** Mientras el usuario no escriba su propia descripción, se llena con el nombre. */
  cargarDescripcion() {
    if (!this.descripcionEditada) this.materiPrima.patchValue({ mpDescripcion: this.materiPrima.value.mpNombre });
  }

  /** Marca la descripción como escrita por el usuario (si la deja vacía vuelve a copiarse del nombre). */
  editarDescripcion() {
    this.descripcionEditada = !!(this.materiPrima.value.mpDescripcion ?? '').trim();
  }

  /** Si el campo es obligatorio y quedó vacío/inválido después de tocarlo (para resaltarlo en rojo). */
  invalido = (campo : string) : boolean => {
    const control = this.materiPrima.get(campo);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  /** Limpiar campos (conserva la categoría si está fija, como en Ingreso de peletizado). */
  limpiarCampos() {
    const categoriaFija = this.recovery ? this.materiPrima.value.mpCategoria : null;
    this.materiPrima.reset({ mpCategoria: categoriaFija }, { emitEvent: false });
    this.descripcionEditada = false;
    if (!categoriaFija) this.subcategories = [];
  }

  /** Crear el registro de la materia prima en la base de datos (la API valida los datos y que el nombre no exista). */
  registrarMateriPrima() {
    if (this.materiPrima.invalid) {
      this.materiPrima.markAllAsTouched();
      this.mensajeService.mensajeAdvertencia('Advertencia', '¡Debe llenar los campos obligatorios (*)!');
      return;
    }
    if (this.guardando) return;
    const valores = this.materiPrima.value;
    const nombre : string = (valores.mpNombre ?? '').trim();

    this.guardando = true;
    this.materiaPrimaService.crearMateriaPrima({
      Nombre: nombre,
      Descripcion: (valores.mpDescripcion ?? '').trim() || nombre,
      CatMP_Id: valores.mpCategoria,
      SubCatMP_Id: valores.mpSubcategory,
      Precio: valores.mpValor,
    }).pipe(finalize(() => this.guardando = false)).subscribe({
      next: data => {
        this.mensajeService.mensajeConfirmacion('¡Materia prima creada!', `${data.matPri_Nombre} quedó con el Id ${data.matPri_Id}.`);
        if (this.recovery) this.createRecovery(data.matPri_Id, valores.mpMaterial, valores.mpPigment);
        this.creada.emit(data);
        this.limpiarCampos();
      },
      error: error => this.mensajeService.mensajeError('¡No se creó la materia prima!',
        typeof error?.error === 'string' && error.error ? error.error : 'Ocurrió un error al crear la materia prima, verifique.', 5000),
    });
  }

  //Cargar materiales
  getMaterials = () => this.svMaterials.srvObtenerLista().subscribe(data => this.materials = data ?? []);

  //Cargar pigmentos
  getPigments = () => this.svPigments.srvObtenerLista().subscribe(data => this.pigments = data ?? []);

  //Crear la relación del recuperado con su material y pigmento
  createRecovery(matprima : any, material : any, pigmento : any) {
    const info : any = { 'MatPri_Id': matprima, 'Material_Id': material, 'Pigmt_Id': pigmento };
    this.svMMP.Post(info).subscribe({
      error: error => this.mensajeService.mensajeError(`Error al crear la relación entre recuperado, material y pigmento | ${error.status} ${error.statusText}`),
    });
  }
}
