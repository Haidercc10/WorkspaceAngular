import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { modelProducto } from 'src/app/Modelo/modelProducto';
import { ProductoService } from 'src/app/Servicios/producto.service';
import { TipoProductoService } from 'src/app/Servicios/tipo-producto.service';
import { UnidadMedidaService } from 'src/app/Servicios/unidad-medida.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-producto',
  templateUrl: './producto.component.html',
  styleUrls: ['./producto.component.css']
})

export class ProductoComponent implements OnInit {

  public formularioProducto !: FormGroup;

  constructor(private productoServices : ProductoService, private TipoProductoService : TipoProductoService, private UnidadMedidaService : UnidadMedidaService, private frmBuilderProducto : FormBuilder) {
    this.formularioProducto = this.frmBuilderProducto.group({
      ProductoID: [, Validators.required],
      ProductoNombre: [, Validators.required],
      ProductoDescripcion: ['',],
      ProductoTipo: [, Validators.required],
      PesoBrutoProducto: [, Validators.required],
      PesoNetoProducto: [, Validators.required],
      ProductoUndPeso: [, Validators.required],
      FuelleProducto: ['',],
      AnchoProducto: ['',],
      CalibreProducto: ['',],
      ProductoUndFAC: [, Validators.required],
      PrecioProducto: [, Validators.required],
    });
   }

  ngOnInit(): void { 
    this.cargarUndMedida();
    this.cargarTipoProducto();
    //this.cargarTabla();
  }

  // FUNCION PARA CARGAR LAS UNIDADES DE MEDIDA EN UN COMBOBOX DESDE QUE INCIA LA PAGINA 
  cargarUndMedida(){
    this.UnidadMedidaService.srvObtenerLista().subscribe(datos_undMedida=>{
      console.log(datos_undMedida);
        const unidadesMedida = datos_undMedida;
        console.log(unidadesMedida);
    }, error =>{ Swal.fire('Ocurrió un error, intentelo de nuevo'); });
  }

  // FUNCION PARA CARGAR LOS TIPOS DE PRODUCTOS EN UN CONBOX DESDE QUE INICIA LA PAGINA
  cargarTipoProducto(){
    this.TipoProductoService.srvObtenerLista().subscribe(datos_TipoProducto=>{
      console.log(datos_TipoProducto);
      document.getElementById('TipoProducto')?.innerHTML;
    }, error =>{ Swal.fire('Ocurrió un error, intentelo de nuevo'); });
  }

  /*FUNCION PARA VALIDAR QUE LOS DATOS QUE LOS CAMPOS DE TEXTO DE LA VISTA TIENEN DATOS VALIDOS.
  DE SER EL CASO QUE TNEGAN DATOS VALIDOS LLAMARÁ AL METODO AGREGAR*/
  validarCamposVacios() : any{
    if(this.formularioProducto.valid) this.agregar();
    else Swal.fire("HAY CAMPOS VACIOS");
  }

  // FUNCION PARA LIMIPAR (PONER EN BLANCO) LOS CAMPOS DE VISTA
  clear(){ this.formularioProducto.reset(); }

  /*FUNCION PARA AGREGAR A LA BASE DE DATOS LOS DATOS (VALGA LA REDUNDANCIA) QUE SE DIGISTAN EN LOS INPUTS*/
  agregar(){
    const campo : modelProducto = {
      Prod_Id: this.formularioProducto.get('ProductoID')?.value,
      Prod_Nombre: this.formularioProducto.get('ProductoNombre')?.value,
      Prod_Descripcion: this.formularioProducto.get('ProductoDescripcion')?.value,
      TpProd_Id: this.formularioProducto.get('ProductoTipo')?.value,
      Prod_Peso_Bruto: this.formularioProducto.get('PesoBrutoProducto')?.value,
      Prod_Peso_Neto: this.formularioProducto.get('PesoNetoProducto')?.value,
      UndMedPeso: this.formularioProducto.get('ProductoUndPeso')?.value,
      Prod_Fuelle: this.formularioProducto.get('FuelleProducto')?.value,
      Prod_Ancho: this.formularioProducto.get('AnchoProducto')?.value,
      Prod_Calibre: this.formularioProducto.get('CalibreProducto')?.value,
      UndMedACF: this.formularioProducto.get('ProductoUndFAC')?.value,
    }

    this.productoServices.srvGuardar(campo).subscribe(datos_Productos=>{
      Swal.fire('Registro exitoso');
      this.clear();
    }, error =>{
        Swal.fire('Ocurrió un error');
        console.log(error);
    });
  }

  /* FUNCION PARA CAGAR LA INFORMACION DE LOS PRODUCTOS EN LA TABLA.
  EVENTUALMENTE SE APLICARA PARA QUE SE MUETREN UNA CANTIDAD PEQUEÑA DE PRODUCTOS Y SE ORGANICE POR PESTAÑAS O PAGINAS*/
  // cargarTabla(){
  //   this.productoServices.srvObtenerLista().subscribe(datos_productos=>{
  //     for (let i = 0; i < datos_productos.length; i++) {
  //       let productoId: number = datos_productos[i];
  //       let productoNombre: string = datos_productos[i];
  //       let ProductoDescripcion: string = datos_productos[i];
  //       let tipoProducto: number = datos_productos[i];
  //       let productoPesoBruto: number = datos_productos[i];
  //       let productosPesoNeto: number = datos_productos[i];
  //       let undMedidaPeso: string = datos_productos[i];
  //       let productoFuelle: number = datos_productos[i];
  //       let productoAncho: number = datos_productos[i];
  //       let productoCalibre: number = datos_productos[i];
  //       let undMedidaFAC: string = datos_productos[i];
  //     }
  //   }, error =>{ Swal.fire('Ocurrió un error, intentelo de nuevo'); });
  // }
}