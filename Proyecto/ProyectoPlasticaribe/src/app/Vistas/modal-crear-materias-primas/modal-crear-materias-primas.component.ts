import { ThisReceiver } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CategoriaMateriaPrimaService } from 'src/app/Servicios/categoriaMateriaPrima.service';
import { MateriaPrimaService } from 'src/app/Servicios/materiaPrima.service';
import { TintasService } from 'src/app/Servicios/tintas.service';
import { TintasMPService } from 'src/app/Servicios/tintasMP.service';
import { UnidadMedidaService } from 'src/app/Servicios/unidad-medida.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modal-crear-materias-primas',
  templateUrl: './modal-crear-materias-primas.component.html',
  styleUrls: ['./modal-crear-materias-primas.component.css']
})
export class ModalCrearMateriasPrimasComponent implements OnInit {

  public FormCrearMateriaPrima !: FormGroup; /** Formulario Materia Prima */
  public comboUnidadMedida = []; /** Combobox unidad de medida */
  public comboCategoriasMatPri = []; /** Combobox Categorias materia prima */
  public comboTintas = []; /** Combobox tintas */
  public ultimoIdMateriaPrima: any = [];

  /** Llamar Servicios y creación de formulario */
  constructor(private FormBuilderCMP : FormBuilder,
    private servicioCategorias : CategoriaMateriaPrimaService,
    private servicioUnidadMedida : UnidadMedidaService,
    private servicioTintas : TintasService,
    private servicioMatPrima : MateriaPrimaService,
    private servicioTintas_MatPrima : TintasMPService ) {

      this.FormCrearMateriaPrima = this.FormBuilderCMP.group({
        mpNombre : new FormControl(),
        mpdescripcion : new FormControl(),
        mpCategoria: new FormControl(),
        mpUnidadMedida: new FormControl(),
        mpValor: new FormControl(),
        mpTinta: new FormControl(),
      });

  }
  /** Inicializacion de formularios */
  initForms(){
    this.FormCrearMateriaPrima = this.FormBuilderCMP.group({
      mpNombre : [, Validators.required],
      mpdescripcion :  [, Validators.required],
      mpCategoria: [, Validators.required],
      mpUnidadMedida: [, Validators.required],
      mpValor: [, Validators.required],
      mpTinta: [, Validators.required],
    });
  }
  /** Cargue de formularios al iniciar esta vista */
  ngOnInit(): void {
    this.initForms();
    this.obtenerNombreCategoriasMp();
    this.obtenerNombresTintas();
    this.obtenerUnidadMedida();
  }

    /*Funcion que va almacenar todas las unidades de medida existentes en la empresa*/
    obtenerUnidadMedida(){
      this.servicioUnidadMedida.srvObtenerLista().subscribe(datos_unidadesMedida => {
        for (let index = 0; index < datos_unidadesMedida.length; index++) {
          this.comboUnidadMedida.push(datos_unidadesMedida[index].undMed_Id);
          this.comboUnidadMedida.sort();
        }
      });
  }

  //Funcion que va a buscar y almacenar todos los nombre de las categorias de materia prima
  obtenerNombreCategoriasMp(){
      this.servicioCategorias.srvObtenerLista().subscribe(datos_categorias => {
        for (let index = 0; index < datos_categorias.length; index++) {
          this.comboCategoriasMatPri.push(datos_categorias[index]);
          this.comboCategoriasMatPri.sort((a,b) => a.catMP_Nombre.localeCompare(b.catMP_Nombre));
        }
      });
  }

  /** Función para traer el nombre de las tintas desde la base de datos al combobox */
  obtenerNombresTintas() {
    this.servicioTintas.srvObtenerLista().subscribe(datosTintas => {
      for (let tin = 0; tin < datosTintas.length; tin++) {
        this.comboTintas.push(datosTintas[tin]);
        this.comboTintas.sort();
      }
    });
  }

  registrarMateriaPrimaDesdeModal() {
    let bodegaId = 4;

    const camposMateriasPrimas : any = {
      MatPri_Nombre: this.FormCrearMateriaPrima.get('mpNombre')?.value,
      MatPri_Descripcion: this.FormCrearMateriaPrima.get('mpdescripcion')?.value,
      CatMP_Id: this.FormCrearMateriaPrima.get('mpCategoria')?.value,
      UndMed_Id: this.FormCrearMateriaPrima.get('mpUnidadMedida')?.value,
      MatPri_Precio: this.FormCrearMateriaPrima.get('mpValor')?.value,
      Tinta_Id: this.FormCrearMateriaPrima.get('mpTinta')?.value,
      TpBod_Id: bodegaId,
    }
    console.log(camposMateriasPrimas);

    /**  Agregar Materia Prima */
    this.servicioMatPrima.srvAgregar(camposMateriasPrimas).subscribe(datosMatPrima => {
      this.crearRelacionTintas_MateriaPrima(camposMateriasPrimas.Tinta_Id, camposMateriasPrimas.Tinta_Id);
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

  /** Función que limpia los campos del formulario. */
  limpiarCampos() {
    this.FormCrearMateriaPrima.reset();
  }

  /** Función que creará la relación entre tintas y materias primas */
  crearRelacionTintas_MateriaPrima(Tinta : number, MatPrima : number) {
    const datosTintasMatPrima = {
      idTinta : Tinta,
      idMatPrima : MatPrima,
    }

    this.servicioTintas_MatPrima.srvAgregar(datosTintasMatPrima).subscribe(dataTintaMP => {
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
  }

  /** Obtener el ultimo Id de materia prima para relacionarlo con tintas
  al momento de crear una MatPrima desde el modal. */
  obtenerUltimoIDMatPrima(){
    let identificadoresMP = [];

    this.servicioMatPrima.srvObtenerLista().subscribe(datos_MP => {
      for (let index = 0; index < datos_MP.length; index++) {
        identificadoresMP = datos_MP[index].matPri_Id
      }
      //this.ultimoIdMateriaPrima = Math.max.apply(null, identificadoresMP);
      //this.ultimoIdMateriaPrima = this.ultimoIdMateriaPrima + 1;

      console.log(identificadoresMP);
    });
  }
}
