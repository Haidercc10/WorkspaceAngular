import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import moment from 'moment';
import { Table } from 'primeng/table';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-Nomina',
  templateUrl: './Nomina.component.html',
  styleUrls: ['./Nomina.component.css']
})
export class NominaComponent implements OnInit {

  FormEdicionMateriaPrima !: FormGroup;
  @ViewChild('dtNomSellado') dt: Table | undefined;
  @ViewChild('dtNomCorte') dtNomCorte: Table | undefined;
  @ViewChild('dtNomProduccion') dtNomProduccion: Table | undefined;
  @ViewChild('dtNomAdministrativo') dtNomAdministrativo: Table | undefined;
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  load: boolean = true; //Variable que validará cuando vaya a salir la animacion de carga
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  rangoFechas : any [] = []; /** Array que almacenará el rango de fechas */
  arraySellado : any = []; /** Array que cargará la información de la nomina de los operarios de sellado */
  arrayCorte : any = []; /** Array que cargará la información de la nomina de los operarios de corte */
  arrayProduccion : any = []; /** Array que cargará la información de la nomina de los operarios */
  arrayAdministrativo : any = []; /** Array que cargará la información de la nomina de los administrativos */
  totalNominaSellado : number = 0; /** Variable que contendrá el valor total de la nomina de sellado */
  totalNominaCorte : number = 0; /** Variable que contendrá el valor total de la nomina de corte */
  totalNominaProduccion : number = 0; /** Variable que contendrá el valor total de la nomina de produccion */
  totalNominaAdmin : number = 0; /** Variable que contendrá el valor total de la nomina de admininstrativos */
  modalSellado : boolean = false; /** Variable que contendrá el valor total de la nomina de sellado */
  modalProduccion : boolean = false; /** Variable que contendrá el valor total de la nomina de produccion */
  modalCorte : boolean = false; /** Variable que contendrá el valor total de la nomina de corte */
  operario : any = ''; /** Variable que cargará el ID y nombre del operario en cualquiera de los modales. */

  constructor(private AppComponent : AppComponent,
                private servicioBagPro : BagproService) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
   }

  ngOnInit() {
    this.lecturaStorage();
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = '$1,';
    return number.toString().replace(exp,rep);
  }

 //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  /** Función que mostrará un tutorial en la app. */
  verTutorial() {
  }

  /** Exportar documento a excel. */
  exportarExcel(numero : number) {
  }

  /** Función para consultar las nominas de forma categorizada por grupos */
  consultarNominas(){
    this.totalNominaSellado = 0;
    this.totalNominaCorte = 0;
    this.totalNominaProduccion = 0;
    this.totalNominaAdmin = 0;
    this.arraySellado = [];
    this.arrayCorte = [];
    this.arrayProduccion = [];
    this.arrayAdministrativo = [];
    let fecha : any = this.rangoFechas.length > 0 ? moment(this.rangoFechas[0]).format('YYYY-MM-DD') : this.today;
    let fechaFinal : any = this.rangoFechas.length > 0 ? moment(this.rangoFechas[1]).format('YYYY-MM-DD') : fecha;

    this.servicioBagPro.getNominaSellado(fecha, fechaFinal).subscribe(data => {
      for(let index = 0; index < data.length; index++) {
        this.cargarTabla(data[index]);
      }
    });
  }

  /** Función para cargar las tablas de Nóminas */
  cargarTabla(datos : any){
    this.totalNominaSellado += datos.Valor;
    let info : any = {
      Cedula:  datos.Cedula,
      Nombre: datos.Operario,
      Cargo: 'Operario Sellado',
      Valor: datos.Valor,
    }
    this.arraySellado.push(info);
  }

  /** Funcion para filtrar busquedas y mostrar datos segun el filtro consultado. */
  aplicarfiltro($event, campo : any, valorCampo : string){
    this.dt!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);
  }

  /** Cargará el modal de sellado al momento de seleccionar un usuario en la columna ver detalle de la tabla */
  cargarModalSellado = () => this.modalSellado = true;

   /** Cargará el modal de corte al momento de seleccionar un usuario en la columna ver detalle de la tabla  */
  cargarModalCorte = () => this.modalCorte = true;

   /** Cargará el modal de produccion al momento de seleccionar un usuario en la columna ver detalle de la tabla */
  cargarModalProduccion = () => this.modalProduccion = true;
}
