import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';

@Component({
  selector: 'app-prueba-imagen-cat-insumo',
  templateUrl: './prueba-imagen-cat-insumo.component.html',
  styleUrls: ['./prueba-imagen-cat-insumo.component.css']
})
export class PruebaImagenCatInsumoComponent implements OnInit {

  public page : number;
  cantPage : number
  ArrayDocumento = [];

  ngOnInit(): void {
    for (let i = 0; i < 100; i++) {
      this.ArrayDocumento.push(i);
    }
  }


}
