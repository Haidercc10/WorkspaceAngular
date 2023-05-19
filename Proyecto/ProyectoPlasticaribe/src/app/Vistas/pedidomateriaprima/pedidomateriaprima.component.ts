import { Component, OnInit } from '@angular/core';
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
import { OrdenCompra_MateriaPrimaService } from 'src/app/Servicios/OrdenCompra/OrdenCompra_MateriaPrima.service';
import { OrdenFactura_RelacionService } from 'src/app/Servicios/OrdenCompra_Facturas/OrdenFactura_Relacion.service';
import { OrdenCompra_RemisionService } from 'src/app/Servicios/OrdenCompra_Remision/OrdenCompra_Remision.service';
import { ProveedorService } from 'src/app/Servicios/Proveedor/proveedor.service';
import { RemisionService } from 'src/app/Servicios/Remisiones/Remision.service';
import { RemisionFacturaService } from 'src/app/Servicios/Remisiones_Facturas/remisionFactura.service';
import { RolesService } from 'src/app/Servicios/Roles/roles.service';
import { TintasService } from 'src/app/Servicios/Tintas/tintas.service';
import { AppComponent } from 'src/app/app.component';
import { defaultStepOptions, stepsEntradasMp as defaultSteps } from 'src/app/data';

@Component({
  selector: 'app_pedidomateriaprima_component',
  templateUrl: './pedidomateriaprima.component.html',
  styleUrls: ['./pedidomateriaprima.component.css']
})

export class PedidomateriaprimaComponent implements OnInit {

  public FormMateriaPrimaFactura !: FormGroup;
  public FormRemisiones !: FormGroup;

  public consultaRemisiones !: FormGroup;

  /* Vaiables*/
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista
  facturaMateriaPrima = []; //Funcion que guardará la informacion de la factura de materia prima comprada que ha sido consultada
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  titulosTabla = []; //Variable que almacenará los titulos de la tabla de productos que se ve al final de la vista
  ArrayMateriaPrima : any [] = []; //Variable que tendrá la informacion de los productos que se piden en el nuevo pedido
  valorTotal : number = 0; //Variable que guardará el valor total de la factura de entrada de materia prima
  proveedor = []; //Variable que almacenará los diferentes proveedores de materia prima
  ultimoIdFactura : number = 0;
  ultimoIdRemision : number = 0;
  ArrayRemisiones = [];
  precioRemision = [];
  titulosTablaRemisiones = [];
  mpAgregada = [];
  /* CONSULTAS DE MATERIA PRIMA */
  MpConsultada = [];
  remision : any = [];
  remConFac : any = [];
  mostrarCheck : boolean = true;

  public load: boolean;
  public arrayOrdenCompra : any [] = [];
  public arrayMatPrimaFactura : any [] = [];
  public arrayInfoMatPrima : any [] = [];

  modalMode : boolean = false;
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro

  constructor(private materiaPrimaService : MateriaPrimaService,
                private rolService : RolesService,
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
                                            private messageService: MessageService,
                                              private shepherdService: ShepherdService) {
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
  formatonumeros = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = '$1,';
    return number.toString().replace(exp,rep);
  }

  // Funcion que le va a cambiar el nombre al proveedor
  cambiarNombreProveedor(){
    let id : number = this.FormMateriaPrimaFactura.value.proveedorNombre;
    this.proveedorservices.srvObtenerListaPorId(id).subscribe(datos_proveedor => {
      this.FormMateriaPrimaFactura.setValue({
        ConsecutivoFactura : this.ultimoIdFactura,
        OrdenCompra : this.FormMateriaPrimaFactura.value.OrdenCompra,
        MpFactura: this.FormMateriaPrimaFactura.value.MpFactura,
        MpRemision : this.FormMateriaPrimaFactura.value.MpRemision,
        proveedor: id,
        proveedorNombre: datos_proveedor.prov_Nombre,
        MpObservacion : this.FormMateriaPrimaFactura.value.MpObservacion,
      });
    }, error => { this.mostrarError(`Error`, `No se encontró información del proveedor`); });
  }

  // Funcion que se encargará de obtener los proveedores
  obtenerProveeedor(){
    this.proveedorservices.srvObtenerLista().subscribe(datos_proveedor => {
      for (let index = 0; index < datos_proveedor.length; index++) {
        this.proveedor.push(datos_proveedor[index]);
      }
    });
  }

  // Funcion que limpia los todos los campos de la vista
  LimpiarCampos() {
    this.load = true;
    this.FormMateriaPrimaFactura.setValue({
      ConsecutivoFactura : this.ultimoIdFactura,
      OrdenCompra : null,
      MpFactura: '',
      MpRemision : '',
      proveedor: '',
      proveedorNombre: '',
      MpObservacion : '',
    });
  }

  // Funcion que limpiará todos los campos
  limpiarTodosCampos(){
    this.FormMateriaPrimaFactura.setValue({
      ConsecutivoFactura : this.ultimoIdFactura,
      OrdenCompra : '',
      MpFactura: '',
      MpRemision : '',
      proveedor: '',
      proveedorNombre: '',
      MpObservacion : '',
    });
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
      this.dtOrdenCompraService.GetListaOrdenesComprasxId(Orden_Compra).subscribe(datos_orden => {
        if(datos_orden.length > 0) {
          for (let i = 0; i < datos_orden.length; i++) {
            let mp : number = 0;
            if (datos_orden[i].matPri_Id != 84) mp = datos_orden[i].matPri_Id;
            else if (datos_orden[i].tinta_Id != 2001) mp = datos_orden[i].tinta_Id;
            else if (datos_orden[i].bopP_Id != 1) mp = datos_orden[i].bopP_Id;
            let mpArray : number [] = [];
            this.servicioOCMatPrima.GetOrdenCompraFacturada(Orden_Compra, mp).subscribe(datos_facturacion => {
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
        } else this.mostrarAdvertencia(`Advertencia`,`La orden de compra '${Orden_Compra}' no existe!`);
      }, error => { this.mostrarError(`Error`, `¡No existe la Orden de Compra #${Orden_Compra}, por favor verifique!`); });
    }
  }

  //Funcion que va a seleccionar una materia prima
  llenarMateriaPrimaAIngresar(item : any){
    this.load = false;
    for (let i = 0; i < this.arrayOrdenCompra.length; i++) {
      if (this.arrayOrdenCompra[i].Id == item.Id) this.arrayOrdenCompra.splice(i, 1);
    }
    this.ArrayMateriaPrima.sort((a,b) => Number(a.Id) - Number(b.Id) );
    this.ArrayMateriaPrima.sort((a,b) => Number(a.Exits) - Number(b.Exits) );
    this.calcularPrecio();
    setTimeout(() => { this.load = true; }, 50);
  }

  // Funcion que seleccionará y colocará todos los MateriaPrima que se van a insertar
  seleccionarTodosMateriaPrima(item : any){
    this.load = false;
    this.arrayOrdenCompra = [];
    for (let i = 0; i < item.length; i++) {
      if (item[i].Exits == true) this.arrayOrdenCompra.push(item[i]);
    }
    this.ArrayMateriaPrima.sort((a,b) => Number(a.Id) - Number(b.Id) );
    this.ArrayMateriaPrima.sort((a,b) => Number(a.Exits) - Number(b.Exits) );
    this.calcularPrecio();
    setTimeout(() => { this.load = true; }, 50);
  }

  //Funcion que va a quitar lo MateriaPrima que se van a insertar
  quitarMateriaPrimaAIngresar(item : any){
    this.load = false;
    for (let i = 0; i < this.ArrayMateriaPrima.length; i++) {
      if (this.ArrayMateriaPrima[i].Id == item.Id) this.ArrayMateriaPrima.splice(i, 1);
    }
    this.arrayOrdenCompra.sort((a,b) => Number(a.Id) - Number(b.Id) );
    this.arrayOrdenCompra.sort((a,b) => Number(a.Exits) - Number(b.Exits) );
    this.calcularPrecio();
    setTimeout(() => { this.load = true; }, 50);
  }

  // Funcion que va a quitar todos los MateriaPrima que se van a insertar
  quitarTodosMateriaPrima(item : any){
    this.load = false;
    this.arrayOrdenCompra.sort((a,b) => Number(a.Id) - Number(b.Id) );
    this.arrayOrdenCompra.sort((a,b) => Number(a.Exits) - Number(b.Exits) );
    this.ArrayMateriaPrima = [];
    this.calcularPrecio();
    setTimeout(() => { this.load = true; }, 50);
  }

  // Funcion que va a calcular el precio total de la factura o remision
  calcularPrecio(){
    this.valorTotal = 0;
    for (let i = 0; i < this.ArrayMateriaPrima.length; i++) {
      if (!this.ArrayMateriaPrima[i].Exits) {
        this.valorTotal += (this.ArrayMateriaPrima[i].Precio * this.ArrayMateriaPrima[i].Cantidad_Faltante);
      }
    }
  }

  // Funcion que validará la cantidad que se está cambiando
  validarCantidad(item : any){
    if (item.Cantidad > item.Cantidad_Oculta) {
      for (let i = 0; i < this.ArrayMateriaPrima.length; i++) {
        if (item.Id == this.ArrayMateriaPrima[i].Id) this.ArrayMateriaPrima[i].Cantidad = this.ArrayMateriaPrima[i].Cantidad_Oculta;
      }
      this.mostrarAdvertencia(`Cantidad insuficiente`, `¡La cantidad ${item.Cantidad} no está disponible para la materia prima ${item.Nombre}!`);
    }
  }

  //Funcion que validará el campo sobre el que se está colocando del consecutivo, factura o remisimos
  validarCampos(){
    if (this.FormMateriaPrimaFactura.value.MpRemision == '' && this.FormMateriaPrimaFactura.value.MpFactura == '') this.mostrarAdvertencia(`Advertencia`, "Solo debe llenar el campo Remisión o Factura.");
    else if (this.FormMateriaPrimaFactura.value.MpRemision != '' && this.FormMateriaPrimaFactura.value.MpFactura == '') this.registrarRemisionMP();
    else if (this.FormMateriaPrimaFactura.value.MpRemision == '' && this.FormMateriaPrimaFactura.value.MpFactura != '') this.registrarFacturaMP();
  }

  //Funcion que registrará y guardará en la base de datos la infomacion de la materia prima entrante
  registrarFacturaMP(){
    this.load = false;
    const datosFactura : any = {
      Facco_Codigo : this.FormMateriaPrimaFactura.value.MpFactura,
      Facco_FechaFactura : this.today,
      Facco_FechaVencimiento : this.today,
      Facco_Hora : moment().format('H:mm:ss'),
      Prov_Id : this.FormMateriaPrimaFactura.value.proveedor,
      Facco_ValorTotal : this.valorTotal,
      Facco_Observacion : this.FormMateriaPrimaFactura.value.MpObservacion,
      Estado_Id : 13,
      Usua_Id : this.storage_Id,
      TpDoc_Id : 'FCO',
    }
    this.facturaMpComService.srvGuardar(datosFactura).subscribe(datos_facturaCreada => { this.obtenerUltimoIdFacturaCompra(); }, error => {
      this.mostrarError(`Error`, `¡Error al crear la factura!`);
      this.load = true;
    });
  }

  // Funicion que va a colocar el id de la ultimo factura
  obtenerUltimoIdFacturaCompra(){
    this.facturaMpComService.UltimoIdFactura().subscribe(datos_facturas => { this.creacionFacturaMateriaPrima(datos_facturas); }, error => {
      this.mostrarError(`Error`, `¡Error al obtener la ultima factura creada!`);
      this.load = true;
    });
  }

  //Funcion que creará el registro de la materia que viene en un pedido
  creacionFacturaMateriaPrima(idFactura : any){
    let errorConsulta : boolean;
    if (this.ArrayMateriaPrima.length == 0) this.mostrarAdvertencia(`Advertencia`, "Debe cargar minimo una materia prima en la tabla");
    else {
      for (let index = 0; index < this.ArrayMateriaPrima.length; index++) {
        const datosFacturaMp : any = {
          Facco_Id : idFactura,
          MatPri_Id : this.ArrayMateriaPrima[index].Id_Mp,
          Tinta_Id : this.ArrayMateriaPrima[index].Id_Tinta,
          Bopp_Id : this.ArrayMateriaPrima[index].Id_Bopp,
          FaccoMatPri_Cantidad : this.ArrayMateriaPrima[index].Cantidad_Faltante_Editar,
          UndMed_Id : this.ArrayMateriaPrima[index].Medida,
          FaccoMatPri_ValorUnitario : this.ArrayMateriaPrima[index].Precio,
        }
        this.facturaMpService.srvGuardar(datosFacturaMp).subscribe(datos_facturaMpCreada => {  }, error => {
          errorConsulta = true;
          this.mostrarError(`Advertencia`, `¡Error al crear la factura con las materia primas seleccionadas!`);
          this.load = true;
        });
      }
      setTimeout(() => {
        if (!errorConsulta) {
          this.relacionOrdenFactura(idFactura);
          this.cargarRemisionEnFactura(idFactura);
          setTimeout(() => {
            this.estadoOrdenCompra();
            this.moverInventarioMP();
            this.moverInventarioTintas();
            setTimeout(() => { this.limpiarTodosCampos(); }, 1500);
          }, 2000);
        }
      }, 3500);
    }
  }

  // Funcion que va a crear la relacion entre la orden de compra y las posibles facturas que puede tener
  relacionOrdenFactura(factura : any){
    let info : any = {
      Oc_Id : this.FormMateriaPrimaFactura.value.OrdenCompra,
      Facco_Id : factura,
    }
    this.OrdenesFacturasService.insert_OrdenCompra(info).subscribe(datos_insertados => { }, error => {
      this.mostrarError(`Error`, `¡No se ha creado la relacion entre la factura y la orden de compra!`);
      this.load = true;
    });
  }

  // Funcion que le a cambiar el estado a la orden de compra
  estadoOrdenCompra(){
    let Orden_Compra : any = this.FormMateriaPrimaFactura.value.OrdenCompra, estado : number;
    this.dtOrdenCompraService.GetListaOrdenesComprasxId(Orden_Compra).subscribe(datos_orden => {
      for (let i = 0; i < datos_orden.length; i++) {
        let mp : number = 0;
        if (datos_orden[i].matPri_Id != 84) mp = datos_orden[i].matPri_Id;
        else if (datos_orden[i].tinta_Id != 2001) mp = datos_orden[i].tinta_Id;
        else if (datos_orden[i].bopP_Id != 1) mp = datos_orden[i].bopP_Id;
        this.servicioOCMatPrima.GetOrdenCompraFacturada(Orden_Compra, mp).subscribe(datos_facturacion => {
          for (let j = 0; j < datos_facturacion.length; j++) {
            if (datos_facturacion[j].cantidad_Faltante <= 0) estado = 5
            else {
              estado = 11;
              break;
            }
          }
        });
        break;
      }
      setTimeout(() => {
        this.servicioOCMatPrima.getId_OrdenCompra(Orden_Compra).subscribe(datos_orden => {
          let info : any = {
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
          }
          this.servicioOCMatPrima.putId_OrdenCompra(Orden_Compra, info).subscribe(datos_ordenActualizada => { }, error => {
            this.mostrarError(`Error`,`¡Error al cambiar el estado de la orden de compra!`);
            this.load = true;
          });
        });
      }, 2000);
    });
  }

  // Funcion que se encargará de la relacion entre la(s) remision(es) o factura(s)
  cargarRemisionEnFactura(idFactura : number){
    for (const rem of this.ArrayRemisiones) {
      const datosFacRem : any = {
        Rem_Id : rem.remisionId,
        Facco_Id : idFactura,
      }
      this.remisionFacturaService.srvGuardar(datosFacRem).subscribe(datosFacRemision => { }, error => {
        this.mostrarError(`Error`, `¡Error al añadir la(s) remision(es) a la factura!`);
        this.load = true;
      });
    }
  }

  //Funcion que registrará y guardará en la base de datos la infomacion de la materia prima entrante en una remisión.
  registrarRemisionMP(){
    this.load = false;
    const datosRemision : any = {
      Rem_Codigo : this.FormMateriaPrimaFactura.value.MpRemision,
      Rem_Fecha : this.today,
      Rem_Hora : moment().format('H:mm:ss'),
      Rem_PrecioEstimado : this.valorTotal,
      Prov_Id : this.FormMateriaPrimaFactura.value.proveedor,
      Estado_Id : 12,
      Usua_Id : this.storage_Id,
      TpDoc_Id : 'REM',
      Rem_Observacion : this.FormMateriaPrimaFactura.value.MpObservacion,
    }
    this.remisionService.srvGuardar(datosRemision).subscribe(datos_remisionCreada => { this.obtenerUltimoIdRemision(); }, error => {
      this.mostrarError(`Error`, `¡Error al crear la remisión!`);
      this.load = true;
    });
  }

  // Funcion que se encargará de obtener el ultimo Id de las facturas
  obtenerUltimoIdRemision(){
    this.remisionService.UltimoIdRemision().subscribe(datos_remision => { this.creacionRemisionMateriaPrima(datos_remision); }, error => {
      this.mostrarError(`Error`, `¡Error al obtener el Id de la ultima remisión!`);
      this.load = true;
    });
  }

  //Funcion que creará el registro de la materia que viene en un pedido
  creacionRemisionMateriaPrima(idRemision : any){
    let errorConsulta : boolean;
    if (this.ArrayMateriaPrima.length == 0) this.mostrarAdvertencia(`Advertencia`, "Debe cargar minimo una materia prima en la tabla")
    else {
      for (let index = 0; index < this.ArrayMateriaPrima.length; index++) {
        const datosRemisionMp : any = {
          Rem_Id : idRemision,
          MatPri_Id : this.ArrayMateriaPrima[index].Id_Mp,
          Tinta_Id : this.ArrayMateriaPrima[index].Id_Tinta,
          Bopp_Id : this.ArrayMateriaPrima[index].Id_Bopp,
          RemiMatPri_Cantidad : this.ArrayMateriaPrima[index].Cantidad_Faltante_Editar,
          UndMed_Id : this.ArrayMateriaPrima[index].Medida,
          RemiMatPri_ValorUnitario : this.ArrayMateriaPrima[index].Precio,
        }
        this.remisionMPService.srvGuardar(datosRemisionMp).subscribe(datos_remisionMpCreada => { }, error => {
          errorConsulta = true;
          this.mostrarError(`Error`, `¡Error al añadir la(s) materia(s) prima(s) a la remisión!`);
          this.load = true;
        });
      }
      setTimeout(() => {
        if (!errorConsulta) {
          this.relacionOrdenRemision(idRemision);
          setTimeout(() => {
            this.estadoOrdenCompra();
            this.moverInventarioMP();
            this.moverInventarioTintas();
            setTimeout(() => { this.limpiarTodosCampos(); }, 1500);
          }, 2000);
        }
      }, 3500);
    }
  }

  // Funcion que va a crear la relacion entre la orden de compra y las posibles facturas que puede tener
  relacionOrdenRemision(idRemision : any){
    let info : any = {
      Oc_Id : this.FormMateriaPrimaFactura.value.OrdenCompra,
      Rem_Id : idRemision,
    }
    this.ordenCompraRemisionService.insert_OrdenCompra(info).subscribe(datos_insertados => { }, error => {
      this.mostrarError(`Error`, `¡No se ha creado la relacion entre la remisión y la orden de compra!`);
      this.load = true;
    });
  }

  // Funcion que va a mosver el inventario de materia prima
  moverInventarioMP(){
    for (let index = 0; index < this.ArrayMateriaPrima.length; index++) {
      this.materiaPrimaService.srvObtenerListaPorId(this.ArrayMateriaPrima[index].Id_Mp).subscribe(datos_materiaPrima => {
        if (datos_materiaPrima.matPri_Id != 84) {
          const datosMPActualizada : any = {
            MatPri_Id : datos_materiaPrima.matPri_Id,
            MatPri_Nombre : datos_materiaPrima.matPri_Nombre,
            MatPri_Descripcion : datos_materiaPrima.matPri_Descripcion,
            MatPri_Stock : (datos_materiaPrima.matPri_Stock + this.ArrayMateriaPrima[index].Cantidad_Faltante_Editar),
            UndMed_Id : datos_materiaPrima.undMed_Id,
            CatMP_Id : datos_materiaPrima.catMP_Id,
            MatPri_Precio : datos_materiaPrima.matPri_Precio,
            TpBod_Id : datos_materiaPrima.tpBod_Id,
          }

          this.materiaPrimaService.srvActualizar(datos_materiaPrima.matPri_Id, datosMPActualizada).subscribe(datos_mp_creada => {
            this.mostrarConfirmacion(`Confirmación`, `¡Registro de factura/Remisión creado con exito!`)
            this.load = true;
           }, error => {
            this.mostrarError(`Error`, `¡No se ha podido actualizar la existencia de la materia prima ${this.ArrayMateriaPrima[index].Id_Mp}!`);
            this.load = true;
          });
        }
      }, error => {
        this.mostrarError(`Error`, `¡No se ha encontrado la materia prima ${this.ArrayMateriaPrima[index].Id_Mp}!`);
        this.load = true;
      });
    }
  }

  //Función que restará a las tintas de categoria diferente a TINTAS TIPO COLORES.
  moverInventarioTintas(){
    for (let index = 0; index < this.ArrayMateriaPrima.length; index++) {
      this.tintasService.srvObtenerListaPorId(this.ArrayMateriaPrima[index].Id_Tinta).subscribe(datos_tinta => {
        const datosTintaActualizada : any = {
          Tinta_Id : datos_tinta.tinta_Id,
          Tinta_Nombre : datos_tinta.tinta_Nombre,
          Tinta_Descripcion : datos_tinta.tinta_Descripcion,
          Tinta_Stock : (datos_tinta.tinta_Stock + this.ArrayMateriaPrima[index].Cantidad_Faltante_Editar),
          Tinta_CodigoHexadecimal : datos_tinta.tinta_CodigoHexadecimal,
          UndMed_Id : datos_tinta.undMed_Id,
          CatMP_Id : datos_tinta.catMP_Id,
          Tinta_Precio : datos_tinta.tinta_Precio,
          TpBod_Id : datos_tinta.tpBod_Id,
          tinta_InvInicial : datos_tinta.tinta_InvInicial,
        }

        this.tintasService.srvActualizar(datos_tinta.tinta_Id, datosTintaActualizada).subscribe(datos_mp_creada => {
          this.mostrarConfirmacion(`Confirmación`, `Registro de factura/remisión creado con exito!`);
          this.load = true;
        }, error => {
          this.mostrarError(`Error`,`¡No se ha podido actualizar la existencia de la materia prima ${this.ArrayMateriaPrima[index].Id_Tinta}!`);
          this.load = true;
        });
      }, error => {
        this.mostrarError(`Error`,`¡No se ha podido encontrar la materia prima ${this.ArrayMateriaPrima[index].Id_Mp}!`);
        this.load = true;
      });
    }
  }

  //Consultar Remisiones por Codigo
  consultarIdRemisiones(){
    let idRemision : number = this.FormRemisiones.value.idRemision;
    this.remision = [];
    this.remConFac = [];
    this.load = false;

    this.remisionMPService.GetRemisionSinFactura(idRemision).subscribe(datos_remision => {
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
    }, error => { this.mostrarError(`Error`, `¡No se pudo obtener información de la remisión!`); });
  }

  //
  cargarPDF(formulario : any){
    let id : any = formulario.remisionCodigo;
    this.remisionMPService.srvObtenerpdfMovimientos(id).subscribe(datos_remision => {
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
    }, error => { this.mostrarError(`Error`, `¡No se pudo obtener información de la remisión!`);});
  }

  //
  llenarDocumento(formulario : any){
    let id : any = formulario.remisionCodigo;
    this.mpAgregada = [];
    this.remisionMPService.srvObtenerpdfMovimientos(id).subscribe(datos_remision => {
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
      setTimeout(() => { this.cargarPDF(formulario); }, 2000);
    }, error => { this.mostrarError(`Error`, `¡No se pudo obtener información de la remisión!`) });
  }

  // funcion que se encagará de llenar la tabla de los productos en el pdf
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
        fillColor: function (rowIndex, node, columnIndex) {
          return (rowIndex == 0) ? '#CCCCCC' : null;
        }
      }
    };
  }

    /** Mostrar mensaje de confirmación  */
  mostrarConfirmacion(mensaje : any, titulo?: any) {
   this.messageService.add({severity: 'success', summary: mensaje,  detail: titulo, life : 2000});
  }

  /** Mostrar mensaje de error  */
  mostrarError(mensaje : any, titulo?: any) {
   this.messageService.add({severity:'error', summary: mensaje, detail: titulo, life : 2000});
   this.load = true;
  }

  /** Mostrar mensaje de advertencia */
  mostrarAdvertencia(mensaje : any, titulo?: any) {
   this.messageService.add({severity:'warn', summary: mensaje, detail: titulo, life : 2000 });
   this.load = true;
  }
}
