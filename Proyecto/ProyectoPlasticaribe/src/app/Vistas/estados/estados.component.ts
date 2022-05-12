import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { modelEstado } from 'src/app/Modelo/modelEstado';
import { modelTipoEstado } from 'src/app/Modelo/modelTipoEstado';

import { EstadosService } from 'src/app/Servicios/estados.service';
import { SrvEstadosService } from 'src/app/Servicios/srv-estados.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-estados',
  templateUrl: './estados.component.html',
  styleUrls: ['./estados.component.css']
})
export class EstadosComponent implements OnInit {

  formEstados !: FormGroup;
  ComboTiposEstados : modelTipoEstado[] =[] ;

  constructor(private frmBuildEstados : FormBuilder, private estadosServicio : SrvEstadosService, private servicioEstado : EstadosService) {

    this.formEstados = this.frmBuildEstados.group({
      EstadoNombre : new FormControl(),
      EstadoDescripcion : new FormControl(),
      tipoEstado : new FormControl(),
    });

  }

  ngOnInit(): void {
    this.ObtenerListaEstados();
    this.ObtenerListaTiposEstados();
  }

  initForms() {
    this.formEstados = this.frmBuildEstados.group({
      EstadoNombre : [, Validators.required],
      EstadoDescripcion : [, Validators.required],
      tipoEstado : [, Validators.required],
    });
  }

  validarCamposVacios(){
    if(this.formEstados.valid) {
      Swal.fire('Todo OK');
      console.log(this.formEstados)
    } else {
      Swal.fire('Campos vacios deben ser llenados');
      console.log(this.formEstados)
    }
  }

  limpiarCampos(){
    this.formEstados.reset();
  }

  guardarEstados(){
    const camposEstados : modelEstado = {
      Estado_Nombre : this.formEstados.get('EstadoNombre')?.value,
      Estado_Descripcion : this.formEstados.get('EstadoDescripcion')?.value,
      TpEstado_Id : this.formEstados.get('tipoEstado')?.value
    }

    this.estadosServicio.srvGuardarEstados(camposEstados).subscribe(datosEstados=>{
      Swal.fire('¡Estado creado con exito!');
    }, error => {
      console.log(error);
    })

  }

  cargarComboboxTiposEstados() {

  }


  ObtenerListaEstados(){
    this.servicioEstado.srvObtenerListaEstados().subscribe(datosEstados=>{
      //Swal.fire('¡Estado creado con exito!');
      console.log(datosEstados[0])
    }, error => {
      console.log(error);
    })
  }

  ObtenerListaTiposEstados(){
    this.estadosServicio.srvObtenerTiposEstados().subscribe(datosTiposEstados=>{
      //Swal.fire('¡Estado creado con exito!');

      for (let index = 0; index < datosTiposEstados.length; index++) {

        this.ComboTiposEstados.push(datosTiposEstados[index].tpEstado_Nombre);

        /*if(this.formEstados.value.tipoEstado == datosTiposEstados[index].tpEstado_Nombre  ) {
          console.log('El ID de este tipo de estado es ' + datosTiposEstados[index].tpEstado_Id);

        } else {
          console.log('Hubo un error');
          console.log( datosTiposEstados[index].tpEstado_Id)
          console.log( datosTiposEstados[index].tpEstado_Nombre)
          console.log( this.formEstados.value.tipoEstado)
        }*/
      }

    }, error => {
      console.log(error);
    })
  }


}
