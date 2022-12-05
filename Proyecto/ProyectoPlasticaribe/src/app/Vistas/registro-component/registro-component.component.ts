
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Workbook } from 'exceljs';
import moment from 'moment';
import { modelUsuario } from 'src/app/Modelo/modelUsuario';
import { EstadosService } from 'src/app/Servicios/estados.service';
import { RolesService } from 'src/app/Servicios/roles.service';
import { ServicioAreasService } from 'src/app/Servicios/servicio-areas.service';
import { SrvTipos_UsuariosService } from 'src/app/Servicios/srvTipos_Usuarios.service';
import { UsuarioService } from 'src/app/Servicios/usuario.service';
import Swal from 'sweetalert2';
import * as fs from 'file-saver';
import { Table } from 'primeng/table'
import { Console } from 'console';

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
  public accion : string = ''
  public fechaActual : any = moment().format('YYYY-MM-DD');
  public HoraActual : any = moment().format('H:mm:ss');
  public load : boolean = true;
  public usuariosInactivar : any = [];
  public cantidadUsuarios : number = 0;
  public mostrarPass : boolean = false;

  constructor(private formBuilder : FormBuilder,
    private servicioRoles : RolesService,
    private servicioAreas : ServicioAreasService,
    private servicioUsuarios : UsuarioService,
    private servicioEstados : EstadosService,
    private servicioTpUsuarios : SrvTipos_UsuariosService) {
      this.inicializarFormulario();
    }

  inicializarFormulario(){
    this.FormUsuarios = this.formBuilder.group({
      usuId:  null,
      usuNombre: null,
      usuTipo: null,
      usuArea: null,
      usuRol: null,
      usuEstado: null,
      usuPassword: null,
    });
  }

  ngOnInit() {
    this.cargarAreas();
    this.cargarRoles();
    this.cargarUsuarios();
    this.cargarEstados();
    this.cargarTiposUsuarios();
  }

  /** */
  cargarAreas() {
    this.servicioAreas.srvObtenerListaAreas().subscribe(dataAreas => {
      for (let index = 0; index < dataAreas.length; index++) {
        this.arrayAreas.push(dataAreas[index]);
      }
    });
  }

  /** */
  cargarRoles() {
    this.servicioRoles.srvObtenerLista().subscribe(dataRoles => {
      for (let index = 0; index < dataRoles.length; index++) {
        this.arrayRoles.push(dataRoles[index]);
      }
    });
  }

   /** */
   cargarEstados() {
    this.servicioEstados.srvObtenerListaEstados().subscribe(dataEstados => {
      for (let index = 0; index < dataEstados.length; index++) {
        if(dataEstados[index].estado_Nombre == 'Activo' ||
        dataEstados[index].estado_Nombre == 'Inactivo')
        this.arrayEstados.push(dataEstados[index]);
      }
    });
  }

  /** */
  cargarTiposUsuarios() {
    this.servicioTpUsuarios.srvObtenerLista().subscribe(dataTipoUsu => {
      for (let index = 0; index < dataTipoUsu.length; index++) {
        this.arrayTiposUsuarios.push(dataTipoUsu[index]);
      }
    });
  }

  /** */
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
          Fecha : dataUsuarios[index].usua_Fecha.replace('T00:00:00', ''),
          Hora : dataUsuarios[index].usua_Hora
        }
        infoUsuarios.Id = `${infoUsuarios.Id}`;
        if(infoUsuarios.Id.length == 1) infoUsuarios.Id = `00${infoUsuarios.Id}`
        else if(infoUsuarios.Id.length == 2) infoUsuarios.Id = `0${infoUsuarios.Id}`
        this.arrayUsuarios.push(infoUsuarios);
        this.cantidadUsuarios += 1;
      }
    });
    setTimeout(() => {
      this.load = true;
    }, 1000);
  }

  /** */
  actualizarUsuario() {
    let id : number = this.FormUsuarios.value.usuId;
    let nombre : number = this.FormUsuarios.value.usuNombre;
    let tipoUsuario : number = this.FormUsuarios.value.usuTipo;
    let area : number = this.FormUsuarios.value.usuArea;
    let rol : number = this.FormUsuarios.value.usuRol;
    let estado : number = this.FormUsuarios.value.usuEstado;
    let password : number = this.FormUsuarios.value.usuPassword;

      this.servicioUsuarios.getUsuariosxId(id).subscribe(dataUsuarios => {
        for (let index = 0; index < dataUsuarios.length; index++) {
          const infoUsuarios : any = {
            Usua_Id : dataUsuarios[index].usua_Id,
            Usua_Nombre : nombre,
            TpUsu_Id : tipoUsuario,
            Area_Id : area,
            RolUsu_Id : rol,
            Estado_Id : estado,
            Usua_Telefono : dataUsuarios[index].usua_Telefono,
            Usua_Contrasena : password,
            Usua_Email : dataUsuarios[index].usua_Email,
            TipoIdentificacion_Id : 'C.C',
            Empresa_Id : 800188730,
            cajComp_Id : dataUsuarios[index].cajComp_Id,
            eps_Id : dataUsuarios[index].eps_Id,
            fPen_Id : dataUsuarios[index].fPen_Id,
            Usua_Fecha : this.fechaActual,
            Usua_Hora : this.HoraActual,
          }
        console.log(infoUsuarios)
        this.dialogUsuarios = false;
        this.servicioUsuarios.srvActualizarUsuario(infoUsuarios.Usua_Id, infoUsuarios).subscribe(dataUsu => { this.confirmUsuarioActualizado(); });
      }
    });

  }

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
    this.inicializarFormulario();
    this.accion = 'Crear'
    this.dialogUsuarios = true;
  }

  crearUsuario() {
    let Id : number = this.FormUsuarios.value.usuId;
    if(this.FormUsuarios.valid) {
      this.servicioUsuarios.getUsuariosxId(Id).subscribe(dataUsuarios => {
        if(dataUsuarios.length > 0) {
          this.advertenciaUsuarios(Id);
        } else {
          const data : modelUsuario = {
            Usua_Id: this.FormUsuarios.value.usuId,
            Usua_Codigo: 0,
            TipoIdentificacion_Id: 'C.C',
            Usua_Nombre: this.FormUsuarios.value.usuNombre,
            Area_Id: this.FormUsuarios.value.usuArea,
            tpUsu_Id: this.FormUsuarios.value.usuTipo,
            RolUsu_Id: this.FormUsuarios.value.usuRol,
            Empresa_Id: 800188730,
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
          this.servicioUsuarios.srvGuardarUsuario(data).subscribe(dataUsuario => { this.confirmUsuarioCreado(); })
        }
      });
    } else {
      this.advertenciaCamposVacios();
    }
  }

  accionesModal() {
    console.log(this.accion)
    if(this.accion == 'Crear') this.crearUsuario();
    else if (this.accion == 'Editar') this.actualizarUsuario();
    else console.log('Hola');
  }

  advertenciaUsuarios(id : any) {
    this.dialogUsuarios = false;
    Swal.fire({
      icon: 'warning',
      title: 'Advertencia',
      text: `Ya existe un usuario con el ID ${id}`,
      confirmButtonColor: '#ffc107',
    }).then((result) => {
      if (result.isConfirmed) this.dialogUsuarios = true;
    });
  }

  advertenciaInactivarUsuario(item) {
    Swal.fire({
      icon: 'warning',
      title: 'Advertencia',
      text: `Esta seguro que desea eliminar el usuario ${item.Nombre}`,
      confirmButtonColor: '#ffc107',
      showConfirmButton : true,
      showCancelButton : true
    }).then((result) => {
      if (result.isConfirmed) this.colocarUsuarioInactivo(item.Id);
    });
  }

  advertenciaInactivarVariosUsuarios() {
    Swal.fire({
      icon: 'warning',
      title: 'Advertencia',
      text: `¿Esta seguro que desea eliminar los usuarios seleccionados?`,
      confirmButtonColor: '#ffc107',
      showConfirmButton : true,
      showCancelButton : true
    }).then((result) => {
      if (result.isConfirmed) this.inactivarUsuarios();
    });
  }

  advertenciaCamposVacios() {
    Swal.fire({icon: 'warning',  title: 'Advertencia', text: `Debe llenar los campos vacios.`, confirmButtonColor: '#ffc107', });
  }

  confirmUsuarioActualizado() {
    this.load = false
    setTimeout(() => {
      this.load = true;
      Swal.fire({icon: 'success', title: 'Confirmación', text: '¡Registro(s) actualizado(s) con éxito!', showConfirmButton: false, timer: 1500 });
      this.cargarUsuarios();
    }, 1000);
  }

  confirmUsuarioCreado() {
    this.load = false
    setTimeout(() => {
      this.load = true;
      Swal.fire({icon: 'success', title: 'Confirmación', text: '¡Registro creado con éxito!', showConfirmButton: false, timer: 1500 });
      this.cargarUsuarios();
    }, 1000);
  }

  confirmExportacion() {
    Swal.fire({icon: 'success', title: 'Confirmación', text: '¡Archivo generado con éxito!!', showConfirmButton: false, timer: 1500 });
  }

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
          console.log(infoUsuarios)
          this.dialogUsuarios = false;
          this.servicioUsuarios.srvActualizarUsuario(item, infoUsuarios).subscribe(dataUsu => { this.confirmUsuarioActualizado(); });
      }
    });
  }

  /*seleccionarUsuariosCheck(){
    this.load = false;

    setTimeout(() => {
      this.load = true;
    }, 100);
  }*/

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
      setTimeout(() => { this.confirmExportacion(); }, 4000);
  }

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
          console.log(infoUsuarios)
		      this.dialogUsuarios = false;
          this.servicioUsuarios.srvActualizarUsuario(this.usuariosInactivar[i].Id, infoUsuarios).subscribe(dataUsu => {this.confirmUsuarioActualizado(); });
        }
	  });
	}
}

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

aplicarfiltroGlobal($event, valorCampo : string){
  this.dt!.filterGlobal(($event.target as HTMLInputElement).value, valorCampo);
}

}
