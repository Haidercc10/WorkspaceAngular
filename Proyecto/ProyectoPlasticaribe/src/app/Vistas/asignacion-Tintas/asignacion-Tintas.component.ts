import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { modelAsignacionMPxTintas } from 'src/app/Modelo/modelAsignacionMPxTintas';
import { AsignacionMPxTintasService } from 'src/app/Servicios/CreacionTintas/asignacionMPxTintas.service';
import { DetallesAsignacionMPxTintasService } from 'src/app/Servicios/DetallesCreacionTintas/detallesAsignacionMPxTintas.service';
import { MateriaPrimaService } from 'src/app/Servicios/MateriaPrima/materiaPrima.service';
import { RolesService } from 'src/app/Servicios/Roles/roles.service';
import { TintasService } from 'src/app/Servicios/Tintas/tintas.service';
import { UnidadMedidaService } from 'src/app/Servicios/UnidadMedida/unidad-medida.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-asignacion-Tintas',
  templateUrl: './asignacion-Tintas.component.html',
  styleUrls: ['./asignacion-Tintas.component.css']
})
export class AsignacionTintasComponent implements OnInit {

  load: boolean = false;
  FormAsignacionMP !: FormGroup;
  FormMateriaPrima !: FormGroup;
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  materiasPrimas = []; //Varibale que almacenará las materias primas que se utilizan para la creacion de tintas
  unidadMedida = []; //Variable que almacenará las unidades de medida
  tintas = []; //Varibale que almacenará las tintas que se pueden crear
  ArrayMateriaPrima = []; //Varibale que almacenará las materias primas que se estan asignando para crear una tinta
  componenteCrearTintas : boolean = false; //Variable del componente de crear tintas, cambia su estado al llamar la función llamarModalCrearTintas();
  componenteCrearMateriasPrimas : boolean = false; //Variable del componente de crear tintas, cambia su estado al llamar la función llamarModalMateriasPrimas();

  constructor(@Inject(SESSION_STORAGE) private storage: WebStorageService,
                private frmBuilder : FormBuilder,
                  private unidadMedidaService : UnidadMedidaService,
                    private materiaPrimaService : MateriaPrimaService,
                      private tintasService : TintasService,
                        private asignacionMPxTintas : AsignacionMPxTintasService,
                          private detallesAsignacionMPxTintas : DetallesAsignacionMPxTintasService,)  {

    this.FormAsignacionMP = this.frmBuilder.group({
      Id_Tinta : [null, Validators.required],
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
    });
  }

  ngOnInit(): void {
    this.lecturaStorage();
    this.obtenerMateriaPrima();
    this.obtenerUnidadesMedida();
    this.obtenerTintas();
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.storage.get('Id');
    this.storage_Nombre = this.storage.get('Nombre');
    this.ValidarRol = this.storage.get('Rol');
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = '$1,';
    return number.toString().replace(exp,rep);
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
    this.FormMateriaPrima.reset();
    this.ArrayMateriaPrima = [];
  }

  // Funcion que limpiará los campos del apartado de Materias Primas
  limpiarCamposMateriaPrima(){
    this.FormMateriaPrima.reset();
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
  buscarTintaSeleccionada(){
    let tinta : any = this.FormAsignacionMP.value.Tinta;
    this.tintasService.srvObtenerListaPorId(tinta).subscribe(datos_tinta => {
      this.FormAsignacionMP .patchValue({
        Id_Tinta: datos_tinta.tinta_Id,
        Tinta : datos_tinta.tinta_Nombre,
        undMedTinta : datos_tinta.undMed_Id,
      });
    }, error => { this.mensajeError(`¡No se ha podido obtener información de la tinta seleccionada!`, error.message); });
  }

  // Función que buscará las materias primas que se utilizan para crear tintas
  obtenerMateriaPrima(){
    this.asignacionMPxTintas.srvObtenerListaMatPrimas().subscribe(data_materiasPrimas => {
      for (let i = 0; i < data_materiasPrimas.length; i++) {
        if (data_materiasPrimas[i].matPrima != 84 && data_materiasPrimas[i].matPrima != 2001 && data_materiasPrimas[i].matPrima != 88 && data_materiasPrimas[i].matPrima != 89 && data_materiasPrimas[i].matPrima != 2072) {
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

  //Funcion que consultara una materia prima con base a la que está seleccionada en la vista
  buscarMpSeleccionada(){
    let materiaPrima : string = this.FormMateriaPrima.value.nombreMateriaPrima;
    this.asignacionMPxTintas.srvObtenerListaMatPrimasPorId(materiaPrima).subscribe(datos_materiasPrimas => {
      for (let index = 0; index < datos_materiasPrimas.length; index++) {
        this.FormMateriaPrima.setValue({
          idMateriaPrima : datos_materiasPrimas[index].matPrima,
          nombreMateriaPrima : datos_materiasPrimas[index].nombreMP,
          stockMateriaPrima : datos_materiasPrimas[index].stock,
          cantidadMateriaPrima : '',
          undMedMateriaPrima : datos_materiasPrimas[index].unidad,
        });
      }
    }, error => { this.mensajeError(`¡No se ha podido obtener información de la materia prima seleccionada!`, error.message); });
  }

  //Funcion que validará si alguno de los campos del fomulario de materia prima esta vacio
  validarCamposMateriaPrima(){
    if (this.FormMateriaPrima.valid) this.cargarMateriaPrimaEnTabla();
    else this.mensajeAdvertencia("Hay campos vacios en el apartado de seleccion de materia prima");
  }

  // Funcion que cargará las materias primas en las tabla
  cargarMateriaPrimaEnTabla(){
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
      this.ArrayMateriaPrima.push(productoExt);
      this.FormMateriaPrima.reset();
    } else this.mensajeAdvertencia('¡La cantidad a asignar no debe superar lo que hay en stock!');
  }

  // Funcion que validará la asignación
  validarAsignacion(){
    if (this.FormAsignacionMP.value.Tinta != null && this.FormAsignacionMP.value.cantidadTinta != null && this.ArrayMateriaPrima.length > 0) {
      this.tintasService.srvObtenerListaPorId(this.FormAsignacionMP.value.Id_Tinta).subscribe(datos_tinta => {
        Swal.fire({
          icon: 'warning',
          title: '¡Confirmación!',
          html:
          `<b>¡Creación de ${this.formatonumeros(this.FormAsignacionMP.value.cantidadTinta)} Kg de la Tinta ${datos_tinta.tinta_Nombre}!</b><hr>`,
          showCloseButton: true,
          showConfirmButton: true,
          showCancelButton : true,
          confirmButtonColor : '#d44',
          cancelButtonText : `Cerrar`,
          confirmButtonText : 'Crear Tinta <i class="pi pi-arrow-right"></i>',
        }).then((result) => {
          if (result.isConfirmed) this.asignarMPCrearTintas();
        });
      });
    } else this.mensajeAdvertencia("¡Hay campos vacios!");
  }

  //Funcion que almacenará en la base de datos la informacion general sobre la asignacion de materia prima
  asignarMPCrearTintas(){
    if (this.FormAsignacionMP.value.Tinta != null && this.FormAsignacionMP.value.cantidadTinta != null && this.ArrayMateriaPrima.length > 0) {
      this.load = false;
      let tinta : any = this.FormAsignacionMP.value.Id_Tinta;
      let cantidad : number = this.FormAsignacionMP.value.cantidadTinta;
      let presentacion : string = this.FormAsignacionMP.value.undMedTinta;
      let Observacion : string = this.FormAsignacionMP.value.Observacion;
      let usuario : number = this.storage_Id;
      let fecha : Date = this.today;

      let datos_asignacionMP : modelAsignacionMPxTintas = {
        AsigMPxTinta_Id: 0,
        Tinta_Id: tinta,
        AsigMPxTinta_Cantidad: cantidad,
        UndMed_Id: presentacion,
        AsigMPxTinta_FechaEntrega: fecha,
        AsigMPxTinta_Observacion: Observacion,
        Usua_Id: usuario,
        Estado_Id: 13,
        AsigMPxTinta_Hora : moment().format('H:mm:ss'),
      }

      this.asignacionMPxTintas.srvGuardar(datos_asignacionMP).subscribe(datos_asignacionMPxTintas => {
        this.obtenerUltimoIdAsignacion();
        setTimeout(() => {  }, 3000);
      }, error => { this.mensajeError(`¡¡Error al registrar la creación de tinta!!`, error.message); });
    } else this.mensajeAdvertencia("¡Hay campos vacios!");
  }

  // Funcion que servirá para poder obtener el ultimo Id de la asignacion creada y pasarlo a la funcion de creacion de AsignacionMP para que pueda tener el ID de la asignacion
  obtenerUltimoIdAsignacion(){
    this.asignacionMPxTintas.srvObtenerUltimaAsignacion().subscribe(datos_asignaciones => {
      for (let i = 0; i < this.ArrayMateriaPrima.length; i++) {
        const datosDetallesAsignacion : any = {
          asigMPxTinta_Id : datos_asignaciones.asigMPxTinta_Id,
          matPri_Id : this.ArrayMateriaPrima[i].Materia_Prima,
          tinta_Id : this.ArrayMateriaPrima[i].Tinta,
          detAsigMPxTinta_Cantidad : this.ArrayMateriaPrima[i].Cant,
          undMed_Id : this.ArrayMateriaPrima[i].UndCant,
          proceso_Id : 'TINTAS',
        }
        this.detallesAsignacionMPxTintas.srvGuardar(datosDetallesAsignacion).subscribe(datos_detallesAsignacionMPxTintas => {
        }, error => { this.mensajeError(`¡¡Error al registrar los detalles de la creación de tinta!!`, error.message); });
      }
      this.moverInventarioMP();
      this.moverInventarioTintas();
      setTimeout(() => { this.sumarInventarioTintas(); }, 1000);
      this.load = false;
    }, error => { this.mensajeError(`¡¡Error al consultar el último Id de asignación!!`, error.message); });
  }

  // Funcion que moverá el inventario de la materia prima que se está asignando para la creacion de la tintas
  moverInventarioMP(){
    let stockMateriaPrimaFinal : number;

    for (let index = 0; index < this.ArrayMateriaPrima.length; index++) {
      this.materiaPrimaService.srvObtenerListaPorId(this.ArrayMateriaPrima[index].Materia_Prima).subscribe(datos_materiaPrima => {
        if(this.ArrayMateriaPrima[index].Materia_Prima == 84) stockMateriaPrimaFinal = 0
        else stockMateriaPrimaFinal = datos_materiaPrima.matPri_Stock - this.ArrayMateriaPrima[index].Cant;
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
        }, error => { this.mensajeError(`¡¡Error al mover el inventario de materia prima!!`, error.message); });
      }, error => { this.mensajeError(`¡¡Error al consultar la materia prima!!`, error.message); });
    }
  }

  //Función que restará a las tintas de categoria diferente a TINTAS TIPO COLORES.
  moverInventarioTintas(){
    let stockMateriaPrimaFinal : number;

    for (let index = 0; index < this.ArrayMateriaPrima.length; index++) {
      this.tintasService.srvObtenerListaPorId(this.ArrayMateriaPrima[index].Tinta).subscribe(datos_tinta => {
        if (this.ArrayMateriaPrima[index].Tinta == 2001) stockMateriaPrimaFinal = 0;
        else stockMateriaPrimaFinal = datos_tinta.tinta_Stock - this.ArrayMateriaPrima[index].Cant
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
          Tinta_Fecha : datos_tinta.tinta_FechaIngreso,
          Tinta_Hora : datos_tinta.tinta_Hora,
        }
        this.tintasService.srvActualizar(this.ArrayMateriaPrima[index].Tinta, datosTintaActualizada).subscribe(datos_mp_creada => {
        }, error => { this.mensajeError(`¡¡Error al mover el invantario de tinta!!`, error.message); });
      }, error => { this.mensajeError(`¡¡Error al consultar la tinta!!`, error.message); });
    }
  }

  /** Función que sumará cantidad en inventario a la tinta a la que se le asigne Mat. Prima. */
  sumarInventarioTintas() {
    let tinta : any = this.FormAsignacionMP.value.Id_Tinta;
    this.tintasService.srvObtenerListaPorId(tinta).subscribe(datos_tinta => {
      const datosTintaCreada : any = {
        Tinta_Id : tinta,
        Tinta_Nombre : datos_tinta.tinta_Nombre,
        Tinta_Descripcion : datos_tinta.tinta_Descripcion,
        Tinta_Stock : datos_tinta.tinta_Stock + this.FormAsignacionMP.value.cantidadTinta,
        Tinta_CodigoHexadecimal : datos_tinta.tinta_CodigoHexadecimal,
        UndMed_Id : datos_tinta.undMed_Id,
        CatMP_Id : datos_tinta.catMP_Id,
        Tinta_Precio : datos_tinta.tinta_Precio,
        TpBod_Id : datos_tinta.tpBod_Id,
        tinta_InvInicial : datos_tinta.tinta_InvInicial,
        Tinta_FechaIngreso : datos_tinta.tinta_FechaIngreso,
        Tinta_Hora : datos_tinta.tinta_Hora,
      }
      this.tintasService.srvActualizar(tinta, datosTintaCreada).subscribe(datos_mp_creada => {
        Swal.fire({ icon: 'success', title: 'Registro Exitoso', html: `<b>¡Registro completado con exito!</b>`, showCloseButton: true, });
        this.limpiarTodosLosCampos();
      }, error => { this.mensajeError(`¡¡Error al sumar al inventario de la tinta ${datos_tinta.tinta_Nombre}!!`, error.message); });
    }, error => { this.mensajeError(`¡No se pudo obtener información de la tinta con Id ${tinta}!`, error.message); });
    this.load = false;
  }

  // Función para quitar una materia prima de la tabla
  QuitarMateriaPrimaTabla(formulario : any) {
    Swal.fire({
      title: '¿Estás seguro de eliminar la Materia Prima de la Asignación?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        for (let i = 0; i < this.ArrayMateriaPrima.length; i++) {
          if (this.ArrayMateriaPrima[i].Id == formulario.Id) this.ArrayMateriaPrima.splice(i, 1);
        }
      }
    });
  }

  //
  llamarModalMateriasPrimas() {
    this.componenteCrearMateriasPrimas = true;
  }

  //
  llamarModalCrearTintas(){
    this.componenteCrearTintas = true;
  }

  // Mensaje de Advertencia
  mensajeAdvertencia(mensaje : string, mensaje2 : string = ''){
    Swal.fire({ icon: 'warning', title: 'Advertencia', html:`<b>${mensaje}</b><hr> ` + `<spam>${mensaje2}</spam>`, showCloseButton: true, });
  }

  // Mensaje de Error
  mensajeError(text : string, error : any = ''){
    Swal.fire({ icon: 'error', title: 'Oops...', html: `<b>${text}</b><hr> ` +  `<spam style="color : #f00;">${error}</spam> `, showCloseButton: true, });
  }
}
