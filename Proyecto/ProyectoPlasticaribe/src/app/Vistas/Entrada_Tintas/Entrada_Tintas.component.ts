import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { RolesService } from 'src/app/Servicios/roles.service';
import { TintasService } from 'src/app/Servicios/tintas.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-Entrada_Tintas',
  templateUrl: './Entrada_Tintas.component.html',
  styleUrls: ['./Entrada_Tintas.component.css']
})
export class Entrada_TintasComponent implements OnInit {

  public load: boolean = true;
  public FormEntradaTintas !: FormGroup;
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  today : any = new Date(); //Variable que se usará para llenar la fecha actual
  unidadMedida = []; //Variable que almacenará las unidades de medida
  tintas = []; //Varibale que almacenará las tintas que se pueden crear
  ArrayTintas : any = []; //Variable que almacenará la informacion de las tintas a las que se les hará el ingreso.
  AccionBoton = "Agregar"; //Varibale para saber si una materia prima está en edicion o no
  validarInputTintas : boolean = true;
  keywordTintas = 'name';
  ArrayvalidarTintas : any = []; //variable para validar que una tinta solo se pueda repetir una vez en la tabla

  constructor(@Inject(SESSION_STORAGE) private storage: WebStorageService,
                private rolService : RolesService,
                  private frmBuilder : FormBuilder,
                        private tintasService : TintasService) {

    this.FormEntradaTintas = this.frmBuilder.group({
      IdTinta : [''],
      Tinta : [''],
      cantidadTinta : [''],
      undMedTinta : ['Kg'],
      Observacion : [''],
      Fecha : [''],
    });
  }

  ngOnInit() {
    this.fecha();
    this.lecturaStorage();
    this.obtenerTintas();
  }

  //
  onChangeSearchTinta(val: string) {
    if (val != '') this.validarInputTintas = false;
    else this.validarInputTintas = true;
  }

  //
  onFocusedTinta(e){
    if (!e.isTrusted) this.validarInputTintas = false;
    else this.validarInputTintas = true;
  }

  //Funcion que colocará la fecha actual y la colocará en el campo de fecha de pedido
  fecha(){
    this.today = new Date();
    var dd : any = this.today.getDate();
    var mm : any = this.today.getMonth() + 1;
    var yyyy : any = this.today.getFullYear();
    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
    this.today = yyyy + '-' + mm + '-' + dd;

    this.FormEntradaTintas = this.frmBuilder.group({
      IdTinta : '',
      Tinta : '',
      cantidadTinta : '',
      undMedTinta : 'Kg',
      Observacion : '',
      Fecha : this.today,
    });
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

  //Funcion limpiará los campos del formulario
  limpiarCampos(){
    this.FormEntradaTintas = this.frmBuilder.group({
      IdTinta : '',
      Tinta : '',
      cantidadTinta : '',
      undMedTinta : 'Kg',
      Observacion : '',
      Fecha : this.today,
    });
  }

  //Funcion que limpiará todo
  limpiarTodo(){
    this.FormEntradaTintas = this.frmBuilder.group({
      IdTinta : '',
      Tinta : '',
      cantidadTinta : '',
      undMedTinta : 'Kg',
      Observacion : '',
      Fecha : this.today,
    });
    this.ArrayTintas = [];
    this.ArrayvalidarTintas = [];
    this.load = true;
  }

  // Funcion que buscará las tintas que se utilizan en la empresa
  obtenerTintas(){
    this.tintasService.srvObtenerLista().subscribe(datos_tintas => {
      for (let i = 0; i < datos_tintas.length; i++) {
        if (datos_tintas[i].tinta_Id != 39){
          let tinta : any = {
            id : datos_tintas[i].tinta_Id,
            name : `${datos_tintas[i].tinta_Id} - ${datos_tintas[i].tinta_Nombre} - ${datos_tintas[i].tinta_CodigoHexadecimal}`,
          }
          this.tintas.push(tinta);
        }
      }
    });
  }

  // funcion que servirá para llenar el campo de unidad de medida de la tinta dependiendo la tinta seleccionada
  buscarTintaSeleccionada(item){
    this.validarInputTintas = false;
    this.FormEntradaTintas.value.Tinta = item;
    let tinta : any = this.FormEntradaTintas.value.Tinta;

    this.tintasService.srvObtenerListaPorId(tinta.id).subscribe(datos_tintas => {
      this.FormEntradaTintas.setValue({
        IdTinta : datos_tintas.tinta_Id,
        Tinta : `${datos_tintas.tinta_Id} - ${datos_tintas.tinta_Nombre} - ${datos_tintas.tinta_CodigoHexadecimal}`,
        cantidadTinta : this.FormEntradaTintas.value.cantidadTinta,
        undMedTinta : 'Kg',
        Observacion : this.FormEntradaTintas.value.Observacion,
        Fecha : this.today,
      });
    });
  }

  // Funcion que permitirá buscar una tinta por su id
  buscarTintaId(){
    this.validarInputTintas = false;
    let idTinta : number = this.FormEntradaTintas.value.IdTinta;

    this.tintasService.srvObtenerListaPorId(idTinta).subscribe(datos_tintas => {
      this.FormEntradaTintas.setValue({
        IdTinta : datos_tintas.tinta_Id,
        Tinta : `${datos_tintas.tinta_Id} - ${datos_tintas.tinta_Nombre} - ${datos_tintas.tinta_CodigoHexadecimal}`,
        cantidadTinta : this.FormEntradaTintas.value.cantidadTinta,
        undMedTinta : 'Kg',
        Observacion : this.FormEntradaTintas.value.Observacion,
        Fecha : this.today,
      });
    });
  }

  // Funcion que llenará la tabla con las tintas a las que se les creará la entrada
  cargarTablaTintas(){
    let idTinta : number = this.FormEntradaTintas.value.IdTinta;
    let Tinta : any = this.FormEntradaTintas.value.Tinta;
    let cantTinta : number = this.FormEntradaTintas.value.cantidadTinta;
    let observacion : string = this.FormEntradaTintas.value.Observacion;

    let info : any = {
      IdTinta : idTinta,
      NombreTinta : Tinta,
      CantTinta : cantTinta,
      UndMed : 'Kg',
    }

    if (this.AccionBoton == "Agregar" && this.ArrayvalidarTintas.length == 0) this.ArrayTintas.push(info);
    else if (this.AccionBoton == 'Agregar' && this.ArrayvalidarTintas.length != 0) {
      if (!this.ArrayvalidarTintas.includes(idTinta)) this.ArrayTintas.push(info);
      else Swal.fire("¡La Tinta ya se encuentra en la tabla con una cantidad asignada!");
    } else {
      for (let index = 0; index < this.ArrayTintas.length; index++) {
        if(info.IdTinta == this.ArrayTintas[index].IdTinta) {
          this.ArrayTintas.splice(index, 1);
          this.AccionBoton = "Agregar";
          this.ArrayTintas.push(info);
          break;
        }
      }
    }
    this.ArrayvalidarTintas.push(idTinta);
    this.limpiarCampos();
  }

  // Función para quitar una de las tintas de la tabla
  QuitarProductoTabla(index : number, formulario : any) {
    Swal.fire({
      title: '¿Estás seguro de eliminar la Tinta de la Entrada?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.ArrayTintas.splice(index, 1);
        Swal.fire('Materia Prima eliminada');
      }
    });
  }

  // Función para editar una de las tintas de la tabla
  EditarProductoTabla(formulario : any) {
    this.AccionBoton = "Editar";
    this.FormEntradaTintas.setValue({
      IdTinta : formulario.IdTinta,
      Tinta : formulario.NombreTinta,
      cantidadTinta : formulario.CantTinta,
      undMedTinta : 'Kg',
      Observacion : this.FormEntradaTintas.value.Observacion,
      Fecha : this.today,
    });
    this.buscarTintaId();
  }

  // Funcion para mover el inventario de las tintas
  moverInventario(){
    this.load = false;
    for (let i = 0; i < this.ArrayTintas.length; i++) {
      this.tintasService.srvObtenerListaPorId(this.ArrayTintas[i].IdTinta).subscribe(datos_tintas => {
        let info : any = {
          Tinta_Id : datos_tintas.tinta_Id,
          Tinta_Nombre : datos_tintas.tinta_Nombre,
          Tinta_Descripcion : datos_tintas.tinta_Descripcion,
          Tinta_CodigoHexadecimal : datos_tintas.tinta_CodigoHexadecimal,
          Tinta_Stock : datos_tintas.tinta_Stock + this.ArrayTintas[i].CantTinta,
          UndMed_Id : datos_tintas.undMed_Id,
          Tinta_Precio : datos_tintas.tinta_Precio,
          CatMP_Id : datos_tintas.catMP_Id,
          TpBod_Id : datos_tintas.tpBod_Id,
        }

        this.tintasService.srvActualizar(this.ArrayTintas[i].IdTinta, info).subscribe(datos_tintas2 => {
          const Toast = Swal.mixin({
            toast: true,
            position: 'center',
            showConfirmButton: false,
            timer: 2500,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.addEventListener('mouseenter', Swal.stopTimer)
              toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
          });
          Toast.fire({
            icon: 'success',
            title: `¡Entrada(s) de Tinta(s) Registrada correctamente!`
          });
        });
      });
    }
    setTimeout(() => {
      this.limpiarTodo();
    }, 2000);
  }
}
