import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { NominaDetallada_Plasticaribe } from 'src/app/Servicios/NominaDetallada_Plasticaribe/NominaDetallada_Plasticaribe.service';
import { Prestamos_NominaService } from 'src/app/Servicios/Prestamos_Nomina/Prestamos_Nomina.service';
import { UsuarioService } from 'src/app/Servicios/Usuarios/usuario.service';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-Prestamos_Nomina',
  templateUrl: './Prestamos_Nomina.component.html',
  styleUrls: ['./Prestamos_Nomina.component.css']
})
export class Prestamos_NominaComponent implements OnInit {
  load : boolean = false;
  modeSelected: boolean;
  employees : Array<loan> = [];
  form !: FormGroup;
  loans : any = [];

  constructor(private AppComponent : AppComponent,
    private frmBuild : FormBuilder,
    private svEmployees : UsuarioService, 
    private msj : MensajesAplicacionService,
    private svLoans : Prestamos_NominaService) {
      this.loadModeAndForm();
    }

  ngOnInit() {
  }

  //Cargar modo seleccionado y formulario.
  loadModeAndForm(){
    this.modeSelected = this.AppComponent.temaSeleccionado;
    this.form = this.frmBuild.group({
      id : [null, Validators.required],
      name : [null, Validators.required],
      valueLoan : [null, Validators.required], //Prestamo
      valueFee : [null, Validators.required], //Cuota
      dateTerm : [null, Validators.required], //Fecha plazo
      observation : [null], 
    });
  }

  //Función para limpiar campos.
  clearFields(){
    this.form.reset();
    this.loans = [];
  }

  //Función para buscar prestamos por usuario.
  searchLoans(){
    this.loans = [];
    this.load = true;
    let cardId : any = this.form.value.id;
    
    this.svLoans.GetLoansForCardId(cardId).subscribe(data => {
      if(data.length > 0 ) {
        this.loans = data;
        this.load = false;  
        this.msj.mensajeAdvertencia(`Se encontraron ${data.length} prestamos del empleado ${this.form.value.name}`, `Información: `);
      }
    }, error => { 
      this.msj.mensajeError(`No se encontró el empleado consultado`, `Error: ${error.status}`); 
      this.load = false;  
    }); 
  }

  //.Función para cargar los empleados según el campo de búsqueda.
  getEmployee(searchFor : string){
    let field : any = this.form.get(searchFor)?.value;
    
    if(field.toString().length > 1) {
      this.svEmployees.getEmployees(field).subscribe(data => { 
        this.employees = data;
        if(searchFor == 'id') this.selectEmployee('id'); 
      }, error => { if(searchFor == 'id') this.msj.mensajeError(`No se encontró el empleado consultado`, `Error: ${error.status}`); });
    }
  }

  //.Función para seleccionar un empleado de la lista de empleados.
  selectEmployee(searchFor : any){
    let test : any = this.employees.filter((item) => [item.usua_Nombre, item.usua_Id].includes(this.form.get(searchFor)?.value));
    this.form.patchValue({ 'id' : test[0].usua_Id, 'name' : test[0].usua_Nombre, });
    this.searchLoans();
  }

  //Función para calcular la diferencia de días entre la fecha de plazo y la fecha actual.
  calculateDiffDias(loans : any){
    let days : number = 0; 
    let fecha = moment([moment().year(), moment().month(), moment().date()]); 
    let fechaPlazo = moment([moment(loans.ptm_FechaPlazo).year(), moment(loans.ptm_FechaPlazo).month(), moment(loans.ptm_FechaPlazo).date()]); 
   
    days = fechaPlazo.diff(fecha, 'days'); 
    return days;
  }

  exportToExcel(){}
}

export interface loan {
  usua_Id: any;
  usua_Nombre: any;
  Ptm_Id? : number;
  Usua_Id : number;
  Ptm_Valor : number;
  Ptm_ValorDeuda : number;
  Ptm_ValorCancelado : number;
  Ptm_ValorCuota : number;
  Ptm_PctjeCuota : number;
  Estado_Id : number;
  Ptm_FechaPlazo : any;
  Ptm_FechaUltCuota : any;
  Ptm_Observacion : string;
  Creador_Id : number;
  Ptm_Fecha : any;
  Ptm_Hora : string;
}
