import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { AppComponent } from 'src/app/app.component';
import { AsignacionBOPPService } from 'src/app/Servicios/Asignacion_Bopp/asignacionBOPP.service';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { DetalleAsignacion_BOPPService } from 'src/app/Servicios/DetallesAsgBopp/detallesAsignacionBOPP.service';
import { EntradaBOPPService } from 'src/app/Servicios/BOPP/entrada-BOPP.service';
import { RolesService } from 'src/app/Servicios/Roles/roles.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-asignacion-bopp',
  templateUrl: './asignacion-bopp.component.html',
  styleUrls: ['./asignacion-bopp.component.css']
})
export class AsignacionBOPPComponent implements OnInit {

  public load: boolean = true;
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
  arrayOT : any = [];
  keyword = 'name';
  public historyHeading: string = 'Seleccionado Recientemente';
  validarInput : any;
  kgRollo : number = 0;
  ArrayConsolidadoOT : any [] = [];

  constructor(private appComponent : AppComponent,
                private FormBuilderAsignacion : FormBuilder,
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
      boppStock: ['', Validators.required],
    });

  }

  ngOnInit(): void {
    this.fecha();
    this.lecturaStorage();
    this.obtenerBOPP();
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

  //Funcion que buscará la información de las ordenes de trabajo consultadas
  infoOT(){
    this.load = false;
    let ordenTrabajo : number = this.FormAsignacionBopp.value.AsgBopp_OT;
    let cantidadAsignada : number = 0;

    if (this.ordenesTrabajo.length == 0) {
      this.bagProService.srvObtenerListaClienteOT_Item(ordenTrabajo).subscribe(datos_OT => {
        if (datos_OT.length == 0) {
          Swal.fire({
            icon: 'warning',
            title: 'Oops...',
            html:
            `<b>¡La OT ${ordenTrabajo} no ha sido encontrada!</b><hr> `,
          });
        }
        for (const item of datos_OT) {
          this.arrayOT.push(ordenTrabajo);
          if (item.estado == null || item.estado == '' || item.estado == '0') {
            this.detallesAsignacionBOPPService.srvObtenerListaPorOt(ordenTrabajo).subscribe(datos_dtAsgBOPP => {
              if (datos_dtAsgBOPP.length == 0) cantidadAsignada = 0;
              else {
                for (let i = 0; i < datos_dtAsgBOPP.length; i++) {
                  cantidadAsignada += datos_dtAsgBOPP[i].dtAsigBOPP_Cantidad;
                }
              }
            });
            setTimeout(() => {
              if (cantidadAsignada <= (item.datosotKg)) {
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
                this.FormAsignacionBopp = this.FormBuilderAsignacion.group({
                  AsgBopp_OT : '',
                  AsgBopp_Ancho : 0,
                  AsgBopp_Fecha : this.today,
                  AsgBopp_Observacion: '',
                  AsgBopp_Estado: '',
                });
              } else Swal.fire(`¡No se le puede asignar material a la OT ${ordenTrabajo}, ya se le ha asignado la cantidad máxima!`);
            }, 900);
          } else if (item.estado == 4 || item.estado == 1) Swal.fire(`No es podible asignar a esta orden de trabajo, la OT ${ordenTrabajo} se encuentra cerrada.`);
        }
      });
    } else {
      if (!this.arrayOT.includes(ordenTrabajo)) {
        this.arrayOT.push(ordenTrabajo);
        this.bagProService.srvObtenerListaClienteOT_Item(ordenTrabajo).subscribe(datos_OT => {
          for (const itemOT of datos_OT) {
            if (itemOT.estado == null || itemOT.estado == '' || itemOT.estado == '0') {
              this.detallesAsignacionBOPPService.srvObtenerListaPorOt(ordenTrabajo).subscribe(datos_dtAsgBOPP => {
                if (datos_dtAsgBOPP.length == 0) cantidadAsignada = 0;
                else {
                  for (let i = 0; i < datos_dtAsgBOPP.length; i++) {
                    cantidadAsignada += datos_dtAsgBOPP[i].dtAsigBOPP_Cantidad;
                  }
                }
              });
              setTimeout(() => {
                if (cantidadAsignada <= (itemOT.datosotKg)) {
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
                  this.FormAsignacionBopp = this.FormBuilderAsignacion.group({
                    AsgBopp_OT : '',
                    AsgBopp_Ancho : 0,
                    AsgBopp_Fecha : this.today,
                    AsgBopp_Observacion: '',
                    AsgBopp_Estado: '',
                  });
                } else {
                  Swal.fire({
                    icon: 'warning',
                    title: 'Oops...',
                    html:
                    `<b>¡No se le puede asignar material a la OT ${ordenTrabajo}, ya se le ha asignado la cantidad máxima!</b><hr> `,
                  });
                }
              }, 1200);
            } else if (itemOT.estado == 4 || itemOT.estado == 1) {
              Swal.fire({
                icon: 'warning',
                title: 'Oops...',
                html:
                `<b>¡No es podible asignar a esta orden de trabajo, la OT ${ordenTrabajo} se encuentra cerrada.!</b><hr> `,
              });
            }
          }
        });
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Oops...',
          html:
          `<b>¡La OT ${ordenTrabajo} ya se encuentra en la tabla!</b><hr> `,
        });
      }
    }
    setTimeout(() => { this.load = true; }, 900);
  }

  // Funcion que va a quitar un rollo
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
          title: '¡Rollo Eliminado!'
        });
      }
    });
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
          title: '¡Orden de Trabajo Elminada!'
        });
      }
    });
  }

  //
  ajusteOT(){
    let anchoOT : number = this.FormAsignacionBopp.value.AsgBopp_Ancho;
    for (let i = 0; i < this.ordenesTrabajo.length; i++) {
      this.ordenesTrabajo[i].ancho += anchoOT;
    }
  }

  //Funcion que buscará y mostrará los BOPP existentes
  obtenerBOPP(){
    this.ArrayBOPP = [];
    this.boppService.srvObtenerLista().subscribe(datos_BOPP => {
      for (let i = 0; i < datos_BOPP.length; i++) {
        if (datos_BOPP[i].bopP_Stock != 0) {
          const bopp : any = {
            id : datos_BOPP[i].bopP_Id,
            name : datos_BOPP[i].bopP_Nombre,
          }
          this.ArrayBOPP.push(bopp);
        }
      }
    });
  }

  //
  limpiarCamposBOPP(){
    this.FormularioBOPP.setValue({
      boppNombre : '',
      boppSerial: '',
      boppStock: '',
    });
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
    this.FormularioBOPP.setValue({
      boppNombre : '',
      boppSerial: '',
      boppStock: '',
    });
    this.ArrayBoppPedida = [];
    this.ordenesTrabajo = [];
    this.micras = 0;
    this.cantidadBOPP = 0;
    this.ancho = 0;
    this.cantidadKG = 0;
    this.arrayOT = [];
  }

  //
  BOPPSeleccionado(item){
    this.FormularioBOPP.value.boppNombre = item.id;
    if (this.FormularioBOPP.value.boppNombre != '') this.validarInput = false;
    else this.validarInput = true;
    this.boppSeleccionado = [];
    let bopp : number = this.FormularioBOPP.value.boppNombre;
    this.boppService.srvObtenerListaPorId(bopp).subscribe(datos_bopp => {
      let bopp2 : any = [];
      bopp2.push(datos_bopp);
      for (const item of bopp2) {
        this.boppSeleccionado.push(item);
        this.cantidadBOPP = item.bopP_Cantidad;
        this.cargarBOPP();
      }
    });
  }

  //
  BOPPBuscado(){
    this.boppSeleccionado = [];
    let serial : string = this.FormularioBOPP.value.boppSerial;
    this.boppService.srvObtenerListaPorSerial(serial).subscribe(datos_bopp => {
      if (datos_bopp.length == 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Oops...',
          html:
          `<b>¡El Pallet/Serial no se encuentra registrado.!</b><hr> `,
        });
      } else {
        for (let i = 0; i < datos_bopp.length; i++) {
          this.boppSeleccionado.push(datos_bopp[i]);
          this.cargarBOPP();
        }
      }
    }, error => {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        html:
        `<b>¡Rollo no encontrado!</b><hr> `+
        `<b style="color: #f00">¡${error}!</b>`,
      });
      this.load = true;
    });
  }

  //
  cargarBOPP(){
    for (const item of this.boppSeleccionado) {
      this.anchoBOPP = item.bopP_Ancho;
      this.kgRollo = item.bopP_Stock;
      this.FormularioBOPP.setValue({
        boppSerial: item.bopP_Serial,
        boppNombre : item.bopP_Nombre,
        boppStock: item.bopP_Stock,
      });
    }
  }

  // Funcion que validará el total de los kilogramas totales de cada rollo
  cambiarCantidad(){
    let cantidadActual : number = this.FormularioBOPP.value.boppStock;
    if (cantidadActual > this.kgRollo){
      this.FormularioBOPP.setValue({
        boppSerial: this.FormularioBOPP.value.boppSerial,
        boppNombre : this.FormularioBOPP.value.boppNombre,
        boppStock: this.kgRollo,
      });
    }
  }

  //
  validarCamposBOPP(){
    if (this.ordenesTrabajo.length != 0) this.cargarBOPPTabla();
    else {
      Swal.fire("¡Debe cargar minimo una orden de trabajo en la tabla para realizar la asignación del rollo!");
      Swal.fire({
        icon: 'warning',
        title: 'Oops...',
        html:
        `<b>¡Debe cargar minimo una orden de trabajo en la tabla para realizar la asignación del rollo.!</b><hr> `,
      });
    }
  }

  //Funcion que asignará un rollo a cada orden de trabajo, colocando la cantidad que debe tener el la orden dependiendo del rollo
  cargarBOPPTabla(){
    let serial : string = this.FormularioBOPP.value.boppSerial;
    let nombre : string = this.FormularioBOPP.value.boppNombre;
    let stock : number = this.FormularioBOPP.value.boppStock;
    let stockInicial : number = stock;
    let ot : any = [];
    let cantidadAsignada : any;
    let otAsignadas : any [] = [];

    for (let i = 0; i < this.ArrayConsolidadoOT.length; i++) {
      otAsignadas.push(this.ArrayConsolidadoOT[i].Ot);
    }
    for (const item of this.ordenesTrabajo) {
      const otInfo : any = {
        ot : item.ot,
        kg : item.kg,
      }
      ot.push(otInfo);

      for (const itemOT of ot) {
        if (itemOT.kg != 0) {
          if (itemOT.ot == item.ot) {
            if (stock > 0) {
              cantidadAsignada = (item.ancho / this.anchoBOPP * stockInicial);
              itemOT.kg -= cantidadAsignada;
              if (cantidadAsignada <= stock) {
                if (otAsignadas.includes(item.ot)) {
                  for (let i = 0; i < this.ArrayConsolidadoOT.length; i++) {
                    if (this.ArrayConsolidadoOT[i].Ot == item.ot) this.ArrayConsolidadoOT[i].Cant += (item.ancho / this.anchoBOPP * stock);
                  }
                } else {
                  let bopp : any = {
                    Ot : item.ot,
                    Cant : (item.ancho / this.anchoBOPP * stock),
                    UndCant : 'Kg',
                  }
                  this.ArrayConsolidadoOT.push(bopp);
                }
                let bopp : any = {
                  Ot : item.ot,
                  Serial : serial,
                  Nombre : nombre,
                  CantTotal : item.ancho / this.anchoBOPP * stock,
                  Cant : (item.ancho / this.anchoBOPP * stock).toFixed(2),
                  UndCant : 'Kg',
                }
                stock -= cantidadAsignada;

                this.ArrayBoppPedida.push(bopp);
                this.FormularioBOPP.setValue({
                  boppNombre : '',
                  boppSerial: '',
                  boppStock: '',
                });
              } else {
                Swal.fire(`¡No se puede asignar el rollo a la OT ${itemOT.ot}, porque la cantidad a asignar excede la cantidad restante del rollo!`);
                Swal.fire({
                  icon: 'warning',
                  title: 'Oops...',
                  html:
                  `<b>¡No se puede asignar el rollo a la OT ${itemOT.ot}, porque la cantidad a asignar excede la cantidad restante del rollo!</b><hr> `,
                });
              }
            }
          }
        }
      }
    }
    setTimeout(() => {
      for (let i = 0; i < this.ArrayBOPP.length; i++) {
        if (this.ArrayBOPP[i].name == nombre) this.ArrayBOPP.splice(i, 1);
      }
    }, 1000);
  }

  //Funcion que enviará a la base de datos la informaión general de la asignacion
  asignarBOPP(){
    this.load = false;
    let observacion : string = this.FormAsignacionBopp.value.AsgBopp_Observacion;

    const datos : any = {
      AsigBOPP_FechaEntrega : this.today,
      AsigBOPP_Observacion : observacion,
      Usua_Id : this.storage_Id,
      Estado_Id : 13,
      AsigBOPP_Hora : moment().format('H:mm:ss'),
    }
    this.asignacionBOPPService.srvGuardar(datos).subscribe(datos_asginacionBOPP => {
      this.obtenerIdUltimaAsignacion();
    }, error => {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        html:
        `<b>¡Error al registrar la información de la asignación!</b><hr> `+
        `<b style="color: #f00">${error}</b>`,
      });
      this.load = true;
    });
  }

  //Funcion que pedirá a la base de datos la información de la ultima asignacion
  obtenerIdUltimaAsignacion(){
    this.asignacionBOPPService.srvObtenerListaUltimoId().subscribe(datos_asignaciones => {
      this.detallesAsginacionBOPP(datos_asignaciones);
    }, error => {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        html:
        `<b>¡Error al obtener el ultimo ID de asignación!</b><hr> `+
        `<b style="color: #f00">${error}</b>`,
      });
    });
  }

  //Funcion que enviará a la base de datos la informacion detalla de los rollos asignados
  detallesAsginacionBOPP(asignacion : any){
    let idAsignacion : number = asignacion.asigBOPP_Id;
    for (let j = 0; j < this.ArrayBoppPedida.length; j++) {
      this.boppService.srvObtenerListaPorSerial(this.ArrayBoppPedida[j].Serial).subscribe(datos_bopp => {
        for (let k = 0; k < datos_bopp.length; k++) {
          if (datos_bopp[k].bopP_Serial == this.ArrayBoppPedida[j].Serial) {
            let datos : any = {
              asigBOPP_Id : idAsignacion,
              bopP_Id : datos_bopp[k].bopP_Id,
              dtAsigBOPP_Cantidad : this.ArrayBoppPedida[j].Cant,
              undMed_Id : 'Kg',
              proceso_Id : 'CORTE',
              dtAsigBOPP_OrdenTrabajo : this.ArrayBoppPedida[j].Ot,
              estado_OrdenTrabajo : 14,
              TpDoc_Id : 'ASIGBOPP',
            }
            setTimeout(() => {
              this.detallesAsignacionBOPPService.srvGuardar(datos).subscribe(datos_detallesAsignacion => { }, error => {
                Swal.fire({
                  icon: 'error',
                  title: 'Oops...',
                  html:
                  `<b>¡Error al registrar los rollos seleccionados!</b><hr> `+
                  `<b style="color: #f00">${error}</b>`,
                });
                this.load = true;
              });
            }, 1111);
          }
        }
      });
    }
    setTimeout(() => { this.moverInventarioBOPP(); }, 1500);
  }

  //Funcion que mueve el inventario de los rollos asignados
  moverInventarioBOPP(){
    let boppActualizada : any = [];
    let serialCantBOPP : any = [];
    for (let i = 0; i < this.ArrayBoppPedida.length; i++) {
      let dataBOPP : any = {
        serial : this.ArrayBoppPedida[i].Serial,
        Cant : this.ArrayBoppPedida[i].CantTotal,
      }

      if (!boppActualizada.includes(this.ArrayBoppPedida[i].Serial)) {
        serialCantBOPP.push(dataBOPP);
        boppActualizada.push(this.ArrayBoppPedida[i].Serial);
      } else {
        for (let b = 0; b < serialCantBOPP.length; b++) {
          if (serialCantBOPP[b].serial == this.ArrayBoppPedida[i].Serial) serialCantBOPP[b].Cant += this.ArrayBoppPedida[i].CantTotal;
        }
      }
    }
    setTimeout(() => {
      for (let j = 0; j < serialCantBOPP.length; j++) {
        this.boppService.srvObtenerListaPorSerial(serialCantBOPP[j].serial).subscribe(datos_bopp => {
          for (let k = 0; k < datos_bopp.length; k++) {
            let stock : number = datos_bopp[k].bopP_Stock;
            let restante : number = stock - serialCantBOPP[j].Cant;
            const datosBOPP : any = {
              bopP_Id : datos_bopp[k].bopP_Id,
              bopP_Nombre : datos_bopp[k].bopP_Nombre,
              bopP_Descripcion : datos_bopp[k].bopP_Descripcion,
              bopP_Serial : datos_bopp[k].bopP_Serial,
              bopP_CantidadMicras :  datos_bopp[k].bopP_CantidadMicras,
              undMed_Id : datos_bopp[k].undMed_Id,
              catMP_Id : datos_bopp[k].catMP_Id,
              bopP_Precio : datos_bopp[k].bopP_Precio,
              tpBod_Id : datos_bopp[k].tpBod_Id,
              bopP_FechaIngreso : datos_bopp[k].bopP_FechaIngreso,
              bopP_Ancho : datos_bopp[k].bopP_Ancho,
              bopP_Stock : restante,
              UndMed_Kg : datos_bopp[k].undMed_Kg,
              bopP_CantidadInicialKg : datos_bopp[k].bopP_CantidadInicialKg,
              Usua_Id : datos_bopp[k].usua_Id,
            }

            this.boppService.srvActualizar(datos_bopp[k].bopP_Id, datosBOPP).subscribe(datos_boppActualizado => {
              this.obtenerBOPP();
              Swal.fire({
                icon: 'success',
                title: 'Asignación exitosa',
                html:
                `<b>¡ASignación de rollos registrada con exito!</b><hr> `,
              });
              this.limpiarTodosLosCampos();
              this.load = true;
             }, error => {
              Swal.fire({
                icon: 'error',
                title: 'Oops...',
                html:
                `<b>¡Error al mover el inventario de los rollos selccionados!</b><hr> `+
                `<b style="color: #f00">${error}</b>`,
              });
              this.load = true;
            });
          }
        });
      }
    }, 2000);
  }
}
