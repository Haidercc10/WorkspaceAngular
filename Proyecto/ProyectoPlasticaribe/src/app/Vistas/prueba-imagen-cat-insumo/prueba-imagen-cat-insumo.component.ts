import { Component, Injectable, OnInit } from '@angular/core';
import { TagProduction_2, modelTagProduction } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';

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

  constructor(private createTagService: TagProduction_2) {
  }

  ngOnInit(): void {
    let dataTagProduction: modelTagProduction = {
      client: '123456789012345678901',
      item: 102226,
      reference: '123456789012345678901234',
      width: 10,
      height: 10,
      bellows: 10,
      und: 'Cms',
      cal: 10,
      orderProduction: '123456',
      material: 'recuperado',
      quantity: 20,
      quantity2: 25,
      reel: 1234567,
      presentationItem1: 'Kg Bruto',
      presentationItem2: 'Kg Neto',
      productionProcess: 'EMPAQUE',
      showNameBussiness: true,
      copy: false,
      showDataTagForClient: true,
      operator: 'nombre de operario',
    }
    this.createTagService.createTagProduction(dataTagProduction);
  }

}