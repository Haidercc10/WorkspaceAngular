import { Component, Inject, Injectable, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import pdfMake from 'pdfmake/build/pdfmake';
import { MessageService } from 'primeng/api';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';
import { modelDetallesOrdenMaquila } from 'src/app/Modelo/modelDetallesOrdenMaquila';
import { modelOrdenMaquila } from 'src/app/Modelo/modelOrdenMaquila';
import { EntradaBOPPService } from 'src/app/Servicios/BOPP/entrada-BOPP.service';
import { DetalleOrdenMaquilaService } from 'src/app/Servicios/DetalleOrdenMaquila/DetalleOrdenMaquila.service';
import { MateriaPrimaService } from 'src/app/Servicios/MateriaPrima/materiaPrima.service';
import { Orden_MaquilaService } from 'src/app/Servicios/Orden_Maquila/Orden_Maquila.service';
import { TercerosService } from 'src/app/Servicios/Terceros/Terceros.service';
import { TintasService } from 'src/app/Servicios/Tintas/tintas.service';
import { UnidadMedidaService } from 'src/app/Servicios/UnidadMedida/unidad-medida.service';

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
  catidadTotalPeso : number = 0; //Variable que almacenará la sumatoria del peso de todas las materia primas seleccionadas
  cantidadTotalPrecio : number = 0; //Variable que almacenará la sumatoria del precio de todas las materias primas seleccionadas
  materiasPrimasSeleccionada_ID : any [] = []; //Variable que almacenará los ID de las materias primas que se han seleccionado para que no puedan ser elegidas nuevamente
  categoriasMP : any [] = []; //Variable que almcanará las categorias de la tabla Materia_Prima
  categoriasTintas : any [] = []; //Variable que almcanará las categorias de la tabla Tintas
  categoriasBOPP : any [] = []; //Variable que almcanará las categorias de la tabla BOPP
  modalCreacionTerceros : boolean = false; //Variable que servirá para validar cuando se muestra el modal de creación de terceros o no
  edidcionOrdenMaquila : boolean = false; //Variable que servirá para validar cuando se está creado una orden y cuando se está editando
  informacionPDF : any [] = []; //Variable que tendrá la informacion de la materia prima pedida en la orden de maquila
  soloLectura : boolean; /** Variable que se utilizará para colocar el campo Stock de solo lectura */
  llave : string = 'pdf'; /** Variable que se utilizará como palabra clave para cargar el mensaje de Ver Pdf/Quitar MP/Eliminar MP de la tabla*/
  itemSeleccionado : any; /** Variable que tomará diferentes valores, generalmente id para mostrar el pdf o id del item a quitar o eliminar de la tabla. */

  constructor(private frmBuilder : FormBuilder,
                @Inject(SESSION_STORAGE) private storage: WebStorageService,
                  private materiaPrimaService : MateriaPrimaService,
                    private tintasService : TintasService,
                      private boppService : EntradaBOPPService,
                        private undMedidaService : UnidadMedidaService,
                          private terceroService : TercerosService,
                            private ordenMaquilaService : Orden_MaquilaService,
                              private dtOrdenMaquilaService : DetalleOrdenMaquilaService,
                                private messageService: MessageService ) {

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
    this.soloLectura = true;
    this.llave = 'pdf';
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.storage.get('Id');
    this.storage_Nombre = this.storage.get('Nombre');
    this.ValidarRol = this.storage.get('Rol');
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = '$1,';
    return number.toString().replace(exp,rep);
  }

  // Generar Consecutivo de Orden de Compra
  generarConsecutivo(){
    this.ordenMaquilaService.GetUltimoId().subscribe(datos_ordenCompra => {
      this.FormOrdenMaquila.patchValue({ ConsecutivoOrden : datos_ordenCompra + 1, });
    }, error => {
      this.FormOrdenMaquila.patchValue({ ConsecutivoOrden : 1, });
      this.cargando = false;
    });
  }

  // Funcion que limpiará todos los campos de la vista
  limpiarTodo(){
    this.FormMateriaPrima.reset();
    this.FormOrdenMaquila.reset();
    this.materiasPrimasSeleccionada_ID = [];
    this.materiasPrimasSeleccionadas = [];
    this.cargando = false;
    this.cantidadTotalPrecio = 0;
    this.catidadTotalPeso = 0;
    this.edidcionOrdenMaquila = false;
    this.itemSeleccionado = null;
    this.generarConsecutivo();
    this.onReject();
    this.llave = 'pdf';
  }

  // Funcion que va a limpiar los campos de materia prima
  limpiarCamposMateriaPrima(){
    this.FormMateriaPrima.reset();
  }

  // Funcion que va a consultar las categorias de las tablas Materia_Prima, Tintas y BOPP
  consultarCategorias(){
    this.materiaPrimaService.GetCategoriasMateriaPrima().subscribe(datos => { this.categoriasMP = datos; });
    this.tintasService.GetCategoriasTintas().subscribe(datos => { this.categoriasTintas = datos; });
    this.boppService.GetCategoriasBOPP().subscribe(datos => { this.categoriasBOPP = datos; });
  }

  //Funcion que va a consultar los proveedores por el nombre que esten escribiendo en el campo de proveedor
  consultarTercero(){
    this.terceros = [];
    let nombre : string = this.FormOrdenMaquila.value.Tercero.trim();
    if (nombre != '') this.terceroService.getTerceroLike(nombre).subscribe(datos_Terceros => { this.terceros = datos_Terceros; });
  }

  // Funcion que le va a cambiar el nombre al proveedor
  cambiarNombreTercero(){
    let id : number = this.FormOrdenMaquila.value.Tercero;
    let nuevo : any[] = this.terceros.filter((item) => item.tercero_Id == id);

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
  obtenerUnidadesMedida(){
    this.undMedidaService.srvObtenerLista().subscribe(datos_undMedida => { this.unidadesMedida = datos_undMedida; });
  }

  // Funcion que va a buscar la informacion de una orden de maquila creada
  buscarOrdenMaquila(){
    let id : number = this.FormOrdenMaquila.value.ConsecutivoOrden;
    this.dtOrdenMaquilaService.getInfoOrdenMaquila_Id(id).subscribe(datos_Orden => {
      if (datos_Orden.length > 0) {
        this.FormMateriaPrima.reset();
        this.FormOrdenMaquila.reset();
        this.materiasPrimasSeleccionada_ID = [];
        this.materiasPrimasSeleccionadas = [];
        this.cargando = false;
        this.cantidadTotalPrecio = 0;
        this.catidadTotalPeso = 0;
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

          this.materiasPrimasSeleccionada_ID.push(info.Id);
          this.materiasPrimasSeleccionadas.push(info);
          this.catidadTotalPeso += datos_Orden[i].cantidad;
          this.cantidadTotalPrecio += (datos_Orden[i].cantidad * datos_Orden[i].precio);
        }
      } else {
        this.mostrarAdvertencia(`Advertencia`, `No se ha encontrado la orden de maquila N° ${id}`);
      }
    });
  }

  //Funcion que va a mostrar el nombre de la materia prima
  cambiarNombreMateriaPrima(){
    let id : number = this.FormMateriaPrima.value.Nombre;
    this.materiaPrimaService.getInfo_MpTintaBopp_Id(id).subscribe(datos_materiaPrima => {
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
    }, error => { this.mostrarError(`Error`, `¡No se pudo obtener información sobre la materia prima seleccionada!`); });
  }

  // Funcion que va a añadir la materia prima a la tabla
  cargarMateriaPrima(){
    let categoria : number = this.FormMateriaPrima.value.Categoria;
    if (this.FormMateriaPrima.valid){
      if (!this.materiasPrimasSeleccionada_ID.includes(this.FormMateriaPrima.value.Id)) {
        if (this.FormMateriaPrima.value.Cantidad > 0){
          if (this.FormMateriaPrima.value.Cantidad <= this.FormMateriaPrima.value.Stock) {
            let info : any = {
              Id : this.FormMateriaPrima.value.Id,
              Id_Mp: 84,
              Id_Tinta: 2001,
              Id_Bopp: 449,
              Nombre : this.FormMateriaPrima.value.Nombre,
              Cantidad : this.FormMateriaPrima.value.Cantidad,
              Und_Medida : this.FormMateriaPrima.value.UndMedida,
              Precio : this.FormMateriaPrima.value.PrecioOculto,
              SubTotal : (this.FormMateriaPrima.value.Cantidad * this.FormMateriaPrima.value.PrecioOculto),
            }
            if (this.categoriasTintas.includes(categoria)) info.Id_Tinta = info.Id;
            else if (this.categoriasMP.includes(categoria)) info.Id_Mp = info.Id;
            else if (this.categoriasBOPP.includes(categoria)) info.Id_Bopp = info.Id;

            this.materiasPrimasSeleccionada_ID.push(this.FormMateriaPrima.value.Id);
            this.materiasPrimasSeleccionadas.push(info);
            this.catidadTotalPeso += this.FormMateriaPrima.value.Cantidad;
            this.cantidadTotalPrecio += (this.FormMateriaPrima.value.Cantidad * this.FormMateriaPrima.value.PrecioOculto);
            this.FormMateriaPrima.reset();
          } else this.mostrarAdvertencia(`Advertencia`, `¡La cantidad a entegar es superior a la cantidad en stock!`);
        } else this.mostrarAdvertencia(`Advertencia`, `¡La cantidad de la materia prima seleccionada debe ser mayor que 0!`);
      } else this.mostrarAdvertencia(`Advertencia`, `¡La materia prima '${this.FormMateriaPrima.value.Nombre}' ya fue seleccionada previamante!`);
    } else this.mostrarAdvertencia(`Advertencia`, `Debe llenar los campos vacios!`);
  }

  // Funcion que va a quitar la materia prima
  quitarMateriaPrima(data : any){
    data = this.itemSeleccionado;
    this.onReject();
    for (let i = 0; i < this.materiasPrimasSeleccionadas.length; i++) {
      if (this.materiasPrimasSeleccionadas[i].Id == data.Id) {
          this.materiasPrimasSeleccionadas.splice(i, 1);
          this.catidadTotalPeso -= data.Cantidad;
          this.cantidadTotalPrecio -= data.SubTotal;
          for (let j = 0; j < this.materiasPrimasSeleccionada_ID.length; j++) {
            if (data.Id == this.materiasPrimasSeleccionada_ID[j]) this.materiasPrimasSeleccionada_ID.splice(j, 1);
          }
          this.mostrarConfirmacion(`Confirmación`, `Se ha quitado la materia Prima ${data.Nombre} de la tabla`);
          this.llave = 'pdf';
      }
    }
  }

  // Funcion que va a elminar de la base de datos una de las materias primas, bopp, tintas escogidas al momento de editar la orden de compra
  eliminarMateriaPrima(data : any){
    data = this.itemSeleccionado;
    setTimeout(() => {
      this.dtOrdenMaquilaService.getMateriaPrimaOrdenMaquila(this.FormOrdenMaquila.value.ConsecutivoOrden, data.Id).subscribe(datos_orden => {
        if (datos_orden.length > 0) {
          this.onReject();
          for (let i = 0; i < datos_orden.length; i++) {
            this.dtOrdenMaquilaService.delete(datos_orden[i]).subscribe(datos_eliminados => {
                for (let i = 0; i < this.materiasPrimasSeleccionadas.length; i++) {
                  if (this.materiasPrimasSeleccionadas[i].Id == data.Id) {
                    this.materiasPrimasSeleccionadas.splice(i, 1);
                    this.catidadTotalPeso -= data.Cantidad;
                    this.cantidadTotalPrecio -= data.SubTotal;
                    for (let j = 0; j < this.materiasPrimasSeleccionada_ID.length; j++) {
                      if (data.Id == this.materiasPrimasSeleccionada_ID[j]) this.materiasPrimasSeleccionada_ID.splice(j, 1);
                    }

                    this.mostrarConfirmacion(`Confirmación`, `Se ha eliminado la materia prima ${data.Nombre} de la orden de maquila`);
                    this.llave = 'pdf';
                    break;
                  }
                }
            }, error => { this.mostrarError(`¡No se pudo eliminar la materia de la orden de Maquila!`, error.message); });
          }
        } else this.quitarMateriaPrima(data);
      });
    }, 100);

  }

  // Funcion que va a validar que los campos necesarios esten llenos para crear la Orden de Maquila
  validarDatosOrdenMaquila(){
    if (this.FormOrdenMaquila.valid) {
      if (this.materiasPrimasSeleccionadas.length > 0) {
        if (!this.edidcionOrdenMaquila) this.crearOrdenMaquila();
        else this.editarOrdenMaquila();

      } else this.mostrarAdvertencia(`Advertencia`, `¡Debe escoger minimo una materia prima!`);
    } else this.mostrarAdvertencia(`Advertencia`, `¡Debe llenar los campos vacios!`);
  }

  // Funcion que va a crear una Orden de Maquila
  crearOrdenMaquila(){
    this.cargando = false;
    let observacion : string = this.FormOrdenMaquila.value.Observacion;
    if (observacion == null) observacion = '';
    let info : modelOrdenMaquila = {
      Tercero_Id : this.FormOrdenMaquila.value.Id_Tercero,
      OM_ValorTotal : this.cantidadTotalPrecio,
      OM_PesoTotal : this.catidadTotalPeso,
      OM_Observacion : (observacion).toUpperCase(),
      TpDoc_Id : 'OM',
      Estado_Id : 11,
      Usua_Id : this.storage_Id,
      OM_Fecha : moment().format('YYYY-MM-DD'),
      OM_Hora : moment().format("H:mm:ss"),
    }
    this.ordenMaquilaService.insert(info).subscribe(datos_ordenMaquila => { this.crearDtOrdenMaquila(datos_ordenMaquila.oM_Id); }, error => {
      this.mostrarError(`Error`, `¡Ocurrió un error al crear la orden de maquila!`);
    });
  }

  // Funcion que va a crear en la base de datos los detalles de la Orden de Maquila
  crearDtOrdenMaquila(id : number){
    let error : boolean = false;
    for (let i = 0; i < this.materiasPrimasSeleccionadas.length; i++) {
      let info : modelDetallesOrdenMaquila = {
        OM_Id : id,
        MatPri_Id : this.materiasPrimasSeleccionadas[i].Id_Mp,
        Tinta_Id : this.materiasPrimasSeleccionadas[i].Id_Tinta,
        BOPP_Id : this.materiasPrimasSeleccionadas[i].Id_Bopp,
        DtOM_Cantidad : this.materiasPrimasSeleccionadas[i].Cantidad,
        UndMed_Id : this.materiasPrimasSeleccionadas[i].Und_Medida,
        DtOM_PrecioUnitario : parseFloat(this.materiasPrimasSeleccionadas[i].Precio),
      }
      this.dtOrdenMaquilaService.insert(info).subscribe(datos => { error = false; },
      error => { this.mostrarError(`Error`, `¡Ocurrió un error al guardar los detalles de la orden de maquila!`); error = true;});
    }
    if(!error) {
      this.itemSeleccionado = id;
      this.mostrarEleccion(`pdf`, id, );
    }
  }

  // Funcion que va a editar un orden de maquila
  editarOrdenMaquila(){
    this.cargando = false;
    let id : number = this.FormOrdenMaquila.value.ConsecutivoOrden;
    let observacion : string = this.FormOrdenMaquila.value.Observacion;
    if (observacion == null) observacion = '';
    let info : any = {
      OM_Id : id,
      Tercero_Id : this.FormOrdenMaquila.value.Id_Tercero,
      OM_ValorTotal : this.cantidadTotalPrecio,
      OM_PesoTotal : this.catidadTotalPeso,
      OM_Observacion : (observacion).toUpperCase(),
      TpDoc_Id : 'OM',
      Estado_Id : 11,
      Usua_Id : this.storage_Id,
      OM_Fecha : moment().format('YYYY-MM-DD'),
      OM_Hora : moment().format("H:mm:ss"),
    }
    this.ordenMaquilaService.put(id, info).subscribe(datos_ordenMaquila => { this.editarDtOrdenMaquila(); }, error => {
      this.mostrarError(`Error`, `¡Ocurrió un error al Editar la Orden de Maquila!`);
    });
  }

  // Funcion que va a crear en la base de datos los detalles de la Orden de Maquila
  editarDtOrdenMaquila(){
    let id : number = this.FormOrdenMaquila.value.ConsecutivoOrden;
    let error : boolean = false;
    for (let i = 0; i < this.materiasPrimasSeleccionadas.length; i++) {
      this.dtOrdenMaquilaService.getMateriaPrimaOrdenMaquila(id, this.materiasPrimasSeleccionadas[i].Id).subscribe(datos_orden => {
        if (datos_orden.length == 0) {
          let info : modelDetallesOrdenMaquila = {
            OM_Id : id,
            MatPri_Id : this.materiasPrimasSeleccionadas[i].Id_Mp,
            Tinta_Id : this.materiasPrimasSeleccionadas[i].Id_Tinta,
            BOPP_Id : this.materiasPrimasSeleccionadas[i].Id_Bopp,
            DtOM_Cantidad : this.materiasPrimasSeleccionadas[i].Cantidad,
            UndMed_Id : this.materiasPrimasSeleccionadas[i].Und_Medida,
            DtOM_PrecioUnitario : parseFloat(this.materiasPrimasSeleccionadas[i].Precio),
          }
          this.dtOrdenMaquilaService.insert(info).subscribe(datos => { error = false; }, error => {
            this.mostrarError(`Error`, `¡Ocurrió un error al editar los detalles de la Orden de Maquila!`);
          });
        }
      }, error => { this.mostrarError(``); error = true; });
    }
    if(!error) {
       setTimeout(() => {
        this.mostrarEleccion(`edicion`, id);
      }, this.materiasPrimasSeleccionadas.length * 10);
    }

  }

  // Funcion que va a consultar la informacion de la Orden de maquila creada, información que se usará para crear un PDF
  buscarInfoOrdenMaquila(id : number){
    this.onReject();
    this.cargando = true;
    this.informacionPDF = [];
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
      }
      setTimeout(() => {this.crearPDF(id); }, 2500);
    }, error => { this.mostrarError(`Error`, `¡No se pudo obtener información de la última orden de maquila!`); });
  }

  // Funcion que va a crear un PDF que será una orde de Maquila
  crearPDF(id : number){
    let nombre : string = this.storage.get('Nombre');
    this.dtOrdenMaquilaService.getInfoOrdenMaquila_Id(id).subscribe(datos_orden => {
      for (let i = 0; i < datos_orden.length; i++) {
        const pdfDefinicion : any = {
          info: { title: `Orden de Maquila N° ${id}` },
          pageSize: { width: 630, height: 760 },
          footer: function(currentPage : any, pageCount : any) {
            return [
              {
                columns: [
                  { text: `Reporte generado por ${nombre}`, alignment: ' left', fontSize: 8, margin: [30, 0, 0, 0] },
                  { text: `Fecha Expedición Documento ${moment().format('YYYY-MM-DD')} - ${moment().format('H:mm:ss')}`, alignment: 'right', fontSize: 8 },
                  { text: `${currentPage.toString() + ' de ' + pageCount}`, alignment: 'right', fontSize: 8, margin: [0, 0, 30, 0] },
                ]
              }
            ]
          },
          content : [
            {
              columns: [
                { image : logoParaPdf, width : 220, height : 50 },
                {
                  text: `Orden de Maquila N° ${datos_orden[i].orden}`,
                  alignment: 'right',
                  style: 'titulo',
                  margin: 30
                }
              ]
            },
            '\n \n',
            {
              style: 'tablaEmpresa',
              table: {
                widths: [90, 167, 90, 166],
                style: 'header',
                body: [
                  [
                    {
                      border: [false, false, false, false],
                      text: `Nombre Empresa`
                    },
                    {
                      border: [false, false, false, true],
                      text: `${datos_orden[i].empresa}`
                    },
                    {
                      border: [false, false, false, false],
                      text: `Fecha`
                    },
                    {
                      border: [false, false, false, true],
                      text: `${datos_orden[i].fecha.replace('T00:00:00', ``)} ${datos_orden[i].hora}`
                    },
                  ],
                  [
                    {
                      border: [false, false, false, false],
                      text: `NIT Empresa`
                    },
                    {
                      border: [false, false, false, true],
                      text: `${datos_orden[i].empresa_Id}`
                    },
                    {
                      border: [false, false, false, false],
                      text: `Ciudad`
                    },
                    {
                      border: [false, false, false, true],
                      text: `${datos_orden[i].empresa_Ciudad}`
                    },
                  ],
                  [
                    {
                      border: [false, false, false, false],
                      text: `Dirección`
                    },
                    {
                      border: [false, false, false, true],
                      text: `${datos_orden[i].empresa_Direccion}`
                    },
                    {},
                    {}
                  ]
                ]
              },
              layout: {
                defaultBorder: false,
              },
              fontSize: 9,
            },
            '\n \n',
            {
              text: `Usuario: ${datos_orden[i].usuario}\n`,
              alignment: 'left',
              style: 'header',
            },
            '\n \n',
            {
              text: `\n Información detallada del Tercero \n \n`,
              alignment: 'center',
              style: 'header'
            },
            {
              style: 'tablaCliente',
              table: {
                widths: [171,171, 171],
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
                widths: [197, '*', 50, '*', '*', 98],
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
    }, error => { this.mostrarError(`Error`, `¡No se pudo obtener la información de la última orden de maquila!`); });
  }

  // funcion que se encagará de llenar la tabla de los productos en el pdf
  buildTableBody(data : any, columns : any) {
    var body = [];
    body.push(columns);
    data.forEach(function(row) {
      var dataRow = [];
      columns.forEach(function(column) {
        dataRow.push(row[column].toString());
      });
      body.push(dataRow);
    });
    return body;
  }

  // Funcion que genera la tabla donde se mostrará la información de los productos pedidos
  table(data, columns) {
    return {
      table: {
        headerRows: 1,
        widths: [50, 197, 50, 50, 50, 98],
        body: this.buildTableBody(data, columns),
      },
      fontSize: 8,
      layout: {
        fillColor: function (rowIndex, node, columnIndex) {
          return (rowIndex == 0) ? '#CCCCCC' : null;
        }
      }
    };
  }

  /** Mostrar mensaje de confirmación  */
  mostrarConfirmacion(mensaje : any, titulo?: any, id? : any) {
   this.messageService.add({severity: 'success', summary: mensaje,  detail: titulo, life : 2000});
  }

  /** Mostrar mensaje de error  */
  mostrarError(mensaje : any, titulo?: any) {
   this.messageService.add({severity:'error', summary: mensaje, detail: titulo, life : 5000});
   this.cargando = false;
  }

  /** Mostrar mensaje de advertencia */
  mostrarAdvertencia(mensaje : any, titulo?: any) {
   this.messageService.add({severity:'warn', summary: mensaje, detail: titulo, life : 2000});
   this.cargando = false;
  }

  mostrarEleccion(modo : any, item?: any,  mensaje?: any, titulo?: any){
    this.llave = modo;
    this.itemSeleccionado = item;

    setTimeout(() => {
      if(this.llave == 'pdf') {
        titulo = `Confirmación`;
        mensaje = `¡Se ha creado la orden de maquila N° ${item}!, ¿desea ver el detalle en pdf?`;
        this.messageService.add({severity:'success', key: this.llave, summary: titulo, detail: mensaje, sticky: true});
      }

      if(this.llave == 'quitar') {
        this.itemSeleccionado = item;
        titulo = `Advertencia`;
        mensaje = `Está seguro que desea quitar la materia prima ${item.Nombre} de la tabla?`;
        this.messageService.add({severity:'warn', key: this.llave, summary: titulo, detail: mensaje, sticky: true});
      }

      if(this.llave == 'eliminar') {
        this.itemSeleccionado = item;
        titulo = `Advertencia`;
        mensaje = `Está seguro que desea eliminar definitivamente la materia prima ${item.Nombre} de la orden de maquila?`;
        this.messageService.add({severity:'warn', key: this.llave, summary: titulo, detail: mensaje, sticky: true});
      }

      if(this.llave == 'edicion') {
        this.itemSeleccionado = item;
        titulo = `Confirmación`;
        mensaje = `¡Se ha editado la orden de maquila N° ${item}!, ¿desea ver el detalle en pdf?`;
        this.messageService.add({severity:'success', key: this.llave, summary: titulo, detail: mensaje, sticky: true});
      }
    }, 200);
  }

  /** Función para quitar mensaje de elección */
  onReject(){
    this.messageService.clear(this.llave);
  }
}
