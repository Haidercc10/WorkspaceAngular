import { NumberFormatStyle } from '@angular/common';
import { ThisReceiver } from '@angular/compiler';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Console } from 'console';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { AsignacionBOPPService } from 'src/app/Servicios/asignacionBOPP.service';
import { BagproService } from 'src/app/Servicios/Bagpro.service';
import { DetalleAsignacion_BOPPService } from 'src/app/Servicios/detallesAsignacionBOPP.service';
import { EntradaBOPPService } from 'src/app/Servicios/entrada-BOPP.service';
import { RolesService } from 'src/app/Servicios/roles.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-asignacion-bopp',
  templateUrl: './asignacion-bopp.component.html',
  styleUrls: ['./asignacion-bopp.component.css']
})
export class AsignacionBOPPComponent implements OnInit {

  public load: boolean;
  public FormAsignacionBopp !: FormGroup;
  public FormularioBOPP !: FormGroup;
  public comboUnidadMedida = []; /** Combobox unidad de medida */
  public comboCategoriasMatPri = []; /** Combobox Categorias materia prima */
  public comboBOPP = []; /** Combobox BOPP */
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  today : any = new Date(); //Variable que se usará para llenar la fecha actual
  ArrayBOPP = []; //Varibale que almacenará los BOPP existentes
  ArrayBoppPedida = []; //variable que almacenará el BOPPP pedido por una orden de trabajo
  boppSeleccionado : any = []; //Variable que almacenará la informacion del bopp que haya sido selccionado
  ot : any = [];
  boppArray : any = [];
  cantidadBOPP : number = 0;
  ordenesTrabajo = []; //Variable que almacenará las ordenes de trabajo que se consulten
  micras : number = 0; //Variable que almacenará las micras que se solicitan en la OT
  ancho : number = 0; //Variable que almacenará el ancho que se solicita en la OT
  cantidadKG : number = 0; //Variable almacenará la cantidad en kilogramos pedida en la OT
  anchoBOPP : number = 0;
  cantidadKgBOPP : number = 0;


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
      AsgBopp_OT : ['', Validators.required],
      boppNombre : ['', Validators.required],
      boppSerial: ['', Validators.required],
      boppStock: ['', Validators.required],
      boppCantidad : ['', Validators.required],
      AsgBopp_Observacion: [''],
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

    this.FormAsignacionBopp = this.FormBuilderAsignacion.group({
      AsgBopp_OT : '',
      AsgBopp_Ancho :0,
      AsgBopp_Fecha : this.today,
      AsgBopp_Observacion: '',
      AsgBopp_Estado: '',
    });
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
    // infoOT(){
  //   let ot : string = this.FormAsignacionBopp.value.AsgBopp_OT;
  //   let observacion : string = this.FormularioBOPP.value.AsgBopp_Observacion;
  //   let anchoOT : number = this.FormAsignacionBopp.value.AsgBopp_Ancho;
  //   let arrayOT : any = [];

  //   if (this.ordenesTrabajo.length == 0) {
  //     this.bagProService.srvObtenerListaClienteOT_Item(ot).subscribe(datos_OT => {
  //       for (const item of datos_OT) {
  //         const infoOT : any = {
  //           ot : item.item,
  //           cliente : item.clienteNom,
  //           micras : item.extCalibre,
  //           ancho : item.ptAnchopt + anchoOT,
  //           item : item.clienteItemsNom,
  //           kg : item.datosotKg,
  //           observacion : observacion,
  //         }
  //         this.ordenesTrabajo.push(infoOT);
  //         this.micras = item.extCalibre;
  //         this.ancho = item.ptAnchopt;
  //         this.cantidadKG = item.datosotKg + this.cantidadKG;
  //         this.obtenerBOPP();
  //       }
  //     });
  //   } else {
  //     for (const item of this.ordenesTrabajo) {
  //       arrayOT.push(item.ot);
  //       if (arrayOT.includes(ot))
  //       {
  //         Swal.fire(`La OT ${ot} ya se encuentra en la tabla`);
  //         break;
  //       }
  //       else {
  //         this.bagProService.srvObtenerListaClienteOT_Item(ot).subscribe(datos_OT => {
  //           for (const item of datos_OT) {
  //             const infoOT : any = {
  //               ot : item.item,
  //               cliente : item.clienteNom,
  //               micras : item.extCalibre,
  //               ancho : item.ptAnchopt + anchoOT,
  //               item : item.clienteItemsNom,
  //               kg : item.datosotKg,
  //               observacion : observacion,
  //             }
  //             this.ordenesTrabajo.push(infoOT);
  //             this.micras = item.extCalibre;
  //             this.ancho = item.ptAnchopt;
  //             this.cantidadKG = item.datosotKg + this.cantidadKG;
  //             this.obtenerBOPP();
  //           }
  //         });
  //       }
  //     }
  //   }
  // }
  infoOT(){
    let ot : number = this.FormularioBOPP.value.AsgBopp_OT;


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
        this.cantidadKG = this.cantidadKG - formulario.kg;
        this.ordenesTrabajo.splice(index, 1);
        Swal.fire('Orden de Trabajo eliminada');
      }
    });
  }

/*  ajusteOT(){
    let anchoOT : number = this.FormAsignacionBopp.value.AsgBopp_Ancho;
    for (let i = 0; i < this.ordenesTrabajo.length; i++) {
      this.ordenesTrabajo[i].ancho = this.ordenesTrabajo[i].ancho + anchoOT;
      this.infoOT();
    }
  }*/

  //Funcion que buscará y mostrará los BOPP existentes
  obtenerBOPP(){
    this.ArrayBOPP = [];
    this.boppService.srvObtenerLista().subscribe(datos_BOPP => {
      for (let i = 0; i < datos_BOPP.length; i++) {
        if (datos_BOPP[i].bopP_CantidadKg != 0) this.ArrayBOPP.push(datos_BOPP[i]);
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
    this.micras = 0;
    this.cantidadBOPP = 0;
    this.ancho = 0;
    this.cantidadKG = 0;
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

  //
  BOPPSeleccionado(){
    this.boppSeleccionado = [];
    let bopp : number = this.FormularioBOPP.value.boppNombre;
    this.boppService.srvObtenerLista().subscribe(datos_bopp => {
      for (let i = 0; i < datos_bopp.length; i++) {
        if (datos_bopp[i].bopP_Nombre == bopp) {
          this.boppSeleccionado.push(datos_bopp[i]);
          this.cantidadBOPP = datos_bopp[i].bopP_Cantidad;
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
          this.boppSeleccionado.push(datos_bopp[i]);
          this.cargarBOPP();
        }
      }
    });
  }

  //
  cargarBOPP(){
    for (const item of this.boppSeleccionado) {
      this.anchoBOPP = item.bopP_Ancho;
      this.FormularioBOPP.setValue({
        AsgBopp_OT : this.FormularioBOPP.value.AsgBopp_OT,
        boppSerial: item.bopP_Serial,
        boppNombre : item.bopP_Nombre,
        boppStock: item.bopP_CantidadKg,
        boppCantidad : '',
        AsgBopp_Observacion : '',
      });
    }
  }

  //
  validarCamposBOPP(){
    if (this.FormularioBOPP.valid) this.cargarBOPPTabla();
    else Swal.fire("Debe cargar minimo un BOPP en la tabla para realizar la asignación");
  }

  //
  cargarBOPPTabla(){
    // let id : number = this.FormularioBOPP.value.AsgBopp_OT;
    // let serial : string = this.FormularioBOPP.value.boppSerial;
    // let nombre : string = this.FormularioBOPP.value.boppNombre;
    // let cantidad : number = this.FormularioBOPP.value.boppCantidad;
    // let stock : number = this.FormularioBOPP.value.boppStock;
    // let ot : any = [];
    // let kgOtRestante : number;
    // let kgBOPPRestante : number;
    // let cantidadAsignada : number;

    // for (const item of this.ordenesTrabajo) {
    //   const otInfo : any = {
    //     ot : item.ot,
    //     kg : item.kg,
    //   }
    //   ot.push(otInfo);

    //   for (const itemOT of ot) {
    //     if (itemOT.kg != 0) {
    //       if (itemOT.ot == item.ot) {
    //         if (stock != 0) {
    //           cantidadAsignada = item.ancho / this.anchoBOPP * stock;
    //           itemOT.kg = itemOT.kg - cantidadAsignada;
    //           if (cantidadAsignada <= stock) {
    //             let bopp : any = {
    //               Id : itemOT.ot,
    //               Serial : serial,
    //               Nombre : nombre,
    //               Cant : cantidadAsignada,
    //               UndCant : 'Kg',
    //             }

    //             this.ArrayBoppPedida.push(bopp);
    //             this.FormularioBOPP.reset();
    //           } else Swal.fire("¡No se puede asignar una cantidad mayor a la que hay en stock!");
    //         } else {

    //         }
    //       }
    //     } else continue;
    //   }
    // }

    let ot : number = this.FormularioBOPP.value.AsgBopp_OT;
    let serial : string = this.FormularioBOPP.value.boppSerial;
    let nombre : string = this.FormularioBOPP.value.boppNombre;
    let cantidad : number = this.FormularioBOPP.value.boppCantidad;
    let stock : number = this.FormularioBOPP.value.boppStock;
    let observacion : string = this.FormularioBOPP.value.AsgBopp_Observacion;

    if (cantidad <= stock) {
      let bopp : any = {
        Ot : ot,
        Serial : serial,
        Nombre : nombre,
        Cant : cantidad,
        UndCant : 'Kg',
        Observacion : observacion,
      }

      this.ArrayBoppPedida.push(bopp);

      this.boppService.srvObtenerLista().subscribe(datos_bopp => {
        for (let i = 0; i < datos_bopp.length; i++) {
          if (datos_bopp[i].bopP_Nombre == bopp.Nombre) {
            const datos : any = {
              id : datos_bopp[i].bopP_Id,
              cantidad : bopp.Cant,
            }
            this.boppArray.push(datos);
          }
        }
      });
      this.FormularioBOPP.reset();
    } else Swal.fire("¡No se puede asignar una cantidad mayor a la que hay en stock!");
  }

  //
  asignarBOPP(){
    this.load = false;

    for (const item of this.ArrayBoppPedida) {
      if (this.ot.includes(item.Ot)) {
        this.obtenerIdUltimaAsignacion(item.Ot, item.Nombre, item.Cant);
        continue;
      } else {
        this.ot.push(item.Ot);
        const datos : any = {
          AsigBOPP_OrdenTrabajo : item.Ot,
          AsigBOPP_FechaEntrega : this.today,
          AsigBOPP_Observacion : item.Observacion,
          Usua_Id : this.storage_Id,
          Estado_Id : 13,
        }
        this.asignacionBOPPService.srvGuardar(datos).subscribe(datos_asginacionBOPP => {
          this.obtenerIdUltimaAsignacion(item.Ot, item.Nombre, item.Cant);
        });
      }
    }
  }

  obtenerIdUltimaAsignacion(ot : number, nombreBOPP : any, cantidadBOPP : any){
    let idsAsignaciones = [];
    // this.asignacionBOPPService.srvObtenerLista().subscribe(datos_asignaciones => {
    //   for (let i = 0; i < datos_asignaciones.length; i++) {
    //     idsAsignaciones.push(datos_asignaciones[i].asigBOPP_Id);
    //   }
    //   let ultimoId : number = Math.max.apply(null, idsAsignaciones);
    //   this.detallesAsginacionBOPP(ultimoId);
    // });

    this.asignacionBOPPService.srvObtenerListaPorAgrupadoOT(ot).subscribe(datos_bopp => {
      this.detallesAsginacionBOPP(datos_bopp, nombreBOPP, cantidadBOPP);
    });
  }

  detallesAsginacionBOPP(idAsignacion : any, nombreBOPP : any, cantidadBOPP : any){
    // for (let j = 0; j < this.boppArray.length; j++) {
    //   let datos : any = {
    //     AsigBOPP_Id : idAsignacion,
    //     BOPP_Id : this.boppArray[j].id,
    //     DtAsigBOPP_Cantidad : this.boppArray[j].cantidad,
    //     UndMed_Id : 'Kg',
    //     Proceso_Id : 'CORTE',
    //   }

    //   this.detallesAsignacionBOPPService.srvGuardar(datos).subscribe(datos_detallesAsignacion => {
    //     this.moverInventarioBOPP(datos.BOPP_Id, datos.DtAsigBOPP_Cantidad);
    //   });
    // }

    this.boppService.srvObtenerLista().subscribe(datos_bopp => {
      for (let i = 0; i < datos_bopp.length; i++) {
        if (datos_bopp[i].bopP_Nombre == nombreBOPP) {
          let datos : any = {
            AsigBOPP_Id : idAsignacion,
            BOPP_Id : datos_bopp[i].bopP_Id,
            DtAsigBOPP_Cantidad : cantidadBOPP,
            UndMed_Id : 'Kg',
            Proceso_Id : 'CORTE',
          }

          this.detallesAsignacionBOPPService.srvGuardar(datos).subscribe(datos_detallesAsignacion => {
            this.moverInventarioBOPP(datos.BOPP_Id, datos.DtAsigBOPP_Cantidad);
          });
        }
      }
    });
    this.obtenerBOPP();
  }

  //
  moverInventarioBOPP(id : number, cantidad : number){
    this.boppService.srvObtenerListaPorId(id).subscribe(datos_bopp => {
      let bopp : any = [];
      bopp.push(datos_bopp);
      for (const item of bopp) {
        let stock : number = item.bopP_CantidadKg;
        let cantidadFinal : number = stock - cantidad;
        if (cantidadFinal <= 3.5) {
          let FechaDatetime = item.bopP_FechaIngreso;
          let FechaCreacionNueva = FechaDatetime.indexOf("T");
          let fechaCreacionFinal = FechaDatetime.substring(0, FechaCreacionNueva);

          let datosBOPP : any = {
            bopP_Id : item.bopP_Id,
            bopP_Nombre : item.bopP_Nombre,
            bopP_Descripcion : item.bopP_Descripcion,
            bopP_Serial : item.bopP_Serial,
            bopP_Cantidad :  item.bopP_Cantidad,
            undMed_Id : item.undMed_Id,
            catMP_Id : item.catMP_Id,
            bopP_Precio : item.bopP_Precio,
            tpBod_Id : item.tpBod_Id,
            bopP_FechaIngreso : item.bopP_FechaIngreso,
            bopP_Ancho : item.bopP_Ancho,
            bopP_CantidadKg : 0,
            UndMed_Kg : item.undMed_Kg,
          }

          this.boppService.srvActualizar(id, datosBOPP).subscribe(datos_boppActualizado => {
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
            this.obtenerBOPP();
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
            bopP_Cantidad :  item.bopP_Cantidad,
            undMed_Id : item.undMed_Id,
            catMP_Id : item.catMP_Id,
            bopP_Precio : item.bopP_Precio,
            tpBod_Id : item.tpBod_Id,
            bopP_FechaIngreso : item.bopP_FechaIngreso,
            bopP_Ancho : item.bopP_Ancho,
            bopP_CantidadKg : cantidadFinal,
            UndMed_Kg : item.undMed_Kg,
          }

          this.boppService.srvActualizar(id, datosBOPP).subscribe(datos_boppActualizado => {
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
            this.obtenerBOPP();
            this.load = true;

          }, error => { console.log(error); });
        }
      }
    });
  }
}
