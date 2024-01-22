import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BodegasDespachoService } from 'src/app/Servicios/BodegasDespacho/BodegasDespacho.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-inventarioBodegaDespacho',
  templateUrl: './inventarioBodegaDespacho.component.html',
  styleUrls: ['./inventarioBodegaDespacho.component.css']
})

export class InventarioBodegaDespachoComponent implements OnInit {

  load: boolean = false;
  storage_Id: number;
  ValidarRol: number;
  modoSeleccionado: boolean = false;
  formStorehouse: FormGroup;
  storehouse: Array<any> = [];
  ubicationsStorehouse: Array<any> = [];
  subUbicationsStorehouse: Array<any> = [];
  cubes: Array<any> = [];

  constructor(private appComponent: AppComponent,
    private frmBuilder: FormBuilder,
    private storehouseService: BodegasDespachoService,
    private msg: MensajesAplicacionService,) {
    this.modoSeleccionado = this.appComponent.temaSeleccionado;
  }

  ngOnInit() {
    this.initFormStorehouse();
    this.getStorehouse();
  }

  initFormStorehouse() {
    this.formStorehouse = this.frmBuilder.group({
      item: [''],
      reference: [''],
      orderProduction: [''],
      idStorehouse: [''],
      nameStorehouse: [''],
      idUbicationsStorehouse: [''],
      ubicationsStorehouse: [''],
      idSubUbicationsStorehouse: [''],
      subUbicationsStorehouse: [''],
      idCubes: [''],
      cubes: [''],
    });
  }

  getStorehouse = () => this.storehouseService.GetBodegas().subscribe(data => this.storehouse = data);

  getUbicationByStorehouse() {
    let storehouseSelected: string = this.formStorehouse.value.idStorehouse;
    this.storehouseService.GetUbicacionesPorBodegas(storehouseSelected).subscribe(data => {
      this.ubicationsStorehouse = data;
      this.subUbicationsStorehouse = [];
      this.cubes = [];
    });
  }

  getSubUbicationByStorehouse() {
    let storehouseSelected: string = this.formStorehouse.value.idStorehouse;
    let ubicationSelected: string = this.formStorehouse.value.idUbicationsStorehouse;
    let dataUbication: any = this.ubicationsStorehouse.find(x => x.nombreCompleto == ubicationSelected);
    this.storehouseService.GetSubUbicacionesPorUbicacion(storehouseSelected, dataUbication.idUbicacion, dataUbication.nombreUbicacion).subscribe(data => {
      this.subUbicationsStorehouse = data;
      this.cubes = [];
    });
  }

  getCubesBySubUbication() {
    let storehouseSelected: string = this.formStorehouse.value.idStorehouse;
    let ubicationSelected: string = this.formStorehouse.value.idUbicationsStorehouse;
    let subUbicationSelected: string = this.formStorehouse.value.idSubUbicationsStorehouse;
    let dataUbication: any = this.ubicationsStorehouse.find(x => x.nombreCompleto == ubicationSelected);
    this.storehouseService.GetCubosPorSubUbicacion(storehouseSelected, dataUbication.idUbicacion, dataUbication.nombreUbicacion, subUbicationSelected).subscribe(data => this.cubes = data);
  }

  setUbicationSelected(): string {
    let idStorehouseSelected: string = this.formStorehouse.value.idStorehouse;
    let idUbicationSelected: string = this.formStorehouse.value.idUbicationsStorehouse;
    let ubicationSelected: string = this.formStorehouse.value.ubicationsStorehouse;
    let idSubUbicationSelected = this.formStorehouse.value.idSubUbicationsStorehouse;
    let subUbicationSelected = this.formStorehouse.value.subUbicationsStorehouse;
    let cubeSelected = this.formStorehouse.value.idCubes;

    if (ubicationSelected == 'ESTANTE') ubicationSelected = 'EST';
    else if (ubicationSelected == 'PLATAFORMA DINAMICA') ubicationSelected = 'PD';
    else if (ubicationSelected == 'PASILLO JAULAS') ubicationSelected = 'PS';
    else if (ubicationSelected == 'PASILLO') ubicationSelected = 'PS';

    if (subUbicationSelected == 'PALO') subUbicationSelected = 'PL';
    else if (subUbicationSelected == 'ESTIBA') subUbicationSelected = 'ESTB';

    cubeSelected = cubeSelected == '' ? `` : `_${cubeSelected.replace('CUBO', '').replace('P.', '')}`;

    return `B${idStorehouseSelected}_${ubicationSelected}${idUbicationSelected}_${subUbicationSelected}${idSubUbicationSelected}${cubeSelected}`;
  }

  GetCantByUbication() {
    this.storehouseService.GetCantidadRollosPorUbicacion().subscribe(data => {
    });
  }

  GetStoreByUbicationAndProducts() {
    this.storehouseService.GetInventarioPorUbicacionYProductos().subscribe(data => {
    });
  }

  GetStoreByUbication() {
    let ubication: string = this.setUbicationSelected();
    this.load = true;
    this.storehouseService.GetInventarioPorUbicacion(ubication).subscribe(data => {
    }, error => {
      this.msg.mensajeError(`¡No se encontró información de ingresos a despacho con los parametros consultados!`, `Error: ${error.error.title} | Status: ${error.status}`);
      this.load = false;
    }, () => this.load = false);
  }

}