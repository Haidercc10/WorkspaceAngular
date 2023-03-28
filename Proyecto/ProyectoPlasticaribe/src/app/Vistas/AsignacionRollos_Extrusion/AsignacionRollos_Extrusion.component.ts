import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import pdfMake from 'pdfmake/build/pdfmake';
import { AsignacionRollos_ExtrusionService } from 'src/app/Servicios/AsignaciinRollosExtrusion/AsignacionRollos_Extrusion.service';
import { DetallesAsgRollos_ExtrusionService } from 'src/app/Servicios/DetallesAsgRollosExtrusion/DetallesAsgRollos_Extrusion.service';
import { DtIngRollos_ExtrusionService } from 'src/app/Servicios/DetallesIngresoRollosExtrusion/DtIngRollos_Extrusion.service';
import { ProcesosService } from 'src/app/Servicios/Procesos/procesos.service';
import Swal from 'sweetalert2';

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
  validarRollo : any [] = []; //Variable para validará que el rollo no esté en la tabla
  first = 0;
  rows = 20;
  procesos : any [] = []; //Variable que va a almacenar los diferentes procesos
  totalRollos : number = 0; //Variable que almacenará el total de rollos escogidos
  totalCantidad : number = 0; //Variable que almacenará la cantidad de total de kg de los rollos escogidos
  rollosPDF : any [] = []; //Variable que almacenará la informacion de los rollos salientes

  constructor(private frmBuilderPedExterno : FormBuilder,
                @Inject(SESSION_STORAGE) private storage: WebStorageService,
                  private dtIngRollosService : DtIngRollos_ExtrusionService,
                    private procesosService : ProcesosService,
                      private asgRollos : AsignacionRollos_ExtrusionService,
                        private dtAsgRollos : DetallesAsgRollos_ExtrusionService,) {

    this.FormConsultarRollos = this.frmBuilderPedExterno.group({
      OT_Id: [null],
      IdRollo : [null],
      fechaDoc : [null],
      fechaFinalDoc: [null],
      Proceso : [null, Validators.required],
      Observacion : [''],
    });
  }

  ngOnInit() {
    this.lecturaStorage();
    this.obtenerProcesos();
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = '$1,';
    return number.toString().replace(exp,rep);
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.storage.get('Id');
    this.storage_Nombre = this.storage.get('Nombre');
    this.ValidarRol = this.storage.get('Rol');
  }

  // funcion que va a limpiar los campos del formulario
  limpiarForm(){
    this.FormConsultarRollos.patchValue({
      OT_Id: null,
      IdRollo: null,
      fechaDoc : null,
      fechaFinalDoc: null,
      Observacion : '',
      Proceso : null,
    });
  }

  // Funcion que va a limpiar todos los campos
  limpiarCampos(){
    this.FormConsultarRollos.patchValue({
      OT_Id: null,
      IdRollo: null,
      fechaDoc : null,
      fechaFinalDoc: null,
      Observacion : '',
      Proceso : null,
    });
    this.rollos = [];
    this.rollosInsertar = [];
    this.validarRollo = [];
    this.grupoProductos = [];
    this,this.totalCantidad = 0;
    this.totalRollos = 0;
    this.cargando = true;
  }

  // Funcion que se encargará de consultar los procesos
  obtenerProcesos(){
    this.procesosService.srvObtenerLista().subscribe(datos_procesos => {
      for (let i = 0; i < datos_procesos.length; i++) {
        if (datos_procesos[i].proceso_Id != 'RECUP' && datos_procesos[i].proceso_Id != 'TINTAS') this.procesos.push(datos_procesos[i]);
      }
    });
  }

  // Funcion que va a consultar los rollos
  consultarRollos(){
    let ot : number = this.FormConsultarRollos.value.OT_Id;
    let fechaInicial : any = this.FormConsultarRollos.value.fechaDoc;
    let fechaFinal : any = this.FormConsultarRollos.value.fechaFinalDoc;
    let rollo : number = this.FormConsultarRollos.value.IdRollo;
    let rollos : any = [];
    let consulta : number;
    this.rollos = [];
    this.cargando = false;
    for (let i = 0; i < this.rollosInsertar.length; i++) {
      rollos.push(this.rollosInsertar[i].Id);
    }
    setTimeout(() => {
      if (ot != null && fechaInicial != null && fechaFinal != null) {
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
      setTimeout(() => { if (consulta <= 0) this.mensajeAdvertencia('¡No hay rollos por salir!'); }, 2000);
    }, 3000);
  }

  // Funcion que colocará los rollos que se van a insertar
  llenarRollosAIngresar(item : any){
    for (let i = 0; i < this.rollos.length; i++) {
      if (this.rollos[i].Id == item.Id) this.rollos.splice(i, 1);
    }
    this.rollosInsertar.sort((a,b) => Number(a.Id) - Number(b.Id) );
    this.rollosInsertar.sort((a,b) => Number(a.exits) - Number(b.exits) );
    this.GrupoProductos();
  }

  // Funcion que seleccionará y colocará todos los rollos que se van a insertar
  seleccionarTodosRollos(item : any){
    for (let i = 0; i < item.length; i++) {
      if (item[i].exits != true) this.rollos = [];
    }
    for (let i = 0; i < item.length; i++) {
      if (item[i].exits == true) this.rollos.push(item[i]);
    }
    this.rollosInsertar.sort((a,b) => Number(a.Id) - Number(b.Id) );
    this.rollosInsertar.sort((a,b) => Number(a.exits) - Number(b.exits) );
    this.GrupoProductos();
  }

  //Funcion que va a quitar lo rollos que se van a insertar
  quitarRollosAIngresar(item : any){
    for (let i = 0; i < this.rollosInsertar.length; i++) {
      if (this.rollosInsertar[i].Id == item.Id) this.rollosInsertar.splice(i, 1);
    }
    this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
    this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
    this.GrupoProductos();
  }

  // Funcion que va a quitar todos los rollos que se van a insertar
  quitarTodosRollos(item : any){
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
    if (this.rollosInsertar.length == 0 || this.FormConsultarRollos.value.Proceso == null) this.mensajeAdvertencia(`¡Debe selecionar minimo un rollo para realizar la salida de este mismo y elegir el proceso hacia el que irán los rollos!`);
    else {
      let Observacion : string = this.FormConsultarRollos.value.Observacion;
      this.cargando = false;
      let info : any = {
        AsgRollos_Fecha : this.today,
        AsgRollos_Hora : moment().format("H:mm:ss"),
        AsgRollos_Observacion : Observacion,
        Usua_Id : this.storage_Id,
      }
      this.asgRollos.srvGuardar(info).subscribe(datos_rollos => {
        this.asgRollos.obtenerUltimoId().subscribe(datos_salida => { this.dtSalidaRollos(datos_salida.asgRollos_Id);
        }, error => { this.mensajeError(`¡¡Error al obtener el último Id de asignación!!`, error.message); });
      }, error => {
        this.mensajeError(`¡¡Error al dar salida a los rollos!!`, error.message);
        this.cargando = true;
      });
    }
  }

  // Funcion que ingresará los rollos que están saliendo
  dtSalidaRollos(id : number){
    let procesos : string = this.FormConsultarRollos.value.Proceso;
    for (let i = 0; i < this.rollosInsertar.length; i++) {
      if (!this.rollosInsertar[i].exits) {
        let info : any = {
          AsgRollos_Id : id,
          DtAsgRollos_OT : this.rollosInsertar[i].Ot,
          Rollo_Id : this.rollosInsertar[i].Id,
          DtAsgRollos_Cantidad : this.rollosInsertar[i].Cantidad,
          UndMed_Id : this.rollosInsertar[i].Presentacion,
          Proceso_Id : procesos,
          Prod_Id : parseInt(this.rollosInsertar[i].IdProducto),
        }
        this.dtAsgRollos.srvGuardar(info).subscribe(datos_rollos => {
        }, error => { this.mensajeError(`¡¡Error al dar salida a los rollos!!`, error.message); });
      }
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
          this.dtIngRollosService.srvActualizar(datos_Rollos[j].dtIngRollo_Id, info).subscribe(datos_actualizados => {
          }, error => { this.mensajeError(`¡¡No fue posible actualizar el estado de los rollos!!`, error.message); });
        }
      });
    }
  }

  //Funcion que se encargará de lenviar el mensaje de confirmación del envio y limpiará los campos
  finalizarInsercion(id : number){
    this.cambioEstado();
    setTimeout(() => {
      Swal.fire({ icon: 'success', title: 'Registro Exitoso', html: `<b>¡${this.totalRollos} fueron asignados correctamente!</b><hr>`, });
      this.buscarRolloPDF(id);
    }, 2000);
  }

  // Funcion que creará un pdf a base de la informacion ingresada en las asignacion de rollos a facturas
  crearPDF(id : number){
    let nombre : string = this.storage.get('Nombre');
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
          content : [
            {
              text: `Salida de Rollos a Bodega de Extrusión`,
              alignment: 'right',
              style: 'titulo',
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
    }, error => { this.mensajeError(`¡No se pudo obtener la información necesaria para crear el archivo de tipo PDF!`, error.message); });
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
      setTimeout(() => { this.crearPDF(id); }, 1200);
    }, error => { this.mensajeError(`¡No se pudo obtener la información necesaria para crear llenar el archivo de tipo PDF!`, error.message); });
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

  // Mensaje de Advertencia
  mensajeAdvertencia(mensaje : string, mensaje2 : string = ''){
    Swal.fire({ icon: 'warning', title: 'Advertencia', html:`<b>${mensaje}</b><hr> ` + `<spam>${mensaje2}</spam>`, showCloseButton: true, });
    this.cargando = true;
  }

  // Mensaje de Error
  mensajeError(text : string, error : any = ''){
    Swal.fire({ icon: 'error', title: 'Oops...', html: `<b>${text}</b><hr> ` +  `<spam style="color : #f00;">${error}</spam> `, showCloseButton: true, });
    this.cargando = true;
  }
}
