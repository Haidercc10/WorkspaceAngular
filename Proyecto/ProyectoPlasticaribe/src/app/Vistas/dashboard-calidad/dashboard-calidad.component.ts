import { Component } from '@angular/core';
import moment from 'moment';
import { PaginaPrincipalComponent } from '../PaginaPrincipal/PaginaPrincipal.component';
import { AppComponent } from 'src/app/app.component';
import DataLabelsPlugin from 'chartjs-plugin-datalabels';
import { DevolucionesCalidadService } from 'src/app/Servicios/Devoluciones_Calidad/devoluciones-calidad.service';
import { InventarioZeusService } from 'src/app/Servicios/InventarioZeus/inventario-zeus.service';

@Component({
  selector: 'app-dashboard-calidad',
  templateUrl: './dashboard-calidad.component.html',
  styleUrls: ['./dashboard-calidad.component.css']
})
export class DashboardCalidadComponent {
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  today : any = moment().format('YYYY-MM-DD'); //Variable que va a almacenar la fecha del dia de hoy
  primerDiaMes : any = moment().startOf('month').format('YYYY-MM-DD'); //Variable que va a almacenar el primer dia del mes
  cargando : boolean = false; //Variable que va a validar si se esta cargando algo o no

  modoSeleccionado : boolean;


  years : any [] = [2025]; //Variable que almacenará los años desde el 2019 hasta el año actual
  selectedYear : number = moment().year(); //Variable que almacenará la información del año actual en princio y luego podrá cambiar a un año seleccionado

  totalRejectedInt : number = 0;
  totalRejectedExt : number = 0;
  devolutionsForArea : any = [];
  devolutionsForClient : any = [];
  devolutionsForMonth : any = [];
  
  /* GRAFICA */
  ComparativoData: any;
  ComparativoOptions: any;
  ComparativoPlugins = [ DataLabelsPlugin ];

  multiAxisData: any;
  multiAxisOptions: any;

  //Areas en pesos
  nombreGrafica : string;
  graficaPedidosClientes : any;
  opcionesGraficas : any;

  //Areas en kilos
  graphicName : string;
  graphicForKg : any;
  graphicOptionsKg : any;

  //Grafica de clientes en pesos
  graphicNameClient : string;
  graphicForClientMoney : any;
  graphicOptionsClientMoney : any;

  //Grafica de clientes en kilos
  graphicForClientKg : any;
  graphicOptionsClientKg : any;

  totalforMonth : any [] = []; 
  graphicForMonth : any; 
  graphicOptions : any;
  graphicYears : any = [2025];

  qualityVsFact : any = [];

  constructor(private AppComponent : AppComponent,
                private mainPage : PaginaPrincipalComponent,
                  private svDevolutions : DevolucionesCalidadService,
                    private svFact : InventarioZeusService,) {
      this.modoSeleccionado = this.AppComponent.temaSeleccionado;
    }

  ngOnInit() {
    
    this.lecturaStorage();
    this.getInfoDevolutionsQuality();
    this.inicializarGraficas();
    this.loadInformationDevolutions();
    this.tiempoExcedido();
    setInterval(() => {
      this.modoSeleccionado = this.AppComponent.temaSeleccionado;
      this.ComparativoOptions.plugins.legend.labels.color = this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'];
      this.ComparativoOptions.scales.x.ticks.color = this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'];
      this.ComparativoOptions.scales.y.ticks.color = this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'];
    }, 1000);
  } 
  
   //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  //Funcion que va a encargarse de cargar la información de las cards y llama a la funcion de que contará en cunato tiempo se recargará la información
  tiempoExcedido() {
    if (this.mainPage.calidad) {
       setTimeout(() => this.llenarGraficaComparativo(), 3000);
      let time = setInterval(() => {
        if (this.mainPage.calidad)  setTimeout(() => this.llenarGraficaComparativo(), 3000);
        else clearInterval(time);
      }, 60000);
    }
  }

  getInfoDevolutionsQuality(){
    //Devoluciones por tipo de rechazo
    this.svDevolutions.getTotalMoneyForRejectedType(2025).subscribe(data1 => {
      this.totalRejectedExt = data1.filter(x => x.rejectedType == 'EXTERNO').reduce((a, b) => a += b.total, 0);
      this.totalRejectedInt = data1.filter(x => x.rejectedType == 'INTERNO').reduce((a, b) => a += b.total, 0);
    }, error => {
      console.log(error);
    });

    //Devoluciones por area.
    this.svDevolutions.getTotalMoneyForArea(2025).subscribe(data2 => {
      this.devolutionsForArea = data2;
      this.devolutionsForArea.sort((a,b) => Number(b.total) - Number(a.total));
    }, error =>{
      console.log(error);
    });

    //Devoluciones por area.
    this.svDevolutions.getTotalMoneyForClient(2025).subscribe(data3 => {
      //console.log(data3);
      this.devolutionsForClient = data3;
      this.devolutionsForClient.sort((a,b) => Number(b.weight) - Number(a.weight));
    }, error =>{
      console.log(error);
    });

    setTimeout(() => {
      this.llenarGraficaAreas();
      this.llenarGraficaAreasPorKg();
      this.llenarGraficaClientes();
      this.llenarGraficaClientesPorKg();
    }, 2000);  
  }

  //Total devoluciones en kilos
  totalDevolutionsInKg = () => this.devolutionsForArea.reduce((a,b) => a += b.weight, 0);

  //Total devoluciones en dinero
  totalDevolutionsInMoney = () => this.devolutionsForArea.reduce((a,b) => a += b.total, 0);

  //Total devoluciones en kilos
  totalDevolutionsClientsInKg = () => this.devolutionsForClient.reduce((a,b) => a += b.weight, 0);

  //Total devoluciones en dinero
  totalDevolutionsClientsInMoney = () => this.devolutionsForClient.reduce((a,b) => a += b.total, 0);

  //Total facturado (Facturación vs mala calidad)
  totalFact = () => this.qualityVsFact.reduce((a,b) => a += b.Valor, 0);

  //Total devuelto (Facturación vs mala calidad)
  totalDevolutions = () => this.qualityVsFact.reduce((a,b) => a += b.Fact, 0);

  /** Función para llamar la grafica de */
  llenarGraficaComparativo(){
    this.ComparativoData = {
      labels: [''],
      datasets: [
        { label: 'Interno', backgroundColor: '#008cffff',  color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], data:  [this.totalRejectedInt] },
        { label: 'Externo', backgroundColor: '#ffd000',  color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], data: [this.totalRejectedExt] }
      ]
    };

    this.ComparativoOptions = {
      indexAxis: 'y',
      plugins: {
        legend: { labels: {  color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], } },
        tooltip: { titleFont: { size: 35, }, usePointStyle: true, bodyFont: { size: 15 } }
      },
      scales: {
        x: {ticks: {color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057']}, grid: {color: '#ebedef'}},
        y: {ticks: {color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057']}, grid: {color: '#ebedef'}}
      }
    };
  }

  // Funcion que va a llenar la grafcia de los clientes con mas pedidos
  llenarGraficaAreas(){
    let areas : any = [];
    let total : any = [];
    let qty : any = [];
    for (let i = 0; i < 10; i++) {
      areas.push(this.devolutionsForArea[i].area);
      total.push(this.devolutionsForArea[i].total);
      qty.push(this.devolutionsForArea[i].qty);
    }
    this.graficaPedidosClientes = {
      labels: areas,
      datasets: [
        {label: 'Cantidad', backgroundColor: ['#FFFF64'], color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], yAxisID: 'y', data: qty},
        {label: "Valor total",  backgroundColor: ['#00a130ff'], color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], yAxisID: 'y1', data: total}
      ]
    };
    this.estilosGrafica();
  }

  estilosGrafica(){
    this.opcionesGraficas = {
      stacked: false,
      plugins: {
        legend: { labels: {  color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], usePointStyle: true, font: { size: 18 } } },
        tooltip: { titleFont: { size: 23, }, usePointStyle: true, bodyFont: { size: 18 } }
      },
      tooltip: { usePointStyle: true, },
      scales: {
        x: {
          ticks: {
              color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'],
            font: { size: 18 },
            callback: function(value) {
              if (this.getLabelForValue(value).length > 8) return `${this.getLabelForValue(value).substring(0, 5)}...`;
              else return this.getLabelForValue(value);
            }
          },
          grid: {color: '#ebedef'}
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          ticks: {color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], font: {size: 18}},
          grid: {color: '#ebedef'}
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          ticks: {color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], font: {size: 18}},
          grid: {drawOnChartArea: false, color: '#ebedef'}
        },
      },
    };
  }

  // Funcion que va a llenar la grafcia de los clientes con mas pedidos
  llenarGraficaAreasPorKg(){
    let areas : any = [];
    let weight : any = [];
    let qty : any = [];
    for (let i = 0; i < 10; i++) {
      areas.push(this.devolutionsForArea[i].area);
      weight.push(this.devolutionsForArea[i].weight);
      qty.push(this.devolutionsForArea[i].qty);
    }
    this.graphicForKg = {
      labels: areas,
      datasets: [
        {label: 'Cantidad', backgroundColor: ['#0081a1ff'], color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], yAxisID: 'y', data: qty},
        {label: "Peso total",  backgroundColor: ['#89f7ffff'], color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], yAxisID: 'y1', data: weight}
      ]
    };
    this.estilosGraficaPorKg();
  }

  estilosGraficaPorKg(){
    this.graphicOptionsKg = {
      stacked: false,
      plugins: {
        legend: { labels: {  color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], usePointStyle: true, font: { size: 18 } } },
        tooltip: { titleFont: { size: 23, }, usePointStyle: true, bodyFont: { size: 18 } }
      },
      tooltip: { usePointStyle: true, },
      scales: {
        x: {
          ticks: {
              color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'],
            font: { size: 18 },
            callback: function(value) {
              if (this.getLabelForValue(value).length > 8) return `${this.getLabelForValue(value).substring(0, 5)}...`;
              else return this.getLabelForValue(value);
            }
          },
          grid: {color: '#ebedef'}
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          ticks: {color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], font: {size: 18}},
          grid: {color: '#ebedef'}
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          ticks: {color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], font: {size: 18}},
          grid: {drawOnChartArea: false, color: '#ebedef'}
        },
      },
    };
  }

  // Funcion que va a llenar la grafcia de los clientes con mas pedidos
  llenarGraficaClientes(){
    let clients : any = [];
    let total : any = [];
    let qty : any = [];
    for (let i = 0; i < 10; i++) {
      clients.push(this.devolutionsForClient[i].client);
      total.push(this.devolutionsForClient[i].total);
      qty.push(this.devolutionsForClient[i].qty);
    }
    this.graphicForClientMoney = {
      labels: clients,
      datasets: [
        {label: 'Cantidad', backgroundColor: ['#9684ffff'], color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], yAxisID: 'y', data: qty},
        {label: "Valor total",  backgroundColor: ['#4557ffff'], color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], yAxisID: 'y1', data: total}
      ]
    };
    this.estilosGraficaClientes();
  }

  //
  estilosGraficaClientes(){
    this.graphicOptionsClientMoney = {
      stacked: false,
      plugins: {
        legend: { labels: {  color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], usePointStyle: true, font: { size: 18 } } },
        tooltip: { titleFont: { size: 23, }, usePointStyle: true, bodyFont: { size: 18 } }
      },
      tooltip: { usePointStyle: true, },
      scales: {
        x: {
          ticks: {
              color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'],
            font: { size: 18 },
            callback: function(value) {
              if (this.getLabelForValue(value).length > 8) return `${this.getLabelForValue(value).substring(0, 5)}...`;
              else return this.getLabelForValue(value);
            }
          },
          grid: {color: '#ebedef'}
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          ticks: {color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], font: {size: 18}},
          grid: {color: '#ebedef'}
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          ticks: {color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], font: {size: 18}},
          grid: {drawOnChartArea: false, color: '#ebedef'}
        },
      },
    };
  }

  // Funcion que va a llenar la grafcia de los clientes con mas pedidos
  llenarGraficaClientesPorKg(){
    let clients : any = [];
    let weight : any = [];
    let qty : any = [];
    for (let i = 0; i < 10; i++) {
      clients.push(this.devolutionsForClient[i].client);
      weight.push(this.devolutionsForClient[i].weight);
      qty.push(this.devolutionsForClient[i].qty);
    }
    this.graphicForClientKg = {
      labels: clients,
      datasets: [
        {label: 'Cantidad', backgroundColor: ['#eeff90ff'], color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], yAxisID: 'y', data: qty},
        {label: "Peso total",  backgroundColor: ['#45aa45ff'], color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], yAxisID: 'y1', data: weight}
      ]
    };
    this.estilosGraficaClientesPorKg();
  }

  //
  estilosGraficaClientesPorKg(){
    this.graphicOptionsClientKg = {
      stacked: false,
      plugins: {
        legend: { labels: {  color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], usePointStyle: true, font: { size: 18 } } },
        tooltip: { titleFont: { size: 23, }, usePointStyle: true, bodyFont: { size: 18 } }
      },
      tooltip: { usePointStyle: true, },
      scales: {
        x: {
          ticks: {
              color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'],
            font: { size: 18 },
            callback: function(value) {
              if (this.getLabelForValue(value).length > 8) return `${this.getLabelForValue(value).substring(0, 5)}...`;
              else return this.getLabelForValue(value);
            }
          },
          grid: {color: '#ebedef'}
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          ticks: {color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], font: {size: 18}},
          grid: {color: '#ebedef'}
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          ticks: {color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], font: {size: 18}},
          grid: {drawOnChartArea: false, color: '#ebedef'}
        },
      },
    };
  }

  //
  loadInformationDevolutions(){
    this.svDevolutions.getTotalMoneyForMonth(2025).subscribe(data => {
      this.devolutionsForMonth = data;
      setTimeout(() => {
        this.badQualityVsFact();
      }, 2000);
      
      let info : any = [
          this.totalMesArea(data[0], 1),
          this.totalMesArea(data[1], 2),
          this.totalMesArea(data[2], 3),
          this.totalMesArea(data[3], 4),
          this.totalMesArea(data[4], 5),
          this.totalMesArea(data[5], 6),
          this.totalMesArea(data[6], 7),
          this.totalMesArea(data[7], 8),
          this.totalMesArea(data[8], 9),
          this.totalMesArea(data[9], 10),
          this.totalMesArea(data[10], 11),
          this.totalMesArea(data[11], 12),
        ];
      this.llenarGraficas(info);
    }, error => {
      console.log(error);
    });
  }

  totalMesArea = (datos : any [], mes : number) => datos.filter(x => x.year == 2025 && x.month == mes).reduce((a, b) => a += b.total, 0);

  //Función para inicializar las graficas
  inicializarGraficas(){
    this.graphicForMonth = [];
    //this.colocarTotalesProduccion();
    this.llenarOpcionesGrafica();
    this.graphicForMonth = this.formatoGraficas();
  }

  //Llenar opciones de graficas
  llenarOpcionesGrafica(){
    this.graphicOptions = {
      stacked: false,
      plugins: {
        legend: { labels: { color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], usePointStyle: true, font: { size: 20 } } },
        tooltip: { titleFont: { size: 50, }, usePointStyle: true, bodyFont: { size: 30 } }
      },
      scales: {
        x: {
          ticks: {
            color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'],
            font: { size: 20 },
            callback: function(value) {
              if (this.getLabelForValue(value).length > 4) return `${this.getLabelForValue(value).substring(0, 4)}...`;
              else return this.getLabelForValue(value);
            }
          },
          grid: { color: '#ebedef' }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          ticks: { color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], font: { size: 20 } },
          grid: { color: '#ebedef' },
          min : 0
        },
      },
      datalabels: { anchor: 'end', align: 'end' }
    };
  }

  //Formato de las graficas que contiene los meses
  formatoGraficas(){
    return {
      labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      datasets: []
    };
  }

  // Funcion que se encargará de llenar las graficas de areas
  llenarGraficas(data : any []){
    console.log(data);
    
    let color : string = "#"+((1<<24)*Math.random()|0).toString(16);
    let info = {
      label: `${2025}`,
      data: data,
      yAxisID: 'y',
      borderColor: color.substring(0, 4),
      backgroundColor: color.substring(0, 4) + "2",
      pointStyle: 'rectRot',
      pointRadius: 10,
      pointHoverRadius: 15,
      fill : true,
      tension: 0.3
    };
    this.graphicForMonth.datasets.push(info);
  }

  //
  colocarTotalesProduccion(){
    this.totalforMonth = [];
    this.graphicYears.forEach(year => {
      this.totalforMonth.push(this.formatoTotales(this.graphicForMonth, year));
    });
  }

  //
  formatoTotales(data : any [], anio : number){
    return {
      Anio : anio,
      Kg : this.calcularKgProducidos(data, anio)
    }
  }

  //
  calcularKgProducidos(produccion : any, anio : number) : number {
    let total : number = 0;
    produccion.datasets.forEach(prod => {
      if (prod.label.includes(anio.toString())) {
        total += prod.data.reduce((a, b) => Number(a) + Number(b), 0);
      }
    });
    return total;
  }
  
  //
  badQualityVsFact(){
    let count : number = 0;
    this.svFact.GetFacturacion_Mes_Mes('2025').subscribe(data => {
      const quaVsFact = this.parseDatos(data).map(dato => {
        const fact = this.devolutionsForMonth[count].find(d => d.month == parseInt(dato.Mes))?.total || 0;
        const nameMonth = this.devolutionsForMonth[count].find(d => d.month == parseInt(dato.Mes))?.nameMonth || '';
        const percentage = (fact / dato.Valor);
        console.log(fact, dato.Valor, percentage);
        
        count++
        return { ...dato, Fact: fact, NombreMes : nameMonth, Porcentaje : percentage };
      });
      this.qualityVsFact = quaVsFact;
    });
    
  }

  //
  parseDatos(raw: string[]): { Mes: string; Valor: number, Fact : number, NombreMes : string, Porcentaje : number }[] {
    return raw.map(entry => {
      const match = entry.match(/'Mes': '(\d+)', 'Valor': '([\d,]+)'/);
      if (!match) return { Mes: '00', Valor: 0, Fact : 0, NombreMes : '', Porcentaje : 0 };
      const mes = match[1];
      const valor = parseFloat(match[2].replace(',', '.'));
      return { Mes: mes, Valor: valor, Fact : 0, NombreMes : '', Porcentaje : 0 };
    });
  }


}
