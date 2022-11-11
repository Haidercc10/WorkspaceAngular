import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { modelRollosDesechos } from 'src/app/Modelo/modelRollosDesechos';
import { BagproService } from 'src/app/Servicios/Bagpro.service';
import { DtIngRollos_ExtrusionService } from 'src/app/Servicios/DtIngRollos_Extrusion.service';
import { RolesService } from 'src/app/Servicios/roles.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-EliminarRollos_Extrusion',
  templateUrl: './EliminarRollos_Extrusion.component.html',
  styleUrls: ['./EliminarRollos_Extrusion.component.css']
})
export class EliminarRollos_ExtrusionComponent implements OnInit {

  public FormConsultarRollos !: FormGroup; //formulario para consultar y crear un ingreso de rollos
  cargando : boolean = true; //Variable para validar que salga o no la imagen de carga
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  grupoProductos : any [] = []; //Variable que guardará de manera descriminada a cada producto
  rollos : any [] = []; //Variable que almacenará los difrentes rollos que se hicieron en la orden de trabajo
  rollosInsertar : any [] = []; //Variable que va a amacenar los diferentes rollos que se van a insertar
  validarRollo : any [] = []; //Variable para validará que el rollo no esté en la tabla
  first = 0;
  rows = 20;
  totalRollos : number = 0; //Variable que almacenará el total de rollos escogidos
  totalCantidad : number = 0; //Variable que almacenará la cantidad de total de kg de los rollos escogidos
  rollosPDF : any [] = []; //Variable que almacenará la informacion de los rollos salientes
  error : boolean = false; //Variable que ayudará a saber si ocurre un error con la eliminación de algun rollo

  constructor(private frmBuilderPedExterno : FormBuilder,
                private rolService : RolesService,
                  @Inject(SESSION_STORAGE) private storage: WebStorageService,
                    private dtIngRollosService : DtIngRollos_ExtrusionService,
                      private bagproService : BagproService,) {

    this.FormConsultarRollos = this.frmBuilderPedExterno.group({
      OT_Id: [null],
      IdRollo : [null],
      fechaDoc : [null],
      fechaFinalDoc: [null],
    });
  }

  ngOnInit() {
    this.lecturaStorage();
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = '$1,';
    return number.toString().replace(exp,rep);
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador y leerá la información de las cookies
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

  // funcion que va a limpiar los campos del formulario
  limpiarForm(){
    this.FormConsultarRollos.setValue({
      OT_Id: null,
      IdRollo: null,
      fechaDoc : null,
      fechaFinalDoc: null,
    });
  }

  // Funcion que va a limpiar todos los campos
  limpiarCampos(){
    this.FormConsultarRollos.setValue({
      OT_Id: null,
      IdRollo: null,
      fechaDoc : null,
      fechaFinalDoc: null,
    });
    this.rollos = [];
    this.error = false;
    this.rollosInsertar = [];
    this.validarRollo = [];
    this.grupoProductos = [];
    this,this.totalCantidad = 0;
    this.totalRollos = 0;
    this.cargando = true;
  }

  // Funcion que va a consultar los rollos
  consultarRollos(){
    let ot : number = this.FormConsultarRollos.value.OT_Id;
    let fechaInicial : any = this.FormConsultarRollos.value.fechaDoc;
    let fechaFinal : any = this.FormConsultarRollos.value.fechaFinalDoc;
    let rollo : number = this.FormConsultarRollos.value.IdRollo;
    let rollos : any = [];
    let consulta : number;
    this.rollos = [];
    this.cargando = false;
    setTimeout(() => {
      if (ot != null && fechaInicial != null && fechaFinal != null) {
        this.bagproService.srvObtenerListaProcExtOt(ot).subscribe(datos_Rollos => {
          consulta = datos_Rollos.length;
          for (let i = 0; i < datos_Rollos.length; i++) {
            if (!rollos.includes(datos_Rollos[i].item) && datos_Rollos[i].nomStatus == 'EXTRUSION' && moment(datos_Rollos[i].fecha.replace('T00:00:00', '')).isBetween(fechaInicial, fechaFinal)) {
              let info : any = {
                Ot : datos_Rollos[i].ot,
                Id : datos_Rollos[i].item,
                IdProducto : datos_Rollos[i].clienteItem,
                Producto : datos_Rollos[i].clienteItemNombre,
                Cantidad : datos_Rollos[i].extnetokg,
                Presentacion : 'Kg',
                Fecha : datos_Rollos[i].fecha.replace('T00:00:00', ''),
              }
              rollos.push(datos_Rollos[i].item);
              this.rollos.push(info);
              this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
            }
          }
        });
      } else if (fechaInicial != null &&  fechaFinal != null) {
        this.bagproService.consultarFechas(fechaInicial, fechaFinal).subscribe(datos_Rollos => {
          consulta = datos_Rollos.length;
          for (let i = 0; i < datos_Rollos.length; i++) {
            if (!rollos.includes(datos_Rollos[i].item) && datos_Rollos[i].nomStatus == 'EXTRUSION') {
              let info : any = {
                Ot : datos_Rollos[i].ot,
                Id : datos_Rollos[i].item,
                IdProducto : datos_Rollos[i].clienteItem,
                Producto : datos_Rollos[i].clienteItemNombre,
                Cantidad : datos_Rollos[i].extnetokg,
                Presentacion : 'Kg',
                Fecha : datos_Rollos[i].fecha.replace('T00:00:00', ''),
              }
              rollos.push(datos_Rollos[i].item);
              this.rollos.push(info);
              this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
            }
          }
        });
      } else if (ot != null && fechaInicial != null) {
        this.bagproService.srvObtenerListaProcExtOt(ot).subscribe(datos_Rollos => {
          consulta = datos_Rollos.length;
          for (let i = 0; i < datos_Rollos.length; i++) {
            if (!rollos.includes(datos_Rollos[i].item) && datos_Rollos[i].nomStatus == 'EXTRUSION' && datos_Rollos[i].fecha.replace('T00:00:00', '') == fechaInicial) {
              let info : any = {
                Ot : datos_Rollos[i].ot,
                Id : datos_Rollos[i].item,
                IdProducto : datos_Rollos[i].clienteItem,
                Producto : datos_Rollos[i].clienteItemNombre,
                Cantidad : datos_Rollos[i].extnetokg,
                Presentacion : 'Kg',
                Fecha : datos_Rollos[i].fecha.replace('T00:00:00', ''),
              }
              rollos.push(datos_Rollos[i].item);
              this.rollos.push(info);
              this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
            }
          }
        });
      } else if (fechaInicial != null) {
        this.bagproService.consultarFechas(fechaInicial, fechaInicial).subscribe(datos_Rollos => {
          consulta = datos_Rollos.length;
          for (let i = 0; i < datos_Rollos.length; i++) {
            if (!rollos.includes(datos_Rollos[i].item) && datos_Rollos[i].nomStatus == 'EXTRUSION') {
              let info : any = {
                Ot : datos_Rollos[i].ot,
                Id : datos_Rollos[i].item,
                IdProducto : datos_Rollos[i].clienteItem,
                Producto : datos_Rollos[i].clienteItemNombre,
                Cantidad : datos_Rollos[i].extnetokg,
                Presentacion : 'Kg',
                Fecha : datos_Rollos[i].fecha.replace('T00:00:00', ''),
              }
              rollos.push(datos_Rollos[i].item);
              this.rollos.push(info);
              this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
            }
          }
        });
      } else if (ot != null) {
        this.bagproService.srvObtenerListaProcExtOt(ot).subscribe(datos_Rollos => {
          consulta = datos_Rollos.length;
          for (let i = 0; i < datos_Rollos.length; i++) {
            if (!rollos.includes(datos_Rollos[i].item) && datos_Rollos[i].nomStatus == 'EXTRUSION') {
              let info : any = {
                Ot : datos_Rollos[i].ot,
                Id : datos_Rollos[i].item,
                IdProducto : datos_Rollos[i].clienteItem,
                Producto : datos_Rollos[i].clienteItemNombre,
                Cantidad : datos_Rollos[i].extnetokg,
                Presentacion : 'Kg',
                Fecha : datos_Rollos[i].fecha.replace('T00:00:00', ''),
              }
              rollos.push(datos_Rollos[i].item);
              this.rollos.push(info);
              this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
            }
          }
        });
      } else if (rollo != null) {
        this.bagproService.srvObtenerListaProcExtrusionRollos(rollo).subscribe(datos_Rollos => {
          consulta = datos_Rollos.length;
          for (let i = 0; i < datos_Rollos.length; i++) {
            if (!rollos.includes(datos_Rollos[i].item) && datos_Rollos[i].nomStatus == 'EXTRUSION') {
              let info : any = {
                Ot : datos_Rollos[i].ot,
                Id : datos_Rollos[i].item,
                IdProducto : datos_Rollos[i].clienteItem,
                Producto : datos_Rollos[i].clienteItemNombre,
                Cantidad : datos_Rollos[i].extnetokg,
                Presentacion : 'Kg',
                Fecha : datos_Rollos[i].fecha.replace('T00:00:00', ''),
              }
              rollos.push(datos_Rollos[i].item);
              this.rollos.push(info);
              this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
            }
          }
        });
      } else {
        this.bagproService.consultarFechas(this.today, this.today).subscribe(datos_Rollos => {
          consulta = datos_Rollos.length;
          for (let i = 0; i < datos_Rollos.length; i++) {
            if (!rollos.includes(datos_Rollos[i].item) && datos_Rollos[i].nomStatus == 'EXTRUSION') {
              let info : any = {
                Ot : datos_Rollos[i].ot,
                Id : datos_Rollos[i].item,
                IdProducto : datos_Rollos[i].clienteItem,
                Producto : datos_Rollos[i].clienteItemNombre,
                Cantidad : datos_Rollos[i].extnetokg,
                Presentacion : 'Kg',
                Fecha : datos_Rollos[i].fecha.replace('T00:00:00', ''),
              }
              rollos.push(datos_Rollos[i].item);
              this.rollos.push(info);
              this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
            }
          }
        });
      }

      setTimeout(() => {
        if (consulta <= 0) Swal.fire(`No hay rollos por salir`);
        this.cargando = true;
      }, 2000);
    }, 3000);
  }

  // Funcion que colocará los rollos que se van a insertar
  llenarRollosAIngresar(item : any){
    for (let i = 0; i < this.rollos.length; i++) {
      if (this.rollos[i].Id == item.Id) this.rollos.splice(i, 1);
    }
    this.rollosInsertar.sort((a,b) => Number(a.Id) - Number(b.Id) );
    this.rollosInsertar.sort((a,b) => Number(a.exits) - Number(b.exits) );
    this.GrupoProductos();
  }

  // Funcion que seleccionará y colocará todos los rollos que se van a insertar
  seleccionarTodosRollos(item : any){
    for (let i = 0; i < item.length; i++) {
      if (item[i].exits != true) this.rollos = [];
    }
    for (let i = 0; i < item.length; i++) {
      if (item[i].exits == true) this.rollos.push(item[i]);
    }
    this.rollosInsertar.sort((a,b) => Number(a.Id) - Number(b.Id) );
    this.rollosInsertar.sort((a,b) => Number(a.exits) - Number(b.exits) );
    this.GrupoProductos();
  }

  //Funcion que va a quitar lo rollos que se van a insertar
  quitarRollosAIngresar(item : any){
    for (let i = 0; i < this.rollosInsertar.length; i++) {
      if (this.rollosInsertar[i].Id == item.Id) this.rollosInsertar.splice(i, 1);
    }
    this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
    this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
    this.GrupoProductos();
  }

  // Funcion que va a quitar todos los rollos que se van a insertar
  quitarTodosRollos(item : any){
    this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
    this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
    this.rollosInsertar = [];
    this.GrupoProductos();
  }

  // Funcion que permitirá ver el total de lo escogido para cada producto
  GrupoProductos(){
    let producto : any = [];
    this.grupoProductos = [];
    for (let i = 0; i < this.rollosInsertar.length; i++) {
      if (!producto.includes(this.rollosInsertar[i].IdProducto)) {
        let cantidad : number = 0;
        let cantRollo : number = 0;
        for (let j = 0; j < this.rollosInsertar.length; j++) {
          if (this.rollosInsertar[i].IdProducto == this.rollosInsertar[j].IdProducto && !this.rollosInsertar[j].exits && !this.rollosInsertar[j].exits) {
            cantidad += this.rollosInsertar[j].Cantidad;
            cantRollo += 1;
          }
        }
        if (cantRollo > 0){
          producto.push(this.rollosInsertar[i].IdProducto);
          let info : any = {
            Ot: this.rollosInsertar[i].Ot,
            Id : this.rollosInsertar[i].IdProducto,
            Nombre : this.rollosInsertar[i].Producto,
            Cantidad : this.formatonumeros(cantidad.toFixed(2)),
            Cantidad2 : cantidad,
            Rollos: this.formatonumeros(cantRollo),
            Rollos2: cantRollo,
            Presentacion : this.rollosInsertar[i].Presentacion,
          }
          this.grupoProductos.push(info);
        }
      }
    }
    setTimeout(() => {
      this.rollosInsertar.sort((a,b) => Number(a.Ot) - Number(b.Ot));
      this.grupoProductos.sort((a,b) => Number(a.Ot) - Number(b.Ot));
      this.calcularTotalRollos();
      this.calcularTotalCantidad();
    }, 500);
  }

  // Funcion que calculará el total de rollos que se están signanado
  calcularTotalRollos() {
    let total = 0;
    for(let sale of this.grupoProductos) {
      total += sale.Rollos2;
    }
    this.totalRollos = total;
  }

  // Funcion que calculará el total de la kg que se está ingresando
  calcularTotalCantidad() {
    let total = 0;
    for(let sale of this.grupoProductos) {
      total += sale.Cantidad2;
    }
    this.totalCantidad = total;
  }

  //
  eliminarRollos(){
    if (this.rollosInsertar.length > 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Confirmación de Eliminación de Rollos',
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: 'Eliminar Rollos',
        denyButtonText: `No Eliminar`,
        cancelButtonText : `Cancelar`,
      }).then((result) => {
        if (result.isConfirmed) this.eliminarRolloIngresado();
        else if (result.isDenied) {
          const Toast = Swal.mixin({
            toast: true,
            position: 'center',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.addEventListener('mouseenter', Swal.stopTimer)
              toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
          });
          Toast.fire({
            icon: 'info',
            title: 'No ha eliminado los rollos'
          });
        }
      });
    } else Swal.fire("¡Debe elegir minimo un rollo para eliminar!");
  }

  //Funcion que va a eliminar el rollo de la base de datos nueva
  eliminarRolloIngresado(){
    this.cargando = false;
    for (let i = 0; i < this.rollosInsertar.length; i++) {
      this.dtIngRollosService.EliminarRollExtrusion(this.rollosInsertar[i].Id).subscribe(datos_eliminados => {  }, error => {
        this.error = true;
        const Toast = Swal.mixin({
          toast: true,
          position: 'center',
          showConfirmButton: false,
          timer: 4500,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
          }
        });
        Toast.fire({
          icon: 'error',
          title: `¡No fue posible eliminar los rollos de la base de datos nueva!`
        });
        this.cargando = true;
      });
    }
    setTimeout(() => { this.eliminarRolloBagpro(); }, 3000);
  }

  // //Funcion que va a eliminar el rollo de bagpro
  eliminarRolloBagpro(){
    for (let i = 0; i < this.rollosInsertar.length; i++) {
      this.bagproService.EliminarRollExtrusion(this.rollosInsertar[i].Id).subscribe(datos_eliminados => {  }, error => {
        this.error = true;
        const Toast = Swal.mixin({
          toast: true,
          position: 'center',
          showConfirmButton: false,
          timer: 4500,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
          }
        });
        Toast.fire({
          icon: 'error',
          title: `¡No fue posible eliminar el rollo ${this.rollosInsertar[i].Id} de BagPro!`
        });
        this.cargando = true;
      });
    }
    setTimeout(() => { this.finalizarEliminacio(); }, 3000);
  }

  //Funcion que se encargará de lenviar el mensaje de confirmación del envio y limpiará los campos
  finalizarEliminacio(){
    if (!this.error) {
      setTimeout(() => {
        const Toast = Swal.mixin({
          toast: true,
          position: 'center',
          showConfirmButton: false,
          timer: 4000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
          }
        });
        Toast.fire({
          icon: 'success',
          title: `¡${this.totalRollos} rollo(s) han sido eliminado(s) correctamente!`
        });
        this.limpiarCampos();
      }, 2000);
    }
  }
}
