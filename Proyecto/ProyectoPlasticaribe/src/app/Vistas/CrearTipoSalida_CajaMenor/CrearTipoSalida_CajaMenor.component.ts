import { Component, Injectable, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { modelTipoSalidas_CajaMenor } from 'src/app/Modelo/TipoSalidas_CajaMenor';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { TipoSalidas_CajaMenorService } from 'src/app/Servicios/TipoSalidas_CajaMenor/TipoSalidas_CajaMenor.service';
import { Costos_CajaMenorComponent } from '../Costos_CajaMenor/Costos_CajaMenor.component';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-CrearTipoSalida_CajaMenor',
  templateUrl: './CrearTipoSalida_CajaMenor.component.html',
  styleUrls: ['./CrearTipoSalida_CajaMenor.component.css']
})

export class CrearTipoSalida_CajaMenorComponent implements OnInit {

  formTipoSalida !: FormGroup;

  constructor(private frmBuilder : FormBuilder,
               private srvTiposGastos : TipoSalidas_CajaMenorService, 
                private msjs : MensajesAplicacionService, 
                  private CostosCajaMenor : Costos_CajaMenorComponent) {

    this.formTipoSalida = this.frmBuilder.group({
      nombre : [null],
      descripcion : [null] 
    });            
  }

  ngOnInit() {
  }

  //Función para limpiar campos del formulario
  limpiarCampos = () => this.formTipoSalida.reset();
  
  //Función para crear un tipo de gasto de caja menor
  crearTipoSalida(){
    if(this.formTipoSalida.valid) {
      let info : modelTipoSalidas_CajaMenor = {
        TpSal_Nombre : (this.formTipoSalida.value.nombre).toString().toUpperCase().trim(),
        TpSal_Descripcion : (this.formTipoSalida.value.descripcion).toString().toUpperCase().trim()
      }
      this.srvTiposGastos.Post(info).subscribe(() => {
        this.msjs.mensajeConfirmacion(`¡Confirmación!`, `¡El tipo de salida ha sido creado con éxito!`);
        this.CostosCajaMenor.cargarTiposCostos();
        this.limpiarCampos();
      }, () => this.msjs.mensajeError(`Error`, `Error al crear el tipo de salida de caja menor. Por favor, verifique!`));
    } else this.msjs.mensajeAdvertencia(`Advertencia`, `Por favor ingrese todos los datos`);
  } 
}
