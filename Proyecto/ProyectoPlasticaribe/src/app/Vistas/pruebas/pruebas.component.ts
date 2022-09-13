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
    // for (let i = 0; i < 123506; i++) {
    //   let info : any = {
    //       SedeCli_Id : 8190009392,
    //       Prod_Id : 8089,
    //       Ot_CantidadKilos : 50.00,
    //       Ot_CantidadUnidades : 50.00,
    //       Ot_MargenAdicional : 50.00,
    //       Ot_CantidadKilos_Margen : 50.00,
    //       Ot_CantidadUnidades_Margen : 50.00,
    //       Ot_FechaCreacion : '2022-09-01',
    //       Estado_Id : 15,
    //       Usua_Id : 123456789,
    //       PedExt_Id : 380,
    //       Ot_Observacion : '',
    //       Ot_Cyrel : 0,
    //       Ot_Corte : 0,
    //       Mezcla_Id : 110,
    //       UndMed_Id : 'Kg',
    //   }

    //   this.ot.srvGuardar(info).subscribe(datos_tintas => {
    //     console.log(i+1);
    //   })
    // }
  }



}
