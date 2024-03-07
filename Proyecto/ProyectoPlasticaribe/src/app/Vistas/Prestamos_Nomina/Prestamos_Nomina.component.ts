import { Component, Injectable, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { MessageService } from 'primeng/api';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { Prestamos_NominaService } from 'src/app/Servicios/Prestamos_Nomina/Prestamos_Nomina.service';
import { UsuarioService } from 'src/app/Servicios/Usuarios/usuario.service';
import { AppComponent } from 'src/app/app.component';
import { FormEditarPrestamosComponent } from '../FormEditarPrestamos/FormEditarPrestamos.component';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-Prestamos_Nomina',
  templateUrl: './Prestamos_Nomina.component.html',
  styleUrls: ['./Prestamos_Nomina.component.css']
})
export class Prestamos_NominaComponent implements OnInit {

  @ViewChild(FormEditarPrestamosComponent) cmFormEditLoans : FormEditarPrestamosComponent;
  load : boolean = false;
  modeSelected: boolean;
  employees : any = [];
  form !: FormGroup;
  loans : any = [];
  storage_Id : number;
  storage_Nombre : any;
  rol : number;
  visible : boolean = false;
  moments : any = ["SEMANAL", "QUINCENAL", "MENSUAL"];
  dataLoanTable : any = null;
  

  constructor(private AppComponent : AppComponent,
    private frmBuild : FormBuilder,
    private svEmployees : UsuarioService, 
    private msj : MensajesAplicacionService,
    private svLoans : Prestamos_NominaService, 
    private svMessages : MessageService,
    ) {
      this.loadModeAndForm();
  }

  ngOnInit() {
    this.lecturaStorage();
    this.visible = true;
  }

  //
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.rol = this.AppComponent.storage_Rol;
  }  

  //Cargar modo seleccionado y formulario.
  loadModeAndForm(){
    this.modeSelected = this.AppComponent.temaSeleccionado;
    this.form = this.frmBuild.group({
      id : [null, Validators.required],
      name : [null, Validators.required],
      valueLoan : [null, Validators.required], //Prestamo
      valueFee : [null, Validators.required], //Cuota
      qtyFees : [null], //Cuotas
      lapseFees : [null, Validators.required], //Lapso cuota 
      dateTerm : [null, Validators.required], //Fecha plazo
      initialDate : [new Date(), Validators.required], //Fecha inicio
      observation : [null], 
    });

    this.form.get('qtyFees')?.disable();
  }

  //Funcion para habilitar el campo cantidad de cuotas
  enableFieldQtyFees(){
    return [0, null, undefined, ''].includes(this.form.value.valueLoan) ? this.form.get('qtyFees')?.disable() : this.form.get('qtyFees')?.enable();
  }

  //Función para limpiar campos.
  clearFields(){
    this.form.reset();
    this.loans = [];
    this.employees = [];
    this.load = false;
    this.form.get('qtyFees')?.disable();
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
        this.msj.mensajeAdvertencia(`Advertencia`, `El empleado ${this.form.value.name} tiene ${data.length} prestamo(s) asignados`);
      } else {
        this.load = false;
        this.msj.mensajeConfirmacion(`Confirmación`, `El empleado ${this.form.value.name} no tiene prestamo(s) asignados`);
      } 
    }, error => { 
      this.msj.mensajeError(`Error al consultar la información de prestamos`, `Error: ${error.status}`); 
      this.load = false;  
    }); 
  }

  //.Función para cargar los empleados según el campo de búsqueda.
  getEmployee(searchFor : string){
    let field : any = this.form.get(searchFor)?.value;
    
    if(field.toString().length > 1) {
      this.svEmployees.getEmployees(field).subscribe(data => { 
        if(data.length > 0) {
          this.employees = data;
          if(searchFor == 'id') this.selectEmployee('id'); 
        } else this.msj.mensajeAdvertencia(`Advertencia`, `No se encontró un empleado con la cédula ${this.form.value.id}`);
      }, error => { 
        if(searchFor == 'id') this.msj.mensajeError(`Error al consultar el empleado.`, `Error: ${error.status}`); 
      });
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

  //Calcular total prestamos asignados.
  calculateTotalLoan = () => this.loans.reduce((a, b) => a + b.loans.ptm_Valor, 0);

  //Calcular total cancelado.
  calculateTotalCanceled = () => this.loans.reduce((a, b) => a + b.loans.ptm_ValorCancelado, 0);

  //Calcular total adeudado.
  calculateTotalDebt = () => this.loans.reduce((a, b) => a + b.loans.ptm_ValorDeuda, 0);

  //Calcular porcentaje de cuota.
  calculatePercentageFee = (valueLoan : any, valueFee : any) => (valueFee / valueLoan) * 100;
  
  //Función para validar la asignación del prestamo
  validateLoan(){
    if(this.form.valid) {
      if(this.form.value.valueLoan > this.form.value.valueFee) {
        if(this.form.value.valueFee > 0) {
          if(moment(this.form.value.dateTerm).format('YYYY-MM-DD') >= moment().format('YYYY-MM-DD')) {
            if(this.loans.length > 0) {
              let msg : any = `El empleado ${this.form.value.name} ya tiene un prestamo por monto de $${this.calculateTotalDebt().toLocaleString()} pesos, ¿Está seguro que desea continuar?`
              this.svMessages.add({ severity: 'warn', key: 'validation', summary: 'Advertencia', detail: msg, sticky: true, });
            } else this.saveLoan();
          } else this.msj.mensajeAdvertencia(`Advertencia`, `La fecha de plazo no puede ser menor a la fecha actual`);
        } else this.msj.mensajeAdvertencia(`Advertencia`, `El valor de la cuota debe ser mayor a 0`);
      } else this.msj.mensajeAdvertencia(`Advertencia`, `El valor del prestamo no puede ser menor al valor de la cuota`);
    } else this.msj.mensajeAdvertencia(`Advertencia`, `Por favor, complete todos los campos requeridos`);
  }

  //Cerrar mensaje de confirmación.
  closeMsgWarning = (key) => this.svMessages.clear(key);

  //Función para guardar prestamos
  saveLoan(){
    this.closeMsgWarning('validation');
    this.load = true;
    let loanUser : loan = null;
    let observation : any =  !this.form.value.observation ? '' : this.form.value.observation;
    
    loanUser = {
      'Ptm_Id' : 0,
      'Usua_Id' : this.form.value.id,
      'Ptm_Valor' : this.form.value.valueLoan,
      'Ptm_ValorDeuda' : this.form.value.valueLoan,
      'Ptm_ValorCancelado' : 0,
      'Ptm_ValorCuota' : this.form.value.valueFee,
      'Ptm_PctjeCuota' : this.calculatePercentageFee(this.form.value.valueLoan, this.form.value.valueFee),
      'Estado_Id' : 11,
      'Ptm_FechaPlazo' : moment(this.form.value.dateTerm).format('YYYY-MM-DD'),
      'Ptm_FechaUltCuota' : moment().format('YYYY-MM-DD'),
      'Ptm_Observacion' : observation,
      'Creador_Id' : this.storage_Id,
      'Ptm_Fecha' : moment(this.form.value.initialDate).format('YYYY-MM-DD'),
      'Ptm_FechaRegistro' : moment().format('YYYY-MM-DD'),
      'Ptm_HoraRegistro' : moment().format('HH:mm:ss'),
      'Ptm_NroCuotas' : this.form.value.qtyFees,
      'Ptm_LapsoCuotas' : this.form.value.lapseFees,
    };

    this.svLoans.Post(loanUser).subscribe(data => { this.confirmMessage(); }, error => {
      this.msj.mensajeError(`Error al guardar el prestamo`, `Error: ${error.status}`);
      this.load = false;
    });
  }

  confirmMessage(){
    this.msj.mensajeConfirmacion(`Confirmación`, `Prestamo asignado exitosamente!`);
    this.clearFields();
  }

  calculateValueFee() {
    let initialFee : number = 0; 

    if(this.form.value.qtyFees) initialFee = this.form.value.valueLoan / this.form.value.qtyFees;
    else initialFee = 0;
    this.form.patchValue({ 'valueFee' : initialFee });
  }  

  confirmCancelationLoan(data : any){
    this.dataLoanTable = data;
    let msg : any = `¿Está seguro que desea anular el prestamo N° ${data.loans.ptm_Id} con deuda de $${data.loans.ptm_ValorDeuda.toLocaleString()} pesos?`
    this.svMessages.add({ severity: 'warn', key: 'cancelation', summary: 'Advertencia', detail: msg, sticky: true, });
  } 

  //Función para colocar como anulado el estado del prestamo.
  cancelLoan(loan : any){
    this.load = true;
    this.closeMsgWarning('cancelation');
    this.svLoans.putLoanAnulled(loan.ptm_Id).subscribe(data => {
      this.msj.mensajeConfirmacion(`Confirmación`, `Prestamo N° ${loan.ptm_Id} anulado exitosamente!`);
      this.load = false;
      setTimeout(() => { this.searchLoans(); }, 1000); 
    }, error => {
      this.msj.mensajeError(`Error al cancelar el prestamo`, `Error: ${error.status}`);
      this.load = false;
    });
  }

  calculateEstimatedDate(){
    let res = new Date();
    let qtyDays : number = 0;
    this.form.value.times == 'SEMANAL' ? qtyDays = 7 : this.form.value.times == 'QUINCENAL' ? qtyDays = 15 : this.form.value.times == 'MENSUAL' ? qtyDays = 30 : qtyDays = 0;
    res.setDate(res.getDate() + qtyDays);
    this.form.patchValue({ 'dateTerm' : res});
  }
 
  loadModalInfoLoan(data : any) {
    this.visible = true;
    this.dataLoanTable = data;
  } 

  updateLoan(){}

  exportToExcel(){}
}

export interface loan {
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
  Ptm_FechaRegistro : any;
  Ptm_HoraRegistro : string;
  Ptm_LapsoCuotas : string;
  Ptm_NroCuotas : number;
}
