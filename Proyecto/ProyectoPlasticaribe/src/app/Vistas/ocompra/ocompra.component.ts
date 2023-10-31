import { Component, Injectable, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShepherdService } from 'angular-shepherd';
import moment from 'moment';
import { MessageService } from 'primeng/api';
import { modelDtSolcitudMP } from 'src/app/Modelo/modelDtSolcitudMP';
import { modelSolicitudMateriaPrima } from 'src/app/Modelo/modelSolicituMateriaPrima';
import { EntradaBOPPService } from 'src/app/Servicios/BOPP/entrada-BOPP.service';
import { CreacionPdfService } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';
import { DetalleSolicitudMateriaPrimaService } from 'src/app/Servicios/DetalleSolicitudMateriaPrima/DetalleSolicitudMateriaPrima.service';
import { DetallesOrdenesCompraService } from 'src/app/Servicios/DetallesOrdenCompra/DetallesOrdenesCompra.service';
import { MateriaPrimaService } from 'src/app/Servicios/MateriaPrima/materiaPrima.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { OrdenCompra_MateriaPrimaService } from 'src/app/Servicios/OrdenCompra/OrdenCompra_MateriaPrima.service';
import { ProveedorService } from 'src/app/Servicios/Proveedor/proveedor.service';
import { RelacionSolicitud_OrdenCompraService } from 'src/app/Servicios/RelacionSolicitud_OrdenCompra/RelacionSolicitud_OrdenCompra.service';
import { SolicitudMateriaPrimaService } from 'src/app/Servicios/SolicitudMateriaPrima/SolicitudMateriaPrima.service';
import { TintasService } from 'src/app/Servicios/Tintas/tintas.service';
import { UnidadMedidaService } from 'src/app/Servicios/UnidadMedida/unidad-medida.service';
import { AppComponent } from 'src/app/app.component';
import { defaultStepOptions, stepsOrdenesCompra as defaultSteps } from 'src/app/data';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app_ocompra_component',
  templateUrl: './ocompra.component.html',
  styleUrls: ['./ocompra.component.css']
})

export class OcompraComponent implements OnInit {

  FormOrdenCompra : FormGroup; //Formulario principal
  FormMateriaPrima : FormGroup; //Formulario de Materia Prima
  ModalCrearProveedor: boolean = false; //Variable para validar que se abra el modal de creacion de proveedores
  modalCreacionMateriaPrima : boolean = false; //Variable para validar que se abra el modal en que se pregusntará que se creará
  ModalCrearMateriaPrima: boolean= false; //Variable para validar que se abra el modal de creacion de polietileno
  ModalCrearBOPP: boolean= false; //Variable para validar que se abra el modal de creacion de bopp, bopa y/o poliester
  ModalCrearTintas: boolean= false; //Variable para validar que se abra el modal de creacion de tintas, chips, solvenets
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  cargando : boolean = false; //Variable para validar que aparezca o no el icono de carga
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  proveedores : any [] = []; //Variable que almacenará los proveedores
  materiaPrima : any [] = []; //Variable que almacenará las materias primas
  unidadesMedida : any [] = []; //Variable que va a almacenar las unidades de medida
  materiasPrimasSeleccionadas : any [] = []; //Variable que almacenará las materias primas que son escogidas para la orden de compra
  consecutivoOrdenCompra : any = 0; //Variable que almacenará el consecutivo de la orden de compra
  informacionPDF : any [] = []; //Variable que tendrá la informacion de la materia prima pedida en la orden de compra
  categoriasMP : any [] = []; //Variable que almcanará las categorias de la tabla Materia_Prima
  categoriasTintas : any [] = []; //Variable que almcanará las categorias de la tabla Tintas
  categoriasBOPP : any [] = []; //Variable que almcanará las categorias de la tabla BOPP
  mpSeleccionada : any [];
  edicionOrdenCompra : boolean = false;
  llave : string = 'pdf';
  ordenCreada : number;
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  solicitud : boolean = false;
  iva : number = 19;

  constructor(private frmBuilder : FormBuilder,
                private AppComponent : AppComponent,
                  private proveedorService : ProveedorService,
                    private materiaPrimaService : MateriaPrimaService,
                      private undMedidaService : UnidadMedidaService,
                        private ordenCompraService : OrdenCompra_MateriaPrimaService,
                          private dtOrdenCompraService : DetallesOrdenesCompraService,
                            private servicioTintas : TintasService,
                              private messageService: MessageService,
                                private boppService : EntradaBOPPService,
                                  private shepherdService: ShepherdService,
                                    private solicitudMpService : SolicitudMateriaPrimaService,
                                      private dtSolicitudMp : DetalleSolicitudMateriaPrimaService,
                                        private relacionSolOcService : RelacionSolicitud_OrdenCompraService,
                                          private mensajeService : MensajesAplicacionService,
                                            private creacionPDFService : CreacionPdfService,) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
    this.FormOrdenCompra = this.frmBuilder.group({
      ConsecutivoOrden : ['', Validators.required],
      Solicitud : [''],
      Proveedor : ['', Validators.required],
      Id_Proveedor : ['', Validators.required],
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
      iva : [this.iva, Validators.required],
    });
  }

  ngOnInit(){
    this.lecturaStorage();
    this.obtenerUnidadesMedida();
    this.obtenerMateriaPrima();
    this.generarConsecutivo();
    this.consultarCategorias();
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

  // Funcion que limpiará todos los campos de la vista
  limpiarTodo(){
    this.FormMateriaPrima.reset();
    this.FormOrdenCompra.reset();
    this.FormMateriaPrima.patchValue({ iva : 19 });
    this.materiasPrimasSeleccionadas = [];
    this.cargando = false;
    this.generarConsecutivo();
    this.mpSeleccionada = [];
    this.informacionPDF = [];
  }

  // Funcion que va a limpiar los campos de materia prima
  limpiarCamposMateriaPrima(){
    this.FormMateriaPrima.reset();
    this.ivaOrdenCompra();
  }

  ivaOrdenCompra(){
    let iva = this.iva == null || this.iva == undefined ? 19 : this.iva;
    this.FormMateriaPrima.patchValue({ iva : iva });
  }

  //Funcion que va a consultar los proveedores por el nombre que esten escribiendo en el campo de proveedor
  consultarProveedores(){
    let nombre : string = this.FormOrdenCompra.value.Proveedor.trim();
    if (nombre != '') this.proveedorService.getProveedorLike(nombre).subscribe(datos_Proveedores => this.proveedores = datos_Proveedores);
  }

  // Funcion que va a consultar las categorias de las tablas Materia_Prima, Tintas y BOPP
  consultarCategorias(){
    this.materiaPrimaService.GetCategoriasMateriaPrima().subscribe(datos => this.categoriasMP = datos);
    this.servicioTintas.GetCategoriasTintas().subscribe(datos => this.categoriasTintas = datos);
    this.boppService.GetCategoriasBOPP().subscribe(datos => this.categoriasBOPP = datos);
  }

  // Funcion que le va a cambiar el nombre al proveedor
  cambiarNombreProveedor(){
    let nuevo : any[] = this.proveedores.filter((item) => item.prov_Id == this.FormOrdenCompra.value.Proveedor);
    this.FormOrdenCompra.patchValue({
      Proveedor : nuevo[0].prov_Nombre,
      Id_Proveedor : nuevo[0].prov_Id,
    });
  }

  // Generar Consecutivo de Orden de Compra
  generarConsecutivo = () => this.ordenCompraService.getUltimoId_OrdenCompra().subscribe(num => this.FormOrdenCompra.patchValue({ ConsecutivoOrden : num + 1, }), () => this.FormOrdenCompra.patchValue({ ConsecutivoOrden : 1, }));

  // Funcion que va a consultar la materia prima
  obtenerMateriaPrima(){
    this.materiaPrimaService.getMpTintaBopp().subscribe(datos_materiaPrimas => {
      this.materiaPrima = datos_materiaPrimas;
      this.materiaPrima.sort((a,b) => a.nombre.localeCompare(b.nombre));
    });
  }

  // Funcion que va a consultar las unidades de medida
  obtenerUnidadesMedida = () => this.undMedidaService.srvObtenerLista().subscribe(datos_undMedida => this.unidadesMedida = datos_undMedida);

  //Funcion que va a mostrar el nombre de la materia prima
  cambiarNombreMateriaPrima(){
    let id : number = this.FormMateriaPrima.value.Nombre || this.FormMateriaPrima.value.Id;
    this.materiaPrimaService.getInfoMpTintaBopp(id).subscribe(datos_materiaPrima => {
      for (let i = 0; i < datos_materiaPrima.length; i++) {
        this.FormMateriaPrima.patchValue({
          Id : datos_materiaPrima[i].id,
          Nombre : datos_materiaPrima[i].nombre,
          Cantidad : 0,
          UndMedida : datos_materiaPrima[i].undMedida,
          Precio : parseFloat(datos_materiaPrima[i].precio),
          PrecioOculto : parseFloat(datos_materiaPrima[i].precio),
          Categoria : datos_materiaPrima[i].categoria,
        });
      }
    }, () => this.mensajeService.mensajeError(`Error`, `¡No se pudo obtener información sobre la materia prima seleccionada!`));
  }

  // Funcion que va a añadir la materia prima a la tabla
  cargarMateriaPrima(){
    let categoria : number = this.FormMateriaPrima.value.Categoria;
    if (this.FormMateriaPrima.valid){
      if (!this.materiasPrimasSeleccionadas.map(x => x.Id).includes(this.FormMateriaPrima.value.Id)) {
        if (this.FormMateriaPrima.value.Cantidad > 0){
          let info : any = {
            Id : this.FormMateriaPrima.value.Id,
            Id_Mp: 84,
            Id_Tinta: 2001,
            Id_Bopp: 1,
            Nombre : this.FormMateriaPrima.value.Nombre,
            Cantidad : this.FormMateriaPrima.value.Cantidad,
            Und_Medida : this.FormMateriaPrima.value.UndMedida,
            Precio : this.FormMateriaPrima.value.PrecioOculto,
            SubTotal : (this.FormMateriaPrima.value.Cantidad * this.FormMateriaPrima.value.PrecioOculto),
          }
          if (this.categoriasTintas.includes(categoria)) info.Id_Tinta = info.Id;
          else if (this.categoriasMP.includes(categoria)) info.Id_Mp = info.Id;
          else if (this.categoriasBOPP.includes(categoria)) info.Id_Bopp = info.Id;
          this.materiasPrimasSeleccionadas.push(info);
          this.limpiarCamposMateriaPrima();
        } else this.mensajeService.mensajeAdvertencia(`Advertencia`, `¡La cantidad de la materia prima seleccionada debe ser mayor que 0!`);
      } else this.mensajeService.mensajeAdvertencia(`Advertencia`, `¡La materia prima '${this.FormMateriaPrima.value.Nombre}' ya fue seleccionada previamante!`);
    } else this.mensajeService.mensajeAdvertencia(`Advertencia`, `¡Hay campos vacios!`);
  }

  // Funcion que va a quitar la materia prima
  quitarMateriaPrima(data : any){
    data = this.mpSeleccionada;
    this.onReject();
    this.materiasPrimasSeleccionadas.splice(this.materiasPrimasSeleccionadas.findIndex((item) => item.Id == data.Id), 1);
    this.mensajeService.mensajeConfirmacion(`Confirmación`, `Se ha quitado la materia prima seleccionada de la tabla!`);
    this.llave = 'pdf';
  }

  // Funcion que va a calcular la cantidad de materia prima
  calcularCantMateriaPrima() : number{
    let total : number = 0;
    for (let i = 0; i < this.materiasPrimasSeleccionadas.length; i++) {
      total += this.materiasPrimasSeleccionadas[i].Cantidad;
      this.materiasPrimasSeleccionadas[i].SubTotal = this.materiasPrimasSeleccionadas[i].Cantidad * this.materiasPrimasSeleccionadas[i].Precio;
    }
    return total;
  }

  // Funcion que va a calcular el costo de toda la materia prima seleccionada
  calcularCostoMateriaPrima() : number{
    let total : number = 0;
    for (let i = 0; i < this.materiasPrimasSeleccionadas.length; i++) {
      total += this.materiasPrimasSeleccionadas[i].SubTotal;
    }
    return total;
  }

  // Funcion que va a calcular el costo de toda la materia prima seleccionada
  calcularIVAMateriaPrima() : number{
    let total : number = 0;
    for (let i = 0; i < this.materiasPrimasSeleccionadas.length; i++) {
      total += (this.materiasPrimasSeleccionadas[i].SubTotal * this.iva) / 100;
    }
    return total;
  }

  // Funcion que va a calcular el costo de toda la materia prima seleccionada
  calcularCostoTotalMateriaPrima() : number{
    let total : number = 0;
    for (let i = 0; i < this.materiasPrimasSeleccionadas.length; i++) {
      total += this.materiasPrimasSeleccionadas[i].SubTotal + ((this.materiasPrimasSeleccionadas[i].SubTotal * this.iva) / 100);
    }
    return total;
  }

  // Funcion para llamar el modal que crea proveedores
  LlamarModalCrearProveedor = () => this.ModalCrearProveedor = true;

  // Funcion para llamar el modal que pregunta que materia prima se va a crear
  LlamarModalCrearMateriaPrima = () => this.modalCreacionMateriaPrima = true;

  // Funcion para llamar el modal que crea polientileno
  crearPolientileno(){
    this.modalCreacionMateriaPrima = false;
    this.ModalCrearMateriaPrima = true;
  }

  // Funcion para llamar el modal que crea bopp
  crearBopp(){
    this.modalCreacionMateriaPrima = false;
    this.ModalCrearBOPP = true;
  }

  // Funcion para llamar el modal que crea tintas
  creartinta(){
    this.modalCreacionMateriaPrima = false;
    this.ModalCrearTintas = true;
  }

  // Funcion que va a validar que los campos necesarios esten llenos para crear la ORden de Compra
  validarDatosOrdenCompra(){
    if (this.FormOrdenCompra.valid) this.materiasPrimasSeleccionadas.length > 0 ? this.crearOrdenCompra() : this.mensajeService.mensajeAdvertencia(`Advertencia`, `¡Debe escoger minimo 1 materia prima!`);
    else this.mensajeService.mensajeAdvertencia(`Advertencia`, `¡Hay campos vacios!`);
  }

  // Funcion que va a consultar la información de una orden de compra existente y prepará los campos para que sea editable
  consultarOrdenCompra(){
    let ordenCompra : number = this.FormOrdenCompra.value.ConsecutivoOrden;
    this.dtOrdenCompraService.GetOrdenCompra(ordenCompra).subscribe(datos_orden => {
      if (datos_orden.length > 0) {
        this.ordenCreada = ordenCompra
        this.edicionOrdenCompra = true;
        this.FormOrdenCompra.reset();
        this.FormMateriaPrima.reset();
        this.materiasPrimasSeleccionadas = [];
        this.consecutivoOrdenCompra = 0;
        this.informacionPDF = [];
        for (let i = 0; i < datos_orden.length; i++) {
          this.FormOrdenCompra.patchValue({
            ConsecutivoOrden : ordenCompra,
            Proveedor : datos_orden[i].proveedor,
            Id_Proveedor : datos_orden[i].proveedor_Id,
            Observacion : datos_orden[i].observacion,
          });
          let info : any = {
            Id : 0,
            Id_Mp: datos_orden[i].mP_Id,
            Id_Tinta: datos_orden[i].tinta_Id,
            Id_Bopp: datos_orden[i].bopp_Id,
            Nombre : '',
            Cantidad : datos_orden[i].cantidad,
            Und_Medida : datos_orden[i].unidad_Medida,
            Precio : datos_orden[i].precio_Unitario,
            SubTotal : (datos_orden[i].cantidad * datos_orden[i].precio_Unitario),
            iva : datos_orden[i].iva,
          };
          if (info.Id_Mp != 84) {
            info.Id = info.Id_Mp;
            info.Nombre = datos_orden[i].mp;
          } else if (info.Id_Tinta != 2001) {
            info.Id = info.Id_Tinta;
            info.Nombre = datos_orden[i].tinta;
          } else if (info.Id_Bopp != 1) {
            info.Id = info.Id_Bopp;
            info.Nombre = datos_orden[i].bopp;
          }
          this.materiasPrimasSeleccionadas.push(info);
        }
      } else {
        this.mensajeService.mensajeAdvertencia(`Advertencia`, `¡No se encontraron registros para orden de compra N° ${ordenCompra}!`);
        this.limpiarTodo();
      }
    }, () => {
      this.mensajeService.mensajeError(`Error`, `¡No se pudo obtener información de la orden de compra N° ${ordenCompra}!`);
      this.limpiarTodo();
    });
  }

  // Funcion que va a consultar una solicitud de materia prima
  consultarSolicitudMP(){
    this.materiasPrimasSeleccionadas = [];
    let solicitud = this.FormOrdenCompra.value.Solicitud;

    if (solicitud) {
      this.dtSolicitudMp.GetInfoSolicitud(solicitud).subscribe(data => {
        for (let i = 0; i < data.length; i++) {
          if (data[i].estado_Solicitud_Id != 5){
            if (data[i].estado_Solicitud_Id != 4) {
              this.FormOrdenCompra.patchValue({ Observacion : data[i].observacion, });
              let info : any = {
                Id : 0,
                Id_Mp: data[i].mP_Id,
                Id_Tinta: data[i].tinta_Id,
                Id_Bopp: data[i].bopp_Id,
                Nombre : '',
                Cantidad : data[i].cantidad,
                Und_Medida : data[i].unidad_Medida,
                Precio : 0,
                SubTotal : 0,
              }
              if (info.Id_Mp != 84) {
                info.Id = info.Id_Mp;
                info.Nombre = data[i].mp;
                info.Precio = data[i].precio_MP;
                info.SubTotal = info.Cantidad * data[i].precio_MP;
              } else if (info.Id_Tinta != 2001) {
                info.Id = info.Id_Tinta;
                info.Nombre = data[i].tinta;
                info.Precio = data[i].precio_Tinta;
                info.SubTotal = info.Cantidad * data[i].precio_Tinta;
              } else if (info.Id_Bopp != 1) {
                info.Id = info.Id_Bopp;
                info.Nombre = data[i].bopp;
                info.Precio = data[i].precio_Bopp;
                info.SubTotal = info.Cantidad * data[i].precio_Bopp;
              }
              this.materiasPrimasSeleccionadas.push(info);
            } else this.mensajeService.mensajeError(`¡Solicitud no valida!`, `¡No se puede crear una orden de compra para esta solicitud dado que esta ha sido cancelada!`);
          } else this.mensajeService.mensajeError(`¡Solicitud no valida!`, `¡No se puede crear una orden de compra para esta solicitud dado que esta ha finalizado!`);
        }
      }, error => this.mensajeService.mensajeError(`¡El número de la solicitud no existe!`, `${error.error}`));
    } else this.mensajeService.mensajeError(`¡Advertencia!`, `¡La información que ha digitado no es valida, debe digitar solo números sin caracteres especiales!`);
  }

  // Funcion que va a crear la orden de compra
  crearOrdenCompra(){
    this.cargando = true;
    let solicitud : any = this.FormOrdenCompra.value.Solicitud;
    let info : any = {
      Usua_Id : this.storage_Id,
      Oc_Fecha : moment().format('YYYY-MM-DD'),
      Oc_Hora : moment().format("H:mm:ss"),
      Prov_Id : this.FormOrdenCompra.value.Id_Proveedor,
      Estado_Id : 11,
      Oc_ValorTotal : this.calcularCostoMateriaPrima(),
      Oc_PesoTotal : this.calcularCantMateriaPrima(),
      TpDoc_Id : 'OCMP',
      Oc_Observacion : this.FormOrdenCompra.value.Observacion == null ? '' : (this.FormOrdenCompra.value.Observacion).toUpperCase(),
      IVA : this.iva,
    }
    this.ordenCompraService.insert_OrdenCompra(info).subscribe(datos_ordenCompra => {
      this.ordenCreada = datos_ordenCompra.oc_Id;
      if (solicitud.length > 0) this.crearRelacionOc_Solicitud(datos_ordenCompra.oc_Id, solicitud);
      this.crearDtOrdenCompra(datos_ordenCompra.oc_Id);
    }, () => {
      this.mensajeService.mensajeError(`Error`, `¡Error al crear la orden de compra!`);
      this.cargando = false;
    });
  }

  // Funcion que va a rear detalles de Orden de Compra
  crearDtOrdenCompra(orden : number){
    let count : number = 0;
    for (let j = 0; j < this.materiasPrimasSeleccionadas.length; j++) {
      let info : any = {
        Oc_Id : orden,
        MatPri_Id : this.materiasPrimasSeleccionadas[j].Id_Mp,
        Tinta_Id : this.materiasPrimasSeleccionadas[j].Id_Tinta,
        BOPP_Id : this.materiasPrimasSeleccionadas[j].Id_Bopp,
        Doc_CantidadPedida : this.materiasPrimasSeleccionadas[j].Cantidad,
        UndMed_Id : this.materiasPrimasSeleccionadas[j].Und_Medida,
        Doc_PrecioUnitario : this.materiasPrimasSeleccionadas[j].Precio,
      }
      this.dtOrdenCompraService.insert_DtOrdenCompra(info).subscribe(() => {
        count++;
        if (count == this.materiasPrimasSeleccionadas.length) {
          this.GuardadoExitoso();
          this.buscarinfoOrdenCompra(orden);
        }
      }, () => {
        this.mensajeService.mensajeError(`Error`, `¡Error al insertar la(s) materia(s) prima(s) pedida(s)!`);
        this.cargando = false;
      });
    }
  }

  // Funcion que va a crear la relación entre orden de compra y solicitud de materia prima
  crearRelacionOc_Solicitud(orden : number, solicitud : number){
    let info : any = { Oc_Id : orden, Solicitud_Id : solicitud, }
    this.relacionSolOcService.Post(info).subscribe(() => this.cambiarEstadoMpSolicitud(solicitud), () => this.mensajeService.mensajeError(`¡Error Solicitud!`, `¡No se pudo crear la relación entre la solicitud de materia prima y la orden de compra!`));
  }

  // Funcion que va a cambiar el estado de la solicitud. Posiciones Array => 0 : Pendiente, 1 : Parciales, 2 : Totales, 3 : Cantidad de Materias Primas
  cambiarEstadoSolicitud(solicitud : number){
    this.solicitudMpService.Get_Id(solicitud).subscribe(datos_Sol => {
      let info : modelSolicitudMateriaPrima = {
        Solicitud_Id : datos_Sol.solicitud_Id,
        Usua_Id: datos_Sol.usua_Id,
        Solicitud_Observacion: datos_Sol.solicitud_Observacion,
        Solicitud_Fecha: datos_Sol.solicitud_Fecha,
        Solicitud_Hora: datos_Sol.solicitud_Hora,
        Estado_Id: 0,
      }
      this.dtSolicitudMp.GetEstadosMateriasPrimas(solicitud).subscribe(data => {
        if ((data[1] > 0 && data[1] == data[3]) || (data[2] > 0 && data[2] < data[3])) {
          info.Estado_Id = 12;
          this.solicitudMpService.Put(solicitud, info).subscribe(null, () => this.mensajeService.mensajeError(`¡Error Solicitud!`, `¡No se pudo actualizar el estado de la solicitud de materia prima!`));
        } else if (data[2] > 0 && data[2] == data[3]) {
          info.Estado_Id = 5;
          this.solicitudMpService.Put(solicitud, info).subscribe(null, () => this.mensajeService.mensajeError(`¡Error Solicitud!`, `¡No se pudo actualizar el estado de la solicitud de materia prima!`));
        }
      });
    }, err => this.mensajeService.mensajeError(`¡Error Solicitud!`, `¡${err}!`));
  }

  // Funcion que va a cambiar el estado de las materias primas de la solicitud
  cambiarEstadoMpSolicitud(solicitud_Id : number) {
    let count : number = 0;
    for (let i = 0; i < this.materiasPrimasSeleccionadas.length; i++) {
      this.dtSolicitudMp.GetMateriaPrimaSolicitud(solicitud_Id, this.materiasPrimasSeleccionadas[i].Id).subscribe(data => {
        for (let j = 0; j < data.length; j++) {
          let info : modelDtSolcitudMP = {
            DtSolicitud_Id : data[j].dtSolicitud_Id,
            Solicitud_Id: data[j].solicitud_Id,
            MatPri_Id: data[j].matPri_Id,
            Tinta_Id: data[j].tinta_Id,
            Bopp_Id: data[j].bopp_Id,
            DtSolicitud_Cantidad: data[j].dtSolicitud_Cantidad,
            UndMed_Id: data[j].undMed_Id,
            Estado_Id: this.materiasPrimasSeleccionadas[i].Cantidad >= data[j].dtSolicitud_Cantidad ? 5 : 12,
          }
          this.dtSolicitudMp.Put(data[j].dtSolicitud_Id, info).subscribe(() => {
            count++;
            if (count == this.materiasPrimasSeleccionadas.length) this.cambiarEstadoSolicitud(solicitud_Id);
          });
        }
      });
    }
  }

  // Funcion que mostrará el mensaje de que todo el proceso de guardado fue exitoso
  GuardadoExitoso(){
    this.actualizarPrecioMatPrimas();
    this.actualizarPrecioTintas();
    setTimeout(() => this.limpiarTodo(), 3000);
  }

  //Buscar informacion de la orden de compra creada
  buscarinfoOrdenCompra(orden : number){
    this.onReject();
    this.cargando = true;
    setTimeout(() => {
      this.ordenCreada = orden;
      this.dtOrdenCompraService.GetOrdenCompra(orden).subscribe(datos_orden => {
        for (let i = 0; i < datos_orden.length; i++) {
          let info : any = {
            Id : 0,
            Id_Mp: datos_orden[i].mP_Id,
            Id_Tinta: datos_orden[i].tinta_Id,
            Id_Bopp: datos_orden[i].bopp_Id,
            Nombre : '',
            Cantidad : this.formatonumeros(datos_orden[i].cantidad),
            Medida : datos_orden[i].unidad_Medida,
            Precio : `$${this.formatonumeros(datos_orden[i].precio_Unitario)}`,
            SubTotal : `${this.formatonumeros(datos_orden[i].cantidad * datos_orden[i].precio_Unitario)}`,
          }
          if (info.Id_Mp != 84) {
            info.Id = info.Id_Mp;
            info.Nombre = datos_orden[i].mp;
          } else if (info.Id_Tinta != 2001) {
            info.Id = info.Id_Tinta;
            info.Nombre = datos_orden[i].tinta;
          } else if (info.Id_Bopp != 1) {
            info.Id = info.Id_Bopp;
            info.Nombre = datos_orden[i].bopp;
          }
          this.informacionPDF.push(info);
          this.informacionPDF.sort((a,b) => a.Nombre.localeCompare(b.Nombre));
        }
        this.crearPDF();
      }, () => this.mensajeService.mensajeError(`Error`, `¡No se pudo obtener información de la última orden de compra creada!`));
    }, 100);
  }

  crearPDF(){
    this.dtOrdenCompraService.GetOrdenCompra(this.ordenCreada).subscribe(datos_orden => {
      for (let i = 0; i < datos_orden.length; i++) {
        let titulo : string = `Orden de Compra N° ${datos_orden[i].consecutivo}`;
        let content : any [] = this.contenidoPDF(datos_orden[i]);
        this.creacionPDFService.formatoPDF(titulo, content);
        setTimeout(() => this.cargando = false, 3000);
        break;
      }
    }, () => this.mensajeService.mensajeError(`Error`, `¡No se pudo obtener información de la orden de compra N° ${this.ordenCreada}!`));
  }

  contenidoPDF(datos_orden){
    let data : any [] = [];
    data.push(this.informacionProveedorPDF());
    data.push(this.datosProveedorPDF(datos_orden));
    data.push(this.informacionMateriaPrimaPDF());
    data.push(this.datosMateriasPrimasPDF());
    data.push(this.totalesPDF(datos_orden));
    data.push(this.observacionPDF(datos_orden));
    return data;
  }

  informacionProveedorPDF(){
    return {
      text: `\n Información detallada del Proveedor \n \n`,
      alignment: 'center',
      fontSize: 10,
      bold: true
    };
  }

  datosProveedorPDF(datos_orden){
    return {
      table: {
        widths: ['50%', '20%', '30%'],
        body: [
          [
            {text: `Nombre: ${datos_orden.proveedor}`},
            {text: `ID: ${datos_orden.proveedor_Id}`},
            {text: `Tipo de ID: ${datos_orden.tipo_Id}`},
          ],
          [
            {text: `Telefono: ${datos_orden.telefono_Proveedor}`},
            {text: `Ciudad: ${datos_orden.ciudad_Proveedor}`},
            {text: `Tipo de Proveedor: ${datos_orden.tipo_Proveedor}`}
          ],
          [
            {text:`E-mail: ${datos_orden.correo_Proveedor}`},
            {},
            {}
          ]
        ]
      },
      layout: 'lightHorizontalLines',
      fontSize: 9,
    }
  }

  informacionMateriaPrimaPDF(){
    return {
      text: `\n\n Información detallada de la(s) Materia(s) Prima(s) \n `,
      alignment: 'center',
      style: 'header'
    }
  }

  datosMateriasPrimasPDF(){
    return this.table(this.informacionPDF, ['Id', 'Nombre', 'Cantidad', 'Medida', 'Precio', 'SubTotal'])
  }

  // Funcion que genera la tabla donde se mostrará la información de los productos pedidos
  table(data, columns) {
    return {
      table: {
        headerRows: 1,
        widths: ['10%', '45%', '10%', '10%', '10%', '15%'],
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

  totalesPDF(datos_orden){
    return {
      table: {
        widths: ['45%', '10%', '10%', '10%', '10%', '15%'],
        style: 'header',
        body: [
          [
            '',
            {border: [true, false, true, true], text: `Peso Total`},
            {border: [false, false, true, true], text: `${this.formatonumeros((datos_orden.peso_Total).toFixed(2))}`},
            '',
            {border: [true, false, true, true], text: `Subtotal`},
            {border: [false, false, true, true], text: `$${this.formatonumeros((datos_orden.valor_Total).toFixed(2))}`},
          ],
          [
            '',
            '',
            '',
            '',
            {border: [true, false, true, true], text: `IVA ${datos_orden.iva}%`},
            {border: [false, false, true, true], text: `$${this.formatonumeros(((datos_orden.valor_Total * datos_orden.iva) / 100).toFixed(2))}`},
          ],
          [
            '',
            '',
            '',
            '',
            {border: [true, false, true, true], text: `Valor Total`},
            {border: [false, false, true, true], text: `$${this.formatonumeros((datos_orden.valor_Total + ((datos_orden.valor_Total * datos_orden.iva) / 100)).toFixed(2))}`},
          ],
        ]
      },
      layout: { defaultBorder: false, },
      fontSize: 8,
    }
  }

  observacionPDF(datos_orden){
    return {
      margin: [0, 20],
      table: {
        widths: ['*'],
        body: [
          [{ border: [true, true, true, false], text: `Observación: `, style: 'subtitulo' }],
          [{ border: [true, false, true, true], text: `${datos_orden.observacion.toString().trim()}` }]
        ]
      },
      fontSize: 9,
    }
  }

  /** Actualizar Precio de la materia prima al momento de crear la OC*/
  actualizarPrecioMatPrimas(){
    for (let index = 0; index < this.materiasPrimasSeleccionadas.length; index++) {
      if(this.materiasPrimasSeleccionadas[index].Id_Mp != 84 && this.materiasPrimasSeleccionadas[index].Id_Tinta == 2001 && this.materiasPrimasSeleccionadas[index].Id_Bopp == 1) {
        this.materiaPrimaService.srvObtenerListaPorId(this.materiasPrimasSeleccionadas[index].Id).subscribe(dataMatPrimas =>{
          this.cargarDatosMatPrima(this.materiasPrimasSeleccionadas[index], dataMatPrimas);
        });
      }
    }
  }

  /** Función que cargará los datos de las materias primas para luego actualizarlas. */
  cargarDatosMatPrima(datosArray : any, data : any){
    const info : any = {
      MatPri_Id : data.matPri_Id,
      MatPri_Nombre : data.matPri_Nombre,
      MatPri_Descripcion :data.matPri_Descripcion,
      MatPri_Stock: data.matPri_Stock,
      UndMed_Id: data.undMed_Id,
      CatMP_Id: data.catMP_Id,
      MatPri_Precio: datosArray.Precio,
      TpBod_Id: data.tpBod_Id,
      MatPri_Fecha:data.matPri_Fecha,
      MatPri_Hora: data.matPri_Hora,
    }
    this.materiaPrimaService.srvActualizar(info.MatPri_Id, info).subscribe(null, () => this.mensajeService.mensajeError(`Error`, 'No fue posible actualizar el precio de las materias primas'));
  }

  /** Actualizar Precio de la materia prima al momento de crear la OC */
  actualizarPrecioTintas(){
    for (let index = 0; index < this.materiasPrimasSeleccionadas.length; index++) {
      if(this.materiasPrimasSeleccionadas[index].Id_Tinta != 2001 && this.materiasPrimasSeleccionadas[index].Id_Tinta > 2001)
      this.servicioTintas.srvObtenerListaPorId(this.materiasPrimasSeleccionadas[index].Id).subscribe(dataTintas =>{
         this.cargarDatosTintas(this.materiasPrimasSeleccionadas[index], dataTintas);
      });
    }
  }

  /** Función que cargará los datos de las materias primas para luego actualizarlas. */
  cargarDatosTintas(datosArray : any, data : any){
    const info : any = {
      Tinta_Id : data.tinta_Id,
      Tinta_Nombre : data.tinta_Nombre,
      Tinta_Descripcion : data.tinta_Descripcion,
      Tinta_Stock : data.tinta_Stock,
      Tinta_CodigoHexadecimal : data.tinta_CodigoHexadecimal,
      UndMed_Id : data.undMed_Id,
      CatMP_Id : data.catMP_Id,
      Tinta_Precio : datosArray.Precio,
      TpBod_Id : data.tpBod_Id,
      Tinta_InvInicial : data.tinta_InvInicial,
      Tinta_FechaIngreso : data.tinta_FechaIngreso,
      Tinta_Hora : data.tinta_Hora,
    }
    this.servicioTintas.srvActualizar(info.Tinta_Id, info).subscribe(null, () => this.mensajeService.mensajeError(`Error`, 'No fue posible actualizar el precio de las tintas'));
  }

  // Funcion que va a elminar de la base de datos una de las materias primas, bopp, tintas escogidas al momento de editar la orden de compra
  eliminarMateriaPrima(data : any){
    data = this.mpSeleccionada;
    this.dtOrdenCompraService.GetMateriaPrimaOrdenCompa(this.FormOrdenCompra.value.ConsecutivoOrden, data.Id).subscribe(datos_orden => {
      if (datos_orden.length > 0) {
          this.onReject();
          for (let i = 0; i < datos_orden.length; i++) {
            this.dtOrdenCompraService.deleteID_DtOrdenCompra(datos_orden[i]).subscribe(() => {
              this.quitarMateriaPrima(data);
              this.llave = 'pdf';
              this.mensajeService.mensajeAdvertencia('Advertencia', `Se ha eliminado definitivamente la materia prima ${data.Nombre} de la orden de compra!`);
            }, () => this.mensajeService.mensajeError(`Error`, `¡No se pudo eliminar la materia prima de la orden de compra!`));
          }
      } else this.quitarMateriaPrima(data);
    });
  }

  // Funcion que editará la informacion general de la orden de compra
  editarOrdenCompra(){
    if (this.FormOrdenCompra.valid) {
      if (this.materiasPrimasSeleccionadas.length > 0) {
        this.cargando = false;
        let observacion : string = this.FormOrdenCompra.value.Observacion;
        if (observacion == null) observacion = '';
        this.ordenCompraService.getId_OrdenCompra(this.FormOrdenCompra.value.ConsecutivoOrden).subscribe(datos_Orden => {
          let info : any = {
            Oc_Id : this.FormOrdenCompra.value.ConsecutivoOrden,
            Usua_Id : datos_Orden.usua_Id,
            Oc_Fecha : datos_Orden.oc_Fecha,
            Oc_Hora : datos_Orden.oc_Hora,
            Prov_Id : this.FormOrdenCompra.value.Id_Proveedor,
            Estado_Id : datos_Orden.estado_Id,
            Oc_ValorTotal : this.calcularCostoMateriaPrima(),
            Oc_PesoTotal : this.calcularCantMateriaPrima(),
            TpDoc_Id : 'OCMP',
            Oc_Observacion : (observacion).toUpperCase(),
            IVA : this.iva,
          }
          this.ordenCreada = this.FormOrdenCompra.value.ConsecutivoOrden;
          this.ordenCompraService.putId_OrdenCompra(this.FormOrdenCompra.value.ConsecutivoOrden, info).subscribe(() => this.editarDtOrdenCompa(), () => {
            this.mensajeService.mensajeError(`Error`, `¡Error al Editar la Orden de Compra!`);
            this.cargando = false;
          });
        }, () => this.mensajeService.mensajeError(`Error`, `¡No se pudo obtener información de la orden de compra a editar!`));
      } else this.mensajeService.mensajeAdvertencia(`Advertencia`, `¡Debe escoger minimo 1 materia prima!`);
    } else this.mensajeService.mensajeAdvertencia(`Advertencia`, `¡Hay campos vacios!`);
  }

  // Funcion que va a editar los detalles de la orden de compra
  editarDtOrdenCompa(){
    let count : number = 0;
    for (let i = 0; i < this.materiasPrimasSeleccionadas.length; i++) {
      this.dtOrdenCompraService.GetMateriaPrimaOrdenCompa(this.FormOrdenCompra.value.ConsecutivoOrden, this.materiasPrimasSeleccionadas[i].Id).subscribe(datos_orden => {
        if (datos_orden.length == 0) {
          let info : any = {
            Oc_Id : this.FormOrdenCompra.value.ConsecutivoOrden,
            MatPri_Id : this.materiasPrimasSeleccionadas[i].Id_Mp,
            Tinta_Id : this.materiasPrimasSeleccionadas[i].Id_Tinta,
            BOPP_Id : this.materiasPrimasSeleccionadas[i].Id_Bopp,
            Doc_CantidadPedida : this.materiasPrimasSeleccionadas[i].Cantidad,
            UndMed_Id : this.materiasPrimasSeleccionadas[i].Und_Medida,
            Doc_PrecioUnitario : this.materiasPrimasSeleccionadas[i].Precio,
          }
          this.dtOrdenCompraService.insert_DtOrdenCompra(info).subscribe(() => {
            count++;
            if (count == this.materiasPrimasSeleccionadas.length) {
              this.GuardadoExitoso();
              this.mostrarEleccion(0, 'pdf');
            }
          }, error => {
            this.mensajeService.mensajeError(`Error`, `¡Error al crear la(s) materia(s) prima(s) pedida(s)!`);
            this.cargando = false;
            error = true;
          });
        } else {
          let info : any = {
            Doc_Codigo: datos_orden[0],
            Oc_Id : this.FormOrdenCompra.value.ConsecutivoOrden,
            MatPri_Id : this.materiasPrimasSeleccionadas[i].Id_Mp,
            Tinta_Id : this.materiasPrimasSeleccionadas[i].Id_Tinta,
            BOPP_Id : this.materiasPrimasSeleccionadas[i].Id_Bopp,
            Doc_CantidadPedida : this.materiasPrimasSeleccionadas[i].Cantidad,
            UndMed_Id : this.materiasPrimasSeleccionadas[i].Und_Medida,
            Doc_PrecioUnitario : this.materiasPrimasSeleccionadas[i].Precio,
          }
          this.dtOrdenCompraService.putId_DtOrdenCompra(datos_orden[0], info).subscribe(() => {
            count++;
            if (count == this.materiasPrimasSeleccionadas.length) {
              this.GuardadoExitoso();
              this.mostrarEleccion(0, 'pdf');
            }
          }, error => {
            this.mensajeService.mensajeError(`Error`, `¡Error al crear la(s) materia(s) prima(s) pedida(s)!`);
            this.cargando = false;
            error = true;
          });
        }
      });
    }
  }

  /** Función para mostrar una elección de eliminación de OT/Rollo de la tabla. */
  mostrarEleccion(item : any, modo : string){
    this.llave = modo;
    setTimeout(() => {
      if(this.llave == 'quitar') {
        this.mpSeleccionada = item;
        this.messageService.add({severity:'warn', key: this.llave, summary:'Elección', detail: `Está seguro que desea quitar la materia prima de la orden de compra?`, sticky: true});
      }
      if(this.llave == 'eliminar') {
        this.mpSeleccionada = item;
        this.messageService.add({severity:'warn', key: this.llave, summary:'Elección', detail: `Está seguro que desea eliminar definitivamente la materia prima de la orden de compra?, recuerda que se quitará también de la base de datos!`, sticky: true});
      }
      if(this.llave == 'pdf') this.messageService.add({severity:'success', key: this.llave, summary:'Elección', detail: `¡Se ha creado la orden de compra exitosamente!, ¿Deseas ver el detalle en pdf?`, sticky: true});
    }, 200);
  }

  /** Función para quitar mensaje de elección */
  onReject = () => this.messageService.clear(this.llave);
}