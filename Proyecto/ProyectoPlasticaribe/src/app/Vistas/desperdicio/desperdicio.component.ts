import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShepherdService } from 'angular-shepherd';
import moment from 'moment';
import pdfMake from 'pdfmake/build/pdfmake';
import { MessageService } from 'primeng/api';
import { AppComponent } from 'src/app/app.component';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';
import { ActivosService } from 'src/app/Servicios/Activos/Activos.service';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { DesperdicioService } from 'src/app/Servicios/Desperdicio/desperdicio.service';
import { FallasTecnicasService } from 'src/app/Servicios/FallasTecnicas/FallasTecnicas.service';
import { MaterialProductoService } from 'src/app/Servicios/MaterialProducto/materialProducto.service';
import { ProcesosService } from 'src/app/Servicios/Procesos/procesos.service';
import { UsuarioService } from 'src/app/Servicios/Usuarios/usuario.service';
import { defaultStepOptions, stepsDesperdicio as defaultSteps } from 'src/app/data';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { AreaService } from 'src/app/Servicios/Areas/area.service';

@Component({
  selector: 'app.desperdicio.component',
  templateUrl: './desperdicio.component.html',
  styleUrls: ['./desperdicio.component.css']
})

export class DesperdicioComponent implements OnInit {

  FormDesperdicio !: FormGroup;
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  cargando : boolean = false; //Variable que permitirá validar si debe salir o no la imagen de carga
  fallas : any [] = []; //Variable que almacenará los diferentes tipos de fallas por los que se puede dar un desperdicio
  operarios : any [] = []; //Variable que almacenará la informacion de los operarios
  procesos : any [] = []; //Variable que almacenará los procesos de produccion de la empresa
  maquinas : any [] = []; //Variable que almacenará las diferentes maquinas
  grupoDespercios : any [] = []; //Variable que almacenará los desperdicios que se vayan ingresando para mstrarlos en la tabla
  datosPdf : any [] = []; //Variable que va a almacenar los datos ingresados a la base de datos
  materiales : any [] = []; //Variable que va a tener la información de los materiales
  registroSeleccionado : any =[]; /** Variable que contendrá el registro a quitar de la tabla. */
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  desperdicios : any = []; //
  area : any = {};
  areas : any [] = [];
  areaOperarios : any; 
  ordenesTrabajo : any = [];

  constructor(private frmBuilder : FormBuilder,
                private AppComponent : AppComponent,
                  private bagProService : BagproService,
                    private operariosService : UsuarioService,
                      private procesosService : ProcesosService,
                        private fallasService : FallasTecnicasService,
                          private maquinasService : ActivosService,
                            private deperdicioService : DesperdicioService,
                              private materiaService : MaterialProductoService,
                                private messageService: MessageService,
                                  private shepherdService: ShepherdService,
                                    private mensajeService : MensajesAplicacionService,
                                      private svcAreas : AreaService) {

    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
    this.FormDesperdicio = this.frmBuilder.group({
      OTDesperdicio : [null],
      IdMaquina : [null,],
      Maquina : [null, Validators.required],
      IdOperario : [null, Validators.required],
      Operario : [null, Validators.required],
      IdProducto : [null],
      Producto : [null],
      IdTipoMaterial : [null, Validators.required],
      TipoMaterial : [null, Validators.required],
      Impreso : [null, Validators.required],
      IdTipoNoConformidad : [null, Validators.required],
      TipoNoConformidad : [null, Validators.required],
      CantidadKg : [null, Validators.required],
      Observacion : [null],
      IdArea : [null, Validators.required],
      Area : [null, Validators.required],
      Fecha : [null, ],
    });
  }

  ngOnInit() {
    this.lecturaStorage();
    this.obtenerAreas();
    this.obtenerFallas();
    this.obtenerMaquinas();
    this.obtenerProcesos();
    this.obtenerMateriales();
    this.cargarPuertosSeriales();
    setTimeout(() => { 
      this.filtrarArea(); 
      this.obtenerOperarios();
    }, 1000);
    setInterval(() => this.modoSeleccionado = this.AppComponent.temaSeleccionado, 1000);
  }

  //Función que cargará el area del usuario logueado
  filtrarArea(){
    if (this.ValidarRol == 74) this.area = { id : "EXT", nombre : "Extrusion", };
    else if (this.ValidarRol == 75) this.area = { id :"IMP", nombre : "Impresion", };
    else if (this.ValidarRol == 76) this.area = { id :"ROT", nombre : "Rotograbado", };
    else if (this.ValidarRol == 77) this.area = { id :"LAM", nombre : "Laminado", };
    else if (this.ValidarRol == 78) this.area = { id :"DBLD", nombre : "Doblado", };
    else if (this.ValidarRol == 79) this.area = { id :"CORTE", nombre : "Corte", };
    else if (this.ValidarRol == 80) this.area = { id :"EMP", nombre : "Empaque", };
    else if (this.ValidarRol == 81) this.area = { id :"SELLA", nombre : "Sellado", };
    else if (this.ValidarRol == 81) this.area = { id :"WIKE", nombre : "Wiketiado", };
    else this.area = { id : "N/A", nombre : "NO APLICA" };
    this.FormDesperdicio.patchValue({ IdArea : this.area.id, Area : this.area.nombre.toUpperCase(), });

    if(this.area.nombre.toUpperCase() == "NO APLICA") this.areaOperarios = [];
    else this.areaOperarios = this.areas.filter(x => x.area_Nombre == this.area.nombre.toUpperCase());
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
  formatonumeros = (number) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

  // Funcion que limpiará los campos del formulario
  limpiarCampos(){
    this.cargando = false;
    this.FormDesperdicio.reset();
    this.desperdicios = [];
    this.ordenesTrabajo = [];
  }

  // Funcion que va a limpiar todo
  limpiarTodo(){
    this.cargando = false;
    this.FormDesperdicio.reset();
    this.desperdicios = [];
    this.ordenesTrabajo = [];
  }

  // Funcion que va a consultar los operarios
  obtenerOperarios() {
    this.operariosService.getUsuarios().subscribe(datos => {
      this.operarios = datos.filter((item) => item.rolUsu_Id == 59 && (this.areaOperarios.length > 0 ? item.area_Id == this.areaOperarios[0].area_Id : true)); 
    });
  } 

  //Funcion que va a conultar y obtener todas las areas de la empresa
  obtenerProcesos = () => this.procesosService.srvObtenerLista().subscribe(datos => this.procesos = datos);

  //Función que va a obtener todas las areas
  obtenerAreas = () => this.svcAreas.srvObtenerLista().subscribe(datos => this.areas = datos);
  
  //obtenerProcesos2 = () => this.procesosService.srvObtenerLista().subscribe(datos => this.procesos = datos.filter((item) => [10,11,12].includes(item.proceso_Codigo)));

  // Funcion que va a consultar y obtener la informacion de las fallas
  obtenerFallas = () => this.fallasService.srvObtenerLista().subscribe(datos => this.fallas = datos.filter((item) => item.tipoFalla_Id == 11));

  // Funcion que va a consultar y obtener la informacion de las maquinas
  obtenerMaquinas = () => this.maquinasService.GetTodo().subscribe(datos => this.maquinas = datos.filter((item) => item.tpActv_Id == 4));

  // Funcion que va a consultar y obtener la inforamcion de los materiales
  obtenerMateriales = () => this.materiaService.srvObtenerLista().subscribe(datos => this.materiales = datos);

  // Funcion que va a consultar el id de la falla y en su lugar colocará el nombre en el formulario
  buscarFalla(){
    let noConformidad : any = this.FormDesperdicio.value.TipoNoConformidad;
    let nuevo : any [] =  this.fallas.filter((item) => item.falla_Id == noConformidad);
    this.FormDesperdicio.patchValue({
      IdTipoNoConformidad : nuevo[0].falla_Id,
      TipoNoConformidad : nuevo[0].falla_Nombre,
    });
  }

  // Funcion que va a consultar el id del operario y en su lugar colocará el nombre en el formulario
  buscarOperario(){
    let operario : any = this.FormDesperdicio.value.Operario;
    let nuevo : any [] =  this.operarios.filter((item) => item.usua_Id == operario);
    this.FormDesperdicio.patchValue({
      IdOperario : nuevo[0].usua_Id,
      Operario : nuevo[0].usua_Nombre,
    });
  }

  // Funcion que va a consultar el id de la maquina y en su lugar colocará el serial de la maquina
  buscarMaquina(){
    let maquina : any = this.FormDesperdicio.value.Maquina;
    let nuevo : any [] =  this.maquinas.filter((item) => item.actv_Id == maquina);
    this.FormDesperdicio.patchValue({
      IdMaquina : nuevo[0].actv_Id,
      Maquina : nuevo[0].actv_Nombre,
    });
  }

  // Funcion que va a consultar el id del area y en su lugar colocará el nombre del area o proceso
  buscarProceso(){
    let proceso : any = this.FormDesperdicio.value.Area;
    let nuevo : any [] =  this.procesos.filter((item) => item.proceso_Id == proceso);
    this.FormDesperdicio.patchValue({
      IdArea : nuevo[0].proceso_Id,
      Area : nuevo[0].proceso_Nombre,
    });
  }

  // Funcion que va a consultar el id del material y en su lugar colocará el nombre de este
  buscarMaterial(){
    let material : any = this.FormDesperdicio.value.TipoMaterial;
    let nuevo : any [] =  this.materiales.filter((item) => item.material_Id == material);
    this.FormDesperdicio.patchValue({
      IdTipoMaterial : nuevo[0].material_Id,
      TipoMaterial : nuevo[0].material_Nombre,
    });
  }

  // Funcion que consultará la informacion de la orden de trabajo
  consultarOrdenTrabajo(){
    this.cargando = true;
    this.ordenesTrabajo = [];
    let orden : any = this.FormDesperdicio.value.OTDesperdicio;
    this.bagProService.srvObtenerListaClienteOT_Item(orden).subscribe(datos_orden => {
      if (datos_orden.length == 0) {
        this.cargando = false;
        this.mensajeService.mensajeAdvertencia(`Advertencia`, `¡No se encontró la OT N° ${orden}!`);
      } else {
        for (let i = 0; i < datos_orden.length; i++) {
          this.getOT(datos_orden[i]);
          this.getOTDesperdicio(orden.toString());
        } 
      }  
    }, () => {
      this.mensajeService.mensajeError(`Error`, `No se pudo obtener información de la OT N° ${orden}!`);
      this.cargando = false;
    });
  }

  //Función que cargará la información de la orden en la tabla
  getOT(datos_orden : any){
    let imp : any = datos_orden.impresion.trim();
    if (imp == "1") imp = "SI";
    else if (imp == "0") imp = "NO";
    let info : any = {
      'OTDesperdicio' : datos_orden.item,
      'Cliente' : datos_orden.clienteNom,
      'IdProducto' : datos_orden.clienteItems,
      'Producto' : datos_orden.clienteItemsNom,
      'Pesado' : 0,
      'Unidad' : 'Kg',
      'IdTipoMaterial' : parseInt(datos_orden.extMaterial.trim()),
      'TipoMaterial' : datos_orden.extMaterialNom.trim(),
      'Calibre' : parseFloat(datos_orden.extCalibre),
      'Ancho1' : parseFloat(datos_orden.extAcho1),
      'Ancho2' : parseFloat(datos_orden.extAcho2),
      'Ancho3' : parseFloat(datos_orden.extAcho3),
      'Impreso' : imp,
      'CantKg' : datos_orden.datoscantKg,
      }
    this.ordenesTrabajo.push(info);
    this.FormDesperdicio.patchValue({ 
      IdTipoMaterial : parseInt(datos_orden.extMaterial.trim()),
      TipoMaterial : datos_orden.extMaterialNom.trim(), 
    }); 
    this.cargando = false;
  }

  getOTDesperdicio(ot : any){
    let ruta : any = ``;
    let area : any = this.area.nombre.toUpperCase();

    if(area == "CORTE") area = "CORTADORES";
    if(area != "NO APLICA") ruta += `?${area}`;
    else area = ``;
    
    this.bagProService.GetOtProcesoDesperdicio(ot, ruta).subscribe(data => { 
      if([74, 75, 76, 77, 78, 79, 80, 81, 82].includes(this.ValidarRol)) {
        this.desperdicios = data.filter(x => x.proceso.includes(`DESP_${area}`));
      } else this.desperdicios = data;
      this.cargando = false;
    }, error => { this.cargando = false; });
  }

  calcularPeso() {  
    let area : any = this.area.nombre.toUpperCase();
    if(area == "NO APLICA") area = ``;
    return this.desperdicios.filter(x => x.proceso.includes(`DESP_${area}`)).reduce((a, b) => a + b.peso, 0);
  } 

  // Funcion que va a llenar la tabla con la informacion del desperdicio digitadi
  llenarTabla(){
    this.cargando = true;
    if (this.FormDesperdicio.valid) {
      if (this.FormDesperdicio.value.OTDesperdicio == null) this.FormDesperdicio.value.OTDesperdicio = 0;
      if (this.FormDesperdicio.value.Producto == null) this.FormDesperdicio.value.Producto = `No aplica`;
      if (this.FormDesperdicio.value.IdProducto == null) this.FormDesperdicio.value.IdProducto = 100163;
      let info : any = {
        Ot : this.FormDesperdicio.value.OTDesperdicio,
        IdMaquina : this.FormDesperdicio.value.IdMaquina,
        Maquina : this.FormDesperdicio.value.Maquina,
        IdItem : this.FormDesperdicio.value.IdProducto,
        Item : `${this.FormDesperdicio.value.IdProducto} - ${this.FormDesperdicio.value.Producto}`,
        IdMateria : parseInt(this.FormDesperdicio.value.IdTipoMaterial),
        Material : this.FormDesperdicio.value.TipoMaterial,
        IdOperario : this.FormDesperdicio.value.IdOperario,
        Operario : this.FormDesperdicio.value.Operario,
        IdNoConformidad : this.FormDesperdicio.value.IdTipoNoConformidad,
        NoConformidad : this.FormDesperdicio.value.TipoNoConformidad,
        Cantidad : this.FormDesperdicio.value.CantidadKg,
        Impreso : this.FormDesperdicio.value.Impreso,
        Observacion : this.FormDesperdicio.value.Observacion,
        Fecha : moment(this.FormDesperdicio.value.Fecha).format('YYYY-MM-DD'),
        IdArea : this.FormDesperdicio.value.IdArea,
        Area : this.FormDesperdicio.value.Area,
      }
      this.grupoDespercios.push(info);
      this.cargando = false;
    } else {
      this.mensajeService.mensajeAdvertencia(`Advertencia`, `Debe llenar los campos vacios!`);
      this.cargando = false;
    }
  }

  // Funcion que va a crear el registro de desperdicio
  crearDesperdicio(){
    let error : boolean = false;
    if (this.grupoDespercios.length != 0){
      this.cargando = true;
      for (let i = 0; i < this.grupoDespercios.length; i++) {
        let observacion : any = this.grupoDespercios[i].Observacion;
        if (observacion == null) observacion = '';
        let info : any = {
          Desp_OT : this.grupoDespercios[i].Ot,
          Prod_Id : this.grupoDespercios[i].IdItem,
          Material_Id : this.grupoDespercios[i].IdMateria,
          Actv_Id : this.grupoDespercios[i].IdMaquina,
          Usua_Operario : this.grupoDespercios[i].IdOperario,
          Desp_Impresion : this.grupoDespercios[i].Impreso,
          Falla_Id : this.grupoDespercios[i].IdNoConformidad,
          Desp_PesoKg : this.grupoDespercios[i].Cantidad,
          Desp_Fecha :  this.today,
          Desp_Observacion : observacion,
          Usua_Id : this.storage_Id,
          Desp_FechaRegistro : this.today,
          Desp_HoraRegistro : moment().format('H:mm:ss'),
          Proceso_Id : this.grupoDespercios[i].IdArea,
        }
        this.deperdicioService.Insert(info).subscribe(() => this.mensajeService.mensajeConfirmacion(`Confirmación`, `Se ha ingresado el desperdicio exitosamente!`), () => {
          this.mensajeService.mensajeError(`Error`, `Ha ocurrido un error, no se pudo ingresar el desperdicio!`);
          this.cargando = false;
          error = true;
        });
      }
    } else {
      this.mensajeService.mensajeAdvertencia(`Advertencia`, `¡Debe añadir minimo un registro a la tabla para crear un desperdicio!`);
      this.cargando = false;
    }

    setTimeout(() => {
      if (!error) {
        this.llenarDatosPdf();
        this.limpiarTodo();
      }
    }, 2000);
  }

  // Funcion que creará un PDF del desperdicio ingresado
  crearPdf(){
    this.deperdicioService.GetUltimoPedido().subscribe(datos_desperdicios => {
      for (let i = 0; i < datos_desperdicios.length; i++) {
        let titulo : string = `Reporte Merma de Material - ${this.today}`;
        const pdfDefinicion : any = {
          info: { title: titulo },
          pageSize: { width: 630, height: 760 },
          watermark: { text: 'PLASTICARIBE SAS', color: 'red', opacity: 0.05, bold: true, italics: false },
          pageMargins : [25, 150, 25, 35],
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
                        [{text: `Fecha: `, alignment: 'left', fontSize: 8, bold: true}, {text: datos_desperdicios[i].desp_FechaRegistro.replace('T00:00:00', ''), alignment: 'left', fontSize: 8, margin: [0, 0, 30, 0] }],
                        [{text: `Hora: `, alignment: 'left', fontSize: 8, bold: true}, {text: moment().format('H:mm:ss'), alignment: 'left', fontSize: 8, margin: [0, 0, 30, 0] }],
                        [{text: `Usuario: `, alignment: 'left', fontSize: 8, bold: true}, {text: datos_desperdicios[i].nombreCreador, alignment: 'left', fontSize: 8, margin: [0, 0, 30, 0] }],
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
                  widths: [30, 40, 30, 40, 60, 70, 40, 35, 40, 42, 60],
                  body: [
                    [
                      { text: 'OT', fillColor: '#bbb', fontSize: 9 },
                      { text: 'Maquina', fillColor: '#bbb', fontSize: 9 },
                      { text: 'Item', fillColor: '#bbb', fontSize: 9 },
                      { text: 'Material', fillColor: '#bbb', fontSize: 9 },
                      { text: 'Operario', fillColor: '#bbb', fontSize: 9 },
                      { text: 'No_Conformidad', fillColor: '#bbb', fontSize: 9 },
                      { text: 'Cantidad', fillColor: '#bbb', fontSize: 9 },
                      { text: 'Impreso', fillColor: '#bbb', fontSize: 9 },
                      { text: 'Area', fillColor: '#bbb', fontSize: 9 },
                      { text: 'Fecha', fillColor: '#bbb', fontSize: 9 },
                      { text: 'Observacion', fillColor: '#bbb', fontSize: 9 },
                    ],
                  ]
                },
                layout: { defaultBorder: false, },
              }
            ];
          },
          content : [
            this.table(this.datosPdf, ['OT', 'Maquina', 'Item', 'Material', 'Operario', 'No_Conformidad', 'Cantidad', 'Impreso', 'Area', 'Fecha', 'Observacion']),
          ],
          styles: {
            header: { fontSize: 10, bold: true },
            texto: { fontSize: 9, },
            titulo: { fontSize: 20, bold: true }
          }
        }
        const pdf = pdfMake.createPdf(pdfDefinicion);
        pdf.open();
        this.cargando = false;
        break;
      }
    }, () => this.mensajeService.mensajeError(`Error`,`¡Error al consultar la información del último registro!`));
  }

  // Funcion que va a consultar los datos de desperdicio
  llenarDatosPdf(){
    this.datosPdf = [];
    this.deperdicioService.GetUltimoPedido().subscribe(datos_desperdicios => {
      for (let i = 0; i < datos_desperdicios.length; i++) {
        let info : any = {
          OT : datos_desperdicios[i].desp_OT,
          Maquina : datos_desperdicios[i].actv_Serial,
          Item : datos_desperdicios[i].prod_Id,
          Material : datos_desperdicios[i].material_Nombre,
          Operario : datos_desperdicios[i].usua_Nombre,
          No_Conformidad : datos_desperdicios[i].falla_Nombre,
          Cantidad : this.formatonumeros(datos_desperdicios[i].desp_PesoKg.toFixed()),
          Impreso : datos_desperdicios[i].desp_Impresion,
          Observacion : datos_desperdicios[i].desp_Observacion,
          Fecha : datos_desperdicios[i].desp_Fecha.replace('T00:00:00', ''),
          Area : datos_desperdicios[i].proceso_Nombre,
        }
        this.datosPdf.push(info);
      }
      setTimeout(() => this.crearPdf(), 2000);
    }, () => this.mensajeService.mensajeError(`Error`, `¡Error al consultar la información del último registro!`));
  }

  // Funcion que se encagará de llenar la tabla del pdf
  buildTableBody(data, columns) {
    var body = [];
    data.forEach(function(row) {
      var dataRow = [];
      columns.forEach((column) => dataRow.push(row[column].toString()));
      body.push(dataRow);
    });

    return body;
  }

  // Funcion que genera la tabla donde se mostrará la información
  table(data, columns) {
    return {
      table: {
        headerRows: 1,
        widths: [30, 40, 30, 40, 60, 70, 37, 32, 40, 42, 58],
        body: this.buildTableBody(data, columns),
      },
      fontSize: 8,
    };
  }

  // Funcion que va a quitar un desperdicio de la tabla
  quitarDesperdicio(data: any){
    data = this.registroSeleccionado;
    this.onReject();
    this.grupoDespercios.splice(this.grupoDespercios.findIndex((item) => item.Ot == data.Ot && item.NoConformidad == data.NoConformidad), 1);
    this.mensajeService.mensajeConfirmacion(`Confirmación`, `Registro de desperdicio eliminado con éxito!`);
  }

  onReject = () => this.messageService.clear('eleccion');

  mostrarEleccion(item : any){
    this.registroSeleccionado = item;
    this.messageService.add({severity:'warn', key:'eleccion', summary:'Elección', detail: `Está seguro que desea eliminar el desperdicio de la tabla?`, sticky: true});
  }

  // Funcion que va a generar un desperdicio nuevo y lo va a agregar a la BD
  generarDesperdicio(){
    if(!this.FormDesperdicio.valid) this.mensajeService.mensajeAdvertencia(`Advertencia`, `Debe completar todos los campos!`);
    else if(this.FormDesperdicio.value.CantidadKg <= 0) this.mensajeService.mensajeAdvertencia(`El peso debe ser mayor a 0!`);
    else if(this.FormDesperdicio.value.Maquina <= 0) this.mensajeService.mensajeAdvertencia(`La maquina no puede ser 0!`);
    else if(this.FormDesperdicio.value.IdArea == "N/A") this.mensajeService.mensajeAdvertencia(`Debe elegir una área!`);
    else if(moment(this.FormDesperdicio.value.Fecha).format('YYYY-MM-DD') > this.today) this.mensajeService.mensajeAdvertencia(`La fecha ingresada no es válida!`);
    else {
      this.cargando = true;
      let info : any = {
        'Desp_OT' : this.FormDesperdicio.value.OTDesperdicio,
        'Prod_Id' : this.ordenesTrabajo[0].IdProducto,
        'Material_Id' : this.FormDesperdicio.value.IdTipoMaterial,
        'Actv_Id' : this.FormDesperdicio.value.Maquina,
        'Usua_Operario' : this.FormDesperdicio.value.IdOperario,
        'Desp_Impresion' : this.FormDesperdicio.value.Impreso,
        'Falla_Id' : this.FormDesperdicio.value.IdTipoNoConformidad,
        'Desp_PesoKg' : this.FormDesperdicio.value.CantidadKg,
        'Desp_Fecha' : moment(this.FormDesperdicio.value.Fecha).format('YYYY-MM-DD'),
        'Desp_Observacion' : this.FormDesperdicio.value.Observacion == null ? '' : this.FormDesperdicio.value.Observacion,
        'Usua_Id' : this.storage_Id,
        'Desp_FechaRegistro' : this.today,
        'Desp_HoraRegistro' : moment().format('H:mm:ss'),
        'Proceso_Id' : this.FormDesperdicio.value.IdArea,
      }
      this.deperdicioService.Insert(info).subscribe(() => {
        this.mensajeService.mensajeConfirmacion(`Desperdicio creado exitosamente!`);
        this.limpiarTodo();
      }), () => {
        this.mensajeService.mensajeError(`Error`, `No se pudo ingresar el desperdicio, verifique!`);
        this.cargando = false;
      }
    }
  }

  //Función que carga los puertos seriales
  cargarPuertosSeriales() {
    console.log(1)
    navigator.serial.getPorts().then(ports => {
      ports.forEach(port => {
        port.open({ baudRate: 9600 }).then(async () => this.cargarDatosPuertoSerial(port), error => this.mensajeService.mensajeError(`${error}`));
      });
    });
  }

  //Función que obtiene los puertos seriales
  async getPuertoSerial() {
    const port = await navigator.serial.requestPort();
    await port.open({ baudRate: 9600 });
    this.cargarDatosPuertoSerial(port);
  }

  //Función que lee los datos del puerto serial
  async cargarDatosPuertoSerial(port: any) {
    while (port.readable) {
      const reader = port.readable.getReader();
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            reader.releaseLock();
            break;
          }
          if (value) {
            let valor = this.ab2str(value);
            valor = valor.replace(/[^\d.-]/g, '');
            this.FormDesperdicio.patchValue({
              CantidadKg: valor,
            });
          }
        }
      } catch (error) {
        console.log(error);
      }
    }
  }
  
  //Función que convierte un buffer a un valor
  ab2str = (buf) => String.fromCharCode.apply(null, new Uint8Array(buf));
}
