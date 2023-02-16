import { Component, Inject, Injectable, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import pdfMake from 'pdfmake/build/pdfmake';
import { Table } from 'primeng/table';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';
import { DetallesAsgRollos_ExtrusionService } from 'src/app/Servicios/DetallesAsgRollosExtrusion/DetallesAsgRollos_Extrusion.service';
import { DtIngRollos_ExtrusionService } from 'src/app/Servicios/DetallesIngresoRollosExtrusion/DtIngRollos_Extrusion.service';
import { EstadosService } from 'src/app/Servicios/Estados/estados.service';
import { RolesService } from 'src/app/Servicios/Roles/roles.service';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-ReporteBodegaExtrusion',
  templateUrl: './ReporteBodegaExtrusion.component.html',
  styleUrls: ['./ReporteBodegaExtrusion.component.css']
})
export class ReporteBodegaExtrusionComponent implements OnInit {

  public FormConsultarFiltros !: FormGroup;
  cargando : boolean = true; //Variable para validar que salga o no la imagen de carga
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  estados : any [] = []; //Variable que almacenará los estados que pueden tener los rollos en esta bodega
  registrosConsultados : any [] = []; //Variable que va a almacenar los diferentes registros consultados
  rollosPdf : any [] = []; //Variable que va a almacenar los rollos que se consultar de una asignacion
  rollosAgrupados : any [] = []; //Variable que va a almacen
  totalRollos : number = 0; //Variable que almacenará el total de rollos
  totalCantidad : number = 0; //Variable que almacenará la cantidad de total de kg de los rollos

  constructor(private frmBuilder : FormBuilder,
                private rolService : RolesService,
                  @Inject(SESSION_STORAGE) private storage: WebStorageService,
                    private estadosService : EstadosService,
                      private ingRollosService : DtIngRollos_ExtrusionService,
                        private salidaRollosService : DetallesAsgRollos_ExtrusionService,) {

    this.FormConsultarFiltros = this.frmBuilder.group({
      Documento : [null, Validators.required],
      ProdNombre : ['', Validators.required],
      Rollo : ['', Validators.required ],
      tipoDoc : ['', Validators.required ],
      fechaDoc: [null, Validators.required],
      fechaFinalDoc: [null, Validators.required],
      estadoRollo: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.lecturaStorage();
    this.obtenerEstados();
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.storage.get('Id');
    this.storage_Nombre = this.storage.get('Nombre');
    this.ValidarRol = this.storage.get('Rol');
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = '$1,';
    return number.toString().replace(exp,rep);
  }

  // Funcion que va a consultar y almacenar los estados que pueden tener los rollos en la bodega de extrusion
  obtenerEstados(){
    this.estadosService.srvObtenerListaEstados().subscribe(datos_estados => {
      for (let i = 0; i < datos_estados.length; i++) {
        if (datos_estados[i].estado_Id == 19 || datos_estados[i].estado_Id == 23) this.estados.push(datos_estados[i]);
      }
    });
  }

  //
  limpiarCampos(){
    this.cargando = true;
    this.FormConsultarFiltros.reset();
    this.registrosConsultados = [];
    this.rollosAgrupados = [];
    this.rollosPdf = [];
    this.totalCantidad = 0;
    this.totalRollos = 0;
  }

  // Funcion que va a consultar por los filtros que se busquen
  consultarFiltros(){
    this.cargando = false;
    this.registrosConsultados = [];
    let ot : any = this.FormConsultarFiltros.value.ot;
    let fechaIni : any = this.FormConsultarFiltros.value.fechaDoc;
    let fechaFin : any = this.FormConsultarFiltros.value.fechaFinalDoc;

    if (fechaIni != null && fechaFin != null) {
      this.ingRollosService.getconsultaRollosFechas(fechaIni, fechaFin).subscribe(datos_factura => {
        for (let i = 0; i < datos_factura.length; i++) {
          this.llenarTabla(datos_factura[i]);
        }
      });
      this.salidaRollosService.getconsultaRollosFechas(fechaIni, fechaFin).subscribe(datos_factura => {
        for (let i = 0; i < datos_factura.length; i++) {
          this.llenarTabla(datos_factura[i]);
        }
      });
    } else if (ot != null) {
      this.ingRollosService.getconsultaRollosOT(ot).subscribe(datos_factura => {
        for (let i = 0; i < datos_factura.length; i++) {
          this.llenarTabla(datos_factura[i]);
        }
      });
      this.salidaRollosService.getconsultaRollosOT(ot).subscribe(datos_factura => {
        for (let i = 0; i < datos_factura.length; i++) {
          this.llenarTabla(datos_factura[i]);
        }
      });
    } else if (fechaIni != null) {
      this.ingRollosService.getconsultaRollosFechas(fechaIni, fechaIni).subscribe(datos_factura => {
        for (let i = 0; i < datos_factura.length; i++) {
          this.llenarTabla(datos_factura[i]);
        }
      });
      this.salidaRollosService.getconsultaRollosFechas(fechaIni, fechaIni).subscribe(datos_factura => {
        for (let i = 0; i < datos_factura.length; i++) {
          this.llenarTabla(datos_factura[i]);
        }
      });
    } else {
      this.ingRollosService.getconsultaRollosFechas(this.today, this.today).subscribe(datos_factura => {
        for (let i = 0; i < datos_factura.length; i++) {
          this.llenarTabla(datos_factura[i]);
        }
      });
      this.salidaRollosService.getconsultaRollosFechas(this.today, this.today).subscribe(datos_factura => {
        for (let i = 0; i < datos_factura.length; i++) {
          this.llenarTabla(datos_factura[i]);
        }
      });
    }
    setTimeout(() => { this.cargando = true; }, 2500);
  }

  // Funcion que servirá para llenar la tabla que se verá que está en la vista con la informacion que devuelve la consulta
  llenarTabla(data : any){
    let info : any = {
      Ot : data.ot,
      Fecha : data.fecha.replace('T00:00:00', ''),
      Tipo : data.tipo,
      Usuario : data.usuario,
    }
    this.registrosConsultados.push(info);
    this.registrosConsultados.sort((a,b) => Number(a.Ot) - Number(b.Ot));
  }

  // Funcion que limpiará la tabla de cualquier filtro que se le haya aplicado
  clear(table: Table) {
    table.clear();
  }

  //Funcion que enviará a una funcion u otra dependiendo del tipo de documento que se desea ver
  tipoPdf(datos : any){
    this.totalCantidad = 0;
    this.totalRollos = 0;
    this.cargando = false;
    this.rollosPdf = [];
    this.rollosAgrupados = [];
    if (datos.Tipo == 'Ingreso de Rollos') this.buscarInfoIngreso(datos.Ot);
    else if (datos.Tipo == 'Salida de Rollos') this.buscarRolloPDFSalida(datos.Ot);
  }

  // Funcion que va a buscar la informacion de los rollos que fueron ingresados
  buscarInfoIngreso(id : number){
    this.ingRollosService.crearPdf(id).subscribe(datos_ingreso => {
      for (let i = 0; i < datos_ingreso.length; i++) {
        let info : any = {
          OT : datos_ingreso[i].dtIngRollo_OT,
          Producto : datos_ingreso[i].prod_Id,
          Nombre : datos_ingreso[i].prod_Nombre,
          Rollo : datos_ingreso[i].rollo_Id,
          Cantidad : this.formatonumeros(datos_ingreso[i].dtIngRollo_Cantidad),
          Cantidad2 : datos_ingreso[i].dtIngRollo_Cantidad,
          Presentacion : datos_ingreso[i].undMed_Id,
          Proceso : 'Extrusión',
        }
        this.rollosPdf.push(info);
        this.rollosPdf.sort((a,b) => Number(a.OT) - Number(b.OT));
      }
    });
    setTimeout(() => { this.AgruparRollos(); }, 1000);
    setTimeout(() => { this.crearPdfEntrada(id) }, 3000);
  }

  // Funcion que traerá los rollos que fueron asignados
  buscarRolloPDFSalida(id : number){
    this.salidaRollosService.crearPdf(id).subscribe(datos_ingreso => {
      for (let i = 0; i < datos_ingreso.length; i++) {
        let info : any = {
          OT : datos_ingreso[i].dtAsgRollos_OT,
          Producto : datos_ingreso[i].prod_Id,
          Nombre : datos_ingreso[i].prod_Nombre,
          Rollo : datos_ingreso[i].rollo_Id,
          Cantidad : this.formatonumeros(datos_ingreso[i].dtAsgRollos_Cantidad),
          Cantidad2 : datos_ingreso[i].dtAsgRollos_Cantidad,
          Presentacion : datos_ingreso[i].undMed_Id,
          Proceso : datos_ingreso[i].proceso_Nombre,
        }
        this.rollosPdf.push(info);
        this.rollosPdf.sort((a,b) => Number(a.Rollo) - Number(b.Rollo));
      }
    });
    setTimeout(() => { this.AgruparRollos(); }, 1000);
    setTimeout(() => { this.crearPDFSalida(id); }, 3000);
  }

  // Funcion que va a agrupar los rollos consultados
  AgruparRollos(){
    let producto : any = [];
    for (let i = 0; i < this.rollosPdf.length; i++) {
      if (!producto.includes(this.rollosPdf[i].OT)) {
        let cantidad : number = 0;
        let cantRollo : number = 0;
        for (let j = 0; j < this.rollosPdf.length; j++) {
          if (this.rollosPdf[i].Producto == this.rollosPdf[j].Producto) {
            cantidad += this.rollosPdf[j].Cantidad2;
            cantRollo += 1;
          }
        }
        if (cantRollo > 0){
          producto.push(this.rollosPdf[i].OT);
          let info : any = {
            OT: this.rollosPdf[i].OT,
            Producto : this.rollosPdf[i].Producto,
            Nombre : this.rollosPdf[i].Nombre,
            Cantidad : this.formatonumeros(cantidad.toFixed(2)),
            Cantidad2 : cantidad,
            Rollos: this.formatonumeros(cantRollo),
            Rollos2: cantRollo,
            Presentacion : this.rollosPdf[i].Presentacion,
          }
          this.rollosAgrupados.push(info);
        }
      }
    }
    setTimeout(() => {
      this.rollosPdf.sort((a,b) => Number(a.OT) - Number(b.OT));
      this.rollosAgrupados.sort((a,b) => Number(a.OT) - Number(b.OT));
      this.calcularTotalRollos();
      this.calcularTotalCantidad();
    }, 500);
  }

  // Funcion que calculará el total de rollos
  calcularTotalRollos() {
    let total = 0;
    for(let sale of this.rollosAgrupados) {
      total += sale.Rollos2;
    }
    this.totalRollos = total;
  }

  // Funcion que calculará el total de la kg
  calcularTotalCantidad() {
    let total = 0;
    for(let sale of this.rollosAgrupados) {
      total += sale.Cantidad2;
    }
    this.totalCantidad = total;
  }

  // Funcion que creará el pdf del ingreso
  crearPdfEntrada(id : any){
    let nombre : string = this.storage.get('Nombre');
    this.ingRollosService.crearPdf(id).subscribe(datos_ingreso => {
      for (let i = 0; i < datos_ingreso.length; i++) {
        for (let j = 0; j < this.rollosPdf.length; j++) {
          const pdfDefinicion : any = {
            info: {
              title: `${id}`
            },
            pageSize: {
              width: 630,
              height: 760
            },
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
                  {
                    image : logoParaPdf,
                    width : 100,
                    height : 80
                  },
                  {
                    text: `Ingreso de Rollos a Bodega de Extrusión`,
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
                  widths: [90, '*', 90, '*'],
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
                        text: `Fecha`
                      },
                      {
                        border: [false, false, false, true],
                        text: `${datos_ingreso[i].ingRollo_Fecha.replace('T00:00:00', '')} ${datos_ingreso[i].ingRollo_Hora}`
                      },
                    ],
                    [
                      {
                        border: [false, false, false, false],
                        text: `Dirección`
                      },
                      {
                        border: [false, false, false, true],
                        text: `${datos_ingreso[i].empresa_Direccion}`
                      },
                      {
                        border: [false, false, false, false],
                        text: `Ciudad`
                      },
                      {
                        border: [false, false, false, true],
                        text: `${datos_ingreso[i].empresa_Ciudad}`
                      },
                    ],
                  ]
                },
                layout: {
                  defaultBorder: false,
                },
                fontSize: 9,
              },
              '\n \n',
              {
                text: `Ingresado Por: ${datos_ingreso[i].nombreCreador}\n`,
                alignment: 'left',
                style: 'header',
              },
              {
                text: `\n\n Consolidado de producto(s) \n `,
                alignment: 'center',
                style: 'header'
              },
              this.table2(this.rollosAgrupados, ['OT', 'Producto', 'Nombre', 'Cantidad', 'Rollos', 'Presentacion']),
              {
                text: `\n\n Información detallada de los Rollos \n `,
                alignment: 'center',
                style: 'header'
              },

              this.table(this.rollosPdf, ['OT', 'Rollo', 'Producto', 'Nombre', 'Cantidad', 'Presentacion', 'Proceso']),
              {
                text: `\nCant. Total: ${this.formatonumeros(this.totalCantidad.toFixed(2))}\n Rollos Totales: ${this.formatonumeros(this.totalRollos.toFixed(2))}`,
                alignment: 'right',
                style: 'header',
              },
            ],
            styles: {
              header: {
                fontSize: 10,
                bold: true
              },
              titulo: {
                fontSize: 20,
                bold: true
              }
            }
          }
          const pdf = pdfMake.createPdf(pdfDefinicion);
          pdf.open();
          setTimeout(() => { (this.cargando = true); }, 1200);
          break;
        }
        break;
      }
    });
  }

  //Funcion que creará el pdf de la asignacion
  crearPDFSalida(id : number){
    let nombre : string = this.storage.get('Nombre');
    this.salidaRollosService.crearPdf(id).subscribe(datos_ingreso => {
      for (let i = 0; i < datos_ingreso.length; i++) {
        for (let j = 0; j < this.rollosPdf.length; j++) {
          const pdfDefinicion : any = {
            info: {
              title: `${id}`
            },
            pageSize: {
              width: 630,
              height: 760
            },
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
                  {
                    image : logoParaPdf,
                    width : 100,
                    height : 80
                  },
                  {
                    text: `Salida de Rollos a Bodega de Extrusión`,
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
                  widths: [90, '*', 90, '*'],
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
                        text: `Fecha`
                      },
                      {
                        border: [false, false, false, true],
                        text: `${datos_ingreso[i].asgRollos_Fecha.replace('T00:00:00', '')} ${datos_ingreso[i].asgRollos_Hora}`
                      },
                    ],
                    [
                      {
                        border: [false, false, false, false],
                        text: `Dirección`
                      },
                      {
                        border: [false, false, false, true],
                        text: `${datos_ingreso[i].empresa_Direccion}`
                      },
                      {
                        border: [false, false, false, false],
                        text: `Ciudad`
                      },
                      {
                        border: [false, false, false, true],
                        text: `${datos_ingreso[i].empresa_Ciudad}`
                      },
                    ],
                  ]
                },
                layout: {
                  defaultBorder: false,
                },
                fontSize: 9,
              },
              '\n \n',
              {
                text: `Ingresado Por: ${datos_ingreso[i].nombreCreador}\n`,
                alignment: 'left',
                style: 'header',
              },
              {
                text: `\n\n Consolidado de producto(s) \n `,
                alignment: 'center',
                style: 'header'
              },
              this.table2(this.rollosAgrupados, ['OT', 'Producto', 'Nombre', 'Cantidad', 'Rollos', 'Presentacion']),
              {
                text: `\n\n Información detallada de los Rollos \n `,
                alignment: 'center',
                style: 'header'
              },

              this.table(this.rollosPdf, ['OT', 'Rollo', 'Producto', 'Nombre', 'Cantidad', 'Presentacion', 'Proceso']),
              {
                text: `\nCant. Total: ${this.formatonumeros(this.totalCantidad.toFixed(2))}\n Rollos Totales: ${this.formatonumeros(this.totalRollos.toFixed(2))}`,
                alignment: 'right',
                style: 'header',
              },
            ],
            styles: {
              header: {
                fontSize: 10,
                bold: true
              },
              titulo: {
                fontSize: 20,
                bold: true
              }
            }
          }
          const pdf = pdfMake.createPdf(pdfDefinicion);
          pdf.open();
          setTimeout(() => { (this.cargando = true); }, 1200);
          break;
        }
        break;
      }
    });
  }

  // funcion que se encagará de llenar la tabla de los rollos en el pdf
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

  // Funcion que genera la tabla donde se mostrará la información de los rollos
  table(data, columns) {
    return {
        table: {
          headerRows: 1,
          widths: [40, 40, 40, 221, 40, 50, 60],
          body: this.buildTableBody(data, columns),
        },
        fontSize: 7,
        layout: {
          fillColor: function (rowIndex, node, columnIndex) {
            return (rowIndex == 0) ? '#CCCCCC' : null;
          }
        }
    };
  }

  // Funcion que genera la tabla donde se mostrará la información de los rollos
  table2(data, columns) {
    return {
        table: {
          headerRows: 1,
          widths: [60, 50, 240, 60, 40, 50],
          body: this.buildTableBody(data, columns),
        },
        fontSize: 7,
        layout: {
          fillColor: function (rowIndex, node, columnIndex) {
            return (rowIndex == 0) ? '#CCCCCC' : null;
          }
        }
    };
  }
}
