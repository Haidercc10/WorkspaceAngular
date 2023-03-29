import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { modelTintasMateriasPrimas } from 'src/app/Modelo/modelTintasMateriasPrimas';
import { CategoriaMateriaPrimaService } from 'src/app/Servicios/CategoriasMateriaPrima/categoriaMateriaPrima.service';
import { MateriaPrimaService } from 'src/app/Servicios/MateriaPrima/materiaPrima.service';
import { TintasService } from 'src/app/Servicios/Tintas/tintas.service';
import { TintasMPService } from 'src/app/Servicios/Tintas_MateriaPrima/tintasMP.service';
import { UnidadMedidaService } from 'src/app/Servicios/UnidadMedida/unidad-medida.service';

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

  /** Llamar Servicios y creación de formulario */
  constructor(private FormBuilderCMP : FormBuilder,
                private servicioCategorias : CategoriaMateriaPrimaService,
                  private servicioUnidadMedida : UnidadMedidaService,
                    private servicioTintas : TintasService,
                      private servicioMatPrima : MateriaPrimaService,
                        private servicioTintas_MatPrima : TintasMPService,
                          private messageService: MessageService) {


    this.FormCrearMateriaPrima = this.FormBuilderCMP.group({
      mpNombre : [, Validators.required],
      mpdescripcion :  [, Validators.required],
      mpCategoria: [, Validators.required],
      mpUnidadMedida: [, Validators.required],
      mpValor: [, Validators.required],
    });
  }

  /** Cargue de formularios al iniciar esta vista */
  ngOnInit(): void {
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
      CatMP_Id: this.FormCrearMateriaPrima.get('mpCategoria')?.value.catMP_Id,
      UndMed_Id: this.FormCrearMateriaPrima.get('mpUnidadMedida')?.value,
      MatPri_Precio: this.FormCrearMateriaPrima.get('mpValor')?.value,
      Tinta_Id: this.FormCrearMateriaPrima.get('mpTinta')?.value,
      TpBod_Id: bodegaId,
    }

    /**  Agregar Materia Prima */
    this.servicioMatPrima.srvAgregar(camposMateriasPrimas).subscribe(datosMatPrima => {
      this.mostrarConfirmacion(`¡Se ha creado la Materia prima!`);
    }, error => { this.messageService.add({severity:'error', detail: `¡Ocurrió un error al intentar crear la matria prima!`}); });

    this.limpiarCampos();
  }

  mostrarConfirmacion(mensaje : any) {
    this.messageService.add({severity:'success', detail: mensaje});
  }

  /** Función que limpia los campos del formulario. */
  limpiarCampos() {
    this.FormCrearMateriaPrima.reset();
  }

  /** Función que creará la relación entre tintas y materias primas */
  crearRelacionTintas_MateriaPrima(Tinta : number, MatPrima : number) {
    const datosTintasMatPrima : modelTintasMateriasPrimas = {
      Tinta_Id : Tinta,
      MatPri_Id : MatPrima,
    }
    this.servicioTintas_MatPrima.srvAgregar(datosTintasMatPrima).subscribe(dataTintaMP => { });
  }
}
