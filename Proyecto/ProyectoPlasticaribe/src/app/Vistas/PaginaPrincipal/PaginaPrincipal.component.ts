import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { MenuItem, MessageService } from 'primeng/api';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { EntradaBOPPService } from 'src/app/Servicios/BOPP/entrada-BOPP.service';
import { DetallesAsignacionMPxTintasService } from 'src/app/Servicios/DetallesCreacionTintas/detallesAsignacionMPxTintas.service';
import { EstadosProcesos_OTService } from 'src/app/Servicios/EstadosProcesosOT/EstadosProcesos_OT.service';
import { InventarioZeusService } from 'src/app/Servicios/InventarioZeus/inventario-zeus.service';
import { MateriaPrimaService } from 'src/app/Servicios/MateriaPrima/materiaPrima.service';
import { RolesService } from 'src/app/Servicios/Roles/roles.service';
import { VistasFavoritasService } from 'src/app/Servicios/VistasFavoritas/VistasFavoritas.service';
import Swal from 'sweetalert2';
import { Reporte_Procesos_OTComponent } from '../Reporte_Procesos_OT/Reporte_Procesos_OT.component';
import DataLabelsPlugin from 'chartjs-plugin-datalabels';

@Component({
  selector: 'app-PaginaPrincipal',
  templateUrl: './PaginaPrincipal.component.html',
  styleUrls: ['./PaginaPrincipal.component.css']
})

export class PaginaPrincipalComponent implements OnInit {

  @ViewChild(Reporte_Procesos_OTComponent) modalEstadosProcesos_OT : Reporte_Procesos_OTComponent;

  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  displayTerminal: boolean; //Variable que permitirá mostrar o no el apartado donde se pueden escoger las vistas favoritas
  dockItems: MenuItem[] = []; //Variable que mostrará las vistas favoritas que feuron escogidas por el usuario logeado
  responsiveOptions: any[]; //Variable que hará que el docker, donde estan las vistas favoritas, sea responsive
  targetProducts = []; //Variable que tendrá las vistas seleccionadas por el usuario como favoritas
  disponibles = []; //Variable que tendrá la información de todas las vistas disponibles
  seleccionados = []; //Variable que almacenará los id de las vistas seleccionadas por el usuario como favoritas
  vistasFavoritas : any [] = []; // Variable que almacenará las vistas favoritas del usuario
  disponiblesMostrar = []; //Variable que almacenará las vistas disponibles para cada usuario segun su rol
  today : any = moment().format('YYYY-MM-DD'); //Variable que va a almacenar la fecha del dia de hoy
  primerDiaMes : any = moment().startOf('month').format('YYYY-MM-DD'); //Variable que va a almacenar el primer dia del mes

  /* GRAFICA */
  mostrarGrafica : boolean = false; //Variable que mostrará o no la información graficada
  nombreGrafica : string = 'Grafica'; //Variable que almacenará el nombre de la grafica
  multiAxisData: any;
  multiAxisOptions: any;
  multiAxisPlugins = [ DataLabelsPlugin ];

  /* GRAFICA */
  mostrarGraficaComparativo : boolean = false; //Variable que mostrará o no la información graficada
  ComparativoData: any;
  ComparativoOptions: any;
  ComparativoPlugins = [ DataLabelsPlugin ];

  /* GRAFICA DE FACTURACION */
  facturasData: any; //Variable que almacenará la informacion a graficar de lo facturado cada mes
  facturasOptions: any; //Variable que almacenará los estilos que tendrá la grafica de lo facturado cada mes
  facturacionPlugins = [ DataLabelsPlugin ];

  /* GRAFICA DE IVA COMPRA */
  ivaCompraData: any; //Variable que almacenará la informacion a graficar del iva de compra de cada mes
  ivaCompraOptions: any; //Variable que almacenará los estilos que tendrá la grafica del iva d compra de cada mes

  /* INFORMACION GENERAL ORDENES DE TRABAJO */
  totalOrdenesMes : number = 0; //Variable que va a almacenar la cantidad de ordenes que se ahn hecho en el ultimo mes
  costoTotalOrdenesMes : number = 0; //Variable que va a almacenar la costo total de las ordenes de trabajo del último mes
  catidadOTAbiertas : number = 0; //Variable que va a almacenar la cantidad de ordenes de trabajo que estan abiertas y no han inciado y no tienen asignaciones de materia prima
  cantidadOTAsignadas : number = 0; //Variable que va a almacenar la cantidad de ordenes de trabajo que tienen asignaciones de materia prima hechas pero que aun no se ha iniciado su produccion
  cantidadOTIniciada : number = 0; //Variable que va a almacenar la cantidad de ordenes de trabajo a las que ya se les inició su producción
  cantidadOTTerminada : number = 0; //variable que va a almacenar la cantidad de ordenes de trabajo que se terminaron
  cantidadOtAnulada : number = 0; //Variable que va a almcenar la cantidad de ordenes de trabajo que se han anulado
  cantidadOTCerrada : number = 0; //Variable que va a almacenar la cantidad de ordenes de trabajo cerradas
  clientesOrdenesMes : any [] = []; //Variable que va a almacenar los clientes a los que se les ha hecho ordenes y la cantidad de ordenes hechas a cada uno
  productosOrdenesMes : any [] = []; //Variable que va a almacenar los productos a los que se les ha hecho ordenes de trabajo y la cantidad de ordenes hechas de cada uno
  vendedorOrdenesMes : any [] = []; //Variable que almacenará los vendedores que han tenido ordenes de trabajo y la cantidad de cada uno
  procesosOrdenesMes : any [] = []; //Variable que va a almcencar la cantidad de que se ha hecho en cada proceso de produccion
  modalEstadosOrdenes : boolean = false; //Variable que mostrará el modal de los etsados de las ordenes o no
  nombreModalEstados : string = ''; //Variable que tendrá el nombre del estado seleccionado
  totalMpAsignada : number = 0; //Variable que va a almacenar la cantidad de materia prima asignada en todo el ultimo mes
  totalExtruidoMes : number = 0; //Variable que almacenará la cantidad de materia prima que se ha extruido en el mes
  materialesOrdenesMes : any [] = []; //Variable que almacenará la informacion de los materiales en ordenes de trabajo

  /* INFORMACION GENERAL DE MATERIAS PRIMAS */
  inventarioMateriaPrima : any [] = []; //Variable que almacenará la informacion de los inventarios inciales ya ctuales de las mterias primas
  costoTotalMateriasPrimas : number = 0; //Variable que almacenará el costo total de todas las materias primas
  cantidadMateriasPrimas : number = 0 //Variable que va a almacenar la cantidad de materias primas con existencias
  cantRollosBopp : number = 0; //Variable que almacenará la cantidad de rollo de bopp que hay en la bodega
  cantRollosBopa : number = 0; //Variable que almacenará la cantidad de rollos de bopa que hay en la bodega
  cantRollosPoliester : number = 0; //Variable que almacenará la cantidad de rollos de poliester que hay en la bodega
  cantRollosUtilizados : number = 0; //Variable que almacenará la cantidad de rollos de polipropileno biorientado que se han utilizado en lo que va del mes
  cantRollosEntrantes : number = 0; //Variable que almacenará la cantidad e rollo de polipropileno biorientado que han ingrsados durante el mes
  materiasPrimasMovidasHoy : any [] = []; //Variable que almcenará información acerca de las materias primas que se han asignado el dia de hoy
  cantMateriasPrimas : any [] = []; //Variable que almacenará las materias primas que se han creado y/o asignado el dia de hoy
  cantTintasCreadas : number = 0; //Variable que almacenará la cantidad de tintas que se crearon
  tintasCreadas : any []= []; //Variable que almacenará las tintas creadas
  materiasPrimasMasUtilizadasMes : any [] = []; //Variable que almacenará las materias primas que mas se utilizaron durandote el mes
  materiasPrimasMasUtilizadasCrearTintaMes : any [] = []; //variable que almacenará las materias primas utilizadas para la creación de tinas

  /* INFORMACION GENERAL DE LA FACTURACION */
  totalFacturadoDia : number = 0; //Variable que almacenará la cantidad total de lo que se ha facturado en el día
  totalFacuturadoMes : number = 0; //Variable que almacenará la cantidad total de lo que se ha facturado en el mes
  totalIvaVentaMes : number = 0; //Variable que almacenará el iva de ventas del mes
  totalIvaCompraMes : number = 0; //Varible que almacenará el iva de compra del mes
  totalFacturado1 : number = 0; //Variable que almacenará lo facturado en el mes de enero
  totalFacturado2 : number = 0; //Variable que almacenará lo facturado en el mes de febrero
  totalFacturado3 : number = 0; //Varibal que almacenará lo facturado en el mes de marzo
  totalFacturado4 : number = 0; //Variable que almcenará lo facturado en el mes de abril
  totalFacturado5 : number = 0; //Variable que almcenará lo facturado en el mes de mayo
  totalFacturado6 : number = 0; //Variable que almcenará lo facturado en el mes de junio
  totalFacturado7 : number = 0; //Variable que almcenará lo facturado en el mes de julio
  totalFacturado8 : number = 0; //Variable que almcenará lo facturado en el mes de agosto
  totalFacturado9 : number = 0; //Variable que almcenará lo facturado en el mes de septiembre
  totalFacturado10 : number = 0; //Variable que almcenará lo facturado en el mes de octubre
  totalFacturado11 : number = 0; //Variable que almcenará lo facturado en el mes de noviembre
  totalFacturado12 : number = 0; //Variable que almcenará lo facturado en el mes de diciembre
  totalIvaCompra1 : number = 0; //Variable que va a almacenar el iva de compra del mes de enero
  totalIvaCompra2 : number = 0; //Variable que va a almacenar el iva de compra del mes de febrero
  totalIvaCompra3 : number = 0; //Variable que va a almacenar el iva de compra del mes de marzo
  totalIvaCompra4 : number = 0; //Variable que va a almacenar el iva de compra del mes de abril
  totalIvaCompra5 : number = 0; //Variable que va a almacenar el iva de compra del mes de mayo
  totalIvaCompra6 : number = 0; //Variable que va a almacenar el iva de compra del mes de junio
  totalIvaCompra7 : number = 0; //Variable que va a almacenar el iva de compra del mes de julio
  totalIvaCompra8 : number = 0; //Variable que va a almacenar el iva de compra del mes de agosto
  totalIvaCompra9 : number = 0; //Variable que va a almacenar el iva de compra del mes de septiembre
  totalIvaCompra10 : number = 0; //Variable que va a almacenar el iva de compra del mes de octubre
  totalIvaCompra11 : number = 0; //Variable que va a almacenar el iva de compra del mes de noviembre
  totalIvaCompra12 : number = 0; //Variable que va a almacenar el iva de compra del mes de diciembre
  anos : any [] = [2019]; //Variable que almacenará los años desde el 2019 hasta el año actual
  anoSeleccionado : number = moment().year(); //Variable que almacenará la información del año actual en princio y luego podrá cambiar a un año seleccionado

  /* INFORMACIÓN GENERAL DE LOS PEDIDOS */
  pedidosClientes : any [] = []; //Variable que se llenará con la información de los pedidos agrupados por clientes
  pedidosProductos : any [] = []; //Variable que se llenará con la información de los pedidos agrupados por productos
  pedidosVendedores : any [] = []; //Variable que se llenará con la información de los pedidos agrupados por vendedores
  pedidosParcSatisfechos : number = 0; //Variable que se llenará con la información de los pedidos con estado "Parcialmente Satisfecho"
  pedidosPendientes : number = 0; //Variable que se llenará con la información de los pedidos con estado "Pendiente"
  pedidosParcStisfechos_Ot : any [] = []; //Variable que se llenará con la información de los pedidos con estado "Parcialmente Satisfecho" y que tengan OT asociadas
  pedidosPendientes_Ot : any [] = []; //Variable que se llenará con la información de los pedidos con estado "Pendiente" y con OT asociadas
  pedidosStock : any [] = []; //Variable que se llenará con los pedidos con un stock (de producto pedido) igual o mayor a la cantidad pediente

  constructor(@Inject(SESSION_STORAGE) private storage: WebStorageService,
                private rolService : RolesService,
                  private vistasFavService : VistasFavoritasService,
                    private messageService: MessageService,
                      private ordenTrabajoService : EstadosProcesos_OTService,
                        private bagProService : BagproService,
                          private materiaPrimaService : MateriaPrimaService,
                            private boppService : EntradaBOPPService,
                              private tintasCreadasService : DetallesAsignacionMPxTintasService,
                                private zeusService : InventarioZeusService,) {
  }

  ngOnInit() {
    this.lecturaStorage();
    this.llenarArrayAnos();
    this.llenarDatosSeleccionables();
    this.buscarFavoritos();
    setTimeout(() => {
      this.mostrarVistasFav();
      this.facturacion();
      this.cantOrdenesUltimoMes();
      this.materiasPrimas();
    }, 500);
  }

  // Funcion que leerá la informacion del usuario logeado, infomración que se almacena apenas el usuario incia sesion
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
    }, error => { this.mensajeError(`¡No se pudo conectar con el API de rubick, por favor recargue la pagina y si el problema persiste concatese con sistemas!`, error.message); });
  }

  // Funcion que va a llenar el array de años
  llenarArrayAnos(){
    for (let i = 0; i < this.anos.length; i++) {
      let num_Mayor : number = Math.max(...this.anos);
      if (num_Mayor == moment().year()) break;
      this.anos.push(num_Mayor + 1);
    }
  }

  // Llenar datos con todas las opciones de vistas que puede seleccionar como favoritas
  llenarDatosSeleccionables(){
    this.disponibles = [
      // ROLLOS DE EXTRUSION
      { id : 2, nombre : 'Eliminar Rollos', icono : 'assets/Iconos_Menu/eliminar.png', categoria: 'Bodega de Extrusión', ruta : './Eliminar-rollos', roles : [1], },
      { id : 3, nombre : 'Ingreso de Rollos', icono : 'assets/Iconos_Menu/ingresar.png', categoria: 'Bodega de Extrusión', ruta : './IngresoRollos-Extrusion', roles : [1,5], },
      { id : 4, nombre : 'Salida de Rollos', icono : 'assets/Iconos_Menu/salida.png', categoria: 'Bodega de Extrusión', ruta : './AsignacionRollos-Extrusion', roles : [1,5], },

      // BOPP
      { id : 5, nombre : 'Asignación de BOPP', icono : 'assets/Iconos_Menu/salida.png', categoria: 'BOPP / BOPA / POLIESTER', ruta : './AsignacionBOPPTemporal', roles : [1,3], },
      { id : 6, nombre : 'Entrada de BOPP', icono : 'assets/Iconos_Menu/ingresar.png', categoria: 'BOPP / BOPA / POLIESTER', ruta : './entrada-BOPP', roles : [1,3], },

      // DESPACHO
      { id : 7, nombre : 'Ingresar Rollos', icono : 'assets/Iconos_Menu/ingresar.png', categoria: 'Despacho', ruta : './ingresar-productos', roles : [1,10], },
      { id : 8, nombre : 'Facturar Rollos', icono : 'assets/Iconos_Menu/factura.png', categoria: 'Despacho', ruta : './asignacion-productos-facturas', roles : [1,6], },
      { id : 9, nombre : 'Despachar Mercancia', icono : 'assets/Iconos_Menu/camion.png', categoria: 'Despacho', ruta : './factura-rollos-productos', roles : [1,10], },
      { id : 10, nombre : 'Devolución de Rollos', icono : 'assets/Iconos_Menu/devolucion.png', categoria: 'Despacho', ruta : './devolucion-rollos-productos', roles : [1,10], },
      { id : 11, nombre : 'Pre Ingreso Extrusión', icono : 'assets/Iconos_Menu/ingresar.png', categoria: 'Despacho', ruta : './preingreso-extrusion', roles : [1,7], },
      { id : 12, nombre : 'Pre Ingreso Sellado/Empaque', icono : 'assets/Iconos_Menu/ingresar.png', categoria: 'Despacho', ruta : './preingreso-sellado', roles : [1,8,9], },

      // ARCHIVOS
      { id : 13, nombre : 'Gestor de Archivos', icono : 'assets/Iconos_Menu/carpeta.png', categoria: 'Gestor de Archivos', ruta : './Archivos', roles : [1,2,3], },

      // MATERIA PRIMA
      { id : 14, nombre : 'Asignación Materia Prima', icono : 'assets/Iconos_Menu/salida.png', categoria: 'Materia Prima', ruta : './asignacionMP', roles : [1,3], },
      { id : 15, nombre : 'Creación Tintas', icono : 'assets/Iconos_Menu/tinta.png', categoria: 'Materia Prima', ruta : '/asignacion-tintas', roles : [1,3], },
      { id : 16, nombre : 'Devoluciones', icono : 'assets/Iconos_Menu/devolucion.png', categoria: 'Materia Prima', ruta : './mp-devoluciones', roles : [1,3], },
      { id : 17, nombre : 'Entradas', icono : 'assets/Iconos_Menu/ingresar.png', categoria: 'Materia Prima', ruta : './MateriaPrima', roles : [1,3], },
      { id : 18, nombre : 'Materias Primas', icono : 'assets/Iconos_Menu/materiaPrima.png', categoria: 'Materia Prima', ruta : './materias_primas', roles : [1], },
      { id : 19, nombre : 'Orden de Compra', icono : 'assets/Iconos_Menu/crearOrden.png', categoria: 'Materia Prima', ruta : './ocompra-materiaPrima', roles : [1,13], },
      { id : 20, nombre : 'Recuperado', icono : 'assets/Iconos_Menu/recuperado.png', categoria: 'Materia Prima', ruta : './mp-recuperada', roles : [1,3], },

      // MOVIMIENTOS
      { id : 21, nombre : 'Movimientos Bodega de Extrusión', icono : 'assets/Iconos_Menu/bodega.png', categoria: 'Movimientos', ruta : './ReporteRollos-Extrusion', roles : [1,5], },
      { id : 22, nombre : 'Entradas de Materia Prima', icono : 'assets/Iconos_Menu/recibos.png', categoria: 'Movimientos', ruta : './reporte-facturas-remisiones-mp', roles : [1,3], },
      { id : 23, nombre : 'Movimientos Despacho', icono : 'assets/Iconos_Menu/caja.png', categoria: 'Movimientos', ruta : './reporte-despacho', roles : [1,6,7,8,9,10], },
      { id : 24, nombre : 'Movimientos BOPP', icono : 'assets/Iconos_Menu/materiaPrima.png', categoria: 'Movimientos', ruta : './movimientos-bopp', roles : [1,3], },
      { id : 25, nombre : 'Movimientos MP', icono : 'assets/Iconos_Menu/materiaPrima.png', categoria: 'Movimientos', ruta : './movimientos-matprima', roles : [1,3], },
      { id : 26, nombre : 'Movimientos Tintas', icono : 'assets/Iconos_Menu/tinta.png', categoria: 'Movimientos', ruta : './movimientos-tintas', roles : [1,3], },
      { id : 27, nombre : 'Movimientos Recuperado', icono : 'assets/Iconos_Menu/recuperado.png', categoria: 'Movimientos', ruta : './reporte-recuperado-mp', roles : [1,3], },
      { id : 28, nombre : 'Movimientos Ordenes de Compra', icono : 'assets/Iconos_Menu/recibos.png', categoria: 'Movimientos', ruta : './reporte-orden-compra', roles : [1,13], },
      { id : 42, nombre : 'Movimiento de Mantenimientos de Activos', icono : 'assets/Iconos_Menu/Mantenimiento.png', categoria: 'Movimientos', ruta : './movimientos-mantenimientos', roles : [1], },

      // ORDEN DE TRABAJO
      { id : 29, nombre : 'Crear OT', icono : 'assets/Iconos_Menu/crearOrden.png', categoria: 'Orden de Trabajo', ruta : './ordenes-trabajo', roles : [1], },

      // PEDIDOS DE PRODUCTOS
      // { id : 30, nombre : 'Pedidos Externos', icono : 'assets/Iconos_Menu/pedidos.png', categoria: 'Pedidos', ruta : './pedido-externo', roles : [1,2], },
      // { id : 31, nombre : 'Ver Pedidos', icono : 'assets/Iconos_Menu/verDocumento.png', categoria: 'Pedidos', ruta : './opedidoproducto', roles : [1,2], },
      { id : 47, nombre : 'Pedidos Zeus', icono : 'assets/Iconos_Menu/pedidos.png', categoria: 'Pedidos', ruta : './Pedidos-Zeus', roles : [1], },

      // PRODUCTO TERMINADO
      { id : 32, nombre : 'Producto Terminado (Zeus)', icono : 'assets/Iconos_Menu/bodega.png', categoria: 'Productos', ruta : './inventario-productos-terminados', roles : [1], },
      { id : 33, nombre : 'Producto Terminado', icono : 'assets/Iconos_Menu/bodega.png', categoria: 'Productos', ruta : './inventario-productos', roles : [1], },

      // REPORTES
      { id : 34, nombre : 'Inventario Bodega Extrusión', icono : 'assets/Iconos_Menu/bodega.png', categoria: 'Reportes', ruta : './Inventario-Extrusion', roles : [1,5], },
      { id : 35, nombre : 'Inventario de Materia Prima', icono : 'assets/Iconos_Menu/bodega.png', categoria: 'Reportes', ruta : './reporte-Materia-Prima', roles : [1,3], },
      { id : 36, nombre : 'Reportes de Costos', icono : ' ', categoria: 'Reportes', ruta : './reporte-costos-ot', roles : [1], },
      // { id : 37, nombre : 'Reporte de Pedidos', icono : 'assets/Iconos_Menu/reportePedidos.png', categoria: 'Reportes', ruta : './estados-ot-vendedore', roles : [1,2], },
      { id : 38, nombre : 'Reporte Procesos OT', icono : 'assets/Iconos_Menu/cronologia.png', categoria: 'Reportes', ruta : './reportes-procesos-ot', roles : [1,12], },
      { id : 39, nombre : 'Reporte Rollos Eliminados', icono : 'assets/Iconos_Menu/reporteEliminados.png', categoria: 'Reportes', ruta : './reporte-rollos-eliminados', roles : [1], },
      { id : 43, nombre : 'Reporte de Activos', icono : 'assets/Iconos_Menu/activos.png', categoria: 'Reporte', ruta : './reporte-activos', roles : [1], },
      { id : 46, nombre : 'Reporte Desperdicio', icono : 'assets/Iconos_Menu/recibos.png', categoria: 'Reporte', ruta : './reporte-desperdicios', roles : [1, 12], },

      // USUARIOS
      { id : 40, nombre : 'Usuarios', icono : 'assets/Iconos_Menu/usuarios.png', categoria: 'Usuarios', ruta : './registro-usuario', roles : [1], },

      // MANTENIMIENTO Y PEDIDOS DE MANTENIMIENTO
      { id : 41, nombre : 'Pedido de Mantenimiento de Activos', icono : 'assets/Iconos_Menu/pedido_mantenimiento.png', categoria: 'Mantenimiento', ruta : './pedido-mantenimiento', roles : [1], },
      { id : 44, nombre : 'Mantenimiento de Activos', icono : 'assets/Iconos_Menu/Mantenimiento.png', categoria: 'Mantenimiento', ruta : './mantenimiento-camiones', roles : [1], },

      // DEPERDICIO
      { id : 45, nombre : 'Deperdicio', icono : 'assets/Iconos_Menu/caja.png', categoria: 'Deperdicio', ruta : './desperdicio', roles : [1, 12], },

      //47
    ];
  }

  // Funcion que va a colocar en la vista las vistas escogidas por un usuario como favoritas, las ociones favoritas siempre tendrán predeterminadas, 1: Inicio y 2: Añadir
  mostrarVistasFav(){
    this.dockItems = [];
    this.dockItems.push(
      {
        label: 'Inicio',
        tooltipOptions: {
          tooltipLabel: "Inicio",
          tooltipPosition: 'top',
          positionTop: -15,
          positionLeft: 15
        },
        icon: "assets/Iconos_Menu/home.png",
        command: () => { window.location.href = './home'; }
      }
    );
    for (let i = 0; i < this.disponibles.length; i++) {
      for (let j = 0; j < this.vistasFavoritas.length; j++) {
        if (this.vistasFavoritas[j] == this.disponibles[i].id) {
          let info : any = {
            label : this.disponibles[i].nombre,
            tooltipOptions : {
              tooltipLabel: this.disponibles[i].nombre,
              tooltipPosition: 'top',
              positionTop: -15,
              positionLeft: 15
            },
            icon : this.disponibles[i].icono,
            command: () => { window.location.href = this.disponibles[i].ruta; }
          }
          this.dockItems.push(info);
          this.seleccionados.push(this.disponibles[i].id);
        }
      }
    }
    this.dockItems.push(
      {
        label: 'Añadir',
        tooltipOptions: {
          tooltipLabel: "Añadir Favoritos",
          tooltipPosition: 'top',
          positionTop: -15,
          positionLeft: 15
        },
        icon: "assets/Iconos_Menu/crear.png",
        command: () => {
          const cardInfo = document.getElementById('card');
          cardInfo.className = 'card_animations';
          this.llenarDatosRol();
        }
      }
    );
    this.responsiveOptions = [
      {
        breakpoint: '1024px',
        numVisible: 3
      },
      {
        breakpoint: '768px',
        numVisible: 2
      },
      {
        breakpoint: '560px',
        numVisible: 1
      }
    ];
  }

  // Funcion que llenará los datos segun el rol del usuario logeado, si no encuentra ninguna vista como favorita no pondrá ninguno en la vista
  llenarDatosRol(){
    this.targetProducts = [];
    this.disponiblesMostrar = [];
    for (let i = 0; i < this.disponibles.length; i++) {
      if (this.disponibles[i].roles.includes(this.ValidarRol) && !this.seleccionados.includes(this.disponibles[i].id)) {
        let info : any = {
          id : this.disponibles[i].id,
          nombre : this.disponibles[i].nombre,
          icono : this.disponibles[i].icono,
          categoria : this.disponibles[i].categoria,
          ruta : this.disponibles[i].categoria,
        }
        this.disponiblesMostrar.push(info);
      } else if (this.seleccionados.includes(this.disponibles[i].id)) this.targetProducts.push(this.disponibles[i]);
    }
    setTimeout(() => { this.displayTerminal = true; }, 500);
  }

  // Funcion que va cerrar el modal
  cerrarLista(){
    const contenedorListaInfo : any = document.getElementById('contenedorLista');
    contenedorListaInfo.className = 'contenedorLista_animations';
    setTimeout(() => { this.displayTerminal = false; }, 450);
  }

  // Funcion que validará que solo se puedan elegir 5 vistas favoritas y redireccionará a la funcion que gusada o actualiza las vistas escogidas
  elegirFavoritos(){
    if (this.targetProducts.length > 5) {
      this.messageService.add({key: 'tc', severity:'warn', summary: 'Advertencia', detail: 'Solo puede elegir 5 favoritos'});
      for (let i = 0; i < this.targetProducts.length; i++) {
        this.disponiblesMostrar.push(this.targetProducts[i]);
        this.targetProducts.splice(i, 1);
        this.disponiblesMostrar.sort((a,b) => Number(a.id) - Number(b.id));
        this.añadirVistasFavoritas();
        break;
      }
    } else if (this.targetProducts.length <= 5) this.añadirVistasFavoritas();
  }

  // Funcion que tomará el usuario logeado y lo consultará en la base de datos, en tabla "VistasFavoritas", y buscará las vistas escogidas por el usuario anteriormente
  buscarFavoritos(){
    this.vistasFavoritas = [];
    if (this.storage_Id != undefined) {
      this.vistasFavService.getVistasFavUsuario(this.storage_Id).subscribe(datos_vistasFav => {
        for (let i = 0; i < datos_vistasFav.length; i++) {
          this.vistasFavoritas = [
            datos_vistasFav[i].vistaFav_Num1,
            datos_vistasFav[i].vistaFav_Num2,
            datos_vistasFav[i].vistaFav_Num3,
            datos_vistasFav[i].vistaFav_Num4,
            datos_vistasFav[i].vistaFav_Num5,
          ];
        }
      }, error => { this.mensajeError('¡No se pudieron encontrar sus vistas favoritas!', error.message); });
    }
  }

  // Funcion que añadirá o actualizará la base de datos con las vistas favoritas que ha elegido un usuario
  añadirVistasFavoritas(){
    if (this.vistasFavoritas.length == 0) {
      for (let i = 0; i < this.targetProducts.length; i++) {
        let vista1 : number = this.targetProducts[i];
        let vista2 : number = this.targetProducts[i + 1];
        let vista3 : number = this.targetProducts[i + 2];
        let vista4 : number = this.targetProducts[i + 3];
        let vista5 : number = this.targetProducts[i + 4];
        if (vista1 == undefined) vista1 = 0;
        else vista1 = this.targetProducts[i].id;
        if (vista2 == undefined) vista2 = 0;
        else vista2 = this.targetProducts[i + 1].id;
        if (vista3 == undefined) vista3 = 0;
        else vista3 = this.targetProducts[i + 2].id;
        if (vista4 == undefined) vista4 = 0;
        else vista4 = this.targetProducts[i + 3].id;
        if (vista5 == undefined) vista5 = 0;
        else vista5 = this.targetProducts[i + 4].id;
        let info : any = {
          Usua_Id : this.storage_Id,
          VistaFav_Num1 : vista1,
          VistaFav_Num2 : vista2,
          VistaFav_Num3 : vista3,
          VistaFav_Num4 : vista4,
          VistaFav_Num5 : vista5,
          VistaFav_Fecha : moment().format('YYYY-MM-DD'),
          VistaFav_Hora : moment().format('H:mm:ss'),
        }
        this.vistasFavService.insertVistasFavoritas(info).subscribe(() => {
          this.buscarFavoritos();
          setTimeout(() => { this.mostrarVistasFav(); }, 1000);
        }, error => { this.mensajeError('¡No se pudieron guardar las vistas elegidas!', error.message); });
        break;
      }
    } else {
      this.vistasFavService.getVistasFavUsuario(this.storage_Id).subscribe(datos_vistasFav => {
        for (let i = 0; i < datos_vistasFav.length; i++) {
          if (this.targetProducts.length == 0) {
            let info : any = {
              VistasFav_Id: datos_vistasFav[i].vistasFav_Id ,
              Usua_Id : this.storage_Id,
              VistaFav_Num1 : 0,
              VistaFav_Num2 : 0,
              VistaFav_Num3 : 0,
              VistaFav_Num4 : 0,
              VistaFav_Num5 : 0,
              VistaFav_Fecha : moment().format('YYYY-MM-DD'),
              VistaFav_Hora : moment().format('H:mm:ss'),
            }
            this.vistasFavService.updateVistasFavoritas(datos_vistasFav[i].vistasFav_Id, info).subscribe(() => {
              this.buscarFavoritos();
              setTimeout(() => { this.mostrarVistasFav(); }, 1000);
            }, error => { this.mensajeError('¡No se pudieron guardar las vistas elegidas!', error.message); });
          } else {
            for (let j = 0; j < this.targetProducts.length; j++) {
              let vista1 : number = this.targetProducts[i];
              let vista2 : number = this.targetProducts[i + 1];
              let vista3 : number = this.targetProducts[i + 2];
              let vista4 : number = this.targetProducts[i + 3];
              let vista5 : number = this.targetProducts[i + 4];
              if (vista1 == undefined) vista1 = 0;
              else vista1 = this.targetProducts[i].id;
              if (vista2 == undefined) vista2 = 0;
              else vista2 = this.targetProducts[i + 1].id;
              if (vista3 == undefined) vista3 = 0;
              else vista3 = this.targetProducts[i + 2].id;
              if (vista4 == undefined) vista4 = 0;
              else vista4 = this.targetProducts[i + 3].id;
              if (vista5 == undefined) vista5 = 0;
              else vista5 = this.targetProducts[i + 4].id;
              let info : any = {
                VistasFav_Id: datos_vistasFav[i].vistasFav_Id ,
                Usua_Id : this.storage_Id,
                VistaFav_Num1 : vista1,
                VistaFav_Num2 : vista2,
                VistaFav_Num3 : vista3,
                VistaFav_Num4 : vista4,
                VistaFav_Num5 : vista5,
                VistaFav_Fecha : moment().format('YYYY-MM-DD'),
                VistaFav_Hora : moment().format('H:mm:ss'),
              }
              this.vistasFavService.updateVistasFavoritas(datos_vistasFav[i].vistasFav_Id, info).subscribe(() => {
                this.buscarFavoritos();
                setTimeout(() => { this.mostrarVistasFav(); }, 1000);
              }, error => { this.mensajeError('¡No se pudieron guardar las vistas elegidas!', error.message); });
              break;
            }
          }
        }
      });
    }
  }

  // Funcion que va a generar la fecha del primer dia del mes actual
  cantOrdenesUltimoMes(){
    this.productosOrdenesMes = [];
    this.clientesOrdenesMes = [];
    this.vendedorOrdenesMes = [];
    this.procesosOrdenesMes = [];
    this.totalOrdenesMes = 0;
    this.costoTotalOrdenesMes = 0;

    if(this.ValidarRol == 1) {
      this.ordenTrabajoService.srvObtenerListaPorFechas(this.primerDiaMes, this.today).subscribe(datos_ot => {
        if (datos_ot.length == 0) setTimeout(() => { this.mensajeError('No existen OTs creadas en las el último mes.'); }, 3000);
        else {
          for (let i = 0; i < datos_ot.length; i++) {
            if (datos_ot[i].estado_Nombre == 'Abierta') this.catidadOTAbiertas += 1;
            if (datos_ot[i].estado_Nombre == 'Asignada') this.cantidadOTAsignadas += 1;
            if (datos_ot[i].estado_Nombre == 'Terminada') this.cantidadOTTerminada += 1;
            if (datos_ot[i].estado_Nombre == 'En proceso') this.cantidadOTIniciada += 1;
            if (datos_ot[i].estado_Nombre == 'Anulado') this.cantidadOtAnulada += 1;
            if (datos_ot[i].estado_Nombre == 'Cerrada') this.cantidadOTCerrada += 1;
          }
        }
      }, error => { this.mensajeError(`¡No se ha podido consultar cuantas ordenes de trabajo se han hecho en el último mes y en que estado se encuntran!`, error.message); });

      this.ordenTrabajoService.GetProductosOrdenesUltimoMes(this.primerDiaMes, this.today).subscribe(datos_ordenes => {
        for (let i = 0; i < datos_ordenes.length; i++) {
          this.productosOrdenesMes.push(datos_ordenes[i]);
          this.productosOrdenesMes.sort((a,b) => a.prod_Nombre.localeCompare(b.prod_Nombre));
          this.productosOrdenesMes.sort((a,b) => Number(b.cantidad) - Number(a.cantidad));
        }
      }, error => { this.mensajeError(`¡No se ha podido consultar cuantas ordenes de trabajo se han hecho en el último mes para cada producto!`, error.message); });

      this.bagProService.GetPesoProcesosUltimoMes(this.primerDiaMes, this.today).subscribe(datos_ordenes => {
        for (let i = 0; i < datos_ordenes.length; i++) {
          if (datos_ordenes[i].nomStatus == 'IMPRESION'
            || datos_ordenes[i].nomStatus == 'LAMINADO'
            || datos_ordenes[i].nomStatus == 'EXTRUSION'
            || datos_ordenes[i].nomStatus == 'CORTE'
            || datos_ordenes[i].nomStatus == 'ROTOGRABADO'
            || datos_ordenes[i].nomStatus == 'DOBLADO'
            || datos_ordenes[i].nomStatus == 'EMPAQUE'
            || datos_ordenes[i].nomStatus == 'SELLADO'
            || datos_ordenes[i].nomStatus == 'Wiketiado') {
              let id : number = 0;
              if (datos_ordenes[i].nomStatus == 'EXTRUSION') id = 1;
              if (datos_ordenes[i].nomStatus == 'IMPRESION') id = 2;
              if (datos_ordenes[i].nomStatus == 'ROTOGRABADO') id = 3;
              if (datos_ordenes[i].nomStatus == 'LAMINADO') id = 4;
              if (datos_ordenes[i].nomStatus == 'EMPAQUE') {
                id = 5;
                datos_ordenes[i].nomStatus = 'CORTE';
              }
              if (datos_ordenes[i].nomStatus == 'DOBLADO') id = 6;
              if (datos_ordenes[i].nomStatus == 'SELLADO') id = 7;
              if (datos_ordenes[i].nomStatus == 'Wiketiado') id = 8;
              let info : any  = {
                id : id,
                Nombre : datos_ordenes[i].nomStatus,
                cantidad : datos_ordenes[i].peso,
                und : datos_ordenes[i].und,
              }
              this.procesosOrdenesMes.push(info);
            this.procesosOrdenesMes.sort((a,b) => Number(a.id) - Number(b.id));
          }
        }
      }, error => { this.mensajeError(`¡No se ha podido consultar la cantidad producida por cada proceso de las ordenes que se crearon el ultimo mes!`, error.message); });

      this.bagProService.GetCostoOrdenesUltimoMes(this.primerDiaMes, this.today).subscribe(datos_ordenes => {
        for (let i = 0; i < datos_ordenes.length; i++) {
          this.costoTotalOrdenesMes += datos_ordenes[i].costo;
        }
      }, error => { this.mensajeError(`¡No se ha podido consultar el costo de las ordenes de trabajo que se han hecho en el último mes!`, error.message); });

      this.bagProService.GetCostoOrdenesUltimoMes_Vendedores(this.primerDiaMes, this.today).subscribe(datos_ordenes => {
        for (let i = 0; i < datos_ordenes.length; i++) {
          this.vendedorOrdenesMes.push(datos_ordenes[i]);
          this.vendedorOrdenesMes.sort((a,b) => Number(b.cantidad) - Number(a.cantidad));
        }
      }, error => { this.mensajeError(`¡No se ha podido consultar cuantas ordenes de trabajo se han hecho en el último mes para vendedor!`, error.message); });

      this.bagProService.GetCostoOrdenesUltimoMes_Clientes(this.primerDiaMes, this.today).subscribe(datos_ordenes => {
        for (let i = 0; i < datos_ordenes.length; i++) {
          this.clientesOrdenesMes.push(datos_ordenes[i]);
          this.clientesOrdenesMes.sort((a,b) => Number(b.cantidad) - Number(a.cantidad));
          this.totalOrdenesMes += datos_ordenes[i].cantidad;
        }
      }, error => { this.mensajeError(`¡No se ha podido consultar cuantas ordenes de trabajo se han hecho en el último mes para cada cliente!`, error.message); });

      this.bagProService.GetCantOrdenesMateriales(this.primerDiaMes, this.today).subscribe(datos_ordenes => {
        for (let i = 0; i < datos_ordenes.length; i++) {
          this.materialesOrdenesMes.push(datos_ordenes[i]);
          this.materialesOrdenesMes.sort((a,b) => Number(b.cantidad) - Number(a.cantidad));
        }
      }, error => { this.mensajeError(`¡No se ha podido consultar cuantas ordenes de trabajo se han hecho en el último mes para cada cliente!`, error.message); });
    }
  }

  // Funcion que va a consultar toda la información general de materia prima
  materiasPrimas(){
    this.inventarioMateriaPrima = [];
    this.cantMateriasPrimas = [];
    this.cantRollosBopp = 0;
    this.cantRollosBopa = 0;
    this.cantRollosPoliester = 0;
    this.cantRollosEntrantes = 0;
    this.cantRollosUtilizados = 0;
    this.materiasPrimasMovidasHoy = [];
    this.tintasCreadas = [];
    this.cantTintasCreadas = 0;
    this.materiasPrimasMasUtilizadasMes = [];

    if(this.ValidarRol == 1) {
      this.materiaPrimaService.GetInventarioMateriasPrimas().subscribe(datos_materiaPrima => {
        for (let i = 0; i < datos_materiaPrima.length; i++) {
          if (datos_materiaPrima[i].inicial != datos_materiaPrima[i].actual && datos_materiaPrima[i].id_Materia_Prima != 84) this.inventarioMateriaPrima.push(datos_materiaPrima[i]);
          this.inventarioMateriaPrima.sort((a,b) => a.nombre_Materia_Prima.localeCompare(b.nombre_Materia_Prima));
        }
      }, error => { this.mensajeError(`¡No se pudo obtener información de las materias primas!`, error.message); });

      this.boppService.GetBoppStockInventario().subscribe(datos_bopp => {
        for (let i = 0; i < datos_bopp.length; i++) {
          if (datos_bopp[i].catMP_Id == 6) this.cantRollosBopp = datos_bopp[i].conteoDescripcion;
          else if (datos_bopp[i].catMP_Id == 14) this.cantRollosBopa = datos_bopp[i].conteoDescripcion;
          else if (datos_bopp[i].catMP_Id == 15) this.cantRollosPoliester = datos_bopp[i].conteoDescripcion;
        }
      }, error => { this.mensajeError(`¡No se pudo obtener información de los rollos biorientados!`, error.message) });

      this.boppService.GetCantRollosUtilizados_Mes(this.primerDiaMes, this.today).subscribe(datos_bopp => {
        for (let i = 0; i < datos_bopp.length; i++) {
          this.cantRollosUtilizados += datos_bopp[i].cantidad;
        }
      }, error => { this.mensajeError(`¡No se pudo obtener información de los rollos biorientados!`, error.message) });

      this.boppService.GetCantRollosIngresados_Mes(this.primerDiaMes, this.today).subscribe(datos_bopp => {
        for (let i = 0; i < datos_bopp.length; i++) {
          this.cantRollosEntrantes += datos_bopp[i].cantidad;
        }
      }, error => { this.mensajeError(`¡No se pudo obtener información de los rollos biorientados!`, error.message) });

      this.materiaPrimaService.GetMateriasPrimasUtilizadasHoy(this.today).subscribe(datos_materiasPrimas => {
        for (let i = 0; i < datos_materiasPrimas.length; i++) {
          this.materiasPrimasMovidasHoy.push(datos_materiasPrimas[i]);
          this.materiasPrimasMovidasHoy.sort((a,b) => Number(b.cantidad) - Number(a.cantidad));
        }
      }, error => { this.mensajeError(`¡No se pudo obtener información de las materias primas que tuvieron asignaciones hoy!`, error.message) });

      this.tintasCreadasService.GetTintasCreadasMes(this.primerDiaMes, this.today).subscribe(datos_tintas => {
        for (let i = 0; i < datos_tintas.length; i++) {
          this.tintasCreadas.push(datos_tintas[i]);
          this.tintasCreadas.sort((a,b) => Number(b.cantidad) - Number(a.cantidad));
          this.cantTintasCreadas += 1;
        }
      }, error => { this.mensajeError(`¡No se pudo obtener información de las tintas creadas durante las fechas ${this.primerDiaMes} y ${this.today}!`, error.message) });

      this.materiaPrimaService.GetMateriasPrimasUltilizadasMes(this.primerDiaMes, this.today).subscribe(datos_materiasPrimas => {
        for (let i = 0; i < datos_materiasPrimas.length; i++) {
          this.materiasPrimasMasUtilizadasMes.push(datos_materiasPrimas[i]);
          this.materiasPrimasMasUtilizadasMes.sort((a,b) => Number(b.cantidad) - Number(a.cantidad));
        }
      }, error => { this.mensajeError(`¡No se pudo obtener información de las materias primas más utilizadas durante el mes!`, error.message); });

      this.tintasCreadasService.GetMateriasPrimasCrearTintasMes(this.primerDiaMes, this.today).subscribe(datos_tintas => {
        for (let i = 0; i < datos_tintas.length; i++) {
          this.materiasPrimasMasUtilizadasCrearTintaMes.push(datos_tintas[i]);
          this.materiasPrimasMasUtilizadasCrearTintaMes.sort((a,b) => Number(b.cantidad) - Number(a.cantidad));
        }
      }, error => { this.mensajeError(`¡No se pudo obtener información de las tintas creadas durante las fechas ${this.primerDiaMes} y ${this.today}!`, error.message) });

      this.ordenTrabajoService.GetTotalMateriaPrimaAsignadaMes(this.primerDiaMes, this.today).subscribe(datos_ot => {
        for (let i = 0; i < datos_ot.length; i++) {
          this.totalMpAsignada += datos_ot[i].cantidad;
          this.totalExtruidoMes += datos_ot[i].extruido;
        }
      }, error => { this.mensajeError(`¡No se ha podido consultar la cantidad de Materia Prima que se ha asignado y la cantidad de Materia Prima que se ha extruido!`, error.message); });
    }
  }

  // Funcion que va a consultar la información de la facturación
  facturacion(){
    this.totalFacturadoDia = 0;
    this.totalFacuturadoMes = 0;
    this.totalIvaVentaMes = 0;
    this.totalIvaCompraMes = 0;
    if(this.ValidarRol == 1) {
      this.zeusService.GetValorFacturadoHoy().subscribe(datos_facturacion => {
        this.totalFacturadoDia = datos_facturacion;
      }, error => { this.mensajeError(`¡No se pudo obtener información sobre el valor de lo facturado hoy!`, error.message); });

      this.zeusService.GetFacturacionMensual(this.primerDiaMes, this.today).subscribe(datos_facturacion => {
        this.totalFacuturadoMes = datos_facturacion;
      }, error => { this.mensajeError(`¡No se pudo aobtener información sobre lo facturado del mes actual!`, error.message); });

      this.zeusService.GetIvaVentaMensual(this.primerDiaMes, this.today).subscribe(datos_facturacion => {
        this.totalIvaVentaMes = datos_facturacion;
      }, error => { this.mensajeError(`¡No se pudo obtener información sobre el iva de las ventas del mes actual!`, error.message); });

      // this.zeusService.GetIvaCompraMensual(this.primerDiaMes, this.today).subscribe(datos_facturacion => {
      //   this.totalIvaCompraMes = datos_facturacion;
      // }, error => { this.mensajeError(`¡No se pudo obtener información sobre el iva de las compras de mes actual!`, error.message); });

      for (let i = 0; i < 12; i++) {
        this.zeusService.GetFacturacionTodosMeses(i+ 1, this.anoSeleccionado).subscribe(datos_facturacion => {
          if (i == 0) this.totalFacturado1 = datos_facturacion;
          if (i == 1) this.totalFacturado2 = datos_facturacion;
          if (i == 2) this.totalFacturado3 = datos_facturacion;
          if (i == 3) this.totalFacturado4 = datos_facturacion;
          if (i == 4) this.totalFacturado5 = datos_facturacion;
          if (i == 5) this.totalFacturado6 = datos_facturacion;
          if (i == 6) this.totalFacturado7 = datos_facturacion;
          if (i == 7) this.totalFacturado8 = datos_facturacion;
          if (i == 8) this.totalFacturado9 = datos_facturacion;
          if (i == 9) this.totalFacturado10 = datos_facturacion;
          if (i == 10) this.totalFacturado11 = datos_facturacion;
          if (i == 11) this.totalFacturado12 = datos_facturacion;
        }, error => { this.mensajeError(`¡No se pudo obtener información sobre la cantidad facturada en cada uno de los meses del año!`, error.message); });
      }
      setTimeout(() => { this.llenarGraficaFacturacion(); }, 1500);

      for (let i = 0; i < 12; i++) {
        this.zeusService.GetIvaCompraTodosMeses(i+ 1).subscribe(datos_facturacion => {
          if (i == 0) this.totalIvaCompra1 = datos_facturacion;
          if (i == 1) this.totalIvaCompra2 = datos_facturacion;
          if (i == 2) this.totalIvaCompra3 = datos_facturacion;
          if (i == 3) this.totalIvaCompra4 = datos_facturacion;
          if (i == 4) this.totalIvaCompra5 = datos_facturacion;
          if (i == 5) this.totalIvaCompra6 = datos_facturacion;
          if (i == 6) this.totalIvaCompra7 = datos_facturacion;
          if (i == 7) this.totalIvaCompra8 = datos_facturacion;
          if (i == 8) this.totalIvaCompra9 = datos_facturacion;
          if (i == 9) this.totalIvaCompra10 = datos_facturacion;
          if (i == 10) this.totalIvaCompra11 = datos_facturacion;
          if (i == 11) this.totalIvaCompra12 = datos_facturacion;
        }, error => { this.mensajeError(`¡No se pudo obtener información sobre el iva de las compras de cada uno de los meses del año!`, error.message); });
      }
      setTimeout(() => { this.llenarGraficaIvaCompra(); }, 1800);
    }
  }

  // Funcion que va a consultar la información general de los pedidos creados en Zeus
  pedidosZeus(){

  }

  // Funcion que va a llenar la grafica con la información de la cantidad de materia prima asignada y la cantidad extruida
  llenarGraficaComparativo(){
    this.mostrarGraficaComparativo = true;
    this.ComparativoData = {
      labels: ['Materia Prima'],
      datasets: [
          {
              label: 'Materia Prima Asignada',
              backgroundColor: '#42A5F5',
              data: [this.totalMpAsignada]
          },
          {
              label: 'Materia Prima Extruida',
              backgroundColor: '#FFA726',
              data: [this.totalExtruidoMes]
          }
      ]
    };

    this.ComparativoOptions = {
      indexAxis: 'y',
      plugins: {
        legend: {
          labels: {
            color: '#495057'
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: '#495057'
          },
          grid: {
            color: '#ebedef'
          }
        },
        y: {
          ticks: {
            color: '#495057'
          },
          grid: {
            color: '#ebedef'
          }
        }
      }
    };
  }

  // Funcion que va a llenar la grafica con la información de los vendedores
  llenarGraficaVendedores(){
    this.mostrarGrafica = true;
    this.nombreGrafica = `Grafica de Vendedores`;
    let vendedores : any = [];
    let costoVentas : any = [];
    let cantOt : any = [];
    for (let i = 0; i < 5; i++) {
      vendedores.push(this.vendedorOrdenesMes[i].nombreCompleto);
      costoVentas.push(this.vendedorOrdenesMes[i].costo);
      cantOt.push(this.vendedorOrdenesMes[i].cantidad);
    }
    this.multiAxisData = {
      labels: vendedores,
      datasets: [{
        label: 'Cantidad de Ordenes de Trabajo hechas ',
        backgroundColor: [ '#42A5F5', ],
        yAxisID: 'y',
        data: cantOt
      },
      {
        label: 'Valor Total de Ordenes de Trabajo ',
        backgroundColor: '#4169E1',
        yAxisID: 'y1',
        data: costoVentas
      }]
    };
    this.multiAxisOptions = {
      plugins: {
        legend: {
          labels: { color: '#495057' }
        },
        tooltips: {
          mode: 'index',
          intersect: true
        }
      },
      scales: {
        x: {
          ticks: { color: '#495057' },
          grid: { color: '#ebedef' }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          ticks: {
            min: 0,
            max: 100,
            color: '#495057'
          },
          grid: { color: '#ebedef' }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          grid: {
            drawOnChartArea: false,
            color: '#ebedef'
          },
          ticks: {
            min: 0,
            max: 100,
            color: '#495057'
          }
        }
      }
    };
  }

  // Funcion que va a llenar la grafica con informacion de los clientes
  llenarGraficaClientes(){
    this.mostrarGrafica = true;
    this.nombreGrafica = `Grafica de Clientes`;
    let clientes : any = [];
    let costo : any = [];
    let cantOt : any = [];
    for (let i = 0; i < 5; i++) {
      clientes.push(this.clientesOrdenesMes[i].clienteNom);
      costo.push(this.clientesOrdenesMes[i].costo);
      cantOt.push(this.clientesOrdenesMes[i].cantidad);
    }
    this.multiAxisData = {
      labels: clientes,
      datasets: [{
        label: 'Cantidad de Ordenes de Trabajo hechas ',
        backgroundColor: [
          '#AB47BC',
          '#42A5F5',
          '#66BB6A',
          '#FFCA28',
          '#26A69A'
        ],
        yAxisID: 'y',
        data: cantOt
      },
      {
        label: 'Valor Total de Ordenes de Trabajo ',
        backgroundColor: [ '#F5B041', ],
        yAxisID: 'y1',
        data: costo
      }]
    };
    this.multiAxisOptions = {
      plugins: {
        legend: {
          labels: { color: '#495057' }
        },
        tooltips: {
          mode: 'index',
          intersect: true
        }
      },
      scales: {
        x: {
          ticks: {
            color: '#495057'
          },
          grid: { color: '#ebedef' }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          ticks: {
            min: 0,
            max: 100,
            color: '#495057'
          },
          grid: { color: '#ebedef' }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          grid: {
            drawOnChartArea: false,
            color: '#ebedef'
          },
          ticks: {
            min: 0,
            max: 100,
            color: '#495057'
          }
        }
      }
    };
  }

  // Funcion que va a llenar la grafica con información de los estados de las ordenes
  llenarGraficaEstadosOrdenes(){
    this.mostrarGrafica = true;
    this.nombreGrafica = `Grafica de Estados de Ordenes`;
    this.multiAxisData = {
      labels: ['Abierta', 'Asignada', 'En proceso', 'Terminada', 'Anulado', 'Cerrada'],
      datasets: [{
        label: 'Cantidad de Ordenes de Trabajo',
        backgroundColor: [
          '#F6D45D',
          '#83D3FF',
          '#F3FC20',
          '#8AFC9B',
          '#FF7878',
          '#53CC48'
        ],
        yAxisID: 'y',
        data: [
          this.catidadOTAbiertas,
          this.cantidadOTAsignadas,
          this.cantidadOTIniciada,
          this.cantidadOTTerminada,
          this.cantidadOtAnulada,
          this.cantidadOTCerrada
        ]
      }]
    };
    this.multiAxisOptions = {
      plugins: {
        legend: {
          labels: { color: '#495057' }
        },
        tooltips: {
          mode: 'index',
          intersect: true
        }
      },
      scales: {
        x: {
          ticks: { color: '#495057' },
          grid: { color: '#ebedef' }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          ticks: {
            min: 0,
            max: 100,
            color: '#495057'
          },
          grid: { color: '#ebedef' }
        }
      }
    };
  }

  // Funcion que va a llenar la grafica de las cantidades facturadas en cada mes
  llenarGraficaFacturacion(){
    this.facturasData = {
      labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      datasets: [
        {
          label: 'Facturación',
          data: [
            this.totalFacturado1,
            this.totalFacturado2,
            this.totalFacturado3,
            this.totalFacturado4,
            this.totalFacturado5,
            this.totalFacturado6,
            this.totalFacturado7,
            this.totalFacturado8,
            this.totalFacturado9,
            this.totalFacturado10,
            this.totalFacturado11,
            this.totalFacturado12,
          ],
          yAxisID: 'y',
          borderColor: '#FFA726',
          backgroundColor: 'rgba(255,167,38,0.2)',
          pointStyle: 'rectRot',
          pointRadius: 10,
          pointHoverRadius: 15,
          fill: true,
          tension: 0.3
        }
      ]
    };

    this.facturasOptions = {
      stacked: false,
        plugins: {
          legend: {
            labels: {
              color: '#495057',
              usePointStyle: true,
              font: {
                size: 20
              }
            }
          },
          tooltip: {
            titleFont: {
              size: 50,
            },
            usePointStyle: true,
            bodyFont: {
              size: 30
            }
          }
        },
        tooltip: {
          usePointStyle: true,
        },
        scales: {
          x: {
            ticks: {
              color: '#495057',
              font: {
                size: 20
              }
            },
            grid: {
              color: '#ebedef'
            }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            ticks: {
              color: '#495057',
              font: {
                size: 20
              }
            },
            grid: {
              color: '#ebedef'
            }
          },
          // y1: {
          //   type: 'linear',
          //   display: true,
          //   position: 'right',
          //   ticks: {
          //     color: '#495057',
          //     font: {
          //       size: 20
          //     }
          //   },
          //   grid: {
          //     drawOnChartArea: false,
          //     color: '#ebedef'
          //   }
          // }
        },
        datalabels: {
          anchor: 'end',
          align: 'end'
        }
    };
  }

  // Funcion que va a llenar la grafica con la informacion del iva de las compras mensuales
  llenarGraficaIvaCompra(){
    this.ivaCompraData = {
      labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      datasets: [
        {
          label: 'Total Iva Compra en el mes ',
          data2: [
            this.totalIvaCompra1,
            this.totalIvaCompra2,
            this.totalIvaCompra3,
            this.totalIvaCompra4,
            this.totalIvaCompra5,
            this.totalIvaCompra6,
            this.totalIvaCompra7,
            this.totalIvaCompra8,
            this.totalIvaCompra9,
            this.totalIvaCompra10,
            this.totalIvaCompra11,
            this.totalIvaCompra12
          ],
          fill: true,
          borderColor: '#FFA726',
          tension: 0,
          backgroundColor: 'rgba(255,167,38,0.2)'
        }
      ]
    };

    this.ivaCompraOptions = {
      plugins: {
        legend: {
          labels: { color: '#495057' }
        }
      },
      scales: {
        x: {
          ticks: { color: '#495057' },
          grid: { color: '#ebedef' }
        },
        y: {
          ticks: { color: '#495057' },
          grid: { color: '#ebedef' }
        }
      }
    };
  }

  // Funcion que mostrará el modal de los estados de las ordenes de trabajo, adicional a eso le enviará parametros para que realice la consulta
  mostrarModalEstados(estado : string){
    this.modalEstadosOrdenes = true;
    this.modalEstadosProcesos_OT.modeModal = true;
    if (estado == 'Abierta') {
      this.nombreModalEstados = 'Ordenes de Trabajo Abiertas y No Iniciadas';
      this.modalEstadosProcesos_OT.formularioOT.setValue({
        idDocumento : null,
        fecha: this.primerDiaMes,
        fechaFinal : this.today,
        estado : 15,
        fallasOT : null,
        ObservacionOT : '',
        Vendedor : '',
        cliente : null,
        producto : null,
      });
      this.modalEstadosProcesos_OT.consultarOT();
    } else if (estado == 'Asignada') {
      this.nombreModalEstados = 'Ordenes de Trabajo Asignadas y No Iniciadas';
      this.modalEstadosProcesos_OT.formularioOT.setValue({
        idDocumento : null,
        fecha: this.primerDiaMes,
        fechaFinal : this.today,
        estado : 14,
        fallasOT : null,
        ObservacionOT : '',
        Vendedor : '',
        cliente : null,
        producto : null,
      });
      this.modalEstadosProcesos_OT.consultarOT();
    } else if (estado == 'Inciadas') {
      this.nombreModalEstados = 'Ordenes de Trabajo En Proceso';
      this.modalEstadosProcesos_OT.formularioOT.setValue({
        idDocumento : null,
        fecha: this.primerDiaMes,
        fechaFinal : this.today,
        estado : 16,
        fallasOT : null,
        ObservacionOT : '',
        Vendedor : '',
        cliente : null,
        producto : null,
      });
      this.modalEstadosProcesos_OT.consultarOT();
    } else if (estado == 'Terminadas') {
      this.nombreModalEstados = 'Ordenes de Trabajo Terminadas';
      this.modalEstadosProcesos_OT.formularioOT.setValue({
        idDocumento : null,
        fecha: this.primerDiaMes,
        fechaFinal : this.today,
        estado : 17,
        fallasOT : null,
        ObservacionOT : '',
        Vendedor : '',
        cliente : null,
        producto : null,
      });
      this.modalEstadosProcesos_OT.consultarOT();
    } else if (estado == 'Anuladas') {
      this.nombreModalEstados = 'Ordenes de Trabajo Anuladas';
      this.modalEstadosProcesos_OT.formularioOT.setValue({
        idDocumento : null,
        fecha: this.primerDiaMes,
        fechaFinal : this.today,
        estado : 13,
        fallasOT : null,
        ObservacionOT : '',
        Vendedor : '',
        cliente : null,
        producto : null,
      });
      this.modalEstadosProcesos_OT.consultarOT();
    } else if (estado == 'Cerradas') {
      this.nombreModalEstados = 'Ordenes de Trabajo Cerradas';
      this.modalEstadosProcesos_OT.formularioOT.setValue({
        idDocumento : null,
        fecha: this.primerDiaMes,
        fechaFinal : this.today,
        estado : 18,
        fallasOT : null,
        ObservacionOT : '',
        Vendedor : '',
        cliente : null,
        producto : null,
      });
      this.modalEstadosProcesos_OT.consultarOT();
    }
  }

  // Funcion que va a ordenar el ranking de clientes
  ordenarClientesCostoOrdenes(){
    this.clientesOrdenesMes.sort((a,b) => Number(b.costo) - Number(a.costo));
  }

  // Funcion que va a ordenar el ranking de clientes
  ordenarClientesCantOrdenes(){
    this.clientesOrdenesMes.sort((a,b) => Number(b.cantidad) - Number(a.cantidad));
  }

  // Funcion que va a ordenar el ranking de clientes
  ordenarClientesPesoOrdenes(){
    this.clientesOrdenesMes.sort((a,b) => Number(b.peso) - Number(a.peso));
  }

  // Funcion que va a ordenar el ranking de vendedores
  ordenarVendedoresCostoOrdenes(){
    this.vendedorOrdenesMes.sort((a,b) => Number(b.costo) - Number(a.costo));
  }

  // Funcion que va a ordenar el ranking de clientes
  ordenarVendedoresCantOrdenes(){
    this.vendedorOrdenesMes.sort((a,b) => Number(b.cantidad) - Number(a.cantidad));
  }

  // Funcion que va a ordenar el ranking de clientes
  ordenarVendedoresPesoOrdenes(){
    this.vendedorOrdenesMes.sort((a,b) => Number(b.peso) - Number(a.peso));
  }

  // Funcion que tomará unos parametros para mostrar un mensaje de error
  mensajeError(texto : string, error : any = ''){
    Swal.fire({ icon: 'error', title: 'Opps...', showCloseButton : true, html: `<b>${texto}</b><br>` + `<spam style="color: #f00">${error}</spam>`, });
  }

  // Funcion que va a detectar sorbe que panel está siendo seleccionado
  handleChange(e) {
    var index = e.index;
    if (index == 3) this.pedidosZeus();
  }
}
