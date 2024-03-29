import { Component, Injectable, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { CategoriaMateriaPrimaService } from 'src/app/Servicios/CategoriasMateriaPrima/categoriaMateriaPrima.service';
import { MateriaPrimaService } from 'src/app/Servicios/MateriaPrima/materiaPrima.service';
import { MpProveedorService } from 'src/app/Servicios/MateriaPrima_Proveedor/MpProveedor.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { ProveedorService } from 'src/app/Servicios/Proveedor/proveedor.service';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-crear-materiaprima',
  templateUrl: './crear-materiaprima.component.html',
  styleUrls: ['./crear-materiaprima.component.css']
})

export class CrearMateriaprimaComponent implements OnInit {

  public materiPrima !: FormGroup; /** Formulario de Materias Primas */
  nombreCategoriasMP = []; //VAriable que va a almacenar el nombre de todas las categorias de materias primas existentes en la empresa
  unidadMedida = []; //Varibale que va a almacenar las unidades de medida registradas en la base de datos
  estado = []; //Variable que va a almacenar todos los tipos de estados de documentos
  proveedores = []; /** Array para cargar los proveedores de materia prima. */

  constructor(private materiaPrimaService : MateriaPrimaService,
                private categoriMpService : CategoriaMateriaPrimaService,
                  private frmBuilderMateriaPrima : FormBuilder,
                    private proveedorservices : ProveedorService,
                      private proveedorMPService : MpProveedorService,
                        private mensajeService : MensajesAplicacionService,) {

    this.materiPrima = this.frmBuilderMateriaPrima.group({
      mpNombre: ['', Validators.required],
      mpDescripcion: ['', Validators.required],
      mpStock: ['', Validators.required],
      mpCategoria: ['', Validators.required],
      mpEstado: ['', Validators.required],
      mpValor: [null, Validators.required],
      Stock : ['', Validators.required],
      mpUnidadMedida : ['', Validators.required],
      MpObservacion : ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.obtenerNombreCategoriasMp();
    this.obtenerProceedor();
  }

   //Funcion que va a buscar y almacenar todos los nombre de las categorias de materia prima
   obtenerNombreCategoriasMp = () => this.categoriMpService.srvObtenerLista().subscribe(datos => this.nombreCategoriasMP = datos);

  /** Limpiar campos al momento de crear la mat. prima. */
  limpiarCampos = () => this.materiPrima.reset();

  /** Obtener Proveedor y cargarlo en el array de la vista. */
  obtenerProceedor = () => this.proveedorservices.srvObtenerLista().subscribe(datos => this.proveedores = datos);

  /** Crear el registro de la materia prima en la base de datos. */
  registrarMateriPrima(){
    let nombreMateriaPrima : string = this.materiPrima.value.mpNombre;
    let descripcionMateriaPrima : string = this.materiPrima.value.mpDescripcion;
    let stockMateriaPrima : number = 0;
    let categoriaMateriaPrima : any = this.materiPrima.value.mpCategoria;
    let precioMateriaPrima : number = this.materiPrima.value.mpValor;

    const datosMP : any = {
      MatPri_Nombre : nombreMateriaPrima.toUpperCase(),
      MatPri_Descripcion : descripcionMateriaPrima.toUpperCase(),
      MatPri_Stock : stockMateriaPrima,
      UndMed_Id : 'Kg',
      CatMP_Id : categoriaMateriaPrima,
      MatPri_Precio : precioMateriaPrima,
      TpBod_Id : 4,
      MatPri_Fecha : moment().format('YYYY-MM-DD'),
      MatPri_Hora : moment().format('H:mm:ss'),
    }

    this.materiaPrimaService.srvGuardar(datosMP).subscribe(() => {
      this.mensajeService.mensajeConfirmacion('¡Materia Prima creada con éxito!', '');
      setTimeout(() => { this.materiPrima.reset(); }, 1000);
    }, () => this.mensajeService.mensajeError(`¡Mensaje Error!`, 'Falló al crear la materia prima, verifique!'));
  }

  //Funcion qu creará la relacion de materia prima y proveedores
  creacionMpProveedor(idMateriaPrima : number, proveedor : number){
    const datosMpProveedor = {
      Prov_Id : proveedor,
      MatPri_Id : idMateriaPrima,
    }
    this.proveedorMPService.srvGuardar(datosMpProveedor).subscribe(() => {});
  }

  /** Cargar nombre en la descripción. */
  cargarDescripcion(){
    let mtpNombre : any = this.materiPrima.value.MpNombre;
    this.materiPrima.patchValue({ mpDescripcion: mtpNombre })
  }

}
