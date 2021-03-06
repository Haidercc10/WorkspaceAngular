import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ProductoService } from 'src/app/Servicios/producto.service';
import { SrvModalCrearProductosService } from 'src/app/Servicios/srv-modal-crear-productos.service';
import { TipoMonedaService } from 'src/app/Servicios/tipo-moneda.service';
import { TipoProductoService } from 'src/app/Servicios/tipo-producto.service';
import { UnidadMedidaService } from 'src/app/Servicios/unidad-medida.service';
import Swal from 'sweetalert2';
import {OpedidoproductoComponent} from 'src/app/Vistas/opedidoproducto/opedidoproducto.component'
import { ExistenciasProductosService } from 'src/app/Servicios/existencias-productos.service';
import { ClientesService } from 'src/app/Servicios/clientes.service';
import { UsuarioService } from 'src/app/Servicios/usuario.service';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { RolesService } from 'src/app/Servicios/roles.service';
import { MaterialProductoService } from 'src/app/Servicios/materialProducto.service';
import { PigmentoProductoService } from 'src/app/Servicios/pigmentoProducto.service';

@Component({
  selector: 'app-crear-producto',
  templateUrl: './crear-producto.component.html',
  styleUrls: ['./crear-producto.component.css']
})
export class CrearProductoComponent implements OnInit {

  public FormCrearProducto : FormGroup;
  public FormCrearPresentacionProducto : FormGroup;

  unidadMedida = [];
  tipoProducto = [];
  materialProducto = [];
  pigmentoProducto =[];
  tipoMoneda = [];
  producto = [];
  pedidosID = [];
  cliente = [];
  clienteDatos = [];
  storage_Id : number;
  storage_Nombre : any;
  storage_Rol : any;

  constructor(private frmBuilderCrearProducto : FormBuilder,
                private unidadMedidaService : UnidadMedidaService,
                  private tipoProductoService : TipoProductoService,
                    private tipoMonedaService : TipoMonedaService,
                      private productoService : ProductoService,
                        private pedidosProducto : OpedidoproductoComponent,
                         private existenciasService : ExistenciasProductosService,
                          private clientesService : ClientesService,
                            private usuarioService : UsuarioService,
                              @Inject(SESSION_STORAGE) private storage: WebStorageService,
                                private rolService : RolesService,
                                  private materialService : MaterialProductoService,
                                    private pigmentoServices : PigmentoProductoService) {

    this.FormCrearProducto = this.frmBuilderCrearProducto.group({

      //Instanciar campos que vienen del formulario
      ProduId: new FormControl(),
      ProduNombre: new FormControl(),
      ProduAncho: new FormControl(),
      ProduFuelle: new FormControl(),
      ProduCalibre: new FormControl(),
      ProduLargo : new FormControl(),
      ProduUnidadMedidaACF: new FormControl(),
      ProduTipo: new FormControl(),
      ProduMaterial: new FormControl(),
      ProduPigmento: new FormControl(),
      ProdDescripcion: new FormControl(),
      ClienteNombre: new FormControl(),
    });

    this.FormCrearPresentacionProducto = this.frmBuilderCrearProducto.group({
      ProdId: new FormControl(),
      ProduCantidad: new FormControl(),
      ProduUnidadMedidaCant: new FormControl(),
      ProduPrecioUnd: new FormControl(),
      ProduTipoMoneda: new FormControl(),
    });

  }

  ngOnInit(): void {
    this.initFormsCrearProducto
    this.undMedidaComboBox();
    this.tipoProductoComboBox();
    this.matrialProductoComboBox();
    this.pigmentoProductocomboBox();
    this.tipoMondedaComboBox();
    this.lecturaStorage();
    this.clientesComboBox();
  }

  initFormsCrearProducto() {
    //Campos que vienen del formulario
    this.FormCrearProducto = this.frmBuilderCrearProducto.group({
      //Datos para la tabla de productos. (Iguala el valor del campo en la vista)
       ProduId:['', Validators.required],
       ProduNombre: ['', Validators.required],
       ProduAncho: ['', Validators.required],
       ProduFuelle: ['', Validators.required],
       ProduCalibre: ['', Validators.required],
       ProduLargo : ['', Validators.required],
       ProduUnidadMedidaACF: ['', Validators.required],
       ProduTipo: ['', Validators.required],
       ProduMaterial: ['', Validators.required],
       ProduPigmento: ['', Validators.required],
       ProdDescripcion: ['',],
       ClienteNombre: ['', Validators.required],
     });

     this.FormCrearPresentacionProducto = this.frmBuilderCrearProducto.group({
      //Datos para la tabla de productos. (Iguala el valor del campo en la vista)
       ProdId:['', Validators.required],
       ProduCantidad: ['', Validators.required],
       ProduUnidadMedidaCant: ['', Validators.required],
       ProduPrecioUnd: ['', Validators.required],
       ProduTipoMoneda: ['', Validators.required],
     });
  }

  lecturaStorage(){
    this.storage_Id = this.storage.get('Id');
    this.storage_Nombre = this.storage.get('Nombre');
    let rol = this.storage.get('Rol');
    this.rolService.srvObtenerLista().subscribe(datos_roles => {
      for (let index = 0; index < datos_roles.length; index++) {
        if (datos_roles[index].rolUsu_Id == rol) {
          this.storage_Rol = datos_roles[index].rolUsu_Nombre;
        }
      }
    });
  }

  validarCamposVacios() : any{
    if(this.FormCrearProducto.valid) this.llenarTabla();
    else Swal.fire("Hay campos vacios");
  }

  validarCamposVaciosPresentacion() : any{
    if(this.FormCrearPresentacionProducto.valid) this.llenarTablaPresentacion();
    else Swal.fire("Hay campos vacios");
  }

  LimpiarCampos() {
    this.FormCrearProducto.reset();
  }

  LimpiarCamposPresentacion() {
    this.FormCrearPresentacionProducto.reset();
  }

  clientesComboBox() {
    this.usuarioService.srvObtenerListaPorId(this.storage.get('Id')).subscribe(datos_usuarios => {
      this.clientesService.srvObtenerLista().subscribe(datos_clientes => {
        for (let index = 0; index < datos_clientes.length; index++) {
          if (datos_clientes[index].estado_Id == 1) {
            if (datos_usuarios.rolUsu_Id == 2) {
              if (datos_clientes[index].usua_Id == datos_usuarios.usua_Id) {
                this.cliente.push(datos_clientes[index].cli_Nombre);
                this.clienteDatos.push(datos_clientes[index]);
                continue;
              }
            }else {
              this.cliente.push(datos_clientes[index].cli_Nombre);
              this.clienteDatos.push(datos_clientes[index]);
            }
          }
        }
      });
    });
  }

  undMedidaComboBox() {
    this.unidadMedidaService.srvObtenerLista().subscribe(datos_undMed => {
      for (let index = 0; index < datos_undMed.length; index++) {
        this.unidadMedida.push(datos_undMed[index].undMed_Id);
      }
    });
  }

  tipoProductoComboBox(){
    this.tipoProductoService.srvObtenerLista().subscribe(datos_tiposProductos => {
      for (let index = 0; index < datos_tiposProductos.length; index++) {
        this.tipoProducto.push(datos_tiposProductos[index].tpProd_Nombre);
      }
    })
  }

  // Funcion para llenar el comboBox de material del producto
  matrialProductoComboBox(){
    this.materialService.srvObtenerLista().subscribe(datos_material => {
      for (let index = 0; index < datos_material.length; index++) {
        this.materialProducto.push(datos_material[index].material_Nombre);
      }
    });
  }

  // Funcion para llenar el comboBox de pigmentos del producto
  pigmentoProductocomboBox(){
    this.pigmentoServices.srvObtenerLista().subscribe(datos_pigmentos => {
      for (let index = 0; index < datos_pigmentos.length; index++) {
        this.pigmentoProducto.push(datos_pigmentos[index].pigmt_Nombre);
      }
    });
  }

  tipoMondedaComboBox(){
    this.tipoMonedaService.srvObtenerLista().subscribe(datos_tiposMoneda => {
      for (let index = 0; index < datos_tiposMoneda.length; index++) {
        this.tipoMoneda.push(datos_tiposMoneda[index].tpMoneda_Id);
      }
    })
  }

  llenarTabla(){
    let id : any = this.FormCrearProducto.value.ProduId;
    let nombre : any = this.FormCrearProducto.value.ProduNombre;
    let ancho : any = this.FormCrearProducto.value.ProduAncho;
    let fuelle : any = this.FormCrearProducto.value.ProduFuelle;
    let calibre : any = this.FormCrearProducto.value.ProduCalibre;
    let largo : any = this.FormCrearProducto.value.ProduLargo;
    let undMed : any = this.FormCrearProducto.value.ProduUnidadMedidaACF;
    let tpProducto : any = this.FormCrearProducto.value.ProduTipo;
    let material : any = this.FormCrearProducto.value.ProduMaterial;
    let pigmento : any = this.FormCrearProducto.value.ProduPigmento;
    let cantidad : any = this.FormCrearProducto.value.ProduCantidad;
    let undMed2 : any = this.FormCrearProducto.value.ProduUnidadMedidaCant;
    let precio : any = this.FormCrearProducto.value.ProduPrecioUnd;
    let precioFinal : string = this.FormCrearProducto.value.ProduPrecioUnd;
    let moneda : any = this.FormCrearProducto.value.ProduTipoMoneda;
    let descripcion : any = this.FormCrearProducto.value.ProdDescripcion;
    let cliente : any = this.FormCrearProducto.value.ClienteNombre;

    this.pedidosProducto.llenarTablaProductosCreador(id, nombre, ancho, fuelle, calibre, largo, undMed, tpProducto, material, pigmento, cantidad, undMed2, precio, moneda, descripcion);
    this.pedidosProducto.registrarProducto(id, nombre, ancho, fuelle, calibre, largo, undMed, tpProducto, material, pigmento, descripcion, cliente);
    this.LimpiarCampos();
  }

  llenarTablaPresentacion(){
    let id : any = this.FormCrearPresentacionProducto.value.ProdId;
    let cantidad : any = this.FormCrearPresentacionProducto.value.ProduCantidad;
    let undMed2 : any = this.FormCrearPresentacionProducto.value.ProduUnidadMedidaCant;
    let precio : any = this.FormCrearPresentacionProducto.value.ProduPrecioUnd;
    let precioFinal : string = this.FormCrearPresentacionProducto.value.ProduPrecioUnd;
    let moneda : any = this.FormCrearPresentacionProducto.value.ProduTipoMoneda;
    this.pedidosProducto.registrarExistenciaProducto(id, cantidad, undMed2, precio, precioFinal, moneda);
    this.LimpiarCamposPresentacion();
  }


}
