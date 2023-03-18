import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import pdfMake from 'pdfmake/build/pdfmake';
import { FacturaMpService } from 'src/app/Servicios/DetallesFacturaMateriaPrima/facturaMp.service';
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
import Swal from 'sweetalert2';

@Component({
  selector: 'app_pedidomateriaprima_component',
  templateUrl: './pedidomateriaprima.component.html',
  styleUrls: ['./Pedidomateriaprima.component.css']
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

  public load: boolean;
  public arrayOrdenCompra : any [] = [];
  public arrayMatPrimaFactura : any [] = [];
  public arrayInfoMatPrima : any [] = [];

  modalMode : boolean = false;

  constructor(private materiaPrimaService : MateriaPrimaService,
                private rolService : RolesService,
                  private frmBuilderMateriaPrima : FormBuilder,
                    @Inject(SESSION_STORAGE) private storage: WebStorageService,
                      private proveedorservices : ProveedorService,
                        private facturaMpComService : FactuaMpCompradaService,
                          private facturaMpService : FacturaMpService,
                            private remisionService : RemisionService,
                              private remisionMPService : RemisionesMPService,
                                private remisionFacturaService : RemisionFacturaService,
                                  private tintasService : TintasService,
                                    private servicioOCMatPrima : OrdenCompra_MateriaPrimaService,
                                      private OrdenesFacturasService : OrdenFactura_RelacionService,
                                        private ordenCompraRemisionService : OrdenCompra_RemisionService,) {

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

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.storage.get('Id');
    this.storage_Nombre = this.storage.get('Nombre');
    this.ValidarRol = this.storage.get('Rol');
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
    }, error => { this.mensajeError(`No se encontró información del proveedor`, error.message); });
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
    let materiaPrimaIngresada : number [] = [];
    let Orden_Compra : any = this.FormMateriaPrimaFactura.value.OrdenCompra;

    if (Orden_Compra != null) {
      this.servicioOCMatPrima.getFacturasComprasAsociadasAOC(Orden_Compra).subscribe(dataFact => {
        for (let index = 0; index < dataFact.length; index++) {
          let id : number = 0;
          if (dataFact[index].matPri_Id != 84) id = dataFact[index].matPri_Id;
          else if (dataFact[index].tinta_Id != 2001) id = dataFact[index].tinta_Id;
          else if (dataFact[index].bopp_Id != 1) id = dataFact[index].bopp_Id;
          materiaPrimaIngresada.push(id);
        }
        this.servicioOCMatPrima.getRemisionesComprasAsociadasAOC(Orden_Compra).subscribe(dataRem => {
          for (let k = 0; k < dataRem.length; k++) {
            let id : number = 0;
            if (dataRem[k].matPri_Id != 84) id = dataRem[k].matPri_Id;
            else if (dataRem[k].tinta_Id != 2001) id = dataRem[k].tinta_Id;
            else if (dataRem[k].bopp_Id != 1) id = dataRem[k].bopp_Id;
            materiaPrimaIngresada.push(id);
          }

          this.servicioOCMatPrima.getListaOrdenesComprasxId(Orden_Compra).subscribe(datos_orden => {
            setTimeout(() => {
              for (let i = 0; i < datos_orden.length; i++) {
                let info : any = {
                  Id : 0,
                  Id_Mp: datos_orden[i].matPri_Id,
                  Id_Tinta: datos_orden[i].tinta_Id,
                  Id_Bopp: datos_orden[i].bopP_Id,
                  Nombre : '',
                  Cantidad : (datos_orden[i].doc_CantidadPedida),
                  Cantidad_Ingresada : 0,
                  Cantidad_Faltante : 0,
                  Cantidad_Oculta : datos_orden[i].doc_CantidadPedida,
                  Medida : datos_orden[i].undMed_Id,
                  Precio : datos_orden[i].doc_PrecioUnitario,
                  Exits : false,
                }
                if (info.Id_Mp != 84 && info.Id_Tinta == 2001 && info.Id_Bopp == 1) {
                  info.Id = info.Id_Mp;
                  info.Nombre = datos_orden[i].matPri_Nombre;
                } else if (info.Id_Mp == 84 && info.Id_Tinta != 2001 && info.Id_Bopp == 1) {
                  info.Id = info.Id_Tinta;
                  info.Nombre = datos_orden[i].tinta_Nombre;
                } else if (info.Id_Mp == 84 && info.Id_Tinta == 2001 && info.Id_Bopp != 1) {
                  info.Id = info.Id_Bopp;
                  info.Nombre = datos_orden[i].boppGen_Nombre;
                }
                if (materiaPrimaIngresada.includes(info.Id)) {
                  for (let j = 0; j < dataFact.length; j++) {
                    if (info.Id == dataFact[j].matPri_Id || info.Id == dataFact[j].tinta_Id || info.Id == dataFact[j].bopp_Id) info.Cantidad_Ingresada = dataFact[j].suma;
                    info.Cantidad_Faltante = info.Cantidad - info.Cantidad_Ingresada;
                    info.Cantidad_Oculta = info.Cantidad_Faltante;
                    if (info.Cantidad_Ingresada == info.Cantidad) info.Exits = true;
                  }

                  for (let j = 0; j < dataRem.length; j++) {
                    if (info.Id == dataRem[j].matPri_Id || info.Id == dataRem[j].tinta_Id || info.Id == dataRem[j].bopp_Id) info.Cantidad_Ingresada = dataRem[j].suma;
                    info.Cantidad_Faltante = info.Cantidad - info.Cantidad_Ingresada;
                    info.Cantidad_Oculta = info.Cantidad_Faltante;
                    if (info.Cantidad_Ingresada == info.Cantidad) info.Exits = true;
                  }
                }
                if (info.Cantidad_Faltante == 0) info.Cantidad_Faltante = info.Cantidad;
                this.FormMateriaPrimaFactura.setValue({
                  ConsecutivoFactura : this.ultimoIdFactura,
                  OrdenCompra : this.FormMateriaPrimaFactura.value.OrdenCompra,
                  MpFactura: this.FormMateriaPrimaFactura.value.MpFactura,
                  MpRemision : this.FormMateriaPrimaFactura.value.MpRemision,
                  proveedor: datos_orden[i].prov_Id,
                  proveedorNombre: datos_orden[i].prov_Id,
                  MpObservacion : this.FormMateriaPrimaFactura.value.MpObservacion,
                });
                this.arrayOrdenCompra.push(info);
                this.arrayOrdenCompra.sort((a,b) => a.Nombre.localeCompare(b.Nombre));
              }
            }, 500);
          }, error => { this.mensajeError(`No se encontró la orden de compra`, error.message); });
        });
      }, error => { this.mensajeError(`No se encontró la orden de compra`, error.message); });
      setTimeout(() => {
        this.load = true;
        this.cambiarNombreProveedor();
      }, 1000);
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
      this.mensajeAdvertencia(`¡La cantidad ${item.Cantidad} no está disponible para la materia prima ${item.Nombre}!`);
    }
  }

  //Funcion que validará el campo sobre el que se está colocando del consecutivo, factura o remisimos
  validarCampos(){
    if (this.FormMateriaPrimaFactura.value.MpRemision == '' && this.FormMateriaPrimaFactura.value.MpFactura == '') this.mensajeAdvertencia("Los campos 'N° Factura' y 'N° Remisión' no pueden tener información al mismo tiempo, por favor llenar solo uno de estos.");
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
      this.mensajeError(`¡Error al crear la  facura!`, error.message);
      this.load = true;
    });
  }

  // Funicion que va a colocar el id de la ultimo factura
  obtenerUltimoIdFacturaCompra(){
    this.facturaMpComService.UltimoIdFactura().subscribe(datos_facturas => { this.creacionFacturaMateriaPrima(datos_facturas); }, error => {
      this.mensajeError(`¡Error al obtener la ultima factura creada!`, error.message);
      this.load = true;
    });
  }

  //Funcion que creará el registro de la materia que viene en un pedido
  creacionFacturaMateriaPrima(idFactura : any){
    let errorConsulta : boolean;
    if (this.ArrayMateriaPrima.length == 0) this.mensajeAdvertencia("Debe cargar minimo una materia prima en la tabla");
    else {
      for (let index = 0; index < this.ArrayMateriaPrima.length; index++) {
        const datosFacturaMp : any = {
          Facco_Id : idFactura,
          MatPri_Id : this.ArrayMateriaPrima[index].Id_Mp,
          Tinta_Id : this.ArrayMateriaPrima[index].Id_Tinta,
          Bopp_Id : this.ArrayMateriaPrima[index].Id_Bopp,
          FaccoMatPri_Cantidad : this.ArrayMateriaPrima[index].Cantidad_Faltante,
          UndMed_Id : this.ArrayMateriaPrima[index].Medida,
          FaccoMatPri_ValorUnitario : this.ArrayMateriaPrima[index].Precio,
        }
        this.facturaMpService.srvGuardar(datosFacturaMp).subscribe(datos_facturaMpCreada => {  }, error => {
          errorConsulta = true;
          this.mensajeError(`¡Error al crear la factura con las materia primas seleccionadas!`, error.message);
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
      this.mensajeError(`¡No se ha creado la relacion entre la factura y la orden de compra!`, error.message);
      this.load = true;
    });
  }

  // Funcion que le a cambiar el estado a la orden de compra
  estadoOrdenCompra(){
    let Orden_Compra : any = this.FormMateriaPrimaFactura.value.OrdenCompra;
    let cantidadIngresada : number = 0;
    let estado : number;

    if (Orden_Compra != null) {
      this.servicioOCMatPrima.getFacturasComprasAsociadasAOC(Orden_Compra).subscribe(dataFact => {
        for (let index = 0; index < dataFact.length; index++) {
          cantidadIngresada += dataFact[index].suma;
        }

        this.servicioOCMatPrima.getId_OrdenCompra(Orden_Compra).subscribe(datos_orden => {
          if (datos_orden.oc_PesoTotal <= cantidadIngresada) estado = 5;
          else if (datos_orden.oc_PesoTotal > cantidadIngresada && cantidadIngresada != 0) estado = 12;
          else if (datos_orden.oc_PesoTotal > cantidadIngresada && cantidadIngresada == 0) estado = 11;
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
            this.mensajeError(`¡Error al cambiar el estado de la orden de compra!`, error.message);
            this.load = true;
          });
        });
      });
    }
  }

  // Funcion que se encargará de la relacion entre la(s) remision(es) o factura(s)
  cargarRemisionEnFactura(idFactura : number){
    for (const rem of this.ArrayRemisiones) {
      const datosFacRem : any = {
        Rem_Id : rem.remisionId,
        Facco_Id : idFactura,
      }
      this.remisionFacturaService.srvGuardar(datosFacRem).subscribe(datosFacRemision => { }, error => {
        this.mensajeError(`¡Error al añadir la(s) remision(es) a la factura!`, error.message);
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
      this.mensajeError(`¡Error al crear la remisión!`, error.message);
      this.load = true;
    });
  }

  // Funcion que se encargará de obtener el ultimo Id de las facturas
  obtenerUltimoIdRemision(){
    this.remisionService.UltimoIdRemision().subscribe(datos_remision => { this.creacionRemisionMateriaPrima(datos_remision); }, error => {
      this.mensajeError(`¡Error al obtener el Id de la ultima remisión!`, error.message);
      this.load = true;
    });
  }

  //Funcion que creará el registro de la materia que viene en un pedido
  creacionRemisionMateriaPrima(idRemision : any){
    let errorConsulta : boolean;
    if (this.ArrayMateriaPrima.length == 0) this.mensajeAdvertencia("Debe cargar minimo una materia prima en la tabla")
    else {
      for (let index = 0; index < this.ArrayMateriaPrima.length; index++) {
        const datosRemisionMp : any = {
          Rem_Id : idRemision,
          MatPri_Id : this.ArrayMateriaPrima[index].Id_Mp,
          Tinta_Id : this.ArrayMateriaPrima[index].Id_Tinta,
          Bopp_Id : this.ArrayMateriaPrima[index].Id_Bopp,
          RemiMatPri_Cantidad : this.ArrayMateriaPrima[index].Cantidad_Faltante,
          UndMed_Id : this.ArrayMateriaPrima[index].Medida,
          RemiMatPri_ValorUnitario : this.ArrayMateriaPrima[index].Precio,
        }
        this.remisionMPService.srvGuardar(datosRemisionMp).subscribe(datos_remisionMpCreada => { }, error => {
          errorConsulta = true;
          this.mensajeError(`¡Error al añadir la(s) materia(s) prima(s) a la remisión!`, error.message);
          this.load = true;
        });
      }
      setTimeout(() => {
        if (!errorConsulta) {
          this.relacionOrdenRemision(idRemision);
          setTimeout(() => {
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
      this.mensajeError(`¡No se ha creado la relacion entre la remisión y la orden de compra!`, error.message);
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
            MatPri_Stock : (datos_materiaPrima.matPri_Stock + this.ArrayMateriaPrima[index].Cantidad_Faltante),
            UndMed_Id : datos_materiaPrima.undMed_Id,
            CatMP_Id : datos_materiaPrima.catMP_Id,
            MatPri_Precio : datos_materiaPrima.matPri_Precio,
            TpBod_Id : datos_materiaPrima.tpBod_Id,
          }

          this.materiaPrimaService.srvActualizar(datos_materiaPrima.matPri_Id, datosMPActualizada).subscribe(datos_mp_creada => {
            Swal.fire({ icon: 'success', title: 'Gurdado Exitoso', html: `<b>¡Registro de factura/Remisión creado con exito!</b><hr>` });
            this.load = true;
           }, error => {
            this.mensajeError(`¡No se ha podido actualizar la existencia de la materia prima ${this.ArrayMateriaPrima[index].Id_Mp}!`, error.message);
            this.load = true;
          });
        }
      }, error => {
        this.mensajeError(`¡La materia prima ${this.ArrayMateriaPrima[index].Id_Mp} no se ha encontrado!`, error.message);
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
          Tinta_Stock : (datos_tinta.tinta_Stock + this.ArrayMateriaPrima[index].Cantidad_Faltante),
          Tinta_CodigoHexadecimal : datos_tinta.tinta_CodigoHexadecimal,
          UndMed_Id : datos_tinta.undMed_Id,
          CatMP_Id : datos_tinta.catMP_Id,
          Tinta_Precio : datos_tinta.tinta_Precio,
          TpBod_Id : datos_tinta.tpBod_Id,
          tinta_InvInicial : datos_tinta.tinta_InvInicial,
        }

        this.tintasService.srvActualizar(datos_tinta.tinta_Id, datosTintaActualizada).subscribe(datos_mp_creada => {
          Swal.fire({ icon: 'success', title: 'Gurdado Exitoso', html: `<b>¡Registro de factura/Remisión creado con exito!</b><hr>` });
          this.load = true;
        }, error => {
          this.mensajeError(`¡No se ha podido actualizar la existencia de la materia prima ${this.ArrayMateriaPrima[index].Id_Tinta}!`, error.message);
          this.load = true;
        });
      }, error => {
        this.mensajeError(`¡No se ha podido encontrar la materia prima ${this.ArrayMateriaPrima[index].Id_Mp}!`, error.message);
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
    }, error => { this.mensajeError(`¡No se pudo obtener información de la remisión!`, error.message); });
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
    }, error => { this.mensajeError(`¡No se pudo obtener información de la remisión!`, error.message);});
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
    }, error => { this.mensajeError(`¡No se pudo obtener información de la remisión!`, error.message) });
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

  // Mensaje de Advertencia
  mensajeAdvertencia(mensaje : string, mensaje2 : string = ''){
    Swal.fire({ icon: 'warning', title: 'Advertencia', html:`<b>${mensaje}</b><hr> ` + `<spam>${mensaje2}</spam>`, showCloseButton: true, });
  }

  // Mensaje de Error
  mensajeError(text : string, error : any = ''){
    Swal.fire({ icon: 'error', title: 'Oops...', html: `<b>${text}</b><hr> ` +  `<spam style="color : #f00;">${error}</spam> `, showCloseButton: true, });
  }
}
