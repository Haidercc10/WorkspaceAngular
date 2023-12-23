import { DOCUMENT } from '@angular/common';
import { Component, Inject, Injectable, OnInit } from '@angular/core';
import moment from 'moment';
import { CookieService } from 'ngx-cookie-service';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { PrimeNGConfig } from 'primeng/api';
import { EncriptacionService } from './Servicios/Encriptacion/Encriptacion.service';
import { User } from './_Models/user';
import { User_BagPro } from './_Models/user_BagPro';
import { user_Conta_Zeus } from './_Models/user_Conta_Zeus';
import { User_Inv_Zeus } from './_Models/user_Inv_Zeus';
import { AuthenticationService } from './_Services/authentication.service';
import { authentication_BagPro } from './_Services/authentication_BagPro.service';
import { authentication_ContaZeus } from './_Services/authentication_ContaZeus.service';
import { AuthenticationService_InvZeus } from './_Services/authentication_InvZeus.service';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

@Injectable({
  providedIn: 'root'
})

export class AppComponent implements OnInit{

  user?: User | null;
  user_InvZeus?: User_Inv_Zeus | null;
  user_ContaZeus?: user_Conta_Zeus | null;
  user_BagPro?: User_BagPro | null;
  title = 'ProyectoPlasticaribe';
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  rutaCarpetaArchivos : string = 'D:\\Calidad'; //Variable que va a almacenar la ruta principal en la que se almacenarán los archivos de la aplicacion
  tamanoLetra : number = 1;
  temaSeleccionado : boolean = false;

  constructor (@Inject(SESSION_STORAGE) private storage: WebStorageService,
                private authenticationService: AuthenticationService,
                  private authenticationInvZeusService : AuthenticationService_InvZeus,
                    private authenticationContaZeusService : authentication_ContaZeus,
                      private authenticationBagProService : authentication_BagPro,
                        private cookieService: CookieService,
                          private config: PrimeNGConfig,
                            private encriptacion : EncriptacionService,
                              @Inject(DOCUMENT) private document : Document,) {
                                
    this.authenticationService.user.subscribe(x => this.user = x);
    this.authenticationInvZeusService.user.subscribe(x => this.user_InvZeus = x);
    this.authenticationContaZeusService.user.subscribe(x => this.user_ContaZeus = x);
    this.authenticationBagProService.user.subscribe(x => this.user_BagPro = x);
    // this.inactividad();
    this.mostrar();
  }

  mostrar() {
    window.localStorage.setItem('theme', this.cookieService.get('theme'));
    let modo = window.localStorage.getItem("theme");
    if(modo) this.temaSeleccionado = modo == 'dark' ? true : false;
    this.cambiar(this.temaSeleccionado);
  }

  cambiar(estado : boolean) {
    let tema = estado ? 'dark' : 'light';
    window.localStorage.setItem("theme", tema);
    let linkTema = this.document.getElementById('app-theme') as HTMLLinkElement;
    linkTema.href = 'lara-' + tema + '-blue' + '.css'
  }

  ngOnInit(): void {
    moment.locale('es');
    this.lecturaStorage();
    this.config.setTranslation({
      accept: 'Aceptar',
      reject: 'Cancelar',
      monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
      dayNames: ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'],
      dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'],
      dayNamesMin: ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'],
      matchAll: 'Todo',
      matchAny: 'Cualquiera',
      startsWith: 'Empiece con',
      contains: 'Contiene',
      notContains: 'No Contiene',
      equals: 'Igual',
      notEquals: 'No Igual',
      endsWith: 'Termina con',
      apply: 'Aplicar',
      clear: 'Limpiar',
      addRule: 'Añadir Regla',
      removeRule: 'Quitar Regla',
      emptyFilterMessage: 'No hay resultados',
      emptyMessage: 'No hay resultados',
      today: 'Hoy',
      passwordPrompt: 'Ingrese la Contraseña',
      strong: 'Fuerte',
      medium: 'Medio',
      weak: 'Debil',
      noFilter: 'Sin Filtros',
      choose: 'Elegir',
      upload: 'Cargar',
      cancel: 'Cancelar'
    });
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    setInterval(() => {
      this.storage_Id = this.encriptacion.decrypt(this.storage.get('Id') == undefined ? '' : this.storage.get('Id'));
      this.storage_Nombre = this.encriptacion.decrypt(this.storage.get('Nombre') == undefined ? '' : this.storage.get('Nombre'));
      this.ValidarRol = parseInt(this.encriptacion.decrypt(this.storage.get('Rol') == undefined ? '' : this.storage.get('Rol')));
      this.storage_Rol = this.ValidarRol;
    }, 1000);
    let tamanoLetraCambiado = this.cookieService.get('tamanoLetraCambiado');
    if (tamanoLetraCambiado == '') this.cookieService.set('TamanoLetra', '0.90', { expires: 365, sameSite: 'Lax' });
    this.tamanoLetra = parseFloat(this.cookieService.get('TamanoLetra'));
    if (this.tamanoLetra.toString() == 'NaN') this.tamanoLetra = 0.90;
    let fontSize : number = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--font-size'));
    document.documentElement.style.setProperty('--font-size', `${fontSize * this.tamanoLetra}`);
    this.cookieService.set('tamanoLetraCambiado', 'true', { expires: 365, sameSite: 'Lax' });
  }

  //Funcion para verificar la inactividad de un usuario, cuando pasa mas de 30 minutos sin actividad se cierra la sesion
  inactividad(){
    let t : any;
    let treintaMinutos : number = 1800000; // 1 minuto son 60000 millisegundos, 30 minutos son 1800000 milisegundos
    window.onload = reiniciarTiempo;
    document.onmousemove = reiniciarTiempo;
    document.onkeypress = reiniciarTiempo;
    document.onload = reiniciarTiempo;
    document.onmousemove = reiniciarTiempo;
    document.onmousedown = reiniciarTiempo;
    document.ontouchstart = reiniciarTiempo;
    document.onclick = reiniciarTiempo;
    document.onscroll = reiniciarTiempo;
    document.onkeypress = reiniciarTiempo;

    const tiempoExcedido = () => {
      if (this.storage.get('Token')) this.authenticationService.logout();
      else {
        this.storage.clear();
        window.location.pathname = '/';
      }
    }

    function reiniciarTiempo() {
      let estadoConexion : boolean = window.navigator.onLine;
      if (window.location.pathname != '/' || !estadoConexion) tiempoExcedido;
      clearTimeout(t);
      t = setTimeout(tiempoExcedido, treintaMinutos);
    }
  }
}