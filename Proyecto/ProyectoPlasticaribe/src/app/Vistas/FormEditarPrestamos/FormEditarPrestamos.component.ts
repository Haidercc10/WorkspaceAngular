import { Component, Injectable, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { EstadosService } from 'src/app/Servicios/Estados/estados.service';
import { AppComponent } from 'src/app/app.component';
import { Prestamos_NominaComponent, loan } from '../Prestamos_Nomina/Prestamos_Nomina.component';
import { Prestamos_NominaService } from 'src/app/Servicios/Prestamos_Nomina/Prestamos_Nomina.service';

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

  constructor(private AppComponent : AppComponent, 
   private frmBuild : FormBuilder, 
   private svStatus : EstadosService,
   private cmLoansPayRoll : Prestamos_NominaComponent,
   private svLoans : Prestamos_NominaService) {
    this.loadModeAndForm();
  }

  ngOnInit() {
    this.getStatus();
    this.loadDataLoan(this.cmLoansPayRoll.dataLoanTable);
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
      qtyFees : [null], //Nro Cuotas
      lapseFees : [null, Validators.required], //Tiempos 
      status : [null, Validators.required], //Estado
      initialDate : [null, Validators.required], //Fecha inicio
      dateTerm : [null, Validators.required], //Fecha plazo
      observation : [null], 
    });
  }

  //Función para obtener estados.
  getStatus = () => this.svStatus.srvObtenerListaEstados().subscribe(data => this.statusLoan = data.filter(x => [3,11].includes(x.estado_Id)));

  //cargar información del prestamo en el formulario de edición.
  loadDataLoan(data : any){
    this.form.patchValue({
      'id' : data.user.usua_Id,
      'name' : data.user.usua_Nombre,
      'valueLoan' : data.loans.ptm_Valor,
      'valueCancel' : data.loans.ptm_ValorCancelado,
      'valueDebt' : data.loans.ptm_ValorDeuda,
      'valueFee' : data.loans.ptm_ValorCuota,
      'qtyDays' : this.calculateDiffDias(data.loans),
      'qtyFees' : data.loans.ptm_NroCuotas,
      'lapseFees' : data.loans.ptm_LapsoCuotas,
      'initialDate' : new Date(data.loans.ptm_Fecha),
      'status' : data.status.estado_Id,
      'dateTerm' : new Date(data.loans.ptm_FechaPlazo),
      'observation' : data.loans.ptm_Observation,
    });
  }

  //Calcular diferencia de dias entre la fecha final y la inicial
  calculateDiffDias(loans : any){
    let days : number = 0; 
    let fecha = moment([moment().year(), moment().month(), moment().date()]); 
    let fechaPlazo = moment([moment(loans.ptm_FechaPlazo).year(), moment(loans.ptm_FechaPlazo).month(), moment(loans.ptm_FechaPlazo).date()]); 
   
    days = fechaPlazo.diff(fecha, 'days'); 
    return days;
  }

  updateLoan(){
    let loan : loan = {
      'Ptm_Id': this.cmLoansPayRoll.dataLoanTable.ptm_Id,
      'Usua_Id': this.form.value.id,
      'Ptm_Valor': this.form.value.valueLoan,
      'Ptm_ValorDeuda': this.form.value.valueDebt,
      'Ptm_ValorCancelado': this.form.value.valueCancel,
      'Ptm_ValorCuota': this.form.value.valueFee,
      'Ptm_PctjeCuota': 0,
      'Estado_Id': this.form.value.status,
      'Ptm_FechaPlazo': moment(this.form.value.dateTerm).format('YYYY-MM-DD'),
      'Ptm_FechaUltCuota': undefined,
      'Ptm_Observacion': '',
      'Creador_Id': 0,
      'Ptm_Fecha': moment(this.form.value.initialDate).format('YYYY-MM-DD'),
      'Ptm_FechaRegistro': moment().format('YYYY-MM-DD'),
      'Ptm_HoraRegistro': moment().format('HH:mm:ss'), 
      'Ptm_NroCuotas' : this.form.value.qtyFees,
      'Ptm_LapsoCuotas' : this.form.value.lapseFees,
    }
    console.log(loan)
    /*this.svLoans.Put(loan.Ptm_Id, loan).subscribe(data => {
      this.cmLoansPayRoll.visible = false;
      this.cmLoansPayRoll.searchLoans();
    }, error => {
      
    });*/
  }
}
