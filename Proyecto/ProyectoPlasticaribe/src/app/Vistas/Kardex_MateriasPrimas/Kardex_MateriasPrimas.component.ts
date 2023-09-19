import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import moment from 'moment';
import { Table } from 'primeng/table';
import { Entradas_Salidas_MPService } from 'src/app/Servicios/Entradas_Salidas_MP/Entradas_Salidas_MP.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { Movimientos_Entradas_MPService } from 'src/app/Servicios/Movimientos_Entradas_MP/Movimientos_Entradas_MP.service';
import { AppComponent } from 'src/app/app.component';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';
import { Informe_ConsumosComponent } from '../Informe_Consumos/Informe_Consumos.component';
import { defaultStepOptions, stepsKardex as defaultSteps } from 'src/app/data';
import { ShepherdService } from 'angular-shepherd';

@Component({
  selector: 'app-Kardex_MateriasPrimas',
  templateUrl: './Kardex_MateriasPrimas.component.html',
  styleUrls: ['./Kardex_MateriasPrimas.component.css']
})

export class Kardex_MateriasPrimasComponent implements OnInit {

  @ViewChild('dt_costos') dt_costos: Table | undefined; // Tabla que contendrá la información de la tabla inicialmente
  @ViewChild(Informe_ConsumosComponent) informeConsumos : Informe_ConsumosComponent; // Tabla que contendrá la información de la tabla inicialmente
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
                      private salidasMaterialService : Entradas_Salidas_MPService,
                        private shepherdService : ShepherdService,) {
                    
    this.FormFiltros = this.frmBuilder.group({
      RangoFechas : [],
      material : [],
      NombreMaterial : [],
      Producto : [],
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

  verTutorial(){
    this.shepherdService.defaultStepOptions = defaultStepOptions;
    this.shepherdService.modal = true;
    this.shepherdService.confirmCancel = false;
    this.shepherdService.addSteps(defaultSteps);
    this.shepherdService.start();
  }

  // Funcion que va a obtener los diferentes materiales
  obtenerMateriales = () => this.movEntradasService.GetInventarioMateriales().subscribe(datos => this.materiales = datos);

  // Funcion que va a limpiar el formulario
  limpiarCampos() {
    this.FormFiltros.reset();
    this.cargando = false;
  }

  //Funcion que se usará para aplicar los filtros de la tabla
  aplicarfiltro = ($event, campo : any, valorCampo : string) => this.dt_costos!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

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
      let producto : number = this.FormFiltros.value.Producto;
      let fechaInicio : any = moment(this.FormFiltros.value.RangoFechas[0]).format('YYYY-MM-DD');
      let fechaFin : any = this.FormFiltros.value.RangoFechas[1] == null ? fechaInicio : moment(this.FormFiltros.value.RangoFechas[1]).format('YYYY-MM-DD');
      if (material != null) {
        this.informeConsumos.consultar(fechaInicio, fechaFin, material, this.FormFiltros.value.NombreMaterial, producto);
        this.salidasMaterialService.GetSalidasRealizadas(fechaInicio, fechaFin, material, producto).subscribe(data => this.salidasRealizadas = data);
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
      fecha : compra.fechaCompra.replace('T00:00:00', ''),
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
    if (this.FormFiltros.value.RangoFechas != null) {
      this.cargando = true;
      this.datosKardex = [];
      // Inventario inicial
      this.movEntradasService.GetComprasAntiguas(moment(this.FormFiltros.value.RangoFechas[0]).format('YYYY-MM-DD'), this.FormFiltros.value.material).subscribe(data => {
        let cantFinal = 0, costoFinal = 0;
        let fecha = '';
        data.forEach(compra => {
          fecha = compra.fechaCompra.replace('T00:00:00', '');
          this.datosKardex.push({
            Id : this.datosKardex.length == 0 ? 1 : Math.max(...this.datosKardex.map(x => x.Id)) + 1,
            fecha : fecha,
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
            color : '',
          });
          cantFinal += compra.cantidadCompra;
          costoFinal += compra.costoReal;
        });
        this.datosKardex.push({
          Id : this.datosKardex.length == 0 ? 1 : Math.max(...this.datosKardex.map(x => x.Id)) + 1,
          fecha : fecha,
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
          color : '',
        });
        this.datosKardex.sort((a, b) => a.fecha.localeCompare(b.fecha));
      }, () => {
        this.datosKardex.push({
          Id : this.datosKardex.length == 0 ? 1 : Math.max(...this.datosKardex.map(x => x.Id)) + 1,
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
          color : '',
        });
      });
      // Entradas de material
      this.comprasRealizadas.forEach(compra => {
        this.datosKardex.push(
          {
            Id : this.datosKardex.length == 0 ? 1 : Math.max(...this.datosKardex.map(x => x.Id)) + 1,
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
            Id : this.datosKardex.length == 0 ? 1 : Math.max(...this.datosKardex.map(x => x.Id)) + 2,
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
            Id : this.datosKardex.length == 0 ? 1 : Math.max(...this.datosKardex.map(x => x.Id)) + 3,
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
            color : '',
          }
        );
      });
      // Salidas de material
      this.salidasRealizadas.forEach(salida => {
        this.datosKardex.push({
          Id : this.datosKardex.length == 0 ? 1 : Math.max(...this.datosKardex.map(x => x.Id)) + 1,
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
          color : '',
        });
      });
      this.calcularSalidas();

      // Costos Finales
      setTimeout(() => this.calcularCostosFinales(), 1500);

      setTimeout(() => {
        this.datosKardex.map(x => x.fecha).sort();
        this.cargando = false;
        this.modalKardex = true;
      }, 2500);
    } else this.msg.mensajeAdvertencia(`¡Debe seleccionar un rango de fechas para consultar la información!`);
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
          Id : this.datosKardex.length == 0 ? 1 : Math.max(...this.datosKardex.map(x => x.Id)) + 1,
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
          Id : this.datosKardex.length == 0 ? 1 : Math.max(...this.datosKardex.map(x => x.Id)) + 1,
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
          Id : this.datosKardex.length == 0 ? 1 : Math.max(...this.datosKardex.map(x => x.Id)) + 1,
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
          color : '',
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
      let costoFinal = copiaKardex.filter(x => x.cantidadFinal != '' && x.precioFinal != '' && x.fecha == fechas[i - 1]);
      let salidas : any [] = this.salidasRealizadas.filter(x => x.fecha.toString().substring(0, 10) == fechas[i]);

      // Añade inventario anterior
      costoFinal.forEach((compra) => {
        let cantidadFinal : number = parseFloat(compra.cantidadFinal);
        let precioTotalFinal : number = parseFloat(compra.costoFinal);
        datosCostosFinales.push({
          Id : this.datosKardex.length == 0 ? 1 : Math.max(...this.datosKardex.map(x => x.Id)) + 1,
          fecha : fechas[i],
          cantEntrada : '',
          precioEntrada : '',
          costoEntrada : '',
          cantSalida : '',
          precioSalida : '',
          costoSalida : '',
          cantidadFinal : cantidadFinal,
          precioFinal : compra.precioFinal,
          costoFinal : precioTotalFinal,
          total : false,
          color : '',
        });
      });

      // Añade entradas
      let costosFechas = this.comprasRealizadas.filter(x => x.fecha.toString().substring(0, 10) == fechas[i]);
      costosFechas.forEach((compra) => {
        datosCostosFinales.push({
          Id : this.datosKardex.length == 0 ? 1 : Math.max(...this.datosKardex.map(x => x.Id)) + 1,
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
          color : '',
        });
      });

      // Restar Salidas del inventario final
      for (const salida of salidas) {
        for (let j = 0; j < datosCostosFinales.length; j++) {
          let cantidadSalida : number = parseFloat(salida.cantidadSalida), cantRestante : number = 0;
          if (datosCostosFinales[j].cantidadFinal != '' && datosCostosFinales[j].precioFinal != '' && datosCostosFinales[j].fecha == fechas[i]) {
            cantRestante = parseFloat(datosCostosFinales[j].cantidadFinal) - cantidadSalida;
            if (cantRestante == 0) {
              datosCostosFinales.splice(j, 1);
              break;
            } else if (cantRestante > 0) {
              datosCostosFinales[j].cantidadFinal = cantRestante;
              datosCostosFinales[j].costoFinal = (parseFloat(datosCostosFinales[j].precioFinal) * (parseFloat(datosCostosFinales[j].cantidadFinal)));
              break;
            } else if (cantRestante < 0) {
              let restante : number = cantidadSalida * -1;
              do {
                restante = datosCostosFinales.splice(j, 1)[0].cantidadFinal + restante;
                if ((datosCostosFinales[j].cantidadFinal + restante) > 0) {
                  datosCostosFinales[j].cantidadFinal += restante;
                  datosCostosFinales[j].costoFinal = datosCostosFinales[j].precioFinal * datosCostosFinales[j].cantidadFinal;
                  break;
                } else continue;
              } while (restante < 0);
              break;
            }
          }
        }
      }

      // Calcula costos finales
      let costosFinales = datosCostosFinales.filter(x => x.cantidadFinal != '' && x.precioFinal != '' && x.fecha == fechas[i]);

      datosCostosFinales.push({
        Id : this.datosKardex.length == 0 ? 1 : Math.max(...this.datosKardex.map(x => x.Id)) + 1,
        fecha : fechas[i],
        cantEntrada : '',
        precioEntrada : '',
        costoEntrada : '',
        cantSalida : '',
        precioSalida : '',
        costoSalida : '',
        cantidadFinal : costosFinales.map(x => x.cantidadFinal).reduce((a,b) => a + b, 0),
        precioFinal : '',
        costoFinal : costosFinales.map(x => x.costoFinal).reduce((a,b) => parseFloat(a) + parseFloat(b), 0),
        total : true,
        color : '',
      });

      copiaKardex = [copiaKardex, datosCostosFinales].reduce((a,b) => a.concat(b));
    }
    this.datosKardex = [this.datosKardex, datosCostosFinales].reduce((a,b) => a.concat(b));
  }

  //Funcion que va a crear el archivo de excel
  exportarExcel() {
    this.cargarKardex();
    let titulo : string = `KARDEX PLASTICARIBE`;
    let border : any = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };
    let headerCompras : string [] = ['Fecha', 'QR(kg)',	'PR($/kg)', 'PS($/kg)',	'∆P($/kg)', 'CR($)', 'CS($)', 'VP ($)'];
    let headerSalidas : string [] = ['Inicio', 'Orden',	'QR(kg)', 'QS(kg)', '∆Q(kg)', 'PR($/kg)', 'CR($)', 'CS($)', 'VQ ($)'];
    let workbook = new Workbook();
    const imageId1 = workbook.addImage({ base64:  logoParaPdf, extension: 'png', });

    // HOJA 1, ENTRADAS Y SALIDAS DE MATERIAL
    let worksheet = workbook.addWorksheet(`Costos Detallados`);
    worksheet.addImage(imageId1, {
      tl: { col: 0.1, row: 0.40 },
      ext: { width: 170, height: 45 },
      editAs: 'oneCell'
    });
    let titleRow = worksheet.addRow([titulo]);
    titleRow.font = { name: 'Calibri', family: 4, size: 16, underline: 'double', bold: true };
    
    worksheet.addRow([]);
    worksheet.addRow([]);
    worksheet.addRow([]);
    worksheet.addRow(['COMPRAS']).eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '375623' } }
      cell.font = { name: 'Calibri', family: 4, size: 11, color: { argb: 'F8DE5A' }, bold: true };
      cell.border = border;
    });
    let headerRowCompras = worksheet.addRow(headerCompras);
    headerRowCompras.eachCell((cell) => {
      if (cell.value == 'QR(kg)'){
        cell.value = {
          'richText': [
            {'font': {'bold': true, 'size': 11, 'color': {'argb': 'F8DE5A'}, 'name': 'Calibri',}, 'text': 'Q'},
            {'font': {'bold': true, 'size': 11, 'color': {'argb': 'F8DE5A'}, 'name': 'Calibri', 'vertAlign': 'subscript'}, 'text': 'R'},
            {'font': {'bold': true, 'size': 11, 'color': {'argb': 'F8DE5A'}, 'name': 'Calibri'}, 'text': '(kg)'},
          ]
        }
      } else if (cell.value == 'PR($/kg)'){
        cell.value = {
          'richText': [
            {'font': {'bold': true, 'size': 11, 'color': {'argb': 'F8DE5A'}, 'name': 'Calibri',}, 'text': 'P'},
            {'font': {'bold': true, 'size': 11, 'color': {'argb': 'F8DE5A'}, 'name': 'Calibri', 'vertAlign': 'subscript'}, 'text': 'R'},
            {'font': {'bold': true, 'size': 11, 'color': {'argb': 'F8DE5A'}, 'name': 'Calibri'}, 'text': '($/kg)'},
          ]
        }
      } else if (cell.value == 'PS($/kg)'){
        cell.value = {
          'richText': [
            {'font': {'bold': true, 'size': 11, 'color': {'argb': 'F8DE5A'}, 'name': 'Calibri',}, 'text': 'P'},
            {'font': {'bold': true, 'size': 11, 'color': {'argb': 'F8DE5A'}, 'name': 'Calibri', 'vertAlign': 'subscript'}, 'text': 'S'},
            {'font': {'bold': true, 'size': 11, 'color': {'argb': 'F8DE5A'}, 'name': 'Calibri'}, 'text': '($/kg)'},
          ]
        }
      }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '375623' } };
      cell.font = { name: 'Calibri', family: 4, size: 11, color: { argb: 'F8DE5A' }, bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = border;
    });
    this.llenarTablaCompras().forEach(d => {
      let row = worksheet.addRow(d);
      let celdas = [1, 2, 3, 4, 5, 6, 7, 8];
      celdas.forEach(cell => {
        row.getCell(cell).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'C6E0B4' } };
        row.getCell(cell).border = border;
        if (row.getCell(1).value == 'Totales') row.getCell(cell).font = { name: 'Calibri', family: 4, size: 11, bold: true };
      });
    });

    worksheet.addRow([]);
    worksheet.addRow([]);
    worksheet.addRow(['CONSUMOS']).eachCell((cell) => {
      worksheet.mergeCells(`A${cell.row}`, `I${cell.row}`);
      worksheet.getCell(`A${cell.row}`).alignment = { vertical: 'middle', horizontal: 'center' };
      worksheet.getCell(`A${cell.row}`).border = border;
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '375623' } }
      cell.font = { name: 'Calibri', family: 4, size: 11, color: { argb: 'F8DE5A' }, bold: true };
      cell.border = border;
    });
    let headerRowSalidas = worksheet.addRow(headerSalidas);
    headerRowSalidas.eachCell((cell) => {
      if (cell.value == 'QR(kg)'){
        cell.value = {
          'richText': [
            {'font': {'bold': true, 'size': 11, 'color': {'argb': 'F8DE5A'}, 'name': 'Calibri',}, 'text': 'Q'},
            {'font': {'bold': true, 'size': 11, 'color': {'argb': 'F8DE5A'}, 'name': 'Calibri', 'vertAlign': 'subscript'}, 'text': 'R'},
            {'font': {'bold': true, 'size': 11, 'color': {'argb': 'F8DE5A'}, 'name': 'Calibri'}, 'text': '(kg)'},
          ]
        }
      } else if (cell.value == 'QS(kg)'){
        cell.value = {
          'richText': [
            {'font': {'bold': true, 'size': 11, 'color': {'argb': 'F8DE5A'}, 'name': 'Calibri',}, 'text': 'Q'},
            {'font': {'bold': true, 'size': 11, 'color': {'argb': 'F8DE5A'}, 'name': 'Calibri', 'vertAlign': 'subscript'}, 'text': 'S'},
            {'font': {'bold': true, 'size': 11, 'color': {'argb': 'F8DE5A'}, 'name': 'Calibri'}, 'text': '(kg)'},
          ]
        }
      } else if (cell.value == 'PR($/kg)'){
        cell.value = {
          'richText': [
            {'font': {'bold': true, 'size': 11, 'color': {'argb': 'F8DE5A'}, 'name': 'Calibri',}, 'text': 'P'},
            {'font': {'bold': true, 'size': 11, 'color': {'argb': 'F8DE5A'}, 'name': 'Calibri', 'vertAlign': 'subscript'}, 'text': 'R'},
            {'font': {'bold': true, 'size': 11, 'color': {'argb': 'F8DE5A'}, 'name': 'Calibri'}, 'text': '($/kg)'},
          ]
        }
      }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '375623' } }
      cell.font = { name: 'Calibri', family: 4, size: 11, color: { argb: 'F8DE5A' }, bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = border;
    });
    this.llenarTablaSalidas().forEach(d => {
      let row = worksheet.addRow(d);
      let celdas = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      celdas.forEach(cell => {
        row.getCell(cell).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'C6E0B4' } };
        row.getCell(cell).border = border;
        if (row.getCell(1).value == 'Totales') row.getCell(cell).font = { name: 'Calibri', family: 4, size: 11, bold: true };
      });
    });

    let unirCeldasHoja : string [] = ['A1:I3', 'A5:H5'];
    unirCeldasHoja.forEach(cell => worksheet.mergeCells(cell));

    let centrarCeldas : string [] = ['A1', 'A5'];
    centrarCeldas.forEach(cell =>{
      worksheet.getCell(cell).alignment = { vertical: 'middle', horizontal: 'center' };
      worksheet.getCell(cell).border = border;
    });

    for (let i = 1; i < 10; i++) {
      worksheet.getColumn(i).width = 20;
      if (i > 0 && i != 1) worksheet.getColumn(i + 1).numFmt = '""#,##0.00;[Black]\-""#,##0.00';
      else if (i == 1) worksheet.getColumn(i + 1).numFmt = '""#,##0.00;[Black]\-""#,##0.00';
    }

    // HOJA 2, KARDEX DETALLADO
    let worksheet2 = workbook.addWorksheet(`Kardex`);
    worksheet2.addImage(imageId1, {
      tl: { col: 0.1, row: 0.40 },
      ext: { width: 220, height: 45 },
      editAs: 'oneCell'
    });
    let titleRow2 = worksheet2.addRow([titulo]);
    titleRow2.font = { name: 'Calibri', family: 4, size: 16, underline: 'double', bold: true };
    
    worksheet2.addRow([]);
    worksheet2.addRow([]);

    worksheet2.getCell('A4').value = 'FECHA';
    worksheet2.getCell('B4').value = 'ENTRADAS';
    worksheet2.getCell('E4').value = 'SALIDAS';
    worksheet2.getCell('H4').value = 'SALDOS';
    
    worksheet2.getCell('B5').value = {
      'richText': [
        {'font': {'bold': true, 'size': 11, 'name': 'Calibri',}, 'text': 'Q'},
        {'font': {'bold': true, 'size': 11, 'name': 'Calibri', 'vertAlign': 'subscript'}, 'text': 'R'},
        {'font': {'bold': true, 'size': 11, 'name': 'Calibri'}, 'text': '(kg)'},
      ]
    };
    worksheet2.getCell('C5').value = {
      'richText': [
        {'font': {'bold': true, 'size': 11, 'name': 'Calibri',}, 'text': '(P'},
        {'font': {'bold': true, 'size': 11, 'name': 'Calibri', 'vertAlign': 'subscript'}, 'text': 'R'},
        {'font': {'bold': true, 'size': 11, 'name': 'Calibri'}, 'text': ' = '},
        {'font': {'bold': true, 'size': 11, 'color': {'argb': '69F'}, 'name': 'Calibri'}, 'text': 'P'},
        {'font': {'bold': true, 'size': 11, 'color': {'argb': '69f'}, 'name': 'Calibri', 'vertAlign': 'subscript'}, 'text': 'S'},
        {'font': {'bold': true, 'size': 11, 'name': 'Calibri'}, 'text': ' + '},
        {'font': {'bold': true, 'size': 11, 'color': {'argb': '22C55E'}, 'name': 'Calibri'}, 'text': '∆'},
        {'font': {'bold': true, 'size': 11, 'color': {'argb': '22C55E'}, 'name': 'Calibri'}, 'text': 'P'},
        {'font': {'bold': true, 'size': 11, 'name': 'Calibri'}, 'text': ')($/kg)'},
      ]
    };
    worksheet2.getCell('D5').value = {
      'richText': [
        {'font': {'bold': true, 'size': 11, 'name': 'Calibri',}, 'text': '(CR = '},
        {'font': {'bold': true, 'size': 11, 'color': {'argb': '69F'}, 'name': 'Calibri'}, 'text': 'CS'},
        {'font': {'bold': true, 'size': 11, 'name': 'Calibri'}, 'text': ' + '},
        {'font': {'bold': true, 'size': 11, 'color': {'argb': '22C55E'}, 'name': 'Calibri'}, 'text': 'VP'},
        {'font': {'bold': true, 'size': 11, 'name': 'Calibri',}, 'text': ')($)'},
      ]
    };
    worksheet2.getCell('E5').value = {
      'richText': [
        {'font': {'bold': true, 'size': 11, 'name': 'Calibri',}, 'text': '(Q'},
        {'font': {'bold': true, 'size': 11, 'name': 'Calibri', 'vertAlign': 'subscript'}, 'text': 'R'},
        {'font': {'bold': true, 'size': 11, 'name': 'Calibri'}, 'text': ' = '},
        {'font': {'bold': true, 'size': 11, 'color': {'argb': '69F'}, 'name': 'Calibri'}, 'text': 'Q'},
        {'font': {'bold': true, 'size': 11, 'color': {'argb': '69f'}, 'name': 'Calibri', 'vertAlign': 'subscript'}, 'text': 'S'},
        {'font': {'bold': true, 'size': 11, 'name': 'Calibri'}, 'text': ' + '},
        {'font': {'bold': true, 'size': 11, 'color': {'argb': '22C55E'}, 'name': 'Calibri'}, 'text': '∆Q'},
        {'font': {'bold': true, 'size': 11, 'name': 'Calibri'}, 'text': ')(kg)'},
      ]
    };
    worksheet2.getCell('F5').value = {
      'richText': [
        {'font': {'bold': true, 'size': 11, 'name': 'Calibri',}, 'text': 'P'},
        {'font': {'bold': true, 'size': 11, 'name': 'Calibri', 'vertAlign': 'subscript'}, 'text': 'R'},
        {'font': {'bold': true, 'size': 11, 'name': 'Calibri'}, 'text': '($/kg)'},
      ]
    };
    worksheet2.getCell('G5').value = {
      'richText': [
        {'font': {'bold': true, 'size': 11, 'name': 'Calibri',}, 'text': '(CR = '},
        {'font': {'bold': true, 'size': 11, 'color': {'argb': '69F'}, 'name': 'Calibri'}, 'text': 'CS'},
        {'font': {'bold': true, 'size': 11, 'name': 'Calibri'}, 'text': ' + '},
        {'font': {'bold': true, 'size': 11, 'color': {'argb': '22C55E'}, 'name': 'Calibri'}, 'text': 'VQ'},
        {'font': {'bold': true, 'size': 11, 'name': 'Calibri'}, 'text': ')($)'},
      ]
    };
    worksheet2.getCell('H5').value = {
      'richText': [
        {'font': {'bold': true, 'size': 11, 'name': 'Calibri',}, 'text': 'Q'},
        {'font': {'bold': true, 'size': 11, 'name': 'Calibri', 'vertAlign': 'subscript'}, 'text': 'R'},
        {'font': {'bold': true, 'size': 11, 'name': 'Calibri'}, 'text': '(kg)'},
      ]
    };
    worksheet2.getCell('I5').value = {
      'richText': [
        {'font': {'bold': true, 'size': 11, 'name': 'Calibri',}, 'text': 'P'},
        {'font': {'bold': true, 'size': 11, 'name': 'Calibri', 'vertAlign': 'subscript'}, 'text': 'R'},
        {'font': {'bold': true, 'size': 11, 'name': 'Calibri'}, 'text': '($/kg)'},
      ]
    };
    worksheet2.getCell('J5').value = 'CR($)';
    
    let centrarCeldas2 : string [] = ['A1', 'A4', 'B4', 'B5', 'C5', 'D5', 'E4', 'E5', 'F5', 'G5', 'H4', 'H5', 'I5', 'J5'];
    centrarCeldas2.forEach(cell =>{
      worksheet2.getCell(cell).alignment = { vertical: 'middle', horizontal: 'center' };
      worksheet2.getCell(cell).font = { name: 'Calibri', family: 4, size: 11, bold: true };
      if (cell != 'A1') worksheet2.getCell(cell).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFD1' } };
      worksheet2.getCell(cell).border = border;
    });

    worksheet2.getColumn(1).alignment = { vertical: 'middle', horizontal: 'center' };

    let unirFechas : any = [];
    setTimeout(() => {
      let count : number = 0, fecha : string = '';
      this.llenarTablaKardex().forEach(d => {
        let row = worksheet2.addRow(d);
        let celdas = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        let celdasColores = [3,4,5,7];
        count ++;
        celdasColores.forEach(cell => {
          if (row.getCell(11).value == 'azul') row.getCell(cell).font = { name: 'Calibri', family: 4, size: 11, color: { argb: '69F' }  };
          else if (row.getCell(11).value == 'verde') row.getCell(cell).font = { name: 'Calibri', family: 4, size: 11, color: { argb: '22C55E' }  };
          else if (row.getCell(11).value == '') row.getCell(cell).font = { name: 'Calibri', family: 4, size: 11,  };
        });
        celdas.forEach(cell => {
          row.getCell(cell).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFD1' } };
          if ([1,4,7,10].includes(cell)) row.getCell(cell).border = { right: { style: 'medium' } };

          if (count != this.datosKardex.length) {
            row.getCell(1).border = { right: { style: 'medium' }, bottom: { style: 'medium' }, };
            row.getCell(2).border = { bottom: { style: 'thin' }, right: { style: 'thin' },};
            row.getCell(3).border = { bottom: { style: 'thin' }, right: { style: 'thin' },};
            row.getCell(4).border = { right: { style: 'medium' }, bottom: { style: 'thin' } };
            row.getCell(5).border = { bottom: { style: 'thin' }, right: { style: 'thin' },};
            row.getCell(6).border = { bottom: { style: 'thin' }, right: { style: 'thin' },};
            row.getCell(7).border = { right: { style: 'medium' }, bottom: { style: 'thin' } };
            row.getCell(8).border = { bottom: { style: 'thin' }, right: { style: 'thin' },};
            row.getCell(9).border = { bottom: { style: 'thin' }, right: { style: 'thin' },};
            row.getCell(10).border = { right: { style: 'medium' }, bottom: { style: 'thin' } };
          }

          if (row.getCell(12).value == true) row.getCell(cell).font = { name: 'Calibri', family: 4, size: 11, bold: true };

          if (count == this.datosKardex.length && ([1,4,7,10].includes(cell))) row.getCell(cell).border = { bottom: { style: 'medium' }, right: { style: 'medium' } };
          else if (count == this.datosKardex.length && ([2,3,5,6,8,9].includes(cell))) row.getCell(cell).border = { bottom: { style: 'medium' }, right: { style: 'thin' }, };
        });
        if (fecha != d[0]) {
          unirFechas.push(row.number);
          [1].forEach(cell => row.getCell(cell).border = { top: { style: 'medium' }, right: { style: 'medium' }, bottom: { style: 'medium' }, });
          [2].forEach(cell => row.getCell(cell).border = { top: { style: 'medium' }, bottom: { style: 'thin' }, right: { style: 'thin' },});
          [3].forEach(cell => row.getCell(cell).border = { top: { style: 'medium' }, bottom: { style: 'thin' }, right: { style: 'thin' },});
          [4].forEach(cell => row.getCell(cell).border = { top: { style: 'medium' }, right: { style: 'medium' }, bottom: { style: 'thin' } });
          [5].forEach(cell => row.getCell(cell).border = { top: { style: 'medium' }, bottom: { style: 'thin' }, right: { style: 'thin' },});
          [6].forEach(cell => row.getCell(cell).border = { top: { style: 'medium' }, bottom: { style: 'thin' }, right: { style: 'thin' },});
          [7].forEach(cell => row.getCell(cell).border = { top: { style: 'medium' }, right: { style: 'medium' }, bottom: { style: 'thin' } });
          [8].forEach(cell => row.getCell(cell).border = { top: { style: 'medium' }, bottom: { style: 'thin' }, right: { style: 'thin' },});
          [9].forEach(cell => row.getCell(cell).border = { top: { style: 'medium' }, bottom: { style: 'thin' }, right: { style: 'thin' },});
          [10].forEach(cell => row.getCell(cell).border = { top: { style: 'medium' }, right: { style: 'medium' }, bottom: { style: 'thin' } });
          fecha = d[0];
        }
        row.getCell(11).value = '';
        row.getCell(12).value = '';
      });      
    }, 2600);

    let unirCeldasHoja2 : string [] = ['A1:J3', 'A4:A5', 'B4:D4', 'E4:G4', 'H4:J4'];
    unirCeldasHoja2.forEach(cell => worksheet2.mergeCells(cell));
    for (let i = 1; i < 11; i++) {
      worksheet2.getColumn(i).width = 20;
      worksheet2.getColumn(i).numFmt = '""#,##0.00;\-""#,##0.00';
    }

    setTimeout(() => {
      for (let i = 0; i < unirFechas.length; i++) {
        let celdaFinal : any = unirFechas[i + 1] - 1;
        worksheet2.mergeCells(`A${unirFechas[i]}:A${Number.isNaN(celdaFinal) ? this.datosKardex.length + 5 : celdaFinal}`);
      }

      workbook.xlsx.writeBuffer().then((data) => {
        let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        fs.saveAs(blob, titulo + `.xlsx`);
      });
    }, 3000);
  }

  // Funcion que va a llenar las entradas de un material, esta información es la que se va a colocar en el excel
  llenarTablaCompras() : any [] {
    let compraRealizada : any [] = [];
    this.comprasRealizadas.forEach(compra => {
      compraRealizada.push([
        compra.fecha.toString().substring(0, 10),
        compra.cantComprada,
        compra.precioCompra,
        compra.precioEstandar,
        compra.diffPrecio,
        compra.costoRealMaterial,
        compra.costoEstandarMaterial,
        compra.variacionPrecio,
      ]);
    });
    compraRealizada.push([
      'Totales',
      compraRealizada.reduce((a, b) => a + b[1], 0),
      '',
      '',
      '',
      compraRealizada.reduce((a, b) => a + b[5], 0),
      compraRealizada.reduce((a, b) => a + b[6], 0),
      compraRealizada.reduce((a, b) => a + b[7], 0),
    ]);
    return compraRealizada;
  }

// Funcion que va a llenar las salidas de un material, esta información es la que se va a colocar en el excel
  llenarTablaSalidas() : any [] {
    let salidaRealizada : any [] = [];
    this.salidasRealizadas.forEach(salida => {
      salidaRealizada.push([
        salida.fecha.replace('T00:00:00', ''),
        salida.orden,
        salida.cantidadSalida,
        salida.cantidadTotalEstandar,
        (salida.cantidadSalida) - (salida.cantidadTotalEstandar),
        salida.precioReal,
        salida.costoReal,
        salida.costoEstandar,
        salida.variacionPrecio
      ]);
    });
    salidaRealizada.push([
      'Totales',
      '',
      salidaRealizada.reduce((a, b) => a + b[2], 0),
      salidaRealizada.reduce((a, b) => a + b[3], 0),
      salidaRealizada.reduce((a, b) => a + b[4], 0),
      '',
      salidaRealizada.reduce((a, b) => a + b[6], 0),
      salidaRealizada.reduce((a, b) => a + b[7], 0),
      salidaRealizada.reduce((a, b) => a + b[8], 0),
    ]);
    return salidaRealizada;
  }

  // Funcion que va a llenar los datos de kardex en el archivo excel
  llenarTablaKardex() : any [] {
    let data : any [] = [];
    this.datosKardex.forEach(kardex => {
      data.push([
        kardex.fecha,
        kardex.cantEntrada,
        kardex.precioEntrada,
        kardex.costoEntrada,
        kardex.cantSalida,
        kardex.precioSalida,
        kardex.costoSalida,
        kardex.cantidadFinal,
        kardex.precioFinal,
        kardex.costoFinal,
        kardex.color,
        kardex.total
      ]);
    });
    return data;
  }
}