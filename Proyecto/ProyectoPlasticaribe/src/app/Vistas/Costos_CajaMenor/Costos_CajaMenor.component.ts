import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { modelCajaMenor_Plasticaribe } from 'src/app/Modelo/CajaMenor_Plasticaribe';
import { AreaService } from 'src/app/Servicios/Areas/area.service';
import { CajaMenor_PlasticaribeService } from 'src/app/Servicios/CajaMenor_Plasticaribe/CajaMenor_Plasticaribe.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { TipoSalidas_CajaMenorService } from 'src/app/Servicios/TipoSalidas_CajaMenor/TipoSalidas_CajaMenor.service';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-Costos_CajaMenor',
  templateUrl: './Costos_CajaMenor.component.html',
  styleUrls: ['./Costos_CajaMenor.component.css']
})

export class Costos_CajaMenorComponent implements OnInit {

  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  load: boolean = false; //Variable que validará cuando vaya a salir la animacion de carga
  FormCajaMenor !: FormGroup; //Formulario de ingreso de nómina
  arrayGastos : any = []; //Array que contendrá los registros de las nominas a ingresar.
  horaActual : any = moment().format('H:mm:ss'); //variable que contendrá la hora actual
  registroSeleccionado : any; // Registro que guardará las propiedades del registro seleccionado de la tabla.
  tiposGastos : any = []; //Array que cargará los tipos de nomina en el combobox
  numero : number = 0;
  areas : any = []; //Array que guardará las diferentes areas de la empresa. 
  modalTiposGastos : boolean = false; //Variable que validará si se muestra o no el modal para crear un tipo de gasto

  @ViewChild ('dt_CajaMenor') dt_CajaMenor : Table; //Variable que se usará para hacer referencia al datatable')
  FormFiltrosCajaMenor : FormGroup; //Funcion que va a tener la información de los filtros de busqueda de la información de caja menor
  registrosCajaMenor : any [] = []; //Array que guardará los registros de la información de caja menor

  constructor(private AppComponent : AppComponent,
                private msj : MensajesAplicacionService,
                  private frmBuilder : FormBuilder,
                    private message : MessageService,
                      private srvAreas : AreaService, 
                        private srvTpSalidaCm : TipoSalidas_CajaMenorService,
                          private srvCajaMenor : CajaMenor_PlasticaribeService,) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;

    this.FormCajaMenor = this.frmBuilder.group({
      fechas : [null, Validators.required],
      valorTotal : [0, Validators.required],
      area : [null, Validators.required],
      tipoCosto : [null, Validators.required],
      descripcion : [''],
    });

    this.FormFiltrosCajaMenor = this.frmBuilder.group({
      Fechas : [[]],
      Area : [null],
      TipoCosto : [null],
    });
  }

  ngOnInit() {
    this.lecturaStorage();
    this.cargarTiposCostos();
    this.obtenerAreas();
  }

  //Función que se encarga de leer la información que se almacena en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  verTutorial(){
  }

  //Función que se encarga de cargar las areas de la empresa
  obtenerAreas = () => this.srvAreas.srvObtenerLista().subscribe(data => this.areas = data);

  //Funcion que cargará los registros del formulario a la tabla.
  cargarTabla() {
    if(this.FormCajaMenor.valid) {      
      let fechaInicial : any = moment(this.FormCajaMenor.value.fechas[0]).format('YYYY-MM-DD');
      let pagoTotal : number = this.FormCajaMenor.value.valorTotal;
      let nombreCosto : any;
      if(pagoTotal > 0) {
        nombreCosto = this.tiposGastos.filter(item => item.tpSal_Id == this.FormCajaMenor.value.tipoCosto);
        let info : any = {
          id : this.numero += 1,
          fecha1 : fechaInicial,
          area : this.FormCajaMenor.value.area,
          nombreArea : this.areas.filter(item => item.area_Id == this.FormCajaMenor.value.area)[0].area_Nombre,
          valor : pagoTotal,
          tipoCosto : nombreCosto[0].tpSal_Id,
          nombreTipoCosto : nombreCosto[0].tpSal_Nombre,
          descripcion : this.FormCajaMenor.value.descripcion == null ? '' : (this.FormCajaMenor.value.descripcion).toString().toUpperCase(),
        }
        this.arrayGastos.push(info);
        this.limpiarCampos();
      } else this.msj.mensajeAdvertencia(`Advertencia`, `El valor del gasto de caja menor no puede ser $0.00 Por favor, verifique!`);
    } else this.msj.mensajeAdvertencia(`Advertencia`, `¡Hay Campos vacios, por favor verifiqeue!`);
  }

  //Función que limpiará los campos del formulario
  limpiarCampos = () => this.FormCajaMenor.reset();

  //Función que limpiará el formulario, los registros de la tabla y el valor total
  limpiarTodo() {
    this.FormCajaMenor.reset();
    this.arrayGastos = [];
    this.calcularTotal();
    this.numero = 0;
    this.registroSeleccionado = [];
  }

  //Función que mostrará e valor total de las nominas que se desean ingresar.
  calcularTotal = () : number => this.arrayGastos.reduce((acc, item) => acc + item.valor, 0);

  //Función que crear el registro de la entrada de la(s) nomina(s) en la base de datos
  crearEntrada(){
    this.load = true;
    let cantDatos = 0;
    if(this.arrayGastos.length > 0) {
      for (let index = 0; index < this.arrayGastos.length; index++) {
        let modelo : modelCajaMenor_Plasticaribe = {
          CajaMenor_FechaRegistro: this.today,
          CajaMenor_HoraRegistro: this.horaActual,
          Usua_Id: this.storage_Id,
          CajaMenor_FechaSalida: this.arrayGastos[index].fecha1,
          CajaMenor_ValorSalida: this.arrayGastos[index].valor,
          CajaMenor_Observacion: this.arrayGastos[index].descripcion == null ? "" : this.arrayGastos[index].descripcion,
          TpSal_Id: this.arrayGastos[index].tipoCosto,
          Area_Id: this.arrayGastos[index].area,
        }
        this.srvCajaMenor.Post(modelo).subscribe(() => {
          cantDatos += 1;
          if (cantDatos == this.arrayGastos.length) {
            this.msj.mensajeConfirmacion(`Excelente!`, `Se han registrado gastos de caja menor con éxito!`);
            this.load = false; 
            this.limpiarTodo();
          }
        }, () => this.msj.mensajeError(`Error`, `Error al ingresar los registros de gastos de caja menor. Por favor, verifique!`));
      }
    } else this.msj.mensajeAdvertencia(`Advertencia`, `Debe cargar al menos un registro en la tabla!`);
  }

  //Función para quitar registros de la tabla.
  quitarRegistro(data : any){
    data = this.registroSeleccionado;
    this.onReject();
    this.arrayGastos.splice(this.arrayGastos.findIndex((item) => item.id == data.id), 1);
    this.calcularTotal();
  }

  //Función que mostrará un mensaje preguntando si en realidad desea eliminar el registro seleccionado
  mostrarEleccion(item : any){
    this.registroSeleccionado = item;
    this.message.add({severity:'warn', key:'registro', summary:'Elección', detail: `Está seguro que desea quitar el registro seleccionado de la tabla?`, sticky: true});
  }

  //Función que quitará el msj de elección
  onReject = () => this.message.clear('registro');

  //Función que cargará los diferentes tipos de nómina
  cargarTiposCostos = () => this.srvTpSalidaCm.Get_Todo().subscribe(datos => this.tiposGastos = datos);

  /** Función para llamar el modal que contendrá los campos para crear un tipo de gasto */
  mostrarModal = () => this.modalTiposGastos = true;

  // Funcion que va a limpiar todo del tab de busqueda
  limpiarTabBusqueda() {
    this.FormFiltrosCajaMenor.reset();
    this.FormFiltrosCajaMenor.patchValue({ Fechas : [], });
    this.registrosCajaMenor = [];
  }

  // Funcion que va a encargarse de buscar los registros de caja menor que se han ingresado con anterioridad
  buscarRegistros() {
    let fechaMesAnterior : any = moment().subtract(1, 'M').format('YYYY-MM-DD');
    let fechaincial : any = (this.FormFiltrosCajaMenor.value.Fechas).length == 0 ? fechaMesAnterior : moment(this.FormFiltrosCajaMenor.value.Fechas[0]).format('YYYY-MM-DD');
    let fechaFinal : any = (this.FormFiltrosCajaMenor.value.Fechas).length <= 1 ? this.today : moment(this.FormFiltrosCajaMenor.value.Fechas[1]).format('YYYY-MM-DD');
    let area : any = this.FormFiltrosCajaMenor.value.Area;
    let tipoCosto : any = this.FormFiltrosCajaMenor.value.TipoCosto;
    let ruta : string = ``;

    if (area != null) ruta += `area=${area}`;
    if (tipoCosto != null) ruta.length > 0 ? ruta += `&tipo=${tipoCosto}` : ruta += `tipo=${tipoCosto}`;
    if (ruta.length > 0) ruta = `?${ruta}`;

    this.srvCajaMenor.GetRegistrosCajaMenor(fechaincial, fechaFinal, ruta).subscribe(data => this.registrosCajaMenor = data, () => this.msj.mensajeError('No se encontraron registros de caja menor'));
  }

  aplicarfiltro = ($event, campo : any) => this.dt_CajaMenor!.filter(($event.target as HTMLInputElement).value, campo, 'contains');
}
