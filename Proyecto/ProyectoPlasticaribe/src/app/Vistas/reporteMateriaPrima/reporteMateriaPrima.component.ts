import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import moment from 'moment';
import { Table } from 'primeng/table/table';
import { AppComponent } from 'src/app/app.component';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';
import { EntradaBOPPService } from 'src/app/Servicios/BOPP/entrada-BOPP.service';
import { CategoriaMateriaPrimaService } from 'src/app/Servicios/CategoriasMateriaPrima/categoriaMateriaPrima.service';
import { MateriaPrimaService } from 'src/app/Servicios/MateriaPrima/materiaPrima.service';
import { TintasService } from 'src/app/Servicios/Tintas/tintas.service';
import { stepInventarioBopp as defaultSteps, defaultStepOptions } from 'src/app/data';
import { ShepherdService } from 'angular-shepherd';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UnidadMedidaService } from 'src/app/Servicios/UnidadMedida/unidad-medida.service';
import { modelMateriaPrima } from 'src/app/Modelo/modelMateriaPrima';
import { modelTintas } from 'src/app/Modelo/modelTintas';
import { modelBOPP } from 'src/app/Modelo/modelBOPP';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { BoppGenericoService } from 'src/app/Servicios/BoppGenerico/BoppGenerico.service';
import { modeloMovimientos_Entradas_MP } from 'src/app/Modelo/modeloMovimientos_Entradas_MP';
import { Movimientos_Entradas_MPService } from 'src/app/Servicios/Movimientos_Entradas_MP/Movimientos_Entradas_MP.service';
import { modelEntradas_Salidas_MP } from 'src/app/Modelo/modelEntradas_Salidas_MP';
import { Entradas_Salidas_MPService } from 'src/app/Servicios/Entradas_Salidas_MP/Entradas_Salidas_MP.service';

@Component({
  selector: 'app-reporteMateriaPrima',
  templateUrl: './reporteMateriaPrima.component.html',
  styleUrls: ['./reporteMateriaPrima.component.css']
})

export class ReporteMateriaPrimaComponent implements OnInit {

  FormEdicionMateriaPrima !: FormGroup;
  @ViewChild('dt') dt: Table | undefined;
  @ViewChild('dt_Polientileno') dt_Polientileno: Table | undefined;
  @ViewChild('dt_Tintas') dt_Tintas: Table | undefined;
  @ViewChild('dt_Biorientados') dt_Biorientados: Table | undefined;
  @ViewChild('dt_BoppGenerico') dt_BoppGenerico: Table | undefined;
  @ViewChild('dt_Biorientados2') dt_Biorientados2: Table | undefined;
  columnas: any[] = []; //Variable que almacenará las columnas de la tabla que no se verá inicialmente pero que se podrá elegir
  _columnasSeleccionada: any[] = []; //variable que almacenará las columnas de la tabla que han sido seleccionadas
  storage_Id: number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre: any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol: any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol: number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  today: any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  categorias: any = []; //variable que almacenará las categorias existentes
  undMedidas: any[] = []; //Variable que almacenará las unidades de medidas
  bodegas: any = []; //variable que almacenará las bodegas
  rongoFechas: any[] = []; //Variable que va a guardar el rango de fechas en el que se buscará informacion
  categoriasMP: any[] = []; //Variable que almcanará las categorias de la tabla Materia_Prima
  categoriasTintas: any[] = []; //Variable que almcanará las categorias de la tabla Tintas
  categoriasBOPP: any[] = []; //Variable que almcanará las categorias de la tabla BOPP
  arryMateriaPrimaFiltrada: any[] = []; //Variable que tendrá la informacion filtrada en las tablas
  load: boolean = true; //Variable que validará cuando vaya a salir la animacion de carga
  ArrayMateriaPrima: any[] = []; //Variable que tendrá la informacion de los productos que se piden en el nuevo pedido
  valorTotal: number = 0; //Variable que guardará el valor total de la total de toda la materia prima
  cantInicial: number = 0; //Variable que guardará la cantidad inicial total de materia prima
  cantEntrante: number = 0; //Variable que guardará la cantidad total entrante de la materia prima
  cantSaliente: number = 0; //Variable que guardará la cantidad total saliente de la materia prima
  cantExistencias: number = 0; //Variable que guardará la cantidad total en existencias de la materia prima
  cantDiferencia: number = 0; //Variable que guardará la cantidad total de diferencia entre lo inical y lo actual
  polietilenos: any[] = []; //Variable que va a almacenar la informacion de los polietilenos
  valorTotalPolietileno: number = 0; //Variable que guardará el valor tatal de la cantidad de todos los polietilenos
  cantInicialPolietileno: number = 0; //Variable que guardará la cantidad inicial total de polietilenos
  cantEntrantePolietileno: number = 0; //Variable que guardará la cantidad total entrante de polietilenos
  cantSalientePolietileno: number = 0; //Variable que guardará la cantidad total saliente de polietilenos
  cantExistenciasPolientileno: number = 0; //Variable que guardará la cantidad total en existencias de polietilenos
  cantDiferenciaPolietileno: number = 0; //Variable que guardará la cantidad total de diferencia entre lo inical y lo actual de los polietilenos
  tintas: any[] = []; //Variable que va a almacenar la informacion de las tintas
  valorTotalTintas: number = 0; //Variable que guardará el valor tatal de la cantidad de todos las tintas
  cantInicialTintas: number = 0; //Variable que guardará la cantidad inicial total de las tintas
  cantEntranteTintas: number = 0; //Variable que guardará la cantidad total entrante de las tintas
  cantSalienteTintas: number = 0; //Variable que guardará la cantidad total saliente de las tintas
  cantExistenciasTintas: number = 0; //Variable que guardará la cantidad total en existencias de las tintas
  cantDiferenciaTintas: number = 0; //Variable que guardará la cantidad total de diferencia entre lo inical y lo actual de las tintas
  biorientados: any[] = []; //Variable que va a almacenar la información de los biorientados
  valorTotalBiorientado: number = 0; //Variable que guardará el valor tatal de la cantidad de todos los biorientados
  cantInicialBiorientado: number = 0; //Variable que guardará la cantidad inicial total de los biorientados
  cantEntranteBiorientado: number = 0; //Variable que guardará la cantidad total entrante de los biorientados
  cantSalienteBiorientado: number = 0; //Variable que guardará la cantidad total saliente de los biorientados
  cantExistenciasBiorientado: number = 0; //Variable que guardará la cantidad total en existencias de los biorientados
  cantDiferenciaBiorientado: number = 0; //Variable que guardará la cantidad total de diferencia entre lo inical y lo actual de los biorientados
  modoSeleccionado: boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  modalCreacionMateriaPrima: boolean = false; //Variable para validar que se abra el modal en que se pregusntará que se creará
  ModalCrearMateriaPrima: boolean = false; //Variable para validar que se abra el modal de creacion de polietileno
  ModalCrearTintas: boolean = false; //Variable para validar que se abra el modal de creacion de tintas, chips, solvenetes
  modalEditarMateriasPrimas: boolean = false;
  modalVerBopps: boolean = false; /** Modal que cargará la información de los bopp asociados a los bopp genericos */
  arrayBopps: any = []; /** Array que cargará la información de los bopp genéricos con stock. */
  stockTotalBopps: number = 0; /** Variable que cargará el peso total del bopp generico agrupado */
  genericoSeleccionado: string = '';
  arrayModalBopp: any = []; /** Array que cargará en el modal los bopp asociados a los agrupados */
  valorTotalBopp: number = 0; /** Variable que cargará el valor total del bopp */
  cantInicialBopp: number = 0; /** Variable que cargará la cantidad total inicial del bopp */
  cantEntranteBopp: number = 0; /** Variable que cargará la cantidad total entrante del bopp */
  cantSalienteBopp: number = 0; /** Variable que cargará la cantidad total saliente del bopp */
  cantExistenciasBopp: number = 0; /** Variable que cargará la cantidad total de existencias del bopp */
  cantDiferenciaBopp: number = 0; /** Variable que cargará la cantidad total de la diferencia del bopp */
  boppsAgrupados: boolean = false; /** variable que mostrará el tab del bopp agrupado */
  boppsGenericos: any = [];  /** Variable que contendrá los bopp genericos. */
  esBopp: boolean = false; /** Variable que definirá si la materia prima que se está editando es bopp */
  idBoppGenerico: number = 1;
  materialSeleccionado: any = {};
  hora: any = moment().format('H:mm:ss');

  constructor(private materiaPrimaService: MateriaPrimaService,
    private tintasService: TintasService,
    private categoriMpService: CategoriaMateriaPrimaService,
    private AppComponent: AppComponent,
    private boppService: EntradaBOPPService,
    private shepherdService: ShepherdService,
    private frmBuilder: FormBuilder,
    private undMedidaService: UnidadMedidaService,
    private msj: MensajesAplicacionService,
    private servicioBoppGen: BoppGenericoService,
    private srvMovEntradasMP: Movimientos_Entradas_MPService,
    private srvSalidasMP: Entradas_Salidas_MPService,) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
    this.FormEdicionMateriaPrima = this.frmBuilder.group({
      Id: [null, Validators.required],
      Nombre: [null, Validators.required],
      Categoria: [null, Validators.required],
      Ancho: [null, Validators.required],
      Stock: [null, Validators.required],
      Stock2: [null],
      UndMed: [null, Validators.required],
      Precio: [null, Validators.required],
      PrecioEstandar: [null, Validators.required],
      Micras: [null, Validators.required],
      BoppGenerico: [null],
      IdBoppGenerico: [null]
    });
  }

  ngOnInit(): void {
    this.lecturaStorage();
    this.obtenerCategorias();
    this.consultarInventario();
    this.consultarCategorias();
    this.obtenerUnidadesMedidas();
    setInterval(() => this.modoSeleccionado = this.AppComponent.temaSeleccionado, 1000);
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

  // Funcion que va a consultar las categorias de las tablas Materia_Prima, Tintas y BOPP
  consultarCategorias() {
    this.materiaPrimaService.GetCategoriasMateriaPrima().subscribe(datos => { this.categoriasMP = datos; });
    this.tintasService.GetCategoriasTintas().subscribe(datos => { this.categoriasTintas = datos; });
    this.boppService.GetCategoriasBOPP().subscribe(datos => { this.categoriasBOPP = datos; });
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage() {
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  // Funcion para obtener las diferentes categorias de materia prima existentes
  obtenerCategorias() {
    this.categoriMpService.srvObtenerLista().subscribe(datos_categorias => this.categorias = datos_categorias);
    this.categorias.sort((a, b) => a.catMP_Nombre.localeCompare(b.catMP_Nombre));
  }

  // Funcion que va a obtener las diferentes materias primas
  obtenerUnidadesMedidas = () => this.undMedidaService.srvObtenerLista().subscribe(data => this.undMedidas = data);

  // Funcion que cargará las informacion de las materias primas segun los filtros que se consulten
  cargarTabla(data: any) {
    if (![2001, 2072, 84, 88, 89].includes(data.id)) {
      this.valorTotal = this.ValidarRol == 1 ? this.valorTotal + data.precio * data.stock : 0;
      this.cantInicial += data.inicial;
      this.cantEntrante += data.entrada;
      this.cantSaliente += data.salida;
      this.cantExistencias += data.stock;
      this.cantDiferencia += data.diferencia;
      
      let info: any = {
        Id: data.id,
        Id2: data.id2,
        Nombre: data.nombre,
        Descripcion: data.descripcion,
        Ancho: data.ancho,
        Micras: data.micras,
        Inicial: data.inicial,
        Entrada: data.entrada,
        Salida: data.salida,
        Cant: data.stock,
        Cant2: data.stock,
        Diferencia: data.diferencia,
        UndCant: data.presentacion,
        PrecioUnd: this.ValidarRol == 1 ? data.precio : 0,
        PrecioEstandar: data.precioEstandar,
        SubTotal: this.ValidarRol == 1 ? data.subTotal : 0,
        Categoria: data.categoria,
        Categoria_Id: data.categoria_Id,
      }
      if ([1,3].includes(this.ValidarRol)) this.ArrayMateriaPrima.push(info);
      this.ArrayMateriaPrima.sort((a, b) => a.Nombre.localeCompare(b.Nombre));

      if (this.categoriasMP.includes(data.categoria_Id) && ([1,3].includes(this.ValidarRol))) {
        this.polietilenos.push(info);
        this.valorTotalPolietileno += data.precio * data.stock;
        this.cantInicialPolietileno += data.inicial;
        this.cantEntrantePolietileno += data.entrada;
        this.cantSalientePolietileno += data.salida;
        this.cantExistenciasPolientileno += data.stock;
        this.cantDiferenciaPolietileno += data.diferencia;
      }
      if (this.categoriasTintas.includes(data.categoria_Id) && ([1,3].includes(this.ValidarRol))) {
        this.tintas.push(info);
        this.valorTotalTintas += data.precio * data.stock;
        this.cantInicialTintas += data.inicial;
        this.cantEntranteTintas += data.entrada;
        this.cantSalienteTintas += data.salida;
        this.cantExistenciasTintas += data.stock;
        this.cantDiferenciaTintas += data.diferencia;
      }
      if (this.categoriasBOPP.includes(data.categoria_Id) && ([1,3,4,89,63].includes(this.ValidarRol))) {
        this.biorientados.push(info);
        this.valorTotalBiorientado += this.ValidarRol == 1 ? data.precio * data.stock : 0;
        this.cantInicialBiorientado += data.inicial;
        this.cantEntranteBiorientado += data.entrada;
        this.cantSalienteBiorientado += data.salida;
        this.cantExistenciasBiorientado += data.stock;
        this.cantDiferenciaBiorientado += data.diferencia;
      }
      this.polietilenos.sort((a, b) => a.Nombre.localeCompare(b.Nombre));
      this.tintas.sort((a, b) => a.Nombre.localeCompare(b.Nombre));
      this.biorientados.sort((a, b) => a.Nombre.localeCompare(b.Nombre));
    }
  }

  // Funcion que va a consultar la informacion del inventario de las materias primas
  consultarInventario() {
    this.load = false;
    this.ArrayMateriaPrima = [];
    this.polietilenos = [];
    this.tintas = [];
    this.biorientados = [];
    this.valorTotal = 0;
    this.cantInicial = 0;
    this.cantEntrante = 0;
    this.cantSaliente = 0;
    this.cantExistencias = 0;
    this.cantDiferencia = 0;
    let fecha: any = this.rongoFechas.length > 0 ? moment(this.rongoFechas[0]).format('YYYY-MM-DD') : this.today;
    let fechaFinal: any = this.rongoFechas.length > 0 ? moment(this.rongoFechas[1]).format('YYYY-MM-DD') : fecha;

    this.materiaPrimaService.GetInventarioMateriasPrimas().subscribe(data => {
      for (let i = 0; i < data.length; i++) {
        this.materiaPrimaService.GetInventario(fecha, fechaFinal, data[i].id_Materia_Prima).subscribe(datos => datos.forEach(data => this.cargarTabla(data)));
      }
    });
    setTimeout(() => {
      this.columnas = [
        { header: 'ID', field: 'Id', tipo: 'texto' },
        { header: 'Nombre', field: 'Nombre', tipo: 'texto' },
        { header: 'Descripción', field: 'Descripcion', tipo: 'texto' },
        { header: 'Ancho', field: 'Ancho', tipo: 'numero' },
        { header: 'Micras', field: 'Micras', tipo: 'numero' },
        { header: 'Stock', field: 'Cant', tipo: 'numero' },
        { header: 'Medida', field: 'UndCant', tipo: 'texto' },
        { header: 'Precio Und', field: 'PrecioUnd', tipo: 'numero' },
        { header: 'SubTotal', field: 'SubTotal', tipo: 'numero' },
        { header: 'Categoria', field: 'Categoria', tipo: 'texto' },
        { header: 'Inicial', field: 'Inicial', tipo: 'numero' },
        { header: 'Entrada', field: 'Entrada', tipo: 'numero' },
        { header: 'Salida', field: 'Salida', tipo: 'numero' },
        { header: 'Diferencia', field: 'Diferencia', tipo: 'numero' },
      ];
      this._columnasSeleccionada = [
        { header: 'ID', field: 'Id', tipo: 'texto' },
        { header: 'Nombre', field: 'Nombre', tipo: 'texto' },
        { header: 'Ancho', field: 'Ancho', tipo: 'numero' },
        { header: 'Micras', field: 'Micras', tipo: 'numero' },
        { header: 'Stock', field: 'Cant', tipo: 'numero' },
        { header: 'Medida', field: 'UndCant', tipo: 'texto' },
        { header: 'Precio Und', field: 'PrecioUnd', tipo: 'numero' },
        { header: 'SubTotal', field: 'SubTotal', tipo: 'numero' },
        { header: 'Categoria', field: 'Categoria', tipo: 'texto' },
      ]
      this.load = true;
    }, 2500);
  }

  // Funcion que va a mostrar las materias primas con existencias mayor a cero
  existenciasMayorCero() {
    this.load = false;
    this.ArrayMateriaPrima = this.ArrayMateriaPrima.filter((item) => item.Cant > 0);
    this.polietilenos = this.polietilenos.filter((item) => item.Cant > 0);
    this.tintas = this.tintas.filter((item) => item.Cant > 0);
    this.biorientados = this.biorientados.filter((item) => item.Cant > 0);
    this.load = true;
  }

  /** Funcion para filtrar busquedas y mostrar el valor total segun el filtro seleccionado. */
  aplicarfiltro($event, campo: any, valorCampo: string) {
    this.dt!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);
    setTimeout(() => {
      if (this.dt.filteredValue != null) {
        this.valorTotal = 0;
        this.cantInicial = 0;
        this.cantEntrante = 0;
        this.cantSaliente = 0;
        this.cantExistencias = 0;
        this.cantDiferencia = 0;
        for (let i = 0; i < this.dt.filteredValue.length; i++) {
          this.valorTotal += this.dt.filteredValue[i].PrecioUnd * this.dt.filteredValue[i].Cant;
          this.cantInicial += this.dt.filteredValue[i].Inicial;
          this.cantEntrante += this.dt.filteredValue[i].Entrada;
          this.cantSaliente += this.dt.filteredValue[i].Salida;
          this.cantExistencias += this.dt.filteredValue[i].Cant;
          this.cantDiferencia += this.dt.filteredValue[i].Diferencia;
        }
      } else {
        this.valorTotal = 0;
        this.cantInicial = 0;
        this.cantEntrante = 0;
        this.cantSaliente = 0;
        this.cantExistencias = 0;
        this.cantDiferencia = 0;
        for (let i = 0; i < this.dt._value.length; i++) {
          this.valorTotal += this.dt._value[i].PrecioUnd * this.dt._value[i].Cant;
          this.cantInicial += this.dt._value[i].Inicial;
          this.cantEntrante += this.dt._value[i].Entrada;
          this.cantSaliente += this.dt._value[i].Salida;
          this.cantExistencias += this.dt._value[i].Cant;
          this.cantDiferencia += this.dt._value[i].Diferencia;
        }
      }
    }, 500);
  }

  cantidadExistencias(data: any) {
    let total: number = 0;
    total = data.reduce((a, b) => a + b.Cant, 0);
    return total;
  }

  valorTotalExistencia(data: any) {
    let total: number = 0;
    total = data.reduce((a, b) => a + (b.Cant * b.PrecioUnd), 0);
    return total;
  }

  // Funcion que va a filtrar la información de la tabla e polietilenos
  aplicarFiltroPolietilenos($event, campo: any, valorCampo: string) {
    this.dt_Polientileno!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);
    setTimeout(() => {
      if (this.dt_Polientileno.filteredValue != null) {
        this.valorTotal = 0;
        this.cantInicial = 0;
        this.cantEntrante = 0;
        this.cantSaliente = 0;
        this.cantExistencias = 0;
        this.cantDiferencia = 0;
        for (let i = 0; i < this.dt_Polientileno.filteredValue.length; i++) {
          this.valorTotal += this.dt_Polientileno.filteredValue[i].PrecioUnd * this.dt_Polientileno.filteredValue[i].Cant;
          this.cantInicial += this.dt_Polientileno.filteredValue[i].Inicial;
          this.cantEntrante += this.dt_Polientileno.filteredValue[i].Entrada;
          this.cantSaliente += this.dt_Polientileno.filteredValue[i].Salida;
          this.cantExistencias += this.dt_Polientileno.filteredValue[i].Cant;
          this.cantDiferencia += this.dt_Polientileno.filteredValue[i].Diferencia;
        }
      } else {
        this.valorTotal = 0;
        this.cantInicial = 0;
        this.cantEntrante = 0;
        this.cantSaliente = 0;
        this.cantExistencias = 0;
        this.cantDiferencia = 0;
        for (let i = 0; i < this.dt_Polientileno._value.length; i++) {
          this.valorTotal += this.dt_Polientileno._value[i].PrecioUnd * this.dt_Polientileno._value[i].Cant;
          this.cantInicial += this.dt_Polientileno._value[i].Inicial;
          this.cantEntrante += this.dt_Polientileno._value[i].Entrada;
          this.cantSaliente += this.dt_Polientileno._value[i].Salida;
          this.cantExistencias += this.dt_Polientileno._value[i].Cant;
          this.cantDiferencia += this.dt_Polientileno._value[i].Diferencia;
        }
      }
    }, 500);
  }

  // Funcion que va a filtar la información de la tabla de tintas
  aplicarFiltroTintas($event, campo: any, valorCampo: string) {
    this.dt_Tintas!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);
    setTimeout(() => {
      if (this.dt_Tintas.filteredValue != null) {
        this.valorTotal = 0;
        this.cantInicial = 0;
        this.cantEntrante = 0;
        this.cantSaliente = 0;
        this.cantExistencias = 0;
        this.cantDiferencia = 0;
        for (let i = 0; i < this.dt_Tintas.filteredValue.length; i++) {
          this.valorTotal += this.dt_Tintas.filteredValue[i].PrecioUnd * this.dt_Tintas.filteredValue[i].Cant;
          this.cantInicial += this.dt_Tintas.filteredValue[i].Inicial;
          this.cantEntrante += this.dt_Tintas.filteredValue[i].Entrada;
          this.cantSaliente += this.dt_Tintas.filteredValue[i].Salida;
          this.cantExistencias += this.dt_Tintas.filteredValue[i].Cant;
          this.cantDiferencia += this.dt_Tintas.filteredValue[i].Diferencia;
        }
      } else {
        this.valorTotal = 0;
        this.cantInicial = 0;
        this.cantEntrante = 0;
        this.cantSaliente = 0;
        this.cantExistencias = 0;
        this.cantDiferencia = 0;
        for (let i = 0; i < this.dt_Tintas._value.length; i++) {
          this.valorTotal += this.dt_Tintas._value[i].PrecioUnd * this.dt_Tintas._value[i].Cant;
          this.cantInicial += this.dt_Tintas._value[i].Inicial;
          this.cantEntrante += this.dt_Tintas._value[i].Entrada;
          this.cantSaliente += this.dt_Tintas._value[i].Salida;
          this.cantExistencias += this.dt_Tintas._value[i].Cant;
          this.cantDiferencia += this.dt_Tintas._value[i].Diferencia;
        }
      }
    }, 500);
  }

  // Funcion que va a filtrar la información en la tabla de la alcantarilla
  aplicarFiltrosBiorientados($event, campo: any, valorCampo: string) {
    this.dt_Biorientados!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);
    setTimeout(() => {
      if (this.dt_Biorientados.filteredValue != null) {
        this.valorTotal = 0;
        this.cantInicial = 0;
        this.cantEntrante = 0;
        this.cantSaliente = 0;
        this.cantExistencias = 0;
        this.cantDiferencia = 0;
        for (let i = 0; i < this.dt_Biorientados.filteredValue.length; i++) {
          this.valorTotal += this.dt_Biorientados.filteredValue[i].PrecioUnd * this.dt_Biorientados.filteredValue[i].Cant;
          this.cantInicial += this.dt_Biorientados.filteredValue[i].Inicial;
          this.cantEntrante += this.dt_Biorientados.filteredValue[i].Entrada;
          this.cantSaliente += this.dt_Biorientados.filteredValue[i].Salida;
          this.cantExistencias += this.dt_Biorientados.filteredValue[i].Cant;
          this.cantDiferencia += this.dt_Biorientados.filteredValue[i].Diferencia;
        }
      } else {
        this.valorTotal = 0;
        this.cantInicial = 0;
        this.cantEntrante = 0;
        this.cantSaliente = 0;
        this.cantExistencias = 0;
        this.cantDiferencia = 0;
        for (let i = 0; i < this.dt_Biorientados._value.length; i++) {
          this.valorTotal += this.dt_Biorientados._value[i].PrecioUnd * this.dt_Biorientados._value[i].Cant;
          this.cantInicial += this.dt_Biorientados._value[i].Inicial;
          this.cantEntrante += this.dt_Biorientados._value[i].Entrada;
          this.cantSaliente += this.dt_Biorientados._value[i].Salida;
          this.cantExistencias += this.dt_Biorientados._value[i].Cant;
          this.cantDiferencia += this.dt_Biorientados._value[i].Diferencia;
        }
      }
    }, 500);
  }

  // Funcion que va a exportar a excel la información de las materias primas. Recibirá un número para diferenciar con que informacion se llenará el archivo
  exportarExcel(num: number) {
    this.load = false;
    let datos: any[] = [];
    let infoDocumento: any[] = [];
    let title: string = ``;
    if (num == 1) {
      datos = this.ArrayMateriaPrima; //Todas las materias primas
      title = `Inventario Materia Prima - ${this.today}`;
    }
    else if (num == 2) {
      this.dt.filteredValue != null ? datos = this.dt.filteredValue : datos = this.ArrayMateriaPrima; //Materias primas filtradas y no filtradas
      title = `Inventario Materia Prima - ${this.today}`;
    }
    else if (num == 3) {
      this.dt_Polientileno.filteredValue != null ? datos = this.dt_Polientileno.filteredValue : datos = this.polietilenos; //Polietilenos filtrados y no filtrados
      title = `Inventario Polietilenos - ${this.today}`;
    }
    else if (num == 4) {
      this.dt_Tintas.filteredValue != null ? datos = this.dt_Tintas.filteredValue : datos = this.tintas; //Tintas Filtradas y no Filtradas
      title = `Inventario Tintas - ${this.today}`;
    }
    else if (num == 5) {
      this.dt_Biorientados.filteredValue != null ? datos = this.dt_Biorientados.filteredValue : datos = this.biorientados; //Biorientado filtrada y no filtrado
      title = `Inventario Biorientados - ${this.today}`;
    }
    //if (this.boppsAgrupados) this.exportarExcel2();
    //else {
      setTimeout(() => {
        const header = ["Id", "Nombre", "Ancho", "Inventario Inicial", "Entrada", "Salida", "Cantidad Actual", "Diferencia", "Und. Cant", "Precio U", "SubTotal", "Categoria"]
        for (const item of datos) {
          const datos1: any = [item.Id, item.Nombre, item.Ancho, item.Inicial, item.Entrada, item.Salida, item.Cant, item.Diferencia, item.UndCant, item.PrecioUnd, item.SubTotal, item.Categoria];
          infoDocumento.push(datos1);
        }
        let workbook = new Workbook();
        const imageId1 = workbook.addImage({ base64: logoParaPdf, extension: 'png', });
        let worksheet = workbook.addWorksheet(title);
        worksheet.addImage(imageId1, 'A1:B3');
        let titleRow = worksheet.addRow([title]);
        titleRow.font = { name: 'Calibri', family: 4, size: 16, underline: 'double', bold: true };
        worksheet.addRow([]);
        worksheet.addRow([]);
        let headerRow = worksheet.addRow(header);
        headerRow.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'eeeeee' }
          }
          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
        });
        worksheet.mergeCells('A1:L3');
        worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
        infoDocumento.forEach(d => {
          let row = worksheet.addRow(d);
          row.getCell(3).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          row.getCell(4).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          row.getCell(5).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          row.getCell(6).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          row.getCell(7).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          row.getCell(8).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          row.getCell(10).numFmt = '"$"#,##0.00;[Red]\-"$"#,##0.00';
          row.getCell(11).numFmt = '"$"#,##0.00;[Red]\-"$"#,##0.00';
          let qty = row.getCell(7);
          let color = 'ADD8E6';
          qty.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: color }
          }
        });
        worksheet.getColumn(1).width = 10;
        worksheet.getColumn(2).width = 60;
        worksheet.getColumn(3).width = 12;
        worksheet.getColumn(4).width = 22;
        worksheet.getColumn(5).width = 12;
        worksheet.getColumn(6).width = 12;
        worksheet.getColumn(7).width = 22;
        worksheet.getColumn(8).width = 12;
        worksheet.getColumn(9).width = 12;
        worksheet.getColumn(10).width = 12;
        worksheet.getColumn(11).width = 20;
        worksheet.getColumn(12).width = 20;
        setTimeout(() => {
          workbook.xlsx.writeBuffer().then((data) => {
            let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            fs.saveAs(blob, title + `.xlsx`);
          });
          this.load = true;
          this.msj.mensajeConfirmacion(`Confirmación`, `Se ha exportado el ` + title + `!`);
        }, 1000);
      }, 1500);
    //}
  }

  /** Función que mostrará un tutorial describiendo paso a paso cada funcionalidad de la aplicación */
  verTutorial() {
    this.shepherdService.defaultStepOptions = defaultStepOptions;
    this.shepherdService.modal = true;
    this.shepherdService.confirmCancel = false;
    this.shepherdService.addSteps(defaultSteps);
    this.shepherdService.start();
  }

  // Funcion para llamar el modal que pregunta que materia prima se va a crear
  LlamarModalCrearMateriaPrima = () => this.modalCreacionMateriaPrima = true;

  // Funcion para llamar el modal que crea polientileno
  crearPolientileno() {
    this.modalCreacionMateriaPrima = false;
    this.ModalCrearMateriaPrima = true;
  }

  // Funcion para llamar el modal que crea tintas
  creartinta() {
    this.modalCreacionMateriaPrima = false;
    this.ModalCrearTintas = true;
  }

  // Funcion que va a llamar el modal donde se editará la información de la materia prima
  llamarModalEdicionMateriaPrima(data: any) {
    this.materialSeleccionado = data;
    console.log(this.materialSeleccionado)
    this.cargarBoppsGenericos();
    this.modalEditarMateriasPrimas = true;
    this.FormEdicionMateriaPrima.patchValue({
      Id: data.Id,
      Nombre: data.Nombre,
      Categoria: data.Categoria_Id,
      Ancho: data.Ancho,
      Stock: data.Cant,
      Stock2: data.Cant2,
      UndMed: data.UndCant,
      Precio: data.PrecioUnd,
      Micras: 0,
      PrecioEstandar: data.PrecioEstandar,
    });
    if (this.categoriasBOPP.includes(this.FormEdicionMateriaPrima.value.Categoria)) {
      this.esBopp = true;
      this.boppService.srvObtenerListaPorSerial(this.FormEdicionMateriaPrima.value.Id).subscribe(data => {
        for (let i = 0; i < data.length; i++) {
          this.FormEdicionMateriaPrima.patchValue({ Micras: data[i].bopP_CantidadMicras, IdBoppGenerico: data[i].boppGen_Id, BoppGenerico: data[i].boppGen_Id, });
          this.idBoppGenerico = data[i].boppGen_Id;
        }
        setTimeout(() => { this.seleccionarBoppsGenericos(); }, 3000);
      });
    } else {
      this.FormEdicionMateriaPrima.patchValue({ Micras: 0, Ancho: 0, IdBoppGenerico: null, BoppGenerico: null, });
      this.esBopp = false;
    }
  }

  // Funcion que va a editar una materia primas
  editarMateriaPrima() {
    if (this.categoriasMP.includes(this.FormEdicionMateriaPrima.value.Categoria)) {
      const info: modelMateriaPrima = {
        MatPri_Id: this.FormEdicionMateriaPrima.value.Id,
        MatPri_Nombre: this.FormEdicionMateriaPrima.value.Nombre,
        MatPri_Descripcion: this.FormEdicionMateriaPrima.value.Nombre,
        MatPri_Stock: this.FormEdicionMateriaPrima.value.Stock,
        UndMed_Id: this.FormEdicionMateriaPrima.value.UndMed,
        CatMP_Id: this.FormEdicionMateriaPrima.value.Categoria,
        MatPri_Precio: this.FormEdicionMateriaPrima.value.Precio,
        TpBod_Id: 4,
        MatPri_PrecioEstandar: this.FormEdicionMateriaPrima.value.PrecioEstandar,
      }
      this.materiaPrimaService.srvActualizar(info.MatPri_Id, info).subscribe(() => {
        this.crearAjustesMP(info.MatPri_Id, 2001, 1);
        this.consultarInventario();
        this.msj.mensajeConfirmacion(`¡Polietileno Actualizado!`, `¡La materia prima con el nombre '${info.MatPri_Nombre}' ha sido actualizada con exito!`);
        this.modalEditarMateriasPrimas = false;
        this.esBopp = false;
        this.idBoppGenerico = 1;
      }, () => {
        this.msj.mensajeError(`¡Error!`, `¡Ha ocurrido un error al intentar actualizar la materia prima!`);
        this.modalEditarMateriasPrimas = false;
        this.esBopp = false;
        this.idBoppGenerico = 1;
      });
    } else if (this.categoriasTintas.includes(this.FormEdicionMateriaPrima.value.Categoria)) {
      this.tintasService.srvObtenerListaPorId(this.FormEdicionMateriaPrima.value.Id).subscribe(data => {
        const info: modelTintas = {
          Tinta_Id: this.FormEdicionMateriaPrima.value.Id,
          Tinta_Nombre: this.FormEdicionMateriaPrima.value.Nombre,
          Tinta_Descripcion: this.FormEdicionMateriaPrima.value.Nombre,
          Tinta_CodigoHexadecimal: this.FormEdicionMateriaPrima.value.Nombre,
          Tinta_Stock: this.FormEdicionMateriaPrima.value.Stock,
          UndMed_Id: this.FormEdicionMateriaPrima.value.UndMed,
          Tinta_Precio: this.FormEdicionMateriaPrima.value.Precio,
          CatMP_Id: this.FormEdicionMateriaPrima.value.Categoria,
          TpBod_Id: data.tpBod_Id,
          Tinta_InvInicial: data.tinta_InvInicial,
          Tinta_FechaIngreso: data.tinta_FechaIngreso,
          Tinta_Hora: data.tinta_Hora,
          Tinta_PrecioEstandar: this.FormEdicionMateriaPrima.value.PrecioEstandar,
        }
        this.tintasService.srvActualizar(info.Tinta_Id, info).subscribe(() => {
          this.crearAjustesMP(84, info.Tinta_Id, 1);
          this.consultarInventario();
          this.msj.mensajeConfirmacion(`¡Tinta Actualizada!`, `¡La tinta con el nombre '${info.Tinta_Nombre}' ha sido actualizada con exito!`);
          this.modalEditarMateriasPrimas = false;
          this.esBopp = false;
          this.idBoppGenerico = 1;
        }, () => {
          this.msj.mensajeError(`¡Error!`, `¡Ha ocurrido un error al intentar actualizar la tinta!`);
          this.modalEditarMateriasPrimas = false;
          this.esBopp = false;
          this.idBoppGenerico = 1;
        })
      });
    } else if (this.categoriasBOPP.includes(this.FormEdicionMateriaPrima.value.Categoria)) {
      this.boppService.srvObtenerListaPorSerial(this.FormEdicionMateriaPrima.value.Id).subscribe(data => {
        for (let i = 0; i < data.length; i++) {
          const info: modelBOPP = {
            BOPP_Id: data[i].bopP_Id,
            BOPP_Nombre: `${this.FormEdicionMateriaPrima.value.Nombre}`,
            BOPP_Descripcion: this.FormEdicionMateriaPrima.value.Nombre,
            BOPP_Serial: data[i].bopP_Serial,
            BOPP_CantidadMicras: this.FormEdicionMateriaPrima.value.Micras,
            UndMed_Id: data[i].undMed_Id,
            CatMP_Id: this.FormEdicionMateriaPrima.value.Categoria,
            BOPP_Precio: this.FormEdicionMateriaPrima.value.Precio,
            TpBod_Id: data[i].tpBod_Id,
            BOPP_FechaIngreso: data[i].bopP_FechaIngreso,
            BOPP_Ancho: this.FormEdicionMateriaPrima.value.Ancho,
            BOPP_Stock: this.FormEdicionMateriaPrima.value.Stock,
            UndMed_Kg: this.FormEdicionMateriaPrima.value.UndMed,
            BOPP_CantidadInicialKg: data[i].bopP_CantidadInicialKg,
            Usua_Id: data[i].usua_Id,
            BOPP_Hora: data[i].bopP_Hora,
            BoppGen_Id: this.FormEdicionMateriaPrima.value.IdBoppGenerico == null ? this.idBoppGenerico : this.FormEdicionMateriaPrima.value.IdBoppGenerico,
            BOPP_CodigoDoc: data[i].bopP_CodigoDoc,
            BOPP_TipoDoc: data[i].bopP_TipoDoc,
            Prov_Id : data[i].prov_Id,
          }
          this.servicioBoppGen.PutPrecioEstandar(this.idBoppGenerico, this.FormEdicionMateriaPrima.value.PrecioEstandar).subscribe();
          this.boppService.srvActualizar(info.BOPP_Id, info).subscribe(() => {
            this.crearAjustesMP(84, 2001, info.BoppGen_Id);
            this.consultarInventario();
            this.msj.mensajeConfirmacion(`¡Biorientado Actualizado!`, `El biorientado con el nombre '${info.BOPP_Nombre}' ha sido actualizado con exito!`);
            this.modalEditarMateriasPrimas = false;
            this.esBopp = false;
            this.idBoppGenerico = 1;
          }, () => {
            this.msj.mensajeError(`¡Error!`, `¡Ha ocurrido un error al intentar actualizar el biorientado!`);
            this.modalEditarMateriasPrimas = false;
            this.esBopp = false;
            this.idBoppGenerico = 1;
          })
        }
      });
    }
  }

  /** Función que consultará la información del BOPP agrupado por genérico. */
  boppsAgrupados_Genericos() {
    this.arrayBopps = [];
    this.stockTotalBopps = 0;
    let cantDatos: number = 0;
    this.load = false;

    this.boppService.GetInventarioBoppsGenericos().subscribe(data => {
      for (let index = 0; index < data.length; index++) {
        this.cargarTablaBopps(data[index]);
        cantDatos += 1;
        cantDatos == data.length ? this.load = true : this.load = false;
      }
    });
  }

  /**  Función que cargará en la tabla la información del BOPP agrupado por genérico. */
  cargarTablaBopps(datos: any) {
    let info: any = {
      Id: datos.id,
      Nombre: datos.nombre,
      Micras: datos.micras,
      Ancho: datos.ancho,
      IdCateg: datos.idCategoria,
      NombreCateg: datos.nombreCategoria,
      Rollos: datos.rollos,
      Stock: datos.stock,
      Medida: datos.medida,
    }
    this.arrayBopps.push(info);
    this.stockTotalBopps += info.Stock;
  }

  /** Función que cargará el bopp agrupado por el génerico */
  aplicarfiltroGenerico($event, campo: any, valorCampo: string) {
    this.dt_BoppGenerico!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);
    setTimeout(() => {
      if (this.dt_BoppGenerico.filteredValue != null) {
        this.stockTotalBopps = 0;
        for (let index = 0; index < this.dt_BoppGenerico.filteredValue.length; index++) {
          this.stockTotalBopps += this.dt_BoppGenerico.filteredValue[index].Stock;
        }
      } else {
        this.stockTotalBopps = 0;
        for (let index = 0; index < this.dt_BoppGenerico._value.length; index++) {
          this.stockTotalBopps += this.dt_BoppGenerico._value[index].Stock;
        }
      }
    }, 500)
  }

  /** Función que llamará el modal y consultará la información de el(los) bopp(s) asociado(s) al bopp genérico que se seleccionó */
  llamarModalBopp(data: any) {
    this.genericoSeleccionado = data.Nombre
    this.modalVerBopps = true;
    this.arrayModalBopp = [];
    this.valorTotalBopp = 0;
    this.cantInicialBopp = 0;
    this.cantEntranteBopp = 0;
    this.cantSalienteBopp = 0;
    this.cantExistenciasBopp = 0;
    this.cantDiferenciaBopp = 0;
    let fecha: any = this.rongoFechas.length > 0 ? moment(this.rongoFechas[0]).format('YYYY-MM-DD') : this.today;
    let fechaFinal: any = this.rongoFechas.length > 0 ? moment(this.rongoFechas[1]).format('YYYY-MM-DD') : fecha;

    this.boppService.GetInventarioBopps(fecha, fechaFinal, data.Id).subscribe(data => {
      for (let index = 0; index < data.length; index++) {
        this.cargarTablaModal(data[index]);
      }
    });
  }

  /** Función quellenará la información de el(los) bopp(s) asociado(s) al bopp genérico que se seleccionó */
  cargarTablaModal(datos: any) {
    let info: any = {
      Id: datos.id,
      Nombre: datos.nombre,
      Ancho: datos.ancho,
      Micras: datos.micras,
      Inicial: datos.inicial,
      Entrada: datos.entrada,
      Salida: datos.salida,
      Cant: datos.stock,
      Diferencia: datos.diferencia,
      UndCant: datos.medida,
      PrecioUnd: datos.precio,
      SubTotal: datos.subtotal,
      Categoria: datos.categoria,
      Categoria_Id: datos.categoriaId,
    }
    this.arrayModalBopp.push(info);
    this.valorTotalBopp += info.SubTotal,
      this.cantInicialBopp += info.Inicial,
      this.cantEntranteBopp += info.Entrada,
      this.cantSalienteBopp += info.Salida,
      this.cantExistenciasBopp += info.Cant,
      this.cantDiferenciaBopp += info.Diferencia
  }

  /** Función que cargará el inventario de bopp's agrupados si se encuentra en el tab 4 */
  cargarTabs(event) {
    let tab : any = event.originalEvent.srcElement.innerText;
    if (tab == 'Bopps agrupados') { 
      this.boppsAgrupados = true; 
      this.boppsAgrupados_Genericos(); 
    } else this.boppsAgrupados = false;
  }

  // Funcion que va a filtrar la información en la tabla de inventario
  aplicarFiltrosBiorientados2($event, campo: any, valorCampo: string) {
    this.dt_Biorientados2!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);
    setTimeout(() => {
      if (this.dt_Biorientados2.filteredValue != null) {
        this.valorTotalBopp = 0;
        this.cantInicialBopp = 0;
        this.cantEntranteBopp = 0;
        this.cantSalienteBopp = 0;
        this.cantExistenciasBopp = 0;
        this.cantDiferenciaBopp = 0;
        for (let i = 0; i < this.dt_Biorientados2.filteredValue.length; i++) {
          this.valorTotalBopp += this.dt_Biorientados2.filteredValue[i].PrecioUnd * this.dt_Biorientados2.filteredValue[i].Cant;
          this.cantInicialBopp += this.dt_Biorientados2.filteredValue[i].Inicial;
          this.cantEntranteBopp += this.dt_Biorientados2.filteredValue[i].Entrada;
          this.cantSalienteBopp += this.dt_Biorientados2.filteredValue[i].Salida;
          this.cantExistenciasBopp += this.dt_Biorientados2.filteredValue[i].Cant;
          this.cantDiferenciaBopp += this.dt_Biorientados2.filteredValue[i].Diferencia;
        }
      } else {
        this.valorTotalBopp = 0;
        this.cantInicialBopp = 0;
        this.cantEntranteBopp = 0;
        this.cantSalienteBopp = 0;
        this.cantExistenciasBopp = 0;
        this.cantDiferenciaBopp = 0;
        for (let i = 0; i < this.dt_Biorientados2._value.length; i++) {
          this.valorTotalBopp += this.dt_Biorientados2._value[i].PrecioUnd * this.dt_Biorientados2._value[i].Cant;
          this.cantInicialBopp += this.dt_Biorientados2._value[i].Inicial;
          this.cantEntranteBopp += this.dt_Biorientados2._value[i].Entrada;
          this.cantSalienteBopp += this.dt_Biorientados2._value[i].Salida;
          this.cantExistenciasBopp += this.dt_Biorientados2._value[i].Cant;
          this.cantDiferenciaBopp += this.dt_Biorientados2._value[i].Diferencia;
        }
      }
    }, 500);
  }

  /** Exportar el formato de bopp's agrupados a excel */
  exportarExcel2() {
    this.load = false;
    let datos: any[] = [];
    let infoDocumento: any[] = [];
    let title: string = `Inventario Bopp agrupado - ${this.today}`;

    this.dt_BoppGenerico.filteredValue != null ? datos = this.dt_BoppGenerico.filteredValue : datos = this.arrayBopps;

    setTimeout(() => {
      const header = ["Id", "Nombre", "Micras", "Ancho", "Categoria", "Rollos", "Stock", "Medida"]
      for (const item of datos) {
        const datos1: any = [item.Id, item.Nombre, item.Micras, item.Ancho, item.NombreCateg, item.Rollos, item.Stock, item.Medida];
        infoDocumento.push(datos1);
      }
      let workbook = new Workbook();
      const imageId1 = workbook.addImage({ base64: logoParaPdf, extension: 'png', });
      let worksheet = workbook.addWorksheet(title);
      worksheet.addImage(imageId1, 'A1:A2');
      let titleRow = worksheet.addRow([title]);
      titleRow.font = { name: 'Calibri', family: 4, size: 16, underline: 'double', bold: true };
      worksheet.addRow([]);
      worksheet.addRow([]);
      let headerRow = worksheet.addRow(header);
      headerRow.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'eeeeee' }
        }
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
      });
      worksheet.mergeCells('A1:H3');
      worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
      infoDocumento.forEach(d => {
        let row = worksheet.addRow(d);
        row.getCell(3).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
        row.getCell(4).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
        row.getCell(7).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
        let qty = row.getCell(7);
        let color = 'ADD8E6';
        qty.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: color }
        }
      });
      worksheet.getColumn(1).width = 20;
      worksheet.getColumn(2).width = 35;
      worksheet.getColumn(3).width = 12;
      worksheet.getColumn(4).width = 12;
      worksheet.getColumn(5).width = 12;
      worksheet.getColumn(6).width = 12;
      worksheet.getColumn(7).width = 12;
      worksheet.getColumn(8).width = 12;
      setTimeout(() => {
        workbook.xlsx.writeBuffer().then((data) => {
          let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          fs.saveAs(blob, title + `.xlsx`);
        });
        this.load = true;
        this.msj.mensajeConfirmacion(`Confirmación`, `¡Se ha generado el formato Excel del ${title}!`);
      }, 1000);
    }, 1500);
  }

  /** Función para cargar los nombres de bopps genericos en el campo */
  cargarBoppsGenericos() {
    this.boppsGenericos = [];
    this.servicioBoppGen.srvObtenerLista().subscribe(data => {
      for (let index = 0; index < data.length; index++) {
        this.boppsGenericos.push(data[index])
      }
    });
  }

  /** Función para seleccionar el nombre del bopp en el campo, pero su valor será el Id. */
  seleccionarBoppsGenericos() {
    let bopp: any = this.FormEdicionMateriaPrima.value.BoppGenerico;
    let nuevo: any = [];
    nuevo = this.boppsGenericos.filter((item) => item.boppGen_Id == bopp);
    this.FormEdicionMateriaPrima.patchValue({ BoppGenerico: nuevo[0].boppGen_Nombre, IdBoppGenerico: nuevo[0].boppGen_Id });
  }

  //Función que creará ajustes de entradas/salidas de materia prima
  crearAjustesMP(mp1: number, mp2: number, mp3: number) {
    let esError: boolean = false;
    let cantidad: number = this.FormEdicionMateriaPrima.value.Stock;
    if (cantidad > this.materialSeleccionado.Cant) this.crearMovEntrada(mp1, mp2, mp3, cantidad);
    else if (cantidad < this.materialSeleccionado.Cant) {
      let cantSaliente: number = 0;
      let nueva: number = (this.materialSeleccionado.Cant - cantidad);
      this.srvMovEntradasMP.GetInventarioxMaterial(this.materialSeleccionado.Id2).subscribe(data => {
        if (data.length > 0) {
          data.forEach(element => {
            if (nueva > 0) {
              let entradas2: modeloMovimientos_Entradas_MP = {
                'Id': element.id,
                'MatPri_Id': element.matPri_Id,
                'Tinta_Id': element.tinta_Id,
                'Bopp_Id': element.bopp_Id,
                'Cantidad_Entrada': element.cantidad_Entrada,
                'UndMed_Id': element.undMed_Id,
                'Precio_RealUnitario': element.precio_RealUnitario,
                'Tipo_Entrada': element.tipo_Entrada,
                'Codigo_Entrada': element.codigo_Entrada,
                'Estado_Id': element.estado_Id,
                'Cantidad_Asignada': element.cantidad_Asignada,
                'Cantidad_Disponible': element.cantidad_Disponible,
                'Observacion': element.observacion,
                'Fecha_Entrada': element.fecha_Entrada,
                'Hora_Entrada': element.hora_Entrada,
                'Precio_EstandarUnitario': element.precio_EstandarUnitario
              }
              if (nueva > element.cantidad_Disponible) {
                cantSaliente = entradas2.Cantidad_Disponible;
                entradas2.Cantidad_Asignada += cantSaliente;
                entradas2.Cantidad_Disponible = (entradas2.Cantidad_Entrada - entradas2.Cantidad_Asignada);
                entradas2.Estado_Id = 5;
                nueva -= cantSaliente;
              } else if (nueva == element.cantidad_Disponible) {
                cantSaliente = nueva;
                entradas2.Cantidad_Asignada += cantSaliente;
                entradas2.Cantidad_Disponible = (entradas2.Cantidad_Entrada - entradas2.Cantidad_Asignada);
                entradas2.Estado_Id = 5;
                nueva = 0;
              } else if (nueva < element.cantidad_Disponible) {
                cantSaliente = nueva;
                entradas2.Cantidad_Asignada += nueva;
                entradas2.Cantidad_Disponible -= nueva;
                entradas2.Estado_Id = 19;
                nueva = 0;
              }
              this.srvMovEntradasMP.Put(entradas2.Id, entradas2).subscribe(() => { esError = false; }, error => { esError = true; });
              if (!esError) this.crearMovSalida(entradas2, cantSaliente);
              else this.msj.mensajeError(`Error`, `Error al actualizar movimiento de entrada de materia prima`);
            }
          });
        }
      }, error => { this.msj.mensajeError(`Error`, `Error al obtener los movimientos de entrada de materia prima`); });
    }
  }

  //Función que creará registros en la tabla movimientos entradas de materia prima cuando se actualice la cantidad de una materia prima.
  crearMovEntrada(mp1: number, mp2: number, mp3: number, cantidad: number) {
    let entrada: modeloMovimientos_Entradas_MP = {
      MatPri_Id: mp1,
      Tinta_Id: mp2,
      Bopp_Id: mp3,
      Cantidad_Entrada: (cantidad - this.materialSeleccionado.Cant),
      UndMed_Id: 'Kg',
      Precio_RealUnitario: this.FormEdicionMateriaPrima.value.Precio,
      Tipo_Entrada: 'AJUSTEMP',
      Codigo_Entrada: mp3 != 1 ? this.materialSeleccionado.Id2 : 1,
      Estado_Id: 19,
      Cantidad_Asignada: 0,
      Cantidad_Disponible: (cantidad - this.materialSeleccionado.Cant),
      Observacion: 'Ajuste de entrada por inventario de materia prima',
      Fecha_Entrada: this.today,
      Hora_Entrada: this.hora,
      Precio_EstandarUnitario: this.FormEdicionMateriaPrima.value.PrecioEstandar,
    }
    this.srvMovEntradasMP.Post(entrada).subscribe(data => { }, error => { this.msj.mensajeError(`Error`, `Error al crear movimiento de entrada de materia prima`) });
  }

  //Función que creará registros en la tabla entradas salidas de materia prima cuando se actualice la cantidad de una materia prima.
  crearMovSalida(entradas2: any, cantSaliente: number) {
    let salida: modelEntradas_Salidas_MP = {
      Id: 0,
      Id_Entrada: entradas2.Id,
      Tipo_Salida: 'AJUSTEMP',
      Codigo_Salida: 1,
      Tipo_Entrada: entradas2.Tipo_Entrada,
      Codigo_Entrada: entradas2.Codigo_Entrada,
      Fecha_Registro: this.today,
      Hora_Registro: this.hora,
      MatPri_Id: entradas2.MatPri_Id,
      Tinta_Id: entradas2.Tinta_Id,
      Bopp_Id: entradas2.Bopp_Id,
      Cantidad_Salida: cantSaliente,
      Orden_Trabajo: 0,
      Prod_Id: 1,
      Cant_PedidaOT: 0,
      UndMed_Id: 'N/E',
    }
    this.srvSalidasMP.Post(salida).subscribe(data => { }, error => console.log(error));
  }
}
