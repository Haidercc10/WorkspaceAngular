import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { modelProducto } from 'src/app/Modelo/modelProducto';
import { BagproService } from 'src/app/Servicios/Bagpro.service';
import { InventarioZeusService } from 'src/app/Servicios/inventario-zeus.service';
import { InventarioArticuloZeusService } from 'src/app/Servicios/inventarioArticuloZeus.service';
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

  titulosTabla = [];
  ArrayProducto = [];
  datosTabla : any = [];


  constructor(private productoServices : ProductoService,
              private TipoProductoService : TipoProductoService,
              private UnidadMedidaService : UnidadMedidaService,
              private frmBuilderProducto : FormBuilder,
              private existenciasZeus : InventarioZeusService,
              private bagProServices : BagproService,
              private articulosZeus : InventarioArticuloZeusService) {

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
    this.ColumnasTabla();
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


  InventarioExistenciaZeus(){
    this.existenciasZeus.srvObtenerExistenciasZeus().subscribe(datosExistencias => {

      for (let exi = 0; exi < datosExistencias.length; exi++) {
        let CampoArticulo: any = datosExistencias[exi].articulo;

        this.articulosZeus.srvObtenerListaPorId(CampoArticulo).subscribe(datosArticulos => {
          //for (let art = 0; art < datosArticulos.length; art++) {
            let CampoCodigo: any = datosArticulos.codigo;

            this.bagProServices.srvObtenerListaClienteOTItemsXItem(CampoCodigo).subscribe(datosClientesOtItems =>{
                for (let cl = 0; cl < datosClientesOtItems.length; cl++) {

                        if(datosExistencias[exi].bodega == '003'
                        && datosExistencias[exi].existencias >= 1.0000
                        && datosExistencias[exi].articulo == datosArticulos.idArticulo
                        && datosArticulos.tipo == 'PRODUCTO TERMINADO'
                        && datosArticulos.codigo == datosClientesOtItems[cl].clienteItems.toString())
                        {

                            this.datosTabla = {
                              //ArticuloId : datosArticulos[art].idArticulo,
                              //ExistArticulo : datosExistencias[exi].articulo,
                              ArticuloCodigo : datosArticulos.codigo,
                              ArticuloNombre : datosArticulos.nombre,
                              ArticuloPrecio : datosArticulos.precioVenta,
                              ExistExistencia : datosExistencias[exi].existencias,
                              //ClotiItemId : datosClientesOtItems[cl].clienteItems.toString(),
                              ClotiCliente : datosClientesOtItems[cl].clienteNom,
                              //ArticuloTipo : datosArticulos[art].tipo,
                            }

                            console.log(this.datosTabla);
                        }



                }

            });
          //}
          });

      }
      });


  }

/** Llenar el formulario
Al final campo para cargar una imagen
Al presionar el boton de agregar
Se guarda la imagen en una ruta en especifico
Luego cuando se consulte dicho registro (factura) se debe
buscar la ruta en que se encuentra la imagen y cargarla en un enlace. */
  guardarImagenDesdeRuta(){
    let nombreArchivo : string;
    let rutaImagen : string = "C:\ImagenesEjemplo";




  }


}
