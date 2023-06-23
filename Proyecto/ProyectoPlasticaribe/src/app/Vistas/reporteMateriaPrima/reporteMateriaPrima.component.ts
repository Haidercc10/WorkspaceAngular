import { Component, OnInit, ViewChild } from '@angular/core';
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
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  categorias : any = []; //variable que almacenará las categorias existentes
  undMedidas : any [] = []; //Variable que almacenará las unidades de medidas
  bodegas : any = []; //variable que almacenará las bodegas
  rongoFechas : any [] = []; //Variable que va a guardar el rango de fechas en el que se buscará informacion
  categoriasMP : any [] = []; //Variable que almcanará las categorias de la tabla Materia_Prima
  categoriasTintas : any [] = []; //Variable que almcanará las categorias de la tabla Tintas
  categoriasBOPP : any [] = []; //Variable que almcanará las categorias de la tabla BOPP
  arryMateriaPrimaFiltrada : any [] = []; //Variable que tendrá la informacion filtrada en las tablas
  load: boolean = true; //Variable que validará cuando vaya a salir la animacion de carga
  ArrayMateriaPrima : any [] = []; //Variable que tendrá la informacion de los productos que se piden en el nuevo pedido
  valorTotal : number = 0; //Variable que guardará el valor total de la total de toda la materia prima
  cantInicial : number = 0; //Variable que guardará la cantidad inicial total de materia prima
  cantEntrante : number = 0; //Variable que guardará la cantidad total entrante de la materia prima
  cantSaliente : number = 0; //Variable que guardará la cantidad total saliente de la materia prima
  cantExistencias : number = 0; //Variable que guardará la cantidad total en existencias de la materia prima
  cantDiferencia : number = 0; //Variable que guardará la cantidad total de diferencia entre lo inical y lo actual
  polietilenos : any [] = []; //Variable que va a almacenar la informacion de los polietilenos
  valorTotalPolietileno : number = 0; //Variable que guardará el valor tatal de la cantidad de todos los polietilenos
  cantInicialPolietileno : number = 0; //Variable que guardará la cantidad inicial total de polietilenos
  cantEntrantePolietileno : number = 0; //Variable que guardará la cantidad total entrante de polietilenos
  cantSalientePolietileno : number = 0; //Variable que guardará la cantidad total saliente de polietilenos
  cantExistenciasPolientileno : number = 0; //Variable que guardará la cantidad total en existencias de polietilenos
  cantDiferenciaPolietileno : number = 0; //Variable que guardará la cantidad total de diferencia entre lo inical y lo actual de los polietilenos
  tintas : any [] = []; //Variable que va a almacenar la informacion de las tintas
  valorTotalTintas : number = 0; //Variable que guardará el valor tatal de la cantidad de todos las tintas
  cantInicialTintas : number = 0; //Variable que guardará la cantidad inicial total de las tintas
  cantEntranteTintas : number = 0; //Variable que guardará la cantidad total entrante de las tintas
  cantSalienteTintas : number = 0; //Variable que guardará la cantidad total saliente de las tintas
  cantExistenciasTintas : number = 0; //Variable que guardará la cantidad total en existencias de las tintas
  cantDiferenciaTintas : number = 0; //Variable que guardará la cantidad total de diferencia entre lo inical y lo actual de las tintas
  biorientados : any [] = []; //Variable que va a almacenar la información de los biorientados
  valorTotalBiorientado : number = 0; //Variable que guardará el valor tatal de la cantidad de todos los biorientados
  cantInicialBiorientado : number = 0; //Variable que guardará la cantidad inicial total de los biorientados
  cantEntranteBiorientado : number = 0; //Variable que guardará la cantidad total entrante de los biorientados
  cantSalienteBiorientado : number = 0; //Variable que guardará la cantidad total saliente de los biorientados
  cantExistenciasBiorientado : number = 0; //Variable que guardará la cantidad total en existencias de los biorientados
  cantDiferenciaBiorientado : number = 0; //Variable que guardará la cantidad total de diferencia entre lo inical y lo actual de los biorientados
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro

  modalCreacionMateriaPrima : boolean = false; //Variable para validar que se abra el modal en que se pregusntará que se creará
  ModalCrearMateriaPrima: boolean= false; //Variable para validar que se abra el modal de creacion de polietileno
  ModalCrearTintas: boolean= false; //Variable para validar que se abra el modal de creacion de tintas, chips, solvenetes
  modalEditarMateriasPrimas : boolean = false;

  constructor(private materiaPrimaService : MateriaPrimaService,
                private tintasService : TintasService,
                  private categoriMpService : CategoriaMateriaPrimaService,
                    private AppComponent : AppComponent,
                      private boppService : EntradaBOPPService,
                          private shepherdService: ShepherdService,
                            private frmBuilder : FormBuilder,
                              private undMedidaService : UnidadMedidaService,
                                private msj : MensajesAplicacionService) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
    this.FormEdicionMateriaPrima = this.frmBuilder.group({
      Id : [null, Validators.required],
      Nombre : [null, Validators.required],
      Categoria : [null, Validators.required],
      Ancho : [null, Validators.required],
      Stock : [null, Validators.required],
      UndMed : [null, Validators.required],
      Precio : [null, Validators.required],
      Micras : [null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.lecturaStorage();
    this.obtenerCategorias();
    this.consultarInventario();
    this.consultarCategorias();
    this.obtenerUnidadesMedidas();
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = '$1,';
    return number.toString().replace(exp,rep);
  }

  // Funcion que va a consultar las categorias de las tablas Materia_Prima, Tintas y BOPP
  consultarCategorias(){
    this.materiaPrimaService.GetCategoriasMateriaPrima().subscribe(datos => { this.categoriasMP = datos; });
    this.tintasService.GetCategoriasTintas().subscribe(datos => { this.categoriasTintas = datos; });
    this.boppService.GetCategoriasBOPP().subscribe(datos => { this.categoriasBOPP = datos; });
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  // Funcion para obtener las diferentes categorias de materia prima existentes
  obtenerCategorias(){
    this.categoriMpService.srvObtenerLista().subscribe(datos_categorias => this.categorias = datos_categorias);
    this.categorias.sort((a,b) => a.catMP_Nombre.localeCompare(b.catMP_Nombre));
  }

  // Funcion que va a obtener las diferentes materias primas
  obtenerUnidadesMedidas = () => this.undMedidaService.srvObtenerLista().subscribe(data => this.undMedidas = data);

  // Funcion que cargará las informacion de las materias primas segun los filtros que se consulten
  cargarTabla(data : any){
    if (data.id != 84 && data.id != 2001 && data.id != 88 && data.id != 89 && data.id != 2072){
      this.valorTotal = this.valorTotal + data.precio * data.stock;
      this.cantInicial += data.inicial;
      this.cantEntrante += data.entrada;
      this.cantSaliente += data.salida;
      this.cantExistencias += data.stock;
      this.cantDiferencia += data.diferencia;

      let info : any = {
        Id : data.id,
        Nombre : data.nombre,
        Ancho : data.ancho,
        Micras : data.micras,
        Inicial : data.inicial,
        Entrada : data.entrada,
        Salida : data.salida,
        Cant : data.stock,
        Diferencia : data.diferencia,
        UndCant : data.presentacion,
        PrecioUnd : data.precio,
        SubTotal : data.subTotal,
        Categoria : data.categoria,
        Categoria_Id : data.categoria_Id
      }
      if (this.ValidarRol == 1 || this.ValidarRol == 3) this.ArrayMateriaPrima.push(info);
      this.ArrayMateriaPrima.sort((a,b) => a.Nombre.localeCompare(b.Nombre));

      if (this.categoriasMP.includes(data.categoria_Id) && (this.ValidarRol == 1 || this.ValidarRol == 3)) {
        this.polietilenos.push(info);
        this.valorTotalPolietileno += data.precio * data.stock;
        this.cantInicialPolietileno += data.inicial;
        this.cantEntrantePolietileno += data.entrada;
        this.cantSalientePolietileno += data.salida;
        this.cantExistenciasPolientileno += data.stock;
        this.cantDiferenciaPolietileno += data.diferencia;
      }
      if (this.categoriasTintas.includes(data.categoria_Id) && (this.ValidarRol == 1 || this.ValidarRol == 3)) {
        this.tintas.push(info);
        this.valorTotalTintas += data.precio * data.stock;
        this.cantInicialTintas += data.inicial;
        this.cantEntranteTintas += data.entrada;
        this.cantSalienteTintas += data.salida;
        this.cantExistenciasTintas += data.stock;
        this.cantDiferenciaTintas += data.diferencia;
      }
      if (this.categoriasBOPP.includes(data.categoria_Id) && (this.ValidarRol == 1 || this.ValidarRol == 3 || this.ValidarRol == 4)) {
        this.biorientados.push(info);
        this.valorTotalBiorientado += data.precio * data.stock;
        this.cantInicialBiorientado += data.inicial;
        this.cantEntranteBiorientado += data.entrada;
        this.cantSalienteBiorientado += data.salida;
        this.cantExistenciasBiorientado += data.stock;
        this.cantDiferenciaBiorientado += data.diferencia;
      }
      this.polietilenos.sort((a,b) => a.Nombre.localeCompare(b.Nombre));
      this.tintas.sort((a,b) => a.Nombre.localeCompare(b.Nombre));
      this.biorientados.sort((a,b) => a.Nombre.localeCompare(b.Nombre));
    }
  }

  // Funcion que va a consultar la informacion del inventario de las materias primas
  consultarInventario(){
    this.load = false;
    this.ArrayMateriaPrima = [];
    this.polietilenos = [];
    this.tintas = [];
    this.biorientados = [];
    this.valorTotal = 0;
    this.cantInicial  = 0;
    this.cantEntrante = 0;
    this.cantSaliente = 0;
    this.cantExistencias = 0;
    this.cantDiferencia = 0;
    let fecha : any = this.rongoFechas.length > 0 ? moment(this.rongoFechas[0]).format('YYYY-MM-DD') : this.today;
    let fechaFinal : any = this.rongoFechas.length > 0 ? moment(this.rongoFechas[1]).format('YYYY-MM-DD') : fecha;

    this.materiaPrimaService.GetInventarioMateriasPrimas().subscribe(data => {
      for (let i = 0; i < data.length; i++) {
        this.materiaPrimaService.GetInventario(fecha, fechaFinal, data[i].id_Materia_Prima).subscribe(datos => {
          for (let j = 0; j < datos.length; j++) {
            this.cargarTabla(datos[j]);
          }
        });
      }
    });
    setTimeout(() => { this.load = true; }, 2500);
  }

  // Funcion que va a mostrar las materias primas con existencias mayor a cero
  existenciasMayorCero(){
    this.load = false;
    this.ArrayMateriaPrima = this.ArrayMateriaPrima.filter((item) => item.Cant > 0);
    this.polietilenos = this.polietilenos.filter((item) => item.Cant > 0);
    this.tintas = this.tintas.filter((item) => item.Cant > 0);
    this.biorientados = this.biorientados.filter((item) => item.Cant > 0);
    this.load = true;
  }

  /** Funcion para filtrar busquedas y mostrar el valor total segun el filtro seleccionado. */
  aplicarfiltro($event, campo : any, valorCampo : string){
    this.dt!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);
    setTimeout(() => {
      if(this.dt.filteredValue != null) {
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

  // Funcion que va a filtrar la información de la tabla e polietilenos
  aplicarFiltroPolietilenos($event, campo : any, valorCampo : string){
    this.dt_Polientileno!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);
    setTimeout(() => {
      if(this.dt_Polientileno.filteredValue != null) {
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
  aplicarFiltroTintas($event, campo : any, valorCampo : string) {
    this.dt_Tintas!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);
    setTimeout(() => {
      if(this.dt_Tintas.filteredValue != null) {
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
  aplicarFiltrosBiorientados($event, campo : any, valorCampo : string){
    this.dt_Biorientados!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);
    setTimeout(() => {
      if(this.dt_Biorientados.filteredValue != null) {
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
  exportarExcel(num : number){
    this.load = false;
    let datos : any [] = [];
    let infoDocumento : any [] = [];
    let title : string = ``;
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

    setTimeout(() => {
      const header = ["Id", "Nombre", "Ancho", "Inventario Inicial", "Entrada", "Salida", "Cantidad Actual", "Diferencia", "Und. Cant", "Precio U", "SubTotal", "Categoria"]
      for (const item of datos) {
        const datos1  : any = [item.Id, item.Nombre, item.Ancho, item.Inicial, item.Entrada, item.Salida, item.Cant, item.Diferencia, item.UndCant, item.PrecioUnd, item.SubTotal, item.Categoria];
        infoDocumento.push(datos1);
      }
      let workbook = new Workbook();
      const imageId1 = workbook.addImage({ base64:  logoParaPdf, extension: 'png', });
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
        let qty= row.getCell(7);
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
        this.msj.mensajeConfirmacion(`¡Información Exportada!`, `¡Se ha creado un archivo de Excel con la información del !` + title);
      }, 1000);
    }, 1500);
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
  crearPolientileno(){
    this.modalCreacionMateriaPrima = false;
    this.ModalCrearMateriaPrima = true;
  }

  // Funcion para llamar el modal que crea tintas
  creartinta(){
    this.modalCreacionMateriaPrima = false;
    this.ModalCrearTintas = true;
  }

  // Funcion que va a llamar el modal donde se editará la información de la materia prima
  llamarModalEdicionMateriaPrima(data : any){
    this.modalEditarMateriasPrimas = true;
    this.FormEdicionMateriaPrima.patchValue({
      Id : data.Id,
      Nombre : data.Nombre,
      Categoria : data.Categoria_Id,
      Ancho : data.Ancho,
      Stock : data.Cant,
      UndMed : data.UndCant,
      Precio : data.PrecioUnd,
      Micras : 0
    });
    if (this.categoriasBOPP.includes(this.FormEdicionMateriaPrima.value.Categoria)){
      this.boppService.srvObtenerListaPorSerial(this.FormEdicionMateriaPrima.value.Id).subscribe(data => {
        for (let i = 0; i < data.length; i++) {
          this.FormEdicionMateriaPrima.patchValue({ Micras: data[i].bopP_CantidadMicras});
        }
      });
    }
  }

  // Funcion que va a editar una materia primas
  editarMateriaPrima() {
    if (this.categoriasMP.includes(this.FormEdicionMateriaPrima.value.Categoria)) {
      const info : modelMateriaPrima = {
        MatPri_Id: this.FormEdicionMateriaPrima.value.Id,
        MatPri_Nombre: this.FormEdicionMateriaPrima.value.Nombre,
        MatPri_Descripcion: this.FormEdicionMateriaPrima.value.Nombre,
        MatPri_Stock: this.FormEdicionMateriaPrima.value.Stock,
        UndMed_Id: this.FormEdicionMateriaPrima.value.UndMed,
        CatMP_Id: this.FormEdicionMateriaPrima.value.Categoria,
        MatPri_Precio: this.FormEdicionMateriaPrima.value.Precio,
        TpBod_Id: 4
      }
      this.materiaPrimaService.srvActualizar(info.MatPri_Id, info).subscribe(() => {
        this.consultarInventario();
        this.msj.mensajeConfirmacion(`¡Polietileno Actualizado!`, `¡La materia prima con el nombre '${info.MatPri_Nombre}' ha sido actualizada con exito!`);
        this.modalEditarMateriasPrimas = false;
      }, () => {
        this.msj.mensajeError(`¡Error!`, `¡Ha ocurrido un error al intentar actualizar la materia prima!`);
        this.modalEditarMateriasPrimas = false;
      });
    } else if (this.categoriasTintas.includes(this.FormEdicionMateriaPrima.value.Categoria)) {
      this.tintasService.srvObtenerListaPorId(this.FormEdicionMateriaPrima.value.Id).subscribe(data => {
        const info : modelTintas = {
          Tinta_Id : this.FormEdicionMateriaPrima.value.Id,
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
        }
        this.tintasService.srvActualizar(info.Tinta_Id, info).subscribe(() => {
          this.consultarInventario();
          this.msj.mensajeConfirmacion(`¡Tinta Actualizada!`, `¡La tinta con el nombre '${info.Tinta_Nombre}' ha sido actualizada con exito!`);
          this.modalEditarMateriasPrimas = false;
        }, () => {
          this.msj.mensajeError(`¡Error!`, `¡Ha ocurrido un error al intentar actualizar la tinta!`);
          this.modalEditarMateriasPrimas = false;
        })
      });
    } else if (this.categoriasBOPP.includes(this.FormEdicionMateriaPrima.value.Categoria)){
      this.boppService.srvObtenerListaPorSerial(this.FormEdicionMateriaPrima.value.Id).subscribe(data => {
        for (let i = 0; i < data.length; i++) {
          const info : modelBOPP = {
            BOPP_Id : data[i].bopP_Id,
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
            BOPP_Hora: data[i].bopP_Hora
          }
          this.boppService.srvActualizar(info.BOPP_Id, info).subscribe(() => {
            this.consultarInventario();
            this.msj.mensajeConfirmacion(`¡Biorientado Actualizado!`, `El biorientado con el nombre '${info.BOPP_Nombre}' ha sido actualizado con exito!`);
            this.modalEditarMateriasPrimas = false;
          }, () => {
            this.msj.mensajeError(`¡Error!`, `¡Ha ocurrido un error al intentar actualizar el biorientado!`);
            this.modalEditarMateriasPrimas = false;
          })
        }
      });
    }
  }
}
