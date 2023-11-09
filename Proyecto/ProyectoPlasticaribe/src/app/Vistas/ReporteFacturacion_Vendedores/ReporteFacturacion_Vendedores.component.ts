import { Component, OnInit, ViewChild } from '@angular/core';
import { ShepherdService } from 'angular-shepherd';
import DataLabelsPlugin from 'chartjs-plugin-datalabels';
import moment from 'moment';
import { Table } from 'primeng/table';
import { InventarioZeusService } from 'src/app/Servicios/InventarioZeus/inventario-zeus.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { UsuarioService } from 'src/app/Servicios/Usuarios/usuario.service';
import { AppComponent } from 'src/app/app.component';
import { defaultStepOptions, stepsDashboardVentasVendedor as defaultSteps } from 'src/app/data';


@Component({
  selector: 'app-ReporteFacturacion_Vendedores',
  templateUrl: './ReporteFacturacion_Vendedores.component.html',
  styleUrls: ['./ReporteFacturacion_Vendedores.component.css']
})
export class ReporteFacturacion_VendedoresComponent implements OnInit {

  @ViewChild('dt') dt: Table | undefined;
  cargando : boolean = false;
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  today : any = moment().format('YYYY-MM-DD'); //Variable que va a almacenar la fecha del dia de hoy
  anios : any [] = [2019]; //Variable que almacenará los años desde el 2019 hasta el año actual
  anioSeleccionado : number = moment().year(); //Variable que almacenará la información del año actual en princio y luego podrá cambiar a un año seleccionado
  vendedores : any [] = []; //VAriable que almacenará toda la información de los vendedores
  vendedorSeleccionado : any; //Variable que almacenará la el codigo del vendedor selecionado
  facturasData: any; //Variable que almacenará la informacion a graficar de lo facturado cada mes
  facturasOptions: any; //Variable que almacenará los estilos que tendrá la grafica de lo facturado cada mes
  facturacionPlugins = [ DataLabelsPlugin ];
  datosConsultados : any [] = []; //Variable que almacenará los años y los vendedores que se han consultado
  consolidado : any [] = []; //Variable que almcanerá la información de los pedidos y costos de cada vendedor
  costoTotal : number = 0;  //Variable que almacenará la cantidad total facturada
  nroCard : string = ''; /** Variable que identificará cual es la card de la cual se desea mostrar la descripción */
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro

  constructor(private AppComponent : AppComponent,
                private zeusService : InventarioZeusService,
                  private usuarioService : UsuarioService,
                      private shepherdService: ShepherdService,
                        private msj : MensajesAplicacionService) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
  }

  ngOnInit() {
    this.lecturaStorage();
    this.llenarArrayAnios();
    this.consultarVendedores();
    this.graficarDatos();
    setInterval(() => {
      this.modoSeleccionado = this.AppComponent.temaSeleccionado;
      this.facturasOptions.plugins.legend.labels.color = this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'];
      this.facturasOptions.scales.x.ticks.color = this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'];
      this.facturasOptions.scales.y.ticks.color = this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'];
    }, 1000);
  }

  tutorial(){
    this.shepherdService.defaultStepOptions = defaultStepOptions;
    this.shepherdService.modal = true;
    this.shepherdService.confirmCancel = false;
    this.shepherdService.addSteps(defaultSteps);
    this.shepherdService.start();
  }

  // Funcion que va a llenar el array de años
  llenarArrayAnios() : void{
    for (let i = 0; i < this.anios.length; i++) {
      let num_Mayor : number = Math.max(...this.anios);
      if (num_Mayor == moment().year()) break;
      this.anios.push(num_Mayor + 1);
    }
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  // Funcion que va a consultar la información de los vendedores
  consultarVendedores(){
    if ([1,60,6].includes(this.ValidarRol)) this.usuarioService.GetVendedores().subscribe(datos => this.vendedores = datos);
    else if (this.ValidarRol == 2) this.vendedores = [ { usua_Id : this.storage_Id, usua_Nombre : this.storage_Nombre, } ];
  }

  // Función que va a consultar cuanto fue el costo facturado de los vendedores que se indiquen
  consultarFacturacionVendedor(){
    this.cargando = true;
    let vendedor : any = `${this.vendedorSeleccionado}`;
    if (vendedor.length == 2) vendedor = `0${vendedor}`;
    else if (vendedor.length == 1) vendedor = `00${vendedor}`;
    let ene : number = 0, feb : number = 0, mar : number = 0, abr : number = 0, may : number = 0, jun : number = 0, jul : number = 0, ago : number = 0, sep : number = 0, oct : number = 0, nov : number = 0, dic : number = 0;
    let validar : any = this.datosConsultados.filter((item) => item.Anio == `${this.anioSeleccionado}` && item.Vendedor == vendedor);

    if (validar.length == 0){
      for (let i = 0; i < 12; i++) {
        let mes : string = `${i + 1}`.length == 1 ? `0${i + 1}` : `${i + 1}`;
        this.zeusService.GetCostoFacturado_Vendedor(vendedor, mes, this.anioSeleccionado).subscribe(data => {
          ene = mes == '01' ? data : ene;
          feb = mes == '02' ? data : feb;
          mar = mes == '03' ? data : mar;
          abr = mes == '04' ? data : abr;
          may = mes == '05' ? data : may;
          jun = mes == '06' ? data : jun;
          jul = mes == '07' ? data : jul;
          ago = mes == '08' ? data : ago;
          sep = mes == '09' ? data : sep;
          oct = mes == '10' ? data : oct;
          nov = mes == '11' ? data : nov;
          dic = mes == '12' ? data : dic;
        });
      }
      setTimeout(() => {
        let color : string = "#"+((1<<24)*Math.random()|0).toString(16);
        let info : any = {
          label: `Año ${this.anioSeleccionado} - Vendedor ${vendedor}`,
          data: [ene, feb, mar, abr, may, jun, jul, ago, sep, oct, nov, dic],
          yAxisID: 'y',
          borderColor: color.substring(0, 4),
          backgroundColor: color.substring(0, 4) + "2",
          pointStyle: 'circle',
          pointRadius: 10,
          pointHoverRadius: 15,
          fill : true,
          tension: 0.3
        };
        this.facturasData.datasets.push(info);
        this.datosConsultados.push({Anio : `${this.anioSeleccionado}`, Vendedor : vendedor});
        this.consultarConsolidado();
      }, 1500);
    } else {
      this.msj.mensajeAdvertencia(`Advertencia`, `¡Ya se ha graficado la información del vendedor con el código ${vendedor} en el año ${this.anioSeleccionado}!`);
      this.cargando = false;
    }
  }

  // Funcion que consultará y almacenará la información consolidada de la facturación de los vendedores
  consultarConsolidado(){
    let anoInicial : number = this.anioSeleccionado;
    let anoFinal : number = this.anioSeleccionado;
    let vendedor : any = `${this.vendedorSeleccionado}`;
    if (vendedor.length == 2) vendedor = `0${vendedor}`;
    else if (vendedor.length == 1) vendedor = `00${vendedor}`;

    this.zeusService.GetConsolidadClientesArticulo(anoInicial, anoFinal, `?vendedor=${vendedor}`).subscribe(datos_consolidado => {
      if(datos_consolidado.length == 0) this.msj.mensajeAdvertencia(`Advertencia`, 'No se encontraron resultados de búsqueda con la combinación de filtros seleccionada!')
      else {
        for (let i = 0; i < datos_consolidado.length; i++) {
          this.llenarConsolidado(datos_consolidado[i]);
        }
      }
      setTimeout(() => { this.cargando = false; }, datos_consolidado.length);
    });
  }

  // Funcion que va a llenar el array que contendrá la informacion del consolidado
  llenarConsolidado(data : any){
    let num_Mes : number = data.mes;
    if (data.mes == 1) data.mes = 'Enero';
    if (data.mes == 2) data.mes = 'Febrero';
    if (data.mes == 3) data.mes = 'Marzo';
    if (data.mes == 4) data.mes = 'Abril';
    if (data.mes == 5) data.mes = 'Mayo';
    if (data.mes == 6) data.mes = 'Junio';
    if (data.mes == 7) data.mes = 'Julio';
    if (data.mes == 8) data.mes = 'Agosto';
    if (data.mes == 9) data.mes = 'Septiembre';
    if (data.mes == 10) data.mes = 'Octubre';
    if (data.mes == 11) data.mes = 'Noviembre';
    if (data.mes == 12) data.mes = 'Diciembre';

    let info : any = {
      Num_Mes : num_Mes,
      Mes : data.mes,
      Ano : ` ${data.mes} - ${data.ano} - ${data.vendedor}`,
      Id_Cliente : data.id_Cliente,
      Cliente : data.cliente,
      Id_Producto : data.id_Producto,
      Producto : data.producto,
      Cantidad : data.cantidad,
      Devolucion : data.devolucion,
      Presentacion : data.presentacion,
      Precio : data.precio,
      SubTotal : data.subTotal,
      Id_Vendedor : data.id_Vendedor,
      Vendedor : data.vendedor,
    }
    if (info.Devolucion == 0) this.costoTotal += info.SubTotal;
    else if (info.Devolucion > 0) this.costoTotal -= info.SubTotal;
    this.consolidado.push(info);
  }

  // Funcion que va a inicializar la informacion de los arrays que almacenan la info de la grafica
  graficarDatos(){
    this.datosConsultados = [];
    this.consolidado = [];
    this.costoTotal = 0;
    this.facturasData = {
      labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      datasets: []
    };

    this.facturasOptions = {
      stacked: false,
      plugins: {
        legend: { labels: {  color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], usePointStyle: true, font: { size: 20 } } },
        tooltip: { titleFont: { size: 50, }, usePointStyle: true, bodyFont: { size: 30 } }
      },
      scales: {
        x: {
          ticks: {
             color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'],
            font: { size: 20 },
            callback: function(value) {
              if (this.getLabelForValue(value).length > 6) return `${this.getLabelForValue(value).substring(0, 6)}...`;
              else return this.getLabelForValue(value);
            }
          },
          grid: { color: '#ebedef' }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          ticks: {  color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], font: { size: 20 } },
          grid: { color: '#ebedef' }
        },
      },
      datalabels: { anchor: 'end', align: 'end' }
    };
  }

  /** Funcion para filtrar busquedas y mostrar el valor total segun el filtro seleccionado. */
  aplicarfiltro = ($event, campo : any, valorCampo : string) => this.dt!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

  // Funcion que va a calcular el subtotal de lo vendido en un año
  calcularTotalVendidoAno(ano : any){
    let total : number = 0;
    for (let i = 0; i < this.consolidado.length; i++) {
      if (this.consolidado[i].Ano == ano) {
        if (this.consolidado[i].Devolucion == 0) total += this.consolidado[i].SubTotal;
        else if (this.consolidado[i].Devolucion > 0) total -= this.consolidado[i].SubTotal;
      }
    }
    return total;
  }
}
