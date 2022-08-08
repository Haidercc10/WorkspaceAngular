import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import pdfMake from 'pdfmake/build/pdfmake';
import { AsignacionBOPPService } from 'src/app/Servicios/asignacionBOPP.service';
import { AsignacionMPService } from 'src/app/Servicios/asignacionMP.service';
import { BagproService } from 'src/app/Servicios/Bagpro.service';
import { DetallesAsignacionService } from 'src/app/Servicios/detallesAsignacion.service';
import { DetalleAsignacion_BOPPService } from 'src/app/Servicios/detallesAsignacionBOPP.service';
import { EntradaBOPPService } from 'src/app/Servicios/entrada-BOPP.service';
import { EstadosService } from 'src/app/Servicios/estados.service';
import { RolesService } from 'src/app/Servicios/roles.service';
import { TipoDocumentoService } from 'src/app/Servicios/tipoDocumento.service';
import { UsuarioService } from 'src/app/Servicios/usuario.service';
import Swal from 'sweetalert2';
import { AsignacionMateriaPrimaComponent } from '../asignacion-materia-prima/asignacion-materia-prima.component';

@Component({
  selector: 'app-reporte-estados-ot',
  templateUrl: './reporte-estados-ot.component.html',
  styleUrls: ['./reporte-estados-ot.component.css']
})
export class ReporteEstadosOTComponent implements OnInit {

  public formularioOT !: FormGroup;
  public page : number; //Variable que tendrá el paginado de la tabla en la que se muestran los pedidos consultados
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  titulosTabla = []; //Array que mostrará los encabezados de los campos de la tabla.
  today : any = new Date(); //Variable que se usará para llenar la fecha actual
  ArrayDocumento = []; //Varibale que almacenará la información que se mostrará en la tabla de vista
  OtConsultadas : any = []; //Variable que nos ayudará a saber que OT ya estamos mostrando en la tabla de la vista para no repetirla mas de una vez
  OtConsultadasBOPP : any = []; //Variable que nos ayudará a saber que OT ya estamos mostrando en la tabla de la vista para no repetirla mas de una vez en este caso para asignaciones de BOPP
  ArrayAsgOt : any = []; //Variable que almacenará la materia prima asignada a una orden de trabajo, en este caso la que se esta consultando
  cantidadKgTotalEntreagada : number = 0; //Variable que almacenará la cantidad total de kg asignados a una OT
  producidoEmpKg : number = 0; //Variable que almacenará la cantidad de Kg producidas en empaque
  producidoSellKg : number = 0; //Variable que almacenará la cantidad de Kg producidas en sellado
  producidoSellUnd : number = 0; //Variable que almacenará la cantidad de unidades producidas en sellado
  load : boolean = true; //Variable que permitirá validar si debe salir o no la imagen de carga

  constructor(private frmBuilder : FormBuilder,
                @Inject(SESSION_STORAGE) private storage: WebStorageService,
                  private rolService : RolesService,
                    private tipoDocumentoService : TipoDocumentoService,
                      private bagProServices : BagproService,
                        private asignacionService : AsignacionMPService,
                          private asignacionMpService : DetallesAsignacionService,
                            private usuariosService : UsuarioService,
                              private estadosService : EstadosService,
                                private boppService : EntradaBOPPService,
                                  private asignacionBOPPService : AsignacionBOPPService,
                                    private detallesAsgBOPPService : DetalleAsignacion_BOPPService) {

      this.formularioOT = this.frmBuilder.group({
        idDocumento : new FormControl(),
        fecha: new FormControl(),
        fechaFinal : new FormControl(),
        TipoDocumento: new FormControl(),
        estado : new FormControl(),
    });

  }

  /** Funcion que se ejecuta al iniciar dicha vista */
  ngOnInit(): void {
    this.ColumnasTabla();
    this.lecturaStorage();
    this.fecha();
  }

  /** Inicialización de formularios como requeridos */
  initForms() {
    this.formularioOT = this.frmBuilder.group({
      idDocumento : [,Validators.required],
      fecha: [, Validators.required],
      fechaFinal: [, Validators.required],
      TipoDocumento: [, Validators.required],
      estado : ['', Validators.required],
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

  /**Leer sorage para validar su rol y mostrar el usuario. */
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

  /* FUNCION PARA RELIZAR CONFIMACIÓN DE SALIDA */
  confimacionSalida(){
    Swal.fire({
      title: '¿Seguro que desea salir?',
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: 'Salir',
      denyButtonText: `No Salir`,
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) window.location.href = "./";
    })
  }

  limpiarTodo(){
    this.formularioOT.reset();
    this.ArrayDocumento = [];
    this.OtConsultadas = [];
    this.OtConsultadasBOPP = [];
  }

  //Funcion que colocará el nombre a las columnas de la tabla en la cual se muestran los productos pedidos por los clientes
  ColumnasTabla(){
    this.titulosTabla = [];
    this.titulosTabla = [{
      OT : "OT",
      OTTipoMov : "Movimiento",
      OTFecha : "Fecha Creación OT",
      OTUsuario : "Registrado por",
      OTEstado : "Estado OT",
      OTVer : "Ver",
    }]
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = '$1,';
    return number.toString().replace(exp,rep);
  }

  //Funcion que perimitirá realizar busqueda de informacion segun los filtros que se le pasen
  validarConsulta(){
    this.ArrayDocumento = [];
    this.OtConsultadas = [];
    this.OtConsultadasBOPP = [];
    let idDoc : number = this.formularioOT.value.idDocumento;
    let fecha : any = this.formularioOT.value.fecha;
    let fechaFinal : any = this.formularioOT.value.fechaFinal;
    let TipoDocumento : string = this.formularioOT.value.TipoDocumento;
    let estado : any = this.formularioOT.value.estado;
    this.load = false;

    if (idDoc != null && fecha != null && fechaFinal != null && TipoDocumento != null) {
      if (TipoDocumento == 'Asignación') {
        this.bagProServices.srvObtenerListaClienteOT_Fechas(fecha, fechaFinal).subscribe(registros_OT => {
          if (registros_OT.length == 0) this.load = true;
          for (let bpro = 0; bpro < registros_OT.length; bpro++) {
            this.asignacionService.srvObtenerListaPorOt(registros_OT[bpro].item).subscribe(datos_asignacion => {
              if (datos_asignacion.length == 0) this.load = true;
              for (let i = 0; i < datos_asignacion.length; i++) {
                if (registros_OT[bpro].item == idDoc) this.recorrerEncabezadoAsignacionesMatPrima(registros_OT[bpro].item, registros_OT[bpro].fechaCrea);
              }
            });
          }
        });
      } else if (TipoDocumento == 'Asignación de BOPP') {
        this.bagProServices.srvObtenerListaClienteOT_Fechas(fecha, fechaFinal).subscribe(registros_OT => {
          if (registros_OT.length == 0) this.load = true;
          for (let bpro = 0; bpro < registros_OT.length; bpro++) {
            this.detallesAsgBOPPService.srvObtenerListaPorOt(registros_OT[bpro].item).subscribe(datos_dtAsgBOPP => {
              if (datos_dtAsgBOPP.length == 0) this.load = true;
              for (let i = 0; i < datos_dtAsgBOPP.length; i++) {
                if (registros_OT[bpro].item == idDoc) this.llenarTablaAsignacionBOPP(registros_OT[bpro].item, registros_OT[bpro].fechaCrea);
              }
            });
          }
        });
      }
    } else if (fecha != null && fechaFinal != null && TipoDocumento != null && estado != null) {
      if (TipoDocumento == 'Asignación') {
        this.bagProServices.srvObtenerListaClienteOT_Fechas(fecha, fechaFinal).subscribe(registros_OT => {
          if (registros_OT.length == 0) this.load = true;
          for (let bpro = 0; bpro < registros_OT.length; bpro++) {
            this.asignacionService.srvObtenerListaPorOt(registros_OT[bpro].item).subscribe(datos_asignacion => {
              if (datos_asignacion.length == 0) this.load = true;
              for (let i = 0; i < datos_asignacion.length; i++) {
                if (estado == 14 && datos_asignacion[i].estado_OrdenTrabajo == 14) this.recorrerEncabezadoAsignacionesMatPrima(registros_OT[bpro].item, registros_OT[bpro].fechaCrea);
                else if (estado == 16 && datos_asignacion[i].estado_OrdenTrabajo == 16) this.recorrerEncabezadoAsignacionesMatPrima(registros_OT[bpro].item, registros_OT[bpro].fechaCrea);
                else if (estado == 17 && datos_asignacion[i].estado_OrdenTrabajo == 17) this.recorrerEncabezadoAsignacionesMatPrima(registros_OT[bpro].item, registros_OT[bpro].fechaCrea);
                else if (estado == 18 && datos_asignacion[i].estado_OrdenTrabajo == 18) this.recorrerEncabezadoAsignacionesMatPrima(registros_OT[bpro].item, registros_OT[bpro].fechaCrea);
                else {
                  this.load = true;
                  continue;
                }
              }
            });
          }
        });
      } else if (TipoDocumento == 'Asignación de BOPP') {
        this.bagProServices.srvObtenerListaClienteOT_Fechas(fecha, fechaFinal).subscribe(registros_OT => {
          if (registros_OT.length == 0) this.load = true;
          for (let bpro = 0; bpro < registros_OT.length; bpro++) {
            this.detallesAsgBOPPService.srvObtenerListaPorOt(registros_OT[bpro].item).subscribe(datos_dtAsgBOPP => {
              if (datos_dtAsgBOPP.length == 0) this.load = true;
              for (let i = 0; i < datos_dtAsgBOPP.length; i++) {
                if (estado == 14 && datos_dtAsgBOPP[i].estado_OrdenTrabajo == 14) this.llenarTablaAsignacionBOPP(registros_OT[bpro].item, registros_OT[bpro].fechaCrea);
                else if (estado == 16 && datos_dtAsgBOPP[i].estado_OrdenTrabajo == 16) this.llenarTablaAsignacionBOPP(registros_OT[bpro].item, registros_OT[bpro].fechaCrea);
                else if (estado == 17 && datos_dtAsgBOPP[i].estado_OrdenTrabajo == 17) this.llenarTablaAsignacionBOPP(registros_OT[bpro].item, registros_OT[bpro].fechaCrea);
                else if (estado == 18 && datos_dtAsgBOPP[i].estado_OrdenTrabajo == 18) this.llenarTablaAsignacionBOPP(registros_OT[bpro].item, registros_OT[bpro].fechaCrea);
                else {
                  this.load = true;
                  continue;
                }
              }
            });
          }
        });
      }
    } else if (idDoc != null && fecha != null && fechaFinal != null && TipoDocumento != null) {
      if (TipoDocumento == 'Asignación') {
        this.bagProServices.srvObtenerListaClienteOT_Fechas(fecha, fechaFinal).subscribe(datos_ot => {
          if (datos_ot.length == 0) this.load = true;
          for (let i = 0; i < datos_ot.length; i++) {
            if (datos_ot[i].item == idDoc) this.recorrerEncabezadoAsignacionesMatPrima(datos_ot[i].item, datos_ot[i].fechaCrea);
          }
        });
      } else if (TipoDocumento == 'Asignación de BOPP') {
        this.bagProServices.srvObtenerListaClienteOT_Fechas(fecha, fechaFinal).subscribe(datos_ot => {
          if (datos_ot.length == 0) this.load = true;
          for (let i = 0; i < datos_ot.length; i++) {
            if (datos_ot[i].item == idDoc) this.llenarTablaAsignacionBOPP(datos_ot[i].item, datos_ot[i].fechaCrea);
          }
        });
      }
    } else if (idDoc != null && fecha != null && TipoDocumento != null) {
      if (TipoDocumento == 'Asignación') {
        this.bagProServices.srvObtenerListaClienteOT_Fecha(fecha).subscribe(registros_OT => {
          if (registros_OT.length == 0) this.load = true;
          for (let bpro = 0; bpro < registros_OT.length; bpro++) {
            if (registros_OT[bpro].item == idDoc) {
              this.recorrerEncabezadoAsignacionesMatPrima(registros_OT[bpro].item, registros_OT[bpro].fechaCrea);
            }
          }
        });
      } else if (TipoDocumento == 'Asignación de BOPP') {
        this.bagProServices.srvObtenerListaClienteOT_Fecha(fecha).subscribe(registros_OT => {
          if (registros_OT.length == 0) this.load = true;
          for (let bpro = 0; bpro < registros_OT.length; bpro++) {
            if (registros_OT[bpro].item == idDoc) {
              this.llenarTablaAsignacionBOPP(registros_OT[bpro].item, registros_OT[bpro].fechaCrea);
            }
          }
        });
      }
    } else if (TipoDocumento != null && fecha != null && fechaFinal != null) {
      if (TipoDocumento == 'Asignación') {
        this.bagProServices.srvObtenerListaClienteOT_Fechas(fecha, fechaFinal).subscribe(datos_ot => {
          if (datos_ot.length == 0) this.load = true;
          for (let i = 0; i < datos_ot.length; i++) {
            this.recorrerEncabezadoAsignacionesMatPrima(datos_ot[i].item, datos_ot[i].fechaCrea);
          }
        });
      } else if (TipoDocumento == 'Asignación de BOPP') {
        this.bagProServices.srvObtenerListaClienteOT_Fechas(fecha, fechaFinal).subscribe(datos_ot => {
          if (datos_ot.length == 0) this.load = true;
          for (let i = 0; i < datos_ot.length; i++) {
            this.llenarTablaAsignacionBOPP(datos_ot[i].item, datos_ot[i].fechaCrea);
          }
        });
      }
    } else if (fecha != null && TipoDocumento != null) {
      if (TipoDocumento == 'Asignación') {
        this.bagProServices.srvObtenerListaClienteOT_Fecha(fecha).subscribe(registros_OT => {
          if (registros_OT.length == 0) this.load = true;
          for (let bpro = 0; bpro < registros_OT.length; bpro++) {
            this.recorrerEncabezadoAsignacionesMatPrima(registros_OT[bpro].item, registros_OT[bpro].fechaCrea);
          }
        });
      } else if (TipoDocumento == 'Asignación de BOPP') {
        this.bagProServices.srvObtenerListaClienteOT_Fecha(fecha).subscribe(registros_OT => {
          if (registros_OT.length == 0) this.load = true;
          for (let bpro = 0; bpro < registros_OT.length; bpro++) {
            this.llenarTablaAsignacionBOPP(registros_OT[bpro].item, registros_OT[bpro].fechaCrea);
          }
        });
      }
    } else if (idDoc != null && TipoDocumento != null) {
      if (TipoDocumento == 'Asignación') {
        this.bagProServices.srvObtenerListaClienteOT_Item(idDoc).subscribe(registros_OT => {
          if(registros_OT.length != 0) {
            for (let bpro = 0; bpro < registros_OT.length; bpro++) {
              this.recorrerEncabezadoAsignacionesMatPrima(idDoc);
            }
          } else {
            this.load = true;
            Swal.fire('La OT "' + idDoc + '" no existe.');
          }
        });
      } else if (TipoDocumento == 'Asignación de BOPP') {
        this.bagProServices.srvObtenerListaClienteOT_Item(idDoc).subscribe(registros_OT => {
          if(registros_OT.length != 0) {
            for (let bpro = 0; bpro < registros_OT.length; bpro++) {
              this.llenarTablaAsignacionBOPP(idDoc);
            }
          } else {
            this.load = true;
            Swal.fire('La OT "' + idDoc + '" no existe.');
          }
        });
      }
    } else if (fecha != null && estado != null) {
      this.bagProServices.srvObtenerListaClienteOT_Fecha(fecha).subscribe(registros_OT => {
        if (registros_OT.length == 0) this.load = true;
        for (let bpro = 0; bpro < registros_OT.length; bpro++) {
          this.asignacionService.srvObtenerListaPorOt(registros_OT[bpro].item).subscribe(datos_asignacion => {
            if (datos_asignacion.length == 0) this.load = true;
            for (let i = 0; i < datos_asignacion.length; i++) {
              if (estado == 14 && datos_asignacion[i].estado_OrdenTrabajo == 14) this.recorrerEncabezadoAsignacionesMatPrima(registros_OT[bpro].item, registros_OT[bpro].fechaCrea);
              else if (estado == 16 && datos_asignacion[i].estado_OrdenTrabajo == 16) this.recorrerEncabezadoAsignacionesMatPrima(registros_OT[bpro].item, registros_OT[bpro].fechaCrea);
              else if (estado == 17 && datos_asignacion[i].estado_OrdenTrabajo == 17) this.recorrerEncabezadoAsignacionesMatPrima(registros_OT[bpro].item, registros_OT[bpro].fechaCrea);
              else if (estado == 18 && datos_asignacion[i].estado_OrdenTrabajo == 18) this.recorrerEncabezadoAsignacionesMatPrima(registros_OT[bpro].item, registros_OT[bpro].fechaCrea);
              else {
                this.load = true;
                continue;
              }
            }
          });

          this.detallesAsgBOPPService.srvObtenerListaPorOt(registros_OT[bpro].item).subscribe(datos_dtAsgBOPP => {
            if (datos_dtAsgBOPP.length == 0) this.load = true;
            for (let i = 0; i < datos_dtAsgBOPP.length; i++) {
              if (estado == 14 && datos_dtAsgBOPP[i].estado_OrdenTrabajo == 14) this.llenarTablaAsignacionBOPP(registros_OT[bpro].item, registros_OT[bpro].fechaCrea);
              else if (estado == 16 && datos_dtAsgBOPP[i].estado_OrdenTrabajo == 16) this.llenarTablaAsignacionBOPP(registros_OT[bpro].item, registros_OT[bpro].fechaCrea);
              else if (estado == 17 && datos_dtAsgBOPP[i].estado_OrdenTrabajo == 17) this.llenarTablaAsignacionBOPP(registros_OT[bpro].item, registros_OT[bpro].fechaCrea);
              else if (estado == 18 && datos_dtAsgBOPP[i].estado_OrdenTrabajo == 18) this.llenarTablaAsignacionBOPP(registros_OT[bpro].item, registros_OT[bpro].fechaCrea);
              else {
                this.load = true;
                continue;
              }
            }
          });
        }
      });
    } else if (fecha != null && fechaFinal != null) {
      this.bagProServices.srvObtenerListaClienteOT_Fechas(fecha, fechaFinal).subscribe(datos_ot => {
        if (datos_ot.length == 0) this.load = true;
        for (let i = 0; i < datos_ot.length; i++) {
          this.recorrerEncabezadoAsignacionesMatPrima(datos_ot[i].item, datos_ot[i].fechaCrea);
          this.llenarTablaAsignacionBOPP(datos_ot[i].item, datos_ot[i].fechaCrea);
        }
      });
    } else if (TipoDocumento != null && estado != null) {
      if (TipoDocumento == 'Asignación') {
        if (estado == 14) {
          this.asignacionService.srvObtenerLista().subscribe(datos_asignacion => {
            if (datos_asignacion.length == 0) this.load = true;
            for (let i = 0; i < datos_asignacion.length; i++) {
              this.bagProServices.srvObtenerListaClienteOT_Item(datos_asignacion[i].asigMP_OrdenTrabajo).subscribe(registros_OT => {
                for (let bpro = 0; bpro < registros_OT.length; bpro++) {
                  if (datos_asignacion[i].estado_OrdenTrabajo == 14) this.recorrerEncabezadoAsignacionesMatPrima(datos_asignacion[i].asigMP_OrdenTrabajo, registros_OT[bpro].fechaCrea);
                  else {
                    this.load = true;
                    continue;
                  }
                }
              });
            }
          });
        } else if (estado == 16) {
          this.asignacionService.srvObtenerLista().subscribe(datos_asignacion => {
            if (datos_asignacion.length == 0) this.load = true;
            for (let i = 0; i < datos_asignacion.length; i++) {
              this.bagProServices.srvObtenerListaClienteOT_Item(datos_asignacion[i].asigMP_OrdenTrabajo).subscribe(registros_OT => {
                for (let bpro = 0; bpro < registros_OT.length; bpro++) {
                  if (datos_asignacion[i].estado_OrdenTrabajo == 16) this.recorrerEncabezadoAsignacionesMatPrima(datos_asignacion[i].asigMP_OrdenTrabajo, registros_OT[bpro].fechaCrea);
                  else {
                    this.load = true;
                    continue;
                  }
                  break;
                }
              });
            }
          });
        } else if (estado == 17) {
          this.asignacionService.srvObtenerLista().subscribe(datos_asignacion => {
            if (datos_asignacion.length == 0) this.load = true;
            for (let i = 0; i < datos_asignacion.length; i++) {
              this.bagProServices.srvObtenerListaClienteOT_Item(datos_asignacion[i].asigMP_OrdenTrabajo).subscribe(registros_OT => {
                for (let bpro = 0; bpro < registros_OT.length; bpro++) {
                  if (datos_asignacion[i].estado_OrdenTrabajo == 17) this.recorrerEncabezadoAsignacionesMatPrima(datos_asignacion[i].asigMP_OrdenTrabajo, registros_OT[bpro].fechaCrea);
                  else {
                    this.load = true;
                    continue;
                  }
                }
              });
            }
          });
        } else if (estado == 18) {
          this.asignacionService.srvObtenerLista().subscribe(datos_asignacion => {
            if (datos_asignacion.length == 0) this.load = true;
            for (let i = 0; i < datos_asignacion.length; i++) {
              this.bagProServices.srvObtenerListaClienteOT_Item(datos_asignacion[i].asigMP_OrdenTrabajo).subscribe(registros_OT => {
                for (let bpro = 0; bpro < registros_OT.length; bpro++) {
                  if (datos_asignacion[i].estado_OrdenTrabajo == 18) this.recorrerEncabezadoAsignacionesMatPrima(datos_asignacion[i].asigMP_OrdenTrabajo, registros_OT[bpro].fechaCrea);
                  else {
                    this.load = true;
                    continue;
                  }
                }
              });
            }
          });
        }
      } else if (TipoDocumento == 'Asignación de BOPP') {
        if (estado == 14) {
          this.asignacionBOPPService.srvObtenerLista().subscribe(datos_asignacionBOPP => {
            if (datos_asignacionBOPP.length == 0) this.load = true;
            for (let i = 0; i < datos_asignacionBOPP.length; i++) {
              this.detallesAsgBOPPService.srvObtenerListaPorAsignacion(datos_asignacionBOPP[i].asigBOPP_Id).subscribe(datos_dtAsgBOPP => {
                for (let j = 0; j < datos_dtAsgBOPP.length; j++) {
                  this.bagProServices.srvObtenerListaClienteOT_Item(datos_dtAsgBOPP[j].dtAsigBOPP_OrdenTrabajo).subscribe(registros_OT => {
                    for (let bpro = 0; bpro < registros_OT.length; bpro++) {
                      if (datos_dtAsgBOPP[j].estado_OrdenTrabajo == 14) this.llenarTablaAsignacionBOPP(datos_dtAsgBOPP[j].dtAsigBOPP_OrdenTrabajo, registros_OT[bpro].fechaCrea);
                      else {
                        this.load = true;
                        continue;
                      }
                    }
                  });
                }
              });
            }
          });
        } else if (estado == 16) {
          this.asignacionBOPPService.srvObtenerLista().subscribe(datos_asignacionBOPP => {
            if (datos_asignacionBOPP.length == 0) this.load = true;
            for (let i = 0; i < datos_asignacionBOPP.length; i++) {
              this.detallesAsgBOPPService.srvObtenerListaPorAsignacion(datos_asignacionBOPP[i].asigBOPP_Id).subscribe(datos_dtAsgBOPP => {
                for (let j = 0; j < datos_dtAsgBOPP.length; j++) {
                  this.bagProServices.srvObtenerListaClienteOT_Item(datos_dtAsgBOPP[j].dtAsigBOPP_OrdenTrabajo).subscribe(registros_OT => {
                    for (let bpro = 0; bpro < registros_OT.length; bpro++) {
                      if (datos_dtAsgBOPP[j].estado_OrdenTrabajo == 16) this.llenarTablaAsignacionBOPP(datos_dtAsgBOPP[j].dtAsigBOPP_OrdenTrabajo, registros_OT[bpro].fechaCrea);
                      else {
                        this.load = true;
                        continue;
                      }
                      break;
                    }
                  });
                }
              });
            }
          });
        } else if (estado == 17) {
          this.asignacionBOPPService.srvObtenerLista().subscribe(datos_asignacionBOPP => {
            if (datos_asignacionBOPP.length == 0) this.load = true;
            for (let i = 0; i < datos_asignacionBOPP.length; i++) {
              this.detallesAsgBOPPService.srvObtenerListaPorAsignacion(datos_asignacionBOPP[i].asigBOPP_Id).subscribe(datos_dtAsgBOPP => {
                for (let j = 0; j < datos_dtAsgBOPP.length; j++) {
                  this.bagProServices.srvObtenerListaClienteOT_Item(datos_dtAsgBOPP[j].dtAsigBOPP_OrdenTrabajo).subscribe(registros_OT => {
                    for (let bpro = 0; bpro < registros_OT.length; bpro++) {
                      if (datos_dtAsgBOPP[j].estado_OrdenTrabajo == 17) this.llenarTablaAsignacionBOPP(datos_dtAsgBOPP[j].dtAsigBOPP_OrdenTrabajo, registros_OT[bpro].fechaCrea);
                      else {
                        this.load = true;
                        continue;
                      }
                    }
                  });
                }
              });
            }
          });
        } else if (estado == 18) {
          this.asignacionBOPPService.srvObtenerLista().subscribe(datos_asignacionBOPP => {
            if (datos_asignacionBOPP.length == 0) this.load = true;
            for (let i = 0; i < datos_asignacionBOPP.length; i++) {
              this.detallesAsgBOPPService.srvObtenerListaPorAsignacion(datos_asignacionBOPP[i].asigBOPP_Id).subscribe(datos_dtAsgBOPP => {
                for (let j = 0; j < datos_dtAsgBOPP.length; j++) {
                  this.bagProServices.srvObtenerListaClienteOT_Item(datos_dtAsgBOPP[j].dtAsigBOPP_OrdenTrabajo).subscribe(registros_OT => {
                    for (let bpro = 0; bpro < registros_OT.length; bpro++) {
                      if (datos_dtAsgBOPP[j].estado_OrdenTrabajo == 18) this.llenarTablaAsignacionBOPP(datos_dtAsgBOPP[j].dtAsigBOPP_OrdenTrabajo, registros_OT[bpro].fechaCrea);
                      else {
                        this.load = true;
                        continue;
                      }
                    }
                  });
                }
              });
            }
          });
        }
      }
    } else if (idDoc != null) {
      this.bagProServices.srvObtenerListaClienteOT_Item(idDoc).subscribe(registros_OT => {
        if(registros_OT.length != 0) {
          for (let bpro = 0; bpro < registros_OT.length; bpro++) {
            this.recorrerEncabezadoAsignacionesMatPrima(idDoc, registros_OT[bpro].fechaCrea);
            this.llenarTablaAsignacionBOPP(idDoc, registros_OT[bpro].fechaCrea);
          }
        } else {
          this.load = true;
          Swal.fire('La OT "' + idDoc + '" no existe.');
        }
      });
    } else if (fecha != null) {
      this.bagProServices.srvObtenerListaClienteOT_Fecha(fecha).subscribe(registros_OT => {
        if (registros_OT.length == 0) this.load = true;
        for (let bpro = 0; bpro < registros_OT.length; bpro++) {
          this.recorrerEncabezadoAsignacionesMatPrima(registros_OT[bpro].item, registros_OT[bpro].fechaCrea);
          this.llenarTablaAsignacionBOPP(registros_OT[bpro].item, registros_OT[bpro].fechaCrea);
        }
      });
    } else if (TipoDocumento != null) {
      if (TipoDocumento == 'Asignación') {
        this.asignacionService.srvObtenerListaPorFecha(this.today).subscribe(datos_asignacion => {
          if (datos_asignacion.length == 0) this.load = true;
          for (let i = 0; i < datos_asignacion.length; i++) {
            this.bagProServices.srvObtenerListaClienteOT_Item(datos_asignacion[i].asigMP_OrdenTrabajo).subscribe(registros_OT => {
              for (let bpro = 0; bpro < registros_OT.length; bpro++) {
                this.recorrerEncabezadoAsignacionesMatPrima(datos_asignacion[i].asigMP_OrdenTrabajo);
              }
            });
          }
        });
      } else if (TipoDocumento == 'Asignación de BOPP') {
        this.asignacionBOPPService.srvObtenerListaPorfecha(this.today).subscribe(datos_asignacionBOPP => {
          if (datos_asignacionBOPP.length == 0) this.load = true;
          for (let i = 0; i < datos_asignacionBOPP.length; i++) {
            this.detallesAsgBOPPService.srvObtenerListaPorAsignacion(datos_asignacionBOPP[i].asigBOPP_Id).subscribe(datos_dtAsgBOPP => {
              for (let j = 0; j < datos_dtAsgBOPP.length; j++) {
                this.bagProServices.srvObtenerListaClienteOT_Item(datos_dtAsgBOPP[j].dtAsigBOPP_OrdenTrabajo).subscribe(registros_OT => {
                  for (let bpro = 0; bpro < registros_OT.length; bpro++) {
                    this.llenarTablaAsignacionBOPP(datos_dtAsgBOPP[j].dtAsigBOPP_OrdenTrabajo);
                  }
                });
              }
            });
          }
        });
      }
    } else if (estado != null) {
      if (estado == 14) {
        this.asignacionService.srvObtenerLista().subscribe(datos_asignacion => {
          if (datos_asignacion.length == 0) this.load = true;
          for (let i = 0; i < datos_asignacion.length; i++) {
            this.bagProServices.srvObtenerListaClienteOT_Item(datos_asignacion[i].asigMP_OrdenTrabajo).subscribe(registros_OT => {
              for (let bpro = 0; bpro < registros_OT.length; bpro++) {
                if (datos_asignacion[i].estado_OrdenTrabajo == 14) this.recorrerEncabezadoAsignacionesMatPrima(datos_asignacion[i].asigMP_OrdenTrabajo, registros_OT[bpro].fechaCrea);
                else {
                  this.load = true;
                  continue;
                }
              }
            });
          }
        });
        this.asignacionBOPPService.srvObtenerLista().subscribe(datos_asignacionBOPP => {
          if (datos_asignacionBOPP.length == 0) this.load = true;
          for (let i = 0; i < datos_asignacionBOPP.length; i++) {
            this.detallesAsgBOPPService.srvObtenerListaPorAsignacion(datos_asignacionBOPP[i].asigBOPP_Id).subscribe(datos_dtAsgBOPP => {
              for (let j = 0; j < datos_dtAsgBOPP.length; j++) {
                this.bagProServices.srvObtenerListaClienteOT_Item(datos_dtAsgBOPP[j].dtAsigBOPP_OrdenTrabajo).subscribe(registros_OT => {
                  for (let bpro = 0; bpro < registros_OT.length; bpro++) {
                    if (datos_dtAsgBOPP[j].estado_OrdenTrabajo == 14) this.llenarTablaAsignacionBOPP(datos_dtAsgBOPP[j].dtAsigBOPP_OrdenTrabajo, registros_OT[bpro].fechaCrea);
                    else {
                      this.load = true;
                      continue;
                    }
                  }
                });
              }
            });
          }
        });
      } else if (estado == 16) {
        this.asignacionService.srvObtenerLista().subscribe(datos_asignacion => {
          if (datos_asignacion.length == 0) this.load = true;
          for (let i = 0; i < datos_asignacion.length; i++) {
            this.bagProServices.srvObtenerListaClienteOT_Item(datos_asignacion[i].asigMP_OrdenTrabajo).subscribe(registros_OT => {
              for (let bpro = 0; bpro < registros_OT.length; bpro++) {
                if (datos_asignacion[i].estado_OrdenTrabajo == 16) this.recorrerEncabezadoAsignacionesMatPrima(datos_asignacion[i].asigMP_OrdenTrabajo, registros_OT[bpro].fechaCrea);
                else {
                  this.load = true;
                  continue;
                }
                break;
              }
            });
          }
        });
        this.asignacionBOPPService.srvObtenerLista().subscribe(datos_asignacionBOPP => {
          if (datos_asignacionBOPP.length == 0) this.load = true;
          for (let i = 0; i < datos_asignacionBOPP.length; i++) {
            this.detallesAsgBOPPService.srvObtenerListaPorAsignacion(datos_asignacionBOPP[i].asigBOPP_Id).subscribe(datos_dtAsgBOPP => {
              for (let j = 0; j < datos_dtAsgBOPP.length; j++) {
                this.bagProServices.srvObtenerListaClienteOT_Item(datos_dtAsgBOPP[j].dtAsigBOPP_OrdenTrabajo).subscribe(registros_OT => {
                  for (let bpro = 0; bpro < registros_OT.length; bpro++) {
                    if (datos_dtAsgBOPP[j].estado_OrdenTrabajo == 16) this.llenarTablaAsignacionBOPP(datos_dtAsgBOPP[j].dtAsigBOPP_OrdenTrabajo, registros_OT[bpro].fechaCrea);
                    else {
                      this.load = true;
                      continue;
                    }
                    break;
                  }
                });
              }
            });
          }
        });
      } else if (estado == 17) {
        this.asignacionService.srvObtenerLista().subscribe(datos_asignacion => {
          if (datos_asignacion.length == 0) this.load = true;
          for (let i = 0; i < datos_asignacion.length; i++) {
            this.bagProServices.srvObtenerListaClienteOT_Item(datos_asignacion[i].asigMP_OrdenTrabajo).subscribe(registros_OT => {
              for (let bpro = 0; bpro < registros_OT.length; bpro++) {
                if (datos_asignacion[i].estado_OrdenTrabajo == 17) this.recorrerEncabezadoAsignacionesMatPrima(datos_asignacion[i].asigMP_OrdenTrabajo, registros_OT[bpro].fechaCrea);
                else {
                  this.load = true;
                  continue;
                }
              }
            });
          }
        });
        this.asignacionBOPPService.srvObtenerLista().subscribe(datos_asignacionBOPP => {
          if (datos_asignacionBOPP.length == 0) this.load = true;
          for (let i = 0; i < datos_asignacionBOPP.length; i++) {
            this.detallesAsgBOPPService.srvObtenerListaPorAsignacion(datos_asignacionBOPP[i].asigBOPP_Id).subscribe(datos_dtAsgBOPP => {
              for (let j = 0; j < datos_dtAsgBOPP.length; j++) {
                this.bagProServices.srvObtenerListaClienteOT_Item(datos_dtAsgBOPP[j].dtAsigBOPP_OrdenTrabajo).subscribe(registros_OT => {
                  for (let bpro = 0; bpro < registros_OT.length; bpro++) {
                    if (datos_dtAsgBOPP[j].estado_OrdenTrabajo == 17) this.llenarTablaAsignacionBOPP(datos_dtAsgBOPP[j].dtAsigBOPP_OrdenTrabajo, registros_OT[bpro].fechaCrea);
                    else {
                      this.load = true;
                      continue;
                    }
                  }
                });
              }
            });
          }
        });
      } else if (estado == 18) {
        this.asignacionService.srvObtenerLista().subscribe(datos_asignacion => {
          if (datos_asignacion.length == 0) this.load = true;
          for (let i = 0; i < datos_asignacion.length; i++) {
            this.bagProServices.srvObtenerListaClienteOT_Item(datos_asignacion[i].asigMP_OrdenTrabajo).subscribe(registros_OT => {
              for (let bpro = 0; bpro < registros_OT.length; bpro++) {
                if (datos_asignacion[i].estado_OrdenTrabajo == 18) this.recorrerEncabezadoAsignacionesMatPrima(datos_asignacion[i].asigMP_OrdenTrabajo, registros_OT[bpro].fechaCrea);
                else {
                  this.load = true;
                  continue;
                }
              }
            });
          }
        });
        this.asignacionBOPPService.srvObtenerLista().subscribe(datos_asignacionBOPP => {
          if (datos_asignacionBOPP.length == 0) this.load = true;
          for (let i = 0; i < datos_asignacionBOPP.length; i++) {
            this.detallesAsgBOPPService.srvObtenerListaPorAsignacion(datos_asignacionBOPP[i].asigBOPP_Id).subscribe(datos_dtAsgBOPP => {
              for (let j = 0; j < datos_dtAsgBOPP.length; j++) {
                this.bagProServices.srvObtenerListaClienteOT_Item(datos_dtAsgBOPP[j].dtAsigBOPP_OrdenTrabajo).subscribe(registros_OT => {
                  for (let bpro = 0; bpro < registros_OT.length; bpro++) {
                    if (datos_dtAsgBOPP[j].estado_OrdenTrabajo == 18) this.llenarTablaAsignacionBOPP(datos_dtAsgBOPP[j].dtAsigBOPP_OrdenTrabajo, registros_OT[bpro].fechaCrea);
                    else {
                      this.load = true;
                      continue;
                    }
                  }
                });
              }
            });
          }
        });
      }
    } else {
      this.asignacionService.srvObtenerListaPorFecha(this.today).subscribe(datos_asignacion => {
        if (datos_asignacion.length == 0) this.load = true;
        for (let i = 0; i < datos_asignacion.length; i++) {
          this.bagProServices.srvObtenerListaClienteOT_Item(datos_asignacion[i].asigMP_OrdenTrabajo).subscribe(registros_OT => {
            for (let bpro = 0; bpro < registros_OT.length; bpro++) {
              this.recorrerEncabezadoAsignacionesMatPrima(datos_asignacion[i].asigMP_OrdenTrabajo, registros_OT[bpro].fechaCrea);
            }
          });
        }
      });
      this.asignacionBOPPService.srvObtenerListaPorfecha(this.today).subscribe(datos_asignacionBOPP => {
        if (datos_asignacionBOPP.length == 0) this.load = true;
        for (let i = 0; i < datos_asignacionBOPP.length; i++) {
          this.detallesAsgBOPPService.srvObtenerListaPorAsignacion(datos_asignacionBOPP[i].asigBOPP_Id).subscribe(datos_dtAsgBOPP => {
            for (let j = 0; j < datos_dtAsgBOPP.length; j++) {
              this.bagProServices.srvObtenerListaClienteOT_Item(datos_dtAsgBOPP[j].dtAsigBOPP_OrdenTrabajo).subscribe(registros_OT => {
                for (let bpro = 0; bpro < registros_OT.length; bpro++) {
                  this.llenarTablaAsignacionBOPP(datos_dtAsgBOPP[j].dtAsigBOPP_OrdenTrabajo, registros_OT[bpro].fechaCrea);
                }
              });
            }
          });
        }
      });
    }
  }

  recorrerEncabezadoAsignacionesMatPrima(OT : any, fecha? : any){
    if (!this.OtConsultadas.includes(OT)) {
      this.load = true;
      this.OtConsultadas.push(OT);
      this.asignacionService.srvObtenerListaPorOt(OT).subscribe(registrosAsignacionesMP => {
        if (registrosAsignacionesMP.length == 0) this.load = true;
        if(registrosAsignacionesMP.length != 0) {
          for (let asgmp = 0; asgmp < registrosAsignacionesMP.length; asgmp++) {
            if(registrosAsignacionesMP[asgmp].asigMP_OrdenTrabajo == OT) {
              this.usuariosService.srvObtenerListaPorId(registrosAsignacionesMP[asgmp].usua_Id).subscribe(registrosUsuarios => {
                this.estadosService.srvObtenerListaPorId(registrosAsignacionesMP[asgmp].estado_OrdenTrabajo).subscribe(registrosEstados => {
                  let estadoNombre = [];
                  estadoNombre.push(registrosEstados);
                  for (const estado of estadoNombre) {
                    if(fecha != null){
                      const tablaAsigMatPrima : any = {
                        OrdTrabajo : registrosAsignacionesMP[asgmp].asigMP_OrdenTrabajo,
                        Movimiento : 'Asignación',
                        FechaRegistro : fecha,
                        Usuario : registrosUsuarios.usua_Nombre,
                        EstadoOT : estado.estado_Nombre
                      }
                      this.ArrayDocumento.push(tablaAsigMatPrima);
                    } else {
                      const tablaAsigMatPrima : any = {
                        OrdTrabajo : registrosAsignacionesMP[asgmp].asigMP_OrdenTrabajo,
                        Movimiento : 'Asignación',
                        FechaRegistro : registrosAsignacionesMP[asgmp].asigMp_FechaEntrega,
                        Usuario : registrosUsuarios.usua_Nombre,
                        EstadoOT : estado.estado_Nombre
                      }
                      this.ArrayDocumento.push(tablaAsigMatPrima);
                    }
                    this.ArrayDocumento.sort((a,b) => b.FechaRegistro.localeCompare(a.FechaRegistro));
                    this.ArrayDocumento.sort((a,b) => Number(b.OrdTrabajo) - Number(a.OrdTrabajo));
                  }
                });
              });
            }
            break;
          }
        }
      });
    }
  }

  llenarTablaAsignacionBOPP(Ot : any, fecha? : any){
    if (!this.OtConsultadasBOPP.includes(Ot)) {
      this.load = true;
      this.OtConsultadasBOPP.push(Ot);
      this.detallesAsgBOPPService.srvObtenerListaPorOt(Ot).subscribe(datos_dtAsgBOPP => {
        if (datos_dtAsgBOPP.length == 0) this.load = true;
        for (let i = 0; i < datos_dtAsgBOPP.length; i++) {
          this.asignacionBOPPService.srvObtenerListaPorId(datos_dtAsgBOPP[i].asigBOPP_Id).subscribe(datos_asgBOPP => {
            let asigBOPP : any = [];
            asigBOPP.push(datos_asgBOPP);
            for (const item of asigBOPP) {
              this.usuariosService.srvObtenerListaPorId(item.usua_Id).subscribe(datos_usuario => {
                this.estadosService.srvObtenerListaPorId(datos_dtAsgBOPP[i].estado_OrdenTrabajo).subscribe(datos_estado => {
                  let estado : any = [];
                  estado.push(datos_estado);
                  for (const itemEstado of estado) {
                    if (fecha != null) {
                      const tablaAsigMatPrima : any = {
                        OrdTrabajo : Ot,
                        Movimiento : 'Asignación BOPP',
                        FechaRegistro : fecha,
                        Usuario : datos_usuario.usua_Nombre,
                        EstadoOT : itemEstado.estado_Nombre,
                      }
                      this.ArrayDocumento.push(tablaAsigMatPrima);
                    } else {
                      const tablaAsigMatPrima : any = {
                        OrdTrabajo : Ot,
                        Movimiento : 'Asignación BOPP',
                        FechaRegistro : item.asigBOPP_FechaEntrega,
                        Usuario : datos_usuario.usua_Nombre,
                        EstadoOT : itemEstado.estado_Nombre,
                      }
                      this.ArrayDocumento.push(tablaAsigMatPrima);
                    }
                    this.ArrayDocumento.sort((a,b) => b.FechaRegistro.localeCompare(a.FechaRegistro));
                    this.ArrayDocumento.sort((a,b) => Number(b.OrdTrabajo) - Number(a.OrdTrabajo));
                  }
                });
              });
            }
          });
          break;
        }
      });
    }
  }

  llenarDocumento(datos : any){
    this.ArrayAsgOt = [];
    this.cantidadKgTotalEntreagada = 0;
    this.producidoEmpKg = 0;
    this.producidoSellKg = 0;
    this.producidoSellUnd = 0;

    if (datos.Movimiento == 'Asignación') {
      let mp : any = [];
      this.bagProServices.srvObtenerListaProcextrusionProducido(datos.OrdTrabajo).subscribe(datos_prodExtrusion => {
        for (let j = 0; j < datos_prodExtrusion.length; j++) {
          this.producidoEmpKg = datos_prodExtrusion[j].sumaPeso;
        }
      });
      this.bagProServices.srvObtenerListaProcSelladoProdPesoUnidades(datos.OrdTrabajo).subscribe(datos_prodSellado => {
        for (let j = 0; j < datos_prodSellado.length; j++) {
          this.producidoSellKg = datos_prodSellado[j].sumaPeso;
          this.producidoSellUnd = datos_prodSellado[j].sumaUnidades;
        }
      });
      this.asignacionMpService.srvObtenerListaPorOT2(datos.OrdTrabajo).subscribe(datos_dtAsignacionMP => {
        for (let i = 0; i < datos_dtAsignacionMP.length; i++) {
          if (!mp.includes(datos_dtAsignacionMP[i].matPri_Id)) {
            let asgMP : any = {
              Id : datos_dtAsignacionMP[i].matPri_Id,
              Nombre : datos_dtAsignacionMP[i].matPri_Nombre,
              Cant : datos_dtAsignacionMP[i].sum,
              UndCant : datos_dtAsignacionMP[i].undMed_Id,
            }
            mp.push(datos_dtAsignacionMP[i].matPri_Id);
            this.ArrayAsgOt.push(asgMP);
            this.cantidadKgTotalEntreagada += datos_dtAsignacionMP[i].sum;
            this.ArrayAsgOt.sort((a,b) => a.Nombre.localeCompare(b.Nombre));
          }
        }
      });
      setTimeout(() => {
        this.llenarPDFAsgMP(datos.OrdTrabajo);
      }, 2000);

    } else if (datos.Movimiento == 'Asignación BOPP') {
      this.detallesAsgBOPPService.srvObtenerListaPorOt(datos.OrdTrabajo).subscribe(datos_dtAsgBOPP => {
        for (let i = 0; i < datos_dtAsgBOPP.length; i++) {
          this.bagProServices.srvObtenerListaProcextrusionProducido(datos.OrdTrabajo).subscribe(datos_prodExtrusion => {
            for (let j = 0; j < datos_prodExtrusion.length; j++) {
              this.producidoEmpKg = datos_prodExtrusion[j].sumaPeso;
            }
          });
          this.boppService.srvObtenerListaPorId(datos_dtAsgBOPP[i].bopP_Id).subscribe(datos_bopp => {
            let bopp : any = [];
            bopp.push(datos_bopp);
            for (const item of bopp) {
              let asg : any = {
                Id : datos_dtAsgBOPP[i].bopP_Id,
                Serial : item.bopP_Serial,
                Nombre : item.bopP_Nombre,
              }
              this.ArrayAsgOt.push(asg);
              this.cantidadKgTotalEntreagada += item.bopP_CantidadInicialKg;
              this.ArrayAsgOt.sort((a,b) => a.Nombre.localeCompare(b.Nombre));
            }
          });
        }
      });
      setTimeout(() => {
        this.llenarPDFAsgBOPP(datos.OrdTrabajo);
      }, 2000);
    }
  }

  // funcion que se encagará de llenar las tabla en el pdf
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

  // Funcion que genera la tabla donde se mostrará la información de la materia prima asignada
  tableAsignacion(data, columns) {
    return {
      table: {
        headerRows: 1,
        widths: [70, '*', 100, 50],
        body: this.buildTableBody(data, columns),
      },
      fontSize: 9,
      layout: {
        fillColor: function (rowIndex, node, columnIndex) {
          return (rowIndex == 0) ? '#CCCCCC' : null;
        }
      }
    };
  }

  // Funcion que genera la tabla donde se mostrará la información del bopp asignado
  tableAsignacionBOPP(data, columns) {
    return {
      table: {
        headerRows: 1,
        widths: [70, 100, '*'],
        body: this.buildTableBody(data, columns),
      },
      fontSize: 9,
      layout: {
        fillColor: function (rowIndex, node, columnIndex) {
          return (rowIndex == 0) ? '#CCCCCC' : null;
        }
      }
    }
  }

  // Funcion que llenara un pdf con la informacion de la orden de trabajo y su asignacion de materia prima
  llenarPDFAsgMP(ot : any){
    this.bagProServices.srvObtenerListaClienteOT_Item(ot).subscribe(datos_ot => {
      for (let i = 0; i < datos_ot.length; i++) {
        let FechaCreacionDatetime = datos_ot[i].fechaCrea;
        let FechacreacionNueva = FechaCreacionDatetime.indexOf("T");
        let fechaCreacionFinal = FechaCreacionDatetime.substring(0, FechacreacionNueva);
        this.asignacionService.srvObtenerListaPorOt(ot).subscribe(datos_asignacion => {
          for (let j = 0; j < datos_asignacion.length; j++) {
            this.estadosService.srvObtenerListaPorId(datos_asignacion[j].estado_OrdenTrabajo).subscribe(datos_estado => {
              let estado : any = [];
              estado.push(datos_estado);
              for (const item of estado) {
                const pdfDefinicion : any = {
                  info: {
                    title: `Orden de Trabajo N° ${ot}`
                  },
                  content : [
                    {
                      text: `Plasticaribe S.A.S`,
                      alignment: 'center',
                      style: 'titulo',
                    },
                    '\n \n',
                    {
                      text: `Fecha de Creación: ${fechaCreacionFinal}`,
                      style: 'header',
                      alignment: 'right',
                    },
                    {
                      text: `Estado Orden de Trabajo: ${item.estado_Nombre}\n`,
                      alignment: 'right',
                      style: 'header',
                    },
                    {
                      text: `\n Información de la Orden de Trabajo \n \n`,
                      alignment: 'center',
                      style: 'header'
                    },
                    {
                      style: 'tablaCliente',
                      table: {
                        widths: ['*', '*', '*'],
                        style: 'header',
                        body: [
                          [
                            `Cliente: ${datos_ot[i].clienteNom}`,
                            `Item: ${datos_ot[i].clienteItemsNom}`,
                            ``
                          ],
                          [
                            `Presentación: ${datos_ot[i].ptPresentacionNom}`,
                            `Und: ${datos_ot[i].datoscantBolsa}`,
                            `Kg: ${datos_ot[i].datosotKg}`
                          ],
                          [
                            `Valor Und: ${datos_ot[i].datosvalorBolsa}`,
                            `Valor Kg: ${datos_ot[i].datosValorKg}`,
                            `Valor OT: ${datos_ot[i].datosvalorOt}`
                          ]
                        ]
                      },
                      layout: 'lightHorizontalLines',
                      fontSize: 9,
                    },
                    {
                      text: `\n \nObervación sobre la Orden de Trabajo: \n ${datos_ot[i].observacion} \n`,
                      style: 'header',
                    },
                    {
                      text: `\n \nInformación de la Asignación \n \n`,
                      alignment: 'center',
                      style: 'header'
                    },
                    {
                      text: `\n \nObervación sobre la Asignación: \n \n`,
                      style: 'header',
                    },

                    this.tableAsignacion(this.ArrayAsgOt, ['Id', 'Nombre', 'Cant', 'UndCant']),

                    {
                      text: `\nCantidad Asignada: ${this.formatonumeros(Math.round(this.cantidadKgTotalEntreagada))}`,
                      alignment: 'right',
                      style: 'header',
                    },

                    '\n',
                    {
                      text: `\nCantidad Kg Producida: ${this.formatonumeros(Math.round(this.producidoEmpKg + this.producidoSellKg))}`,
                      alignment: 'right',
                      style: 'header',
                    },
                    {
                      text: `\nCantidad Unidades Producida: ${this.formatonumeros(Math.round(this.producidoSellUnd))}`,
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
                      fontSize: 15,
                      bold: true
                    }
                  }
                }
                const pdf = pdfMake.createPdf(pdfDefinicion);
                pdf.open();
              }
            });
            break;
          }
        });
        break;
      }
    });
  }

  // Funcion que llenara un pdf con la informacion de la orden de trabajo y su asignacion de BOPP
  llenarPDFAsgBOPP(ot : any){
    this.bagProServices.srvObtenerListaClienteOT_Item(ot).subscribe(datos_ot => {
      for (let i = 0; i < datos_ot.length; i++) {
        let FechaCreacionDatetime = datos_ot[i].fechaCrea;
        let FechacreacionNueva = FechaCreacionDatetime.indexOf("T");
        let fechaCreacionFinal = FechaCreacionDatetime.substring(0, FechacreacionNueva);
        this.detallesAsgBOPPService.srvObtenerListaPorOt(ot).subscribe(datos_dtAsgBOPP => {
          for (let j = 0; j < datos_dtAsgBOPP.length; j++) {
            this.estadosService.srvObtenerListaPorId(datos_dtAsgBOPP[j].estado_OrdenTrabajo).subscribe(datos_estados => {
              let estado : any = [];
              estado.push(datos_estados);
              for (const itemEstado of estado) {
                this.asignacionBOPPService.srvObtenerListaPorId(datos_dtAsgBOPP[j].asigBOPP_Id).subscribe(datos_asgBOPP => {
                  let asg : any = [];
                  asg.push(datos_asgBOPP);
                  for (const item of asg) {
                    const pdfDefinicion : any = {
                      info: {
                        title: `Orden de Trabajo N° ${ot}`
                      },
                      content : [
                        {
                          text: `Plasticaribe S.A.S`,
                          alignment: 'center',
                          style: 'titulo',
                        },
                        '\n \n',
                        {
                          text: `Fecha de Creación: ${fechaCreacionFinal}`,
                          style: 'header',
                          alignment: 'right',
                        },
                        {
                          text: `Estado Orden de Trabajo: ${itemEstado.estado_Nombre}\n`,
                          alignment: 'right',
                          style: 'header',
                        },
                        {
                          text: `\n Información de la Orden de Trabajo \n \n`,
                          alignment: 'center',
                          style: 'header'
                        },
                        {
                          style: 'tablaCliente',
                          table: {
                            widths: ['*', '*', '*'],
                            style: 'header',
                            body: [
                              [
                                `Cliente: ${datos_ot[i].clienteNom}`,
                                `Item: ${datos_ot[i].clienteItemsNom}`,
                                ``
                              ],
                              [
                                `Presentación: ${datos_ot[i].ptPresentacionNom}`,
                                `Und: ${datos_ot[i].datoscantBolsa}`,
                                `Kg: ${datos_ot[i].datosotKg}`
                              ],
                              [
                                `Valor Und: ${datos_ot[i].datosvalorBolsa}`,
                                `Valor Kg: ${datos_ot[i].datosValorKg}`,
                                `Valor OT: ${datos_ot[i].datosvalorOt}`
                              ]
                            ]
                          },
                          layout: 'lightHorizontalLines',
                          fontSize: 9,
                        },
                        {
                          text: `\n \nObervación sobre la Orden de Trabajo: \n ${datos_ot[i].observacion} \n`,
                          style: 'header',
                        },
                        {
                          text: `\n \nInformación de la Asignación \n \n`,
                          alignment: 'center',
                          style: 'header'
                        },
                        {
                          text: `\n \nObervación sobre la Asignación: \n \n`,
                          style: 'header',
                        },

                        this.tableAsignacionBOPP(this.ArrayAsgOt, ['Id', 'Serial', 'Nombre']),

                        {
                          text: `\nCantidad Asignada: ${this.formatonumeros(Math.round(this.cantidadKgTotalEntreagada))}`,
                          alignment: 'right',
                          style: 'header',
                        },

                        '\n',
                        {
                          text: `\nCantidad Producida: ${this.formatonumeros(Math.round(this.producidoEmpKg))}`,
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
                          fontSize: 15,
                          bold: true
                        }
                      }
                    }
                    const pdf = pdfMake.createPdf(pdfDefinicion);
                    pdf.open();
                  }
                });
              }
            });
            break;
          }
        });
        break;
      }
    });
  }
}
