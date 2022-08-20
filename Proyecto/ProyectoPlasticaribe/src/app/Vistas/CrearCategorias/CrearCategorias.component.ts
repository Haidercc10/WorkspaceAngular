import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { modelCategoriaMP } from 'src/app/Modelo/modelCategoriaMP';
import { CategoriaMateriaPrimaService } from 'src/app/Servicios/categoriaMateriaPrima.service';
import { Categorias_ArchivosService } from 'src/app/Servicios/Categorias_Archivos.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-CrearCategorias',
  templateUrl: './CrearCategorias.component.html',
  styleUrls: ['./CrearCategorias.component.css']
})
export class CrearCategoriasComponent implements OnInit {

  public formCrearCategorias !: FormGroup;

  constructor(private frmBuilderCategoria : FormBuilder,
              private categoriaService : Categorias_ArchivosService,) {

    this.formCrearCategorias = this.frmBuilderCategoria.group({
      catNombre : [, Validators.required],
      catDescripcion : [, Validators.required],
     });
   }

  //
  ngOnInit(): void {
    this.limpiarCampos();
  }

  // Funcion que va a limpiar los campos
  limpiarCampos(){
    this.formCrearCategorias.reset();
  }

  // Funcion que va a registrar las categorias
  crearCategoriaArchivos(){
    if (this.formCrearCategorias.valid) {
      let nombre : string = this.formCrearCategorias.value.catNombre;
      let descripcion : string = this.formCrearCategorias.value.catDescripcion;

      let data : any = {
        categoria_Name :nombre ,
        categoria_Descricion : descripcion,
      }

      this.categoriaService.srvGuardar(data).subscribe(datos_categorias => {
        this.limpiarCampos();
        const Toast = Swal.mixin({
          toast: true,
          position: 'center',
          showConfirmButton: false,
          timer: 2200,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
          }
        });
        Toast.fire({
          icon: 'success',
          title: `¡La Categoria ${nombre} se ha creado con exito!`
        });
      });
    } else Swal.fire(`¡Por favor llene todos los campos!`);
  }

}
