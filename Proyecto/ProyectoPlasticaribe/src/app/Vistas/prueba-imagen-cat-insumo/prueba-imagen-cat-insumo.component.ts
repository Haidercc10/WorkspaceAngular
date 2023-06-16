import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-prueba-imagen-cat-insumo',
  templateUrl: './prueba-imagen-cat-insumo.component.html',
  styleUrls: ['./prueba-imagen-cat-insumo.component.css']
})

export class PruebaImagenCatInsumoComponent implements OnInit  {

  constructor(private AppComponent : AppComponent,
                private frmBuilder : FormBuilder,
                  private mensajesService : MensajesAplicacionService,
                    private messageService: MessageService,
                      private bagproService : BagproService,) {
  }

  ngOnInit() {
    let informacion : any [] = [];
    this.bagproService.GetNominaSelladoAcumuladaItem('2023-06-01', '2023-06-10').subscribe(data => {
      for (let i = 0; i < data.length; i++) {
        let info = JSON.parse(`{${data[i].replaceAll("'", '"')}}`);
        info.Cantidad = parseFloat(info.Cantidad),
        info.CantidadTotal = parseFloat(info.CantidadTotal);
        info.PagoTotal = parseFloat(info.PagoTotal)
        info.PrecioDia = parseFloat(info.PrecioDia)
        info.PrecioNoche = parseFloat(info.PrecioNoche)
        console.log(info);
      }
    })
  }
}
