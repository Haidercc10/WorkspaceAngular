import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShepherdService } from 'angular-shepherd';
import moment from 'moment';
import pdfMake from 'pdfmake/build/pdfmake';
import { modelDtSolicitudRollos } from 'src/app/Modelo/modelDtSolicitudRollos';
import { modelSolicitudRollos } from 'src/app/Modelo/modelSolicitudRollos';
import { Detalle_BodegaRollosService } from 'src/app/Servicios/Detalle_BodegaRollos/Detalle_BodegaRollos.service';
import { Detalles_SolicitudRollosService } from 'src/app/Servicios/Detalles_SolicitudRollos/Detalles_SolicitudRollos.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { ProcesosService } from 'src/app/Servicios/Procesos/procesos.service';
import { Solicitud_Rollos_AreasService } from 'src/app/Servicios/Solicitud_Rollos_Areas/Solicitud_Rollos_Areas.service';
import { AppComponent } from 'src/app/app.component';
import { defaultStepOptions, stepsIngresoRollosExtrusion as defaultSteps } from 'src/app/data';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';

@Component({
  selector: 'app-Solicitud_Rollos_Bodegas',
  templateUrl: './Solicitud_Rollos_Bodegas.component.html',
  styleUrls: ['./Solicitud_Rollos_Bodegas.component.css']
})

export class Solicitud_Rollos_BodegasComponent implements OnInit {

  cargando : boolean = false; //Variable para validar que salga o no la imagen de carga
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro

  FormConsultarRollos !: FormGroup; //formulario para consultar y crear un ingreso de rollos
  bodegasSolicitadas : any [] = []; //Variable que va a tener las bodegas a los cuales se les pedirán rollos.
  bodegasSolicitantes : any [] = []; //Variable que va a tener las bodegas que pedirán rollos.
  rollosConsultados : any [] = []; //Variable que almacenará la información de los rollos que hayan sido consultados
  rollosIngresar : any [] = []; //Variable que almcanerá la información de los rollos que van a ser ingresados
  consolidadoProductos : any [] = []; //Variable que almacenará la información consolidad de los rollos que van a ser ingresados
  devolucionRollos : boolean = false; //Variable que va a validar si el tipo de solicitud es una devolución o no
  informacionPdf : any [] = [];

  constructor(private AppComponent : AppComponent,
                private shepherdService: ShepherdService,
                  private mensajeService : MensajesAplicacionService,
                    private frmBuilder : FormBuilder,
                      private procesosService : ProcesosService,
                        private solicitudRollosService : Solicitud_Rollos_AreasService,
                          private dtBgRollosService : Detalle_BodegaRollosService,
                            private dtSolicitudRollosService : Detalles_SolicitudRollosService) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;

    this.FormConsultarRollos = this.frmBuilder.group({
      OrdenTrabajo: [null, Validators.required],
      Rollo : [null],
      FechaInicial : [null],
      FechaFinal : [null],
      Observacion : [''],
      BodegaSolicitada : [null, Validators.required],
      BodegaSolicitante : [null, Validators.required],
      Devolucion : [null, Validators.required]
    });
  }

  ngOnInit() {
    this.lecturaStorage();
    this.obternerBodegas();
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

  // Funcion que va a consultar las bodegas de los que se van a solicitar rollos
  obternerBodegas(){
    this.procesosService.srvObtenerLista().subscribe(data => {
      if (this.ValidarRol != 1){
        if (this.ValidarRol == 64) { //PRODUCTO INTERMEDIO
          this.bodegasSolicitadas = data.filter(item => ['EXT'].includes(item.proceso_Id));
          this.bodegasSolicitantes = data.filter(item => ['BGPI'].includes(item.proceso_Id));
          this.FormConsultarRollos.patchValue({ BodegaSolicitante : 'BGPI' });
        }
        if (this.ValidarRol == 62) { //IMPRESION
          this.bodegasSolicitadas = data.filter(item => ['BGPI', 'ROT'].includes(item.proceso_Id));
          this.bodegasSolicitantes = data.filter(item => ['IMP'].includes(item.proceso_Id));
          this.FormConsultarRollos.patchValue({ BodegaSolicitante : 'IMP' });
        }
        if (this.ValidarRol == 63) { //ROTOGRABADO
          this.bodegasSolicitadas = data.filter(item => ['BGPI'].includes(item.proceso_Id));
          this.bodegasSolicitantes = data.filter(item => ['ROT'].includes(item.proceso_Id));
          this.FormConsultarRollos.patchValue({ BodegaSolicitante : 'ROT' });
        }
        if (this.ValidarRol == 8) { //SELLADO
          this.bodegasSolicitadas = data.filter(item => ['BGPI', 'IMP'].includes(item.proceso_Id));
          this.bodegasSolicitantes = data.filter(item => ['SELLA'].includes(item.proceso_Id));
          this.FormConsultarRollos.patchValue({ BodegaSolicitante : 'SELLA' });
        }
        if (this.ValidarRol == 10) { //DESPACHO
          this.bodegasSolicitadas = data.filter(item => ['BGPI', 'EXT', 'SELLA', 'IMP'].includes(item.proceso_Id));
          this.bodegasSolicitantes = data.filter(item => ['DESP'].includes(item.proceso_Id));
          this.FormConsultarRollos.patchValue({ BodegaSolicitante : 'DESP' });
        }
      } else {
        this.bodegasSolicitadas = data.filter(item => ['BGPI', 'EXT', 'SELLA', 'IMP', 'ROT'].includes(item.proceso_Id));
        this.bodegasSolicitantes = data.filter(item => ['BGPI', 'EXT', 'SELLA', 'IMP', 'ROT'].includes(item.proceso_Id));
      }
    });
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
    if (this.FormConsultarRollos.valid) {
      let ot : number = this.FormConsultarRollos.value.OrdenTrabajo;
      let fechaInicial : any = moment(this.FormConsultarRollos.value.FechaInicial).format('YYYY-MM-DD');
      let fechaFinal : any = moment(this.FormConsultarRollos.value.FechaFinal).format('YYYY-MM-DD');
      let rollo : number = this.FormConsultarRollos.value.Rollo;
      let bodega : string = this.FormConsultarRollos.value.BodegaSolicitada;
      let ruta : string = rollo != null ? `?rollo=${rollo}` : '';
      fechaInicial == 'Invalid date' ? fechaInicial = this.today : fechaInicial;
      fechaFinal == 'Invalid date' ? fechaFinal = fechaInicial : fechaFinal;

      this.cargando = true;
      this.rollosConsultados = [];
      this.rollosIngresar = [];
      this.consolidadoProductos = [];

      this.dtBgRollosService.GetRollosDisponibles(bodega, fechaInicial, fechaFinal, ot, ruta).subscribe(data => {
        for (let i = 0; i < data.length; i++) {
          this.llenarRollosIngresar(data[i]);
        }
      }, err => {
        this.mensajeService.mensajeError(`¡Error!`, `¡${err.error}!`);
        this.cargando = false;
      });
    } else this.mensajeService.mensajeAdvertencia(`¡Campos Vacios!`, `¡Debe llenar los campos 'Bodega' y 'OT'!`);
  }

  // Funcion que va a llenar los rollos que estan disponibles para ser ingresados
  llenarRollosIngresar(data : any){
    let info : any = {
      Ot : data.ot,
      Rollo : parseInt(data.rollo),
      Id_Producto : data.item,
      Producto : data.referencia,
      Cantidad : parseFloat(data.cantidad),
      Presentacion : data.presentacion,
      Proceso : data.bodega,
    }
    this.rollosConsultados.push(info);
    this.rollosConsultados.sort((a,b) => Number(a.Rollo) - Number(b.Rollo) );
    this.cargando = false;
  }

  // Funcion que colocará los rollos que se van a insertar
  llenarRollosAIngresar(item : any){
    this.cargando = true;
    this.rollosConsultados.splice(this.rollosConsultados.findIndex((data) => data.Rollo == item.Rollo), 1);
    this.rollosIngresar.sort((a,b) => Number(a.Rollo) - Number(b.Rollo) );
    this.GrupoProductos();
  }

  // Funcion que seleccionará y colocará todos los rollos que se van a insertar
  seleccionarTodosRollos(){
    this.cargando = true;
    this.rollosConsultados = [];
    this.rollosIngresar.sort((a,b) => Number(a.Rollo) - Number(b.Rollo) );
    this.GrupoProductos();
  }

  //Funcion que va a quitar lo rollos que se van a insertar
  quitarRollosAIngresar(item : any){
    this.cargando = true;
    this.rollosIngresar.splice(this.rollosIngresar.findIndex(data => data.Rollo == item.Rollo), 1);
    this.rollosConsultados.sort((a,b) => Number(a.Rollo) - Number(b.Rollo) );
    this.GrupoProductos();
  }

  // Funcion que va a quitar todos los rollos que se van a insertar
  quitarTodosRollos(){
    this.cargando = true;
    this.rollosConsultados.sort((a,b) => Number(a.Rollo) - Number(b.Rollo) );
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
      this.consolidadoProductos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
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
    if (this.rollosIngresar.length > 0 && this.FormConsultarRollos.valid){
      this.cargando = true;
      const info : modelSolicitudRollos = {
        Usua_Id: this.storage_Id,
        SolRollo_FechaSolicitud: moment().format('YYYY-MM-DD'),
        SolRollo_HoraSolicitud: moment().format('H:mm:ss'),
        Usua_Respuesta : this.storage_Id,
        Estado_Id: 11,
        TpSol_Id: this.devolucionRollos ? 2 : 1,
        SolRollo_Observacion: this.FormConsultarRollos.value.Observacion,
      }
      this.solicitudRollosService.Post(info).subscribe(data => this.ingresarDetallesRollos(data.solRollo_Id), err => {
        this.mensajeService.mensajeError(`¡Ha ocurrido un error al solicitar los rollos!`, `¡${err.error}!`);
        this.cargando = false;
      });
    } else this.mensajeService.mensajeAdvertencia(`¡Advertencia!`, `¡Debe seleccionar minimo un rollo para realizar la solicitud!`);
  }

  //
  ingresarDetallesRollos(id : number){
    let numRollos : number = 0;
      this.cargando = true;
      for (let i = 0; i < this.rollosIngresar.length; i++) {
        const info : modelDtSolicitudRollos = {
          DtSolRollo_OrdenTrabajo: this.rollosIngresar[i].Ot,
          DtSolRollo_Maquina: 0,
          DtSolRollo_BodegaSolicitante: this.FormConsultarRollos.value.BodegaSolicitante,
          DtSolRollo_BodegaSolicitada: this.FormConsultarRollos.value.BodegaSolicitada,
          DtSolRollo_Rollo: this.rollosIngresar[i].Rollo,
          DtSolRollo_Cantidad: this.rollosIngresar[i].Cantidad,
          UndMed_Id: this.rollosIngresar[i].Presentacion,
          Prod_Id: this.rollosIngresar[i].Id_Producto,
          SolRollo_Id: id
        }
        this.dtSolicitudRollosService.Post(info).subscribe(() => {
          numRollos += 1
          if (numRollos == this.rollosIngresar.length) this.buscarInformacioPDF(id);
        }, err => {
          this.mensajeService.mensajeError(`¡Ha ocurrido un error al solicitar los rollos!`, `¡${err.error}!`);
          this.cargando = false;
        });
      }
  }

  // Funcion que se va a ejecutar cuando se hayan ingresado todos los rollos
  finalizacionIngresoRollos(){
    this.mensajeService.mensajeConfirmacion(`¡Solicitud Realizada!`, `¡Se ha realizado una solicitud de rollos!`);
    this.limpiarCampos();
  }

  // Funcion que va a consultar la información con la que se llenará el pdf
  buscarInformacioPDF(solicitud : number){
    this.informacionPdf = [];
    this.dtSolicitudRollosService.GetInformacionSolicitud(solicitud).subscribe(data => {
      for (let i = 0; i < data.length; i++) {
        let info : any = {
          "Orden Trabajo" : data[i].orden_Trabajo,
          "Rollo" : data[i].rollo,
          "Item" : data[i].item,
          "Referencia" : data[i].referencia,
          "Cantidad" : data[i].cantidad,
          "Presentación" : data[i].presentacion,
        }
        this.informacionPdf.push(info);
      }
    });
    setTimeout(() => this.crearPDF(solicitud), 2500);
  }

  // funcion que va a crear un PDF
  crearPDF(solicitud : number){
    let nombre : string = this.storage_Nombre;
    this.dtSolicitudRollosService.GetInformacionSolicitud(solicitud).subscribe(data => {
      for (let i = 0; i < data.length; i++) {
        const pdfDefinicion : any = {
          info: { title: `${data[i].solicitud}` },
          pageSize: { width: 630, height: 760 },
          watermark: { text: 'Plasticaribe SAS', color: 'red', opacity: 0.05, bold: true, italics: false },
          pageMargins : [25, 150, 25, 35],
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
          header: [
            {
              margin: [20, 8, 20, 0],
              columns: [
                { image : logoParaPdf, width : 220, height : 50, margin: 10 },
                { text: `Solicitud de Rollos ${data[i].solicitud}`, alignment: 'right', tyle: 'titulo', fontSize: 15, margin: 30 }
              ]
            },
            '\n',
            {
              margin: [30, 0],
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
                      text: `${data[i].empresa}`
                    },
                    {
                      border: [false, false, false, false],
                      text: `Fecha`
                    },
                    {
                      border: [false, false, false, true],
                      text: `${data[i].fecha_Solicitud.replace('T00:00:00', ``)} ${data[i].hora_Solicitud}`
                    },
                  ],
                  [
                    {
                      border: [false, false, false, false],
                      text: `NIT Empresa`
                    },
                    {
                      border: [false, false, false, true],
                      text: `${data[i].empresa_Id}`
                    },
                    {
                      border: [false, false, false, false],
                      text: `Ciudad`
                    },
                    {
                      border: [false, false, false, true],
                      text: `${data[i].empresa_Ciudad}`
                    },
                  ],
                  [
                    {
                      border: [false, false, false, false],
                      text: `Dirección`
                    },
                    {
                      border: [false, false, false, true],
                      text: `${data[i].empresa_Direccion}`
                    },
                    {
                      border: [false, false, false, false],
                      text: `Usuario`
                    },
                    {
                      border: [false, false, false, true],
                      text: `${data[i].usuario}`
                    },
                  ]
                ]
              },
              layout: { defaultBorder: false, },
              fontSize: 9,
            },
            '\n \n',
          ],
          content : [
            {
              text: `\n \nObservación sobre la Orden: \n ${data[i].observacion}\n`,
              style: 'header',
            },
            '\n \n',
            {
              text: `Rollos Solicitados\n\n`,
              alignment: 'center',
              style: 'header'
            },
            this.table(this.informacionPdf, ['Orden Trabajo', 'Rollo', 'Item', 'Referencia', 'Cantidad', 'Presentación']),
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

  // funcion que se encagará de llenar la tabla de los rollos en el pdf
  buildTableBody(data : any, columns : any) {
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
  table(data : any, columns : any) {
    return {
      table: {
        headerRows: 1,
        widths: [50, 50, 50, '*', 50, 50],
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
