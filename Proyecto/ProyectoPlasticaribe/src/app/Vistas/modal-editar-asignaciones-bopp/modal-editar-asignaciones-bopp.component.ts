import { DataSource } from '@angular/cdk/collections';
import { Component, Inject, Injectable, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { AsignacionBOPPService } from 'src/app/Servicios/asignacionBOPP.service';
import { BagproService } from 'src/app/Servicios/Bagpro.service';
import { DetalleAsignacion_BOPPService } from 'src/app/Servicios/detallesAsignacionBOPP.service';
import { EntradaBOPPService } from 'src/app/Servicios/entrada-BOPP.service';
import { RolesService } from 'src/app/Servicios/roles.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modal-editar-asignaciones-bopp',
  templateUrl: './modal-editar-asignaciones-bopp.component.html',
  styleUrls: ['./modal-editar-asignaciones-bopp.component.css']
})

@Injectable({
  providedIn: 'root'
})

export class ModalEditarAsignacionesBOPPComponent implements OnInit {



  public load: boolean;
  public FormAsignacionBopp !: FormGroup;
  public FormularioBOPP !: FormGroup;
  public FormularioEdicion !: FormGroup;
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  today : any = new Date(); //Variable que se usará para llenar la fecha actual
  ArrayBOPP = []; //Varibale que almacenará los BOPP existentes
  ArrayBoppPedida : any [] = []; //variable que almacenará el BOPPP pedido por una orden de trabajo
  boppSeleccionado : any = []; //Variable que almacenará la informacion del bopp que haya sido selccionado
  ordenesTrabajo = []; //Variable que almacenará las ordenes de trabajo que se consulten
  cantidadKG : number = 0; //Variable almacenará la cantidad en kilogramos pedida en la OT
  ot : any = [];
  estadoOT : any; //Varibale que almacenará el estado en que se encuentra la orden de trabajo
  arrayOT : any = [];
  idAsignacion : number = 0;
  otRegistradas : any = [];
  boppRegistrados : any = [];
  validarInput : boolean = true;
  keyword = 'bopP_Nombre';

  constructor(private FormBuilderAsignacion : FormBuilder,
                private FormBuilderBOPP : FormBuilder,
                  @Inject(SESSION_STORAGE) private storage: WebStorageService,
                    private rolService : RolesService,
                      private boppService : EntradaBOPPService,
                        private asignacionBOPPService : AsignacionBOPPService,
                          private detallesAsignacionBOPPService : DetalleAsignacion_BOPPService,
                            private bagProService : BagproService) {

    this.FormAsignacionBopp = this.FormBuilderAsignacion.group({
      AsgBopp_OT : [Validators.required],
      AsgBopp_Ancho : [Validators.required],
      AsgBopp_Fecha : [Validators.required],
      AsgBopp_Observacion: [Validators.required],
      AsgBopp_Estado: [Validators.required],
    });

    this.FormularioBOPP = this.FormBuilderBOPP.group({
      boppNombre : ['', Validators.required],
      boppSerial: ['', Validators.required],
      boppCantidad : ['', Validators.required],
    });

    this.FormularioEdicion = this.FormBuilderBOPP.group({
      boppCantidad : ['', Validators.required],
    });

    this.load = true;
  }


  ngOnInit(): void {
    this.fecha();
    this.lecturaStorage();
    this.obtenerBOPP();
    this.limpiarTodosLosCampos();
  }

  //
  onChangeSearch(val: string) {
    if (val != '') this.validarInput = false;
    else this.validarInput = true;
    // fetch remote data from here
    // And reassign the 'data' which is binded to 'data' property.
  }

  //
  onFocused(e){
    if (!e.isTrusted) this.validarInput = false;
    else this.validarInput = true;
    // do something when input is focused
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
  public limpiarTodosLosCampos(){
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

  //
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
      title: '¿Estás seguro de eliminar la Materia Prima de la Asignación?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        for (const item of this.ordenesTrabajo) {
          this.detallesAsignacionBOPPService.srvEliminarPorOT(item.IdDtAsg, formulario.ot).subscribe(datos_dtAsgEliminada => {
            Swal.fire('Orden de Trabajo eliminada');
          });
          break;
        }
        this.cantidadKG = this.cantidadKG - formulario.kg;
        this.ordenesTrabajo.splice(index, 1);
        for (let i = 0; i < this.arrayOT.length; i++) {
          if (this.arrayOT[i] == formulario.ot) {
            this.arrayOT.splice(i, 1);
            break;
          }
        }
        for (let i = 0; i < this.otRegistradas.length; i++) {
          if (this.otRegistradas[i] == formulario.ot) {
            this.otRegistradas.splice(i, 1);
            break;
          }
        }
      }
    });
  }

  //
  BOPPSeleccionado(item : any){
    this.validarInput = false;
    this.boppSeleccionado = [];
    this.FormularioBOPP.value.boppNombre = item.bopP_Nombre
    let bopp : any = this.FormularioBOPP.value.boppNombre;
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
      console.log(item)
      this.FormularioBOPP.setValue({
        boppSerial: item.bopP_Serial,
        boppNombre : item.bopP_Nombre,
        boppCantidad : item.bopP_Stock,
      });
    }
  }

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
        for (const item of this.ArrayBoppPedida) {
          this.detallesAsignacionBOPPService.srvEliminarPorBOPP(item.IdAsg, formulario.idBOPP).subscribe(datos_detallesAsgEliminada => {
            Swal.fire('BOPP eliminado');
          });
        }
        for (let i = 0; i < this.boppRegistrados.length; i++) {
          this.boppRegistrados.splice(i, 1);
        }
      }
    });
  }

  validarCamposBOPP(){
    if (this.FormularioBOPP.valid) this.cargarBOPPTabla();
    else Swal.fire("Debe cargar minimo un BOPP en la tabla para realizar la asignación");
  }

  //
  cargarBOPPTabla(){
    let serial : string = this.FormularioBOPP.value.boppSerial;
    let nombre : string = this.FormularioBOPP.value.boppNombre;
    let cantidad : number = this.FormularioBOPP.value.boppCantidad;

    let bopp : any = {
      Serial : serial,
      Nombre : nombre,
      Cantidad : cantidad,
      Cantidad2 : cantidad,
    }
    this.ArrayBoppPedida.push(bopp);
    this.FormularioBOPP.reset();
  }

  //
  moverInventarioBOPP(){
    for (let i = 0; i < this.ArrayBoppPedida.length; i++) {
      this.boppService.srvObtenerListaPorSerial(this.ArrayBoppPedida[i].Serial).subscribe(datos_bopp => {
        for (let j = 0; j < datos_bopp.length; j++) {
          let datosBOPP : any = {
            bopP_Id : datos_bopp[j].bopP_Id,
            bopP_Nombre : datos_bopp[j].bopP_Nombre,
            bopP_Descripcion : datos_bopp[j].bopP_Descripcion,
            bopP_Serial : datos_bopp[j].bopP_Serial,
            bopP_CantidadMicras :  datos_bopp[j].bopP_CantidadMicras,
            undMed_Id : datos_bopp[j].undMed_Id,
            catMP_Id : datos_bopp[j].catMP_Id,
            bopP_Precio : datos_bopp[j].bopP_Precio,
            tpBod_Id : datos_bopp[j].tpBod_Id,
            bopP_FechaIngreso : datos_bopp[j].bopP_FechaIngreso,
            bopP_Ancho : datos_bopp[j].bopP_Ancho,
            bopP_Stock : datos_bopp[j].bopP_CantidadInicialKg - this.ArrayBoppPedida[i].Cantidad2,
            UndMed_Kg : datos_bopp[j].undMed_Kg,
            bopP_CantidadInicialKg : datos_bopp[j].bopP_CantidadInicialKg,
            usua_Id : datos_bopp[j].usua_Id,
          }

          this.boppService.srvActualizar(datos_bopp[j].bopP_Id, datosBOPP).subscribe(datos_boppActualizado => {
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

          }, error => {
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
              icon: 'error',
              title: 'Error al actualizar la existencia del BOPP!'
            });
           });
        }
      });
    }
  }

  //
  cargarDatos(item : any){
    this.FormAsignacionBopp.setValue({
      AsgBopp_OT : '',
      AsgBopp_Ancho : 0,
      AsgBopp_Fecha : '',
      AsgBopp_Observacion: item.asigBOPP_Observacion,
      AsgBopp_Estado: '',
    });
  }

  //
  actualizarDetallesAsignacion(){
    this.load = false;
    for (let i = 0; i < this.ordenesTrabajo.length; i++) {
      if (!this.otRegistradas.includes(this.ordenesTrabajo[i].ot)) {
        for (let j = 0; j < this.ArrayBoppPedida.length; j++) {
          this.boppService.srvObtenerListaPorSerial(this.ArrayBoppPedida[j].Serial).subscribe(datos_bopp => {
            for (let k = 0; k < datos_bopp.length; k++) {
              let cantidad = this.ArrayBoppPedida[i].Cantidad2 / this.ordenesTrabajo.length;
              let datos : any = {
                AsigBOPP_Id : this.idAsignacion,
                BOPP_Id : datos_bopp[k].bopP_Id,
                DtAsigBOPP_Cantidad : cantidad,
                UndMed_Id : 'Kg',
                Proceso_Id : 'CORTE',
                DtAsigBOPP_OrdenTrabajo : this.ordenesTrabajo[i].ot,
                Estado_OrdenTrabajo : 14,
              }
              setTimeout(() => {
                this.detallesAsignacionBOPPService.srvGuardar(datos).subscribe(datos_detallesAsignacion => {
                  this.load = true;
                  this.moverInventarioBOPP();
                }, error => {
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
                    icon: 'error',
                    title: 'Error al agregar la nueva OT a la asignación!'
                  });
                });
              }, 1500);
              }
          });
        }
        continue;
      } else {
        for (let j = 0; j < this.ArrayBoppPedida.length; j++) {
          if (!this.boppRegistrados.includes(this.ArrayBoppPedida[j].Serial)) {
            this.boppService.srvObtenerListaPorSerial(this.ArrayBoppPedida[j].Serial).subscribe(datos_bopp => {
              for (let k = 0; k < datos_bopp.length; k++) {
                let cantidad = this.ArrayBoppPedida[i].Cantidad2 / this.ordenesTrabajo.length;
                let datos : any = {
                  AsigBOPP_Id : this.idAsignacion,
                  BOPP_Id : datos_bopp[k].bopP_Id,
                  DtAsigBOPP_Cantidad : cantidad,
                  UndMed_Id : 'Kg',
                  Proceso_Id : 'CORTE',
                  DtAsigBOPP_OrdenTrabajo : this.ordenesTrabajo[i].ot,
                  Estado_OrdenTrabajo : 14,
                }
                setTimeout(() => {
                  this.detallesAsignacionBOPPService.srvGuardar(datos).subscribe(datos_detallesAsignacion => {
                    this.moverInventarioBOPP();
                  }, error => {
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
                      icon: 'error',
                      title: 'Error al agregar el  nuevo BOPP a la asignación!'
                    });
                  });
                }, 1500);
              }
            });
          } else {
            this.boppService.srvObtenerListaPorSerial(this.ArrayBoppPedida[j].Serial).subscribe(datos_bopp => {
              for (let k = 0; k < datos_bopp.length; k++) {
                let cantidad = this.ArrayBoppPedida[i].Cantidad2 / this.ordenesTrabajo.length;
                let datos : any = {
                  AsigBOPP_Id : this.idAsignacion,
                  BOPP_Id : datos_bopp[k].bopP_Id,
                  DtAsigBOPP_Cantidad : cantidad,
                  UndMed_Id : 'Kg',
                  Proceso_Id : 'CORTE',
                  DtAsigBOPP_OrdenTrabajo : this.ordenesTrabajo[i].ot,
                  Estado_OrdenTrabajo : 14,
                }
                setTimeout(() => {
                  this.detallesAsignacionBOPPService.srvActualizar(this.idAsignacion, datos).subscribe(datos_detallesAsignacion => {
                    this.moverInventarioBOPP();
                  }, error => {
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
                      icon: 'error',
                      title: 'Error al actualizar las anteriores asignaciones!'
                    });
                  });
                }, 1500);
              }
            });
          }
        }
      }
    }
  }

  //
  cambiarCantidad(item : any){
    let cantidad = this.FormularioEdicion.value.boppCantidad;
    for (let i = 0; i < this.ArrayBoppPedida.length; i++) {
      if (item.Serial == this.ArrayBoppPedida[i].Serial && cantidad > 0 && cantidad <= item.Cantidad && cantidad != undefined && cantidad != null){
        this.ArrayBoppPedida[i].Cantidad2 = cantidad;
      } else {
        Swal.fire(`La cantidad a asignar debe ser mayor que 0 y menor o igual que ${item.Cantidad}`);
      }
    }
  }
}
