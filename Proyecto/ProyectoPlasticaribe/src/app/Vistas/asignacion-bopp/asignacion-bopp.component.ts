import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { AsignacionBOPPService } from 'src/app/Servicios/asignacionBOPP.service';
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

  constructor(private FormBuilderAsignacion : FormBuilder,
                private FormBuilderBOPP : FormBuilder,
                  @Inject(SESSION_STORAGE) private storage: WebStorageService,
                    private rolService : RolesService,
                      private boppService : EntradaBOPPService,
                        private asignacionBOPPService : AsignacionBOPPService,
                          private detallesAsignacionBOPPService : DetalleAsignacion_BOPPService) {

    this.FormAsignacionBopp = this.FormBuilderAsignacion.group({
      AsgBopp_OT : ['', Validators.required],
      AsgBopp_Fecha : ['', Validators.required],
      AsgBopp_Observacion: ['', Validators.required],
      AsgBopp_Estado: ['', Validators.required],
    });

    this.FormularioBOPP = this.FormBuilderBOPP.group({
      boppId : ['', Validators.required],
      boppNombre : ['', Validators.required],
      boppSerial: ['', Validators.required],
      boppStock: ['', Validators.required],
      boppCantidad : ['', Validators.required],
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
      AsgBopp_Fecha : this.today,
      AsgBopp_Observacion: '',
      AsgBopp_Estado: '',
    });
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
  obtenerBOPP(){
    this.boppService.srvObtenerLista().subscribe(datos_BOPP => {
      for (let i = 0; i < datos_BOPP.length; i++) {
        this.ArrayBOPP.push(datos_BOPP[i]);
      }
    });
  }

  limpiarCamposBOPP(){
    this.FormularioBOPP.reset();
  }

  limpiarTodosLosCampos(){
    this.FormAsignacionBopp = this.FormBuilderAsignacion.group({
      AsgBopp_OT : '',
      AsgBopp_Fecha : this.today,
      AsgBopp_Observacion: '',
      AsgBopp_Estado: '',
    });
    this.FormularioBOPP.reset();
    this.ArrayBoppPedida = [];
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

  BOPPBuscado(){
    this.boppSeleccionado = [];
    let serial : string = this.FormularioBOPP.value.boppSerial;
    this.boppService.srvObtenerListaPorSerial(serial).subscribe(datos_bopp => {
      for (let i = 0; i < datos_bopp.length; i++) {
        this.boppSeleccionado.push(datos_bopp[i]);
        this.cargarBOPP();
      }
    });
  }

  cargarBOPP(){
    for (const item of this.boppSeleccionado) {
      this.FormularioBOPP.setValue({
        boppId : item.bopP_Id,
        boppSerial: item.bopP_Serial,
        boppNombre : item.bopP_Nombre,
        boppStock: item.bopP_Cantidad,
        boppCantidad : '',
      });
    }
  }

  validarCamposBOPP(){
    if (this.FormularioBOPP.valid) this.cargarBOPPTabla();
    else Swal.fire("Debe cargar minimo un BOPP en la tabla para realizar la asignación");
  }

  //
  cargarBOPPTabla(){
    let id : number = this.FormularioBOPP.value.boppId;
    let serial : string = this.FormularioBOPP.value.boppSerial;
    let nombre : string = this.FormularioBOPP.value.boppNombre;
    let cantidad : number = this.FormularioBOPP.value.boppCantidad;

    let bopp : any = {
      Id : id,
      Serial : serial,
      Nombre : nombre,
      Cant : cantidad,
      UndCant : 'µm',
    }

    this.ArrayBoppPedida.push(bopp);
    this.FormularioBOPP.reset();
  }

  //
  asignarBOPP(){
    let ot : number = this.FormAsignacionBopp.value.AsgBopp_OT;
    let observacion : string = this.FormAsignacionBopp.value.AsgBopp_Observacion;

    const datos : any = {
      AsigBOPP_OrdenTrabajo : ot,
      AsigBOPP_FechaEntrega : this.today,
      AsigBOPP_Observacion : observacion,
      Usua_Id : this.storage_Id,
      Estado_Id : 13,
    }

    this.asignacionBOPPService.srvGuardar(datos).subscribe(datos_asginacionBOPP => {
      this.obtenerIdUltimaAsignacion();
    });
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
  }

  detallesAsginacionBOPP(idAsignacion : number){
    for (let i = 0; i < this.ArrayBoppPedida.length; i++) {

      let datos : any = {
        AsigBOPP_Id : idAsignacion,
        BOPP_Id : this.ArrayBoppPedida[i].Id,
        DtAsigBOPP_Cantidad : this.ArrayBoppPedida[i].Cant,
        UndMed_Id : 'µm',
        Proceso_Id : 'EXT',
      }

      this.detallesAsignacionBOPPService.srvGuardar(datos).subscribe(datos_detallesAsignacion => {
        this.moverInventarioBOPP(datos.BOPP_Id, datos.DtAsigBOPP_Cantidad);
      });
    }
  }

  //
  moverInventarioBOPP(id : number, cantidad : number){
    this.boppService.srvObtenerListaPorId(id).subscribe(datos_bopp => {
      let bopp : any = [];
      bopp.push(datos_bopp);
      for (const item of bopp) {
        let stock : number = item.bopP_Cantidad;
        let cantidadFinal : number = stock - cantidad;

        let FechaDatetime = item.bopP_FechaIngreso;
        let FechaCreacionNueva = FechaDatetime.indexOf("T");
        let fechaCreacionFinal = FechaDatetime.substring(0, FechaCreacionNueva);

        let datosBOPP : any = {
          bopP_Id : item.bopP_Id,
          bopP_Nombre : item.bopP_Nombre,
          bopP_Descripcion : item.bopP_Descripcion,
          bopP_Serial : item.bopP_Serial,
          bopP_Cantidad : cantidadFinal,
          undMed_Id : item.undMed_Id,
          catMP_Id : item.catMP_Id,
          bopP_Precio : item.bopP_Precio,
          tpBod_Id : item.tpBod_Id,
          bopP_FechaIngreso : item.bopP_FechaIngreso,
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

        }, error => { console.log(error); });
      }
    });
  }

}
