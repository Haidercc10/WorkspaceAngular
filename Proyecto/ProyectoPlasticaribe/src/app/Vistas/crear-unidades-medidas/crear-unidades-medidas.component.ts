import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { modelUnidadMedida } from 'src/app/Modelo/modelUnidadMedida';
import { CategoriaMateriaPrimaService } from 'src/app/Servicios/categoriaMateriaPrima.service';
import { UnidadMedidaService } from 'src/app/Servicios/unidad-medida.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-crear-unidades-medidas',
  templateUrl: './crear-unidades-medidas.component.html',
  styleUrls: ['./crear-unidades-medidas.component.css']
})
export class CrearUnidadesMedidasComponent implements OnInit {

  public formCrearUnidadesMedidas !: FormGroup; /* FormControlName Formulario*/

  constructor(private frmBuilderUndMedida : FormBuilder,
    private servicioUndMedida : UnidadMedidaService) {

    this.formCrearUnidadesMedidas = this.frmBuilderUndMedida.group({
      undIdentificador : new FormControl(),
      undNombre : new FormControl(),
      undDescripcion : new FormControl(),
     });
   }
   /*  Inicialización de formularios */
   initForms() {
    this.formCrearUnidadesMedidas = this.frmBuilderUndMedida.group({
      undIdentificador : [, Validators.required],
      undNombre : [, Validators.required],
      undDescripcion : [, Validators.required],
     });
   }

  /* Funciones que se cargan al abrir la vista actual */
  ngOnInit(): void {
    this.initForms();
  }

  /** Registrar materias Primas */
  registrarUndMedida() {
    const CamposUndMedida : modelUnidadMedida = {
      UndMed_Id: this.formCrearUnidadesMedidas.get('undIdentificador')?.value,
      UndMed_Nombre: this.formCrearUnidadesMedidas.get('undNombre')?.value,
      UndMed_Descripcion: this.formCrearUnidadesMedidas.get('undDescripcion')?.value,
    }
    console.log(CamposUndMedida);
    this.servicioUndMedida.srvAgregar(CamposUndMedida).subscribe(datosCategoriasMP => {
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
        title: '¡Unidad de medida creada con exito!'
      });
    });
    this.limpiarCampos();
  }

  validarCamposVacios() {
    if(this.formCrearUnidadesMedidas.valid) {
      this.registrarUndMedida();
    } else {
      Swal.fire('Los campos vacios deben ser llenados');
    }
  }

  limpiarCampos(){
    this.formCrearUnidadesMedidas.reset();
  }

}
