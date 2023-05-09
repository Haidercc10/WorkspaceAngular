import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import pdfMake from 'pdfmake/build/pdfmake';
import { MessageService } from 'primeng/api';
import { ClientesService } from 'src/app/Servicios/Clientes/clientes.service';
import { DetallesEntradaRollosService } from 'src/app/Servicios/DetallesEntradasRollosDespacho/DetallesEntradaRollos.service';
import { DetallesAsignacionProductosFacturaService } from 'src/app/Servicios/DetallesFacturacionRollos/DetallesAsignacionProductosFactura.service';
import { ExistenciasProductosService } from 'src/app/Servicios/ExistenciasProductos/existencias-productos.service';
import { AsignacionProductosFacturaService } from 'src/app/Servicios/FacturacionRollos/AsignacionProductosFactura.service';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-AsignarProductosFacturas',
  templateUrl: './AsignarProductosFacturas.component.html',
  styleUrls: ['./AsignarProductosFacturas.component.css'],
})

export class AsignarProductosFacturasComponent implements OnInit {

  datosNumeros : any = /^[0-9]*(\.?)[ 0-9]+$/; //Variable que se utilizará para valdiar que un dato sea unicamente numerico
  public FormConsultarProductos !: FormGroup; //formulario para consultar y crear un ingreso de rollos
  cargando : boolean = false; //Variable para validar que salga la animacion de carga
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  arrayClientes : any [] = []; // Variable que guardará los clientes en el select input
  rollosDisponibles : any [] = []; //Variable que guardará la informacion de los rollos estan disponibles para facturar
  rollosSeleccionados : any [] = []; //Variable que guardará la informacion de los rollos que se seleccionaron para facturar
  presentacionProducto : string = ''; //Variable que almacenará la presentación del producto consultado
  cantTotalProducto : number = 0; //Variable que almacenará la cantidad total que hay del producto seleccionado
  cantTotalSeleccionados : number = 0; //Variable que almacenará la cantidad total que hay del producto seleccionado
  grupoProductos : any [] = []; //Variable que guardará de manera descriminada a cada producto
  rollosAsignados : any [] = []; //Variable que va a almacenar los rollos que fueron asignados a la factura creada para mostrarlos en el pdf
  Productos = []; //Variable que va a almcanenar el consolidado de los productos para mostrarlos en el pdf
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro

  scrollToTop: any = () => window.scroll(0, 999999999999);

  constructor(private AppComponent : AppComponent,
                private frmBuilder : FormBuilder,
                  private clienteService : ClientesService,
                    private dtEntradaRolloService : DetallesEntradaRollosService,
                      private messageService: MessageService,
                        private asgProdFacturaService : AsignacionProductosFacturaService,
                          private dtAsgProdFacturaService : DetallesAsignacionProductosFacturaService,
                            private ExistenciasProdService : ExistenciasProductosService,){

    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
    this.FormConsultarProductos = this.frmBuilder.group({
      Factura : ['', Validators.required],
      NotaCredito : [''],
      IdProducto : [''],
      CantidadProducto : [0],
      ProdNombre: [''],
      Cliente: [null, Validators.required],
      Cliente_Id : [null, Validators.required],
      Observacion : [''],
    });
  }

  ngOnInit(): void {
    this.lecturaStorage();
    this.obtenerClientes();
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

  // Funcion que va a buscar lo clientes
  obtenerClientes(){
    this.clienteService.srvObtenerLista().subscribe(registrosClientes => {
      for (let index = 0; index < registrosClientes.length; index++) {
        let Clientes : any = registrosClientes[index];
        this.arrayClientes.push(Clientes);
        this.arrayClientes.sort((a,b) => a.cli_Nombre.localeCompare(b.cli_Nombre));
      }
    });
  }

  // Funcion para limpiar los campos de la vista
  limpiarCampos(){
    this.FormConsultarProductos.reset();
    this.rollosDisponibles = [];
    this.rollosSeleccionados = [];
    this.grupoProductos = [];
    this.cantTotalProducto = 0;
    this.presentacionProducto = '';
    this.cargando = false;
    this.cantTotalSeleccionados = 0;
  }

  // Funcion que va a buscar un producto por medio del codigo de este
  buscarProducto(){
    this.cargando = true;
    this.rollosDisponibles = [];
    this.cantTotalProducto = 0;
    this.presentacionProducto = '';
    let id : any = this.FormConsultarProductos.value.IdProducto;
    let cantidadPedida : number = this.FormConsultarProductos.value.CantidadProducto;
    this.dtEntradaRolloService.srvConsultarProducto(id).subscribe(datos_rollos => {
      for (let i = 0; i < datos_rollos.length; i++) {
        if (datos_rollos[i].estado_Id == 19 || datos_rollos[i].estado_Id == 24) {
          let info : any = {
            Id : datos_rollos[i].rollo_Id,
            IdProducto : datos_rollos[i].prod_Id,
            Producto : datos_rollos[i].prod_Nombre,
            Cantidad : datos_rollos[i].dtEntRolloProd_Cantidad,
            Presentacion : datos_rollos[i].undMed_Rollo,
            CantUndPaquetes : datos_rollos[i].prod_CantBolsasPaquete,
            CantUndRestantes : datos_rollos[i].prod_CantBolsasRestates,
            CantPaqRestantes : datos_rollos[i].prod_CantBolsasRestates,
            CantUndRestantesEnviar : datos_rollos[i].prod_CantBolsasRestates,
            CantPaqRestantesEnviar : datos_rollos[i].prod_CantPaquetesRestantes,
            suma : false,
          }
          this.cantTotalProducto += datos_rollos[i].prod_CantPaquetesRestantes;
          this.presentacionProducto = datos_rollos[i].undMed_Rollo;
          if (info.CantPaqRestantes > 0) this.rollosDisponibles.push(info);
          this.rollosDisponibles.sort((a,b) => Number(a.Id) - Number(b.Id) );
          this.FormConsultarProductos.patchValue({ ProdNombre: datos_rollos[i].prod_Nombre, });
        }
      }
      setTimeout(() => {
        if (cantidadPedida > 0) {
          let sumaCantidad : number = 0;
          this.cantTotalProducto = 0;
          for (let i = 0; i < this.rollosDisponibles.length; i++) {

            if (sumaCantidad == cantidadPedida) break;
            else if (sumaCantidad >= cantidadPedida) break;
            else if (sumaCantidad < cantidadPedida) {
              sumaCantidad += this.rollosDisponibles[i].CantPaqRestantes;
              this.rollosDisponibles[i].suma = true;
              this.cantTotalProducto += this.rollosDisponibles[i].CantPaqRestantes;
            }
          }
          setTimeout(() => { this.rollosDisponibles = this.rollosDisponibles.filter((item) => item.suma === true); }, 500);
        }
        this.cargando = false;
      }, 1000);
      if (datos_rollos.length == 0) this.mensajeError(`¡Sin Rollos disponibles!`, `¡El producto con el código ${id} no tiene rollos disponibles!`);
    }, error => { this.mensajeError(`¡Producto No Encontrado!`, `¡No se pudo obtener información del producto con el codigo ${id}!`) });
    if (id.match(this.datosNumeros) == null) this.mensajeError(`¡Debe colocar un Codigo de Producto valido!`,``);
  }

  // Funcion que va a buscar informacion de un cliente
  buscarCliente(){
    let datosNumeros : any = /^[0-9]*(\.?)[ 0-9]+$/;
    let cliente = this.FormConsultarProductos.value.Cliente;
    if (cliente.match(datosNumeros) != null){
      this.clienteService.srvObtenerListaPorId(cliente).subscribe(datos_cliente => {
        this.FormConsultarProductos.patchValue({
          Cliente : datos_cliente.cli_Nombre,
          Cliente_Id : cliente,
        });
      });
    }
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
    this.cantTotalProducto -= rolloSeleccionado[0].CantPaqRestantes;
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
      this.cantTotalProducto += this.rollosDisponibles[i].CantPaqRestantes;
    }
    this.rollosDisponibles.sort((a,b) => Number(a.Id) - Number(b.Id) );
    this.GrupoProductos();
  }

  // Funcion que va a validar cuando se deseleccione 1 rollo
  quitarRollo(data : any){
    this.cargando = true;
    let rolloSeleccionado : any [] = this.rollosSeleccionados.filter((item) => item.Id === data.Id);
    this.cantTotalSeleccionados -= rolloSeleccionado[0].CantPaqRestantes;
    this.cantTotalProducto += rolloSeleccionado[0].CantPaqRestantes;
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
        let cantUnidades : number = 0;
        let cantRollo : number = 0;
        for (let j = 0; j < this.rollosSeleccionados.length; j++) {
          if (this.rollosSeleccionados[i].IdProducto == this.rollosSeleccionados[j].IdProducto) {
            cantidad += this.rollosSeleccionados[j].CantPaqRestantes;
            cantUnidades += this.rollosSeleccionados[j].CantUndRestantes;
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
          Cant_Unidades : this.formatonumeros(cantUnidades.toFixed(2)),
          "Cant. Unidades" : this.formatonumeros(cantUnidades.toFixed(2)),
        }
        this.cantTotalSeleccionados += cantidad;
        this.grupoProductos.push(info);
      }
    }
    setTimeout(() => { this.cargando = false; }, 50);
  }

  // Funcion para cargar en la base de datos la informacion de una factura a la que se le asignarán rollos
  crearAsignacion(){
    if (this.rollosSeleccionados.length != 0) {
      if (this.FormConsultarProductos.valid) {
        if (this.FormConsultarProductos.value.Factura != '') {
          this.cargando = false;
          let factura : string = this.FormConsultarProductos.value.Factura;
          let notaCredito : string = this.FormConsultarProductos.value.NotaCredito;
          let observacion : string = this.FormConsultarProductos.value.Observacion;
          let facturaMayuscula : string = `${factura}`;
          if (notaCredito == '' || notaCredito == null) notaCredito = '';
          else if (notaCredito != '' || notaCredito != null) notaCredito.toUpperCase();
          let info : any = {
            FacturaVta_Id : facturaMayuscula.toUpperCase(),
            NotaCredito_Id : notaCredito,
            Usua_Id : this.storage_Id,
            AsigProdFV_Fecha : this.today,
            AsigProdFV_Hora : moment().format("H:mm:ss"),
            AsigProdFV_Observacion : observacion,
            Cli_Id : this.FormConsultarProductos.value.Cliente_Id,
            Usua_Conductor : 88,
            AsigProdFV_PlacaCamion : '',
            AsigProdFV_FechaEnvio : this.today,
            AsigProdFV_HoraEnvio : moment().format('H:mm:ss'),
          }
          this.asgProdFacturaService.srvGuardar(info).subscribe(datos_asignacion => { this.crearDetallesAsignacion(datos_asignacion.asigProdFV_Id);
          }, error => { this.mensajeError(`¡Error!`,`¡Ocurrió un error al facturar los rollos!`); });
        } else this.mensajeAdvertencia(`¡EL campos factura debe tener información!`);
      } else this.mensajeAdvertencia(`¡Hay campos vacios!`);
    } else this.mensajeAdvertencia("¡Debe haber minimo un rollo seleccionado!");
  }

  // Funcion para subir los detalles de la asignacion, es decir, cada rollo que se asignó a la factura
  crearDetallesAsignacion(asignacion : number){
    for (let i = 0; i < this.rollosSeleccionados.length; i++) {
      let info : any = {
        AsigProdFV_Id : asignacion,
        Prod_Id : this.rollosSeleccionados[i].IdProducto,
        DtAsigProdFV_Cantidad : this.rollosSeleccionados[i].CantPaqRestantes,
        UndMed_Id : this.rollosSeleccionados[i].Presentacion,
        Rollo_Id : this.rollosSeleccionados[i].Id,
        Prod_CantidadUnidades : this.rollosSeleccionados[i].CantUndRestantes,
      }
      this.dtAsgProdFacturaService.srvGuardar(info).subscribe(datos_dtAsignacion => {
      }, error => { this.mensajeError('Error', '¡Error al asignar los rollos!'); });
    }
    setTimeout(() => { this.cambiarEstado(); }, this.rollosSeleccionados.length * 50);
  }

  // Funcion que va a cambiar el estado de los rollos que estan siendo asignados a una factura
  cambiarEstado(){
    let estado : number = 20;
    for (let i = 0; i < this.rollosSeleccionados.length; i++) {
      this.dtEntradaRolloService.srvObtenerVerificarRollo(this.rollosSeleccionados[i].Id).subscribe(datos_rollos => {
        for (let j = 0; j < datos_rollos.length; j++) {
          if(this.rollosSeleccionados[i].Presentacion == 'Paquete') {
            let paquetesRestantes : number = datos_rollos[j].prod_CantPaquetesRestantes - this.rollosSeleccionados[i].CantPaqRestantes;
            if (paquetesRestantes > 0) estado = 19;
            let info : any = {
              codigo : datos_rollos[j].codigo,
              EntRolloProd_Id : datos_rollos[j].entRolloProd_Id,
              Rollo_Id : datos_rollos[j].rollo_Id,
              DtEntRolloProd_Cantidad : datos_rollos[j].dtEntRolloProd_Cantidad,
              undMed_Rollo : datos_rollos[j].undMed_Rollo,
              Estado_Id : estado,
              dtEntRolloProd_OT : datos_rollos[j].dtEntRolloProd_OT,
              Prod_Id : datos_rollos[j].prod_Id,
              UndMed_Prod : datos_rollos[j].undMed_Prod,
              Prod_CantPaquetesRestantes : (paquetesRestantes),
              Prod_CantBolsasPaquete : datos_rollos[j].prod_CantBolsasPaquete,
              Prod_CantBolsasBulto : datos_rollos[j].prod_CantBolsasBulto,
              Prod_CantBolsasRestates : (datos_rollos[j].prod_CantBolsasRestates - this.rollosSeleccionados[i].CantUndRestantes),
              Prod_CantBolsasFacturadas : (this.rollosSeleccionados[i].CantUndRestantes + datos_rollos[j].prod_CantBolsasFacturadas),
              Proceso_Id : datos_rollos[j].proceso_Id,
            }
            this.dtEntradaRolloService.srvActualizar(datos_rollos[j].codigo, info).subscribe(datos_rolloActuializado => { });
          } else {
            estado = 20;
            if (this.rollosSeleccionados[i].CantUndRestantes < datos_rollos[j].prod_CantPaquetesRestantes) estado = 19;
            let info : any = {
              codigo : datos_rollos[j].codigo,
              EntRolloProd_Id : datos_rollos[j].entRolloProd_Id,
              Rollo_Id : datos_rollos[j].rollo_Id,
              DtEntRolloProd_Cantidad : datos_rollos[j].dtEntRolloProd_Cantidad,
              undMed_Rollo : datos_rollos[j].undMed_Rollo,
              Estado_Id : estado,
              dtEntRolloProd_OT : datos_rollos[j].dtEntRolloProd_OT,
              Prod_Id : datos_rollos[j].prod_Id,
              UndMed_Prod : datos_rollos[j].undMed_Prod,
              Prod_CantPaquetesRestantes : (datos_rollos[j].prod_CantPaquetesRestantes - this.rollosSeleccionados[i].CantUndRestantes),
              Prod_CantBolsasPaquete : datos_rollos[j].prod_CantBolsasPaquete,
              Prod_CantBolsasBulto : datos_rollos[j].prod_CantBolsasBulto,
              Prod_CantBolsasRestates : (datos_rollos[j].prod_CantBolsasRestates - this.rollosSeleccionados[i].CantUndRestantes),
              Prod_CantBolsasFacturadas : (this.rollosSeleccionados[i].CantUndRestantes + datos_rollos[j].prod_CantBolsasFacturadas),
              Proceso_Id : datos_rollos[j].proceso_Id,
            }
            this.dtEntradaRolloService.srvActualizar(datos_rollos[j].codigo, info).subscribe(datos_rolloActuializado => { });
          }
        }
      });
    }
    setTimeout(() => { this.moverInventarioProductos(); }, 4000);
  }

  // Funcion que va a mover el inventario de los productos
  moverInventarioProductos(){
    for (let i = 0; i < this.grupoProductos.length; i++) {
      this.ExistenciasProdService.srvObtenerListaPorIdProductoPresentacion(this.grupoProductos[i].Id, this.grupoProductos[i].Presentacion).subscribe(datos_productos => {
        for (let j = 0; j < datos_productos.length; j++) {
          let info : any = {
            Prod_Id: datos_productos[j].prod_Id,
            exProd_Id : datos_productos[j].exProd_Id,
            ExProd_Cantidad: (datos_productos[j].exProd_Cantidad - this.grupoProductos[i].Cantidad2),
            UndMed_Id: datos_productos[j].undMed_Id,
            TpBod_Id: datos_productos[j].tpBod_Id,
            ExProd_Precio: datos_productos[j].exProd_Precio,
            ExProd_PrecioExistencia: (datos_productos[j].exProd_Cantidad - this.grupoProductos[i].Cantidad2) * datos_productos[j].exProd_PrecioVenta,
            ExProd_PrecioSinInflacion: datos_productos[j].exProd_PrecioSinInflacion,
            TpMoneda_Id: datos_productos[j].tpMoneda_Id,
            ExProd_PrecioVenta: datos_productos[j].exProd_PrecioVenta,
          }
          this.ExistenciasProdService.srvActualizar(datos_productos[j].exProd_Id, info).subscribe(datos_existenciaActualizada => {
            this.mensajeConfirmacion(`¡Asignación Registrada!`,`¡La asignación de los rollos a la factura ${this.FormConsultarProductos.value.Factura.toUpperCase()} fue registrada con exito!`)
          });
        }
      });
    }
    this.buscarRolloPDF();
  }

  // Funcion que creará un pdf a base de la informacion ingresada en las asignacion de rollos a facturas
  crearPDF(){
    let factura : string = this.FormConsultarProductos.value.Factura;
    let nombre : string = this.AppComponent.storage_Nombre;

    this.dtAsgProdFacturaService.srvObtenerListaParaPDF(factura.toUpperCase()).subscribe(datos_factura => {
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
              this.table2(this.grupoProductos, ['Id', 'Nombre', 'Cantidad', 'Rollos', 'Presentacion', 'Cant. Unidades']),
              {
                text: `\n\n Información detallada de producto(s)\n `,
                alignment: 'center',
                style: 'header'
              },

              this.table(this.rollosAsignados, ['Rollo', 'Producto', 'Nombre', 'Cantidad', 'Presentacion', 'Cant. Unidades']),
              {
                text: `\nCant. Total: ${this.formatonumeros(this.cantTotalSeleccionados.toFixed(2))}\n\n`,
                alignment: 'right',
                style: 'header',
              },
              {
                text: `\n \nObservación: \n ${datos_factura[i].asigProdFV_Observacion}\n`,
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
          setTimeout(() => { (this.limpiarCampos()); }, 4000);
          break;
        }
        break;
      }
    });
    setTimeout(() => { this.cargando = true; }, 500);
  }

  // Funcion que traerá los rollos que fueron asignados a la factura creada
  buscarRolloPDF(){
    let factura : string = this.FormConsultarProductos.value.Factura;
    this.dtAsgProdFacturaService.srvObtenerListaParaPDF(factura.toUpperCase()).subscribe(datos_factura => {
      for (let i = 0; i < datos_factura.length; i++) {
        let info : any = {
          Rollo : datos_factura[i].rollo_Id,
          Producto : datos_factura[i].prod_Id,
          Nombre : datos_factura[i].prod_Nombre,
          Cantidad : this.formatonumeros(datos_factura[i].dtAsigProdFV_Cantidad),
          Presentacion : datos_factura[i].undMed_Id,
          "Cant. Unidades" : `${this.formatonumeros(datos_factura[i].prod_CantidadUnidades)} Und`
        }
        this.rollosAsignados.push(info);
        this.rollosAsignados.sort((a,b) => Number(a.Rollo) - Number(b.Rollo));
      }
    });

    this.dtAsgProdFacturaService.srvObtenerListaParaPDF2(factura.toUpperCase()).subscribe(datos_factura => {
      for (let i = 0; i < datos_factura.length; i++) {
        let info : any = {
          Producto : datos_factura[i].prod_Id,
          Nombre : datos_factura[i].prod_Nombre,
          Cantidad : this.formatonumeros(datos_factura[i].suma),
          Presentacion : datos_factura[i].undMed_Id,
          "Cant. Unidades" : `${datos_factura[i].SumaUnd} Und`
        }
        this.Productos.push(info);
      }
    });
    setTimeout(() => { this.crearPDF(); }, 500);
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
        widths: [60, 60, 200, 70, 60, 50],
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
        widths: [60, 200, 70, 40, 80, 50],
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

  // Funcion que devolverá un mensaje de satisfactorio
  mensajeConfirmacion(titulo : string, mensaje : any) {
    this.messageService.add({severity:'success', summary: titulo, detail: mensaje, life: 2000});
    this.cargando = false;
  }

  // Funcion que va a devolver un mensaje de error
  mensajeError(titulo : string, mensaje : any) {
    this.messageService.add({severity:'error', summary: titulo, detail: mensaje, life: 2000});
    this.cargando = false;
  }

  // Funcion que va a devolver un mensaje de advertencia
  mensajeAdvertencia(mensaje : any) {
    this.messageService.add({severity:'warn', summary: '¡Advertencia!', detail: mensaje, life: 1500});
    this.cargando = false;
  }
}
