import { Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Table } from 'primeng/table';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { InventarioZeusService } from 'src/app/Servicios/InventarioZeus/inventario-zeus.service';
import { RolesService } from 'src/app/Servicios/Roles/roles.service';

@Component({
  selector: 'app-ReportePedidos_Zeus',
  templateUrl: './ReportePedidos_Zeus.component.html',
  styleUrls: ['./ReportePedidos_Zeus.component.css']
})
export class ReportePedidos_ZeusComponent implements OnInit {

  @ViewChild('dt') dt: Table | undefined;
  cargando : boolean = false;
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente

  first = 0;
  rows = 10;
  ArrayDocumento = []; //Varibale que almacenará la información que se mostrará en la tabla de vista
  _columnasSeleccionada : any [] = [];
  columnas : any [] = [];
  formFiltros !: FormGroup;

  public arrayClientes: any =[];
  public arrayItems: any =[];
  public arrayVendedores: any =[];

  public titlePendiente : string = 'Estado que indica que no se ha realizado entrega de ninguno de los items del pedido.';
  public titleParcial : string = 'Estado que indica que se ha realizado entrega de al menos uno de los items del pedido.';


  constructor(@Inject(SESSION_STORAGE) private storage: WebStorageService,
                private rolService : RolesService,
                 private inventarioZeusService : InventarioZeusService,
                  private FormBuild : FormBuilder) {

   this.InicializarFormulario();
  }

  ngOnInit() {
    this.lecturaStorage();
    this.consultarPedidos();
  }

  InicializarFormulario(){
    this.formFiltros = this.FormBuild.group({
      IdVendedor : [null],
      Vendedor: [null],
      IdCliente: [null],
      Cliente: [null],
      IdItem: [null],
      Item: [null],
      Fecha1: [null],
      Fecha2 : [null],
    })
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

  //
  consultarPedidos(){
    this.cargando = true;
    this.inventarioZeusService.GetPedidos().subscribe(datos_pedidos => {
      for (let i = 0; i < datos_pedidos.length; i++) {
        //this.columnasNoMostradas();
        this.llenarTabla(datos_pedidos[i]);
        this.ArrayDocumento.sort((a,b) => Number(a.consecutivo) - Number(b.consecutivo));
      }
    });
    setTimeout(() => { this.cargando = false; }, 2000);
  }

  @Input() get columnasSeleccionada(): any[] {
    return this._columnasSeleccionada;
  }

  set columnasSeleccionada(val: any[]) {
    this._columnasSeleccionada = this.columnas.filter(col => val.includes(col));
  }

  // Funcion que permitirá filtrar la información de la tabla
  aplicarfiltro($event, campo : any, valorCampo : string){
    this.dt!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);
  }

  /** Mostrar en la tabla las columnas elegidas en el Input-Select que se encuentra en la parte superior de la tabla. */
  columnasNoMostradas(){
    this.columnas = [
      { header: 'Precio U.', field: 'precioUnidad', type : 'number' },
      { header: 'OC Cliente', field: 'orden_Compra_CLiente'},
      { header: 'Costo Cant. Pendiente', field: 'costo_Cant_Pendiente', type : 'number'},
      { header: 'Costo Cant. Total', field: 'costo_Cant_Total', type : 'number' },
      { header: 'Fecha Creación', field: 'fecha_Creacion', type : 'date'},
      { header: 'Fecha Entrega', field: 'fecha_Entrega',  type : 'date'},
    ];
  }

  llenarTabla(datos : any){
    if(datos.fecha_Creacion == null) datos.fecha_Creacion = datos.fecha_Creacion
    else datos.fecha_Creacion = datos.fecha_Creacion.replace('T00:00:00', '');

    if(datos.fecha_Entrega == null) datos.fecha_Entrega = datos.fecha_Entrega
    else datos.fecha_Entrega = datos.fecha_Entrega.replace('T00:00:00', '');

    const dataPedidos : any = {
      consecutivo: datos.consecutivo,
      cliente: datos.cliente,
      producto: datos.producto,
      cant_Pedida: datos.cant_Pedida,
      cant_Pendiente: datos.cant_Pendiente,
      cant_Facturada: datos.cant_Facturada,
      existencias: datos.existencias,
      presentacion: datos.presentacion,
      estado: datos.estado,
      vendedor: datos.vendedor,
      precioUnidad : this.formatonumeros(datos.precioUnidad),
      orden_Compra_CLiente: datos.orden_Compra_CLiente,
      costo_Cant_Pendiente: this.formatonumeros(datos.costo_Cant_Pendiente),
      costo_Cant_Total: this.formatonumeros(datos.costo_Cant_Total),
      fecha_Creacion: datos.fecha_Creacion,
      fecha_Entrega: datos.fecha_Entrega,
    }

    this.columnas = [
      { header: 'Precio U.', field: 'precioUnidad', type : 'number' },
      { header: 'OC Cliente', field: 'orden_Compra_CLiente'},
      { header: 'Costo Cant. Pendiente', field: 'costo_Cant_Pendiente', type : 'number'},
      { header: 'Costo Cant. Total', field: 'costo_Cant_Total', type : 'number' },
      { header: 'Fecha Creación', field: 'fecha_Creacion', type : 'date'},
      { header: 'Fecha Entrega', field: 'fecha_Entrega',  type : 'date'},
    ];

    this.ArrayDocumento.push(dataPedidos);
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = '$1,';
    return number.toString().replace(exp,rep);
  }

  exportarExcel(){

  }

}
