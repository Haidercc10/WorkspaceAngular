import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShepherdService } from 'angular-shepherd';
import moment from 'moment';
import { Table } from 'primeng/table';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { CreacionPdfService } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';
import { DetallesAsignacionService } from 'src/app/Servicios/DetallesAsgMateriaPrima/detallesAsignacion.service';
import { MateriaPrimaService } from 'src/app/Servicios/MateriaPrima/materiaPrima.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { AppComponent } from 'src/app/app.component';
import { defaultStepOptions, stepsMovimientosBopp as defaultSteps } from 'src/app/data';

@Component({
  selector: 'app-movimientoMP',
  templateUrl: './movimientoMP.component.html',
  styleUrls: ['./movimientoMP.component.css']
})

export class MovimientoMPComponent implements OnInit {

  @ViewChild('dt1') dt1: Table | undefined;
  @ViewChild('dt2') dt2: Table | undefined;
  @ViewChild('dt3') dt3: Table | undefined;
  cargando : boolean = false;
  formMovimientos !: FormGroup;
  tiposMovimientos : any [] = [];
  materiasPrimas : any [] = [];
  today : any = moment().format('YYYY-MM-DD');
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  movimientosPolietilenos : any [] = []; //Variable que va a contener la informacion de los movimientos de los polietilenos
  movimientosTintas : any [] = []; //Variable que va a contener la información de los movomientos de las tintas
  movimientosBiorientados : any [] = []; //Variable que va a contener la informacion de los movimientos de los biorientados
  datosPdf : any [] = []; //Variable en la que se almacenará la información que se verá en el pdf
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  cantRestante : number = 0;
  cantAsignada : number = 0;

  constructor(private frmBuilder : FormBuilder,
                private AppComponent : AppComponent,
                  private materiaPrimaService : MateriaPrimaService,
                    private detallesAsignacionService : DetallesAsignacionService,
                      private bagProServices : BagproService,
                        private shepherdService: ShepherdService,
                          private mensajeService : MensajesAplicacionService,
                            private creacionPDFService : CreacionPdfService,) {

    this.formMovimientos = this.frmBuilder.group({
      Codigo : [null, Validators.required],
      FechaInicial : [null, Validators.required],
      FechaFinal : [null, Validators.required],
      TipoMovimiento : [null, Validators.required],
      MateriasPrimas_Id : [null, Validators.required],
      MateriasPrimas : [null, Validators.required],
    });

    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
  }

  ngOnInit(): void {
    this.obtenerTipoDocumento();
    this.obtenerMateriasPrimas();
    setInterval(() => this.modoSeleccionado = this.AppComponent.temaSeleccionado, 1000);
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

  //Funcion para obtener los diferentes tipos de documentos que podemos encontrar
  obtenerTipoDocumento(){
    this.tiposMovimientos = [
      { Id: 'ASIGBOPA', Nombre: 'Asignación BOPA' },
      { Id: 'ASIGBOPP', Nombre: 'Asignación BOPP' },
      { Id: 'ASIGMP', Nombre: 'Asignación MP' },
      { Id: 'ASIGPOLY', Nombre: 'Asignación Poliester' },
      { Id: 'ASIGTINTAS', Nombre: 'Asignación de Tintas' },
      { Id: 'CRTINTAS', Nombre: 'Creación de Tintas' },
      { Id: 'DEVMP', Nombre: 'Devolución MP' },
      { Id: 'FCO', Nombre: 'Factura de Compra' },
      { Id: 'REM', Nombre: 'Remisión' },
      { Id: 'ENTBIO', Nombre: 'Entrada de Biorientado'},
    ];
    this.tiposMovimientos.sort((a,b) => a.Nombre.localeCompare(b.Nombre));
  }

  // Funcion que va a obtener la información de las materias primas
  obtenerMateriasPrimas = () => this.materiaPrimaService.GetInventarioMateriasPrimas().subscribe(datos => this.materiasPrimas = datos);

  // Funcion que va a limpiar el formulario
  limpiarCampos = () => this.formMovimientos.reset();

  // Funcion que le va a colocar el nombre a la materia prima seleccionada
  cambiarNombreMateriaPrima(){
    let id : number = this.formMovimientos.value.MateriasPrimas;
    let nuevo : any = this.materiasPrimas.filter((item) => item.id_Materia_Prima == id);
    this.formMovimientos.patchValue({
      MateriasPrimas_Id : id,
      MateriasPrimas : nuevo[0].nombre_Materia_Prima,
    });
  }

  // Funcion que va a consultar la información de los movimientos
  consultarMovimientos(){
    this.cantRestante = 0;
    this.cantAsignada = 0;
    this.movimientosPolietilenos = [];
    this.movimientosTintas = [];
    this.movimientosBiorientados = [];
    let fechaMesAnterior : any = moment().subtract(1, 'M').format('YYYY-MM-DD');
    let fechaInicial : any = moment(this.formMovimientos.value.FechaInicial).format('YYYY-MM-DD') == 'Fecha inválida' ? fechaMesAnterior : moment(this.formMovimientos.value.FechaInicial).format('YYYY-MM-DD');
    let fechaFinal : any =moment( this.formMovimientos.value.FechaFinal).format('YYYY-MM-DD') == 'Fecha inválida' ? this.today : moment(this.formMovimientos.value.FechaFinal).format('YYYY-MM-DD');
    let ruta : string = this.validacionParametrosConsulta();

    this.materiaPrimaService.GetMoviemientos(fechaInicial, fechaFinal, ruta).subscribe(datos => {
      if (datos.length == 0) this.mensajeService.mensajeAdvertencia(`¡Advertencia!`, `¡No se encontró información con los parametros consultados!`);
      else this.llenarMateriasPrimasConsultadas(datos);
    }, () => this.mensajeService.mensajeError(`¡Ocurrió un error!`, `¡No se pudo realizar la consulta, error en el servidor!`), () => this.cargando = false);
    this.totalAsignadoRestanteAsignar();
  }

  validacionParametrosConsulta(){
    let ruta : string = ``;
    let codigo : any = this.formMovimientos.value.Codigo;
    let tipoMovimiento : any = this.formMovimientos.value.TipoMovimiento;
    let materiaPrima : any = this.formMovimientos.value.MateriasPrimas_Id;

    if (codigo != null && tipoMovimiento != null && materiaPrima != null) ruta = `?codigo=${codigo}&tipoMov=${tipoMovimiento}&materiaPrima=${materiaPrima}`;
    else if (codigo != null && tipoMovimiento != null) ruta = `?codigo=${codigo}&tipoMov=${tipoMovimiento}`;
    else if (codigo != null && materiaPrima != null) ruta = `?codigo=${codigo}&materiaPrima=${materiaPrima}`;
    else if (tipoMovimiento != null && materiaPrima != null) ruta = `?tipoMov=${tipoMovimiento}&materiaPrima=${materiaPrima}`;
    else if (codigo != null) ruta = `?codigo=${codigo}`;
    else if (tipoMovimiento != null) ruta = `?tipoMov=${tipoMovimiento}`;
    else if (materiaPrima != null) ruta = `?materiaPrima=${materiaPrima}`;
    else ruta = ``;

    return ruta;
  }

  totalAsignadoRestanteAsignar(){
    let codigo : any = this.formMovimientos.value.Codigo;
    if (codigo != null) {
      this.bagProServices.srvObtenerListaClienteOT_Item(codigo).subscribe(datos_procesos => {
        for (let i = 0; i < datos_procesos.length; i++) {
          this.detallesAsignacionService.getMateriasPrimasAsignadas(parseInt(codigo)).subscribe(datos_asignacion => {
            this.cantRestante = (datos_procesos[i].datosotKg + (datos_procesos[i].datosotKg * 0.05)) - datos_asignacion;
            this.cantAsignada = datos_asignacion;
          });
          break;
        }
      });
    }
  }

  llenarMateriasPrimasConsultadas(datos){
    this.cargando = true;
    let count : number = 0;
    for (let i = 0; i < datos.length; i++) {
      let info : any = {
        Id : datos[i].id,
        Codigo : datos[i].codigo,
        Movimiento : datos[i].movimiento,
        Tipo_Movimiento : datos[i].tipo_Movimiento,
        Fecha : datos[i].fecha,
        Usuario : datos[i].usuario,
        Id_MateriaPrima : datos[i].materia_Prima_Id,
        Materia_Prima : datos[i].materia_Prima,
        Id_Tinta : datos[i].tinta_Id,
        Tinta : datos[i].tinta,
        Id_Bopp : datos[i].bopp_Id,
        Bopp : datos[i].bopp,
        Cantidad : datos[i].cantidad,
        Presentacion : datos[i].presentacion,
        Precio : datos[i].precio,
        SubTotal : datos[i].subTotal,
      };
      this.agrupacionMateriasPrimas(datos[i], info);
      count++;
      if (datos.length == count) this.cargando = false;
    }
  }

  agrupacionMateriasPrimas(datos, infoMateriaPrima){
    // Polietilenos
    if (datos.materia_Prima_Id != 84 && datos.tinta_Id == 2001 && (datos.bopp_Id == 449 || datos.bopp_Id == 1)) this.movimientosPolietilenos.push(infoMateriaPrima);
    this.movimientosPolietilenos.sort((a,b) => a.Codigo.localeCompare(b.Codigo));
    this.movimientosPolietilenos.sort((a,b) => a.Fecha.localeCompare(b.Fecha));

    // Tintas
    if (datos.materia_Prima_Id == 84 && datos.tinta_Id != 2001 && (datos.bopp_Id == 449 || datos.bopp_Id == 1)) this.movimientosTintas.push(infoMateriaPrima);
    this.movimientosTintas.sort((a,b) => a.Codigo.localeCompare(b.Codigo));
    this.movimientosTintas.sort((a,b) => a.Fecha.localeCompare(b.Fecha));

    // Biorientado
    if (datos.materia_Prima_Id == 84 && datos.tinta_Id == 2001 && (datos.bopp_Id != 449 || datos.bopp_Id != 1)) this.movimientosBiorientados.push(infoMateriaPrima);
    this.movimientosBiorientados.sort((a,b) => a.Codigo.localeCompare(b.Codigo));
    this.movimientosBiorientados.sort((a,b) => a.Fecha.localeCompare(b.Fecha));
  }

  // Funcion que va a validar el tipo de movimiento para crear el pdf
  validarTipoMovimiento(data : any){
    this.datosPdf = [];
    this.cargando = true;
    let movAsignaciones : string [] = ['ASIGMP', 'ASIGBOPA', 'ASIGBOPP', 'ASIGPOLY', 'ASIGTINTAS'];
    if (movAsignaciones.includes(data.Movimiento)) this.asignacionesMateriaPrima(data);
    else if (data.Movimiento == 'CRTINTAS') this.creacionTintas(data);
    else if (data.Movimiento == 'DEVMP') this.devolucionesMateriaPrima(data);
    else if (data.Movimiento == 'FCO' || data.Movimiento == 'REM') this.entradasMateriasPrimas(data);
  }

  asignacionesMateriaPrima(data : any){
    let informacionPdf : any;
    this.materiaPrimaService.GetInfoMovimientoAsignaciones(data.Id, data.Movimiento).subscribe(datos => {
      for (let i = 0; i < datos.length; i++) {
        let info : any = {
          Id : '',
          Nombre : '',
          Cantidad : this.formatonumeros(datos[i].cantidad),
          "Presentación" : datos[i].unidad_Medida,
          Precio : this.formatonumeros(datos[i].precio),
          SubTotal : this.formatonumeros(datos[i].subTotal),
        }
        if (data.Movimiento == 'ASIGMP') {
          info.Id = datos[i].materia_Prima_Id;
          info.Nombre = datos[i].materia_Prima;
        } else if (data.Movimiento == 'ASIGBOPA' || data.Movimiento == 'ASIGBOPP' || data.Movimiento == 'ASIGPOLY'){
          info.Id = datos[i].bopp_Id;
          info.Nombre = datos[i].bopp;
        } else if (data.Movimiento == 'ASIGTINTAS'){
          info.Id = datos[i].tinta_Id;
          info.Nombre = datos[i].tinta;
        }
        this.datosPdf.push(info);
      }
      informacionPdf = datos;
    }, () => this.cargando = false, () => setTimeout(() => this.crearPDF(informacionPdf), 1000));
  }

  creacionTintas(data: any){
    let informacionPdf : any;
    this.materiaPrimaService.GetInfoMovimientoCreacionTinta(data.Id).subscribe(datos => {
      for (let i = 0; i < datos.length; i++) {
        let info : any = {
          Id : '',
          Nombre : '',
          Cantidad : this.formatonumeros(datos[i].cantidad),
          "Presentación" : datos[i].unidad_Medida,
          Precio : this.formatonumeros(datos[i].precio),
          SubTotal : this.formatonumeros(datos[i].subTotal),
        }
        if (datos[i].materia_Prima_Id != 84 && datos[i].tinta_Id == 2001) {
          info.Id = datos[i].materia_Prima_Id;
          info.Nombre = datos[i].materia_Prima;
        } else if (datos[i].materia_Prima_Id == 84 && datos[i].tinta_Id != 2001){
          info.Id = datos[i].tinta_Id;
          info.Nombre = datos[i].tinta;
        }

        setTimeout(() => {
          this.materiaPrimaService.GetInventario(this.today, this.today, info.Id).subscribe(datoMP => {
            for (let j = 0; j < datoMP.length; j++) {
              info.Precio = this.formatonumeros(datoMP[j].precio);
              datos[i].subTotal = datoMP[j].precio * datos[i].cantidad;
              info.SubTotal = this.formatonumeros(datoMP[j].precio * datos[i].cantidad);
            }
          });
          this.datosPdf.push(info);
        }, 500);
      }
      informacionPdf = datos;
    }, () => this.cargando = false, () => setTimeout(() => this.crearPDF(informacionPdf), 1000));
  }

  devolucionesMateriaPrima(data : any){
    let informacionPdf : any;
    this.materiaPrimaService.GetInfoMovimientosDevoluciones(data.Id).subscribe(datos => {
      for (let i = 0; i < datos.length; i++) {
        let info : any = {
          Id : '',
          Nombre : '',
          Cantidad : this.formatonumeros(datos[i].cantidad),
          "Presentación" : datos[i].unidad_Medida,
          Precio : this.formatonumeros(datos[i].precio),
          SubTotal : this.formatonumeros(datos[i].subTotal),
        }
        if (datos[i].materia_Prima_Id != 84 && datos[i].tinta_Id == 2001 && (datos[i].bopp_Id == 449 || datos[i].bopp_Id == 1)) {
          info.Id = datos[i].materia_Prima_Id;
          info.Nombre = datos[i].materia_Prima;
        } else if (datos[i].materia_Prima_Id == 84 && datos[i].tinta_Id != 2001 && (datos[i].bopp_Id == 449 || datos[i].bopp_Id == 1)){
          info.Id = datos[i].tinta_Id;
          info.Nombre = datos[i].tinta;
        } else if (datos[i].materia_Prima_Id == 84 && datos[i].tinta_Id == 2001 && (datos[i].bopp_Id == 449 || datos[i].bopp_Id == 1)){
          info.Id = datos[i].bopp_Id;
          info.Nombre = datos[i].bopp;
        }

        setTimeout(() => {
          this.materiaPrimaService.GetInventario(this.today, this.today, info.Id).subscribe(datoMP => {
            for (let j = 0; j < datoMP.length; j++) {
              info.Precio = this.formatonumeros(datoMP[j].precio);
              datos[i].subTotal = datoMP[j].precio * datos[i].cantidad;
              info.SubTotal = this.formatonumeros(datoMP[j].precio * datos[i].cantidad);
            }
          });
          this.datosPdf.push(info);
        }, 500);
      }
      informacionPdf = datos;
    }, () => this.cargando = false, () => setTimeout(() => this.crearPDF(informacionPdf), 1000));
  }

  entradasMateriasPrimas(data : any){
    let informacionPdf : any;
    this.materiaPrimaService.GetInfoMovimientosEntradas(data.Id, data.Movimiento).subscribe(datos => {
      for (let i = 0; i < datos.length; i++) {
        let info : any = {
          Id : '',
          Nombre : '',
          Cantidad : this.formatonumeros(datos[i].cantidad),
          "Presentación" : datos[i].unidad_Medida,
          Precio : this.formatonumeros(datos[i].precio),
          SubTotal : this.formatonumeros(datos[i].subTotal),
        }
        if (datos[i].materia_Prima_Id != 84 && datos[i].tinta_Id == 2001 && (datos[i].bopp_Id == 449 || datos[i].bopp_Id == 1)) {
          info.Id = datos[i].materia_Prima_Id;
          info.Nombre = datos[i].materia_Prima;
        } else if (datos[i].materia_Prima_Id == 84 && datos[i].tinta_Id != 2001 && (datos[i].bopp_Id == 449 || datos[i].bopp_Id == 1)){
          info.Id = datos[i].tinta_Id;
          info.Nombre = datos[i].tinta;
        } else if (datos[i].materia_Prima_Id == 84 && datos[i].tinta_Id == 2001 && (datos[i].bopp_Id == 449 || datos[i].bopp_Id == 1)){
          info.Id = datos[i].bopp_Id;
          info.Nombre = datos[i].bopp;
        }
        setTimeout(() => {
          this.materiaPrimaService.GetInventario(this.today, this.today, info.Id).subscribe(datoMP => {
            for (let j = 0; j < datoMP.length; j++) {
              info.Precio = this.formatonumeros(datoMP[j].precio);
              datos[i].subTotal = datoMP[j].precio * datos[i].cantidad;
              info.SubTotal = this.formatonumeros(datoMP[j].precio * datos[i].cantidad);
            }
          });
          this.datosPdf.push(info);
        }, 500);
      }
      informacionPdf = datos;
    }, () => this.cargando = false, () => setTimeout(() => this.crearPDF(informacionPdf), 1000));
  }

  // Funcion que va a crear un PDF
  crearPDF(data : any){
    let movimientoOrdenesTrabajo : string [] = ['ASIGMP', 'ASIGBOPA', 'ASIGBOPP', 'ASIGPOLY', 'ASIGTINTAS', 'DEVMP'];
    let tituloAdicional : string = movimientoOrdenesTrabajo.includes(data[0].movimiento) ? `Orden de Trabajo N° ${data[0].codigo}` : data[0].movimiento != 'CRTINTAS' ? `Codigo Documento ${(data[0].codigo).toUpperCase()}` : '';
    let titulo : string = `${data[0].tipo_Movimiento} N° ${data[0].id} \n ${tituloAdicional}`;
    let content : any = this.contenidoPDF(data);
    this.creacionPDFService.formatoPDF(titulo, content);
    setTimeout(() => this.cargando = false, 3000);
  }

  contenidoPDF(data : any){
    let datos : any = [];
    datos.push(this.tituloEntradasPDF(data[0]));
    datos.push(this.informacionProveedorPDF(data[0]));
    datos.push(this.tituloMateriasPrimasPDF());
    datos.push(this.table(this.datosPdf, ['Id', 'Nombre', 'Cantidad', 'Presentación', 'Precio', 'SubTotal']));
    datos.push(this.totalesPDF(data));
    datos.push(this.observacionPDF(data[0]));
    return datos;
  }

  tituloEntradasPDF(data : any){
    return ['Remisión', 'Factura de Compra'].includes(data.tipo_Movimiento) ? {
      margin: [0, 15],
      text: `Información detallada del Proveedor`,
      alignment: 'center',
      style: 'header'
    } : '';
  }

  informacionProveedorPDF(data : any){
    return ['Remisión', 'Factura de Compra'].includes(data.tipo_Movimiento) ? {
      table: {
        widths: ['40%', '30%', '30%'],
        style: 'header',
        body: [
          [
            `ID: ${data.proveedor_Id}`,
            `Tipo de ID: ${data.tipo_Id_Proveedor}`,
            `Tipo de Proveedor: ${data.tipo_Proveedor}`
          ],
          [
            `Nombre: ${data.proveedor}`,
            `Telefono: ${data.telefono_Proveedor}`,
            `Ciudad: ${data.ciudad_Proveedor}`
          ],
          [
            `E-mail: ${data.correo_Proveedor}`,
            ``,
            ``
          ]
        ]
      },
      layout: 'lightHorizontalLines',
      fontSize: 9,
    } : '';
  }

  tituloMateriasPrimasPDF(){
    return {
      margin: [0, 15],
      text: `Información detallada de la(s) Materia(s) Prima(s)`,
      alignment: 'center',
      style: 'header'
    }
  }

  // Funcion que genera la tabla donde se mostrará la información de los productos pedidos
  table(data, columns) {
    return {
      table: {
        headerRows: 1,
        widths: ['10%', '40%', '15%', '10%', '10%', '15%'],
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

  totalesPDF(data : any){
    return {
      table: {
        widths: ['40%', '10%', '15%', '10%', '10%', '15%'],
        style: 'header',
        body: [
          [
            {},
            {border: [true, false, true, true], text: `Peso Total`},
            {border: [false, false, true, true], text: `${this.formatonumeros(this.calcularTotalCantidad(data))}`},
            {},
            {border: [true, false, true, true], text: `Valor Total`},
            {border: [false, false, true, true], text: `$${this.formatonumeros(this.calcularTotalCosto(data))}`},
          ],
        ]
      },
      layout: {defaultBorder: false},
      fontSize: 8,
    }
  }

  observacionPDF(data : any){
    return {
      margin: [0, 20],
      table: {
        widths: ['*'],
        body: [
          [{ border: [true, true, true, false], text: `Observación: `, style: 'subtitulo' }],
          [{ border: [true, false, true, true], text: `${!data.observacion ? '' : data.observacion.toString().toUpperCase().trim()}` }]
        ]
      },
      fontSize: 9,
    };
  }

  // Funcion que va a devolver el valor total de la materia prima asignada
  calcularTotalMaterialPrima = (data : any) : number => data.reduce((a, b) => a + b.Cantidad, 0);

  // Funcion que va a devolver la cantidad total pesada de materia prima asignada
  calcularTotalCantidad = (data : any) : number => data.reduce((a, b) => a + b.cantidad, 0);

  // Funcion que va a devolver el costo total de la materia prima asignada
  calcularTotalCosto = (data : any) : number => data.reduce((a, b) => a + b.subTotal, 0);

  /** Funcion para filtrar busquedas y mostrar el valor total segun el filtro seleccionado. */
  aplicarfiltro1 = ($event, campo : any, valorCampo : string) => this.dt1!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

  aplicarfiltro2 = ($event, campo : any, valorCampo : string) => this.dt2!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

  aplicarfiltro3 = ($event, campo : any, valorCampo : string) => this.dt3!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

  /** Función que mostrará un tutorial describiendo paso a paso cada funcionalidad de la aplicación */
  verTutorial() {
    this.shepherdService.defaultStepOptions = defaultStepOptions;
    this.shepherdService.modal = true;
    this.shepherdService.confirmCancel = false;
    this.shepherdService.addSteps(defaultSteps);
    this.shepherdService.start();
  }
}
