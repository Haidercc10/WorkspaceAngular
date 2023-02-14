import { Component, Injectable, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { CategoriaMateriaPrimaService } from 'src/app/Servicios/CategoriasMateriaPrima/categoriaMateriaPrima.service';
import { MateriaPrimaService } from 'src/app/Servicios/MateriaPrima/materiaPrima.service';
import { MpProveedorService } from 'src/app/Servicios/MateriaPrima_Proveedor/MpProveedor.service';
import { ProveedorService } from 'src/app/Servicios/Proveedor/proveedor.service';
import { UnidadMedidaService } from 'src/app/Servicios/UnidadMedida/unidad-medida.service';

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
  tintaCreada = false;
  informacion : string = '';

  constructor(private materiaPrimaService : MateriaPrimaService,
                private categoriMpService : CategoriaMateriaPrimaService,
                  private unidadMedidaService : UnidadMedidaService,
                    private frmBuilderMateriaPrima : FormBuilder,
                      private proveedorservices : ProveedorService,
                        private proveedorMPService : MpProveedorService,) {

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

  ngOnInit(): void {
    this.obtenerNombreCategoriasMp();
    this.obtenerUnidadMedida();
    this.obtenerProceedor();
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
    let categoriaMateriaPrima : number = this.materiPrima.value.mpCategoria;
    let precioMateriaPrima : number = this.materiPrima.value.mpValor;

    this.CreacionMateriaPrima(nombreMateriaPrima, descripcionMateriaPrima, stockMateriaPrima, categoriaMateriaPrima, precioMateriaPrima);
    this.materiPrima.reset();
  }

  //Funacion que crea una materia prima y la guarda en la base de datos
  CreacionMateriaPrima(nombreMateriaPrima : string, descripcionMateriaPrima : string, stockMateriaPrima : number, categoriaMateriaPrima : number, precioMateriaPrima : number){

    const datosMP : any = {
      MatPri_Nombre : nombreMateriaPrima,
      MatPri_Descripcion : descripcionMateriaPrima,
      MatPri_Stock : stockMateriaPrima,
      UndMed_Id : 'Kg',
      CatMP_Id : categoriaMateriaPrima,
      MatPri_Precio : precioMateriaPrima,
      TpBod_Id : 4,
      MatPri_Fecha : moment().format('YYYY-MM-DD'),
      MatPri_Hora : moment().format('H:mm:ss'),
    }

    this.materiaPrimaService.srvGuardar(datosMP).subscribe(datos_mp_creada => {
      this.tintaCreada = true;
      this.informacion = `¡La materia prima fue creada con exito! \n\n `;
    }, error => {
      this.tintaCreada = true;
      this.informacion = `¡Fallo al crear la materia prima! \n\n ${error.message}`;
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
