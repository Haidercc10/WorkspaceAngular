import { ThisReceiver } from '@angular/compiler';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { modelMateriaPrima } from 'src/app/Modelo/modelMateriaPrima';
import { CategoriaMateriaPrimaService } from 'src/app/Servicios/categoriaMateriaPrima.service';
import { MateriaPrimaService } from 'src/app/Servicios/materiaPrima.service';
import { RolesService } from 'src/app/Servicios/roles.service';
import { UnidadMedidaService } from 'src/app/Servicios/unidad-medida.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-materias-primas',
  templateUrl: './materias-primas.component.html',
  styleUrls: ['./materias-primas.component.css']
})
export class MateriasPrimasComponent implements OnInit {

  public formularioMatPrimas !: FormGroup;
  public formularioConsultaMP !: FormGroup;
  public unidadMedida = [];
  public nombreCategoriasMP =[];
  public nombreMateriasPrimas =[];
  public componenteCrearCategoriaModal : boolean = false;
  public componenteCrearUnidadMedidaModal : boolean = false;

  titulosTabla = [];
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  ArrayMateriaPrima = []; //Variable que almacenará las materias primas consultadas
  AccionBoton = "Agregar";
  idMateriaPrimaActualizar : number = 0;

  /* Constructor / Llamar servicios */
  constructor(private frmBuilder : FormBuilder,
                @Inject(SESSION_STORAGE) private storage: WebStorageService,
                  private rolService : RolesService,
                    private unidadMedidaService : UnidadMedidaService,
                      private categoriMpService : CategoriaMateriaPrimaService,
                        private servicioMateriasPrimas : MateriaPrimaService) {

    /** Formulario Materias Primas */
    this.formularioMatPrimas = this.frmBuilder.group({
      MatPriNombre : [, Validators.required],
      MatPriDescripcion : [, Validators.required],
      MatPriStock: [, Validators.required],
      MatPriUnidadMedida: [, Validators.required],
      MatPriCategoria: [, Validators.required],
      MatPriPrecio: [, Validators.required],
    });

    /** Formulario consulta materias primas */
    this.formularioConsultaMP = this.frmBuilder.group({
      consMatPri_Id : [, Validators.required],
      consMatPri_Nombre : [, Validators.required],
    });
   }

  /* Funciones que se cargan al abrir la vista actual */
  ngOnInit(): void {
    this.ColumnasTabla();
    this.obtenerUnidadMedida();
    this.obtenerNombreCategoriasMp();
    this.obtenerNombreMateriaPrima();
    this.lecturaStorage();
  }

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

  /* FUNCION PARA RELIZAR CONFIMACIÓN DE SALIDA */
  confimacionSalida(){
    Swal.fire({
      title: '¿Seguro que desea salir?',
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: 'Salir',
      denyButtonText: `No Salir`,
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) window.location.href = "./";
    })
  }

  //Funcion que colocará el nombre a las columnas de la tabla en la cual se muestran los productos pedidos por los clientes
  ColumnasTabla(){
    this.titulosTabla = [];
    this.titulosTabla = [{
      mpId : "Id",
      mpNombre : "Nombre",
      mpCantidad : "Stock",
      mpUndMedCant : "Und. Cant",
      mpPrecioU : "Precio U",
      mpSubTotal : "SubTotal",
    }]
  }

  /*Funcion que va almacenar todas las unidades de medida existentes en la empresa*/
  obtenerUnidadMedida(){
      this.unidadMedidaService.srvObtenerLista().subscribe(datos_unidadesMedida => {
        for (let index = 0; index < datos_unidadesMedida.length; index++) {
          this.unidadMedida.push(datos_unidadesMedida[index].undMed_Id);
          this.unidadMedida.sort();
        }
      });
  }

  //Funcion que va a buscar y almacenar todos los nombre de las categorias de materia prima
  obtenerNombreCategoriasMp(){
      this.categoriMpService.srvObtenerLista().subscribe(datos_categorias => {
        for (let index = 0; index < datos_categorias.length; index++) {
          this.nombreCategoriasMP.push(datos_categorias[index]);
          this.nombreCategoriasMP.sort((a,b) => a.catMP_Nombre.localeCompare(b.catMP_Nombre));
        }
      });
  }

  //Funcion que va a cargar todos los nombre de materia prima en combobox
  obtenerNombreMateriaPrima(){
    this.servicioMateriasPrimas.srvObtenerLista().subscribe(datos_MateriasPrimas => {
      for (let index = 0; index < datos_MateriasPrimas.length; index++) {
        this.nombreMateriasPrimas.push(datos_MateriasPrimas[index]);
        this.nombreMateriasPrimas.sort((a,b) => a.matPri_Nombre.localeCompare(b.matPri_Nombre));
      }
    });
  }

  /** Cargar tabla de materias primas */
  cargarTablaMateriasPrimas() {

  }

  /** Función Validar que los campos del formulario contengan datos */
  validarCamposVacios() {
    if(this.formularioMatPrimas.valid) {
      if (this.AccionBoton == "Agregar") this.registrarMateriasPrimas();
      else if (this.AccionBoton == "Editar") this.actualizarMP();
    } else {
      Swal.fire('Los campos vacios deben ser llenados');
    }
  }

  /** Registrar materias Primas */
  registrarMateriasPrimas(){
    /*Id Bodega mat. primas */
    let IdBodega: number = 4;

    const camposMateriasPrimas : modelMateriaPrima = {
      MatPri_Id: 0,
      MatPri_Nombre: this.formularioMatPrimas.get('MatPriNombre')?.value,
      MatPri_Descripcion: this.formularioMatPrimas.get('MatPriDescripcion')?.value,
      MatPri_Stock: this.formularioMatPrimas.get('MatPriStock')?.value,
      UndMed_Id: this.formularioMatPrimas.get('MatPriUnidadMedida')?.value,
      CatMP_Id: this.formularioMatPrimas.get('MatPriCategoria')?.value,
      MatPri_Precio: this.formularioMatPrimas.get('MatPriPrecio')?.value,
      TpBod_Id: IdBodega,
    }

    this.servicioMateriasPrimas.srvAgregar(camposMateriasPrimas).subscribe(datosMateriaPrima => {
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
      this.consultarTodasMateriasPrimas();

    });
    this.limpiarCampos();
  }

  //funcion que buscará materias pirmas por el campos de ID
  buscarMpId(){
    this.ArrayMateriaPrima = [];
    let idMateriaPrima : number = this.formularioConsultaMP.value.consMatPri_Id;

    this.servicioMateriasPrimas.srvObtenerListaPorId(idMateriaPrima).subscribe(datos_materiaPrima => {
      this.categoriMpService.srvObtenerListaPorId(datos_materiaPrima.catMP_Id).subscribe(datos_categoria => {
        this.cargarFormMpEnTablas(this.ArrayMateriaPrima, datos_materiaPrima.matPri_Id, datos_materiaPrima.matPri_Nombre, datos_materiaPrima.matPri_Precio, datos_materiaPrima.matPri_Stock, datos_materiaPrima.undMed_Id);
      });
    });
  }

  //Funcion que consultara una materia prima con base a la que está seleccionada en la vista
  buscarMpSeleccionada(){
    this.ArrayMateriaPrima = [];
    let nombreMateriaPrima : string = this.formularioConsultaMP.value.consMatPri_Nombre;

    this.servicioMateriasPrimas.srvObtenerListaPorId(nombreMateriaPrima).subscribe(datos_materiaPrima => {
      this.categoriMpService.srvObtenerListaPorId(datos_materiaPrima.catMP_Id).subscribe(datos_categoria => {
        this.cargarFormMpEnTablas(this.ArrayMateriaPrima, datos_materiaPrima.matPri_Id, datos_materiaPrima.matPri_Nombre, datos_materiaPrima.matPri_Precio, datos_materiaPrima.matPri_Stock, datos_materiaPrima.undMed_Id);
      });
    });
  }

  //Funcion que consultará en su totalidad las materias primas
  consultarTodasMateriasPrimas(){
    this.ArrayMateriaPrima = [];
    this.servicioMateriasPrimas.srvObtenerLista().subscribe(datos_materiasPrimas => {
      for (let i = 0; i < datos_materiasPrimas.length; i++) {
        this.cargarFormMpEnTablas(this.ArrayMateriaPrima,
                                  datos_materiasPrimas[i].matPri_Id,
                                  datos_materiasPrimas[i].matPri_Nombre,
                                  datos_materiasPrimas[i].matPri_Precio,
                                  datos_materiasPrimas[i].matPri_Stock,
                                  datos_materiasPrimas[i].undMed_Id,);
      }
    });
  }

  cargarFormMpEnTablas(formulario : any, id: number, nombre : string, precio : number, cantidad : number, undMEd : string){
    let subtotal : number = precio * cantidad;
    let productoExt : any = {
      Id : id,
      Nombre : nombre,
      Cant : cantidad,
      UndCant : undMEd,
      PrecioUnd : precio,
      SubTotal : subtotal,
    }

    if (this.AccionBoton == "Agregar" && this.ArrayMateriaPrima.length == 0) {
      this.ArrayMateriaPrima.push(productoExt);

    } else if (this.AccionBoton == "Agregar" && this.ArrayMateriaPrima.length != 0){
      this.ArrayMateriaPrima.push(productoExt);
      productoExt = [];
    } else {
      for (let index = 0; index < formulario.length; index++) {
        if(productoExt.Id == this.ArrayMateriaPrima[index].Id) {
          this.ArrayMateriaPrima.splice(index, 1);
          this.AccionBoton = "Agregar";
          this.ArrayMateriaPrima.push(productoExt);
          break;
        }
      }
    }

    this.ArrayMateriaPrima.sort((a,b) => a.Nombre.localeCompare(b.Nombre));
  }

  limpiarTablaConsulta(){
    this.ArrayMateriaPrima = [];
  }

  valorArray(formulario : any){
    this.AccionBoton = "Editar";
    this.servicioMateriasPrimas.srvObtenerListaPorId(formulario.Id).subscribe(datos_materiasPrimas => {
      this.idMateriaPrimaActualizar = formulario.Id;
      this.formularioMatPrimas.setValue({
        MatPriNombre : datos_materiasPrimas.matPri_Nombre,
        MatPriDescripcion : datos_materiasPrimas.matPri_Descripcion,
        MatPriStock: datos_materiasPrimas.matPri_Stock,
        MatPriUnidadMedida: datos_materiasPrimas.undMed_Id,
        MatPriCategoria: datos_materiasPrimas.catMP_Id,
        MatPriPrecio: datos_materiasPrimas.matPri_Precio,
      });
    });
  }

  actualizarMP(){
    let IdBodega: number = 4;
    const mp : any = {
      MatPri_Id : this.idMateriaPrimaActualizar,
      MatPri_Nombre: this.formularioMatPrimas.get('MatPriNombre')?.value,
      MatPri_Descripcion: this.formularioMatPrimas.get('MatPriDescripcion')?.value,
      MatPri_Stock: this.formularioMatPrimas.get('MatPriStock')?.value,
      UndMed_Id: this.formularioMatPrimas.get('MatPriUnidadMedida')?.value,
      CatMP_Id: this.formularioMatPrimas.get('MatPriCategoria')?.value,
      MatPri_Precio: this.formularioMatPrimas.get('MatPriPrecio')?.value,
      TpBod_Id: IdBodega,
    }

    this.servicioMateriasPrimas.srvActualizar(this.idMateriaPrimaActualizar, mp).subscribe(datos_materiaPrima => {
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
        title: '¡Materia Prima Actualizada con exito!'
      });
      this.consultarTodasMateriasPrimas();
    });
    this.limpiarCampos();
  }

  /** Función para limpiar los campos del formulario. */
  limpiarCampos(){
    this.formularioMatPrimas.reset();
    this.AccionBoton = 'Agregar';
    this.idMateriaPrimaActualizar = 0;
  }

  /** Función que llama el componente de crear-categoria  */
  LlamarModalCrearCategoria() {
    this.componenteCrearCategoriaModal = true;
  }

  /** Función que llama el componente de crear-unidad-medida  */
  LlamarModalCrearUnidadMedida() {
    this.componenteCrearUnidadMedidaModal = true;
  }

}
