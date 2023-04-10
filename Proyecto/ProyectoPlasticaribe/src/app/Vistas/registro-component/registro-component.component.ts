import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Workbook } from 'exceljs';
import moment from 'moment';
import { modelUsuario } from 'src/app/Modelo/modelUsuario';
import { EstadosService } from 'src/app/Servicios/Estados/estados.service';
import { RolesService } from 'src/app/Servicios/Roles/roles.service';
import { SrvTipos_UsuariosService } from 'src/app/Servicios/TiposUsuarios/srvTipos_Usuarios.service';
import { UsuarioService } from 'src/app/Servicios/Usuarios/usuario.service';
import Swal from 'sweetalert2';
import * as fs from 'file-saver';
import { Table } from 'primeng/table'
import { AreaService } from 'src/app/Servicios/Areas/area.service';
import { MessageService } from 'primeng/api';
import { modelAreas } from 'src/app/Modelo/modelAreas';
import { modelRol } from 'src/app/Modelo/modelRol';
import { modelTipoUsuario } from 'src/app/Modelo/modelTipoUsuario';

@Component({
  selector: 'app-registro-component',
  templateUrl: './registro-component.component.html',
  styleUrls: ['./registro-component.component.css']
})
export class RegistroComponentComponent implements OnInit {

  @ViewChild('dt') dt: Table | undefined;

  public FormUsuarios !: FormGroup; /** Formulario alojado en el modal para editar y eliminar usuarios */
  public arrayAreas : any = []; /** Array para cargar areas al combobox del formulario de usuarios */
  public arrayRoles : any = []; /** Array para cargar roles al combobox del formulario de usuarios */
  public arrayUsuarios : any = []; /** Array para cargar usuarios a la tabla que carga en cuanto se carga el modulo. */
  public arrayEstados : any = []; /** Array para cargar estados al combobox del formulario de usuarios */
  public arrayTiposUsuarios: any = [];  /** Array para cargar tipos de usuarios al combobox del formulario de usuarios */
  rows = 10; /** Filas de la tabla que se cargaran inicialmente  */
  first = 0; /** variable que mostrará  */
  public dialogUsuarios : boolean;
  public accion : string = '' //Funcion que tomará las acciones de los botones
  public fechaActual : any = moment().format('YYYY-MM-DD'); //Variable que guardará la la fecha actual
  public HoraActual : any = moment().format('H:mm:ss'); //Variable que guardará la hora actual
  public load : boolean = true; //funcion que mostrará o no el icono de carga
  public usuariosInactivar : any = []; //Funcion que guardará los usuarios que se van a innactivar
  public cantidadUsuarios : number = 0; //Funcion que guardará la cantidad total de usuarios
  public mostrarPass : boolean = false; //Funcion que mostrará el un icono u otro para mostrar o no la contraseña
  public nuevoDialogo : boolean = false; /** Dialogo para crear roles de usuarios y areas */
  public formRoles !: FormGroup; /** Formulario para crear roles y tipos de usuarios. */
  public formAreas !: FormGroup; /** Formulario para crear areas */
  public accionDialogoNuevo : string = ''; /** Acción del dialogo (Modal) nuevo de areas o roles */
  public arrayNombresRoles : any = []; /** Array que cargará los nombres de los roles en el modal para crear roles. */
  public arrayNombresAreas : any = []; /** Array que cargará los nombres de las areas en el modal para crear areas. */

  constructor(private formBuilder : FormBuilder,
              private servicioRoles : RolesService,
                private servicioAreas : AreaService,
                  private servicioUsuarios : UsuarioService,
                    private servicioEstados : EstadosService,
                      private servicioTpUsuarios : SrvTipos_UsuariosService,
                       private messageService: MessageService) {

    this.FormUsuarios = this.formBuilder.group({
      usuId:  null,
      usuNombre: null,
      usuTipo: null,
      usuArea: null,
      usuRol: null,
      usuEstado: null,
      usuPassword: null,
    });

    this.inicializarFormularioRoles();
    this.inicializarFormularioAreas();
  }

  ngOnInit() {
    this.cargarAreas();
    this.cargarRoles();
    this.cargarUsuarios();
    this.cargarEstados();
    this.cargarTiposUsuarios();
  }

  // Funcion que crgará las areas
  cargarAreas() {
    this.arrayAreas = [];
    this.servicioAreas.srvObtenerLista().subscribe(dataAreas => { this.arrayAreas = dataAreas; });
  }

  // Funcion que cargará los roles
  cargarRoles() {
    this.arrayRoles = [];
    this.servicioRoles.srvObtenerLista().subscribe(dataRoles => { this.arrayRoles = dataRoles; });
  }

  // Funcion que cargará los estados que pueden tener los usuarios
  cargarEstados() {
    this.arrayEstados = [];
    this.servicioEstados.srvObtenerListaEstados().subscribe(dataEstados => {
      for (let index = 0; index < dataEstados.length; index++) {
        if(dataEstados[index].estado_Nombre == 'Activo' ||
        dataEstados[index].estado_Nombre == 'Inactivo')
        this.arrayEstados.push(dataEstados[index]);
      }
    });
  }

  // Funcion que cargará los tipos de usuarios
  cargarTiposUsuarios() {
    this.arrayTiposUsuarios = [];
    this.servicioTpUsuarios.srvObtenerLista().subscribe(dataTipoUsu => { this.arrayTiposUsuarios = dataTipoUsu; });
  }

  // Funcion que cargará los usuarios
  cargarUsuarios() {
    this.load = false;
    this.cantidadUsuarios = 0;
    this.arrayUsuarios = [];
    this.servicioUsuarios.getUsuarios().subscribe(dataUsuarios => {
      for (let index = 0; index < dataUsuarios.length; index++) {
        const infoUsuarios : any = {
          Id : dataUsuarios[index].usua_Id,
          Nombre : dataUsuarios[index].usua_Nombre,
          Tipo : dataUsuarios[index].tpUsu_Nombre,
          Area : dataUsuarios[index].area_Nombre,
          Rol : dataUsuarios[index].rolUsu_Nombre,
          Estado : dataUsuarios[index].estado_Nombre,
          Password : dataUsuarios[index].usua_Contrasena,
          Email : dataUsuarios[index].usua_Email,
          Telefono : dataUsuarios[index].usua_Telefono,
          TipoId : dataUsuarios[index].tipoIdentificacion_Id,
          Empresa : dataUsuarios[index].empresa_Nombre,
          Caja : dataUsuarios[index].cajComp_Nombre,
          EPS : dataUsuarios[index].eps_Nombre,
          FondoP : dataUsuarios[index].fPen_Nombre,
          Fecha : dataUsuarios[index].usua_Fecha,
          Hora : dataUsuarios[index].usua_Hora
        }
        infoUsuarios.Id = `${infoUsuarios.Id}`;
        if(infoUsuarios.Id.length == 1) infoUsuarios.Id = `00${infoUsuarios.Id}`
        else if(infoUsuarios.Id.length == 2) infoUsuarios.Id = `0${infoUsuarios.Id}`
        this.arrayUsuarios.push(infoUsuarios);
        this.cantidadUsuarios += 1;
      }
    });
    setTimeout(() => { this.load = true; }, 1000);
  }

  // Funcion que actualizará los usuarios
  actualizarUsuario() {
    this.servicioUsuarios.getUsuariosxId(this.FormUsuarios.value.usuId).subscribe(dataUsuarios => {
      for (let index = 0; index < dataUsuarios.length; index++) {
        const infoUsuarios : any = {
          Usua_Id : dataUsuarios[index].usua_Id,
          Usua_Nombre : this.FormUsuarios.value.usuNombre,
          TpUsu_Id : this.FormUsuarios.value.usuTipo,
          Area_Id : this.FormUsuarios.value.usuArea,
          RolUsu_Id : this.FormUsuarios.value.usuRol,
          Estado_Id : this.FormUsuarios.value.usuEstado,
          Usua_Telefono : dataUsuarios[index].usua_Telefono,
          Usua_Contrasena : this.FormUsuarios.value.usuPassword,
          Usua_Email : dataUsuarios[index].usua_Email,
          TipoIdentificacion_Id : 'C.C',
          Empresa_Id : 800188732,
          cajComp_Id : dataUsuarios[index].cajComp_Id,
          eps_Id : dataUsuarios[index].eps_Id,
          fPen_Id : dataUsuarios[index].fPen_Id,
          Usua_Fecha : this.fechaActual,
          Usua_Hora : this.HoraActual,
        }
        this.dialogUsuarios = false;
        this.servicioUsuarios.srvActualizarUsuario(infoUsuarios.Usua_Id, infoUsuarios).subscribe(dataUsu => {
          this.mensajeConfirmacion(`¡Usuario Actualizado!`,`¡Los datos del usuario ${this.FormUsuarios.value.usuNombre} han sido actualizados!`);
        }, error => { this.mensajeError(`¡Ocurrió un error!`,`¡Ocurrió un error al actualizar los datos del usuario ${this.FormUsuarios.value.usuNombre}!`); });
      }
    });
  }

  // Funcion que cargará la informacion del usuario seleccionado en el modal donde se podrá editar
  cargarModalEditarUsuario(item) {
    this.dialogUsuarios = true;
    this.accion = 'Editar'
    this.servicioUsuarios.getUsuariosxId(item.Id).subscribe(dataUsuarios => {
      this.FormUsuarios.setValue({
        usuId:  dataUsuarios[0].usua_Id,
        usuNombre: dataUsuarios[0].usua_Nombre,
        usuTipo: dataUsuarios[0].tpUsu_Id,
        usuArea: dataUsuarios[0].area_Id,
        usuRol: dataUsuarios[0].rolUsu_Id,
        usuEstado: dataUsuarios[0].estado_Id,
        usuPassword: dataUsuarios[0].usua_Contrasena,
      });
    });
  }

  cargarModalUsuarios() {
    this.FormUsuarios.reset();
    this.accion = 'Crear'
    this.dialogUsuarios = true;
  }

  // Funcion que creará nuevos usuarios
  crearUsuario() {
    let Id : number = this.FormUsuarios.value.usuId;
    if(this.FormUsuarios.valid) {
      this.servicioUsuarios.getUsuariosxId(Id).subscribe(dataUsuarios => {
        if(dataUsuarios.length > 0) this.mensajeAdvertencia(`¡Ya existe un usuario con el Id ${Id}!`);
        else {
          const data : modelUsuario = {
            Usua_Id: this.FormUsuarios.value.usuId,
            Usua_Codigo: 0,
            TipoIdentificacion_Id: 'C.C',
            Usua_Nombre: this.FormUsuarios.value.usuNombre,
            Area_Id: this.FormUsuarios.value.usuArea,
            tpUsu_Id: this.FormUsuarios.value.usuTipo,
            RolUsu_Id: this.FormUsuarios.value.usuRol,
            Empresa_Id: 800188732,
            Estado_Id: this.FormUsuarios.value.usuEstado,
            Usua_Email: '',
            Usua_Telefono: '',
            Usua_Contrasena: this.FormUsuarios.value.usuPassword,
            cajComp_Id: 0,
            eps_Id: 0,
            fPen_Id: 0,
            Usua_Fecha: this.fechaActual,
            Usua_Hora: this.HoraActual
          }
          this.dialogUsuarios = false;
          this.servicioUsuarios.srvGuardarUsuario(data).subscribe(dataUsuario => {
            this.mensajeConfirmacion(`¡Usuairo creado!`, `¡Se ha creado un nuevo usuario!`);
          }, error => { this.mensajeError(`¡Ocurrió un error`, `¡Ocurrió un error al crear el nuevo usuario!`); })
        }
      });
    } else this.mensajeAdvertencia(`¡Para poder crear un usuario debe diligenciar todos los campos!`);
  }

  // Funcion permitirá a una u otra de las funciones que tiene el modal
  accionesModal() {
    if(this.accion == 'Crear') this.crearUsuario();
    else if (this.accion == 'Editar') this.actualizarUsuario();
  }

  // Funcion que va a innactivar un usuario
  colocarUsuarioInactivo(item) {
    this.load = false;
    this.servicioUsuarios.getUsuariosxId(item).subscribe(dataUsuarios => {
      for (let index = 0; index < dataUsuarios.length; index++) {
        const infoUsuarios : any = {
          Usua_Id : dataUsuarios[index].usua_Id,
          Usua_Nombre : dataUsuarios[index].usua_Nombre,
          TpUsu_Id : dataUsuarios[index].tpUsu_Id,
          Area_Id : dataUsuarios[index].area_Id,
          RolUsu_Id : dataUsuarios[index].rolUsu_Id,
          Estado_Id : 8,
          Usua_Telefono : dataUsuarios[index].usua_Telefono,
          Usua_Contrasena : dataUsuarios[index].usua_Contrasena,
          Usua_Email : dataUsuarios[index].usua_Email,
          TipoIdentificacion_Id : dataUsuarios[index].tipoIdentificacion_Id,
          Empresa_Id : dataUsuarios[index].empresa_Id,
          cajComp_Id : dataUsuarios[index].cajComp_Id,
          eps_Id : dataUsuarios[index].eps_Id,
          fPen_Id : dataUsuarios[index].fPen_Id,
          Usua_Fecha : dataUsuarios[index].usua_Fecha,
          Usua_Hora : dataUsuarios[index].usua_Hora,
        }
        this.dialogUsuarios = false;
        this.servicioUsuarios.srvActualizarUsuario(item, infoUsuarios).subscribe(dataUsu => {
          this.mensajeConfirmacion(`¡Usuario Actualizado!`,`¡Los datos del usuario ${dataUsuarios[index].usua_Nombre} han sido actualizados!`);
        }, error => { this.mensajeError(`¡Ocurrió un error!`,`¡Ocurrió un error al actualizar los datos del usuario ${dataUsuarios[index].usua_Nombre}!`); });
      }
    });
  }

  // Funcion que va a exportar a excel los datos de los usuarios a excel
  exportarExcel() {
    this.load = false;
    setTimeout(() => {
      const title = `Listado de Usuarios - Plasticaribe SAS`;
      const header = ["ID", "Nombre", "Tipo Usuario", "Area", "Rol", "Estado", "Contraseña", "Email", "Teléfono", "Tipo Id", "Empresa", "Caja Compensación", "EPS", "Fondo Pensional", "Fecha Creación", "Hora Creación "]
      let datos : any =[];
      for (const item of this.arrayUsuarios) {
        const datos1  : any = [item.Id, item.Nombre, item.Tipo, item.Area, item.Rol, item.Estado, item.Password, item.Email, item.Telefono, item.TipoId, item.Empresa, item.Caja, item.EPS, item.FondoP, item.Fecha, item.Hora];
        datos.push(datos1);
      }
      let workbook = new Workbook();
      let worksheet = workbook.addWorksheet(`Listado de Usuarios`);
      let titleRow = worksheet.addRow([title]);
      titleRow.font = { name: 'Calibri', family: 4, size: 16, underline: 'double', bold: true };
      worksheet.addRow([]);
      let headerRow = worksheet.addRow(header);
      headerRow.eachCell((cell, number) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'eeeeee' }
        }
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
      });
      worksheet.mergeCells('A1:P2');
      worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
      datos.forEach(d => {
        let row = worksheet.addRow(d);
      });
      worksheet.getColumn(1).width = 12;
      worksheet.getColumn(2).width = 40;
      worksheet.getColumn(3).width = 25;
      worksheet.getColumn(4).width = 15;
      worksheet.getColumn(5).width = 25;
      worksheet.getColumn(6).width = 10;
      worksheet.getColumn(7).width = 20;
      worksheet.getColumn(8).width = 30;
      worksheet.getColumn(9).width = 12;
      worksheet.getColumn(10).width = 8;
      worksheet.getColumn(11).width = 20;
      worksheet.getColumn(12).width = 20;
      worksheet.getColumn(13).width = 20;
      worksheet.getColumn(14).width = 20;
      worksheet.getColumn(15).width = 15;
      worksheet.getColumn(16).width = 15;

      setTimeout(() => {
        workbook.xlsx.writeBuffer().then((data) => {
          let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          fs.saveAs(blob, `Listado de usuarios.xlsx`);
        });
        this.load = true;
      }, 1000);
    }, 3500);
    setTimeout(() => { this.mensajeConfirmacion(`¡Exportación a excel!`, `¡Se ha exportado a un archivo de excel la información de todos los usuarios!`); }, 4000);
  }

  // Funcion que va a innactivar varios usuarios
  inactivarUsuarios() {
	  for (let i = 0; i < this.usuariosInactivar.length; i++) {
		  this.servicioUsuarios.getUsuariosxId(this.usuariosInactivar[i].Id).subscribe(dataUsuarios => {
        for (let index = 0; index < dataUsuarios.length; index++) {
          const infoUsuarios : any = {
            Usua_Id : dataUsuarios[index].usua_Id,
            Usua_Nombre : dataUsuarios[index].usua_Nombre,
            TpUsu_Id : dataUsuarios[index].tpUsu_Id,
            Area_Id : dataUsuarios[index].area_Id,
            RolUsu_Id : dataUsuarios[index].rolUsu_Id,
            Estado_Id : 8,
            Usua_Telefono : dataUsuarios[index].usua_Telefono,
            Usua_Contrasena : dataUsuarios[index].usua_Contrasena,
            Usua_Email : dataUsuarios[index].usua_Email,
            TipoIdentificacion_Id : dataUsuarios[index].tipoIdentificacion_Id,
            Empresa_Id : dataUsuarios[index].empresa_Id,
            cajComp_Id : dataUsuarios[index].cajComp_Id,
            eps_Id : dataUsuarios[index].eps_Id,
            fPen_Id : dataUsuarios[index].fPen_Id,
            Usua_Fecha : dataUsuarios[index].usua_Fecha,
            Usua_Hora : dataUsuarios[index].usua_Hora,
          }
		      this.dialogUsuarios = false;
          this.servicioUsuarios.srvActualizarUsuario(this.usuariosInactivar[i].Id, infoUsuarios).subscribe(dataUsu => {
            this.mensajeConfirmacion(`¡Usuario Actualizado!`,`¡Los datos del usuario ${dataUsuarios[index].usua_Nombre} han sido actualizados!`);
          }, error => { this.mensajeError(`¡Ocurrió un error!`,`¡Ocurrió un error al actualizar los datos del usuario ${dataUsuarios[index].usua_Nombre}!`); });
        }
      });
    }
  }

  // Funcin que va a mostrar o no la contraseña del usuario
  mostrarPassword(){
    let password : any = document.getElementById('pass');
    if(password.type == 'password') {
      password.type = 'text';
      this.mostrarPass = true;
    } else {
      password.type = 'password';
      this.mostrarPass = false;
    }
  }

  // Funcion que permitirá filtrar la información de la tabla
  aplicarfiltroGlobal($event, valorCampo : string){
    this.dt!.filterGlobal(($event.target as HTMLInputElement).value, valorCampo);
  }

  /** Cargar modal de crear roles y tipos de usuarios */
  modalRoles_TiposUsuarios(){
    this.nuevoDialogo = true;
    this.accionDialogoNuevo = 'Rol';
    this.formRoles.reset();
  }

  /** Cargar modal de crear roles y tipos de usuarios */
  modalAreas(){
    this.nuevoDialogo = true;
    this.accionDialogoNuevo = 'Area';
    this.formAreas.reset();
  }

  /** Cargar modal de crear roles y tipos de usuarios */
  inicializarFormularioRoles(){
    this.formRoles = this.formBuilder.group({
      rolNombre : [null, Validators.required],
      rolDescripcion : [null]
    })
  }

  /** Cargar modal de crear areas de usuarios */
  inicializarFormularioAreas(){
    this.formAreas = this.formBuilder.group({
      areaNombre : [null, Validators.required],
      areaDescripcion : [null]
    })
  }

  /** Crear roles de usuarios */
  crearRoles(){
    let nombreRol : any = this.formRoles.value.rolNombre;
    let descripcionRol : any = this.formRoles.value.rolDescripcion;
    if(this.formRoles.valid) {
      this.servicioRoles.getRolxNombre(nombreRol).subscribe(dataRoles => {
        if(dataRoles.length > 0) this.mensajeAdvertencia(`¡No se pudo crear el rol debido a que ya existe uno con el nombre indicado!`);
        else {
          const roles : modelRol = { RolUsu_Id : 0, RolUsu_Nombre : nombreRol, RolUsu_Descripcion : descripcionRol, }
          const tipoUsu : modelTipoUsuario = { tpUsu_Id: 0, tpUsu_Nombre: nombreRol, tpUsu_Descripcion: descripcionRol, }
          this.servicioRoles.srvGuardar(roles).subscribe(dataRol => {  this.crearTipo_Usuario(tipoUsu); }, error => {
            this.mensajeError(`¡Ocurrió un error!`, `¡No fue posible crear el Rol!`);
          });
        }
      });
    } else this.mensajeAdvertencia(`¡Para poder crear un rol debe diligenciar todos los campos!`);
  }

  /** Crea tipo de usuario con el mismo nombre de rol */
  crearTipo_Usuario(tipo_usuario : any) {
    this.servicioTpUsuarios.Insert(tipo_usuario).subscribe(dataRol => {
      this.mensajeConfirmacion(`¡Se ha creado un tipo de usuario!`, `¡Se creó un tipo de usuario!`)
      this.formRoles.reset();
      setTimeout(() => { this.cargarRoles(); this.cargarTiposUsuarios();  }, 1000);
    }, error => { this.mensajeError(`¡Ocurrió un error!`, `¡No fue posible crear el tipo de usuario!`) });
  }

  /** Crear areas desde el modal */
  crearAreas(){
    let nombreArea : any = this.formAreas.value.areaNombre;
    let descripcionArea : any = this.formAreas.value.areaDescripcion;
    if(this.formAreas.valid){
      this.servicioAreas.getNombre(nombreArea).subscribe(dataAreas => {
        if(dataAreas.length > 0) this.mensajeAdvertencia(`¡Ya existe un área con el nombre ${nombreArea}!`);
        else {
          const areas : modelAreas = {area_Id: 0, area_Nombre: nombreArea, area_Descripcion: descripcionArea, }
          this.servicioAreas.srvGuardar(areas).subscribe(dataArea => {
            this.mensajeConfirmacion(`¡Área creada!`, `¡Se creó un área satisfactoriamente!`);
            this.formAreas.reset();
            setTimeout(() => { this.cargarAreas(); }, 1000);
          }, error => { this.mensajeError(`¡Ocurrió un error!`, `¡Ha ocurrido un error al intentar crear una nueva área!`); })
        }
      });
    } else this.mensajeAdvertencia(`¡Para poder crear un area debe diligenciar todos los campos!`);
  }

  /** Agregar roles o areas dependiendo la acción del dialogo. */
  agregar() {
    if(this.accionDialogoNuevo == 'Rol') this.crearRoles();
    else this.crearAreas();
  }

  /** Cargar roles al datalist al momento de escribir en el campo nombre del modal*/
  cargarRoles_Like(){
    this.arrayNombresRoles = [];
    let nombreRol : any = this.formRoles.value.rolNombre;
    if(nombreRol != null) {
      this.servicioRoles.likeGetNombre(nombreRol).subscribe(dataRoles => {
        for (let index = 0; index < dataRoles.length; index++) {
          this.arrayNombresRoles.push(dataRoles[index]);
        }
      });
    }
  }

  /** Cargar areas al datalist al momento de escribir en el campo nombre del modal */
  cargarAreas_Like(){
    this.arrayNombresAreas = [];
    let nombreArea : any = this.formAreas.value.areaNombre;
    if(nombreArea != null) {
      this.servicioAreas.likeGetNombreArea(nombreArea).subscribe(dataRoles => {
        for (let index = 0; index < dataRoles.length; index++) {
          this.arrayNombresAreas.push(dataRoles[index]);
        }
      });
    }
  }

  /** Mostrar mensaje de confirmación  */
  mensajeConfirmacion(titulo : string, mensaje : any) {
    this.messageService.add({severity: 'success', summary: mensaje,  detail: titulo, life: 2000});
    this.cargarUsuarios();
   }

  /** Mostrar mensaje de error  */
  mensajeError(titulo : string, mensaje : string) {
  this.messageService.add({severity:'error', summary: mensaje, detail: titulo, life: 2000});
  }

  /** Mostrar mensaje de advertencia */
  mensajeAdvertencia(mensaje : string) {
  this.messageService.add({severity:'warn', summary: `¡Advertencia!`, detail: mensaje, life: 2000});
  }

}
