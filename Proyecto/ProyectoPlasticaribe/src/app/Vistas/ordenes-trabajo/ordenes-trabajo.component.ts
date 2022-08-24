import { Component, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';




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

  extrusion : boolean = false; //variable que va a mostrar o no el apartado de extrusion, dependiendo de su valor
  impresion : boolean = false; //variable que va a mostrar o no el apartado de impresion, dependiendo de su valor
  laminado : boolean = false; //variable que va a mostrar o no el apartado de laminado, dependiendo de su valor

  constructor(private frmBuilderPedExterno : FormBuilder,) {

    this.FormOrdenTrabajo = this.frmBuilderPedExterno.group({
      //Datos para la tabla de pedidos.
      OT_Id: ['', Validators.required],
      Pedido_Id: ['', Validators.required],
      Nombre_Vendedor: ['', Validators.required],
      OT_FechaCreacion: ['', Validators.required],
      OT_FechaEntrega: ['', Validators.required],
      Id_Cliente: ['', Validators.required],
      Nombre_Cliente: ['', Validators.required],
      Ciudad_SedeCliente: ['', Validators.required],
      Direccion_SedeCliente : ['', Validators.required],
      OT_Estado : ['', Validators.required],
    });

    this.FormOrdenTrabajoExtrusion = this.frmBuilderPedExterno.group({

    });

    this.FormOrdenTrabajoImpresion = this.frmBuilderPedExterno.group({

    });

    this.FormOrdenTrabajoLaminado = this.frmBuilderPedExterno.group({

    });

   }

  public titulosTabla = []; //Variable que llenará los titulos de la tabla






  ngOnInit(): void {
    this.ColumnasTabla();
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
