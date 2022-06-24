import { Component, OnInit } from '@angular/core';
import { BagproClientesOTItemService } from 'src/app/Servicios/Bagpro.service';
import { InventarioArticuloZeusService } from 'src/app/Servicios/inventarioArticuloZeus.service';

@Component({
  selector: 'app-pruebas',
  templateUrl: './pruebas.component.html',
  styleUrls: ['./pruebas.component.css']
})
export class PruebasComponent implements OnInit {

  items = [];
  articulos = [];

  constructor(private articuloservices : InventarioArticuloZeusService,
              private BagPro : BagproClientesOTItemService) { }

  ngOnInit() {
    this.consultaDesperdicios();
  }

  consutaArticulo(){
    this.articuloservices.srvObtenerListaPorId(840).subscribe(datos_articulo => {
      console.log(datos_articulo)
    });
  }

  consultaClientesOTItems(){
    this.BagPro.srvObtenerListaPorIdClienteOTItems(1001).subscribe(datos_clienteOTITem => {
      console.log(datos_clienteOTITem)
    });
  }

  consultaAmbasBD(){
    this.BagPro.srvObtenerListaClienteOTItems().subscribe(datos_items => {
      for (let index = 0; index < datos_items.length; index++) {
        this.items.push(datos_items[index])
        this.articuloservices.srvObtenerLista().subscribe(datos_articulos => {
          for (let i = 0; i < datos_articulos.length; i++) {
            if (datos_items[index].ClienteItems == datos_articulos[i].Codigo) {
              this.articulos.push(datos_articulos[i])
            }

          }
        });
      }
    });
    console.log(this.articulos)
  }

  consulta1(){
    this.BagPro.srvObtenerListaClienteOTItems().subscribe(datos_items => {
      for (let index = 0; index < datos_items.length; index++) {
        this.items.push(datos_items[index]);
      }
      this.consulta3();
    });
  }

  consulta2(){
    this.articuloservices.srvObtenerLista().subscribe(datos_articulos => {
      for (let i = 0; i < datos_articulos.length; i++) {
        this.articulos.push(datos_articulos[i]);
      }
    });
    console.log(this.articulos)
  }

  consulta3(){
    for (const item of this.items) {
      this.articuloservices.srvObtenerLista().subscribe(datos_articulos => {
        for (let i = 0; i < datos_articulos.length; i++) {
          if (item.ClienteItems == datos_articulos[i].Codigo) {
            this.articulos.push(datos_articulos[i]);
            break
          }
          break
        }
        console.log(this.articulos)
      });
      break
    }
  }

  consultaDesperdicios(){
    this.BagPro.srvObtenerListaDespercicios().subscribe(datos_desperdicios => {
      for (let index = 0; index < datos_desperdicios.length; index++) {

        if (datos_desperdicios[index].ot == 122089) {
          console.log(datos_desperdicios[index])
        }
      }
    });
  }

}
