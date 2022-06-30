import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-asignacion-materia-prima',
  templateUrl: './asignacion-materia-prima.component.html',
  styleUrls: ['./asignacion-materia-prima.component.css']
})
export class AsignacionMateriaPrimaComponent implements OnInit {

  public FormMateriaPrimaRetiro !: FormGroup;
  public FormMateriaPrimaRetirada !: FormGroup;

  constructor(private frmBuilderMateriaPrimaRetiro : FormBuilder,
              private frmBuilderMateriaPrimaRetirada : FormBuilder) {

    this.FormMateriaPrimaRetiro = this.frmBuilderMateriaPrimaRetiro.group({
      OTRetiro : new FormControl(),
      FechaRetiro : new FormControl(),
      UsuarioRetiro : new FormControl(),
      AreaRetiro : new FormControl(),
      ProcesoRetiro : new FormControl(),
      EstadoRetiro : new FormControl(),
      ObservacionRetiro : new FormControl(),

    });

    this.FormMateriaPrimaRetirada = this.frmBuilderMateriaPrimaRetirada.group({
      MpIdRetirada : new FormControl(),
      MpNombreRetirada : new FormControl(),
      MpStockRetirada : new FormControl(),
      MpCantidadRetirada : new FormControl(),
      MpUnidadMedidaRetirada : new FormControl(),
      MpPrecioRetirada : new FormControl(),
    });
   }


  ngOnInit(): void {
  }

  InicializarFormularios(){


      this.FormMateriaPrimaRetiro = this.frmBuilderMateriaPrimaRetiro.group({
        OTRetiro : [, Validators.required],
        FechaRetiro : [, Validators.required],
        UsuarioRetiro : [, Validators.required],
        AreaRetiro : [, Validators.required],
        ProcesoRetiro : [, Validators.required],
        EstadoRetiro : [, Validators.required],
        ObservacionRetiro : [, Validators.required],

      });

      this.FormMateriaPrimaRetirada = this.frmBuilderMateriaPrimaRetirada.group({
        MpIdRetirada : new FormControl(),
        MpNombreRetirada : new FormControl(),
        MpStockRetirada : new FormControl(),
        MpCantidadRetirada : new FormControl(),
        MpUnidadMedidaRetirada : new FormControl(),
        MpPrecioRetirada : new FormControl(),
      });
     }

  }

}
