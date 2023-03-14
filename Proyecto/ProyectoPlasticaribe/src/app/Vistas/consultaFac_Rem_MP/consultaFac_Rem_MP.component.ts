import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder} from '@angular/forms';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import pdfMake from 'pdfmake/build/pdfmake';
import { FacturaMpService } from 'src/app/Servicios/DetallesFacturaMateriaPrima/facturaMp.service';
import { ProveedorService } from 'src/app/Servicios/Proveedor/proveedor.service';
import { RemisionesMPService } from 'src/app/Servicios/DetallesRemisiones/remisionesMP.service';
import { RolesService } from 'src/app/Servicios/Roles/roles.service';
import { TipoDocumentoService } from 'src/app/Servicios/TipoDocumento/tipoDocumento.service';
import Swal from 'sweetalert2';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';

@Component({
  selector: 'app-consultaFac_Rem_MP',
  templateUrl: './consultaFac_Rem_MP.component.html',
  styleUrls: ['./consultaFac_Rem_MP.component.css']
})
export class ConsultaFac_Rem_MPComponent implements OnInit {

  public FormDocumentos !: FormGroup;

  /* Vaiables*/
  public page : number; //Variable que tendrá el paginado de la tabla en la que se muestran los pedidos consultados
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  titulosTabla = []; //Variable que almacenará los titulos de la tabla de productos que se ve al final de la vista
  ArrayDocumento : any [] = []; //Variable que tendrá la informacion de los productos que se piden en el nuevo pedido
  valorTotal : number = 0; //Variable que guardará el valor total de la factura de entrada de materia prima
  tipoDocumento = [];
  proveedor = [];
  documentoInfo = [];
  mpAgregada = [];
  remision : any = [];
  remConFac : any = [];
  load: boolean = true;;

  constructor(private rolService : RolesService,
                private frmBuilderMateriaPrima : FormBuilder,
                  @Inject(SESSION_STORAGE) private storage: WebStorageService,
                    private tipoDocuemntoService : TipoDocumentoService,
                      private proveedorService : ProveedorService,
                        private remisionMpService : RemisionesMPService,
                          private facturaCompraMPService : FacturaMpService,) {

    this.FormDocumentos = this.frmBuilderMateriaPrima.group({
      idDocumento : [null],
      TipoDocumento: [null],
      proveedorNombre : [null],
      proveedorId : [null],
      fecha: [null],
      fechaFinal : [null]
    });
  }


  ngOnInit(): void {
    this.lecturaStorage();
    this.ColumnasTabla();
    this.obtenerTipoDocumento();
  }

  LimpiarCampos() {
    this.FormDocumentos.reset();
    this.ArrayDocumento = [];
    this.valorTotal = 0;
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = '$1,';
    return number.toString().replace(exp,rep);
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.storage.get('Id');
    this.storage_Nombre = this.storage.get('Nombre');
    this.ValidarRol = this.storage.get('Rol');
  }

  //
  obtenerTipoDocumento(){
    this.tipoDocuemntoService.srvObtenerLista().subscribe(datos_tiposDocumentos => {
      for (let index = 0; index < datos_tiposDocumentos.length; index++) {
        if (datos_tiposDocumentos[index].tpDoc_Id == 'REM' || datos_tiposDocumentos[index].tpDoc_Id == 'FCO') this.tipoDocumento.push(datos_tiposDocumentos[index])
      }
    });
  }

  //Funcion que va a consultar los proveedores por el nombre que esten escribiendo en el campo de proveedor
  consultarProveedores(){
    this.proveedor = [];
    let nombre : string = this.FormDocumentos.value.proveedorNombre.trim();
    if (nombre != '') {
      this.proveedorService.getProveedorLike(nombre).subscribe(datos_Proveedores => {
        for (let i = 0; i < datos_Proveedores.length; i++) {
          this.proveedor.push(datos_Proveedores[i]);
        }
      });
    }
  }

  // Funcion que le va a cambiar el nombre al proveedor
  cambiarNombreProveedor(){
    let id : number = this.FormDocumentos.value.proveedorNombre;
    this.proveedorService.srvObtenerListaPorId(id).subscribe(datos_proveedor => {
      this.FormDocumentos = this.frmBuilderMateriaPrima.group({
        idDocumento : this.FormDocumentos.value.idDocumento,
        TipoDocumento: this.FormDocumentos.value.TipoDocumento,
        proveedorNombre : `${datos_proveedor.prov_Id} - ${datos_proveedor.prov_Nombre}`,
        proveedorId : datos_proveedor.prov_Id,
        fecha: this.FormDocumentos.value.fecha,
        fechaFinal : this.FormDocumentos.value.fechaFinal,
      });
    });
  }

  //Funcion que colocará el nombre a las columnas de la tabla en la cual se muestran los productos pedidos por los clientes
  ColumnasTabla(){
    this.titulosTabla = [];
    this.titulosTabla = [{
      idFact : "Id",
      tipo : "Tipo de Documento",
      FechaFact : "Fecha Registro",
      proveedor : "Proveedor",
      Costo : "Costo Total",
      Ver : "Ver",
    }]
  }

  //
  validarConsulta(){
    this.ArrayDocumento = [];
    this.remision = [];
    this.remConFac = [];
    let idDoc : number = this.FormDocumentos.value.idDocumento;
    let fecha : any = this.FormDocumentos.value.fecha;
    let fechaFinal : any = this.FormDocumentos.value.fechaFinal;
    let TipoDocumento : string = this.FormDocumentos.value.TipoDocumento;
    let proveedores : any = this.FormDocumentos.value.proveedorId;

    if (idDoc != null && fecha != null && fechaFinal != null && TipoDocumento != null && proveedores != null) {
      this.facturaCompraMPService.GetEntradaFacRem_Codigo(idDoc).subscribe(datos_entradas => {
        for (let i = 0; i < datos_entradas.length; i++) {
          if (datos_entradas[i].tipo_Doc == TipoDocumento
            && moment(datos_entradas[i].fecha).isBetween(fecha, fechaFinal)
            && proveedores == datos_entradas[i].proveedor_Id) this.lenarTabla(datos_entradas[i]);
        }
      });
    } else if (idDoc != null && fecha != null && fechaFinal != null && TipoDocumento != null) {
      this.facturaCompraMPService.GetEntradaFacRem_Codigo(idDoc).subscribe(datos_entradas => {
        for (let i = 0; i < datos_entradas.length; i++) {
          if (datos_entradas[i].tipo_Doc == TipoDocumento
            && moment(datos_entradas[i].fecha).isBetween(fecha, fechaFinal)) this.lenarTabla(datos_entradas[i]);
        }
      });
    } else if (idDoc != null && fecha != null && fechaFinal != null && proveedores != null) {
      this.facturaCompraMPService.GetEntradaFacRem_Codigo(idDoc).subscribe(datos_entradas => {
        for (let i = 0; i < datos_entradas.length; i++) {
          if (moment(datos_entradas[i].fecha).isBetween(fecha, fechaFinal)
            && proveedores == datos_entradas[i].proveedor_Id) this.lenarTabla(datos_entradas[i]);
        }
      });
    } else if (fecha != null && fechaFinal != null && TipoDocumento != null && proveedores != null) {
      this.facturaCompraMPService.GetEntradaFacRem_FechasTipoDocProveedor(fecha, fechaFinal, TipoDocumento, proveedores).subscribe(datos_entradas => {
        for (let i = 0; i < datos_entradas.length; i++) {
          this.lenarTabla(datos_entradas[i]);
        }
      });
    } else if (idDoc != null && fecha != null && TipoDocumento != null && proveedores != null) {
      this.facturaCompraMPService.GetEntradaFacRem_Codigo(idDoc).subscribe(datos_entradas => {
        for (let i = 0; i < datos_entradas.length; i++) {
          if (datos_entradas[i].tipo_Doc == TipoDocumento
            && datos_entradas[i].fecha == fecha
            && proveedores == datos_entradas[i].proveedor_Id) this.lenarTabla(datos_entradas[i]);
        }
      });
    } else if (idDoc != null && TipoDocumento != null && proveedores != null) {
      this.facturaCompraMPService.GetEntradaFacRem_Codigo(idDoc).subscribe(datos_entradas => {
        for (let i = 0; i < datos_entradas.length; i++) {
          if (datos_entradas[i].tipo_Doc == TipoDocumento
            && proveedores == datos_entradas[i].proveedor_Id) this.lenarTabla(datos_entradas[i]);
        }
      });
    } else if (idDoc != null && fecha != null && fechaFinal) {
      this.facturaCompraMPService.GetEntradaFacRem_Codigo(idDoc).subscribe(datos_entradas => {
        for (let i = 0; i < datos_entradas.length; i++) {
          if (moment(datos_entradas[i].fecha).isBetween(fecha, fechaFinal)) this.lenarTabla(datos_entradas[i]);
        }
      });
    } else if (idDoc != null && fecha != null && proveedores != null) {
      this.facturaCompraMPService.GetEntradaFacRem_Codigo(idDoc).subscribe(datos_entradas => {
        for (let i = 0; i < datos_entradas.length; i++) {
          if (datos_entradas[i].fecha = fecha
            && proveedores == datos_entradas[i].proveedor_Id) this.lenarTabla(datos_entradas[i]);
        }
      });
    } else if (idDoc != null && fecha != null && TipoDocumento != null) {
      this.facturaCompraMPService.GetEntradaFacRem_Codigo(idDoc).subscribe(datos_entradas => {
        for (let i = 0; i < datos_entradas.length; i++) {
          if (datos_entradas[i].tipo_Doc == TipoDocumento
            && moment(datos_entradas[i].fecha).isBetween(fecha, fechaFinal)
            && proveedores == datos_entradas[i].proveedor_Id) this.lenarTabla(datos_entradas[i]);
        }
      });
    } else if (fecha != null && fechaFinal != null && TipoDocumento != null) {
      this.facturaCompraMPService.GetEntradaFacRem_Fechas(fecha, fechaFinal).subscribe(datos_entradas => {
        for (let i = 0; i < datos_entradas.length; i++) {
          if (datos_entradas[i].tipo_Doc == TipoDocumento) this.lenarTabla(datos_entradas[i]);
        }
      });
    } else if (fecha != null && fechaFinal != null && proveedores != null) {
      this.facturaCompraMPService.GetEntradaFacRem_Fechas(fecha, fechaFinal).subscribe(datos_entradas => {
        for (let i = 0; i < datos_entradas.length; i++) {
          if (datos_entradas[i].proveedor_Id == proveedores) this.lenarTabla(datos_entradas[i]);
        }
      });
    } else if (fecha != null  && TipoDocumento != null && proveedores != null) {
      this.facturaCompraMPService.GetEntradaFacRem_Fechas(fecha, fecha).subscribe(datos_entradas => {
        for (let i = 0; i < datos_entradas.length; i++) {
          if (datos_entradas[i].proveedor_Id == proveedores
            && datos_entradas[i].tipo_Doc == TipoDocumento) this.lenarTabla(datos_entradas[i]);
        }
      });
    } else if (idDoc != null && fecha != null) {
      this.facturaCompraMPService.GetEntradaFacRem_Codigo(idDoc).subscribe(datos_entradas => {
        for (let i = 0; i < datos_entradas.length; i++) {
           if (datos_entradas[i].fecha == fecha) this.lenarTabla(datos_entradas[i]);
        }
      });
    } else if (idDoc != null && TipoDocumento != null) {
      this.facturaCompraMPService.GetEntradaFacRem_Codigo(idDoc).subscribe(datos_entradas => {
        for (let i = 0; i < datos_entradas.length; i++) {
           if (datos_entradas[i].tipo_Doc == TipoDocumento) this.lenarTabla(datos_entradas[i]);
        }
      });
    } else if (idDoc != null && proveedores != null) {
      this.facturaCompraMPService.GetEntradaFacRem_Codigo(idDoc).subscribe(datos_entradas => {
        for (let i = 0; i < datos_entradas.length; i++) {
          if (datos_entradas[i].proveedor_Id == proveedores) this.lenarTabla(datos_entradas[i]);
        }
      });
    } else if (fecha != null && fechaFinal != null) {
      this.facturaCompraMPService.GetEntradaFacRem_Fechas(fecha, fechaFinal).subscribe(datos_entradas => {
        for (let i = 0; i < datos_entradas.length; i++) {
          this.lenarTabla(datos_entradas[i]);
        }
      });
    } else if (fecha != null && TipoDocumento != null) {
      this.facturaCompraMPService.GetEntradaFacRem_Fechas(fecha, fecha).subscribe(datos_entradas => {
        for (let i = 0; i < datos_entradas.length; i++) {
          if (datos_entradas[i].tipo_Doc == TipoDocumento) this.lenarTabla(datos_entradas[i]);
        }
      });
    } else if (fecha != null && proveedores != null) {
      this.facturaCompraMPService.GetEntradaFacRem_Fechas(fecha, fecha).subscribe(datos_entradas => {
        for (let i = 0; i < datos_entradas.length; i++) {
          if (datos_entradas[i].proveedor_Id == proveedores) this.lenarTabla(datos_entradas[i]);
        }
      });
    } else if (TipoDocumento != null && proveedores != null) {
      this.facturaCompraMPService.GetEntradaFacRem_Proveedor(proveedores).subscribe(datos_entradas => {
        for (let i = 0; i < datos_entradas.length; i++) {
          if (datos_entradas[i].tipo_Doc == TipoDocumento) this.lenarTabla(datos_entradas[i]);
        }
      });
    } else if (idDoc != null) {
      this.facturaCompraMPService.GetEntradaFacRem_Codigo(idDoc).subscribe(datos_entradas => {
        for (let i = 0; i < datos_entradas.length; i++) {
          this.lenarTabla(datos_entradas[i]);
        }
      });
    } else if (fecha != null) {
      this.facturaCompraMPService.GetEntradaFacRem_Fechas(fecha, fecha).subscribe(datos_entradas => {
        for (let i = 0; i < datos_entradas.length; i++) {
          this.lenarTabla(datos_entradas[i]);
        }
      });
    } else if (TipoDocumento != null) {
      this.facturaCompraMPService.GetEntradaFacRem_Fechas(this.today, this.today).subscribe(datos_entradas => {
        for (let i = 0; i < datos_entradas.length; i++) {
          if (datos_entradas[i].tipo_Doc == TipoDocumento) this.lenarTabla(datos_entradas[i]);
        }
      });
    } else if (proveedores != null) {
      this.facturaCompraMPService.GetEntradaFacRem_Proveedor(proveedores).subscribe(datos_entradas => {
        for (let i = 0; i < datos_entradas.length; i++) {
          this.lenarTabla(datos_entradas[i]);
        }
      });
    } else {
      this.facturaCompraMPService.GetEntradaFacRem_Fechas(this.today, this.today).subscribe(datos_entradas => {
        for (let i = 0; i < datos_entradas.length; i++) {
          this.lenarTabla(datos_entradas[i]);
        }
      });
    }
  }

  //
  lenarTabla(formulario : any){
    const infoDoc : any = {
      id : formulario.id,
      codigo : formulario.codigo,
      tipoDoc : formulario.nombre_Doc,
      fecha : formulario.fecha,
      proveedor : formulario.proveedor_Id,
      subTotal : formulario.valor,
    }
    this.ArrayDocumento.push(infoDoc);
    this.ArrayDocumento.sort((a,b) => b.fecha.localeCompare(a.fecha));
    this.proveedorService.srvObtenerListaPorId(infoDoc.proveedor).subscribe(datos_proveedor => {
      infoDoc.proveedor = datos_proveedor.prov_Nombre;
    });
    this.load = true;
  }

  // Funcion que llena el array con los productos que pertenecen al pedido que se consulta
  llenarDocumento(formulario : any){
    this.documentoInfo = [];
    this.load = false;
    if (formulario.tipoDoc == 'Factura') {
      this.facturaCompraMPService.srvObtenerpdfMovimientos(formulario.codigo).subscribe(datos_factura => {
        for (let i = 0; i < datos_factura.length; i++) {
          let items : any = {
            Id : datos_factura[i].matPri_Id,
            Nombre : datos_factura[i].matPri_Nombre,
            Cant : this.formatonumeros(datos_factura[i].faccoMatPri_Cantidad),
            UndCant : datos_factura[i].undMed_Id,
            PrecioUnd : this.formatonumeros(datos_factura[i].faccoMatPri_ValorUnitario),
            SubTotal : this.formatonumeros(datos_factura[i].faccoMatPri_Cantidad * datos_factura[i].faccoMatPri_ValorUnitario),
          }
          this.documentoInfo.push(items);
        }
        setTimeout(() => { this.llenarPDFConBD(formulario); }, 2000);
      });
    } else if (formulario.tipoDoc == 'Remision') {
      this.remisionMpService.srvObtenerpdfMovimientos(formulario.codigo).subscribe(datos_remision => {
        for (let i = 0; i < datos_remision.length; i++) {
          let items : any = {
            Id : datos_remision[i].matPri_Id,
            Nombre : datos_remision[i].matPri_Nombre,
            Cant : this.formatonumeros(datos_remision[i].remiMatPri_Cantidad),
            UndCant : datos_remision[i].undMed_Id,
            PrecioUnd : this.formatonumeros(datos_remision[i].remiMatPri_ValorUnitario),
            SubTotal : this.formatonumeros(datos_remision[i].remiMatPri_Cantidad * datos_remision[i].remiMatPri_ValorUnitario),
          }
          this.documentoInfo.push(items);
        }
        setTimeout(() => { this.llenarPDFConBD(formulario); }, 2000);
      });
    }
  }

  // funcion que se encagará de llenar la tabla de los productos en el pdf
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

  // Funcion que genera la tabla donde se mostrará la información de los productos pedidos
  table(data, columns) {
    return {
      table: {
        headerRows: 1,
        widths: [30, '*', 70, 50, 50, 80],
        body: this.buildTableBody(data, columns),
      },
      fontSize: 9,
      layout: {
        fillColor: function (rowIndex, node, columnIndex) {
          return (rowIndex == 0) ? '#CCCCCC' : null;
        }
      }
    };
  }

  // Funcion para llenar el pdf con información de la base de datos dependiendo el pedido
  llenarPDFConBD(formulario : any){
    let nombre : string = this.storage.get('Nombre');
    if (formulario.tipoDoc == 'Factura') {
      this.facturaCompraMPService.srvObtenerpdfMovimientos(formulario.codigo).subscribe(datos_factura => {
        for (let i = 0; i < datos_factura.length; i++) {
          for (let mp = 0; mp < this.documentoInfo.length; mp++) {
            const pdfDefinicion : any = {
              info: { title: `${formulario.codigo}` },
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
                    { image : logoParaPdf, width : 220, height : 50 },
                    { text: `Plasticaribe S.A.S ---- Factura de Compra de Materia Prima`, alignment: 'center', style: 'titulo', margin: 30 }
                  ]
                },
                '\n \n',
                {
                  text: `Fecha de registro: ${datos_factura[i].facco_FechaFactura.replace('T00:00:00', '')}`,
                  style: 'header',
                  alignment: 'right',
                },
                {
                  text: `Registrado Por: ${datos_factura[i].usua_Nombre}\n`,
                  alignment: 'right',
                  style: 'header',
                },
                {
                  text: `\n Información detallada del Proveedor \n \n`,
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
                        `ID: ${datos_factura[i].prov_Id}`,
                        `Tipo de ID: ${datos_factura[i].tipoIdentificacion_Id}`,
                        `Tipo de Proveedor: ${datos_factura[i].tpProv_Nombre}`
                      ],
                      [
                        `Nombre: ${datos_factura[i].prov_Nombre}`,
                        `Telefono: ${datos_factura[i].prov_Telefono}`,
                        `Ciudad: ${datos_factura[i].prov_Ciudad}`
                      ],
                      [
                        `E-mail: ${datos_factura[i].prov_Email}`,
                        ``,
                        ``
                      ]
                    ]
                  },
                  layout: 'lightHorizontalLines',
                  fontSize: 9,
                },
                {
                  text: `\n \nObervación sobre la factura: \n ${datos_factura[i].facco_Observacion}\n`,
                  style: 'header',
                },
                {
                  text: `\n Información detallada de Materia(s) Prima(s) comprada(s) \n `,
                  alignment: 'center',
                  style: 'header'
                },

                this.table(this.documentoInfo, ['Id', 'Nombre', 'Cant', 'UndCant', 'PrecioUnd', 'SubTotal']),

                {
                  text: `\n\nValor Total Factura: $${this.formatonumeros(datos_factura[i].facco_ValorTotal)}`,
                  alignment: 'right',
                  style: 'header',
                }
              ],
              styles: {
                header: { fontSize: 8, bold: true },
                titulo: { fontSize: 15, bold: true }
              }
            }
            const pdf = pdfMake.createPdf(pdfDefinicion);
            pdf.open();
            this.load = true;
            break;
          }
          break;
        }
      });
    } else if (formulario.tipoDoc == 'Remision') {
      this.remisionMpService.srvObtenerpdfMovimientos(formulario.codigo).subscribe(datos_remision => {
        for (let i = 0; i < datos_remision.length; i++) {
          for (let j = 0; j < this.documentoInfo.length; j++) {
            const pdfDefinicion : any = {
              info: {
                title: `${formulario.codigo}`
              },
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
                      text: `Plasticaribe S.A.S ---- Remisión de Compra de Materia Prima`,
                      alignment: 'center',
                      style: 'titulo',
                      margin: 30
                    }
                  ]
                },
                '\n \n',
                {
                  text: `Fecha de registro: ${datos_remision[i].rem_Fecha.replace('T00:00:00', '')}`,
                  style: 'header',
                  alignment: 'right',
                },
                {
                  text: `Registrado Por: ${datos_remision[i].usua_Nombre}\n`,
                  alignment: 'right',
                  style: 'header',
                },
                {
                  text: `\n Información detallada del Proveedor \n \n`,
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
                        `ID: ${datos_remision[i].prov_Id}`,
                        `Tipo de ID: ${datos_remision[i].tipoIdentificacion_Id}`,
                        `Tipo de Proveedor: ${datos_remision[i].tpProv_Nombre}`
                      ],
                      [
                        `Nombre: ${datos_remision[i].prov_Nombre}`,
                        `Telefono: ${datos_remision[i].prov_Telefono}`,
                        `Ciudad: ${datos_remision[i].prov_Ciudad}`
                      ],
                      [
                        `E-mail: ${datos_remision[i].prov_Email}`,
                        ``,
                        ``
                      ]
                    ]
                  },
                  layout: 'lightHorizontalLines',
                  fontSize: 9,
                },
                {
                  text: `\n \nObervación sobre la remisión: \n ${datos_remision[i].rem_Observacion}\n`,
                  style: 'header',
                },
                {
                  text: `\n Información detallada de Materia(s) Prima(s) comprada(s) \n `,
                  alignment: 'center',
                  style: 'header'
                },

                this.table(this.documentoInfo, ['Id', 'Nombre', 'Cant', 'UndCant', 'PrecioUnd', 'SubTotal']),
              ],
              styles: {
                header: {
                  fontSize: 8,
                  bold: true
                },
                titulo: {
                  fontSize: 15,
                  bold: true
                }
              }
            }
            const pdf = pdfMake.createPdf(pdfDefinicion);
            pdf.open();
            this.load = true;
            break;
          }
          break;
        }
      });
    }
  }

  //
  organizacionPrecioDblClick(){
    this.ArrayDocumento.sort((a,b)=> Number(b.subTotal) - Number(a.subTotal));
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    });
    Toast.fire({
      icon: 'warning',
      title: 'Ordenado por "Precio Total" de mayor a menor'
    });
  }

  //Funcion que organiza los campos de la tabla de pedidos de menor a mayor
  organizacionPrecio(){
    this.ArrayDocumento.sort((a,b)=> Number(a.subTotal) - Number(b.subTotal));
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    });
    Toast.fire({
      icon: 'warning',
      title: 'Ordenado por "Precio Total" de menor a mayor'
    });
  }
}
