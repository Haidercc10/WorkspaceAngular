import { Component, Injectable, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShepherdService } from 'angular-shepherd';
import moment from 'moment';
import pdfMake from 'pdfmake/build/pdfmake';
import { MessageService } from 'primeng/api';
import { modelDetallesOrdenMaquila } from 'src/app/Modelo/modelDetallesOrdenMaquila';
import { modelEntradas_Salidas_MP } from 'src/app/Modelo/modelEntradas_Salidas_MP';
import { modelOrdenMaquila } from 'src/app/Modelo/modelOrdenMaquila';
import { modeloMovimientos_Entradas_MP } from 'src/app/Modelo/modeloMovimientos_Entradas_MP';
import { EntradaBOPPService } from 'src/app/Servicios/BOPP/entrada-BOPP.service';
import { DetalleOrdenMaquilaService } from 'src/app/Servicios/DetalleOrdenMaquila/DetalleOrdenMaquila.service';
import { Entradas_Salidas_MPService } from 'src/app/Servicios/Entradas_Salidas_MP/Entradas_Salidas_MP.service';
import { MateriaPrimaService } from 'src/app/Servicios/MateriaPrima/materiaPrima.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { Movimientos_Entradas_MPService } from 'src/app/Servicios/Movimientos_Entradas_MP/Movimientos_Entradas_MP.service';
import { Orden_MaquilaService } from 'src/app/Servicios/Orden_Maquila/Orden_Maquila.service';
import { TercerosService } from 'src/app/Servicios/Terceros/Terceros.service';
import { TintasService } from 'src/app/Servicios/Tintas/tintas.service';
import { UnidadMedidaService } from 'src/app/Servicios/UnidadMedida/unidad-medida.service';
import { AppComponent } from 'src/app/app.component';
import { defaultStepOptions, stepsOrdenMaquila as defaultSteps } from 'src/app/data';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-Orden_Maquila',
  templateUrl: './Orden_Maquila.component.html',
  styleUrls: ['./Orden_Maquila.component.css']
})

export class Orden_MaquilaComponent implements OnInit {

  FormOrdenMaquila : FormGroup; //Formulario principal
  FormMateriaPrima : FormGroup; //Formulario de Materia Prima
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  cargando : boolean = false; //Variable para validar que aparezca o no el icono de carga
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  terceros : any [] = []; //Variable que se llenará con la información de los terceros a los que se les entregará la materia prima
  materiaPrima : any [] = []; //Variable que almacenará las materias primas
  unidadesMedida : any [] = []; //Variable que va a almacenar las unidades de medida
  materiasPrimasSeleccionadas : any [] = []; //Variable que almacenará las materias primas que son escogidas para la orden de compra
  categoriasMP : any [] = []; //Variable que almcanará las categorias de la tabla Materia_Prima
  categoriasTintas : any [] = []; //Variable que almcanará las categorias de la tabla Tintas
  categoriasBOPP : any [] = []; //Variable que almcanará las categorias de la tabla BOPP
  modalCreacionTerceros : boolean = false; //Variable que servirá para validar cuando se muestra el modal de creación de terceros o no
  edidcionOrdenMaquila : boolean = false; //Variable que servirá para validar cuando se está creado una orden y cuando se está editando
  informacionPDF : any [] = []; //Variable que tendrá la informacion de la materia prima pedida en la orden de maquila
  llave : string = 'pdf'; /** Variable que se utilizará como palabra clave para cargar el mensaje de Ver Pdf/Quitar MP/Eliminar MP de la tabla*/
  itemSeleccionado : any; /** Variable que tomará diferentes valores, generalmente id para mostrar el pdf o id del item a quitar o eliminar de la tabla. */
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  hora : any = moment().format('H:mm:ss'); //Variable que se usará para llenar la hora actual

  constructor(private frmBuilder : FormBuilder,
                private AppComponent : AppComponent,
                  private materiaPrimaService : MateriaPrimaService,
                    private tintasService : TintasService,
                      private boppService : EntradaBOPPService,
                        private undMedidaService : UnidadMedidaService,
                          private terceroService : TercerosService,
                            private ordenMaquilaService : Orden_MaquilaService,
                              private dtOrdenMaquilaService : DetalleOrdenMaquilaService,
                                private messageService: MessageService,
                                  private shepherdService: ShepherdService,
                                    private msj : MensajesAplicacionService,
                                      private srvMovEntradasMP : Movimientos_Entradas_MPService,
                                        private srvMovSalidasMP : Entradas_Salidas_MPService) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
    this.FormOrdenMaquila = this.frmBuilder.group({
      ConsecutivoOrden : ['', Validators.required],
      Tercero : ['', Validators.required],
      Id_Tercero : [''],
      Observacion : [''],
    });

    this.FormMateriaPrima = this.frmBuilder.group({
      Id : [null, Validators.required],
      Nombre : [null, Validators.required],
      Cantidad : [null, Validators.required],
      UndMedida : [null, Validators.required],
      Precio : [null, Validators.required],
      PrecioOculto : [null, Validators.required],
      Categoria : [null, Validators.required],
      Stock : [null, Validators.required],
    });
  }

  ngOnInit() {
    this.lecturaStorage();
    this.obtenerMateriaPrima();
    this.consultarCategorias();
    this.obtenerUnidadesMedida();
    this.generarConsecutivo();
    this.llave = 'pdf';
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = '$1,';
    return number.toString().replace(exp,rep);
  }

  // Generar Consecutivo de Orden de Compra
  generarConsecutivo(){
    this.ordenMaquilaService.GetUltimoId().subscribe(num => this.FormOrdenMaquila.patchValue({ConsecutivoOrden : num + 1}), () => this.FormOrdenMaquila.patchValue({ConsecutivoOrden : 1}));
  }

  // Funcion que limpiará todos los campos de la vista
  limpiarTodo(){
    this.FormMateriaPrima.reset();
    this.FormOrdenMaquila.reset();
    this.materiasPrimasSeleccionadas = [];
    this.cargando = false;
    this.edidcionOrdenMaquila = false;
    this.generarConsecutivo();
    this.onReject();
    this.llave = 'pdf';
  }

  // Funcion que va a limpiar los campos de materia prima
  limpiarCamposMateriaPrima = () => this.FormMateriaPrima.reset();

  // Funcion que va a consultar las categorias de las tablas Materia_Prima, Tintas y BOPP
  consultarCategorias(){
    this.materiaPrimaService.GetCategoriasMateriaPrima().subscribe(datos => this.categoriasMP = datos);
    this.tintasService.GetCategoriasTintas().subscribe(datos => this.categoriasTintas = datos);
    this.boppService.GetCategoriasBOPP().subscribe(datos => this.categoriasBOPP = datos);
  }

  //Funcion que va a consultar los proveedores por el nombre que esten escribiendo en el campo de proveedor
  consultarTercero(){
    let nombre : string = this.FormOrdenMaquila.value.Tercero.trim();
    if (nombre != '') this.terceroService.getTerceroLike(nombre).subscribe(data => this.terceros = data);
  }

  // Funcion que le va a cambiar el nombre al proveedor
  cambiarNombreTercero(){
    let nuevo : any [] = this.terceros.filter((item) => item.tercero_Id == this.FormOrdenMaquila.value.Tercero);
    this.FormOrdenMaquila.patchValue({
      Tercero : nuevo[0].tercero_Nombre,
      Id_Tercero : nuevo[0].tercero_Id,
    });
  }

  // Funcion que va a consultar la materia prima
  obtenerMateriaPrima(){
    this.materiaPrimaService.GetInfo_MPTintasBOPP().subscribe(datos_materiaPrimas => {
      this.materiaPrima = datos_materiaPrimas;
      this.materiaPrima.sort((a,b) => a.nombre.localeCompare(b.nombre));
    });
  }

  // Funcion que va a consultar las unidades de medida
  obtenerUnidadesMedida = () => this.undMedidaService.srvObtenerLista().subscribe(datos_undMedida => this.unidadesMedida = datos_undMedida);

  // Funcion que va a buscar la informacion de una orden de maquila creada
  buscarOrdenMaquila(){
    let id : number = this.FormOrdenMaquila.value.ConsecutivoOrden;
    this.dtOrdenMaquilaService.getInfoOrdenMaquila_Id(id).subscribe(datos_Orden => {
      if (datos_Orden.length > 0) {
        this.FormMateriaPrima.reset();
        this.FormOrdenMaquila.reset();
        this.materiasPrimasSeleccionadas = [];
        this.cargando = false;
        this.edidcionOrdenMaquila = true;
        for (let i = 0; i < datos_Orden.length; i++) {
          this.FormOrdenMaquila.patchValue({
            ConsecutivoOrden : id,
            Tercero : datos_Orden[i].tercero,
            Id_Tercero : datos_Orden[i].tercero_Id,
            Observacion : datos_Orden[i].observacion,
          });

          let info : any = {
            Id : 0,
            Id_Mp: datos_Orden[i].mP_Id,
            Id_Tinta: datos_Orden[i].tinta_Id,
            Id_Bopp: datos_Orden[i].bopp_Id,
            Nombre : '',
            Cantidad : datos_Orden[i].cantidad,
            Und_Medida : datos_Orden[i].und_Medida,
            Precio : datos_Orden[i].precio,
            SubTotal : (datos_Orden[i].cantidad * datos_Orden[i].precio),
          }
          if (info.Id_Tinta != 2001) {
            info.Id = info.Id_Tinta;
            info.Nombre = datos_Orden[i].tinta;
          } else if (info.Id_Mp != 84) {
            info.Id = info.Id_Mp;
            info.Nombre = datos_Orden[i].mp;
          } else if (info.Id_Bopp != 449) {
            info.Id = info.Id_Bopp;
            info.Nombre = datos_Orden[i].bopp;
          }
          this.materiasPrimasSeleccionadas.push(info);
        }
      } else this.msj.mensajeAdvertencia(`No se ha encontrado la orden de maquila N° ${id}`);
    });
  }

  // 
  catidadTotalPeso = () => this.materiasPrimasSeleccionadas.reduce((a,b) => a + b.Cantidad, 0);

  // 
  cantidadTotalPrecio = () => this.materiasPrimasSeleccionadas.reduce((a,b) => a + b.SubTotal, 0)

  //Funcion que va a mostrar el nombre de la materia prima
  cambiarNombreMateriaPrima(){
    this.materiaPrimaService.getInfo_MpTintaBopp_Id(this.FormMateriaPrima.value.Nombre).subscribe(datos_materiaPrima => {
      for (let i = 0; i < datos_materiaPrima.length; i++) {
        this.FormMateriaPrima.patchValue({
          Id : datos_materiaPrima[i].id,
          Nombre : datos_materiaPrima[i].nombre,
          Cantidad : 0,
          UndMedida : datos_materiaPrima[i].undMedida,
          Precio : this.formatonumeros(parseFloat(datos_materiaPrima[i].precio).toFixed(2)),
          PrecioOculto : parseFloat(datos_materiaPrima[i].precio).toFixed(2),
          Categoria : datos_materiaPrima[i].categoria,
          Stock : datos_materiaPrima[i].stock,
        });
      }
    }, () => { this.msj.mensajeError(`Error`, `¡No se pudo obtener información sobre la materia prima seleccionada!`); });
  }

  // Funcion que va a añadir la materia prima a la tabla
  cargarMateriaPrima(){
    let categoria : number = this.FormMateriaPrima.value.Categoria;
    if (this.FormMateriaPrima.valid){
      if (!this.materiasPrimasSeleccionadas.map(x => x.Id).includes(this.FormMateriaPrima.value.Id)) {
        if (this.FormMateriaPrima.value.Cantidad > 0){
          if (this.FormMateriaPrima.value.Cantidad <= this.FormMateriaPrima.value.Stock) {
            let info : any = {
              Id : this.FormMateriaPrima.value.Id,
              Id_Mp: 84,
              Id_Tinta: 2001,
              Id_Bopp: 449,
              Nombre : this.FormMateriaPrima.value.Nombre,
              Cantidad : this.FormMateriaPrima.value.Cantidad,
              Cantidad2 : this.FormMateriaPrima.value.Cantidad,
              Und_Medida : this.FormMateriaPrima.value.UndMedida,
              Precio : this.FormMateriaPrima.value.PrecioOculto,
              SubTotal : (this.FormMateriaPrima.value.Cantidad * this.FormMateriaPrima.value.PrecioOculto),
            }
            if (this.categoriasTintas.includes(categoria)) info.Id_Tinta = info.Id;
            else if (this.categoriasMP.includes(categoria)) info.Id_Mp = info.Id;
            else if (this.categoriasBOPP.includes(categoria)) info.Id_Bopp = info.Id;
            this.materiasPrimasSeleccionadas.push(info);
            this.FormMateriaPrima.reset();
          } else this.msj.mensajeAdvertencia(`Advertencia`, `¡La cantidad a entegar es superior a la cantidad en stock!`);
        } else this.msj.mensajeAdvertencia(`Advertencia`, `¡La cantidad de la materia prima seleccionada debe ser mayor que 0!`);
      } else this.msj.mensajeAdvertencia(`Advertencia`, `¡La materia prima '${this.FormMateriaPrima.value.Nombre}' ya fue seleccionada previamante!`);
    } else this.msj.mensajeAdvertencia(`Advertencia`, `Debe llenar los campos vacios!`);
  }

  // Funcion que va a quitar la materia prima
  quitarMateriaPrima(){
    let data = this.itemSeleccionado;
    this.onReject();
    this.materiasPrimasSeleccionadas.splice(this.materiasPrimasSeleccionadas.findIndex(x => x.Id == data.Id), 1);
    this.msj.mensajeConfirmacion(`Confirmación`, `Se ha quitado la materia Prima ${data.Nombre} de la tabla`);
    this.llave = 'pdf';
  }

  // Funcion que va a elminar de la base de datos una de las materias primas, bopp, tintas escogidas al momento de editar la orden de compra
  eliminarMateriaPrima(){
    let data = this.itemSeleccionado;
    setTimeout(() => {
      this.dtOrdenMaquilaService.getMateriaPrimaOrdenMaquila(this.FormOrdenMaquila.value.ConsecutivoOrden, data.Id).subscribe(codigo => {
        this.dtOrdenMaquilaService.delete(codigo).subscribe(() => {
          this.materiasPrimasSeleccionadas.filter(x => x.Id == data.Id).forEach(x => {
            this.sumarMateriaPrima(x.Id_Mp, x.Cantidad);
            this.sumarTinta(x.Id_Tinta,x.Cantidad);
            this.sumarBopp(x.Id_Bopp, x.Cantidad);
            this.quitarMateriaPrima();
            this.onReject();
            this.llave = 'pdf';
          });
        });
      }, () => this.quitarMateriaPrima());
    }, 100);
  }

  // Funcion que va a validar que los campos necesarios esten llenos para crear la Orden de Maquila
  validarDatosOrdenMaquila(){
    if (this.FormOrdenMaquila.valid) {
      if (this.materiasPrimasSeleccionadas.length > 0) {
        !this.edidcionOrdenMaquila ? this.crearOrdenMaquila() : this.editarOrdenMaquila();
      } else this.msj.mensajeAdvertencia(`Advertencia`, `¡Debe escoger minimo una materia prima!`);
    } else this.msj.mensajeAdvertencia(`Advertencia`, `¡Debe llenar los campos vacios!`);
  }

  // Funcion que va a crear una Orden de Maquila
  crearOrdenMaquila(){
    this.cargando = true;
    let info : modelOrdenMaquila = {
      Tercero_Id : this.FormOrdenMaquila.value.Id_Tercero,
      OM_ValorTotal : this.cantidadTotalPrecio(),
      OM_PesoTotal : this.catidadTotalPeso(),
      OM_Observacion : this.FormOrdenMaquila.value.Observacion == null ? '' : (this.FormOrdenMaquila.value.Observacion).toUpperCase(),
      TpDoc_Id : 'OM',
      Estado_Id : 11,
      Usua_Id : this.storage_Id,
      OM_Fecha : moment().format('YYYY-MM-DD'),
      OM_Hora : moment().format("H:mm:ss"),
    }
    this.ordenMaquilaService.insert(info).subscribe(datos_ordenMaquila => this.crearDtOrdenMaquila(datos_ordenMaquila.oM_Id), () => {
      this.cargando = false;
      this.msj.mensajeError(`Error`, `¡Ocurrió un error al crear la orden de maquila!`);
    });
  }

  // Funcion que va a crear en la base de datos los detalles de la Orden de Maquila
  crearDtOrdenMaquila(id : number){
    let count : number = 0;
    this.materiasPrimasSeleccionadas.forEach(material => {
      let info : modelDetallesOrdenMaquila = {
        OM_Id : id,
        MatPri_Id : material.Id_Mp,
        Tinta_Id : material.Id_Tinta,
        BOPP_Id : material.Id_Bopp,
        DtOM_Cantidad : material.Cantidad,
        UndMed_Id : material.Und_Medida,
        DtOM_PrecioUnitario : parseFloat(material.Precio),
      }
      this.restarMateriaPrima(material.Id_Mp, material.Cantidad);
      this.restarTinta(material.Id_Tinta, material.Cantidad);
      this.restarBopp(material.Id_Bopp, material.Cantidad);
      this.dtOrdenMaquilaService.insert(info).subscribe(() => {
        count ++;
        if (count == this.materiasPrimasSeleccionadas.length) {
          this.itemSeleccionado = id;
          this.mostrarEleccion(`pdf`, id, );
          this.actualizarMovimientosEntradasMP(id);
          setTimeout(() => this.limpiarTodo(), 2000);
        }
      }, () => {
        this.cargando = false;
        this.msj.mensajeError(`Error`, `¡Ocurrió un error al guardar los detalles de la orden de maquila!`);
      });
    });
  }

  // Funcion que va a editar un orden de maquila
  editarOrdenMaquila(){
    this.cargando = true;
    let id : number = this.FormOrdenMaquila.value.ConsecutivoOrden;
    let info : any = {
      OM_Id : id,
      Tercero_Id : this.FormOrdenMaquila.value.Id_Tercero,
      OM_ValorTotal : this.cantidadTotalPrecio(),
      OM_PesoTotal : this.catidadTotalPeso(),
      OM_Observacion : this.FormOrdenMaquila.value.Observacion == null ? '' : (this.FormOrdenMaquila.value.Observacion).toUpperCase(),
      TpDoc_Id : 'OM',
      Estado_Id : 11,
      Usua_Id : this.storage_Id,
      OM_Fecha : moment().format('YYYY-MM-DD'),
      OM_Hora : moment().format("H:mm:ss"),
    }
    this.ordenMaquilaService.put(id, info).subscribe(() => this.editarDtOrdenMaquila(), () => {
      this.cargando = false;
      this.msj.mensajeError(`Error`, `¡Ocurrió un error al Editar la Orden de Maquila!`);
    });
  }

  // Funcion que va a crear en la base de datos los detalles de la Orden de Maquila
  editarDtOrdenMaquila(){
    let id : number = this.FormOrdenMaquila.value.ConsecutivoOrden;
    let count : number = 0;
    this.materiasPrimasSeleccionadas.forEach(material => {
      count ++;
      this.dtOrdenMaquilaService.getMateriaPrimaOrdenMaquila(id, material.Id).subscribe(null, () => {
        let info : modelDetallesOrdenMaquila = {
          OM_Id : id,
          MatPri_Id : material.Id_Mp,
          Tinta_Id : material.Id_Tinta,
          BOPP_Id : material.Id_Bopp,
          DtOM_Cantidad : material.Cantidad,
          UndMed_Id : material.Und_Medida,
          DtOM_PrecioUnitario : parseFloat(material.Precio),
        }
        this.restarMateriaPrima(material.Id_Mp, material.Cantidad);
        this.restarTinta(material.Id_Tinta, material.Cantidad);
        this.restarBopp(material.Id_Bopp, material.Cantidad);
        this.dtOrdenMaquilaService.insert(info).subscribe(() => null, () => {
          this.cargando = false;
          this.msj.mensajeError(`Error`, `¡Ocurrió un error al editar los detalles de la orden de maquila!`);
        });
      });
      if (count == this.materiasPrimasSeleccionadas.length) {
        this.itemSeleccionado = id;
        this.mostrarEleccion(`pdf`, id);
        this.actualizarMovimientosEntradasMP(id);
        setTimeout(() => this.limpiarTodo(), 2000);
      }
    });
  }

  // Funcion que va a restar del inventario de materia prima
  restarMateriaPrima(id : number, cantidad : number){
    if (id != 84) {
      this.materiaPrimaService.srvObtenerListaPorId(id).subscribe(datos => {
        let info : any = {
          MatPri_Id : datos.matPri_Id,
          MatPri_Nombre: datos.matPri_Nombre,
          MatPri_Descripcion: datos.matPri_Descripcion,
          MatPri_Stock : datos.matPri_Stock - cantidad,
          UndMed_Id: datos.undMed_Id,
          CatMP_Id: datos.catMP_Id,
          MatPri_Precio: datos.matPri_Precio,
          TpBod_Id: datos.tpBod_Id,
          MatPri_Fecha : datos.matPri_Fecha,
          MatPri_Hora : datos.matPri_Hora,
        }
        this.materiaPrimaService.srvActualizar(id, info).subscribe(null, () => this.msj.mensajeError(`¡No se pudo actualizar el inventario de la materia prima ${datos.matPri_Nombre}!`));
      });
    }
  }

  // Funcion que va a restar del inventario de tintas
  restarTinta(id : number, cantidad : number){
    if (id != 2001) {
      this.tintasService.srvObtenerListaPorId(id).subscribe(datos => {
        let info : any = {
          Tinta_Id: datos.tinta_Id,
          Tinta_Nombre: datos.tinta_Nombre,
          Tinta_Descripcion: datos.tinta_Descripcion,
          Tinta_CodigoHexadecimal : datos.tinta_CodigoHexadecimal,
          Tinta_Stock: (datos.tinta_Stock - cantidad),
          UndMed_Id : datos.undMed_Id,
          Tinta_Precio: datos.tinta_Precio,
          CatMP_Id : datos.catMP_Id,
          TpBod_Id : datos.tpBod_Id,
          Tinta_InvInicial : datos.tinta_InvInicial,
          tinta_FechaIngreso : datos.tinta_FechaIngreso,
          tinta_Hora : datos.tinta_Hora,
        }
        this.tintasService.srvActualizar(id, info).subscribe(null, () => this.msj.mensajeError(`¡No se pudo actualizar el inventario de la tinta ${datos.tinta_Nombre}!`));
      });
    }
  }

  // Funcion que va a restar del inventario de  bopp
  restarBopp(id : number, cantidad : number){
    if (id != 449) {
      this.boppService.srvObtenerListaPorId(id).subscribe(datos => {
        let info : any = {
          BOPP_Id: datos.bopP_Id,
          BOPP_Nombre: datos.bopP_Nombre,
          BOPP_Descripcion: datos.bopP_Descripcion,
          BOPP_Serial: datos.bopP_Seria,
          BOPP_CantidadMicras: datos.bopP_CantidadMicras,
          undMed_Id: datos.undMed_Id,
          catMP_Id: datos.catMP_Id,
          bopP_Precio: datos.bopP_Precio,
          tpBod_Id: datos.tpBod_Id,
          bopP_FechaIngreso: datos.bopP_FechaIngreso,
          bopP_Hora: datos.bopP_Hora,
          bopP_Ancho: datos.bopP_Ancho,
          bopP_Stock: (datos.bopP_Stock - cantidad),
          undMed_Kg: datos.undMed_Kg,
          bopP_CantidadInicialKg: datos.bopP_CantidadInicialKg,
          usua_Id: datos.usua_Id,
          boppGen_Id : datos.boppGen_Id,
          bopP_CodigoDoc: datos.bopP_CodigoDoc,
          bopP_TipoDoc: datos.bopP_TipoDoc,
        }
        this.boppService.srvActualizar(id, info).subscribe(null, () => this.msj.mensajeError(`¡No se pudo actualizar el inventario del biorientado ${datos.bopP_Descripcion}!`));
      });
    }
  }

  // Funcion que va a sumar del inventario de materia prima
  sumarMateriaPrima(id : number, cantidad : number){
    if (id != 84) {
      this.materiaPrimaService.srvObtenerListaPorId(id).subscribe(datos => {
        let info : any = {
          MatPri_Id : datos.matPri_Id,
          MatPri_Nombre: datos.matPri_Nombre,
          MatPri_Descripcion: datos.matPri_Descripcion,
          MatPri_Stock : datos.matPri_Stock + cantidad,
          UndMed_Id: datos.undMed_Id,
          CatMP_Id: datos.catMP_Id,
          MatPri_Precio: datos.matPri_Precio,
          TpBod_Id: datos.tpBod_Id,
          MatPri_Fecha : datos.matPri_Fecha,
          MatPri_Hora : datos.matPri_Hora,
        }
        this.materiaPrimaService.srvActualizar(id, info).subscribe(null, () => this.msj.mensajeError(`¡No se pudo actualizar el inventario de la materia prima ${datos.matPri_Nombre}!`));
      });
    }
  }

  // Funcion que va a sumar del inventario de tintas
  sumarTinta(id : number, cantidad : number){
    if (id != 2001) {
      this.tintasService.srvObtenerListaPorId(id).subscribe(datos => {
        let info : any = {
          Tinta_Id: datos.tinta_Id,
          Tinta_Nombre: datos.tinta_Nombre,
          Tinta_Descripcion: datos.tinta_Descripcion,
          Tinta_CodigoHexadecimal : datos.tinta_CodigoHexadecimal,
          Tinta_Stock: (datos.tinta_Stock + cantidad),
          UndMed_Id : datos.undMed_Id,
          Tinta_Precio: datos.tinta_Precio,
          CatMP_Id : datos.catMP_Id,
          TpBod_Id : datos.tpBod_Id,
          Tinta_InvInicial : datos.tinta_InvInicial,
          tinta_FechaIngreso : datos.tinta_FechaIngreso,
          tinta_Hora : datos.tinta_Hora,
        }
        this.tintasService.srvActualizar(id, info).subscribe(null, () => this.msj.mensajeError(`¡No se pudo actualizar el inventario de la tinta ${datos.tinta_Nombre}!`));
      });
    }
  }

  // Funcion que va a sumar del inventario de  bopp
  sumarBopp(id : number, cantidad : number){
    if (id != 449) {
      this.boppService.srvObtenerListaPorId(id).subscribe(datos => {
        let info : any = {
          BOPP_Id: datos.bopP_Id,
          BOPP_Nombre: datos.bopP_Nombre,
          BOPP_Descripcion: datos.bopP_Descripcion,
          BOPP_Serial: datos.bopP_Seria,
          BOPP_CantidadMicras: datos.bopP_CantidadMicras,
          undMed_Id: datos.undMed_Id,
          catMP_Id: datos.catMP_Id,
          bopP_Precio: datos.bopP_Precio,
          tpBod_Id: datos.tpBod_Id,
          bopP_FechaIngreso: datos.bopP_FechaIngreso,
          bopP_Hora: datos.bopP_Hora,
          bopP_Ancho: datos.bopP_Ancho,
          bopP_Stock: (datos.bopP_Stock + cantidad),
          undMed_Kg: datos.undMed_Kg,
          bopP_CantidadInicialKg: datos.bopP_CantidadInicialKg,
          usua_Id: datos.usua_Id,
          boppGen_Id : datos.boppGen_Id,
          bopP_CodigoDoc: datos.bopP_CodigoDoc,
          bopP_TipoDoc: datos.bopP_TipoDoc,
        }
        this.boppService.srvActualizar(id, info).subscribe(null, () => this.msj.mensajeError(`¡No se pudo actualizar el inventario del biorientado ${datos.bopP_Descripcion}!`));
      });
    }
  }

  // Funcion que va a consultar la informacion de la Orden de maquila creada, información que se usará para crear un PDF
  buscarInfoOrdenMaquila(id : number){
    this.onReject();
    this.cargando = true;
    this.informacionPDF = [];
    let count : number = 0;
    this.dtOrdenMaquilaService.getInfoOrdenMaquila_Id(id).subscribe(datos_Orden => {
      for (let i = 0; i < datos_Orden.length; i++) {
        let info : any = {
          Id : 0,
          Id_Mp: datos_Orden[i].mP_Id,
          Id_Tinta: datos_Orden[i].tinta_Id,
          Id_Bopp: datos_Orden[i].bopp_Id,
          Nombre : '',
          Cantidad : this.formatonumeros(datos_Orden[i].cantidad),
          "Und Medida" : datos_Orden[i].und_Medida,
          Precio : this.formatonumeros(datos_Orden[i].precio),
          SubTotal : this.formatonumeros(datos_Orden[i].cantidad * datos_Orden[i].precio),
        }
        if (info.Id_Tinta != 2001) {
          info.Id = info.Id_Tinta;
          info.Nombre = datos_Orden[i].tinta;
        } else if (info.Id_Mp != 84) {
          info.Id = info.Id_Mp;
          info.Nombre = datos_Orden[i].mp;
        } else if (info.Id_Bopp != 449) {
          info.Id = info.Id_Bopp;
          info.Nombre = datos_Orden[i].bopp;
        }
        this.informacionPDF.push(info);
        this.informacionPDF.sort((a,b) => a.Nombre.localeCompare(b.Nombre));
        count++;
        if (count == datos_Orden.length) this.crearPDF(id);
      }
    }, () => {
      this.cargando = false;
      this.msj.mensajeError(`Error`, `¡No se pudo obtener información de la última orden de maquila!`);
    });
  }

  // Funcion que va a crear un PDF que será una orde de Maquila
  crearPDF(id : number){
    this.dtOrdenMaquilaService.getInfoOrdenMaquila_Id(id).subscribe(datos_orden => {
      for (let i = 0; i < datos_orden.length; i++) {
        let titulo : string = `Orden de Maquila N° ${datos_orden[i].orden}`;
        const pdfDefinicion : any = {
          info: { title: titulo},
          pageSize: { width: 630, height: 760 },
          watermark: { text: 'PLASTICARIBE SAS', color: 'red', opacity: 0.05, bold: true, italics: false },
          pageMargins : [25, 130, 25, 35],
          header: function(currentPage : any, pageCount : any) {
            return [
              {
                margin: [20, 8, 20, 0],
                columns: [
                  { image : logoParaPdf, width : 150, height : 30, margin: [20, 25] },
                  {
                    width: 300,
                    alignment: 'center',
                    table: {
                      body: [
                        [{text: 'NIT. 800188732', bold: true, alignment: 'center', fontSize: 10}],
                        [{text: `Fecha Doc. ${moment().format('YYYY-MM-DD')} ${moment().format('H:mm:ss')}`, alignment: 'center', fontSize: 8}],
                        [{text: titulo, bold: true, alignment: 'center', fontSize: 10}],
                      ]
                    },
                    layout: 'noBorders',
                    margin: [85, 20],
                  },
                  {
                    width: '*',
                    alignment: 'center',
                    margin: [20, 20, 20, 0],
                    table: {
                      body: [
                        [{text: `Pagina: `, alignment: 'left', fontSize: 8, bold: true}, { text: `${currentPage.toString() + ' de ' + pageCount}`, alignment: 'left', fontSize: 8, margin: [0, 0, 30, 0] }],
                        [{text: `Fecha: `, alignment: 'left', fontSize: 8, bold: true}, {text: datos_orden[i].fecha.replace('T00:00:00', ``), alignment: 'left', fontSize: 8, margin: [0, 0, 30, 0] }],
                        [{text: `Hora: `, alignment: 'left', fontSize: 8, bold: true}, {text: datos_orden[i].hora, alignment: 'left', fontSize: 8, margin: [0, 0, 30, 0] }],
                        [{text: `Usuario: `, alignment: 'left', fontSize: 8, bold: true}, {text: datos_orden[i].usuario, alignment: 'left', fontSize: 8, margin: [0, 0, 30, 0] }],
                      ]
                    },
                    layout: 'noBorders',
                  }
                ]
              },
              {
                margin: [20, 0],
                table: {
                  headerRows: 1,
                  widths: ['*'],
                  body: [
                    [
                      {
                        border: [false, true, false, false],
                        text: ''
                      },
                    ],
                  ]
                },
                layout: { defaultBorder: false, }
              },
            ];
          },
          content : [
            {
              text: `Información detallada del Tercero \n \n`,
              alignment: 'center',
              style: 'header'
            },
            {
              style: 'tablaCliente',
              table: {
                widths: [210,171, 171],
                style: 'header',
                body: [
                  [
                    `Nombre: ${datos_orden[i].tercero}`,
                    `ID: ${datos_orden[i].tercero_Id}`,
                    `Tipo de ID: ${datos_orden[i].tipo_Id}`,
                  ],
                  [
                    `Telefono: ${datos_orden[i].telefono_Tercero}`,
                    `Ciudad: ${datos_orden[i].ciudad_Tercero}`,
                    `E-mail: ${datos_orden[i].correo_Tercero}`,
                  ],
                ]
              },
              layout: 'lightHorizontalLines',
              fontSize: 11,
            },
            {
              text: `\n\n Información detallada de la(s) Materia(s) Prima(s) \n `,
              alignment: 'center',
              style: 'header'
            },

            this.table(this.informacionPDF, ['Id', 'Nombre', 'Cantidad', 'Und Medida', 'Precio', 'SubTotal']),

            {
              style: 'tablaTotales',
              table: {
                widths: [217, '*', 50, '*', 60, 98],
                style: 'header',
                body: [
                  [
                    '',
                    {
                      border: [true, false, true, true],
                      text: `Peso Total`
                    },
                    {
                      border: [false, false, true, true],
                      text: `${this.formatonumeros(datos_orden[i].peso_Total)}`
                    },
                    '',
                    {
                      border: [true, false, true, true],
                      text: `Valor Total`
                    },
                    {
                      border: [false, false, true, true],
                      text: `$${this.formatonumeros(datos_orden[i].valor_Total)}`
                    },
                  ],
                ]
              },
              layout: {
                defaultBorder: false,
              },
              fontSize: 8,
            },
            {
              text: `\n \nObservación sobre la Orden: \n ${datos_orden[i].observacion}\n`,
              style: 'header',
            }
          ],
          styles: {
            header: { fontSize: 10, bold: true },
            titulo: { fontSize: 20, bold: true }
          }
        }
        const pdf = pdfMake.createPdf(pdfDefinicion);
        pdf.open();
        this.limpiarTodo();
        break;
      }
    }, () => {
      this.msj.mensajeError(`Error`, `¡No se pudo obtener la información de la última orden de maquila!`);
      this.cargando = false;
    });
  }

  // funcion que se encagará de llenar la tabla de los productos en el pdf
  buildTableBody(data : any, columns : any) {
    var body = [];
    body.push(columns);
    data.forEach(function(row) {
      var dataRow = [];
      columns.forEach((column) => dataRow.push(row[column].toString()));
      body.push(dataRow);
    });
    return body;
  }

  // Funcion que genera la tabla donde se mostrará la información de los productos pedidos
  table(data, columns) {
    return {
      table: {
        headerRows: 1,
        widths: [50, 217, 50, 50, 60, 98],
        body: this.buildTableBody(data, columns),
      },
      fontSize: 8,
      layout: {
        fillColor: function (rowIndex) {
          return (rowIndex == 0) ? '#CCCCCC' : null;
        }
      }
    };
  }

  mostrarEleccion(modo : any, item?: any,  mensaje?: any){
    this.llave = modo;
    this.itemSeleccionado = item;

    setTimeout(() => {
      if(this.llave == 'pdf') {
        mensaje = `¡Se ha creado la orden de maquila N° ${item}!, ¿desea ver el detalle en pdf?`;
        this.messageService.add({severity:'success', key: this.llave, summary: `Confirmación`, detail: mensaje, sticky: true});
      }

      if(this.llave == 'quitar') {
        this.itemSeleccionado = item;
        mensaje = `Está seguro que desea quitar la materia prima ${item.Nombre} de la tabla?`;
        this.messageService.add({severity:'warn', key: this.llave, summary: `Advertencia`, detail: mensaje, sticky: true});
      }

      if(this.llave == 'eliminar') {
        this.itemSeleccionado = item;
        mensaje = `Está seguro que desea eliminar definitivamente la materia prima ${item.Nombre} de la orden de maquila?`;
        this.messageService.add({severity:'warn', key: this.llave, summary: `Advertencia`, detail: mensaje, sticky: true});
      }

      if(this.llave == 'edicion') {
        this.itemSeleccionado = item;
        mensaje = `¡Se ha editado la orden de maquila N° ${item}!, ¿desea ver el detalle en pdf?`;
        this.messageService.add({severity:'success', key: this.llave, summary: `Confirmación`, detail: mensaje, sticky: true});
      }
    }, 200);
  }

  /** Función para quitar mensaje de elección */
  onReject = () => this.messageService.clear(this.llave);

  /** Función que mostrará un tutorial describiendo paso a paso cada funcionalidad de la aplicación */
  verTutorial() {
    this.shepherdService.defaultStepOptions = defaultStepOptions;
    this.shepherdService.modal = true;
    this.shepherdService.confirmCancel = false;
    this.shepherdService.addSteps(defaultSteps);
    this.shepherdService.start();
  }

  //Función que actualizará las entradas disponibles
  actualizarMovimientosEntradasMP(idMaquila : number){
    let salidaReal : number = 0;
    this.materiasPrimasSeleccionadas.forEach(mp => {
     mp.Cantidad2 = mp.Cantidad;
     this.srvMovEntradasMP.GetInventarioxMaterial(mp.Id).subscribe(data => {
       if (data.length > 0) {
         data.forEach(mov => {
           let detalle : modeloMovimientos_Entradas_MP = {
             'Id': mov.id,
             'MatPri_Id': mov.matPri_Id,
             'Tinta_Id': mov.tinta_Id,
             'Bopp_Id': mov.bopp_Id,
             'Cantidad_Entrada': mov.cantidad_Entrada,
             'UndMed_Id': mov.undMed_Id,
             'Precio_RealUnitario': mov.precio_RealUnitario,
             'Tipo_Entrada': mov.tipo_Entrada,
             'Codigo_Entrada': mov.codigo_Entrada,
             'Estado_Id': mov.estado_Id,
             'Cantidad_Asignada': mov.cantidad_Asignada,
             'Cantidad_Disponible': mov.cantidad_Disponible,
             'Observacion': mov.observacion,
             'Fecha_Entrada': mov.fecha_Entrada,
             'Hora_Entrada': mov.hora_Entrada,
             'Precio_EstandarUnitario': mov.precio_EstandarUnitario
           } 
           if(mp.Cantidad2 > 0) {
             if(mp.Cantidad2 > detalle.Cantidad_Disponible) {
               salidaReal = detalle.Cantidad_Disponible;
               mp.Cantidad2 -= detalle.Cantidad_Disponible;
               detalle.Cantidad_Asignada += detalle.Cantidad_Disponible;
               detalle.Cantidad_Disponible = 0;
               detalle.Estado_Id = 5;
             } else if(mp.Cantidad2 == detalle.Cantidad_Disponible) {
               salidaReal = mp.Cantidad2;
               detalle.Cantidad_Asignada += detalle.Cantidad_Disponible;
               detalle.Cantidad_Disponible = 0;
               detalle.Estado_Id = 5;
               mp.Cantidad2 = 0;
             } else if(mp.Cantidad2 < detalle.Cantidad_Disponible) {
               salidaReal = mp.Cantidad2;
               detalle.Cantidad_Asignada += mp.Cantidad2;
               detalle.Cantidad_Disponible -= mp.Cantidad2;
               detalle.Estado_Id = 19;
               mp.Cantidad2 = 0;
             }
             this.srvMovEntradasMP.Put(detalle.Id, detalle).subscribe(null, () => this.msj.mensajeError(`Error`, `No fue posible actualizar el movimiento de entrada!`));
             this.crearRegistrosSalidasMP(detalle, salidaReal, idMaquila);
           }
         })  
       }
     });
    });
  }
 
  //Función que guardará las salidas de material
  crearRegistrosSalidasMP(detalle : any, salidaReal : number, idMaquila : number) {
    let salidas : modelEntradas_Salidas_MP = {
     'Id_Entrada': detalle.Id,
     'Tipo_Salida': 'OM',
     'Codigo_Salida': idMaquila,
     'Tipo_Entrada': detalle.Tipo_Entrada,
     'Codigo_Entrada': detalle.Codigo_Entrada,
     'Fecha_Registro': this.today,
     'Hora_Registro': this.hora,
     'MatPri_Id': detalle.MatPri_Id,
     'Tinta_Id': detalle.Tinta_Id,
     'Bopp_Id': detalle.Bopp_Id,
     'Cantidad_Salida': salidaReal,
     'Orden_Trabajo': 0,
     'Prod_Id': 1,
     'Cant_PedidaOT': 0,
     'UndMed_Id': 'N/E',
    }
    this.srvMovSalidasMP.Post(salidas).subscribe(null, () => this.msj.mensajeError(`Error`, `No fue posible crear la salida de material!`));
  }
}
