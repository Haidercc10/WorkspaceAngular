import { Component, Injectable, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { BoppGenericoService } from 'src/app/Servicios/BoppGenerico/BoppGenerico.service';
import { CategoriaMateriaPrimaService } from 'src/app/Servicios/CategoriasMateriaPrima/categoriaMateriaPrima.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { EntradaBOPPComponent } from '../Entrada-BOPP/Entrada-BOPP.component';

@Injectable({
  providedIn: 'root'
})

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
                  private mensajeService : MensajesAplicacionService,
                    private categoriasService : CategoriaMateriaPrimaService,
                      private EntradaBOPP : EntradaBOPPComponent) {

    this.FormBopp = this.frmBuilder.group({
      Nombre : [null, Validators.required],
      Ancho : [null, Validators.required],
      Micras : [null, Validators.required],
    });
  }

  ngOnInit() {
    this.obtenerCategorias();
    setTimeout(() => { this.EntradaBOPP.cargarBoppsGenericos(); },  500);
  }

  //Funcion que va a limpoar todos los campos
  limpiarCampos = () => this.FormBopp.reset();

  // Funcion que va a abtener las categorias
  obtenerCategorias = () => this.categoriasService.srvObtenerLista().subscribe(datos => this.categorias = datos.filter((item) => [6,14,15].includes(item.catMP_Id)));

  // Funcion que creará el bopp generico en la base de datos
  crearBoppGenerico(){
    if (this.FormBopp.valid){
      let info : any = {
        BoppGen_Nombre : (this.FormBopp.value.Nombre).toUpperCase(),
        BoppGen_Ancho : this.FormBopp.value.Ancho,
        BoppGen_Micra : this.FormBopp.value.Micras,
        BoppGen_FechaIngreso : moment().format('YYYY-MM-DD'),
        BoppGen_Hora : moment().format('H:mm:ss'),
      }
      this.boppGenericoService.srvGuardar(info).subscribe(() => {
        this.mensajeService.mensajeConfirmacion(`¡Creación Exitosa!`, '¡El rollo ha sido creado con éxito!');
        setTimeout(() => { this.EntradaBOPP.cargarBoppsGenericos(); }, 500);
        setTimeout(() => { this.limpiarCampos(); }, 500);
      }, () => this.mensajeService.mensajeError(`Error`, `No fue posible crear el rollo, verifique!`));
    } else this.mensajeService.mensajeAdvertencia(`Advertencia`, 'Debe llenar los campos vacios!')
  }
}
