import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { CategoriaMateriaPrimaService } from 'src/app/Servicios/categoriaMateriaPrima.service';
import { MateriaPrimaService } from 'src/app/Servicios/materiaPrima.service';
import { ProcesosService } from 'src/app/Servicios/procesos.service';
import { RecuperadoService } from 'src/app/Servicios/recuperado.service';
import { RecuperadoMPService } from 'src/app/Servicios/recuperadoMP.service';
import { RolesService } from 'src/app/Servicios/roles.service';
import { TipoBodegaService } from 'src/app/Servicios/tipoBodega.service';
import { TipoRecuperadoService } from 'src/app/Servicios/tipoRecuperado.service';
import { TurnosService } from 'src/app/Servicios/Turnos.service';
import { UnidadMedidaService } from 'src/app/Servicios/unidad-medida.service';
import { UsuarioService } from 'src/app/Servicios/usuario.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-MateriaPrimaRecuperada',
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

  constructor(private materiaPrimaService : MateriaPrimaService,
                private categoriMpService : CategoriaMateriaPrimaService,
                  private tipoBodegaService : TipoBodegaService,
                    private unidadMedidaService : UnidadMedidaService,
                      private usuarioService : UsuarioService,
                        private procesosService : ProcesosService,
                          private rolService : RolesService,
                            private frmBuilderMateriaPrima : FormBuilder,
                              @Inject(SESSION_STORAGE) private storage: WebStorageService,
                                private recuperadoService : RecuperadoService,
                                  private recuperadoMPService : RecuperadoMPService,
                                    private tipoRecuperadoService : TipoRecuperadoService,
                                      private turnosService : TurnosService,) {

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
      MpCantidad : ['', Validators.required],
      MpUnidadMedida: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.lecturaStorage();
    this.obtenerUnidadMedida();
    this.obtenerMateriasPrimasRetiradas();
    this.obtenerUsuarios();
    this.obtenerTurnos();
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

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = '$1,';
    return number.toString().replace(exp,rep);
  }

  // Funcion que limpia los todos los campos de la vista
  LimpiarCampos() {
    this.FormMateriaPrimaRecuperada.reset();
  }

  // Funcion que se encargará de trar los turnos de la empresa
  obtenerTurnos(){
     this.turnos = [];
     this.turnosService.srvObtenerLista().subscribe(datos_turnos => {
      for (let i = 0; i < datos_turnos.length; i++) {
        if (datos_turnos[i].turno_Nombre != 'N/E') this.turnos.push(datos_turnos[i]);
      }
     });
  }

  //Funcion que limpiará los campos de la materia pirma entrante
  limpiarCamposMP(){
    this.FormMateriaPrima.reset();
  }

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
  obtenerNombreCategoriasMp(){
    this.categoriMpService.srvObtenerLista().subscribe(datos_categorias => {
      for (let index = 0; index < datos_categorias.length; index++) {
        this.nombreCategoriasMP.push(datos_categorias[index].catMP_Nombre);
      }
    });
  }

  //Funcion que va almacenar todas las unidades de medida existentes en la empresa
  obtenerUnidadMedida(){
    this.unidadMedidaService.srvObtenerLista().subscribe(datos_unidadesMedida => {
      for (let index = 0; index < datos_unidadesMedida.length; index++) {
        this.unidadMedida.push(datos_unidadesMedida[index].undMed_Id);
      }
    });
  }

  //Funcion que se encargará de buscary almacenar todos los usuarios
  obtenerUsuarios(){
    this.usuarioService.srvObtenerListaUsuario().subscribe(datos_usuarios => {
      for (let index = 0; index < datos_usuarios.length; index++) {
        if (datos_usuarios[index].rolUsu_Id == 3) this.usuarios.push(datos_usuarios[index]);
      }
    });
  }

  //Funcion que traerá la información del usuario seleccionado
  llenarUsuarioSeleccionado(){
    let usuarioSelccionado : string = this.FormMateriaPrimaRecuperada.value.usuarioNombre;
    this.usuarioService.srvObtenerListaPorId(usuarioSelccionado).subscribe(datos_usuario => {
      this.FormMateriaPrimaRecuperada.setValue({
        ConsecutivoFactura : this.FormMateriaPrimaRecuperada.value.ConsecutivoFactura,
        MpingresoFecha: this.FormMateriaPrimaRecuperada.value.MpingresoFecha,
        usuarioNombre : this.FormMateriaPrimaRecuperada.value.usuarioNombre,
        usuarioId: datos_usuario.usua_Id,
        MpObservacion: this.FormMateriaPrimaRecuperada.value.MpObservacion,
        Turno : this.FormMateriaPrimaRecuperada.value.Turno,
        Maquina : this.FormMateriaPrimaRecuperada.value.Maquina,
      });
    })
  }

  //Funcion que registrará y guardará en la base de datos la infomacion de la materia prima entrante
  registrarRecuperado(){
    if (this.ArrayMateriaPrima.length == 0) Swal.fire("Debe cargar minimo una materia prima en la tabla")
    else {
      let idUsuario: number = this.FormMateriaPrimaRecuperada.value.usuarioId;
      let observacion : string = this.FormMateriaPrimaRecuperada.value.MpObservacion;
      let fecha : any = this.FormMateriaPrimaRecuperada.value.MpingresoFecha;
      let turno : string = this.FormMateriaPrimaRecuperada.value.Turno;

      const datosRecuperado : any = {
        RecMp_FechaIngreso : this.today,
        Usua_Id : this.storage_Id,
        RecMp_Observacion : observacion,
        Proc_Id : 'RECUP',
        RecMp_FechaEntrega : fecha,
        RecMp_HoraIngreso : moment().format("H:mm:ss"),
        RecMp_Maquina : 0,
        Turno_Id : turno,
        Usua_Operador: idUsuario,
      }

      this.recuperadoService.srvGuardar(datosRecuperado).subscribe(datos_RecuperadoCreada => {
        this.obtenerUltimoIdRecuperado();
      }, error => {
        Swal.fire({
        icon: 'error',
        title: 'Oops..',
        html: `<b>¡Error al ingresar el Peletizado!</b><br>` + `<spam style="color: #f00">${error}</spam>`,
        showCloseButton: true,
        });
      });
    }
  }

  // Funcion que se encargará de obtener el ultimo Id de las facturas
  obtenerUltimoIdRecuperado(){
    let idMateriaPrima : number;
    let cantidadMateriaPrima : number;
    let presentacionMateriaPrima : string;
    let tipoRecuperado : string = '1';

    this.recuperadoService.srvObtenerUltimaAsignacion().subscribe(datos_recuperados => {
      let datos : any = [];
      datos.push(datos_recuperados);
      for (let index = 0; index < datos.length; index++) {
        for (let index = 0; index < this.ArrayMateriaPrima.length; index++) {
          idMateriaPrima = this.ArrayMateriaPrima[index].Id;
          cantidadMateriaPrima = this.ArrayMateriaPrima[index].Cant;
          presentacionMateriaPrima = this.ArrayMateriaPrima[index].UndCant;
          const datosRecuperadoMp : any = {
            RecMp_Id : datos[index].recMp_Id,
            MatPri_Id : idMateriaPrima,
            RecMatPri_Cantidad : cantidadMateriaPrima,
            UndMed_Id : presentacionMateriaPrima,
            TpRecu_Id : tipoRecuperado,
          }
          this.recuperadoMPService.srvGuardar(datosRecuperadoMp).subscribe(datos_recuperadoMpCreada => {
          }, error => {
            Swal.fire({
            icon: 'error',
            title: 'Oops..',
            text: "¡Hay campos vacios!",
            html: `<b>¡Error al registrar la materia prima recuperada!</b><br>` + `<spam style="color: #f00">${error}</spam>`,
            showCloseButton: true,
            });
          });
          this.moverInventarioMpAgregada();
        }
      }
    }, error => {
      Swal.fire({
      icon: 'error',
      title: 'Oops..',
      text: "¡Hay campos vacios!",
      html: `<b>¡Error al consultar el ultimo Id de Recuperado!</b><br>` + `<spam style="color: #f00">${error}</spam>`,
      showCloseButton: true,
      });
    });
  }

  //Funcion que va a validar la informacion que se ingresa a la tabla
  validarCamposVaciosMP(){
    if (this.FormMateriaPrima.valid) this.cargarFormMpEnTablas();
    else Swal.fire("Hay campos de la Materi Prima vacios");
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
    this.ArrayMateriaPrima.push(productoExt);
    this.FormMateriaPrima.reset();
  }

  //Funcion que moverá el inventario de materia prima con base a la materia prima entrante
  moverInventarioMpAgregada(){
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
        this.materiaPrimaService.srvActualizar(this.ArrayMateriaPrima[index].Id, datosMP).subscribe(datos_mp_creada => {
          Swal.fire({
            icon: 'success',
            title: 'Registro Exitos',
            html: `<b>¡Registro De Materia Prima Recuperada Creado Con Exito!</b>`,
            showCloseButton: true,
          });
          this.limpiarTodosCampos();
        }, error => {
          Swal.fire({
            icon: 'error',
            title: 'Oops..',
            html: `<b>¡Error al mover el inventario de la materia prima recuperada!</b><br>` + `<spam style="color: #f00">${error}</spam>`,
            showCloseButton: true,
          });
        });
      });
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
    Swal.fire({
      title: '¿Estás seguro de eliminar la Materia Prima?',
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

  //Funcion que consultara una materia prima con base a un ID pasado en la vista
  buscarMpId(){
    let idMateriaPrima : number = this.FormMateriaPrima.value.MpId;
    this.materiaPrimaService.srvObtenerListaPorId(idMateriaPrima).subscribe(datos_materiaPrima => {
      this.FormMateriaPrima.setValue({
        MpId : datos_materiaPrima.matPri_Id,
        MpNombre: datos_materiaPrima.matPri_Nombre,
        MpCantidad: '',
        MpUnidadMedida : datos_materiaPrima.undMed_Id,
      });
    });
  }

  //Funcion que consultara una materia prima con base a la que está seleccionada en la vista
  buscarMpSeleccionada(){
    let nombreMateriaPrima : string = this.FormMateriaPrima.value.MpNombre;
    this.materiaPrimaService.srvObtenerListaPorId(nombreMateriaPrima).subscribe(datos_materiasPrimas => {
      this.FormMateriaPrima.setValue({
        MpId : datos_materiasPrimas.matPri_Id,
        MpNombre: datos_materiasPrimas.matPri_Nombre,
        MpCantidad: '',
        MpUnidadMedida : datos_materiasPrimas.undMed_Id,
      });
    });
  }

}
