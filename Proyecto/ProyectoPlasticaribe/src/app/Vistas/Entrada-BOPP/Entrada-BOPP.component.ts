import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { CategoriaMateriaPrimaService } from 'src/app/Servicios/CategoriasMateriaPrima/categoriaMateriaPrima.service';
import { EntradaBOPPService } from 'src/app/Servicios/BOPP/entrada-BOPP.service';
import { RolesService } from 'src/app/Servicios/Roles/roles.service';
import { UnidadMedidaService } from 'src/app/Servicios/UnidadMedida/unidad-medida.service';
import { ProveedorService } from 'src/app/Servicios/Proveedor/proveedor.service';
import { OrdenCompra_MateriaPrimaService } from 'src/app/Servicios/OrdenCompra/OrdenCompra_MateriaPrima.service';
import { FactuaMpCompradaService } from 'src/app/Servicios/FacturaMateriaPrima/facturaMpComprada.service';
import { OrdenFactura_RelacionService } from 'src/app/Servicios/OrdenCompra_Facturas/OrdenFactura_Relacion.service';
import { RemisionService } from 'src/app/Servicios/Remisiones/Remision.service';
import { OrdenCompra_RemisionService } from 'src/app/Servicios/OrdenCompra_Remision/OrdenCompra_Remision.service';
import { FacturaMpService } from 'src/app/Servicios/DetallesFacturaMateriaPrima/facturaMp.service';
import { RemisionesMPService } from 'src/app/Servicios/DetallesRemisiones/remisionesMP.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-Entrada-BOPP',
  templateUrl: './Entrada-BOPP.component.html',
  styleUrls: ['./Entrada-BOPP.component.css']
})
export class EntradaBOPPComponent implements OnInit {

  load: boolean = true;
  public FormEntradaBOPP !: FormGroup;
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  unidadMedida = []; //Variable que almacenará las unidades de medida
  ArrayBOPP = []; //Varibale que almacenará los BOPP que estarán entrando
  categorias : any = []; //Variable que almacenará las categorias que se podrán seleccionar para la materia prima a ingresar
  nombresBopp : any =[]; /** Variable que cargará los nombres de BOPP que más suelen comprarse en la empresa */
  micrasBopp : any =[]; /** Variable que cargará las micras de BOPP que más suelen utilizarse en la empresa */
  anchosBopp : any =[]; /** Variable que cargará los anchos de BOPP que más suelen utilizarse en la empresa */
  preciosBopp : any =[]; /** Variable que cargará los precios por los que más se compra BOPP en la empresa */
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

  constructor(@Inject(SESSION_STORAGE) private storage: WebStorageService,
                private frmBuilder : FormBuilder,
                  private unidadMedidaService : UnidadMedidaService,
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
                                        private messageService: MessageService) {

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
      Categoria : [''],
    });

    this.FormOpcional = this.frmBuilder.group({
      OrdenCompra : [null],
      Factura : [null],
      Remision : [null],
      PrvId : [null],
      PrvNombre : [null],
      Observacion : [null],
    });
  }

  ngOnInit() {
    this.lecturaStorage();
    this.obtenerUnidadesMedida();
    this.obtenerCategorias();
    this.getNombresBOPP();
    this.getMicrasBOPP();
    this.getAnchosBOPP();
    this.getPreciosBOPP();
    this.getSerialesBOPP();
    this.obtenerProveeedor();
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.storage.get('Id');
    this.storage_Nombre = this.storage.get('Nombre');
    this.ValidarRol = this.storage.get('Rol');
  }

  //Funcion para  obtener las unidades de medidas
  obtenerUnidadesMedida() {
    this.unidadMedidaService.srvObtenerLista().subscribe(datos_unidadesMedida => {
      for (let i = 0; i < datos_unidadesMedida.length; i++) {
        this.unidadMedida.push(datos_unidadesMedida[i].undMed_Id);
      }
    });
  }

  // Funcion que servirá para cargar las categorias
  obtenerCategorias(){
    this.categorias = [],
    this.categoriaService.srvObtenerLista().subscribe(datos_categorias => {
      for (let i = 0; i < datos_categorias.length; i++) {
        let cat : number [] = [6,14,15];
        if (cat.includes(datos_categorias[i].catMP_Id)) this.categorias.push(datos_categorias[i]);
      }
    });
  }

  // Funcion limpiará todos los campos de vista
  limpiarTodosLosCampos(){
    this.FormEntradaBOPP.reset();
    this.FormEntradaBOPP.patchValue({ Fecha : this.today });
    this.ArrayBOPP = [];
    this.arrayBopps = [];
    this.campoRemi_Faccompra = null;
    this.valorTotal = 0;
    this.FormOpcional.reset();
  }

  // funcion que va a limpiar los campos
  limpiarCampos(){
    this.FormEntradaBOPP.reset();
    this.FormEntradaBOPP.patchValue({ Fecha : this.today });
  }

  //Funcion que va a cargar en la tabla el rollo que se va a crear
  cargarBOPPTabla(){
    if (this.FormEntradaBOPP.valid) {
      this.load = false;
      let serial : number = this.FormEntradaBOPP.value.serial;
      let cantidad : number = this.FormEntradaBOPP.value.cantidad;
      let cantidadKg : number = this.FormEntradaBOPP.value.cantidadKG;
      let nombre : string = this.FormEntradaBOPP.value.Nombre;
      let descripcion : string = this.FormEntradaBOPP.value.Observacion;
      let precio : number = this.FormEntradaBOPP.value.precio;
      let ancho : number = this.FormEntradaBOPP.value.ancho;
      let categoria : any = this.FormEntradaBOPP.value.Categoria;
      let id : number = this.FormEntradaBOPP.value.Id;

      this.entradaBOPPService.srvObtenerListaPorSerial(serial).subscribe(datos_bopp => {
        if (datos_bopp.length != 0) {
          this.mostrarAdvertencia(`Advertencia`, `¡Ya existe un bopp con el serial ${serial}, por favor colocar un serial distinto!`);
          this.load = true;
        } else {
          this.categoriaService.srvObtenerListaPorId(categoria).subscribe(datos_categorias => {
            let productoExt : any = {
              Id : id,
              Serial : serial,
              Nombre : nombre,
              Descripcion : descripcion,
              Ancho : ancho,
              Cant : cantidad,
              UndCant : 'µm',
              CantKg : cantidadKg,
              UndCantKg : 'Kg',
              Precio : precio,
              Subtotal : 0,
              Cat_Id : categoria,
              Cat : datos_categorias.catMP_Nombre,
            }
            productoExt.Subtotal = parseInt(productoExt.Precio) * parseInt(productoExt.CantKg);
            this.ArrayBOPP.push(productoExt);
            this.obtenerValorTotal();

            this.FormEntradaBOPP.reset();
            this.load = true;
          });
        }
      });
    } else this.mostrarAdvertencia(`Advertencia`, `Debe llenar los campos vacios!`);
  }

  // funcion que crea los rollos en la tabla
  crearEntrada(){
    if (this.ArrayBOPP.length == 0) this.mostrarAdvertencia(`Advertencia`, "Debe cargar minimo un rollo en la tabla!");
    else {
      this.load = false
        for (let i = 0; i < this.ArrayBOPP.length; i++) {
          let bodega : number;
          if (this.ArrayBOPP[i].Cat_Id == 6) bodega = 8;
          else if (this.ArrayBOPP[i].Cat_Id == 14) bodega = 11;
          else if (this.ArrayBOPP[i].Cat_Id == 15) bodega = 12;

          let datosBOPP : any = {
            bopP_Nombre : `${this.ArrayBOPP[i].Nombre} - ${this.ArrayBOPP[i].Serial} - ${this.ArrayBOPP[i].CantKg} - ${this.ArrayBOPP[i].Ancho}`,
            bopP_Descripcion : this.ArrayBOPP[i].Descripcion,
            bopP_Serial : this.ArrayBOPP[i].Serial,
            bopP_CantidadMicras : this.ArrayBOPP[i].Cant,
            undMed_Id : 'µm',
            catMP_Id : this.ArrayBOPP[i].Cat_Id,
            bopP_Precio : this.ArrayBOPP[i].Precio,
            tpBod_Id : bodega,
            bopP_FechaIngreso : this.today,
            bopP_Ancho : this.ArrayBOPP[i].Ancho,
            BOPP_Stock : this.ArrayBOPP[i].CantKg,
            undMed_Kg : 'Kg',
            bopP_CantidadInicialKg : this.ArrayBOPP[i].CantKg,
            Usua_Id : this.storage_Id,
            BOPP_Hora : moment().format('H:mm:ss'),
            BOPP_TipoDoc: this.tipoDoc,
            BOPP_CodigoDoc : this.campoRemi_Faccompra,
          }
          this.entradaBOPPService.srvGuardar(datosBOPP).subscribe(datos_BOPP => {
            this.mostrarConfirmacion(`Confirmación`,`Entrada de rollos realizada con éxito!`);
            this.load = true;
          }, error => { this.mostrarError(`Error`, `Error al ingresar el rollo!`); });
        }
    }
  }

  /** Función para mostrar una elección de eliminación de OT/Rollo de la tabla. */
  mostrarEleccion(item : any){
    this.boppSeleccionado = item;
    this.messageService.add({severity:'warn', key:'bopp', summary:'Elección', detail: `Está seguro que desea eliminar el rollo ${item.id} de la tabla?`, sticky: true});
  }

  // Funcion que va a quitar un rollo de la tabla
  quitarRollo(data : any){
    data = this.boppSeleccionado;
    for (let i = 0; i < this.ArrayBOPP.length; i++) {
      if (data.Serial == this.ArrayBOPP[i].Serial) this.ArrayBOPP.splice(i, 1) ;
    }
    this.obtenerValorTotal();
  }

  /** Obtener nombres, micras, precios, anchos y seriales más utilizados y cargarlos en los combobox en la vista */
  getNombresBOPP() {
    this.nombresBopp = [];
    this.entradaBOPPService.getBopp().subscribe(data => {this.nombresBopp = data});
    this.FormEntradaBOPP.patchValue({ Observacion : this.FormEntradaBOPP.value.Nombre });
  }

  getMicrasBOPP() {
    this.micrasBopp = [];
    this.entradaBOPPService.getMicras().subscribe(data => {this.micrasBopp = data});
  }

  getPreciosBOPP() {
    this.preciosBopp = [];
    this.entradaBOPPService.getPrecios().subscribe(data => {this.preciosBopp = data});
  }

  getAnchosBOPP() {
    this.anchosBopp = [];
    this.entradaBOPPService.getAnchos().subscribe(data => {this.anchosBopp = data});
  }

  getSerialesBOPP() {
    this.serialesBopp = [];
    this.entradaBOPPService.getSeriales().subscribe(data => {this.serialesBopp = data});
  }

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
  obtenerProveeedor(){
    this.servicioProveedores.srvObtenerLista().subscribe(datos_proveedor => {
      for (let index = 0; index < datos_proveedor.length; index++) {
        this.proveedor.push(datos_proveedor[index]);
      }
    });
  }

  /** Función para consultar solo ordenes de compra de BOPP */
  consultarOrdenCompra_Bopp() {
    this.FormEntradaBOPP.reset();
    this.arrayBopps = [];
    let OC : number = this.FormOpcional.value.OrdenCompra;
    /** Facturado */
    this.servicioOC_MatPrimas.getFacturasAsociadasAOC(OC).subscribe(dataFacturada => {
      if(dataFacturada.length > 0) {
        for (let indx = 0; indx < dataFacturada.length; indx++) {
          this.arrayBoppsFacturados.push(dataFacturada[indx].bopp_Id);
        }
      }
      /** Remisionado */
      this.servicioOC_MatPrimas.getRemisionesComprasAsociadasAOC(OC).subscribe(dataRemisionada => {
        if(dataRemisionada.length > 0) {
          for (let inx = 0; inx < dataRemisionada.length; inx++) {
            this.arrayBoppsRemisionados.push(dataRemisionada[inx].bopp_Id);
          }
        }
        /** Cargar lista de OC */
        this.servicioOC_MatPrimas.getListaOrdenesComprasxId(OC).subscribe(data => {
          if (data.length == 0) this.mostrarAdvertencia(`Advertencia` ,`No existe la OC ${OC}, por favor, verifique!`);
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
      completado : false
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
        Categoria: item.categoria,
      });
  }

  /** Factura */
  /** Funcion para registrar el encabezado de la factura */
  registrarFacturaBopp(){
    if (this.ArrayBOPP.length == 0) this.mostrarAdvertencia(`Advertencia`, "Debe cargar minimo un rollo en la tabla");
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
      this.servicioFacturasCompras.srvGuardar(datosFactura).subscribe(datos_EncabezadoFactura => { this.obtenerUltimoIdFacturaCompra(); }, error => {
        this.mostrarError(`Error`,`Error al crear la factura!`);
      });
    }
  }

  /** Funcion para registrar el máximo ID de la factura */
  obtenerUltimoIdFacturaCompra() {
    this.servicioFacturasCompras.UltimoIdFactura().subscribe(datos_facturas => { this.creacionDetalleFactura(datos_facturas); }, error => {
      this.mostrarError(`Error`, `Error al obtener la ultima factura creada!`);
    });
  }

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
      this.servicioDetalleFacco_MatPrima.srvGuardar(info).subscribe(dataDetalleFaccompraMP => { detalleError = false; }, error => {
        this.mostrarError('No fue posible registrar el detalle de la factura, verifique!'); detalleError = true
      });
    }
    setTimeout(() => { if(!detalleError) this.crearRelacionOrdenCompra_Faccompra(idUltimafactura); }, 500);

  }

  /** Funcion para registrar la relación entre la factura y la OC */
  crearRelacionOrdenCompra_Faccompra(factura : number){
    let info : any = {
      Oc_Id : this.FormOpcional.value.OrdenCompra,
      Facco_Id : factura,
    }
    this.servicioOC_Faccompra.insert_OrdenCompra(info).subscribe(datos_insertados => { this.crearEntrada(); }, error => {
      this.mostrarError(`Error`, `No se ha creado la relación entre la factura y la OC!`);
    });
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
    this.servicioRemisiones.srvGuardar(datosRemision).subscribe(datos_remisionCreada => { this.obtenerUltimoIdRemision(); }, error => {
      this.mostrarError(`Error`, `Error al crear la remisión!`);
    });
  }

  // Funcion que se encargará de obtener el ultimo Id de las remisiones
  obtenerUltimoIdRemision(){
    this.servicioRemisiones.UltimoIdRemision().subscribe(datos_remision => { this.crearDetalleRemision(datos_remision); }, error => {
      this.mostrarError(`Error`, `Error al obtener el Id de la última remisión!`);
      this.load = true;
    });
  }

  //Funcion que creará el detalle de la remisión
  crearDetalleRemision(idRemision : any){
    let detalleError : boolean;
    if (this.ArrayBOPP.length == 0) this.mostrarAdvertencia(`Advertencia`, "Debe cargar minimo un rollo en la tabla")
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
        this.servicioDetRemisiones.srvGuardar(datosRemisionMp).subscribe(datos_remisionMpCreada => { detalleError = false; }, error => {
          detalleError = true;
          this.mostrarError(`Error`, `Error al crear el detalle de la remisión!`);
          this.load = true;
        });
      }
      setTimeout(() => { if (!detalleError) this.crearRelacionOrdenCompra_Remision(idRemision); }, 500);
    }
  }

  /** Crear relación entre remisión y orden de compra */
  crearRelacionOrdenCompra_Remision(remision : number){
    let info : any = {
      Oc_Id : this.FormOpcional.value.OrdenCompra,
      Rem_Id : remision,
    }
    this.servicioOC_Remisiones.insert_OrdenCompra(info).subscribe(datos_insertados => { this.crearEntrada(); }, error => {
      this.mostrarError(`Error`, `No se ha creado la relacion entre la remisión y la OC!`);
    });
  }

  /** Funcion para validar que tipo de entrada de BOPP */
  validarTipoEntradaBopp() {
    let oc : number = this.FormOpcional.value.OrdenCompra;
    let factura : any = this.FormOpcional.value.Factura;
    let remision : any = this.FormOpcional.value.Remision;

    if((oc == null && factura == null && remision == null)) {
      this.crearEntrada();
      setTimeout(() => { this.limpiarTodosLosCampos();}, 800);
    } else if (oc != null && factura != null && remision == null) {
      this.campoRemi_Faccompra = factura;
      this.tipoDoc = 'FCO'
      this.registrarFacturaBopp();
      setTimeout(() => { this.limpiarTodosLosCampos();}, 2000);
    } else if (oc != null && remision != null && factura == null) {
      this.campoRemi_Faccompra = remision;
      this.tipoDoc = 'REM'
      this.registrarRemisionBopp();
      setTimeout(() => { this.limpiarTodosLosCampos();}, 2000);
    } else this.mostrarAdvertencia(`Advertencia`, 'Solo debe diligenciar el campo factura o remisión, verifique!');
  }

  /** Función para obtener el valor total del Bopp a ingresar */
  obtenerValorTotal(){
    this.valorTotal = 0;
    for (let index = 0; index < this.ArrayBOPP.length; index++) {
      this.valorTotal += parseInt(this.ArrayBOPP[index].Subtotal);
    }
  }

    /** Mostrar mensaje de confirmación  */
  mostrarConfirmacion(mensaje : any, titulo?: any) {
   this.messageService.add({severity: 'success', summary: mensaje,  detail: titulo, life: 2000});
  }

  /** Mostrar mensaje de error  */
  mostrarError(mensaje : any, titulo?: any) {
   this.messageService.add({severity:'error', summary: mensaje, detail: titulo, life: 2000});
  }

  /** Mostrar mensaje de advertencia */
  mostrarAdvertencia(mensaje : any, titulo?: any) {
   this.messageService.add({severity:'warn', summary: mensaje, detail: titulo, life: 2000});
  }

  /** Cerrar Dialogo de eliminación de OT/rollos.*/
  onReject() {
    this.messageService.clear('bopp');
  }

}
