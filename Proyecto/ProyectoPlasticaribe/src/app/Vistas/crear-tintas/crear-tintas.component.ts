import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { modelTintas } from 'src/app/Modelo/modelTintas';
import { CategoriaMateriaPrimaService } from 'src/app/Servicios/CategoriasMateriaPrima/categoriaMateriaPrima.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { TintasService } from 'src/app/Servicios/Tintas/tintas.service';
import { UnidadMedidaService } from 'src/app/Servicios/UnidadMedida/unidad-medida.service';

@Component({
  selector: 'app-crear-tintas',
  templateUrl: './crear-tintas.component.html',
  styleUrls: ['./crear-tintas.component.css']
})
export class CrearTintasComponent implements OnInit {

  public formularioTintas !: FormGroup; /** Formulario de tintas */
  public unidadMedida = [] /** Almacena unidades de medida y las coloca en el combobox. */
  categorias : any [] = []; /** Array para cargar las categorias de Tintas */

  /** Inyeccion httpClient y servicios */
  constructor(private frmBuilderCT : FormBuilder,
                private servicioUnidadMedida : UnidadMedidaService,
                  private servicioTintas : TintasService,
                    private categoriasService : CategoriaMateriaPrimaService,
                      private mensajeService: MensajesAplicacionService) {

    this.formularioTintas = this.frmBuilderCT.group({
      TintaNombre : [null, Validators.required],
      TintaDescripcion : [null, Validators.required],
      TintaCodigoHexa: [''],
      TintaUndMedida : ['Kg', Validators.required],
      TintaPrecio: [null, Validators.required],
      TintaCategoria : [null, Validators.required],
    });
  }

  /** Cargar formulario al iniciar/Abrir modal */
  ngOnInit(): void {
    this.obtenerUnidadMedida();
    this.obtenerCategorias();
  }

  /** Cargar categorias en el combobox del modal de tintas */
  obtenerCategorias = () => this.categoriasService.srvObtenerLista().subscribe(datos => this.categorias = datos.filter((item) => [7,8,13].includes(item.catMP_Id)));

  /** Cargar unidades medidas en combobox */
  obtenerUnidadMedida = () => this.servicioUnidadMedida.srvObtenerLista().subscribe(datos => this.unidadMedida = datos);

  /** Agregar registros no existentes de tintas a la Base de Datos. */
  agregarTintas(){
    let bodegaId : number = 5; /** Variable del tipo de bodega de tintas */
    let cantidadTinta : number = 0; /** cantidad de tinta inicializada en 0*/

    if(this.formularioTintas.valid){
      const datosTintas : modelTintas = {
        Tinta_Nombre: this.formularioTintas.get('TintaNombre')?.value,
        Tinta_Descripcion: this.formularioTintas.get('TintaDescripcion')?.value,
        Tinta_CodigoHexadecimal: this.formularioTintas.get('TintaCodigoHexa')?.value,
        UndMed_Id: this.formularioTintas.get('TintaUndMedida')?.value,
        Tinta_Precio: this.formularioTintas.get('TintaPrecio')?.value,
        Tinta_Stock: cantidadTinta,
        CatMP_Id: this.formularioTintas.value.TintaCategoria,
        TpBod_Id: bodegaId,
        Tinta_InvInicial : cantidadTinta,
        Tinta_FechaIngreso : moment().format('YYYY-MM-DD'),
        Tinta_Hora : moment().format('H:mm:ss'),
      }
      this.servicioTintas.srvGuardar(datosTintas).subscribe(() => {
        this.mensajeService.mensajeConfirmacion('Tinta creada con éxito!', '');
        setTimeout(() => { this.limpiarCampos(); }, 500);
      }, () => this.mensajeService.mensajeError(`Error`, 'Fallo al crear la tinta, por favor, verifique!'));
    }
  }

  /** Limpia todos los campos */
  limpiarCampos(){
    this.formularioTintas.patchValue({
      TintaNombre : null,
      TintaDescripcion : null,
      TintaCodigoHexa: '',
      TintaUndMedida : 'Kg',
      TintaPrecio: null,
      TintaCategoria : null
    });
  }

  /** Valida que los campos esten llenos. */
  validarCampos = () => this.formularioTintas.valid ? this.agregarTintas() : this.mensajeService.mensajeAdvertencia('Advertencia', 'Debe llenar los campos vacios!');

  /** Cargar el nombre en la descripción. */
  cargarDescripcion = () => this.formularioTintas.patchValue({ TintaDescripcion : this.formularioTintas.value.TintaNombre, });
}
