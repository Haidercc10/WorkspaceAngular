import { Component, Injectable, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShepherdService } from 'angular-shepherd';
import moment from 'moment';
import { MessageService } from 'primeng/api';
import { modelDtSolcitudMP } from 'src/app/Modelo/modelDtSolcitudMP';
import { modelSolicitudMateriaPrima } from 'src/app/Modelo/modelSolicituMateriaPrima';
import { EntradaBOPPService } from 'src/app/Servicios/BOPP/entrada-BOPP.service';
import { CreacionPdfService } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';
import { DetalleSolicitudMateriaPrimaService } from 'src/app/Servicios/DetalleSolicitudMateriaPrima/DetalleSolicitudMateriaPrima.service';
import { MateriaPrimaService } from 'src/app/Servicios/MateriaPrima/materiaPrima.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { SolicitudMateriaPrimaService } from 'src/app/Servicios/SolicitudMateriaPrima/SolicitudMateriaPrima.service';
import { TintasService } from 'src/app/Servicios/Tintas/tintas.service';
import { UnidadMedidaService } from 'src/app/Servicios/UnidadMedida/unidad-medida.service';
import { AppComponent } from 'src/app/app.component';
import { defaultStepOptions, stepsSolicitudMateriaPrima as defaultSteps } from 'src/app/data';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-Solicitud-Materia-Prima',
  templateUrl: './Solicitud-Materia-Prima.component.html',
  styleUrls: ['./Solicitud-Materia-Prima.component.css']
})

export class SolicitudMateriaPrimaComponent implements OnInit {

  formSolicitud !: FormGroup;
  formMateriaPrima !: FormGroup;
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  cargando : boolean = false; //Variable para validar que aparezca o no el icono de carga
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  materiaPrima : any [] = []; //Variable que almacenará las materias primas
  unidadesMedida : any [] = []; //Variable que va a almacenar las unidades de medida
  materiasPrimasSeleccionadas : any [] = []; //Variable que almacenará las materias primas que son escogidas para la solicitud
  materiasPrimasSeleccionada_ID : any [] = []; //Variable que almacenará los ID de las materias primas que se han seleccionado para que no puedan ser elegidas nuevamente
  categoriasMP : any [] = []; //Variable que almcanará las categorias de la tabla Materia_Prima
  categoriasTintas : any [] = []; //Variable que almcanará las categorias de la tabla Tintas
  categoriasBOPP : any [] = []; //Variable que almcanará las categorias de la tabla BOPP
  informacionPDF : any [] = []; //Variable que tendrá la informacion de la materia prima pedida en la orden de compra
  mpSeleccionada : any;
  edicionSolicitud : boolean = false;

  constructor(private frmBuilder : FormBuilder,
                private AppComponent : AppComponent,
                  private messageService: MessageService,
                      private shepherdService: ShepherdService,
                        private undMedidaService : UnidadMedidaService,
                          private materiaPrimaService : MateriaPrimaService,
                            private tintaService : TintasService,
                              private boppService : EntradaBOPPService,
                                private solicitudService : SolicitudMateriaPrimaService,
                                  private dtSolicitudService : DetalleSolicitudMateriaPrimaService,
                                    private msj : MensajesAplicacionService,
                                      private creacionPDFService : CreacionPdfService,) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;

    this.formSolicitud = this.frmBuilder.group({
      Id_Solicitud : [null, Validators.required],
      Observacion : [''],
    });

    this.formMateriaPrima = this.frmBuilder.group({
      Id : [null, Validators.required],
      Nombre : [null, Validators.required],
      Cantidad : [null, Validators.required],
      UnidadMedida : [null, Validators.required],
      Categoria : [null, Validators.required],
    });
  }

  ngOnInit(){
    this.lecturaStorage();
    this.obtenerUnidadesMedida();
    this.obtenerMateriaPrima();
    this.consultarCategorias();
    this.cargarConsecutivo();
    setInterval(() => this.modoSeleccionado = this.AppComponent.temaSeleccionado, 1000);
  }

  // Funcion que va a iniciar el tutorial in-app del componente actual
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

  // Función para quitar mensaje de elección
  cerrarMensaje = (key : string) => this.messageService.clear(key);

  // Funcion que va a limpiar los campos de materia prima
  limpiarCamposMateriaPrima = () => this.formMateriaPrima.reset();

  // Funcion que va a cargar el siguiente numero de codigo que tendrá la solicitud
  cargarConsecutivo = () => this.solicitudService.GetSiguienteConsecutivo().subscribe(data => this.formSolicitud.patchValue({ Id_Solicitud : data }));

  // Funcion que va a limpiar Todo
  limpiarTodo(){
    this.formMateriaPrima.reset();
    this.formSolicitud.reset();
    this.edicionSolicitud = false;
    this.mpSeleccionada = {};
    this.materiasPrimasSeleccionadas = [];
    this.materiasPrimasSeleccionada_ID = [];
    this.cargarConsecutivo();
  }

  // Funcion que va a cargar las unidades de medida
  obtenerUnidadesMedida = () => this.undMedidaService.srvObtenerLista().subscribe(datos_undMedida => this.unidadesMedida = datos_undMedida);

  // Funcion que va a consultar la materia prima
  obtenerMateriaPrima(){
    this.materiaPrimaService.getMpTintaBopp().subscribe(datos_materiaPrimas => {
      this.materiaPrima = datos_materiaPrimas;
      this.materiaPrima.sort((a,b) => a.nombre.localeCompare(b.nombre));
    });
  }

  // Funcion que va a consultar las categorias de las tablas Materia_Prima, Tintas y BOPP
  consultarCategorias(){
    this.materiaPrimaService.GetCategoriasMateriaPrima().subscribe(datos => this.categoriasMP = datos);
    this.tintaService.GetCategoriasTintas().subscribe(datos => this.categoriasTintas = datos);
    this.boppService.GetCategoriasBOPP().subscribe(datos => this.categoriasBOPP = datos);
  }

  //Funcion que va a mostrar el nombre de la materia prima
  cambiarNombreMateriaPrima(){
    let id : number = this.formMateriaPrima.value.Nombre || this.formMateriaPrima.value.Id;
    this.materiaPrimaService.getInfoMpTintaBopp(id).subscribe(datos_materiaPrima => {
      for (let i = 0; i < datos_materiaPrima.length; i++) {
        this.formMateriaPrima.patchValue({
          Id : datos_materiaPrima[i].id,
          Nombre : datos_materiaPrima[i].nombre,
          Cantidad : 0,
          UnidadMedida : datos_materiaPrima[i].undMedida,
          Categoria : datos_materiaPrima[i].categoria,
        });
      }
    }, error => {
      this.msj.mensajeError(`Error`, `¡No se pudo obtener información sobre la materia prima seleccionada!`);
      this.cargando = false;
  });
  }

  // Funcion que va a añadir la materia prima a la tabla
  cargarMateriaPrima(){
    let categoria : number = this.formMateriaPrima.value.Categoria;
    if (this.formMateriaPrima.valid){
      if (!this.materiasPrimasSeleccionada_ID.includes(this.formMateriaPrima.value.Id)) {
        if (this.formMateriaPrima.value.Cantidad > 0){
          let info : any = {
            Id : this.formMateriaPrima.value.Id,
            Id_Mp: 84,
            Id_Tinta: 2001,
            Id_Bopp: 1,
            Nombre : this.formMateriaPrima.value.Nombre,
            Cantidad : this.formMateriaPrima.value.Cantidad,
            Und_Medida : this.formMateriaPrima.value.UnidadMedida,
          }
          if (this.categoriasTintas.includes(categoria)) info.Id_Tinta = info.Id;
          else if (this.categoriasMP.includes(categoria)) info.Id_Mp = info.Id;
          else if (this.categoriasBOPP.includes(categoria)) info.Id_Bopp = info.Id;
          this.materiasPrimasSeleccionada_ID.push(this.formMateriaPrima.value.Id);
          this.materiasPrimasSeleccionadas.push(info);
          this.formMateriaPrima.reset();
        } else this.msj.mensajeAdvertencia(`Advertencia`, `¡La cantidad de la materia prima seleccionada debe ser mayor a 0!`);
      } else this.msj.mensajeAdvertencia(`Advertencia`, `¡La materia prima '${this.formMateriaPrima.value.Nombre}' ya fue seleccionada previamante!`);
    } else this.msj.mensajeAdvertencia(`Advertencia`, `¡Hay campos vacios!`);
  }

  // Función que va a mandar un mensaje de confirmación para quitar materias primas seleccionadas previamente
  QuitarMateriaPrimaTabla(data : any) {
    this.messageService.add({
      severity:'warn',
      key: 'quitar',
      summary:'¿Estás seguro de quitar la materia prima de la solicitud?',
      detail:
      `<b>ID:</b> ${data.Id} <br> ` +
      `<b>Materia Prima:</b> ${data.Nombre} <br>` +
      `<b>Cantidad:</b> ${this.formatonumeros(data.Cantidad)} <br>`,
      sticky: true
    });
    this.mpSeleccionada = data;
  }

  // Funcion que va a quitar la materia prima de la tabla
  quitarMateriaPrima(){
    this.cerrarMensaje('quitar');
    this.materiasPrimasSeleccionadas.splice(this.materiasPrimasSeleccionadas.findIndex((item) => item.Id == this.mpSeleccionada.Id), 1);
    this.materiasPrimasSeleccionada_ID.splice(this.materiasPrimasSeleccionada_ID.findIndex((item) => item.Id == this.mpSeleccionada.Id), 1);
    this.msj.mensajeConfirmacion(`Confirmación`, `Se ha quitado la materia prima seleccionada de la tabla!`);
  }

  // Funcion que enviará un mensaje de confirmación para validar que si se desea eliminar la materia prima escogida
  eliminarMateriaPrimaTabla(data : any){
    this.messageService.add({
      severity:'warn',
      key: 'eliminar',
      summary:'¿Estás seguro de eliminar la materia prima de la solicitud (al hacerlo se eliminará de la base de datos)?',
      detail:
      `<b>ID:</b> ${data.Id} <br> ` +
      `<b>Materia Prima:</b> ${data.Nombre} <br>` +
      `<b>Cantidad:</b> ${this.formatonumeros(data.Cantidad)} <br>`,
      sticky: true
    });
    this.mpSeleccionada = data;
  }

  // Funcion que va a elminar de la base de datos una de las materias primas, bopp, tintas escogidas al momento de editar la solicitud
  eliminarMateriaPrima(){
    this.cerrarMensaje('eliminar');
    this.dtSolicitudService.GetMateriaPrimaSolicitud(this.formSolicitud.value.Id_Solicitud, this.mpSeleccionada.Id).subscribe(data => {
      for (let i = 0; i < data.length; i++) {
        this.dtSolicitudService.Delete(data[i].dtSolicitud_Id).subscribe(datos => {
          this.msj.mensajeConfirmacion(`¡Materia Prima Eliminada!`, `¡Se ha eliminado la materia prima con el ID ${this.mpSeleccionada.Id} de la solicitud!`);
        });
      }
    });
    this.quitarMateriaPrima();
  }

  // Función que va a validar si la información para crear la solicitud es correcta
  validarDatosSolicitud(){
    if (this.materiasPrimasSeleccionadas.length > 0) !this.edicionSolicitud ? this.crearSolicitud() : this.editarSolicitud();
    else this.msj.mensajeAdvertencia(`Advertencia`, `¡Debe seleccionar al menos una materia prima!`);
  }

  // Función que va a crear una solicitud de materia prima
  crearSolicitud(){
    this.cargando = true;
    let info : modelSolicitudMateriaPrima = {
      Usua_Id: this.storage_Id,
      Solicitud_Observacion: this.formSolicitud.value.Observacion == null ? '' : (this.formSolicitud.value.Observacion).toUpperCase(),
      Solicitud_Fecha: moment().format('YYYY-MM-DD'),
      Solicitud_Hora: moment().format('H:mm:ss'),
      Estado_Id: 11,
    }
    this.solicitudService.Post(info).subscribe(data => this.crearDetallesSolicitud(data.solicitud_Id),
    error => {
      this.msj.mensajeError(`¡No fue posible crear la solicitud!`, `¡Ocurrió un error al intentar crear la solicitud de materia prima!`);
      this.cargando = false;
    })
  }

  // Función que va a crear los detalles de solicitud de materia prima
  crearDetallesSolicitud(solicitud_Id : number){
    let err : boolean = false;
    for (let i = 0; i < this.materiasPrimasSeleccionadas.length; i++) {
      let info : modelDtSolcitudMP = {
        Solicitud_Id: solicitud_Id,
        MatPri_Id: this.materiasPrimasSeleccionadas[i].Id_Mp,
        Tinta_Id: this.materiasPrimasSeleccionadas[i].Id_Tinta,
        Bopp_Id: this.materiasPrimasSeleccionadas[i].Id_Bopp,
        DtSolicitud_Cantidad: this.materiasPrimasSeleccionadas[i].Cantidad,
        UndMed_Id: this.materiasPrimasSeleccionadas[i].Und_Medida,
        Estado_Id: 11
      }
      this.dtSolicitudService.Post(info).subscribe(data => this.msj.mensajeConfirmacion(`¡Se ha creado la solicitud de materia prima!`, `¡Se creó correctamente la solicitud de materia prima!`),
      error => err = true);
    }
    setTimeout(() => {
      if (!err) {
        this.buscarInfoSolicitud_PDF(solicitud_Id);
        this.limpiarTodo();
      } else {
        this.msj.mensajeError(`¡No fue posible editar la solicitud!`, `¡Ocurrió un error al intentear guardar las materias primas de la solicitud!`);
        this.cargando = false;
      }
    }, 1500);
  }

  // Funcion que va a consultar la información de la solicitud
  consultarSolicitud(){
    let solicitud_Id = this.formSolicitud.value.Id_Solicitud;
    let exp = /^([0-9])*$/;

    if (solicitud_Id) {
      this.limpiarTodo();
      this.dtSolicitudService.GetInfoSolicitud(solicitud_Id).subscribe(data => {
        for (let i = 0; i < data.length; i++) {
          this.edicionSolicitud = true;
          this.formSolicitud.patchValue({
            Id_Solicitud : data[i].consecutivo,
            Observacion : data[i].observacion,
          });
          let info : any = {
            Id : 0,
            Id_Mp: data[i].mP_Id,
            Id_Tinta: data[i].tinta_Id,
            Id_Bopp: data[i].bopp_Id,
            Nombre : '',
            Cantidad : data[i].cantidad,
            Und_Medida : data[i].unidad_Medida,
          }
          if (info.Id_Mp != 84) {
            info.Id = info.Id_Mp;
            info.Nombre = data[i].mp;
          } else if (info.Id_Tinta != 2001) {
            info.Id = info.Id_Tinta;
            info.Nombre = data[i].tinta;
          } else if (info.Id_Bopp != 1) {
            info.Id = info.Id_Bopp;
            info.Nombre = data[i].bopp;
          }
          this.materiasPrimasSeleccionada_ID.push(info.Id);
          this.materiasPrimasSeleccionadas.push(info);
        }
      }, error => { this.msj.mensajeError(`¡El número de la solicitud no existe!`, `${error.error}`); this.cargando = false });
    } else this.msj.mensajeAdvertencia(`Advertencia`, `¡La inforamción que ha digitado no es valida, debe digitar solo números sin caracteres especiales!`);
  }

  // Funcion que va a editar la información de la solicitud
  editarSolicitud(){
    this.cargando = true;
    let info : modelSolicitudMateriaPrima = {
      Solicitud_Id : this.formSolicitud.value.Id_Solicitud,
      Usua_Id: this.storage_Id,
      Solicitud_Observacion: this.formSolicitud.value.Observacion == null ? '' : (this.formSolicitud.value.Observacion).toUpperCase(),
      Solicitud_Fecha: moment().format('YYYY-MM-DD'),
      Solicitud_Hora: moment().format('H:mm:ss'),
      Estado_Id: 11,
    }
    this.solicitudService.Put(this.formSolicitud.value.Id_Solicitud, info).subscribe(data => this.editarDtSolicitud(info.Solicitud_Id),
    error => { this.msj.mensajeError(`¡No fue posible editar la solicitud!`, `¡Ocurrió un error al intentar editar la solicitud de materia prima!`); this.cargando = false; });
  }

  // Funcion que agregará las materias primas a la solicitud que está siendo editada
  editarDtSolicitud(solicitud_Id : number){
    let err : boolean = false;
    for (let i = 0; i < this.materiasPrimasSeleccionadas.length; i++) {
      this.dtSolicitudService.GetMateriaPrimaSolicitud(solicitud_Id, this.materiasPrimasSeleccionadas[i].Id).subscribe(data => {
      }, error => {
        let info : modelDtSolcitudMP = {
          Solicitud_Id: solicitud_Id,
          MatPri_Id: this.materiasPrimasSeleccionadas[i].Id_Mp,
          Tinta_Id: this.materiasPrimasSeleccionadas[i].Id_Tinta,
          Bopp_Id: this.materiasPrimasSeleccionadas[i].Id_Bopp,
          DtSolicitud_Cantidad: this.materiasPrimasSeleccionadas[i].Cantidad,
          UndMed_Id: this.materiasPrimasSeleccionadas[i].Und_Medida,
          Estado_Id: 11
        }
        this.dtSolicitudService.Post(info).subscribe(datos => this.msj.mensajeConfirmacion(`¡Se ha editado la solicitud de materia prima!`, `¡Se editó correctamente la solicitud de materia prima!`),
        error => err = true);
      });
    }
    setTimeout(() => {
      if (!err) {
        this.buscarInfoSolicitud_PDF(solicitud_Id);
        this.limpiarTodo();
      } else this.msj.mensajeError(`¡No fue posible editar la solicitud!`, `¡Ocurrió un error al intentear guardar las materias primas de la solicitud!`);
    }, 1500);
  }

  // Funcion que va a conasultar las materias primas que tiene el pdf
  buscarInfoSolicitud_PDF(solicitud_Id : any = 0){
    this.informacionPDF = [];
    if (solicitud_Id == 0) solicitud_Id = this.formSolicitud.value.Id_Solicitud;
    if (solicitud_Id) {
      this.dtSolicitudService.GetInfoSolicitud(solicitud_Id).subscribe(data => {
      this.cargando = true;
        for (let i = 0; i < data.length; i++) {
          let info : any = {
            Id : 0,
            Id_Mp: data[i].mP_Id,
            Id_Tinta: data[i].tinta_Id,
            Id_Bopp: data[i].bopp_Id,
            Nombre : '',
            Cantidad : this.formatonumeros(data[i].cantidad),
            Medida : data[i].unidad_Medida,
            Estado : data[i].estado_MP,
          }
          if (info.Id_Mp != 84) {
            info.Id = info.Id_Mp;
            info.Nombre = data[i].mp;
          } else if (info.Id_Tinta != 2001) {
            info.Id = info.Id_Tinta;
            info.Nombre = data[i].tinta;
          } else if (info.Id_Bopp != 1) {
            info.Id = info.Id_Bopp;
            info.Nombre = data[i].bopp;
          }
          this.informacionPDF.push(info);
          this.informacionPDF.sort((a,b) => a.Nombre.localeCompare(b.Nombre));
        }
        setTimeout(() => this.crearPDF(solicitud_Id), 1000);
      }, error => this.msj.mensajeError(`¡El número de la solicitud no existe!`, `${error.error}`));
    } else this.msj.mensajeAdvertencia(`Advertencia`, `¡La inforamción que ha digitado no es valida, debe digitar solo números sin caracteres especiales!`);
  }

  // Funcion que va a crear un pdf de la solicitud creada o editada
  crearPDF(solicitud_Id : number){
    this.dtSolicitudService.GetInfoSolicitud(solicitud_Id).subscribe(datos_orden => {
      for (let i = 0; i < datos_orden.length; i++) {
        let titulo : string = `Solicitud de Materia Prima N° ${datos_orden[i].consecutivo}`;
        let content : any [] = this.contenidoPDF(datos_orden[i]);
        this.creacionPDFService.formatoPDF(titulo, content);
        setTimeout(() => this.cargando = false, 3000);
        break;
      }
    }, error => {
      this.msj.mensajeError(`¡El número de la solicitud no existe!`, `${error.error}`);
      this.cargando = false;
    });
  }

  contenidoPDF(datos_orden){
    let data : any [] = [];
    data.push(this.informacionMateriaPrimaPDF());
    data.push(this.datosMateriasPrimasPDF());
    data.push(this.observacionPDF(datos_orden));
    return data;
  }

  informacionMateriaPrimaPDF(){
    return {
      text: `\n\n Información detallada de la(s) Materia(s) Prima(s) \n `,
      alignment: 'center',
      style: 'header'
    }
  }

  datosMateriasPrimasPDF(){
    return this.table(this.informacionPDF, ['Id', 'Nombre', 'Cantidad', 'Medida', 'Estado']);
  }

  // Funcion que genera la tabla donde se mostrará la información de los productos pedidos
  table(data, columns) {
    return {
      table: {
        headerRows: 1,
        widths: ['10%', '50%', '15%', '10%', '15%'],
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
}
