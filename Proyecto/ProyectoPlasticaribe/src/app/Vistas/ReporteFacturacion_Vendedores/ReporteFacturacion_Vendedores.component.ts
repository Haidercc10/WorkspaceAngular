import { Component, Inject, OnInit } from '@angular/core';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { InventarioZeusService } from 'src/app/Servicios/InventarioZeus/inventario-zeus.service';
import { UsuarioService } from 'src/app/Servicios/Usuarios/usuario.service';
import DataLabelsPlugin from 'chartjs-plugin-datalabels';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-ReporteFacturacion_Vendedores',
  templateUrl: './ReporteFacturacion_Vendedores.component.html',
  styleUrls: ['./ReporteFacturacion_Vendedores.component.css']
})
export class ReporteFacturacion_VendedoresComponent implements OnInit {

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

  constructor(@Inject(SESSION_STORAGE) private storage: WebStorageService,
                private zeusService : InventarioZeusService,
                  private usuarioService : UsuarioService,
                    private messageService: MessageService) { }

  ngOnInit() {
    this.lecturaStorage();
    this.llenarArrayAnios();
    this.consultarVendedores();
    this.graficarDatos();
  }

  // Funcion que va a llenar el array de años
  llenarArrayAnios(){
    for (let i = 0; i < this.anios.length; i++) {
      let num_Mayor : number = Math.max(...this.anios);
      if (num_Mayor == moment().year()) break;
      this.anios.push(num_Mayor + 1);
    }
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.storage.get('Id');
    this.storage_Nombre = this.storage.get('Nombre');
    this.ValidarRol = this.storage.get('Rol');
  }

  // Funcion que va a consultar la información de los vendedores
  consultarVendedores = () => this.usuarioService.GetVendedores().subscribe(datos => this.vendedores = datos);

  // Función que va a consultar cuanto fue el costo facturado de los vendedores que se indiquen
  consultarFacturacionVendedor(){
    this.cargando = true;
    let vendedor : any;
    if (`${this.vendedorSeleccionado}`.length == 2) vendedor = `0${this.vendedorSeleccionado}`;
    else if (`${this.vendedorSeleccionado}`.length == 1) vendedor = `00${this.vendedorSeleccionado}`;

    let enero : number = 0;
    let febrero : number = 0;
    let marzo : number = 0;
    let abril : number = 0;
    let mayo : number = 0;
    let junio : number = 0;
    let julio : number = 0;
    let agosto : number = 0
    let septiembre : number = 0;
    let octubre : number = 0;
    let noviembre : number = 0;
    let diciembre : number = 0;

    let validar : any = this.datosConsultados.filter((item) => item.Anio == `${this.anioSeleccionado}` && item.Vendedor == vendedor);
    if (validar.length == 0){
      for (let i = 0; i < 12; i++) {
        let mes : string = `${i + 1}`.length == 1 ? `0${i + 1}` : `${i + 1}`;
        this.zeusService.GetCostoFacturado_Vendedor(vendedor, mes, this.anioSeleccionado).subscribe(data => {
          enero = mes == '01' ? data : enero;
          febrero = mes == '02' ? data : febrero;
          marzo = mes == '03' ? data : marzo;
          abril = mes == '04' ? data : abril;
          mayo = mes == '05' ? data : mayo;
          junio = mes == '06' ? data : junio;
          julio = mes == '07' ? data : julio;
          agosto = mes == '08' ? data : agosto;
          septiembre = mes == '09' ? data : septiembre;
          octubre = mes == '10' ? data : octubre;
          noviembre = mes == '11' ? data : noviembre;
          diciembre = mes == '12' ? data : diciembre;
        });
      }
      setTimeout(() => {
        let info : any = {
          label: `${this.anioSeleccionado}`,
          data: [enero, febrero, marzo, abril, mayo, junio, julio, agosto, septiembre, octubre, noviembre, diciembre],
          yAxisID: 'y',
          borderColor: "#"+((1<<24)*Math.random()|0).toString(16),
          backgroundColor: "#"+((1<<24)*Math.random()|0).toString(16),
          pointStyle: 'rectRot',
          pointRadius: 10,
          pointHoverRadius: 15,
          tension: 0.3
        };
        this.facturasData.datasets.push(info);
        this.datosConsultados.push({Anio : `${this.anioSeleccionado}`, Vendedor : vendedor});
        this.cargando = false;
      }, 1500);
    } else {
      this.mensajeAdvertencia(`¡Ya se ha graficado la información del vendedor con el código ${vendedor} en el año ${this.anioSeleccionado}!`);
      this.cargando = false;
    }
  }

  // Funcion que va a inicializar la informacion de los arrays que almacenan la info de la grafica
  graficarDatos(){
    this.datosConsultados = [];
    this.facturasData = {
      labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      datasets: []
    };

    this.facturasOptions = {
      stacked: false,
      plugins: {
        legend: { labels: { color: '#495057', usePointStyle: true, font: { size: 20 } } },
        tooltip: { titleFont: { size: 50, }, usePointStyle: true, bodyFont: { size: 30 } }
      },
      scales: {
        x: {
          ticks: {
            color: '#495057',
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
          ticks: { color: '#495057', font: { size: 20 } },
          grid: { color: '#ebedef' }
        },
      },
      datalabels: { anchor: 'end', align: 'end' }
    };
  }

  /** Mostrar mensaje de advertencia */
  mensajeAdvertencia = (mensaje : string) => this.messageService.add({severity:'warn', summary: `¡Advertencia!`, detail: mensaje, life: 2000});
}
