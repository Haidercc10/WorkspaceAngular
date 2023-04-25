import { Component, Inject, Injectable, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { ClientesService } from 'src/app/Servicios/Clientes/clientes.service';
import { ClientesProductosService } from 'src/app/Servicios/Clientes_Productos/ClientesProductos.service';
import { ExistenciasProductosService } from 'src/app/Servicios/ExistenciasProductos/existencias-productos.service';
import { MaterialProductoService } from 'src/app/Servicios/MaterialProducto/materialProducto.service';
import { PigmentoProductoService } from 'src/app/Servicios/PigmentosProductos/pigmentoProducto.service';
import { ProductoService } from 'src/app/Servicios/Productos/producto.service';
import { RolesService } from 'src/app/Servicios/Roles/roles.service';
import { TipoMonedaService } from 'src/app/Servicios/TipoMoneda/tipo-moneda.service';
import { TipoProductoService } from 'src/app/Servicios/TipoProducto/tipo-producto.service';
import { TiposSelladoService } from 'src/app/Servicios/TiposSellado/TiposSellado.service';
import { UnidadMedidaService } from 'src/app/Servicios/UnidadMedida/unidad-medida.service';
import { UsuarioService } from 'src/app/Servicios/Usuarios/usuario.service';
import { AppComponent } from 'src/app/app.component';
import Swal from 'sweetalert2';

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
  tipoProducto : any [] = []; //Variable que almacenará los tipos de productos
  materialProducto : any [] = []; //Variable que almacenará los materiales
  pigmentoProducto : any [] = []; //Variable que almancenará los pigmentos
  tipoMoneda : any [] = []; //Variable que almacenará los tipos de monedas
  tiposSellado : any [] = [];  //Variable que almacenará los tipos de sellados
  cliente : any [] = []; //Variable que almacenará los clientes

  constructor(private frmBuilderCrearProducto : FormBuilder,
                private unidadMedidaService : UnidadMedidaService,
                  private tipoProductoService : TipoProductoService,
                    private tipoMonedaService : TipoMonedaService,
                      private productoService : ProductoService,
                        private existenciasService : ExistenciasProductosService,
                          private clientesService : ClientesService,
                            private usuarioService : UsuarioService,
                              private AppComponent : AppComponent,
                                private materialService : MaterialProductoService,
                                  private pigmentoServices : PigmentoProductoService,
                                    private tipoSelladoService : TiposSelladoService,
                                      private ClientesProductosService : ClientesProductosService,) {

    this.FormCrearProducto = this.frmBuilderCrearProducto.group({
      ProduId:[null, Validators.required],
      ProduNombre: [null, Validators.required],
      ProduAncho: [null, Validators.required],
      ProduFuelle: [null, Validators.required],
      ProduCalibre: [null, Validators.required],
      ProduLargo : [null, Validators.required],
      ProduUnidadMedidaACF: [null, Validators.required],
      ProduTipo: [null, Validators.required],
      ProduSellado: [null, Validators.required],
      ProduMaterial: [null, Validators.required],
      ProduPigmento: [null, Validators.required],
      ProdDescripcion: '',
      ClienteNombre: [null, Validators.required],
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
    this.clientesComboBox();
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
    this.productoService.GetIdUltimoProducto().subscribe(datos => {
      this.FormCrearProducto.patchValue({ ProduId:datos + 1, });
    });
  }

  // Funcion que va a limpiar los campos del formulario de existencias
  LimpiarCamposPresentacion() {
    this.FormCrearPresentacionProducto.setValue({
      ProdId:null,
      ProduCantidad: 0,
      ProduUnidadMedidaCant: 'Kg',
      ProduPrecioUnd: 0,
      ProduTipoMoneda: 'COP',
    });
  }

  // Funcion que consultará y almacenará los tipos de sellado
  tiposSelladoComboBox(){
    this.tipoSelladoService.srvObtenerLista().subscribe(datos_tpSelado => { this.tiposSellado = datos_tpSelado; });
  }

  // Funcion que consultará y almacenará los clientes
  clientesComboBox() {
    this.usuarioService.srvObtenerListaPorId(this.storage_Id).subscribe(datos_usuarios => {
      this.clientesService.srvObtenerListaPorEstado(1).subscribe(datos_clientes => {
        for (let index = 0; index < datos_clientes.length; index++) {
          if (datos_usuarios.rolUsu_Id == 2) this.cliente.push(datos_clientes[index]);
          else this.cliente.push(datos_clientes[index]);
          this.cliente.sort((a,b) => a.cli_Nombre.localeCompare(b.cli_Nombre));
        }
      });
    });
  }

  // Funcion que consultará y almacenará las unidades de medida
  undMedidaComboBox() {
    this.unidadMedidaService.srvObtenerLista().subscribe(datos_undMed => { this.unidadMedida = datos_undMed; });
  }

  // Funcion que consultará y almacenará los tipos de productos
  tipoProductoComboBox(){
    this.tipoProductoService.srvObtenerLista().subscribe(datos_tiposProductos => { this.tipoProducto = datos_tiposProductos; });
  }

  // Funcion para llenar el comboBox de material del producto
  matrialProductoComboBox(){
    this.materialService.srvObtenerLista().subscribe(datos_material => { this.materialProducto = datos_material; });
  }

  // Funcion para llenar el comboBox de pigmentos del producto
  pigmentoProductocomboBox(){
    this.pigmentoServices.srvObtenerLista().subscribe(datos_pigmentos => { this.pigmentoProducto = datos_pigmentos; });
  }

  // Funcion que consultará y almacenará los tipos de monedas
  tipoMondedaComboBox(){
    this.tipoMonedaService.srvObtenerLista().subscribe(datos_tiposMoneda => { this.tipoMoneda = datos_tiposMoneda; })
  }

  // Funcion que va a validar los campos del formulario de productos
  validarCamposVacios() : any{
    if(this.FormCrearProducto.valid) this.llenarTabla();
    else this.mensajeAdvertencia("Hay campos vacios");
  }

  // Funcion que va a validar los campos del formulario de existencias
  validarCamposVaciosPresentacion() : any{
    if(this.FormCrearPresentacionProducto.valid) this.llenarTablaPresentacion();
    else this.mensajeAdvertencia("Hay campos vacios");
  }

  // Funcion que va a crear un producto y lo va a asociar a un cliente
  llenarTabla(){
    if (this.ValidarRol == 2) {
      const datosProductos : any = {
        Prod_Id: this.FormCrearProducto.value.ProduId,
        Prod_Nombre: this.FormCrearProducto.value.ProduNombre,
        Prod_Descripcion: this.FormCrearProducto.value.ProdDescripcion,
        TpProd_Id: this.FormCrearProducto.value.ProduTipo,
        Prod_Peso: 0,
        Prod_Peso_Millar: 0,
        UndMedPeso: 'Kg',
        Prod_Fuelle: this.FormCrearProducto.value.ProduFuelle,
        Prod_Ancho: this.FormCrearProducto.value.ProduAncho,
        Prod_Calibre: this.FormCrearProducto.value.ProduCalibre,
        UndMedACF: this.FormCrearProducto.value.ProduUnidadMedidaACF,
        Estado_Id: 9,
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
      const clienteproducto : any = {
        Cli_Id: this.FormCrearProducto.value.ClienteNombre,
        Prod_Id: this.FormCrearProducto.value.ProduId
      }
      this.productoService.srvGuardar(datosProductos).subscribe(datos => {
        this.ClientesProductosService.srvGuardar(clienteproducto).subscribe(datos =>{
          this.mensajeSatisfactorio('Se creó el producto de manera satisfactoria y se asoció al cliente');
          this.LimpiarCampos();
        }, error => { this.mensajeError('¡Ocurrió un error al crear la relación del producto con el cliente producto!', error.message); });
      }, error => { this.mensajeError('¡Ocurrió un error al crear el producto!', error.message); });
    }else if (this.ValidarRol == 1){
      const datosProductos : any = {
        Prod_Id: this.FormCrearProducto.value.ProduId,
        Prod_Nombre: this.FormCrearProducto.value.ProduNombre,
        Prod_Descripcion: this.FormCrearProducto.value.ProdDescripcion,
        TpProd_Id: this.FormCrearProducto.value.ProduTipo,
        Prod_Peso: 0,
        Prod_Peso_Millar: 0,
        UndMedPeso: 'Kg',
        Prod_Fuelle: this.FormCrearProducto.value.ProduFuelle,
        Prod_Ancho: this.FormCrearProducto.value.ProduAncho,
        Prod_Calibre: this.FormCrearProducto.value.ProduCalibre,
        UndMedACF: this.FormCrearProducto.value.ProduUnidadMedidaACF,
        Estado_Id: 10,
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
      const clienteproducto : any = {
        Cli_Id: this.FormCrearProducto.value.ClienteNombre,
        Prod_Id: this.FormCrearProducto.value.ProduId
      }
      this.productoService.srvGuardar(datosProductos).subscribe(datos => {
        this.ClientesProductosService.srvGuardar(clienteproducto).subscribe(datos =>{
          this.mensajeSatisfactorio('Se creó el producto de manera satisfactoria y se asoció al cliente');
          this.LimpiarCampos();
        }, error => { this.mensajeError('¡Ocurrió un error al crear la relación del producto con el cliente producto!', error.message); });
      }, error => { this.mensajeError('¡Ocurrió un error al crear el producto!', error.message); });
    }
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
    this.existenciasService.srvGuardar(datosExistencias).subscribe(datos_existencias => {
      this.mensajeSatisfactorio(`La existencia del producto con el ID ${this.FormCrearPresentacionProducto.value.ProdId} ha sido creada correctamente`);
      this.LimpiarCamposPresentacion();
    }, error => { this.mensajeError('¡Ocurrió un error, no fue posible guardar la presentación!', error.message); });
  }

  // Mensaje Satisfactorio
  mensajeSatisfactorio(mensaje : string){
    Swal.fire({ icon: 'success', title: 'Guardado Exitoso', html:`<b>${mensaje}</b><hr> `, showCloseButton: true, });
  }

  // Mensaje de Advertencia
  mensajeAdvertencia(mensaje : string, mensaje2 : string = ''){
    Swal.fire({ icon: 'warning', title: 'Advertencia', html:`<b>${mensaje}</b><hr> ` + `<spam>${mensaje2}</spam>`, showCloseButton: true, });
  }

  // Mensaje de Error
  mensajeError(text : string, error : any = ''){
    Swal.fire({ icon: 'error', title: 'Error', html: `<b>${text}</b><hr> ` +  `<spam style="color : #f00;">${error}</spam> `, showCloseButton: true, });
  }
}
