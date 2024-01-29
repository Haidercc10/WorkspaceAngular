import { Component, Injectable, OnInit } from '@angular/core';

@Component({
  selector: 'app-prueba-imagen-cat-insumo',
  templateUrl: './prueba-imagen-cat-insumo.component.html',
  styleUrls: ['./prueba-imagen-cat-insumo.component.css']
})

@Injectable({
  providedIn: 'root'
})

export class PruebaImagenCatInsumoComponent implements OnInit {

  load: boolean = false;
  storage_Id: number | undefined;
  storage_Name: string | undefined;
  validateRole: number | undefined;

  constructor() {
  }

  ngOnInit(): void {
  }
}