import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShepherdService } from 'angular-shepherd';
import moment from 'moment';
import pdfMake from 'pdfmake/build/pdfmake';
import { MessageService } from 'primeng/api';
import { FacturaMpService } from 'src/app/Servicios/DetallesFacturaMateriaPrima/facturaMp.service';
import { DetallesOrdenesCompraService } from 'src/app/Servicios/DetallesOrdenCompra/DetallesOrdenesCompra.service';
import { RemisionesMPService } from 'src/app/Servicios/DetallesRemisiones/remisionesMP.service';
import { FactuaMpCompradaService } from 'src/app/Servicios/FacturaMateriaPrima/facturaMpComprada.service';
import { MateriaPrimaService } from 'src/app/Servicios/MateriaPrima/materiaPrima.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { OrdenCompra_MateriaPrimaService } from 'src/app/Servicios/OrdenCompra/OrdenCompra_MateriaPrima.service';
import { OrdenFactura_RelacionService } from 'src/app/Servicios/OrdenCompra_Facturas/OrdenFactura_Relacion.service';
import { OrdenCompra_RemisionService } from 'src/app/Servicios/OrdenCompra_Remision/OrdenCompra_Remision.service';
import { ProveedorService } from 'src/app/Servicios/Proveedor/proveedor.service';
import { RemisionService } from 'src/app/Servicios/Remisiones/Remision.service';
import { RemisionFacturaService } from 'src/app/Servicios/Remisiones_Facturas/remisionFactura.service';
import { TintasService } from 'src/app/Servicios/Tintas/tintas.service';
import { AppComponent } from 'src/app/app.component';
import { defaultStepOptions, stepsEntradasMp as defaultSteps } from 'src/app/data';
import { MovimientoMPComponent } from '../movimientoMP/movimientoMP.component';

@Component({
  selector: 'app_pedidomateriaprima_component',
  templateUrl: './pedidomateriaprima.component.html',
  styleUrls: ['./pedidomateriaprima.component.css']
})

export class PedidomateriaprimaComponent implements OnInit, OnDestroy {

  public FormMateriaPrimaFactura !: FormGroup; //Variable que se usará para registrar la factura o remisión de materia prima por su id, consecutivo, proveedor y observacion
  public FormRemisiones !: FormGroup; //Variable que se usará para registrar las remisiones por su id

  public consultaRemisiones !: FormGroup; //Variable que se usará para consultar las remisiones por su id

  private _intervalTema: any; //Variable que se usará para guardar el intervalo del tema seleccionado y limpiarlo al cerrar la vista
  private destroy$ = new Subject<void>(); //Variable que se usará para limpiar los intervalos de la vista al cerrarla

  /* Vaiables*/
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista
  facturaMateriaPrima = []; //Funcion que guardará la informacion de la factura de materia prima comprada que ha sido consultada
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  titulosTabla : any = []; //Variable que almacenará los titulos de la tabla de productos que se ve al final de la vista
  ArrayMateriaPrima : any [] = []; //Variable que tendrá la informacion de los productos que se piden en el nuevo pedido
  valorTotal : number = 0; //Variable que guardará el valor total de la factura de entrada de materia prima
  proveedor : any = []; //Variable que almacenará los diferentes proveedores de materia prima
  ultimoIdFactura : number = 0; //Variable que se usará para almacenar el ultimo id de factura registrado en la base de datos y colocar su consecutivo en el campo correspondiente
  ultimoIdRemision : number = 0; //Variable que se usará para almacenar el ultimo id de remision registrado en la base de datos y colocar su consecutivo en el campo correspondiente
  ArrayRemisiones : any = []; //Variable que se usará para almacenar las remisiones que se van a relacionar con la factura o remisión que se va a registrar
  precioRemision : any = []; //Variable que se usará para almacenar el precio total de la remision que se va a relacionar con la factura o remisión que se va a registrar
  titulosTablaRemisiones : any = []; //Variable que se usará para almacenar los titulos de la tabla de remisiones que se muestra en la parte inferior de la vista
  mpAgregada : any = []; //Variable que se usará para almacenar las materias primas que se han agregado a la factura o remisión para deshabilitar el boton de agregar a la tabla
  /* CONSULTAS DE MATERIA PRIMA */
  MpConsultada = []; //Variable que se usará para almacenar la informacion de la materia prima que se ha consultado por su id
  remision : any = []; // Variable que se usará para almacenar la informacion de la remision que se ha consultado por su id
  remConFac : any = []; //Variable que se usará para almacenar la informacion de las remisiones que se han relacionado con la factura o remisión consultada
  mostrarCheck : boolean = true; //Variable que se usará para mostrar o ocultar el check de seleccionar todos dependiendo si la orden de compra tiene bopp o no

  public load: boolean; //Variable que se usará para mostrar o ocultar el cargando dependiendo de las consultas que se estén realizando
  public arrayOrdenCompra : any [] = []; //Variable que se usará para almacenar la informacion de la orden de compra que se ha consultado por su id y mostrarla en la tabla para seleccionar las materias primas a ingresar
  public arrayMatPrimaFactura : any [] = []; //Variable que se usará para almacenar la informacion de las materias primas que se han registrado en la factura o remisión para mostrarla en la tabla
  public arrayInfoMatPrima : any [] = []; //Variable que se usará para almacenar la informacion de las materias primas que vienen en la orden de compra para mostrarlas en la tabla y seleccionarlas para ingresar

  modalMode : boolean = false; //Variable que se usará para mostrar u ocultar el modal de consulta de remisiones dependiendo de si se ha consultado una factura o remisión y esta tiene remisiones relacionadas
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro

  constructor(private materiaPrimaService : MateriaPrimaService,
                private frmBuilderMateriaPrima : FormBuilder,
                  private AppComponent : AppComponent,
                    private proveedorservices : ProveedorService,
                      private facturaMpComService : FactuaMpCompradaService,
                        private facturaMpService : FacturaMpService,
                          private remisionService : RemisionService,
                            private remisionMPService : RemisionesMPService,
                              private remisionFacturaService : RemisionFacturaService,
                                private tintasService : TintasService,
                                  private servicioOCMatPrima : OrdenCompra_MateriaPrimaService,
                                    private OrdenesFacturasService : OrdenFactura_RelacionService,
                                      private ordenCompraRemisionService : OrdenCompra_RemisionService,
                                        private dtOrdenCompraService : DetallesOrdenesCompraService,
                                          private shepherdService: ShepherdService,
                                            private msj : MensajesAplicacionService,
                                              private cmpMovMatPrimas : MovimientoMPComponent) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
    this.FormMateriaPrimaFactura = this.frmBuilderMateriaPrima.group({
      ConsecutivoFactura : ['', Validators.required],
      OrdenCompra : ['', Validators.required],
      MpFactura: ['', Validators.required],
      MpRemision : ['', Validators.required],
      proveedor: ['', Validators.required],
      proveedorNombre: ['', Validators.required],
      MpObservacion : ['', Validators.required],
    });

    this.FormRemisiones = this.frmBuilderMateriaPrima.group({
      idRemision : ['', Validators.required],
    });

    this.load = true;
  }

  ngOnInit(): void {
    this.lecturaStorage();
    this.ColumnasTabla();
    this.ColumnasTablaRemisiones();
    this.obtenerProveeedor();
    this._intervalTema = setInterval(() => this.modoSeleccionado = this.AppComponent.temaSeleccionado, 1000);
  }

  //Funcion que se ejecutará al cerrar la vista para limpiar el intervalo del tema seleccionado
  ngOnDestroy(): void {
    clearInterval(this._intervalTema);
    this.destroy$.next();
    this.destroy$.complete();
  }

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

  // Funcion que le va a cambiar el nombre al proveedor
  cambiarNombreProveedor(){
    let id : number = this.FormMateriaPrimaFactura.value.proveedorNombre;
    this.proveedorservices.srvObtenerListaPorId(id).pipe(takeUntil(this.destroy$)).subscribe(datos_proveedor => {
      this.FormMateriaPrimaFactura.patchValue({
        ConsecutivoFactura : this.ultimoIdFactura,
        proveedor: id,
        proveedorNombre: datos_proveedor.prov_Nombre,
      });
    }, () => {
      this.msj.mensajeError(`Error`, `No se encontró información del proveedor`);
      this.load = true;
    });
  }

  // Funcion que se encargará de obtener los proveedores
  obtenerProveeedor = () => this.proveedorservices.srvObtenerLista().pipe(takeUntil(this.destroy$)).subscribe(datos => this.proveedor = datos);

  // Funcion que limpia los todos los campos de la vista
  LimpiarCampos() {
    this.load = true;
    this.FormMateriaPrimaFactura.reset();
    this.FormMateriaPrimaFactura.patchValue({ ConsecutivoFactura : this.ultimoIdFactura, MpFactura : '',  MpRemision : '' });
  }

  // Funcion que limpiará todos los campos
  limpiarTodosCampos(){
    this.LimpiarCampos();
    this.FormRemisiones.reset();
    this.ArrayRemisiones = [];
    this.valorTotal = 0;
    this.load = true;
    this.ArrayMateriaPrima = [];
    this.arrayOrdenCompra = [];
  }

  //Funcion que colocará el nombre a las columnas de la tabla en la cual se muestran los productos pedidos por los clientes
  ColumnasTabla(){
    this.titulosTabla = [];
    this.titulosTabla = [{
      mpId : "Id",
      mpNombre : "Nombre",
      mpCantidad : "Cantidad",
      mpUndMedCant : "Und. Cant",
      mpPrecioU : "Precio U",
      mpSubTotal : "SubTotal",
    }]
  }

  // Funcion que colocará el nombre a las columnas de la tabla en la cual nos enconrtramos
  ColumnasTablaRemisiones(){
    this.titulosTablaRemisiones = [{
      remId : "Id",
      remCodigo : "Codigo",
      remFecha : "Fecha",
      remProveedor : "Proveedor",
      remUsuario : "Usuario",
      remTipoDoc : "Tipo Doc.",
      remPrecio : "Valor"
    }]
  }

  // Funcion que se va a encargar de colocar las materias primas que vienen de la orden de trabajo
  cargarInfoOrdenCompraEnTabla() {
    this.load = false;
    this.arrayOrdenCompra = [];
    this.arrayInfoMatPrima = [];
    let Orden_Compra : any = this.FormMateriaPrimaFactura.value.OrdenCompra;

    if (Orden_Compra != null){
      this.dtOrdenCompraService.GetListaOrdenesComprasxId(Orden_Compra).pipe(takeUntil(this.destroy$)).subscribe(datos_orden => {
        if(datos_orden.length > 0) {
          for (let i = 0; i < datos_orden.length; i++) {
            let mp : number = 0;
            if (datos_orden[i].matPri_Id != 84) mp = datos_orden[i].matPri_Id;
            else if (datos_orden[i].tinta_Id != 2001) mp = datos_orden[i].tinta_Id;
            else if (datos_orden[i].bopP_Id != 1) mp = datos_orden[i].bopP_Id;
            let mpArray : number [] = [];
            this.servicioOCMatPrima.GetOrdenCompraFacturada(Orden_Compra, mp).pipe(takeUntil(this.destroy$)).subscribe(datos_facturacion => {
              for (let j = 0; j < datos_facturacion.length; j++) {
                let info : any = {
                  Id : mp,
                  Id_Mp: datos_facturacion[j].mP_Id,
                  Id_Tinta: datos_facturacion[j].tinta_Id,
                  Id_Bopp: datos_facturacion[j].bopp_Id,
                  Nombre : '',
                  Cantidad : datos_facturacion[j].cantidad_Total,
                  Cantidad_Ingresada : datos_facturacion[j].cantidad_Ingresada,
                  Cantidad_Faltante : datos_facturacion[j].cantidad_Faltante,
                  Cantidad_Faltante_Editar : datos_facturacion[j].cantidad_Faltante,
                  Medida : datos_facturacion[j].presentacion,
                  Precio : datos_facturacion[j].precio,
                  Exits : false,
                }

                if (mpArray.includes(mp)) {
                  for (let k = 0; k < this.arrayOrdenCompra.length; k++) {
                    if (this.arrayOrdenCompra[k].Id == mp) {
                      this.arrayOrdenCompra[k].Cantidad_Ingresada += info.Cantidad_Ingresada;
                      this.arrayOrdenCompra[k].Cantidad_Faltante = this.arrayOrdenCompra[k].Cantidad - this.arrayOrdenCompra[k].Cantidad_Ingresada;
                      this.arrayOrdenCompra[k].Cantidad_Faltante_Editar = this.arrayOrdenCompra[k].Cantidad_Faltante;
                      if (this.arrayOrdenCompra[k].Cantidad_Ingresada >= this.arrayOrdenCompra[k].Cantidad) this.arrayOrdenCompra[k].Exits = true;
                    } else continue;
                  }
                } else {
                  if (info.Id_Mp != 84 && info.Id_Tinta == 2001 && info.Id_Bopp == 1) info.Nombre = datos_facturacion[j].mp;
                  else if (info.Id_Mp == 84 && info.Id_Tinta != 2001 && info.Id_Bopp == 1) info.Nombre = datos_facturacion[j].tinta;
                  else if (info.Id_Mp == 84 && info.Id_Tinta == 2001 && info.Id_Bopp != 1) {
                    info.Id = info.Id_Bopp;
                    info.Nombre = datos_facturacion[j].bopp;
                    this.mostrarCheck = false;
                  }

                  if (info.Cantidad_Ingresada >= info.Cantidad) info.Exits = true;
                  this.FormMateriaPrimaFactura.patchValue({
                    ConsecutivoFactura : this.ultimoIdFactura,
                    proveedor: datos_facturacion[j].proveedor_Id,
                    proveedorNombre: datos_facturacion[j].proveedor,
                    MpObservacion : datos_facturacion[j].observacion,
                  });
                  mpArray.push(mp);
                  this.arrayOrdenCompra.push(info);
                  this.arrayOrdenCompra.sort((a,b) => a.Nombre.localeCompare(b.Nombre));
                }
                this.load = true;
              }
            });
          }
        } else {
          this.msj.mensajeAdvertencia(`Advertencia`,`La orden de compra '${Orden_Compra}' no existe!`);
          this.load = false;
        }
      }, () => {
        this.msj.mensajeError(`Error`, `¡No existe la Orden de Compra #${Orden_Compra}, por favor verifique!`);
        this.load = false;
      });
    }
  }

  //Funcion que va a seleccionar una materia prima
  llenarMateriaPrimaAIngresar(item : any){
    this.load = false;
    this.arrayOrdenCompra.splice(this.arrayOrdenCompra.findIndex((data) => data.Id == item.Id), 1);
    this.ArrayMateriaPrima.sort((a,b) => Number(a.Id) - Number(b.Id) );
    this.ArrayMateriaPrima.sort((a,b) => Number(a.Exits) - Number(b.Exits) );
    this.calcularPrecio();
    setTimeout(() => this.load = true, 50);
  }

  // Funcion que seleccionará y colocará todos los MateriaPrima que se van a insertar
  seleccionarTodosMateriaPrima(){
    this.load = false;
    this.arrayOrdenCompra = [];
    this.arrayOrdenCompra.splice(this.arrayOrdenCompra.findIndex((data) => data.Exits), 1);
    this.ArrayMateriaPrima.sort((a,b) => Number(a.Id) - Number(b.Id) );
    this.ArrayMateriaPrima.sort((a,b) => Number(a.Exits) - Number(b.Exits) );
    this.calcularPrecio();
    setTimeout(() => this.load = true, 50);
  }

  //Funcion que va a quitar lo MateriaPrima que se van a insertar
  quitarMateriaPrimaAIngresar(item : any){
    this.load = false;
    this.ArrayMateriaPrima.splice(this.ArrayMateriaPrima.findIndex((data) => data.Id == item.Id), 1);
    this.arrayOrdenCompra.sort((a,b) => Number(a.Id) - Number(b.Id) );
    this.arrayOrdenCompra.sort((a,b) => Number(a.Exits) - Number(b.Exits) );
    this.calcularPrecio();
    setTimeout(() => this.load = true, 50);
  }

  // Funcion que va a quitar todos los MateriaPrima que se van a insertar
  quitarTodosMateriaPrima(){
    this.load = false;
    this.arrayOrdenCompra.sort((a,b) => Number(a.Id) - Number(b.Id) );
    this.arrayOrdenCompra.sort((a,b) => Number(a.Exits) - Number(b.Exits) );
    this.ArrayMateriaPrima = [];
    this.calcularPrecio();
    setTimeout(() => this.load = true, 50);
  }

  // Funcion que va a calcular el precio total de la factura o remision
  calcularPrecio() {
    return this.ArrayMateriaPrima.filter((data) => !data.Exits).reduce((acc, b) => {
      if(b.Medida == 'Cms' && b.Nombre.includes('CONO')) return acc + (b.Cantidad_Faltante_Editar /** this.promedioCantidadCono(b.Nombre))*/ * b.Precio);
      return acc + (b.Cantidad_Faltante_Editar * b.Precio);
    }, 0);
  }

  // Funcion que va a calcular el subtotal de la factura o remision
  calcularSubtotal(id : any){
    return this.ArrayMateriaPrima.filter((data) => !data.Exits && data.Id == id).reduce((acc, b) => {
      if(b.Medida == 'Cms' && b.Nombre.includes('CONO')) return acc + (b.Cantidad_Faltante_Editar /** this.promedioCantidadCono(b.Nombre))*/ * b.Precio);
      return acc + (b.Cantidad_Faltante_Editar * b.Precio);
    }, 0);
  }

  // Funcion que va a calcular el IVA de la factura o remision
  promedioCantidadCono(value : any){
    return ((parseFloat(value.replace('CONO ', '').replace(' CMS', '').trim().split('-')[0]) + parseFloat(value.replace('CONO ', '').replace(' CMS', '').trim().split('-')[1])) / 2)
  }

  //Funcion que validará el campo sobre el que se está colocando del consecutivo, factura o remisimos
  validarCampos(){
    if (this.FormMateriaPrimaFactura.value.MpRemision == '' && this.FormMateriaPrimaFactura.value.MpFactura == '') this.msj.mensajeAdvertencia(`Advertencia`, "Solo debe llenar el campo Remisión o Factura.");
    else if (this.FormMateriaPrimaFactura.value.MpRemision != '' && this.FormMateriaPrimaFactura.value.MpFactura == '') this.registrarRemisionMP();
    else if (this.FormMateriaPrimaFactura.value.MpRemision == '' && this.FormMateriaPrimaFactura.value.MpFactura != '') this.registrarFacturaMP();
  }

  //Funcion que registrará y guardará en la base de datos la infomacion de la materia prima entrante
  registrarFacturaMP(){
    let oc : number = this.FormMateriaPrimaFactura.value.OrdenCompra;
    this.load = false;
    const datosFactura : any = {
      Facco_Codigo : this.FormMateriaPrimaFactura.value.MpFactura,
      Facco_FechaFactura : this.today,
      Facco_FechaVencimiento : this.today,
      Facco_Hora : moment().format('H:mm:ss'),
      Prov_Id : this.FormMateriaPrimaFactura.value.proveedor,
      Facco_ValorTotal : this.calcularPrecio(),
      Facco_Observacion : this.FormMateriaPrimaFactura.value.MpObservacion,
      Estado_Id : 13,
      Usua_Id : this.storage_Id,
      TpDoc_Id : 'FCO',
    }
    this.facturaMpComService.srvGuardar(datosFactura).pipe(takeUntil(this.destroy$)).subscribe(() => this.obtenerUltimoIdFacturaCompra(oc), () => {
      this.msj.mensajeError(`Error`, `¡Error al crear la factura!`);
      this.load = true;
    });
  }

  // Funicion que va a colocar el id de la ultimo factura
  obtenerUltimoIdFacturaCompra(oc : number){
    this.facturaMpComService.UltimoIdFactura().pipe(takeUntil(this.destroy$)).subscribe(datos_facturas => {
        this.creacionFacturaMateriaPrima(datos_facturas, oc)
      }, () => {
      this.msj.mensajeError(`Error`, `¡Error al obtener la ultima factura creada!`);
      this.load = true;
    });
  }

  //Funcion que creará el registro de la materia que viene en un pedido
  creacionFacturaMateriaPrima(idFactura : any, oc : number){
    if (this.ArrayMateriaPrima.length == 0) {
      this.msj.mensajeAdvertencia(`Advertencia`, "Debe cargar minimo una materia prima en la tabla");
      this.load = true;
      return;
    }

    const peticiones = this.ArrayMateriaPrima.map(mp => {
      const datosFacturaMp : any = {
        Facco_Id : idFactura,
        MatPri_Id : mp.Id_Mp,
        Tinta_Id : mp.Id_Tinta,
        Bopp_Id : mp.Id_Bopp,
        FaccoMatPri_Cantidad : mp.Cantidad_Faltante_Editar,
        UndMed_Id : mp.Medida,
        FaccoMatPri_ValorUnitario : mp.Precio,
      };
      return this.facturaMpService.srvGuardar(datosFacturaMp);
    });

    forkJoin(peticiones).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.relacionOrdenFactura(idFactura, oc);
        this.cargarRemisionEnFactura(idFactura);
        this.estadoOrdenCompra(oc);
        this.moverInventarioMP();
        this.moverInventarioTintas();
        this.cmpMovMatPrimas.entradasMateriasPrimas({ Id: idFactura, Movimiento: 'FCO' });
        setTimeout(() => {
          this.msj.mensajeConfirmacion(`Confirmación`, `¡Registro de factura/Remisión creado con exito!`);
          this.limpiarTodosCampos();
        }, 1500);
      },
      error: () => {
        this.msj.mensajeAdvertencia(`Advertencia`, `¡Error al crear la factura con las materia primas seleccionadas!`);
        this.load = true;
      }
    });
  }

  // Funcion que va a crear la relacion entre la orden de compra y las posibles facturas que puede tener
  relacionOrdenFactura(factura : any, oc : number){
    let info : any = {
      Oc_Id : oc,
      Facco_Id : factura,
    }
    this.OrdenesFacturasService.insert_OrdenCompra(info).pipe(takeUntil(this.destroy$)).subscribe(null, () => {
      this.msj.mensajeError(`Error`, `¡No se ha creado la relacion entre la factura y la orden de compra!`);
      this.load = true;
    });
  }

  // Funcion que le a cambiar el estado a la orden de compra
  estadoOrdenCompra(oc : number){
    const Orden_Compra : any = oc;

    this.dtOrdenCompraService.GetListaOrdenesComprasxId(Orden_Compra).pipe(
      switchMap(datos_orden => {
        // Construir una petición por cada ítem de la orden (sin break: procesa todos)
        const peticionesFacturacion = datos_orden.map((item : any) => {
          let mp : number = 0;
          if (item.matPri_Id != 84) mp = item.matPri_Id;
          else if (item.tinta_Id != 2001) mp = item.tinta_Id;
          else if (item.bopP_Id != 1) mp = item.bopP_Id;
          return this.servicioOCMatPrima.GetOrdenCompraFacturada(Orden_Compra, mp);
        });

        // Esperar que todas las consultas de facturación terminen
        return forkJoin(peticionesFacturacion);
      }),
      switchMap((resultados : any[]) => {
        // Determinar estado revisando TODOS los resultados (no solo el primero)
        let estado : number = 5; // asumir completo
        for (const datos_facturacion of resultados) {
          for (const item of datos_facturacion) {
            if (item.cantidad_Faltante > 0) {
              console.log('Faltante encontrado:', item);
              estado = 11; // hay faltante → en proceso
              break;
            }
          }
          if (estado === 11) break;
        }

        // Obtener datos actuales de la OC para hacer el PUT
        return this.servicioOCMatPrima.getId_OrdenCompra(Orden_Compra).pipe(
          switchMap(datos_orden => {
            const info : any = {
              Oc_Id : datos_orden.oc_Id,
              Usua_Id : datos_orden.usua_Id,
              Oc_Fecha : datos_orden.oc_Fecha,
              Oc_Hora : datos_orden.oc_Hora,
              Prov_Id : datos_orden.prov_Id,
              Estado_Id : estado,
              Oc_ValorTotal : datos_orden.oc_ValorTotal,
              Oc_PesoTotal : datos_orden.oc_PesoTotal,
              TpDoc_Id : datos_orden.tpDoc_Id,
              Oc_Observacion : datos_orden.oc_Observacion,
              IVA : datos_orden.iva,
            };
            return this.servicioOCMatPrima.putId_OrdenCompra(Orden_Compra, info);
          })
        );
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        //this.load = true;
        console.log('Estado de la orden de compra actualizado correctamente');
      },
      error: () => {
        this.msj.mensajeError(`Error`, `¡Error al cambiar el estado de la orden de compra!`);
        this.load = true;
      }
    });
  }

  // Funcion que se encargará de la relacion entre la(s) remision(es) o factura(s)
  cargarRemisionEnFactura(idFactura : number){
    for (const rem of this.ArrayRemisiones) {
      const datosFacRem : any = {
        Rem_Id : rem.remisionId,
        Facco_Id : idFactura,
      }
      this.remisionFacturaService.srvGuardar(datosFacRem).pipe(takeUntil(this.destroy$)).subscribe(null, () => {
        this.msj.mensajeError(`Error`, `¡Error al añadir la(s) remision(es) a la factura!`);
        this.load = true;
      });
    }
  }

  //Funcion que registrará y guardará en la base de datos la infomacion de la materia prima entrante en una remisión.
  registrarRemisionMP(){
    this.load = false;
    let oc : number = this.FormMateriaPrimaFactura.value.OrdenCompra; 

    const datosRemision : any = {
      Rem_Codigo : this.FormMateriaPrimaFactura.value.MpRemision,
      Rem_Fecha : this.today,
      Rem_Hora : moment().format('H:mm:ss'),
      Rem_PrecioEstimado : this.calcularPrecio(),
      Prov_Id : this.FormMateriaPrimaFactura.value.proveedor,
      Estado_Id : 12,
      Usua_Id : this.storage_Id,
      TpDoc_Id : 'REM',
      Rem_Observacion : this.FormMateriaPrimaFactura.value.MpObservacion,
    }
    this.remisionService.srvGuardar(datosRemision).pipe(takeUntil(this.destroy$)).subscribe(() => this.obtenerUltimoIdRemision(oc), () => {
      this.msj.mensajeError(`Error`, `¡Error al crear la remisión!`);
      this.load = true;
    });
  }

  // Funcion que se encargará de obtener el ultimo Id de las facturas
  obtenerUltimoIdRemision(oc : number){
    this.remisionService.UltimoIdRemision().pipe(takeUntil(this.destroy$)).subscribe(datos_remision => this.creacionRemisionMateriaPrima(datos_remision, oc), () => {
      this.msj.mensajeError(`Error`, `¡Error al obtener el Id de la ultima remisión!`);
      this.load = true;
    });
  }

  //Funcion que creará el registro de la materia que viene en un pedido
  creacionRemisionMateriaPrima(idRemision : any, oc : number){
    if (this.ArrayMateriaPrima.length == 0) {
      this.msj.mensajeAdvertencia(`Advertencia`, "Debe cargar minimo una materia prima en la tabla");
      this.load = true;
      return;
    }

    const peticiones = this.ArrayMateriaPrima.map(mp => {
      const datosRemisionMp : any = {
        Rem_Id : idRemision,
        MatPri_Id : mp.Id_Mp,
        Tinta_Id : mp.Id_Tinta,
        Bopp_Id : mp.Id_Bopp,
        RemiMatPri_Cantidad : mp.Cantidad_Faltante_Editar,
        UndMed_Id : mp.Medida,
        RemiMatPri_ValorUnitario : mp.Precio,
      };
      return this.remisionMPService.srvGuardar(datosRemisionMp);
    });
    console.log('peticiones :', peticiones)

    forkJoin(peticiones).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.relacionOrdenRemision(idRemision, oc);
        this.estadoOrdenCompra(oc);
        this.moverInventarioMP();
        this.moverInventarioTintas();
        this.cmpMovMatPrimas.entradasMateriasPrimas({ Id: idRemision, Movimiento: 'REM' });
        setTimeout(() => { 
          this.limpiarTodosCampos(); 
          this.msj.mensajeConfirmacion(`Confirmación`, `¡Registro de remisión creado con exito!`);
        }, 1500);
      },
      error: () => {
        this.msj.mensajeError(`Error`, `¡Error al añadir la(s) materia(s) prima(s) a la remisión!`);
        this.load = true;
      }
    });
  }

  // Funcion que va a crear la relacion entre la orden de compra y las posibles facturas que puede tener
  relacionOrdenRemision(idRemision : any, oc : number){
    let info : any = {
      Oc_Id : oc,
      Rem_Id : idRemision,
    }
    this.ordenCompraRemisionService.insert_OrdenCompra(info).pipe(takeUntil(this.destroy$)).subscribe(data => {
      console.log('Relacion OC-REM creada:', data);
    }, () => {
      this.msj.mensajeError(`Error`, `¡No se ha creado la relacion entre la remisión y la orden de compra!`);
      this.load = true;
    });
  }

  // Funcion que va a mosver el inventario de materia prima
  moverInventarioMP(){
    const peticiones = this.ArrayMateriaPrima
      .filter(item => item.Id_Mp != 84)
      .map(item =>
        this.materiaPrimaService.srvObtenerListaPorId(item.Id_Mp).pipe(
          switchMap(datos_materiaPrima => {
            const datosMPActualizada : any = {
              MatPri_Id : datos_materiaPrima.matPri_Id,
              MatPri_Nombre : datos_materiaPrima.matPri_Nombre,
              MatPri_Descripcion : datos_materiaPrima.matPri_Descripcion,
              MatPri_Stock : datos_materiaPrima.matPri_Stock + item.Cantidad_Faltante_Editar,
              UndMed_Id : datos_materiaPrima.undMed_Id,
              CatMP_Id : datos_materiaPrima.catMP_Id,
              MatPri_Precio : datos_materiaPrima.matPri_Precio,
              TpBod_Id : datos_materiaPrima.tpBod_Id,
              MatPri_PrecioEstandar : datos_materiaPrima.matPri_PrecioEstandar,
              SubCatMP_Id : datos_materiaPrima.subCatMP_Id
            };
            return this.materiaPrimaService.srvActualizar(datos_materiaPrima.matPri_Id, datosMPActualizada);
          })
        )
      );

    if (peticiones.length === 0) return;

    forkJoin(peticiones).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => { 
        this.load = true; 
        console.log('Existencia de materias primas actualizada correctamente');
      },
      error: () => {
        this.msj.mensajeError(`Error`, `¡No se ha podido actualizar la existencia de las materias primas!`);
        this.load = true;
      }
    });
  }

  //Función que restará a las tintas de categoria diferente a TINTAS TIPO COLORES.
  moverInventarioTintas(){
    const peticiones = this.ArrayMateriaPrima
      .filter(item => item.Id_Tinta != 2001)
      .map(item =>
      this.tintasService.srvObtenerListaPorId(item.Id_Tinta).pipe(
        switchMap(datos_tinta => {
          const datosTintaActualizada : any = {
            Tinta_Id : datos_tinta.tinta_Id,
            Tinta_Nombre : datos_tinta.tinta_Nombre,
            Tinta_Descripcion : datos_tinta.tinta_Descripcion,
            Tinta_Stock : datos_tinta.tinta_Stock + item.Cantidad_Faltante_Editar,
            Tinta_CodigoHexadecimal : datos_tinta.tinta_CodigoHexadecimal,
            UndMed_Id : datos_tinta.undMed_Id,
            CatMP_Id : datos_tinta.catMP_Id,
            Tinta_Precio : datos_tinta.tinta_Precio,
            TpBod_Id : datos_tinta.tpBod_Id,
            Tinta_InvInicial : datos_tinta.tinta_InvInicial,
            Tinta_PrecioEstandar : datos_tinta.tinta_PrecioEstandar,
          };
          return this.tintasService.srvActualizar(datos_tinta.tinta_Id, datosTintaActualizada);
        })
      )
    );

    if (peticiones.length === 0) return;

    forkJoin(peticiones).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => { 
        this.load = true; 
        console.log('Existencia de tintas actualizada correctamente');
      },
      error: () => {
        this.msj.mensajeError(`Error`, `¡No se ha podido actualizar la existencia de las tintas!`);
        this.load = true;
      }
    });
  }

  //Consultar Remisiones por Codigo
  consultarIdRemisiones(){
    let idRemision : number = this.FormRemisiones.value.idRemision;
    this.remision = [];
    this.remConFac = [];
    this.load = false;

    this.remisionMPService.GetRemisionSinFactura(idRemision).pipe(takeUntil(this.destroy$)).subscribe(datos_remision => {
      for (let i = 0; i < datos_remision.length; i++) {
        let datosTablaRemisiones : any = {
          remisionId : datos_remision[i].rem_Id,
          remisionCodigo : datos_remision[i].rem_Codigo,
          remisionFecha : datos_remision[i].rem_Fecha,
          remisionProveedor : datos_remision[i].prov_Nombre,
          remisionUsuario :  datos_remision[i].usua_Nombre,
          remisionDocumento : datos_remision[i].tpDoc_Nombre,
          remisionPrecio : datos_remision[i].rem_PrecioEstimado
        }
        this.precioRemision = datosTablaRemisiones.remisionPrecio
        this.ArrayRemisiones.push(datosTablaRemisiones);
        this.load = true;
      }
    }, () => {
      this.msj.mensajeError(`Error`, `¡No se pudo obtener información de la remisión!`);
      this.load = true;
    });
  }

  //
  cargarPDF(formulario : any){
    let id : any = formulario.remisionCodigo;
    this.remisionMPService.srvObtenerpdfMovimientos(id).pipe(takeUntil(this.destroy$)).subscribe(datos_remision => {
      for (let i = 0; i < datos_remision.length; i++) {
        for (let j = 0; j < this.mpAgregada.length; j++) {
          const pdfDefinicion : any = {
            info: {
              title: `${id}`
            },
            content : [
              {
                text: `Plasticaribe S.A.S ---- Remisión de Compra de Materia Prima`,
                alignment: 'center',
                style: 'titulo',
              },
              '\n \n',
              {
                text: `Fecha de registro: ${datos_remision[i].rem_Fecha.replace('T00:00:00', '')}`,
                style: 'header',
                alignment: 'right',
              },
              {
                text: `Registrado Por: ${datos_remision[i].usua_Nombre}\n`,
                alignment: 'right',
                style: 'header',
              },
              {
                text: `\n Información detallada del Proveedor \n \n`,
                alignment: 'center',
                style: 'header'
              },
              {
                style: 'tablaCliente',
                table: {
                  widths: ['*', '*', '*'],
                  style: 'header',
                  body: [
                    [
                      `ID: ${datos_remision[i].prov_Id}`,
                      `Tipo de ID: ${datos_remision[i].tipoIdentificacion_Id}`,
                      `Tipo de Proveedor: ${datos_remision[i].tpProv_Nombre}`
                    ],
                    [
                      `Nombre: ${datos_remision[i].prov_Nombre}`,
                      `Telefono: ${datos_remision[i].prov_Telefono}`,
                      `Ciudad: ${datos_remision[i].prov_Ciudad}`
                    ],
                    [
                      `E-mail: ${datos_remision[i].prov_Email}`,
                      ``,
                      ``
                    ]
                  ]
                },
                layout: 'lightHorizontalLines',
                fontSize: 9,
              },
              {
                text: `\n \nObervación sobre la remisión: \n ${datos_remision[i].rem_Observacion}\n`,
                style: 'header',
              },
              {
                text: `\n Información detallada de Materia(s) Prima(s) comprada(s) \n `,
                alignment: 'center',
                style: 'header'
              },

              this.table(this.mpAgregada, ['Id', 'Nombre', 'Cant', 'UndCant', 'PrecioUnd', 'SubTotal']),
            ],
            styles: {
              header: {
                fontSize: 8,
                bold: true
              },
              titulo: {
                fontSize: 15,
                bold: true
              }
            }
          }
          const pdf = pdfMake.createPdf(pdfDefinicion);
          pdf.open();
          break;
        }
        break;
      }
    }, () => {
      this.msj.mensajeError(`Error`, `¡No se pudo obtener información de la remisión!`);
      this.load = true;
    });
  }

  //
  llenarDocumento(formulario : any){
    let id : any = formulario.remisionCodigo;
    this.mpAgregada = [];
    this.remisionMPService.srvObtenerpdfMovimientos(id).pipe(takeUntil(this.destroy$)).subscribe(datos_remision => {
      for (let i = 0; i < datos_remision.length; i++) {
        let items : any = {
          Id : datos_remision[i].matPri_Id,
          Nombre : datos_remision[i].matPri_Nombre,
          Cant : this.formatonumeros(datos_remision[i].remiMatPri_Cantidad),
          UndCant : datos_remision[i].undMed_Id,
          PrecioUnd : this.formatonumeros(datos_remision[i].remiMatPri_ValorUnitario),
          SubTotal : this.formatonumeros(datos_remision[i].remiMatPri_Cantidad * datos_remision[i].remiMatPri_ValorUnitario),
        }
        this.mpAgregada.push(items);
      }
      setTimeout(() => this.cargarPDF(formulario), 2000);
    }, () => {
      this.msj.mensajeError(`Error`, `¡No se pudo obtener información de la remisión!`);
      this.load = true;
    });
  }

  // funcion que se encagará de llenar la tabla de los productos en el pdf
  buildTableBody(data, columns) {
    var body : any = [];
    body.push(columns);
    data.forEach(function(row) {
      var dataRow : any = [];
      columns.forEach((column) => dataRow.push(row[column].toString()));
      body.push(dataRow);
    });
    return body;
  }

  // Funcion que genera la tabla donde se mostrará la información de los productos pedidos
  table(data, columns) {
    return {
      table: {
        headerRows: 1,
        widths: [30, '*', 70, 50, 50, 80],
        body: this.buildTableBody(data, columns),
      },
      fontSize: 9,
      layout: {
        fillColor: function (rowIndex) {
          return (rowIndex == 0) ? '#CCCCCC' : null;
        }
      }
    };
  }
}
