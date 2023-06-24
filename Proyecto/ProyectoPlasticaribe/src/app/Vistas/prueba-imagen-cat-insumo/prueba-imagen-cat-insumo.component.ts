import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import moment from 'moment';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-prueba-imagen-cat-insumo',
  templateUrl: './prueba-imagen-cat-insumo.component.html',
  styleUrls: ['./prueba-imagen-cat-insumo.component.css']
})

export class PruebaImagenCatInsumoComponent implements OnInit  {

  @ViewChild('dt') dt: Table | undefined;
  modalSellado : boolean = false; /** Variable que contendrá el valor total de la nomina de sellado */
  detallesNomina : any [] = []; //Variable que almacenará la información detallada de los rollos pesados o ingresados de un producto y persona en especifico
  rangoFechas : any [] = []; /** Array que almacenará el rango de fechas */
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  cargando : boolean = false;

  constructor(private AppComponent : AppComponent,
                private frmBuilder : FormBuilder,
                  private mensajesService : MensajesAplicacionService,
                    private messageService: MessageService,
                      private bagproService : BagproService,) {
  }

  ngOnInit() {
    this.cargarModalSellado('101356', '55237776');
  }

  cargarModalSellado(item : any, persona : string){
    this.cargando = true;
    this.modalSellado = true;
    this.detallesNomina = [];
    let fechaInicial : any = this.rangoFechas.length > 0 ? moment(this.rangoFechas[0]).format('YYYY-MM-DD') : this.today;
    let fechaFinal : any = this.rangoFechas.length > 0 ? moment(this.rangoFechas[1]).format('YYYY-MM-DD') : fechaInicial;

    this.bagproService.GetNominaSelladoDetalladaItemPersona(fechaInicial, fechaFinal, item, persona).subscribe(data => {
      for (let i = 0; i < data.length; i++) {
        let info : any = JSON.parse(`{${data[i].replaceAll("'", '"')}}`);
        info.Fecha = info.Fecha.replace('12:00:00 a. m. ', '');
        info.Cantidad = parseFloat(info.Cantidad.toString().replace(',', '.')),
        info.Peso = parseFloat(info.Peso.toString().replace(',', '.')),
        info.Precio = parseFloat(info.Precio.toString().replace(',', '.'));
        info.Valor_Total = parseFloat(info.Valor_Total.toString().replace(',', '.'));
        info.Pesado_Entre = parseFloat(info.Pesado_Entre.toString().replace(',', '.'));
        info.Cantidad_Total = parseFloat(info.Cantidad_Total.toString().replace(',', '.'));
        this.detallesNomina.push(info);
      }
    });
    setTimeout(() => this.cargando = false, 2000);
  }

  aplicarfiltro = ($event, campo : any, valorCampo : string) => this.dt!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);
}
