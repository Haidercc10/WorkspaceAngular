import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { i } from '@fullcalendar/core/internal-common';
import moment from 'moment';
import pdfMake from 'pdfmake/build/pdfmake';
import { modelCertificadosCalidad } from 'src/app/Modelo/modelCertificadosCalidad';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { Certificados_CalidadService } from 'src/app/Servicios/Certificados_Calidad/Certificados_Calidad.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { UnidadMedidaService } from 'src/app/Servicios/UnidadMedida/unidad-medida.service';
import { AppComponent } from 'src/app/app.component';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';
import { firmaJefeCalidad } from './FirmaJefeCalidad';

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
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro

  FormOrden !: FormGroup; //Variable que almacenará la información del formulario donde esta la información general de la orden de trabajo
  unidadesMedidas : any [] = []; //Variable que almacenará la información de las unidades de medida
  arrayBooleano : string [] = ['Si', 'No']; //Variable que almacenará la información de los booleanos
  materiales : string [] = []; //Variable que almacenará la información de los materiales
  parametrosCuantitativos : any [] = []; //Variable que almacenará la información de los parametros cuantitativos de la orden de trabajo
  paramertosCualitativos : any [] = []; //Variable que almacenará la información de los parametros cualitativos de la orden de trabajo

  constructor(private frmBuilder : FormBuilder,
                private AppComponent : AppComponent,
                  private msj : MensajesAplicacionService,
                    private certCalidadService : Certificados_CalidadService,
                      private undMedService : UnidadMedidaService,
                        private bagproService : BagproService,){

    this.FormOrden = this.frmBuilder.group({
      Orden : [null, Validators.required],
      Cliente : [null, Validators.required],
      Referencia : [null, Validators.required],
      Cantidad : [null, Validators.required],
      Presentacion : [null, Validators.required],
      Fecha_Orden : [null, Validators.required],
      Observacion : [null],
    });
  }

  ngOnInit(): void {
    this.lecturaStorage();
    this.obtenerUnidadesMedidas();
    this.llenarMateriales();
    this.crearPdfCertificado(2);
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

  // Función que va a buscar las posibles presentaciones que tiene un producto
  obtenerUnidadesMedidas = () => this.undMedService.srvObtenerLista().subscribe(data => this.unidadesMedidas = data);

  // Funcion que va a limpiar todo 
  limpiarTodo() {
    this.FormOrden.reset();
    this.parametrosCuantitativos = [];
    this.paramertosCualitativos = [];
    this.cargando = false;
  }
  
  // Funcion que va a llenar el array de materiales
  llenarMateriales(){
    this.materiales = [
      'RESINA VIRGEN DE POLIETILENO DE BAJA DENSIDAD',
      'RESINA VIRGEN DE POLIPROPILENO BIORIENTAD',
      'RESINA VIRGEN DE POLIETILENO DE ALTA DENSIDAD',
      'RESINA VIRGEN DE POLIPROPILENO CAST + RESINA VIRGEN DE PEBD',
      'LÁMINA DE RESINA VIRGEN DE CAST + RESINA VIRGEN DE PEBD',
      'RESINA VIRGEN DE BOPP + RESINA VIRGEN DE PEBD',
    ]
  }

  // Funcion que va a consultar la información de la orden de trabajo
  consultarOrdenTrabajo(){
    this.paramertosCualitativos = [];
    this.parametrosCuantitativos = [];
    let orden : number = this.FormOrden.value.Orden;
    this.bagproService.srvObtenerListaClienteOT_Item(orden).subscribe(data => {
      data.forEach(ot => {
        this.cargando = true;
        let presentacion : string;

        if (ot.ptPresentacionNom == 'Unidad') presentacion = 'Und';
        else if (ot.ptPresentacionNom == 'Paquete') presentacion = 'Paquete';
        else if (ot.ptPresentacionNom == 'Kilo') presentacion = 'Kg';
        else if (ot.ptPresentacionNom == 'Rollo') presentacion = 'Rollo';

        this.FormOrden.patchValue({
          Cliente : ot.clienteNom,
          Referencia : ot.clienteItemsNom,
          Cantidad : ot.ptPresentacionNom == 'Kilo' ? ot.datosotKg : ot.datoscantBolsa,
          Presentacion : presentacion,
          Observacion : ot.observacion,
          Fecha_Orden : moment(ot.fechaCrea).format('YYYY-MM-DD')
        });

        this.calcularParametrosCuantitativos(ot);
        this.llenarParametrosCualitativos(ot);

        this.cargando = false;
      });
    }, () => this.msj.mensajeAdvertencia(`¡No se encontró información de la OT ${orden}!`, ``));
  }

  // Funcion que va a calcular los datos del parametro cuantitativo
  calcularParametrosCuantitativos(orden : any){
    this.parametrosCuantitativos.push(
      {
        Nombre : `Calibre`,
        UndMedida : orden.extUnidadesNom.trim(),
        Nominal : parseFloat(orden.extCalibre),
        Tolerancia : 0,
        Minimo : 0,
        Maximo : 0,
      },
      {
        Nombre : `Ancho Frente`,
        UndMedida : ``.trim(),
        Nominal : parseFloat(orden.ptAnchopt),
        Tolerancia : 0,
        Minimo : 0,
        Maximo : 0,
      },
      {
        Nombre : `Ancho Fuelle`,
        UndMedida : ``.trim(),
        Nominal : parseFloat(orden.ptFuelle),
        Tolerancia : 0,
        Minimo : 0,
        Maximo : 0,
      },
      {
        Nombre : `Largo / Repetición`,
        UndMedida : ``.trim(),
        Nominal : parseFloat(orden.ptLargopt),
        Tolerancia : 0,
        Minimo : 0,
        Maximo : 0,
      },
      {
        Nombre : `COF`,
        UndMedida : ``.trim(),
        Nominal : parseFloat(`1`),
        Tolerancia : 0,
        Minimo : 0,
        Maximo : 0,
      },
    );
  }

  // Funcion que va a calular el minimo de los parametros cuantitativos
  calcularMinParametrosCuantitativos(data : any){
    let i = this.parametrosCuantitativos.findIndex(item => item.Nombre == data.Nombre);
    this.parametrosCuantitativos[i].Minimo = this.parametrosCuantitativos[i].Nominal - ((this.parametrosCuantitativos[i].Nominal * this.parametrosCuantitativos[i].Tolerancia) / 100);
    return this.parametrosCuantitativos[i].Minimo;
  }

  // Funcion que va a calular el maximo de los parametros cuantitativos
  calcularMaxParametrosCuantitativos(data : any){
    let i = this.parametrosCuantitativos.findIndex(item => item.Nombre == data.Nombre);
    this.parametrosCuantitativos[i].Maximo = this.parametrosCuantitativos[i].Nominal + ((this.parametrosCuantitativos[i].Nominal * this.parametrosCuantitativos[i].Tolerancia) / 100);
    return this.parametrosCuantitativos[i].Maximo;
  }

  // Funcion que va a llenar los paramatros cualitativos de la orden de trabajo
  llenarParametrosCualitativos(orden : any){
    this.paramertosCualitativos.push(
      {
        Nombre : `Material`,
        Resulatado : ``,
      },
      {
        Nombre : `Resistencia`,
        Resulatado : ``,
      },
      {
        Nombre : `Sellabilidad`,
        Resulatado : ``,
      },
      {
        Nombre : `Transparencia`,
        Resulatado : ``,
      },
      {
        Nombre : `Tratado`,
        Resulatado : ![1, 2].includes(orden.extTratado) ? 'Si' : 'No',
      },
      {
        Nombre : `Impresión`,
        Resulatado : orden.impresion.trim() == '1' ? 'Si' : 'No',
      },
    );
  }

  // Funcion que va a enviar de los certificados a la base de datos
  guardarCertificados(){
    this.cargando = true;
    let datosCertificado : modelCertificadosCalidad = {
      Orden_Trabajo: this.FormOrden.value.Orden,
      Cliente: this.FormOrden.value.Cliente,
      Referencia: this.FormOrden.value.Referencia,
      Cantidad_Producir: this.FormOrden.value.Cantidad,
      Presentacion_Producto: this.FormOrden.value.Presentacion,
      Fecha_Orden: this.FormOrden.value.Fecha_Orden,
      Unidad_Calibre: this.parametrosCuantitativos[0].UndMedida,
      Nominal_Calibre: this.parametrosCuantitativos[0].Nominal,
      Tolerancia_Calibre: this.parametrosCuantitativos[0].Tolerancia,
      Minimo_Calibre: this.parametrosCuantitativos[0].Minimo,
      Maximo_Calibre: this.parametrosCuantitativos[0].Maximo,
      Unidad_AnchoFrente: this.parametrosCuantitativos[1].UndMedida,
      Nominal_AnchoFrente: this.parametrosCuantitativos[1].Nominal,
      Tolerancia_AnchoFrente: this.parametrosCuantitativos[1].Tolerancia,
      Minimo_AnchoFrente: this.parametrosCuantitativos[1].Minimo,
      Maximo_AnchoFrente: this.parametrosCuantitativos[1].Maximo,
      Unidad_AnchoFuelle: this.parametrosCuantitativos[2].UndMedida,
      Nominal_AnchoFuelle: this.parametrosCuantitativos[2].Nominal,
      Tolerancia_AnchoFuelle: this.parametrosCuantitativos[2].Tolerancia,
      Minimo_AnchoFuelle: this.parametrosCuantitativos[2].Minimo,
      Maximo_AnchoFuelle: this.parametrosCuantitativos[2].Maximo,
      Unidad_LargoRepeticion: this.parametrosCuantitativos[3].UndMedida,
      Nominal_LargoRepeticion: this.parametrosCuantitativos[3].Nominal,
      Tolerancia_LargoRepeticion: this.parametrosCuantitativos[3].Tolerancia,
      Minimo_LargoRepeticion: this.parametrosCuantitativos[3].Minimo,
      Maximo_LargoRepeticion: this.parametrosCuantitativos[3].Maximo,
      Unidad_Cof: this.parametrosCuantitativos[4].UndMedida,
      Nominal_Cof: this.parametrosCuantitativos[4].Nominal,
      Tolerancia_Cof: this.parametrosCuantitativos[4].Tolerancia,
      Minimo_Cof: this.parametrosCuantitativos[4].Minimo,
      Maximo_Cof: this.parametrosCuantitativos[4].Maximo,
      Material: this.paramertosCualitativos[0].Resulatado,
      Resistencia: this.paramertosCualitativos[1].Resulatado,
      Sellabilidad: this.paramertosCualitativos[2].Resulatado,
      Transparencia: this.paramertosCualitativos[3].Resulatado,
      Tratado: this.paramertosCualitativos[4].Resulatado,
      Impresion: this.paramertosCualitativos[5].Resulatado,
      Observacion: this.FormOrden.value.Observacion,
      Fecha_Registro: moment().format('YYYY-MM-DD'),
      Hora_Registro: moment().format('H:mm:ss'),
      Usua_Id: this.storage_Id
    }
    this.certCalidadService.Post(datosCertificado).subscribe(res => {
      this.crearPdfCertificado(res.consecutivo);
      this.limpiarTodo();
      this.msj.mensajeConfirmacion(`¡Los datos del certificado de calidad se han guardado correctamente!`, ``);
    }, () => {
      this.cargando = false;
      this.msj.mensajeError(`¡Ha ocurrido un error al guardar los datos del certificado de calidad!`, ``);
    });
  }

  // Funcion que va a crear el pdf con la información del certificado 
  crearPdfCertificado(id : number){
    this.certCalidadService.Get_Id(id).subscribe(datos => {
      let titulo : string = `Certificado de Calidad N° ${datos.consecutivo}`;
      let nombreUsuario : string = this.storage_Nombre;
      const pdfDefinicion : any = {
        info: { title: titulo},
        pageSize: { width: 630, height: 760 },
        watermark: { text: 'PLASTICARIBE SAS', color: 'red', opacity: 0.05, bold: true, italics: false },
        pageMargins : [25, 110, 25, 35],
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
                      [{text: `Fecha Doc. ${moment().format('YYYY-MM-DD')} ${moment().format('H:mm:ss')}`, alignment: 'center', fontSize: 8}],
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
                      [{text: `Fecha: `, alignment: 'left', fontSize: 8, bold: true}, {text: datos.fecha_Registro.replace('T00:00:00', ``), alignment: 'left', fontSize: 8, margin: [0, 0, 30, 0] }],
                      [{text: `Hora: `, alignment: 'left', fontSize: 8, bold: true}, {text: datos.hora_Registro, alignment: 'left', fontSize: 8, margin: [0, 0, 30, 0] }],
                      [{text: `Usuario: `, alignment: 'left', fontSize: 8, bold: true}, {text: nombreUsuario, alignment: 'left', fontSize: 8, margin: [0, 0, 30, 0] }],
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
          ];
        },
        content : [
          {
            style: 'tablaEmpresa',
            table: {
              widths: [60, '*', 60, '*'],
              style: 'header',
              body: [
                [
                  { border: [true, true, false, false], text: `Orden / Lote`, style: 'titulo', },
                  { border: [false, true, false, false], text: `${datos.orden_Trabajo}` },
                  { border: [true, true, false, false], text: `Referencia`, style: 'titulo', },
                  { border: [false, true, true, false], text: `${datos.referencia}` },
                ],
                [
                  { border: [true, false, false, true], text: `Cliente`, style: 'titulo', },
                  { border: [false, false, true, true], text: `${datos.cliente}` },
                  { border: [false, false, false, true], text: `Cantidad`, style: 'titulo', },
                  { border: [false, false, true, true], text: `${this.formatonumeros(datos.cantidad_Producir.toFixed(2))} ${datos.presentacion_Producto}` },
                ],
              ]
            },
            layout: { defaultBorder: false, },
            fontSize: 9,
          },
          {
            margin: [5, 10],
            table: {
              headerRows: 1,
              widths: [125, 100, 70, 80, 80, '*'],
              body: [
                [
                  { text: 'Parametro Cuantitativo', fillColor: '#bbb', fontSize: 9 },
                  { text: 'Und. Medida', fillColor: '#bbb', fontSize: 9 },
                  { text: 'Nominal', fillColor: '#bbb', fontSize: 9 },
                  { text: 'Tolerancia', fillColor: '#bbb', fontSize: 9 },
                  { text: 'Mínimo', fillColor: '#bbb', fontSize: 9 },
                  { text: 'Máximo', fillColor: '#bbb', fontSize: 9 },
                ],
              ]
            },
            layout: { defaultBorder: false, },
          },
          {
            margin: [8, 0],
            table: {
              headerRows: 1,
              widths: [100, 100 , '*', '*', '*', '*'],
              body: [
                [
                  { text: 'Calibre', fontSize: 9, bold : true },
                  { text: `${datos.unidad_Calibre}`, fontSize: 9, alignment: 'center' },
                  { text: `${datos.nominal_Calibre}`, fontSize: 9, alignment: 'center' },
                  { text: `${datos.tolerancia_Calibre}`, fontSize: 9, alignment: 'center' },
                  { text: `${datos.minimo_Calibre}`, fontSize: 9, alignment: 'center' },
                  { text: `${datos.maximo_Calibre}`, fontSize: 9, alignment: 'center' },
                ],
                [
                  { text: 'Ancho Frente', fontSize: 9, bold : true },
                  { text: `${datos.unidad_AnchoFrente}`, fontSize: 9, alignment: 'center' },
                  { text: `${datos.nominal_AnchoFrente}`, fontSize: 9, alignment: 'center' },
                  { text: `${datos.tolerancia_AnchoFrente}`, fontSize: 9, alignment: 'center' },
                  { text: `${datos.minimo_AnchoFrente}`, fontSize: 9, alignment: 'center' },
                  { text: `${datos.maximo_AnchoFrente}`, fontSize: 9, alignment: 'center' },
                ],
                [
                  { text: 'Ancho Fuelle', fontSize: 9, bold : true },
                  { text: `${datos.unidad_AnchoFuelle}`, fontSize: 9, alignment: 'center' },
                  { text: `${datos.nominal_AnchoFuelle}`, fontSize: 9, alignment: 'center' },
                  { text: `${datos.tolerancia_AnchoFuelle}`, fontSize: 9, alignment: 'center' },
                  { text: `${datos.minimo_AnchoFuelle}`, fontSize: 9, alignment: 'center' },
                  { text: `${datos.maximo_AnchoFuelle}`, fontSize: 9, alignment: 'center' },
                ],
                [
                  { text: 'Largo / Repetición', fontSize: 9, bold : true },
                  { text: `${datos.unidad_LargoRepeticion}`, fontSize: 9, alignment: 'center' },
                  { text: `${datos.nominal_LargoRepeticion}`, fontSize: 9, alignment: 'center' },
                  { text: `${datos.tolerancia_LargoRepeticion}`, fontSize: 9, alignment: 'center' },
                  { text: `${datos.minimo_LargoRepeticion}`, fontSize: 9, alignment: 'center' },
                  { text: `${datos.maximo_LargoRepeticion}`, fontSize: 9, alignment: 'center' },
                ],
                [
                  { text: 'COF', fontSize: 9, bold : true },
                  { text: `${datos.unidad_Cof}`, fontSize: 9, alignment: 'center' },
                  { text: `${datos.nominal_Cof}`, fontSize: 9, alignment: 'center' },
                  { text: `${datos.tolerancia_Cof}`, fontSize: 9, alignment: 'center' },
                  { text: `${datos.minimo_Cof}`, fontSize: 9, alignment: 'center' },
                  { text: `${datos.maximo_Cof}`, fontSize: 9, alignment: 'center' },
                ],
              ]
            },
          },
          {
            margin: [5, 10],
            table: {
              headerRows: 1,
              widths: [150, '*'],
              body: [
                [
                  { text: 'Parametro Cualitativo', fillColor: '#bbb', fontSize: 9, alignment: 'center' },
                  { text: 'Resultado', fillColor: '#bbb', fontSize: 9, alignment: 'center' },
                ],
              ]
            },
            layout: { defaultBorder: false, },
          },
          {
            margin: [8, 0],
            table: {
              headerRows: 1,
              widths: [150, '*'],
              body: [
                [
                  { text: 'Material', fontSize: 9, bold : true },
                  { text: `${datos.material}`, fontSize: 9, alignment: 'center' },
                ],
                [
                  { text: 'Resistencia', fontSize: 9, bold : true },
                  { text: `${datos.resistencia}`, fontSize: 9, alignment: 'center' },
                ],
                [
                  { text: 'Sellabilidad', fontSize: 9, bold : true },
                  { text: `${datos.sellabilidad}`, fontSize: 9, alignment: 'center' },
                ],
                [
                  { text: 'Transparencia', fontSize: 9, bold : true },
                  { text: `${datos.transparencia}`, fontSize: 9, alignment: 'center' },
                ],
                [
                  { text: 'Tratado', fontSize: 9, bold : true },
                  { text: `${datos.tratado}`, fontSize: 9, alignment: 'center' },
                ],
                [
                  { text: 'Impresión', fontSize: 9, bold : true },
                  { text: `${datos.impresion}`, fontSize: 9, alignment: 'center' },
                ],
              ]
            },
          },
          {
            margin: [0, 20],
            table : {
              widths : ['*'],
              style : '',
              body : [
                [ { border : [true, true, true, false], text : `Observación: `, bold : true } ],
                [ { border : [true, false, true, true], text : `${datos.observacion}` } ]
              ]
            },
            layout: { defaultBorder: false, },
            fontSize: 9,
          },
          {
            margin: [0, 100],
            table : {
              widths : ['*'],
              style : '',
              body : [
                [ { image : firmaJefeCalidad, width : 110, height : 60}],
                [ {text : `Jefe de Calidad`, fontSize : 11, bold: true } ],
                [ {text : `Plasticaribe SAS`, fontSize : 11, bold: true } ]
              ]
            },
            layout: { defaultBorder: false, },
            fontSize: 9,
          },
        ]
      }
      const pdf = pdfMake.createPdf(pdfDefinicion);
      pdf.open();
      this.cargando = false;
    });
  }
}

