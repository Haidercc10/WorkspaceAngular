import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BoppGenericoService } from 'src/app/Servicios/BoppGenerico.service';
import { CategoriaMateriaPrimaService } from 'src/app/Servicios/categoriaMateriaPrima.service';
import { UnidadMedidaService } from 'src/app/Servicios/unidad-medida.service';

@Component({
  selector: 'app-crear-bopp',
  templateUrl: './crear-bopp.component.html',
  styleUrls: ['./crear-bopp.component.css']
})
export class CrearBoppComponent implements OnInit {

  FormBopp : FormGroup;
  categorias : any [] = [];
  unidadMedida : any []= [];
  tintaCreada = false;
  informacion : string = '';

  constructor(private frmBuilder : FormBuilder,
                private boppGenericoService : BoppGenericoService,
                    private categoriasService : CategoriaMateriaPrimaService,) {

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
        if (datos_categorias[i].catMP_Id == 6
            || datos_categorias[i].catMP_Id == 14
            || datos_categorias[i].catMP_Id == 15) this.categorias.push(datos_categorias[i]);
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
      }
      this.boppGenericoService.srvGuardar(info).subscribe(datos_bopp => {
        this.tintaCreada = true;
        this.informacion = `¡El rollo ha sido creado con exito!`;
      }, error => {
        this.tintaCreada = true;
        this.informacion = `¡Fallo al crear la rollo! \n\n ${error.message}`;
      });
    }
  }
}
