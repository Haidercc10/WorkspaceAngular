import { Component, Inject, OnInit } from '@angular/core';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { DetallesDevolucionesProductosService } from 'src/app/Servicios/DetallesDevolucionRollosFacturados/DetallesDevolucionesProductos.service';
import { DetallesEntradaRollosService } from 'src/app/Servicios/DetallesEntradasRollosDespacho/DetallesEntradaRollos.service';
import { DetallesAsignacionProductosFacturaService } from 'src/app/Servicios/DetallesFacturacionRollos/DetallesAsignacionProductosFactura.service';
import { DevolucionesProductosService } from 'src/app/Servicios/DevolucionesRollosFacturados/DevolucionesProductos.service';
import { ExistenciasProductosService } from 'src/app/Servicios/ExistenciasProductos/existencias-productos.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-Devoluciones_Productos_Rollos',
  templateUrl: './Devoluciones_Productos_Rollos.component.html',
  styleUrls: ['./Devoluciones_Productos_Rollos.component.css']
})
export class Devoluciones_Productos_RollosComponent implements OnInit {

  cargando : boolean = false; //Variable para validar que salga o no la imagen de carga
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  rollos : any [] = []; //Variable que almacenará los difrentes rollos que se asignacron a la factura
  facturaConsultada : string; //Variable que almacenará el consecutivo de la factura buscada
  observacionFactura : string = ''; //Variable que almacenará la observcación añadida de la devolución de factura
  rollosInsertar : any [] = []; //Variable que va a amacenar los diferentes rollos que se van a insertar
  grupoProductos : any [] = []; //Variable que guardará de manera descriminada a cada producto

  constructor(@Inject(SESSION_STORAGE) private storage: WebStorageService,
                private dtAsgProdFactura : DetallesAsignacionProductosFacturaService,
                  private rollosService : DetallesEntradaRollosService,
                    private dtDevolucionService : DetallesDevolucionesProductosService,
                      private devolcuionesService : DevolucionesProductosService,
                        private ExistenciasProdService : ExistenciasProductosService,) {
  }

  ngOnInit() {
    this.lecturaStorage();
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

  //Funcion que traerá los diferentes rollos que se hicieron en la orden de trabajo
  consultarFactura(){
    this.rollos = [];
    this.cargando = true;
    this.dtAsgProdFactura.srvObtenerListaPorCodigoFactura(this.facturaConsultada).subscribe(datos_factura => {
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
          this.rollos.push(info);
        }
      }
    });
    setTimeout(() => {
      if (this.rollos.length <= 0) Swal.fire(`La factura ${this.facturaConsultada} no se encuentra disponible para devoluciones`);
      this.cargando = false;
    }, 1200);
  }

  //Funcion que va a agregar Productos en la tabla
  cargarProducto(item : any){
    let medida : number = window.scrollY;
    this.cargando = true;
    this.rollosInsertar.push(item);
    for (let i = 0; i < this.rollos.length; i++) {
      if (item.Id == this.rollos[i].Id) this.rollos.splice(i,1);
    }
    this.GrupoProductos();
    setTimeout(() => { window.scroll(0, medida) }, 5);
  }

  // Funcion que se va a encargar de quitar rollos de la tabla inferior
  quitarRollo(item : any){
    let medida : number = window.scrollY;
    this.cargando = true;
    this.rollos.push(item);
    for (let i = 0; i < this.rollosInsertar.length; i++) {
      if (this.rollosInsertar[i].Id == item.Id) this.rollosInsertar.splice(i,1);
    }
    this.GrupoProductos();
    setTimeout(() => { window.scroll(0, medida) }, 5);
  }

  // Funcion que permitirá ver el total de lo escogido para cada producto
  GrupoProductos(){
    this.cargando = false;
    let producto : any = [];
    this.grupoProductos = [];
    for (let i = 0; i < this.rollosInsertar.length; i++) {
      if (!producto.includes(this.rollosInsertar[i].IdProducto)) {
        let cantidad : number = 0;
        let cantRollo : number = 0;
        for (let j = 0; j < this.rollosInsertar.length; j++) {
          if (this.rollosInsertar[i].IdProducto == this.rollosInsertar[j].IdProducto) {
            cantidad += this.rollosInsertar[j].Cantidad;
            cantRollo += 1;
          }
        }
        producto.push(this.rollosInsertar[i].IdProducto);
        let info : any = {
          Id : this.rollosInsertar[i].IdProducto,
          Nombre : this.rollosInsertar[i].Producto,
          Cantidad : this.formatonumeros(cantidad.toFixed(2)),
          Cantidad2 : cantidad.toFixed(4),
          Rollos: this.formatonumeros(cantRollo.toFixed(2)),
          Presentacion : this.rollosInsertar[i].Presentacion,
        }
        this.grupoProductos.push(info);
      }
    }
  }

  // Funcion para crear devolucion de rollos de productos
  creardevolucion(){
    if (this.rollosInsertar.length == 0) Swal.fire("¡Debe tener minimo un rollo seleccionado!");
    else {
      this.cargando = false;
      let info : any = {
        FacturaVta_Id : this.facturaConsultada,
        Cli_Id : 1,
        DevProdFact_Fecha : this.today,
        DevProdFact_Observacion : this.observacionFactura,
        TipoDevProdFact_Id : 1,
        Usua_Id : this.storage_Id,
        DevProdFact_Hora : moment().format('H:mm:ss'),
      }
      this.devolcuionesService.srvGuardar(info).subscribe(datos_devolucion => {
        this.devolcuionesService.srvObteneUltimoId().subscribe(datos_devolucion => { this.crearDtDevolucion(datos_devolucion.devProdFact_Id); }, error => {
          Swal.fire({
            icon: 'error',
            title: 'Opps...',
            html: `<b>Error al ultimo Id de devolución</b><br>` + `<spam style="color: #f00">${error.message}</spam>`,
            showCloseButton: true,
          });
          this.cargando = false;
        });
      }, error => {
        Swal.fire({
          icon: 'error',
          title: 'Opps...',
          html: `<b>Error al crear la devolución de rollos</b><br>` + `<spam style="color: #f00">${error.message}</spam>`,
          showCloseButton: true,
        });
        this.cargando = false;
      });
    }
  }

  // Funcion que va a subir los detalles de cada rollo de la devolucion
  crearDtDevolucion(idDevolucion : number){
    for (let i = 0; i < this.rollosInsertar.length; i++) {
      let info : any = {
        DevProdFact_Id : idDevolucion,
        Prod_Id : this.rollosInsertar[i].IdProducto,
        DtDevProdFact_Cantidad : this.rollosInsertar[i].Cantidad,
        UndMed_Id : this.rollosInsertar[i].Presentacion,
        Rollo_Id : this.rollosInsertar[i].Id,
      }
      this.dtDevolucionService.srvGuardar(info).subscribe(datos_devolcuion => {  }, error => {
        Swal.fire({
          icon: 'error',
          title: 'Opps...',
          html: `<b>Error al crear la devolución del rollo ${info.Rollo_Id}</b><br>` + `<spam style="color: #f00">${error.message}</spam>`,
          showCloseButton: true,
        });
        this.cargando = false;
      });
    }
    setTimeout(() => { this.actualizarRollos(); }, 2000);
  }

  // Funcion para mover el inventario de los rollos y cambiar su estado
  actualizarRollos(){
    for (let i = 0; i < this.rollosInsertar.length; i++) {
      this.rollosService.srvObtenerVerificarRollo(this.rollosInsertar[i].Id).subscribe(datos_rollos => {
        for (let j = 0; j < datos_rollos.length; j++) {
          if(this.rollosInsertar[i].Presentacion == 'Paquete') {
            let info : any = {
              DtEntRolloProd_Codigo : datos_rollos[j].dtEntRolloProd_Codigo,
              EntRolloProd_Id : datos_rollos[j].entRolloProd_Id,
              Rollo_Id : datos_rollos[j].rollo_Id,
              DtEntRolloProd_Cantidad : datos_rollos[j].dtEntRolloProd_Cantidad,
              undMed_Rollo : datos_rollos[j].undMed_Rollo,
              Estado_Id : 24,
              dtEntRolloProd_OT : datos_rollos[j].dtEntRolloProd_OT,
              Prod_Id : datos_rollos[j].prod_Id,
              UndMed_Prod : datos_rollos[j].undMed_Prod,
              Prod_CantPaquetesRestantes : (datos_rollos[j].prod_CantPaquetesRestantes + this.rollosInsertar[i].Cantidad),
              Prod_CantBolsasPaquete : datos_rollos[j].prod_CantBolsasPaquete,
              Prod_CantBolsasBulto : datos_rollos[j].prod_CantBolsasBulto,
              Prod_CantBolsasRestates : datos_rollos[j].prod_CantBolsasRestates + (this.rollosInsertar[i].Cantidad * datos_rollos[j].prod_CantBolsasPaquete),
              Prod_CantBolsasFacturadas : datos_rollos[j].prod_CantBolsasRestates - (this.rollosInsertar[i].Cantidad * datos_rollos[j].prod_CantBolsasPaquete),
              Proceso_Id : datos_rollos[j].proceso_Id,
            }
            this.rollosService.srvActualizar(datos_rollos[j].dtEntRolloProd_Codigo, info).subscribe(datos_rolloActuializado => { }, error => {
              Swal.fire({
                icon: 'error',
                title: 'Opps...',
                html: `<b>Error, no se pudo actualizar el rollo ${info.Rollo_Id}</b><br>` + `<spam style="color: #f00">${error.message}</spam>`,
                showCloseButton: true,
              });
              this.cargando = false;
            });
          } else {
            let info : any = {
              DtEntRolloProd_Codigo : datos_rollos[j].dtEntRolloProd_Codigo,
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
              Prod_CantBolsasRestates : (datos_rollos[j].prod_CantBolsasRestates + this.rollosInsertar[i].Cantidad),
              Prod_CantBolsasFacturadas : (this.rollosInsertar[i].Cantidad - datos_rollos[j].prod_CantBolsasFacturadas),
              Proceso_Id : datos_rollos[j].proceso_Id,
            }
            this.rollosService.srvActualizar(datos_rollos[j].dtEntRolloProd_Codigo, info).subscribe(datos_rolloActuializado => { }, error => {
              Swal.fire({
                icon: 'error',
                title: 'Opps...',
                html: `<b>Error, no se pudo actualizar el rollo ${info.Rollo_Id}</b><br>` + `<spam style="color: #f00">${error.message}</spam>`,
                showCloseButton: true,
              });
              this.cargando = false;
            });
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
            Swal.fire({
              icon: 'success',
              title: 'Opps...',
              html: `<b>Error al mover el inventario de productos</b><br>`,
              showCloseButton: true,
            });
            this.limpiarCampos();
          }, error => {
            Swal.fire({
              icon: 'error',
              title: 'Opps...',
              html: `<b>Error al mover el inventario de productos</b><br>` + `<spam style="color: #f00">${error.message}</spam>`,
              showCloseButton: true,
            });
            this.cargando = false;
          });
        }
      });
    }
  }

  // Funcion para limpiar los campos de la vista
  limpiarCampos(){
    this.rollos = [];
    this.rollosInsertar = [];
    this.cargando = false;
    this.facturaConsultada = '';
    this.observacionFactura = '';
  }
}
