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


  sumaEntrada : number = 0;
  sumaSalida : number = 0;

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
                                            private recuperadoMPService : RecuperadoMPService) {

    this.FormMateriaPrima = this.frmBuilderMateriaPrima.group({
      MpId : new FormControl(),
      MpNombre: new FormControl(),
      MpCantidad: new FormControl(),
      MpPrecio: new FormControl(),
      MpUnidadMedida:new FormControl(),
      fecha: new FormControl(),
      fechaFinal : new FormControl(),
    });
  }


  ngOnInit(): void {
    this.initForms();
    this.lecturaStorage();
    this.ColumnasTabla();
    this.obtenerMateriasPrimasRetiradas();
    this.LimpiarCampos();
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
          this.cargarFormMpEnTablas(this.ArrayMateriaPrima, datos_materiaPrima.matPri_Id, datos_materiaPrima.matPri_Nombre, datos_materiaPrima.matPri_Precio, datos_materiaPrima.matPri_Stock, sumaEntrada, sumaSalida, datos_materiaPrima.undMed_Id);
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

    this.materiaPrimaService.srvObtenerLista().subscribe(datos_materiasPrimas => {
      for (let index = 0; index < datos_materiasPrimas.length; index++) {
        if (datos_materiasPrimas[index].matPri_Nombre == nombreMateriaPrima) {
          this.categoriMpService.srvObtenerListaPorId(datos_materiasPrimas[index].catMP_Id).subscribe(datos_categoria => {
            this.tipoBodegaService.srvObtenerListaPorId(datos_materiasPrimas[index].tpBod_Id).subscribe(datos_bodega => {
              this.materiaPrimaSeleccionada.push(datos_materiasPrimas[index]);
              this.categoriaMPSeleccionada = datos_categoria.catMP_Nombre;
              this.tipoBodegaMPSeleccionada = datos_bodega.tpBod_Nombre;
              this.cargarFormMpEnTablas(this.ArrayMateriaPrima, datos_materiasPrimas[index].matPri_Id, datos_materiasPrimas[index].matPri_Nombre, datos_materiasPrimas[index].matPri_Precio, datos_materiasPrimas[index].matPri_Stock, sumaEntrada, sumaSalida, datos_materiasPrimas[index].undMed_Id)
            });
          });
        }
      }
    });
  }

  //Funcion que colocará el nombre a las columnas de la tabla en la cual se muestran los productos pedidos por los clientes
  ColumnasTabla(){
    this.titulosTabla = [];
    this.titulosTabla = [{
      mpId : "Id",
      mpNombre : "Nombre",
      mpCantidad : "Cantidad",
      mpEntrada : "Entrada",
      mpSalida : "Salida",
      mpUndMedCant : "Und. Cant",
      mpPrecioU : "Precio U",
      mpSubTotal : "SubTotal",
    }]
  }

  cargarFormMpEnTablas(formulario : any, id: number, nombre : string, precio : number, cantidad : number, entrada : number, salida : number, undMEd : string){
    let subtotalProd : number = precio * cantidad;

    this.valorTotal = this.valorTotal + subtotalProd;

    let productoExt : any = {
      Id : id,
      Nombre : nombre,
      Cant : cantidad,
      Entrada : entrada,
      Salida : salida,
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

  validarConsulta(){
    let materiaPrima : string = this.FormMateriaPrima.value.MpNombre;
    let idMateriaPrima : number = this.FormMateriaPrima.value.MpId;
    let fecha : any = this.FormMateriaPrima.value.fecha;
    let fechaFinal : any = this.FormMateriaPrima.value.fechaFinal;
    let fechaCreacionFinal : any;
    this.ArrayMateriaPrima = [];
    this.valorTotal = 0;
    this.sumaSalida = 0;
    let salida : number = 0;
    let materia_cantidad = [];
    let materia_cantidad_factura = [];
    let materia_cantidad_remision = [];
    let materia_cantidad_recuperado = [];

    if (fecha != null && fechaFinal != null && (materiaPrima != null || idMateriaPrima != null)) {

    } else if (fecha != null && (materiaPrima != null || idMateriaPrima != null)) {

    } else if (fechaFinal != null && (materiaPrima != null || idMateriaPrima != null)) {

    } else if (fecha != null && fechaFinal != null) {

    } else if (fecha != null) {
      this.materiaPrimaService.srvObtenerLista().subscribe(datos_materiPrima => {
        for (let index = 0; index < datos_materiPrima.length; index++) {
          this.asignacionService.srvObtenerLista().subscribe(datos_asignaciones => {
            for (let i = 0; i < datos_asignaciones.length; i++) {
              let FechaCreacionDatetime = datos_asignaciones[i].asigMp_FechaEntrega;
              let FechaCreacionNueva = FechaCreacionDatetime.indexOf("T");
              fechaCreacionFinal = FechaCreacionDatetime.substring(0, FechaCreacionNueva);
              if (moment(fecha).isSame(fechaCreacionFinal)) {
                this.asignacionMpService.srvObtenerLista().subscribe(datos_asignacionMP =>{
                  for (let j = 0; j < datos_asignacionMP.length; j++) {
                    if (datos_asignaciones[i].asigMp_Id == datos_asignacionMP[j].asigMp_Id && datos_materiPrima[index].matPri_Id == datos_asignacionMP[j].matPri_Id) {
                      const matCant : any = {
                        materiaPrima : datos_materiPrima[index].matPri_Id,
                        cantidad : datos_asignacionMP[j].dtAsigMp_Cantidad,
                      }
                      materia_cantidad.push(matCant);
                    }
                  }
                });
              }
            }
          });

          this.facturaCompraService.srvObtenerLista().subscribe(datos_factura => {
            for (let i = 0; i < datos_factura.length; i++) {
              let FechaCreacionDatetime = datos_factura[i].facco_FechaFactura;
              let FechaCreacionNueva = FechaCreacionDatetime.indexOf("T");
              fechaCreacionFinal = FechaCreacionDatetime.substring(0, FechaCreacionNueva);
              if (moment(fecha).isSame(fechaCreacionFinal)) {
                this.facturaCompraMPService.srvObtenerLista().subscribe(datos_facturaMP => {
                  for (let j = 0; j < datos_facturaMP.length; j++) {
                    if (datos_factura[i].facco_Id == datos_facturaMP[j].facco_Id && datos_materiPrima[index].matPri_Id == datos_facturaMP[j].matPri_Id) {
                      const matCant : any = {
                        materiaPrima : datos_materiPrima[index].matPri_Id,
                        cantidad : datos_facturaMP[j].faccoMatPri_Cantidad,
                      }
                      materia_cantidad_factura.push(matCant);
                    }
                  }
                });
              }
            }
          });

          this.remisionService.srvObtenerLista().subscribe(datos_remisiones => {
            for (let i = 0; i < datos_remisiones.length; i++) {
              let FechaCreacionDatetime = datos_remisiones[i].rem_Fecha;
              let FechaCreacionNueva = FechaCreacionDatetime.indexOf("T");
              fechaCreacionFinal = FechaCreacionDatetime.substring(0, FechaCreacionNueva);
              if (moment(fecha).isSame(fechaCreacionFinal)) {
                this.remisionMpService.srvObtenerLista().subscribe(datos_remisionesMP => {
                  for (let j = 0; j < datos_remisionesMP.length; j++) {
                    if (datos_remisiones[i].rem_Id == datos_remisionesMP[j].rem_Id && datos_remisionesMP[j].matPri_Id == datos_materiPrima[index].matPri_Id) {
                      const matCant : any = {
                        materiaPrima : datos_materiPrima[index].matPri_Id,
                        cantidad : datos_remisionesMP[j].remiMatPri_Cantidad,
                      }
                      materia_cantidad_remision.push(matCant);
                    }
                  }
                });
              }
            }
          });

          this.recuperadoService.srvObtenerLista().subscribe(datos_recuperado => {
            for (let i = 0; i < datos_recuperado.length; i++) {
              let FechaCreacionDatetime = datos_recuperado[i].recMp_FechaIngreso;
              let FechaCreacionNueva = FechaCreacionDatetime.indexOf("T");
              fechaCreacionFinal = FechaCreacionDatetime.substring(0, FechaCreacionNueva);
              if (moment(fecha).isSame(fechaCreacionFinal)) {
                this.recuperadoMPService.srvObtenerLista().subscribe(datos_recuperadoMP => {
                  for (let j = 0; j < datos_recuperadoMP.length; j++) {
                    if (datos_recuperado[i].recMp_Id == datos_recuperadoMP[j].recMp_Id && datos_recuperadoMP[j].matPri_Id == datos_materiPrima[index].matPri_Id) {
                      const matCant : any = {
                        materiaPrima : datos_materiPrima[index].matPri_Id,
                        cantidad : datos_recuperadoMP[j].recMatPri_Cantidad,
                      }
                      materia_cantidad_recuperado.push(matCant);
                    }
                  }
                });
              }
            }
          });
        }
      });

      setTimeout(() => {
        this.materiaPrimaService.srvObtenerLista().subscribe(datos_materiaPrima => {
          for (let index = 0; index < datos_materiaPrima.length; index++) {
            this.sumaSalida = 0;
            this.sumaEntrada = 0;
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
              datos_materiaPrima[index].matPri_Stock,
              this.sumaEntrada,
              this.sumaSalida,
              datos_materiaPrima[index].undMed_Id);
          }
        });
      }, 6000);
    } else if (fechaFinal != null) {
      this.facturaCompraService.srvObtenerLista().subscribe(datos_factura => {
        console.log(2)
        for (let index = 0; index < datos_factura.length; index++) {
          let FechaCreacionDatetime = datos_factura[index].facco_FechaFactura;
          let FechaCreacionNueva = FechaCreacionDatetime.indexOf("T");
          fechaCreacionFinal = FechaCreacionDatetime.substring(0, FechaCreacionNueva);
          if (moment(fechaCreacionFinal).isBetween(undefined, fechaFinal)){
            this.facturaCompraMPService.srvObtenerLista().subscribe(datos_facturaMp => {
              for (let i = 0; i < datos_facturaMp.length; i++) {
                if (datos_facturaMp[i].facco_Id == datos_factura[index].facco_Id) {
                  this.sumaEntrada = this.sumaEntrada + datos_facturaMp[i].faccoMatPri_Cantidad;
                  this.materiaPrimaService.srvObtenerListaPorId(datos_facturaMp[i].matPri_Id).subscribe(datos_materiasPrimas => {
                    this.cargarFormMpEnTablas(this.ArrayMateriaPrima,
                      datos_materiasPrimas.matPri_Id,
                      datos_materiasPrimas.matPri_Nombre,
                      datos_materiasPrimas.matPri_Precio,
                      datos_materiasPrimas.matPri_Stock,
                      this.sumaEntrada,
                      this.sumaSalida,
                      datos_materiasPrimas.undMed_Id)
                  });
                }
              }
            });
          }
        }
      });
    } else {
      this.materiaPrimaService.srvObtenerLista().subscribe(datos_materiasPrimas => {
        for (let index = 0; index < datos_materiasPrimas.length; index++) {
          const Toast = Swal.mixin({
            toast: true,
            position: 'center',
            showConfirmButton: false,
            timer: 1000,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.addEventListener('mouseenter', Swal.stopTimer)
              toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
          })

          Toast.fire({
            icon: 'success',
            title: 'Consulta exitosa'
          });
          this.cargarFormMpEnTablas(this.ArrayMateriaPrima, datos_materiasPrimas[index].matPri_Id, datos_materiasPrimas[index].matPri_Nombre, datos_materiasPrimas[index].matPri_Precio, datos_materiasPrimas[index].matPri_Stock, this.sumaEntrada, this.sumaSalida, datos_materiasPrimas[index].undMed_Id)
        }
      });
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
