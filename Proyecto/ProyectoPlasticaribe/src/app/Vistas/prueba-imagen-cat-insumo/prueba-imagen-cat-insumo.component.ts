import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-prueba-imagen-cat-insumo',
  templateUrl: './prueba-imagen-cat-insumo.component.html',
  styleUrls: ['./prueba-imagen-cat-insumo.component.css']
})

export class PruebaImagenCatInsumoComponent implements OnInit  {

  data : any = [
    {
      Ot: 'Ot1',
      IdProducto: 'P1',
      Producto: 'Producto1',
      Cantidad: 1,
      Presentacion: 'P1',
      exits: false,
    },
    {
      Ot: 'Ot1',
      IdProducto: 'P2',
      Producto: 'Producto1',
      Cantidad: 2,
      Presentacion: 'P2',
      exits: false,
    },
    {
      Ot: 'Ot2',
      IdProducto: 'P3',
      Producto: 'Producto3',
      Cantidad: 3,
      Presentacion: 'P3',
      exits: false,
    },
    {
      Ot: 'Ot2',
      IdProducto: 'P4',
      Producto: 'Producto3',
      Cantidad: 4,
      Presentacion: 'P4',
      exits: false,
    },
  ]

  constructor() {
  }

  ngOnInit() {
    console.log(this.GrupoProductos(this.data));
  }

  GrupoProductos(data){
    let grupoProductos = [];
    let info : any = data.map(x => x.Producto).filter((value, index, self) => self.indexOf(value) === index).map(producto => {
      const filteredData = data.filter(x => x.Producto === producto);
      return {
        Producto: producto,
        Cantidad: filteredData.reduce((total, value) => total.Cantidad + value.Cantidad),
        Registros: filteredData.length,
        Presentacion: '',
      };
    });
    grupoProductos.push(info)
    console.log(grupoProductos = grupoProductos[0]);
  }

  datosAgrupados(data){
    let grupoProductos = [];
    for (let i = 0; i < data.length; i++) {
      if (grupoProductos.findIndex(x => x.Producto == data[i].Producto) == -1) {
        let info : any = {
          Producto: data[i].Producto,
          Cantidad : this.data.filter(x => x.Ot == data[i].Ot).reduce((total, value) => total.Cantidad + value.Cantidad),
          Registros: this.data.filter(x => x.Ot == data[i].Ot).length,
          Presentacion: '',
        }
        grupoProductos.push(info);
      }
    }
    console.log(grupoProductos);
  }
}
