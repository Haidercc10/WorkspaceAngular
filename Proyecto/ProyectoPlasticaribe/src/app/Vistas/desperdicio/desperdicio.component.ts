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
                                  private shepherdService: ShepherdService) {

    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
    this.FormDesperdicio = this.frmBuilder.group({
      OTDesperdicio : [null],
      IdMaquina : [null, Validators.required],
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
      Fecha : [null, Validators.required],
    });
  }

  ngOnInit() {
    this.lecturaStorage();
    this.obtenerOperarios();;
    this.obtenerFallas();
    this.obtenerMaquinas();
    this.obtenerProcesos();
    this.obtenerMateriales();
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

  // Funcion que limpiará los campos del formulario
  limpiarCampos(){
    this.cargando = false;
    this.FormDesperdicio.reset();
  }

  // Funcion que va a limpiar todo
  limpiarTodo(){
    this.cargando = false;
    this.FormDesperdicio.reset();
    this.grupoDespercios = [];
  }

  // Funcion que va a consultar los operarios
  obtenerOperarios(){
    this.operariosService.getUsuarios().subscribe(datos_operarios => {
      for (let i = 0; i < datos_operarios.length; i++) {
        if (datos_operarios[i].rolUsu_Id == 59) this.operarios.push(datos_operarios[i]);
      }
    });
  }

  //Funcion que va a conultar y obtener todas las areas de la empresa
  obtenerProcesos(){
    this.procesos = [];
    this.procesosService.srvObtenerLista().subscribe(datos_procesos => {
      for (let i = 0; i < datos_procesos.length; i++) {
        let pro : number [] = [10,11,12];
        if (pro.includes(datos_procesos[i].proceso_Codigo)) this.procesos.push(datos_procesos[i]);
      }
    });
  }

  // Funcion que va a consultar y obtener la informacion de las fallas
  obtenerFallas(){
    this.fallasService.srvObtenerLista().subscribe(datos_fallas => {
      for (let i = 0; i < datos_fallas.length; i++) {
        if (datos_fallas[i].tipoFalla_Id == 11) this.fallas.push(datos_fallas[i]);
      }
    });
  }

  // Funcion que va a consultar y obtener la informacion de las maquinas
  obtenerMaquinas(){
    this.maquinasService.GetTodo().subscribe(datos_maquinas => {
      for (let i = 0; i < datos_maquinas.length; i++) {
        if (datos_maquinas[i].tpActv_Id == 4) this.maquinas.push(datos_maquinas[i]);
      }
    });
  }

  // Funcion que va a consultar y obtener la inforamcion de los materiales
  obtenerMateriales(){
    this.materiaService.srvObtenerLista().subscribe(datos_materiales => { this.materiales = datos_materiales });
  }

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
    let orden : number = this.FormDesperdicio.value.OTDesperdicio;
    this.bagProService.srvObtenerListaClienteOT_Item(orden).subscribe(datos_orden => {
      if (datos_orden.length == 0) {
        this.cargando = false;
        this.mostrarError(`Error`, `¡No se pudo obtener información de la orden de trabajo N° ${orden}!`);
      }
      for (let i = 0; i < datos_orden.length; i++) {
        let imp : any = datos_orden[i].impresion.trim();
        if (imp == "1") imp = "SI";
        else if (imp == "0") imp = "NO";
        this.FormDesperdicio.patchValue({
          OTDesperdicio : orden,
          IdProducto : datos_orden[i].clienteItems,
          Producto : datos_orden[i].clienteItemsNom,
          IdTipoMaterial : datos_orden[i].extMaterial,
          TipoMaterial : datos_orden[i].extMaterialNom,
          Impreso : imp,
        });
        this.cargando = false;
      }
    }, error => { this.mostrarError(`Error`, `No se pudo obtener información de la OT N° ${orden}!`); });
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
    } else this.mostrarAdvertencia(`Advertencia`, `Debe llenar los campos vacios!`);
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
          Desp_Fecha : this.grupoDespercios[i].Fecha,
          Desp_Observacion : observacion,
          Usua_Id : this.storage_Id,
          Desp_FechaRegistro : this.today,
          Desp_HoraRegistro : moment().format('H:mm:ss'),
          Proceso_Id : this.grupoDespercios[i].IdArea,
        }
        this.deperdicioService.Insert(info).subscribe(datos_insertados => { this.mostrarConfirmacion(`Confirmación`, `Se ha ingresado el desperdicio exitosamente!`);
        }, error => {
          this.mostrarError(`Error`, `Ha ocurrido un error, no se pudo ingresar el desperdicio!`);
          error = true;
        });
      }
    } else this.mostrarAdvertencia(`Advertencia`, `¡Debe añadir minimo un registro a la tabla para crear un desperdicio!`);

    setTimeout(() => {
      if (!error) {
        this.llenarDatosPdf();
        this.limpiarTodo();
      }
    }, 2000);
  }

  // Funcion que creará un PDF del desperdicio ingresado
  crearPdf(){
    let nombre : string = this.AppComponent.storage_Nombre;
    this.deperdicioService.GetUltimoPedido().subscribe(datos_desperdicios => {
      for (let i = 0; i < datos_desperdicios.length; i++) {
        const pdfDefinicion : any = {
          info: { title: `Reporte Merma de Material - ${this.today}` },
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
                { image : logoParaPdf, width : 220, height : 50 },
                { text: `Reporte Merma de Material`, alignment: 'right',  style: 'titulo', margin: 30 }
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
                    { border: [false, false, false, false], text: `Nombre Empresa` },
                    { border: [false, false, false, true], text: `Plasticaribe S.A.S` },
                    { border: [false, false, false, false], text: `Dirección` },
                    { border: [false, false, false, true], text: `${datos_desperdicios[i].empresa_Direccion}` },
                  ],
                  [
                    { border: [false, false, false, false], text: `Ciudad` },
                    { border: [false, false, false, true], text: `${datos_desperdicios[i].empresa_Ciudad}` },
                    { border: [false, false, false, false], text: `Fecha registro` },
                    { border: [false, false, false, true], text: `${datos_desperdicios[i].desp_FechaRegistro.replace('T00:00:00', '')}` },
                  ],
                ]
              },
              layout: { defaultBorder: false, },
              fontSize: 9,
            },
            '\n \n',
            { text: `Ingresados Por:\n`, alignment: 'left', style: 'header', },
            { text: `${datos_desperdicios[i].nombreCreador}\n`, alignment: 'left', style: 'texto', },
            { text: `\n\n Información detallada de los Desperdicios \n `, alignment: 'center', style: 'header' },

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
    }, error => { this.mostrarError(`Error`,`¡Error al consultar la información del último registro!`); });
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
      setTimeout(() => { this.crearPdf(); }, 2000);
    }, error => { this.mostrarError(`Error`, `¡Error al consultar la información del último registro!`); });
  }

  // Funcion que se encagará de llenar la tabla del pdf
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
        widths: [30, 32, 30, 30, 60, 62, 40, 30, 35, 42, 60],
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

  // Funcion que va a quitar un desperdicio de la tabla
  quitarDesperdicio(data: any){
    data = this.registroSeleccionado;
    this.onReject();
    for (let i = 0; i < this.grupoDespercios.length; i++) {
      if (this.grupoDespercios[i].Ot == data.Ot && this.grupoDespercios[i].NoConformidad == data.NoConformidad) {
        this.grupoDespercios.splice(i, 1);
        this.mostrarConfirmacion(`Confirmación`, `Registro de desperdicio eliminado con éxito!`);
      }
    }
  }

    /** Mostrar mensaje de confirmación  */
  mostrarConfirmacion(mensaje : any, titulo?: any) {
   this.messageService.add({severity: 'success', summary: mensaje,  detail: titulo, life: 2000});
  }

  /** Mostrar mensaje de error  */
  mostrarError(mensaje : any, titulo?: any) {
   this.messageService.add({severity:'error', summary: mensaje, detail: titulo, life: 2000});
   this.cargando =false;
  }

  /** Mostrar mensaje de advertencia */
  mostrarAdvertencia(mensaje : any, titulo?: any) {
   this.messageService.add({severity:'warn', summary: mensaje, detail: titulo, life: 2000});
   this.cargando =false;
  }

  onReject(){
    this.messageService.clear('eleccion');
  }

  mostrarEleccion(item : any){
    this.registroSeleccionado = item;
    this.messageService.add({severity:'warn', key:'eleccion', summary:'Elección', detail: `Está seguro que desea eliminar el desperdicio de la tabla?`, sticky: true});
  }
}
