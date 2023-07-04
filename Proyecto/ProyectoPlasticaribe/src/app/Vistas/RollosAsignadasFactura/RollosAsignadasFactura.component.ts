import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShepherdService } from 'angular-shepherd';
import moment from 'moment';
import pdfMake from 'pdfmake/build/pdfmake';
import { MessageService } from 'primeng/api';
import { DetallesEntradaRollosService } from 'src/app/Servicios/DetallesEntradasRollosDespacho/DetallesEntradaRollos.service';
import { DetallesAsignacionProductosFacturaService } from 'src/app/Servicios/DetallesFacturacionRollos/DetallesAsignacionProductosFactura.service';
import { AsignacionProductosFacturaService } from 'src/app/Servicios/FacturacionRollos/AsignacionProductosFactura.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { UsuarioService } from 'src/app/Servicios/Usuarios/usuario.service';
import { AppComponent } from 'src/app/app.component';
import { defaultStepOptions, stepsDespacharRollosDespacho as defaultSteps } from 'src/app/data';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';

@Component({
  selector: 'app-RollosAsignadasFactura',
  templateUrl: './RollosAsignadasFactura.component.html',
  styleUrls: ['./RollosAsignadasFactura.component.css']
})
export class RollosAsignadasFacturaComponent implements OnInit {

  public FormConsultarFactura !: FormGroup; //formulario para consultar una factura y ver los rollos que tiene asignados
  cargando : boolean = false; //Variable para validar que salga la animacion de carga
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  rollosDisponibles : any [] = []; //Variable que guardará la informacion de los rollos estan disponibles para facturar
  rollosSeleccionados : any [] = []; //Variable que guardará la informacion de los rollos que se seleccionaron para facturar
  presentacionProducto : string = ''; //Variable que almacenará la presentación del producto consultado
  cantTotalProducto : number = 0; //Variable que almacenará la cantidad total que hay del producto seleccionado
  cantTotalSeleccionados : number = 0; //Variable que almacenará la cantidad total que hay del producto seleccionado
  grupoProductos : any [] = []; //Variable que guardará de manera descriminada a cada producto
  conductores : any [] = []; //Variable que almcenará la información de los conductores
  Productos : any [] = [];
  rollosAsignados : any [] = [];
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro

  constructor(private AppComponent : AppComponent,
                private frmBuilder : FormBuilder,
                  private messageService: MessageService,
                    private dtAsgProdFacturaService : DetallesAsignacionProductosFacturaService,
                      private usuariosService : UsuarioService,
                        private facturaService : AsignacionProductosFacturaService,
                          private rollosService : DetallesEntradaRollosService,
                            private shepherdService: ShepherdService,
                              private msj : MensajesAplicacionService){

    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
    this.FormConsultarFactura = this.frmBuilder.group({
      Fact_Id: [null, Validators.required],
      Conductor : [null, Validators.required],
      Conductor_Id : [null, Validators.required],
      PlacaCamion : [null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.lecturaStorage();
    this.obtenerCondutores();
  }

  // Funcion que va a hacer que se inicie el tutorial in-app
  tutorial(){
    this.shepherdService.defaultStepOptions = defaultStepOptions;
    this.shepherdService.modal = true;
    this.shepherdService.confirmCancel = false;
    this.shepherdService.addSteps(defaultSteps);
    this.shepherdService.start();
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = '$1,';
    return number.toString().replace(exp,rep);
  }

  // Funcion para limpiar los campos de la vista
  limpiarCampos(){
    this.FormConsultarFactura.reset();
    this.cargando = false;
    this.rollosDisponibles = [];
    this.rollosSeleccionados = [];
    this.presentacionProducto = '';
    this.cantTotalProducto = 0;
    this.cantTotalSeleccionados = 0;
  }

  // Funcion que va a consultar la informacion de los usuarios de tipo conductor
  obtenerCondutores(){
    this.usuariosService.GetConsdutores().subscribe(data => { this.conductores = data });
  }

  // Funcion que va a buscar el nombre del conductor
  cambiarNombreConductor(){
    let id : string = this.FormConsultarFactura.value.Conductor;
    let nuevo : any [] = this.conductores.filter((item) => item.id == id);
    this.FormConsultarFactura.patchValue({
      Conductor : nuevo[0].nombre,
      Conductor_Id : nuevo[0].id,
    });
  }

  //Funcion que traerá los diferentes rollos que se hicieron en la orden de trabajo
  consultarFactura(){
    this.cargando = true;
    this.rollosDisponibles = [];
    this.presentacionProducto = '';
    this.cantTotalProducto = 0;
    let factura : string = this.FormConsultarFactura.value.Fact_Id;
    this.dtAsgProdFacturaService.srvObtenerListaPorCodigoFactura(factura.toUpperCase()).subscribe(datos_factura => {
      if (datos_factura.length == 0) {
        this.msj.mensajeAdvertencia(`Advertencia`, `¡La factura ${factura} no existe!`);
        this.cargando = false;
      }
      for (let i = 0; i < datos_factura.length; i++) {
        if ((datos_factura[i].estado_Id == 20 || datos_factura[i].estado_Id == 19) && datos_factura[i].asigProdFV_PlacaCamion == '') {
          let info : any = {
            Id : datos_factura[i].rollo_Id,
            IdProducto : datos_factura[i].prod_Id,
            Producto : datos_factura[i].prod_Nombre,
            Cantidad : datos_factura[i].dtAsigProdFV_Cantidad,
            Presentacion : datos_factura[i].undMed_Id,
          }
          this.rollosDisponibles.push(info);
          this.presentacionProducto = info.Presentacion;
          this.cantTotalProducto += info.Cantidad;
        }
      }
      setTimeout(() => {
        this.cargando = false;
        if (this.rollosDisponibles.length == 0 && datos_factura.length != 0) this.msj.mensajeAdvertencia(`Advertencia`, `¡Todos los rollos de la factura ${factura} fueron enviados!`);
      }, 500);
    });
  }

  // Funcion que va a validar cuando se seleccionen todos los rollos
  seleccionTodos_Rollos(){
    this.cargando = true;
    this.rollosDisponibles = [];
    this.presentacionProducto = '';
    this.cantTotalProducto = 0;
    this.rollosSeleccionados.sort((a,b) => Number(a.Id) - Number(b.Id) );
    this.GrupoProductos();
  }

  // Funcion que va a validar cuando se seleccione 1 rollo
  seleccionRollo(data : any){
    this.cargando = true;
    let rolloSeleccionado : any [] = this.rollosDisponibles.filter((item) => item.Id === data.Id);
    this.cantTotalProducto -= rolloSeleccionado[0].Cantidad;
    this.cantTotalSeleccionados += rolloSeleccionado[0].Cantidad;
    for (let i = 0; i < this.rollosDisponibles.length; i++) {
      if (this.rollosDisponibles[i].Id === data.Id) this.rollosDisponibles.splice(i, 1);
    }
    this.rollosSeleccionados.sort((a,b) => Number(a.Id) - Number(b.Id) );
    this.GrupoProductos();
  }

  // Funcion que va a validar cuando se deseleccionen todos los rollos
  quitarTodos_Rollos(){
    this.cargando = true;
    this.rollosSeleccionados = [];
    this.presentacionProducto = this.rollosDisponibles[0].Presentacion;
    for (let i = 0; i < this.rollosDisponibles.length; i++) {
      this.cantTotalProducto += this.rollosDisponibles[i].Cantidad;
    }
    this.rollosDisponibles.sort((a,b) => Number(a.Id) - Number(b.Id) );
    this.GrupoProductos();
  }

  // Funcion que va a validar cuando se deseleccione 1 rollo
  quitarRollo(data : any){
    this.cargando = true;
    let rolloSeleccionado : any [] = this.rollosSeleccionados.filter((item) => item.Id === data.Id);
    this.cantTotalSeleccionados -= rolloSeleccionado[0].Cantidad;
    this.cantTotalProducto += rolloSeleccionado[0].Cantidad;
    for (let i = 0; i < this.rollosSeleccionados.length; i++) {
      if (this.rollosSeleccionados[i].Id === data.Id) this.rollosSeleccionados.splice(i, 1);
    }
    this.rollosDisponibles.sort((a,b) => Number(a.Id) - Number(b.Id) );
    this.GrupoProductos();
  }

  // Funcion que permitirá ver el total de lo escogido para cada producto
  GrupoProductos(){
    let producto : any = [];
    this.grupoProductos = [];
    this.cantTotalSeleccionados = 0;
    for (let i = 0; i < this.rollosSeleccionados.length; i++) {
      if (!producto.includes(this.rollosSeleccionados[i].IdProducto)) {
        let cantidad : number = 0;
        let cantRollo : number = 0;
        for (let j = 0; j < this.rollosSeleccionados.length; j++) {
          if (this.rollosSeleccionados[i].IdProducto == this.rollosSeleccionados[j].IdProducto) {
            cantidad += this.rollosSeleccionados[j].Cantidad;
            cantRollo += 1;
          }
        }
        producto.push(this.rollosSeleccionados[i].IdProducto);
        let info : any = {
          Id : this.rollosSeleccionados[i].IdProducto,
          Nombre : this.rollosSeleccionados[i].Producto,
          Cantidad : this.formatonumeros(cantidad.toFixed(2)),
          Cantidad2 : cantidad,
          Rollos: this.formatonumeros(cantRollo.toFixed(2)),
          Presentacion : this.rollosSeleccionados[i].Presentacion,
        }
        this.cantTotalSeleccionados += cantidad;
        this.grupoProductos.push(info);
      }
    }
    setTimeout(() => { this.cargando = false; }, 50);
  }

  // Funcion que agregará el condutor y la placa del camion en que irá el pedido
  actualizarFactura(){
    if (this.FormConsultarFactura.valid) {
      this.cargando = true;
      let factura : string = this.FormConsultarFactura.value.Fact_Id;
      let conductor : number = this.FormConsultarFactura.value.Conductor_Id;
      let placa : string = this.FormConsultarFactura.value.PlacaCamion;
      this.facturaService.srvObtenerListaPorFactura(factura).subscribe(datos_factura => {
        let info : any = {
          FacturaVta_Id : datos_factura.facturaVta_Id,
          NotaCredito_Id : datos_factura.notaCredito_Id,
          Usua_Id : datos_factura.usua_Id,
          AsigProdFV_Fecha : datos_factura.asigProdFV_Fecha,
          AsigProdFV_FechaHora : datos_factura.asigProdFV_FechaHora,
          AsigProdFV_Observacion : datos_factura.asigProdFV_Observacion,
          Cli_Id : datos_factura.cli_Id,
          Usua_Conductor : conductor,
          AsigProdFV_PlacaCamion : placa.toUpperCase(),
          AsigProdFV_FechaEnvio : moment().format('YYYY-MM-DD'),
          AsigProdFV_HoraEnvio : moment().format('H:mm:ss'),
        }
        this.facturaService.srvActualizarFactura(factura, info).subscribe(datos_facturaActualizada => { this.cambiarEstado(); }, error => {
          this.msj.mensajeError(`¡Ha ocurrido un Error!`,`¡Ocurrió un error al momento de despachar los rollos seleccionados!`);
          this.cargando = false;
        });
      });
    } else {
      this.msj.mensajeAdvertencia(`Advertencia`, "¡Hay campos vacios!");
      this.cargando = false;
    }
  }

  // Funcion que cambiará el estado de los rollos a enviados
  cambiarEstado(){
    if (this.rollosSeleccionados.length != 0) {
      for (let i = 0; i < this.rollosSeleccionados.length; i++) {
        this.rollosService.srvObtenerVerificarRollo(this.rollosSeleccionados[i].Id).subscribe(datos_rollos => {
          for (let j = 0; j < datos_rollos.length; j++) {
            if (datos_rollos[j].prod_CantBolsasRestates <= 0) {
              let info : any = {
                Codigo : datos_rollos[j].codigo,
                EntRolloProd_Id : datos_rollos[j].entRolloProd_Id,
                Rollo_Id : datos_rollos[j].rollo_Id,
                DtEntRolloProd_Cantidad : datos_rollos[j].dtEntRolloProd_Cantidad,
                undMed_Rollo : datos_rollos[j].undMed_Rollo,
                Estado_Id : 21,
                dtEntRolloProd_OT : datos_rollos[j].dtEntRolloProd_OT,
                Prod_Id : datos_rollos[j].prod_Id,
                UndMed_Prod : datos_rollos[j].undMed_Prod,
                Prod_CantPaquetesRestantes : datos_rollos[j].prod_CantPaquetesRestantes,
                Prod_CantBolsasPaquete : datos_rollos[j].prod_CantBolsasPaquete,
                Prod_CantBolsasBulto : datos_rollos[j].prod_CantBolsasBulto,
                Prod_CantBolsasRestates : datos_rollos[j].prod_CantBolsasRestates,
                Prod_CantBolsasFacturadas : datos_rollos[j].prod_CantBolsasFacturadas,
                Proceso_Id : datos_rollos[j].proceso_Id,
              }
              this.rollosService.srvActualizar(datos_rollos[j].codigo, info).subscribe(datos_rolloActuializado => {
              }, error => { this.msj.mensajeError(`¡Ha ocurrio un Error!`, `¡Ocurrió un error al intentar cambiar el estado de la factura!`); this.cargando = false; });
            } else if (datos_rollos[j].prod_CantBolsasRestates > 0) {
              let info : any = {
                Codigo : datos_rollos[j].codigo,
                EntRolloProd_Id : datos_rollos[j].entRolloProd_Id,
                Rollo_Id : datos_rollos[j].rollo_Id,
                DtEntRolloProd_Cantidad : datos_rollos[j].dtEntRolloProd_Cantidad,
                undMed_Rollo : datos_rollos[j].undMed_Rollo,
                Estado_Id : datos_rollos[j].estado_Id,
                dtEntRolloProd_OT : datos_rollos[j].dtEntRolloProd_OT,
                Prod_Id : datos_rollos[j].prod_Id,
                UndMed_Prod : datos_rollos[j].undMed_Prod,
                Prod_CantPaquetesRestantes : datos_rollos[j].prod_CantPaquetesRestantes,
                Prod_CantBolsasPaquete : datos_rollos[j].prod_CantBolsasPaquete,
                Prod_CantBolsasBulto : datos_rollos[j].prod_CantBolsasBulto,
                Prod_CantBolsasRestates : datos_rollos[j].prod_CantBolsasRestates,
                Prod_CantBolsasFacturadas : datos_rollos[j].prod_CantBolsasFacturadas,
                Proceso_Id : datos_rollos[j].proceso_Id,
              }
              this.rollosService.srvActualizar(datos_rollos[j].codigo, info).subscribe(datos_rolloActuializado => {
              }, error => { this.msj.mensajeError(`¡Ha ocurrio un Error!`, `¡Ocurrió un error al intentar cambiar el estado de los rollos seleccionados!`); this.cargando = false; });
            }
          }
        });
      }
      setTimeout(() => { this.buscarRolloPDF(); }, 100 * this.rollosSeleccionados.length);
    } else {
      this.msj.mensajeAdvertencia(`Advertencia`, "¡Debe cargar minimo un rollo en la tabla!");
      this.cargando = false;
    }
  }

  // Funcion que cambiará el estado de los rollos a enviados
  cambiarEstadoRollosNoVerificados(){
    for (let i = 0; i < this.rollosSeleccionados.length; i++) {
      this.rollosService.srvObtenerVerificarRollo(this.rollosSeleccionados[i].Id).subscribe(datos_rollos => {
        for (let j = 0; j < datos_rollos.length; j++) {
          let info : any = {
              Codigo : datos_rollos[j].codigo,
              EntRolloProd_Id : datos_rollos[j].entRolloProd_Id,
              Rollo_Id : datos_rollos[j].rollo_Id,
              DtEntRolloProd_Cantidad : datos_rollos[j].dtEntRolloProd_Cantidad,
              undMed_Rollo : datos_rollos[j].undMed_Rollo,
              Estado_Id : 19,
              dtEntRolloProd_OT : datos_rollos[j].dtEntRolloProd_OT,
              Prod_Id : datos_rollos[j].prod_Id,
              UndMed_Prod : datos_rollos[j].undMed_Prod,
              Prod_CantPaquetesRestantes : datos_rollos[j].prod_CantPaquetesRestantes,
              Prod_CantBolsasPaquete : datos_rollos[j].prod_CantBolsasPaquete,
              Prod_CantBolsasBulto : datos_rollos[j].prod_CantBolsasBulto,
              Prod_CantBolsasRestates : datos_rollos[j].prod_CantBolsasRestates,
              Prod_CantBolsasFacturadas : datos_rollos[j].prod_CantBolsasFacturadas,
          }
          this.rollosService.srvActualizar(datos_rollos[j].codigo, info).subscribe(datos_rolloActuializado => {
            this.msj.mensajeConfirmacion(`¡Registro Exitoso!`, '¡Factura confirmada, el/los Rollo(s) pasa a ser enviado!');
            this.cargando = false;
          }, error => { this.msj.mensajeError(`¡Ha ocurrido un error!`, `¡No se pudo actualizar el estado de los rollos seleccionados!`); this.cargando = false; });
        }
      });
    }
  }

  // Funcion que creará un pdf a base de la informacion ingresada en las asignacion de rollos a facturas
  crearPDF(){
    let factura : string = this.FormConsultarFactura.value.Fact_Id;
    this.dtAsgProdFacturaService.srvObtenerListaParaPDF(factura.toUpperCase()).subscribe(datos_factura => {
      for (let i = 0; i < datos_factura.length; i++) {
        for (let j = 0; j < this.rollosSeleccionados.length; j++) {
          const pdfDefinicion : any = {
            info: {
              title: `${factura.toUpperCase()}`
            },
            pageSize: {
              width: 630,
              height: 760
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
                    text: `Rollos de la Factura ${factura.toUpperCase()}`,
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
                        text: `${datos_factura[i].asigProdFV_Fecha.replace('T00:00:00', '')}`
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
                text: `Facturado Por: ${datos_factura[i].nombreCreador}\n`,
                alignment: 'left',
                style: 'header',
              },
              '\n \n',
              {
                text: `\n Información detallada de la Factura \n \n`,
                alignment: 'center',
                style: 'header'
              },
              {
                style: 'tablaCliente',
                table: {
                  widths: ['*', '*'],
                  style: 'header',
                  body: [
                    [
                      `Código: ${factura.toUpperCase()}`,
                      `Nota Credito: ${datos_factura[i].notaCredito_Id}`
                    ],
                    [
                      `Id Cliente: ${datos_factura[i].cli_Id}`,
                      `Nombre Cliente: ${datos_factura[i].cli_Nombre}`
                    ],
                    [
                      `Conductor: ${datos_factura[i].nombreConductor}`,
                      `Placa Camión: ${datos_factura[i].asigProdFV_PlacaCamion}`
                    ]
                  ]
                },
                layout: 'lightHorizontalLines',
                fontSize: 9,
              },
              {
                text: `\n\n Consolidado de producto(s) \n `,
                alignment: 'center',
                style: 'header'
              },
              this.table2(this.Productos, ['Producto', 'Nombre', 'Cantidad', 'Presentacion']),
              {
                text: `\n\n Información detallada de producto(s) pedido(s) \n `,
                alignment: 'center',
                style: 'header'
              },

              this.table(this.rollosAsignados, ['Rollo', 'Producto', 'Nombre', 'Cantidad', 'Presentacion']),
              {
                text: `\n \nObervación sobre el pedido: \n ${datos_factura[i].asigProdFV_Observacion}\n`,
                style: 'header',
              }
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
  buscarRolloPDF(){
    this.Productos = [];
    this.rollosAsignados = [];
    let factura : string = this.FormConsultarFactura.value.Fact_Id;
    this.dtAsgProdFacturaService.srvObtenerListaParaPDF(factura.toUpperCase()).subscribe(datos_factura => {
      for (let i = 0; i < datos_factura.length; i++) {
        let info : any = {
          Rollo : datos_factura[i].rollo_Id,
          Producto : datos_factura[i].prod_Id,
          Nombre : datos_factura[i].prod_Nombre,
          Cantidad : this.formatonumeros(datos_factura[i].dtAsigProdFV_Cantidad),
          Presentacion : datos_factura[i].undMed_Id,
        }
        this.rollosAsignados.push(info);
      }
    });

    this.dtAsgProdFacturaService.srvObtenerListaParaPDF2(factura.toUpperCase()).subscribe(datos_factura => {
      for (let i = 0; i < datos_factura.length; i++) {
        let info : any = {
          Producto : datos_factura[i].prod_Id,
          Nombre : datos_factura[i].prod_Nombre,
          Cantidad : this.formatonumeros(datos_factura[i].suma),
          Presentacion : datos_factura[i].undMed_Id,
        }
        this.Productos.push(info);
      }
    });
    setTimeout(() => { this.crearPDF(); }, 1200);
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
        widths: [60, 60, 250, 70, 70],
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
        widths: [60, 270, 100, 90],
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
