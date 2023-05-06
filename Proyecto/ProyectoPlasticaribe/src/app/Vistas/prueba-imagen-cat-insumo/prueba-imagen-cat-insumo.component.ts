import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-prueba-imagen-cat-insumo',
  templateUrl: './prueba-imagen-cat-insumo.component.html',
  styleUrls: ['./prueba-imagen-cat-insumo.component.css']
})

export class PruebaImagenCatInsumoComponent implements OnInit {

  device: HIDDevice;
  usbDevice: USBDevice = null;

  constructor() { }

  ngOnInit() {
  }

  conectar() {
    try {
      navigator.usb.requestDevice({filters : []}).then(selectedDevice => {
        this.usbDevice = selectedDevice;
        console.log(this.usbDevice)
        this.iniciarDispositivo(this.usbDevice);
      }).then(() => this.recibirInfo());
    } catch (err) { console.error(err) };
  }

  iniciarDispositivo(device : any){
    device.configuration.interfaces.forEach(item => {
      console.log(item.claim = true)
    });
    return device.open()
      .then(() => device.selectConfiguration(1))
      // .then(() => device.claimInterface(1))
      .catch((err) => console.error(err));
  }

  transferirInfo(){

  }

  recibirInfo(){
    console.log(this.usbDevice)
  }
}
