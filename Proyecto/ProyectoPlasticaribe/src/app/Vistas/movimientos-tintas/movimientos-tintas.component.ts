import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import pdfMake from 'pdfmake/build/pdfmake';
import { BagproService } from 'src/app/Servicios/Bagpro.service';
import { DetallesAsignacionService } from 'src/app/Servicios/detallesAsignacion.service';
import { DetallesAsignacionTintasService } from 'src/app/Servicios/detallesAsignacionTintas.service';
import { DevolucionesMPService } from 'src/app/Servicios/devolucionesMP.service';
import { EstadosService } from 'src/app/Servicios/estados.service';
import { FacturaMpService } from 'src/app/Servicios/facturaMp.service';
import { MateriaPrimaService } from 'src/app/Servicios/materiaPrima.service';
import { RecuperadoMPService } from 'src/app/Servicios/recuperadoMP.service';
import { RemisionesMPService } from 'src/app/Servicios/remisionesMP.service';
import { RolesService } from 'src/app/Servicios/roles.service';
import { TintasService } from 'src/app/Servicios/tintas.service';
import { TipoDocumentoService } from 'src/app/Servicios/tipoDocumento.service';

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
  ArrayMateriaPrima : any [] = []; //Variable que tendrá la informacion de los productos que se piden para uan OT
  ArrayTintas : any [] = []; /*** Array que tendrá la informacion de las tintas cargadas en el combobox */
  keywordMp = 'tinta_Nombre'; //Variable que va a almacenar la propieda por la cual se va a filtrar la materia prima al momento de ser consultada por el campo de materia prima
  validarInputMp : any; //Variable que va a permitir si se ve el titulo del campo de materia prima o no
  load : boolean = true; //Variabel para permitir que se vea o no una imagen de carga
  today : any = new Date(); //Variable que se usará para llenar la fecha actual
  titulosTabla = []; //Variable que almacenará los titulos de la tabla de productos que se ve al final de la vista
  ArrayInfoConsulta : any [] = []; //Variable que tendrá la informacion de los resultados de la consulta realizada
  valorTotal : number = 0; //Variable que guardará el valor total de la factura de entrada de materia prima
  totalMPEntregada : any; //Vairble que almacenará la cantidad de materia prima entregada para una orden de trabajo
  cantRestante : number = 0; //Variable que tendrá la cantidad de kilos de materia prima que hacen falta por entregar pára una orden de trabajo
  kgProduciodosOT : number = 0; //Variable que almacenará la cantidad de kilos producidos por una orden de trabajo
  estadoOt : string = ''; //Variable que almacenará el estado de la orden de trabajo (Abierta, Asignada, En proceso, Terminada o Finalizada)
  cantidadTotalSella : number = 0; //Variable que va a almacenar el total de la cantidad sellada en una OT
  cantidadTotalEmpaque : number = 0; //Variable que va a almacenar el total de la cantidad empacada en una OT
  cantidadTotalWiketiado : number = 0; //Variable que va a almacenar el total de la cantidad cantidad Tota wiketeada en una OT
  cantidadTotalKgOT = 0; //Variable que almacenará la cantidad de kilos que pidió una orden de trabajo
  ArrayEstados : any = []; //Variable en la que se almacenaran los estados que puede tener una orden de trabajo
  kgOT : number = 0; //Variable que va a almacenar la cantidad total de kilos que se estipularon para una orden de trabajo
  ArrayMpPDF : any = [] //Variable que almacenará las materias primas del pdf que se esé consultando

  constructor(private rolService : RolesService,
                private frmBuilderMateriaPrima : FormBuilder,
                  @Inject(SESSION_STORAGE) private storage: WebStorageService,
                    private materiaPrimaService : MateriaPrimaService,
                      private tipoDocuemntoService : TipoDocumentoService,
                        private bagProServices : BagproService,
                          private estadoService : EstadosService,
                            private dtAsgMP : DetallesAsignacionService,
                              private dtDevMP : DevolucionesMPService,
                                private dtFacturaMP : FacturaMpService,
                                  private dtRemision : RemisionesMPService,
                                    private dtRecuperado : RecuperadoMPService,
                                      private servicioTintas : TintasService,
                                        private dtAsgTinta : DetallesAsignacionTintasService) {

    this.FormDocumentos = this.frmBuilderMateriaPrima.group({
      idDocumento : [null, Validators.required],
      TipoDocumento: [null, Validators.required],
      /***materiaPrima: ['', Validators.required],*/
      tintas: ['', Validators.required],
      fecha: [null, Validators.required],
      fechaFinal : [null, Validators.required],
      estado : [null, Validators.required],
    });
    this.validarInputMp = true;
  }

  ngOnInit() {
    this.lecturaStorage();
    this.ColumnasTabla();
    this.fecha();
    /***this.obtenerMateriasPrimas();*/
    this.obtenerTipoDocumento();
    this.obtenerEstados();
    this.obtenerTintas();

  }

  //
  selectEventMp(item) {
    this.FormDocumentos.value.tintas = item.tinta_Id;
    if (this.FormDocumentos.value.tintas != '') this.validarInputMp = false;
    else this.validarInputMp = true;
    // do something with selected item
  }

  //
  onChangeSearchMp(val: string) {
    if (val != '') this.validarInputMp = false;
    else this.validarInputMp = true;
    // fetch remote data from here
    // And reassign the 'data' which is binded to 'data' property.
  }

  //
  onFocusedMp(e){
    if (!e.isTrusted) this.validarInputMp = false;
    else this.validarInputMp = true;
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

  // Funcion que va a limpiar los campos
  LimpiarCampos() {
    this.FormDocumentos.setValue({
      idDocumento : null,
      TipoDocumento: null,
      tintas : '',
      fecha: null,
      fechaFinal: null,
      estado : null,
    });
    this.ArrayInfoConsulta = [];
    this.valorTotal = 0;
    this.totalMPEntregada = 0;
    this.cantRestante = 0;
    this.kgProduciodosOT = 0;
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

  //Funcion que colocará el nombre a las columnas de la tabla en la cual se muestran los productos pedidos por los clientes
  ColumnasTabla(){
    this.titulosTabla = [];
    this.titulosTabla = [{
      idFact : "OT / COD. DOCUMENTO",
      tipo : "Tipo de Movimiento",
      FechaFact : "Fecha Registro",
      usuario : "Registrado Por:",
      mp : "Materia Prima",
      cant : "Cantidad",
      estado : "Estado OT",
      Ver : "Ver",
    }]
  }

  // Funcion que va a cargar las materias primas
  obtenerMateriasPrimas(){
    this.materiaPrimaService.srvObtenerLista().subscribe(datos_materiasPrimas => {
      for (let i = 0; i < datos_materiasPrimas.length; i++) {
        this.ArrayMateriaPrima.push(datos_materiasPrimas[i]);
        this.ArrayMateriaPrima.sort((a,b) => a.matPri_Nombre.localeCompare(b.matPri_Nombre));
      }
    });
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
        || datos_tiposDocumentos[index].tpDoc_Id == 'CRTINTAS') this.tipoDocumento.push(datos_tiposDocumentos[index]);
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

  // Funcion que consultará en bagpro la ot para validar la cantidad de kg que se pidió por cada ot
  consultaOTBagPro(ot : any){
    this.sumarCantidadesMatPrima_Tintas(ot)
    this.bagProServices.srvObtenerListaClienteOT_Item(ot).subscribe(datos_ot => {
      for (let i = 0; i < datos_ot.length; i++) {
        this.kgOT = datos_ot[i].datosotKg;
      }
    });

    this.bagProServices.srvObtenerListaProcExtOt(ot).subscribe(datos_OT => {
      for (let index = 0; index < datos_OT.length; index++) {
        this.kgProduciodosOT += datos_OT[index].extnetokg;
      }
    });

    this.bagProServices.srvObtenerListaProcSelladoOT(ot).subscribe(datos_OT => {
      for (let index = 0; index < datos_OT.length; index++) {
        this.kgProduciodosOT += datos_OT[index].peso;
      }
    });
  }

  /** */
  sumarCantidadesMatPrima_Tintas(OT : number){
    this.dtAsgTinta.srvObtenerSumaCantidadesTintas_MatPrimas(OT).subscribe(registrosTintas_MatPrima => {
      this.totalMPEntregada = registrosTintas_MatPrima;

    })

  }

  // Funcion que va a consultar por cada combinacion de filtro que se le indiquen
  consultar(){
    this.load = false;
    this.kgOT = 0;
    this.totalMPEntregada = 0;
    this.ArrayInfoConsulta = [];
    this.kgProduciodosOT = 0;
    this.cantRestante = 0;
    this.estadoOt = '';
    let ot : number = this.FormDocumentos.value.idDocumento;
    let tipoDoc : string = this.FormDocumentos.value.TipoDocumento;
    let fechaIncial : any = this.FormDocumentos.value.fecha;
    let fechaFinal : any = this.FormDocumentos.value.fechaFinal;
    let materiaPrima : any;
    let tintaConsulta : any;

    if (this.FormDocumentos.value.tintas.tinta_Id == undefined) tintaConsulta = null;
    else tintaConsulta = this.FormDocumentos.value.tintas.tinta_Id;
    let estado : any = this.FormDocumentos.value.estado;

    if (ot != null && tipoDoc != null && fechaIncial != null && fechaFinal != null && tintaConsulta != null && estado != null) {
      if (tipoDoc == 'ASIGTINTAS') {
        this.consultaOTBagPro(ot);

        this.dtAsgTinta.srvObtenerConsultaMov10(ot, fechaIncial, fechaFinal, tintaConsulta, estado).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            setTimeout(() => {
              this.cantRestante = this.kgOT - this.totalMPEntregada;
              this.llenarTabla(datos_asignacion[i], tipoDoc);
            }, 1200);
          }
        });
      } else if (tipoDoc == 'CRTINTAS'){

      }

    } else if (tipoDoc != null && fechaIncial != null && fechaFinal != null && tintaConsulta != null && estado != null) {
      if (tipoDoc == 'ASIGTINTAS') {
        this.dtAsgTinta.srvObtenerConsultaMov4(fechaIncial, fechaFinal).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].estado_OrdenTrabajo == estado && datos_asignacion[i].tinta_Id == tintaConsulta) this.llenarTabla(datos_asignacion[i], 'ASIGTINTAS');
          }
        });
      } else if (tipoDoc == 'CRTINTAS'){

      }
    } else if (ot != null && tipoDoc != null && fechaIncial != null && tintaConsulta != null && estado != null) {
      if (tipoDoc == 'ASIGTINTAS') {
        this.dtAsgTinta.srvObtenerConsultaMov3(ot).subscribe(datos_asignacion => {
          this.consultaOTBagPro(ot);
          for (let i = 0; i < datos_asignacion.length; i++) {
            setTimeout(() => {
              this.cantRestante = this.kgOT - this.totalMPEntregada;
              if (datos_asignacion[i].ASIGTINTAS_FechaEntrega.replace('T00:00:00','') == fechaIncial
              && datos_asignacion[i].tinta_Id == tintaConsulta
              && datos_asignacion[i].estado_OrdenTrabajo == estado) this.llenarTabla(datos_asignacion[i], 'ASIGTINTAS');
            }, 1500);
          }
        });
      } else if (tipoDoc == 'CRTINTAS'){

      }
    } else if (ot != null && fechaIncial != null && fechaFinal != null && tintaConsulta != null && estado != null) {
      this.dtAsgTinta.srvObtenerConsultaMov6(ot, fechaIncial, fechaFinal).subscribe(datos_asignacion => {
        this.consultaOTBagPro(ot);
        for (let i = 0; i < datos_asignacion.length; i++) {
          setTimeout(() => {
            this.cantRestante = this.kgOT - this.totalMPEntregada;
            if (datos_asignacion[i].tinta_Id == tintaConsulta && datos_asignacion[i].estado_OrdenTrabajo == estado) this.llenarTabla(datos_asignacion[i], 'ASIGTINTAS');
          }, 1500);
        }
      });
    } else if (ot != null && tipoDoc != null && fechaIncial != null && fechaFinal != null && estado != null) {
      if (tipoDoc == 'ASIGTINTAS') {
        this.dtAsgTinta.srvObtenerConsultaMov6(ot, fechaIncial, fechaFinal).subscribe(datos_asignacion => {
          this.consultaOTBagPro(ot);
          for (let i = 0; i < datos_asignacion.length; i++) {
            setTimeout(() => {
              this.cantRestante = this.kgOT - this.totalMPEntregada;
              if (datos_asignacion[i].estado_OrdenTrabajo == estado) this.llenarTabla(datos_asignacion[i], 'ASIGTINTAS');
            }, 1500);
          }
        });
      } else if (tipoDoc == 'CRTINTAS'){

      }
    } else if (ot != null && tipoDoc != null && fechaIncial != null && fechaFinal != null && tintaConsulta != null) {
      if (tipoDoc == 'ASIGTINTAS') {
        this.dtAsgTinta.srvObtenerConsultaMov6(ot, fechaIncial, fechaFinal).subscribe(datos_asignacion => {
          this.consultaOTBagPro(ot);
          for (let i = 0; i < datos_asignacion.length; i++) {
            setTimeout(() => {
              this.cantRestante = this.kgOT - this.totalMPEntregada;
              if (datos_asignacion[i].tinta_Id == tintaConsulta && datos_asignacion[i].tinta_Id == tintaConsulta) this.llenarTabla(datos_asignacion[i], 'ASIGTINTAS');
            }, 1500);
          }
        });
      } else if (tipoDoc == 'CRTINTAS'){

      }
    } else if (fechaIncial != null && fechaFinal != null && tintaConsulta != null && estado != null) {
      // Asignación de materia prima
      this.dtAsgTinta.srvObtenerConsultaMov9(fechaIncial, fechaFinal, tintaConsulta, estado).subscribe(datos_asignacion => {
        for (let i = 0; i < datos_asignacion.length; i++) {
          this.llenarTabla(datos_asignacion[i], 'ASIGTINTAS');
        }
      });
    } else if (tipoDoc != null && fechaIncial != null && tintaConsulta != null && estado != null) {
      if (tipoDoc == 'ASIGTINTAS') {
        this.dtAsgTinta.srvObtenerConsultaMov2(tintaConsulta, fechaIncial).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].estado_OrdenTrabajo == estado) this.llenarTabla(datos_asignacion[i], 'ASIGTINTAS');
          }
        });
      } else if (tipoDoc == 'CRTINTAS'){

      }
    } else if (tipoDoc != null && fechaIncial != null && fechaFinal != null && estado != null) {
      if (tipoDoc == 'ASIGTINTAS') {
        this.dtAsgTinta.srvObtenerConsultaMov7(fechaIncial, fechaFinal, estado).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            this.llenarTabla(datos_asignacion[i], 'ASIGTINTAS');
          }
        });
      } else if (tipoDoc == 'CRTINTAS'){

      }
    } else if (tipoDoc != null && fechaIncial != null && fechaFinal != null && tintaConsulta != null) {
      if (tipoDoc == 'ASIGTINTAS') {
        this.dtAsgTinta.srvObtenerConsultaMov8(fechaIncial, fechaFinal, tintaConsulta).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            this.llenarTabla(datos_asignacion[i], 'ASIGTINTAS');
          }
        });
      } else if (tipoDoc == 'CRTINTAS'){

      }
    } else if (ot != null && tipoDoc != null && tintaConsulta != null && estado != null) {
      if (tipoDoc == 'ASIGTINTAS') {
        this.dtAsgTinta.srvObtenerConsultaMov3(ot).subscribe(datos_asignacion => {
          this.consultaOTBagPro(ot);
          for (let i = 0; i < datos_asignacion.length; i++) {

            setTimeout(() => {
              this.cantRestante = this.kgOT - this.totalMPEntregada;
              if (datos_asignacion[i].tinta_Id == tintaConsulta && datos_asignacion[i].estado_OrdenTrabajo == estado) this.llenarTabla(datos_asignacion[i], 'ASIGTINTAS');
            }, 1500);
          }
        });
      } else if (tipoDoc == 'CRTINTAS'){

      }
    } else if (ot != null && tipoDoc != null && fechaIncial != null && estado != null) {
      if (tipoDoc == 'ASIGTINTAS') {
        this.dtAsgTinta.srvObtenerConsultaMov3(ot).subscribe(datos_asignacion => {
          this.consultaOTBagPro(ot);
          for (let i = 0; i < datos_asignacion.length; i++) {
            setTimeout(() => {
              this.cantRestante = this.kgOT - this.totalMPEntregada;
              if (datos_asignacion[i].ASIGTINTAS_FechaEntrega.replace('T00:00:00', '') == fechaIncial && datos_asignacion[i].estado_OrdenTrabajo == estado) this.llenarTabla(datos_asignacion[i], 'ASIGTINTAS');
            }, 1500);
          }
        });
      } else if (tipoDoc == 'CRTINTAS'){

      }
    } else if (ot != null && tipoDoc != null && fechaIncial != null && tintaConsulta != null) {
      if (tipoDoc == 'ASIGTINTAS') {
        this.dtAsgTinta.srvObtenerConsultaMov3(ot).subscribe(datos_asignacion => {
          this.consultaOTBagPro(ot);
          for (let i = 0; i < datos_asignacion.length; i++) {
            setTimeout(() => {
              this.cantRestante = this.kgOT - this.totalMPEntregada;
              if (datos_asignacion[i].ASIGTINTAS_FechaEntrega.replace('T00:00:00', '') == fechaIncial && datos_asignacion[i].matPri_Id == tintaConsulta) this.llenarTabla(datos_asignacion[i], 'ASIGTINTAS');
            }, 1500);
          }
        });
      } else if (tipoDoc == 'CRTINTAS'){

      }
    } else if (ot != null && fechaIncial != null && fechaFinal != null && estado != null) {
      // Asignación de materia prima
      this.dtAsgTinta.srvObtenerConsultaMov6(ot, fechaIncial, fechaFinal).subscribe(datos_asignacion => {
        this.consultaOTBagPro(ot);
        for (let i = 0; i < datos_asignacion.length; i++) {
          setTimeout(() => {
            this.cantRestante = this.kgOT - this.totalMPEntregada;
            if (datos_asignacion[i].estado_OrdenTrabajo == estado) this.llenarTabla(datos_asignacion[i], 'ASIGTINTAS');
          }, 1500);
        }
      });
    } else if (ot != null && fechaIncial != null && fechaFinal != null && tintaConsulta != null) {
      // Asignación de materia prima
      this.dtAsgTinta.srvObtenerConsultaMov6(ot, fechaIncial, fechaFinal).subscribe(datos_asignacion => {
        this.consultaOTBagPro(ot);
        for (let i = 0; i < datos_asignacion.length; i++) {
          this.dtAsgTinta.srvObtenerListaPor_Asignacion(datos_asignacion[i].ASIGTINTAS_Id).subscribe(datos_asig => {
            for (let j = 0; j < datos_asig.length; j++) {
              this.totalMPEntregada += datos_asig[j+i].dtAsigTinta_Cantidad;
              break;
            }
          });
          setTimeout(() => {
            this.cantRestante = this.kgOT - this.totalMPEntregada;
            if (datos_asignacion[i].tinta_Id == tintaConsulta) this.llenarTabla(datos_asignacion[i], 'ASIGTINTAS');
          }, 1500);
        }
      });
    } else if (ot != null && tipoDoc != null && fechaIncial != null && fechaFinal != null) {
      if (tipoDoc == 'ASIGTINTAS') {
        this.dtAsgTinta.srvObtenerConsultaMov6(ot, fechaIncial, fechaFinal).subscribe(datos_asignacion => {
          this.consultaOTBagPro(ot);
          for (let i = 0; i < datos_asignacion.length; i++) {
            setTimeout(() => {
              this.cantRestante = this.kgOT - this.totalMPEntregada;
              this.llenarTabla(datos_asignacion[i], 'ASIGTINTAS');
            }, 1500);
          }
        });
      } else if (tipoDoc == 'CRTINTAS'){

      }
    } else if (fechaIncial != null && fechaFinal != null && estado != null) {
      this.dtAsgTinta.srvObtenerConsultaMov7(fechaIncial, fechaFinal, estado).subscribe(datos_asignacion => {
        for (let i = 0; i < datos_asignacion.length; i++) {
          this.llenarTabla(datos_asignacion[i], 'ASIGTINTAS');
        }
      });
    } else if (fechaIncial != null && fechaFinal != null && tintaConsulta != null) {
      // Asignación de materia prima
      this.dtAsgTinta.srvObtenerConsultaMov8(fechaIncial, fechaFinal, tintaConsulta).subscribe(datos_asignacion => {
        for (let i = 0; i < datos_asignacion.length; i++) {
          this.llenarTabla(datos_asignacion[i], 'ASIGTINTAS');
        }
      });
    } else if (tipoDoc != null && fechaIncial != null && estado != null) {
      if (tipoDoc == 'ASIGTINTAS') {
        this.dtAsgTinta.srvObtenerConsultaMov0(fechaIncial).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].estado_OrdenTrabajo == estado) this.llenarTabla(datos_asignacion[i], 'ASIGTINTAS');
          }
        });
      } else if (tipoDoc == 'CRTINTAS'){

      }
    } else if (tipoDoc != null && fechaIncial != null && tintaConsulta != null) {
      if (tipoDoc == 'ASIGTINTAS') {
        this.dtAsgTinta.srvObtenerConsultaMov0(fechaIncial).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].tinta_Id == tintaConsulta) this.llenarTabla(datos_asignacion[i], 'ASIGTINTAS');
          }
        });
      } else if (tipoDoc == 'CRTINTAS'){

      }
    } else if (tipoDoc != null && fechaIncial != null && fechaFinal != null) {
      if (tipoDoc == 'ASIGTINTAS') {
        this.dtAsgTinta.srvObtenerConsultaMov4(fechaIncial, fechaFinal).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            this.llenarTabla(datos_asignacion[i], 'ASIGTINTAS');
          }
        });
      } else if (tipoDoc == 'CRTINTAS'){

      }
    } else if (ot != null && tintaConsulta != null && estado != null) {
      // Asignación de materia prima
      this.dtAsgTinta.srvObtenerConsultaMov3(ot).subscribe(datos_asignacion => {
        this.consultaOTBagPro(ot);
        for (let i = 0; i < datos_asignacion.length; i++) {
          setTimeout(() => {
            this.cantRestante = this.kgOT - this.totalMPEntregada;
            if (datos_asignacion[i].tinta_Id == tintaConsulta && datos_asignacion[i].estado_OrdenTrabajo == estado) this.llenarTabla(datos_asignacion[i], 'ASIGTINTAS');
          }, 1500);
        }
      });
    } else if (ot != null && fechaIncial != null && estado != null) {
      // Asignación de materia prima
      this.dtAsgTinta.srvObtenerConsultaMov3(ot).subscribe(datos_asignacion => {
        this.consultaOTBagPro(ot);
        for (let i = 0; i < datos_asignacion.length; i++) {
          this.dtAsgTinta.srvObtenerListaPor_Asignacion(datos_asignacion[i].ASIGTINTAS_Id).subscribe(datos_asig => {
            for (let j = 0; j < datos_asig.length; j++) {
              this.totalMPEntregada += datos_asig[j+i].dtAsigTinta_Cantidad;
              break;
            }
          });
          setTimeout(() => {
            this.cantRestante = this.kgOT - this.totalMPEntregada;
            if (datos_asignacion[i].ASIGTINTAS_FechaEntrega.replace('T00:00:00','') == fechaIncial && datos_asignacion[i].estado_OrdenTrabajo == estado) this.llenarTabla(datos_asignacion[i], 'ASIGTINTAS');
          }, 1500);
        }
      });
    } else if (ot != null && fechaIncial != null && tintaConsulta != null) {
      // Asignación de materia prima
      this.dtAsgTinta.srvObtenerConsultaMov3(ot).subscribe(datos_asignacion => {
        this.consultaOTBagPro(ot);
        for (let i = 0; i < datos_asignacion.length; i++) {
          setTimeout(() => {
            this.cantRestante = this.kgOT - this.totalMPEntregada;
            if (datos_asignacion[i].ASIGTINTAS_FechaEntrega.replace('T00:00:00','') == fechaIncial && datos_asignacion[i].tinta_Id == tintaConsulta) this.llenarTabla(datos_asignacion[i], 'ASIGTINTAS');
          }, 1500);
        }
      });
    } else if (ot != null && fechaIncial != null && fechaFinal != null) {
      // Asignación de materia prima
      this.dtAsgTinta.srvObtenerConsultaMov6(ot, fechaIncial, fechaFinal).subscribe(datos_asignacion => {
        this.consultaOTBagPro(ot);
        for (let i = 0; i < datos_asignacion.length; i++) {
          setTimeout(() => {
            this.cantRestante = this.kgOT - this.totalMPEntregada;
            this.llenarTabla(datos_asignacion[i], 'ASIGTINTAS');
          }, 1500);
        }
      });
    } else if (ot != null && tipoDoc != null && estado != null) {
      if (tipoDoc == 'ASIGTINTAS') {
        // Asignación de materia prima
        this.dtAsgTinta.srvObtenerConsultaMov3(ot).subscribe(datos_asignacion => {
          this.consultaOTBagPro(ot);
          for (let i = 0; i < datos_asignacion.length; i++) {
            setTimeout(() => {
              this.cantRestante = this.kgOT - this.totalMPEntregada;
              if (datos_asignacion[i].estado_OrdenTrabajo == estado) this.llenarTabla(datos_asignacion[i], 'ASIGTINTAS');
            }, 1500);
          }
        });
      } else if (tipoDoc == 'CRTINTAS'){

      }
    } else if (ot != null && tipoDoc != null && tintaConsulta != null) {
      if (tipoDoc == 'ASIGTINTAS') {
        this.dtAsgTinta.srvObtenerConsultaMov2(tintaConsulta, this.today).subscribe(datos_asignacion => {
          this.consultaOTBagPro(ot);
          for (let i = 0; i < datos_asignacion.length; i++) {
            setTimeout(() => {
              this.cantRestante = this.kgOT - this.totalMPEntregada;
              if (datos_asignacion[i].ASIGTINTAS_OrdenTrabajo == ot) this.llenarTabla(datos_asignacion[i], 'ASIGTINTAS');
            }, 1500);
          }
        });
      } else if (tipoDoc == 'CRTINTAS'){

      }
    } else if (ot != null && tipoDoc != null && fechaIncial != null) {
      if (tipoDoc == 'ASIGTINTAS') {
        this.dtAsgTinta.srvObtenerConsultaMov3(ot).subscribe(datos_asignacion => {
          this.consultaOTBagPro(ot);
          for (let i = 0; i < datos_asignacion.length; i++) {
            setTimeout(() => {
              this.cantRestante = this.kgOT - this.totalMPEntregada;
              if (datos_asignacion[i].ASIGTINTAS_FechaEntrega.replace('T00:00:00', '') == fechaIncial) this.llenarTabla(datos_asignacion[i], 'ASIGTINTAS');
            }, 1500);
          }
        });
      } else if (tipoDoc == 'CRTINTAS'){

      }
    } else if (fechaIncial != null && tintaConsulta != null) {
      // Asignación de materia prima
      this.dtAsgTinta.srvObtenerConsultaMov2(fechaIncial, materiaPrima).subscribe(datos_asignacion => {
        for (let i = 0; i < datos_asignacion.length; i++) {
          this.llenarTabla(datos_asignacion[i], 'ASIGTINTAS');
        }
      });
    } else if (fechaIncial != null && fechaFinal != null) {
      // Asignación de materia prima
      this.dtAsgTinta.srvObtenerConsultaMov4(fechaIncial, fechaFinal).subscribe(datos_asignacion => {
        for (let i = 0; i < datos_asignacion.length; i++) {
          this.llenarTabla(datos_asignacion[i], 'ASIGTINTAS');
        }
      });
    } else if (tipoDoc != null && tintaConsulta != null) {
      if (tipoDoc == 'ASIGTINTAS') {
        this.dtAsgTinta.srvObtenerConsultaMov2(tintaConsulta, this.today).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            this.llenarTabla(datos_asignacion[i], 'ASIGTINTAS');
          }
        });
      } else if (tipoDoc == 'CRTINTAS'){

      }
    } else if (tipoDoc != null && fechaIncial != null) {
      if (tipoDoc == 'ASIGTINTAS') {
        this.dtAsgTinta.srvObtenerConsultaMov0(fechaIncial).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            this.llenarTabla(datos_asignacion[i], 'ASIGTINTAS');
          }
        });
      } else if (tipoDoc == 'CRTINTAS'){

      }
    } else if (ot != null && estado != null) {
      // Asignación de materia prima
      this.dtAsgTinta.srvObtenerConsultaMov3(ot).subscribe(datos_asignacion => {
        this.consultaOTBagPro(ot);
        for (let i = 0; i < datos_asignacion.length; i++) {
          setTimeout(() => {
            this.cantRestante = this.kgOT - this.totalMPEntregada;
            if (datos_asignacion[i].estado_OrdenTrabajo == estado) this.llenarTabla(datos_asignacion[i], 'ASIGTINTAS');
          }, 1500);
        }
      });
    } else if (ot != null && tintaConsulta != null) {
      // Asignación de materia prima
      this.dtAsgTinta.srvObtenerConsultaMov3(ot).subscribe(datos_asignacion => {
        this.consultaOTBagPro(ot);
        for (let i = 0; i < datos_asignacion.length; i++) {
          setTimeout(() => {
            this.cantRestante = this.kgOT - this.totalMPEntregada;
            if (datos_asignacion[i].tinta_Id == tintaConsulta) this.llenarTabla(datos_asignacion[i], 'ASIGTINTAS');
          }, 1500);
        }
      });
    } else if (ot != null && fechaIncial != null) {
      // Asignación de materia prima
      this.dtAsgTinta.srvObtenerConsultaMov3(ot).subscribe(datos_asignacion => {
        this.consultaOTBagPro(ot);
        for (let i = 0; i < datos_asignacion.length; i++) {
          setTimeout(() => {
            this.cantRestante = this.kgOT - this.totalMPEntregada;
            if (datos_asignacion[i].ASIGTINTAS_FechaEntrega.replace('T00:00:00','') == fechaIncial) this.llenarTabla(datos_asignacion[i], 'ASIGTINTAS');
          }, 1500);
        }
      });
    } else if (ot != null && tipoDoc != null) {
      if (tipoDoc == 'ASIGTINTAS') {
        this.dtAsgTinta.srvObtenerConsultaMov3(ot).subscribe(datos_asignacion => {
          this.consultaOTBagPro(ot);
          for (let i = 0; i < datos_asignacion.length; i++) {
            setTimeout(() => {
              this.cantRestante = this.kgOT - this.totalMPEntregada;
              this.llenarTabla(datos_asignacion[i], 'ASIGTINTAS');
            }, 1500);
          }
        });
      }  else if (tipoDoc == 'CRTINTAS'){

      }
    } else if (ot != null) {
      // Asignación de materia prima
      this.dtAsgTinta.srvObtenerConsultaMov3(ot).subscribe(datos_asignacion => {
        this.consultaOTBagPro(ot);
        for (let i = 0; i < datos_asignacion.length; i++) {
          this.dtAsgTinta.srvObtenerListaPor_Asignacion(datos_asignacion[i].ASIGTINTAS_Id).subscribe(datos_asig => {
            for (let j = 0; j < datos_asig.length; j++) {
              this.totalMPEntregada += datos_asig[j+i].dtAsigTinta_Cantidad;
              break;
            }
          });
          setTimeout(() => {
            this.cantRestante = this.kgOT - this.totalMPEntregada;
            this.llenarTabla(datos_asignacion[i], 'ASIGTINTAS');
          }, 2000);
        }
      });
    } else if (tipoDoc != null) {
      if (tipoDoc == 'ASIGTINTAS') {
        this.dtAsgTinta.srvObtenerConsultaMov0(this.today).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            this.llenarTabla(datos_asignacion[i], 'ASIGTINTAS');
          }
        });
      }  else if (tipoDoc == 'CRTINTAS'){

      }
    } else if (fechaIncial != null) {
      // Asignación de materia prima
      this.dtAsgTinta.srvObtenerConsultaMov0(fechaIncial).subscribe(datos_asignacion => {
        for (let i = 0; i < datos_asignacion.length; i++) {
          this.llenarTabla(datos_asignacion[i], 'ASIGTINTAS');
        }
      });
    } else if (tintaConsulta != null) {
      // Asignación de materia prima
      this.dtAsgTinta.srvObtenerConsultaMov2(tintaConsulta, this.today).subscribe(datos_asignacion => {
        for (let i = 0; i < datos_asignacion.length; i++) {
          this.llenarTabla(datos_asignacion[i], 'ASIGTINTAS');
        }
      });
    } else if (estado != null) {
      // Asignacion de materia prima
      this.dtAsgTinta.srvObtenerConsultaMov1(estado).subscribe(datos_asignacion => {
        for (let i = 0; i < datos_asignacion.length; i++) {
          this.llenarTabla(datos_asignacion[i], 'ASIGTINTAS');
        }
      });
    } else {
      // Asignación de materia prima
      this.dtAsgTinta.srvObtenerConsultaMov0(this.today).subscribe(datos_asignacion => {
        for (let i = 0; i < datos_asignacion.length; i++) {
          this.llenarTabla(datos_asignacion[i], 'ASIGTINTAS');
        }
      });
    }
    setTimeout(() => { this.load = true; }, 3000);
  }

  // Funcion para llenar la tabla con la informcion consultada
  llenarTabla(datos : any, tipoDoc : any){
    if (tipoDoc == 'ASIGTINTAS') {
      let info : any = {
        ot : datos.asigMP_OrdenTrabajo,
        tipoId : 'ASIGTINTAS',
        tipo : 'Asignación de Materia Prima',
        fecha : datos.asigMp_FechaEntrega,
        usuario : datos.usua_Nombre,
        matPrima : datos.tinta_Nombre,
        cant : datos.dtAsigTinta_Cantidad,
        estado : datos.estado_Nombre,
      }
      this.ArrayInfoConsulta.push(info);
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
            UndCant : datos_asignacion[i].undMed_Id,
          }
          this.ArrayMpPDF.push(items);
        }
        setTimeout(() => { this.verPDF(data); }, 2000);
      });
    }
  }

  // Funcion que permitirá ver la informacion del documento en un formato PDF
  verPDF(data : any){
    if (data.tipoId == 'ASIGTINTAS') {
      this.dtAsgTinta.srvObtenerpdfMovimientos(data.ot).subscribe(datos_asignacion => {
        for (let i = 0; i < datos_asignacion.length; i++) {
          for (let j = 0; j < this.ArrayMpPDF.length; j++) {
            const pdfDefinicion : any = {
              info: {
                title: `${datos_asignacion[i].ASIGTINTAS_Id}`
              },
              content : [
                {
                  text: `Plasticaribe S.A.S ---- Asignación de Tintas`,
                  alignment: 'center',
                  style: 'titulo',
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

                this.tableAsignacion(this.ArrayMpPDF, ['Id', 'Nombre', 'Cant', 'UndCant']),
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
