import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { modelCategoriaMP } from 'src/app/Modelo/modelCategoriaMP';
import { CategoriaMateriaPrimaService } from 'src/app/Servicios/CategoriasMateriaPrima/categoriaMateriaPrima.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-crear-categorias-mp',
  templateUrl: './crear-categorias-mp.component.html',
  styleUrls: ['./crear-categorias-mp.component.css']
})
export class CrearCategoriasMPComponent implements OnInit {

  public formCrearCategoriasMP !: FormGroup;

  constructor(private frmBuilderCategoria : FormBuilder,
    private servicioCategoriasMP : CategoriaMateriaPrimaService) {

    this.formCrearCategoriasMP = this.frmBuilderCategoria.group({
      catNombre : new FormControl(),
      catDescripcion : new FormControl(),
     });
   }

   initForms() {
    this.formCrearCategoriasMP = this.frmBuilderCategoria.group({
      catNombre : [, Validators.required],
      catDescripcion : [, Validators.required],
     });
   }

  ngOnInit(): void {
    this.initForms();
  }

  registrarCategoriaMP() {
    const CamposCategoriasMP : modelCategoriaMP = {
      CatMP_Id: 0,
      CatMP_Nombre: this.formCrearCategoriasMP.get('catNombre')?.value,
      CatMP_Descripcion: this.formCrearCategoriasMP.get('catDescripcion')?.value,

    }
    this.servicioCategoriasMP.srvAgregar(CamposCategoriasMP).subscribe(datosCategoriasMP => {
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
        title: '¡Categoria creada con exito!'
      });
    });
    this.limpiarCampos();
  }

  validarCamposVacios() {
    if(this.formCrearCategoriasMP.valid) {
      this.registrarCategoriaMP();
    } else {
      Swal.fire('Los campos vacios deben ser llenados');
    }
  }

  limpiarCampos(){
    this.formCrearCategoriasMP.reset();
  }


}
