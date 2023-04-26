import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import pdfMake from 'pdfmake/build/pdfmake';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { MateriaPrimaService } from 'src/app/Servicios/MateriaPrima/materiaPrima.service';
import { AppComponent } from 'src/app/app.component';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';

@Component({
  selector: 'app-movimientoMP',
  templateUrl: './movimientoMP.component.html',
  styleUrls: ['./movimientoMP.component.css']
})

export class MovimientoMPComponent implements OnInit {

  @ViewChild('dt') dt: Table | undefined;
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

  constructor(private frmBuilder : FormBuilder,
                private AppComponent : AppComponent,
                  private messageService: MessageService,
                    private materiaPrimaService : MateriaPrimaService,) {

    this.formMovimientos = this.frmBuilder.group({
      Codigo : [null, Validators.required],
      FechaInicial : [null, Validators.required],
      FechaFinal : [null, Validators.required],
      TipoMovimiento : [null, Validators.required],
      MateriasPrimas_Id : [null, Validators.required],
      MateriasPrimas : [null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.obtenerTipoDocumento();
    this.obtenerMateriasPrimas();
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = '$1,';
    return number.toString().replace(exp,rep);
  }

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
  obtenerMateriasPrimas = () => this.materiaPrimaService.GetInventarioMateriasPrimas().subscribe(datos => { this.materiasPrimas = datos; });

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
    this.cargando = true;
    this.movimientosPolietilenos = [];
    this.movimientosTintas = [];
    this.movimientosBiorientados = [];
    let codigo : any = this.formMovimientos.value.Codigo;
    let fechaInicial : any = moment(this.formMovimientos.value.FechaInicial).format('YYYY-MM-DD');
    let fechaFinal : any =moment( this.formMovimientos.value.FechaFinal).format('YYYY-MM-DD');
    let tipoMovimiento : any = this.formMovimientos.value.TipoMovimiento;
    let materiaPrima : any = this.formMovimientos.value.MateriasPrimas_Id;
    let ruta : string = ``;

    if (fechaInicial == 'Invalid date') fechaInicial = moment().format('YYYY-MM-DD');
    if (fechaFinal == 'Invalid date') fechaFinal = fechaInicial;

    if (codigo != null && tipoMovimiento != null && materiaPrima != null) ruta = `?codigo=${codigo}&tipoMov=${tipoMovimiento}&materiaPrima=${materiaPrima}`;
    else if (codigo != null && tipoMovimiento != null) ruta = `?codigo=${codigo}&tipoMov=${tipoMovimiento}`;
    else if (codigo != null && materiaPrima != null) ruta = `?codigo=${codigo}&materiaPrima=${materiaPrima}`;
    else if (tipoMovimiento != null && materiaPrima != null) ruta = `?tipoMov=${tipoMovimiento}&materiaPrima=${materiaPrima}`;
    else if (codigo != null) ruta = `?codigo=${codigo}`;
    else if (tipoMovimiento != null) ruta = `?tipoMov=${tipoMovimiento}`;
    else if (materiaPrima != null) ruta = `?materiaPrima=${materiaPrima}`;
    else ruta = ``;

    this.materiaPrimaService.GetMoviemientos(fechaInicial, fechaFinal, ruta).subscribe(datos => {
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
        }
        // Polietilenos
        if (datos[i].materia_Prima_Id != 84 && datos[i].tinta_Id == 2001 && (datos[i].bopp_Id == 449 || datos[i].bopp_Id == 1)) this.movimientosPolietilenos.push(info);
        this.movimientosPolietilenos.sort((a,b) => a.Codigo.localeCompare(b.Codigo));
        this.movimientosPolietilenos.sort((a,b) => a.Fecha.localeCompare(b.Fecha));

        // Tintas
        if (datos[i].materia_Prima_Id == 84 && datos[i].tinta_Id != 2001 && (datos[i].bopp_Id == 449 || datos[i].bopp_Id == 1)) this.movimientosTintas.push(info);
        this.movimientosTintas.sort((a,b) => a.Codigo.localeCompare(b.Codigo));
        this.movimientosTintas.sort((a,b) => a.Fecha.localeCompare(b.Fecha));

        // Biorientado
        if (datos[i].materia_Prima_Id == 84 && datos[i].tinta_Id == 2001 && (datos[i].bopp_Id != 449 || datos[i].bopp_Id != 1)) this.movimientosBiorientados.push(info);
        this.movimientosBiorientados.sort((a,b) => a.Codigo.localeCompare(b.Codigo));
        this.movimientosBiorientados.sort((a,b) => a.Fecha.localeCompare(b.Fecha));
        this.cargando = false;
      }
      if (datos.length == 0) this.mensajeAdvertencia(`¡No se encontró información con los parametros consultados!`);
    }, error => this.mensajeError(`¡Ocurrió un error!`, `¡No se pudo realizar la consulta, error en el servidor!`));
  }

  // Funcion que va a validar el tipo de movimiento para crear el pdf
  validarTipoMovimiento(data : any){
    this.datosPdf = [];
    if (data.Movimiento == 'ASIGMP' || data.Movimiento == 'ASIGBOPA' || data.Movimiento == 'ASIGBOPP' || data.Movimiento == 'ASIGPOLY' || data.Movimiento == 'ASIGTINTAS') {
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
        setTimeout(() => { this.crearPDFAsignaciones(datos); }, 1500);
      });
    } else if (data.Movimiento == 'CRTINTAS') {
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
        setTimeout(() => { this.crearPDFCreacionTinta(datos); }, 1500);
      });
    } else if (data.Movimiento == 'DEVMP') {
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
        setTimeout(() => { this.crearPDFDevoluciones(datos); }, 1500);
      });
    } else if (data.Movimiento == 'FCO' || data.Movimiento == 'REM') {
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
        setTimeout(() => { this.crearPDFEntradasMateriasPrimas(datos); }, 1500);
      });
    }
  }

  // Funcion que va a crear un PDF para las asignaciones de materia prima
  crearPDFAsignaciones(data : any){
    let nombre : string = this.AppComponent.storage_Nombre;
    for (let i = 0; i < data.length; i++) {
      const pdfDefinicion : any = {
        info: { title: `${data[i].tipo_Movimiento} N° ${data[i].id}` },
        pageSize: { width: 630, height: 760 },
        footer: function(currentPage : any, pageCount : any) {
          return [
            {
              columns: [
                { text: `Reporte generado por ${nombre}`, alignment: ' left', fontSize: 8, margin: [30, 0, 0, 0] },
                { text: `Fecha Expedición Documento ${moment().format('YYYY-MM-DD')} - ${moment().format('H:mm:ss')}`, alignment: 'right', fontSize: 8 },
                { text: `${currentPage.toString() + ' de ' + pageCount}`, alignment: 'right', fontSize: 8, margin: [0, 0, 30, 0] },
              ]
            }
          ]
        },
        content : [
          {
            columns: [
              {
                image : logoParaPdf,
                width : 220,
                height : 50
              },
              {
                text: `${data[i].tipo_Movimiento} N° ${data[i].id}`,
                alignment: 'right',
                style: 'titulo',
                margin: 30
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
                    text: `${data[i].empresa_Nombre}`
                  },
                  {
                    border: [false, false, false, false],
                    text: `Fecha`
                  },
                  {
                    border: [false, false, false, true],
                    text: `${data[i].fecha.replace('T00:00:00', ``)} ${data[i].hora}`
                  },
                ],
                [
                  {
                    border: [false, false, false, false],
                    text: `NIT Empresa`
                  },
                  {
                    border: [false, false, false, true],
                    text: `${data[i].empresa_Id}`
                  },
                  {
                    border: [false, false, false, false],
                    text: `Orden de Trabajo`
                  },
                  {
                    border: [false, false, false, true],
                    text: `${data[i].codigo}`
                  },
                ],
                [
                  {
                    border: [false, false, false, false],
                    text: `Dirección`
                  },
                  {
                    border: [false, false, false, true],
                    text: `${data[i].empresa_Direccion}`
                  },
                  {
                    border: [false, false, false, false],
                    text: `Maquina`
                  },
                  {
                    border: [false, false, false, true],
                    text: `${data[i].maquina}`
                  },
                ]
              ]
            },
            layout: { defaultBorder: false, },
            fontSize: 9,
          },
          '\n \n',
          {
            text: `Usuario: ${data[i].usuario}\n`,
            alignment: 'left',
            style: 'header',
          },
          '\n \n',
          {
            text: `\n\n Información detallada de la(s) Materia(s) Prima(s) \n `,
            alignment: 'center',
            style: 'header'
          },
          this.table(this.datosPdf, ['Id', 'Nombre', 'Cantidad', 'Presentación', 'Precio', 'SubTotal']),
          {
            style: 'tablaTotales',
            table: {
              widths: [197, '*', 50, '*', '*', 98],
              style: 'header',
              body: [
                [
                  '',
                  {
                    border: [true, false, true, true],
                    text: `Peso Total`
                  },
                  {
                    border: [false, false, true, true],
                    text: `${this.formatonumeros(this.calcularTotalCantidad(data))}`
                  },
                  '',
                  {
                    border: [true, false, true, true],
                    text: `Valor Total`
                  },
                  {
                    border: [false, false, true, true],
                    text: `$${this.formatonumeros(this.calcularTotalCosto(data))}`
                  },
                ],
              ]
            },
            layout: {
              defaultBorder: false,
            },
            fontSize: 8,
          },
          '\n \n',
          {
            text: `\n \nObservación: \n ${data[i].observacion}\n`,
            style: 'header',
          }
        ],
        styles: {
          header: { fontSize: 10, bold: true },
          titulo: { fontSize: 20, bold: true }
        }
      }
      const pdf = pdfMake.createPdf(pdfDefinicion);
      pdf.open();
      break;
    }
  }

  // Funcion que va a crear un PDF para las devoluciones de materia prima
  crearPDFDevoluciones(data : any){
    let nombre : string = this.AppComponent.storage_Nombre;
    for (let i = 0; i < data.length; i++) {
      const pdfDefinicion : any = {
        info: { title: `${data[i].tipo_Movimiento} N° ${data[i].id}` },
        pageSize: { width: 630, height: 760 },
        footer: function(currentPage : any, pageCount : any) {
          return [
            {
              columns: [
                { text: `Reporte generado por ${nombre}`, alignment: ' left', fontSize: 8, margin: [30, 0, 0, 0] },
                { text: `Fecha Expedición Documento ${moment().format('YYYY-MM-DD')} - ${moment().format('H:mm:ss')}`, alignment: 'right', fontSize: 8 },
                { text: `${currentPage.toString() + ' de ' + pageCount}`, alignment: 'right', fontSize: 8, margin: [0, 0, 30, 0] },
              ]
            }
          ]
        },
        content : [
          {
            columns: [
              {
                image : logoParaPdf,
                width : 220,
                height : 50
              },
              {
                text: `${data[i].tipo_Movimiento} N° ${data[i].id}`,
                alignment: 'right',
                style: 'titulo',
                margin: 30
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
                    text: `${data[i].empresa_Nombre}`
                  },
                  {
                    border: [false, false, false, false],
                    text: `Fecha`
                  },
                  {
                    border: [false, false, false, true],
                    text: `${data[i].fecha.replace('T00:00:00', ``)} ${data[i].hora}`
                  },
                ],
                [
                  {
                    border: [false, false, false, false],
                    text: `NIT Empresa`
                  },
                  {
                    border: [false, false, false, true],
                    text: `${data[i].empresa_Id}`
                  },
                  {
                    border: [false, false, false, false],
                    text: `Orden de Trabajo`
                  },
                  {
                    border: [false, false, false, true],
                    text: `${data[i].codigo}`
                  },
                ],
                [
                  {
                    border: [false, false, false, false],
                    text: `Dirección`
                  },
                  {
                    border: [false, false, false, true],
                    text: `${data[i].empresa_Direccion}`
                  },
                  {},
                  {},
                ]
              ]
            },
            layout: { defaultBorder: false, },
            fontSize: 9,
          },
          '\n \n',
          {
            text: `Usuario: ${data[i].usuario}\n`,
            alignment: 'left',
            style: 'header',
          },
          '\n \n',
          {
            text: `\n\n Información detallada de la(s) Materia(s) Prima(s) \n `,
            alignment: 'center',
            style: 'header'
          },
          this.table(this.datosPdf, ['Id', 'Nombre', 'Cantidad', 'Presentación', 'Precio', 'SubTotal']),
          {
            style: 'tablaTotales',
            table: {
              widths: [197, '*', 50, '*', '*', 98],
              style: 'header',
              body: [
                [
                  '',
                  {
                    border: [true, false, true, true],
                    text: `Peso Total`
                  },
                  {
                    border: [false, false, true, true],
                    text: `${this.formatonumeros(this.calcularTotalCantidad(data))}`
                  },
                  '',
                  {
                    border: [true, false, true, true],
                    text: `Valor Total`
                  },
                  {
                    border: [false, false, true, true],
                    text: `$${this.formatonumeros(this.calcularTotalCosto(data))}`
                  },
                ],
              ]
            },
            layout: { defaultBorder: false, },
            fontSize: 8,
          },
          '\n \n',
          {
            text: `\n \nObservación: \n ${data[i].observacion}\n`,
            style: 'header',
          }
        ],
        styles: {
          header: { fontSize: 10, bold: true },
          titulo: { fontSize: 20, bold: true }
        }
      }
      const pdf = pdfMake.createPdf(pdfDefinicion);
      pdf.open();
      break;
    }
  }

  // Funcion que va a crear un PDF para las creaciones de tintas
  crearPDFCreacionTinta(data : any) {
    let nombre : string = this.AppComponent.storage_Nombre;
    for (let i = 0; i < data.length; i++) {
      const pdfDefinicion : any = {
        info: { title: `${data[i].tipo_Movimiento} N° ${data[i].id}` },
        pageSize: { width: 630, height: 760 },
        footer: function(currentPage : any, pageCount : any) {
          return [
            {
              columns: [
                { text: `Reporte generado por ${nombre}`, alignment: ' left', fontSize: 8, margin: [30, 0, 0, 0] },
                { text: `Fecha Expedición Documento ${moment().format('YYYY-MM-DD')} - ${moment().format('H:mm:ss')}`, alignment: 'right', fontSize: 8 },
                { text: `${currentPage.toString() + ' de ' + pageCount}`, alignment: 'right', fontSize: 8, margin: [0, 0, 30, 0] },
              ]
            }
          ]
        },
        content : [
          {
            columns: [
              {
                image : logoParaPdf,
                width : 220,
                height : 50
              },
              {
                text: `${data[i].tipo_Movimiento} N° ${data[i].id}`,
                alignment: 'right',
                style: 'titulo',
                margin: 30
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
                    text: `${data[i].empresa_Nombre}`
                  },
                  {
                    border: [false, false, false, false],
                    text: `Fecha`
                  },
                  {
                    border: [false, false, false, true],
                    text: `${data[i].fecha.replace('T00:00:00', ``)} ${data[i].hora}`
                  },
                ],
                [
                  {
                    border: [false, false, false, false],
                    text: `NIT Empresa`
                  },
                  {
                    border: [false, false, false, true],
                    text: `${data[i].empresa_Id}`
                  },
                  {
                    border: [false, false, false, false],
                    text: `Dirección`
                  },
                  {
                    border: [false, false, false, true],
                    text: `${data[i].empresa_Direccion}`
                  },
                ],
              ]
            },
            layout: { defaultBorder: false, },
            fontSize: 9,
          },
          '\n \n',
          {
            text: `Usuario: ${data[i].usuario}\n`,
            alignment: 'left',
            style: 'header',
          },
          '\n',
          {
            text: `Se crearon ${this.formatonumeros(data[i].cantidad_Creada)} Kg de la Tinta ${data[i].tinta_Creada}\n`,
            alignment: 'left',
            style: 'header',
          },
          '\n',
          {
            text: `\n\n Información detallada de la(s) Materia(s) Prima(s) \n `,
            alignment: 'center',
            style: 'header'
          },
          this.table(this.datosPdf, ['Id', 'Nombre', 'Cantidad', 'Presentación', 'Precio', 'SubTotal']),
          {
            style: 'tablaTotales',
            table: {
              widths: [197, '*', 50, '*', '*', 98],
              style: 'header',
              body: [
                [
                  '',
                  {
                    border: [true, false, true, true],
                    text: `Peso Total`
                  },
                  {
                    border: [false, false, true, true],
                    text: `${this.formatonumeros(this.calcularTotalCantidad(data))}`
                  },
                  '',
                  {
                    border: [true, false, true, true],
                    text: `Valor Total`
                  },
                  {
                    border: [false, false, true, true],
                    text: `$${this.formatonumeros(this.calcularTotalCosto(data))}`
                  },
                ],
              ]
            },
            layout: { defaultBorder: false, },
            fontSize: 8,
          },
          '\n \n',
          {
            text: `\n \nObservación: \n ${data[i].observacion == null ? '' : data[i].observacion}\n`,
            style: 'header',
          }
        ],
        styles: {
          header: { fontSize: 10, bold: true },
          titulo: { fontSize: 20, bold: true }
        }
      }
      const pdf = pdfMake.createPdf(pdfDefinicion);
      pdf.open();
      break;
    }
  }

  // Funcion que va a crear un PDF para las entradas de materias primas
  crearPDFEntradasMateriasPrimas(data : any) {
    let nombre : string = this.AppComponent.storage_Nombre;
    for (let i = 0; i < data.length; i++) {
      const pdfDefinicion : any = {
        info: { title: `${data[i].tipo_Movimiento} N° ${data[i].codigo}` },
        pageSize: { width: 630, height: 760 },
        footer: function(currentPage : any, pageCount : any) {
          return [
            {
              columns: [
                { text: `Reporte generado por ${nombre}`, alignment: ' left', fontSize: 8, margin: [30, 0, 0, 0] },
                { text: `Fecha Expedición Documento ${moment().format('YYYY-MM-DD')} - ${moment().format('H:mm:ss')}`, alignment: 'right', fontSize: 8 },
                { text: `${currentPage.toString() + ' de ' + pageCount}`, alignment: 'right', fontSize: 8, margin: [0, 0, 30, 0] },
              ]
            }
          ]
        },
        content : [
          {
            columns: [
              {
                image : logoParaPdf,
                width : 220,
                height : 50
              },
              {
                text: `${data[i].tipo_Movimiento} N° ${data[i].codigo}`,
                alignment: 'right',
                style: 'titulo',
                margin: 30
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
                    text: `${data[i].empresa_Nombre}`
                  },
                  {
                    border: [false, false, false, false],
                    text: `Fecha`
                  },
                  {
                    border: [false, false, false, true],
                    text: `${data[i].fecha.replace('T00:00:00', ``)} ${data[i].hora}`
                  },
                ],
                [
                  {
                    border: [false, false, false, false],
                    text: `NIT Empresa`
                  },
                  {
                    border: [false, false, false, true],
                    text: `${data[i].empresa_Id}`
                  },
                  {
                    border: [false, false, false, false],
                    text: `Dirección`
                  },
                  {
                    border: [false, false, false, true],
                    text: `${data[i].empresa_Direccion}`
                  },
                ],
              ]
            },
            layout: { defaultBorder: false, },
            fontSize: 9,
          },
          '\n \n',
          {
            text: `Usuario: ${data[i].usuario}\n`,
            alignment: 'left',
            style: 'header',
          },
          '\n \n',
          {
            text: `\n\n Información detallada del Proveedor \n `,
            alignment: 'center',
            style: 'header'
          },
          {
            style: 'tablaCliente',
            table: {
              widths: ['*', '*', '*'],
              style: 'header',
              body: [
                [
                  `ID: ${data[i].proveedor_Id}`,
                  `Tipo de ID: ${data[i].tipo_Id_Proveedor}`,
                  `Tipo de Proveedor: ${data[i].tipo_Proveedor}`
                ],
                [
                  `Nombre: ${data[i].proveedor}`,
                  `Telefono: ${data[i].telefono_Proveedor}`,
                  `Ciudad: ${data[i].ciudad_Proveedor}`
                ],
                [
                  `E-mail: ${data[i].correo_Proveedor}`,
                  ``,
                  ``
                ]
              ]
            },
            layout: 'lightHorizontalLines',
            fontSize: 9,
          },
          '\n \n',
          {
            text: `\n\n Información detallada de la(s) Materia(s) Prima(s) \n `,
            alignment: 'center',
            style: 'header'
          },
          this.table(this.datosPdf, ['Id', 'Nombre', 'Cantidad', 'Presentación', 'Precio', 'SubTotal']),
          {
            style: 'tablaTotales',
            table: {
              widths: [197, '*', 50, '*', '*', 98],
              style: 'header',
              body: [
                [
                  '',
                  {
                    border: [true, false, true, true],
                    text: `Peso Total`
                  },
                  {
                    border: [false, false, true, true],
                    text: `${this.formatonumeros(this.calcularTotalCantidad(data))}`
                  },
                  '',
                  {
                    border: [true, false, true, true],
                    text: `Valor Total`
                  },
                  {
                    border: [false, false, true, true],
                    text: `$${this.formatonumeros(this.calcularTotalCosto(data))}`
                  },
                ],
              ]
            },
            layout: { defaultBorder: false, },
            fontSize: 8,
          },
          '\n \n',
          {
            text: `\n \nObservación: \n ${data[i].observacion}\n`,
            style: 'header',
          }
        ],
        styles: {
          header: { fontSize: 10, bold: true },
          titulo: { fontSize: 20, bold: true }
        }
      }
      const pdf = pdfMake.createPdf(pdfDefinicion);
      pdf.open();
      break;
    }
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

  // Funcion que genera la tabla donde se mostrará la información de los productos pedidos
  table(data, columns) {
    return {
      table: {
        headerRows: 1,
        widths: [50, 197, 50, 50, 50, 98],
        body: this.buildTableBody(data, columns),
      },
      fontSize: 8,
      layout: {
        fillColor: function (rowIndex, node, columnIndex) {
          return (rowIndex == 0) ? '#CCCCCC' : null;
        }
      }
    };
  }

  // Funcion que va a devolver la cantidad total pesada de materia prima asignada
  calcularTotalCantidad(data : any) : number{
    let can : number = 0;
    for (const item of data) {
      can += item.cantidad;
    }
    return can;
  }

  // Funcion que va a devolver el costo total de la materia prima asignada
  calcularTotalCosto(data : any) : number{
    let can : number = 0;
    for (const item of data) {
      can += item.subTotal;
    }
    return can;
  }

  /** Funcion para filtrar busquedas y mostrar el valor total segun el filtro seleccionado. */
  aplicarfiltro = ($event, campo : any, valorCampo : string) => this.dt!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

  // Mostrar mensaje de confirmación
  mensajeConfirmacion(titulo : string, mensaje : any) {
    this.messageService.add({severity: 'success', summary: titulo,  detail: mensaje, life: 2000});
    this.cargando = false;
  }

  // Mostrar mensaje de error
  mensajeError(titulo : string, mensaje : string) {
    this.messageService.add({severity:'error', summary: titulo, detail: mensaje, life: 2000});
    this.cargando = false;
  }

  // Mostrar mensaje de advertencia
  mensajeAdvertencia(mensaje : string) {
    this.messageService.add({severity:'warn', summary: `¡Advertencia!`, detail: mensaje, life: 2000});
    this.cargando = false;
  }
}
