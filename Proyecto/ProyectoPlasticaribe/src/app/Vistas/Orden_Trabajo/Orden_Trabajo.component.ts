import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShepherdService } from 'angular-shepherd';
import moment from 'moment';
import { MessageService } from 'primeng/api';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { ClientesService } from 'src/app/Servicios/Clientes/clientes.service';
import { EstadosService } from 'src/app/Servicios/Estados/estados.service';
import { FormatosService } from 'src/app/Servicios/Formato/Formatos.service';
import { InventarioZeusService } from 'src/app/Servicios/InventarioZeus/inventario-zeus.service';
import { Laminado_CapaService } from 'src/app/Servicios/LaminadoCapa/Laminado_Capa.service';
import { MaterialProductoService } from 'src/app/Servicios/MaterialProducto/materialProducto.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { MezclasService } from 'src/app/Servicios/Mezclas/Mezclas.service';
import { Mezclas_MaterialesService } from 'src/app/Servicios/MezclasMateriales/Mezclas_Materiales.service';
import { Mezclas_PigmentosService } from 'src/app/Servicios/MezclasPigmentos/Mezclas_Pigmentos.service';
import { Orden_TrabajoService } from 'src/app/Servicios/OrdenTrabajo/Orden_Trabajo.service';
import { OT_ExtrusionService } from 'src/app/Servicios/OrdenTrabajo_Extrusion/OT_Extrusion.service';
import { OT_ImpresionService } from 'src/app/Servicios/OrdenTrabajo_Impresion/OT_Impresion.service';
import { OT_LaminadoService } from 'src/app/Servicios/OrdenTrabajo_Laminado/OT_Laminado.service';
import { OrdenTrabajo_Sellado_CorteService } from 'src/app/Servicios/OrdenTrabajo_Sellado_Corte/OrdenTrabajo_Sellado_Corte.service';
import { OpedidoproductoService } from 'src/app/Servicios/PedidosProductos/opedidoproducto.service';
import { PigmentoProductoService } from 'src/app/Servicios/PigmentosProductos/pigmentoProducto.service';
import { ProductoService } from 'src/app/Servicios/Productos/producto.service';
import { SedeClienteService } from 'src/app/Servicios/SedeCliente/sede-cliente.service';
import { TintasService } from 'src/app/Servicios/Tintas/tintas.service';
import { Tipos_ImpresionService } from 'src/app/Servicios/TipoImpresion/Tipos_Impresion.service';
import { TipoProductoService } from 'src/app/Servicios/TipoProducto/tipo-producto.service';
import { TiposSelladoService } from 'src/app/Servicios/TiposSellado/TiposSellado.service';
import { TratadoService } from 'src/app/Servicios/Tratado/Tratado.service';
import { UnidadMedidaService } from 'src/app/Servicios/UnidadMedida/unidad-medida.service';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-Orden_Trabajo',
  templateUrl: './Orden_Trabajo.component.html',
  styleUrls: ['./Orden_Trabajo.component.css']
})
export class Orden_TrabajoComponent implements OnInit {

  FormOrdenTrabajo !: FormGroup;
  FormOrdenTrabajoExtrusion !: FormGroup;
  FormOrdenTrabajoImpresion !: FormGroup;
  FormOrdenTrabajoLaminado !: FormGroup;
  FormOrdenTrabajoCorte !: FormGroup;
  FormOrdenTrabajoSellado !: FormGroup;
  FormOrdenTrabajoMezclas !: FormGroup;
  formCrearMezclas !: FormGroup;
  formCrearMateriales !: FormGroup;
  formCrearPigmentos !: FormGroup;
  
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  cargando : boolean = false; //Variable para validar que salga o no la imagen de carga
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  clientes : any [] = []; //Variable que almacenará la informacion de los clientes
  productos : any [] = []; //Variable que almacenará la informacion de los productos
  presentaciones : any [] = []; //Variable que almacenará la informacion de las presentaciones

  constructor(private frmBuilderPedExterno : FormBuilder,
    private AppComponent : AppComponent,
      private bagProService : BagproService,
        private pedidoExternoService : OpedidoproductoService,
          private servicioTintas : TintasService,
            private servicioMateriales : MaterialProductoService,
              private servicioPigmentos : PigmentoProductoService,
                private servicioUnidadMedida : UnidadMedidaService,
                  private estadosService : EstadosService,
                    private tratadoServise : TratadoService,
                      private formatoService : FormatosService,
                        private tiposImpresionService : Tipos_ImpresionService,
                          private laminadoCapasService : Laminado_CapaService,
                            private ordenTrabajoService : Orden_TrabajoService,
                              private otExtrusionServie : OT_ExtrusionService,
                                private otImpresionService : OT_ImpresionService,
                                  private otLaminadoService : OT_LaminadoService,
                                    private otSelladoCorteService : OrdenTrabajo_Sellado_CorteService,
                                      private mezclaMaterialService : Mezclas_MaterialesService,
                                        private mezclaPigmentosService : Mezclas_PigmentosService,
                                          private mezclasService : MezclasService,
                                            private messageService: MessageService,
                                              private productoService : ProductoService,
                                                private clienteServise : ClientesService,
                                                  private tiposProductosService : TipoProductoService,
                                                    private tipoSelladoService : TiposSelladoService,
                                                      private pedidosZeusService : InventarioZeusService,
                                                        private sedeClienteService : SedeClienteService,
                                                          private shepherdService: ShepherdService,
                                                            private mensajeService : MensajesAplicacionService,) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
    this.FormOrdenTrabajo = this.frmBuilderPedExterno.group({
      OT_Id: [null],
      Pedido_Id: [null, Validators.required],
      Nombre_Vendedor: [null, Validators.required],
      OT_FechaCreacion: [this.today, Validators.required],
      OT_FechaEntrega: [null, Validators.required],
      Id_Producto : [null, Validators.required],
      Nombre_Producto : [null, Validators.required],
      Id_Sede_Cliente : [null, Validators.required],
      ID_Cliente: [null, Validators.required],
      Nombre_Cliente: [null, Validators.required],
      Ciudad_SedeCliente: [null, Validators.required],
      Direccion_SedeCliente : [null, Validators.required],
      OT_Estado : [null],
      OT_Observacion : [null],
      Margen : [0, Validators.required],
    });

    this.FormOrdenTrabajoExtrusion = this.frmBuilderPedExterno.group({
      /*** Datos para tabla de extrusión */
      Material_Extrusion : [1, Validators.required],
      Formato_Extrusion : [1, Validators.required],
      Pigmento_Extrusion : [1, Validators.required],
      Ancho_Extrusion1 : [0, Validators.required],
      Ancho_Extrusion2 : [0, Validators.required],
      Ancho_Extrusion3 : [0, Validators.required],
      Calibre_Extrusion : [0, Validators.required],
      UnidadMedida_Extrusion : [null, Validators.required],
      Tratado_Extrusion : [1, Validators.required],
      Peso_Extrusion : [0, Validators.required],
    });

    this.FormOrdenTrabajoImpresion = this.frmBuilderPedExterno.group({
      /*** Datos para tabla de impresióm */
      Tipo_Impresion : [1, Validators.required],
      Rodillo_Impresion : [0, Validators.required],
      Pista_Impresion : [0, Validators.required],
      Tinta_Impresion1 : ['NO APLICA', Validators.required],
      Tinta_Impresion2 : ['NO APLICA', Validators.required],
      Tinta_Impresion3 : ['NO APLICA', Validators.required],
      Tinta_Impresion4 : ['NO APLICA', Validators.required],
      Tinta_Impresion5 : ['NO APLICA', Validators.required],
      Tinta_Impresion6 : ['NO APLICA', Validators.required],
      Tinta_Impresion7 : ['NO APLICA', Validators.required],
      Tinta_Impresion8 : ['NO APLICA', Validators.required],
    });

    this.FormOrdenTrabajoLaminado = this.frmBuilderPedExterno.group({
      /*** Datos para tabla de Laminado */
      Capa_Laminado1 : [1, Validators.required],
      Calibre_Laminado1 : [0, Validators.required],
      cantidad_Laminado1 : [0, Validators.required],
      Capa_Laminado2 : [1, Validators.required],
      Calibre_Laminado2 : [0, Validators.required],
      cantidad_Laminado2 : [0, Validators.required],
      Capa_Laminado3 : [1, Validators.required],
      Calibre_Laminado3 : [0, Validators.required],
      cantidad_Laminado3 : [0, Validators.required],
    });

    this.FormOrdenTrabajoCorte = this.frmBuilderPedExterno.group({
      Formato_Corte : [null, Validators.required],
      Ancho_Corte : [null, Validators.required],
      Largo_Corte : [null, Validators.required],
      Fuelle_Corte : [null, Validators.required],
      Margen_Corte : [null, Validators.required],
    });

    this.FormOrdenTrabajoSellado = this.frmBuilderPedExterno.group({
      Formato_Sellado : [null, Validators.required],
      Ancho_Sellado : [null, Validators.required],
      Largo_Sellado : [null, Validators.required],
      Fuelle_Sellado : [null, Validators.required],
      Margen_Sellado : [null, Validators.required],
      PesoMillar : [0, Validators.required],
      TipoSellado : [0, Validators.required],
      PrecioDia : [0, Validators.required],
      PrecioNoche : [0, Validators.required],
      CantidadPaquete : [0, Validators.required],
      PesoPaquete : [0, Validators.required],
      CantidadBulto : [0, Validators.required],
      PesoBulto : [0, Validators.required],
    });

    this.FormOrdenTrabajoMezclas = this.frmBuilderPedExterno.group({
      Id_Mezcla : [null, Validators.required],
      Nombre_Mezclas : [null, Validators.required],
      Chechbox_Capa1 : [null, Validators.required],
      Chechbox_Capa2 : [null, Validators.required],
      Chechbox_Capa3 : [null, Validators.required],
      Proc_Capa1 : [0, Validators.required],
      Proc_Capa2 : [0, Validators.required],
      Proc_Capa3 : [0, Validators.required],
      materialP1_Capa1 : [1, Validators.required],
      PorcentajeMaterialP1_Capa1 : [0, Validators.required],
      materialP1_Capa2 : [1, Validators.required],
      PorcentajeMaterialP1_Capa2 : [0, Validators.required],
      materialP1_Capa3 : [1, Validators.required],
      PorcentajeMaterialP1_Capa3 : [0, Validators.required],
      materialP2_Capa1 : [1, Validators.required],
      PorcentajeMaterialP2_Capa1 : [0, Validators.required],
      materialP2_Capa2 : [1, Validators.required],
      PorcentajeMaterialP2_Capa2 : [0, Validators.required],
      materialP2_Capa3 : [1, Validators.required],
      PorcentajeMaterialP2_Capa3 : [0, Validators.required],
      materialP3_Capa1 : [1, Validators.required],
      PorcentajeMaterialP3_Capa1 : [0, Validators.required],
      materialP3_Capa2 : [1, Validators.required],
      PorcentajeMaterialP3_Capa2 : [0, Validators.required],
      materialP3_Capa3 : [1, Validators.required],
      PorcentajeMaterialP3_Capa3 : [0, Validators.required],
      materialP4_Capa1 : [1, Validators.required],
      PorcentajeMaterialP4_Capa1 : [0, Validators.required],
      materialP4_Capa2 : [1, Validators.required],
      PorcentajeMaterialP4_Capa2 : [0, Validators.required],
      materialP_Capa3 : [1, Validators.required],
      PorcentajeMaterialP_Capa3 : [0, Validators.required],
      MezclaPigmentoP1_Capa1 : [1, Validators.required],
      PorcentajeMezclaPigmentoP1_Capa1 : [0, Validators.required],
      MezclaPigmentoP1_Capa2 : [1, Validators.required],
      PorcentajeMezclaPigmentoP1_Capa2 : [0, Validators.required],
      MezclaPigmento1_Capa3 : [1, Validators.required],
      PorcentajeMezclaPigmentoP1_Capa3 :[0, Validators.required],
      MezclaPigmentoP2_Capa1 : [1, Validators.required],
      PorcentajeMezclaPigmentoP2_Capa1 : [0, Validators.required],
      MezclaPigmentoP2_Capa2 : [1, Validators.required],
      PorcentajeMezclaPigmentoP2_Capa2 : [0, Validators.required],
      MezclaPigmento2_Capa3 : [1, Validators.required],
      PorcentajeMezclaPigmentoP2_Capa3 : [0, Validators.required],
    });

    /** Formulario para creación de mezclas */
    this.formCrearMezclas = this.frmBuilderPedExterno.group({
      mezclaId : '',
      Nombre_Mezclas : ['', Validators.required],
      Material_MatPrima : [0, Validators.required],
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
      materialP4_Capa3 : ['NO APLICA MATERIAL', Validators.required],
      PorcentajeMaterialP4_Capa3 : [0, Validators.required],
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


    this.formCrearMateriales = this.frmBuilderPedExterno.group({
      matNombre : [null, Validators.required],
      matDescripcion :  [null, Validators.required],
    });

    this.formCrearPigmentos = this.frmBuilderPedExterno.group({
      pigNombre : [null, Validators.required],
      pigDescripcion :  [null, Validators.required],
    });
  }

  ngOnInit() {
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

  // Funcion que colocará los campos del formulario principal con datos predeterminados
  limpiarFormOrdenTrabajo(){
    this.FormOrdenTrabajo.reset();
    this.FormOrdenTrabajo.patchValue({ OT_FechaCreacion : this.today });
  }

  // Funcion que va a limpiar los campos del formulario de extrusión
  limpiarFormExtrusion(){
    this.FormOrdenTrabajoExtrusion.patchValue({
      Material_Extrusion : 1,
      Formato_Extrusion : 1,
      Pigmento_Extrusion : 1,
      Ancho_Extrusion1 : 0,
      Ancho_Extrusion2 : 0,
      Ancho_Extrusion3 : 0,
      Calibre_Extrusion : 0,
      UnidadMedida_Extrusion : 'Cms',
      Tratado_Extrusion : 1,
      Peso_Extrusion : 0,
    });
  }

  // Funcion que va a limpiar los campos del formulario de impresion y rotograbado
  limpiarFormImpresion(){
    this.FormOrdenTrabajoImpresion.patchValue({
      Tipo_Impresion : 1,
      Rodillo_Impresion : 0,
      Pista_Impresion : 0,
      Tinta_Impresion1 : 'NO APLICA',
      Tinta_Impresion2 : 'NO APLICA',
      Tinta_Impresion3 : 'NO APLICA',
      Tinta_Impresion4 : 'NO APLICA',
      Tinta_Impresion5 : 'NO APLICA',
      Tinta_Impresion6 : 'NO APLICA',
      Tinta_Impresion7 : 'NO APLICA',
      Tinta_Impresion8 : 'NO APLICA',
    });
  }

  // Funcion que va a limpiar los campos del formulario de laminado
  limpiarFormLaminado(){
    this.FormOrdenTrabajoLaminado.patchValue({
      Capa_Laminado1 : 1,
      Calibre_Laminado1 : 0,
      cantidad_Laminado1 : 0,
      Capa_Laminado2 : 1,
      Calibre_Laminado2 : 0,
      cantidad_Laminado2 : 0,
      Capa_Laminado3 : 1,
      Calibre_Laminado3 : 0,
      cantidad_Laminado3 : 0,
    });
  }

  // Funcion que va a limpiar los campos del formulario de orte
  limpiarFormCorte(){
    this.FormOrdenTrabajoCorte.patchValue({
      Formato_Corte : 7,
      Ancho_Corte : 0,
      Largo_Corte : 0,
      Fuelle_Corte : 0,
      Margen_Corte : 0,
    });
  }

  // Funcion que va a limpíar los campos del formulario de sellado
  limpiarFormSellado(){
    this.FormOrdenTrabajoSellado.patchValue({
      Formato_Sellado : 7,
      Ancho_Sellado : 0,
      Largo_Sellado : 0,
      Fuelle_Sellado : 0,
      Margen_Sellado : 0,
      PesoMillar : 0,
      TipoSellado : 1,
      PrecioDia : 0,
      PrecioNoche : 0,
      CantidadPaquete : 0,
      PesoPaquete : 0,
      CantidadBulto : 0,
      PesoBulto : 0,
    });
  }

  // Funcion que va a limpiar los campos del formulario de mezclas
  limpiarFormMezclas(){
    this.FormOrdenTrabajoMezclas.patchValue({ Nombre_Mezclas : 'ALTA 1 X 1 NEGRO', });
  }

  // Funcion que va a consultar los clientes de la empresa
  consultarClientes = () => this.clienteServise.srvObtenerListaPorEstado(1).subscribe(data => this.clientes = data);

  

  // Funcion que va a consultar los productos de la empresa
  consultarProductos() {
    let nombreProducto = this.FormOrdenTrabajo.get('Nombre_Producto').value;
    this.productoService.obtenerItemsLike(nombreProducto).subscribe(data => this.productos = data);
  }

  // Funcion que va a consultar las presentaciones de los productos
  consultarPresentaciones(){
  }
}