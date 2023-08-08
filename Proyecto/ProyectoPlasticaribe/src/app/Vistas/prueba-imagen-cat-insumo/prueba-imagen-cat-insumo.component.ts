
import { Component, OnInit } from '@angular/core';
import { InventarioZeusService } from 'src/app/Servicios/InventarioZeus/inventario-zeus.service';

@Component({
  selector: 'app-prueba-imagen-cat-insumo',
  templateUrl: './prueba-imagen-cat-insumo.component.html',
  styleUrls: ['./prueba-imagen-cat-insumo.component.css']
})

export class PruebaImagenCatInsumoComponent implements OnInit  {
  arrayFacturas : any = [];
  cargando : boolean = false;
  modal : boolean = true;

  constructor(private srvMovItems : InventarioZeusService,){}

  ngOnInit(): void {
    let registros : number = 0;
    this.cargando = true
    this.srvMovItems.GetComprasDetalladas('800037545', 'QUIM 6013').subscribe(data => {
      for (let index = 0; index < data.length; index++) {
        data[index].fechaFactura = data[index].fechaFactura.replace('T00:00:00', '');
        data[index].fechaVence = data[index].fechaVence.replace('T00:00:00', '');
        this.arrayFacturas.push(data[index]);
        registros++
        registros == data.length ? this.cargando = false : this.cargando = true;
      }
      console.log(this.arrayFacturas);
    });
  }
}
