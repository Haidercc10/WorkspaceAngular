import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShepherdService } from 'angular-shepherd';
import moment from 'moment';
import pdfMake from 'pdfmake/build/pdfmake';
import { modelFacturasInvergoalInversuez } from 'src/app/Modelo/modelFacturasInvergoalInversuez';
import { Facturas_Invergoal_InversuezService } from 'src/app/Servicios/Facturas_Invergoal_Inversuez/Facturas_Invergoal_Inversuez.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { ProveedorService } from 'src/app/Servicios/Proveedor/proveedor.service';
import { AppComponent } from 'src/app/app.component';
import { defaultStepOptions, stepsBodegas as defaultSteps } from 'src/app/data';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';

@Component({
  selector: 'app-Facturas_Invergoal_Inversuez',
  templateUrl: './Facturas_Invergoal_Inversuez.component.html',
  styleUrls: ['./Facturas_Invergoal_Inversuez.component.css']
})
export class Facturas_Invergoal_InversuezComponent implements OnInit {

  cargando : boolean = false; //Variable para validar que salga o no la imagen de carga
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro

  FormFacturas !: FormGroup;
  proveedores : any [] = [];
  facturas_Ingresar : any [] = [];
  Empresas : any [] = [];
  
  constructor(private AppComponent : AppComponent,
                private frmBuilder : FormBuilder,
                  private msj : MensajesAplicacionService,
                    private shepherdService: ShepherdService,
                      private proveedorService : ProveedorService,
                        private facturasService : Facturas_Invergoal_InversuezService,) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;

    this.FormFacturas = this.frmBuilder.group({
      Empresa : [null, Validators.required],
      Codigo : [null, Validators.required],
      Fecha : [null, Validators.required],
      Vencimiento : [null, Validators.required],
      Proveedor : [null, Validators.required],
      Valor : [null, Validators.required],
      Cuenta : [null, Validators.required],
      Observaciones : [''],
    });
  }

  ngOnInit() {
    this.lecturaStorage();
    this.cargarProveedores();
    this.cargarEmpresas();
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number : any) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }
  
  // Funcion que va a hacer que se inicie el tutorial in-app
  tutorial(){
    this.shepherdService.defaultStepOptions = defaultStepOptions;
    this.shepherdService.modal = true;
    this.shepherdService.confirmCancel = false;
    this.shepherdService.addSteps(defaultSteps);
    this.shepherdService.start();
  }

  // Funcion que se encargará de cargar las empresas
  cargarEmpresas() {
    this.Empresas = [
      { Id : '900362200', Nombre : 'INVERGOAL SAS' },
      { Id : '900458314', Nombre : 'INVERSUEZ SAS' }
    ]
  }

  // Funcion que va a resetear el formulario
  resetForm = () => this.FormFacturas.reset();

  // Funcion que va a limpiar todo
  limpiarTodo(){
    this.facturas_Ingresar = [];
    this.resetForm();
    this.cargando = false;
  }

  // Funcion que va a cargar la informacion de los proveedores
  cargarProveedores = () => this.proveedorService.srvObtenerLista().subscribe((data : any) => this.proveedores = data);

  // Funcion que va a añadir un dato del formulario al arreglo de facturas
  addFactura(){
    this.facturas_Ingresar.push({
      Empresa_Id : this.FormFacturas.value.Empresa,
      Empresa : this.Empresas.filter(item => item.Id == this.FormFacturas.value.Empresa)[0].Nombre,
      Codigo : this.FormFacturas.value.Codigo,
      Fecha : moment(this.FormFacturas.value.Fecha).format('YYYY-MM-DD'),
      Vencimiento : moment(this.FormFacturas.value.Vencimiento).format('YYYY-MM-DD'),
      Proveedor_Id : this.FormFacturas.value.Proveedor,
      Proveedor : this.proveedores.filter(item => item.prov_Id == this.FormFacturas.value.Proveedor)[0].prov_Nombre,
      Valor : this.FormFacturas.value.Valor,
      Cuenta : this.FormFacturas.value.Cuenta,
    });
    this.resetForm();
  }

  // Funcion que va a eliminar un dato del arreglo de facturas
  deleteFactura = (data : any) => this.facturas_Ingresar.splice(this.facturas_Ingresar.findIndex(x => x == data), 1);

  // Funcion que va a guardar las facturas
  guardarFacturas(){
    let ingresos : number = 0;
    this.facturas_Ingresar.forEach(factura => {
      this.cargando = true;
      const datos : modelFacturasInvergoalInversuez = {
        Fecha_Registro: this.today,
        Hora_Registro: moment().format('HH:mm:ss'),
        Usua_Id: this.storage_Id,
        Nit_Empresa: factura.Empresa_Id,
        Nombre_Empresa: factura.Empresa,
        Codigo_Factura: factura.Codigo,
        Nit_Proveedor: factura.Proveedor_Id,
        Fecha_Factura: factura.Fecha,
        Fecha_Vencimiento: factura.Vencimiento,
        Valor_Factura: factura.Valor,
        Cuenta: factura.Cuenta,
        Estado_Factura: 2,
        Observacion: this.FormFacturas.value.Observaciones == null ? '' : this.FormFacturas.value.Observaciones.toUpperCase(),
      };
      this.facturasService.Post(datos).subscribe(() => {
        ingresos += 1;
        if (ingresos == this.facturas_Ingresar.length) {
          this.msj.mensajeConfirmacion("Guardado exitoso", ``);
          this.crearPdf();
          this.limpiarTodo();
        }
      }, (error : any) => {
        this.msj.mensajeError("Error al guardar", `${error.error}`);
        this.cargando = false;
      });
    });
  }

  // Crear PDF
  crearPdf(){
    let nombre : string = this.storage_Nombre;
    let infoAgrupada : any = [];
    const titulo : string = `Facturas Proveedores`;
    let total : number = 0;
    const pdfDefinicion : any = {
      info: { title: titulo },
      pageSize: { width: 630, height: 760 },
      watermark: { text: 'PLASTICARIBE SAS', color: 'red', opacity: 0.05, bold: true, italics: false },
      pageMargins : [25, 140, 25, 15],
      header: function(currentPage : any, pageCount : any) {
        return [
          {
            margin: [20, 8, 20, 0],
            columns: [
              { image : logoParaPdf, width : 150, height : 30, margin: [20, 25] },
              {
                width: 300,
                alignment: 'center',
                table: {
                  body: [
                    [{text: 'NIT. 800188732', bold: true, alignment: 'center', fontSize: 10}],
                    [{text: `Fecha de Análizis: ${moment().format('YYYY-MM-DD')}`, alignment: 'center', fontSize: 8}],
                    [{text: titulo, bold: true, alignment: 'center', fontSize: 10}],
                  ]
                },
                layout: 'noBorders',
                margin: [85, 20],
              },
              {
                width: '*',
                alignment: 'center',
                margin: [20, 20, 20, 0],
                table: {
                  body: [
                    [{text: `Pagina: `, alignment: 'left', fontSize: 8, bold: true}, { text: `${currentPage.toString() + ' de ' + pageCount}`, alignment: 'left', fontSize: 8, margin: [0, 0, 30, 0] }],
                    [{text: `Fecha: `, alignment: 'left', fontSize: 8, bold: true}, {text: moment().format('YYYY-MM-DD'), alignment: 'left', fontSize: 8, margin: [0, 0, 30, 0] }],
                    [{text: `Hora: `, alignment: 'left', fontSize: 8, bold: true}, {text: moment().format('H:mm:ss'), alignment: 'left', fontSize: 8, margin: [0, 0, 30, 0] }],
                    [{text: `Usuario: `, alignment: 'left', fontSize: 8, bold: true}, {text: nombre, alignment: 'left', fontSize: 8, margin: [0, 0, 30, 0] }],
                  ]
                },
                layout: 'noBorders',
              }
            ]
          },
          {
            margin: [20, 0],
            table: {
              headerRows: 1,
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
          {
            margin: [20, 10, 20, 0],
            table: {
              headerRows: 1,
              widths: [110, 70, 80, 140, 40, 30, 50],
              body: [
                [
                  { text: 'Factura', fillColor: '#bbb', fontSize: 10 },
                  { text: 'Fecha', fillColor: '#bbb', fontSize: 10 },
                  { text: 'Vence', fillColor: '#bbb', fontSize: 10 },
                  { text: 'Valor', fillColor: '#bbb', fontSize: 10 },
                  { text: 'Mora', fillColor: '#bbb', fontSize: 10 },
                  { text: 'Días', fillColor: '#bbb', fontSize: 10 },
                  { text: 'Cuenta', fillColor: '#bbb', fontSize: 10 },
                ],
              ]
            },
            layout: { defaultBorder: false, }
          }
        ];
      },
      content : []
    };
    for (let item of this.facturas_Ingresar) {
      total += item.Valor;
      if (!infoAgrupada.includes(`Empresa:    ${item.Empresa_Id}    ${item.Empresa}    -    Proveedor:    ${item.Proveedor_Id}    ${item.Proveedor}`)){
        let proveedor = {
          margin: [0, 5, 0, 5],
          table: {
            widths: [100, 70, 70, 160, 30, 40, 40],
            body: [
              [ { text: `Empresa:    ${item.Empresa_Id}    ${item.Empresa}    -    Proveedor:    ${item.Proveedor_Id}    ${item.Proveedor}`, bold: true, border: [false, false, false, false], colSpan: 7},'','','','','','' ],
            ]
          },
          layout: { defaultBorder: false, },
          fontSize: 9,
        }
        for (let itemDetalles of this.facturas_Ingresar.filter(x => x.Proveedor_Id == item.Proveedor_Id && x.Empresa_Id == item.Empresa_Id)) {
          let info = [
            {text: `FA-${itemDetalles.Codigo}`, border: [true, true, false, true], bold: false, colSpan: 1},
            {text: `${itemDetalles.Fecha}`, border: [false, true, false, true], bold: false, colSpan: 1},
            {text: `${itemDetalles.Vencimiento}`, border: [false, true, false, true], bold: false, colSpan: 1},
            {text: `${this.formatonumeros(itemDetalles.Valor)}`, border: [false, true, false, true], bold: false, colSpan: 1},
            {text: `0`, border: [false, true, false, true], bold: false, colSpan: 1},
            {text: `${this.formatonumeros(this.calcularDiasRetraso(itemDetalles.Codigo, item.Proveedor_Id))}`, border: [false, true, false, true], bold: false, colSpan: 1},
            {text: `${itemDetalles.Cuenta}`, border: [false, true, true, true], bold: false, colSpan: 1}
          ];
          proveedor.table.body.push(info);
        }
        proveedor.table.body.push(
          [
            { text: `Total Proveedor:`, border: [false, false, false, false], bold: true, colSpan: 1},
            '',
            '',
            { text: `${this.formatonumeros(this.calcularTotal(item.Proveedor_Id, item.Empresa_Id))}`, border: [false, false, false, false], bold: true, colSpan: 1},
            { text: `0`, border: [false, false, false, false], bold: true, colSpan: 1},
            '',
            '',
          ],
        );
        pdfDefinicion.content.push(proveedor);
        infoAgrupada.push(`Empresa:    ${item.Empresa_Id}    ${item.Empresa}    -    Proveedor:    ${item.Proveedor_Id}    ${item.Proveedor}`);
      }
    }
    pdfDefinicion.content.push(
      {
        margin: [0, 10],
        table: {
          widths: [100, 70, 70, 160, 30, 40, 40],
          body: [
            [
              { text: `Total General:`, border: [false, false, false, false], bold: true, colSpan: 1},
              '',
              '',
              { text: `${this.formatonumeros(total)}`, border: [false, false, false, false], bold: true, colSpan: 1},
              { text: `0`, border: [false, false, false, false], bold: true, colSpan: 1},
              '',
              '',
            ],
          ]
        },
        layout: { defaultBorder: false, },
        fontSize: 9,
      },
      {
        table : {
          widths : ['*'],
          style : '',
          body : [
            [ { border : [true, true, true, false], text : `Observación: ` } ],
            [ { border : [true, false, true, true], text : `${this.FormFacturas.value.Observaciones == null ? '' : this.FormFacturas.value.Observaciones.toUpperCase()}` } ]
          ]
        },
        layout: { defaultBorder: false, },
        fontSize: 9,
      }
    );
    pdfMake.createPdf(pdfDefinicion).open();
  }

  // Funcion que va a tomar a calcular los dias de retraso de la factura
  calcularDiasRetraso(factura : any, proveedor : any){
    let info = this.facturas_Ingresar.filter(item => item.Proveedor_Id == proveedor && item.Codigo == factura);
    let dias : number = 0;
    for (let i = 0; i < info.length; i++) {
      dias = moment().diff(moment(info[i].Vencimiento), 'days');
    }
    return dias < 0 ? dias - 1 : dias;
  }

  // Calcular rl total de las facturas de un proveedor
  calcularTotal(proveedor : any, empresa : any) : number{
    let total : number = 0;
    for (let item of this.facturas_Ingresar.filter(x => x.Proveedor_Id == proveedor && x.Empresa_Id == empresa)) {
      total += item.Valor;
    }
    return total;
  }
}
