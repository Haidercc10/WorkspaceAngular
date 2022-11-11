import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { modelAsignacionMPxTintas } from 'src/app/Modelo/modelAsignacionMPxTintas';
import { modelDetallesAsignacionMPxTintas } from 'src/app/Modelo/modelDetallesAsignacionMPxTintas';
import { AsignacionMPService } from 'src/app/Servicios/asignacionMP.service';
import { AsignacionMPxTintasService } from 'src/app/Servicios/asignacionMPxTintas.service';
import { CategoriaMateriaPrimaService } from 'src/app/Servicios/categoriaMateriaPrima.service';
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
  NombreMatPrima : string = 'Materia Prima';
  UltimoId : number;
  public arrayTintaAsignada = [];
  public MatPrima: number;
  public tintaSolvente: number;

  constructor(@Inject(SESSION_STORAGE) private storage: WebStorageService,
                private rolService : RolesService,
                  private frmBuilder : FormBuilder,
                    private unidadMedidaService : UnidadMedidaService,
                      private materiaPrimaService : MateriaPrimaService,
                        private tintasService : TintasService,
                          private asignacionMPxTintas : AsignacionMPxTintasService,
                            private detallesAsignacionMPxTintas : DetallesAsignacionMPxTintasService,)  {

    this.FormAsignacionMP = this.frmBuilder.group({
      Tinta : [null, Validators.required],
      cantidadTinta : [null, Validators.required],
      undMedTinta : [null, Validators.required],
      Observacion : [null],
      Fecha : [null, Validators.required],
    });

    this.FormMateriaPrima = this.frmBuilder.group({
      idMateriaPrima : ['', Validators.required],
      nombreMateriaPrima : ['', Validators.required],
      stockMateriaPrima : ['', Validators.required],
      cantidadMateriaPrima : ['', Validators.required],
      undMedMateriaPrima : ['', Validators.required],
      //idCategoria : ['', Validators.required],
      //nombreCategoria : ['', Validators.required]
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
      Tinta : null,
      cantidadTinta : null,
      undMedTinta : null,
      Observacion : null,
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

  // Funcion limpiará todos los campos de vista
  limpiarTodosLosCampos(){
    this.FormAsignacionMP = this.frmBuilder.group({
      Tinta : null,
      cantidadTinta : null,
      undMedTinta : null,
      Observacion : null,
      Fecha : this.today,
    });
    this.FormMateriaPrima.setValue({
      idMateriaPrima : null,
      nombreMateriaPrima : null,
      stockMateriaPrima : null,
      cantidadMateriaPrima : null,
      undMedMateriaPrima :null,
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
    this.tintasService.srvObtenerListaXColores().subscribe(datos_tintas => {
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
    this.asignacionMPxTintas.srvObtenerListaMatPrimas().subscribe(data_materiasPrimas => {
      for (let i = 0; i < data_materiasPrimas.length; i++) {
        if (data_materiasPrimas[i]) {
          let mp : any = {
            id : data_materiasPrimas[i].matPrima,
            name : data_materiasPrimas[i].nombreMP,
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
    let idMatPrima : number = this.FormMateriaPrima.value.idMateriaPrima;
    this.materiaPrimaSeleccionada = [];

    this.asignacionMPxTintas.srvObtenerListaMatPrimasPorId(idMatPrima).subscribe(datos_materiaPrima => {
      for (let index = 0; index < datos_materiaPrima.length; index++) {
        let infoMatPrima : any = {
          ID : datos_materiaPrima[index].matPrima,
          Nombre : datos_materiaPrima[index].nombreMP,
          Stock : datos_materiaPrima[index].stock,
          Cantidad : '',
          Unidad : datos_materiaPrima[index].unidad,
        }
        this.materiaPrimaSeleccionada.push(infoMatPrima);
      }
        if(this.materiaPrimaSeleccionada.length == 0) {
          this.limpiarCamposMateriaPrima();
          Swal.fire('No se encontró la materia prima consultada.');
        } else this.NombreMatPrima = ''; this.cargarInfoMP();
    });
  }

  //Funcion que consultara una materia prima con base a la que está seleccionada en la vista
  buscarMpSeleccionada(item){
    this.validarInputMp = false;
    this.FormMateriaPrima.value.nombreMateriaPrima = item.name;
    let nombreMateriaPrima : string = this.FormMateriaPrima.value.nombreMateriaPrima;
    this.materiaPrimaSeleccionada = [];

    this.asignacionMPxTintas.srvObtenerListaMatPrimas().subscribe(datos_materiasPrimas => {
      for (let index = 0; index < datos_materiasPrimas.length; index++) {
        if (nombreMateriaPrima == datos_materiasPrimas[index].nombreMP) {

          let infoMatPrima : any = {
            ID : datos_materiasPrimas[index].matPrima,
            Nombre : datos_materiasPrimas[index].nombreMP,
            Stock : datos_materiasPrimas[index].stock,
            Cantidad : '',
            Unidad : datos_materiasPrimas[index].unidad,
          }
          this.materiaPrimaSeleccionada.push(infoMatPrima);
          this.cargarInfoMP();
        }
      }
    });
  }

  //Funcion que llenará la infomacion de materia prima buscada o seleccionada y pasará la informacion a la vista
  cargarInfoMP(){
    for (const Mp of this.materiaPrimaSeleccionada) {
      this.FormMateriaPrima.setValue({
        idMateriaPrima : Mp.ID,
        nombreMateriaPrima : Mp.Nombre,
        stockMateriaPrima : Mp.Stock,
        cantidadMateriaPrima : '',
        undMedMateriaPrima : Mp.Unidad,
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
    let IdMatPrimaReal : number = 84;
    let IdTintaReal : number = 2001;

    if (idMateriaPrima > 2000) IdTintaReal = idMateriaPrima;
    else IdMatPrimaReal = idMateriaPrima;

    if (cantidad <= stock) {
      let productoExt : any = {
        Id : idMateriaPrima,
        Nombre : nombreMateriaPrima,
        Cant : cantidad,
        UndCant : presentacion,
        Stock : stock,
        Materia_Prima : IdMatPrimaReal,
        Tinta : IdTintaReal,
      }

      if (this.AccionBoton == "Agregar" && this.ArrayMateriaPrima.length == 0) this.ArrayMateriaPrima.push(productoExt);
      else if (this.AccionBoton == "Agregar" && this.ArrayMateriaPrima.length != 0) this.ArrayMateriaPrima.push(productoExt);
      else {
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
    if (this.FormAsignacionMP.value.Tinta != null && this.FormAsignacionMP.value.cantidadTinta != null && this.ArrayMateriaPrima.length > 0) {
      this.load = false;
      let tinta : any = this.FormAsignacionMP.value.Tinta;
      let cantidad : number = this.FormAsignacionMP.value.cantidadTinta;
      let presentacion : string = this.FormAsignacionMP.value.undMedTinta;
      let Observacion : string = this.FormAsignacionMP.value.Observacion;
      let usuario : number = this.storage_Id;
      let fecha : Date = this.today;

      let datos_asignacionMP : modelAsignacionMPxTintas = {
        AsigMPxTinta_Id: 0,
        Tinta_Id: tinta.id,
        AsigMPxTinta_Cantidad: cantidad,
        UndMed_Id: presentacion,
        AsigMPxTinta_FechaEntrega: fecha,
        AsigMPxTinta_Observacion: Observacion,
        Usua_Id: usuario,
        Estado_Id: 13
      }
      this.arrayTintaAsignada.push(datos_asignacionMP)

      this.asignacionMPxTintas.srvGuardar(datos_asignacionMP).subscribe(datos_asignacionMPxTintas => {
        this.obtenerUltimoIdAsignacion();
        setTimeout(() => { this.sumarInventarioTintas(); }, 3000);
      });
    } else Swal.fire("¡Hay campos vacios!");
  }

  // Funcion que servirá para poder obtener el ultimo Id de la asignacion creada y pasarlo a la funcion de creacion de AsignacionMP para que pueda tener el ID de la asignacion
  obtenerUltimoIdAsignacion(){
     this.asignacionMPxTintas.srvObtenerUltimaAsignacion().subscribe(datos_asignaciones => {
       this.mpAsignada(datos_asignaciones.asigMPxTinta_Id);
     });
  }

  // Funcion que creará el resgitro donde queda detallado que materia prima se pidio, cuanto y a qye asignacion pertenece
  mpAsignada(idAsignacion : any){
    if (this.ArrayMateriaPrima.length == 0) Swal.fire("Debe cargar minimo una materia prima en la tabla");
    else {
      for (let i = 0; i < this.ArrayMateriaPrima.length; i++) {
        let materiaPrima : number = this.ArrayMateriaPrima[i].Materia_Prima;
        let tinta : number = this.ArrayMateriaPrima[i].Tinta;
        let cantidad : number = this.ArrayMateriaPrima[i].Cant;
        let presentacion : string = this.ArrayMateriaPrima[i].UndCant;

        const datosDetallesAsignacion : any = {
          asigMPxTinta_Id : idAsignacion,
          matPri_Id : materiaPrima,
          tinta_Id : tinta,
          detAsigMPxTinta_Cantidad : cantidad,
          undMed_Id : presentacion,
          proceso_Id : 'TINTAS',
        }

        this.detallesAsignacionMPxTintas.srvGuardar(datosDetallesAsignacion).subscribe(datos_detallesAsignacionMPxTintas => {
        });

      }
      this.moverInventarioMP();
      this.moverInventarioTintas();
    }
  }

  // Funcion que moverá el inventario de la materia prima que se está asignando para la creacion de la tintas
  moverInventarioMP(){
    let stockMateriaPrimaInicial : number;
    let stockMateriaPrimaFinal : number;

    for (let index = 0; index < this.ArrayMateriaPrima.length; index++) {
      this.materiaPrimaService.srvObtenerListaPorId(this.ArrayMateriaPrima[index].Materia_Prima).subscribe(datos_materiaPrima => {
        stockMateriaPrimaInicial = datos_materiaPrima.matPri_Stock;

        if(this.ArrayMateriaPrima[index].Materia_Prima == 84) stockMateriaPrimaFinal = 0
        else stockMateriaPrimaFinal = stockMateriaPrimaInicial - this.ArrayMateriaPrima[index].Cant;
        const datosMPActualizada : any = {
          MatPri_Id : this.ArrayMateriaPrima[index].Materia_Prima,
          MatPri_Nombre : datos_materiaPrima.matPri_Nombre,
          MatPri_Descripcion : datos_materiaPrima.matPri_Descripcion,
          MatPri_Stock : stockMateriaPrimaFinal,
          UndMed_Id : datos_materiaPrima.undMed_Id,
          CatMP_Id : datos_materiaPrima.catMP_Id,
          MatPri_Precio : datos_materiaPrima.matPri_Precio,
          TpBod_Id : datos_materiaPrima.tpBod_Id,
        }

        this.materiaPrimaService.srvActualizar(this.ArrayMateriaPrima[index].Materia_Prima, datosMPActualizada).subscribe(datos_mp_creada => {
        }, error => { const Toast = Swal.mixin({
          toast: true,
          position: 'center',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
          }
        });
        Toast.fire({
          icon: 'error',
          title: '¡No restó al inventario de materias primas!'
        });
      });

      //Buscar Materia Prima
      }, error => { const Toast = Swal.mixin({
        toast: true,
        position: 'center',
        showConfirmButton: false,
        timer: 1200,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
      });
      Toast.fire({
        icon: 'error',
        title: 'Materia prima no encontrada!'
      });
    });
    }
  }

  //Función que restará a las tintas de categoria diferente a TINTAS TIPO COLORES.
  moverInventarioTintas(){
    let stockMateriaPrimaFinal : number;

    for (let index = 0; index < this.ArrayMateriaPrima.length; index++) {
       this.tintasService.srvObtenerListaPorId(this.ArrayMateriaPrima[index].Tinta).subscribe(datos_tinta => {

        if (this.ArrayMateriaPrima[index].Tinta == 2001) stockMateriaPrimaFinal = 0
        else stockMateriaPrimaFinal = datos_tinta.tinta_Stock - this.ArrayMateriaPrima[index].Cant;
         const datosTintaActualizada : any = {
          Tinta_Id : this.ArrayMateriaPrima[index].Tinta,
          Tinta_Nombre : datos_tinta.tinta_Nombre,
          Tinta_Descripcion : datos_tinta.tinta_Descripcion,
          Tinta_Stock : stockMateriaPrimaFinal,
          Tinta_CodigoHexadecimal : datos_tinta.tinta_CodigoHexadecimal,
          UndMed_Id : datos_tinta.undMed_Id,
          CatMP_Id : datos_tinta.catMP_Id,
          Tinta_Precio : datos_tinta.tinta_Precio,
          TpBod_Id : datos_tinta.tpBod_Id,
          tinta_InvInicial : datos_tinta.tinta_InvInicial,
        }

        this.tintasService.srvActualizar(this.ArrayMateriaPrima[index].Tinta, datosTintaActualizada).subscribe(datos_mp_creada => {
        }, error => {
          const Toast = Swal.mixin({
          toast: true,
          position: 'center',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
          }
        });
        Toast.fire({
          icon: 'error',
          title: '¡No restó al inventario de tintas!'
        });
      });
      //Buscar Tinta
      }, error => { const Toast = Swal.mixin({
        toast: true,
        position: 'center',
        showConfirmButton: false,
        timer: 1200,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
      });
      Toast.fire({
        icon: 'error',
        title: '¡Tinta no encontrada!'
      });
    });
    }
  }

  /** Función que sumará cantidad en inventario a la tinta a la que se le asigne Mat. Prima. */
  sumarInventarioTintas() {

    let stockMateriaPrimaInicial : number;
    let stockMateriaPrimaFinal : number;

    for (let index = 0; index < this.arrayTintaAsignada.length; index++) {
      this.tintasService.srvObtenerListaPorId(this.arrayTintaAsignada[index].Tinta_Id).subscribe(datos_tinta => {

        stockMateriaPrimaInicial = datos_tinta.tinta_Stock;
        stockMateriaPrimaFinal = stockMateriaPrimaInicial + this.arrayTintaAsignada[index].AsigMPxTinta_Cantidad;

        const datosTintaCreada : any = {
          Tinta_Id : this.arrayTintaAsignada[index].Tinta_Id,
          Tinta_Nombre : datos_tinta.tinta_Nombre,
          Tinta_Descripcion : datos_tinta.tinta_Descripcion,
          Tinta_Stock : stockMateriaPrimaFinal,
          Tinta_CodigoHexadecimal : datos_tinta.tinta_CodigoHexadecimal,
          UndMed_Id : datos_tinta.undMed_Id,
          CatMP_Id : datos_tinta.catMP_Id,
          Tinta_Precio : datos_tinta.tinta_Precio,
          TpBod_Id : datos_tinta.tpBod_Id,
        }
        this.tintasService.srvActualizar(this.arrayTintaAsignada[index].Tinta_Id, datosTintaCreada).subscribe(datos_mp_creada => {
          const Toast = Swal.mixin({
            toast: true,
            position: 'center',
            showConfirmButton: false,
            timer: 2000,
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
        }, error => {
          const Toast = Swal.mixin({
            toast: true,
            position: 'center',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.addEventListener('mouseenter', Swal.stopTimer)
              toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
          });
          Toast.fire({
            icon: 'error',
            title: '¡No Sumó el inventario de tintas!'
          });
        });

      });
    }
    this.load = true;
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
