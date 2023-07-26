import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import moment from 'moment';
import { MenuItem } from 'primeng/api';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { VistasFavoritasService } from 'src/app/Servicios/VistasFavoritas/VistasFavoritas.service';
import { Vistas_PermisosService } from 'src/app/Servicios/Vistas_Permisos/Vistas_Permisos.service';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-VistasFavoritas',
  templateUrl: './VistasFavoritas.component.html',
  styleUrls: ['./VistasFavoritas.component.css']
})

export class VistasFavoritasComponent implements OnInit {
  
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
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro

  constructor(private AppComponent : AppComponent,
                private vistasFavService : VistasFavoritasService,
                  private msj : MensajesAplicacionService,
                    private vistasPermisos : Vistas_PermisosService,
                      private router : Router) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
  }

  ngOnInit() {
    this.lecturaStorage();
    this.llenarVistasDisponibles();
    this.buscarFavoritos();
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  // Llenar datos con todas las opciones de vistas que puede seleccionar como favoritas
  llenarVistasDisponibles = () => this.vistasPermisos.Get_By_Rol(this.ValidarRol).subscribe(data => this.disponibles = data);

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
        command: () => this.router.navigateByUrl('/home')
      }
    );    
    this.disponibles.forEach(disponible => {
      if (this.vistasFavoritas.includes(disponible.id)) {
        let { nombre, icono, ruta } = disponible;
        let info: any = {
          label: nombre,
          tooltipOptions: {
            tooltipLabel: nombre,
            tooltipPosition: 'top',
            positionTop: -15,
            positionLeft: 15
          },
          icon: icono,
          command: () => this.router.navigateByUrl(ruta)
        };
        this.dockItems.push(info);
        this.seleccionados.push(disponible.id);
      }
    });
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
        command: () => this.llenarDatosRol()
      }
    );
    this.responsiveOptions = [
      { breakpoint: '1024px', numVisible: 3 },
      { breakpoint: '768px', numVisible: 2 },
      { breakpoint: '560px', numVisible: 1 }
    ];
  }

  // Funcion que llenará los datos segun el rol del usuario logeado, si no encuentra ninguna vista como favorita no pondrá ninguno en la vista
  llenarDatosRol(){
    this.targetProducts = [];
    this.disponiblesMostrar = [];
    for (let i = 0; i < this.disponibles.length; i++) {
      if (!this.seleccionados.includes(this.disponibles[i].id)) this.disponiblesMostrar.push(this.disponibles[i]);
      else this.targetProducts.push(this.disponibles[i]);
      if ((i + 1) == this.disponibles.length) this.displayTerminal = true;
    }
  }

  // Funcion que validará que solo se puedan elegir 5 vistas favoritas y redireccionará a la funcion que gusada o actualiza las vistas escogidas
  elegirFavoritos(){
    if (this.targetProducts.length > 5) {
      this.msj.mensajeAdvertencia('Advertencia', 'Solo puede elegir 5 favoritos');
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
    this.vistasFavService.getVistasFavUsuario(this.storage_Id).subscribe(data => {
      data.forEach(element => {
        this.vistasFavoritas = [ element.vistaFav_Num1, element.vistaFav_Num2, element.vistaFav_Num3, element.vistaFav_Num4, element.vistaFav_Num5, ]
        this.mostrarVistasFav();
      });
    }, () => this.msj.mensajeError(`¡No se pudo obtener información de las vistas favoritas!`, '¡No se pudieron encontrar sus vistas favoritas!'));
  }

  // Funcion que añadirá o actualizará la base de datos con las vistas favoritas que ha elegido un usuario
  añadirVistasFavoritas(){
    if (this.vistasFavoritas.length == 0) {
      for (let i = 0; i < this.targetProducts.length; i++) {
        let info : any = {
          Usua_Id : this.storage_Id,
          VistaFav_Num1 : this.targetProducts[i] == undefined ? 0 : this.targetProducts[i].id,
          VistaFav_Num2 : this.targetProducts[i + 1] == undefined ? 0 : this.targetProducts[i + 1].id,
          VistaFav_Num3 : this.targetProducts[i + 2] == undefined ? 0 : this.targetProducts[i + 2].id,
          VistaFav_Num4 : this.targetProducts[i + 3] == undefined ? 0 : this.targetProducts[i + 3].id,
          VistaFav_Num5 : this.targetProducts[i + 4] == undefined ? 0 : this.targetProducts[i + 4].id,
          VistaFav_Fecha : moment().format('YYYY-MM-DD'),
          VistaFav_Hora : moment().format('H:mm:ss'),
        }
        this.vistasFavService.insertVistasFavoritas(info).subscribe(() => this.buscarFavoritos(), () => this.msj.mensajeError(`¡Ocurrió un error al guardar las vistas elegidas!`, '¡No se pudieron guardar las vistas elegidas!'));
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
            this.vistasFavService.updateVistasFavoritas(datos_vistasFav[i].vistasFav_Id, info).subscribe(() => this.buscarFavoritos(), () => this.msj.mensajeError( `¡No se pudieron actualizar las vistas favoritas!`, '¡No se pudieron guardar las vistas elegidas!'));
          } else {
            for (let j = 0; j < this.targetProducts.length; j++) {
              let info : any = {
                VistasFav_Id: datos_vistasFav[i].vistasFav_Id ,
                Usua_Id : this.storage_Id,
                VistaFav_Num1 : this.targetProducts[i] == undefined ? 0 : this.targetProducts[i].id,
                VistaFav_Num2 : this.targetProducts[i + 1] == undefined ? 0 : this.targetProducts[i + 1].id,
                VistaFav_Num3 : this.targetProducts[i + 2] == undefined ? 0 : this.targetProducts[i + 2].id,
                VistaFav_Num4 : this.targetProducts[i + 3] == undefined ? 0 : this.targetProducts[i + 3].id,
                VistaFav_Num5 : this.targetProducts[i + 4] == undefined ? 0 : this.targetProducts[i + 4].id,
                VistaFav_Fecha : moment().format('YYYY-MM-DD'),
                VistaFav_Hora : moment().format('H:mm:ss'),
              }
              this.vistasFavService.updateVistasFavoritas(datos_vistasFav[i].vistasFav_Id, info).subscribe(() => this.buscarFavoritos(), () => this.msj.mensajeError( `¡No se pudieron actualizar las vistas favoritas!`, '¡No se pudieron guardar las vistas elegidas!'));
              break;
            }
          }
        }
      });
    }
  }
}
