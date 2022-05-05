import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { modelCajacompensacion } from 'src/app/Modelo/modelCajacompensacion';
import { CajacompensacionService } from 'src/app/Servicios/cajacompensacion.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app.cajacompensacion.component',
  templateUrl: './cajacompensacion.component.html',
  styleUrls: ['./cajacompensacion.component.css']
})
export class CajacompensacionComponent implements OnInit {

  public formularioCajacompensacion !: FormGroup;


  constructor(private cajComService : CajacompensacionService, private frmBuilderCajacompensacion : FormBuilder) {
    this.formularioCajacompensacion = this.frmBuilderCajacompensacion.group({
      Codigo: ['',],
      Identificacion: [, Validators.required],
      Nombre: [, Validators.required],
      Email: [, Validators.required],
      Telefono: [, Validators.required],
      CuentaBancaria: [, Validators.required],
      Ciudad: [, Validators.required]
    });
   }

  ngOnInit(): void { }

  // VALIDACION PARA CAMPOS VACIOS
  validarCamposVacios() : any{
    if(this.formularioCajacompensacion.valid){
      Swal.fire("Los datos se enviaron correctamente");
      this.clear();
      this.agregar();
    }else{
      Swal.fire("HAY CAMPOS VACIOS");
    }
  }

  clear() {
    this.formularioCajacompensacion.reset();
  }

  agregar(){
    const campoCajaCompensacion : modelCajacompensacion = {
      cajComp_Codigo: this.formularioCajacompensacion.get('Codigo')?.value,
      cajComp_Id : this.formularioCajacompensacion.get('Identificacion')?.value,
      cajComp_Nombre: this.formularioCajacompensacion.get('Nombre')?.value,
      cajComp_Email: this.formularioCajacompensacion.get('Email')?.value,
      cajComp_Telefono: this.formularioCajacompensacion.get('Telefono')?.value,
      cajComp_CuentaBancaria: this.formularioCajacompensacion.get('CuentaBancaria')?.value,
      cajComp_Direccion: this.formularioCajacompensacion.get('Direccion')?.value,
      cajComp_Ciudad: this.formularioCajacompensacion.get('Ciudad')?.value
    }

    this.cajComService.srvGuardar(campoCajaCompensacion).subscribe(data=>{
      console.log(data);
      Swal.fire('Registro exitoso');
      this.clear();
    }, error =>{
        Swal.fire('Ocurrió un error');
        console.log(error);
    });
  }


}
