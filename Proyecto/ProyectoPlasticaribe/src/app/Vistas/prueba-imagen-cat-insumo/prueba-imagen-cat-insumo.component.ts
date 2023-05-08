import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import moment from 'moment';
import pdfMake from 'pdfmake/build/pdfmake';
import { MessageService } from 'primeng/api';
import { OverlayPanel } from 'primeng/overlaypanel';
import { Table } from 'primeng/table';
import { modelOpedido } from 'src/app/Modelo/modelOpedido';
import { PedidoProductosService } from 'src/app/Servicios/DetallesPedidoProductos/pedidoProductos.service';
import { EstadosProcesos_OTService } from 'src/app/Servicios/EstadosProcesosOT/EstadosProcesos_OT.service';
import { InventarioZeusService } from 'src/app/Servicios/InventarioZeus/inventario-zeus.service';
import { OpedidoproductoService } from 'src/app/Servicios/PedidosProductos/opedidoproducto.service';
import { AppComponent } from 'src/app/app.component';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';
import { PedidoExternoComponent } from '../Pedido-Externo/Pedido-Externo.component';
import { Reporte_Procesos_OTComponent } from '../Reporte_Procesos_OT/Reporte_Procesos_OT.component';
import { DOCUMENT } from '@angular/common';
import { filter } from 'rxjs';

@Component({
  selector: 'app-prueba-imagen-cat-insumo',
  templateUrl: './prueba-imagen-cat-insumo.component.html',
  styleUrls: ['./prueba-imagen-cat-insumo.component.css']
})

export class PruebaImagenCatInsumoComponent implements OnInit {

  device: HIDDevice;
  device2: SerialPort;
  device3: USBDevice;
  usbDevice: USBDevice;

  constructor() { }

  async ngOnInit() {
    //this.lecturaStorage();
    //this.consultarPedidosZeus();
    //this.consultarPedidos();
    //this.connectHID();
    this.desconectar();
  }

  async connectHID() {
    let devices = await navigator.usb.requestDevice({filters : []});
    await devices.open();
    if (devices.configuration === null) {
      await devices.selectConfiguration(1);
      await devices.claimInterface(1);
    }

    await devices.controlTransferOut({
      requestType: 'vendor',
      recipient: 'interface',
      request: 0x04f2,  // vendor-specific request: enable channels
      value: 0xb6c4,  // 0b00010011 (channels 1, 2 and 5)
      index: 0x0001   // Interface 1 is the recipient
    });
    console.log(devices);

  }

  desconectar() {
    navigator.hid.addEventListener("disconnect", (event) => {
      console.log(`HID disconnected: ${event.device.productName}`);
      console.dir(event);
    });
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
