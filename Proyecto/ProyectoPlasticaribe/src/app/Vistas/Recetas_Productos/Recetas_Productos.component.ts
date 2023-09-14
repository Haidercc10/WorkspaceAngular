import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShepherdService } from 'angular-shepherd';
import moment from 'moment';
import { modelProducto_MatPrima } from 'src/app/Modelo/modelProducto_MatPrima';
import { EntradaBOPPService } from 'src/app/Servicios/BOPP/entrada-BOPP.service';
import { ExistenciasProductosService } from 'src/app/Servicios/ExistenciasProductos/existencias-productos.service';
import { MateriaPrimaService } from 'src/app/Servicios/MateriaPrima/materiaPrima.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { Productos_MateriasPrimasService } from 'src/app/Servicios/Productos_MateriasPrimas/Productos_MateriasPrimas.service';
import { TintasService } from 'src/app/Servicios/Tintas/tintas.service';
import { UnidadMedidaService } from 'src/app/Servicios/UnidadMedida/unidad-medida.service';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-Recetas_Productos',
  templateUrl: './Recetas_Productos.component.html',
  styleUrls: ['./Recetas_Productos.component.css']
})

export class Recetas_ProductosComponent implements OnInit {

  cargando : boolean = false;
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  FormMateriales : FormGroup;
  FormProductos : FormGroup;
  productos : any [] = [];
  materiasPrimas : any [] = [];
  unidadMedida : any [] = [];
  categoriasMP : any = [];
  categoriasTintas : any = [];
  categoriasBOPP : any = [];
  materialesSeleccioados : any [] = [];

  constructor(private AppComponent : AppComponent,
                private shepherdService: ShepherdService,
                  private msj : MensajesAplicacionService,
                    private frmBuilder : FormBuilder,
                      private prodMaterialesService : Productos_MateriasPrimasService,
                        private exisProdService : ExistenciasProductosService,
                          private undMedService : UnidadMedidaService,
                            private materiaPrimaService : MateriaPrimaService,
                              private tintasService : TintasService,
                                private boppService : EntradaBOPPService,) {

    this.FormProductos = this.frmBuilder.group({
      Id : [null, Validators.required],
      Nombre : [null, Validators.required],
      Presentacion : [null, Validators.required],
      Id_Existencia : [null, Validators.required],
    });

    this.FormMateriales = this.frmBuilder.group({
      Id : [null, Validators.required],
      Nombre : [null, Validators.required],
      Cantidad : [null, Validators.required],
      Presentacion : [null, Validators.required],
      Categoria : [null, Validators.required],
    });
  }

  ngOnInit() {
    this.obtenerMateriasPrimas();
    this.obtenerUnidadesMedida();
  }

  // Funcion que va a limpiar todo el modulo
  limpiarTodo(){
    this.FormMateriales.reset();
    this.FormProductos.reset();
    this.materialesSeleccioados = [];
  }

  // Funcion que va a limpiar el formulario de materiales
  limpiarFormMateriales = () => this.FormMateriales.reset();

  // Funcion que va a consultar las categorias de las tablas Materia_Prima, Tintas y BOPP
  consultarCategorias(){
    this.materiaPrimaService.GetCategoriasMateriaPrima().subscribe(datos => this.categoriasMP = datos);
    this.tintasService.GetCategoriasTintas().subscribe(datos => this.categoriasTintas = datos);
    this.boppService.GetCategoriasBOPP().subscribe(datos => this.categoriasBOPP = datos);
  }

  // Funcion que va a consultar las materias primas
  obtenerMateriasPrimas = () => this.materiaPrimaService.GetInfo_MPTintasBOPP().subscribe(data => this.materiasPrimas = data);

  // Funcion que va a consultas las unidades de medida
  obtenerUnidadesMedida = () => this.undMedService.srvObtenerLista().subscribe(data => this.unidadMedida = data.map(x => x.undMed_Id));
  
  //Funcion que va a mostrar el nombre de la materia prima
  cambiarNombreMateriaPrima(){
    let id : number = this.FormMateriales.value.Id;
    this.materiaPrimaService.getInfoMpTintaBopp(id).subscribe(datos => {
      datos.forEach(mp => {
        if (this.categoriasMP.includes(mp.categoria) || this.categoriasTintas.includes(mp.categoria) || this.categoriasBOPP.includes(mp.categoria)) {
          if (![84, 2001, 88, 89, 2072, 449].includes(mp.id)) {
            this.FormMateriales.patchValue({
              Id : mp.id,
              Nombre : mp.nombre,
              Presentacion : 'Kg',
              Categoria : mp.categoria,
            });
          }
        }
      });
    }, () => this.limpiarFormMateriales());
  }

  // Funcion que va a consultar la información de un producto
  buscarProductos = () => this.exisProdService.GetInfoProducto(this.FormProductos.value.Nombre).subscribe(data => this.productos = data);

  // Funcion que va a mostrar el nombre del producto
  cambiarNombreProducto(){
    let id : number = this.FormProductos.value.Nombre;
    let und : string = this.FormProductos.value.Presentacion;
    this.FormProductos.patchValue({
      Id : id,
      Nombre : this.productos.find(x => x.id == id && x.presentacion == und).nombre,
      Id_Existencia : this.productos.find(x => x.id == id && x.presentacion == und).id_Existencia,
    });
  }

  // Funcion que va a encargarse de agregar los materiales seleccionados
  agregarMateriales(){
    let categoria : number = this.FormMateriales.value.Categoria;
    const data : any = {
      Producto : this.FormProductos.value.Id,
      Presentacion_Producto : this.FormProductos.value.Presentacion,
      Existencia_Producto : this.FormProductos.value.Id_Existencia,
      Material : this.FormMateriales.value.Id,
      Materia_Prima : 84,
      Tinta : 2001,
      Bopp : 1,
      Nombre : this.FormMateriales.value.Nombre,
      Cantidad_Minima : this.FormMateriales.value.Cantidad,
      Presentacion_Material : this.FormMateriales.value.Presentacion,
    };
    if (this.categoriasMP.includes(categoria)) data.Materia_Prima = data.Material;
    else if (this.categoriasTintas.includes(categoria)) data.Tinta = data.Material;
    else if (this.categoriasBOPP.includes(categoria)) data.Bopp = data.Material;
    this.materialesSeleccioados.push(data);
  }

  // Funcion que va a encargarse de quitar los materiales seleccionados
  quitarMateriales(id : number){
    this.materialesSeleccioados.splice(this.materialesSeleccioados.findIndex(x => x.Material == id), 1);
  }

  // Funcion que va a encargarse de guardar la información de la receta
  guardarReceta(){
    let count : number = 0;
    this.materialesSeleccioados.forEach(material => {
      const data : modelProducto_MatPrima = {
        Prod_Id: material.Producto,
        UndMed_Id: material.Presentacion_Producto,
        ExProd_Id: material.Existencia_Producto,
        MatPri_Id: material.Materia_Prima,
        Tinta_Id: material.Tinta,
        Bopp_Id: material.Bopp,
        Cantidad_Minima: material.Cantidad_Minima,
        Usua_Id: this.storage_Id,
        Fecha_Registro: moment().format('YYYY-MM-DD'),
        Hora_Registro: moment().format('HH:mm:ss'),
      };
      this.prodMaterialesService.Post(data).subscribe(() => {
        count++;
        if (count == this.materialesSeleccioados.length) this.msj.mensajeConfirmacion('¡Se ha registrado la receta con éxito!');
      }, () => this.msj.mensajeError('¡No se ha podido registrar la receta!'), () => this.cargando = false);
    });
  }
}