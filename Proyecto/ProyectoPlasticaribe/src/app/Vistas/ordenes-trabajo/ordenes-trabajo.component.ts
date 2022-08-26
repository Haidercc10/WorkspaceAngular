import { Component, Inject, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-ordenes-trabajo',
  templateUrl: './ordenes-trabajo.component.html',
  styleUrls: ['./ordenes-trabajo.component.css']
})

export class OrdenesTrabajoComponent implements OnInit {


  public FormOrdenTrabajo !: FormGroup; //Formulario de pedidos cliente
  public FormOrdenTrabajoExtrusion !: FormGroup; //Formulario de pedidos cliente
  public FormOrdenTrabajoImpresion !: FormGroup; //Formulario de pedidos cliente
  public FormOrdenTrabajoLaminado !: FormGroup; //Formulario de pedidos cliente

  public titulosTabla = []; //Variable que llenará los titulos de la tabla
  public arrayTintas = []; /** Array que colocará las tintas en los combobox al momento de crear la OT */
  public arrayPigmentos = []; /** Array que colocará las pigmentos en los combobox al momento de crear la OT */
  public arrayMateriales = []; /** Array que colocará las materiales en los combobox al momento de crear la OT*/
  public arrayUnidadesMedidas = []; /** Array que colocará las unidades de medida en los combobox al momento de crear la OT*/

  extrusion : boolean = false; //variable que va a mostrar o no el apartado de extrusion, dependiendo de su valor
  impresion : boolean = false; //variable que va a mostrar o no el apartado de impresion, dependiendo de su valor
  laminado : boolean = false; //variable que va a mostrar o no el apartado de laminado, dependiendo de su valor
  checkedCyrel : boolean = false; //Variable para saber si el checkbox del Cyrel está seleccionado o no
  checkedCorte : boolean = false; //Variable para saber si el checkbox del Corte está seleccionado o no
  today : any = new Date(); //Variable que se usará para llenar la fecha actual
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  pedidoSinOT : any = []; //Variable que se usará para almacenar los pedido que no tienen orden de trabajo
  keywordPedidos = ''; //Variable que servirá para filtrar mediante se escribe los pedidos por un campo
  validarInputPedidos : any; //Variable para validar si se verá o no el titulo del campo donde se consultarán los pedidos
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
                                                private laminadoCapasService : Laminado_CapaService) {

    this.FormOrdenTrabajo = this.frmBuilderPedExterno.group({
      OT_Id: ['', Validators.required],
      Pedido_Id: ['', Validators.required],
      Nombre_Vendedor: ['', Validators.required],
      OT_FechaCreacion: ['', Validators.required],
      OT_FechaEntrega: ['', Validators.required],
      ID_Cliente: ['', Validators.required],
      Nombre_Cliente: ['', Validators.required],
      Ciudad_SedeCliente: ['', Validators.required],
      Direccion_SedeCliente : ['', Validators.required],
      OT_Estado : ['', Validators.required],
      OT_Observacion : ['', Validators.required],
      OT_Cyrel : [''],
      OT_Corte : [''],
    });

    this.FormOrdenTrabajoExtrusion = this.frmBuilderPedExterno.group({
      /*** Datos para tabla de extrusión */
      cantidad_Extrusion : ['', Validators.required],
      Material_Extrusion : ['', Validators.required],
      Formato_Extrusion : ['', Validators.required],
      Pigmento_Extrusion : ['', Validators.required],
      Ancho_Extrusion1 : ['', Validators.required],
      Ancho_Extrusion2 : ['', Validators.required],
      Ancho_Extrusion3 : ['', Validators.required],
      Calibre_Extrusion : ['', Validators.required],
      UnidadMedida_Extrusion : ['', Validators.required],
      Tratado_Extrusion : ['', Validators.required],
    });

    this.FormOrdenTrabajoImpresion = this.frmBuilderPedExterno.group({
      /*** Datos para tabla de impresióm */
      cantidad_Impresion : ['', Validators.required],
      Tipo_Impresion : ['', Validators.required],
      Rodillo_Impresion : ['', Validators.required],
      Pista_Impresion : ['', Validators.required],
      Tinta_Impresion1 : ['', ],
      Tinta_Impresion2 : ['', ],
      Tinta_Impresion3 : ['', ],
      Tinta_Impresion4 : ['', ],
      Tinta_Impresion5 : ['', ],
      Tinta_Impresion6 : ['', ],
      Tinta_Impresion7 : ['', ],
      Tinta_Impresion8 : ['', ],
    });

    this.FormOrdenTrabajoLaminado = this.frmBuilderPedExterno.group({
      /*** Datos para tabla de Laminado */
      cantidad_Laminado : ['', ],
      Capa_Laminado1 : ['', ],
      Calibre_Laminado1 : ['', ],
      cantidad_Laminado1 : ['', ],
      Capa_Laminado2 : ['', ],
      Calibre_Laminado2 : ['', ],
      cantidad_Laminado2 : ['', ],
      Capa_Laminado3 : ['', ],
      Calibre_Laminado3 : ['', ],
      cantidad_Laminado3 : ['', ],
    });

   }

  ngOnInit(): void {
    this.cargarEstados();
    this.fecha();
    this.lecturaStorage();
    this.ColumnasTabla();
    this.ultimaOT();
    this.cargarTintasEnProcesoImpresion();
    this.cargarPigmentosEnProcesoExtrusion();
    this.cargarMaterialEnProcesoExtrusion();
    this.cargarUnidadMedidaEnProcesoExtrusion();
    this.cargarTratadoEnProcesoExtrusion();
    this.cargarFormatosEnProcesoExtrusion();
    this.cargarTiposImpresion();
    this.cargarLaminados();
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
        this.arrayUnidadesMedidas.push(registros_unidadesMedida[und].undMed_Id);
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

  // Función que llenará los titulos de la tabla
  ColumnasTabla(){
    this.titulosTabla = [];
    this.titulosTabla = [{
      pID : "Id",
      pNombre : "Nombre",
      pAncho :   "Ancho",
      pFuelle : "Fuelle",
      pCalibre : "Cal",
      pUndMedACF : "Und.",
      pTipoProd : "TipoProd",
      pMaterial : 'Material',
      pPigmento : 'Pigmento',
      pCantidad : "Cantidad",
      pLargo : "Largo",
      pUndMedCant : "Und. Cant",
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

  //
  pedidos(){
    this.pedidoExternoService
  }

  // Funcion que consultará el pedido del cual se hará la orden de trabajo
  consultarPedido(){
    let idPedido : number = this.FormOrdenTrabajo.value.Pedido_Id;

    this.ArrayProducto = [];
    this.pedidoExternoService.srvObtenerListaPorIdPedidoLlenarPDF(idPedido).subscribe(datos_pedido => {
      for (let i = 0; i < datos_pedido.length; i++) {
        this.productosPedidoExternoService.srvObtenerListaPorIdProductoPedido(idPedido).subscribe(datos_productosPedidos => {
          for (let j = 0; j < datos_productosPedidos.length; j++) {
            this.existenciasProductosServices.srvObtenerListaPorIdProducto(datos_productosPedidos[j].prod_Id).subscribe(datos_productos => {
              for (let k = 0; k < datos_productos.length; k++) {

                let FechaEntregaDatetime = datos_pedido[i].pedExt_FechaEntrega;
                let FechaEntregaNueva = FechaEntregaDatetime.indexOf("T");
                let fechaEntrega = FechaEntregaDatetime.substring(0, FechaEntregaNueva);

                this.FormOrdenTrabajo.patchValue({
                  OT_Id: ['', Validators.required],
                  Pedido_Id: idPedido,
                  Nombre_Vendedor: datos_pedido[i].usua_Nombre,
                  OT_FechaCreacion: this.today,
                  OT_FechaEntrega: fechaEntrega,
                  ID_Cliente: datos_pedido[i].cli_Id,
                  Nombre_Cliente: datos_pedido[i].cli_Nombre,
                  Ciudad_SedeCliente: datos_pedido[i].sedeCliente_Ciudad,
                  Direccion_SedeCliente : datos_pedido[i].sedeCliente_Direccion,
                  OT_Estado : 'Abierta',
                  OT_Observacion : datos_pedido[i].pedExt_Observacion,
                  OT_Cyrel : this.checkedCyrel,
                  OT_Corte : this.checkedCorte,
                });
                if (this.FormOrdenTrabajo.value.Pedido_Id != null) this.validarInputPedidos = false;
                else this.validarInputPedidos = true;

                let productoExt : any = {
                  Id : datos_productos[k].prod_Id,
                  Nombre : datos_productos[k].prod_Nombre,
                  Ancho : datos_productos[k].prod_Ancho,
                  Fuelle : datos_productos[k].prod_Fuelle,
                  Cal : datos_productos[k].prod_Calibre,
                  Und : datos_productos[k].undMedACF,
                  Tipo : datos_productos[k].tpProd_Nombre,
                  Material : datos_productos[k].material_Nombre,
                  Pigmento : datos_productos[k].pigmt_Nombre,
                  Cant : datos_productosPedidos[j].pedExtProd_Cantidad,
                  Largo : datos_productos[k].prod_Largo,
                  UndCant : datos_productosPedidos[j].undMed_Id,
                  PrecioUnd : datos_productosPedidos[j].pedExtProd_PrecioUnitario,
                  TpMoneda : datos_productos[k].tpMoneda_Id,
                  Stock : datos_productos[k].ExProd_Cantidad,
                  Produ_Descripcion : datos_productos[k].prod_Descripcion,
                  SubTotal : datos_productosPedidos[j].pedExtProd_Cantidad * datos_productosPedidos[j].pedExtProd_PrecioUnitario,
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
          }
        });
      }
    });
  }

  // Funcion para consultar si el producto 'X' que el cliente 'Y' pidió y tiene una orden de trabajo hecha, para poder llenar la nueva
  consultar_Prod_Cli_Presentacion(formulario : any){
    let cliente : string = this.FormOrdenTrabajo.value.Nombre_Cliente;
    let presentacion : string = formulario.UndCant;
    let impresion : any;
    let laminadoCapa1 : any;
    let laminadoCapa2 : any;
    let laminadoCapa3 : any;
    if (presentacion == 'Kg') presentacion = 'Kilo';
    else if (presentacion == 'Paquete') presentacion = 'Paquete';
    else if (presentacion == 'Und') presentacion = 'Unidad';
    else if (presentacion == 'Rollo') presentacion = 'Rollo';
    this.bagProService.srvObtenerListaClienteOT_Cliente_Item_Presentacion(cliente, formulario.Id, presentacion).subscribe(datos_Ot => {
      let ot : any = [];
      ot.push(datos_Ot);
      for (const itemOt of ot) {
        console.log(itemOt)

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

        this.FormOrdenTrabajoImpresion.setValue({
          cantidad_Impresion : '',
          Tipo_Impresion : itemOt.impFlexoNom.trim(),
          Rodillo_Impresion : itemOt.impRodillo,
          Pista_Impresion : itemOt.impPista,
          Tinta_Impresion1 : '',
          Tinta_Impresion2 : '',
          Tinta_Impresion3 : '',
          Tinta_Impresion4 : '',
          Tinta_Impresion5 : '',
          Tinta_Impresion6 : '',
          Tinta_Impresion7 : '',
          Tinta_Impresion8 : '',
        });

        laminadoCapa1 = itemOt.lamCapa1Nom.trim();
        laminadoCapa2 = itemOt.lamCapa2Nom.trim();
        laminadoCapa3 = itemOt.lamCapa3Nom.trim()
        if (laminadoCapa1 == '') laminadoCapa1 = 'Sin Laminado';
        if (laminadoCapa2 == '') laminadoCapa2 = 'Sin Laminado';
        if (laminadoCapa3 == '') laminadoCapa3 = 'Sin Laminado';

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
      }
    });
  }

}
