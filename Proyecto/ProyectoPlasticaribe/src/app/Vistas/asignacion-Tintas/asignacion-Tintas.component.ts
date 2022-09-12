import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { AsignacionMPService } from 'src/app/Servicios/asignacionMP.service';
import { AsignacionMPxTintasService } from 'src/app/Servicios/asignacionMPxTintas.service';
import { CrearMateriaprimaService } from 'src/app/Servicios/crear-materiaprima.service';
import { DetallesAsignacionMPxTintasService } from 'src/app/Servicios/detallesAsignacionMPxTintas.service';
import { MateriaPrimaService } from 'src/app/Servicios/materiaPrima.service';
import { RolesService } from 'src/app/Servicios/roles.service';
import { TintasService } from 'src/app/Servicios/tintas.service';
import { UnidadMedidaService } from 'src/app/Servicios/unidad-medida.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-asignacion-Tintas',
  templateUrl: './asignacion-Tintas.component.html',
  styleUrls: ['./asignacion-Tintas.component.css']
})
export class AsignacionTintasComponent implements OnInit {

  public load: boolean;
  public FormAsignacionMP !: FormGroup;
  public FormMateriaPrima !: FormGroup;
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  today : any = new Date(); //Variable que se usará para llenar la fecha actual
  materiasPrimas = []; //Varibale que almacenará las materias primas que se utilizan para la creacion de tintas
  unidadMedida = []; //Variable que almacenará las unidades de medida
  tintas = []; //Varibale que almacenará las tintas que se pueden crear
  ArrayMateriaPrima = []; //Varibale que almacenará las materias primas que se estan asignando para crear una tinta
  AccionBoton = "Agregar"; //Varibale para saber si una materia prima está en edicion o no
  materiaPrimaSeleccionada = []; //Varibale que almacenará temporalmente la materia prima que se buscó por id o se seleccionó para poder llenar el resto de informacion de esta materia prima
  public componenteCrearTintas : boolean = false; //Variable del componente de crear tintas, cambia su estado al llamar la función llamarModalCrearTintas();
  public componenteCrearMateriasPrimas : boolean = false; //Variable del componente de crear tintas, cambia su estado al llamar la función llamarModalMateriasPrimas();
  validarInputTintas : boolean = true;
  keywordTintas = 'name';
  validarInputMp : boolean = true;
  keywordMp = 'name';
  public historyHeading: string = 'Seleccionado Recientemente';

  constructor(@Inject(SESSION_STORAGE) private storage: WebStorageService,
                private rolService : RolesService,
                  private frmBuilder : FormBuilder,
                    private unidadMedidaService : UnidadMedidaService,
                      private materiaPrimaService : MateriaPrimaService,
                        private tintasService : TintasService,
                          private asignacionMPxTintas : AsignacionMPxTintasService,
                            private detallesAsignacionMPxTintas : DetallesAsignacionMPxTintasService,
                            private crearMateriaPrima : CrearMateriaprimaService) {

    this.FormAsignacionMP = this.frmBuilder.group({
      Tinta : ['', Validators.required],
      cantidadTinta : ['', Validators.required],
      undMedTinta : ['', Validators.required],
      Observacion : ['', Validators.required],
      Fecha : ['', Validators.required],
    });

    this.FormMateriaPrima = this.frmBuilder.group({
      idMateriaPrima : ['', Validators.required],
      nombreMateriaPrima : ['', Validators.required],
      stockMateriaPrima : ['', Validators.required],
      cantidadMateriaPrima : ['', Validators.required],
      undMedMateriaPrima : ['', Validators.required],
    });

    this.load = true;
  }

  ngOnInit(): void {
    this.lecturaStorage();
    this.fecha();
    this.obtenerMateriaPrima();
    this.obtenerUnidadesMedida();
    this.obtenerTintas();
  }

  onChangeSearchTinta(val: string) {
    if (val != '') this.validarInputTintas = false;
    else this.validarInputTintas = true;
    // fetch remote data from here
    // And reassign the 'data' which is binded to 'data' property.
  }

  onFocusedTinta(e){
    if (!e.isTrusted) this.validarInputTintas = false;
    else this.validarInputTintas = true;
    // do something when input is focused
  }

  onChangeSearchMp(val: string) {
    if (val != '') this.validarInputMp = false;
    else this.validarInputMp = true;
    // fetch remote data from here
    // And reassign the 'data' which is binded to 'data' property.
  }

  onFocusedMp(e){
    if (!e.isTrusted) this.validarInputMp = false;
    else this.validarInputMp = true;
    // do something when input is focused
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

    this.FormAsignacionMP = this.frmBuilder.group({
      Tinta : '',
      cantidadTinta : '',
      undMedTinta : '',
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

  // Funcion limpiará todos los campos de vista
  limpiarTodosLosCampos(){
    this.FormAsignacionMP = this.frmBuilder.group({
      Tinta : '',
      cantidadTinta : '',
      undMedTinta : '',
      Observacion : '',
      Fecha : this.today,
    });
    this.FormMateriaPrima.setValue({
      idMateriaPrima : '',
      nombreMateriaPrima : '',
      stockMateriaPrima : '',
      cantidadMateriaPrima : '',
      undMedMateriaPrima : '',
    });
    this.ArrayMateriaPrima = [];
    this.AccionBoton = 'Agregar'
  }

  // Funcion que limpiará los campos del apartado de Materias Primas
  limpiarCamposMateriaPrima(){
    this.FormMateriaPrima.setValue({
      idMateriaPrima : '',
      nombreMateriaPrima : '',
      stockMateriaPrima : '',
      cantidadMateriaPrima : '',
      undMedMateriaPrima : '',
    });
  }

  // Funcion que buscará las tintas que se utilizan en la empresa
  obtenerTintas(){
    this.tintasService.srvObtenerLista().subscribe(datos_tintas => {
      for (let i = 0; i < datos_tintas.length; i++) {
        let tinta : any = {
          id : datos_tintas[i].tinta_Id,
          name : datos_tintas[i].tinta_Nombre,
        }
        this.tintas.push(tinta);
      }
    });
  }

  // funcion que servirá para llenar el campo de unidad de medida de la tinta dependiendo la tinta seleccionada
  buscarTintaSeleccionada(item){
    this.validarInputTintas = false;
    this.FormAsignacionMP.value.Tinta = item.id;
    let tinta : any = this.FormAsignacionMP.value.Tinta;

    this.tintasService.srvObtenerListaPorId(tinta).subscribe(datos_tinta => {
      this.FormAsignacionMP .setValue({
        Tinta : this.FormAsignacionMP.value.Tinta,
        cantidadTinta : this.FormAsignacionMP.value.cantidadTinta,
        undMedTinta : datos_tinta.undMed_Id,
        Observacion : this.FormAsignacionMP.value.Observacion,
        Fecha : this.FormAsignacionMP.value.Fecha,
      });
    });
  }

  // Función que buscará las materias primas que se utilizan para crear tintas
  obtenerMateriaPrima(){
    this.materiaPrimaService.srvObtenerLista().subscribe(datos_materiasPrimas => {
      for (let i = 0; i < datos_materiasPrimas.length; i++) {
        if (datos_materiasPrimas[i]) {
          let mp : any = {
            id : datos_materiasPrimas[i].matPri_Id,
            name : datos_materiasPrimas[i].matPri_Nombre,
          }
          this.materiasPrimas.push(mp);
        }
      }
    });
  }

  //Funcion para  obtener las unidades de medidas
  obtenerUnidadesMedida() {
    this.unidadMedidaService.srvObtenerLista().subscribe(datos_unidadesMedida => {
      for (let i = 0; i < datos_unidadesMedida.length; i++) {
        this.unidadMedida.push(datos_unidadesMedida[i].undMed_Id);
      }
    });
  }

  //Funcion que consultara una materia prima con base a un ID pasado en la vista
  buscarMpId(){
    let idMateriaPrima : number = this.FormMateriaPrima.value.idMateriaPrima;
    this.materiaPrimaSeleccionada = [];

    this.materiaPrimaService.srvObtenerListaPorId(idMateriaPrima).subscribe(datos_materiaPrima => {
      this.materiaPrimaSeleccionada.push(datos_materiaPrima);
      this.cargarInfoMP();
    });
  }

  //Funcion que consultara una materia prima con base a la que está seleccionada en la vista
  buscarMpSeleccionada(item){
    this.validarInputMp = false;
    this.FormMateriaPrima.value.nombreMateriaPrima = item.name;
    let nombreMateriaPrima : string = this.FormMateriaPrima.value.nombreMateriaPrima;
    this.materiaPrimaSeleccionada = [];

    this.materiaPrimaService.srvObtenerLista().subscribe(datos_materiasPrimas => {
      for (let index = 0; index < datos_materiasPrimas.length; index++) {
        if (datos_materiasPrimas[index].matPri_Nombre == nombreMateriaPrima) {
          this.materiaPrimaSeleccionada.push(datos_materiasPrimas[index]);
          this.cargarInfoMP();
        }
      }
    });
  }

  //Funcion que llenará la infomacion de materia prima buscada o seleccionada y pasará la informacion a la vista
  cargarInfoMP(){
    for (const Mp of this.materiaPrimaSeleccionada) {
      this.FormMateriaPrima.setValue({
        idMateriaPrima : Mp.matPri_Id,
        nombreMateriaPrima : Mp.matPri_Nombre,
        stockMateriaPrima : Mp.matPri_Stock,
        cantidadMateriaPrima : '',
        undMedMateriaPrima : Mp.undMed_Id,
      });
    }
  }

  //Funcion que validará si alguno de los campos del fomulario de materia prima esta vacio
  validarCamposMateriaPrima(){
    if (this.FormMateriaPrima.valid) this.cargarMateriaPrimaEnTabla(this.ArrayMateriaPrima);
    else Swal.fire("Hay campos vacios en el apartado de seleccion de materia prima");
  }

  // Funcion que cargará las materias primas en las tabla
  cargarMateriaPrimaEnTabla(formulario : any){

    let idMateriaPrima : number = this.FormMateriaPrima.value.idMateriaPrima;
    let nombreMateriaPrima : string = this.FormMateriaPrima.value.nombreMateriaPrima;
    let presentacion : string = this.FormMateriaPrima.value.undMedMateriaPrima;
    let cantidad : number = this.FormMateriaPrima.value.cantidadMateriaPrima;
    let stock : number = this.FormMateriaPrima.value.stockMateriaPrima;

    if (cantidad <= stock) {
      let productoExt : any = {
        Id : idMateriaPrima,
        Nombre : nombreMateriaPrima,
        Cant : cantidad,
        UndCant : presentacion,
        Stock : stock,
      }

      if (this.AccionBoton == "Agregar" && this.ArrayMateriaPrima.length == 0) {
        this.ArrayMateriaPrima.push(productoExt);

      } else if (this.AccionBoton == "Agregar" && this.ArrayMateriaPrima.length != 0){
        this.ArrayMateriaPrima.push(productoExt);
        productoExt = [];
      } else {
        for (let index = 0; index < formulario.length; index++) {
          if(productoExt.Id == this.ArrayMateriaPrima[index].Id) {
            this.ArrayMateriaPrima.splice(index, 1);
            this.AccionBoton = "Agregar";
            this.ArrayMateriaPrima.push(productoExt);
            break;
          }
        }
      }

      this.FormMateriaPrima.setValue({
        idMateriaPrima : '',
        nombreMateriaPrima : '',
        stockMateriaPrima : '',
        cantidadMateriaPrima : '',
        undMedMateriaPrima : '',
      });
      this.ArrayMateriaPrima.sort((a,b)=> Number(a.PrecioUnd) - Number(b.PrecioUnd));
    } else Swal.fire("La cantidad a asignar no debe superar lo que hay en stock ");
  }

  //Funcion que almacenará en la base de datos la informacion general sobre la asignacion de materia prima
  asignarMPCrearTintas(){
    this.load = false;

    let tinta : any = this.FormAsignacionMP.value.Tinta;
    let cantidad : number = this.FormAsignacionMP.value.cantidadTinta;
    let presentacion : string = this.FormAsignacionMP.value.undMedTinta;
    let Observacion : string = this.FormAsignacionMP.value.Observacion;
    let usuario : number = this.storage_Id;
    let fecha : Date = this.today;

    let datos_asignacionMP : any = {
      Tinta_Id : tinta,
      AsigMPxTinta_Cantidad : cantidad,
      UndMed_Id : presentacion,
      AsigMPxTinta_FechaEntrega : fecha,
      AsigMPxTinta_Observacion : Observacion,
      Usua_Id : usuario,
      Estado_Id : 13,
    }

    this.asignacionMPxTintas.srvGuardar(datos_asignacionMP).subscribe(datos_asignacionMPxTintas => {
      this.obtenerUltimoIdAsignacion();
    });
  }

  // Funcion que servirá para poder obtener el ultimo Id de la asignacion creada y pasarlo a la funcion de creacion de AsignacionMP para que pueda tener el ID de la asignacion
  obtenerUltimoIdAsignacion(){
    let idsAsignaciones = [];
    this.asignacionMPxTintas.srvObtenerLista().subscribe(datos_asignaciones => {
      for (let index = 0; index < datos_asignaciones.length; index++) {
        idsAsignaciones.push(datos_asignaciones[index].asigMPxTinta_Id);
      }
      let ultimoId : number = Math.max.apply(null, idsAsignaciones);
      this.mpAsignada(ultimoId);
    });

    // this.asignacionMPxTintas.srvObtenerUltimaAsignacion().subscribe(datos_asignaciones => {
    //   // this.mpAsignada(datos_asignaciones.asigMp_Id);
    //   console.log(datos_asignaciones)
    // });
  }

  // Funcion que creará el resgitro donde queda detallado que materia prima se pidio, cuanto y a qye asignacion pertenece
  mpAsignada(idAsignacion){
    if (this.ArrayMateriaPrima.length == 0) {
      this.load = true;
      Swal.fire("Debe cargar minimo una materia prima en la tabla");
    } else {
      for (let i = 0; i < this.ArrayMateriaPrima.length; i++) {
        let materiaPrima : number = this.ArrayMateriaPrima[i].Id;
        let cantidad : number = this.ArrayMateriaPrima[i].Cant;
        let presentacion : string = this.ArrayMateriaPrima[i].UndCant;
        const datosDetallesAsignacion : any = {
          AsigMPxTinta_Id : idAsignacion,
          MatPri_Id : materiaPrima,
          DetAsigMPxTinta_Cantidad : cantidad,
          UndMed_Id : presentacion,
          Proceso_Id : 'TINTAS',
        }

        this.detallesAsignacionMPxTintas.srvGuardar(datosDetallesAsignacion).subscribe(datos_detallesAsignacionMPxTintas => {});

      }
      this.moverInventarioMP();
    }
  }

  // Funcion que moverá el inventario de la materia prima que se está asignando para la creacion de la tintas
  moverInventarioMP(){
    let stockMateriaPrimaInicial : number;
    let stockMateriaPrimaFinal : number;

    for (let index = 0; index < this.ArrayMateriaPrima.length; index++) {
      this.materiaPrimaService.srvObtenerListaPorId(this.ArrayMateriaPrima[index].Id).subscribe(datos_materiaPrima => {
        stockMateriaPrimaInicial = datos_materiaPrima.matPri_Stock;
        stockMateriaPrimaFinal = stockMateriaPrimaInicial - this.ArrayMateriaPrima[index].Cant;
        const datosMPActualizada : any = {
          MatPri_Id : this.ArrayMateriaPrima[index].Id,
          MatPri_Nombre : datos_materiaPrima.matPri_Nombre,
          MatPri_Descripcion : datos_materiaPrima.matPri_Descripcion,
          MatPri_Stock : stockMateriaPrimaFinal,
          UndMed_Id : datos_materiaPrima.undMed_Id,
          CatMP_Id : datos_materiaPrima.catMP_Id,
          MatPri_Precio : datos_materiaPrima.matPri_Precio,
          TpBod_Id : datos_materiaPrima.tpBod_Id,
        }
        this.materiaPrimaService.srvActualizar(this.ArrayMateriaPrima[index].Id, datosMPActualizada).subscribe(datos_mp_creada => {
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
            title: '¡Registro de Asignación creado con exito!'
          });
          this.FormAsignacionMP.setValue({
            Tinta : '',
            cantidadTinta : '',
            undMedTinta : '',
            Observacion : '',
            Fecha : this.today,
          });
          this.ArrayMateriaPrima = [];
          this.FormMateriaPrima.reset();
          this.load = true;
        });
        this.load = true;
      });
      this.load = true;
    }
    this.load = true;
  }

  //
  moverInventarioTintas(){

  }

  // Función para quitar una materia prima de la tabla
  QuitarMateriaPrimaTabla(index : number, formulario : any) {
    Swal.fire({
      title: '¿Estás seguro de eliminar la Materia Prima de la Asignación?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.ArrayMateriaPrima.splice(index, 1);
        Swal.fire('Materia Prima eliminada');
      }
    });
  }

  // Función para editar una de las materias primas de la tabla
  EditarMateriaPrimaTabla(formulario : any) {
    this.AccionBoton = "Editar";
    this.FormMateriaPrima = this.frmBuilder.group({
      idMateriaPrima : formulario,
      nombreMateriaPrima : formulario,
      stockMateriaPrima : formulario,
      cantidadMateriaPrima : formulario,
      undMedMateriaPrima : formulario,
    });
  }

  llamarModalMateriasPrimas() {
    this.componenteCrearMateriasPrimas = true;
  }

  llamarModalCrearTintas(){
    this.componenteCrearTintas = true;
  }
}
