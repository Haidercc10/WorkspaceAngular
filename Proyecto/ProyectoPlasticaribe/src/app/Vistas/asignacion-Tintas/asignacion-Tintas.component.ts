import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShepherdService } from 'angular-shepherd';
import moment from 'moment';
import { MessageService } from 'primeng/api';
import { modelAsignacionMPxTintas } from 'src/app/Modelo/modelAsignacionMPxTintas';
import { modelEntradas_Salidas_MP } from 'src/app/Modelo/modelEntradas_Salidas_MP';
import { modeloMovimientos_Entradas_MP } from 'src/app/Modelo/modeloMovimientos_Entradas_MP';
import { AsignacionMPxTintasService } from 'src/app/Servicios/CreacionTintas/asignacionMPxTintas.service';
import { DetallesAsignacionMPxTintasService } from 'src/app/Servicios/DetallesCreacionTintas/detallesAsignacionMPxTintas.service';
import { Entradas_Salidas_MPService } from 'src/app/Servicios/Entradas_Salidas_MP/Entradas_Salidas_MP.service';
import { MateriaPrimaService } from 'src/app/Servicios/MateriaPrima/materiaPrima.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { Movimientos_Entradas_MPService } from 'src/app/Servicios/Movimientos_Entradas_MP/Movimientos_Entradas_MP.service';
import { TintasService } from 'src/app/Servicios/Tintas/tintas.service';
import { UnidadMedidaService } from 'src/app/Servicios/UnidadMedida/unidad-medida.service';
import { AppComponent } from 'src/app/app.component';
import { defaultStepOptions, stepAsignacionTintas as defaultSteps } from 'src/app/data';

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
  mpSeleccionada : any = [];
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  hora : any = moment().format('H:mm:ss'); //Variable que se usará para llenar la hora actual

  constructor(private AppComponent : AppComponent,
                private frmBuilder : FormBuilder,
                  private unidadMedidaService : UnidadMedidaService,
                    private materiaPrimaService : MateriaPrimaService,
                      private tintasService : TintasService,
                        private asignacionMPxTintas : AsignacionMPxTintasService,
                          private detallesAsignacionMPxTintas : DetallesAsignacionMPxTintasService,
                            private messageService: MessageService,
                              private shepherdService: ShepherdService,
                                private mensajeService : MensajesAplicacionService,
                                  private srvMovEntradasMP : Movimientos_Entradas_MPService,
                                    private srvMovSalidasMP : Entradas_Salidas_MPService)  {

    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
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
      stockMateriaPrima : [null, Validators.required],
      cantidadMateriaPrima : [null, Validators.required],
      undMedMateriaPrima : ['', Validators.required],
    });
  }

  verTutorial() {
    this.shepherdService.defaultStepOptions = defaultStepOptions;
    this.shepherdService.modal = true;
    this.shepherdService.confirmCancel = false;
    this.shepherdService.addSteps(defaultSteps);
    this.shepherdService.start();
  }

  ngOnInit(): void {
    this.lecturaStorage();
    this.obtenerMateriaPrima();
    this.obtenerUnidadesMedida();
    this.obtenerTintas();
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = '$1,';
    return number.toString().replace(exp,rep);
  }

  // Funcion limpiará todos los campos de vista
  limpiarTodosLosCampos(){
    this.FormAsignacionMP.reset();
    this.FormAsignacionMP.patchValue({ Fecha : this.today, });
    this.FormMateriaPrima.reset();
    this.ArrayMateriaPrima = [];
  }

  // Funcion que limpiará los campos del apartado de Materias Primas
  limpiarCamposMateriaPrima = () => this.FormMateriaPrima.reset();

  // Funcion que buscará las tintas que se utilizan en la empresa
  obtenerTintas = () => this.tintasService.srvObtenerListaXColores().subscribe(data => this.tintas = data.filter((item) => ![84, 2001, 88, 89, 2072].includes(item.tinta_Id)));

  // funcion que servirá para llenar el campo de unidad de medida de la tinta dependiendo la tinta seleccionada
  buscarTintaSeleccionada(){
    let nuevo : any[] = this.tintas.filter((item) => item.tinta_Id == this.FormAsignacionMP.value.Tinta);
    this.FormAsignacionMP.patchValue({
      Id_Tinta: nuevo[0].tinta_Id,
      Tinta : nuevo[0].tinta_Nombre,
      undMedTinta : nuevo[0].undMed_Id,
    });
  }

  // Función que buscará las materias primas que se utilizan para crear tintas
  obtenerMateriaPrima = () => this.asignacionMPxTintas.srvObtenerListaMatPrimas().subscribe(data => this.materiasPrimas = data.filter((item) => ![84, 2001, 88, 89, 2072].includes(item.matPrima)));

  //Funcion para  obtener las unidades de medidas
  obtenerUnidadesMedida = () => this.unidadMedidaService.srvObtenerLista().subscribe(datos => this.unidadMedida = datos);

  //Funcion que consultara una materia prima con base a la que está seleccionada en la vista
  buscarMpSeleccionada(){
    let materiaPrima : string = this.FormMateriaPrima.value.nombreMateriaPrima;
    this.asignacionMPxTintas.srvObtenerListaMatPrimasPorId(materiaPrima).subscribe(datos_materiasPrimas => {
      for (let index = 0; index < datos_materiasPrimas.length; index++) {
        if (![84, 2001, 88, 89, 2072].includes(datos_materiasPrimas[index].matPrima)) {
          this.FormMateriaPrima.setValue({
            idMateriaPrima : datos_materiasPrimas[index].matPrima,
            nombreMateriaPrima : datos_materiasPrimas[index].nombreMP,
            stockMateriaPrima : datos_materiasPrimas[index].stock,
            cantidadMateriaPrima : '',
            undMedMateriaPrima : datos_materiasPrimas[index].unidad,
          });
        }
      }
    }, () => this.mensajeService.mensajeError(`Error`, `¡No se ha podido obtener información de la materia prima seleccionada!`));
  }

  //Funcion que validará si alguno de los campos del fomulario de materia prima esta vacio
  validarCamposMateriaPrima = () => this.FormMateriaPrima.valid ? this.cargarMateriaPrimaEnTabla() : this.mensajeService.mensajeAdvertencia(`Advertencia`, "Hay campos vacios en el apartado de selección de materia prima");

  // Funcion que cargará las materias primas en las tabla
  cargarMateriaPrimaEnTabla(){
    let idMateriaPrima : number = this.FormMateriaPrima.value.idMateriaPrima;
    let nombreMateriaPrima : string = this.FormMateriaPrima.value.nombreMateriaPrima;
    let presentacion : string = this.FormMateriaPrima.value.undMedMateriaPrima;
    let cantidad : number = this.FormMateriaPrima.value.cantidadMateriaPrima;
    let stock : number = this.FormMateriaPrima.value.stockMateriaPrima;
    let IdMatPrimaReal : number = 84;
    let IdTintaReal : number = 2001;
    idMateriaPrima > 2000 ? IdTintaReal = idMateriaPrima : IdMatPrimaReal = idMateriaPrima;
    if (cantidad <= stock) {
      let productoExt : any = {
        Id : idMateriaPrima,
        Nombre : nombreMateriaPrima,
        Cant : cantidad,
        Cantidad2 : cantidad,
        UndCant : presentacion,
        Stock : stock,
        Materia_Prima : IdMatPrimaReal,
        Tinta : IdTintaReal,
        EntradasDisponibles : [], 
        Salidas : [],
      }
      this.cargar_Entradas(productoExt);
      this.ArrayMateriaPrima.push(productoExt);
      console.log(this.ArrayMateriaPrima)
      setTimeout(() => { this.FormMateriaPrima.reset(); }, 1000);
    } else this.mensajeService.mensajeAdvertencia(`Advertencia`, '¡La cantidad a asignar no debe superar lo que hay en stock!');
  }

  // Funcion que validará la asignación
  validarAsignacion(){
    if (this.FormAsignacionMP.value.Tinta != null && this.FormAsignacionMP.value.cantidadTinta != null && this.ArrayMateriaPrima.length > 0) {
      this.tintasService.srvObtenerListaPorId(this.FormAsignacionMP.value.Id_Tinta).subscribe(() => this.mostrarEleccion() );
    } else this.mensajeService.mensajeAdvertencia(`Advertencia`, "Debe llenar los campos vacios!");
  }

  //Funcion que almacenará en la base de datos la informacion general sobre la asignacion de materia prima
  asignarMPCrearTintas(){
    this.onReject('asignacion');
    if (this.FormAsignacionMP.value.Tinta != null && this.FormAsignacionMP.value.cantidadTinta != null && this.ArrayMateriaPrima.length > 0) {
      this.load = false;
      let info : modelAsignacionMPxTintas = {
        AsigMPxTinta_Id: 0,
        Tinta_Id: this.FormAsignacionMP.value.Id_Tinta,
        AsigMPxTinta_Cantidad: this.FormAsignacionMP.value.cantidadTinta,
        UndMed_Id: this.FormAsignacionMP.value.undMedTinta,
        AsigMPxTinta_FechaEntrega: this.today,
        AsigMPxTinta_Observacion: this.FormAsignacionMP.value.Observacion == null ? '' : this.FormAsignacionMP.value.Observacion,
        Usua_Id: this.storage_Id,
        Estado_Id: 13,
        AsigMPxTinta_Hora : moment().format('H:mm:ss'),
      }
      this.asignacionMPxTintas.srvGuardar(info).subscribe(() => this.obtenerUltimoIdAsignacion(), error => {
        this.mensajeService.mensajeError(`¡Error al registrar la creación de tinta!`, error.message);
        this.load = true;
      });
    } else this.mensajeService.mensajeAdvertencia(`Advertencia`, "Debe llenar los campos vacios!");
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
        this.detallesAsignacionMPxTintas.srvGuardar(datosDetallesAsignacion).subscribe(() => {
        }, () => {
          this.mensajeService.mensajeError(`Error`, `¡Error al registrar los detalles de la creación de tinta!`);
          this.load = true;
        });
      }
      this.moverInventarioMP();
      this.moverInventarioTintas();
      this.actualizar_MovimientosEntradas();
      this.crear_Salidas(datos_asignaciones.asigMPxTinta_Id);
      this.crearRegistroTinta_MovEntradasMP(datos_asignaciones.asigMPxTinta_Id);
      setTimeout(() => this.sumarInventarioTintas(), 1000);
      this.load = false;
    }, () => {
      this.mensajeService.mensajeError(`Error`, `¡Error al consultar el último Id de asignación!`);
      this.load = true;
    });
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
        this.materiaPrimaService.srvActualizar(this.ArrayMateriaPrima[index].Materia_Prima, datosMPActualizada).subscribe(() => {
        }, () => {
          this.mensajeService.mensajeError(`Error`, `¡Error al mover el inventario de materia prima!`);
          this.load = true;
        });
      }, () => {
        this.mensajeService.mensajeError(`Error`, `¡Error al consultar la materia prima!`);
        this.load = true;
      });
    }
  }

  //Función que restará a las tintas de categoria diferente a TINTAS TIPO COLORES.
  moverInventarioTintas(){
    let stock : number;
    for (let index = 0; index < this.ArrayMateriaPrima.length; index++) {
      this.tintasService.srvObtenerListaPorId(this.ArrayMateriaPrima[index].Tinta).subscribe(datos_tinta => {
        this.ArrayMateriaPrima[index].Tinta == 2001 ? stock = 0 : stock = datos_tinta.tinta_Stock - this.ArrayMateriaPrima[index].Cant;
        const datosTintaActualizada : any = {
          Tinta_Id : this.ArrayMateriaPrima[index].Tinta,
          Tinta_Nombre : datos_tinta.tinta_Nombre,
          Tinta_Descripcion : datos_tinta.tinta_Descripcion,
          Tinta_Stock : stock,
          Tinta_CodigoHexadecimal : datos_tinta.tinta_CodigoHexadecimal,
          UndMed_Id : datos_tinta.undMed_Id,
          CatMP_Id : datos_tinta.catMP_Id,
          Tinta_Precio : datos_tinta.tinta_Precio,
          TpBod_Id : datos_tinta.tpBod_Id,
          tinta_InvInicial : datos_tinta.tinta_InvInicial,
          Tinta_Fecha : datos_tinta.tinta_FechaIngreso,
          Tinta_Hora : datos_tinta.tinta_Hora,
        }
        this.tintasService.srvActualizar(this.ArrayMateriaPrima[index].Tinta, datosTintaActualizada).subscribe(() => {
        }, () => {
          this.mensajeService.mensajeError(`Error`, `¡Error al mover el invantario de tinta!`);
          this.load = true;
        });
      }, () => {
        this.mensajeService.mensajeError(`Error`, `¡Error al consultar la tinta!`);
        this.load = true
      });
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
      this.tintasService.srvActualizar(tinta, datosTintaCreada).subscribe(() => {
        this.mensajeService.mensajeConfirmacion(`Confirmación`, `¡Registro completado con exito!`);
        setTimeout(() => { this.limpiarTodosLosCampos(); }, 800); 
      }, error => {
        this.mensajeService.mensajeError(`¡Error al sumar al inventario de la tinta ${datos_tinta.tinta_Nombre}!`, error.message);
        this.load = true;
      });
    }, error => {
      this.mensajeService.mensajeError(`¡No se pudo obtener información de la tinta con Id ${tinta}!`, error.message);
      this.load = true;
    });
  }

  // Función para quitar una materia prima de la tabla
  QuitarMateriaPrimaTabla(formulario : any) {
    formulario = this.mpSeleccionada;
    this.onReject('mp');
    this.ArrayMateriaPrima.splice(this.ArrayMateriaPrima.findIndex((item) => item.Id == formulario.Id), 1);
  }

  //
  llamarModalMateriasPrimas = () => this.componenteCrearMateriasPrimas = true;

  //
  llamarModalCrearTintas = () => this.componenteCrearTintas = true;

  /** Cerrar Dialogo de eliminación*/
  onReject = (dato : any) => this.messageService.clear(dato);

  /** Función para mostrar una elección de eliminación de OT/Rollo de la tabla. */
  mostrarEleccion = () => this.messageService.add({severity:'warn', key:'asignacion', summary:'Elección', detail: `¿Está seguro que desea crear ${this.FormAsignacionMP.value.cantidadTinta} Kg de la tinta ${this.FormAsignacionMP.value.Tinta}?`, sticky: true});

  mostrarEleccion2(item: any){
    this.mpSeleccionada = item;
    this.messageService.add({severity:'warn', key:'mp', summary:'Elección', detail: `¿Está seguro que desea quitar la materia prima ${this.mpSeleccionada.Nombre} de la tabla?`, sticky: true});
  }

  //Función que colocará la información de las entradas de materia prima en el array de entradas disponibles.
  cargar_Entradas(info : any){
    let salidaReal : number = 0;
    this.srvMovEntradasMP.GetInventarioxMaterial(info.Id).subscribe(data => {
      if (data.length > 0) {
        for (let i = 0; i < data.length; i++) {
          let detalle : modeloMovimientos_Entradas_MP = {
            Id: data[i].id,
            MatPri_Id: data[i].matPri_Id,
            Tinta_Id: data[i].tinta_Id,
            Bopp_Id: data[i].bopp_Id,
            Cantidad_Entrada: data[i].cantidad_Entrada,
            UndMed_Id: data[i].undMed_Id,
            Precio_RealUnitario: data[i].precio_RealUnitario,
            Tipo_Entrada: data[i].tipo_Entrada,
            Codigo_Entrada: data[i].codigo_Entrada,
            Estado_Id: data[i].estado_Id,
            Cantidad_Asignada: data[i].cantidad_Asignada,
            Cantidad_Disponible: data[i].cantidad_Disponible,
            Observacion: data[i].observacion,
            Fecha_Entrada: data[i].fecha_Entrada,
            Hora_Entrada: data[i].hora_Entrada,
            Precio_EstandarUnitario: data[i].precio_EstandarUnitario
          } 
          if(info.Cantidad2 > 0) {
            if(info.Cantidad2 > detalle.Cantidad_Disponible) {
              salidaReal = detalle.Cantidad_Disponible;
              info.Cantidad2 -= detalle.Cantidad_Disponible;
              detalle.Cantidad_Asignada += detalle.Cantidad_Disponible;
              detalle.Cantidad_Disponible = 0;
              detalle.Estado_Id = 5;
              console.log(salidaReal)
            } else if(info.Cantidad2 == detalle.Cantidad_Disponible) {
              salidaReal = info.Cantidad2;
              detalle.Cantidad_Asignada += detalle.Cantidad_Disponible;
              detalle.Cantidad_Disponible = 0;
              detalle.Estado_Id = 5;
              info.Cantidad2 = 0;
              console.log(salidaReal)
            } else if(info.Cantidad2 < detalle.Cantidad_Disponible) {
              salidaReal = info.Cantidad2;
              detalle.Cantidad_Asignada += info.Cantidad2;
              detalle.Cantidad_Disponible -= info.Cantidad2;
              detalle.Estado_Id = 19;
              info.Cantidad2 = 0;
              console.log(salidaReal)
            }
            this.cargar_Salidas(detalle, info, salidaReal);
            info.EntradasDisponibles.push(detalle);
          }
        }
      }
    });
  }

  //Función que colocará la información de la salida de la materia prima en el array de salidas. 
  cargar_Salidas(detalle : any, info : any, salidaReal : number){
    let salidas : modelEntradas_Salidas_MP = {
      Id_Entrada: detalle.Id,
      Tipo_Salida: 'CRTINTAS',
      Codigo_Salida: 0,
      Tipo_Entrada: detalle.Tipo_Entrada,
      Codigo_Entrada: detalle.Codigo_Entrada,
      Fecha_Registro: this.today,
      Hora_Registro: this.hora,
      MatPri_Id: detalle.MatPri_Id,
      Tinta_Id: detalle.Tinta_Id,
      Bopp_Id: detalle.Bopp_Id,
      Cantidad_Salida: salidaReal,
      Orden_Trabajo: 0, 
      Prod_Id : 1,
    }
    info.Salidas.push(salidas);
  }

  //Función que actualizará los movimientos de entrada de las materias primas seleccionadas.
  actualizar_MovimientosEntradas(){
    if(this.ArrayMateriaPrima.length > 0) {
      for (let index = 0; index < this.ArrayMateriaPrima.length; index++) {
        for (let i = 0; i < this.ArrayMateriaPrima[index].EntradasDisponibles.length; i++) {
         this.srvMovEntradasMP.Put(this.ArrayMateriaPrima[index].EntradasDisponibles[i].Id, this.ArrayMateriaPrima[index].EntradasDisponibles[i]).subscribe(data => {}, 
         error => { this.mensajeService.mensajeError(`Error`, `No fue posible actualizar el movimiento de entrada!`); });
        }
      }
    }
  }

  //Función que creará las salidas de las materias primas seleccionadas.
  crear_Salidas(id : number){
    if(this.ArrayMateriaPrima.length > 0) {
      for (let index = 0; index < this.ArrayMateriaPrima.length; index++) {
        for (let i = 0; i < this.ArrayMateriaPrima[index].Salidas.length; i++) {
          this.ArrayMateriaPrima[index].Salidas[i].Codigo_Salida = id;
          this.ArrayMateriaPrima[index].Salidas[i].Fecha_Registro = this.today;
          this.ArrayMateriaPrima[index].Salidas[i].Hora_Registro = this.hora;
          this.srvMovSalidasMP.Post(this.ArrayMateriaPrima[index].Salidas[i]).subscribe(data => {}, 
          error => { this.mensajeService.mensajeError(`Error`, `No fue posible crear la salida de material!`); });
        }
      }
    }
  }

  //Función que creará el registro con la cantidad de tinta en movimientos entradas MP
  crearRegistroTinta_MovEntradasMP(idEntrada : number){
    let tinta : number = this.FormAsignacionMP.value.Id_Tinta;
    let cantidad : number = this.FormAsignacionMP.value.cantidadTinta;
    let observacion : string = this.FormAsignacionMP.value.Observacion;

    this.tintasService.srvObtenerListaPorId(tinta).subscribe(data => {
      let registro : modeloMovimientos_Entradas_MP = {
        MatPri_Id: 84,
        Tinta_Id: tinta,
        Bopp_Id: 1,
        Cantidad_Entrada: cantidad,
        UndMed_Id: 'Kg',
        Precio_RealUnitario: data.tinta_Precio,
        Tipo_Entrada: 'CRTINTAS',
        Codigo_Entrada: idEntrada,
        Estado_Id: 19,
        Cantidad_Asignada: 0,
        Cantidad_Disponible: cantidad,
        Observacion: observacion == null ? "" : observacion,
        Fecha_Entrada: this.today,
        Hora_Entrada: this.hora,
        Precio_EstandarUnitario: data.tinta_PrecioEstandar
      }
      this.srvMovEntradasMP.Post(registro).subscribe(data => {}, 
      error => { this.mensajeService.mensajeError(`Error`, `No fue posible agregar el registro de la creación de tinta en movimientos de entrada MP!`); });
    });  
  }
}  

