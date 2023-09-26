import { Component, OnInit, ViewChild } from '@angular/core';
import moment from 'moment';
import { Table } from 'primeng/table';
import { AppComponent } from 'src/app/app.component';
import { Inventario_AreasService } from 'src/app/Servicios/Inventario_Areas/Inventario_Areas.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';

@Component({
  selector: 'app-Reporte_InventarioAreas',
  templateUrl: './Reporte_InventarioAreas.component.html',
  styleUrls: ['./Reporte_InventarioAreas.component.css']
})
export class Reporte_InventarioAreasComponent implements OnInit {
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
 
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  hora : any = moment().format('H:mm:ss'); //Variable que se usará para llenar la hora actual 
  load : boolean = false;
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  rangoFechas : any = []; //Variable que guardará el rango de fechas seleccionado por el usuario
  inventario : any = []; //Variable que guardará el inventario de las areas
  invExtrusion : any = []; //Variable que guardará el inventario de las extrusiones
  invRotograbado : any = []; //Variable que guardará el inventario de las rotograbado
  invSellado : any = []; //Variable que guardará el inventario de las sellado
  invImpresion : any = []; //Variable que guardará el inventario de las impresion
  invMateriales : any = []; //Variable que guardará el inventario de los materiales
  totalExtrusion : number = 0; //Variable que guardará el inventario de las extrusiones
  totalRotograbado : number = 0; //Variable que guardará el inventario de las rotograbado
  totalSellado : number = 0; //Variable que guardará el inventario de las sellado
  totalImpresion : number = 0; //Variable que guardará el inventario de las impresion
  totalMateriales : number = 0; //Variable que guardará el inventario de los materiales
  @ViewChild('dt1') dt1: Table | undefined;

  constructor(private AppComponent : AppComponent, 
              private svcInvAreas : Inventario_AreasService,
                private msj : MensajesAplicacionService) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
   }

  ngOnInit() {
    this.consultarInventario();
    this.calcularTotalExtrusion
  }

  verTutorial(){}

  consultarInventario(){
    this.svcInvAreas.GetPorFecha(`2023-09-01`, `2023-09-15`).subscribe(data => {
      if(data.length > 0) {
        data.forEach(x => {
          this.inventario.push(x);
          if(x.id_Area == `EXT` && x.esMaterial == false) this.invExtrusion.push(x);
          if(x.id_Area == `EXT` && x.esMaterial == true) this.invMateriales.push(x);
          if(x.id_Area == `ROT`) this.invRotograbado.push(x);
          if(x.id_Area == `SELLA`) this.invSellado.push(x);
          if(x.id_Area == `IMP`) this.invImpresion.push(x);
        });
      } else this.msj.mensajeAdvertencia(`¡Advertencia!`, `¡No se encontró información de inventarios en las fechas consultadas!`);
    });
  }

  calcularTotalExtrusion () {this.invExtrusion.reduce((acum, valor) => acum + valor.subtotal); } 

  aplicarfiltro1 = ($event, campo : any, valorCampo : string) => this.dt1!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);
}
