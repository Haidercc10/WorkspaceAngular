import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import pdfMake from 'pdfmake/build/pdfmake';
import { MessageService } from 'primeng/api';
import { AppComponent } from 'src/app/app.component';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { DtPreEntregaRollosService } from 'src/app/Servicios/DetallesPreIngresoRollosDespacho/DtPreEntregaRollos.service';
import { PreEntregaRollosService } from 'src/app/Servicios/PreIngresoRollosDespacho/PreEntregaRollos.service';
import { defaultStepOptions, stepsPreIngresoRolloDespacho as defaultSteps } from 'src/app/data';
import { ShepherdService } from 'angular-shepherd';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';

@Component({
  selector: 'app-PreIngresoRollosExtrusion',
  templateUrl: './PreIngresoRollosExtrusion.component.html',
  styleUrls: ['./PreIngresoRollosExtrusion.component.css']
})

export class PreIngresoRollosExtrusionComponent implements OnInit {

  FormConsultarRollos !: FormGroup; //formulario para consultar y crear un ingreso de rollos
  cargando : boolean = false; //Variable para validar que salga o no la imagen de carga
  today : any = moment().format('YYYY-MM-DD');  //Variable que se usará para llenar la fecha actual
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  rollosDisponibles : any [] = []; //Variable que almacenará los difrentes rollos que se hicieron en la orden de trabajo
  rollosSeleccionados : any [] = []; //Variable que va a amacenar los diferentes rollos que se van a insertar
  procesos : any [] = [{ Id : 'EXTRUSION', Nombre: 'Extrusión' }];
  minDate: Date = new Date(); //Variable que validará la fecha minima para los campos Date en el HTML
  rollosAsignados : any = [];
  Total : number = 0; //Variable que va a almacenar la cantidad total de kg de los rollos asignados
  grupoProductos : any [] = []; //Variable que guardará de manera descriminada a cada producto
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro

  constructor(private frmBuilderPedExterno : FormBuilder,
                private AppComponent : AppComponent,
                  private bagProService : BagproService,
                    private dtPreEntRollosService : DtPreEntregaRollosService,
                      private preEntRollosService : PreEntregaRollosService,
                        private messageService: MessageService,
                          private shepherdService: ShepherdService,
                            private mensajeService : MensajesAplicacionService,) {

    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
    this.FormConsultarRollos = this.frmBuilderPedExterno.group({
      OT_Id: [null],
      fechaDoc : [null],
      fechaFinalDoc: [null],
      Proceso : [null, Validators.required],
      Observacion : [''],
    });
  }

  ngOnInit() {
    this.lecturaStorage();
    this.limpiarCampos();
    this.minDate.setDate(25);
    this.minDate.setMonth(8);
    this.minDate.setFullYear(2022);
  }

  // Funcion que va a hacer que se inicie el tutorial in-app
  tutorial(){
    this.shepherdService.defaultStepOptions = defaultStepOptions;
    this.shepherdService.modal = true;
    this.shepherdService.confirmCancel = false;
    this.shepherdService.addSteps(defaultSteps);
    this.shepherdService.start();
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
    if (this.ValidarRol == 8) this.FormConsultarRollos.patchValue({ Proceso : '2', });
    else if (this.ValidarRol == 9) this.FormConsultarRollos.patchValue({ Proceso : '1', });
    else this.FormConsultarRollos.patchValue({ Proceso : '1', });
  }

  // Funcion para limpiar los campos de la vista
  limpiarCampos(){
    this.FormConsultarRollos.reset();
    if (this.ValidarRol == 8) this.FormConsultarRollos.patchValue({ Proceso : 'SELLADO', });
    else if (this.ValidarRol == 9) this.FormConsultarRollos.patchValue({ Proceso : 'EXTRUSION', });
    else this.FormConsultarRollos.patchValue({ Proceso : 'EXTRUSION', });
    this.rollosDisponibles = [];
    this.rollosSeleccionados = [];
    this.grupoProductos = [];
    this.cargando = false;
  }

  // Funcion que va a caonultar la informacion de los rollos de la base de dato
  consultarRollosBagPro(){
    let ProcConsulta : any = this.FormConsultarRollos.value.Proceso;
    let ot : number = this.FormConsultarRollos.value.OT_Id;
    let fechaInicial : any = moment(this.FormConsultarRollos.value.fechaDoc).format('YYYY-MM-DD');
    let fechaFinal : any = moment(this.FormConsultarRollos.value.fechaFinalDoc).format('YYYY-MM-DD');
    if (fechaInicial == 'Invalid date') fechaInicial = this.today;
    if (fechaFinal == 'Invalid date') fechaFinal = fechaInicial;
    let ruta : string = ot != null ? `?ot=${ot}` : '';
    let rollosBagPro : number [] = [];
    let rollosExistentes : number [] = [];

    if (ProcConsulta != null) {
      if (!moment(fechaInicial).isBefore('2022-09-25', 'days') && !moment(fechaFinal).isBefore('2022-09-25', 'days')) {
        this.cargando = true;
        this.bagProService.GetRollosExtrusion_Empaque_Sellado(fechaInicial, fechaFinal, ProcConsulta, ruta).subscribe(data => {
          for (let i = 0; i < data.length; i++) {
            rollosBagPro.push(data[i].rollo);
          }
          setTimeout(() => {
            this.dtPreEntRollosService.GetRollos(rollosBagPro).subscribe(datos => {
              for (let i = 0; i < datos.length; i++) {
                rollosExistentes.push(datos[i].rollo_Id);
              }
              setTimeout(() => {
                for (let i = 0; i < data.length; i++) {
                  if (datos.length > 0 && !rollosExistentes.includes(parseInt(data[i].rollo))) this.llenarRollos(data[i]);
                  else if (datos.length > 0 && rollosExistentes.includes(parseInt(data[i].rollo))) {
                    let nuevo : any [] = datos.filter((item) => item.rollo_Id == data[i].rollo);
                    for (let j = 0; j < nuevo.length; j++) {
                      let proceso : string = 'EXT';
                      if (nuevo[j].proceso_Id != proceso) this.llenarRollos(data[i]);
                    }
                  }
                  if (datos.length == 0) this.llenarRollos(data[i]);
                }
              }, 500);
            });
          }, 1500);
        });
        setTimeout(() => { this.cargando = false; }, 5000);
      } else {
        this.mensajeService.mensajeAdvertencia(`Advertencia`, `¡Las digitadas no son validas!`);
        this.cargando = false;
      }
    } else {
      this.mensajeService.mensajeAdvertencia(`Advertencia`, `¡Debe seleccionar un proceso!`);
      this.cargando = false;
    }
  }

  // Funcion que va a llenar el arry con la información de los rollos
  llenarRollos(data : any){
    let info : any = {
      Ot : data.orden,
      Rollo : parseInt(data.rollo),
      Id_Producto : data.id_Producto,
      Producto : data.producto,
      Cantidad : parseFloat(data.cantidad),
      Presentacion : data.presentacion,
      Estatus : data.proceso,
      Proceso : '',
    }
    if (info.Estatus == 'EXTRUSION') info.Proceso = 'EXT';
    this.rollosDisponibles.push(info);
    this.rollosDisponibles.sort((a,b) => Number(a.Rollo) - Number(b.Rollo));
  }

  /** Función para seleccionar los rollos a insertar (Uno a uno)*/
  cargarRollosInsertar(item) {
    let scrollable : number = window.scrollY;
    this.cargando = true;
    this.rollosDisponibles.splice(this.rollosDisponibles.findIndex((data) => data.Rollo == item.Rollo), 1);
    this.rollosDisponibles.sort((a,b) => Number(a.Rollo) - Number(b.Rollo));
    setTimeout(() => { window.scroll(0, scrollable) }, 10);
    setTimeout(() => { this.GrupoProductos(); }, 50);
  }

  /** Función para seleccionar todos los rollos a insertar */
  cargarTodosRollosInsertar(){
    let scrollable : number = window.scrollY;
    this.cargando = true;
    this.rollosDisponibles = [];
    this.rollosDisponibles.sort((a,b) => Number(a.Rollo) - Number(b.Rollo));
    setTimeout(() => { window.scroll(0, scrollable) }, 10);
    setTimeout(() => { this.GrupoProductos(); }, 50);
  }

  /** Funcion para quitar rollos que hayan sido seleccionados para insertar previamente. */
  quitarRollosInsertar(item) {
    let scrollable : number = window.scrollY;
    this.cargando = true;
    this.rollosSeleccionados.splice(this.rollosSeleccionados.findIndex((data) => data.Rollo == item.Rollo), 1);
    this.rollosDisponibles.sort((a,b) => Number(a.Rollo) - Number(b.Rollo));
    setTimeout(() => { window.scroll(0, scrollable) }, 10);
    setTimeout(() => { this.GrupoProductos(); }, 50);
  }

  /** Funcion para quitar todos los rollos seleccionados para insertar previamente. */
  quitarTodosRollosInsertar(){
    let scrollable : number = window.scrollY;
    this.cargando = true;
    this.rollosSeleccionados = [];
    this.rollosDisponibles.sort((a,b) => Number(a.Rollo) - Number(b.Rollo) );
    setTimeout(() => { window.scroll(0, scrollable) }, 10);
    setTimeout(() => { this.GrupoProductos(); }, 50);
  }

  // Funcion que permitirá ver el total de lo escogido para cada producto
  GrupoProductos(){
    let producto : any = [];
    this.grupoProductos = [];
    for (let i = 0; i < this.rollosSeleccionados.length; i++) {
      if (!producto.includes(this.rollosSeleccionados[i].Id_Producto)) {
        let cantidad : number = 0;
        let cantRollo : number = 0;
        for (let j = 0; j < this.rollosSeleccionados.length; j++) {
          if (this.rollosSeleccionados[i].Id_Producto == this.rollosSeleccionados[j].Id_Producto) {
            cantidad += this.rollosSeleccionados[j].Cantidad;
            cantRollo += 1;
          }
        }
        producto.push(this.rollosSeleccionados[i].Id_Producto);
        let info : any = {
          Id : this.rollosSeleccionados[i].Id_Producto,
          Nombre : this.rollosSeleccionados[i].Producto,
          Cantidad : this.formatonumeros(cantidad.toFixed(2)),
          Rollos: this.formatonumeros(cantRollo.toFixed(2)),
          Presentacion : this.rollosSeleccionados[i].Presentacion,
        }
        this.grupoProductos.push(info);
      }
    }
    setTimeout(() => { this.cargando = false; }, 50);
  }

  //Funcion para meter el encabezado de la entrada
  IngresarInfoRollos(){
    if (this.rollosSeleccionados.length == 0) this.mensajeService.mensajeAdvertencia(`Advertencia`, `!Debe seleccionar minimo un rollo!`);
    else {
      this.cargando = true;
      let info : any = {
        PreEntRollo_Fecha : this.today,
        PreEntRollo_Observacion : this.FormConsultarRollos.value.Observacion,
        Usua_Id : this.storage_Id,
        PreEntRollo_Hora : moment().format('H:mm:ss'),
      }
      this.preEntRollosService.srvGuardar(info).subscribe(datos_entradaRollo => { this.ingresarRollos(datos_entradaRollo.preEntRollo_Id);
      }, () => {
        this.mensajeService.mensajeError(`¡Ha Ocurrido Un Error!`, `¡No ha sido posible crear la PreEntrega de rollo!`);
        this.cargando = false;
      });
    }
  }

  // Funcion par ingresar los rollos
  ingresarRollos(idEntrada : number){
    for (let i = 0; i < this.rollosSeleccionados.length; i++) {
      let info : any = {
        Rollo_Id : this.rollosSeleccionados[i].Rollo,
        DtlPreEntRollo_Cantidad : this.rollosSeleccionados[i].Cantidad,
        UndMed_Rollo : this.rollosSeleccionados[i].Presentacion,
        Proceso_Id : this.rollosSeleccionados[i].Proceso,
        Cli_Id : 1,
        DtlPreEntRollo_OT : parseInt(this.rollosSeleccionados[i].Ot.trim()),
        Prod_Id : parseInt(this.rollosSeleccionados[i].Id_Producto.trim()),
        UndMed_Producto : this.rollosSeleccionados[i].Presentacion,
        preEntRollo_Id : idEntrada,
      }
      this.dtPreEntRollosService.srvGuardar(info).subscribe(() => {
        this.mensajeService.mensajeConfirmacion(`¡PreEntrega Realizada!`, `¡Se ha registrado la PreEntrega de rollos!`);
        this.cargando = false;
      }, () => {
        this.mensajeService.mensajeError(`¡Ha Ocurrido Un Error!`,`¡No fue posible guardar los detalles de cada rollos PreEntregado!`);
        this.cargando = false;
      });
    }
    setTimeout(() => { this.buscarRolloPDF(idEntrada); }, 2000);
  }

  // Funcion que creará un pdf a base de la informacion ingresada en las asignacion de rollos a facturas
  crearPDF(id : number){
    let nombre : string = this.storage_Nombre;
    this.dtPreEntRollosService.srvCrearPDFUltimoId(id).subscribe(datos_factura => {
      for (let i = 0; i < datos_factura.length; i++) {
        for (let j = 0; j < this.rollosAsignados.length; j++) {
          const pdfDefinicion : any = {
            info: {
              title: `${datos_factura[i].preEntRollo_Id}`
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
                    width : 220,
                    height : 50
                  },
                  {
                    text: `Pre Cargue de Rollos`,
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
                        text: `${datos_factura[i].preEntRollo_Fecha.replace('T00:00:00', '')}`
                      },
                    ],
                    [
                      {
                        border: [false, false, false, false],
                        text: `Dirección`
                      },
                      {
                        border: [false, false, false, true],
                        text: `${datos_factura[i].empresa_Direccion}`
                      },
                      {
                        border: [false, false, false, false],
                        text: `Ciudad`
                      },
                      {
                        border: [false, false, false, true],
                        text: `${datos_factura[i].empresa_Ciudad}`
                      },
                    ],
                    [
                      {
                        border: [false, false, false, false],
                        text: `Proceso`
                      },
                      {
                        border: [false, false, false, true],
                        text: `${datos_factura[i].proceso_Nombre}`
                      },
                      {
                        border: [false, false, false, false],
                        text: ``
                      },
                      {
                        border: [false, false, false, true],
                        text: ``
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
                text: `Pre Cargado Por: ${datos_factura[i].usua_Nombre}\n`,
                alignment: 'left',
                style: 'header',
              },
              '\n \n',
              {
                text: `Consolidado de producto(s) \n `,
                alignment: 'center',
                style: 'header'
              },
              this.table2(this.grupoProductos, ['Id', 'Nombre', 'Cantidad', 'Rollos', 'Presentacion']),
              {
                text: ` \n  \n Información detallada de los Rollos \n `,
                alignment: 'center',
                style: 'header'
              },

              this.table(this.rollosAsignados, ['OT', 'Rollo', 'Producto', 'Nombre', 'Cantidad', 'Presentacion']),
              {
                text: `\nCant. Total: ${this.formatonumeros(this.Total.toFixed(2))}\n`,
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
          this.limpiarCampos();
          break;
        }
        break;
      }
    });
  }

  // Funcion que traerá los rollos que fueron asignados a la factura creada
  buscarRolloPDF(id : number){
    this.rollosAsignados = [];
    this.dtPreEntRollosService.srvCrearPDFUltimoId(id).subscribe(datos_factura => {
      for (let i = 0; i < datos_factura.length; i++) {
        let info : any = {
          OT : datos_factura[i].dtlPreEntRollo_OT,
          Rollo : datos_factura[i].rollo_Id,
          "Id Cliente" : datos_factura[i].cli_Id,
          Cliente : datos_factura[i].cli_Nombre,
          Producto : datos_factura[i].prod_Id,
          Nombre : datos_factura[i].prod_Nombre,
          Cantidad : this.formatonumeros(datos_factura[i].dtlPreEntRollo_Cantidad),
          Presentacion : datos_factura[i].undMed_Rollo,
        }
        this.Total += datos_factura[i].dtlPreEntRollo_Cantidad;
        this.rollosAsignados.push(info);
        this.rollosAsignados.sort((a,b) => Number(a.Rollo) - Number(b.Rollo));
      }
    });
    setTimeout(() => { this.crearPDF(id); }, 1200);
  }

  // funcion que se encagará de llenar la tabla de los productos en el pdf
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

  // Funcion que genera la tabla donde se mostrará la información de los productos pedidos
  table(data, columns) {
    return {
      table: {
        headerRows: 1,
        widths: [50, 80, 60, 210, 50, 50],
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

  // Funcion que genera la tabla donde se mostrará la información de los productos pedidos
  table2(data, columns) {
    return {
      table: {
        headerRows: 1,
        widths: [60, 260, 70, 40, 80],
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
