import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { DetallesAsignacionProductosFacturaService } from 'src/app/Servicios/DetallesAsignacionProductosFactura.service';
import { DetallesDevolucionesProductosService } from 'src/app/Servicios/DetallesDevolucionesProductos.service';
import { DetallesEntradaRollosService } from 'src/app/Servicios/DetallesEntradaRollos.service';
import { DevolucionesProductosService } from 'src/app/Servicios/DevolucionesProductos.service';
import { ExistenciasProductosService } from 'src/app/Servicios/existencias-productos.service';
import { RolesService } from 'src/app/Servicios/roles.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-Devoluciones_Productos_Rollos',
  templateUrl: './Devoluciones_Productos_Rollos.component.html',
  styleUrls: ['./Devoluciones_Productos_Rollos.component.css']
})
export class Devoluciones_Productos_RollosComponent implements OnInit {

  public FormConsultarFactura !: FormGroup; //formulario para consultar una factura y ver los rollos que tiene asignados

  cargando : boolean = true; //Variable para validar que salga o no la imagen de carga
  today : any = new Date(); //Variable que se usará para llenar la fecha actual
  hora : any = moment().format("H:mm:ss"); //Variable que almacenará la hora
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  rollos : any [] = []; //Variable que almacenará los difrentes rollos que se hicieron en la orden de trabajo
  rollosInsertar : any [] = []; //Variable que va a amacenar los diferentes rollos que se van a insertar
  validarRollo : any [] = []; //Variable para validará que el rollo no esté en la tabla
  idCliente : number = 0; //Variable que va a almacenar el id del cliente
  idFactura : number; //variable que va a almacenar el id de la factura que se está consultando
  idProducto : any = 0; //Variable que va a almacenar el id del producto que fue hecho en la ot consultada
  presentacionProducto : string = ''; //Variable que almacenará la presentacion del producto de la orden de trabajo consultada
  grupoProductos : any [] = []; //Variable que guardará de manera descriminada a cada producto

  constructor(private frmBuilderPedExterno : FormBuilder,
                private rolService : RolesService,
                  @Inject(SESSION_STORAGE) private storage: WebStorageService,
                    private dtAsgProdFactura : DetallesAsignacionProductosFacturaService,
                      private rollosService : DetallesEntradaRollosService,
                        private dtDevolucionService : DetallesDevolucionesProductosService,
                          private devolcuionesService : DevolucionesProductosService,
                            private ExistenciasProdService : ExistenciasProductosService,) {

    this.FormConsultarFactura = this.frmBuilderPedExterno.group({
      Fact_Id: [''],
      Rollo_Id : [''],
      Cliente : [''],
      Observacion : [''],
    });
  }

  ngOnInit() {
    this.fecha();
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

  //Funcion que colocará la fecha actual
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
    this.FormConsultarFactura.setValue({
      Fact_Id: '',
      Rollo_Id : '',
      Cliente : '',
      Observacion : '',
    });
    this.rollos = [];
    this.rollosInsertar = [];
    this.validarRollo = [];
    this.cargando = true;
    // window.location.href = "./devolucion-rollos-productos";
  }

  //Funcion que traerá los diferentes rollos que se hicieron en la orden de trabajo
  consultarFactura(){
    this.rollos = [];
    this.cargando = false;
    let factura : string = this.FormConsultarFactura.value.Fact_Id;
    this.dtAsgProdFactura.srvObtenerListaPorCodigoFactura(factura.toUpperCase()).subscribe(datos_factura => {
      for (let i = 0; i < datos_factura.length; i++) {
        if (datos_factura[i].estado_Id == 21) {
          this.cargando = true;
          let info : any = {
            Factura : factura.toUpperCase(),
            Id : datos_factura[i].rollo_Id,
            IdCliente : datos_factura[i].cli_Id,
            Cliente : datos_factura[i].cli_Nombre,
            IdProducto : datos_factura[i].prod_Id,
            Producto : datos_factura[i].prod_Nombre,
            Cantidad : datos_factura[i].dtAsigProdFV_Cantidad,
            Presentacion : datos_factura[i].undMed_Id,
          }
          this.rollos.push(info);
          this.idCliente = datos_factura[i].cli_Id;
          this.idFactura = datos_factura[i].facturaVta_Id;
          this.FormConsultarFactura.setValue({
            Fact_Id: factura.toUpperCase(),
            Rollo_Id : this.FormConsultarFactura.value.Rollo_Id,
            Cliente : datos_factura[i].cli_Nombre,
            Observacion : this.FormConsultarFactura.value.Observacion,
          });
        }
      }
    });
    setTimeout(() => {
      if (this.rollos.length <= 0) Swal.fire(`La factura ${factura} ya devolvió todos los rollos`);
      this.cargando = true;
    }, 5000);
  }

  // Funcion que traerá la informacion del rollo que se esta consultando
  consultarRollo(){
    this.rollos = [];
    let rollo : number = this.FormConsultarFactura.value.Rollo_Id;
    this.dtDevolucionService.srvObtenerListaPorRollo(rollo).subscribe(datos_rollos => {
      for (let i = 0; i < datos_rollos.length; i++) {
        if (datos_rollos[i].estado_Id == 21) {
          let info : any = {
            Factura : datos_rollos[i].facturaVta_Id,
            Id : datos_rollos[i].rollo_Id,
            IdCliente : datos_rollos[i].cli_Id,
            Cliente : datos_rollos[i].cli_Nombre,
            IdProducto : datos_rollos[i].prod_Id,
            Producto : datos_rollos[i].prod_Nombre,
            Cantidad : datos_rollos[i].dtAsigProdFV_Cantidad,
            Presentacion : datos_rollos[i].undMed_Id,
          }
          this.rollos.push(info);
          this.idCliente = datos_rollos[i].cli_Id;
          this.idFactura = datos_rollos[i].facturaVta_Id;
          this.FormConsultarFactura.setValue({
            Fact_Id: this.FormConsultarFactura.value.Fact_Id,
            Rollo_Id : rollo,
            Cliente : datos_rollos[i].cli_Nombre,
            Observacion : this.FormConsultarFactura.value.Observacion,
          });
        }
      }
    });
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
      if (item.Id == this.rollos[i].Id) this.rollos.splice(i,1);
    }
    setTimeout(() => { this.GrupoProductos(); }, 500);
  }

  // Funcion que se va a encargar de quitar rollos de la tabla inferior
  quitarRollo(item : any){
    let info : any = {
      Id : item.Id,
      IdProducto : item.IdProducto,
      Producto : item.Producto,
      Cantidad : item.Cantidad,
      Presentacion : item.Presentacion,
    }
    this.rollos.push(info);
    for (let i = 0; i < this.rollosInsertar.length; i++) {
      if (this.rollosInsertar[i].Id == item.Id) this.rollosInsertar.splice(i,1);
    }
    for (let i = 0; i < this.validarRollo.length; i++) {
      if (this.validarRollo[i] == item.Id) this.validarRollo.splice(i,1);
    }
    setTimeout(() => { this.GrupoProductos(); }, 500);
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
        FacturaVta_Id : this.FormConsultarFactura.value.Fact_Id,
        Cli_Id : 1,
        DevProdFact_Fecha : this.today,
        DevProdFact_Observacion : this.FormConsultarFactura.value.Observacion,
        TipoDevProdFact_Id : 1,
        Usua_Id : this.storage_Id,
        DevProd_Hora : this.hora,
      }
      this.devolcuionesService.srvGuardar(info).subscribe(datos_devolucion => {
        this.devolcuionesService.srvObteneUltimoId().subscribe(datos_devolucion => {
          this.crearDtDevolucion(datos_devolucion.devProdFact_Id);
        });
      }, error => {
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
          icon: 'error',
          title: '¡Error al crear la devolución de los rollos!'
        });
        this.cargando = true;
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
          icon: 'error',
          title: '¡Error al crear la devolución de los rollos!'
        });
        this.cargando = true;
      });
    }
    setTimeout(() => { this.actualizarRollos(); }, 2000);
  }

  // Funcion para mover el inventario de los rollos y cambiar su estado
  actualizarRollos(){
    if (this.rollosInsertar.length != 0) {
      for (let i = 0; i < this.rollosInsertar.length; i++) {
        this.rollosService.srvObtenerVerificarRollo(this.rollosInsertar[i].Id).subscribe(datos_rollos => {
          for (let j = 0; j < datos_rollos.length; j++) {
            if(this.rollosInsertar[i].Presentacion == 'Paquete') {
              if (datos_rollos[j].prod_CantPaquetesRestantes != (this.rollosInsertar[i].CantUndRestantes / datos_rollos[j].prod_CantBolsasPaquete)) {
                let info : any = {
                  DtEntRolloProd_Codigo : datos_rollos[j].dtEntRolloProd_Codigo,
                  EntRolloProd_Id : datos_rollos[j].entRolloProd_Id,
                  Rollo_Id : datos_rollos[j].rollo_Id,
                  DtEntRolloProd_Cantidad : datos_rollos[j].dtEntRolloProd_Cantidad,
                  undMed_Rollo : datos_rollos[j].undMed_Rollo,
                  Estado_Id : 19,
                  dtEntRolloProd_OT : datos_rollos[j].dtEntRolloProd_OT,
                  Prod_Id : datos_rollos[j].prod_Id,
                  UndMed_Prod : datos_rollos[j].undMed_Prod,
                  Prod_CantPaquetesRestantes : (datos_rollos[j].dtEntRolloProd_Cantidad + (this.rollosInsertar[i].CantUndRestantes / datos_rollos[j].prod_CantBolsasPaquete)),
                  Prod_CantBolsasPaquete : datos_rollos[j].prod_CantBolsasPaquete,
                  Prod_CantBolsasBulto : datos_rollos[j].prod_CantBolsasBulto,
                  Prod_CantBolsasRestates : (datos_rollos[j].prod_CantBolsasRestates + this.rollosInsertar[i].CantUndRestantes),
                  Prod_CantBolsasFacturadas : (this.rollosInsertar[i].CantUndRestantes - datos_rollos[j].prod_CantBolsasFacturadas),
                }
                this.rollosService.srvActualizar(datos_rollos[j].dtEntRolloProd_Codigo, info).subscribe(datos_rolloActuializado => { });
              } else if (datos_rollos[j].prod_CantPaquetesRestantes == (this.rollosInsertar[i].CantUndRestantes / datos_rollos[j].prod_CantBolsasPaquete)) {
                let info : any = {
                  DtEntRolloProd_Codigo : datos_rollos[j].dtEntRolloProd_Codigo,
                  EntRolloProd_Id : datos_rollos[j].entRolloProd_Id,
                  Rollo_Id : datos_rollos[j].rollo_Id,
                  DtEntRolloProd_Cantidad : datos_rollos[j].dtEntRolloProd_Cantidad,
                  undMed_Rollo : datos_rollos[j].undMed_Rollo,
                  Estado_Id : 19,
                  dtEntRolloProd_OT : datos_rollos[j].dtEntRolloProd_OT,
                  Prod_Id : datos_rollos[j].prod_Id,
                  UndMed_Prod : datos_rollos[j].undMed_Prod,
                  Prod_CantPaquetesRestantes : (datos_rollos[j].dtEntRolloProd_Cantidad + (this.rollosInsertar[i].CantUndRestantes / datos_rollos[j].prod_CantBolsasPaquete)),
                  Prod_CantBolsasPaquete : datos_rollos[j].prod_CantBolsasPaquete,
                  Prod_CantBolsasBulto : datos_rollos[j].prod_CantBolsasBulto,
                  Prod_CantBolsasRestates : (datos_rollos[j].prod_CantBolsasRestates + this.rollosInsertar[i].CantUndRestantes),
                  Prod_CantBolsasFacturadas : (this.rollosInsertar[i].CantUndRestantes - datos_rollos[j].prod_CantBolsasFacturadas),
                }
                this.rollosService.srvActualizar(datos_rollos[j].dtEntRolloProd_Codigo, info).subscribe(datos_rolloActuializado => { });
              }
            } else {
              let info : any = {
                DtEntRolloProd_Codigo : datos_rollos[j].dtEntRolloProd_Codigo,
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
                Prod_CantBolsasRestates : (datos_rollos[j].prod_CantBolsasRestates + this.rollosInsertar[i].CantUndRestantes),
                Prod_CantBolsasFacturadas : (this.rollosInsertar[i].CantUndRestantes - datos_rollos[j].prod_CantBolsasFacturadas),
              }
              this.rollosService.srvActualizar(datos_rollos[j].dtEntRolloProd_Codigo, info).subscribe(datos_rolloActuializado => { });
            }
          }
        });
      }
      setTimeout(() => { this.moverInventarioProductos(); }, 2000);
    } else Swal.fire("¡Debe cargar minimo un rollo en la tabla!");
  }

  // Funcion que va a mover el inventario de los productos
  moverInventarioProductos(){
    for (let i = 0; i < this.grupoProductos.length; i++) {
      this.ExistenciasProdService.srvObtenerListaPorIdProductoPresentacion(this.grupoProductos[i].Id, this.grupoProductos[i].Presentacion).subscribe(datos_productos => {
        for (let j = 0; j < datos_productos.length; j++) {
          let info : any = {
            Prod_Id: datos_productos[j].prod_Id,
            exProd_Id : datos_productos[j].exProd_Id,
            ExProd_Cantidad: (datos_productos[j].exProd_Cantidad + parseFloat(this.grupoProductos[i].Cantidad2)),
            UndMed_Id: datos_productos[j].undMed_Id,
            TpBod_Id: datos_productos[j].tpBod_Id,
            ExProd_Precio: datos_productos[j].exProd_Precio,
            ExProd_PrecioExistencia: (datos_productos[j].exProd_Cantidad + parseFloat(this.grupoProductos[i].Cantidad2)) * datos_productos[j].exProd_PrecioVenta,
            ExProd_PrecioSinInflacion: datos_productos[j].exProd_PrecioSinInflacion,
            TpMoneda_Id: datos_productos[j].tpMoneda_Id,
            ExProd_PrecioVenta: datos_productos[j].exProd_PrecioVenta,
          }
          this.ExistenciasProdService.srvActualizar(datos_productos[j].exProd_Id, info).subscribe(datos_existenciaActualizada => {
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
              title: 'Devolución de Rollos registrada con exito!'
            });
          });
        }
      });
    }
  }

}
