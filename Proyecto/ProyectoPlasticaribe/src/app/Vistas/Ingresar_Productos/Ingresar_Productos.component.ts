import { Component, Inject, Injectable, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { BagproService } from 'src/app/Servicios/Bagpro.service';
import { ExistenciasProductosService } from 'src/app/Servicios/existencias-productos.service';
import { RolesService } from 'src/app/Servicios/roles.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-Ingresar_Productos',
  templateUrl: './Ingresar_Productos.component.html',
  styleUrls: ['./Ingresar_Productos.component.css']
})

@Injectable({
  providedIn: 'root'
})

export class Ingresar_ProductosComponent implements OnInit {

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
  idProducto : number = 0; //Variable que va a almacenar el id del producto que fue hecho en la ot consultada
  presentacionProducto : string = ''; //Variable que almacenará la presentacion del producto de la orden de trabajo consultada

  constructor(private frmBuilderPedExterno : FormBuilder,
                private rolService : RolesService,
                  @Inject(SESSION_STORAGE) private storage: WebStorageService,
                    private bagProService : BagproService,
                      private ExistenciasProdService : ExistenciasProductosService,) {

    this.FormConsultarRollos = this.frmBuilderPedExterno.group({
      OT_Id: [''],
      Cliente : [''],
      Producto : [''],
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
        if (datos_ot[i].nomStatus == 'EMPAQUE'){
          this.idProducto = datos_ot[i].clienteItem;
          let info : any = {
            Id : datos_ot[i].item,
            Producto : datos_ot[i].clienteItemNombre,
            Cantidad : datos_ot[i].extnetokg,
            Presentacion : 'Kg',
          }
          this.rollos.push(info);
          this.FormConsultarRollos.setValue({
            OT_Id: ot,
            Cliente : datos_ot[i].clienteNombre,
            Producto : datos_ot[i].clienteItemNombre,
          });
        }
      }
    });
    this.bagProService.srvObtenerListaProcSelladoOT(ot).subscribe(datos_ot => {
      for (let i = 0; i < datos_ot.length; i++) {
        this.idProducto = datos_ot[i].referencia;
        if (datos_ot[i].unidad == 'UND') this.presentacionProducto = 'Und';
        if (datos_ot[i].unidad == 'PAQ') this.presentacionProducto = 'Paquete';
        if (datos_ot[i].unidad == 'KLS') this.presentacionProducto = 'Kg';
        let info : any = {
          Id : datos_ot[i].item,
          Producto : datos_ot[i].nomReferencia,
          Cantidad : datos_ot[i].qty,
          Presentacion : datos_ot[i].unidad,
        }
        this.rollos.push(info);
        this.FormConsultarRollos.setValue({
          OT_Id: ot,
          Cliente : datos_ot[i].cliente,
          Producto : datos_ot[i].nomReferencia,
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
  }

  // Funcion par ingresar los rollos
  ingresarRollos(){
    if (this.rollosInsertar.length == 0) Swal.fire("¡Debe tener minimo un rollo seleccionado!");
    else {
      for (let i = 0; i < this.rollosInsertar.length; i++) {
        let info : any = {

        }
      }
    }
  }

  InventarioProductos(){
    for (let i = 0; i < this.rollosInsertar.length; i++) {
      this.ExistenciasProdService.srvObtenerListaPorIdProductoPresentacion(this.idProducto, this.presentacionProducto).subscribe(datos_existencias => {
        for (let j = 0; j < datos_existencias.length; j++) {
          let info : any = {
            Prod_Id: this.idProducto,
            exProd_Id : datos_existencias[j].exProd_Id,
            ExProd_Cantidad: (datos_existencias[j].ExProd_Cantidad + this.rollosInsertar[i].Cantidad),
            UndMed_Id: this.presentacionProducto,
            TpBod_Id: datos_existencias[j].TpBod_Id,
            ExProd_Precio: datos_existencias[j].ExProd_Precio,
            ExProd_PrecioExistencia: datos_existencias[j].ExProd_PrecioExistencia,
            ExProd_PrecioSinInflacion: datos_existencias[j].ExProd_PrecioSinInflacion,
            TpMoneda_Id: datos_existencias[j].TpMoneda_Id,
            ExProd_PrecioVenta: datos_existencias[j].ExProd_PrecioVenta,
          }
          this.ExistenciasProdService.srvActualizarExistencia(datos_existencias[j].exProd_Id, info).subscribe(datos_existenciaActualizada => {
            const Toast = Swal.mixin({
              toast: true,
              position: 'center',
              showConfirmButton: false,
              timer: 1500,
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
          });
        }
      });
    }
  }

}
