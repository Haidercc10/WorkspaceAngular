import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { modelVistasPermisos } from 'src/app/Modelo/modelVistasPermisos';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { RolesService } from 'src/app/Servicios/Roles/roles.service';
import { Vistas_PermisosService } from 'src/app/Servicios/Vistas_Permisos/Vistas_Permisos.service';
import { iconos } from 'src/app/Vistas/Gestion_Vistas/Iconos';
import { imagenes } from 'src/app/Vistas/Gestion_Vistas/Iconos';
import { OverlayPanel } from 'primeng/overlaypanel';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-Gestion_Vistas',
  templateUrl: './Gestion_Vistas.component.html',
  styleUrls: ['./Gestion_Vistas.component.css']
})
export class Gestion_VistasComponent implements OnInit {

  arrayVistas : any = []; /** Array que contend */
  modal : boolean = false; //Variable que indicará si se verá o no el modal
  formVistas !: FormGroup; //.Formulario de vistas
  cargando : boolean = false; //.Carga que iniciará al realizar uan acción
  vistaSeleccionada : any = []; // Vistas seleccionadas con los checkbox
  arrayRoles : any = []; //.Array que cargará los roles 
  rutaImagenes : string = `assets/Iconos_Menu/`; //ruta de las imagenes en el proyecto. 
  arrayVistasPermisos : any = []; //.Array que mostrará todas las vistas
  palabra : string = `Crear` //.Palabra que indicará si la cción a realizar es crear o actualizar.
  @ViewChild('dt') dt: Table | undefined;
  totalVistas : number = 0; //Cantidad total de vistas
  rows = 10; /** Filas de la tabla que se cargaran inicialmente  */
  first = 0; /** variable la cantidad de registros con los que inicia la tabla.  */
  iconos2 : any = []; /** Variable que mostrará todos los iconos de primeng */
  vistaEliminar : any = []; /* Vista a eliminar desde la ultima columna de la tabla. */
  infoRoles : any = []; //.Variable que mostrará la lista de los roles al presionar el botón ver roles de la tabla.
  arrayRutas : any = []; //.Array que guardará las rutas de las vistas para evitar que se cree una igual
  nombreVistas : any = []; //.Array que gurardará los nombres de las vistas para evitar que se cree una igual
  modoSeleccionado : boolean; //.Variable que servirá para cambiar estilos en el modo oscuro/claro
  imagenes : any = []; //.Imagenes que se cargarán en la tabla y en los dropdown.

  @ViewChild('op') op: OverlayPanel | undefined;
  
  constructor(private frmBuilder : FormBuilder,
                private srvVistaPermisos : Vistas_PermisosService,
                  private msjs : MensajesAplicacionService,
                    private srvRoles : RolesService,
                      private mensajes : MessageService, 
                        private AppComponent : AppComponent){
    
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;                    
    this.formVistas = this.frmBuilder.group({
      vId: [null],
      vNombre: [null, Validators.required],
      vIcono: [null, Validators.required],
      vDock: [null],
      vCategoria: [null, Validators.required],
      vRuta: ['/', Validators.required],
      vRoles : [null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.cargarVistasDistintas();
    this.cargarRoles();
    this.iconos2 = iconos;
    this.imagenes = imagenes;
  }

  // Función que cargará los roles en el campo del formulario
  cargarRoles = () => this.srvRoles.srvObtenerLista().subscribe(data => this.arrayRoles = data);

  // Función que buscará por el nombre de la vista en la tabla
  aplicarfiltroGlobal = ($event, valorCampo : string) => this.dt!.filterGlobal(($event.target as HTMLInputElement).value, valorCampo);

  // Función que cargará las categorias en el listado del formulario y cargará todas las vistas en la tabla
  cargarVistasDistintas() {
    this.nombreVistas = [];
    this.arrayRutas = [];
    this.arrayVistasPermisos = [];
    this.cargando = true;
    let dato: any;
    this.srvVistaPermisos.Get_Todo().subscribe(data => {
      this.cargarVistas(data);
      data.forEach(item => dato += item.vp_Categoria);
      dato = dato.replaceAll('||', '|').split('|');
      dato.forEach(item => (!["undefined", ""].includes(item) && !this.arrayVistas.includes(item)) ? this.arrayVistas.push(item) : undefined);
    }, () => this.cargando = false, () => this.cargando = false);
  }

  //.Función que registrará o actualizará una vista
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
            if(!this.arrayRutas.includes(this.formVistas.value.vRuta)) {
              if(!this.nombreVistas.includes(this.formVistas.value.vNombre)) {
                this.srvVistaPermisos.Post(modelo).subscribe(() => { 
                  this.msjs.mensajeConfirmacion(`Excelente!`, `Se ha guardado la vista ${modelo.Vp_Nombre} exitosamente!`); 
                  setTimeout(() => { 
                    this.accionModal(`Crear`); 
                    this.cargarVistasDistintas();
                  }, 1000);
                }, () => this.msjs.mensajeError(`Error`, `No fue posible crear la vista ${modelo.Vp_Nombre}, por favor, verifique!`));
              } else this.msjs.mensajeAdvertencia(`Advertencia`, `El nombre de vista "${this.formVistas.value.vNombre}" ya existe, por favor, cambielo!`);
            } else this.msjs.mensajeAdvertencia(`Advertencia`, `La ruta "${this.formVistas.value.vRuta}" ya existe, por favor, cambiela!`);
          }
          //Editar vista
          if(this.palabra == 'Editar') {
            this.srvVistaPermisos.Put(modelo.Vp_Id, modelo).subscribe(() => { 
              this.msjs.mensajeConfirmacion(`Excelente!`, `Se ha actualizado la vista ${modelo.Vp_Nombre} exitosamente!`);
              setTimeout(() => { 
                this.accionModal(`Editar`); 
                this.cargarVistasDistintas();
              }, 1000);
            }, () => this.msjs.mensajeError(`Error`, `No fue posible editar la vista ${modelo.Vp_Nombre}, por favor, verifique!`));
          }
        } else this.msjs.mensajeAdvertencia(`Advertencia`, `Las ruta no puede ser "/", por favor verifique!`);  
      } else this.msjs.mensajeAdvertencia(`Advertencia`, `Las rutas no pueden contener espacios, por favor, verifique!`);
    } else this.msjs.mensajeAdvertencia(`Advertencia`, `Debe completar los campos vacios!`);    
  }

  //.Función que limpiará los campos
  limpiarCampos() {
    this.formVistas.reset();
    this.formVistas.patchValue({ vRuta : '/' });
  }

  //.Función que cargará las vistas en la tabla
  cargarVistas(datos : any){
    for (let index = 0; index < datos.length; index++) {
      let info : any = {
        Id : datos[index].vp_Id,
        Nombre : datos[index].vp_Nombre,
        Icono : datos[index].vp_Icono_Menu,
        Dock : datos[index].vp_Icono_Dock,
        Ruta : datos[index].vp_Ruta,
        Categoria : datos[index].vp_Categoria.slice(1, datos[index].vp_Categoria.length - 1).replaceAll('|', ', '),
        Roles : datos[index].vp_Id_Roles.split('|'),
      }
      info.Roles.shift();
      info.Roles.pop();
      this.arrayVistasPermisos.push(info);
      this.arrayRutas.push(info.Ruta);
      this.nombreVistas.push(info.Nombre);
    }
  }

  //Acción que realizará el modal dependiendo la palabra clave
  accionModal(clave : string) {
    (clave == `Crear`) ? this.modal =  true : this.modal = false;
    this.cargando = false;
    this.palabra = `Crear`;
    this.limpiarCampos();
  }

  //Acción que cargará las vistas para actualizarlas
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

  //Acción que mostrará la elección para confirmar la eliminación de una o varias vistas. 
  mostrarEleccion(item : any){
    this.vistaSeleccionada.length > 1 ? item = this.vistaSeleccionada : this.vistaEliminar = item;
    this.mensajes.add({severity:'warn', key:'eleccion', summary:'Elección', detail: this.vistaSeleccionada.length > 1 ? `Está seguro que desea eliminar las vistas seleccionadas?` : `Está seguro que desea eliminar la vista ${item.Nombre}?`, sticky: true});
  }
  
  //Función que eliminará una o varias vistas de la tabla y de la base de datos.
  eliminarVistas(data : any){
    let esError : boolean = false;
    this.onReject(`eleccion`);
    if(this.vistaSeleccionada.length > 1) { 
      data = this.vistaSeleccionada;
      data.forEach(datos => this.srvVistaPermisos.Delete(datos.Id).subscribe(() => this.arrayVistasPermisos.splice(this.arrayVistasPermisos.findIndex(item => item.Id == datos.Id)), () => esError = true));
    } else {
      data = this.vistaEliminar;
      this.srvVistaPermisos.Delete(data.Id).subscribe(() => esError = false, () => esError = true);
    } 
    if(!esError) {
      this.msjs.mensajeConfirmacion(`OK!`, `Vista(s) eliminada(s) exitosamente!`); 
      this.cargarVistasDistintas();
    } else this.msjs.mensajeError(`Error`, `No fue posible eliminar las vistas seleccionadas, verifique!`);
  }

  //.Quitar mensajes de elección.
  onReject = (dato : any) => this.mensajes.clear(dato);

  //Acción que se realizará al momento de cerrar el modal
  cambiarPalabraClave = () => this.palabra = `Crear`;

  //Función que se realizará al momento de seleccionar el botón de ver roles en la tabla.
  mostrarRoles($event, roles : any){
    this.infoRoles = [];
    roles.forEach(element => {
      if(!['16'].includes(element)) this.srvRoles.srvObtenerListaPorId(element).subscribe(data => this.infoRoles.push(data.rolUsu_Nombre));
    });
    setTimeout(() => {
      this.op!.toggle($event); 
      $event.stopPropagation();
    }, 500);
  }

  //Función que mostrará la cantidad de vistas disponibles
  cantidadVistas() {
    this.totalVistas = 0;
    this.arrayVistasPermisos.forEach(() => this.totalVistas += 1);
    return this.totalVistas;
  }

}
