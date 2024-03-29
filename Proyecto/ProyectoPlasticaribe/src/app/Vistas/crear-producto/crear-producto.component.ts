import { Component, Injectable, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { ClientesService } from 'src/app/Servicios/Clientes/clientes.service';
import { ClientesProductosService } from 'src/app/Servicios/Clientes_Productos/ClientesProductos.service';
import { ExistenciasProductosService } from 'src/app/Servicios/ExistenciasProductos/existencias-productos.service';
import { MaterialProductoService } from 'src/app/Servicios/MaterialProducto/materialProducto.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { PigmentoProductoService } from 'src/app/Servicios/PigmentosProductos/pigmentoProducto.service';
import { ProductoService } from 'src/app/Servicios/Productos/producto.service';
import { TipoMonedaService } from 'src/app/Servicios/TipoMoneda/tipo-moneda.service';
import { TipoProductoService } from 'src/app/Servicios/TipoProducto/tipo-producto.service';
import { TiposSelladoService } from 'src/app/Servicios/TiposSellado/TiposSellado.service';
import { UnidadMedidaService } from 'src/app/Servicios/UnidadMedida/unidad-medida.service';
import { UsuarioService } from 'src/app/Servicios/Usuarios/usuario.service';
import { AppComponent } from 'src/app/app.component';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-crear-producto',
  templateUrl: './crear-producto.component.html',
  styleUrls: ['./crear-producto.component.css']
})
export class CrearProductoComponent implements OnInit {

  public FormCrearProducto : FormGroup;
  public FormCrearPresentacionProducto : FormGroup;
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  unidadMedida : any [] = []; //Variable que almacemará las unidades de medida
  presentacionesProductos : any [] = []; //Variable que almacenará las presentaciones de los productos
  tipoProducto : any [] = []; //Variable que almacenará los tipos de productos
  materialProducto : any [] = []; //Variable que almacenará los materiales
  pigmentoProducto : any [] = []; //Variable que almancenará los pigmentos
  tipoMoneda : any [] = []; //Variable que almacenará los tipos de monedas
  tiposSellado : any [] = [];  //Variable que almacenará los tipos de sellados
  cliente : any [] = []; //Variable que almacenará los clientes
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro

  constructor(private frmBuilderCrearProducto : FormBuilder,
                private unidadMedidaService : UnidadMedidaService,
                  private tipoProductoService : TipoProductoService,
                    private tipoMonedaService : TipoMonedaService,
                      private productoService : ProductoService,
                        private existenciasService : ExistenciasProductosService,
                          private AppComponent : AppComponent,
                            private materialService : MaterialProductoService,
                              private pigmentoServices : PigmentoProductoService,
                                private tipoSelladoService : TiposSelladoService,
                                  private mensajeService : MensajesAplicacionService,) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
    this.FormCrearProducto = this.frmBuilderCrearProducto.group({
      ProduId:[null, Validators.required],
      ProduNombre: [null, Validators.required],
      ProduAncho: [0, Validators.required],
      ProduFuelle: [0, Validators.required],
      ProduCalibre: [0, Validators.required],
      ProduLargo : [0, Validators.required],
      ProduUnidadMedidaACF: ['Cms', Validators.required],
      ProduTipo: [1, Validators.required],
      ProduSellado: [1, Validators.required],
      ProduMaterial: [1, Validators.required],
      ProduPigmento: [1, Validators.required],
      ProdDescripcion: '',
      ProduBolsasBulto : 0,
      ProduBolsasPaquete : 0,
    });

    this.FormCrearPresentacionProducto = this.frmBuilderCrearProducto.group({
      ProdId:[null, Validators.required],
      ProduCantidad: [0, Validators.required],
      ProduUnidadMedidaCant: ['Kg', Validators.required],
      ProduPrecioUnd: [0, Validators.required],
      ProduTipoMoneda: ['COP', Validators.required],
    });
  }

  ngOnInit(): void {
    this.lecturaStorage();
    this.LimpiarCampos();
    this.undMedidaComboBox();
    this.tipoProductoComboBox();
    this.matrialProductoComboBox();
    this.pigmentoProductocomboBox();
    this.tipoMondedaComboBox();
    this.tiposSelladoComboBox();
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  // Funcion que va a limpiar los campos del formulario de producto
  LimpiarCampos() {
    this.FormCrearProducto.reset();
    this.productoService.GetIdUltimoProducto().subscribe(datos => {
      this.FormCrearProducto.patchValue({
        ProduId:datos + 1,
        ProduAncho: 0,
        ProduFuelle: 0,
        ProduCalibre: 0,
        ProduLargo : 0,
        ProduUnidadMedidaACF: 'Cms',
        ProduTipo: 1,
        ProduSellado: 1,
        ProduMaterial: 1,
        ProduPigmento: 1,
        ProdDescripcion: '',
        ProduBolsasBulto : 0,
        ProduBolsasPaquete : 0,
      });
    });
  }

  // Funcion que va a limpiar los campos del formulario de existencias
  LimpiarCamposPresentacion() {
    this.FormCrearPresentacionProducto.patchValue({
      ProduCantidad: 0,
      ProduUnidadMedidaCant: 'Kg',
      ProduPrecioUnd: 0,
      ProduTipoMoneda: 'COP',
    });
  }

  // Funcion que consultará y almacenará los tipos de sellado
  tiposSelladoComboBox = () => this.tipoSelladoService.srvObtenerLista().subscribe(datos_tpSelado => this.tiposSellado = datos_tpSelado);

  // Funcion que consultará y almacenará las unidades de medida
  undMedidaComboBox() {
    this.unidadMedidaService.srvObtenerLista().subscribe(datos_undMed => {
      this.unidadMedida = datos_undMed.filter(x => ['Plgs', 'Cms'].includes(x.undMed_Id));
      this.presentacionesProductos = datos_undMed.filter(x => ['Und', 'Paquete', 'Kg', 'Rollo'].includes(x.undMed_Id));
    });
  }

  // Funcion que consultará y almacenará los tipos de productos
  tipoProductoComboBox = () => this.tipoProductoService.srvObtenerLista().subscribe(datos_tiposProductos => this.tipoProducto = datos_tiposProductos);

  // Funcion para llenar el comboBox de material del producto
  matrialProductoComboBox = () => this.materialService.srvObtenerLista().subscribe(datos_material => this.materialProducto = datos_material);

  // Funcion para llenar el comboBox de pigmentos del producto
  pigmentoProductocomboBox = () => this.pigmentoServices.srvObtenerLista().subscribe(datos_pigmentos => this.pigmentoProducto = datos_pigmentos);

  // Funcion que consultará y almacenará los tipos de monedas
  tipoMondedaComboBox = () => this.tipoMonedaService.srvObtenerLista().subscribe(datos_tiposMoneda => this.tipoMoneda = datos_tiposMoneda);

  // Funcion que va a validar los campos del formulario de productos
  validarCamposVacios = () => this.FormCrearProducto.valid ? this.llenarTabla() : this.mensajeService.mensajeAdvertencia(`Advertencia`, "Hay campos vacios");

  // Funcion que va a validar los campos del formulario de existencias
  validarCamposVaciosPresentacion = () => this.FormCrearPresentacionProducto.valid ? this.llenarTablaPresentacion() : this.mensajeService.mensajeAdvertencia(`Advertencia`, "Hay campos vacios");

  // Funcion que va a crear un producto y lo va a asociar a un cliente
  llenarTabla(){
    const datosProductos : any = {
      Prod_Id: this.FormCrearProducto.value.ProduId,
      Prod_Nombre: (this.FormCrearProducto.value.ProduNombre).toUpperCase(),
      Prod_Descripcion: (this.FormCrearProducto.value.ProduNombre).toUpperCase(),
      TpProd_Id: this.FormCrearProducto.value.ProduTipo,
      Prod_Peso: 0,
      Prod_Peso_Millar: 0,
      UndMedPeso: 'Kg',
      Prod_Fuelle: this.FormCrearProducto.value.ProduFuelle,
      Prod_Ancho: this.FormCrearProducto.value.ProduAncho,
      Prod_Calibre: this.FormCrearProducto.value.ProduCalibre,
      UndMedACF: this.FormCrearProducto.value.ProduUnidadMedidaACF,
      Estado_Id: 0,
      Prod_Largo: this.FormCrearProducto.value.ProduLargo,
      Pigmt_Id: this.FormCrearProducto.value.ProduPigmento,
      Material_Id: this.FormCrearProducto.value.ProduMaterial,
      Prod_Fecha : this.today,
      Prod_Hora : moment().format('H:mm:ss'),
      TpSellado_Id : this.FormCrearProducto.value.ProduSellado,
      Prod_CantBolsasBulto: this.FormCrearProducto.value.ProduBolsasBulto,
      Prod_CantBolsasPaquete: this.FormCrearProducto.value.ProduBolsasPaquete,
      Prod_PrecioDia_Sellado : 0,
      Prod_PrecioNoche_Sellado : 0,
      Prod_Peso_Paquete : 0,
      Prod_Peso_Bulto : 0,
    };
    if (this.ValidarRol == 2) datosProductos.Estado_Id = 9;
    else if (this.ValidarRol == 1) datosProductos.Estado_Id = 10;

    this.productoService.srvGuardar(datosProductos).subscribe(() => {
      this.mensajeService.mensajeConfirmacion(`¡Producto creado!`, 'Se creó el producto de manera satisfactoria y se asoció al cliente');
      this.LimpiarCampos();
    }, error => this.mensajeService.mensajeError('¡Ocurrió un error al crear el producto!', error.message));
  }

  //Funcion que va a crear una existencia para un producto
  llenarTablaPresentacion(){
    const datosExistencias : any = {
      Prod_Id: this.FormCrearPresentacionProducto.value.ProdId,
      ExProd_Cantidad: this.FormCrearPresentacionProducto.value.ProduCantidad,
      TpBod_Id: 2,
      UndMed_Id: this.FormCrearPresentacionProducto.value.ProduUnidadMedidaCant,
      ExProd_Precio: this.FormCrearPresentacionProducto.value.ProduPrecioUnd,
      ExProd_PrecioExistencia: this.FormCrearPresentacionProducto.value.ProduPrecioUnd * this.FormCrearPresentacionProducto.value.ProduCantidad,
      ExProd_PrecioSinInflacion: 0,
      TpMoneda_Id: this.FormCrearPresentacionProducto.value.ProduTipoMoneda,
      ExProd_PrecioVenta: this.FormCrearPresentacionProducto.value.ProduPrecioUnd,
      Exprod_CantMinima : 0,
      ExProd_Fecha : moment().format('YYYY-MM-DD'),
      ExProd_Hora : moment().format('H:mm:ss'),
    };
    this.existenciasService.srvGuardar(datosExistencias).subscribe(() => {
      this.mensajeService.mensajeConfirmacion(`Existencia Creada`, `La existencia del producto con el ID ${this.FormCrearPresentacionProducto.value.ProdId} ha sido creada correctamente`);
      this.LimpiarCamposPresentacion();
    }, error => this.mensajeService.mensajeError('¡Ocurrió un error, no fue posible guardar la presentación!', error.message));
  }
}
