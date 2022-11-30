import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { RolesService } from 'src/app/Servicios/roles.service';
import { ServicioAreasService } from 'src/app/Servicios/servicio-areas.service';

@Component({
  selector: 'app-registro-component',
  templateUrl: './registro-component.component.html',
  styleUrls: ['./registro-component.component.css']
})
export class RegistroComponentComponent implements OnInit {

  public FormUsuarios !: FormGroup;

  constructor(private formBuilder : FormBuilder,
    private servicioRoles : RolesService,
    private servicioAreas : ServicioAreasService) {

      this.inicializarFormulario();

    }

  inicializarFormulario(){
    this.FormUsuarios = this.formBuilder.group({
      usuId:  null,
      usuNombre: null,
      usuTipo: null,
      usuArea: null,
      usuRol: null,
      usuCorreo: null,
      usuPassword: null,
      UsuEPS: null,
      usuFondoP: null,
      usuCajaComp: null,
    });
  }

  ngOnInit() {

  }





}
