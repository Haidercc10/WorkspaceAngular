import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { Certificados_CalidadService } from 'src/app/Servicios/Certificados_Calidad/Certificados_Calidad.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { UnidadMedidaService } from 'src/app/Servicios/UnidadMedida/unidad-medida.service';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-prueba-imagen-cat-insumo',
  templateUrl: './prueba-imagen-cat-insumo.component.html',
  styleUrls: ['./prueba-imagen-cat-insumo.component.css']
})

export class PruebaImagenCatInsumoComponent implements OnInit {

  cargando : boolean = false;
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro

  FormOrden !: FormGroup; //Variable que almacenará la información del formulario donde esta la información general de la orden de trabajo
  unidadesMedidas : any [] = []; //Variable que almacenará la información de las unidades de medida
  parametrosCuantitativos : any [] = []; //Variable que almacenará la información de los parametros cuantitativos de la orden de trabajo
  paramertosCualitativos : any [] = []; //Variable que almacenará la información de los parametros cualitativos de la orden de trabajo

  constructor(private frmBuilder : FormBuilder,
                private AppComponent : AppComponent,
                  private msj : MensajesAplicacionService,
                    private certCalidadService : Certificados_CalidadService,
                      private undMedService : UnidadMedidaService,
                        private bagproService : BagproService,){

    this.FormOrden = this.frmBuilder.group({
      Orden : [null, Validators.required],
      Cliente : [null, Validators.required],
      Referencia : [null, Validators.required],
      Cantidad : [null, Validators.required],
      Presentacion : [null, Validators.required],
      Observacion : [null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.lecturaStorage();
    this.obtenerUnidadesMedidas();
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

  // Función que va a buscar las posibles presentaciones que tiene un producto
  obtenerUnidadesMedidas = () => this.undMedService.srvObtenerLista().subscribe(data => this.unidadesMedidas = data);

  // Funcion que va a limpiar todo 
  limpiarTodo() {
    this.FormOrden.reset();
    this.parametrosCuantitativos = [];
    this.paramertosCualitativos = [];
  }
  
  // Funcion que va a consultar la información de la orden de trabajo
  consultarOrdenTrabajo(){
    this.paramertosCualitativos = [];
    this.parametrosCuantitativos = [];
    let orden : number = this.FormOrden.value.Orden;
    this.bagproService.srvObtenerListaClienteOT_Item(orden).subscribe(data => {
      data.forEach(ot => {
        this.cargando = true;
        let presentacion : string;

        if (ot.ptPresentacionNom == 'Unidad') presentacion = 'Und';
        else if (ot.ptPresentacionNom == 'Paquete') presentacion = 'Paquete';
        else if (ot.ptPresentacionNom == 'Kilo') presentacion = 'Kg';
        else if (ot.ptPresentacionNom == 'Rollo') presentacion = 'Rollo';

        this.FormOrden.patchValue({
          Cliente : ot.clienteNom,
          Referencia : ot.clienteItemsNom,
          Cantidad : ot.ptPresentacionNom == 'Kilo' ? ot.datosotKg : ot.datoscantBolsa,
          Presentacion : presentacion,
          Observacion : ot.observacion,
        });

        this.calcularParametrosCuantitativos(ot);
        this.llenarParametrosCualitativos(ot);

        this.cargando = false;
      });
    }, () => this.msj.mensajeAdvertencia(`¡No se encontró información de la OT ${orden}!`, ``));
  }

  // Funcion que va a calcular los datos del parametro cuantitativo
  calcularParametrosCuantitativos(orden : any){
    this.parametrosCuantitativos.push(
      {
        Nombre : `Calibre`,
        UndMedida : orden.extUnidadesNom.trim(),
        Nominal : orden.extCalibre,
        Toletancia : 10,
        Minimo : function () {
          return this.Nominal - ((this.Nominal * this.Toletancia) / 100);
        },
        Maximo : function () {
          return this.Nominal + ((this.Nominal * this.Toletancia) / 100);
        },
      },
      {
        Nombre : `Ancho Frente`,
        UndMedida : ``.trim(),
        Nominal : orden.ptAnchopt,
        Toletancia : ``,
        Minimo : ``,
        Maximo : ``,
      },
      {
        Nombre : `Ancho Fuelle`,
        UndMedida : ``.trim(),
        Nominal : orden.ptFuelle,
        Toletancia : ``,
        Minimo : ``,
        Maximo : ``,
      },
      {
        Nombre : `Largo / Repetición`,
        UndMedida : ``.trim(),
        Nominal : orden.ptLargopt,
        Toletancia : ``,
        Minimo : ``,
        Maximo : ``,
      },
      {
        Nombre : `COF`,
        UndMedida : ``.trim(),
        Nominal : ``,
        Toletancia : ``,
        Minimo : ``,
        Maximo : ``,
      },
    );
  }

  // Funcion que va a llenar los paramatros cualitativos de la orden de trabajo
  llenarParametrosCualitativos(orden : any){
    this.paramertosCualitativos.push(
      {
        Nombre : `Material`,
        Resulatado : ``,
      },
      {
        Nombre : `Resistencia`,
        Resulatado : ``,
      },
      {
        Nombre : `Sellabilidad`,
        Resulatado : ``,
      },
      {
        Nombre : `Transparencia`,
        Resulatado : ``,
      },
      {
        Nombre : `Tratado`,
        Resulatado : ``,
      },
      {
        Nombre : `Impresión`,
        Resulatado : orden.impresion.trim() == '1' ? 'Si' : 'No',
      },
    );
  }

  // Funcion que va a enviar de los certificados a la base de datos
  guardarCertificados(){

  }

  // Funcion que va a crear el pdf con la información del certificado 
  crearPdfCertificado(){
    
  }
}

