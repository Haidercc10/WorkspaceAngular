import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { BagproService } from 'src/app/Servicios/Bagpro.service';
import { DetallesAsignacionService } from 'src/app/Servicios/detallesAsignacion.service';
import { DevolucionesMPService } from 'src/app/Servicios/devolucionesMP.service';
import { EstadosService } from 'src/app/Servicios/estados.service';
import { FacturaMpService } from 'src/app/Servicios/facturaMp.service';
import { MateriaPrimaService } from 'src/app/Servicios/materiaPrima.service';
import { RecuperadoMPService } from 'src/app/Servicios/recuperadoMP.service';
import { RemisionesMPService } from 'src/app/Servicios/remisionesMP.service';
import { RolesService } from 'src/app/Servicios/roles.service';
import { TipoDocumentoService } from 'src/app/Servicios/tipoDocumento.service';

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
  today : any = new Date(); //Variable que se usará para llenar la fecha actual
  titulosTabla = []; //Variable que almacenará los titulos de la tabla de productos que se ve al final de la vista
  ArrayInfoConsulta : any [] = []; //Variable que tendrá la informacion de los resultados de la consulta realizada
  valorTotal : number = 0; //Variable que guardará el valor total de la factura de entrada de materia prima
  totalMPEntregada = 0; //Vairble que almacenará la cantidad de materia prima entregada para una orden de trabajo
  cantRestante : number = 0; //Variable que tendrá la cantidad de kilos de materia prima que hacen falta por entregar pára una orden de trabajo
  kgProduciodosOT : number = 0; //Variable que almacenará la cantidad de kilos producidos por una orden de trabajo
  estadoOt : string = ''; //Variable que almacenará el estado de la orden de trabajo (Abierta, Asignada, En proceso, Terminada o Finalizada)
  cantidadTotalSella : number = 0; //Variable que va a almacenar el total de la cantidad sellada en una OT
  cantidadTotalEmpaque : number = 0; //Variable que va a almacenar el total de la cantidad empacada en una OT
  cantidadTotalWiketiado : number = 0; //Variable que va a almacenar el total de la cantidad cantidad Tota wiketeada en una OT
  cantidadTotalKgOT = 0; //Variable que almacenará la cantidad de kilos que pidió una orden de trabajo
  ArrayEstados : any = []; //Variable en la que se almacenaran los estados que puede tener una orden de trabajo
  kgOT : number = 0; //Variable que va a almacenar la cantidad total de kilos que se estipularon para una orden de trabajo

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
                                    private dtRecuperado : RecuperadoMPService,) {

    this.FormDocumentos = this.frmBuilderMateriaPrima.group({
      idDocumento : [null, Validators.required],
      TipoDocumento: [null, Validators.required],
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
    this.fecha();
    this.obtenerMateriasPrimas();
    this.obtenerTipoDocumento();
    this.obtenerEstados();
  }

  //
  selectEventMp(item) {
    this.FormDocumentos.value.materiaPrima = item.matPri_Id;
    if (this.FormDocumentos.value.materiaPrima != '') this.validarInputMp = false;
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
      materiaPrima : '',
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
      }
    });
  }

  //Funcion para obtener los diferentes tipos de documentos que podemos encontrar
  obtenerTipoDocumento(){
    this.tipoDocuemntoService.srvObtenerLista().subscribe(datos_tiposDocumentos => {
      for (let index = 0; index < datos_tiposDocumentos.length; index++) {
        this.tipoDocumento.push(datos_tiposDocumentos[index])
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
  }

  // Funcion que va a consultar por cada la combinacion de filtro que se le idequen
  consultar(){
    this.load = false;
    this.kgOT = 0;
    this.ArrayInfoConsulta = [];
    this.kgProduciodosOT = 0;
    this.cantRestante = 0;
    this.estadoOt = '';
    let ot : number = this.FormDocumentos.value.idDocumento;
    let tipoDoc : string = this.FormDocumentos.value.TipoDocumento;
    let fechaIncial : any = this.FormDocumentos.value.fecha;
    let fechaFinal : any = this.FormDocumentos.value.fechaFinal;
    let materiaPrima : any;
    if (this.FormDocumentos.value.materiaPrima.matPri_Id == undefined) materiaPrima = null;
    else materiaPrima = this.FormDocumentos.value.materiaPrima.matPri_Id;
    let estado : any = this.FormDocumentos.value.estado;

    if (ot != null && tipoDoc != null && fechaIncial != null && fechaFinal != null && materiaPrima != null && estado != null) {
      if (tipoDoc == 'ASIGMP') {
        this.consultaOTBagPro(ot);
        this.dtAsgMP.srvObtenerConsultaMov10(ot, fechaIncial, fechaFinal, materiaPrima, estado).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            this.dtAsgMP.srvObtenerListaPorAsigId(datos_asignacion[i].asigMp_Id).subscribe(datos_asig => {
              for (let j = 0; j < datos_asig.length; j++) {
                this.totalMPEntregada += datos_asig[j].dtAsigMp_Cantidad;
              }
            });
            setTimeout(() => {
              this.cantRestante = this.kgOT - this.totalMPEntregada;
              this.llenarTabla(datos_asignacion[i], tipoDoc);
            }, 1200);
          }
        });
      }
    } else if (ot != null && tipoDoc != null && fechaIncial != null && fechaFinal != null && materiaPrima != null) {
      if (tipoDoc == 'ASIGMP') {
        this.consultaOTBagPro(ot);
        this.dtAsgMP.srvObtenerConsultaMov20(ot, fechaIncial, fechaFinal, materiaPrima).subscribe(datos_asignacion => {
          for (let i = 0; i < datos_asignacion.length; i++) {
            this.dtAsgMP.srvObtenerListaPorAsigId(datos_asignacion[i].asigMp_Id).subscribe(datos_asig => {
              for (let j = 0; j < datos_asig.length; j++) {
                this.totalMPEntregada += datos_asig[j].dtAsigMp_Cantidad;
              }
            });
            setTimeout(() => {
              this.cantRestante = this.kgOT - this.totalMPEntregada;
              this.llenarTabla(datos_asignacion[i], tipoDoc);
            }, 1200);
          }
        });
      } else if (tipoDoc == 'DEVMP') {
        this.dtDevMP.srvObtenerConsultaMov10(ot, fechaIncial, fechaFinal, materiaPrima).subscribe(datos_devolucion => {
          for (let i = 0; i < datos_devolucion.length; i++) {
            this.llenarTabla(datos_devolucion[i], 'DEVMP');
          }
        });
      }
    } else if (ot != null && tipoDoc != null && fechaIncial != null && fechaFinal != null && estado != null) {

    } else if (ot != null && fechaIncial != null && fechaFinal != null && materiaPrima != null && estado != null) {

    } else if (ot != null && tipoDoc != null && fechaIncial != null && materiaPrima != null && estado != null) {

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
        for (let i = 0; i < datos_asignacion.length; i++) {
          if (datos_asignacion[i].estado_OrdenTrabajo == estado) this.llenarTabla(datos_asignacion[i], 'ASIGMP');
        }
      });
    } else if (ot != null && materiaPrima != null) {
      // Asignación de materia prima
      this.dtAsgMP.srvObtenerConsultaMov3(ot).subscribe(datos_asignacion => {
        for (let i = 0; i < datos_asignacion.length; i++) {
          if (datos_asignacion[i].matPri_Id == materiaPrima) this.llenarTabla(datos_asignacion[i], 'ASIGMP');
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
        for (let i = 0; i < datos_asignacion.length; i++) {
          if (datos_asignacion[i].asigMp_FechaEntrega.replace('T00:00:00','') == fechaIncial) this.llenarTabla(datos_asignacion[i], 'ASIGMP');
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
          for (let i = 0; i < datos_asignacion.length; i++) {
            this.llenarTabla(datos_asignacion[i], 'ASIGMP');
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
        for (let i = 0; i < datos_asignacion.length; i++) {
          this.llenarTabla(datos_asignacion[i], 'ASIGMP');
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
        tipo : 'Asignación Materia Prima',
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
        tipo : 'Devolución de Materia Prima',
        fecha : datos.devMatPri_Fecha,
        usuario : datos.usua_Nombre,
        matPrima : datos.matPri_Nombre,
        cant : datos.dtDevMatPri_CantidadDevuelta,
        estado : '',
      }
      this.ArrayInfoConsulta.push(info);
    } else if (tipoDoc == 'FCO') {
      let info : any = {
        ot : datos.facco_Codigo,
        tipo : 'Factura de compra de MP',
        fecha : datos.facco_FechaFactura,
        usuario : datos.usua_Nombre,
        matPrima : datos.matPri_Nombre,
        cant : datos.faccoMatPri_Cantidad,
        estado : '',
      }
      this.ArrayInfoConsulta.push(info);
    } else if (tipoDoc == 'REM') {
      let info : any = {
        ot : datos.rem_Codigo,
        tipo : 'Remisión de MP',
        fecha : datos.rem_Fecha,
        usuario : datos.usua_Nombre,
        matPrima : datos.matPri_Nombre,
        cant : datos.remiMatPri_Cantidad,
        estado : '',
      }
      this.ArrayInfoConsulta.push(info);
    } else if (tipoDoc == 'RECP') {
      let info : any = {
        ot : datos.recMp_Id,
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
}
