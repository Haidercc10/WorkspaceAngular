import { Component, OnInit } from '@angular/core';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-prueba-imagen-cat-insumo',
  templateUrl: './prueba-imagen-cat-insumo.component.html',
  styleUrls: ['./prueba-imagen-cat-insumo.component.css']
})

export class PruebaImagenCatInsumoComponent implements OnInit {

  load: boolean = false;
  storage_Id: number;
  ValidarRol: number;
  modoSeleccionado: boolean = false;
  sendProductionZeus: any[] = [];

  constructor(private appComponent: AppComponent) {
    this.modoSeleccionado = this.appComponent.temaSeleccionado;
  }

  ngOnInit() {
  }

  async requestDevice() {
    try {
      let filters = [{vendorId: 10473}];
      const device = await navigator.usb.requestDevice({ filters: filters });
      console.log(device);
      this.transferOutTest(device)
    } catch (e) {
      console.error(e);
    }
  }

  async transferOutTest(device) {
    await device.open();
    await device.selectConfiguration(1);
    await device.claimInterface(0);
    await device.transferOut(
      2,
      new Uint8Array(
        new TextEncoder().encode('Test value\n')
      ),
    );
    await device.close();
  }

  connectedDevice(){
    navigator.usb.getDevices().then((devices) => {
      console.log(devices)
    });
  }

}