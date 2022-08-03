import { Component, Inject, Injectable, OnInit } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { FiltrosProductosTerminadosZeusPipe } from 'src/app/Pipes/filtros-productos-terminados-zeus.pipe';
import { InventarioZeusService } from 'src/app/Servicios/inventario-zeus.service';
import { RolesService } from 'src/app/Servicios/roles.service';
import { SrvClienteOtItemsService } from 'src/app/Servicios/srv-cliente-ot-items.service';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { Ng2SearchPipeModule } from 'ng2-search-filter';

@Component({
  selector: 'app-modal-generar-inventario-zeus',
  templateUrl: './modal-generar-inventario-zeus.component.html',
  styleUrls: ['./modal-generar-inventario-zeus.component.css']
})

/*@Injectable({
  providedIn: 'root'
})*/

export class ModalGenerarInventarioZeusComponent implements OnInit {

  public titulosTabla : any = [];
  public arrayInventario = [];
  public datosCodigo : string;
  ArrayProductoZeus = [];
  public nombreArchivo = "Inventario de Productos Terminados.xlsx"
  public page : number;
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  public filtroNombre : any;
  public NombrePT = '';

  constructor(private existenciasZeus : InventarioZeusService,
    private clienteOtItems : SrvClienteOtItemsService,
    @Inject(SESSION_STORAGE) private storage: WebStorageService,
    private rolService : RolesService) { }

  ngOnInit(): void {
    this.lecturaStorage();
    this.ColumnasTabla();
    this.InventarioExistenciaZeus();
  }

  lecturaStorage(){
    this.storage_Id = this.storage.get('Id');
    this.storage_Nombre = this.storage.get('Nombre');
    let rol = this.storage.get('Rol');
    this.rolService.srvObtenerLista().subscribe(datos_roles => {
      for (let index = 0; index < datos_roles.length; index++) {
        if (datos_roles[index].rolUsu_Id == rol) {
          this.ValidarRol = rol;
          this.storage_Rol = datos_roles[index].rolUsu_Nombre;
        }
      }
    });
  }

    /* FUNCION PARA RELIZAR CONFIRMACIÓN DE SALIDA (CIERRE SESIÓN)*/
    confimacionSalida(){
      Swal.fire({
        title: '¿Seguro que desea salir?',
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: 'Salir',
        denyButtonText: `No Salir`,
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) window.location.href = "./";
      })
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

  /**Función para generar inventario de productos con más de 1.0 de existencias en Zeus y BagPro. */
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
              //this.NombrePT = datosInventario.nombreItem;
              //this.NombrePT = '';
            }
          }

        });

      }
    });


  }

}
