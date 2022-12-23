import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import moment from 'moment';
import { ActivosService } from 'src/app/Servicios/Activos/Activos.service';
import { DesperdicioService } from 'src/app/Servicios/Desperdicio/desperdicio.service';
import { FallasTecnicasService } from 'src/app/Servicios/FallasTecnicas/FallasTecnicas.service';
import { MaterialProductoService } from 'src/app/Servicios/MaterialProducto/materialProducto.service';
import { ProcesosService } from 'src/app/Servicios/Procesos/procesos.service';
import { ProductoService } from 'src/app/Servicios/Productos/producto.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-Reporte_Desperdicios',
  templateUrl: './Reporte_Desperdicios.component.html',
  styleUrls: ['./Reporte_Desperdicios.component.css']
})
export class Reporte_DesperdiciosComponent implements OnInit {

  public formFiltros !: FormGroup; /** Formulario de filtros */
  public load: boolean = false; /** Variable que realizará la carga al momento de consultar */
  public arrayMateriales = []; /** array que contendrá los materiales de materia prima*/
  public arrayProductos = []; /** array que cargará los productos */
  public idProducto: any = 0; /**  */
  public arrayProcesos : any = [];
  public arrayMaquinas : any = [];
  public arrayFallas : any = [];
  public arrayConsulta : any =[];
  public today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  public arrayModal : any = [];
  public dialog : boolean = false;

  constructor(private formBuilder : FormBuilder,
    private servicioMateriales : MaterialProductoService,
    private servicioProductos : ProductoService,
    private servicioActivos : ActivosService,
    private servicioProcesos : ProcesosService,
    private servicioFallas : FallasTecnicasService,
    private servicioDesperdicios : DesperdicioService) {
    this.inicializarFormulario();
  }

  ngOnInit() {
    this.cargarMateriales();
    //this.cargarFallas();
    //this.cargarProcesos();
    //this.cargarMaquinas();
  }

  inicializarFormulario(){
    this.formFiltros = this.formBuilder.group({
      OT : [null],
      Producto : [null],
      productoId : [null],
      fechaInicio : [null],
      fechaFinal : [null],
      Material : [null],
      //Maquina : [null],
      //MaquinaId : [null],
      //Proceso : [null],
      //ProcesoId : [null],
      //FallaId : [null],
      //Falla : [null],
    });
  }

  cargarMateriales(){
    this.servicioMateriales.srvObtenerLista().subscribe(dataMateriales => {
      for (let index = 0; index < dataMateriales.length; index++) {
        if(dataMateriales[index].material_Id != 1) this.arrayMateriales.push(dataMateriales[index])
      }
    });
  }

  likeCargarProductos(){
    this.arrayProductos = [];
    let producto : any = this.formFiltros.value.Producto;

    if(producto != null) {
      this.servicioProductos.obtenerItemsLike(producto).subscribe(dataProducto => {
        for (let index = 0; index < dataProducto.length; index++) {
          this.arrayProductos.push(dataProducto[index]);
        }
      });
    }
  }

  cargarMaquinas(){
    this.arrayMaquinas = [];
    this.servicioActivos.GetTodo().subscribe(dataMaquinas => {
      for (let index = 0; index < dataMaquinas.length; index++) {
        if(dataMaquinas[index].tpActv_Id == 4) this.arrayMaquinas.push(dataMaquinas[index]);
      }
    })
  }

  cargarProcesos(){
    this.arrayProcesos =[];
    this.servicioProcesos.srvObtenerLista().subscribe(dataProcesos => {
      for (let index = 0; index < dataProcesos.length; index++) {
        this.arrayProcesos.push(dataProcesos[index]);
      }
    });
  }

  cargarFallas(){
    this.arrayFallas = [];
    this.servicioFallas.srvObtenerLista().subscribe(dataFallas => {
      for (let index = 0; index < dataFallas.length; index++) {
        if(dataFallas[index].tipoFalla_Id == 11) this.arrayFallas.push(dataFallas[index]);
      }
    });
  }

  seleccionarProducto() {
    let expresion : any = /^[0-9]*(\.?)[ 0-9]+$/;
    this.idProducto = this.formFiltros.value.Producto;

    if(this.idProducto.match(expresion) != null) {
      this.servicioProductos.obtenerNombreProductos(this.formFiltros.value.Producto).subscribe(dataProducto => {
        this.initForm_SeleccionProducto(dataProducto);
      });
    } else {
      this.advertencia('Debe cargar un Item válido.');
      this.idProducto = 0;
    }
  }

  initForm_SeleccionProducto(nombreProducto : any){
    this.formFiltros.setValue({
      OT : this.formFiltros.value.OT,
      fechaInicio : this.formFiltros.value.fechaInicio,
      fechaFinal : this.formFiltros.value.fechaFinal,
      productoId : this.idProducto,
      Producto: nombreProducto,
      Material : this.formFiltros.value.Material,
      ProcesoId : this.formFiltros.value.ProcesoId,
      Proceso : this.formFiltros.value.Proceso,
      MaquinaId : this.formFiltros.value.MaquinaId,
      Maquina : this.formFiltros.value.Maquina,
      FallaId : this.formFiltros.value.FallaId,
      Falla : this.formFiltros.value.Falla,
    });
  }

  seleccionarMaquina() {
    this.servicioActivos.GetId(this.formFiltros.value.Maquina).subscribe(dataMaquina => {
      console.log(dataMaquina);
      this.initForm_SeleccionMaquina(dataMaquina);
    });
  }

  initForm_SeleccionMaquina(dataMaquina : any){
    this.formFiltros.setValue({
      OT : this.formFiltros.value.OT,
      fechaInicio : this.formFiltros.value.fechaInicio,
      fechaFinal : this.formFiltros.value.fechaFinal,
      Producto: this.formFiltros.value.Producto,
      productoId : this.formFiltros.value.Producto,
      Material : this.formFiltros.value.Material,
      ProcesoId : this.formFiltros.value.ProcesoId,
      Proceso : this.formFiltros.value.Proceso,
      MaquinaId : dataMaquina.actv_Id,
      Maquina : dataMaquina.actv_Serial,
      FallaId : this.formFiltros.value.FallaId,
      Falla : this.formFiltros.value.Falla,
    });
  }
/*
  seleccionarProceso() {
    this.servicioProcesos.srvObtenerListaPorId(this.formFiltros.value.Proceso).subscribe(dataProceso => {
      console.log(dataProceso);
      this.initForm_SeleccionProceso(dataProceso);
    });
  }

  initForm_SeleccionProceso(dataProceso : any){
    this.formFiltros.setValue({
      OT : this.formFiltros.value.OT,
      fechaInicio : this.formFiltros.value.fechaInicio,
      fechaFinal : this.formFiltros.value.fechaFinal,
      Producto: this.formFiltros.value.Producto,
      productoId : this.formFiltros.value.Producto,
      Material : this.formFiltros.value.Material,
      ProcesoId : dataProceso.proceso_Id,
      Proceso : dataProceso.proceso_Nombre,
      MaquinaId : this.formFiltros.value.MaquinaId,
      Maquina : this.formFiltros.value.Maquina,
      FallaId : this.formFiltros.value.FallaId,
      Falla : this.formFiltros.value.Falla,
    });
  }

  seleccionarFalla(){
    this.servicioFallas.srvObtenerListaPorId(this.formFiltros.value.Falla).subscribe(dataFalla => {
      console.log(dataFalla);
      this.initForm_SeleccionFalla(dataFalla);
    });
  }

  initForm_SeleccionFalla(dataFalla : any){
    this.formFiltros.setValue({
      OT : this.formFiltros.value.OT,
      fechaInicio : this.formFiltros.value.fechaInicio,
      fechaFinal : this.formFiltros.value.fechaFinal,
      Producto: this.formFiltros.value.Producto,
      productoId : this.formFiltros.value.Producto,
      Material : this.formFiltros.value.Material,
      ProcesoId : this.formFiltros.value.ProcesoId,
      Proceso : this.formFiltros.value.Proceso,
      MaquinaId : this.formFiltros.value.MaquinaId,
      Maquina : this.formFiltros.value.Maquina,
      FallaId : dataFalla.falla_Id,
      Falla : dataFalla.falla_Nombre,
    });
  }
*/
  Consultar() {
    //this.load = false;
    let OT : number = this.formFiltros.value.OT;
    let fecha1 : number = this.formFiltros.value.fechaInicio
    let fecha2 : number = this.formFiltros.value.fechaFinal
    let material : number = this.formFiltros.value.Material
    let item : number = this.formFiltros.value.Producto
    this.arrayConsulta = [];
    let ruta : string = '';


    if(fecha1 == null) fecha1 = this.today;
    if(fecha2 == null) fecha2 = fecha1;

    if (OT != null && material != null && item != null) {
      ruta = `?OT=${OT}&material=${material}&item=${item}`;
    } else if (OT != null && material != null) {
      ruta = `?OT=${OT}&material=${material}`;
    } else if (OT != null && item != null) {
      ruta = `?OT=${OT}&item=${item}`;
    } else if (material != null && item != null) {
      ruta = `?material=${material}&item=${item}`;
    } else if (OT != null) {
      ruta = `?OT=${OT}`;
    } else if (item != null) {
      ruta = `?item=${item}`;
    } else if (material != null) {
      ruta = `?material=${material}`;
    } else {
      ruta = ``;
    }

    this.servicioDesperdicios.getDesperdicio(fecha1, fecha2, ruta).subscribe(dataDesperdicios => {
      for (let index = 0; index < dataDesperdicios.length; index++) {
        if(dataDesperdicios.length == 0) this.advertencia('¡No se encontraron resultados de búsqueda con los filtros consultados!');
        else this.llenarTabla(dataDesperdicios[index]);
      }
    });

    //setTimeout(() => {this.load = true; }, 1000);
  }

  llenarTabla(datos : any) {
    const registro : any = {
    OT : datos.ot,
    Item : datos.item,
    NombreItem : datos.nombreItem,
    NombreMaterial : datos.material,
    Impreso : datos.impreso,
    PesoTotal : datos.pesoTotal,
    Presentacion : 'Kg'
    }
    this.arrayConsulta.push(registro);
  }

  consultarOTenTabla(item : any){
    this.servicioDesperdicios.getDesperdicioxOT(item.OT).subscribe(dataDesperdicios => {
      for (let index = 0; index < dataDesperdicios.length; index++) {
        this.llenarModal(dataDesperdicios[index]);
      }
    });
  }

  llenarModal(datos : any){
    this.dialog = true;
    const dataCompleta : any = {
      Id : datos.desp_Id,
      OT : datos.desp_OT,
      Item : datos.prod_Id,
      NombreItem : datos.prod_Nombre,
      Peso : datos.desp_PesoKg,
      IdProceso: datos.proceso_Id,
      NombreProceso : datos.proceso_Nombre,
      IdMaterial : datos.material_Id,
      NombreMaterial : datos.material_Nombre,
      IdFalla : datos.dalla_Id,
      NombreFalla : datos.falla_Nombre,
      Impreso : datos.desp_Impresion,
      Maquina : datos.actv_Id,
      NombreMaquina : datos.actv_Nombre,
      SerialMaquina : datos.actv_Serial,
      IdOperario : datos.usua_Operario,
      NombreOperario : datos.operario,
      IdUsuario : datos.usua_Id,
      NombreUsuario : datos.usuario,
      Fecha : datos.desp_Fecha,
      Observacion : datos.desp_Observacion,
      FechaIngreso : datos.desp_FechaRegistro,
      HoraIngreso : datos.desp_HoraRegistro
    }
    this.arrayModal.push(dataCompleta);
  }

  limpiarCampos(){
    this.formFiltros.reset();
  }

  advertencia(mensaje : string){
    Swal.fire({icon: 'warning',  title: 'Advertencia', text: mensaje, confirmButtonColor: '#ffc107', });
  }

}















//Id : datos.desp_Id,
/*OT : datos.desp_OT,
Item : datos.prod_Id,
NombreItem : datos.prod_Nombre,
//Peso : datos.desp_PesoKg,
IdProceso: datos.proceso_Id,
NombreProceso : datos.proceso_Nombre,
IdMaterial : datos.material_Id,
NombreMaterial : datos.material_Nombre,
//IdFalla : datos.dalla_Id,
//NombreFalla : datos.falla_Nombre,
Impreso : datos.desp_Impresion,
//Maquina : datos.actv_Id,*/
//NombreMaquina : datos.actv_Nombre,
//SerialMaquina : datos.actv_Serial,
//IdOperario : datos.usua_Operario,
//NombreOperario : datos.operario,
//IdUsuario : datos.usua_Id,
//NombreUsuario : datos.usuario,
//Fecha : datos.desp_Fecha,
//Observacion : datos.desp_Observacion,
//FechaIngreso : datos.desp_FechaRegistro,
//HoraIngreso : datos.desp_HoraRegistro
