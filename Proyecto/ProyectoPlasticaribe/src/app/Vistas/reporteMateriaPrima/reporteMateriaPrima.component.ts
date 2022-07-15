import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { AreaService } from 'src/app/Servicios/area.service';
import { AsignacionMPService } from 'src/app/Servicios/asignacionMP.service';
import { BagproService } from 'src/app/Servicios/Bagpro.service';
import { CategoriaMateriaPrimaService } from 'src/app/Servicios/categoriaMateriaPrima.service';
import { DetallesAsignacionService } from 'src/app/Servicios/detallesAsignacion.service';
import { EstadosService } from 'src/app/Servicios/estados.service';
import { FacturaMpService } from 'src/app/Servicios/facturaMp.service';
import { FactuaMpCompradaService } from 'src/app/Servicios/facturaMpComprada.service';
import { InventInicialDiaService } from 'src/app/Servicios/inventInicialDia.service';
import { MateriaPrimaService } from 'src/app/Servicios/materiaPrima.service';
import { MpProveedorService } from 'src/app/Servicios/MpProveedor.service';
import { ProcesosService } from 'src/app/Servicios/procesos.service';
import { ProveedorService } from 'src/app/Servicios/proveedor.service';
import { RecuperadoService } from 'src/app/Servicios/recuperado.service';
import { RecuperadoMPService } from 'src/app/Servicios/recuperadoMP.service';
import { RemisionService } from 'src/app/Servicios/Remision.service';
import { RemisionesMPService } from 'src/app/Servicios/remisionesMP.service';
import { RemisionFacturaService } from 'src/app/Servicios/remisionFactura.service';
import { RolesService } from 'src/app/Servicios/roles.service';
import { TipoEstadosService } from 'src/app/Servicios/tipo-estados.service';
import { TipoBodegaService } from 'src/app/Servicios/tipoBodega.service';
import { UnidadMedidaService } from 'src/app/Servicios/unidad-medida.service';
import { UsuarioService } from 'src/app/Servicios/usuario.service';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-reporteMateriaPrima',
  templateUrl: './reporteMateriaPrima.component.html',
  styleUrls: ['./reporteMateriaPrima.component.css']
})
export class ReporteMateriaPrimaComponent implements OnInit {

  public FormMateriaPrimaFactura !: FormGroup;
  public FormMateriaPrima !: FormGroup;
  public FormMateriaPrimaRetiro !: FormGroup;
  public FormMateriaPrimaRetirada !: FormGroup;

  //Llamar modales, inicializados como falsos para que no se carguen al ingresar a la pagina.
  public ModalCrearProveedor: boolean = false;
  public ModalCrearMateriaPrima: boolean= false;

  /* Vaiables*/
  public page : number; //Variable que tendrá el paginado de la tabla en la que se muestran los pedidos consultados
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  ultimoIdMateriaPrima : number; //Varibale que va a almacenar el id de la ultima materia prima registrada y le va a sumar 1
  materiasPrimas = []; //Variable que va almacenar el nombre de todas las materias primas existentes en la empresa
  materiasPrimasRetiradas = []; //Variable que va almacenar el nombre de todas las materias primas existentes en la empresa
  nombreCategoriasMP = []; //VAriable que va a almacenar el nombre de todas las categorias de materias primas existentes en la empresa
  unidadMedida = []; //Varibale que va a almacenar las unidades de medida registradas en la base de datos
  usuarios = []; //Variable que va a almacenar todos los usuarios de la empresa
  estado = []; //Variable que va a almacenar todos los tipos de estados de documentos
  procesos = []; //Variable que va a almacenar los procesos que tiene la empresa (extrusio, impresion, etc...)
  areas = []; //Varibale que va a almacenar las areas de la empresa
  materiaPrimaBuscadaId = []; //Variable que almacenará la informacion de la materia prima buscada por ID
  categoriaMPBuscadaID : string; //Variable que almacenará el nombre de la categoria de la materia prima buscada por Id
  tipobodegaMPBuscadaId : string; //Variable que almacenará el nombrede la bodega en la que se encuentra la materia prima buscada
  materiaPrimaSeleccionada = []; //Variable que almacenará la informacion de la materia prima seleccionada
  categoriaMPSeleccionada : string; //Variable que almacenará el nombre de la categoria de la materia prima seleccionada
  tipoBodegaMPSeleccionada : string; //Variable que almacenará el nombrede la bodega en la que se encuentra la materia prima seleccionada
  facturaMateriaPrima = []; //Funcion que guardará la informacion de la factura de materia prima comprada que ha sido consultada
  today : any = new Date(); //Variable que se usará para llenar la fecha actual
  titulosTabla = []; //Variable que almacenará los titulos de la tabla de productos que se ve al final de la vista
  ArrayMateriaPrima : any [] = []; //Variable que tendrá la informacion de los productos que se piden en el nuevo pedido
  ArrayMateriaPrimaRetirada : any [] = []; //Variable que tendrá la informacion de los productos que se piden para uan OT
  AccionBoton = "Agregar"; //Variable que almanará informacio para saber si una materia prima está en edicion o no (Se editará una materia prima cargada en la tabla, no una en la base de datos)
  valorTotal : number = 0; //Variable que guardará el valor total de la factura de entrada de materia prima
  nombreMateriaPrima : string; //Varible que almacenará el nombre de una materia prima consultado o seleccionado
  precioOT : number; //Variable que va a almacenar el precio de la ot consultada
  cantidadTotalExt : number; //Variable que va a almacenar el total de la cantidad extruida en una OT
  cantidadTotalImp : number; //Variable que va a almacenar el total de la cantidad impresa en una OT
  cantidadTotalDbl : number; //Variable que va a almacenar el total de la cantidad doblada en una OT
  proceso : string = ''; //Variable ayudará a almacenar el proceso del cuela se está consultando la ot
  totalPorcentajePerida : number; //Variable que ayudará a calcular el total de perdida en una OT
  name = 'Inventario_Materia_Prima.xlsx'; //Variable que le da nombre al archivo de excel que se genera
  inventInicial : number = 0;
  sumaEntrada : number = 0;
  sumaSalida : number = 0;

  public load: boolean;

  /* CONSULTAS DE MATERIA PRIMA */
  MpConsultada = [];

  constructor(private materiaPrimaService : MateriaPrimaService,
                private categoriMpService : CategoriaMateriaPrimaService,
                  private tipoBodegaService : TipoBodegaService,
                    private rolService : RolesService,
                      private frmBuilderMateriaPrima : FormBuilder,
                        @Inject(SESSION_STORAGE) private storage: WebStorageService,
                          private remisionService : RemisionService,
                            private remisionMpService : RemisionesMPService,
                              private facturaCompraService : FactuaMpCompradaService,
                                private facturaCompraMPService : FacturaMpService,
                                  private usuarioService : UsuarioService,
                                    private remisionFacturaService : RemisionFacturaService,
                                      private asignacionService : AsignacionMPService,
                                        private asignacionMpService : DetallesAsignacionService,
                                          private recuperadoService : RecuperadoService,
                                            private recuperadoMPService : RecuperadoMPService,
                                              private inventInicialDiaService : InventInicialDiaService,) {

    this.FormMateriaPrima = this.frmBuilderMateriaPrima.group({
      MpId : new FormControl(),
      MpNombre: new FormControl(),
      MpCantidad: new FormControl(),
      MpPrecio: new FormControl(),
      MpUnidadMedida:new FormControl(),
      fecha: new FormControl(),
      fechaFinal : new FormControl(),
    });

    this.load = true;
  }


  exportToExcel() : void {
    if (this.ArrayMateriaPrima.length == 0) Swal.fire("Para poder crear el archivo de Excel primero debe cargar la Materia Prima en la tabla");
    else {
      let element = document.getElementById('table');
      const worksheet : XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);
      const book : XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(book, worksheet, 'Sheet1');
      XLSX.writeFile(book, this.name);
    }
  }

  ngOnInit(): void {
    this.initForms();
    this.lecturaStorage();
    this.ColumnasTabla();
    this.obtenerMateriasPrimasRetiradas();
    this.LimpiarCampos();
    this.fecha();
  }

  initForms() {
    this.FormMateriaPrima = this.frmBuilderMateriaPrima.group({
      MpId : ['', Validators.required],
      MpNombre: ['', Validators.required],
      MpCantidad : ['', Validators.required],
      MpPrecio: ['', Validators.required],
      MpUnidadMedida: ['', Validators.required],
      fecha: ['', Validators.required],
      fechaFinal: ['', Validators.required],
    });
  }

  //Funcion que colocará la fecha actual y la colocará en el campo de fecha de pedido
  fecha(){
    this.today = new Date();
    var dd : any = this.today.getDate();
    var mm : any = this.today.getMonth() + 1;
    var yyyy : any = this.today.getFullYear();
    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
    this.today = yyyy + '-' + mm + '-' + dd;
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = '$1,';
    return number.toString().replace(exp,rep);
  }

  LimpiarCampos() {
    this.FormMateriaPrima.reset();
    this.ArrayMateriaPrima = [];
    this.valorTotal = 0;
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

  /* FUNCION PARA RELIZAR CONFIMACIÓN DE SALIDA */
  confimacionSalida(){
    Swal.fire({
      title: '¿Seguro que desea salir?',
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: 'Salir',
      denyButtonText: `No Salir`,
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) window.location.href = "./";
    })
  }

  obtenerMateriasPrimasRetiradas(){
    this.materiaPrimaService.srvObtenerLista().subscribe(datos_materiaPrima => {
      for (let index = 0; index < datos_materiaPrima.length; index++) {
        this.materiasPrimas.push(datos_materiaPrima[index]);
        this.materiasPrimas.sort((a,b) => a.matPri_Nombre.localeCompare(b.matPri_Nombre));
      }
    });
  }

  buscarMpId(){

    this.ArrayMateriaPrima = [];
    this.valorTotal = 0;
    let idMateriaPrima : number = this.FormMateriaPrima.value.MpId;
    let sumaEntrada : number = 0;
    let sumaSalida : number = 0;
    this.materiaPrimaSeleccionada = [];
    this.categoriaMPBuscadaID = '';
    this.tipobodegaMPBuscadaId = '';

    this.materiaPrimaService.srvObtenerListaPorId(idMateriaPrima).subscribe(datos_materiaPrima => {
      this.categoriMpService.srvObtenerListaPorId(datos_materiaPrima.catMP_Id).subscribe(datos_categoria => {
        this.tipoBodegaService.srvObtenerListaPorId(datos_materiaPrima.tpBod_Id).subscribe(datos_bodega => {
          this.materiaPrimaSeleccionada.push(datos_materiaPrima);
          this.materiasPrimas.push(datos_materiaPrima);
          this.categoriaMPBuscadaID = datos_categoria.catMP_Nombre;
          this.tipobodegaMPBuscadaId = datos_bodega.tpBod_Nombre;
          this.cargarFormMpEnTablas(this.ArrayMateriaPrima, datos_materiaPrima.matPri_Id, datos_materiaPrima.matPri_Nombre, datos_materiaPrima.matPri_Precio, this.inventInicial, sumaEntrada, sumaSalida, datos_materiaPrima.matPri_Stock, datos_materiaPrima.undMed_Id);
        });
      });
    });
  }

  //Funcion que consultara una materia prima con base a la que está seleccionada en la vista
  buscarMpSeleccionada(){

    this.ArrayMateriaPrima = [];
    this.valorTotal = 0;
    let nombreMateriaPrima : string = this.FormMateriaPrima.value.MpNombre;
    let idMateriaPrima : number; //En el HTML se pasará el nombre de la materia prima pero el input tendrá como valor el Id de la materia prima
    this.materiaPrimaSeleccionada = [];
    let sumaEntrada : number = 0;
    let sumaSalida : number = 0;

    this.materiaPrimaService.srvObtenerListaPorId(nombreMateriaPrima).subscribe(datos_materiaPrima => {
      this.categoriMpService.srvObtenerListaPorId(datos_materiaPrima.catMP_Id).subscribe(datos_categoria => {
        this.tipoBodegaService.srvObtenerListaPorId(datos_materiaPrima.tpBod_Id).subscribe(datos_bodega => {
          this.materiaPrimaSeleccionada.push(datos_materiaPrima);
          this.materiasPrimas.push(datos_materiaPrima);
          this.categoriaMPBuscadaID = datos_categoria.catMP_Nombre;
          this.tipobodegaMPBuscadaId = datos_bodega.tpBod_Nombre;
          this.cargarFormMpEnTablas(this.ArrayMateriaPrima, datos_materiaPrima.matPri_Id, datos_materiaPrima.matPri_Nombre, datos_materiaPrima.matPri_Precio, this.inventInicial, sumaEntrada, sumaSalida, datos_materiaPrima.matPri_Stock, datos_materiaPrima.undMed_Id);
        });
      });
    });
  }

  //Funcion que colocará el nombre a las columnas de la tabla en la cual se muestran los productos pedidos por los clientes
  ColumnasTabla(){
    this.titulosTabla = [];
    this.titulosTabla = [{
      mpId : "Id",
      mpNombre : "Nombre",
      mpInicial : "Inventario Inicial",
      mpEntrada : "Entrada",
      mpSalida : "Salida",
      mpCantidad : "Cantidad Actual",
      mpDiferencia : "Diferencia",
      mpUndMedCant : "Und. Cant",
      mpPrecioU : "Precio U",
      mpSubTotal : "SubTotal",
    }]
  }

  cargarFormMpEnTablas(formulario : any, id: number, nombre : string, precio : number, inicial : number, entrada : number, salida : number, cantidad : number, undMEd : string){
    let subtotalProd : number = precio * cantidad;
    this.valorTotal = this.valorTotal + subtotalProd;
    if (inicial == 0) {
      let productoExt : any = {
        Id : id,
        Nombre : nombre,
        Inicial : inicial,
        Entrada : entrada,
        Salida : salida,
        Cant : cantidad,
        Diferencia : cantidad - inicial,
        UndCant : undMEd,
        PrecioUnd : precio,
        SubTotal : subtotalProd
      }

      if (this.AccionBoton == "Agregar" && this.ArrayMateriaPrima.length == 0) {
        this.ArrayMateriaPrima.push(productoExt);

      } else if (this.AccionBoton == "Agregar" && this.ArrayMateriaPrima.length != 0){
        this.ArrayMateriaPrima.push(productoExt);
        productoExt = [];
      } else {
        for (let index = 0; index < formulario.length; index++) {
          if(productoExt.Id == this.ArrayMateriaPrima[index].Id) {
            this.ArrayMateriaPrima.splice(index, 1);
            this.ArrayMateriaPrima.push(productoExt);
            break;
          }
        }
      }
      this.ArrayMateriaPrima.sort((a,b) => a.Nombre.localeCompare(b.Nombre));
    } else if (inicial != 0) {
      let productoExt : any = {
        Id : id,
        Nombre : nombre,
        Inicial : inicial,
        Entrada : entrada,
        Salida : salida,
        Cant : cantidad,
        Diferencia : cantidad - inicial,
        UndCant : undMEd,
        PrecioUnd : precio,
        SubTotal : subtotalProd
      }

      if (this.AccionBoton == "Agregar" && this.ArrayMateriaPrima.length == 0) {
        this.ArrayMateriaPrima.push(productoExt);

      } else if (this.AccionBoton == "Agregar" && this.ArrayMateriaPrima.length != 0){
        this.ArrayMateriaPrima.push(productoExt);
        productoExt = [];
      } else {
        for (let index = 0; index < formulario.length; index++) {
          if(productoExt.Id == this.ArrayMateriaPrima[index].Id) {
            this.ArrayMateriaPrima.splice(index, 1);
            this.ArrayMateriaPrima.push(productoExt);
            break;
          }
        }
      }
      this.ArrayMateriaPrima.sort((a,b) => a.Nombre.localeCompare(b.Nombre));
    }
    this.load = true;
  }

  validarConsulta(){
    let materiaPrima : string = this.FormMateriaPrima.value.MpNombre;
    let idMateriaPrima : number = this.FormMateriaPrima.value.MpId;
    let fecha : any = this.FormMateriaPrima.value.fecha;
    let fechaFinal : any = this.FormMateriaPrima.value.fechaFinal;
    let fechaCreacionFinal : any;
    this.ArrayMateriaPrima = [];
    this.valorTotal = 0;
    this.sumaSalida = 0;
    this.sumaEntrada = 0;
    let materia_cantidad = [];
    let materia_cantidad_factura = [];
    let materia_cantidad_remision = [];
    let materia_cantidad_recuperado = [];

    if (fecha != null && fechaFinal != null && (materiaPrima != null || idMateriaPrima != null)) {
      this.load = false;

      if (materiaPrima != null) {

        this.asignacionService.srvObtenerListaPorFechas(fecha, fechaFinal).subscribe(datos_asignaciones => {
          for (let i = 0; i < datos_asignaciones.length; i++) {
            this.asignacionMpService.srvObtenerListaPorAsigId(datos_asignaciones[i].asigMp_Id).subscribe(datos_asignacionMP => {
              for (let j = 0; j < datos_asignacionMP.length; j++) {
                if (datos_asignacionMP[j].matPri_Id == materiaPrima) {
                  const matCant : any = {
                    materiaPrima : materiaPrima,
                    cantidad : datos_asignacionMP[j].dtAsigMp_Cantidad,
                  }
                  materia_cantidad.push(matCant);
                }
              }
            });
          }
        });

        this.facturaCompraService.srvObtenerListaPorFechas(fecha, fechaFinal).subscribe(datos_factura => {
          for (let i = 0; i < datos_factura.length; i++) {
            this.facturaCompraMPService.srvObtenerListaPorFacId(datos_factura[i].facco_Id).subscribe(datos_facturaMP => {
              console.log(datos_facturaMP)
              for (let j = 0; j < datos_facturaMP.length; j++) {
                if (datos_facturaMP[j].matPri_Id == materiaPrima) {
                  const matCant : any = {
                    materiaPrima : materiaPrima,
                    cantidad : datos_facturaMP[j].faccoMatPri_Cantidad,
                  }
                  materia_cantidad_factura.push(matCant);
                }
              }
            });
          }
        });

        this.remisionService.srvObtenerListaPorFechas(fecha, fechaFinal).subscribe(datos_remisiones => {
          for (let i = 0; i < datos_remisiones.length; i++) {
            this.remisionMpService.srvObtenerListaPorRemId(datos_remisiones[i].rem_Id).subscribe(datos_remisionMP => {
              for (let j = 0; j < datos_remisionMP.length; j++) {
                if (datos_remisionMP[j].matPri_Id == materiaPrima) {
                  const matCant : any = {
                    materiaPrima : materiaPrima,
                    cantidad : datos_remisionMP[j].remiMatPri_Cantidad,
                  }
                  materia_cantidad_remision.push(matCant);
                }
              }
            });
          }
        });

        this.recuperadoService.srvObtenerListaPorFechas(fecha, fechaFinal).subscribe(datos_recuperado => {
          for (let i = 0; i < datos_recuperado.length; i++) {
            this.recuperadoMPService.srvObtenerListaPorRecuperadoId(datos_recuperado[i].recMp_Id).subscribe(datos_recuperadoMP => {
              for (let j = 0; j < datos_recuperadoMP.length; j++) {
                if (datos_recuperadoMP[j].matPri_Id == materiaPrima) {
                  const matCant : any = {
                    materiaPrima : materiaPrima,
                    cantidad : datos_recuperadoMP[j].recMatPri_Cantidad,
                  }
                  materia_cantidad_recuperado.push(matCant);
                }
              }
            });
          }
        });

        setTimeout(() => {
          this.materiaPrimaService.srvObtenerListaPorId(materiaPrima).subscribe(datos_materiaPrima => {
              this.inventInicialDiaService.srvObtenerListaPorId(datos_materiaPrima.matPri_Id).subscribe(datos_inventarioInicial => {
                this.sumaSalida = 0;
                this.sumaEntrada = 0;
                this.inventInicial = 0;
                this.inventInicial = datos_inventarioInicial.invInicial_Stock;
                // Asignaciones
                for (const item of materia_cantidad) {
                  if (datos_materiaPrima.matPri_Id == item.materiaPrima) {
                    this.sumaSalida = this.sumaSalida + item.cantidad;
                    // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaSalida} de salida el dia ${fecha}`)
                  }
                }
                // Facturas
                for (const item of materia_cantidad_factura) {
                  if (datos_materiaPrima.matPri_Id == item.materiaPrima) {
                    this.sumaEntrada = this.sumaEntrada + item.cantidad;
                    // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaEntrada} de salida el dia ${fecha} FACTURA`)
                  }
                }
                // Remisiones
                for (const item of materia_cantidad_remision) {
                  if (datos_materiaPrima.matPri_Id == item.materiaPrima) {
                    this.sumaEntrada = this.sumaEntrada + item.cantidad;
                    // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaEntrada} de salida el dia ${fecha} REMISION`)
                  }
                }

                // Recuperado
                for (const item of materia_cantidad_recuperado) {
                  if (datos_materiaPrima.matPri_Id == item.materiaPrima) {
                    this.sumaEntrada = this.sumaEntrada + item.cantidad;
                    // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaEntrada} de salida el dia ${fecha} REMISION`)
                  }
                }

                this.cargarFormMpEnTablas(this.ArrayMateriaPrima,
                  datos_materiaPrima.matPri_Id,
                  datos_materiaPrima.matPri_Nombre,
                  datos_materiaPrima.matPri_Precio,
                  this.inventInicial,
                  this.sumaEntrada,
                  this.sumaSalida,
                  datos_materiaPrima.matPri_Stock,
                  datos_materiaPrima.undMed_Id);

              });
          });
          this.load = true;
        }, 2000);
      } else if (idMateriaPrima != null) {
        this.asignacionService.srvObtenerListaPorFechas(fecha, fechaFinal).subscribe(datos_asignaciones => {
          for (let i = 0; i < datos_asignaciones.length; i++) {
            this.asignacionMpService.srvObtenerListaPorAsigId(datos_asignaciones[i].asigMp_Id).subscribe(datos_asignacionMP => {
              for (let j = 0; j < datos_asignacionMP.length; j++) {
                if (datos_asignacionMP[j].matPri_Id == idMateriaPrima) {
                  const matCant : any = {
                    materiaPrima : idMateriaPrima,
                    cantidad : datos_asignacionMP[j].dtAsigMp_Cantidad,
                  }
                  materia_cantidad.push(matCant);
                }
              }
            });
          }
        });

        this.facturaCompraService.srvObtenerListaPorFechas(fecha, fechaFinal).subscribe(datos_factura => {
          for (let i = 0; i < datos_factura.length; i++) {
            this.facturaCompraMPService.srvObtenerListaPorFacId(datos_factura[i].facco_Id).subscribe(datos_facturaMP => {
              console.log(datos_facturaMP)
              for (let j = 0; j < datos_facturaMP.length; j++) {
                if (datos_facturaMP[j].matPri_Id == idMateriaPrima) {
                  const matCant : any = {
                    materiaPrima : idMateriaPrima,
                    cantidad : datos_facturaMP[j].faccoMatPri_Cantidad,
                  }
                  materia_cantidad_factura.push(matCant);
                }
              }
            });
          }
        });

        this.remisionService.srvObtenerListaPorFechas(fecha, fechaFinal).subscribe(datos_remisiones => {
          for (let i = 0; i < datos_remisiones.length; i++) {
            this.remisionMpService.srvObtenerListaPorRemId(datos_remisiones[i].rem_Id).subscribe(datos_remisionMP => {
              for (let j = 0; j < datos_remisionMP.length; j++) {
                if (datos_remisionMP[j].matPri_Id == idMateriaPrima) {
                  const matCant : any = {
                    materiaPrima : idMateriaPrima,
                    cantidad : datos_remisionMP[j].remiMatPri_Cantidad,
                  }
                  materia_cantidad_remision.push(matCant);
                }
              }
            });
          }
        });

        this.recuperadoService.srvObtenerListaPorFechas(fecha, fechaFinal).subscribe(datos_recuperado => {
          for (let i = 0; i < datos_recuperado.length; i++) {
            this.recuperadoMPService.srvObtenerListaPorRecuperadoId(datos_recuperado[i].recMp_Id).subscribe(datos_recuperadoMP => {
              for (let j = 0; j < datos_recuperadoMP.length; j++) {
                if (datos_recuperadoMP[j].matPri_Id == idMateriaPrima) {
                  const matCant : any = {
                    materiaPrima : idMateriaPrima,
                    cantidad : datos_recuperadoMP[j].recMatPri_Cantidad,
                  }
                  materia_cantidad_recuperado.push(matCant);
                }
              }
            });
          }
        });

        setTimeout(() => {
          this.materiaPrimaService.srvObtenerListaPorId(idMateriaPrima).subscribe(datos_materiaPrima => {
              this.inventInicialDiaService.srvObtenerListaPorId(datos_materiaPrima.matPri_Id).subscribe(datos_inventarioInicial => {
                this.sumaSalida = 0;
                this.sumaEntrada = 0;
                this.inventInicial = 0;
                this.inventInicial = datos_inventarioInicial.invInicial_Stock;
                // Asignaciones
                for (const item of materia_cantidad) {
                  if (datos_materiaPrima.matPri_Id == item.materiaPrima) {
                    this.sumaSalida = this.sumaSalida + item.cantidad;
                    // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaSalida} de salida el dia ${fecha}`)
                  }
                }
                // Facturas
                for (const item of materia_cantidad_factura) {
                  if (datos_materiaPrima.matPri_Id == item.materiaPrima) {
                    this.sumaEntrada = this.sumaEntrada + item.cantidad;
                    // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaEntrada} de salida el dia ${fecha} FACTURA`)
                  }
                }
                // Remisiones
                for (const item of materia_cantidad_remision) {
                  if (datos_materiaPrima.matPri_Id == item.materiaPrima) {
                    this.sumaEntrada = this.sumaEntrada + item.cantidad;
                    // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaEntrada} de salida el dia ${fecha} REMISION`)
                  }
                }

                // Recuperado
                for (const item of materia_cantidad_recuperado) {
                  if (datos_materiaPrima.matPri_Id == item.materiaPrima) {
                    this.sumaEntrada = this.sumaEntrada + item.cantidad;
                    // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaEntrada} de salida el dia ${fecha} REMISION`)
                  }
                }

                this.cargarFormMpEnTablas(this.ArrayMateriaPrima,
                  datos_materiaPrima.matPri_Id,
                  datos_materiaPrima.matPri_Nombre,
                  datos_materiaPrima.matPri_Precio,
                  this.inventInicial,
                  this.sumaEntrada,
                  this.sumaSalida,
                  datos_materiaPrima.matPri_Stock,
                  datos_materiaPrima.undMed_Id);

              });
          });
          this.load = true;
        }, 2000);
      }

    } else if (fecha != null && (materiaPrima != null || idMateriaPrima != null)) {
      this.load = false;

      if (materiaPrima != null) {

        this.asignacionService.srvObtenerListaPorFecha(fecha).subscribe(datos_asignaciones => {
          for (let i = 0; i < datos_asignaciones.length; i++) {
            this.asignacionMpService.srvObtenerListaPorAsigId(datos_asignaciones[i].asigMp_Id).subscribe(datos_asignacionMP => {
              for (let j = 0; j < datos_asignacionMP.length; j++) {
                if (datos_asignacionMP[j].matPri_Id == materiaPrima) {
                  const matCant : any = {
                    materiaPrima : materiaPrima,
                    cantidad : datos_asignacionMP[j].dtAsigMp_Cantidad,
                  }
                  materia_cantidad.push(matCant);
                }
              }
            });
          }
        });

        this.facturaCompraService.srvObtenerListaPorFecha(fecha).subscribe(datos_factura => {
          for (let i = 0; i < datos_factura.length; i++) {
            this.facturaCompraMPService.srvObtenerListaPorFacId(datos_factura[i].facco_Id).subscribe(datos_facturaMP => {
              console.log(datos_facturaMP)
              for (let j = 0; j < datos_facturaMP.length; j++) {
                if (datos_facturaMP[j].matPri_Id == materiaPrima) {
                  const matCant : any = {
                    materiaPrima : materiaPrima,
                    cantidad : datos_facturaMP[j].faccoMatPri_Cantidad,
                  }
                  materia_cantidad_factura.push(matCant);
                }
              }
            });
          }
        });

        this.remisionService.srvObtenerListaPorFecha(fecha).subscribe(datos_remisiones => {
          for (let i = 0; i < datos_remisiones.length; i++) {
            this.remisionMpService.srvObtenerListaPorRemId(datos_remisiones[i].rem_Id).subscribe(datos_remisionMP => {
              for (let j = 0; j < datos_remisionMP.length; j++) {
                if (datos_remisionMP[j].matPri_Id == materiaPrima) {
                  const matCant : any = {
                    materiaPrima : materiaPrima,
                    cantidad : datos_remisionMP[j].remiMatPri_Cantidad,
                  }
                  materia_cantidad_remision.push(matCant);
                }
              }
            });
          }
        });

        this.recuperadoService.srvObtenerListaPorFecha(fecha).subscribe(datos_recuperado => {
          for (let i = 0; i < datos_recuperado.length; i++) {
            this.recuperadoMPService.srvObtenerListaPorRecuperadoId(datos_recuperado[i].recMp_Id).subscribe(datos_recuperadoMP => {
              for (let j = 0; j < datos_recuperadoMP.length; j++) {
                if (datos_recuperadoMP[j].matPri_Id == materiaPrima) {
                  const matCant : any = {
                    materiaPrima : materiaPrima,
                    cantidad : datos_recuperadoMP[j].recMatPri_Cantidad,
                  }
                  materia_cantidad_recuperado.push(matCant);
                }
              }
            });
          }
        });

        setTimeout(() => {
          this.materiaPrimaService.srvObtenerListaPorId(materiaPrima).subscribe(datos_materiaPrima => {
              this.inventInicialDiaService.srvObtenerListaPorId(datos_materiaPrima.matPri_Id).subscribe(datos_inventarioInicial => {
                this.sumaSalida = 0;
                this.sumaEntrada = 0;
                this.inventInicial = 0;
                this.inventInicial = datos_inventarioInicial.invInicial_Stock;
                // Asignaciones
                for (const item of materia_cantidad) {
                  if (datos_materiaPrima.matPri_Id == item.materiaPrima) {
                    this.sumaSalida = this.sumaSalida + item.cantidad;
                    // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaSalida} de salida el dia ${fecha}`)
                  }
                }
                // Facturas
                for (const item of materia_cantidad_factura) {
                  if (datos_materiaPrima.matPri_Id == item.materiaPrima) {
                    this.sumaEntrada = this.sumaEntrada + item.cantidad;
                    // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaEntrada} de salida el dia ${fecha} FACTURA`)
                  }
                }
                // Remisiones
                for (const item of materia_cantidad_remision) {
                  if (datos_materiaPrima.matPri_Id == item.materiaPrima) {
                    this.sumaEntrada = this.sumaEntrada + item.cantidad;
                    // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaEntrada} de salida el dia ${fecha} REMISION`)
                  }
                }

                // Recuperado
                for (const item of materia_cantidad_recuperado) {
                  if (datos_materiaPrima.matPri_Id == item.materiaPrima) {
                    this.sumaEntrada = this.sumaEntrada + item.cantidad;
                    // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaEntrada} de salida el dia ${fecha} REMISION`)
                  }
                }

                this.cargarFormMpEnTablas(this.ArrayMateriaPrima,
                  datos_materiaPrima.matPri_Id,
                  datos_materiaPrima.matPri_Nombre,
                  datos_materiaPrima.matPri_Precio,
                  this.inventInicial,
                  this.sumaEntrada,
                  this.sumaSalida,
                  datos_materiaPrima.matPri_Stock,
                  datos_materiaPrima.undMed_Id);

              });
          });
          this.load = true;
        }, 2000);
      } else if (idMateriaPrima != null) {
        this.asignacionService.srvObtenerListaPorFecha(fecha).subscribe(datos_asignaciones => {
          for (let i = 0; i < datos_asignaciones.length; i++) {
            this.asignacionMpService.srvObtenerListaPorAsigId(datos_asignaciones[i].asigMp_Id).subscribe(datos_asignacionMP => {
              for (let j = 0; j < datos_asignacionMP.length; j++) {
                if (datos_asignacionMP[j].matPri_Id == idMateriaPrima) {
                  const matCant : any = {
                    materiaPrima : idMateriaPrima,
                    cantidad : datos_asignacionMP[j].dtAsigMp_Cantidad,
                  }
                  materia_cantidad.push(matCant);
                }
              }
            });
          }
        });

        this.facturaCompraService.srvObtenerListaPorFecha(fecha).subscribe(datos_factura => {
          for (let i = 0; i < datos_factura.length; i++) {
            this.facturaCompraMPService.srvObtenerListaPorFacId(datos_factura[i].facco_Id).subscribe(datos_facturaMP => {
              console.log(datos_facturaMP)
              for (let j = 0; j < datos_facturaMP.length; j++) {
                if (datos_facturaMP[j].matPri_Id == idMateriaPrima) {
                  const matCant : any = {
                    materiaPrima : idMateriaPrima,
                    cantidad : datos_facturaMP[j].faccoMatPri_Cantidad,
                  }
                  materia_cantidad_factura.push(matCant);
                }
              }
            });
          }
        });

        this.remisionService.srvObtenerListaPorFecha(fecha).subscribe(datos_remisiones => {
          for (let i = 0; i < datos_remisiones.length; i++) {
            this.remisionMpService.srvObtenerListaPorRemId(datos_remisiones[i].rem_Id).subscribe(datos_remisionMP => {
              for (let j = 0; j < datos_remisionMP.length; j++) {
                if (datos_remisionMP[j].matPri_Id == idMateriaPrima) {
                  const matCant : any = {
                    materiaPrima : idMateriaPrima,
                    cantidad : datos_remisionMP[j].remiMatPri_Cantidad,
                  }
                  materia_cantidad_remision.push(matCant);
                }
              }
            });
          }
        });

        this.recuperadoService.srvObtenerListaPorFecha(fecha).subscribe(datos_recuperado => {
          for (let i = 0; i < datos_recuperado.length; i++) {
            this.recuperadoMPService.srvObtenerListaPorRecuperadoId(datos_recuperado[i].recMp_Id).subscribe(datos_recuperadoMP => {
              for (let j = 0; j < datos_recuperadoMP.length; j++) {
                if (datos_recuperadoMP[j].matPri_Id == idMateriaPrima) {
                  const matCant : any = {
                    materiaPrima : idMateriaPrima,
                    cantidad : datos_recuperadoMP[j].recMatPri_Cantidad,
                  }
                  materia_cantidad_recuperado.push(matCant);
                }
              }
            });
          }
        });

        setTimeout(() => {
          this.materiaPrimaService.srvObtenerListaPorId(idMateriaPrima).subscribe(datos_materiaPrima => {
              this.inventInicialDiaService.srvObtenerListaPorId(datos_materiaPrima.matPri_Id).subscribe(datos_inventarioInicial => {
                this.sumaSalida = 0;
                this.sumaEntrada = 0;
                this.inventInicial = 0;
                this.inventInicial = datos_inventarioInicial.invInicial_Stock;
                // Asignaciones
                for (const item of materia_cantidad) {
                  if (datos_materiaPrima.matPri_Id == item.materiaPrima) {
                    this.sumaSalida = this.sumaSalida + item.cantidad;
                    // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaSalida} de salida el dia ${fecha}`)
                  }
                }
                // Facturas
                for (const item of materia_cantidad_factura) {
                  if (datos_materiaPrima.matPri_Id == item.materiaPrima) {
                    this.sumaEntrada = this.sumaEntrada + item.cantidad;
                    // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaEntrada} de salida el dia ${fecha} FACTURA`)
                  }
                }
                // Remisiones
                for (const item of materia_cantidad_remision) {
                  if (datos_materiaPrima.matPri_Id == item.materiaPrima) {
                    this.sumaEntrada = this.sumaEntrada + item.cantidad;
                    // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaEntrada} de salida el dia ${fecha} REMISION`)
                  }
                }

                // Recuperado
                for (const item of materia_cantidad_recuperado) {
                  if (datos_materiaPrima.matPri_Id == item.materiaPrima) {
                    this.sumaEntrada = this.sumaEntrada + item.cantidad;
                    // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaEntrada} de salida el dia ${fecha} REMISION`)
                  }
                }

                this.cargarFormMpEnTablas(this.ArrayMateriaPrima,
                  datos_materiaPrima.matPri_Id,
                  datos_materiaPrima.matPri_Nombre,
                  datos_materiaPrima.matPri_Precio,
                  this.inventInicial,
                  this.sumaEntrada,
                  this.sumaSalida,
                  datos_materiaPrima.matPri_Stock,
                  datos_materiaPrima.undMed_Id);

              });
          });
          this.load = true;
        }, 2000);
      }

    } else if (fecha != null && fechaFinal != null) {
      this.load = false;

      this.asignacionService.srvObtenerListaPorFechas(fecha, fechaFinal).subscribe(datos_asignaciones => {
        for (let i = 0; i < datos_asignaciones.length; i++) {
          this.asignacionMpService.srvObtenerListaPorAsigId(datos_asignaciones[i].asigMp_Id).subscribe(datos_asignacionMP => {
            for (let j = 0; j < datos_asignacionMP.length; j++) {
              this.materiaPrimaService.srvObtenerListaPorId(datos_asignacionMP[j].matPri_Id).subscribe(datos_materiaPrima => {
                const matCant : any = {
                  materiaPrima : datos_materiaPrima.matPri_Id,
                  cantidad : datos_asignacionMP[j].dtAsigMp_Cantidad,
                }
                materia_cantidad.push(matCant);
              });
            }
          });
        }
      });

      this.facturaCompraService.srvObtenerListaPorFechas(fecha, fechaFinal).subscribe(datos_factura => {
        for (let i = 0; i < datos_factura.length; i++) {
          this.facturaCompraMPService.srvObtenerListaPorFacId(datos_factura[i].facco_Id).subscribe(datos_facturaMP => {
            console.log(datos_facturaMP)
            for (let j = 0; j < datos_facturaMP.length; j++) {
              this.materiaPrimaService.srvObtenerListaPorId(datos_facturaMP[j].matPri_Id).subscribe(datos_materiaPrima => {
                const matCant : any = {
                  materiaPrima : datos_materiaPrima.matPri_Id,
                  cantidad : datos_facturaMP[j].faccoMatPri_Cantidad,
                }
                materia_cantidad_factura.push(matCant);
              });
            }
          });
        }
      });

      this.remisionService.srvObtenerListaPorFechas(fecha, fechaFinal).subscribe(datos_remisiones => {
        for (let i = 0; i < datos_remisiones.length; i++) {
          this.remisionMpService.srvObtenerListaPorRemId(datos_remisiones[i].rem_Id).subscribe(datos_remisionMP => {
            for (let j = 0; j < datos_remisionMP.length; j++) {
              this.materiaPrimaService.srvObtenerListaPorId(datos_remisionMP[j].matPri_Id).subscribe(datos_materiaPrima => {
                const matCant : any = {
                  materiaPrima : datos_materiaPrima.matPri_Id,
                  cantidad : datos_remisionMP[j].remiMatPri_Cantidad,
                }
                materia_cantidad_remision.push(matCant);
              });
            }
          });
        }
      });

      this.recuperadoService.srvObtenerListaPorFechas(fecha, fechaFinal).subscribe(datos_recuperado => {
        for (let i = 0; i < datos_recuperado.length; i++) {
          this.recuperadoMPService.srvObtenerListaPorRecuperadoId(datos_recuperado[i].recMp_Id).subscribe(datos_recuperadoMP => {
            for (let j = 0; j < datos_recuperadoMP.length; j++) {
              this.materiaPrimaService.srvObtenerListaPorId(datos_recuperadoMP[j].matPri_Id).subscribe(datos_materiaPrima => {
                const matCant : any = {
                  materiaPrima : datos_materiaPrima.matPri_Id,
                  cantidad : datos_recuperadoMP[j].recMatPri_Cantidad,
                }
                materia_cantidad_recuperado.push(matCant);
              });
            }
          });
        }
      });

      // this.materiaPrimaService.srvObtenerLista().subscribe(datos_materiPrima => {
      //   for (let index = 0; index < datos_materiPrima.length; index++) {
      //     this.asignacionService.srvObtenerLista().subscribe(datos_asignaciones => {
      //       for (let i = 0; i < datos_asignaciones.length; i++) {
      //         let FechaCreacionDatetime = datos_asignaciones[i].asigMp_FechaEntrega;
      //         let FechaCreacionNueva = FechaCreacionDatetime.indexOf("T");
      //         let fechaCreacionFinalAsg = FechaCreacionDatetime.substring(0, FechaCreacionNueva);
      //         if (moment(fechaCreacionFinalAsg).isBetween(fecha, fechaFinal)) {
      //           this.asignacionMpService.srvObtenerListaPorId(datos_asignaciones[i].asigMp_Id, datos_materiPrima[index].matPri_Id).subscribe(datos_asignacionMP =>{
      //             const matCant : any = {
      //               materiaPrima : datos_materiPrima[index].matPri_Id,
      //               cantidad : datos_asignacionMP.dtAsigMp_Cantidad,
      //             }
      //             materia_cantidad.push(matCant);
      //           });
      //         }
      //       }
      //     });

      //     this.facturaCompraService.srvObtenerLista().subscribe(datos_factura => {
      //       for (let i = 0; i < datos_factura.length; i++) {
      //         let FechaCreacionDatetime = datos_factura[i].facco_FechaFactura;
      //         let FechaCreacionNueva = FechaCreacionDatetime.indexOf("T");
      //         let fechaCreacionFinalFac = FechaCreacionDatetime.substring(0, FechaCreacionNueva);
      //         if (moment(fechaCreacionFinalFac).isBetween(fecha, fechaFinal)) {
      //           this.facturaCompraMPService.srvObtenerLista().subscribe(datos_facturaMP => {
      //             for (let j = 0; j < datos_facturaMP.length; j++) {
      //               if (datos_factura[i].facco_Id == datos_facturaMP[j].facco_Id && datos_materiPrima[index].matPri_Id == datos_facturaMP[j].matPri_Id) {
      //                 const matCant : any = {
      //                   materiaPrima : datos_materiPrima[index].matPri_Id,
      //                   cantidad : datos_facturaMP[j].faccoMatPri_Cantidad,
      //                 }
      //                 materia_cantidad_factura.push(matCant);
      //               }
      //             }
      //           });
      //         }
      //       }
      //     });

      //     this.remisionService.srvObtenerLista().subscribe(datos_remisiones => {
      //       for (let i = 0; i < datos_remisiones.length; i++) {
      //         let FechaCreacionDatetime = datos_remisiones[i].rem_Fecha;
      //         let FechaCreacionNueva = FechaCreacionDatetime.indexOf("T");
      //         let fechaCreacionFinalRem = FechaCreacionDatetime.substring(0, FechaCreacionNueva);
      //         if (moment(fechaCreacionFinalRem).isBetween(fecha, fechaFinal)) {
      //           this.remisionMpService.srvObtenerLista().subscribe(datos_remisionesMP => {
      //             for (let j = 0; j < datos_remisionesMP.length; j++) {
      //               if (datos_remisiones[i].rem_Id == datos_remisionesMP[j].rem_Id && datos_remisionesMP[j].matPri_Id == datos_materiPrima[index].matPri_Id) {
      //                 const matCant : any = {
      //                   materiaPrima : datos_materiPrima[index].matPri_Id,
      //                   cantidad : datos_remisionesMP[j].remiMatPri_Cantidad,
      //                 }
      //                 materia_cantidad_remision.push(matCant);
      //               }
      //             }
      //           });
      //         }
      //       }
      //     });

      //     this.recuperadoService.srvObtenerLista().subscribe(datos_recuperado => {
      //       for (let i = 0; i < datos_recuperado.length; i++) {
      //         let FechaCreacionDatetime = datos_recuperado[i].recMp_FechaIngreso;
      //         let FechaCreacionNueva = FechaCreacionDatetime.indexOf("T");
      //         let fechaCreacionFinalRec = FechaCreacionDatetime.substring(0, FechaCreacionNueva);
      //         if (moment(fechaCreacionFinalRec).isBetween(fecha, fechaFinal)) {
      //           this.recuperadoMPService.srvObtenerLista().subscribe(datos_recuperadoMP => {
      //             for (let j = 0; j < datos_recuperadoMP.length; j++) {
      //               if (datos_recuperado[i].recMp_Id == datos_recuperadoMP[j].recMp_Id && datos_recuperadoMP[j].matPri_Id == datos_materiPrima[index].matPri_Id) {
      //                 const matCant : any = {
      //                   materiaPrima : datos_materiPrima[index].matPri_Id,
      //                   cantidad : datos_recuperadoMP[j].recMatPri_Cantidad,
      //                 }
      //                 materia_cantidad_recuperado.push(matCant);
      //               }
      //             }
      //           });
      //         }
      //       }
      //     });
      //   }
      // });

      setTimeout(() => {
        this.materiaPrimaService.srvObtenerLista().subscribe(datos_materiaPrima => {
          for (let index = 0; index < datos_materiaPrima.length; index++) {
            this.inventInicialDiaService.srvObtenerListaPorId(datos_materiaPrima[index].matPri_Id).subscribe(datos_inventarioInicial => {
              this.sumaSalida = 0;
              this.sumaEntrada = 0;
              this.inventInicial = 0;
              this.inventInicial = datos_inventarioInicial.invInicial_Stock;
              // Asignaciones
              for (const item of materia_cantidad) {
                if (datos_materiaPrima[index].matPri_Id == item.materiaPrima) {
                  this.sumaSalida = this.sumaSalida + item.cantidad;
                  // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaSalida} de salida el dia ${fecha}`)
                }
              }
              // Facturas
              for (const item of materia_cantidad_factura) {
                if (datos_materiaPrima[index].matPri_Id == item.materiaPrima) {
                  this.sumaEntrada = this.sumaEntrada + item.cantidad;
                  // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaEntrada} de salida el dia ${fecha} FACTURA`)
                }
              }
              // Remisiones
              for (const item of materia_cantidad_remision) {
                if (datos_materiaPrima[index].matPri_Id == item.materiaPrima) {
                  this.sumaEntrada = this.sumaEntrada + item.cantidad;
                  // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaEntrada} de salida el dia ${fecha} REMISION`)
                }
              }

              // Recuperado
              for (const item of materia_cantidad_recuperado) {
                if (datos_materiaPrima[index].matPri_Id == item.materiaPrima) {
                  this.sumaEntrada = this.sumaEntrada + item.cantidad;
                  // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaEntrada} de salida el dia ${fecha} REMISION`)
                }
              }

              this.cargarFormMpEnTablas(this.ArrayMateriaPrima,
                datos_materiaPrima[index].matPri_Id,
                datos_materiaPrima[index].matPri_Nombre,
                datos_materiaPrima[index].matPri_Precio,
                this.inventInicial,
                this.sumaEntrada,
                this.sumaSalida,
                datos_materiaPrima[index].matPri_Stock,
                datos_materiaPrima[index].undMed_Id);
            });
          }
        });
        this.load = true;
      }, 2000);
    } else if (fecha != null) {
      this.load = false;

      this.asignacionService.srvObtenerListaPorFecha(fecha).subscribe(datos_asignaciones => {
        for (let i = 0; i < datos_asignaciones.length; i++) {
          this.asignacionMpService.srvObtenerListaPorAsigId(datos_asignaciones[i].asigMp_Id).subscribe(datos_asignacionesMP => {
            for (let j = 0; j < datos_asignacionesMP.length; j++) {
              this.materiaPrimaService.srvObtenerListaPorId(datos_asignacionesMP[j].matPri_Id).subscribe(datos_materiaPrima => {
                const matCant : any = {
                  materiaPrima : datos_materiaPrima.matPri_Id,
                  cantidad : datos_asignacionesMP[j].dtAsigMp_Cantidad,
                }
                materia_cantidad.push(matCant);
              });
            }
          });
        }
      });

      this.facturaCompraService.srvObtenerListaPorFecha(fecha).subscribe(datos_factura => {
        for (let i = 0; i < datos_factura.length; i++) {
          this.facturaCompraMPService.srvObtenerListaPorFacId(datos_factura[i].facco_Id).subscribe(datos_facturaMP => {
            console.log(datos_facturaMP)
            for (let j = 0; j < datos_facturaMP.length; j++) {
              this.materiaPrimaService.srvObtenerListaPorId(datos_facturaMP[j].matPri_Id).subscribe(datos_materiaPrima => {
                const matCant : any = {
                  materiaPrima : datos_materiaPrima.matPri_Id,
                  cantidad : datos_facturaMP[j].faccoMatPri_Cantidad,
                }
                materia_cantidad_factura.push(matCant);
              });
            }
          });
        }
      });

      this.remisionService.srvObtenerListaPorFecha(fecha).subscribe(datos_remisiones => {
        for (let i = 0; i < datos_remisiones.length; i++) {
          this.remisionMpService.srvObtenerListaPorRemId(datos_remisiones[i].rem_Id).subscribe(datos_remisionMP => {
            for (let j = 0; j < datos_remisionMP.length; j++) {
              this.materiaPrimaService.srvObtenerListaPorId(datos_remisionMP[j].matPri_Id).subscribe(datos_materiaPrima => {
                const matCant : any = {
                  materiaPrima : datos_materiaPrima.matPri_Id,
                  cantidad : datos_remisionMP[j].remiMatPri_Cantidad,
                }
                materia_cantidad_remision.push(matCant);
              });
            }
          });
        }
      });

      this.recuperadoService.srvObtenerListaPorFecha(fecha).subscribe(datos_recuperado => {
        for (let i = 0; i < datos_recuperado.length; i++) {
          this.recuperadoMPService.srvObtenerListaPorRecuperadoId(datos_recuperado[i].recMp_Id).subscribe(datos_recuperadoMP => {
            for (let j = 0; j < datos_recuperadoMP.length; j++) {
              this.materiaPrimaService.srvObtenerListaPorId(datos_recuperadoMP[j].matPri_Id).subscribe(datos_materiaPrima => {
                const matCant : any = {
                  materiaPrima : datos_materiaPrima.matPri_Id,
                  cantidad : datos_recuperadoMP[j].recMatPri_Cantidad,
                }
                materia_cantidad_recuperado.push(matCant);

              });
            }
          });
        }
      });

      setTimeout(() => {
        this.materiaPrimaService.srvObtenerLista().subscribe(datos_materiaPrima => {
          for (let index = 0; index < datos_materiaPrima.length; index++) {
            this.inventInicialDiaService.srvObtenerListaPorId(datos_materiaPrima[index].matPri_Id).subscribe(datos_inventarioInicial => {
              this.sumaSalida = 0;
              this.sumaEntrada = 0;
              this.inventInicial = 0;
              this.inventInicial = datos_inventarioInicial.invInicial_Stock;
              // Asignaciones
              for (const item of materia_cantidad) {
                if (datos_materiaPrima[index].matPri_Id == item.materiaPrima) {
                  this.sumaSalida = this.sumaSalida + item.cantidad;
                  // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaSalida} de salida el dia ${fecha}`)
                }
              }
              // Facturas
              for (const item of materia_cantidad_factura) {
                if (datos_materiaPrima[index].matPri_Id == item.materiaPrima) {
                  this.sumaEntrada = this.sumaEntrada + item.cantidad;
                  // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaEntrada} de salida el dia ${fecha} FACTURA`)
                }
              }
              // Remisiones
              for (const item of materia_cantidad_remision) {
                if (datos_materiaPrima[index].matPri_Id == item.materiaPrima) {
                  this.sumaEntrada = this.sumaEntrada + item.cantidad;
                  // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaEntrada} de salida el dia ${fecha} REMISION`)
                }
              }

              // Recuperado
              for (const item of materia_cantidad_recuperado) {
                if (datos_materiaPrima[index].matPri_Id == item.materiaPrima) {
                  this.sumaEntrada = this.sumaEntrada + item.cantidad;
                  // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaEntrada} de salida el dia ${fecha} REMISION`)
                }
              }

              this.cargarFormMpEnTablas(this.ArrayMateriaPrima,
                datos_materiaPrima[index].matPri_Id,
                datos_materiaPrima[index].matPri_Nombre,
                datos_materiaPrima[index].matPri_Precio,
                this.inventInicial,
                this.sumaEntrada,
                this.sumaSalida,
                datos_materiaPrima[index].matPri_Stock,
                datos_materiaPrima[index].undMed_Id);
            });
          }
        });
      }, 2000);
    } else {
      this.load = false;

      this.asignacionService.srvObtenerListaPorFecha(this.today).subscribe(datos_asignaciones => {
        for (let i = 0; i < datos_asignaciones.length; i++) {
          this.asignacionMpService.srvObtenerListaPorAsigId(datos_asignaciones[i].asigMp_Id).subscribe(datos_asignacionesMP => {
            for (let j = 0; j < datos_asignacionesMP.length; j++) {
              this.materiaPrimaService.srvObtenerListaPorId(datos_asignacionesMP[j].matPri_Id).subscribe(datos_materiaPrima => {
                const matCant : any = {
                  materiaPrima : datos_materiaPrima.matPri_Id,
                  cantidad : datos_asignacionesMP[j].dtAsigMp_Cantidad,
                }
                materia_cantidad.push(matCant);
              });
            }
          });
        }
      });

      this.facturaCompraService.srvObtenerListaPorFecha(this.today).subscribe(datos_factura => {
        for (let i = 0; i < datos_factura.length; i++) {
          this.facturaCompraMPService.srvObtenerListaPorFacId(datos_factura[i].facco_Id).subscribe(datos_facturaMP => {
            console.log(datos_facturaMP)
            for (let j = 0; j < datos_facturaMP.length; j++) {
              this.materiaPrimaService.srvObtenerListaPorId(datos_facturaMP[j].matPri_Id).subscribe(datos_materiaPrima => {
                const matCant : any = {
                  materiaPrima : datos_materiaPrima.matPri_Id,
                  cantidad : datos_facturaMP[j].faccoMatPri_Cantidad,
                }
                materia_cantidad_factura.push(matCant);
              });
            }
          });
        }
      });

      this.remisionService.srvObtenerListaPorFecha(this.today).subscribe(datos_remisiones => {
        for (let i = 0; i < datos_remisiones.length; i++) {
          this.remisionMpService.srvObtenerListaPorRemId(datos_remisiones[i].rem_Id).subscribe(datos_remisionMP => {
            for (let j = 0; j < datos_remisionMP.length; j++) {
              this.materiaPrimaService.srvObtenerListaPorId(datos_remisionMP[j].matPri_Id).subscribe(datos_materiaPrima => {
                const matCant : any = {
                  materiaPrima : datos_materiaPrima.matPri_Id,
                  cantidad : datos_remisionMP[j].remiMatPri_Cantidad,
                }
                materia_cantidad_remision.push(matCant);
              });
            }
          });
        }
      });

      this.recuperadoService.srvObtenerListaPorFecha(this.today).subscribe(datos_recuperado => {
        for (let i = 0; i < datos_recuperado.length; i++) {
          this.recuperadoMPService.srvObtenerListaPorRecuperadoId(datos_recuperado[i].recMp_Id).subscribe(datos_recuperadoMP => {
            for (let j = 0; j < datos_recuperadoMP.length; j++) {
              this.materiaPrimaService.srvObtenerListaPorId(datos_recuperadoMP[j].matPri_Id).subscribe(datos_materiaPrima => {
                const matCant : any = {
                  materiaPrima : datos_materiaPrima.matPri_Id,
                  cantidad : datos_recuperadoMP[j].recMatPri_Cantidad,
                }
                materia_cantidad_recuperado.push(matCant);

              });
            }
          });
        }
      });

      setTimeout(() => {
        this.materiaPrimaService.srvObtenerLista().subscribe(datos_materiaPrima => {
          for (let index = 0; index < datos_materiaPrima.length; index++) {
            this.inventInicialDiaService.srvObtenerListaPorId(datos_materiaPrima[index].matPri_Id).subscribe(datos_inventarioInicial => {
              this.sumaSalida = 0;
              this.sumaEntrada = 0;
              this.inventInicial = 0;
              this.inventInicial = datos_inventarioInicial.invInicial_Stock;
              // Asignaciones
              for (const item of materia_cantidad) {
                if (datos_materiaPrima[index].matPri_Id == item.materiaPrima) {
                  this.sumaSalida = this.sumaSalida + item.cantidad;
                  // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaSalida} de salida el dia ${fecha}`)
                }
              }
              // Facturas
              for (const item of materia_cantidad_factura) {
                if (datos_materiaPrima[index].matPri_Id == item.materiaPrima) {
                  this.sumaEntrada = this.sumaEntrada + item.cantidad;
                  // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaEntrada} de salida el dia ${fecha} FACTURA`)
                }
              }
              // Remisiones
              for (const item of materia_cantidad_remision) {
                if (datos_materiaPrima[index].matPri_Id == item.materiaPrima) {
                  this.sumaEntrada = this.sumaEntrada + item.cantidad;
                  // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaEntrada} de salida el dia ${fecha} REMISION`)
                }
              }

              // Recuperado
              for (const item of materia_cantidad_recuperado) {
                if (datos_materiaPrima[index].matPri_Id == item.materiaPrima) {
                  this.sumaEntrada = this.sumaEntrada + item.cantidad;
                  // console.log(`La materia prima ${item.materiaPrima} tuvo ${this.sumaEntrada} de salida el dia ${fecha} REMISION`)
                }
              }

              this.inventInicial = 0;
              this.inventInicial = datos_inventarioInicial.invInicial_Stock;

              this.cargarFormMpEnTablas(this.ArrayMateriaPrima,
                datos_materiaPrima[index].matPri_Id,
                datos_materiaPrima[index].matPri_Nombre,
                datos_materiaPrima[index].matPri_Precio,
                this.inventInicial,
                this.sumaEntrada,
                this.sumaSalida,
                datos_materiaPrima[index].matPri_Stock,
                datos_materiaPrima[index].undMed_Id);
            });
          }
        });
      }, 2000);
    }
  }

  organizacionPrecioDblClick(){
    this.ArrayMateriaPrima.sort((a,b)=> Number(b.SubTotal) - Number(a.SubTotal));
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    });
    Toast.fire({
      icon: 'warning',
      title: 'Ordenado por "Precio Total" de mayor a menor'
    });
  }

  //Funcion que organiza los campos de la tabla de pedidos de menor a mayor
  organizacionPrecio(){
    this.ArrayMateriaPrima.sort((a,b)=> Number(a.SubTotal) - Number(b.SubTotal));
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    });
    Toast.fire({
      icon: 'warning',
      title: 'Ordenado por "Precio Total" de menor a mayor'
    });
  }

}
