import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { Table } from 'primeng/table';
import { AreaService } from 'src/app/Servicios/Areas/area.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { Movimientos_Nomina, Movimientos_NominaService } from 'src/app/Servicios/Movimientos_Nomina/Movimientos_Nomina.service';
import { AdvancePayroll, Payroll as DataPayroll, NominaDetallada_PlasticaribeService } from 'src/app/Servicios/Nomina_Detallada/NominaDetallada_Plasticaribe.service';
import { PaymentLoan, Prestamos_NominaService } from 'src/app/Servicios/Prestamos_Nomina/Prestamos_Nomina.service';
import { DataMoneySave, SalarioTrabajadoresService } from 'src/app/Servicios/Salario_Trabajadores/Salario-Trabajadores.service';
import { UsuarioService } from 'src/app/Servicios/Usuarios/usuario.service';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-NominaDetallada_Plasticaribe',
  templateUrl: './NominaDetallada_Plasticaribe.component.html',
  styleUrls: ['./NominaDetallada_Plasticaribe.component.css']
})

export class NominaDetallada_PlasticaribeComponent implements OnInit {

  load: boolean = false;
  validateRole: number | undefined;
  storage_Id: number | undefined;
  storage_Name: string | undefined;
  selectedMode: boolean = false;
  rangeDates: Array<any> = [];
  @ViewChild('tableWorkers') tableWorkers: Table;
  formPayrollWorker: FormGroup;
  areas: Array<any> = [];
  selectedAreas: Array<any> = [];
  users: Array<any> = [];
  userSelected: Array<any> = [];
  payroll: Array<Payroll> = [];
  disabledDates: Array<Date> = [];
  today: Date = new Date();
  payrollForAdvance: Array<Payroll> = [];
  detailsDisabilities: Array<Disability> = [];
  detailsLoan: Array<Loan> = [];
  detailsAdvances: Array<Advance> = [];
  detailsSaving: Array<Saving> = [];
  modalPayroll: boolean = false;
  modalDataDisability: boolean = false;
  modalDataLoan: boolean = false;
  modalDataAdvance: boolean = false;
  modalDataSaving: boolean = false;

  constructor(private frmBuilder: FormBuilder,
    private appComponent: AppComponent,
    private userService: UsuarioService,
    private areaService: AreaService,
    private msj: MensajesAplicacionService,
    private payrollService: NominaDetallada_PlasticaribeService,
    private loanService: Prestamos_NominaService,
    private movementsPayrollService: Movimientos_NominaService,
    private salaryWorkersService: SalarioTrabajadoresService,) {
  }

  ngOnInit() {
    this.readStorage();
    this.initFormPayroll();
    this.getArea();
    // this.getDisableDates();
  }

  initFormPayroll() {
    this.formPayrollWorker = this.frmBuilder.group({
      idWorker: [null, Validators.required],
      worker: [null, Validators.required],
      baseSalary: [null, Validators.required],
      absentDays: [null, Validators.required],
      daysToPay: [null, Validators.required],
      hoursToPay: [null, Validators.required],
      valueDaysToPay: [null, Validators.required],
      daysDisabilityGeneralIllines: [null, Validators.required],
      valueDaysDisabilityGeneralIllines: [null, Validators.required],
      daysDisabilityWorkAccident: [null, Validators.required],
      valueDaysDisabilityWorkAccident: [null, Validators.required],
      daysDisabilityParents: [null, Validators.required],
      valueDaysDisabilityParents: [null, Validators.required],
      adictionalDaytimeHours: [null, Validators.required],
      valueAdictionalDaytimeHours: [null, Validators.required],
      adictionalNightHours: [null, Validators.required],
      valueAdictionalNightHours: [null, Validators.required],
      extraHoursDaytimeSunday: [null, Validators.required],
      valueExtraHoursDaytimeSunday: [null, Validators.required],
      surchagedHours035: [null, Validators.required],
      valueSurchagedHours035: [null, Validators.required],
      extraHoursNightSunday: [null, Validators.required],
      valueExtraHoursNightSunday: [null, Validators.required],
      surchagedHours075: [null, Validators.required],
      valueSurchagedHours075: [null, Validators.required],
      surchagedHours100: [null, Validators.required],
      valueSurchagedHours100: [null, Validators.required],
      adictionalFee: [null, Validators.required],
      totalValueAdictionalFee: [null, Validators.required],
      transpotationAssitance: [null, Validators.required],
      accrued: [null, Validators.required],
      eps: [null, Validators.required],
      afp: [null, Validators.required],
      saving: [null, Validators.required],
      loan: [null, Validators.required],
      advance: [null, Validators.required],
      totalDiscounts: [null, Validators.required],
      PagoPTESemanaAnt: [null, Validators.required],
      discounts: [null, Validators.required],
      deductions: [null, Validators.required],
      subTotalToPay: [null, Validators.required],
      news: [null, Validators.required],
    });
  }

  readStorage() {
    this.selectedMode = this.appComponent.temaSeleccionado;
    this.storage_Id = this.appComponent.storage_Id;
    this.storage_Name = this.appComponent.storage_Nombre;
    this.validateRole = this.appComponent.ValidarRol;
  }

  clearAll() {
    this.load = false;
    this.formPayrollWorker.reset();
    this.payroll = [];
    this.rangeDates = null;
    this.selectedAreas = [];
    this.userSelected = [];
    this.payrollForAdvance = [];
    this.detailsDisabilities = [];
    this.detailsLoan = [];
    this.detailsAdvances = [];
    this.detailsSaving = [];
    this.modalPayroll = false;
    this.modalDataDisability = false;
    this.modalDataLoan = false;
    this.modalDataAdvance = false;
    this.modalDataSaving = false;
  }

  getDisableDates() {
    let years: Array<number> = this.getYears();
    let months: Array<number> = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    for (let i = 0; i < years.length; i++) {
      for (let j = 0; j < months.length; j++) {
        let date: Date = new Date(years[i], months[j], 31);
        if (date.getDate() == 31) this.disabledDates.push(date);
      }
    }
  }

  getYears(): Array<number> {
    let years: Array<number> = [2019];
    for (let i = 0; i < years.length; i++) {
      let num_Mayor: number = Math.max(...years);
      if (num_Mayor == moment().year()) break;
      years.push(num_Mayor + 1);
    }
    return years;
  }

  getArea = () => this.areaService.srvObtenerLista().subscribe(data => this.areas = data.filter(x => [1, 3, 4, 6, 7, 8, 9, 10, 11, 12, 19, 20, 21, 22, 25, 28, 29, 30, 31, 32].includes(x.area_Id)));

  getWorkers() {
    if (this.rangeDates.length == 2) {
      if (this.selectedAreas.length > 0) {
        this.load = true;
        this.payroll = [];
        let areas: string = '';
        this.selectedAreas.forEach(d => areas += `${d}|`);
        let start: any = moment(this.rangeDates[0]).format('YYYY-MM-DD');
        let end: any = moment(this.rangeDates[1]).format('YYYY-MM-DD');
        this.userService.GetWorkers(start, end, areas).subscribe(data => this.calculatePayroll(data), error => {
          this.load = false;
          this.msj.errorHttp(`¡Ocurrió un error al obtener trabajadores para calcular la nomina!`, error);
        });
      } else this.msj.mensajeAdvertencia(`¡Debe seleccionar minimo un área!`);
    } else this.msj.mensajeAdvertencia(`¡Debes seleccionar un rango de fechas!`);
  }

  calculatePayroll(users: any) {
    this.load = true;
    let count: number = 0;
    let start: any = moment(this.rangeDates[0]).format('YYYY-MM-DD');
    let end: any = moment(this.rangeDates[1]).format('YYYY-MM-DD');
    users.forEach(d => {
      let dataDisability: any = this.calculateDisabilitiesByWorker(d.disability);
      let daysToPay: number = this.calculateDaysPayroll_TotalToPay() - dataDisability.daysDisabilityGeneralIllines - dataDisability.daysDisabilityWorkAccident - dataDisability.daysDisabilityParents;
      let data: Payroll = {
        idWorker: d.identification,
        worker: d.name,
        baseSalary: d.baseSalary,
        startDate: start,
        endDate: end,
        absentDays: 0,
        daysToPay: daysToPay,
        hoursToPay: daysToPay * 8,
        valueDaysToPay: ((d.baseSalary / 30) / 8) * (daysToPay * 8),
        detailsDisability: d.disability,
        daysDisabilityGeneralIllines: dataDisability.daysDisabilityGeneralIllines,
        valueDaysDisabilityGeneralIllines: dataDisability.valueDaysDisabilityGeneralIllines,
        daysDisabilityWorkAccident: dataDisability.daysDisabilityWorkAccident,
        valueDaysDisabilityWorkAccident: dataDisability.valueDaysDisabilityWorkAccident,
        daysDisabilityParents: dataDisability.daysDisabilityParents,
        valueDaysDisabilityParents: dataDisability.valueDaysDisabilityParents,
        adictionalDaytimeHours: 0,
        valueAdictionalDaytimeHours: 0,
        adictionalNightHours: 0,
        valueAdictionalNightHours: 0,
        extraHoursDaytimeSunday: 0,
        valueExtraHoursDaytimeSunday: 0,
        surchagedHours035: 0,
        valueSurchagedHours035: 0,
        extraHoursNightSunday: 0,
        valueExtraHoursNightSunday: 0,
        surchagedHours075: 0,
        valueSurchagedHours075: 0,
        surchagedHours100: 0,
        valueSurchagedHours100: 0,
        adictionalFee: 0,
        totalValueAdictionalFee: 0,
        transpotationAssitance: d.transportAsistance,
        productivitySella: 0,
        productivityExt: 0,
        productivityMntj: 0,
        accrued: 0,
        eps: d.eps / 30,
        afp: d.afp / 30,
        saving: d.saving,
        detailsMoneySave: d.detailsMoneySave,
        loan: d.loan.length > 0 ? d.loan.reduce((a, b) => a += b.valueQuota, 0) : 0,
        detailsLoans: d.loan,
        advance: d.advance.length > 0 ? d.advance.reduce((a, b) => a += b.valueAdvance, 0) : 0,
        detailsAdvance: d.advance,
        totalDiscounts: 0,
        PagoPTESemanaAnt: 0,
        discounts: 0,
        deductions: 0,
        subTotalToPay: 0,
        news: ''
      };
      count++;
      this.payroll.push(data);
      let i: number = this.payroll.findIndex(x => x.idWorker == d.identification);
      this.payroll[i].totalValueAdictionalFee = this.totalFee(this.payroll[i]);
      this.payroll[i].accrued = this.totalAccrued(this.payroll[i]);
      this.payroll[i].totalDiscounts = this.totalDiscounts(this.payroll[i]);
      this.payroll[i].deductions = this.totalDiscounts(this.payroll[i]);
      this.payroll[i].subTotalToPay = this.totalAccrued(this.payroll[i]) - this.totalDiscounts(this.payroll[i]);
      this.payroll[i].detailsDisability = this.fillDetailsDisabilities(this.payroll[i].detailsDisability);
      if (count == this.payroll.length) this.load = false;
    });
  }

  fillDetailsDisabilities(disabilities: Array<Disability>) {
    for (let i = 0; i < disabilities.length; i++) {
      let dataDisability = this.diffDaysDisability(disabilities[i]);
      disabilities[i].totalToPayThisPayroll = dataDisability.total.toFixed(2);
    }
    return disabilities;
  }

  calculateDaysPayroll_TotalToPay() {
    let _startPayroll: any = moment(this.rangeDates[0]).subtract(1, 'days').format('YYYY-MM-DD');
    let _endPayroll: any = moment(this.rangeDates[1]).format('YYYY-MM-DD');
    let startPayroll = moment([parseInt(_startPayroll.substring(0, 4)), parseInt(_startPayroll.substring(5, 7)) - 1, parseInt(_startPayroll.substring(8, 10))]);
    let endPayroll = moment([parseInt(_endPayroll.substring(0, 4)), parseInt(_endPayroll.substring(5, 7)) - 1, parseInt(_endPayroll.substring(8, 10))]);
    return endPayroll.diff(startPayroll, 'days');
  }

  calculateDisabilitiesByWorker(dataDisability: Array<any>): any {
    let daysDisabilityGeneralIllines: number = 0;
    let valueDaysDisabilityGeneralIllines: number = 0;
    let daysDisabilityWorkAccident: number = 0;
    let valueDaysDisabilityWorkAccident: number = 0;
    let daysDisabilityParents: number = 0;
    let valueDaysDisabilityParents: number = 0;
    dataDisability.forEach(d => {
      let data: any = this.diffDaysDisability(d);
      let diffDays: number = data.diffDays;
      let valueDisability: number = data.total;
      if (d.idTypeDisability == 1) {
        daysDisabilityGeneralIllines += diffDays;
        valueDaysDisabilityGeneralIllines += valueDisability;
      } else if (d.idTypeDisability == 2) {
        daysDisabilityWorkAccident += diffDays;
        valueDaysDisabilityWorkAccident += valueDisability;
      } else if (d.idTypeDisability == 3) {
        daysDisabilityParents += diffDays;
        valueDaysDisabilityParents += valueDisability;
      }
    });
    return {
      daysDisabilityGeneralIllines: daysDisabilityGeneralIllines,
      valueDaysDisabilityGeneralIllines: valueDaysDisabilityGeneralIllines,
      daysDisabilityWorkAccident: daysDisabilityWorkAccident,
      valueDaysDisabilityWorkAccident: valueDaysDisabilityWorkAccident,
      daysDisabilityParents: daysDisabilityParents,
      valueDaysDisabilityParents: valueDaysDisabilityParents,
    }
  }

  diffDaysDisability(d: any): any {
    let diffDays: number = 0;
    let total: number = 0;
    let data: any = this.disabilityBeforePayroll(d);
    diffDays = data.disabilityDays;
    if (d.idTypeDisability == 1) total = data.total;
    else total = d.valueDay * diffDays;
    return {
      diffDays: diffDays,
      total: total
    };
  }

  disabilityBeforePayroll(d: any) {
    let _startDisability: any = moment(d.startDate).subtract(1, 'days').format('YYYY-MM-DD');
    let _endDisability: any = moment(d.endDate).format('YYYY-MM-DD');
    let _startPayroll: any = moment(this.rangeDates[0]).subtract(1, 'days').format('YYYY-MM-DD');
    let _endPayroll: any = moment(this.rangeDates[1]).format('YYYY-MM-DD');
    let startDisability = moment([parseInt(_startDisability.substring(0, 4)), parseInt(_startDisability.substring(5, 7)) - 1, parseInt(_startDisability.substring(8, 10))]);
    let startPayroll = moment([parseInt(_startPayroll.substring(0, 4)), parseInt(_startPayroll.substring(5, 7)) - 1, parseInt(_startPayroll.substring(8, 10))]);
    let endPayroll = moment([parseInt(_endPayroll.substring(0, 4)), parseInt(_endPayroll.substring(5, 7)) - 1, parseInt(_endPayroll.substring(8, 10))]);
    let endDisability = moment([parseInt(_endDisability.substring(0, 4)), parseInt(_endDisability.substring(5, 7)) - 1, parseInt(_endDisability.substring(8, 10))]);
    let disabilityBeforePayroll: number = startPayroll.diff(startDisability, 'days');
    let disabilityAfterPayroll: number = endDisability.diff(endPayroll, 'days');
    let daysBetweenPayroll: number = endPayroll.diff(startPayroll, 'days');
    let disabilityDays: number = daysBetweenPayroll + (disabilityBeforePayroll < 0 ? disabilityBeforePayroll : 0) + (disabilityAfterPayroll < 0 ? disabilityAfterPayroll : 0);
    let total: number = this.valueDisablityBeforePayroll(disabilityBeforePayroll, d.valueDay, disabilityDays);
    return {
      disabilityDays: disabilityDays,
      daysBetweenPayroll: daysBetweenPayroll,
      total: total
    };
  }

  valueDisablityBeforePayroll(disabilityBeforePayroll: number, valueDay: number, disabilityDays: number): number {
    let total: number = 0;
    if (disabilityBeforePayroll <= 0) {
      if (disabilityDays <= 2) total = valueDay * disabilityDays;
      else if (disabilityDays => 3 && disabilityDays <= 90) total = (2 * valueDay) + ((disabilityDays - 2) * ((valueDay * 66.667) / 100));
      else if (disabilityDays > 90) total = (2 * valueDay) + (88 * ((valueDay * 66.667) / 100)) + ((disabilityDays - 90) * ((valueDay * 50) / 100));
    } else if (disabilityBeforePayroll > 0 && disabilityBeforePayroll < 2) {
      if (disabilityDays <= 2) total = valueDay * disabilityDays;
      else if (disabilityDays => 3 && disabilityDays <= 90) total = (1 * valueDay) + ((disabilityDays - 1) * ((valueDay * 66.667) / 100));
      else if (disabilityDays > 90) total = (1 * valueDay) + (88 * ((valueDay * 66.667) / 100)) + ((disabilityDays - 90) * ((valueDay * 50) / 100));
    } else if (disabilityBeforePayroll >= 2 && disabilityBeforePayroll < 91) total = ((valueDay * 66.667) / 100) * disabilityDays;
    else if (disabilityBeforePayroll >= 91) total = ((valueDay * 50) / 100) * disabilityDays;
    return total;
  }

  calculateValueToPayWithAbsentDays() {
    setTimeout(() => {
      let worker: any = this.formPayrollWorker.value.idWorker;
      let i: number = this.payroll.findIndex(x => x.idWorker == worker);
      let absentDays: number = this.formPayrollWorker.value.absentDays;
      let baseSalary: number = this.payroll[i].baseSalary;
      let valueDay: number = baseSalary / 30;
      let valueHour: number = valueDay / 8;
      let _startPayroll: any = moment(this.rangeDates[0]).subtract(1, 'days').format('YYYY-MM-DD');
      let _endPayroll: any = moment(this.rangeDates[1]).format('YYYY-MM-DD');
      let startPayroll = moment([parseInt(_startPayroll.substring(0, 4)), parseInt(_startPayroll.substring(5, 7)) - 1, parseInt(_startPayroll.substring(8, 10))]);
      let endPayroll = moment([parseInt(_endPayroll.substring(0, 4)), parseInt(_endPayroll.substring(5, 7)) - 1, parseInt(_endPayroll.substring(8, 10))]);
      let daysBetweenPayroll: number = endPayroll.diff(startPayroll, 'days');
      let daysToPay: number = daysBetweenPayroll - this.payroll[i].daysDisabilityGeneralIllines - this.payroll[i].daysDisabilityWorkAccident - this.payroll[i].daysDisabilityParents;
      let totalDaysToPay: number = (daysToPay - absentDays);
      if (totalDaysToPay >= 0 && absentDays > 0) this.validAbsentDays(absentDays, totalDaysToPay, valueHour, i);
      else this.invalidAbsentDays(absentDays, totalDaysToPay, valueHour, daysToPay, i);
    }, 500);
  }

  validAbsentDays(absentDays: number, totalDaysToPay: number, valueHour: number, i: number) {
    let total: number = valueHour * (totalDaysToPay * 8);
    this.payroll[i].absentDays = absentDays;
    this.payroll[i].daysToPay = totalDaysToPay;
    this.payroll[i].hoursToPay = totalDaysToPay * 8;
    this.payroll[i].valueDaysToPay = total;
    this.payroll[i].accrued = this.totalAccrued(this.payroll[i]);
    this.payroll[i].subTotalToPay = this.totalAccrued(this.payroll[i]) - this.totalDiscounts(this.payroll[i]);
    this.formPayrollWorker.patchValue({
      daysToPay: totalDaysToPay,
      hoursToPay: totalDaysToPay * 8,
      valueDaysToPay: total,
      transpotationAssitance: ((this.payroll[i].transpotationAssitance / 30) * this.payroll[i].daysToPay),
      accrued: this.totalAccrued(this.payroll[i]),
      subTotalToPay: this.payroll[i].subTotalToPay,
    });
  }

  invalidAbsentDays(absentDays: number, totalDaysToPay: number, valueHour: number, daysToPay: number, i: number) {
    if (!absentDays) this.msj.mensajeAdvertencia(`¡La cantidad de días ausente no es valida!`);
    if (totalDaysToPay < 0) this.msj.mensajeAdvertencia(`¡La cantidad de días ausente no debe ser mayor a la cantidad de días a pagar!`);
    let total: number = valueHour * (daysToPay * 8);
    this.payroll[i].absentDays = 0;
    this.payroll[i].daysToPay = daysToPay;
    this.payroll[i].hoursToPay = daysToPay * 8;
    this.payroll[i].valueDaysToPay = total;
    this.payroll[i].accrued = this.totalAccrued(this.payroll[i]);
    this.payroll[i].subTotalToPay = this.totalAccrued(this.payroll[i]) - this.totalDiscounts(this.payroll[i]);
    this.formPayrollWorker.patchValue({
      absentDays: 0,
      daysToPay: daysToPay,
      hoursToPay: daysToPay * 8,
      valueDaysToPay: total,
      transpotationAssitance: ((this.payroll[i].transpotationAssitance / 30) * this.payroll[i].daysToPay),
      subTotalToPay: this.payroll[i].subTotalToPay,
    });
  }

  calculateValueAdictionalDaytimeHours() {
    setTimeout(() => {
      let worker: any = this.formPayrollWorker.value.idWorker;
      let extraHours: number = this.formPayrollWorker.value.adictionalDaytimeHours;
      extraHours = !extraHours ? 0 : extraHours;
      let baseSalary: number = this.formPayrollWorker.value.baseSalary;
      let valueDay: number = baseSalary / 30;
      let valueHour: number = valueDay / 8;
      let total: number = (valueHour * 1.25) * extraHours;
      let i: number = this.payroll.findIndex(x => x.idWorker == worker);
      this.payroll[i].adictionalDaytimeHours = extraHours;
      this.payroll[i].valueAdictionalDaytimeHours = total;
      this.payroll[i].totalValueAdictionalFee = this.totalFee(this.payroll[i]);
      this.payroll[i].accrued = this.totalAccrued(this.payroll[i]);
      this.payroll[i].subTotalToPay = this.totalAccrued(this.payroll[i]) - this.totalDiscounts(this.payroll[i]);
      this.formPayrollWorker.patchValue({
        adictionalDaytimeHours: extraHours,
        valueAdictionalDaytimeHours: this.payroll[i].valueAdictionalDaytimeHours,
        totalValueAdictionalFee: this.payroll[i].totalValueAdictionalFee,
        accrued: this.payroll[i].accrued,
        subTotalToPay: this.payroll[i].subTotalToPay,
      });
    }, 500);
  }

  calculateValueAdictionalNightHours() {
    setTimeout(() => {
      let worker: any = this.formPayrollWorker.value.idWorker;
      let extraHours: number = this.formPayrollWorker.value.adictionalNightHours;
      extraHours = !extraHours ? 0 : extraHours;
      let baseSalary: number = this.formPayrollWorker.value.baseSalary;
      let valueDay: number = baseSalary / 30;
      let valueHour: number = valueDay / 8;
      let total: number = (valueHour * 1.75) * extraHours;
      let i: number = this.payroll.findIndex(x => x.idWorker == worker);
      this.payroll[i].adictionalNightHours = extraHours;
      this.payroll[i].valueAdictionalNightHours = total;
      this.payroll[i].totalValueAdictionalFee = this.totalFee(this.payroll[i]);
      this.payroll[i].accrued = this.totalAccrued(this.payroll[i]);
      this.payroll[i].subTotalToPay = this.totalAccrued(this.payroll[i]) - this.totalDiscounts(this.payroll[i]);
      this.formPayrollWorker.patchValue({
        adictionalNightHours: extraHours,
        valueAdictionalNightHours: total,
        totalValueAdictionalFee: this.totalFee(this.payroll[i]),
        accrued: this.totalAccrued(this.payroll[i]),
        subTotalToPay: this.payroll[i].subTotalToPay,
      });
    }, 500);
  }

  calculateValueExtraHoursDaytimeSunday() {
    setTimeout(() => {
      let worker: any = this.formPayrollWorker.value.idWorker;
      let extraHours: number = this.formPayrollWorker.value.extraHoursDaytimeSunday;
      extraHours = !extraHours ? 0 : extraHours;
      let baseSalary: number = this.formPayrollWorker.value.baseSalary;
      let valueDay: number = baseSalary / 30;
      let valueHour: number = valueDay / 8;
      let total: number = (valueHour * 2) * extraHours;
      let i: number = this.payroll.findIndex(x => x.idWorker == worker);
      this.payroll[i].extraHoursDaytimeSunday = extraHours;
      this.payroll[i].valueExtraHoursDaytimeSunday = total;
      this.payroll[i].totalValueAdictionalFee = this.totalFee(this.payroll[i]);
      this.payroll[i].accrued = this.totalAccrued(this.payroll[i]);
      this.payroll[i].subTotalToPay = this.totalAccrued(this.payroll[i]) - this.totalDiscounts(this.payroll[i]);
      this.formPayrollWorker.patchValue({
        extraHoursDaytimeSunday: extraHours,
        valueExtraHoursDaytimeSunday: total,
        totalValueAdictionalFee: this.totalFee(this.payroll[i]),
        accrued: this.totalAccrued(this.payroll[i]),
        subTotalToPay: this.payroll[i].subTotalToPay,
      });
    }, 500);
  }

  calculateValueSurchagedHours035() {
    setTimeout(() => {
      let worker: any = this.formPayrollWorker.value.idWorker;
      let extraHours: number = this.formPayrollWorker.value.surchagedHours035;
      extraHours = !extraHours ? 0 : extraHours;
      let baseSalary: number = this.formPayrollWorker.value.baseSalary;
      let valueDay: number = baseSalary / 30;
      let valueHour: number = valueDay / 8;
      let total: number = (valueHour * 0.35) * extraHours;
      let i: number = this.payroll.findIndex(x => x.idWorker == worker);
      this.payroll[i].surchagedHours035 = extraHours;
      this.payroll[i].valueSurchagedHours035 = total;
      this.payroll[i].totalValueAdictionalFee = this.totalFee(this.payroll[i]);
      this.payroll[i].accrued = this.totalAccrued(this.payroll[i]);
      this.payroll[i].subTotalToPay = this.totalAccrued(this.payroll[i]) - this.totalDiscounts(this.payroll[i]);
      this.formPayrollWorker.patchValue({
        surchagedHours035: extraHours,
        valueSurchagedHours035: total,
        totalValueAdictionalFee: this.totalFee(this.payroll[i]),
        accrued: this.totalAccrued(this.payroll[i]),
        subTotalToPay: this.payroll[i].subTotalToPay,
      });
    }, 500);
  }

  calculateValueExtraHoursNightSunday() {
    setTimeout(() => {
      let worker: any = this.formPayrollWorker.value.idWorker;
      let extraHours: number = this.formPayrollWorker.value.extraHoursNightSunday;
      extraHours = !extraHours ? 0 : extraHours;
      let baseSalary: number = this.formPayrollWorker.value.baseSalary;
      let valueDay: number = baseSalary / 30;
      let valueHour: number = valueDay / 8;
      let total: number = (valueHour * 2.5) * extraHours;
      let i: number = this.payroll.findIndex(x => x.idWorker == worker);
      this.payroll[i].extraHoursNightSunday = extraHours;
      this.payroll[i].valueExtraHoursNightSunday = total;
      this.payroll[i].totalValueAdictionalFee = this.totalFee(this.payroll[i]);
      this.payroll[i].accrued = this.totalAccrued(this.payroll[i]);
      this.payroll[i].subTotalToPay = this.totalAccrued(this.payroll[i]) - this.totalDiscounts(this.payroll[i]);
      this.formPayrollWorker.patchValue({
        extraHoursNightSunday: extraHours,
        valueExtraHoursNightSunday: total,
        totalValueAdictionalFee: this.totalFee(this.payroll[i]),
        accrued: this.totalAccrued(this.payroll[i]),
        subTotalToPay: this.payroll[i].subTotalToPay,
      });
    }, 500);
  }

  calculateValueSurchagedHours075() {
    setTimeout(() => {
      let worker: any = this.formPayrollWorker.value.idWorker;
      let extraHours: number = this.formPayrollWorker.value.surchagedHours075;
      extraHours = !extraHours ? 0 : extraHours;
      let baseSalary: number = this.formPayrollWorker.value.baseSalary;
      let valueDay: number = baseSalary / 30;
      let valueHour: number = valueDay / 8;
      let total: number = (valueHour * 2.5) * extraHours;
      let i: number = this.payroll.findIndex(x => x.idWorker == worker);
      this.payroll[i].surchagedHours075 = extraHours;
      this.payroll[i].valueSurchagedHours075 = total;
      this.payroll[i].totalValueAdictionalFee = this.totalFee(this.payroll[i]);
      this.payroll[i].accrued = this.totalAccrued(this.payroll[i]);
      this.payroll[i].subTotalToPay = this.totalAccrued(this.payroll[i]) - this.totalDiscounts(this.payroll[i]);
      this.formPayrollWorker.patchValue({
        surchagedHours075: extraHours,
        valueSurchagedHours075: total,
        totalValueAdictionalFee: this.totalFee(this.payroll[i]),
        accrued: this.totalAccrued(this.payroll[i]),
        subTotalToPay: this.payroll[i].subTotalToPay,
      });
    }, 500);
  }

  calculateValueSurchagedHours100() {
    setTimeout(() => {
      let worker: any = this.formPayrollWorker.value.idWorker;
      let extraHours: number = this.formPayrollWorker.value.surchagedHours100;
      extraHours = !extraHours ? 0 : extraHours;
      let baseSalary: number = this.formPayrollWorker.value.baseSalary;
      let valueDay: number = baseSalary / 30;
      let valueHour: number = valueDay / 8;
      let total: number = (valueHour * 2.5) * extraHours;
      let i: number = this.payroll.findIndex(x => x.idWorker == worker);
      this.payroll[i].surchagedHours100 = extraHours;
      this.payroll[i].valueSurchagedHours100 = total;
      this.payroll[i].totalValueAdictionalFee = this.totalFee(this.payroll[i]);
      this.payroll[i].accrued = this.totalAccrued(this.payroll[i]);
      this.payroll[i].subTotalToPay = this.totalAccrued(this.payroll[i]) - this.totalDiscounts(this.payroll[i]);
      this.formPayrollWorker.patchValue({
        surchagedHours100: extraHours,
        valueSurchagedHours100: total,
        totalValueAdictionalFee: this.totalFee(this.payroll[i]),
        accrued: this.totalAccrued(this.payroll[i]),
        subTotalToPay: this.payroll[i].subTotalToPay,
      });
    }, 500);
  }

  calculateAdictionalFee() {
    setTimeout(() => {
      let worker: any = this.formPayrollWorker.value.idWorker;
      let adictionalFee: number = this.formPayrollWorker.value.adictionalFee;
      adictionalFee = !adictionalFee ? 0 : adictionalFee;
      let i: number = this.payroll.findIndex(x => x.idWorker == worker);
      this.payroll[i].adictionalFee = adictionalFee;
      this.payroll[i].totalValueAdictionalFee = this.totalFee(this.payroll[i]);
      this.payroll[i].accrued = this.totalAccrued(this.payroll[i]);
      this.payroll[i].subTotalToPay = this.totalAccrued(this.payroll[i]) - this.totalDiscounts(this.payroll[i]);
      this.formPayrollWorker.patchValue({
        adictionalFee: adictionalFee,
        totalValueAdictionalFee: this.totalFee(this.payroll[i]),
        accrued: this.totalAccrued(this.payroll[i]),
        subTotalToPay: this.payroll[i].subTotalToPay,
      });
    }, 500);
  }

  calculatePagoPTESemanaAnt() {
    setTimeout(() => {
      let worker: any = this.formPayrollWorker.value.idWorker;
      let pagoPTESemanaAnt: number = this.formPayrollWorker.value.PagoPTESemanaAnt;
      pagoPTESemanaAnt = !pagoPTESemanaAnt ? 0 : pagoPTESemanaAnt;
      let i: number = this.payroll.findIndex(x => x.idWorker == worker);
      this.payroll[i].PagoPTESemanaAnt = pagoPTESemanaAnt;
      this.payroll[i].subTotalToPay = this.totalAccrued(this.payroll[i]) - this.totalDiscounts(this.payroll[i]) + pagoPTESemanaAnt;
      this.formPayrollWorker.patchValue({
        PagoPTESemanaAnt: pagoPTESemanaAnt,
        deductions: this.totalDiscounts(this.payroll[i]),
        subTotalToPay: this.payroll[i].subTotalToPay,
      });
    }, 500);
  }

  calculatediscounts() {
    setTimeout(() => {
      let worker: any = this.formPayrollWorker.value.idWorker;
      let discounts: number = this.formPayrollWorker.value.discounts;
      discounts = !discounts ? 0 : discounts;
      let i: number = this.payroll.findIndex(x => x.idWorker == worker);
      this.payroll[i].discounts = discounts;
      this.payroll[i].subTotalToPay = this.totalAccrued(this.payroll[i]) - this.totalDiscounts(this.payroll[i]);
      this.formPayrollWorker.patchValue({
        discounts: discounts,
        deductions: this.totalDiscounts(this.payroll[i]),
        subTotalToPay: this.payroll[i].subTotalToPay,
      });
    }, 500);
  }

  fillObservationPayrollByWorker() {
    setTimeout(() => {
      let worker: any = this.formPayrollWorker.value.idWorker;
      let news: string = this.formPayrollWorker.value.news;
      let i: number = this.payroll.findIndex(x => x.idWorker == worker);
      this.payroll[i].news = news;
    }, 500);
  }

  totalDisabilityByWorker(data: Payroll): number {
    let total: number = 0;
    total = data.valueDaysDisabilityGeneralIllines + data.valueDaysDisabilityParents + data.valueDaysDisabilityWorkAccident;
    return total;
  }

  totalLoanAdvance(data: Payroll) {
    let total: number = 0;
    total = data.loan + data.advance;
    return total;
  }

  totalFee(data: Payroll): number {
    let total: number = 0;
    total = data.valueAdictionalDaytimeHours + data.valueAdictionalNightHours +
      data.valueExtraHoursDaytimeSunday + data.valueSurchagedHours035 + data.valueExtraHoursNightSunday +
      data.valueSurchagedHours075 + data.valueSurchagedHours100 + data.adictionalFee;
    return total;
  }

  totalAccrued(data: Payroll): number {
    let total: number = 0;
    total = data.valueDaysToPay + data.valueDaysDisabilityGeneralIllines +
      data.valueDaysDisabilityWorkAccident + data.valueDaysDisabilityParents +
      data.valueAdictionalDaytimeHours + data.totalValueAdictionalFee +
      ((data.transpotationAssitance / 30) * data.daysToPay);
    return total;
  }

  totalDiscounts(data: any): number {
    let total: number = 0;
    total = data.eps + data.afp + data.saving + data.loan + data.advance + data.discounts;
    return total;
  }

  editPayrollByWorker(data: Payroll) {
    this.modalPayroll = true;
    this.formPayrollWorker.patchValue(data);
    this.formPayrollWorker.patchValue({ transpotationAssitance: ((data.transpotationAssitance / 30) * data.daysToPay) });
  }

  showDetailsDisabilities() {
    let worker: number = this.formPayrollWorker.value.idWorker;
    this.detailsDisabilities = this.payroll.find(x => x.idWorker == worker).detailsDisability;
    this.modalDataDisability = true;
  }

  totalDaysDisability(): number {
    return this.detailsDisabilities.reduce((a, b) => a + b.totalDays, 0);
  }

  totalPayDisabilitiInPayroll(): number {
    return this.detailsDisabilities.reduce((a, b) => a + b.totalToPayThisPayroll, 0);
  }

  totalPayDisabilitiesInPreviusPayrolls(): number {
    return this.detailsDisabilities.reduce((a, b) => a + b.totalToPayPreviusPayrolls, 0);
  }

  totalPayDisabilitisInNextPayrolls(): number {
    return this.detailsDisabilities.reduce((a, b) => a + b.totalToPayNextPayroll, 0);
  }

  totalPayDisabilities(): number {
    return this.detailsDisabilities.reduce((a, b) => a + b.totalToPay, 0);
  }

  showDetailsLoan() {
    let worker: number = this.formPayrollWorker.value.idWorker;
    this.detailsLoan = this.payroll.find(x => x.idWorker == worker).detailsLoans;
    this.modalDataLoan = true;
  }

  subTotalLoan(): number {
    let total: number = this.detailsLoan.reduce((a, b) => a + b.totalLoan, 0);
    return total;
  }

  subTotalDebtValue(): number {
    let total: number = this.detailsLoan.reduce((a, b) => a + b.debtValue, 0);
    return total;
  }

  subTotalTotalPay(): number {
    let total: number = this.detailsLoan.reduce((a, b) => a + b.totalPay, 0);
    return total;
  }

  subTotalValueQuota(): number {
    let total: number = this.detailsLoan.reduce((a, b) => a + b.valueQuota, 0);
    return total;
  }

  showDetailsMoneySave() {
    let worker: number = this.formPayrollWorker.value.idWorker;
    this.detailsSaving = this.payroll.find(x => x.idWorker == worker).detailsMoneySave;
    this.modalDataSaving = true;
  }

  showDetailsAdvance() {
    let worker: number = this.formPayrollWorker.value.idWorker;
    this.detailsAdvances = this.payroll.find(x => x.idWorker == worker).detailsAdvance;
    this.modalDataAdvance = true;
  }

  validatePayroll() {
    if (this.payroll.length > 0) {
      this.savePayroll();
      this.savePayrollForAdvance();
    } else this.msj.mensajeAdvertencia('No hay trabajadores para procesar la nómina');
  }

  savePayroll() {
    this.load = true;
    let count: number = 0;
    this.payroll.filter(x => !this.payrollForAdvance.map(y => y.idWorker).includes(x.idWorker)).forEach(d => {
      let payroll: DataPayroll = this.fillDataPayroll(d.idWorker, 1);
      this.payrollService.Post(payroll).subscribe(() => {
        count++;
        if (count == this.payroll.length) {
          this.changeStateLoan();
          this.changeStatePayroll();
          this.changeValueMoveySave();
          this.createMovementsPayroll();
        }
      }, error => {
        this.load = false;
        this.msj.errorHttp(`¡Ocurrió un error al procesar la nómina del trabajador ${d.worker}!`, error);
      });
    });
  }

  savePayrollForAdvance() {
    let count: number = 0;
    this.payroll.filter(x => this.payrollForAdvance.map(y => y.idWorker).includes(x.idWorker)).forEach(d => {
      let payroll: DataPayroll = this.fillDataPayroll(d.idWorker, 4);
      this.payrollService.Post(payroll).subscribe(() => {
        count++;
        if (count == this.payroll.length) {
          this.createMovementsPayroll();
          this.successPayroll();
        }
      }, error => {
        this.load = false;
        this.msj.errorHttp(`¡Ocurrió un error al procesar la nómina del trabajador ${d.worker}!`, error);
      });
    });
  }

  fillDataPayroll(worker: number, typePayroll: 1 | 2 | 3 | 4): DataPayroll {
    let data = this.payroll.find(x => x.idWorker == worker);
    let payroll: DataPayroll = {
      id_Trabajador: data.idWorker,
      salarioBase: data.baseSalary,
      periodoInicio: data.startDate,
      periodoFin: data.endDate,
      diasAusente: data.absentDays,
      diasPagar: data.daysToPay,
      horasPagar: data.hoursToPay,
      valorDiasPagar: data.valueDaysToPay,
      diasIncapEG: data.daysDisabilityGeneralIllines,
      valorIncapEG: data.valueDaysDisabilityGeneralIllines,
      diasIncapAT: data.daysDisabilityWorkAccident,
      valorIncapAT: data.valueDaysDisabilityWorkAccident,
      diasIncapPATMAT: data.daysDisabilityParents,
      valorIncapPATMAT: data.valueDaysDisabilityParents,
      horasADCDiurnas: data.adictionalDaytimeHours,
      valorADCDiurnas: data.valueAdictionalDaytimeHours,
      horasNoctDom: data.adictionalNightHours,
      valorNoctDom: data.valueAdictionalNightHours,
      horasExtDiurnasDom: data.extraHoursDaytimeSunday,
      valorExtDiurnasDom: data.valueExtraHoursDaytimeSunday,
      horasRecargo035: data.surchagedHours035,
      valorRecargo035: data.valueSurchagedHours035,
      horasExtNocturnasDom: data.extraHoursNightSunday,
      valorExtNocturnasDom: data.valueExtraHoursNightSunday,
      horasRecargo075: data.surchagedHours075,
      valorRecargo075: data.valueSurchagedHours075,
      horasRecargo100: data.surchagedHours100,
      valorRecargo100: data.valueSurchagedHours100,
      tarifaADC: data.adictionalFee,
      valorTotalADCComp: data.totalValueAdictionalFee,
      auxTransporte: data.transpotationAssitance,
      productividadSella: 0,
      productividadExt: 0,
      productividadMontaje: 0,
      devengado: data.accrued,
      eps: data.eps,
      afp: data.afp,
      ahorro: data.saving,
      prestamo: data.loan,
      anticipo: data.advance,
      totalDcto: data.totalDiscounts,
      pagoPTESemanaAnt: data.PagoPTESemanaAnt,
      dctos: data.discounts,
      deducciones: data.deductions,
      totalPagar: data.subTotalToPay,
      novedades: data.news,
      tipoNomina: typePayroll,
      estado_Nomina: typePayroll == 4 ? 11 : 13,
      creador_Id: this.storage_Id,
      fecha: new Date(),
      hora: moment().format('HH:mm:ss')
    };
    return payroll;
  }

  changeStatePayroll() {
    let payroll: Array<AdvancePayroll> = this.fillDataPayrollForChangeState();
    this.payrollService.PutChangeState(payroll).subscribe(null, error => {
      this.load = false;
      this.msj.errorHttp(`¡Ocurrió un error al procesar la nómina!`, error);
    });
  }

  fillDataPayrollForChangeState(): Array<AdvancePayroll> {
    let payroll: Array<AdvancePayroll> = [];
    this.payroll.forEach(d => {
      d.detailsAdvance.forEach(x => {
        payroll.push({
          id: x.idAdvance,
          idWorker: d.idWorker,
        });
      });
    });
    return payroll;
  }

  changeStateLoan() {
    let payment: Array<PaymentLoan> = this.selectAllPayments();
    this.loanService.AddPaymentLoan(payment).subscribe(null, error => {
      this.load = false;
      this.msj.errorHttp(`¡Ocurrió un error al procesar los pagos de los prestamos!`, error);
    });
  }

  selectAllPayments(): Array<PaymentLoan> {
    let payment: Array<PaymentLoan> = [];
    this.payroll.forEach(d => {
      d.detailsLoans.forEach(x => {
        payment.push({
          idLoan: x.idLoan,
          valuePay: x.valueQuota,
        });
      });
    });
    return payment;
  }

  successPayroll() {
    this.clearAll();
    this.msj.mensajeConfirmacion('¡Nómina procesada correctamente!');
  }

  createMovementsPayroll() {
    let movements: Array<Movimientos_Nomina> = this.fillMovementsPayroll();
    if (movements.length == 0) this.successPayroll();
    movements.forEach(x => {
      this.movementsPayrollService.Post(x).subscribe(() => this.successPayroll(), (error: HttpErrorResponse) => {
        this.load = false;
        let msg: string = error.status == 400 ? error.error : `¡Ocurrió un error al procesar los movimientos de la nómina!`;
        this.msj.errorHttp(msg, error);
      });
    });
  }

  fillMovementsPayroll(): Array<Movimientos_Nomina> {
    let movements: Array<Movimientos_Nomina> = [];
    this.payroll.forEach(d => {
      movements = [movements,
        this.fillMovementsAdvance(d.idWorker, d.detailsAdvance),
        this.fillMovementsLoanByWorker(d.idWorker, d.detailsLoans),
        this.fillMovementsDisabilities(d.idWorker, d.detailsDisability),
        this.fillMovementsSaveMoney(d.idWorker, d.detailsMoneySave)].reduce((a, b) => a.concat(b));
    });
    return movements;
  }

  fillMovementsLoanByWorker(idWorker: number, detailsDisability: Array<any>) {
    let movements: Array<Movimientos_Nomina> = [];
    if (detailsDisability.length == 0) return [];
    detailsDisability.forEach(d => {
      movements.push({
        trabajador_Id: idWorker,
        codigoMovimento: d.idLoan,
        nombreMovimento: 'PRESTAMO',
        valorTotal: d.totalLoan,
        valorDeuda: 0,
        valorPagado: 0,
        valorAbonado: d.valueQuota,
        valorFinalDeuda: 0,
        fecha: moment().format('YYYY-MM-DD'),
        hora: moment().format('HH:mm:ss'),
        observacaion: '',
        estado_Id: 11,
        creador_Id: this.storage_Id
      });
    });
    return movements;
  }

  fillMovementsDisabilities(idWorker: number, detailsLoan: Array<Disability>) {
    let movements: Array<Movimientos_Nomina> = [];
    if (detailsLoan.length == 0) return [];
    detailsLoan.forEach(d => {
      movements.push({
        trabajador_Id: idWorker,
        codigoMovimento: d.idDisability,
        nombreMovimento: 'INCAPACIDAD',
        valorTotal: d.totalToPay,
        valorDeuda: 0,
        valorPagado: 0,
        valorAbonado: d.totalToPayThisPayroll,
        valorFinalDeuda: 0,
        fecha: moment().format('YYYY-MM-DD'),
        hora: moment().format('HH:mm:ss'),
        observacaion: '',
        estado_Id: 11,
        creador_Id: this.storage_Id
      });
    });
    return movements;
  }

  fillMovementsAdvance(idWorker: number, detailsAdvance: Array<any>) {
    let movements: Array<Movimientos_Nomina> = [];
    if (detailsAdvance.length == 0) return [];
    detailsAdvance.forEach(d => {
      movements.push({
        trabajador_Id: idWorker,
        codigoMovimento: d.idAdvance,
        nombreMovimento: 'ANTICIPO',
        valorTotal: d.valueAdvance,
        valorDeuda: 0,
        valorPagado: 0,
        valorAbonado: d.valueAdvance,
        valorFinalDeuda: 0,
        fecha: moment().format('YYYY-MM-DD'),
        hora: moment().format('HH:mm:ss'),
        observacaion: '',
        estado_Id: 11,
        creador_Id: this.storage_Id
      });
    });
    return movements;
  }

  fillMovementsSaveMoney(idWorker: number, detailsSaveMoney: Array<any>) {
    let movements: Array<Movimientos_Nomina> = [];
    if (detailsSaveMoney.length == 0) return [];
    movements.push({
      trabajador_Id: idWorker,
      codigoMovimento: detailsSaveMoney[0].idSaveMoney,
      nombreMovimento: 'AHORRO',
      valorTotal: 0,
      valorDeuda: 0,
      valorPagado: 0,
      valorAbonado: detailsSaveMoney[0].totalSaveInPayroll,
      valorFinalDeuda: 0,
      fecha: moment().format('YYYY-MM-DD'),
      hora: moment().format('HH:mm:ss'),
      observacaion: '',
      estado_Id: 13,
      creador_Id: this.storage_Id
    });
    return movements;
  }

  changeValueMoveySave() {
    let dataMoneySave: Array<DataMoneySave> = this.fillValuesMoneySave();
    this.salaryWorkersService.PutMoneySave(dataMoneySave).subscribe(null, error => {
      this.msj.errorHttp(`¡Ocurrió un error al guardar el ahorro de cada operario!`, error);
      this.load = false;
    });
  }

  fillValuesMoneySave() {
    let dataMoneySave: Array<DataMoneySave> = [];
    this.payroll.forEach(d => {
      dataMoneySave.push({
        idWorker: d.idWorker,
        value: d.saving,
      })
    });
    return dataMoneySave;
  }
}

interface Payroll {
  idWorker: number;
  worker: string;
  baseSalary: number;
  startDate: any;
  endDate: any;
  absentDays: number;
  daysToPay: number;
  hoursToPay: number;
  valueDaysToPay: number;
  detailsDisability: Array<Disability>;
  daysDisabilityGeneralIllines: number;
  valueDaysDisabilityGeneralIllines: number;
  daysDisabilityWorkAccident: number;
  valueDaysDisabilityWorkAccident: number;
  daysDisabilityParents: number;
  valueDaysDisabilityParents: number;
  adictionalDaytimeHours: number;
  valueAdictionalDaytimeHours: number;
  adictionalNightHours: number;
  valueAdictionalNightHours: number;
  extraHoursDaytimeSunday: number;
  valueExtraHoursDaytimeSunday: number;
  surchagedHours035: number;
  valueSurchagedHours035: number;
  extraHoursNightSunday: number;
  valueExtraHoursNightSunday: number;
  surchagedHours075: number;
  valueSurchagedHours075: number;
  surchagedHours100: number;
  valueSurchagedHours100: number;
  adictionalFee: number;
  totalValueAdictionalFee: number;
  transpotationAssitance: number;
  productivitySella: number;
  productivityExt: number;
  productivityMntj: number;
  accrued: number;
  eps: number;
  afp: number;
  saving: number;
  detailsMoneySave: Array<Saving>;
  loan: number;
  detailsLoans: Array<Loan>;
  advance: number;
  detailsAdvance: Array<Advance>;
  totalDiscounts: number;
  PagoPTESemanaAnt: number;
  discounts: number;
  deductions: number;
  subTotalToPay: number;
  news: string;
}

interface Disability {
  idDisability: number;
  worker: string;
  baseSalary: number;
  valueDay: number;
  idTypeDisability: number;
  typeDisanility: string;
  startDate: any;
  endDate: any;
  totalDays: number;
  totalToPayThisPayroll: number;
  totalToPayPreviusPayrolls: number;
  totalToPayNextPayroll: number;
  totalToPay: number;
  observation: string | null;
}

interface Loan {
  worker: string;
  idLoan: number;
  date: any;
  totalLoan: number;
  debtValue: number;
  totalPay: number;
  valueQuota: number;
  percentageQuota: number;
  finalDate: any;
  lastPay: any;
}

interface Advance {
  idAdvance: number;
  worker: string;
  startDate: any;
  endDate: any;
  valueAdvance: number;
}

interface Saving {
  worker: string;
  startPayroll: any;
  endPayroll: any;
  totalSaveInPayroll: number;
  subTotalSaveMoney: number;
}
