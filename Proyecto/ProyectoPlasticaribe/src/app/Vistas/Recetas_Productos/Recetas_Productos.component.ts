import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShepherdService } from 'angular-shepherd';
import moment from 'moment';
import { MessageService } from 'primeng/api';
import { modelProducto_MatPrima } from 'src/app/Modelo/modelProducto_MatPrima';
import { EntradaBOPPService } from 'src/app/Servicios/BOPP/entrada-BOPP.service';
import { ExistenciasProductosService } from 'src/app/Servicios/ExistenciasProductos/existencias-productos.service';
import { MateriaPrimaService } from 'src/app/Servicios/MateriaPrima/materiaPrima.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { Productos_MateriasPrimasService } from 'src/app/Servicios/Productos_MateriasPrimas/Productos_MateriasPrimas.service';
import { TintasService } from 'src/app/Servicios/Tintas/tintas.service';
import { UnidadMedidaService } from 'src/app/Servicios/UnidadMedida/unidad-medida.service';
import { AppComponent } from 'src/app/app.component';
import { defaultStepOptions, stepsRecetaProductos as defaultSteps } from 'src/app/data';

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
  edicion : boolean = false; //Variable que validará si se buscó una receta y se quiere editar o no
  FormMateriales : FormGroup; //Variable que almacenará la información del formulario de los materiales
  FormProductos : FormGroup; //Variable que almacenará la información del formaulario del producto
  productos : any [] = []; //Variable que almacenará la información de los productos que se encontraron con base a lo esrcito
  materiasPrimas : any [] = []; //variable que almacenará la información de las materias primas
  unidadMedida : any [] = []; //Variable que almacenará la información de las presentaciones que tiene un producto
  categoriasMP : any = []; //Variable que almacenará la informacioón de las categorias de polietilenos
  categoriasTintas : any = []; //Variable que almacenará la información de las categorias de las tintas
  categoriasBOPP : any = []; //Variable que almacenará la infomración de las categorias de los biorientados
  materialesSeleccioados : any [] = []; //Variable que almacenará la información de los materiales que han sido seleccionados

  constructor(private AppComponent : AppComponent,
                private shepherdService: ShepherdService,
                  private msj : MensajesAplicacionService,
                    private frmBuilder : FormBuilder,
                      private prodMaterialesService : Productos_MateriasPrimasService,
                        private exisProdService : ExistenciasProductosService,
                          private undMedService : UnidadMedidaService,
                            private materiaPrimaService : MateriaPrimaService,
                              private tintasService : TintasService,
                                private boppService : EntradaBOPPService,
                                  private messageService: MessageService,) {

    this.modoSeleccionado = this.AppComponent.temaSeleccionado;

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
      Presentacion : ['Kg', Validators.required],
      Categoria : [null, Validators.required],
    });
  }

  ngOnInit() {
    this.lecturaStorage();
    this.consultarCategorias();
    this.obtenerMateriasPrimas();
    this.obtenerUnidadesMedida();
    setInterval(() => this.modoSeleccionado = this.AppComponent.temaSeleccionado, 1000);
  }

  tutorial(){
    this.shepherdService.defaultStepOptions = defaultStepOptions;
    this.shepherdService.modal = true;
    this.shepherdService.confirmCancel = false;
    this.shepherdService.addSteps(defaultSteps);
    this.shepherdService.start();
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

  // Funcion que va a limpiar todo el modulo
  limpiarTodo(){
    this.FormMateriales.reset();
    this.FormProductos.reset();
    this.materialesSeleccioados = [];
    this.edicion = false;
    this.cargando = false;
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
  obtenerMateriasPrimas = () => this.materiaPrimaService.GetMateriales_Receta().subscribe(data => this.materiasPrimas = data);

  // Funcion que va a consultas las unidades de medida
  obtenerUnidadesMedida = () => this.undMedService.srvObtenerLista().subscribe(data => this.unidadMedida = data.map(x => x.undMed_Id));

  // Funcion que va a consultar la información de una receta por medio de un producto y su presentación
  consultarReceta(){
    this.materialesSeleccioados = [];
    let prod : number = this.FormProductos.value.Id;
    let presentacion : string = this.FormProductos.value.Presentacion;
    this.prodMaterialesService.GetRecetaProducto(prod, presentacion).subscribe(data => {
      data.forEach(receta => {
        this.edicion = true;
        const datos : any = {
          Producto : receta.id_Producto,
          Presentacion_Producto : receta.presentacion_Producto,
          Existencia_Producto : receta.id_Existencia,
          Material : receta.id_Material,
          Materia_Prima : receta.id_MateriaPrima,
          Tinta : receta.id_Tinta,
          Bopp : receta.id_Bopp,
          Nombre : receta.nombre_Material,
          Cantidad_Minima : receta.cantidad,
          Presentacion_Material : receta.presentacion_Material,
          Id_Registro : receta.id_Registro,
        };
        if (this.categoriasMP.includes(receta.categoria_Material)) data.Materia_Prima = data.Material;
        else if (this.categoriasTintas.includes(receta.categoria_Material)) data.Tinta = data.Material;
        else if (this.categoriasBOPP.includes(receta.categoria_Material)) data.Bopp = data.Material;        
        this.materialesSeleccioados.push(datos);
      });
    }, err => this.msj.mensajeError(`${err.error}`));
  }

  //Funcion que va a mostrar el nombre de la materia prima
  cambiarNombreMateriaPrima(){
    let id : number = this.FormMateriales.value.Nombre;
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
    this.unidadMedida = this.productos.map(x => x.presentacion);
    setTimeout(() => {
      let id : number = this.FormProductos.value.Id;
      let nombre : number = this.FormProductos.value.Nombre;
      let und : string = this.FormProductos.value.Presentacion;
      this.FormProductos.patchValue({
        Id : this.productos.find(x => (x.id == id || x.id == nombre) && x.presentacion == und).id,
        Nombre : this.productos.find(x => (x.id == id || x.id == nombre) && x.presentacion == und).nombre,
        Id_Existencia : this.productos.find(x => (x.id == id || x.id == nombre) && x.presentacion == und).id_Existencia,
      });
      this.edicion = false;
      this.consultarReceta();
    }, 500);
  }

  // Funcion que va a encargarse de agregar los materiales seleccionados
  agregarMateriales(){
    if (this.FormProductos.valid) {
      if (!this.materialesSeleccioados.map(x => x.Material).includes(this.FormMateriales.value.Id)) {
        if (this.FormMateriales.value.Cantidad > 0) {
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
          this.limpiarFormMateriales(); 
          this.FormMateriales.patchValue({ Presentacion : 'Kg', });
        } else this.msj.mensajeAdvertencia(`¡La cantidad debe ser mayor a 0!`);
      } else this.msj.mensajeAdvertencia(`¡El material seleccionado ya se encuentra en la lista de materiales!`);
    } else this.msj.mensajeAdvertencia(`¡Debe seleccionar el producto al que se asociará la materia prima!`);
  }

  // Función para quitar un material de la tabla
  quitarMaterialTabla(data : any) {
    this.messageService.add({
      severity:'warn',
      key: 'quitarMaterial',
      summary:'¿Estás seguro de quitar el material?',
      detail:
      `<b>Material:</b> ${data.Material} <br> ` +
      `<b>Nombre:</b> ${data.Nombre} <br>` +
      `<b>Cantidad:</b> ${this.formatonumeros(data.Cantidad_Minima)} <br>`,
      sticky: true,
      data : data.Material
    });
  }

  // Funcion que va a encargarse de quitar los materiales seleccionados
  quitarMateriales(id : number){
    this.materialesSeleccioados.splice(this.materialesSeleccioados.findIndex(x => x.Material == id), 1);
    this.closeMessage('quitarMaterial');
  }

  // Función para eliminar un material de la tabla y de la base de datos
  eliminarMaterialTabla(data : any) {
    this.messageService.add({
      severity:'warn',
      key: 'eliminarMaterial',
      summary:'¿Estás seguro de eliminar el material?',
      detail:
      `<b>Material:</b> ${data.Material} <br> ` +
      `<b>Nombre:</b> ${data.Nombre} <br>` +
      `<b>Cantidad:</b> ${this.formatonumeros(data.Cantidad_Minima)} <br>
      <p><b>NOTA: ¡Al eliminar este material se eliminará el registro de la base de datos!</b></p>`,
      sticky: true,
      data : data
    });
  }
  
  // Funcion que va a eliminar un registro de la base de datos
  eliminarReceta(data : any){
    this.prodMaterialesService.Delete(data.Id_Registro).subscribe(() => {
      this.quitarMateriales(data.Material);
      this.closeMessage('eliminarMaterial');
      this.msj.mensajeConfirmacion('¡Se ha eliminado la materia prima de la receta!');
    }, () => this.msj.mensajeError('¡Ocurrió un error al eliminar el registro de la base de datos!'));
  }

  // Funcion que va a encargarse de guardar la información de la receta
  guardarReceta(){
    let count : number = 0;
    this.cargando = true;
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
      this.prodMaterialesService.GetExistenciaReceta(material.Producto, material.Presentacion_Producto, material.Material).subscribe(datos => {
        if (datos.length == 0) {
          this.prodMaterialesService.Post(data).subscribe(() => {
            count++;
            if (count == this.materialesSeleccioados.length) {
              this.msj.mensajeConfirmacion('¡Se ha registrado la receta con éxito!');
              this.limpiarTodo();
            }
          }, () => this.msj.mensajeError('¡No se ha podido registrar la receta!'), () => this.cargando = false);
        } else this.msj.mensajeError(`¡No se ingresó la materia prima ${material.Nombre} debido a que ya está registrada para el item ${material.Producto}!`);
      });
    });
  }

  // Funcion que va a actualizar una receta
  actualizarReceta(){
    let count : number = 0;
    this.materialesSeleccioados.forEach(material => {
      this.cargando = true;
      this.prodMaterialesService.GetExistenciaReceta(material.Producto, material.Presentacion_Producto, material.Material).subscribe(datos => {
        if (datos.length > 0) {
          const data : modelProducto_MatPrima = {
            Id: material.Id_Registro,
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
          this.prodMaterialesService.Put(material.Id_Registro, data).subscribe(null, () => this.msj.mensajeError('¡No se ha podido actualizar la receta!'), () => this.cargando = false);
        } else {
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
          this.prodMaterialesService.Post(data).subscribe(null, () => this.msj.mensajeError('¡No se ha podido registrar la receta!'), () => this.cargando = false);
        }
        count++;
        if (count == this.materialesSeleccioados.length) {
          this.msj.mensajeConfirmacion('¡Se ha actualizado la receta con éxito!');
          this.limpiarTodo();
        }
      });
    });
  }

  // Funcion que va limpiar el mensage de que le sea pasado
  closeMessage = (key : string) => this.messageService.clear(key);
}