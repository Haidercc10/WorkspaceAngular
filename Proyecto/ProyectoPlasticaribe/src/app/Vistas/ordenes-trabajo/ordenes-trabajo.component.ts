import { Component, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MaterialProductoService } from 'src/app/Servicios/materialProducto.service';
import { PigmentoProductoService } from 'src/app/Servicios/pigmentoProducto.service';
import { TintasService } from 'src/app/Servicios/tintas.service';
import { UnidadMedidaService } from 'src/app/Servicios/unidad-medida.service';




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

  constructor(private frmBuilderPedExterno : FormBuilder,
    private servicioTintas : TintasService,
    private servicioMateriales : MaterialProductoService,
    private servicioPigmentos : PigmentoProductoService,
    private servicioUnidadMedida : UnidadMedidaService) {

    this.FormOrdenTrabajo = this.frmBuilderPedExterno.group({
      //Datos para la tabla de pedidos.
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
    this.ColumnasTabla();
    this.cargarTintasEnProcesoImpresion();
    this.cargarPigmentosEnProcesoExtrusion();
    this.cargarMaterialEnProcesoExtrusion();
    this.cargarUnidadMedidaEnProcesoExtrusion();
  }

  /** Función que cargará las tintas en los combobox al momento de crear la OT. */
  cargarTintasEnProcesoImpresion(){
    this.servicioTintas.srvObtenerLista().subscribe(registrosTintas => {
      for (let tin = 0; tin < registrosTintas.length; tin++) {
        this.arrayTintas.push(registrosTintas[tin]);
      }
    });

  }

  /** Función que cargará los pigmentos en el combobox al momento de crear la OT. */
  cargarPigmentosEnProcesoExtrusion(){
    this.servicioPigmentos.srvObtenerLista().subscribe(registrosPigmentos => {
      for (let pig = 0; pig < registrosPigmentos.length; pig++) {
        this.arrayPigmentos.push(registrosPigmentos[pig]);
      }
    });
  }


   /** Función que cargará los materiales en el combobox al momento de crear la OT. */
   cargarMaterialEnProcesoExtrusion(){
    this.servicioMateriales.srvObtenerLista().subscribe(registrosMateriasProd => {
      for (let matp = 0; matp < registrosMateriasProd.length; matp++) {
        this.arrayMateriales.push(registrosMateriasProd[matp]);
      }
    });
  }

   /** Función que cargará las unidades de medida en el combobox al momento de crear la OT. */
  cargarUnidadMedidaEnProcesoExtrusion(){
    this.servicioUnidadMedida.srvObtenerLista().subscribe(registros_unidadesMedida => {
      for (let und = 0; und < registros_unidadesMedida.length; und++) {
        this.arrayUnidadesMedidas.push(registros_unidadesMedida[und]);
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



}
