import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { timeStamp } from 'console';
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
    this.FormConsultarFactura.reset();
    this.rollos = [];
    this.rollosInsertar = [];
    this.validarRollo = [];
    this.cargando = true;
  }

  //Funcion que traerá los diferentes rollos que se hicieron en la orden de trabajo
  consultarFactura(){
    this.rollos = [];
    let factura : string = this.FormConsultarFactura.value.Fact_Id;
    this.dtAsgProdFactura.srvObtenerListaPorCodigoFactura(factura.toUpperCase()).subscribe(datos_factura => {
      for (let i = 0; i < datos_factura.length; i++) {
        if (datos_factura[i].estado_Id == 21) {
          let info : any = {
            Id : datos_factura[i].rollo_Id,
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
            Cliente : datos_factura[i].cli_Nombre,
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
  }

  // Funcion para crear devolucion de rollos de productos
  creardevolucion(){
    if (this.rollosInsertar.length == 0) Swal.fire("¡Debe tener minimo un rollo seleccionado!");
    else {
      this.cargando = false;
      let info : any = {
        FacturaVta_Id : this.FormConsultarFactura.value.Fact_Id,
        Cli_Id : this.idCliente,
        DevProdFact_Fecha : this.today,
        DevProdFact_Observacion : this.FormConsultarFactura.value.Observacion,
        TipoDevProdFact_Id : 1,
      }
      this.devolcuionesService.srvGuardar(info).subscribe(datos_devolucion => {
        this.devolcuionesService.srvObteneUltimoId().subscribe(datos_devolucion => {
          this.crearDtDevolucion(datos_devolucion.devProdFact_Id);
        });
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
      }
      this.dtDevolucionService.srvGuardar(info).subscribe(datos_devolcuion => {  });
    }
    setTimeout(() => { this.actualizarRollos(); }, 2000);
  }

  // Funcion para mover el inventario de los rollos y cambiar su estado
  actualizarRollos(){
    if (this.rollosInsertar.length != 0) {
      for (let i = 0; i < this.rollosInsertar.length; i++) {
        this.rollosService.srvObtenerVerificarRollo(this.rollosInsertar[i].Id).subscribe(datos_rollos => {
          for (let j = 0; j < datos_rollos.length; j++) {
            let info : any = {
              DtEntRolloProd_Codigo : datos_rollos[j].dtEntRolloProd_Codigo,
              EntRolloProd_Id : datos_rollos[j].entRolloProd_Id,
              Rollo_Id : datos_rollos[j].rollo_Id,
              DtEntRolloProd_Cantidad : datos_rollos[j].dtEntRolloProd_Cantidad,
              UndMed_Id : datos_rollos[j].undMed_Id,
              Estado_Id : 19,
            }
            this.rollosService.srvActualizar(datos_rollos[j].dtEntRolloProd_Codigo, info).subscribe(datos_rolloActuializado => { });
          }
        });
      }
      setTimeout(() => { this.actualizarProductos(); }, 2000);
    } else Swal.fire("¡Debe cargar minimo un rollo en la tabla!");
  }

  // Funcion para actualizar la cantidad de existencias de cada producto
  actualizarProductos(){
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
              ExProd_Cantidad: (datos_existencias[j].exProd_Cantidad + sumaCant),
              UndMed_Id: this.presentacionProducto,
              TpBod_Id: datos_existencias[j].tpBod_Id,
              ExProd_Precio: datos_existencias[j].exProd_Precio,
              ExProd_PrecioExistencia: (datos_existencias[j].exProd_Cantidad + sumaCant) * datos_existencias[j].exProd_PrecioVenta,
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
                title: '¡Devolución de Rollos registrada con exito!'
              });
              this.limpiarCampos();
            });
          }
        });
      }
    }, 2000);
  }

}
