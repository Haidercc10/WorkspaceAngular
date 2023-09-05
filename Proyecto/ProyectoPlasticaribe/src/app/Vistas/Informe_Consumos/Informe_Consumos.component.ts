import { Component, OnInit, ViewChild } from '@angular/core';
import moment from 'moment';
import { Table } from 'primeng/table';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-Informe_Consumos',
  templateUrl: './Informe_Consumos.component.html',
  styleUrls: ['./Informe_Consumos.component.css']
})
export class Informe_ConsumosComponent implements OnInit {
  load : boolean = false; //Variable para controlar la carga de la pagina
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  rangoFechas : any = []; //Variable que se usará para almacenar el rango de fechas que se seleccionarán en el filtro
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  hora : any = moment().format('HH:mm:ss'); //Variable que se usará para llenar la hora actual

  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente

  consumos : any = []; //Variable que se usará para almacenar los datos de los consumos
  @ViewChild('dt') dt: Table | undefined; // Tabla que contendrá la información de la tabla inicialmente
  @ViewChild('dt2') dt2: Table | undefined; // Tabla que contendrá la información de la tabla inicialmente
  salidas : any = []; //Variable que se usará para almacenar los datos de los consumos

  constructor(private AppComponent : AppComponent) { }

  ngOnInit() {
    this.lecturaStorage();
  }

  cargarSalidas() {
    this.salidas = [];
    this.salidas.push({
      Id: 1,
      Id_Entrada: 312,
      Codigo_Entrada : 979,
      Tipo_Entrada : 'ENTBOPP', 
      Codigo_Salida : 1,
      Tipo_Salida : 'ASIGBOPP',
      Fecha_Registro : this.today, 
      Hora_Registro : this.hora, 
    });
  }

  //Funcion que se usará para mostrar el tutorial
  tutorial(){
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  //Función donde se consultarán los consumos por fecha
  consultar(){
    this.consumos = [];
    
    
  }

  //Funcion que se usará para aplicar los filtros de la tabla
  aplicarfiltro = ($event, campo : any, valorCampo : string) => this.dt!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

  mostrarDetalleConsumo(consumo : any){

  }
}
