import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { MessageService } from 'primeng/api';
import { modelTercero } from 'src/app/Modelo/modelTercero';
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
                    private messageService: MessageService) {

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

  validarCamposVacios() : any{
    if (this.FormCrearTercero.valid) this.registro();
    else this.messageService.add({key: 'Advertencia', severity:'warn', summary:'¡Hay campos vacios!'});
  }

  LimpiarCampos() {
    this.FormCrearTercero.reset();
  }

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
      this.messageService.add({severity:'success', detail: '¡Registro Exitoso!'});
      this.LimpiarCampos();
    }, error => {

    });
  }

  onReject() {
    this.messageService.clear('Advertencia');
  }

}
