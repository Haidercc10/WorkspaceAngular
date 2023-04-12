import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { MessageService } from 'primeng/api';
import { BoppGenericoService } from 'src/app/Servicios/BoppGenerico/BoppGenerico.service';
import { CategoriaMateriaPrimaService } from 'src/app/Servicios/CategoriasMateriaPrima/categoriaMateriaPrima.service';

@Component({
  selector: 'app-crear-bopp',
  templateUrl: './crear-bopp.component.html',
  styleUrls: ['./crear-bopp.component.css']
})
export class CrearBoppComponent implements OnInit {

  FormBopp : FormGroup; /** Formulario para crear BOPP Genérico */
  categorias : any [] = []; /** Array para cargar las categorias de bopp's */
  unidadMedida : any []= []; /** Array para cargar las unidades de medida de bopp's */
  tintaCreada = false;
  informacion : string = '';

  constructor(private frmBuilder : FormBuilder,
                private boppGenericoService : BoppGenericoService,
                    private categoriasService : CategoriaMateriaPrimaService,
                      private messageService: MessageService) {

    this.FormBopp = this.frmBuilder.group({
      Nombre : [null, Validators.required],
      Ancho : [null, Validators.required],
      Micras : [null, Validators.required],
    });
  }

  ngOnInit() {
    this.obtenerCategorias();
  }

  //Funcion que va a limpoar todos los campos
  limpiarCampos(){
    this.FormBopp.reset();
  }

  // Funcion que va a abtener las categorias
  obtenerCategorias(){
    this.categoriasService.srvObtenerLista().subscribe(datos_categorias => {
      for (let i = 0; i < datos_categorias.length; i++) {
        let cat : number [] = [6,14,15];
        if (cat.includes(datos_categorias[i].catMP_Id)) this.categorias.push(datos_categorias[i]);
      }
    });
  }

  // Funcion que creará el bopp generico en la base de datos
  crearBoppGenerico(){
    if (this.FormBopp.valid){
      let info : any = {
        BoppGen_Nombre : this.FormBopp.value.Nombre,
        BoppGen_Ancho : this.FormBopp.value.Ancho,
        BoppGen_Micra : this.FormBopp.value.Micras,
        BoppGen_FechaIngreso : moment().format('YYYY-MM-DD'),
        BoppGen_Hora : moment().format('H:mm:ss'),
      }
      this.boppGenericoService.srvGuardar(info).subscribe(datos_bopp => {
        this.mostrarConfirmacion('¡El rollo ha sido creado con éxito!')
        setTimeout(() => { this.limpiarCampos(); }, 500);
      }, error => { this.mostrarError(`No fue posible crear el rollo, verifique!`) });
    } else this.mostrarAdvertencia('Debe llenar los campos vacios!')
  }

  /** Mostrar mensaje de confirmación al crear tinta */
  mostrarConfirmacion(mensaje : any) {
    this.messageService.add({severity:'success', detail: mensaje});
  }

  /** Mostrar mensaje de error al crear tinta */
  mostrarError(mensaje : any) {
    this.messageService.add({severity:'error', detail: mensaje});
  }

  /** Mostrar mensaje de advertencia al crear tinta */
  mostrarAdvertencia(mensaje : any) {
    this.messageService.add({severity:'warning', detail: mensaje});
  }

}
