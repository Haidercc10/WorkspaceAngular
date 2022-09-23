import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { BagproService } from 'src/app/Servicios/Bagpro.service';
import { DetallesEntradaRollosService } from 'src/app/Servicios/DetallesEntradaRollos.service';
import { EntradaRollosService } from 'src/app/Servicios/EntradaRollos.service';
import { ExistenciasProductosService } from 'src/app/Servicios/existencias-productos.service';
import { RolesService } from 'src/app/Servicios/roles.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-PreIngresoRollosExtrusion',
  templateUrl: './PreIngresoRollosExtrusion.component.html',
  styleUrls: ['./PreIngresoRollosExtrusion.component.css']
})
export class PreIngresoRollosExtrusionComponent implements OnInit {

  public FormConsultarRollos !: FormGroup; //formulario para consultar y crear un ingreso de rollos

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
  idProducto : any = 0; //Variable que va a almacenar el id del producto que fue hecho en la ot consultada
  presentacionProducto : string = ''; //Variable que almacenará la presentacion del producto de la orden de trabajo consultada

  constructor(private frmBuilderPedExterno : FormBuilder,
                private rolService : RolesService,
                  @Inject(SESSION_STORAGE) private storage: WebStorageService,
                    private bagProService : BagproService,
                      private ExistenciasProdService : ExistenciasProductosService,
                        private entradaRolloService : EntradaRollosService,
                          private dtEntradaRollosService : DetallesEntradaRollosService,) {

    this.FormConsultarRollos = this.frmBuilderPedExterno.group({
      OT_Id: [''],
      Cliente : [''],
      Producto : [''],
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
    this.FormConsultarRollos.reset();
    this.rollos = [];
    this.rollosInsertar = [];
    this.validarRollo = [];
    this.cargando = true;
  }

  //Funcion que traerá los diferentes rollos que se hicieron en la orden de trabajo
  consultarOTbagPro(){
    this.rollos = [];
    this.rollosInsertar = [];
    this.validarRollo = [];
    this.cargando = false;
    let ot : number = this.FormConsultarRollos.value.OT_Id;

    this.bagProService.srvObtenerListaProcExtOt(ot).subscribe(datos_ot => {
      for (let i = 0; i < datos_ot.length; i++) {
        this.dtEntradaRollosService.srvObtenerVerificarRollo(datos_ot[i].item).subscribe(datos_rollos => {
          if (datos_rollos.length == 0){
            this.idProducto = datos_ot[i].referencia;
            this.presentacionProducto = 'Kg';
            this.idProducto = datos_ot[i].clienteItem;
            let info : any = {
              Id : datos_ot[i].item,
              IdProducto : datos_ot[i].clienteItem,
              Producto : datos_ot[i].clienteItemNombre,
              Cantidad : datos_ot[i].extnetokg,
              Presentacion : 'Kg',
              Estatus : datos_ot[i].nomStatus,
            }
            this.rollos.push(info);
            this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id));
            this.FormConsultarRollos.setValue({
              OT_Id: ot,
              Cliente : datos_ot[i].clienteNombre,
              Producto : datos_ot[i].clienteItemNombre,
              Observacion : '',
            });
          }
        });
      }
    });
    this.bagProService.srvObtenerListaProcSelladoOT(ot).subscribe(datos_ot => {
      for (let i = 0; i < datos_ot.length; i++) {
        this.dtEntradaRollosService.srvObtenerVerificarRollo(datos_ot[i].item).subscribe(datos_rollos => {
          if (datos_rollos.length == 0) {
            this.idProducto = datos_ot[i].referencia;
            if (datos_ot[i].unidad == 'UND') this.presentacionProducto = 'Und';
            if (datos_ot[i].unidad == 'PAQ') this.presentacionProducto = 'Paquete';
            if (datos_ot[i].unidad == 'KLS') this.presentacionProducto = 'Kg';
            let info : any = {
              Id : datos_ot[i].item,
              IdProducto : datos_ot[i].referencia,
              Producto : datos_ot[i].nomReferencia,
              Cantidad : datos_ot[i].qty,
              Presentacion : datos_ot[i].unidad,
              Estatus : datos_ot[i].nomStatus,
            }
            this.rollos.push(info);
            this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id));
            this.FormConsultarRollos.setValue({
              OT_Id: ot,
              Cliente : datos_ot[i].cliente,
              Producto : datos_ot[i].nomReferencia,
              Observacion : '',
            });
          }
        });
      }
    });
    setTimeout(() => { this.cargando = true; }, 2000);
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

  //Funcion para meter el encabezado de la entrada
  IngresarInfoRollos(){
    if (this.rollosInsertar.length == 0) Swal.fire("¡Debe tener minimo un rollo seleccionado!");
    else {
      this.cargando = false;
      let info : any = {
        EntRolloProd_OT : this.FormConsultarRollos.value.OT_Id,
        Prod_Id : this.idProducto.trim(),
        UndMed_Id : this.presentacionProducto,
        EntRolloProd_Fecha : this.today,
        EntRolloProd_Observacion : this.FormConsultarRollos.value.Observacion,
        Usua_Id : this.storage_Id,
      }
      this.entradaRolloService.srvGuardar(info).subscribe(datos_entradaRollo => {
        this.entradaRolloService.srvObtenerUltimoId().subscribe(datos_ultEntrada => {
          this.ingresarRollos(datos_entradaRollo.entRolloProd_Id);
        });
      });
    }
  }

  // Funcion par ingresar los rollos
  ingresarRollos(idEntrada : number){
    for (let i = 0; i < this.rollosInsertar.length; i++) {
      let info : any = {
        EntRolloProd_Id : idEntrada,
        Rollo_Id : this.rollosInsertar[i].Id,
        DtEntRolloProd_Cantidad : this.rollosInsertar[i].Cantidad,
        UndMed_Id : this.presentacionProducto,
        Estado_Id : 19,
      }
      this.dtEntradaRollosService.srvGuardar(info).subscribe(datos_entrada => {  });
    }
    setTimeout(() => { this.InventarioProductos(); }, 2000);
  }

  // Funcion para mover el inventario de los productos
  InventarioProductos(){
    let sumaCant : number = 0;
    for (let i = 0; i < this.rollosInsertar.length; i++) {
      sumaCant +=  this.rollosInsertar[i].Cantidad;
    }
    setTimeout(() => {
      this.ExistenciasProdService.srvObtenerListaPorIdProductoPresentacion(this.idProducto, this.presentacionProducto).subscribe(datos_existencias => {
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
              title: '¡Entrada de Rollos registrada con exito!'
            });
            this.limpiarCampos();
          });
        }
      });
    }, 2000);
  }

}
