import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ShepherdService } from 'angular-shepherd';
import moment from 'moment';
import pdfMake from 'pdfmake/build/pdfmake';
import { Table } from 'primeng/table';
import { AppComponent } from 'src/app/app.component';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';
import { DesperdicioService } from 'src/app/Servicios/Desperdicio/desperdicio.service';
import { MaterialProductoService } from 'src/app/Servicios/MaterialProducto/materialProducto.service';
import { ProductoService } from 'src/app/Servicios/Productos/producto.service';
import { defaultStepOptions, stepsReporteDesperdicio as defaultSteps } from 'src/app/data';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';

@Component({
  selector: 'app-Reporte_Desperdicios',
  templateUrl: './Reporte_Desperdicios.component.html',
  styleUrls: ['./Reporte_Desperdicios.component.css']
})

export class Reporte_DesperdiciosComponent implements OnInit {

  @ViewChild('dt') dt: Table | undefined;
  @ViewChild('dt2') dt2: Table | undefined;
  formFiltros !: FormGroup; /** Formulario de filtros */
  load: boolean = true; /** Variable que realizará la carga al momento de consultar */
  arrayMateriales = []; /** array que contendrá los materiales de materia prima*/
  arrayProductos = []; /** array que cargará los productos con la consulta de tipo LIKE*/
  idProducto: any = 0; /** ID de producto que se cargará en el campo ITEM, pero se mostrará el nombre. */
  arrayConsulta : any =[]; /** Array que cargará la consulta inicial */
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  arrayModal : any = []; /** Array que se cargará en la tabla del modal con la info de la OT Seleccionada */
  dialog : boolean = false; /** Variable que mostrará o no, el modal */
  totalDesperdicio : number = 0; /** Variable que contendrá la cantidad total de desperdicio por OT. */
  otSeleccionada : number = 0; /** Variable que contendrá la OT Seleccionada en la tabla */
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  arrayDatosAgrupadosPdf : any = [];
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro

  constructor(private formBuilder : FormBuilder,
                private servicioMateriales : MaterialProductoService,
                  private servicioProductos : ProductoService,
                    private servicioDesperdicios : DesperdicioService,
                      private AppComponent : AppComponent,
                          private shepherdService: ShepherdService,
                            private msj : MensajesAplicacionService) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
    this.formFiltros = this.formBuilder.group({
      OT : [null],
      Producto : [null],
      productoId : [null],
      fechaInicio : [null],
      fechaFinal : [null],
      Material : [null],
    });
  }

  /** Función que inicializará otras funciones al momento de cargar este componente. */
  ngOnInit() {
    this.cargarMateriales();
    this.lecturaStorage();
    setInterval(() => this.modoSeleccionado = this.AppComponent.temaSeleccionado, 1000);
  }

  // Funcion que va a hacer que se inicie el tutorial in-app
  tutorial(){
    this.shepherdService.defaultStepOptions = defaultStepOptions;
    this.shepherdService.modal = true;
    this.shepherdService.confirmCancel = false;
    this.shepherdService.addSteps(defaultSteps);
    this.shepherdService.start();
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = '$1,';
    return number.toString().replace(exp,rep);
  }

  /** Función que cargará los materiales en el combobox.*/
  cargarMateriales(){
    this.servicioMateriales.srvObtenerLista().subscribe(dataMateriales => {
      for (let index = 0; index < dataMateriales.length; index++) {
        if(dataMateriales[index].material_Id != 1) this.arrayMateriales.push(dataMateriales[index])
      }
    });
  }

  /** Función que cargará los productos con una consulta de tipo LIKE */
  likeCargarProductos(){
    this.arrayProductos = [];
    let producto : any = this.formFiltros.value.Producto;

    if(producto != null) this.servicioProductos.obtenerItemsLike(producto).subscribe(dataProducto => { this.arrayProductos = dataProducto; });
  }

  /** Función que cargará el ID del producto en el campo, pero mostrará el nombre */
  seleccionarProducto() {
    let expresion : any = /^[0-9]*(\.?)[ 0-9]+$/;
    this.idProducto = this.formFiltros.value.Producto;

    if(this.idProducto.match(expresion) != null) {
      let nuevo: any[] = this.arrayProductos.filter((item) => item.prod_Id == this.idProducto);
      this.formFiltros.patchValue({
        productoId : nuevo[0].prod_Id,
        Producto: nuevo[0].prod_Nombre,
      });
    } else this.msj.mensajeAdvertencia(`Advertencia`, 'Debe cargar un Item válido.');
  }

  /** Función que consultará según los campos de busqueda diferentes de vacio. */
  Consultar() {
    this.load = false;
    let OT : any = this.formFiltros.value.OT;
    let fecha1 : any = moment(this.formFiltros.value.fechaInicio).format('YYYY-MM-DD');
    let fecha2 : any = moment(this.formFiltros.value.fechaFinal).format('YYYY-MM-DD');
    let material : any = this.formFiltros.value.Material;
    let item : any = this.formFiltros.value.productoId;
    this.arrayConsulta = [];
    let ruta : string = '';

    if (fecha1 == 'Fecha inválida') fecha1 = null;
    if (fecha2 == 'Fecha inválida') fecha2 = null;
    if (fecha1 == null) fecha1 = this.today;
    if (fecha2 == null) fecha2 = fecha1;

    if (OT != null && material != null && item != null) ruta = `?OT=${OT}&material=${material}&item=${item}`;
    else if (OT != null && material != null) ruta = `?OT=${OT}&material=${material}`;
    else if (OT != null && item != null) ruta = `?OT=${OT}&item=${item}`;
    else if (material != null && item != null) ruta = `?material=${material}&item=${item}`;
    else if (OT != null) ruta = `?OT=${OT}`;
    else if (item != null) ruta = `?item=${item}`;
    else if (material != null) ruta = `?material=${material}`;
    else ruta = ``;

    setTimeout(() => {
      this.servicioDesperdicios.getDesperdicio(fecha1, fecha2, ruta).subscribe(dataDesperdicios => {
        if (dataDesperdicios.length == 0) this.msj.mensajeAdvertencia(`Advertencia`, `No se encontraron resultados de búsqueda con los filtros consultados!`);
        else {
          for (let index = 0; index < dataDesperdicios.length; index++) {
            this.llenarTabla(dataDesperdicios[index]);
          }
        }
      });
    }, 900);
    setTimeout(() => {  this.load = true; }, 1000);
  }

  /** Llenar la tabla inicial de resultados de busqueda */
  llenarTabla(datos : any) {
    const registro : any = {
      OT : datos.ot,
      Item : datos.item,
      NombreItem : datos.nombreItem,
      NombreMaterial : datos.material,
      Impreso : datos.impreso,
      PesoTotal : datos.pesoTotal,
      Presentacion : 'Kg'
    }
    this.arrayConsulta.push(registro);
  }

  /** Función para que al momento de seleccionar una OT de la tabla se cargue el modal. */
  consultarOTenTabla(item : any){
    this.arrayModal = [];
    this.otSeleccionada = item.OT;
    this.load = false;
    this.servicioDesperdicios.getDesperdicioxOT(item.OT).subscribe(dataDesperdicios => {
      for (let index = 0; index < dataDesperdicios.length; index++) {
        this.llenarModal(dataDesperdicios[index]);
      }
      this.pesoTotalDesperdicio();
    });

    setTimeout(() => { this.load = true }, 500);
    setTimeout(() => { this.grupoDatosPdf(); }, 1000);
  }

  /** Función para llenar la tabla de modal. */
  llenarModal(datos : any){
    this.dialog = true;
    this.otSeleccionada = datos.desp_OT;

    const dataCompleta : any = {
      OT : datos.desp_OT,
      Item : datos.prod_Id,
      NombreItem : datos.prod_Nombre,
      Peso : datos.desp_PesoKg,
      Cantidad : this.formatonumeros(datos.desp_PesoKg),
      Und : 'Kg',
      Proceso : datos.proceso_Nombre,
      Material : datos.material_Nombre,
      "No_Conformidad" : datos.falla_Nombre,
      Impreso : datos.desp_Impresion,
      Maquina : datos.actv_Serial,
      Operario : datos.usua_Nombre,
      Fecha : datos.desp_Fecha.replace('T00:00:00', ''),
    }
    this.arrayModal.push(dataCompleta);
  }

  /** Función para limpiar filtros de busqueda */
  limpiarCampos(){
    this.formFiltros.reset();
  }

  /** Función que calcula la cantidad total del desperdicio */
  pesoTotalDesperdicio(){
    setTimeout(() => {
      this.totalDesperdicio = 0;
      if(this.dt2.filteredValue != null) {
        for (let indx = 0; indx < this.dt2.filteredValue.length; indx++) {
          this.totalDesperdicio += this.dt2.filteredValue[indx].Peso;
        }
      } else {
      for (let index = 0; index < this.arrayModal.length; index++) {
            this.totalDesperdicio += this.arrayModal[index].Peso;
          }
    }
    }, 500);
  }

  /** Función que exportará el reporte en PDF */
  exportarPDF(){
    let nombre : string = this.storage_Nombre;
    this.servicioDesperdicios.getDesperdicioxOT(this.otSeleccionada).subscribe(dataDesp => {
      for (let index = 0; index < dataDesp.length; index++) {
        const infoPdf : any = {
          info: {
            title: `Reporte de desperdicios ${this.today}`
          },
          pageSize: {
            width: 630,
            height: 760
          },
          footer: function(currentPage : any, pageCount : any) {
            return [
              '\n',
              {
                columns: [
                  { text: `Reporte generado por ${nombre}`, alignment: ' left', fontSize: 8, margin: [30, 0, 0, 0] },
                  { text: `Fecha Expedición Documento ${moment().format('YYYY-MM-DD')} - ${moment().format('H:mm:ss')}`, alignment: 'right', fontSize: 8 },
                  { text: `${currentPage.toString() + ' de ' + pageCount}`, alignment: 'right', fontSize: 8, margin: [0, 0, 30, 0] },
                ]
              }
            ]
          },
          watermark: { text: 'PLASTICARIBE SAS', color: 'red', opacity: 0.05, bold: true, italics: false },
          content : [
            {
              columns: [
                {
                  image : logoParaPdf,
                  width : 220,
                  height : 50
                },
                {
                  text: `Reporte Merma de Material - OT ${this.otSeleccionada}`,
                  alignment: 'right',
                  style: 'titulo',
                  margin: [0, 30, 0, 0],
                }
              ]
            },
            '\n \n',
            {
              style: 'tablaEmpresa',
              table: {
                widths: [90, 167, 90, 166],
                style: 'header',
                body: [
                  [
                    {
                      border: [false, false, false, false],
                      text: `Nombre Empresa`
                    },
                    {
                      border: [false, false, false, true],
                      text: `${dataDesp[index].empresa_Nombre}`
                    },
                    {
                      border: [false, false, false, false],
                      text: `Ciudad`
                    },
                    {
                      border: [false, false, false, true],
                      text: `${dataDesp[index].empresa_Ciudad}`
                    },
                  ],
                  [
                    {
                      border: [false, false, false, false],
                      text: `NIT`
                    },
                    {
                      border: [false, false, false, true],
                      text: `${dataDesp[index].empresa_Id}`
                    },
                    {
                      border: [false, false, false, false],
                      text: `Dirección`
                    },
                    {
                      border: [false, false, false, true],
                      text: `${dataDesp[index].empresa_Direccion}`
                    },
                  ],
                ]
              },
              layout: {
                defaultBorder: false,
              },
              fontSize: 9,
            },
            '\n \n',
            {
              text: `Información consolidada de desperdicios\n `,
              alignment: 'center',
              style: 'subtitulo'
            },
            this.table2(this.arrayDatosAgrupadosPdf, ['OT', 'Item', 'Nombre', 'Proceso', 'No Conformidades', 'Cantidad', 'Presentacion']),
            '\n',
            {
              text: `Cantidad total: ${this.formatonumeros(this.totalDesperdicio)} Kg\n `,
              alignment: 'right',
              style: 'header'
            },
            {
              text: `Información detallada de desperdicios\n `,
              alignment: 'center',
              style: 'subtitulo'
            },
            this.table(this.arrayModal, ['OT', 'Maquina', 'Item', 'Material', 'Operario', 'No_Conformidad', 'Cantidad', 'Und', 'Impreso', 'Proceso', 'Fecha', ]),
            '\n',
            {
              text: `Cantidad total: ${this.formatonumeros(this.totalDesperdicio)} Kg\n `,
              alignment: 'right',
              style: 'header'
            },
          ],
          styles: {
            header: {
              fontSize: 10,
              bold: true
            },
            texto: {
              fontSize: 9,
            },
            titulo: {
              fontSize: 20,
              bold: true
            },
            subtitulo: {
              fontSize: 14,
              bold: true
            }

          }

         }
         const pdf = pdfMake.createPdf(infoPdf);
         pdf.open();
         this.load = true;
         this.msj.mensajeConfirmacion(`Confirmación`,`PDF generado con éxito!`);
         break;
      }
    });
  }

  // Funcion que se encagará de llenar la tabla del pd
  buildTableBody(data, columns) {
    var body = [];
    body.push(columns);
    data.forEach(function(row) {
      var dataRow = [];
      columns.forEach(function(column) {
        dataRow.push(row[column].toString());
      });
      body.push(dataRow);
    });

    return body;
  }

  // Funcion que genera la tabla donde se mostrará la información
  table(data, columns) {
    return {
      table: {
        headerRows: 1,
        widths: [30, 32, 30, 30, 80, 80, 35, 15, 35, 40, 45],
        body: this.buildTableBody(data, columns)
      },
      fontSize: 8,
      layout: {
        fillColor: function (rowIndex, node, columnIndex) {
          return (rowIndex == 0) ? '#CCCCCC' : null;
        }
      }
    };
  }

  // Funcion que genera la tabla donde se mostrará la información
  table2(data, columns) {
    return {
      table: {
        headerRows: 1,
        widths: [40, 40, 160, 50, 70, 50, 75],
        body: this.buildTableBody(data, columns)
      },
      fontSize: 8,
      layout: {
        fillColor: function (rowIndex, node, columnIndex) {
          return (rowIndex == 0) ? '#CCCCCC' : null;
        }
      }
    };
  }

  // Funcion que permitirá filtrar la información de la tabla
  aplicarfiltro($event, campo : any, valorCampo : string){
    this.dt!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);
  }

  // Funcion que permitirá filtrar la información de la tabla
  aplicarfiltro2($event, campo : any, valorCampo : string){
    this.dt2!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);
    this.pesoTotalDesperdicio();
  }

  //Agrupar valores en PDF.
  grupoDatosPdf(){
    let arrayGrupoProcesos : any = [];
    this.arrayDatosAgrupadosPdf = [];

    for (let index = 0; index < this.arrayModal.length; index++) {
      if(!arrayGrupoProcesos.includes(this.arrayModal[index].Proceso)) {
        let cantidadKg : number = 0;
        let cantidadDesperdicios : number = 0;
        for (let grp = 0; grp < this.arrayModal.length; grp++) {
          if(this.arrayModal[grp].Proceso == this.arrayModal[index].Proceso) {
            cantidadKg += this.arrayModal[grp].Peso;
            cantidadDesperdicios += 1;
          }
        }
        arrayGrupoProcesos.push(this.arrayModal[index].Proceso);
        this.datosAgrupadosPdf(this.arrayModal[index], cantidadKg, cantidadDesperdicios);
      }
    }
  }

  datosAgrupadosPdf(datos : any, cantidadProceso : number, cantDesperdicios : number) {
    const info : any = {
      OT : datos.OT,
      Item : datos.Item,
      Nombre : datos.NombreItem,
      Proceso : datos.Proceso,
      Cantidad : this.formatonumeros(cantidadProceso),
      Cantidad2 : cantidadProceso,
      Presentacion : 'Kg',
      "No Conformidades" : cantDesperdicios
    }
    this.arrayDatosAgrupadosPdf.push(info);
  }
}

