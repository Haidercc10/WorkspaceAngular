import { Component, Inject, Injectable, OnInit, ViewChild } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { AuthenticationService } from './_Services/authentication.service';
import { User } from './_Models/user';
import { AuthenticationService_InvZeus } from './_Services/authentication_InvZeus.service';
import { authentication_ContaZeus } from './_Services/authentication_ContaZeus.service';
import { authentication_BagPro } from './_Services/authentication_BagPro.service';
import { User_Inv_Zeus } from './_Models/user_Inv_Zeus';
import { user_Conta_Zeus } from './_Models/user_Conta_Zeus';
import { User_BagPro } from './_Models/user_BagPro';
import { MovimientosAplicacionService } from './Servicios/Movimientos_Aplicacion/MovimientosAplicacion.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

@Injectable({ providedIn: 'root' })

export class AppComponent implements OnInit{

  user?: User | null;
  user_InvZeus?: User_Inv_Zeus | null;
  user_ContaZeus?: user_Conta_Zeus | null;
  user_BagPro?: User_BagPro | null;
  title = 'ProyectoPlasticaribe';
  validar : number = 0;
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  rutaCarpetaArchivos : string = 'D:\\Calidad\\'; //Variable que va a almacenar la ruta principal en la que se almacenarán los archivos de la aplicacion
  public data:any=[];

  constructor (@Inject(SESSION_STORAGE) private storage: WebStorageService,
                private authenticationService: AuthenticationService,
                  private authenticationInvZeusService : AuthenticationService_InvZeus,
                    private authenticationContaZeusService : authentication_ContaZeus,
                      private authenticationBagProService : authentication_BagPro,) {
    this.authenticationService.user.subscribe(x => this.user = x);
    this.authenticationInvZeusService.user.subscribe(x => this.user_InvZeus = x);
    this.authenticationContaZeusService.user.subscribe(x => this.user_ContaZeus = x);
    this.authenticationBagProService.user.subscribe(x => this.user_BagPro = x);
    this.inactividad();
  }

  ngOnInit(): void {
    this.lecturaStorage();
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.storage.get('Id');
    this.storage_Nombre = this.storage.get('Nombre');
  }

  //Funcio para verificar la inactividad de un usuario, cuando pasa mas de 30 minutos sin actividad se cierra la sesion
  inactividad(){
    window.onload = this.reiniciarTiempo();;
    // Eventos del DOM
    document.onmousemove = this.reiniciarTiempo();
    document.onkeypress = this.reiniciarTiempo();
    document.onload = this.reiniciarTiempo();
    document.onmousemove = this.reiniciarTiempo();
    document.onmousedown = this.reiniciarTiempo(); // aplica para una pantalla touch
    document.ontouchstart = this.reiniciarTiempo();
    document.onclick = this.reiniciarTiempo();     // aplica para un clic del touchpad
    document.onscroll = this.reiniciarTiempo();    // navegando con flechas del teclado
    document.onkeypress = this.reiniciarTiempo();
  }

  // Funcion uqe va a reiniciar el tiempo de espera de la aplicacion
  reiniciarTiempo() : any{
    let t : any;
    let estadoConexion : boolean = window.navigator.onLine;
    if (window.location.pathname != '/' && !estadoConexion) {
      localStorage.clear();
      window.location.pathname = '/';
    }
    clearTimeout(t);
    t = setTimeout(this.tiempoExcedido, 1800000);
    // 1 minuto son 60000 millisegundos
    // 30 minutos son 1800000 milisegundos
  }

  // Funcion que se va a ejecutar cuando se exceda el tiempo de espera
  tiempoExcedido(){
    localStorage.clear();
    window.location.pathname = '/';
  }

  saveInLocal(key, val): void {
    this.storage.set(key, val);
    this.data[key]= this.storage.get(key);
  }
}
