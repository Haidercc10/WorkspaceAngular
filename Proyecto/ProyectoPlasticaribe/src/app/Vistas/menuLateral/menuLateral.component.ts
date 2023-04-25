import { Component, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDrawerMode } from '@angular/material/sidenav';
import { CookieService } from 'ngx-cookie-service';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { RolesService } from 'src/app/Servicios/Roles/roles.service';
import { AuthenticationService } from 'src/app/_Services/authentication.service';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-menuLateral',
  templateUrl: './menuLateral.component.html',
  styleUrls: ['./menuLateral.component.css']
})
export class MenuLateralComponent implements OnInit {
  display : boolean = false;
  items: MenuItem[];
  mode = new FormControl('over' as MatDrawerMode);

  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  mostrarMenu : boolean = false; //Variable que se utilizará para mostrar el menú
  position: string = '';
  subir : boolean = true;
  subir1 : boolean = true;
  subir2 : boolean = true;
  subir3 : boolean = true;
  subir4 : boolean = true;
  subir5 : boolean = true;
  subir6 : boolean = true;
  subir7 : boolean = true;
  subir7_1 : boolean = true;
  subir8 : boolean = true;
  subir8_1 : boolean = true;
  subir9 : boolean = true;
  subir10: boolean= true;
  subir11: boolean = true;
  subir12 : boolean = true;
  subir13 : boolean = true;
  subir14 : boolean = true;
  subir15 : boolean = true;
  subir16 : boolean = true;

  constructor(private AppComponent : AppComponent,
                private rolService : RolesService,
                  private confirmationService: ConfirmationService,
                    private messageService: MessageService,
                      private authenticationService: AuthenticationService,
                        private cookieService: CookieService,) { }

  ngOnInit() {
    this.lecturaStorage();
  }

  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    let rol = this.AppComponent.storage_Rol;
    this.rolService.srvObtenerLista().subscribe(datos_roles => {
      for (let index = 0; index < datos_roles.length; index++) {
        if (datos_roles[index].rolUsu_Id == parseInt(this.AppComponent.storage_Rol)) {
          this.ValidarRol = rol;
          this.storage_Rol = datos_roles[index].rolUsu_Nombre;
        }
      }
    });
  }

  aumentarLetra() {
    let fontSize : number = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--font-size'));
    if (fontSize < 1.51626) document.documentElement.style.setProperty('--font-size', `${fontSize * 1.1}`);
    this.cookieService.set('TamanoLetra', `${parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--font-size'))}`, { expires: 365, sameSite: 'Lax' });
  }

  disminuirLetra(){
    let fontSize : number = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--font-size'));
    if (fontSize > 0.81) document.documentElement.style.setProperty('--font-size', `${fontSize * 0.9}`);
    this.cookieService.set('TamanoLetra', `${parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--font-size'))}`, { expires: 365, sameSite: 'Lax' });
  }

  showConfirm() {
    this.confirmationService.confirm({
      message: '¿Seguro que desea salir?',
      header: 'Cerrar Sesión',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Si',
      rejectLabel: 'No',
      accept: () => {
        this.authenticationService.logout();
        this.messageService.add({severity:'info', summary:'Confirmed', detail:'You have accepted'});
      },
    });
  }

  confirm1() {
    this.messageService.clear();
    this.messageService.add({key: 'c', sticky: true, severity:'warn', summary:'¿Seguro que desea salir?'});
  }

  onConfirm() {
    this.authenticationService.logout();
  }

  onReject() {
    this.messageService.clear('c');
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

  clickIcon7_1(){
    if (this.subir7_1) this.subir7_1 = false;
    else this.subir7_1 = true;
  }

  clickIcon8(){
    if (this.subir8) this.subir8 = false;
    else this.subir8 = true;
  }

  clickIcon8_1(){
    if (this.subir8_1) this.subir8_1 = false;
    else this.subir8_1 = true;
  }

  clickIcon9(){
    if (this.subir9) this.subir9 = false;
    else this.subir9 = true;
  }

  clickIcon10(){
    if (this.subir10) this.subir10 = false;
    else this.subir10 = true;
  }

  clickIcon11(){
    if (this.subir11) this.subir11 = false;
    else this.subir11 = true;
  }

  clickIcon12(){
    if (this.subir12) this.subir12 = false;
    else this.subir12 = true;
  }

  clickIcon13(){
    if (this.subir13) this.subir13 = false;
    else this.subir13 = true;
  }

  clickIcon14(){
    if (this.subir14) this.subir14 = false;
    else this.subir14 = true;
  }

  clickIcon15(){
    if (this.subir15) this.subir15 = false;
    else this.subir15 = true;
  }

  clickIcon16(){
    if (this.subir16) this.subir16 = false;
    else this.subir16 = true;
  }
}
