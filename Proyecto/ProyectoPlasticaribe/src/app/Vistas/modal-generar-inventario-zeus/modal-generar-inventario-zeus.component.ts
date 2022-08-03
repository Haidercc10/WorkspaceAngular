import { Component, Injectable, OnInit } from '@angular/core';
import { InventarioZeusService } from 'src/app/Servicios/inventario-zeus.service';
import { SrvClienteOtItemsService } from 'src/app/Servicios/srv-cliente-ot-items.service';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-modal-generar-inventario-zeus',
  templateUrl: './modal-generar-inventario-zeus.component.html',
  styleUrls: ['./modal-generar-inventario-zeus.component.css']
})

@Injectable({
  providedIn: 'root'
})

export class ModalGenerarInventarioZeusComponent implements OnInit {


  public titulosTabla : any = [];
  public arrayInventario = [];
  public datosCodigo : string;
  ArrayProductoZeus = [];
  public nombreArchivo = "Inventario de Productos Terminados.xlsx"
  public page : number;

  constructor(private existenciasZeus : InventarioZeusService,
    private clienteOtItems : SrvClienteOtItemsService) { }

  ngOnInit(): void {
    this.ColumnasTabla();
  }

  ColumnasTabla(){
    this.titulosTabla = [{
      invItem : "Item",
      invNombre : "Nombre",
      invStock : "Existencias",
      invPrecio : "Precio",
      invSubtotal : "Subtotal",
      invCliente : "Cliente",
    }];
  }

  exportarExcel(){
    if (this.ArrayProductoZeus.length == 0) Swal.fire("Para generar el archivo de Excel, debe haber productos en la tabla");
    else {
      let element = document.getElementById('tablaProductosTerminados');
      const worksheet : XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);
      const book : XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(book, worksheet, 'Sheet1');
      XLSX.writeFile(book, this.nombreArchivo);
    }
  }


  cargarTablaArticulos(){

  }

  /** Generar inventario de productos con más de 1.0 de existencias en Zeus y BagPro. */
  InventarioExistenciaZeus(){
    this.existenciasZeus.srvObtenerExistenciasArticulosZeus().subscribe(datosExistencias => {

      for (let exi = 0; exi < datosExistencias.length; exi++) {
        this.datosCodigo = datosExistencias[exi].codigo;

        this.clienteOtItems.srvObtenerItemsBagproXClienteItem(this.datosCodigo).subscribe(datosCLOTI => {
          for (let cl = 0; cl < datosCLOTI.length; cl++) {
            if(datosCLOTI[cl].clienteItems == datosExistencias[exi].codigo) {
              const datosInventario: any = {
                codigoItem : datosCLOTI[cl].clienteItems,
                nombreItem : datosCLOTI[cl].clienteItemsNom,
                cantidadItem : datosExistencias[exi].existencias,
                PrecioItem : datosExistencias[exi].precioVenta,
                PrecioTotalItem : datosExistencias[exi].precio_Total,
                ClienteNombre : datosCLOTI[cl].clienteNom,
              }
              //console.log(datosInventario);
              this.ArrayProductoZeus.push(datosInventario);
            }
          }

        });

      }
    });


  }

}
