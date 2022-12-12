import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormControl} from '@angular/forms';
import { DesperdicioService } from 'src/app/Servicios/Desperdicio/desperdicio.service';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { RolesService } from 'src/app/Servicios/Roles/roles.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app.desperdicio.component',
  templateUrl: './desperdicio.component.html',
  styleUrls: ['./desperdicio.component.css']
})

export class DesperdicioComponent implements OnInit {

  public FormDesperdicio!: FormGroup;

  constructor( private DesperdicioService : DesperdicioService,
    private rolService : RolesService,
    @Inject(SESSION_STORAGE) private storage: WebStorageService,) { }



//  Vaiables
    storage_Id : number;
    storage_Nombre : any;
    storage_Rol : any;
    ValidarRol : number;


  ngOnInit(): void {
    this.lecturaStorage();

  }




  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(...args: []) {
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


 /* FUNCION PARA RELIZAR CONFIMACIÓN DE SALIDA */
 confimacionSalida(){
  Swal.fire({
    title: '¿Seguro que desea salir?',
    showDenyButton: true,
    showCancelButton: true,
    confirmButtonText: 'Salir',
    denyButtonText: `No Salir`,
  }).then((result) => {
    /* Read more about isConfirmed, isDenied below */
    if (result.isConfirmed) window.location.href = "./";
  })
}

  // VALIDACION PARA CAMPOS VACIOS
  validarCamposVacios() : any{
      if(this.FormDesperdicio.valid){
        Swal.fire("Los datos se enviaron correctamente");

        this.clear();


      }else{
        Swal.fire("HAY CAMPOS VACIOS");
      }
  }


  clear() {
    console.log("clear clicked")
    this.FormDesperdicio.reset();
  }

  //Funcion que limpia los campos de consulta
    limpiarCamposConsulta(){
      this.FormDesperdicio.reset();
    }

     // Funcion para validar los campos vacios de las consultas
  validarCamposVaciosConsulta(){



  }


  //Funcion encargada de buscar un producto por el id del producto
buscarProducto(){
   }


  // Funcion para llenar los datos de los productos en cada uno de los campos
 llenadoProducto(){

  }

    //Funcion que organiza los campos de la tabla de pedidos de menor a mayor
    organizacionPrecio(){

  }

    // Funcion que limpia los todos los campos de la vista
LimpiarCampos() {

    }


     // Funcion para actualizar
     actualizarMateriaP(){

}

}
