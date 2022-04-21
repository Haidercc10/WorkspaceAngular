import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-registro-component',
  templateUrl: './registro-component.component.html',
  styleUrls: ['./registro-component.component.css']
})
export class RegistroComponentComponent implements OnInit {

  form: FormGroup;



  constructor(private frmBuilder: FormBuilder) {
    this.form = this.frmBuilder.group({
      usuId:['', [Validators.required, Validators.maxLength(10), Validators.minLength(6)]],
      usuNombre:['', Validators.required],
      usuTipo:['', Validators.required],
      usuArea:['', Validators.required],
      usuRol:['',  Validators.required],
      usuCorreo:['', Validators.required],
      usuContrasena:['', Validators.required],
      usuEps:['', Validators.required],
      usuFondoP:['', Validators.required],
      usuCajaComp:['', Validators.required],
    })
  }

  ngOnInit(): void {
  }

  mostrarFormulario(){
    //console.log(this.form);

    const datosUsuario: any = {
      usuId: this.form.get('usuId')?.value,
      usuNombre: this.form.get('usuNombre')?.value,
      usuTipo: this.form.get('usuTipo')?.value,
      usuArea: this.form.get('usuArea')?.value,
      usuRol: this.form.get('usuRol')?.value,
      usuCorreo: this.form.get('usuCorreo')?.value,
      usuContrasena: this.form.get('usuContrasena')?.value,
      usuFondoP: this.form.get('usuFondoP')?.value,
      usuCajaComp: this.form.get('usuCajaComp')?.value
    }
    alert('Usuario registrado');
  }
}
