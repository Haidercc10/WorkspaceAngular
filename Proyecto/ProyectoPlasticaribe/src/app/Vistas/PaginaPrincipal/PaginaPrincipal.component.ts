import { Component, Inject, OnInit } from '@angular/core';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { MenuItem, MessageService } from 'primeng/api';
import { RolesService } from 'src/app/Servicios/Roles/roles.service';
import { VistasFavoritasService } from 'src/app/Servicios/VistasFavoritas/VistasFavoritas.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-PaginaPrincipal',
  templateUrl: './PaginaPrincipal.component.html',
  styleUrls: ['./PaginaPrincipal.component.css']
})

export class PaginaPrincipalComponent implements OnInit {

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

  constructor(@Inject(SESSION_STORAGE) private storage: WebStorageService,
                private rolService : RolesService,
                  private vistasFavService : VistasFavoritasService,
                    private messageService: MessageService) { }

  ngOnInit() {
    this.lecturaStorage();
    this.llenarDatosSeleccionables();
    this.buscarFavoritos();
    setTimeout(() => { this.mostrarVistasFav(); }, 1500);
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
    });
  }

  // Llenar datos con todas las opciones de vistas que puede seleccionar como favoritas
  llenarDatosSeleccionables(){
    this.disponibles = [
      { id : 2, nombre : 'Eliminar Rollos', icono : 'assets/Iconos_Menu/eliminar.png', categoria: 'Bodega de Extrusión', ruta : './Eliminar-rollos', roles : [1], },
      { id : 3, nombre : 'Ingreso de Rollos', icono : 'assets/Iconos_Menu/ingresar.png', categoria: 'Bodega de Extrusión', ruta : './IngresoRollos-Extrusion', roles : [1,5], },
      { id : 4, nombre : 'Salida de Rollos', icono : 'assets/Iconos_Menu/salida.png', categoria: 'Bodega de Extrusión', ruta : './AsignacionRollos-Extrusion', roles : [1,5], },
      { id : 5, nombre : 'Asignación de BOPP', icono : 'assets/Iconos_Menu/salida.png', categoria: 'BOPP / BOPA / POLIESTER', ruta : './AsignacionBOPPTemporal', roles : [1,3], },
      { id : 6, nombre : 'Entrada de BOPP', icono : 'assets/Iconos_Menu/ingresar.png', categoria: 'BOPP / BOPA / POLIESTER', ruta : './entrada-BOPP', roles : [1,3], },
      { id : 7, nombre : 'Ingresar Rollos', icono : 'assets/Iconos_Menu/ingresar.png', categoria: 'Despacho', ruta : './ingresar-productos', roles : [1,10], },
      { id : 8, nombre : 'Facturar Rollos', icono : 'assets/Iconos_Menu/factura.png', categoria: 'Despacho', ruta : './asignacion-productos-facturas', roles : [1,6], },
      { id : 9, nombre : 'Despachar Mercancia', icono : 'assets/Iconos_Menu/camion.png', categoria: 'Despacho', ruta : './factura-rollos-productos', roles : [1,10], },
      { id : 10, nombre : 'Devolución de Rollos', icono : 'assets/Iconos_Menu/devolucion.png', categoria: 'Despacho', ruta : './devolucion-rollos-productos', roles : [1,10], },
      { id : 11, nombre : 'Pre Ingreso Extrusión', icono : 'assets/Iconos_Menu/ingresar.png', categoria: 'Despacho', ruta : './preingreso-extrusion', roles : [1,7], },
      { id : 12, nombre : 'Pre Ingreso Sellado/Empaque', icono : 'assets/Iconos_Menu/ingresar.png', categoria: 'Despacho', ruta : './preingreso-sellado', roles : [1,8,9], },
      { id : 13, nombre : 'Gestor de Archivos', icono : 'assets/Iconos_Menu/carpeta.png', categoria: 'Gestor de Archivos', ruta : './Archivos', roles : [1,2,3], },
      { id : 14, nombre : 'Asignación Materia Prima', icono : 'assets/Iconos_Menu/salida.png', categoria: 'Materia Prima', ruta : './asignacionMP', roles : [1,3], },
      { id : 15, nombre : 'Creación Tintas', icono : 'assets/Iconos_Menu/tinta.png', categoria: 'Materia Prima', ruta : '/asignacion-tintas', roles : [1,3], },
      { id : 16, nombre : 'Devoluciones', icono : 'assets/Iconos_Menu/devolucion.png', categoria: 'Materia Prima', ruta : './mp-devoluciones', roles : [1,3], },
      { id : 17, nombre : 'Entradas', icono : 'assets/Iconos_Menu/ingresar.png', categoria: 'Materia Prima', ruta : './MateriaPrima', roles : [1,3], },
      { id : 18, nombre : 'Materias Primas', icono : 'assets/Iconos_Menu/materiaPrima.png', categoria: 'Materia Prima', ruta : './materias_primas', roles : [1], },
      { id : 19, nombre : 'Orden de Compra', icono : 'assets/Iconos_Menu/crearOrden.png', categoria: 'Materia Prima', ruta : './ocompra-materiaPrima', roles : [1], },
      { id : 20, nombre : 'Recuperado', icono : 'assets/Iconos_Menu/recuperado.png', categoria: 'Materia Prima', ruta : './mp-recuperada', roles : [1,3], },
      { id : 21, nombre : 'Movimientos Bodega de Extrusión', icono : 'assets/Iconos_Menu/bodega.png', categoria: 'Movimientos', ruta : './ReporteRollos-Extrusion', roles : [1,5], },
      { id : 22, nombre : 'Entradas de Materia Prima', icono : 'assets/Iconos_Menu/recibos.png', categoria: 'Movimientos', ruta : './reporte-facturas-remisiones-mp', roles : [1,3], },
      { id : 23, nombre : 'Movimientos Despacho', icono : 'assets/Iconos_Menu/caja.png', categoria: 'Movimientos', ruta : './reporte-despacho', roles : [1,6,7,8,9,10], },
      { id : 24, nombre : 'Movimientos BOPP', icono : 'assets/Iconos_Menu/materiaPrima.png', categoria: 'Movimientos', ruta : './movimientos-bopp', roles : [1,3], },
      { id : 25, nombre : 'Movimientos MP', icono : 'assets/Iconos_Menu/materiaPrima.png', categoria: 'Movimientos', ruta : './movimientos-matprima', roles : [1,3], },
      { id : 26, nombre : 'Movimientos Tintas', icono : 'assets/Iconos_Menu/tinta.png', categoria: 'Movimientos', ruta : './movimientos-tintas', roles : [1,3], },
      { id : 27, nombre : 'Movimientos Recuperado', icono : 'assets/Iconos_Menu/recuperado.png', categoria: 'Movimientos', ruta : './reporte-recuperado-mp', roles : [1,3], },
      { id : 28, nombre : 'Movimientos Ordenes de Compra', icono : 'assets/Iconos_Menu/recibos.png', categoria: 'Movimientos', ruta : './reporte-orden-compra', roles : [1], },
      { id : 29, nombre : 'Crear OT', icono : 'assets/Iconos_Menu/crearOrden.png', categoria: 'Orden de Trabajo', ruta : './ordenes-trabajo', roles : [1], },
      { id : 30, nombre : 'Pedidos Externos', icono : 'assets/Iconos_Menu/pedidos.png', categoria: 'Pedidos', ruta : './pedido-externo', roles : [1,2], },
      { id : 31, nombre : 'Ver Pedidos', icono : 'assets/Iconos_Menu/verDocumento.png', categoria: 'Pedidos', ruta : './opedidoproducto', roles : [1,2], },
      { id : 32, nombre : 'Producto Terminado (Zeus)', icono : 'assets/Iconos_Menu/bodega.png', categoria: 'Productos', ruta : './inventario-productos-terminados', roles : [1], },
      { id : 33, nombre : 'Producto Terminado', icono : 'assets/Iconos_Menu/bodega.png', categoria: 'Productos', ruta : './inventario-productos', roles : [1], },
      { id : 34, nombre : 'Inventario Bodega Extrusión', icono : 'assets/Iconos_Menu/bodega.png', categoria: 'Repórtes', ruta : './Inventario-Extrusion', roles : [1,5], },
      { id : 35, nombre : 'Inventario de Materia Prima', icono : 'assets/Iconos_Menu/bodega.png', categoria: 'Repórtes', ruta : './reporte-Materia-Prima', roles : [1,3], },
      { id : 36, nombre : 'Reportes de Costos', icono : 'assets/Iconos_Menu/costos.png', categoria: 'Repórtes', ruta : './reporte-costos-ot', roles : [1], },
      { id : 37, nombre : 'Reporte de Pedidos', icono : 'assets/Iconos_Menu/reportePedidos.png', categoria: 'Repórtes', ruta : './estados-ot-vendedore', roles : [1,2], },
      { id : 38, nombre : 'Reporte Procesos OT', icono : 'assets/Iconos_Menu/cronologia.png', categoria: 'Repórtes', ruta : './reportes-procesos-ot', roles : [1,12], },
      { id : 39, nombre : 'Reporte Rollos Eliminados', icono : 'assets/Iconos_Menu/reporteEliminados.png', categoria: 'Repórtes', ruta : './reporte-rollos-eliminados', roles : [1], },
      { id : 40, nombre : 'Usuarios', icono : 'assets/Iconos_Menu/usuarios.png', categoria: 'Usuarios', ruta : './registro-usuario', roles : [1], },
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
        command: () => { this.llenarDatosRol(); }
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
    });
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
        }, error => {
          Swal.fire({
            icon: 'error',
            title: 'Opps...',
            showCloseButton : true,
            html: `<b>¡No se pudieron guardar las vistas elegidas!</b><br>` + `<spam style="color: #f00">${error.message}</spam>`,
          });
        });
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
            }, error => {
              Swal.fire({
                icon: 'error',
                title: 'Opps...',
                showCloseButton : true,
                html: `<b>¡No se pudieron guardar las vistas elegidas!</b><br>` + `<spam style="color: #f00">${error.message}</spam>`,
              });
            });
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
              }, error => {
                Swal.fire({
                  icon: 'error',
                  title: 'Opps...',
                  showCloseButton : true,
                  html: `<b>¡No se pudieron guardar las vistas elegidas!</b><br>` + `<spam style="color: #f00">${error.message}</spam>`,
                });
              });
              break;
            }
          }
        }
      });
    }
  }
}
