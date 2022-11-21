import { Component, Inject, Injectable, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MaterialProductoService } from 'src/app/Servicios/materialProducto.service';
import { PigmentoProductoService } from 'src/app/Servicios/pigmentoProducto.service';
import { TintasService } from 'src/app/Servicios/tintas.service';
import { UnidadMedidaService } from 'src/app/Servicios/unidad-medida.service';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { BagproService } from 'src/app/Servicios/Bagpro.service';
import { OpedidoproductoService } from 'src/app/Servicios/opedidoproducto.service';
import { PedidoProductosService } from 'src/app/Servicios/pedidoProductos.service';
import { RolesService } from 'src/app/Servicios/roles.service';
import Swal from 'sweetalert2';
import { ExistenciasProductosService } from 'src/app/Servicios/existencias-productos.service';
import { EstadosService } from 'src/app/Servicios/estados.service';
import { TratadoService } from 'src/app/Servicios/Tratado.service';
import { FormatosService } from 'src/app/Servicios/Formatos.service';
import { Tipos_ImpresionService } from 'src/app/Servicios/Tipos_Impresion.service';
import { PistasService } from 'src/app/Servicios/Pistas.service';
import { RodillosService } from 'src/app/Servicios/Rodillos.service';
import { Laminado_CapaService } from 'src/app/Servicios/Laminado_Capa.service';
import { Orden_TrabajoService } from 'src/app/Servicios/Orden_Trabajo.service';
import { UsuarioService } from 'src/app/Servicios/usuario.service';
import { Mezclas_MaterialesService } from 'src/app/Servicios/Mezclas_Materiales.service';
import { Mezclas_PigmentosService } from 'src/app/Servicios/Mezclas_Pigmentos.service';
import { MezclasService } from 'src/app/Servicios/Mezclas.service';
import { OT_ExtrusionService } from 'src/app/Servicios/OT_Extrusion.service';
import { OT_ImpresionService } from 'src/app/Servicios/OT_Impresion.service';
import { OT_LaminadoService } from 'src/app/Servicios/OT_Laminado.service';
import { EmpresaService } from 'src/app/Servicios/empresa.service';
import pdfMake from 'pdfmake/build/pdfmake';
import { table } from 'console';
import { faListSquares } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-ordenes-trabajo',
  templateUrl: './ordenes-trabajo.component.html',
  styleUrls: ['./ordenes-trabajo.component.css']
})

export class OrdenesTrabajoComponent implements OnInit {

  public FormOrdenTrabajo !: FormGroup;
  public FormOrdenTrabajoExtrusion !: FormGroup;
  public FormOrdenTrabajoImpresion !: FormGroup;
  public FormOrdenTrabajoLaminado !: FormGroup;
  public FormOrdenTrabajoMezclas !: FormGroup;

  public titulosTabla = []; //Variable que llenará los titulos de la tabla
  public arrayTintas = []; /** Array que colocará las tintas en los combobox al momento de crear la OT */
  public arrayPigmentos = []; /** Array que colocará las pigmentos en los combobox al momento de crear la OT */
  public arrayMateriales = []; /** Array que colocará las materiales en los combobox al momento de crear la OT*/
  public arrayUnidadesMedidas = []; /** Array que colocará las unidades de medida en los combobox al momento de crear la OT*/

  cargando : boolean = true; //Variable para validar que salga o no la imagen de carga
  vistaPedidos : boolean = false; //Funcion que validará si se muestra el navbar de ordenes de trabajo o no
  extrusion : boolean = false; //variable que va a mostrar o no el apartado de extrusion, dependiendo de su valor
  impresion : boolean = false; //variable que va a mostrar o no el apartado de impresion, dependiendo de su valor
  laminado : boolean = false; //variable que va a mostrar o no el apartado de laminado, dependiendo de su valor
  checkedExtrusion : boolean = false; //Variable para saber si el checkbox de extrusion está seleccionado o no
  checkedImpresion : boolean = false; //Variable para saber si el checkbox de impresion está seleccionado o no
  checkedLaminado : boolean = false; //Variable para saber si el checkbox de laminado está seleccionado o no
  checkedCyrel : boolean = false; //Variable para saber si el checkbox del Cyrel está seleccionado o no
  checkedCorte : boolean = false; //Variable para saber si el checkbox del Corte está seleccionado o no
  today : any = new Date(); //Variable que se usará para llenar la fecha actual
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  pedidosSinOT : any = []; //Variable que almacenará la informacion de los pedidos que no tienen orden de trabajo aun
  keywordPedidos = 'nombre'; //Variable que servirá para filtrar mediante se escribe los pedidos por un campo
  keywordMezclas = 'mezcla_Nombre'; //Variable que servirá para filtrar mediante se escribe los nombres de las mezclas
  validarInputPedidos : any = true; //Variable para validar si se verá o no el titulo del campo donde se consultarán los pedidos
  validarInputMezclas : any = true; //Variable para validar si se verá o no el titulo del campo donde se consultarán las mezclas
  ultimaOrdenTrabajo : number; // Variable que almacenará el numero de la OT que se está creando
  pedidosProductos = []; //Variable que se va a almacenar los pedidos consultados
  ArrayProducto : any [] = []; //Variable que tendrá la informacion de los productos que fueron pedidos
  estados : any = []; //Variable que almacenará los estados que puede tener una orden de trabajo
  tratado : any = []; //Vairbale que servirá para almacenar los tratado que puede tener una bolsa en el proceso de extrusion
  formatos : any = []; //Variable que servirá para almacenar los formatos que se harán en extrusion
  tiposImpresion : any = []; //Variable que guardará los diferentes tipos de impresion que hay en la empresa
  rodillos : any = []; //Variable que almacenará los rodillos utilizados en impresion
  pistas : any = []; //Variable que almacenará las pistas utilizadas en impresion
  laminado_capas : any = []; //Vaiable qie almacenará los diferentes laminados
  cantidadKgMasMargen : number = 0; //Variable que almacenará el total que se va a producir en la orden de trabajo, sumandole el margen que le proporcionen
  cantidadUndMasMargen : number = 0; //Variable que almacenará el total que se va a producir en la orden de trabajo, sumandole el margen que le proporcionen
  producto : number = 0; //Variable que almacenará el producto al que se espera que se le cree la orden de trabajo
  pedidoId : number = 0; //VAriable que almacenará el pedido del cual se estará creando la orden de trabajo
  clienteId : number = 0; //Variable que almacenará el ID de la sede del cliente al cual se le creará la orden de trabajo
  cantidadKilos : number = 0; //Variable que va a almacenar la cantidad de kilos pedidos en el pedido y que se harán en la orden de trabajo
  cantidadUnidades : number = 0; //Variable que va a almacenar la cantidad de unidades pedidas en el pedido y que se harán en la orden de trabajo
  pesoProducto : number = 0; //Variable que va a almacenar el peso del producto al que se le hará la orden de trabajo
  mezclasMateriales : any = [] //Vaiable que almacenará las mezclas de materiales
  mezclasPigmentos : any = []; //Variable que almacenará las mezclas de pigmentos
  mezclas : any = []; //Variable que almacenará las mezclas
  checkedCapa1 : boolean = false; //Variable para saber si el checkbox de la capa 1 está seleccionado
  checkedCapa2 : boolean = false; //Variable para saber si el checkbox de la capa 2 está seleccionado
  checkedCapa3 : boolean = false; //Variable para saber si el checkbox de la capa 3 está seleccionado
  idMezclaSeleccionada : number = 0; //Variable que almacenará el ID de la mezcla que fue seleccionada
  presentacionProducto : string; //Variablle que almacenará la presentacion del producto

  constructor(private frmBuilderPedExterno : FormBuilder,
                private rolService : RolesService,
                  @Inject(SESSION_STORAGE) private storage: WebStorageService,
                    private bagProService : BagproService,
                      private productosPedidoExternoService : PedidoProductosService,
                        private pedidoExternoService : OpedidoproductoService,
                          private servicioTintas : TintasService,
                            private servicioMateriales : MaterialProductoService,
                              private servicioPigmentos : PigmentoProductoService,
                                private servicioUnidadMedida : UnidadMedidaService,
                                  private existenciasProductosServices : ExistenciasProductosService,
                                    private estadosService : EstadosService,
                                      private tratadoServise : TratadoService,
                                        private formatoService : FormatosService,
                                          private tiposImpresionService : Tipos_ImpresionService,
                                            private pistasService : PistasService,
                                              private rodillosService : RodillosService,
                                                private laminadoCapasService : Laminado_CapaService,
                                                  private ordenTrabajoService : Orden_TrabajoService,
                                                    private otExtrusionServie : OT_ExtrusionService,
                                                      private otImpresionService : OT_ImpresionService,
                                                        private otLaminadoService : OT_LaminadoService,
                                                          private usuarioService : UsuarioService,
                                                            private mezclaMaterialService : Mezclas_MaterialesService,
                                                              private mezclaPigmentosService : Mezclas_PigmentosService,
                                                                private mezclasService : MezclasService,) {

    this.FormOrdenTrabajo = this.frmBuilderPedExterno.group({
      OT_Id: [''],
      Pedido_Id: ['', Validators.required],
      Nombre_Vendedor: ['', Validators.required],
      OT_FechaCreacion: ['', Validators.required],
      OT_FechaEntrega: ['', Validators.required],
      ID_Cliente: ['', Validators.required],
      Nombre_Cliente: ['', Validators.required],
      Ciudad_SedeCliente: ['', Validators.required],
      Direccion_SedeCliente : ['', Validators.required],
      OT_Estado : ['', Validators.required],
      OT_Observacion : [''],
      Margen : [0, Validators.required],
      OT_Cyrel : [''],
      OT_Corte : [''],
    });

    this.FormOrdenTrabajoExtrusion = this.frmBuilderPedExterno.group({
      /*** Datos para tabla de extrusión */
      cantidad_Extrusion : [''],
      Material_Extrusion : ['NO APLICA', Validators.required],
      Formato_Extrusion : ['Sin formato', Validators.required],
      Pigmento_Extrusion : ['NO APLICA', Validators.required],
      Ancho_Extrusion1 : [0, Validators.required],
      Ancho_Extrusion2 : [0, Validators.required],
      Ancho_Extrusion3 : [0, Validators.required],
      Calibre_Extrusion : [0, Validators.required],
      UnidadMedida_Extrusion : ['', Validators.required],
      Tratado_Extrusion : ['No Aplica', Validators.required],
    });

    this.FormOrdenTrabajoImpresion = this.frmBuilderPedExterno.group({
      /*** Datos para tabla de impresióm */
      cantidad_Impresion : [''],
      Tipo_Impresion : ['NO APLICA', Validators.required],
      Rodillo_Impresion : [0, Validators.required],
      Pista_Impresion : [0, Validators.required],
      Tinta_Impresion1 : ['NO APLICA', ],
      Tinta_Impresion2 : ['NO APLICA', ],
      Tinta_Impresion3 : ['NO APLICA', ],
      Tinta_Impresion4 : ['NO APLICA', ],
      Tinta_Impresion5 : ['NO APLICA', ],
      Tinta_Impresion6 : ['NO APLICA', ],
      Tinta_Impresion7 : ['NO APLICA', ],
      Tinta_Impresion8 : ['NO APLICA', ],
    });

    this.FormOrdenTrabajoLaminado = this.frmBuilderPedExterno.group({
      /*** Datos para tabla de Laminado */
      cantidad_Laminado : ['', ],
      Capa_Laminado1 : ['NO APLICA', ],
      Calibre_Laminado1 : [0, ],
      cantidad_Laminado1 : [0, ],
      Capa_Laminado2 : ['NO APLICA', ],
      Calibre_Laminado2 : [0, ],
      cantidad_Laminado2 : [0, ],
      Capa_Laminado3 : ['NO APLICA', ],
      Calibre_Laminado3 : [0, ],
      cantidad_Laminado3 : [0, ],
    });

    this.FormOrdenTrabajoMezclas = this.frmBuilderPedExterno.group({
      Nombre_Mezclas : ['', Validators.required],
      Chechbox_Capa1 : ['', Validators.required],
      Chechbox_Capa2 : ['', Validators.required],
      Chechbox_Capa3 : ['', Validators.required],
      Proc_Capa1 : [0, Validators.required],
      Proc_Capa2 : [0, Validators.required],
      Proc_Capa3 : [0, Validators.required],
      materialP1_Capa1 : ['NO APLICA MATERIAL', Validators.required],
      PorcentajeMaterialP1_Capa1 : [0, Validators.required],
      materialP1_Capa2 : ['NO APLICA MATERIAL', Validators.required],
      PorcentajeMaterialP1_Capa2 : [0, Validators.required],
      materialP1_Capa3 : ['NO APLICA MATERIAL', Validators.required],
      PorcentajeMaterialP1_Capa3 : [0, Validators.required],
      materialP2_Capa1 : ['NO APLICA MATERIAL', Validators.required],
      PorcentajeMaterialP2_Capa1 : [0, Validators.required],
      materialP2_Capa2 : ['NO APLICA MATERIAL', Validators.required],
      PorcentajeMaterialP2_Capa2 : [0, Validators.required],
      materialP2_Capa3 : ['NO APLICA MATERIAL', Validators.required],
      PorcentajeMaterialP2_Capa3 : [0, Validators.required],
      materialP3_Capa1 : ['NO APLICA MATERIAL', Validators.required],
      PorcentajeMaterialP3_Capa1 : [0, Validators.required],
      materialP3_Capa2 : ['NO APLICA MATERIAL', Validators.required],
      PorcentajeMaterialP3_Capa2 : [0, Validators.required],
      materialP3_Capa3 : ['NO APLICA MATERIAL', Validators.required],
      PorcentajeMaterialP3_Capa3 : [0, Validators.required],
      materialP4_Capa1 : ['NO APLICA MATERIAL', Validators.required],
      PorcentajeMaterialP4_Capa1 : [0, Validators.required],
      materialP4_Capa2 : ['NO APLICA MATERIAL', Validators.required],
      PorcentajeMaterialP4_Capa2 : [0, Validators.required],
      materialP_Capa3 : ['NO APLICA MATERIAL', Validators.required],
      PorcentajeMaterialP_Capa3 : [0, Validators.required],
      MezclaPigmentoP1_Capa1 : ['NO APLICA PIGMENTO', Validators.required],
      PorcentajeMezclaPigmentoP1_Capa1 : [0, Validators.required],
      MezclaPigmentoP1_Capa2 : ['NO APLICA PIGMENTO', Validators.required],
      PorcentajeMezclaPigmentoP1_Capa2 : [0, Validators.required],
      MezclaPigmento1_Capa3 : ['NO APLICA PIGMENTO', Validators.required],
      PorcentajeMezclaPigmentoP1_Capa3 :[0, Validators.required],
      MezclaPigmentoP2_Capa1 : ['NO APLICA PIGMENTO', Validators.required],
      PorcentajeMezclaPigmentoP2_Capa1 : [0, Validators.required],
      MezclaPigmentoP2_Capa2 : ['NO APLICA PIGMENTO', Validators.required],
      PorcentajeMezclaPigmentoP2_Capa2 : [0, Validators.required],
      MezclaPigmento2_Capa3 : ['NO APLICA PIGMENTO', Validators.required],
      PorcentajeMezclaPigmentoP2_Capa3 : [0, Validators.required],
    });
   }

  ngOnInit(): void {
    this.cargarEstados();
    this.fecha();
    this.lecturaStorage();
    this.ColumnasTabla();
    this.ultimaOT();
    this.pedidos();
    this.cargarTintasEnProcesoImpresion();
    this.cargarPigmentosEnProcesoExtrusion();
    this.cargarMaterialEnProcesoExtrusion();
    this.cargarUnidadMedidaEnProcesoExtrusion();
    this.cargarTratadoEnProcesoExtrusion();
    this.cargarFormatosEnProcesoExtrusion();
    this.cargarTiposImpresion();
    this.cargarLaminados();
    this.cargarMezclaMateria();
    this.cargarMezclaPigmento();
    this.cargarMezclas();
    // this.pdfOrdenTrabajo(172);

    // for (let i = 0; i < 2; i++) {
    //   this.checkedExtrusion = true;
    //   const corte : any = document.getElementById("extrusion");
    //   corte.click();
    //   this.checkedExtrusion = false;
    // }
  }

  // Funcion que va a validar si el campo de pedido está cambiando o no y mostrar el titulo o no
  onChangeSearchPedido(val: string) {
    if (val != '') this.validarInputPedidos = false;
    else this.validarInputPedidos = true;
  }

  // Funcion que va a validar si el campo de pedido está con el cursor o no y mostrar el titulo o no
  onFocusedNombrePedido(e){
    if (!e.isTrusted) this.validarInputPedidos = false;
    else this.validarInputPedidos = true;
    if (this.FormOrdenTrabajo.value.Pedido_Id != null) this.validarInputPedidos = false;
    else this.validarInputPedidos = true;
  }

  // Funcion que va a validar si el campo de mezclas está cambiando o no y mostrar el titulo o no
  onChangeSearchMezcla(val: string) {
    if (val != '') this.validarInputMezclas = false;
    else this.validarInputMezclas = true;
  }

  // Funcion que va a validar si el campo de mezclas está con el cursor o no y mostrar el titulo o no
  onFocusedNombreMezcla(e){
    if (!e.isTrusted) this.validarInputMezclas = false;
    else this.validarInputMezclas = true;
    if (this.FormOrdenTrabajoMezclas.value.Nombre_Mezclas != null) this.validarInputMezclas = false;
    else this.validarInputMezclas = true;
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

  //Funcion que colocará la fecha actual y la colocará en el campo de fecha de pedido
  fecha(){
    this.today = new Date();
    var dd : any = this.today.getDate();
    var mm : any = this.today.getMonth() + 1;
    var yyyy : any = this.today.getFullYear();
    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
    this.today = yyyy + '-' + mm + '-' + dd;
    this.FormOrdenTrabajo = this.frmBuilderPedExterno.group({
      OT_Id: '',
      Pedido_Id: '',
      Nombre_Vendedor: '',
      OT_FechaCreacion: this.today,
      OT_FechaEntrega: '',
      ID_Cliente: '',
      Nombre_Cliente: '',
      Ciudad_SedeCliente: '',
      Direccion_SedeCliente : '',
      OT_Estado : 'Abierta',
      OT_Observacion : '',
      Margen : 0,
      OT_Cyrel : '',
      OT_Corte : '',
    });
  }

  /** Función que cargará las tintas en los combobox al momento de crear la OT. */
  cargarTintasEnProcesoImpresion(){
    this.servicioTintas.srvObtenerLista().subscribe(registrosTintas => {
      for (let tin = 0; tin < registrosTintas.length; tin++) {
        this.arrayTintas.push(registrosTintas[tin].tinta_Nombre);
      }
    });
  }

  /** Función que cargará los pigmentos en el combobox al momento de crear la OT. */
  cargarPigmentosEnProcesoExtrusion(){
    this.servicioPigmentos.srvObtenerLista().subscribe(registrosPigmentos => {
      for (let pig = 0; pig < registrosPigmentos.length; pig++) {
        this.arrayPigmentos.push(registrosPigmentos[pig].pigmt_Nombre);
      }
    });
  }

  //Funcion que cargará los estados que puede tener una orden de trabajo
  cargarEstados(){
    this.estadosService.srvObtenerListaEstados().subscribe(datos_estados => {
      for (let i = 0; i < datos_estados.length; i++) {
        if (datos_estados[i].tpEstado_Id == 4) this.estados.push(datos_estados[i].estado_Nombre);
      }
    });
  }

   /** Función que cargará los materiales en el combobox al momento de crear la OT. */
  cargarMaterialEnProcesoExtrusion(){
    this.servicioMateriales.srvObtenerLista().subscribe(registrosMateriasProd => {
      for (let matp = 0; matp < registrosMateriasProd.length; matp++) {
        this.arrayMateriales.push(registrosMateriasProd[matp].material_Nombre);
      }
    });
  }

  /** Función que cargará las unidades de medida en el combobox al momento de crear la OT. */
  cargarUnidadMedidaEnProcesoExtrusion(){
    this.servicioUnidadMedida.srvObtenerLista().subscribe(registros_unidadesMedida => {
      for (let und = 0; und < registros_unidadesMedida.length; und++) {
        if (registros_unidadesMedida[und].undMed_Id == 'Cms' || registros_unidadesMedida[und].undMed_Id == 'Plgs') this.arrayUnidadesMedidas.push(registros_unidadesMedida[und].undMed_Id);
      }
    });
  }

  //Funcion que se encargará de cargar los diferentes tratados para el proceso de extrusion
  cargarTratadoEnProcesoExtrusion(){
    this.tratadoServise.srvObtenerLista().subscribe(datos_tratado => {
      for (let i = 0; i < datos_tratado.length; i++) {
        this.tratado.push(datos_tratado[i].tratado_Nombre);
      }
    });
  }

  //Funcion que cargará los formatos para el proceso de extrusion
  cargarFormatosEnProcesoExtrusion(){
    this.formatoService.srvObtenerLista().subscribe(datos_formatos => {
      for (let i = 0; i < datos_formatos.length; i++) {
        this.formatos.push(datos_formatos[i].formato_Nombre);
      }
    });
  }

  //Funcion que cargará los diferentes tipos de impresion que maneja la empresa
  cargarTiposImpresion(){
    this.tiposImpresionService.srvObtenerLista().subscribe(datos_tiposImpresion => {
      for (let i = 0; i < datos_tiposImpresion.length; i++) {
        this.tiposImpresion.push(datos_tiposImpresion[i].tpImpresion_Nombre);
      }
    });
  }

  // Funcion que traerá todos los rodillos que tiene impresion
  cargarRodillosImpresion(){
    this.rodillosService.srvObtenerLista().subscribe(datos_rodillos => {
      for (let i = 0; i < datos_rodillos.length; i++) {
        this.rodillos.push(datos_rodillos[i].rodillo_Nombre);
      }
    });
  }

  // Funcion que traerá todos las pistas que hay en impresion
  cargarPistasImpresion(){
    this.pistasService.srvObtenerLista().subscribe(datos_pistas => {
      for (let i = 0; i < datos_pistas.length; i++) {
        this.pistas.push(datos_pistas[i].pista_Nombre);
      }
    });
  }

  //Funcion que cargará los diferentes laminados
  cargarLaminados(){
    this.laminadoCapasService.srvObtenerLista().subscribe(datos_laminado => {
      for (let i = 0; i < datos_laminado.length; i++) {
        this.laminado_capas.push(datos_laminado[i].lamCapa_Nombre);
      }
    });
  }

  // Funcion que cargará las mezclas de materiales
  cargarMezclaMateria(){
    this.mezclaMaterialService.srvObtenerLista().subscribe(datos_mezclasMateriales => {
      for (let i = 0; i < datos_mezclasMateriales.length; i++) {
        this.mezclasMateriales.push(datos_mezclasMateriales[i].mezMaterial_Nombre);
      }
    });
  }

  // Funcion que cargará las mezclas de pigmentos
  cargarMezclaPigmento(){
    this.mezclaPigmentosService.srvObtenerLista().subscribe(datos_mezclaPigmentos => {
      for (let i = 0; i < datos_mezclaPigmentos.length; i++) {
        this.mezclasPigmentos.push(datos_mezclaPigmentos[i].mezPigmto_Nombre)
      }
    });
  }

  // Funcion que cargará el nombre de las mezclas
  cargarMezclas(){
    this.mezclasService.srvObtenerLista().subscribe(datos_mezclas => {
      for (let i = 0; i < datos_mezclas.length; i++) {
        this.mezclas.push(datos_mezclas[i]);
      }
    });
  }

  //Funcion que va cargar cada uno de los componentes de la mezcla
  cargarCombinacionMezclas(item){
    let nombreMezcla =  item.mezcla_Nombre.trim();
    if (nombreMezcla != null) this.validarInputMezclas = false;
    else this.validarInputMezclas = true;
    this.mezclasService.srvObtenerListaPorNombre(nombreMezcla).subscribe(datos_mezcla => {
      for (let i = 0; i < datos_mezcla.length; i++) {

        this.idMezclaSeleccionada = datos_mezcla[i].mezcla_Id;
        if (datos_mezcla[i].mezcla_NroCapas == 1) {
          this.checkedCapa1 = true;
          this.checkedCapa2 = false;
          this.checkedCapa3 = false;
          const capa1 : any = document.getElementById("capa1");
          capa1.click();
        } else if (datos_mezcla[i].mezcla_NroCapas == 2) {
          this.checkedCapa1 = false;
          this.checkedCapa2 = true;
          this.checkedCapa3 = false;
          const capa2 : any = document.getElementById("capa2");
          capa2.click();
        } else if (datos_mezcla[i].mezcla_NroCapas == 3) {
          this.checkedCapa1 = false;
          this.checkedCapa2 = false;
          this.checkedCapa3 = true;
          const capa3 : any = document.getElementById("capa3");
          capa3.click();
        }

        this.FormOrdenTrabajoMezclas = this.frmBuilderPedExterno.group({
          Nombre_Mezclas : nombreMezcla,
          Chechbox_Capa1 : this.checkedCapa1,
          Chechbox_Capa2 : this.checkedCapa2,
          Chechbox_Capa3 : this.checkedCapa3,
          Proc_Capa1 : datos_mezcla[i].mezcla_PorcentajeCapa1,
          Proc_Capa2 : datos_mezcla[i].mezcla_PorcentajeCapa2,
          Proc_Capa3 : datos_mezcla[i].mezcla_PorcentajeCapa3,
          materialP1_Capa1 : datos_mezcla[i].mezMaterial_Nombre1xCapa1,
          PorcentajeMaterialP1_Capa1 : datos_mezcla[i].mezcla_PorcentajeMaterial1_Capa1,
          materialP1_Capa2 : datos_mezcla[i].mezMaterial_Nombre1xCapa2,
          PorcentajeMaterialP1_Capa2 : datos_mezcla[i].mezcla_PorcentajeMaterial1_Capa2,
          materialP1_Capa3 : datos_mezcla[i].mezMaterial_Nombre1xCapa3,
          PorcentajeMaterialP1_Capa3 : datos_mezcla[i].mezcla_PorcentajeMaterial1_Capa3,
          materialP2_Capa1 : datos_mezcla[i].mezMaterial_Nombre2xCapa1,
          PorcentajeMaterialP2_Capa1 : datos_mezcla[i].mezcla_PorcentajeMaterial2_Capa1,
          materialP2_Capa2 : datos_mezcla[i].mezMaterial_Nombre2xCapa2,
          PorcentajeMaterialP2_Capa2 : datos_mezcla[i].mezcla_PorcentajeMaterial2_Capa2,
          materialP2_Capa3 : datos_mezcla[i].mezMaterial_Nombre2xCapa3,
          PorcentajeMaterialP2_Capa3 : datos_mezcla[i].mezcla_PorcentajeMaterial2_Capa3,
          materialP3_Capa1 : datos_mezcla[i].mezMaterial_Nombre3xCapa1,
          PorcentajeMaterialP3_Capa1 : datos_mezcla[i].mezcla_PorcentajeMaterial3_Capa1,
          materialP3_Capa2 : datos_mezcla[i].mezMaterial_Nombre3xCapa2,
          PorcentajeMaterialP3_Capa2 : datos_mezcla[i].mezcla_PorcentajeMaterial3_Capa2,
          materialP3_Capa3 : datos_mezcla[i].mezMaterial_Nombre3xCapa3,
          PorcentajeMaterialP3_Capa3 : datos_mezcla[i].mezcla_PorcentajeMaterial3_Capa3,
          materialP4_Capa1 : datos_mezcla[i].mezMaterial_Nombre4xCapa1,
          PorcentajeMaterialP4_Capa1 : datos_mezcla[i].mezcla_PorcentajeMaterial4_Capa1,
          materialP4_Capa2 : datos_mezcla[i].mezMaterial_Nombre4xCapa2,
          PorcentajeMaterialP4_Capa2 : datos_mezcla[i].mezcla_PorcentajeMaterial4_Capa2,
          materialP_Capa3 : datos_mezcla[i].mezMaterial_Nombre4xCapa3,
          PorcentajeMaterialP_Capa3 : datos_mezcla[i].mezcla_PorcentajeMaterial4_Capa3,
          MezclaPigmentoP1_Capa1 : datos_mezcla[i].mezPigmento_Nombre1xCapa1,
          PorcentajeMezclaPigmentoP1_Capa1 : datos_mezcla[i].mezcla_PorcentajePigmto1_Capa1,
          MezclaPigmentoP1_Capa2 : datos_mezcla[i].mezPigmento_Nombre1xCapa2,
          PorcentajeMezclaPigmentoP1_Capa2 : datos_mezcla[i].mezcla_PorcentajePigmto1_Capa2,
          MezclaPigmento1_Capa3 : datos_mezcla[i].mezPigmento_Nombre1xCapa3,
          PorcentajeMezclaPigmentoP1_Capa3 :datos_mezcla[i].mezcla_PorcentajePigmto1_Capa3,
          MezclaPigmentoP2_Capa1 : datos_mezcla[i].mezPigmento_Nombre2xCapa1,
          PorcentajeMezclaPigmentoP2_Capa1 : datos_mezcla[i].mezcla_PorcentajePigmto2_Capa1,
          MezclaPigmentoP2_Capa2 : datos_mezcla[i].mezPigmento_Nombre2xCapa2,
          PorcentajeMezclaPigmentoP2_Capa2 : datos_mezcla[i].mezcla_PorcentajePigmto2_Capa2,
          MezclaPigmento2_Capa3 : datos_mezcla[i].mezPigmento_Nombre2xCapa3,
          PorcentajeMezclaPigmentoP2_Capa3 : datos_mezcla[i].mezcla_PorcentajePigmto2_Capa3,
        });
      }
    });
  }

  // Función que llenará los titulos de la tabla
  ColumnasTabla(){
    this.titulosTabla = [];
    this.titulosTabla = [{
      pID : "Id",
      pNombre : "Nombre",
      pAncho :   "Ancho",
      pFuelle : "Fuelle",
      pCalibre : "Cal",
      pPesoMillar : "Peso Millar",
      pUndMedACF : "Und.",
      pTipoProd : "TipoProd",
      pMaterial : 'Material',
      pPigmento : 'Pigmento',
      pCantPaquete : "Cant x Paquete",
      pCantBulto : "Cant x Bulto",
      pCantidad : "Cantidad",
      pLargo : "Largo",
      pUndMedCant : "Und. Cant",
      pTipoSellado : "Tipo Sellado",
      pPrecioU : "Precio U",
      pMoneda : "Moneda",
      pStock : "Stock",
      pDescripcion : "Descripción",
      pSubtotal : "Subtotal",
    }]
  }

  // Funcion que traerá la ultima orden de trabajo para poder tomar el ID de la OT
  ultimaOT(){
    this.bagProService.srvObtenerListaClienteOT_UltimaOT().subscribe(datos_ot => {
      let ot : any = []
      ot.push(datos_ot);
      for (const itemOt of ot) {
        this.ultimaOrdenTrabajo = itemOt.item + 1;
      }
    });
  }

  //Funcion que servirá para mostrar la informacion de los pedidos que no tienen orden de trabajo
  pedidos(){
    this.pedidosSinOT = [];
    this.pedidoExternoService.srvObtenerListaPedidoExterno().subscribe(datos_pedidosSinOT => {
      for (let i = 0; i < datos_pedidosSinOT.length; i++) {
        this.ordenTrabajoService.srvObtenerListaNumeroPedido(datos_pedidosSinOT[i].pedExt_Id).subscribe(datos_ot => {
          if (datos_ot.length == 0) {
            let nombre : string = datos_pedidosSinOT[i].cli_Nombre;
            let FechaEntregaDatetime = datos_pedidosSinOT[i].pedExt_FechaEntrega;
            let FechaEntregaNueva = FechaEntregaDatetime.indexOf("T");
            let fechaEntrega = FechaEntregaDatetime.substring(0, FechaEntregaNueva);
            let info : any = {
              id : datos_pedidosSinOT[i].pedExt_Id,
              nombre : `${datos_pedidosSinOT[i].pedExt_Id} - ${nombre} - Despachar: ${fechaEntrega}`,
              fecha: datos_pedidosSinOT[i].pedExt_FechaEntrega,
            }
            this.pedidosSinOT.push(info)
          } else if (datos_ot.length >= 1){
            let productosOT : any = [];

            for (let i = 0; i < datos_ot.length; i++) {
              productosOT.push(datos_ot[i].prod_Id);
            }

            this.productosPedidoExternoService.srvObtenerListaPorIdProductoPedido(datos_pedidosSinOT[i].pedExt_Id).subscribe(datos_productosPedidos => {
              for (let j = 0; j < datos_productosPedidos.length; j++) {
                if (!productosOT.includes(datos_productosPedidos[j].prod_Id)) {
                  let nombre : string = datos_pedidosSinOT[i].cli_Nombre;
                  let FechaEntregaDatetime = datos_pedidosSinOT[i].pedExt_FechaEntrega;
                  let FechaEntregaNueva = FechaEntregaDatetime.indexOf("T");
                  let fechaEntrega = FechaEntregaDatetime.substring(0, FechaEntregaNueva);
                  let info : any = {
                    id : datos_pedidosSinOT[i].pedExt_Id,
                    nombre : `${datos_pedidosSinOT[i].pedExt_Id} - ${nombre} - Despachar: ${fechaEntrega}`,
                    fecha: datos_pedidosSinOT[i].pedExt_FechaEntrega,
                  }
                  this.pedidosSinOT.push(info)
                } else continue;
              }
            });
          }
        });

        // let nombre : string = datos_pedidosSinOT[i].cli_Nombre;
        // let FechaEntregaDatetime = datos_pedidosSinOT[i].pedExt_FechaEntrega;
        // let FechaEntregaNueva = FechaEntregaDatetime.indexOf("T");
        // let fechaEntrega = FechaEntregaDatetime.substring(0, FechaEntregaNueva);
        // let info : any = {
        //   id : datos_pedidosSinOT[i].pedExt_Id,
        //   nombre : `${datos_pedidosSinOT[i].pedExt_Id} - ${nombre} - Despachar: ${fechaEntrega}`,
        //   fecha: datos_pedidosSinOT[i].pedExt_FechaEntrega,
        // }
        // this.pedidosSinOT.push(info)
        this.pedidosSinOT.sort((a,b) => a.fecha.localeCompare(b.fecha));
      }
    });
  }

  // Funcion que consultará el pedido del cual se hará la orden de trabajo
  consultarPedido(item : any){
    let idPedido : any = item;
    this.cantidadKgMasMargen = 0;
    this.cantidadUndMasMargen = 0;
    this.ArrayProducto = [];
    this.pedidoId = idPedido.id;

    this.ordenTrabajoService.srvObtenerListaNumeroPedido(idPedido.id).subscribe(datos_ot => {
      if (datos_ot.length == 0) {
        this.pedidoExternoService.srvObtenerListaPorIdPedidoLlenarPDF(idPedido.id).subscribe(datos_pedido => {
          for (let i = 0; i < datos_pedido.length; i++) {
            this.productosPedidoExternoService.srvObtenerListaPorIdProductoPedido(idPedido.id).subscribe(datos_productosPedidos => {
              for (let j = 0; j < datos_productosPedidos.length; j++) {
                this.existenciasProductosServices.srvObtenerListaPorIdProducto(datos_productosPedidos[j].prod_Id).subscribe(datos_productos => {
                  for (let k = 0; k < datos_productos.length; k++) {
                    let FechaEntregaDatetime = datos_pedido[i].pedExt_FechaEntrega;
                    let FechaEntregaNueva = FechaEntregaDatetime.indexOf("T");
                    let fechaEntrega = FechaEntregaDatetime.substring(0, FechaEntregaNueva);

                    this.clienteId = datos_pedido[i].sedeCli_Id;
                    this.FormOrdenTrabajo.patchValue({
                      OT_Id: ['', Validators.required],
                      Pedido_Id: idPedido.nombre,
                      Nombre_Vendedor: datos_pedido[i].usua_Nombre,
                      OT_FechaCreacion: this.today,
                      OT_FechaEntrega: fechaEntrega,
                      ID_Cliente: datos_pedido[i].cli_Id,
                      Nombre_Cliente: datos_pedido[i].cli_Nombre,
                      Ciudad_SedeCliente: datos_pedido[i].sedeCliente_Ciudad,
                      Direccion_SedeCliente : datos_pedido[i].sedeCliente_Direccion,
                      OT_Estado : 'Abierta',
                      OT_Observacion : datos_pedido[i].pedExt_Observacion,
                      Margen : 0,
                      OT_Cyrel : this.checkedCyrel,
                      OT_Corte : this.checkedCorte,
                    });
                    this.FormOrdenTrabajoExtrusion.reset();
                    this.FormOrdenTrabajoImpresion.reset();
                    this.FormOrdenTrabajoLaminado.reset();
                    if (this.FormOrdenTrabajo.value.Pedido_Id != null) this.validarInputPedidos = false;
                    else this.validarInputPedidos = true;

                    let productoExt : any = {
                      Id : datos_productos[k].prod_Id,
                      Nombre : datos_productos[k].prod_Nombre,
                      Ancho : datos_productos[k].prod_Ancho,
                      Fuelle : datos_productos[k].prod_Fuelle,
                      Cal : datos_productos[k].prod_Calibre,
                      Und : datos_productos[k].undMedACF,
                      PesoMillar : datos_productos[k].prod_Peso_Millar,
                      Tipo : datos_productos[k].tpProd_Nombre,
                      Material : datos_productos[k].material_Nombre,
                      Pigmento : datos_productos[k].pigmt_Nombre,
                      CantPaquete : 0,
                      CantBulto : 0,
                      Cant : datos_productosPedidos[j].pedExtProd_Cantidad,
                      Largo : datos_productos[k].prod_Largo,
                      UndCant : datos_productosPedidos[j].undMed_Id,
                      TipoSellado : datos_productos[k].tpSellados_Nombre,
                      PrecioUnd : datos_productosPedidos[j].pedExtProd_PrecioUnitario,
                      TpMoneda : datos_productos[k].tpMoneda_Id,
                      Stock : datos_productos[k].ExProd_Cantidad,
                      Produ_Descripcion : datos_productos[k].prod_Descripcion,
                      SubTotal : datos_productosPedidos[j].pedExtProd_Cantidad * datos_productosPedidos[j].pedExtProd_PrecioUnitario,
                    }
                    this.pesoProducto = datos_productos[k].prod_Peso;
                    if(this.ArrayProducto.length == 0) this.ArrayProducto.push(productoExt);
                    else {
                      for (let index = 0; index < this.ArrayProducto.length; index++) {
                        this.ArrayProducto.push(productoExt);
                        break;
                      }
                    }
                    break;
                  }
                });
              }
            });
          }
        });
      } else {
        if (datos_ot.length >= 1) {
          let productosOT : any = [];

          for (let i = 0; i < datos_ot.length; i++) {
            productosOT.push(datos_ot[i].prod_Id);
          }

          this.productosPedidoExternoService.srvObtenerListaPorIdProductoPedido(idPedido.id).subscribe(datos_productosPedidos => {
            for (let j = 0; j < datos_productosPedidos.length; j++) {
              if (!productosOT.includes(datos_productosPedidos[j].prod_Id)) {
                this.pedidoExternoService.srvObtenerListaPorIdPedidoLlenarPDF(idPedido.id).subscribe(datos_pedido => {
                  for (let i = 0; i < datos_pedido.length; i++) {
                    this.existenciasProductosServices.srvObtenerListaPorIdProducto(datos_productosPedidos[j].prod_Id).subscribe(datos_productos => {
                      for (let k = 0; k < datos_productos.length; k++) {
                        let FechaEntregaDatetime = datos_pedido[i].pedExt_FechaEntrega;
                        let FechaEntregaNueva = FechaEntregaDatetime.indexOf("T");
                        let fechaEntrega = FechaEntregaDatetime.substring(0, FechaEntregaNueva);

                        this.clienteId = datos_pedido[i].sedeCli_Id;
                        this.FormOrdenTrabajo.patchValue({
                          OT_Id: ['', Validators.required],
                          Pedido_Id: idPedido.nombre,
                          Nombre_Vendedor: datos_pedido[i].usua_Nombre,
                          OT_FechaCreacion: this.today,
                          OT_FechaEntrega: fechaEntrega,
                          ID_Cliente: datos_pedido[i].cli_Id,
                          Nombre_Cliente: datos_pedido[i].cli_Nombre,
                          Ciudad_SedeCliente: datos_pedido[i].sedeCliente_Ciudad,
                          Direccion_SedeCliente : datos_pedido[i].sedeCliente_Direccion,
                          OT_Estado : 'Abierta',
                          OT_Observacion : datos_pedido[i].pedExt_Observacion,
                          Margen : 0,
                          OT_Cyrel : this.checkedCyrel,
                          OT_Corte : this.checkedCorte,
                        });
                        this.FormOrdenTrabajoExtrusion.reset();
                        this.FormOrdenTrabajoImpresion.reset();
                        this.FormOrdenTrabajoLaminado.reset();
                        if (this.FormOrdenTrabajo.value.Pedido_Id != null) this.validarInputPedidos = false;
                        else this.validarInputPedidos = true;

                        let productoExt : any = {
                          Id : datos_productos[k].prod_Id,
                          Nombre : datos_productos[k].prod_Nombre,
                          Ancho : datos_productos[k].prod_Ancho,
                          Fuelle : datos_productos[k].prod_Fuelle,
                          Cal : datos_productos[k].prod_Calibre,
                          Und : datos_productos[k].undMedACF,
                          PesoMillar : datos_productos[k].prod_Peso_Millar,
                          Tipo : datos_productos[k].tpProd_Nombre,
                          Material : datos_productos[k].material_Nombre,
                          Pigmento : datos_productos[k].pigmt_Nombre,
                          CantPaquete : 0,
                          CantBulto : 0,
                          Cant : datos_productosPedidos[j].pedExtProd_Cantidad,
                          Largo : datos_productos[k].prod_Largo,
                          UndCant : datos_productosPedidos[j].undMed_Id,
                          TipoSellado : datos_productos[k].tpSellados_Nombre,
                          PrecioUnd : datos_productosPedidos[j].pedExtProd_PrecioUnitario,
                          TpMoneda : datos_productos[k].tpMoneda_Id,
                          Stock : datos_productos[k].ExProd_Cantidad,
                          Produ_Descripcion : datos_productos[k].prod_Descripcion,
                          SubTotal : datos_productosPedidos[j].pedExtProd_Cantidad * datos_productosPedidos[j].pedExtProd_PrecioUnitario,
                        }

                        this.pesoProducto = datos_productos[k].prod_Peso_Millar;
                        if(this.ArrayProducto.length == 0) this.ArrayProducto.push(productoExt);
                        else {
                          for (let index = 0; index < this.ArrayProducto.length; index++) {
                            this.ArrayProducto.push(productoExt);
                            break;
                          }
                        }
                        break;
                      }
                    });
                  }
                });
              } else continue;
            }
          });
        } else Swal.fire(`El pedido ${item.pedExt_Id} ya tiene ordenes de trabajo`)
      }
    });
  }

  // Funcion para consultar si el producto 'X' que el cliente 'Y' pidió y tiene una orden de trabajo hecha, para poder llenar la nueva
  consultar_Prod_Cli_Presentacion(formulario : any){
    this.producto = formulario.Id;
    this.cantidadKilos = 0;
    this.cantidadUnidades = 0;
    let cliente : string = this.FormOrdenTrabajo.value.Nombre_Cliente;
    let presentacion : string = formulario.UndCant;
    let impresion : any;
    let laminadoCapa1 : any;
    let laminadoCapa2 : any;
    let laminadoCapa3 : any;
    this.presentacionProducto = presentacion;
    if (presentacion == 'Kg') presentacion = 'Kilo';
    else if (presentacion == 'Paquete') presentacion = 'Paquete';
    else if (presentacion == 'Und') presentacion = 'Unidad';
    else if (presentacion == 'Rollo') presentacion = 'Rollo';

    this.bagProService.srvObtenerListaClienteOT_Cliente_Item_Presentacion(cliente, formulario.Id, presentacion).subscribe(datos_Ot => {
      let ot : any = [];
      ot.push(datos_Ot);
      for (const itemOt of ot) {

        this.FormOrdenTrabajo.patchValue({
          OT_Id: this.FormOrdenTrabajo.value.OT_Id,
          Pedido_Id: this.FormOrdenTrabajo.value.Pedido_Id,
          Nombre_Vendedor: this.FormOrdenTrabajo.value.Nombre_Vendedor,
          OT_FechaCreacion: this.today,
          OT_FechaEntrega: this.FormOrdenTrabajo.value.OT_FechaEntrega,
          ID_Cliente: this.FormOrdenTrabajo.value.ID_Cliente,
          Nombre_Cliente: this.FormOrdenTrabajo.value.Nombre_Cliente,
          Ciudad_SedeCliente: this.FormOrdenTrabajo.value.Ciudad_SedeCliente,
          Direccion_SedeCliente : this.FormOrdenTrabajo.value.Direccion_SedeCliente,
          OT_Estado : this.FormOrdenTrabajo.value.OT_Estado,
          OT_Observacion : itemOt.observacion,
          Margen : itemOt.ptMargen,
          OT_Cyrel : this.checkedCyrel,
          OT_Corte : this.checkedCorte,
        });
        if (this.FormOrdenTrabajo.value.Pedido_Id != null) this.validarInputPedidos = false;
        else this.validarInputPedidos = true;

        if (itemOt.cyrel == 1) {
          this.checkedCyrel = true;
          const cyrel : any = document.getElementById("cyrel");
          cyrel.click();
        }
        else if (itemOt.cyrel == 0) this.checkedCyrel = false;

        if (itemOt.corte == 1) {
          this.checkedCorte = true;
          const corte : any = document.getElementById("corte");
          corte.click();
        }
        else if (itemOt.corte == 0) this.checkedCorte = false;

        this.FormOrdenTrabajoExtrusion.setValue({
          cantidad_Extrusion : '',
          Material_Extrusion : itemOt.extMaterialNom.trim(),
          Formato_Extrusion : itemOt.extFormatoNom.trim(),
          Pigmento_Extrusion : itemOt.extPigmentoNom.trim(),
          Ancho_Extrusion1 : itemOt.extAcho1,
          Ancho_Extrusion2 : itemOt.extAcho2,
          Ancho_Extrusion3 : itemOt.extAcho3,
          Calibre_Extrusion : itemOt.extCalibre,
          UnidadMedida_Extrusion : itemOt.extUnidadesNom.trim(),
          Tratado_Extrusion : itemOt.extTratadoNom.trim(),
        });

        impresion = itemOt.impFlexoNom.trim();
        if (impresion != 'FLEXOGRAFIA' && impresion != 'ROTOGRABADO') impresion = 1;

        let tinta1 : string = itemOt.impTinta1Nom.trim();
        let tinta2 : string = itemOt.impTinta2Nom.trim();
        let tinta3 : string = itemOt.impTinta3Nom.trim();
        let tinta4 : string = itemOt.impTinta4Nom.trim();
        let tinta5 : string = itemOt.impTinta5Nom.trim();
        let tinta6 : string = itemOt.impTinta6Nom.trim();
        let tinta7 : string = itemOt.impTinta7Nom.trim();
        let tinta8 : string = itemOt.impTinta8Nom.trim();

        if (tinta1 == '') tinta1 = 'NO APLICA';
        if (tinta2 == '') tinta2 = 'NO APLICA';
        if (tinta3 == '') tinta3 = 'NO APLICA';
        if (tinta4 == '') tinta4 = 'NO APLICA';
        if (tinta5 == '') tinta5 = 'NO APLICA';
        if (tinta6 == '') tinta6 = 'NO APLICA';
        if (tinta7 == '') tinta7 = 'NO APLICA';
        if (tinta8 == '') tinta8 = 'NO APLICA';

        this.FormOrdenTrabajoImpresion.setValue({
          cantidad_Impresion : '',
          Tipo_Impresion : itemOt.impFlexoNom.trim(),
          Rodillo_Impresion : itemOt.impRodillo,
          Pista_Impresion : itemOt.impPista,
          Tinta_Impresion1 : tinta1,
          Tinta_Impresion2 : tinta2,
          Tinta_Impresion3 : tinta3,
          Tinta_Impresion4 : tinta4,
          Tinta_Impresion5 : tinta5,
          Tinta_Impresion6 : tinta6,
          Tinta_Impresion7 : tinta7,
          Tinta_Impresion8 : tinta8,
        });

        laminadoCapa1 = itemOt.lamCapa1Nom.trim();
        laminadoCapa2 = itemOt.lamCapa2Nom.trim();
        laminadoCapa3 = itemOt.lamCapa3Nom.trim()
        if (laminadoCapa1 == '') laminadoCapa1 = 'NO APLICA';
        if (laminadoCapa2 == '') laminadoCapa2 = 'NO APLICA';
        if (laminadoCapa3 == '') laminadoCapa3 = 'NO APLICA';

        this.FormOrdenTrabajoLaminado.setValue({
          cantidad_Laminado : '',
          Capa_Laminado1 : laminadoCapa1,
          Calibre_Laminado1 : itemOt.lamCalibre1,
          cantidad_Laminado1 : itemOt.cant1,
          Capa_Laminado2 : laminadoCapa2,
          Calibre_Laminado2 : itemOt.lamCalibre2,
          cantidad_Laminado2 : itemOt.cant2,
          Capa_Laminado3 : laminadoCapa3,
          Calibre_Laminado3 : itemOt.lamCalibre3,
          cantidad_Laminado3 : itemOt.cant3,
        });

        setTimeout(() => {
          if (this.pesoProducto != 0) {
            if (formulario.UndCant == 'Kg') {
              this.cantidadKilos = formulario.Cant;
              this.cantidadUnidades = formulario.Cant / this.pesoProducto;
            }
            else {
              this.cantidadUnidades = formulario.Cant;
              this.cantidadKilos = (formulario.Cant * this.pesoProducto) / 1000;
            }
          } else if (this.pesoProducto == 0) {
            this.cantidadKilos = formulario.Cant;
            this.cantidadUnidades = formulario.Cant;
          }
          this.cantidadKgMasMargen = this.cantidadKilos + ((this.cantidadKilos * this.FormOrdenTrabajo.value.Margen) / 100);
          this.cantidadUndMasMargen = this.cantidadUnidades + ((this.cantidadUnidades * this.FormOrdenTrabajo.value.Margen) / 100);
        }, 500);
        let mezcla : any = {
          mezcla_Nombre : itemOt.mezModoNom,
        }
        this.cargarCombinacionMezclas(mezcla);
      }
    }, error => {
      this.FormOrdenTrabajoExtrusion = this.frmBuilderPedExterno.group({
        /*** Datos para tabla de extrusión */
        cantidad_Extrusion : [''],
        Material_Extrusion : ['NO APLICA', Validators.required],
        Formato_Extrusion : ['Sin formato', Validators.required],
        Pigmento_Extrusion : ['NO APLICA', Validators.required],
        Ancho_Extrusion1 : [0, Validators.required],
        Ancho_Extrusion2 : [0, Validators.required],
        Ancho_Extrusion3 : [0, Validators.required],
        Calibre_Extrusion : [0, Validators.required],
        UnidadMedida_Extrusion : ['', Validators.required],
        Tratado_Extrusion : ['No Aplica', Validators.required],
      });
      this.FormOrdenTrabajoImpresion = this.frmBuilderPedExterno.group({
        /*** Datos para tabla de impresióm */
        cantidad_Impresion : [''],
        Tipo_Impresion : ['NO APLICA', Validators.required],
        Rodillo_Impresion : [0, Validators.required],
        Pista_Impresion : [0, Validators.required],
        Tinta_Impresion1 : ['NO APLICA', ],
        Tinta_Impresion2 : ['NO APLICA', ],
        Tinta_Impresion3 : ['NO APLICA', ],
        Tinta_Impresion4 : ['NO APLICA', ],
        Tinta_Impresion5 : ['NO APLICA', ],
        Tinta_Impresion6 : ['NO APLICA', ],
        Tinta_Impresion7 : ['NO APLICA', ],
        Tinta_Impresion8 : ['NO APLICA', ],
      });
      this.FormOrdenTrabajoLaminado = this.frmBuilderPedExterno.group({
        /*** Datos para tabla de Laminado */
        cantidad_Laminado : ['', ],
        Capa_Laminado1 : ['NO APLICA', ],
        Calibre_Laminado1 : [0, ],
        cantidad_Laminado1 : [0, ],
        Capa_Laminado2 : ['NO APLICA', ],
        Calibre_Laminado2 : [0, ],
        cantidad_Laminado2 : [0, ],
        Capa_Laminado3 : ['NO APLICA', ],
        Calibre_Laminado3 : [0, ],
        cantidad_Laminado3 : [0, ],
      });
      this.FormOrdenTrabajoMezclas = this.frmBuilderPedExterno.group({
        Nombre_Mezclas : ['', Validators.required],
        Chechbox_Capa1 : ['', Validators.required],
        Chechbox_Capa2 : ['', Validators.required],
        Chechbox_Capa3 : ['', Validators.required],
        Proc_Capa1 : [0, Validators.required],
        Proc_Capa2 : [0, Validators.required],
        Proc_Capa3 : [0, Validators.required],
        materialP1_Capa1 : ['NO APLICA MATERIAL', Validators.required],
        PorcentajeMaterialP1_Capa1 : [0, Validators.required],
        materialP1_Capa2 : ['NO APLICA MATERIAL', Validators.required],
        PorcentajeMaterialP1_Capa2 : [0, Validators.required],
        materialP1_Capa3 : ['NO APLICA MATERIAL', Validators.required],
        PorcentajeMaterialP1_Capa3 : [0, Validators.required],
        materialP2_Capa1 : ['NO APLICA MATERIAL', Validators.required],
        PorcentajeMaterialP2_Capa1 : [0, Validators.required],
        materialP2_Capa2 : ['NO APLICA MATERIAL', Validators.required],
        PorcentajeMaterialP2_Capa2 : [0, Validators.required],
        materialP2_Capa3 : ['NO APLICA MATERIAL', Validators.required],
        PorcentajeMaterialP2_Capa3 : [0, Validators.required],
        materialP3_Capa1 : ['NO APLICA MATERIAL', Validators.required],
        PorcentajeMaterialP3_Capa1 : [0, Validators.required],
        materialP3_Capa2 : ['NO APLICA MATERIAL', Validators.required],
        PorcentajeMaterialP3_Capa2 : [0, Validators.required],
        materialP3_Capa3 : ['NO APLICA MATERIAL', Validators.required],
        PorcentajeMaterialP3_Capa3 : [0, Validators.required],
        materialP4_Capa1 : ['NO APLICA MATERIAL', Validators.required],
        PorcentajeMaterialP4_Capa1 : [0, Validators.required],
        materialP4_Capa2 : ['NO APLICA MATERIAL', Validators.required],
        PorcentajeMaterialP4_Capa2 : [0, Validators.required],
        materialP_Capa3 : ['NO APLICA MATERIAL', Validators.required],
        PorcentajeMaterialP_Capa3 : [0, Validators.required],
        MezclaPigmentoP1_Capa1 : ['NO APLICA PIGMENTO', Validators.required],
        PorcentajeMezclaPigmentoP1_Capa1 : [0, Validators.required],
        MezclaPigmentoP1_Capa2 : ['NO APLICA PIGMENTO', Validators.required],
        PorcentajeMezclaPigmentoP1_Capa2 : [0, Validators.required],
        MezclaPigmento1_Capa3 : ['NO APLICA PIGMENTO', Validators.required],
        PorcentajeMezclaPigmentoP1_Capa3 :[0, Validators.required],
        MezclaPigmentoP2_Capa1 : ['NO APLICA PIGMENTO', Validators.required],
        PorcentajeMezclaPigmentoP2_Capa1 : [0, Validators.required],
        MezclaPigmentoP2_Capa2 : ['NO APLICA PIGMENTO', Validators.required],
        PorcentajeMezclaPigmentoP2_Capa2 : [0, Validators.required],
        MezclaPigmento2_Capa3 : ['NO APLICA PIGMENTO', Validators.required],
        PorcentajeMezclaPigmentoP2_Capa3 : [0, Validators.required],
      });
      Swal.fire(`No se encuentra una Orden de Trabajo anterior para el cliente ${cliente}, el producto ${formulario.Id} y presentación ${presentacion}`);
    });
  }

  // Funcion que servirá para consultar una orden de trabajo
  consultarOT(){
    let numeroOT : number = this.FormOrdenTrabajo.value.OT_Id;
    this.ArrayProducto = [];

    this.ordenTrabajoService.srvObtenerListaNumeroOt(numeroOT).subscribe(datos_Ot => {
      if (datos_Ot.length != 0) {
        for (let i = 0; i < datos_Ot.length; i++) {

          this.productosPedidoExternoService.srvObtenerListaPorIdProducto_Pedido(datos_Ot[i].prod_Id, datos_Ot[i].pedExt_Id).subscribe(datos_pedido => {
            for (let k = 0; k < datos_pedido.length; k++) {
              this.existenciasProductosServices.srvObtenerListaPorIdProducto(datos_Ot[i].prod_Id).subscribe(datos_productos => {
                for (let j = 0; j < datos_productos.length; j++) {
                  let productoExt : any = {
                    Id : datos_productos[j].prod_Id,
                    Nombre : datos_productos[j].prod_Nombre,
                    Ancho : datos_productos[j].prod_Ancho,
                    Fuelle : datos_productos[j].prod_Fuelle,
                    Cal : datos_productos[j].prod_Calibre,
                    Und : datos_productos[j].undMedACF,
                    PesoMillar : datos_productos[j].prod_Peso_Millar,
                    Tipo : datos_productos[j].tpProd_Nombre,
                    Material : datos_productos[j].material_Nombre,
                    Pigmento : datos_productos[j].pigmt_Nombre,
                    CantPaquete : datos_productos[j].prod_CantBolsasPaquete,
                    CantBulto : datos_productos[j].prod_CantBolsasBulto,
                    Cant : datos_Ot[i].ot_CantidadKilos,
                    Largo : datos_productos[j].prod_Largo,
                    TipoSellado : datos_productos[j].tpSellados_Nombre,
                    UndCant : datos_productos[j].undMed_Id,
                    PrecioUnd : datos_pedido[k].pedExtProd_PrecioUnitario,
                    TpMoneda : datos_productos[j].tpMoneda_Id,
                    Stock : datos_productos[j].ExProd_Cantidad,
                    Produ_Descripcion : datos_productos[j].prod_Descripcion,
                    SubTotal : datos_Ot[i].ot_CantidadKilos * datos_pedido[k].pedExtProd_PrecioUnitario,
                  }

                  if(this.ArrayProducto.length == 0) this.ArrayProducto.push(productoExt);
                  else {
                    for (let index = 0; index < this.ArrayProducto.length; index++) {
                      this.ArrayProducto.push(productoExt);
                      break;
                    }
                  }
                  break;
                }
              });
              break;
            }
          });

          this.ordenTrabajoService.srvObtenerListaPdfOTInsertada(numeroOT).subscribe(datos_otconsultada => {
            for (let j = 0; j < datos_otconsultada.length; j++) {


              if (this.FormOrdenTrabajo.value.Pedido_Id != null) this.validarInputPedidos = false;
              else this.validarInputPedidos = true;

              let FechaCrecionDatetime = datos_Ot[i].ot_FechaCreacion;
              let FechaCreacionNueva = FechaCrecionDatetime.indexOf("T");
              let fechaCreacion = FechaCrecionDatetime.substring(0, FechaCreacionNueva);

              let FechaEntregaDatetime = datos_Ot[i].pedExt_FechaEntrega;
              let FechaEntregaNueva = FechaEntregaDatetime.indexOf("T");
              let fechaEntrega = FechaEntregaDatetime.substring(0, FechaEntregaNueva);

              if (datos_otconsultada[j].ot_Cyrel == 1) {
                this.checkedCyrel = true;
                const cyrel : any = document.getElementById("cyrel");
                cyrel.click();
              }
              else if (datos_otconsultada[j].ot_Cyrel == 0) this.checkedCyrel = false;

              if (datos_otconsultada[j].ot_Corte == 1) {
                this.checkedCorte = true;
                const corte : any = document.getElementById("corte");
                corte.click();
              }
              else if (datos_otconsultada[j].ot_Corte == 0) this.checkedCorte = false;

              this.FormOrdenTrabajo.patchValue({
                OT_Id: numeroOT,
                Pedido_Id: `${datos_Ot[i].pedExt_Id} - ${datos_Ot[i].cli_Nombre}`,
                Nombre_Vendedor: datos_Ot[i].usua_Nombre,
                OT_FechaCreacion: fechaCreacion,
                OT_FechaEntrega: fechaEntrega,
                ID_Cliente: datos_Ot[i].cli_Id,
                Nombre_Cliente: datos_Ot[i].cli_Nombre,
                Ciudad_SedeCliente: datos_Ot[i].sedeCliente_Ciudad,
                Direccion_SedeCliente : datos_Ot[i].sedeCliente_Direccion,
                OT_Estado : datos_Ot[i].estado_Nombre,
                OT_Observacion : datos_Ot[i].ot_Observacion,
                Margen : datos_Ot[i].ot_MargenAdicional,
                OT_Cyrel : this.checkedCyrel,
                OT_Corte : this.checkedCorte,
              });

              this.FormOrdenTrabajoExtrusion.setValue({
                cantidad_Extrusion : '',
                Material_Extrusion : datos_otconsultada[j].material_Nombre,
                Formato_Extrusion : datos_otconsultada[j].formato_Nombre,
                Pigmento_Extrusion : datos_otconsultada[j].pigmt_Nombre,
                Ancho_Extrusion1 : datos_otconsultada[j].extrusion_Ancho1,
                Ancho_Extrusion2 : datos_otconsultada[j].extrusion_Ancho2,
                Ancho_Extrusion3 : datos_otconsultada[j].extrusion_Ancho3,
                Calibre_Extrusion : datos_otconsultada[j].extrusion_Calibre,
                UnidadMedida_Extrusion : datos_otconsultada[j].undMed_Id,
                Tratado_Extrusion : datos_otconsultada[j].tratado_Nombre,
              });

              this.FormOrdenTrabajoImpresion.setValue({
                cantidad_Impresion : '',
                Tipo_Impresion : datos_otconsultada[j].tpImpresion_Nombre,
                Rodillo_Impresion : datos_otconsultada[j].rodillo_Id,
                Pista_Impresion : datos_otconsultada[j].pista_Id,
                Tinta_Impresion1 : datos_otconsultada[j].tinta1_Nombre,
                Tinta_Impresion2 : datos_otconsultada[j].tinta2_Nombre,
                Tinta_Impresion3 : datos_otconsultada[j].tinta3_Nombre,
                Tinta_Impresion4 : datos_otconsultada[j].tinta4_Nombre,
                Tinta_Impresion5 : datos_otconsultada[j].tinta5_Nombre,
                Tinta_Impresion6 : datos_otconsultada[j].tinta6_Nombre,
                Tinta_Impresion7 : datos_otconsultada[j].tinta7_Nombre,
                Tinta_Impresion8 : datos_otconsultada[j].tinta8_Nombre,
              });

              this.FormOrdenTrabajoLaminado.setValue({
                cantidad_Laminado : '',
                Capa_Laminado1 : datos_otconsultada[j].lamCapa1_Nombre,
                Calibre_Laminado1 : datos_otconsultada[j].lamCapa_Calibre1,
                cantidad_Laminado1 : datos_otconsultada[j].lamCapa_Cantidad1,
                Capa_Laminado2 : datos_otconsultada[j].lamCapa2_Nombre,
                Calibre_Laminado2 : datos_otconsultada[j].lamCapa_Calibre2,
                cantidad_Laminado2 : datos_otconsultada[j].lamCapa_Cantidad2,
                Capa_Laminado3 : datos_otconsultada[j].lamCapa3_Nombre,
                Calibre_Laminado3 : datos_otconsultada[j].lamCapa_Calibre3,
                cantidad_Laminado3 : datos_otconsultada[j].lamCapa_Cantidad3,
              });

              let mezcla : any = {
                mezcla_Nombre : datos_otconsultada[j].mezcla_Nombre,
              }
              this.cargarCombinacionMezclas(mezcla);
            }
          });
        }
      } else {
        this.bagProService.srvObtenerListaClienteOT_Item(numeroOT).subscribe(datos_otBagPro => {
          for (let j = 0; j < datos_otBagPro.length; j++) {

            let impresion : any;
            let laminadoCapa1 : any;
            let laminadoCapa2 : any;
            let laminadoCapa3 : any;
            let FechaCrecionDatetime = datos_otBagPro[j].fechaCrea;
            let FechaCreacionNueva = FechaCrecionDatetime.indexOf("T");
            let fechaCreacion = FechaCrecionDatetime.substring(0, FechaCreacionNueva);
            let FechaEntregaDatetime = datos_otBagPro[j].datosFechaDespachar;
            let FechaEntregaNueva = FechaEntregaDatetime.indexOf("T");
            let fechaEntrega = FechaEntregaDatetime.substring(0, FechaEntregaNueva);

            this.usuarioService.srvObtenerListaPorId(datos_otBagPro[j].usrModifica).subscribe(datos_usuario => {

              this.FormOrdenTrabajo.patchValue({
                OT_Id: numeroOT,
                Pedido_Id: ``,
                Nombre_Vendedor: datos_usuario.usua_Nombre,
                OT_FechaCreacion: fechaCreacion,
                OT_FechaEntrega: fechaEntrega,
                ID_Cliente: datos_otBagPro[j].cliente,
                Nombre_Cliente: datos_otBagPro[j].clienteNom,
                Ciudad_SedeCliente: '',
                Direccion_SedeCliente : '',
                OT_Estado : '',
                OT_Observacion : datos_otBagPro[j].observacion,
                Margen : datos_otBagPro[j].ptMargen,
                OT_Cyrel : this.checkedCyrel,
                OT_Corte : this.checkedCorte,
              });

              if (datos_otBagPro[j].cyrel == 1) {
                this.checkedCyrel = true;
                const cyrel : any = document.getElementById("cyrel");
                cyrel.click();
              }
              else if (datos_otBagPro[j].cyrel == 0) this.checkedCyrel = false;

              if (datos_otBagPro[j].corte == 1) {
                this.checkedCorte = true;
                const corte : any = document.getElementById("corte");
                corte.click();
              }
              else if (datos_otBagPro[j].corte == 0) this.checkedCorte = false;

              this.FormOrdenTrabajoExtrusion.setValue({
                cantidad_Extrusion : '',
                Material_Extrusion : datos_otBagPro[j].extMaterialNom.trim(),
                Formato_Extrusion : datos_otBagPro[j].extFormatoNom.trim(),
                Pigmento_Extrusion : datos_otBagPro[j].extPigmentoNom.trim(),
                Ancho_Extrusion1 : datos_otBagPro[j].extAcho1,
                Ancho_Extrusion2 : datos_otBagPro[j].extAcho2,
                Ancho_Extrusion3 : datos_otBagPro[j].extAcho3,
                Calibre_Extrusion : datos_otBagPro[j].extCalibre,
                UnidadMedida_Extrusion : datos_otBagPro[j].extUnidadesNom.trim(),
                Tratado_Extrusion : datos_otBagPro[j].extTratadoNom.trim(),
              });

              impresion = datos_otBagPro[j].impFlexoNom.trim();
              if (impresion != 'FLEXOGRAFIA' && impresion != 'ROTOGRABADO') impresion = 1;

              this.FormOrdenTrabajoImpresion.setValue({
                cantidad_Impresion : '',
                Tipo_Impresion : datos_otBagPro[j].impFlexoNom.trim(),
                Rodillo_Impresion : datos_otBagPro[j].impRodillo,
                Pista_Impresion : datos_otBagPro[j].impPista,
                Tinta_Impresion1 : '',
                Tinta_Impresion2 : '',
                Tinta_Impresion3 : '',
                Tinta_Impresion4 : '',
                Tinta_Impresion5 : '',
                Tinta_Impresion6 : '',
                Tinta_Impresion7 : '',
                Tinta_Impresion8 : '',
              });

              laminadoCapa1 = datos_otBagPro[j].lamCapa1Nom.trim();
              laminadoCapa2 = datos_otBagPro[j].lamCapa2Nom.trim();
              laminadoCapa3 = datos_otBagPro[j].lamCapa3Nom.trim()
              if (laminadoCapa1 == '') laminadoCapa1 = 'Sin Laminado';
              if (laminadoCapa2 == '') laminadoCapa2 = 'Sin Laminado';
              if (laminadoCapa3 == '') laminadoCapa3 = 'Sin Laminado';

              this.FormOrdenTrabajoLaminado.setValue({
                cantidad_Laminado : '',
                Capa_Laminado1 : laminadoCapa1,
                Calibre_Laminado1 : datos_otBagPro[j].lamCalibre1,
                cantidad_Laminado1 : datos_otBagPro[j].cant1,
                Capa_Laminado2 : laminadoCapa2,
                Calibre_Laminado2 : datos_otBagPro[j].lamCalibre2,
                cantidad_Laminado2 : datos_otBagPro[j].cant2,
                Capa_Laminado3 : laminadoCapa3,
                Calibre_Laminado3 : datos_otBagPro[j].lamCalibre3,
                cantidad_Laminado3 : datos_otBagPro[j].cant3,
              });

              let mezcla : any = {
                mezcla_Nombre : datos_otBagPro[j].mezModoNom,
              }
              this.cargarCombinacionMezclas(mezcla);
            });
          }
        });
      }
    });
  }

  // Funcion que enviará la informacion de la base de datos de PLASTICARIBEBDD
  guardarOT(){
    this.cargando = false;
    let cliente : number = this.clienteId;
    let producto : number = this.producto;
    let cantidadKilos : number = this.cantidadKilos;
    let cantidadUnidades : number = this.cantidadUnidades;
    let margenAdicional : number = this.FormOrdenTrabajo.value.Margen;
    let cantidadKilosMargen : number = cantidadKilos + ((cantidadKilos * margenAdicional) / 100);
    let cantidadUnidadesMargen : number = cantidadUnidades + ((cantidadUnidades * margenAdicional) / 100);
    let fecha : any = this.today;
    let estadoOT : number;
    let usuarioCreador : number = this.storage_Id;
    let pedidoID : number = this.pedidoId;
    let observacionOT : string = this.FormOrdenTrabajo.value.OT_Observacion;
    let corteOT : string;
    let cyrelOT : string;
    let mezclaId : number = this.idMezclaSeleccionada;
    let presentacion : string = this.presentacionProducto;
    //Vaiables OT_Extrusion
    let materialOT_Extrusion : any = this.FormOrdenTrabajoExtrusion.value.Material_Extrusion;
    let formatoOT_Extrusion : any = this.FormOrdenTrabajoExtrusion.value.Formato_Extrusion;
    let pigmentoOT_Extrusion : any = this.FormOrdenTrabajoExtrusion.value.Pigmento_Extrusion;
    let tratadoOT_Extrusion : any = this.FormOrdenTrabajoExtrusion.value.Tratado_Extrusion;
    let ancho1OT_Extrusion : any = this.FormOrdenTrabajoExtrusion.value.Ancho_Extrusion1;
    let ancho2OT_Extrusion : any = this.FormOrdenTrabajoExtrusion.value.Ancho_Extrusion2;
    let ancho3OT_Extrusion : any = this.FormOrdenTrabajoExtrusion.value.Ancho_Extrusion3;
    let calibreOT_Extrusion : any = this.FormOrdenTrabajoExtrusion.value.Calibre_Extrusion;
    let undMedOT_Extrusion : any = this.FormOrdenTrabajoExtrusion.value.UnidadMedida_Extrusion;
    //Variables OT_Impresion
    let tipoImpresion : any = this.FormOrdenTrabajoImpresion.value.Tipo_Impresion;
    let rodilloImpresion : any = this.FormOrdenTrabajoImpresion.value.Rodillo_Impresion;
    let pistaImpresion : any = this.FormOrdenTrabajoImpresion.value.Pista_Impresion;
    let tinta1Impresion : any = this.FormOrdenTrabajoImpresion.value.Tinta_Impresion1;
    let tinta2Impresion : any = this.FormOrdenTrabajoImpresion.value.Tinta_Impresion2;
    let tinta3Impresion : any = this.FormOrdenTrabajoImpresion.value.Tinta_Impresion3;
    let tinta4Impresion : any = this.FormOrdenTrabajoImpresion.value.Tinta_Impresion4;
    let tinta5Impresion : any = this.FormOrdenTrabajoImpresion.value.Tinta_Impresion5;
    let tinta6Impresion : any = this.FormOrdenTrabajoImpresion.value.Tinta_Impresion6;
    let tinta7Impresion : any = this.FormOrdenTrabajoImpresion.value.Tinta_Impresion7;
    let tinta8Impresion : any = this.FormOrdenTrabajoImpresion.value.Tinta_Impresion8;
    //Variables OT_Laminado
    let laminadoCapa1 : any = this.FormOrdenTrabajoLaminado.value.Capa_Laminado1;
    let laminadoCalibre1 : any = this.FormOrdenTrabajoLaminado.value.Calibre_Laminado1;
    let laminadoCantidad1 : any = this.FormOrdenTrabajoLaminado.value.cantidad_Laminado1;
    let laminadoCapa2 : any = this.FormOrdenTrabajoLaminado.value.Capa_Laminado2;
    let laminadoCalibre2 : any = this.FormOrdenTrabajoLaminado.value.Calibre_Laminado2;
    let laminadoCantidad2 : any = this.FormOrdenTrabajoLaminado.value.cantidad_Laminado2;
    let laminadoCapa3 : any = this.FormOrdenTrabajoLaminado.value.Capa_Laminado3;
    let laminadoCalibre3 : any = this.FormOrdenTrabajoLaminado.value.Calibre_Laminado3;
    let laminadoCantidad3 : any = this.FormOrdenTrabajoLaminado.value.cantidad_Laminado3;

    if (this.checkedCyrel) cyrelOT = '1';
    else cyrelOT = '0';
    if (this.checkedCorte) corteOT = '1'
    else corteOT = '0';

    if (!this.FormOrdenTrabajoLaminado.valid || !this.FormOrdenTrabajoImpresion.valid || !this.FormOrdenTrabajoExtrusion.valid || !this.FormOrdenTrabajo.valid){
      this.cargando = true;
      Swal.fire("!Hay campos vacíos¡");
    } else if (this.FormOrdenTrabajoLaminado.valid && this.FormOrdenTrabajoImpresion.valid && this.FormOrdenTrabajoExtrusion.valid && this.FormOrdenTrabajo.valid){
      this.estadosService.srvObtenerListaPorNombreEstado(this.FormOrdenTrabajo.value.OT_Estado).subscribe(datos_estado => {
        for (let i = 0; i < datos_estado.length; i++) {
          estadoOT = datos_estado[i].estado_Id;

          let infoOT : any = {
            SedeCli_Id : cliente,
            Prod_Id : producto,
            Ot_CantidadKilos : cantidadKilos,
            Ot_CantidadUnidades : cantidadUnidades,
            Ot_MargenAdicional : margenAdicional,
            Ot_CantidadKilos_Margen : cantidadKilosMargen,
            Ot_CantidadUnidades_Margen : cantidadUnidadesMargen,
            Ot_FechaCreacion : fecha,
            Estado_Id : estadoOT,
            Usua_Id : usuarioCreador,
            PedExt_Id : pedidoID,
            Ot_Observacion : observacionOT,
            Ot_Cyrel : corteOT,
            Ot_Corte : cyrelOT,
            Mezcla_Id : mezclaId,
            UndMed_Id : presentacion,
            Ot_Hora : moment().format('H:mm:ss'),
          }
          this.ordenTrabajoService.srvGuardar(infoOT).subscribe(datos_ot => {
            //Inicio informacion OT_Extrusion
            this.formatoService.srvObtenerListaPorExtrusionNombres(formatoOT_Extrusion, materialOT_Extrusion, pigmentoOT_Extrusion, tratadoOT_Extrusion).subscribe(datos_extrusion => {
              for (let j = 0; j < datos_extrusion.length; j++) {
                let infoOTExt : any = {
                  Ot_Id : datos_ot.ot_Id,
                  Material_Id : datos_extrusion[j].material_Id,
                  Formato_Id : datos_extrusion[j].formato_Id,
                  Pigmt_Id : datos_extrusion[j].pigmt_Id,
                  Extrusion_Calibre : calibreOT_Extrusion,
                  Extrusion_Ancho1 : ancho1OT_Extrusion,
                  Extrusion_Ancho2 : ancho2OT_Extrusion,
                  Extrusion_Ancho3 : ancho3OT_Extrusion,
                  UndMed_Id : undMedOT_Extrusion,
                  Tratado_Id : datos_extrusion[j].tratado_Id,
                }
                setTimeout(() => {
                  this.otExtrusionServie.srvGuardar(infoOTExt).subscribe(datos_otExtrusion => { });
                }, 500);
              }
            });

            //Inicio informacion OT_Impresion
            this.servicioTintas.srvObtenerListaConsultaImpresion(tipoImpresion, tinta1Impresion, tinta2Impresion, tinta3Impresion, tinta4Impresion, tinta5Impresion, tinta6Impresion, tinta7Impresion, tinta8Impresion).subscribe(datos_impresion => {
              for (let j = 0; j < datos_impresion.length; j++) {
                let infoOTImp : any = {
                  Ot_Id : datos_ot.ot_Id,
                  TpImpresion_Id : datos_impresion[j].tpImpresion_Id,
                  Rodillo_Id : rodilloImpresion,
                  Pista_Id : pistaImpresion,
                  Tinta1_Id : datos_impresion[j].tinta_Id1,
                  Tinta2_Id : datos_impresion[j].tinta_Id2,
                  Tinta3_Id : datos_impresion[j].tinta_Id3,
                  Tinta4_Id : datos_impresion[j].tinta_Id4,
                  Tinta5_Id : datos_impresion[j].tinta_Id5,
                  Tinta6_Id : datos_impresion[j].tinta_Id6,
                  Tinta7_Id : datos_impresion[j].tinta_Id7,
                  Tinta8_Id : datos_impresion[j].tinta_Id8,
                }
                setTimeout(() => {
                  this.otImpresionService.srvGuardar(infoOTImp).subscribe(datos_otExtrusion => { });
                }, 500);
              }
            });

            //Inicio informacion OT_Laminado
            this.laminadoCapasService.srvObtenerListaPorConsultaLaminado(laminadoCapa1, laminadoCapa2, laminadoCapa3).subscribe(datos_capasLaminado => {
              for (let j = 0; j < datos_capasLaminado.length; j++) {
                let infoOTLam : any = {
                  OT_Id : datos_ot.ot_Id,
                  Capa_Id1 : datos_capasLaminado[j].lamCapa1_Id,
                  Capa_Id2 : datos_capasLaminado[j].lamCapa2_Id,
                  Capa_Id3 : datos_capasLaminado[j].lamCapa3_Id,
                  LamCapa_Calibre1 : laminadoCalibre1,
                  LamCapa_Calibre2 : laminadoCalibre2,
                  LamCapa_Calibre3 : laminadoCalibre3,
                  LamCapa_Cantidad1 : laminadoCantidad1,
                  LamCapa_Cantidad2 : laminadoCantidad2,
                  LamCapa_Cantidad3 : laminadoCantidad3,
                }
                this.otLaminadoService.srvGuardar(infoOTLam).subscribe(datos_laminado => { });
              }
            });

            setTimeout(() => {
              const Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 4500,
                timerProgressBar: true,
                didOpen: (toast) => {
                  toast.addEventListener('mouseenter', Swal.stopTimer)
                  toast.addEventListener('mouseleave', Swal.resumeTimer)
                }
              });
              Toast.fire({
                icon: 'success',
                title: 'Orden de trabajo creada satisfactoriamente'
              });
              this.pdfOrdenTrabajo(datos_ot.ot_Id);
              this.limpiarCampos();
            }, 2100);
          });
        }
      });
    }
  }

  // Funcion que creará el PDF de la Orden de trabajo
  pdfOrdenTrabajo(ot : number){
    this.ordenTrabajoService.srvObtenerListaPdfOTInsertada(ot).subscribe(datos_ot => {
      for (let i = 0; i < datos_ot.length; i++) {
        let FechaDatetime = datos_ot[i].ot_FechaCreacion;
        let FechaCreacionNueva = FechaDatetime.indexOf("T");
        let fechaCreacionFinal = FechaDatetime.substring(0, FechaCreacionNueva);

        let FechaEntregaDatetime = datos_ot[i].pedExt_FechaEntrega;
        let FechaEntregaNueva = FechaEntregaDatetime.indexOf("T");
        let fechaEntregaFinal = FechaEntregaDatetime.substring(0, FechaEntregaNueva);
        const pdfDefinicion : any = {
          info: {
            title: `${ot}`
          },
          pageSize: {
            width: 630,
            height: 760
          },
          content : [
            {
              text: `OT ${ot}`,
              alignment: 'right',
              style: 'ot',
            },
            {
              text: `PLASTICARIBE S.A.S 800188732-2.\n\nORDEN DE TRABAJO EXTRUSIÓN. ${fechaCreacionFinal}`,
              alignment: 'center',
              style: 'titulo',
            },
            '\n',
            {
              style: 'tablaEmpresa',
              table: {
                widths: [90, '*', 90, '*'],
                style: 'header',
                body: [
                  [
                    {
                      border: [true, true, false, false],
                      text: `Id Cliente`,
                      style: 'titulo',
                    },
                    {
                      border: [false, true, false, false],
                      text: `${datos_ot[i].cli_Id}`
                    },
                    {
                      border: [true, true, false, false],
                      text: `Id Producto`,
                      style: 'titulo',
                    },
                    {
                      border: [false, true, true, false],
                      text: `${datos_ot[i].prod_Id}`
                    },
                  ],
                  [
                    {
                      border: [true, false, false, true],
                      text: `Cliente`,
                      style: 'titulo',
                    },
                    {
                      border: [false, false, true, true],
                      text: `${datos_ot[i].cli_Nombre}`
                    },
                    {
                      border: [false, false, false, true],
                      text: `Producto`,
                      style: 'titulo',
                    },
                    {
                      border: [false, false, true, true],
                      text: `${datos_ot[i].prod_Nombre}`
                    },
                  ],
                ]
              },
              layout: {
                defaultBorder: false,
              },
              fontSize: 9,
            },
            '\n',
            {
              table : {
                widths : ['*', '*', '*', '*', '*'],
                style : '',
                body : [
                  [
                    {
                      border: [false, false, false, false],
                      fillColor: '#aaaaaa',
                      text: `Material`,
                      style: 'titulo',
                      alignment: 'center',
                    },
                    {
                      border: [false, false, false, false],
                      fillColor: '#aaaaaa',
                      text: `Cant. Bolsas`,
                      style: 'titulo',
                      alignment: 'center',
                    },
                    {
                      border: [false, false, false, false],
                      fillColor: '#aaaaaa',
                      text: `Cant. Kilos (Kg)`,
                      style: 'titulo',
                      alignment: 'center',
                    },
                    {
                      border: [false, false, false, false],
                      fillColor: '#aaaaaa',
                      text: `Presentación`,
                      style: 'titulo',
                      alignment: 'center',
                    },
                    {
                      border: [false, false, false, false],
                      fillColor: '#aaaaaa',
                      text: `Despachar`,
                      style: 'titulo',
                      alignment: 'center',
                    },
                  ],
                  [
                    {
                      border: [false, false, false, false],
                      text: `${datos_ot[i].material_Nombre}`,
                      alignment: 'center',
                    },
                    {
                      border: [false, false, false, false],
                      text: `${this.formatonumeros(datos_ot[i].ot_CantidadUnidades_Margen)}`,
                      alignment: 'center',
                    },
                    {
                      border: [false, false, false, false],
                      text: `${this.formatonumeros(datos_ot[i].ot_CantidadKilos_Margen)}`,
                      alignment: 'center',
                    },
                    {
                      border: [false, false, false, false],
                      text: `${datos_ot[i].presentacion_Nombre}`,
                      alignment: 'center',
                    },
                    {
                      border: [false, false, false, false],
                      text: `${fechaEntregaFinal}`,
                      alignment: 'center',
                    },
                  ]
                ]
              },
              layout: {
                defaultBorder: false,
              },
              fontSize: 9,
            },
            '\n \n',
            {
              table : {
                widths : ['*'],
                style : '',
                body : [
                  [
                    {
                      border: [false, false, false, false],
                      fillColor: '#aaaaaa',
                      text: `Materia Prima`,
                      alignment: 'center',
                      style: 'titulo',
                    }
                  ]
                ]
              },
              layout: {
                defaultBorder: false,
              },
              fontSize: 9,
            },
          // Mezclas
            '\n',
            {
              table : {
                widths : ['*', '*', '*'],
                style : '',
                body : [
                  [
                    {
                      border: [false, false, false, true],
                      text: `Material`,
                      alignment: 'center',
                      style: 'titulo',
                    },
                    {
                      border: [false, false, false, true],
                      text: `Cod Producto`,
                      alignment: 'center',
                      style: 'titulo',
                    },
                    {
                      border: [false, false, false, true],
                      text: `Kilos (Kg)`,
                      alignment: 'center',
                      style: 'titulo',
                    }
                  ],
                  [
                    {
                      border : [false, false, false, true],
                      table : {
                        widths : ['*'],
                        style : '',
                        body : [
                          [
                            {
                              border : [],
                              text : `CAPA UNICA:`,
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].mezcla_PorcentajeCapa1}`,
                            },
                          ],
                          [
                            {
                              border : [],
                              text : ``,
                            },
                          ]
                        ]
                      }
                    },
                    {
                      border : [false, false, false, true],
                      table : {
                        widths : ['*'],
                        style : '',
                        body : [
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].m1C1_nombre}`,
                              alignment: 'justify',
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].m2C1_nombre}`,
                              alignment: 'justify',
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].m3C1_nombre}`,
                              alignment: 'justify',
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].m4C1_nombre}`,
                              alignment: 'justify',
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].p1C1_Nombre}`,
                              alignment: 'justify',
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].p2C1_Nombre}`,
                              alignment: 'justify',
                            },
                          ]
                        ]
                      }
                    },
                    {
                      border : [false, false, false, true],
                      table : {
                        widths : ['*'],
                        style : '',
                        body : [
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].mezcla_PorcentajeMaterial1_Capa1}%`,
                              alignment: 'center',
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].mezcla_PorcentajeMaterial2_Capa1}%`,
                              alignment: 'center',
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].mezcla_PorcentajeMaterial3_Capa1}%`,
                              alignment: 'center',
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].mezcla_PorcentajeMaterial4_Capa1}%`,
                              alignment: 'center',
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].mezcla_PorcentajePigmto1_Capa1}%`,
                              alignment: 'center',
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].mezcla_PorcentajePigmto2_Capa1}%`,
                              alignment: 'center',
                            },
                          ]
                        ]
                      }
                    }
                  ],
                  [
                    {
                      border : [false, false, false, true],
                      table : {
                        widths : ['*'],
                        style : '',
                        body : [
                          [
                            {
                              border : [],
                              text : `CAPA INTERNA:`,
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].mezcla_PorcentajeCapa2}`,
                            },
                          ],
                          [
                            {
                              border : [],
                              text : ``,
                            },
                          ]
                        ]
                      }
                    },
                    {
                      border : [false, false, false, true],
                      table : {
                        widths : ['*'],
                        style : '',
                        body : [
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].m1C2_nombre}`,
                              alignment: 'justify',
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].m2C2_nombre}`,
                              alignment: 'justify',
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].m3C2_nombre}`,
                              alignment: 'justify',
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].m4C2_nombre}`,
                              alignment: 'justify',
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].p1C2_Nombre}`,
                              alignment: 'justify',
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].p2C2_Nombre}`,
                              alignment: 'justify',
                            },
                          ]
                        ]
                      }
                    },
                    {
                      border : [false, false, false, true],
                      table : {
                        widths : ['*'],
                        style : '',
                        body : [
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].mezcla_PorcentajeMaterial1_Capa2}%`,
                              alignment: 'center',
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].mezcla_PorcentajeMaterial2_Capa2}%`,
                              alignment: 'center',
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].mezcla_PorcentajeMaterial3_Capa2}%`,
                              alignment: 'center',
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].mezcla_PorcentajeMaterial4_Capa2}%`,
                              alignment: 'center',
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].mezcla_PorcentajePigmto1_Capa2}%`,
                              alignment: 'center',
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].mezcla_PorcentajePigmto2_Capa2}%`,
                              alignment: 'center',
                            },
                          ]
                        ]
                      }
                    }
                  ],
                  [
                    {
                      border : [false, false, false, true],
                      table : {
                        widths : ['*'],
                        style : '',
                        body : [
                          [
                            {
                              border : [],
                              text : `CAPA EXTERNA:`,
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].mezcla_PorcentajeCapa3}`,
                            },
                          ],
                          [
                            {
                              border : [],
                              text : ``,
                            },
                          ]
                        ]
                      }
                    },
                    {
                      border : [false, false, false, true],
                      table : {
                        widths : ['*'],
                        style : '',
                        body : [
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].m1C3_nombre}`,
                              alignment: 'justify',
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].m2C3_nombre}`,
                              alignment: 'justify',
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].m3C3_nombre}`,
                              alignment: 'justify',
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].m4C3_nombre}`,
                              alignment: 'justify',
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].p1C3_Nombre}`,
                              alignment: 'justify',
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].p2C3_Nombre}`,
                              alignment: 'justify',
                            },
                          ]
                        ]
                      }
                    },
                    {
                      border : [false, false, false, true],
                      table : {
                        widths : ['*'],
                        style : '',
                        body : [
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].mezcla_PorcentajeMaterial1_Capa3}%`,
                              alignment: 'center',
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].mezcla_PorcentajeMaterial2_Capa3}%`,
                              alignment: 'center',
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].mezcla_PorcentajeMaterial3_Capa3}%`,
                              alignment: 'center',
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].mezcla_PorcentajeMaterial4_Capa3}%`,
                              alignment: 'center',
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].mezcla_PorcentajePigmto1_Capa3}%`,
                              alignment: 'center',
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].mezcla_PorcentajePigmto2_Capa3}%`,
                              alignment: 'center',
                            },
                          ]
                        ]
                      }
                    }
                  ],

                ]
              },
              layout: {
                defaultBorder: false,
              },
              fontSize: 9,
            },
            '\n',
            {
              table : {
                widths : ['*'],
                style : '',
                body : [
                  [
                    {
                      border: [false, false, false, false],
                      text : `EXTRUSIÓN`,
                      alignment: 'center',
                      fillColor: '#aaaaaa',
                      style: 'titulo',
                    }
                  ]
                ]
              }
            },
            {
              table : {
                widths : ['*', '*', '*', '*', '*', '*', '*'],
                style : '',
                body : [
                  [
                    {
                      border: [false, false, false, false],
                      fillColor: '#eeeeee',
                      text: `Pigmento`,
                      alignment: 'center',
                      style : 'subtitulo',
                    },
                    {
                      border: [false, false, false, false],
                      fillColor: '#eeeeee',
                      text: `Formato`,
                      alignment: 'center',
                      style : 'subtitulo',
                    },
                    {
                      border: [false, false, false, false],
                      fillColor: '#eeeeee',
                      text: `Ancho`,
                      alignment: 'center',
                      style : 'subtitulo',
                    },
                    {
                      border: [false, false, false, false],
                      fillColor: '#eeeeee',
                      text: `Und Medida`,
                      alignment: 'center',
                      style : 'subtitulo',
                    },
                    {
                      border: [false, false, false, false],
                      fillColor: '#eeeeee',
                      text: `Calibre`,
                      alignment: 'center',
                      style : 'subtitulo',
                    },
                    {
                      border: [false, false, false, false],
                      fillColor: '#eeeeee',
                      text: `Peso MT \n(Min/Max)`,
                      alignment: 'center',
                      style : 'subtitulo',
                    },
                    {
                      border: [false, false, false, false],
                      fillColor: '#eeeeee',
                      text: `Tratado`,
                      alignment: 'center',
                      style : 'subtitulo',
                    }
                  ],
                  [
                    {
                      border: [false, false, false, false],
                      text: `${datos_ot[i].pigmt_Nombre}`,
                      alignment: 'center',
                    },
                    {
                      border: [false, false, false, false],
                      text: `${datos_ot[i].formato_Nombre}`,
                      alignment: 'center',
                    },
                    {
                      border: [false, false, false, false],
                      text: `${this.formatonumeros(datos_ot[i].extrusion_Ancho1)}   +   ${this.formatonumeros(datos_ot[i].extrusion_Ancho2)}   +   ${this.formatonumeros(datos_ot[i].extrusion_Ancho3)}`,
                      alignment: 'center',
                    },
                    {
                      border: [false, false, false, false],
                      text: `${datos_ot[i].undMed_Id}`,
                      alignment: 'center',
                    },
                    {
                      border: [false, false, false, false],
                      text: `${this.formatonumeros(datos_ot[i].extrusion_Calibre)}`,
                      alignment: 'center',
                    },
                    {
                      border: [false, false, false, false],
                      text: ``,
                      alignment: 'center',
                    },
                    {
                      border: [false, false, false, false],
                      text: `${datos_ot[i].tratado_Nombre}`,
                      alignment: 'center',
                    }
                  ]
                ]
              },
              layout: {
                defaultBorder: false,
              },
              fontSize: 9,
            },
            '\n',
            {
              table : {
                widths : ['*'],
                style : '',
                body : [
                  [
                    {
                      border : [true, true, true, false],
                      text : `Observación: `
                    }
                  ],
                  [
                    {
                      border : [true, false, true, true],
                      text : `${datos_ot[i].ot_Observacion}`
                    }
                  ]
                ]
              },
              layout: {
                defaultBorder: false,
              },
              fontSize: 10.5,
            },
            // Hoja 2
            {
              text: `OT ${ot}`,
              alignment: 'right',
              style: 'ot',
              pageBreak: 'before',
            },
            {
              text: `PLASTICARIBE S.A.S 800188732-2.\n\nORDEN DE TRABAJO. ${fechaCreacionFinal}`,
              alignment: 'center',
              style: 'titulo',
            },
            '\n',
            {
              style: 'tablaEmpresa',
              table: {
                widths: [90, '*', 90, '*'],
                style: 'header',
                body: [
                  [
                    {
                      border: [true, true, false, false],
                      text: `Id Cliente`,
                      style: 'titulo',
                    },
                    {
                      border: [false, true, false, false],
                      text: `${datos_ot[i].cli_Id}`
                    },
                    {
                      border: [true, true, false, false],
                      text: `Id Producto`,
                      style: 'titulo',
                    },
                    {
                      border: [false, true, true, false],
                      text: `${datos_ot[i].prod_Id}`
                    },
                  ],
                  [
                    {
                      border: [true, false, false, true],
                      text: `Cliente`,
                      style: 'titulo',
                    },
                    {
                      border: [false, false, true, true],
                      text: `${datos_ot[i].cli_Nombre}`
                    },
                    {
                      border: [false, false, false, true],
                      text: `Producto`,
                      style: 'titulo',
                    },
                    {
                      border: [false, false, true, true],
                      text: `${datos_ot[i].prod_Nombre}`
                    },
                  ],
                ]
              },
              layout: {
                defaultBorder: false,
              },
              fontSize: 9,
            },
            '\n',
            {
              table : {
                widths : ['*', '*', '*', '*', '*'],
                style : '',
                body : [
                  [
                    {
                      border: [false, false, false, false],
                      fillColor: '#aaaaaa',
                      text: `Material`,
                      style: 'titulo',
                      alignment: 'center',
                    },
                    {
                      border: [false, false, false, false],
                      fillColor: '#aaaaaa',
                      text: `Cant. Bolsas`,
                      style: 'titulo',
                      alignment: 'center',
                    },
                    {
                      border: [false, false, false, false],
                      fillColor: '#aaaaaa',
                      text: `Cant. Kilos (Kg)`,
                      style: 'titulo',
                      alignment: 'center',
                    },
                    {
                      border: [false, false, false, false],
                      fillColor: '#aaaaaa',
                      text: `Presentación`,
                      style: 'titulo',
                      alignment: 'center',
                    },
                    {
                      border: [false, false, false, false],
                      fillColor: '#aaaaaa',
                      text: `Despachar`,
                      style: 'titulo',
                      alignment: 'center',
                    },
                  ],
                  [
                    {
                      border: [false, false, false, false],
                      text: `${datos_ot[i].material_Nombre}`,
                      alignment: 'center',
                    },
                    {
                      border: [false, false, false, false],
                      text: `${this.formatonumeros(datos_ot[i].ot_CantidadUnidades_Margen)}`,
                      alignment: 'center',
                    },
                    {
                      border: [false, false, false, false],
                      text: `${this.formatonumeros(datos_ot[i].ot_CantidadKilos_Margen)}`,
                      alignment: 'center',
                    },
                    {
                      border: [false, false, false, false],
                      text: `${datos_ot[i].presentacion_Nombre}`,
                      alignment: 'center',
                    },
                    {
                      border: [false, false, false, false],
                      text: `${fechaEntregaFinal}`,
                      alignment: 'center',
                    },
                  ]
                ]
              },
              layout: {
                defaultBorder: false,
              },
              fontSize: 9,
            },
            '\n',
            // Procesos
            {
              table : {
                widths : ['*', 20, '*'],
                style : '',
                body : [
                  [
                    // Extrusion
                    {
                      table : {
                        widths : ['*', '*', '*'],
                        style : '',
                        body : [
                          [
                            {
                              colSpan : 3,
                              text : `EXTRUSIÓN`,
                              alignment: 'center',
                              fillColor: '#aaaaaa',
                              style: 'titulo',
                            },
                            { },
                            { }
                          ],
                          [
                            {
                              border : [],
                              text : `Pigmento: `,
                            },
                            {
                              border : [],
                              text : `${datos_ot[i].pigmt_Nombre}`,
                            },
                            {
                              border : [],
                              text : ``,
                            }
                          ],
                          [
                            {
                              border : [],
                              text : `Formato: `,
                            },
                            {
                              border : [],
                              text : `${datos_ot[i].formato_Nombre}`,
                            },
                            {
                              border : [],
                              text : ``,
                            }
                          ],
                          [
                            {
                              border : [],
                              text : `Calibre: `,
                            },
                            {
                              border : [],
                              text : `${this.formatonumeros(datos_ot[i].extrusion_Calibre)}`,
                            },
                            {
                              border : [],
                              text : ``,
                            }
                          ],
                          [
                            {
                              border : [],
                              text : `Unidad Medida: `,
                            },
                            {
                              border : [],
                              text : `${datos_ot[i].undMed_Id}`,
                            },
                            {
                              border : [],
                              text : ``,
                            }
                          ],
                          [
                            {
                              border : [],
                              text : `ANCHO`,
                            },
                            {
                              border : [],
                              text : `${this.formatonumeros(datos_ot[i].extrusion_Ancho1)}       +       ${this.formatonumeros(datos_ot[i].extrusion_Ancho2)}       +       `,
                            },
                            {
                              border : [],
                              text : `       ${this.formatonumeros(datos_ot[i].extrusion_Ancho3)}`,
                            }
                          ],
                          // [
                          //   {
                          //     border : [],
                          //     text : `${this.formatonumeros(datos_ot[i].extrusion_Ancho1)}`,
                          //     alignment: 'right',
                          //   },
                          //   {
                          //     border : [],
                          //     text : `+           ${this.formatonumeros(datos_ot[i].extrusion_Ancho2)}           +`,
                          //     alignment: 'center',
                          //   },
                          //   {
                          //     border : [],
                          //     text : `${this.formatonumeros(datos_ot[i].extrusion_Ancho3)}`,
                          //     alignment: 'left',
                          //   }
                          // ],
                          [
                            {
                              border : [],
                              text : `Peso MT (Min/Max): `,
                            },
                            {
                              border : [false, false, false, false],
                              text : ``,
                            },
                            {
                              border : [false, false, false, false],
                              text : ``,
                            }
                          ],
                          [
                            {
                              border : [],
                              text : `Tratado Caras: `,
                            },
                            {
                              border : [],
                              text : `${datos_ot[i].tratado_Nombre}`,
                            },
                            {
                              border : [],
                              text : ``,
                            }
                          ],
                        ]
                      }
                    },
                    { },
                    // Laminado
                    {
                      table : {
                        widths : ['*', '*', '*'],
                        style : '',
                        body : [
                          [
                            {
                              colSpan : 3,
                              text : `LAMINADO`,
                              alignment: 'center',
                              fillColor: '#aaaaaa',
                              style: 'titulo',
                            },
                            {
                              border : [],
                              text : ``,
                            },
                            {
                              border : [],
                              text : ``,
                            }
                          ],
                          [
                            {
                              border : [],
                              text : `CAPA`,
                              bold : true,
                            },
                            {
                              border : [],
                              text : `CALIBRE`,
                              bold : true,
                            },
                            {
                              border : [],
                              text : `CANTIDAD`,
                              bold : true,
                            }
                          ],
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].lamCapa1_Nombre}`,
                            },
                            {
                              border : [],
                              text : `${datos_ot[i].lamCapa_Calibre1}`,
                            },
                            {
                              border : [],
                              text : `${datos_ot[i].lamCapa_Cantidad1}`,
                            }
                          ],
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].lamCapa2_Nombre}`,
                            },
                            {
                              border : [],
                              text : `${datos_ot[i].lamCapa_Calibre2}`,
                            },
                            {
                              border : [],
                              text : `${datos_ot[i].lamCapa_Cantidad2}`,
                            }
                          ],
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].lamCapa3_Nombre}`,
                            },
                            {
                              border : [],
                              text : `${datos_ot[i].lamCapa_Calibre3}`,
                            },
                            {
                              border : [],
                              text : `${datos_ot[i].lamCapa_Cantidad3}`,
                            }
                          ]
                        ]
                      }
                    }
                  ],
                  [
                    { },
                    { },
                    { }
                  ],
                  [
                    { },
                    { },
                    { }
                  ],
                  [
                    // Impresion
                    {
                      table : {
                        widths : ['*', '*'],
                        style : '',
                        body : [
                          [
                            {
                              colSpan : 2,
                              text : `IMPRESIÓN`,
                              alignment: 'center',
                              fillColor: '#aaaaaa',
                              style: 'titulo',
                            },
                            { },
                          ],
                          [
                            {
                              border : [],
                              text : `Tipo Impresión: `,
                            },
                            {
                              border : [],
                              text : `${datos_ot[i].tpImpresion_Nombre}`,
                            }
                          ],
                          [
                            {
                              border : [],
                              text : `Rodillo N°: `,
                            },
                            {
                              border : [],
                              text : `${datos_ot[i].rodillo_Id}`,
                            }
                          ],
                          [
                            {
                              border : [],
                              text : `N° de Pista: `,
                            },
                            {
                              border : [],
                              text : `${datos_ot[i].pista_Id}`,
                            }
                          ],
                          [
                            {
                              border : [],
                              text : `Tinta 1: `,
                            },
                            {
                              border : [],
                              text : `${datos_ot[i].tinta1_Nombre}`,
                            }
                          ],
                          [
                            {
                              border : [],
                              text : `Tinta 2: `,
                            },
                            {
                              border : [],
                              text : `${datos_ot[i].tinta2_Nombre}`,
                            }
                          ],
                          [
                            {
                              border : [],
                              text : `Tinta 3: `,
                            },
                            {
                              border : [],
                              text : `${datos_ot[i].tinta3_Nombre}`,
                            }
                          ],
                          [
                            {
                              border : [],
                              text : `Tinta 4: `,
                            },
                            {
                              border : [],
                              text : `${datos_ot[i].tinta4_Nombre}`,
                            }
                          ],
                          [
                            {
                              border : [],
                              text : `Tinta 5: `,
                            },
                            {
                              border : [],
                              text : `${datos_ot[i].tinta5_Nombre}`,
                            }
                          ],
                          [
                            {
                              border : [],
                              text : `Tinta 6: `,
                            },
                            {
                              border : [],
                              text : `${datos_ot[i].tinta6_Nombre}`,
                            }
                          ],
                          [
                            {
                              border : [],
                              text : `Tinta 7: `,
                            },
                            {
                              border : [],
                              text : `${datos_ot[i].tinta7_Nombre}`,
                            }
                          ],
                          [
                            {
                              border : [],
                              text : `Tinta 8: `,
                            },
                            {
                              border : [],
                              text : `${datos_ot[i].tinta8_Nombre}`,
                            }
                          ],
                        ]
                      }
                    },
                    { },
                    // Producto Terimnado
                    {
                      table : {
                        widths : ['*', '*', '*'],
                        style : '',
                        body : [
                          [
                            {
                              colSpan : 3,
                              text : `PRODUCTO TERMINADO`,
                              alignment: 'center',
                              fillColor: '#aaaaaa',
                              style: 'titulo',
                            },
                            { },
                            { },
                          ],
                          [
                            {
                              border : [],
                              text : `Formato Bolsa: `,
                              alignment: 'center',
                            },
                            {
                              border : [],
                              text : `${datos_ot[i].tpProd_Nombre}`,
                              alignment: 'center',
                            },
                            {
                              border : [],
                              text : ``,
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `Ancho`,
                              alignment: 'right',
                              bold : true,
                            },
                            {
                              border : [],
                              text : `Largo`,
                              alignment: 'center',
                              bold : true,
                            },
                            {
                              border : [],
                              text : `Fuelle`,
                              alignment: 'left',
                              bold : true,
                            },
                          ],
                          [
                            {
                              border : [],
                              colspan : 3,
                              text : `${this.formatonumeros(datos_ot[i].prod_Ancho)}`,
                              alignment: 'right',
                            },
                            {
                              border : [],
                              colspan : 3,
                              text : `x          ${this.formatonumeros(datos_ot[i].prod_Largo)}          x`,
                              alignment: 'center',
                            },
                            {
                              border : [],
                              colspan : 3,
                              text : `${this.formatonumeros(datos_ot[i].prod_Fuelle)}               ${datos_ot[i].undMedACF}`,
                              alignment: 'left',
                            },
                          ],
                          [
                            {
                              border : [],
                              text : ``,
                            },
                            {
                              border : [],
                              text : ``,
                            },
                            {
                              border : [],
                              text : ``,
                            },
                          ],
                          [
                            {
                              border : [],
                              text : ``,
                            },
                            {
                              border : [],
                              text : ``,
                            },
                            {
                              border : [],
                              text : ``,
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `Sellado: `,
                            },
                            {
                              border : [],
                              text : `${datos_ot[i].tpSellados_Nombre}`,
                            },
                            {
                              border : [],
                              text : ``,
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `Margen: `,
                            },
                            {
                              border : [],
                              text : `${datos_ot[i].ot_MargenAdicional}`,
                            },
                            {
                              border : [],
                              text : ``,
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `Peso Millar: `,
                            },
                            {
                              border : [],
                              text : `${datos_ot[i].prod_Peso_Millar}`,
                            },
                            {
                              border : [],
                              text : ``,
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `Cant. x Paquete: `,
                            },
                            {
                              border : [],
                              text : `${datos_ot[i].prod_CantBolsasPaquete}`,
                            },
                            {
                              border : [],
                              text : ``,
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `Cant. x Bulto: `,
                            },
                            {
                              border : [],
                              text : `${datos_ot[i].prod_CantBolsasBulto}`,
                            },
                            {
                              border : [],
                              text : ``,
                            },
                          ]
                        ]
                      }
                    },
                  ]
                ]
              },
              layout: {
                defaultBorder: false,
              },
              fontSize: 9,
            },
            '\n\n\n',
            {
              table : {
                widths : ['*'],
                style : '',
                body : [
                  [
                    {
                      border : [true, true, true, false],
                      text : `Observación: `
                    }
                  ],
                  [
                    {
                      border : [true, false, true, true],
                      text : `${datos_ot[i].ot_Observacion}`
                    }
                  ]
                ]
              },
              layout: {
                defaultBorder: false,
              },
              fontSize: 10.5,
            }
          ],
          styles: {
            header: {
              fontSize: 7,
              bold: true
            },
            titulo: {
              fontSize: 11,
              bold: true
            },
            ot: {
              fontSize: 13,
              bold: true
            },
            subtitulo : {
              fontSize : 10,
              bold : true
            }
          }
        }
        const pdf = pdfMake.createPdf(pdfDefinicion);
        pdf.open();
      }
    });
  }

  // Funcion que consultará una orden de trabajo para crearle un PDF
  consultarOTCreada(){
    let ot : number = this.FormOrdenTrabajo.value.OT_Id;
    this.ordenTrabajoService.srvObtenerListaPdfOTInsertada(ot).subscribe(datos_ot => {
      for (let i = 0; i < datos_ot.length; i++) {
        let FechaDatetime = datos_ot[i].ot_FechaCreacion;
        let FechaCreacionNueva = FechaDatetime.indexOf("T");
        let fechaCreacionFinal = FechaDatetime.substring(0, FechaCreacionNueva);

        let FechaEntregaDatetime = datos_ot[i].pedExt_FechaEntrega;
        let FechaEntregaNueva = FechaEntregaDatetime.indexOf("T");
        let fechaEntregaFinal = FechaEntregaDatetime.substring(0, FechaEntregaNueva);
        const pdfDefinicion : any = {
          info: {
            title: `${ot}`
          },
          pageSize: {
            width: 630,
            height: 760
          },
          content : [
            {
              text: `OT ${ot}`,
              alignment: 'right',
              style: 'ot',
            },
            {
              text: `Plasticaribe S.A.S 800188732-2\n\nORDEN DE TRABAJO. ${fechaCreacionFinal}`,
              alignment: 'center',
              style: 'titulo',
            },
            '\n',
            {
              style: 'tablaEmpresa',
              table: {
                widths: [90, '*', 90, '*'],
                style: 'header',
                body: [
                  [
                    {
                      border: [true, true, false, false],
                      text: `Id Cliente`,
                      style: 'titulo',
                    },
                    {
                      border: [false, true, false, false],
                      text: `${datos_ot[i].cli_Id}`
                    },
                    {
                      border: [true, true, false, false],
                      text: `Id Producto`,
                      style: 'titulo',
                    },
                    {
                      border: [false, true, true, false],
                      text: `${datos_ot[i].prod_Id}`
                    },
                  ],
                  [
                    {
                      border: [true, false, false, true],
                      text: `Cliente`,
                      style: 'titulo',
                    },
                    {
                      border: [false, false, true, true],
                      text: `${datos_ot[i].cli_Nombre}`
                    },
                    {
                      border: [false, false, false, true],
                      text: `Producto`,
                      style: 'titulo',
                    },
                    {
                      border: [false, false, true, true],
                      text: `${datos_ot[i].prod_Nombre}`
                    },
                  ],
                ]
              },
              layout: {
                defaultBorder: false,
              },
              fontSize: 9,
            },
            '\n',
            {
              table : {
                widths : ['*', '*', '*', '*', '*'],
                style : '',
                body : [
                  [
                    {
                      border: [false, false, false, false],
                      fillColor: '#aaaaaa',
                      text: `Material`,
                      style: 'titulo',
                      alignment: 'center',
                    },
                    {
                      border: [false, false, false, false],
                      fillColor: '#aaaaaa',
                      text: `Cant. Bolsas`,
                      style: 'titulo',
                      alignment: 'center',
                    },
                    {
                      border: [false, false, false, false],
                      fillColor: '#aaaaaa',
                      text: `Cant. Kilos (Kg)`,
                      style: 'titulo',
                      alignment: 'center',
                    },
                    {
                      border: [false, false, false, false],
                      fillColor: '#aaaaaa',
                      text: `Presentación`,
                      style: 'titulo',
                      alignment: 'center',
                    },
                    {
                      border: [false, false, false, false],
                      fillColor: '#aaaaaa',
                      text: `Despachar`,
                      style: 'titulo',
                      alignment: 'center',
                    },
                  ],
                  [
                    {
                      border: [false, false, false, false],
                      text: `${datos_ot[i].material_Nombre}`,
                      alignment: 'center',
                    },
                    {
                      border: [false, false, false, false],
                      text: `${this.formatonumeros(datos_ot[i].ot_CantidadUnidades_Margen)}`,
                      alignment: 'center',
                    },
                    {
                      border: [false, false, false, false],
                      text: `${this.formatonumeros(datos_ot[i].ot_CantidadKilos_Margen)}`,
                      alignment: 'center',
                    },
                    {
                      border: [false, false, false, false],
                      text: `${datos_ot[i].presentacion_Nombre}`,
                      alignment: 'center',
                    },
                    {
                      border: [false, false, false, false],
                      text: `${fechaEntregaFinal}`,
                      alignment: 'center',
                    },
                  ]
                ]
              },
              layout: {
                defaultBorder: false,
              },
              fontSize: 9,
            },
            '\n \n',
            {
              table : {
                widths : ['*'],
                style : '',
                body : [
                  [
                    {
                      border: [false, false, false, false],
                      fillColor: '#aaaaaa',
                      text: `Materia Prima`,
                      alignment: 'center',
                      style: 'titulo',
                    }
                  ]
                ]
              },
              layout: {
                defaultBorder: false,
              },
              fontSize: 9,
            },
          // Mezclas
            '\n',
            {
              table : {
                widths : ['*', '*', '*'],
                style : '',
                body : [
                  [
                    {
                      border: [false, false, false, true],
                      text: `Material`,
                      alignment: 'center',
                      style: 'titulo',
                    },
                    {
                      border: [false, false, false, true],
                      text: `Cod Producto`,
                      alignment: 'center',
                      style: 'titulo',
                    },
                    {
                      border: [false, false, false, true],
                      text: `Kilos (Kg)`,
                      alignment: 'center',
                      style: 'titulo',
                    }
                  ],
                  [
                    {
                      border : [false, false, false, true],
                      table : {
                        widths : ['*'],
                        style : '',
                        body : [
                          [
                            {
                              border : [],
                              text : `CAPA UNICA:`,
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].mezcla_PorcentajeCapa1}`,
                            },
                          ],
                          [
                            {
                              border : [],
                              text : ``,
                            },
                          ]
                        ]
                      }
                    },
                    {
                      border : [false, false, false, true],
                      table : {
                        widths : ['*'],
                        style : '',
                        body : [
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].m1C1_nombre}`,
                              alignment: 'justify',
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].m2C1_nombre}`,
                              alignment: 'justify',
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].m3C1_nombre}`,
                              alignment: 'justify',
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].m4C1_nombre}`,
                              alignment: 'justify',
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].p1C1_Nombre}`,
                              alignment: 'justify',
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].p2C1_Nombre}`,
                              alignment: 'justify',
                            },
                          ]
                        ]
                      }
                    },
                    {
                      border : [false, false, false, true],
                      table : {
                        widths : ['*'],
                        style : '',
                        body : [
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].mezcla_PorcentajeMaterial1_Capa1}%`,
                              alignment: 'center',
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].mezcla_PorcentajeMaterial2_Capa1}%`,
                              alignment: 'center',
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].mezcla_PorcentajeMaterial3_Capa1}%`,
                              alignment: 'center',
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].mezcla_PorcentajeMaterial4_Capa1}%`,
                              alignment: 'center',
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].mezcla_PorcentajePigmto1_Capa1}%`,
                              alignment: 'center',
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].mezcla_PorcentajePigmto2_Capa1}%`,
                              alignment: 'center',
                            },
                          ]
                        ]
                      }
                    }
                  ],
                  [
                    {
                      border : [false, false, false, true],
                      table : {
                        widths : ['*'],
                        style : '',
                        body : [
                          [
                            {
                              border : [],
                              text : `CAPA INTERNA:`,
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].mezcla_PorcentajeCapa2}`,
                            },
                          ],
                          [
                            {
                              border : [],
                              text : ``,
                            },
                          ]
                        ]
                      }
                    },
                    {
                      border : [false, false, false, true],
                      table : {
                        widths : ['*'],
                        style : '',
                        body : [
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].m1C2_nombre}`,
                              alignment: 'justify',
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].m2C2_nombre}`,
                              alignment: 'justify',
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].m3C2_nombre}`,
                              alignment: 'justify',
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].m4C2_nombre}`,
                              alignment: 'justify',
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].p1C2_Nombre}`,
                              alignment: 'justify',
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].p2C2_Nombre}`,
                              alignment: 'justify',
                            },
                          ]
                        ]
                      }
                    },
                    {
                      border : [false, false, false, true],
                      table : {
                        widths : ['*'],
                        style : '',
                        body : [
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].mezcla_PorcentajeMaterial1_Capa2}%`,
                              alignment: 'center',
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].mezcla_PorcentajeMaterial2_Capa2}%`,
                              alignment: 'center',
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].mezcla_PorcentajeMaterial3_Capa2}%`,
                              alignment: 'center',
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].mezcla_PorcentajeMaterial4_Capa2}%`,
                              alignment: 'center',
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].mezcla_PorcentajePigmto1_Capa2}%`,
                              alignment: 'center',
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].mezcla_PorcentajePigmto2_Capa2}%`,
                              alignment: 'center',
                            },
                          ]
                        ]
                      }
                    }
                  ],
                  [
                    {
                      border : [false, false, false, true],
                      table : {
                        widths : ['*'],
                        style : '',
                        body : [
                          [
                            {
                              border : [],
                              text : `CAPA EXTERNA:`,
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].mezcla_PorcentajeCapa3}`,
                            },
                          ],
                          [
                            {
                              border : [],
                              text : ``,
                            },
                          ]
                        ]
                      }
                    },
                    {
                      border : [false, false, false, true],
                      table : {
                        widths : ['*'],
                        style : '',
                        body : [
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].m1C3_nombre}`,
                              alignment: 'justify',
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].m2C3_nombre}`,
                              alignment: 'justify',
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].m3C3_nombre}`,
                              alignment: 'justify',
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].m4C3_nombre}`,
                              alignment: 'justify',
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].p1C3_Nombre}`,
                              alignment: 'justify',
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].p2C3_Nombre}`,
                              alignment: 'justify',
                            },
                          ]
                        ]
                      }
                    },
                    {
                      border : [false, false, false, true],
                      table : {
                        widths : ['*'],
                        style : '',
                        body : [
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].mezcla_PorcentajeMaterial1_Capa3}%`,
                              alignment: 'center',
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].mezcla_PorcentajeMaterial2_Capa3}%`,
                              alignment: 'center',
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].mezcla_PorcentajeMaterial3_Capa3}%`,
                              alignment: 'center',
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].mezcla_PorcentajeMaterial4_Capa3}%`,
                              alignment: 'center',
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].mezcla_PorcentajePigmto1_Capa3}%`,
                              alignment: 'center',
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].mezcla_PorcentajePigmto2_Capa3}%`,
                              alignment: 'center',
                            },
                          ]
                        ]
                      }
                    }
                  ],

                ]
              },
              layout: {
                defaultBorder: false,
              },
              fontSize: 9,
            },
            {
              text: `OT ${ot}`,
              alignment: 'right',
              style: 'ot',
              pageBreak: 'before',
            },
            {
              text: `Plasticaribe S.A.S 800188732-2\nORDEN DE TRABAJO. ${fechaCreacionFinal}`,
              alignment: 'center',
              style: 'titulo',
            },
            '\n',
            {
              style: 'tablaEmpresa',
              table: {
                widths: [90, '*', 90, '*'],
                style: 'header',
                body: [
                  [
                    {
                      border: [true, true, false, false],
                      text: `Id Cliente`,
                      style: 'titulo',
                    },
                    {
                      border: [false, true, false, false],
                      text: `${datos_ot[i].cli_Id}`
                    },
                    {
                      border: [true, true, false, false],
                      text: `Id Producto`,
                      style: 'titulo',
                    },
                    {
                      border: [false, true, true, false],
                      text: `${datos_ot[i].prod_Id}`
                    },
                  ],
                  [
                    {
                      border: [true, false, false, true],
                      text: `Cliente`,
                      style: 'titulo',
                    },
                    {
                      border: [false, false, true, true],
                      text: `${datos_ot[i].cli_Nombre}`
                    },
                    {
                      border: [false, false, false, true],
                      text: `Producto`,
                      style: 'titulo',
                    },
                    {
                      border: [false, false, true, true],
                      text: `${datos_ot[i].prod_Nombre}`
                    },
                  ],
                ]
              },
              layout: {
                defaultBorder: false,
              },
              fontSize: 9,
            },
            '\n',
            {
              table : {
                widths : ['*', '*', '*', '*', '*'],
                style : '',
                body : [
                  [
                    {
                      border: [false, false, false, false],
                      fillColor: '#aaaaaa',
                      text: `Material`,
                      style: 'titulo',
                      alignment: 'center',
                    },
                    {
                      border: [false, false, false, false],
                      fillColor: '#aaaaaa',
                      text: `Cant. Bolsas`,
                      style: 'titulo',
                      alignment: 'center',
                    },
                    {
                      border: [false, false, false, false],
                      fillColor: '#aaaaaa',
                      text: `Cant. Kilos (Kg)`,
                      style: 'titulo',
                      alignment: 'center',
                    },
                    {
                      border: [false, false, false, false],
                      fillColor: '#aaaaaa',
                      text: `Presentación`,
                      style: 'titulo',
                      alignment: 'center',
                    },
                    {
                      border: [false, false, false, false],
                      fillColor: '#aaaaaa',
                      text: `Despachar`,
                      style: 'titulo',
                      alignment: 'center',
                    },
                  ],
                  [
                    {
                      border: [false, false, false, false],
                      text: `${datos_ot[i].material_Nombre}`,
                      alignment: 'center',
                    },
                    {
                      border: [false, false, false, false],
                      text: `${this.formatonumeros(datos_ot[i].ot_CantidadUnidades_Margen)}`,
                      alignment: 'center',
                    },
                    {
                      border: [false, false, false, false],
                      text: `${this.formatonumeros(datos_ot[i].ot_CantidadKilos_Margen)}`,
                      alignment: 'center',
                    },
                    {
                      border: [false, false, false, false],
                      text: `${datos_ot[i].presentacion_Nombre}`,
                      alignment: 'center',
                    },
                    {
                      border: [false, false, false, false],
                      text: `${fechaEntregaFinal}`,
                      alignment: 'center',
                    },
                  ]
                ]
              },
              layout: {
                defaultBorder: false,
              },
              fontSize: 9,
            },
            '\n',
            {
              table : {
                widths : ['*', 20, '*'],
                style : '',
                body : [
                  [
                    // Extrusion
                    {
                      table : {
                        widths : ['*', '*', '*'],
                        style : '',
                        body : [
                          [
                            {
                              colSpan : 3,
                              text : `EXTRUSIÓN`,
                              alignment: 'center',
                              fillColor: '#aaaaaa',
                              style: 'titulo',
                            },
                            { },
                            { }
                          ],
                          [
                            {
                              border : [],
                              text : `Pigmento: `,
                            },
                            {
                              border : [],
                              text : `${datos_ot[i].pigmt_Nombre}`,
                            },
                            {
                              border : [],
                              text : ``,
                            }
                          ],
                          [
                            {
                              border : [],
                              text : `Formato: `,
                            },
                            {
                              border : [],
                              text : `${datos_ot[i].formato_Nombre}`,
                            },
                            {
                              border : [],
                              text : ``,
                            }
                          ],
                          [
                            {
                              border : [],
                              text : `Calibre: `,
                            },
                            {
                              border : [],
                              text : `${this.formatonumeros(datos_ot[i].extrusion_Calibre)}`,
                            },
                            {
                              border : [],
                              text : ``,
                            }
                          ],
                          [
                            {
                              border : [],
                              text : `Unidad Medida: `,
                            },
                            {
                              border : [],
                              text : `${datos_ot[i].undMed_Id}`,
                            },
                            {
                              border : [],
                              text : ``,
                            }
                          ],
                          [
                            {
                              border : [],
                              text : `ANCHO`,
                            },
                            {
                              border : [],
                              text : `${this.formatonumeros(datos_ot[i].extrusion_Ancho1)}       +       ${this.formatonumeros(datos_ot[i].extrusion_Ancho2)}       +       `,
                            },
                            {
                              border : [],
                              text : `       ${this.formatonumeros(datos_ot[i].extrusion_Ancho3)}`,
                            }
                          ],
                          // [
                          //   {
                          //     border : [],
                          //     text : `${this.formatonumeros(datos_ot[i].extrusion_Ancho1)}`,
                          //     alignment: 'right',
                          //   },
                          //   {
                          //     border : [],
                          //     text : `+           ${this.formatonumeros(datos_ot[i].extrusion_Ancho2)}           +`,
                          //     alignment: 'center',
                          //   },
                          //   {
                          //     border : [],
                          //     text : `${this.formatonumeros(datos_ot[i].extrusion_Ancho3)}`,
                          //     alignment: 'left',
                          //   }
                          // ],
                          [
                            {
                              border : [],
                              text : `Peso MT (Min/Max): `,
                            },
                            {
                              border : [false, false, false, false],
                              text : ``,
                            },
                            {
                              border : [false, false, false, false],
                              text : ``,
                            }
                          ],
                          [
                            {
                              border : [],
                              text : `Tratado Caras: `,
                            },
                            {
                              border : [],
                              text : `${datos_ot[i].tratado_Nombre}`,
                            },
                            {
                              border : [],
                              text : ``,
                            }
                          ],
                        ]
                      }
                    },
                    { },
                    // Laminado
                    {
                      table : {
                        widths : ['*', '*', '*'],
                        style : '',
                        body : [
                          [
                            {
                              colSpan : 3,
                              text : `LAMINADO`,
                              alignment: 'center',
                              fillColor: '#aaaaaa',
                              style: 'titulo',
                            },
                            {
                              border : [],
                              text : ``,
                            },
                            {
                              border : [],
                              text : ``,
                            }
                          ],
                          [
                            {
                              border : [],
                              text : `CAPA`,
                              bold : true,
                            },
                            {
                              border : [],
                              text : `CALIBRE`,
                              bold : true,
                            },
                            {
                              border : [],
                              text : `CANTIDAD`,
                              bold : true,
                            }
                          ],
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].lamCapa1_Nombre}`,
                            },
                            {
                              border : [],
                              text : `${datos_ot[i].lamCapa_Calibre1}`,
                            },
                            {
                              border : [],
                              text : `${datos_ot[i].lamCapa_Cantidad1}`,
                            }
                          ],
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].lamCapa2_Nombre}`,
                            },
                            {
                              border : [],
                              text : `${datos_ot[i].lamCapa_Calibre2}`,
                            },
                            {
                              border : [],
                              text : `${datos_ot[i].lamCapa_Cantidad2}`,
                            }
                          ],
                          [
                            {
                              border : [],
                              text : `${datos_ot[i].lamCapa3_Nombre}`,
                            },
                            {
                              border : [],
                              text : `${datos_ot[i].lamCapa_Calibre3}`,
                            },
                            {
                              border : [],
                              text : `${datos_ot[i].lamCapa_Cantidad3}`,
                            }
                          ]
                        ]
                      }
                    }
                  ],
                  [
                    { },
                    { },
                    { }
                  ],
                  [
                    { },
                    { },
                    { }
                  ],
                  [
                    // Impresion
                    {
                      table : {
                        widths : ['*', '*'],
                        style : '',
                        body : [
                          [
                            {
                              colSpan : 2,
                              text : `IMPRESIÓN`,
                              alignment: 'center',
                              fillColor: '#aaaaaa',
                              style: 'titulo',
                            },
                            { },
                          ],
                          [
                            {
                              border : [],
                              text : `Tipo Impresión: `,
                            },
                            {
                              border : [],
                              text : `${datos_ot[i].tpImpresion_Nombre}`,
                            }
                          ],
                          [
                            {
                              border : [],
                              text : `Rodillo N°: `,
                            },
                            {
                              border : [],
                              text : `${datos_ot[i].rodillo_Id}`,
                            }
                          ],
                          [
                            {
                              border : [],
                              text : `N° de Pista: `,
                            },
                            {
                              border : [],
                              text : `${datos_ot[i].pista_Id}`,
                            }
                          ],
                          [
                            {
                              border : [],
                              text : `Tinta 1: `,
                            },
                            {
                              border : [],
                              text : `${datos_ot[i].tinta1_Nombre}`,
                            }
                          ],
                          [
                            {
                              border : [],
                              text : `Tinta 2: `,
                            },
                            {
                              border : [],
                              text : `${datos_ot[i].tinta2_Nombre}`,
                            }
                          ],
                          [
                            {
                              border : [],
                              text : `Tinta 3: `,
                            },
                            {
                              border : [],
                              text : `${datos_ot[i].tinta3_Nombre}`,
                            }
                          ],
                          [
                            {
                              border : [],
                              text : `Tinta 4: `,
                            },
                            {
                              border : [],
                              text : `${datos_ot[i].tinta4_Nombre}`,
                            }
                          ],
                          [
                            {
                              border : [],
                              text : `Tinta 5: `,
                            },
                            {
                              border : [],
                              text : `${datos_ot[i].tinta5_Nombre}`,
                            }
                          ],
                          [
                            {
                              border : [],
                              text : `Tinta 6: `,
                            },
                            {
                              border : [],
                              text : `${datos_ot[i].tinta6_Nombre}`,
                            }
                          ],
                          [
                            {
                              border : [],
                              text : `Tinta 7: `,
                            },
                            {
                              border : [],
                              text : `${datos_ot[i].tinta7_Nombre}`,
                            }
                          ],
                          [
                            {
                              border : [],
                              text : `Tinta 8: `,
                            },
                            {
                              border : [],
                              text : `${datos_ot[i].tinta8_Nombre}`,
                            }
                          ],
                        ]
                      }
                    },
                    { },
                    // Producto Terimnado
                    {
                      table : {
                        widths : ['*', '*', '*'],
                        style : '',
                        body : [
                          [
                            {
                              colSpan : 3,
                              text : `PRODUCTO TERMINADO`,
                              alignment: 'center',
                              fillColor: '#aaaaaa',
                              style: 'titulo',
                            },
                            { },
                            { },
                          ],
                          [
                            {
                              border : [],
                              text : `Formato Bolsa: `,
                              alignment: 'center',
                            },
                            {
                              border : [],
                              text : `${datos_ot[i].tpProd_Nombre}`,
                              alignment: 'center',
                            },
                            {
                              border : [],
                              text : ``,
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `Ancho`,
                              alignment: 'right',
                              bold : true,
                            },
                            {
                              border : [],
                              text : `Largo`,
                              alignment: 'center',
                              bold : true,
                            },
                            {
                              border : [],
                              text : `Fuelle`,
                              alignment: 'left',
                              bold : true,
                            },
                          ],
                          [
                            {
                              border : [],
                              colspan : 3,
                              text : `${this.formatonumeros(datos_ot[i].prod_Ancho)}`,
                              alignment: 'right',
                            },
                            {
                              border : [],
                              colspan : 3,
                              text : `x          ${this.formatonumeros(datos_ot[i].prod_Largo)}          x`,
                              alignment: 'center',
                            },
                            {
                              border : [],
                              colspan : 3,
                              text : `${this.formatonumeros(datos_ot[i].prod_Fuelle)}               ${datos_ot[i].undMedACF}`,
                              alignment: 'left',
                            },
                          ],
                          [
                            {
                              border : [],
                              text : ``,
                            },
                            {
                              border : [],
                              text : ``,
                            },
                            {
                              border : [],
                              text : ``,
                            },
                          ],
                          [
                            {
                              border : [],
                              text : ``,
                            },
                            {
                              border : [],
                              text : ``,
                            },
                            {
                              border : [],
                              text : ``,
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `Sellado: `,
                            },
                            {
                              border : [],
                              text : `${datos_ot[i].tpSellados_Nombre}`,
                            },
                            {
                              border : [],
                              text : ``,
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `Margen: `,
                            },
                            {
                              border : [],
                              text : `${datos_ot[i].ot_MargenAdicional}`,
                            },
                            {
                              border : [],
                              text : ``,
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `Peso Millar: `,
                            },
                            {
                              border : [],
                              text : `${datos_ot[i].prod_Peso_Millar}`,
                            },
                            {
                              border : [],
                              text : ``,
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `Cant. x Paquete: `,
                            },
                            {
                              border : [],
                              text : `${datos_ot[i].prod_CantBolsasPaquete}`,
                            },
                            {
                              border : [],
                              text : ``,
                            },
                          ],
                          [
                            {
                              border : [],
                              text : `Cant. x Bulto: `,
                            },
                            {
                              border : [],
                              text : `${datos_ot[i].prod_CantBolsasBulto}`,
                            },
                            {
                              border : [],
                              text : ``,
                            },
                          ]
                        ]
                      }
                    },
                  ]
                ]
              },
              layout: {
                defaultBorder: false,
              },
              fontSize: 9,
            },
            '\n\n\n',
            {
              table : {
                widths : ['*'],
                style : '',
                body : [
                  [
                    {
                      border : [true, true, true, false],
                      text : `Observacion: `
                    }
                  ],
                  [
                    {
                      border : [true, false, true, true],
                      text : `${datos_ot[i].ot_Observacion}`
                    }
                  ]
                ]
              },
              layout: {
                defaultBorder: false,
              },
              fontSize: 10.5,
            }
          ],
          styles: {
            header: {
              fontSize: 7,
              bold: true
            },
            titulo: {
              fontSize: 11,
              bold: true
            },
            ot: {
              fontSize: 13,
              bold: true
            }
          }
        }
        const pdf = pdfMake.createPdf(pdfDefinicion);
        pdf.open();
      }
    });
  }

  // Funcion que limpiará todos los campos
  limpiarCampos(){
    this.FormOrdenTrabajo = this.frmBuilderPedExterno.group({
      OT_Id: '',
      Pedido_Id: '',
      Nombre_Vendedor: '',
      OT_FechaCreacion: this.today,
      OT_FechaEntrega: '',
      ID_Cliente: '',
      Nombre_Cliente: '',
      Ciudad_SedeCliente: '',
      Direccion_SedeCliente : '',
      OT_Estado : 'Abierta',
      OT_Observacion : '',
      Margen : 0,
      OT_Cyrel : '',
      OT_Corte : '',
    });
    this.FormOrdenTrabajoExtrusion = this.frmBuilderPedExterno.group({
      /*** Datos para tabla de extrusión */
      cantidad_Extrusion : [''],
      Material_Extrusion : ['NO APLICA', Validators.required],
      Formato_Extrusion : ['Sin formato', Validators.required],
      Pigmento_Extrusion : ['NO APLICA', Validators.required],
      Ancho_Extrusion1 : [0, Validators.required],
      Ancho_Extrusion2 : [0, Validators.required],
      Ancho_Extrusion3 : [0, Validators.required],
      Calibre_Extrusion : [0, Validators.required],
      UnidadMedida_Extrusion : ['', Validators.required],
      Tratado_Extrusion : ['No Aplica', Validators.required],
    });
    this.FormOrdenTrabajoImpresion = this.frmBuilderPedExterno.group({
      /*** Datos para tabla de impresióm */
      cantidad_Impresion : [''],
      Tipo_Impresion : ['NO APLICA', Validators.required],
      Rodillo_Impresion : [0, Validators.required],
      Pista_Impresion : [0, Validators.required],
      Tinta_Impresion1 : ['NO APLICA', ],
      Tinta_Impresion2 : ['NO APLICA', ],
      Tinta_Impresion3 : ['NO APLICA', ],
      Tinta_Impresion4 : ['NO APLICA', ],
      Tinta_Impresion5 : ['NO APLICA', ],
      Tinta_Impresion6 : ['NO APLICA', ],
      Tinta_Impresion7 : ['NO APLICA', ],
      Tinta_Impresion8 : ['NO APLICA', ],
    });
    this.FormOrdenTrabajoLaminado = this.frmBuilderPedExterno.group({
      /*** Datos para tabla de Laminado */
      cantidad_Laminado : ['', ],
      Capa_Laminado1 : ['NO APLICA', ],
      Calibre_Laminado1 : [0, ],
      cantidad_Laminado1 : [0, ],
      Capa_Laminado2 : ['NO APLICA', ],
      Calibre_Laminado2 : [0, ],
      cantidad_Laminado2 : [0, ],
      Capa_Laminado3 : ['NO APLICA', ],
      Calibre_Laminado3 : [0, ],
      cantidad_Laminado3 : [0, ],
    });
    this.FormOrdenTrabajoMezclas = this.frmBuilderPedExterno.group({
      Nombre_Mezclas : ['', Validators.required],
      Chechbox_Capa1 : ['', Validators.required],
      Chechbox_Capa2 : ['', Validators.required],
      Chechbox_Capa3 : ['', Validators.required],
      Proc_Capa1 : [0, Validators.required],
      Proc_Capa2 : [0, Validators.required],
      Proc_Capa3 : [0, Validators.required],
      materialP1_Capa1 : ['NO APLICA MATERIAL', Validators.required],
      PorcentajeMaterialP1_Capa1 : [0, Validators.required],
      materialP1_Capa2 : ['NO APLICA MATERIAL', Validators.required],
      PorcentajeMaterialP1_Capa2 : [0, Validators.required],
      materialP1_Capa3 : ['NO APLICA MATERIAL', Validators.required],
      PorcentajeMaterialP1_Capa3 : [0, Validators.required],
      materialP2_Capa1 : ['NO APLICA MATERIAL', Validators.required],
      PorcentajeMaterialP2_Capa1 : [0, Validators.required],
      materialP2_Capa2 : ['NO APLICA MATERIAL', Validators.required],
      PorcentajeMaterialP2_Capa2 : [0, Validators.required],
      materialP2_Capa3 : ['NO APLICA MATERIAL', Validators.required],
      PorcentajeMaterialP2_Capa3 : [0, Validators.required],
      materialP3_Capa1 : ['NO APLICA MATERIAL', Validators.required],
      PorcentajeMaterialP3_Capa1 : [0, Validators.required],
      materialP3_Capa2 : ['NO APLICA MATERIAL', Validators.required],
      PorcentajeMaterialP3_Capa2 : [0, Validators.required],
      materialP3_Capa3 : ['NO APLICA MATERIAL', Validators.required],
      PorcentajeMaterialP3_Capa3 : [0, Validators.required],
      materialP4_Capa1 : ['NO APLICA MATERIAL', Validators.required],
      PorcentajeMaterialP4_Capa1 : [0, Validators.required],
      materialP4_Capa2 : ['NO APLICA MATERIAL', Validators.required],
      PorcentajeMaterialP4_Capa2 : [0, Validators.required],
      materialP_Capa3 : ['NO APLICA MATERIAL', Validators.required],
      PorcentajeMaterialP_Capa3 : [0, Validators.required],
      MezclaPigmentoP1_Capa1 : ['NO APLICA PIGMENTO', Validators.required],
      PorcentajeMezclaPigmentoP1_Capa1 : [0, Validators.required],
      MezclaPigmentoP1_Capa2 : ['NO APLICA PIGMENTO', Validators.required],
      PorcentajeMezclaPigmentoP1_Capa2 : [0, Validators.required],
      MezclaPigmento1_Capa3 : ['NO APLICA PIGMENTO', Validators.required],
      PorcentajeMezclaPigmentoP1_Capa3 :[0, Validators.required],
      MezclaPigmentoP2_Capa1 : ['NO APLICA PIGMENTO', Validators.required],
      PorcentajeMezclaPigmentoP2_Capa1 : [0, Validators.required],
      MezclaPigmentoP2_Capa2 : ['NO APLICA PIGMENTO', Validators.required],
      PorcentajeMezclaPigmentoP2_Capa2 : [0, Validators.required],
      MezclaPigmento2_Capa3 : ['NO APLICA PIGMENTO', Validators.required],
      PorcentajeMezclaPigmentoP2_Capa3 : [0, Validators.required],
    });
    this.checkedCyrel = false;
    this.checkedCorte = false;
    this.checkedCapa1 = false;
    this.checkedCapa2 = false;
    this.checkedCapa3 = false;
    this.validarInputPedidos = true;
    this.validarInputMezclas = true;
    this.ArrayProducto = [];
    this.cantidadKgMasMargen = 0;
    this.cantidadUndMasMargen = 0;
    this.producto = 0;
    this.pedidoId = 0;
    this.clienteId = 0;
    this.cantidadKilos = 0;
    this.cantidadUnidades = 0;
    this.pesoProducto = 0;
    this.idMezclaSeleccionada = 0;
    this.ultimaOT();
    this.pedidos();
    this.cargando = true;
  }

  //
  CheckExtrusion(item){
    if (item.checked) this.checkedExtrusion = true;
    else this.checkedExtrusion = false;
  }
}
