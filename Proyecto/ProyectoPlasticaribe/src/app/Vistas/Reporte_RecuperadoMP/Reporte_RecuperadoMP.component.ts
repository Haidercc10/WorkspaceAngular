import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {AutoCompleteModule} from 'primeng/autocomplete';
import { MateriaPrimaService } from 'src/app/Servicios/materiaPrima.service';
import { RecuperadoService } from 'src/app/Servicios/recuperado.service';
import { RecuperadoMPService } from 'src/app/Servicios/recuperadoMP.service';
import { TurnosService } from 'src/app/Servicios/Turnos.service';
import { UsuarioService } from 'src/app/Servicios/usuario.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-Reporte_RecuperadoMP',
  templateUrl: './Reporte_RecuperadoMP.component.html',
  styleUrls: ['./Reporte_RecuperadoMP.component.css']
})
export class Reporte_RecuperadoMPComponent implements OnInit {

  public formReporteRMP !: FormGroup; /** Formulario de filtros */
  public materiasPrimas = []; /** Array que contendrá los datos de la consulta */
  turnos : any [] = []; //Variable que va a almacenar los diferenes turnos
  operarios : any [] = []; //Variable que almacenará a los diferentes operarios de el area de recuperado
  registros : any [] = []; //Variable que almacenará los diferentes registros de los filtros consultados
  columnas : any [] = []; //Variable que va a almacenar las columnas
  idOperario : number = null; //Variable que va a almacenar el id del operario escogido
  idMateriaPrima : number = null; //Variable que va a almacenar el id de la materia prima escogida
  first = 0;
  rows = 20;

  constructor(private frmBuilder : FormBuilder,
                private materiaPrimaService : MateriaPrimaService,
                  private turnosService : TurnosService,
                    private usuariosService : UsuarioService,
                      private recuperadoService : RecuperadoMPService) {

    this.formReporteRMP = this.frmBuilder.group({
      FechaInicial: [null],
      FechaFinal : [null],
      MateriaPrima : [null],
      Turno : [null],
      Operario : [null],
    });
   }

  ngOnInit() {
    this.obtenerMateriaPrima();
    this.obtenerTurnos();
    this.obtenerOperarios();

    this.columnas = [
      { header: 'Registrada Por', field: 'usua_Nombre'},
      { header: 'Fecha', field: 'fecha' },
      { header: 'Materia Prima', field: 'matPrima'},
      { header: 'Cantidad', field: 'cant'},
      { header: 'Presentacion', field: 'undMed'},
    ];
  }

  // Funcion que va a obtener los diferentes turnos y los almacenará en una variable
  obtenerTurnos(){
    this.turnosService.srvObtenerLista().subscribe(datos_turnos => {
      for (let i = 0; i < datos_turnos.length; i++) {
        this.turnos.push(datos_turnos[i]);
      }
    });
  }

  // Funcion que va a obtener los operarios de la peletizadora
  obtenerOperarios(){
    this.usuariosService.srvObtenerListaUsuario().subscribe(datos_usuarios => {
      for (let i = 0; i < datos_usuarios.length; i++) {
        if (datos_usuarios[i].rolUsu_Id == 3) this.operarios.push(datos_usuarios[i]);
      }
    });
  }

  // Funcion que va a obtener las diferenes materias primas
  obtenerMateriaPrima(){
    this.materiaPrimaService.srvObtenerLista().subscribe(datos_materiaPrima => {
      for (let i = 0; i < datos_materiaPrima.length; i++) {
        if (datos_materiaPrima[i].catMP_Id == 10) this.materiasPrimas.push(datos_materiaPrima[i]);
      }
    });
  }

  // Funcion que nos permitirá filtrar la materia prima
  buscarMateriaPrima(){
    let idMp : number = this.formReporteRMP.value.MateriaPrima;
    this.idMateriaPrima = idMp;
    this.materiaPrimaService.srvObtenerListaPorId(idMp).subscribe(datos_materiaPrima => {
      this.formReporteRMP = this.frmBuilder.group({
        FechaInicial: this.formReporteRMP.value.FechaInicial,
        FechaFinal : this.formReporteRMP.value.FechaFinal,
        MateriaPrima : datos_materiaPrima.matPri_Nombre,
        Turno : this.formReporteRMP.value.Turno,
        Operario : this.formReporteRMP.value.Operario,
      });
    });
  }

  //Funcion que va buscar y colocar el nombre de los operarios
  buscarOperarios(){
    let idOperario : number = this.formReporteRMP.value.Operario;
    this.idOperario = idOperario;
    this.usuariosService.srvObtenerListaPorId(idOperario).subscribe(datos_usuario => {
      this.formReporteRMP = this.frmBuilder.group({
        FechaInicial: this.formReporteRMP.value.FechaInicial,
        FechaFinal : this.formReporteRMP.value.FechaFinal,
        MateriaPrima : this.formReporteRMP.value.MateriaPrima,
        Turno : this.formReporteRMP.value.Turno,
        Operario : datos_usuario.usua_Nombre,
      });
    });
  }

  //funcion que se encargará de Limpiar Campos
  limpiarCampos(){
    this.formReporteRMP.reset();
    this.registros = [];
    this.columnas = [];
    this.idMateriaPrima = null;
    this.idOperario = null;
  }

  // Funcion que va a Consultar segun los filtros que le pasemos
  consultar(){
    let fechaInicial : any = this.formReporteRMP.value.FechaFinal;
    let fechaFinal : any = this.formReporteRMP.value.FechaFinal;
    let materiaPrima : any = this.idMateriaPrima;
    let turno : any = this.formReporteRMP.value.Turno;
    let operario : any = this.idOperario;

    this.recuperadoService.consultaRecuperado(fechaInicial, fechaFinal, operario, turno, materiaPrima).subscribe(datos_recuperado => {
      if (datos_recuperado.length <= 0) Swal.fire(`No se encontraron registros para los filtros consultados`);
      for (let i = 0; i < datos_recuperado.length; i++) {

      }
    });
  }

  // Funcion que se encargará de llenar la informacio que se mostrará en la tabla
  llenarArray(usua : any, fecha : any, mp : any, cant : any, undMed : any){
    let info : any = {
      usua_Nombre : usua,
      fecha : fecha.replace('T00:00:00', ''),
      matPrima : mp,
      cant : cant,
      undMed : undMed,
    }
    this.registros.push(info);
    this.registros.sort((a,b) => a.fecha.localeCompare(b.fecha));
  }
}
