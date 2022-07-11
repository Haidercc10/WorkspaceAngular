import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import pdfMake from 'pdfmake/build/pdfmake';
import { AsignacionMPService } from 'src/app/Servicios/asignacionMP.service';
import { BagproService } from 'src/app/Servicios/Bagpro.service';
import { CategoriaMateriaPrimaService } from 'src/app/Servicios/categoriaMateriaPrima.service';
import { DetallesAsignacionService } from 'src/app/Servicios/detallesAsignacion.service';
import { FacturaMpService } from 'src/app/Servicios/facturaMp.service';
import { FactuaMpCompradaService } from 'src/app/Servicios/facturaMpComprada.service';
import { InventInicialDiaService } from 'src/app/Servicios/inventInicialDia.service';
import { MateriaPrimaService } from 'src/app/Servicios/materiaPrima.service';
import { ProveedorService } from 'src/app/Servicios/proveedor.service';
import { RecuperadoService } from 'src/app/Servicios/recuperado.service';
import { RecuperadoMPService } from 'src/app/Servicios/recuperadoMP.service';
import { RemisionService } from 'src/app/Servicios/Remision.service';
import { RemisionesMPService } from 'src/app/Servicios/remisionesMP.service';
import { RemisionFacturaService } from 'src/app/Servicios/remisionFactura.service';
import { RolesService } from 'src/app/Servicios/roles.service';
import { TipoBodegaService } from 'src/app/Servicios/tipoBodega.service';
import { TipoDocumentoService } from 'src/app/Servicios/tipoDocumento.service';
import { UsuarioService } from 'src/app/Servicios/usuario.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-movimientoMP',
  templateUrl: './movimientoMP.component.html',
  styleUrls: ['./movimientoMP.component.css']
})
export class MovimientoMPComponent implements OnInit {

  public FormDocumentos !: FormGroup;

  //Llamar modales, inicializados como falsos para que no se carguen al ingresar a la pagina.
  public ModalCrearProveedor: boolean = false;
  public ModalCrearMateriaPrima: boolean= false;

  /* Vaiables*/
  public page : number; //Variable que tendrá el paginado de la tabla en la que se muestran los pedidos consultados
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  ultimoIdMateriaPrima : number; //Varibale que va a almacenar el id de la ultima materia prima registrada y le va a sumar 1
  materiasPrimas = []; //Variable que va almacenar el nombre de todas las materias primas existentes en la empresa
  materiasPrimasRetiradas = []; //Variable que va almacenar el nombre de todas las materias primas existentes en la empresa
  nombreCategoriasMP = []; //VAriable que va a almacenar el nombre de todas las categorias de materias primas existentes en la empresa
  unidadMedida = []; //Varibale que va a almacenar las unidades de medida registradas en la base de datos
  usuarios = []; //Variable que va a almacenar todos los usuarios de la empresa
  estado = []; //Variable que va a almacenar todos los tipos de estados de documentos
  procesos = []; //Variable que va a almacenar los procesos que tiene la empresa (extrusio, impresion, etc...)
  areas = []; //Varibale que va a almacenar las areas de la empresa
  materiaPrimaBuscadaId = []; //Variable que almacenará la informacion de la materia prima buscada por ID
  categoriaMPBuscadaID : string; //Variable que almacenará el nombre de la categoria de la materia prima buscada por Id
  tipobodegaMPBuscadaId : string; //Variable que almacenará el nombrede la bodega en la que se encuentra la materia prima buscada
  materiaPrimaSeleccionada = []; //Variable que almacenará la informacion de la materia prima seleccionada
  categoriaMPSeleccionada : string; //Variable que almacenará el nombre de la categoria de la materia prima seleccionada
  tipoBodegaMPSeleccionada : string; //Variable que almacenará el nombrede la bodega en la que se encuentra la materia prima seleccionada
  facturaMateriaPrima = []; //Funcion que guardará la informacion de la factura de materia prima comprada que ha sido consultada
  today : any = new Date(); //Variable que se usará para llenar la fecha actual
  titulosTabla = []; //Variable que almacenará los titulos de la tabla de productos que se ve al final de la vista
  ArrayDocumento : any [] = []; //Variable que tendrá la informacion de los productos que se piden en el nuevo pedido
  ArrayMateriaPrimaRetirada : any [] = []; //Variable que tendrá la informacion de los productos que se piden para uan OT
  AccionBoton = "Agregar"; //Variable que almanará informacio para saber si una materia prima está en edicion o no (Se editará una materia prima cargada en la tabla, no una en la base de datos)
  valorTotal : number = 0; //Variable que guardará el valor total de la factura de entrada de materia prima
  nombreMateriaPrima : string; //Varible que almacenará el nombre de una materia prima consultado o seleccionado
  cantidadTotalExt : number; //Variable que va a almacenar el total de la cantidad extruida en una OT
  cantidadTotalImp : number; //Variable que va a almacenar el total de la cantidad impresa en una OT
  cantidadTotalDbl : number; //Variable que va a almacenar el total de la cantidad doblada en una OT
  proceso : string = ''; //Variable ayudará a almacenar el proceso del cuela se está consultando la ot
  totalPorcentajePerida : number; //Variable que ayudará a calcular el total de perdida en una OT
  asignacion : string;
  recuperadoTipo : string;
  recuperado = 3;
  tipoDocumento = [];
  proveedor = [];
  documentoInfo = [];
  mpAgregada = [];
  totalMPEntregada = 0;
  cantidadTotalKgOT = 0;
  cantRestante : number = 0;
  public load: boolean;

  /* CONSULTAS DE MATERIA PRIMA */
  MpConsultada = [];
  kgOT : number;

  constructor(private materiaPrimaService : MateriaPrimaService,
                private categoriMpService : CategoriaMateriaPrimaService,
                  private tipoBodegaService : TipoBodegaService,
                    private rolService : RolesService,
                      private frmBuilderMateriaPrima : FormBuilder,
                        @Inject(SESSION_STORAGE) private storage: WebStorageService,
                          private tipoDocuemntoService : TipoDocumentoService,
                            private proveedorService : ProveedorService,
                              private remisionService : RemisionService,
                                private remisionMpService : RemisionesMPService,
                                  private facturaCompraMPService : FactuaMpCompradaService,
                                    private facturaCompraService : FacturaMpService,
                                      private usuarioService : UsuarioService,
                                        private remisionFacturaService : RemisionFacturaService,
                                          private asignacionService : AsignacionMPService,
                                            private asignacionMpService : DetallesAsignacionService,
                                              private recuperadoService : RecuperadoService,
                                                private recuperadoMPService : RecuperadoMPService,
                                                  private bagProServices : BagproService,) {

    this.FormDocumentos = this.frmBuilderMateriaPrima.group({
      idDocumento : new FormControl(),
      TipoDocumento: new FormControl(),
      materiaPrima: new FormControl(),
      fecha: new FormControl(),
      fechaFinal : new FormControl(),
    });
    this.load = true;
  }


  ngOnInit(): void {
    this.initForms();
    this.lecturaStorage();
    this.ColumnasTabla();
    this.obtenerTipoDocumento();
    this.obtenerMP();
  }

  initForms() {
    this.FormDocumentos = this.frmBuilderMateriaPrima.group({
      idDocumento : [,Validators.required],
      TipoDocumento: [, Validators.required],
      materiaPrima : [, Validators.required],
      fecha: [, Validators.required],
      fechaFinal: [, Validators.required],
    });
  }

  LimpiarCampos() {
    this.FormDocumentos.reset();
    this.ArrayDocumento = [];
    this.valorTotal = 0;
    this.totalMPEntregada = 0;
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

  obtenerTipoDocumento(){
    this.tipoDocuemntoService.srvObtenerLista().subscribe(datos_tiposDocumentos => {
      for (let index = 0; index < datos_tiposDocumentos.length; index++) {
        this.tipoDocumento.push(datos_tiposDocumentos[index])
      }
    });
  }

  obtenerProveedor(){
    this.proveedorService.srvObtenerLista().subscribe(datos_proveedores => {
      for (let index = 0; index < datos_proveedores.length; index++) {
        this.proveedor.push(datos_proveedores[index]);
        this.proveedor.sort((a, b) => a.prov_Nombre.localeCompare(b.prov_Nombre));
      }
    })
  }

  obtenerMP(){
    this.materiaPrimaService.srvObtenerLista().subscribe(datos_materiPrima => {
      for (let index = 0; index < datos_materiPrima.length; index++) {
        this.ArrayMateriaPrimaRetirada.push(datos_materiPrima[index]);
        this.ArrayMateriaPrimaRetirada.sort((a,b) => a.matPri_Nombre.localeCompare(b.matPri_Nombre));
      }
    });
  }

  //Funcion que colocará el nombre a las columnas de la tabla en la cual se muestran los productos pedidos por los clientes
  ColumnasTabla(){
    this.titulosTabla = [];
    this.titulosTabla = [{
      idFact : "OT",
      tipo : "Tipo de Documento",
      FechaFact : "Fecha Registro",
      usuario : "Registrado Por:",
      mp : "Materia Prima",
      cant : "Cantidad",
      Ver : "Ver",
    }]
  }

  consultaOTBagPro(){
    let ot : any = this.FormDocumentos.value.idDocumento;
    this.bagProServices.srvObtenerListaProcExtOt(ot).subscribe(datos_OT => {
      for (let index = 0; index < datos_OT.length; index++) {
        this.cantidadTotalKgOT = datos_OT[index].datosvalorOt;
        break;
      }
    });
  }

  validarConsulta(){
    this.ArrayDocumento = [];
    this.asignacion = '';
    this.totalMPEntregada = 0;
    let idDoc : string = this.FormDocumentos.value.idDocumento;
    let fecha : any = this.FormDocumentos.value.fecha;
    let fechaFinal : any = this.FormDocumentos.value.fechaFinal;
    let TipoDocumento : string = this.FormDocumentos.value.TipoDocumento;
    let materiaPrima : number = this.FormDocumentos.value.materiaPrima;
    let fechaCreacionFinal : any;
    // if (this.FormDocumentos.valid) {

    // } else
    if (fecha != null && fechaFinal != null && materiaPrima != null && TipoDocumento != null) {
      this.asignacionService.srvObtenerLista().subscribe(datos_asignacion => {
        for (let index = 0; index < datos_asignacion.length; index++) {
          this.asignacionMpService.srvObtenerLista().subscribe(datos_asignacionMP => {
            let FechaCreacionDatetime = datos_asignacion[index].asigMp_FechaEntrega;
            let FechaCreacionNueva = FechaCreacionDatetime.indexOf("T");
            fechaCreacionFinal = FechaCreacionDatetime.substring(0, FechaCreacionNueva);
            for (let i = 0; i < datos_asignacionMP.length; i++) {
              if (moment(fechaCreacionFinal).isBetween(fecha, fechaFinal) && datos_asignacionMP[i].matPri_Id == materiaPrima) {
                this.asignacion = 'Asignacion';
                this.lenarTabla(datos_asignacionMP[i]);
              }
            }
          });
          break;
        }
      });
    } else if (fecha != null && materiaPrima != null && TipoDocumento != null) {
      this.asignacionService.srvObtenerLista().subscribe(datos_asignacion => {
        for (let index = 0; index < datos_asignacion.length; index++) {
          this.asignacionMpService.srvObtenerLista().subscribe(datos_asignacionMP => {
            let FechaCreacionDatetime = datos_asignacion[index].asigMp_FechaEntrega;
            let FechaCreacionNueva = FechaCreacionDatetime.indexOf("T");
            fechaCreacionFinal = FechaCreacionDatetime.substring(0, FechaCreacionNueva);
            for (let i = 0; i < datos_asignacionMP.length; i++) {
              if (moment(fecha).isSame(fechaCreacionFinal) && datos_asignacionMP[i].asigMp_Id == datos_asignacion[index].asigMp_Id && datos_asignacionMP[i].matPri_Id == materiaPrima) {
                this.asignacion = 'Asignacion';
                this.lenarTabla(datos_asignacionMP[i]);
              }
            }
          });
        }
      });
    } else if (fecha != null && fechaFinal != null && materiaPrima != null) {
      this.asignacionService.srvObtenerLista().subscribe(datos_asignacion => {
        for (let index = 0; index < datos_asignacion.length; index++) {
          this.asignacionMpService.srvObtenerLista().subscribe(datos_asignacionMP => {
            for (let i = 0; i < datos_asignacionMP.length; i++) {
              let FechaCreacionDatetime = datos_asignacion[index].asigMp_FechaEntrega;
              let FechaCreacionNueva = FechaCreacionDatetime.indexOf("T");
              fechaCreacionFinal = FechaCreacionDatetime.substring(0, FechaCreacionNueva);
              if (moment(fechaCreacionFinal).isBetween(fecha, fechaFinal) && datos_asignacionMP[i].matPri_Id == materiaPrima) {
                this.asignacion = 'Asignacion';
                this.lenarTabla(datos_asignacionMP[i]);
              }
            }
          });
          break;
        }
      });
    } else if (fecha != null && fechaFinal != null) {
      this.asignacionService.srvObtenerLista().subscribe(datos_asignacion => {
        for (let index = 0; index < datos_asignacion.length; index++) {
          let FechaCreacionDatetime = datos_asignacion[index].asigMp_FechaEntrega;
          let FechaCreacionNueva = FechaCreacionDatetime.indexOf("T");
          fechaCreacionFinal = FechaCreacionDatetime.substring(0, FechaCreacionNueva);

          this.asignacionMpService.srvObtenerLista().subscribe(datos_asignacionMP => {
            for (let i = 0; i < datos_asignacionMP.length; i++) {
              if (moment(fechaCreacionFinal).isBetween(fecha, fechaFinal) && datos_asignacionMP[i].asigMp_Id == datos_asignacion[index].asigMp_Id) {
                this.asignacion = 'Asignacion';
                this.lenarTabla(datos_asignacionMP[i]);
              }
            }
          });
        }
      });
    } else if (fecha != null && TipoDocumento != null) {
      this.asignacionService.srvObtenerLista().subscribe(datos_asignacion => {
        for (let index = 0; index < datos_asignacion.length; index++) {
          this.asignacionMpService.srvObtenerLista().subscribe(datos_asignacionMP => {
            let FechaCreacionDatetime = datos_asignacion[index].asigMp_FechaEntrega;
            let FechaCreacionNueva = FechaCreacionDatetime.indexOf("T");
            fechaCreacionFinal = FechaCreacionDatetime.substring(0, FechaCreacionNueva);
            for (let i = 0; i < datos_asignacionMP.length; i++) {
              if (moment(fecha).isSame(fechaCreacionFinal) && datos_asignacionMP[i].asigMp_Id == datos_asignacion[index].asigMp_Id) {
                this.asignacion = 'Asignacion';
                this.lenarTabla(datos_asignacionMP[i]);
              }
            }
          });
        }
      });
    } else if (materiaPrima != null && TipoDocumento == 'Asignación') {
      this.asignacionService.srvObtenerLista().subscribe(datos_asignacion => {
        for (let index = 0; index < datos_asignacion.length; index++) {
          this.asignacionMpService.srvObtenerLista().subscribe(datos_asignacionMP => {
            for (let i = 0; i < datos_asignacionMP.length; i++) {
              if (datos_asignacionMP[i].matPri_Id == materiaPrima) {
                this.asignacion = 'Asignacion';
                this.lenarTabla(datos_asignacionMP[i]);
              }
            }
          });
          break;
        }
      });
    } else if (materiaPrima != null && TipoDocumento == 'Recuperado') {

      this.recuperadoService.srvObtenerLista().subscribe(datos_recuperado => {
        for (let index = 0; index < datos_recuperado.length; index++) {
          this.recuperadoMPService.srvObtenerLista().subscribe(datos_recuperadoMP => {
            for (let i = 0; i < datos_recuperadoMP.length; i++) {
              if (datos_recuperadoMP[i].matPri_Id == materiaPrima) {
                this.recuperadoTipo = 'RECUP';
                this.recuperado = 2;
                this.lenarTabla(datos_recuperadoMP[i]);
              }
            }
          });
          break;
        }
      });
    } else if (idDoc != null) {
      let cantAsig : number = 0; //Variable que almacena la cantidad de materia prima que se ha asignado hasta el momento
      this.load = false;
      this.bagProServices.srvObtenerListaProcExtOt(idDoc).subscribe(datos_procesos => {
        if (datos_procesos != []) {
          for (let index = 0; index < datos_procesos.length; index++) {
            this.kgOT = datos_procesos[index].exttotalextruir;
            this.asignacionService.srvObtenerListaPorOt(idDoc).subscribe(datos_asignaciones => {
              if (datos_asignaciones != []) {
                for (let index = 0; index < datos_asignaciones.length; index++) {
                  if (datos_asignaciones[index].asigMP_OrdenTrabajo == idDoc) {
                    this.asignacionMpService.srvObtenerListaPorAsigId(datos_asignaciones[index].asigMp_Id).subscribe(datos_asignacionMp => {
                      for (let i = 0; i < datos_asignacionMp.length; i++) {
                        this.asignacion = 'Asignacion';
                        cantAsig = cantAsig + datos_asignacionMp[i].dtAsigMp_Cantidad;
                        this.lenarTabla(datos_asignacionMp[i]);
                      }
                    });
                  }
                }
              } else {
                Swal.fire(`La orden de trabajo N° ${idDoc} no se encuentra registrada`);
                this.load = true;
              }
            });
            setTimeout(() => {
              this.cantRestante = this.kgOT - cantAsig;
              this.load = true;
            }, 3000);
            break;
          }
        } else {
          Swal.fire(`La orden de trabajo N° ${idDoc} no se encuentra registrada en BagPro`)
          console.log(datos_procesos);
          this.load = true;
        }
      }, error => {
        console.log(error)
        this.load = true;
      });

      // this.facturaCompraService.srvObtenerListaPorId(idDoc).subscribe(datos_factura => {
      //   this.lenarTabla(datos_factura);
      //   this.remisionService.srvObtenerListaPorId(idDoc).subscribe(datos_remision => {
      //     this.lenarTabla(datos_remision);
      //     this.asignacionService.srvObtenerListaPorId(idDoc).subscribe(datos_asignacion => {
      //       this.asignacion = 'Asignacion';
      //       this.lenarTabla(datos_asignacion);
      //       this.recuperadoService.srvObtenerListaPorId(idDoc).subscribe(datos_recpuerado => {
      //         // this.recuperado = 2;
      //         this.lenarTabla(datos_recpuerado);
      //       });
      //     });
      //   });
      // }, error => {
      //   this.remisionService.srvObtenerListaPorId(idDoc).subscribe(datos_remision => {
      //     this.lenarTabla(datos_remision);
      //     this.asignacionService.srvObtenerListaPorId(idDoc).subscribe(datos_asignacion => {
      //       this.lenarTabla(datos_asignacion);
      //       this.recuperadoService.srvObtenerListaPorId(idDoc).subscribe(datos_recpuerado => {
      //         // this.recuperado = 2;
      //         this.lenarTabla(datos_recpuerado);
      //       });
      //     });
      //   }, error => {
      //     this.asignacionService.srvObtenerListaPorId(idDoc).subscribe(datos_asignacion => {
      //       this.lenarTabla(datos_asignacion);
      //       this.recuperadoService.srvObtenerListaPorId(idDoc).subscribe(datos_recpuerado => {
      //         // this.recuperado = 2;
      //         this.lenarTabla(datos_recpuerado);
      //       });
      //     }, error => {
      //       this.recuperadoService.srvObtenerListaPorId(idDoc).subscribe(datos_recpuerado => {
      //         // this.recuperado = 2;
      //         this.lenarTabla(datos_recpuerado);
      //       });
      //     });
      //   });
      // });
    } else if (fecha != null) {
      this.facturaCompraMPService.srvObtenerLista().subscribe(datos_factura => {
        for (let index = 0; index < datos_factura.length; index++) {
          let FechaCreacionDatetime = datos_factura[index].facco_FechaFactura;
          let FechaCreacionNueva = FechaCreacionDatetime.indexOf("T");
          fechaCreacionFinal = FechaCreacionDatetime.substring(0, FechaCreacionNueva);
          if (moment(fechaCreacionFinal).isBetween(fecha, undefined)) {
            this.lenarTabla(datos_factura[index]);
          }
        }
      });

      this.remisionService.srvObtenerLista().subscribe(datos_remision => {
        for (let index = 0; index < datos_remision.length; index++) {
          let FechaCreacionDatetime = datos_remision[index].rem_Fecha;
          let FechaCreacionNueva = FechaCreacionDatetime.indexOf("T");
          fechaCreacionFinal = FechaCreacionDatetime.substring(0, FechaCreacionNueva);
          if (moment(fechaCreacionFinal).isBetween(fecha, undefined)) {
            this.lenarTabla(datos_remision[index]);
          }
        }
      });

      this.asignacionService.srvObtenerLista().subscribe(datos_asignacion => {
        for (let index = 0; index < datos_asignacion.length; index++) {
          this.asignacionMpService.srvObtenerLista().subscribe(datos_asignacionMP => {
            let FechaCreacionDatetime = datos_asignacion[index].asigMp_FechaEntrega;
            let FechaCreacionNueva = FechaCreacionDatetime.indexOf("T");
            fechaCreacionFinal = FechaCreacionDatetime.substring(0, FechaCreacionNueva);
            for (let i = 0; i < datos_asignacionMP.length; i++) {
              if (moment(fecha).isSame(fechaCreacionFinal) && datos_asignacionMP[i].asigMp_Id == datos_asignacion[index].asigMp_Id) {
                this.asignacion = 'Asignacion';
                this.lenarTabla(datos_asignacionMP[i]);
              }
            }
          });
        }
      });

      this.recuperadoService.srvObtenerLista().subscribe(datos_recuperado => {
        for (let index = 0; index < datos_recuperado.length; index++) {
          let FechaCreacionDatetime = datos_recuperado[index].recMp_FechaIngreso;
          let FechaCreacionNueva = FechaCreacionDatetime.indexOf("T");
          fechaCreacionFinal = FechaCreacionDatetime.substring(0, FechaCreacionNueva);
          if (moment(fechaCreacionFinal).isBetween(fecha, undefined)) {
            this.recuperado = 2;
            this.lenarTabla(datos_recuperado[index]);
          }
        }
      })

    } else if (TipoDocumento != null) {
      if (TipoDocumento ==  'FCO') {
        this.facturaCompraMPService.srvObtenerLista().subscribe(datos_factura => {
          for (let index = 0; index < datos_factura.length; index++) {
            this.lenarTabla(datos_factura[index]);
          }
        });
      } else if (TipoDocumento ==  'REM') {
        this.remisionService.srvObtenerLista().subscribe(datos_remision => {
          for (let index = 0; index < datos_remision.length; index++) {
            this.lenarTabla(datos_remision[index]);
          }
        });
      } else if (TipoDocumento == 'Asignación') {
        this.asignacionService.srvObtenerLista().subscribe(datos_asignacion => {
          for (let index = 0; index < datos_asignacion.length; index++) {
            this.asignacionMpService.srvObtenerLista().subscribe(datos_asignacionMp => {
              for (let i = 0; i < datos_asignacionMp.length; i++) {
                if (datos_asignacion[index].asigMp_Id == datos_asignacionMp[i].asigMp_Id) {
                  this.asignacion = 'Asignacion';
                  this.lenarTabla(datos_asignacionMp[i]);
                }
              }
            });
          }
        });
      } else if (TipoDocumento == 'Recuperado') {
        this.recuperadoService.srvObtenerLista().subscribe(datos_recuperado => {
          for (let index = 0; index < datos_recuperado.length; index++) {
            this.recuperadoMPService.srvObtenerLista().subscribe(datos_recuperadoMP => {
              for (let i = 0; i < datos_recuperadoMP.length; i++) {
                this.recuperadoTipo = 'RECUP';
                this.recuperado = 2;
                this.lenarTabla(datos_recuperadoMP[i]);
              }
            });
            break;
          }
        });
      }
    } else if (materiaPrima != null) {
      this.asignacionMpService.srvObtenerLista().subscribe(datos_asgincaionMp => {
        for (let index = 0; index < datos_asgincaionMp.length; index++) {
          if (datos_asgincaionMp[index].matPri_Id == materiaPrima) {
            this.asignacionService.srvObtenerListaPorId(datos_asgincaionMp[index].asigMp_Id).subscribe(datos_asignacion => {
              this.asignacion = 'Asignacion';
              this.lenarTabla(datos_asgincaionMp[index]);
            });
          }
        }
      });
    } else {
      this.facturaCompraMPService.srvObtenerLista().subscribe(datos_factura => {
        for (let index = 0; index < datos_factura.length; index++) {
          this.lenarTabla(datos_factura[index]);
        }
      });
      this.remisionService.srvObtenerLista().subscribe(datos_remision => {
        for (let rem = 0; rem < datos_remision.length; rem++) {
          this.lenarTabla(datos_remision[rem]);
        }
      });
      this.recuperadoService.srvObtenerLista().subscribe(datos_recuperado => {
        for (let index = 0; index < datos_recuperado.length; index++) {
          // this.recuperado = 2;
          this.lenarTabla(datos_recuperado[index]);
        }
      });
      this.asignacionService.srvObtenerLista().subscribe(datos_asignacion => {
        for (let asg = 0; asg < datos_asignacion.length; asg++) {
          this.asignacion = 'Asignacion';
          this.lenarTabla(datos_asignacion[asg]);
        }
      });
    }
  }

  lenarTabla(formulario : any){
    let materiaPrima : number = this.FormDocumentos.value.materiaPrima;

    if (formulario.tpDoc_Id == 'FCO') {

      const infoDoc : any = {
        id : formulario.facco_Id,
        codigo : formulario.facco_Codigo,
        tipoDoc : formulario.tpDoc_Id,
        fecha : formulario.facco_FechaFactura,
        usuario : formulario.usua_Id,
        subTotal : formulario.facco_ValorTotal,
      }
      this.ArrayDocumento.push(infoDoc);
      this.ArrayDocumento.sort((a,b) => b.fecha.localeCompare(a.fecha));
      this.usuarioService.srvObtenerListaPorId(infoDoc.usuario).subscribe(datos_usuario => {
        infoDoc.usuario = datos_usuario.usua_Nombre;
      });

    } else if (formulario.tpDoc_Id == 'REM') {
      const infoDoc : any = {
        id : formulario.rem_Id,
        codigo : formulario.rem_Codigo,
        tipoDoc : formulario.tpDoc_Id,
        fecha : formulario.rem_Fecha,
        mp : formulario.matPri_Id,
        cant : formulario.recMatPri_Cantidad,
      }
      this.ArrayDocumento.push(infoDoc);
      this.ArrayDocumento.sort((a,b) => b.fecha.localeCompare(a.fecha));
      this.usuarioService.srvObtenerListaPorId(infoDoc.usuario).subscribe(datos_usuario => {
        infoDoc.usuario = datos_usuario.usua_Nombre;
      });

    } else if (this.asignacion == 'Asignacion') {
      this.asignacionService.srvObtenerListaPorId(formulario.asigMp_Id).subscribe(datos_asignacion => {
        const infoDoc : any = {
          id : datos_asignacion.asigMp_Id,
          codigo : datos_asignacion.asigMP_OrdenTrabajo,
          tipoDoc : 'ASIGNACION',
          fecha : datos_asignacion.asigMp_FechaEntrega,
          usuario : datos_asignacion.usua_Id,
          mp : formulario.matPri_Id,
          cant : formulario.dtAsigMp_Cantidad,
        }
        this.ArrayDocumento.push(infoDoc);
        this.usuarioService.srvObtenerListaPorId(infoDoc.usuario).subscribe(datos_usuario => {
          infoDoc.usuario = datos_usuario.usua_Nombre;
        });
        this.totalMPEntregada = this.totalMPEntregada + infoDoc.cant;
        // this.ArrayDocumento.sort((a,b) =>  (b.fecha) - (a.fecha));
        this.ArrayDocumento.sort((a,b) => b.fecha.localeCompare(a.fecha));
        this.formatonumeros(this.totalMPEntregada);
        this.materiaPrimaService.srvObtenerListaPorId(infoDoc.mp).subscribe(datos_mp => {
          infoDoc.mp = datos_mp.matPri_Nombre
        });
      });
    } else if (this.recuperadoTipo === 'RECUP') {
      this.recuperadoService.srvObtenerListaPorId(formulario.recMp_Id).subscribe(datos_recuperado => {
        const infoDoc : any = {
          id : datos_recuperado.recMp_Id,
          codigo : datos_recuperado.recMp_Id,
          tipoDoc : 'RECUPERADO',
          fecha : datos_recuperado.recMp_FechaIngreso,
          usuario : datos_recuperado.usua_Id,
          mp : formulario.matPri_Id,
          cant : formulario.recMatPri_Cantidad,
        }
        this.ArrayDocumento.push(infoDoc);
        this.ArrayDocumento.sort((a,b) => b.fecha.localeCompare(a.fecha));
        this.usuarioService.srvObtenerListaPorId(infoDoc.usuario).subscribe(datos_usuario => {
          infoDoc.usuario = datos_usuario.usua_Nombre;
        });
        this.materiaPrimaService.srvObtenerListaPorId(infoDoc.mp).subscribe(datos_mp => {
          infoDoc.mp = datos_mp.matPri_Nombre;
        });
      })
    }

  }

  // Funcion que llena el array con los productos que pertenecen al pedido que se consulta
  llenarDocumento(formulario : any){
    let id : any = formulario.id;
    let tipoDoc : any = formulario.tipoDoc;
    this.mpAgregada = [];

    if (tipoDoc == 'FCO') {
      this.facturaCompraService.srvObtenerLista().subscribe(datos_mpFactura => {
        for (let index = 0; index < datos_mpFactura.length; index++) {
          if (id == datos_mpFactura[index].facco_Id) {
            this.materiaPrimaService.srvObtenerListaPorId(datos_mpFactura[index].matPri_Id).subscribe(datos_materiPrima => {
              const mpFactura : any = {
                Id : datos_materiPrima.matPri_Id,
                Nombre : datos_materiPrima.matPri_Nombre,
                Cant : this.formatonumeros(datos_mpFactura[index].faccoMatPri_Cantidad),
                UndCant : datos_mpFactura[index].undMed_Id,
                Stock : datos_materiPrima.matPri_Stock,
                UndStock : datos_materiPrima.undMed_Id,
                PrecioUnd : this.formatonumeros(datos_mpFactura[index].faccoMatPri_ValorUnitario),
                SubTotal : this.formatonumeros(datos_mpFactura[index].faccoMatPri_Cantidad * datos_mpFactura[index].faccoMatPri_ValorUnitario),
              }
              this.mpAgregada.push(mpFactura);
            });
          }
        }
      });
    } else if (tipoDoc == 'REM') {
      this.remisionMpService.srvObtenerLista().subscribe(datos_remisionMP => {
        for (let index = 0; index < datos_remisionMP.length; index++) {
          if (datos_remisionMP[index].rem_Id == id) {
            this.materiaPrimaService.srvObtenerListaPorId(datos_remisionMP[index].matPri_Id).subscribe(datos_materiPrima => {
              const mpFactura : any = {
                Id : datos_materiPrima.matPri_Id,
                Nombre : datos_materiPrima.matPri_Nombre,
                Cant : this.formatonumeros(datos_remisionMP[index].remiMatPri_Cantidad),
                UndCant : datos_remisionMP[index].undMed_Id,
                Stock : datos_materiPrima.matPri_Stock,
                UndStock : datos_materiPrima.undMed_Id,
                PrecioUnd : this.formatonumeros(datos_remisionMP[index].remiMatPri_ValorUnitario),
                SubTotal : this.formatonumeros(datos_remisionMP[index].remiMatPri_Cantidad * datos_remisionMP[index].remiMatPri_ValorUnitario),
              }
              this.mpAgregada.push(mpFactura);
            });
          }
        }
      });
    } else if (tipoDoc == 'ASIGNACION') {
      this.asignacionMpService.srvObtenerLista().subscribe(datos_asignacionMP => {
        for (let index = 0; index < datos_asignacionMP.length; index++) {
          if (datos_asignacionMP[index].asigMp_Id == id) {
            this.materiaPrimaService.srvObtenerListaPorId(datos_asignacionMP[index].matPri_Id).subscribe(datos_materiPrima => {
              const mpFactura : any = {
                Id : datos_materiPrima.matPri_Id,
                Nombre : datos_materiPrima.matPri_Nombre,
                Cant : this.formatonumeros(datos_asignacionMP[index].dtAsigMp_Cantidad),
                UndCant : datos_asignacionMP[index].undMed_Id,
                Stock : datos_materiPrima.matPri_Stock,
                UndStock : datos_materiPrima.undMed_Id,
                PrecioUnd : '',
                SubTotal : '',
              }
              this.mpAgregada.push(mpFactura);
            });
          }
        }
      });
    } else if (tipoDoc == 'RECUPERADO') {
      this.recuperadoMPService.srvObtenerLista().subscribe(datos_mpRecuperada => {
        for (let index = 0; index < datos_mpRecuperada.length; index++) {
          if (datos_mpRecuperada[index].recMp_Id == id) {
            this.materiaPrimaService.srvObtenerListaPorId(datos_mpRecuperada[index].matPri_Id).subscribe(datos_materiPrima => {
              const mpFactura : any = {
                Id : datos_materiPrima.matPri_Id,
                Nombre : datos_materiPrima.matPri_Nombre,
                Cant : this.formatonumeros(datos_mpRecuperada[index].recMatPri_Cantidad),
                UndCant : datos_mpRecuperada[index].undMed_Id,
              }
              this.recuperado = 2;
              this.mpAgregada.push(mpFactura);
            });
          } else continue;
          break;
        }
      });
    }
    this.llenarPDFConBD(formulario);
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
          widths: ['*', '*', '*', '*', '*', '*'],
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
          widths: ['*', '*', '*', '*'],
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

  // Funcion para llenar el pdf con información de la base de datos dependiendo el pedido
  llenarPDFConBD(formulario : any){
    let id : number = formulario.id;
    let tipoDoc : any = formulario.tipoDoc;
    let remisionFactura = [];

    if (tipoDoc == 'FCO') {
      this.facturaCompraMPService.srvObtenerListaPorId(id).subscribe(datos_factura => {
        this.facturaCompraService.srvObtenerLista().subscribe(datos_mpFactura => {
          for (let index = 0; index < datos_mpFactura.length; index++) {
            if (id == datos_mpFactura[index].facco_Id) {
              this.usuarioService.srvObtenerListaPorId(datos_factura.usua_Id).subscribe(datos_usuario => {
                this.proveedorService.srvObtenerListaPorId(datos_factura.prov_Id).subscribe(datos_proveedor => {
                  for (let mp = 0; mp < this.mpAgregada.length; mp++) {
                    let FechaEntregaDatetime = datos_factura.facco_FechaFactura;
                    let FechaEntregaNueva = FechaEntregaDatetime.indexOf("T");
                    let fecharegistroFinal = FechaEntregaDatetime.substring(0, FechaEntregaNueva);

                    const pdfDefinicion : any = {
                      info: {
                        title: `${datos_factura.facco_Codigo}`
                      },
                      content : [
                        {
                          text: `Plasticaribe S.A.S ---- Factura de Compra de Materia Prima`,
                          alignment: 'center',
                          style: 'titulo',
                        },
                        '\n \n',
                        {
                          text: `Fecha de registro: ${fecharegistroFinal}`,
                          style: 'header',
                          alignment: 'right',
                        },
                        {
                          text: `Registrado Por: ${datos_usuario.usua_Nombre}\n`,
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
                                `ID: ${datos_proveedor.prov_Id}`,
                                `Tipo de ID: ${datos_proveedor.tipoIdentificacion_Id}`,
                                `Tipo de Cliente: ${datos_proveedor.tpProv_Id}`
                              ],
                              [
                                `Nombre: ${datos_proveedor.prov_Nombre}`,
                                `Telefono: ${datos_proveedor.prov_Telefono}`,
                                `Ciudad: ${datos_proveedor.prov_Ciudad}`
                              ],
                              [
                                `E-mail: ${datos_proveedor.prov_Email}`,
                                ``,
                                ``
                              ]
                            ]
                          },
                          layout: 'lightHorizontalLines',
                          fontSize: 9,
                        },
                        {
                          text: `\n \nObervación sobre la factura: \n ${datos_factura.facco_Observacion}\n`,
                          style: 'header',
                        },
                        {
                          text: `\n Información detallada de Materia(s) Prima(s) comprada(s) \n `,
                          alignment: 'center',
                          style: 'header'
                        },

                        this.table(this.mpAgregada, ['Id', 'Nombre', 'Cant', 'UndCant', 'PrecioUnd', 'SubTotal']),

                        {
                          text: `\n\nValor Total Factura: $${this.formatonumeros(datos_factura.facco_ValorTotal)}`,
                          alignment: 'right',
                          style: 'header',
                        },


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
                });
              });
              break;
            }
          }
        });
      });
    } else if (tipoDoc == 'REM') {
      this.remisionService.srvObtenerListaPorId(id).subscribe(datos_remision => {
        this.remisionMpService.srvObtenerLista().subscribe(datos_remisionMP => {
          for (let index = 0; index < datos_remisionMP.length; index++) {
            if (datos_remisionMP[index].rem_Id == id) {
              this.usuarioService.srvObtenerListaPorId(datos_remision.usua_Id).subscribe(datos_usuario => {
                this.proveedorService.srvObtenerListaPorId(datos_remision.prov_Id).subscribe(datos_proveedor => {
                  this.materiaPrimaService.srvObtenerListaPorId(datos_remisionMP[index].matPri_Id).subscribe(datos_materiPrima => {
                    for (let mp = 0; mp < this.mpAgregada.length; mp++) {
                      let FechaEntregaDatetime = datos_remision.rem_Fecha;
                      let FechaEntregaNueva = FechaEntregaDatetime.indexOf("T");
                      let fecharegistroFinal = FechaEntregaDatetime.substring(0, FechaEntregaNueva);

                      const pdfDefinicion : any = {
                        info: {
                          title: `${datos_remision.rem_Id}`
                        },
                        content : [
                          {
                            text: `Plasticaribe S.A.S ---- Remisión de Compra de Materia Prima`,
                            alignment: 'center',
                            style: 'titulo',
                          },
                          '\n \n',
                          {
                            text: `Fecha de registro: ${fecharegistroFinal}`,
                            style: 'header',
                            alignment: 'right',
                          },
                          {
                            text: `Registrado Por: ${datos_usuario.usua_Nombre}\n`,
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
                                  `ID: ${datos_proveedor.prov_Id}`,
                                  `Tipo de ID: ${datos_proveedor.tipoIdentificacion_Id}`,
                                  `Tipo de Cliente: ${datos_proveedor.tpProv_Id}`
                                ],
                                [
                                  `Nombre: ${datos_proveedor.prov_Nombre}`,
                                  `Telefono: ${datos_proveedor.prov_Telefono}`,
                                  `Ciudad: ${datos_proveedor.prov_Ciudad}`
                                ],
                                [
                                  `E-mail: ${datos_proveedor.prov_Email}`,
                                  ``,
                                  ``
                                ]
                              ]
                            },
                            layout: 'lightHorizontalLines',
                            fontSize: 9,
                          },
                          {
                            text: `\n \nObervación sobre la remisión: \n ${datos_remision.rem_Observacion}\n`,
                            style: 'header',
                          },
                          {
                            text: `\n Información detallada de Materia(s) Prima(s) comprada(s) \n `,
                            alignment: 'center',
                            style: 'header'
                          },

                          this.table(this.mpAgregada, ['Id', 'Nombre', 'Cant', 'UndCant', 'PrecioUnd', 'SubTotal']),

                          {
                            text: `\n\nValor Total Remisión: $${this.formatonumeros(datos_remision.rem_PrecioEstimado)}`,
                            alignment: 'right',
                            style: 'header',
                          },
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
                  });
                });
              });
              break
            }
          }
        });
      });
    } else if (tipoDoc == 'ASIGNACION') {
      this.asignacionService.srvObtenerListaPorId(id).subscribe(datos_asignacion => {
        this.asignacionMpService.srvObtenerLista().subscribe(datos_asignacionMP => {
          for (let index = 0; index < datos_asignacionMP.length; index++) {
            if (id === datos_asignacionMP[index].asigMp_Id) {
              this.usuarioService.srvObtenerListaPorId(datos_asignacion.usua_Id).subscribe(datos_usuario => {
                for (let mp = 0; mp < this.mpAgregada.length; mp++) {
                  let FechaEntregaDatetime = datos_asignacion.asigMp_FechaEntrega;
                  let FechaEntregaNueva = FechaEntregaDatetime.indexOf("T");
                  let fecharegistroFinal = FechaEntregaDatetime.substring(0, FechaEntregaNueva);
                  const pdfDefinicion : any = {
                    info: {
                      title: `${datos_asignacion.asigMp_Id}`
                    },
                    content : [
                      {
                        text: `Plasticaribe S.A.S ---- Asignación de Materia Prima`,
                        alignment: 'center',
                        style: 'titulo',
                      },
                      '\n \n',
                      {
                        text: `Fecha de registro: ${fecharegistroFinal}`,
                        style: 'header',
                        alignment: 'right',
                      },
                      {
                        text: `Registrado Por: ${datos_usuario.usua_Nombre}\n`,
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
                              `OT: ${datos_asignacion.asigMP_OrdenTrabajo}`,
                              `Maquina: ${datos_asignacion.asigMp_Maquina}`,
                              ``
                            ]
                          ]
                        },
                        layout: 'lightHorizontalLines',
                        fontSize: 12,
                      },
                      {
                        text: `\n \nObervación sobre la remisión: \n ${datos_asignacion.asigMp_Observacion}\n`,
                        style: 'header',
                      },
                      {
                        text: `\n Información detallada de Materia(s) Prima(s) asignada(s) \n `,
                        alignment: 'center',
                        style: 'header'
                      },

                      this.tableAsignacion(this.mpAgregada, ['Id', 'Nombre', 'Cant', 'UndCant']),
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
              });
            }else continue;
            break;
          }
        })
      });
    } else if (tipoDoc == 'RECUPERADO') {
      this.recuperadoService.srvObtenerListaPorId(id).subscribe(datos_recuperado => {
        this.recuperadoMPService.srvObtenerLista().subscribe(datos_mpRecuperada => {
          for (let index = 0; index < datos_mpRecuperada.length; index++) {
            if (datos_mpRecuperada[index].recMp_Id == id) {
              this.usuarioService.srvObtenerListaPorId(datos_recuperado.usua_Id).subscribe(datos_usuarios => {
                for (let mp = 0; mp < this.mpAgregada.length; mp++) {
                  let FechaEntregaDatetime = datos_recuperado.recMp_FechaIngreso;
                  let FechaEntregaNueva = FechaEntregaDatetime.indexOf("T");
                  let fecharegistroFinal = FechaEntregaDatetime.substring(0, FechaEntregaNueva);
                  const pdfDefinicion : any = {
                    info: {
                      title: `${datos_recuperado.recMp_Id}`
                    },
                    content : [
                      {
                        text: `Plasticaribe S.A.S ---- Recuperado de Materia Prima`,
                        alignment: 'center',
                        style: 'titulo',
                      },
                      '\n \n',
                      {
                        text: `Fecha de registro: ${fecharegistroFinal}`,
                        style: 'header',
                        alignment: 'right',
                      },
                      {
                        text: `Registrado Por: ${datos_usuarios.usua_Nombre}\n`,
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
                              `Proceso: ${datos_recuperado.proc_Id}`,
                              ``,
                              ``
                            ]
                          ]
                        },
                        layout: 'lightHorizontalLines',
                        fontSize: 9,
                      },
                      {
                        text: `\n \nObervación sobre la remisión: \n ${datos_recuperado.recMp_Observacion}\n`,
                        style: 'header',
                      },
                      {
                        text: `\n Información detallada de Materia(s) Prima(s) asignada(s) \n `,
                        alignment: 'center',
                        style: 'header'
                      },

                      this.tableAsignacion(this.mpAgregada, ['Id', 'Nombre', 'Cant', 'UndCant']),
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
              });
            }else continue;
            break;
          }
        });
      });
    }
  }

  organizacionPrecioDblClick(){
    this.ArrayDocumento.sort((a,b)=> Number(b.subTotal) - Number(a.subTotal));
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    });
    Toast.fire({
      icon: 'warning',
      title: 'Ordenado por "Precio Total" de mayor a menor'
    });
  }

  //Funcion que organiza los campos de la tabla de pedidos de menor a mayor
  organizacionPrecio(){
    this.ArrayDocumento.sort((a,b)=> Number(a.subTotal) - Number(b.subTotal));
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    });
    Toast.fire({
      icon: 'warning',
      title: 'Ordenado por "Precio Total" de menor a mayor'
    });
  }

}
