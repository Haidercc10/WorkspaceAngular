import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShepherdService } from 'angular-shepherd';
import moment from 'moment';
import pdfMake from 'pdfmake/build/pdfmake';
import { AsignacionRollos_ExtrusionService } from 'src/app/Servicios/AsignaciinRollosExtrusion/AsignacionRollos_Extrusion.service';
import { DetallesAsgRollos_ExtrusionService } from 'src/app/Servicios/DetallesAsgRollosExtrusion/DetallesAsgRollos_Extrusion.service';
import { DtIngRollos_ExtrusionService } from 'src/app/Servicios/DetallesIngresoRollosExtrusion/DtIngRollos_Extrusion.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { ProcesosService } from 'src/app/Servicios/Procesos/procesos.service';
import { AppComponent } from 'src/app/app.component';
import { defaultStepOptions, stepsSalidaRollosExtrusion as defaultSteps } from 'src/app/data';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';

@Component({
  selector: 'app-AsignacionRollos_Extrusion',
  templateUrl: './AsignacionRollos_Extrusion.component.html',
  styleUrls: ['./AsignacionRollos_Extrusion.component.css']
})

export class AsignacionRollos_ExtrusionComponent implements OnInit {

  public FormConsultarRollos !: FormGroup; //formulario para consultar y crear un ingreso de rollos
  cargando : boolean = true; //Variable para validar que salga o no la imagen de carga
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  grupoProductos : any [] = []; //Variable que guardará de manera descriminada a cada producto
  rollos : any [] = []; //Variable que almacenará los difrentes rollos que se hicieron en la orden de trabajo
  rollosInsertar : any [] = []; //Variable que va a amacenar los diferentes rollos que se van a insertar
  procesos : any [] = []; //Variable que va a almacenar los diferentes procesos
  totalRollos : number = 0; //Variable que almacenará el total de rollos escogidos
  totalCantidad : number = 0; //Variable que almacenará la cantidad de total de kg de los rollos escogidos
  rollosPDF : any [] = []; //Variable que almacenará la informacion de los rollos salientes
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro

  constructor(private frmBuilderPedExterno : FormBuilder,
                private AppComponent : AppComponent,
                  private dtIngRollosService : DtIngRollos_ExtrusionService,
                    private procesosService : ProcesosService,
                      private asgRollos : AsignacionRollos_ExtrusionService,
                        private dtAsgRollos : DetallesAsgRollos_ExtrusionService,
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
    this.obtenerProcesos();
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
    this,this.totalCantidad = 0;
    this.totalRollos = 0;
    this.cargando = true;
  }

  // Funcion que se encargará de consultar los procesos
  obtenerProcesos = () => this.procesosService.srvObtenerLista().subscribe(datos => this.procesos = datos.filter((data) => !['RECUP', 'TINTAS'].includes(data.proceso_Id)));
  
  // Funcion que va a consultar los rollos
  consultarRollos(){
    let ot : number = this.FormConsultarRollos.value.OT_Id;
    let fechaInicial : any = moment(this.FormConsultarRollos.value.fechaDoc).format('YYYY-MM-DD');
    let fechaFinal : any = moment(this.FormConsultarRollos.value.fechaFinalDoc).format('YYYY-MM-DD');
    let rollo : number = this.FormConsultarRollos.value.IdRollo;
    let rollos : any = [];
    let consulta : number;
    this.rollos = [];
    this.cargando = false;
    this.rollosInsertar.forEach(data => rollos = data.map(x => x.Id));
    setTimeout(() => {
      if (ot != null && fechaInicial != 'Fecha inválida' && fechaFinal != 'Fecha inválida') {
        this.dtIngRollosService.getRollosDisponiblesOT(ot).subscribe(datos_Rollos => {
          consulta = datos_Rollos.length;
          for (let i = 0; i < datos_Rollos.length; i++) {
            if (!rollos.includes(datos_Rollos[i].rollo_Id) && moment(datos_Rollos[i].ingRollo_Fecha.replace('T00:00:00', '')).isBetween(fechaInicial, fechaFinal)) {
              let info : any = {
                Ot : datos_Rollos[i].dtIngRollo_OT,
                Id : datos_Rollos[i].rollo_Id,
                IdProducto : datos_Rollos[i].prod_Id,
                Producto : datos_Rollos[i].prod_Nombre,
                Cantidad : datos_Rollos[i].dtIngRollo_Cantidad,
                Presentacion : datos_Rollos[i].undMed_Id,
                Fecha : datos_Rollos[i].ingRollo_Fecha.replace('T00:00:00', ''),
              }
              this.rollos.push(info);
              this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
            }
          }
        });
      } else if (fechaInicial != null &&  fechaFinal != null) {
        this.dtIngRollosService.getRollosDisponiblesFechas(fechaInicial, fechaFinal).subscribe(datos_Rollos => {
          consulta = datos_Rollos.length;
          for (let i = 0; i < datos_Rollos.length; i++) {
            if (!rollos.includes(datos_Rollos[i].rollo_Id)) {
              let info : any = {
                Ot : datos_Rollos[i].dtIngRollo_OT,
                Id : datos_Rollos[i].rollo_Id,
                IdProducto : datos_Rollos[i].prod_Id,
                Producto : datos_Rollos[i].prod_Nombre,
                Cantidad : datos_Rollos[i].dtIngRollo_Cantidad,
                Presentacion : datos_Rollos[i].undMed_Id,
                Fecha : datos_Rollos[i].ingRollo_Fecha.replace('T00:00:00', ''),
              }
              this.rollos.push(info);
              this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
            }
          }
        });
      } else if (ot != null && fechaInicial != null) {
        this.dtIngRollosService.getRollosDisponiblesOT(ot).subscribe(datos_Rollos => {
          consulta = datos_Rollos.length;
          for (let i = 0; i < datos_Rollos.length; i++) {
            if (!rollos.includes(datos_Rollos[i].rollo_Id) && datos_Rollos[i].ingRollo_Fecha.replace('T00:00:00', '') == fechaInicial) {
              let info : any = {
                Ot : datos_Rollos[i].dtIngRollo_OT,
                Id : datos_Rollos[i].rollo_Id,
                IdProducto : datos_Rollos[i].prod_Id,
                Producto : datos_Rollos[i].prod_Nombre,
                Cantidad : datos_Rollos[i].dtIngRollo_Cantidad,
                Presentacion : datos_Rollos[i].undMed_Id,
                Fecha : datos_Rollos[i].ingRollo_Fecha.replace('T00:00:00', ''),
              }
              this.rollos.push(info);
              this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
            }
          }
        });
      } else if (fechaInicial != null) {
        this.dtIngRollosService.getRollosDisponibles(fechaInicial).subscribe(datos_Rollos => {
          consulta = datos_Rollos.length;
          for (let i = 0; i < datos_Rollos.length; i++) {
            if (!rollos.includes(datos_Rollos[i].rollo_Id)) {
              let info : any = {
                Ot : datos_Rollos[i].dtIngRollo_OT,
                Id : datos_Rollos[i].rollo_Id,
                IdProducto : datos_Rollos[i].prod_Id,
                Producto : datos_Rollos[i].prod_Nombre,
                Cantidad : datos_Rollos[i].dtIngRollo_Cantidad,
                Presentacion : datos_Rollos[i].undMed_Id,
                Fecha : datos_Rollos[i].ingRollo_Fecha.replace('T00:00:00', ''),
              }
              this.rollos.push(info);
              this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
            }
          }
        });
      } else if (ot != null) {
        this.dtIngRollosService.getRollosDisponiblesOT(ot).subscribe(datos_Rollos => {
          consulta = datos_Rollos.length;
          for (let i = 0; i < datos_Rollos.length; i++) {
            if (!rollos.includes(datos_Rollos[i].rollo_Id)) {
              let info : any = {
                Ot : datos_Rollos[i].dtIngRollo_OT,
                Id : datos_Rollos[i].rollo_Id,
                IdProducto : datos_Rollos[i].prod_Id,
                Producto : datos_Rollos[i].prod_Nombre,
                Cantidad : datos_Rollos[i].dtIngRollo_Cantidad,
                Presentacion : datos_Rollos[i].undMed_Id,
                Fecha : datos_Rollos[i].ingRollo_Fecha.replace('T00:00:00', ''),
              }
              this.rollos.push(info);
              this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
            }
          }
        });
      } else if (rollo != null) {
        this.dtIngRollosService.getRollosDisponiblesRollo(rollo).subscribe(datos_Rollos => {
          consulta = datos_Rollos.length;
          for (let i = 0; i < datos_Rollos.length; i++) {
            if (!rollos.includes(datos_Rollos[i].rollo_Id)) {
              let info : any = {
                Ot : datos_Rollos[i].dtIngRollo_OT,
                Id : datos_Rollos[i].rollo_Id,
                IdProducto : datos_Rollos[i].prod_Id,
                Producto : datos_Rollos[i].prod_Nombre,
                Cantidad : datos_Rollos[i].dtIngRollo_Cantidad,
                Presentacion : datos_Rollos[i].undMed_Id,
                Fecha : datos_Rollos[i].ingRollo_Fecha.replace('T00:00:00', ''),
              }
              this.rollos.push(info);
              this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
            }
          }
        });
      } else {
        this.dtIngRollosService.srvObtenerListaRollosDisponible().subscribe(datos_Rollos => {
          consulta = datos_Rollos.length;
          for (let i = 0; i < datos_Rollos.length; i++) {
            if (!rollos.includes(datos_Rollos[i].rollo_Id)) {
              let info : any = {
                Ot : datos_Rollos[i].dtIngRollo_OT,
                Id : datos_Rollos[i].rollo_Id,
                IdProducto : datos_Rollos[i].prod_Id,
                Producto : datos_Rollos[i].prod_Nombre,
                Cantidad : datos_Rollos[i].dtIngRollo_Cantidad,
                Presentacion : datos_Rollos[i].undMed_Id,
                Fecha : datos_Rollos[i].ingRollo_Fecha.replace('T00:00:00', ''),
              }
              this.rollos.push(info);
              this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
            }
          }
        });
      }
      setTimeout(() => {
        if (consulta <= 0) this.mensajeService.mensajeAdvertencia(`Advertencia`,`No hay rollos por salir!`);
        this.cargando = true;
      }, 2000);
    }, 4000);
  }

  // Funcion que colocará los rollos que se van a insertar
  llenarRollosAIngresar(item : any){
    this.rollos.splice(this.rollos.findIndex((data) => item.Id == data.Id), 1);
    this.rollosInsertar.sort((a,b) => Number(a.Id) - Number(b.Id) );
    this.rollosInsertar.sort((a,b) => Number(a.exits) - Number(b.exits) );
    this.GrupoProductos();
  }

  // Funcion que seleccionará y colocará todos los rollos que se van a insertar
  seleccionarTodosRollos(item : any){
    this.rollos = item.filter((data) => data.exits);
    this.rollosInsertar.sort((a,b) => Number(a.Id) - Number(b.Id) );
    this.rollosInsertar.sort((a,b) => Number(a.exits) - Number(b.exits) );
    this.GrupoProductos();
  }

  //Funcion que va a quitar lo rollos que se van a insertar
  quitarRollosAIngresar(item : any){
    this.rollosInsertar.splice(this.rollosInsertar.findIndex((data) => item.Id == data.Id), 1);
    this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
    this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
    this.GrupoProductos();
  }

  // Funcion que va a quitar todos los rollos que se van a insertar
  quitarTodosRollos(){
    this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
    this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
    this.rollosInsertar = [];
    this.GrupoProductos();
  }

  // Funcion que permitirá ver el total de lo escogido para cada producto
  GrupoProductos(){
    let producto : any = [];
    this.grupoProductos = [];
    for (let i = 0; i < this.rollosInsertar.length; i++) {
      if (!producto.includes(this.rollosInsertar[i].IdProducto)) {
        let cantidad : number = 0;
        let cantRollo : number = 0;
        for (let j = 0; j < this.rollosInsertar.length; j++) {
          if (this.rollosInsertar[i].IdProducto == this.rollosInsertar[j].IdProducto && !this.rollosInsertar[j].exits && !this.rollosInsertar[j].exits) {
            cantidad += this.rollosInsertar[j].Cantidad;
            cantRollo += 1;
          }
        }
        if (cantRollo > 0){
          producto.push(this.rollosInsertar[i].IdProducto);
          let info : any = {
            Ot: this.rollosInsertar[i].Ot,
            Id : this.rollosInsertar[i].IdProducto,
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
      this.rollosInsertar.sort((a,b) => Number(a.Ot) - Number(b.Ot));
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

  // Funcion que almacenará en la base de datos la información general de la salida de los rollos
  salidaRollos(){
    if (this.rollosInsertar.length == 0 || this.FormConsultarRollos.value.Proceso == null) this.mensajeService.mensajeAdvertencia(`Advertencia`, `Para realizar la asignación debe seleccionar minimo un rollo y el proceso hacía el que va dirigido!`);
    else {
      let Observacion : string = this.FormConsultarRollos.value.Observacion;
      this.cargando = false;
      let info : any = {
        AsgRollos_Fecha : this.today,
        AsgRollos_Hora : moment().format("H:mm:ss"),
        AsgRollos_Observacion : Observacion,
        Usua_Id : this.storage_Id,
      }
      this.asgRollos.srvGuardar(info).subscribe(() => {
        this.asgRollos.obtenerUltimoId().subscribe(data => this.dtSalidaRollos(data.asgRollos_Id), () => this.mensajeService.mensajeError(`¡Error!`, `Error al obtener el último Id de asignación!`));
      }, () => {
        this.mensajeService.mensajeError(`Error`, `Error al asignar los rollos!`);
        this.cargando = true;
      });
    }
  }

  // Funcion que ingresará los rollos que están saliendo
  dtSalidaRollos(id : number){
    let procesos : string = this.FormConsultarRollos.value.Proceso;
    for (let i = 0; i < this.rollosInsertar.filter((item) => !item.exits).length; i++) {
      let info : any = {
        AsgRollos_Id : id,
        DtAsgRollos_OT : this.rollosInsertar[i].Ot,
        Rollo_Id : this.rollosInsertar[i].Id,
        DtAsgRollos_Cantidad : this.rollosInsertar[i].Cantidad,
        UndMed_Id : this.rollosInsertar[i].Presentacion,
        Proceso_Id : procesos,
        Prod_Id : parseInt(this.rollosInsertar[i].IdProducto),
      }
      this.dtAsgRollos.srvGuardar(info).subscribe(() => {}, () => this.mensajeService.mensajeError(`Error`, `Error al dar salida a los rollos!!`));
    }
    setTimeout(() => { this.finalizarInsercion(id); }, 3000);
  }

  // Funcion que cambiará el estado de los rollos a asignados
  cambioEstado(){
    for (let i = 0; i < this.rollosInsertar.length; i++) {
      this.dtIngRollosService.consultarRollo(this.rollosInsertar[i].Id).subscribe(datos_Rollos => {
        for (let j = 0; j < datos_Rollos.length; j++) {
          let info : any = {
            DtIngRollo_Id : datos_Rollos[j].dtIngRollo_Id,
            IngRollo_Id : datos_Rollos[j].ingRollo_Id,
            Rollo_Id : datos_Rollos[j].rollo_Id,
            DtIngRollo_Cantidad : datos_Rollos[j].dtIngRollo_Cantidad,
            UndMed_Id : datos_Rollos[j].undMed_Id,
            DtIngRollo_OT : datos_Rollos[j].dtIngRollo_OT,
            Estado_Id : 23,
            Proceso_Id : datos_Rollos[j].proceso_Id,
            Prod_Id : datos_Rollos[j].prod_Id,
          }
          this.dtIngRollosService.srvActualizar(datos_Rollos[j].dtIngRollo_Id, info).subscribe(null, () => this.mensajeService.mensajeError(`Error`, `No fue posible actualizar el estado de los rollos!`));
        }
      });
    }
  }

  //Funcion que se encargará de lenviar el mensaje de confirmación del envio y limpiará los campos
  finalizarInsercion(id : number){
    this.cambioEstado();
    setTimeout(() => {
      this.mensajeService.mensajeConfirmacion(`Confirmación`,`${this.totalRollos} fueron asignados correctamente!`);
      this.buscarRolloPDF(id);
    }, 2000);
  }

  // Funcion que creará un pdf a base de la informacion ingresada en las asignacion de rollos a facturas
  crearPDF(id : number){
    let nombre : string = this.AppComponent.storage_Nombre;
    this.dtAsgRollos.crearPdf(id).subscribe(datos_ingreso => {
      for (let i = 0; i < datos_ingreso.length; i++) {
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
          watermark: { text: 'PLASTICARIBE SAS', color: 'red', opacity: 0.05, bold: true, italics: false },
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
            this.table2(this.grupoProductos, ['Id', 'Nombre', 'Cantidad', 'Rollos', 'Presentacion']),
            {
              text: `\n\n Información detallada de los Rollos \n `,
              alignment: 'center',
              style: 'header'
            },

            this.table(this.rollosPDF, ['OT', 'Rollo', 'Producto', 'Nombre', 'Cantidad', 'Presentacion', 'Proceso']),
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
    }, () => this.mensajeService.mensajeError(`Error`,`No se pudo obtener la información necesaria para crear el archivo PDF!`));
  }

  // Funcion que traerá los rollos que fueron ingresados
  buscarRolloPDF(id : number){
    this.rollosPDF = [];
    this.dtAsgRollos.crearPdf(id).subscribe(datos_ingreso => {
      for (let i = 0; i < datos_ingreso.length; i++) {
        let info : any = {
          OT : datos_ingreso[i].dtAsgRollos_OT,
          Producto : datos_ingreso[i].prod_Id,
          Nombre : datos_ingreso[i].prod_Nombre,
          Rollo : datos_ingreso[i].rollo_Id,
          Cantidad : this.formatonumeros(datos_ingreso[i].dtAsgRollos_Cantidad),
          Presentacion : datos_ingreso[i].undMed_Id,
          Proceso : datos_ingreso[i].proceso_Nombre,
        }
        this.rollosPDF.push(info);
        this.rollosPDF.sort((a,b) => Number(a.Rollo) - Number(b.Rollo));
      }
      setTimeout(() => this.crearPDF(id), 1200);
    }, () => this.mensajeService.mensajeError(`Error`, `No se pudo obtener la información necesaria para crear llenar el archivo de tipo PDF!`));
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
        widths: [50, 50, 50, 218, 40, 45, 42],
        body: this.buildTableBody(data, columns),
      },
      fontSize: 7,
      layout: {
        fillColor: function (rowIndex) {
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
        fillColor: function (rowIndex) {
          return (rowIndex == 0) ? '#CCCCCC' : null;
        }
      }
    };
  }
}
