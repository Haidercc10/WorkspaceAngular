import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import moment from 'moment';
import { Table } from 'primeng/table';
import { Entradas_Salidas_MPService } from 'src/app/Servicios/Entradas_Salidas_MP/Entradas_Salidas_MP.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { Movimientos_Entradas_MPService } from 'src/app/Servicios/Movimientos_Entradas_MP/Movimientos_Entradas_MP.service';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-prueba-imagen-cat-insumo',
  templateUrl: './prueba-imagen-cat-insumo.component.html',
  styleUrls: ['./prueba-imagen-cat-insumo.component.css']
})

export class PruebaImagenCatInsumoComponent implements OnInit {

  table : Table
  cargando : boolean = false;
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  modoSeleccionado : boolean;
  FormFiltros : FormGroup;
  materiales : any [] = [];
  comprasRealizadas : any [] = [];
  salidasRealizadas : any [] = [];
  modalKardex : boolean = false;
  datosKardex : any [] = [];

  constructor(private AppComponent : AppComponent,
                private frmBuilder  : FormBuilder,
                  private msg : MensajesAplicacionService,
                    private movEntradasService : Movimientos_Entradas_MPService,
                      private salidasMaterialService : Entradas_Salidas_MPService,) {
                    
    this.FormFiltros = this.frmBuilder.group({
      RangoFechas : [],
      material : [],
      NombreMaterial : [],
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
  limpiarCampos() {
    this.FormFiltros.reset();
    this.cargando = false;
  }

  // Funcion que va a cambiar el nombre del material en el html
  cambiarNombreMaterial(){
    let material : number = this.FormFiltros.value.NombreMaterial;
    let nombreMaterial : string = this.materiales.find(x => x.id_Materia_Prima == material).nombre_Materia_Prima;
    this.FormFiltros.patchValue({
      material : material,
      NombreMaterial : nombreMaterial,
    });
  }

  // Funcion que va a buscar la información de las compras realizadas
  buscarComprasRealizadas(){
    if (this.FormFiltros.value.RangoFechas.length > 1) {
      let material : number = this.FormFiltros.value.material;
      let fechaInicio : any = moment(this.FormFiltros.value.RangoFechas[0]).format('YYYY-MM-DD');
      let fechaFin : any = this.FormFiltros.value.RangoFechas[1] == null ? fechaInicio : moment(this.FormFiltros.value.RangoFechas[1]).format('YYYY-MM-DD');
      if (material != null) {
        this.salidasMaterialService.GetSalidasRealizadas(fechaInicio, fechaFin, material).subscribe(data => this.salidasRealizadas = data);
        this.cargando = true;
        this.comprasRealizadas = [];
        this.salidasRealizadas = [];
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
      diffPrecio : compra.diferenciaPrecio,
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

  // Funcion que va a cargar la información del kardex
  cargarKardex(){
    this.cargando = true;
    this.datosKardex = [];
    // Inventario inicial
    this.movEntradasService.GetComprasAntiguas(moment(this.FormFiltros.value.RangoFechas[0]).format('YYYY-MM-DD'), this.FormFiltros.value.material).subscribe(data => {
      let cantFinal = 0, costoFinal = 0;
      data.forEach(compra => {
        this.datosKardex.push({
          Id : this.datosKardex.length + 1,
          fecha : moment().startOf('month').format('YYYY-MM-DD'),
          cantEntrada : '',
          precioEntrada : '',
          costoEntrada : '',
          cantSalida : '',
          precioSalida : '',
          costoSalida : '',
          cantidadFinal : compra.cantidadCompra,
          precioFinal : compra.precioReal,
          costoFinal : compra.costoReal,
          total : false,
        });
        cantFinal += compra.cantidadCompra;
        costoFinal += compra.costoReal;
      });
      this.datosKardex.push({
        Id : this.datosKardex.length + 1,
        fecha : moment().startOf('month').format('YYYY-MM-DD'),
        cantEntrada : '',
        precioEntrada : '',
        costoEntrada : '',
        cantSalida : '',
        precioSalida : '',
        costoSalida : '',
        cantidadFinal : cantFinal,
        precioFinal : '',
        costoFinal : costoFinal,
        total : true,
      });
      this.datosKardex.sort((a, b) => a.fecha.localeCompare(b.fecha));
    }, () => {
      this.datosKardex.push({
        Id : this.datosKardex.length + 1,
        fecha : moment().startOf('month').format('YYYY-MM-DD'),
        cantEntrada : '',
        precioEntrada : '',
        costoEntrada : '',
        cantSalida : '',
        precioSalida : '',
        costoSalida : '',
        cantidadFinal : 0,
        precioFinal : 0,
        costoFinal : 0,
        total : true,
      });
    });
    // Entradas de material
    this.comprasRealizadas.forEach(compra => {
      this.datosKardex.push(
        {
          Id : this.datosKardex.length + 1,
          fecha : compra.fecha.toString().substring(0, 10),
          cantEntrada : compra.cantComprada,
          precioEntrada : compra.precioEstandar,
          costoEntrada : compra.costoEstandarMaterial,
          cantSalida : '',
          precioSalida : '',
          costoSalida : '',
          cantidadFinal : '',
          precioFinal : '',
          costoFinal : '',
          total : false,
          color : 'azul',
        },
        {
          Id : this.datosKardex.length + 2,
          fecha : compra.fecha.toString().substring(0, 10),
          cantEntrada : '',
          precioEntrada : compra.diffPrecio,
          costoEntrada : compra.variacionPrecio,
          cantSalida : '',
          precioSalida : '',
          costoSalida : '',
          cantidadFinal : '',
          precioFinal : '',
          costoFinal : '',
          total : false,
          color : 'verde',
        },
        {
          Id : this.datosKardex.length + 3,
          fecha : compra.fecha.toString().substring(0, 10),
          cantEntrada : '',
          precioEntrada : compra.precioCompra,
          costoEntrada : compra.costoRealMaterial,
          cantSalida : '',
          precioSalida : '',
          costoSalida : '',
          cantidadFinal : '',
          precioFinal : '',
          costoFinal : '',
          total : false,
        }
      );
    });
    // Salidas de material
    this.salidasRealizadas.forEach(salida => {
      this.datosKardex.push({
        Id : this.datosKardex.length + 1,
        fecha : (salida.fecha).toString().substring(0, 10),
        cantEntrada : '',
        precioEntrada : '',
        costoEntrada : '',
        cantSalida : salida.cantidadSalida,
        precioSalida : salida.precioReal,
        costoSalida : salida.costoReal,
        cantidadFinal : '',
        precioFinal : '',
        costoFinal : '',
        total : false,
      });
    });
    this.calcularSalidas();

    // Costos Finales
    setTimeout(() => this.calcularCostosFinales(), 1500);

    setTimeout(() => {
      this.cargando = false;
      this.modalKardex = true;
    }, 2500);
  }

  // Funcion que va a calcular los costos finales de las salidas de material
  calcularSalidas(){
    let fechas : any [] = [];
    let datosSalidas : any [] = [];
    this.salidasRealizadas.forEach((salida) => !fechas.includes(salida.fecha.toString().substring(0, 10)) ? fechas.push(salida.fecha.toString().substring(0, 10)) : null);
    fechas.sort();

    for (let i = 0; i < fechas.length; i++) {
      let salidasFechas = this.salidasRealizadas.filter(x => x.fecha.toString().substring(0, 10) == fechas[i]);
      datosSalidas.push(
        {
          Id : this.datosKardex.length + 1,
          fecha : fechas[i].toString().substring(0, 10),
          cantEntrada : '',
          precioEntrada : '',
          costoEntrada : '',
          cantSalida : salidasFechas.reduce((a,b) => a + b.cantidadTotalEstandar, 0),
          precioSalida : ((salidasFechas.reduce((a,b) => a + b.costoReal, 0)) / (salidasFechas.reduce((a,b) => a + b.cantidadSalida, 0))),
          costoSalida : salidasFechas.reduce((a,b) => a + b.costoEstandar, 0),
          cantidadFinal : '',
          precioFinal : '',
          costoFinal : '',
          total : false,
          color : 'azul',
        },
        {
          Id : this.datosKardex.length + 1,
          fecha : fechas[i].toString().substring(0, 10),
          cantEntrada : '',
          precioEntrada : '',
          costoEntrada : '',
          cantSalida : (salidasFechas.reduce((a,b) => a + b.cantidadTotalEstandar, 0)) - (salidasFechas.reduce((a,b) => a + b.cantidadSalida, 0)),
          precioSalida : '',
          costoSalida : (salidasFechas.reduce((a,b) => a + b.cantidadTotalEstandar, 0)) - (salidasFechas.reduce((a,b) => a + b.cantidadSalida, 0)) * ((salidasFechas.reduce((a,b) => a + b.costoReal, 0)) / (salidasFechas.reduce((a,b) => a + b.cantidadSalida, 0))),
          cantidadFinal : '',
          precioFinal : '',
          costoFinal : '',
          total : false,
          color : 'verde',
        },
        {
          Id : this.datosKardex.length + 1,
          fecha : fechas[i].toString().substring(0, 10),
          cantEntrada : '',
          precioEntrada : '',
          costoEntrada : '',
          cantSalida : salidasFechas.reduce((a,b) => a + b.cantidadSalida, 0),
          precioSalida : '',
          costoSalida : (salidasFechas.reduce((a,b) => a + b.costoReal, 0)) ,
          cantidadFinal : '',
          precioFinal : '',
          costoFinal : '',
          total : false,
        },
      )
    }
    this.datosKardex = [this.datosKardex, datosSalidas].reduce((a,b) => a.concat(b));
  }

  // Funcion que va a calcular los costos finales de un material
  calcularCostosFinales() {
    let datosCostosFinales : any [] = [];
    let fechas : any [] = [];
    let copiaKardex : any [] = [...this.datosKardex];
    copiaKardex.forEach((kardex) => !fechas.includes(kardex.fecha) ? fechas.push(kardex.fecha) : null);
    fechas.sort();

    for (let i = 1; i < fechas.length; i++) {
      let cantFinal : number = 0;
      let costFinal : number = 0;
      let costoFinal = copiaKardex.filter(x => x.cantidadFinal != '' && x.precioFinal != '' && x.fecha == fechas[i - 1]);

      costoFinal.forEach((compra) => {
        cantFinal += parseFloat(compra.cantidadFinal);
        costFinal += parseFloat(compra.costoFinal);
        datosCostosFinales.push({
            Id : this.datosKardex.length + 1,
            fecha : fechas[i],
            cantEntrada : '',
            precioEntrada : '',
            costoEntrada : '',
            cantSalida : '',
            precioSalida : '',
            costoSalida : '',
            cantidadFinal : compra.cantidadFinal,
            precioFinal : compra.precioFinal,
            costoFinal : compra.costoFinal,
            total : false,
        });
      });

      let costosFechas = this.comprasRealizadas.filter(x => x.fecha.toString().substring(0, 10) == fechas[i]);
      costosFechas.forEach((compra) => {
        cantFinal += parseFloat(compra.cantComprada);
        costFinal += parseFloat(compra.costoRealMaterial);
        datosCostosFinales.push({
            Id : this.datosKardex.length + 1,
            fecha : compra.fecha.toString().substring(0, 10),
            cantEntrada : '',
            precioEntrada : '',
            costoEntrada : '',
            cantSalida : '',
            precioSalida : '',
            costoSalida : '',
            cantidadFinal : compra.cantComprada,
            precioFinal : compra.precioCompra,
            costoFinal : compra.costoRealMaterial,
            total : false,
        });
      });

      datosCostosFinales.push({
        Id : this.datosKardex.length + 1,
        fecha : fechas[i],
        cantEntrada : '',
        precioEntrada : '',
        costoEntrada : '',
        cantSalida : '',
        precioSalida : '',
        costoSalida : '',
        cantidadFinal : cantFinal,
        precioFinal : '',
        costoFinal : costFinal,
        total : true,
      });

      copiaKardex = [copiaKardex, datosCostosFinales].reduce((a,b) => a.concat(b));
    }
    this.datosKardex = [this.datosKardex, datosCostosFinales].reduce((a,b) => a.concat(b));
  }
}