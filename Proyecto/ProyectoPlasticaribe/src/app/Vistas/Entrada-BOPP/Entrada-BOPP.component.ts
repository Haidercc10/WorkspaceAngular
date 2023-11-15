import { Component, Injectable, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ShepherdService } from 'angular-shepherd';
import moment from 'moment';
import { MessageService } from 'primeng/api';
import { EntradaBOPPService } from 'src/app/Servicios/BOPP/entrada-BOPP.service';
import { BoppGenericoService } from 'src/app/Servicios/BoppGenerico/BoppGenerico.service';
import { CategoriaMateriaPrimaService } from 'src/app/Servicios/CategoriasMateriaPrima/categoriaMateriaPrima.service';
import { FacturaMpService } from 'src/app/Servicios/DetallesFacturaMateriaPrima/facturaMp.service';
import { RemisionesMPService } from 'src/app/Servicios/DetallesRemisiones/remisionesMP.service';
import { FactuaMpCompradaService } from 'src/app/Servicios/FacturaMateriaPrima/facturaMpComprada.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { OrdenCompra_MateriaPrimaService } from 'src/app/Servicios/OrdenCompra/OrdenCompra_MateriaPrima.service';
import { OrdenFactura_RelacionService } from 'src/app/Servicios/OrdenCompra_Facturas/OrdenFactura_Relacion.service';
import { OrdenCompra_RemisionService } from 'src/app/Servicios/OrdenCompra_Remision/OrdenCompra_Remision.service';
import { ProveedorService } from 'src/app/Servicios/Proveedor/proveedor.service';
import { RemisionService } from 'src/app/Servicios/Remisiones/Remision.service';
import { AppComponent } from 'src/app/app.component';
import { defaultStepOptions, stepEntradaBopp as defaultSteps } from 'src/app/data';
import { CrearBoppComponent } from '../crear-bopp/crear-bopp.component';
import { modelBOPP } from 'src/app/Modelo/modelBOPP';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-Entrada-BOPP',
  templateUrl: './Entrada-BOPP.component.html',
  styleUrls: ['./Entrada-BOPP.component.css']
})
export class EntradaBOPPComponent implements OnInit {

  @ViewChild(CrearBoppComponent) CrearBopp : CrearBoppComponent;
  load: boolean = true;
  public FormEntradaBOPP !: FormGroup;
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  ArrayBOPP = []; //Varibale que almacenará los BOPP que estarán entrando
  categorias : any = []; //Variable que almacenará las categorias que se podrán seleccionar para la materia prima a ingresar
  nombresBopp : any =[]; /** Variable que cargará los nombres de BOPP que más suelen comprarse en la empresa */
  micrasBopp : any =[]; /** Variable que cargará las micras de BOPP que más suelen utilizarse en la empresa */
  anchosBopp : any =[]; /** Variable que cargará los anchos de BOPP que más suelen utilizarse en la empresa */
  precioBopp : any =[]; /** Variable que cargará los precios por los que más se compra BOPP en la empresa */
  serialesBopp : any =[]; /** Variable que cargará los precios por los que más se compra BOPP en la empresa */
  proveedor = []; //Variable que almacenará los diferentes proveedores de materia prima
  public FormOpcional !: FormGroup;
  arrayBopps : any = [];
  campoRemi_Faccompra: any = null;
  valorTotal : number = 0;
  arrayBoppsFacturados : any = [];
  arrayBoppsRemisionados : any = [];
  tipoDoc : any = null;
  boppSeleccionado : any = [];
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  boppsGenericos : any = [];  /** Variable que contendrá los bopp genericos. */
  modalCrearBopp : boolean = false; /** Variable para abrir el modal que creará nuevos bopp's genericos para sociarlos al que se desea ingresar */

  constructor(private AppComponent : AppComponent,
                private frmBuilder : FormBuilder,
                  private entradaBOPPService : EntradaBOPPService,
                    private categoriaService : CategoriaMateriaPrimaService,
                      private servicioProveedores : ProveedorService,
                        private servicioOC_MatPrimas : OrdenCompra_MateriaPrimaService,
                          private servicioFacturasCompras : FactuaMpCompradaService,
                            private servicioOC_Faccompra : OrdenFactura_RelacionService,
                              private servicioRemisiones : RemisionService,
                                private servicioOC_Remisiones : OrdenCompra_RemisionService,
                                  private servicioDetalleFacco_MatPrima : FacturaMpService,
                                    private servicioDetRemisiones : RemisionesMPService,
                                      private messageService: MessageService,
                                        private shepherdService: ShepherdService,
                                          private mensajeService : MensajesAplicacionService,
                                            private servicioBoppGenerico : BoppGenericoService,) {

    this.FormEntradaBOPP = this.frmBuilder.group({
      Id : [''],
      Nombre : [''],
      serial : [null],
      cantidad : [null],
      cantidadKG : [null],
      precio : [null],
      ancho : [null],
      undMed : [''],
      Fecha : [this.today],
      Observacion : [''],
      Categoria : [6],
      IdBoppGenerico : [null],
      boppGenerico : [null],
    });

    this.FormOpcional = this.frmBuilder.group({
      OrdenCompra : [null],
      Factura : [null],
      Remision : [null],
      PrvId : [null],
      PrvNombre : [null],
      Observacion : [null],
    });

    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
  }

  ngOnInit() {
    this.lecturaStorage();
    this.obtenerCategorias();
    this.getNombresBOPP();
    this.getPrecioBOPP();
    this.getSerialesBOPP();
    this.obtenerProveeedor();
    this.cargarBoppsGenericos();
    setInterval(() => this.modoSeleccionado = this.AppComponent.temaSeleccionado, 1000);
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  // Funcion que servirá para cargar las categorias
  obtenerCategorias = () => this.categoriaService.srvObtenerLista().subscribe(datos => this.categorias = datos.filter((item) => [6,14,15,17].includes(item.catMP_Id)));

  // Funcion limpiará todos los campos de vista
  limpiarTodosLosCampos(){
    this.FormEntradaBOPP.reset();
    this.FormEntradaBOPP.patchValue({ Fecha : this.today, Categoria : 6 });
    this.ArrayBOPP = [];
    this.arrayBopps = [];
    this.campoRemi_Faccompra = null;
    this.valorTotal = 0;
    this.FormOpcional.reset();
  }

  // funcion que va a limpiar los campos
  limpiarCampos(){
    this.FormEntradaBOPP.reset();
    this.FormEntradaBOPP.patchValue({ Fecha : this.today, Categoria : 6 });
  }

  //Funcion que va a cargar en la tabla el rollo que se va a crear
  cargarBOPPTabla(){
    if (this.FormEntradaBOPP.valid) {
      this.load = false;
      let datosBopp : any = {
        Id : this.FormEntradaBOPP.value.Id,
        Serial : this.FormEntradaBOPP.value.serial,
        Nombre : this.FormEntradaBOPP.value.Nombre,
        Descripcion : this.FormEntradaBOPP.value.Observacion,
        Ancho : this.FormEntradaBOPP.value.ancho,
        Cant : this.FormEntradaBOPP.value.cantidad,
        UndCant : 'µm',
        CantKg : this.FormEntradaBOPP.value.cantidadKG,
        UndCantKg : 'Kg',
        Precio : this.FormEntradaBOPP.value.precio,
        Subtotal : 0,
        Cat_Id : this.FormEntradaBOPP.value.Categoria,
        Cat : '',
        IdBoppGenerico : this.FormEntradaBOPP.value.IdBoppGenerico,
        NombreBoppGenerico : this.FormEntradaBOPP.value.boppGenerico
      }
      this.colocarBoppTabla(datosBopp);
    } else this.mensajeService.mensajeAdvertencia(`Advertencia`, `Debe llenar los campos vacios!`);
  }

  colocarBoppTabla(datosBopp : any){
    this.entradaBOPPService.srvObtenerListaPorSerial(datosBopp.Serial).subscribe(datos_bopp => {
      if (datos_bopp.length != 0) {
        this.mensajeService.mensajeAdvertencia(`Advertencia`, `¡Ya existe un bopp con el serial ${datosBopp.Serial}, por favor colocar un serial distinto!`);
        this.load = true;
      } else {
        this.categoriaService.srvObtenerListaPorId(datosBopp.Cat_Id).subscribe(datos_categorias => {
          datosBopp.Cat = datos_categorias.catMP_Nombre;          
          let index = this.boppsGenericos.findIndex((item) => item.boppGen_Id == datosBopp.IdBoppGenerico);
          if(index == -1) {
            this.load = true;
            this.mensajeService.mensajeAdvertencia(`Advertencia`, `Debe elegir un bopp genérico válido`);
          } else {
            datosBopp.Subtotal = parseInt(datosBopp.Precio) * parseInt(datosBopp.CantKg);
            this.ArrayBOPP.push(datosBopp);
            this.calcularValores();
            this.limpiarCampos();
            this.getPrecioBOPP();
            this.load = true;
          }
        });
      }
    });
  }

  // funcion que crea los rollos en la tabla
  crearEntrada(){
    if (this.ArrayBOPP.length == 0) this.mensajeService.mensajeAdvertencia(`Advertencia`, "Debe cargar minimo un rollo en la tabla!");
    else {
      this.load = false
      for (let i = 0; i < this.ArrayBOPP.length; i++) {
        let datosBOPP = this.validarDatosBopp(this.ArrayBOPP[i]);
        this.entradaBOPPService.srvGuardar(datosBOPP).subscribe(() => {
          this.mensajeService.mensajeConfirmacion(`Confirmación`,`Entrada de rollos realizada con éxito!`);
          this.getPrecioBOPP();
          this.load = true;
        }, () => this.mensajeService.mensajeError(`Error`, `Error al ingresar el rollo!`));
      }
    }
  }

  validarDatosBopp(data : any){
    let bodega : number = this.validarBodega(data.Cat_Id);
    let datosBOPP : modelBOPP = {
      BOPP_Nombre : `${data.Nombre} - ${data.Serial} - ${data.CantKg} - ${data.Ancho}`,
      BOPP_Descripcion : data.Descripcion,
      BOPP_Serial : data.Serial,
      BOPP_CantidadMicras : data.Cant,
      UndMed_Id : 'µm',
      CatMP_Id : data.Cat_Id,
      BOPP_Precio : data.Precio,
      TpBod_Id : bodega,
      BOPP_FechaIngreso : this.today,
      BOPP_Ancho : data.Ancho,
      BOPP_Stock : data.CantKg,
      UndMed_Kg : 'Kg',
      BOPP_CantidadInicialKg : data.CantKg,
      Usua_Id : this.storage_Id,
      BOPP_Hora : moment().format('H:mm:ss'),
      BoppGen_Id : data.IdBoppGenerico,
      BOPP_CodigoDoc : this.campoRemi_Faccompra,
      BOPP_TipoDoc : this.tipoDoc,
    }
    return datosBOPP;
  }

  validarBodega(categoria : number){
    let bodega : number;
    if (categoria == 6) bodega = 8;
    else if (categoria == 14) bodega = 11;
    else if (categoria == 15) bodega = 12;
    else if (categoria == 17) bodega = 8;
    return bodega;
  }

  /** Función para mostrar una elección de eliminación de OT/Rollo de la tabla. */
  mostrarEleccion(item : any){
    this.boppSeleccionado = item;
    this.messageService.add({severity:'warn', key:'bopp', summary:'Elección', detail: `Está seguro que desea eliminar el rollo ${item.Serial} de la tabla?`, sticky: true});
  }

  // Funcion que va a quitar un rollo de la tabla
  quitarRollo(data : any){
    data = this.boppSeleccionado;
    this.onReject();
    this.ArrayBOPP.splice(this.ArrayBOPP.findIndex((item) => item.Serial == data.Serial), 1);
    this.calcularValores();
  }

  /** Obtener nombres, micras, precios, anchos y seriales más utilizados y cargarlos en los combobox en la vista */
  getNombresBOPP() {
    this.nombresBopp = [];
    this.entradaBOPPService.getBopp().subscribe(data => { this.nombresBopp = data });
  }

  seleccionarBopp(){
    let nombreElegido : number = this.FormEntradaBOPP.value.Nombre;
    let nuevo : any [] = this.nombresBopp.filter((item) => item.nombre == nombreElegido);
    this.FormEntradaBOPP.patchValue({ Observacion: nuevo[0].nombre, cantidad: nuevo[0].micras, });
  }

  getPrecioBOPP () {
    this.entradaBOPPService.GetUltimoPrecioBopp().subscribe(data => {
      this.precioBopp = data
      this.FormEntradaBOPP.patchValue({ precio : this.precioBopp });
    });
  } 

  getSerialesBOPP = () => this.entradaBOPPService.getSeriales().subscribe(data => this.serialesBopp = data); 
    
  // Funcion que le va a cambiar el nombre al proveedor
  cambiarNombreProveedor(){
    let id : number = this.FormOpcional.value.PrvNombre;
    let nuevo : any [] = this.proveedor.filter((item) => item.prov_Id == id);
    this.FormOpcional.patchValue({
      PrvId: nuevo[0].prov_Id,
      PrvNombre: nuevo[0].prov_Nombre,
    });
  }

  // Funcion que se encargará de obtener los proveedores
  obtenerProveeedor = () => this.servicioProveedores.srvObtenerLista().subscribe(datos_proveedor => this.proveedor = datos_proveedor);

  /** Función para consultar solo ordenes de compra de BOPP */
  consultarOrdenCompra_Bopp() {
    this.FormEntradaBOPP.reset();
    this.arrayBopps = [];
    let OC : number = this.FormOpcional.value.OrdenCompra;
    /** Facturado */
    this.servicioOC_MatPrimas.getFacturasAsociadasAOC(OC).subscribe(dataFacturada => {
      if(dataFacturada.length > 0) this.arrayBoppsFacturados = dataFacturada.map(item => item.bopp_Id);
      /** Remisionado */
      this.servicioOC_MatPrimas.getRemisionesComprasAsociadasAOC(OC).subscribe(dataRemisionada => {
        if(dataRemisionada.length > 0) this.arrayBoppsRemisionados = dataRemisionada.map(item => item.bopp_Id);
        /** Cargar lista de OC */
        this.servicioOC_MatPrimas.getListaOrdenesComprasxId(OC).subscribe(data => {
          if (data.length == 0) this.mensajeService.mensajeAdvertencia(`Advertencia` ,`No existe la OC ${OC}, por favor, verifique!`);
          else {
            for (let index = 0; index < data.length; index++) {
              this.cargarBopps(data[index], dataFacturada, dataRemisionada);
            }
          }
        });
      });
    });
  }

  /** Función para cargar BOPPs a la tabla, segun la OC consultada. */
  cargarBopps(datos : any, dataFact? : any, dataRem?: any) {
    let infoOc : any = {
      idMatPrima : datos.matPri_Id,
      idTinta : datos.tinta_Id,
      idBopp : datos.bopP_Id,
      id : 0,
      nombre: '',
      micras: datos.boppGen_Micra,
      undMicras: 'µm',
      cantidad: datos.doc_CantidadPedida,
      cantFacturada : 0,
      cantFaltante : 0,
      undKilos: 'Kg',
      ancho: datos.boppGen_Ancho,
      precio: datos.doc_PrecioUnitario,
      proveedor : datos.prov_Id,
      completado : false,
    }

    if (infoOc.matPri_Id != 84 && infoOc.idTinta == 2001 && infoOc.idBopp == 1) {
      infoOc.id = infoOc.idMatPrima;
      infoOc.nombre = datos.matPri_Nombre;
    } else if (infoOc.idMatPrima == 84 && infoOc.idTinta != 2001 && infoOc.idBopp == 1) {
      infoOc.id = infoOc.idTinta;
      infoOc.nombre = datos.tinta_Nombre;
    } else if (infoOc.idMatPrima == 84 && infoOc.idTinta == 2001 && infoOc.idBopp != 1) {
      infoOc.id = infoOc.idBopp;
      infoOc.nombre = datos.boppGen_Nombre;
    }

    if(this.arrayBoppsFacturados.includes(infoOc.id)) {
      for (let inx = 0; inx < dataFact.length; inx++) {
        if(infoOc.id == dataFact[inx].bopp_Id) {
          infoOc.cantFacturada = dataFact[inx].suma;
          infoOc.Cantidad_Faltante = (infoOc.cantidad - infoOc.cantFacturada);
          if(infoOc.cantFacturada == infoOc.cantidad) infoOc.completado = true;
        }
      }
    }

    if(this.arrayBoppsRemisionados.includes(infoOc.id)) {
      for (let ix = 0; ix < dataRem.length; ix++) {
        if(infoOc.id == dataRem[ix].bopp_Id) {
          infoOc.cantFacturada = dataRem[ix].suma;
          infoOc.Cantidad_Faltante = (infoOc.cantidad - infoOc.cantFacturada);
          if(infoOc.cantFacturada == infoOc.cantidad) infoOc.completado = true;
        }infoOc
      }
    }
    this.FormOpcional.patchValue({ PrvId: datos.prov_Id, PrvNombre: datos.prov_Nombre,});
    this.arrayBopps.push(infoOc);
  }

  /**Función que cargará la información de los rollos de la tabla a los campos */
  editarRolloBopp(item : any) {
    this.FormEntradaBOPP.patchValue({
      Id : item.id,
      Nombre: item.nombre,
      cantidad: item.micras,
      cantidadKG: item.cantidad,
      precio: item.precio,
      ancho: item.ancho,
      Observacion: item.nombre,
      Categoria: 6,
      IdBoppGenerico : item.id,
      boppGenerico : item.nombre,
    });
  }

  /** Factura */
  /** Funcion para registrar el encabezado de la factura */
  registrarFacturaBopp(){
    if (this.ArrayBOPP.length == 0) this.mensajeService.mensajeAdvertencia(`Advertencia`, "Debe cargar minimo un rollo en la tabla");
    else {
      const datosFactura : any = {
        Facco_Codigo : this.FormOpcional.value.Factura,
        Facco_FechaFactura : this.today,
        Facco_FechaVencimiento : this.today,
        Facco_Hora : moment().format('H:mm:ss'),
        Prov_Id : this.FormOpcional.value.PrvId,
        Facco_ValorTotal : this.valorTotal,
        Facco_Observacion : this.FormOpcional.value.Observacion,
        Estado_Id : 13,
        Usua_Id : this.storage_Id,
        TpDoc_Id : 'FCO',
      }
      this.servicioFacturasCompras.srvGuardar(datosFactura).subscribe(() => this.obtenerUltimoIdFacturaCompra(), () => this.mensajeService.mensajeError(`Error`,`Error al crear la factura!`));
    }
  }

  /** Funcion para registrar el máximo ID de la factura */
  obtenerUltimoIdFacturaCompra = () => this.servicioFacturasCompras.UltimoIdFactura().subscribe(datos => this.creacionDetalleFactura(datos), () => this.mensajeService.mensajeError(`Error`, `Error al obtener la ultima factura creada!`));

   /** Funcion para registrar el detalle de la factura */
  creacionDetalleFactura(idUltimafactura : any) {
    let detalleError : boolean;
    for (let index = 0; index < this.ArrayBOPP.length; index++) {
      let info : any = {
        Facco_Id: idUltimafactura,
        MatPri_Id: 84,
        Tinta_Id: 2001,
        Bopp_Id: this.ArrayBOPP[index].Id,
        FaccoMatPri_Cantidad: this.ArrayBOPP[index].CantKg,
        UndMed_Id: this.ArrayBOPP[index].UndCantKg,
        FaccoMatPri_ValorUnitario: this.ArrayBOPP[index].Precio,
      }
      this.servicioDetalleFacco_MatPrima.srvGuardar(info).subscribe(() => detalleError = false, () => {
        this.mensajeService.mensajeError(`Error`, 'No fue posible registrar el detalle de la factura, verifique!');
        detalleError = true;
      });
    }
    setTimeout(() => !detalleError ? this.crearRelacionOrdenCompra_Faccompra(idUltimafactura) : null, 500);
  }

  /** Funcion para registrar la relación entre la factura y la OC */
  crearRelacionOrdenCompra_Faccompra(factura : number){
    let info : any = {
      Oc_Id : this.FormOpcional.value.OrdenCompra,
      Facco_Id : factura,
    }
    this.servicioOC_Faccompra.insert_OrdenCompra(info).subscribe(() => this.crearEntrada(), () => this.mensajeService.mensajeError(`Error`, `No se ha creado la relación entre la factura y la OC!`));
  }

  /** Remisión */
  /** Función que creará el encabezado de las remisiones */
  registrarRemisionBopp(){
    const datosRemision : any = {
      Rem_Codigo : this.FormOpcional.value.Remision,
      Rem_Fecha : this.today,
      Rem_Hora : moment().format('H:mm:ss'),
      Rem_PrecioEstimado :  this.valorTotal,
      Prov_Id : this.FormOpcional.value.PrvId,
      Estado_Id : 12,
      Usua_Id : this.storage_Id,
      TpDoc_Id : 'REM',
      Rem_Observacion : this.FormOpcional.value.Observacion,
    }
    this.servicioRemisiones.srvGuardar(datosRemision).subscribe(() => this.obtenerUltimoIdRemision(), () => this.mensajeService.mensajeError(`Error`, `Error al crear la remisión!`));
  }

  // Funcion que se encargará de obtener el ultimo Id de las remisiones
  obtenerUltimoIdRemision(){
    this.servicioRemisiones.UltimoIdRemision().subscribe(datos_remision => this.crearDetalleRemision(datos_remision), () => {
      this.mensajeService.mensajeError(`Error`, `Error al obtener el Id de la última remisión!`);
      this.load = true;
    });
  }

  //Funcion que creará el detalle de la remisión
  crearDetalleRemision(idRemision : any){
    let detalleError : boolean;
    if (this.ArrayBOPP.length == 0) this.mensajeService.mensajeAdvertencia(`Advertencia`, "Debe cargar minimo un rollo en la tabla");
    else {
      for (let index = 0; index < this.ArrayBOPP.length; index++) {
        const datosRemisionMp : any = {
          Rem_Id : idRemision,
          MatPri_Id : 84,
          Tinta_Id : 2001,
          Bopp_Id : this.ArrayBOPP[index].Id,
          RemiMatPri_Cantidad : this.ArrayBOPP[index].CantKg,
          UndMed_Id : this.ArrayBOPP[index].UndCantKg,
          RemiMatPri_ValorUnitario : this.ArrayBOPP[index].Precio,
        }
        this.servicioDetRemisiones.srvGuardar(datosRemisionMp).subscribe(() => detalleError = false, () => {
          detalleError = true;
          this.mensajeService.mensajeError(`Error`, `Error al crear el detalle de la remisión!`);
          this.load = true;
        });
      }
      setTimeout(() => !detalleError ? this.crearRelacionOrdenCompra_Remision(idRemision) : null, 500);
    }
  }

  /** Crear relación entre remisión y orden de compra */
  crearRelacionOrdenCompra_Remision(remision : number){
    let info : any = {
      Oc_Id : this.FormOpcional.value.OrdenCompra,
      Rem_Id : remision,
    }
    this.servicioOC_Remisiones.insert_OrdenCompra(info).subscribe(() => this.crearEntrada(), () => this.mensajeService.mensajeError(`Error`, `No se ha creado la relacion entre la remisión y la OC!`));
  }

  /** Funcion para validar que tipo de entrada de BOPP */
  validarTipoEntradaBopp() {
    let oc : number = this.FormOpcional.value.OrdenCompra;
    let factura : any = this.FormOpcional.value.Factura;
    let remision : any = this.FormOpcional.value.Remision;

    if((oc == null && factura == null && remision == null)) {
      this.crearEntrada();
      setTimeout(() => this.limpiarTodosLosCampos(), 1000);
    } else if (oc != null && factura != null && remision == null) {
      this.campoRemi_Faccompra = factura;
      this.tipoDoc = 'FCO'
      this.registrarFacturaBopp();
      setTimeout(() => this.limpiarTodosLosCampos(), 3000);
    } else if (oc != null && remision != null && factura == null) {
      this.campoRemi_Faccompra = remision;
      this.tipoDoc = 'REM'
      this.registrarRemisionBopp();
      setTimeout(() => this.limpiarTodosLosCampos(), 3000);
    } else this.mensajeService.mensajeAdvertencia(`Advertencia`, 'Solo debe diligenciar el campo factura o remisión, verifique!');
  }

  /** Cerrar Dialogo de eliminación de OT/rollos.*/
  onReject = () => this.messageService.clear('bopp');

  /** Función que mostrará un tutorial describiendo paso a paso cada funcionalidad de la aplicación */
  verTutorial() {
    this.shepherdService.defaultStepOptions = defaultStepOptions;
    this.shepherdService.modal = true;
    this.shepherdService.confirmCancel = false;
    this.shepherdService.addSteps(defaultSteps);
    this.shepherdService.start();
  }

  /** Función para cargar los nombres de bopps genericos en el campo */
  cargarBoppsGenericos = () => this.servicioBoppGenerico.srvObtenerLista().subscribe(data => this.boppsGenericos = data);

  /** Función para seleccionar el nombre del bopp en el campo, pero su valor será el Id. */
  seleccionarBoppsGenericos(){
    let bopp : any = this.FormEntradaBOPP.value.boppGenerico;
    let nuevo : any = [];
    nuevo = this.boppsGenericos.filter((item) => item.boppGen_Id == bopp);
    this.FormEntradaBOPP.patchValue({ boppGenerico : nuevo[0].boppGen_Nombre, IdBoppGenerico : nuevo[0].boppGen_Id });
  }

  /** Función para llamar el modal que contendrá los campos para crear bopp's */
  llamarModalCrearBopp = () => this.modalCrearBopp = true;

  //Función que calculará los valores subtotales y totales de la entrada de bopp
  calcularValores(){
    this.valorTotal = 0;
    for (const item of this.ArrayBOPP) {
      item.Subtotal = (item.Precio * item.CantKg);
      this.valorTotal += item.Subtotal;
    }
  }
}
