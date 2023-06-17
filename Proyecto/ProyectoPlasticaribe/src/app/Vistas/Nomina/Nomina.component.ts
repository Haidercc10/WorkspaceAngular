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
  @ViewChild('dtNomSellado') dtNomSellado: Table | undefined;
  @ViewChild('dtNomCorte') dtNomCorte: Table | undefined;
  @ViewChild('dtNomProduccion') dtNomProduccion: Table | undefined;
  @ViewChild('dtNomAdministrativo') dtNomAdministrativo: Table | undefined;
  @ViewChild('dt') dt: Table | undefined;
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  load: boolean = true; //Variable que validará cuando vaya a salir la animacion de carga
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  rangoFechas : any [] = []; /** Array que almacenará el rango de fechas */
  arraySellado : any = []; /** Array que cargará la información de la nomina de los operarios de sellado */
  totalNominaSellado : number = 0; /** Variable que contendrá el valor total de la nomina de sellado */
  modalSellado : boolean = false; /** Variable que contendrá el valor total de la nomina de sellado */
  operario : any = ''; /** Variable que cargará el ID y nombre del operario en cualquiera de los modales. */
  detallesNomina : any [] = []; //Variable que almacenará la información detallada de los rollos pesados o ingresados de un producto y persona en especifico


  constructor(private AppComponent : AppComponent,
                private servicioBagPro : BagproService) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
   }

  ngOnInit() {
    this.lecturaStorage();
    this.consultarNominas();
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

  /** Función para consultar las nomina de sellado */
  consultarNominas(){
    this.totalNominaSellado = 0;
    this.arraySellado = [];
    let cedulas : any = [];
    let fechaInicial : any = this.rangoFechas.length > 0 ? moment(this.rangoFechas[0]).format('YYYY-MM-DD') : this.today;
    let fechaFinal : any = this.rangoFechas.length > 0 ? moment(this.rangoFechas[1]).format('YYYY-MM-DD') : fechaInicial;

    this.servicioBagPro.GetNominaSelladoAcumuladaItem('2023-06-01', '2023-06-10').subscribe(data => {
      for(let index = 0; index < data.length; index++) {
        let info : any = JSON.parse(`{${data[index].replaceAll("'", '"')}}`);

        if(!cedulas.includes(info.Cedula)) {
          info.Cedula = info.Cedula,
          info.Operario = info.Operario,
          info.Cargo = 'Operario Sellado',
          info.PagoTotal = 0
          info.detalle = [];

          cedulas.push(info.Cedula);
          this.arraySellado.push(info);
          this.arraySellado.sort((a,b) => Number(a.Cedula) - Number(b.Cedula));
        }
      }
    });
    setTimeout(() => { this.cargarTabla2(); }, 1500);
  }

  /** Función para cargar la tabla de Nómina detallada */
  cargarTabla2(){
    let array : any = [];

    this.servicioBagPro.GetNominaSelladoAcumuladaItem('2023-06-01', '2023-06-10').subscribe(data => {
      for(let index = 0; index < data.length; index++) {
        let info : any = JSON.parse(`{${data[index].replaceAll("'", '"')}}`);
        info.Cedula = info.Cedula,
        info.Operario = info.Operario,
        info.Cargo = 'Operario Sellado',
        info.PagoTotal = parseFloat(info.PagoTotal),
        info.Cantidad = parseFloat(info.Cantidad),
        info.CantidadTotal = parseFloat(info.CantidadTotal),
        info.PrecioDia = parseFloat(info.PrecioDia),
        info.PrecioNoche = parseFloat(info.PrecioNoche),
        info.detalle = [];

        array = this.arraySellado.findIndex(item => item.Cedula == info.Cedula);
        console.log(array)
        if(array >= 0) this.arraySellado[array].detalle.push(info);
      }
    });
  }

  cargarValorADevengar(){

  }

  /** Funcion para filtrar busquedas y mostrar datos segun el filtro consultado. */
  aplicarfiltro($event, campo : any, valorCampo : string){
    this.dtNomSellado!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);
  }

  /** Cargará el modal de sellado al momento de seleccionar un operario en la columna ver detalle de la tabla */
  cargarModalSellado(item : any, persona : string){
    //this.load = true;
    this.modalSellado = true;
    this.detallesNomina = [];
    let fechaInicial : any = this.rangoFechas.length > 0 ? moment(this.rangoFechas[0]).format('YYYY-MM-DD') : this.today;
    let fechaFinal : any = this.rangoFechas.length > 0 ? moment(this.rangoFechas[1]).format('YYYY-MM-DD') : fechaInicial;

    this.servicioBagPro.GetNominaSelladoDetalladaItemPersona('2023-06-01', '2023-06-10', item, persona).subscribe(data => {
      for (let i = 0; i < data.length; i++) {
        let info : any = JSON.parse(`{${data[i].replaceAll("'", '"')}}`);
        info.Fecha = info.Fecha.replace('12:00:00 a. m. ', '');
        info.Cantidad = parseFloat(info.Cantidad.toString().replace(',', '.')),
        info.Peso = parseFloat(info.Peso.toString().replace(',', '.')),
        info.Precio = parseFloat(info.Precio.toString().replace(',', '.'));
        info.Valor_Total = parseFloat(info.Valor_Total.toString().replace(',', '.'));
        info.Pesado_Entre = parseFloat(info.Pesado_Entre.toString().replace(',', '.'));
        info.Cantidad_Total = parseFloat(info.Cantidad_Total.toString().replace(',', '.'));
        this.detallesNomina.push(info);
      }
    });
    //setTimeout(() => this.load = false, 2000);
  }

  /** Filtrar la tabla detallada del modal de sellado */
  aplicarfiltro2 = ($event, campo : any, valorCampo : string) => this.dt!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);
}
