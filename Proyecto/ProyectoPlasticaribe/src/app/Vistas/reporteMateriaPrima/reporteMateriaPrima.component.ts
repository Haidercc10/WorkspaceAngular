import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table/table';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';
import { EntradaBOPPService } from 'src/app/Servicios/BOPP/entrada-BOPP.service';
import { CategoriaMateriaPrimaService } from 'src/app/Servicios/CategoriasMateriaPrima/categoriaMateriaPrima.service';
import { MateriaPrimaService } from 'src/app/Servicios/MateriaPrima/materiaPrima.service';
import { TintasService } from 'src/app/Servicios/Tintas/tintas.service';
import { TipoBodegaService } from 'src/app/Servicios/TipoBodega/tipoBodega.service';

@Component({
  selector: 'app-reporteMateriaPrima',
  templateUrl: './reporteMateriaPrima.component.html',
  styleUrls: ['./reporteMateriaPrima.component.css']
})
export class ReporteMateriaPrimaComponent implements OnInit {

  public FormMateriaPrimaFactura !: FormGroup;
  public FormMateriaPrima !: FormGroup;
  public FormMateriaPrimaRetiro !: FormGroup;
  public FormMateriaPrimaRetirada !: FormGroup;

  /* Vaiables*/
  @ViewChild('dt') dt: Table | undefined;
  @ViewChild('dt_Polientileno') dt_Polientileno: Table | undefined;
  @ViewChild('dt_Tintas') dt_Tintas: Table | undefined;
  @ViewChild('dt_Biorientados') dt_Biorientados: Table | undefined;
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  materiasPrimas = []; //Variable que va almacenar el nombre de todas las materias primas existentes en la empresa
  polietilenos : any [] = []; //Variable que va a almacenar la informacion de los polietilenos
  tintas : any [] = []; //Variable que va a almacenar la informacion de las tintas
  biorientados : any [] = []; //Variable que va a almacenar la información de los biorientados
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  ArrayMateriaPrima : any [] = []; //Variable que tendrá la informacion de los productos que se piden en el nuevo pedido
  valorTotal : number = 0; //Variable que guardará el valor total de la factura de entrada de materia prima
  categorias : any = []; //variable que almacenará las categorias existentes
  bodegas : any = []; //variable que almacenará las bodegas
  rongoFechas : any [] = []; //Variable que va a guardar el rango de fechas en el que se buscará informacion
  categoriasMP : any [] = []; //Variable que almcanará las categorias de la tabla Materia_Prima
  categoriasTintas : any [] = []; //Variable que almcanará las categorias de la tabla Tintas
  categoriasBOPP : any [] = []; //Variable que almcanará las categorias de la tabla BOPP
  arryMateriaPrimaFiltrada : any [] = []; //Variable que tendrá la informacion filtrada en las tablas

  load: boolean = true;
  idMateriasPrimas = [];
  cantInicial : number = 0;
  cantEntrante : number = 0;
  cantSaliente : number = 0;
  cantExistencias : number = 0;
  cantDiferencia : number = 0;

  constructor(private materiaPrimaService : MateriaPrimaService,
                private tintasService : TintasService,
                  private categoriMpService : CategoriaMateriaPrimaService,
                    private tipoBodegaService : TipoBodegaService,
                      private frmBuilderMateriaPrima : FormBuilder,
                        @Inject(SESSION_STORAGE) private storage: WebStorageService,
                          private boppService : EntradaBOPPService,
                            private messageService: MessageService) {

    this.FormMateriaPrima = this.frmBuilderMateriaPrima.group({
      MpId : [null, Validators.required],
      MpNombre: [null, Validators.required],
      MpCategoria : [null, Validators.required],
      MpBodega : [null, Validators.required],
      fecha: [null, Validators.required],
      fechaFinal: [null, Validators.required],
    });
  }

  // Funcion que exportará a excel todo el contenido de la tabla
  exportToExcel() : void {
    if (this.ArrayMateriaPrima.length == 0) this.mensajeAdvertencia("¡Para poder crear el archivo de Excel primero debe cargar la Materia Prima en la tabla!");
    else {
      this.load = true;
      setTimeout(() => {
        const title = `Inventario Materia_Prima - ${this.today}`;
        const header = ["Id", "Nombre", "Ancho", "Inventario Inicial", "Entrada", "Salida", "Cantidad Actual", "Diferencia", "Und. Cant", "Precio U", "SubTotal", "Categoria"]
        let datos : any =[];
        for (const item of this.ArrayMateriaPrima) {
          const datos1  : any = [item.Id, item.Nombre, item.Ancho, item.Inicial, item.Entrada, item.Salida, item.Cant, item.Diferencia, item.UndCant, item.PrecioUnd, item.SubTotal, item.Categoria];
          datos.push(datos1);
        }
        let workbook = new Workbook();
        const imageId1 = workbook.addImage({
          base64: logoParaPdf,
          extension: 'png',
        });
        let worksheet = workbook.addWorksheet(`Inventario Materia_Prima - ${this.today}`);
        worksheet.addImage(imageId1, 'A1:A3');
        let titleRow = worksheet.addRow([title]);
        titleRow.font = { name: 'Calibri', family: 4, size: 16, underline: 'double', bold: true };
        worksheet.addRow([]);
        worksheet.addRow([]);
        let headerRow = worksheet.addRow(header);
        headerRow.eachCell((cell, number) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'eeeeee' }
          }
          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
        });
        worksheet.mergeCells('A1:L3');
        worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
        datos.forEach(d => {
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
            fs.saveAs(blob, `Inventario Materia Prima - ${this.today}.xlsx`);
          });
          this.load = true;
        }, 1000);
      }, 3500);
    }
  }

  ngOnInit(): void {
    this.lecturaStorage();
    this.LimpiarCampos();
    this.obtenerCategorias();
    this.obtenerBodegas();
    this.consultarInventario();
    this.consultarCategorias();
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = '$1,';
    return number.toString().replace(exp,rep);
  }

  //
  LimpiarCampos() {
    this.FormMateriaPrima.reset()
    this.valorTotal = 0;
    this.materiasPrimas = [];
    this.obtenerMateriasPrimas();
  }

  // Funcion que va a consultar las categorias de las tablas Materia_Prima, Tintas y BOPP
  consultarCategorias(){
    this.materiaPrimaService.GetCategoriasMateriaPrima().subscribe(datos => { this.categoriasMP = datos; });
    this.tintasService.GetCategoriasTintas().subscribe(datos => { this.categoriasTintas = datos; });
    this.boppService.GetCategoriasBOPP().subscribe(datos => { this.categoriasBOPP = datos; });
  }

  //  Funcion que tomará y almacenará las bdoegas
  obtenerBodegas(){
    this.bodegas = [];
    this.tipoBodegaService.srvObtenerLista().subscribe(datos_bodegas => {
      for (let i = 0; i < datos_bodegas.length; i++) {
        if (datos_bodegas[i].tpBod_Id == 5 || datos_bodegas[i].tpBod_Id == 8 || datos_bodegas[i].tpBod_Id == 9 || datos_bodegas[i].tpBod_Id == 10){
          this.bodegas.push(datos_bodegas[i]);
          this.bodegas.sort((a,b) => a.tpBod_Nombre.localeCompare(b.tpBod_Nombre));
        }
      }
    });
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.storage.get('Id');
    this.storage_Nombre = this.storage.get('Nombre');
    this.ValidarRol = this.storage.get('Rol');
  }

  // Funcion para obtener las diferentes categorias de materia prima existentes
  obtenerCategorias(){
    this.categoriMpService.srvObtenerLista().subscribe(datos_categorias => { this.categorias = datos_categorias; });
    this.categorias.sort((a,b) => a.catMP_Nombre.localeCompare(b.catMP_Nombre));
  }

  // Funcion para obtener las materias primas registradas
  obtenerMateriasPrimas(){
    this.materiasPrimas = [];
    this.materiaPrimaService.GetMateriaPrima_LikeNombre(this.FormMateriaPrima.value.MpNombre).subscribe(datos_materiaPrima => { this.materiasPrimas = datos_materiaPrima; });
  }

  //Funcion que va a mostrar el nombre de la materia prima
  cambiarNombreMateriaPrima(){
    let id : number = this.FormMateriaPrima.value.MpNombre;
    this.materiaPrimaService.getInfoMpTintaBopp(id).subscribe(datos_materiaPrima => {
      for (let i = 0; i < datos_materiaPrima.length; i++) {
        this.FormMateriaPrima.patchValue({
          MpId : datos_materiaPrima[i].id,
          MpNombre: datos_materiaPrima[i].nombre,
        });
      }
    });
  }

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
        Inicial : data.inicial,
        Entrada : data.entrada,
        Salida : data.salida,
        Cant : data.stock,
        Diferencia : data.diferencia,
        UndCant : data.presentacion,
        PrecioUnd : data.precio,
        SubTotal : data.subTotal,
        Categoria : data.categoria,
      }
      this.idMateriasPrimas.push(info.Id);
      this.ArrayMateriaPrima.push(info);
      this.ArrayMateriaPrima.sort((a,b) => a.Nombre.localeCompare(b.Nombre));

      if (this.categoriasMP.includes(data.categoria_Id)) this.polietilenos.push(info);
      if (this.categoriasTintas.includes(data.categoria_Id)) this.tintas.push(info);
      if (this.categoriasBOPP.includes(data.categoria_Id)) this.biorientados.push(info);
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
    let materiaPrima : unknown [] = this.ArrayMateriaPrima.filter((item) => item.Cant > 0);
    this.ArrayMateriaPrima = materiaPrima;
    let polientilenos : unknown [] = this.polietilenos.filter((item) => item.Cant > 0);
    this.ArrayMateriaPrima = polientilenos;
    let tintas : unknown [] = this.tintas.filter((item) => item.Cant > 0);
    this.ArrayMateriaPrima = tintas;
    let biorientados : unknown [] = this.biorientados.filter((item) => item.Cant > 0);
    this.ArrayMateriaPrima = biorientados;
    this.load = true;
  }

  /** Función para mostrar las materias primas que tienen existencias. */
  mostrarMateriasPrimasConStock(){
    this.load = true;
    this.idMateriasPrimas = [];
    this.ArrayMateriaPrima = [];
    this.valorTotal = 0;
    this.cantInicial  = 0;
    this.cantEntrante = 0;
    this.cantSaliente = 0;
    this.cantExistencias = 0;
    this.cantDiferencia = 0;

    this.materiaPrimaService.srvObtenerLista().subscribe(datos_materiaPrima => {
      for (let i = 0; i < datos_materiaPrima.length; i++) {
        this.materiaPrimaService.GetConsultaMateriaPrimaF(this.today, this.today, datos_materiaPrima[i].matPri_Id).subscribe(datos_consulta => {
          for (let j = 0; j < datos_consulta.length; j++) {
            if (datos_consulta[j].stock > 0) this.cargarTabla(datos_consulta[j]);
          }
        });
      }
    });
    this.boppService.srvObtenerLista().subscribe(datos_bopp => {
      for (let i = 0; i < datos_bopp.length; i++) {
        this.materiaPrimaService.GetConsultaMateriaPrimaF(this.today, this.today, datos_bopp[i].bopP_Serial).subscribe(datos_consulta => {
          for (let j = 0; j < datos_consulta.length; j++) {
            if (datos_consulta[j].stock > 0) this.cargarTabla(datos_consulta[j]);
          }
        });
      }
    });
    this.tintasService.srvObtenerLista().subscribe(datos_tintas => {
      for (let i = 0; i < datos_tintas.length; i++) {
        this.materiaPrimaService.GetConsultaMateriaPrimaF(this.today, this.today, datos_tintas[i].tinta_Id).subscribe(datos_consulta => {
          for (let j = 0; j < datos_consulta.length; j++) {
            if (datos_consulta[j].stock > 0) this.cargarTabla(datos_consulta[j]);
          }
        });
      }
    });
    setTimeout(() => { this.load = true; }, 5000);
  }

  // Funcion que limpiará los filtros utilizados en la tabla
  clear(table: Table) {
    table.clear();
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
    if (num == 1) datos = this.ArrayMateriaPrima; //Todas las materias primas
    else if (num == 2) { //Primer Tab de Materias Primas
      if (this.dt.filteredValue != null) datos = this.dt.filteredValue; //Materias primas Filtradas
      else datos = this.ArrayMateriaPrima; //Materias primas no filtradas
    } else if (num == 3) { //Segundo Tab - Polietilenos
      if (this.dt_Polientileno.filteredValue != null) datos = this.dt_Polientileno.filteredValue; //Polietilenos filtrados
      else datos = this.polietilenos; //Polietilenos no filtrados
    } else if (num == 4) { //Tercer Tab - Tintas
      if (this.dt_Tintas.filteredValue != null) datos = this.dt_Tintas.filteredValue; //Tintas Filtradas
      else datos = this.tintas;
    } else if (num == 5) { //Cuarto tab - Biorientado
      if (this.dt_Biorientados.filteredValue != null) datos = this.dt_Biorientados.filteredValue; //Biorientado filtrado
      else datos = this.biorientados; //Biorientado no filtrado
    }

    setTimeout(() => {
      const title = `Inventario Materia_Prima - ${this.today}`;
      const header = ["Id", "Nombre", "Ancho", "Inventario Inicial", "Entrada", "Salida", "Cantidad Actual", "Diferencia", "Und. Cant", "Precio U", "SubTotal", "Categoria"]
      for (const item of datos) {
        const datos1  : any = [item.Id, item.Nombre, item.Ancho, item.Inicial, item.Entrada, item.Salida, item.Cant, item.Diferencia, item.UndCant, item.PrecioUnd, item.SubTotal, item.Categoria];
        infoDocumento.push(datos1);
      }
      let workbook = new Workbook();
      const imageId1 = workbook.addImage({ base64:  logoParaPdf, extension: 'png', });
      let worksheet = workbook.addWorksheet(`Inventario Materia Prima - ${this.today}`);
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
          fs.saveAs(blob, `Inventario Materia Prima - ${this.today}.xlsx`);
        });
        this.load = true;
        this.mensajeConfirmacion(`¡Información Exportada!`, `¡Se ha creado un archivo de Excel con la información del inventario de materia prima!`);
      }, 1000);
    }, 1500);
  }

  /** Mostrar mensaje de confirmación  */
  mensajeConfirmacion(titulo : string, mensaje : any) {
    this.messageService.add({severity: 'success', summary: mensaje,  detail: titulo, life: 2000});
   }

  /** Mostrar mensaje de error  */
  mensajeError(titulo : string, mensaje : string) {
  this.messageService.add({severity:'error', summary: mensaje, detail: titulo, life: 2000});
  }

  /** Mostrar mensaje de advertencia */
  mensajeAdvertencia(mensaje : string) {
  this.messageService.add({severity:'warn', summary: mensaje, detail: `¡Advertencia!`, life: 2000});
  }
}
