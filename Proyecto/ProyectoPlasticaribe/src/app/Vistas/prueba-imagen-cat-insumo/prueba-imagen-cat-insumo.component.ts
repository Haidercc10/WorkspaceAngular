import { Component, AfterViewInit, OnInit } from '@angular/core';
import { ShepherdService } from 'angular-shepherd';

@Component({
  selector: 'app-prueba-imagen-cat-insumo',
  templateUrl: './prueba-imagen-cat-insumo.component.html',
  styleUrls: ['./prueba-imagen-cat-insumo.component.css']
})

export class PruebaImagenCatInsumoComponent implements OnInit  {

  constructor(private shepherdService: ShepherdService) { }


  ngOnInit() {
  }
}
