import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShepherdService } from 'angular-shepherd';
import moment from 'moment';
import { MessageService } from 'primeng/api';
import { CategoriaMateriaPrimaService } from 'src/app/Servicios/CategoriasMateriaPrima/categoriaMateriaPrima.service';
import { RecuperadoMPService } from 'src/app/Servicios/DetallesRecuperado/recuperadoMP.service';
import { MateriaPrimaService } from 'src/app/Servicios/MateriaPrima/materiaPrima.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { RecuperadoService } from 'src/app/Servicios/Recuperado/recuperado.service';
import { TurnosService } from 'src/app/Servicios/Turnos/Turnos.service';
import { UnidadMedidaService } from 'src/app/Servicios/UnidadMedida/unidad-medida.service';
import { UsuarioService } from 'src/app/Servicios/Usuarios/usuario.service';
import { AppComponent } from 'src/app/app.component';
import { defaultStepOptions, stepsRecuperado as defaultSteps } from 'src/app/data';

@Component({
  selector: 'app_MateriaPrimaRecuperada',
  templateUrl: './MateriaPrimaRecuperada.component.html',
  styleUrls: ['./MateriaPrimaRecuperada.component.css']
})
export class MateriaPrimaRecuperadaComponent implements OnInit {

  public FormMateriaPrimaRecuperada !: FormGroup;
  public FormMateriaPrima !: FormGroup;
  public FormRemisiones !: FormGroup;
  public consultaRemisiones !: FormGroup;
  public FormMateriaPrimaRetiro !: FormGroup;
  public FormMateriaPrimaRetirada !: FormGroup;

  //Llamar modales, inicializados como falsos para que no se carguen al ingresar a la pagina.
  public ModalCrearProveedor: boolean = false;
  public ModalCrearMateriaPrima: boolean= false;

  /* Vaiables*/
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  materiasPrimas = []; //Variable que va almacenar el nombre de todas las materias primas existentes en la empresa
  nombreCategoriasMP = []; //VAriable que va a almacenar el nombre de todas las categorias de materias primas existentes en la empresa
  unidadMedida = []; //Varibale que va a almacenar las unidades de medida registradas en la base de datos
  usuarios = []; //Variable que va a almacenar todos los usuarios de la empresa
  materiaPrimaSeleccionada = []; //Variable que almacenará la informacion de la materia prima seleccionada
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  ArrayMateriaPrima : any [] = []; //Variable que tendrá la informacion de los productos que se piden en el nuevo pedido
  AccionBoton = "Agregar"; //Variable que almanará informacio para saber si una materia prima está en edicion o no (Se editará una materia prima cargada en la tabla, no una en la base de datos)
  turnos : any [] = []; //Variable que almacenará los diferentes turnos que se trabajan en la empresa
  mpSeleccionada : any = [];
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  modalMode : boolean = false;
  
  constructor(private materiaPrimaService : MateriaPrimaService,
                private categoriMpService : CategoriaMateriaPrimaService,
                  private unidadMedidaService : UnidadMedidaService,
                    private usuarioService : UsuarioService,
                      private frmBuilderMateriaPrima : FormBuilder,
                        private AppComponent : AppComponent,
                          private recuperadoService : RecuperadoService,
                            private recuperadoMPService : RecuperadoMPService,
                              private turnosService : TurnosService,
                                private messageService: MessageService,
                                  private shepherdService: ShepherdService,
                                    private mensajeService : MensajesAplicacionService,) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
    this.FormMateriaPrimaRecuperada = this.frmBuilderMateriaPrima.group({
      ConsecutivoFactura : ['', Validators.required],
      MpingresoFecha: ['', Validators.required],
      usuarioNombre: ['', Validators.required],
      usuarioId: ['', Validators.required],
      MpObservacion : ['', Validators.required],
      Turno : ['', Validators.required],
      Maquina : ['', Validators.required],
    });

    this.FormMateriaPrima = this.frmBuilderMateriaPrima.group({
      MpId : ['', Validators.required],
      MpNombre: ['', Validators.required],
      MpCantidad : [null, Validators.required],
      MpUnidadMedida: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.lecturaStorage();
    this.obtenerUnidadMedida();
    this.obtenerMateriasPrimasRetiradas();
    this.obtenerUsuarios();
    this.obtenerTurnos();
    setInterval(() => this.modoSeleccionado = this.AppComponent.temaSeleccionado, 1000);
  }

  tutorial(){
    this.shepherdService.defaultStepOptions = defaultStepOptions;
    this.shepherdService.modal = true;
    this.shepherdService.confirmCancel = false;
    this.shepherdService.addSteps(defaultSteps);
    this.shepherdService.start();
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g,'$1,');

  // Funcion que limpia los todos los campos de la vista
  LimpiarCampos = () => this.FormMateriaPrimaRecuperada.reset();

  // Funcion que se encargará de trar los turnos de la empresa
  obtenerTurnos = () => this.turnosService.srvObtenerLista().subscribe(data => this.turnos = data.filter(x => x.turno_Nombre != 'N/E'));

  //Funcion que limpiará los campos de la materia pirma entrante
  limpiarCamposMP = () => this.FormMateriaPrima.reset();

  //Funcion que va a recorrer las materias primas para almacenar el nombre de todas
  obtenerMateriasPrimasRetiradas(){
    this.materiaPrimaService.srvObtenerLista().subscribe(datos_materiaPrima => {
      for (let index = 0; index < datos_materiaPrima.length; index++) {
        let mp : any = {
          id : datos_materiaPrima[index].matPri_Id,
          name : datos_materiaPrima[index].matPri_Nombre,
        }
        this.materiasPrimas.push(mp);
      }
    });
  }

  //Funcion que va a buscar y almacenar todos los nombre de las categorias de materia prima
  obtenerNombreCategoriasMp = () => this.categoriMpService.srvObtenerLista().subscribe(datos => this.nombreCategoriasMP = datos.map(x => x.catMp_Nombre));

  //Funcion que va almacenar todas las unidades de medida existentes en la empresa
  obtenerUnidadMedida = () => this.unidadMedidaService.srvObtenerLista().subscribe(datos => this.unidadMedida = datos.map(x => x.undMed_Id));

  //Funcion que se encargará de buscary almacenar todos los usuarios
  obtenerUsuarios = () => this.usuarioService.srvObtenerListaUsuario().subscribe(datos => this.usuarios = datos.filter(x => x.rolUsu_Id == 3));

  //Funcion que traerá la información del usuario seleccionado
  llenarUsuarioSeleccionado(){
    let usuarioSelccionado : string = this.FormMateriaPrimaRecuperada.value.usuarioNombre;
    this.FormMateriaPrimaRecuperada.patchValue({ usuarioId: this.usuarios.find(x => x.usua_Id == usuarioSelccionado).usua_Id, });
  }

  //Funcion que registrará y guardará en la base de datos la infomacion de la materia prima entrante
  registrarRecuperado(){
    if (this.ArrayMateriaPrima.length == 0) this.mensajeService.mensajeAdvertencia(`Advertencia`, "Debe cargar minimo una materia prima en la tabla");
    else {
      const datosRec : any = {
        RecMp_FechaIngreso : this.today,
        Usua_Id : this.storage_Id,
        RecMp_Observacion : this.FormMateriaPrimaRecuperada.value.MpObservacion,
        Proc_Id : 'RECUP',
        RecMp_FechaEntrega : moment(this.FormMateriaPrimaRecuperada.value.MpingresoFecha).format('YYYY-MM-DD'),
        RecMp_HoraIngreso : moment().format("H:mm:ss"),
        RecMp_Maquina : 0,
        Turno_Id : this.FormMateriaPrimaRecuperada.value.Turno,
        Usua_Operador: this.FormMateriaPrimaRecuperada.value.usuarioId,
      }
      this.recuperadoService.srvGuardar(datosRec).subscribe((data) => this.obtenerUltimoIdRecuperado(data.recMp_Id), () => this.mensajeService.mensajeError(`Error`, `¡Error al ingresar el peletizado!`));
    }
  }

  // Funcion que se encargará de obtener el ultimo Id de las facturas
  obtenerUltimoIdRecuperado(id : number){
    this.ArrayMateriaPrima.forEach((data) => {
      const datosRec : any = {
        RecMp_Id : id,
        MatPri_Id : data.Id,
        RecMatPri_Cantidad : data.Cant,
        UndMed_Id : data.UndCant,
        TpRecu_Id : '1',
      }
      this.recuperadoMPService.srvGuardar(datosRec).subscribe(null, () => this.mensajeService.mensajeError(`Error`, `¡Error al registrar la materia prima recuperada!`));
      this.moverInventarioMpAgregada();
    });
  }

  //Funcion que va a validar la informacion que se ingresa a la tabla
  validarCamposVaciosMP(){
    if (this.FormMateriaPrima.valid) this.cargarFormMpEnTablas();
    else this.mensajeService.mensajeAdvertencia(`Advertencia`, "Hay campos vacios en el formulario de materia prima ");
  }

  //Funcion que envia la informacion de los productos a la tabla.
  cargarFormMpEnTablas(){
    let idMateriaPrima : number = this.FormMateriaPrima.value.MpId;
    let nombreMateriaPrima = this.FormMateriaPrima.value.MpNombre;
    let presentacion : string = this.FormMateriaPrima.value.MpUnidadMedida;
    let cantidad : number = this.FormMateriaPrima.value.MpCantidad;

    let productoExt : any = {
      Id : idMateriaPrima,
      Nombre : nombreMateriaPrima,
      Cant : cantidad,
      UndCant : presentacion,
    }
    if(productoExt.Cant > 0) {
      this.ArrayMateriaPrima.push(productoExt);
      this.FormMateriaPrima.reset();
    } else this.mensajeService.mensajeAdvertencia(`Advertencia`, `La cantidad de mat. prima recuperada debe ser mayor a 0!`);
  }

  //Funcion que moverá el inventario de materia prima con base a la materia prima entrante
  moverInventarioMpAgregada(){
    let count : number = 0;
    for (let index = 0; index < this.ArrayMateriaPrima.length; index++) {
      this.materiaPrimaService.srvObtenerListaPorId(this.ArrayMateriaPrima[index].Id).subscribe(datos_materiaPrima => {
        const datosMP : any = {
          MatPri_Id : this.ArrayMateriaPrima[index].Id,
          MatPri_Nombre : datos_materiaPrima.matPri_Nombre,
          MatPri_Descripcion : datos_materiaPrima.matPri_Descripcion,
          MatPri_Stock : (datos_materiaPrima.matPri_Stock + this.ArrayMateriaPrima[index].Cant),
          UndMed_Id : datos_materiaPrima.undMed_Id,
          CatMP_Id : datos_materiaPrima.catMP_Id,
          MatPri_Precio : datos_materiaPrima.matPri_Precio,
          TpBod_Id : datos_materiaPrima.tpBod_Id,
        }
        this.materiaPrimaService.srvActualizar(this.ArrayMateriaPrima[index].Id, datosMP).subscribe(() => {
          count++;
          if (count == this.ArrayMateriaPrima.length) this.mensajeService.mensajeConfirmacion(`Confirmación`, `¡Inventario de materia prima actualizado con éxito!`);
          this.limpiarTodosCampos();
        });
      }, () => this.mensajeService.mensajeError(`Error`, `¡No se pudo obtener la información de la materia prima ${this.ArrayMateriaPrima[index].Id}!`));
    }
  }

  // Funcion que limpiará todos los campos
  limpiarTodosCampos(){
    this.FormMateriaPrimaRecuperada.reset();
    this.FormMateriaPrima.reset();
    this.ArrayMateriaPrima = [];
  }

  // Función para quitar un producto de la tabla
  QuitarProductoTabla(formulario : any) {
    formulario = this.mpSeleccionada;
    this.onReject();
    this.ArrayMateriaPrima.splice(this.ArrayMateriaPrima.findIndex(x => x.Id == formulario.Id), 1);
    this.mensajeService.mensajeConfirmacion(`Confirmación`,`Se ha quitado la mat. prima ${formulario.Nombre} de la tabla`);
  }

  //Funcion que consultara una materia prima con base a un ID pasado en la vista
  buscarMpId(){
    let idMateriaPrima : number = this.FormMateriaPrima.value.MpId;
    let nuevo : any[] = this.materiasPrimas.filter((item) => item.id == idMateriaPrima);
    this.FormMateriaPrima.patchValue({
      MpId : nuevo[0].id,
      MpNombre: nuevo[0].name,
      MpCantidad: 0,
      MpUnidadMedida : 'Kg',
    });
  }

  //Funcion que consultara una materia prima con base a la que está seleccionada en la vista
  buscarMpSeleccionada(){
    let nombreMateriaPrima : string = this.FormMateriaPrima.value.MpNombre;
    let nuevo : any[] = this.materiasPrimas.filter((item) => item.id == nombreMateriaPrima);
    this.FormMateriaPrima.patchValue({
      MpId : nuevo[0].id,
      MpNombre: nuevo[0].name,
      MpCantidad: 0,
      MpUnidadMedida : 'Kg',
    });
  }

  /** Mostrar mensaje de elección */
  mostrarEleccion(item : any){
    this.mpSeleccionada = item;
    this.messageService.add({severity:'warn', key: 'recuperado', summary:'Elección', detail: `Está seguro que desea quitar ${item.Nombre} de la tabla?`, sticky: true});
  }

  /** Función para quitar mensaje de elección */
  onReject = () => this.messageService.clear('recuperado');
}
