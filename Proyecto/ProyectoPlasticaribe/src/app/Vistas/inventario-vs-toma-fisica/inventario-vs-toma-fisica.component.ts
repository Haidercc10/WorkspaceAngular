import { Component, Injectable, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { AppComponent } from 'src/app/app.component';
import { InventariosService } from 'src/app/Servicios/Inventarios/inventarios.service';
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


  constructor(private AppComponent: AppComponent,
    private svInvSnapshot: InventariosService,
    private svPhysicalCount: TomaFisicaInventarioService,
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

  //Función 
  getInventory() {
    this.loading = true;
    this.svInvSnapshot.getInventorySnapshot().subscribe(res => {
      this.inventory = res;
      this.loading = false;
    }, error => {
      console.log(error);
    })
  }

  loadDetailsInventory(item: number) {
    this.modal = true;
    this.getSystemInventory(item);
  }

  getSystemInventory(item: any) {
    this.load = true;
    this.svInvSnapshot.getInventorySnapshotForItem(item).subscribe(data1 => {
      this.inventorySystem = data1;
      this.load = false;
      this.svPhysicalCount.getPhysicalCountForItem(item).subscribe(data2 => {
        this.inventoryCount = data2;
        this.load = false;
      }, error => console.log(error));
    }, error => console.log(error));
  }

  totalInventory = () => this.inventory.reduce((a, b) => a + b.subtotal, 0);



}