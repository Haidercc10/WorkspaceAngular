import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { modelTintas } from 'src/app/Modelo/modelTintas';
import { CategoriaMateriaPrimaService } from 'src/app/Servicios/categoriaMateriaPrima.service';
import { TintasService } from 'src/app/Servicios/tintas.service';
import { UnidadMedidaService } from 'src/app/Servicios/unidad-medida.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-crear-tintas',
  templateUrl: './crear-tintas.component.html',
  styleUrls: ['./crear-tintas.component.css']
})
export class CrearTintasComponent implements OnInit {

  public formularioTintas !: FormGroup; /** Formulario de tintas */
  public unidadMedida = [] /** Almacena unidades de medida y las coloca en el combobox. */
  categorias : any [] = [];
  tintaCreada = false;
  informacion : string = '';

  /** Inyeccion httpClient y servicios */
  constructor(private http : HttpClient,
              private frmBuilderCT : FormBuilder,
                private servicioUnidadMedida : UnidadMedidaService,
                  private servicioTintas : TintasService,
                    private categoriasService : CategoriaMateriaPrimaService,) {

    this.formularioTintas = this.frmBuilderCT.group({
      TintaNombre : [null, Validators.required],
      TintaDescripcion : [null, Validators.required],
      TintaCodigoHexa: [''],
      TintaUndMedida : ['Kg', Validators.required],
      TintaPrecio: [null, Validators.required],
      TintaCategoria : [null, Validators.required]
    });
  }

  /** Cargar formulario al iniciar/Abrir modal */
  ngOnInit(): void {
    this.obtenerUnidadMedida();
    this.obtenerCategorias();
  }

  obtenerCategorias(){
    this.categoriasService.srvObtenerLista().subscribe(datos_categorias => {
      for (let i = 0; i < datos_categorias.length; i++) {
        if (datos_categorias[i].catMP_Id == 7
            || datos_categorias[i].catMP_Id == 8
            || datos_categorias[i].catMP_Id == 13) this.categorias.push(datos_categorias[i]);
      }
    });
  }

  /** Cargar unidades medidas en combobox */
  obtenerUnidadMedida(){
    this.servicioUnidadMedida.srvObtenerLista().subscribe(datos_unidadesMedida => {
      for (let index = 0; index < datos_unidadesMedida.length; index++) {
        this.unidadMedida.push(datos_unidadesMedida[index].undMed_Id);
        this.unidadMedida.sort();
      }
    });
  }

  /** Agregar registros no existentes de tintas a la Base de Datos. */
  agregarTintas(){
    let bodegaId : number = 5; /** Variable del tipo de bodega de tintas */
    let cantidadTinta : number = 0; /** cantidad de tinta inicializada en 0*/
    let CodigoHexa : string = '';

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
      }
      this.servicioTintas.srvGuardar(datosTintas).subscribe(datosTintas => {
        this.tintaCreada = true;
        this.informacion = '¡Tinta creada satisfactoriamente!';
        this.formularioTintas = this.frmBuilderCT.group({
          TintaNombre : null,
          TintaDescripcion : null,
          TintaCodigoHexa: '',
          TintaUndMedida : 'Kg',
          TintaPrecio: null,
          TintaCategoria : null
        });
      }, error => {
        this.tintaCreada = true;
        this.informacion = `¡Fallo al crear la tinta! \n\n ${error.message}`;
      });
    }
  }

  /** Limpia todos los campos */
  limpiarCampos(){
    this.tintaCreada = false;
    this.formularioTintas = this.frmBuilderCT.group({
      TintaNombre : null,
      TintaDescripcion : null,
      TintaCodigoHexa: '',
      TintaUndMedida : 'Kg',
      TintaPrecio: null,
      TintaCategoria : null
    });
  }

  /** Valida que los campos esten llenos. */
  validarCampos(){
    if(this.formularioTintas.valid) this.agregarTintas();
    else Swal.fire('Debe llenar los campos vacios.');
  }

}
