import { Component, OnInit, ViewChild } from '@angular/core';
import { ShepherdService } from 'angular-shepherd';
import DataLabelsPlugin from 'chartjs-plugin-datalabels';
import moment from 'moment';
import { OverlayPanel } from 'primeng/overlaypanel';
import { EntradaBOPPService } from 'src/app/Servicios/BOPP/entrada-BOPP.service';
import { DetallesAsignacionMPxTintasService } from 'src/app/Servicios/DetallesCreacionTintas/detallesAsignacionMPxTintas.service';
import { EstadosProcesos_OTService } from 'src/app/Servicios/EstadosProcesosOT/EstadosProcesos_OT.service';
import { MateriaPrimaService } from 'src/app/Servicios/MateriaPrima/materiaPrima.service';
import { AppComponent } from 'src/app/app.component';
import { defaultStepOptions, stepsDashboardMateriaPrima as defaultSteps } from 'src/app/data';
import { PaginaPrincipalComponent } from '../PaginaPrincipal/PaginaPrincipal.component';

@Component({
  selector: 'app-Dashboard_MatPrima',
  templateUrl: './Dashboard_MatPrima.component.html',
  styleUrls: ['./Dashboard_MatPrima.component.css']
})
export class Dashboard_MatPrimaComponent implements OnInit {

  @ViewChild('op') op: OverlayPanel | undefined;

  /** Variables generales */
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  today : any = moment().format('YYYY-MM-DD'); //Variable que va a almacenar la fecha del dia de hoy
  primerDiaMes : any = moment().startOf('month').format('YYYY-MM-DD'); //Variable que va a almacenar el primer dia del mes
  /** Variables para materias primas */
  inventarioMateriaPrima : any [] = []; //Variable que almacenará la informacion de los inventarios inciales ya ctuales de las mterias primas
  costoTotalMateriasPrimas : number = 0; //Variable que almacenará el costo total de todas las materias primas
  cantidadMateriasPrimas : number = 0 //Variable que va a almacenar la cantidad de materias primas con existencias
  cantRollosBopp : number = 0; //Variable que almacenará la cantidad de rollo de bopp que hay en la bodega
  cantRollosBopa : number = 0; //Variable que almacenará la cantidad de rollos de bopa que hay en la bodega
  cantRollosPoliester : number = 0; //Variable que almacenará la cantidad de rollos de poliester que hay en la bodega
  cantRollosUtilizados : number = 0; //Variable que almacenará la cantidad de rollos de polipropileno biorientado que se han utilizado en lo que va del mes
  cantRollosEntrantes : number = 0; //Variable que almacenará la cantidad e rollo de polipropileno biorientado que han ingrsados durante el mes
  materiasPrimasMovidasHoy : any [] = []; //Variable que almcenará información acerca de las materias primas que se han asignado el dia de hoy
  cantMateriasPrimas : any [] = []; //Variable que almacenará las materias primas que se han creado y/o asignado el dia de hoy
  cantTintasCreadas : number = 0; //Variable que almacenará la cantidad de tintas que se crearon
  tintasCreadas : any []= []; //Variable que almacenará las tintas creadas
  materiasPrimasMasUtilizadasMes : any [] = []; //Variable que almacenará las materias primas que mas se utilizaron durandote el mes
  materiasPrimasMasUtilizadasCrearTintaMes : any [] = []; //variable que almacenará las materias primas utilizadas para la creación de tinas
  totalMpAsignada : number = 0; //Variable que va a almacenar la cantidad de materia prima asignada en todo el ultimo mes
  totalExtruidoMes : number = 0; //Variable que almacenará la cantidad de materia prima que se ha extruido en el mes
  arrayBopps : any = [];
  chartOptions : any;
  mesActual ;
  cargando : boolean = false;
  nroCard : string = ''; /** Variable que identificará cual es la card de la cual se desea mostrar la descripción */
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro

  /* GRAFICA */
  ComparativoData: any;
  ComparativoOptions: any;
  ComparativoPlugins = [ DataLabelsPlugin ];

  constructor(private AppComponent : AppComponent,
                private ordenTrabajoService : EstadosProcesos_OTService,
                  private materiaPrimaService : MateriaPrimaService,
                    private boppService : EntradaBOPPService,
                      private tintasCreadasService : DetallesAsignacionMPxTintasService,
                        private shepherdService: ShepherdService,
                          private paginaPrincial : PaginaPrincipalComponent,) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
  }

  ngOnInit() {
    this.tiempoExcedido();
    this.lecturaStorage();
  }

  tutorial(){
    this.shepherdService.defaultStepOptions = defaultStepOptions;
    this.shepherdService.modal = true;
    this.shepherdService.confirmCancel = false;
    this.shepherdService.addSteps(defaultSteps);
    this.shepherdService.start();
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage = () => this.ValidarRol = this.AppComponent.storage_Rol;

  /** Función para recargar el tab de materias primas */
  recargarTab = () => setTimeout(() => this.tiempoExcedido(), 60000);

  /** Función que se ejecutará cada un minuto y mostrará la info de las materias primas */
  tiempoExcedido(){
    if (this.paginaPrincial.materiaPrima){
      this.cambiarNombreMes();
      setTimeout(() => { this.materiasPrimas(); }, 1000);
      this.recargarTab();
      setTimeout(() => { this.llenarGraficaComparativo(); }, 3000);
    }
  }

  /** Función paracambiar el nombre del mes a español */
  cambiarNombreMes() {
    let mes : any = moment().format('MMMM');
    if(mes == 'January') this.mesActual = 'Enero';
    else if(mes == 'February') this.mesActual = 'Febrero';
    else if(mes == 'March') this.mesActual = 'Marzo';
    else if(mes == 'April') this.mesActual = 'Abril';
    else if(mes == 'May') this.mesActual = 'Mayo';
    else if(mes == 'June') this.mesActual = 'Junio';
    else if(mes == 'July') this.mesActual = 'Julio';
    else if(mes == 'August') this.mesActual = 'Agosto';
    else if(mes == 'September') this.mesActual = 'Septiembre';
    else if(mes == 'October') this.mesActual = 'Octubre';
    else if(mes == 'November') this.mesActual = 'Noviembre';
    else if(mes == 'December') this.mesActual = 'Diciembre';
  }

  /** Función para cargar la info de las materias primas cada card */
  materiasPrimas(){
    this.inventarioMateriaPrima = [];
    this.cantMateriasPrimas = [];
    this.cantRollosBopp = 0;
    this.cantRollosBopa = 0;
    this.cantRollosPoliester = 0;
    this.cantRollosEntrantes = 0;
    this.cantRollosUtilizados = 0;
    this.materiasPrimasMovidasHoy = [];
    this.tintasCreadas = [];
    this.cantTintasCreadas = 0;
    this.materiasPrimasMasUtilizadasMes = [];
    this.totalMpAsignada = 0;
    this.totalExtruidoMes = 0;
    this.materiasPrimasMasUtilizadasCrearTintaMes = [];

    if(this.ValidarRol == 1 || this.ValidarRol == 3 || this.ValidarRol == 60) {
      this.materiaPrimaService.GetInventarioMateriasPrimas().subscribe(datos_materiaPrima => {
        for (let i = 0; i < datos_materiaPrima.length; i++) {
          if (datos_materiaPrima[i].id_Materia_Prima != 84 && datos_materiaPrima[i].id_Materia_Prima != 2001 && datos_materiaPrima[i].id_Materia_Prima != 449) {
            let info : any = {
              numero : i + 1,
              id : datos_materiaPrima[i].id_Materia_Prima,
              nombre : datos_materiaPrima[i].nombre_Materia_Prima,
              inicial : datos_materiaPrima[i].inicial,
              actual : datos_materiaPrima[i].actual,
              estado : ''
            }
            if(info.id < 2000) {
              if(datos_materiaPrima[i].actual <= 0) info.estado = 'Sin stock';
              else if (datos_materiaPrima[i].actual > 0 && datos_materiaPrima[i].actual < 1000) info.estado = 'Bajo';
              else if (datos_materiaPrima[i].actual > 1000 && datos_materiaPrima[i].actual < 3000) info.estado = 'Medio';
              else info.estado = 'Alto';
            } else if(info.id >= 2000 && info.id < 4000) {
              if(datos_materiaPrima[i].actual <= 0) info.estado = 'Sin stock';
              else if (datos_materiaPrima[i].actual > 0 && datos_materiaPrima[i].actual < 100) info.estado = 'Bajo';
              else if (datos_materiaPrima[i].actual > 100 && datos_materiaPrima[i].actual < 200) info.estado = 'Medio';
              else info.estado = 'Alto';
            } else if (info.id >= 4000) {
              if(datos_materiaPrima[i].actual <= 0) info.estado = 'Sin stock';
              else if (datos_materiaPrima[i].actual > 0 && datos_materiaPrima[i].actual < 100) info.estado = 'Bajo';
              else if (datos_materiaPrima[i].actual > 100 && datos_materiaPrima[i].actual < 200) info.estado = 'Medio';
              else info.estado = 'Alto';
            }
            info.nombre = info.nombre.split(' -');
            info.nombre = info.nombre[0].concat(' - ', info.nombre[1]).replace('- undefined', '');
            this.inventarioMateriaPrima.push(info);
          }
        }
      });

      this.boppService.GetBoppStockInventario().subscribe(datos_bopp => {
        for (let i = 0; i < datos_bopp.length; i++) {
          if (datos_bopp[i].catMP_Id == 6) this.cantRollosBopp = datos_bopp[i].conteoDescripcion;
          else if (datos_bopp[i].catMP_Id == 14) this.cantRollosBopa = datos_bopp[i].conteoDescripcion;
          else if (datos_bopp[i].catMP_Id == 15) this.cantRollosPoliester = datos_bopp[i].conteoDescripcion;
        }
      });

      this.boppService.GetCantRollosUtilizados_Mes(this.primerDiaMes, this.today).subscribe(datos => this.cantRollosUtilizados = datos.reduce((a,b) => a + b.cantidad, 0));

      this.boppService.GetCantRollosIngresados_Mes(this.primerDiaMes, this.today).subscribe(datos => this.cantRollosEntrantes = datos.reduce((a,b) => a + b.cantidad, 0));

      this.materiaPrimaService.GetMateriasPrimasUtilizadasHoy(this.today).subscribe(datos => {
        for (let index = 0; index < datos.length; index++) {
          let info : any = {
            nro : index + 1,
            nombre : datos[index].nombre,
            asignaciones : datos[index].asignaciones,
            cantidad : datos[index].cantidad,
            und : 'Kg',
          }
          this.materiasPrimasMovidasHoy.push(info);
          this.materiasPrimasMovidasHoy.sort((a,b) => Number(b.cantidad) - Number(a.cantidad));
        }
      });

      this.tintasCreadasService.GetTintasCreadasMes(this.primerDiaMes, this.today).subscribe(datos_tintas => {
        this.tintasCreadas = datos_tintas;
        this.tintasCreadas.sort((a,b) => Number(b.cantidad) - Number(a.cantidad));
        this.cantTintasCreadas = datos_tintas.length + 1;
      });

      this.materiaPrimaService.GetMateriasPrimasUltilizadasMes(this.primerDiaMes, this.today).subscribe(datos => {
          for (let index = 0; index < datos.length; index++) {
            let info : any = {
              nro : index + 1,
              id : datos[index].id,
              nombre : datos[index].nombre,
              asignaciones : datos[index].asignaciones,
              cantidad : datos[index].cantidad,
              und : 'Kg',
              imagen : '',
            }
            info.id > 2000 ? info.imagen = 'tinta2.png' : info.imagen = 'mp.png';
            this.materiasPrimasMasUtilizadasMes.push(info);
            this.materiasPrimasMasUtilizadasMes.sort((a,b) => Number(b.cantidad) - Number(a.cantidad));
          }
      });

      this.tintasCreadasService.GetMateriasPrimasCrearTintasMes(this.primerDiaMes, this.today).subscribe(datos => {
        for (let index = 0; index < datos.length; index++) {
          let info : any = {
            nro : index + 1,
            id : datos[index].tinta_Id,
            nombre : datos[index].tinta_Nombre,
            cantidad : datos[index].cantidad,
            und : 'Kg',
            imagen : '',
          }
          info.id > 2000 ? info.imagen = 'tinta2.png' : info.imagen = 'mp.png';
          this.materiasPrimasMasUtilizadasCrearTintaMes.push(info);
          this.materiasPrimasMasUtilizadasCrearTintaMes.sort((a,b) => Number(b.cantidad) - Number(a.cantidad));
        }
      });

      this.ordenTrabajoService.GetTotalMateriaPrimaAsignadaMes(this.primerDiaMes, this.today).subscribe(datos_ot => {
        for (let i = 0; i < datos_ot.length; i++) {
          this.totalMpAsignada += datos_ot[i].cantidad;
          this.totalExtruidoMes += datos_ot[i].extruido;
        }
      });
    }
  }

  /** Función para llamar la grafica de la mat. prima asignada vs extruida*/
  llenarGraficaComparativo(){
    this.ComparativoData = {
      labels: [''],
      datasets: [
        { label: 'MP Asignada', backgroundColor: '#42A5F5',  color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], data:  [this.totalMpAsignada] },
        { label: 'MP Extruida', backgroundColor: '#FFA726',  color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], data: [this.totalExtruidoMes] }
      ]
    };

    this.ComparativoOptions = {
      indexAxis: 'y',
      plugins: {
        legend: { labels: {  color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], } },
        tooltip: { titleFont: { size: 35, }, usePointStyle: true, bodyFont: { size: 15 } }
      },
      scales: {
        x: { ticks: {  color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], }, grid: { color: '#ebedef' } },
        y: { ticks: {  color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], }, grid: { color: '#ebedef' } }
      }
    };
  }

  /** Grafica de pie en des uso */
  grafica(cantBopp : number, cantBopa: number, cantPoliester: number) {
    this.arrayBopps = {
      labels: ['BOPP','BOPA','POLIESTER'],
      datasets: [
        {
          data: [{id : 'BOPP', nested: {value: cantBopp}}, {id : 'BOPA', nested: {value: cantBopa}}, {id : 'POLIESTER',  nested: {value: cantPoliester}}],
          backgroundColor: [
            "#42A5F5",
            "#66BB6A",
            "#FFA726"
          ],
        hoverBackgroundColor: [
            "#64B5F6",
            "#81C784",
            "#FFB74D"
          ]
        }
      ]
    };
    this.chartOptions = {
      parsing: {
        key: 'nested.value'
      }
    }
  }
}
