import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import pdfMake from 'pdfmake/build/pdfmake';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { DetallesAsignacionMPxTintasService } from 'src/app/Servicios/DetallesCreacionTintas/detallesAsignacionMPxTintas.service';
import { DetallesAsignacionTintasService } from 'src/app/Servicios/DetallesAsgTintas/detallesAsignacionTintas.service';
import { EstadosService } from 'src/app/Servicios/Estados/estados.service';
import { FacturaMpService } from 'src/app/Servicios/DetallesFacturaMateriaPrima/facturaMp.service';
import { MateriaPrimaService } from 'src/app/Servicios/MateriaPrima/materiaPrima.service';
import { RemisionesMPService } from 'src/app/Servicios/DetallesRemisiones/remisionesMP.service';
import { RolesService } from 'src/app/Servicios/Roles/roles.service';
import { TintasService } from 'src/app/Servicios/Tintas/tintas.service';
import { TipoDocumentoService } from 'src/app/Servicios/TipoDocumento/tipoDocumento.service';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';

@Component({
  selector: 'app-movimientos-tintas',
  templateUrl: './movimientos-tintas.component.html',
  styleUrls: ['./movimientos-tintas.component.css']
})
export class MovimientosTintasComponent implements OnInit {

  public FormDocumentos !: FormGroup;
  public page : number; //Variable que tendrá el paginado de la tabla en la que se muestran los pedidos consultados
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  tipoDocumento = []; //Variable que almacenará los diferentes tipos d documentos que pueden ser consultados
  ArrayTintas : any [] = []; /*** Array que tendrá la informacion de las tintas cargadas en el combobox */
  load : boolean = true; //Variabel para permitir que se vea o no una imagen de carga
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  ArrayInfoConsulta : any [] = []; //Variable que tendrá la informacion de los resultados de la consulta realizada
  ArrayEstados : any = []; //Variable en la que se almacenaran los estados que puede tener una orden de trabajo
  ArrayMpPDF : any = [] //Variable que almacenará las materias primas del pdf que se esé consultando

  constructor(private frmBuilderMateriaPrima : FormBuilder,
                @Inject(SESSION_STORAGE) private storage: WebStorageService,
                  private materiaPrimaService : MateriaPrimaService,
                    private tipoDocuemntoService : TipoDocumentoService,
                      private estadoService : EstadosService,
                        private dtFacturaMP : FacturaMpService,
                          private dtRemision : RemisionesMPService,
                            private servicioTintas : TintasService,
                              private dtAsgTinta : DetallesAsignacionTintasService,
                                private dtCreacionTinta : DetallesAsignacionMPxTintasService,) {

    this.FormDocumentos = this.frmBuilderMateriaPrima.group({
      idDocumento : [null, Validators.required],
      TipoDocumento: [null, Validators.required],
      TintaId : [null, Validators.required],
      tintas: ['', Validators.required],
      fecha: [null, Validators.required],
      fechaFinal : [null, Validators.required],
      estado : [null, Validators.required],
    });
  }

  ngOnInit() {
    this.lecturaStorage();
    this.obtenerTipoDocumento();
    this.obtenerEstados();
    this.obtenerTintas();
  }

  //
  tintaSeleccionada() {
    let id : number = this.FormDocumentos.value.tintas;
    this.materiaPrimaService.getInfoMpTintaBopp(id).subscribe(datos_materiaPrima => {
      for (let i = 0; i < datos_materiaPrima.length; i++) {
        this.FormDocumentos.patchValue({
          TintaId : datos_materiaPrima[i].id,
          tintas: datos_materiaPrima[i].nombre,
        });
      }
    });
  }

  // Funcion que va a limpiar los campos
  LimpiarCampos() {
    this.FormDocumentos.reset();
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
    this.ValidarRol = this.storage.get('Rol');
  }

  /*** Funcion: Obtener nombres de tintas */
  obtenerTintas(){
    this.servicioTintas.srvObtenerLista().subscribe(datos_Tintas => {
      for (let i = 0; i < datos_Tintas.length; i++) {
        this.ArrayTintas.push(datos_Tintas[i]);
        this.ArrayTintas.sort((a,b) => a.tinta_Nombre.localeCompare(b.tinta_Nombre));
      }
    });
  }

  //Funcion para obtener los diferentes tipos de documentos que podemos encontrar
  obtenerTipoDocumento(){
    this.tipoDocuemntoService.srvObtenerLista().subscribe(datos_tiposDocumentos => {
      for (let index = 0; index < datos_tiposDocumentos.length; index++) {
        if (datos_tiposDocumentos[index].tpDoc_Id == 'ASIGTINTAS'
        || datos_tiposDocumentos[index].tpDoc_Id == 'CRTINTAS'
        || datos_tiposDocumentos[index].tpDoc_Id == 'REM'
        || datos_tiposDocumentos[index].tpDoc_Id == 'FCO') this.tipoDocumento.push(datos_tiposDocumentos[index]);
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

  // Funcion que va a consultar por cada combinacion de filtro que se le indiquen
  consultar(){
    this.load = false;
    this.ArrayInfoConsulta = [];
    let ot : number = this.FormDocumentos.value.idDocumento;
    let tipoDoc : any = this.FormDocumentos.value.TipoDocumento;
    let tintaConsulta : any = this.FormDocumentos.value.TintaId;
    let fechaIncial : any = moment(this.FormDocumentos.value.fecha).format('YYYY-MM-DD');
    let fechaFinal : any = moment(this.FormDocumentos.value.fechaFinal).format('YYYY-MM-DD');
    let estado : any = this.FormDocumentos.value.estado;

    if (tipoDoc != null) tipoDoc = tipoDoc.tpDoc_Id;
    if (estado != null) estado = estado.estado_Id;
    if (fechaIncial == 'Invalid date') fechaIncial = null;
    if (fechaFinal == 'Invalid date') fechaFinal = null;

    if (ot != null && tipoDoc != null && fechaIncial != null && fechaFinal != null && tintaConsulta != null && estado != null) {
      if (tipoDoc == 'ASIGTINTAS') {
        this.dtAsgTinta.srvObtenerConsultaMov10(ot, fechaIncial, fechaFinal, tintaConsulta, estado).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            this.llenarTabla(datos_asignacion[i]);
          }
        });
      }
    } else if (tipoDoc != null && fechaIncial != null && fechaFinal != null && tintaConsulta != null && estado != null) {
      if (tipoDoc == 'ASIGTINTAS') {
        this.dtAsgTinta.srvObtenerConsultaMov4(fechaIncial, fechaFinal).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].estado_OrdenTrabajo == estado && datos_asignacion[i].tinta_Id == tintaConsulta) this.llenarTabla(datos_asignacion[i]);
          }
        });
      }
    } else if (ot != null && tipoDoc != null && fechaIncial != null && tintaConsulta != null && estado != null) {
      if (tipoDoc == 'ASIGTINTAS') {
        this.dtAsgTinta.srvObtenerConsultaMov3(ot).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].ASIGTINTAS_FechaEntrega.replace('T00:00:00','') == fechaIncial
                && datos_asignacion[i].tinta_Id == tintaConsulta
                && datos_asignacion[i].estado_OrdenTrabajo == estado) this.llenarTabla(datos_asignacion[i]);
          }
        });
      }
    } else if (ot != null && fechaIncial != null && fechaFinal != null && tintaConsulta != null && estado != null) {
      this.dtAsgTinta.srvObtenerConsultaMov6(ot, fechaIncial, fechaFinal).subscribe(datos_asignacion => {
        for (let i = 0; i < datos_asignacion.length; i++) {
          if (datos_asignacion[i].tinta_Id == tintaConsulta && datos_asignacion[i].estado_OrdenTrabajo == estado) this.llenarTabla(datos_asignacion[i]);
        }
      });
    } else if (ot != null && tipoDoc != null && fechaIncial != null && fechaFinal != null && estado != null) {
      if (tipoDoc == 'ASIGTINTAS') {
        this.dtAsgTinta.srvObtenerConsultaMov6(ot, fechaIncial, fechaFinal).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].estado_OrdenTrabajo == estado) this.llenarTabla(datos_asignacion[i]);
          }
        });
      }
    } else if (ot != null && tipoDoc != null && fechaIncial != null && fechaFinal != null && tintaConsulta != null) {
      if (tipoDoc == 'ASIGTINTAS') {
        this.dtAsgTinta.srvObtenerConsultaMov6(ot, fechaIncial, fechaFinal).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].estado != 'Creación Tintas' && datos_asignacion[i].tinta_Id == tintaConsulta) this.llenarTabla(datos_asignacion[i]);
          }
        });
      } else if (tipoDoc == 'CRTINTAS') {
        this.dtAsgTinta.srvObtenerConsultaMov6(ot, fechaIncial, fechaFinal).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].estado == 'Creación Tintas' && datos_asignacion[i].tinta_Id == tintaConsulta) this.llenarTabla(datos_asignacion[i]);
          }
        });
      } else if (tipoDoc == 'FCO') {
        this.dtAsgTinta.srvObtenerConsultaMov6(ot, fechaIncial, fechaFinal).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].estado == 'Factura de Compra' && datos_asignacion[i].tinta_Id == tintaConsulta) this.llenarTabla(datos_asignacion[i]);
          }
        });
      } else if (tipoDoc == 'REM') {
        this.dtAsgTinta.srvObtenerConsultaMov6(ot, fechaIncial, fechaFinal).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].estado == 'Remisión' && datos_asignacion[i].tinta_Id == tintaConsulta) this.llenarTabla(datos_asignacion[i]);
          }
        });
      }
    } else if (fechaIncial != null && fechaFinal != null && tintaConsulta != null && estado != null) {
      this.dtAsgTinta.srvObtenerConsultaMov9(fechaIncial, fechaFinal, tintaConsulta, estado).subscribe(datos_asignacion => {
        for (let i = 0; i < datos_asignacion.length; i++) {
          this.llenarTabla(datos_asignacion[i]);
        }
      });
    } else if (tipoDoc != null && fechaIncial != null && tintaConsulta != null && estado != null) {
      if (tipoDoc == 'ASIGTINTAS') {
        this.dtAsgTinta.srvObtenerConsultaMov2(tintaConsulta, fechaIncial).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].estado_OrdenTrabajo == estado) this.llenarTabla(datos_asignacion[i]);
          }
        });
      }
    } else if (tipoDoc != null && fechaIncial != null && fechaFinal != null && estado != null) {
      if (tipoDoc == 'ASIGTINTAS') {
        this.dtAsgTinta.srvObtenerConsultaMov7(fechaIncial, fechaFinal, estado).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            this.llenarTabla(datos_asignacion[i]);
          }
        });
      }
    } else if (tipoDoc != null && fechaIncial != null && fechaFinal != null && tintaConsulta != null) {
      if (tipoDoc == 'ASIGTINTAS') {
        this.dtAsgTinta.srvObtenerConsultaMov8(fechaIncial, fechaFinal, tintaConsulta).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].estado != 'Creación Tintas') this.llenarTabla(datos_asignacion[i]);
          }
        });
      } else if (tipoDoc == 'CRTINTAS') {
        this.dtAsgTinta.srvObtenerConsultaMov8(fechaIncial, fechaFinal, tintaConsulta).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].estado == 'Creación Tintas') this.llenarTabla(datos_asignacion[i]);
          }
        });
      } else if (tipoDoc == 'FCO') {
        this.dtAsgTinta.srvObtenerConsultaMov8(fechaIncial, fechaFinal, tintaConsulta).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].estado == 'Factura de Compra') this.llenarTabla(datos_asignacion[i]);
          }
        });
      } else if (tipoDoc == 'REM') {
        this.dtAsgTinta.srvObtenerConsultaMov8(fechaIncial, fechaFinal, tintaConsulta).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].estado == 'Remisión') this.llenarTabla(datos_asignacion[i]);
          }
        });
      }
    } else if (ot != null && tipoDoc != null && tintaConsulta != null && estado != null) {
      if (tipoDoc == 'ASIGTINTAS') {
        this.dtAsgTinta.srvObtenerConsultaMov3(ot).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].tinta_Id == tintaConsulta && datos_asignacion[i].estado_OrdenTrabajo == estado) this.llenarTabla(datos_asignacion[i]);
          }
        });
      }
    } else if (ot != null && tipoDoc != null && fechaIncial != null && estado != null) {
      if (tipoDoc == 'ASIGTINTAS') {
        this.dtAsgTinta.srvObtenerConsultaMov3(ot).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].ASIGTINTAS_FechaEntrega.replace('T00:00:00', '') == fechaIncial && datos_asignacion[i].estado_OrdenTrabajo == estado) this.llenarTabla(datos_asignacion[i]);
          }
        });
      }
    } else if (ot != null && tipoDoc != null && fechaIncial != null && tintaConsulta != null) {
      if (tipoDoc == 'ASIGTINTAS') {
        this.dtAsgTinta.srvObtenerConsultaMov3(ot).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].estado != 'Creación Tintas'
                && datos_asignacion[i].ASIGTINTAS_FechaEntrega.replace('T00:00:00', '') == fechaIncial
                && datos_asignacion[i].matPri_Id == tintaConsulta) this.llenarTabla(datos_asignacion[i]);
          }
        });
      } else if (tipoDoc == 'CRTINTAS') {
        this.dtAsgTinta.srvObtenerConsultaMov3(ot).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].estado == 'Creación Tintas'
                && datos_asignacion[i].ASIGTINTAS_FechaEntrega.replace('T00:00:00', '') == fechaIncial
                && datos_asignacion[i].matPri_Id == tintaConsulta) this.llenarTabla(datos_asignacion[i]);
          }
        });
      } else if (tipoDoc == 'FCO') {
        this.dtAsgTinta.srvObtenerConsultaMov3(ot).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].estado == 'Factura de Compra'
            && datos_asignacion[i].ASIGTINTAS_FechaEntrega.replace('T00:00:00', '') == fechaIncial
            && datos_asignacion[i].matPri_Id == tintaConsulta) this.llenarTabla(datos_asignacion[i]);
          }
        });
      } else if (tipoDoc == 'REM') {
        this.dtAsgTinta.srvObtenerConsultaMov3(ot).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].estado == 'Remisión'
            && datos_asignacion[i].ASIGTINTAS_FechaEntrega.replace('T00:00:00', '') == fechaIncial
            && datos_asignacion[i].matPri_Id == tintaConsulta) this.llenarTabla(datos_asignacion[i]);
          }
        });
      }
    } else if (ot != null && fechaIncial != null && fechaFinal != null && estado != null) {
      this.dtAsgTinta.srvObtenerConsultaMov6(ot, fechaIncial, fechaFinal).subscribe(datos_asignacion => {
        for (let i = 0; i < datos_asignacion.length; i++) {
          if (datos_asignacion[i].estado_OrdenTrabajo == estado) this.llenarTabla(datos_asignacion[i]);
        }
      });
    } else if (ot != null && fechaIncial != null && fechaFinal != null && tintaConsulta != null) {
      this.dtAsgTinta.srvObtenerConsultaMov6(ot, fechaIncial, fechaFinal).subscribe(datos_asignacion => {
        for (let i = 0; i < datos_asignacion.length; i++) {
          if (datos_asignacion[i].tinta_Id == tintaConsulta) this.llenarTabla(datos_asignacion[i]);
        }
      });
    } else if (ot != null && tipoDoc != null && fechaIncial != null && fechaFinal != null) {
      if (tipoDoc == 'ASIGTINTAS') {
        this.dtAsgTinta.srvObtenerConsultaMov6(ot, fechaIncial, fechaFinal).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].estado != 'Creación Tintas') this.llenarTabla(datos_asignacion[i]);
          }
        });
      } else if (tipoDoc == 'CRTINTAS') {
        this.dtAsgTinta.srvObtenerConsultaMov6(ot, fechaIncial, fechaFinal).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].estado == 'Creación Tintas') this.llenarTabla(datos_asignacion[i]);
          }
        });
      } else if (tipoDoc == 'FCO') {
        this.dtAsgTinta.srvObtenerConsultaMov6(ot, fechaIncial, fechaFinal).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].estado == 'Factura de Compra') this.llenarTabla(datos_asignacion[i]);
          }
        });
      } else if (tipoDoc == 'REM') {
        this.dtAsgTinta.srvObtenerConsultaMov6(ot, fechaIncial, fechaFinal).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].estado == 'Remisión') this.llenarTabla(datos_asignacion[i]);
          }
        });
      }
    } else if (fechaIncial != null && fechaFinal != null && estado != null) {
      this.dtAsgTinta.srvObtenerConsultaMov7(fechaIncial, fechaFinal, estado).subscribe(datos_asignacion => {
        for (let i = 0; i < datos_asignacion.length; i++) {
          this.llenarTabla(datos_asignacion[i]);
        }
      });
    } else if (fechaIncial != null && fechaFinal != null && tintaConsulta != null) {
      this.dtAsgTinta.srvObtenerConsultaMov8(fechaIncial, fechaFinal, tintaConsulta).subscribe(datos_asignacion => {
        for (let i = 0; i < datos_asignacion.length; i++) {
          this.llenarTabla(datos_asignacion[i]);
        }
      });
    } else if (tipoDoc != null && fechaIncial != null && estado != null) {
      if (tipoDoc == 'ASIGTINTAS') {
        this.dtAsgTinta.srvObtenerConsultaMov0(fechaIncial).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].estado_OrdenTrabajo == estado) this.llenarTabla(datos_asignacion[i]);
          }
        });
      }
    } else if (tipoDoc != null && fechaIncial != null && tintaConsulta != null) {
      if (tipoDoc == 'ASIGTINTAS') {
        this.dtAsgTinta.srvObtenerConsultaMov0(fechaIncial).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].estado != 'Creación Tintas' && datos_asignacion[i].tinta == tintaConsulta) this.llenarTabla(datos_asignacion[i]);
          }
        });
      } else if (tipoDoc == 'CRTINTAS') {
        this.dtAsgTinta.srvObtenerConsultaMov0(fechaIncial).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].estado == 'Creación Tintas' && datos_asignacion[i].tinta == tintaConsulta) this.llenarTabla(datos_asignacion[i]);
          }
        });
      } else if (tipoDoc == 'FCO') {
        this.dtAsgTinta.srvObtenerConsultaMov4(fechaIncial, fechaFinal).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].estado == 'Factura' && datos_asignacion[i].tinta == tintaConsulta) this.llenarTabla(datos_asignacion[i]);
          }
        });
      } else if (tipoDoc == 'REM') {
        this.dtAsgTinta.srvObtenerConsultaMov4(fechaIncial, fechaFinal).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].estado == 'Remisión' && datos_asignacion[i].tinta == tintaConsulta) this.llenarTabla(datos_asignacion[i]);
          }
        });
      }
    } else if (tipoDoc != null && fechaIncial != null && fechaFinal != null) {
      if (tipoDoc == 'ASIGTINTAS') {
        this.dtAsgTinta.srvObtenerConsultaMov4(fechaIncial, fechaFinal).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].estado != 'Creación Tintas') this.llenarTabla(datos_asignacion[i]);
          }
        });
      } else if (tipoDoc == 'CRTINTAS') {
        this.dtAsgTinta.srvObtenerConsultaMov4(fechaIncial, fechaFinal).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].estado == 'Creación Tintas') this.llenarTabla(datos_asignacion[i]);
          }
        });
      } else if (tipoDoc == 'FCO') {
        this.dtAsgTinta.srvObtenerConsultaMov4(fechaIncial, fechaFinal).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].estado == 'Factura de Compra') this.llenarTabla(datos_asignacion[i]);
          }
        });
      } else if (tipoDoc == 'REM') {
        this.dtAsgTinta.srvObtenerConsultaMov4(fechaIncial, fechaFinal).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].estado == 'Remisión') this.llenarTabla(datos_asignacion[i]);
          }
        });
      }
    } else if (ot != null && tintaConsulta != null && estado != null) {
      // Asignación de materia prima
      this.dtAsgTinta.srvObtenerConsultaMov3(ot).subscribe(datos_asignacion => {
        for (let i = 0; i < datos_asignacion.length; i++) {
          if (datos_asignacion[i].tinta_Id == tintaConsulta && datos_asignacion[i].estado_OrdenTrabajo == estado) this.llenarTabla(datos_asignacion[i]);
        }
      });
    } else if (ot != null && fechaIncial != null && estado != null) {
      // Asignación de materia prima
      this.dtAsgTinta.srvObtenerConsultaMov3(ot).subscribe(datos_asignacion => {
        for (let i = 0; i < datos_asignacion.length; i++) {
          if (datos_asignacion[i].ASIGTINTAS_FechaEntrega.replace('T00:00:00','') == fechaIncial && datos_asignacion[i].estado_OrdenTrabajo == estado) this.llenarTabla(datos_asignacion[i]);
        }
      });
    } else if (ot != null && fechaIncial != null && tintaConsulta != null) {
      // Asignación de materia prima
      this.dtAsgTinta.srvObtenerConsultaMov3(ot).subscribe(datos_asignacion => {
        for (let i = 0; i < datos_asignacion.length; i++) {
          if (datos_asignacion[i].ASIGTINTAS_FechaEntrega.replace('T00:00:00','') == fechaIncial && datos_asignacion[i].tinta_Id == tintaConsulta) this.llenarTabla(datos_asignacion[i]);
        }
      });
    } else if (ot != null && fechaIncial != null && fechaFinal != null) {
      // Asignación de materia prima
      this.dtAsgTinta.srvObtenerConsultaMov6(ot, fechaIncial, fechaFinal).subscribe(datos_asignacion => {
        for (let i = 0; i < datos_asignacion.length; i++) {
          this.llenarTabla(datos_asignacion[i]);
        }
      });
    } else if (ot != null && tipoDoc != null && estado != null) {
      if (tipoDoc == 'ASIGTINTAS') {
        this.dtAsgTinta.srvObtenerConsultaMov3(ot).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].estado_OrdenTrabajo == estado) this.llenarTabla(datos_asignacion[i]);
          }
        });
      }
    } else if (ot != null && tipoDoc != null && tintaConsulta != null) {
      if (tipoDoc == 'ASIGTINTAS') {
        this.dtAsgTinta.srvObtenerConsultaMov3(ot).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].estado != 'Creación Tintas' && datos_asignacion[i].tinta == tintaConsulta) this.llenarTabla(datos_asignacion[i]);
          }
        });
      } else if (tipoDoc == 'CRTINTAS') {
        this.dtAsgTinta.srvObtenerConsultaMov3(ot).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].estado == 'Creación Tintas' && datos_asignacion[i].tinta == tintaConsulta) this.llenarTabla(datos_asignacion[i]);
          }
        });
      } else if (tipoDoc == 'FCO') {
        this.dtAsgTinta.srvObtenerConsultaMov3(ot).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].estado == 'Factura de Compra' && tintaConsulta == datos_asignacion[i].tinta) this.llenarTabla(datos_asignacion[i]);
          }
        });
      } else if (tipoDoc == 'REM') {
        this.dtAsgTinta.srvObtenerConsultaMov3(ot).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].estado == 'Remisión' && tintaConsulta == datos_asignacion[i].tinta) this.llenarTabla(datos_asignacion[i]);
          }
        });
      }
    } else if (ot != null && tipoDoc != null && fechaIncial != null) {
      if (tipoDoc == 'ASIGTINTAS') {
        this.dtAsgTinta.srvObtenerConsultaMov3(ot).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].estado != 'Creación Tintas' && datos_asignacion[i].ASIGTINTAS_FechaEntrega.replace('T00:00:00', '') == fechaIncial) this.llenarTabla(datos_asignacion[i]);
          }
        });
      } else if (tipoDoc == 'CRTINTAS') {
        this.dtAsgTinta.srvObtenerConsultaMov3(ot).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].estado == 'Creación Tintas' && datos_asignacion[i].ASIGTINTAS_FechaEntrega.replace('T00:00:00', '') == fechaIncial) this.llenarTabla(datos_asignacion[i]);
          }
        });
      } else if (tipoDoc == 'FCO') {
        this.dtAsgTinta.srvObtenerConsultaMov3(ot).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].estado == 'Factura de Compra' && datos_asignacion[i].ASIGTINTAS_FechaEntrega.replace('T00:00:00', '') == fechaIncial) this.llenarTabla(datos_asignacion[i]);
          }
        });
      } else if (tipoDoc == 'REM') {
        this.dtAsgTinta.srvObtenerConsultaMov3(ot).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].estado == 'Remisión' && datos_asignacion[i].ASIGTINTAS_FechaEntrega.replace('T00:00:00', '') == fechaIncial) this.llenarTabla(datos_asignacion[i]);
          }
        });
      }
    } else if (fechaIncial != null && tintaConsulta != null) {
      this.dtAsgTinta.srvObtenerConsultaMov2(fechaIncial, tintaConsulta).subscribe(datos_asignacion => {
        for (let i = 0; i < datos_asignacion.length; i++) {
          this.llenarTabla(datos_asignacion[i]);
        }
      });
    } else if (fechaIncial != null && fechaFinal != null) {
      this.dtAsgTinta.srvObtenerConsultaMov4(fechaIncial, fechaFinal).subscribe(datos_asignacion => {
        for (let i = 0; i < datos_asignacion.length; i++) {
          this.llenarTabla(datos_asignacion[i]);
        }
      });
    } else if (tipoDoc != null && tintaConsulta != null) {
      if (tipoDoc == 'ASIGTINTAS') {
        this.dtAsgTinta.srvObtenerConsultaMov2(this.today, tintaConsulta).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].estado != 'Creación Tintas') this.llenarTabla(datos_asignacion[i]);
          }
        });
      } else if (tipoDoc == 'CRTINTAS') {
        this.dtAsgTinta.srvObtenerConsultaMov2(this.today, tintaConsulta).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].estado == 'Creación Tintas') this.llenarTabla(datos_asignacion[i]);
          }
        });
      } else if (tipoDoc == 'FCO') {
        this.dtAsgTinta.srvObtenerConsultaMov2(this.today, tintaConsulta).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].estado == 'Factura de Compra') this.llenarTabla(datos_asignacion[i]);
          }
        });
      } else if (tipoDoc == 'REM') {
        this.dtAsgTinta.srvObtenerConsultaMov2(this.today, tintaConsulta).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].estado == 'Remisión') this.llenarTabla(datos_asignacion[i]);
          }
        });
      }
    } else if (tipoDoc != null && fechaIncial != null) {
      if (tipoDoc == 'ASIGTINTAS') {
        this.dtAsgTinta.srvObtenerConsultaMov0(fechaIncial).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].estado != 'Creación Tintas') this.llenarTabla(datos_asignacion[i]);
          }
        });
      } else if (tipoDoc == 'CRTINTAS') {
        this.dtAsgTinta.srvObtenerConsultaMov0(fechaIncial).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].estado == 'Creación Tintas') this.llenarTabla(datos_asignacion[i]);
          }
        });
      } else if (tipoDoc == 'FCO') {
        this.dtAsgTinta.srvObtenerConsultaMov0(fechaIncial).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].estado == 'Factura de Compra') this.llenarTabla(datos_asignacion[i]);
          }
        });
      } else if (tipoDoc == 'REM') {
        this.dtAsgTinta.srvObtenerConsultaMov0(fechaIncial).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].estado == 'Remisión') this.llenarTabla(datos_asignacion[i]);
          }
        });
      }
    } else if (ot != null && estado != null) {
      this.dtAsgTinta.srvObtenerConsultaMov3(ot).subscribe(datos_asignacion => {
        for (let i = 0; i < datos_asignacion.length; i++) {
          if (datos_asignacion[i].estado_OrdenTrabajo == estado) this.llenarTabla(datos_asignacion[i]);
        }
      });
    } else if (ot != null && tintaConsulta != null) {
      this.dtAsgTinta.srvObtenerConsultaMov3(ot).subscribe(datos_asignacion => {
        for (let i = 0; i < datos_asignacion.length; i++) {
          if (datos_asignacion[i].tinta_Id == tintaConsulta) this.llenarTabla(datos_asignacion[i]);
        }
      });
    } else if (ot != null && fechaIncial != null) {
      this.dtAsgTinta.srvObtenerConsultaMov3(ot).subscribe(datos_asignacion => {
        for (let i = 0; i < datos_asignacion.length; i++) {
          if (datos_asignacion[i].ASIGTINTAS_FechaEntrega.replace('T00:00:00','') == fechaIncial) this.llenarTabla(datos_asignacion[i]);
        }
      });
    } else if (ot != null && tipoDoc != null) {
      if (tipoDoc == 'ASIGTINTAS') {
        this.dtAsgTinta.srvObtenerConsultaMov3(ot).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].estado != 'Creación Tintas') this.llenarTabla(datos_asignacion[i]);
          }
        });
      } else if (tipoDoc == 'CRTINTAS') {
        this.dtAsgTinta.srvObtenerConsultaMov3(ot).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].estado == 'Creación Tintas') this.llenarTabla(datos_asignacion[i]);
          }
        });
      } else if (tipoDoc == 'FCO') {
        this.dtAsgTinta.srvObtenerConsultaMov3(ot).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].estado == 'Factura de Compra') this.llenarTabla(datos_asignacion[i]);
          }
        });
      } else if (tipoDoc == 'REM') {
        this.dtAsgTinta.srvObtenerConsultaMov3(ot).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].estado == 'Remisión') this.llenarTabla(datos_asignacion[i]);
          }
        });
      }
    } else if (ot != null) {
      this.dtAsgTinta.srvObtenerConsultaMov3(ot).subscribe(datos_asignacion => {
        for (let i = 0; i < datos_asignacion.length; i++) {
          this.llenarTabla(datos_asignacion[i]);
        }
      });
    } else if (tipoDoc != null) {
      if (tipoDoc == 'ASIGTINTAS') {
        this.dtAsgTinta.srvObtenerConsultaMov0(this.today).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].estado != 'Creación Tintas') this.llenarTabla(datos_asignacion[i]);
          }
        });
      } else if (tipoDoc == 'CRTINTAS') {
        this.dtAsgTinta.srvObtenerConsultaMov0(this.today).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].estado == 'Creación Tintas') this.llenarTabla(datos_asignacion[i]);
          }
        });
      } else if (tipoDoc == 'FCO') {
        this.dtAsgTinta.srvObtenerConsultaMov0(this.today).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].estado == 'Factura de Compra') this.llenarTabla(datos_asignacion[i]);
          }
        });
      } else if (tipoDoc == 'REM') {
        this.dtAsgTinta.srvObtenerConsultaMov0(this.today).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].estado == 'Remisión') this.llenarTabla(datos_asignacion[i]);
          }
        });
      }
    } else if (fechaIncial != null) {
      // Asignación de materia prima
      this.dtAsgTinta.srvObtenerConsultaMov0(fechaIncial).subscribe(datos_asignacion => {
        for (let i = 0; i < datos_asignacion.length; i++) {
          this.llenarTabla(datos_asignacion[i]);
        }
      });
    } else if (tintaConsulta != null) {
      this.dtAsgTinta.srvObtenerConsultaMov2(this.today, tintaConsulta).subscribe(datos_asignacion => {
        for (let i = 0; i < datos_asignacion.length; i++) {
          this.llenarTabla(datos_asignacion[i]);
        }
      });
    } else if (estado != null) {
      // Asignacion de materia prima
      this.dtAsgTinta.srvObtenerConsultaMov1(estado).subscribe(datos_asignacion => {
        for (let i = 0; i < datos_asignacion.length; i++) {
          this.llenarTabla(datos_asignacion[i]);
        }
      });
    } else {
      // Asignación de materia prima
      this.dtAsgTinta.srvObtenerConsultaMov0(this.today).subscribe(datos_asignacion => {
        for (let i = 0; i < datos_asignacion.length; i++) {
          this.llenarTabla(datos_asignacion[i]);
        }
      });
    }
    setTimeout(() => { this.load = true; }, 3000);
  }

  // Funcion para llenar la tabla con la informcion consultada
  llenarTabla(datos : any){
    if (datos.estado != 'Creación Tintas' && datos.estado != 'Remisión' && datos.estado != 'Factura de Compra') {
      let info : any = {
        ot : datos.ot,
        tipoId : 'ASIGTINTAS',
        tipo : 'Asignación de Tintas',
        fecha : datos.fecha,
        usuario : datos.usuario_Nombre,
        matPrima : datos.nombreTinta,
        cant : datos.cantidad,
        estado : datos.estado,
      }
      this.ArrayInfoConsulta.push(info);
    } else if (datos.estado == 'Creación Tintas'){
      if (datos.materiaPrima == 84 && datos.tinta2 != 2001){
        let info : any = {
          Id : datos.id,
          ot : `${datos.ot} - ${datos.nombreTinta}`,
          tipoId : 'TINTAS',
          tipo : 'Creación de Tintas',
          fecha : datos.fecha,
          usuario : datos.usuario_Nombre,
          matPrima : datos.nombre_Tinta2,
          cant : datos.cantidadAsignada,
          estado : '',
        }
        this.ArrayInfoConsulta.push(info);
      } else if (datos.materiaPrima != 84 && datos.tinta2 == 2001){
        let info : any = {
          Id : datos.id,
          ot : `${datos.ot} - ${datos.nombreTinta}`,
          tipoId : 'TINTAS',
          tipo : 'Creación de Tintas',
          fecha : datos.fecha,
          usuario : datos.usuario_Nombre,
          matPrima : datos.nombre_MateriaPrima,
          cant : datos.cantidadAsignada,
          estado : '',
        }
        this.ArrayInfoConsulta.push(info);
      }
    } else if (datos.estado == 'Remisión') {
      if (datos.tinta != 2001){
        let info : any = {
          ot : `${datos.ot}`,
          tipoId : 'REM',
          tipo : 'Remisión de Tintas',
          fecha : datos.fecha,
          usuario : datos.usuario_Nombre,
          matPrima : datos.nombre_Tinta2,
          cant : datos.cantidadAsignada,
          estado : '',
        }
        this.ArrayInfoConsulta.push(info);
      }
    } else if (datos.estado == 'Factura de Compra') {
      if (datos.tinta != 2001){
        let info : any = {
          ot : `${datos.ot}`,
          tipoId : 'FCO',
          tipo : 'Factura de Compra',
          fecha : datos.fecha,
          usuario : datos.usuario_Nombre,
          matPrima : datos.nombre_Tinta2,
          cant : datos.cantidadAsignada,
          estado : '',
        }
        this.ArrayInfoConsulta.push(info);
      }
    }
    this.ArrayInfoConsulta.sort((a,b) => Number(a.ot) - Number(b.ot));
    this.ArrayInfoConsulta.sort((a,b) => b.fecha.localeCompare(a.fecha));
  }

  // Funcion que almacenará en una variable todas las tintas del movimiento al que se le hizo la consulta
  articulosPdf(data : any){
    this.ArrayMpPDF = [];
    this.load = false;
    if (data.tipoId == 'ASIGTINTAS') {
      this.dtAsgTinta.srvObtenerTintasAsignadasxOT(data.ot).subscribe(datos_asignacion => {
        for (let i = 0; i < datos_asignacion.length; i++) {
          let items : any = {
            Id : datos_asignacion[i].tinta_Id,
            Nombre : datos_asignacion[i].tinta_Nombre,
            Cant : this.formatonumeros(datos_asignacion[i].sum),
            "Und Cant" : datos_asignacion[i].undMed_Id,
          }
          this.ArrayMpPDF.push(items);
        }
        setTimeout(() => { this.verPDF(data); }, 2000);
      });
    } else if (data.tipoId == 'FCO') {
      this.dtFacturaMP.srvObtenerpdfMovimientos(data.ot).subscribe(datos_factura => {
        for (let i = 0; i < datos_factura.length; i++) {
          let items : any = {
            Id : datos_factura[i].matPri_Id,
            Nombre : datos_factura[i].matPri_Nombre,
            Cant : this.formatonumeros(datos_factura[i].faccoMatPri_Cantidad),
            "Und Cant" : datos_factura[i].undMed_Id,
            "Precio Und" : this.formatonumeros(datos_factura[i].faccoMatPri_ValorUnitario),
            SubTotal : this.formatonumeros(datos_factura[i].faccoMatPri_Cantidad * datos_factura[i].faccoMatPri_ValorUnitario),
          }
          this.ArrayMpPDF.push(items);
        }
        setTimeout(() => { this.verPDF(data); }, 2000);
      });
    } else if (data.tipoId == 'REM') {
      this.dtRemision.srvObtenerpdfMovimientos(data.ot).subscribe(datos_remision => {
        for (let i = 0; i < datos_remision.length; i++) {
          let items : any = {
            Id : datos_remision[i].matPri_Id,
            Nombre : datos_remision[i].matPri_Nombre,
            Cant : this.formatonumeros(datos_remision[i].remiMatPri_Cantidad),
            "Und Cant" : datos_remision[i].undMed_Id,
            "Precio Und" : this.formatonumeros(datos_remision[i].remiMatPri_ValorUnitario),
            SubTotal : this.formatonumeros((datos_remision[i].remiMatPri_Cantidad * datos_remision[i].remiMatPri_ValorUnitario).toFixed(2)),
          }
          this.ArrayMpPDF.push(items);
        }
        setTimeout(() => { this.verPDF(data); }, 2000);
      });
    } else if (data.tipoId == 'TINTAS') {
      this.dtCreacionTinta.getCreatPdf(data.Id).subscribe(datos_creacion => {
        for (let i = 0; i < datos_creacion.length; i++) {
          if (datos_creacion[i].matPri_Id != 84 && datos_creacion[i].tinta_Id == 2001){
            let info : any = {
              Id : datos_creacion[i].matPri_Id,
              Nombre : datos_creacion[i].matPri_Nombre,
              Cantidad : datos_creacion[i].detAsigMPxTinta_Cantidad,
              Presentacion : datos_creacion[i].undMed_Id,
            }
            this.ArrayMpPDF.push(info);
            this.ArrayMpPDF.sort((a,b) => a.Nombre.localeCompare(b.Nombre));
          } else if (datos_creacion[i].matPri_Id == 84 && datos_creacion[i].tinta_Id != 2001){
            console.log(1)
            let info : any = {
              Id : datos_creacion[i].tinta_Id,
              Nombre : datos_creacion[i].tinta_Nombre,
              Cantidad : datos_creacion[i].detAsigMPxTinta_Cantidad,
              Presentacion : datos_creacion[i].undMed_Id,
            }
            this.ArrayMpPDF.push(info);
            this.ArrayMpPDF.sort((a,b) => a.Nombre.localeCompare(b.Nombre));
          }
        }
      });
      setTimeout(() => { this.verPDF(data); }, 2000);
    }
  }

  // Funcion que permitirá ver la informacion del documento en un formato PDF
  verPDF(data : any){
    let nombre : string = this.storage.get('Nombre');
    if (data.tipoId == 'ASIGTINTAS') {
      this.dtAsgTinta.srvObtenerpdfMovimientos(data.ot).subscribe(datos_asignacion => {
        for (let i = 0; i < datos_asignacion.length; i++) {
          for (let j = 0; j < this.ArrayMpPDF.length; j++) {
            const pdfDefinicion : any = {
              info: {
                title: `${datos_asignacion[i].ASIGTINTAS_Id}`
              },
              footer: function(currentPage : any, pageCount : any) {
                return [
                  {
                    columns: [
                      { text: `Reporte generado por ${nombre}`, alignment: ' left', fontSize: 8, margin: [30, 0, 0, 0] },
                      { text: `Fecha Expedición Documento ${moment().format('YYYY-MM-DD')} - ${moment().format('H:mm:ss')}`, alignment: 'right', fontSize: 8 },
                      { text: `${currentPage.toString() + ' de ' + pageCount}`, alignment: 'right', fontSize: 8, margin: [0, 0, 30, 0] },
                    ]
                  }
                ]
              },
              content : [
                {
                  columns: [
                    {
                      image : logoParaPdf,
                      width : 220,
                      height : 50
                    },
                    {
                      text: `Plasticaribe S.A.S ---- Asignación de Tintas`,
                      alignment: 'center',
                      style: 'titulo',
                      margin: 30
                    }
                  ]
                },
                '\n \n',
                {
                  text: `Fecha de registro: ${datos_asignacion[i].ASIGTINTAS_FechaEntrega.replace('T00:00:00', '')}`,
                  style: 'header',
                  alignment: 'right',
                },
                {
                  text: `Registrado Por: ${datos_asignacion[i].usua_Nombre}\n`,
                  alignment: 'right',
                  style: 'header',
                },
                {
                  text: `\n Información la Asignación \n \n`,
                  alignment: 'center',
                  style: 'header',
                  fontSize: 12,
                },
                {
                  style: 'tablaCliente',
                  table: {
                    widths: ['*', '*', '*'],
                    style: 'header',
                    body: [
                      [
                        `OT: ${datos_asignacion[i].ASIGTINTAS_OrdenTrabajo}`,
                        `Maquina: ${datos_asignacion[i].ASIGTINTAS_Maquina}`,
                        `Proceso: ${datos_asignacion[i].proceso_Nombre}`
                      ]
                    ]
                  },
                  layout: 'lightHorizontalLines',
                  fontSize: 12,
                },
                {
                  text: `\n \nObservación: \n ${datos_asignacion[i].ASIGTINTAS_Observacion}\n`,
                  style: 'header',
                },
                {
                  text: `\n Información detallada de tinta(s) asignada(s) \n `,
                  alignment: 'center',
                  style: 'header',
                  fontSize: 12,
                },

                this.tableAsignacion(this.ArrayMpPDF, ['Id', 'Nombre', 'Cant', 'Und Cant']),
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
            break;
          }
          break;
        }
      });
    } else if (data.tipoId == 'FCO') {
      this.dtFacturaMP.srvObtenerpdfMovimientos(data.ot).subscribe(datos_factura => {
        for (let i = 0; i < datos_factura.length; i++) {
          for (let mp = 0; mp < this.ArrayMpPDF.length; mp++) {
            const pdfDefinicion : any = {
              info: {
                title: `${data.ot}`
              },
              footer: function(currentPage : any, pageCount : any) {
                return [
                  {
                    columns: [
                      { text: `Reporte generado por ${nombre}`, alignment: ' left', fontSize: 8, margin: [30, 0, 0, 0] },
                      { text: `Fecha Expedición Documento ${moment().format('YYYY-MM-DD')} - ${moment().format('H:mm:ss')}`, alignment: 'right', fontSize: 8 },
                      { text: `${currentPage.toString() + ' de ' + pageCount}`, alignment: 'right', fontSize: 8, margin: [0, 0, 30, 0] },
                    ]
                  }
                ]
              },
              content : [
                {
                  columns: [
                    {
                      image : logoParaPdf,
                      width : 220,
                      height : 50
                    },
                    {
                      text: `Plasticaribe S.A.S ---- Factura de Compra de Materia Prima`,
                      alignment: 'center',
                      style: 'titulo',
                      margin: 30
                    }
                  ]
                },
                '\n \n',
                {
                  text: `Fecha de registro: ${datos_factura[i].facco_FechaFactura.replace('T00:00:00', '')}`,
                  style: 'header',
                  alignment: 'right',
                },
                {
                  text: `Registrado Por: ${datos_factura[i].usua_Nombre}\n`,
                  alignment: 'right',
                  style: 'header',
                },
                {
                  text: `\n Información detallada del Proveedor \n \n`,
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
                        `ID: ${datos_factura[i].prov_Id}`,
                        `Tipo de ID: ${datos_factura[i].tipoIdentificacion_Id}`,
                        `Tipo de Proveedor: ${datos_factura[i].tpProv_Nombre}`
                      ],
                      [
                        `Nombre: ${datos_factura[i].prov_Nombre}`,
                        `Telefono: ${datos_factura[i].prov_Telefono}`,
                        `Ciudad: ${datos_factura[i].prov_Ciudad}`
                      ],
                      [
                        `E-mail: ${datos_factura[i].prov_Email}`,
                        ``,
                        ``
                      ]
                    ]
                  },
                  layout: 'lightHorizontalLines',
                  fontSize: 9,
                },
                {
                  text: `\n \nObervación sobre la factura: \n ${datos_factura[i].facco_Observacion}\n`,
                  style: 'header',
                },
                {
                  text: `\n Información detallada de Materia(s) Prima(s) comprada(s) \n `,
                  alignment: 'center',
                  style: 'header'
                },

                this.table(this.ArrayMpPDF, ['Id', 'Nombre', 'Cant', 'Und Cant', 'Precio Und', 'SubTotal']),

                {
                  text: `\n\nValor Total Factura: $${this.formatonumeros(datos_factura[i].facco_ValorTotal)}`,
                  alignment: 'right',
                  style: 'header',
                }
              ],
              styles: {
                header: {
                  fontSize: 8,
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
            break;
          }
          break;
        }
      });
    } else if (data.tipoId == 'REM') {
      this.dtRemision.srvObtenerpdfMovimientos(data.ot).subscribe(datos_remision => {
        for (let i = 0; i < datos_remision.length; i++) {
          for (let j = 0; j < this.ArrayMpPDF.length; j++) {
            const pdfDefinicion : any = {
              info: {
                title: `${data.ot}`
              },
              footer: function(currentPage : any, pageCount : any) {
                return [
                  {
                    columns: [
                      { text: `Reporte generado por ${nombre}`, alignment: ' left', fontSize: 8, margin: [30, 0, 0, 0] },
                      { text: `Fecha Expedición Documento ${moment().format('YYYY-MM-DD')} - ${moment().format('H:mm:ss')}`, alignment: 'right', fontSize: 8 },
                      { text: `${currentPage.toString() + ' de ' + pageCount}`, alignment: 'right', fontSize: 8, margin: [0, 0, 30, 0] },
                    ]
                  }
                ]
              },
              content : [
                {
                  columns: [
                    {
                      image : logoParaPdf,
                      width : 220,
                      height : 50
                    },
                    {
                      text: `Plasticaribe S.A.S ---- Remisión de Compra de Materia Prima`,
                      alignment: 'center',
                      style: 'titulo',
                      margin: 30
                    }
                  ]
                },
                '\n \n',
                {
                  text: `Fecha de registro: ${datos_remision[i].rem_Fecha.replace('T00:00:00', '')}`,
                  style: 'header',
                  alignment: 'right',
                },
                {
                  text: `Registrado Por: ${datos_remision[i].usua_Nombre}\n`,
                  alignment: 'right',
                  style: 'header',
                },
                {
                  text: `\n Información detallada del Proveedor \n \n`,
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
                        `ID: ${datos_remision[i].prov_Id}`,
                        `Tipo de ID: ${datos_remision[i].tipoIdentificacion_Id}`,
                        `Tipo de Proveedor: ${datos_remision[i].tpProv_Nombre}`
                      ],
                      [
                        `Nombre: ${datos_remision[i].prov_Nombre}`,
                        `Telefono: ${datos_remision[i].prov_Telefono}`,
                        `Ciudad: ${datos_remision[i].prov_Ciudad}`
                      ],
                      [
                        `E-mail: ${datos_remision[i].prov_Email}`,
                        ``,
                        ``
                      ]
                    ]
                  },
                  layout: 'lightHorizontalLines',
                  fontSize: 9,
                },
                {
                  text: `\n \nObervación sobre la remisión: \n ${datos_remision[i].rem_Observacion}\n`,
                  style: 'header',
                },
                {
                  text: `\n Información detallada de Materia(s) Prima(s) comprada(s) \n `,
                  alignment: 'center',
                  style: 'header'
                },

                this.table(this.ArrayMpPDF, ['Id', 'Nombre', 'Cant', 'Und Cant', 'Precio Und', 'SubTotal']),
              ],
              styles: {
                header: {
                  fontSize: 8,
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
            break;
          }
          break;
        }
      });
    } else if (data.tipoId == 'TINTAS') {
      this.dtCreacionTinta.getCreatPdf(data.Id).subscribe(datos_creacion => {
        for (let i = 0; i < datos_creacion.length; i++) {
          const pdfDefinicion : any = {
            info: {
              title: `${data.ot}`
            },
            footer: function(currentPage : any, pageCount : any) {
              return [
                {
                  columns: [
                    { text: `Reporte generado por ${nombre}`, alignment: ' left', fontSize: 8, margin: [30, 0, 0, 0] },
                    { text: `Fecha Expedición Documento ${moment().format('YYYY-MM-DD')} - ${moment().format('H:mm:ss')}`, alignment: 'right', fontSize: 8 },
                    { text: `${currentPage.toString() + ' de ' + pageCount}`, alignment: 'right', fontSize: 8, margin: [0, 0, 30, 0] },
                  ]
                }
              ]
            },
            content : [
              {
                columns: [
                  {
                    image : logoParaPdf,
                    width : 220,
                    height : 50
                  },
                  {
                    text: `Plasticaribe S.A.S ---- Creación de Tinta`,
                    alignment: 'center',
                    style: 'titulo',
                    margin: 30
                  }
                ]
              },
              '\n \n',
              {
                text: `Fecha de registro: ${datos_creacion[i].asigMPxTinta_FechaEntrega.replace('T00:00:00', '')}`,
                style: 'header',
                alignment: 'right',
              },
              {
                text: `Registrado Por: ${datos_creacion[i].usua_Nombre}\n`,
                alignment: 'right',
                style: 'header',
              },
              {
                text: `\n \nObervación sobre la remisión: \n ${datos_creacion[i].asigMPxTinta_Observacion}\n`,
                style: 'header',
              },
              {
                text: `\n Información detallada de la Tinta Creada \n `,
                alignment: 'center',
                style: 'header'
              },
              {
                text: `\n La tinta creada fue: \n `,
                alignment: 'left',
                style: 'header'
              },
              {
                text: `ID: ${datos_creacion[i].tinta_Creada} \n Nombre: ${datos_creacion[i].nombre_TintaCreada} \n Cantidad: ${datos_creacion[i].cantidad_Creada} Kg \n `,
                alignment: 'left',
                style: 'tintaCreada'
              },
              this.tableCreacion(this.ArrayMpPDF, ['Id', 'Nombre', 'Cantidad', 'Presentacion']),
            ],
            styles: {
              header: {
                fontSize: 10,
                bold: true
              },
              titulo: {
                fontSize: 15,
                bold: true
              },
              tintaCreada: {
                fontSize: 9
              }
            }
          }
          const pdf = pdfMake.createPdf(pdfDefinicion);
          pdf.open();
          break;
        }
      });
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
  table(data, columns) {
    return {
      table: {
        headerRows: 1,
        widths: [30, '*', 70, 50, 50, 80],
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

  // Funcion que genera la tabla donde se mostrará la información de los productos pedidos
  tableCreacion(data, columns) {
    return {
      table: {
        headerRows: 1,
        widths: [100, 220, 100, 60],
        body: this.buildTableBody(data, columns),
      },
      fontSize: 8,
      layout: {
        fillColor: function (rowIndex, node, columnIndex) {
          return (rowIndex == 0) ? '#CCCCCC' : null;
        }
      }
    };
  }

  // Funcion que genera la tabla donde se mostrará la información de las tintas.
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

}
