import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { CategoriaMateriaPrimaService } from 'src/app/Servicios/categoriaMateriaPrima.service';
import { UnidadMedidaService } from 'src/app/Servicios/unidad-medida.service';

@Component({
  selector: 'app-asignacion-bopp',
  templateUrl: './asignacion-bopp.component.html',
  styleUrls: ['./asignacion-bopp.component.css']
})
export class AsignacionBOPPComponent implements OnInit {

  public FormAsignacionBopp !: FormGroup;
  public FormularioBOPP !: FormGroup;
  public comboUnidadMedida = []; /** Combobox unidad de medida */
  public comboCategoriasMatPri = []; /** Combobox Categorias materia prima */
  public comboBOPP = []; /** Combobox BOPP */

  constructor(private FormBuilderAsignacion : FormBuilder,
    private FormBuilderBOPP : FormBuilder,
    private servicioCategorias : CategoriaMateriaPrimaService,
    private servicioUnidadMedida : UnidadMedidaService) {

      this.FormAsignacionBopp = this.FormBuilderAsignacion.group({
        AsgBopp_OT : new FormControl(),
        AsgBopp_Fecha : new FormControl(),
        AsgBopp_Observacion: new FormControl(),
        AsgBopp_Estado: new FormControl(),
      });

      this.FormularioBOPP = this.FormBuilderBOPP.group({
        boppId : new FormControl(),
        boppNombre : new FormControl(),
        boppSerial: new FormControl(),
        boppStock: new FormControl(),
        boppCantidadEnt : new FormControl(),
      });
     }

  ngOnInit(): void {
  }

  validarCamposBOPP(){

  }

  limpiarCamposBOPP(){

   }

   asignarBOPP(){

   }

   limpiarTodosLosCampos(){
    this.FormAsignacionBopp.reset();
    this.FormularioBOPP.reset();
   }

   confimacionSalida(){

   }


}
