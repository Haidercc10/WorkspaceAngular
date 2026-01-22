import { Component, Injectable, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { forkJoin } from 'rxjs';
import { AppComponent } from 'src/app/app.component';
import { InventariosService } from 'src/app/Servicios/Inventarios/inventarios.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { TomaFisicaInventarioService } from 'src/app/Servicios/Toma_Fisica_Inventario/toma-fisica-inventario.service';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-inventario-vs-toma-fisica',
  templateUrl: './inventario-vs-toma-fisica.component.html',
  styleUrls: ['./inventario-vs-toma-fisica.component.css']
})
export class InventarioVsTomaFisicaComponent implements OnInit {
  modoSeleccionado: boolean = false;
  @ViewChild('table') table: Table | undefined;
  @ViewChild('tableSystem') tableSystem: Table | undefined;
  @ViewChild('tableCount') tableCount: Table | undefined;
  inventory: any = [];
  inventorySystem: any = [];
  inventoryCount: any = [];
  load: boolean = false;
  storage_Id: number;
  storage_Nombre: string;
  ValidarRol: number;
  loading: boolean;
  modal: boolean = false;
  itemSelected: item = { item: 0, ref: '', unit : '' };


  constructor(private AppComponent: AppComponent,
    private svInvSnapshot: InventariosService,
    private svPhysicalCount: TomaFisicaInventarioService,
    private msj: MensajesAplicacionService
  ) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
  }

  ngOnInit(): void {
    this.lecturaStorage();
    this.getInventory();
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage() {
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  //Función que se encarga de filtrar la información de la tabla
  applyFilter = ($event, campo: any, datos: Table) => datos!.filter(($event.target as HTMLInputElement).value, campo, 'contains');

  //Función que obtiene el inventario en snapshot
  getInventory() {
    this.loading = true;
    this.svInvSnapshot.getInventorySnapshot().subscribe(res => {
      this.inventory = res;
      this.loading = false;
    }, error => {
      console.log(error);
    })
  }

  //Función que carga los detalles del inventario seleccionado
  loadDetailsInventory(item: any) {
    this.modal = true;
    this.load = true;
    this.itemSelected = { item: item.item, ref: item.reference, unit : item.unit };

    forkJoin({
      system: this.svInvSnapshot.getInventorySnapshotForItem(item.item, item.unit),
      physical: this.svPhysicalCount.getPhysicalCountForItem(item.item, item.unit)
    })
      .subscribe({
        next: ({ system, physical }) => {
          this.inventorySystem = system;
          this.inventoryCount = physical;
        },
        error: err => {
          console.error(err);
        },
        complete: () => {
          this.load = false;
        }
      });
  }

  //Función que calcula el total del inventario
  totalInventory = () => this.inventory.reduce((a, b) => a + b.subtotal, 0);

  //Funcion que calculan el total del sistema
  totalSystemInventoryForItem = (item : number, unit : string) => this.inventorySystem.filter(x => item == item && x.unit == unit).reduce((a, b) => a + b.quantity, 0);

  //Función que calcula el total de la toma fisica
  totalCountInventoryForItem = (item : number, unit : string) => this.inventoryCount.filter(x => item == item && x.unit == unit).reduce((a, b) => a + b.quantity, 0);

  //Funcion que calculan el total en pesos del inventario del sistema
  valueSystemInventoryForItem = (item : number, unit : string) => this.inventorySystem.filter(x => item == item && x.unit == unit).reduce((a, b) => a + b.subTotal, 0);

  //Función que calcula el total en pesos de la toma fisica
  valueCountInventoryForItem = (item : number, unit : string) => this.inventoryCount.filter(x => item == item && x.unit == unit).reduce((a, b) => a + b.subTotal, 0);

  exportExcel(){
    this.msj.mensajeAdvertencia('¡Funcionalidad en Desarrollo!');
  }
}

export interface item {
  item: number,
  ref: string,
  unit: string,
}