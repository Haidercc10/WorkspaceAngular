import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Workbook } from 'exceljs';
import moment from 'moment';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { AppComponent } from 'src/app/app.component';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';
import * as fs from 'file-saver';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { ShepherdService } from 'angular-shepherd';
import { defaultStepOptions, stepsNomina as defaultSteps } from 'src/app/data';

@Component({
  selector: 'app-Nomina',
  templateUrl: './Nomina.component.html',
  styleUrls: ['./Nomina.component.css']
})
export class NominaComponent implements OnInit {

  FormEdicionMateriaPrima !: FormGroup;

  @ViewChild('dt') dt: Table | undefined;
  @ViewChild('dtDetallada') dtDetallada: Table | undefined;
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
  detalladoxBultos : any[] = []; /** Variable que cargará en el formato excel la nomina detallada por bultos para cada operario */

  constructor(private AppComponent : AppComponent,
                private servicioBagPro : BagproService,
                  private msj : MensajesAplicacionService,
                    private mensajes : MessageService,
                      private shepherdService: ShepherdService) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
   }

  ngOnInit() {
    this.lecturaStorage();
  }

 //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
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

  /** Exportar documento a excel con la nomina de sellado de forma acumulada o detallada por bulto. */
  exportarExcel(numero : number) {
    this.load = false;
    this.onReject();
    let datos : any[] = [];
    let infoDocumento : any[] = [];
    let title : string = ``;
    let header : any[];
    let fechaInicial : any = this.rangoFechas.length > 0 ? moment(this.rangoFechas[0]).format('YYYY-MM-DD') : this.today;
    let fechaFinal : any = this.rangoFechas.length > 0 ? moment(this.rangoFechas[1]).format('YYYY-MM-DD') : fechaInicial;

    if(numero == 1) {
      this.dt.filteredValue != null ? datos = this.dt.filteredValue : datos = this.arraySellado;
      title = `Nómina de Sellado de ${fechaInicial} a ${fechaFinal}`;
      header = ["Cedula", "Nombre", "Cargo", "Valor a pagar"];
    }

    if(numero == 2) {
      title = `Nómina de Sellado de ${fechaInicial} a ${fechaFinal}`;
      header = ["Cedula", "Nombre", "Fecha", "OT", "Bulto",  "Item", "Referencia", "Cant. Total", "Cant. Sellada Operario", "Medida",  "Maquina", "Peso", "Turno", "Proceso", "Precio", "Subtotal", "Pesado entre"];
      this.cargarNominaDetallada(fechaInicial, fechaFinal);
      datos = this.detalladoxBultos;
    }

    setTimeout(() => {
      if(numero == 1) {
        for (const item of datos) {
          const datos1  : any = [item.Cedula, item.Operario, item.Cargo, item.PagoTotal];
          infoDocumento.push(datos1);
        }
      }
      if(numero == 2) {
        for (const item of datos) {
          const datos1  : any = [item.Cedula, item.Operario, item.Fecha, item.Ot, item.Bulto, item.Referencia, item.Nombre_Referencia, item.Cantidad_Total, item.Cantidad, item.Presentacion, item.Maquina, item.Peso, item.Turno, item.Proceso, item.Precio, item.Valor_Total, item.Pesado_Entre ];
          infoDocumento.push(datos1);
        }
      }
      let workbook = new Workbook();
      const imageId1 = workbook.addImage({ base64:  logoParaPdf, extension: 'png', });
      let worksheet = workbook.addWorksheet(title);
      numero == 1 ? worksheet.addImage(imageId1, 'A1:A2') : worksheet.addImage(imageId1, 'A1:B3') ;
      let titleRow = worksheet.addRow([title]);
      titleRow.font = { name: 'Calibri', family: 4, size: 16, underline: 'double', bold: true };
      worksheet.addRow([]);
      worksheet.addRow([]);
      let headerRow = worksheet.addRow(header);
      headerRow.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'eeeeee' }
        }
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
      });
      numero == 1 ? worksheet.mergeCells('A1:D3') : worksheet.mergeCells('A1:Q3');
      worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };

      if(numero == 1) {
        infoDocumento.forEach(d => {
          let row = worksheet.addRow(d);
          row.getCell(4).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
        });
        worksheet.getColumn(1).width = 15;
        worksheet.getColumn(2).width = 45;
        worksheet.getColumn(3).width = 20;
        worksheet.getColumn(4).width = 12;
      }

      if(numero == 2) {
        infoDocumento.forEach(d => {
          let row = worksheet.addRow(d);
          row.getCell(8).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          row.getCell(9).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          row.getCell(12).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          row.getCell(15).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          row.getCell(16).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
        });
        worksheet.getColumn(1).width = 15;
        worksheet.getColumn(2).width = 35;
        worksheet.getColumn(3).width = 20;
        worksheet.getColumn(4).width = 12;
        worksheet.getColumn(5).width = 12;
        worksheet.getColumn(6).width = 12;
        worksheet.getColumn(7).width = 40;
        worksheet.getColumn(8).width = 20;
        worksheet.getColumn(9).width = 25;
        worksheet.getColumn(10).width = 10;
        worksheet.getColumn(11).width = 10;
        worksheet.getColumn(12).width = 10;
        worksheet.getColumn(13).width = 12;
        worksheet.getColumn(14).width = 12;
        worksheet.getColumn(15).width = 10;
        worksheet.getColumn(16).width = 15;
        worksheet.getColumn(17).width = 12;
      }

      setTimeout(() => {
        workbook.xlsx.writeBuffer().then((data) => {
          let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          fs.saveAs(blob, title + `.xlsx`);
        });
        this.load = true;
        this.msj.mensajeConfirmacion(`Confirmación`, title + ` exportada éxitosamente!`);
      }, 1500);
    }, 2000);
  }

  /** Función para consultar las nomina de sellado */
  consultarNominas(){
    this.load = false;
    this.totalNominaSellado = 0;
    this.arraySellado = [];
    let cedulas : any = [];
    let fechaInicial : any = this.rangoFechas.length > 0 ? moment(this.rangoFechas[0]).format('YYYY-MM-DD') : this.today;
    let fechaFinal : any = this.rangoFechas.length > 0 ? moment(this.rangoFechas[1]).format('YYYY-MM-DD') : fechaInicial;

    this.servicioBagPro.GetNominaSelladoAcumuladaItem(fechaInicial, moment(fechaFinal).add(1, 'days').format('YYYY-MM-DD')).subscribe(data => {
      if(data.length > 0) {
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
      } else this.msj.mensajeAdvertencia(`Advertencia`, `No se encontraron registros en las fechas consultadas`);
    });
    setTimeout(() => { this.cargarTabla2(fechaInicial, fechaFinal); }, 1500);
  }

  /** Función para cargar la tabla de Nómina detallada y calcular el valor total a pagar para cada operario*/
  cargarTabla2(fecha1 : any, fecha2 : any){
    let array : any = [];
    this.totalNominaSellado = 0;

    this.servicioBagPro.GetNominaSelladoAcumuladaItem(fecha1, moment(fecha2).add(1, 'days').format('YYYY-MM-DD')).subscribe(data => {
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
        if(array >= 0) {
          this.arraySellado[array].detalle.push(info);
          this.arraySellado[array].PagoTotal += parseFloat(info.PagoTotal);
        }
      }
    });
    setTimeout(() => { this.calcularTotalAPagar(); }, 1000);
    setTimeout(() => { this.load = true; }, 2000);
  }

  /** Funcion para filtrar busquedas y mostrar datos segun el filtro consultado. */
  aplicarfiltro($event, campo : any, valorCampo : string) {
    this.dt!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

    setTimeout(() => {
      if(this.dt.filteredValue != null) {
        let total : number = 0;
        this.totalNominaSellado = 0;
        for (const item of this.dt.filteredValue) total += item.PagoTotal;
        this.totalNominaSellado = total;
      }
    }, 1000);
  }

  /** Filtrar la tabla detallada del modal de sellado */
  aplicarfiltro2 = ($event, campo : any, valorCampo : string) => this.dtDetallada!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

  /** Cargará el modal de sellado al momento de seleccionar un operario en la columna ver detalle de la tabla */
  cargarModalSellado(item : any, persona : string){
    this.modalSellado = true;
    this.detallesNomina = [];
    let fechaInicial : any = this.rangoFechas.length > 0 ? moment(this.rangoFechas[0]).format('YYYY-MM-DD') : this.today;
    let fechaFinal : any = this.rangoFechas.length > 0 ? moment(this.rangoFechas[1]).format('YYYY-MM-DD') : fechaInicial;

    this.servicioBagPro.GetNominaSelladoDetalladaItemPersona(fechaInicial, moment(fechaFinal).add(1, 'days').format('YYYY-MM-DD'), item, persona).subscribe(data => {
      for (let i = 0; i < data.length; i++) {
        let info : any = JSON.parse(`{${data[i].replaceAll("'", '"')}}`);
        info.Fecha = info.Fecha.replace('12:00:00 a.\u00A0m. ', ''),
        info.Cantidad = parseFloat(info.Cantidad.toString().replace(',', '.')),
        info.Peso = parseFloat(info.Peso.toString().replace(',', '.')),
        info.Precio = parseFloat(info.Precio.toString().replace(',', '.'));
        info.Valor_Total = parseFloat(info.Valor_Total.toString().replace(',', '.'));
        info.Pesado_Entre = parseFloat(info.Pesado_Entre.toString().replace(',', '.'));
        info.Cantidad_Total = parseFloat(info.Cantidad_Total.toString().replace(',', '.'));
        this.operario = info.Operario;
        this.detallesNomina.push(info);
      }
    });
  }

  /** Calcular el valor total de la nómina de sellado */
  calcularTotalAPagar(){
    let total : number = 0;
    for (const item of this.arraySellado) {
      total += item.PagoTotal;
    }
    this.totalNominaSellado = total;
  }

  /** Función para quitar mensaje de elección */
  onReject = () => this.mensajes.clear('msj');

   /** Muestra mensaje preguntando en qué tipo de formatos */
  mostrarEleccion(){
    setTimeout(() => {
      if(this.arraySellado.length > 0) {
        if(this.dt.filteredValue != null) {
          this.exportarExcel(1);
        } else this.mensajes.add({severity:'warn', key: 'msj', summary:'Elección', detail: `¿Qué tipo de formato de nómina desea generar?`, sticky: true});
      } else this.msj.mensajeAdvertencia(`Advertencia`, `Debe cargar al menos un registro en la tabla, verifique!`);
    }, 500);
  }

  /** función que contendrá la consulta de cuando se desee exportar a excel la nomina de forma detallada */
  cargarNominaDetallada(fecha1 : any, fecha2 : any){
    this.detalladoxBultos = [];
      this.servicioBagPro.GetNominaSelladoDetalladaxBulto(fecha1, fecha2).subscribe(data => {
        for(let index = 0; index < data.length; index++) {
          let info : any = JSON.parse(`{${data[index].replaceAll("'", '"')}}`);
          info.Cedula = parseInt(info.Cedula),
          info.Referencia = parseInt(info.Referencia),
          info.Ot = parseInt(info.Ot),
          info.Bulto = parseInt(info.Bulto),
          info.Fecha = info.Fecha.toString().replace('12:00:00 a.\u00A0m. ', ''),
          info.Cantidad = parseFloat(info.Cantidad),
          info.Cantidad_Total = parseFloat(info.Cantidad_Total),
          info.Peso = parseFloat(info.Peso),
          info.Precio = parseFloat(info.Precio),
          info.Valor_Total = parseFloat(info.Valor_Total)

          this.detalladoxBultos.push(info);
          this.detalladoxBultos.sort((a,b) => Number(a.Bulto) - Number(b.Bulto));
          this.detalladoxBultos.sort((a,b) => Number(a.Cedula) - Number(b.Cedula));
        }
      });
  }
}
