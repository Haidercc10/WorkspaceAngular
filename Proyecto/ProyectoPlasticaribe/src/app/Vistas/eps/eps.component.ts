import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { modelEps } from 'src/app/Modelo/modelEps';
import { EpsService } from 'src/app/Servicios/EPS/eps.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app.eps.component',
  templateUrl: './eps.component.html',
  styleUrls: ['./eps.component.css']
})
export class EpsComponent implements OnInit {

  public formularioEps !: FormGroup;
  constructor(private EpsService : EpsService, private frmBuilderEps : FormBuilder) { }


  ngOnInit(): void {
    this.initForms();
  }

  initForms() {
    this.formularioEps = this.frmBuilderEps.group({
      Identificacion: [, Validators.required],
      Nombre: [, Validators.required],
      Direccion: [, Validators.required],
      Telefono: [, Validators.required],
      CuentaBancaria: [, Validators.required],
      Email: [, Validators.required],
      Ciudad: [, Validators.required],
    });
  }

  // VALIDACION PARA CAMPOS VACIOS
  validarCamposVacios() : any{
    if(this.formularioEps.valid){
      Swal.fire("Los datos se enviaron correctamente");
      this.clear();
      this.agregar();
    }else{
      Swal.fire("HAY CAMPOS VACIOS");
    }
  }

  clear() {
    this.formularioEps.reset();
  }

  agregar(){
    const campoCajaCompensacion : modelEps= {
      eps_Codigo: 0,
      eps_Id: this.formularioEps.get('Identificacion')?.value,
      eps_Nombre: this.formularioEps.get('Nombre')?.value,
      eps_Email: this.formularioEps.get('Email')?.value,
      eps_Telefono: this.formularioEps.get('Telefono')?.value,
      eps_CuentaBancaria: this.formularioEps.get('CuentaBancaria')?.value,
      eps_Direccion: this.formularioEps.get('Direccion')?.value,
      eps_Ciudad: this.formularioEps.get('Ciudad')?.value,
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
