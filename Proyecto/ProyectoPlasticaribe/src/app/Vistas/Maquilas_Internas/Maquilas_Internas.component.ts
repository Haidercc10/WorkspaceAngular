import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { AppComponent } from 'src/app/app.component';
import { ConosService } from 'src/app/Servicios/Conos/conos.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { ProcesosService } from 'src/app/Servicios/Procesos/procesos.service';
import { UsuarioService } from 'src/app/Servicios/Usuarios/usuario.service';

@Component({
  selector: 'app-Maquilas_Internas',
  templateUrl: './Maquilas_Internas.component.html',
  styleUrls: ['./Maquilas_Internas.component.css']
})
export class Maquilas_InternasComponent implements OnInit {

  load : boolean = false; //Variable para validar que salga o no la imagen de carga
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro

  form !: FormGroup; //formulario para consultar y crear un ingreso de rollos
  process : any [] = [];
  services : any [] = [];
  conos : any [] = [];
  operators : any [] = [];
  dataOrderProduction : any [] = [];

  constructor(
    private AppComponent : AppComponent,
    private msj : MensajesAplicacionService,
    private frmBuilder : FormBuilder,
    private svcProcess : ProcesosService,
    private svConos : ConosService,
    private svUsers : UsuarioService,
  ) { 
    this.initForm();
  }

  ngOnInit() {
    this.lecturaStorage();
    this.getConos();
    this.getOperators();
    this.getProcess();
    this.loadDate();
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number : any) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  getProcess() {
    this.svcProcess.srvObtenerLista().subscribe(data => { 
      this.process = data;
    }, error => { 
      this.msj.mensajeError(`Error`, `Error al consultar los procesos. | ${error.status} ${error.statusText}`); 
    });
  }

  initForm(){
    this.form = this.frmBuilder.group({
      process: [null, Validators.required],
      service: [null, Validators.required],
      ot: [null, Validators.required],
      machine: [null, Validators.required],
      operator: [null, Validators.required],
      broadCono: [null, Validators.required],
      weightTare: [null, Validators.required],
      weight: [null, Validators.required],
      netWeight: [null, Validators.required],
      date: [null, Validators.required],
      measureUnit: [null ],
      cono: [null, Validators.required],
      observation: [null ],
    });  
  }

  getConos() {
    this.svConos.GetConos().subscribe(data => {
      this.conos = data
      this.conos.sort((a, b) => b.cono_Id.localeCompare(a.cono_Id));
    });
  }

  getOperators() {
    this.svUsers.GetOperariosProduccion().subscribe(data => {
      this.operators = data;
      this.operators.sort((a, b) => a.usua_Nombre.localeCompare(b.usua_Nombre));
    });
  }

  //Función para cargar fechas en el campo. 
  loadDate(){
    this.form.patchValue({ 'date' : new Date(moment().format('YYYY-MM-DD')) });
  }

}
