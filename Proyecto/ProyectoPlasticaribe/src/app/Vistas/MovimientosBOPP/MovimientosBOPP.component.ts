import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import pdfMake from 'pdfmake/build/pdfmake';
import { AsignacionBOPPService } from 'src/app/Servicios/asignacionBOPP.service';
import { BagproService } from 'src/app/Servicios/Bagpro.service';
import { DetalleAsignacion_BOPPService } from 'src/app/Servicios/detallesAsignacionBOPP.service';
import { EntradaBOPPService } from 'src/app/Servicios/entrada-BOPP.service';
import { EstadosService } from 'src/app/Servicios/estados.service';
import { RolesService } from 'src/app/Servicios/roles.service';
import { TipoDocumentoService } from 'src/app/Servicios/tipoDocumento.service';
import { UsuarioService } from 'src/app/Servicios/usuario.service';
import Swal from 'sweetalert2';
import { ModalEditarAsignacionesBOPPComponent } from '../modal-editar-asignaciones-bopp/modal-editar-asignaciones-bopp.component';

@Component({
  selector: 'app-MovimientosBOPP',
  templateUrl: './MovimientosBOPP.component.html',
  styleUrls: ['./MovimientosBOPP.component.css']
})
export class MovimientosBOPPComponent implements OnInit {

  @ViewChild(ModalEditarAsignacionesBOPPComponent)  EditarAsignacionesBOPP : ModalEditarAsignacionesBOPPComponent //Servirá para hacer la edición de asignacion

  public FormDocumentos !: FormGroup;
  public page : number; //Variable que tendrá el paginado de la tabla en la que se muestran los pedidos consultados
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  tipoDocumento = []; //Variable que almacenará los diferentes tipos d documentos que pueden ser consultados
  ArrayBopp : any [] = []; //Variable que tendrá la informacion de los BOPP
  load : boolean = true; //Variabel para permitir que se vea o no una imagen de carga
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  ArrayInfoConsulta : any [] = []; //Variable que tendrá la informacion de los resultados de la consulta realizada
  ArrayEstados : any = []; //Variable en la que se almacenaran los estados que puede tener una orden de trabajo
  ArrayMpPDF : any = [] //Variable que almacenará las materias primas del pdf que se esé consultando

  modalBOPP : any = false;
  public identificadorAsignacion : number;
  public modalEdicionAsignacionBOPP : boolean = false;
  arrayOT : any = [];
  producidoPDF = 0;
  asignadoPDF = 0;
  acumuladorOTPDF = [];
  boppAsignada : any = [];

  constructor(private rolService : RolesService,
                private frmBuilderMateriaPrima : FormBuilder,
                  @Inject(SESSION_STORAGE) private storage: WebStorageService,
                    private tipoDocuemntoService : TipoDocumentoService,
                      private boppService : EntradaBOPPService,
                        private bagProServices : BagproService,
                          private estadoService : EstadosService,
                            private asignacionBOPPService : AsignacionBOPPService,
                              private dtAsgBOPPService : DetalleAsignacion_BOPPService,
                                private usuarioService : UsuarioService,) {

    this.FormDocumentos = this.frmBuilderMateriaPrima.group({
      idDocumento : [null, Validators.required],
      TipoDocumento: [null, Validators.required],
      boppId : [null, Validators.required],
      bopp: ['', Validators.required],
      fecha: [null, Validators.required],
      fechaFinal : [null, Validators.required],
      estado : [null, Validators.required],
    });
  }

  ngOnInit() {
    this.lecturaStorage();
    this.obtenerTipoDocumento();
    this.obtenerEstados();
  }

  //funcion que va a cambiar el nombre del rollo seleccionado
  cambiarNombrebopp() {
    this.boppService.srvObtenerListaPorSerial(this.FormDocumentos.value.bopp).subscribe(datos_bopp => {
      for (let i = 0; i < datos_bopp.length; i++) {
        this.FormDocumentos.setValue({
          idDocumento : this.FormDocumentos.value.idDocumento,
          TipoDocumento: this.FormDocumentos.value.TipoDocumento,
          boppId : datos_bopp[i].bopP_Id,
          bopp: datos_bopp[i].bopP_Nombre,
          fecha: this.FormDocumentos.value.fecha,
          fechaFinal : this.FormDocumentos.value.fechaFinal,
          estado : this.FormDocumentos.value.estado,
        });
      }
    });
  }

  // Funcion que va a limpiar los campos
  LimpiarCampos() {
    this.FormDocumentos.setValue({
      idDocumento : null,
      TipoDocumento: null,
      bopp : '',
      fecha: null,
      fechaFinal: null,
      estado : null,
    });
    this.ArrayInfoConsulta = [];
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

  //Funcion para obtener los diferentes tipos de documentos que podemos encontrar
  obtenerTipoDocumento(){
    this.tipoDocuemntoService.srvObtenerLista().subscribe(datos_tiposDocumentos => {
      for (let index = 0; index < datos_tiposDocumentos.length; index++) {
        if (datos_tiposDocumentos[index].tpDoc_Id == 'ASIGBOPP') this.tipoDocumento.push(datos_tiposDocumentos[index])
      }
    });
  }

  // Funcion que va a obtener los estados que puede tener una orden de trabajo
  obtenerEstados(){
    this.estadoService.srvObtenerListaEstados().subscribe(datos_estados => {
      for (let i = 0; i < datos_estados.length; i++) {
        if (datos_estados[i].tpEstado_Id == 4){
          this.ArrayEstados.push(datos_estados[i]);
          this.ArrayEstados.sort((a,b) => a.estado_Nombre.localeCompare(b.estado_Nombre));
        }
      }
    });
  }

  //Funvion que ayudará a obtener el bopp
  obtenerBOPP(){
    this.ArrayBopp = [];
    let data : string = this.FormDocumentos.value.bopp;
    this.boppService.GetRollosLike(data).subscribe(datos_bopp => {
      for (let i = 0; i < datos_bopp.length; i++) {
        this.ArrayBopp.push(datos_bopp[i]);
        this.ArrayBopp.sort((a,b) => a.bopP_Nombre.localeCompare(b.bopP_Nombre));
      }
    });
  }

  // Funcion que buscará el BOPP segun la fecha que se le pase
  buscarBOPPSegunFecha(){
    let fecha : any = this.FormDocumentos.value.fecha;
    let fechaFinal : any = this.FormDocumentos.value.fechaFinal;
    let IdBOPP : any = [];

    if (fecha != null && fechaFinal != null) {
      this.ArrayBopp = [];
      this.asignacionBOPPService.srvObtenerListaPorfechas(fecha, fechaFinal).subscribe(datos_asignaciones => {
        for (let i = 0; i < datos_asignaciones.length; i++) {
          this.dtAsgBOPPService.srvObtenerListaPorAsignacion(datos_asignaciones[i].asigBOPP_Id).subscribe(datos_detallesBOPP => {
            for (let j = 0; j < datos_detallesBOPP.length; j++) {
              this.boppService.srvObtenerListaPorId(datos_detallesBOPP[j].bopP_Id).subscribe(datos_bopp => {
                let bopp : any = [];
                bopp.push(datos_bopp);
                for (const item of bopp) {
                  if (!IdBOPP.includes(item.bopP_Id)) {
                    IdBOPP.push(item.bopP_Id)
                    this.ArrayBopp.push(item);
                    this.ArrayBopp.sort((a,b) => a.bopP_Nombre.localeCompare(b.bopP_Nombre));
                  } else continue;
                }
              });
            }
          });
        }
      });
    } else if (fecha != null){
      this.ArrayBopp = [];
      this.asignacionBOPPService.srvObtenerListaPorfecha(fecha).subscribe(datos_asignaciones => {
        for (let i = 0; i < datos_asignaciones.length; i++) {
          this.dtAsgBOPPService.srvObtenerListaPorAsignacion(datos_asignaciones[i].asigBOPP_Id).subscribe(datos_detallesBOPP => {
            for (let j = 0; j < datos_detallesBOPP.length; j++) {
              this.boppService.srvObtenerListaPorId(datos_detallesBOPP[j].bopP_Id).subscribe(datos_bopp => {
                let bopp : any = [];
                bopp.push(datos_bopp);
                for (const item of bopp) {
                  if (!IdBOPP.includes(item.bopP_Id)) {
                    IdBOPP.push(item.bopP_Id)
                    this.ArrayBopp.push(item);
                    this.ArrayBopp.sort((a,b) => a.bopP_Nombre.localeCompare(b.bopP_Nombre));
                  } else continue;
                }
              });
            }
          });
        }
      });
    } else if (fechaFinal != null) {
      this.ArrayBopp = [];
      this.asignacionBOPPService.srvObtenerListaPorfecha(fechaFinal).subscribe(datos_asignaciones => {
        for (let i = 0; i < datos_asignaciones.length; i++) {
          this.dtAsgBOPPService.srvObtenerListaPorAsignacion(datos_asignaciones[i].asigBOPP_Id).subscribe(datos_detallesBOPP => {
            for (let j = 0; j < datos_detallesBOPP.length; j++) {
              this.boppService.srvObtenerListaPorId(datos_detallesBOPP[j].bopP_Id).subscribe(datos_bopp => {
                let bopp : any = [];
                bopp.push(datos_bopp);
                for (const item of bopp) {
                  if (!IdBOPP.includes(item.bopP_Id)) {
                    IdBOPP.push(item.bopP_Id)
                    this.ArrayBopp.push(item);
                    this.ArrayBopp.sort((a,b) => a.bopP_Nombre.localeCompare(b.bopP_Nombre));
                  } else continue;
                }
              });
            }
          });
        }
      });
    }
  }

  // Funcion que va a consultar por cada la combinacion de filtro que se le idequen
  consultar(){
    this.load = false;
    let ot : number = this.FormDocumentos.value.idDocumento;
    let tipoDoc : string = this.FormDocumentos.value.TipoDocumento;
    let fechaIncial : any = this.FormDocumentos.value.fecha;
    let fechaFinal : any = this.FormDocumentos.value.fechaFinal;
    let bopp : any = this.FormDocumentos.value.boppId;
    let estado : any = this.FormDocumentos.value.estado;

    if (ot != null && tipoDoc != null && fechaIncial != null && fechaFinal != null && bopp != null && estado != null) {
      if (tipoDoc == 'ASIGBOPP') {
        this.dtAsgBOPPService.srvObtenerConsultaMov6(ot, fechaIncial, fechaFinal).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].bopP_Id == bopp && datos_asignacion[i].estado_OrdenTrabajo == estado) this.llenarTabla(datos_asignacion[i], 'ASIGBOPP');
          }
        });
      }
    } else if (tipoDoc != null && fechaIncial != null && fechaFinal != null && bopp != null && estado != null) {
      if (tipoDoc == 'ASIGBOPP') {
        this.dtAsgBOPPService.srvObtenerConsultaMov7(fechaIncial, fechaFinal, estado).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].bopP_Id == bopp) this.llenarTabla(datos_asignacion[i], 'ASIGBOPP');
          }
        });
      }
    } else if (ot != null && tipoDoc != null && fechaIncial != null && bopp != null && estado != null) {
      if (tipoDoc == 'ASIGBOPP') {
        this.dtAsgBOPPService.srvObtenerConsultaMov3(ot).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].asigBOPP_FechaEntrega.replace('T00:00:00', '') == fechaIncial
                && datos_asignacion[i].estado_OrdenTrabajo == estado
                  && datos_asignacion[i].bopP_Id == bopp) this.llenarTabla(datos_asignacion[i], 'ASIGBOPP');
          }
        });
      }
    } else if (ot != null && fechaIncial != null && fechaFinal != null && bopp != null && estado != null) {
      // Asignacion de BOPP
      this.dtAsgBOPPService.srvObtenerConsultaMov6(ot, fechaIncial, fechaFinal).subscribe(datos_asignacion => {
        for (let i = 0; i < datos_asignacion.length; i++) {
          if (datos_asignacion[i].estado_OrdenTrabajo == estado && datos_asignacion[i].bopP_Id == bopp) this.llenarTabla(datos_asignacion[i], 'ASIGBOPP');
        }
      });
    } else if (ot != null && tipoDoc != null && fechaIncial != null && fechaFinal != null && estado != null) {
      if (tipoDoc == 'ASIGBOPP') {
        this.dtAsgBOPPService.srvObtenerConsultaMov6(ot, fechaIncial, fechaFinal).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].estado_OrdenTrabajo == estado) this.llenarTabla(datos_asignacion[i], 'ASIGBOPP');
          }
        });
      }
    } else if (ot != null && tipoDoc != null && fechaIncial != null && fechaFinal != null && bopp != null) {
      if (tipoDoc == 'ASIGBOPP') {
        this.dtAsgBOPPService.srvObtenerConsultaMov6(ot, fechaIncial, fechaFinal).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].bopP_Id == bopp) this.llenarTabla(datos_asignacion[i], 'ASIGBOPP');
          }
        });
      }
    } else if (fechaIncial != null && fechaFinal != null && bopp != null && estado != null) {
      // Asignación de bopp
      this.dtAsgBOPPService.srvObtenerConsultaMov7(fechaIncial, fechaFinal, estado).subscribe(datos_asignacion => {
        for (let i = 0; i < datos_asignacion.length; i++) {
          if (datos_asignacion[i].bopP_Id == bopp) this.llenarTabla(datos_asignacion[i], 'ASIGBOPP');
        }
      });
    } else if (tipoDoc != null && fechaIncial != null && bopp != null && estado != null) {
      if (tipoDoc == 'ASIGBOPP') {
        this.dtAsgBOPPService.srvObtenerConsultaMov5(fechaIncial, bopp).subscribe(datos_asignaciones => {
          for (let i = 0; i < datos_asignaciones.length; i++) {
            if (datos_asignaciones[i].estado_OrdenTrabajo == estado) this.llenarTabla(datos_asignaciones[i], 'ASIGBOPP')
          }
        });
      }
    } else if (tipoDoc != null && fechaIncial != null && fechaFinal != null && estado != null) {
      if (tipoDoc == 'ASIGBOPP') {
        this.dtAsgBOPPService.srvObtenerConsultaMov7(fechaIncial, fechaFinal, estado).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            this.llenarTabla(datos_asignacion[i], 'ASIGBOPP');
          }
        });
      }
    } else if (tipoDoc != null && fechaIncial != null && fechaFinal != null && bopp != null) {
      if (tipoDoc == 'ASIGBOPP') {
        this.dtAsgBOPPService.srvObtenerConsultaMov8(fechaIncial, fechaFinal, bopp).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            this.llenarTabla(datos_asignacion[i], 'ASIGBOPP');
          }
        });
      } else if (tipoDoc == 'ENTBOPP') {
        this.boppService.srvObtenerConsultaMov5(fechaIncial, fechaFinal, bopp).subscribe(datos_entradaBopp => {
          for (let i = 0; i < datos_entradaBopp.length; i++) {
            this.llenarTabla(datos_entradaBopp[i], 'ENTBOPP');
          }
        });
      }
    } else if (ot != null && tipoDoc != null && bopp != null && estado != null) {
      if (tipoDoc == 'ASIGBOPP') {
        this.dtAsgBOPPService.srvObtenerConsultaMov3(ot).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].estado_OrdenTrabajo == estado && datos_asignacion[i].bopP_Id == bopp) this.llenarTabla(datos_asignacion[i], 'ASIGBOPP')
          }
        });
      }
    } else if (ot != null && tipoDoc != null && fechaIncial != null && estado != null) {
      if (tipoDoc == 'ASIGBOPP') {
        this.dtAsgBOPPService.srvObtenerConsultaMov3(ot).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].asigBOPP_FechaEntrega.replace('T00:00:00', '') == fechaIncial && datos_asignacion[i].estado_OrdenTrabajo == estado) this.llenarTabla(datos_asignacion[i], 'ASIGBOPP')
          }
        });
      }
    } else if (ot != null && tipoDoc != null && fechaIncial != null && bopp != null) {
      if (tipoDoc == 'ASIGBOPP') {
        this.dtAsgBOPPService.srvObtenerConsultaMov3(ot).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].asigBOPP_FechaEntrega.replace('T00:00:00', '') == fechaIncial && datos_asignacion[i].bopP_Id == bopp) this.llenarTabla(datos_asignacion[i], 'ASIGBOPP')
          }
        });
      }
    } else if (ot != null && fechaIncial != null && fechaFinal != null && estado != null) {
      // Asignación de bopp
      this.dtAsgBOPPService.srvObtenerConsultaMov6(ot, fechaIncial, fechaFinal).subscribe(datos_asignacion => {
        for (let i = 0; i < datos_asignacion.length; i++) {
          if (datos_asignacion[i].estado_OrdenTrabajo == estado) this.llenarTabla(datos_asignacion[i], 'ASIGBOPP');
        }
      });
    } else if (ot != null && fechaIncial != null && fechaFinal != null && bopp != null) {
      // Asignación de bopp
      this.dtAsgBOPPService.srvObtenerConsultaMov6(ot, fechaIncial, fechaFinal).subscribe(datos_asignacion => {
        for (let i = 0; i < datos_asignacion.length; i++) {
          if (datos_asignacion[i].bopP_Id == bopp) this.llenarTabla(datos_asignacion[i], 'ASIGBOPP');
        }
      });
    } else if (ot != null && tipoDoc != null && fechaIncial != null && fechaFinal != null) {
      if (tipoDoc == 'ASIGBOPP') {
        this.dtAsgBOPPService.srvObtenerConsultaMov6(ot, fechaIncial, fechaFinal).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            this.llenarTabla(datos_asignacion[i], 'ASIGBOPP');
          }
        });
      } else if (tipoDoc == 'ENTBOPP') {
        this.boppService.srvObtenerConsultaMov4(ot, fechaIncial, fechaFinal).subscribe(datos_entradaBopp => {
          for (let i = 0; i < datos_entradaBopp.length; i++) {
            this.llenarTabla(datos_entradaBopp[i], 'ENTBOPP');
          }
        });
      }
    } else if (fechaIncial != null && fechaFinal != null && estado != null) {
      this.dtAsgBOPPService.srvObtenerConsultaMov7(fechaIncial, fechaFinal, estado).subscribe(datos_asignacion => {
        for (let i = 0; i < datos_asignacion.length; i++) {
          this.llenarTabla(datos_asignacion[i], 'ASIGBOPP');
        }
      });
    } else if (fechaIncial != null && fechaFinal != null && bopp != null) {
      // Asignación de bopp
      this.dtAsgBOPPService.srvObtenerConsultaMov8(fechaIncial, fechaFinal, bopp).subscribe(datos_asignacion => {
        for (let i = 0; i < datos_asignacion.length; i++) {
          this.llenarTabla(datos_asignacion[i], 'ASIGBOPP');
        }
      });
      // Entrada de bopp
      this.boppService.srvObtenerConsultaMov5(fechaIncial, fechaFinal, bopp).subscribe(datos_entradaBopp => {
        for (let i = 0; i < datos_entradaBopp.length; i++) {
          this.llenarTabla(datos_entradaBopp[i], 'ENTBOPP');
        }
      });
    } else if (tipoDoc != null && fechaIncial != null && estado != null) {
      if (tipoDoc == 'ASIGBOPP') {
        this.dtAsgBOPPService.srvObtenerConsultaMov0(fechaIncial).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].estado_OrdenTrabajo == estado) this.llenarTabla(datos_asignacion[i], 'ASIGBOPP');
          }
        });
      }
    } else if (tipoDoc != null && fechaIncial != null && bopp != null) {
      if (tipoDoc == 'ASIGBOPP') {
        this.dtAsgBOPPService.srvObtenerConsultaMov5(fechaIncial, bopp).subscribe(datos_asignaciones => {
          for (let i = 0; i < datos_asignaciones.length; i++) {
            this.llenarTabla(datos_asignaciones[i], 'ASIGBOPP')
          }
        });
      } else if (tipoDoc == 'ENTBOPP') {
        this.boppService.srvObtenerConsultaMov1(bopp, fechaIncial).subscribe(datos_entradaBopp => {
          for (let i = 0; i < datos_entradaBopp.length; i++) {
            this.llenarTabla(datos_entradaBopp[i], 'ENTBOPP');
          }
        });
      }
    } else if (tipoDoc != null && fechaIncial != null && fechaFinal != null) {
      if (tipoDoc == 'ASIGBOPP') {
        this.dtAsgBOPPService.srvObtenerConsultaMov4(fechaIncial, fechaFinal).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            this.llenarTabla(datos_asignacion[i], 'ASIGBOPP');
          }
        });
      } else if (tipoDoc == 'ENTBOPP') {
        this.boppService.srvObtenerConsultaMov3(fechaIncial, fechaFinal).subscribe(datos_entradaBopp => {
          for (let i = 0; i < datos_entradaBopp.length; i++) {
            this.llenarTabla(datos_entradaBopp[i], 'ENTBOPP');
          }
        });
      }
    } else if (ot != null && bopp != null && estado != null) {
      // Asignación de bopp
      this.dtAsgBOPPService.srvObtenerConsultaMov3(ot).subscribe(datos_asignacion => {
        for (let i = 0; i < datos_asignacion.length; i++) {
          if (datos_asignacion[i].estado_OrdenTrabajo == estado && datos_asignacion[i].bopP_Id == bopp) this.llenarTabla(datos_asignacion[i], 'ASIGBOPP')
        }
      });
    } else if (ot != null && fechaIncial != null && estado != null) {
      // Asignación de bopp
      this.dtAsgBOPPService.srvObtenerConsultaMov3(ot).subscribe(datos_asignacion => {
        for (let i = 0; i < datos_asignacion.length; i++) {
          if (datos_asignacion[i].asigBOPP_FechaEntrega.replace('T00:00:00', '') == fechaIncial && datos_asignacion[i].estado_OrdenTrabajo == estado) this.llenarTabla(datos_asignacion[i], 'ASIGBOPP')
        }
      });
    } else if (ot != null && fechaIncial != null && bopp != null) {
      // Asignación de bopp
      this.dtAsgBOPPService.srvObtenerConsultaMov3(ot).subscribe(datos_asignacion => {
        for (let i = 0; i < datos_asignacion.length; i++) {
          if (datos_asignacion[i].asigBOPP_FechaEntrega.replace('T00:00:00', '') == fechaIncial && datos_asignacion[i].bopP_Id == bopp) this.llenarTabla(datos_asignacion[i], 'ASIGBOPP')
        }
      });
    } else if (ot != null && fechaIncial != null && fechaFinal != null) {
      // Asignación de bopp
      this.dtAsgBOPPService.srvObtenerConsultaMov6(ot, fechaIncial, fechaFinal).subscribe(datos_asignacion => {
        for (let i = 0; i < datos_asignacion.length; i++) {
          this.llenarTabla(datos_asignacion[i], 'ASIGBOPP');
        }
      });
      // Entrada de bopp
      this.boppService.srvObtenerConsultaMov4(ot, fechaIncial, fechaFinal).subscribe(datos_entradaBopp => {
        for (let i = 0; i < datos_entradaBopp.length; i++) {
          this.llenarTabla(datos_entradaBopp[i], 'ENTBOPP');
        }
      });
    } else if (ot != null && tipoDoc != null && estado != null) {
      if (tipoDoc == 'ASIGBOPP') {
        this.dtAsgBOPPService.srvObtenerConsultaMov3(ot).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].estado_OrdenTrabajo == estado) this.llenarTabla(datos_asignacion[i], 'ASIGBOPP');
          }
        });
      }
    } else if (ot != null && tipoDoc != null && bopp != null) {
      if (tipoDoc == 'ASIGBOPP') {
        this.dtAsgBOPPService.srvObtenerConsultaMov3(ot).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].bopP_Id == bopp) this.llenarTabla(datos_asignacion[i], 'ASIGBOPP');
          }
        });
      }
    } else if (ot != null && tipoDoc != null && fechaIncial != null) {
      if (tipoDoc == 'ASIGBOPP') {
        this.dtAsgBOPPService.srvObtenerConsultaMov3(ot).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].asigBOPP_FechaEntrega.replace('T00:00:00', '') == fechaIncial) this.llenarTabla(datos_asignacion[i], 'ASIGBOPP')
          }
        });
      } else if (tipoDoc == 'ENTBOPP') {
        this.boppService.srvObtenerConsultaMov1(ot, fechaIncial).subscribe(datos_entradaBopp => {
          for (let i = 0; i < datos_entradaBopp.length; i++) {
            this.llenarTabla(datos_entradaBopp[i], 'ENTBOPP');
          }
        });
      }
    } else if (fechaIncial != null && bopp != null) {
      // Asignación de bopp
      this.dtAsgBOPPService.srvObtenerConsultaMov5(fechaIncial, bopp).subscribe(datos_asignaciones => {
        for (let i = 0; i < datos_asignaciones.length; i++) {
          this.llenarTabla(datos_asignaciones[i], 'ASIGBOPP')
        }
      });
      // Entrada de bopp
      this.boppService.srvObtenerConsultaMov6(bopp, fechaIncial).subscribe(datos_entradaBopp => {
        for (let i = 0; i < datos_entradaBopp.length; i++) {
          this.llenarTabla(datos_entradaBopp[i], 'ENTBOPP');
        }
      });
    } else if (fechaIncial != null && fechaFinal != null) {
      // Asignación de bopp
      this.dtAsgBOPPService.srvObtenerConsultaMov4(fechaIncial, fechaFinal).subscribe(datos_asignacion => {
        for (let i = 0; i < datos_asignacion.length; i++) {
          this.llenarTabla(datos_asignacion[i], 'ASIGBOPP');
        }
      });
      // Entrada de bopp
      this.boppService.srvObtenerConsultaMov3(fechaIncial, fechaFinal).subscribe(datos_entradaBopp => {
        for (let i = 0; i < datos_entradaBopp.length; i++) {
          this.llenarTabla(datos_entradaBopp[i], 'ENTBOPP');
        }
      });
    } else if (tipoDoc != null && bopp != null) {
      if (tipoDoc == 'ASIGBOPP') {
        this.dtAsgBOPPService.srvObtenerConsultaMov2(bopp, this.today).subscribe(datos_asignaciones => {
          for (let i = 0; i < datos_asignaciones.length; i++) {
            this.llenarTabla(datos_asignaciones[i], 'ASIGBOPP')
          }
        });
      } else if (tipoDoc == 'ENTBOPP') {
        this.boppService.srvObtenerConsultaMov1(bopp, this.today).subscribe(datos_entradaBopp => {
          for (let i = 0; i < datos_entradaBopp.length; i++) {
            this.llenarTabla(datos_entradaBopp[i], 'ENTBOPP');
          }
        });
      }
    } else if (tipoDoc != null && fechaIncial != null) {
      if (tipoDoc == 'ASIGBOPP') {
        this.dtAsgBOPPService.srvObtenerConsultaMov0(fechaIncial).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            this.llenarTabla(datos_asignacion[i], 'ASIGBOPP');
          }
        });
      } else if (tipoDoc == 'ENTBOPP') {
        this.boppService.srvObtenerConsultaMov0(fechaIncial).subscribe(datos_entradaBopp => {
          for (let i = 0; i < datos_entradaBopp.length; i++) {
            this.llenarTabla(datos_entradaBopp[i], 'ENTBOPP');
          }
        });
      }
    } else if (ot != null && estado != null) {
      // Asignación de bopp
      this.dtAsgBOPPService.srvObtenerConsultaMov3(ot).subscribe(datos_asignacion => {
        for (let i = 0; i < datos_asignacion.length; i++) {
          if (datos_asignacion[i].estado_OrdenTrabajo == estado) this.llenarTabla(datos_asignacion[i], 'ASIGBOPP');
        }
      });
    } else if (ot != null && bopp != null) {
      // Asignación de bopp
      this.dtAsgBOPPService.srvObtenerConsultaMov3(ot).subscribe(datos_asignacion => {
        for (let i = 0; i < datos_asignacion.length; i++) {
          if (datos_asignacion[i].bopP_Id == bopp) this.llenarTabla(datos_asignacion[i], 'ASIGBOPP');
        }
      });
    } else if (ot != null && fechaIncial != null) {
      // Asignación de bopp
      this.dtAsgBOPPService.srvObtenerConsultaMov3(ot).subscribe(datos_asignacion => {
        for (let i = 0; i < datos_asignacion.length; i++) {
          if (datos_asignacion[i].asigBOPP_FechaEntrega.replace('T00:00:00', '') == fechaIncial) this.llenarTabla(datos_asignacion[i], 'ASIGBOPP')
        }
      });
      // Entrada de bopp
      this.boppService.srvObtenerConsultaMov1(ot, fechaIncial).subscribe(datos_entradaBopp => {
        for (let i = 0; i < datos_entradaBopp.length; i++) {
          this.llenarTabla(datos_entradaBopp[i], 'ENTBOPP');
        }
      });
    } else if (ot != null && tipoDoc != null) {
      if (tipoDoc == 'ASIGBOPP') {
        this.dtAsgBOPPService.srvObtenerConsultaMov3(ot).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            this.llenarTabla(datos_asignacion[i], 'ASIGBOPP')
          }
        });
      } else if (tipoDoc == 'ENTBOPP') {
        this.boppService.srvObtenerConsultaMov2(ot).subscribe(datos_entradaBopp => {
          for (let i = 0; i < datos_entradaBopp.length; i++) {
            this.llenarTabla(datos_entradaBopp[i], 'ENTBOPP');
          }
        });
      }
    } else if (ot != null) {
      // Asignación de bopp
      this.dtAsgBOPPService.srvObtenerConsultaMov3(ot).subscribe(datos_asignacion => {
        for (let i = 0; i < datos_asignacion.length; i++) {
          this.llenarTabla(datos_asignacion[i], 'ASIGBOPP')
        }
      });
      // Entrada de bopp
      this.boppService.srvObtenerConsultaMov2(ot).subscribe(datos_entradaBopp => {
        for (let i = 0; i < datos_entradaBopp.length; i++) {
          this.llenarTabla(datos_entradaBopp[i], 'ENTBOPP');
        }
      });
    } else if (tipoDoc != null) {
      if (tipoDoc == 'ASIGBOPP') {
        this.dtAsgBOPPService.srvObtenerConsultaMov2(bopp, this.today).subscribe(datos_asignaciones => {
          for (let i = 0; i < datos_asignaciones.length; i++) {
            this.llenarTabla(datos_asignaciones[i], 'ASIGBOPP')
          }
        });
      } else if (tipoDoc == 'ENTBOPP') {
        this.boppService.srvObtenerConsultaMov0(this.today).subscribe(datos_entradaBopp => {
          for (let i = 0; i < datos_entradaBopp.length; i++) {
            this.llenarTabla(datos_entradaBopp[i], 'ENTBOPP');
          }
        });
      }
    } else if (fechaIncial != null) {
      // Asignación de bopp
      this.dtAsgBOPPService.srvObtenerConsultaMov0(fechaIncial).subscribe(datos_asignacion => {
        for (let i = 0; i < datos_asignacion.length; i++) {
          this.llenarTabla(datos_asignacion[i], 'ASIGBOPP');
        }
      });
      // Entarda de bopp
      this.boppService.srvObtenerConsultaMov0(fechaIncial).subscribe(datos_entradaBopp => {
        for (let i = 0; i < datos_entradaBopp.length; i++) {
          this.llenarTabla(datos_entradaBopp[i], 'ENTBOPP');
        }
      });
    } else if (bopp != null) {
      // Asignación de bopp
      this.dtAsgBOPPService.srvObtenerConsultaMov2(bopp, this.today).subscribe(datos_asignaciones => {
        for (let i = 0; i < datos_asignaciones.length; i++) {
          this.llenarTabla(datos_asignaciones[i], 'ASIGBOPP')
        }
      });
      // Entrada de bopp
      this.boppService.srvObtenerConsultaMov1(bopp, this.today).subscribe(datos_entradaBopp => {
        for (let i = 0; i < datos_entradaBopp.length; i++) {
          this.llenarTabla(datos_entradaBopp[i], 'ENTBOPP');
        }
      });
    } else if (estado != null) {
      // Asignacion de BOPP
      this.dtAsgBOPPService.srvObtenerConsultaMov1(estado).subscribe(datos_asignacion => {
        for (let i = 0; i < datos_asignacion.length; i++) {
          this.llenarTabla(datos_asignacion[i], 'ASIGBOPP');
        }
      });
    } else {
      // Asignación de bopp
      this.dtAsgBOPPService.srvObtenerConsultaMov0(this.today).subscribe(datos_asignacion => {
        for (let i = 0; i < datos_asignacion.length; i++) {
          this.llenarTabla(datos_asignacion[i], 'ASIGBOPP');
        }
      });
      // Entrada de bopp
      this.boppService.srvObtenerConsultaMov0(this.today).subscribe(datos_entradaBopp => {
        for (let i = 0; i < datos_entradaBopp.length; i++) {
          this.llenarTabla(datos_entradaBopp[i], 'ENTBOPP');
        }
      });
    }
    setTimeout(() => { this.load = true; }, 3000);
  }

  // Funcion para llenar la tabla con la informcion consultada
  llenarTabla(datos : any, tipoDoc : any){
    if (tipoDoc == 'ASIGBOPP') {
      let info : any = {
        id : datos.asigBOPP_Id,
        ot : datos.dtAsigBOPP_OrdenTrabajo,
        tipoId : 'ASIGBOPP',
        tipo : 'Asignación de BOPP',
        fecha : datos.asigBOPP_FechaEntrega,
        usuario : datos.usua_Nombre,
        matPrima : datos.bopP_Nombre,
        cant : datos.dtAsigBOPP_Cantidad,
        estado : datos.estado_Nombre,
      }
      this.ArrayInfoConsulta.push(info);
    } else if (tipoDoc == 'ENTBOPP') {
      let info : any = {
        ot : datos.bopP_Serial,
        tipoId : 'ENTBOPP',
        tipo : 'Entrada de BOPP',
        fecha : datos.bopP_FechaIngreso,
        usuario : datos.usua_Nombre,
        matPrima : datos.bopP_Nombre,
        cant : datos.bopP_CantidadInicialKg,
        estado : '',
      }
      this.ArrayInfoConsulta.push(info);
    }
    this.ArrayInfoConsulta.sort((a,b) => Number(a.ot) - Number(b.ot));
    this.ArrayInfoConsulta.sort((a,b) => b.fecha.localeCompare(a.fecha));
  }

  // Funcion que almacenará en una variable todas las materia primas del movimiento al que se le hizo la consulta
  articulosPdf(data : any){
    this.ArrayMpPDF = [];
    this.load = false;
    if (data.tipoId == 'ASIGBOPP') {
      let otConsultadas = [];
      this.boppAsignada = [];
      this.producidoPDF = 0;
      this.asignadoPDF = 0;
      this.acumuladorOTPDF = [];
      this.dtAsgBOPPService.srvObtenerListaPorAsignacion(data.id).subscribe(datos_detallesAsgBOPP => {
        for (let i = 0; i < datos_detallesAsgBOPP.length; i++) {
          if (!otConsultadas.includes(datos_detallesAsgBOPP[i].dtAsigBOPP_OrdenTrabajo)) {
            otConsultadas.push(datos_detallesAsgBOPP[i].dtAsigBOPP_OrdenTrabajo);
          }
        }
      });

      setTimeout(() => {
        for (const itemOT of otConsultadas) {
          this.dtAsgBOPPService.srvObtenerListaPorOt(itemOT).subscribe(datos_detallesAsgBOPP => {
            for (let j = 0; j < datos_detallesAsgBOPP.length; j++) {
              this.boppService.srvObtenerListaPorId(datos_detallesAsgBOPP[j].bopP_Id).subscribe(datos_bopp => {
                let bopp : any = [];
                bopp.push(datos_bopp);
                for (const item of bopp) {
                  const asignacionBOPP : any = {
                    OT : itemOT,
                    Serial : item.bopP_Serial,
                    Nombre : item.bopP_Nombre,
                  }
                  this.ArrayMpPDF.push(asignacionBOPP);
                  if (!this.boppAsignada.includes(item.bopP_Nombre)) {
                    this.boppAsignada.push(item.bopP_Nombre);
                    this.asignadoPDF += item.bopP_CantidadInicialKg;
                  }
                  // LLENARÁ UN ARRAY CON LAS OT Y BUSCARÁ LA PRODUCCION TOTAL DE LAS OT GUARDADAS
                  if (!this.acumuladorOTPDF.includes(itemOT)) {
                    this.acumuladorOTPDF.push(itemOT);
                    // EMPAQUE
                    this.bagProServices.srvObtenerListaProcExtOt(itemOT).subscribe(datos_procesos => {
                      for (let index = 0; index < datos_procesos.length; index++) {
                        if (datos_procesos[index].nomStatus == "EMPAQUE") {
                          this.producidoPDF += datos_procesos[index].extnetokg;
                        }
                      }
                    });
                  }
                  this.ArrayMpPDF.sort((a,b) => Number(a.OT) - Number(b.OT));
                  break;
                }
              });
            }
          });
        }
        setTimeout(() => { this.verPDF(data); }, 4200);
      }, 1000);
    } else if (data.tipoId == 'ENTBOPP') {

    }
  }

  // Funcion que permitirá ver la informacion del documento en un formato PDF
  verPDF(data : any){
    if (data.tipoId == 'ASIGBOPP') {
      this.asignacionBOPPService.srvObtenerListaPorId(data.id).subscribe(datos_asignacionBOPP => {
        let boppAsg : any = [];
        boppAsg.push(datos_asignacionBOPP);
        for (const item of boppAsg) {
          this.dtAsgBOPPService.srvObtenerListaPorAsignacion(data.id).subscribe(datos_detallesAsgBOPP => {
            for (let i = 0; i < datos_detallesAsgBOPP.length; i++) {
              this.usuarioService.srvObtenerListaPorId(item.usua_Id).subscribe(datos_usuario => {
                for (let mp = 0; mp < this.ArrayMpPDF.length; mp++) {
                  const pdfDefinicion : any = {
                    info: {
                      title: `Asignación BOPP N° ${item.asigBOPP_Id}`
                    },
                    content : [
                      {
                        text: `Plasticaribe S.A.S ---- Asignación de BOPP`,
                        alignment: 'center',
                        style: 'titulo',
                      },
                      '\n \n',
                      {
                        text: `Fecha de registro: ${item.asigBOPP_FechaEntrega.replace('T00:00:00', '')}`,
                        style: 'header',
                        alignment: 'right',
                      },
                      {
                        text: `Registrado Por: ${datos_usuario.usua_Nombre}\n`,
                        alignment: 'right',
                        style: 'header',
                      },
                      {
                        text: `\n Información de la Asignación \n \n`,
                        alignment: 'center',
                        style: 'header'
                      },
                      {
                        text: `\n \nObervación sobre la Asignación: \n ${item.asigBOPP_Observacion}\n`,
                        style: 'header',
                      },

                      {
                        text: `\n Información detallada deL BOPP \n `,
                        alignment: 'center',
                        style: 'header'
                      },

                      this.tableAsignacionBOPP(this.ArrayMpPDF, ['OT', 'Serial', 'Nombre']),

                      {
                        text: `\nCantidad Total de Materia Prima Asignada: ${this.formatonumeros(Math.round(this.asignadoPDF))}`,
                        alignment: 'right',
                        style: 'header',
                      },

                      '\n',
                      {
                        text: `\nProducido por las Ordenes de Trabajo: ${this.formatonumeros(Math.round(this.producidoPDF))}`,
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
                  this.load = true;
                  const pdf = pdfMake.createPdf(pdfDefinicion);
                  pdf.open();
                  break;
                }
              });
              break;
            }
          });
        }
      });
    } else if (data.tipoId == 'ENTBOPP') {

    }
    setTimeout(() => { this.load = true; }, 1000);
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

  //
  editarAsignacion(formulario : any){
    if (formulario.tipoId == 'ASIGBOPP') {
      this.modalBOPP = true;
      this.identificadorAsignacion = formulario.id;
      this.arrayOT = [];
      let boppAsignada : any = [];
      this.EditarAsignacionesBOPP.ArrayBoppPedida = [];
      this.modalEdicionAsignacionBOPP = true;
      this.asignacionBOPPService.srvObtenerListaPorId(formulario.id).subscribe(datos_asignacionBOPP => {
        this.EditarAsignacionesBOPP.cargarDatos(datos_asignacionBOPP);
      });
      this.dtAsgBOPPService.srvObtenerListaPorAsignacion(formulario.id).subscribe(datos_detallesAsgBOPP => {
        for (let i = 0; i < datos_detallesAsgBOPP.length; i++) {
          this.boppService.srvObtenerListaPorId(datos_detallesAsgBOPP[i].bopP_Id).subscribe(datos_bopp => {
            let datosBOPPAsg : any = [];
            datosBOPPAsg.push(datos_bopp);
            for (const item of datosBOPPAsg) {
              if (!boppAsignada.includes(item.bopP_Serial)) {
                boppAsignada.push(item.bopP_Serial);

                let bopp : any = {
                  IdAsg : formulario.id,
                  idBOPP : item.bopP_Id,
                  Serial : item.bopP_Serial,
                  Nombre : item.bopP_Nombre,
                  Cantidad : item.bopP_CantidadInicialKg,
                  Cantidad2 : item.bopP_CantidadInicialKg,
                }
                this.EditarAsignacionesBOPP.ArrayBoppPedida.push(bopp);
                this.EditarAsignacionesBOPP.idAsignacion = formulario.id;
                this.EditarAsignacionesBOPP.boppRegistrados.push(item.bopP_Serial);
              }
            }
          });
          this.infoOT(datos_detallesAsgBOPP[i].dtAsigBOPP_OrdenTrabajo, formulario.id);
        }
      });
    }
    this.load = true;
  }

  //
  limpiarCamposAlCerrarModal() {
    this.EditarAsignacionesBOPP.limpiarTodosLosCampos();
    this.modalBOPP = false;
    this.identificadorAsignacion = 0;
  }

  //
  infoOT(ordenTrabajo : number, IdDtAsg : number){
    if (!this.arrayOT.includes(ordenTrabajo)) {
      this.arrayOT.push(ordenTrabajo);
      this.bagProServices.srvObtenerListaClienteOT_Item(ordenTrabajo).subscribe(datos_OT => {
        for (const itemOT of datos_OT) {
          if (itemOT.estado == null || itemOT.estado == '' || itemOT.estado == '0') {
            const infoOT : any = {
              IdDtAsg : IdDtAsg,
              ot : itemOT.item,
              cliente : itemOT.clienteNom,
              micras : itemOT.extCalibre,
              ancho : itemOT.ptAnchopt,
              item : itemOT.clienteItemsNom,
              kg : itemOT.datosotKg,
            }
            this.EditarAsignacionesBOPP.ordenesTrabajo.push(infoOT);
            this.EditarAsignacionesBOPP.otRegistradas.push(ordenTrabajo);
            break;
          } else if (itemOT.estado == 4 || itemOT.estado == 1) Swal.fire(`No es podible asignar a esta orden de trabajo, la OT ${ordenTrabajo} se encuentra cerrada.`);
        }
      });
    }
  }

}
