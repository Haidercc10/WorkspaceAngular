import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShepherdService } from 'angular-shepherd';
import moment from 'moment';
import { CreacionPdfService } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';
import { DetallesOrdenesCompraService } from 'src/app/Servicios/DetallesOrdenCompra/DetallesOrdenesCompra.service';
import { EstadosService } from 'src/app/Servicios/Estados/estados.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { AppComponent } from 'src/app/app.component';
import { defaultStepOptions, stepsMovOrdenCompra as defaultSteps } from 'src/app/data';
import { OcompraComponent } from '../ocompra/ocompra.component';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-reporte_OrdenCompra',
  templateUrl: './reporte_OrdenCompra.component.html',
  styleUrls: ['./reporte_OrdenCompra.component.css']
})
export class Reporte_OrdenCompraComponent implements OnInit {

  public FormConsultarFiltros !: FormGroup;
  cargando : boolean = false; //Variable para validar que salga o no la imagen de carga
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol
  estados : any [] = []; //Variable que almacenará los estados que pueden tener las ordenes de compra de materia prima
  registrosConsultados : any [] = []; //Variable que va a almacenar los diferentes registros consultados
  datosPdf : any [] = []; //variable que va a almacenar la informacion de la orden de compra consultada

  // Editar Orden de Compra
  @ViewChild(OcompraComponent)  EditarOrdenCompra : OcompraComponent;
  mostrarModal : boolean = false; //Variable que va a mostrar o no, el modal para editar ordenes de compra
  numeroOrdenCompra : number = 0; //Variable que va a almcenar el numero de la orden de compra que se desea editar
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro

  constructor(private frmBuilder : FormBuilder,
                private AppComponent : AppComponent,
                  private estadosService : EstadosService,
                    private dtOrdenCompraService : DetallesOrdenesCompraService,
                        private shepherdService: ShepherdService,
                          private msj : MensajesAplicacionService,
                            private creacionPDFService : CreacionPdfService,) {

    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
    this.FormConsultarFiltros = this.frmBuilder.group({
      Documento : [null, Validators.required],
      fechaDoc: [null, Validators.required],
      fechaFinalDoc: [null, Validators.required],
      estadoDoc: [null, Validators.required],
    });
  }

  ngOnInit() {
    this.lecturaStorage();
    this.obtenerEstados();
    setInterval(() => this.modoSeleccionado = this.AppComponent.temaSeleccionado, 1000);
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

  // Funcion que va a consultar y almacenar los estados que pueden tener las ordenes de compra
  obtenerEstados(){
    this.estadosService.srvObtenerListaEstados().subscribe(datos => {
      datos.forEach(estados => {
        if ([11, 5, 3, 12].includes(estados.estado_Id)) this.estados.push(estados);
      });
    });
  }

  // funcion que limpiará todo
  limpiarCampos(){
    this.cargando = false;
    this.FormConsultarFiltros.reset();
    this.datosPdf = [];
    this.registrosConsultados = [];
  }

  // funcion que va a consultar los filtros utilizados para traer ka informacion
  consultarFiltros(){
    this.cargando = true;
    this.registrosConsultados = [];
    let cantDatos : number = 0;
    let fechaMesAnterior : any = moment().subtract(1, 'M').format('YYYY-MM-DD');
    let oc : number = this.FormConsultarFiltros.value.Documento;
    let fechaincial : any = moment(this.FormConsultarFiltros.value.fechaDoc).format('YYYY-MM-DD') == 'Fecha inválida' ? fechaMesAnterior : moment(this.FormConsultarFiltros.value.fechaDoc).format('YYYY-MM-DD');
    let fechaFinal : any = moment(this.FormConsultarFiltros.value.fechaFinalDoc).format('YYYY-MM-DD') == 'Fecha inválida' ? this.today : moment(this.FormConsultarFiltros.value.fechaFinalDoc).format('YYYY-MM-DD');
    let estado : any = this.FormConsultarFiltros.value.estadoDoc;    
    let ruta : string = '';

    if (oc != null) ruta += `orden=${oc}`;
    if (estado != null) ruta.length > 0 ? ruta += `&estado=${estado}` : ruta += `estado=${estado}`;
    if (ruta.length > 0) ruta = `?${ruta}`;

    this.dtOrdenCompraService.GetOrdenesCompras(fechaincial, fechaFinal, ruta).subscribe(datos_orden => {
      datos_orden.forEach(orden => {
        if (!this.registrosConsultados.map(x => x.Oc).includes(orden.consecutivo)) this.llenarTabla(orden);
        cantDatos++;
        cantDatos == datos_orden.length ? this.cargando = false : null;
      });
    }, () => {
      this.msj.mensajeError(`Error`, `¡No se pudo encontrar información con los filtros consultados!`);
      this.cargando = false;
    });
  }

  // Funcion que servirá para llenar la tabla que se verá que está en la vista con la informacion que devuelve la consulta
  llenarTabla(data : any){
    let info : any = {
      Oc : data.consecutivo,
      Fecha : data.fecha.replace('T00:00:00', ''),
      Estado : data.estado,
      Usuario : data.usuario,
    }
    this.registrosConsultados.push(info);
    this.registrosConsultados.sort((a,b) => Number(a.Oc) - Number(b.Oc));
  }

  // Funcion que limpiará los filtros utilizados en la tabla
  clear = (table: Table) => table.clear();

  //Buscar informacion de la orden de compra creada
  buscarinfoOrdenCompra(orden : number){
    this.datosPdf = [];
    this.cargando = true;
    setTimeout(() => {
      this.dtOrdenCompraService.GetOrdenCompra(orden).subscribe(datos_orden => {
        for (let i = 0; i < datos_orden.length; i++) {
          let info : any = {
            Id : 0,
            Id_Mp: datos_orden[i].mP_Id,
            Id_Tinta: datos_orden[i].tinta_Id,
            Id_Bopp: datos_orden[i].bopp_Id,
            Nombre : '',
            Cantidad : this.formatonumeros(datos_orden[i].cantidad),
            Medida : datos_orden[i].unidad_Medida,
            Precio : `$${this.formatonumeros(datos_orden[i].precio_Unitario)}`,
            SubTotal : `$${this.formatonumeros(datos_orden[i].cantidad * datos_orden[i].precio_Unitario)}`,
          }
          if (info.Id_Mp != 84) {
            info.Id = info.Id_Mp;
            info.Nombre = datos_orden[i].mp;
          } else if (info.Id_Tinta != 2001) {
            info.Id = info.Id_Tinta;
            info.Nombre = datos_orden[i].tinta;
          } else if (info.Id_Bopp != 1) {
            info.Id = info.Id_Bopp;
            info.Nombre = datos_orden[i].bopp;
          }
          this.datosPdf.push(info);
          this.datosPdf.sort((a,b) => a.Nombre.localeCompare(b.Nombre));
        }
        this.crearPDF(orden);
      }, () => this.msj.mensajeError(`Error`, `¡No se pudo obtener información de la última orden de compra creada!`));
    }, 100);
  }

  crearPDF(oc : number){
    this.dtOrdenCompraService.GetOrdenCompra(oc).subscribe(datos_orden => {
      for (let i = 0; i < datos_orden.length; i++) {
        let titulo : string = `Orden de Compra N° ${datos_orden[i].consecutivo}`;
        let content : any [] = this.contenidoPDF(datos_orden[i]);
        this.creacionPDFService.formatoPDF(titulo, content);
        setTimeout(() => this.cargando = false, 3000);
        break;
      }
    }, () => this.msj.mensajeError(`Error`, `¡No se pudo obtener información de la orden de compra N° ${oc}!`));
  }

  contenidoPDF(datos_orden){
    let data : any [] = [];
    data.push(this.informacionProveedorPDF());
    data.push(this.datosProveedorPDF(datos_orden));
    data.push(this.informacionMateriaPrimaPDF());
    data.push(this.datosMateriasPrimasPDF());
    data.push(this.totalesPDF(datos_orden));
    data.push(this.observacionPDF(datos_orden));
    return data;
  }

  informacionProveedorPDF(){
    return {
      text: `\n Información detallada del Proveedor \n \n`,
      alignment: 'center',
      fontSize: 10,
      bold: true
    };
  }

  datosProveedorPDF(datos_orden){
    return {
      table: {
        widths: ['50%', '20%', '30%'],
        body: [
          [
            {text: `Nombre: ${datos_orden.proveedor}`},
            {text: `ID: ${datos_orden.proveedor_Id}`},
            {text: `Tipo de ID: ${datos_orden.tipo_Id}`},
          ],
          [
            {text: `Telefono: ${datos_orden.telefono_Proveedor}`},
            {text: `Ciudad: ${datos_orden.ciudad_Proveedor}`},
            {text: `Tipo de Proveedor: ${datos_orden.tipo_Proveedor}`}
          ],
          [
            {text:`E-mail: ${datos_orden.correo_Proveedor}`},
            {},
            {}
          ]
        ]
      },
      layout: 'lightHorizontalLines',
      fontSize: 9,
    }
  }

  informacionMateriaPrimaPDF(){
    return {
      text: `\n\n Información detallada de la(s) Materia(s) Prima(s) \n `,
      alignment: 'center',
      style: 'header'
    }
  }

  datosMateriasPrimasPDF(){
    return this.table(this.datosPdf, ['Id', 'Nombre', 'Cantidad', 'Medida', 'Precio', 'SubTotal'])
  }

  // Funcion que genera la tabla donde se mostrará la información de los productos pedidos
  table(data, columns) {
    return {
      table: {
        headerRows: 1,
        widths: ['10%', '45%', '10%', '8%', '12%', '15%'],
        body: this.buildTableBody(data, columns),
      },
      fontSize: 8,
      layout: {
        fillColor: function (rowIndex) {
          return (rowIndex == 0) ? '#CCCCCC' : null;
        }
      }
    };
  }

  // funcion que se encagará de llenar la tabla de los productos en el pdf
  buildTableBody(data : any, columns : any) {
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

  calcularConceptosAutomaticosPDF(data : any): any {
    let baseGlobal: number = data.base;
    let base: boolean = data.valor_Total >= baseGlobal;
    let iva : number = ((data.valor_Total * data.iva) / 100);
    let baseIVA: boolean = iva >= baseGlobal;
    let reteFuente: number = base ? (data.valor_Total * data.reteFuente) / 100 : 0;
    let reteIVA: number = baseIVA ? (((data.valor_Total * data.iva) / 100) * data.reteIva) / 100 : 0;
    let reteICA: number = base ? (data.valor_Total * data.reteIca) / 100 : 0;
    return {
      ReteFuente: reteFuente,
      ReteIVA: reteIVA,
      ReteICA: reteICA,
      ValorFinal: data.valor_Total + reteFuente + reteIVA + reteICA + iva,
    }
  }

  totalesPDF(datos_orden) {
    let conceptosAutomaticos = this.calcularConceptosAutomaticosPDF(datos_orden);
    return {
      table: {
        widths: ['45%', '10%', '10%', '8%', '12%', '15%'],
        style: 'header',
        body: [
          [
            '',
            { border: [true, false, true, true], text: `Peso Total` },
            { border: [false, false, true, true], text: `${this.formatonumeros((datos_orden.peso_Total).toFixed(2))}`, alignment: 'right'},
            '',
            { border: [true, false, true, true], text: `Subtotal` },
            { border: [false, false, true, true], text: `$${this.formatonumeros((datos_orden.valor_Total).toFixed(2))}`, alignment: 'right'},
          ],
          [
            '',
            '',
            '',
            '',
            { border: [true, false, true, true], text: `IVA ${datos_orden.iva}%` },
            { border: [false, false, true, true], text: `$${this.formatonumeros(((datos_orden.valor_Total * datos_orden.iva) / 100).toFixed(2))}`, alignment: 'right'},
          ],
          [
            '',
            '',
            '',
            '',
            { border: [true, false, true, true], text: `RTE Fuente ${datos_orden.reteFuente}%` },
            { border: [false, false, true, true], text: `$${this.formatonumeros((conceptosAutomaticos.ReteFuente).toFixed(2))}`, alignment: 'right'},
          ],
          [
            '',
            '',
            '',
            '',
            { border: [true, false, true, true], text: `RTE IVA ${datos_orden.reteIva}%` },
            { border: [false, false, true, true], text: `$${this.formatonumeros((conceptosAutomaticos.ReteIVA).toFixed(2))}`, alignment: 'right'},
          ],
          [
            '',
            '',
            '',
            '',
            { border: [true, false, true, true], text: `RTE ICA ${datos_orden.reteIca}%` },
            { border: [false, false, true, true], text: `$${this.formatonumeros((conceptosAutomaticos.ReteICA).toFixed(2))}`, alignment: 'right'},
          ],
          [
            '',
            '',
            '',
            '',
            { border: [true, false, true, true], text: `Valor Total` },
            { border: [false, false, true, true], text: `$${this.formatonumeros((conceptosAutomaticos.ValorFinal).toFixed(2))}`, alignment: 'right'},
          ],
        ]
      },
      layout: { defaultBorder: false, },
      fontSize: 8,
    }
  }

  observacionPDF(datos_orden){
    return {
      margin: [0, 20],
      table: {
        widths: ['*'],
        body: [
          [{ border: [true, true, true, false], text: `Observación: `, style: 'subtitulo' }],
          [{ border: [true, false, true, true], text: `${datos_orden.observacion.toString().trim()}` }]
        ]
      },
      fontSize: 9,
    }
  }

  // Funcion que abrirá y llenará el modal con la informacion de la orden de compra
  llenarModal(numeroOrden : number){
    if (this.ValidarRol == 1 || this.ValidarRol == 6) {
      this.mostrarModal = true;
      this.numeroOrdenCompra = numeroOrden;
      this.EditarOrdenCompra.edicionOrdenCompra = true;
      this.EditarOrdenCompra.FormOrdenCompra.reset();
      this.EditarOrdenCompra.FormMateriaPrima.reset();
      this.EditarOrdenCompra.FormMateriaPrima.patchValue({ iva : 19 });
      this.EditarOrdenCompra.materiasPrimasSeleccionadas = [];
      this.EditarOrdenCompra.consecutivoOrdenCompra = 0;
      this.EditarOrdenCompra.informacionPDF = [];
      this.dtOrdenCompraService.GetOrdenCompra(numeroOrden).subscribe(datos_orden => {
        for (let i = 0; i < datos_orden.length; i++) {
          this.EditarOrdenCompra.FormOrdenCompra.patchValue({
            ConsecutivoOrden : numeroOrden,
            Proveedor : datos_orden[i].proveedor,
            Id_Proveedor : datos_orden[i].proveedor_Id,
            Observacion : datos_orden[i].observacion,
            ReteIVA: datos_orden[i].reteIva,
            ReteICA: datos_orden[i].reteIca,
            ReteFuente: datos_orden[i].reteFuente,
            Base: datos_orden[i].base,
          });
          break;
        }
        for (let i = 0; i < datos_orden.length; i++) {
          let info : any = {
            Id : 0,
            Id_Mp: datos_orden[i].mP_Id,
            Id_Tinta: datos_orden[i].tinta_Id,
            Id_Bopp: datos_orden[i].bopp_Id,
            Nombre : '',
            Cantidad : datos_orden[i].cantidad,
            Und_Medida : datos_orden[i].unidad_Medida,
            Precio : datos_orden[i].precio_Unitario,
            SubTotal : (datos_orden[i].cantidad * datos_orden[i].precio_Unitario),
          };
          if (info.Id_Mp != 84) {
            info.Id = info.Id_Mp;
            info.Nombre = datos_orden[i].mp;
          } else if (info.Id_Tinta != 2001) {
            info.Id = info.Id_Tinta;
            info.Nombre = datos_orden[i].tinta;
          } else if (info.Id_Bopp != 1) {
            info.Id = info.Id_Bopp;
            info.Nombre = datos_orden[i].bopp;
          }
          this.EditarOrdenCompra.materiasPrimasSeleccionadas.push(info);
        }
      }, () => this.msj.mensajeError(`Error`, `¡No se pudo obtener información de la orden de compra N° ${numeroOrden}!`));
    }
  }

   /** Función que mostrará un tutorial describiendo paso a paso cada funcionalidad de la aplicación */
   verTutorial() {
    this.shepherdService.defaultStepOptions = defaultStepOptions;
    this.shepherdService.modal = true;
    this.shepherdService.confirmCancel = false;
    this.shepherdService.addSteps(defaultSteps);
    this.shepherdService.start();
  }
}
