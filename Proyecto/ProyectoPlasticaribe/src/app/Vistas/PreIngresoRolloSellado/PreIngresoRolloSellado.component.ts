import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { BagproService } from 'src/app/Servicios/Bagpro.service';
import { DetallesEntradaRollosService } from 'src/app/Servicios/DetallesEntradaRollos.service';
import { DtPreEntregaRollosService } from 'src/app/Servicios/DtPreEntregaRollos.service';
import { EntradaRollosService } from 'src/app/Servicios/EntradaRollos.service';
import { ExistenciasProductosService } from 'src/app/Servicios/existencias-productos.service';
import { PreEntregaRollosService } from 'src/app/Servicios/PreEntregaRollos.service';
import { RolesService } from 'src/app/Servicios/roles.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-PreIngresoRolloSellado',
  templateUrl: './PreIngresoRolloSellado.component.html',
  styleUrls: ['./PreIngresoRolloSellado.component.css']
})
export class PreIngresoRolloSelladoComponent implements OnInit {

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
  cantidadOT : number = 0; //

  constructor(private frmBuilderPedExterno : FormBuilder,
                private rolService : RolesService,
                  @Inject(SESSION_STORAGE) private storage: WebStorageService,
                    private bagProService : BagproService,
                      private dtPreEntRollosService : DtPreEntregaRollosService,
                        private preEntRollosService : PreEntregaRollosService,
                          private ExistenciasProdService : ExistenciasProductosService,
                            private entradaRolloService : EntradaRollosService,
                              private dtEntradaRollosService : DetallesEntradaRollosService,) {

    this.FormConsultarRollos = this.frmBuilderPedExterno.group({
      OT_Id: [null],
      fechaDoc : [null],
      fechaFinalDoc: [null],
      Observacion : [null],
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
    this.cantidadOT = 0;
    let ot : number = this.FormConsultarRollos.value.OT_Id;
    let fechaInicial : any = this.FormConsultarRollos.value.fechaDoc;
    let fechaFinal : any = this.FormConsultarRollos.value.fechaFinalDoc;
    let otTemporral : number = 0;
    let proceso : string = '';

    if (ot != null && fechaInicial != null && fechaFinal != null) {
      this.bagProService.srvObtenerListaProcSelladoFechasOT(fechaInicial, fechaFinal, ot).subscribe(datos_ot => {
        for (let i = 0; i < datos_ot.length; i++) {
          this.dtEntradaRollosService.srvObtenerVerificarRollo(datos_ot[i].item).subscribe(datos_rollos => {
            if (datos_rollos.length == 0) {
              this.idProducto = datos_ot[i].referencia;
              if (datos_ot[i].unidad == 'UND') this.presentacionProducto = 'Und';
              if (datos_ot[i].unidad == 'PAQ') this.presentacionProducto = 'Paquete';
              if (datos_ot[i].unidad == 'KLS') this.presentacionProducto = 'Kg';
              if (datos_ot[i].nomStatus == 'EXTRUSION') proceso = 'EXT'
              if (datos_ot[i].nomStatus == 'IMPRESION') proceso = 'IMP'
              if (datos_ot[i].nomStatus == 'ROTOGRABADO') proceso = 'ROT'
              if (datos_ot[i].nomStatus == 'DOBLADO') proceso = 'DBLD'
              if (datos_ot[i].nomStatus == 'LAMINADO') proceso = 'LAM'
              if (datos_ot[i].nomStatus == 'CORTE') proceso = 'CORTE'
              if (datos_ot[i].nomStatus == 'EMPAQUE') proceso = 'EMP'
              if (datos_ot[i].nomStatus == 'SELLADO') proceso = 'SELLA'
              if (datos_ot[i].nomStatus == 'Wiketiado') proceso = 'WIKE'
              let info : any = {
                Ot : datos_ot[i].ot,
                Id : datos_ot[i].item,
                IdCliente : datos_ot[i],
                Cliente : datos_ot[i],
                IdProducto : datos_ot[i].referencia,
                Producto : datos_ot[i].nomReferencia,
                Cantidad : datos_ot[i].qty,
                Presentacion : this.presentacionProducto,
                Estatus : datos_ot[i].nomStatus,
                Proceso : proceso,
              }
              if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
              otTemporral = datos_ot[i].ot;
              this.rollos.push(info);
              this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
              this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
              this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
              this.FormConsultarRollos.setValue({
                OT_Id: ot,
                fechaDoc : this.FormConsultarRollos.value.fechaDoc,
                fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
                Observacion : '',
              });
            }
          });
        }
      });
    } else if (fechaInicial != null &&  fechaFinal != null) {
      this.bagProService.srvObtenerListaProcSelladoFechas(fechaInicial, fechaFinal).subscribe(datos_ot => {
        for (let i = 0; i < datos_ot.length; i++) {
          this.dtEntradaRollosService.srvObtenerVerificarRollo(datos_ot[i].item).subscribe(datos_rollos => {
            if (datos_rollos.length == 0) {
              this.idProducto = datos_ot[i].referencia;
              if (datos_ot[i].unidad == 'UND') this.presentacionProducto = 'Und';
              if (datos_ot[i].unidad == 'PAQ') this.presentacionProducto = 'Paquete';
              if (datos_ot[i].unidad == 'KLS') this.presentacionProducto = 'Kg';
              if (datos_ot[i].nomStatus == 'EXTRUSION') proceso = 'EXT'
              if (datos_ot[i].nomStatus == 'IMPRESION') proceso = 'IMP'
              if (datos_ot[i].nomStatus == 'ROTOGRABADO') proceso = 'ROT'
              if (datos_ot[i].nomStatus == 'DOBLADO') proceso = 'DBLD'
              if (datos_ot[i].nomStatus == 'LAMINADO') proceso = 'LAM'
              if (datos_ot[i].nomStatus == 'CORTE') proceso = 'CORTE'
              if (datos_ot[i].nomStatus == 'EMPAQUE') proceso = 'EMP'
              if (datos_ot[i].nomStatus == 'SELLADO') proceso = 'SELLA'
              if (datos_ot[i].nomStatus == 'Wiketiado') proceso = 'WIKE'
              let info : any = {
                Ot : datos_ot[i].ot,
                Id : datos_ot[i].item,
                IdCliente : datos_ot[i],
                Cliente : datos_ot[i],
                IdProducto : datos_ot[i].referencia,
                Producto : datos_ot[i].nomReferencia,
                Cantidad : datos_ot[i].qty,
                Presentacion : this.presentacionProducto,
                Estatus : datos_ot[i].nomStatus,
                Proceso : proceso,
              }
              if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
              otTemporral = datos_ot[i].ot;
              this.rollos.push(info);
              this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
              this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
              this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
              this.FormConsultarRollos.setValue({
                OT_Id: ot,
                fechaDoc : this.FormConsultarRollos.value.fechaDoc,
                fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
                Observacion : '',
              });
            }
          });
        }
      });
    } else if (ot != null && fechaInicial != null) {
      this.bagProService.srvObtenerListaProcSelladoFechasOT(fechaInicial, fechaInicial, ot).subscribe(datos_ot => {
        for (let i = 0; i < datos_ot.length; i++) {
          this.dtEntradaRollosService.srvObtenerVerificarRollo(datos_ot[i].item).subscribe(datos_rollos => {
            if (datos_rollos.length == 0) {
              this.idProducto = datos_ot[i].referencia;
              if (datos_ot[i].unidad == 'UND') this.presentacionProducto = 'Und';
              if (datos_ot[i].unidad == 'PAQ') this.presentacionProducto = 'Paquete';
              if (datos_ot[i].unidad == 'KLS') this.presentacionProducto = 'Kg';
              if (datos_ot[i].nomStatus == 'EXTRUSION') proceso = 'EXT'
              if (datos_ot[i].nomStatus == 'IMPRESION') proceso = 'IMP'
              if (datos_ot[i].nomStatus == 'ROTOGRABADO') proceso = 'ROT'
              if (datos_ot[i].nomStatus == 'DOBLADO') proceso = 'DBLD'
              if (datos_ot[i].nomStatus == 'LAMINADO') proceso = 'LAM'
              if (datos_ot[i].nomStatus == 'CORTE') proceso = 'CORTE'
              if (datos_ot[i].nomStatus == 'EMPAQUE') proceso = 'EMP'
              if (datos_ot[i].nomStatus == 'SELLADO') proceso = 'SELLA'
              if (datos_ot[i].nomStatus == 'Wiketiado') proceso = 'WIKE'
              let info : any = {
                Ot : datos_ot[i].ot,
                Id : datos_ot[i].item,
                IdCliente : datos_ot[i],
                Cliente : datos_ot[i],
                IdProducto : datos_ot[i].referencia,
                Producto : datos_ot[i].nomReferencia,
                Cantidad : datos_ot[i].qty,
                Presentacion : this.presentacionProducto,
                Estatus : datos_ot[i].nomStatus,
                Proceso : proceso,
              }
              if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
              otTemporral = datos_ot[i].ot;
              this.rollos.push(info);
              this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
              this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
              this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
              this.FormConsultarRollos.setValue({
                OT_Id: ot,
                fechaDoc : this.FormConsultarRollos.value.fechaDoc,
                fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
                Observacion : '',
              });
            }
          });
        }
      });
    } else if (fechaInicial != null) {
      this.bagProService.srvObtenerListaProcSelladoFechas(fechaInicial, fechaInicial).subscribe(datos_ot => {
        for (let i = 0; i < datos_ot.length; i++) {
          this.dtEntradaRollosService.srvObtenerVerificarRollo(datos_ot[i].item).subscribe(datos_rollos => {
            if (datos_rollos.length == 0) {
              this.idProducto = datos_ot[i].referencia;
              if (datos_ot[i].unidad == 'UND') this.presentacionProducto = 'Und';
              if (datos_ot[i].unidad == 'PAQ') this.presentacionProducto = 'Paquete';
              if (datos_ot[i].unidad == 'KLS') this.presentacionProducto = 'Kg';
              if (datos_ot[i].nomStatus == 'EXTRUSION') proceso = 'EXT'
              if (datos_ot[i].nomStatus == 'IMPRESION') proceso = 'IMP'
              if (datos_ot[i].nomStatus == 'ROTOGRABADO') proceso = 'ROT'
              if (datos_ot[i].nomStatus == 'DOBLADO') proceso = 'DBLD'
              if (datos_ot[i].nomStatus == 'LAMINADO') proceso = 'LAM'
              if (datos_ot[i].nomStatus == 'CORTE') proceso = 'CORTE'
              if (datos_ot[i].nomStatus == 'EMPAQUE') proceso = 'EMP'
              if (datos_ot[i].nomStatus == 'SELLADO') proceso = 'SELLA'
              if (datos_ot[i].nomStatus == 'Wiketiado') proceso = 'WIKE'
              let info : any = {
                Ot : datos_ot[i].ot,
                Id : datos_ot[i].item,
                IdCliente : datos_ot[i],
                Cliente : datos_ot[i],
                IdProducto : datos_ot[i].referencia,
                Producto : datos_ot[i].nomReferencia,
                Cantidad : datos_ot[i].qty,
                Presentacion : this.presentacionProducto,
                Estatus : datos_ot[i].nomStatus,
                Proceso : proceso,
              }
              if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
              otTemporral = datos_ot[i].ot;
              this.rollos.push(info);
              this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
              this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
              this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
              this.FormConsultarRollos.setValue({
                OT_Id: ot,
                fechaDoc : this.FormConsultarRollos.value.fechaDoc,
                fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
                Observacion : '',
              });
            }
          });
        }
      });
    } else if (ot != null) {
      this.bagProService.srvObtenerListaProcSelladoOT(ot).subscribe(datos_ot => {
        for (let i = 0; i < datos_ot.length; i++) {
          this.dtEntradaRollosService.srvObtenerVerificarRollo(datos_ot[i].item).subscribe(datos_rollos => {
            if (datos_rollos.length == 0) {
              this.idProducto = datos_ot[i].referencia;
              if (datos_ot[i].unidad == 'UND') this.presentacionProducto = 'Und';
              if (datos_ot[i].unidad == 'PAQ') this.presentacionProducto = 'Paquete';
              if (datos_ot[i].unidad == 'KLS') this.presentacionProducto = 'Kg';
              if (datos_ot[i].nomStatus == 'EXTRUSION') proceso = 'EXT'
              if (datos_ot[i].nomStatus == 'IMPRESION') proceso = 'IMP'
              if (datos_ot[i].nomStatus == 'ROTOGRABADO') proceso = 'ROT'
              if (datos_ot[i].nomStatus == 'DOBLADO') proceso = 'DBLD'
              if (datos_ot[i].nomStatus == 'LAMINADO') proceso = 'LAM'
              if (datos_ot[i].nomStatus == 'CORTE') proceso = 'CORTE'
              if (datos_ot[i].nomStatus == 'EMPAQUE') proceso = 'EMP'
              if (datos_ot[i].nomStatus == 'SELLADO') proceso = 'SELLA'
              if (datos_ot[i].nomStatus == 'Wiketiado') proceso = 'WIKE'
              let info : any = {
                Ot : datos_ot[i].ot,
                Id : datos_ot[i].item,
                IdCliente : datos_ot[i],
                Cliente : datos_ot[i],
                IdProducto : datos_ot[i].referencia,
                Producto : datos_ot[i].nomReferencia,
                Cantidad : datos_ot[i].qty,
                Presentacion : this.presentacionProducto,
                Estatus : datos_ot[i].nomStatus,
                Proceso : proceso,
              }
              if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
              otTemporral = datos_ot[i].ot;
              this.rollos.push(info);
              this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
              this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
              this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
              this.FormConsultarRollos.setValue({
                OT_Id: ot,
                fechaDoc : this.FormConsultarRollos.value.fechaDoc,
                fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
                Observacion : '',
              });
            }
          });
        }
      });
      setTimeout(() => { this.cargando = true; }, 2000);
    } else {
      this.bagProService.srvObtenerListaProcSelladoFechas('2022-09-16', this.today).subscribe(datos_ot => {
        for (let i = 0; i < datos_ot.length; i++) {
          this.dtEntradaRollosService.srvObtenerVerificarRollo(datos_ot[i].item).subscribe(datos_rollos => {
            if (datos_rollos.length == 0) {
              if (datos_ot[i].unidad == 'UND') this.presentacionProducto = 'Und';
              if (datos_ot[i].unidad == 'PAQ') this.presentacionProducto = 'Paquete';
              if (datos_ot[i].unidad == 'KLS') this.presentacionProducto = 'Kg';
              if (datos_ot[i].nomStatus == 'EXTRUSION') proceso = 'EXT'
              if (datos_ot[i].nomStatus == 'IMPRESION') proceso = 'IMP'
              if (datos_ot[i].nomStatus == 'ROTOGRABADO') proceso = 'ROT'
              if (datos_ot[i].nomStatus == 'DOBLADO') proceso = 'DBLD'
              if (datos_ot[i].nomStatus == 'LAMINADO') proceso = 'LAM'
              if (datos_ot[i].nomStatus == 'CORTE') proceso = 'CORTE'
              if (datos_ot[i].nomStatus == 'EMPAQUE') proceso = 'EMP'
              if (datos_ot[i].nomStatus == 'SELLADO') proceso = 'SELLA'
              if (datos_ot[i].nomStatus == 'Wiketiado') proceso = 'WIKE'
              let info : any = {
                Ot : datos_ot[i].ot,
                Id : datos_ot[i].item,
                IdCliente : datos_ot[i],
                Cliente : datos_ot[i],
                IdProducto : datos_ot[i].referencia,
                Producto : datos_ot[i].nomReferencia,
                Cantidad : datos_ot[i].qty,
                Presentacion : this.presentacionProducto,
                Estatus : datos_ot[i].nomStatus,
                Proceso : proceso,
              }
              if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
              otTemporral = datos_ot[i].ot;
              this.rollos.push(info);
              this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
              this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
              this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
              this.FormConsultarRollos.setValue({
                OT_Id: ot,
                fechaDoc : this.FormConsultarRollos.value.fechaDoc,
                fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
                Observacion : '',
              });
            }
          });
        }
      });
    }
    setTimeout(() => { this.cargando = true; }, 5000);
  }

  //Funcion que va a agregar Productos en la tabla
  cargarProducto(item : any){
    if (this.rollosInsertar.length == 0) {
      let info : any = {
        Ot : item.Ot,
        Id : item.Id,
        IdCliente : item.IdCliente,
        Cliente : item.Cliente,
        IdProducto : item.IdProducto,
        Producto : item.Producto,
        Cantidad : item.Cantidad,
        Presentacion : item.Presentacion,
        Estatus : item.Estatus,
        Proceso : item.Proceso,
      }
      this.rollosInsertar.push(info);
      this.validarRollo.push(item.Id);
    } else {
      if (!this.validarRollo.includes(item.Id)) {
        let info : any = {
          Ot : item.Ot,
          Id : item.Id,
          IdCliente : item.IdCliente,
          Cliente : item.Cliente,
          IdProducto : item.IdProducto,
          Producto : item.Producto,
          Cantidad : item.Cantidad,
          Presentacion : item.Presentacion,
          Estatus : item.Estatus,
          Proceso : item.Proceso,
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

  // Funcion que va a seleccionar todo lo que hay en la tabla
  selccionarTodo(){
    for (const item of this.rollos) {
      let info : any = {
        Ot : item.Ot,
        Id : item.Id,
        IdCliente : item.IdCliente,
        Cliente : item.Cliente,
        IdProducto : item.IdProducto,
        Producto : item.Producto,
        Cantidad : item.Cantidad,
        Presentacion : item.Presentacion,
        Estatus : item.Estatus,
        Proceso : item.Proceso,
      }
      this.rollosInsertar.push(info);
      this.validarRollo.push(item.Id);
    }
    setTimeout(() => { this.rollos = []; }, 2000);
  }

  // Funcion que va a seleccionar todo lo de la OT sobre la que se dió click que hay en la tabla
  selccionarTodoOT(ot){
    for (let i = 0; i < this.rollos.length; i++) {
      if (this.rollos[i].Ot == ot) {
        let info : any = {
          Ot : this.rollos[i].Ot,
          Id : this.rollos[i].Id,
          IdCliente : this.rollos[i].IdCliente,
          Cliente : this.rollos[i].Cliente,
          IdProducto : this.rollos[i].IdProducto,
          Producto : this.rollos[i].Producto,
          Cantidad : this.rollos[i].Cantidad,
          Presentacion : this.rollos[i].Presentacion,
          Estatus : this.rollos[i].Estatus,
          Proceso : this.rollos[i].Proceso,
        }
        this.rollosInsertar.push(info);
        this.validarRollo.push(this.rollos[i].Id);
      }
    }
    for (let i = 0; i < this.rollos.length; i++) {
      if (this.rollos[i].Ot == ot) this.rollos.splice(i,1);
    }
  }

  // Funcion que va a quitar todo lo que hay en la tabla
  quitarTodo(){
    for (const item of this.rollosInsertar) {
      let info : any = {
        Ot : item.Ot,
        Id : item.Id,
        IdCliente : item.IdCliente,
        Cliente : item.Cliente,
        IdProducto : item.IdProducto,
        Producto : item.Producto,
        Cantidad : item.Cantidad,
        Presentacion : item.Presentacion,
        Estatus : item.Estatus,
        Proceso : item.Proceso,
      }
      this.rollos.push(info);
    }
    setTimeout(() => {
      this.rollosInsertar = [];
      this.validarRollo = [];
    }, 2000);
  }

  // Funcion que se va a encargar de quitar rollos de la tabla inferior
  quitarRollo(item : any){
    let info : any = {
      Ot : item.Ot,
      Id : item.Id,
      IdCliente : item.IdCliente,
      Cliente : item.Cliente,
      IdProducto : item.IdProducto,
      Producto : item.Producto,
      Cantidad : item.Cantidad,
      Presentacion : item.Presentacion,
      Estatus : item.Estatus,
      Proceso : item.Proceso,
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
        PreEntRollo_Fecha : this.today,
        PreEntRollo_Observacion : this.FormConsultarRollos.value.Observacion,
        Usua_Id : this.storage_Id,
      }
      this.preEntRollosService.srvGuardar(info).subscribe(datos_entradaRollo => {
        this.preEntRollosService.srvObtenerUltimoId().subscribe(datos_ultEntrada => {
          this.ingresarRollos(datos_entradaRollo.entRolloProd_Id);
        });
      });
    }
  }

  // Funcion par ingresar los rollos
  ingresarRollos(idEntrada : number){
    for (let i = 0; i < this.rollosInsertar.length; i++) {
      let info : any = {
        PreEntRollo_Id : idEntrada,
        Rollo_Id : this.rollosInsertar[i].Id,
        DtlPreEntRollo_Cantidad : this.rollosInsertar[i].Cantidad,
        UndMed_Id : this.rollosInsertar[i].Presentacion,
        Proceso_Id : this.rollosInsertar[i].Proceso,
        Cli_Id : this.rollosInsertar[i].IdCliente,
        DtlPreEntRollo_OT : this.rollosInsertar[i].Ot,
        Prod_Id : this.rollosInsertar[i].IdProducto,
        UndMed_Producto : this.rollosInsertar[i].Presentacion,
      }
      this.dtPreEntRollosService.srvGuardar(info).subscribe(datos_entrada => {  });
    }
    setTimeout(() => {
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
        title: '¡Pre Entrada de Rollos registrada con exito!'
      });
      this.limpiarCampos();
    }, 2000);
  }

}
