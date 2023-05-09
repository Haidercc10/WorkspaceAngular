import { Component, Inject, Injectable, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { Table } from 'primeng/table';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';
import { ActivosService } from 'src/app/Servicios/Activos/Activos.service';
import { Tipo_ActivoService } from 'src/app/Servicios/TiposActivos/Tipo_Activo.service';
import Swal from 'sweetalert2';
import { Movimientos_MantenimientoComponent } from '../Movimientos_Mantenimiento/Movimientos_Mantenimiento.component';
import { MessageService } from 'primeng/api';
import { AppComponent } from 'src/app/app.component';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-Reporte_Mantenimiento',
  templateUrl: './Reporte_Mantenimiento.component.html',
  styleUrls: ['./Reporte_Mantenimiento.component.css']
})

export class Reporte_MantenimientoComponent implements OnInit {

  FormActivos !: FormGroup; //Formulario de por el que se podrá hacer consultas mas especificas
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  cargando : boolean = false; //Variable que permitirá validar si debe salir o no la imagen de carga
  tiposActivos : any [] = []; //Variable que va a almacenar los diferentes tipos de activos
  areas : any [] = []; //Variable que va a almacenar las difrentes areas
  activos : any [] = []; //Variable que va a almacenar los diferentes activos
  InformacionActivos : any [] = []; //Variable que va a almacenar los datos consultados y los mostrará en la tabla
  modalMovimientos : boolean = false; //Variable que hará que se muestre o no el modal de movimientos de activos
  @ViewChild(Movimientos_MantenimientoComponent) movimientosActivos : Movimientos_MantenimientoComponent;
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro

  constructor(private frmBuilderMateriaPrima : FormBuilder,
                private AppComponent : AppComponent,
                  private activosService : ActivosService,
                    private tipoActivoService : Tipo_ActivoService,
                      private messageService: MessageService) {

    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
    this.FormActivos = this.frmBuilderMateriaPrima.group({
      ActivoId : [null, Validators.required],
      ActivoNombre: [null, Validators.required],
      FechaInicial: [null, Validators.required],
      FechaFinal: [null, Validators.required],
      TipoActivo : [null, Validators.required],
      AreasActivos : [null, Validators.required],
    });
  }

  ngOnInit() {
    this.lecturaStorage();
    this.consultarActivos();
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  // Funcion que exportará a excel todo el contenido de la tabla
  exportToExcel() : void {
    if (this.InformacionActivos.length == 0) this.mostrarAdvertencia(`Advertencia`, `¡Debe haber activos en la tabla para poder exportar la información a Excel!`);
    else {
      this.cargando = true;
      setTimeout(() => {
        const title = `Inventario Activos - ${this.today}`;
        const header = ["Id", "Nombre", "Tipo Activo", "Fecha de Compra", "Precio Compra", "Fecha Último Mtto", "Precio Último Mtto", "Precio Total Mttos", "Depreciación"]
        let datos : any =[];
        for (const item of this.InformacionActivos) {
          const datos1  : any = [item.Id, item.Nombre, item.TipoActivo, item.Fecha, item.FechaUltMtto, item.PrecioCompra, item.PrecioUltMtto, item.PrecioTotalMtto, item.Depreciacion];
          datos.push(datos1);
        }
        let workbook = new Workbook();
        const imageId1 = workbook.addImage({
          base64:  logoParaPdf,
          extension: 'png',
        });
        let worksheet = workbook.addWorksheet(`Inventario Activos - ${this.today}`);
        worksheet.addImage(imageId1, 'A1:A3');
        let titleRow = worksheet.addRow([title]);
        titleRow.font = { name: 'Calibri', family: 4, size: 16, underline: 'double', bold: true };
        worksheet.addRow([]);
        worksheet.addRow([]);
        let headerRow = worksheet.addRow(header);
        headerRow.eachCell((cell, number) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'eeeeee' }
          }
          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
        });
        worksheet.mergeCells('A1:I3');
        worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
        datos.forEach(d => {
          let row = worksheet.addRow(d);
          row.getCell(5).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          row.getCell(7).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          row.getCell(8).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          row.getCell(9).numFmt = '"$"#,##0.00;[Red]\-"$"#,##0.00';
          let qty= row.getCell(7);
          let color = 'ADD8E6';
          qty.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: color }
          }
        });
        worksheet.getColumn(1).width = 20;
        worksheet.getColumn(2).width = 60;
        worksheet.getColumn(3).width = 20;
        worksheet.getColumn(4).width = 22;
        worksheet.getColumn(5).width = 20;
        worksheet.getColumn(6).width = 20;
        worksheet.getColumn(7).width = 20;
        worksheet.getColumn(8).width = 20;
        worksheet.getColumn(9).width = 20;
        setTimeout(() => {
          workbook.xlsx.writeBuffer().then((data) => {
            let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            fs.saveAs(blob, `Inventario Activos - ${this.today}.xlsx`);
          });
          this.cargando = false;
        }, 500);
        this.mostrarConfirmacion(`Confirmación`,`Archivo de excel generado con éxito!`);
      }, 2000);
    }
  }

  // Funcion que va a limpiar todo
  LimpiarCampos() {
    this.FormActivos.reset();
  }

  // Funcion que va a consultar la información de los activos
  consultarActivos(){
    this.cargando = true;
    this.activosService.GetTodo().subscribe(datos_activos => {
      for (let i = 0; i < datos_activos.length; i++) {
        this.activosService.GetInfoActivos(datos_activos[i].actv_Id).subscribe(datos_infoActivos => {
          if (datos_infoActivos == null) this.llenarTablaSinMantenimientos(datos_activos[i]);
          else this.llenarTabla(datos_infoActivos);
        }, error => { this.mostrarError(`Error`, `¡No se ha podido buscar la información del activo ${datos_activos[i].actv_Nombre}!`); });
      }
    }, error => { this.mostrarError(`Error`, `¡No se han podido consultar los activos!`); });
  }

  // Funcion que va a llenar la tabla con la información proveniente de la consulta
  llenarTabla(datos : any){
    let info : any = {
      Id : datos.activo_Id,
      Nombre : datos.activo_Nombre,
      TipoActivo : datos.tipo_Activo,
      Fecha : datos.fecha_Compra.replace('T00:00:00', ''),
      FechaUltMtto : datos.fecha_UltMtto.replace('T00:00:00', ''),
      PrecioCompra : datos.precio_Compra,
      PrecioUltMtto : datos.precio_UltMtto,
      PrecioTotalMtto : datos.precio_TotalMtto,
      Depreciacion : datos.depreciacion,
    }
    this.InformacionActivos.push(info);
    this.cargando = false;
  }

  // Funcion que va a llenar tabla si el activo consultado no tiene mantenimientos
  llenarTablaSinMantenimientos(datos : any){
    this.tipoActivoService.GetId(datos.tpActv_Id).subscribe(datos_tiposActivos => {
      let info : any = {
        Id : datos.actv_Serial,
        Nombre : datos.actv_Nombre,
        TipoActivo : datos_tiposActivos.tpActv_Nombre,
        Fecha : datos.actv_FechaCompra.replace('T00:00:00', ''),
        FechaUltMtto : '',
        PrecioCompra : datos.actv_PrecioCompra,
        PrecioUltMtto : 0,
        PrecioTotalMtto : 0,
        Depreciacion : datos.actv_Depreciacion,
      }
      this.InformacionActivos.push(info);
      this.cargando = false;
    });
  }

  // Funcion que hará que el modal se muestre con la información de los movimientos de un activo
  mostrarModalMovimientos(data : any){
    this.modalMovimientos = true;
    setTimeout(() => {
      this.movimientosActivos.limpiarTodo();
      this.movimientosActivos.modeModal = true;
      let primeraFecha = moment().subtract(1, 'month').format('YYYY-MM-DD');
      this.activosService.GetActivoSerial(data.Id).subscribe(datos_activo => {
        for (let i = 0; i < datos_activo.length; i++) {
          this.movimientosActivos.FormMovimientosMantenimiento.setValue({
            ConsecutivoMovimiento : null,
            IdActivo : datos_activo[i].actv_Id,
            Activo : data.Nombre,
            IdTipoMantenimiento : null,
            TipoMantenimiento : null,
            FechaDaño : null,
            Estado : null,
            FechaInicial : primeraFecha,
            FechaFinal : this.today,
            TipoMovimiento: null,
          });
          this.movimientosActivos.consultar();
        }
      }, error => { this.mostrarError(`Error`, `¡No fue posible buscar el activo ${data.Nombre}!`); });
    }, 50);
  }

  // Funcion que pasará mensajes de advertencia
  mensajesAdvertencia(texto : string){
    Swal.fire({ icon : 'warning', title : `Advertencia`, text : texto });
    this.cargando = false;
  }

  // Funcion que enviaraá mensajes de error
  mensajesError(texto : string, error : any = ''){
    Swal.fire({ icon : 'error', title : `Opps...`, html: `<b>${texto}</b><br>` + `<spam style="color: #f00">${error}</spam>` });
    this.cargando = false;
  }

  // Funcion que limpiará los filtros utilizados en la tabla
  clear(table: Table) {
    table.clear();
  }

    /** Mostrar mensaje de confirmación  */
  mostrarConfirmacion(mensaje : any, titulo?: any) {
   this.messageService.add({severity: 'success', summary: mensaje,  detail: titulo});
  }

  /** Mostrar mensaje de error  */
  mostrarError(mensaje : any, titulo?: any) {
   this.messageService.add({severity:'error', summary: mensaje, detail: titulo});
  }

  /** Mostrar mensaje de advertencia */
  mostrarAdvertencia(mensaje : any, titulo?: any) {
   this.messageService.add({severity:'warn', summary: mensaje, detail: titulo});
  }
}
