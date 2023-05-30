import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShepherdService } from 'angular-shepherd';
import moment from 'moment';
import pdfMake from 'pdfmake/build/pdfmake';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { DtIngRollos_ExtrusionService } from 'src/app/Servicios/DetallesIngresoRollosExtrusion/DtIngRollos_Extrusion.service';
import { IngRollos_ExtrusuionService } from 'src/app/Servicios/IngresoRollosBodegaExtrusion/IngRollos_Extrusuion.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { AppComponent } from 'src/app/app.component';
import { defaultStepOptions, stepsIngresoRollosExtrusion as defaultSteps } from 'src/app/data';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';

@Component({
  selector: 'app-IngresoRollos_Extrusion',
  templateUrl: './IngresoRollos_Extrusion.component.html',
  styleUrls: ['./IngresoRollos_Extrusion.component.css']
})
export class IngresoRollos_ExtrusionComponent implements OnInit {

  public FormConsultarRollos !: FormGroup; //formulario para consultar y crear un ingreso de rollos
  cargando : boolean = true; //Variable para validar que salga o no la imagen de carga
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  grupoProductos : any [] = []; //Variable que guardará de manera descriminada a cada producto
  rollosSinIngresar : number = 0; // variable para calcular la cantidad de rollos que no se han ingresado
  rollosIngresados : number = 0; //variable para calcular la cantidad de rollos que se han ingresado
  rollos : any [] = []; //Variable que almacenará los difrentes rollos que se hicieron en la orden de trabajo
  rollosInsertar : any [] = []; //Variable que va a amacenar los diferentes rollos que se van a insertar
  totalRollos : number = 0;
  totalCantidad : number = 0;
  rollosPDF : any [] = [];
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro

  constructor(private frmBuilderPedExterno : FormBuilder,
                private AppComponent : AppComponent,
                  private bagProService : BagproService,
                    private IngRollosService : IngRollos_ExtrusuionService,
                      private dtIngRollosService : DtIngRollos_ExtrusionService,
                        private shepherdService: ShepherdService,
                          private mensajeService : MensajesAplicacionService,) {

    this.FormConsultarRollos = this.frmBuilderPedExterno.group({
      OT_Id: [null],
      IdRollo : [null],
      fechaDoc : [null],
      fechaFinalDoc: [null],
      Proceso : [null, Validators.required],
      Observacion : [''],
    });

    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
  }

  ngOnInit() {
    this.lecturaStorage();
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
  }

  // funcion que va a limpiar los campos del formulario
  limpiarForm = () => this.FormConsultarRollos.reset();

  // Funcion que va a limpiar todos los campos
  limpiarCampos(){
    this.FormConsultarRollos.reset();
    this.rollos = [];
    this.rollosInsertar = [];
    this.grupoProductos = [];
    this.rollosIngresados = 0,
    this.rollosSinIngresar = 0,
    this,this.totalCantidad = 0;
    this.totalRollos = 0;
    this.cargando = true;
  }

  // Funcion que va a consultar los rollos mediante los parametros pasados por el usuario
  consultarRollos(){
    let ot : number = this.FormConsultarRollos.value.OT_Id;
    let fechaInicial : any = moment(this.FormConsultarRollos.value.fechaDoc).format('YYYY-MM-DD');
    let fechaFinal : any = moment(this.FormConsultarRollos.value.fechaFinalDoc).format('YYYY-MM-DD');
    let rollo : number = this.FormConsultarRollos.value.IdRollo;
    let proceso = 'EXTRUSION';
    let rollosBagPro : number [] = [];
    let rollosExistentes : number [] = [];
    let ruta : string = '';
    fechaInicial == 'Invalid date' ? fechaInicial = this.today : fechaInicial;
    fechaFinal == 'Invalid date' ? fechaFinal = fechaInicial : fechaFinal;

    if (ot != null && rollo != null) ruta = `?ot=${ot}&rollo=${rollo}`;
    else if (ot != null) ruta = `?ot=${ot}`;
    else if (rollo != null) ruta = `?rollo=${rollo}`;

    if (!moment(fechaInicial).isBefore('2022-09-23', 'days') && !moment(fechaFinal).isBefore('2022-09-23', 'days')) {
      this.cargando = false;
      this.rollosSinIngresar = 0;
      this.rollosIngresados = 0;
      this.rollos = [];
      this.rollosInsertar = [];
      this.grupoProductos = [];

      this.bagProService.GetRollosExtrusion_Empaque_Sellado(fechaInicial, fechaFinal, proceso, ruta).subscribe(data => {
        for (let i = 0; i < data.length; i++) {
          rollosBagPro.push(data[i].rollo);
        }
        setTimeout(() => {
          this.dtIngRollosService.GetRollos(rollosBagPro).subscribe(datos => {
            for (let i = 0; i < datos.length; i++) {
              rollosExistentes.push(datos[i].rollo_Id);
            }
            setTimeout(() => {
              for (let i = 0; i < data.length; i++) {
                if (datos.length > 0 && !rollosExistentes.includes(parseInt(data[i].rollo))) this.llenarRollosIngresar(data[i]);
                else if (datos.length > 0 && rollosExistentes.includes(parseInt(data[i].rollo))) {
                  let nuevo : any [] = datos.filter((item) => item.rollo_Id == data[i].rollo);
                  for (let j = 0; j < nuevo.length; j++) {
                    if (nuevo[j].proceso_Id != 'EXT') this.llenarRollosIngresar(data[i]);
                    else this.llenarRollosIngresados(data[i]);
                  }
                }
                if (datos.length == 0) this.llenarRollosIngresar(data[i]);
              }
            }, 500);
          });
        }, 2500);
      });
      setTimeout(() => { this.cargando = true; }, 6000);
    } else this.mensajeService.mensajeAdvertencia(`Advertencia`,`La fecha seleccionada no es valida!`);

  }

  // Funcion que va a llenar los rollos que estan disponibles para ser ingresados
  llenarRollosIngresar(data : any){
    let info : any = {
      Ot : data.orden,
      Rollo : parseInt(data.rollo),
      Id_Producto : data.id_Producto,
      Producto : data.producto,
      Cantidad : parseFloat(data.cantidad),
      Presentacion : data.presentacion,
      Estatus : data.proceso,
      Proceso : 'EXT',
      exits : false,
    }
    this.rollosSinIngresar += 1;
    this.rollos.push(info);
    this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
    this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
  }

  // Funcion que va a llenar los diferentes rollos que ya han sido ingresados
  llenarRollosIngresados(data : any){
    let info : any = {
      Ot : data.orden,
      Rollo : parseInt(data.rollo),
      Id_Producto : data.id_Producto,
      Producto : data.producto,
      Cantidad : parseFloat(data.cantidad),
      Presentacion : data.presentacion,
      Estatus : data.proceso,
      Proceso : 'EXT',
      exits : true,
    }
    this.rollosIngresados += 1;
    this.rollos.push(info);
    this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
    this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
  }

  // Funcion que colocará los rollos que se van a insertar
  llenarRollosAIngresar(item : any){
    this.rollos.splice(this.rollos.findIndex((data) => data.Id == item.Id), 1);
    this.rollosInsertar.sort((a,b) => Number(a.Rollo) - Number(b.Rollo) );
    this.rollosInsertar.sort((a,b) => Number(a.exits) - Number(b.exits) );
    this.GrupoProductos();
  }

  // Funcion que seleccionará y colocará todos los rollos que se van a insertar
  seleccionarTodosRollos(item : any){
    this.rollos = [];
    this.rollos = item.filter((data) => data.exits);
    this.rollosInsertar.sort((a,b) => Number(a.Rollo) - Number(b.Rollo) );
    this.rollosInsertar.sort((a,b) => Number(a.exits) - Number(b.exits) );
    this.GrupoProductos();
  }

  //Funcion que va a quitar lo rollos que se van a insertar
  quitarRollosAIngresar(item : any){
    this.rollosInsertar.splice(this.rollosInsertar.findIndex((data) => data.Id == item.Id), 1);
    this.rollos.sort((a,b) => Number(a.Rollo) - Number(b.Rollo) );
    this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
    this.GrupoProductos();
  }

  // Funcion que va a quitar todos los rollos que se van a insertar
  quitarTodosRollos(item : any){
    this.rollos.sort((a,b) => Number(a.Rollo) - Number(b.Rollo) );
    this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
    this.rollosInsertar = [];
    this.GrupoProductos();
  }

  // Funcion que permitirá ver el total de lo escogido para cada producto
  GrupoProductos(){
    let producto : any = [];
    this.grupoProductos = [];
    for (let i = 0; i < this.rollosInsertar.length; i++) {
      if (!producto.includes(this.rollosInsertar[i].Id_Producto)) {
        let cantidad : number = 0;
        let cantRollo : number = 0;
        for (let j = 0; j < this.rollosInsertar.length; j++) {
          if (this.rollosInsertar[i].Id_Producto == this.rollosInsertar[j].Id_Producto && !this.rollosInsertar[j].exits && !this.rollosInsertar[j].exits) {
            cantidad += this.rollosInsertar[j].Cantidad;
            cantRollo += 1;
          }
        }
        if (cantRollo > 0){
          producto.push(this.rollosInsertar[i].Id_Producto);
          let info : any = {
            Ot: this.rollosInsertar[i].Ot,
            Id : this.rollosInsertar[i].Id_Producto,
            Nombre : this.rollosInsertar[i].Producto,
            Cantidad : this.formatonumeros(cantidad.toFixed(2)),
            Cantidad2 : cantidad,
            Rollos: this.formatonumeros(cantRollo),
            Rollos2: cantRollo,
            Presentacion : this.rollosInsertar[i].Presentacion,
          }
          this.grupoProductos.push(info);
        }
      }
    }
    setTimeout(() => {
      this.rollosInsertar.sort((a,b) => Number(a.Rollo) - Number(b.Rollo) );
      this.rollosInsertar.sort((a,b) => Number(a.exits) - Number(b.exits) );
      this.grupoProductos.sort((a,b) => Number(a.Ot) - Number(b.Ot));
      this.calcularTotalRollos();
      this.calcularTotalCantidad();
    }, 500);
  }

  // Funcion que calculará el total de rollos que se están signanado
  calcularTotalRollos() {
    let total = 0;
    for(let sale of this.grupoProductos) {
      total += sale.Rollos2;
    }
    this.totalRollos = total;
  }

  // Funcion que calculará el total de la kg que se está ingresando
  calcularTotalCantidad() {
    let total = 0;
    for(let sale of this.grupoProductos) {
      total += sale.Cantidad2;
    }
    this.totalCantidad = total;
  }

  //Funcion que creará el ingreso de los rollos
  ingresaroRollos(){
    if (this.rollosInsertar.length == 0) this.mensajeService.mensajeAdvertencia(`Advertencia`,`Debe selecionar minimo un rollo para realizar el ingreso!`);
    else {
      let Observacion : string = this.FormConsultarRollos.value.Observacion;
      this.cargando = false;
      let info : any = {
        IngRollo_Observacion : Observacion,
        Usua_Id : this.storage_Id,
        IngRollo_Fecha : this.today,
        IngRollo_Hora : moment().format("H:mm:ss"),
      }
      this.IngRollosService.srvGuardar(info).subscribe(datos_rollos => { this.DtIngresarRollos(datos_rollos.ingRollo_Id);
      }, () => this.mensajeService.mensajeError(`Error`,`Error al ingresar los rollos!`));
    }
  }

  // Funcion que creará el ingreso de cada uno de los rollos a la base de datos
  DtIngresarRollos(id : number){
    for (let i = 0; i < this.rollosInsertar.length; i++) {
      if (!this.rollosInsertar[i].exits) {
        let info : any = {
          IngRollo_Id : id,
          Rollo_Id : this.rollosInsertar[i].Rollo,
          DtIngRollo_Cantidad : this.rollosInsertar[i].Cantidad,
          UndMed_Id : this.rollosInsertar[i].Presentacion,
          DtIngRollo_OT : this.rollosInsertar[i].Ot,
          Estado_Id : 19,
          Proceso_Id : 'EXT',
          Prod_Id : parseInt(this.rollosInsertar[i].Id_Producto),
        }
        this.dtIngRollosService.srvGuardar(info).subscribe(() => {
        }, () => this.mensajeService.mensajeError(`Error`,`Error al ingresar los rollos!`));
      }
    }
    setTimeout(() => { this.finalizarInsercion(id); }, 5000);
  }

  //Funcion que se encargará de lenviar el mensaje de confirmación del envio y limpiará los campos
  finalizarInsercion(id : number){
    this.mensajeService.mensajeConfirmacion(`Confirmación`,`${this.totalRollos} rollos han sido ingresados correctamente!`);
    this.buscarRolloPDF(id);
  }

  // Funcion que creará un pdf a base de la informacion ingresada en las asignacion de rollos a facturas
  crearPDF(id : number){
    let nombre : string = this.AppComponent.storage_Nombre;
    this.dtIngRollosService.crearPdf(id).subscribe(datos_ingreso => {
      for (let i = 0; i < datos_ingreso.length; i++) {
        for (let j = 0; j < this.rollosPDF.length; j++) {
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
                    width : 220,
                    height : 50
                  },
                  {
                    text: `Cargue de Rollos`,
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
              this.table2(this.grupoProductos, ['Id', 'Nombre', 'Cantidad', 'Rollos', 'Presentacion']),
              {
                text: `\n\n Información detallada de los Rollos \n `,
                alignment: 'center',
                style: 'header'
              },

              this.table(this.rollosPDF, ['OT', 'Rollo', 'Producto', 'Nombre', 'Cantidad', 'Presentacion']),
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
          setTimeout(() => { (this.limpiarCampos()); }, 1200);
          break;
        }
        break;
      }
    }, () => this.mensajeService.mensajeError(`Error`,`No se pudo obtener la información del último ingreso de rollos!`));
  }

  // Funcion que traerá los rollos que fueron ingresados
  buscarRolloPDF(id : number){
    this.rollosPDF = [];
    this.dtIngRollosService.crearPdf(id).subscribe(datos_ingreso => {
      for (let i = 0; i < datos_ingreso.length; i++) {
        let info : any = {
          OT : datos_ingreso[i].dtIngRollo_OT,
          Producto : datos_ingreso[i].prod_Id,
          Nombre : datos_ingreso[i].prod_Nombre,
          Rollo : datos_ingreso[i].rollo_Id,
          Cantidad : this.formatonumeros(datos_ingreso[i].dtIngRollo_Cantidad),
          Presentacion : datos_ingreso[i].undMed_Id,
        }
        this.rollosPDF.push(info);
        this.rollosPDF.sort((a,b) => Number(a.Rollo) - Number(b.Rollo));
      }
      setTimeout(() => { this.crearPDF(id); }, 1200);
    }, () => this.mensajeService.mensajeError(`Error`,`No se pudo obtener información del último ingreso de rollos!`));
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
        widths: [60, 60, 60, 228, 40, 50],
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
