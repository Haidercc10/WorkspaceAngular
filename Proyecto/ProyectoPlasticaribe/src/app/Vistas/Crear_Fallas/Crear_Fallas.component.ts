import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { finalize } from 'rxjs';
import { FallasTecnicasService } from 'src/app/Servicios/FallasTecnicas/FallasTecnicas.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { TpFallasTecnicasService } from 'src/app/Servicios/TipoFallasTecnicas/TpFallasTecnicas.service';
import { AppComponent } from 'src/app/app.component';
import { alCambiarTema } from 'src/app/Servicios/Tema/Tema.service';

/*
 * Modal reutilizable para crear fallas técnicas. La vista que lo contiene:
 *  - indica con [tiposPermitidos] qué tipos de falla se pueden crear desde ella (vacío = todos). Si es uno solo, queda seleccionado.
 *  - recibe la falla creada con (creada) para cerrar su modal, recargar su lista y, si quiere, seleccionarla.
 */
@Component({
  selector: 'app-Crear_Fallas',
  templateUrl: './Crear_Fallas.component.html',
  styleUrls: ['./Crear_Fallas.component.css']
})
export class Crear_FallasComponent implements OnInit {

  /** Tipos de falla que se pueden crear desde la vista que contiene el modal. Vacío = todos. */
  @Input() tiposPermitidos : number[] = [];

  /** Falla recién creada (con su falla_Id), para que la vista cierre el modal y recargue su lista. */
  @Output() creada = new EventEmitter<any>();

  form !: FormGroup; //Variable que se usará para validar el formulario
  load : boolean = false;
  typeFails : any[] = [];
  selectedMode : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  private readonly suscripcionTema = alCambiarTema(oscuro => this.selectedMode = oscuro); // mantiene selectedMode al día con el tema

  constructor(private frmBuild : FormBuilder,
    private AppComponent : AppComponent,
    private svMsjs : MensajesAplicacionService,
    private svTypeFails : TpFallasTecnicasService,
    private svTechnicalFails : FallasTecnicasService,
  ) {
      this.selectedMode = this.AppComponent.temaSeleccionado;
      this.loadForm();
  }

  ngOnInit() {
    this.getTypeFails();
  }

  /** Hay un solo tipo posible: se selecciona solo y no se puede cambiar. */
  get tipoFijo() : boolean {
    return this.typeFails.length == 1;
  }

  //Función para cargar formulario
  loadForm(){
    this.form = this.frmBuild.group({
      fail : [null, Validators.required],
      description : [null, Validators.required],
      typeFail : [null, Validators.required],
    });
  }

  //Función para obtener los tipos de fallas, solo los permitidos por la vista.
  getTypeFails() {
    this.svTypeFails.GetTodo().subscribe({
      next: (data : any[]) => {
        this.typeFails = data
          .filter(x => this.tiposPermitidos.length == 0 || this.tiposPermitidos.includes(Number(x.tipoFalla_Id)))
          .sort((a, b) => Number(b.tipoFalla_Id) - Number(a.tipoFalla_Id));
        this.selectFixedType();
      },
      error: error => this.svMsjs.errorDetallado(error, 'No se pudieron consultar los tipos de falla.', { operacion: 'Consultar tipos de falla', metodo: 'GET' }),
    });
  }

  //Si solo hay un tipo posible, lo deja seleccionado.
  private selectFixedType() {
    if (this.tipoFijo) this.form.patchValue({ typeFail: this.typeFails[0].tipoFalla_Id });
  }

  //Función para crear fallas tecnicas
  createFail(){
    if (this.load) return;
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      this.svMsjs.mensajeAdvertencia(`Advertencia`, `Debe diligenciar todos los campos!`);
      return;
    }

    this.load = true;
    let fail : fails = {
      Falla_Id : 0,
      Falla_Nombre: this.form.value.fail,
      Falla_Descripcion: this.form.value.description,
      TipoFalla_Id: this.form.value.typeFail,
      Fecha_Creacion: moment().format('YYYY-MM-DD'),
      Hora_Creacion: moment().format('HH:mm:ss'),
    }
    this.svTechnicalFails.Post(fail).pipe(finalize(() => this.load = false)).subscribe({
      next: data => {
        this.svMsjs.mensajeConfirmacion('OK!', 'Falla creada correctamente!');
        this.clearLabels();
        this.creada.emit(data);
      },
      error: error => this.svMsjs.errorDetallado(error, 'No se pudo crear la falla.', { operacion: 'Crear falla técnica', metodo: 'POST' }),
    });
  }

  //Limpia el formulario y deja el tipo seleccionado si es el único posible.
  clearLabels() {
    this.form.reset();
    this.selectFixedType();
  }

  //Función para cargar la información del nombre en la descripción
  loadDescription(){
    let fail : any = this.form.value.fail;
    this.form.patchValue({ 'description' : fail, });
  }

}

export interface fails {
  Falla_Id? : number;
  Falla_Nombre : string;
  Falla_Descripcion : string;
  TipoFalla_Id : number;
  Fecha_Creacion : any;
  Hora_Creacion : string;
}
