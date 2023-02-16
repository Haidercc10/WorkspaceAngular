import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { AsignacionBOPPService } from 'src/app/Servicios/Asignacion_Bopp/asignacionBOPP.service';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { DetalleAsignacion_BOPPService } from 'src/app/Servicios/DetallesAsgBopp/detallesAsignacionBOPP.service';
import { EntradaBOPPService } from 'src/app/Servicios/BOPP/entrada-BOPP.service';
import { RolesService } from 'src/app/Servicios/Roles/roles.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-asignacionBOPP_TEMPORAL',
  templateUrl: './asignacionBOPP_TEMPORAL.component.html',
  styleUrls: ['./asignacionBOPP_TEMPORAL.component.css']
})
export class AsignacionBOPP_TEMPORALComponent implements OnInit {

  public load: boolean = true;
  public FormAsignacionBopp !: FormGroup;
  public FormularioBOPP !: FormGroup;
  public FormularioEdicion !: FormGroup;
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  ArrayBOPP = []; //Varibale que almacenará los BOPP existentes
  ArrayBoppPedida = []; //variable que almacenará el BOPPP pedido por una orden de trabajo
  boppSeleccionado : any = []; //Variable que almacenará la informacion del bopp que haya sido selccionado
  ordenesTrabajo = []; //Variable que almacenará las ordenes de trabajo que se consulten
  cantidadKG : number = 0; //Variable almacenará la cantidad en kilogramos pedida en la OT
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
      AsgBopp_Fecha : [this.today, Validators.required],
      AsgBopp_Observacion: ['', Validators.required],
      AsgBopp_Estado: ['', Validators.required],
    });

    this.FormularioBOPP = this.FormBuilderBOPP.group({
      boppNombre : ['', Validators.required],
      boppSerial: ['', Validators.required],
      boppCantidad : ['', Validators.required],
    });

    this.FormularioEdicion = this.FormBuilderBOPP.group({
      boppCantidad : ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.lecturaStorage();
    this.obtenerBOPP();
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
    this.ValidarRol = this.storage.get('Rol');
  }

  // funcion que limpiara los campos donde se selecciona en bopp
  limpiarCamposBOPP(){
    this.FormularioBOPP.reset();
  }

  //funcion qeu limpiará todos los campos
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
    this.arrayOT = [];
  }

  //Funcion que buscará y mostrará los BOPP existentes
  obtenerBOPP(){
    this.ArrayBOPP = [];
    this.boppService.GetBoppConExistencias().subscribe(datos_BOPP => {
      for (let i = 0; i < datos_BOPP.length; i++) {
        this.ArrayBOPP.push(datos_BOPP[i]);
      }
    });
  }

  //funcion que buscará la informacion de una orden de trabajo
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
            this.FormAsignacionBopp = this.FormBuilderAsignacion.group({
              AsgBopp_OT : '',
              AsgBopp_Ancho : this.FormAsignacionBopp.value.AsgBopp_Ancho,
              AsgBopp_Fecha : this.today,
              AsgBopp_Observacion: this.FormAsignacionBopp.value.AsgBopp_Observacion,
              AsgBopp_Estado: this.FormAsignacionBopp.value.AsgBopp_Estado,
            });
            this.cantidadKG = item.datosotKg + this.cantidadKG;
          } else if (item.estado == 4 || item.estado == 1) {
            Swal.fire({
              icon: 'warning',
              title: 'Advertencia',
              showCloseButton: true,
              html: `<b>¡No es podible asignar a esta orden de trabajo, la OT ${ordenTrabajo} se encuentra cerrada!</b>`
            });
          }
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
              this.FormAsignacionBopp = this.FormBuilderAsignacion.group({
                AsgBopp_OT : '',
                AsgBopp_Ancho : this.FormAsignacionBopp.value.AsgBopp_Ancho,
                AsgBopp_Fecha : this.today,
                AsgBopp_Observacion: this.FormAsignacionBopp.value.AsgBopp_Observacion,
                AsgBopp_Estado: this.FormAsignacionBopp.value.AsgBopp_Estado,
              });
            } else if (itemOT.estado == 4 || itemOT.estado == 1) {
              Swal.fire({
                icon: 'warning',
                title: 'Advertencia',
                showCloseButton: true,
                html: `<b>¡No es podible asignar a esta orden de trabajo, la OT ${ordenTrabajo} se encuentra cerrada!</b>`
              });
            }
          }
        });
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Advertencia',
          showCloseButton: true,
          html: `<b>¡La OT ${ordenTrabajo} ya se encuentra en la tabla!</b>`
        });
      }
    }
  }

  // Función para quitar una Ot de la tabla
  QuitarOrdenTrabajo(data : any) {
    Swal.fire({
      title: '¿Estás seguro de eliminar la OT de la Asignación?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.cantidadKG = this.cantidadKG - data.kg;
        for (let i = 0; i < this.ordenesTrabajo.length; i++) {
          if (this.ordenesTrabajo[i].ot == data.ot)  this.ordenesTrabajo.splice(i, 1);
        }
        for (let i = 0; i < this.arrayOT.length; i++) {
          if (this.arrayOT[i] == data.ot)  this.arrayOT.splice(i, 1);
        }
        Swal.fire('Orden de Trabajo eliminada');
      }
    });
  }

  // funcion que buscará la informacion del rollo seleccionado
  BOPPSeleccionado(){
    this.boppService.srvObtenerListaPorSerial(this.FormularioBOPP.value.boppNombre).subscribe(datos_bopp => {
      for (let i = 0; i < datos_bopp.length; i++) {
        this.FormularioBOPP.setValue({
          boppSerial: datos_bopp[i].bopP_Serial,
          boppNombre : datos_bopp[i].bopP_Nombre,
          boppCantidad : datos_bopp[i].bopP_Stock,
        });
      }
    });
  }

  // funcion que quitará un rollo de la tabla
  quitarBOPP(data : any){
    Swal.fire({
      title: '¿Estás seguro de eliminar la Materia Prima de la Asignación?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        for (let i = 0; i < this.ArrayBoppPedida.length; i++) {
          if (this.ArrayBoppPedida[i].Serial == data.Serial) this.ArrayBoppPedida.splice(i, 1);
        }
        Swal.fire('Orden de Trabajo eliminada');
      }
    });
  }

  // funcion que validará que haya un rollo seleccionado para asignar
  validarCamposBOPP(){
    if (this.FormularioBOPP.valid) this.cargarBOPPTabla();
    else {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        showCloseButton: true,
        html: `<b>¡Debe cargar seleccionar un rollo!</b>`
      });
    }
  }

  //funcion que cargará la informacion de los rollos en la tabla
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

  // funcion que validará los campos para poder realizar la asignación
  validarAsignacion(){
    if (this.ordenesTrabajo.length > 0){
      if (this.ArrayBoppPedida.length > 0) this.asignarBOPP();
      else {
        Swal.fire({
          icon: 'warning',
          title: 'Advertencia',
          showCloseButton: true,
          html: `<b>¡Debe cargar minimo un rollo!</b>`
        });
      }
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        showCloseButton: true,
        html: `<b>¡Debe cargar minimo una Orden de Trabajo!</b>`
      });
    }
  }

  // funcion que creará la asignacion de rollo
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
    this.asignacionBOPPService.srvGuardar(datos).subscribe(datos_asginacionBOPP => { this.obtenerIdUltimaAsignacion(); }, error => {
      Swal.fire({
        icon: 'error',
        title: 'Opps...',
        showCloseButton: true,
        html: `<b>¡Se ha producido un error al momento de crear la asignación!</b><br>` +
        `<spam style="color: #f00">${error.message}</spam>`
      });
    });
  }

  // funcion que buscará el id de la ultima asignacion de rollos
  obtenerIdUltimaAsignacion(){
    this.asignacionBOPPService.srvObtenerListaUltimoId().subscribe(datos_asignaciones => { this.detallesAsginacionBOPP(datos_asignaciones); }, error => {
      Swal.fire({
        icon: 'error',
        title: 'Opps...',
        showCloseButton: true,
        html: `<b>¡Se ha producido un error al Id de la asignación!</b><br>` +
        `<spam style="color: #f00">${error.message}</spam>`
      });
    });
  }

  // funcion que creará los detalles de la asignacion de rollos
  detallesAsginacionBOPP(idAsignacion : any){
    let documento : string;
    for (let i = 0; i < this.ordenesTrabajo.length; i++) {
      for (let j = 0; j < this.ArrayBoppPedida.length; j++) {
        this.boppService.srvObtenerListaPorSerial(this.ArrayBoppPedida[j].Serial).subscribe(datos_bopp => {
          for (let k = 0; k < datos_bopp.length; k++) {
            if (datos_bopp[k].bopP_Serial == this.ArrayBoppPedida[j].Serial) {
              if (datos_bopp[k].catMP_Id == 6) documento = 'ASIGBOPP';
              else if (datos_bopp[k].catMP_Id == 14) documento = 'ASIGBOPA';
              else if (datos_bopp[k].catMP_Id == 15) documento = 'ASIGPOLY';
              let cantidad = this.ArrayBoppPedida[j].Cantidad2 / this.ordenesTrabajo.length;
              let datos : any = {
                AsigBOPP_Id : idAsignacion.asigBOPP_Id,
                BOPP_Id : datos_bopp[k].bopP_Id,
                DtAsigBOPP_Cantidad : cantidad,
                UndMed_Id : 'Kg',
                Proceso_Id : 'CORTE',
                DtAsigBOPP_OrdenTrabajo : this.ordenesTrabajo[i].ot,
                Estado_OrdenTrabajo : 14,
                TpDoc_Id : documento,
              }
              this.detallesAsignacionBOPPService.srvGuardar(datos).subscribe(datos_detallesAsignacion => { }, error => {
                Swal.fire({
                  icon: 'error',
                  title: 'Opps...',
                  showCloseButton: true,
                  html: `<b>¡Se ha producido un error al momento de crear la asignación del rollo!</b><br>` +
                  `<spam style="color: #f00">${error.message}</spam>`
                });
              });
            }
          }
        });
      }
    }
    setTimeout(() => { this.moverBopp(); }, 5000);
  }

  //funcion que va a mover el inventario de los rollos
  moverBopp(){
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
            bopP_Stock : datos_bopp[j].bopP_Stock - this.ArrayBoppPedida[i].Cantidad2,
            UndMed_Kg : datos_bopp[j].undMed_Kg,
            bopP_CantidadInicialKg : datos_bopp[j].bopP_CantidadInicialKg,
            usua_Id : datos_bopp[j].usua_Id,
          }

          this.boppService.srvActualizar(datos_bopp[j].bopP_Id, datosBOPP).subscribe(datos_boppActualizado => {
            this.obtenerBOPP();
            Swal.fire({
              icon: 'success',
              title: 'Asignación exitosa',
              showCloseButton: true,
              html: `<b>¡Se ha creado exitosamente la asignación de rollos!</b><br>`
            });
            this.limpiarTodosLosCampos();
            this.load = true;

          }, error => {
            Swal.fire({
              icon: 'error',
              title: 'Opps...',
              showCloseButton: true,
              html: `<b>¡Se ha producido un error al momento de mover el inventario del rollo ${this.ArrayBoppPedida[i].Nombre}!</b><br>` +
              `<spam style="color: #f00">${error.message}</spam>`
            });
          });
        }
      });
    }
  }
}
