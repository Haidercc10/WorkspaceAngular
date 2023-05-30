import { Component, Injectable, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import pdfMake from 'pdfmake/build/pdfmake';
import { MessageService } from 'primeng/api';
import { DetallesEntradaRollosService } from 'src/app/Servicios/DetallesEntradasRollosDespacho/DetallesEntradaRollos.service';
import { DtPreEntregaRollosService } from 'src/app/Servicios/DetallesPreIngresoRollosDespacho/DtPreEntregaRollos.service';
import { ExistenciasProductosService } from 'src/app/Servicios/ExistenciasProductos/existencias-productos.service';
import { EntradaRollosService } from 'src/app/Servicios/IngresoRollosDespacho/EntradaRollos.service';
import { ProductoService } from 'src/app/Servicios/Productos/producto.service';
import { AppComponent } from 'src/app/app.component';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';
import { defaultStepOptions, stepsIngresoRolloDespacho as defaultSteps } from 'src/app/data';
import { ShepherdService } from 'angular-shepherd';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';

@Component({
  selector: 'app-Ingresar_Productos',
  templateUrl: './Ingresar_Productos.component.html',
  styleUrls: ['./Ingresar_Productos.component.css']
})

@Injectable({
  providedIn: 'root'
})

export class Ingresar_ProductosComponent implements OnInit {

  public FormConsultarRollos !: FormGroup; //formulario para consultar y crear un ingreso de rollos
  cargando : boolean = false; //Variable para validar que salga o no la imagen de carga
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  hora : any = moment().format("H:mm:ss"); //Variable que almacenará la hora
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  rollos : any [] = []; //Variable que almacenará los difrentes rollos que se hicieron en la orden de trabajo
  rollosInsertar : any [] = []; //Variable que va a amacenar los diferentes rollos que se van a insertar
  presentacionProducto : string = ''; //Variable que almacenará la presentacion del producto de la orden de trabajo consultada
  rollosAsignados : any = [];
  Total : number = 0; //Variable que va a almacenar la cantidad total de kg de los rollos asignados
  grupoProductos : any [] = []; //Variable que guardará de manera descriminada a cada producto
  rollosSinIngresar : number = 0; // variable para calcular la cantidad de rollos que no se han ingresado
  rollosIngresados : number = 0; //variable para calcular la cantidad de rollos que se han ingresado
  procesos : any [] = [{Id : 'EMP', Nombre: 'Empaque'}, {Id : 'EXT', Nombre: 'Extrusión'}, {Id : 'SELLA', Nombre: 'Sellado'}]; //Variable que va a guardar los diferentes procesos de donde vienen los rollos
  minDate: Date = new Date(); //Variable que validará la fecha minima para los campos Date en el HTML
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro

  constructor(private frmBuilderPedExterno : FormBuilder,
                private AppComponent : AppComponent,
                  private ExistenciasProdService : ExistenciasProductosService,
                    private entradaRolloService : EntradaRollosService,
                      private dtEntradaRollosService : DetallesEntradaRollosService,
                        private productosService : ProductoService,
                          private dtPreEntregaService : DtPreEntregaRollosService,
                            private messageService: MessageService,
                              private shepherdService: ShepherdService,
                                private mensajeService : MensajesAplicacionService,) {

    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
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
  }

  // Funcion para limpiar los campos de la vista
  limpiarCampos(){
    this.FormConsultarRollos.reset();
    this.rollos = [];
    this.rollosInsertar = [];
    this.grupoProductos = [];
    this.cargando = false;
    this.Total = 0;
    this.rollosAsignados = [];
  }

  // funcion que va a limpiar los campos del formulario
  limpiarForm = () => this.FormConsultarRollos.reset();

  // Funcion que va a consultar los rollos que estan por ingresar
  consultarRollos(){
    this.rollosSinIngresar = 0;
    this.rollosIngresados = 0;
    let ProcConsulta : any = this.FormConsultarRollos.value.Proceso;
    let ot : number = this.FormConsultarRollos.value.OT_Id;
    let rollo : number = this.FormConsultarRollos.value.IdRollo;
    let fechaInicial : any = moment(this.FormConsultarRollos.value.fechaDoc).format('YYYY-MM-DD');
    let fechaFinal : any = moment(this.FormConsultarRollos.value.fechaFinalDoc).format('YYYY-MM-DD');
    if (fechaInicial == 'Invalid date') fechaInicial = this.today;
    if (fechaFinal == 'Invalid date') fechaFinal = fechaInicial;
    let ruta : string = '';
    let rollosIngresar : number [] = [];
    let rollosIngresados : number [] = [];

    if (ProcConsulta != null) {
      if (!moment(fechaInicial).isBefore('2022-09-25', 'days') && !moment(fechaFinal).isBefore('2022-09-25', 'days')) {
        this.cargando = true;
        this.rollos = [];
        if (ot != null && rollo != null) ruta = `?ot=${ot}&rollo=${rollo}`;
        else if (ot != null) ruta = `?ot=${ot}`;
        else if (rollo != null) ruta = `?rollo=${rollo}`;
        else ruta = ``;
        this.dtPreEntregaService.GetRollos_Ingresar(fechaInicial, fechaFinal, ProcConsulta, ruta).subscribe(data => {
          for (let i = 0; i < data.length; i++) {
            rollosIngresar.push(data[i].rollo);
          }
          setTimeout(() => {
            this.dtEntradaRollosService.GetRollos(rollosIngresar).subscribe(datos => {
              for (let i = 0; i < datos.length; i++) {
                rollosIngresados.push(datos[i].rollo_Id);
              }
              setTimeout(() => {
                for (let i = 0; i < data.length; i++) {
                  if (datos.length > 0 && !rollosIngresados.includes(parseInt(data[i].rollo))) this.llenarRollosIngresar(data[i]);
                  else if (datos.length > 0 && rollosIngresados.includes(parseInt(data[i].rollo))) {
                    let nuevo : any [] = datos.filter((item) => item.rollo_Id == data[i].rollo);
                    for (let j = 0; j < nuevo.length; j++) {
                      if (nuevo[j].proceso_Id != ProcConsulta) this.llenarRollosIngresar(data[i]);
                      else this.llenarRollosIngresados(data[i]);
                    }
                  }
                  if (datos.length == 0) this.llenarRollosIngresar(data[i]);
                }
              }, 1500);
            });
          }, 1500);
        });
        setTimeout(() => { this.cargando = false; }, 5000);
      } else this.mensajeService.mensajeAdvertencia(`Advertencia`, `¡Las fechas digitadas no son validas!`);
    } else this.mensajeService.mensajeAdvertencia(`Advertencia`, `¡Debe seleccionar un proceso!`);
  }

  // Funcion que va a llenar los rollos que están por ingresar
  llenarRollosIngresar(data : any){
    let info : any = {
      Ot : data.orden,
      Id : data.rollo,
      IdProducto : data.id_Producto,
      Producto : data.producto,
      Cantidad : data.cantidad,
      Presentacion : data.presentacion,
      Estatus : data.proceso,
      Fecha : data.fecha_Ingreso.replace('T00:00:00', ''),
      exits : false,
    }
    this.rollosSinIngresar += 1;
    this.rollos.push(info);
    this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
    this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
  }

  // Funcion que va a llenar los rollos que ya están ingresados
  llenarRollosIngresados(data : any){
    let info : any = {
      Ot : data.orden,
      Id : data.rollo,
      IdProducto : data.id_Producto,
      Producto : data.producto,
      Cantidad : data.cantidad,
      Presentacion : data.presentacion,
      Estatus : data.proceso,
      Fecha : data.fecha_Ingreso.replace('T00:00:00', ''),
      exits : true,
    }
    this.rollosIngresados += 1;
    this.rollos.push(info);
    this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
    this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
  }

  //Funcion que va a agregar Productos en la tabla
  cargarProducto(item : any){
    this.cargando = true;
    this.rollos.splice(this.rollos.findIndex((data) => data.Id == item.Id), 1);
    setTimeout(() => { this.GrupoProductos(); }, 100);
  }

  // Funcion que va a seleccionar todo lo que hay en la tabla
  selccionarTodo(){
    this.cargando = false;
    let nuevo : any = this.rollos.filter((item) => item.exits === true);
    this.rollos = [];
    this.rollos = nuevo;
    setTimeout(() => { this.GrupoProductos(); }, 100);
  }

  // Funcion que va a quitar todo lo que hay en la tabla
  quitarTodo(){
    this.cargando = true;
    this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
    this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
    this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
    this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
    setTimeout(() => { this.rollosInsertar = []; }, 500);
    setTimeout(() => { this.GrupoProductos(); }, 100);
  }

  // Funcion que se va a encargar de quitar rollos de la tabla inferior
  quitarRollo(item : any){
    this.cargando = true;
    this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
    this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
    this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
    this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
    this.rollosInsertar.splice(this.rollosInsertar.findIndex((data) => data.Id == item.Id), 1);
    setTimeout(() => { this.GrupoProductos(); }, 100);
  }

  // Funcion que permitirá ver el total de lo escogido para cada producto
  GrupoProductos(){
    let producto : any = [];
    this.grupoProductos = [];
    for (let i = 0; i < this.rollosInsertar.length; i++) {
      if (!producto.includes(this.rollosInsertar[i].IdProducto) && !this.rollosInsertar[i].exits) {
        let cantidad : number = 0;
        let cantRollo : number = 0;
        for (let j = 0; j < this.rollosInsertar.length; j++) {
          if (this.rollosInsertar[i].IdProducto == this.rollosInsertar[j].IdProducto) {
            cantidad += this.rollosInsertar[j].Cantidad;
            this.Total += cantidad;
            cantRollo += 1;
          }
        }
        producto.push(this.rollosInsertar[i].IdProducto);
        let info : any = {
          Id : this.rollosInsertar[i].IdProducto,
          Nombre : this.rollosInsertar[i].Producto,
          Cantidad : this.formatonumeros(cantidad.toFixed(2)),
          Cantidad2 : cantidad,
          Rollos: this.formatonumeros(cantRollo.toFixed(2)),
          Presentacion : this.rollosInsertar[i].Presentacion,
        }
        this.grupoProductos.push(info);
      }
    }
    this.cargando = false;
  }

  //Funcion para meter el encabezado de la entrada
  IngresarInfoRollos(){
    if (this.rollosInsertar.length == 0) this.mensajeService.mensajeAdvertencia(`Advertencia`, "¡Debe tener minimo un rollo seleccionado!");
    else {
      this.cargando = true;
      let info : any = {
        EntRolloProd_Fecha : this.today,
        EntRolloProd_Observacion : this.FormConsultarRollos.value.Observacion,
        Usua_Id : this.storage_Id,
        EntRolloProd_Hora : moment().format('H:mm:ss'),
      }
      this.entradaRolloService.srvGuardar(info).subscribe(datos_entradaRollo => {
        this.entradaRolloService.srvObtenerUltimoId().subscribe(() => {
          this.ingresarRollos(datos_entradaRollo.entRolloProd_Id);
        });
      }, () => {
        this.mensajeService.mensajeError('¡Rollos No Ingresados!', `¡Error al ingresar los rollos!`);
        this.cargando = false;
      });
    }
  }

  // Funcion par ingresar los rollos
  ingresarRollos(idEntrada : number){
    for (let i = 0; i < this.rollosInsertar.length; i++) {
      if (!this.rollosInsertar[i].exits) {
        let proceso = this.rollosInsertar[i].Estatus;
        this.productosService.srvObtenerListaPorId(parseInt(this.rollosInsertar[i].IdProducto)).subscribe(datos_producto => {
          let productos : any = [];
          productos.push(datos_producto);
          for (const item of productos) {
            if(this.rollosInsertar[i].Presentacion == 'Paquete') {
              let info : any = {
                EntRolloProd_Id : idEntrada,
                Rollo_Id : this.rollosInsertar[i].Id,
                DtEntRolloProd_Cantidad : this.rollosInsertar[i].Cantidad,
                UndMed_Rollo : this.rollosInsertar[i].Presentacion,
                Estado_Id : 19,
                DtEntRolloProd_OT : parseInt(this.rollosInsertar[i].Ot),
                Prod_Id : parseInt(this.rollosInsertar[i].IdProducto),
                UndMed_Prod : this.rollosInsertar[i].Presentacion,
                Prod_CantPaquetesRestantes : this.rollosInsertar[i].Cantidad,
                Prod_CantBolsasPaquete : item.prod_CantBolsasPaquete,
                Prod_CantBolsasBulto : item.prod_CantBolsasBulto,
                Prod_CantBolsasRestates : (this.rollosInsertar[i].Cantidad * item.prod_CantBolsasPaquete),
                Prod_CantBolsasFacturadas : 0,
                Proceso_Id : proceso,
              }
              this.dtEntradaRollosService.srvGuardar(info).subscribe(() => { }, () => {
                this.cargando = false;
                this.mensajeService.mensajeError('¡Rollos No Ingresados!', `¡No se pudo ingresar la información de cada rollo ingresado!`);
              });
            } else {
              let info : any = {
                EntRolloProd_Id : idEntrada,
                Rollo_Id : this.rollosInsertar[i].Id,
                DtEntRolloProd_Cantidad : this.rollosInsertar[i].Cantidad,
                UndMed_Rollo : this.rollosInsertar[i].Presentacion,
                Estado_Id : 19,
                DtEntRolloProd_OT : parseInt(this.rollosInsertar[i].Ot),
                Prod_Id : parseInt(this.rollosInsertar[i].IdProducto),
                UndMed_Prod : this.rollosInsertar[i].Presentacion,
                Prod_CantPaquetesRestantes : this.rollosInsertar[i].Cantidad,
                Prod_CantBolsasPaquete : item.prod_CantBolsasPaquete,
                Prod_CantBolsasBulto : item.prod_CantBolsasBulto,
                Prod_CantBolsasRestates : this.rollosInsertar[i].Cantidad,
                Prod_CantBolsasFacturadas : 0,
                Proceso_Id : proceso,
              }
              this.dtEntradaRollosService.srvGuardar(info).subscribe(() => { }, () => {
                this.cargando = false;
                this.mensajeService.mensajeError('¡Rollos No Ingresados!', `¡No se pudo ingresar la información de cada rollo ingresado!`);
              });
            }
          }
        });
      }
    }
    setTimeout(() => { this.InventarioProductos(idEntrada); }, (50 * this.rollosInsertar.length));
  }

  // Funcion para mover el inventario de los productos
  InventarioProductos(idEntrada : any){
    for (let i = 0; i < this.grupoProductos.length; i++) {
      this.ExistenciasProdService.srvObtenerListaPorIdProductoPresentacion(this.grupoProductos[i].Id, this.grupoProductos[i].Presentacion).subscribe(datos_productos => {
        for (let j = 0; j < datos_productos.length; j++) {
          let info : any = {
            Prod_Id: datos_productos[j].prod_Id,
            exProd_Id : datos_productos[j].exProd_Id,
            ExProd_Cantidad: (datos_productos[j].exProd_Cantidad + this.grupoProductos[i].Cantidad2),
            UndMed_Id: datos_productos[j].undMed_Id,
            TpBod_Id: datos_productos[j].tpBod_Id,
            ExProd_Precio: datos_productos[j].exProd_Precio,
            ExProd_PrecioExistencia: (datos_productos[j].exProd_Cantidad + this.grupoProductos[i].Cantidad2) * datos_productos[j].exProd_PrecioVenta,
            ExProd_PrecioSinInflacion: datos_productos[j].exProd_PrecioSinInflacion,
            TpMoneda_Id: datos_productos[j].tpMoneda_Id,
            ExProd_PrecioVenta: datos_productos[j].exProd_PrecioVenta,
          }
          this.ExistenciasProdService.srvActualizar(datos_productos[j].exProd_Id, info).subscribe(() => {
            this.cargando = false;
            this.mensajeService.mensajeConfirmacion('¡Rollos Ingresados!', `¡Entrada de Rollos registrada con exito!`);
          }, () => {
            this.mensajeService.mensajeError('¡Rollos Ingresados con Error!', `¡Error al mover el inventario del Producto ${datos_productos[j].prod_Id}, mover el inventario manualmente!`);
            this.limpiarCampos();
          });
        }
      });
    }
    if (this.grupoProductos.length > 10) setTimeout(() => { this.buscarRolloPDF(idEntrada); }, 3000);
    else setTimeout(() => { this.buscarRolloPDF(idEntrada); }, 1000);
  }

  // Funcion que creará un pdf a base de la informacion ingresada en las asignacion de rollos a facturas
  crearPDF(id : number){
    let nombre : string = this.AppComponent.storage_Nombre;
    this.dtEntradaRollosService.srvCrearPDFUltimoId(id).subscribe(datos_factura => {
      for (let i = 0; i < datos_factura.length; i++) {
        for (let j = 0; j < this.rollosAsignados.length; j++) {
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
                        text: `${datos_factura[i].entRolloProd_Fecha.replace('T00:00:00', '')}`
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
                  ]
                },
                layout: {
                  defaultBorder: false,
                },
                fontSize: 9,
              },
              '\n \n',
              {
                text: `Ingresado Por: ${datos_factura[i].nombreCreador}\n`,
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

              this.table(this.rollosAsignados, ['Rollo', 'Producto', 'Nombre', 'Cantidad', 'Presentacion']),
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
          setTimeout(() => { (this.limpiarCampos()); }, 1200);
          break;
        }
        break;
      }
    });
  }

  // Funcion que traerá los rollos que fueron asignados a la factura creada
  buscarRolloPDF(id : number){
    this.dtEntradaRollosService.srvCrearPDFUltimoId(id).subscribe(datos_factura => {
      for (let i = 0; i < datos_factura.length; i++) {
        let info : any = {
          Rollo : datos_factura[i].rollo_Id,
          Producto : datos_factura[i].prod_Id,
          Nombre : datos_factura[i].prod_Nombre,
          Cantidad : this.formatonumeros(datos_factura[i].dtEntRolloProd_Cantidad),
          Presentacion : datos_factura[i].undMed_Rollo,
        }
        this.rollosAsignados.push(info);
        this.rollosAsignados.sort((a,b) => Number(a.Rollo) - Number(b.Rollo));
      }
    });
    setTimeout(() => { this.crearPDF(id); }, 2000);
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
          widths: [40, 50, 310, 50, 60],
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
