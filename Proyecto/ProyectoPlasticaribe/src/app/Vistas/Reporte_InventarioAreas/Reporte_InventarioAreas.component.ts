import { Component, OnInit, ViewChild } from '@angular/core';
import moment from 'moment';
import { Table } from 'primeng/table';
import { AppComponent } from 'src/app/app.component';
import { Inventario_AreasService } from 'src/app/Servicios/Inventario_Areas/Inventario_Areas.service';
import { MateriaPrimaService } from 'src/app/Servicios/MateriaPrima/materiaPrima.service';
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
  invMatPrimas : any = []; //Variable que guardará el inventario de las areas.
  invReciclados : any = []; //Variable que guardará el inventario de las areas
  invExtrusion : any = []; //Variable que guardará el inventario de las extrusiones
  invRotograbado : any = []; //Variable que guardará el inventario de las rotograbado
  invSellado : any = []; //Variable que guardará el inventario de las sellado
  invImpresion : any = []; //Variable que guardará el inventario de las impresion
  invMateriales : any = []; //Variable que guardará el inventario de los materiales
  
  @ViewChild('dtExt') dtExt: Table | undefined; //Tabla que representa el inventario de extrusión
  @ViewChild('dtMat') dtMat: Table | undefined; //Tabla que representa el inventario de materiales en proceso
  @ViewChild('dtImp') dtImp: Table | undefined; //Tabla que representa el inventario de impresion
  @ViewChild('dtRot') dtRot: Table | undefined; //Tabla que representa el inventario de rotograbado
  @ViewChild('dtSella') dtSella: Table | undefined; //Tabla que representa el inventario de sellado
  @ViewChild('dtMatPrima') dtMatPrima: Table | undefined; //Tabla que representa el inventario de materias primas
  @ViewChild('dtReciclados') dtReciclados: Table | undefined; //Tabla que representa el inventario de reciclados


  constructor(private AppComponent : AppComponent, 
              private svcInvAreas : Inventario_AreasService,
                private msj : MensajesAplicacionService, 
                  private svcMatPrimas : MateriaPrimaService) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
   }

  ngOnInit() {
    this.consultarInventario();
    this.inventarioMateriasPrimas();
    setTimeout(() => {
      this.calcularTotalExtrusion();
      this.calcularTotalMateriales();
      this.calcularTotalImpresion();
      this.calcularTotalRotograbado();
      this.calcularTotalSellado();
      this.calcularTotalMatPrimas();
      this.calcularTotalReciclados();
    }, 2500);
    
  }

  verTutorial(){}

  //Función que consultará el inventario de todas las areas y lo mostrará en la tabla. 
  consultarInventario(){
    let fecha1 : any;
    let fecha2 : any;
    console.log(this.rangoFechas);

    this.svcInvAreas.GetPorFecha(`2023-09-01`, `2023-09-15`).subscribe(data => {
      if(data.length > 0) {
        data.forEach(x => {
          if(x.id_Area == `EXT` && x.esMaterial == false) this.invExtrusion.push(x);
          if(x.id_Area == `EXT` && x.esMaterial == true) this.invMateriales.push(x);
          if(x.id_Area == `ROT`) this.invRotograbado.push(x);
          if(x.id_Area == `SELLA`) this.invSellado.push(x);
          if(x.id_Area == `IMP`) this.invImpresion.push(x);
        });
      } else this.msj.mensajeAdvertencia(`¡Advertencia!`, `¡No se encontró información de inventarios en las fechas consultadas!`);
    });
  }

  //Función que mostrará el inventario de materias primas y reciclados en la tabla. 
  inventarioMateriasPrimas() {
    this.svcMatPrimas.srvObtenerLista().subscribe(data => {
      if(data.length > 0) {
        data.forEach(x => {
          let info : any = {
            'fecha_Inventario' : this.today,
            'ot' :  '',
            'item' : x.matPri_Id,
            'referencia' : x.matPri_Nombre,
            'stock' : x.matPri_Stock,
            'precio' : x.matPri_Precio, 
            'subtotal' : x.matPri_Stock * x.matPri_Precio,
          }
          x.catMP_Id == 10 ? this.invReciclados.push(info) : this.invMatPrimas.push(info);
        });
      } 
    });
  }

  //Funciones que calcularán el total de cada inventario.
  calcularTotalExtrusion = () => this.invExtrusion.reduce((acum, valor) => (acum + valor.subtotal), 0);

  calcularTotalRotograbado = () => this.invRotograbado.reduce((acum, valor) => (acum + valor.subtotal), 0);

  calcularTotalSellado = () => this.invSellado.reduce((acum, valor) => (acum + valor.subtotal), 0);

  calcularTotalImpresion = () => this.invImpresion.reduce((acum, valor) => (acum + valor.subtotal), 0);

  calcularTotalMateriales = () => this.invMateriales.reduce((acum, valor) => (acum + valor.subtotal), 0);

  calcularTotalMatPrimas = () => this.invMatPrimas.reduce((acum, valor) => (acum + valor.subtotal), 0);

  calcularTotalReciclados = () => this.invReciclados.reduce((acum, valor) => (acum + valor.subtotal), 0);

  //Funciones que permitiran realizar filtros en la tabla.
  aplicarfiltroExt = ($event, campo : any, valorCampo : string) => this.dtExt!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

  aplicarfiltroMat = ($event, campo : any, valorCampo : string) => this.dtMat!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

  aplicarfiltroImp = ($event, campo : any, valorCampo : string) => this.dtImp!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);
  
  aplicarfiltroRot = ($event, campo : any, valorCampo : string) => this.dtRot!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

  aplicarfiltroSella = ($event, campo : any, valorCampo : string) => this.dtSella!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

  aplicarfiltroMatPrima = ($event, campo : any, valorCampo : string) => this.dtMatPrima!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

  aplicarfiltroReciclado = ($event, campo : any, valorCampo : string) => this.dtReciclados!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);
}
