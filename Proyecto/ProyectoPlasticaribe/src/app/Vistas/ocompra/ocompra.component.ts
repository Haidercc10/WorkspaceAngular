import { Component, Inject, Injectable, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import pdfMake from 'pdfmake/build/pdfmake';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';
import { DetallesOrdenesCompraService } from 'src/app/Servicios/DetallesOrdenCompra/DetallesOrdenesCompra.service';
import { MateriaPrimaService } from 'src/app/Servicios/MateriaPrima/materiaPrima.service';
import { OrdenCompra_MateriaPrimaService } from 'src/app/Servicios/OrdenCompra/OrdenCompra_MateriaPrima.service';
import { ProveedorService } from 'src/app/Servicios/Proveedor/proveedor.service';
import { RolesService } from 'src/app/Servicios/Roles/roles.service';
import { TintasService } from 'src/app/Servicios/Tintas/tintas.service';
import { UnidadMedidaService } from 'src/app/Servicios/UnidadMedida/unidad-medida.service';
import Swal from 'sweetalert2';

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

  //Llamar modales, inicializados como falsos para que no se carguen al ingresar a la pagina.
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
  catidadTotalPeso : number = 0; //Variable que almacenará la sumatoria del peso de todas las materia primas seleccionadas
  cantidadTotalPrecio : number = 0; //Variable que almacenará la sumatoria del precio de todas las materias primas seleccionadas
  materiasPrimasSeleccionada_ID : any [] = []; //Variable que almacenará los ID de las materias primas que se han seleccionado para que no puedan ser elegidas nuevamente
  consecutivoOrdenCompra : any = 0; //Variable que almacenará el consecutivo de la orden de compra
  informacionPDF : any [] = []; //Variable que tendrá la informacion de la materia prima pedida en la orden de compra

  edicionOrdenCompra : boolean = false;

  constructor(private frmBuilder : FormBuilder,
                private rolService : RolesService,
                  @Inject(SESSION_STORAGE) private storage: WebStorageService,
                    private proveedorService : ProveedorService,
                      private materiaPrimaService : MateriaPrimaService,
                        private undMedidaService : UnidadMedidaService,
                          private ordenCompraService : OrdenCompra_MateriaPrimaService,
                            private dtOrdenCompraService : DetallesOrdenesCompraService,
                              private servicioTintas : TintasService) {

    this.FormOrdenCompra = this.frmBuilder.group({
      ConsecutivoOrden : ['', Validators.required],
      Proveedor : ['', Validators.required],
      Id_Proveedor : [''],
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
    });
  }

  ngOnInit(){
    this.lecturaStorage();
    this.obtenerUnidadesMedida();
    this.obtenerMateriaPrima();
    this.generarConsecutivo();
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

  // Funcion que limpiará todos los campos de la vista
  limpiarTodo(){
    this.FormMateriaPrima.reset();
    this.FormOrdenCompra.reset();
    this.materiasPrimasSeleccionada_ID = [];
    this.materiasPrimasSeleccionadas = [];
    this.cargando = false;
    this.cantidadTotalPrecio = 0;
    this.catidadTotalPeso = 0;
    this.generarConsecutivo();
  }

  // Funcion que va a limpiar los campos de materia prima
  limpiarCamposMateriaPrima(){
    this.FormMateriaPrima.reset();
  }

  //Funcion que va a consultar los proveedores por el nombre que esten escribiendo en el campo de proveedor
  consultarProveedores(){
    this.proveedores = [];
    let nombre : string = this.FormOrdenCompra.value.Proveedor.trim();
    if (nombre != '') {
      this.proveedorService.getProveedorLike(nombre).subscribe(datos_Proveedores => { this.proveedores = datos_Proveedores; });
    }
  }

  // Funcion que le va a cambiar el nombre al proveedor
  cambiarNombreProveedor(){
    let id : number = this.FormOrdenCompra.value.Proveedor;
    this.proveedorService.srvObtenerListaPorId(id).subscribe(datos_proveedor => {
      this.FormOrdenCompra.patchValue({
        Proveedor : datos_proveedor.prov_Nombre,
        Id_Proveedor : id,
      });
    }, error => { this.mensajeError(`¡No se pudo obtener información del proveedor!`, error.message); });
  }

  // Generar Consecutivo de Orden de Compra
  generarConsecutivo(){
    this.ordenCompraService.getUltimoId_OrdenCompra().subscribe(datos_ordenCompra => {
      this.FormOrdenCompra.patchValue({ ConsecutivoOrden : datos_ordenCompra + 1, });
    }, error => {
      this.FormOrdenCompra.patchValue({ ConsecutivoOrden : 1, });
      this.cargando = false;
    });
  }

  // Funcion que va a consultar la materia prima
  obtenerMateriaPrima(){
    this.materiaPrimaService.getMpTintaBopp().subscribe(datos_materiaPrimas => {
      this.materiaPrima = datos_materiaPrimas;
      this.materiaPrima.sort((a,b) => a.nombre.localeCompare(b.nombre));
    });
  }

  // Funcion que va a consultar las unidades de medida
  obtenerUnidadesMedida(){
    this.undMedidaService.srvObtenerLista().subscribe(datos_undMedida => { this.unidadesMedida = datos_undMedida; });
  }

  //Funcion que va a mostrar el nombre de la materia prima
  cambiarNombreMateriaPrima(){
    let id : number = this.FormMateriaPrima.value.Nombre;
    this.materiaPrimaService.getInfoMpTintaBopp(id).subscribe(datos_materiaPrima => {
      for (let i = 0; i < datos_materiaPrima.length; i++) {
        this.FormMateriaPrima.patchValue({
          Id : datos_materiaPrima[i].id,
          Nombre : datos_materiaPrima[i].nombre,
          Cantidad : 0,
          UndMedida : datos_materiaPrima[i].undMedida,
          Precio : this.formatonumeros(parseFloat(datos_materiaPrima[i].precio).toFixed(2)),
          PrecioOculto : parseFloat(datos_materiaPrima[i].precio).toFixed(2),
          Categoria : datos_materiaPrima[i].categoria,
        });
      }
    }, error => { this.mensajeError(`¡No se pudo obtener información sobre la materia prima seleccionada!`, error.message); });
  }

  // Funcion que va a añadir la materia prima a la tabla
  cargarMateriaPrima(){
    let categoria : number = this.FormMateriaPrima.value.Categoria;
    if (this.FormMateriaPrima.valid){
      if (!this.materiasPrimasSeleccionada_ID.includes(this.FormMateriaPrima.value.Id)) {
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
          if (categoria == 7 || categoria == 8 || categoria == 13) info.Id_Tinta = info.Id;
          else if (categoria == 1 || categoria == 2 || categoria == 3 || categoria == 4 || categoria == 5 || categoria == 9 || categoria == 10) info.Id_Mp = info.Id;
          else if (categoria == 6 || categoria == 14 || categoria == 15) info.Id_Bopp = info.Id;
          this.materiasPrimasSeleccionada_ID.push(this.FormMateriaPrima.value.Id);
          this.materiasPrimasSeleccionadas.push(info);
          this.catidadTotalPeso += this.FormMateriaPrima.value.Cantidad;
          this.cantidadTotalPrecio += (this.FormMateriaPrima.value.Cantidad * this.FormMateriaPrima.value.PrecioOculto);
          this.FormMateriaPrima.reset();
        } else this.mensajeAdvertencia(`¡La cantidad de la materia prima seleccionada debe ser mayor que 0!`);
      } else this.mensajeAdvertencia(`¡La materia prima '${this.FormMateriaPrima.value.Nombre}' ya fue seleccionada previamante!`);
    } else this.mensajeAdvertencia(`¡Hay campos vacios!`);
  }

  // Funcion que va a quitar la materia prima
  quitarMateriaPrima(data : any){
    Swal.fire({
      title: '¿Estás seguro de eliminar la Materia Prima de la Orden de Compra?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        for (let i = 0; i < this.materiasPrimasSeleccionadas.length; i++) {
          if (this.materiasPrimasSeleccionadas[i].Id == data.Id) {
            this.materiasPrimasSeleccionadas.splice(i, 1);
            this.catidadTotalPeso -= data.Cantidad;
            this.cantidadTotalPrecio -= data.SubTotal;
            for (let j = 0; j < this.materiasPrimasSeleccionada_ID.length; j++) {
              if (data.Id == this.materiasPrimasSeleccionada_ID[j]) this.materiasPrimasSeleccionada_ID.splice(j, 1);
            }
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
              title: `¡Se ha quitado la Materia Prima ${data.Nombre} de la Orden de Compra!`
            });
          }
        }
      }
    });
  }

  // Funcion para llamar el modal que crea proveedores
  LlamarModalCrearProveedor() {
    this.ModalCrearProveedor = true;
  }

  // Funcion para llamar el modal que pregunta que materia prima se va a crear
  LlamarModalCrearMateriaPrima(){
    this.modalCreacionMateriaPrima = true;
  }

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
    if (this.FormOrdenCompra.valid) {
      if (this.materiasPrimasSeleccionadas.length > 0) this.crearOrdenCompra();
      else this.mensajeAdvertencia(`¡Debe escoger minimos 1 Materia Prima!`);
    } else this.mensajeAdvertencia(`¡Hay Campos Vacios!`);
  }

  // Funcion que va a consultar la información de una orden de compra existente y prepará los campos para que sea editable
  consultarOrdenCompra(){
    let ordenCompra : number = this.FormOrdenCompra.value.ConsecutivoOrden;
    this.dtOrdenCompraService.GetOrdenCompra(ordenCompra).subscribe(datos_orden => {
      if (datos_orden.length > 0) {
        this.edicionOrdenCompra = true;
        this.FormOrdenCompra.reset();
        this.FormMateriaPrima.reset();
        this.materiasPrimasSeleccionadas = [];
        this.catidadTotalPeso = 0;
        this.cantidadTotalPrecio = 0;
        this.materiasPrimasSeleccionada_ID = [];
        this.consecutivoOrdenCompra = 0;
        this.informacionPDF = [];
        for (let i = 0; i < datos_orden.length; i++) {
          this.FormOrdenCompra.setValue({
            ConsecutivoOrden : ordenCompra,
            Proveedor : datos_orden[i].proveedor,
            Id_Proveedor : datos_orden[i].proveedor_Id,
            Observacion : datos_orden[i].observacion,
          });
          break;
        }
        for (let i = 0; i < datos_orden.length; i++) {
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
          this.catidadTotalPeso += datos_orden[i].cantidad;
          this.cantidadTotalPrecio += (datos_orden[i].cantidad * datos_orden[i].precio_Unitario);
        }
      } else {
        this.mensajeAdvertencia(`¡No se encontraon registros para orden de compra N° ${ordenCompra}!`);
        this.limpiarTodo();
      }
    }, error => {
      this.mensajeError(`¡No se pudo obtener infroamción de la Orden de Compra N° ${ordenCompra}!`, error.message);
      this.limpiarTodo();
    });
  }

  // Funcion que va a crear la orden de compra
  crearOrdenCompra(){
    this.cargando = false;
    let observacion : string = this.FormOrdenCompra.value.Observacion;
    if (observacion == null) observacion = '';
    let info : any = {
      Usua_Id : this.storage_Id,
      Oc_Fecha : moment().format('YYYY-MM-DD'),
      Oc_Hora : moment().format("H:mm:ss"),
      Prov_Id : this.FormOrdenCompra.value.Id_Proveedor,
      Estado_Id : 11,
      Oc_ValorTotal : this.cantidadTotalPrecio,
      Oc_PesoTotal : this.catidadTotalPeso,
      TpDoc_Id : 'OCMP',
      Oc_Observacion : (observacion).toUpperCase(),
    }
    this.ordenCompraService.insert_OrdenCompra(info).subscribe(datos_ordenCompra => { this.crearDtOrdenCompra(); }, error => {
      this.mensajeError(`¡Error al Crear la Orden de Compra!`, error.message);
      this.cargando = false;
    });
  }

  // Funcion que va a rear detalles de Orden de Compra
  crearDtOrdenCompra(){
    this.ordenCompraService.getUltimoId_OrdenCompra().subscribe(datos_ordenCompra => {
      for (let j = 0; j < this.materiasPrimasSeleccionadas.length; j++) {
        let info : any = {
          Oc_Id : datos_ordenCompra,
          MatPri_Id : this.materiasPrimasSeleccionadas[j].Id_Mp,
          Tinta_Id : this.materiasPrimasSeleccionadas[j].Id_Tinta,
          BOPP_Id : this.materiasPrimasSeleccionadas[j].Id_Bopp,
          Doc_CantidadPedida : this.materiasPrimasSeleccionadas[j].Cantidad,
          UndMed_Id : this.materiasPrimasSeleccionadas[j].Und_Medida,
          Doc_PrecioUnitario : this.materiasPrimasSeleccionadas[j].Precio,
        }
        this.dtOrdenCompraService.insert_DtOrdenCompra(info).subscribe(datos_dtOrden => { this.GuardadoExitoso(); }, error => {
          this.mensajeError(`¡Error al insertar la(s) materia(s) prima(s) pedida(s)!`, error.message);
          this.cargando = false;
        });
      }
    });
  }

  // Funcion que mostrará el mensaje de que todo el proceso de guardado fue exitoso
  GuardadoExitoso(){
    if (this.edicionOrdenCompra) {
      Swal.fire({
        icon: 'success',
        title: '¡Guardado Exitoso!',
        html:
        `<b>¡Orden de compra Editada con exito!</b><hr>`,
        showCloseButton: true,
        showConfirmButton: true,
        showCancelButton : true,
        confirmButtonColor : '#d44',
        cancelButtonText : `Cerrar`,
        confirmButtonText : 'Ver PDF <i class="pi pi-file-pdf"></i>',
      }).then((result) => {
        if (result.isConfirmed) this.buscarinfoOrdenCompra();
      });
    } else {
      Swal.fire({
        icon: 'success',
        title: '¡Guardado Exitoso!',
        html:
        `<b>¡Orden de compra Creada con exito!</b><hr>`,
        showCloseButton: true,
        showConfirmButton: true,
        showCancelButton : true,
        confirmButtonColor : '#d44',
        cancelButtonText : `Cerrar`,
        confirmButtonText : 'Ver PDF <i class="pi pi-file-pdf"></i>',
      }).then((result) => {
        if (result.isConfirmed) this.buscarinfoOrdenCompra();
      });
    }
    this.actualizarPrecioMatPrimas();
    this.actualizarPrecioTintas();
    setTimeout(() => { this.limpiarTodo(); }, 1500);
  }

  //Buscar informacion de la orden de compra creada
  buscarinfoOrdenCompra(){
    this.cargando = true;
    this.dtOrdenCompraService.GetUltimaOrdenCompra().subscribe(datos_orden => {
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
      setTimeout(() => {this.generarPDF(); }, 2500);
    }, error => { this.mensajeError(`¡No se pudo obtener información de la última orden de compra creada!`, error.message); });
  }

  // Funcion que se encargará de poner la informcaion en el PDF y generarlo
  generarPDF(){
    let nombre : string = this.storage.get('Nombre');
    this.dtOrdenCompraService.GetUltimaOrdenCompra().subscribe(datos_orden => {
      for (let i = 0; i < datos_orden.length; i++) {
        const pdfDefinicion : any = {
          info: {
            title: `Orden de Compra N° ${datos_orden[i].consecutivo}`
          },
          pageSize: {
            width: 630,
            height: 760
          },
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
                {
                  image : logoParaPdf,
                  width : 220,
                  height : 50
                },
                {
                  text: `Orden de Compra de Materia Prima N° ${datos_orden[i].consecutivo}`,
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
              text: `\n Información detallada del Proveedor \n \n`,
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
                    `Nombre: ${datos_orden[i].proveedor}`,
                    `ID: ${datos_orden[i].proveedor_Id}`,
                    `Tipo de ID: ${datos_orden[i].tipo_Id}`,
                  ],
                  [
                    `Telefono: ${datos_orden[i].telefono_Proveedor}`,
                    `Ciudad: ${datos_orden[i].ciudad_Proveedor}`,
                    `Tipo de Proveedor: ${datos_orden[i].tipo_Proveedor}`
                  ],
                  [
                    `E-mail: ${datos_orden[i].correo_Proveedor}`,
                    '',
                    ''
                  ]
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

            this.table(this.informacionPDF, ['Id', 'Nombre', 'Cantidad', 'Medida', 'Precio', 'SubTotal']),

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
            header: {
              fontSize: 10,
              bold: true
            },
            titulo: {
              fontSize: 20,
              bold: true
            }
          }
        }
        const pdf = pdfMake.createPdf(pdfDefinicion);
        pdf.open();
        this.cargando = false;
        break;
      }
    }, error => { this.mensajeError(`¡No se pudo obtener la información de la última orden de compra creada!`, error.message); });
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

  /** Actualizar Precio de la materia prima al momento de crear la OC*/
  actualizarPrecioMatPrimas(){
    for (let index = 0; index < this.materiasPrimasSeleccionadas.length; index++) {
      if(this.materiasPrimasSeleccionadas[index].Id_Mp != 84 && this.materiasPrimasSeleccionadas[index].Id_Tinta < 2000) {
        this.materiaPrimaService.srvObtenerListaPorId(this.materiasPrimasSeleccionadas[index].Id).subscribe(dataMatPrimas =>{
         this.cargarDatosMatPrima(this.materiasPrimasSeleccionadas[index], dataMatPrimas);
        });
      }
    }
  }

  /** Función que cargará los datos de las materias primas para luego actualizarlas. */
  cargarDatosMatPrima(datosArray : any, data : any){
    const infoMatPrima : any = {
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
    this.materiaPrimaService.srvActualizar(infoMatPrima.MatPri_Id, infoMatPrima).subscribe(dataMP => {  }, error => {
      this.mensajeError('No fue posible actualizar el precio de las Materias Primas');
    });
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
    const infoTintas : any = {
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
    this.servicioTintas.srvActualizar(infoTintas.Tinta_Id, infoTintas).subscribe(dataMP => {  }, error => {
      this.mensajeError('No fue posible actualizar el precio de las Tintas');
    });
  }

  // Funcion que va a elminar de la base de datos una de las materias primas, bopp, tintas escogidas al momento de editar la orden de compra
  eliminarMateriaPrima(data : any){
    this.dtOrdenCompraService.GetMateriaPrimaOrdenCompa(this.FormOrdenCompra.value.ConsecutivoOrden, data.Id).subscribe(datos_orden => {
      if (datos_orden.length > 0) {
        Swal.fire({
          title: '¿Estás seguro de eliminar la Materia Prima de la Orden de Compra?',
          text: `Al eliminar la materia prima en este apartado de edición se Eliminará Tambien de la Base de Datos`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Eliminar'
        }).then((result) => {
          if (result.isConfirmed) {
            for (let i = 0; i < datos_orden.length; i++) {
              this.dtOrdenCompraService.deleteID_DtOrdenCompra(datos_orden[i]).subscribe(datos_eliminados => {
                for (let i = 0; i < this.materiasPrimasSeleccionadas.length; i++) {
                  if (this.materiasPrimasSeleccionadas[i].Id == data.Id) {
                    this.materiasPrimasSeleccionadas.splice(i, 1);
                    this.catidadTotalPeso -= data.Cantidad;
                    this.cantidadTotalPrecio -= data.SubTotal;
                    for (let j = 0; j < this.materiasPrimasSeleccionada_ID.length; j++) {
                      if (data.Id == this.materiasPrimasSeleccionada_ID[j]) this.materiasPrimasSeleccionada_ID.splice(j, 1);
                    }
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
                      title: `¡Se ha quitado la Materia Prima ${data.Nombre} de la Orden de Compra!`
                    });
                    break;
                  }
                }
              }, error => { this.mensajeError(`¡No se pudo eliminar la materia de la orden de compra!`, error.message); });
            }
          }
        });
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
            Oc_ValorTotal : this.cantidadTotalPrecio,
            Oc_PesoTotal : this.catidadTotalPeso,
            TpDoc_Id : 'OCMP',
            Oc_Observacion : (observacion).toUpperCase(),
          }
          this.ordenCompraService.putId_OrdenCompra(this.FormOrdenCompra.value.ConsecutivoOrden, info).subscribe(datos_ordenCompra => { this.editarDtOrdenCompa(); }, error => {
            this.mensajeError(`¡Error al Editar la Orden de Compra!`, error.message);
            this.cargando = false;
          });
        }, error => { this.mensajeError(`¡No se pudo obtener información de la Orden de Compra a Editar!`, error.message); });
      } else this.mensajeAdvertencia(`¡Debe escoger minimos 1 Materia Prima!`);
    } else this.mensajeAdvertencia(`¡Hay Campos Vacios!`);
  }

  // Funcion que va a editar los detalles de la orden de compra
  editarDtOrdenCompa(){
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
          this.dtOrdenCompraService.insert_DtOrdenCompra(info).subscribe(datos_dtOrden => {  }, error => {
            this.mensajeError(`¡Error al Crear la(s) materia(s) prima(s) pedida(s)!`, error.message);
            this.cargando = false;
          });
        }
      });
    }
    setTimeout(() => { this.GuardadoExitoso(); }, this.materiasPrimasSeleccionadas.length * 10);
  }

  // Mensaje de Advertencia
  mensajeAdvertencia(mensaje : string, mensaje2 : string = ''){
    Swal.fire({ icon: 'warning', title: 'Advertencia', html:`<b>${mensaje}</b><hr> ` + `<spam>${mensaje2}</spam>`, showCloseButton: true, });
  }

  // Mensaje de Error
  mensajeError(text : string, error : any = ''){
    Swal.fire({ icon: 'error', title: 'Error', html: `<b>${text}</b><hr> ` +  `<spam style="color : #f00;">${error}</spam> `, showCloseButton: true, });
  }
}
