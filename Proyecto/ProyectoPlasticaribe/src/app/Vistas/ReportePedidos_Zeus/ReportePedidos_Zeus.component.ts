import { Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import pdfMake from 'pdfmake/build/pdfmake';
import { TreeTable } from 'primeng/treetable';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';
import { modelOpedido } from 'src/app/Modelo/modelOpedido';
import { PedidoProductosService } from 'src/app/Servicios/DetallesPedidoProductos/pedidoProductos.service';
import { EstadosProcesos_OTService } from 'src/app/Servicios/EstadosProcesosOT/EstadosProcesos_OT.service';
import { InventarioZeusService } from 'src/app/Servicios/InventarioZeus/inventario-zeus.service';
import { OpedidoproductoService } from 'src/app/Servicios/PedidosProductos/opedidoproducto.service';
import { RolesService } from 'src/app/Servicios/Roles/roles.service';
import Swal from 'sweetalert2';
import { PedidoExternoComponent } from '../Pedido-Externo/Pedido-Externo.component';
import { Reporte_Procesos_OTComponent } from '../Reporte_Procesos_OT/Reporte_Procesos_OT.component';

@Component({
  selector: 'app-ReportePedidos_Zeus',
  templateUrl: './ReportePedidos_Zeus.component.html',
  styleUrls: ['./ReportePedidos_Zeus.component.css']
})
export class ReportePedidos_ZeusComponent implements OnInit {

  @ViewChild('tt') tt: TreeTable | undefined;
  @ViewChild(Reporte_Procesos_OTComponent) modalEstadosProcesos_OT : Reporte_Procesos_OTComponent;
  @ViewChild(PedidoExternoComponent) modalPedidoExterno : PedidoExternoComponent;

  cargando : boolean = false;
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  ArrayDocumento = []; //Varibale que almacenará la información que se mostrará en la tabla de vista
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  productosPedidos : any [] = []; //Variable que se llenará con la información de los productos que se enviaron a la base de datos, los productos serán del ultimo pedido creado
  modalEditar : boolean = false; //Variable que validará si el pedido está en edición o no
  _columnasSeleccionada : any [] = []; //Variable que almacenará las columnas que se han elegido para ver adicionalmente a las que ya se cargan incialmente
  columnas : any [] = []; //Variable que almacenará las columnas que podrán ser selecciondas para ver adicionales a las iniciales
  formFiltros !: FormGroup;
  titlePendiente : string = 'Estado que indica que no se ha realizado entrega de ninguno de los items del pedido.';
  titleParcial : string = 'Estado que indica que se ha realizado entrega de al menos uno de los items del pedido.';
  costoCantidadTotal : number = 0;
  costoCantidadPendiente : number = 0;
  arrayPedidosIndividuales : any = [];
  modalEstadosOrdenes : boolean = false;
  consecutivoPedido : any = '';
  sumaCostoPendiente : number = 0;
  sumaCostoTotal : number = 0;

  constructor(@Inject(SESSION_STORAGE) private storage: WebStorageService,
                private rolService : RolesService,
                  private inventarioZeusService : InventarioZeusService,
                    private FormBuild : FormBuilder,
                      private estadosProcesos_OTService : EstadosProcesos_OTService,
                        private pedidoProductosService : PedidoProductosService,
                          private pedidoExternoService : OpedidoproductoService,) {

    this.formFiltros = this.FormBuild.group({
      IdVendedor : [null],
      Vendedor: [null],
      IdCliente: [null],
      Cliente: [null],
      IdItem: [null],
      Item: [null],
      Fecha1: [null],
      Fecha2 : [null],
    });
  }

  ngOnInit() {
    this.lecturaStorage();
    this.consultarPedidosZeus();
    this.consultarPedidos();
  }

  // Funcion que va a consultar la información que está almcenada en el almacenamiento del navegador
  lecturaStorage(){
    this.storage_Id = this.storage.get('Id');
    this.storage_Nombre = this.storage.get('Nombre');
    this.ValidarRol = this.storage.get('Rol');
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = '$1,';
    return number.toString().replace(exp,rep);
  }

  // Funcion que va a consultar los pedidos de zeus
  consultarPedidosZeus(){
    this.cargando = true;
    this.ArrayDocumento = [];

    this.inventarioZeusService.GetPedidosAgrupados().subscribe(datos_pedidos => {
      for (let i = 0; i < datos_pedidos.length; i++) {
        if (this.ValidarRol == 2){
          if (this.storage_Id == parseInt(datos_pedidos[i].id_Vendedor)) this.llenarEncabezadoPedidosZeus(datos_pedidos[i]);
        } else if (this.ValidarRol == 1 || this.ValidarRol == 60) this.llenarEncabezadoPedidosZeus(datos_pedidos[i]);
      }
    });

    setTimeout(() => {
      this.inventarioZeusService.GetPedidos().subscribe(datos_pedidos => {
        for (let i = 0; i < datos_pedidos.length; i++) {
          this.llenarDetallesPedidosZeus(datos_pedidos[i]);
          this.ArrayDocumento.sort((a,b) => Number(a.consecutivo) - Number(b.consecutivo));
        }
      });
    }, 1500);
    setTimeout(() => { this.cargando = false; }, 2500);
  }

  // Funcion que va llenar el encabezado de los pedidos de zeus
  llenarEncabezadoPedidosZeus(datos : any){
    if(datos.fecha_Creacion == null) datos.fecha_Creacion = datos.fecha_Creacion
    else datos.fecha_Creacion = datos.fecha_Creacion.replace('T00:00:00', '');

    if(datos.fecha_Entrega == null) datos.fecha_Entrega = datos.fecha_Entrega
    else datos.fecha_Entrega = datos.fecha_Entrega.replace('T00:00:00', '');

    const info : any = {
      "data":{
        "consecutivo": datos.consecutivo,
        "cliente": datos.cliente,
        "producto": '',
        "id_Producto": '',
        "cant_Pedida": '',
        "cant_Pendiente": '',
        "cant_Facturada": '',
        "existencias": '',
        "presentacion": '',
        "estado": datos.estado,
        "vendedor": datos.vendedor,
        "precioUnidad" : '',
        "orden_Compra_CLiente": datos.orden_Compra_CLiente,
        "costo_Cant_Pendiente": 0,
        "costo_Cant_Total": 0,
        "fecha_Creacion": datos.fecha_Creacion.replace('T00:00:00', ''),
        "fecha_Entrega": datos.fecha_Entrega.replace('T00:00:00', ''),
        "OT" : '',
        "Proceso_OT": '',
        "CantPesada" : '',
        "Estado_OT": '',
        "CantPedidaKg_OT" : '',
        "CantPedidaUnd_OT" : '',
        "ExistenciaMayor" : false,
        "Cant_Items_ExistenciaMayor" : 0,
        "Cant_Items" : 0,
        "Zeus" : 1,
      },
      expanded: true,
      "children":[]
    }
    this.ArrayDocumento.push(info);
  }

  // Funcion que va a llenar los detalles de cada uno de los pedidos de zeus
  llenarDetallesPedidosZeus(datos : any){
    for (let i = 0; i < this.ArrayDocumento.length; i++) {
      if (this.ArrayDocumento[i].data.consecutivo == datos.consecutivo) {
        const dataPedidos : any = {
          "data":{
            "consecutivo": datos.consecutivo,
            "cliente": datos.cliente,
            "producto": datos.producto,
            "id_Producto": datos.id_Producto,
            "cant_Pedida": datos.cant_Pedida,
            "cant_Pendiente": datos.cant_Pendiente,
            "cant_Facturada": datos.cant_Facturada,
            "existencias": datos.existencias,
            "presentacion": datos.presentacion,
            "estado": datos.estado,
            "vendedor": datos.vendedor,
            "precioUnidad" : this.formatonumeros(datos.precioUnidad.toFixed(2)),
            "orden_Compra_CLiente": datos.orden_Compra_CLiente,
            "costo_Cant_Pendiente": datos.costo_Cant_Pendiente.toFixed(2),
            "costo_Cant_Total": datos.costo_Cant_Total.toFixed(2),
            "fecha_Creacion": datos.fecha_Creacion.replace('T00:00:00', ''),
            "fecha_Entrega": datos.fecha_Entrega.replace('T00:00:00', ''),
            "OT" : '',
            "Proceso_OT": '',
            "CantPesada" : '',
            "Estado_OT": '',
            "CantPedidaKg_OT" : '',
            "CantPedidaUnd_OT" : '',
            "ExistenciaMayor" : false,
            "Zeus" : 1,
          },
        }
        this.ArrayDocumento[i].data.Cant_Items += 1;

        if (datos.existencias >= datos.cant_Pendiente) {
          dataPedidos.data.ExistenciaMayor = true;
          this.ArrayDocumento[i].data.ExistenciaMayor = true;
          this.ArrayDocumento[i].data.Cant_Items_ExistenciaMayor += 1;
        }

        this.ArrayDocumento[i].data.costo_Cant_Pendiente += datos.costo_Cant_Pendiente;
        this.ArrayDocumento[i].data.costo_Cant_Total += datos.costo_Cant_Total;

        this.sumaCostoPendiente += datos.costo_Cant_Pendiente;
        this.sumaCostoTotal += datos.costo_Cant_Total;

        this.estadosProcesos_OTService.GetOrdenesTrabajo_Pedido(datos.consecutivo).subscribe(datos_orden => {
          for (let i = 0; i < datos_orden.length; i++) {
            if (parseInt(datos.id_Producto) == datos_orden[i].prod_Id) {
              dataPedidos.data.OT = datos_orden[i].estProcOT_OrdenTrabajo;
              if (datos_orden[i].estProcOT_ExtrusionKg > 0) {
                dataPedidos.data.Proceso_OT = `Extrusión ${this.formatonumeros(datos_orden[i].estProcOT_ExtrusionKg.toFixed(2))} Kg`;
                dataPedidos.data.CantPesada = datos_orden[i].estProcOT_ExtrusionKg.toFixed(2);
              }
              if (datos_orden[i].estProcOT_ImpresionKg > 0) {
                dataPedidos.data.Proceso_OT = `Impresión ${this.formatonumeros(datos_orden[i].estProcOT_ImpresionKg.toFixed(2))} Kg`;
                dataPedidos.data.CantPesada = datos_orden[i].estProcOT_ImpresionKg.toFixed(2);
              }
              if (datos_orden[i].estProcOT_RotograbadoKg > 0) {
                dataPedidos.data.Proceso_OT = `Rotograbado ${this.formatonumeros(datos_orden[i].estProcOT_RotograbadoKg.toFixed(2))} Kg`;
                dataPedidos.data.CantPesada = datos_orden[i].estProcOT_RotograbadoKg.toFixed(2);
              }
              if (datos_orden[i].estProcOT_LaminadoKg > 0) {
                dataPedidos.data.Proceso_OT = `Laminado ${this.formatonumeros(datos_orden[i].estProcOT_LaminadoKg.toFixed(2))} Kg`;
                dataPedidos.data.CantPesada = datos_orden[i].estProcOT_LaminadoKg.toFixed(2);
              }
              if (datos_orden[i].estProcOT_CorteKg > 0) {
                dataPedidos.data.Proceso_OT = `Corte - ${this.formatonumeros(datos_orden[i].estProcOT_CorteKg.toFixed(2))} Kg`;
                dataPedidos.data.CantPesada = datos_orden[i].estProcOT_CorteKg.toFixed(2);
              }
              if (datos_orden[i].estProcOT_DobladoKg > 0) {
                dataPedidos.data.Proceso_OT = `Doblado ${this.formatonumeros(datos_orden[i].estProcOT_DobladoKg.toFixed(2))} Kg`;
                dataPedidos.data.CantPesada = datos_orden[i].estProcOT_DobladoKg.toFixed(2);
              }
              if (datos_orden[i].estProcOT_EmpaqueKg > 0) {
                dataPedidos.data.Proceso_OT = `Empaque ${this.formatonumeros(datos_orden[i].estProcOT_EmpaqueKg.toFixed(2))} Kg`;
                dataPedidos.data.CantPesada = datos_orden[i].estProcOT_EmpaqueKg.toFixed(2);
              }
              if (datos_orden[i].estProcOT_SelladoKg > 0) {
                dataPedidos.data.Proceso_OT = `Sellado ${this.formatonumeros(datos_orden[i].estProcOT_SelladoUnd.toFixed(2))} Und - ${this.formatonumeros(datos_orden[i].estProcOT_SelladoKg.toFixed(2))} Kg`;
                dataPedidos.data.CantPesada = datos_orden[i].estProcOT_SelladoUnd.toFixed(2);
              }
              if (datos_orden[i].estProcOT_WiketiadoKg > 0) {
                dataPedidos.data.Proceso_OT = `Wiketiado ${this.formatonumeros(datos_orden[i].estProcOT_WiketiadoUnd.toFixed(2))} Und - ${this.formatonumeros(datos_orden[i].estProcOT_WiketiadoKg.toFixed(2))} Kg`;
                dataPedidos.data.CantPesada = datos_orden[i].estProcOT_WiketiadoUnd.toFixed(2);
              }
              dataPedidos.data.Estado_OT = datos_orden[i].estado_Id;
              dataPedidos.data.CantPedidaKg_OT = datos_orden[i].estProcOT_CantidadPedida;
              dataPedidos.data.CantPedidaUnd_OT = datos_orden[i].estProcOT_CantidadPedidaUnd;
            }
          }
        });

        this.columnas = [
          { header: 'Precio U.', field: 'precioUnidad', type : 'number' },
          { header: 'OC Cliente', field: 'orden_Compra_CLiente'},
          // { header: 'Costo Cant. Pendiente', field: 'costo_Cant_Pendiente', type : 'number'},
          // { header: 'Costo Cant. Total', field: 'costo_Cant_Total', type : 'number' },
          { header: 'Fecha Creación', field: 'fecha_Creacion', type : 'date'},
          { header: 'Fecha Entrega', field: 'fecha_Entrega',  type : 'date'},
        ];
        this.ArrayDocumento[i].children.push(dataPedidos);
        this.ArrayDocumento.sort((a,b) => Number(a.data.consecutivo) - Number(b.data.consecutivo));
        this.ArrayDocumento.sort((a,b) => Number(b.data.ExistenciaMayor) - Number(a.data.ExistenciaMayor));
      }
    }
  }

  // Funcion que va a consultar los pedidos que no han sido cargados a zeus
  consultarPedidos(){
    this.pedidoProductosService.GetPedidosPendientesAgrupados().subscribe(datos_pedidos => {
      for (let i = 0; i < datos_pedidos.length; i++) {
        if (this.ValidarRol == 2){
          if (datos_pedidos[i].usua_Id == this.storage_Id) this.llenarEncabezadoPedidos(datos_pedidos[i]);
        } else if (this.ValidarRol == 1 || this.ValidarRol == 60) this.llenarEncabezadoPedidos(datos_pedidos[i]);
      }
    });
    setTimeout(() => { this.llenarDetallesPedidos(); }, 1000);
  }

  // Funcion que va a llena el encabezado de los pedidos que no han sido enviados a zeus
  llenarEncabezadoPedidos(datos : any){
    let info : any = {
      "data" : {
        "consecutivo": datos.pedExt_Id,
        "cliente": datos.cli_Nombre,
        "producto": '',
        "id_Producto": '',
        "cant_Pedida": '',
        "cant_Pendiente": '',
        "cant_Facturada": '',
        "existencias": '',
        "presentacion": '',
        "estado": datos.estado_Nombre,
        "vendedor": datos.usua_Nombre,
        "precioUnidad" : '',
        "orden_Compra_CLiente": '',
        "costo_Cant_Pendiente": 0,
        "costo_Cant_Total": datos.pedExt_PrecioTotalFinal,
        "fecha_Creacion": datos.pedExt_FechaCreacion.replace('T00:00:00', ''),
        "fecha_Entrega": '',
        "OT" : '',
        "Proceso_OT": '',
        "CantPesada" : '',
        "Estado_OT": '',
        "CantPedidaKg_OT" : '',
        "CantPedidaUnd_OT" : '',
        "ExistenciaMayor" : false,
        "Cant_Items_ExistenciaMayor" : 0,
        "Cant_Items" : 0,
        "Zeus" : 0,
      },
      expanded: true,
      "children" : []
    }
    this.sumaCostoTotal += datos.pedExt_PrecioTotalFinal;
    this.ArrayDocumento.push(info);
  }

  // Funcion que va a llenar los detalles de cada uno de los pedidos que no han sido confirmados
  llenarDetallesPedidos(){
    this.pedidoProductosService.getPedidoPendiente().subscribe(datos_pedidos => {
      for (let i = 0; i < datos_pedidos.length; i++) {
        for (let j = 0; j < this.ArrayDocumento.length; j++) {
          if (datos_pedidos[i].pedExt_Id == this.ArrayDocumento[j].data.consecutivo) {
            let info : any = {
              "data" : {
                "consecutivo": datos_pedidos[i].pedExt_Id,
                "cliente": datos_pedidos[i].cli_Nombre,
                "idProducto": datos_pedidos[i].prod_Id,
                "producto":  datos_pedidos[i].prod_Nombre,
                "cant_Pedida": datos_pedidos[i].pedExtProd_Cantidad,
                "cant_Pendiente": datos_pedidos[i].cant_Pendiente,
                "cant_Facturada": datos_pedidos[i].cant_Facturada,
                "existencias": datos_pedidos[i].existencias,
                "presentacion": datos_pedidos[i].undMed_Id,
                "estado": datos_pedidos[i].estado_Nombre,
                "vendedor": datos_pedidos[i].usua_Nombre,
                "precioUnidad" : this.formatonumeros(datos_pedidos[i].pedExtProd_PrecioUnitario),
                "orden_Compra_CLiente": '',
                "costo_Cant_Pendiente": 0,
                "costo_Cant_Total": (datos_pedidos[i].pedExtProd_Cantidad * datos_pedidos[i].pedExtProd_PrecioUnitario),
                "fecha_Creacion": datos_pedidos[i].pedExt_FechaCreacion.replace('T00:00:00', ''),
                "fecha_Entrega" : datos_pedidos[i].pedExtProd_FechaEntrega.replace('T00:00:00', ''),
                "OT" : '',
                "Proceso_OT": '',
                "CantPesada" : '',
                "Estado_OT": '',
                "CantPedidaKg_OT" : '',
                "CantPedidaUnd_OT" : '',
                "ExistenciaMayor" : false,
                "Zeus" : 1,
                "Cant_Items_ExistenciaMayor" : 0,
                "Cant_Items" : 0,
              }
            }
            if(datos_pedidos[i].undMed_Id == 'Und') datos_pedidos[i].undMed_Id = 'UND';
            if(datos_pedidos[i].undMed_Id == 'Kg') datos_pedidos[i].undMed_Id = 'KLS';
            if(datos_pedidos[i].undMed_Id == 'Paquete') datos_pedidos[i].undMed_Id = 'PAQ';

            this.inventarioZeusService.getExistenciasProductos(datos_pedidos[i].prod_Id.toString(), datos_pedidos[i].undMed_Id).subscribe(dataZeus => {
              for (let index = 0; index < dataZeus.length; index++) {
                info.data.existencias = dataZeus[index].existencias;
              }
            });
            this.ArrayDocumento[j].children.push(info);
            this.ArrayDocumento.sort((a,b) => Number(a.data.consecutivo) - Number(b.data.consecutivo));
          }
        }
      }
    });
  }

  // Funcion que buscará las columnas que se desean colocar
  @Input() get columnasSeleccionada(): any[] {
    return this._columnasSeleccionada;
  }

  // Funcion que colocará las columnas que se deseen
  set columnasSeleccionada(val: any[]) {
    this._columnasSeleccionada = this.columnas.filter(col => val.includes(col));
  }

  // Funcion que permitirá filtrar la información de la tabla
  aplicarfiltro($event, campo : any, valorCampo : string){
    this.tt!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);
    setTimeout(() => {
      if (this.tt.filteredNodes != null) {
        this.sumaCostoPendiente = 0;
        this.sumaCostoTotal = 0;
        for (let i = 0; i < this.tt.filteredNodes.length; i++) {
          this.sumaCostoPendiente += this.tt.filteredNodes[i].data.costo_Cant_Pendiente;
          this.sumaCostoTotal += this.tt.filteredNodes[i].data.costo_Cant_Total;
        }
      } else {
        this.sumaCostoPendiente = 0;
        this.sumaCostoTotal = 0;
        for (let i = 0; i < this.tt._value.length; i++) {
          this.sumaCostoPendiente += this.tt._value[i].data.costo_Cant_Pendiente;
          this.sumaCostoTotal += this.tt._value[i].data.costo_Cant_Total;
        }
      }
    }, 400);
  }

  // Funcion que mostrará un modal con la informacion del pedido seleccionado y en el que se podrá editar el pedido selecionado
  editarPedido(data: any){
    this.modalEditar = true;
    setTimeout(() => {
      this.modalPedidoExterno.limpiarTodosCampos();
      this.modalPedidoExterno.modalMode = true;
      this.pedidoExternoService.GetInfoEditarPedido(data.consecutivo).subscribe(datos_pedido => {
        for (let i = 0; i < datos_pedido.length; i++) {
          this.modalPedidoExterno.FormPedidoExternoClientes.patchValue({
            PedClienteNombre: datos_pedido[i].cliente,
            PedObservacion: datos_pedido[i].observacion,
            PedDescuento : datos_pedido[i].descuento,
            PedIva : datos_pedido[i].iva,
          });
          this.modalPedidoExterno.pedidoEditar = data.consecutivo;
          this.modalPedidoExterno.clienteSeleccionado();
          setTimeout(() => {
            this.modalPedidoExterno.FormPedidoExternoClientes.patchValue({
              ciudad_sede: datos_pedido[i].ciudad,
            });
            this.modalPedidoExterno.llenarDireccionCliente();
          }, 500);
          break;
        }
        for (let i = 0; i < datos_pedido.length; i++) {
          this.modalPedidoExterno.valorTotal = datos_pedido[i].valor_Total;
          this.modalPedidoExterno.iva = datos_pedido[i].iva;
          if (datos_pedido[i].iva > 0) this.modalPedidoExterno.checked = true;
          this.modalPedidoExterno.descuento = datos_pedido[i].descuento;
          this.modalPedidoExterno.ivaDescuento();
          let productoExt : any = {
            Id : datos_pedido[i].id_Producto,
            Nombre : datos_pedido[i].producto,
            Cant : datos_pedido[i].cantidad_Pedida,
            UndCant : datos_pedido[i].presentacion,
            PrecioUnd : datos_pedido[i].precio_Unitario,
            Stock : 0,
            SubTotal : (datos_pedido[i].cantidad_Pedida * datos_pedido[i].precio_Unitario),
            FechaEntrega : datos_pedido[i].fecha_Entrega.replace('T00:00:00', ''),
          }
          this.modalPedidoExterno.ArrayProducto.push(productoExt);
        }
      });
    }, 500);
  }

  //Funcion que va a cargar un modal con la informacion de la orden de trabajo que tiene asignada el pedido
  varOrdenTranajo(data : any){
    if (this.ValidarRol == 1) {
      this.estadosProcesos_OTService.GetOrdenesTrabajo_Pedido(data.consecutivo).subscribe(datos_orden => {
        if (datos_orden.length > 0) {
          this.modalEstadosOrdenes = true;
          setTimeout(() => {
            this.modalEstadosProcesos_OT.modeModal = true;
            this.modalEstadosProcesos_OT.ArrayDocumento = [];
            for (let i = 0; i < datos_orden.length; i++) {
              this.modalEstadosProcesos_OT.llenarArray(datos_orden[i]);
            }
          }, 500);
        } else this.mensajeAdvertencia(`¡No hay orden asociada al pedido ${data.consecutivo}!`);
      }, error => {
        Swal.fire({icon : 'error', title : 'Opps...', showCloseButton: true, html : `<b>¡No se obtuvo información de las ordenes de trabajo asociadas al pedido ${data.consecutivo}!</b><br><span style="color: #f00">${error.message}</span>`});
      });
    }
  }

  // Funcion que va a actualizar la orden de trabajo de un pedido
  cambiarOrden_Pedido(data : any){
    this.estadosProcesos_OTService.GetOrdenesTrabajo_Pedido(data.consecutivo).subscribe(datos_ot => {
      if (datos_ot.length > 0) {
        for (let i = 0; i < datos_ot.length; i++) {
          if (data.OT == datos_ot[i].estProcOT_OrdenTrabajo) {
            let info : any = {
              EstProcOT_OrdenTrabajo : datos_ot[i].estProcOT_OrdenTrabajo,
              EstProcOT_ExtrusionKg : datos_ot[i].estProcOT_ExtrusionKg,
              EstProcOT_ImpresionKg : datos_ot[i].estProcOT_ImpresionKg,
              EstProcOT_RotograbadoKg : datos_ot[i].estProcOT_RotograbadoKg,
              EstProcOT_LaminadoKg : datos_ot[i].estProcOT_LaminadoKg,
              EstProcOT_CorteKg : datos_ot[i].estProcOT_CorteKg ,
              EstProcOT_DobladoKg : datos_ot[i].estProcOT_DobladoKg,
              EstProcOT_SelladoKg : datos_ot[i].estProcOT_SelladoKg,
              EstProcOT_SelladoUnd : datos_ot[i].estProcOT_SelladoUnd,
              EstProcOT_WiketiadoKg : datos_ot[i].estProcOT_WiketiadoKg,
              EstProcOT_WiketiadoUnd : datos_ot[i].estProcOT_WiketiadoUnd,
              EstProcOT_CantProdFacturada : datos_ot[i].estProcOT_CantProdFacturada,
              EstProcOT_CantProdIngresada : datos_ot[i].estProcOT_CantProdIngresada,
              EstProcOT_CantMatPrimaAsignada : datos_ot[i].estProcOT_CantMatPrimaAsignada,
              EstProcOT_CantidadPedida : datos_ot[i].estProcOT_CantidadPedida,
              UndMed_Id : datos_ot[i].undMed_Id,
              Estado_Id : datos_ot[i].estado_Id,
              Falla_Id : datos_ot[i].falla_Id,
              EstProcOT_Observacion : datos_ot[i].estProcOT_Observacion,
              EstProcOT_FechaCreacion : datos_ot[i].estProcOT_FechaCreacion,
              EstProcOT_EmpaqueKg : datos_ot[i].estProcOT_EmpaqueKg,
              Usua_Id : datos_ot[i].usua_Id,
              EstProcOT_FechaFinal : datos_ot[i].estProcOT_FechaFinal,
              EstProcOT_FechaInicio: datos_ot[i].estProcOT_FechaInicio,
              EstProcOT_CantidadPedidaUnd : datos_ot[i].estProcOT_CantidadPedidaUnd,
              EstProcOT_HoraFinal : datos_ot[i].estProcOT_HoraFinal,
              EstProcOT_HoraInicio : datos_ot[i].estProcOT_HoraInicio,
              EstProcOT_DiffDiasInicio_Fin : datos_ot[i].estProcOT_DiffDiasInicio_Fin,
              Cli_Id : datos_ot[i].cli_Id,
              Prod_Id : datos_ot[i].prod_Id,
              EstProcOT_CLiente : datos_ot[i].estProcOT_Cliente,
              EstProcOT_Pedido : null,
            }
            this.estadosProcesos_OTService.srvActualizarPorOT(datos_ot[i].estProcOT_OrdenTrabajo, info).subscribe(datos_otActualizada => {
              Swal.fire({icon: 'success', title: 'Cambio Exitoso', text: `¡Se eliminó la relación del pedido ${data.consecutivo} con la OT ${datos_ot[i].estProcOT_OrdenTrabajo}!`, showCloseButton: true})
            });
          }
        }
      }
    }, error => {
      Swal.fire({icon : 'error', title : 'Opps...', showCloseButton: true, html : `<b>¡No se obtuvo información de las ordenes de trabajo asociadas al pedido ${data.consecutivo}!</b><br><span style="color: #f00">${error.message}</span>`})
    });

    this.estadosProcesos_OTService.srvObtenerListaPorOT(data.OT).subscribe(datos_ot => {
      for (let i = 0; i < datos_ot.length; i++) {
        if(datos_ot[i].EstProcOT_Pedido == null) {
          if (parseInt(data.id_Producto) == datos_ot[i].prod_Id) {
            let info : any = {
              EstProcOT_OrdenTrabajo : datos_ot[i].estProcOT_OrdenTrabajo,
              EstProcOT_ExtrusionKg : datos_ot[i].estProcOT_ExtrusionKg,
              EstProcOT_ImpresionKg : datos_ot[i].estProcOT_ImpresionKg,
              EstProcOT_RotograbadoKg : datos_ot[i].estProcOT_RotograbadoKg,
              EstProcOT_LaminadoKg : datos_ot[i].estProcOT_LaminadoKg,
              EstProcOT_CorteKg : datos_ot[i].estProcOT_CorteKg ,
              EstProcOT_DobladoKg : datos_ot[i].estProcOT_DobladoKg,
              EstProcOT_SelladoKg : datos_ot[i].estProcOT_SelladoKg,
              EstProcOT_SelladoUnd : datos_ot[i].estProcOT_SelladoUnd,
              EstProcOT_WiketiadoKg : datos_ot[i].estProcOT_WiketiadoKg,
              EstProcOT_WiketiadoUnd : datos_ot[i].estProcOT_WiketiadoUnd,
              EstProcOT_CantProdFacturada : datos_ot[i].estProcOT_CantProdFacturada,
              EstProcOT_CantProdIngresada : datos_ot[i].estProcOT_CantProdIngresada,
              EstProcOT_CantMatPrimaAsignada : datos_ot[i].estProcOT_CantMatPrimaAsignada,
              EstProcOT_CantidadPedida : datos_ot[i].estProcOT_CantidadPedida,
              UndMed_Id : datos_ot[i].undMed_Id,
              Estado_Id : datos_ot[i].estado_Id,
              Falla_Id : datos_ot[i].falla_Id,
              EstProcOT_Observacion : datos_ot[i].estProcOT_Observacion,
              EstProcOT_FechaCreacion : datos_ot[i].estProcOT_FechaCreacion,
              EstProcOT_EmpaqueKg : datos_ot[i].estProcOT_EmpaqueKg,
              Usua_Id : datos_ot[i].usua_Id,
              EstProcOT_FechaFinal : datos_ot[i].estProcOT_FechaFinal,
              EstProcOT_FechaInicio: datos_ot[i].estProcOT_FechaInicio,
              EstProcOT_CantidadPedidaUnd : datos_ot[i].estProcOT_CantidadPedidaUnd,
              EstProcOT_HoraFinal : datos_ot[i].estProcOT_HoraFinal,
              EstProcOT_HoraInicio : datos_ot[i].estProcOT_HoraInicio,
              EstProcOT_DiffDiasInicio_Fin : datos_ot[i].estProcOT_DiffDiasInicio_Fin,
              Cli_Id : datos_ot[i].cli_Id,
              Prod_Id : datos_ot[i].prod_Id,
              EstProcOT_CLiente : datos_ot[i].estProcOT_Cliente,
              EstProcOT_Pedido : data.consecutivo,
            }
            this.estadosProcesos_OTService.srvActualizarPorOT(datos_ot[i].estProcOT_OrdenTrabajo, info).subscribe(datos_otActualizada => {
              Swal.fire({icon: 'success', title: 'Cambio Exitoso', text: `¡Se cambió la orden de trabajo asociada al pedido ${data.consecutivo}!`, showCloseButton: true})
            });
          } else Swal.fire({ icon: 'warning', title: 'Advertencia', text: `¡El Producto de la OT ${datos_ot[i].estProcOT_OrdenTrabajo} no coincide con el del pedido ${data.consecutivo}!`});
        } else Swal.fire({ icon: 'warning', title: 'Advertencia', text: `¡La OT ${datos_ot[i].estProcOT_OrdenTrabajo} ya tiene un pedido asignado!`});
      }
    });
    setTimeout(() => { this.consultarPedidos(); }, 1000);
  }

  // Funcion que mostrará un mensaje de confirmación para aceptar un pedido o no
  confirmarActualizacion(item : any){
    Swal.fire({
      icon: 'warning',
      title: 'Advertencia',
      text: 'Está seguro que desea aceptar el pedido?',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      confirmButtonColor: '#53CC48',
    }).then((result) => {
      if (result.isConfirmed) this.aceptarPedido(item);
    });
  }

  /** Aceptar Pedido para luego crearlo en Zeus */
  aceptarPedido(item : any){
    this.pedidoExternoService.srvObtenerListaPorId(item).subscribe(dataPedidos => {
      const info : modelOpedido = {
        PedExt_Id : dataPedidos.pedExt_Id,
        PedExt_Codigo : dataPedidos.pedExt_Codigo,
        PedExt_FechaCreacion : dataPedidos.pedExt_FechaCreacion,
        PedExt_FechaEntrega : dataPedidos.pedExt_FechaEntrega,
        Empresa_Id : dataPedidos.empresa_Id,
        SedeCli_Id : dataPedidos.sedeCli_Id,
        Estado_Id : 26,
        PedExt_Observacion : dataPedidos.pedExt_Observacion,
        PedExt_PrecioTotal: dataPedidos.pedExt_PrecioTotal,
        Usua_Id : dataPedidos.usua_Id,
        PedExt_Descuento : dataPedidos.pedExt_Descuento,
        PedExt_Iva : dataPedidos.pedExt_Iva,
        PedExt_PrecioTotalFinal : dataPedidos.pedExt_PrecioTotalFinal,
        PedExt_HoraCreacion: dataPedidos.pedExt_HoraCreacion,
        Creador_Id : dataPedidos.creador_Id,
      }
      this.pedidoExternoService.srvActualizarPedidosProductos(item, info).subscribe(data_Pedido => {
        this.Confirmacion(`Pedido Nro. ${item} aceptado con exito!`);
        setTimeout(() => { this.consultarPedidosZeus(); }, 100);
        setTimeout(() => { this.consultarPedidos(); }, 100);
      }, error => { this.mensajeError(`No fue posible aceptar el pedido ${item}, por favor, verifique!`); });
    });
  }

  //
  confirmarCancelacion(item : any){
    Swal.fire({
      icon: 'warning',
      title: 'Advertencia',
      text: 'Está seguro que desea cancelar el pedido?',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      confirmButtonColor: '#53CC48',
    }).then((result) => {
      if (result.isConfirmed) this.cancelarPedido(item);
    });
  }

  /** Aceptar Pedido para luego crearlo en Zeus */
  cancelarPedido(item : any){
    this.pedidoExternoService.srvObtenerListaPorId(item).subscribe(dataPedidos => {
      const info : any = {
        PedExt_Id : dataPedidos.pedExt_Id,
        PedExt_Codigo : dataPedidos.pedExt_Codigo,
        PedExt_FechaCreacion : dataPedidos.pedExt_FechaCreacion,
        PedExt_FechaEntrega : dataPedidos.pedExt_FechaEntrega,
        Empresa_Id : dataPedidos.empresa_Id,
        SedeCli_Id : dataPedidos.sedeCli_Id,
        Estado_Id : 4,
        PedExt_Observacion : dataPedidos.pedExt_Observacion,
        PedExt_PrecioTotal: dataPedidos.pedExt_PrecioTotal,
        Usua_Id : dataPedidos.usua_Id,
        PedExt_Descuento : dataPedidos.pedExt_Descuento,
        PedExt_Iva : dataPedidos.pedExt_Iva,
        PedExt_PrecioTotalFinal : dataPedidos.pedExt_PrecioTotalFinal,
        PedExt_HoraCreacion: dataPedidos.pedExt_HoraCreacion,
        Creador_Id : dataPedidos.creador_Id,
      }
      this.pedidoExternoService.srvActualizarPedidosProductos(item, info).subscribe(data_Pedido => {
        this.Confirmacion(`Pedido Nro. ${item} cancelado con exito!`);
        setTimeout(() => { this.consultarPedidosZeus(); }, 100);
        setTimeout(() => { this.consultarPedidos(); }, 100);
      }, error => { this.mensajeError(`No fue posible cancelar el pedido ${item}, por favor, verifique!`); });
    });
  }

  // Funcion que creará un archivo de excel con base de lo que esté en la tabla
  exportarExcel(){
    if (this.ArrayDocumento.length == 0) this.mensajeAdvertencia('Debe haber al menos un pedido en la tabla.');
    else {
      let datos : any =[];
      setTimeout(() => {
        if(this.tt.filteredNodes != null) {
          for (let index = 0; index < this.tt.filteredNodes.length; index++) {
            this.llenarArrayExcel(this.tt.filteredNodes[index].children, datos);
          }
        } else {
          for (let index = 0; index < this.tt._value.length; index++) {
            this.llenarArrayExcel(this.tt._value[index].children, datos);
          }
        }
      }, 300);

      setTimeout(() => {
        const title = `Reporte de Pedidos Zeus - ${this.today}`;
        const header = ["N° Pedido", "Cliente", "Item", "Cant. Pedida", "Pendiente", "Facturada", "Stock", "Und", "Precio Und", "Estado", "Vendedor", "OC", "Costo Cant. Pendiente", "Costo Cant. Total", "Fecha Creación ", "Fecha Entrega", "OT", "Proceso Actual", "Estado OT"]

        let workbook = new Workbook();
        const imageId1 = workbook.addImage({
          base64:  logoParaPdf,
          extension: 'png',
        });
        let worksheet = workbook.addWorksheet(`Reporte de Pedidos Zeus - ${this.today}`);
        worksheet.addImage(imageId1, 'A1:A3');
        let titleRow = worksheet.addRow([title]);
        titleRow.font = { name: 'Calibri', family: 4, size: 16, underline: 'double', bold: true };
        worksheet.addRow([]);
        worksheet.addRow([]);
        let headerRow = worksheet.addRow(header);
        headerRow.eachCell((cell, number) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'eeeeee' } }
          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
        });
        worksheet.mergeCells('A1:S3');
        worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };

        datos.forEach(d => {
          let row = worksheet.addRow(d);
          let consecutivo = row.getCell(1);
          let fecha1 = row.getCell(15);
          let fecha2 = row.getCell(16);
          let medida = row.getCell(8);
          let Pedida = row.getCell(4);
          let Pendiente = row.getCell(5);
          let Facturada = row.getCell(6);
          let stock = row.getCell(7);
          let precioUnd  = row.getCell(9);
          let ccPendiente = row.getCell(13);
          let ccTotal = row.getCell(14);
          let OT = row.getCell(17);
          let estadoPedido = row.getCell(10);
          let estadoOT = row.getCell(19);
          let colorEstadoOT;
          let colorEstadoPedido;

          consecutivo.alignment = { horizontal : 'center' }
          fecha1.alignment = { horizontal : 'center' }
          fecha2.alignment = { horizontal : 'center' }
          medida.alignment = { horizontal : 'center' }
          OT.alignment = {horizontal : 'center'}
          Pedida.numFmt  = '""#,##0.00;[Red]\-""#,##0.00';
          /** Pendiente */
          row.getCell(5).numFmt  = '""#,##0.00;[Red]\-""#,##0.00';
          Pendiente.font = {color : {'argb' : 'FF7F71'}, 'name': 'Calibri', 'bold' : true, 'size': 11};

          Facturada.numFmt  = '""#,##0.00;[Red]\-""#,##0.00';
          stock.numFmt  = '""#,##0.00;[Red]\-""#,##0.00';
          precioUnd.numFmt  = '""#,##0.00;[Red]\-""#,##0.00';
          ccPendiente.numFmt  = '""#,##0.00;[Red]\-""#,##0.00';
          ccTotal.numFmt  = '""#,##0.00;[Red]\-""#,##0.00';

          /** OT con Estado */
          if(d[18] == 17) { colorEstadoOT = '8AFC9B';  estadoOT.fill = { type : 'pattern', pattern: 'solid', fgColor: { argb: colorEstadoOT }, }; estadoOT.value = 'Terminada'; }
          else if(d[18] == 18) {colorEstadoOT = '53CC48'; estadoOT.fill = { type : 'pattern', pattern: 'solid', fgColor: { argb: colorEstadoOT }, }; estadoOT.value = 'Cerrada';}
          else if(d[18] == 3) {colorEstadoOT = 'FF7878'; estadoOT.fill = { type : 'pattern', pattern: 'solid', fgColor: { argb: colorEstadoOT }, }; estadoOT.value = 'Anulada';}
          else if(d[18] == 14) {colorEstadoOT = '83D3FF'; estadoOT.fill = { type : 'pattern', pattern: 'solid', fgColor: { argb: colorEstadoOT }, }; estadoOT.value = 'Asignada';}
          else if(d[18] == 16) {colorEstadoOT = 'F3FC20;'; estadoOT.fill = { type : 'pattern', pattern: 'solid', fgColor: { argb: colorEstadoOT }, }; estadoOT.value = 'En Proceso';}
          else if(d[18] == 15) {colorEstadoOT = 'F6D45D'; estadoOT.fill = { type : 'pattern', pattern: 'solid', fgColor: { argb: colorEstadoOT }, }; estadoOT.value = 'Abierta';}
          else colorEstadoOT = 'FFFFFF';

          /** Estado Pedido*/
          if (d[9] == 'Pendiente') colorEstadoPedido = 'FF7F71'
          else if (d[9] == 'Parcialmente Satisfecho') colorEstadoPedido = 'FFF55D';
          estadoPedido.fill = {
            type : 'pattern',
            pattern: 'solid',
            fgColor: { argb: colorEstadoPedido },
          }

          worksheet.getColumn(1).width = 12;
          worksheet.getColumn(2).width = 50;
          worksheet.getColumn(3).width = 45;
          worksheet.getColumn(4).width = 15;
          worksheet.getColumn(5).width = 15;
          worksheet.getColumn(6).width = 15;
          worksheet.getColumn(7).width = 15;
          worksheet.getColumn(8).width = 10;
          worksheet.getColumn(9).width = 15;
          worksheet.getColumn(10).width = 25;
          worksheet.getColumn(11).width = 40;
          worksheet.getColumn(12).width = 20;
          worksheet.getColumn(13).width = 20;
          worksheet.getColumn(14).width = 20;
          worksheet.getColumn(15).width = 15;
          worksheet.getColumn(16).width = 15;
          worksheet.getColumn(17).width = 15;
          worksheet.getColumn(18).width = 30;
          worksheet.getColumn(19).width = 20;
        });

        setTimeout(() => {
          workbook.xlsx.writeBuffer().then((data) => {
            let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            fs.saveAs(blob, `Reporte de Pedidos Zeus - ${this.today}.xlsx`);
          });
          this.cargando = false;
        }, 1000);
      }, 1500);
      setTimeout(() => {  this.Confirmacion('¡Archivo de Excel generado exitosamente!'); }, 3100);
    }
  }

  // Funcion que llenará el archivo de excel con los datos de la tabla
  llenarArrayExcel(datos : any, arrayDatos : any){
    this.cargando = true;
    for (let i = 0; i < datos.length; i++) {
      const datos1 : any = [
        datos[i].data.consecutivo,
        datos[i].data.cliente,
        datos[i].data.producto,
        datos[i].data.cant_Pedida,
        datos[i].data.cant_Pendiente,
        datos[i].data.cant_Facturada,
        datos[i].data.existencias,
        datos[i].data.presentacion,
        datos[i].data.precioUnidad,
        datos[i].data.estado,
        datos[i].data.vendedor,
        datos[i].data.orden_Compra_CLiente,
        datos[i].data.costo_Cant_Pendiente,
        datos[i].data.costo_Cant_Total,
        datos[i].data.fecha_Creacion.replace('T00:00:00', ''),
        datos[i].data.fecha_Entrega.replace('T00:00:00', ''),
        datos[i].data.OT,
        datos[i].data.Proceso_OT,
        datos[i].data.Estado_OT,
      ];
      arrayDatos.push(datos1);
    }
  }

  /** Llenar array al momento de seleccionar VER PDF */
  llenarArrayPdf(item : any){
    this.arrayPedidosIndividuales = [];
    this.costoCantidadPendiente = 0;
    this.costoCantidadTotal = 0;

    this.inventarioZeusService.getPedidosXConsecutivo(item.consecutivo).subscribe(dataPedidos => {
      for (let i = 0; i < dataPedidos.length; i++) {
        const info : any = {
          Nombre : dataPedidos[i].producto,
          Cantidad : this.formatonumeros(dataPedidos[i].cant_Pedida),
          Und : dataPedidos[i].presentacion,
          Precio : this.formatonumeros(dataPedidos[i].precioUnidad),
          SubTotal : this.formatonumeros(dataPedidos[i].costo_Cant_Total),
          "Fecha Entrega" : dataPedidos[i].fecha_Entrega.replace('T00:00:00', ''),
        }
        this.arrayPedidosIndividuales.push(info);
        this.costoCantidadTotal += dataPedidos[i].costo_Cant_Total;
        this.costoCantidadPendiente += dataPedidos[i].costo_Cant_Pendiente;
      }
    });
  }

  /** Mostrar el PDF que contiene la información detallada del pedido. */
  mostrarPedidoPdf(item : any){
    this.llenarArrayPdf(item);
    let usuario : string = this.storage.get('Nombre');
    this.inventarioZeusService.getPedidosXConsecutivo(item.consecutivo).subscribe(dataPedidos => {
      for (let index = 0; index < dataPedidos.length; index++) {
        const infoPdf : any = {
          info: { title: `Pedido Nro.  ${item.consecutivo}` },
          pageSize: { width: 630, height: 760 },
          footer: function(currentPage : any, pageCount : any) {
            return [
              '\n',
              {
                columns: [
                  { text: `Reporte generado por ${usuario}`, alignment: ' left', fontSize: 8, margin: [30, 0, 0, 0] },
                  { text: `Fecha Expedición Documento ${moment().format('YYYY-MM-DD')} - ${moment().format('H:mm:ss')}`, alignment: 'right', fontSize: 8 },
                  { text: `${currentPage.toString()} de ${pageCount}`, alignment: 'right', fontSize: 8, margin: [0, 0, 30, 0] },
                ]
              }
            ]
          },
          content : [
            {
              columns: [
                { image : logoParaPdf, width : 100, height : 80 },
                { text: `Pedido Zeus ${item.consecutivo}`, alignment: 'right', style: 'titulo', margin: [0, 30, 0, 0], }
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
                    { border: [false, false, false, false], text: `Comercial`  },
                    { border: [false, false, false, true], text: `${dataPedidos[index].vendedor}`, fontSize: 8 },
                    { border: [false, false, false, false], text: `Fecha de pedido` },
                    { border: [false, false, false, true], text: `${dataPedidos[index].fecha_Creacion.replace('T00:00:00', '')}` },
                  ],
                  [
                    { border: [false, false, false, false], text: `Código` },
                    { border: [false, false, false, true], text: `` },
                    {},
                    {}
                  ],
                ]
              },
              layout: { defaultBorder: false, },
              fontSize: 9,
            },
            '\n',
            { text: `\n Información detallada del cliente \n \n`, alignment: 'center', style: 'header' },
            {
              style: 'tablaCliente',
              table: {
                widths: [170, 170, 170],
                style: 'header',
                body: [
                  [ `NIT Cliente: ${dataPedidos[index].id_Cliente}`,  `Nombre: ${dataPedidos[index].cliente}`, `Ciudad: ${dataPedidos[index].ciudad}`, ],
                  [ `OC: ${dataPedidos[index].orden_Compra_CLiente}`, ``, `` ]
                ]
              },
              layout: 'lightHorizontalLines',
              fontSize: 9,
            },
            '\n \n',
            { text: `\n\n Información detallada de producto(s) pedido(s) \n `, alignment: 'center', style: 'header' },
            this.table(this.arrayPedidosIndividuales, ['Nombre', 'Cantidad', 'Und', 'Fecha Entrega', 'Precio', 'SubTotal']),
            {
              style: 'tablaTotales',
              table: {
                widths: [270, 145, 98],
                style: 'header',
                body: [
                  [
                    '',
                    { border: [true, false, true, true], text: `Total Pedido` },
                    { border: [false, false, true, true], text: `$${this.formatonumeros(this.costoCantidadTotal.toFixed(2))}` },
                  ],
                ]
              },
              layout: { defaultBorder: false, },
              fontSize: 8,
            },
          ],
          styles: {
            header: { fontSize: 10, bold: true },
            texto: { fontSize: 8, },
            titulo: { fontSize: 20, bold: true },
            subtitulo: { fontSize: 14, bold: true }
          }
        }
        const pdf = pdfMake.createPdf(infoPdf);
        pdf.open();
        this.cargando = false;
        this.Confirmacion(`¡PDF generado con éxito!`);
        break;
      }
    });
  }

  // Funcion que consultará los productos del ultimo pedido creado
  productosPedido(pedido : number){
    this.productosPedidos = [];
    this.pedidoExternoService.GetCrearPdfUltPedido(pedido).subscribe(datos_pedido => {
      for (let i = 0; i < datos_pedido.length; i++) {
        let info : any = {
          Id : datos_pedido[i].producto_Id,
          Nombre : datos_pedido[i].producto,
          Cantidad : this.formatonumeros(datos_pedido[i].cantidad),
          Und : datos_pedido[i].presentacion,
          Precio : this.formatonumeros(datos_pedido[i].precio_Unitario),
          SubTotal : this.formatonumeros(datos_pedido[i].subTotal_Producto),
          "Fecha Entrega" : datos_pedido[i].fecha_Entrega.replace('T00:00:00', ''),
        }
        this.productosPedidos.push(info);
        this.productosPedidos.sort((a,b) => a.Nombre.localeCompare(b.Nombre));
      }
      setTimeout(() => { this.crearpdf(pedido); }, 1000);
    });
  }

  // Fucnion para que crear ub pdf apenas se realiza el pedido de productos
  crearpdf(pedido : number){
    let usuario = this.storage_Nombre;
    this.pedidoExternoService.GetCrearPdfUltPedido(pedido).subscribe(datos_pedido => {
      for (let i = 0; i < datos_pedido.length; i++) {
        const pdfDefinicion : any = {
          info: { title: `Pedido N° ${datos_pedido[i].id_Pedido}` },
          pageSize: { width: 630, height: 760 },
          footer: function(currentPage : any, pageCount : any) {
            return [
              '\n',
              {
                columns: [
                  { text: `Reporte generado por ${usuario}`, alignment: ' left', fontSize: 8, margin: [30, 0, 0, 0] },
                  { text: `Fecha Expedición Documento ${moment().format('YYYY-MM-DD')} - ${moment().format('H:mm:ss')}`, alignment: 'right', fontSize: 8 },
                  { text: `${currentPage.toString()} de ${pageCount}`, alignment: 'right', fontSize: 8, margin: [0, 0, 30, 0] },
                ]
              }
            ]
          },
          content : [
            {
              columns: [
                { image : logoParaPdf, width : 100, height : 80 },
                { text: `Pedido ${datos_pedido[i].id_Pedido}`, alignment: 'right', style: 'titulo', margin: [0, 30, 0, 0], }
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
                    { border: [false, false, false, false], text: `Comercial`  },
                    { border: [false, false, false, true], text: `${datos_pedido[i].vendedor_Id} - ${datos_pedido[i].vendedor}`, fontSize: 8 },
                    { border: [false, false, false, false], text: `Fecha de pedido` },
                    { border: [false, false, false, true], text: `${datos_pedido[i].fechaCreacion.replace('T00:00:00', '')}` },
                  ],
                  [
                    { border: [false, false, false, false], text: `Estado del pedido` },
                    { border: [false, false, false, true], text: `${datos_pedido[i].estado}` },
                    { border: [false, false, false, false], text: `Código` },
                    { border: [false, false, false, true], text: `${datos_pedido[i].consecutivo}` },
                  ],
                ]
              },
              layout: { defaultBorder: false, },
              fontSize: 9,
            },
            '\n \n',
            { text: `\n Información detallada del cliente \n \n`, alignment: 'center', style: 'header' },
            {
              style: 'tablaCliente',
              table: {
                widths: [170, 170, 170],
                style: 'header',
                body: [
                  [ `ID: ${datos_pedido[i].cliente_Id}`,  `Tipo de ID: ${datos_pedido[i].tipo_Id}`, `Tipo de Cliente: ${datos_pedido[i].tipo_Cliente}` ],
                  [ `Nombre: ${datos_pedido[i].cliente}`, `Telefono: ${datos_pedido[i].telefono_Cliente}`, `Ciudad: ${datos_pedido[i].ciudad_Cliente}` ],
                  [ `Dirección: ${datos_pedido[i].direccion_Cliente}`, `Codigo Postal: ${datos_pedido[i].codPostal_Cliente}`, `E-mail: ${datos_pedido[i].correo_Cliente}` ]
                ]
              },
              layout: 'lightHorizontalLines',
              fontSize: 9,
            },
            { text: `\n\n Información detallada de producto(s) pedido(s) \n `, alignment: 'center', style: 'header' },
            this.table2(this.productosPedidos, ['Id', 'Nombre', 'Cantidad', 'Und', 'Fecha Entrega', 'Precio', 'SubTotal']),
            {
              style: 'tablaTotales',
              table: {
                widths: [275, '*', 98],
                style: 'header',
                body: [
                  [
                    '',
                    { border: [true, false, true, true], text: `SUBTOTAL` },
                    { border: [false, false, true, true], text: `$${this.formatonumeros(datos_pedido[i].precio_Total)}` },
                  ],
                  [
                    '',
                    { border: [true, false, true, true], text: `DESCUENTO (%)` },
                    { border: [false, false, true, true], text: `${datos_pedido[i].descuento}%` },
                  ],
                  [
                    '',
                    { border: [true, false, true, true], text: `SUBTOTAL DESCUENTO` },
                    { border: [false, false, true, true], text: `$${this.formatonumeros((datos_pedido[i].precio_Total * datos_pedido[i].descuento) / 100)}` },
                  ],
                  [
                    '',
                    { border: [true, false, true, true], text: `IVA (%)` },
                    { border: [false, false, true, true], text: `${this.formatonumeros(datos_pedido[i].iva)}%` },
                  ],
                  [
                    '',
                    { border: [true, false, true, true], text: `SUBTOTAL IVA` },
                    { border: [false, false, true, true], text: `$${this.formatonumeros(((datos_pedido[i].precio_Total * datos_pedido[i].iva) / 100))}` },
                  ],
                  [
                    '',
                    { border: [true, false, true, true], text: `TOTAL` },
                    { border: [false, false, true, true], text: `$${this.formatonumeros(datos_pedido[i].precio_Final)}` },
                  ]
                ]
              },
              layout: { defaultBorder: false, },
              fontSize: 8,
            },
            { text: `\n \nObservación sobre el pedido: \n ${datos_pedido[i].observacion}\n`, style: 'header', }
          ],
          styles: {
            header: { fontSize: 10, bold: true },
            general: { fontSize: 8, bold: true },
            titulo: { fontSize: 20, bold: true }
          }
        }
        const pdf = pdfMake.createPdf(pdfDefinicion);
        pdf.open();
        this.Confirmacion(`¡PDF generado con éxito!`);
        break;
      }
    });

  }

  // Funcion que genera la tabla donde se mostrará la información de los productos pedidos
  table2(data, columns) {
    return {
      table: {
        headerRows: 1,
        widths: [40, 177, 40, 30, 51, 50, 98],
        body: this.buildTableBody(data, columns),
      },
      fontSize: 8,
      layout: {
        fillColor: function (rowIndex, node, columnIndex) {
          return (rowIndex == 0) ? '#CCCCCC' : null;
        }
      }
    };
  }

  // Funcion que se encagará de llenar la tabla del pd
  buildTableBody(data, columns) {
    var body = [];
    body.push(columns);
    data.forEach(function(row) {
      var dataRow = [];
      columns.forEach(function(column) {
        dataRow.push(row[column]);
      });
      body.push(dataRow);
    });

    return body;
  }

  // Funcion que genera la tabla donde se mostrará la información
  table(data, columns) {
    return {
      table: {
        headerRows: 1,
        widths: [177, 50, 40, 61, 60, 98],
        body: this.buildTableBody(data, columns)
      },
      fontSize: 8,
      layout: {
        fillColor: function (rowIndex, node, columnIndex) {
          return (rowIndex == 0) ? '#CCCCCC' : null;
        }
      }
    };
  }

  // Funcion que mostrará un mensaje de error
  mensajeError(mensaje : string) {
    Swal.fire({ icon: 'error', title: 'Confirmación', html: mensaje, confirmButtonColor: '#d83542', confirmButtonText: 'Aceptar', });
  }

  // Funcion que mostrará un mensaje de advertencia
  mensajeAdvertencia(mensaje : string) {
    Swal.fire({ icon: 'warning', title: 'Advertencia', html: mensaje, confirmButtonColor: '#ffc107', confirmButtonText: 'Aceptar', });
  }

  // Funcion que mostrará un mensaje de confirmación
  Confirmacion(mensaje : string) {
    Swal.fire({ icon: 'success', title: 'Confirmación', html: mensaje, confirmButtonColor: '#53CC48', confirmButtonText: 'Aceptar', });
  }
}
