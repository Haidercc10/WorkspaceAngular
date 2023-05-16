import { Component, Inject, OnInit } from '@angular/core';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { MessageService } from 'primeng/api';
import { DetallesDevolucionesProductosService } from 'src/app/Servicios/DetallesDevolucionRollosFacturados/DetallesDevolucionesProductos.service';
import { DetallesEntradaRollosService } from 'src/app/Servicios/DetallesEntradasRollosDespacho/DetallesEntradaRollos.service';
import { DetallesAsignacionProductosFacturaService } from 'src/app/Servicios/DetallesFacturacionRollos/DetallesAsignacionProductosFactura.service';
import { DevolucionesProductosService } from 'src/app/Servicios/DevolucionesRollosFacturados/DevolucionesProductos.service';
import { ExistenciasProductosService } from 'src/app/Servicios/ExistenciasProductos/existencias-productos.service';
import { AppComponent } from 'src/app/app.component';
import Swal from 'sweetalert2';
import { defaultStepOptions, stepsDevolverRolloDespacho as defaultSteps } from 'src/app/data';
import { ShepherdService } from 'angular-shepherd';

@Component({
  selector: 'app-Devoluciones_Productos_Rollos',
  templateUrl: './Devoluciones_Productos_Rollos.component.html',
  styleUrls: ['./Devoluciones_Productos_Rollos.component.css']
})
export class Devoluciones_Productos_RollosComponent implements OnInit {

  cargando : boolean = false; //Variable para validar que salga la animacion de carga
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  rollosDisponibles : any [] = []; //Variable que guardará la informacion de los rollos estan disponibles para facturar
  rollosSeleccionados : any [] = []; //Variable que guardará la informacion de los rollos que se seleccionaron para facturar
  facturaConsultada : string; //Variable que almacenará el consecutivo de la factura buscada
  observacionFactura : string = ''; //Variable que almacenará la observcación añadida de la devolución de factura
  grupoProductos : any [] = []; //Variable que guardará de manera descriminada a cada producto
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro

  constructor(private AppComponent : AppComponent,
                private messageService: MessageService,
                  private dtAsgProdFacturaService : DetallesAsignacionProductosFacturaService,
                    private rollosService : DetallesEntradaRollosService,
                      private dtDevolucionService : DetallesDevolucionesProductosService,
                        private devolcuionesService : DevolucionesProductosService,
                          private ExistenciasProdService : ExistenciasProductosService,
                            private shepherdService: ShepherdService){

    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
  }

  ngOnInit(): void {
    this.lecturaStorage();
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
    this.cargando = false;
    this.rollosDisponibles = [];
    this.rollosSeleccionados = [];
  }

  //Funcion que traerá los diferentes rollos que se hicieron en la orden de trabajo
  consultarFactura(){
    this.rollosDisponibles = [];
    this.cargando = true;
    this.dtAsgProdFacturaService.srvObtenerListaPorCodigoFactura(this.facturaConsultada).subscribe(datos_factura => {
      for (let i = 0; i < datos_factura.length; i++) {
        if (datos_factura[i].estado_Id != 24) {
          this.cargando = false;
          let info : any = {
            Factura : this.facturaConsultada,
            Id : datos_factura[i].rollo_Id,
            IdCliente : datos_factura[i].cli_Id,
            Cliente : datos_factura[i].cli_Nombre,
            IdProducto : datos_factura[i].prod_Id,
            Producto : datos_factura[i].prod_Nombre,
            Cantidad : datos_factura[i].dtAsigProdFV_Cantidad,
            Presentacion : datos_factura[i].undMed_Id,
          }
          this.rollosDisponibles.push(info);
        }
      }
    });
    setTimeout(() => {
      if (this.rollosDisponibles.length <= 0) this.mensajeAdvertencia(`¡La factura ${this.facturaConsultada} no se encuentra disponible para devoluciones!`);
      this.cargando = false;
    }, 1200);
  }

  // Funcion que va a validar cuando se seleccionen todos los rollos
  seleccionTodos_Rollos(){
    this.cargando = true;
    this.rollosDisponibles = [];
    this.rollosSeleccionados.sort((a,b) => Number(a.Id) - Number(b.Id) );
    this.GrupoProductos();
  }

  // Funcion que va a validar cuando se seleccione 1 rollo
  seleccionRollo(data : any){
    this.cargando = true;
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
    this.rollosDisponibles.sort((a,b) => Number(a.Id) - Number(b.Id) );
    this.GrupoProductos();
  }

  // Funcion que va a validar cuando se deseleccione 1 rollo
  quitarRollo(data : any){
    this.cargando = true;
    for (let i = 0; i < this.rollosSeleccionados.length; i++) {
      if (this.rollosSeleccionados[i].Id === data.Id) this.rollosSeleccionados.splice(i, 1);
    }
    this.rollosDisponibles.sort((a,b) => Number(a.Id) - Number(b.Id) );
    this.GrupoProductos();
  }

  // Funcion que permitirá ver el total de lo escogido para cada producto
  GrupoProductos(){
    this.cargando = false;
    let producto : any = [];
    this.grupoProductos = [];
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
          Cantidad2 : cantidad.toFixed(4),
          Rollos: this.formatonumeros(cantRollo.toFixed(2)),
          Presentacion : this.rollosSeleccionados[i].Presentacion,
        }
        this.grupoProductos.push(info);
      }
    }
  }

  // Funcion para crear devolucion de rollos de productos
  creardevolucion(){
    if (this.rollosSeleccionados.length == 0) Swal.fire("¡Debe tener minimo un rollo seleccionado!");
    else {
      this.cargando = true;
      let info : any = {
        FacturaVta_Id : this.facturaConsultada,
        Cli_Id : 1,
        DevProdFact_Fecha : this.today,
        DevProdFact_Observacion : this.observacionFactura,
        TipoDevProdFact_Id : 1,
        Usua_Id : this.storage_Id,
        DevProdFact_Hora : moment().format('H:mm:ss'),
      }
      this.devolcuionesService.srvGuardar(info).subscribe(datos_devolucion => { this.crearDtDevolucion(datos_devolucion.devProdFact_Id);
      }, error => { this.mensajeError(`Opps...`, `¡Error al crear la devolución de rollos!`); });
    }
  }

  // Funcion que va a subir los detalles de cada rollo de la devolucion
  crearDtDevolucion(idDevolucion : number){
    for (let i = 0; i < this.rollosSeleccionados.length; i++) {
      let info : any = {
        DevProdFact_Id : idDevolucion,
        Prod_Id : this.rollosSeleccionados[i].IdProducto,
        DtDevProdFact_Cantidad : this.rollosSeleccionados[i].Cantidad,
        UndMed_Id : this.rollosSeleccionados[i].Presentacion,
        Rollo_Id : this.rollosSeleccionados[i].Id,
      }
      this.dtDevolucionService.srvGuardar(info).subscribe(datos_devolcuion => {
      }, error => { this.mensajeError(`Opps...`, `¡Error al crear la devolución de rollos!`); });
    }
    setTimeout(() => { this.actualizarRollos(); }, 2000);
  }

  // Funcion para mover el inventario de los rollos y cambiar su estado
  actualizarRollos(){
    for (let i = 0; i < this.rollosSeleccionados.length; i++) {
      this.rollosService.srvObtenerVerificarRollo(this.rollosSeleccionados[i].Id).subscribe(datos_rollos => {
        for (let j = 0; j < datos_rollos.length; j++) {
          if(this.rollosSeleccionados[i].Presentacion == 'Paquete') {
            let info : any = {
              Codigo : datos_rollos[j].cdigo,
              EntRolloProd_Id : datos_rollos[j].entRolloProd_Id,
              Rollo_Id : datos_rollos[j].rollo_Id,
              DtEntRolloProd_Cantidad : datos_rollos[j].dtEntRolloProd_Cantidad,
              undMed_Rollo : datos_rollos[j].undMed_Rollo,
              Estado_Id : 24,
              dtEntRolloProd_OT : datos_rollos[j].dtEntRolloProd_OT,
              Prod_Id : datos_rollos[j].prod_Id,
              UndMed_Prod : datos_rollos[j].undMed_Prod,
              Prod_CantPaquetesRestantes : (datos_rollos[j].prod_CantPaquetesRestantes + this.rollosSeleccionados[i].Cantidad),
              Prod_CantBolsasPaquete : datos_rollos[j].prod_CantBolsasPaquete,
              Prod_CantBolsasBulto : datos_rollos[j].prod_CantBolsasBulto,
              Prod_CantBolsasRestates : datos_rollos[j].prod_CantBolsasRestates + (this.rollosSeleccionados[i].Cantidad * datos_rollos[j].prod_CantBolsasPaquete),
              Prod_CantBolsasFacturadas : datos_rollos[j].prod_CantBolsasRestates - (this.rollosSeleccionados[i].Cantidad * datos_rollos[j].prod_CantBolsasPaquete),
              Proceso_Id : datos_rollos[j].proceso_Id,
            }
            this.rollosService.srvActualizar(datos_rollos[j].codigo, info).subscribe(datos_rolloActuializado => {
            }, error => { this.mensajeError(`¡Opps...!`, `¡Error, no se pudo actualizar el rollo ${info.Rollo_Id}!`); });
          } else {
            let info : any = {
              Codigo : datos_rollos[j].codigo,
              EntRolloProd_Id : datos_rollos[j].entRolloProd_Id,
              Rollo_Id : datos_rollos[j].rollo_Id,
              DtEntRolloProd_Cantidad : datos_rollos[j].dtEntRolloProd_Cantidad,
              undMed_Rollo : datos_rollos[j].undMed_Rollo,
              Estado_Id : 24,
              dtEntRolloProd_OT : datos_rollos[j].dtEntRolloProd_OT,
              Prod_Id : datos_rollos[j].prod_Id,
              UndMed_Prod : datos_rollos[j].undMed_Prod,
              Prod_CantPaquetesRestantes : datos_rollos[j].prod_CantPaquetesRestantes,
              Prod_CantBolsasPaquete : datos_rollos[j].prod_CantBolsasPaquete,
              Prod_CantBolsasBulto : datos_rollos[j].prod_CantBolsasBulto,
              Prod_CantBolsasRestates : (datos_rollos[j].prod_CantBolsasRestates + this.rollosSeleccionados[i].Cantidad),
              Prod_CantBolsasFacturadas : (this.rollosSeleccionados[i].Cantidad - datos_rollos[j].prod_CantBolsasFacturadas),
              Proceso_Id : datos_rollos[j].proceso_Id,
            }
            this.rollosService.srvActualizar(datos_rollos[j].codigo, info).subscribe(datos_rolloActuializado => {
            }, error => { this.mensajeError(`¡Opps...!`, `¡Error, no se pudo actualizar el rollo ${info.Rollo_Id}!`); });
          }
        }
      });
    }
    setTimeout(() => { this.moverInventarioProductos(); }, 2000);
  }

  // Funcion que va a mover el inventario de los productos
  moverInventarioProductos(){
    for (let i = 0; i < this.grupoProductos.length; i++) {
      this.ExistenciasProdService.srvObtenerListaPorIdProductoPresentacion(this.grupoProductos[i].Id, this.grupoProductos[i].Presentacion).subscribe(datos_productos => {
        for (let j = 0; j < datos_productos.length; j++) {
          const info : any = {
            Prod_Id: datos_productos[j].prod_Id,
            exProd_Id : datos_productos[j].exProd_Id,
            ExProd_Cantidad: (datos_productos[j].exProd_Cantidad + parseFloat(this.grupoProductos[i].Cantidad2)),
            UndMed_Id: datos_productos[j].undMed_Id,
            TpBod_Id: datos_productos[j].tpBod_Id,
            ExProd_Precio: datos_productos[j].exProd_Precio,
            ExProd_PrecioExistencia: (datos_productos[j].exProd_Cantidad + parseFloat(this.grupoProductos[i].Cantidad2)) * datos_productos[j].exProd_PrecioVenta,
            ExProd_PrecioSinInflacion: datos_productos[j].exProd_PrecioSinInflacion,
            TpMoneda_Id: datos_productos[j].tpMoneda_Id,
            ExProd_PrecioVenta: datos_productos[j].ExProd_PrecioVenta,
            ExProd_CantMinima : datos_productos[j].ExProd_CantMinima,
            ExProd_Fecha : datos_productos[j].exProd_Fecha,
            ExProd_Hora: datos_productos[j].exProd_Hora,
          }
          this.ExistenciasProdService.srvActualizar(datos_productos[j].exProd_Id, info).subscribe(datos_existenciaActualizada => {
            this.mensajeConfirmacion(`¡Devolución Exitosa!`,`¡Se ha creado la devolución de manera satisfactoria!`);
            this.limpiarCampos();
          }, error => { this.mensajeError(`¡Opps...!`, `¡Error al mover el inventario de productos!`) });
        }
      });
    }
  }

  // Funcion que devolverá un mensaje de satisfactorio
  mensajeConfirmacion(titulo : string, mensaje : any) {
    this.messageService.add({severity:'success', summary: titulo, detail: mensaje, life: 2000});
    this.cargando = false;
  }

  // Funcion que va a devolver un mensaje de error
  mensajeError(titulo : string, mensaje : any) {
    this.messageService.add({severity:'error', summary: titulo, detail: mensaje, life: 5000});
    this.cargando = false;
  }

  // Funcion que va a devolver un mensaje de advertencia
  mensajeAdvertencia(mensaje : any) {
    this.messageService.add({severity:'warn', summary: '¡Advertencia!', detail: mensaje, life: 1500});
    this.cargando = false;
  }
}
