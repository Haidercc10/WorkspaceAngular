import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import pdfMake from 'pdfmake/build/pdfmake';
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
  hora : any = moment().format("H:mm:ss"); //Variable que almacenará la hora
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
  rollosAsignados : any = [];
  Total : number = 0; //Variable que va a almacenar la cantidad total de kg de los rollos asignados
  grupoProductos : any [] = []; //Variable que guardará de manera descriminada a cada producto
  cantPage : number = 25;
  public page : number;

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
      Proceso : [null, Validators.required],
      Observacion : [''],
    });
  }

  ngOnInit() {
    this.lecturaStorage();
    this.fecha();
    this.limpiarCampos();
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

    setTimeout(() => {
      if (this.ValidarRol == 8){
        this.FormConsultarRollos.setValue({
          OT_Id: this.FormConsultarRollos.value.OT_Id,
          fechaDoc : this.FormConsultarRollos.value.fechaDoc,
          fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
          Observacion : this.FormConsultarRollos.value.Observacion,
          Proceso : '2',
        });
      } else if (this.ValidarRol == 9){
        this.FormConsultarRollos.setValue({
          OT_Id: this.FormConsultarRollos.value.OT_Id,
          fechaDoc : this.FormConsultarRollos.value.fechaDoc,
          fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
          Observacion : this.FormConsultarRollos.value.Observacion,
          Proceso : '1',
        });
      } else {
        this.FormConsultarRollos.setValue({
          OT_Id: this.FormConsultarRollos.value.OT_Id,
          fechaDoc : this.FormConsultarRollos.value.fechaDoc,
          fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
          Observacion : this.FormConsultarRollos.value.Observacion,
          Proceso : '1',
        });
      }
    }, 1500);
  }

  // Funcion para limpiar los campos de la vista
  limpiarCampos(){
    if (this.ValidarRol == 8){
      this.FormConsultarRollos.setValue({
        OT_Id: null,
        fechaDoc : null,
        fechaFinalDoc: null,
        Observacion : null,
        Proceso : '2',
      });
    } else if (this.ValidarRol == 9){
      this.FormConsultarRollos.setValue({
        OT_Id: null,
        fechaDoc : null,
        fechaFinalDoc: null,
        Observacion : null,
        Proceso : '1',
      });
    } else {
      this.FormConsultarRollos.setValue({
        OT_Id: null,
        fechaDoc : null,
        fechaFinalDoc: null,
        Observacion : null,
        Proceso : '1',
      });
    }
    this.rollos = [];
    this.rollosInsertar = [];
    this.validarRollo = [];
    this.grupoProductos = [];
    this.cargando = true;
    this.Total = 0;
    // window.location.href = "./preingreso-sellado";
  }

  //Funcion que traerá los diferentes rollos que se hicieron en la orden de trabajo
  consultarOTbagPro(){
    let ProcConsulta : any = this.FormConsultarRollos.value.Proceso;
    let ot : number = this.FormConsultarRollos.value.OT_Id;
    let fechaInicial : any = this.FormConsultarRollos.value.fechaDoc;
    let fechaFinal : any = this.FormConsultarRollos.value.fechaFinalDoc;
    let rollos : any = [];

    if (ProcConsulta != null) {
      if (!moment(fechaInicial).isBefore('2022-09-25', 'days') && !moment(fechaFinal).isBefore('2022-09-25', 'days')) {
        this.rollos = [];
        this.rollosInsertar = [];
        this.validarRollo = [];
        let RollosConsultados : any [] = [];
        let otTemporral : number = 0;
        this.cargando = false;
        this.cantidadOT = 0;
        let proceso : string = '';

        this.dtPreEntRollosService.srvObtenerLista().subscribe(datos_rollos => {
          for (let i = 0; i < datos_rollos.length; i++) {
            rollos.push(datos_rollos[i].rollo_Id);
          }
        });

        setTimeout(() => {
          if (ot != null && fechaInicial != null && fechaFinal != null) {
            if (ProcConsulta == "1"){
              this.bagProService.srvObtenerListaProcExtrusionFechasOT(fechaInicial, fechaFinal, ot).subscribe(datos_ot => {
                for (let i = 0; i < datos_ot.length; i++) {
                  if (datos_ot[i].nomStatus == 'EMPAQUE') {
                    if (!rollos.includes(datos_ot[i].item)) {
                      if (datos_ot[i].nomStatus == 'EMPAQUE') proceso = 'EMP'
                      let info : any = {
                        Ot : datos_ot[i].ot,
                        Id : datos_ot[i].item,
                        IdCliente : datos_ot[i].identNro,
                        Cliente : datos_ot[i].nombreComercial,
                        IdProducto : datos_ot[i].clienteItem,
                        Producto : datos_ot[i].clienteItemNombre,
                        Cantidad : datos_ot[i].extnetokg,
                        Presentacion : datos_ot[i].unidad,
                        Estatus : datos_ot[i].nomStatus,
                        Proceso : proceso,
                      }
                      if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
                      otTemporral = datos_ot[i].ot;
                      this.rollos.push(info);
                      RollosConsultados.push(datos_ot[i].item);
                      rollos.push(datos_ot[i].item);
                      this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
                      this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
                      this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
                      this.FormConsultarRollos.setValue({
                        OT_Id: ot,
                        fechaDoc : this.FormConsultarRollos.value.fechaDoc,
                        fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
                        Observacion : this.FormConsultarRollos.value.Observacion,
                        Proceso : this.FormConsultarRollos.value.Proceso,
                      });
                    }
                  }
                }
              });

              // this.bagProService.srvObtenerListaProcExtrusionFechasOT(fechaInicial, fechaFinal, ot).subscribe(datos_ot => {
              //   for (let i = 0; i < datos_ot.length; i++) {
              //     this.dtPreEntRollosService.srvObtenerVerificarRollo(datos_ot[i].item).subscribe(datos_rollos => {
              //       if (datos_rollos.length == 0 && datos_ot[i].nomStatus == 'EMPAQUE') {
              //         if (!RollosConsultados.includes(datos_ot[i].item)){
              //           if (datos_ot[i].nomStatus == 'EMPAQUE') proceso = 'EMP'
              //           let info : any = {
              //             Ot : datos_ot[i].ot,
              //             Id : datos_ot[i].item,
              //             IdCliente : datos_ot[i].identNro,
              //             Cliente : datos_ot[i].nombreComercial,
              //             IdProducto : datos_ot[i].clienteItem,
              //             Producto : datos_ot[i].clienteItemNombre,
              //             Cantidad : datos_ot[i].extnetokg,
              //             Presentacion : datos_ot[i].unidad,
              //             Estatus : datos_ot[i].nomStatus,
              //             Proceso : proceso,
              //           }
              //           if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
              //           otTemporral = datos_ot[i].ot;
              //           this.rollos.push(info);
              //           RollosConsultados.push(datos_ot[i].item);
              //           this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
              //           this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
              //           this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
              //           this.FormConsultarRollos.setValue({
              //             OT_Id: ot,
              //             fechaDoc : this.FormConsultarRollos.value.fechaDoc,
              //             fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
              //             Observacion : this.FormConsultarRollos.value.Observacion,
              //             Proceso : this.FormConsultarRollos.value.Proceso,
              //           });
              //         }
              //       }
              //     });
              //   }
              // });
            } else if (ProcConsulta == "2") {
              this.bagProService.srvObtenerListaProcSelladoFechasOT(fechaInicial, fechaFinal, ot).subscribe(datos_ot => {
                for (let i = 0; i < datos_ot.length; i++) {
                  if (!rollos.includes(datos_ot[i].item) && datos_ot[i].nomStatus == 'SELLADO') {
                    this.idProducto = datos_ot[i].referencia;
                    if (datos_ot[i].unidad == 'UND') this.presentacionProducto = 'Und';
                    if (datos_ot[i].unidad == 'PAQ') this.presentacionProducto = 'Paquete';
                    if (datos_ot[i].unidad == 'KLS') this.presentacionProducto = 'Kg';
                    if (datos_ot[i].nomStatus == 'SELLADO') proceso = 'SELLA'
                    let info : any = {
                      Ot : datos_ot[i].ot,
                      Id : datos_ot[i].item,
                      IdCliente : datos_ot[i].identNro,
                      Cliente : datos_ot[i].nombreComercial,
                      IdProducto : datos_ot[i].referencia,
                      Producto : datos_ot[i].nomReferencia,
                      Cantidad : datos_ot[i].qty,
                      Presentacion : this.presentacionProducto,
                      Estatus : datos_ot[i].nomStatus,
                      Proceso : proceso,
                    }
                    this.rollos.push(info);
                    rollos.push(datos_ot[i].item)
                    RollosConsultados.push(datos_ot[i].item);
                    this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
                    this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
                    this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
                    this.FormConsultarRollos.setValue({
                      OT_Id: ot,
                      fechaDoc : this.FormConsultarRollos.value.fechaDoc,
                      fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
                      Observacion : this.FormConsultarRollos.value.Observacion,
                      Proceso : this.FormConsultarRollos.value.Proceso,
                    });
                    this.cargando = true;
                  }
                }
              });

              // this.bagProService.srvObtenerListaProcSelladoFechasOT(fechaInicial, fechaFinal, ot).subscribe(datos_ot => {
              //   for (let i = 0; i < datos_ot.length; i++) {
              //     this.dtPreEntRollosService.srvObtenerVerificarRollo(datos_ot[i].item).subscribe(datos_rollos => {
              //       if (datos_rollos.length == 0) {
              //           if (!RollosConsultados.includes(datos_ot[i].item)){
              //             this.idProducto = datos_ot[i].referencia;
              //             if (datos_ot[i].unidad == 'UND') this.presentacionProducto = 'Und';
              //             if (datos_ot[i].unidad == 'PAQ') this.presentacionProducto = 'Paquete';
              //             if (datos_ot[i].unidad == 'KLS') this.presentacionProducto = 'Kg';
              //             if (datos_ot[i].nomStatus == 'EXTRUSION') proceso = 'EXT'
              //             if (datos_ot[i].nomStatus == 'IMPRESION') proceso = 'IMP'
              //             if (datos_ot[i].nomStatus == 'ROTOGRABADO') proceso = 'ROT'
              //             if (datos_ot[i].nomStatus == 'DOBLADO') proceso = 'DBLD'
              //             if (datos_ot[i].nomStatus == 'LAMINADO') proceso = 'LAM'
              //             if (datos_ot[i].nomStatus == 'CORTE') proceso = 'CORTE'
              //             if (datos_ot[i].nomStatus == 'EMPAQUE') proceso = 'EMP'
              //             if (datos_ot[i].nomStatus == 'SELLADO') proceso = 'SELLA'
              //             if (datos_ot[i].nomStatus == 'Wiketiado') proceso = 'WIKE'
              //             let info : any = {
              //               Ot : datos_ot[i].ot,
              //               Id : datos_ot[i].item,
              //               IdCliente : datos_ot[i],
              //               Cliente : datos_ot[i],
              //               IdProducto : datos_ot[i].referencia,
              //               Producto : datos_ot[i].nomReferencia,
              //               Cantidad : datos_ot[i].qty,
              //               Presentacion : this.presentacionProducto,
              //               Estatus : datos_ot[i].nomStatus,
              //               Proceso : proceso,
              //             }
              //             if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
              //             otTemporral = datos_ot[i].ot;
              //             this.rollos.push(info);
              //             RollosConsultados.push(datos_ot[i].item);
              //             this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
              //             this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
              //             this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
              //             this.FormConsultarRollos.setValue({
              //               OT_Id: ot,
              //               fechaDoc : this.FormConsultarRollos.value.fechaDoc,
              //               fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
              //               Observacion : this.FormConsultarRollos.value.Observacion,
              //               Proceso : this.FormConsultarRollos.value.Proceso,
              //             });
              //           }
              //       }
              //     });
              //   }
              // });
            }
          } else if (fechaInicial != null &&  fechaFinal != null) {
            if (ProcConsulta == "1"){
              this.bagProService.srvObtenerListaProcExtrusionFechas(fechaInicial, fechaFinal).subscribe(datos_ot => {
                for (let i = 0; i < datos_ot.length; i++) {
                  if (datos_ot[i].nomStatus == 'EMPAQUE') {
                    if (!rollos.includes(datos_ot[i].item)) {
                      if (datos_ot[i].nomStatus == 'EMPAQUE') proceso = 'EMP'
                      let info : any = {
                        Ot : datos_ot[i].ot,
                        Id : datos_ot[i].item,
                        IdCliente : datos_ot[i].identNro,
                        Cliente : datos_ot[i].nombreComercial,
                        IdProducto : datos_ot[i].clienteItem,
                        Producto : datos_ot[i].clienteItemNombre,
                        Cantidad : datos_ot[i].extnetokg,
                        Presentacion : datos_ot[i].unidad,
                        Estatus : datos_ot[i].nomStatus,
                        Proceso : proceso,
                      }
                      if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
                      otTemporral = datos_ot[i].ot;
                      this.rollos.push(info);
                      RollosConsultados.push(datos_ot[i].item);
                      rollos.push(datos_ot[i].item);
                      this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
                      this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
                      this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
                      this.FormConsultarRollos.setValue({
                        OT_Id: ot,
                        fechaDoc : this.FormConsultarRollos.value.fechaDoc,
                        fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
                        Observacion : this.FormConsultarRollos.value.Observacion,
                        Proceso : this.FormConsultarRollos.value.Proceso,
                      });
                    }
                  }
                }
              });
            } else if (ProcConsulta == "2") {
              this.bagProService.srvObtenerListaProcSelladoFechas(fechaInicial, fechaFinal).subscribe(datos_ot => {
                for (let i = 0; i < datos_ot.length; i++) {
                  if (!rollos.includes(datos_ot[i].item) && datos_ot[i].nomStatus == 'SELLADO') {
                    this.idProducto = datos_ot[i].referencia;
                    if (datos_ot[i].unidad == 'UND') this.presentacionProducto = 'Und';
                    if (datos_ot[i].unidad == 'PAQ') this.presentacionProducto = 'Paquete';
                    if (datos_ot[i].unidad == 'KLS') this.presentacionProducto = 'Kg';
                    if (datos_ot[i].nomStatus == 'SELLADO') proceso = 'SELLA'
                    let info : any = {
                      Ot : datos_ot[i].ot,
                      Id : datos_ot[i].item,
                      IdCliente : datos_ot[i].identNro,
                      Cliente : datos_ot[i].nombreComercial,
                      IdProducto : datos_ot[i].referencia,
                      Producto : datos_ot[i].nomReferencia,
                      Cantidad : datos_ot[i].qty,
                      Presentacion : this.presentacionProducto,
                      Estatus : datos_ot[i].nomStatus,
                      Proceso : proceso,
                    }
                    this.rollos.push(info);
                    rollos.push(datos_ot[i].item)
                    RollosConsultados.push(datos_ot[i].item);
                    this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
                    this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
                    this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
                    this.FormConsultarRollos.setValue({
                      OT_Id: ot,
                      fechaDoc : this.FormConsultarRollos.value.fechaDoc,
                      fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
                      Observacion : this.FormConsultarRollos.value.Observacion,
                      Proceso : this.FormConsultarRollos.value.Proceso,
                    });
                    this.cargando = true;
                  }
                }
              });

              // this.bagProService.srvObtenerListaProcSelladoFechas(fechaInicial, fechaFinal).subscribe(datos_ot => {
              //   for (let i = 0; i < datos_ot.length; i++) {
              //     this.dtPreEntRollosService.srvObtenerVerificarRollo(datos_ot[i].item).subscribe(datos_rollos => {
              //       if (datos_rollos.length == 0) {
              //         if (!RollosConsultados.includes(datos_ot[i].item)){
              //           this.idProducto = datos_ot[i].referencia;
              //           if (datos_ot[i].unidad == 'UND') this.presentacionProducto = 'Und';
              //           if (datos_ot[i].unidad == 'PAQ') this.presentacionProducto = 'Paquete';
              //           if (datos_ot[i].unidad == 'KLS') this.presentacionProducto = 'Kg';
              //           if (datos_ot[i].nomStatus == 'EXTRUSION') proceso = 'EXT'
              //           if (datos_ot[i].nomStatus == 'IMPRESION') proceso = 'IMP'
              //           if (datos_ot[i].nomStatus == 'ROTOGRABADO') proceso = 'ROT'
              //           if (datos_ot[i].nomStatus == 'DOBLADO') proceso = 'DBLD'
              //           if (datos_ot[i].nomStatus == 'LAMINADO') proceso = 'LAM'
              //           if (datos_ot[i].nomStatus == 'CORTE') proceso = 'CORTE'
              //           if (datos_ot[i].nomStatus == 'EMPAQUE') proceso = 'EMP'
              //           if (datos_ot[i].nomStatus == 'SELLADO') proceso = 'SELLA'
              //           if (datos_ot[i].nomStatus == 'Wiketiado') proceso = 'WIKE'
              //           let info : any = {
              //             Ot : datos_ot[i].ot,
              //             Id : datos_ot[i].item,
              //             IdCliente : datos_ot[i].identNro,
              //             Cliente : datos_ot[i].nombreComercial,
              //             IdProducto : datos_ot[i].referencia,
              //             Producto : datos_ot[i].nomReferencia,
              //             Cantidad : datos_ot[i].qty,
              //             Presentacion : this.presentacionProducto,
              //             Estatus : datos_ot[i].nomStatus,
              //             Proceso : proceso,
              //           }
              //           if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
              //           otTemporral = datos_ot[i].ot;
              //           this.rollos.push(info);
              //           RollosConsultados.push(datos_ot[i].item);
              //           this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
              //           this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
              //           this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
              //           this.FormConsultarRollos.setValue({
              //             OT_Id: ot,
              //             fechaDoc : this.FormConsultarRollos.value.fechaDoc,
              //             fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
              //             Observacion : this.FormConsultarRollos.value.Observacion,
              //             Proceso : this.FormConsultarRollos.value.Proceso,
              //           });
              //         }
              //       }
              //     });
              //   }
              // });
            }
          } else if (ot != null && fechaInicial != null) {
            if (ProcConsulta == "1"){
              this.bagProService.srvObtenerListaProcExtrusionFechasOT(fechaInicial, fechaInicial, ot).subscribe(datos_ot => {
                for (let i = 0; i < datos_ot.length; i++) {
                  if (datos_ot[i].nomStatus == 'EMPAQUE') {
                    if (!rollos.includes(datos_ot[i].item)) {
                      if (datos_ot[i].nomStatus == 'EMPAQUE') proceso = 'EMP'
                      let info : any = {
                        Ot : datos_ot[i].ot,
                        Id : datos_ot[i].item,
                        IdCliente : datos_ot[i].identNro,
                        Cliente : datos_ot[i].nombreComercial,
                        IdProducto : datos_ot[i].clienteItem,
                        Producto : datos_ot[i].clienteItemNombre,
                        Cantidad : datos_ot[i].extnetokg,
                        Presentacion : datos_ot[i].unidad,
                        Estatus : datos_ot[i].nomStatus,
                        Proceso : proceso,
                      }
                      if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
                      otTemporral = datos_ot[i].ot;
                      this.rollos.push(info);
                      RollosConsultados.push(datos_ot[i].item);
                      rollos.push(datos_ot[i].item);
                      this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
                      this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
                      this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
                      this.FormConsultarRollos.setValue({
                        OT_Id: ot,
                        fechaDoc : this.FormConsultarRollos.value.fechaDoc,
                        fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
                        Observacion : this.FormConsultarRollos.value.Observacion,
                        Proceso : this.FormConsultarRollos.value.Proceso,
                      });
                    }
                  }
                }
              });


              // this.bagProService.srvObtenerListaProcExtrusionFechasOT(fechaInicial, fechaInicial, ot).subscribe(datos_ot => {
              //   for (let i = 0; i < datos_ot.length; i++) {
              //     this.dtPreEntRollosService.srvObtenerVerificarRollo(datos_ot[i].item).subscribe(datos_rollos => {
              //       if (datos_rollos.length == 0 && datos_ot[i].nomStatus == 'EMPAQUE') {
              //         if (!RollosConsultados.includes(datos_ot[i].item)){
              //           if (datos_ot[i].nomStatus == 'EXTRUSION') proceso = 'EXT'
              //           if (datos_ot[i].nomStatus == 'IMPRESION') proceso = 'IMP'
              //           if (datos_ot[i].nomStatus == 'ROTOGRABADO') proceso = 'ROT'
              //           if (datos_ot[i].nomStatus == 'DOBLADO') proceso = 'DBLD'
              //           if (datos_ot[i].nomStatus == 'LAMINADO') proceso = 'LAM'
              //           if (datos_ot[i].nomStatus == 'CORTE') proceso = 'CORTE'
              //           if (datos_ot[i].nomStatus == 'EMPAQUE') proceso = 'EMP'
              //           if (datos_ot[i].nomStatus == 'SELLADO') proceso = 'SELLA'
              //           if (datos_ot[i].nomStatus == 'Wiketiado') proceso = 'WIKE'
              //           let info : any = {
              //             Ot : datos_ot[i].ot,
              //             Id : datos_ot[i].item,
              //             IdCliente : datos_ot[i].identNro,
              //             Cliente : datos_ot[i].nombreComercial,
              //             IdProducto : datos_ot[i].clienteItem,
              //             Producto : datos_ot[i].clienteItemNombre,
              //             Cantidad : datos_ot[i].extnetokg,
              //             Presentacion : datos_ot[i].unidad,
              //             Estatus : datos_ot[i].nomStatus,
              //             Proceso : proceso,
              //           }
              //           if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
              //           otTemporral = datos_ot[i].ot;
              //           this.rollos.push(info);
              //           RollosConsultados.push(datos_ot[i].item);
              //           this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
              //           this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
              //           this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
              //           this.FormConsultarRollos.setValue({
              //             OT_Id: ot,
              //             fechaDoc : this.FormConsultarRollos.value.fechaDoc,
              //             fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
              //             Observacion : this.FormConsultarRollos.value.Observacion,
              //             Proceso : this.FormConsultarRollos.value.Proceso,
              //           });
              //         }
              //       }
              //     });
              //   }
              // });
            } else if (ProcConsulta == "2") {
              this.bagProService.srvObtenerListaProcSelladoFechasOT(fechaInicial, fechaInicial, ot).subscribe(datos_ot => {
                for (let i = 0; i < datos_ot.length; i++) {
                  if (!rollos.includes(datos_ot[i].item) && datos_ot[i].nomStatus == 'SELLADO') {
                    this.idProducto = datos_ot[i].referencia;
                    if (datos_ot[i].unidad == 'UND') this.presentacionProducto = 'Und';
                    if (datos_ot[i].unidad == 'PAQ') this.presentacionProducto = 'Paquete';
                    if (datos_ot[i].unidad == 'KLS') this.presentacionProducto = 'Kg';
                    if (datos_ot[i].nomStatus == 'SELLADO') proceso = 'SELLA'
                    let info : any = {
                      Ot : datos_ot[i].ot,
                      Id : datos_ot[i].item,
                      IdCliente : datos_ot[i].identNro,
                      Cliente : datos_ot[i].nombreComercial,
                      IdProducto : datos_ot[i].referencia,
                      Producto : datos_ot[i].nomReferencia,
                      Cantidad : datos_ot[i].qty,
                      Presentacion : this.presentacionProducto,
                      Estatus : datos_ot[i].nomStatus,
                      Proceso : proceso,
                    }
                    this.rollos.push(info);
                    rollos.push(datos_ot[i].item)
                    RollosConsultados.push(datos_ot[i].item);
                    this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
                    this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
                    this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
                    this.FormConsultarRollos.setValue({
                      OT_Id: ot,
                      fechaDoc : this.FormConsultarRollos.value.fechaDoc,
                      fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
                      Observacion : this.FormConsultarRollos.value.Observacion,
                      Proceso : this.FormConsultarRollos.value.Proceso,
                    });
                    this.cargando = true;
                  }
                }
              });

              // this.bagProService.srvObtenerListaProcSelladoFechasOT(fechaInicial, fechaInicial, ot).subscribe(datos_ot => {
              //   for (let i = 0; i < datos_ot.length; i++) {
              //     this.dtPreEntRollosService.srvObtenerVerificarRollo(datos_ot[i].item).subscribe(datos_rollos => {
              //       if (datos_rollos.length == 0) {

              //           if (!RollosConsultados.includes(datos_ot[i].item)){
              //             this.idProducto = datos_ot[i].referencia;
              //             if (datos_ot[i].unidad == 'UND') this.presentacionProducto = 'Und';
              //             if (datos_ot[i].unidad == 'PAQ') this.presentacionProducto = 'Paquete';
              //             if (datos_ot[i].unidad == 'KLS') this.presentacionProducto = 'Kg';
              //             if (datos_ot[i].nomStatus == 'SELLADO') proceso = 'SELLA'
              //             let info : any = {
              //               Ot : datos_ot[i].ot,
              //               Id : datos_ot[i].item,
              //               IdCliente : datos_ot[i],
              //               Cliente : datos_ot[i],
              //               IdProducto : datos_ot[i].referencia,
              //               Producto : datos_ot[i].nomReferencia,
              //               Cantidad : datos_ot[i].qty,
              //               Presentacion : this.presentacionProducto,
              //               Estatus : datos_ot[i].nomStatus,
              //               Proceso : proceso,
              //             }
              //             if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
              //             otTemporral = datos_ot[i].ot;
              //             this.rollos.push(info);
              //             RollosConsultados.push(datos_ot[i].item);
              //             this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
              //             this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
              //             this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
              //             this.FormConsultarRollos.setValue({
              //               OT_Id: ot,
              //               fechaDoc : this.FormConsultarRollos.value.fechaDoc,
              //               fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
              //               Observacion : this.FormConsultarRollos.value.Observacion,
              //               Proceso : this.FormConsultarRollos.value.Proceso,
              //             });
              //           }
              //       }
              //     });
              //   }
              // });
            }
          } else if (fechaInicial != null) {
            if (ProcConsulta == "1"){
              this.bagProService.srvObtenerListaProcExtrusionFechas(fechaInicial, fechaInicial).subscribe(datos_ot => {
                for (let i = 0; i < datos_ot.length; i++) {
                  if (datos_ot[i].nomStatus == 'EMPAQUE') {
                    if (!rollos.includes(datos_ot[i].item)) {
                      if (datos_ot[i].nomStatus == 'EMPAQUE') proceso = 'EMP'
                      let info : any = {
                        Ot : datos_ot[i].ot,
                        Id : datos_ot[i].item,
                        IdCliente : datos_ot[i].identNro,
                        Cliente : datos_ot[i].nombreComercial,
                        IdProducto : datos_ot[i].clienteItem,
                        Producto : datos_ot[i].clienteItemNombre,
                        Cantidad : datos_ot[i].extnetokg,
                        Presentacion : datos_ot[i].unidad,
                        Estatus : datos_ot[i].nomStatus,
                        Proceso : proceso,
                      }
                      if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
                      otTemporral = datos_ot[i].ot;
                      this.rollos.push(info);
                      RollosConsultados.push(datos_ot[i].item);
                      rollos.push(datos_ot[i].item);
                      this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
                      this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
                      this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
                      this.FormConsultarRollos.setValue({
                        OT_Id: ot,
                        fechaDoc : this.FormConsultarRollos.value.fechaDoc,
                        fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
                        Observacion : this.FormConsultarRollos.value.Observacion,
                        Proceso : this.FormConsultarRollos.value.Proceso,
                      });
                    }
                  }
                }
              });

              // this.bagProService.srvObtenerListaProcExtrusionFechas(fechaInicial, fechaInicial).subscribe(datos_ot => {
              //   for (let i = 0; i < datos_ot.length; i++) {
              //     this.dtPreEntRollosService.srvObtenerVerificarRollo(datos_ot[i].item).subscribe(datos_rollos => {
              //       if (datos_rollos.length == 0 && datos_ot[i].nomStatus == 'EMPAQUE') {
              //         if (!RollosConsultados.includes(datos_ot[i].item)){
              //           if (datos_ot[i].nomStatus == 'EXTRUSION') proceso = 'EXT'
              //           if (datos_ot[i].nomStatus == 'IMPRESION') proceso = 'IMP'
              //           if (datos_ot[i].nomStatus == 'ROTOGRABADO') proceso = 'ROT'
              //           if (datos_ot[i].nomStatus == 'DOBLADO') proceso = 'DBLD'
              //           if (datos_ot[i].nomStatus == 'LAMINADO') proceso = 'LAM'
              //           if (datos_ot[i].nomStatus == 'CORTE') proceso = 'CORTE'
              //           if (datos_ot[i].nomStatus == 'EMPAQUE') proceso = 'EMP'
              //           if (datos_ot[i].nomStatus == 'SELLADO') proceso = 'SELLA'
              //           if (datos_ot[i].nomStatus == 'Wiketiado') proceso = 'WIKE'
              //           let info : any = {
              //             Ot : datos_ot[i].ot,
              //             Id : datos_ot[i].item,
              //             IdCliente : datos_ot[i].identNro,
              //             Cliente : datos_ot[i].nombreComercial,
              //             IdProducto : datos_ot[i].clienteItem,
              //             Producto : datos_ot[i].clienteItemNombre,
              //             Cantidad : datos_ot[i].extnetokg,
              //             Presentacion : datos_ot[i].unidad,
              //             Estatus : datos_ot[i].nomStatus,
              //             Proceso : proceso,
              //           }
              //           if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
              //           otTemporral = datos_ot[i].ot;
              //           this.rollos.push(info);
              //           RollosConsultados.push(datos_ot[i].item);
              //           this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
              //           this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
              //           this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
              //           this.FormConsultarRollos.setValue({
              //             OT_Id: ot,
              //             fechaDoc : this.FormConsultarRollos.value.fechaDoc,
              //             fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
              //             Observacion : this.FormConsultarRollos.value.Observacion,
              //             Proceso : this.FormConsultarRollos.value.Proceso,
              //           });
              //         }
              //       }
              //     });
              //   }
              // });
            } else if (ProcConsulta == "2") {
              this.bagProService.srvObtenerListaProcSelladoFechas(fechaInicial, fechaInicial).subscribe(datos_ot => {
                for (let i = 0; i < datos_ot.length; i++) {
                  if (!rollos.includes(datos_ot[i].item) && datos_ot[i].nomStatus == 'SELLADO') {
                    this.idProducto = datos_ot[i].referencia;
                    if (datos_ot[i].unidad == 'UND') this.presentacionProducto = 'Und';
                    if (datos_ot[i].unidad == 'PAQ') this.presentacionProducto = 'Paquete';
                    if (datos_ot[i].unidad == 'KLS') this.presentacionProducto = 'Kg';
                    if (datos_ot[i].nomStatus == 'SELLADO') proceso = 'SELLA'
                    let info : any = {
                      Ot : datos_ot[i].ot,
                      Id : datos_ot[i].item,
                      IdCliente : datos_ot[i].identNro,
                      Cliente : datos_ot[i].nombreComercial,
                      IdProducto : datos_ot[i].referencia,
                      Producto : datos_ot[i].nomReferencia,
                      Cantidad : datos_ot[i].qty,
                      Presentacion : this.presentacionProducto,
                      Estatus : datos_ot[i].nomStatus,
                      Proceso : proceso,
                    }
                    this.rollos.push(info);
                    rollos.push(datos_ot[i].item)
                    RollosConsultados.push(datos_ot[i].item);
                    this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
                    this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
                    this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
                    this.FormConsultarRollos.setValue({
                      OT_Id: ot,
                      fechaDoc : this.FormConsultarRollos.value.fechaDoc,
                      fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
                      Observacion : this.FormConsultarRollos.value.Observacion,
                      Proceso : this.FormConsultarRollos.value.Proceso,
                    });
                    this.cargando = true;
                  }
                }
              });

              // this.bagProService.srvObtenerListaProcSelladoFechas(fechaInicial, fechaInicial).subscribe(datos_ot => {
              //   for (let i = 0; i < datos_ot.length; i++) {
              //     this.dtPreEntRollosService.srvObtenerVerificarRollo(datos_ot[i].item).subscribe(datos_rollos => {
              //       if (datos_rollos.length == 0) {
              //         if (!RollosConsultados.includes(datos_ot[i].item)){
              //           this.idProducto = datos_ot[i].referencia;
              //           if (datos_ot[i].unidad == 'UND') this.presentacionProducto = 'Und';
              //           if (datos_ot[i].unidad == 'PAQ') this.presentacionProducto = 'Paquete';
              //           if (datos_ot[i].unidad == 'KLS') this.presentacionProducto = 'Kg';
              //           if (datos_ot[i].nomStatus == 'EXTRUSION') proceso = 'EXT'
              //           if (datos_ot[i].nomStatus == 'IMPRESION') proceso = 'IMP'
              //           if (datos_ot[i].nomStatus == 'ROTOGRABADO') proceso = 'ROT'
              //           if (datos_ot[i].nomStatus == 'DOBLADO') proceso = 'DBLD'
              //           if (datos_ot[i].nomStatus == 'LAMINADO') proceso = 'LAM'
              //           if (datos_ot[i].nomStatus == 'CORTE') proceso = 'CORTE'
              //           if (datos_ot[i].nomStatus == 'EMPAQUE') proceso = 'EMP'
              //           if (datos_ot[i].nomStatus == 'SELLADO') proceso = 'SELLA'
              //           if (datos_ot[i].nomStatus == 'Wiketiado') proceso = 'WIKE'
              //           let info : any = {
              //             Ot : datos_ot[i].ot,
              //             Id : datos_ot[i].item,
              //             IdCliente : datos_ot[i].identNro,
              //             Cliente : datos_ot[i].nombreComercial,
              //             IdProducto : datos_ot[i].referencia,
              //             Producto : datos_ot[i].nomReferencia,
              //             Cantidad : datos_ot[i].qty,
              //             Presentacion : this.presentacionProducto,
              //             Estatus : datos_ot[i].nomStatus,
              //             Proceso : proceso,
              //           }
              //           if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
              //           otTemporral = datos_ot[i].ot;
              //           this.rollos.push(info);
              //           RollosConsultados.push(datos_ot[i].item);
              //           this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
              //           this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
              //           this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
              //           this.FormConsultarRollos.setValue({
              //             OT_Id: ot,
              //             fechaDoc : this.FormConsultarRollos.value.fechaDoc,
              //             fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
              //             Observacion : this.FormConsultarRollos.value.Observacion,
              //             Proceso : this.FormConsultarRollos.value.Proceso,
              //           });
              //         }
              //       }
              //     });
              //   }
              // });
            }
          } else if (ot != null) {
            if (ProcConsulta == "1"){
              this.bagProService.srvObtenerListaProcExtrusionRollosOT(ot).subscribe(datos_ot => {
                for (let i = 0; i < datos_ot.length; i++) {
                  if (datos_ot[i].nomStatus == 'EMPAQUE') {
                    if (!rollos.includes(datos_ot[i].item)) {
                      if (datos_ot[i].nomStatus == 'EMPAQUE') proceso = 'EMP'
                      let info : any = {
                        Ot : datos_ot[i].ot,
                        Id : datos_ot[i].item,
                        IdCliente : datos_ot[i].identNro,
                        Cliente : datos_ot[i].nombreComercial,
                        IdProducto : datos_ot[i].clienteItem,
                        Producto : datos_ot[i].clienteItemNombre,
                        Cantidad : datos_ot[i].extnetokg,
                        Presentacion : datos_ot[i].unidad,
                        Estatus : datos_ot[i].nomStatus,
                        Proceso : proceso,
                      }
                      if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
                      otTemporral = datos_ot[i].ot;
                      this.rollos.push(info);
                      RollosConsultados.push(datos_ot[i].item);
                      rollos.push(datos_ot[i].item);
                      this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
                      this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
                      this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
                      this.FormConsultarRollos.setValue({
                        OT_Id: ot,
                        fechaDoc : this.FormConsultarRollos.value.fechaDoc,
                        fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
                        Observacion : this.FormConsultarRollos.value.Observacion,
                        Proceso : this.FormConsultarRollos.value.Proceso,
                      });
                    }
                  }
                }
              });

              // this.bagProService.srvObtenerListaProcExtrusionRollosOT(ot).subscribe(datos_ot => {
              //   for (let i = 0; i < datos_ot.length; i++) {
              //     this.dtPreEntRollosService.srvObtenerVerificarRollo(datos_ot[i].item).subscribe(datos_rollos => {
              //       if (datos_rollos.length == 0 && datos_ot[i].nomStatus == 'EMPAQUE') {
              //         if (!RollosConsultados.includes(datos_ot[i].item)){
              //           if (datos_ot[i].nomStatus == 'EXTRUSION') proceso = 'EXT'
              //           if (datos_ot[i].nomStatus == 'IMPRESION') proceso = 'IMP'
              //           if (datos_ot[i].nomStatus == 'ROTOGRABADO') proceso = 'ROT'
              //           if (datos_ot[i].nomStatus == 'DOBLADO') proceso = 'DBLD'
              //           if (datos_ot[i].nomStatus == 'LAMINADO') proceso = 'LAM'
              //           if (datos_ot[i].nomStatus == 'CORTE') proceso = 'CORTE'
              //           if (datos_ot[i].nomStatus == 'EMPAQUE') proceso = 'EMP'
              //           if (datos_ot[i].nomStatus == 'SELLADO') proceso = 'SELLA'
              //           if (datos_ot[i].nomStatus == 'Wiketiado') proceso = 'WIKE'
              //           let info : any = {
              //             Ot : datos_ot[i].ot,
              //             Id : datos_ot[i].item,
              //             IdCliente : datos_ot[i].identNro,
              //             Cliente : datos_ot[i].nombreComercial,
              //             IdProducto : datos_ot[i].clienteItem,
              //             Producto : datos_ot[i].clienteItemNombre,
              //             Cantidad : datos_ot[i].extnetokg,
              //             Presentacion : datos_ot[i].unidad,
              //             Estatus : datos_ot[i].nomStatus,
              //             Proceso : proceso,
              //           }
              //           if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
              //           otTemporral = datos_ot[i].ot;
              //           this.rollos.push(info);
              //           RollosConsultados.push(datos_ot[i].item);
              //           this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
              //           this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
              //           this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
              //           this.FormConsultarRollos.setValue({
              //             OT_Id: ot,
              //             fechaDoc : this.FormConsultarRollos.value.fechaDoc,
              //             fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
              //             Observacion : this.FormConsultarRollos.value.Observacion,
              //             Proceso : this.FormConsultarRollos.value.Proceso,
              //           });
              //         }
              //       }
              //     });
              //   }
              // });
            } else if (ProcConsulta == "2") {
              this.bagProService.srvObtenerListaProcSelladoRollosOT(ot).subscribe(datos_ot => {
                for (let i = 0; i < datos_ot.length; i++) {
                  if (!rollos.includes(datos_ot[i].item) && datos_ot[i].nomStatus == 'SELLADO') {
                    this.idProducto = datos_ot[i].referencia;
                    if (datos_ot[i].unidad == 'UND') this.presentacionProducto = 'Und';
                    if (datos_ot[i].unidad == 'PAQ') this.presentacionProducto = 'Paquete';
                    if (datos_ot[i].unidad == 'KLS') this.presentacionProducto = 'Kg';
                    if (datos_ot[i].nomStatus == 'SELLADO') proceso = 'SELLA'
                    let info : any = {
                      Ot : datos_ot[i].ot,
                      Id : datos_ot[i].item,
                      IdCliente : datos_ot[i].identNro,
                      Cliente : datos_ot[i].nombreComercial,
                      IdProducto : datos_ot[i].referencia,
                      Producto : datos_ot[i].nomReferencia,
                      Cantidad : datos_ot[i].qty,
                      Presentacion : this.presentacionProducto,
                      Estatus : datos_ot[i].nomStatus,
                      Proceso : proceso,
                    }
                    this.rollos.push(info);
                    rollos.push(datos_ot[i].item)
                    RollosConsultados.push(datos_ot[i].item);
                    this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
                    this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
                    this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
                    this.FormConsultarRollos.setValue({
                      OT_Id: ot,
                      fechaDoc : this.FormConsultarRollos.value.fechaDoc,
                      fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
                      Observacion : this.FormConsultarRollos.value.Observacion,
                      Proceso : this.FormConsultarRollos.value.Proceso,
                    });
                    this.cargando = true;
                  }
                }
              });

              // this.bagProService.srvObtenerListaProcSelladoRollosOT(ot).subscribe(datos_ot => {
              //   for (let i = 0; i < datos_ot.length; i++) {
              //     this.dtPreEntRollosService.srvObtenerVerificarRollo(datos_ot[i].item).subscribe(datos_rollos => {
              //       if (datos_rollos.length == 0) {
              //         if (!RollosConsultados.includes(datos_ot[i].item)){
              //           this.idProducto = datos_ot[i].referencia;
              //           if (datos_ot[i].unidad == 'UND') this.presentacionProducto = 'Und';
              //           if (datos_ot[i].unidad == 'PAQ') this.presentacionProducto = 'Paquete';
              //           if (datos_ot[i].unidad == 'KLS') this.presentacionProducto = 'Kg';
              //           if (datos_ot[i].nomStatus == 'EXTRUSION') proceso = 'EXT'
              //           if (datos_ot[i].nomStatus == 'IMPRESION') proceso = 'IMP'
              //           if (datos_ot[i].nomStatus == 'ROTOGRABADO') proceso = 'ROT'
              //           if (datos_ot[i].nomStatus == 'DOBLADO') proceso = 'DBLD'
              //           if (datos_ot[i].nomStatus == 'LAMINADO') proceso = 'LAM'
              //           if (datos_ot[i].nomStatus == 'CORTE') proceso = 'CORTE'
              //           if (datos_ot[i].nomStatus == 'EMPAQUE') proceso = 'EMP'
              //           if (datos_ot[i].nomStatus == 'SELLADO') proceso = 'SELLA'
              //           if (datos_ot[i].nomStatus == 'Wiketiado') proceso = 'WIKE'
              //           let info : any = {
              //             Ot : datos_ot[i].ot,
              //             Id : datos_ot[i].item,
              //             IdCliente : datos_ot[i].identNro,
              //             Cliente : datos_ot[i].nombreComercial,
              //             IdProducto : datos_ot[i].referencia,
              //             Producto : datos_ot[i].nomReferencia,
              //             Cantidad : datos_ot[i].qty,
              //             Presentacion : this.presentacionProducto,
              //             Estatus : datos_ot[i].nomStatus,
              //             Proceso : proceso,
              //             exits : false,
              //           }
              //           if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
              //           otTemporral = datos_ot[i].ot;
              //           this.rollos.push(info);
              //           RollosConsultados.push(datos_ot[i].item);
              //           this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
              //           this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
              //           this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
              //           this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
              //           this.FormConsultarRollos.setValue({
              //             OT_Id: this.FormConsultarRollos.value.OT_Id,
              //             fechaDoc : this.FormConsultarRollos.value.fechaDoc,
              //             fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
              //             Observacion : this.FormConsultarRollos.value.Observacion,
              //             Proceso : '1',
              //           });
              //         }
              //       }
              //     });
              //   }
              // });
            }
          } else {
            if (ProcConsulta == "1"){
              this.bagProService.srvObtenerListaProcExtrusionFechas(this.today, this.today).subscribe(datos_ot => {
                for (let i = 0; i < datos_ot.length; i++) {
                  if (datos_ot[i].nomStatus == 'EMPAQUE') {
                    if (!rollos.includes(datos_ot[i].item)) {
                      if (datos_ot[i].nomStatus == 'EMPAQUE') proceso = 'EMP'
                      let info : any = {
                        Ot : datos_ot[i].ot,
                        Id : datos_ot[i].item,
                        IdCliente : datos_ot[i].identNro,
                        Cliente : datos_ot[i].nombreComercial,
                        IdProducto : datos_ot[i].clienteItem,
                        Producto : datos_ot[i].clienteItemNombre,
                        Cantidad : datos_ot[i].extnetokg,
                        Presentacion : datos_ot[i].unidad,
                        Estatus : datos_ot[i].nomStatus,
                        Proceso : proceso,
                      }
                      if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
                      otTemporral = datos_ot[i].ot;
                      this.rollos.push(info);
                      RollosConsultados.push(datos_ot[i].item);
                      rollos.push(datos_ot[i].item);
                      this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
                      this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
                      this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
                      this.FormConsultarRollos.setValue({
                        OT_Id: ot,
                        fechaDoc : this.FormConsultarRollos.value.fechaDoc,
                        fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
                        Observacion : this.FormConsultarRollos.value.Observacion,
                        Proceso : this.FormConsultarRollos.value.Proceso,
                      });
                    }
                  }
                }
              });

              // this.bagProService.srvObtenerListaProcExtrusionFechas(this.today, this.today).subscribe(datos_ot => {
              //   for (let i = 0; i < datos_ot.length; i++) {
              //     this.dtPreEntRollosService.srvObtenerVerificarRollo(datos_ot[i].item).subscribe(datos_rollos => {
              //       if (datos_rollos.length == 0 && datos_ot[i].nomStatus == 'EMPAQUE') {
              //         if (!RollosConsultados.includes(datos_ot[i].item)){
              //           if (datos_ot[i].nomStatus == 'EXTRUSION') proceso = 'EXT'
              //           if (datos_ot[i].nomStatus == 'IMPRESION') proceso = 'IMP'
              //           if (datos_ot[i].nomStatus == 'ROTOGRABADO') proceso = 'ROT'
              //           if (datos_ot[i].nomStatus == 'DOBLADO') proceso = 'DBLD'
              //           if (datos_ot[i].nomStatus == 'LAMINADO') proceso = 'LAM'
              //           if (datos_ot[i].nomStatus == 'CORTE') proceso = 'CORTE'
              //           if (datos_ot[i].nomStatus == 'EMPAQUE') proceso = 'EMP'
              //           if (datos_ot[i].nomStatus == 'SELLADO') proceso = 'SELLA'
              //           if (datos_ot[i].nomStatus == 'Wiketiado') proceso = 'WIKE'
              //           let info : any = {
              //             Ot : datos_ot[i].ot,
              //             Id : datos_ot[i].item,
              //             IdCliente : datos_ot[i].identNro,
              //             Cliente : datos_ot[i].nombreComercial,
              //             IdProducto : datos_ot[i].clienteItem,
              //             Producto : datos_ot[i].clienteItemNombre,
              //             Cantidad : datos_ot[i].extnetokg,
              //             Presentacion : datos_ot[i].unidad,
              //             Estatus : datos_ot[i].nomStatus,
              //             Proceso : proceso,
              //           }
              //           if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
              //           otTemporral = datos_ot[i].ot;
              //           this.rollos.push(info);
              //           RollosConsultados.push(datos_ot[i].item);
              //           this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
              //           this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
              //           this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
              //           this.FormConsultarRollos.setValue({
              //             OT_Id: ot,
              //             fechaDoc : this.FormConsultarRollos.value.fechaDoc,
              //             fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
              //             Observacion : this.FormConsultarRollos.value.Observacion,
              //             Proceso : this.FormConsultarRollos.value.Proceso,
              //           });
              //         }
              //       }
              //     });
              //   }
              // });
            } else if (ProcConsulta == "2") {
              this.bagProService.srvObtenerListaProcSelladoFechas(this.today, this.today).subscribe(datos_ot => {
                for (let i = 0; i < datos_ot.length; i++) {
                  if (!rollos.includes(datos_ot[i].item) && datos_ot[i].nomStatus == 'SELLADO') {
                    this.idProducto = datos_ot[i].referencia;
                    if (datos_ot[i].unidad == 'UND') this.presentacionProducto = 'Und';
                    if (datos_ot[i].unidad == 'PAQ') this.presentacionProducto = 'Paquete';
                    if (datos_ot[i].unidad == 'KLS') this.presentacionProducto = 'Kg';
                    if (datos_ot[i].nomStatus == 'SELLADO') proceso = 'SELLA'
                    let info : any = {
                      Ot : datos_ot[i].ot,
                      Id : datos_ot[i].item,
                      IdCliente : datos_ot[i].identNro,
                      Cliente : datos_ot[i].nombreComercial,
                      IdProducto : datos_ot[i].referencia,
                      Producto : datos_ot[i].nomReferencia,
                      Cantidad : datos_ot[i].qty,
                      Presentacion : this.presentacionProducto,
                      Estatus : datos_ot[i].nomStatus,
                      Proceso : proceso,
                    }
                    this.rollos.push(info);
                    rollos.push(datos_ot[i].item)
                    RollosConsultados.push(datos_ot[i].item);
                    this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
                    this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
                    this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
                    this.FormConsultarRollos.setValue({
                      OT_Id: ot,
                      fechaDoc : this.FormConsultarRollos.value.fechaDoc,
                      fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
                      Observacion : this.FormConsultarRollos.value.Observacion,
                      Proceso : this.FormConsultarRollos.value.Proceso,
                    });
                    this.cargando = true;
                  }
                }
              });

              // this.bagProService.srvObtenerListaProcSelladoFechas(this.today, this.today).subscribe(datos_ot => {
              //   for (let i = 0; i < datos_ot.length; i++) {
              //     this.dtPreEntRollosService.srvObtenerVerificarRollo(datos_ot[i].item).subscribe(datos_rollos => {
              //       if (datos_rollos.length == 0) {
              //         if (!RollosConsultados.includes(datos_ot[i].item)){
              //           this.idProducto = datos_ot[i].referencia;
              //           if (datos_ot[i].unidad == 'UND') this.presentacionProducto = 'Und';
              //           if (datos_ot[i].unidad == 'PAQ') this.presentacionProducto = 'Paquete';
              //           if (datos_ot[i].unidad == 'KLS') this.presentacionProducto = 'Kg';
              //           if (datos_ot[i].nomStatus == 'EXTRUSION') proceso = 'EXT'
              //           if (datos_ot[i].nomStatus == 'IMPRESION') proceso = 'IMP'
              //           if (datos_ot[i].nomStatus == 'ROTOGRABADO') proceso = 'ROT'
              //           if (datos_ot[i].nomStatus == 'DOBLADO') proceso = 'DBLD'
              //           if (datos_ot[i].nomStatus == 'LAMINADO') proceso = 'LAM'
              //           if (datos_ot[i].nomStatus == 'CORTE') proceso = 'CORTE'
              //           if (datos_ot[i].nomStatus == 'EMPAQUE') proceso = 'EMP'
              //           if (datos_ot[i].nomStatus == 'SELLADO') proceso = 'SELLA'
              //           if (datos_ot[i].nomStatus == 'Wiketiado') proceso = 'WIKE'
              //           let info : any = {
              //             Ot : datos_ot[i].ot,
              //             Id : datos_ot[i].item,
              //             IdCliente : datos_ot[i].identNro,
              //             Cliente : datos_ot[i].nombreComercial,
              //             IdProducto : datos_ot[i].referencia,
              //             Producto : datos_ot[i].nomReferencia,
              //             Cantidad : datos_ot[i].qty,
              //             Presentacion : this.presentacionProducto,
              //             Estatus : datos_ot[i].nomStatus,
              //             Proceso : proceso,
              //           }
              //           if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
              //           otTemporral = datos_ot[i].ot;
              //           this.rollos.push(info);
              //           RollosConsultados.push(datos_ot[i].item);
              //           this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
              //           this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
              //           this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
              //           this.FormConsultarRollos.setValue({
              //             OT_Id: ot,
              //             fechaDoc : this.FormConsultarRollos.value.fechaDoc,
              //             fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
              //             Observacion : this.FormConsultarRollos.value.Observacion,
              //             Proceso : this.FormConsultarRollos.value.Proceso,
              //           });
              //         }
              //       }
              //     });
              //   }
              // });
            }
          }
        }, 2000);
        setTimeout(() => {
          if (this.rollos.length <= 0) Swal.fire(`No hay rollos por ingresar`);
          this.cargando = true;
        }, 10000);
      } else Swal.fire("¡La fecha seleccionada no es valida!");
    } else Swal.fire("¡Seleccione un proceso!");
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
    setTimeout(() => { this.GrupoProductos(); }, 500);
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
    setTimeout(() => { this.rollos = []; }, 500);
    setTimeout(() => { this.GrupoProductos(); }, 500);
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
    setTimeout(() => { this.GrupoProductos(); }, 500);
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
    setTimeout(() => { this.GrupoProductos(); }, 500);
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
          Rollos: this.formatonumeros(cantRollo.toFixed(2)),
          Presentacion : this.rollosInsertar[i].Presentacion,
        }
        this.grupoProductos.push(info);
      }
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
        PreEntRollo_Hora : this.hora,
      }
      this.preEntRollosService.srvGuardar(info).subscribe(datos_entradaRollo => {
        this.preEntRollosService.srvObtenerUltimoId().subscribe(datos_ultEntrada => { this.ingresarRollos(datos_entradaRollo.preEntRollo_Id); });
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
          title: '¡Error al ingresar los rollos!'
        });
        this.cargando = true;
      });
    }
  }

  // Funcion par ingresar los rollos
  ingresarRollos(idEntrada : number){
    for (let i = 0; i < this.rollosInsertar.length; i++) {
      let info : any = {
        Rollo_Id : this.rollosInsertar[i].Id,
        DtlPreEntRollo_Cantidad : this.rollosInsertar[i].Cantidad,
        UndMed_Rollo : this.rollosInsertar[i].Presentacion,
        Proceso_Id : this.rollosInsertar[i].Proceso,
        Cli_Id : 1,
        DtlPreEntRollo_OT : parseInt(this.rollosInsertar[i].Ot.trim()),
        Prod_Id : parseInt(this.rollosInsertar[i].IdProducto.trim()),
        UndMed_Producto : this.rollosInsertar[i].Presentacion,
        preEntRollo_Id : idEntrada,
      }
      this.dtPreEntRollosService.srvGuardar(info).subscribe(datos_entrada => {  }, error => {
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
          title: '¡Error al ingresar los rollos!'
        });
        this.cargando = true;
      });
    }
    if (this.rollosInsertar.length > 1000) {
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
        this.buscarRolloPDF(idEntrada);
      }, 60000);
    }  else if (this.rollosInsertar.length > 600) {
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
        this.buscarRolloPDF(idEntrada);
      }, 30000);
    } else if (this.rollosInsertar.length > 500) {
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
        this.buscarRolloPDF(idEntrada);
      }, 20000);
    } else if (this.rollosInsertar.length > 400) {
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
        this.buscarRolloPDF(idEntrada);
      }, 15000);
    } else if (this.rollosInsertar.length > 250) {
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
        this.buscarRolloPDF(idEntrada);
      }, 10000);
    } else if (this.rollosInsertar.length > 100) {
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
        this.buscarRolloPDF(idEntrada);
      }, 6000);
    } else {
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
        this.buscarRolloPDF(idEntrada);
      }, 3000);
    }
  }

  // Funcion que creará un pdf a base de la informacion ingresada en las asignacion de rollos a facturas
  crearPDF(id : number){
    this.dtPreEntRollosService.srvCrearPDFUltimoId(id).subscribe(datos_factura => {
      for (let i = 0; i < datos_factura.length; i++) {
        for (let j = 0; j < this.rollosAsignados.length; j++) {
          let CantTotal : string = `${this.Total}`;
          let cantidadAsignadaNueva = CantTotal.indexOf(",");
          let cantidadAsignadaFinal = CantTotal.substring(0, (cantidadAsignadaNueva + 3));
          const pdfDefinicion : any = {
            info: {
              title: `${datos_factura[i].preEntRollo_Id}`
            },
            pageSize: {
              width: 630,
              height: 760
            },
            content : [
              {
                text: `Pre Cargue de Rollos`,
                alignment: 'right',
                style: 'titulo',
              },
              '\n \n',
              {
                style: 'tablaEmpresa',
                table: {
                  widths: [90, '*', 90, '*'],
                  style: 'header',
                  body: [
                    [
                      {
                        border: [false, false, false, false],
                        text: `Nombre Empresa`
                      },
                      {
                        border: [false, false, false, true],
                        text: `Plasticaribe S.A.S`
                      },
                      {
                        border: [false, false, false, false],
                        text: `Fecha`
                      },
                      {
                        border: [false, false, false, true],
                        text: `${datos_factura[i].preEntRollo_Fecha.replace('T00:00:00', '')}`
                      },
                    ],
                    [
                      {
                        border: [false, false, false, false],
                        text: `Dirección`
                      },
                      {
                        border: [false, false, false, true],
                        text: `${datos_factura[i].empresa_Direccion}`
                      },
                      {
                        border: [false, false, false, false],
                        text: `Ciudad`
                      },
                      {
                        border: [false, false, false, true],
                        text: `${datos_factura[i].empresa_Ciudad}`
                      },
                    ],
                    [
                      {
                        border: [false, false, false, false],
                        text: `Proceso`
                      },
                      {
                        border: [false, false, false, true],
                        text: `${datos_factura[i].proceso_Nombre}`
                      },
                      {
                        border: [false, false, false, false],
                        text: ``
                      },
                      {
                        border: [false, false, false, true],
                        text: ``
                      },
                    ],
                  ]
                },
                layout: {
                  defaultBorder: false,
                },
                fontSize: 9,
              },
              '\n \n',
              {
                text: `Pre Cargado Por: ${datos_factura[i].usua_Nombre}\n`,
                alignment: 'left',
                style: 'header',
              },
              '\n \n',
              {
                text: `Consolidado de producto(s) \n `,
                alignment: 'center',
                style: 'header'
              },
              this.table2(this.grupoProductos, ['Id', 'Nombre', 'Cantidad', 'Rollos', 'Presentacion']),
              {
                text: ` \n  \n Información detallada de los Rollos \n `,
                alignment: 'center',
                style: 'header'
              },

              this.table(this.rollosAsignados, ['OT', 'Rollo', 'Producto', 'Nombre', 'Cantidad', 'Presentacion']),
              {
                text: `\nCant. Total: ${this.formatonumeros(this.Total.toFixed(2))}\n`,
                alignment: 'right',
                style: 'header',
              },
            ],
            styles: {
              header: {
                fontSize: 10,
                bold: true
              },
              titulo: {
                fontSize: 20,
                bold: true
              }
            }
          }
          const pdf = pdfMake.createPdf(pdfDefinicion);
          pdf.open();
          this.limpiarCampos();
          break;
        }
        break;
      }
    });
  }

  // Funcion que traerá los rollos que fueron asignados a la factura creada
  buscarRolloPDF(id : number){
    this.dtPreEntRollosService.srvCrearPDFUltimoId(id).subscribe(datos_factura => {
      for (let i = 0; i < datos_factura.length; i++) {
        let info : any = {
          OT : datos_factura[i].dtlPreEntRollo_OT,
          Rollo : datos_factura[i].rollo_Id,
          IdCliente : datos_factura[i].cli_Id,
          Cliente : datos_factura[i].cli_Nombre,
          Producto : datos_factura[i].prod_Id,
          Nombre : datos_factura[i].prod_Nombre,
          Cantidad : this.formatonumeros(datos_factura[i].dtlPreEntRollo_Cantidad),
          Presentacion : datos_factura[i].undMed_Rollo,
        }
        this.Total += datos_factura[i].dtlPreEntRollo_Cantidad;
        this.rollosAsignados.push(info);
        this.rollosAsignados.sort((a,b) => Number(a.Rollo) - Number(b.Rollo));
      }
    });
    setTimeout(() => { this.crearPDF(id); }, 1200);
  }

  // funcion que se encagará de llenar la tabla de los productos en el pdf
  buildTableBody(data, columns) {
    var body = [];
    body.push(columns);
    data.forEach(function(row) {
        var dataRow = [];
        columns.forEach(function(column) {
            dataRow.push(row[column].toString());
        });
        body.push(dataRow);
    });

    return body;
  }

  // Funcion que genera la tabla donde se mostrará la información de los productos pedidos
  table(data, columns) {
    return {
        table: {
          headerRows: 1,
          widths: [50, 80, 60, 210, 50, 50],
          body: this.buildTableBody(data, columns),
        },
        fontSize: 7,
        layout: {
          fillColor: function (rowIndex, node, columnIndex) {
            return (rowIndex == 0) ? '#CCCCCC' : null;
          }
        }
    };
  }

  // Funcion que genera la tabla donde se mostrará la información de los productos pedidos
  table2(data, columns) {
    return {
        table: {
          headerRows: 1,
          widths: [60, 260, 70, 40, 80],
          body: this.buildTableBody(data, columns),
        },
        fontSize: 7,
        layout: {
          fillColor: function (rowIndex, node, columnIndex) {
            return (rowIndex == 0) ? '#CCCCCC' : null;
          }
        }
    };
  }

}
