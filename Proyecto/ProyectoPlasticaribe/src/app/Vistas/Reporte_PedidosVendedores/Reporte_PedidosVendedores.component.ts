import { Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { TreeTable } from 'primeng/treetable';
import { AppComponent } from 'src/app/app.component';
import { PedidoProductosService } from 'src/app/Servicios/DetallesPedidoProductos/pedidoProductos.service';
import { RolesService } from 'src/app/Servicios/Roles/roles.service';

@Component({
  selector: 'app-Reporte_PedidosVendedores',
  templateUrl: './Reporte_PedidosVendedores.component.html',
  styleUrls: ['./Reporte_PedidosVendedores.component.css']
})

export class Reporte_PedidosVendedoresComponent implements OnInit {
  @ViewChild('tt') tt: TreeTable | undefined;

  public load : boolean = false;
  public modalEditar : boolean = false;
  public ArrayDocumento : any = [];
  public _columnasSeleccionada: any[] = [];
  public columnas: any [] = [];
  public titlePendiente : string;
  public titleParcial : string;
  public sumaCostoPendiente: number = 0;
  public sumaCostoTotal: number = 0;
  public storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  public storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  public storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  public ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual


  constructor(@Inject(SESSION_STORAGE) private storage: WebStorageService,
                private rolService : RolesService,
                  private appComponent : AppComponent,
                    private servicioDtlPedidos : PedidoProductosService) { }

  ngOnInit() {
    this.lecturaStorage();
    this.cargarPedidosPendientes();
  }

  /**Leer storage para validar su rol y mostrar el usuario. */
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

  @Input() get columnasSeleccionada(): any[] {
    return this._columnasSeleccionada;
  }

  set columnasSeleccionada(val: any[]) {
    this._columnasSeleccionada = this.columnas.filter(col => val.includes(col));
  }

  // Funcion que va a cargar el encabezado de los pedidos
  pedidoAgrupado(){
    this.load = true;
    this.ArrayDocumento = [];
    this.servicioDtlPedidos.GetPedidosPendientesAgrupados().subscribe(datos_pedidos => {
      for (let i = 0; i < datos_pedidos.length; i++) {
        let info : any = {
          "data" : {
            "consecutivo": datos_pedidos[i].pedExt_Id,
            "fechaCreacion" : datos_pedidos[i].pedExt_FechaCreacion.replace('T00:00:00', ''),
            "fechaEntrega" : datos_pedidos[i].pedExt_FechaEntrega.replace('T00:00:00', ''),
            "idCliente": datos_pedidos[i].cli_Id,
            "cliente": datos_pedidos[i].cli_Nombre,
            "idProducto ": '',
            "producto":  '',
            "cant_Pedida": '',
            "existencias": '',
            "precio": '',
            "presentacion": '',
            "idVendedor": datos_pedidos[i].usua_Id,
            "vendedor": datos_pedidos[i].usua_Nombre,
            "idEstado": datos_pedidos[i].estado_Id,
            "estado": datos_pedidos[i].estado_Nombre,
            "costo_Cant_Total": (datos_pedidos[i].pedExt_PrecioTotalFinal),
          },
          expanded: true,
          "children" : []
        }
        this.ArrayDocumento.push(info);
      }
    });
  }

  // Funcion que va a llenar los datos de los productos de cada pedido
  pedidosDetallados(){
    this.servicioDtlPedidos.getPedidoPendiente().subscribe(datos_pedidos => {
      for (let i = 0; i < datos_pedidos.length; i++) {
        for (let j = 0; j < this.ArrayDocumento.length; j++) {
          if (datos_pedidos[i].pedExt_Id == this.ArrayDocumento[j].data.consecutivo) {
            let info : any = {
              "data" : {
                "consecutivo": datos_pedidos[i].pedExt_Id,
                "fechaCreacion" : datos_pedidos[i].pedExt_FechaCreacion.replace('T00:00:00', ''),
                "fechaEntrega" : datos_pedidos[i].pedExt_FechaEntrega.replace('T00:00:00', ''),
                "idCliente": datos_pedidos[i].cli_Id,
                "cliente": datos_pedidos[i].cli_Nombre,
                "idProducto ": datos_pedidos[i].prod_Id,
                "producto":  datos_pedidos[i].prod_Nombre,
                "cant_Pedida": datos_pedidos[i].pedExtProd_Cantidad,
                "existencias": datos_pedidos[i].exProd_Cantidad,
                "precio": datos_pedidos[i].pedExtProd_PrecioUnitario,
                "presentacion": datos_pedidos[i].undMed_Id,
                "idVendedor": datos_pedidos[i].usua_Id,
                "vendedor": datos_pedidos[i].usua_Nombre,
                "idEstado": datos_pedidos[i].estado_Id,
                "estado": datos_pedidos[i].estado_Nombre,
                "costo_Cant_Total": (datos_pedidos[i].pedExtProd_Cantidad * datos_pedidos[i].exProd_PrecioVenta),
              }
            }
            this.ArrayDocumento[j].children.push(info);
          }
        }
      }
    });
  }

  /**  */
  cargarPedidosPendientes(){
    this.load = true;
    this.ArrayDocumento = [];
    this.pedidoAgrupado();
    setTimeout(() => { this.pedidosDetallados(); }, 1500);
    setTimeout(() => { this.load = false; }, 2000);
  }

  /** */
  infoPedidos(datos : any){
    const infoPedido : any = {
      "data" : {
        "consecutivo ": datos.pedExt_Id,
        "fechaCreacion" : datos.pedExt_FechaCreacion.replace('T00:00:00', ''),
        "fechaEntrega" : datos.pedExt_FechaEntrega.replace('T00:00:00', ''),
        "idCliente": datos.cli_Id,
        "cliente": datos.cli_Nombre,
        "idProducto ": datos.prod_Id,
        "producto":  datos.prod_Nombre,
        "cant_Pedida": datos.pedExtProd_Cantidad,
        "existencias": datos.exProd_Cantidad,
        "precio": datos.pedExtProd_PrecioUnitario,
        "presentacion": datos.undMed_Id,
        "idVendedor": datos.usua_Id,
        "vendedor": datos.usua_Nombre,
        "idEstado": datos.estado_Id,
        "estado": datos.estado_Nombre,
        "costo_Cant_Total": (datos.pedExtProd_Cantidad * datos.exProd_PrecioVenta),
      },
      "children" : []
    }
    this.ArrayDocumento.push(infoPedido);
  }

  /** */
  aplicarfiltro($event, campo : any, valorCampo : string){
    this.tt!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);
  }

  /** */
  editarPedido(item: any){
    this.modalEditar = true;
    this.servicioDtlPedidos.getPedidoPendientexId(item.consecutivo).subscribe(dataPedido => {
      for (let index = 0; index < dataPedido.length; index++) {

      }
    });
  }

  /** */
  cambiarOrden_Pedido(item : any){

  }
  /** */
  aceptarPedido(item : any){

  }

  /** */
  mostrarPedidoPdf(item : any){

  }
  /** */
  exportarExcel(){

  }
}
