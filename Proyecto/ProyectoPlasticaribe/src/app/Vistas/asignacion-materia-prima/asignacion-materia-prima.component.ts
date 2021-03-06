import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { AreaService } from 'src/app/Servicios/area.service';
import { AsignacionMPService } from 'src/app/Servicios/asignacionMP.service';
import { BagproService } from 'src/app/Servicios/Bagpro.service';
import { CategoriaMateriaPrimaService } from 'src/app/Servicios/categoriaMateriaPrima.service';
import { DetallesAsignacionService } from 'src/app/Servicios/detallesAsignacion.service';
import { DetallesAsignacionTintasService } from 'src/app/Servicios/detallesAsignacionTintas.service';
import { EstadosService } from 'src/app/Servicios/estados.service';
import { FacturaMpService } from 'src/app/Servicios/facturaMp.service';
import { FactuaMpCompradaService } from 'src/app/Servicios/facturaMpComprada.service';
import { MateriaPrimaService } from 'src/app/Servicios/materiaPrima.service';
import { MpProveedorService } from 'src/app/Servicios/MpProveedor.service';
import { ProcesosService } from 'src/app/Servicios/procesos.service';
import { ProveedorService } from 'src/app/Servicios/proveedor.service';
import { RolesService } from 'src/app/Servicios/roles.service';
import { TintasService } from 'src/app/Servicios/tintas.service';
import { TipoEstadosService } from 'src/app/Servicios/tipo-estados.service';
import { TipoBodegaService } from 'src/app/Servicios/tipoBodega.service';
import { TipoDocumentoService } from 'src/app/Servicios/tipoDocumento.service';
import { UnidadMedidaService } from 'src/app/Servicios/unidad-medida.service';
import { UsuarioService } from 'src/app/Servicios/usuario.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-asignacion-materia-prima',
  templateUrl: './asignacion-materia-prima.component.html',
  styleUrls: ['./asignacion-materia-prima.component.css']
})
export class AsignacionMateriaPrimaComponent implements OnInit {

  public FormMateriaPrimaFactura !: FormGroup;
  public FormMateriaPrima !: FormGroup;
  public FormMateriaPrimaRetiro !: FormGroup;
  public FormMateriaPrimaRetirada !: FormGroup;

  /* Vaiables*/
  storage_Id : number; //Variable que se usar?? para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usar?? para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usar?? para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usar?? en la vista para validar el tipo de rol, si es tipo 2 tendr?? una vista algo diferente
  ultimoIdMateriaPrima : number; //Varibale que va a almacenar el id de la ultima materia prima registrada y le va a sumar 1
  materiasPrimas = []; //Variable que va almacenar el nombre de todas las materias primas existentes en la empresa
  materiasPrimasRetiradas = []; //Variable que va almacenar el nombre de todas las materias primas existentes en la empresa
  nombreCategoriasMP = []; //VAriable que va a almacenar el nombre de todas las categorias de materias primas existentes en la empresa
  unidadMedida = []; //Varibale que va a almacenar las unidades de medida registradas en la base de datos
  usuarios = []; //Variable que va a almacenar todos los usuarios de la empresa
  estado = []; //Variable que va a almacenar todos los tipos de estados de documentos
  procesos = []; //Variable que va a almacenar los procesos que tiene la empresa (extrusio, impresion, etc...)
  areas = []; //Varibale que va a almacenar las areas de la empresa
  materiaPrimaBuscadaId = []; //Variable que almacenar?? la informacion de la materia prima buscada por ID
  categoriaMPBuscadaID : string; //Variable que almacenar?? el nombre de la categoria de la materia prima buscada por Id
  tipobodegaMPBuscadaId : string; //Variable que almacenar?? el nombrede la bodega en la que se encuentra la materia prima buscada
  materiaPrimaSeleccionada = []; //Variable que almacenar?? la informacion de la materia prima seleccionada
  categoriaMPSeleccionada : string; //Variable que almacenar?? el nombre de la categoria de la materia prima seleccionada
  tipoBodegaMPSeleccionada : string; //Variable que almacenar?? el nombrede la bodega en la que se encuentra la materia prima seleccionada
  facturaMateriaPrima = []; //Funcion que guardar?? la informacion de la factura de materia prima comprada que ha sido consultada
  today : any = new Date(); //Variable que se usar?? para llenar la fecha actual
  titulosTabla = []; //Variable que almacenar?? los titulos de la tabla de productos que se ve al final de la vista
  ArrayMateriaPrima : any [] = []; //Variable que tendr?? la informacion de los productos que se piden en el nuevo pedido
  ArrayMateriaPrimaRetirada : any [] = []; //Variable que tendr?? la informacion de los productos que se piden para uan OT
  AccionBoton = "Agregar"; //Variable que almanar?? informacio para saber si una materia prima est?? en edicion o no (Se editar?? una materia prima cargada en la tabla, no una en la base de datos)
  valorTotal : number = 0; //Variable que guardar?? el valor total de la factura de entrada de materia prima
  nombreMateriaPrima : string; //Varible que almacenar?? el nombre de una materia prima consultado o seleccionado
  precioOT : number; //Variable que va a almacenar el precio de la ot consultada
  cantidadTotalExt : number; //Variable que va a almacenar el total de la cantidad extruida en una OT
  cantidadTotalImp : number; //Variable que va a almacenar el total de la cantidad impresa en una OT
  cantidadTotalDbl : number; //Variable que va a almacenar el total de la cantidad doblada en una OT
  proceso : string = ''; //Variable ayudar?? a almacenar el proceso del cuela se est?? consultando la ot
  proveedor = [];
  tipodocuemnto = [];
  totalPorcentajePerida : number; //Variable que ayudar?? a calcular el total de perdida en una OT
  ultimoId : number = 0;

  kgOT : number;
  cantidadAsignada : number = 0;
  cantRestante : number = 0;

  public load: boolean;

  /* CONSULTAS DE MATERIA PRIMA */
  MpConsultada = [];

  acumuladoraTintas = 0;

  categoria = 0; // Variable para identificar a que categoria pertenece la materia prima que se ha introduciodo en la tabla

  constructor(private materiaPrimaService : MateriaPrimaService,
                private categoriMpService : CategoriaMateriaPrimaService,
                  private tipoBodegaService : TipoBodegaService,
                    private unidadMedidaService : UnidadMedidaService,
                      private estadoService : EstadosService,
                        private tipoEstadoService : TipoEstadosService,
                          private usuarioService : UsuarioService,
                            private procesosService : ProcesosService,
                              private areasService : AreaService,
                                private rolService : RolesService,
                                  private frmBuilderMateriaPrima : FormBuilder,
                                    @Inject(SESSION_STORAGE) private storage: WebStorageService,
                                      private proveedorMPService : MpProveedorService,
                                        private asignacionMPService : AsignacionMPService,
                                          private detallesAsignacionService : DetallesAsignacionService,
                                            private bagProServices : BagproService,
                                              private tintasService : TintasService,
                                                private detallesAsignacionTintas : DetallesAsignacionTintasService) {

    this.FormMateriaPrimaRetiro = this.frmBuilderMateriaPrima.group({
      OTRetiro : ['', Validators.required],
      FechaRetiro : ['', Validators.required],
      Maquina : ['', Validators.required],
      UsuarioRetiro : ['', Validators.required],
      kgOt : ['', Validators.required],
      EstadoRetiro : ['', Validators.required],
      ObservacionRetiro : ['', Validators.required],
    });

    this.FormMateriaPrimaRetirada = this.frmBuilderMateriaPrima.group({
      MpIdRetirada : ['', Validators.required],
      MpNombreRetirada: ['', Validators.required],
      MpCantidadRetirada : ['', Validators.required],
      MpPrecioRetirada: ['', Validators.required],
      MpUnidadMedidaRetirada: ['', Validators.required],
      MpStockRetirada: ['', Validators.required],
      ProcesoRetiro : ['', Validators.required],
    });

    this.load = true;
  }

  ngOnInit(): void {
    this.lecturaStorage();
    this.fecha();
    this.ColumnasTabla();
    this.obtenerUnidadMedida();
    this.obtenerProcesos();
    this.obtenerMateriasPrimasRetiradas();
    this.obtenerTintas();
  }

  //Funcion que colocar?? la fecha actual y la colocar?? en el campo de fecha de pedido
  fecha(){
    this.today = new Date();
    var dd : any = this.today.getDate();
    var mm : any = this.today.getMonth() + 1;
    var yyyy : any = this.today.getFullYear();
    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
    this.today = yyyy + '-' + mm + '-' + dd;

    this.FormMateriaPrimaRetiro = this.frmBuilderMateriaPrima.group({
      OTRetiro : '',
      FechaRetiro : this.today,
      Maquina : '',
      UsuarioRetiro : '',
      kgOt : '',
      EstadoRetiro : '',
      ObservacionRetiro : '',
    });
  }

  //Funcion que leer?? la informacion que se almacenar?? en el storage del navegador
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

  // Funcion que colcar?? la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = '$1,';
    return number.toString().replace(exp,rep);
  }

  /* FUNCION PARA RELIZAR CONFIMACI??N DE SALIDA */
  confimacionSalida(){
    Swal.fire({
      title: '??Seguro que desea salir?',
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: 'Salir',
      denyButtonText: `No Salir`,
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) window.location.href = "./";
    })
  }

  // Funcion que limpia los todos los campos de la vista
  LimpiarCampos() {
    this.FormMateriaPrimaRetirada.reset();
  }

  //Funcion que limpiar?? los campos de la materia pirma entrante
  limpiarCamposMP(){
    this.FormMateriaPrimaRetiro = this.frmBuilderMateriaPrima.group({
      OTRetiro : '',
      FechaRetiro : this.today,
      Maquina : '',
      UsuarioRetiro : '',
      kgOt : '',
      EstadoRetiro : '',
      ObservacionRetiro : '',
    });
    this.FormMateriaPrimaRetirada.reset();
    this.ArrayMateriaPrimaRetirada = [];
  }

  //Funcion que va a recorrer las materias primas para almacenar el nombre de todas
  obtenerMateriasPrimasRetiradas(){
    this.categoria = 0;
    this.materiaPrimaService.srvObtenerLista().subscribe(datos_materiaPrima => {
      for (let index = 0; index < datos_materiaPrima.length; index++) {
        this.materiasPrimasRetiradas.push(datos_materiaPrima[index].matPri_Nombre);
      }
    });
  }

  obtenerTintas(){
    this.categoria = 0;
    this.tintasService.srvObtenerLista().subscribe(datos_tintas => {
      for (let i = 0; i < datos_tintas.length; i++) {
        this.materiasPrimasRetiradas.push(datos_tintas[i].tinta_Nombre);
      }
    });
  }

  //Funcion que va almacenar todas las unidades de medida existentes en la empresa
  obtenerUnidadMedida(){
    this.unidadMedidaService.srvObtenerLista().subscribe(datos_unidadesMedida => {
      for (let index = 0; index < datos_unidadesMedida.length; index++) {
        this.unidadMedida.push(datos_unidadesMedida[index].undMed_Id);
      }
    });
  }

  //Funcion que se encagar?? de obtener los procesos de la empresa
  obtenerProcesos(){
    this.procesosService.srvObtenerLista().subscribe(datos_procesos => {
      for (let index = 0; index < datos_procesos.length; index++) {
        if (datos_procesos[index].proceso_Id == 'TINTAS') continue;
        else this.procesos.push(datos_procesos[index]);
      }
    });
  }

  //Funcion que colocar?? el nombre a las columnas de la tabla en la cual se muestran los productos pedidos por los clientes
  ColumnasTabla(){
    this.titulosTabla = [];
    this.titulosTabla = [{
      mpId : "Id",
      mpNombre : "Nombre",
      mpCantidad : "Cantidad",
      mpUndMedCant : "Und. Cant",
      mpPrecioU : "Precio U",
      mpSubTotal : "SubTotal",
      mpProceso : "Proceso",
    }]
  }

  //Funcion que asignar?? la materia prima a una Orden de trabajo y Proceso y lo guardar?? en la base de datos
  asignacionMateriaPrima(){
    this.infoOT();
    let idOrdenTrabajo : number = this.FormMateriaPrimaRetiro.value.OTRetiro;
    let fechaEntrega : any = this.FormMateriaPrimaRetiro.value.FechaRetiro;
    let observacion : string = this.FormMateriaPrimaRetiro.value.ObservacionRetiro;
    let maquina : number = this.FormMateriaPrimaRetiro.value.Maquina;
    let idUsuario : number;
    let idArea : number;
    let idEstado : number;
    let cantidadadicional: number = this.kgOT * 0.1;
    let cantidadFinal : number = cantidadadicional + this.kgOT;
    let cantAsig : number = 0; //Variable que almacena la cantidad de materia prima que se ha asignado hasta el momento
    let cantRestante : number = 0;
    this.cantidadAsignada = 0;

    // const datosAsignacion : any = {
    //   AsigMP_OrdenTrabajo : idOrdenTrabajo,
    //   AsigMp_FechaEntrega : fechaEntrega,
    //   AsigMp_Observacion : observacion,
    //   Estado_Id : 13,
    //   AsigMp_Maquina : maquina,
    //   Usua_Id : this.storage_Id,
    // }
    // this.asignacionMPService.srvGuardar(datosAsignacion).subscribe(datos_asignacionCreada => {
    //   this.obtenerUltimoIdAsignacaion();
    // });

    this.asignacionMPService.srvObtenerListaPorOt(idOrdenTrabajo).subscribe(datos_asigncaion => {
      for (let index = 0; index < datos_asigncaion.length; index++) {
        this.detallesAsignacionService.srvObtenerLista().subscribe(datos_asignacionMP => {
          for (let i = 0; i < datos_asignacionMP.length; i++) {
            if (datos_asigncaion[index].asigMp_Id == datos_asignacionMP[i].asigMp_Id) {
              cantAsig = cantAsig + datos_asignacionMP[i].dtAsigMp_Cantidad;
              this.cantidadAsignada = this.cantidadAsignada + datos_asignacionMP[i].dtAsigMp_Cantidad;
            }
          }
        });
      }
    });

    setTimeout(() => {
      this.load = false;
      if (this.cantidadAsignada <= this.cantRestante) {
        const datosAsignacion : any = {
          AsigMP_OrdenTrabajo : idOrdenTrabajo,
          AsigMp_FechaEntrega : fechaEntrega,
          AsigMp_Observacion : observacion,
          Estado_Id : 13,
          AsigMp_Maquina : maquina,
          Usua_Id : this.storage_Id,
        }
        this.asignacionMPService.srvGuardar(datosAsignacion).subscribe(datos_asignacionCreada => {
          this.obtenerUltimoIdAsignacaion();
        });
      } else {
        this.load = true;
        Swal.fire(`La cantidad a asignar supera el limete de Kg permitidos para la OT ${idOrdenTrabajo}`);
      }
    }, 2000);
  }

  //Funcion que va a buscar y obtener el id de la ultima asignacion
  obtenerUltimoIdAsignacaion(){
    let idsAsignaciones = [];
    this.asignacionMPService.srvObtenerLista().subscribe(datos_asignaciones => {
      for (let index = 0; index < datos_asignaciones.length; index++) {
        idsAsignaciones.push(datos_asignaciones[index].asigMp_Id);
      }
      let ultimoId : number = Math.max.apply(null, idsAsignaciones);
      this.obtenerProcesoId(ultimoId);
    });
  }

  obtenerProcesoId(asigncaion : number){
    for (let index = 0; index < this.ArrayMateriaPrimaRetirada.length; index++) {
      this.procesosService.srvObtenerLista().subscribe(datos_proceso => {
        for (let i = 0; i < datos_proceso.length; i++) {
          if (datos_proceso[i].proceso_Nombre == this.ArrayMateriaPrimaRetirada[index].Proceso) {
            let idMateriaPrima = this.ArrayMateriaPrimaRetirada[index].Id;
            let cantidadMateriaPrima = this.ArrayMateriaPrimaRetirada[index].Cant;
            let presentacionMateriaPrima = this.ArrayMateriaPrimaRetirada[index].UndCant;
            let proceso : string = datos_proceso[i].proceso_Id;
            this.detallesAsignacionMP(asigncaion,
                                      idMateriaPrima,
                                      cantidadMateriaPrima,
                                      presentacionMateriaPrima,
                                      proceso);
          }
        }
      });
    }
  }

  infoOT(){
    let ot : string = this.FormMateriaPrimaRetiro.value.OTRetiro;
    let cantidadadicional: number = this.kgOT * 0.1;
    let cantidadFinal : number = cantidadadicional + this.kgOT;
    this.cantRestante = 0;
    let cantAsig : number = 0; //Variable que almacena la cantidad de materia prima que se ha asignado hasta el momento

    this.load = false;
    this.bagProServices.srvObtenerListaClienteOT_Item(ot).subscribe(datos_procesos => {
      if (datos_procesos.length != 0) {
        for (let index = 0; index < datos_procesos.length; index++) {
          this.kgOT = datos_procesos[index].datosotKg;
          this.FormMateriaPrimaRetiro.setValue({
            OTRetiro : this.FormMateriaPrimaRetiro.value.OTRetiro,
            FechaRetiro : this.FormMateriaPrimaRetiro.value.FechaRetiro,
            Maquina : this.FormMateriaPrimaRetiro.value.Maquina,
            UsuarioRetiro : this.FormMateriaPrimaRetiro.value.UsuarioRetiro,
            kgOt : this.kgOT,
            EstadoRetiro : this.FormMateriaPrimaRetiro.value.EstadoRetiro,
            ObservacionRetiro : this.FormMateriaPrimaRetiro.value.ObservacionRetiro,
          });
          this.asignacionMPService.srvObtenerListaPorOt(ot).subscribe(datos_asignaciones => {
            if (datos_asignaciones.length != 0) {
              for (let index = 0; index < datos_asignaciones.length; index++) {
                if (datos_asignaciones[index].asigMP_OrdenTrabajo == ot) {
                  this.detallesAsignacionService.srvObtenerListaPorAsigId(datos_asignaciones[index].asigMp_Id).subscribe(datos_asignacionMp => {
                    for (let i = 0; i < datos_asignacionMp.length; i++) {
                      cantAsig = cantAsig + datos_asignacionMp[i].dtAsigMp_Cantidad;
                    }
                  });
                }
              }
            }
          });
          setTimeout(() => {
            this.cantRestante = this.kgOT - cantAsig;
            this.load = true;
          }, 1000);
          break;
        }
      } else {
        Swal.fire(`La orden de trabajo N?? ${ot} no se encuentra registrada en BagPro`);
        this.load = true;
      }
    });
  }

  validarCamposVaciosRetirada(){
    let ot : string = this.FormMateriaPrimaRetiro.value.OTRetiro;
    if (this.FormMateriaPrimaRetiro.valid) this.asignacionMateriaPrima();
    else if (ot.length < 6) Swal.fire("La OT debe tener mas de 6 digitos");
    else Swal.fire("Hay campos de la Materia Prima vacios");
  }

  //Funcion que almacenar?? de forma detalla la(s) materia prima que se est??n asignando a una OT y Proceso
  detallesAsignacionMP(idAsignacion : number, idMp : number, cantidad : number, presentacion : string, proceso : string){

    if (this.ArrayMateriaPrimaRetirada.length == 0) Swal.fire("Debe cargar minimo una materia prima en la tabla")
    else {
      if (proceso == 'IMP' || proceso == 'ROT') {
        const datosDetallesAsignacionTintas : any = {
          AsigMp_Id : idAsignacion,
          Tinta_Id : idMp,
          DtAsigTinta_Cantidad : cantidad,
          UndMed_Id : presentacion,
          Proceso_Id : proceso,
        }

        this.detallesAsignacionTintas.srvGuardar(datosDetallesAsignacionTintas).subscribe(datos_asignacionTintas => {});
        this.moverInventarioTintas(idMp, cantidad);

      } else {
        const datosDetallesAsignacion : any = {
          AsigMp_Id : idAsignacion,
          MatPri_Id : idMp,
          DtAsigMp_Cantidad : cantidad,
          UndMed_Id : presentacion,
          Proceso_Id : proceso,
        }

        this.detallesAsignacionService.srvGuardar(datosDetallesAsignacion).subscribe(datos_asignacionDtallada => {
        });
        this.moverInventarioMpPedida(idMp, cantidad);
      }
    }
  }

  //
  validarCamposVaciosMPRetirada(){
    if (this.FormMateriaPrimaRetirada.valid) this.cargarFormMpRetiradaTablas(this.ArrayMateriaPrimaRetirada)
    else Swal.fire("Hay campos de la Materia Prima vacios")
  }

  // // Funcion que envia la informacion de la materia prima pedida a la tabla.
  cargarFormMpRetiradaTablas(formulario : any){
    let idMateriaPrima : number = this.FormMateriaPrimaRetirada.value.MpIdRetirada;
    this.nombreMateriaPrima = this.FormMateriaPrimaRetirada.value.MpNombreRetirada;
    let precioMateriaPrima : number = this.FormMateriaPrimaRetirada.value.MpPrecioRetirada;
    let presentacion : string = this.FormMateriaPrimaRetirada.value.MpUnidadMedidaRetirada;
    let cantidad : number = this.FormMateriaPrimaRetirada.value.MpCantidadRetirada;
    let stock : number = this.FormMateriaPrimaRetirada.value.MpStockRetirada;
    let subtotalProd : number = precioMateriaPrima * cantidad;
    let proceso : string = this.FormMateriaPrimaRetirada.value.ProcesoRetiro;

    this.cantidadAsignada = this.cantidadAsignada + cantidad;

    this.procesosService.srvObtenerLista().subscribe(datos_proceso => {
      for (let i = 0; i < datos_proceso.length; i++) {
        if (datos_proceso[i].proceso_Nombre == proceso) {

          if (this.categoria == 7) {
            if (proceso == 'Impresion' || proceso == 'Rotograbado') {
              if (cantidad <= stock) {
                let productoExt : any = {
                  Id : idMateriaPrima,
                  Nombre : this.nombreMateriaPrima,
                  Cant : cantidad,
                  UndCant : presentacion,
                  PrecioUnd : precioMateriaPrima,
                  Stock : this.FormMateriaPrimaRetirada.value.MpStockRetirada,
                  SubTotal : subtotalProd,
                  Proceso : datos_proceso[i].proceso_Nombre,
                }

                if (this.AccionBoton == "Agregar" && this.ArrayMateriaPrimaRetirada.length == 0) {
                  this.ArrayMateriaPrimaRetirada.push(productoExt);

                } else if (this.AccionBoton == "Agregar" && this.ArrayMateriaPrimaRetirada.length != 0){
                  this.ArrayMateriaPrimaRetirada.push(productoExt);
                  productoExt = [];
                } else {
                  for (let index = 0; index < formulario.length; index++) {
                    if(productoExt.Id == this.ArrayMateriaPrimaRetirada[index].Id) {
                      this.ArrayMateriaPrimaRetirada.splice(index, 1);
                      this.AccionBoton = "Agregar";
                      this.ArrayMateriaPrimaRetirada.push(productoExt);
                      break;
                    }
                  }
                }

                this.FormMateriaPrimaRetirada.setValue({
                  MpIdRetirada : '',
                  MpNombreRetirada: '',
                  MpCantidadRetirada : '',
                  MpPrecioRetirada: '',
                  MpUnidadMedidaRetirada: '',
                  MpStockRetirada: '',
                  ProcesoRetiro : '',
                });
                this.ArrayMateriaPrimaRetirada.sort((a,b)=> Number(a.PrecioUnd) - Number(b.PrecioUnd));
              } else Swal.fire("La cantidad a asignar no debe superar lo que hay en stock ");
            } else Swal.fire("Las tintas Solo pueden ir a los procesos de Impresi??n y Rotograbado");
          } else {
            if (cantidad <= stock) {
              let productoExt : any = {
                Id : idMateriaPrima,
                Nombre : this.nombreMateriaPrima,
                Cant : cantidad,
                UndCant : presentacion,
                PrecioUnd : precioMateriaPrima,
                Stock : this.FormMateriaPrimaRetirada.value.MpStockRetirada,
                SubTotal : subtotalProd,
                Proceso : datos_proceso[i].proceso_Nombre,
              }

              if (this.AccionBoton == "Agregar" && this.ArrayMateriaPrimaRetirada.length == 0) {
                this.ArrayMateriaPrimaRetirada.push(productoExt);

              } else if (this.AccionBoton == "Agregar" && this.ArrayMateriaPrimaRetirada.length != 0){
                this.ArrayMateriaPrimaRetirada.push(productoExt);
                productoExt = [];
              } else {
                for (let index = 0; index < formulario.length; index++) {
                  if(productoExt.Id == this.ArrayMateriaPrimaRetirada[index].Id) {
                    this.ArrayMateriaPrimaRetirada.splice(index, 1);
                    this.AccionBoton = "Agregar";
                    this.ArrayMateriaPrimaRetirada.push(productoExt);
                    break;
                  }
                }
              }

              this.FormMateriaPrimaRetirada.setValue({
                MpIdRetirada : '',
                MpNombreRetirada: '',
                MpCantidadRetirada : '',
                MpPrecioRetirada: '',
                MpUnidadMedidaRetirada: '',
                MpStockRetirada: '',
                ProcesoRetiro : '',
              });
              this.ArrayMateriaPrimaRetirada.sort((a,b)=> Number(a.PrecioUnd) - Number(b.PrecioUnd));
            } else Swal.fire("La cantidad a asignar no debe superar lo que hay en stock ");
          }
          break;
        }
      }
    })
  }

  //Funcion que mover?? el inventario de materia prima con base a la materia prima saliente
  moverInventarioMpPedida(idMateriaPrima : number, cantidadMateriaPrima : number){
    let stockMateriaPrimaInicial : number;
    let stockMateriaPrimaFinal : number;

    this.materiaPrimaService.srvObtenerListaPorId(idMateriaPrima).subscribe(datos_materiaPrima => {
      stockMateriaPrimaInicial = datos_materiaPrima.matPri_Stock;
      stockMateriaPrimaFinal = stockMateriaPrimaInicial - cantidadMateriaPrima;
      const datosMP : any = {
        MatPri_Id : idMateriaPrima,
        MatPri_Nombre : datos_materiaPrima.matPri_Nombre,
        MatPri_Descripcion : datos_materiaPrima.matPri_Descripcion,
        MatPri_Stock : stockMateriaPrimaFinal,
        UndMed_Id : datos_materiaPrima.undMed_Id,
        CatMP_Id : datos_materiaPrima.catMP_Id,
        MatPri_Precio : datos_materiaPrima.matPri_Precio,
        TpBod_Id : datos_materiaPrima.tpBod_Id,
      }
      this.materiaPrimaService.srvActualizar(idMateriaPrima, datosMP).subscribe(datos_mp_creada => {});
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
        title: '??Registro de Asignaci??n creado con exito!'
      });
      this.FormMateriaPrimaRetiro = this.frmBuilderMateriaPrima.group({
        OTRetiro : '',
        FechaRetiro : this.today,
        Maquina : '',
        UsuarioRetiro : '',
        kgOt : '',
        EstadoRetiro : '',
        ObservacionRetiro : '',
      });
      this.ArrayMateriaPrimaRetirada= [];
      this.FormMateriaPrimaRetirada.reset();
      this.load = true;
    });
  }

  moverInventarioTintas(idMateriaPrima : number, cantidad : number){
    let stockTintaInicial : number;
    let stockTintaFinal : number;

    this.tintasService.srvObtenerListaPorId(idMateriaPrima).subscribe(datos_tintas => {
      stockTintaInicial = datos_tintas.tinta_Stock;
      stockTintaFinal = stockTintaInicial - cantidad;

      const datosTintas : any = {
        Tinta_Id: idMateriaPrima,
        Tinta_Nombre : datos_tintas.tinta_Nombre,
        Tinta_Descripcion : datos_tintas.tinta_Descripcion,
        Tinta_CodigoHexadecimal : datos_tintas.tinta_CodigoHexadecimal,
        Tinta_Stock : stockTintaFinal,
        UndMed_Id : datos_tintas.undMed_Id,
        Tinta_Precio : datos_tintas.tinta_Precio,
        CatMP_Id : datos_tintas.catMP_Id,
        TpBod_Id : datos_tintas.tpBod_Id,
      }

      this.tintasService.srvActualizar(idMateriaPrima, datosTintas).subscribe(datos_tintasActualizada => {});
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
        title: '??Registro de Asignaci??n creado con exito!'
      });
      this.FormMateriaPrimaRetiro = this.frmBuilderMateriaPrima.group({
        OTRetiro : '',
        FechaRetiro : this.today,
        Maquina : '',
        UsuarioRetiro : '',
        kgOt : '',
        EstadoRetiro : '',
        ObservacionRetiro : '',
      });
      this.ArrayMateriaPrimaRetirada= [];
      this.FormMateriaPrimaRetirada.reset();
      this.load = true;
    });
  }

  //Funcion que consultara una materia prima con base a un ID pasado en la vista
  buscarMpId(){
    let idMateriaPrima : number = this.FormMateriaPrimaRetirada.value.MpIdRetirada;
    this.materiaPrimaSeleccionada = [];
    this.categoriaMPBuscadaID = '';
    this.tipobodegaMPBuscadaId = '';
    this.categoria = 0;

    this.materiaPrimaService.srvObtenerListaPorId(idMateriaPrima).subscribe(datos_materiaPrima => {
      this.categoriMpService.srvObtenerListaPorId(datos_materiaPrima.catMP_Id).subscribe(datos_categoria => {
        this.tipoBodegaService.srvObtenerListaPorId(datos_materiaPrima.tpBod_Id).subscribe(datos_bodega => {
          this.materiaPrimaSeleccionada.push(datos_materiaPrima);
          this.materiasPrimas.push(datos_materiaPrima);
          this.categoriaMPBuscadaID = datos_categoria.catMP_Nombre;
          this.tipobodegaMPBuscadaId = datos_bodega.tpBod_Nombre;
          this.categoria = datos_materiaPrima.catMP_Id;
          this.cargarInfoMP();
        });
      });
    });


    this.tintasService.srvObtenerListaPorId(idMateriaPrima).subscribe(datos_tintas => {
      this.materiaPrimaSeleccionada.push(datos_tintas);
      this.categoria = datos_tintas.catMP_Id;
      this.cargarInfoMP();
    });
  }

  //Funcion que consultara una materia prima con base a la que est?? seleccionada en la vista
  buscarMpSeleccionada(){
    let nombreMateriaPrima : string = this.FormMateriaPrimaRetirada.value.MpNombreRetirada;
    let idMateriaPrima : number; //En el HTML se pasar?? el nombre de la materia prima pero el input tendr?? como valor el Id de la materia prima
    this.materiaPrimaSeleccionada = [];
    this.categoria = 0;

    this.materiaPrimaService.srvObtenerLista().subscribe(datos_materiasPrimas => {
      for (let index = 0; index < datos_materiasPrimas.length; index++) {
        if (datos_materiasPrimas[index].matPri_Nombre == nombreMateriaPrima) {
          this.categoriMpService.srvObtenerListaPorId(datos_materiasPrimas[index].catMP_Id).subscribe(datos_categoria => {
            this.tipoBodegaService.srvObtenerListaPorId(datos_materiasPrimas[index].tpBod_Id).subscribe(datos_bodega => {
              this.materiaPrimaSeleccionada.push(datos_materiasPrimas[index]);
              this.categoriaMPSeleccionada = datos_categoria.catMP_Nombre;
              this.tipoBodegaMPSeleccionada = datos_bodega.tpBod_Nombre;
              this.categoria = datos_materiasPrimas[index].catMP_Id;
              this.cargarInfoMP();
            });
          });
        }
      }
    });

    this.tintasService.srvObtenerLista().subscribe(datos_tintas => {
      for (let i = 0; i < datos_tintas.length; i++) {
        if (nombreMateriaPrima == datos_tintas[i].tinta_Nombre) {
          this.materiaPrimaSeleccionada.push(datos_tintas[i]);
          this.categoria = datos_tintas[i].catMP_Id;
          this.cargarInfoMP();
        }
      }
    });
  }

  //Funcion que llenar?? la infomacion de materia prima buscada o seleccionada y pasar?? la informacion a la vista
  cargarInfoMP(){
    for (const Mp of this.materiaPrimaSeleccionada) {
      if (Mp.catMP_Id == 7) {
        this.FormMateriaPrimaRetirada.setValue({
          MpIdRetirada : Mp.tinta_Id,
          MpNombreRetirada: Mp.tinta_Nombre,
          MpCantidadRetirada : '',
          MpPrecioRetirada: Mp.tinta_Precio,
          MpUnidadMedidaRetirada: Mp.undMed_Id,
          MpStockRetirada: Mp.tinta_Stock,
          ProcesoRetiro : this.FormMateriaPrimaRetirada.value.ProcesoRetiro,
        });
      } else {
        this.FormMateriaPrimaRetirada.setValue({
          MpIdRetirada : Mp.matPri_Id,
          MpNombreRetirada: Mp.matPri_Nombre,
          MpCantidadRetirada : '',
          MpPrecioRetirada: Mp.matPri_Precio,
          MpUnidadMedidaRetirada: Mp.undMed_Id,
          MpStockRetirada: Mp.matPri_Stock,
          ProcesoRetiro : this.FormMateriaPrimaRetirada.value.ProcesoRetiro,
        });
      }
    }
  }

  // Funci??n para quitar un producto de la tabla
  QuitarProductoTabla(index : number, formulario : any) {
    Swal.fire({
      title: '??Est??s seguro de eliminar la Materia Prima de la Asignaci??n?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.ArrayMateriaPrimaRetirada.splice(index, 1);
        Swal.fire('Materia Prima eliminada');
      }
    });
  }

  // Funci??n para editar uno de los productos de la tabla
  EditarProductoTabla(formulario : any) {
    this.AccionBoton = "Editar";
    this.FormMateriaPrimaRetirada.patchValue({
      MpIdRetirada : formulario.Id,
      MpNombreRetirada: formulario.Nombre,
      MpCantidadRetirada : formulario.Cant,
      MpUnidadMedidaRetirada: formulario.UndCant,
      MpStockRetirada: formulario,
      ProcesoRetiro : formulario.Proceso

    });
  }

}
