import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { modelCategoriaMP } from 'src/app/Modelo/modelCategoriaMP';
import { CategoriaMateriaPrimaService } from 'src/app/Servicios/CategoriasMateriaPrima/categoriaMateriaPrima.service';
import { Categorias_ArchivosService } from 'src/app/Servicios/CategoriasArchivos/Categorias_Archivos.service';
import Swal from 'sweetalert2';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-CrearCategorias',
  templateUrl: './CrearCategorias.component.html',
  styleUrls: ['./CrearCategorias.component.css']
})
export class CrearCategoriasComponent implements OnInit {

  public formCrearCategorias !: FormGroup;

  constructor(private frmBuilderCategoria : FormBuilder,
              private categoriaService : Categorias_ArchivosService,
              private messageService: MessageService) {

    this.formCrearCategorias = this.frmBuilderCategoria.group({
      catNombre : [, Validators.required],
      catDescripcion : [, Validators.required],
     });
   }

  ngOnInit(): void {
    this.limpiarCampos();
  }

  // Funcion que va a limpiar los campos
  limpiarCampos(){
    this.formCrearCategorias.reset();
  }

  // Funcion que va a registrar las categorias de archivos
  crearCategoriaArchivos(){
    if (this.formCrearCategorias.valid) {
      let nombre : string = this.formCrearCategorias.value.catNombre;
      let descripcion : string = this.formCrearCategorias.value.catDescripcion;

      let data : any = {
        categoria_Name : nombre,
        categoria_Descricion : descripcion,
      }

      this.categoriaService.srvGuardar(data).subscribe(datos_categorias => {
        this.mostrarConfirmacion(`Confirmación`, `La categoria de archivos ${nombre} se ha guardado exitosamente!`);
        this.limpiarCampos();
      }, error => { this.mostrarError(`Error`, `No fue posible crear la categoría!`) });
    } else this.mostrarAdvertencia(`Advertencia`, `Debe llenar los campos vacios!`);
  }

  /** Mostrar mensaje de confirmación  */
  mostrarConfirmacion(mensaje : any, titulo?: any) {
    this.messageService.add({severity: 'success', summary: mensaje,  detail: titulo, life: 2000});
  }

   /** Mostrar mensaje de error  */
  mostrarError(mensaje : any, titulo?: any) {
    this.messageService.add({severity:'error', summary: mensaje, detail: titulo, life: 5000});
  }

   /** Mostrar mensaje de advertencia */
  mostrarAdvertencia(mensaje : any, titulo?: any) {
    this.messageService.add({severity:'warn', summary: mensaje, detail: titulo, life: 2000});
  }
}
