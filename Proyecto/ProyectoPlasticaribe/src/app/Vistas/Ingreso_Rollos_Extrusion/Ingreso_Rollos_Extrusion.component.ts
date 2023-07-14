import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ShepherdService } from 'angular-shepherd';
import moment from 'moment';
import pdfMake from 'pdfmake/build/pdfmake';
import { modelBodegasRollos } from 'src/app/Modelo/modelBodegasRollos';
import { modelDtBodegasRollos } from 'src/app/Modelo/modelDtBodegasRollos';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { Bodegas_RollosService } from 'src/app/Servicios/Bodegas_Rollos/Bodegas_Rollos.service';
import { Detalle_BodegaRollosService } from 'src/app/Servicios/Detalle_BodegaRollos/Detalle_BodegaRollos.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { AppComponent } from 'src/app/app.component';
import { defaultStepOptions, stepsBodegas as defaultSteps } from 'src/app/data';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';

@Component({
  selector: 'app-Ingreso_Rollos_Extrusion',
  templateUrl: './Ingreso_Rollos_Extrusion.component.html',
  styleUrls: ['./Ingreso_Rollos_Extrusion.component.css']
})
export class Ingreso_Rollos_ExtrusionComponent implements OnInit {

  cargando : boolean = false; //Variable para validar que salga o no la imagen de carga
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro

  FormConsultarRollos !: FormGroup; //formulario para consultar y crear un ingreso de rollos
  rollosConsultados : any [] = []; //Variable que almacenará la información de los rollos que hayan sido consultados
  rollosIngresar : any [] = []; //Variable que almcanerá la información de los rollos que van a ser ingresados
  consolidadoProductos : any [] = []; //Variable que almacenará la información consolidad de los rollos que van a ser ingresados
  informacionPdf : any [] = [];

  constructor(private AppComponent : AppComponent,
                private shepherdService: ShepherdService,
                  private mensajeService : MensajesAplicacionService,
                    private frmBuilder : FormBuilder,
                      private bagProService : BagproService,
                        private bgRollosService : Bodegas_RollosService,
                          private dtBgRollosService : Detalle_BodegaRollosService,) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;

    this.FormConsultarRollos = this.frmBuilder.group({
      OrdenTrabajo: [null],
      Rollo : [null],
      FechaInicial : [null],
      FechaFinal: [null],
      Observacion : [''],
    });
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
  formatonumeros = (number : any) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

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
    this.rollosConsultados = [];
    this.rollosIngresar = [];
    this.consolidadoProductos = [];
    this.informacionPdf = [];
    this.cargando = false;
  }

  // Funcion que va a consultar los rollos mediante los parametros pasados por el usuario
  consultarRollos(){
    let ot : number = this.FormConsultarRollos.value.OrdenTrabajo;
    let fechaInicial : any = moment(this.FormConsultarRollos.value.FechaInicial).format('YYYY-MM-DD');
    let fechaFinal : any = moment(this.FormConsultarRollos.value.FechaFinal).format('YYYY-MM-DD');
    let rollo : number = this.FormConsultarRollos.value.Rollo;

    let rollosBagPro : number [] = [];
    let rollosExistentes : number [] = [];
    let ruta : string = '';
    fechaInicial == 'Fecha inválida' ? fechaInicial = this.today : fechaInicial;
    fechaFinal == 'Fecha inválida' ? fechaFinal = fechaInicial : fechaFinal;

    if (ot != null && rollo != null) ruta = `?ot=${ot}&rollo=${rollo}`;
    else if (ot != null) ruta = `?ot=${ot}`;
    else if (rollo != null) ruta = `?rollo=${rollo}`;

    this.cargando = true;
    this.rollosConsultados = [];
    this.rollosIngresar = [];
    this.consolidadoProductos = [];

    this.bagProService.GetRollosExtrusion_Empaque_Sellado(fechaInicial, fechaFinal, 'EXTRUSION', ruta).subscribe(data => {
      for (let i = 0; i < data.length; i++) {
        rollosBagPro.push(data[i].rollo);
      }
      setTimeout(() => {
        this.dtBgRollosService.GetRollos(rollosBagPro).subscribe(datos => {
          for (let i = 0; i < datos.length; i++) {
            rollosExistentes.push(datos[i].dtBgRollo_Rollo);
          }
          setTimeout(() => {
            for (let i = 0; i < data.length; i++) {
              if (datos.length > 0 && !rollosExistentes.includes(parseInt(data[i].rollo))) this.llenarRollosIngresar(data[i], false);
              else if (datos.length > 0 && rollosExistentes.includes(parseInt(data[i].rollo))) {
                let nuevo : any [] = datos.filter((item) => item.dtBgRollo_Rollo == data[i].rollo);
                for (let j = 0; j < nuevo.length; j++) {
                  if (nuevo[j].bgRollo_BodegaActual != 'EXT') this.llenarRollosIngresar(data[i], false);
                  else this.llenarRollosIngresar(data[i], true);
                }
              }
              if (datos.length == 0) this.llenarRollosIngresar(data[i], false);
            }
          }, 500);
        });
      }, 2500);
    });
  }

  // Funcion que va a llenar los rollos que estan disponibles para ser ingresados
  llenarRollosIngresar(data : any, exits : boolean){
    let info : any = {
      Ot : data.orden,
      Rollo : parseInt(data.rollo),
      Id_Producto : data.id_Producto,
      Producto : data.producto,
      Cantidad : parseFloat(data.cantidad),
      Presentacion : data.presentacion,
      Estatus : data.proceso,
      Proceso : 'EXT',
      exits : exits,
    }
    this.rollosConsultados.push(info);
    this.rollosConsultados.sort((a,b) => Number(a.Rollo) - Number(b.Rollo) );
    this.rollosConsultados.sort((a,b) => Number(a.exits) - Number(b.exits) );
    this.cargando = false;
  }

  // Funcion que colocará los rollos que se van a insertar
  llenarRollosAIngresar(item : any){
    this.cargando = true;
    this.rollosConsultados.splice(this.rollosConsultados.findIndex((data) => data.Rollo == item.Rollo), 1);
    this.rollosIngresar.sort((a,b) => Number(a.Rollo) - Number(b.Rollo) );
    this.rollosIngresar.sort((a,b) => Number(a.exits) - Number(b.exits) );
    this.GrupoProductos();
  }

  // Funcion que seleccionará y colocará todos los rollos que se van a insertar
  seleccionarTodosRollos(){
    this.cargando = true;
    this.rollosConsultados = this.rollosConsultados.filter(data => data.exits);
    this.rollosIngresar.sort((a,b) => Number(a.Rollo) - Number(b.Rollo) );
    this.rollosIngresar.sort((a,b) => Number(a.exits) - Number(b.exits) );
    this.GrupoProductos();
  }

  //Funcion que va a quitar lo rollos que se van a insertar
  quitarRollosAIngresar(item : any){
    this.cargando = true;
    this.rollosIngresar.splice(this.rollosIngresar.findIndex(data => data.Rollo == item.Rollo), 1);
    this.rollosConsultados.sort((a,b) => Number(a.Rollo) - Number(b.Rollo) );
    this.rollosConsultados.sort((a,b) => Number(a.exits) - Number(b.exits) );
    this.GrupoProductos();
  }

  // Funcion que va a quitar todos los rollos que se van a insertar
  quitarTodosRollos(){
    this.cargando = true;
    this.rollosConsultados.sort((a,b) => Number(a.Rollo) - Number(b.Rollo) );
    this.rollosConsultados.sort((a,b) => Number(a.exits) - Number(b.exits) );
    this.rollosIngresar = [];
    this.GrupoProductos();
  }

  // Funcion que permitirá ver el total de lo escogido para cada producto
  GrupoProductos(){
    let producto : any = [];
    this.consolidadoProductos = [];
    for (let i = 0; i < this.rollosIngresar.length; i++) {
      if (!producto.includes(this.rollosIngresar[i].Id_Producto)) {
        let cantidad : number = 0, cantRollo : number = 0;
        for (let j = 0; j < this.rollosIngresar.length; j++) {
          if (this.rollosIngresar[i].Id_Producto == this.rollosIngresar[j].Id_Producto && !this.rollosIngresar[j].exits && !this.rollosIngresar[j].exits) {
            cantidad += this.rollosIngresar[j].Cantidad;
            cantRollo += 1;
          }
        }
        if (cantRollo > 0){
          producto.push(this.rollosIngresar[i].Id_Producto);
          let info : any = {
            Ot: this.rollosIngresar[i].Ot,
            Id : this.rollosIngresar[i].Id_Producto,
            Nombre : this.rollosIngresar[i].Producto,
            Cantidad : this.formatonumeros(cantidad.toFixed(2)),
            Cantidad2 : cantidad,
            Rollos: this.formatonumeros(cantRollo),
            Rollos2: cantRollo,
            Presentacion : this.rollosIngresar[i].Presentacion,
          }
          this.consolidadoProductos.push(info);
        }
      }
    }
    setTimeout(() => this.cargando = false, 50);
    setTimeout(() => {
      this.rollosIngresar.sort((a,b) => Number(a.Rollo) - Number(b.Rollo) );
      this.rollosIngresar.sort((a,b) => Number(a.exits) - Number(b.exits) );
      this.consolidadoProductos.sort((a,b) => Number(a.Ot) - Number(b.Ot));
    }, 500);
  }

  // Funcion que calculará el total de rollos que se están signanado
  calcularTotalRollos() : number {
    let total = 0;
    for(let sale of this.consolidadoProductos) {
      total += sale.Rollos2;
    }
    return total;
  }

  // Funcion que calculará el total de la kg que se está ingresando
  calcularTotalCantidad() : number {
    let total = 0;
    for(let sale of this.consolidadoProductos) {
      total += sale.Cantidad2;
    }
    return total;
  }

  // Funcion que va a crear los rollos en la base de datos
  ingresarRollos(){
    if (this.rollosIngresar.length > 0){
      this.cargando = true;
      const info : modelBodegasRollos = {
        BgRollo_FechaEntrada: moment().format('YYYY-MM-DD'),
        BgRollo_HoraEntrada: moment().format('H:mm:ss'),
        BgRollo_FechaModifica: moment().format('YYYY-MM-DD'),
        BgRollo_HoraModifica: moment().format('H:mm:ss'),
        BgRollo_Observacion: this.FormConsultarRollos.value.Observacion == null ? '' : this.FormConsultarRollos.value.Observacion.toUpperCase(),
      }
      this.bgRollosService.Post(info).subscribe(data => this.ingresarDetallesRollos(data.bgRollo_Id), err => {
        this.mensajeService.mensajeError(`¡Ha ocurrido un error al ingresar los rollos!`, `¡${err.error}!`);
        this.cargando = false;
      });
    } else this.mensajeService.mensajeAdvertencia(`¡Advertencia!`, `¡Debe seleccionar minimo un rollo para realizar el ingreso!`);
  }

  //
  ingresarDetallesRollos(id : number){
    let numRollos : number = 0;
      this.cargando = true;
      for (let i = 0; i < this.rollosIngresar.length; i++) {
        const info : modelDtBodegasRollos = {
          BgRollo_OrdenTrabajo: this.rollosIngresar[i].Ot,
          Prod_Id: parseInt(this.rollosIngresar[i].Id_Producto),
          DtBgRollo_Rollo: this.rollosIngresar[i].Rollo,
          DtBgRollo_Cantidad: this.rollosIngresar[i].Cantidad,
          UndMed_Id: this.rollosIngresar[i].Presentacion,
          BgRollo_BodegaActual: 'EXT',
          DtBgRollo_Extrusion: true,
          DtBgRollo_ProdIntermedio: false,
          DtBgRollo_Impresion: false,
          DtBgRollo_Rotograbado: false,
          DtBgRollo_Sellado: false,
          DtBgRollo_Corte: false,
          DtBgRollo_Despacho: false,
          BgRollo_Id: id
        }
        this.dtBgRollosService.Post(info).subscribe(() => {
          numRollos += 1
          if (numRollos == this.rollosIngresar.length) this.buscarInformacion(id);
        }, err => {
          this.mensajeService.mensajeError(`¡Ha ocurrido un error al ingresar los rollos!`, `¡${err.error}!`);
          this.cargando = false;
        });
      }
  }

  // Funcion que se va a ejecutar cuando se hayan ingresado todos los rollos
  finalizacionIngresoRollos(){
    this.mensajeService.mensajeConfirmacion(`¡Rollos Ingresados!`, `¡Se han ingresado los rollos a la bodega de extrusión!`);
    this.limpiarCampos();
  }

  // Funcion que va a buscar la informacion con la que se llenará el pdf
  buscarInformacion(id : number){
    this.cargando = true;
    this.informacionPdf = [];
    this.dtBgRollosService.GetInformacionIngreso(id).subscribe(data => {
      for (let i = 0; i < data.length; i++) {
        const element = data[i];
        this.informacionPdf.push({
          "Orden Trabajo" : element.orden_Trabajo,
          "Rollo" : element.rollo,
          "Item" : element.item,
          "Referencia" : element.referencia,
          "Cantidad" : this.formatonumeros(element.cantidad),
          "Cantidad2" : element.cantidad,
          "Presentación" : element.presentacion,
        });
        if (this.informacionPdf.length == data.length) this.crearPdf(id);
      }      
    }, err => {
      this.mensajeService.mensajeError(`¡Ha ocurrido un error al buscar la información!`, `¡${err.error}!`);
      this.cargando = false;
    });
  }

  // Funcion que va a crear el pdf 
  crearPdf(id : number){
    let nombre : string = this.storage_Nombre;
    this.dtBgRollosService.GetInformacionIngreso(id).subscribe(data => {
      for (let i = 0; i < data.length; i++) {
        let titulo = `Ingreso de Rollos N°${data[i].ingreso}`;
        const pdfDefinicion : any = {
          info: { title: titulo },
          pageSize: { width: 630, height: 760 },
          watermark: { text: 'PLASTICARIBE SAS', color: 'red', opacity: 0.05, bold: true, italics: false },
          pageMargins : [25, 160, 25, 35],
          header: function(currentPage : any, pageCount : any) {
            return [
              {
                margin: [20, 8, 20, 0],
                columns: [
                  { image : logoParaPdf, width : 150, height : 30, margin: [20, 30] },
                  {
                    width: 300,
                    alignment: 'center',
                    table: {
                      body: [
                        [{text: 'NIT. 800188732', bold: true, alignment: 'center', fontSize: 10}],
                        [{text: `Fecha: ${moment().format('DD/MM/YYYY')}`, alignment: 'center', fontSize: 8}],
                        [{text: `Hora: ${moment().format('H:mm:ss')}`, alignment: 'center', fontSize: 8}],
                        [{text: `Usuario: ${nombre}`, alignment: 'center', fontSize: 8}],
                        [{text: titulo, bold: true, alignment: 'center', fontSize: 10}],
                      ]
                    },
                    layout: 'noBorders',
                    margin: [85, 20],
                  },
                  {
                    width: '*',
                    alignment: 'center',
                    margin: [20, 20, 20, 0],
                    table: {
                      body: [
                        [{text: `Código: `, alignment: 'left', fontSize: 8, bold: true}, { text: `FR-PR-MT-01`, alignment: 'left', fontSize: 8 }],
                        [{text: `Versión: `, alignment: 'left', fontSize: 8, bold: true}, { text: `02`, alignment: 'left', fontSize: 8, margin: [0, 0, 30, 0] }],
                        [{text: `Vigencia: `, alignment: 'left', fontSize: 8, bold: true}, { text: `${moment().format('DD/MM/YYYY')}`, alignment: 'left', fontSize: 8, margin: [0, 0, 30, 0] }],
                        [{text: `Pagina: `, alignment: 'left', fontSize: 8, bold: true}, { text: `${currentPage.toString() + ' de ' + pageCount}`, alignment: 'left', fontSize: 8, margin: [0, 0, 30, 0] }],
                      ]
                    },
                    layout: 'noBorders',
                  }
                ]
              },
              {
                margin: [20, 0],
                table: {
                  headerRows: 1,
                  widths: ['*'],
                  body: [
                    [
                      {
                        border: [false, true, false, false],
                        text: ''
                      },
                    ],
                  ]
                },
                layout: { defaultBorder: false, }
              },
              {
                margin: [20, 10, 20, 0],
                table: {
                  headerRows: 1,
                  widths: [55, 50, 50, 270, 50, 60],
                  body: [
                    [
                      { text: 'Orden Trabajo', fillColor: '#bbb', fontSize: 9 },
                      { text: 'Rollo', fillColor: '#bbb', fontSize: 9 },
                      { text: 'Item', fillColor: '#bbb', fontSize: 9 },
                      { text: 'Referencia', fillColor: '#bbb', fontSize: 9 },
                      { text: 'Cantidad', fillColor: '#bbb', fontSize: 9 },
                      { text: 'Presentación', fillColor: '#bbb', fontSize: 9 },
                    ],
                  ]
                },
                layout: { defaultBorder: false, },
              }
            ];
          },
          content : [
            this.table(this.informacionPdf, ['Orden Trabajo', 'Rollo', 'Item', 'Referencia', 'Cantidad', 'Presentación']),
            {
              margin: [20, 0],
              table: {
                headerRows: 1,
                widths: ['*', '*'],
                body: [
                  [
                    { border: [false, false, false, false], text: `Total Rollos:  ${this.formatonumeros(this.informacionPdf.length.toFixed(2))}`, bold: true, fontSize: 10, alignment: 'center' },
                    { border: [false, false, false, false], text: `Total Kg:  ${this.formatonumeros(this.sumarTotalKg(this.informacionPdf).toFixed(2))}`, bold: true, fontSize: 10, alignment: 'center' },
                  ],
                ]
              },
              layout: { defaultBorder: false, }
            },
            {
              text: `\n \nObservación sobre la Orden: \n ${data[i].observacion}\n`,
              style: 'header',
            },
          ],
          styles: {
            header: { fontSize: 10, bold: true },
            titulo: { fontSize: 20, bold: true }
          }
        }
        const pdf = pdfMake.createPdf(pdfDefinicion);
        pdf.open();
        this.finalizacionIngresoRollos();
        break;
      }
    });
  }

  sumarTotalKg(data : any){
    let totalKg = 0;
    data.forEach(element => {
      totalKg += element.Cantidad2;
    });
    return totalKg;
  }

  // funcion que se encagará de llenar la tabla de los rollos en el pdf
  buildTableBody(data : any, columns : any) {
    var body = [];
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
  table(data : any, columns : any) {
    return {
      table: {
        widths: [50, 50, 50, '*', 50, 50],
        body: this.buildTableBody(data, columns),
      },
      fontSize: 7,
    };
  }
}
