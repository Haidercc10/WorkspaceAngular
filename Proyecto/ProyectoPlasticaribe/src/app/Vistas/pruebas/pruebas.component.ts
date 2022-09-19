import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { AsignacionBOPPService } from 'src/app/Servicios/asignacionBOPP.service';
import { AsignacionMPService } from 'src/app/Servicios/asignacionMP.service';
import { CategoriaMateriaPrimaService } from 'src/app/Servicios/categoriaMateriaPrima.service';
import { DetallesAsignacionService } from 'src/app/Servicios/detallesAsignacion.service';
import { DetalleAsignacion_BOPPService } from 'src/app/Servicios/detallesAsignacionBOPP.service';
import { DetallesAsignacionTintasService } from 'src/app/Servicios/detallesAsignacionTintas.service';
import { Detalles_EntradaTintasService } from 'src/app/Servicios/Detalles_EntradaTintas.service';
import { DevolucionesService } from 'src/app/Servicios/devoluciones.service';
import { DevolucionesMPService } from 'src/app/Servicios/devolucionesMP.service';
import { EntradaBOPPService } from 'src/app/Servicios/entrada-BOPP.service';
import { Entrada_TintaService } from 'src/app/Servicios/Entrada_Tinta.service';
import { FacturaMpService } from 'src/app/Servicios/facturaMp.service';
import { FactuaMpCompradaService } from 'src/app/Servicios/facturaMpComprada.service';
import { InventInicialDiaService } from 'src/app/Servicios/inventInicialDia.service';
import { MateriaPrimaService } from 'src/app/Servicios/materiaPrima.service';
import { Orden_TrabajoService } from 'src/app/Servicios/Orden_Trabajo.service';
import { RecuperadoService } from 'src/app/Servicios/recuperado.service';
import { RecuperadoMPService } from 'src/app/Servicios/recuperadoMP.service';
import { RemisionService } from 'src/app/Servicios/Remision.service';
import { RemisionesMPService } from 'src/app/Servicios/remisionesMP.service';
import { RolesService } from 'src/app/Servicios/roles.service';
import { TintasService } from 'src/app/Servicios/tintas.service';
import { TipoBodegaService } from 'src/app/Servicios/tipoBodega.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pruebas',
  templateUrl: './pruebas.component.html',
  styleUrls: ['./pruebas.component.css']
})
export class PruebasComponent implements OnInit{
  datePipe: any;
  public FormMateriaPrima !: FormGroup

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
  ArrayMateriaPrima : any [] = []; //Variable que tendrá la informacion de los productos que se piden en el nuevo pedido
  ArrayMateriaPrimaRetirada : any [] = []; //Variable que tendrá la informacion de los productos que se piden para uan OT
  AccionBoton = "Agregar"; //Variable que almanará informacio para saber si una materia prima está en edicion o no (Se editará una materia prima cargada en la tabla, no una en la base de datos)
  valorTotal : number = 0; //Variable que guardará el valor total de la factura de entrada de materia prima
  nombreMateriaPrima : string; //Varible que almacenará el nombre de una materia prima consultado o seleccionado
  precioOT : number; //Variable que va a almacenar el precio de la ot consultada
  cantidadTotalExt : number; //Variable que va a almacenar el total de la cantidad extruida en una OT
  cantidadTotalImp : number; //Variable que va a almacenar el total de la cantidad impresa en una OT
  cantidadTotalDbl : number; //Variable que va a almacenar el total de la cantidad doblada en una OT
  proceso : string = ''; //Variable ayudará a almacenar el proceso del cuela se está consultando la ot
  totalPorcentajePerida : number; //Variable que ayudará a calcular el total de perdida en una OT
  name = 'Inventario_Materia_Prima.xlsx'; //Variable que le da nombre al archivo de excel que se genera
  inventInicial : number = 0; //Variable que almacena el inventario inicial de una materia prima
  sumaEntrada : number = 0; //Variable que almacena el total de entrada que tuvo una materia prima
  sumaSalida : number = 0; //Variable que almacena el total de salidas que tuvo una materia prima
  categorias : any = []; //variable que almacenará las categorias existentes
  categoriaBOPP : string;
  validarInput : any; //Variable para validar si el input de materia prima tiene información o no
  keyword = 'Nombre'; //Variable que le dirá al autocomplement por que caracteristica busca en el array
  public historyHeading: string = 'Seleccionado Recientemente'; //Variable que se mostrará al momento en que salen las materias primas buscadas recientemente
/** Nvo */
  categoriaSeleccionadaCombo = [];
/** Nvo */
  public load: boolean;


  MpConsultada = [];

  /** Adición */


  constructor(private ot : Orden_TrabajoService,
            private materiaPrimaService : MateriaPrimaService,
            private tintasService : TintasService,
              private categoriMpService : CategoriaMateriaPrimaService,
                private tipoBodegaService : TipoBodegaService,
                  private rolService : RolesService,
                    private frmBuilderMateriaPrima : FormBuilder,
                      @Inject(SESSION_STORAGE) private storage: WebStorageService,
                        private remisionService : RemisionService,
                          private remisionMpService : RemisionesMPService,
                            private facturaCompraService : FactuaMpCompradaService,
                              private facturaCompraMPService : FacturaMpService,
                                private asignacionService : AsignacionMPService,
                                  private asignacionMpService : DetallesAsignacionService,
                                    private asignacionTintasService : DetallesAsignacionTintasService,
                                      private recuperadoService : RecuperadoService,
                                        private recuperadoMPService : RecuperadoMPService,
                                          private inventInicialDiaService : InventInicialDiaService,
                                            private boppService : EntradaBOPPService,
                                              private asignacionBOPPService : AsignacionBOPPService,
                                                private detallesAsignacionBOPPService : DetalleAsignacion_BOPPService,
                                                  private devolucionesService : DevolucionesService,
                                                    private detallesDevolucionesService : DevolucionesMPService,
                                                      private entradaTintasService : Entrada_TintaService,
                                                        private detallesEntTintas : Detalles_EntradaTintasService,){

this.FormMateriaPrima = this.frmBuilderMateriaPrima.group({
MpId : ['', Validators.required],
MpNombre: [, Validators.required],
MpCantidad : ['', Validators.required],
MpPrecio: ['', Validators.required],
MpUnidadMedida: ['', Validators.required],
fecha: [this.today, Validators.required],
fechaFinal: ['', Validators.required],
MpCategoria : ['', Validators.required],
MpBodega : ['', Validators.required],
});

 this.load = true;
 this.validarInput = true;
  }

  ngOnInit(): void {
    this.lecturaStorage();
    this.ColumnasTabla();
    this.LimpiarCampos();
    this.fecha();
    this.obtenerCategorias();
    setTimeout(() => {
      this.obtenerBOPP();
      this.obtenerTintas();
      this.obtenerMateriasPrimasRetiradas();
    }, 500);
  }

  onChangeSearch(val: string) {
    if (val != '') this.validarInput = false;
    else this.validarInput = true;
    // fetch remote data from here
    // And reassign the 'data' which is binded to 'data' property.
  }

  // Funcion para validar si el input que contiene las materias primas está seleccionado, es decir que está esperando que se escriba sobre el
  onFocused(e){
    if (e.isTrusted || this.FormMateriaPrima.value.MpNombre != '') this.validarInput = true;
    // do something when input is focused
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

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = '$1,';
    return number.toString().replace(exp,rep);
  }

  //
  LimpiarCampos() {
    this.FormMateriaPrima = this.frmBuilderMateriaPrima.group({
      MpId : null,
      MpNombre: '',
      MpCantidad : null,
      MpPrecio: null,
      MpUnidadMedida: null,
      fecha: null,
      fechaFinal: null,
      MpCategoria : null,
      MpBodega : null,
    });
    this.valorTotal = 0;
    this.categoriaBOPP = '';
    this.materiasPrimas = [];
    this.validarInput = true;
    this.obtenerBOPP();
    this.obtenerMateriasPrimasRetiradas();
    this.obtenerTintas();
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

  // Funcion para obtener las diferentes categorias de materia prima existentes
  obtenerCategorias(){
    this.categoriMpService.srvObtenerLista().subscribe(datos_categorias => {
      for (let i = 0; i < datos_categorias.length; i++) {
        if (this.ValidarRol == 3 && datos_categorias[i].catMP_Id == 6) continue;
        else this.categorias.push(datos_categorias[i]);
      }
    });
  }

  // Funcion para mostrar las tintas
  obtenerTintas(){
    if (this.ValidarRol == 1 || this.ValidarRol == 3){
      this.tintasService.srvObtenerLista().subscribe(datos_materiaPrima => {
        for (let index = 0; index < datos_materiaPrima.length; index++) {
          const mp : any = {
            Id : datos_materiaPrima[index].tinta_Id,
            Nombre : datos_materiaPrima[index].tinta_Nombre,
          }
          this.materiasPrimas.push(mp);
          this.materiasPrimas.sort((a,b) => a.Nombre.localeCompare(b.Nombre));
        }
      });
    }
  }

  // Funcion para obtener el bopp existente
  obtenerBOPP(){
    if (this.ValidarRol == 1 || this.ValidarRol == 4) {
      this.boppService.srvObtenerLista().subscribe(datos_bopp => {
        for (let i = 0; i < datos_bopp.length; i++) {
          const bopp : any = {
            Id : datos_bopp[i].bopP_Id,
            Nombre : datos_bopp[i].bopP_Nombre,
          }
          this.materiasPrimas.push(bopp);
          this.materiasPrimas.sort((a,b) => a.Nombre.localeCompare(b.Nombre));
        }
      });
    }
  }

  // Funcion para obtener las materias primas registradas
  obtenerMateriasPrimasRetiradas(){
    if (this.ValidarRol == 1 || this.ValidarRol == 3){
      this.materiaPrimaService.srvObtenerLista().subscribe(datos_materiaPrima => {
        for (let index = 0; index < datos_materiaPrima.length; index++) {
          const mp : any = {
            Id : datos_materiaPrima[index].matPri_Id,
            Nombre : datos_materiaPrima[index].matPri_Nombre,
          }
          this.materiasPrimas.push(mp);
          this.materiasPrimas.sort((a,b) => a.Nombre.localeCompare(b.Nombre));
        }
      });
    }
  }

  // Funcion para buscar por id una materia prima o bopp o tinta
  buscarMpId(){

    this.ArrayMateriaPrima = [];
    this.valorTotal = 0;
    let idMateriaPrima : number = this.FormMateriaPrima.value.MpId;
    let sumaEntrada : number = 0;
    let sumaSalida : number = 0;
    this.materiaPrimaSeleccionada = [];
    this.categoriaMPBuscadaID = '';
    this.tipobodegaMPBuscadaId = '';
    this.categoriaBOPP = '';

    this.materiaPrimaService.srvObtenerListaPorId(idMateriaPrima).subscribe(datos_materiaPrima => {
      this.categoriMpService.srvObtenerListaPorId(datos_materiaPrima.catMP_Id).subscribe(datos_categoria => {
        this.tipoBodegaService.srvObtenerListaPorId(datos_materiaPrima.tpBod_Id).subscribe(datos_bodega => {
          this.materiaPrimaSeleccionada.push(datos_materiaPrima);
          this.materiasPrimas.push(datos_materiaPrima);
          this.categoriaMPBuscadaID = datos_categoria.catMP_Nombre;
          this.tipobodegaMPBuscadaId = datos_bodega.tpBod_Nombre;
          this.cargarFormMpEnTablas(this.ArrayMateriaPrima, datos_materiaPrima.matPri_Id, datos_materiaPrima.matPri_Nombre, datos_materiaPrima.matPri_Precio, this.inventInicial, sumaEntrada, sumaSalida, datos_materiaPrima.matPri_Stock, datos_materiaPrima.undMed_Id, this.categoriaMPBuscadaID);
        });
      });
    });

    this.boppService.srvObtenerListaPorSerial(idMateriaPrima).subscribe(datos_bopp => {
      for (const item of datos_bopp) {
        this.categoriaBOPP = 'BOPP';
        this.categoriMpService.srvObtenerListaPorId(item.catMP_Id).subscribe(datos_categoria => {
          this.tipoBodegaService.srvObtenerListaPorId(item.tpBod_Id).subscribe(datos_bodega => {
            this.materiaPrimaSeleccionada.push(item);
            this.materiasPrimas.push(item);
            this.categoriaMPBuscadaID = datos_categoria.catMP_Nombre;
            this.tipobodegaMPBuscadaId = datos_bodega.tpBod_Nombre;
            this.cargarFormMpEnTablas(this.ArrayMateriaPrima, item.bopP_Serial, item.bopP_Descripcion, item.bopP_Precio, item.bopP_CantidadInicialKg, sumaEntrada, sumaSalida, item.bopP_Stock, item.undMed_Kg, this.categoriaMPBuscadaID, item.bopP_Ancho);
          });
        });
      }
    });


  }


  /** Cargar combo materias primas al seleccionar cual categoria menos BOPP y tintas */
  cargarComboMatPrimaSegunCategorias(){
    let comboCategorias = this.FormMateriaPrima.get('MpCategoria')?.value;
    this.materiasPrimas = [];

    this.categoriMpService.srvObtenerListaPorId(comboCategorias).subscribe(registrosCategorias => {
      this.categoriaSeleccionadaCombo = registrosCategorias.catMP_Id;
      this.materiaPrimaService.srvObtenerLista().subscribe(registrosMatPrima => {
        for (let mp = 0; mp < registrosMatPrima.length; mp++) {
          if(this.categoriaSeleccionadaCombo == registrosMatPrima[mp].catMP_Id) {
            const matp : any = {
              Id : registrosMatPrima[mp].matPri_Id,
              Nombre : registrosMatPrima[mp].matPri_Nombre,
            }

            this.materiasPrimas.push(matp);

          } else if (comboCategorias == 6) {
            this.cargarComboBOPPSegunCategoria();
            break;
          }
        }
      });

      this.tintasService.srvObtenerLista().subscribe(datos_tintas => {
        for (let i = 0; i < datos_tintas.length; i++) {
          if (datos_tintas[i].catMP_Id == comboCategorias) {
            const mp : any = {
              Id : datos_tintas[i].tinta_Id,
              Nombre :datos_tintas[i].tinta_Nombre,
            }
            this.materiasPrimas.push(mp);
            this.materiasPrimas.sort((a,b) => a.Nombre.localeCompare(b.Nombre));
          }
        }
      });
    });
  }
  /** Nvo */

  /** Cargar combo materias primas al seleccionar categoria BOPP */
  cargarComboBOPPSegunCategoria() {
    let comboCategorias = this.FormMateriaPrima.get('MpCategoria')?.value;
    this.materiasPrimas = [];

    this.categoriMpService.srvObtenerListaPorId(comboCategorias).subscribe(registrosCategorias => {
      this.categoriaSeleccionadaCombo = registrosCategorias.catMP_Id;
      this.boppService.srvObtenerLista().subscribe(registrosBopp => {
        for (let b = 0; b < registrosBopp.length; b++) {
          if(this.categoriaSeleccionadaCombo == registrosBopp[b].catMP_Id) {
            const BOPPs : any = {
              Id : registrosBopp[b].bopP_Id,
              Nombre : registrosBopp[b].bopP_Nombre,
            }
            this.materiasPrimas.push(BOPPs);
          }
        }
      });
    });
  }

  //Funcion que consultara una materia prima con base a la que está seleccionada en la vista
  buscarMpSeleccionada(item){
    this.FormMateriaPrima.value.MpNombre = item.Id
    if (this.FormMateriaPrima.value.MpNombre != '') this.validarInput = false;
    else this.validarInput = true;
    this.ArrayMateriaPrima = [];
    this.valorTotal = 0;
    let nombreMateriaPrima : string = this.FormMateriaPrima.value.MpNombre;
    let idMateriaPrima : number; //En el HTML se pasará el nombre de la materia prima pero el input tendrá como valor el Id de la materia prima
    this.materiaPrimaSeleccionada = [];
    let sumaEntrada : number = 0;
    let sumaSalida : number = 0;
    this.categoriaBOPP = '';

    this.materiaPrimaService.srvObtenerListaPorId(nombreMateriaPrima).subscribe(datos_materiaPrima => {
      this.categoriMpService.srvObtenerListaPorId(datos_materiaPrima.catMP_Id).subscribe(datos_categoria => {
        this.tipoBodegaService.srvObtenerListaPorId(datos_materiaPrima.tpBod_Id).subscribe(datos_bodega => {
          this.materiaPrimaSeleccionada.push(datos_materiaPrima);
          this.materiasPrimas.push(datos_materiaPrima);
          this.categoriaMPBuscadaID = datos_categoria.catMP_Nombre;
          this.tipobodegaMPBuscadaId = datos_bodega.tpBod_Nombre;
          this.cargarFormMpEnTablas(this.ArrayMateriaPrima, datos_materiaPrima.matPri_Id, datos_materiaPrima.matPri_Nombre, datos_materiaPrima.matPri_Precio, this.inventInicial, sumaEntrada, sumaSalida, datos_materiaPrima.matPri_Stock, datos_materiaPrima.undMed_Id, this.categoriaMPBuscadaID);
        });
      });
    });

    this.boppService.srvObtenerListaPorId(nombreMateriaPrima).subscribe(datos_bopp => {
      let bopp : any = [];
      bopp.push(datos_bopp);
      for (const item of bopp) {
        this.categoriaBOPP = 'BOPP';
        this.categoriMpService.srvObtenerListaPorId(item.catMP_Id).subscribe(datos_categoria => {
          this.tipoBodegaService.srvObtenerListaPorId(item.tpBod_Id).subscribe(datos_bodega => {
            this.materiaPrimaSeleccionada.push(item);
            this.materiasPrimas.push(item);
            this.categoriaMPBuscadaID = datos_categoria.catMP_Nombre;
            this.tipobodegaMPBuscadaId = datos_bodega.tpBod_Nombre;
            this.cargarFormMpEnTablas(this.ArrayMateriaPrima, item.bopP_Serial, item.bopP_Descripcion, item.bopP_Precio, item.bopP_CantidadInicialKg, sumaEntrada, sumaSalida, item.bopP_Stock, 'Kg', this.categoriaMPBuscadaID, item.bopP_Ancho);
          });
        });
      }
    });

    this.tintasService.srvObtenerListaPorId(nombreMateriaPrima).subscribe(datos_tinta => {
      this.categoriMpService.srvObtenerListaPorId(datos_tinta.catMP_Id).subscribe(datos_categoria => {
        this.tipoBodegaService.srvObtenerListaPorId(datos_tinta.tpBod_Id).subscribe(datos_bodega => {
          this.materiaPrimaSeleccionada.push(datos_tinta);
          this.materiasPrimas.push(datos_tinta);
          this.categoriaMPBuscadaID = datos_categoria.catMP_Nombre;
          this.tipobodegaMPBuscadaId = datos_bodega.tpBod_Nombre;
          this.cargarFormMpEnTablas(this.ArrayMateriaPrima, datos_tinta.tinta_Id, datos_tinta.tinta_Nombre, datos_tinta.tinta_Precio, this.inventInicial, sumaEntrada, sumaSalida, datos_tinta.tinta_Stock, datos_tinta.undMed_Id, this.categoriaMPBuscadaID);
        });
      });
    });
  }

  // Funcion que buscará el BOPP
  buscarBOPPSegunFecha(){
    let fecha : any = this.FormMateriaPrima.value.fecha;
    let fechaFinal : any = this.FormMateriaPrima.value.fechaFinal;
    this.materiasPrimas = [];
    this.obtenerMateriasPrimasRetiradas();
    let IdBOPP : any = [];

    if (fecha != null && fechaFinal != null) {
      this.asignacionBOPPService.srvObtenerListaPorfechas(fecha, fechaFinal).subscribe(datos_asignaciones => {
        for (let i = 0; i < datos_asignaciones.length; i++) {
          this.detallesAsignacionBOPPService.srvObtenerListaPorAsignacion(datos_asignaciones[i].asigBOPP_Id).subscribe(datos_detallesBOPP => {
            for (let j = 0; j < datos_detallesBOPP.length; j++) {
              this.boppService.srvObtenerListaPorId(datos_detallesBOPP[j].bopP_Id).subscribe(datos_bopp => {
                let bopp : any = [];
                bopp.push(datos_bopp);
                for (const item of bopp) {
                  if (!IdBOPP.includes(item.bopP_Id)) {
                    IdBOPP.push(item.bopP_Id)
                    const BOPPs : any = {
                      Id : item.bopP_Id,
                      Nombre : item.bopP_Nombre,
                    }
                    this.materiasPrimas.push(BOPPs);
                    this.materiasPrimas.sort((a,b) => a.Nombre.localeCompare(b.Nombre));
                  } else continue;
                }
              });
            }
          });
        }
      });
    } else if (fecha != null){
      this.asignacionBOPPService.srvObtenerListaPorfecha(fecha).subscribe(datos_asignaciones => {
        for (let i = 0; i < datos_asignaciones.length; i++) {
          this.detallesAsignacionBOPPService.srvObtenerListaPorAsignacion(datos_asignaciones[i].asigBOPP_Id).subscribe(datos_detallesBOPP => {
            for (let j = 0; j < datos_detallesBOPP.length; j++) {
              this.boppService.srvObtenerListaPorId(datos_detallesBOPP[j].bopP_Id).subscribe(datos_bopp => {
                let bopp : any = [];
                bopp.push(datos_bopp);
                for (const item of bopp) {
                  if (!IdBOPP.includes(item.bopP_Id)) {
                    IdBOPP.push(item.bopP_Id)
                    const BOPPs : any = {
                      Id : item.bopP_Id,
                      Nombre : item.bopP_Nombre,
                    }
                    this.materiasPrimas.push(BOPPs);
                    this.materiasPrimas.sort((a,b) => a.Nombre.localeCompare(b.Nombre));
                  } else continue;
                }
              });
            }
          });
        }
      });
    }
  }

  //Funcion que colocará el nombre a las columnas de la tabla en la cual se muestran los productos pedidos por los clientes
  ColumnasTabla(){
    this.titulosTabla = [];
    this.titulosTabla = [{
      mpId : "Id",
      mpNombre : "Nombre",
      mpInicial : "Inventario Inicial",
      mpEntrada : "Entrada",
      mpSalida : "Salida",
      mpCantidad : "Cantidad Actual",
      mpDiferencia : "Diferencia",
      mpUndMedCant : "Und. Cant",
      mpPrecioU : "Precio U",
      mpSubTotal : "SubTotal",
      mpCategoria : 'Categoria',
    }]
  }

  // Funcion que cargará las informacion de las materias primas segun los filtros que se consulten
  cargarFormMpEnTablas(formulario : any, id: number, nombre : string, precio : number, inicial : number, entrada : number, salida : number, cantidad : number, undMEd : string, categoria : any, ancho? : number ){
    if (this.categoriaBOPP == 'BOPP') {
      this.valorTotal = this.valorTotal + precio * cantidad;
      let productoExt : any = {
        Id : id,
        Nombre : nombre,
        Ancho : ancho,
        Inicial : inicial,
        Entrada : entrada,
        Salida : salida,
        Cant : cantidad,
        Diferencia : cantidad - inicial,
        UndCant : undMEd,
        PrecioUnd : precio,
        SubTotal : precio * cantidad,
        Categoria : categoria,
      }

      this.ArrayMateriaPrima.push(productoExt);
      this.ArrayMateriaPrima.sort((a,b) => a.Nombre.localeCompare(b.Nombre));
      this.load = true;
    } else {
      let subtotalProd : number = precio * cantidad;
      this.valorTotal = this.valorTotal + subtotalProd;
      let productoExt : any = {
        Id : id,
        Nombre : nombre,
        Ancho : ancho,
        Inicial : inicial,
        Entrada : entrada,
        Salida : salida,
        Cant : cantidad,
        Diferencia : cantidad - inicial,
        UndCant : undMEd,
        PrecioUnd : precio,
        SubTotal : subtotalProd,
        Categoria : categoria,
      }

      this.ArrayMateriaPrima.push(productoExt);
      this.ArrayMateriaPrima.sort((a,b) => a.Nombre.localeCompare(b.Nombre));
      this.load = true;
    }
  }

  // Funcion que realizará la busqueda de materias primas segun los filtros que se consulten y le enviará la informacion a la funcion "cargarFormMpEnTablas"
  validarConsulta(){
    let materiaPrima : any = this.FormMateriaPrima.value.MpNombre.Id;
    if (materiaPrima == undefined) materiaPrima = null;
    let idMateriaPrima : number = this.FormMateriaPrima.value.MpId;
    let fecha : any = this.FormMateriaPrima.value.fecha;
    let fechaFinal : any = this.FormMateriaPrima.value.fechaFinal;
    let categoria : any = this.FormMateriaPrima.value.MpCategoria;
    let bodega : any = this.FormMateriaPrima.value.MpBodega;
    this.ArrayMateriaPrima = [];
    this.valorTotal = 0;
    this.sumaSalida = 0;
    this.sumaEntrada = 0;
    this.categoriaBOPP = '';
    let materia_cantidad = [];
    let materia_cantidad_tintas = [];
    let materia_cantidad_tintas_Entrada = [];
    let materia_cantidad_factura = [];
    let materia_cantidad_remision = [];
    let materia_cantidad_recuperado = [];
    let materia_cantidad_devoluciones = [];
    let bopp_entrante = [];
    let bopp_Saliente = [];
    this.categoriaBOPP = '';

    if (fecha != null && fechaFinal != null && (materiaPrima != null || idMateriaPrima != null) && categoria != null) {
      this.load = false;

      if (materiaPrima != null) {
        this.asignacionService.srvObtenerListaPorFechas(fecha, fechaFinal).subscribe(datos_asignaciones => {
          for (let i = 0; i < datos_asignaciones.length; i++) {
            this.asignacionMpService.srvObtenerListaPorAsigId(datos_asignaciones[i].asigMp_Id).subscribe(datos_asignacionesMP => {
              for (let j = 0; j < datos_asignacionesMP.length; j++) {
                this.materiaPrimaService.srvObtenerListaPorId(datos_asignacionesMP[j].matPri_Id).subscribe(datos_materiaPrima => {
                  if (datos_materiaPrima.catMP_Id == categoria && datos_materiaPrima.matPri_Id == materiaPrima) {
                    const matCant : any = {
                      materiaPrima : datos_materiaPrima.matPri_Id,
                      cantidad : datos_asignacionesMP[j].dtAsigMp_Cantidad,
                      categoria : datos_materiaPrima.catMP_Id,
                    }
                    materia_cantidad.push(matCant);
                  }
                });
              }
            });

            this.asignacionTintasService.srvObtenerListaPor_Asignacion(datos_asignaciones[i].asigMp_Id).subscribe(datos_asignacionTintas => {
              for (let j = 0; j < datos_asignacionTintas.length; j++) {
                this.tintasService.srvObtenerListaPorId(datos_asignacionTintas[j].tinta_Id).subscribe(datos_tintas => {
                  if (datos_tintas.catMP_Id == categoria) {
                    const matCant : any = {
                      materiaPrima : datos_tintas.tinta_Id,
                      cantidad : datos_asignacionTintas[j].dtAsigTinta_Cantidad,
                      categoria : datos_tintas.catMP_Id,
                    }
                    materia_cantidad.push(matCant);
                  }
                });
              }
            });
          }
        });

        this.boppService.srvObtenerListaPorFechas(fecha, fechaFinal).subscribe(datos_bopp => {
          for (let i = 0; i < datos_bopp.length; i++) {
            if (datos_bopp[i].catMP_Id == categoria && datos_bopp[i].bopP_Id == materiaPrima) {

            const matCant : any = {
              materiaPrima : datos_bopp[i].bopP_Id,
              cantidad : datos_bopp[i].bopP_CantidadInicialKg,
            }
              bopp_entrante.push(matCant);
            }
          }
        });

        this.asignacionBOPPService.srvObtenerListaPorfechas(fecha, fechaFinal).subscribe(datos_asignacionBopp => {
          for (let i = 0; i < datos_asignacionBopp.length; i++) {
            this.detallesAsignacionBOPPService.srvObtenerListaPorAsignacion(datos_asignacionBopp[i].asigBOPP_Id).subscribe(datos_detallesAsgBopp => {
              for (let j = 0; j < datos_detallesAsgBopp.length; j++) {
                this.boppService.srvObtenerListaPorId(datos_detallesAsgBopp[j].bopP_Id).subscribe(datos_bopp => {
                  let bopp : any = [];
                  bopp.push(datos_bopp);
                  for (const item of bopp) {
                    if (item.catMP_Id == categoria && item.bopP_Id == materiaPrima) {
                      const matCant : any = {
                        materiaPrima : item.bopP_Id,
                        cantidad : datos_detallesAsgBopp[j].dtAsigBOPP_Cantidad,
                      }
                      bopp_Saliente.push(matCant);
                    }
                  }
                });
              }
            });
          }
        });

        this.facturaCompraService.srvObtenerListaPorFechas(fecha, fechaFinal).subscribe(datos_factura => {
          for (let i = 0; i < datos_factura.length; i++) {
            this.facturaCompraMPService.srvObtenerListaPorFacId(datos_factura[i].facco_Id).subscribe(datos_facturaMP => {
              console.log(datos_facturaMP)
              for (let j = 0; j < datos_facturaMP.length; j++) {
                this.materiaPrimaService.srvObtenerListaPorId(datos_facturaMP[j].matPri_Id).subscribe(datos_materiaPrima => {
                  if (datos_materiaPrima.catMP_Id == categoria && datos_materiaPrima.matPri_Id == materiaPrima) {
                    const matCant : any = {
                      materiaPrima : datos_materiaPrima.matPri_Id,
                      cantidad : datos_facturaMP[j].faccoMatPri_Cantidad,
                    }
                    materia_cantidad_factura.push(matCant);
                  }
                });
              }
            });
          }
        });

        this.remisionService.srvObtenerListaPorFechas(fecha, fechaFinal).subscribe(datos_remisiones => {
          for (let i = 0; i < datos_remisiones.length; i++) {
            this.remisionMpService.srvObtenerListaPorRemId(datos_remisiones[i].rem_Id).subscribe(datos_remisionMP => {
              for (let j = 0; j < datos_remisionMP.length; j++) {
                this.materiaPrimaService.srvObtenerListaPorId(datos_remisionMP[j].matPri_Id).subscribe(datos_materiaPrima => {
                  if (datos_materiaPrima.catMP_Id == categoria && datos_materiaPrima.matPri_Id == materiaPrima) {
                    const matCant : any = {
                      materiaPrima : datos_materiaPrima.matPri_Id,
                      cantidad : datos_remisionMP[j].remiMatPri_Cantidad,
                    }
                    materia_cantidad_remision.push(matCant);
                  }
                });
              }
            });
          }
        });

        this.recuperadoService.srvObtenerListaPorFechas(fecha, fechaFinal).subscribe(datos_recuperado => {
          for (let i = 0; i < datos_recuperado.length; i++) {
            this.recuperadoMPService.srvObtenerListaPorRecuperadoId(datos_recuperado[i].recMp_Id).subscribe(datos_recuperadoMP => {
              for (let j = 0; j < datos_recuperadoMP.length; j++) {
                this.materiaPrimaService.srvObtenerListaPorId(datos_recuperadoMP[j].matPri_Id).subscribe(datos_materiaPrima => {
                  if (datos_materiaPrima.catMP_Id == categoria && datos_materiaPrima.matPri_Id == materiaPrima) {
                    const matCant : any = {
                      materiaPrima : datos_materiaPrima.matPri_Id,
                      cantidad : datos_recuperadoMP[j].recMatPri_Cantidad,
                    }
                    materia_cantidad_recuperado.push(matCant);
                  }
                });
              }
            });
          }
        });

        this.devolucionesService.srvObtenerListaPofechas(fecha, fechaFinal).subscribe(datos_devoluciones => {
          for (let i = 0; i < datos_devoluciones.length; i++) {
            this.detallesDevolucionesService.srvObtenerListaPorDevId(datos_devoluciones[i].devMatPri_Id).subscribe(datos_detallesDevoluciones => {
              for (let j = 0; j < datos_detallesDevoluciones.length; j++) {
                this.materiaPrimaService.srvObtenerListaPorId(datos_detallesDevoluciones[j].matPri_Id).subscribe(datos_materiaPrima => {
                  const matCant : any = {
                    materiaPrima : datos_materiaPrima.matPri_Id,
                    cantidad : datos_detallesDevoluciones[j].dtDevMatPri_CantidadDevuelta,
                  }
                  materia_cantidad_devoluciones.push(matCant);
                });
              }
            });
          }
        });

        this.detallesEntTintas.srvObtenerListaPorFechas(fecha, fechaFinal).subscribe(datos_entradaTinta => {
          for (let i = 0; i < datos_entradaTinta.length; i++) {
            this.tintasService.srvObtenerListaPorId(datos_entradaTinta[i].tinta_Id).subscribe(datos_tintas => {
              let tintaCant : any = {
                materiaPrima : datos_entradaTinta[i].tinta_Id,
                categoria : datos_tintas.catMP_Id,
                cantidad : datos_entradaTinta[i].dtEntTinta_Cantidad,
              }
              materia_cantidad_tintas_Entrada.push(tintaCant);
            });
          }
        });

        setTimeout(() => {
          if (this.ValidarRol == 1 || this.ValidarRol == 3){
            this.materiaPrimaService.srvObtenerListaPorId(materiaPrima).subscribe(datos_materiaPrima => {
              let mp : any = [];
              mp.push(datos_materiaPrima);
              for (const item of mp) {
                if (item.catMP_Id == categoria) {
                  this.categoriMpService.srvObtenerListaPorId(item.catMP_Id).subscribe(datos_categoria => {
                    this.inventInicialDiaService.srvObtenerListaPorId(item.matPri_Id).subscribe(datos_inventarioInicial => {
                      this.sumaSalida = 0;
                      this.sumaEntrada = 0;
                      this.inventInicial = 0;
                      this.inventInicial = datos_inventarioInicial.invInicial_Stock;
                      // Asignaciones
                      for (const item of materia_cantidad) {
                        if (item.matPri_Id == item.materiaPrima && item.categoria != 7) this.sumaSalida = this.sumaSalida + item.cantidad;
                      }
                      // Facturas
                      for (const item of materia_cantidad_factura) {
                        if (item.matPri_Id == item.materiaPrima) this.sumaEntrada = this.sumaEntrada + item.cantidad;
                      }
                      // Remisiones
                      for (const item of materia_cantidad_remision) {
                        if (item.matPri_Id == item.materiaPrima) this.sumaEntrada = this.sumaEntrada + item.cantidad;
                      }

                      // Recuperado
                      for (const item of materia_cantidad_recuperado) {
                        if (item.matPri_Id == item.materiaPrima) this.sumaEntrada = this.sumaEntrada + item.cantidad;
                      }

                      // Devoluciones
                      for (const item of materia_cantidad_devoluciones) {
                        if (item.matPri_Id == item.materiaPrima) {
                          this.sumaEntrada += item.cantidad;
                          this.sumaSalida -= item.cantidad;
                        }
                      }

                      this.inventInicial = 0;
                      this.inventInicial = datos_inventarioInicial.invInicial_Stock;

                      this.cargarFormMpEnTablas(this.ArrayMateriaPrima,
                        item.matPri_Id,
                        item.matPri_Nombre,
                        item.matPri_Precio,
                        this.inventInicial,
                        this.sumaEntrada,
                        this.sumaSalida,
                        item.matPri_Stock,
                        item.undMed_Id,
                        datos_categoria.catMP_Nombre);
                    });
                  });
                }
              }
            });

            this.tintasService.srvObtenerListaPorId(materiaPrima).subscribe(datos_tintas => {
              for (let i = 0; i < datos_tintas.length; i++) {
                if (datos_tintas[i].catMP_Id == categoria) {
                  this.categoriMpService.srvObtenerListaPorId(datos_tintas[i].catMP_Id).subscribe(datos_categoria => {
                    this.sumaSalida = 0;
                      this.sumaEntrada = 0;
                      this.inventInicial = 0;
                      this.inventInicial = 0;
                      // Entradas
                      for (const item of materia_cantidad_tintas_Entrada) {
                        if (datos_tintas[i].tinta_Id == item.materiaPrima && item.categoria == 7) {
                          this.sumaEntrada = this.sumaEntrada + item.cantidad;
                        }
                      }

                      // Asignaciones
                      for (const item of materia_cantidad_tintas) {
                        if (datos_tintas[i].tinta_Id == item.materiaPrima && item.categoria == 7) {
                          this.sumaEntrada = this.sumaEntrada + item.cantidad;
                        }
                      }

                      this.inventInicial = 0;
                      this.inventInicial = 0;

                      this.cargarFormMpEnTablas(this.ArrayMateriaPrima,
                        datos_tintas[i].tinta_Id,
                        datos_tintas[i].tinta_Nombre,
                        datos_tintas[i].tinta_Precio,
                        datos_tintas[i].tinta_InvInicial,
                        this.sumaEntrada,
                        this.sumaSalida,
                        datos_tintas[i].tinta_Stock,
                        datos_tintas[i].undMed_Id,
                        datos_categoria.catMP_Nombre);
                  });
                }
              }
            });
          }

          if (this.ValidarRol == 1 || this.ValidarRol == 4){
            this.boppService.srvObtenerLista().subscribe(datos_bopp => {
              for (let i = 0; i < datos_bopp.length; i++) {
                if (datos_bopp[i].catMP_Id == categoria && datos_bopp[i].bopP_Id == materiaPrima) {
                  this.categoriaBOPP = 'BOPP';
                  this.categoriMpService.srvObtenerListaPorId(datos_bopp[i].catMP_Id).subscribe(datos_categoria => {
                    this.sumaSalida = 0;
                    this.sumaEntrada = 0;
                    this.inventInicial = 0;
                    for (const item of bopp_Saliente) {
                      if (datos_bopp[i].bopP_Id == item.materiaPrima && datos_categoria.catMP_Id == categoria) {
                        this.sumaSalida = this.sumaSalida + item.cantidad;
                      }
                    }

                    for (const item of bopp_entrante) {
                      if (datos_bopp[i].bopP_Id == item.materiaPrima && datos_categoria.catMP_Id == categoria) {
                        this.sumaEntrada = this.sumaEntrada + + item.cantidad;
                      }
                    }

                    this.inventInicial = 0;

                    this.cargarFormMpEnTablas(this.ArrayMateriaPrima,
                      datos_bopp[i].bopP_Serial,
                      datos_bopp[i].bopP_Descripcion, /** Descripcion en vez de nombre */
                      datos_bopp[i].bopP_Precio,
                      datos_bopp[i].bopP_CantidadInicialKg,
                      this.sumaEntrada,
                      this.sumaSalida,
                      datos_bopp[i].bopP_Stock,
                      "Kg",
                      datos_categoria.catMP_Nombre,
                      datos_bopp[i].bopP_Ancho);
                  });
                }
              }
            });
          }
        }, 2000);
      } else if (idMateriaPrima != null) {
        this.asignacionService.srvObtenerListaPorFechas(fecha, fechaFinal).subscribe(datos_asignaciones => {
          for (let i = 0; i < datos_asignaciones.length; i++) {
            this.asignacionMpService.srvObtenerListaPorAsigId(datos_asignaciones[i].asigMp_Id).subscribe(datos_asignacionesMP => {
              for (let j = 0; j < datos_asignacionesMP.length; j++) {
                this.materiaPrimaService.srvObtenerListaPorId(datos_asignacionesMP[j].matPri_Id).subscribe(datos_materiaPrima => {
                  if (datos_materiaPrima.catMP_Id == categoria && datos_materiaPrima.matPri_Id == idMateriaPrima) {
                    const matCant : any = {
                      materiaPrima : datos_materiaPrima.matPri_Id,
                      cantidad : datos_asignacionesMP[j].dtAsigMp_Cantidad,
                      categoria : datos_materiaPrima.catMP_Id,
                    }
                    materia_cantidad.push(matCant);
                  }
                });
              }
            });

            this.asignacionTintasService.srvObtenerListaPor_Asignacion(datos_asignaciones[i].asigMp_Id).subscribe(datos_asignacionTintas => {
              for (let j = 0; j < datos_asignacionTintas.length; j++) {
                this.tintasService.srvObtenerListaPorId(datos_asignacionTintas[j].tinta_Id).subscribe(datos_tintas => {
                  if (datos_tintas.catMP_Id == categoria) {
                    const matCant : any = {
                      materiaPrima : datos_tintas.tinta_Id,
                      cantidad : datos_asignacionTintas[j].dtAsigTinta_Cantidad,
                      categoria : datos_tintas.catMP_Id,
                    }
                    materia_cantidad.push(matCant);
                  }
                });
              }
            });
          }
        });

        this.boppService.srvObtenerListaPorFechas(fecha, fechaFinal).subscribe(datos_bopp => {
          for (let i = 0; i < datos_bopp.length; i++) {
            if (datos_bopp[i].catMP_Id == categoria && datos_bopp[i].bopP_Id == idMateriaPrima) {

            const matCant : any = {
              materiaPrima : datos_bopp[i].bopP_Id,
              cantidad : datos_bopp[i].bopP_CantidadInicialKg,
            }
              bopp_entrante.push(matCant);
            }
          }
        });

        this.asignacionBOPPService.srvObtenerListaPorfechas(fecha, fechaFinal).subscribe(datos_asignacionBopp => {
          for (let i = 0; i < datos_asignacionBopp.length; i++) {
            this.detallesAsignacionBOPPService.srvObtenerListaPorAsignacion(datos_asignacionBopp[i].asigBOPP_Id).subscribe(datos_detallesAsgBopp => {
              for (let j = 0; j < datos_detallesAsgBopp.length; j++) {
                this.boppService.srvObtenerListaPorId(datos_detallesAsgBopp[j].bopP_Id).subscribe(datos_bopp => {
                  let bopp : any = [];
                  bopp.push(datos_bopp);
                  for (const item of bopp) {
                    if (item.catMP_Id == categoria && item.bopP_Id == idMateriaPrima) {
                      const matCant : any = {
                        materiaPrima : item.bopP_Id,
                        cantidad : datos_detallesAsgBopp[j].dtAsigBOPP_Cantidad,
                      }
                      bopp_Saliente.push(matCant);
                    }
                  }
                });
              }
            });
          }
        });

        this.facturaCompraService.srvObtenerListaPorFechas(fecha, fechaFinal).subscribe(datos_factura => {
          for (let i = 0; i < datos_factura.length; i++) {
            this.facturaCompraMPService.srvObtenerListaPorFacId(datos_factura[i].facco_Id).subscribe(datos_facturaMP => {
              console.log(datos_facturaMP)
              for (let j = 0; j < datos_facturaMP.length; j++) {
                this.materiaPrimaService.srvObtenerListaPorId(datos_facturaMP[j].matPri_Id).subscribe(datos_materiaPrima => {
                  if (datos_materiaPrima.catMP_Id == categoria && datos_materiaPrima.matPri_Id == idMateriaPrima) {
                    const matCant : any = {
                      materiaPrima : datos_materiaPrima.matPri_Id,
                      cantidad : datos_facturaMP[j].faccoMatPri_Cantidad,
                    }
                    materia_cantidad_factura.push(matCant);
                  }
                });
              }
            });
          }
        });

        this.remisionService.srvObtenerListaPorFechas(fecha, fechaFinal).subscribe(datos_remisiones => {
          for (let i = 0; i < datos_remisiones.length; i++) {
            this.remisionMpService.srvObtenerListaPorRemId(datos_remisiones[i].rem_Id).subscribe(datos_remisionMP => {
              for (let j = 0; j < datos_remisionMP.length; j++) {
                this.materiaPrimaService.srvObtenerListaPorId(datos_remisionMP[j].matPri_Id).subscribe(datos_materiaPrima => {
                  if (datos_materiaPrima.catMP_Id == categoria && datos_materiaPrima.matPri_Id == idMateriaPrima) {
                    const matCant : any = {
                      materiaPrima : datos_materiaPrima.matPri_Id,
                      cantidad : datos_remisionMP[j].remiMatPri_Cantidad,
                    }
                    materia_cantidad_remision.push(matCant);
                  }
                });
              }
            });
          }
        });

        this.recuperadoService.srvObtenerListaPorFechas(fecha, fechaFinal).subscribe(datos_recuperado => {
          for (let i = 0; i < datos_recuperado.length; i++) {
            this.recuperadoMPService.srvObtenerListaPorRecuperadoId(datos_recuperado[i].recMp_Id).subscribe(datos_recuperadoMP => {
              for (let j = 0; j < datos_recuperadoMP.length; j++) {
                this.materiaPrimaService.srvObtenerListaPorId(datos_recuperadoMP[j].matPri_Id).subscribe(datos_materiaPrima => {
                  if (datos_materiaPrima.catMP_Id == categoria && datos_materiaPrima.matPri_Id == idMateriaPrima) {
                    const matCant : any = {
                      materiaPrima : datos_materiaPrima.matPri_Id,
                      cantidad : datos_recuperadoMP[j].recMatPri_Cantidad,
                    }
                    materia_cantidad_recuperado.push(matCant);
                  }
                });
              }
            });
          }
        });

        this.devolucionesService.srvObtenerListaPofechas(fecha, fechaFinal).subscribe(datos_devoluciones => {
          for (let i = 0; i < datos_devoluciones.length; i++) {
            this.detallesDevolucionesService.srvObtenerListaPorDevId(datos_devoluciones[i].devMatPri_Id).subscribe(datos_detallesDevoluciones => {
              for (let j = 0; j < datos_detallesDevoluciones.length; j++) {
                this.materiaPrimaService.srvObtenerListaPorId(datos_detallesDevoluciones[j].matPri_Id).subscribe(datos_materiaPrima => {
                  const matCant : any = {
                    materiaPrima : datos_materiaPrima.matPri_Id,
                    cantidad : datos_detallesDevoluciones[j].dtDevMatPri_CantidadDevuelta,
                  }
                  materia_cantidad_devoluciones.push(matCant);
                });
              }
            });
          }
        });

        this.detallesEntTintas.srvObtenerListaPorFechas(fecha, fechaFinal).subscribe(datos_entradaTinta => {
          for (let i = 0; i < datos_entradaTinta.length; i++) {
            this.tintasService.srvObtenerListaPorId(datos_entradaTinta[i].tinta_Id).subscribe(datos_tintas => {
              let tintaCant : any = {
                materiaPrima : datos_entradaTinta[i].tinta_Id,
                categoria : datos_tintas.catMP_Id,
                cantidad : datos_entradaTinta[i].dtEntTinta_Cantidad,
              }
              materia_cantidad_tintas_Entrada.push(tintaCant);
            });
          }
        });

        setTimeout(() => {
          if (this.ValidarRol == 1 || this.ValidarRol == 3){
            this.materiaPrimaService.srvObtenerListaPorId(idMateriaPrima).subscribe(datos_materiaPrima => {
              let mp : any = [];
              mp.push(datos_materiaPrima);
              for (const item of mp) {
                if (item.catMP_Id == categoria) {
                  this.categoriMpService.srvObtenerListaPorId(item.catMP_Id).subscribe(datos_categoria => {
                    this.inventInicialDiaService.srvObtenerListaPorId(item.matPri_Id).subscribe(datos_inventarioInicial => {
                      this.sumaSalida = 0;
                      this.sumaEntrada = 0;
                      this.inventInicial = 0;
                      this.inventInicial = datos_inventarioInicial.invInicial_Stock;
                      // Asignaciones
                      for (const item of materia_cantidad) {
                        if (item.matPri_Id == item.materiaPrima && item.categoria != 7) this.sumaSalida = this.sumaSalida + item.cantidad;
                      }
                      // Facturas
                      for (const item of materia_cantidad_factura) {
                        if (item.matPri_Id == item.materiaPrima) this.sumaEntrada = this.sumaEntrada + item.cantidad;
                      }
                      // Remisiones
                      for (const item of materia_cantidad_remision) {
                        if (item.matPri_Id == item.materiaPrima) this.sumaEntrada = this.sumaEntrada + item.cantidad;
                      }

                      // Recuperado
                      for (const item of materia_cantidad_recuperado) {
                        if (item.matPri_Id == item.materiaPrima) this.sumaEntrada = this.sumaEntrada + item.cantidad;
                      }

                      // Devoluciones
                      for (const item of materia_cantidad_devoluciones) {
                        if (item.matPri_Id == item.materiaPrima) {
                          this.sumaEntrada += item.cantidad;
                          this.sumaSalida -= item.cantidad;
                        }
                      }

                      this.inventInicial = 0;
                      this.inventInicial = datos_inventarioInicial.invInicial_Stock;

                      this.cargarFormMpEnTablas(this.ArrayMateriaPrima,
                        item.matPri_Id,
                        item.matPri_Nombre,
                        item.matPri_Precio,
                        this.inventInicial,
                        this.sumaEntrada,
                        this.sumaSalida,
                        item.matPri_Stock,
                        item.undMed_Id,
                        datos_categoria.catMP_Nombre);
                    });
                  });
                }
              }
            });

            this.tintasService.srvObtenerListaPorId(idMateriaPrima).subscribe(datos_tintas => {
              for (let i = 0; i < datos_tintas.length; i++) {
                if (datos_tintas[i].catMP_Id == categoria) {
                  this.categoriMpService.srvObtenerListaPorId(datos_tintas[i].catMP_Id).subscribe(datos_categoria => {
                    this.sumaSalida = 0;
                      this.sumaEntrada = 0;
                      this.inventInicial = 0;
                      this.inventInicial = 0;
                      // Entradas
                      for (const item of materia_cantidad_tintas_Entrada) {
                        if (datos_tintas[i].tinta_Id == item.materiaPrima && item.categoria == 7) {
                          this.sumaEntrada = this.sumaEntrada + item.cantidad;
                        }
                      }

                      // Asignaciones
                      for (const item of materia_cantidad_tintas) {
                        if (datos_tintas[i].tinta_Id == item.materiaPrima && item.categoria == 7) {
                          this.sumaEntrada = this.sumaEntrada + item.cantidad;
                        }
                      }

                      this.inventInicial = 0;
                      this.inventInicial = 0;

                      this.cargarFormMpEnTablas(this.ArrayMateriaPrima,
                        datos_tintas[i].tinta_Id,
                        datos_tintas[i].tinta_Nombre,
                        datos_tintas[i].tinta_Precio,
                        datos_tintas[i].tinta_InvInicial,
                        this.sumaEntrada,
                        this.sumaSalida,
                        datos_tintas[i].tinta_Stock,
                        datos_tintas[i].undMed_Id,
                        datos_categoria.catMP_Nombre);
                  });
                }
              }
            });
          }

          if (this.ValidarRol == 1 || this.ValidarRol == 4){
            this.boppService.srvObtenerLista().subscribe(datos_bopp => {
              for (let i = 0; i < datos_bopp.length; i++) {
                if (datos_bopp[i].catMP_Id == categoria && datos_bopp[i].bopP_Id == idMateriaPrima) {
                  this.categoriaBOPP = 'BOPP';
                  this.categoriMpService.srvObtenerListaPorId(datos_bopp[i].catMP_Id).subscribe(datos_categoria => {
                    this.sumaSalida = 0;
                    this.sumaEntrada = 0;
                    this.inventInicial = 0;
                    for (const item of bopp_Saliente) {
                      if (datos_bopp[i].bopP_Id == item.materiaPrima && datos_categoria.catMP_Id == categoria) {
                        this.sumaSalida = this.sumaSalida + item.cantidad;
                      }
                    }

                    for (const item of bopp_entrante) {
                      if (datos_bopp[i].bopP_Id == item.materiaPrima && datos_categoria.catMP_Id == categoria) {
                        this.sumaEntrada = this.sumaEntrada + + item.cantidad;
                      }
                    }

                    this.inventInicial = 0;

                    this.cargarFormMpEnTablas(this.ArrayMateriaPrima,
                      datos_bopp[i].bopP_Serial,
                      datos_bopp[i].bopP_Descripcion, /** Descripcion en vez de nombre */
                      datos_bopp[i].bopP_Precio,
                      datos_bopp[i].bopP_CantidadInicialKg,
                      this.sumaEntrada,
                      this.sumaSalida,
                      datos_bopp[i].bopP_Stock,
                      "Kg",
                      datos_categoria.catMP_Nombre,
                      datos_bopp[i].bopP_Ancho);
                  });
                }
              }
            });
          }
        }, 2000);
      }

    } else if (fecha != null && fechaFinal != null && (materiaPrima != null || idMateriaPrima != null)) {
      this.load = false;

      if (materiaPrima != null) {

        this.asignacionService.srvObtenerListaPorFechas(fecha, fechaFinal).subscribe(datos_asignaciones => {
          for (let i = 0; i < datos_asignaciones.length; i++) {
            this.asignacionMpService.srvObtenerListaPorAsigId(datos_asignaciones[i].asigMp_Id).subscribe(datos_asignacionMP => {
              for (let j = 0; j < datos_asignacionMP.length; j++) {
                if (datos_asignacionMP[j].matPri_Id == materiaPrima) {
                  const matCant : any = {
                    materiaPrima : materiaPrima,
                    cantidad : datos_asignacionMP[j].dtAsigMp_Cantidad,
                  }
                  materia_cantidad.push(matCant);
                }
              }
            });
          }
        });

        this.facturaCompraService.srvObtenerListaPorFechas(fecha, fechaFinal).subscribe(datos_factura => {
          for (let i = 0; i < datos_factura.length; i++) {
            this.facturaCompraMPService.srvObtenerListaPorFacId(datos_factura[i].facco_Id).subscribe(datos_facturaMP => {
              console.log(datos_facturaMP)
              for (let j = 0; j < datos_facturaMP.length; j++) {
                if (datos_facturaMP[j].matPri_Id == materiaPrima) {
                  const matCant : any = {
                    materiaPrima : materiaPrima,
                    cantidad : datos_facturaMP[j].faccoMatPri_Cantidad,
                  }
                  materia_cantidad_factura.push(matCant);
                }
              }
            });
          }
        });

        this.remisionService.srvObtenerListaPorFechas(fecha, fechaFinal).subscribe(datos_remisiones => {
          for (let i = 0; i < datos_remisiones.length; i++) {
            this.remisionMpService.srvObtenerListaPorRemId(datos_remisiones[i].rem_Id).subscribe(datos_remisionMP => {
              for (let j = 0; j < datos_remisionMP.length; j++) {
                if (datos_remisionMP[j].matPri_Id == materiaPrima) {
                  const matCant : any = {
                    materiaPrima : materiaPrima,
                    cantidad : datos_remisionMP[j].remiMatPri_Cantidad,
                  }
                  materia_cantidad_remision.push(matCant);
                }
              }
            });
          }
        });

        this.recuperadoService.srvObtenerListaPorFechas(fecha, fechaFinal).subscribe(datos_recuperado => {
          for (let i = 0; i < datos_recuperado.length; i++) {
            this.recuperadoMPService.srvObtenerListaPorRecuperadoId(datos_recuperado[i].recMp_Id).subscribe(datos_recuperadoMP => {
              for (let j = 0; j < datos_recuperadoMP.length; j++) {
                if (datos_recuperadoMP[j].matPri_Id == materiaPrima) {
                  const matCant : any = {
                    materiaPrima : materiaPrima,
                    cantidad : datos_recuperadoMP[j].recMatPri_Cantidad,
                  }
                  materia_cantidad_recuperado.push(matCant);
                }
              }
            });
          }
        });

        this.devolucionesService.srvObtenerListaPofechas(fecha, fechaFinal).subscribe(datos_devoluciones => {
          for (let i = 0; i < datos_devoluciones.length; i++) {
            this.detallesDevolucionesService.srvObtenerListaPorDevId(datos_devoluciones[i].devMatPri_Id).subscribe(datos_detallesDevoluciones => {
              for (let j = 0; j < datos_detallesDevoluciones.length; j++) {
                this.materiaPrimaService.srvObtenerListaPorId(datos_detallesDevoluciones[j].matPri_Id).subscribe(datos_materiaPrima => {
                  const matCant : any = {
                    materiaPrima : datos_materiaPrima.matPri_Id,
                    cantidad : datos_detallesDevoluciones[j].dtDevMatPri_CantidadDevuelta,
                  }
                  materia_cantidad_devoluciones.push(matCant);
                });
              }
            });
          }
        });

        this.detallesEntTintas.srvObtenerListaPorFechas(fecha, fechaFinal).subscribe(datos_entradaTinta => {
          for (let i = 0; i < datos_entradaTinta.length; i++) {
            this.tintasService.srvObtenerListaPorId(datos_entradaTinta[i].tinta_Id).subscribe(datos_tintas => {
              let tintaCant : any = {
                materiaPrima : datos_entradaTinta[i].tinta_Id,
                categoria : datos_tintas.catMP_Id,
                cantidad : datos_entradaTinta[i].dtEntTinta_Cantidad,
              }
              materia_cantidad_tintas_Entrada.push(tintaCant);
            });
          }
        });

        setTimeout(() => {
          if (this.ValidarRol == 1 || this.ValidarRol == 3) {
            this.materiaPrimaService.srvObtenerListaPorId(materiaPrima).subscribe(datos_materiaPrima => {
              this.categoriMpService.srvObtenerListaPorId(datos_materiaPrima.catMP_Id).subscribe(datos_categoria => {
                this.inventInicialDiaService.srvObtenerListaPorId(datos_materiaPrima.matPri_Id).subscribe(datos_inventarioInicial => {
                  this.sumaSalida = 0;
                  this.sumaEntrada = 0;
                  this.inventInicial = 0;
                  this.inventInicial = datos_inventarioInicial.invInicial_Stock;
                  // Asignaciones
                  for (const item of materia_cantidad) {
                    if (datos_materiaPrima.matPri_Id == item.materiaPrima) {
                      this.sumaSalida = this.sumaSalida + item.cantidad;
                      // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaSalida} de salida el dia ${fecha}`)
                    }
                  }
                  // Facturas
                  for (const item of materia_cantidad_factura) {
                    if (datos_materiaPrima.matPri_Id == item.materiaPrima) {
                      this.sumaEntrada = this.sumaEntrada + item.cantidad;
                      // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaEntrada} de salida el dia ${fecha} FACTURA`)
                    }
                  }
                  // Remisiones
                  for (const item of materia_cantidad_remision) {
                    if (datos_materiaPrima.matPri_Id == item.materiaPrima) {
                      this.sumaEntrada = this.sumaEntrada + item.cantidad;
                      // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaEntrada} de salida el dia ${fecha} REMISION`)
                    }
                  }

                  // Recuperado
                  for (const item of materia_cantidad_recuperado) {
                    if (datos_materiaPrima.matPri_Id == item.materiaPrima) {
                      this.sumaEntrada = this.sumaEntrada + item.cantidad;
                      // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaEntrada} de salida el dia ${fecha} REMISION`)
                    }
                  }

                  // Devoluciones
                  for (const item of materia_cantidad_devoluciones) {
                    if (datos_materiaPrima.matPri_Id == item.materiaPrima) {
                      this.sumaEntrada = this.sumaEntrada + item.cantidad;
                      this.sumaSalida = this.sumaSalida - item.cantidad;
                    }
                  }

                  this.cargarFormMpEnTablas(this.ArrayMateriaPrima,
                    datos_materiaPrima.matPri_Id,
                    datos_materiaPrima.matPri_Nombre,
                    datos_materiaPrima.matPri_Precio,
                    this.inventInicial,
                    this.sumaEntrada,
                    this.sumaSalida,
                    datos_materiaPrima.matPri_Stock,
                    datos_materiaPrima.undMed_Id,
                    datos_categoria.catMP_Id);

                });
              });
            });

            this.tintasService.srvObtenerLista().subscribe(datos_tintas => {
              for (let i = 0; i < datos_tintas.length; i++) {
                if (datos_tintas[i].catMP_Id == categoria) {
                  this.categoriMpService.srvObtenerListaPorId(datos_tintas[i].catMP_Id).subscribe(datos_categoria => {
                    this.sumaSalida = 0;
                      this.sumaEntrada = 0;
                      this.inventInicial = 0;
                      this.inventInicial = 0;
                      // Entradas
                      for (const item of materia_cantidad_tintas_Entrada) {
                        if (datos_tintas[i].tinta_Id == item.materiaPrima && item.categoria == 7) {
                          this.sumaEntrada = this.sumaEntrada + item.cantidad;
                        }
                      }

                      // Asignaciones
                      for (const item of materia_cantidad_tintas) {
                        if (datos_tintas[i].tinta_Id == item.materiaPrima && item.categoria == 7) {
                          this.sumaEntrada = this.sumaEntrada + item.cantidad;
                        }
                      }

                      this.inventInicial = 0;
                      this.inventInicial = 0;

                      this.cargarFormMpEnTablas(this.ArrayMateriaPrima,
                        datos_tintas[i].tinta_Id,
                        datos_tintas[i].tinta_Nombre,
                        datos_tintas[i].tinta_Precio,
                        datos_tintas[i].tinta_InvInicial,
                        this.sumaEntrada,
                        this.sumaSalida,
                        datos_tintas[i].tinta_Stock,
                        datos_tintas[i].undMed_Id,
                        datos_categoria.catMP_Nombre);
                  });
                }
              }
            });
          }
          this.load = true;
        }, 2000);
      } else if (idMateriaPrima != null) {
        this.asignacionService.srvObtenerListaPorFechas(fecha, fechaFinal).subscribe(datos_asignaciones => {
          for (let i = 0; i < datos_asignaciones.length; i++) {
            this.asignacionMpService.srvObtenerListaPorAsigId(datos_asignaciones[i].asigMp_Id).subscribe(datos_asignacionMP => {
              for (let j = 0; j < datos_asignacionMP.length; j++) {
                if (datos_asignacionMP[j].matPri_Id == idMateriaPrima) {
                  const matCant : any = {
                    materiaPrima : idMateriaPrima,
                    cantidad : datos_asignacionMP[j].dtAsigMp_Cantidad,
                  }
                  materia_cantidad.push(matCant);
                }
              }
            });
          }
        });

        this.facturaCompraService.srvObtenerListaPorFechas(fecha, fechaFinal).subscribe(datos_factura => {
          for (let i = 0; i < datos_factura.length; i++) {
            this.facturaCompraMPService.srvObtenerListaPorFacId(datos_factura[i].facco_Id).subscribe(datos_facturaMP => {
              console.log(datos_facturaMP)
              for (let j = 0; j < datos_facturaMP.length; j++) {
                if (datos_facturaMP[j].matPri_Id == idMateriaPrima) {
                  const matCant : any = {
                    materiaPrima : idMateriaPrima,
                    cantidad : datos_facturaMP[j].faccoMatPri_Cantidad,
                  }
                  materia_cantidad_factura.push(matCant);
                }
              }
            });
          }
        });

        this.remisionService.srvObtenerListaPorFechas(fecha, fechaFinal).subscribe(datos_remisiones => {
          for (let i = 0; i < datos_remisiones.length; i++) {
            this.remisionMpService.srvObtenerListaPorRemId(datos_remisiones[i].rem_Id).subscribe(datos_remisionMP => {
              for (let j = 0; j < datos_remisionMP.length; j++) {
                if (datos_remisionMP[j].matPri_Id == idMateriaPrima) {
                  const matCant : any = {
                    materiaPrima : idMateriaPrima,
                    cantidad : datos_remisionMP[j].remiMatPri_Cantidad,
                  }
                  materia_cantidad_remision.push(matCant);
                }
              }
            });
          }
        });

        this.recuperadoService.srvObtenerListaPorFechas(fecha, fechaFinal).subscribe(datos_recuperado => {
          for (let i = 0; i < datos_recuperado.length; i++) {
            this.recuperadoMPService.srvObtenerListaPorRecuperadoId(datos_recuperado[i].recMp_Id).subscribe(datos_recuperadoMP => {
              for (let j = 0; j < datos_recuperadoMP.length; j++) {
                if (datos_recuperadoMP[j].matPri_Id == idMateriaPrima) {
                  const matCant : any = {
                    materiaPrima : idMateriaPrima,
                    cantidad : datos_recuperadoMP[j].recMatPri_Cantidad,
                  }
                  materia_cantidad_recuperado.push(matCant);
                }
              }
            });
          }
        });

        this.devolucionesService.srvObtenerListaPofechas(fecha, fechaFinal).subscribe(datos_devoluciones => {
          for (let i = 0; i < datos_devoluciones.length; i++) {
            this.detallesDevolucionesService.srvObtenerListaPorDevId(datos_devoluciones[i].devMatPri_Id).subscribe(datos_detallesDevoluciones => {
              for (let j = 0; j < datos_detallesDevoluciones.length; j++) {
                this.materiaPrimaService.srvObtenerListaPorId(datos_detallesDevoluciones[j].matPri_Id).subscribe(datos_materiaPrima => {
                  const matCant : any = {
                    materiaPrima : datos_materiaPrima.matPri_Id,
                    cantidad : datos_detallesDevoluciones[j].dtDevMatPri_CantidadDevuelta,
                  }
                  materia_cantidad_devoluciones.push(matCant);
                });
              }
            });
          }
        });

        this.detallesEntTintas.srvObtenerListaPorFechas(fecha, fechaFinal).subscribe(datos_entradaTinta => {
          for (let i = 0; i < datos_entradaTinta.length; i++) {
            this.tintasService.srvObtenerListaPorId(datos_entradaTinta[i].tinta_Id).subscribe(datos_tintas => {
              let tintaCant : any = {
                materiaPrima : datos_entradaTinta[i].tinta_Id,
                categoria : datos_tintas.catMP_Id,
                cantidad : datos_entradaTinta[i].dtEntTinta_Cantidad,
              }
              materia_cantidad_tintas_Entrada.push(tintaCant);
            });
          }
        });

        setTimeout(() => {
          if (this.ValidarRol == 1 || this.ValidarRol == 3){
            this.materiaPrimaService.srvObtenerListaPorId(idMateriaPrima).subscribe(datos_materiaPrima => {
              this.categoriMpService.srvObtenerListaPorId(datos_materiaPrima.catMP_Id).subscribe(datos_categoria => {
                this.inventInicialDiaService.srvObtenerListaPorId(datos_materiaPrima.matPri_Id).subscribe(datos_inventarioInicial => {
                  this.sumaSalida = 0;
                  this.sumaEntrada = 0;
                  this.inventInicial = 0;
                  this.inventInicial = datos_inventarioInicial.invInicial_Stock;
                  // Asignaciones
                  for (const item of materia_cantidad) {
                    if (datos_materiaPrima.matPri_Id == item.materiaPrima) {
                      this.sumaSalida = this.sumaSalida + item.cantidad;
                      // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaSalida} de salida el dia ${fecha}`)
                    }
                  }
                  // Facturas
                  for (const item of materia_cantidad_factura) {
                    if (datos_materiaPrima.matPri_Id == item.materiaPrima) {
                      this.sumaEntrada = this.sumaEntrada + item.cantidad;
                      // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaEntrada} de salida el dia ${fecha} FACTURA`)
                    }
                  }
                  // Remisiones
                  for (const item of materia_cantidad_remision) {
                    if (datos_materiaPrima.matPri_Id == item.materiaPrima) {
                      this.sumaEntrada = this.sumaEntrada + item.cantidad;
                      // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaEntrada} de salida el dia ${fecha} REMISION`)
                    }
                  }

                  // Recuperado
                  for (const item of materia_cantidad_recuperado) {
                    if (datos_materiaPrima.matPri_Id == item.materiaPrima) {
                      this.sumaEntrada = this.sumaEntrada + item.cantidad;
                      // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaEntrada} de salida el dia ${fecha} REMISION`)
                    }
                  }


                  // Devoluciones
                  for (const item of materia_cantidad_devoluciones) {
                    if (datos_materiaPrima.matPri_Id == item.materiaPrima) {
                      this.sumaEntrada = this.sumaEntrada + item.cantidad;
                      this.sumaSalida = this.sumaSalida - item.cantidad;
                    }
                  }

                  this.cargarFormMpEnTablas(this.ArrayMateriaPrima,
                    datos_materiaPrima.matPri_Id,
                    datos_materiaPrima.matPri_Nombre,
                    datos_materiaPrima.matPri_Precio,
                    this.inventInicial,
                    this.sumaEntrada,
                    this.sumaSalida,
                    datos_materiaPrima.matPri_Stock,
                    datos_materiaPrima.undMed_Id,
                    datos_categoria.catMP_Nombre);

                });
              });
            });

            this.tintasService.srvObtenerLista().subscribe(datos_tintas => {
              for (let i = 0; i < datos_tintas.length; i++) {
                if (datos_tintas[i].catMP_Id == categoria) {
                  this.categoriMpService.srvObtenerListaPorId(datos_tintas[i].catMP_Id).subscribe(datos_categoria => {
                    this.sumaSalida = 0;
                      this.sumaEntrada = 0;
                      this.inventInicial = 0;
                      this.inventInicial = 0;
                      // Asignaciones
                      for (const item of materia_cantidad) {
                        if (datos_tintas[i].tinta_Id == item.materiaPrima && item.categoria == 7) {
                          this.sumaSalida = this.sumaSalida + item.cantidad;
                          // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaSalida} de salida el dia ${fecha}`)
                        }
                      }
                      // Facturas
                      for (const item of materia_cantidad_factura) {
                        if (datos_tintas[i].tinta_Id == item.materiaPrima) {
                          this.sumaEntrada = this.sumaEntrada + item.cantidad;
                          // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaEntrada} de salida el dia ${fecha} FACTURA`)
                        }
                      }
                      // Remisiones
                      for (const item of materia_cantidad_remision) {
                        if (datos_tintas[i].tinta_Id == item.materiaPrima) {
                          this.sumaEntrada = this.sumaEntrada + item.cantidad;
                          // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaEntrada} de salida el dia ${fecha} REMISION`)
                        }
                      }

                      // Recuperado
                      for (const item of materia_cantidad_recuperado) {
                        if (datos_tintas[i].tinta_Id == item.materiaPrima) {
                          this.sumaEntrada = this.sumaEntrada + item.cantidad;
                          // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaEntrada} de salida el dia ${fecha} REMISION`)
                        }
                      }

                      this.inventInicial = 0;
                      this.inventInicial = 0;

                      this.cargarFormMpEnTablas(this.ArrayMateriaPrima,
                        datos_tintas[i].tinta_Id,
                        datos_tintas[i].tinta_Nombre,
                        datos_tintas[i].tinta_Precio,
                        datos_tintas[i].tinta_InvInicial,
                        this.sumaEntrada,
                        this.sumaSalida,
                        datos_tintas[i].tinta_Stock,
                        datos_tintas[i].undMed_Id,
                        datos_categoria.catMP_Nombre);
                  });
                }
              }
            });
          }
          this.load = true;
        }, 2000);
      }
    } else if (fecha != null && (materiaPrima != null || idMateriaPrima != null) && categoria != null) {

      this.load = false;

      if (materiaPrima != null) {
        this.asignacionService.srvObtenerListaPorFecha(fecha).subscribe(datos_asignaciones => {
          for (let i = 0; i < datos_asignaciones.length; i++) {
            this.asignacionMpService.srvObtenerListaPorAsigId(datos_asignaciones[i].asigMp_Id).subscribe(datos_asignacionesMP => {
              for (let j = 0; j < datos_asignacionesMP.length; j++) {
                this.materiaPrimaService.srvObtenerListaPorId(datos_asignacionesMP[j].matPri_Id).subscribe(datos_materiaPrima => {
                  if (datos_materiaPrima.catMP_Id == categoria && datos_materiaPrima.matPri_Id == materiaPrima) {
                    const matCant : any = {
                      materiaPrima : datos_materiaPrima.matPri_Id,
                      cantidad : datos_asignacionesMP[j].dtAsigMp_Cantidad,
                      categoria : datos_materiaPrima.catMP_Id,
                    }
                    materia_cantidad.push(matCant);
                  }
                });
              }
            });

            this.asignacionTintasService.srvObtenerListaPor_Asignacion(datos_asignaciones[i].asigMp_Id).subscribe(datos_asignacionTintas => {
              for (let j = 0; j < datos_asignacionTintas.length; j++) {
                this.tintasService.srvObtenerListaPorId(datos_asignacionTintas[j].tinta_Id).subscribe(datos_tintas => {
                  if (datos_tintas.catMP_Id == categoria) {
                    const matCant : any = {
                      materiaPrima : datos_tintas.tinta_Id,
                      cantidad : datos_asignacionTintas[j].dtAsigTinta_Cantidad,
                      categoria : datos_tintas.catMP_Id,
                    }
                    materia_cantidad.push(matCant);
                  }
                });
              }
            });
          }
        });

        this.boppService.srvObtenerListaPorFecha(fecha).subscribe(datos_bopp => {
          for (let i = 0; i < datos_bopp.length; i++) {
            if (datos_bopp[i].catMP_Id == categoria && datos_bopp[i].bopP_Id == materiaPrima) {

            const matCant : any = {
              materiaPrima : datos_bopp[i].bopP_Id,
              cantidad : datos_bopp[i].bopP_CantidadInicialKg,
            }
              bopp_entrante.push(matCant);
            }
          }
        });

        this.asignacionBOPPService.srvObtenerListaPorfecha(fecha).subscribe(datos_asignacionBopp => {
          for (let i = 0; i < datos_asignacionBopp.length; i++) {
            this.detallesAsignacionBOPPService.srvObtenerListaPorAsignacion(datos_asignacionBopp[i].asigBOPP_Id).subscribe(datos_detallesAsgBopp => {
              for (let j = 0; j < datos_detallesAsgBopp.length; j++) {
                this.boppService.srvObtenerListaPorId(datos_detallesAsgBopp[j].bopP_Id).subscribe(datos_bopp => {
                  let bopp : any = [];
                  bopp.push(datos_bopp);
                  for (const item of bopp) {
                    if (item.catMP_Id == categoria && item.bopP_Id == materiaPrima) {
                      const matCant : any = {
                        materiaPrima : item.bopP_Id,
                        cantidad : datos_detallesAsgBopp[j].dtAsigBOPP_Cantidad,
                      }
                      bopp_Saliente.push(matCant);
                    }
                  }
                });
              }
            });
          }
        });

        this.facturaCompraService.srvObtenerListaPorFecha(fecha).subscribe(datos_factura => {
          for (let i = 0; i < datos_factura.length; i++) {
            this.facturaCompraMPService.srvObtenerListaPorFacId(datos_factura[i].facco_Id).subscribe(datos_facturaMP => {
              console.log(datos_facturaMP)
              for (let j = 0; j < datos_facturaMP.length; j++) {
                this.materiaPrimaService.srvObtenerListaPorId(datos_facturaMP[j].matPri_Id).subscribe(datos_materiaPrima => {
                  if (datos_materiaPrima.catMP_Id == categoria && datos_materiaPrima.matPri_Id == materiaPrima) {
                    const matCant : any = {
                      materiaPrima : datos_materiaPrima.matPri_Id,
                      cantidad : datos_facturaMP[j].faccoMatPri_Cantidad,
                    }
                    materia_cantidad_factura.push(matCant);
                  }
                });
              }
            });
          }
        });

        this.remisionService.srvObtenerListaPorFecha(fecha).subscribe(datos_remisiones => {
          for (let i = 0; i < datos_remisiones.length; i++) {
            this.remisionMpService.srvObtenerListaPorRemId(datos_remisiones[i].rem_Id).subscribe(datos_remisionMP => {
              for (let j = 0; j < datos_remisionMP.length; j++) {
                this.materiaPrimaService.srvObtenerListaPorId(datos_remisionMP[j].matPri_Id).subscribe(datos_materiaPrima => {
                  if (datos_materiaPrima.catMP_Id == categoria && datos_materiaPrima.matPri_Id == materiaPrima) {
                    const matCant : any = {
                      materiaPrima : datos_materiaPrima.matPri_Id,
                      cantidad : datos_remisionMP[j].remiMatPri_Cantidad,
                    }
                    materia_cantidad_remision.push(matCant);
                  }
                });
              }
            });
          }
        });

        this.recuperadoService.srvObtenerListaPorFecha(fecha).subscribe(datos_recuperado => {
          for (let i = 0; i < datos_recuperado.length; i++) {
            this.recuperadoMPService.srvObtenerListaPorRecuperadoId(datos_recuperado[i].recMp_Id).subscribe(datos_recuperadoMP => {
              for (let j = 0; j < datos_recuperadoMP.length; j++) {
                this.materiaPrimaService.srvObtenerListaPorId(datos_recuperadoMP[j].matPri_Id).subscribe(datos_materiaPrima => {
                  if (datos_materiaPrima.catMP_Id == categoria && datos_materiaPrima.matPri_Id == materiaPrima) {
                    const matCant : any = {
                      materiaPrima : datos_materiaPrima.matPri_Id,
                      cantidad : datos_recuperadoMP[j].recMatPri_Cantidad,
                    }
                    materia_cantidad_recuperado.push(matCant);
                  }
                });
              }
            });
          }
        });

        this.devolucionesService.srvObtenerListaPorfecha(fecha).subscribe(datos_devoluciones => {
          for (let i = 0; i < datos_devoluciones.length; i++) {
            this.detallesDevolucionesService.srvObtenerListaPorDevId(datos_devoluciones[i].devMatPri_Id).subscribe(datos_detallesDevoluciones => {
              for (let j = 0; j < datos_detallesDevoluciones.length; j++) {
                this.materiaPrimaService.srvObtenerListaPorId(datos_detallesDevoluciones[j].matPri_Id).subscribe(datos_materiaPrima => {
                  const matCant : any = {
                    materiaPrima : datos_materiaPrima.matPri_Id,
                    cantidad : datos_detallesDevoluciones[j].dtDevMatPri_CantidadDevuelta,
                  }
                  materia_cantidad_devoluciones.push(matCant);
                });
              }
            });
          }
        });

        this.detallesEntTintas.srvObtenerListaPorFecha(this.today).subscribe(datos_entradaTinta => {
          for (let i = 0; i < datos_entradaTinta.length; i++) {
            this.tintasService.srvObtenerListaPorId(datos_entradaTinta[i].tinta_Id).subscribe(datos_tintas => {
              let tintaCant : any = {
                materiaPrima : datos_entradaTinta[i].tinta_Id,
                categoria : datos_tintas.catMP_Id,
                cantidad : datos_entradaTinta[i].dtEntTinta_Cantidad,
              }
              materia_cantidad_tintas_Entrada.push(tintaCant);
            });
          }
        });

        setTimeout(() => {
          if (this.ValidarRol == 1 || this.ValidarRol == 3){
            this.materiaPrimaService.srvObtenerListaPorId(materiaPrima).subscribe(datos_materiaPrima => {
              let mp : any = [];
              mp.push(datos_materiaPrima);
              for (const item of mp) {
                if (item.catMP_Id == categoria) {
                  this.categoriMpService.srvObtenerListaPorId(item.catMP_Id).subscribe(datos_categoria => {
                    this.inventInicialDiaService.srvObtenerListaPorId(item.matPri_Id).subscribe(datos_inventarioInicial => {
                      this.sumaSalida = 0;
                      this.sumaEntrada = 0;
                      this.inventInicial = 0;
                      this.inventInicial = datos_inventarioInicial.invInicial_Stock;
                      // Asignaciones
                      for (const item of materia_cantidad) {
                        if (item.matPri_Id == item.materiaPrima && item.categoria != 7) this.sumaSalida = this.sumaSalida + item.cantidad;
                      }
                      // Facturas
                      for (const item of materia_cantidad_factura) {
                        if (item.matPri_Id == item.materiaPrima) this.sumaEntrada = this.sumaEntrada + item.cantidad;
                      }
                      // Remisiones
                      for (const item of materia_cantidad_remision) {
                        if (item.matPri_Id == item.materiaPrima) this.sumaEntrada = this.sumaEntrada + item.cantidad;
                      }

                      // Recuperado
                      for (const item of materia_cantidad_recuperado) {
                        if (item.matPri_Id == item.materiaPrima) this.sumaEntrada = this.sumaEntrada + item.cantidad;
                      }

                      // Devoluciones
                      for (const item of materia_cantidad_devoluciones) {
                        if (item.matPri_Id == item.materiaPrima) {
                          this.sumaEntrada += item.cantidad;
                          this.sumaSalida -= item.cantidad;
                        }
                      }

                      this.inventInicial = 0;
                      this.inventInicial = datos_inventarioInicial.invInicial_Stock;

                      this.cargarFormMpEnTablas(this.ArrayMateriaPrima,
                        item.matPri_Id,
                        item.matPri_Nombre,
                        item.matPri_Precio,
                        this.inventInicial,
                        this.sumaEntrada,
                        this.sumaSalida,
                        item.matPri_Stock,
                        item.undMed_Id,
                        datos_categoria.catMP_Nombre);
                    });
                  });
                }
              }
            });

            this.tintasService.srvObtenerListaPorId(materiaPrima).subscribe(datos_tintas => {
              for (let i = 0; i < datos_tintas.length; i++) {
                if (datos_tintas[i].catMP_Id == categoria) {
                  this.categoriMpService.srvObtenerListaPorId(datos_tintas[i].catMP_Id).subscribe(datos_categoria => {
                    this.sumaSalida = 0;
                      this.sumaEntrada = 0;
                      this.inventInicial = 0;
                      this.inventInicial = 0;
                      // Entradas
                      for (const item of materia_cantidad_tintas_Entrada) {
                        if (datos_tintas[i].tinta_Id == item.materiaPrima && item.categoria == 7) {
                          this.sumaEntrada = this.sumaEntrada + item.cantidad;
                        }
                      }

                      // Asignaciones
                      for (const item of materia_cantidad_tintas) {
                        if (datos_tintas[i].tinta_Id == item.materiaPrima && item.categoria == 7) {
                          this.sumaEntrada = this.sumaEntrada + item.cantidad;
                        }
                      }

                      this.inventInicial = 0;
                      this.inventInicial = 0;

                      this.cargarFormMpEnTablas(this.ArrayMateriaPrima,
                        datos_tintas[i].tinta_Id,
                        datos_tintas[i].tinta_Nombre,
                        datos_tintas[i].tinta_Precio,
                        datos_tintas[i].tinta_InvInicial,
                        this.sumaEntrada,
                        this.sumaSalida,
                        datos_tintas[i].tinta_Stock,
                        datos_tintas[i].undMed_Id,
                        datos_categoria.catMP_Nombre);
                  });
                }
              }
            });
          }

          if (this.ValidarRol == 1 || this.ValidarRol == 4){
            this.boppService.srvObtenerLista().subscribe(datos_bopp => {
              for (let i = 0; i < datos_bopp.length; i++) {
                if (datos_bopp[i].catMP_Id == categoria && datos_bopp[i].bopP_Id == materiaPrima) {
                  this.categoriaBOPP = 'BOPP';
                  this.categoriMpService.srvObtenerListaPorId(datos_bopp[i].catMP_Id).subscribe(datos_categoria => {
                    this.sumaSalida = 0;
                    this.sumaEntrada = 0;
                    this.inventInicial = 0;
                    for (const item of bopp_Saliente) {
                      if (datos_bopp[i].bopP_Id == item.materiaPrima && datos_categoria.catMP_Id == categoria) this.sumaSalida += item.cantidad;
                    }

                    for (const item of bopp_entrante) {
                      if (datos_bopp[i].bopP_Id == item.materiaPrima && datos_categoria.catMP_Id == categoria) this.sumaEntrada -= item.cantidad;
                    }

                    this.inventInicial = 0;

                    this.cargarFormMpEnTablas(this.ArrayMateriaPrima,
                      datos_bopp[i].bopP_Serial,
                      datos_bopp[i].bopP_Descripcion, /** Descripcion en vez de nombre */
                      datos_bopp[i].bopP_Precio,
                      datos_bopp[i].bopP_CantidadInicialKg,
                      this.sumaEntrada,
                      this.sumaSalida,
                      datos_bopp[i].bopP_Stock,
                      "Kg",
                      datos_categoria.catMP_Nombre,
                      datos_bopp[i].bopP_Ancho);
                  });
                }
              }
            });
          }

        }, 2000);
      } else if (idMateriaPrima != null) {
        this.asignacionService.srvObtenerListaPorFecha(fecha).subscribe(datos_asignaciones => {
          for (let i = 0; i < datos_asignaciones.length; i++) {
            this.asignacionMpService.srvObtenerListaPorAsigId(datos_asignaciones[i].asigMp_Id).subscribe(datos_asignacionesMP => {
              for (let j = 0; j < datos_asignacionesMP.length; j++) {
                this.materiaPrimaService.srvObtenerListaPorId(datos_asignacionesMP[j].matPri_Id).subscribe(datos_materiaPrima => {
                  if (datos_materiaPrima.catMP_Id == categoria && datos_materiaPrima.matPri_Id == idMateriaPrima) {
                    const matCant : any = {
                      materiaPrima : datos_materiaPrima.matPri_Id,
                      cantidad : datos_asignacionesMP[j].dtAsigMp_Cantidad,
                      categoria : datos_materiaPrima.catMP_Id,
                    }
                    materia_cantidad.push(matCant);
                  }
                });
              }
            });

            this.asignacionTintasService.srvObtenerListaPor_Asignacion(datos_asignaciones[i].asigMp_Id).subscribe(datos_asignacionTintas => {
              for (let j = 0; j < datos_asignacionTintas.length; j++) {
                this.tintasService.srvObtenerListaPorId(datos_asignacionTintas[j].tinta_Id).subscribe(datos_tintas => {
                  if (datos_tintas.catMP_Id == categoria) {
                    const matCant : any = {
                      materiaPrima : datos_tintas.tinta_Id,
                      cantidad : datos_asignacionTintas[j].dtAsigTinta_Cantidad,
                      categoria : datos_tintas.catMP_Id,
                    }
                    materia_cantidad.push(matCant);
                  }
                });
              }
            });
          }
        });

        this.boppService.srvObtenerListaPorFecha(fecha).subscribe(datos_bopp => {
          for (let i = 0; i < datos_bopp.length; i++) {
            if (datos_bopp[i].catMP_Id == categoria && datos_bopp[i].bopP_Id == idMateriaPrima) {

            const matCant : any = {
              materiaPrima : datos_bopp[i].bopP_Id,
              cantidad : datos_bopp[i].bopP_CantidadInicialKg,
            }
              bopp_entrante.push(matCant);
            }
          }
        });

        this.asignacionBOPPService.srvObtenerListaPorfecha(fecha).subscribe(datos_asignacionBopp => {
          for (let i = 0; i < datos_asignacionBopp.length; i++) {
            this.detallesAsignacionBOPPService.srvObtenerListaPorAsignacion(datos_asignacionBopp[i].asigBOPP_Id).subscribe(datos_detallesAsgBopp => {
              for (let j = 0; j < datos_detallesAsgBopp.length; j++) {
                this.boppService.srvObtenerListaPorId(datos_detallesAsgBopp[j].bopP_Id).subscribe(datos_bopp => {
                  let bopp : any = [];
                  bopp.push(datos_bopp);
                  for (const item of bopp) {
                    if (item.catMP_Id == categoria && item.bopP_Id == idMateriaPrima) {
                      const matCant : any = {
                        materiaPrima : item.bopP_Id,
                        cantidad : datos_detallesAsgBopp[j].dtAsigBOPP_Cantidad,
                      }
                      bopp_Saliente.push(matCant);
                    }
                  }
                });
              }
            });
          }
        });

        this.facturaCompraService.srvObtenerListaPorFecha(fecha).subscribe(datos_factura => {
          for (let i = 0; i < datos_factura.length; i++) {
            this.facturaCompraMPService.srvObtenerListaPorFacId(datos_factura[i].facco_Id).subscribe(datos_facturaMP => {
              console.log(datos_facturaMP)
              for (let j = 0; j < datos_facturaMP.length; j++) {
                this.materiaPrimaService.srvObtenerListaPorId(datos_facturaMP[j].matPri_Id).subscribe(datos_materiaPrima => {
                  if (datos_materiaPrima.catMP_Id == categoria && datos_materiaPrima.matPri_Id == idMateriaPrima) {
                    const matCant : any = {
                      materiaPrima : datos_materiaPrima.matPri_Id,
                      cantidad : datos_facturaMP[j].faccoMatPri_Cantidad,
                    }
                    materia_cantidad_factura.push(matCant);
                  }
                });
              }
            });
          }
        });

        this.remisionService.srvObtenerListaPorFecha(fecha).subscribe(datos_remisiones => {
          for (let i = 0; i < datos_remisiones.length; i++) {
            this.remisionMpService.srvObtenerListaPorRemId(datos_remisiones[i].rem_Id).subscribe(datos_remisionMP => {
              for (let j = 0; j < datos_remisionMP.length; j++) {
                this.materiaPrimaService.srvObtenerListaPorId(datos_remisionMP[j].matPri_Id).subscribe(datos_materiaPrima => {
                  if (datos_materiaPrima.catMP_Id == categoria && datos_materiaPrima.matPri_Id == idMateriaPrima) {
                    const matCant : any = {
                      materiaPrima : datos_materiaPrima.matPri_Id,
                      cantidad : datos_remisionMP[j].remiMatPri_Cantidad,
                    }
                    materia_cantidad_remision.push(matCant);
                  }
                });
              }
            });
          }
        });

        this.recuperadoService.srvObtenerListaPorFecha(fecha).subscribe(datos_recuperado => {
          for (let i = 0; i < datos_recuperado.length; i++) {
            this.recuperadoMPService.srvObtenerListaPorRecuperadoId(datos_recuperado[i].recMp_Id).subscribe(datos_recuperadoMP => {
              for (let j = 0; j < datos_recuperadoMP.length; j++) {
                this.materiaPrimaService.srvObtenerListaPorId(datos_recuperadoMP[j].matPri_Id).subscribe(datos_materiaPrima => {
                  if (datos_materiaPrima.catMP_Id == categoria && datos_materiaPrima.matPri_Id == idMateriaPrima) {
                    const matCant : any = {
                      materiaPrima : datos_materiaPrima.matPri_Id,
                      cantidad : datos_recuperadoMP[j].recMatPri_Cantidad,
                    }
                    materia_cantidad_recuperado.push(matCant);
                  }
                });
              }
            });
          }
        });

        this.devolucionesService.srvObtenerListaPorfecha(fecha).subscribe(datos_devoluciones => {
          for (let i = 0; i < datos_devoluciones.length; i++) {
            this.detallesDevolucionesService.srvObtenerListaPorDevId(datos_devoluciones[i].devMatPri_Id).subscribe(datos_detallesDevoluciones => {
              for (let j = 0; j < datos_detallesDevoluciones.length; j++) {
                this.materiaPrimaService.srvObtenerListaPorId(datos_detallesDevoluciones[j].matPri_Id).subscribe(datos_materiaPrima => {
                  const matCant : any = {
                    materiaPrima : datos_materiaPrima.matPri_Id,
                    cantidad : datos_detallesDevoluciones[j].dtDevMatPri_CantidadDevuelta,
                  }
                  materia_cantidad_devoluciones.push(matCant);
                });
              }
            });
          }
        });

        this.detallesEntTintas.srvObtenerListaPorFecha(this.today).subscribe(datos_entradaTinta => {
          for (let i = 0; i < datos_entradaTinta.length; i++) {
            this.tintasService.srvObtenerListaPorId(datos_entradaTinta[i].tinta_Id).subscribe(datos_tintas => {
              let tintaCant : any = {
                materiaPrima : datos_entradaTinta[i].tinta_Id,
                categoria : datos_tintas.catMP_Id,
                cantidad : datos_entradaTinta[i].dtEntTinta_Cantidad,
              }
              materia_cantidad_tintas_Entrada.push(tintaCant);
            });
          }
        });

        setTimeout(() => {
          if (this.ValidarRol == 1 || this.ValidarRol == 3){
            this.materiaPrimaService.srvObtenerListaPorId(idMateriaPrima).subscribe(datos_materiaPrima => {
              let mp : any = [];
              mp.push(datos_materiaPrima);
              for (const item of mp) {
                if (item.catMP_Id == categoria) {
                  this.categoriMpService.srvObtenerListaPorId(item.catMP_Id).subscribe(datos_categoria => {
                    this.inventInicialDiaService.srvObtenerListaPorId(item.matPri_Id).subscribe(datos_inventarioInicial => {
                      this.sumaSalida = 0;
                      this.sumaEntrada = 0;
                      this.inventInicial = 0;
                      this.inventInicial = datos_inventarioInicial.invInicial_Stock;
                      // Asignaciones
                      for (const item of materia_cantidad) {
                        if (item.matPri_Id == item.materiaPrima && item.categoria != 7) this.sumaSalida = this.sumaSalida + item.cantidad;
                      }
                      // Facturas
                      for (const item of materia_cantidad_factura) {
                        if (item.matPri_Id == item.materiaPrima) this.sumaEntrada = this.sumaEntrada + item.cantidad;
                      }
                      // Remisiones
                      for (const item of materia_cantidad_remision) {
                        if (item.matPri_Id == item.materiaPrima) this.sumaEntrada = this.sumaEntrada + item.cantidad;
                      }

                      // Recuperado
                      for (const item of materia_cantidad_recuperado) {
                        if (item.matPri_Id == item.materiaPrima) this.sumaEntrada = this.sumaEntrada + item.cantidad;
                      }

                      // Devoluciones
                      for (const item of materia_cantidad_devoluciones) {
                        if (item.matPri_Id == item.materiaPrima) {
                          this.sumaEntrada += item.cantidad;
                          this.sumaSalida -= item.cantidad;
                        }
                      }

                      this.inventInicial = 0;
                      this.inventInicial = datos_inventarioInicial.invInicial_Stock;

                      this.cargarFormMpEnTablas(this.ArrayMateriaPrima,
                        item.matPri_Id,
                        item.matPri_Nombre,
                        item.matPri_Precio,
                        this.inventInicial,
                        this.sumaEntrada,
                        this.sumaSalida,
                        item.matPri_Stock,
                        item.undMed_Id,
                        datos_categoria.catMP_Nombre);
                    });
                  });
                }
              }
            });

            this.tintasService.srvObtenerListaPorId(idMateriaPrima).subscribe(datos_tintas => {
              for (let i = 0; i < datos_tintas.length; i++) {
                if (datos_tintas[i].catMP_Id == categoria) {
                  this.categoriMpService.srvObtenerListaPorId(datos_tintas[i].catMP_Id).subscribe(datos_categoria => {
                    this.sumaSalida = 0;
                      this.sumaEntrada = 0;
                      this.inventInicial = 0;
                      this.inventInicial = 0;
                      // Entradas
                      for (const item of materia_cantidad_tintas_Entrada) {
                        if (datos_tintas[i].tinta_Id == item.materiaPrima && item.categoria == 7) {
                          this.sumaEntrada = this.sumaEntrada + item.cantidad;
                        }
                      }

                      // Asignaciones
                      for (const item of materia_cantidad_tintas) {
                        if (datos_tintas[i].tinta_Id == item.materiaPrima && item.categoria == 7) {
                          this.sumaEntrada = this.sumaEntrada + item.cantidad;
                        }
                      }

                      this.inventInicial = 0;
                      this.inventInicial = 0;

                      this.cargarFormMpEnTablas(this.ArrayMateriaPrima,
                        datos_tintas[i].tinta_Id,
                        datos_tintas[i].tinta_Nombre,
                        datos_tintas[i].tinta_Precio,
                        datos_tintas[i].tinta_InvInicial,
                        this.sumaEntrada,
                        this.sumaSalida,
                        datos_tintas[i].tinta_Stock,
                        datos_tintas[i].undMed_Id,
                        datos_categoria.catMP_Nombre);
                  });
                }
              }
            });
          }

          if (this.ValidarRol == 1 || this.ValidarRol == 4) {
            this.boppService.srvObtenerLista().subscribe(datos_bopp => {
              for (let i = 0; i < datos_bopp.length; i++) {
                if (datos_bopp[i].catMP_Id == categoria && datos_bopp[i].bopP_Id == idMateriaPrima) {
                  this.categoriaBOPP = 'BOPP';
                  this.categoriMpService.srvObtenerListaPorId(datos_bopp[i].catMP_Id).subscribe(datos_categoria => {
                    this.sumaSalida = 0;
                    this.sumaEntrada = 0;
                    this.inventInicial = 0;
                    for (const item of bopp_Saliente) {
                      if (datos_bopp[i].bopP_Id == item.materiaPrima && datos_categoria.catMP_Id == categoria) this.sumaSalida += item.cantidad;
                    }

                    for (const item of bopp_entrante) {
                      if (datos_bopp[i].bopP_Id == item.materiaPrima && datos_categoria.catMP_Id == categoria) this.sumaEntrada += item.cantidad;
                    }

                    this.inventInicial = 0;

                    this.cargarFormMpEnTablas(this.ArrayMateriaPrima,
                      datos_bopp[i].bopP_Serial,
                      datos_bopp[i].bopP_Descripcion, /** Descripcion en vez de nombre */
                      datos_bopp[i].bopP_Precio,
                      datos_bopp[i].bopP_CantidadInicialKg,
                      this.sumaEntrada,
                      this.sumaSalida,
                      datos_bopp[i].bopP_Stock,
                      "Kg",
                      datos_categoria.catMP_Nombre,
                      datos_bopp[i].bopP_Ancho);
                  });
                }
              }
            });
          }
        }, 2000);
      }
    } else if (fecha != null && (materiaPrima != null || idMateriaPrima != null)) {
      this.load = false;

      if (materiaPrima != null) {

        this.asignacionService.srvObtenerListaPorFecha(fecha).subscribe(datos_asignaciones => {
          for (let i = 0; i < datos_asignaciones.length; i++) {
            this.asignacionMpService.srvObtenerListaPorAsigId(datos_asignaciones[i].asigMp_Id).subscribe(datos_asignacionMP => {
              for (let j = 0; j < datos_asignacionMP.length; j++) {
                if (datos_asignacionMP[j].matPri_Id == materiaPrima) {
                  const matCant : any = {
                    materiaPrima : materiaPrima,
                    cantidad : datos_asignacionMP[j].dtAsigMp_Cantidad,
                  }
                  materia_cantidad.push(matCant);
                }
              }
            });
          }
        });

        this.facturaCompraService.srvObtenerListaPorFecha(fecha).subscribe(datos_factura => {
          for (let i = 0; i < datos_factura.length; i++) {
            this.facturaCompraMPService.srvObtenerListaPorFacId(datos_factura[i].facco_Id).subscribe(datos_facturaMP => {
              console.log(datos_facturaMP)
              for (let j = 0; j < datos_facturaMP.length; j++) {
                if (datos_facturaMP[j].matPri_Id == materiaPrima) {
                  const matCant : any = {
                    materiaPrima : materiaPrima,
                    cantidad : datos_facturaMP[j].faccoMatPri_Cantidad,
                  }
                  materia_cantidad_factura.push(matCant);
                }
              }
            });
          }
        });

        this.remisionService.srvObtenerListaPorFecha(fecha).subscribe(datos_remisiones => {
          for (let i = 0; i < datos_remisiones.length; i++) {
            this.remisionMpService.srvObtenerListaPorRemId(datos_remisiones[i].rem_Id).subscribe(datos_remisionMP => {
              for (let j = 0; j < datos_remisionMP.length; j++) {
                if (datos_remisionMP[j].matPri_Id == materiaPrima) {
                  const matCant : any = {
                    materiaPrima : materiaPrima,
                    cantidad : datos_remisionMP[j].remiMatPri_Cantidad,
                  }
                  materia_cantidad_remision.push(matCant);
                }
              }
            });
          }
        });

        this.recuperadoService.srvObtenerListaPorFecha(fecha).subscribe(datos_recuperado => {
          for (let i = 0; i < datos_recuperado.length; i++) {
            this.recuperadoMPService.srvObtenerListaPorRecuperadoId(datos_recuperado[i].recMp_Id).subscribe(datos_recuperadoMP => {
              for (let j = 0; j < datos_recuperadoMP.length; j++) {
                if (datos_recuperadoMP[j].matPri_Id == materiaPrima) {
                  const matCant : any = {
                    materiaPrima : materiaPrima,
                    cantidad : datos_recuperadoMP[j].recMatPri_Cantidad,
                  }
                  materia_cantidad_recuperado.push(matCant);
                }
              }
            });
          }
        });

        this.devolucionesService.srvObtenerListaPorfecha(fecha).subscribe(datos_devoluciones => {
          for (let i = 0; i < datos_devoluciones.length; i++) {
            this.detallesDevolucionesService.srvObtenerListaPorDevId(datos_devoluciones[i].devMatPri_Id).subscribe(datos_detallesDevoluciones => {
              for (let j = 0; j < datos_detallesDevoluciones.length; j++) {
                this.materiaPrimaService.srvObtenerListaPorId(datos_detallesDevoluciones[j].matPri_Id).subscribe(datos_materiaPrima => {
                  const matCant : any = {
                    materiaPrima : datos_materiaPrima.matPri_Id,
                    cantidad : datos_detallesDevoluciones[j].dtDevMatPri_CantidadDevuelta,
                  }
                  materia_cantidad_devoluciones.push(matCant);
                });
              }
            });
          }
        });

        this.detallesEntTintas.srvObtenerListaPorFecha(this.today).subscribe(datos_entradaTinta => {
          for (let i = 0; i < datos_entradaTinta.length; i++) {
            this.tintasService.srvObtenerListaPorId(datos_entradaTinta[i].tinta_Id).subscribe(datos_tintas => {
              let tintaCant : any = {
                materiaPrima : datos_entradaTinta[i].tinta_Id,
                categoria : datos_tintas.catMP_Id,
                cantidad : datos_entradaTinta[i].dtEntTinta_Cantidad,
              }
              materia_cantidad_tintas_Entrada.push(tintaCant);
            });
          }
        });

        setTimeout(() => {
          if (this.ValidarRol == 1 || this.ValidarRol == 3) {
            this.materiaPrimaService.srvObtenerListaPorId(materiaPrima).subscribe(datos_materiaPrima => {
              this.categoriMpService.srvObtenerListaPorId(datos_materiaPrima.catMP_Id).subscribe(datos_categoria => {
                this.inventInicialDiaService.srvObtenerListaPorId(datos_materiaPrima.matPri_Id).subscribe(datos_inventarioInicial => {
                  this.sumaSalida = 0;
                  this.sumaEntrada = 0;
                  this.inventInicial = 0;
                  this.inventInicial = datos_inventarioInicial.invInicial_Stock;
                  // Asignaciones
                  for (const item of materia_cantidad) {
                    if (datos_materiaPrima.matPri_Id == item.materiaPrima) {
                      this.sumaSalida = this.sumaSalida + item.cantidad;
                      // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaSalida} de salida el dia ${fecha}`)
                    }
                  }
                  // Facturas
                  for (const item of materia_cantidad_factura) {
                    if (datos_materiaPrima.matPri_Id == item.materiaPrima) {
                      this.sumaEntrada = this.sumaEntrada + item.cantidad;
                      // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaEntrada} de salida el dia ${fecha} FACTURA`)
                    }
                  }
                  // Remisiones
                  for (const item of materia_cantidad_remision) {
                    if (datos_materiaPrima.matPri_Id == item.materiaPrima) {
                      this.sumaEntrada = this.sumaEntrada + item.cantidad;
                      // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaEntrada} de salida el dia ${fecha} REMISION`)
                    }
                  }

                  // Recuperado
                  for (const item of materia_cantidad_recuperado) {
                    if (datos_materiaPrima.matPri_Id == item.materiaPrima) {
                      this.sumaEntrada = this.sumaEntrada + item.cantidad;
                      // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaEntrada} de salida el dia ${fecha} REMISION`)
                    }
                  }

                  // Devoluciones
                  for (const item of materia_cantidad_devoluciones) {
                    if (datos_materiaPrima.matPri_Id == item.materiaPrima) {
                      this.sumaEntrada = this.sumaEntrada + item.cantidad;
                      this.sumaSalida = this.sumaSalida - item.cantidad;
                    }
                  }

                  this.cargarFormMpEnTablas(this.ArrayMateriaPrima,
                    datos_materiaPrima.matPri_Id,
                    datos_materiaPrima.matPri_Nombre,
                    datos_materiaPrima.matPri_Precio,
                    this.inventInicial,
                    this.sumaEntrada,
                    this.sumaSalida,
                    datos_materiaPrima.matPri_Stock,
                    datos_materiaPrima.undMed_Id,
                    datos_categoria.catMP_Nombre);

                });
              });
            });

            this.tintasService.srvObtenerListaPorId(materiaPrima).subscribe(datos_tintas => {
              for (let i = 0; i < datos_tintas.length; i++) {
                if (datos_tintas[i].catMP_Id == categoria) {
                  this.categoriMpService.srvObtenerListaPorId(datos_tintas[i].catMP_Id).subscribe(datos_categoria => {
                    this.sumaSalida = 0;
                      this.sumaEntrada = 0;
                      this.inventInicial = 0;
                      this.inventInicial = 0;
                      // Entradas
                      for (const item of materia_cantidad_tintas_Entrada) {
                        if (datos_tintas[i].tinta_Id == item.materiaPrima && item.categoria == 7) {
                          this.sumaEntrada = this.sumaEntrada + item.cantidad;
                        }
                      }

                      // Asignaciones
                      for (const item of materia_cantidad_tintas) {
                        if (datos_tintas[i].tinta_Id == item.materiaPrima && item.categoria == 7) {
                          this.sumaEntrada = this.sumaEntrada + item.cantidad;
                        }
                      }

                      this.inventInicial = 0;
                      this.inventInicial = 0;

                      this.cargarFormMpEnTablas(this.ArrayMateriaPrima,
                        datos_tintas[i].tinta_Id,
                        datos_tintas[i].tinta_Nombre,
                        datos_tintas[i].tinta_Precio,
                        datos_tintas[i].tinta_InvInicial,
                        this.sumaEntrada,
                        this.sumaSalida,
                        datos_tintas[i].tinta_Stock,
                        datos_tintas[i].undMed_Id,
                        datos_categoria.catMP_Nombre);
                  });
                }
              }
            });
          }
          this.load = true;
        }, 2000);
      } else if (idMateriaPrima != null) {
        this.asignacionService.srvObtenerListaPorFecha(fecha).subscribe(datos_asignaciones => {
          for (let i = 0; i < datos_asignaciones.length; i++) {
            this.asignacionMpService.srvObtenerListaPorAsigId(datos_asignaciones[i].asigMp_Id).subscribe(datos_asignacionMP => {
              for (let j = 0; j < datos_asignacionMP.length; j++) {
                if (datos_asignacionMP[j].matPri_Id == idMateriaPrima) {
                  const matCant : any = {
                    materiaPrima : idMateriaPrima,
                    cantidad : datos_asignacionMP[j].dtAsigMp_Cantidad,
                  }
                  materia_cantidad.push(matCant);
                }
              }
            });
          }
        });

        this.facturaCompraService.srvObtenerListaPorFecha(fecha).subscribe(datos_factura => {
          for (let i = 0; i < datos_factura.length; i++) {
            this.facturaCompraMPService.srvObtenerListaPorFacId(datos_factura[i].facco_Id).subscribe(datos_facturaMP => {
              console.log(datos_facturaMP)
              for (let j = 0; j < datos_facturaMP.length; j++) {
                if (datos_facturaMP[j].matPri_Id == idMateriaPrima) {
                  const matCant : any = {
                    materiaPrima : idMateriaPrima,
                    cantidad : datos_facturaMP[j].faccoMatPri_Cantidad,
                  }
                  materia_cantidad_factura.push(matCant);
                }
              }
            });
          }
        });

        this.remisionService.srvObtenerListaPorFecha(fecha).subscribe(datos_remisiones => {
          for (let i = 0; i < datos_remisiones.length; i++) {
            this.remisionMpService.srvObtenerListaPorRemId(datos_remisiones[i].rem_Id).subscribe(datos_remisionMP => {
              for (let j = 0; j < datos_remisionMP.length; j++) {
                if (datos_remisionMP[j].matPri_Id == idMateriaPrima) {
                  const matCant : any = {
                    materiaPrima : idMateriaPrima,
                    cantidad : datos_remisionMP[j].remiMatPri_Cantidad,
                  }
                  materia_cantidad_remision.push(matCant);
                }
              }
            });
          }
        });

        this.recuperadoService.srvObtenerListaPorFecha(fecha).subscribe(datos_recuperado => {
          for (let i = 0; i < datos_recuperado.length; i++) {
            this.recuperadoMPService.srvObtenerListaPorRecuperadoId(datos_recuperado[i].recMp_Id).subscribe(datos_recuperadoMP => {
              for (let j = 0; j < datos_recuperadoMP.length; j++) {
                if (datos_recuperadoMP[j].matPri_Id == idMateriaPrima) {
                  const matCant : any = {
                    materiaPrima : idMateriaPrima,
                    cantidad : datos_recuperadoMP[j].recMatPri_Cantidad,
                  }
                  materia_cantidad_recuperado.push(matCant);
                }
              }
            });
          }
        });

        this.devolucionesService.srvObtenerListaPofechas(fecha, fechaFinal).subscribe(datos_devoluciones => {
          for (let i = 0; i < datos_devoluciones.length; i++) {
            this.detallesDevolucionesService.srvObtenerListaPorDevId(datos_devoluciones[i].devMatPri_Id).subscribe(datos_detallesDevoluciones => {
              for (let j = 0; j < datos_detallesDevoluciones.length; j++) {
                this.materiaPrimaService.srvObtenerListaPorId(datos_detallesDevoluciones[j].matPri_Id).subscribe(datos_materiaPrima => {
                  const matCant : any = {
                    materiaPrima : datos_materiaPrima.matPri_Id,
                    cantidad : datos_detallesDevoluciones[j].dtDevMatPri_CantidadDevuelta,
                  }
                  materia_cantidad_devoluciones.push(matCant);
                });
              }
            });
          }
        });

        this.detallesEntTintas.srvObtenerListaPorFecha(this.today).subscribe(datos_entradaTinta => {
          for (let i = 0; i < datos_entradaTinta.length; i++) {
            this.tintasService.srvObtenerListaPorId(datos_entradaTinta[i].tinta_Id).subscribe(datos_tintas => {
              let tintaCant : any = {
                materiaPrima : datos_entradaTinta[i].tinta_Id,
                categoria : datos_tintas.catMP_Id,
                cantidad : datos_entradaTinta[i].dtEntTinta_Cantidad,
              }
              materia_cantidad_tintas_Entrada.push(tintaCant);
            });
          }
        });

        setTimeout(() => {
          if (this.ValidarRol == 1 || this.ValidarRol == 4){
            this.materiaPrimaService.srvObtenerListaPorId(idMateriaPrima).subscribe(datos_materiaPrima => {
              this.categoriMpService.srvObtenerListaPorId(datos_materiaPrima.catMP_Id).subscribe(datos_categoria => {
                this.inventInicialDiaService.srvObtenerListaPorId(datos_materiaPrima.matPri_Id).subscribe(datos_inventarioInicial => {
                  this.sumaSalida = 0;
                  this.sumaEntrada = 0;
                  this.inventInicial = 0;
                  this.inventInicial = datos_inventarioInicial.invInicial_Stock;
                  // Asignaciones
                  for (const item of materia_cantidad) {
                    if (datos_materiaPrima.matPri_Id == item.materiaPrima) {
                      this.sumaSalida = this.sumaSalida + item.cantidad;
                      // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaSalida} de salida el dia ${fecha}`)
                    }
                  }
                  // Facturas
                  for (const item of materia_cantidad_factura) {
                    if (datos_materiaPrima.matPri_Id == item.materiaPrima) {
                      this.sumaEntrada = this.sumaEntrada + item.cantidad;
                      // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaEntrada} de salida el dia ${fecha} FACTURA`)
                    }
                  }
                  // Remisiones
                  for (const item of materia_cantidad_remision) {
                    if (datos_materiaPrima.matPri_Id == item.materiaPrima) {
                      this.sumaEntrada = this.sumaEntrada + item.cantidad;
                      // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaEntrada} de salida el dia ${fecha} REMISION`)
                    }
                  }

                  // Recuperado
                  for (const item of materia_cantidad_recuperado) {
                    if (datos_materiaPrima.matPri_Id == item.materiaPrima) {
                      this.sumaEntrada = this.sumaEntrada + item.cantidad;
                      // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaEntrada} de salida el dia ${fecha} REMISION`)
                    }
                  }

                  // Devoluciones
                  for (const item of materia_cantidad_devoluciones) {
                    if (datos_materiaPrima.matPri_Id == item.materiaPrima) {
                      this.sumaEntrada = this.sumaEntrada + item.cantidad;
                      this.sumaSalida = this.sumaSalida - item.cantidad;
                    }
                  }

                  this.cargarFormMpEnTablas(this.ArrayMateriaPrima,
                    datos_materiaPrima.matPri_Id,
                    datos_materiaPrima.matPri_Nombre,
                    datos_materiaPrima.matPri_Precio,
                    this.inventInicial,
                    this.sumaEntrada,
                    this.sumaSalida,
                    datos_materiaPrima.matPri_Stock,
                    datos_materiaPrima.undMed_Id,
                    datos_categoria.catMP_Nombre);

                });
              });
            });

            this.tintasService.srvObtenerListaPorId(idMateriaPrima).subscribe(datos_tintas => {
              for (let i = 0; i < datos_tintas.length; i++) {
                if (datos_tintas[i].catMP_Id == categoria) {
                  this.categoriMpService.srvObtenerListaPorId(datos_tintas[i].catMP_Id).subscribe(datos_categoria => {
                    this.sumaSalida = 0;
                      this.sumaEntrada = 0;
                      this.inventInicial = 0;
                      this.inventInicial = 0;
                      // Entradas
                      for (const item of materia_cantidad_tintas_Entrada) {
                        if (datos_tintas[i].tinta_Id == item.materiaPrima && item.categoria == 7) {
                          this.sumaEntrada = this.sumaEntrada + item.cantidad;
                        }
                      }

                      // Asignaciones
                      for (const item of materia_cantidad_tintas) {
                        if (datos_tintas[i].tinta_Id == item.materiaPrima && item.categoria == 7) {
                          this.sumaEntrada = this.sumaEntrada + item.cantidad;
                        }
                      }

                      this.inventInicial = 0;
                      this.inventInicial = 0;

                      this.cargarFormMpEnTablas(this.ArrayMateriaPrima,
                        datos_tintas[i].tinta_Id,
                        datos_tintas[i].tinta_Nombre,
                        datos_tintas[i].tinta_Precio,
                        datos_tintas[i].tinta_InvInicial,
                        this.sumaEntrada,
                        this.sumaSalida,
                        datos_tintas[i].tinta_Stock,
                        datos_tintas[i].undMed_Id,
                        datos_categoria.catMP_Nombre);
                  });
                }
              }
            });
          }
          this.load = true;
        }, 2000);
      }

    } else if (fecha != null && fechaFinal != null && categoria != null) {
      this.load = false;

      this.asignacionService.srvObtenerListaPorFechas(fecha, fechaFinal).subscribe(datos_asignaciones => {
        for (let i = 0; i < datos_asignaciones.length; i++) {
          this.asignacionMpService.srvObtenerListaPorAsigId(datos_asignaciones[i].asigMp_Id).subscribe(datos_asignacionesMP => {
            for (let j = 0; j < datos_asignacionesMP.length; j++) {
              this.materiaPrimaService.srvObtenerListaPorId(datos_asignacionesMP[j].matPri_Id).subscribe(datos_materiaPrima => {
                if (datos_materiaPrima.catMP_Id == categoria) {
                  const matCant : any = {
                    materiaPrima : datos_materiaPrima.matPri_Id,
                    cantidad : datos_asignacionesMP[j].dtAsigMp_Cantidad,
                    categoria : datos_materiaPrima.catMP_Id,
                  }
                  materia_cantidad.push(matCant);
                }
              });
            }
          });

          this.asignacionTintasService.srvObtenerListaPor_Asignacion(datos_asignaciones[i].asigMp_Id).subscribe(datos_asignacionTintas => {
            for (let j = 0; j < datos_asignacionTintas.length; j++) {
              this.tintasService.srvObtenerListaPorId(datos_asignacionTintas[j].tinta_Id).subscribe(datos_tintas => {
                if (datos_tintas.catMP_Id == categoria) {
                  const matCant : any = {
                    materiaPrima : datos_tintas.tinta_Id,
                    cantidad : datos_asignacionTintas[j].dtAsigTinta_Cantidad,
                    categoria : datos_tintas.catMP_Id,
                  }
                  materia_cantidad.push(matCant);
                }
              });
            }
          });
        }
      });

      this.boppService.srvObtenerListaPorFechas(fecha, fechaFinal).subscribe(datos_bopp => {
        for (let i = 0; i < datos_bopp.length; i++) {
          if (datos_bopp[i].catMP_Id == categoria) {
            const matCant : any = {
              materiaPrima : datos_bopp[i].bopP_Id,
              cantidad : datos_bopp[i].bopP_CantidadInicialKg,
            }
            bopp_entrante.push(matCant);
          }
        }
      });

      this.asignacionBOPPService.srvObtenerListaPorfechas(fecha, fechaFinal).subscribe(datos_asignacionBopp => {
        for (let i = 0; i < datos_asignacionBopp.length; i++) {
          this.detallesAsignacionBOPPService.srvObtenerListaPorAsignacion(datos_asignacionBopp[i].asigBOPP_Id).subscribe(datos_detallesAsgBopp => {
            for (let j = 0; j < datos_detallesAsgBopp.length; j++) {
              this.boppService.srvObtenerListaPorId(datos_detallesAsgBopp[j].bopP_Id).subscribe(datos_bopp => {
                let bopp : any = [];
                bopp.push(datos_bopp);
                for (const item of bopp) {
                  if (item.catMP_Id == categoria) {
                    const matCant : any = {
                      materiaPrima : item.bopP_Id,
                      cantidad : datos_detallesAsgBopp[j].dtAsigBOPP_Cantidad,
                    }
                    bopp_Saliente.push(matCant);
                  }
                }
              });
            }
          });
        }
      });

      this.facturaCompraService.srvObtenerListaPorFechas(fecha, fechaFinal).subscribe(datos_factura => {
        for (let i = 0; i < datos_factura.length; i++) {
          this.facturaCompraMPService.srvObtenerListaPorFacId(datos_factura[i].facco_Id).subscribe(datos_facturaMP => {
            console.log(datos_facturaMP)
            for (let j = 0; j < datos_facturaMP.length; j++) {
              this.materiaPrimaService.srvObtenerListaPorId(datos_facturaMP[j].matPri_Id).subscribe(datos_materiaPrima => {
                if (datos_materiaPrima.catMP_Id == categoria) {
                  const matCant : any = {
                    materiaPrima : datos_materiaPrima.matPri_Id,
                    cantidad : datos_facturaMP[j].faccoMatPri_Cantidad,
                  }
                  materia_cantidad_factura.push(matCant);
                }
              });
            }
          });
        }
      });

      this.remisionService.srvObtenerListaPorFechas(fecha, fechaFinal).subscribe(datos_remisiones => {
        for (let i = 0; i < datos_remisiones.length; i++) {
          this.remisionMpService.srvObtenerListaPorRemId(datos_remisiones[i].rem_Id).subscribe(datos_remisionMP => {
            for (let j = 0; j < datos_remisionMP.length; j++) {
              this.materiaPrimaService.srvObtenerListaPorId(datos_remisionMP[j].matPri_Id).subscribe(datos_materiaPrima => {
                if (datos_materiaPrima.catMP_Id == categoria) {
                  const matCant : any = {
                    materiaPrima : datos_materiaPrima.matPri_Id,
                    cantidad : datos_remisionMP[j].remiMatPri_Cantidad,
                  }
                  materia_cantidad_remision.push(matCant);
                }
              });
            }
          });
        }
      });

      this.recuperadoService.srvObtenerListaPorFechas(fecha, fechaFinal).subscribe(datos_recuperado => {
        for (let i = 0; i < datos_recuperado.length; i++) {
          this.recuperadoMPService.srvObtenerListaPorRecuperadoId(datos_recuperado[i].recMp_Id).subscribe(datos_recuperadoMP => {
            for (let j = 0; j < datos_recuperadoMP.length; j++) {
              this.materiaPrimaService.srvObtenerListaPorId(datos_recuperadoMP[j].matPri_Id).subscribe(datos_materiaPrima => {
                if (datos_materiaPrima.catMP_Id == categoria) {
                  const matCant : any = {
                    materiaPrima : datos_materiaPrima.matPri_Id,
                    cantidad : datos_recuperadoMP[j].recMatPri_Cantidad,
                  }
                  materia_cantidad_recuperado.push(matCant);
                }
              });
            }
          });
        }
      });

      this.devolucionesService.srvObtenerListaPofechas(fecha, fechaFinal).subscribe(datos_devoluciones => {
        for (let i = 0; i < datos_devoluciones.length; i++) {
          this.detallesDevolucionesService.srvObtenerListaPorDevId(datos_devoluciones[i].devMatPri_Id).subscribe(datos_detallesDevoluciones => {
            for (let j = 0; j < datos_detallesDevoluciones.length; j++) {
              this.materiaPrimaService.srvObtenerListaPorId(datos_detallesDevoluciones[j].matPri_Id).subscribe(datos_materiaPrima => {
                const matCant : any = {
                  materiaPrima : datos_materiaPrima.matPri_Id,
                  cantidad : datos_detallesDevoluciones[j].dtDevMatPri_CantidadDevuelta,
                }
                materia_cantidad_devoluciones.push(matCant);
              });
            }
          });
        }
      });

      this.detallesEntTintas.srvObtenerListaPorFechas(fecha, fechaFinal).subscribe(datos_entradaTinta => {
        for (let i = 0; i < datos_entradaTinta.length; i++) {
          this.tintasService.srvObtenerListaPorId(datos_entradaTinta[i].tinta_Id).subscribe(datos_tintas => {
            let tintaCant : any = {
              materiaPrima : datos_entradaTinta[i].tinta_Id,
              categoria : datos_tintas.catMP_Id,
              cantidad : datos_entradaTinta[i].dtEntTinta_Cantidad,
            }
            materia_cantidad_tintas_Entrada.push(tintaCant);
          });
        }
      });

      setTimeout(() => {
        if (this.ValidarRol == 1 || this.ValidarRol == 3){
          this.materiaPrimaService.srvObtenerListaPorCategoria(categoria).subscribe(datos_materiaPrima => {
            for (let index = 0; index < datos_materiaPrima.length; index++) {
              if (datos_materiaPrima[index].catMP_Id == categoria) {
                this.categoriMpService.srvObtenerListaPorId(datos_materiaPrima[index].catMP_Id).subscribe(datos_categoria => {
                  this.inventInicialDiaService.srvObtenerListaPorId(datos_materiaPrima[index].matPri_Id).subscribe(datos_inventarioInicial => {
                    this.sumaSalida = 0;
                    this.sumaEntrada = 0;
                    this.inventInicial = 0;
                    this.inventInicial = datos_inventarioInicial.invInicial_Stock;
                    // Asignaciones
                    for (const item of materia_cantidad) {
                      if (datos_materiaPrima[index].matPri_Id == item.materiaPrima && item.categoria != 7) {
                        this.sumaSalida = this.sumaSalida + item.cantidad;
                        // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaSalida} de salida el dia ${fecha}`)
                      }
                    }
                    // Facturas
                    for (const item of materia_cantidad_factura) {
                      if (datos_materiaPrima[index].matPri_Id == item.materiaPrima) {
                        this.sumaEntrada = this.sumaEntrada + item.cantidad;
                        // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaEntrada} de salida el dia ${fecha} FACTURA`)
                      }
                    }
                    // Remisiones
                    for (const item of materia_cantidad_remision) {
                      if (datos_materiaPrima[index].matPri_Id == item.materiaPrima) {
                        this.sumaEntrada = this.sumaEntrada + item.cantidad;
                        // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaEntrada} de salida el dia ${fecha} REMISION`)
                      }
                    }

                    // Recuperado
                    for (const item of materia_cantidad_recuperado) {
                      if (datos_materiaPrima[index].matPri_Id == item.materiaPrima) {
                        this.sumaEntrada = this.sumaEntrada + item.cantidad;
                        // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaEntrada} de salida el dia ${fecha} REMISION`)
                      }
                    }

                    // Devoluciones
                    for (const item of materia_cantidad_devoluciones) {
                      if (datos_materiaPrima[index].matPri_Id == item.materiaPrima) {
                        this.sumaEntrada = this.sumaEntrada + item.cantidad;
                        this.sumaSalida = this.sumaSalida - item.cantidad;
                      }
                    }

                    this.inventInicial = 0;
                    this.inventInicial = datos_inventarioInicial.invInicial_Stock;

                    this.cargarFormMpEnTablas(this.ArrayMateriaPrima,
                      datos_materiaPrima[index].matPri_Id,
                      datos_materiaPrima[index].matPri_Nombre,
                      datos_materiaPrima[index].matPri_Precio,
                      this.inventInicial,
                      this.sumaEntrada,
                      this.sumaSalida,
                      datos_materiaPrima[index].matPri_Stock,
                      datos_materiaPrima[index].undMed_Id,
                      datos_categoria.catMP_Nombre);
                  });
                });
              }
            }
          });

          if (categoria == 7){
            this.tintasService.srvObtenerLista().subscribe(datos_tintas => {
              for (let i = 0; i < datos_tintas.length; i++) {
                if (datos_tintas[i].catMP_Id == categoria) {
                  this.categoriMpService.srvObtenerListaPorId(datos_tintas[i].catMP_Id).subscribe(datos_categoria => {
                    this.sumaSalida = 0;
                      this.sumaEntrada = 0;
                      this.inventInicial = 0;
                      this.inventInicial = 0;
                      // Entradas
                      for (const item of materia_cantidad_tintas_Entrada) {
                        if (datos_tintas[i].tinta_Id == item.materiaPrima && item.categoria == 7) {
                          this.sumaEntrada = this.sumaEntrada + item.cantidad;
                        }
                      }

                      // Asignaciones
                      for (const item of materia_cantidad_tintas) {
                        if (datos_tintas[i].tinta_Id == item.materiaPrima && item.categoria == 7) {
                          this.sumaEntrada = this.sumaEntrada + item.cantidad;
                        }
                      }

                      this.inventInicial = 0;
                      this.inventInicial = 0;

                      this.cargarFormMpEnTablas(this.ArrayMateriaPrima,
                        datos_tintas[i].tinta_Id,
                        datos_tintas[i].tinta_Nombre,
                        datos_tintas[i].tinta_Precio,
                        datos_tintas[i].tinta_InvInicial,
                        this.sumaEntrada,
                        this.sumaSalida,
                        datos_tintas[i].tinta_Stock,
                        datos_tintas[i].undMed_Id,
                        datos_categoria.catMP_Nombre);
                  });
                }
              }
            });
          }
        }

        if (this.ValidarRol == 1 || this.ValidarRol == 4){
          this.boppService.srvObtenerLista().subscribe(datos_bopp => {
            for (let i = 0; i < datos_bopp.length; i++) {
              if (datos_bopp[i].catMP_Id == categoria) {
                this.categoriaBOPP = 'BOPP';
                this.categoriMpService.srvObtenerListaPorId(datos_bopp[i].catMP_Id).subscribe(datos_categoria => {
                  this.sumaSalida = 0;
                  this.sumaEntrada = 0;
                  this.inventInicial = 0;
                  for (const item of bopp_Saliente) {
                    if (datos_bopp[i].bopP_Id == item.materiaPrima && datos_categoria.catMP_Id == categoria) {
                      this.sumaSalida = this.sumaSalida + item.cantidad;
                    }
                  }

                  for (const item of bopp_entrante) {
                    if (datos_bopp[i].bopP_Id == item.materiaPrima && datos_categoria.catMP_Id == categoria) {
                      this.sumaEntrada = this.sumaEntrada + item.cantidad;
                    }
                  }

                  this.inventInicial = 0;
                  this.cargarFormMpEnTablas(this.ArrayMateriaPrima,
                    datos_bopp[i].bopP_Serial,
                    datos_bopp[i].bopP_Descripcion, /** Descripcion en vez de nombre */
                    datos_bopp[i].bopP_Precio,
                    datos_bopp[i].bopP_CantidadInicialKg,
                    this.sumaEntrada,
                    this.sumaSalida,
                    datos_bopp[i].bopP_Stock,
                    "Kg",
                    datos_categoria.catMP_Nombre,
                    datos_bopp[i].bopP_Ancho);
                });
              }
            }
          });
        }
      }, 2000);
    } else if ((materiaPrima != null || idMateriaPrima != null) && categoria != null) {
      this.load = false;

      if (materiaPrima != null) {
        this.asignacionService.srvObtenerListaPorFecha(this.today).subscribe(datos_asignaciones => {
          for (let i = 0; i < datos_asignaciones.length; i++) {
            this.asignacionMpService.srvObtenerListaPorAsigId(datos_asignaciones[i].asigMp_Id).subscribe(datos_asignacionesMP => {
              for (let j = 0; j < datos_asignacionesMP.length; j++) {
                this.materiaPrimaService.srvObtenerListaPorId(datos_asignacionesMP[j].matPri_Id).subscribe(datos_materiaPrima => {
                  if (datos_materiaPrima.catMP_Id == categoria) {
                    const matCant : any = {
                      materiaPrima : datos_materiaPrima.matPri_Id,
                      cantidad : datos_asignacionesMP[j].dtAsigMp_Cantidad,
                      categoria : datos_materiaPrima.catMP_Id,
                    }
                    materia_cantidad.push(matCant);
                  }
                });
              }
            });

            this.asignacionTintasService.srvObtenerListaPor_Asignacion(datos_asignaciones[i].asigMp_Id).subscribe(datos_asignacionTintas => {
              for (let j = 0; j < datos_asignacionTintas.length; j++) {
                this.tintasService.srvObtenerListaPorId(datos_asignacionTintas[j].tinta_Id).subscribe(datos_tintas => {
                  if (datos_tintas.catMP_Id == categoria) {
                    const matCant : any = {
                      materiaPrima : datos_tintas.tinta_Id,
                      cantidad : datos_asignacionTintas[j].dtAsigTinta_Cantidad,
                      categoria : datos_tintas.catMP_Id,
                    }
                    materia_cantidad.push(matCant);
                  }
                });
              }
            });
          }
        });

        this.boppService.srvObtenerListaPorFecha(this.today).subscribe(datos_bopp => {
          for (let i = 0; i < datos_bopp.length; i++) {
            if (datos_bopp[i].catMP_Id == categoria) {

            const matCant : any = {
              materiaPrima : datos_bopp[i].bopP_Id,
              cantidad : datos_bopp[i].bopP_CantidadInicialKg,
            }
              bopp_entrante.push(matCant);
            }
          }
        });

        this.asignacionBOPPService.srvObtenerListaPorfecha(this.today).subscribe(datos_asignacionBopp => {
          for (let i = 0; i < datos_asignacionBopp.length; i++) {
            this.detallesAsignacionBOPPService.srvObtenerListaPorAsignacion(datos_asignacionBopp[i].asigBOPP_Id).subscribe(datos_detallesAsgBopp => {
              for (let j = 0; j < datos_detallesAsgBopp.length; j++) {
                this.boppService.srvObtenerListaPorId(datos_detallesAsgBopp[j].bopP_Id).subscribe(datos_bopp => {
                  let bopp : any = [];
                  bopp.push(datos_bopp);
                  for (const item of bopp) {
                    if (item.catMP_Id == categoria) {
                      const matCant : any = {
                        materiaPrima : item.bopP_Id,
                        cantidad : datos_detallesAsgBopp[j].dtAsigBOPP_Cantidad,
                      }
                      bopp_Saliente.push(matCant);
                    }
                  }
                });
              }
            });
          }
        });

        this.facturaCompraService.srvObtenerListaPorFecha(this.today).subscribe(datos_factura => {
          for (let i = 0; i < datos_factura.length; i++) {
            this.facturaCompraMPService.srvObtenerListaPorFacId(datos_factura[i].facco_Id).subscribe(datos_facturaMP => {
              console.log(datos_facturaMP)
              for (let j = 0; j < datos_facturaMP.length; j++) {
                this.materiaPrimaService.srvObtenerListaPorId(datos_facturaMP[j].matPri_Id).subscribe(datos_materiaPrima => {
                  if (datos_materiaPrima.catMP_Id == categoria) {
                    const matCant : any = {
                      materiaPrima : datos_materiaPrima.matPri_Id,
                      cantidad : datos_facturaMP[j].faccoMatPri_Cantidad,
                    }
                    materia_cantidad_factura.push(matCant);
                  }
                });
              }
            });
          }
        });

        this.remisionService.srvObtenerListaPorFecha(this.today).subscribe(datos_remisiones => {
          for (let i = 0; i < datos_remisiones.length; i++) {
            this.remisionMpService.srvObtenerListaPorRemId(datos_remisiones[i].rem_Id).subscribe(datos_remisionMP => {
              for (let j = 0; j < datos_remisionMP.length; j++) {
                this.materiaPrimaService.srvObtenerListaPorId(datos_remisionMP[j].matPri_Id).subscribe(datos_materiaPrima => {
                  if (datos_materiaPrima.catMP_Id == categoria) {
                    const matCant : any = {
                      materiaPrima : datos_materiaPrima.matPri_Id,
                      cantidad : datos_remisionMP[j].remiMatPri_Cantidad,
                    }
                    materia_cantidad_remision.push(matCant);
                  }
                });
              }
            });
          }
        });

        this.recuperadoService.srvObtenerListaPorFecha(this.today).subscribe(datos_recuperado => {
          for (let i = 0; i < datos_recuperado.length; i++) {
            this.recuperadoMPService.srvObtenerListaPorRecuperadoId(datos_recuperado[i].recMp_Id).subscribe(datos_recuperadoMP => {
              for (let j = 0; j < datos_recuperadoMP.length; j++) {
                this.materiaPrimaService.srvObtenerListaPorId(datos_recuperadoMP[j].matPri_Id).subscribe(datos_materiaPrima => {
                  if (datos_materiaPrima.catMP_Id == categoria) {
                    const matCant : any = {
                      materiaPrima : datos_materiaPrima.matPri_Id,
                      cantidad : datos_recuperadoMP[j].recMatPri_Cantidad,
                    }
                    materia_cantidad_recuperado.push(matCant);
                  }
                });
              }
            });
          }
        });

        this.devolucionesService.srvObtenerListaPorfecha(this.today).subscribe(datos_devoluciones => {
          for (let i = 0; i < datos_devoluciones.length; i++) {
            this.detallesDevolucionesService.srvObtenerListaPorDevId(datos_devoluciones[i].devMatPri_Id).subscribe(datos_detallesDevoluciones => {
              for (let j = 0; j < datos_detallesDevoluciones.length; j++) {
                this.materiaPrimaService.srvObtenerListaPorId(datos_detallesDevoluciones[j].matPri_Id).subscribe(datos_materiaPrima => {
                  const matCant : any = {
                    materiaPrima : datos_materiaPrima.matPri_Id,
                    cantidad : datos_detallesDevoluciones[j].dtDevMatPri_CantidadDevuelta,
                  }
                  materia_cantidad_devoluciones.push(matCant);
                });
              }
            });
          }
        });

        this.detallesEntTintas.srvObtenerListaPorFecha(this.today).subscribe(datos_entradaTinta => {
          for (let i = 0; i < datos_entradaTinta.length; i++) {
            this.tintasService.srvObtenerListaPorId(datos_entradaTinta[i].tinta_Id).subscribe(datos_tintas => {
              let tintaCant : any = {
                materiaPrima : datos_entradaTinta[i].tinta_Id,
                categoria : datos_tintas.catMP_Id,
                cantidad : datos_entradaTinta[i].dtEntTinta_Cantidad,
              }
              materia_cantidad_tintas_Entrada.push(tintaCant);
            });
          }
        });

        setTimeout(() => {
          if (this.ValidarRol == 1 || this.ValidarRol == 3){
            this.materiaPrimaService.srvObtenerListaPorCategoria(categoria).subscribe(datos_materiaPrima => {
              if (datos_materiaPrima.length == 0) this.load = true;
              else {
                for (let index = 0; index < datos_materiaPrima.length; index++) {
                  if (datos_materiaPrima[index].catMP_Id == categoria && datos_materiaPrima[index].matPri_Id == materiaPrima) {
                    this.categoriMpService.srvObtenerListaPorId(datos_materiaPrima[index].catMP_Id).subscribe(datos_categoria => {
                      this.inventInicialDiaService.srvObtenerListaPorId(datos_materiaPrima[index].matPri_Id).subscribe(datos_inventarioInicial => {
                        this.sumaSalida = 0;
                        this.sumaEntrada = 0;
                        this.inventInicial = 0;
                        this.inventInicial = datos_inventarioInicial.invInicial_Stock;
                        // Asignaciones
                        for (const item of materia_cantidad) {
                          if (datos_materiaPrima[index].matPri_Id == item.materiaPrima && item.categoria != 7) {
                            this.sumaSalida = this.sumaSalida + item.cantidad;
                            // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaSalida} de salida el dia ${fecha}`)
                          }
                        }
                        // Facturas
                        for (const item of materia_cantidad_factura) {
                          if (datos_materiaPrima[index].matPri_Id == item.materiaPrima) {
                            this.sumaEntrada = this.sumaEntrada + item.cantidad;
                            // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaEntrada} de salida el dia ${fecha} FACTURA`)
                          }
                        }
                        // Remisiones
                        for (const item of materia_cantidad_remision) {
                          if (datos_materiaPrima[index].matPri_Id == item.materiaPrima) {
                            this.sumaEntrada = this.sumaEntrada + item.cantidad;
                            // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaEntrada} de salida el dia ${fecha} REMISION`)
                          }
                        }

                        // Recuperado
                        for (const item of materia_cantidad_recuperado) {
                          if (datos_materiaPrima[index].matPri_Id == item.materiaPrima) {
                            this.sumaEntrada = this.sumaEntrada + item.cantidad;
                            // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaEntrada} de salida el dia ${fecha} REMISION`)
                          }
                        }

                        // Devoluciones
                        for (const item of materia_cantidad_devoluciones) {
                          if (datos_materiaPrima[index].matPri_Id == item.materiaPrima) {
                            this.sumaEntrada = this.sumaEntrada + item.cantidad;
                            this.sumaSalida = this.sumaSalida - item.cantidad;
                          }
                        }

                        this.inventInicial = 0;
                        this.inventInicial = datos_inventarioInicial.invInicial_Stock;

                        this.cargarFormMpEnTablas(this.ArrayMateriaPrima,
                          datos_materiaPrima[index].matPri_Id,
                          datos_materiaPrima[index].matPri_Nombre,
                          datos_materiaPrima[index].matPri_Precio,
                          this.inventInicial,
                          this.sumaEntrada,
                          this.sumaSalida,
                          datos_materiaPrima[index].matPri_Stock,
                          datos_materiaPrima[index].undMed_Id,
                          datos_categoria.catMP_Nombre);
                      });
                    });
                  }
                }
              }
            });

            this.tintasService.srvObtenerLista().subscribe(datos_tintas => {
              for (let i = 0; i < datos_tintas.length; i++) {
                if (datos_tintas[i].catMP_Id == categoria && datos_tintas[i].tinta_Id == materiaPrima) {
                  this.categoriMpService.srvObtenerListaPorId(datos_tintas[i].catMP_Id).subscribe(datos_categoria => {
                    this.sumaSalida = 0;
                      this.sumaEntrada = 0;
                      this.inventInicial = 0;
                      this.inventInicial = 0;
                      // Entradas
                      for (const item of materia_cantidad_tintas_Entrada) {
                        if (datos_tintas[i].tinta_Id == item.materiaPrima && item.categoria == 7) {
                          this.sumaEntrada = this.sumaEntrada + item.cantidad;
                        }
                      }

                      // Asignaciones
                      for (const item of materia_cantidad_tintas) {
                        if (datos_tintas[i].tinta_Id == item.materiaPrima && item.categoria == 7) {
                          this.sumaEntrada = this.sumaEntrada + item.cantidad;
                        }
                      }

                      this.inventInicial = 0;
                      this.inventInicial = 0;

                      this.cargarFormMpEnTablas(this.ArrayMateriaPrima,
                        datos_tintas[i].tinta_Id,
                        datos_tintas[i].tinta_Nombre,
                        datos_tintas[i].tinta_Precio,
                        datos_tintas[i].tinta_InvInicial,
                        this.sumaEntrada,
                        this.sumaSalida,
                        datos_tintas[i].tinta_Stock,
                        datos_tintas[i].undMed_Id,
                        datos_categoria.catMP_Nombre);
                  });
                }
              }
            });
          }

          if (this.ValidarRol == 1 || this.ValidarRol == 4){
            this.boppService.srvObtenerLista().subscribe(datos_bopp => {
              for (let i = 0; i < datos_bopp.length; i++) {
                if (datos_bopp[i].catMP_Id == categoria && datos_bopp[i].bopP_Id == materiaPrima) {
                  this.categoriaBOPP = 'BOPP';
                  this.categoriMpService.srvObtenerListaPorId(datos_bopp[i].catMP_Id).subscribe(datos_categoria => {
                    this.sumaSalida = 0;
                    this.sumaEntrada = 0;
                    this.inventInicial = 0;
                    for (const item of bopp_Saliente) {
                      if (datos_bopp[i].bopP_Id == item.materiaPrima && datos_categoria.catMP_Id == categoria) {
                        this.sumaSalida = this.sumaSalida + item.cantidad;
                      }
                    }

                    for (const item of bopp_entrante) {
                      if (datos_bopp[i].bopP_Id == item.materiaPrima && datos_categoria.catMP_Id == categoria) {
                        this.sumaEntrada = this.sumaEntrada + + item.cantidad;
                      }
                    }

                    this.inventInicial = 0;

                    this.cargarFormMpEnTablas(this.ArrayMateriaPrima,
                      datos_bopp[i].bopP_Serial,
                      datos_bopp[i].bopP_Descripcion, /** Descripcion en vez de nombre */
                      datos_bopp[i].bopP_Precio,
                      datos_bopp[i].bopP_CantidadInicialKg,
                      this.sumaEntrada,
                      this.sumaSalida,
                      datos_bopp[i].bopP_Stock,
                      "Kg",
                      datos_categoria.catMP_Nombre,
                      datos_bopp[i].bopP_Ancho);
                  });
                }
              }
            });
          }
        }, 2000);
      } else if (idMateriaPrima != null) {
        this.asignacionService.srvObtenerListaPorFecha(this.today).subscribe(datos_asignaciones => {
          for (let i = 0; i < datos_asignaciones.length; i++) {
            this.asignacionMpService.srvObtenerListaPorAsigId(datos_asignaciones[i].asigMp_Id).subscribe(datos_asignacionesMP => {
              for (let j = 0; j < datos_asignacionesMP.length; j++) {
                this.materiaPrimaService.srvObtenerListaPorId(datos_asignacionesMP[j].matPri_Id).subscribe(datos_materiaPrima => {
                  if (datos_materiaPrima.catMP_Id == categoria) {
                    const matCant : any = {
                      materiaPrima : datos_materiaPrima.matPri_Id,
                      cantidad : datos_asignacionesMP[j].dtAsigMp_Cantidad,
                      categoria : datos_materiaPrima.catMP_Id,
                    }
                    materia_cantidad.push(matCant);
                  }
                });
              }
            });

            this.asignacionTintasService.srvObtenerListaPor_Asignacion(datos_asignaciones[i].asigMp_Id).subscribe(datos_asignacionTintas => {
              for (let j = 0; j < datos_asignacionTintas.length; j++) {
                this.tintasService.srvObtenerListaPorId(datos_asignacionTintas[j].tinta_Id).subscribe(datos_tintas => {
                  if (datos_tintas.catMP_Id == categoria) {
                    const matCant : any = {
                      materiaPrima : datos_tintas.tinta_Id,
                      cantidad : datos_asignacionTintas[j].dtAsigTinta_Cantidad,
                      categoria : datos_tintas.catMP_Id,
                    }
                    materia_cantidad.push(matCant);
                  }
                });
              }
            });
          }
        });

        this.boppService.srvObtenerListaPorFecha(this.today).subscribe(datos_bopp => {
          for (let i = 0; i < datos_bopp.length; i++) {
            if (datos_bopp[i].catMP_Id == categoria) {

            const matCant : any = {
              materiaPrima : datos_bopp[i].bopP_Id,
              cantidad : datos_bopp[i].bopP_CantidadInicialKg,
            }
              bopp_entrante.push(matCant);
            }
          }
        });

        this.asignacionBOPPService.srvObtenerListaPorfecha(this.today).subscribe(datos_asignacionBopp => {
          for (let i = 0; i < datos_asignacionBopp.length; i++) {
            this.detallesAsignacionBOPPService.srvObtenerListaPorAsignacion(datos_asignacionBopp[i].asigBOPP_Id).subscribe(datos_detallesAsgBopp => {
              for (let j = 0; j < datos_detallesAsgBopp.length; j++) {
                this.boppService.srvObtenerListaPorId(datos_detallesAsgBopp[j].bopP_Id).subscribe(datos_bopp => {
                  let bopp : any = [];
                  bopp.push(datos_bopp);
                  for (const item of bopp) {
                    if (item.catMP_Id == categoria) {
                      const matCant : any = {
                        materiaPrima : item.bopP_Id,
                        cantidad : datos_detallesAsgBopp[j].dtAsigBOPP_Cantidad,
                      }
                      bopp_Saliente.push(matCant);
                    }
                  }
                });
              }
            });
          }
        });

        this.facturaCompraService.srvObtenerListaPorFecha(this.today).subscribe(datos_factura => {
          for (let i = 0; i < datos_factura.length; i++) {
            this.facturaCompraMPService.srvObtenerListaPorFacId(datos_factura[i].facco_Id).subscribe(datos_facturaMP => {
              console.log(datos_facturaMP)
              for (let j = 0; j < datos_facturaMP.length; j++) {
                this.materiaPrimaService.srvObtenerListaPorId(datos_facturaMP[j].matPri_Id).subscribe(datos_materiaPrima => {
                  if (datos_materiaPrima.catMP_Id == categoria) {
                    const matCant : any = {
                      materiaPrima : datos_materiaPrima.matPri_Id,
                      cantidad : datos_facturaMP[j].faccoMatPri_Cantidad,
                    }
                    materia_cantidad_factura.push(matCant);
                  }
                });
              }
            });
          }
        });

        this.remisionService.srvObtenerListaPorFecha(this.today).subscribe(datos_remisiones => {
          for (let i = 0; i < datos_remisiones.length; i++) {
            this.remisionMpService.srvObtenerListaPorRemId(datos_remisiones[i].rem_Id).subscribe(datos_remisionMP => {
              for (let j = 0; j < datos_remisionMP.length; j++) {
                this.materiaPrimaService.srvObtenerListaPorId(datos_remisionMP[j].matPri_Id).subscribe(datos_materiaPrima => {
                  if (datos_materiaPrima.catMP_Id == categoria) {
                    const matCant : any = {
                      materiaPrima : datos_materiaPrima.matPri_Id,
                      cantidad : datos_remisionMP[j].remiMatPri_Cantidad,
                    }
                    materia_cantidad_remision.push(matCant);
                  }
                });
              }
            });
          }
        });

        this.recuperadoService.srvObtenerListaPorFecha(this.today).subscribe(datos_recuperado => {
          for (let i = 0; i < datos_recuperado.length; i++) {
            this.recuperadoMPService.srvObtenerListaPorRecuperadoId(datos_recuperado[i].recMp_Id).subscribe(datos_recuperadoMP => {
              for (let j = 0; j < datos_recuperadoMP.length; j++) {
                this.materiaPrimaService.srvObtenerListaPorId(datos_recuperadoMP[j].matPri_Id).subscribe(datos_materiaPrima => {
                  if (datos_materiaPrima.catMP_Id == categoria) {
                    const matCant : any = {
                      materiaPrima : datos_materiaPrima.matPri_Id,
                      cantidad : datos_recuperadoMP[j].recMatPri_Cantidad,
                    }
                    materia_cantidad_recuperado.push(matCant);
                  }
                });
              }
            });
          }
        });

        this.devolucionesService.srvObtenerListaPorfecha(this.today).subscribe(datos_devoluciones => {
          for (let i = 0; i < datos_devoluciones.length; i++) {
            this.detallesDevolucionesService.srvObtenerListaPorDevId(datos_devoluciones[i].devMatPri_Id).subscribe(datos_detallesDevoluciones => {
              for (let j = 0; j < datos_detallesDevoluciones.length; j++) {
                this.materiaPrimaService.srvObtenerListaPorId(datos_detallesDevoluciones[j].matPri_Id).subscribe(datos_materiaPrima => {
                  const matCant : any = {
                    materiaPrima : datos_materiaPrima.matPri_Id,
                    cantidad : datos_detallesDevoluciones[j].dtDevMatPri_CantidadDevuelta,
                  }
                  materia_cantidad_devoluciones.push(matCant);
                });
              }
            });
          }
        });

        this.detallesEntTintas.srvObtenerListaPorFecha(this.today).subscribe(datos_entradaTinta => {
          for (let i = 0; i < datos_entradaTinta.length; i++) {
            this.tintasService.srvObtenerListaPorId(datos_entradaTinta[i].tinta_Id).subscribe(datos_tintas => {
              let tintaCant : any = {
                materiaPrima : datos_entradaTinta[i].tinta_Id,
                categoria : datos_tintas.catMP_Id,
                cantidad : datos_entradaTinta[i].dtEntTinta_Cantidad,
              }
              materia_cantidad_tintas_Entrada.push(tintaCant);
            });
          }
        });

        setTimeout(() => {
          if (this.ValidarRol == 1 || this.ValidarRol == 3){
            this.materiaPrimaService.srvObtenerListaPorCategoria(categoria).subscribe(datos_materiaPrima => {
              if (datos_materiaPrima.length == 0) this.load = true;
              else {
                for (let index = 0; index < datos_materiaPrima.length; index++) {
                  if (datos_materiaPrima[index].catMP_Id == categoria && datos_materiaPrima[index].matPri_Id == idMateriaPrima) {
                    this.categoriMpService.srvObtenerListaPorId(datos_materiaPrima[index].catMP_Id).subscribe(datos_categoria => {
                      this.inventInicialDiaService.srvObtenerListaPorId(datos_materiaPrima[index].matPri_Id).subscribe(datos_inventarioInicial => {
                        this.sumaSalida = 0;
                        this.sumaEntrada = 0;
                        this.inventInicial = 0;
                        this.inventInicial = datos_inventarioInicial.invInicial_Stock;
                        // Asignaciones
                        for (const item of materia_cantidad) {
                          if (datos_materiaPrima[index].matPri_Id == item.materiaPrima && item.categoria != 7) {
                            this.sumaSalida = this.sumaSalida + item.cantidad;
                            // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaSalida} de salida el dia ${fecha}`)
                          }
                        }
                        // Facturas
                        for (const item of materia_cantidad_factura) {
                          if (datos_materiaPrima[index].matPri_Id == item.materiaPrima) {
                            this.sumaEntrada = this.sumaEntrada + item.cantidad;
                            // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaEntrada} de salida el dia ${fecha} FACTURA`)
                          }
                        }
                        // Remisiones
                        for (const item of materia_cantidad_remision) {
                          if (datos_materiaPrima[index].matPri_Id == item.materiaPrima) {
                            this.sumaEntrada = this.sumaEntrada + item.cantidad;
                            // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaEntrada} de salida el dia ${fecha} REMISION`)
                          }
                        }

                        // Recuperado
                        for (const item of materia_cantidad_recuperado) {
                          if (datos_materiaPrima[index].matPri_Id == item.materiaPrima) {
                            this.sumaEntrada = this.sumaEntrada + item.cantidad;
                            // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaEntrada} de salida el dia ${fecha} REMISION`)
                          }
                        }

                        // Devoluciones
                        for (const item of materia_cantidad_devoluciones) {
                          if (datos_materiaPrima[index].matPri_Id == item.materiaPrima) {
                            this.sumaEntrada = this.sumaEntrada + item.cantidad;
                            this.sumaSalida = this.sumaSalida - item.cantidad;
                          }
                        }

                        this.inventInicial = 0;
                        this.inventInicial = datos_inventarioInicial.invInicial_Stock;

                        this.cargarFormMpEnTablas(this.ArrayMateriaPrima,
                          datos_materiaPrima[index].matPri_Id,
                          datos_materiaPrima[index].matPri_Nombre,
                          datos_materiaPrima[index].matPri_Precio,
                          this.inventInicial,
                          this.sumaEntrada,
                          this.sumaSalida,
                          datos_materiaPrima[index].matPri_Stock,
                          datos_materiaPrima[index].undMed_Id,
                          datos_categoria.catMP_Nombre);
                      });
                    });
                  }
                }
              }
            });

            this.tintasService.srvObtenerLista().subscribe(datos_tintas => {
              for (let i = 0; i < datos_tintas.length; i++) {
                if (datos_tintas[i].catMP_Id == categoria && datos_tintas[i].tinta_Id == idMateriaPrima) {
                  this.categoriMpService.srvObtenerListaPorId(datos_tintas[i].catMP_Id).subscribe(datos_categoria => {
                    this.sumaSalida = 0;
                      this.sumaEntrada = 0;
                      this.inventInicial = 0;
                      this.inventInicial = 0;
                      // Entradas
                      for (const item of materia_cantidad_tintas_Entrada) {
                        if (datos_tintas[i].tinta_Id == item.materiaPrima && item.categoria == 7) {
                          this.sumaEntrada = this.sumaEntrada + item.cantidad;
                        }
                      }

                      // Asignaciones
                      for (const item of materia_cantidad_tintas) {
                        if (datos_tintas[i].tinta_Id == item.materiaPrima && item.categoria == 7) {
                          this.sumaEntrada = this.sumaEntrada + item.cantidad;
                        }
                      }

                      this.inventInicial = 0;
                      this.inventInicial = 0;

                      this.cargarFormMpEnTablas(this.ArrayMateriaPrima,
                        datos_tintas[i].tinta_Id,
                        datos_tintas[i].tinta_Nombre,
                        datos_tintas[i].tinta_Precio,
                        datos_tintas[i].tinta_InvInicial,
                        this.sumaEntrada,
                        this.sumaSalida,
                        datos_tintas[i].tinta_Stock,
                        datos_tintas[i].undMed_Id,
                        datos_categoria.catMP_Nombre);
                  });
                }
              }
            });
          }


          if (this.ValidarRol == 1 || this.ValidarRol == 4){
            this.boppService.srvObtenerLista().subscribe(datos_bopp => {
              for (let i = 0; i < datos_bopp.length; i++) {
                if (datos_bopp[i].catMP_Id == categoria && datos_bopp[i].bopP_Serial == idMateriaPrima) {
                  this.categoriaBOPP = 'BOPP';
                  this.categoriMpService.srvObtenerListaPorId(datos_bopp[i].catMP_Id).subscribe(datos_categoria => {
                    this.sumaSalida = 0;
                    this.sumaEntrada = 0;
                    this.inventInicial = 0;
                    for (const item of bopp_Saliente) {
                      if (datos_bopp[i].bopP_Id == item.materiaPrima && datos_categoria.catMP_Id == categoria) {
                        this.sumaSalida = this.sumaSalida + item.cantidad;
                      }
                    }

                    for (const item of bopp_entrante) {
                      if (datos_bopp[i].bopP_Id == item.materiaPrima && datos_categoria.catMP_Id == categoria) {
                        this.sumaEntrada = this.sumaEntrada + + item.cantidad;
                      }
                    }

                    this.inventInicial = 0;

                    this.cargarFormMpEnTablas(this.ArrayMateriaPrima,
                      datos_bopp[i].bopP_Serial,
                      datos_bopp[i].bopP_Descripcion, /** Descripcion en vez de nombre */
                      datos_bopp[i].bopP_Precio,
                      datos_bopp[i].bopP_CantidadInicialKg,
                      this.sumaEntrada,
                      this.sumaSalida,
                      datos_bopp[i].bopP_Stock,
                      "Kg",
                      datos_categoria.catMP_Nombre,
                      datos_bopp[i].bopP_Ancho);
                  });
                }
              }
            });
          }
        }, 2000);
      }
    } else if (fecha != null && fechaFinal != null) {
      this.load = false;

      this.asignacionService.srvObtenerListaPorFechas(fecha, fechaFinal).subscribe(datos_asignaciones => {
        for (let i = 0; i < datos_asignaciones.length; i++) {
          this.asignacionMpService.srvObtenerListaPorAsigId(datos_asignaciones[i].asigMp_Id).subscribe(datos_asignacionMP => {
            for (let j = 0; j < datos_asignacionMP.length; j++) {
              this.materiaPrimaService.srvObtenerListaPorId(datos_asignacionMP[j].matPri_Id).subscribe(datos_materiaPrima => {
                const matCant : any = {
                  materiaPrima : datos_materiaPrima.matPri_Id,
                  cantidad : datos_asignacionMP[j].dtAsigMp_Cantidad,
                }
                materia_cantidad.push(matCant);
              });
            }
          });
        }
      });

      this.facturaCompraService.srvObtenerListaPorFechas(fecha, fechaFinal).subscribe(datos_factura => {
        for (let i = 0; i < datos_factura.length; i++) {
          this.facturaCompraMPService.srvObtenerListaPorFacId(datos_factura[i].facco_Id).subscribe(datos_facturaMP => {
            console.log(datos_facturaMP)
            for (let j = 0; j < datos_facturaMP.length; j++) {
              this.materiaPrimaService.srvObtenerListaPorId(datos_facturaMP[j].matPri_Id).subscribe(datos_materiaPrima => {
                const matCant : any = {
                  materiaPrima : datos_materiaPrima.matPri_Id,
                  cantidad : datos_facturaMP[j].faccoMatPri_Cantidad,
                }
                materia_cantidad_factura.push(matCant);
              });
            }
          });
        }
      });

      this.remisionService.srvObtenerListaPorFechas(fecha, fechaFinal).subscribe(datos_remisiones => {
        for (let i = 0; i < datos_remisiones.length; i++) {
          this.remisionMpService.srvObtenerListaPorRemId(datos_remisiones[i].rem_Id).subscribe(datos_remisionMP => {
            for (let j = 0; j < datos_remisionMP.length; j++) {
              this.materiaPrimaService.srvObtenerListaPorId(datos_remisionMP[j].matPri_Id).subscribe(datos_materiaPrima => {
                const matCant : any = {
                  materiaPrima : datos_materiaPrima.matPri_Id,
                  cantidad : datos_remisionMP[j].remiMatPri_Cantidad,
                }
                materia_cantidad_remision.push(matCant);
              });
            }
          });
        }
      });

      this.recuperadoService.srvObtenerListaPorFechas(fecha, fechaFinal).subscribe(datos_recuperado => {
        for (let i = 0; i < datos_recuperado.length; i++) {
          this.recuperadoMPService.srvObtenerListaPorRecuperadoId(datos_recuperado[i].recMp_Id).subscribe(datos_recuperadoMP => {
            for (let j = 0; j < datos_recuperadoMP.length; j++) {
              this.materiaPrimaService.srvObtenerListaPorId(datos_recuperadoMP[j].matPri_Id).subscribe(datos_materiaPrima => {
                const matCant : any = {
                  materiaPrima : datos_materiaPrima.matPri_Id,
                  cantidad : datos_recuperadoMP[j].recMatPri_Cantidad,
                }
                materia_cantidad_recuperado.push(matCant);
              });
            }
          });
        }
      });

      if (this.ValidarRol == 1 || this.ValidarRol == 4){
        this.boppService.srvObtenerListaPorFechas(fecha, fechaFinal).subscribe(datos_bopp => {
          for (let i = 0; i < datos_bopp.length; i++) {
            if (datos_bopp[i].catMP_Id == categoria) {
              const matCant : any = {
                materiaPrima : datos_bopp[i].bopP_Id,
                cantidad : datos_bopp[i].bopP_Cantidad,
              }
              bopp_entrante.push(matCant);
            }
          }
        });

        this.asignacionBOPPService.srvObtenerListaPorfechas(fecha, fechaFinal).subscribe(datos_asignacionBopp => {
          for (let i = 0; i < datos_asignacionBopp.length; i++) {
            this.detallesAsignacionBOPPService.srvObtenerListaPorAsignacion(datos_asignacionBopp[i].asigBOPP_Id).subscribe(datos_detallesAsgBopp => {
              for (let j = 0; j < datos_detallesAsgBopp.length; j++) {
                this.boppService.srvObtenerListaPorId(datos_detallesAsgBopp[j].bopP_Id).subscribe(datos_bopp => {
                  let bopp : any = [];
                  bopp.push(datos_bopp);
                  for (const item of bopp) {
                    if (item.catMP_Id == categoria) {
                      const matCant : any = {
                        materiaPrima : item.bopP_Id,
                        cantidad : datos_detallesAsgBopp[j].dtAsigBOPP_Cantidad,
                      }
                      bopp_Saliente.push(matCant);
                    }
                  }
                });
              }
            });
          }
        });
      }

      this.devolucionesService.srvObtenerListaPofechas(fecha, fechaFinal).subscribe(datos_devoluciones => {
        for (let i = 0; i < datos_devoluciones.length; i++) {
          this.detallesDevolucionesService.srvObtenerListaPorDevId(datos_devoluciones[i].devMatPri_Id).subscribe(datos_detallesDevoluciones => {
            for (let j = 0; j < datos_detallesDevoluciones.length; j++) {
              this.materiaPrimaService.srvObtenerListaPorId(datos_detallesDevoluciones[j].matPri_Id).subscribe(datos_materiaPrima => {
                const matCant : any = {
                  materiaPrima : datos_materiaPrima.matPri_Id,
                  cantidad : datos_detallesDevoluciones[j].dtDevMatPri_CantidadDevuelta,
                }
                materia_cantidad_devoluciones.push(matCant);
              });
            }
          });
        }
      });

      setTimeout(() => {
        if (this.ValidarRol == 1 || this.ValidarRol == 3) {
          this.materiaPrimaService.srvObtenerLista().subscribe(datos_materiaPrima => {
            for (let index = 0; index < datos_materiaPrima.length; index++) {
              this.categoriMpService.srvObtenerListaPorId(datos_materiaPrima[index].catMP_Id).subscribe(datos_categoria => {
                this.inventInicialDiaService.srvObtenerListaPorId(datos_materiaPrima[index].matPri_Id).subscribe(datos_inventarioInicial => {
                  this.sumaSalida = 0;
                  this.sumaEntrada = 0;
                  this.inventInicial = 0;
                  this.inventInicial = datos_inventarioInicial.invInicial_Stock;
                  // Asignaciones
                  for (const item of materia_cantidad) {
                    if (datos_materiaPrima[index].matPri_Id == item.materiaPrima) {
                      this.sumaSalida = this.sumaSalida + item.cantidad;
                      // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaSalida} de salida el dia ${fecha}`)
                    }
                  }
                  // Facturas
                  for (const item of materia_cantidad_factura) {
                    if (datos_materiaPrima[index].matPri_Id == item.materiaPrima) {
                      this.sumaEntrada = this.sumaEntrada + item.cantidad;
                      // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaEntrada} de salida el dia ${fecha} FACTURA`)
                    }
                  }
                  // Remisiones
                  for (const item of materia_cantidad_remision) {
                    if (datos_materiaPrima[index].matPri_Id == item.materiaPrima) {
                      this.sumaEntrada = this.sumaEntrada + item.cantidad;
                      // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaEntrada} de salida el dia ${fecha} REMISION`)
                    }
                  }

                  // Recuperado
                  for (const item of materia_cantidad_recuperado) {
                    if (datos_materiaPrima[index].matPri_Id == item.materiaPrima) {
                      this.sumaEntrada = this.sumaEntrada + item.cantidad;
                      // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaEntrada} de salida el dia ${fecha} REMISION`)
                    }
                  }

                  // Devoluciones
                  for (const item of materia_cantidad_devoluciones) {
                    if (datos_materiaPrima[index].matPri_Id == item.materiaPrima) {
                      this.sumaEntrada = this.sumaEntrada + item.cantidad;
                      this.sumaSalida = this.sumaSalida - item.cantidad;
                    }
                  }

                  this.cargarFormMpEnTablas(this.ArrayMateriaPrima,
                    datos_materiaPrima[index].matPri_Id,
                    datos_materiaPrima[index].matPri_Nombre,
                    datos_materiaPrima[index].matPri_Precio,
                    this.inventInicial,
                    this.sumaEntrada,
                    this.sumaSalida,
                    datos_materiaPrima[index].matPri_Stock,
                    datos_materiaPrima[index].undMed_Id,
                    datos_categoria.catMP_Nombre);
                });
              });
            }
          });

          this.tintasService.srvObtenerLista().subscribe(datos_tintas => {
            for (let i = 0; i < datos_tintas.length; i++) {
              if (datos_tintas[i].catMP_Id == categoria) {
                this.categoriMpService.srvObtenerListaPorId(datos_tintas[i].catMP_Id).subscribe(datos_categoria => {
                  this.sumaSalida = 0;
                    this.sumaEntrada = 0;
                    this.inventInicial = 0;
                    this.inventInicial = 0;
                    // Entradas
                    for (const item of materia_cantidad_tintas_Entrada) {
                      if (datos_tintas[i].tinta_Id == item.materiaPrima && item.categoria == 7) {
                        this.sumaEntrada = this.sumaEntrada + item.cantidad;
                      }
                    }

                    // Asignaciones
                    for (const item of materia_cantidad_tintas) {
                      if (datos_tintas[i].tinta_Id == item.materiaPrima && item.categoria == 7) {
                        this.sumaEntrada = this.sumaEntrada + item.cantidad;
                      }
                    }

                    this.inventInicial = 0;
                    this.inventInicial = 0;

                    this.cargarFormMpEnTablas(this.ArrayMateriaPrima,
                      datos_tintas[i].tinta_Id,
                      datos_tintas[i].tinta_Nombre,
                      datos_tintas[i].tinta_Precio,
                      datos_tintas[i].tinta_InvInicial,
                      this.sumaEntrada,
                      this.sumaSalida,
                      datos_tintas[i].tinta_Stock,
                      datos_tintas[i].undMed_Id,
                      datos_categoria.catMP_Nombre);
                });
              }
            }
          });
        }

        // BOPP
        if (this.ValidarRol == 1 || this.ValidarRol == 4){
          this.boppService.srvObtenerLista().subscribe(datos_bopp => {
            for (let i = 0; i < datos_bopp.length; i++) {
              this.categoriMpService.srvObtenerListaPorId(datos_bopp[i].catMP_Id).subscribe(datos_categoria => {
                this.sumaSalida = 0;
                this.sumaEntrada = 0;
                this.inventInicial = 0;
                let cantidad : number = 1;
                for (const item of bopp_Saliente) {
                  if (datos_bopp[i].bopP_Id == item.materiaPrima && datos_categoria.catMP_Id == datos_bopp[i].catMP_Id) {
                    this.sumaSalida = 1;
                  }
                }

                for (const item of bopp_entrante) {
                  if (datos_bopp[i].bopP_Id == item.materiaPrima && datos_categoria.catMP_Id == datos_bopp[i].catMP_Id) {
                    this.sumaEntrada = 1;
                  }
                }

                this.inventInicial = 0;

                this.cargarFormMpEnTablas(this.ArrayMateriaPrima,
                  datos_bopp[i].bopP_Serial,
                  datos_bopp[i].bopP_Nombre,
                  datos_bopp[i].bopP_Precio,
                  this.inventInicial,
                  this.sumaEntrada,
                  this.sumaSalida,
                  cantidad- this.sumaSalida,
                  "Rollo(s)",
                  datos_categoria.catMP_Nombre);
              });
            }
          });
        }
        this.load = true;
      }, 2000);
    } else if (fecha != null && categoria != null) {

      this.load = false;

      this.asignacionService.srvObtenerListaPorFecha(fecha).subscribe(datos_asignaciones => {
        for (let i = 0; i < datos_asignaciones.length; i++) {
          this.asignacionMpService.srvObtenerListaPorAsigId(datos_asignaciones[i].asigMp_Id).subscribe(datos_asignacionesMP => {
            for (let j = 0; j < datos_asignacionesMP.length; j++) {
              this.materiaPrimaService.srvObtenerListaPorId(datos_asignacionesMP[j].matPri_Id).subscribe(datos_materiaPrima => {
                if (datos_materiaPrima.catMP_Id == categoria) {
                  const matCant : any = {
                    materiaPrima : datos_materiaPrima.matPri_Id,
                    cantidad : datos_asignacionesMP[j].dtAsigMp_Cantidad,
                    categoria : datos_materiaPrima.catMP_Id,
                  }
                  materia_cantidad.push(matCant);
                }
              });
            }
          });

          this.asignacionTintasService.srvObtenerListaPor_Asignacion(datos_asignaciones[i].asigMp_Id).subscribe(datos_asignacionTintas => {
            for (let j = 0; j < datos_asignacionTintas.length; j++) {
              this.tintasService.srvObtenerListaPorId(datos_asignacionTintas[j].tinta_Id).subscribe(datos_tintas => {
                if (datos_tintas.catMP_Id == categoria) {
                  const matCant : any = {
                    materiaPrima : datos_tintas.tinta_Id,
                    cantidad : datos_asignacionTintas[j].dtAsigTinta_Cantidad,
                    categoria : datos_tintas.catMP_Id,
                  }
                  materia_cantidad.push(matCant);
                }
              });
            }
          });
        }
      });

      this.boppService.srvObtenerListaPorFecha(fecha).subscribe(datos_bopp => {
        for (let i = 0; i < datos_bopp.length; i++) {
          if (datos_bopp[i].catMP_Id == categoria) {
            const matCant : any = {
              materiaPrima : datos_bopp[i].bopP_Id,
              cantidad : datos_bopp[i].bopP_CantidadInicialKg,
              ancho : datos_bopp[i].bopP_Ancho,
            }
            bopp_entrante.push(matCant);
          }
        }
      });

      this.asignacionBOPPService.srvObtenerListaPorfecha(fecha).subscribe(datos_asignacionBopp => {
        for (let i = 0; i < datos_asignacionBopp.length; i++) {
          this.detallesAsignacionBOPPService.srvObtenerListaPorAsignacion(datos_asignacionBopp[i].asigBOPP_Id).subscribe(datos_detallesAsgBopp => {
            for (let j = 0; j < datos_detallesAsgBopp.length; j++) {
              this.boppService.srvObtenerListaPorId(datos_detallesAsgBopp[j].bopP_Id).subscribe(datos_bopp => {
                let bopp : any = [];
                bopp.push(datos_bopp);
                for (const item of bopp) {
                  if (item.catMP_Id == categoria) {
                    const matCant : any = {
                      materiaPrima : item.bopP_Id,
                      cantidad : datos_detallesAsgBopp[j].dtAsigBOPP_Cantidad,

                    }
                    bopp_Saliente.push(matCant);
                  }
                }
              });
            }
          });
        }
      });

      this.facturaCompraService.srvObtenerListaPorFecha(fecha).subscribe(datos_factura => {
        for (let i = 0; i < datos_factura.length; i++) {
          this.facturaCompraMPService.srvObtenerListaPorFacId(datos_factura[i].facco_Id).subscribe(datos_facturaMP => {
            console.log(datos_facturaMP)
            for (let j = 0; j < datos_facturaMP.length; j++) {
              this.materiaPrimaService.srvObtenerListaPorId(datos_facturaMP[j].matPri_Id).subscribe(datos_materiaPrima => {
                if (datos_materiaPrima.catMP_Id == categoria) {
                  const matCant : any = {
                    materiaPrima : datos_materiaPrima.matPri_Id,
                    cantidad : datos_facturaMP[j].faccoMatPri_Cantidad,
                  }
                  materia_cantidad_factura.push(matCant);
                }
              });
            }
          });
        }
      });

      this.remisionService.srvObtenerListaPorFecha(fecha).subscribe(datos_remisiones => {
        for (let i = 0; i < datos_remisiones.length; i++) {
          this.remisionMpService.srvObtenerListaPorRemId(datos_remisiones[i].rem_Id).subscribe(datos_remisionMP => {
            for (let j = 0; j < datos_remisionMP.length; j++) {
              this.materiaPrimaService.srvObtenerListaPorId(datos_remisionMP[j].matPri_Id).subscribe(datos_materiaPrima => {
                if (datos_materiaPrima.catMP_Id == categoria) {
                  const matCant : any = {
                    materiaPrima : datos_materiaPrima.matPri_Id,
                    cantidad : datos_remisionMP[j].remiMatPri_Cantidad,
                  }
                  materia_cantidad_remision.push(matCant);
                }
              });
            }
          });
        }
      });

      this.recuperadoService.srvObtenerListaPorFecha(fecha).subscribe(datos_recuperado => {
        for (let i = 0; i < datos_recuperado.length; i++) {
          this.recuperadoMPService.srvObtenerListaPorRecuperadoId(datos_recuperado[i].recMp_Id).subscribe(datos_recuperadoMP => {
            for (let j = 0; j < datos_recuperadoMP.length; j++) {
              this.materiaPrimaService.srvObtenerListaPorId(datos_recuperadoMP[j].matPri_Id).subscribe(datos_materiaPrima => {
                if (datos_materiaPrima.catMP_Id == categoria) {
                  const matCant : any = {
                    materiaPrima : datos_materiaPrima.matPri_Id,
                    cantidad : datos_recuperadoMP[j].recMatPri_Cantidad,
                  }
                  materia_cantidad_recuperado.push(matCant);
                }
              });
            }
          });
        }
      });

      this.devolucionesService.srvObtenerListaPorfecha(fecha).subscribe(datos_devoluciones => {
        for (let i = 0; i < datos_devoluciones.length; i++) {
          this.detallesDevolucionesService.srvObtenerListaPorDevId(datos_devoluciones[i].devMatPri_Id).subscribe(datos_detallesDevoluciones => {
            for (let j = 0; j < datos_detallesDevoluciones.length; j++) {
              this.materiaPrimaService.srvObtenerListaPorId(datos_detallesDevoluciones[j].matPri_Id).subscribe(datos_materiaPrima => {
                const matCant : any = {
                  materiaPrima : datos_materiaPrima.matPri_Id,
                  cantidad : datos_detallesDevoluciones[j].dtDevMatPri_CantidadDevuelta,
                }
                materia_cantidad_devoluciones.push(matCant);
              });
            }
          });
        }
      });

      this.detallesEntTintas.srvObtenerListaPorFecha(fecha).subscribe(datos_entradaTinta => {
        for (let i = 0; i < datos_entradaTinta.length; i++) {
          this.tintasService.srvObtenerListaPorId(datos_entradaTinta[i].tinta_Id).subscribe(datos_tintas => {
            let tintaCant : any = {
              materiaPrima : datos_entradaTinta[i].tinta_Id,
              categoria : datos_tintas.catMP_Id,
              cantidad : datos_entradaTinta[i].dtEntTinta_Cantidad,
            }
            materia_cantidad_tintas_Entrada.push(tintaCant);
          });
        }
      });

      setTimeout(() => {
        if (this.ValidarRol == 1 || this.ValidarRol == 3){
          this.materiaPrimaService.srvObtenerListaPorCategoria(categoria).subscribe(datos_materiaPrima => {
            for (let index = 0; index < datos_materiaPrima.length; index++) {
              if (datos_materiaPrima[index].catMP_Id == categoria) {
                this.categoriMpService.srvObtenerListaPorId(datos_materiaPrima[index].catMP_Id).subscribe(datos_categoria => {
                  this.inventInicialDiaService.srvObtenerListaPorId(datos_materiaPrima[index].matPri_Id).subscribe(datos_inventarioInicial => {
                    this.sumaSalida = 0;
                    this.sumaEntrada = 0;
                    this.inventInicial = 0;
                    this.inventInicial = datos_inventarioInicial.invInicial_Stock;
                    // Asignaciones
                    for (const item of materia_cantidad) {
                      if (datos_materiaPrima[index].matPri_Id == item.materiaPrima && item.categoria != 7) {
                        this.sumaSalida = this.sumaSalida + item.cantidad;
                        // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaSalida} de salida el dia ${fecha}`)
                      }
                    }
                    // Facturas
                    for (const item of materia_cantidad_factura) {
                      if (datos_materiaPrima[index].matPri_Id == item.materiaPrima) {
                        this.sumaEntrada = this.sumaEntrada + item.cantidad;
                        // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaEntrada} de salida el dia ${fecha} FACTURA`)
                      }
                    }
                    // Remisiones
                    for (const item of materia_cantidad_remision) {
                      if (datos_materiaPrima[index].matPri_Id == item.materiaPrima) {
                        this.sumaEntrada = this.sumaEntrada + item.cantidad;
                        // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaEntrada} de salida el dia ${fecha} REMISION`)
                      }
                    }

                    // Recuperado
                    for (const item of materia_cantidad_recuperado) {
                      if (datos_materiaPrima[index].matPri_Id == item.materiaPrima) {
                        this.sumaEntrada = this.sumaEntrada + item.cantidad;
                        // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaEntrada} de salida el dia ${fecha} REMISION`)
                      }
                    }

                    // Devoluciones
                    for (const item of materia_cantidad_devoluciones) {
                      if (datos_materiaPrima[index].matPri_Id == item.materiaPrima) {
                        this.sumaEntrada = this.sumaEntrada + item.cantidad;
                        this.sumaSalida = this.sumaSalida - item.cantidad;
                      }
                    }

                    this.inventInicial = 0;
                    this.inventInicial = datos_inventarioInicial.invInicial_Stock;

                    this.cargarFormMpEnTablas(this.ArrayMateriaPrima,
                      datos_materiaPrima[index].matPri_Id,
                      datos_materiaPrima[index].matPri_Nombre,
                      datos_materiaPrima[index].matPri_Precio,
                      this.inventInicial,
                      this.sumaEntrada,
                      this.sumaSalida,
                      datos_materiaPrima[index].matPri_Stock,
                      datos_materiaPrima[index].undMed_Id,
                      datos_categoria.catMP_Nombre);
                  });
                });
              }
            }
          });

          this.tintasService.srvObtenerLista().subscribe(datos_tintas => {
            for (let i = 0; i < datos_tintas.length; i++) {
              if (datos_tintas[i].catMP_Id == categoria) {
                this.categoriMpService.srvObtenerListaPorId(datos_tintas[i].catMP_Id).subscribe(datos_categoria => {
                  this.sumaSalida = 0;
                    this.sumaEntrada = 0;
                    this.inventInicial = 0;
                    this.inventInicial = 0;
                    // Entradas
                    for (const item of materia_cantidad_tintas_Entrada) {
                      if (datos_tintas[i].tinta_Id == item.materiaPrima && item.categoria == 7) {
                        this.sumaEntrada = this.sumaEntrada + item.cantidad;
                      }
                    }

                    // Asignaciones
                    for (const item of materia_cantidad_tintas) {
                      if (datos_tintas[i].tinta_Id == item.materiaPrima && item.categoria == 7) {
                        this.sumaEntrada = this.sumaEntrada + item.cantidad;
                      }
                    }

                    this.inventInicial = 0;
                    this.inventInicial = 0;

                    this.cargarFormMpEnTablas(this.ArrayMateriaPrima,
                      datos_tintas[i].tinta_Id,
                      datos_tintas[i].tinta_Nombre,
                      datos_tintas[i].tinta_Precio,
                      datos_tintas[i].tinta_InvInicial,
                      this.sumaEntrada,
                      this.sumaSalida,
                      datos_tintas[i].tinta_Stock,
                      datos_tintas[i].undMed_Id,
                      datos_categoria.catMP_Nombre);
                });
              }
            }
          });
        }

        if (this.ValidarRol == 1 || this.ValidarRol == 4){
          this.boppService.srvObtenerLista().subscribe(datos_bopp => {
            for (let i = 0; i < datos_bopp.length; i++) {
              if (datos_bopp[i].catMP_Id == categoria) {
                this.categoriaBOPP = 'BOPP';
                this.categoriMpService.srvObtenerListaPorId(datos_bopp[i].catMP_Id).subscribe(datos_categoria => {
                  this.sumaSalida = 0;
                  this.sumaEntrada = 0;
                  this.inventInicial = 0;
                  for (const item of bopp_Saliente) {
                    if (datos_bopp[i].bopP_Id == item.materiaPrima && datos_categoria.catMP_Id == categoria) {
                      this.sumaSalida = this.sumaSalida + item.cantidad;
                    }
                  }

                  for (const item of bopp_entrante) {
                    if (datos_bopp[i].bopP_Id == item.materiaPrima && datos_categoria.catMP_Id == categoria) {
                      this.sumaEntrada = this.sumaEntrada + item.cantidad;
                    }
                  }

                  this.inventInicial = 0;
                  this.cargarFormMpEnTablas(this.ArrayMateriaPrima,
                    datos_bopp[i].bopP_Serial,
                    datos_bopp[i].bopP_Descripcion,
                    datos_bopp[i].bopP_Precio,
                    datos_bopp[i].bopP_CantidadInicialKg,
                    this.sumaEntrada,
                    this.sumaSalida,
                    datos_bopp[i].bopP_Stock,
                    "Kg",
                    datos_categoria.catMP_Nombre,
                    datos_bopp[i].bopP_Ancho);
                });
              }
            }
          });
        }
      }, 2000);
    } else if (fecha != null) {
      this.load = false;

      // Asignacion de Materia Prima y Tintas
      this.asignacionService.srvObtenerListaPorFecha(fecha).subscribe(datos_asignaciones => {
        for (let i = 0; i < datos_asignaciones.length; i++) {
          this.asignacionMpService.srvObtenerListaPorAsigId(datos_asignaciones[i].asigMp_Id).subscribe(datos_asignacionesMP => {
            for (let j = 0; j < datos_asignacionesMP.length; j++) {
              this.materiaPrimaService.srvObtenerListaPorId(datos_asignacionesMP[j].matPri_Id).subscribe(datos_materiaPrima => {
                const matCant : any = {
                  materiaPrima : datos_materiaPrima.matPri_Id,
                  cantidad : datos_asignacionesMP[j].dtAsigMp_Cantidad,
                }
                materia_cantidad.push(matCant);
              });
            }
          });
        }
      });

      // Entrada de Materia Prima
      this.facturaCompraService.srvObtenerListaPorFecha(fecha).subscribe(datos_factura => {
        for (let i = 0; i < datos_factura.length; i++) {
          this.facturaCompraMPService.srvObtenerListaPorFacId(datos_factura[i].facco_Id).subscribe(datos_facturaMP => {
            console.log(datos_facturaMP)
            for (let j = 0; j < datos_facturaMP.length; j++) {
              this.materiaPrimaService.srvObtenerListaPorId(datos_facturaMP[j].matPri_Id).subscribe(datos_materiaPrima => {
                const matCant : any = {
                  materiaPrima : datos_materiaPrima.matPri_Id,
                  cantidad : datos_facturaMP[j].faccoMatPri_Cantidad,
                }
                materia_cantidad_factura.push(matCant);
              });
            }
          });
        }
      });

      // Entrada de Materia Prima
      this.remisionService.srvObtenerListaPorFecha(fecha).subscribe(datos_remisiones => {
        for (let i = 0; i < datos_remisiones.length; i++) {
          this.remisionMpService.srvObtenerListaPorRemId(datos_remisiones[i].rem_Id).subscribe(datos_remisionMP => {
            for (let j = 0; j < datos_remisionMP.length; j++) {
              this.materiaPrimaService.srvObtenerListaPorId(datos_remisionMP[j].matPri_Id).subscribe(datos_materiaPrima => {
                const matCant : any = {
                  materiaPrima : datos_materiaPrima.matPri_Id,
                  cantidad : datos_remisionMP[j].remiMatPri_Cantidad,
                }
                materia_cantidad_remision.push(matCant);
              });
            }
          });
        }
      });

      // Entrada de Materia Prima Recuperada
      this.recuperadoService.srvObtenerListaPorFecha(fecha).subscribe(datos_recuperado => {
        for (let i = 0; i < datos_recuperado.length; i++) {
          this.recuperadoMPService.srvObtenerListaPorRecuperadoId(datos_recuperado[i].recMp_Id).subscribe(datos_recuperadoMP => {
            for (let j = 0; j < datos_recuperadoMP.length; j++) {
              this.materiaPrimaService.srvObtenerListaPorId(datos_recuperadoMP[j].matPri_Id).subscribe(datos_materiaPrima => {
                const matCant : any = {
                  materiaPrima : datos_materiaPrima.matPri_Id,
                  cantidad : datos_recuperadoMP[j].recMatPri_Cantidad,
                }
                materia_cantidad_recuperado.push(matCant);

              });
            }
          });
        }
      });

      // Entrada de Materia Prima Devuelta
      this.devolucionesService.srvObtenerListaPorfecha(fecha).subscribe(datos_devoluciones => {
        for (let i = 0; i < datos_devoluciones.length; i++) {
          this.detallesDevolucionesService.srvObtenerListaPorDevId(datos_devoluciones[i].devMatPri_Id).subscribe(datos_detallesDevoluciones => {
            for (let j = 0; j < datos_detallesDevoluciones.length; j++) {
              this.materiaPrimaService.srvObtenerListaPorId(datos_detallesDevoluciones[j].matPri_Id).subscribe(datos_materiaPrima => {
                const matCant : any = {
                  materiaPrima : datos_materiaPrima.matPri_Id,
                  cantidad : datos_detallesDevoluciones[j].dtDevMatPri_CantidadDevuelta,
                }
                materia_cantidad_devoluciones.push(matCant);
              });
            }
          });
        }
      });

      // Entrada de Tintas
      this.detallesEntTintas.srvObtenerListaPorFecha(fecha).subscribe(datos_entradaTinta => {
        for (let i = 0; i < datos_entradaTinta.length; i++) {
          this.tintasService.srvObtenerListaPorId(datos_entradaTinta[i].tinta_Id).subscribe(datos_tintas => {
            let tintaCant : any = {
              materiaPrima : datos_entradaTinta[i].tinta_Id,
              categoria : datos_tintas.catMP_Id,
              cantidad : datos_entradaTinta[i].dtEntTinta_Cantidad,
            }
            materia_cantidad_tintas_Entrada.push(tintaCant);
          });
        }
      });

      setTimeout(() => {
        if (this.ValidarRol == 1 || this.ValidarRol == 3){
          this.materiaPrimaService.srvObtenerLista().subscribe(datos_materiaPrima => {
            for (let index = 0; index < datos_materiaPrima.length; index++) {
              this.categoriMpService.srvObtenerListaPorId(datos_materiaPrima[index].catMP_Id).subscribe(datos_categoria => {
                this.inventInicialDiaService.srvObtenerListaPorId(datos_materiaPrima[index].matPri_Id).subscribe(datos_inventarioInicial => {
                  this.sumaSalida = 0;
                  this.sumaEntrada = 0;
                  this.inventInicial = 0;
                  this.inventInicial = datos_inventarioInicial.invInicial_Stock;
                  // Asignaciones
                  for (const item of materia_cantidad) {
                    if (datos_materiaPrima[index].matPri_Id == item.materiaPrima) {
                      this.sumaSalida = this.sumaSalida + item.cantidad;
                      // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaSalida} de salida el dia ${fecha}`)
                    }
                  }
                  // Facturas
                  for (const item of materia_cantidad_factura) {
                    if (datos_materiaPrima[index].matPri_Id == item.materiaPrima) {
                      this.sumaEntrada = this.sumaEntrada + item.cantidad;
                      // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaEntrada} de salida el dia ${fecha} FACTURA`)
                    }
                  }
                  // Remisiones
                  for (const item of materia_cantidad_remision) {
                    if (datos_materiaPrima[index].matPri_Id == item.materiaPrima) {
                      this.sumaEntrada = this.sumaEntrada + item.cantidad;
                      // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaEntrada} de salida el dia ${fecha} REMISION`)
                    }
                  }

                  // Recuperado
                  for (const item of materia_cantidad_recuperado) {
                    if (datos_materiaPrima[index].matPri_Id == item.materiaPrima) {
                      this.sumaEntrada = this.sumaEntrada + item.cantidad;
                      // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaEntrada} de salida el dia ${fecha} REMISION`)
                    }
                  }

                  for (const item of materia_cantidad_devoluciones) {
                    if (datos_materiaPrima[index].matPri_Id == item.materiaPrima) {
                      this.sumaEntrada = this.sumaEntrada + item.cantidad;
                      this.sumaSalida = this.sumaSalida - item.cantidad;
                    }
                  }

                  this.cargarFormMpEnTablas(this.ArrayMateriaPrima,
                    datos_materiaPrima[index].matPri_Id,
                    datos_materiaPrima[index].matPri_Nombre,
                    datos_materiaPrima[index].matPri_Precio,
                    this.inventInicial,
                    this.sumaEntrada,
                    this.sumaSalida,
                    datos_materiaPrima[index].matPri_Stock,
                    datos_materiaPrima[index].undMed_Id,
                    datos_categoria.catMP_Nombre);
                });
              });
            }
          });

          this.tintasService.srvObtenerLista().subscribe(datos_tintas => {
            for (let i = 0; i < datos_tintas.length; i++) {
              if (datos_tintas[i].catMP_Id == categoria) {
                this.categoriMpService.srvObtenerListaPorId(datos_tintas[i].catMP_Id).subscribe(datos_categoria => {
                  this.sumaSalida = 0;
                    this.sumaEntrada = 0;
                    this.inventInicial = 0;
                    this.inventInicial = 0;
                    // Entradas
                    for (const item of materia_cantidad_tintas_Entrada) {
                      if (datos_tintas[i].tinta_Id == item.materiaPrima && item.categoria == 7) {
                        this.sumaEntrada = this.sumaEntrada + item.cantidad;
                      }
                    }

                    // Asignaciones
                    for (const item of materia_cantidad_tintas) {
                      if (datos_tintas[i].tinta_Id == item.materiaPrima && item.categoria == 7) {
                        this.sumaEntrada = this.sumaEntrada + item.cantidad;
                      }
                    }

                    this.inventInicial = 0;
                    this.inventInicial = 0;

                    this.cargarFormMpEnTablas(this.ArrayMateriaPrima,
                      datos_tintas[i].tinta_Id,
                      datos_tintas[i].tinta_Nombre,
                      datos_tintas[i].tinta_Precio,
                      datos_tintas[i].tinta_InvInicial,
                      this.sumaEntrada,
                      this.sumaSalida,
                      datos_tintas[i].tinta_Stock,
                      datos_tintas[i].undMed_Id,
                      datos_categoria.catMP_Nombre);
                });
              }
            }
          });
        }
      }, 2000);
    } else if (categoria != null)  {
      this.load = false;

      this.asignacionService.srvObtenerListaPorFecha(this.today).subscribe(datos_asignaciones => {
        for (let i = 0; i < datos_asignaciones.length; i++) {
          this.asignacionMpService.srvObtenerListaPorAsigId(datos_asignaciones[i].asigMp_Id).subscribe(datos_asignacionesMP => {
            for (let j = 0; j < datos_asignacionesMP.length; j++) {
              this.materiaPrimaService.srvObtenerListaPorId(datos_asignacionesMP[j].matPri_Id).subscribe(datos_materiaPrima => {
                if (datos_materiaPrima.catMP_Id == categoria) {
                  const matCant : any = {
                    materiaPrima : datos_materiaPrima.matPri_Id,
                    cantidad : datos_asignacionesMP[j].dtAsigMp_Cantidad,
                    categoria : datos_materiaPrima.catMP_Id,
                  }
                  materia_cantidad.push(matCant);
                }
              });
            }
          });

          this.asignacionTintasService.srvObtenerListaPor_Asignacion(datos_asignaciones[i].asigMp_Id).subscribe(datos_asignacionTintas => {
            for (let j = 0; j < datos_asignacionTintas.length; j++) {
              this.tintasService.srvObtenerListaPorId(datos_asignacionTintas[j].tinta_Id).subscribe(datos_tintas => {
                if (datos_tintas.catMP_Id == categoria) {
                  const matCant : any = {
                    materiaPrima : datos_tintas.tinta_Id,
                    cantidad : datos_asignacionTintas[j].dtAsigTinta_Cantidad,
                    categoria : datos_tintas.catMP_Id,
                  }
                  materia_cantidad.push(matCant);
                }
              });
            }
          });
        }
      });

      this.facturaCompraService.srvObtenerListaPorFecha(this.today).subscribe(datos_factura => {
        for (let i = 0; i < datos_factura.length; i++) {
          this.facturaCompraMPService.srvObtenerListaPorFacId(datos_factura[i].facco_Id).subscribe(datos_facturaMP => {
            console.log(datos_facturaMP)
            for (let j = 0; j < datos_facturaMP.length; j++) {
              this.materiaPrimaService.srvObtenerListaPorId(datos_facturaMP[j].matPri_Id).subscribe(datos_materiaPrima => {
                if (datos_materiaPrima.catMP_Id == categoria) {
                  const matCant : any = {
                    materiaPrima : datos_materiaPrima.matPri_Id,
                    cantidad : datos_facturaMP[j].faccoMatPri_Cantidad,
                  }
                  materia_cantidad_factura.push(matCant);
                }
              });
            }
          });
        }
      });

      this.remisionService.srvObtenerListaPorFecha(this.today).subscribe(datos_remisiones => {
        for (let i = 0; i < datos_remisiones.length; i++) {
          this.remisionMpService.srvObtenerListaPorRemId(datos_remisiones[i].rem_Id).subscribe(datos_remisionMP => {
            for (let j = 0; j < datos_remisionMP.length; j++) {
              this.materiaPrimaService.srvObtenerListaPorId(datos_remisionMP[j].matPri_Id).subscribe(datos_materiaPrima => {
                if (datos_materiaPrima.catMP_Id == categoria) {
                  const matCant : any = {
                    materiaPrima : datos_materiaPrima.matPri_Id,
                    cantidad : datos_remisionMP[j].remiMatPri_Cantidad,
                  }
                  materia_cantidad_remision.push(matCant);
                }
              });
            }
          });
        }
      });

      this.recuperadoService.srvObtenerListaPorFecha(this.today).subscribe(datos_recuperado => {
        for (let i = 0; i < datos_recuperado.length; i++) {
          this.recuperadoMPService.srvObtenerListaPorRecuperadoId(datos_recuperado[i].recMp_Id).subscribe(datos_recuperadoMP => {
            for (let j = 0; j < datos_recuperadoMP.length; j++) {
              this.materiaPrimaService.srvObtenerListaPorId(datos_recuperadoMP[j].matPri_Id).subscribe(datos_materiaPrima => {
                if (datos_materiaPrima.catMP_Id == categoria) {
                  const matCant : any = {
                    materiaPrima : datos_materiaPrima.matPri_Id,
                    cantidad : datos_recuperadoMP[j].recMatPri_Cantidad,
                  }
                  materia_cantidad_recuperado.push(matCant);
                }
              });
            }
          });
        }
      });

      this.devolucionesService.srvObtenerListaPorfecha(this.today).subscribe(datos_devoluciones => {
        for (let i = 0; i < datos_devoluciones.length; i++) {
          this.detallesDevolucionesService.srvObtenerListaPorDevId(datos_devoluciones[i].devMatPri_Id).subscribe(datos_detallesDevoluciones => {
            for (let j = 0; j < datos_detallesDevoluciones.length; j++) {
              this.materiaPrimaService.srvObtenerListaPorId(datos_detallesDevoluciones[j].matPri_Id).subscribe(datos_materiaPrima => {
                const matCant : any = {
                  materiaPrima : datos_materiaPrima.matPri_Id,
                  cantidad : datos_detallesDevoluciones[j].dtDevMatPri_CantidadDevuelta,
                }
                materia_cantidad_devoluciones.push(matCant);
              });
            }
          });
        }
      });

      this.boppService.srvObtenerListaPorFecha(this.today).subscribe(datos_bopp => {
        for (let i = 0; i < datos_bopp.length; i++) {
          if (datos_bopp[i].catMP_Id == categoria) {
            const matCant : any = {
              materiaPrima : datos_bopp[i].bopP_Id,
              cantidad : datos_bopp[i].bopP_CantidadInicialKg,
            }
            bopp_entrante.push(matCant);
          }
        }
      });

      this.asignacionBOPPService.srvObtenerListaPorfecha(this.today).subscribe(datos_asignacionBopp => {
        for (let i = 0; i < datos_asignacionBopp.length; i++) {
          this.detallesAsignacionBOPPService.srvObtenerListaPorAsignacion(datos_asignacionBopp[i].asigBOPP_Id).subscribe(datos_detallesAsgBopp => {
            for (let j = 0; j < datos_detallesAsgBopp.length; j++) {
              this.boppService.srvObtenerListaPorId(datos_detallesAsgBopp[j].bopP_Id).subscribe(datos_bopp => {
                let bopp : any = [];
                bopp.push(datos_bopp);
                for (const item of bopp) {
                  if (item.catMP_Id == categoria) {
                    const matCant : any = {
                      materiaPrima : item.bopP_Id,
                      cantidad : datos_detallesAsgBopp[j].dtAsigBOPP_Cantidad,
                    }
                    bopp_Saliente.push(matCant);
                  }
                }
              });
            }
          });
        }
      });

      this.detallesEntTintas.srvObtenerListaPorFecha(this.today).subscribe(datos_entradaTinta => {
        for (let i = 0; i < datos_entradaTinta.length; i++) {
          this.tintasService.srvObtenerListaPorId(datos_entradaTinta[i].tinta_Id).subscribe(datos_tintas => {
            let tintaCant : any = {
              materiaPrima : datos_entradaTinta[i].tinta_Id,
              categoria : datos_tintas.catMP_Id,
              cantidad : datos_entradaTinta[i].dtEntTinta_Cantidad,
            }
            materia_cantidad_tintas_Entrada.push(tintaCant);
          });
        }
      });

      setTimeout(() => {
        if (this.ValidarRol == 1 || this.ValidarRol == 3) {
          this.materiaPrimaService.srvObtenerListaPorCategoria(categoria).subscribe(datos_materiaPrima => {
            if (datos_materiaPrima.length == 0) this.load = true;
            else {
              for (let index = 0; index < datos_materiaPrima.length; index++) {
                if (datos_materiaPrima[index].catMP_Id == categoria) {
                  this.categoriMpService.srvObtenerListaPorId(datos_materiaPrima[index].catMP_Id).subscribe(datos_categoria => {
                    this.inventInicialDiaService.srvObtenerListaPorId(datos_materiaPrima[index].matPri_Id).subscribe(datos_inventarioInicial => {
                      this.sumaSalida = 0;
                      this.sumaEntrada = 0;
                      this.inventInicial = 0;
                      this.inventInicial = datos_inventarioInicial.invInicial_Stock;
                      // Asignaciones
                      for (const item of materia_cantidad) {
                        if (datos_materiaPrima[index].matPri_Id == item.materiaPrima && item.categoria != 7) {
                          this.sumaSalida = this.sumaSalida + item.cantidad;
                          // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaSalida} de salida el dia ${fecha}`)
                        }
                      }
                      // Facturas
                      for (const item of materia_cantidad_factura) {
                        if (datos_materiaPrima[index].matPri_Id == item.materiaPrima) {
                          this.sumaEntrada = this.sumaEntrada + item.cantidad;
                          // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaEntrada} de salida el dia ${fecha} FACTURA`)
                        }
                      }
                      // Remisiones
                      for (const item of materia_cantidad_remision) {
                        if (datos_materiaPrima[index].matPri_Id == item.materiaPrima) {
                          this.sumaEntrada = this.sumaEntrada + item.cantidad;
                          // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaEntrada} de salida el dia ${fecha} REMISION`)
                        }
                      }

                      // Recuperado
                      for (const item of materia_cantidad_recuperado) {
                        if (datos_materiaPrima[index].matPri_Id == item.materiaPrima) {
                          this.sumaEntrada = this.sumaEntrada + item.cantidad;
                          // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaEntrada} de salida el dia ${fecha} REMISION`)
                        }
                      }

                      // Devoluciones
                      for (const item of materia_cantidad_devoluciones) {
                        if (datos_materiaPrima[index].matPri_Id == item.materiaPrima) {
                          this.sumaEntrada = this.sumaEntrada + item.cantidad;
                          this.sumaSalida = this.sumaSalida - item.cantidad;
                        }
                      }

                      this.inventInicial = 0;
                      this.inventInicial = datos_inventarioInicial.invInicial_Stock;

                      this.cargarFormMpEnTablas(this.ArrayMateriaPrima,
                        datos_materiaPrima[index].matPri_Id,
                        datos_materiaPrima[index].matPri_Nombre,
                        datos_materiaPrima[index].matPri_Precio,
                        this.inventInicial,
                        this.sumaEntrada,
                        this.sumaSalida,
                        datos_materiaPrima[index].matPri_Stock,
                        datos_materiaPrima[index].undMed_Id,
                        datos_categoria.catMP_Nombre);
                    });
                  });
                }
              }
            }
          });

          this.tintasService.srvObtenerLista().subscribe(datos_tintas => {
            for (let i = 0; i < datos_tintas.length; i++) {
              if (datos_tintas[i].catMP_Id == categoria) {
                this.categoriMpService.srvObtenerListaPorId(datos_tintas[i].catMP_Id).subscribe(datos_categoria => {
                  this.sumaSalida = 0;
                    this.sumaEntrada = 0;
                    this.inventInicial = 0;
                    this.inventInicial = 0;
                    // Entradas
                    for (const item of materia_cantidad_tintas_Entrada) {
                      if (datos_tintas[i].tinta_Id == item.materiaPrima && item.categoria == 7) {
                        this.sumaEntrada = this.sumaEntrada + item.cantidad;
                      }
                    }

                    // Asignaciones
                    for (const item of materia_cantidad_tintas) {
                      if (datos_tintas[i].tinta_Id == item.materiaPrima && item.categoria == 7) {
                        this.sumaEntrada = this.sumaEntrada + item.cantidad;
                      }
                    }

                    this.inventInicial = 0;
                    this.inventInicial = 0;

                    this.cargarFormMpEnTablas(this.ArrayMateriaPrima,
                      datos_tintas[i].tinta_Id,
                      datos_tintas[i].tinta_Nombre,
                      datos_tintas[i].tinta_Precio,
                      datos_tintas[i].tinta_InvInicial,
                      this.sumaEntrada,
                      this.sumaSalida,
                      datos_tintas[i].tinta_Stock,
                      datos_tintas[i].undMed_Id,
                      datos_categoria.catMP_Nombre);
                });
              }
            }
          });
        }

        if (this.ValidarRol == 1 || this.ValidarRol == 4){
          this.boppService.srvObtenerLista().subscribe(datos_bopp => {
            for (let i = 0; i < datos_bopp.length; i++) {
              if (datos_bopp[i].catMP_Id == categoria) {
                this.categoriaBOPP = 'BOPP';
                this.categoriMpService.srvObtenerListaPorId(datos_bopp[i].catMP_Id).subscribe(datos_categoria => {
                  this.sumaSalida = 0;
                  this.sumaEntrada = 0;
                  this.inventInicial = 0;
                  for (const item of bopp_Saliente) {
                    if (datos_bopp[i].bopP_Id == item.materiaPrima && datos_categoria.catMP_Id == categoria) {
                      this.sumaSalida = this.sumaSalida + item.cantidad;
                    }
                  }

                  for (const item of bopp_entrante) {
                    if (datos_bopp[i].bopP_Id == item.materiaPrima && datos_categoria.catMP_Id == categoria) {
                      this.sumaEntrada = this.sumaEntrada + item.cantidad;
                    }
                  }

                  this.inventInicial = 0;

                  this.cargarFormMpEnTablas(this.ArrayMateriaPrima,
                    datos_bopp[i].bopP_Serial,
                    datos_bopp[i].bopP_Descripcion, /** Descripcion en vez de nombre */
                    datos_bopp[i].bopP_Precio,
                    datos_bopp[i].bopP_CantidadInicialKg,
                    this.sumaEntrada,
                    this.sumaSalida,
                    datos_bopp[i].bopP_Stock,
                    "Kg",
                    datos_categoria.catMP_Nombre,
                    datos_bopp[i].bopP_Ancho);
                });
              }
            }
          });
        }

      }, 2000);
    } else if (bodega != null) {
      this.load = false;
      if (bodega == 1) {
        // Mostrará todas las categorias a excepcion de las Tintas, Aditivos, Solventes y BOPP.
        this.asignacionService.srvObtenerListaPorFecha(this.today).subscribe(datos_asignaciones => {
          for (let i = 0; i < datos_asignaciones.length; i++) {
            this.asignacionMpService.srvObtenerListaPorAsigId(datos_asignaciones[i].asigMp_Id).subscribe(datos_asignacionesMP => {
              for (let j = 0; j < datos_asignacionesMP.length; j++) {
                this.materiaPrimaService.srvObtenerListaPorId(datos_asignacionesMP[j].matPri_Id).subscribe(datos_materiaPrima => {
                  const matCant : any = {
                    materiaPrima : datos_materiaPrima.matPri_Id,
                    cantidad : datos_asignacionesMP[j].dtAsigMp_Cantidad,
                    categoria : datos_materiaPrima.catMP_Id,
                  }
                  materia_cantidad.push(matCant);
                });
              }
            });
          }
        });

        this.facturaCompraService.srvObtenerListaPorFecha(this.today).subscribe(datos_factura => {
          for (let i = 0; i < datos_factura.length; i++) {
            this.facturaCompraMPService.srvObtenerListaPorFacId(datos_factura[i].facco_Id).subscribe(datos_facturaMP => {
              for (let j = 0; j < datos_facturaMP.length; j++) {
                this.materiaPrimaService.srvObtenerListaPorId(datos_facturaMP[j].matPri_Id).subscribe(datos_materiaPrima => {
                  const matCant : any = {
                    materiaPrima : datos_materiaPrima.matPri_Id,
                    cantidad : datos_facturaMP[j].faccoMatPri_Cantidad,
                  }
                  materia_cantidad_factura.push(matCant);
                });
              }
            });
          }
        });

        this.remisionService.srvObtenerListaPorFecha(this.today).subscribe(datos_remisiones => {
          for (let i = 0; i < datos_remisiones.length; i++) {
            this.remisionMpService.srvObtenerListaPorRemId(datos_remisiones[i].rem_Id).subscribe(datos_remisionMP => {
              for (let j = 0; j < datos_remisionMP.length; j++) {
                this.materiaPrimaService.srvObtenerListaPorId(datos_remisionMP[j].matPri_Id).subscribe(datos_materiaPrima => {
                  const matCant : any = {
                    materiaPrima : datos_materiaPrima.matPri_Id,
                    cantidad : datos_remisionMP[j].remiMatPri_Cantidad,
                  }
                  materia_cantidad_remision.push(matCant);
                });
              }
            });
          }
        });

        this.recuperadoService.srvObtenerListaPorFecha(this.today).subscribe(datos_recuperado => {
          for (let i = 0; i < datos_recuperado.length; i++) {
            this.recuperadoMPService.srvObtenerListaPorRecuperadoId(datos_recuperado[i].recMp_Id).subscribe(datos_recuperadoMP => {
              for (let j = 0; j < datos_recuperadoMP.length; j++) {
                this.materiaPrimaService.srvObtenerListaPorId(datos_recuperadoMP[j].matPri_Id).subscribe(datos_materiaPrima => {
                  const matCant : any = {
                    materiaPrima : datos_materiaPrima.matPri_Id,
                    cantidad : datos_recuperadoMP[j].recMatPri_Cantidad,
                  }
                  materia_cantidad_recuperado.push(matCant);

                });
              }
            });
          }
        });

        this.devolucionesService.srvObtenerListaPorfecha(this.today).subscribe(datos_devoluciones => {
          for (let i = 0; i < datos_devoluciones.length; i++) {
            this.detallesDevolucionesService.srvObtenerListaPorDevId(datos_devoluciones[i].devMatPri_Id).subscribe(datos_detallesDevoluciones => {
              for (let j = 0; j < datos_detallesDevoluciones.length; j++) {
                this.materiaPrimaService.srvObtenerListaPorId(datos_detallesDevoluciones[j].matPri_Id).subscribe(datos_materiaPrima => {
                  const matCant : any = {
                    materiaPrima : datos_materiaPrima.matPri_Id,
                    cantidad : datos_detallesDevoluciones[j].dtDevMatPri_CantidadDevuelta,
                  }
                  materia_cantidad_devoluciones.push(matCant);
                });
              }
            });
          }
        });

        setTimeout(() => {
          this.materiaPrimaService.srvObtenerLista().subscribe(datos_materiaPrima => {
            console.log(datos_materiaPrima)
            for (let index = 0; index < datos_materiaPrima.length; index++) {
              let categoriaMP : number = datos_materiaPrima[index].catMP_Id;
              if (categoriaMP != 8 && categoriaMP != 7 && categoriaMP != 6 && categoriaMP != 5) {
                this.categoriMpService.srvObtenerListaPorId(datos_materiaPrima[index].catMP_Id).subscribe(datos_categoria => {
                  this.inventInicialDiaService.srvObtenerListaPorId(datos_materiaPrima[index].matPri_Id).subscribe(datos_inventarioInicial => {
                    this.sumaSalida = 0;
                    this.sumaEntrada = 0;
                    this.inventInicial = 0;
                    this.inventInicial = datos_inventarioInicial.invInicial_Stock;
                    // Asignaciones
                    for (const item of materia_cantidad) {
                      if (datos_materiaPrima[index].matPri_Id == item.materiaPrima && item.categoria != 7) {
                        this.sumaSalida = this.sumaSalida + item.cantidad;
                        // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaSalida} de salida el dia ${fecha}`)
                      }
                    }
                    // Facturas
                    for (const item of materia_cantidad_factura) {
                      if (datos_materiaPrima[index].matPri_Id == item.materiaPrima && item.categoria != 7) {
                        this.sumaEntrada = this.sumaEntrada + item.cantidad;
                        // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaEntrada} de salida el dia ${fecha} FACTURA`)
                      }
                    }
                    // Remisiones
                    for (const item of materia_cantidad_remision) {
                      if (datos_materiaPrima[index].matPri_Id == item.materiaPrima && item.categoria != 7) {
                        this.sumaEntrada = this.sumaEntrada + item.cantidad;
                        // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaEntrada} de salida el dia ${fecha} REMISION`)
                      }
                    }

                    // Recuperado
                    for (const item of materia_cantidad_recuperado) {
                      if (datos_materiaPrima[index].matPri_Id == item.materiaPrima && item.categoria != 7) {
                        this.sumaEntrada = this.sumaEntrada + item.cantidad;
                        // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaEntrada} de salida el dia ${fecha} REMISION`)
                      }
                    }

                    for (const item of materia_cantidad_devoluciones) {
                      if (datos_materiaPrima[index].matPri_Id == item.materiaPrima && item.categoria != 7) {
                        this.sumaEntrada = this.sumaEntrada + item.cantidad;
                        this.sumaSalida = this.sumaSalida - item.cantidad;
                      }
                    }

                    this.inventInicial = 0;
                    this.inventInicial = datos_inventarioInicial.invInicial_Stock;

                    this.cargarFormMpEnTablas(this.ArrayMateriaPrima,
                      datos_materiaPrima[index].matPri_Id,
                      datos_materiaPrima[index].matPri_Nombre,
                      datos_materiaPrima[index].matPri_Precio,
                      this.inventInicial,
                      this.sumaEntrada,
                      this.sumaSalida,
                      datos_materiaPrima[index].matPri_Stock,
                      datos_materiaPrima[index].undMed_Id,
                      datos_categoria.catMP_Nombre);
                  });
                });
              }
            }
          });
        }, 2000);
      } else if (bodega == 2) {
        // Mostrará Tintas, Aditivos y Solventes.
        this.asignacionService.srvObtenerListaPorFecha(this.today).subscribe(datos_asignaciones => {
          for (let i = 0; i < datos_asignaciones.length; i++) {
            this.asignacionMpService.srvObtenerListaPorAsigId(datos_asignaciones[i].asigMp_Id).subscribe(datos_asignacionesMP => {
              for (let j = 0; j < datos_asignacionesMP.length; j++) {
                this.materiaPrimaService.srvObtenerListaPorId(datos_asignacionesMP[j].matPri_Id).subscribe(datos_materiaPrima => {
                  const matCant : any = {
                    materiaPrima : datos_materiaPrima.matPri_Id,
                    cantidad : datos_asignacionesMP[j].dtAsigMp_Cantidad,
                    categoria : datos_materiaPrima.catMP_Id,
                  }
                  materia_cantidad.push(matCant);
                });
              }
            });

            this.asignacionTintasService.srvObtenerListaPor_Asignacion(datos_asignaciones[i].asigMp_Id).subscribe(datos_asignacionTintas => {
              for (let j = 0; j < datos_asignacionTintas.length; j++) {
                this.tintasService.srvObtenerListaPorId(datos_asignacionTintas[j].tinta_Id).subscribe(datos_tintas => {
                  const matCant : any = {
                    materiaPrima : datos_tintas.tinta_Id,
                    cantidad : datos_asignacionTintas[j].dtAsigTinta_Cantidad,
                    categoria : datos_tintas.catMP_Id,
                  }
                  materia_cantidad_tintas.push(matCant);
                });
              }
            });
          }
        });

        this.facturaCompraService.srvObtenerListaPorFecha(this.today).subscribe(datos_factura => {
          for (let i = 0; i < datos_factura.length; i++) {
            this.facturaCompraMPService.srvObtenerListaPorFacId(datos_factura[i].facco_Id).subscribe(datos_facturaMP => {
              for (let j = 0; j < datos_facturaMP.length; j++) {
                this.materiaPrimaService.srvObtenerListaPorId(datos_facturaMP[j].matPri_Id).subscribe(datos_materiaPrima => {
                  const matCant : any = {
                    materiaPrima : datos_materiaPrima.matPri_Id,
                    cantidad : datos_facturaMP[j].faccoMatPri_Cantidad,
                  }
                  materia_cantidad_factura.push(matCant);
                });
              }
            });
          }
        });

        this.remisionService.srvObtenerListaPorFecha(this.today).subscribe(datos_remisiones => {
          for (let i = 0; i < datos_remisiones.length; i++) {
            this.remisionMpService.srvObtenerListaPorRemId(datos_remisiones[i].rem_Id).subscribe(datos_remisionMP => {
              for (let j = 0; j < datos_remisionMP.length; j++) {
                this.materiaPrimaService.srvObtenerListaPorId(datos_remisionMP[j].matPri_Id).subscribe(datos_materiaPrima => {
                  const matCant : any = {
                    materiaPrima : datos_materiaPrima.matPri_Id,
                    cantidad : datos_remisionMP[j].remiMatPri_Cantidad,
                  }
                  materia_cantidad_remision.push(matCant);
                });
              }
            });
          }
        });

        this.recuperadoService.srvObtenerListaPorFecha(this.today).subscribe(datos_recuperado => {
          for (let i = 0; i < datos_recuperado.length; i++) {
            this.recuperadoMPService.srvObtenerListaPorRecuperadoId(datos_recuperado[i].recMp_Id).subscribe(datos_recuperadoMP => {
              for (let j = 0; j < datos_recuperadoMP.length; j++) {
                this.materiaPrimaService.srvObtenerListaPorId(datos_recuperadoMP[j].matPri_Id).subscribe(datos_materiaPrima => {
                  const matCant : any = {
                    materiaPrima : datos_materiaPrima.matPri_Id,
                    cantidad : datos_recuperadoMP[j].recMatPri_Cantidad,
                  }
                  materia_cantidad_recuperado.push(matCant);

                });
              }
            });
          }
        });

        this.devolucionesService.srvObtenerListaPorfecha(this.today).subscribe(datos_devoluciones => {
          for (let i = 0; i < datos_devoluciones.length; i++) {
            this.detallesDevolucionesService.srvObtenerListaPorDevId(datos_devoluciones[i].devMatPri_Id).subscribe(datos_detallesDevoluciones => {
              for (let j = 0; j < datos_detallesDevoluciones.length; j++) {
                this.materiaPrimaService.srvObtenerListaPorId(datos_detallesDevoluciones[j].matPri_Id).subscribe(datos_materiaPrima => {
                  const matCant : any = {
                    materiaPrima : datos_materiaPrima.matPri_Id,
                    cantidad : datos_detallesDevoluciones[j].dtDevMatPri_CantidadDevuelta,
                  }
                  materia_cantidad_devoluciones.push(matCant);
                });
              }
            });
          }
        });

        this.detallesEntTintas.srvObtenerListaPorFecha(this.today).subscribe(datos_entradaTinta => {
          for (let i = 0; i < datos_entradaTinta.length; i++) {
            this.tintasService.srvObtenerListaPorId(datos_entradaTinta[i].tinta_Id).subscribe(datos_tintas => {
              let tintaCant : any = {
                materiaPrima : datos_entradaTinta[i].tinta_Id,
                categoria : datos_tintas.catMP_Id,
                cantidad : datos_entradaTinta[i].dtEntTinta_Cantidad,
              }
              materia_cantidad_tintas_Entrada.push(tintaCant);
            });
          }
        });

        setTimeout(() => {
          this.materiaPrimaService.srvObtenerLista().subscribe(datos_materiaPrima => {
            for (let index = 0; index < datos_materiaPrima.length; index++) {
              let categoriaMP : number = datos_materiaPrima[index].catMP_Id;
              if (categoriaMP == 8 || categoriaMP == 7 || categoriaMP == 6 || categoriaMP == 5) {
                this.categoriMpService.srvObtenerListaPorId(datos_materiaPrima[index].catMP_Id).subscribe(datos_categoria => {
                  this.inventInicialDiaService.srvObtenerListaPorId(datos_materiaPrima[index].matPri_Id).subscribe(datos_inventarioInicial => {
                    this.sumaSalida = 0;
                    this.sumaEntrada = 0;
                    this.inventInicial = 0;
                    this.inventInicial = datos_inventarioInicial.invInicial_Stock;
                    // Asignaciones
                    for (const item of materia_cantidad) {
                      if (datos_materiaPrima[index].matPri_Id == item.materiaPrima && item.categoria != 7) {
                        this.sumaSalida = this.sumaSalida + item.cantidad;
                        // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaSalida} de salida el dia ${fecha}`)
                      }
                    }
                    // Facturas
                    for (const item of materia_cantidad_factura) {
                      if (datos_materiaPrima[index].matPri_Id == item.materiaPrima) {
                        this.sumaEntrada = this.sumaEntrada + item.cantidad;
                        // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaEntrada} de salida el dia ${fecha} FACTURA`)
                      }
                    }
                    // Remisiones
                    for (const item of materia_cantidad_remision) {
                      if (datos_materiaPrima[index].matPri_Id == item.materiaPrima) {
                        this.sumaEntrada = this.sumaEntrada + item.cantidad;
                        // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaEntrada} de salida el dia ${fecha} REMISION`)
                      }
                    }

                    // Recuperado
                    for (const item of materia_cantidad_recuperado) {
                      if (datos_materiaPrima[index].matPri_Id == item.materiaPrima) {
                        this.sumaEntrada = this.sumaEntrada + item.cantidad;
                        // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaEntrada} de salida el dia ${fecha} REMISION`)
                      }
                    }

                    for (const item of materia_cantidad_devoluciones) {
                      if (datos_materiaPrima[index].matPri_Id == item.materiaPrima) {
                        this.sumaEntrada = this.sumaEntrada + item.cantidad;
                        this.sumaSalida = this.sumaSalida - item.cantidad;
                      }
                    }

                    this.inventInicial = 0;
                    this.inventInicial = datos_inventarioInicial.invInicial_Stock;

                    this.cargarFormMpEnTablas(this.ArrayMateriaPrima,
                      datos_materiaPrima[index].matPri_Id,
                      datos_materiaPrima[index].matPri_Nombre,
                      datos_materiaPrima[index].matPri_Precio,
                      this.inventInicial,
                      this.sumaEntrada,
                      this.sumaSalida,
                      datos_materiaPrima[index].matPri_Stock,
                      datos_materiaPrima[index].undMed_Id,
                      datos_categoria.catMP_Nombre);
                  });
                });
              } else this.load = true;
            }
          });

          this.tintasService.srvObtenerLista().subscribe(datos_tintas => {
            for (let i = 0; i < datos_tintas.length; i++) {
              this.categoriMpService.srvObtenerListaPorId(datos_tintas[i].catMP_Id).subscribe(datos_categoria => {
                this.sumaSalida = 0;
                this.sumaEntrada = 0;
                this.inventInicial = 0;
                this.inventInicial = 0;
                // Entradas
                for (const item of materia_cantidad_tintas_Entrada) {
                  if (datos_tintas[i].tinta_Id == item.materiaPrima && item.categoria == 7) {
                    this.sumaEntrada = this.sumaEntrada + item.cantidad;
                  }
                }

                // Asignaciones
                for (const item of materia_cantidad_tintas) {
                  if (datos_tintas[i].tinta_Id == item.materiaPrima && item.categoria == 7) {
                    this.sumaEntrada = this.sumaEntrada + item.cantidad;
                  }
                }

                this.inventInicial = 0;
                this.inventInicial = 0;

                this.cargarFormMpEnTablas(this.ArrayMateriaPrima,
                  datos_tintas[i].tinta_Id,
                  datos_tintas[i].tinta_Nombre,
                  datos_tintas[i].tinta_Precio,
                  datos_tintas[i].tinta_InvInicial,
                  this.sumaEntrada,
                  this.sumaSalida,
                  datos_tintas[i].tinta_Stock,
                  datos_tintas[i].undMed_Id,
                  datos_categoria.catMP_Nombre);
              });
            }
          });
        }, 2000);
      } else if (bodega == 3) {
        // Solo mostrará BOPP
        this.boppService.srvObtenerListaPorFecha(this.today).subscribe(datos_bopp => {
          for (let i = 0; i < datos_bopp.length; i++) {
            const matCant : any = {
              materiaPrima : datos_bopp[i].bopP_Id,
              cantidad : datos_bopp[i].bopP_CantidadInicialKg,
            }
            bopp_entrante.push(matCant);
          }
        });

        this.asignacionBOPPService.srvObtenerListaPorfecha(this.today).subscribe(datos_asignacionBopp => {
          for (let i = 0; i < datos_asignacionBopp.length; i++) {
            this.detallesAsignacionBOPPService.srvObtenerListaPorAsignacion(datos_asignacionBopp[i].asigBOPP_Id).subscribe(datos_detallesAsgBopp => {
              for (let j = 0; j < datos_detallesAsgBopp.length; j++) {
                this.boppService.srvObtenerListaPorId(datos_detallesAsgBopp[j].bopP_Id).subscribe(datos_bopp => {
                  let bopp : any = [];
                  bopp.push(datos_bopp);
                  for (const item of bopp) {
                    if (item.catMP_Id == categoria) {
                      const matCant : any = {
                        materiaPrima : item.bopP_Id,
                        cantidad : datos_detallesAsgBopp[j].dtAsigBOPP_Cantidad,
                      }
                      bopp_Saliente.push(matCant);
                    }
                  }
                });
              }
            });
          }
        });

        setTimeout(() => {
          this.boppService.srvObtenerLista().subscribe(datos_bopp => {
            for (let i = 0; i < datos_bopp.length; i++) {
              if (datos_bopp[i].bopP_Stock > 0) {
                this.categoriaBOPP = 'BOPP';
                this.categoriMpService.srvObtenerListaPorId(datos_bopp[i].catMP_Id).subscribe(datos_categoria => {
                  this.sumaSalida = 0;
                  this.sumaEntrada = 0;
                  this.inventInicial = 0;
                  for (const item of bopp_Saliente) {
                    if (datos_bopp[i].bopP_Id == item.materiaPrima) {
                      this.sumaSalida = this.sumaSalida + item.cantidad;
                    }
                  }

                  for (const item of bopp_entrante) {
                    if (datos_bopp[i].bopP_Id == item.materiaPrima) {
                      this.sumaEntrada = this.sumaEntrada + item.cantidad;
                    }
                  }

                  this.inventInicial = 0;

                  this.cargarFormMpEnTablas(this.ArrayMateriaPrima,
                    datos_bopp[i].bopP_Serial,
                    datos_bopp[i].bopP_Descripcion, /** Descripcion en vez de nombre */
                    datos_bopp[i].bopP_Precio,
                    datos_bopp[i].bopP_CantidadInicialKg,
                    this.sumaEntrada,
                    this.sumaSalida,
                    datos_bopp[i].bopP_Stock,
                    "Kg",
                    datos_categoria.catMP_Nombre,
                    datos_bopp[i].bopP_Ancho);
                });
              } else continue;
            }
          });
        }, 2000);
      }

    } else if(idMateriaPrima != null) {
      this.buscarMpId();

    } else {
      this.load = false;

      this.asignacionService.srvObtenerListaPorFecha(this.today).subscribe(datos_asignaciones => {
        for (let i = 0; i < datos_asignaciones.length; i++) {
          this.asignacionMpService.srvObtenerListaPorAsigId(datos_asignaciones[i].asigMp_Id).subscribe(datos_asignacionesMP => {
            for (let j = 0; j < datos_asignacionesMP.length; j++) {
              this.materiaPrimaService.srvObtenerListaPorId(datos_asignacionesMP[j].matPri_Id).subscribe(datos_materiaPrima => {
                const matCant : any = {
                  materiaPrima : datos_materiaPrima.matPri_Id,
                  cantidad : datos_asignacionesMP[j].dtAsigMp_Cantidad,
                  categoria : datos_materiaPrima.catMP_Id,
                }
                materia_cantidad.push(matCant);
              });
            }
          });

          this.asignacionTintasService.srvObtenerListaPor_Asignacion(datos_asignaciones[i].asigMp_Id).subscribe(datos_asignacionTintas => {
            for (let j = 0; j < datos_asignacionTintas.length; j++) {
              this.tintasService.srvObtenerListaPorId(datos_asignacionTintas[j].tinta_Id).subscribe(datos_tintas => {
                const matCant : any = {
                  materiaPrima : datos_tintas.tinta_Id,
                  cantidad : datos_asignacionTintas[j].dtAsigTinta_Cantidad,
                  categoria : datos_tintas.catMP_Id,
                }
                materia_cantidad_tintas.push(matCant);
              });
            }
          });
        }
      });

      this.facturaCompraService.srvObtenerListaPorFecha(this.today).subscribe(datos_factura => {
        for (let i = 0; i < datos_factura.length; i++) {
          this.facturaCompraMPService.srvObtenerListaPorFacId(datos_factura[i].facco_Id).subscribe(datos_facturaMP => {
            for (let j = 0; j < datos_facturaMP.length; j++) {
              this.materiaPrimaService.srvObtenerListaPorId(datos_facturaMP[j].matPri_Id).subscribe(datos_materiaPrima => {
                const matCant : any = {
                  materiaPrima : datos_materiaPrima.matPri_Id,
                  cantidad : datos_facturaMP[j].faccoMatPri_Cantidad,
                }
                materia_cantidad_factura.push(matCant);
              });
            }
          });
        }
      });

      this.remisionService.srvObtenerListaPorFecha(this.today).subscribe(datos_remisiones => {
        for (let i = 0; i < datos_remisiones.length; i++) {
          this.remisionMpService.srvObtenerListaPorRemId(datos_remisiones[i].rem_Id).subscribe(datos_remisionMP => {
            for (let j = 0; j < datos_remisionMP.length; j++) {
              this.materiaPrimaService.srvObtenerListaPorId(datos_remisionMP[j].matPri_Id).subscribe(datos_materiaPrima => {
                const matCant : any = {
                  materiaPrima : datos_materiaPrima.matPri_Id,
                  cantidad : datos_remisionMP[j].remiMatPri_Cantidad,
                }
                materia_cantidad_remision.push(matCant);
              });
            }
          });
        }
      });

      this.recuperadoService.srvObtenerListaPorFecha(this.today).subscribe(datos_recuperado => {
        for (let i = 0; i < datos_recuperado.length; i++) {
          this.recuperadoMPService.srvObtenerListaPorRecuperadoId(datos_recuperado[i].recMp_Id).subscribe(datos_recuperadoMP => {
            for (let j = 0; j < datos_recuperadoMP.length; j++) {
              this.materiaPrimaService.srvObtenerListaPorId(datos_recuperadoMP[j].matPri_Id).subscribe(datos_materiaPrima => {
                const matCant : any = {
                  materiaPrima : datos_materiaPrima.matPri_Id,
                  cantidad : datos_recuperadoMP[j].recMatPri_Cantidad,
                }
                materia_cantidad_recuperado.push(matCant);

              });
            }
          });
        }
      });

      this.devolucionesService.srvObtenerListaPorfecha(this.today).subscribe(datos_devoluciones => {
        for (let i = 0; i < datos_devoluciones.length; i++) {
          this.detallesDevolucionesService.srvObtenerListaPorDevId(datos_devoluciones[i].devMatPri_Id).subscribe(datos_detallesDevoluciones => {
            for (let j = 0; j < datos_detallesDevoluciones.length; j++) {
              this.materiaPrimaService.srvObtenerListaPorId(datos_detallesDevoluciones[j].matPri_Id).subscribe(datos_materiaPrima => {
                const matCant : any = {
                  materiaPrima : datos_materiaPrima.matPri_Id,
                  cantidad : datos_detallesDevoluciones[j].dtDevMatPri_CantidadDevuelta,
                }
                materia_cantidad_devoluciones.push(matCant);
              });
            }
          });
        }
      });

      this.detallesEntTintas.srvObtenerListaPorFecha(this.today).subscribe(datos_entradaTinta => {
        for (let i = 0; i < datos_entradaTinta.length; i++) {
          this.tintasService.srvObtenerListaPorId(datos_entradaTinta[i].tinta_Id).subscribe(datos_tintas => {
            let tintaCant : any = {
              materiaPrima : datos_entradaTinta[i].tinta_Id,
              categoria : datos_tintas.catMP_Id,
              cantidad : datos_entradaTinta[i].dtEntTinta_Cantidad,
            }
            materia_cantidad_tintas_Entrada.push(tintaCant);
          });
        }
      });

      setTimeout(() => {
        if (this.ValidarRol == 1 || this.ValidarRol == 3){
          this.materiaPrimaService.srvObtenerLista().subscribe(datos_materiaPrima => {
            for (let index = 0; index < datos_materiaPrima.length; index++) {
              this.categoriMpService.srvObtenerListaPorId(datos_materiaPrima[index].catMP_Id).subscribe(datos_categoria => {
                this.inventInicialDiaService.srvObtenerListaPorId(datos_materiaPrima[index].matPri_Id).subscribe(datos_inventarioInicial => {
                  this.sumaSalida = 0;
                  this.sumaEntrada = 0;
                  this.inventInicial = 0;
                  this.inventInicial = datos_inventarioInicial.invInicial_Stock;
                  // Asignaciones
                  for (const item of materia_cantidad) {
                    if (datos_materiaPrima[index].matPri_Id == item.materiaPrima && item.categoria != 7) {
                      this.sumaSalida += item.cantidad;
                      // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaSalida} de salida el dia ${fecha}`)
                    }
                  }
                  // Facturas
                  for (const item of materia_cantidad_factura) {
                    if (datos_materiaPrima[index].matPri_Id == item.materiaPrima) {
                      this.sumaEntrada = this.sumaEntrada + item.cantidad;
                      // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaEntrada} de salida el dia ${fecha} FACTURA`)
                    }
                  }
                  // Remisiones
                  for (const item of materia_cantidad_remision) {
                    if (datos_materiaPrima[index].matPri_Id == item.materiaPrima) {
                      this.sumaEntrada = this.sumaEntrada + item.cantidad;
                      // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaEntrada} de salida el dia ${fecha} REMISION`)
                    }
                  }

                  // Recuperado
                  for (const item of materia_cantidad_recuperado) {
                    if (datos_materiaPrima[index].matPri_Id == item.materiaPrima) {
                      this.sumaEntrada = this.sumaEntrada + item.cantidad;
                      // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaEntrada} de salida el dia ${fecha} REMISION`)
                    }
                  }

                  // Devoluciones
                  for (const item of materia_cantidad_devoluciones) {
                    if (datos_materiaPrima[index].matPri_Id == item.materiaPrima) {
                      this.sumaEntrada = this.sumaEntrada + item.cantidad;
                      // this.sumaSalida = this.sumaSalida - item.cantidad;
                    }
                  }

                  this.inventInicial = 0;
                  this.inventInicial = datos_inventarioInicial.invInicial_Stock;

                  this.cargarFormMpEnTablas(this.ArrayMateriaPrima,
                    datos_materiaPrima[index].matPri_Id,
                    datos_materiaPrima[index].matPri_Nombre,
                    datos_materiaPrima[index].matPri_Precio,
                    this.inventInicial,
                    this.sumaEntrada,
                    this.sumaSalida,
                    datos_materiaPrima[index].matPri_Stock,
                    datos_materiaPrima[index].undMed_Id,
                    datos_categoria.catMP_Nombre);
                });
              });
            }
          });

          this.tintasService.srvObtenerLista().subscribe(datos_tintas => {
            for (let i = 0; i < datos_tintas.length; i++) {
              this.categoriMpService.srvObtenerListaPorId(datos_tintas[i].catMP_Id).subscribe(datos_categoria => {
                this.sumaSalida = 0;
                this.sumaEntrada = 0;
                this.inventInicial = 0;
                this.inventInicial = 0;
                // Entradas
                for (const item of materia_cantidad_tintas_Entrada) {
                  if (datos_tintas[i].tinta_Id == item.materiaPrima && item.categoria == 7) {
                    this.sumaEntrada = this.sumaEntrada + item.cantidad;
                  }
                }

                // Asignaciones
                for (const item of materia_cantidad_tintas) {
                  if (datos_tintas[i].tinta_Id == item.materiaPrima && item.categoria == 7) {
                    this.sumaEntrada = this.sumaEntrada + item.cantidad;
                  }
                }

                this.inventInicial = 0;
                this.inventInicial = 0;

                this.cargarFormMpEnTablas(this.ArrayMateriaPrima,
                  datos_tintas[i].tinta_Id,
                  datos_tintas[i].tinta_Nombre,
                  datos_tintas[i].tinta_Precio,
                  datos_tintas[i].tinta_InvInicial,
                  this.sumaEntrada,
                  this.sumaSalida,
                  datos_tintas[i].tinta_Stock,
                  datos_tintas[i].undMed_Id,
                  datos_categoria.catMP_Nombre);
              });
            }
          });
        }

        if (this.ValidarRol == 1 || this.ValidarRol == 4){
          this.boppService.srvObtenerListaAgrupada().subscribe(datos_bopp => {
            for (let i = 0; i < datos_bopp.length; i++) {
              if (datos_bopp[i].sumaKilosActual > 0) {
                this.categoriaBOPP = 'BOPP';
                this.sumaSalida = 0;
                this.sumaEntrada = 0;
                this.inventInicial = 0;
                for (const item of bopp_Saliente) {
                  if (datos_bopp[i].bopP_Id == item.materiaPrima) {
                    this.sumaSalida = this.sumaSalida + item.cantidad;
                  }
                }

                for (const item of bopp_entrante) {
                  if (datos_bopp[i].bopP_Id == item.materiaPrima) {
                    this.sumaEntrada = this.sumaEntrada + + item.cantidad;
                  }
                }

                this.inventInicial = 0;

                this.cargarFormMpEnTablas(this.ArrayMateriaPrima,
                  datos_bopp[i].conteoDescripcion,
                  datos_bopp[i].bopP_Descripcion, /** Descripcion en vez de nombre */
                  (datos_bopp[i].sumaPrecio / datos_bopp[i].conteoDescripcion),
                  datos_bopp[i].sumaKilosIngresados,
                  this.sumaEntrada,
                  this.sumaSalida,
                  datos_bopp[i].sumaKilosActual,
                  "Kg",
                  'BOPP',
                  datos_bopp[i].bopP_Ancho);
              } else continue;
            }
          });
        }
      }, 2000);
    }

  }

  // Funcion que organiza los campos de la tabla segun su precio de mayor a menor
  organizacionPrecioDblClick(){
    this.ArrayMateriaPrima.sort((a,b)=> Number(b.SubTotal) - Number(a.SubTotal));
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
    this.ArrayMateriaPrima.sort((a,b)=> Number(a.SubTotal) - Number(b.SubTotal));
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


/** Adición  */

/** Consulta */
  consultaMateriasPrimas(){
    let matPrimaId : any =  this.FormMateriaPrima.value.MpNombre.Id;
    let matPrimaNombre : any =  this.FormMateriaPrima.value.MpId;
    if (matPrimaNombre == undefined) matPrimaNombre = null;
    let matPrimaCategoria : any =  this.FormMateriaPrima.value.MpCategoria;
    let matPrimaBodega : any =  this.FormMateriaPrima.value.MpBodega;
    let fechaInicio : any =  this.FormMateriaPrima.value.fecha;
    let fechaFin : any =  this.FormMateriaPrima.value.fechaFinal;
    this.ArrayMateriaPrima = [];


  }

  consultaMatPrimaxId(){


  }


}
