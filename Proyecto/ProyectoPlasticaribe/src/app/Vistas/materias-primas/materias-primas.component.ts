import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { modelMateriaPrima } from 'src/app/Modelo/modelMateriaPrima';
import { CategoriaMateriaPrimaService } from 'src/app/Servicios/categoriaMateriaPrima.service';
import { MateriaPrimaService } from 'src/app/Servicios/materiaPrima.service';
import { UnidadMedidaService } from 'src/app/Servicios/unidad-medida.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-materias-primas',
  templateUrl: './materias-primas.component.html',
  styleUrls: ['./materias-primas.component.css']
})
export class MateriasPrimasComponent implements OnInit {

  public formularioMatPrimas !: FormGroup;
  public formularioConsultaMP !: FormGroup;
  titulosTabla = [];
  public unidadMedida = [];
  public nombreCategoriasMP =[];
  public nombreMateriasPrimas =[];
  public componenteCrearCategoriaModal : boolean = false;
  public componenteCrearUnidadMedidaModal : boolean = false;

  /* Constructor / Llamar servicios */
  constructor(private frmBuilder : FormBuilder,
  private unidadMedidaService : UnidadMedidaService,
  private categoriMpService : CategoriaMateriaPrimaService,
  private servicioMateriasPrimas : MateriaPrimaService) {

     /** Formulario Materias Primas */
    this.formularioMatPrimas = this.frmBuilder.group({
      MatPriNombre : new FormControl(),
      MatPriDescripcion : new FormControl(),
      MatPriStock: new FormControl(),
      MatPriUnidadMedida: new FormControl(),
      MatPriCategoria: new FormControl(),
      MatPriPrecio: new FormControl(),
    });

    /** Formulario consulta materias primas */
    this.formularioConsultaMP = this.frmBuilder.group({
      consMatPri_Id : new FormControl(),
      consMatPri_Nombre : new FormControl(),
    });
   }
   /*  Inicialización de formularios */
  initForms() {

    /** Formulario Materias Primas */
    this.formularioMatPrimas = this.frmBuilder.group({
      MatPriNombre : [, Validators.required],
      MatPriDescripcion : [, Validators.required],
      MatPriStock: [, Validators.required],
      MatPriUnidadMedida: [, Validators.required],
      MatPriCategoria: [, Validators.required],
      MatPriPrecio: [, Validators.required],
    });

    /** Formulario consulta materias primas */
    this.formularioConsultaMP = this.frmBuilder.group({
      consMatPri_Id : [, Validators.required],
      consMatPri_Nombre : [, Validators.required],
    });
  }

  /* Funciones que se cargan al abrir la vista actual */
  ngOnInit(): void {
    this.initForms();
    this.ColumnasTabla();
    this.obtenerUnidadMedida();
    this.obtenerNombreCategoriasMp();
    this.obtenerNombreMateriaPrima();
  }

  /** Columnas de la tabla */
  ColumnasTabla(){
    this.titulosTabla = [{
      mpNombre : "Nombre",
      mpDescripcion : "Descripción",
      mpStock : "Stock",
      mpUndMedida : "Und. Medida",
      mpCategoria : "Categoria",
      mpPrecio : "Precio",
    }];
  }

  /*Funcion que va almacenar todas las unidades de medida existentes en la empresa*/
  obtenerUnidadMedida(){
      this.unidadMedidaService.srvObtenerLista().subscribe(datos_unidadesMedida => {
        for (let index = 0; index < datos_unidadesMedida.length; index++) {
          this.unidadMedida.push(datos_unidadesMedida[index].undMed_Id);
        }
      });
  }

  //Funcion que va a buscar y almacenar todos los nombre de las categorias de materia prima
  obtenerNombreCategoriasMp(){
      this.categoriMpService.srvObtenerLista().subscribe(datos_categorias => {
        for (let index = 0; index < datos_categorias.length; index++) {
          this.nombreCategoriasMP.push(datos_categorias[index]);
        }
      });
  }

  //Funcion que va a cargar todos los nombre de materia prima en combobox
  obtenerNombreMateriaPrima(){
    this.servicioMateriasPrimas.srvObtenerLista().subscribe(datos_MateriasPrimas => {
      for (let index = 0; index < datos_MateriasPrimas.length; index++) {
        this.nombreMateriasPrimas.push(datos_MateriasPrimas[index]);
      }
    });
  }

  /** Cargar tabla de materias primas */
  cargarTablaMateriasPrimas() {

  }

  /** Función Validar que los campos del formulario contengan datos */
  validarCamposVacios() {
    if(this.formularioMatPrimas.valid) {
      this.registrarMateriasPrimas();
    } else {
      Swal.fire('Los campos vacios deben ser llenados');
    }
  }

  /** Registrar materias Primas */
  registrarMateriasPrimas(){
    /*Id Bodega mat. primas */
    let IdBodega: number = 4;

    const camposMateriasPrimas : modelMateriaPrima = {
      MatPri_Id: 0,
      MatPri_Nombre: this.formularioMatPrimas.get('MatPriNombre')?.value,
      MatPri_Descripcion: this.formularioMatPrimas.get('MatPriDescripcion')?.value,
      MatPri_Stock: this.formularioMatPrimas.get('MatPriStock')?.value,
      UndMed_Id: this.formularioMatPrimas.get('MatPriUnidadMedida')?.value,
      CatMP_Id: this.formularioMatPrimas.get('MatPriCategoria')?.value,
      MatPri_Precio: this.formularioMatPrimas.get('MatPriPrecio')?.value,
      TpBod_Id: IdBodega,
    }

    this.servicioMateriasPrimas.srvAgregar(camposMateriasPrimas).subscribe(datosMateriaPrima => {
      const Toast = Swal.mixin({
        toast: true,
        position: 'center',
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
      });
      Toast.fire({
        icon: 'success',
        title: '¡Materia Prima creada con exito!'
      });

    });
    this.limpiarCampos();
  }
  /** Función para limpiar los campos del formulario. */
  limpiarCampos(){
    this.formularioMatPrimas.reset();
  }

  /** Función que llama el componente de crear-categoria  */
  LlamarModalCrearCategoria() {
    this.componenteCrearCategoriaModal = true;
  }

  /** Función que llama el componente de crear-unidad-medida  */
  LlamarModalCrearUnidadMedida() {
    this.componenteCrearUnidadMedidaModal = true;
  }

}
