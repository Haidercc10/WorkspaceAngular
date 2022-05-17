import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ProductoService } from 'src/app/Servicios/producto.service';
import { SrvModalCrearProductosService } from 'src/app/Servicios/srv-modal-crear-productos.service';
import { TipoMonedaService } from 'src/app/Servicios/tipo-moneda.service';
import { TipoProductoService } from 'src/app/Servicios/tipo-producto.service';
import { UnidadMedidaService } from 'src/app/Servicios/unidad-medida.service';
import Swal from 'sweetalert2';
import {OpedidoproductoComponent} from 'src/app/Vistas/opedidoproducto/opedidoproducto.component'

@Component({
  selector: 'app-crear-producto',
  templateUrl: './crear-producto.component.html',
  styleUrls: ['./crear-producto.component.css']
})
export class CrearProductoComponent implements OnInit {

  public FormCrearProducto : FormGroup;

  unidadMedida = [];
  tipoProducto = [];
  tipoMoneda = [];
  producto = [];

  constructor(private frmBuilderCrearProducto : FormBuilder,  
                private unidadMedidaService : UnidadMedidaService,
                  private tipoProductoService : TipoProductoService,
                    private tipoMonedaService : TipoMonedaService,
                      private productoService : ProductoService,
                        private pedidosProducto : OpedidoproductoComponent) {

    this.FormCrearProducto = this.frmBuilderCrearProducto.group({

      //Instanciar campos que vienen del formulario
      ProduId: new FormControl(),
      ProduNombre: new FormControl(),
      ProduAncho: new FormControl(),
      ProduFuelle: new FormControl(),
      ProduCalibre: new FormControl(),
      ProduUnidadMedidaACF: new FormControl(),
      ProduTipo: new FormControl(),
      ProduCantidad: new FormControl(),
      ProduUnidadMedidaCant: new FormControl(),
      ProduPrecioUnd: new FormControl(),
      ProduTipoMoneda: new FormControl(),
      ProdDescripcion: new FormControl()
    })

  }

  ngOnInit(): void {
    this.initFormsCrearProducto
    this.undMedidaComboBox();
    this.tipoProductoComboBox();
    this.tipoMondedaComboBox();
  }

  initFormsCrearProducto() {
    //Campos que vienen del formulario
    this.FormCrearProducto = this.frmBuilderCrearProducto.group({
      //Datos para la tabla de productos. (Iguala el valor del campo en la vista)
       ProduId:['',],
       ProduNombre: ['', Validators.required],
       ProduAncho: ['', Validators.required],
       ProduFuelle: ['', Validators.required],
       ProduCalibre: ['', Validators.required],
       ProduUnidadMedidaACF: ['', Validators.required],
       ProduTipo: ['', Validators.required],
       ProduCantidad: ['', Validators.required],
       ProduUnidadMedidaCant: ['', Validators.required],
       ProduPrecioUnd: ['', Validators.required],
       ProduTipoMoneda: ['', Validators.required],
       ProdDescripcion: ['',],
     })
  }

  validarCamposVacios() : any{
    if(this.FormCrearProducto.valid){
      Swal.fire("Los datos se enviaron correctamente");
      console.log(this.FormCrearProducto);
    }else{
      Swal.fire("Hay campos vacios");
      console.log(this.FormCrearProducto);
    }
  }

  LimpiarCampos() {
  this.FormCrearProducto.reset();
  }

  undMedidaComboBox() {
    this.unidadMedidaService.srvObtenerLista().subscribe(datos_undMed => {
      for (let index = 0; index < datos_undMed.length; index++) {
        this.unidadMedida.push(datos_undMed[index].undMed_Nombre);
      }
    }, error => { Swal.fire('Ocurrió un error, intentelo de nuevo'); });
  }

  tipoProductoComboBox(){
    this.tipoProductoService.srvObtenerLista().subscribe(datos_tiposProductos => {
      for (let index = 0; index < datos_tiposProductos.length; index++) {
        this.tipoProducto.push(datos_tiposProductos[index].tpProd_Nombre);        
      }
    })
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
    let nombre : string = this.FormCrearProducto.value.ProduNombre;
    let ancho : any = this.FormCrearProducto.value.ProduAncho;
    let fuelle : any = this.FormCrearProducto.value.ProduFuelle;
    let calibre : any = this.FormCrearProducto.value.ProduCalibre;
    let undMed : string = this.FormCrearProducto.value.ProduUnidadMedidaACF;
    let tpProducto : string = this.FormCrearProducto.value.ProduTipo;
    let cantidad : any = this.FormCrearProducto.value.ProduCantidad;
    let undMed2 : string = this.FormCrearProducto.value.ProduUnidadMedidaCant;
    let precio : any = this.FormCrearProducto.value.ProduPrecioUnd;
    let moneda : string = this.FormCrearProducto.value.ProduTipoMoneda;
    let descripcion : string = this.FormCrearProducto.value.ProdDescripcion;
   
    this.pedidosProducto.llenarTablaProductosCreador(id, nombre, ancho, fuelle, calibre, undMed, tpProducto, cantidad, undMed2, precio, moneda, descripcion);
    this.LimpiarCampos();
  }

}
