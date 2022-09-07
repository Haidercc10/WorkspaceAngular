import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { EstadosService } from 'src/app/Servicios/estados.service';
import { EstadosProcesos_OTService } from 'src/app/Servicios/EstadosProcesos_OT.service';
import { FallasTecnicasService } from 'src/app/Servicios/FallasTecnicas.service';
import { RolesService } from 'src/app/Servicios/roles.service';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-Reporte_Procesos_OT',
  templateUrl: './Reporte_Procesos_OT.component.html',
  styleUrls: ['./Reporte_Procesos_OT.component.css']
})
export class Reporte_Procesos_OTComponent implements OnInit {

  public formularioOT !: FormGroup;
  public page : number; //Variable que tendrá el paginado de la tabla en la que se muestran los pedidos consultados
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  today : any = new Date(); //Variable que se usará para llenar la fecha actual
  month : any = new Date(); //Variable que se usará para llenar la fecha de hace un mes
  ArrayDocumento = []; //Varibale que almacenará la información que se mostrará en la tabla de vista
  load : boolean = true; //Variable que permitirá validar si debe salir o no la imagen de carga
  fallas : any = []; //Variable que almacenará las posibles fallas que puede tener una orden de trabajo en produccion
  otSeleccionada : number = 0; //Variable que almacenará el numero de la OT que fue previamente seleccionada

  constructor(private frmBuilder : FormBuilder,
                @Inject(SESSION_STORAGE) private storage: WebStorageService,
                  private rolService : RolesService,
                    private fallasTecnicasService : FallasTecnicasService,
                      private estadosProcesos_OTService : EstadosProcesos_OTService,
                        private estadosService : EstadosService,) {

    this.formularioOT = this.frmBuilder.group({
      idDocumento : [null],
      fecha: [null],
      fechaFinal : [null],
      estado : [null],
      fallasOT : [null],
      ObservacionOT : [''],
    });
  }

  ngOnInit() {
    this.fecha();
    this.lecturaStorage();
    this.ObternerFallas();
  }

  //Funcion que colocará la fecha actual
  fecha(){
    this.today = new Date();
    var dd : any = this.today.getDate();
    var mm : any = this.today.getMonth() + 1;
    var yyyy : any = this.today.getFullYear();
    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
    this.today = yyyy + '-' + mm + '-' + dd;

    this.month = new Date();
    var dd : any = this.month.getDate();
    var mm : any = this.month.getMonth();
    var yyyy : any;
    (mm == 12) ? yyyy = this.month.getFullYear() - 1 : yyyy = this.month.getFullYear();
    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
    this.month = yyyy + '-' + mm + '-' + dd;
  }

  /**Leer storage para validar su rol y mostrar el usuario. */
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

  // Funcion que exportará a excel todo el contenido de la tabla
  exportToExcel() : void {
    if (this.ArrayDocumento.length == 0) Swal.fire("¡Para poder crear el archivo de Excel primero debe cargar minimo un OT en la tabla!");
    else {
      this.load = false;
      setTimeout(() => {
        let element = document.getElementById('table2');
        const worksheet : XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);
        const book : XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(book, worksheet, 'Sheet1');
        XLSX.writeFile(book, `Reporte de OT por Procesos - ${this.today}.xlsx`);
        this.load = true;
      }, 1500);
    }
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = '$1,';
    return number.toString().replace(exp,rep);
  }

  // Funcion que limpiará todos los campos de la vista
  limpiarCampos(){
    this.ArrayDocumento = [];
    this.formularioOT = this.frmBuilder.group({
      idDocumento : [null],
      fecha: [null],
      fechaFinal : [null],
      estado : [null],
      fallasOT : [null],
      ObservacionOT : [''],
    });
    this.otSeleccionada = 0;
  }

  // Funcion que mostrará las posibles fallas que puede tener una orden de trabajo en produccion
  ObternerFallas(){
    this.fallasTecnicasService.srvObtenerLista().subscribe(datos_fallas => {
      for (let i = 0; i < datos_fallas.length; i++) {
        this.fallas.push(datos_fallas[i]);
      }
    });
  }

  //Funcion que consultará las ordenes de trabajo dependiendo de los filtros que se le pasen
  consultarOT(){
    this.load = false;
    this.otSeleccionada = 0;
    this.ArrayDocumento = [];
    let numOT : number = this.formularioOT.value.idDocumento;
    let fechaincial : any = this.formularioOT.value.fecha;
    let fechaFinal : any = this.formularioOT.value.fechaFinal;
    let fallas : any = this.formularioOT.value.fallasOT;

    if (numOT != null && fechaincial != null && fechaFinal != null && fallas != null) {
      this.estadosProcesos_OTService.srvObtenerListaPorOtFechasFallas(numOT, fechaincial, fechaFinal, fallas).subscribe(datos_ot => {
        for (let i = 0; i < datos_ot.length; i++) {
          this.llenarArray(datos_ot[i].estProcOT_OrdenTrabajo,
                          datos_ot[i].estProcOT_ExtrusionKg,
                          datos_ot[i].estProcOT_ImpresionKg,
                          datos_ot[i].estProcOT_RotograbadoKg,
                          datos_ot[i].estProcOT_DobladoKg,
                          datos_ot[i].estProcOT_LaminadoKg,
                          datos_ot[i].estProcOT_CorteKg,
                          datos_ot[i].estProcOT_EmpaqueKg,
                          datos_ot[i].estProcOT_SelladoKg,
                          datos_ot[i].estProcOT_WiketiadoKg,
                          datos_ot[i].estProcOT_CantidadPedida,
                          datos_ot[i].falla_Id,
                          datos_ot[i].estProcOT_Observacion,
                          datos_ot[i].estado_Id,
                          datos_ot[i].estProcOT_FechaCreacion,);
        }
      });
    } else if (fechaincial != null && fechaFinal != null && fallas != null) {
      this.estadosProcesos_OTService.srvObtenerListaPorFechasFallas(fechaincial, fechaFinal, fallas).subscribe(datos_ot => {
        for (let i = 0; i < datos_ot.length; i++) {
          this.llenarArray(datos_ot[i].estProcOT_OrdenTrabajo,
                          datos_ot[i].estProcOT_ExtrusionKg,
                          datos_ot[i].estProcOT_ImpresionKg,
                          datos_ot[i].estProcOT_RotograbadoKg,
                          datos_ot[i].estProcOT_DobladoKg,
                          datos_ot[i].estProcOT_LaminadoKg,
                          datos_ot[i].estProcOT_CorteKg,
                          datos_ot[i].estProcOT_EmpaqueKg,
                          datos_ot[i].estProcOT_SelladoKg,
                          datos_ot[i].estProcOT_WiketiadoKg,
                          datos_ot[i].estProcOT_CantidadPedida,
                          datos_ot[i].falla_Id,
                          datos_ot[i].estProcOT_Observacion,
                          datos_ot[i].estado_Id,
                          datos_ot[i].estProcOT_FechaCreacion,);
        }
      });
    } else if (numOT != null && fechaincial != null && fechaFinal != null) {
      this.estadosProcesos_OTService.srvObtenerListaPorOtFechas(numOT, fechaincial, fechaFinal).subscribe(datos_ot => {
        for (let i = 0; i < datos_ot.length; i++) {
          this.llenarArray(datos_ot[i].estProcOT_OrdenTrabajo,
                          datos_ot[i].estProcOT_ExtrusionKg,
                          datos_ot[i].estProcOT_ImpresionKg,
                          datos_ot[i].estProcOT_RotograbadoKg,
                          datos_ot[i].estProcOT_DobladoKg,
                          datos_ot[i].estProcOT_LaminadoKg,
                          datos_ot[i].estProcOT_CorteKg,
                          datos_ot[i].estProcOT_EmpaqueKg,
                          datos_ot[i].estProcOT_SelladoKg,
                          datos_ot[i].estProcOT_WiketiadoKg,
                          datos_ot[i].estProcOT_CantidadPedida,
                          datos_ot[i].falla_Id,
                          datos_ot[i].estProcOT_Observacion,
                          datos_ot[i].estado_Id,
                          datos_ot[i].estProcOT_FechaCreacion,);
        }
      });
    } else if (fechaincial != null && fechaFinal != null) {
      this.estadosProcesos_OTService.srvObtenerListaPorFechas(fechaincial, fechaFinal).subscribe(datos_ot => {
        for (let i = 0; i < datos_ot.length; i++) {
          this.llenarArray(datos_ot[i].estProcOT_OrdenTrabajo,
                          datos_ot[i].estProcOT_ExtrusionKg,
                          datos_ot[i].estProcOT_ImpresionKg,
                          datos_ot[i].estProcOT_RotograbadoKg,
                          datos_ot[i].estProcOT_DobladoKg,
                          datos_ot[i].estProcOT_LaminadoKg,
                          datos_ot[i].estProcOT_CorteKg,
                          datos_ot[i].estProcOT_EmpaqueKg,
                          datos_ot[i].estProcOT_SelladoKg,
                          datos_ot[i].estProcOT_WiketiadoKg,
                          datos_ot[i].estProcOT_CantidadPedida,
                          datos_ot[i].falla_Id,
                          datos_ot[i].estProcOT_Observacion,
                          datos_ot[i].estado_Id,
                          datos_ot[i].estProcOT_FechaCreacion,);
        }
      });
    } else if (numOT != null && fechaincial != null) {
      this.estadosProcesos_OTService.srvObtenerListaPorOtFecha(numOT, fechaincial).subscribe(datos_ot => {
        for (let i = 0; i < datos_ot.length; i++) {
          this.llenarArray(datos_ot[i].estProcOT_OrdenTrabajo,
                          datos_ot[i].estProcOT_ExtrusionKg,
                          datos_ot[i].estProcOT_ImpresionKg,
                          datos_ot[i].estProcOT_RotograbadoKg,
                          datos_ot[i].estProcOT_DobladoKg,
                          datos_ot[i].estProcOT_LaminadoKg,
                          datos_ot[i].estProcOT_CorteKg,
                          datos_ot[i].estProcOT_EmpaqueKg,
                          datos_ot[i].estProcOT_SelladoKg,
                          datos_ot[i].estProcOT_WiketiadoKg,
                          datos_ot[i].estProcOT_CantidadPedida,
                          datos_ot[i].falla_Id,
                          datos_ot[i].estProcOT_Observacion,
                          datos_ot[i].estado_Id,
                          datos_ot[i].estProcOT_FechaCreacion,);
        }
      });
    } else if (numOT != null && fallas != null) {
      this.estadosProcesos_OTService.srvObtenerListaPorOtFallas(numOT, fallas).subscribe(datos_ot => {
        for (let i = 0; i < datos_ot.length; i++) {
          this.llenarArray(datos_ot[i].estProcOT_OrdenTrabajo,
                          datos_ot[i].estProcOT_ExtrusionKg,
                          datos_ot[i].estProcOT_ImpresionKg,
                          datos_ot[i].estProcOT_RotograbadoKg,
                          datos_ot[i].estProcOT_DobladoKg,
                          datos_ot[i].estProcOT_LaminadoKg,
                          datos_ot[i].estProcOT_CorteKg,
                          datos_ot[i].estProcOT_EmpaqueKg,
                          datos_ot[i].estProcOT_SelladoKg,
                          datos_ot[i].estProcOT_WiketiadoKg,
                          datos_ot[i].estProcOT_CantidadPedida,
                          datos_ot[i].falla_Id,
                          datos_ot[i].estProcOT_Observacion,
                          datos_ot[i].estado_Id,
                          datos_ot[i].estProcOT_FechaCreacion,);
        }
      });
    } else if (fechaincial != null && fallas != null) {
      this.estadosProcesos_OTService.srvObtenerListaPorOtFechaFalla(fechaincial, fallas).subscribe(datos_ot => {
        for (let i = 0; i < datos_ot.length; i++) {
          this.llenarArray(datos_ot[i].estProcOT_OrdenTrabajo,
                          datos_ot[i].estProcOT_ExtrusionKg,
                          datos_ot[i].estProcOT_ImpresionKg,
                          datos_ot[i].estProcOT_RotograbadoKg,
                          datos_ot[i].estProcOT_DobladoKg,
                          datos_ot[i].estProcOT_LaminadoKg,
                          datos_ot[i].estProcOT_CorteKg,
                          datos_ot[i].estProcOT_EmpaqueKg,
                          datos_ot[i].estProcOT_SelladoKg,
                          datos_ot[i].estProcOT_WiketiadoKg,
                          datos_ot[i].estProcOT_CantidadPedida,
                          datos_ot[i].falla_Id,
                          datos_ot[i].estProcOT_Observacion,
                          datos_ot[i].estado_Id,
                          datos_ot[i].estProcOT_FechaCreacion,);
        }
      });
    } else if (numOT != null) {
      this.estadosProcesos_OTService.srvObtenerListaPorOT(numOT).subscribe(datos_ot => {
        for (let i = 0; i < datos_ot.length; i++) {
          this.llenarArray(datos_ot[i].estProcOT_OrdenTrabajo,
                          datos_ot[i].estProcOT_ExtrusionKg,
                          datos_ot[i].estProcOT_ImpresionKg,
                          datos_ot[i].estProcOT_RotograbadoKg,
                          datos_ot[i].estProcOT_DobladoKg,
                          datos_ot[i].estProcOT_LaminadoKg,
                          datos_ot[i].estProcOT_CorteKg,
                          datos_ot[i].estProcOT_EmpaqueKg,
                          datos_ot[i].estProcOT_SelladoKg,
                          datos_ot[i].estProcOT_WiketiadoKg,
                          datos_ot[i].estProcOT_CantidadPedida,
                          datos_ot[i].falla_Id,
                          datos_ot[i].estProcOT_Observacion,
                          datos_ot[i].estado_Id,
                          datos_ot[i].estProcOT_FechaCreacion,);
        }
      });
    } else if (fechaincial != null) {
      this.estadosProcesos_OTService.srvObtenerListaPorFecha(fechaincial).subscribe(datos_ot => {
        for (let i = 0; i < datos_ot.length; i++) {
          this.llenarArray(datos_ot[i].estProcOT_OrdenTrabajo,
                          datos_ot[i].estProcOT_ExtrusionKg,
                          datos_ot[i].estProcOT_ImpresionKg,
                          datos_ot[i].estProcOT_RotograbadoKg,
                          datos_ot[i].estProcOT_DobladoKg,
                          datos_ot[i].estProcOT_LaminadoKg,
                          datos_ot[i].estProcOT_CorteKg,
                          datos_ot[i].estProcOT_EmpaqueKg,
                          datos_ot[i].estProcOT_SelladoKg,
                          datos_ot[i].estProcOT_WiketiadoKg,
                          datos_ot[i].estProcOT_CantidadPedida,
                          datos_ot[i].falla_Id,
                          datos_ot[i].estProcOT_Observacion,
                          datos_ot[i].estado_Id,
                          datos_ot[i].estProcOT_FechaCreacion,);
        }
      });
    } else if (fallas != null) {
      this.estadosProcesos_OTService.srvObtenerListaPorFallas(fallas).subscribe(datos_ot => {
        for (let i = 0; i < datos_ot.length; i++) {
          this.llenarArray(datos_ot[i].estProcOT_OrdenTrabajo,
                          datos_ot[i].estProcOT_ExtrusionKg,
                          datos_ot[i].estProcOT_ImpresionKg,
                          datos_ot[i].estProcOT_RotograbadoKg,
                          datos_ot[i].estProcOT_DobladoKg,
                          datos_ot[i].estProcOT_LaminadoKg,
                          datos_ot[i].estProcOT_CorteKg,
                          datos_ot[i].estProcOT_EmpaqueKg,
                          datos_ot[i].estProcOT_SelladoKg,
                          datos_ot[i].estProcOT_WiketiadoKg,
                          datos_ot[i].estProcOT_CantidadPedida,
                          datos_ot[i].falla_Id,
                          datos_ot[i].estProcOT_Observacion,
                          datos_ot[i].estado_Id,
                          datos_ot[i].estProcOT_FechaCreacion,);
        }
      });
    } else {
      this.estadosProcesos_OTService.srvObtenerListaPorFecha(this.today).subscribe(datos_ot => {
        for (let i = 0; i < datos_ot.length; i++) {
          this.llenarArray(datos_ot[i].estProcOT_OrdenTrabajo,
                          datos_ot[i].estProcOT_ExtrusionKg,
                          datos_ot[i].estProcOT_ImpresionKg,
                          datos_ot[i].estProcOT_RotograbadoKg,
                          datos_ot[i].estProcOT_DobladoKg,
                          datos_ot[i].estProcOT_LaminadoKg,
                          datos_ot[i].estProcOT_CorteKg,
                          datos_ot[i].estProcOT_EmpaqueKg,
                          datos_ot[i].estProcOT_SelladoKg,
                          datos_ot[i].estProcOT_WiketiadoKg,
                          datos_ot[i].estProcOT_CantidadPedida,
                          datos_ot[i].falla_Id,
                          datos_ot[i].estProcOT_Observacion,
                          datos_ot[i].estado_Id,
                          datos_ot[i].estProcOT_FechaCreacion,);
        }
      });
    }
    setTimeout(() => {
      this.load = true;
    }, 2000);
  }

  //Funcion encargada de llenar un array con la informacion de las ordenes de trabajo y el producido de cada area
  llenarArray(ot : number, ext : number, imp : number, rot : number, dbl : number, lam : number, cor : number, emp : number, sel : number, wik : number, can : number, falla : string, observacion : string, estado : any, fecha : any,){
    let info : any = {
      ot : ot,
      ext : ext,
      imp : imp,
      rot : rot,
      dbl : dbl,
      lam : lam,
      cor : cor,
      emp : emp,
      sel : sel,
      wik : wik,
      cant : can,
      falla : falla,
      obs : observacion,
      est : estado,
      fecha : fecha,
    }
    this.fallasTecnicasService.srvObtenerListaPorId(falla).subscribe(datos_fallas => {
      info.falla = datos_fallas.falla_Nombre;
    });
    this.estadosService.srvObtenerListaPorId(estado).subscribe(datos_estados => {
      let estados : any = [];
      estados.push(datos_estados);
      for (const i of estados) {
        info.est = i.estado_Nombre;
      }
    });
    this.ArrayDocumento.push(info);
    this.ArrayDocumento.sort((a,b) => a.fecha.localeCompare(b.fecha));
    this.ArrayDocumento.sort((a,b) => Number(a.ot)- Number(b.ot));
    this.load = true;
  }

  // Funcion que va a asignar un valor una variable, el valor será la orden de trabajo sobre la que se le dió click
  seleccionarFilaTabla(form : any){
    this.otSeleccionada = form.ot;
  }

  // Funcion que va a añadir una falla o observacion a una ot
  anadirFalla(){
    let falla : number = this.formularioOT.value.fallasOT;
    let observacion : string = this.formularioOT.value.ObservacionOT;

    this.estadosProcesos_OTService.srvObtenerListaPorOT(this.otSeleccionada).subscribe(datos_ot => {
      for (let i = 0; i < datos_ot.length; i++) {
        let info : any = {
          EstProcOT_OrdenTrabajo : datos_ot[i].estProcOT_OrdenTrabajo,
          EstProcOT_ExtrusionKg : datos_ot[i].estProcOT_ExtrusionKg,
          EstProcOT_ImpresionKg : datos_ot[i].estProcOT_ImpresionKg,
          EstProcOT_RotograbadoKg : datos_ot[i].estProcOT_RotograbadoKg,
          EstProcOT_LaminadoKg : datos_ot[i].estProcOT_LaminadoKg,
          EstProcOT_CorteKg : datos_ot[i].estProcOT_CorteKg,
          EstProcOT_DobladoKg : datos_ot[i].estProcOT_DobladoKg,
          EstProcOT_SelladoKg : datos_ot[i].estProcOT_SelladoKg,
          EstProcOT_SelladoUnd : datos_ot[i].estProcOT_SelladoUnd,
          EstProcOT_WiketiadoKg : datos_ot[i].estProcOT_WiketiadoKg,
          EstProcOT_WiketiadoUnd : datos_ot[i].estProcOT_WiketiadoUnd,
          EstProcOT_CantidadPedida : datos_ot[i].estProcOT_CantidadPedida,
          UndMed_Id : datos_ot[i].undMed_Id,
          Estado_Id : datos_ot[i].estado_Id,
          Falla_Id : falla,
          EstProcOT_Observacion : observacion,
          EstProcOT_FechaCreacion : datos_ot[i].estProcOT_FechaCreacion,
          EstProcOT_EmpaqueKg : datos_ot[i].estProcOT_EmpaqueKg,
        }

        this.estadosProcesos_OTService.srvActualizarPorOT(this.otSeleccionada, info).subscribe(datos_ot => {
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
            title: `Falla agregada a la OT ${this.otSeleccionada} con exito!`
          });
          this.limpiarCampos();
        });
      }
    });
  }
}
