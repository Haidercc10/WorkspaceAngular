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
    this.bagproService.GetNominaSelladoAgrupada('2023-06-01', '2023-06-10').subscribe(data => {
      for (let i = 0; i < data.length; i++) {
        let operario : number = informacion.findIndex(item => (item.Cedula == data.cedula ||
                                                              item.Cedula == data.cedula2 ||
                                                              item.Cedula == data.cedula3 ||
                                                              item.Cedula == data.cedula4) && item.Referencia == data.referencia);
        if (operario != -1) {
        }
        let info : any = {
          Cedula : 0,
          Operario : 0,
          Referencia : 0,
          Dia : 0,
          Noche : 0,
          Registros_Dia : 0,
          Registros_Noche : 0,
          Registros_Total : 0,
          Pago_Dia : 0,
          Pago_Noche : 0,
          Pago_Total : 0,
        }
      }
      console.log(data);
    })
  }
}
