import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import moment from 'moment';
import { Table } from 'primeng/table';
import { AreaService } from 'src/app/Servicios/Areas/area.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { NominaDetallada_PlasticaribeService } from 'src/app/Servicios/Nomina_Detallada/NominaDetallada_Plasticaribe.service';
import { ProcesosService } from 'src/app/Servicios/Procesos/procesos.service';
import { UsuarioService } from 'src/app/Servicios/Usuarios/usuario.service';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-Reporte_Nomina',
  templateUrl: './Reporte_Nomina.component.html',
  styleUrls: ['./Reporte_Nomina.component.css']
})
export class Reporte_NominaComponent implements OnInit {
  form !: FormGroup;
  modeSelected : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  validateRol : number; //Variable que se usará en la vista para validar el tipo de rol
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  load: boolean = false; //Variable que validará cuando vaya a salir la animacion de carga
  dataReport : any = []; //Variable que se usará para almacenar los datos del reporte
  areas : any = []; //Variable que se usará para almacenar las areas de trabajo
  employees : any = []; //Variable que se usará para almacenar los empleados 
  @ViewChild('dt') dt: Table | undefined;


  constructor(
    private AppComponent : AppComponent,
    private msj : MensajesAplicacionService,
    private frmBuilder : FormBuilder,
    private svAreas : AreaService, 
    private svEmployees : UsuarioService,
    private svPayRoll : NominaDetallada_PlasticaribeService
  ) { 
    this.loadModeAndForm();
  }

  ngOnInit() {
    this.loadAreas();
    this.loadTest();
  }

  viewTutorial(){}

  //Cargar modo del programa y formulario
  loadModeAndForm(){
    this.modeSelected = this.AppComponent.temaSeleccionado;
    this.form = this.frmBuilder.group({
      dates : [null],
      id : [null],
      name : [null],
      areas : [null],
    });
  }

  //.Función que cargará la información de los procesos/areas
  loadAreas() {
    this.svAreas.srvObtenerLista().subscribe(data => { this.areas = data.filter(x => [1,3,4,6,7,8,9,10,11,12,19,20,21,22,25,28,29,30,31,32].includes(x.area_Id)); }, () => this.msj.mensajeError(`Error al cargar las áreas`)); 
  } 

  
  //.Función que limpiará los campos del formulario y los datos del reporte
  clearFields(){
    this.form.reset();
    this.dataReport = [];
  }

  //.Función que cargará el reporte de nomina.
  searchPayRoll(){
    let fmt : string = 'YYYY-MM-DD';
    let dates : any = this.form.value.dates;
    let date1 : any = dates == null ? this.today : moment(this.form.value.dates[0]).format(fmt);
    let date2 : any = ['Fecha inválida', null, undefined, ''].includes(dates == null ? dates : dates[1]) ? this.today : moment(this.form.value.dates[1]).format(fmt);
  
    this.svPayRoll.getPayroll(date1, date2, this.urlAPI()).subscribe(data => { this.dataReport = data; }, error => {
      this.msj.mensajeError(`Error al cargar el reporte`, `Status: ${error.status} | Message: ${console.error()}`);
    });
  }

  loadTest(){
    this.dataReport.push({
      'IdEmployee' : 1234567890,
      'CardEmployee' : 1234567890,
      'Employee' : 'PRUEBA PRUEBA PRUEBA PRUEBA',
      'Rol' : 1,
      'Ocupation' : 'OPERARIO SELLADO',
      'IdArea' : 1,
      'Area' : 'SELLADO',
      'Days_Labor' : 8,
      'Value_Inability' : 0,
      'Value_HoursExtras' : 0,
      'Value_AuxTransport' : 0,
      'Remuneration' : 100000,
      'Eps' : 13000,
      'Afp' : 13000,
      'Saving' : 20000,
      'Loan' : 5000,
      'Advance' : 50000,
    });
  }

  //Función para completar la ruta del endpoint del API
  urlAPI(){
    let id : any = this.form.value.id;
    let name : any = this.form.value.name;
    let area : any = this.form.value.areas;
    let route : any = ``;

    if(id != null) route.length > 0 ? route += `&id=${id}` : route += `id=${id}`;
    if(name != null) route.length > 0 ? route += `&name=${name}` : route += `name=${name}`;
    if(area != null) route.length > 0 ? route += `&area=${area}` : route += `area=${area}`;
    route = route.length > 0 ? `?${route}` : ``;

    return route;
  }

  //.Función para cargar los empleados según el campo de búsqueda.
  getEmployee(searchFor : string){
    let field : any = this.form.get(searchFor)?.value;
    if(field.toString().length > 1) {
      this.svEmployees.getEmployees(field).subscribe(data => { 
        this.employees = data;
        if(searchFor == 'id') this.selectEmployee('id'); 
      }, error => { if(searchFor == 'id') this.msj.mensajeError(`No se encontró el empleado\r\n Error: ${error.status}`); });
    }
  }

  //.Función para seleccionar un empleado de la lista de empleados.
  selectEmployee(searchFor : any){
    let test : any = this.employees.filter((item) => [item.usua_Nombre, item.usua_Id].includes(this.form.get(searchFor)?.value));
    this.form.patchValue({ 'id' : test[0].usua_Id, 'name' : test[0].usua_Nombre, });
  }

  //Función para filtrar la tabla de empleados.
  applyFilter = ($event, campo : any, valorCampo : string) => this.dt!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

  //Función para calcular el total de la nomina.
  calculateTotal(){}
  
}

export interface payRoll {

}
