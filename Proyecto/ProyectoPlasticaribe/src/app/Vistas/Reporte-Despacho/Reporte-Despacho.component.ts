import { ThisReceiver } from '@angular/compiler';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { DetallesEntradaRollosService } from 'src/app/Servicios/DetallesEntradaRollos.service';
import { EntradaRollosService } from 'src/app/Servicios/EntradaRollos.service';
import { EstadosService } from 'src/app/Servicios/estados.service';
import { ProductoService } from 'src/app/Servicios/producto.service';
import { RolesService } from 'src/app/Servicios/roles.service';
import { TipoDocumentoService } from 'src/app/Servicios/tipoDocumento.service';

@Component({
  selector: 'app-Reporte-Despacho',
  templateUrl: './Reporte-Despacho.component.html',
  styleUrls: ['./Reporte-Despacho.component.css']
})
export class ReporteDespachoComponent implements OnInit {

  public FormConsultarFiltros !: FormGroup;
  public arrayProducto = [];
  public arrayRollo = [];
  public arrayEstadoRollo = [];
  public arrayTipoDoc = [];
  cargando : boolean = true; //Variable para validar que salga o no la imagen de carga
  today : any = new Date(); //Variable que se usará para llenar la fecha actual
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  checked : boolean = false; //Variable para saber si el checkbox está seleccionado o no
  keywordProductos = 'prod_Nombre' /** Palabra clave de input productos*/
  validarInputNombresProductos : any;
  keywordRollo : any = 'rollo_Id' /** Palabra clave de input rollos*/
  validarInputRollo : any;
  keywordRollo2 = '';

  constructor(private servicioProducto : ProductoService,
    private frmBuilder : FormBuilder,
    private rolService : RolesService,
    @Inject(SESSION_STORAGE) private storage: WebStorageService,
    private servicioEstados : EstadosService,
    private servicioTipoDoc : TipoDocumentoService,
    private ServicioEntradaRollos :  EntradaRollosService,
    private servicioDtlEntradaRollos: DetallesEntradaRollosService) {

      this.FormConsultarFiltros = this.frmBuilder.group({
        Documento : ['', Validators.required],
        ProdNombre : ['', Validators.required],
        Rollo : ['', Validators.required ],
        tipoDoc : ['', Validators.required ],
        fechaDoc: ['', Validators.required],
        fechaFinalDoc: ['', Validators.required],
        estadoRollo: ['', Validators.required],
      });

    }


  ngOnInit() {

    this.lecturaStorage();
    this.fecha();
    this.llenadoProducto();
    this.llenadoEstadoRollos();
    this.llenadoTipoDocumento();
    this.cambioKeyword();
    this.llenadoRollosIngresados();

  }

  cambioKeyword() {
    this.keywordRollo2 = this.keywordRollo.toString();
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

  //Funcion que colocará la fecha actual y la colocará en el campo de fecha de pedido
  fecha(){
    this.today = new Date();
    var dd : any = this.today.getDate();
    var mm : any = this.today.getMonth() + 1;
    var yyyy : any = this.today.getFullYear();
    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
    this.today = yyyy + '-' + mm + '-' + dd;
  }

  onChangeSearchProductos(val) {
    if (val != '') this.validarInputNombresProductos = false;
    else this.validarInputNombresProductos = true;
    // fetch remote data from here
    // And reassign the 'data' which is binded to 'data' property.
  }

  onFocusedProductos(e) {
    if (!e.isTrusted) this.validarInputNombresProductos = false;
    else this.validarInputNombresProductos = true;
    // do something when input is focused
  }

  selectEventProducto(item) {
    this.FormConsultarFiltros.value.Producto = item.prod_Id;
    if (this.FormConsultarFiltros.value.ProdNombre != '') this.validarInputNombresProductos = false;
    else this.validarInputNombresProductos = true;
    // do something with selected item
  }

  onChangeSearchRollo(val) {
    if (val != '') this.validarInputRollo = false;
    else this.validarInputRollo = true;
  }


  onFocusedRollo(e) {
    if (!e.isTrusted) this.validarInputRollo = false;
    else this.validarInputRollo = true;
    // do something when input is focused
  }

  selectEventRollo(item) {
    this.FormConsultarFiltros.value.Rollo = item.asigProdFV_Id;
    if (this.FormConsultarFiltros.value.Rollo != '') this.validarInputRollo = false;
    else this.validarInputRollo = true;

    // do something with selected item
  }

  limpiarCampos(){
    this.FormConsultarFiltros.reset();
  }

  /** Cargar Productos en Select Input */
  llenadoProducto(){
    this.servicioProducto.srvObtenerLista().subscribe(registrosProductos => {
      for (let index = 0; index < registrosProductos.length; index++) {
         this.arrayProducto.push(registrosProductos[index]);
         //console.log(this.arrayProducto);
      }
    });
  }

  /** Cargar combo estados rollos */
  llenadoEstadoRollos() {
    this.servicioEstados.srvObtenerEstadosRollos().subscribe(registroEstadosRollos => {
      for (let index = 0; index < registroEstadosRollos.length; index++) {
        this.arrayEstadoRollo.push(registroEstadosRollos[index])
      }
    })
  }

  /** Cargar tipos de documentos a los combos. */
  llenadoTipoDocumento() {
    this.servicioTipoDoc.srvObtenerLista().subscribe(registrosTipoDoc => {
      for(let rtd = 0; rtd < registrosTipoDoc.length; rtd++) {
        if(registrosTipoDoc[rtd].tpDoc_Id == 'ASIGPRODFV'
        || registrosTipoDoc[rtd].tpDoc_Id == 'DEVPRODFAC'
        || registrosTipoDoc[rtd].tpDoc_Id == 'ENTROLLO') {

          this.arrayTipoDoc.push(registrosTipoDoc[rtd])
        }
      }
    });
  }

 /** Cargar rollos desde EntradasRollos_Productos */
  llenadoRollosIngresados() {
    this.servicioDtlEntradaRollos.srvObtenerLista().subscribe(registrosRollos => {
      for (let index = 0; index < registrosRollos.length; index++) {
        //console.log(registrosRollos[index])
        this.arrayRollo.push(registrosRollos[index]);
      }
    });
  }

  consultarFiltros(){
    let documento : any = this.FormConsultarFiltros.value.Documento;
    let producto : any = this.FormConsultarFiltros.value.ProdNombre;
    let rollo : any = this.FormConsultarFiltros.value.Rollo;
    let tipoDocu : any = this.FormConsultarFiltros.value.tipoDoc;
    let fechaIni : any = this.FormConsultarFiltros.value.tipoDoc;
    let fechaFin : any = this.FormConsultarFiltros.value.tipoDoc;
    let estadoRollo : any = this.FormConsultarFiltros.value.tipoDoc;


  }
}
