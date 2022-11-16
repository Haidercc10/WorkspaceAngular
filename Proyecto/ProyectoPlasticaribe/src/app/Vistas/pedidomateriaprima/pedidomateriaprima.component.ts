import { Component, OnInit,Inject } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import Swal from 'sweetalert2';
import { RolesService } from 'src/app/Servicios/roles.service';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { MateriaPrimaService } from 'src/app/Servicios/materiaPrima.service';
import { ProveedorService } from 'src/app/Servicios/proveedor.service';
import { FactuaMpCompradaService } from 'src/app/Servicios/facturaMpComprada.service';
import { FacturaMpService } from 'src/app/Servicios/facturaMp.service';
import { UsuarioService } from 'src/app/Servicios/usuario.service';
import { TipoDocumentoService } from 'src/app/Servicios/tipoDocumento.service';
import { RemisionService } from 'src/app/Servicios/Remision.service';
import { RemisionesMPService } from 'src/app/Servicios/remisionesMP.service';
import pdfMake from 'pdfmake/build/pdfmake';
import { RemisionFacturaService } from 'src/app/Servicios/remisionFactura.service';
import { TintasService } from 'src/app/Servicios/tintas.service';
import { OrdenCompra_MateriaPrimaService } from 'src/app/Servicios/OrdenCompra_MateriaPrima.service';
import moment from 'moment';

@Component({
  selector: 'app.pedidomateriaprima.component',
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
  precioOT : number; //Variable que va a almacenar el precio de la ot consultada
  proveedor = [];
  ultimoIdFactura : number = 0;
  ultimoIdRemision : number = 0;
  ArrayRemisiones = [];
  precioRemision = [];
  titulosTablaRemisiones = [];
  valorTotalRem = 0;
  mpAgregada = [];
  /* CONSULTAS DE MATERIA PRIMA */
  MpConsultada = [];
  remision : any = [];
  remConFac : any = [];

  NombreMatPrima : string = 'Materia Prima';
  public load: boolean;
  public arrayOrdenCompra : any [] = [];

  constructor(private materiaPrimaService : MateriaPrimaService,
                private usuarioService : UsuarioService,
                  private rolService : RolesService,
                    private frmBuilderMateriaPrima : FormBuilder,
                      @Inject(SESSION_STORAGE) private storage: WebStorageService,
                        private proveedorservices : ProveedorService,
                          private facturaMpComService : FactuaMpCompradaService,
                            private facturaMpService : FacturaMpService,
                              private tipoDocumentoService : TipoDocumentoService,
                                private remisionService : RemisionService,
                                  private remisionMPService : RemisionesMPService,
                                    private remisionFacturaService : RemisionFacturaService,
                                      private tintasService : TintasService,
                                        private servicioOCMatPrima : OrdenCompra_MateriaPrimaService) {

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
    let rol = this.storage.get('Rol');
    this.rolService.srvObtenerLista().subscribe(datos_roles => {
      for (let index = 0; index < datos_roles.length; index++) {
        if (datos_roles[index].rolUsu_Id == rol) {
          this.ValidarRol = rol;
          this.storage_Rol = datos_roles[index].rolUsu_Nombre;
        }
      }
    });
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
    });
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
    this.valorTotalRem = 0;
    this.valorTotal = 0;
    this.obtenerUltimoIdFacturaCompra();
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
    this.arrayOrdenCompra = [];
    this.load = false;
    let Orden_Compra : any = this.FormMateriaPrimaFactura.value.OrdenCompra;
    let matPrimaFacco : number;

    if (Orden_Compra != null) {
      // this.servicioOCMatPrima.getListaFacturasxOC(Orden_Compra).subscribe(dataFacturas => {
      //   if(dataFacturas.length > 0) {
      //      for (let i = 0; i < dataFacturas.length; i++) {
      //       //facturas.push(dataFacturas[i].facco_Id);
      //       this.facturaMpService.srvObtenerListaPorFacId(dataFacturas[i].facco_Id).subscribe(dataFacComprasMP => {
      //         for (let fcmp = 0; fcmp < dataFacComprasMP.length; fcmp++) {

      //           if(dataFacComprasMP[fcmp].matPri_Id == 84) matPrimaFacco = dataFacComprasMP[fcmp].tinta_Id;
      //           else if (dataFacComprasMP[fcmp].tinta_Id == 2001) matPrimaFacco = dataFacComprasMP[fcmp].matPri_Id;

      //           let info : any = {
      //             MatPrima : matPrimaFacco,
      //             CantidadPedida : dataFacComprasMP[fcmp].faccoMatPri_Cantidad,
      //             Unidad : dataFacComprasMP[fcmp].undMed_Id,
      //           }

      //         }
      //       })
      //      }
      //   }
      // });

      this.servicioOCMatPrima.getListaOrdenesComprasxId(Orden_Compra).subscribe(datos_orden => {
        if(datos_orden.length > 0) {
          setTimeout(() => {
            for (let i = 0; i < datos_orden.length; i++) {
              let info : any = {
                Id : 0,
                Id_Mp: datos_orden[i].matPri_Id,
                Id_Tinta: datos_orden[i].tinta_Id,
                Id_Bopp: datos_orden[i].bopP_Id,
                Nombre : '',
                Cantidad : (datos_orden[i].doc_CantidadPedida),
                Cantidad_Oculta : datos_orden[i].doc_CantidadPedida,
                Medida : datos_orden[i].undMed_Id,
                Precio : datos_orden[i].doc_PrecioUnitario,
                Exits : false,
              }
              if (info.Id_Mp != 84) {
                info.Id = info.Id_Mp;
                info.Nombre = datos_orden[i].matPri_Nombre;
              } else if (info.Id_Tinta != 2001) {
                info.Id = info.Id_Tinta;
                info.Nombre = datos_orden[i].tinta_Nombre;
              } else if (info.Id_Bopp != 1) {
                info.Id = info.Id_Bopp;
                info.Nombre = datos_orden[i].boppGen_Nombre;
              }
              this.arrayOrdenCompra.push(info);
              this.arrayOrdenCompra.sort((a,b) => a.Nombre.localeCompare(b.Nombre));
            }
          }, 500);
        } else Swal.fire('No se encontró la Orden de Compra solicitada');
      });
    } else Swal.fire('Debe llenar el campo Nro. Orden Compra');
    setTimeout(() => { this.load = true; }, 1000);
  }

  //Funcion que va a seleccionar una materia prima
  llenarMateriaPrimaAIngresar(item : any){
    for (let i = 0; i < this.arrayOrdenCompra.length; i++) {
      if (this.arrayOrdenCompra[i].Id == item.Id) this.arrayOrdenCompra.splice(i, 1);
    }
    this.ArrayMateriaPrima.sort((a,b) => Number(a.Id) - Number(b.Id) );
    this.ArrayMateriaPrima.sort((a,b) => Number(a.Exits) - Number(b.Exits) );
  }

  // Funcion que seleccionará y colocará todos los MateriaPrima que se van a insertar
  seleccionarTodosMateriaPrima(item : any){
    this.arrayOrdenCompra = [];
    for (let i = 0; i < item.length; i++) {
      if (item[i].Exits == true) this.arrayOrdenCompra.push(item[i]);
    }
    this.ArrayMateriaPrima.sort((a,b) => Number(a.Id) - Number(b.Id) );
    this.ArrayMateriaPrima.sort((a,b) => Number(a.Exits) - Number(b.Exits) );
  }

  //Funcion que va a quitar lo MateriaPrima que se van a insertar
  quitarMateriaPrimaAIngresar(item : any){
    for (let i = 0; i < this.ArrayMateriaPrima.length; i++) {
      if (this.ArrayMateriaPrima[i].Id == item.Id) this.ArrayMateriaPrima.splice(i, 1);
    }
    this.arrayOrdenCompra.sort((a,b) => Number(a.Id) - Number(b.Id) );
    this.arrayOrdenCompra.sort((a,b) => Number(a.Exits) - Number(b.Exits) );
  }

  // Funcion que validará la cantidad que se está cambiando
  validarCantidad(item : any){
    console.log(item)
    if (item.Cantidad > item.Cantidad_Oculta) {
      for (let i = 0; i < this.ArrayMateriaPrima.length; i++) {
        if (item.Id == this.ArrayMateriaPrima[i].Id) this.ArrayMateriaPrima[i].Cantidad = this.ArrayMateriaPrima[i].Cantidad_Oculta;
      }
      Swal.fire(`¡La cantidad ${item.Cantidad} no está disponible para la materia prima ${item.Nombre}!`);
    }
  }

  // Funcion que va a quitar todos los MateriaPrima que se van a insertar
  quitarTodosMateriaPrima(item : any){
    this.arrayOrdenCompra.sort((a,b) => Number(a.Id) - Number(b.Id) );
    this.arrayOrdenCompra.sort((a,b) => Number(a.Exits) - Number(b.Exits) );
    this.ArrayMateriaPrima = [];
  }

  //Consultar Remisiones por Codigo
  consultarIdRemisiones(){
    let idRemision : number = this.FormRemisiones.value.idRemision;
    this.remision = [];
    this.remConFac = [];
    this.load = false;

    this.remisionService.srvObtenerLista().subscribe(datos_remision => {
      for (let index = 0; index < datos_remision.length; index++) {
        if (idRemision == datos_remision[index].rem_Codigo) this.remision.push(datos_remision[index].rem_Id);
      }
    });
    // Llenado de Array con Remisiones con Facturas
    this.remisionFacturaService.srvObtenerLista().subscribe(datos_remisionesFacturas => {
      for (let i = 0; i < datos_remisionesFacturas.length; i++) {
        this.remConFac.push(datos_remisionesFacturas[i].rem_Id);
      }
    });
    // Se esperan unos segundos a que termine el llenado
    setTimeout(() => {
      for (let m = 0; m < this.remConFac.length; m++) {
        for (let l = 0; l < this.remision.length; l++) {
          if (this.remConFac.includes(this.remision[l])) {
            if (this.remision[l] == this.remConFac[m]) this.remision = [];
          }
        }
      }
      if (this.remision.length == 0) Swal.fire(`La remision con el código ${idRemision} ya tiene una factura asignada`)
      else {
        // Recorre el Array de Remisiones y busca cada id para mostrarlo en la tabla
        for (let k = 0; k < this.remision.length; k++) {
          this.remisionService.srvObtenerListaPorId(this.remision[k]).subscribe(datos_remision => {
            this.proveedorservices.srvObtenerListaPorId(datos_remision.prov_Id).subscribe(datos_proveedor => {
              this.usuarioService.srvObtenerListaPorId(datos_remision.usua_Id).subscribe(datos_usuario => {
                this.tipoDocumentoService.srvObtenerListaPorId(datos_remision.tpDoc_Id).subscribe(datos_tipoDocumento => {
                  let datosTablaRemisiones : any = {
                  remisionId : datos_remision.rem_Id,
                  remisionCodigo : datos_remision.rem_Codigo,
                  remisionFecha : datos_remision.rem_Fecha,
                  remisionProveedor : datos_proveedor.prov_Nombre,
                  remisionUsuario :  datos_usuario.usua_Nombre,
                  remisionDocumento : datos_tipoDocumento.tpDoc_Nombre,
                  remisionPrecio : datos_remision.rem_PrecioEstimado
                }
                  this.precioRemision = datosTablaRemisiones.remisionPrecio
                  this.ArrayRemisiones.push(datosTablaRemisiones);
                });
              });
            });
          });
        }
      }
      this.load = true;
    }, 2000);
  }

  //Funcion que validará el campo sobre el que se está colocando del consecutivo, factura o remisimos
  validarCampos(){
    if (this.FormMateriaPrimaFactura.value.MpRemision == '' && this.FormMateriaPrimaFactura.value.MpFactura == '') Swal.fire("Los campos 'N° Factura' y 'N° Remisión' no pueden tener información al mismo tiempo, por favor llenar solo uno de estos.");
    else if (this.FormMateriaPrimaFactura.value.MpRemision != '' && this.FormMateriaPrimaFactura.value.MpFactura == '') this.registrarRemisionMP();
    else if (this.FormMateriaPrimaFactura.value.MpRemision == '' && this.FormMateriaPrimaFactura.value.MpFactura != '') this.registrarFacturaMP();
  }

  //Funcion que registrará y guardará en la base de datos la infomacion de la materia prima entrante
  registrarFacturaMP(){
    const datosFactura : any = {
      Facco_Codigo : this.FormMateriaPrimaFactura.value.MpFactura,
      Facco_FechaFactura : this.today,
      Facco_FechaVencimiento : this.today,
      Prov_Id : this.FormMateriaPrimaFactura.value.proveedor,
      Facco_ValorTotal : this.valorTotal,
      Facco_Observacion : this.FormMateriaPrimaFactura.value.MpObservacion,
      Estado_Id : 13,
      Usua_Id : this.storage_Id,
      TpDoc_Id : 'FCO',
    }
    this.facturaMpComService.srvGuardar(datosFactura).subscribe(datos_facturaCreada => {
      this.obtenerUltimoIdFacturaCompra();
    });
  }

  // Funicion que va a colocar el id de la ultimo factura
  obtenerUltimoIdFacturaCompra(){
    this.facturaMpComService.UltimoIdFactura().subscribe(datos_facturas => {
      this.creacionFacturaMateriaPrima(this.ultimoIdFactura);
    });
  }

  //Funcion que creará el registro de la materia que viene en un pedido
  creacionFacturaMateriaPrima(idFactura : number){
    if (this.ArrayMateriaPrima.length == 0) Swal.fire("Debe cargar minimo una materia prima en la tabla")
    else {
      for (let index = 0; index < this.ArrayMateriaPrima.length; index++) {
        const datosFacturaMp : any = {
          Facco_Id : idFactura,
          MatPri_Id : this.ArrayMateriaPrima[index].Id_Mp,
          Tinta_Id : this.ArrayMateriaPrima[index].Id_Tinta,
          FaccoMatPri_Cantidad : this.ArrayMateriaPrima[index].Cantidad_Oculta,
          UndMed_Id : this.ArrayMateriaPrima[index].Medida,
          FaccoMatPri_ValorUnitario : this.ArrayMateriaPrima[index].PrecioUnd,
        }
        this.facturaMpService.srvGuardar(datosFacturaMp).subscribe(datos_facturaMpCreada => {
        });
        this.cargarRemisionEnFactura(idFactura);
        this.moverInventarioMP();
        this.moverInventarioTintas();
      }
    }
  }

  // Funcion que se encargará de la relacion entre la(s) remision(es) o factura(s)
  cargarRemisionEnFactura(idFactura : number){
    for (const rem of this.ArrayRemisiones) {
      const datosFacRem : any = {
        Rem_Id : rem.remisionId,
        Facco_Id : idFactura,
      }
      this.remisionFacturaService.srvGuardar(datosFacRem).subscribe(datosFacRemision => { });
    }
  }

  //Funcion que registrará y guardará en la base de datos la infomacion de la materia prima entrante en una remisión.
  registrarRemisionMP(){
    const datosRemision : any = {
      Rem_Codigo : this.FormMateriaPrimaFactura.value.MpRemision,
      Rem_Fecha : this.today,
      Rem_PrecioEstimado : this.valorTotal,
      Prov_Id : this.FormMateriaPrimaFactura.value.proveedor,
      Estado_Id : 12,
      Usua_Id : this.storage_Id,
      TpDoc_Id : 'REM',
      Rem_Observacion : this.FormMateriaPrimaFactura.value.MpObservacion,
    }
    this.remisionService.srvGuardar(datosRemision).subscribe(datos_remisionCreada => { this.obtenerUltimoIdRemision(); });
  }

  // Funcion que se encargará de obtener el ultimo Id de las facturas
  obtenerUltimoIdRemision(){
    this.remisionService.UltimoIdRemision().subscribe(datos_remision => {
      this.creacionRemisionMateriaPrima(datos_remision);
    });
  }

  //Funcion que creará el registro de la materia que viene en un pedido
  creacionRemisionMateriaPrima(idRemision : any){
    if (this.ArrayMateriaPrima.length == 0) Swal.fire("Debe cargar minimo una materia prima en la tabla")
    else {
      for (let index = 0; index < this.ArrayMateriaPrima.length; index++) {
        const datosRemisionMp : any = {
          Rem_Id : idRemision,
          MatPri_Id : this.ArrayMateriaPrima[index].Id_Mp,
          Tinta_Id : this.ArrayMateriaPrima[index].Id_Tinta,
          RemiMatPri_Cantidad : this.ArrayMateriaPrima[index].Cantidad_Oculta,
          UndMed_Id : this.ArrayMateriaPrima[index].Medida,
          RemiMatPri_ValorUnitario : this.ArrayMateriaPrima[index].PrecioUnd,
        }
        this.remisionMPService.srvGuardar(datosRemisionMp).subscribe(datos_remisionMpCreada => {
        });
        this.moverInventarioMP();
        this.moverInventarioTintas();
      }
    }
  }

  // Funcion que va a mosver el inventario de materia prima
  moverInventarioMP(){
    for (let index = 0; index < this.ArrayMateriaPrima.length; index++) {
      this.materiaPrimaService.srvObtenerListaPorId(this.ArrayMateriaPrima[index].MatPrima).subscribe(datos_materiaPrima => {
        const datosMPActualizada : any = {
          MatPri_Id : this.ArrayMateriaPrima[index].MatPrima,
          MatPri_Nombre : datos_materiaPrima.matPri_Nombre,
          MatPri_Descripcion : datos_materiaPrima.matPri_Descripcion,
          MatPri_Stock : (datos_materiaPrima.matPri_Stock + this.ArrayMateriaPrima[index].Cant),
          UndMed_Id : datos_materiaPrima.undMed_Id,
          CatMP_Id : datos_materiaPrima.catMP_Id,
          MatPri_Precio : datos_materiaPrima.matPri_Precio,
          TpBod_Id : datos_materiaPrima.tpBod_Id,
        }

        this.materiaPrimaService.srvActualizar(this.ArrayMateriaPrima[index].MatPrima, datosMPActualizada).subscribe(datos_mp_creada => { }, error => {
          const Toast = Swal.mixin({
            toast: true,
            position: 'center',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.addEventListener('mouseenter', Swal.stopTimer)
              toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
          });
          Toast.fire({
            icon: 'error',
            title: '¡No restó al inventario de materias primas!'
          });
        });
      }, error => { const Toast = Swal.mixin({
        toast: true,
        position: 'center',
        showConfirmButton: false,
        timer: 1200,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
      });
      Toast.fire({
        icon: 'error',
        title: 'Materia prima no encontrada!'
      });
      });
    }
  }

  //Función que restará a las tintas de categoria diferente a TINTAS TIPO COLORES.
  moverInventarioTintas(){
    for (let index = 0; index < this.ArrayMateriaPrima.length; index++) {
      this.tintasService.srvObtenerListaPorId(this.ArrayMateriaPrima[index].Tinta).subscribe(datos_tinta => {
        const datosTintaActualizada : any = {
          Tinta_Id : this.ArrayMateriaPrima[index].Tinta,
          Tinta_Nombre : datos_tinta.tinta_Nombre,
          Tinta_Descripcion : datos_tinta.tinta_Descripcion,
          Tinta_Stock : (datos_tinta.tinta_Stock + this.ArrayMateriaPrima[index].Cant),
          Tinta_CodigoHexadecimal : datos_tinta.tinta_CodigoHexadecimal,
          UndMed_Id : datos_tinta.undMed_Id,
          CatMP_Id : datos_tinta.catMP_Id,
          Tinta_Precio : datos_tinta.tinta_Precio,
          TpBod_Id : datos_tinta.tpBod_Id,
          tinta_InvInicial : datos_tinta.tinta_InvInicial,
        }

        this.tintasService.srvActualizar(this.ArrayMateriaPrima[index].Tinta, datosTintaActualizada).subscribe(datos_mp_creada => {
          const Toast = Swal.mixin({
            toast: true,
            position: 'center',
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.addEventListener('mouseenter', Swal.stopTimer)
              toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
          });
          Toast.fire({
            icon: 'success',
            title: '¡Registro de factura/Remisión creado con exito!'
          });
          this.limpiarTodosCampos();
        }, error => {
          const Toast = Swal.mixin({
            toast: true,
            position: 'center',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.addEventListener('mouseenter', Swal.stopTimer)
              toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
          });
          Toast.fire({
            icon: 'error',
            title: '¡No sumó al inventario de tintas!'
          });
        });
      }, error => {
        const Toast = Swal.mixin({
          toast: true,
          position: 'center',
          showConfirmButton: false,
          timer: 1200,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
          }
        });
        Toast.fire({
          icon: 'error',
          title: '¡Tinta no encontrada!'
        });
      });
    }
  }

  //
  cargarPDF(formulario : any){
    let id : any = formulario.remisionId;
    this.remisionService.srvObtenerListaPorId(id).subscribe(datos_remision => {
      this.remisionMPService.srvObtenerLista().subscribe(datos_remisionMP => {
        for (let index = 0; index < datos_remisionMP.length; index++) {
          if (datos_remisionMP[index].rem_Id == id) {
            this.usuarioService.srvObtenerListaPorId(datos_remision.usua_Id).subscribe(datos_usuario => {
              this.proveedorservices.srvObtenerListaPorId(datos_remision.prov_Id).subscribe(datos_proveedor => {
                this.materiaPrimaService.srvObtenerListaPorId(datos_remisionMP[index].matPri_Id).subscribe(datos_materiPrima => {
                  for (let mp = 0; mp < this.mpAgregada.length; mp++) {
                    const pdfDefinicion : any = {
                      info: {
                        title: `${datos_remision.rem_Id}`
                      },
                      content : [
                        {
                          text: `Plasticaribe S.A.S ---- Remisión de Compra de Materia Prima`,
                          alignment: 'center',
                          style: 'titulo',
                        },
                        '\n \n',
                        {
                          text: `Fecha de registro: ${datos_remision.rem_Fecha.replace('T00:00:00', '')}`,
                          style: 'header',
                          alignment: 'right',
                        },
                        {
                          text: `Registrado Por: ${datos_usuario.usua_Nombre}\n`,
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
                                `ID: ${datos_proveedor.prov_Id}`,
                                `Tipo de ID: ${datos_proveedor.tipoIdentificacion_Id}`,
                                `Tipo de Cliente: ${datos_proveedor.tpProv_Id}`
                              ],
                              [
                                `Nombre: ${datos_proveedor.prov_Nombre}`,
                                `Telefono: ${datos_proveedor.prov_Telefono}`,
                                `Ciudad: ${datos_proveedor.prov_Ciudad}`
                              ],
                              [
                                `E-mail: ${datos_proveedor.prov_Email}`,
                                ``,
                                ``
                              ]
                            ]
                          },
                          layout: 'lightHorizontalLines',
                          fontSize: 9,
                        },
                        {
                          text: `\n \nObervación sobre la remisión: \n ${datos_remision.rem_Observacion}\n`,
                          style: 'header',
                        },
                        {
                          text: `\n Información detallada de Materia(s) Prima(s) comprada(s) \n `,
                          alignment: 'center',
                          style: 'header'
                        },

                        this.table(this.mpAgregada, ['Id', 'Nombre', 'Cant', 'UndCant', 'PrecioUnd', 'SubTotal']),

                        {
                          text: `\n\nValor Total Remisión: $${this.formatonumeros(datos_remision.rem_PrecioEstimado)}`,
                          alignment: 'right',
                          style: 'header',
                        },
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
                });
              });
            });
            break
          }
        }
      });
    });
  }

  //
  llenarDocumento(formulario : any){
    let id : any = formulario.remisionId;
    this.mpAgregada = [];
    this.remisionMPService.srvObtenerLista().subscribe(datos_remisionMP => {
      for (let index = 0; index < datos_remisionMP.length; index++) {
        if (datos_remisionMP[index].rem_Id == id) {
          this.materiaPrimaService.srvObtenerListaPorId(datos_remisionMP[index].matPri_Id).subscribe(datos_materiPrima => {
            const mpFactura : any = {
              Id : datos_materiPrima.matPri_Id,
              Nombre : datos_materiPrima.matPri_Nombre,
              Cant : this.formatonumeros(datos_remisionMP[index].remiMatPri_Cantidad),
              UndCant : datos_remisionMP[index].undMed_Id,
              Stock : datos_materiPrima.matPri_Stock,
              UndStock : datos_materiPrima.undMed_Id,
              PrecioUnd : this.formatonumeros(datos_remisionMP[index].remiMatPri_ValorUnitario),
              SubTotal : this.formatonumeros(datos_remisionMP[index].remiMatPri_Cantidad * datos_remisionMP[index].remiMatPri_ValorUnitario),
            }
            this.mpAgregada.push(mpFactura);
          });
        }
      }
    });
    this.cargarPDF(formulario);
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
          widths: ['*', '*', '*', '*', '*', '*'],
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

}
