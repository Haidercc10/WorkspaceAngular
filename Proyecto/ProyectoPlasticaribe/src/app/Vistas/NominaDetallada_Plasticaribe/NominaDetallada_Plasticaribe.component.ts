import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ex } from '@fullcalendar/core/internal-common';
import moment from 'moment';
import { Table } from 'primeng/table';
import { AreaService } from 'src/app/Servicios/Areas/area.service';
import { IncapacidadesService } from 'src/app/Servicios/Incapacidades/Incapacidades.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { Prestamos_NominaService } from 'src/app/Servicios/Prestamos_Nomina/Prestamos_Nomina.service';
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
  modalDataDisanility: boolean = false;
  modalDataLoan: boolean = false;
  modalDataAdvance: boolean = false;
  modalDataSaving: boolean = false;

  constructor(private frmBuilder: FormBuilder,
    private appComponent: AppComponent,
    private userService: UsuarioService,
    private areaService: AreaService,
    private msj: MensajesAplicacionService,) {
  }

  ngOnInit() {
    this.readStorage();
    this.initFormPayroll();
    this.getArea();
    this.getDisableDates();
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
        this.userService.GetWorkers(start, end, areas).subscribe(data => this.calculatePayroll(data));
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
        transpotationAssitance: (d.transportAsistance / 30) * daysToPay,
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
      if (count == this.payroll.length) this.load = false;
    });
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

  diffDaysDisability(d: any): {} {
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
      if (totalDaysToPay >= 0 && absentDays != null) {
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
          // transpotationAssitance: totalDaysToPay,
          accrued: this.totalAccrued(this.payroll[i]),
          subTotalToPay: this.payroll[i].subTotalToPay,
        });
      } else {
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
          subTotalToPay: this.payroll[i].subTotalToPay,
        });
      }
    }, 500);
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
    total = data.valueDaysToPay + data.valueDaysDisabilityGeneralIllines + data.valueDaysDisabilityWorkAccident + data.valueDaysDisabilityParents + data.valueAdictionalDaytimeHours + data.totalValueAdictionalFee + data.transpotationAssitance;
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
  }

  showDetailsDisabilities() {
    let worker: number = this.formPayrollWorker.value.idWorker;
    this.detailsDisabilities = this.payroll.find(x => x.idWorker == worker).detailsDisability;
    this.modalDataDisanility = true;
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
    this.detailsSaving = this.payroll.find(x => x.idWorker == worker).detailsMoneySave;
    this.modalDataSaving = true;
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