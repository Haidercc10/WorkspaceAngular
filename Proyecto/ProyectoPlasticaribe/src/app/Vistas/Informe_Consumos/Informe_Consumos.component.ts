import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import moment from 'moment';
import { Table } from 'primeng/table';
import { Entradas_Salidas_MPService } from 'src/app/Servicios/Entradas_Salidas_MP/Entradas_Salidas_MP.service';
import { Movimientos_Entradas_MPService } from 'src/app/Servicios/Movimientos_Entradas_MP/Movimientos_Entradas_MP.service';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-Informe_Consumos',
  templateUrl: './Informe_Consumos.component.html',
  styleUrls: ['./Informe_Consumos.component.css']
})
export class Informe_ConsumosComponent implements OnInit {
  load : boolean = false; //Variable para controlar la carga de la pagina
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  rangoFechas : any = []; //Variable que se usará para almacenar el rango de fechas que se seleccionarán en el filtro
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  hora : any = moment().format('HH:mm:ss'); //Variable que se usará para llenar la hora actual
  primerDiaMes : any = moment().startOf('month').format('YYYY-MM-DD');
  ultimoDiaMes : any = moment().endOf('month').format('YYYY-MM-DD');
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente

  consumos : any = []; //Variable que se usará para almacenar los datos de los consumos
  @ViewChild('dt') dt: Table | undefined; // Tabla que contendrá la información de la tabla inicialmente
  @ViewChild('dt2') dt2: Table | undefined; // Tabla que contendrá la información de la tabla inicialmente
  salidas : any = []; //Variable que se usará para almacenar los datos de los consumos
  materiales : any = []; //Variable que se usará para almacenar los datos de la materia prima
  formFiltros : any = []; //Variable que se usará para almacenar los datos del formulario de filtros
  materiasPrimas : any = []; //Variable que se usará para almacenar los datos de la materia prima

  constructor(private AppComponent : AppComponent, 
                private salidasService : Entradas_Salidas_MPService,
                  private frmBuilder : FormBuilder,
                    private movEntradasService : Movimientos_Entradas_MPService,) {

    this.formFiltros = this.frmBuilder.group({ 
      rangoFechas : [],
      material : null,
      NombreMaterial : null,
    });           
  }

  ngOnInit() {
    this.lecturaStorage();
    this.obtenerMateriales();
  }

  //Funcion que se usará para mostrar el tutorial
  tutorial(){
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  // Funcion que va a obtener los diferentes materiales
  obtenerMateriales = () => this.movEntradasService.GetInventarioMateriales().subscribe(datos => this.materiasPrimas = datos);

  // Funcion que va a limpiar el formulario
  limpiarCampos() {
    this.formFiltros.reset();
    this.load = false;
  }

  // Funcion que va a cambiar el nombre del material en el html
  cambiarNombreMaterial(){
    let material : number = this.formFiltros.value.NombreMaterial;
    let nombreMaterial : string = this.materiasPrimas.find(x => x.id_Materia_Prima == material).nombre_Materia_Prima;
    //console.log(nombreMaterial)
    this.formFiltros.patchValue({
      material : material,
      NombreMaterial : nombreMaterial,
    });
  }

  //Función donde se consultarán los consumos por fecha
  consultar(){
    this.load = true;
    this.consumos = [];
    let fecha1 : any = (this.formFiltros.value.rangoFechas != undefined && this.formFiltros.value.rangoFechas[0].length > 0 && this.formFiltros.value.rangoFechas[0] != null) ? moment(this.formFiltros.value.rangoFechas[0]).format('YYYY-MM-DD') : this.primerDiaMes; 
    let fecha2 : any = (this.formFiltros.value.rangoFechas[1] != undefined && this.formFiltros.value.rangoFechas[1].length > 0 && this.formFiltros.value.rangoFechas[1] != null) ? moment(this.formFiltros.value.rangoFechas[1]).format('YYYY-MM-DD') : this.today;
    let material : number = this.formFiltros.value.material;

    this.salidasService.GetConsumos(fecha1, fecha2, material).subscribe(data => { 
      for(let i = 0; i < data.length; i++){
        this.cargarConsumos(data[i]);
      }
      setTimeout(() => { this.mostrarDetalleConsumo(); }, 2000);
    })
  }

  //Función que cargará el array de consumos que contendrá todos los consumos del mes.
  cargarConsumos(datos : any){
    let info : any = {
      Fecha : `${datos.fecha.replace('T00:00:00', '')}`,
      OT : datos.ot,
      Material : datos.materialRealId,
      NombreMaterial : datos.nombreMaterial,
      CantRequerida : datos.cantidad_Requerida,
      CantEstandar : datos.cantidad_Estandar,
      DifCantidad : datos.diferencial_Cantidad,
      PrecioPP : datos.precio_Real,
      ValoracionCantidad : datos.valoracionDCxPR,
      CostoReal : datos.costo_Real,
      CostoEstandar : datos.costo_Estandar,
    }
    this.consumos.push(info);
  }

  //Funcion que se usará para aplicar los filtros de la tabla
  aplicarfiltro = ($event, campo : any, valorCampo : string) => this.dt!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

  //Función que mostrará los detalles de los consumos por fecha y OT.
  mostrarDetalleConsumo(){
    this.salidas = this.consumos.reduce((acc, item) => {
      let info : any = {
        Fecha : item.Fecha,
        Material : item.Material,
        NombreMaterial : item.NombreMaterial,
        OT : item.OT,
        CantRequerida : item.CantRequerida,
        CantEstandar : item.CantEstandar,
        DifCantidad : 0,
        PrecioPP : item.PrecioPP,
        ValoracionCantidad : item.ValoracionCantidad,
        CostoReal : item.CostoReal,
        CostoEstandar : 0,
        Materiales : [],
      }
      const objetoEncontrado = acc.find(x => x.OT == info.OT && x.Fecha == info.Fecha);
      if(objetoEncontrado) {
        objetoEncontrado.CantRequerida += info.CantRequerida;
        objetoEncontrado.DifCantidad = (objetoEncontrado.CantRequerida - objetoEncontrado.CantEstandar); 
        objetoEncontrado.CostoReal += (info.PrecioPP * item.CantRequerida);
        objetoEncontrado.PrecioPP = (objetoEncontrado.CostoReal / objetoEncontrado.CantRequerida);
        objetoEncontrado.ValoracionCantidad = (objetoEncontrado.PrecioPP * objetoEncontrado.DifCantidad);
        objetoEncontrado.CostoEstandar = (info.PrecioPP * info.CantEstandar);
      } else acc.push(info);
      return acc;
    }, [])

    setTimeout(() => {
      for (let index = 0; index < this.consumos.length; index++) {
        let indice = this.salidas.findIndex(x => x.OT == this.consumos[index].OT && x.Fecha == this.consumos[index].Fecha);
        this.salidas[indice].Materiales.push(this.consumos[index]);
      }
      this.load = false;
    }, 1000);
    
  }
}
