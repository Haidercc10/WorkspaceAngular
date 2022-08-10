import { Component, Inject, OnInit } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { RolesService } from './Servicios/roles.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit{
  title = 'ProyectoPlasticaribe';
  validar : number = 0;
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente

  constructor (@Inject(SESSION_STORAGE) private storage: WebStorageService,
                private rolService : RolesService,) { }

  ngOnInit(): void {
    this.inactividad();
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

  //Funcio para verificar la inactividad de un usuario, cuando pasa mas de 30 minutos sin actividad se cierra la sesion
  inactividad(){
    let t : any;
    window.onload = reiniciarTiempo;
    // Eventos del DOM
    document.onmousemove = reiniciarTiempo;
    document.onkeypress = reiniciarTiempo;
    document.onload = reiniciarTiempo;
    document.onmousemove = reiniciarTiempo;
    document.onmousedown = reiniciarTiempo; // aplica para una pantalla touch
    document.ontouchstart = reiniciarTiempo;
    document.onclick = reiniciarTiempo;     // aplica para un clic del touchpad
    document.onscroll = reiniciarTiempo;    // navegando con flechas del teclado
    document.onkeypress = reiniciarTiempo;

    function tiempoExcedido() {
      window.location.href = "./";
    }

    function reiniciarTiempo() {
      let estadoConexion : boolean = window.navigator.onLine;
      if (window.location.pathname != '/' && !estadoConexion) window.location.href = "./";
      clearTimeout(t);
      t = setTimeout(tiempoExcedido, 1800000);
      // 1 minuto son 60000 millisegundos
      // 30 minutos son 1800000 milisegundos
    }
  }
}
