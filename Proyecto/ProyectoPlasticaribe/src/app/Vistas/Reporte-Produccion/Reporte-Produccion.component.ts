import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { Table } from 'primeng/table';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { ProductoService } from 'src/app/Servicios/Productos/producto.service';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-Reporte-Produccion',
  templateUrl: './Reporte-Produccion.component.html',
  styleUrls: ['./Reporte-Produccion.component.css']
})

export class ReporteProduccionComponent implements OnInit {

  @ViewChild('dt') dt !: Table;
  cargando: boolean = false;
  modoSeleccionado: boolean = false;
  storage_Id: number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  ValidarRol: number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  formFiltros !: FormGroup;
  areasEmpresa: string[] = ['EXTRUSION', 'IMPRESION', 'ROTOGRABADO', 'DOBLADO', 'LAMINADO', 'CORTE', 'EMPAQUE', 'SELLADO', 'Wiketiado'];
  turnos : string[] = ['DIA', 'NOCHE'];
  clientes : any [] = [];
  productos : any [] = [];
  produccion : any [] = [];
  rollosSeleccionados : any [] = [];

  constructor(private AppComponent: AppComponent,
    private frmBuilder: FormBuilder,
    private bagProService: BagproService,
    private msj : MensajesAplicacionService,
    private productosService : ProductoService,) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;

    this.formFiltros = this.frmBuilder.group({
      rangoFechas: [null, Validators.required],
      OrdenTrabajo: [null],
      proceso: [null],
      idCliente : [null],
      cliente : [null],
      idProducto : [null],
      producto : [null],
      Turno: [null],
      EnvioZeus: [false],
    });
  }

  ngOnInit() {
    this.lecturaStorage();
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage() {
    this.storage_Id = this.AppComponent.storage_Id;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

  // Funcion que va a aplicar filtros a la tabla en la que se muestra la información consultada
  aplicarfiltroTabla = ($event, campo : any) => this.dt!.filter(($event.target as HTMLInputElement).value, campo, 'contains');

  // Funcion que va a limpiar los campos de busqueda y la información consultada
  limpiarCampos() {
    this.formFiltros.reset();
    this.formFiltros.patchValue({EnvioZeus : false})
    this.produccion = [];
    this.clientes = [];
    this.productos = [];
  }

  // Funcion que se encargaá de buscar los clientes
  obtenerClientes(){
    let nombre : string = this.formFiltros.value.cliente;
    this.bagProService.GetClientesNombre(nombre).subscribe(resp => this.clientes = resp);
  }

  // Funcion que se encargará de colocar la información de los clientes en cada uno de los campos
  clienteSeleccionado(){
    let cliente : any = this.formFiltros.value.cliente;
    this.formFiltros.patchValue({
      idCliente : cliente,
      cliente : this.clientes.find(x => x.codBagpro == cliente).nombreComercial
    });
  }

  // Funcion que se encargará de buscar los productos
  obtenerProductos(){
    let nombre : string = this.formFiltros.value.producto;
    this.productosService.obtenerItemsLike(nombre).subscribe(resp => this.productos = resp);
  }

  // Funcion que se encargará de colocar la información de los productos en cada uno de los campos
  productoSeleccionado(){
    let producto : any = this.formFiltros.value.producto;
    this.formFiltros.patchValue({
      idProducto : producto,
      producto : this.productos.find(x => x.prod_Id == producto).prod_Nombre
    });
  }

  // Funcion que se encargará de consultar la informacion de produccion
  consultarProduccion() {
    if (this.formFiltros.value.rangoFechas.length > 1) {
      this.produccion = [];
      this.cargando = true;
      let fechaInicio = moment(this.formFiltros.value.rangoFechas[0]).format('YYYY-MM-DD');
      let fechaFin = moment(this.formFiltros.value.rangoFechas[1]).format('YYYY-MM-DD');
      let ruta : string = this.validarParametrosConsulta();
      this.bagProService.GetProduccionDetalladaAreas(fechaInicio, fechaFin, ruta).subscribe(res => this.produccion = res, error => {
        this.msj.mensajeAdvertencia(error.error);
        this.cargando = false;
      }, () => this.cargando = false);
    }
  }

  // Funcion que se encargará de validar los parametros de la consulta
  validarParametrosConsulta() : string {
    let ruta : string = ``;
    let orden : string = this.formFiltros.value.OrdenTrabajo;
    let proceso = this.formFiltros.value.proceso;
    let cliente = this.formFiltros.value.idCliente;
    let producto = this.formFiltros.value.idProducto;
    let turno = this.formFiltros.value.Turno;
    let envioZeus = this.formFiltros.value.EnvioZeus ? '1' : '0';

    if (orden != null) ruta += `orden=${orden}`;
    if (proceso != null) ruta.length > 0 ? ruta += `&proceso=${proceso}` : ruta += `proceso=${proceso}`;
    if (cliente != null) ruta.length > 0 ? ruta += `&cliente=${cliente}` : ruta += `cliente=${cliente}`;
    if (producto != null) ruta.length > 0 ? ruta += `&producto=${producto}` : ruta += `producto=${producto}`;
    if (turno != null) ruta.length > 0 ? ruta += `&turno=${turno}` : ruta += `turno=${turno}`;
    if (envioZeus != null) ruta.length > 0 ? ruta += `&envioZeus=${envioZeus}` : ruta += `envioZeus=${envioZeus}`;
    if (ruta.length > 0) ruta = `?${ruta}`;
    return ruta;
  }

  // Funcion que se encargará de sumar la cantidad o peso bruto de la información de producción
  totalCantidadConsultada(){
    let total : number = 0;
    this.produccion.forEach(x => total += x.cantidad);
    return total;
  }

  // Funcion que se encargará de sumar el peso neto de la información de producción
  totalPesoConsultado(){
    let total : number = 0;
    this.produccion.forEach(x => total += x.peso);
    return total;
  }

  // Funcion que se encargará de enviar los subir la producción a zeus
  enviarProduccionZeus(){
    if (this.rollosSeleccionados.length > 0) {
      this.cargando = true;
      let rollosSellado : any [] = this.rollosSeleccionados.filter(x => x.proceso == "SELLADO" && x.envioZeus.trim() == '0').map(x => x.rollo);
      let rollosEmpaque : any [] = this.rollosSeleccionados.filter(x => x.proceso == "EMPAQUE" && x.envioZeus.trim() == '0').map(x => x.rollo);
      if (rollosSellado.length > 0) {
        let count : number = 0;
        rollosSellado.forEach(data => {
          this.bagProService.EnvioZeusProcSellado(data).subscribe(res => {
            count++;
            if (count == rollosSellado.length) this.msj.mensajeConfirmacion(`¡Los rollos se han subido a Zeus!`)
          }, res => {
            this.msj.mensajeAdvertencia(`¡Ha ocurrido un error!`);
            this.cargando = false;
          }, () => this.cargando = false);
        });
      }

      if (rollosEmpaque.length > 0) {
        let count : number = 0;
        rollosEmpaque.forEach(data => {
          this.bagProService.EnvioZeusProcExtrusion(data).subscribe(res => {
            count++;
            if (count == rollosEmpaque.length) this.msj.mensajeConfirmacion(`¡Los rollos se han subido a Zeus!`)
          }, res => {
            this.msj.mensajeAdvertencia(`¡Ha ocurrido un error!`);
            this.cargando = false;
          }, () => this.cargando = false);
        });
      }
    } else this.msj.mensajeAdvertencia(`¡Debe seleccionar minimo un rollo!`);
  }
}