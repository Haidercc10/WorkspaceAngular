import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { modelTintas } from 'src/app/Modelo/modelTintas';
import { TintasService } from 'src/app/Servicios/tintas.service';
import { TintasMPService } from 'src/app/Servicios/tintasMP.service';
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

  /** Inyeccion httpClient y servicios */
  constructor(private http : HttpClient,
    private frmBuilderCT : FormBuilder,
    private servicioUnidadMedida : UnidadMedidaService,
    private servicioTintas : TintasService) {
      /** Creación formulario */
      this.formularioTintas = this.frmBuilderCT.group({
        TintaNombre : new FormControl(),
        TintaDescripcion : new FormControl(),
        TintaCodigoHexa: new FormControl(),
        TintaUndMedida: new FormControl(),
        TintaPrecio: new FormControl(),
      });
     }

  /**Inicialización de formularios */
  initForms() {
    this.formularioTintas = this.frmBuilderCT.group({
      TintaNombre : [, Validators.required],
      TintaDescripcion : [, Validators.required],
      TintaCodigoHexa: [, Validators.required],
      TintaUndMedida : [, Validators.required],
      TintaPrecio: [, Validators.required],
    });
  }

  /** Cargar formulario al iniciar/Abrir modal */
  ngOnInit(): void {
    this.initForms();
    this.obtenerUnidadMedida();
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
    let categoriaId : number = 7; /** Variable de la categoria de la Mat.Prima/Tinta */
    let cantidadTinta : number = 0; /** cantidad de tinta inicializada en 0*/
    let CodigoHexa : string = ' ';

    const datosTintas : modelTintas = {
      Tinta_Nombre: this.formularioTintas.get('TintaNombre')?.value,
      Tinta_Descripcion: this.formularioTintas.get('TintaDescripcion')?.value,
      Tinta_CodigoHexadecimal: this.formularioTintas.get('TintaCodigoHexa')?.value,
      UndMed_Id: this.formularioTintas.get('TintaUndMedida')?.value,
      Tinta_Precio: this.formularioTintas.get('TintaPrecio')?.value,
      Tinta_Stock: cantidadTinta,
      CatMP_Id: categoriaId,
      TpBod_Id: bodegaId,
    }

    if(datosTintas.Tinta_CodigoHexadecimal == null) {
      datosTintas.Tinta_CodigoHexadecimal = CodigoHexa;
    }

    console.log(datosTintas);
    this.servicioTintas.srvGuardar(datosTintas).subscribe(datosTintas => {
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
        title: '¡Tinta creada con exito!'
      });
      //this.consultarTodasMateriasPrimas();
    });
    this.limpiarCampos();
  }

/** Limpia todos los campos */
  limpiarCampos(){
    this.formularioTintas.reset();
  }

  /** Valida que los campos esten llenos. */
  validarCampos(){
    if(this.formularioTintas.valid) {
      this.agregarTintas();
    } else {
      Swal.fire('Debe llenar los campos vacios.')
    }
  }

}
