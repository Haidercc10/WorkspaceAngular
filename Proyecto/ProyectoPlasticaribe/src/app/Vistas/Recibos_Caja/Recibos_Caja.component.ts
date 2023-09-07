import { Component, OnInit, ViewChild } from '@angular/core';
import { Workbook } from 'exceljs';
import moment from 'moment';
import { Table } from 'primeng/table';
import { InventarioZeusService } from 'src/app/Servicios/InventarioZeus/inventario-zeus.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { AppComponent } from 'src/app/app.component';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';
import * as fs from 'file-saver';
import { ShepherdService } from 'angular-shepherd';
import { defaultStepOptions, stepsReporteRecibosCaja as defaultSteps } from 'src/app/data';

@Component({
  selector: 'app-Recibos_Caja',
  templateUrl: './Recibos_Caja.component.html',
  styleUrls: ['./Recibos_Caja.component.css']
})
export class Recibos_CajaComponent implements OnInit {
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  load: boolean = false; //Variable que validará cuando vaya a salir la animacion de carga
  arrayRecibos : any = []; /** Array que almacenará la lista de los recibos de caja según el rango de fechas consultado */
  @ViewChild('dt') dt: Table | undefined; /** Tabla que contendrá la información de los recibo de caja */
  rangoFechas : any[] = []; /** Array que almacenará la información de la fecha de inicio y la fecha final  */
  totalRecibos : number = 0; // Variable que almacenará el total de recibos de caja según el rango de fechas consultado
  fecha : any; /** Variable que almacenará la fecha de inicio */
  fechaFinal : any; /** Variable que almacenará la fecha final */

  constructor(private AppComponent : AppComponent,
                private servicioInventarioZeus : InventarioZeusService,
                  private msj : MensajesAplicacionService,
                    private shepherdService: ShepherdService) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
   }

  ngOnInit() {
    this.lecturaStorage();
  }

  //Función que se encarga de leer la información que se almacena en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  //Función que consultará los recibos de caja y los cargará en la tabla
  consultarRecibos(){
    this.load = true;
    this.arrayRecibos = [];
    this.fecha = this.rangoFechas.length > 0 ? moment(this.rangoFechas[0]).format().replace('-05:00', '') : this.today;
    this.fechaFinal = this.rangoFechas.length > 0 ? moment(this.rangoFechas[1]).format().replace('T00:00:00-05:00', 'T23:59:59') : this.fecha;
    this.totalRecibos = 0;

    this.fecha = this.fecha == 'Fecha inválida' ? this.today : this.fecha;
    this.fechaFinal = this.fechaFinal == 'Fecha inválida' ? this.fecha : this.fechaFinal;

    this.servicioInventarioZeus.GetRecibosCaja(this.fecha, this.fechaFinal).subscribe(data => {
      if(data.length > 0) data.forEach(datos => this.llenarTabla(datos));
      else this.msj.mensajeAdvertencia(`Advertencia`, `No se encontraron resultados de busqueda!`);
    }, () => this.load = false, () => this.load = false);
  }

  //Funció que se encarga de llenar la tabla con los datos de los recibos de caja
  llenarTabla(datos : any) {
    this.arrayRecibos.push({
      anoMes: datos.anoMes,
      fuente: datos.fuente,
      documento: datos.documento,
      consecutivo: datos.consecutivo,
      fechaTransac: datos.fechaTransac,
      idCliente: datos.idCliente,
      cliente: datos.cliente,
      descripcion: datos.descripcion,
      valor: datos.valor,
      cuenta: datos.cuenta,
      idVendedor: datos.idVendedor,
      vendedor: datos.vendedor,
      factura: datos.factura,
      vencimiento: datos.vencimiento,
      usuario: datos.usuario,
      fechaRegistro: datos.fechaRegistro.replace('T', ' - '),
    });
    this.totalRecibos += datos.valor;
  }

  //Función que mostrará un tutorial del uso del módulo
  verTutorial() {
    this.shepherdService.defaultStepOptions = defaultStepOptions;
    this.shepherdService.modal = true;
    this.shepherdService.confirmCancel = false;
    this.shepherdService.addSteps(defaultSteps);
    this.shepherdService.start();
  }

  //Función que se encarga de filtrar la información de la tabla
  aplicarfiltro($event, campo : any, valorCampo : string){
    this.dt!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);
    setTimeout(() => {
      if(this.dt.filteredValue != null) {
        this.totalRecibos = 0;
        this.dt.filteredValue.forEach(element => { this.totalRecibos += element.valor; });
      } else {
        this.totalRecibos = 0;
        this.arrayRecibos.forEach(element => { this.totalRecibos += element.valor; });
      }
    }, 500);
  }

  //Función que se encargará de exportar la información de la tabla a un archivo excel
  exportarExcel(fecha, fechaFinal) {
    if(this.arrayRecibos.length > 0) {
      this.load = true;
      let datos : any [] = [];
      let infoDocumento : any [] = [];
      let title : string = ``;

      this.dt.filteredValue != null ? datos = this.dt.filteredValue : datos = this.arrayRecibos;
      title = `Recibos de Caja de ${fecha.replace('T00:00:00', '')} a ${fechaFinal.replace('T23:59:59', '')}`;

      setTimeout(() => {
        const header = ["Periodo", "Consecutivo", "Fecha Transacción", "Cliente", "Descripción", "Valor", "Cuenta", "Vendedor", "Factura", "Vencimiento", "Usuario", "Fecha Registro"];
        for (const item of datos) {
          const datos1  : any = [item.anoMes, item.consecutivo, item.fechaTransac, item.cliente, item.descripcion, item.valor, item.cuenta, item.vendedor, item.factura, item.vencimiento, item.usuario, item.fechaRegistro];
          infoDocumento.push(datos1);
        }
        let workbook = new Workbook();
        const imageId1 = workbook.addImage({ base64:  logoParaPdf, extension: 'png', });
        let worksheet = workbook.addWorksheet(title);
        worksheet.addImage(imageId1, 'A1:C3');
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
        worksheet.mergeCells('A1:L3');
        worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
        infoDocumento.forEach(d => {
          let row = worksheet.addRow(d);
          row.getCell(6).numFmt = '""#,##0.00;[Black]\-""#,##0.00';
          let qty= row.getCell(6);
          let color = 'ADD8E6';
          qty.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: color }
          }
        });
        worksheet.getColumn(1).width = 10;
        worksheet.getColumn(2).width = 12;
        worksheet.getColumn(3).width = 20;
        worksheet.getColumn(4).width = 45;
        worksheet.getColumn(5).width = 40;
        worksheet.getColumn(6).width = 20;
        worksheet.getColumn(7).width = 12;
        worksheet.getColumn(8).width = 45;
        worksheet.getColumn(9).width = 12;
        worksheet.getColumn(10).width = 12;
        worksheet.getColumn(11).width = 12;
        worksheet.getColumn(12).width = 22;
        setTimeout(() => {
          workbook.xlsx.writeBuffer().then((data) => {
            let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            fs.saveAs(blob, title + `.xlsx`);
          });
          this.load = false;
          this.msj.mensajeConfirmacion(`Confirmación`, `Formato de ${title} exportado con éxito!`);
        }, 1000);
      }, 1500);
    } else this.msj.mensajeAdvertencia(`Advertencia`, `Debe consultar los recibos de caja antes de exportarlos!`);
  }
}
