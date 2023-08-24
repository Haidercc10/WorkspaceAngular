import { Component, OnInit } from '@angular/core';
import { ShepherdService } from 'angular-shepherd';
import moment from 'moment';
import { modelControlCalidad_CorteDoblado, modelControlCalidad_Impresion } from 'src/app/Modelo/modelControlCalidad';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { ControlCalidad_CorteDobladoService } from 'src/app/Servicios/ControlCalidad_CorteDoblado/ControlCalidad_CorteDoblado.service';
import { ControlCalidad_ImpresionService } from 'src/app/Servicios/ControlCalidad_Impresion/ControlCalidad_Impresion.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { AppComponent } from 'src/app/app.component';
import { defaultStepOptions, CertificadoCalidad as defaultSteps } from 'src/app/data';

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

  ubicacionFotoCelda : string [] = ['IZQUIERDA','DERECHA']; //Variable que se usará para almacenar la ubicacion de la fotocelda en el proceso de impresión
  turno : string [] = ['DIA','NOCHE']; //Variable que se usará para almacenar el turno
  datosClonados : any [] = []; //Variable que se usará para almacenar los datos clonados
  datosControlCal_Extrusion : any [] = []; //Variable que va a almacenar los datos del control de calidad del area de extrusion
  datosControlCal_Impresion : any [] = []; //Variable que va a almacenar los datos del control de calidad del area de impresion
  datosControlCal_Doblado : any [] = []; //Variable que va a almacenar los datos del control de calidad del area de doblado

  constructor(private AppComponent : AppComponent,
                private msj : MensajesAplicacionService,
                  private shepherdService: ShepherdService,
                    private controlDbl : ControlCalidad_CorteDobladoService,
                      private controlImp : ControlCalidad_ImpresionService,
                        private bagproService : BagproService,) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
  }

  ngOnInit(): void {
    this.lecturaStorage();
    this.ConsultarDatosControlCal_Impresion();
    this.ConsultarDatosControlCal_DobladoCorte();
  }

  tutorial() {
    this.shepherdService.defaultStepOptions = defaultStepOptions;
    this.shepherdService.modal = true;
    this.shepherdService.confirmCancel = false;
    this.shepherdService.addSteps(defaultSteps);
    this.shepherdService.start();
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  // Funcion que va a añadir una fila mas a la tabla de impresion, para que pueda ser agregado un dato  
  AgregarFila_Impresion() {
    if (this.datosControlCal_Impresion[this.datosControlCal_Impresion.length - 1].Id_PkBd != 0) {
      this.datosControlCal_Impresion.push({ 
        Id : this.datosControlCal_Impresion.length == 0 ? 1 : this.datosControlCal_Impresion[this.datosControlCal_Impresion.length - 1].Id + 1, 
        Id_PkBd : 0 
      });
    } else this.msj.mensajeAdvertencia(`¡Solo puede agregar un dato a la vez!`);
  }

  // Funcion que va añadir una fila mas a la tabla, para que pueda ser agregado un dato a doblado
  AgregarFila_Doblado() {
    if (this.datosControlCal_Doblado[this.datosControlCal_Doblado.length - 1].Id_PkBd != 0) {
      this.datosControlCal_Doblado.push({ 
        Id : this.datosControlCal_Doblado.length == 0 ? 1 : this.datosControlCal_Doblado[this.datosControlCal_Doblado.length - 1].Id + 1, 
        Id_PkBd : 0 
      });
    } else this.msj.mensajeAdvertencia(`¡Solo puede agregar un dato a la vez!`);
  }

  // Fucion que va a consultar los datos de los controles de calidad del area de extrusión
  ConsultarDatosControlCal_Extrusion() {
  }

  // Fucion que va a consultar los datos de los controles de calidad del area de impresión
  ConsultarDatosControlCal_Impresion() {
    this.datosControlCal_Impresion = [];
    this.controlImp.GetRegistrosHoy().subscribe(data => {
      this.cargando = true;
      data.forEach(control => {
        this.datosControlCal_Impresion.push({
          Id : this.datosControlCal_Impresion.length == 0 ? 1 : this.datosControlCal_Impresion[this.datosControlCal_Impresion.length - 1].Id + 1,
          Id_PkBd : control.id,
          Turno_Id : control.turno_Id,
          Maquina : control.maquina,
          Ronda : control.ronda,
          Orden_Trabajo : control.orden_Trabajo,
          Cliente : control.cliente,
          Prod_Id : control.prod_Id,
          Nombre_Producto : control.nombre_Producto,
          LoteRollo_SinImpresion : control.loteRollo_SinImpresion,
          Prueba_Tratado : control.prueba_Tratado,
          Ancho_Rollo : control.ancho_Rollo,
          Secuencia_Cian : control.secuencia_Cian,
          Secuencia_Magenta : control.secuencia_Magenta,
          Secuencia_Amarillo : control.secuencia_Amarillo,
          Secuencia_Negro : control.secuencia_Negro,
          Secuencia_Base : control.secuencia_Base,
          Secuencia_Pantone1 : control.secuencia_Pantone1,
          Secuencia_Pantone2 : control.secuencia_Pantone2,
          Secuencia_Pantone3 : control.secuencia_Pantone3,
          Secuencia_Pantone4 : control.secuencia_Pantone4,
          Tipo_Embobinado : control.tipo_Embobinado,
          Codigo_Barras : control.codigo_Barras,
          Texto : control.texto,
          Fotocelda : control.fotocelda_Izquierda ? 'IZQUIERDA' : 'DERECHA',
          Fotocelda_Izquierda : control.fotocelda_Izquierda,
          Fotcelda_Derecha : control.fotcelda_Derecha,
          Registro_Colores : control.registro_Colores,
          Adherencia_Tinta : control.adherencia_Tinta,
          Conformidad_Laminado : control.conformidad_Laminado,
          PasoGuia_Repetecion : control.pasoGuia_Repetecion,
          Observacion : control.observacion,
        });
        this.cargando = false;
      });
    });
  }

  // Fucion que va a consultar los datos de los controles de calidad del area de doblado y corte
  ConsultarDatosControlCal_DobladoCorte() {
    this.datosControlCal_Doblado = [];
    this.controlDbl.GetRegistrosHoy().subscribe(data => {
      this.cargando = true;
      data.forEach(control => {
        this.datosControlCal_Doblado.push({
          Id : this.datosControlCal_Doblado.length == 0 ? 1 : this.datosControlCal_Doblado[this.datosControlCal_Doblado.length - 1].Id + 1,
          Id_PkBd : control.id,
          orden : control.orden_Trabajo,
          ronda : control.ronda,
          maquina : control.maquina,
          turno : control.turno_Id,
          cliente : control.cliente,
          item : control.prod_Id,
          referencia : control.nombre_Producto,
          ancho : control.ancho,
          calibre : control.calibre,
          codBarras : control.codigo_Barras,
          tpEmbobinado : control.tipo_Embobinado,
          pasoGuia : control.pasoEntre_Guia,
          observacion : control.observacion,
        });
        this.cargando = false;
      });
    });
  }

  // Fucion que va a consultar los datos de los controles de calidad del area de sellado
  ConsultarDatosControlCal_Sellado() {
  }

  // Función que va a crear una copia de la información que se está editando
  editandoFila = (data : any)  => this.datosClonados[data.Id as string] = { ...data };

  // Función que va a eliminar la copia de la información que se estaban editando y restablecerá los datos de la tabla a como estaban antes de empezar la edición
  edicionCancelada(data: any, index: number, controlCalidad : string) {
    if (controlCalidad == 'DOBLADO') this.datosControlCal_Doblado[index] = this.datosClonados[data.Id as string];
    else if (controlCalidad == 'IMPRESION') this.datosControlCal_Impresion[index] = this.datosClonados[data.Id as string];
    delete this.datosClonados[data.Id as string];
  }

  // Funcion que va a consultar los datos de una orden de trabajo en el proceso de doblado y corte
  consultarDatosOrdenTrabajo_ProcExtrusion(orden : string, id : number, procesos : any) {
    this.cargando = true;
    this.bagproService.GetInformacionOrden_ProcesoExt(orden, procesos).subscribe(data => {
      let turno : string, maquina : string [] = [];
      const time = moment(moment(), 'hh:mm:ss');
      const beforeTime = moment('07:00:00', 'hh:mm:ss');
      const afterTime = moment('17:59:59', 'hh:mm:ss');
      (time.isBetween(beforeTime, afterTime)) ? turno = 'DIA' : (time.isBetween(afterTime, beforeTime)) ? turno = 'NOCHE' : ``;

      data.forEach(ot => {
        if (!maquina.includes(ot.maquina)) {
          maquina.push(ot.maquina);
          if (['DOBLADO','CORTE','EMPAQUE'].includes(ot.nomStatus)) this.llenarDatosOrdenTrabajo_DobladoCorte(ot, id, orden, turno);
          else if (['ROTOGRABADO', 'IMPRESION'].includes(ot.nomStatus)) this.llenarDatosOrdenTrabajo_Impresion(ot, id, orden, turno);
        }
      });

      if (procesos == '|DOBLADO|EMPAQUE|CORTE|') this.datosControlCal_Doblado.splice(this.datosControlCal_Doblado.findIndex(item => item.Id == id), 1);
      else if (procesos == '|ROTOGRABADO|IMPRESION|') this.datosControlCal_Impresion.splice(this.datosControlCal_Impresion.findIndex(item => item.Id == id), 1);
      
    }, () => {
      this.msj.mensajeError(`¡No se encontró información de la OT '${orden}' en el proceso ${procesos.replaceAll('|', ', ')}!`);
      this.cargando = false;
    }, () => this.cargando = false);
  }

  // Funcion que va a llenar datos de la orden de trabajo en el proceso de doblado y corte
  llenarDatosOrdenTrabajo_DobladoCorte(ot : any, id : number, orden : string, turno : string) {    
    const info : any = {
      Id : id,
      Id_PkBd : 0,
      orden : orden,
      ronda : ``,
      maquina : ot.maquina.toString(),
      turno : turno,
      cliente : ot.clienteNombre.trim(),
      item : parseInt(ot.clienteItem),
      referencia : ot.clienteItemNombre.trim(),
      ancho : parseFloat(ot.extancho),
      calibre : parseFloat(ot.calibre),
      codBarras : ``,
      tpEmbobinado : ``,
      pasoGuia : ``,
      observacion : ``,
    };
    info.id = this.datosControlCal_Doblado.length == 0 ? 1 : this.datosControlCal_Doblado[this.datosControlCal_Doblado.length - 1].Id + 1;
    id = info.Id;
    this.datosControlCal_Doblado.push(info);
    this.controlDbl.GetUltRegistroItem(parseInt(ot.clienteItem)).subscribe(res => {
      let i : number = this.datosControlCal_Doblado.findIndex(item => item.Id == id);
      this.datosControlCal_Doblado[i].ancho = res.ancho;
      this.datosControlCal_Doblado[i].calibre = res.calibre;
      this.datosControlCal_Doblado[i].codBarras = res.codigo_Barras;
      this.datosControlCal_Doblado[i].tpEmbobinado = res.tipo_Embobinado;
      this.datosControlCal_Doblado[i].pasoGuia = res.pasoEntre_Guia;
      this.datosControlCal_Doblado[i].observacion = res.observacion;
    });
  }

  // Funcion que va a llenar datos de la orden de trabajo en el proceso de impresion
  llenarDatosOrdenTrabajo_Impresion(ot : any, id : number, orden : string, turno : string) {
    const info : any = {
      Id : id,
      Id_PkBd : 0,
      Turno_Id : turno,
      Maquina : ot.maquina.toString(),
      Ronda : ``,
      Orden_Trabajo : orden,
      Cliente : ot.clienteNombre.trim(),
      Prod_Id : parseInt(ot.clienteItem),
      Nombre_Producto : ot.clienteItemNombre.trim(),
      LoteRollo_SinImpresion : ``,
      Prueba_Tratado : ``,
      Ancho_Rollo : 0,
      Secuencia_Cian : ``,
      Secuencia_Magenta : ``,
      Secuencia_Amarillo : ``,
      Secuencia_Negro : ``,
      Secuencia_Base : ``,
      Secuencia_Pantone1 : ``,
      Secuencia_Pantone2 : ``,
      Secuencia_Pantone3 : ``,
      Secuencia_Pantone4 : ``,
      Tipo_Embobinado : ``,
      Codigo_Barras : ``,
      Texto : ``,
      Fotocelda : ``,
      Fotocelda_Izquierda : ``,
      Fotcelda_Derecha : ``,
      Registro_Colores : ``,
      Adherencia_Tinta : ``,
      Conformidad_Laminado : ``,
      PasoGuia_Repetecion : ``,
      Observacion : ``,
    }    
    info.Id = this.datosControlCal_Impresion.length == 0 ? 1 : this.datosControlCal_Impresion[this.datosControlCal_Impresion.length - 1].Id + 1;
    id = info.Id;
    this.datosControlCal_Impresion.push(info);    
    this.controlImp.GetUltRegistroItem(parseInt(ot.clienteItem)).subscribe(res => {
      let i : number = this.datosControlCal_Impresion.findIndex(item => item.Id == id);
      this.datosControlCal_Impresion[i].LoteRollo_SinImpresion = res.loteRollo_SinImpresion;
      this.datosControlCal_Impresion[i].Prueba_Tratado = res.prueba_Tratado;
      this.datosControlCal_Impresion[i].Ancho_Rollo = res.ancho_Rollo;
      this.datosControlCal_Impresion[i].Secuencia_Cian = res.secuencia_Cian;
      this.datosControlCal_Impresion[i].Secuencia_Magenta = res.secuencia_Magenta;
      this.datosControlCal_Impresion[i].Secuencia_Amarillo = res.secuencia_Amarillo;
      this.datosControlCal_Impresion[i].Secuencia_Negro = res.secuencia_Negro;
      this.datosControlCal_Impresion[i].Secuencia_Base = res.secuencia_Base;
      this.datosControlCal_Impresion[i].Secuencia_Pantone1 = res.secuencia_Pantone1;
      this.datosControlCal_Impresion[i].Secuencia_Pantone2 = res.secuencia_Pantone2;
      this.datosControlCal_Impresion[i].Secuencia_Pantone3 = res.secuencia_Pantone3;
      this.datosControlCal_Impresion[i].Secuencia_Pantone4 = res.secuencia_Pantone4;
      this.datosControlCal_Impresion[i].Tipo_Embobinado = res.tipo_Embobinado;
      this.datosControlCal_Impresion[i].Codigo_Barras = res.codigo_Barras;
      this.datosControlCal_Impresion[i].Texto = res.texto;
      this.datosControlCal_Impresion[i].Fotocelda = this.datosControlCal_Impresion[i].Fotocelda_Izquierda ? 'IZQUIERDA' : 'DERECHA';
      this.datosControlCal_Impresion[i].Fotocelda_Izquierda = this.datosControlCal_Impresion[i].Fotocelda == 'IZQUIERDA' ? true : false;
      this.datosControlCal_Impresion[i].Fotcelda_Derecha = this.datosControlCal_Impresion[i].Fotocelda == 'DERECHA' ? true : false;
      this.datosControlCal_Impresion[i].Registro_Colores = res.registro_Colores;
      this.datosControlCal_Impresion[i].Adherencia_Tinta = res.adherencia_Tinta;
      this.datosControlCal_Impresion[i].Conformidad_Laminado = res.conformidad_Laminado;
      this.datosControlCal_Impresion[i].PasoGuia_Repetecion = res.pasoGuia_Repetecion;
      this.datosControlCal_Impresion[i].Observacion = res.observacion;
    });
  }

  // Funcion que va a validar que los datos del control de calidad de doblado estén completos y ver si el control de calidad de impresion ya existe
  validarDatosControlCal_Impresion(datos : any) {
    if (datos.Id_PkBd == 0) this.guardarControlCalidad_Imp(datos.Id);
    else if (datos.Id_PkBd > 0) this.controlImp.Get_Id(datos.Id_PkBd).subscribe(data => this.actualizarControlCalidad_Imp(data.id));
    else this.msj.mensajeAdvertencia(`¡Debe llenar los campos buscando una orden de trabajo!`);
  }

  // Funcion que va a enviar al api los datos del control de calidad de impresion que se desea almacenar
  guardarControlCalidad_Imp(id : number){
    this.cargando = true;
    let i : number = this.datosControlCal_Impresion.findIndex(item => item.Id == id);
    const control : modelControlCalidad_Impresion = {
      Usua_Id: this.storage_Id,
      Fecha_Registro: moment().format('YYYY-MM-DD'),
      Hora_Registro: moment().format('HH:mm:ss'),
      Turno_Id: this.datosControlCal_Impresion[i].Turno_Id,
      Maquina: this.datosControlCal_Impresion[i].Maquina,
      Ronda: this.datosControlCal_Impresion[i].Ronda,
      Orden_Trabajo: this.datosControlCal_Impresion[i].Orden_Trabajo,
      Cliente: this.datosControlCal_Impresion[i].Cliente,
      Prod_Id: this.datosControlCal_Impresion[i].Prod_Id,
      Nombre_Producto: this.datosControlCal_Impresion[i].Nombre_Producto,
      LoteRollo_SinImpresion: this.datosControlCal_Impresion[i].LoteRollo_SinImpresion,
      Prueba_Tratado: this.datosControlCal_Impresion[i].Prueba_Tratado,
      Ancho_Rollo: this.datosControlCal_Impresion[i].Ancho_Rollo,
      Secuencia_Cian: this.datosControlCal_Impresion[i].Secuencia_Cian,
      Secuencia_Magenta: this.datosControlCal_Impresion[i].Secuencia_Magenta,
      Secuencia_Amarillo: this.datosControlCal_Impresion[i].Secuencia_Amarillo,
      Secuencia_Negro: this.datosControlCal_Impresion[i].Secuencia_Negro,
      Secuencia_Base: this.datosControlCal_Impresion[i].Secuencia_Base,
      Secuencia_Pantone1: this.datosControlCal_Impresion[i].Secuencia_Pantone1,
      Secuencia_Pantone2: this.datosControlCal_Impresion[i].Secuencia_Pantone2,
      Secuencia_Pantone3: this.datosControlCal_Impresion[i].Secuencia_Pantone3,
      Secuencia_Pantone4: this.datosControlCal_Impresion[i].Secuencia_Pantone4,
      Tipo_Embobinado: this.datosControlCal_Impresion[i].Tipo_Embobinado,
      Codigo_Barras: this.datosControlCal_Impresion[i].Codigo_Barras,
      Texto: this.datosControlCal_Impresion[i].Texto,
      Fotocelda_Izquierda: this.datosControlCal_Impresion[i].Fotocelda == 'IZQUIERDA' ? true : false,
      Fotcelda_Derecha: this.datosControlCal_Impresion[i].Fotocelda == 'DERECHA' ? true : false,
      Registro_Colores: this.datosControlCal_Impresion[i].Registro_Colores,
      Adherencia_Tinta: this.datosControlCal_Impresion[i].Adherencia_Tinta,
      Conformidad_Laminado: this.datosControlCal_Impresion[i].Conformidad_Laminado,
      PasoGuia_Repetecion: this.datosControlCal_Impresion[i].PasoGuia_Repetecion,
      Observacion: this.datosControlCal_Impresion[i].Observacion
    }
    this.controlImp.Post(control).subscribe(() => {
      this.msj.mensajeConfirmacion(`¡Registro guardado exitosamente!`);
      this.ConsultarDatosControlCal_Impresion();
    }, () => {
      this.msj.mensajeError(`¡No se pudo guardar el registro!`);
      this.cargando = false;
    }, () => this.cargando = false);
  }

  // Funcion que va a enviar al api los datos del control de calidad de impresion que se desea actualizar
  actualizarControlCalidad_Imp(id : number) {
    this.cargando = true;
    let i : number = this.datosControlCal_Impresion.findIndex(item => item.Id == id);
    const control : modelControlCalidad_Impresion = {
      Id : id,
      Usua_Id: this.storage_Id,
      Fecha_Registro: moment().format('YYYY-MM-DD'),
      Hora_Registro: moment().format('HH:mm:ss'),
      Turno_Id: this.datosControlCal_Impresion[i].Turno_Id,
      Maquina: this.datosControlCal_Impresion[i].Maquina,
      Ronda: this.datosControlCal_Impresion[i].Ronda,
      Orden_Trabajo: this.datosControlCal_Impresion[i].Orden_Trabajo,
      Cliente: this.datosControlCal_Impresion[i].Cliente,
      Prod_Id: this.datosControlCal_Impresion[i].Prod_Id,
      Nombre_Producto: this.datosControlCal_Impresion[i].Nombre_Producto,
      LoteRollo_SinImpresion: this.datosControlCal_Impresion[i].LoteRollo_SinImpresion,
      Prueba_Tratado: this.datosControlCal_Impresion[i].Prueba_Tratado,
      Ancho_Rollo: this.datosControlCal_Impresion[i].Ancho_Rollo,
      Secuencia_Cian: this.datosControlCal_Impresion[i].Secuencia_Cian,
      Secuencia_Magenta: this.datosControlCal_Impresion[i].Secuencia_Magenta,
      Secuencia_Amarillo: this.datosControlCal_Impresion[i].Secuencia_Amarillo,
      Secuencia_Negro: this.datosControlCal_Impresion[i].Secuencia_Negro,
      Secuencia_Base: this.datosControlCal_Impresion[i].Secuencia_Base,
      Secuencia_Pantone1: this.datosControlCal_Impresion[i].Secuencia_Pantone1,
      Secuencia_Pantone2: this.datosControlCal_Impresion[i].Secuencia_Pantone2,
      Secuencia_Pantone3: this.datosControlCal_Impresion[i].Secuencia_Pantone3,
      Secuencia_Pantone4: this.datosControlCal_Impresion[i].Secuencia_Pantone4,
      Tipo_Embobinado: this.datosControlCal_Impresion[i].Tipo_Embobinado,
      Codigo_Barras: this.datosControlCal_Impresion[i].Codigo_Barras,
      Texto: this.datosControlCal_Impresion[i].Texto,
      Fotocelda_Izquierda: this.datosControlCal_Impresion[i].Fotocelda == 'IZQUIERDA' ? true : false,
      Fotcelda_Derecha: this.datosControlCal_Impresion[i].Fotocelda == 'DERECHA' ? true : false,
      Registro_Colores: this.datosControlCal_Impresion[i].Registro_Colores,
      Adherencia_Tinta: this.datosControlCal_Impresion[i].Adherencia_Tinta,
      Conformidad_Laminado: this.datosControlCal_Impresion[i].Conformidad_Laminado,
      PasoGuia_Repetecion: this.datosControlCal_Impresion[i].PasoGuia_Repetecion,
      Observacion: this.datosControlCal_Impresion[i].Observacion
    }
    this.controlImp.Put(id, control).subscribe(() => {
      this.msj.mensajeConfirmacion(`¡Registro actualizado exitosamente!`);
      this.ConsultarDatosControlCal_Impresion();
    }, () => {
      this.msj.mensajeError(`¡No se pudo actualizar el registro!`);
      this.cargando = false;
    }, () => this.cargando = false);
  }

  // Funcion que va a validar que los datos del control de calidad de doblado estén completos y ver si el control de calidad de doblado ya existe
  validarDatosControlCal_Doblado(datos : any) {
    if (datos.Id_PkBd == 0) this.guardarControlCalidad_Dbl(datos.Id);
    else this.controlDbl.Get_Id(datos.Id_PkBd).subscribe(data => this.actualizarControlCalidad_Dbl(data.id));
  }

  // Funcion que va a enviar al api los datos del control de calidad de doblado que se desea almacenar
  guardarControlCalidad_Dbl(id : number) {
    this.cargando = true;
    let i : number = this.datosControlCal_Doblado.findIndex(item => item.Id == id);
    const control : modelControlCalidad_CorteDoblado = {
      Usua_Id: this.storage_Id,
      Fecha_Registro: moment().format('YYYY-MM-DD'),
      Hora_Resgitros: moment().format('HH:mm:ss'),
      Turno_Id: this.datosControlCal_Doblado[i].turno,
      Maquina: this.datosControlCal_Doblado[i].maquina,
      Ronda: this.datosControlCal_Doblado[i].ronda,
      Orden_Trabajo: this.datosControlCal_Doblado[i].orden,
      Cliente: this.datosControlCal_Doblado[i].cliente,
      Prod_Id: this.datosControlCal_Doblado[i].item,
      Nombre_Producto: this.datosControlCal_Doblado[i].referencia,
      Ancho: this.datosControlCal_Doblado[i].ancho,
      UndMed_Id: 'Cms',
      Calibre: this.datosControlCal_Doblado[i].calibre,
      Codigo_Barras: this.datosControlCal_Doblado[i].codBarras,
      Tipo_Embobinado: this.datosControlCal_Doblado[i].tpEmbobinado,
      PasoEntre_Guia: this.datosControlCal_Doblado[i].pasoGuia,
      Observacion: this.datosControlCal_Doblado[i].observacion,
    };
    this.controlDbl.Post(control).subscribe(() => {
      this.msj.mensajeConfirmacion(`¡Registro guardado exitosamente!`);
      this.ConsultarDatosControlCal_DobladoCorte();
    }, () => {
      this.msj.mensajeError(`¡No se pudo guardar el registro!`);
      this.cargando = false;
    }, () => this.cargando = false);
  }

  // Funcion que va a enviar al api los datos del control de calidad de doblado que se desea actualizar
  actualizarControlCalidad_Dbl(id : number) {
    this.cargando = true;
    let i : number = this.datosControlCal_Doblado.findIndex(item => item.Id_PkBd == id);
    const control : modelControlCalidad_CorteDoblado = {
      Id : id,
      Usua_Id: this.storage_Id,
      Fecha_Registro: moment().format('YYYY-MM-DD'),
      Hora_Resgitros: moment().format('HH:mm:ss'),
      Turno_Id: this.datosControlCal_Doblado[i].turno,
      Maquina: this.datosControlCal_Doblado[i].maquina,
      Ronda: this.datosControlCal_Doblado[i].ronda,
      Orden_Trabajo: this.datosControlCal_Doblado[i].orden,
      Cliente: this.datosControlCal_Doblado[i].cliente,
      Prod_Id: this.datosControlCal_Doblado[i].item,
      Nombre_Producto: this.datosControlCal_Doblado[i].referencia,
      Ancho: this.datosControlCal_Doblado[i].ancho,
      UndMed_Id: 'Cms',
      Calibre: this.datosControlCal_Doblado[i].calibre,
      Codigo_Barras: this.datosControlCal_Doblado[i].codBarras,
      Tipo_Embobinado: this.datosControlCal_Doblado[i].tpEmbobinado,
      PasoEntre_Guia: this.datosControlCal_Doblado[i].pasoGuia,
      Observacion: this.datosControlCal_Doblado[i].observacion,
    };
    this.controlDbl.Put(id, control).subscribe(() => {
      this.msj.mensajeConfirmacion(`¡Registro actualizado exitosamente!`);
      this.ConsultarDatosControlCal_DobladoCorte();
    }, () => {
      this.msj.mensajeError(`¡No se pudo actualizar el registro!`);
      this.cargando = false;
    }, () => this.cargando = false);
  }
}