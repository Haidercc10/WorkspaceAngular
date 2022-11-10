import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { AsignacionBOPPService } from 'src/app/Servicios/asignacionBOPP.service';
import { AsignacionMPService } from 'src/app/Servicios/asignacionMP.service';
import { CategoriaMateriaPrimaService } from 'src/app/Servicios/categoriaMateriaPrima.service';
import { DetallesAsignacionService } from 'src/app/Servicios/detallesAsignacion.service';
import { DetalleAsignacion_BOPPService } from 'src/app/Servicios/detallesAsignacionBOPP.service';
import { DetallesAsignacionTintasService } from 'src/app/Servicios/detallesAsignacionTintas.service';
import { DevolucionesService } from 'src/app/Servicios/devoluciones.service';
import { DevolucionesMPService } from 'src/app/Servicios/devolucionesMP.service';
import { EntradaBOPPService } from 'src/app/Servicios/entrada-BOPP.service';
import { FacturaMpService } from 'src/app/Servicios/facturaMp.service';
import { FactuaMpCompradaService } from 'src/app/Servicios/facturaMpComprada.service';
import { InventInicialDiaService } from 'src/app/Servicios/inventInicialDia.service';
import { MateriaPrimaService } from 'src/app/Servicios/materiaPrima.service';
import { RecuperadoService } from 'src/app/Servicios/recuperado.service';
import { RecuperadoMPService } from 'src/app/Servicios/recuperadoMP.service';
import { RemisionService } from 'src/app/Servicios/Remision.service';
import { RemisionesMPService } from 'src/app/Servicios/remisionesMP.service';
import { RolesService } from 'src/app/Servicios/roles.service';
import { TintasService } from 'src/app/Servicios/tintas.service';
import { TipoBodegaService } from 'src/app/Servicios/tipoBodega.service';
import Swal from 'sweetalert2';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import { Entrada_TintaService } from 'src/app/Servicios/Entrada_Tinta.service';
import { Detalles_EntradaTintasService } from 'src/app/Servicios/Detalles_EntradaTintas.service';

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
  public page : number; //Variable que tendrá el paginado de la tabla en la que se muestran los pedidos consultados
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  ultimoIdMateriaPrima : number; //Varibale que va a almacenar el id de la ultima materia prima registrada y le va a sumar 1
  materiasPrimas = []; //Variable que va almacenar el nombre de todas las materias primas existentes en la empresa
  materiasPrimasRetiradas = []; //Variable que va almacenar el nombre de todas las materias primas existentes en la empresa
  nombreCategoriasMP = []; //VAriable que va a almacenar el nombre de todas las categorias de materias primas existentes en la empresa
  unidadMedida = []; //Varibale que va a almacenar las unidades de medida registradas en la base de datos
  usuarios = []; //Variable que va a almacenar todos los usuarios de la empresa
  estado = []; //Variable que va a almacenar todos los tipos de estados de documentos
  procesos = []; //Variable que va a almacenar los procesos que tiene la empresa (extrusio, impresion, etc...)
  areas = []; //Varibale que va a almacenar las areas de la empresa
  materiaPrimaBuscadaId = []; //Variable que almacenará la informacion de la materia prima buscada por ID
  categoriaMPBuscadaID : string; //Variable que almacenará el nombre de la categoria de la materia prima buscada por Id
  tipobodegaMPBuscadaId : string; //Variable que almacenará el nombrede la bodega en la que se encuentra la materia prima buscada
  materiaPrimaSeleccionada = []; //Variable que almacenará la informacion de la materia prima seleccionada
  categoriaMPSeleccionada : string; //Variable que almacenará el nombre de la categoria de la materia prima seleccionada
  tipoBodegaMPSeleccionada : string; //Variable que almacenará el nombrede la bodega en la que se encuentra la materia prima seleccionada
  facturaMateriaPrima = []; //Funcion que guardará la informacion de la factura de materia prima comprada que ha sido consultada
  today : any = new Date(); //Variable que se usará para llenar la fecha actual
  titulosTabla = []; //Variable que almacenará los titulos de la tabla de productos que se ve al final de la vista
  ArrayMateriaPrima : any [] = []; //Variable que tendrá la informacion de los productos que se piden en el nuevo pedido
  ArrayMateriaPrimaRetirada : any [] = []; //Variable que tendrá la informacion de los productos que se piden para uan OT
  AccionBoton = "Agregar"; //Variable que almanará informacio para saber si una materia prima está en edicion o no (Se editará una materia prima cargada en la tabla, no una en la base de datos)
  valorTotal : number = 0; //Variable que guardará el valor total de la factura de entrada de materia prima
  nombreMateriaPrima : string; //Varible que almacenará el nombre de una materia prima consultado o seleccionado
  precioOT : number; //Variable que va a almacenar el precio de la ot consultada
  cantidadTotalExt : number; //Variable que va a almacenar el total de la cantidad extruida en una OT
  cantidadTotalImp : number; //Variable que va a almacenar el total de la cantidad impresa en una OT
  cantidadTotalDbl : number; //Variable que va a almacenar el total de la cantidad doblada en una OT
  proceso : string = ''; //Variable ayudará a almacenar el proceso del cuela se está consultando la ot
  totalPorcentajePerida : number; //Variable que ayudará a calcular el total de perdida en una OT
  name = 'Inventario_Materia_Prima.xlsx'; //Variable que le da nombre al archivo de excel que se genera
  inventInicial : number = 0; //Variable que almacena el inventario inicial de una materia prima
  sumaEntrada : number = 0; //Variable que almacena el total de entrada que tuvo una materia prima
  sumaSalida : number = 0; //Variable que almacena el total de salidas que tuvo una materia prima
  categorias : any = []; //variable que almacenará las categorias existentes
  categoriaBOPP : string;
  validarInput : any; //Variable para validar si el input de materia prima tiene información o no
  keyword = 'Nombre'; //Variable que le dirá al autocomplement por que caracteristica busca en el array
  public historyHeading: string = 'Seleccionado Recientemente'; //Variable que se mostrará al momento en que salen las materias primas buscadas recientemente
  bodegas : any = []; //variable que almacenará las bodegas
  categoriaSeleccionadaCombo = [];
  public load: boolean;
  MpConsultada = [];
  idMateriasPrimas = [];

  constructor(private materiaPrimaService : MateriaPrimaService,
                private tintasService : TintasService,
                  private categoriMpService : CategoriaMateriaPrimaService,
                    private tipoBodegaService : TipoBodegaService,
                      private rolService : RolesService,
                        private frmBuilderMateriaPrima : FormBuilder,
                          @Inject(SESSION_STORAGE) private storage: WebStorageService,
                            private remisionService : RemisionService,
                              private remisionMpService : RemisionesMPService,
                                private facturaCompraService : FactuaMpCompradaService,
                                  private facturaCompraMPService : FacturaMpService,
                                    private asignacionService : AsignacionMPService,
                                      private asignacionMpService : DetallesAsignacionService,
                                        private asignacionTintasService : DetallesAsignacionTintasService,
                                          private recuperadoService : RecuperadoService,
                                            private recuperadoMPService : RecuperadoMPService,
                                              private inventInicialDiaService : InventInicialDiaService,
                                                private boppService : EntradaBOPPService,
                                                  private asignacionBOPPService : AsignacionBOPPService,
                                                    private detallesAsignacionBOPPService : DetalleAsignacion_BOPPService,
                                                      private devolucionesService : DevolucionesService,
                                                        private detallesDevolucionesService : DevolucionesMPService,
                                                          private entradaTintasService : Entrada_TintaService,
                                                            private detallesEntTintas : Detalles_EntradaTintasService,) {

    this.FormMateriaPrima = this.frmBuilderMateriaPrima.group({
      MpId : ['', Validators.required],
      MpNombre: [, Validators.required],
      MpCantidad : ['', Validators.required],
      MpPrecio: ['', Validators.required],
      MpUnidadMedida: ['', Validators.required],
      fecha: [this.today, Validators.required],
      fechaFinal: ['', Validators.required],
      MpCategoria : ['', Validators.required],
      MpBodega : ['', Validators.required],
    });

    this.load = true;
    this.validarInput = true;
  }

  // Funcion que exportará a excel todo el contenido de la tabla
  exportToExcel() : void {
    if (this.ArrayMateriaPrima.length == 0) Swal.fire("¡Para poder crear el archivo de Excel primero debe cargar la Materia Prima en la tabla!");
    else {
      this.load = false;
      setTimeout(() => {
        const title = `Inventario Materia_Prima - ${this.today}`;
        const header = ["Id", "Nombre", "Ancho", "Inventario Inicial", "Entrada", "Salida", "Cantidad Actual", "Diferencia", "Und. Cant", "Precio U", "SubTotal", "Categoria"]
        let datos : any =[];
        for (const item of this.ArrayMateriaPrima) {
          const datos1  : any = [item.Id, item.Nombre, item.Ancho, item.Inicial, item.Entrada, item.Salida, item.Cant, item.Diferencia, item.UndCant, item.PrecioUnd, item.SubTotal, item.Categoria];
          datos.push(datos1);
        }
        let workbook = new Workbook();
        let worksheet = workbook.addWorksheet(`Inventario Materia_Prima - ${this.today}`);
        let titleRow = worksheet.addRow([title]);
        titleRow.font = { name: 'Calibri', family: 4, size: 16, underline: 'double', bold: true };
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
        worksheet.mergeCells('A1:L2');
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
            fs.saveAs(blob, `Inventario Materia_Prima - ${this.today}.xlsx`);
          });
          this.load = true;
        }, 1000);
      }, 3500);
    }
  }

  ngOnInit(): void {
    this.lecturaStorage();
    this.ColumnasTabla();
    this.LimpiarCampos();
    this.fecha();
    this.obtenerCategorias();
    setTimeout(() => {
      this.obtenerBOPP();
      this.obtenerTintas();
      this.obtenerMateriasPrimasRetiradas();
      this.obtenerBodegas();
    }, 500);
  }

  // Funcion para validar si el input que contiene las materias primas a cambiado
  onChangeSearch(val: string) {
    if (val != '') this.validarInput = false;
    else this.validarInput = true;
    // fetch remote data from here
    // And reassign the 'data' which is binded to 'data' property.
  }

  // Funcion para validar si el input que contiene las materias primas está seleccionado, es decir que está esperando que se escriba sobre el
  onFocused(e){
    if (e.isTrusted || this.FormMateriaPrima.value.MpNombre != '') this.validarInput = true;
    // do something when input is focused
  }

  //Funcion que colocará la fecha actual y la colocará en el campo de fecha de pedido
  fecha(){
    this.today = new Date();
    var dd : any = this.today.getDate();
    var mm : any = this.today.getMonth() + 1;
    var yyyy : any = this.today.getFullYear();
    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
    this.today = yyyy + '-' + mm + '-' + dd;
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = '$1,';
    return number.toString().replace(exp,rep);
  }

  //
  LimpiarCampos() {
    this.FormMateriaPrima = this.frmBuilderMateriaPrima.group({
      MpId : null,
      MpNombre: '',
      MpCantidad : null,
      MpPrecio: null,
      MpUnidadMedida: null,
      fecha: null,
      fechaFinal: null,
      MpCategoria : null,
      MpBodega : null,
    });
    this.valorTotal = 0;
    this.categoriaBOPP = '';
    this.materiasPrimas = [];
    this.validarInput = true;
    this.obtenerBOPP();
    this.obtenerMateriasPrimasRetiradas();
    this.obtenerTintas();
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
    let rol = this.storage.get('Rol');
    this.rolService.srvObtenerLista().subscribe(datos_roles => {
      for (let index = 0; index < datos_roles.length; index++) {
        if (datos_roles[index].rolUsu_Id == rol) {
          this.ValidarRol = rol;
          this.storage_Rol = datos_roles[index].rolUsu_Nombre;
        }
      }
    });
  }

  // Funcion para obtener las diferentes categorias de materia prima existentes
  obtenerCategorias(){
    this.categoriMpService.srvObtenerLista().subscribe(datos_categorias => {
      for (let i = 0; i < datos_categorias.length; i++) {
        this.categorias.push(datos_categorias[i]);
        this.categorias.sort((a,b) => a.catMP_Nombre.localeCompare(b.catMP_Nombre));
      }
    });
  }

  // Funcion para mostrar las tintas
  obtenerTintas(){
    if (this.ValidarRol == 1 || this.ValidarRol == 3){
      this.tintasService.srvObtenerLista().subscribe(datos_materiaPrima => {
        for (let index = 0; index < datos_materiaPrima.length; index++) {
          const mp : any = {
            Id : datos_materiaPrima[index].tinta_Id,
            Nombre : datos_materiaPrima[index].tinta_Nombre,
          }
          this.materiasPrimas.push(mp);
          this.materiasPrimas.sort((a,b) => a.Nombre.localeCompare(b.Nombre));
        }
      });
    }
  }

  // Funcion para obtener el bopp existente
  obtenerBOPP(){
    if (this.ValidarRol == 1 || this.ValidarRol == 3) {
      this.boppService.srvObtenerLista().subscribe(datos_bopp => {
        for (let i = 0; i < datos_bopp.length; i++) {
          const bopp : any = {
            Id : datos_bopp[i].bopP_Id,
            Nombre : datos_bopp[i].bopP_Nombre,
          }
          this.materiasPrimas.push(bopp);
          this.materiasPrimas.sort((a,b) => a.Nombre.localeCompare(b.Nombre));
        }
      });
    }
  }

  // Funcion para obtener las materias primas registradas
  obtenerMateriasPrimasRetiradas(){
    if (this.ValidarRol == 1 || this.ValidarRol == 3){
      this.materiaPrimaService.srvObtenerLista().subscribe(datos_materiaPrima => {
        for (let index = 0; index < datos_materiaPrima.length; index++) {
          const mp : any = {
            Id : datos_materiaPrima[index].matPri_Id,
            Nombre : datos_materiaPrima[index].matPri_Nombre,
          }
          this.materiasPrimas.push(mp);
          this.materiasPrimas.sort((a,b) => a.Nombre.localeCompare(b.Nombre));
        }
      });
    }
  }

  // Funcion para buscar por id una materia prima o bopp o tinta
  buscarMpId(){

    this.ArrayMateriaPrima = [];
    this.valorTotal = 0;
    let idMateriaPrima : number = this.FormMateriaPrima.value.MpId;
    let sumaEntrada : number = 0;
    let sumaSalida : number = 0;
    this.materiaPrimaSeleccionada = [];
    this.categoriaMPBuscadaID = '';
    this.tipobodegaMPBuscadaId = '';
    this.categoriaBOPP = '';

    this.materiaPrimaService.srvObtenerListaPorId(idMateriaPrima).subscribe(datos_materiaPrima => {
      this.categoriMpService.srvObtenerListaPorId(datos_materiaPrima.catMP_Id).subscribe(datos_categoria => {
        this.tipoBodegaService.srvObtenerListaPorId(datos_materiaPrima.tpBod_Id).subscribe(datos_bodega => {
          this.materiaPrimaSeleccionada.push(datos_materiaPrima);
          this.materiasPrimas.push(datos_materiaPrima);
          this.categoriaMPBuscadaID = datos_categoria.catMP_Nombre;
          this.tipobodegaMPBuscadaId = datos_bodega.tpBod_Nombre;
          this.cargarFormMpEnTablas(this.ArrayMateriaPrima, datos_materiaPrima.matPri_Id, datos_materiaPrima.matPri_Nombre, datos_materiaPrima.matPri_Precio, this.inventInicial, sumaEntrada, sumaSalida, datos_materiaPrima.matPri_Stock, datos_materiaPrima.undMed_Id, this.categoriaMPBuscadaID);
        });
      });
    });

    this.boppService.srvObtenerListaPorSerial(idMateriaPrima).subscribe(datos_bopp => {
      for (const item of datos_bopp) {
        this.categoriaBOPP = 'BOPP';
        this.categoriMpService.srvObtenerListaPorId(item.catMP_Id).subscribe(datos_categoria => {
          this.tipoBodegaService.srvObtenerListaPorId(item.tpBod_Id).subscribe(datos_bodega => {
            this.materiaPrimaSeleccionada.push(item);
            this.materiasPrimas.push(item);
            this.categoriaMPBuscadaID = datos_categoria.catMP_Nombre;
            this.tipobodegaMPBuscadaId = datos_bodega.tpBod_Nombre;
            this.cargarFormMpEnTablas(this.ArrayMateriaPrima, item.bopP_Serial, item.bopP_Descripcion, item.bopP_Precio, item.bopP_CantidadInicialKg, sumaEntrada, sumaSalida, item.bopP_Stock, item.undMed_Kg, this.categoriaMPBuscadaID, item.bopP_Ancho);
          });
        });
      }
    });


  }


  /** Cargar combo materias primas al seleccionar cual categoria menos BOPP y tintas */
  cargarComboMatPrimaSegunCategorias(){
    let comboCategorias = this.FormMateriaPrima.get('MpCategoria')?.value;
    this.materiasPrimas = [];

    this.categoriMpService.srvObtenerListaPorId(comboCategorias).subscribe(registrosCategorias => {
      this.categoriaSeleccionadaCombo = registrosCategorias.catMP_Id;
      this.materiaPrimaService.srvObtenerLista().subscribe(registrosMatPrima => {
        for (let mp = 0; mp < registrosMatPrima.length; mp++) {
          if(this.categoriaSeleccionadaCombo == registrosMatPrima[mp].catMP_Id) {
            const matp : any = {
              Id : registrosMatPrima[mp].matPri_Id,
              Nombre : registrosMatPrima[mp].matPri_Nombre,
            }

            this.materiasPrimas.push(matp);

          } else if (comboCategorias == 6) {
            this.cargarComboBOPPSegunCategoria();
            break;
          }
        }
      });

      this.tintasService.srvObtenerLista().subscribe(datos_tintas => {
        for (let i = 0; i < datos_tintas.length; i++) {
          if (datos_tintas[i].catMP_Id == comboCategorias) {
            const mp : any = {
              Id : datos_tintas[i].tinta_Id,
              Nombre :datos_tintas[i].tinta_Nombre,
            }
            this.materiasPrimas.push(mp);
            this.materiasPrimas.sort((a,b) => a.Nombre.localeCompare(b.Nombre));
          }
        }
      });
    });
  }
  /** Nvo */

  /** Cargar combo materias primas al seleccionar categoria BOPP */
  cargarComboBOPPSegunCategoria() {
    let comboCategorias = this.FormMateriaPrima.get('MpCategoria')?.value;
    this.materiasPrimas = [];

    this.categoriMpService.srvObtenerListaPorId(comboCategorias).subscribe(registrosCategorias => {
      this.categoriaSeleccionadaCombo = registrosCategorias.catMP_Id;
      this.boppService.srvObtenerLista().subscribe(registrosBopp => {
        for (let b = 0; b < registrosBopp.length; b++) {
          if(this.categoriaSeleccionadaCombo == registrosBopp[b].catMP_Id) {
            const BOPPs : any = {
              Id : registrosBopp[b].bopP_Id,
              Nombre : registrosBopp[b].bopP_Nombre,
            }
            this.materiasPrimas.push(BOPPs);
          }
        }
      });
    });
  }

  //Funcion que consultara una materia prima con base a la que está seleccionada en la vista
  buscarMpSeleccionada(item){
    this.FormMateriaPrima.value.MpNombre = item.Id
    if (this.FormMateriaPrima.value.MpNombre != '') this.validarInput = false;
    else this.validarInput = true;
    this.ArrayMateriaPrima = [];
    this.valorTotal = 0;
    let nombreMateriaPrima : string = this.FormMateriaPrima.value.MpNombre;
    let idMateriaPrima : number; //En el HTML se pasará el nombre de la materia prima pero el input tendrá como valor el Id de la materia prima
    this.materiaPrimaSeleccionada = [];
    let sumaEntrada : number = 0;
    let sumaSalida : number = 0;
    this.categoriaBOPP = '';

    this.materiaPrimaService.srvObtenerListaPorId(nombreMateriaPrima).subscribe(datos_materiaPrima => {
      this.categoriMpService.srvObtenerListaPorId(datos_materiaPrima.catMP_Id).subscribe(datos_categoria => {
        this.tipoBodegaService.srvObtenerListaPorId(datos_materiaPrima.tpBod_Id).subscribe(datos_bodega => {
          this.materiaPrimaSeleccionada.push(datos_materiaPrima);
          this.materiasPrimas.push(datos_materiaPrima);
          this.categoriaMPBuscadaID = datos_categoria.catMP_Nombre;
          this.tipobodegaMPBuscadaId = datos_bodega.tpBod_Nombre;
          this.cargarFormMpEnTablas(this.ArrayMateriaPrima, datos_materiaPrima.matPri_Id, datos_materiaPrima.matPri_Nombre, datos_materiaPrima.matPri_Precio, this.inventInicial, sumaEntrada, sumaSalida, datos_materiaPrima.matPri_Stock, datos_materiaPrima.undMed_Id, this.categoriaMPBuscadaID);
        });
      });
    });

    this.boppService.srvObtenerListaPorId(nombreMateriaPrima).subscribe(datos_bopp => {
      let bopp : any = [];
      bopp.push(datos_bopp);
      for (const item of bopp) {
        this.categoriaBOPP = 'BOPP';
        this.categoriMpService.srvObtenerListaPorId(item.catMP_Id).subscribe(datos_categoria => {
          this.tipoBodegaService.srvObtenerListaPorId(item.tpBod_Id).subscribe(datos_bodega => {
            this.materiaPrimaSeleccionada.push(item);
            this.materiasPrimas.push(item);
            this.categoriaMPBuscadaID = datos_categoria.catMP_Nombre;
            this.tipobodegaMPBuscadaId = datos_bodega.tpBod_Nombre;
            this.cargarFormMpEnTablas(this.ArrayMateriaPrima, item.bopP_Serial, item.bopP_Descripcion, item.bopP_Precio, item.bopP_CantidadInicialKg, sumaEntrada, sumaSalida, item.bopP_Stock, 'Kg', this.categoriaMPBuscadaID, item.bopP_Ancho);
          });
        });
      }
    });

    this.tintasService.srvObtenerListaPorId(nombreMateriaPrima).subscribe(datos_tinta => {
      this.categoriMpService.srvObtenerListaPorId(datos_tinta.catMP_Id).subscribe(datos_categoria => {
        this.tipoBodegaService.srvObtenerListaPorId(datos_tinta.tpBod_Id).subscribe(datos_bodega => {
          this.materiaPrimaSeleccionada.push(datos_tinta);
          this.materiasPrimas.push(datos_tinta);
          this.categoriaMPBuscadaID = datos_categoria.catMP_Nombre;
          this.tipobodegaMPBuscadaId = datos_bodega.tpBod_Nombre;
          this.cargarFormMpEnTablas(this.ArrayMateriaPrima, datos_tinta.tinta_Id, datos_tinta.tinta_Nombre, datos_tinta.tinta_Precio, this.inventInicial, sumaEntrada, sumaSalida, datos_tinta.tinta_Stock, datos_tinta.undMed_Id, this.categoriaMPBuscadaID);
        });
      });
    });
  }

  // Funcion que buscará el BOPP
  buscarBOPPSegunFecha(){
    let fecha : any = this.FormMateriaPrima.value.fecha;
    let fechaFinal : any = this.FormMateriaPrima.value.fechaFinal;
    this.materiasPrimas = [];
    this.obtenerMateriasPrimasRetiradas();
    let IdBOPP : any = [];

    if (fecha != null && fechaFinal != null) {
      this.asignacionBOPPService.srvObtenerListaPorfechas(fecha, fechaFinal).subscribe(datos_asignaciones => {
        for (let i = 0; i < datos_asignaciones.length; i++) {
          this.detallesAsignacionBOPPService.srvObtenerListaPorAsignacion(datos_asignaciones[i].asigBOPP_Id).subscribe(datos_detallesBOPP => {
            for (let j = 0; j < datos_detallesBOPP.length; j++) {
              this.boppService.srvObtenerListaPorId(datos_detallesBOPP[j].bopP_Id).subscribe(datos_bopp => {
                let bopp : any = [];
                bopp.push(datos_bopp);
                for (const item of bopp) {
                  if (!IdBOPP.includes(item.bopP_Id)) {
                    IdBOPP.push(item.bopP_Id)
                    const BOPPs : any = {
                      Id : item.bopP_Id,
                      Nombre : item.bopP_Nombre,
                    }
                    this.materiasPrimas.push(BOPPs);
                    this.materiasPrimas.sort((a,b) => a.Nombre.localeCompare(b.Nombre));
                  } else continue;
                }
              });
            }
          });
        }
      });
    } else if (fecha != null){
      this.asignacionBOPPService.srvObtenerListaPorfecha(fecha).subscribe(datos_asignaciones => {
        for (let i = 0; i < datos_asignaciones.length; i++) {
          this.detallesAsignacionBOPPService.srvObtenerListaPorAsignacion(datos_asignaciones[i].asigBOPP_Id).subscribe(datos_detallesBOPP => {
            for (let j = 0; j < datos_detallesBOPP.length; j++) {
              this.boppService.srvObtenerListaPorId(datos_detallesBOPP[j].bopP_Id).subscribe(datos_bopp => {
                let bopp : any = [];
                bopp.push(datos_bopp);
                for (const item of bopp) {
                  if (!IdBOPP.includes(item.bopP_Id)) {
                    IdBOPP.push(item.bopP_Id)
                    const BOPPs : any = {
                      Id : item.bopP_Id,
                      Nombre : item.bopP_Nombre,
                    }
                    this.materiasPrimas.push(BOPPs);
                    this.materiasPrimas.sort((a,b) => a.Nombre.localeCompare(b.Nombre));
                  } else continue;
                }
              });
            }
          });
        }
      });
    }
  }

  //Funcion que colocará el nombre a las columnas de la tabla en la cual se muestran los productos pedidos por los clientes
  ColumnasTabla(){
    this.titulosTabla = [];
    this.titulosTabla = [{
      mpId : "Id",
      mpNombre : "Nombre",
      mpInicial : "Inventario Inicial",
      mpEntrada : "Entrada",
      mpSalida : "Salida",
      mpCantidad : "Cantidad Actual",
      mpDiferencia : "Diferencia",
      mpUndMedCant : "Und. Cant",
      mpPrecioU : "Precio U",
      mpSubTotal : "SubTotal",
      mpCategoria : 'Categoria',
    }]
  }

  // Funcion que cargará las informacion de las materias primas segun los filtros que se consulten
  cargarFormMpEnTablas(formulario : any, id: number, nombre : string, precio : number, inicial : number, entrada : number, salida : number, cantidad : number, undMEd : string, categoria : any, ancho? : number ){
    if (this.categoriaBOPP == 'BOPP') {
      this.valorTotal = this.valorTotal + precio * cantidad;
      let productoExt : any = {
        Id : id,
        Nombre : nombre,
        Ancho : ancho,
        Inicial : inicial,
        Entrada : entrada,
        Salida : salida,
        Cant : cantidad,
        Diferencia : cantidad - inicial,
        UndCant : undMEd,
        PrecioUnd : precio,
        SubTotal : precio * cantidad,
        Categoria : categoria,
      }

      this.ArrayMateriaPrima.push(productoExt);
      this.ArrayMateriaPrima.sort((a,b) => a.Nombre.localeCompare(b.Nombre));
      this.load = true;
    } else {
      let subtotalProd : number = precio * cantidad;
      this.valorTotal = this.valorTotal + subtotalProd;
      let productoExt : any = {
        Id : id,
        Nombre : nombre,
        Ancho : ancho,
        Inicial : inicial,
        Entrada : entrada,
        Salida : salida,
        Cant : cantidad,
        Diferencia : cantidad - inicial,
        UndCant : undMEd,
        PrecioUnd : precio,
        SubTotal : subtotalProd,
        Categoria : categoria,
      }

      this.ArrayMateriaPrima.push(productoExt);
      this.ArrayMateriaPrima.sort((a,b) => a.Nombre.localeCompare(b.Nombre));
      this.load = true;
    }
  }

  cargarTabla(id : number, nombre : string, ancho : number, inicial : number, entrada : number, salida : number, stock : number, diferencia : number, presentacion : string, precio : number, subtotal : number, categoria : string){
    if (!this.idMateriasPrimas.includes(id)){
      this.valorTotal = this.valorTotal + precio * stock;
      let productoExt : any = {
        Id : id,
        Nombre : nombre,
        Ancho : ancho,
        Inicial : inicial,
        Entrada : entrada,
        Salida : salida,
        Cant : stock,
        Diferencia : diferencia,
        UndCant : presentacion,
        PrecioUnd : precio,
        SubTotal : subtotal,
        Categoria : categoria,
      }
      this.idMateriasPrimas.push(id);
      this.ArrayMateriaPrima.push(productoExt);
      this.ArrayMateriaPrima.sort((a,b) => a.Nombre.localeCompare(b.Nombre));
    }
  }

  // Funcion que realizará la busqueda de materias primas segun los filtros que se consulten y le enviará la informacion a la funcion "cargarFormMpEnTablas"
  validarConsulta(){
    this.load = false;
    let materiaPrima : any = this.FormMateriaPrima.value.MpNombre.Id;
    if (materiaPrima == undefined) materiaPrima = null;
    let idMateriaPrima : number = this.FormMateriaPrima.value.MpId;
    let fecha : any = this.FormMateriaPrima.value.fecha;
    let fechaFinal : any = this.FormMateriaPrima.value.fechaFinal;
    let categoria : any = this.FormMateriaPrima.value.MpCategoria;
    let bodega : any = this.FormMateriaPrima.value.MpBodega;
    this.ArrayMateriaPrima = [];
    this.idMateriasPrimas = [];
    this.valorTotal = 0;
    this.sumaSalida = 0;
    this.sumaEntrada = 0;
    this.categoriaBOPP = '';

    if (fecha != null && fechaFinal != null && (materiaPrima != null || idMateriaPrima != null) && categoria != null) {
      if (materiaPrima != null) {
        this.materiaPrimaService.srvObtenerListaNumero1(fecha, fechaFinal, materiaPrima, categoria).subscribe(datos_materiaPrima => {
          for (let i = 0; i < datos_materiaPrima.length; i++) {
            this.cargarTabla(datos_materiaPrima[i].id,
              datos_materiaPrima[i].nombre,
              datos_materiaPrima[i].ancho,
              datos_materiaPrima[i].inicial,
              datos_materiaPrima[i].entrada,
              datos_materiaPrima[i].salida,
              datos_materiaPrima[i].stock,
              datos_materiaPrima[i].diferencia,
              datos_materiaPrima[i].presentacion,
              datos_materiaPrima[i].precio,
              datos_materiaPrima[i].subTotal,
              datos_materiaPrima[i].categoria);
          }
        });
      } else if (idMateriaPrima != null) {
        this.materiaPrimaService.srvObtenerListaNumero1(fecha, fechaFinal, idMateriaPrima, categoria).subscribe(datos_materiaPrima => {
          for (let i = 0; i < datos_materiaPrima.length; i++) {
            this.cargarTabla(datos_materiaPrima[i].id,
              datos_materiaPrima[i].nombre,
              datos_materiaPrima[i].ancho,
              datos_materiaPrima[i].inicial,
              datos_materiaPrima[i].entrada,
              datos_materiaPrima[i].salida,
              datos_materiaPrima[i].stock,
              datos_materiaPrima[i].diferencia,
              datos_materiaPrima[i].presentacion,
              datos_materiaPrima[i].precio,
              datos_materiaPrima[i].subTotal,
              datos_materiaPrima[i].categoria);
          }
        });
      }
    } else if (fecha != null && fechaFinal != null && (materiaPrima != null || idMateriaPrima != null)) {
      if (materiaPrima != null) {
        this.materiaPrimaService.GetConsultaMateriaPrimaF(fecha, fechaFinal, materiaPrima).subscribe(datos_consulta => {
          for (let j = 0; j < datos_consulta.length; j++) {
            this.cargarTabla(datos_consulta[j].id,
              datos_consulta[j].nombre,
              datos_consulta[j].ancho,
              datos_consulta[j].inicial,
              datos_consulta[j].entrada,
              datos_consulta[j].salida,
              datos_consulta[j].stock,
              datos_consulta[j].diferencia,
              datos_consulta[j].presentacion,
              datos_consulta[j].precio,
              datos_consulta[j].subTotal,
              datos_consulta[j].categoria);
          }
        });
      } else if (idMateriaPrima != null) {
        this.materiaPrimaService.GetConsultaMateriaPrimaF(fecha, fechaFinal, idMateriaPrima).subscribe(datos_consulta => {
          for (let j = 0; j < datos_consulta.length; j++) {
            this.cargarTabla(datos_consulta[j].id,
              datos_consulta[j].nombre,
              datos_consulta[j].ancho,
              datos_consulta[j].inicial,
              datos_consulta[j].entrada,
              datos_consulta[j].salida,
              datos_consulta[j].stock,
              datos_consulta[j].diferencia,
              datos_consulta[j].presentacion,
              datos_consulta[j].precio,
              datos_consulta[j].subTotal,
              datos_consulta[j].categoria);
          }
        });
      }
    } else if (fecha != null && (materiaPrima != null || idMateriaPrima != null) && categoria != null) {
      if (materiaPrima != null) {
        this.materiaPrimaService.srvObtenerListaNumero1(fecha, fecha, materiaPrima, categoria).subscribe(datos_materiaPrima => {
          for (let i = 0; i < datos_materiaPrima.length; i++) {
            this.cargarTabla(datos_materiaPrima[i].id,
              datos_materiaPrima[i].nombre,
              datos_materiaPrima[i].ancho,
              datos_materiaPrima[i].inicial,
              datos_materiaPrima[i].entrada,
              datos_materiaPrima[i].salida,
              datos_materiaPrima[i].stock,
              datos_materiaPrima[i].diferencia,
              datos_materiaPrima[i].presentacion,
              datos_materiaPrima[i].precio,
              datos_materiaPrima[i].subTotal,
              datos_materiaPrima[i].categoria);
          }
        });
      } else if (idMateriaPrima != null) {
        this.materiaPrimaService.srvObtenerListaNumero1(fecha, fecha, idMateriaPrima, categoria).subscribe(datos_materiaPrima => {
          for (let i = 0; i < datos_materiaPrima.length; i++) {
            this.cargarTabla(datos_materiaPrima[i].id,
              datos_materiaPrima[i].nombre,
              datos_materiaPrima[i].ancho,
              datos_materiaPrima[i].inicial,
              datos_materiaPrima[i].entrada,
              datos_materiaPrima[i].salida,
              datos_materiaPrima[i].stock,
              datos_materiaPrima[i].diferencia,
              datos_materiaPrima[i].presentacion,
              datos_materiaPrima[i].precio,
              datos_materiaPrima[i].subTotal,
              datos_materiaPrima[i].categoria);
          }
        });
      }
    } else if (fecha != null && (materiaPrima != null || idMateriaPrima != null)) {
      if (materiaPrima != null) {
        this.materiaPrimaService.GetConsultaMateriaPrimaF(fecha, fecha, materiaPrima).subscribe(datos_consulta => {
          for (let j = 0; j < datos_consulta.length; j++) {
            this.cargarTabla(datos_consulta[j].id,
              datos_consulta[j].nombre,
              datos_consulta[j].ancho,
              datos_consulta[j].inicial,
              datos_consulta[j].entrada,
              datos_consulta[j].salida,
              datos_consulta[j].stock,
              datos_consulta[j].diferencia,
              datos_consulta[j].presentacion,
              datos_consulta[j].precio,
              datos_consulta[j].subTotal,
              datos_consulta[j].categoria);
          }
        });
      } else if (idMateriaPrima != null) {
        this.materiaPrimaService.GetConsultaMateriaPrimaF(fecha, fecha, idMateriaPrima).subscribe(datos_consulta => {
          for (let j = 0; j < datos_consulta.length; j++) {
            this.cargarTabla(datos_consulta[j].id,
              datos_consulta[j].nombre,
              datos_consulta[j].ancho,
              datos_consulta[j].inicial,
              datos_consulta[j].entrada,
              datos_consulta[j].salida,
              datos_consulta[j].stock,
              datos_consulta[j].diferencia,
              datos_consulta[j].presentacion,
              datos_consulta[j].precio,
              datos_consulta[j].subTotal,
              datos_consulta[j].categoria);
          }
        });
      }
    } else if (fecha != null && fechaFinal != null && categoria != null) {
      this.materiaPrimaService.srvObtenerLista().subscribe(datos_materiaPrimas => {
        for (let i = 0; i < datos_materiaPrimas.length; i++) {
          if (datos_materiaPrimas[i].catMP_Id == categoria) {
            this.materiaPrimaService.srvObtenerListaNumero1(fecha, fechaFinal, datos_materiaPrimas[i].matPri_Id, categoria).subscribe(datos_consulta => {
              for (let j = 0; j < datos_consulta.length; j++) {
                this.cargarTabla(datos_consulta[j].id,
                  datos_consulta[j].nombre,
                  datos_consulta[j].ancho,
                  datos_consulta[j].inicial,
                  datos_consulta[j].entrada,
                  datos_consulta[j].salida,
                  datos_consulta[j].stock,
                  datos_consulta[j].diferencia,
                  datos_consulta[j].presentacion,
                  datos_consulta[j].precio,
                  datos_consulta[j].subTotal,
                  datos_consulta[j].categoria);
              }
            });
          }
        }
      });
      this.boppService.srvObtenerLista().subscribe(datos_bopp => {
        for (let i = 0; i < datos_bopp.length; i++) {
          if (datos_bopp[i].catMP_Id == categoria) {
            this.materiaPrimaService.srvObtenerListaNumero1(fecha, fechaFinal, datos_bopp[i].bopP_Serial, categoria).subscribe(datos_consulta => {
              for (let j = 0; j < datos_consulta.length; j++) {
                this.cargarTabla(datos_consulta[j].id,
                  datos_consulta[j].nombre,
                  datos_consulta[j].ancho,
                  datos_consulta[j].inicial,
                  datos_consulta[j].entrada,
                  datos_consulta[j].salida,
                  datos_consulta[j].stock,
                  datos_consulta[j].diferencia,
                  datos_consulta[j].presentacion,
                  datos_consulta[j].precio,
                  datos_consulta[j].subTotal,
                  datos_consulta[j].categoria);
              }
            });
          }
        }
      });
      this.tintasService.srvObtenerLista().subscribe(datos_tinta => {
        for (let i = 0; i < datos_tinta.length; i++) {
          if (datos_tinta[i].catMP_Id == categoria) {
            this.materiaPrimaService.srvObtenerListaNumero1(fecha, fechaFinal, datos_tinta[i].tinta_Id, categoria).subscribe(datos_consulta => {
              for (let j = 0; j < datos_consulta.length; j++) {
                this.cargarTabla(datos_consulta[j].id,
                  datos_consulta[j].nombre,
                  datos_consulta[j].ancho,
                  datos_consulta[j].inicial,
                  datos_consulta[j].entrada,
                  datos_consulta[j].salida,
                  datos_consulta[j].stock,
                  datos_consulta[j].diferencia,
                  datos_consulta[j].presentacion,
                  datos_consulta[j].precio,
                  datos_consulta[j].subTotal,
                  datos_consulta[j].categoria);
              }
            });
          }
        }
      });
    } else if ((materiaPrima != null || idMateriaPrima != null) && categoria != null) {
      if (materiaPrima != null) {
        this.materiaPrimaService.srvObtenerListaNumero1(this.today, this.today, materiaPrima, categoria).subscribe(datos_materiaPrima => {
          for (let i = 0; i < datos_materiaPrima.length; i++) {
            this.cargarTabla(datos_materiaPrima[i].id,
              datos_materiaPrima[i].nombre,
              datos_materiaPrima[i].ancho,
              datos_materiaPrima[i].inicial,
              datos_materiaPrima[i].entrada,
              datos_materiaPrima[i].salida,
              datos_materiaPrima[i].stock,
              datos_materiaPrima[i].diferencia,
              datos_materiaPrima[i].presentacion,
              datos_materiaPrima[i].precio,
              datos_materiaPrima[i].subTotal,
              datos_materiaPrima[i].categoria);
          }
        });
      } else if (idMateriaPrima != null) {
        this.materiaPrimaService.srvObtenerListaNumero1(this.today, this.today, idMateriaPrima, categoria).subscribe(datos_materiaPrima => {
          for (let i = 0; i < datos_materiaPrima.length; i++) {
            this.cargarTabla(datos_materiaPrima[i].id,
              datos_materiaPrima[i].nombre,
              datos_materiaPrima[i].ancho,
              datos_materiaPrima[i].inicial,
              datos_materiaPrima[i].entrada,
              datos_materiaPrima[i].salida,
              datos_materiaPrima[i].stock,
              datos_materiaPrima[i].diferencia,
              datos_materiaPrima[i].presentacion,
              datos_materiaPrima[i].precio,
              datos_materiaPrima[i].subTotal,
              datos_materiaPrima[i].categoria);
          }
        });
      }
    } else if (fecha != null && fechaFinal != null) {
      this.materiaPrimaService.srvObtenerLista().subscribe(datos_materiaPrima => {
        for (let i = 0; i < datos_materiaPrima.length; i++) {
          this.materiaPrimaService.GetConsultaMateriaPrimaF(fecha, fechaFinal, datos_materiaPrima[i].matPri_Id).subscribe(datos_consulta => {
            for (let j = 0; j < datos_consulta.length; j++) {
              this.cargarTabla(datos_consulta[j].id,
                datos_consulta[j].nombre,
                datos_consulta[j].ancho,
                datos_consulta[j].inicial,
                datos_consulta[j].entrada,
                datos_consulta[j].salida,
                datos_consulta[j].stock,
                datos_consulta[j].diferencia,
                datos_consulta[j].presentacion,
                datos_consulta[j].precio,
                datos_consulta[j].subTotal,
                datos_consulta[j].categoria);
            }
          });
        }
      });
      this.boppService.srvObtenerLista().subscribe(datos_bopp => {
        for (let i = 0; i < datos_bopp.length; i++) {
          this.materiaPrimaService.GetConsultaMateriaPrimaF(fecha, fechaFinal, datos_bopp[i].bopP_Serial).subscribe(datos_consulta => {
            for (let j = 0; j < datos_consulta.length; j++) {
              this.cargarTabla(datos_consulta[j].id,
                datos_consulta[j].nombre,
                datos_consulta[j].ancho,
                datos_consulta[j].inicial,
                datos_consulta[j].entrada,
                datos_consulta[j].salida,
                datos_consulta[j].stock,
                datos_consulta[j].diferencia,
                datos_consulta[j].presentacion,
                datos_consulta[j].precio,
                datos_consulta[j].subTotal,
                datos_consulta[j].categoria);
            }
          });
        }
      });
      this.tintasService.srvObtenerLista().subscribe(datos_tintas => {
        for (let i = 0; i < datos_tintas.length; i++) {
          this.materiaPrimaService.GetConsultaMateriaPrimaF(fecha, fechaFinal, datos_tintas[i].tinta_Id).subscribe(datos_consulta => {
            for (let j = 0; j < datos_consulta.length; j++) {
              this.cargarTabla(datos_consulta[j].id,
                datos_consulta[j].nombre,
                datos_consulta[j].ancho,
                datos_consulta[j].inicial,
                datos_consulta[j].entrada,
                datos_consulta[j].salida,
                datos_consulta[j].stock,
                datos_consulta[j].diferencia,
                datos_consulta[j].presentacion,
                datos_consulta[j].precio,
                datos_consulta[j].subTotal,
                datos_consulta[j].categoria);
            }
          });
        }
      });
    } else if (fecha != null && categoria != null) {
      this.materiaPrimaService.srvObtenerLista().subscribe(datos_materiaPrimas => {
        for (let i = 0; i < datos_materiaPrimas.length; i++) {
          if (datos_materiaPrimas[i].catMP_Id == categoria) {
            this.materiaPrimaService.srvObtenerListaNumero1(fecha, fecha, datos_materiaPrimas[i].matPri_Id, categoria).subscribe(datos_consulta => {
              for (let j = 0; j < datos_consulta.length; j++) {
                this.cargarTabla(datos_consulta[j].id,
                  datos_consulta[j].nombre,
                  datos_consulta[j].ancho,
                  datos_consulta[j].inicial,
                  datos_consulta[j].entrada,
                  datos_consulta[j].salida,
                  datos_consulta[j].stock,
                  datos_consulta[j].diferencia,
                  datos_consulta[j].presentacion,
                  datos_consulta[j].precio,
                  datos_consulta[j].subTotal,
                  datos_consulta[j].categoria);
              }
            });
          }
        }
      });
      this.boppService.srvObtenerLista().subscribe(datos_bopp => {
        for (let i = 0; i < datos_bopp.length; i++) {
          if (datos_bopp[i].catMP_Id == categoria) {
            this.materiaPrimaService.srvObtenerListaNumero1(fecha, fecha, datos_bopp[i].bopP_Serial, categoria).subscribe(datos_consulta => {
              for (let j = 0; j < datos_consulta.length; j++) {
                this.cargarTabla(datos_consulta[j].id,
                  datos_consulta[j].nombre,
                  datos_consulta[j].ancho,
                  datos_consulta[j].inicial,
                  datos_consulta[j].entrada,
                  datos_consulta[j].salida,
                  datos_consulta[j].stock,
                  datos_consulta[j].diferencia,
                  datos_consulta[j].presentacion,
                  datos_consulta[j].precio,
                  datos_consulta[j].subTotal,
                  datos_consulta[j].categoria);
              }
            });
          }
        }
      });
      this.tintasService.srvObtenerLista().subscribe(datos_tinta => {
        for (let i = 0; i < datos_tinta.length; i++) {
          if (datos_tinta[i].catMP_Id == categoria) {
            this.materiaPrimaService.srvObtenerListaNumero1(fecha, fecha, datos_tinta[i].tinta_Id, categoria).subscribe(datos_consulta => {
              for (let j = 0; j < datos_consulta.length; j++) {
                this.cargarTabla(datos_consulta[j].id,
                  datos_consulta[j].nombre,
                  datos_consulta[j].ancho,
                  datos_consulta[j].inicial,
                  datos_consulta[j].entrada,
                  datos_consulta[j].salida,
                  datos_consulta[j].stock,
                  datos_consulta[j].diferencia,
                  datos_consulta[j].presentacion,
                  datos_consulta[j].precio,
                  datos_consulta[j].subTotal,
                  datos_consulta[j].categoria);
              }
            });
          }
        }
      });
    } else if (fecha != null) {
      this.materiaPrimaService.srvObtenerLista().subscribe(datos_materiaPrimas => {
        for (let i = 0; i < datos_materiaPrimas.length; i++) {
          this.materiaPrimaService.srvObtenerListaNumero2(fecha, datos_materiaPrimas[i].matPri_Id).subscribe(datos_materiaPrima => {
            for (let j = 0; j < datos_materiaPrima.length; j++) {
              this.cargarTabla(datos_materiaPrima[j].id,
                datos_materiaPrima[j].nombre,
                datos_materiaPrima[j].ancho,
                datos_materiaPrima[j].inicial,
                datos_materiaPrima[j].entrada,
                datos_materiaPrima[j].salida,
                datos_materiaPrima[j].stock,
                datos_materiaPrima[j].diferencia,
                datos_materiaPrima[j].presentacion,
                datos_materiaPrima[j].precio,
                datos_materiaPrima[j].subTotal,
                datos_materiaPrima[j].categoria);
            }
          });
        }
      });
      this.boppService.srvObtenerLista().subscribe(datos_bopp => {
        for (let i = 0; i < datos_bopp.length; i++) {
          this.materiaPrimaService.srvObtenerListaNumero2(fecha, datos_bopp[i].bopP_Serial).subscribe(datos_materiaPrima => {
            for (let j = 0; j < datos_materiaPrima.length; j++) {
              this.cargarTabla(datos_materiaPrima[j].id,
                datos_materiaPrima[j].nombre,
                datos_materiaPrima[j].ancho,
                datos_materiaPrima[j].inicial,
                datos_materiaPrima[j].entrada,
                datos_materiaPrima[j].salida,
                datos_materiaPrima[j].stock,
                datos_materiaPrima[j].diferencia,
                datos_materiaPrima[j].presentacion,
                datos_materiaPrima[j].precio,
                datos_materiaPrima[j].subTotal,
                datos_materiaPrima[j].categoria);
            }
          });
        }
      });
      this.tintasService.srvObtenerLista().subscribe(datos_tinta => {
        for (let i = 0; i < datos_tinta.length; i++) {
          this.materiaPrimaService.srvObtenerListaNumero2(fecha, datos_tinta[i].tinta_Id).subscribe(datos_materiaPrima => {
            for (let j = 0; j < datos_materiaPrima.length; j++) {
              this.cargarTabla(datos_materiaPrima[j].id,
                datos_materiaPrima[j].nombre,
                datos_materiaPrima[j].ancho,
                datos_materiaPrima[j].inicial,
                datos_materiaPrima[j].entrada,
                datos_materiaPrima[j].salida,
                datos_materiaPrima[j].stock,
                datos_materiaPrima[j].diferencia,
                datos_materiaPrima[j].presentacion,
                datos_materiaPrima[j].precio,
                datos_materiaPrima[j].subTotal,
                datos_materiaPrima[j].categoria);
            }
          });
        }
      });
    } else if (categoria != null)  {
      this.materiaPrimaService.srvObtenerLista().subscribe(datos_materiaPrimas => {
        for (let i = 0; i < datos_materiaPrimas.length; i++) {
          if (datos_materiaPrimas[i].catMP_Id == categoria) {
            this.materiaPrimaService.srvObtenerListaNumero1(this.today, this.today, datos_materiaPrimas[i].matPri_Id, categoria).subscribe(datos_consulta => {
              for (let j = 0; j < datos_consulta.length; j++) {
                this.cargarTabla(datos_consulta[j].id,
                  datos_consulta[j].nombre,
                  datos_consulta[j].ancho,
                  datos_consulta[j].inicial,
                  datos_consulta[j].entrada,
                  datos_consulta[j].salida,
                  datos_consulta[j].stock,
                  datos_consulta[j].diferencia,
                  datos_consulta[j].presentacion,
                  datos_consulta[j].precio,
                  datos_consulta[j].subTotal,
                  datos_consulta[j].categoria);
              }
            });
          }
        }
      });
      this.boppService.srvObtenerLista().subscribe(datos_bopp => {
        for (let i = 0; i < datos_bopp.length; i++) {
          if (datos_bopp[i].catMP_Id == categoria) {
            this.materiaPrimaService.srvObtenerListaNumero1(this.today, this.today, datos_bopp[i].bopP_Serial, categoria).subscribe(datos_consulta => {
              for (let j = 0; j < datos_consulta.length; j++) {
                this.cargarTabla(datos_consulta[j].id,
                  datos_consulta[j].nombre,
                  datos_consulta[j].ancho,
                  datos_consulta[j].inicial,
                  datos_consulta[j].entrada,
                  datos_consulta[j].salida,
                  datos_consulta[j].stock,
                  datos_consulta[j].diferencia,
                  datos_consulta[j].presentacion,
                  datos_consulta[j].precio,
                  datos_consulta[j].subTotal,
                  datos_consulta[j].categoria);
              }
            });
          }
        }
      });
      this.tintasService.srvObtenerLista().subscribe(datos_tinta => {
        for (let i = 0; i < datos_tinta.length; i++) {
          if (datos_tinta[i].catMP_Id == categoria) {
            this.materiaPrimaService.srvObtenerListaNumero1(this.today, this.today, datos_tinta[i].tinta_Id, categoria).subscribe(datos_consulta => {
              for (let j = 0; j < datos_consulta.length; j++) {
                this.cargarTabla(datos_consulta[j].id,
                  datos_consulta[j].nombre,
                  datos_consulta[j].ancho,
                  datos_consulta[j].inicial,
                  datos_consulta[j].entrada,
                  datos_consulta[j].salida,
                  datos_consulta[j].stock,
                  datos_consulta[j].diferencia,
                  datos_consulta[j].presentacion,
                  datos_consulta[j].precio,
                  datos_consulta[j].subTotal,
                  datos_consulta[j].categoria);
              }
            });
          }
        }
      });
    } else if (bodega != null) {
      this.load = false;
      if (bodega == 10) {
        this.materiaPrimaService.srvObtenerLista().subscribe(datos_materiaPrimas => {
          for (let i = 0; i < datos_materiaPrimas.length; i++) {
            if (datos_materiaPrimas[i].catMP_Id != 8 && datos_materiaPrimas[i].catMP_Id != 7 && datos_materiaPrimas[i].catMP_Id != 6 && datos_materiaPrimas[i].catMP_Id != 5)
            this.materiaPrimaService.srvObtenerListaNumero2(this.today, datos_materiaPrimas[i].matPri_Id).subscribe(datos_materiaPrima => {
              for (let j = 0; j < datos_materiaPrima.length; j++) {
                this.cargarTabla(datos_materiaPrima[j].id,
                  datos_materiaPrima[j].nombre,
                  datos_materiaPrima[j].ancho,
                  datos_materiaPrima[j].inicial,
                  datos_materiaPrima[j].entrada,
                  datos_materiaPrima[j].salida,
                  datos_materiaPrima[j].stock,
                  datos_materiaPrima[j].diferencia,
                  datos_materiaPrima[j].presentacion,
                  datos_materiaPrima[j].precio,
                  datos_materiaPrima[j].subTotal,
                  datos_materiaPrima[j].categoria);
              }
            });
          }
        });
      } else if (bodega == 5) {
        // Mostrará Tintas, Aditivos y Solventes.
        this.materiaPrimaService.srvObtenerLista().subscribe(datos_materiaPrimas => {
          for (let i = 0; i < datos_materiaPrimas.length; i++) {
            if (datos_materiaPrimas[i].catMP_Id == 5)
            this.materiaPrimaService.srvObtenerListaNumero2(this.today, datos_materiaPrimas[i].matPri_Id).subscribe(datos_materiaPrima => {
              for (let j = 0; j < datos_materiaPrima.length; j++) {
                this.cargarTabla(datos_materiaPrima[j].id,
                  datos_materiaPrima[j].nombre,
                  datos_materiaPrima[j].ancho,
                  datos_materiaPrima[j].inicial,
                  datos_materiaPrima[j].entrada,
                  datos_materiaPrima[j].salida,
                  datos_materiaPrima[j].stock,
                  datos_materiaPrima[j].diferencia,
                  datos_materiaPrima[j].presentacion,
                  datos_materiaPrima[j].precio,
                  datos_materiaPrima[j].subTotal,
                  datos_materiaPrima[j].categoria);
              }
            });
          }
        });
        this.tintasService.srvObtenerLista().subscribe(datos_tinta => {
          for (let i = 0; i < datos_tinta.length; i++) {
            this.materiaPrimaService.srvObtenerListaNumero2(this.today, datos_tinta[i].tinta_Id).subscribe(datos_materiaPrima => {
              for (let j = 0; j < datos_materiaPrima.length; j++) {
                this.cargarTabla(datos_materiaPrima[j].id,
                  datos_materiaPrima[j].nombre,
                  datos_materiaPrima[j].ancho,
                  datos_materiaPrima[j].inicial,
                  datos_materiaPrima[j].entrada,
                  datos_materiaPrima[j].salida,
                  datos_materiaPrima[j].stock,
                  datos_materiaPrima[j].diferencia,
                  datos_materiaPrima[j].presentacion,
                  datos_materiaPrima[j].precio,
                  datos_materiaPrima[j].subTotal,
                  datos_materiaPrima[j].categoria);
              }
            });
          }
        });
      } else if (bodega == 8) {
        // Solo mostrará BOPP
        this.boppService.srvObtenerLista().subscribe(datos_bopp => {
          for (let i = 0; i < datos_bopp.length; i++) {
            if (datos_bopp[i].bopP_Stock != 0) {
              this.materiaPrimaService.srvObtenerListaNumero2(this.today, datos_bopp[i].bopP_Serial).subscribe(datos_materiaPrima => {
                for (let j = 0; j < datos_materiaPrima.length; j++) {
                  this.cargarTabla(datos_materiaPrima[j].id,
                    datos_materiaPrima[j].nombre,
                    datos_materiaPrima[j].ancho,
                    datos_materiaPrima[j].inicial,
                    datos_materiaPrima[j].entrada,
                    datos_materiaPrima[j].salida,
                    datos_materiaPrima[j].stock,
                    datos_materiaPrima[j].diferencia,
                    datos_materiaPrima[j].presentacion,
                    datos_materiaPrima[j].precio,
                    datos_materiaPrima[j].subTotal,
                    datos_materiaPrima[j].categoria);
                }
              });
            }
          }
        });
      } else if (bodega == 9){
        // Mostrará Tintas, Aditivos y Solventes.
        this.materiaPrimaService.srvObtenerLista().subscribe(datos_materiaPrimas => {
          for (let i = 0; i < datos_materiaPrimas.length; i++) {
            if (datos_materiaPrimas[i].catMP_Id == 8)
            this.materiaPrimaService.srvObtenerListaNumero2(this.today, datos_materiaPrimas[i].matPri_Id).subscribe(datos_materiaPrima => {
              for (let j = 0; j < datos_materiaPrima.length; j++) {
                this.cargarTabla(datos_materiaPrima[j].id,
                  datos_materiaPrima[j].nombre,
                  datos_materiaPrima[j].ancho,
                  datos_materiaPrima[j].inicial,
                  datos_materiaPrima[j].entrada,
                  datos_materiaPrima[j].salida,
                  datos_materiaPrima[j].stock,
                  datos_materiaPrima[j].diferencia,
                  datos_materiaPrima[j].presentacion,
                  datos_materiaPrima[j].precio,
                  datos_materiaPrima[j].subTotal,
                  datos_materiaPrima[j].categoria);
              }
            });
          }
        });
      }
    } else {
      this.materiaPrimaService.srvObtenerLista().subscribe(datos_materiaPrima => {
        for (let i = 0; i < datos_materiaPrima.length; i++) {
          this.materiaPrimaService.GetConsultaMateriaPrimaF(this.today, this.today, datos_materiaPrima[i].matPri_Id).subscribe(datos_consulta => {
            for (let j = 0; j < datos_consulta.length; j++) {
              this.cargarTabla(datos_consulta[j].id,
                datos_consulta[j].nombre,
                datos_consulta[j].ancho,
                datos_consulta[j].inicial,
                datos_consulta[j].entrada,
                datos_consulta[j].salida,
                datos_consulta[j].stock,
                datos_consulta[j].diferencia,
                datos_consulta[j].presentacion,
                datos_consulta[j].precio,
                datos_consulta[j].subTotal,
                datos_consulta[j].categoria);
            }
          });
        }
      });
      this.boppService.srvObtenerLista().subscribe(datos_bopp => {
        for (let i = 0; i < datos_bopp.length; i++) {
          this.materiaPrimaService.GetConsultaMateriaPrimaF(this.today, this.today, datos_bopp[i].bopP_Serial).subscribe(datos_consulta => {
            for (let j = 0; j < datos_consulta.length; j++) {
              this.cargarTabla(datos_consulta[j].id,
                datos_consulta[j].nombre,
                datos_consulta[j].ancho,
                datos_consulta[j].inicial,
                datos_consulta[j].entrada,
                datos_consulta[j].salida,
                datos_consulta[j].stock,
                datos_consulta[j].diferencia,
                datos_consulta[j].presentacion,
                datos_consulta[j].precio,
                datos_consulta[j].subTotal,
                datos_consulta[j].categoria);
            }
          });
        }
      });
      this.tintasService.srvObtenerLista().subscribe(datos_tintas => {
        for (let i = 0; i < datos_tintas.length; i++) {
          this.materiaPrimaService.GetConsultaMateriaPrimaF(this.today, this.today, datos_tintas[i].tinta_Id).subscribe(datos_consulta => {
            for (let j = 0; j < datos_consulta.length; j++) {
              this.cargarTabla(datos_consulta[j].id,
                datos_consulta[j].nombre,
                datos_consulta[j].ancho,
                datos_consulta[j].inicial,
                datos_consulta[j].entrada,
                datos_consulta[j].salida,
                datos_consulta[j].stock,
                datos_consulta[j].diferencia,
                datos_consulta[j].presentacion,
                datos_consulta[j].precio,
                datos_consulta[j].subTotal,
                datos_consulta[j].categoria);
            }
          });
        }
      });
    }

    setTimeout(() => { this.load = true; }, 3200);
  }

  // Funcion que organiza los campos de la tabla segun su precio de mayor a menor
  organizacionPrecioDblClick(){
    this.ArrayMateriaPrima.sort((a,b)=> Number(b.SubTotal) - Number(a.SubTotal));
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    });
    Toast.fire({
      icon: 'warning',
      title: 'Ordenado por "Precio Total" de mayor a menor'
    });
  }

  //Funcion que organiza los campos de la tabla de pedidos de menor a mayor
  organizacionPrecio(){
    this.ArrayMateriaPrima.sort((a,b)=> Number(a.SubTotal) - Number(b.SubTotal));
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    });
    Toast.fire({
      icon: 'warning',
      title: 'Ordenado por "Precio Total" de menor a mayor'
    });
  }

}
