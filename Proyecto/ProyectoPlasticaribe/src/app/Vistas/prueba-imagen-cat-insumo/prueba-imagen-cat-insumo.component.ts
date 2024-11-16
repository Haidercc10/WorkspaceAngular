import { Component, Injectable, OnInit, ViewChild } from '@angular/core';
import { Formato_Facturas_VentasComponent } from '../Formato_Facturas_Ventas/Formato_Facturas_Ventas.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AppComponent } from 'src/app/app.component';
import moment from 'moment';
import { modelDevolucionProductos } from 'src/app/Modelo/modelDevolucionProductos';
import { modelDtProductoDevuelto } from 'src/app/Modelo/modelDtProductoDevuelto';
import { CreacionPdfService } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';
import { DetallesDevolucionesProductosService } from 'src/app/Servicios/DetallesDevolucionRollosFacturados/DetallesDevolucionesProductos.service';
import { DevolucionesProductosService } from 'src/app/Servicios/DevolucionesRollosFacturados/DevolucionesProductos.service';
import { Dt_OrdenFacturacionService } from 'src/app/Servicios/Dt_OrdenFacturacion/Dt_OrdenFacturacion.service';
import { FallasTecnicasService } from 'src/app/Servicios/FallasTecnicas/FallasTecnicas.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { Produccion_ProcesosService } from 'src/app/Servicios/Produccion_Procesos/Produccion_Procesos.service';
import { Table } from 'primeng/table';
import { ThisReceiver } from '@angular/compiler';
import { Devolucion_OrdenFacturacionComponent } from '../Devolucion_OrdenFacturacion/Devolucion_OrdenFacturacion.component';
import { create } from 'domain';
import { MovimientosOrdenFacturacionComponent } from '../Movimientos-OrdenFacturacion/Movimientos-OrdenFacturacion.component';
import { InventarioZeusService } from 'src/app/Servicios/InventarioZeus/inventario-zeus.service';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { ExistenciasProductosService } from 'src/app/Servicios/ExistenciasProductos/existencias-productos.service';

@Component({
  selector: 'app-prueba-imagen-cat-insumo',
  templateUrl: './prueba-imagen-cat-insumo.component.html',
  styleUrls: ['./prueba-imagen-cat-insumo.component.css']
})

@Injectable({
  providedIn: 'root'
})

export class PruebaImagenCatInsumoComponent implements OnInit {

  load: boolean = false;
  storage_Id: number | undefined;
  storage_Name: string | undefined;
  ValidarRol: number | undefined;
  form !: FormGroup;
  modoSeleccionado: boolean;
  production: Array<production> = [];
  productionSelected: Array<production> = [];
  consolidatedProduction: Array<production> = [];
  fails : Array<any> = [];
  devolution: boolean = false;
  statuses : Array<any> = [{id : 19, name : 'DISPONIBLE'}, {id : 23, name : 'NO DISPONIBLE'}];
  status : any = null;
  qtyRollsDv : number = 0;
  inventory : any = [];
  dataPL : Array<any> = [];
  dataZeus : Array<any> = [];
  modal : boolean = false;
  item : any = {};
  //@ViewChild(MovimientosOrdenFacturacionComponent) movOF : MovimientosOrdenFacturacionComponent;
  
  @ViewChild('tableOrder') tableOrder : Table | undefined;
  @ViewChild('tableZeus') tableZeus : Table | undefined;
  @ViewChild('tablePL') tablePL : Table | undefined;
  @ViewChild('dt') dt : Table | undefined;


  constructor(private formatoFacturas : Formato_Facturas_VentasComponent, 
    private appComponent: AppComponent,
    private frmBuilder: FormBuilder,
    private zeusService : InventarioZeusService,
    private bagProService : BagproService,
    private svExistProducts : ExistenciasProductosService, 
    private dtOrderFact : Dt_OrdenFacturacionService,
   ) {
      this.modoSeleccionado = appComponent.temaSeleccionado; 
  }

  ngOnInit() {
    
    this.dates();
    this.items();
  }

  dates(){
    let dates : any = [
      /*'12/01/2023',
      '18/01/2023',
      '18/01/2023',
      '19/01/2023',
      '20/01/2023',
      '20/01/2023',
      '23/01/2023',
      '24/01/2023',
      '24/01/2023',
      '26/01/2023',
      '27/01/2023',
      '27/01/2023',
      '28/01/2023',
      '30/01/2023',
      '31/01/2023',
      '02/02/2023',
      '03/02/2023',
      '08/02/2023',
      '10/02/2023',
      '10/02/2023',
      '14/02/2023',
      '15/02/2023',
      '24/02/2023',
      '06/03/2023',
      '16/03/2023',
      '16/03/2023',
      '28/03/2023',
      '28/03/2023',
      '29/03/2023',
      '31/03/2023',
      '31/03/2023',
      '13/04/2023',
      '17/04/2023',
      '19/04/2023',
      '19/04/2023',
      '20/04/2023',
      '20/04/2023',
      '25/04/2023',
      '28/04/2023',
      '28/04/2023',
      '28/04/2023',
      '28/04/2023',
      '28/04/2023',
      '10/05/2023',
      '19/05/2023',
      '19/05/2023',
      '19/05/2023',
      '19/05/2023',
      '19/05/2023',
      '26/05/2023',
      '26/05/2023',
      '26/05/2023',
      '26/05/2023',
      '26/05/2023',
      '26/05/2023',
      '26/05/2023',
      '29/05/2023',
      '02/06/2023',
      '09/06/2023',
      '13/06/2023',
      '20/06/2023',
      '20/06/2023',
      '20/06/2023',
      '21/06/2023',
      '21/06/2023',
      '21/06/2023',
      '22/06/2023',
      '22/06/2023',
      '23/06/2023',
      '26/06/2023',
      '27/06/2023',
      '29/06/2023',
      '29/06/2023',
      '29/06/2023',
      '30/06/2023',
      '01/07/2023',
      '10/07/2023',
      '13/07/2023',
      '18/07/2023',
      '18/07/2023',
      '19/07/2023',
      '21/07/2023',
      '25/07/2023',
      '31/07/2023',
      '31/07/2023',
      '31/07/2023',
      '31/07/2023',
      '31/07/2023',
      '31/07/2023',
      '31/07/2023',
      '31/07/2023',
      '09/08/2023',
      '09/08/2023',
      '11/08/2023',
      '11/08/2023',
      '11/08/2023',
      '11/08/2023',
      '11/08/2023',
      '15/08/2023',
      '17/08/2023',
      '18/08/2023',
      '18/08/2023',
      '18/08/2023',
      '18/08/2023',
      '18/08/2023',
      '18/08/2023',
      '19/08/2023',
      '23/08/2023',
      '25/08/2023',
      '25/08/2023',
      '25/08/2023',
      '28/08/2023',
      '28/08/2023',
      '31/08/2023',
      '31/08/2023',
      '31/08/2023',
      '31/08/2023',
      '31/08/2023',
      '31/08/2023',
      '06/09/2023',
      '07/09/2023',
      '07/09/2023',
      '08/09/2023',
      '11/09/2023',
      '12/09/2023',
      '13/09/2023',
      '13/09/2023',
      '15/09/2023',
      '15/09/2023',
      '15/09/2023',
      '19/09/2023',
      '19/09/2023',
      '19/09/2023',
      '19/09/2023',
      '19/09/2023',
      '19/09/2023',
      '19/09/2023',
      '21/09/2023',
      '29/09/2023',
      '29/09/2023',
      '29/09/2023',
      '29/09/2023',
      '02/10/2023',
      '02/10/2023',
      '03/10/2023',
      '06/10/2023',
      '06/10/2023',
      '06/10/2023',
      '06/10/2023',
      '06/10/2023',
      '06/10/2023',
      '06/10/2023',
      '06/10/2023',
      '06/10/2023',
      '07/10/2023',
      '11/10/2023',
      '11/10/2023',
      '11/10/2023',
      '11/10/2023',
      '11/10/2023',
      '13/10/2023',
      '18/10/2023',
      '18/10/2023',
      '18/10/2023',
      '18/10/2023',
      '18/10/2023',
      '18/10/2023',
      '18/10/2023',
      '18/10/2023',
      '19/10/2023',
      '20/10/2023',
      '25/10/2023',
      '25/10/2023',
      '25/10/2023',
      '27/10/2023',
      '27/10/2023',
      '27/10/2023',
      '27/10/2023',
      '03/11/2023',
      '08/11/2023',
      '10/11/2023',
      '10/11/2023',
      '10/11/2023',
      '11/11/2023',
      '16/11/2023',
      '16/11/2023',
      '16/11/2023',
      '16/11/2023',
      '16/11/2023',
      '16/11/2023',
      '16/11/2023',
      '16/11/2023',
      '16/11/2023',
      '23/11/2023',
      '23/11/2023',
      '28/11/2023',
      '28/11/2023',
      '28/11/2023',
      '29/11/2023',
      '29/11/2023',
      '29/11/2023',
      '29/11/2023',
      '29/11/2023',
      '29/11/2023',
      '29/11/2023',
      '29/11/2023',
      '30/11/2023',
      '30/11/2023',
      '30/11/2023',
      '30/11/2023',
      '02/12/2023',
      '06/12/2023',
      '06/12/2023',
      '06/12/2023',
      '07/12/2023',
      '07/12/2023',
      '07/12/2023',
      '07/12/2023',
      '07/12/2023',
      '12/12/2023',
      '12/12/2023',
      '12/12/2023',
      '15/12/2023',
      '22/12/2023',
      '22/12/2023',
      '22/12/2023',
      '22/12/2023',
      '22/12/2023',
      '22/12/2023',
      '26/12/2023',
      '26/12/2023',
      '26/12/2023',
      '26/12/2023',
      '26/12/2023',
      '26/12/2023',
      '28/04/2023',
      '27/04/2023',
      '28/04/2023',
      '27/04/2023',
      '26/08/2023',
      '25/10/2023',
      '26/10/2023',
      '27/10/2023',
      '23/11/2023',
      '23/11/2023',
      '24/11/2023',
      '24/11/2023',
      '24/11/2023',*/
      '28/04/2023',
      '28/04/2023',
      '29/04/2023',
      '29/04/2023',
      '23/06/2023',
      '23/06/2023',
      '23/06/2023',
      '23/06/2023',
      '23/06/2023',
      '23/06/2023',
      '23/06/2023',
      '23/06/2023',
      '23/06/2023',
      '23/06/2023',
      '17/08/2023',
      '17/08/2023',
      '17/08/2023',
      '18/08/2023',
      '18/08/2023',
      '18/08/2023',
      '18/08/2023',
      '23/08/2023',
      '23/08/2023',
      '24/08/2023',
      '24/08/2023',
      '25/08/2023',
      '25/08/2023',
      '25/08/2023',
      '28/08/2023',
      '28/08/2023',
      '28/08/2023',
      '28/08/2023',
      '28/08/2023',
      '28/08/2023',
      '29/08/2023',
      '29/08/2023',
      '29/08/2023',
      '29/08/2023',
      '29/08/2023',
      '29/08/2023',
      '29/08/2023',
      '29/08/2023',
      '05/10/2023',
      '05/10/2023',
      '06/10/2023',
      '06/10/2023',
      '06/10/2023',
      '09/10/2023',
      '10/10/2023',
      '13/10/2023',
      '13/10/2023',
      '13/10/2023',
      '17/10/2023',
      '17/10/2023',
      '17/10/2023',
      '17/10/2023',
      '17/10/2023',
      '17/10/2023',
      '18/10/2023',
      '20/10/2023',
      '20/10/2023',
      '20/10/2023',
      '23/10/2023',
      '23/10/2023',
      '23/10/2023',
      '23/10/2023',
      '30/11/2023',
      '30/11/2023',
      '30/11/2023',
      '27/12/2023',
      '27/12/2023',
      '27/12/2023'
    ]
    let newDates : any = [];
    dates.forEach(x => {
      let daysAdded : any = Math.floor(Math.random() * 4);
      let date = moment(x, 'DD/MM/YYYY').add(daysAdded, 'd').format('DD/MM/YYYY');
      newDates.push(date);
    });
    console.log(newDates);
  }

  items(){
    this.load = true;
    this.zeusService.getInventoryZeus().subscribe(data => {
      this.svExistProducts.getInventoryProducts(data).subscribe(data2 => {
        this.inventory = data2;
        this.load = false;
      }, error => {
        this.load = false;
        console.log(error, 2);
      })
    }, error => {
      this.load = false;
      console.log(error, 1);
    });
  }
  
  applyFilter = ($event, campo: any, data: Table) => data!.filter(($event.target as HTMLInputElement).value, campo, 'contains');
  
  getModal(info : any){
    this.dataPL = [];
    this.dataZeus = [];
    this.item = {};
    this.item = { 'item' : info.item, 'reference' : info.reference };
    console.log(this.item);
    this.load = true;
    this.zeusService.getFacturacionPorItem(info.item).subscribe(data => { 
      this.dataZeus = data;
      this.dataZeus.sort((a,b) => a.date.localeCompare(b.date))
      this.dtOrderFact.getDetailsForItem(info.item).subscribe(data2 => {
        this.dataPL = data2;
      }, err => {
        console.log(err);
      });
     }, error => {
      console.log(error);
     });
     setTimeout(() => { 
      this.modal = true;
      this.load = false; 
    }, 1500);
  }

  qtyTotalZeus = () => this.dataZeus.reduce((acc, item) => acc + item.qty, 0);  

  qtyTotalPlasticaribe = () => this.dataPL.reduce((acc, item) => acc + item.qty, 0);  

}

interface production {
  item: number;
  reference: string;
  numberProduction?: number;
  quantity: number;
  cuontProduction?: number;
  presentation: string;
  fail? : number;
  statusId? : number;
  statusName? : string;
}

