import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ShepherdService } from 'angular-shepherd';
import moment from 'moment';
import { Table } from 'primeng/table';
import { modelNominaPlasticaribe } from 'src/app/Modelo/modelNominaPlasticaribe';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { CreacionExcelService } from 'src/app/Servicios/CreacionExcel/CreacionExcel.service';
import { CreacionPdfService } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { Nomina_PlasticaribeService } from 'src/app/Servicios/Nomina_Plasticaribe/Nomina_Plasticaribe.service';
import { Tipos_NominaService } from 'src/app/Servicios/Tipos_Nomina/Tipos_Nomina.service';
import { AppComponent } from 'src/app/app.component';
import { defaultStepOptions, stepsNomina as defaultSteps } from 'src/app/data';

@Component({
  selector: 'app-Nomina',
  templateUrl: './Nomina.component.html',
  styleUrls: ['./Nomina.component.css']
})

export class NominaComponent implements OnInit {

  FormEdicionMateriaPrima !: FormGroup;

  @ViewChild('dt') dt: Table | undefined;
  @ViewChild('dtDespacho') dtDespacho: Table | undefined;
  @ViewChild('dtDetallada') dtDetallada: Table | undefined;
  storage_Id: number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre: any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol: any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol: number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  today: any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  load: boolean = true; //Variable que validará cuando vaya a salir la animacion de carga
  modoSeleccionado: boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  rangoFechas: any[] = []; /** Array que almacenará el rango de fechas */
  arraySellado: any = []; /** Array que cargará la información de la nomina de los operarios de sellado */
  nominaDespacho: any[] = []; /** Array que cargará la información de la nomina de los operarios de despacho */
  totalNominaSellado: number = 0; /** Variable que contendrá el valor total de la nomina de sellado */
  modalSellado: boolean = false; /** Variable que contendrá el valor total de la nomina de sellado */
  operario: any = ''; /** Variable que cargará el ID y nombre del operario en cualquiera de los modales. */
  detallesNomina: any[] = []; //Variable que almacenará la información detallada de los rollos pesados o ingresados de un producto y persona en especifico
  detalladoxBultos: any[] = []; /** Variable que cargará en el formato excel la nomina detallada por bultos para cada operario */
  nominaIngresada: any[] = []; /** Variable que almacenará la información de la nomina de ingresos */
  tiposNomina: any[] = []; /** Variable que almacenará la información de los tipos de nomina */

  constructor(private AppComponent: AppComponent,
    private servicioBagPro: BagproService,
    private msj: MensajesAplicacionService,
    private shepherdService: ShepherdService,
    private nominaService: Nomina_PlasticaribeService,
    private tpNominaService: Tipos_NominaService,
    private createExcelService: CreacionExcelService,
    private createPdfService: CreacionPdfService,) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
  }

  ngOnInit() {
    this.lecturaStorage();
    this.obtenerTiposNominas();
    setInterval(() => this.modoSeleccionado = this.AppComponent.temaSeleccionado, 1000);
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage() {
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  /** Función que mostrará un tutorial en la app. */
  verTutorial() {
    this.shepherdService.defaultStepOptions = defaultStepOptions;
    this.shepherdService.modal = true;
    this.shepherdService.confirmCancel = false;
    this.shepherdService.addSteps(defaultSteps);
    this.shepherdService.start();
  }

  // Funcion que devolverá los diferentes tipos de nominas
  obtenerTiposNominas = () => this.tpNominaService.Get().subscribe(data => this.tiposNomina = data);

  // Consultar nomina ingresada al programa
  consultarNominaIngresada() {
    this.nominaIngresada = [];
    let fechaInicial: any = this.rangoFechas.length > 0 ? moment(this.rangoFechas[0]).format('YYYY-MM-DD') : this.today;
    let fechaFinal: any = this.rangoFechas.length > 0 ? moment(this.rangoFechas[1]).format('YYYY-MM-DD') : fechaInicial;
    this.nominaService.GetNominaIngresada(fechaInicial, fechaFinal).subscribe(data => this.nominaIngresada = data);
    setTimeout(() => {
      if (this.nominaIngresada.length > 0) {
        this.nominaIngresada.forEach(nomina => {
          nomina.fechaInicio = nomina.fechaInicio.replace('T00:00:00', '');
          nomina.fechaFin = nomina.fechaFin.replace('T00:00:00', '');
        });
      }
    }, 1500);
  }

  // Funcion que va a calcular el total de la nomina ingresada 
  calcularTotalNominaIngresada = (): number => this.nominaIngresada.reduce((a, b) => a + b.valorNomina, 0);

  //Actualizará la información de la nomina ingresada
  actualizarNominaIngresada(data: any) {
    this.nominaService.Get_Id(data.id).subscribe(datos => {
      this.load = false;
      let tipoNomina_Id = this.tiposNomina.filter(x => x.tpNomina_Nombre === data.tipoNomina)[0].tpNomina_Id;
      let modelo: modelNominaPlasticaribe = {
        Nomina_Id: data.id,
        Nomina_FechaRegistro: datos.nomina_FechaRegistro,
        Nomina_HoraRegistro: datos.nomina_HoraRegistro,
        Usua_Id: datos.usua_Id,
        Nomina_FechaIncial: data.fechaInicio,
        Nomina_FechaFinal: data.fechaFin,
        Nomina_Costo: data.valorNomina,
        TpNomina_Id: tipoNomina_Id,
        Nomina_Observacion: (data.observacion).toString().toUpperCase(),
      }
      this.nominaService.Put(data.id, modelo).subscribe(() => {
        this.consultarNominaIngresada();
        this.msj.mensajeConfirmacion(`¡Se actualizó la nomina con éxito!`);
        this.load = true;
      }, () => this.msj.mensajeError(`¡No se pudo actualizar la nomina!`));
    }, () => this.msj.mensajeError(`¡No se encontró el registro de la nomina a actualizar!`));
  }

  /** Función para consultar las nomina de sellado */
  consultarNominas() {
    if ([1, 65].includes(this.ValidarRol)) this.consultarNominaIngresada();
    this.consultarNominasIngresosDespacho();
    this.load = false;
    this.totalNominaSellado = 0;
    this.arraySellado = [];
    let cedulas: any = [];
    let fechaInicial: any = this.rangoFechas.length > 0 ? moment(this.rangoFechas[0]).format('YYYY-MM-DD') : this.today;
    let fechaFinal: any = this.rangoFechas.length > 0 ? moment(this.rangoFechas[1]).format('YYYY-MM-DD') : fechaInicial;

    this.servicioBagPro.GetNominaSelladoAcumuladaItem(fechaInicial, fechaFinal).subscribe(data => {
      for (let index = 0; index < data.length; index++) {
        let info: any = JSON.parse(`{${data[index].replaceAll("'", '"')}}`);

        if (!cedulas.includes(info.Cedula)) {
          info.Cedula = info.Cedula,
            info.Operario = info.Operario,
            info.Cargo = 'Operario Sellado',
            info.PagoTotal = 0
          info.detalle = [];

          cedulas.push(info.Cedula);
          this.arraySellado.push(info);
          this.arraySellado.sort((a, b) => Number(a.Cedula) - Number(b.Cedula));
        }
      }
      setTimeout(() => this.cargarTabla2(data), 1500);
    }, () => this.msj.mensajeAdvertencia(`Advertencia`, `No se encontraron registros en las fechas consultadas`));
  }

  /** Función para cargar la tabla de Nómina detallada y calcular el valor total a pagar para cada operario*/
  cargarTabla2(data: any) {
    let array: any = [];
    this.totalNominaSellado = 0;
    let count: number = 0;

    for (let index = 0; index < data.length; index++) {
      let info: any = JSON.parse(`{${data[index].replaceAll("'", '"')}}`);
      info.Cedula = info.Cedula,
      info.Operario = info.Operario,
      info.Cargo = 'Operario Sellado',
      info.PagoTotal = parseFloat(info.PagoTotal.toString().replace(',', '.')),
      info.Cantidad = parseFloat(info.Cantidad.toString().replace(',', '.')),
      info.CantidadTotal = parseFloat(info.CantidadTotal.toString().replace(',', '.')),
      info.PrecioDia = parseFloat(info.PrecioDia.toString().replace(',', '.')),
      info.PrecioNoche = parseFloat(info.PrecioNoche.toString().replace(',', '.')),
      info.detalle = [];


      array = this.arraySellado.findIndex(item => item.Cedula == info.Cedula);
      
      if (array >= 0) {
        this.arraySellado[array].detalle.push(info);
        this.arraySellado[array].PagoTotal += parseFloat(info.PagoTotal);
      }
      count++;
      if (count == data.length) this.load = true;
    }
  }

  consultarNominasIngresosDespacho() {
    this.load = false;
    this.totalNominaSellado = 0;
    this.nominaDespacho = [];
    let cedulas: any = [];
    let fechaInicial: any = this.rangoFechas.length > 0 ? moment(this.rangoFechas[0]).format('YYYY-MM-DD') : this.today;
    let fechaFinal: any = this.rangoFechas.length > 0 ? moment(this.rangoFechas[1]).format('YYYY-MM-DD') : fechaInicial;

    this.servicioBagPro.GetNominaSelladoDespachoAcumuladaItem(fechaInicial, fechaFinal).subscribe(data => {
      for (let index = 0; index < data.length; index++) {
        let info: any = JSON.parse(`{${data[index].replaceAll("'", '"')}}`);

        if (!cedulas.includes(info.Cedula)) {
          info.Cedula = info.Cedula,
            info.Operario = info.Operario,
            info.Cargo = 'Operario Sellado',
            info.PagoTotal = 0
          info.detalle = [];

          cedulas.push(info.Cedula);
          this.nominaDespacho.push(info);
          this.nominaDespacho.sort((a, b) => Number(a.Cedula) - Number(b.Cedula));
        }
      }
      setTimeout(() => this.llenarDatosAdicionalesNominaDespacho(data), 1500);
    }, () => this.msj.mensajeAdvertencia(`Advertencia`, `No se encontraron registros en las fechas consultadas`));
  }

  llenarDatosAdicionalesNominaDespacho(data: any) {
    let array: any = [];
    this.totalNominaSellado = 0;
    let count: number = 0;

    for (let index = 0; index < data.length; index++) {
      let info: any = JSON.parse(`{${data[index].replaceAll("'", '"')}}`);
      info.Cedula = info.Cedula,
        info.Operario = info.Operario,
        info.Cargo = 'Operario Sellado',
        info.PagoTotal = parseFloat(info.PagoTotal.toString().replace(',', '.')),
        info.Cantidad = parseFloat(info.Cantidad.toString().replace(',', '.')),
        info.CantidadTotal = parseFloat(info.CantidadTotal.toString().replace(',', '.')),
        info.PrecioDia = parseFloat(info.PrecioDia.toString().replace(',', '.')),
        info.PrecioNoche = parseFloat(info.PrecioNoche.toString().replace(',', '.')),
        info.detalle = [];

      array = this.nominaDespacho.findIndex(item => item.Cedula == info.Cedula);
      if (array >= 0) {
        this.nominaDespacho[array].detalle.push(info);
        this.nominaDespacho[array].PagoTotal += parseFloat(info.PagoTotal);
      }
      count++;
      if (count == data.length) this.load = true;
    }
  }

  /** Funcion para filtrar busquedas y mostrar datos segun el filtro consultado. */
  aplicarfiltro(data: any, $event, campo: any, valorCampo: string) {
    data!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

    setTimeout(() => {
      if (this.dt.filteredValue != null) {
        let total: number = 0;
        this.totalNominaSellado = 0;
        for (const item of this.dt.filteredValue) total += item.PagoTotal;
        this.totalNominaSellado = total;
      }
    }, 1000);
  }

  /** Filtrar la tabla detallada del modal de sellado */
  aplicarfiltro2 = ($event, campo: any, valorCampo: string) => this.dtDetallada!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

  /** Cargará el modal de sellado al momento de seleccionar un operario en la columna ver detalle de la tabla */
  cargarModalSellado(item: any, persona: string, envioZeus: Array<string>) {
    this.modalSellado = true;
    this.detallesNomina = [];
    let fechaInicial: any = this.rangoFechas.length > 0 ? moment(this.rangoFechas[0]).format('YYYY-MM-DD') : this.today;
    let fechaFinal: any = this.rangoFechas.length > 0 ? moment(this.rangoFechas[1]).format('YYYY-MM-DD') : fechaInicial;

    this.servicioBagPro.GetNominaSelladoDetalladaItemPersona(fechaInicial, fechaFinal, item, persona).subscribe(data => {
      for (let i = 0; i < data.length; i++) {
        let info: any = JSON.parse(`{${data[i].replaceAll("'", '"')}}`);
        if (envioZeus.includes(info.EnvioZeus)) {
          info.Fecha = info.Fecha.replace(' 0:00:00', '').replace(' 12:00:00', ''),
          info.Cantidad = parseFloat(info.Cantidad.toString().replace(',', '.')),
          info.Peso = parseFloat(info.Peso.toString().replace(',', '.')),
          info.Precio = parseFloat(info.Precio.toString().replace(',', '.'));
          info.Valor_Total = parseFloat(info.Valor_Total.toString().replace(',', '.'));
          info.Pesado_Entre = parseFloat(info.Pesado_Entre.toString().replace(',', '.'));
          info.Cantidad_Total = parseFloat(info.Cantidad_Total.toString().replace(',', '.'));
          this.operario = info.Operario;
          this.detallesNomina.push(info);
        }
      }
    });
  }

  /** Calcular el valor total de la nómina de sellado */
  calcularTotalAPagar(data: any) {
    let total: number = 0;
    for (const item of data) {
      total += item.PagoTotal;
    }
    return total;
  }

  /** función que contendrá la consulta de cuando se desee exportar a excel la nomina de forma detallada */
  cargarNominaDetallada(fecha1: any, fecha2: any) {
    this.detalladoxBultos = [];
    this.servicioBagPro.GetNominaSelladoDetalladaxBulto(fecha1, fecha2).subscribe(data => {
      for (let index = 0; index < data.length; index++) {
        let info: any = JSON.parse(`{${data[index].replaceAll("'", '"')}}`);
        info.Cedula = parseInt(info.Cedula);
        info.Referencia = parseInt(info.Referencia);
        info.Ot = parseInt(info.Ot);
        info.Bulto = parseInt(info.Bulto);
        info.Fecha = info.Fecha.toString().replace('12:00:00 a.\u00A0m. ', '');
        info.Cantidad = parseFloat(info.Cantidad.toString().replace(',', '.')),
        info.Cantidad_Total = parseFloat(info.Cantidad_Total.toString().replace(',', '.')),
        info.Peso = parseFloat(info.Peso.toString().replace(',', '.'));
        info.Precio = parseFloat(info.Precio.toString().replace(',', '.'));
        info.Valor_Total = parseFloat(info.Valor_Total.toString().replace(',', '.'));
        this.detalladoxBultos.push(info);
        this.detalladoxBultos.sort((a, b) => Number(a.Bulto) - Number(b.Bulto));
        this.detalladoxBultos.sort((a, b) => Number(a.Cedula) - Number(b.Cedula));
      }
    });
  }

  createExcel() {
    let fechaInicial: any = this.rangoFechas.length > 0 ? moment(this.rangoFechas[0]).format('YYYY-MM-DD') : this.today;
    let fechaFinal: any = this.rangoFechas.length > 0 ? moment(this.rangoFechas[1]).format('YYYY-MM-DD') : fechaInicial;
    this.cargarNominaDetallada(fechaInicial, fechaFinal);
    this.load = false;
    setTimeout(() => {
      let title: string = `Nómina Total de Sellado`;
      let fill: any = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'fcffa0' } };
      let font: any = { name: 'Comic Sans MS', family: 4, size: 9, underline: true, bold: true };
      let border: any = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      let workbook = this.createExcelService.formatoExcel(title, false);
      this.addPageConsilidateExcel(workbook, fill, font, border, this.dataPageOneExcel(), 1);
      this.createExcelService.creacionHoja(workbook, `Nomina Total Detallada`);
      this.addPageDetailsExcel(workbook, fill, font, border, this.dataPageTwoExcel(), 2, ['0', '1']);
      this.createExcelService.creacionHoja(workbook, `Nomina Recibida en Despacho`, false);
      this.addPageConsilidateExcel(workbook, fill, font, border, this.dataPageThreeExcel(), 3);
      this.createExcelService.creacionHoja(workbook, `Nomina Recibida en Despacho Detallada`);
      this.addPageDetailsExcel(workbook, fill, font, border, this.dataPageFourExcel(), 4, ['1']);
      this.createExcelService.creacionExcel(`Nómina de Sellado de ${fechaInicial} a ${fechaFinal}`, workbook);
      this.load = true;
    }, 2000);
  }

  dataPageOneExcel(): Array<any> {
    let data = [];
    this.arraySellado.forEach(d => data.push([d.Cedula, d.Operario, d.Cargo, d.PagoTotal]));
    return data;
  }

  dataPageTwoExcel(): Array<any> {
    let data = [];
    this.detalladoxBultos.forEach(d => data.push([d.Cedula, d.Operario, d.Fecha, d.Ot, d.Bulto, d.Referencia, d.Nombre_Referencia, d.Cantidad_Total, d.Cantidad, d.Presentacion, d.Maquina, d.Peso, d.Turno, d.Proceso, d.Precio, d.Valor_Total, d.Pesado_Entre, d.EnvioZeus]));
    return data;
  }

  dataPageThreeExcel(): Array<any> {
    let data = [];
    this.nominaDespacho.forEach(d => data.push([d.Cedula, d.Operario, d.Cargo, d.PagoTotal]));
    return data;
  }

  dataPageFourExcel(): Array<any> {
    let data = [];
    this.detalladoxBultos.forEach(d => data.push([d.Cedula, d.Operario, d.Fecha, d.Ot, d.Bulto, d.Referencia, d.Nombre_Referencia, d.Cantidad_Total, d.Cantidad, d.Presentacion, d.Maquina, d.Peso, d.Turno, d.Proceso, d.Precio, d.Valor_Total, d.Pesado_Entre, d.EnvioZeus]));
    return data;
  }

  addPageConsilidateExcel(workbook, fill, font, border, data, pageNumber: number) {
    let page = workbook.worksheets[pageNumber - 1];
    this.addHeaderPageConsolidateExcel(page, font, border);
    page.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
    this.addDataConsolidateExcel(page, data);
    this.addTotalConsolidatePage(page, data);
  }

  addHeaderPageConsolidateExcel(worksheet, font, border) {
    worksheet.addRow([]);
    worksheet.addRow([]);
    const header = ["Cedula", "Nombre", "Cargo", "Valor a Pagar"];
    let headerRow = worksheet.addRow(header);
    headerRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'eeeeee' } }
      cell.font = font;
      cell.border = border;
    });
    let concatCellsPage: Array<string> = ['A1:D3'];
    this.stylesPageExcel(worksheet, concatCellsPage, []);
  }

  addDataConsolidateExcel(worksheet, data) {
    let formatNumber: Array<number> = [4];
    formatNumber.forEach(i => worksheet.getColumn(i).numFmt = '"$"#,##0.00;[Red]\-"$"#,##0.00');
    data.forEach(d => worksheet.addRow(d));
  }

  addTotalConsolidatePage(worksheet, data) {
    let total: number = 0;
    data.forEach(d => total += d[3]);
    let row = worksheet.addRow(['', '', '', total]);
    row.getCell(4).font = { name: 'Comic Sans MS', family: 4, size: 9, underline: true, bold: true };
    row.getCell(4).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '8DC4FB' } };
  }

  addPageDetailsExcel(workbook, fill, font, border, data, pageNumber: number, EnvioZeus: Array<string>) {
    let page = workbook.worksheets[pageNumber - 1];
    this.addHeaderPageDetailsExcel(page, font, border);
    page.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
    this.addDataDetailsExcel(page, data, EnvioZeus);
  }

  addHeaderPageDetailsExcel(worksheet, font, border) {
    const header = ["Cedula", "Nombre", "Fecha", "OT", "Bulto", "Item", "Referencia", "Cant. Total", "Cant. Sellada Operario", "Medida", "Maquina", "Peso", "Turno", "Proceso", "Precio", "Subtotal", "Pesado entre", "Recibidos Despacho"];
    let headerRow = worksheet.addRow(header);
    headerRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'eeeeee' } }
      cell.font = font;
      cell.border = border;
    });
    let concatCellsPage: Array<string> = ['A1:R3'];
    this.stylesPageExcel(worksheet, concatCellsPage, []);
  }

  addDataDetailsExcel(worksheet, data, EnvioZeus: Array<string>) {
    let formatNumber: Array<number> = [8, 9, 12, 15, 16];
    formatNumber.forEach(i => worksheet.getColumn(i).numFmt = '"$"#,##0.00;[Red]\-"$"#,##0.00');
    data.forEach(d => {
      if (EnvioZeus.includes(d[17])) worksheet.addRow(d);
    });
  }

  stylesPageExcel(worksheet, unirCeldas: Array<string>, formatNumber: Array<number>) {
    formatNumber.forEach(i => worksheet.getColumn(i).numFmt = '"$"#,##0.00;[Red]\-"$"#,##0.00');
    [1, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].forEach(x => worksheet.getColumn(x).width = 30);
    [2].forEach(x => worksheet.getColumn(x).width = 50);
    [7].forEach(x => worksheet.getColumn(x).width = 60);
    unirCeldas.forEach(cell => worksheet.mergeCells(cell));
  }

  formatNumbers = (number) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

  createPDF() {
    this.load = false;
    let fechaInicial: any = this.rangoFechas.length > 0 ? moment(this.rangoFechas[0]).format('YYYY-MM-DD') : this.today;
    let fechaFinal: any = this.rangoFechas.length > 0 ? moment(this.rangoFechas[1]).format('YYYY-MM-DD') : fechaInicial;
    this.cargarNominaDetallada(fechaInicial, fechaFinal);
    setTimeout(() => {
      let title: string = `Nómina de Sellado de ${fechaInicial} a ${fechaFinal}`;
      let content: Array<any> = this.contentPDF();
      this.createPdfService.formatoPDF(title, content);
      setTimeout(() => this.load = true, 3000);
    }, 2000);
  }

  contentPDF(): Array<any> {
    let content: Array<any> = [];
    let consolidatedInformation: Array<ConsolidateInformation> = this.getConsolidateInformationPDF();
    content.push(this.tableConsolidated(consolidatedInformation));
    content.push(this.subTotalConsolidated());
    content.push(this.tableDetailsOperatorPDF());
    return content;
  }

  getConsolidateInformationPDF(): Array<ConsolidateInformation> {
    let consolidatedInformation: Array<any> = [];
    let count: number = 0;
    this.detalladoxBultos.forEach(x => {
      if (!consolidatedInformation.map(x => x.Cédula).includes(x.Cedula)) {
        let cuontProduction: number = this.detalladoxBultos.filter(y => y.Cedula == x.Cedula).length;
        let totalQuantity: number = 0;
        this.detalladoxBultos.filter(y => y.Cedula == x.Cedula).forEach(y => totalQuantity += y.Valor_Total);
        count++;
        consolidatedInformation.push({
          '#': { text: count, alignment: 'right', fontSize: 8, bold: true },
          "Cédula": x.Cedula,
          "Nombre": x.Operario,
          'Total Rollos/Bultos': { text: this.formatNumbers((cuontProduction)), alignment: 'right', fontSize: 8, bold: true },
          'Valor a Pagar': { text: this.formatNumbers((totalQuantity).toFixed(2)), alignment: 'right', fontSize: 8, bold: true },
        });
      }
    });
    return consolidatedInformation;
  }

  tableConsolidated(data) {
    let columns: Array<string> = ['#', 'Cédula', 'Nombre', 'Total Rollos/Bultos', 'Valor a Pagar'];
    let widths: Array<string> = ['5%', '15%', '50%', '15%', '15%'];
    return {
      table: {
        headerRows: 2,
        widths: widths,
        body: this.buildTableBody(data, columns, 'Consolidado de Operario(s)'),
      },
      fontSize: 8,
      layout: {
        fillColor: function (rowIndex) {
          return (rowIndex == 0 || rowIndex == 1) ? '#DDDDDD' : null;
        }
      }
    };
  }

  subTotalConsolidated() {
    let total: number = 0;
    this.detalladoxBultos.forEach(x => total += x.Valor_Total);
    return {
      table: {
        widths: ['5%', '15%', '50%', '15%', '15%'],
        style: 'header',
        body: [
          [
            { border: [false, false, false, false], text: ``, fontSize: 8, bold: true, colSpan: 3 },
            '',
            '',
            { border: [true, false, true, true], text: `Total Nomina`, fontSize: 8, bold: true },
            { border: [true, false, true, true], text: `${this.formatNumbers((total).toFixed(2))}`, alignment: 'right', fontSize: 8, bold: true },
          ],
        ]
      }
    }
  }

  buildTableBody(data, columns, title: string) {
    var body = [];
    body.push([{ colSpan: 5, text: title, bold: true, alignment: 'center', fontSize: 10 }, '', '', '', '']);
    body.push(columns);
    data.forEach(function (row) {
      var dataRow = [];
      columns.forEach((column) => dataRow.push(row[column]));
      body.push(dataRow);
    });
    return body;
  }

  tableDetailsOperatorPDF(): Array<any> {
    let data: Array<any> = [];
    let includedOperators: Array<number> = [];
    let count: number = 0;
    this.detalladoxBultos.forEach(x => {
      if (!includedOperators.includes(x.Cedula)) {
        includedOperators.push(x.Cedula);
        count++;
        data.push([
          {
            margin: [0, 10],
            colSpan: 4,
            table: {
              headerRows: 1,
              widths : ['5%', '15%', '65%', '15%'],
              body: this.tableDetailsOrdersProductionPDF(x.Cedula, count),
            },
            fontSize: 9,
          },{},{},{}
        ]);
      }
    });
    return data;
  }

  tableDetailsOrdersProductionPDF(operator: number, countOperator: number){
    let orderByOperator: Array<any> = this.detalladoxBultos.filter(x => x.Cedula == operator);
    let includedOrders: Array<number> = [];
    let count: number = 0;
    let data: Array<any> = [this.informationOperatorPDF(operator, countOperator)];
    orderByOperator.forEach(x => {
      if (!includedOrders.includes(x.Ot)) {
        includedOrders.push(x.Ot);
        count++;
        data.push([
          {
            margin: [5, 5],
            colSpan: 4,
            table: {
              headerRows: 1,
              widths : ['5%', '15%', '15%', '55%', '10%'],
              body: this.tableDetailsProductionByOrderPDF(x.Ot, orderByOperator, count),
            },
            fontSize: 9,
          },{},{},{}
        ]);
      }
    });
    return data;
  }

  informationOperatorPDF(operator: any, countOperator: number){
    let totalQuantity: number = 0;
    this.detalladoxBultos.filter(y => y.Cedula == operator).forEach(y => totalQuantity += y.Valor_Total);
    let dataOperator: Array<any> = this.detalladoxBultos.filter(x => x.Cedula == operator);
    return [
      { border: [true, true, true, true], text: countOperator, fillColor: '#ccc', bold: true },
      { border: [true, true, true, true], text: `${dataOperator[0].Cedula}`, fillColor: '#ccc', bold: true },
      { border: [true, true, true, true], text: `${dataOperator[0].Operario}`, fillColor: '#ccc', bold: true },
      { border: [true, true, true, true], text: this.formatNumbers((totalQuantity).toFixed(2)), fillColor: '#ccc', bold: true, alignment: 'right' },
    ];
  }

  tableDetailsProductionByOrderPDF(order: number, dataProduction: Array<any>, countOrder: number) {
    let data: Array<any> = [this.informationOrderPDF(order, countOrder, dataProduction)];
    data.push([
      {
        margin: [5, 5],
        colSpan: 5,
        table: {
          headerRows: 1,
          widths : ['5%', '20%', '10%', '10%', '5%', '5%', '10%', '8%', '10%', '12%', '5%'],
          body: this.dataDetailsProductionPDF(order, dataProduction),
        },
        fontSize: 9,
      },{},{},{},{}
    ]);
    return data;
  }

  informationOrderPDF(order: any, countOrder: number, dataProduction){
    let dataOrder: Array<any> = dataProduction.filter(x => x.Ot == order);
    return [
      { border: [true, true, true, false], text: countOrder, fillColor: '#ddd', bold: true },
      { border: [true, true, true, false], text: `${dataOrder[0].Ot}`, fillColor: '#ddd', bold: true },
      { border: [true, true, true, false], text: `${dataOrder[0].Referencia}`, fillColor: '#ddd', bold: true },
      { border: [true, true, true, false], text: `${dataOrder[0].Nombre_Referencia}`, fillColor: '#ddd', bold: true },
      { border: [true, true, true, false], text: this.formatNumbers((dataOrder.length)), fillColor: '#ddd', bold: true, alignment: 'right' },
    ];
  }

  dataDetailsProductionPDF(order: number, dataProduction: Array<any>){
    let data: Array<any> = [this.titlesDetailsProductionPDF()];
    let productionByOrder: Array<any> = dataProduction.filter(x => x.Ot == order);
    let count: number = 0;
    productionByOrder.forEach(x => {
      count++;
      data.push([
        { border: [false, false, false, false], fontSize: 8, alignment: 'right', text: this.formatNumbers((count)) },
        { border: [false, false, false, false], fontSize: 8, alignment: 'center', text: x.Fecha.replace(' 0:00:00','') },
        { border: [false, false, false, false], fontSize: 8, alignment: 'center', text: x.Bulto },
        { border: [false, false, false, false], fontSize: 8, alignment: 'right', text: this.formatNumbers((x.Cantidad).toFixed(2)) },
        { border: [false, false, false, false], fontSize: 8, alignment: 'center', text: x.Presentacion },
        { border: [false, false, false, false], fontSize: 8, alignment: 'center', text: x.Maquina },
        { border: [false, false, false, false], fontSize: 8, alignment: 'right', text: this.formatNumbers((x.Peso).toFixed(2)) },
        { border: [false, false, false, false], fontSize: 8, alignment: 'center', text: x.Turno },
        { border: [false, false, false, false], fontSize: 8, alignment: 'right', text: this.formatNumbers((x.Precio).toFixed(2)) },
        { border: [false, false, false, false], fontSize: 8, alignment: 'right', text: this.formatNumbers((x.Valor_Total).toFixed(2)) },
        { border: [false, false, false, false], fontSize: 8, alignment: 'center', text: x.EnvioZeus },
      ]);
    });
    return data;
  }

  titlesDetailsProductionPDF(){
    return [
      { border: [true, true, true, true], alignment: 'center', text: `#`, fillColor: '#eee', bold: true },
      { border: [true, true, true, true], alignment: 'center', text: `Fecha`, fillColor: '#eee', bold: true },
      { border: [true, true, true, true], alignment: 'center', text: `Bulto`, fillColor: '#eee', bold: true },
      { border: [true, true, true, true], alignment: 'center', text: `QTY`, fillColor: '#eee', bold: true },
      { border: [true, true, true, true], alignment: 'center', text: `Und`, fillColor: '#eee', bold: true },
      { border: [true, true, true, true], alignment: 'center', text: `MQ`, fillColor: '#eee', bold: true },
      { border: [true, true, true, true], alignment: 'center', text: `Peso`, fillColor: '#eee', bold: true },
      { border: [true, true, true, true], alignment: 'center', text: `Turno`, fillColor: '#eee', bold: true },
      { border: [true, true, true, true], alignment: 'center', text: `Valor`, fillColor: '#eee', bold: true },
      { border: [true, true, true, true], alignment: 'center', text: `Total`, fillColor: '#eee', bold: true },
      { border: [true, true, true, true], alignment: 'center', text: `Zeus`, fillColor: '#eee', bold: true },
    ]
  }

}

interface ConsolidateInformation {
  "#": number,
  "Cédula": number,
  "Nombre": string,
  "Total Rollos/Bultos": number,
  "Valor a Pagar": number,
}