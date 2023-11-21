import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { ConosService } from 'src/app/Servicios/Conos/conos.service';
import { ProductoService } from 'src/app/Servicios/Productos/producto.service';
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
  modoSeleccionado : boolean = false;
  validarRol : number;
  formDatosProduccion !: FormGroup;
  turnos : any [] = [];
  unidadesMedida : any [] = [];
  operarios : any [] = [];
  conos : any [] = [];
  proceso : string = ``;
  rollosPesados : any [] = [];

  constructor(private frmBuilder : FormBuilder,
    private appComponet : AppComponent,
    private turnosService : TurnosService,
    private operariosService : UsuarioService,
    private unidadMedidaService : UnidadMedidaService,
    private conosService : ConosService,
    private productoService : ProductoService,
    private bagproService : BagproService,){

    this.modoSeleccionado = this.appComponet.temaSeleccionado;
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
      kilosPesados : [null, Validators.required],
      calibre : [null, Validators.required],
      material : [null, Validators.required],
      maquina : [null, Validators.required],
      operario : [null, Validators.required],
      cono : [null, Validators.required],
      anchoCono: [null, Validators.required],
      pesoTara : [null, Validators.required],
      pesoBruto : [null, Validators.required],
      pesoNeto : [null, Validators.required],
      daipita : [null, Validators.required],
    });
  }

   ngOnInit(){
    this.obtenerTurnos();
    this.obtenerUnidadMedida();
    this.obtenerOperarios();
    this.obtenerConos();
    setTimeout(() => { this.prueba(); }, 2000);
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
            this.formDatosProduccion.patchValue({pesoBruto : valor});
          }
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
  }

  limpiarCampos(){
    this.cargando = false;
    this.formDatosProduccion.reset();
  }

  obtenerTurnos() {
    this.turnosService.srvObtenerLista().subscribe(data => this.turnos = data.map(x => x.turno_Id));
  }

  obtenerUnidadMedida() {
    this.unidadMedidaService.srvObtenerLista().subscribe(data => this.unidadesMedida = data.map(x => x.undMed_Id).filter(x => ['Cms', 'Plgs'].includes(x)));
  }

  obtenerOperarios() {
    this.operariosService.GetOperariosProduccion().subscribe(data => this.operarios = data);
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
    this.bagproService.srvObtenerListaClienteOT_Item(ordenTrabajo).subscribe(data => {
      data.forEach(datos => {
        this.formDatosProduccion.patchValue({
          idCliente : datos.cliente,
          cliente : datos.clienteNom,
          item : datos.clienteItems,
          referencia : datos.clienteItemsNom,
          pesoExtruir : datos.datoscantKg,
          ancho1 : datos.extAcho1,
          ancho2 : datos.extAcho2,
          ancho3 : datos.extAcho3,
          undExtrusion : datos.extUnidadesNom.trim(),
          calibre : datos.extCalibre,
          material : datos.extMaterialNom.trim(),
        });
      });
    });
  }

  buscarRollosPesados(){
    this.rollosPesados = [];
  }

  sumarTotalKilosPesados(){

  }

  prueba() {
    this.bagproService.Prueba();
  }
}