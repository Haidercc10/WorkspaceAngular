import { Component, Injectable, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { EstadosService } from 'src/app/Servicios/Estados/estados.service';
import { AppComponent } from 'src/app/app.component';
import { Prestamos_NominaComponent, loan } from '../Prestamos_Nomina/Prestamos_Nomina.component';
import { Prestamos_NominaService } from 'src/app/Servicios/Prestamos_Nomina/Prestamos_Nomina.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { MessageService } from 'primeng/api';
import { CreacionPdfService } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-FormEditarPrestamos',
  templateUrl: './FormEditarPrestamos.component.html',
  styleUrls: ['./FormEditarPrestamos.component.css']
})
export class FormEditarPrestamosComponent implements OnInit {
  
  modeSelected: boolean;
  form !: FormGroup;
  moments : any = ["SEMANAL", "QUINCENAL", "MENSUAL"];
  statusLoan : any[] = [];
  storage_Id : number;
  storage_Nombre : any;
  rol : number;
  load : boolean = false;
  dataLoan : any = null;

  constructor(private AppComponent : AppComponent, 
   private frmBuild : FormBuilder, 
   private svStatus : EstadosService,
   private cmLoansPayRoll : Prestamos_NominaComponent,
   private svLoans : Prestamos_NominaService, 
   private svMsjs : MensajesAplicacionService, 
   private svMessages : MessageService, 
   private svPDF : CreacionPdfService) {
    this.loadModeAndForm();
  }

  ngOnInit() {
    this.lecturaStorage();
    this.getStatus();
    this.dataLoan = this.cmLoansPayRoll.dataLoanTable;
    this.loadDataLoan(this.dataLoan);
    this.calculateDiffDias();
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
      valueCancel : [null, Validators.required], //Cancelado
      valueDebt : [null, Validators.required], //Adeudado
      valueFee : [null, Validators.required], //Cuota
      qtyDays : [null, Validators.required], //Nro Cuotas
      qtyFees : [null, Validators.required], //Nro Cuotas
      lapseFees : [null, Validators.required], //Tiempos 
      status : [null, Validators.required], //Estado
      initialDate : [null, Validators.required], //Fecha inicio
      dateTerm : [null, Validators.required], //Fecha plazo
      observation : [null], 
    });

    //this.form.get('dateTerm')?.disable();
  }

  //Función para obtener estados.
  getStatus = () => this.svStatus.srvObtenerListaEstados().subscribe(data => this.statusLoan = data.filter(x => [3,11].includes(x.estado_Id)));

  //cargar información del prestamo en el formulario de edición.
  loadDataLoan(data : any){
    console.log(this.dataLoan)
    this.form.patchValue({
      'id' : data.user.usua_Id,
      'name' : data.user.usua_Nombre,
      'valueLoan' : data.loans.ptm_Valor,
      'valueCancel' : data.loans.ptm_ValorCancelado,
      'valueDebt' : data.loans.ptm_ValorDeuda,
      'valueFee' : data.loans.ptm_ValorCuota,
      'initialDate' : new Date(data.loans.ptm_Fecha),
      'dateTerm' : new Date(data.loans.ptm_FechaPlazo),
      'qtyFees' : data.loans.ptm_NroCuotas,
      'lapseFees' : data.loans.ptm_LapsoCuotas,
      'status' : data.status.estado_Id,
      'observation' : data.loans.ptm_Observation,
    });
  }

  //CALCULOS
  //Función para calcular el valor de cuotas y deuda dependiendo el valor del prestamo, deuda y cantidad de cuotas.
  calculateValueFeesAndDebt(){
    let valueLoan : number = this.form.value.valueLoan;
    let valueCancel : number = this.form.value.valueCancel; 
    let qtyFees : number =  this.form.value.qtyFees;

    this.form.patchValue({ 
      'valueDebt' : (valueLoan - valueCancel), 
      'valueFee' : qtyFees ? (valueLoan / qtyFees) : 0, 
    });
    this.calculateDateTerm();
  }

  //Función para calcular la fecha de plazo dependiendo la fecha inicial y la cantidad de cuotas.
  calculateDateTerm(){
    let date = new Date(this.form.value.initialDate);
    let lapseFees : any = this.form.value.lapseFees;
    let qtyFees : number = this.form.value.qtyFees;

    let qtyDays : number = 0;
    lapseFees == 'SEMANAL' ? qtyDays = (qtyFees * 7) : lapseFees == 'QUINCENAL' ? qtyDays = (qtyFees * 15)  : lapseFees == 'MENSUAL' ? qtyDays = (qtyFees * 30) : qtyDays = 0;
    date.setDate(date.getDate() + qtyDays);
    this.form.patchValue({ 'dateTerm' : date, 'qtyDays' : qtyDays });
  }

  //Calcular diferencia de dias entre la fecha final y la inicial
  calculateDiffDias(){
    let days : number = 0; 
    let date1 : any =  moment(this.form.value.initialDate).format('YYYY-MM-DD');
    let date2 : any = moment(this.form.value.dateTerm).format('YYYY-MM-DD');
    let initialDate = moment([moment(date1).year(), moment(date1).month() + 1, moment(date1).date()]); 
    let dateTerm = moment([moment(date2).year(), moment(date2).month() + 1, moment(date2).date()]); 

    days = dateTerm.diff(initialDate, 'days'); 
    this.form.patchValue({ 'qtyDays' : days });
  }

  //Calcular porcentaje de cuota.
  calculatePercentageFee = (valueLoan : any, valueFee : any) => (valueFee / valueLoan) * 100;

  //Función para validar la asignación del prestamo
  validateUpdateLoan(){
    this.form.get('dateTerm')?.enable();
    if(this.form.valid) {
      if(this.form.value.valueLoan > this.form.value.valueFee) {
        if(this.form.value.valueFee > 0) {
          if(moment(this.form.value.dateTerm).format('YYYY-MM-DD') > moment(this.form.value.initialDate).format('YYYY-MM-DD')) {
            this.confirmUpdateLoan();
          } else this.svMsjs.mensajeAdvertencia(`Advertencia`, `La fecha de plazo no puede ser menor a la fecha inicial del prestamo`);
        } else this.svMsjs.mensajeAdvertencia(`Advertencia`, `El valor de la cuota debe ser mayor a 0`);
      } else this.svMsjs.mensajeAdvertencia(`Advertencia`, `El valor del prestamo no puede ser menor al valor de la cuota`);
    } else this.svMsjs.mensajeAdvertencia(`Advertencia`, `Por favor, complete todos los campos requeridos`);
  }

  //Confirmar actualización del prestamo.
  confirmUpdateLoan() {
    let msg : any = `¿Está seguro que desea actualizar el prestamo?`
    this.svMessages.add({ severity: 'warn', key: 'update', summary: 'Advertencia', detail: msg, sticky: true, });
  }

  updateLoan(){
    this.closeMsgWarning('update');
    this.load = true;
    this.svLoans.GetLoansForId(this.dataLoan.loans.ptm_Id).subscribe(data => {
      let loan : loan = {
        'Ptm_Id': data.ptm_Id,
        'Usua_Id': data.usua_Id,
        'Ptm_Valor': this.form.value.valueLoan,
        'Ptm_ValorDeuda': this.form.value.valueDebt,
        'Ptm_ValorCancelado': this.form.value.valueCancel,
        'Ptm_ValorCuota': this.form.value.valueFee,
        'Ptm_PctjeCuota': this.calculatePercentageFee(this.form.value.valueLoan, this.form.value.valueFee),
        'Estado_Id': this.form.value.status,
        'Ptm_FechaPlazo': moment(this.form.value.dateTerm).format('YYYY-MM-DD'),
        'Ptm_FechaUltCuota': data.ptm_FechaUltCuota,
        'Ptm_Observacion': this.form.value.observation ? this.form.value.observation : '',
        'Creador_Id': this.storage_Id,
        'Ptm_Fecha': moment(this.form.value.initialDate).format('YYYY-MM-DD'),
        'Ptm_FechaRegistro': data.ptm_FechaRegistro,
        'Ptm_HoraRegistro': data.ptm_HoraRegistro, 
        'Ptm_NroCuotas' : this.form.value.qtyFees,
        'Ptm_LapsoCuotas' : this.form.value.lapseFees,
      }
      this.svLoans.Put(loan.Ptm_Id, loan).subscribe(update => { this.confirmMsgUpdateLoan(data); }, error => { this.errorMessageUdateLoan(error); });
    }, error => {
      this.svMsjs.mensajeError('Error', `Ocurrió un error al consultar el prestamo N° ${this.dataLoan.loans.ptm_Id}.`);
      this.load = false;
    });
  }

  //Mensaje de error al intentar actualizar el prestamo.
  errorMessageUdateLoan(data : any){
    this.load = false;
    this.svMsjs.mensajeError('Error', `Ocurrió un error al actualizar el prestamo N° ${data.ptm_Id}.`);
  }
  
  //Mostrar mensaje de confirmación de actualización
  confirmMsgUpdateLoan(data : any){
    this.load = false;
    this.svMsjs.mensajeConfirmacion('Confirmación', `Prestamo N° ${data.ptm_Id} actualizado exitosamente!`);
    this.cmLoansPayRoll.visible = false;
    this.cmLoansPayRoll.form.patchValue({ 'id' : data.usua_Id})
    this.cmLoansPayRoll.getEmployee('id', 'update');
  }
  
  //Cerrar mensaje de confirmación.
  closeMsgWarning = (key) => this.svMessages.clear(key);

  exportToPDF(){
    
  }

}
