import { Component, Injectable, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { modelProducto } from 'src/app/Modelo/modelProducto';
import { BagproService } from 'src/app/Servicios/Bagpro.service';
import { InventarioZeusService } from 'src/app/Servicios/inventario-zeus.service';
import { InventarioArticuloZeusService } from 'src/app/Servicios/inventarioArticuloZeus.service';
import { ProductoService } from 'src/app/Servicios/producto.service';
import { SrvClienteOtItemsService } from 'src/app/Servicios/srv-cliente-ot-items.service';
import { SrvEstadosService } from 'src/app/Servicios/srv-estados.service';
import { TipoProductoService } from 'src/app/Servicios/tipo-producto.service';
import { UnidadMedidaService } from 'src/app/Servicios/unidad-medida.service';
import Swal from 'sweetalert2';
import { ModalGenerarInventarioZeusComponent } from '../modal-generar-inventario-zeus/modal-generar-inventario-zeus.component';


@Component({
  selector: 'app-producto',
  templateUrl: './producto.component.html',
  styleUrls: ['./producto.component.css']
})


export class ProductoComponent implements OnInit {

  @ViewChild(ModalGenerarInventarioZeusComponent) productoZeus : ModalGenerarInventarioZeusComponent;

  public formularioProducto !: FormGroup;

  titulosTabla = [];
  ArrayProductoZeus = [];
  datosTabla : any = [];
  public Url : any; //variable publica que va hacia el elemento html (input) en el atributo [src]
  public modalImagenCargada : boolean = false; //modal para cargar imagen
  public datosCodigo : string;

  constructor(private productoServices : ProductoService,
              private TipoProductoService : TipoProductoService,
              private UnidadMedidaService : UnidadMedidaService,
              private frmBuilderProducto : FormBuilder,
              private existenciasZeus : InventarioZeusService,
              private bagProServices : BagproService,
              private articulosZeus : InventarioArticuloZeusService,
              private clienteOtItems : SrvClienteOtItemsService) {



      this.formularioProducto = this.frmBuilderProducto.group({
        ProductoID : new FormControl(),
        ProductoNombre : new FormControl(),
        ProductoDescripcion: new FormControl(),
        ProductoTipo: new FormControl(),
        PesoBrutoProducto: new FormControl(),
        PesoNetoProducto: new FormControl(),
        ProductoUndPeso: new FormControl(),
        FuelleProducto: new FormControl(),
        AnchoProducto: new FormControl(),
        CalibreProducto: new FormControl(),
        ProductoUndFAC: new FormControl(),
        PrecioProducto: new FormControl(),
        nombreImagen: new FormControl(),
    });
   }

  ngOnInit(): void {
    //this.cargarUndMedida();
    //this.cargarTipoProducto();
    this.ColumnasTabla();
    //this.cargarTabla();

  }

  iniciarFormularios(){
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
      nombreImagen: [, Validators.required],
    });
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
    const campo = {
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
      Estado_Id: this.formularioProducto.get('')?.value,
      Prod_Largo: 0,
      Prod_Cod: 0,
      Pigmt_Id: 0,
      Material_Id: 0,
    }

    this.productoServices.srvGuardar(campo).subscribe(datos_Productos=>{
      Swal.fire('Registro exitoso');
      this.clear();
    }, error =>{
        Swal.fire('Ocurrió un error');
        console.log(error);
    });
  }

  ColumnasTabla(){
    this.titulosTabla = [];
    this.titulosTabla = [{
      cId :   "Id Cliente",
      cNombre :   "Nombre Cliente",
      pID : "Id Producto",
      pNombre : "Nombre Produto",
      pPrecioUnd : "Precio Und",
      pStock : "Existencias",
      pUndMed : "Und. Med",
      pPrecioTotal : "Precio Total"
    }]
  }


  cargarVistaInventarioZeus(){
    this.productoZeus.InventarioExistenciaZeus();
  }

/** Llenar el formulario
Al final campo para cargar una imagen
Al presionar el boton de agregar
Se guarda la imagen en una ruta en especifico
Luego cuando se consulte dicho registro (factura) se debe
buscar la ruta en que se encuentra la imagen y cargarla
en un enlace. y luego mostrarla*/

guardarImagenARuta(){
  let rutaGuardarImgs : string = "C:\\ImagenesEjemplo\\";
  let nombreArchivo : string = this.formularioProducto.get('nombreImagen')?.value;


  let RutaFakeImg = nombreArchivo;
  let NombreImagen = RutaFakeImg.substring(12);

  console.log(NombreImagen);
  console.log(rutaGuardarImgs + NombreImagen);

}
  //Llamar modal después de haber cargado la imagen.
  cargarImagen(event) {
  let nombreArchivo : string = this.formularioProducto.get('nombreImagen')?.value;
  //const file = event.target.files[0];
      if(event.target.files[0]) {
        let reader = new FileReader(); //Instancia de fileReader
        reader.readAsDataURL(event.target.files[0]);
        reader.onload = (event) =>
        this.Url = event.target.result;
        console.log(event.target.files[0]);
      }
        if(this.Url != "Sin archivos seleccionados") {
          console.log('Hola22');
        } else {
          console.log('Hola');
        }

  }

  llamarModalImagenCargada(){
    this.modalImagenCargada = true;
  }

}
