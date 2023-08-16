
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MegaMenuItem, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { modelVistasPermisos } from 'src/app/Modelo/modelVistasPermisos';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { RolesService } from 'src/app/Servicios/Roles/roles.service';
import { Vistas_PermisosService } from 'src/app/Servicios/Vistas_Permisos/Vistas_Permisos.service';
import { iconos } from 'src/app/Vistas/prueba-imagen-cat-insumo/Iconos';
import { OverlayPanel } from 'primeng/overlaypanel';

@Component({
  selector: 'app-prueba-imagen-cat-insumo',
  templateUrl: './prueba-imagen-cat-insumo.component.html',
  styleUrls: ['./prueba-imagen-cat-insumo.component.css']
})

export class PruebaImagenCatInsumoComponent implements OnInit {
  arrayVistas : any = [];
  modal : boolean = false;
  formVistas !: FormGroup;
  cargando : boolean = false;
  vistaSeleccionada : any = [];
  arrayRoles : any = [];
  rutaImagenes : string = `assets/Iconos_Menu/`;
  arrayVistasPermisos : any = [];
  palabra : string = `Crear`
  @ViewChild('dt') dt: Table | undefined;
  totalVistas : number = 0;
  rows = 10; /** Filas de la tabla que se cargaran inicialmente  */
  first = 0; /** variable que mostrará  */
  categorias : any = [];
  iconos2 : any = [];
  vistaEliminar : any = [];
  infoRoles : any = [];
  @ViewChild('op') op: OverlayPanel | undefined;
  imagenes : any = [
  {nombre : "activos.png", descripcion: 'Activos' },  {nombre : "factura.png", descripcion: 'Factura' }, {nombre : "carpeta.png", descripcion: 'Carpeta' },  {nombre : "Pedidos_Zeus.png", descripcion: 'Pedidos Zeus' },
  {nombre : "devolucion.png", descripcion: 'Devolución' },  {nombre : "recibos.png", descripcion: 'Recibos' }, {nombre : "salida.png", descripcion: 'Salida' }, {nombre : "reportePedidos.png", descripcion: 'Reporte Pedidos' },
  {nombre : "pedido_mantenimiento.png", descripcion: 'Pedido Mtto.' },  {nombre : "caja.png", descripcion: 'Caja' }, {nombre : "ingresar.png", descripcion: 'Ingresar' }, {nombre : "cronologia.png", descripcion: 'Cronologia' },
  {nombre : "verDocumento.png", descripcion: 'Ver Doc.' },  {nombre : "GestionTickets.png", descripcion: 'Gestión Tickets' }, {nombre : "costos.png", descripcion: 'Costos' },  {nombre : "usuarios.png", descripcion: 'Usuarios' },
  {nombre : "advertencia.png", descripcion: 'Advertencia' },  {nombre : "recuperado.png", descripcion: 'Recuperado' }, {nombre : "Tickets.png", descripcion: 'Tickets' }, {nombre : "Entrega_Mercancia.png", descripcion: 'Entrega' },
  {nombre : "eliminar.png", descripcion: 'Eliminar' },  {nombre : "calcular_Costos.png", descripcion: 'Calcular Costos' }, {nombre : "Mantenimiento.png", descripcion: 'Mantenimiento' }, {nombre : "home.png", descripcion: 'Casa' },
  {nombre : "pedidos.png", descripcion: 'Pedidos' },  {nombre : "reporteEliminados.png", descripcion: 'Reporte Eliminados' }, {nombre : "tinta.png", descripcion: 'Tinta' }, {nombre : "materiaPrima.png", descripcion: 'Materia Prima' },
  {nombre : "bodega.png", descripcion: 'Bodega' },  {nombre : "camion.png", descripcion: 'Camión' }, {nombre : "crearOrden.png", descripcion: 'Crear Orden' },];

  constructor(private frmBuilder : FormBuilder,
                private srvVistaPermisos : Vistas_PermisosService,
                  private msjs : MensajesAplicacionService,
                    private srvRoles : RolesService,
                      private mensajes : MessageService, ){

    this.formVistas = this.frmBuilder.group({
      vId: [null],
      vNombre: [null, Validators.required],
      vIcono: [null, Validators.required],
      vDock: [null],
      vCategoria: [null, Validators.required],
      vRuta: ['/', Validators.required],
      vRoles : [null, Validators.required],
    })
  }

  ngOnInit(): void {
    this.cargarVistasDistintas();
    this.cargarRoles();
    this.iconos2 = iconos;
  }

  cargarVistasDistintas() {
    this.arrayVistasPermisos = [];
    this.totalVistas = 0;
    this.cargando = true;
    let dato: any;
    this.srvVistaPermisos.Get_Todo().subscribe(data => {
      this.cargarVistas(data);
      data.forEach(item => { dato += item.vp_Categoria; });
      dato = dato.replaceAll('||', '|').split('|');
      dato.forEach(item => (!["undefined", ""].includes(item) && !this.arrayVistas.includes(item)) ? this.arrayVistas.push(item) : undefined);
    });
    setTimeout(() => this.cargando = false, 1500);
  }

  registrarVista(){
    if(this.formVistas.valid) {
      if(!this.formVistas.value.vRuta.toString().includes(' ')) {
        if(this.formVistas.value.vRuta != '/') {
          this.cargando = true;
          let modelo : modelVistasPermisos = {
            Vp_Id : this.palabra == `Crear` ? 0 : this.formVistas.value.vId,
            Vp_Nombre: this.formVistas.value.vNombre,
            Vp_Icono_Dock: this.rutaImagenes + `${this.formVistas.value.vDock}`,
            Vp_Icono_Menu: this.formVistas.value.vIcono,
            Vp_Ruta: this.formVistas.value.vRuta.toString().replace(' ', '-'),
            Vp_Categoria: `|${this.formVistas.value.vCategoria.toString().replaceAll(',', '|')}|`,
            Vp_Id_Roles: `|${this.formVistas.value.vRoles.toString().replaceAll(',', '|')}|`,
          }
          //Crear vista
          if(this.palabra == 'Crear') {
            this.srvVistaPermisos.Post(modelo).subscribe(data => { 
              this.msjs.mensajeConfirmacion(`Excelente!`, `Se ha guardado la vista ${modelo.Vp_Nombre} exitosamente!`); 
              setTimeout(() => { 
                this.accionModal(`Crear`); 
                this.cargarVistasDistintas();
              }, 1000);
            }, error => { this.msjs.mensajeError(`Error`, `No fue posible crear la vista ${modelo.Vp_Nombre}, por favor, verifique!`); });
          }
          //Editar vista
          if(this.palabra == 'Editar') {
            this.srvVistaPermisos.Put(modelo.Vp_Id, modelo).subscribe(data => { 
              this.msjs.mensajeConfirmacion(`Excelente!`, `Se ha actualizado la vista ${modelo.Vp_Nombre} exitosamente!`);
              setTimeout(() => { 
                this.accionModal(`Editar`); 
                this.cargarVistasDistintas();
              }, 1000);
            }, error => { this.msjs.mensajeError(`Error`, `No fue posible editar la vista ${modelo.Vp_Nombre}, por favor, verifique!`); });
          }

        } else this.msjs.mensajeAdvertencia(`Advertencia`, `Las ruta no puede ser "/", por favor verifique!`);  
      } else this.msjs.mensajeAdvertencia(`Advertencia`, `Las rutas no pueden contener espacios, por favor, verifique!`);
    } else this.msjs.mensajeAdvertencia(`Advertencia`, `Debe completar los campos vacios!`);
    
  }

  limpiarCampos() {
    this.formVistas.reset();
    this.formVistas.patchValue({ vRuta : '/' });
  }

  cargarRoles = () => this.srvRoles.srvObtenerLista().subscribe(data => {this.arrayRoles = data});

  aplicarfiltroGlobal = ($event, valorCampo : string) => this.dt!.filterGlobal(($event.target as HTMLInputElement).value, valorCampo);

  cargarVistas(datos : any){
    for (let index = 0; index < datos.length; index++) {
      let info : any = {
        Id : datos[index].vp_Id,
        Nombre : datos[index].vp_Nombre,
        Icono : datos[index].vp_Icono_Menu,
        Dock : datos[index].vp_Icono_Dock,
        Ruta : datos[index].vp_Ruta,
        Categoria : datos[index].vp_Categoria.slice(1, datos[index].vp_Categoria.length - 1).replaceAll('|', ', '),
        Roles : datos[index].vp_Id_Roles.split('|'), //.replaceAll('|', ', ').substring(2, (datos[index].vp_Id_Roles.replaceAll('|', ', ').length - 2)),
      }
      info.Roles.shift();
      info.Roles.pop();
      this.arrayVistasPermisos.push(info);
      this.totalVistas += 1;
    }
    
  }

  accionModal(clave : string) {
    (clave == `Crear`) ? this.modal =  true : this.modal = false;
    this.cargando = false;
    this.palabra = `Crear`;
    this.limpiarCampos();
  }

  cargarVistas_Id(vista : any){
    let imagen : any;
    let icono : any;
    let roles : any = [];
    let rolesCargar : any = [];
    let categorias : any = [];
    let rolesSeleccionados : any [] = [];
    this.modal = true;
    this.palabra = `Editar`;
    this.srvVistaPermisos.Get_By_Id(vista.Id).subscribe(data => {
      roles = data.vp_Id_Roles.split('|'); 
      roles.shift(); 
      roles.pop();
      categorias = data.vp_Categoria.split('|'); 
      categorias.shift(); 
      categorias.pop();
      roles.forEach(element => { 
        if(!['16'].includes(element)) {
          this.srvRoles.srvObtenerListaPorId(element).subscribe(data => {
            this.arrayRoles.forEach(rol => {
              if (data.rolUsu_Id === rol.rolUsu_Id) {
                rolesCargar.push(rol);
                rolesSeleccionados.push(data.rolUsu_Id);
                this.formVistas.patchValue({vRoles : rolesSeleccionados});
              }
            });
          });
        }
      });
      imagen = this.imagenes.filter(item => item.nombre == data.vp_Icono_Dock.replace('assets/Iconos_Menu/', ''));
      icono = this.iconos2.filter(item => item.icon == data.vp_Icono_Menu);

      this.formVistas.patchValue({
        vId: data.vp_Id, 
        vNombre: data.vp_Nombre, 
        vIcono: icono[0].icon,
        vDock: imagen[0].nombre, 
        vCategoria: categorias, 
        vRuta: data.vp_Ruta,        
      });
    });
  }

  mostrarEleccion(item : any){
    this.vistaEliminar = item;
    console.log(this.vistaSeleccionada.length)
    this.mensajes.add({severity:'warn', key:'eleccion', summary:'Elección', detail: this.vistaSeleccionada.length > 1 ? `Está seguro que desea eliminar las vistas seleccionadas?` : `Está seguro que desea eliminar la vista ${item.Nombre}?`, sticky: true});
  }
  
  eliminarVistas(data : any){
   let esError : boolean = false;
   this.onReject(`eleccion`);
   if(this.vistaSeleccionada.length > 1) { 
    
    this.vistaSeleccionada.forEach(element => { 
      this.srvVistaPermisos.Delete(element.Id).subscribe(datos => { 
        
       }, error => { esError = true; } );
    });
   } else {
    data = this.vistaEliminar;
    this.srvVistaPermisos.Delete(data.Id).subscribe(data => { esError = false;  }, error => { esError = true; });
   } 

   if(!esError) {
    this.msjs.mensajeConfirmacion(`OK!`, `Vista(s) eliminada(s) exitosamente!`); 
    this.cargarVistasDistintas();
   } else this.msjs.mensajeError(`Error`, `No fue posible eliminar las vistas seleccionadas, verifique!`);
  }

  onReject = (dato : any) => this.mensajes.clear(dato);

  cambiarPalabraClave = () => this.palabra = `Crear`;

  mostrarRoles($event, roles : any){
    this.infoRoles = [];
    roles.forEach(element => { 
      if(!['16'].includes(element)) {
        this.srvRoles.srvObtenerListaPorId(element).subscribe(data => { this.infoRoles.push(data.rolUsu_Nombre); }); 
      } 
    });
    setTimeout(() => { this.op!.toggle($event); $event.stopPropagation(); }, 500);
  }
}

