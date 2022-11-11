import { Component, Inject, Injectable, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { AreaService } from 'src/app/Servicios/area.service';
import { AsignacionMPService } from 'src/app/Servicios/asignacionMP.service';
import { BagproService } from 'src/app/Servicios/Bagpro.service';
import { CategoriaMateriaPrimaService } from 'src/app/Servicios/categoriaMateriaPrima.service';
import { DetallesAsignacionService } from 'src/app/Servicios/detallesAsignacion.service';
import { EstadosService } from 'src/app/Servicios/estados.service';
import { FacturaMpService } from 'src/app/Servicios/facturaMp.service';
import { FactuaMpCompradaService } from 'src/app/Servicios/facturaMpComprada.service';
import { MateriaPrimaService } from 'src/app/Servicios/materiaPrima.service';
import { MpProveedorService } from 'src/app/Servicios/MpProveedor.service';
import { ProcesosService } from 'src/app/Servicios/procesos.service';
import { ProveedorService } from 'src/app/Servicios/proveedor.service';
import { RolesService } from 'src/app/Servicios/roles.service';
import { TipoEstadosService } from 'src/app/Servicios/tipo-estados.service';
import { TipoBodegaService } from 'src/app/Servicios/tipoBodega.service';
import { UnidadMedidaService } from 'src/app/Servicios/unidad-medida.service';
import { UsuarioService } from 'src/app/Servicios/usuario.service';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-crear-materiaprima',
  templateUrl: './crear-materiaprima.component.html',
  styleUrls: ['./crear-materiaprima.component.css']
})

export class CrearMateriaprimaComponent implements OnInit {

  public materiPrima !: FormGroup;


  nombreCategoriasMP = []; //VAriable que va a almacenar el nombre de todas las categorias de materias primas existentes en la empresa
  unidadMedida = []; //Varibale que va a almacenar las unidades de medida registradas en la base de datos
  estado = []; //Variable que va a almacenar todos los tipos de estados de documentos
  proveedores = [];

  constructor(private materiaPrimaService : MateriaPrimaService,
    private categoriMpService : CategoriaMateriaPrimaService,
      private tipoBodegaService : TipoBodegaService,
        private unidadMedidaService : UnidadMedidaService,
          private estadoService : EstadosService,
            private tipoEstadoService : TipoEstadosService,
              private usuarioService : UsuarioService,
                private procesosService : ProcesosService,
                  private areasService : AreaService,
                    private rolService : RolesService,
                      private frmBuilderMateriaPrima : FormBuilder,
                        @Inject(SESSION_STORAGE) private storage: WebStorageService,
                          private proveedorservices : ProveedorService,
                            private proveedorMPService : MpProveedorService,
                              private facturaMpComService : FactuaMpCompradaService,
                                private facturaMpService : FacturaMpService,
                                    private asignacionMPService : AsignacionMPService,
                                      private detallesAsignacionService : DetallesAsignacionService,
                                        private bagProServices : BagproService,) {

    this.materiPrima = this.frmBuilderMateriaPrima.group({
      //MateriaPrima
      mpNombre: new FormControl(),
      mpDescripcion: new FormControl(),
      mpStock: new FormControl(),
      mpCategoria: new FormControl(),
      mpEstado: new FormControl(),
      mpProveedor: new FormControl(),
      mpValor: new FormControl(),
      Stock : new FormControl(),
      mpUnidadMedida : new FormControl(),
      MpObservacion : new FormControl(),
    });
  }

  ngOnInit(): void {
    this.initForms();
    this.obtenerNombreCategoriasMp();
    this.obtenerUnidadMedida();
    this.obtenerProceedor();
  }

  //Inicializando formulario de Crear Proveedores en modal.
  initForms(){
    this.materiPrima = this.frmBuilderMateriaPrima.group({
      mpNombre: ['', Validators.required],
      mpDescripcion: ['', Validators.required],
      mpStock: ['', Validators.required],
      mpCategoria: ['', Validators.required],
      mpEstado: ['', Validators.required],
      mpProveedor: ['', Validators.required],
      mpValor: ['', Validators.required],
      Stock : ['', Validators.required],
      mpUnidadMedida : ['', Validators.required],
      MpObservacion : ['', Validators.required],
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

   //Funcion que va a buscar y almacenar todos los nombre de las categorias de materia prima
   obtenerNombreCategoriasMp(){
    this.categoriMpService.srvObtenerLista().subscribe(datos_categorias => {
      for (let index = 0; index < datos_categorias.length; index++) {
        this.nombreCategoriasMP.push(datos_categorias[index]);
      }
    });
  }

  limpiarCampos(){
    this.materiPrima.reset();
  }

  obtenerProceedor(){
    this.proveedorservices.srvObtenerLista().subscribe(datos_proveedores => {
      for (let index = 0; index < datos_proveedores.length; index++) {
        this.proveedores.push(datos_proveedores[index])
      }
    });
  }

  registrarMateriPrima(){
    let nombreMateriaPrima : string = this.materiPrima.value.mpNombre;
    let descripcionMateriaPrima : string = this.materiPrima.value.mpDescripcion;
    let stockMateriaPrima : number = 0;
    let undMed : string = 'Kg';
    let categoriaMateriaPrima : number = this.materiPrima.value.mpCategoria;
    let precioMateriaPrima : number = this.materiPrima.value.mpValor;
    let bodega : number = 4;
    let proveedor : number = this.materiPrima.value.mpProveedor;

    this.CreacionMateriaPrima(nombreMateriaPrima, descripcionMateriaPrima, stockMateriaPrima, undMed, categoriaMateriaPrima, precioMateriaPrima, bodega, proveedor);
    this.materiPrima.reset();
  }

  //Funacion que crea una materia prima y la guarda en la base de datos
  CreacionMateriaPrima(nombreMateriaPrima : string,
    descripcionMateriaPrima : string,
    stockMateriaPrima : number,
    undMed : any,
    categoriaMateriaPrima : number,
    precioMateriaPrima : number,
    proveedor : number,
    bodega : any){

    const datosMP : any = {
      MatPri_Nombre : nombreMateriaPrima,
      MatPri_Descripcion : descripcionMateriaPrima,
      MatPri_Stock : stockMateriaPrima,
      UndMed_Id : 'Kg',
      CatMP_Id : categoriaMateriaPrima,
      MatPri_Precio : precioMateriaPrima,
      TpBod_Id : 4,
    }

    this.materiaPrimaService.srvGuardar(datosMP).subscribe(datos_mp_creada => {
      const Toast = Swal.mixin({
        toast: true,
        position: 'center',
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
      });
      Toast.fire({
        icon: 'success',
        title: '¡Materia Prima creada con exito!'
      });
    });
  }


  //Funcion qu creará la relacion de materia prima y proveedores
  creacionMpProveedor(idMateriaPrima : number, proveedor : number){
    const datosMpProveedor = {
      Prov_Id : proveedor,
      MatPri_Id : idMateriaPrima,
    }

    this.proveedorMPService.srvGuardar(datosMpProveedor).subscribe(datos_MpProveedorCreado => {

    });
  }


}
