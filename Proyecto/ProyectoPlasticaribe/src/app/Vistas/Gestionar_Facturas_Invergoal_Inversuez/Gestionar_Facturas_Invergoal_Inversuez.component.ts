import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShepherdService } from 'angular-shepherd';
import moment from 'moment';
import { Table } from 'primeng/table';
import { modelFacturasInvergoalInversuez } from 'src/app/Modelo/modelFacturasInvergoalInversuez';
import { EstadosService } from 'src/app/Servicios/Estados/estados.service';
import { Facturas_Invergoal_InversuezService } from 'src/app/Servicios/Facturas_Invergoal_Inversuez/Facturas_Invergoal_Inversuez.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { ProveedorService } from 'src/app/Servicios/Proveedor/proveedor.service';
import { AppComponent } from 'src/app/app.component';
import { defaultStepOptions, stepsBodegas as defaultSteps } from 'src/app/data';

@Component({
  selector: 'app-Gestionar_Facturas_Invergoal_Inversuez',
  templateUrl: './Gestionar_Facturas_Invergoal_Inversuez.component.html',
  styleUrls: ['./Gestionar_Facturas_Invergoal_Inversuez.component.css']
})

export class Gestionar_Facturas_Invergoal_InversuezComponent implements OnInit {

  cargando : boolean = false; //Variable para validar que salga o no la imagen de carga
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro

  @ViewChild('dt') dt: Table | undefined;
  FormFacturas !: FormGroup;
  proveedores : any [] = [];
  facturasConsultadas : any [] = [];
  facturasSeleccionadas : any [] = [];
  columnasSeleccionadas : any [] = [];
  columnas : any [] = [];
  Empresas : any [] = [];
  estados : any [] = [];
  modalEstados : boolean = false;
  estadoSeleccionado : number = 2;

  constructor(private AppComponent : AppComponent,
                private frmBuilder : FormBuilder,
                  private msj : MensajesAplicacionService,
                    private shepherdService: ShepherdService,
                      private proveedorService : ProveedorService,
                        private facturasService : Facturas_Invergoal_InversuezService,
                          private estadoService : EstadosService,) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;

    this.FormFacturas = this.frmBuilder.group({
      Empresa : [null, Validators.required],
      Codigo : [null, Validators.required],
      FechaInicial : [null, Validators.required],
      FechaFinal : [null, Validators.required],
      Proveedor : [null, Validators.required],
      Cuenta : [null, Validators.required],
      Estado : [null, Validators.required],
    });
  }

  ngOnInit() {
    this.lecturaStorage();
    this.cargarEmpresas();
    this.cargarProveedores();
    this.cargarEstados();
    this.llenarColumnas();
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number : any) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  verTutorial() {
    this.shepherdService.defaultStepOptions = defaultStepOptions;
    this.shepherdService.modal = true;
    this.shepherdService.confirmCancel = false;
    this.shepherdService.addSteps(defaultSteps);
    this.shepherdService.start();
  }

  // Funcion que se encargará de cargar los estados
  cargarEstados = () => this.estadoService.srvObtenerListaEstados().subscribe((data : any) => this.estados = data.filter(item => [2,4,5].includes(item.estado_Id)));

  // Funcion que se encargará de cargar las empresas
  cargarEmpresas() {
    this.Empresas = [
      { Id : '900362200', Nombre : 'INVERGOAL SAS' },
      { Id : '900458314', Nombre : 'INVERSUEZ SAS' }
    ]
  }

  // Funcion que va a cargar la informacion de los proveedores
  cargarProveedores = () => this.proveedorService.srvObtenerLista().subscribe((data : any) => this.proveedores = data);

  // Funcion que va a resetear el formulario
  resetForm = () => this.FormFacturas.reset();

  // Funcion que va a limpiar todo
  limpiarTodo = () => {
    this.resetForm();
    this.cargarEmpresas();
    this.cargarProveedores();
  }

  // Funcion que va a llenar el array 'columnas' con los nombres de los columnas que habra en la tabla
  llenarColumnas = () => {
    this.columnas = [
      { header: 'Código', field: 'Codigo', tipo: 'texto'},
      { header: 'Empresa', field: 'Empresa', tipo: 'texto'},
      { header: 'Fecha', field: 'Fecha', tipo: 'texto'},
      { header: 'Vence', field: 'Vencimiento', tipo: 'texto'},
      { header: 'Proveedor', field: 'Proveedor', tipo: 'texto'},
      { header: 'Cuenta', field: 'Cuenta', tipo: 'texto'},
      { header: 'Estado', field: 'Estado', tipo: 'texto'},
      { header: 'Total', field: 'Total', tipo: 'numero'},
    ];
    this.columnasSeleccionadas = this.columnas;
  }

  // Funcion que va a consultar la informacion de las facturas
  consultarFacturas(){
    let emp : string = this.FormFacturas.value.Empresa;
    let fechaInicio : any = moment(this.FormFacturas.value.FechaInicial).format('YYYY-MM-DD') == 'Fecha inválida' ? this.today : moment(this.FormFacturas.value.FechaInicial).format('YYYY-MM-DD');
    let fechaFin : any = moment(this.FormFacturas.value.FechaFinal).format('YYYY-MM-DD') == 'Fecha inválida' ? fechaInicio : moment(this.FormFacturas.value.FechaFinal).format('YYYY-MM-DD');
    
    let codigo : string = this.FormFacturas.value.Codigo;
    let proveedor : string = this.FormFacturas.value.Proveedor;
    let cuenta : string = this.FormFacturas.value.Cuenta;
    let estado : string = this.FormFacturas.value.Estado;
    let ruta : string = '';
    this.facturasConsultadas = [];

    if (codigo != null) ruta += `codigo=${codigo}`;
    if (proveedor != null) ruta.length > 0 ? ruta += `&proveedor=${proveedor}` : ruta += `proveedor=${proveedor}`;
    if (cuenta != null) ruta.length > 0 ? ruta += `&cuenta=${cuenta}` : ruta += `cuenta=${cuenta}`;
    if (estado != null) ruta.length > 0 ? ruta += `&estado=${estado}` : ruta += `estado=${estado}`;
    if (ruta.length > 0) ruta = `?${ruta}`;

    if (emp == null) this.msj.mensajeAdvertencia('Advertencia', 'Debe seleccionar una empresa');
    else { 
      this.cargando = true;
      this.facturasService.GetFacturasIngresadas(emp, fechaInicio, fechaFin, ruta).subscribe((data : any) => this.AgregarFacturas(data), (error : any) => {
        this.cargando = false;
        this.msj.mensajeError('Error', 'La consulta no fue exitosa');
      });
    }
  }

  // Funcion que va a añadir los datos de las facturas consultadas a un array, recibiendo un parametro que será la informacion de la factura
  AgregarFacturas(factura : any){
    for (let i = 0; i < factura.length; i++) {
      this.cargando = false;
      let facturas : any = {
        Id : factura[i].id,
        Empresa : factura[i].nombre_Empresa,
        Fecha : factura[i].fecha_Factura.replace('T00:00:00', ''),
        Vencimiento : factura[i].fecha_Vencimiento.replace('T00:00:00', ''),
        Codigo : factura[i].codigo_Factura,
        Proveedor : factura[i].prov_Nombre,
        Cuenta : factura[i].cuenta,
        Estado : factura[i].estado_Nombre,
        Total : factura[i].valor_Factura,
      }
      this.facturasConsultadas.push(facturas);
    }
  }

  // Funcion que va a cambiar el estado de una o varias factras
  cambiarEstadoFacturas(){
    this.facturasSeleccionadas.forEach(factura => {
      this.cargando = true;
      this.facturasService.Get_Factura_Id(factura.Id).subscribe((datos : any) => {
        let facturas : modelFacturasInvergoalInversuez = {
          Id : factura.Id,
          Fecha_Registro: datos.fecha_Registro,
          Hora_Registro: datos.hora_Registro,
          Usua_Id: datos.usua_Id,
          Nit_Empresa: datos.nit_Empresa,
          Nombre_Empresa: datos.nombre_Empresa,
          Codigo_Factura: datos.codigo_Factura,
          Nit_Proveedor: datos.nit_Proveedor,
          Fecha_Factura: datos.fecha_Factura,
          Fecha_Vencimiento: datos.fecha_Vencimiento,
          Valor_Factura: datos.valor_Factura,
          Cuenta: datos.cuenta,
          Estado_Factura: this.estadoSeleccionado,
          Observacion: datos.observacion,
        };
        this.facturasService.Put(factura.Id, facturas).subscribe((data : any) => {
          this.cargando = false;
          this.modalEstados = false;
          this.msj.mensajeConfirmacion('Actualización exitosa', 'La actualización fue exitosa');
          this.consultarFacturas();  
        });
      }, (error : any) => {
      });
    });
  }

  // Funcion que permitirá filtrar la información de la tabla
  aplicarfiltro = ($event, campo : any, valorCampo : string) => this.dt!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);
}
