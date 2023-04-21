import { Component, Inject, Injectable, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import pdfMake from 'pdfmake/build/pdfmake';
import { MessageService } from 'primeng/api';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';
import { EntradaBOPPService } from 'src/app/Servicios/BOPP/entrada-BOPP.service';
import { DetallesOrdenesCompraService } from 'src/app/Servicios/DetallesOrdenCompra/DetallesOrdenesCompra.service';
import { MateriaPrimaService } from 'src/app/Servicios/MateriaPrima/materiaPrima.service';
import { OrdenCompra_MateriaPrimaService } from 'src/app/Servicios/OrdenCompra/OrdenCompra_MateriaPrima.service';
import { ProveedorService } from 'src/app/Servicios/Proveedor/proveedor.service';
import { TintasService } from 'src/app/Servicios/Tintas/tintas.service';
import { UnidadMedidaService } from 'src/app/Servicios/UnidadMedida/unidad-medida.service';

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
  categoriasMP : any [] = []; //Variable que almcanará las categorias de la tabla Materia_Prima
  categoriasTintas : any [] = []; //Variable que almcanará las categorias de la tabla Tintas
  categoriasBOPP : any [] = []; //Variable que almcanará las categorias de la tabla BOPP
  mpSeleccionada : any [];
  edicionOrdenCompra : boolean = false;
  llave : string = 'pdf';
  ordenCreada : number;

  constructor(private frmBuilder : FormBuilder,
                @Inject(SESSION_STORAGE) private storage: WebStorageService,
                  private proveedorService : ProveedorService,
                    private materiaPrimaService : MateriaPrimaService,
                      private undMedidaService : UnidadMedidaService,
                        private ordenCompraService : OrdenCompra_MateriaPrimaService,
                          private dtOrdenCompraService : DetallesOrdenesCompraService,
                            private servicioTintas : TintasService,
                              private messageService: MessageService,
                                private boppService : EntradaBOPPService,) {

    this.FormOrdenCompra = this.frmBuilder.group({
      ConsecutivoOrden : ['', Validators.required],
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
    });
  }

  ngOnInit(){
    this.lecturaStorage();
    this.obtenerUnidadesMedida();
    this.obtenerMateriaPrima();
    this.generarConsecutivo();
    this.consultarCategorias();
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
    this.edicionOrdenCompra = false;
    this.FormMateriaPrima.reset();
    this.FormOrdenCompra.reset();
    this.materiasPrimasSeleccionada_ID = [];
    this.materiasPrimasSeleccionadas = [];
    this.cargando = false;
    this.cantidadTotalPrecio = 0;
    this.catidadTotalPeso = 0;
    this.generarConsecutivo();
    this.mpSeleccionada = [];
  }

  // Funcion que va a limpiar los campos de materia prima
  limpiarCamposMateriaPrima = () => this.FormMateriaPrima.reset();

  //Funcion que va a consultar los proveedores por el nombre que esten escribiendo en el campo de proveedor
  consultarProveedores(){
    this.proveedores = [];
    let nombre : string = this.FormOrdenCompra.value.Proveedor.trim();
    if (nombre != '') this.proveedorService.getProveedorLike(nombre).subscribe(datos_Proveedores => { this.proveedores = datos_Proveedores; });
  }

  // Funcion que va a consultar las categorias de las tablas Materia_Prima, Tintas y BOPP
  consultarCategorias(){
    this.materiaPrimaService.GetCategoriasMateriaPrima().subscribe(datos => { this.categoriasMP = datos; });
    this.servicioTintas.GetCategoriasTintas().subscribe(datos => { this.categoriasTintas = datos; });
    this.boppService.GetCategoriasBOPP().subscribe(datos => { this.categoriasBOPP = datos; });
  }

  // Funcion que le va a cambiar el nombre al proveedor
  cambiarNombreProveedor(){
    let id : number = this.FormOrdenCompra.value.Proveedor;
    let nuevo : any[] = this.proveedores.filter((item) => item.prov_Id == id)
    this.FormOrdenCompra.patchValue({ Proveedor : nuevo[0].prov_Nombre, Id_Proveedor : nuevo[0].prov_Id, });
  }

  // Generar Consecutivo de Orden de Compra
  generarConsecutivo(){
    this.ordenCompraService.getUltimoId_OrdenCompra().subscribe(datos => this.FormOrdenCompra.patchValue({ ConsecutivoOrden : datos + 1, }), error => {
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
    this.undMedidaService.srvObtenerLista().subscribe(datos_undMedida => {
      for (let i = 0; i < datos_undMedida.length; i++) {
        this.unidadesMedida.push(datos_undMedida[i].undMed_Id);
      }
    });
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
    }, error => { this.mostrarError(`Error`, `¡No se pudo obtener información sobre la materia prima seleccionada!`); });
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
          if (this.categoriasTintas.includes(categoria)) info.Id_Tinta = info.Id;
          else if (this.categoriasMP.includes(categoria)) info.Id_Mp = info.Id;
          else if (this.categoriasBOPP.includes(categoria)) info.Id_Bopp = info.Id;
          this.materiasPrimasSeleccionada_ID.push(this.FormMateriaPrima.value.Id);
          this.materiasPrimasSeleccionadas.push(info);
          this.catidadTotalPeso += this.FormMateriaPrima.value.Cantidad;
          this.cantidadTotalPrecio += (this.FormMateriaPrima.value.Cantidad * this.FormMateriaPrima.value.PrecioOculto);
          this.FormMateriaPrima.reset();
        } else this.mostrarAdvertencia(`Advertencia`, `¡La cantidad de la materia prima seleccionada debe ser mayor que 0!`);
      } else this.mostrarAdvertencia(`Advertencia`, `¡La materia prima '${this.FormMateriaPrima.value.Nombre}' ya fue seleccionada previamante!`);
    } else this.mostrarAdvertencia(`Advertencia`, `¡Hay campos vacios!`);
  }

  // Funcion que va a quitar la materia prima
  quitarMateriaPrima(data : any){
    data = this.mpSeleccionada;
    this.onReject();
    for (let i = 0; i < this.materiasPrimasSeleccionadas.length; i++) {
      if (this.materiasPrimasSeleccionadas[i].Id == data.Id) {
        this.materiasPrimasSeleccionadas.splice(i, 1);
        this.catidadTotalPeso -= data.Cantidad;
        this.cantidadTotalPrecio -= data.SubTotal;
        for (let j = 0; j < this.materiasPrimasSeleccionada_ID.length; j++) {
          if (data.Id == this.materiasPrimasSeleccionada_ID[j]) this.materiasPrimasSeleccionada_ID.splice(j, 1);
        }
        this.mostrarConfirmacion(`Confirmación`, `Se ha quitado la materia prima seleccionada de la tabla!`);
      }
    }
    this.llave = 'pdf';
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
    if (this.FormOrdenCompra.valid) this.materiasPrimasSeleccionadas.length > 0 ? this.crearOrdenCompra() : this.mostrarAdvertencia(`¡Debe escoger minimo 1 materia prima!`);
    else this.mostrarAdvertencia(`¡Hay campos vacios!`);
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
        this.mostrarAdvertencia(`Advertencia`, `¡No se encontraron registros para orden de compra N° ${ordenCompra}!`);
        this.limpiarTodo();
      }
    }, error => {
      this.mostrarError(`Error`, `¡No se pudo obtener información de la orden de compra N° ${ordenCompra}!`);
      this.limpiarTodo();
    });
  }

  // Funcion que va a crear la orden de compra
  crearOrdenCompra(){
    this.cargando = false;
    let info : any = {
      Usua_Id : this.storage_Id,
      Oc_Fecha : moment().format('YYYY-MM-DD'),
      Oc_Hora : moment().format("H:mm:ss"),
      Prov_Id : this.FormOrdenCompra.value.Id_Proveedor,
      Estado_Id : 11,
      Oc_ValorTotal : this.cantidadTotalPrecio,
      Oc_PesoTotal : this.catidadTotalPeso,
      TpDoc_Id : 'OCMP',
      Oc_Observacion : this.FormOrdenCompra.value.Observacion == null ? '' : (this.FormOrdenCompra.value.Observacion).toUpperCase(),
    }
    this.ordenCompraService.insert_OrdenCompra(info).subscribe(datos_ordenCompra => {
      this.ordenCreada = datos_ordenCompra.oc_Id;
      this.mostrarEleccion(0, 'pdf')
      this.crearDtOrdenCompra(datos_ordenCompra.oc_Id);
    }, error => {
      this.mostrarError(`Error`, `¡Error al crear la orden de compra!`);
      this.cargando = false;
    });
  }

  // Funcion que va a rear detalles de Orden de Compra
  crearDtOrdenCompra(orden : number){
    let error : boolean = false;
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
      this.dtOrdenCompraService.insert_DtOrdenCompra(info).subscribe(datos_dtOrden => {
        this.GuardadoExitoso();
        error = false;
      }, error => {
        this.mostrarError(`Error`, `¡Error al insertar la(s) materia(s) prima(s) pedida(s)!`);
        this.cargando = false;
        error = true;
        this.mostrarError('No se mostrará la informacion del PDF');
      });
    }
  }

  // Funcion que mostrará el mensaje de que todo el proceso de guardado fue exitoso
  GuardadoExitoso(){
    this.actualizarPrecioMatPrimas();
    this.actualizarPrecioTintas();
    setTimeout(() => { this.limpiarTodo(); }, 3000);
  }

  //Buscar informacion de la orden de compra creada
  buscarinfoOrdenCompra(){
    this.onReject();
    this.cargando = true;
    this.dtOrdenCompraService.GetOrdenCompra(this.ordenCreada).subscribe(datos_orden => {
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
      setTimeout(() => {this.generarPDF(); }, 1000);
    }, error => { this.mostrarError(`Error`, `¡No se pudo obtener información de la última orden de compra creada!`); });
  }

  // Funcion que se encargará de poner la informcaion en el PDF y generarlo
  generarPDF(){
    let nombre : string = this.storage.get('Nombre');
    this.dtOrdenCompraService.GetOrdenCompra(this.ordenCreada).subscribe(datos_orden => {
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
        this.ordenCreada = 0;
        this.limpiarTodo();
        break;
      }
    }, error => { this.mostrarError(`Error`, `¡No se pudo obtener la información de la última orden de compra creada!`); });
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
      if(this.materiasPrimasSeleccionadas[index].Id_Mp != 84 && this.materiasPrimasSeleccionadas[index].Id_Tinta == 2001 && this.materiasPrimasSeleccionadas[index].Id_Bopp == 1) {
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
      this.mostrarError(`Error`, 'No fue posible actualizar el precio de las materias primas');
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
    this.servicioTintas.srvActualizar(infoTintas.Tinta_Id, infoTintas).subscribe(data, error => this.mostrarError(`Error`, 'No fue posible actualizar el precio de las tintas'));
  }

  // Funcion que va a elminar de la base de datos una de las materias primas, bopp, tintas escogidas al momento de editar la orden de compra
  eliminarMateriaPrima(data : any){
    data = this.mpSeleccionada;
    this.dtOrdenCompraService.GetMateriaPrimaOrdenCompa(this.FormOrdenCompra.value.ConsecutivoOrden, data.Id).subscribe(datos_orden => {
      if (datos_orden.length > 0) {
          this.onReject();
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
                  this.llave = 'pdf';
                  this.mostrarAdvertencia('Advertencia', `Se ha eliminado definitivamente la materia prima ${data.Nombre} de la orden de compra!`);
                  break;
                }
              }
            }, error => { this.mostrarError(`Error`, `¡No se pudo eliminar la materia prima de la orden de compra!`); });
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
            Oc_ValorTotal : this.cantidadTotalPrecio,
            Oc_PesoTotal : this.catidadTotalPeso,
            TpDoc_Id : 'OCMP',
            Oc_Observacion : (observacion).toUpperCase(),
          }
          this.ordenCreada = this.FormOrdenCompra.value.ConsecutivoOrden;
          this.ordenCompraService.putId_OrdenCompra(this.FormOrdenCompra.value.ConsecutivoOrden, info).subscribe(datos_ordenCompra => { this.editarDtOrdenCompa(); }, error => {
            this.mostrarError(`Error`, `¡Error al Editar la Orden de Compra!`);
            this.cargando = false;
          });
        }, error => { this.mostrarError(`Error`, `¡No se pudo obtener información de la orden de compra a editar!`); });
      } else this.mostrarAdvertencia(`Advertencia`, `¡Debe escoger minimo 1 materia prima!`);
    } else this.mostrarAdvertencia(`Advertencia`, `¡Hay campos vacios!`);
  }

  // Funcion que va a editar los detalles de la orden de compra
  editarDtOrdenCompa(){
    let error : boolean = false;
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
          this.dtOrdenCompraService.insert_DtOrdenCompra(info).subscribe(datos_dtOrden => { error = false; }, error => {
            this.mostrarError(`Error`, `¡Error al crear la(s) materia(s) prima(s) pedida(s)!`);
            this.cargando = false;
            error = true;
          });
        }
      });
    }
    !error ? this.mostrarEleccion(0, 'pdf') : this.mostrarError('No se mostrará la informacion del PDF') ;
    setTimeout(() => { this.GuardadoExitoso(); }, this.materiasPrimasSeleccionadas.length * 10);
  }

  /** Mostrar mensaje de confirmación  */
  mostrarConfirmacion = (mensaje : any, titulo?: any) => this.messageService.add({severity: 'success', summary: mensaje,  detail: titulo, life : 2000});

  /** Mostrar mensaje de error  */
  mostrarError = (mensaje : any, titulo?: any) => this.messageService.add({severity:'error', summary: mensaje, detail: titulo, life : 5000});

  /** Mostrar mensaje de advertencia */
  mostrarAdvertencia = (mensaje : any, titulo?: any) => this.messageService.add({severity:'warn', summary: mensaje, detail: titulo, life : 2000});

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
  onReject(){
    this.messageService.clear(this.llave);
  }
}
