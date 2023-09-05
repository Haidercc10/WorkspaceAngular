import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import moment from 'moment';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { Movimientos_Entradas_MPService } from 'src/app/Servicios/Movimientos_Entradas_MP/Movimientos_Entradas_MP.service';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-prueba-imagen-cat-insumo',
  templateUrl: './prueba-imagen-cat-insumo.component.html',
  styleUrls: ['./prueba-imagen-cat-insumo.component.css']
})

export class PruebaImagenCatInsumoComponent implements OnInit {

  cargando : boolean = false;
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  modoSeleccionado : boolean;
  FormFiltros : FormGroup;
  rangoFechasConsulta : any [] = [];
  materiales : any [] = [];
  comprasRealizadas : any [] = [];

  constructor(private AppComponent : AppComponent,
                private frmBuilder  : FormBuilder,
                  private msg : MensajesAplicacionService,
                    private movEntradasService : Movimientos_Entradas_MPService,) {
                    
    this.FormFiltros = this.frmBuilder.group({
      RangoFechas : [],
      material : [],
    });
  }

  ngOnInit(): void {
    this.lecturaStorage();
    this.obtenerMateriales();
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  // Funcion que va a obtener los diferentes materiales
  obtenerMateriales = () => this.movEntradasService.GetInventarioMateriales().subscribe(datos => this.materiales = datos);

  // Funcion que va a limpiar el formulario
  limpiarCampos = () => this.FormFiltros.reset();

  // Funcion que va a buscar la información de las compras realizadas
  buscarComprasRealizadas(){
    if (this.rangoFechasConsulta.length > 1) {
      let material : number = this.FormFiltros.value.material;
      let fechaInicio : any = moment(this.rangoFechasConsulta[0]).format('YYYY-MM-DD');
      let fechaFin : any = this.rangoFechasConsulta[1] == null ? fechaInicio : moment(this.rangoFechasConsulta[1]).format('YYYY-MM-DD');
      if (material != null) {
        this.cargando = true;
        this.comprasRealizadas = [];
          this.movEntradasService.GetComprasRealizadas(fechaInicio, fechaFin, material).subscribe(data => data.forEach(compra => this.llenarTablaComprasRealizadas(compra)), () => {
            this.msg.mensajeError('No se encontró información');
            this.cargando = false;
          }, () => this.cargando = false);
      } else this.msg.mensajeAdvertencia(`¡Debe seleccionar el material al que se le calcularán los costos!`);
    } else this.msg.mensajeAdvertencia(`¡Debe seleccionar un rango de fechas para consultar la información!`);
  }

  // Funcion que va a llenar la tabla con las compras realizadas
  llenarTablaComprasRealizadas(compra : any){
    this.comprasRealizadas.push({
      Id : 1,
      fecha : `${compra.fechaCompra.replace('T00:00:00', '')} - ${compra.horaCompra}`,
      cantComprada : compra.cantidadCompra,
      precioCompra : compra.precioReal,
      precioEstandar : compra.precioEstandar,
      diffPrecio : -compra.diferenciaPrecio,
      costoRealMaterial : compra.costoReal,
      costoEstandarMaterial : compra.costoEstandar,
      variacionPrecio : compra.variacionPrecio,
    });
  }

  // Funcion que va a calcular el total de la cantidad comprada 
  calcularTotalCantidadComprada = () : number => this.comprasRealizadas.reduce((acc, compra) => acc + compra.cantComprada, 0);

  // Funcion que va a calcular el total del costo real del material
  calcularTotalCostoRealMaterial = () : number => this.comprasRealizadas.reduce((acc, compra) => acc + compra.costoRealMaterial, 0);

  // Funcion que va a calcular el total del costo estandar del material
  calcularTotalCostoEstandarMaterial = () : number => this.comprasRealizadas.reduce((acc, compra) => acc + compra.costoEstandarMaterial, 0);

  // Funcion que va a calcular el total de la variacion de precio
  calcularTotalVariacionPrecio = () : number => this.comprasRealizadas.reduce((acc, compra) => acc + compra.variacionPrecio, 0);
}