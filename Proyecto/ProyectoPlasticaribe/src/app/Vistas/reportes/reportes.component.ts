import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app.Reportes.component',
  templateUrl: './Reportes.component.html',
  styleUrls: ['./Reportes.component.css']
})
export class ReportesComponent implements OnInit {

  public formularioReportes !: FormGroup;



  constructor( private frmBuilderReportes: FormBuilder) {

    this.formularioReportes = this.frmBuilderReportes.group({

      Areas: [, Validators.required],
      TipoReportes: [, Validators.required],
      FechaHasta: [, Validators.required],
      Codigo: [, Validators.required],
      FechaDe: [, Validators.required],
    });




  }

  ngOnInit(): void { }

  clear() {
      this.formularioReportes.reset();

    }

  // VALIDACION PARA CAMPOS VACIOS Y ENVIO DE DATOS
  validarCamposVacios() : any{
      if(this.formularioReportes.valid){
        Swal.fire("Los datos se enviaron correctamente");
        this.clear();


      }else{
        Swal.fire("HAY CAMPOS VACIOS");
      }
  }



}

