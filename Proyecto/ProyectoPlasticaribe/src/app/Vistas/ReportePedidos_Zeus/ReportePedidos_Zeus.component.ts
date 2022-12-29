import { Component, Inject, Input, OnInit } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { InventarioZeusService } from 'src/app/Servicios/InventarioZeus/inventario-zeus.service';
import { RolesService } from 'src/app/Servicios/Roles/roles.service';

@Component({
  selector: 'app-ReportePedidos_Zeus',
  templateUrl: './ReportePedidos_Zeus.component.html',
  styleUrls: ['./ReportePedidos_Zeus.component.css']
})
export class ReportePedidos_ZeusComponent implements OnInit {

  cargando : boolean = false;
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente

  first = 0;
  rows = 10;
  ArrayDocumento = []; //Varibale que almacenará la información que se mostrará en la tabla de vista
  _columnasSeleccionada : any [] = [];
  columnas : any [] = [];

  constructor(@Inject(SESSION_STORAGE) private storage: WebStorageService,
                private rolService : RolesService,
                 private inventarioZeusService : InventarioZeusService,) {

  }

  ngOnInit() {
    this.lecturaStorage();
    this.consultarPedidos();
  }

  /**Leer storage para validar su rol y mostrar el usuario. */
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

  //
  consultarPedidos(){
    this.cargando = true;
    this.inventarioZeusService.GetPedidos().subscribe(datos_pedidos => {
      for (let i = 0; i < datos_pedidos.length; i++) {
        this.ArrayDocumento.push(datos_pedidos[i]);
        this.ArrayDocumento.sort((a,b) => Number(a.consecutivo) - Number(b.consecutivo));
      }
    });
    setTimeout(() => { this.cargando = false; }, 2000);
  }

  @Input() get columnasSeleccionada(): any[] {
    return this._columnasSeleccionada;
  }

  set columnasSeleccionada(val: any[]) {
    this._columnasSeleccionada = this.columnas.filter(col => val.includes(col));
  }

}
