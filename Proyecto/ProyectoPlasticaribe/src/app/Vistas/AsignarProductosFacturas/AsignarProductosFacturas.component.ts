import { ThisReceiver } from '@angular/compiler';
import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import pdfMake from 'pdfmake/build/pdfmake';
import { AsignacionProductosFacturaService } from 'src/app/Servicios/AsignacionProductosFactura.service';
import { BagproService } from 'src/app/Servicios/Bagpro.service';
import { ClientesService } from 'src/app/Servicios/clientes.service';
import { ClientesProductosService } from 'src/app/Servicios/ClientesProductos.service';
import { DetallesAsignacionProductosFacturaService } from 'src/app/Servicios/DetallesAsignacionProductosFactura.service';
import { DetallesEntradaRollosService } from 'src/app/Servicios/DetallesEntradaRollos.service';
import { ExistenciasProductosService } from 'src/app/Servicios/existencias-productos.service';
import { ProductoService } from 'src/app/Servicios/producto.service';
import { RolesService } from 'src/app/Servicios/roles.service';
import { UsuarioService } from 'src/app/Servicios/usuario.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-AsignarProductosFacturas',
  templateUrl: './AsignarProductosFacturas.component.html',
  styleUrls: ['./AsignarProductosFacturas.component.css']
})
export class AsignarProductosFacturasComponent implements OnInit {

  public FormConsultarProductos !: FormGroup; //formulario para consultar y crear un ingreso de rollos

  cargando : boolean = true; //Variable para validar que salga o no la imagen de carga
  today : any = new Date(); //Variable que se usará para llenar la fecha actual
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  checked : boolean = false; //Variable para saber si el checkbox está seleccionado o no
  rollos : any [] = []; //Variable que almacenará los difrentes rollos que se hicieron en la orden de trabajo
  rollosInsertar : any [] = []; //Variable que va a amacenar los diferentes rollos que se van a insertar
  validarRollo : any [] = []; //Variable para validará que el rollo no esté en la tabla
  idProducto : number = 0; //Variable que va a almacenar el id del producto que fue hecho en la ot consultada
  presentacionProducto : string = ''; //Variable que almacenará la presentacion del producto de la orden de trabajo consultada
  rollosAsignados : any [] = []; //Variable que va a almacenar los rollos que fueron asignados a la factura creada
  check : boolean; //Variable que nos a ayudar para saber si un rollo ya fue seleccionado


  keywordNombresProductos = 'prod_Nombre'; /** Variable de palabra clave para Input Producto. */
  validarInputNombresProductos : any = true; /** Variable para validar input producto */
  arrayProducto=[]; /** Array que guardará los productos en el select input */
  keywordClientes = 'cli_Nombre'; /** Variable de palabra clave para Input Producto. */
  validarInputClientes : any = true; /** Variable para validar input producto */
  arrayClientes=[]; /** Array que guardará los clientes en el select input */
  arrayConductor =[];  /** Array que guardará los conductores en el select input */


  constructor(private frmBuilderPedExterno : FormBuilder,
                private rolService : RolesService,
                  @Inject(SESSION_STORAGE) private storage: WebStorageService,
                    private bagProService : BagproService,
                      private ExistenciasProdService : ExistenciasProductosService,
                        private servicioProducto : ProductoService,
                          private servicioClientes: ClientesService,
                            private servicioClientesProductos : ClientesProductosService,
                              private servicioUsuarios : UsuarioService,
                                private dtEntradaRollo : DetallesEntradaRollosService,
                                  private asgProdFactura : AsignacionProductosFacturaService,
                                    private dtAsgProdFactura : DetallesAsignacionProductosFacturaService,) {

    this.FormConsultarProductos = this.frmBuilderPedExterno.group({
      Factura : ['', Validators.required],
      NotaCredito : [''],
      ProdNombre: ['', Validators.required ],
      Cliente: ['', Validators.required],
      Observacion : [''],
    });
  }

  ngOnInit() {
    this.fecha();
    this.lecturaStorage();
    this.llenadoClientes();
    this.ObtenerUsuariosConductores()
  }

  selectEventProducto(item) {
    this.FormConsultarProductos.value.ProdNombre = item.prod_Id;
    if (this.FormConsultarProductos.value.ProdNombre != '') this.validarInputNombresProductos = false;
    else this.validarInputNombresProductos = true;
    // do something with selected item
  }

  onChangeSearchNombreProductos(val: string) {
    if (val != '') this.validarInputNombresProductos = false;
    else this.validarInputNombresProductos = true;
    // fetch remote data from here
    // And reassign the 'data' which is binded to 'data' property.
  }

  onFocusedNombreProductos(e){
    if (!e.isTrusted) this.validarInputNombresProductos = false;
    else this.validarInputNombresProductos = true;
    // do something when input is focused
  }

  selectEventCliente(item) {
    this.FormConsultarProductos.value.Cliente = item.cli_Id;
    if (this.FormConsultarProductos.value.Cliente != '') this.validarInputClientes = false;
    else this.validarInputClientes = true;
    // do something with selected item
  }


  onChangeSearchClientes(val: string) {
    if (val != '') this.validarInputClientes = false;
    else this.validarInputClientes = true;
    // fetch remote data from here
    // And reassign the 'data' which is binded to 'data' property.
  }

  onFocusedNombreClientes(e){
    if (!e.isTrusted) this.validarInputClientes = false;
    else this.validarInputClientes = true;
    // do something when input is focused
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
    let rol = this.storage.get('Rol');
    this.rolService.srvObtenerLista().subscribe(datos_roles => {
      for (let index = 0; index < datos_roles.length; index++) {
        if (datos_roles[index].rolUsu_Id == rol) {
          this.ValidarRol = rol;
          this.storage_Rol = datos_roles[index].rolUsu_Nombre;
        }
      }
    });
  }

  //Funcion que colocará la fecha actual y la colocará en el campo de fecha de pedido
  fecha(){
    this.today = new Date();
    var dd : any = this.today.getDate();
    var mm : any = this.today.getMonth() + 1;
    var yyyy : any = this.today.getFullYear();
    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
    this.today = yyyy + '-' + mm + '-' + dd;
  }

  // Funcion para limpiar los campos de la vista
  limpiarCampos(){
    this.FormConsultarProductos.reset();
    this.rollos = [];
    this.rollosInsertar = [];
    this.validarRollo = [];
    this.cargando = true;
  }

  //Funcion que va a agregar Productos en la tabla
  cargarProducto(item : any){
    if (this.rollosInsertar.length == 0) {
      let info : any = {
        Id : item.Id,
        IdProducto : item.IdProducto,
        Producto : item.Producto,
        Cantidad : item.Cantidad,
        Presentacion : item.Presentacion,
      }
      this.rollosInsertar.push(info);
      this.validarRollo.push(item.Id);
    } else {
      if (!this.validarRollo.includes(item.Id)) {
        let info : any = {
          Id : item.Id,
          IdProducto : item.IdProducto,
          Producto : item.Producto,
          Cantidad : item.Cantidad,
          Presentacion : item.Presentacion,
        }
        this.rollosInsertar.push(info);
        this.validarRollo.push(item.Id);
      } else if (this.validarRollo.includes(item.Id)) {
        for (let i = 0; i < this.rollosInsertar.length; i++) {
          if (this.rollosInsertar[i].Id == item.Id) this.rollosInsertar.splice(i,1);
        }
        for (let i = 0; i < this.validarRollo.length; i++) {
          if (this.validarRollo[i] == item.Id) this.validarRollo.splice(i,1);
        }
      }
    }
    for (let i = 0; i < this.rollos.length; i++) {
      if (this.rollos[i].Id == item.Id) this.rollos.splice(i,1);
    }
  }

  // Funcion que se va a encargar de quitar rollos de la tabla inferior
  quitarRollo(item : any){
    let info : any = {
      Id : item.Id,
      IdProducto : item.IdProducto,
      Producto : item.Producto,
      Cantidad : item.Cantidad,
      Presentacion : item.Presentacion,
      checkbox : true,
    }
    this.rollos.push(info);
    for (let i = 0; i < this.rollosInsertar.length; i++) {
      if (this.rollosInsertar[i].Id == item.Id) this.rollosInsertar.splice(i,1);
    }
    for (let i = 0; i < this.validarRollo.length; i++) {
      if (this.validarRollo[i] == item.Id) this.validarRollo.splice(i,1);
    }
  }

  //Funcion que llanará el array de clientes
  llenadoClientes(){
    this.servicioClientes.srvObtenerLista().subscribe(registrosClientes => {
      for (let index = 0; index < registrosClientes.length; index++) {
        let Clientes : any = registrosClientes[index];
         this.arrayClientes.push(Clientes);
         //console.log(this.arrayClientes);
      }
    });
  }

  //Funcion que va mostrar todos los productos a los que está relacionado el cliente selccionado
  obtenerProductosXClientes(){
    this.arrayProducto = [];
    let Client : any = this.FormConsultarProductos.value.Cliente;

    this.servicioClientesProductos.srvObtenerListaPorNombreCliente(Client).subscribe(registrosCliProd => {
      for (let index = 0; index < registrosCliProd.length; index++) {
        this.servicioProducto.srvObtenerPresentacionProducto(registrosCliProd[index].prod_Id).subscribe(registrosPresentProd => {
          for (let j = 0; j < registrosPresentProd.length; j++) {
            this.arrayProducto.push(registrosPresentProd[j]);
          }
        });
      }
    });
  }

  //Funcion que a mostrar los usuarios de tipo conductor
  ObtenerUsuariosConductores() {
    this.servicioUsuarios.srvObtenerListaUsuario().subscribe(registrosUsuarios => {
      for (let index = 0; index < registrosUsuarios.length; index++) {
        this.servicioUsuarios.srvObtenerListaPorIdConductor(registrosUsuarios[index].usua_Id).subscribe(registrosConductores => {
          for (let ind = 0; ind < registrosConductores.length; ind++) {
            this.arrayConductor.push(registrosConductores[ind]);
          }
        });
      }
    });
  }

  // Funcion que va a cargra los rollos disponibles de un producto
  mostrarRollos(item){
    this.rollos = [];
    this.FormConsultarProductos.value.ProdNombre = item.prod_Id;
    if (this.FormConsultarProductos.value.ProdNombre != '') this.validarInputNombresProductos = false;
    else this.validarInputNombresProductos = true;
    let producto : any = this.FormConsultarProductos.value.ProdNombre;
    this.dtEntradaRollo.srvConsultarProducto(producto).subscribe(datos_rollos => {
      let rollosExistentes : any [] = [];
      for (let i = 0; i < datos_rollos.length; i++) {
        if (datos_rollos[i].estado_Id == 19) {
          this.check = true;
          let info : any = {
            Id : datos_rollos[i].rollo_Id,
            IdProducto : datos_rollos[i].prod_Id,
            Producto : datos_rollos[i].prod_Nombre,
            Cantidad : datos_rollos[i].dtEntRolloProd_Cantidad,
            Presentacion : datos_rollos[i].undMed_Id,
            checkbox : this.check,
          }
          this.rollos.push(info);
          rollosExistentes.push(datos_rollos[i].rollo_Id);
        }
      }
    });
  }

  // Funcion para cargar en la base de datos la informacion de una factura a la que se le asignarán rollos
  crearAsignacion(){
    if (this.rollosInsertar.length != 0 && this.FormConsultarProductos.valid) {
      this.cargando = false;
      let factura : string = this.FormConsultarProductos.value.Factura;
      let notaCredito : string = this.FormConsultarProductos.value.NotaCredito;
      let cliente : any = this.FormConsultarProductos.value.Cliente.cli_Id;
      let observacion : string = this.FormConsultarProductos.value.Observacion;

      let info : any = {
        FacturaVta_Id : factura.toUpperCase(),
        NotaCredito_Id : notaCredito.toUpperCase(),
        Usua_Id : this.storage_Id,
        AsigProdFV_Fecha : this.today,
        AsigProdFV_Observacion : observacion,
        Cli_Id : cliente,
        Usua_Conductor : 88,
        AsigProdFV_PlacaCamion : 'ABC123',
        AsigProdFV_FechaEnvio : this.today,
      }
      this.asgProdFactura.srvGuardar(info).subscribe(datos_asignacion => {
        this.asgProdFactura.srvObtenerUltimoId().subscribe(datos_ultimaAsg => { this.crearDetallesAsignacion(datos_ultimaAsg.asigProdFV_Id) });
      });
    } else Swal.fire("¡Hay campos vacios!");
  }

  // Funcion para subir los detalles de la asignacion, es decir, cada rollo que se asignó a la factura
  crearDetallesAsignacion(asignacion : number){
    for (let i = 0; i < this.rollosInsertar.length; i++) {
      let info : any = {
        AsigProdFV_Id : asignacion,
        Prod_Id : this.rollosInsertar[i].IdProducto,
        DtAsigProdFV_Cantidad : this.rollosInsertar[i].Cantidad,
        UndMed_Id : this.rollosInsertar[i].Presentacion,
        Rollo_Id : this.rollosInsertar[i].Id,
      }
      this.dtAsgProdFactura.srvGuardar(info).subscribe(datos_dtAsignacion => { });
    }
    setTimeout(() => { this.cambiarEstado(); }, 2000);
  }

  // Funcion que va a cambiar el estado de los rollos que estan siendo asignados a una factura
  cambiarEstado(){
    for (let i = 0; i < this.rollosInsertar.length; i++) {
      this.dtEntradaRollo.srvObtenerVerificarRollo(this.rollosInsertar[i].Id).subscribe(datos_rollos => {
        for (let j = 0; j < datos_rollos.length; j++) {
          let info : any = {
            DtEntRolloProd_Codigo : datos_rollos[j].dtEntRolloProd_Codigo,
            EntRolloProd_Id : datos_rollos[j].entRolloProd_Id,
            Rollo_Id : datos_rollos[j].rollo_Id,
            DtEntRolloProd_Cantidad : datos_rollos[j].dtEntRolloProd_Cantidad,
            UndMed_Id : datos_rollos[j].undMed_Id,
            Estado_Id : 21,
          }
          this.dtEntradaRollo.srvActualizar(datos_rollos[j].dtEntRolloProd_Codigo, info).subscribe(datos_rolloActuializado => { });
        }
      });
    }
    setTimeout(() => { this.moverInventarioProductos(); }, 2000);
  }

  // Funcion que va a mover el inventario de los productos
  moverInventarioProductos(){
    let sumaCant : number = 0;
    for (let i = 0; i < this.rollosInsertar.length; i++) {
      sumaCant +=  this.rollosInsertar[i].Cantidad;
    }
    setTimeout(() => {
      for (let k = 0; k < this.rollosInsertar.length; k++) {
        this.ExistenciasProdService.srvObtenerListaPorIdProductoPresentacion(this.rollosInsertar[k].IdProducto, this.rollosInsertar[k].Presentacion).subscribe(datos_existencias => {
          for (let j = 0; j < datos_existencias.length; j++) {
            let info : any = {
              Prod_Id: datos_existencias[j].prod_Id,
              exProd_Id : datos_existencias[j].exProd_Id,
              ExProd_Cantidad: (sumaCant - datos_existencias[j].exProd_Cantidad),
              UndMed_Id: this.presentacionProducto,
              TpBod_Id: datos_existencias[j].tpBod_Id,
              ExProd_Precio: datos_existencias[j].exProd_Precio,
              ExProd_PrecioExistencia: (sumaCant - datos_existencias[j].exProd_Cantidad) * datos_existencias[j].exProd_PrecioVenta,
              ExProd_PrecioSinInflacion: datos_existencias[j].exProd_PrecioSinInflacion,
              TpMoneda_Id: datos_existencias[j].tpMoneda_Id,
              ExProd_PrecioVenta: datos_existencias[j].exProd_PrecioVenta,
            }
            this.ExistenciasProdService.srvActualizarExistencia(datos_existencias[j].exProd_Id, info).subscribe(datos_existenciaActualizada => {
              const Toast = Swal.mixin({
                toast: true,
                position: 'center',
                showConfirmButton: false,
                timer: 2500,
                timerProgressBar: true,
                didOpen: (toast) => {
                  toast.addEventListener('mouseenter', Swal.stopTimer)
                  toast.addEventListener('mouseleave', Swal.resumeTimer)
                }
              });
              Toast.fire({
                icon: 'success',
                title: `¡La asignación de los rollos a la factura ${this.FormConsultarProductos.value.Factura} fue registrada con exito!`
              });
            });
          }
        });
      }
      this.buscarRolloPDF();
    }, 2000);
  }

  // Funcion que creará un pdf a base de la informacion ingresada en las asignacion de rollos a facturas
  crearPDF(){
    let factura : string = this.FormConsultarProductos.value.Factura;

    this.dtAsgProdFactura.srvObtenerListaParaPDF(factura.toUpperCase()).subscribe(datos_factura => {
      for (let i = 0; i < datos_factura.length; i++) {
        for (let j = 0; j < this.rollosAsignados.length; j++) {
          const pdfDefinicion : any = {
            info: {
              title: `${factura.toUpperCase()}`
            },
            pageSize: {
              width: 630,
              height: 760
            },
            content : [
              {
                text: `Rollos de la Factura ${factura.toUpperCase()}`,
                alignment: 'right',
                style: 'titulo',
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
    let factura : string = this.FormConsultarProductos.value.Factura;
    this.dtAsgProdFactura.srvObtenerListaParaPDF(factura.toUpperCase()).subscribe(datos_factura => {
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
    setTimeout(() => { this.crearPDF(); }, 2500);
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
        fontSize: 9,
        layout: {
          fillColor: function (rowIndex, node, columnIndex) {
            return (rowIndex == 0) ? '#CCCCCC' : null;
          }
        }
    };
  }
}
