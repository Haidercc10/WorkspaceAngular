import { Component, OnInit } from '@angular/core';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import { Orden_TrabajoService } from 'src/app/Servicios/Orden_Trabajo.service';
import { TintasService } from 'src/app/Servicios/tintas.service';

@Component({
  selector: 'app-pruebas',
  templateUrl: './pruebas.component.html',
  styleUrls: ['./pruebas.component.css']
})
export class PruebasComponent implements OnInit{
  datePipe: any;

  constructor(private ot : Orden_TrabajoService){ }

  ngOnInit() {
    // for (let i = 0; i < 123800; i++) {
    //   let info : any = {
    //     Tinta_Nombre : "sdad",
    //     Tinta_Descripcion : "sdad",
    //     Tinta_CodigoHexadecimal : "sdad",
    //     Tinta_Stock : 1,
    //     UndMed_Id : 'Kg',
    //     Tinta_Precio : 1,
    //     CatMP_Id : 1,
    //     TpBod_Id : 1,
    //     Tinta_InvInicial : 1,
    //   }

    //   this.Orden_TrabajoService.srvGuardar(info).subscribe(datos_tintas => {
    //     console.log(i+1);
    //   })
    // }
  }



}
