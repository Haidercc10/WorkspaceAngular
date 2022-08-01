import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { AsignacionBOPPService } from 'src/app/Servicios/asignacionBOPP.service';
import { BagproService } from 'src/app/Servicios/Bagpro.service';
import { DetalleAsignacion_BOPPService } from 'src/app/Servicios/detallesAsignacionBOPP.service';
import { EntradaBOPPService } from 'src/app/Servicios/entrada-BOPP.service';
import { RolesService } from 'src/app/Servicios/roles.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-asignacionBOPP_TEMPORAL',
  templateUrl: './asignacionBOPP_TEMPORAL.component.html',
  styleUrls: ['./asignacionBOPP_TEMPORAL.component.css']
})
export class AsignacionBOPP_TEMPORALComponent implements OnInit {

  public load: boolean;
  public FormAsignacionBopp !: FormGroup;
  public FormularioBOPP !: FormGroup;
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  today : any = new Date(); //Variable que se usará para llenar la fecha actual
  ArrayBOPP = []; //Varibale que almacenará los BOPP existentes
  ArrayBoppPedida = []; //variable que almacenará el BOPPP pedido por una orden de trabajo
  boppSeleccionado : any = []; //Variable que almacenará la informacion del bopp que haya sido selccionado
  ordenesTrabajo = []; //Variable que almacenará las ordenes de trabajo que se consulten
  cantidadKG : number = 0; //Variable almacenará la cantidad en kilogramos pedida en la OT
  ot : any = [];
  estadoOT : any; //Varibale que almacenará el estado en que se encuentra la orden de trabajo
  arrayOT : any = [];

  constructor(private FormBuilderAsignacion : FormBuilder,
                private FormBuilderBOPP : FormBuilder,
                  @Inject(SESSION_STORAGE) private storage: WebStorageService,
                    private rolService : RolesService,
                    private boppService : EntradaBOPPService,
                      private asignacionBOPPService : AsignacionBOPPService,
                        private detallesAsignacionBOPPService : DetalleAsignacion_BOPPService,
                          private bagProService : BagproService) {

    this.FormAsignacionBopp = this.FormBuilderAsignacion.group({
      AsgBopp_OT : ['', Validators.required],
      AsgBopp_Ancho : [0, Validators.required],
      AsgBopp_Fecha : ['', Validators.required],
      AsgBopp_Observacion: ['', Validators.required],
      AsgBopp_Estado: ['', Validators.required],
    });

    this.FormularioBOPP = this.FormBuilderBOPP.group({
      boppNombre : ['', Validators.required],
      boppSerial: ['', Validators.required],
    });
    this.load = true;
  }


  ngOnInit(): void {
    this.fecha();
    this.lecturaStorage();
    this.obtenerBOPP();
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

    // this.FormAsignacionBopp = this.FormBuilderAsignacion.group({
    //   AsgBopp_OT : '',
    //   AsgBopp_Ancho :0,
    //   AsgBopp_Fecha : this.today,
    //   AsgBopp_Observacion: '',
    //   AsgBopp_Estado: '',
    // });
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

  //
  limpiarCamposBOPP(){
    this.FormularioBOPP.reset();
  }

  //
  limpiarTodosLosCampos(){
    this.FormAsignacionBopp = this.FormBuilderAsignacion.group({
      AsgBopp_OT : '',
      AsgBopp_Ancho : 0,
      AsgBopp_Fecha : this.today,
      AsgBopp_Observacion: '',
      AsgBopp_Estado: '',
    });
    this.FormularioBOPP.reset();
    this.ArrayBoppPedida = [];
    this.ordenesTrabajo = [];
    this.cantidadKG = 0;
  }

  //Funcion que buscará y mostrará los BOPP existentes
  obtenerBOPP(){
    this.ArrayBOPP = [];
    this.boppService.srvObtenerLista().subscribe(datos_BOPP => {
      for (let i = 0; i < datos_BOPP.length; i++) {
        if (datos_BOPP[i].bopP_Stock >= 3.5) this.ArrayBOPP.push(datos_BOPP[i]);
      }
    });
  }

  /* FUNCION PARA RELIZAR CONFIMACIÓN DE SALIDA */
  confimacionSalida(){
    Swal.fire({
      title: '¿Seguro que desea salir?',
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: 'Salir',
      denyButtonText: `No Salir`,
    }).then((result) => {
      if (result.isConfirmed) window.location.href = "./";
    });
  }

  infoOT(){
    let ordenTrabajo : string = this.FormAsignacionBopp.value.AsgBopp_OT;

    if (this.ordenesTrabajo.length == 0) {
      this.bagProService.srvObtenerListaClienteOT_Item(ordenTrabajo).subscribe(datos_OT => {
        for (const item of datos_OT) {
          this.arrayOT.push(ordenTrabajo);
          if (item.estado == null || item.estado == '' || item.estado == '0') {
            const infoOT : any = {
              ot : item.item,
              cliente : item.clienteNom,
              micras : item.extCalibre,
              ancho : item.ptAnchopt,
              item : item.clienteItemsNom,
              kg : item.datosotKg,
            }
            this.ordenesTrabajo.push(infoOT);
            this.cantidadKG = item.datosotKg + this.cantidadKG;
          } else if (item.estado == 4 || item.estado == 1) Swal.fire(`No es podible asignar a esta orden de trabajo, la OT ${ordenTrabajo} se encuentra cerrada.`);
        }
      });
    } else {
      if (!this.arrayOT.includes(ordenTrabajo)) {
        this.arrayOT.push(ordenTrabajo);
        this.bagProService.srvObtenerListaClienteOT_Item(ordenTrabajo).subscribe(datos_OT => {
          for (const itemOT of datos_OT) {
            if (itemOT.estado == null || itemOT.estado == '' || itemOT.estado == '0') {
              const infoOT : any = {
                ot : itemOT.item,
                cliente : itemOT.clienteNom,
                micras : itemOT.extCalibre,
                ancho : itemOT.ptAnchopt,
                item : itemOT.clienteItemsNom,
                kg : itemOT.datosotKg,
              }
              this.ordenesTrabajo.push(infoOT);
              this.cantidadKG = itemOT.datosotKg + this.cantidadKG;
            } else if (itemOT.estado == 4 || itemOT.estado == 1) Swal.fire(`No es podible asignar a esta orden de trabajo, la OT ${ordenTrabajo} se encuentra cerrada.`);
          }
        });
      } else {
        Swal.fire(`La OT ${ordenTrabajo} ya se encuentra en la tabla`);
      }
    }
  }

  // Función para quitar una Ot de la tabla
  QuitarOrdenTrabajo(index : number, formulario : any) {
    Swal.fire({
      title: '¿Estás seguro de eliminar la OT de la Asignación?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.cantidadKG = this.cantidadKG - formulario.kg;
        this.ordenesTrabajo.splice(index, 1);
        for (let i = 0; i < this.arrayOT.length; i++) {
          if (this.arrayOT[i] == formulario.ot) {
            this.arrayOT.splice(i, 1);
          }
        }
        Swal.fire('Orden de Trabajo eliminada');
      }
    });
  }

  //
  BOPPSeleccionado(){
    this.boppSeleccionado = [];
    let bopp : number = this.FormularioBOPP.value.boppNombre;
    this.boppService.srvObtenerLista().subscribe(datos_bopp => {
      for (let i = 0; i < datos_bopp.length; i++) {
        if (datos_bopp[i].bopP_Nombre == bopp) {
          this.boppSeleccionado.push(datos_bopp[i]);
          this.cargarBOPP();
        }
      }
    });
  }

  //
  BOPPBuscado(){
    this.boppSeleccionado = [];
    let serial : string = this.FormularioBOPP.value.boppSerial;
    this.boppService.srvObtenerListaPorSerial(serial).subscribe(datos_bopp => {
      if (datos_bopp.length == 0) Swal.fire("El Pallet/Serial no se encuentra registrado.");
      else {
        for (let i = 0; i < datos_bopp.length; i++) {
          if (datos_bopp[i].bopP_Stock >= 1.5) {
            this.boppSeleccionado.push(datos_bopp[i]);
            this.cargarBOPP();
          }
        }
      }
    });
  }

  //
  cargarBOPP(){
    for (const item of this.boppSeleccionado) {
      this.FormularioBOPP.setValue({
        boppSerial: item.bopP_Serial,
        boppNombre : item.bopP_Nombre,
      });
    }
  }

  //
  quitarBOPP(index : number, formulario : any){
    Swal.fire({
      title: '¿Estás seguro de eliminar la Materia Prima de la Asignación?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.ArrayBoppPedida.splice(index, 1);
        Swal.fire('Orden de Trabajo eliminada');
      }
    });
  }

  validarCamposBOPP(){
    if (this.FormularioBOPP.valid) this.cargarBOPPTabla();
    else Swal.fire("Debe cargar minimo un BOPP en la tabla para realizar la asignación");
  }


  cargarBOPPTabla(){
    let serial : string = this.FormularioBOPP.value.boppSerial;
    let nombre : string = this.FormularioBOPP.value.boppNombre;

    let bopp : any = {
      Serial : serial,
      Nombre : nombre,
    }
    this.ArrayBoppPedida.push(bopp);
    this.FormularioBOPP.reset();
  }

  //
  asignarBOPP(){
    this.load = false;
    let observacion : string = this.FormAsignacionBopp.value.AsgBopp_Observacion;

    const datos : any = {
      AsigBOPP_FechaEntrega : this.today,
      AsigBOPP_Observacion : observacion,
      Usua_Id : this.storage_Id,
      Estado_Id : 13,
    }
    this.asignacionBOPPService.srvGuardar(datos).subscribe(datos_asginacionBOPP => {
      this.obtenerIdUltimaAsignacion();
    });

    // for (const item of this.ordenesTrabajo) {
    //   const datos : any = {
    //     AsigBOPP_OrdenTrabajo : item.ot,
    //     AsigBOPP_FechaEntrega : this.today,
    //     AsigBOPP_Observacion : '',
    //     Usua_Id : this.storage_Id,
    //     Estado_Id : 13,
    //   }
    //   this.asignacionBOPPService.srvGuardar(datos).subscribe(datos_asginacionBOPP => {
    //     this.obtenerIdUltimaAsignacion(datos.AsigBOPP_OrdenTrabajo);
    //   });
    // }
    // for (const item of this.ArrayBoppPedida) {
    //   if (this.ot.includes(item.Ot)) {
    //     this.obtenerIdUltimaAsignacion(item.Ot, item.Nombre, item.Cant);
    //     continue;
    //   } else {
    //     this.ot.push(item.Ot);
    //     const datos : any = {
    //       AsigBOPP_OrdenTrabajo : item.Ot,
    //       AsigBOPP_FechaEntrega : this.today,
    //       AsigBOPP_Observacion : item.Observacion,
    //       Usua_Id : this.storage_Id,
    //       Estado_Id : 13,
    //     }
    //     this.asignacionBOPPService.srvGuardar(datos).subscribe(datos_asginacionBOPP => {
    //       this.obtenerIdUltimaAsignacion(item.Ot, item.Nombre, item.Cant);
    //     });
    //   }
    // }
  }

  obtenerIdUltimaAsignacion(){
    let idsAsignaciones = [];
    this.asignacionBOPPService.srvObtenerLista().subscribe(datos_asignaciones => {
      for (let i = 0; i < datos_asignaciones.length; i++) {
        idsAsignaciones.push(datos_asignaciones[i].asigBOPP_Id);
      }
      let ultimoId : number = Math.max.apply(null, idsAsignaciones);
      this.detallesAsginacionBOPP(ultimoId);
    });

    // this.asignacionBOPPService.srvObtenerListaPorAgrupadoOT(ot).subscribe(datos_bopp => {
    //   this.detallesAsginacionBOPP(datos_bopp);
    // });
  }

  detallesAsginacionBOPP(idAsignacion : any){
    let numeroOT : number = this.ordenesTrabajo.length;

    for (let i = 0; i < this.ordenesTrabajo.length; i++) {
      for (let j = 0; j < this.ArrayBoppPedida.length; j++) {
        this.boppService.srvObtenerListaPorSerial(this.ArrayBoppPedida[j].Serial).subscribe(datos_bopp => {
          for (let k = 0; k < datos_bopp.length; k++) {
            if (datos_bopp[k].bopP_Serial == this.ArrayBoppPedida[j].Serial) {
              let cantidad = datos_bopp[k].bopP_CantidadInicialKg / this.ordenesTrabajo.length;
              let datos : any = {
                AsigBOPP_Id : idAsignacion,
                BOPP_Id : datos_bopp[k].bopP_Id,
                DtAsigBOPP_Cantidad : cantidad,
                UndMed_Id : 'Kg',
                Proceso_Id : 'CORTE',
                DtAsigBOPP_OrdenTrabajo : this.ordenesTrabajo[i].ot,
                Estado_OrdenTrabajo : 14,
              }

              setTimeout(() => {
                this.detallesAsignacionBOPPService.srvGuardar(datos).subscribe(datos_detallesAsignacion => {
                  this.moverInventarioBOPP(datos.BOPP_Id, datos.DtAsigBOPP_Cantidad);
                });
              }, 1500);
            }
          }
        });
      }
    }
  }

  //
  moverInventarioBOPP(id : number, cantidad : number){
    this.boppService.srvObtenerListaPorId(id).subscribe(datos_bopp => {
      let bopp : any = [];
      bopp.push(datos_bopp);
      for (const item of bopp) {
        let stock : number = item.bopP_Stock;
        let cantidadFinal : any = stock - cantidad;
        if (cantidadFinal <= 1.5) {

          let datosBOPP : any = {
            bopP_Id : item.bopP_Id,
            bopP_Nombre : item.bopP_Nombre,
            bopP_Descripcion : item.bopP_Descripcion,
            bopP_Serial : item.bopP_Serial,
            bopP_CantidadMicras :  item.bopP_CantidadMicras,
            undMed_Id : item.undMed_Id,
            catMP_Id : item.catMP_Id,
            bopP_Precio : item.bopP_Precio,
            tpBod_Id : item.tpBod_Id,
            bopP_FechaIngreso : item.bopP_FechaIngreso,
            bopP_Ancho : item.bopP_Ancho,
            bopP_Stock : 0,
            UndMed_Kg : item.undMed_Kg,
            bopP_CantidadInicialKg : item.bopP_CantidadInicialKg,
          }

          this.boppService.srvActualizar(id, datosBOPP).subscribe(datos_boppActualizado => {
            this.obtenerBOPP();
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
              title: 'Asignación de BOPP registrada con exito!'
            });
            this.limpiarTodosLosCampos();
            this.load = true;

          }, error => { console.log(error); });

        } else {
          let FechaDatetime = item.bopP_FechaIngreso;
          let FechaCreacionNueva = FechaDatetime.indexOf("T");
          let fechaCreacionFinal = FechaDatetime.substring(0, FechaCreacionNueva);

          let datosBOPP : any = {
            bopP_Id : item.bopP_Id,
            bopP_Nombre : item.bopP_Nombre,
            bopP_Descripcion : item.bopP_Descripcion,
            bopP_Serial : item.bopP_Serial,
            bopP_CantidadMicras :  item.bopP_CantidadMicras,
            undMed_Id : item.undMed_Id,
            catMP_Id : item.catMP_Id,
            bopP_Precio : item.bopP_Precio,
            tpBod_Id : item.tpBod_Id,
            bopP_FechaIngreso : item.bopP_FechaIngreso,
            bopP_Ancho : item.bopP_Ancho,
            bopP_Stock : 0,
            UndMed_Kg : item.undMed_Kg,
            bopP_CantidadInicialKg : item.bopP_CantidadInicialKg,
          }

          this.boppService.srvActualizar(id, datosBOPP).subscribe(datos_boppActualizado => {
            this.obtenerBOPP();
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
              title: 'Asignación de BOPP registrada con exito!'
            });
            this.limpiarTodosLosCampos();
            this.load = true;

          }, error => { console.log(error); });
        }
      }
    });
  }
}
