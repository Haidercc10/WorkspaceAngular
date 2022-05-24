import { Component, Inject, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { RolesService } from 'src/app/Servicios/roles.service';

@Component({
  selector: 'app-navbar-lateral',
  templateUrl: './navbar-lateral.component.html',
  styleUrls: ['./navbar-lateral.component.css']
})
export class NavbarLateralComponent implements OnInit {

  storage_Id : any;
  storage_Nombre : any;
  storage_Rol : any;
  constructor(@Inject(SESSION_STORAGE) private storage: WebStorageService,
                private rolService : RolesService) { }

  ngOnInit(): void {
    this.lecturaStorage();
  }

  lecturaStorage(){
    this.storage_Id = this.storage.get('Id');
    this.storage_Nombre = this.storage.get('Nombre');
    let rol = this.storage.get('Rol');
    this.rolService.srvObtenerLista().subscribe(datos_roles => {
      for (let index = 0; index < datos_roles.length; index++) {
        if (datos_roles[index].rolUsu_Id == rol) {
          this.storage_Rol = datos_roles[index].rolUsu_Nombre;
        }        
      }      
    });
  }

}
