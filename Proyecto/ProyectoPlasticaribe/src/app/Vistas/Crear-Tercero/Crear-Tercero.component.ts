import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { modelTercero } from 'src/app/Modelo/modelTercero';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { TercerosService } from 'src/app/Servicios/Terceros/Terceros.service';
import { TipoIdentificacionService } from 'src/app/Servicios/TipoIdentificacion/tipo-identificacion.service';

@Component({
  selector: 'app-Crear-Tercero',
  templateUrl: './Crear-Tercero.component.html',
  styleUrls: ['./Crear-Tercero.component.css']
})

export class CrearTerceroComponent implements OnInit {

  FormCrearTercero !: FormGroup;
  tipoIdentificacion = [];

  constructor(private formBuilder : FormBuilder,
                private terceroService : TercerosService,
                  private tipoIdentificacionService : TipoIdentificacionService,
                    private mensajeService: MensajesAplicacionService) {

    //Creación formulario crear proveedor en modal.
    this.FormCrearTercero = this.formBuilder.group({
      Id: ['', Validators.required],
      Nombre: ['', Validators.required],
      TipoId: ['', Validators.required],
      Ciudad: [''],
      Telefono: [''],
      Email: [''],
    });
  }

   //Todo lo que se carga al iniciar la página.
  ngOnInit(): void {
    this.tipoIdntificacion();
  }

  tipoIdntificacion() {
    this.tipoIdentificacionService.srvObtenerLista().subscribe(datos_tipoIdentificacion => {
      for(let index = 0; index < datos_tipoIdentificacion.length; index++){
        this.tipoIdentificacion.push(datos_tipoIdentificacion[index].tipoIdentificacion_Id);
      }
    });
  }

  validarCamposVacios = () => this.FormCrearTercero.valid ? this.registro() : this.mensajeService.mensajeAdvertencia('Advertencia', '¡Hay campos vacios!');

  LimpiarCampos = () => this.FormCrearTercero.reset();

  registro(){
    let info : modelTercero = {
      Tercero_Id : this.FormCrearTercero.value.Id,
      TipoIdentificacion_Id : this.FormCrearTercero.value.TipoId,
      Tercero_Nombre : this.FormCrearTercero.value.Nombre,
      Tercero_Ciudad : this.FormCrearTercero.value.Ciudad,
      Tercero_Telefono : this.FormCrearTercero.value.Telefono,
      Tercero_Email : this.FormCrearTercero.value.Email,
      Tercero_Fecha : moment().format('YYYY-MM-DD'),
      Tercero_Hora : moment().format('H:mm:ss'),
    }

    this.terceroService.insert(info).subscribe(datos => {
      this.mensajeService.mensajeConfirmacion('¡Registro Exitoso!', 'El tercero ha sido creado');
      this.LimpiarCampos();
    });
  }
}
