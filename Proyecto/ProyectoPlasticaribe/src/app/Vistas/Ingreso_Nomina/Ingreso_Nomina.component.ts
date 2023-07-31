import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ShepherdService } from 'angular-shepherd';
import moment from 'moment';
import { MessageService } from 'primeng/api';
import { modelNominaPlasticaribe } from 'src/app/Modelo/modelNominaPlasticaribe';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { Nomina_PlasticaribeService } from 'src/app/Servicios/Nomina_Plasticaribe/Nomina_Plasticaribe.service';
import { Tipos_NominaService } from 'src/app/Servicios/Tipos_Nomina/Tipos_Nomina.service';
import { AppComponent } from 'src/app/app.component';
import { defaultStepOptions, stepsIngresoNomina as defaultSteps } from 'src/app/data';

@Component({
  selector: 'app-Ingreso_Nomina',
  templateUrl: './Ingreso_Nomina.component.html',
  styleUrls: ['./Ingreso_Nomina.component.css']
})
export class Ingreso_NominaComponent implements OnInit {
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  load: boolean = false; //Variable que validará cuando vaya a salir la animacion de carga
  FormNomina !: FormGroup; //Formulario de ingreso de nómina
  arrayNomina : any = []; //Array que contendrá los registros de las nominas a ingresar.
  horaActual : any = moment().format('H:mm:ss'); //variable que contendrá la hora actual
  registroSeleccionado : any; // Registro que guardará las propiedades del registro seleccionado de la tabla.
  arrayTipoNomina : any = [];

  constructor(private AppComponent : AppComponent,
                private msj : MensajesAplicacionService,
                  private shepherdService : ShepherdService,
                    private frmBuilder : FormBuilder,
                      private servicioNomina : Nomina_PlasticaribeService,
                        private message : MessageService,
                          private servicioTipoNomina : Tipos_NominaService) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;

    this.FormNomina = this.frmBuilder.group({
      fechas : [null],
      valorTotal : [0],
      tipoNomina : [null],
      descripcion : [''],
    });
   }

  ngOnInit() {
    this.lecturaStorage();
    this.cargarTiposNomina();
  }

  //Función que se encarga de leer la información que se almacena en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  verTutorial(){
    this.shepherdService.defaultStepOptions = defaultStepOptions;
    this.shepherdService.modal = true;
    this.shepherdService.confirmCancel = false;
    this.shepherdService.addSteps(defaultSteps);
    this.shepherdService.start();
  }

  //Funcion que cargará los registros del formulario a la tabla.
  cargarTabla() {
    let fechaInicial : any = this.FormNomina.value.fechas.length > 0 ? moment(this.FormNomina.value.fechas[0]).format('YYYY-MM-DD') : null;
    let fechaFinal : any = this.FormNomina.value.fechas.length > 0 ? moment(this.FormNomina.value.fechas[1]).format('YYYY-MM-DD') : null;
    let pagoTotal : number = this.FormNomina.value.valorTotal;
    let nombreTipoNomina : any;

    if(fechaInicial != null || fechaFinal != null) {
      if(pagoTotal > 0) {
        if(this.FormNomina.value.tipoNomina != null) {
          nombreTipoNomina = this.arrayTipoNomina.filter(item => item.tpNomina_Id == this.FormNomina.value.tipoNomina);
          console.log(nombreTipoNomina)
          let info : any = {
            fecha1 : fechaInicial,
            fecha2 : fechaFinal,
            valor : pagoTotal,
            tipo : this.FormNomina.value.tipoNomina,
            tipoNomina : nombreTipoNomina[0].tpNomina_Nombre,
            descripcion : this.FormNomina.value.descripcion
          }
          this.arrayNomina.push(info);
          this.limpiarCampos();
        } else this.msj.mensajeAdvertencia(`Advertencia`, `Debe diligenciar el campo tipo de nómina!`);
      } else this.msj.mensajeAdvertencia(`Advertencia`, `El valor de la nomina no puede ser equivalente a $0. Por favor, rectifique!`);
    } else this.msj.mensajeAdvertencia(`Advertencia`, `Debe elegir un rango de fechas válido`);
  }

  //Función que limpiará los campos del formulario
  limpiarCampos = () => this.FormNomina.reset();

  //Función que limpiará el formulario, los registros de la tabla y el valor total
  limpiarTodo() {
    this.FormNomina.reset();
    this.arrayNomina = [];
    this.calcularTotal();
  }

  //Función que mostrará e valor total de las nominas que se desean ingresar.
  calcularTotal(){
    let totalPagar : number = 0;
    this.arrayNomina.forEach(element => {
      totalPagar += element.valor;
    });
    return totalPagar;
  }

  //Función que crear el registro de la entrada de la(s) nomina(s) en la base de datos
  crearEntradaNomina(){
    this.load = true;
    let fallo : boolean  = false;
    if(this.arrayNomina.length > 0) {
      for (let index = 0; index < this.arrayNomina.length; index++) {
        let modelo : modelNominaPlasticaribe = {
          Nomina_Id: 0,
          Nomina_FechaRegistro: this.today,
          Nomina_HoraRegistro: this.horaActual,
          Usua_Id: this.storage_Id,
          Nomina_FechaIncial: this.arrayNomina[index].fecha1,
          Nomina_FechaFinal: this.arrayNomina[index].fecha2,
          Nomina_Costo: this.arrayNomina[index].valor,
          TpNomina_Id: this.arrayNomina[index].tipo,
          Nomina_Observacion: this.arrayNomina[index].descripcion
        }
        this.servicioNomina.Post(modelo).subscribe(data => { fallo = false }, error => { fallo = true; })
      }
      if(!fallo) {
        this.msj.mensajeConfirmacion(`Excelente!`, `Se ha creado el registro de la(s) nomina(s) satisfactoriamente!`);
        setTimeout(() => {this.load = false; this.limpiarTodo(); }, 500);
      } else this.msj.mensajeError(`Error`, `Ocurrió un error al ingresar los registros de la(s) nominas(s). Por favor, verifique!`);

    } else this.msj.mensajeAdvertencia(`Advertencia`, `Debe cargar al menos un registro en la tabla!`);
  }

  //Función para quitar registros de la tabla.
  quitarRegistro(data : any){
    data = this.registroSeleccionado;
    this.onReject();
    this.arrayNomina.splice(this.arrayNomina.findIndex((item) => item.descripcion == data.descripcion), 1);
    this.calcularTotal();
  }

  //Función que mostrará un mensaje preguntando si en realidad desea eliminar el registro seleccionado
  mostrarEleccion(item : any){
    this.registroSeleccionado = item;
    this.message.add({severity:'warn', key:'registro', summary:'Elección', detail: `Está seguro que desea quitar el registro seleccionado de la tabla?`, sticky: true});
  }

  //Función que quitará el msj de elección
  onReject = () => this.message.clear('registro');

  cargarTiposNomina = () => this.servicioTipoNomina.Get().subscribe(datos => this.arrayTipoNomina = datos);
}
