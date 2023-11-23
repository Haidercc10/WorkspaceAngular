import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { modelProduccionProcesos } from 'src/app/Modelo/modelProduccionProcesos';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { ConosService } from 'src/app/Servicios/Conos/conos.service';
import { CreacionPdfService, modelTagProduction } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { Produccion_ProcesosService } from 'src/app/Servicios/Produccion_Procesos/Produccion_Procesos.service';
import { ProductoService } from 'src/app/Servicios/Productos/producto.service';
import { SedeClienteService } from 'src/app/Servicios/SedeCliente/sede-cliente.service';
import { TurnosService } from 'src/app/Servicios/Turnos/Turnos.service';
import { UnidadMedidaService } from 'src/app/Servicios/UnidadMedida/unidad-medida.service';
import { UsuarioService } from 'src/app/Servicios/Usuarios/usuario.service';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-prueba-imagen-cat-insumo',
  templateUrl: './prueba-imagen-cat-insumo.component.html',
  styleUrls: ['./prueba-imagen-cat-insumo.component.css']
})

export class PruebaImagenCatInsumoComponent implements OnInit {

  cargando : boolean = false;
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol
  modoSeleccionado : boolean = false;
  validarRol : number;
  formDatosProduccion !: FormGroup;
  turnos : any [] = [];
  unidadesMedida : any [] = [];
  operarios : any [] = [];
  conos : any [] = [];
  proceso : string = `Extrusión`;
  rollosPesados : any [] = [];
  datosOrdenTrabajo : any [] = [];

  constructor(private frmBuilder : FormBuilder,
    private appComponent : AppComponent,
    private turnosService : TurnosService,
    private operariosService : UsuarioService,
    private unidadMedidaService : UnidadMedidaService,
    private conosService : ConosService,
    private productoService : ProductoService,
    private bagproService : BagproService,
    private msj : MensajesAplicacionService,
    private produccionProcesosService : Produccion_ProcesosService,
    private createPDFService : CreacionPdfService,
    private clientsService : SedeClienteService,){

    this.modoSeleccionado = this.appComponent.temaSeleccionado;
    this.formDatosProduccion = this.frmBuilder.group({
      ordenTrabajo : [null, Validators.required],
      idCliente : [null, Validators.required],
      cliente : [null, Validators.required],
      item : [null, Validators.required],
      referencia : [null, Validators.required],
      turno : [null, Validators.required],
      ancho1 : [null, Validators.required],
      ancho2 : [null, Validators.required],
      ancho3 : [null, Validators.required],
      undExtrusion : [null, Validators.required],
      pesoExtruir : [null, Validators.required],
      calibre : [null, Validators.required],
      material : [null, Validators.required],
      maquina : [null, Validators.required],
      operario : [null, Validators.required],
      cono : [null, Validators.required],
      anchoCono: [null, Validators.required],
      pesoTara : [null, Validators.required],
      pesoBruto : [null, Validators.required],
      pesoNeto : [null, Validators.required],
      daipita : [null],
    });
  }

  ngOnInit(){
    this.lecturaStorage();
    this.obtenerTurnos();
    this.obtenerUnidadMedida();
    this.obtenerOperarios();
    this.obtenerConos();
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.appComponent.storage_Id;
    this.ValidarRol = this.appComponent.storage_Rol;
  }

  validarProceso(){

  }

  async buscarPuertos(){
    const port = await navigator.serial.requestPort();
    await port.open({ baudRate: 9600 });
    while (port.readable) {
      const reader = port.readable.getReader();
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            reader.releaseLock();
            break;
          }
          if (value) {
            let valor = this.ab2str(value);
            valor = valor.replace(/[^\d.-]/g, '');
            this.formDatosProduccion.patchValue({
              pesoBruto : valor,
              pesoNeto : valor - this.formDatosProduccion.value.pesoTara,
            });
          }
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  ab2str = (buf) => String.fromCharCode.apply(null, new Uint8Array(buf));

  eliminarDiacriticos = (texto) => texto.normalize('NFD').replace(/[\u0300-\u036f]/g,"");

  limpiarCampos(){
    this.cargando = false;
    this.formDatosProduccion.reset();
    this.obtenerTurnos();
  }

  obtenerTurnos() {
    let proceso : string = this.eliminarDiacriticos(this.proceso).toUpperCase();
    this.turnosService.srvObtenerLista().subscribe(data => this.turnos = data.map(x => x.turno_Id));
    this.bagproService.GetHorarioProceso(proceso).subscribe(turno => {
      this.formDatosProduccion.patchValue({turno : turno.toString()});
    });
  }

  obtenerUnidadMedida() {
    this.unidadMedidaService.srvObtenerLista().subscribe(data => this.unidadesMedida = data.map(x => x.undMed_Id).filter(x => ['Cms', 'Plgs'].includes(x)));
  }

  obtenerOperarios() {
    this.operariosService.GetOperariosProduccion().subscribe(data => {
      this.operarios = data;
      this.operarios.sort((a,b) => a.usua_Nombre.localeCompare(b.usua_Nombre));
    });
  }

  obtenerConos() {
    this.conosService.GetConos().subscribe(data => {
      this.conos = data
      this.conos.sort((a,b) => b.cono_Id.localeCompare(a.cono_Id));
    });
  }

  buscarDatosConoSeleccionado(){
    let cono = this.formDatosProduccion.get('cono').value;
    let datosCono = this.conos.find(x => x.cono_Id == cono);
    let ancho : number = datosCono.cono_KgXCmsAncho;
    this.formDatosProduccion.patchValue({
      anchoCono : ancho,
      pesoTara : this.validarTaraCono()
    });
  }

  validarAnchoCono(){
    let ancho : number = 0;
    let ancho1 = this.formDatosProduccion.get('ancho1').value;
    let proceso = this.proceso;
    if (['Empaque', 'Corte', 'Rebobinar'].includes(proceso)) ancho = this.consultarDatosProducto();
    else if (['Doblado'].includes(proceso)){
      if (ancho1 == 0) ancho1 = this.consultarDatosProducto();
      ancho = ancho1 / 2;
    } else {
      if (ancho1 == 0) ancho1 = this.consultarDatosProducto();
      ancho = ancho1;
    }
    this.formDatosProduccion.patchValue({ancho1 : ancho1});
    return ancho;
  }

  consultarDatosProducto(){
    let item = this.formDatosProduccion.get('item').value;
    let datosItem;
    this.productoService.srvObtenerListaPorId(item).subscribe(data => datosItem = data);
    return datosItem.prod_Ancho;
  }

  validarTaraCono() : number{
    let tara : number = 0;
    let ancho = this.validarAnchoCono();
    let anchoCono = this.formDatosProduccion.get('anchoCono').value;
    let undExtrusion = this.formDatosProduccion.get('undExtrusion').value;
    let ancho1 = this.formDatosProduccion.get('ancho1').value;
    if (ancho1 && anchoCono){
      if (undExtrusion == 'Plgs') tara = ancho * 2.54 * anchoCono;
      else tara = ancho * anchoCono;
    }
    return tara;
  }

  buscraOrdenTrabajo(){
    let ordenTrabajo = this.formDatosProduccion.get('ordenTrabajo').value;
    this.cargando = true;
    this.bagproService.GetOrdenDeTrabajo(ordenTrabajo).subscribe(data => {
      this.datosOrdenTrabajo = data;
      this.datosOrdenTrabajo[0].turno = this.formDatosProduccion.value.turno;
      this.buscarRollosPesados();
      data.forEach(datos => {
        this.clientsService.GetSedeClientexNitBagPro(datos.nitCliente).subscribe(dataClient => {
          dataClient.forEach(cli => {
            this.datosOrdenTrabajo[0].idCliente = cli.idCliente;
            this.formDatosProduccion.patchValue({
              idCliente : cli.idCliente,
              cliente : datos.cliente,
              item : datos.id_Producto,
              referencia : datos.producto,
              pesoExtruir : datos.peso_Neto,
              ancho1 : this.proceso != 'Empaque' ? datos.ancho1_Extrusion : datos.selladoCorte_Ancho,
              ancho2 : this.proceso != 'Empaque' ? datos.ancho2_Extrusion : datos.selladoCorte_Largo,
              ancho3 : this.proceso != 'Empaque' ? datos.ancho3_Extrusion : datos.selladoCorte_Fuelle,
              undExtrusion : datos.und_Extrusion.trim(),
              calibre : datos.calibre_Extrusion,
              material : datos.material.trim(),
            });
          });
        });
      });
    }, () => this.cargando = false, () => this.cargando = false);
  }

  buscarRollosPesados(){
    this.rollosPesados = [];
    let proceso : string = this.eliminarDiacriticos(this.proceso).toUpperCase();
    let ordenTrabajo : string = this.formDatosProduccion.value.ordenTrabajo;
    this.bagproService.GetDatosRollosPesados(ordenTrabajo, proceso).subscribe(data => this.rollosPesados = data, () => this.cargando = false, () => this.cargando = false);
  }

  sumarPesoBruto(){
    let total : number = 0;
    total = this.rollosPesados.reduce((a,b) => a + b.extBruto, 0);
    return total;
  }

  sumarPesoNeto(){
    let total : number = 0;
    total = this.rollosPesados.reduce((a,b) => a + b.extnetokg, 0);
    return total;
  }

  validarDatos(){
    if (this.datosOrdenTrabajo.length > 0) {
      if (this.formDatosProduccion.valid) {
        if (this.formDatosProduccion.value.maquina > 0) {
          if (this.formDatosProduccion.value.pesoNeto > 0) this.guardarProduccion();
          else this.msj.mensajeAdvertencia(`¡El peso Neto debe ser superior a cero (0)!`);
        } else this.msj.mensajeAdvertencia(`¡La maquina no puede ser cero (0)!`);
      } else this.msj.mensajeAdvertencia(`¡Todos los campos deben estar diligenciados!`);
    } else this.msj.mensajeAdvertencia(`¡Debe buscar la Orden de Trabajo a la que se le añadirá el rollo pesado!`);
  }

  guardarProduccion(){
    this.cargando = true;
    let datos : modelProduccionProcesos = {
      Numero_Rollo: 0,
      Prod_Id: parseInt(this.formDatosProduccion.value.item),
      Cli_Id: parseInt(this.formDatosProduccion.value.idCliente),
      Operario1_Id: this.formDatosProduccion.value.operario,
      Operario2_Id: null,
      Operario3_Id: null,
      Operario4_Id: null,
      Pesado_Entre: 1,
      Maquina: this.formDatosProduccion.value.maquina,
      Cono_Id: this.formDatosProduccion.value.cono,
      Ancho_Cono: this.formDatosProduccion.value.anchoCono,
      Tara_Cono: this.formDatosProduccion.value.pesoTara,
      Peso_Bruto: this.formDatosProduccion.value.pesoBruto,
      Peso_Neto: this.formDatosProduccion.value.pesoNeto,
      Cantidad: 0,
      Peso_Teorico: 0,
      Desviacion: 0,
      Precio: 0,
      Presentacion: 'Kg',
      Proceso_Id: this.validateProcess(),
      Turno_Id: this.formDatosProduccion.value.turno,
      Envio_Zeus: false,
      Datos_Etiqueta: '',
      Fecha: moment().format('YYYY-MM-DD'),
      Hora: moment().format('HH:mm:ss'),
      Creador_Id : this.storage_Id,
    }
    this.produccionProcesosService.Post(datos).subscribe(res => {
      this.createTagProduction(res.numero_Rollo, res.peso_Neto);
      this.limpiarCampos();
      this.msj.mensajeConfirmacion(`¡Rollo almacenado!`);
    }, () => {
      this.msj.mensajeError(`¡Ocurrió un error al registrar el rollo!`);
      this.cargando = false;
    });
  }

  validateProcess() : 'EXT' | 'IMP' | 'ROT' | 'LAM' | 'DBLD' | 'CORTE' | 'EMP' | 'SELLA' | 'WIKE' {
    let proceso = this.eliminarDiacriticos(this.proceso).toUpperCase();
    switch (proceso) {
      case 'EXTRUSION':
        proceso = 'EXT'
        break;
      case 'IMPRESION':
        proceso = 'IMP'
        break;
      case 'ROTOGRABADO':
        proceso = 'ROT'
        break;
      case 'LAMINADO':
        proceso = 'LAM'
        break;
      case 'DOBLADO':
        proceso = 'DBLD'
        break;
      case 'CORTE':
        proceso = 'CORTE'
        break;
      case 'EMPAQUE':
        proceso = 'EMP'
        break;
      case 'SELLADO':
        proceso = 'SELLA'
        break;
      case 'WIKETIADO':
        proceso = 'WIKE'
        break;
      default:
        break;
    }
    return proceso;
  }

  createTagProduction(code : number, quantity : number){
    let proceso = this.eliminarDiacriticos(this.proceso).toUpperCase();
    let dataTagProduction : modelTagProduction = {
      client: this.formDatosProduccion.value.cliente,
      item: this.formDatosProduccion.value.item,
      reference: this.formDatosProduccion.value.referencia,
      width: this.formDatosProduccion.value.ancho1,
      height: this.formDatosProduccion.value.ancho3,
      bellows: this.formDatosProduccion.value.ancho2,
      und: this.formDatosProduccion.value.undExtrusion,
      cal: this.formDatosProduccion.value.calibre,
      orderProduction: this.formDatosProduccion.value.ordenTrabajo,
      material: this.formDatosProduccion.value.material,
      quantity: quantity,
      reel: code,
      presentationItem1: ['SELLADO', 'WIKETIADO'].includes(proceso) ? 'Kg Bruto' : 'Und',
      presentationItem2: ['SELLADO', 'WIKETIADO'].includes(proceso) ? 'Kg Neto' : 'Kg',
      productionProcess: proceso,
      showNameBussiness: true,
    }
    this.createPDFService.createTagProduction(dataTagProduction);
  }

}