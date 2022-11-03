import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { RolesService } from 'src/app/Servicios/roles.service';

@Component({
  selector: 'app-AsignacionRollos_Extrusion',
  templateUrl: './AsignacionRollos_Extrusion.component.html',
  styleUrls: ['./AsignacionRollos_Extrusion.component.css']
})
export class AsignacionRollos_ExtrusionComponent implements OnInit {

  public FormConsultarRollos !: FormGroup; //formulario para consultar y crear un ingreso de rollos
  cargando : boolean = true; //Variable para validar que salga o no la imagen de carga
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  hora : any = moment().format("H:mm:ss"); //Variable que almacenará la hora
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  grupoProductos : any [] = []; //Variable que guardará de manera descriminada a cada producto
  rollosSinIngresar : number = 0; // variable para calcular la cantidad de rollos que no se han ingresado
  rollosIngresados : number = 0; //variable para calcular la cantidad de rollos que se han ingresado
  rollos : any [] = []; //Variable que almacenará los difrentes rollos que se hicieron en la orden de trabajo
  rollosInsertar : any [] = []; //Variable que va a amacenar los diferentes rollos que se van a insertar
  validarRollo : any [] = []; //Variable para validará que el rollo no esté en la tabla
  first = 0;
  rows = 20;

  constructor(private frmBuilderPedExterno : FormBuilder,
                private rolService : RolesService,
                  @Inject(SESSION_STORAGE) private storage: WebStorageService,) {

    this.FormConsultarRollos = this.frmBuilderPedExterno.group({

      Observacion : [''],
    });
  }

  ngOnInit() {
    this.lecturaStorage();
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = '$1,';
    return number.toString().replace(exp,rep);
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.storage.get('Id');
    this.storage_Nombre = this.storage.get('Nombre');
    let rol = this.storage.get('Rol');
    this.rolService.srvObtenerLista().subscribe(datos_roles => {
      for (let index = 0; index < datos_roles.length; index++) {
        if (datos_roles[index].rolUsu_Id == rol) {
          this.ValidarRol = rol;
          this.storage_Rol = datos_roles[index].rolUsu_Nombre;
        }
      }
    });
  }

}
