import { Component, Injectable, OnInit } from '@angular/core';
import moment from 'moment';
import pdfMake from 'pdfmake/build/pdfmake';
import { InventarioZeusService } from 'src/app/Servicios/InventarioZeus/inventario-zeus.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-Formato_Facturas_Ventas',
  templateUrl: './Formato_Facturas_Ventas.component.html',
  styleUrls: ['./Formato_Facturas_Ventas.component.css']
})
export class Formato_Facturas_VentasComponent implements OnInit {

  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  cargando: boolean = false; //Variable que validará cuando vaya a salir la animacion de carga
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  rangoFechas : any [] = []; /** Array que almacenará el rango de fechas */
  facturasConsultadas : any [] = [];

  constructor(private zeusService : InventarioZeusService,
    private msj : MensajesAplicacionService,
  ) {}

  ngOnInit() {
    //this.consultarInformacion();
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

  consultarInformacion() {
    let facturas = [
      /*{fac : 'RS-970191097', trm : 4099.20, valor : 29207.88 , fecha : '2023-09-01' },
      {fac : 'RS-970190079', trm : 4099.20, valor : 37843.45 , fecha : '2023-09-05' },
      {fac : 'RS-970192243', trm : 3929.28, valor : 32261.79 , fecha : '2023-09-18' },
      {fac : 'RS-970195770', trm : 4187.01, valor : 30563.06 , fecha : '2023-10-04' },
      {fac : 'RS-970198219', trm : 4222.09, valor : 29863.40 , fecha : '2023-10-18' },
      {fac : 'RS-970203004', trm : 4249.71, valor : 442.83   , fecha : '2023-10-20' },
      {fac : 'RS-970203722', trm : 3976.84, valor : 31828.89 , fecha : '2023-11-16' },
      {fac : 'RS-970203722', trm : 3976.84, valor : 1955.67  , fecha : '2023-11-15' },
      {fac : 'RS-970205638', trm : 4092.33, valor : 35054.73 , fecha : '2023-11-24' },
      {fac : 'RS-970206192', trm : 3980.67, valor : 4239.77  , fecha : '2023-11-30' },
      {fac : 'RS-970207328', trm : 4023.21, valor : 34013.44 , fecha : '2023-12-06' },
      {fac : 'RS-970207872', trm : 3982.50, valor : 309.48   , fecha : '2023-12-12' },
      {fac : 'RS-970207958', trm : 3990.88, valor : 1811.51  , fecha : '2023-12-13' },*/
      {fac : 'RS 970129878', trm : 4484.74, valor : 35606.47 , fecha : '2022-10-05' },
      {fac : 'RS 970150374', trm : 4548.5,  valor : 36040    , fecha : '2023-01-28' },
      {fac : 'RS 970150617', trm : 4548.5,  valor : 36040    , fecha : '2023-01-30' },
    ];

    this.cargando = true;
    setTimeout(() => {
      facturas.forEach(factura => {
        this.zeusService.GetFacturasEcopetrol(factura.fac, factura.trm, factura.valor, factura.fecha).subscribe(datos => {
          setTimeout(() => {
            datos.forEach(data => this.generarPDF(data, factura.trm, factura.valor));
          }, 1250);
        }, (err) => {
          this.cargando = false;
          this.msj.mensajeError(err.error);
        }, () => this.cargando = false);
      });
    }, 1000);
  }

  numeroALetras = (function() {
    function Unidades(num) {
      switch (num) {
        case 1:
          return 'UN';
        case 2:
          return 'DOS';
        case 3:
          return 'TRES';
        case 4:
          return 'CUATRO';
        case 5:
          return 'CINCO';
        case 6:
          return 'SEIS';
        case 7:
          return 'SIETE';
        case 8:
          return 'OCHO';
        case 9:
          return 'NUEVE';
      }
      return '';
    } //Unidades()

    function Decenas(num) {
      let decena = Math.floor(num / 10);
      let unidad = num - (decena * 10);

      switch (decena) {
        case 1:
          switch (unidad) {
            case 0:
              return 'DIEZ';
            case 1:
                return 'ONCE';
              case 2:
                return 'DOCE';
              case 3:
                return 'TRECE';
              case 4:
                return 'CATORCE';
              case 5:
                return 'QUINCE';
              default:
                return 'DIECI' + Unidades(unidad);
          }
        case 2:
          switch (unidad) {
            case 0:
              return 'VEINTE';
            default:
              return 'VEINTI' + Unidades(unidad);
          }
        case 3:
          return DecenasY('TREINTA', unidad);
        case 4:
          return DecenasY('CUARENTA', unidad);
        case 5:
          return DecenasY('CINCUENTA', unidad);
        case 6:
          return DecenasY('SESENTA', unidad);
        case 7:
          return DecenasY('SETENTA', unidad);
        case 8:
          return DecenasY('OCHENTA', unidad);
        case 9:
          return DecenasY('NOVENTA', unidad);
        case 0:
          return Unidades(unidad);
      }
    } //Unidades()

    function DecenasY(strSin, numUnidades) {
      if (numUnidades > 0) return strSin + ' Y ' + Unidades(numUnidades)
      return strSin;
    } //DecenasY()

    function Centenas(num) {
      let centenas = Math.floor(num / 100);
      let decenas = num - (centenas * 100);

      switch (centenas) {
        case 1:
          if (decenas > 0) return 'CIENTO ' + Decenas(decenas);
          return 'CIEN';
        case 2:
          return 'DOSCIENTOS ' + Decenas(decenas);
        case 3:
          return 'TRESCIENTOS ' + Decenas(decenas);
        case 4:
          return 'CUATROCIENTOS ' + Decenas(decenas);
        case 5:
          return 'QUINIENTOS ' + Decenas(decenas);
        case 6:
          return 'SEISCIENTOS ' + Decenas(decenas);
        case 7:
          return 'SETECIENTOS ' + Decenas(decenas);
        case 8:
          return 'OCHOCIENTOS ' + Decenas(decenas);
        case 9:
          return 'NOVECIENTOS ' + Decenas(decenas);
      }
      return Decenas(decenas);
    } //Centenas()

    function Seccion(num, divisor, strSingular, strPlural) {
      let cientos = Math.floor(num / divisor);
      let resto = num - (cientos * divisor);
      let letras = '';
      
      //if (cientos > 0) 
        if(cientos == 1) letras = strSingular
        else if (cientos > 1) letras = Centenas(cientos) + ' ' + strPlural;
        //else letras = strPlural;

      if (resto > 0) letras += '';

      return letras;
    } //Seccion()

    function Miles(num) {
      let divisor = 1000;
      let cientos = Math.floor(num / divisor);
      let resto = num - (cientos * divisor);
      
      let strMiles = Seccion(num, divisor, 'MIL', 'MIL');
      let strCentenas = Centenas(resto);

      if (strMiles == '') return strCentenas;

      return strMiles + ' ' + strCentenas;
    } //Miles()

    function Millones(num) {
      let divisor = 1000000;
      let cientos = Math.floor(num / divisor);
      let resto = num - (cientos * divisor);

      let strMillones = Seccion(num, divisor, 'UN MILLON DE', 'MILLONES DE');
      let strMiles = Miles(resto);

      if (strMillones == '') return strMiles;

      return strMillones + ' ' + strMiles;
    } //Millones()

    return function NumeroALetras(num, currency) {
        currency = currency || {};
        let data = {
            numero: num,
            enteros: Math.floor(num),
            centavos: (((Math.round(num * 100)) - (Math.floor(num) * 100))),
            letrasCentavos: '',
            letrasMonedaPlural: currency.plural, //'PESOS', 'Dólares', 'Bolívares', 'etcs'
            letrasMonedaSingular: currency.singular, //'PESO', 'Dólar', 'Bolivar', 'etc'
            letrasMonedaCentavoPlural: currency.centPlural,
            letrasMonedaCentavoSingular: currency.centSingular
        };

        if (data.centavos > 0) {
            data.letrasCentavos = 'CON ' + (function() {
              if (data.centavos == 1) return Millones(data.centavos) + ' ' + data.letrasMonedaCentavoSingular;
              else return Millones(data.centavos) + ' ' + data.letrasMonedaCentavoPlural;
            })();
        };

        if (data.enteros == 0) return 'CERO ' + data.letrasMonedaPlural + ' ' + data.letrasCentavos;
        if (data.enteros == 1) return Millones(data.enteros) + ' ' + data.letrasMonedaSingular + ' ' + data.letrasCentavos;
        else return Millones(data.enteros) + ' ' + data.letrasMonedaPlural + ' ' + data.letrasCentavos;
    }
  })();

  generarPDF(data : any = ``, trm : number = 0, valor : number = 0){
    let codigoFactura : any = (data.nroFv).replace('0000', '');
    let numInterno : any = `${data.consecBu}(FV-0000${codigoFactura})`;
    let conBu : any = data.consecBu;
    let fechaFactura : any = moment(data.fecha).format('YYYY/MM/DD');
    let horaFactura : string = ``;
    let idCliente : string = `444444025`;
    let nombreCliente : string = `444444025 IMPORTADORA IDEA CA`;
    let direccionCliente : string = `SAN CRISTOBAL, CALLE 12 CRA 15 ESQUINA 11 77`;
    let telefonoCliente : string = `584247037418`;
    let vendedor : string = `VENTA DIRECTA`;
    let zona : string = `99`;
    let moneda : string = `USD`;
    let medioPago : string = `Acuerdo mutuo`;
    let formaPago : string = `Anticipado`;
    let relacionados : string = ``;
    let estado : string = `Procesado`;
    let codigoProducto : string = `30000000223`;
    let nombreProducto : string = `POLIFEN 641 NEAR PRIME Bolsa 1 25`;
    let presentacion : string = `Kg`;
    let bodega : string = `003`;
    let lote : string = `0`;
    let cantidad : number = 34000;
    let precioUnitario : any = (parseFloat(data.precio) / trm) + 0.05;
    let descuento : number = 0;
    let iva : number = 0;
    let inc : number = 0;
    let totalBruto : number = valor;
    let precioTotalLetras : string = this.numeroALetras(totalBruto, {
      plural: "DOLARES",
      singular: "USD",
      centPlural: "CENTAVOS",
      centSingular: "CENTAVO"
    });
    let observaciones : string = ``;
    let totalFinalBruto : number = totalBruto;
    let totalDescuento : number = 0;
    let totalVentaNeta : number = totalBruto;
    let totalIVA : number = 0;
    let totalINC : number = 0;
    let reteFuente : number = 0;
    let reteIva : number = 0;
    let otrosConceptos : number = 0;
    let anticipo : number = 0;
    let totalFacturaElectonica  : number = totalBruto;

    let tituloFactura = `FACTURA DE VENTA_PL${codigoFactura}_800188732`
    const pdfDefinicion: any = {
      info: { title: tituloFactura },
      pageOrientation: 'portrait',
      pageSize: { width: 612, height: 792 },
      pageMargins: [25, 140, 25, 35],
      header: [
        {
          margin: [5, 0, 5, 0],
          columns: [
            { 
              image: logoParaPdf, 
              width: 175, 
              height: 43, 
              margin: [25, 35, 0, 0],
            },
            {
              width: '45%', 
              margin: [25, 20, 0, 10],
              table: {
                widths: ['*'],
                style: 'header',
                body: [
                  [{ border: [false, false, false, false], text: `PLASTICARIBE S.A.S`, alignment: 'center', bold: true, fontSize: 10 }],
                  [{ border: [false, false, false, false], text: `NIT. 800188732-2`, alignment: 'center', }],
                  [{ border: [false, false, false, false], text: `Dirección: CLLE 42 No 52 105`, alignment: 'center', }],
                  [{ border: [false, false, false, false], text: `Teléfonos: 3796970`, alignment: 'center', }],
                  [{ border: [false, false, false, false], text: `Email: gerencia@platicaribe.net`, alignment: 'center', }],
                  [{ border: [false, false, false, false], text: `BARRANQUILLA`, alignment: 'center', }],
                  [{ border: [false, false, false, false], text: `FACTURA ELECTRÓNICA DE VENTA`, alignment: 'center', bold: true, fontSize: 10 }],
                ]
              },
              layout: { defaultBorder: false, },
              fontSize: 8,
              alignment: 'center',
            },
            {
              width: '25%', 
              margin: [60, 80, 0, 0],
              table: {
                widths: ['*'],
                style: 'header',
                body: [
                  [{ border: [false, false, false, false], text: `Fecha de Expedición:`, alignment: 'center', }],
                  [{ border: [false, false, false, false], text: `${fechaFactura}`, alignment: 'center', }],
                  [{ border: [false, false, false, false], text: `${horaFactura}`, alignment: 'center', }],
                ]
              },
              layout: { defaultBorder: false, },
              fontSize: 7,
              alignment: 'right',
            }
          ]
        },
        {
          margin: [25, 0],
          table: {
            widths: ['*'],
            body: [
              [
                {
                  border: [false, true, false, false],
                  text: ''
                },
              ],
            ]
          },
          layout: { defaultBorder: false, }
        },
      ],
      footer: function (currentPage: any, pageCount: any) {
        return [
          '\n',
          {
            columns: [
              { text: `${currentPage.toString()} de ${pageCount}`, alignment: 'right', fontSize: 8, margin: [0, 0, 30, 0] },
            ]
          }
        ]
      },
      content: [
        {
          table: {
            widths: ['45%', '55%'],
            body: [
              [
                {
                  table: {
                    widths: ['25%', '25%', '25%', '25%'],
                    style: '',
                    body: [
                      [
                        {
                          border: [true, true, true, true],
                          fillColor: '#ccc',
                          text: 'No. Factura electrónica de venta:',
                          bold: true
                        },
                        {
                          border: [true, true, true, true],
                          colSpan: 3,
                          text: `PL ${codigoFactura}`,
                        },
                        {},
                        {}
                      ],
                      [
                        {
                          border: [true, true, true, true],
                          fillColor: '#ccc',
                          text: 'N° Interno:',
                          bold: true
                        },
                        { border: [true, true, true, true], text: `${numInterno}`, colSpan: 3 },
                        {},
                        {}
                      ],
                      [
                        {
                          border: [true, true, true, true],
                          fillColor: '#ccc',
                          text: 'BU:',
                          bold: true
                        },
                        { border: [true, true, true, true], text: `Local`},
                        {
                          border: [true, true, true, true],
                          fillColor: '#ccc',
                          text: 'Con BU:',
                          bold: true
                        },
                        { border: [true, true, true, true], text: `${conBu}` },
                      ],
                      [
                        {
                          border: [true, true, true, true],
                          fillColor: '#ccc',
                          text: 'Fecha:',
                          bold: true
                        },
                        { border: [true, true, true, true], text: `${fechaFactura}`, colSpan: 3 },
                        {},
                        {}
                      ]
                    ]
                  },
                  layout: { defaultBorder: false, },
                  fontSize: 8,
                },
                {
                  text: codigoFactura <= 148000 ? `Facturación Electronica-Resolución DIAN No 18764033755318: 2022/08/17 - 2023/08/17 Factura PL 145125 al PL 148000` :
                        `Facturación Electronica-Resolución DIAN No 18764042149038: 2022/12/29 - 2023/12/29 Factura PL 148001 al PL 165000`,
                  fontSize: 7,
                },
              ],
            ]
          },
          layout: { defaultBorder: false, },
          fontSize: 8,
        },
        {
          margin: [5, 5],
          table: {
            widths: ['17%', '17%', '17%', '17%', '17%', '17%', '17%'],
            body: [
              [
                {
                  border: [true, true, true, true],
                  fillColor: '#ccc',
                  text: 'Cliente:',
                  bold: true
                },
                {
                  border: [true, true, true, true],
                  colSpan: 3,
                  text: `${nombreCliente}`,
                },
                {},
                {},
                {
                  border: [true, true, true, true],
                  fillColor: '#ccc',
                  text: 'NIT/CC:',
                  bold: true
                },
                {
                  border: [true, true, true, true],
                  text: `${idCliente}`,
                },
              ],
              [
                {
                  border: [true, true, true, true],
                  fillColor: '#ccc',
                  text: 'Dirección:',
                  bold: true
                },
                {
                  border: [true, true, true, true],
                  colSpan: 3,
                  text: `${direccionCliente}`,
                },
                {},
                {},
                {
                  border: [true, true, true, true],
                  fillColor: '#ccc',
                  text: 'Teléfono:',
                  bold: true
                },
                {
                  border: [true, true, true, true],
                  text: `${telefonoCliente}`,
                },
              ],
              [
                {
                  border: [true, true, true, true],
                  fillColor: '#ccc',
                  text: 'Vendedor:',
                  bold: true
                },
                {
                  border: [true, true, true, true],
                  colSpan: 3,
                  text: `${vendedor}`,
                },
                {},
                {},
                {
                  border: [true, true, true, true],
                  fillColor: '#ccc',
                  text: 'Zona:',
                  bold: true
                },
                {
                  border: [true, true, true, true],
                  text: `${zona}`,
                },
              ],
              [
                {
                  border: [true, true, true, true],
                  fillColor: '#ccc',
                  text: 'Moneda:',
                  bold: true
                },
                {
                  border: [true, true, true, true],
                  text: `${moneda}`,
                },
                {
                  border: [true, true, true, true],
                  fillColor: '#ccc',
                  text: 'Medio De Pago:',
                  bold: true
                },
                {
                  border: [true, true, true, true],
                  text: `${medioPago}`,
                },
                {
                  border: [true, true, true, true],
                  fillColor: '#ccc',
                  text: 'Forma de Pago:',
                  bold: true
                },
                {
                  border: [true, true, true, true],
                  text: `${formaPago}`,
                },
              ],
              [
                {
                  border: [true, true, true, true],
                  fillColor: '#ccc',
                  text: 'Relacionados:',
                  bold: true
                },
                {
                  border: [true, true, true, true],
                  colSpan: 3,
                  text: `${relacionados}`,
                },
                {},
                {},
                {
                  border: [true, true, true, true],
                  fillColor: '#ccc',
                  text: 'Estado:',
                  bold: true
                },
                {
                  border: [true, true, true, true],
                  text: `${estado}`,
                },
              ],
            ]
          },
          layout: { defaultBorder: false, },
          fontSize: 8,
        },
        {
          margin: [5, 5],
          table: {
            widths: ['3%', '6%', '23%', '12%', '7%', '5%', '10%', '7%', '7%', '5%', '5%', '10%'],
            body: [
              [
                {
                  border: [true, true, false, true],
                  fillColor: '#ccc',
                  text: 'No.',
                  bold: true
                },
                {
                  border: [false, true, false, true],
                  fillColor: '#ccc',
                  text: 'Código',
                  bold: true
                },
                {
                  border: [false, true, false, true],
                  fillColor: '#ccc',
                  text: 'Nombre',
                  bold: true
                },
                {
                  border: [false, true, false, true],
                  fillColor: '#ccc',
                  text: 'Presentación',
                  bold: true
                },
                {
                  border: [false, true, false, true],
                  fillColor: '#ccc',
                  text: 'Bodega',
                  alignment: 'right',
                  bold: true
                },
                {
                  border: [false, true, false, true],
                  fillColor: '#ccc',
                  text: 'Lote',
                  bold: true
                },
                {
                  border: [false, true, false, true],
                  fillColor: '#ccc',
                  text: 'Cantidad',
                  alignment: 'right',
                  bold: true
                },
                {
                  border: [false, true, false, true],
                  fillColor: '#ccc',
                  text: 'Precio',
                  alignment: 'right',
                  bold: true
                },
                {
                  border: [false, true, false, true],
                  fillColor: '#ccc',
                  text: '%Dcto',
                  alignment: 'right',
                  bold: true
                },
                {
                  border: [false, true, false, true],
                  fillColor: '#ccc',
                  text: '%IVA',
                  alignment: 'right',
                  bold: true
                },
                {
                  border: [false, true, false, true],
                  fillColor: '#ccc',
                  text: '%INC',
                  alignment: 'right',
                  bold: true
                },
                {
                  border: [false, true, true, true],
                  fillColor: '#ccc',
                  text: 'Total Bruto',
                  alignment: 'right',
                  bold: true
                },
              ],
              [
                {
                  border: [true, true, false, true],
                  text: '1',
                  bold: true,
                },
                {
                  border: [false, true, false, true],
                  text: `${codigoProducto}`,
                  bold: true
                },
                {
                  border: [false, true, false, true],
                  text: `${nombreProducto}`,
                  bold: true
                },
                {
                  border: [false, true, false, true],
                  text: `${presentacion}`,
                  bold: true
                },
                {
                  border: [false, true, false, true],
                  text: `${bodega}`,
                  bold: true,
                  alignment: 'right',
                },
                {
                  border: [false, true, false, true],
                  text: `${lote}`,
                  bold: true,
                  alignment: 'right',
                },
                {
                  border: [false, true, false, true],
                  text: `${this.formatonumeros((cantidad))}`,
                  bold: true,
                  alignment: 'right',
                },
                {
                  border: [false, true, false, true],
                  text: `${this.formatonumeros((precioUnitario).toFixed(2))}`,
                  bold: true,
                  alignment: 'right',
                },
                {
                  border: [false, true, false, true],
                  text: `${this.formatonumeros((descuento))}`,
                  bold: true,
                  alignment: 'right',
                },
                {
                  border: [false, true, false, true],
                  text: `${this.formatonumeros((iva))}`,
                  bold: true,
                  alignment: 'right',
                },
                {
                  border: [false, true, false, true],
                  text: `${this.formatonumeros((inc))}`,
                  bold: true,
                  alignment: 'right',
                },
                {
                  border: [false, true, true, true],
                  text: `USD ${this.formatonumeros((totalBruto))}`,
                  bold: true,
                  alignment: 'right',
                },
              ],
            ]
          },
          layout: { defaultBorder: false, },
          fontSize: 7,
        },
        {
          margin: [5, 5],
          table: {
            widths: ['65%', '20%', '15%'],
            body: [
              [
                {
                  border: [true, true, true, true],
                  text: `Son: ${precioTotalLetras}`,
                  rowSpan: 3
                },
                {
                  border: [true, true, true, true],
                  fillColor: '#ccc',
                  text: 'Total Bruto',
                  bold: true
                },
                {
                  border: [true, true, true, true],
                  text: `USD ${this.formatonumeros((totalFinalBruto))}`,
                  bold: true,
                  alignment: 'right'
                },
              ],
              [
                {},
                {
                  border: [true, true, true, true],
                  fillColor: '#ccc',
                  text: 'Total Descuento',
                  bold: true
                },
                {
                  border: [true, true, true, true],
                  text: `${this.formatonumeros((totalDescuento))}`,
                  bold: true,
                  alignment: 'right'
                },
              ],
              [
                {},
                {
                  border: [true, true, true, true],
                  fillColor: '#ccc',
                  text: 'Total Venta Neta',
                  bold: true
                },
                {
                  border: [true, true, true, true],
                  text: `USD ${this.formatonumeros((totalVentaNeta))}`,
                  bold: true,
                  alignment: 'right'
                },
              ],
              [
                {
                  border: [true, true, true, true],
                  text: 'Observaciones:',
                  bold: true
                },
                {
                  border: [true, true, true, true],
                  fillColor: '#ccc',
                  text: 'Total IVA',
                  bold: true
                },
                {
                  border: [true, true, true, true],
                  text: `${this.formatonumeros((totalIVA))}`,
                  bold: true,
                  alignment: 'right'
                },
              ],
              [
                {
                  border: [true, true, true, true],
                  text: `${observaciones}`,
                  rowSpan: 6
                },
                {
                  border: [true, true, true, true],
                  fillColor: '#ccc',
                  text: 'Total INC',
                  bold: true
                },
                {
                  border: [true, true, true, true],
                  text: `${this.formatonumeros((totalINC))}`,
                  bold: true,
                  alignment: 'right'
                },
              ],
              [
                {},
                {
                  border: [true, true, true, true],
                  fillColor: '#ccc',
                  text: 'ReteFuente',
                  bold: true
                },
                {
                  border: [true, true, true, true],
                  text: `${this.formatonumeros((reteFuente))}`,
                  bold: true,
                  alignment: 'right'
                },
              ],
              [
                {},
                {
                  border: [true, true, true, true],
                  fillColor: '#ccc',
                  text: 'ReteIva',
                  bold: true
                },
                {
                  border: [true, true, true, true],
                  text: `${this.formatonumeros((reteIva))}`,
                  bold: true,
                  alignment: 'right'
                },
              ],
              [
                {},
                {
                  border: [true, true, true, true],
                  fillColor: '#ccc',
                  text: 'Otros Conceptos',
                  bold: true
                },
                {
                  border: [true, true, true, true],
                  text: `${this.formatonumeros((otrosConceptos))}`,
                  bold: true,
                  alignment: 'right'
                },
              ],
              [
                {},
                {
                  border: [true, true, true, true],
                  fillColor: '#ccc',
                  text: 'Anticipo',
                  bold: true
                },
                {
                  border: [true, true, true, true],
                  text: `${this.formatonumeros((anticipo))}`,
                  bold: true,
                  alignment: 'right'
                },
              ],
              [
                {},
                {
                  border: [true, true, true, true],
                  fillColor: '#ccc',
                  text: 'Total Factura Electonica',
                  bold: true
                },
                {
                  border: [true, true, true, true],
                  text: `USD ${this.formatonumeros((totalFacturaElectonica))}`,
                  bold: true,
                  alignment: 'right'
                },
              ]
            ]
          },
          layout: { defaultBorder: false, },
          fontSize: 8,
        },
        {
          margin: [45, 0],
          text: `Esta factura electrónica de venta Cambiaria se asimila para todos los efectos legales a la letra de cambio, conforme al articulo 774 del codigo de comercio.
          El comprador declara haber recibido todas las mercancias antes descritas y enumeradas, a las cuales aplican las garantias ofertadas separadamente por escrito. La mora
           en el pago ocasionara intereses sobre saldos a la tasa mas alta permitida, sin perjuicio de las acciones ejecutivas pertinentes
          `,
          alignment: 'center',
          fontSize: 6
        },
        {
          table: {
            widths: ['30%', '5%', '30%', '5%', '30%'],
            body: [
              [
                {
                  border: [false, false, false, true],
                  text: `SISTEMAS`,
                  bold: true,
                  alignment: 'center'
                },
                {},
                {
                  border: [false, false, false, true],
                  text: ``,
                  bold: true,
                  alignment: 'center'
                },
                {},
                {
                  border: [false, false, false, true],
                  text: ``,
                  bold: true,
                  alignment: 'center'
                },
              ],
              [
                {
                  border: [false, false, false, false],
                  text: `Elaborado Por`,
                  bold: true,
                  alignment: 'center'
                },
                {},
                {
                  border: [false, false, false, false],
                  text: `Firma Autorizada`,
                  bold: true,
                  alignment: 'center'
                },
                {},
                {
                  border: [false, false, false, false],
                  text: `Firma y sello del cliente`,
                  bold: true,
                  alignment: 'center'
                },
              ],
              [
                {},
                {},
                {},
                {},
                {},
              ],
              [
                {
                  border: [false, false, false, false],
                  text: `Factura electrónica de venta emitida por el software Zeus Nit: 806.009.752-5 /
                  Zeus Tecnologia S.A. / Proveedor tecnologico Facture S.A.S Nit: 900399741 - 7`,
                  colSpan: 4,
                  fontSize: 7,
                },
                {},
                {},
                {},
                {
                  border: [false, false, false, false],
                  text: `Nombre, C.C y Sello de quien recibe
                  Fecha de Recibido:`,
                  fontSize: 7,
                },
              ],        
            ]
          },
          layout: { defaultBorder: false, },
          fontSize: 8,
        }
      ]
    }
    const pdf = pdfMake.createPdf(pdfDefinicion);
    pdf.download(tituloFactura);
  }
}
