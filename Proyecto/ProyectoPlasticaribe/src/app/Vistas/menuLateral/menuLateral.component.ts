import { Component, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDrawerMode } from '@angular/material/sidenav';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { RolesService } from 'src/app/Servicios/roles.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-menuLateral',
  templateUrl: './menuLateral.component.html',
  styleUrls: ['./menuLateral.component.css']
})
export class MenuLateralComponent implements OnInit {

  mode = new FormControl('over' as MatDrawerMode);

  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  subir : boolean = true;
  subir1 : boolean = true;
  subir2 : boolean = true;
  subir3 : boolean = true;
  subir4 : boolean = true;
  subir5 : boolean = true;
  subir6 : boolean = true;
  subir7 : boolean = true;

  constructor(@Inject(SESSION_STORAGE) private storage: WebStorageService,
                private rolService : RolesService) { }

  ngOnInit() {
    this.lecturaStorage();
  }

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

  // Funcion que hacer que aparezca un icono u otro
  clickIcon1(){
    if (this.subir1) this.subir1 = false;
    else this.subir1 = true;
  }

  clickIcon2(){
    if (this.subir2) this.subir2 = false;
    else this.subir2 = true;
  }

  clickIcon3(){
    if (this.subir3) this.subir3 = false;
    else this.subir3 = true;
  }

  clickIcon4(){
    if (this.subir4) this.subir4 = false;
    else this.subir4 = true;
  }

  clickIcon5(){
    if (this.subir5) this.subir5 = false;
    else this.subir5 = true;
  }

  clickIcon6(){
    if (this.subir6) this.subir6 = false;
    else this.subir6 = true;
  }

  clickIcon7(){
    if (this.subir7) this.subir7 = false;
    else this.subir7 = true;
  }


}
