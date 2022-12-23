import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import pdfMake from 'pdfmake/build/pdfmake';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { DetallesAsignacionService } from 'src/app/Servicios/DetallesAsgMateriaPrima/detallesAsignacion.service';
import { DetallesAsignacionTintasService } from 'src/app/Servicios/DetallesAsgTintas/detallesAsignacionTintas.service';
import { DevolucionesMPService } from 'src/app/Servicios/DetallesDevolucionMateriaPrima/devolucionesMP.service';
import { EstadosService } from 'src/app/Servicios/Estados/estados.service';
import { FacturaMpService } from 'src/app/Servicios/DetallesFacturaMateriaPrima/facturaMp.service';
import { MateriaPrimaService } from 'src/app/Servicios/MateriaPrima/materiaPrima.service';
import { RecuperadoMPService } from 'src/app/Servicios/DetallesRecuperado/recuperadoMP.service';
import { RemisionesMPService } from 'src/app/Servicios/DetallesRemisiones/remisionesMP.service';
import { RolesService } from 'src/app/Servicios/Roles/roles.service';
import { TipoDocumentoService } from 'src/app/Servicios/TipoDocumento/tipoDocumento.service';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-MovimientoMatPrima',
  templateUrl: './MovimientoMatPrima.component.html',
  styleUrls: ['./MovimientoMatPrima.component.css']
})
export class MovimientoMatPrimaComponent implements OnInit {

  public FormDocumentos !: FormGroup;
  public page : number; //Variable que tendrá el paginado de la tabla en la que se muestran los pedidos consultados
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  tipoDocumento = []; //Variable que almacenará los diferentes tipos d documentos que pueden ser consultados
  ArrayMateriaPrima : any [] = []; //Variable que tendrá la informacion de los productos que se piden para uan OT
  keywordMp = 'matPri_Nombre'; //Variable que va a almacenar la propieda por la cual se va a filtrar la materia prima al momento de ser consultada por el campo de materia prima
  validarInputMp : any; //Variable que va a permitir si se ve el titulo del campo de materia prima o no
  load : boolean = true; //Variabel para permitir que se vea o no una imagen de carga
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  titulosTabla = []; //Variable que almacenará los titulos de la tabla de productos que se ve al final de la vista
  ArrayInfoConsulta : any [] = []; //Variable que tendrá la informacion de los resultados de la consulta realizada
  valorTotal : number = 0; //Variable que guardará el valor total de la factura de entrada de materia prima
  totalMPEntregada : any = 0; //Vairble que almacenará la cantidad de materia prima entregada para una orden de trabajo
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
                                      private dtTintas : DetallesAsignacionTintasService,
                                        private appComponent : AppComponent,) {

    this.FormDocumentos = this.frmBuilderMateriaPrima.group({
      idDocumento : [null, Validators.required],
      TipoDocumento: [null, Validators.required],
      IdMateriaPrima: [null],
      materiaPrima: ['', Validators.required],
      fecha: [null, Validators.required],
      fechaFinal : [null, Validators.required],
      estado : [null, Validators.required],
    });
    this.validarInputMp = true;
  }

  ngOnInit() {
    this.lecturaStorage();
    this.ColumnasTabla();
    this.obtenerMateriasPrimas();
    this.obtenerTipoDocumento();
    this.obtenerEstados();
  }

  // Funcion que va cambiar el nombre de la materia prima
  cambiarNombreMateriaPrima() {
    let id : number = this.FormDocumentos.value.materiaPrima
    this.materiaPrimaService.getInfoMpTintaBopp(id).subscribe(datos_materiaPrima => {
      for (let i = 0; i < datos_materiaPrima.length; i++) {
        this.FormDocumentos = this.frmBuilderMateriaPrima.group({
          idDocumento : this.FormDocumentos.value.idDocumento,
          TipoDocumento: this.FormDocumentos.value.TipoDocumento,
          IdMateriaPrima: datos_materiaPrima[i].id,
          materiaPrima : datos_materiaPrima[i].nombre,
          fecha: this.FormDocumentos.value.fecha,
          fechaFinal: this.FormDocumentos.value.fechaFinal,
          estado : this.FormDocumentos.value.estado,
        });
      }
    }, error => {
      this.load = true;
    });
  }

  // Funcion que va a limpiar los campos
  LimpiarCampos() {
    this.FormDocumentos.reset()
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

  //Funcion para obtener los diferentes tipos de documentos que podemos encontrar
  obtenerTipoDocumento(){
    this.tipoDocuemntoService.srvObtenerLista().subscribe(datos_tiposDocumentos => {
      for (let index = 0; index < datos_tiposDocumentos.length; index++) {
        if (datos_tiposDocumentos[index].tpDoc_Id == 'ASIGMP'
        || datos_tiposDocumentos[index].tpDoc_Id == 'DEVMP'
        || datos_tiposDocumentos[index].tpDoc_Id == 'FCO'
        || datos_tiposDocumentos[index].tpDoc_Id == 'RECP'
        || datos_tiposDocumentos[index].tpDoc_Id == 'REM') this.tipoDocumento.push(datos_tiposDocumentos[index])
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

    this.dtTintas.srvObtenerSumaCantidadesTintas_MatPrimas(ot).subscribe(datos_asignaciones => {
      this.totalMPEntregada = datos_asignaciones;
    });
  }

  // Funcion que va a consultar por cada la combinacion de filtro que se le idequen
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
    let materiaPrima : any = this.FormDocumentos.value.IdMateriaPrima;
    let estado : any = this.FormDocumentos.value.estado;

    if (ot != null && tipoDoc != null && fechaIncial != null && fechaFinal != null && materiaPrima != null && estado != null) {
      if (tipoDoc == 'ASIGMP') {
        this.consultaOTBagPro(ot);
        this.dtAsgMP.srvObtenerConsultaMov10(ot, fechaIncial, fechaFinal, materiaPrima, estado).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            setTimeout(() => {
              this.cantRestante = this.kgOT - this.totalMPEntregada;
              this.llenarTabla(datos_asignacion[i], tipoDoc);
            }, 1200);
          }
        });
      }
    } else if (tipoDoc != null && fechaIncial != null && fechaFinal != null && materiaPrima != null && estado != null) {
      if (tipoDoc == 'ASIGMP') {
        this.dtAsgMP.srvObtenerConsultaMov4(fechaIncial, fechaFinal).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].estado_OrdenTrabajo == estado && datos_asignacion[i].matPri_Id == materiaPrima) this.llenarTabla(datos_asignacion[i], 'ASIGMP');
          }
        });
      }
    } else if (ot != null && tipoDoc != null && fechaIncial != null && materiaPrima != null && estado != null) {
      if (tipoDoc == 'ASIGMP') {
        this.dtAsgMP.srvObtenerConsultaMov3(ot).subscribe(datos_asignacion => {
          this.consultaOTBagPro(ot);
          for (let i = 0; i < datos_asignacion.length; i++) {
            setTimeout(() => {
              this.cantRestante = this.kgOT - this.totalMPEntregada;
              if (datos_asignacion[i].asigMp_FechaEntrega.replace('T00:00:00','') == fechaIncial
              && datos_asignacion[i].matPri_Id == materiaPrima
              && datos_asignacion[i].estado_OrdenTrabajo == estado) this.llenarTabla(datos_asignacion[i], 'ASIGMP');
            }, 1500);
          }
        });
      }
    } else if (ot != null && fechaIncial != null && fechaFinal != null && materiaPrima != null && estado != null) {
      this.dtAsgMP.srvObtenerConsultaMov6(ot, fechaIncial, fechaFinal).subscribe(datos_asignacion => {
        this.consultaOTBagPro(ot);
        for (let i = 0; i < datos_asignacion.length; i++) {
          setTimeout(() => {
            this.cantRestante = this.kgOT - this.totalMPEntregada;
            if (datos_asignacion[i].matPri_Id == materiaPrima && datos_asignacion[i].estado_OrdenTrabajo == estado) this.llenarTabla(datos_asignacion[i], 'ASIGMP');
          }, 1500);
        }
      });
    } else if (ot != null && tipoDoc != null && fechaIncial != null && fechaFinal != null && estado != null) {
      if (tipoDoc == 'ASIGMP') {
        this.dtAsgMP.srvObtenerConsultaMov6(ot, fechaIncial, fechaFinal).subscribe(datos_asignacion => {
          this.consultaOTBagPro(ot);
          for (let i = 0; i < datos_asignacion.length; i++) {
            setTimeout(() => {
              this.cantRestante = this.kgOT - this.totalMPEntregada;
              if (datos_asignacion[i].estado_OrdenTrabajo == estado) this.llenarTabla(datos_asignacion[i], 'ASIGMP');
            }, 1500);
          }
        });
      }
    } else if (ot != null && tipoDoc != null && fechaIncial != null && fechaFinal != null && materiaPrima != null) {
      if (tipoDoc == 'ASIGMP') {
        this.dtAsgMP.srvObtenerConsultaMov6(ot, fechaIncial, fechaFinal).subscribe(datos_asignacion => {
          this.consultaOTBagPro(ot);
          for (let i = 0; i < datos_asignacion.length; i++) {
            setTimeout(() => {
              this.cantRestante = this.kgOT - this.totalMPEntregada;
              if (datos_asignacion[i].matPri_Id == materiaPrima && datos_asignacion[i].matPri_Id == materiaPrima) this.llenarTabla(datos_asignacion[i], 'ASIGMP');
            }, 1500);
          }
        });
      }
    } else if (fechaIncial != null && fechaFinal != null && materiaPrima != null && estado != null) {
      // Asignación de materia prima
      this.dtAsgMP.srvObtenerConsultaMov9(fechaIncial, fechaFinal, materiaPrima, estado).subscribe(datos_asignacion => {
        for (let i = 0; i < datos_asignacion.length; i++) {
          this.llenarTabla(datos_asignacion[i], 'ASIGMP');
        }
      });
    } else if (tipoDoc != null && fechaIncial != null && materiaPrima != null && estado != null) {
      if (tipoDoc == 'ASIGMP') {
        this.dtAsgMP.srvObtenerConsultaMov5(fechaIncial, materiaPrima).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].estado_OrdenTrabajo == estado) this.llenarTabla(datos_asignacion[i], 'ASIGMP');
          }
        });
      }
    } else if (tipoDoc != null && fechaIncial != null && fechaFinal != null && estado != null) {
      if (tipoDoc == 'ASIGMP') {
        this.dtAsgMP.srvObtenerConsultaMov7(fechaIncial, fechaFinal, estado).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            this.llenarTabla(datos_asignacion[i], 'ASIGMP');
          }
        });
      }
    } else if (tipoDoc != null && fechaIncial != null && fechaFinal != null && materiaPrima != null) {
      if (tipoDoc == 'ASIGMP') {
        this.dtAsgMP.srvObtenerConsultaMov8(fechaIncial, fechaFinal, materiaPrima).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            this.llenarTabla(datos_asignacion[i], 'ASIGMP');
          }
        });
      } else if (tipoDoc == 'DEVMP') {
        this.dtDevMP.srvObtenerConsultaMov6(fechaIncial, fechaFinal, materiaPrima).subscribe(datos_devolucion => {
          for (let i = 0; i < datos_devolucion.length; i++) {
            this.llenarTabla(datos_devolucion[i], 'DEVMP');
          }
        });
      } else if (tipoDoc == 'FCO') {
        this.dtFacturaMP.srvObtenerConsultaMov6(fechaIncial, fechaFinal, materiaPrima).subscribe(datos_factura => {
          for (let i = 0; i < datos_factura.length; i++) {
            this.llenarTabla(datos_factura[i], 'FCO');
          }
        });
      } else if (tipoDoc == 'REM') {
        this.dtRemision.srvObtenerConsultaMov6(fechaIncial, fechaFinal, materiaPrima).subscribe(datos_remision => {
          for (let i = 0; i < datos_remision.length; i++) {
            this.llenarTabla(datos_remision[i], 'REM');
          }
        });
      } else if (tipoDoc == 'RECP') {
        this.dtRecuperado.srvObtenerConsultaMov6(fechaIncial, fechaFinal, materiaPrima).subscribe(datos_recuperado => {
          for (let i = 0; i < datos_recuperado.length; i++) {
            this.llenarTabla(datos_recuperado[i], 'RECP');
          }
        });
      }
    } else if (ot != null && tipoDoc != null && materiaPrima != null && estado != null) {
      if (tipoDoc == 'ASIGMP') {
        this.dtAsgMP.srvObtenerConsultaMov3(ot).subscribe(datos_asignacion => {
          this.consultaOTBagPro(ot);
          for (let i = 0; i < datos_asignacion.length; i++) {
            setTimeout(() => {
              this.cantRestante = this.kgOT - this.totalMPEntregada;
              if (datos_asignacion[i].matPri_Id == materiaPrima && datos_asignacion[i].estado_OrdenTrabajo == estado) this.llenarTabla(datos_asignacion[i], 'ASIGMP');
            }, 1500);
          }
        });
      }
    } else if (ot != null && tipoDoc != null && fechaIncial != null && estado != null) {
      if (tipoDoc == 'ASIGMP') {
        this.dtAsgMP.srvObtenerConsultaMov3(ot).subscribe(datos_asignacion => {
          this.consultaOTBagPro(ot);
          for (let i = 0; i < datos_asignacion.length; i++) {
            setTimeout(() => {
              this.cantRestante = this.kgOT - this.totalMPEntregada;
              if (datos_asignacion[i].asigMp_FechaEntrega.replace('T00:00:00', '') == fechaIncial && datos_asignacion[i].estado_OrdenTrabajo == estado) this.llenarTabla(datos_asignacion[i], 'ASIGMP');
            }, 1500);
          }
        });
      }
    } else if (ot != null && tipoDoc != null && fechaIncial != null && materiaPrima != null) {
      if (tipoDoc == 'ASIGMP') {
        this.dtAsgMP.srvObtenerConsultaMov3(ot).subscribe(datos_asignacion => {
          this.consultaOTBagPro(ot);
          for (let i = 0; i < datos_asignacion.length; i++) {
            setTimeout(() => {
              this.cantRestante = this.kgOT - this.totalMPEntregada;
              if (datos_asignacion[i].asigMp_FechaEntrega.replace('T00:00:00', '') == fechaIncial && datos_asignacion[i].matPri_Id == materiaPrima) this.llenarTabla(datos_asignacion[i], 'ASIGMP');
            }, 1500);
          }
        });
      } else if (tipoDoc == 'DEVMP') {
        this.dtDevMP.srvObtenerConsultaMov2(ot).subscribe(datos_devolucion => {
          for (let i = 0; i < datos_devolucion.length; i++) {
            if (datos_devolucion[i].devMatPri_Fecha.replace('T00:00:00', '') == fechaIncial && datos_devolucion[i].matPri_Id == materiaPrima) this.llenarTabla(datos_devolucion[i], 'DEVMP');
          }
        });
      } else if (tipoDoc == 'FCO') {
        this.dtFacturaMP.srvObtenerListaMov2(ot).subscribe(datos_factura => {
          for (let i = 0; i < datos_factura.length; i++) {
            if (datos_factura[i].facco_FechaFactura.replace('T00:00:00', '') == fechaIncial && datos_factura[i].matPri_Id == materiaPrima) this.llenarTabla(datos_factura[i], 'FCO');
          }
        });
      } else if (tipoDoc == 'REM') {
        this.dtRemision.srvObtenerListaMov2(ot).subscribe(datos_remision => {
          for (let i = 0; i < datos_remision.length; i++) {
            if (datos_remision[i].rem_Fecha.replace('T00:00:00', '') == fechaIncial && datos_remision[i].matPri_Id == materiaPrima) this.llenarTabla(datos_remision[i], 'REM');
          }
        });
      } else if (tipoDoc == 'RECP') {
        this.dtRecuperado.srvObtenerConsultaMov2(ot).subscribe(datos_recuperado => {
          for (let i = 0; i < datos_recuperado.length; i++) {
            if (datos_recuperado[i].recMp_FechaIngreso.replace('T00:00:00', '') == fechaIncial && datos_recuperado[i].matPri_Id == materiaPrima) this.llenarTabla(datos_recuperado[i], 'RECP');
          }
        });
      }
    } else if (ot != null && fechaIncial != null && fechaFinal != null && estado != null) {
      // Asignación de materia prima
      this.dtAsgMP.srvObtenerConsultaMov6(ot, fechaIncial, fechaFinal).subscribe(datos_asignacion => {
        this.consultaOTBagPro(ot);
        for (let i = 0; i < datos_asignacion.length; i++) {
          setTimeout(() => {
            this.cantRestante = this.kgOT - this.totalMPEntregada;
            if (datos_asignacion[i].estado_OrdenTrabajo == estado) this.llenarTabla(datos_asignacion[i], 'ASIGMP');
          }, 1500);
        }
      });
    } else if (ot != null && fechaIncial != null && fechaFinal != null && materiaPrima != null) {
      // Asignación de materia prima
      this.dtAsgMP.srvObtenerConsultaMov6(ot, fechaIncial, fechaFinal).subscribe(datos_asignacion => {
        this.consultaOTBagPro(ot);
        for (let i = 0; i < datos_asignacion.length; i++) {
          setTimeout(() => {
            this.cantRestante = this.kgOT - this.totalMPEntregada;
            if (datos_asignacion[i].matPri_Id == materiaPrima) this.llenarTabla(datos_asignacion[i], 'ASIGMP');
          }, 1500);
        }
      });
      // Devolución de materia prima
      this.dtDevMP.srvObtenerConsultaMov5(ot, fechaIncial, fechaFinal).subscribe(datos_devolucion => {
        for (let i = 0; i < datos_devolucion.length; i++) {
          if (datos_devolucion[i].matPri_Id == materiaPrima) this.llenarTabla(datos_devolucion[i], 'DEVMP');
        }
      });
      // Entradas de materia prima
      // Factura
      this.dtFacturaMP.srvObtenerConsultaMov5(ot, fechaIncial, fechaFinal).subscribe(datos_factura => {
        for (let i = 0; i < datos_factura.length; i++) {
          if (datos_factura[i].matPri_Id == materiaPrima) this.llenarTabla(datos_factura[i], 'FCO');
        }
      });
      // Remision
      this.dtRemision.srvObtenerConsultaMov5(ot, fechaIncial, fechaFinal).subscribe(datos_remision => {
        for (let i = 0; i < datos_remision.length; i++) {
          if (datos_remision[i].matPri_Id == materiaPrima) this.llenarTabla(datos_remision[i], 'REM');
        }
      });
      // Recuperado
      this.dtRecuperado.srvObtenerConsultaMov5(ot,fechaIncial, fechaFinal).subscribe(datos_recuperado => {
        for (let i = 0; i < datos_recuperado.length; i++) {
          if (datos_recuperado[i].matPri_Id == materiaPrima) this.llenarTabla(datos_recuperado[i], 'RECP');
        }
      });
    } else if (ot != null && tipoDoc != null && fechaIncial != null && fechaFinal != null) {
      if (tipoDoc == 'ASIGMP') {
        this.dtAsgMP.srvObtenerConsultaMov6(ot, fechaIncial, fechaFinal).subscribe(datos_asignacion => {
          this.consultaOTBagPro(ot);
          for (let i = 0; i < datos_asignacion.length; i++) {
            setTimeout(() => {
              this.cantRestante = this.kgOT - this.totalMPEntregada;
              this.llenarTabla(datos_asignacion[i], 'ASIGMP');
            }, 1500);
          }
        });
      } else if (tipoDoc == 'DEVMP') {
        this.dtDevMP.srvObtenerConsultaMov5(ot, fechaIncial, fechaFinal).subscribe(datos_devolucion => {
          for (let i = 0; i < datos_devolucion.length; i++) {
            this.llenarTabla(datos_devolucion[i], 'DEVMP');
          }
        });
      } else if (tipoDoc == 'FCO') {
        this.dtFacturaMP.srvObtenerConsultaMov5(ot, fechaIncial, fechaFinal).subscribe(datos_factura => {
          for (let i = 0; i < datos_factura.length; i++) {
            this.llenarTabla(datos_factura[i], 'FCO');
          }
        });
      } else if (tipoDoc == 'REM') {
        this.dtRemision.srvObtenerConsultaMov5(ot, fechaIncial, fechaFinal).subscribe(datos_remision => {
          for (let i = 0; i < datos_remision.length; i++) {
            this.llenarTabla(datos_remision[i], 'REM');
          }
        });
      } else if (tipoDoc == 'RECP') {
        this.dtRecuperado.srvObtenerConsultaMov5(ot,fechaIncial, fechaFinal).subscribe(datos_recuperado => {
          for (let i = 0; i < datos_recuperado.length; i++) {
            this.llenarTabla(datos_recuperado[i], 'RECP');
          }
        });
      }
    } else if (fechaIncial != null && fechaFinal != null && estado != null) {
      this.dtAsgMP.srvObtenerConsultaMov7(fechaIncial, fechaFinal, estado).subscribe(datos_asignacion => {
        for (let i = 0; i < datos_asignacion.length; i++) {
          this.llenarTabla(datos_asignacion[i], 'ASIGMP');
        }
      });
    } else if (fechaIncial != null && fechaFinal != null && materiaPrima != null) {
      // Asignación de materia prima
      this.dtAsgMP.srvObtenerConsultaMov8(fechaIncial, fechaFinal, materiaPrima).subscribe(datos_asignacion => {
        for (let i = 0; i < datos_asignacion.length; i++) {
          this.llenarTabla(datos_asignacion[i], 'ASIGMP');
        }
      });
      // Devolución de materia prima
      this.dtDevMP.srvObtenerConsultaMov6(fechaIncial, fechaFinal, materiaPrima).subscribe(datos_devolucion => {
        for (let i = 0; i < datos_devolucion.length; i++) {
          this.llenarTabla(datos_devolucion[i], 'DEVMP');
        }
      });
      // Entradas de materia prima
      // Factura
      this.dtFacturaMP.srvObtenerConsultaMov6(fechaIncial, fechaFinal, materiaPrima).subscribe(datos_factura => {
        for (let i = 0; i < datos_factura.length; i++) {
          this.llenarTabla(datos_factura[i], 'FCO');
        }
      });
      // Remision
      this.dtRemision.srvObtenerConsultaMov6(fechaIncial, fechaFinal, materiaPrima).subscribe(datos_remision => {
        for (let i = 0; i < datos_remision.length; i++) {
          this.llenarTabla(datos_remision[i], 'REM');
        }
      });
      // Recuperado
      this.dtRecuperado.srvObtenerConsultaMov6(fechaIncial, fechaFinal, materiaPrima).subscribe(datos_recuperado => {
        for (let i = 0; i < datos_recuperado.length; i++) {
          this.llenarTabla(datos_recuperado[i], 'RECP');
        }
      });
    } else if (tipoDoc != null && fechaIncial != null && estado != null) {
      if (tipoDoc == 'ASIGMP') {
        this.dtAsgMP.srvObtenerConsultaMov0(fechaIncial).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].estado_OrdenTrabajo == estado) this.llenarTabla(datos_asignacion[i], 'ASIGMP');
          }
        });
      }
    } else if (tipoDoc != null && fechaIncial != null && materiaPrima != null) {
      if (tipoDoc == 'ASIGMP') {
        this.dtAsgMP.srvObtenerConsultaMov0(fechaIncial).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            if (datos_asignacion[i].matPri_Id == materiaPrima) this.llenarTabla(datos_asignacion[i], 'ASIGMP');
          }
        });
      } else if (tipoDoc == 'DEVMP') {
        this.dtDevMP.srvObtenerConsultaMov0(fechaIncial).subscribe(datos_devolucion => {
          for (let i = 0; i < datos_devolucion.length; i++) {
            if (datos_devolucion[i].matPri_Id == materiaPrima) this.llenarTabla(datos_devolucion[i], 'DEVMP');
          }
        });
      } else if (tipoDoc == 'FCO') {
        this.dtFacturaMP.srvObtenerListaMov0(fechaIncial).subscribe(datos_factura => {
          for (let i = 0; i < datos_factura.length; i++) {
            if (datos_factura[i].matPri_Id == materiaPrima) this.llenarTabla(datos_factura[i], 'FCO');
          }
        });
      } else if (tipoDoc == 'REM') {
        this.dtRemision.srvObtenerListaMov0(fechaIncial).subscribe(datos_remision => {
          for (let i = 0; i < datos_remision.length; i++) {
            if (datos_remision[i].matPri_Id == materiaPrima) this.llenarTabla(datos_remision[i], 'REM');
          }
        });
      } else if (tipoDoc == 'RECP') {
        this.dtRecuperado.srvObtenerConsultaMov0(fechaIncial).subscribe(datos_recuperado => {
          for (let i = 0; i < datos_recuperado.length; i++) {
            if (datos_recuperado[i].matPri_Id == materiaPrima) this.llenarTabla(datos_recuperado[i], 'RECP');
          }
        });
      }
    } else if (tipoDoc != null && fechaIncial != null && fechaFinal != null) {
      if (tipoDoc == 'ASIGMP') {
        this.dtAsgMP.srvObtenerConsultaMov4(fechaIncial, fechaFinal).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            this.llenarTabla(datos_asignacion[i], 'ASIGMP');
          }
        });
      } else if (tipoDoc == 'DEVMP') {
        this.dtDevMP.srvObtenerConsultaMov3(fechaIncial, fechaFinal).subscribe(datos_devolucion => {
          for (let i = 0; i < datos_devolucion.length; i++) {
            this.llenarTabla(datos_devolucion[i], 'DEVMP');
          }
        });
      } else if (tipoDoc == 'FCO') {
        this.dtFacturaMP.srvObtenerListaMov3(fechaIncial, fechaFinal).subscribe(datos_factura => {
          for (let i = 0; i < datos_factura.length; i++) {
            this.llenarTabla(datos_factura[i], 'FCO');
          }
        });
      } else if (tipoDoc == 'REM') {
        this.dtRemision.srvObtenerListaMov3(fechaIncial, fechaFinal).subscribe(datos_remision => {
          for (let i = 0; i < datos_remision.length; i++) {
            this.llenarTabla(datos_remision[i], 'REM');
          }
        });
      } else if (tipoDoc == 'RECP') {
        this.dtRecuperado.srvObtenerConsultaMov3(fechaIncial, fechaFinal).subscribe(datos_recuperado => {
          for (let i = 0; i < datos_recuperado.length; i++) {
            this.llenarTabla(datos_recuperado[i], 'RECP');
          }
        });
      }
    } else if (ot != null && materiaPrima != null && estado != null) {
      // Asignación de materia prima
      this.dtAsgMP.srvObtenerConsultaMov3(ot).subscribe(datos_asignacion => {
        this.consultaOTBagPro(ot);
        for (let i = 0; i < datos_asignacion.length; i++) {
          setTimeout(() => {
            this.cantRestante = this.kgOT - this.totalMPEntregada;
            if (datos_asignacion[i].matPri_Id == materiaPrima && datos_asignacion[i].estado_OrdenTrabajo == estado) this.llenarTabla(datos_asignacion[i], 'ASIGMP');
          }, 1500);
        }
      });
    } else if (ot != null && fechaIncial != null && estado != null) {
      // Asignación de materia prima
      this.dtAsgMP.srvObtenerConsultaMov3(ot).subscribe(datos_asignacion => {
        this.consultaOTBagPro(ot);
        for (let i = 0; i < datos_asignacion.length; i++) {
          setTimeout(() => {
            this.cantRestante = this.kgOT - this.totalMPEntregada;
            if (datos_asignacion[i].asigMp_FechaEntrega.replace('T00:00:00','') == fechaIncial && datos_asignacion[i].estado_OrdenTrabajo == estado) this.llenarTabla(datos_asignacion[i], 'ASIGMP');
          }, 1500);
        }
      });
    } else if (ot != null && fechaIncial != null && materiaPrima != null) {
      // Asignación de materia prima
      this.dtAsgMP.srvObtenerConsultaMov3(ot).subscribe(datos_asignacion => {
        this.consultaOTBagPro(ot);
        for (let i = 0; i < datos_asignacion.length; i++) {
          setTimeout(() => {
            this.cantRestante = this.kgOT - this.totalMPEntregada;
            if (datos_asignacion[i].asigMp_FechaEntrega.replace('T00:00:00','') == fechaIncial && datos_asignacion[i].matPri_Id == materiaPrima) this.llenarTabla(datos_asignacion[i], 'ASIGMP');
          }, 1500);
        }
      });
      // Devolución de materia prima
      this.dtDevMP.srvObtenerConsultaMov2(ot).subscribe(datos_devolucion => {
        for (let i = 0; i < datos_devolucion.length; i++) {
          if (datos_devolucion[i].devMatPri_Fecha.replace('T00:00:00', '') == fechaIncial && datos_devolucion[i].matPri_Id == materiaPrima) this.llenarTabla(datos_devolucion[i], 'DEVMP');
        }
      });
      // Entradas de materia prima
      // Factura
      this.dtFacturaMP.srvObtenerListaMov2(ot).subscribe(datos_factura => {
        for (let i = 0; i < datos_factura.length; i++) {
          if (datos_factura[i].facco_FechaFactura.replace('T00:00:00', '') == fechaIncial && datos_factura[i].matPri_Id == materiaPrima) this.llenarTabla(datos_factura[i], 'FCO');
        }
      });
      // Remision
      this.dtRemision.srvObtenerListaMov2(ot).subscribe(datos_remision => {
        for (let i = 0; i < datos_remision.length; i++) {
          if (datos_remision[i].rem_Fecha.replace('T00:00:00', '') == fechaIncial && datos_remision[i].matPri_Id == materiaPrima) this.llenarTabla(datos_remision[i], 'REM');
        }
      });
      // Recuperado
      this.dtRecuperado.srvObtenerConsultaMov2(ot).subscribe(datos_recuperado => {
        for (let i = 0; i < datos_recuperado.length; i++) {
          if (datos_recuperado[i].recMp_FechaIngreso.replace('T00:00:00', '') == fechaIncial && datos_recuperado[i].matPri_Id == materiaPrima) this.llenarTabla(datos_recuperado[i], 'RECP');
        }
      });
    } else if (ot != null && fechaIncial != null && fechaFinal != null) {
      // Asignación de materia prima
      this.dtAsgMP.srvObtenerConsultaMov6(ot, fechaIncial, fechaFinal).subscribe(datos_asignacion => {
        this.consultaOTBagPro(ot);
        for (let i = 0; i < datos_asignacion.length; i++) {
          setTimeout(() => {
            this.cantRestante = this.kgOT - this.totalMPEntregada;
            this.llenarTabla(datos_asignacion[i], 'ASIGMP');
          }, 1500);
        }
      });
      // Devolución de materia prima
      this.dtDevMP.srvObtenerConsultaMov5(ot, fechaIncial, fechaFinal).subscribe(datos_devolucion => {
        for (let i = 0; i < datos_devolucion.length; i++) {
          this.llenarTabla(datos_devolucion[i], 'DEVMP');
        }
      });
      // Entradas de materia prima
      // Factura
      this.dtFacturaMP.srvObtenerConsultaMov5(ot, fechaIncial, fechaFinal).subscribe(datos_factura => {
        for (let i = 0; i < datos_factura.length; i++) {
          this.llenarTabla(datos_factura[i], 'FCO');
        }
      });
      // Remision
      this.dtRemision.srvObtenerConsultaMov5(ot, fechaIncial, fechaFinal).subscribe(datos_remision => {
        for (let i = 0; i < datos_remision.length; i++) {
          this.llenarTabla(datos_remision[i], 'REM');
        }
      });
      // Recuperado
      this.dtRecuperado.srvObtenerConsultaMov5(ot,fechaIncial, fechaFinal).subscribe(datos_recuperado => {
        for (let i = 0; i < datos_recuperado.length; i++) {
          this.llenarTabla(datos_recuperado[i], 'RECP');
        }
      });
    } else if (ot != null && tipoDoc != null && estado != null) {
      if (tipoDoc == 'ASIGMP') {
        // Asignación de materia prima
        this.dtAsgMP.srvObtenerConsultaMov3(ot).subscribe(datos_asignacion => {
          this.consultaOTBagPro(ot);
          for (let i = 0; i < datos_asignacion.length; i++) {
            setTimeout(() => {
              this.cantRestante = this.kgOT - this.totalMPEntregada;
              if (datos_asignacion[i].estado_OrdenTrabajo == estado) this.llenarTabla(datos_asignacion[i], 'ASIGMP');
            }, 1500);
          }
        });
      }
    } else if (ot != null && tipoDoc != null && materiaPrima != null) {
      if (tipoDoc == 'ASIGMP') {
        this.dtAsgMP.srvObtenerConsultaMov2(materiaPrima, this.today).subscribe(datos_asignacion => {
          this.consultaOTBagPro(ot);
          for (let i = 0; i < datos_asignacion.length; i++) {
            setTimeout(() => {
              this.cantRestante = this.kgOT - this.totalMPEntregada;
              if (datos_asignacion[i].asigMP_OrdenTrabajo == ot) this.llenarTabla(datos_asignacion[i], 'ASIGMP');
            }, 1500);
          }
        });
      } else if (tipoDoc == 'DEVMP') {
        this.dtDevMP.srvObtenerConsultaMov1(materiaPrima, this.today).subscribe(datos_devolucion => {
          for (let i = 0; i < datos_devolucion.length; i++) {
            if (datos_devolucion[i].devMatPri_OrdenTrabajo == ot) this.llenarTabla(datos_devolucion[i], 'DEVMP');
          }
        });
      } else if (tipoDoc == 'FCO') {
        this.dtFacturaMP.srvObtenerListaMov1(materiaPrima, this.today).subscribe(datos_factura => {
          for (let i = 0; i < datos_factura.length; i++) {
            if (datos_factura[i].facco_Codigo == ot) this.llenarTabla(datos_factura[i], 'FCO');
          }
        });
      } else if (tipoDoc == 'REM') {
        this.dtRemision.srvObtenerListaMov1(materiaPrima, this.today).subscribe(datos_remision => {
          for (let i = 0; i < datos_remision.length; i++) {
            if (datos_remision[i].rem_Codigo == ot) this.llenarTabla(datos_remision[i], 'REM');
          }
        });
      } else if (tipoDoc == 'RECP') {
        this.dtRecuperado.srvObtenerConsultaMov1(materiaPrima, this.today).subscribe(datos_recuperado => {
          for (let i = 0; i < datos_recuperado.length; i++) {
            if (datos_recuperado[i].recMp_Id == ot) this.llenarTabla(datos_recuperado[i], 'RECP');
          }
        });
      }
    } else if (ot != null && tipoDoc != null && fechaIncial != null) {
      if (tipoDoc == 'ASIGMP') {
        this.dtAsgMP.srvObtenerConsultaMov3(ot).subscribe(datos_asignacion => {
          this.consultaOTBagPro(ot);
          for (let i = 0; i < datos_asignacion.length; i++) {
            setTimeout(() => {
              this.cantRestante = this.kgOT - this.totalMPEntregada;
              if (datos_asignacion[i].asigMp_FechaEntrega.replace('T00:00:00', '') == fechaIncial) this.llenarTabla(datos_asignacion[i], 'ASIGMP');
            }, 1500);
          }
        });
      } else if (tipoDoc == 'DEVMP') {
        this.dtDevMP.srvObtenerConsultaMov2(ot).subscribe(datos_devolucion => {
          for (let i = 0; i < datos_devolucion.length; i++) {
            if (datos_devolucion[i].devMatPri_Fecha.replace('T00:00:00', '') == fechaIncial) this.llenarTabla(datos_devolucion[i], 'DEVMP');
          }
        });
      } else if (tipoDoc == 'FCO') {
        this.dtFacturaMP.srvObtenerListaMov2(ot).subscribe(datos_factura => {
          for (let i = 0; i < datos_factura.length; i++) {
            if (datos_factura[i].facco_FechaFactura.replace('T00:00:00', '') == fechaIncial) this.llenarTabla(datos_factura[i], 'FCO');
          }
        });
      } else if (tipoDoc == 'REM') {
        this.dtRemision.srvObtenerListaMov2(ot).subscribe(datos_remision => {
          for (let i = 0; i < datos_remision.length; i++) {
            if (datos_remision[i].rem_Fecha.replace('T00:00:00', '') == fechaIncial) this.llenarTabla(datos_remision[i], 'REM');
          }
        });
      } else if (tipoDoc == 'RECP') {
        this.dtRecuperado.srvObtenerConsultaMov2(ot).subscribe(datos_recuperado => {
          for (let i = 0; i < datos_recuperado.length; i++) {
            if (datos_recuperado[i].recMp_FechaIngreso.replace('T00:00:00', '') == fechaIncial) this.llenarTabla(datos_recuperado[i], 'RECP');
          }
        });
      }
    } else if (fechaIncial != null && materiaPrima != null) {
      // Asignación de materia prima
      this.dtAsgMP.srvObtenerConsultaMov8(fechaIncial, fechaIncial, materiaPrima).subscribe(datos_asignacion => {
        for (let i = 0; i < datos_asignacion.length; i++) {
          this.llenarTabla(datos_asignacion[i], 'ASIGMP');
        }
      });
      // Devolución de materia prima
      this.dtDevMP.srvObtenerConsultaMov4(fechaIncial, materiaPrima).subscribe(datos_devolucion => {
        for (let i = 0; i < datos_devolucion.length; i++) {
          this.llenarTabla(datos_devolucion[i], 'DEVMP');
        }
      });
      // Entradas de materia prima
      // Factura
      this.dtFacturaMP.srvObtenerConsultaMov4(fechaIncial, materiaPrima).subscribe(datos_factura => {
        for (let i = 0; i < datos_factura.length; i++) {
          this.llenarTabla(datos_factura[i], 'FCO');
        }
      });
      // Remision
      this.dtRemision.srvObtenerConsultaMov4(fechaIncial, materiaPrima).subscribe(datos_remision => {
        for (let i = 0; i < datos_remision.length; i++) {
          this.llenarTabla(datos_remision[i], 'REM');
        }
      });
      // Recuperado
      this.dtRecuperado.srvObtenerConsultaMov4(fechaIncial, materiaPrima).subscribe(datos_recuperado => {
        for (let i = 0; i < datos_recuperado.length; i++) {
          this.llenarTabla(datos_recuperado[i], 'RECP');
        }
      });
    } else if (fechaIncial != null && fechaFinal != null) {
      // Asignación de materia prima
      this.dtAsgMP.srvObtenerConsultaMov4(fechaIncial, fechaFinal).subscribe(datos_asignacion => {
        for (let i = 0; i < datos_asignacion.length; i++) {
          this.llenarTabla(datos_asignacion[i], 'ASIGMP');
        }
      });
      // Devolución de materia prima
      this.dtDevMP.srvObtenerConsultaMov3(fechaIncial, fechaFinal).subscribe(datos_devolucion => {
        for (let i = 0; i < datos_devolucion.length; i++) {
          this.llenarTabla(datos_devolucion[i], 'DEVMP');
        }
      });
      // Entradas de materia prima
      // Factura
      this.dtFacturaMP.srvObtenerListaMov3(fechaIncial, fechaFinal).subscribe(datos_factura => {
        for (let i = 0; i < datos_factura.length; i++) {
          this.llenarTabla(datos_factura[i], 'FCO');
        }
      });
      // Remision
      this.dtRemision.srvObtenerListaMov3(fechaIncial, fechaFinal).subscribe(datos_remision => {
        for (let i = 0; i < datos_remision.length; i++) {
          this.llenarTabla(datos_remision[i], 'REM');
        }
      });
      // Recuperado
      this.dtRecuperado.srvObtenerConsultaMov3(fechaIncial, fechaFinal).subscribe(datos_recuperado => {
        for (let i = 0; i < datos_recuperado.length; i++) {
          this.llenarTabla(datos_recuperado[i], 'RECP');
        }
      });
    } else if (tipoDoc != null && materiaPrima != null) {
      if (tipoDoc == 'ASIGMP') {
        this.dtAsgMP.srvObtenerConsultaMov2(materiaPrima, this.today).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            this.llenarTabla(datos_asignacion[i], 'ASIGMP');
          }
        });
      } else if (tipoDoc == 'DEVMP') {
        this.dtDevMP.srvObtenerConsultaMov1(materiaPrima, this.today).subscribe(datos_devolucion => {
          for (let i = 0; i < datos_devolucion.length; i++) {
            this.llenarTabla(datos_devolucion[i], 'DEVMP');
          }
        });
      } else if (tipoDoc == 'FCO') {
        this.dtFacturaMP.srvObtenerListaMov1(materiaPrima, this.today).subscribe(datos_factura => {
          for (let i = 0; i < datos_factura.length; i++) {
            this.llenarTabla(datos_factura[i], 'FCO');
          }
        });
      } else if (tipoDoc == 'REM') {
        this.dtRemision.srvObtenerListaMov1(materiaPrima, this.today).subscribe(datos_remision => {
          for (let i = 0; i < datos_remision.length; i++) {
            this.llenarTabla(datos_remision[i], 'REM');
          }
        });
      } else if (tipoDoc == 'RECP') {
        this.dtRecuperado.srvObtenerConsultaMov1(materiaPrima, this.today).subscribe(datos_recuperado => {
          for (let i = 0; i < datos_recuperado.length; i++) {
            this.llenarTabla(datos_recuperado[i], 'RECP');
          }
        });
      }
    } else if (tipoDoc != null && fechaIncial != null) {
      if (tipoDoc == 'ASIGMP') {
        this.dtAsgMP.srvObtenerConsultaMov0(fechaIncial).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            this.llenarTabla(datos_asignacion[i], 'ASIGMP');
          }
        });
      } else if (tipoDoc == 'DEVMP') {
        this.dtDevMP.srvObtenerConsultaMov0(fechaIncial).subscribe(datos_devolucion => {
          for (let i = 0; i < datos_devolucion.length; i++) {
            this.llenarTabla(datos_devolucion[i], 'DEVMP');
          }
        });
      } else if (tipoDoc == 'FCO') {
        this.dtFacturaMP.srvObtenerListaMov0(fechaIncial).subscribe(datos_factura => {
          for (let i = 0; i < datos_factura.length; i++) {
            this.llenarTabla(datos_factura[i], 'FCO');
          }
        });
      } else if (tipoDoc == 'REM') {
        this.dtRemision.srvObtenerListaMov0(fechaIncial).subscribe(datos_remision => {
          for (let i = 0; i < datos_remision.length; i++) {
            this.llenarTabla(datos_remision[i], 'REM');
          }
        });
      } else if (tipoDoc == 'RECP') {
        this.dtRecuperado.srvObtenerConsultaMov0(fechaIncial).subscribe(datos_recuperado => {
          for (let i = 0; i < datos_recuperado.length; i++) {
            this.llenarTabla(datos_recuperado[i], 'RECP');
          }
        });
      }
    } else if (ot != null && estado != null) {
      // Asignación de materia prima
      this.dtAsgMP.srvObtenerConsultaMov3(ot).subscribe(datos_asignacion => {
        this.consultaOTBagPro(ot);
        for (let i = 0; i < datos_asignacion.length; i++) {
          setTimeout(() => {
            this.cantRestante = this.kgOT - this.totalMPEntregada;
            if (datos_asignacion[i].estado_OrdenTrabajo == estado) this.llenarTabla(datos_asignacion[i], 'ASIGMP');
          }, 1500);
        }
      });
    } else if (ot != null && materiaPrima != null) {
      // Asignación de materia prima
      this.dtAsgMP.srvObtenerConsultaMov3(ot).subscribe(datos_asignacion => {
        this.consultaOTBagPro(ot);
        for (let i = 0; i < datos_asignacion.length; i++) {
          setTimeout(() => {
            this.cantRestante = this.kgOT - this.totalMPEntregada;
            if (datos_asignacion[i].matPri_Id == materiaPrima) this.llenarTabla(datos_asignacion[i], 'ASIGMP');
          }, 1500);
        }
      });
      // Devolución de materia prima
      this.dtDevMP.srvObtenerConsultaMov2(ot).subscribe(datos_devolucion => {
        for (let i = 0; i < datos_devolucion.length; i++) {
          if (datos_devolucion[i].matPri_Id == materiaPrima) this.llenarTabla(datos_devolucion[i], 'DEVMP');
        }
      });
      // Entradas de materia prima
      // Factura
      this.dtFacturaMP.srvObtenerListaMov2(ot).subscribe(datos_factura => {
        for (let i = 0; i < datos_factura.length; i++) {
          if (datos_factura[i].matPri_Id == materiaPrima) this.llenarTabla(datos_factura[i], 'FCO');
        }
      });
      // Remision
      this.dtRemision.srvObtenerListaMov2(ot).subscribe(datos_remision => {
        for (let i = 0; i < datos_remision.length; i++) {
          if (datos_remision[i].matPri_Id == materiaPrima) this.llenarTabla(datos_remision[i], 'REM');
        }
      });
      // Recuperado
      this.dtRecuperado.srvObtenerConsultaMov2(ot).subscribe(datos_recuperado => {
        for (let i = 0; i < datos_recuperado.length; i++) {
          if (datos_recuperado[i].matPri_Id == materiaPrima) this.llenarTabla(datos_recuperado[i], 'RECP');
        }
      });
    } else if (ot != null && fechaIncial != null) {
      // Asignación de materia prima
      this.dtAsgMP.srvObtenerConsultaMov3(ot).subscribe(datos_asignacion => {
        this.consultaOTBagPro(ot);
        for (let i = 0; i < datos_asignacion.length; i++) {
          setTimeout(() => {
            this.cantRestante = this.kgOT - this.totalMPEntregada;
            if (datos_asignacion[i].asigMp_FechaEntrega.replace('T00:00:00','') == fechaIncial) this.llenarTabla(datos_asignacion[i], 'ASIGMP');
          }, 1500);
        }
      });
      // Devolución de materia prima
      this.dtDevMP.srvObtenerConsultaMov2(ot).subscribe(datos_devolucion => {
        for (let i = 0; i < datos_devolucion.length; i++) {
          if (datos_devolucion[i].devMatPri_Fecha.replace('T00:00:00', '') == fechaIncial) this.llenarTabla(datos_devolucion[i], 'DEVMP');
        }
      });
      // Entradas de materia prima
      // Factura
      this.dtFacturaMP.srvObtenerListaMov2(ot).subscribe(datos_factura => {
        for (let i = 0; i < datos_factura.length; i++) {
          if (datos_factura[i].facco_FechaFactura.replace('T00:00:00', '') == fechaIncial) this.llenarTabla(datos_factura[i], 'FCO');
        }
      });
      // Remision
      this.dtRemision.srvObtenerListaMov2(ot).subscribe(datos_remision => {
        for (let i = 0; i < datos_remision.length; i++) {
          if (datos_remision[i].rem_Fecha.replace('T00:00:00', '') == fechaIncial) this.llenarTabla(datos_remision[i], 'REM');
        }
      });
      // Recuperado
      this.dtRecuperado.srvObtenerConsultaMov2(ot).subscribe(datos_recuperado => {
        for (let i = 0; i < datos_recuperado.length; i++) {
          if (datos_recuperado[i].recMp_FechaIngreso.replace('T00:00:00', '') == fechaIncial) this.llenarTabla(datos_recuperado[i], 'RECP');
        }
      });
    } else if (ot != null && tipoDoc != null) {
      if (tipoDoc == 'ASIGMP') {
        this.dtAsgMP.srvObtenerConsultaMov3(ot).subscribe(datos_asignacion => {
          this.consultaOTBagPro(ot);
          for (let i = 0; i < datos_asignacion.length; i++) {
            setTimeout(() => {
              this.cantRestante = this.kgOT - this.totalMPEntregada;
              this.llenarTabla(datos_asignacion[i], 'ASIGMP');
            }, 1500);
          }
        });
      } else if (tipoDoc == 'DEVMP') {
        this.dtDevMP.srvObtenerConsultaMov2(ot).subscribe(datos_devolucion => {
          for (let i = 0; i < datos_devolucion.length; i++) {
            this.llenarTabla(datos_devolucion[i], 'DEVMP');
          }
        });
      } else if (tipoDoc == 'FCO') {
        this.dtFacturaMP.srvObtenerListaMov2(ot).subscribe(datos_factura => {
          for (let i = 0; i < datos_factura.length; i++) {
            this.llenarTabla(datos_factura[i], 'FCO');
          }
        });
      } else if (tipoDoc == 'REM') {
        this.dtRemision.srvObtenerListaMov2(ot).subscribe(datos_remision => {
          for (let i = 0; i < datos_remision.length; i++) {
            this.llenarTabla(datos_remision[i], 'REM');
          }
        });
      } else if (tipoDoc == 'RECP') {
        this.dtRecuperado.srvObtenerConsultaMov2(ot).subscribe(datos_recuperado => {
          for (let i = 0; i < datos_recuperado.length; i++) {
            this.llenarTabla(datos_recuperado[i], 'RECP');
          }
        });
      }
    } else if (ot != null) {
      // Asignación de materia prima
      this.dtAsgMP.srvObtenerConsultaMov3(ot).subscribe(datos_asignacion => {
        this.consultaOTBagPro(ot);
        for (let i = 0; i < datos_asignacion.length; i++) {
          setTimeout(() => {
            this.cantRestante = this.kgOT - this.totalMPEntregada;
            this.llenarTabla(datos_asignacion[i], 'ASIGMP');
          }, 2000);
        }
      });
      // Devolución de materia prima
      this.dtDevMP.srvObtenerConsultaMov2(ot).subscribe(datos_devolucion => {
        for (let i = 0; i < datos_devolucion.length; i++) {
          this.llenarTabla(datos_devolucion[i], 'DEVMP');
        }
      });
      // Entradas de materia prima
      // Factura
      this.dtFacturaMP.srvObtenerListaMov2(ot).subscribe(datos_factura => {
        for (let i = 0; i < datos_factura.length; i++) {
          this.llenarTabla(datos_factura[i], 'FCO');
        }
      });
      // Remision
      this.dtRemision.srvObtenerListaMov2(ot).subscribe(datos_remision => {
        for (let i = 0; i < datos_remision.length; i++) {
          this.llenarTabla(datos_remision[i], 'REM');
        }
      });
      // Recuperado
      this.dtRecuperado.srvObtenerConsultaMov2(ot).subscribe(datos_recuperado => {
        for (let i = 0; i < datos_recuperado.length; i++) {
          this.llenarTabla(datos_recuperado[i], 'RECP');
        }
      });
    } else if (tipoDoc != null) {
      if (tipoDoc == 'ASIGMP') {
        this.dtAsgMP.srvObtenerConsultaMov0(this.today).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            this.llenarTabla(datos_asignacion[i], 'ASIGMP');
          }
        });
      } else if (tipoDoc == 'DEVMP') {
        this.dtDevMP.srvObtenerConsultaMov0(this.today).subscribe(datos_devolucion => {
          for (let i = 0; i < datos_devolucion.length; i++) {
            this.llenarTabla(datos_devolucion[i], 'DEVMP');
          }
        });
      } else if (tipoDoc == 'FCO') {
        this.dtFacturaMP.srvObtenerListaMov0(this.today).subscribe(datos_factura => {
          for (let i = 0; i < datos_factura.length; i++) {
            this.llenarTabla(datos_factura[i], 'FCO');
          }
        });
      } else if (tipoDoc == 'REM') {
        this.dtRemision.srvObtenerListaMov0(this.today).subscribe(datos_remision => {
          for (let i = 0; i < datos_remision.length; i++) {
            this.llenarTabla(datos_remision[i], 'REM');
          }
        });
      } else if (tipoDoc == 'RECP') {
        this.dtRecuperado.srvObtenerConsultaMov0(this.today).subscribe(datos_recuperado => {
          for (let i = 0; i < datos_recuperado.length; i++) {
            this.llenarTabla(datos_recuperado[i], 'RECP');
          }
        });
      }
    } else if (fechaIncial != null) {
      // Asignación de materia prima
      this.dtAsgMP.srvObtenerConsultaMov0(fechaIncial).subscribe(datos_asignacion => {
        for (let i = 0; i < datos_asignacion.length; i++) {
          this.llenarTabla(datos_asignacion[i], 'ASIGMP');
        }
      });
      // Devolución de materia prima
      this.dtDevMP.srvObtenerConsultaMov0(fechaIncial).subscribe(datos_devolucion => {
        for (let i = 0; i < datos_devolucion.length; i++) {
          this.llenarTabla(datos_devolucion[i], 'DEVMP');
        }
      });
      // Entradas de materia prima
      // Factura
      this.dtFacturaMP.srvObtenerListaMov0(fechaIncial).subscribe(datos_factura => {
        for (let i = 0; i < datos_factura.length; i++) {
          this.llenarTabla(datos_factura[i], 'FCO');
        }
      });
      // Remision
      this.dtRemision.srvObtenerListaMov0(fechaIncial).subscribe(datos_remision => {
        for (let i = 0; i < datos_remision.length; i++) {
          this.llenarTabla(datos_remision[i], 'REM');
        }
      });
      // Recuperado
      this.dtRecuperado.srvObtenerConsultaMov0(fechaIncial).subscribe(datos_recuperado => {
        for (let i = 0; i < datos_recuperado.length; i++) {
          this.llenarTabla(datos_recuperado[i], 'RECP');
        }
      });
    } else if (materiaPrima != null) {
      // Asignación de materia prima
      this.dtAsgMP.srvObtenerConsultaMov2(materiaPrima, this.today).subscribe(datos_asignacion => {
        for (let i = 0; i < datos_asignacion.length; i++) {
          this.llenarTabla(datos_asignacion[i], 'ASIGMP');
        }
      });
      // Devolución de materia prima
      this.dtDevMP.srvObtenerConsultaMov1(materiaPrima, this.today).subscribe(datos_devolucion => {
        for (let i = 0; i < datos_devolucion.length; i++) {
          this.llenarTabla(datos_devolucion[i], 'DEVMP');
        }
      });
      // Entradas de materia prima
      // Factura
      this.dtFacturaMP.srvObtenerListaMov1(materiaPrima, this.today).subscribe(datos_factura => {
        for (let i = 0; i < datos_factura.length; i++) {
          this.llenarTabla(datos_factura[i], 'FCO');
        }
      });
      // Remision
      this.dtRemision.srvObtenerListaMov1(materiaPrima, this.today).subscribe(datos_remision => {
        for (let i = 0; i < datos_remision.length; i++) {
          this.llenarTabla(datos_remision[i], 'REM');
        }
      });
      // Recuperado
      this.dtRecuperado.srvObtenerConsultaMov1(materiaPrima, this.today).subscribe(datos_recuperado => {
        for (let i = 0; i < datos_recuperado.length; i++) {
          this.llenarTabla(datos_recuperado[i], 'RECP');
        }
      });
    } else if (estado != null) {
      // Asignacion de materia prima
      this.dtAsgMP.srvObtenerConsultaMov1(estado).subscribe(datos_asignacion => {
        for (let i = 0; i < datos_asignacion.length; i++) {
          this.llenarTabla(datos_asignacion[i], 'ASIGMP');
        }
      });
    } else {
      // Asignación de materia prima
      this.dtAsgMP.srvObtenerConsultaMov0(this.today).subscribe(datos_asignacion => {
        for (let i = 0; i < datos_asignacion.length; i++) {
          this.llenarTabla(datos_asignacion[i], 'ASIGMP');
        }
      });
      // Devolución de materia prima
      this.dtDevMP.srvObtenerConsultaMov0(this.today).subscribe(datos_devolucion => {
        for (let i = 0; i < datos_devolucion.length; i++) {
          this.llenarTabla(datos_devolucion[i], 'DEVMP');
        }
      });
      // Entradas de materia prima
      // Factura
      this.dtFacturaMP.srvObtenerListaMov0(this.today).subscribe(datos_factura => {
        for (let i = 0; i < datos_factura.length; i++) {
          this.llenarTabla(datos_factura[i], 'FCO');
        }
      });
      // Remision
      this.dtRemision.srvObtenerListaMov0(this.today).subscribe(datos_remision => {
        for (let i = 0; i < datos_remision.length; i++) {
          this.llenarTabla(datos_remision[i], 'REM');
        }
      });
      // Recuperado
      this.dtRecuperado.srvObtenerConsultaMov0(this.today).subscribe(datos_recuperado => {
        for (let i = 0; i < datos_recuperado.length; i++) {
          this.llenarTabla(datos_recuperado[i], 'RECP');
        }
      });
    }
    setTimeout(() => { this.load = true; }, 3000);
  }

  // Funcion para llenar la tabla con la informcion consultada
  llenarTabla(datos : any, tipoDoc : any){
    if (tipoDoc == 'ASIGMP') {
      let info : any = {
        ot : datos.asigMP_OrdenTrabajo,
        tipoId : 'ASIGMP',
        tipo : 'Asignación de Materia Prima',
        fecha : datos.asigMp_FechaEntrega,
        usuario : datos.usua_Nombre,
        matPrima : datos.matPri_Nombre,
        cant : datos.dtAsigMp_Cantidad,
        estado : datos.estado_Nombre,
      }
      this.ArrayInfoConsulta.push(info);
    } else if (tipoDoc == 'DEVMP') {
      let info : any = {
        ot : datos.devMatPri_OrdenTrabajo,
        tipoId : 'DEVMP',
        tipo : 'Devolución de Materia Prima',
        fecha : datos.devMatPri_Fecha,
        usuario : datos.usua_Nombre,
        matPrima : datos.matPri_Nombre,
        cant : datos.dtDevMatPri_CantidadDevuelta,
        estado : '',
      }
      this.ArrayInfoConsulta.push(info);
    } else if (tipoDoc == 'FCO') {
      if (datos.matPri_Nombre != 'NO APLICA') {
        let info : any = {
          ot : datos.facco_Codigo,
          tipoId : 'FCO',
          tipo : 'Factura de compra de MP',
          fecha : datos.facco_FechaFactura,
          usuario : datos.usua_Nombre,
          matPrima : datos.matPri_Nombre,
          cant : datos.faccoMatPri_Cantidad,
          estado : '',
        }
        this.ArrayInfoConsulta.push(info);
      }
    } else if (tipoDoc == 'REM') {
      if (datos.matPri_Nombre != 'NO APLICA') {
        let info : any = {
          ot : datos.rem_Codigo,
          tipoId : 'REM',
          tipo : 'Remisión de MP',
          fecha : datos.rem_Fecha,
          usuario : datos.usua_Nombre,
          matPrima : datos.matPri_Nombre,
          cant : datos.remiMatPri_Cantidad,
          estado : '',
        }
        this.ArrayInfoConsulta.push(info);
      }
    } else if (tipoDoc == 'RECP') {
      let info : any = {
        ot : datos.recMp_Id,
        tipoId : 'RECP',
        tipo : 'Recuperado',
        fecha : datos.recMp_FechaIngreso,
        usuario : datos.usua_Nombre,
        matPrima : datos.matPri_Nombre,
        cant : datos.recMatPri_Cantidad,
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
    if (data.tipoId == 'ASIGMP') {
      this.dtAsgMP.srvObtenerListaPorOT(data.ot).subscribe(datos_asignacion => {
        for (let i = 0; i < datos_asignacion.length; i++) {
          let items : any = {
            Id : datos_asignacion[i].matPri_Id,
            Nombre : datos_asignacion[i].matPri_Nombre,
            Cant : this.formatonumeros(datos_asignacion[i].sum),
            UndCant : datos_asignacion[i].undMed_Id,
          }
          this.ArrayMpPDF.push(items);
        }
        setTimeout(() => { this.verPDF(data); }, 2000);
      });
    } else if (data.tipoId == 'DEVMP') {
      this.dtDevMP.srvObtenerpdfMovimientos(data.ot).subscribe(datos_devolucion => {
        for (let i = 0; i < datos_devolucion.length; i++) {
          let items : any = {
            Id : datos_devolucion[i].matPri_Id,
            Nombre : datos_devolucion[i].matPri_Nombre,
            Cant : this.formatonumeros(datos_devolucion[i].dtDevMatPri_CantidadDevuelta),
            UndCant : datos_devolucion[i].undMed_Id,
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
            UndCant : datos_factura[i].undMed_Id,
            PrecioUnd : this.formatonumeros(datos_factura[i].faccoMatPri_ValorUnitario),
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
            UndCant : datos_remision[i].undMed_Id,
            PrecioUnd : this.formatonumeros(datos_remision[i].remiMatPri_ValorUnitario),
            SubTotal : this.formatonumeros(datos_remision[i].remiMatPri_Cantidad * datos_remision[i].remiMatPri_ValorUnitario),
          }
          this.ArrayMpPDF.push(items);
        }
        setTimeout(() => { this.verPDF(data); }, 2000);
      });
    } else if (data.tipoId == 'RECP') {
      this.dtRecuperado.srvObtenerpdfMovimientos(data.ot).subscribe(datos_recuperado => {
        for (let i = 0; i < datos_recuperado.length; i++) {
          let items : any = {
            Id : datos_recuperado[i].matPri_Id,
            Nombre : datos_recuperado[i].matPri_Nombre,
            Cant : this.formatonumeros(datos_recuperado[i].recMatPri_Cantidad),
            UndCant : datos_recuperado[i].undMed_Id,
          }
          this.ArrayMpPDF.push(items);
        }
        setTimeout(() => { this.verPDF(data); }, 2000);
      });
    }
  }

  // Funcion que permitirá ver la informacion del documento en un formato PDF
  verPDF(data : any){
    if (data.tipoId == 'ASIGMP') {
      this.dtAsgMP.srvObtenerpdfMovimientos(data.ot).subscribe(datos_asignacion => {
        for (let i = 0; i < datos_asignacion.length; i++) {
          for (let j = 0; j < this.ArrayMpPDF.length; j++) {
            const pdfDefinicion : any = {
              info: {
                title: `${datos_asignacion[i].asigMp_Id}`
              },
              content : [
                {
                  columns: [
                    {
                      image : this.appComponent.logoParaPdf,
                      width : 100,
                      height : 80
                    },
                    {
                      text: `Plasticaribe S.A.S ---- Asignación de Materia Prima`,
                      alignment: 'center',
                      style: 'titulo',
                      margin: 30
                    }
                  ]
                },
                '\n \n',
                {
                  text: `Fecha de registro: ${datos_asignacion[i].asigMp_FechaEntrega.replace('T00:00:00', '')}`,
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
                  style: 'header'
                },
                {
                  style: 'tablaCliente',
                  table: {
                    widths: ['*', '*', '*'],
                    style: 'header',
                    body: [
                      [
                        `OT: ${datos_asignacion[i].asigMP_OrdenTrabajo}`,
                        `Maquina: ${datos_asignacion[i].asigMp_Maquina}`,
                        `Proceso : ${datos_asignacion[i].proceso_Nombre}`
                      ]
                    ]
                  },
                  layout: 'lightHorizontalLines',
                  fontSize: 12,
                },
                {
                  text: `\n \nObervación sobre la remisión: \n ${datos_asignacion[i].asigMp_Observacion}\n`,
                  style: 'header',
                },
                {
                  text: `\n Información detallada de Materia(s) Prima(s) asignada(s) \n `,
                  alignment: 'center',
                  style: 'header'
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
    } else if (data.tipoId == 'DEVMP') {
      this.dtDevMP.srvObtenerpdfMovimientos(data.ot).subscribe(datos_devolucion => {
        for (let i = 0; i < datos_devolucion.length; i++) {
          for (let j = 0; j < this.ArrayMpPDF.length; j++) {
            const pdfDefinicion : any = {
              info: {
                title: `${datos_devolucion[i].devMatPri_OrdenTrabajo}`
              },
              content : [
                {
                  columns: [
                    {
                      image : this.appComponent.logoParaPdf,
                      width : 100,
                      height : 80
                    },
                    {
                      text: `Plasticaribe S.A.S ---- Devolución de Materia Prima`,
                      alignment: 'center',
                      style: 'titulo',
                      margin: 30
                    }
                  ]
                },
                '\n \n',
                {
                  text: `Fecha de registro: ${datos_devolucion[i].devMatPri_Fecha.replace('T00:00:00', '')}`,
                  style: 'header',
                  alignment: 'right',
                },
                {
                  text: `Registrado Por: ${datos_devolucion[i].usua_Nombre}\n`,
                  alignment: 'right',
                  style: 'header',
                },
                {
                  text: `\n Información la Asignación \n \n`,
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
                        `Orden de Trabajo: ${datos_devolucion[i].devMatPri_OrdenTrabajo}`,
                        ``,
                        ``
                      ]
                    ]
                  },
                  layout: 'lightHorizontalLines',
                  fontSize: 9,
                },
                {
                  text: `\n \nObervación sobre la remisión: \n ${datos_devolucion[i].devMatPri_Motivo}\n`,
                  style: 'header',
                },
                {
                  text: `\n Información detallada de Materia(s) Prima(s) asignada(s) \n `,
                  alignment: 'center',
                  style: 'header'
                },

                this.tableAsignacion(this.ArrayMpPDF, ['Id', 'Nombre', 'Cant', 'UndCant']),
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
              content : [
                {
                  columns: [
                    {
                      image : this.appComponent.logoParaPdf,
                      width : 100,
                      height : 80
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

                this.table(this.ArrayMpPDF, ['Id', 'Nombre', 'Cant', 'UndCant', 'PrecioUnd', 'SubTotal']),

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
              content : [
                {
                  columns: [
                    {
                      image : this.appComponent.logoParaPdf,
                      width : 100,
                      height : 80
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

                this.table(this.ArrayMpPDF, ['Id', 'Nombre', 'Cant', 'UndCant', 'PrecioUnd', 'SubTotal']),
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
    } else if (data.tipoId == 'RECP') {
      this.dtRecuperado.srvObtenerpdfMovimientos(data.ot).subscribe(datos_recuperado => {
        for (let i = 0; i < datos_recuperado.length; i++) {
          for (let j = 0; j < this.ArrayMpPDF.length; j++) {
            const pdfDefinicion : any = {
              info: {
                title: `${datos_recuperado[i].recMp_Id}`
              },
              content : [
                {
                  columns: [
                    {
                      image : this.appComponent.logoParaPdf,
                      width : 100,
                      height : 80
                    },
                    {
                      text: `Plasticaribe S.A.S ---- Recuperado de Materia Prima`,
                      alignment: 'center',
                      style: 'titulo',
                      margin: 30
                    }
                  ]
                },
                '\n \n',
                {
                  text: `Fecha de registro: ${datos_recuperado[i]}`,
                  style: 'header',
                  alignment: 'right',
                },
                {
                  text: `Registrado Por: ${datos_recuperado[i].usua_Nombre}\n`,
                  alignment: 'right',
                  style: 'header',
                },
                {
                  text: `\n Información la Asignación \n \n`,
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
                        `Proceso: ${datos_recuperado[i].proceso_Nombre}`,
                        ``,
                        ``
                      ]
                    ]
                  },
                  layout: 'lightHorizontalLines',
                  fontSize: 9,
                },
                {
                  text: `\n \nObervación sobre la remisión: \n ${datos_recuperado[i].recMp_Observacion}\n`,
                  style: 'header',
                },
                {
                  text: `\n Información detallada de Materia(s) Prima(s) asignada(s) \n `,
                  alignment: 'center',
                  style: 'header'
                },

                this.tableAsignacion(this.ArrayMpPDF, ['Id', 'Nombre', 'Cant', 'UndCant']),
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
