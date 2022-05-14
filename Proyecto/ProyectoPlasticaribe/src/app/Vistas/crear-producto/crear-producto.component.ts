import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ProductoService } from 'src/app/Servicios/producto.service';
import { SrvModalCrearProductosService } from 'src/app/Servicios/srv-modal-crear-productos.service';
import { TipoMonedaService } from 'src/app/Servicios/tipo-moneda.service';
import { TipoProductoService } from 'src/app/Servicios/tipo-producto.service';
import { UnidadMedidaService } from 'src/app/Servicios/unidad-medida.service';
import Swal from 'sweetalert2';

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
                      private productoService : ProductoService) {

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
      ProduStock: new FormControl()
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
       ProduId:[''],
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
       ProduStock: ['', Validators.required]
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

  buscar(){
    this.producto = [];
    if (this.FormCrearProducto.value.ProduId == "" || this.FormCrearProducto.value.ProduId == 0) {
      this.producto = [];
    } else {      
      this.productoService.srvObtenerListaPorId(this.FormCrearProducto.value.ProduId).subscribe(datos_Productos => {
        this.producto.push(datos_Productos);
        console.log(this.producto);
      });
    }
  }
}
