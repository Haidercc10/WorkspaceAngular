import { Component, Inject, Injectable, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, } from '@angular/forms';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import pdfMake from 'pdfmake/build/pdfmake';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { ActivosService } from 'src/app/Servicios/Activos/Activos.service';
import { DetallePedido_MantenimientoService } from 'src/app/Servicios/DetallePedido_Mantenimiento/DetallePedido_Mantenimiento.service';
import { Detalle_MantenimientoService } from 'src/app/Servicios/Detalle_Mantenimiento/Detalle_Mantenimiento.service';
import { EstadosService } from 'src/app/Servicios/Estados/estados.service';
import { Tipo_MantenimientoService } from 'src/app/Servicios/TiposMantenimientos/Tipo_Mantenimiento.service';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-Movimientos_Mantenimiento',
  templateUrl: './Movimientos_Mantenimiento.component.html',
  styleUrls: ['./Movimientos_Mantenimiento.component.css']
})

export class Movimientos_MantenimientoComponent implements OnInit {

  FormMovimientosMantenimiento !: FormGroup;
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  cargando : boolean = false; //Variable que permitirá validar si debe salir o no la imagen de carga
  activos : any [] = []; //Variable que almacenará los activos
  tiposMantenimiento : any [] = []; //Variable que almacenará los diferentes tipos de mantenimientos
  estados : any [] = []; //Variable que almacenará los estados que puede tener un movimiento de mantenimiento
  movimientosConsultados : any [] = []; //Variable que almacenará toda la informacion de los movimientos consultados
  modeModal : boolean = false; //Variable que hará que se muestre el menú lateral o no
  infoPdf : any [] = []; //Variable que tendrá la información los activos de un pedido un mantenimiento consultados

  constructor(private frmBuilder : FormBuilder,
                @Inject(SESSION_STORAGE) private storage: WebStorageService,
                  private activosService : ActivosService,
                    private tipoMantenimientoService : Tipo_MantenimientoService,
                      private estadosService : EstadosService,
                        private dtMantenimientoService : Detalle_MantenimientoService,
                          private dtPedidoMttoService : DetallePedido_MantenimientoService,
                            private messageService: MessageService) {

    this.FormMovimientosMantenimiento = this.frmBuilder.group({
      ConsecutivoMovimiento : [null],
      IdActivo : [null],
      Activo : [null],
      IdTipoMantenimiento : [null],
      TipoMantenimiento : [null],
      FechaDaño : [null],
      Estado : [null],
      FechaInicial : [null],
      FechaFinal : [null],
      TipoMovimiento: [null],
    });
  }

  ngOnInit() {
    this.lecturaStorage();
    this.obtenerActivos();
    this.obtenerTiposMantenimiento();
    this.obtenerEstados();
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.storage.get('Id');
    this.storage_Nombre = this.storage.get('Nombre');
    this.ValidarRol = this.storage.get('Rol');
  }

  // Funcion que va a limpiar todos los campos de la vista
  limpiarTodo(){
    this.movimientosConsultados = [];
    this.FormMovimientosMantenimiento.reset();
  }

  // Funcion que cargará los activos
  obtenerActivos(){
    this.activosService.GetTodo().subscribe(datos_activos => {
      for (let i = 0; i < datos_activos.length; i++) {
        this.activos.push(datos_activos[i]);
      }
    }, error => { this.mostrarError(`Error`, `¡No se encontraron activos para realizar la consulta!`) });
  }

  // Función que obtendrá todos los tipos de mantenimiento
  obtenerTiposMantenimiento(){
    this.tipoMantenimientoService.GetTodo().subscribe(datos_tiposMantenimiento => {
      for (let i = 0; i < datos_tiposMantenimiento.length; i++) {
        this.tiposMantenimiento.push(datos_tiposMantenimiento[i]);
      }
    }, error => { this.mostrarError(`Error`, `¡No se pudieron obtener los diferentes tipos de mantenimientos!`) });
  }

  // Funcion que obtendrá todos los posibles estados que pueden tener los movimientos de mantenimiento
  obtenerEstados(){
    this.estadosService.srvObtenerListaEstados().subscribe(datos_estados => {
      for (let i = 0; i < datos_estados.length; i++) {
        let estados : number [] = [11,26,4,2,17];
        if (estados.includes(datos_estados[i].estado_Id)) this.estados.push(datos_estados[i]);
        this.estados.sort((a,b) => a.estado_Nombre.localeCompare(b.estado_Nombre));
      }
    }, error => { this.mostrarError(`Error`, `¡Error al consultar los estados de los movimientos de mantenimiento!`); });
  }

  // Funcion que tomará el id del activo seleccionado, lo almacenará y cambiará el id por el nombre en el campo de activo
  buscarActivoSeleccionado(){
    let idActivo : any = this.FormMovimientosMantenimiento.value.Activo;
    let nuevo : any[] = this.activos.filter((item) => item.actv_Id == idActivo);
    this.FormMovimientosMantenimiento.patchValue({
      IdActivo : nuevo[0].actv_Id,
      Activo : nuevo[0].actv_Nombre,
    });
  }

  // Funcion que va a tomar el id del tipo de mantenimiento seleccionado, lo almacenará y cambiará el id por el nombre en el campo de tipo de mantenimiento
  buscarTipoMantenimientoSeleccionado(){
    let idMtto : any = this.FormMovimientosMantenimiento.value.TipoMantenimiento;
    let nuevo : any[] = this.tiposMantenimiento.filter((item) => item.tpMtto_Id == idMtto);
    this.FormMovimientosMantenimiento.patchValue({
      IdTipoMantenimiento : nuevo[0].tpMtto_Id,
      TipoMantenimiento : nuevo[0].tpMtto_Nombre,
    });
  }

  // Funcion que va a realizar la consulta de los movimientos
  consultar(){
    this.movimientosConsultados = [];
    let consecutivo : any = this.FormMovimientosMantenimiento.value.ConsecutivoMovimiento;
    let fechaInicial : any = moment(this.FormMovimientosMantenimiento.value.FechaInicial).format('YYYY-MM-DD');
    let fechaFinal : any = moment(this.FormMovimientosMantenimiento.value.FechaFinal).format('YYYY-MM-DD');
    let estado : any = this.FormMovimientosMantenimiento.value.Estado;
    let activo : any = this.FormMovimientosMantenimiento.value.IdActivo;
    let fechaDano : any = this.FormMovimientosMantenimiento.value.FechaDaño;
    let tipoMantenimiento : any = this.FormMovimientosMantenimiento.value.IdTipoMantenimiento;
    let ruta : string = ``;

    if (fechaInicial == 'Invalid date') fechaInicial = null;
    if (fechaFinal == 'Invalid date') fechaFinal = null;
    if (fechaInicial == null) fechaInicial = this.today;
    if (fechaFinal == null) fechaFinal = fechaInicial;

    if (consecutivo != null && estado != null && fechaDano != null && tipoMantenimiento != null && activo != null) ruta = `?consecutivo=${consecutivo}&estado=${estado}&fechaDa%C3%B1o=${fechaDano}&tipoMtto=${tipoMantenimiento}&activo=${activo}`
    else if (consecutivo != null && estado != null && fechaDano != null && tipoMantenimiento != null) ruta = `?consecutivo=${consecutivo}&estado=${estado}&fechaDa%C3%B1o=${fechaDano}&tipoMtto=${tipoMantenimiento}&activo=${activo}`
    else if (consecutivo != null && estado != null && fechaDano != null && activo != null) ruta = `?consecutivo=${consecutivo}&estado=${estado}&fechaDa%C3%B1o=${fechaDano}&activo=${activo}`
    else if (consecutivo != null && estado != null && tipoMantenimiento != null && activo != null) ruta = `?consecutivo=${consecutivo}&estado=${estado}&tipoMtto=${tipoMantenimiento}&activo=${activo}`
    else if (consecutivo != null && fechaDano != null && tipoMantenimiento != null && activo != null) ruta = `?consecutivo=${consecutivo}&fechaDa%C3%B1o=${fechaDano}&tipoMtto=${tipoMantenimiento}&activo=${activo}`
    else if (estado != null && fechaDano != null && tipoMantenimiento != null && activo != null) ruta = `?estado=${estado}&fechaDa%C3%B1o=${fechaDano}&tipoMtto=${tipoMantenimiento}&activo=${activo}`
    else if (consecutivo != null && estado != null && fechaDano != null) ruta = `?consecutivo=${consecutivo}&estado=${estado}&fechaDa%C3%B1o=${fechaDano}`
    else if (consecutivo != null && estado != null && tipoMantenimiento != null) ruta = `?consecutivo=${consecutivo}&estado=${estado}&tipoMtto=${tipoMantenimiento}`
    else if (consecutivo != null && estado != null && activo != null) ruta = `?consecutivo=${consecutivo}&estado=${estado}&activo=${activo}`
    else if (consecutivo != null && fechaDano != null && tipoMantenimiento != null) ruta = `?consecutivo=${consecutivo}&fechaDa%C3%B1o=${fechaDano}&tipoMtto=${tipoMantenimiento}`
    else if (consecutivo != null && fechaDano != null && activo != null) ruta = `?consecutivo=${consecutivo}&fechaDa%C3%B1o=${fechaDano}&activo=${activo}`
    else if (consecutivo != null && tipoMantenimiento != null && activo != null) ruta = `?consecutivo=${consecutivo}&tipoMtto=${tipoMantenimiento}&activo=${activo}`
    else if (estado != null && fechaDano != null && tipoMantenimiento != null) ruta = `?estado=${estado}&fechaDa%C3%B1o=${fechaDano}&tipoMtto=${tipoMantenimiento}`
    else if (estado != null && fechaDano != null && activo != null) ruta = `?estado=${estado}&fechaDa%C3%B1o=${fechaDano}&activo=${activo}`
    else if (fechaDano != null && tipoMantenimiento != null && activo != null) ruta = `?fechaDa%C3%B1o=${fechaDano}&tipoMtto=${tipoMantenimiento}&activo=${activo}`
    else if (consecutivo != null && estado != null) ruta = `?consecutivo=${consecutivo}&estado=${estado}`
    else if (consecutivo != null && fechaDano != null) ruta = `?consecutivo=${consecutivo}&fechaDa%C3%B1o=${fechaDano}`
    else if (consecutivo != null && tipoMantenimiento != null) ruta = `?consecutivo=${consecutivo}&tipoMtto=${tipoMantenimiento}`
    else if (consecutivo != null && activo != null) ruta = `?consecutivo=${consecutivo}&activo=${activo}`
    else if (estado != null && fechaDano != null) ruta = `?estado=${estado}&fechaDa%C3%B1o=${fechaDano}`
    else if (estado != null && tipoMantenimiento != null) ruta = `?estado=${estado}&tipoMtto=${tipoMantenimiento}`
    else if (estado != null && activo != null) ruta = `?estado=${estado}&activo=${activo}`
    else if (fechaDano != null && tipoMantenimiento != null) ruta = `?fechaDa%C3%B1o=${fechaDano}&tipoMtto=${tipoMantenimiento}`
    else if (fechaDano != null && activo != null) ruta = `?fechaDa%C3%B1o=${fechaDano}&activo=${activo}`
    else if (tipoMantenimiento != null && activo != null) ruta = `?tipoMtto=${tipoMantenimiento}&activo=${activo}`
    else if (consecutivo != null) ruta = `?consecutivo=${consecutivo}`
    else if (estado != null) ruta = `?estado=${estado}`
    else if (fechaDano != null) ruta = `?fechaDa%C3%B1o=${fechaDano}`
    else if (tipoMantenimiento != null)  ruta = `?tipoMtto=${tipoMantenimiento}`
    else if (activo != null) ruta = `?activo=${activo}`

    this.activosService.GetMovimiento(fechaInicial, fechaFinal, ruta).subscribe(datos_movimientos => {
      for (let i = 0; i < datos_movimientos.length; i++) {
        this.llenarTabla(datos_movimientos[i]);
      }
    }, error => { this.mostrarError(`Error`, `¡No se ha encontrado información de movimientos entre el día ${fechaInicial} y el día ${fechaFinal}!`); });
  }

  // Funcion que va a llenar la tabla con la información colsutada
  llenarTabla(data : any){
    let info : any = {
      Consecutivo : data.id_Movimiento,
      TipoMov : data.tipo_Movimiento,
      Fecha : (data.fecha).replace('T00:00:00', ''),
      Estado_Id : data.estado_Id,
      Estado : data.estado_Nombre,
      Activo_Id : data.activo_Id,
      Activo : data.activo_Nombre,
      FechaDano : (data.fecha_Dano).replace('T00:00:00', ''),
      TipoMtto_Id : data.tipoMantenimiento_Id,
      TipoMtto : data.tipoMantenimiento_Nombre,
    }
    this.movimientosConsultados.push(info);
  }

  // Funcion que va a validar si el pdf que se quiere ver es un pedido de mantenimiento o un mantenimiento
  validarPDF(data : any){
    if (data.TipoMov == 'Pedido de Mantenimiento') this.llenarDatosPedido(data);
    else if (data.TipoMov == 'Mantenimiento') this.llenarDatosMantenimiento(data);
  }

  // Funcion que va a llenar un array con la información de los activos de un pedido
  llenarDatosPedido(data : any){
    this.infoPdf = [];
    this.dtPedidoMttoService.GetPDFPedido(data.Consecutivo).subscribe(datos_pedido => {
      for (let i = 0; i < datos_pedido.length; i++) {
        let info : any = {
          Id : datos_pedido[i].actv_Id,
          Serial: datos_pedido[i].actv_Serial,
          Nombre: datos_pedido[i].actv_Nombre,
          "Fecha Falla" : datos_pedido[i].dtPedMtto_FechaFalla.replace('T00:00:00', ''),
          "Tipo Mtto" : datos_pedido[i].tpMtto_Nombre,
        }
        this.infoPdf.push(info);
      }
      setTimeout(() => { this.crearPdfPedido(data); }, datos_pedido.length * 5);
    }, error => { this.mostrarError(`¡No se ha podido encontrar información sobre el pedido con el consecutivo ${data.consecutivo}!`); });
  }

  // Funcion que va a llenar un array con la información de los activos de un mantenimiento
  llenarDatosMantenimiento(data : any){
    this.infoPdf = [];
    this.dtMantenimientoService.GetPDFMantenimiento(data.Consecutivo).subscribe(datos_mantenimiento => {
      for (let i = 0; i < datos_mantenimiento.length; i++) {
        let info : any = {
          Id : datos_mantenimiento[i].actv_Id,
          Serial: datos_mantenimiento[i].actv_Serial,
          Nombre: datos_mantenimiento[i].actv_Nombre,
          "Tipo Mtto" : datos_mantenimiento[i].tpMtto_Nombre,
          Estado : datos_mantenimiento[i].estado_Nombre,
        }
        this.infoPdf.push(info);
      }
      setTimeout(() => { this.crearPdfMantenimiento(data); }, datos_mantenimiento.length * 5);
    }, error => { this.mostrarError(`Error`, `¡No se ha podido encontrar información sobre el mantenimiento con el consecutivo ${data.consecutivo}!`); });
  }

  // Funcion que va a crear un PDF con base en la información que le sea suministrada
  crearPdfPedido(data : any){
    this.dtPedidoMttoService.GetPDFPedido(data.Consecutivo).subscribe(datos_pedido => {
      for (let i = 0; i < datos_pedido.length; i++) {
        const pdfDefinicion : any = {
          info: { title: `Pedido de Mantenimiento N° ${datos_pedido[i].pedMtto_Id}` },
          pageSize: { width: 630, height: 760 },
          footer: {
            columns: [
              { text: `Fecha Expedición Documento ${this.today} - ${moment().format('H:mm:ss')}`, alignment: 'right', fontSize: 8, margin: [0, 0, 20, 0] }
            ]
          },
          content : [
            { text: `Pedido de Mantenimiento N° ${datos_pedido[i].pedMtto_Id}`, alignment: 'right', style: 'titulo', },
            '\n \n',
            {
              style: 'tablaEmpresa',
              table: {
                widths: [90, 167, 90, 166],
                style: 'header',
                body: [
                  [
                    { border: [false, false, false, false], text: `Nombre Empresa` },
                    { border: [false, false, false, true], text: `Plasticaribe S.A.S` },
                    { border: [false, false, false, false], text: `Fecha` },
                    { border: [false, false, false, true], text: `${datos_pedido[i].pedMtto_Fecha.replace('T00:00:00', '')}` },
                  ],
                  [
                    { border: [false, false, false, false], text: `Dirección` },
                    { border: [false, false, false, true], text: `${datos_pedido[i].empresa_Direccion}` },
                    { border: [false, false, false, false], text: `Ciudad` },
                    { border: [false, false, false, true], text: `${datos_pedido[i].empresa_Ciudad}` },
                  ],
                ]
              },
              layout: { defaultBorder: false, },
              fontSize: 9,
            },
            '\n \n',
            { text: `Ingresados Por:\n`, alignment: 'left', style: 'header', },
            { text: `${datos_pedido[i].nombreCreador}\n`, alignment: 'left', style: 'texto', },
            { text: `\nObservación:`, alignment: 'left', style: 'header' },
            { text: `${datos_pedido[i].pedMtto_Observacion} `, alignment: 'left', style: 'texto' },
            { text: `\n\n Información detallada de los Activos \n `, alignment: 'center', style: 'header' },

            this.table(this.infoPdf, ['Id', 'Serial', 'Nombre', 'Fecha Falla', 'Tipo Mtto']),
          ],
          styles: {
            header: { fontSize: 10, bold: true },
            texto: { fontSize: 9, },
            titulo: { fontSize: 20, bold: true }
          }
        }
        const pdf = pdfMake.createPdf(pdfDefinicion);
        pdf.open();
        this.cargando = false;
        break;
      }
    }, error => { this.mostrarError(`Error`, `¡No se ha podido encontrar información sobre el pedido con el consecutivo ${data.consecutivo}!`); });
  }

  // Funcion que va a crear un PDF con base en la información que le sea suministrada
  crearPdfMantenimiento(data : any){
    let nombre : string = this.storage.get('Nombre');
    this.dtMantenimientoService.GetPDFMantenimiento(data.Consecutivo).subscribe(datos_mantenimiento => {
      for (let i = 0; i < datos_mantenimiento.length; i++) {
        const pdfDefinicion : any = {
          info: { title: `Mantenimiento de Activos N° ${datos_mantenimiento[i].mtto_Id}` },
          pageSize: { width: 630, height: 760 },
          footer: function(currentPage : any, pageCount : any) {
            return [
              {
                columns: [
                  { text: `Reporte generado por ${nombre}`, alignment: ' left', fontSize: 8, margin: [30, 0, 0, 0] },
                  { text: `Fecha Expedición Documento ${moment().format('YYYY-MM-DD')} - ${moment().format('H:mm:ss')}`, alignment: 'right', fontSize: 8 },
                  { text: `${currentPage.toString() + ' de ' + pageCount}`, alignment: 'right', fontSize: 8, margin: [0, 0, 30, 0] },
                ]
              }
            ]
          },
          content : [
            {
              columns: [
                { image : logoParaPdf, width : 220, height : 50 },
                {
                  text: `Mantenimiento de Activos N° ${datos_mantenimiento[i].mtto_Id}`,
                  alignment: 'right',
                  style: 'titulo',
                  margin: 30
                }
              ]
            },
            '\n \n',
            {
              style: 'tablaEmpresa',
              table: {
                widths: [90, 167, 90, 166],
                style: 'header',
                body: [
                  [
                    {
                      border: [false, false, false, false],
                      text: `Nombre Empresa`
                    },
                    {
                      border: [false, false, false, true],
                      text: `Plasticaribe S.A.S`
                    },
                    {
                      border: [false, false, false, false],
                      text: `Dirección`
                    },
                    {
                      border: [false, false, false, true],
                      text: `${datos_mantenimiento[i].empresa_Direccion}`
                    },
                  ],
                  [
                    {
                      border: [false, false, false, false],
                      text: `Ciudad`
                    },
                    {
                      border: [false, false, false, true],
                      text: `${datos_mantenimiento[i].empresa_Ciudad}`
                    },
                    {
                      border: [false, false, false, false],
                      text: `Fecha registro`
                    },
                    {
                      border: [false, false, false, true],
                      text: `${datos_mantenimiento[i].mtto_FechaRegistro.replace('T00:00:00', '')}`
                    },
                  ],
                  [
                    {
                      border: [false, false, false, false],
                      text: `Fecha Inicio`
                    },
                    {
                      border: [false, false, false, true],
                      text: `${datos_mantenimiento[i].mtto_FechaInicio.replace('T00:00:00', '')}`
                    },
                    {
                      border: [false, false, false, false],
                      text: `Fecha Finalización`
                    },
                    {
                      border: [false, false, false, true],
                      text: `${datos_mantenimiento[i].mtto_FechaFin.replace('T00:00:00', '')}`
                    },
                  ],
                ]
              },
              layout: {
                defaultBorder: false,
              },
              fontSize: 9,
            },
            {
              text: `\n\n Información de la Empresa Encargada del Mantenimiento \n `,
              alignment: 'center',
              style: 'header'
            },
            {
              table: {
                widths: [171,171, 171],
                style: 'header',
                body: [
                  [
                    `ID: ${datos_mantenimiento[i].prov_Id}`,
                    `Tipo de ID: ${datos_mantenimiento[i].tipoIdentificacion_Id}`,
                    `Nombre: ${datos_mantenimiento[i].prov_Nombre}`,
                  ],
                  [
                    `Telefono: ${datos_mantenimiento[i].prov_Telefono}`,
                    `Ciudad: ${datos_mantenimiento[i].prov_Ciudad}`,
                    `E-mail: ${datos_mantenimiento[i].prov_Email}`,
                  ]
                ]
              },
              layout: 'lightHorizontalLines',
              fontSize: 9,
            },
            '\n \n',
            {
              text: `Ingresados Por:\n`,
              alignment: 'left',
              style: 'header',
            },
            {
              text: `${datos_mantenimiento[i].nombreCreador}\n`,
              alignment: 'left',
              style: 'texto',
            },
            {
              text: `\nObservación:`,
              alignment: 'left',
              style: 'header'
            },
            {
              text: `${datos_mantenimiento[i].mtto_Observacion} `,
              alignment: 'left',
              style: 'texto'
            },
            {
              text: `\n\n Información detallada de los Activos \n `,
              alignment: 'center',
              style: 'header'
            },

            this.table(this.infoPdf, ['Id', 'Serial', 'Nombre', 'Estado', 'Tipo Mtto']),
          ],
          styles: {
            header: {
              fontSize: 10,
              bold: true
            },
            texto: {
              fontSize: 9,
            },
            titulo: {
              fontSize: 20,
              bold: true
            }
          }
        }
        const pdf = pdfMake.createPdf(pdfDefinicion);
        pdf.open();
        this.cargando = false;
        break;
      }
    }, error => { this.mostrarError(`Error`, `¡No se ha podido encontrar información sobre el mantenimiento con el consecutivo ${data.consecutivo}!`); });
  }

  // funcion que se encagará de llenar la tabla del pdf
  buildTableBody(data, columns) {
    var body = [];
    body.push(columns);
    data.forEach(function(row) {
      var dataRow = [];
      columns.forEach(function(column) {
        dataRow.push(row[column].toString());
      });
      body.push(dataRow);
    });
    return body;
  }

  // Funcion que genera la tabla donde se mostrará la información consultada de un pedido de mantenimiento
  table(data, columns) {
    return {
      table: {
        headerRows: 1,
        widths: [30, 60, 215, 70, 126],
        body: this.buildTableBody(data, columns),
      },
      fontSize: 8,
      layout: {
        fillColor: function (rowIndex, node, columnIndex) {
          return (rowIndex == 0) ? '#CCCCCC' : null;
        }
      }
    };
  }

  // Funcion que limpiará los filtros utilizados en la tabla
  clear(table: Table) {
    table.clear();
  }

    /** Mostrar mensaje de confirmación  */
  mostrarConfirmacion(mensaje : any, titulo?: any) {
   this.messageService.add({severity: 'success', summary: mensaje,  detail: titulo, life: 2000});
  }

  /** Mostrar mensaje de error  */
  mostrarError(mensaje : any, titulo?: any) {
   this.messageService.add({severity:'error', summary: mensaje, detail: titulo, life: 5000});
   this.cargando = false;
  }

  /** Mostrar mensaje de advertencia */
  mostrarAdvertencia(mensaje : any, titulo?: any) {
   this.messageService.add({severity:'warn', summary: mensaje, detail: titulo, life: 2000});
   this.cargando = false;
  }

}
