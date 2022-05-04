import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { modelEps } from 'src/app/Modelo/modelEps';
import { EpsService } from 'src/app/Servicios/eps.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app.fpension.component',
  templateUrl: './fpension.component.html',
  styleUrls: ['./fpension.component.css']
})
export class FpensionComponent implements OnInit {

  public formularioFpension !: FormGroup;

  constructor(private EpsService : EpsService, private frmBuilderFpension : FormBuilder) { 
    this.formularioFpension = this.frmBuilderFpension.group({
      Codigo: ['',],
      Identificacion: [, Validators.required],
      Nombre: [, Validators.required],
      Email: [, Validators.required],
      Telefono: [, Validators.required],
      CuentaBancaria: [, Validators.required],
      Ciudad: [, Validators.required]
    });
  }


  ngOnInit(): void {
  }

  // VALIDACION PARA CAMPOS VACIOS
  validarCamposVacios() : any{
    if(this.formularioFpension.valid){
      Swal.fire("Los datos se enviaron correctamente");
      this.clear();
      this.agregar();
    }else{
      Swal.fire("HAY CAMPOS VACIOS");
    }
  }

  clear() {
    this.formularioFpension.reset();
  }

  agregar(){
    const campoCajaCompensacion : modelEps = {
      eps_Codigo: this.formularioFpension.get('Codigo')?.value,
      eps_Id : this.formularioFpension.get('Identificacion')?.value,
      eps_Nombre: this.formularioFpension.get('Nombre')?.value,
      eps_Email: this.formularioFpension.get('Email')?.value,
      eps_Telefono: this.formularioFpension.get('Telefono')?.value,
      eps_CuentaBancaria: this.formularioFpension.get('CuentaBancaria')?.value,
      eps_Direccion: this.formularioFpension.get('Direccion')?.value,
      eps_Ciudad: this.formularioFpension.get('Ciudad')?.value
    }

    this.EpsService.srvGuardar(campoCajaCompensacion).subscribe(data=>{
      console.log(data);
      Swal.fire('Registro exitoso');
      this.clear();
    }, error =>{
        Swal.fire('Ocurrió un error');
        console.log(error);
    });
  }

}
