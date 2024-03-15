import { Component, Injectable, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { MessageService } from 'primeng/api';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { Prestamos_NominaService } from 'src/app/Servicios/Prestamos_Nomina/Prestamos_Nomina.service';
import { UsuarioService } from 'src/app/Servicios/Usuarios/usuario.service';
import { AppComponent } from 'src/app/app.component';
import { FormEditarPrestamosComponent } from '../FormEditarPrestamos/FormEditarPrestamos.component';
import { CreacionPdfService } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-Prestamos_Nomina',
  templateUrl: './Prestamos_Nomina.component.html',
  styleUrls: ['./Prestamos_Nomina.component.css']
})
export class Prestamos_NominaComponent implements OnInit {

  @ViewChild(FormEditarPrestamosComponent) cmFormEditLoans: FormEditarPrestamosComponent;
  load: boolean = false;
  modeSelected: boolean;
  employees: any = [];
  form !: FormGroup;
  loans: any = [];
  storage_Id: number;
  storage_Nombre: any;
  rol: number;
  visible: boolean = false;
  moments: any = ["SEMANAL", "QUINCENAL", "MENSUAL"];
  dataLoanTable: any = null;

  constructor(private AppComponent: AppComponent,
    private frmBuild: FormBuilder,
    private svEmployees: UsuarioService,
    private msj: MensajesAplicacionService,
    private svLoans: Prestamos_NominaService,
    private svMessages: MessageService,
    private svPDF: CreacionPdfService,) {
    this.loadModeAndForm();
  }

  ngOnInit() {
    this.lecturaStorage();
  }

  //
  lecturaStorage() {
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.rol = this.AppComponent.storage_Rol;
  }

  //Cargar modo seleccionado y formulario.
  loadModeAndForm() {
    this.modeSelected = this.AppComponent.temaSeleccionado;
    this.form = this.frmBuild.group({
      id: [null, Validators.required],
      name: [null, Validators.required],
      valueLoan: [null, Validators.required], //Prestamo
      valueFee: [null, Validators.required], //Cuota
      qtyFees: [null], //Cuotas
      lapseFees: [null, Validators.required], //Lapso cuota
      dateTerm: [null, Validators.required], //Fecha plazo
      initialDate: [new Date(), Validators.required], //Fecha inicio
      observation: [null],
    });

    this.form.get('qtyFees')?.disable();
    this.form.get('dateTerm')?.disable();
  }

  //Función para limpiar campos.
  clearFields() {
    this.form.reset();
    this.loans = [];
    this.employees = [];
    this.load = false;
    this.form.get('qtyFees')?.disable();
    this.form.get('dateTerm')?.disable();
    this.form.patchValue({ 'initialDate': new Date() })
  }

  //.Función para cargar los empleados según el campo de búsqueda.
  getEmployee(searchFor: string, key?: string) {
    let field: any = this.form.get(searchFor)?.value;

    if (!key) key = `search`;
    if (field.toString().length > 1) {
      this.svEmployees.getEmployees(field).subscribe(data => {
        if (data.length > 0) {
          this.employees = data;
          if (searchFor == 'id') this.selectEmployee('id', key);
        } else this.msj.mensajeAdvertencia(`Advertencia`, `No se encontró un empleado con la cédula ${this.form.value.id}`);
      }, error => {
        if (searchFor == 'id') this.msj.mensajeError(`Error al consultar el empleado.`, `Error: ${error.status}`);
      });
    }
  }

  //.Función para seleccionar un empleado de la lista de empleados.
  selectEmployee(searchFor: any, key?: any) {
    let test: any = this.employees.filter((item) => [item.usua_Nombre, item.usua_Id].includes(this.form.get(searchFor)?.value));
    this.form.patchValue({
      'id': test[0].usua_Id,
      'name': test[0].usua_Nombre,
    });
    this.searchLoans(key);
  }

  //Función para buscar prestamos por usuario.
  searchLoans(key: string) {
    this.loans = [];
    this.load = true;
    let cardId: any = this.form.value.id;

    this.svLoans.GetLoansForCardId(cardId).subscribe(data => {
      if (data.length > 0) {
        this.loans = data;
        if (key == 'search') this.msj.mensajeAdvertencia(`Advertencia`, `El empleado ${this.form.value.name} tiene ${data.length} prestamo(s) asignados`);
      } else this.msj.mensajeConfirmacion(`Confirmación`, `El empleado ${this.form.value.name} no tiene prestamo(s) asignados`);
    }, error => {
      this.msj.errorHttp(`Error al consultar la información de prestamos`, error);
      this.load = false;
    }, () => this.load = false);
  }

  //Función para validar la asignación del prestamo
  validateLoan() {
    this.form.get('dateTerm')?.enable();
    if (this.form.valid) {
      if (this.form.value.valueLoan > this.form.value.valueFee) {
        if (this.form.value.valueFee > 0) {
          if (moment(this.form.value.dateTerm).format('YYYY-MM-DD') > moment(this.form.value.initialDate).format('YYYY-MM-DD')) {
            if (this.loans.length > 0) {
              let msg: any = `El empleado ${this.form.value.name} ya tiene ${this.loans.length} prestamo(s) por monto de $${this.calculateTotalDebt().toLocaleString()} pesos, ¿Está seguro que desea continuar?`
              this.svMessages.add({ severity: 'warn', key: 'validation', summary: 'Advertencia', detail: msg, sticky: true, });
            } else this.saveLoan();
          } else this.msj.mensajeAdvertencia(`Advertencia`, `La fecha de plazo no puede ser menor a la fecha inicial del prestamo`);
        } else this.msj.mensajeAdvertencia(`Advertencia`, `El valor de la cuota debe ser mayor a 0`);
      } else this.msj.mensajeAdvertencia(`Advertencia`, `El valor del prestamo no puede ser menor al valor de la cuota`);
    } else this.msj.mensajeAdvertencia(`Advertencia`, `Por favor, complete todos los campos requeridos`);
  }

  //Función para guardar prestamos
  saveLoan() {
    this.form.get('dateTerm')?.enable();
    this.closeMsgWarning('validation');
    this.load = true;
    let loanUser: loan = null;
    let observation: string = !this.form.value.observation ? '' : this.form.value.observation;

    loanUser = {
      'Ptm_Id': 0,
      'Usua_Id': this.form.value.id,
      'Ptm_Valor': this.form.value.valueLoan,
      'Ptm_ValorDeuda': this.form.value.valueLoan,
      'Ptm_ValorCancelado': 0,
      'Ptm_ValorCuota': this.form.value.valueFee,
      'Ptm_PctjeCuota': this.calculatePercentageFee(this.form.value.valueLoan, this.form.value.valueFee),
      'Estado_Id': 11,
      'Ptm_FechaPlazo': moment(this.form.value.dateTerm).format('YYYY-MM-DD'),
      'Ptm_FechaUltCuota': null,
      'Ptm_Observacion': observation.toUpperCase(),
      'Creador_Id': this.storage_Id,
      'Ptm_Fecha': moment(this.form.value.initialDate).format('YYYY-MM-DD'),
      'Ptm_FechaRegistro': moment().format('YYYY-MM-DD'),
      'Ptm_HoraRegistro': moment().format('HH:mm:ss'),
      'Ptm_NroCuotas': this.form.value.qtyFees,
      'Ptm_LapsoCuotas': this.form.value.lapseFees,
    };

    this.svLoans.Post(loanUser).subscribe(data => this.confirmMessage(data), error => {
      this.msj.mensajeError(`Error al guardar el prestamo`, `Error: ${error.status}`);
      this.load = false;
    });
  }

  //Función que muestra mensaje de confirmación de la asignación del prestamo.
  confirmMessage(data: any) {
    this.msj.mensajeConfirmacion(`Confirmación`, `Prestamo asignado exitosamente!`);
    this.clearFields();
    this.form.patchValue({ 'id': data.usua_Id });
    this.getEmployee('id', 'creation');
  }

  //Funcion para habilitar el campo cantidad de cuotas
  enableFieldQtyFees() {
    if ([0, null, undefined, ''].includes(this.form.value.valueLoan)) {
      this.form.patchValue({ 'qtyFees': 0, 'valueFee': 0 })
      this.form.get('qtyFees')?.disable();
    } else {
      this.form.get('qtyFees')?.enable();
      this.calculateValueFee();
    }
  }

  //Calculos
  //Función para calcular la diferencia de días entre la fecha de plazo y la fecha actual.
  calculateDiffDias(loans: any) {
    let days: number = 0;
    let fecha = moment([moment(loans.ptm_Fecha).year(), moment(loans.ptm_Fecha).month() + 1, moment(loans.ptm_Fecha).date()]);
    let fechaPlazo = moment([moment(loans.ptm_FechaPlazo).year(), moment(loans.ptm_FechaPlazo).month() + 1, moment(loans.ptm_FechaPlazo).date()]);
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
  calculatePercentageFee = (valueLoan: any, valueFee: any) => (valueFee / valueLoan) * 100;

  //Función para calcular el valor de la cuota.
  calculateValueFee() {
    let initialFee: number = 0;
    if (this.form.value.qtyFees) initialFee = this.form.value.valueLoan / this.form.value.qtyFees;
    else initialFee = 0;
    this.form.patchValue({ 'valueFee': initialFee });
    this.calculateLapseEstimatedDate();
  }

  //Calcular la fecha estimada del pago del prestamo.
  calculateEstimatedDate() {
    let res = new Date(this.form.value.initialDate);
    let lapseFees: any = this.form.value.lapseFees;
    let qtyFees: number = this.form.value.qtyFees;
    let qtyDays: number = 0;
    lapseFees == 'SEMANAL' ? qtyDays = (qtyFees * 7) : lapseFees == 'QUINCENAL' ? qtyDays = (qtyFees * 15) : lapseFees == 'MENSUAL' ? qtyDays = (qtyFees * 30) : qtyDays = 0;
    res.setDate(res.getDate() + qtyDays);
    this.form.patchValue({ 'dateTerm': res });
  }

  //Función para cambiar fecha estimada de plazo desde la fecha inicial
  calculateLapseEstimatedDate() {
    if (this.form.value.lapseFees && this.form.value.qtyFees) this.calculateEstimatedDate();
    else this.form.patchValue({ 'dateTerm': null })
  }

  //Cerrar mensaje de confirmación.
  closeMsgWarning = (key) => this.svMessages.clear(key);

  //Función para confirmar la anulación del prestamo.
  confirmCancelationLoan(data: any) {
    this.dataLoanTable = data;
    let msg: any = `¿Está seguro que desea anular el prestamo N° ${data.loans.ptm_Id} con deuda de $${data.loans.ptm_ValorDeuda.toLocaleString()} pesos?`
    this.svMessages.add({ severity: 'warn', key: 'cancelation', summary: 'Advertencia', detail: msg, sticky: true, });
  }

  //Función para colocar como anulado el estado del prestamo.
  cancelLoan(loan: any) {
    this.load = true;
    this.closeMsgWarning('cancelation');
    this.svLoans.putLoanAnulled(loan.loans.ptm_Id).subscribe(() => {
      this.msj.mensajeConfirmacion(`Confirmación`, `Prestamo N° ${loan.loans.ptm_Id} anulado exitosamente!`);
      setTimeout(() => { this.searchLoans('cancelation'); }, 1000);
    }, error => {
      this.msj.errorHttp(`Error al cancelar el prestamo`, error);
      this.load = false;
    }, () => this.load = false);
  }

  //Cargar información del prestamo.
  loadModalInfoLoan(data: any) {
    this.visible = true;
    this.dataLoanTable = data;
  }

  exportToPDF() {
    let title: string = `Prestamo N° ${0}`;
    let content: any[] = this.contentPDF([]);
    this.svPDF.formatoPDF(title, content);
  }

  contentPDF(data: any): any {
    let content: any[] = [];
    return content;
  }
}

export interface loan {
  Ptm_Id?: number;
  Usua_Id: number;
  Ptm_Valor: number;
  Ptm_ValorDeuda: number;
  Ptm_ValorCancelado: number;
  Ptm_ValorCuota: number;
  Ptm_PctjeCuota: number;
  Estado_Id: number;
  Ptm_FechaPlazo: any;
  Ptm_FechaUltCuota: any;
  Ptm_Observacion: string;
  Creador_Id: number;
  Ptm_Fecha: any;
  Ptm_FechaRegistro: any;
  Ptm_HoraRegistro: string;
  Ptm_LapsoCuotas: string;
  Ptm_NroCuotas: number;
}
