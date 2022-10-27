import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import moment from 'moment';
import { MateriaPrimaService } from 'src/app/Servicios/materiaPrima.service';
import { RecuperadoMPService } from 'src/app/Servicios/recuperadoMP.service';
import { TurnosService } from 'src/app/Servicios/Turnos.service';
import { UsuarioService } from 'src/app/Servicios/usuario.service';
import Swal from 'sweetalert2';
import { Modal_RptRecuperadoMPComponent } from 'src/app/Vistas/Modal_RptRecuperadoMP/Modal_RptRecuperadoMP.component';


@Component({
  selector: 'app-Reporte_RecuperadoMP',
  templateUrl: './Reporte_RecuperadoMP.component.html',
  styleUrls: ['./Reporte_RecuperadoMP.component.css']
})
export class Reporte_RecuperadoMPComponent implements OnInit {
  @ViewChild(Modal_RptRecuperadoMPComponent) modalRecuperado : Modal_RptRecuperadoMPComponent;

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
  consultaTurno : string = '';
  modalInfoRecuperado : boolean = false;

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
      { header: 'Id Materia Prima', field: 'idMatPrima'},
      { header: 'Materia Prima', field: 'matPrima'},
      { header: 'Cantidad', field: 'cant'},
      { header: 'Presentación', field: 'undMed'},
    ];
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = '$1,';
    return number.toString().replace(exp,rep);
  }

  // Funcion que va a obtener los diferentes turnos y los almacenará en una variable
  obtenerTurnos(){
    this.turnosService.srvObtenerLista().subscribe(datos_turnos => {
      for (let i = 0; i < datos_turnos.length; i++) {
        if (datos_turnos[i].turno_Id != 'NE') this.turnos.push(datos_turnos[i]);
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
    this.consultaTurno = ''
  }

  // Funcion que va a Consultar segun los filtros que le pasemos
  consultar(){
    this.registros = [];
    let fechaInicial : any = this.formReporteRMP.value.FechaInicial;
    let fechaFinal : any = this.formReporteRMP.value.FechaFinal;
    let materiaPrima : any = this.idMateriaPrima;
    let turno : any = this.formReporteRMP.value.Turno;
    let operario : any = this.idOperario;
    if (materiaPrima == null) materiaPrima = 0;
    if (operario == null) operario = 0;
    if (turno == null) turno = 'NE';
    if (fechaInicial != null && fechaFinal == null) fechaFinal = fechaInicial;
    if (fechaInicial == null) fechaInicial = moment().format('YYYY-MM-DD');
    if (fechaFinal == null) fechaFinal = moment().format('YYYY-MM-DD');

    this.recuperadoService.consultaRecuperado(fechaInicial, fechaFinal, operario, turno, materiaPrima).subscribe(datos_recuperado => {
      if (datos_recuperado.length <= 0) Swal.fire(`No se encontraron registros para los filtros consultados`);
      for (let i = 0; i < datos_recuperado.length; i++) {
        let dia : number = 0;
        let noche : number = 0;
        if (datos_recuperado[i].sumaDia.length != 0) {
          for (let j = 0; j < datos_recuperado[i].sumaDia.length; j++) {
            dia = datos_recuperado[i].sumaDia[j].suma;
          }
        }

        if (datos_recuperado[i].sumaNoche.length != 0) {
          for (let j = 0; j < datos_recuperado[i].sumaNoche.length; j++) {
            noche = datos_recuperado[i].sumaNoche[j].suma;
          }
        }
        this.llenarArray(
          datos_recuperado[i].matPri_Id,
          datos_recuperado[i].matPri_Nombre,
          datos_recuperado[i].sumaCantidad,
          dia,
          noche,
          datos_recuperado[i].undMed_Id,
          datos_recuperado[i].turno_Id
        );
      }
    });
  }

  // Funcion que se encargará de llenar la informacio que se mostrará en la tabla
  llenarArray(id : any, mp : any, cant : any, dia : any, noche : any, undMed : any, turno : any){
    let info : any = {
      idMatPrima : id,
      matPrima : mp,
      cant : this.formatonumeros(cant),
      cantDia : dia,
      cantNoche : noche,
      undMed : undMed,
      turno : turno,
    }
    this.columnas = [
      { header: 'Id Materia Prima', field: 'idMatPrima'},
      { header: 'Materia Prima', field: 'matPrima'},
      { header: 'Cantidad', field: 'cant'},
      { header: 'Presentación', field: 'undMed'},
    ];
    this.registros.push(info);
    this.registros.sort((a,b) => a.matPrima.localeCompare(b.matPrima));
  }

  //
  validarModal(item : any, turno : any){
    this.modalInfoRecuperado = false;
    // this.modalRecuperado.arrayRegistros = [];
    if (turno == 'DIA' && item.cantDia > 0) this.consultarPeletizadoDia(item);
    if (turno == 'NOCHE' && item.cantNoche > 0) this.consultarPeletizadoNoche(item);
  }

  //
  limpiarModal(){
    this.modalInfoRecuperado = false;
    this.modalRecuperado.arrayRegistros = [];
  }

  //
  consultarPeletizadoDia(item : any){
    if (item.cantDia > 0) {
      this.modalInfoRecuperado = true;
      this.modalRecuperado.arrayRegistros = [];
      this.consultaTurno = 'Día';
      let fechaInicial : any = this.formReporteRMP.value.FechaInicial;
      let fechaFinal : any = this.formReporteRMP.value.FechaFinal;
      if (fechaInicial != null && fechaFinal == null) fechaFinal = fechaInicial;
      if (fechaInicial == null) fechaInicial = moment().format('YYYY-MM-DD');
      if (fechaFinal == null) fechaFinal = moment().format('YYYY-MM-DD');
      this.recuperadoService.consultaRecuperadoModal(fechaInicial, fechaFinal, "DIA", item.idMatPrima).subscribe(datos_recuperado => {
        for (let i = 0; i < datos_recuperado.length; i++) {
          let info = {
            id : datos_recuperado[i].matPri_Id,
            nombreMp : datos_recuperado[i].matPri_Nombre,
            cantidad : datos_recuperado[i].recMatPri_Cantidad,
            undMed : datos_recuperado[i].undMed_Id,
            fecha : datos_recuperado[i].recMp_FechaEntrega.replace('T00:00:00', ''),
            operario : datos_recuperado[i].usua_Nombre,
          }
          this.modalRecuperado.arrayRegistros.push(info);
        }
      });
    } else if (item.cantDia <= 0) this.modalInfoRecuperado = false;
  }

  //
  consultarPeletizadoNoche(item : any){
    this.modalInfoRecuperado = false;
    console.log(item)
    if (item.cantNoche > 0) {
      this.modalInfoRecuperado = true;
      this.modalRecuperado.arrayRegistros = [];
      this.consultaTurno = 'Noche';
      let fechaInicial : any = this.formReporteRMP.value.FechaInicial;
      let fechaFinal : any = this.formReporteRMP.value.FechaFinal;
      if (fechaInicial != null && fechaFinal == null) fechaFinal = fechaInicial;
      if (fechaInicial == null) fechaInicial = moment().format('YYYY-MM-DD');
      if (fechaFinal == null) fechaFinal = moment().format('YYYY-MM-DD');
      this.recuperadoService.consultaRecuperadoModal(fechaInicial, fechaFinal, "NOCHE", item.idMatPrima).subscribe(datos_recuperado => {
        for (let i = 0; i < datos_recuperado.length; i++) {
          let info = {
            id : datos_recuperado[i].matPri_Id,
            nombreMp : datos_recuperado[i].matPri_Nombre,
            cantidad : datos_recuperado[i].recMatPri_Cantidad,
            undMed : datos_recuperado[i].undMed_Id,
            fecha : datos_recuperado[i].recMp_FechaEntrega.replace('T00:00:00', ''),
            operario : datos_recuperado[i].usua_Nombre,
          }
          this.modalRecuperado.arrayRegistros.push(info);
        }
      });
    } else if (item.cantNoche <= 0) this.modalInfoRecuperado = false;
  }
}
