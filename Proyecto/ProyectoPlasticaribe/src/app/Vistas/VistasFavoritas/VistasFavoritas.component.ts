import { Component, OnInit } from '@angular/core';
import moment from 'moment';
import { MenuItem } from 'primeng/api';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { VistasFavoritasService } from 'src/app/Servicios/VistasFavoritas/VistasFavoritas.service';
import { AppComponent } from 'src/app/app.component';
import { vistasDisponibles } from './VistasDisponibles';

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
                  private msj : MensajesAplicacionService,) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
  }

  ngOnInit() {
    this.lecturaStorage();
    if (this.storage_Id.toString() != '') {
      this.llenarDatosSeleccionables();
      this.buscarFavoritos();
      setTimeout(() => this.mostrarVistasFav(), 2500);
    }
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  // Llenar datos con todas las opciones de vistas que puede seleccionar como favoritas
  llenarDatosSeleccionables = () => this.disponibles = vistasDisponibles;

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
          let { nombre, icono, ruta } = this.disponibles[i];
          let info: any = {
            label: nombre,
            tooltipOptions: {
              tooltipLabel: nombre,
              tooltipPosition: 'top',
              positionTop: -15,
              positionLeft: 15
            },
            icon: icono,
            command: () => { window.location.href = ruta; }
          };
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
          this.displayTerminal = true;
          this.llenarDatosRol();
        }
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
      }, error => this.msj.mensajeError(`¡No se pudo obtener información de las vistas favoritas!`, '¡No se pudieron encontrar sus vistas favoritas!'));
    }
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
        this.vistasFavService.insertVistasFavoritas(info).subscribe(() => {
          this.buscarFavoritos();
          setTimeout(() => { this.mostrarVistasFav(); }, 1000);
        }, error => { this.msj.mensajeError(`¡Ocurrió un error al guardar las vistas elegidas!`, '¡No se pudieron guardar las vistas elegidas!'); });
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
            }, error => this.msj.mensajeError( `¡No se pudieron actualizar las vistas favoritas!`, '¡No se pudieron guardar las vistas elegidas!'));
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
              this.vistasFavService.updateVistasFavoritas(datos_vistasFav[i].vistasFav_Id, info).subscribe(() => {
                this.buscarFavoritos();
                setTimeout(() => { this.mostrarVistasFav(); }, 1000);
              }, error => this.msj.mensajeError( `¡No se pudieron actualizar las vistas favoritas!`, '¡No se pudieron guardar las vistas elegidas!'));
              break;
            }
          }
        }
      });
    }
  }
}
