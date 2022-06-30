import { Component, OnInit,Inject } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormControl} from '@angular/forms';
import Swal from 'sweetalert2';
import { MpremisionService  } from 'src/app/Servicios/mpremision.service';
import { RolesService } from 'src/app/Servicios/roles.service';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';



@Component({
  selector: 'app-mpremision',
  templateUrl: './mpremision.component.html',
  styleUrls: ['./mpremision.component.css']
})
export class MpremisionComponent implements OnInit {

   public FormMateriaPrimaRemision !:FormGroup; //Formulario de registro de Remisión



   idMpRemision=[];
   nombreMpRemision=[];
   cantidadMpRemision=[];
   UnidadMedida=[];
   ObservacionMpremision= [];
   estado=[];
   tipodocumento=[];

  /* Variables */
  today : any = new Date(); //Variable que se usará para llenar la fecha actual
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente


  constructor( private mpremisionService: MpremisionService,
                  private rolService : RolesService,
                    @Inject(SESSION_STORAGE) private storage: WebStorageService,
    
    ) { }

  ngOnInit(): void {
    this.lecturaStorage();
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

    // Fecha actual
    fecha(){
      this.today = new Date();
      var dd : any = this.today.getDate();
      var mm : any = this.today.getMonth() + 1;
      var yyyy : any = this.today.getFullYear();
      if (dd < 10) dd = '0' + dd;
      if (mm < 10) mm = '0' + mm;
      this.today = yyyy + '-' + mm + '-' + dd;

    }

 
//  Agregar Remisión a la tabla 
  registrarMPremison(){

   }


   // Funcion que limpia los todos los campos de la vista
   limpiarCamposMpremision() {
    this.FormMateriaPrimaRemision.reset();
  
  }

  llenarProveedorSeleccionado(){

  }

  llenarProvedorId(){

  }

  buscarMpSeleccionada(){

  }

  confimacionSalida(){

  }
}
