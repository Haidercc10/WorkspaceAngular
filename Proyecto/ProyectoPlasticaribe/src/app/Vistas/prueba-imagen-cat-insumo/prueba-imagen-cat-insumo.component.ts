import { Component, OnInit } from '@angular/core';
import { ShepherdService } from 'angular-shepherd';
import moment from 'moment';
import { modelControlCalidad_CorteDoblado } from 'src/app/Modelo/modelControlCalidad';
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

  datosControlCal_Extrusion : any [] = []; //Variable que va a almacenar los datos del control de calidad del area de extrusion
  datosControlCal_Doblado : any [] = []; //Variable que va a almacenar los datos del control de calidad del area de doblado

  constructor(private AppComponent : AppComponent,
                private msj : MensajesAplicacionService,
                  private shepherdService: ShepherdService,
                    private controlDbl : ControlCalidad_CorteDobladoService,
                      private controlImp : ControlCalidad_ImpresionService,
                        private bagproService : BagproService,) {}

  ngOnInit(): void {
    this.lecturaStorage();
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

  // Funcion que va añadir una fila mas a la tabla, para que pueda ser agregado un dato
  AgregarFila = () => this.datosControlCal_Extrusion.push({});

  // Funcion que va añadir una fila mas a la tabla, para que pueda ser agregado un dato a doblado
  AgregarFila_Doblado = () => this.datosControlCal_Doblado.push({ Id : this.datosControlCal_Doblado.length == 0 ? 1 : this.datosControlCal_Doblado[this.datosControlCal_Doblado.length - 1].Id + 1, });

  // Fucion que va a consultar los datos de los controles de calidad del area de extrusión
  ConsultarDatosControlCal_Extrusion() {
  }

  // Fucion que va a consultar los datos de los controles de calidad del area de impresión
  ConsultarDatosControlCal_Impresion() {
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
    }, () => this.msj.mensajeError(`¡No se encontraron registros de control de calidad en el área de corte y doblado en el día de hoy!`, ``));
  }

  // Funcion que va a consultar los datos de una orden de trabajo en el proceso de doblado y corte
  consultarDatosOrdenTrabajo(orden : string, id : number, procesos : string) {
    this.bagproService.GetInformacionOrden_ProcesoExt(orden, procesos).subscribe(data => {
      this.cargando = true;
      let maquina : string [] = [];
      data.forEach(ot => {
        if (!maquina.includes(ot.maquina)) {
          maquina.push(ot.maquina);
          const info : any = {
            Id : id,
            Id_PkBd : 0,
            orden : orden,
            ronda : ``,
            maquina : ot.maquina.toString(),
            turno : ot.turno.trim(),
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
          this.datosControlCal_Doblado[this.datosControlCal_Doblado.findIndex(item => item.Id == id)] = info;
          this.cargando = false;
        }
      });
    });
  }

  // Fucion que va a consultar los datos de los controles de calidad del area de sellado
  ConsultarDatosControlCal_Sellado() {
  }

  // Funcion que va a validar que los datos del control de calidad de doblado estén completos y ver si el control de calidad ya existe
  validarDatosControlCal_Doblado(datos : any) {
    if (datos.Id_PkBd == 0) {
      if (this.datosControlCal_Doblado) this.guardarControlCalidad_Dbl(datos.Id);
    } else this.controlDbl.Get_Id(datos.Id_PkBd).subscribe(data => this.actualizarControlCalidad_Dbl(data.id));
  }

  // Funcion que va a enviar al api los datos del control de calidad que se desea almacenar
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
      this.msj.mensajeConfirmacion(`¡Registro guardado exitosamente!`, ``);
      this.ConsultarDatosControlCal_DobladoCorte();
    }, () => {
      this.msj.mensajeError(`¡No se pudo guardar el registro!`, ``);
      this.cargando = false;
    });
  }

  // Funcion que va a enviar al api los datos del control de calidad que se desea actualizar
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
      this.msj.mensajeConfirmacion(`¡Registro actualizado exitosamente!`, ``);
      this.ConsultarDatosControlCal_DobladoCorte();
    }, () => {
      this.msj.mensajeError(`¡No se pudo actualizar el registro!`, ``);
      this.cargando = false;
    });
  }

}