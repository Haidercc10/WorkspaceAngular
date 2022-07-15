import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
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
import { RolesService } from 'src/app/Servicios/roles.service';
import { TipoEstadosService } from 'src/app/Servicios/tipo-estados.service';
import { TipoBodegaService } from 'src/app/Servicios/tipoBodega.service';
import { UnidadMedidaService } from 'src/app/Servicios/unidad-medida.service';
import { UsuarioService } from 'src/app/Servicios/usuario.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reporteMpOt',
  templateUrl: './reporteMpOt.component.html',
  styleUrls: ['./reporteMpOt.component.css']
})
export class ReporteMpOtComponent implements OnInit {

  public FormMateriaPrimaFactura !: FormGroup;
  public FormMateriaPrima !: FormGroup;
  public FormMateriaPrimaRetiro !: FormGroup;
  public FormMateriaPrimaRetirada !: FormGroup;

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
  clienteOT : string; //Variable que va a almacenar el cliente de la ot consultada
  cantidadTotalExt : number = 0; //Variable que va a almacenar el total de la cantidad extruida en una OT
  cantidadTotalImp : number = 0; //Variable que va a almacenar el total de la cantidad impresa en una OT
  cantidadTotalDbl : number = 0; //Variable que va a almacenar el total de la cantidad doblada en una OT
  cantidadTotalRot : number = 0; //Variable que va a almacenar el total de la cantidad Rotograbado en una OT
  cantidadTotalSella : number = 0; //Variable que va a almacenar el total de la cantidad sellada en una OT
  cantidadTotalEmpaque : number = 0; //Variable que va a almacenar el total de la cantidad empacada en una OT
  cantidadTotalCorte : number = 0; //Variable que va a almacenar el total de la cantidad cortada en una OT
  cantidadTotalLaminado : number = 0; //Variable que va a almacenar el total de la cantidad cantidad Total Laminado en una OT
  cantidadTotalWiketiado : number = 0; //Variable que va a almacenar el total de la cantidad cantidad Tota wiketeada en una OT
  proceso : string = ''; //Variable ayudará a almacenar el proceso del cuela se está consultando la ot
  totalPorcentajePerida : number = 0; //Variable que ayudará a calcular el total de perdida en una OT
  arrayOtConsultada = [];
  porcentajeTotal : number = 0;

  /* CONSULTAS DE MATERIA PRIMA */
  MpConsultada = [];

  constructor(private materiaPrimaService : MateriaPrimaService,
                private categoriMpService : CategoriaMateriaPrimaService,
                  private tipoBodegaService : TipoBodegaService,
                    private rolService : RolesService,
                      private frmBuilderMateriaPrima : FormBuilder,
                        @Inject(SESSION_STORAGE) private storage: WebStorageService,
                          private asignacionMPService : AsignacionMPService,
                            private detallesAsignacionService : DetallesAsignacionService,
                              private bagProServices : BagproService) {

    this.FormMateriaPrima = this.frmBuilderMateriaPrima.group({
      ot : new FormControl(),
    });
  }


  ngOnInit(): void {
    this.initForms();
    this.lecturaStorage();
    this.ColumnasTabla();
  }

  initForms() {
    this.FormMateriaPrima = this.frmBuilderMateriaPrima.group({
      ot : ['', Validators.required],
    });
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

  //Funcion que consultara una materia prima con base a la que está seleccionada en la vista
  buscarMpSeleccionada(){

    this.ArrayMateriaPrima = [];
    this.valorTotal = 0;
    let nombreMateriaPrima : string = this.FormMateriaPrima.value.MpNombre;
    let idMateriaPrima : number; //En el HTML se pasará el nombre de la materia prima pero el input tendrá como valor el Id de la materia prima
    this.materiaPrimaSeleccionada = [];

    this.materiaPrimaService.srvObtenerLista().subscribe(datos_materiasPrimas => {
      for (let index = 0; index < datos_materiasPrimas.length; index++) {
        if (datos_materiasPrimas[index].matPri_Nombre == nombreMateriaPrima) {
          this.categoriMpService.srvObtenerListaPorId(datos_materiasPrimas[index].catMP_Id).subscribe(datos_categoria => {
            this.tipoBodegaService.srvObtenerListaPorId(datos_materiasPrimas[index].tpBod_Id).subscribe(datos_bodega => {
              this.materiaPrimaSeleccionada.push(datos_materiasPrimas[index]);
              this.categoriaMPSeleccionada = datos_categoria.catMP_Nombre;
              this.tipoBodegaMPSeleccionada = datos_bodega.tpBod_Nombre;
              this.cargarFormMpEnTablas(this.ArrayMateriaPrima, datos_materiasPrimas[index].matPri_Id, datos_materiasPrimas[index].matPri_Nombre, datos_materiasPrimas[index].matPri_Precio, datos_materiasPrimas[index].matPri_Stock, datos_materiasPrimas[index].undMed_Id)
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
      oT : "OT",
      Cliente : "Cliente",
      Producto : "Producto",
      Materia_Prima : "Materia Prima",
      Proceso : "Proceso",
      mpCant : "Cant MP",
      valorMp : "Valor MP",
      porcentajeMp : "Porcentaje MP",
    }]
  }

  cargarFormMpEnTablas(formulario : any, id: number, nombre : string, precio : number, cantidad : number, undMEd : string){
    // let subtotalProd : number = precio * cantidad;

    // this.valorTotal = this.valorTotal + subtotalProd;

    // let productoExt : any = {
    //   Id : id,
    //   Nombre : nombre,
    //   Cant : cantidad,
    //   UndCant : undMEd,
    //   PrecioUnd : precio,
    //   SubTotal : subtotalProd
    // }

    // if (this.AccionBoton == "Agregar" && this.ArrayMateriaPrima.length == 0) {
    //   this.ArrayMateriaPrima.push(productoExt);

    // } else if (this.AccionBoton == "Agregar" && this.ArrayMateriaPrima.length != 0){
    //   this.ArrayMateriaPrima.push(productoExt);
    //   productoExt = [];
    // } else {
    //   for (let index = 0; index < formulario.length; index++) {
    //     if(productoExt.Id == this.ArrayMateriaPrima[index].Id) {
    //       this.ArrayMateriaPrima.splice(index, 1);
    //       this.ArrayMateriaPrima.push(productoExt);
    //       break;
    //     }
    //   }
    // }

    // this.ArrayMateriaPrima.sort((a,b)=> Number(a.Id) - Number(b.Id));
  }

  validarConsulta(){
    this.ArrayMateriaPrima = [];
    this.precioOT = 0;

    if (this.FormMateriaPrima.valid) {

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
          // this.cargarFormMpEnTablas(this.ArrayMateriaPrima, datos_materiasPrimas[index].matPri_Id, datos_materiasPrimas[index].matPri_Nombre, datos_materiasPrimas[index].matPri_Precio, datos_materiasPrimas[index].matPri_Stock, datos_materiasPrimas[index].undMed_Id)
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

  //Funcin que se encargará de buscar una OT
  consultaOTBagPro(){
    let ot : number = this.FormMateriaPrima.value.ot;
    this.bagProServices.srvObtenerListaClienteOT().subscribe(datos_OT => {
      for (let index = 0; index < datos_OT.length; index++) {
        if (datos_OT[index].item == ot) {
          this.precioOT = datos_OT[index].datosvalorOt;
          this.clienteOT = datos_OT[index].clienteNom;
          this.consultaProceso(ot);
          break;
        }
      }
    });
  }

  consultaProceso(ot : number){
    let cantExtruida : number;
    let cantImpresa : number;
    let cantSellada : number;
    let cantDoblada : number;
    let cantRotograbada : number;
    let cantWiketiado : number;

    this.bagProServices.srvObtenerListaProcExt().subscribe(datos_procesos => {
      for (let index = 0; index < datos_procesos.length; index++) {
        if (ot == datos_procesos[index].ot) {
          if (datos_procesos[index].nomStatus == "EXTRUSION") {
            cantExtruida = datos_procesos[index].extnetokg;
            this.cantidadTotalExt = cantExtruida + this.cantidadTotalExt;
          } else if (datos_procesos[index].nomStatus == "IMPRESION") {
            cantImpresa = datos_procesos[index].extnetokg;
            this.cantidadTotalImp = cantImpresa + this.cantidadTotalImp;
          } else if (datos_procesos[index].nomStatus == "DOBLADO") {
            cantDoblada = datos_procesos[index].extnetokg;
            this.cantidadTotalDbl = cantDoblada + this.cantidadTotalDbl;
          } else if (datos_procesos[index].nomStatus == "ROTOGRABADO") {
            cantRotograbada = datos_procesos[index].extnetokg;
            this.cantidadTotalRot = cantRotograbada + this.cantidadTotalRot;
          } else if (datos_procesos[index].nomStatus == "EMPAQUE") {
            cantRotograbada = datos_procesos[index].extnetokg;
            this.cantidadTotalEmpaque = cantRotograbada + this.cantidadTotalEmpaque;
          } else if (datos_procesos[index].nomStatus == "CORTE") {
            cantRotograbada = datos_procesos[index].extnetokg;
            this.cantidadTotalCorte = cantRotograbada + this.cantidadTotalCorte;
          } else if (datos_procesos[index].nomStatus == "LAMINADO") {
            cantRotograbada = datos_procesos[index].extnetokg;
            this.cantidadTotalLaminado = cantRotograbada + this.cantidadTotalLaminado;
          }
        }
      }
      this.bagProServices.srvObtenerListaProcSellado().subscribe(datos_selado => {
        for (let i = 0; i < datos_selado.length; i++) {
          if (datos_selado[i].ot == ot) {
            if (datos_selado[i].nomStatus == "SELLADO") {
              cantSellada = datos_selado[i].peso;
              this.cantidadTotalSella = cantSellada + this.cantidadTotalSella;
            } else if (datos_selado[i].nomStatus == "Wiketiado") {
              cantWiketiado = datos_selado[i].peso;
              this.cantidadTotalWiketiado = cantWiketiado + this.cantidadTotalWiketiado;
            }
          }
        }
        console.log(`Cantidad Sellado ${this.cantidadTotalSella}`);
        this.cantidadPorcPerdidaProcesoaProceso();
      });
      this.cantidadMpAsignada(ot);
    });
  }

  //Funcion que calcula y guarda la cantidad de perdida que hubo de un proceso a otro
  cantidadPorcPerdidaProcesoaProceso(){
    let diferenciaExt_Imp : number = 0;
    let difereciaExt_ImpPorcentaje : number = 0;

    let diferenciaImp_Dbld : number = 0;
    let difereciaImp_DbldPorcentaje : number = 0;

    let diferenciaDbld_Rot : number = 0;
    let difereciaDbld_RotPorcentaje : number = 0;

    let diferenciaDbld_Sell : number = 0;
    let difereciaDbld_SellPorcentaje : number = 0;

    let totalPerdida : number = 0;
    let totalPerdidaPorcentaje : number = 0;

    diferenciaExt_Imp = this.cantidadTotalExt - this.cantidadTotalImp;
    difereciaExt_ImpPorcentaje = (diferenciaExt_Imp / this.cantidadTotalExt) * 100;

    diferenciaImp_Dbld = this.cantidadTotalImp - this.cantidadTotalDbl;
    difereciaImp_DbldPorcentaje = (diferenciaImp_Dbld / this.cantidadTotalImp) * 100;

    diferenciaDbld_Rot = this.cantidadTotalDbl - this.cantidadTotalRot;
    difereciaDbld_RotPorcentaje = (diferenciaDbld_Rot / this.cantidadTotalDbl) * 100;

    diferenciaDbld_Sell = this.cantidadTotalDbl - this.cantidadTotalSella;
    difereciaDbld_SellPorcentaje = (diferenciaDbld_Sell / this.cantidadTotalDbl) * 100;

    totalPerdida = diferenciaExt_Imp + diferenciaImp_Dbld  + diferenciaDbld_Sell;
    totalPerdidaPorcentaje = difereciaExt_ImpPorcentaje + difereciaImp_DbldPorcentaje  + difereciaDbld_SellPorcentaje;

    console.log(`Diferencia de Extrusion a Impresion ${diferenciaExt_Imp}`);
    console.log(`Diferencia de impresion a doblado ${diferenciaImp_Dbld}`);
    console.log(`Diferencia de doblado a rotograbado ${diferenciaDbld_Rot}`);
    console.log(`Diferencia de doblado a sellado ${diferenciaDbld_Sell}`);

    console.log(difereciaExt_ImpPorcentaje +" %");
    console.log(difereciaImp_DbldPorcentaje+" %");
    console.log(difereciaDbld_RotPorcentaje+" %");
    console.log(difereciaDbld_SellPorcentaje+" %");

    console.log(`totalPerdida ${totalPerdida}`);
    console.log(totalPerdidaPorcentaje+" %");
  }

  cantidadMpAsignada(ot : number){
    let cantTotalAsignadaExt : number = 0;
    let cantTotalAsignadaImp : number = 0;
    let cantTotalAsignadaDbld : number = 0;
    let cantTotalAsignadaSellado : number = 0;
    let cantTotalAsignadaCorte : number = 0;
    let cantTotalAsignadaRot : number = 0;
    let cantTotalAsignadaEmpaque : number = 0;
    let cantTotalAsignadaLaminado : number = 0;
    let cantTotalAsignadaWiketiado : number = 0;

    this.asignacionMPService.srvObtenerLista().subscribe(datos_asignacion => {
      for (let asg = 0; asg < datos_asignacion.length; asg++) {
        if (datos_asignacion[asg].asigMP_OrdenTrabajo == ot) {
          this.detallesAsignacionService.srvObtenerLista().subscribe(datos_detallesAsignacion => {
            for (let index = 0; index < datos_detallesAsignacion.length; index++) {
              if (datos_detallesAsignacion[index].proceso_Id == 'EXT' && datos_detallesAsignacion[index].asigMp_Id == datos_asignacion[asg].asigMp_Id) {
                cantTotalAsignadaExt = cantTotalAsignadaExt + datos_detallesAsignacion[index].dtAsigMp_Cantidad
              } else if (datos_detallesAsignacion[index].proceso_Id == 'IMP' && datos_detallesAsignacion[index].asigMp_Id == datos_asignacion[asg].asigMp_Id) {
                cantTotalAsignadaImp = cantTotalAsignadaImp + datos_detallesAsignacion[index].dtAsigMp_Cantidad
              } else if (datos_detallesAsignacion[index].proceso_Id == 'SELLA' && datos_detallesAsignacion[index].asigMp_Id == datos_asignacion[asg].asigMp_Id) {
                cantTotalAsignadaSellado = cantTotalAsignadaSellado + datos_detallesAsignacion[index].dtAsigMp_Cantidad
              } else if (datos_detallesAsignacion[index].proceso_Id == 'ROT' && datos_detallesAsignacion[index].asigMp_Id == datos_asignacion[asg].asigMp_Id) {
                cantTotalAsignadaRot = cantTotalAsignadaRot + datos_detallesAsignacion[index].dtAsigMp_Cantidad
              } else if (datos_detallesAsignacion[index].proceso_Id == 'DBLD' && datos_detallesAsignacion[index].asigMp_Id == datos_asignacion[asg].asigMp_Id) {
                cantTotalAsignadaDbld = cantTotalAsignadaDbld + datos_detallesAsignacion[index].dtAsigMp_Cantidad
              } else if (datos_detallesAsignacion[index].proceso_Id == 'CORTE' && datos_detallesAsignacion[index].asigMp_Id == datos_asignacion[asg].asigMp_Id) {
                cantTotalAsignadaCorte = cantTotalAsignadaCorte + datos_detallesAsignacion[index].dtAsigMp_Cantidad
              } else if (datos_detallesAsignacion[index].proceso_Id == 'EMP' && datos_detallesAsignacion[index].asigMp_Id == datos_asignacion[asg].asigMp_Id) {
                cantTotalAsignadaEmpaque = cantTotalAsignadaEmpaque + datos_detallesAsignacion[index].dtAsigMp_Cantidad
              } else if (datos_detallesAsignacion[index].proceso_Id == 'LAM' && datos_detallesAsignacion[index].asigMp_Id == datos_asignacion[asg].asigMp_Id) {
                cantTotalAsignadaLaminado = cantTotalAsignadaLaminado + datos_detallesAsignacion[index].dtAsigMp_Cantidad
              } else if (datos_detallesAsignacion[index].proceso_Id == 'WIKE' && datos_detallesAsignacion[index].asigMp_Id == datos_asignacion[asg].asigMp_Id) {
                cantTotalAsignadaWiketiado = cantTotalAsignadaWiketiado + datos_detallesAsignacion[index].dtAsigMp_Cantidad
              }
            }
            this.calcularPorcentajePerdida(cantTotalAsignadaExt,
              cantTotalAsignadaImp,
              cantTotalAsignadaDbld,
              cantTotalAsignadaSellado,
              cantTotalAsignadaCorte,
              cantTotalAsignadaRot,
              cantTotalAsignadaEmpaque,
              cantTotalAsignadaLaminado,
              cantTotalAsignadaWiketiado);
          });
        }
      }
    });
  }

  calcularPorcentajePerdida(cantTotalAsignadaExt : number,
    cantTotalAsignadaImp : number,
    cantTotalAsignadaDbld : number,
    cantTotalAsignadaSellado : number,
    cantTotalAsignadaCorte : number,
    cantTotalAsignadaRot : number,
    cantTotalAsignadaEmpaque : number,
    cantTotalAsignadaLaminado : number,
    cantTotalAsignadaWiketiado : number){


      //Calcula la cantidad de materi prima que se perdio haciendo la orden de trabajo
      // let porcentaje_perdidaExt : number = 0;
      // let porcentaje_perdidaImp : number = 0;
      // let porcentaje_perdidaRot : number = 0;
      // let porcentaje_perdidaSell : number = 0;
      // let porcentaje_perdidaDbld : number = 0;
      // let porcentaje_perdidaEmp : number = 0;
      // let porcentaje_perdidaLam : number = 0;
      // let porcentaje_perdidaWik : number = 0;
      // let porcentaje_perdidaCorte : number = 0;

      // let perdidaExt : number = this.cantidadTotalExt - cantTotalAsignadaExt;

      // porcentaje_perdidaExt = ((perdidaExt * 100) / cantTotalAsignadaExt);
      // porcentaje_perdidaImp = ((this.cantidadTotalImp * 100) / cantTotalAsignadaImp);
      // porcentaje_perdidaDbld = ((this.cantidadTotalDbl * 100) / cantTotalAsignadaDbld);
      // porcentaje_perdidaSell = ((this.cantidadTotalSella * 100) / cantTotalAsignadaSellado);
      // porcentaje_perdidaRot = ((this.cantidadTotalRot * 100) / cantTotalAsignadaRot);
      // porcentaje_perdidaCorte = ((this.cantidadTotalCorte * 100) / cantTotalAsignadaCorte);
      // porcentaje_perdidaEmp = ((this.cantidadTotalEmpaque * 100) / cantTotalAsignadaEmpaque);
      // porcentaje_perdidaLam = ((this.cantidadTotalLaminado * 100) / cantTotalAsignadaLaminado);
      // porcentaje_perdidaWik = ((this.cantidadTotalWiketiado * 100) / cantTotalAsignadaWiketiado);
      // console.log(porcentaje_perdidaExt);
      // this.porcentajeTotal

  }


}

