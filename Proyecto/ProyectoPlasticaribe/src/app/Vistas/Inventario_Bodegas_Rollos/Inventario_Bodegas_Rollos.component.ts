import { Component, OnInit, ViewChild } from '@angular/core';
import moment from 'moment';
import { Table } from 'primeng/table';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-Inventario_Bodegas_Rollos',
  templateUrl: './Inventario_Bodegas_Rollos.component.html',
  styleUrls: ['./Inventario_Bodegas_Rollos.component.css']
})
export class Inventario_Bodegas_RollosComponent implements OnInit {

  cargando : boolean = false; //Variable para validar que salga o no la imagen de carga
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro

  @ViewChild('dtTotal') dtTotal: Table | undefined;
  @ViewChild('dtExtrusion') dtExtrusion: Table | undefined;
  @ViewChild('dtProductoIntemedio') dtProductoIntemedio: Table | undefined;
  @ViewChild('dtImpresion') dtImpresion: Table | undefined;
  @ViewChild('dtRotograbajo') dtRotograbajo: Table | undefined;
  @ViewChild('dtSellado') dtSellado: Table | undefined;
  @ViewChild('dtDespacho') dtDespacho: Table | undefined;
  inventarioTotal : any [] = []; //Variable que almacenará la información del inventario total de todas las bodegas
  inventarioExtrusion : any [] = []; //Variable que almacenará la información del inventario de la bodega de extrusion
  inventarioProductoIntermedio : any [] = []; //Variable que almacenará la información del inventario de la bodega de producto intermedio
  inventarioImpresion : any [] = []; //Variable que almacenará la información del inventario de la bodega de impresio
  inventarioRotograbado : any [] = []; //Variable que almacenará la información del inventario de la bodega de rotograbado
  inventarioSellado : any [] = []; //Variable que almacenará la información del inventario de la bodega de sellado
  inventarioDespacho : any [] = []; //Variable que almacenará la información del inventario de la bodega de despacho

  constructor(private AppComponent : AppComponent,
                private msj : MensajesAplicacionService) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
  }

  ngOnInit() {
  }

}
