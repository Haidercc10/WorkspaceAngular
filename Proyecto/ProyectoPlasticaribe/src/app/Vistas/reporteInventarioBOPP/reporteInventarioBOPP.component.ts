import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { Table } from 'primeng/table';
import { AsignacionBOPPService } from 'src/app/Servicios/Asignacion_Bopp/asignacionBOPP.service';
import { EntradaBOPPService } from 'src/app/Servicios/BOPP/entrada-BOPP.service';
import { CategoriaMateriaPrimaService } from 'src/app/Servicios/CategoriasMateriaPrima/categoriaMateriaPrima.service';
import { DetalleAsignacion_BOPPService } from 'src/app/Servicios/DetallesAsgBopp/detallesAsignacionBOPP.service';
import { MateriaPrimaService } from 'src/app/Servicios/MateriaPrima/materiaPrima.service';
import { RolesService } from 'src/app/Servicios/Roles/roles.service';
import { TintasService } from 'src/app/Servicios/Tintas/tintas.service';
import { TipoBodegaService } from 'src/app/Servicios/TipoBodega/tipoBodega.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reporteInventarioBOPP',
  templateUrl: './reporteInventarioBOPP.component.html',
  styleUrls: ['./reporteInventarioBOPP.component.css']
})
export class ReporteInventarioBOPPComponent implements OnInit {

  public FormMateriaPrimaFactura !: FormGroup;
  public FormMateriaPrima !: FormGroup;
  public FormMateriaPrimaRetiro !: FormGroup;
  public FormMateriaPrimaRetirada !: FormGroup;

  /* Vaiables*/
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  materiasPrimas = []; //Variable que va almacenar el nombre de todas las materias primas existentes en la empresa
  categoriaMPBuscadaID : string; //Variable que almacenará el nombre de la categoria de la materia prima buscada por Id
  tipobodegaMPBuscadaId : string; //Variable que almacenará el nombrede la bodega en la que se encuentra la materia prima buscada
  materiaPrimaSeleccionada = []; //Variable que almacenará la informacion de la materia prima seleccionada
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  ArrayMateriaPrima : any [] = []; //Variable que tendrá la informacion de los productos que se piden en el nuevo pedido
  valorTotal : number = 0; //Variable que guardará el valor total de la factura de entrada de materia prima
  categorias : any = []; //variable que almacenará las categorias existentes
  bodegas : any = []; //variable que almacenará las bodegas
  load: boolean = true;
  idMateriasPrimas = [];

  constructor(private materiaPrimaService : MateriaPrimaService,
                  private categoriMpService : CategoriaMateriaPrimaService,
                    private tipoBodegaService : TipoBodegaService,
                      private rolService : RolesService,
                        private frmBuilderMateriaPrima : FormBuilder,
                          @Inject(SESSION_STORAGE) private storage: WebStorageService,
                            private boppService : EntradaBOPPService,
                              private asignacionBOPPService : AsignacionBOPPService,
                                private detallesAsignacionBOPPService : DetalleAsignacion_BOPPService,) {

    this.FormMateriaPrima = this.frmBuilderMateriaPrima.group({
      MpId : ['', Validators.required],
      MpNombre: ['', Validators.required],
      MpCantidad : ['', Validators.required],
      MpPrecio: ['', Validators.required],
      MpUnidadMedida: ['', Validators.required],
      fecha: [this.today, Validators.required],
      fechaFinal: ['', Validators.required],
      MpCategoria : ['', Validators.required],
      MpBodega : ['', Validators.required],
    });
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
    this.validarConsulta();
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

  //  Funcion que tomará y almacenará las bdoegas
  obtenerBodegas(){
    this.bodegas = [];
    this.tipoBodegaService.srvObtenerLista().subscribe(datos_bodegas => {
      for (let i = 0; i < datos_bodegas.length; i++) {
        if (datos_bodegas[i].tpBod_Id == 8){
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

  // Funcion para obtener las materias primas registradas
  obtenerMateriasPrimas(){
    this.materiasPrimas = [];
    let nombre : string = this.FormMateriaPrima.value.MpNombre;
    this.materiaPrimaService.GetMateriaPrima_LikeNombre(nombre).subscribe(datos_materiaPrima => {
      for (let i = 0; i < datos_materiaPrima.length; i++) {
        this.materiasPrimas.push(datos_materiaPrima[i]);
      }
    });
  }

  //Funcion que va a mostrar el nombre de la materia prima
  cambiarNombreMateriaPrima(){
    let id : number = this.FormMateriaPrima.value.MpNombre;
    this.materiaPrimaService.getInfoMpTintaBopp(id).subscribe(datos_materiaPrima => {
      for (let i = 0; i < datos_materiaPrima.length; i++) {
        this.FormMateriaPrima = this.frmBuilderMateriaPrima.group({
          MpId : datos_materiaPrima[i].id,
          MpNombre: datos_materiaPrima[i].nombre,
          MpCantidad : this.FormMateriaPrima.value.MpCantidad,
          MpPrecio: this.FormMateriaPrima.value.MpPrecio,
          MpUnidadMedida: this.FormMateriaPrima.value.MpUnidadMedida,
          fecha: this.FormMateriaPrima.value.fecha,
          fechaFinal: this.FormMateriaPrima.value.fechaFinal,
          MpCategoria : this.FormMateriaPrima.value.MpCategoria,
          MpBodega : this.FormMateriaPrima.value.MpBodega,
        });
      }
    });
  }

  // Funcion que cargará las informacion de las materias primas segun los filtros que se consulten
  cargarTabla(data : any){
    if (!this.idMateriasPrimas.includes(data.id) && data.id != 84 && data.id != 2001 && data.id != 88 && data.id != 89 && data.id != 2072){
      this.valorTotal = this.valorTotal + data.precio * data.stock;
      let productoExt : any = {
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
      this.idMateriasPrimas.push(data.id);
      this.ArrayMateriaPrima.push(productoExt);
      this.ArrayMateriaPrima.sort((a,b) => a.Nombre.localeCompare(b.Nombre));
    }
  }

  // Funcion que realizará la busqueda de materias primas segun los filtros que se consulten y le enviará la informacion a la funcion "cargarFormMpEnTablas"
  validarConsulta(){
    this.load = false;
    let idMateriaPrima : number = this.FormMateriaPrima.value.MpId;
    let fecha : any = this.FormMateriaPrima.value.fecha;
    let fechaFinal : any = this.FormMateriaPrima.value.fechaFinal;
    let categoria : any = this.FormMateriaPrima.value.MpCategoria;
    let bodega : any = this.FormMateriaPrima.value.MpBodega;
    this.ArrayMateriaPrima = [];
    this.idMateriasPrimas = [];
    this.valorTotal = 0;

    if (fecha != null && fechaFinal != null && idMateriaPrima != null && categoria != null) {
      if (categoria != 0) {
        this.materiaPrimaService.srvObtenerListaNumero1(fecha, fechaFinal, idMateriaPrima, categoria).subscribe(datos_materiaPrima => {
          for (let i = 0; i < datos_materiaPrima.length; i++) {
            this.cargarTabla(datos_materiaPrima[i]);
          }
        });
      } else if (categoria == 0) {
      this.materiaPrimaService.GetConsultaMateriaPrimaF(fecha, fecha, idMateriaPrima).subscribe(datos_consulta => {
          for (let j = 0; j < datos_consulta.length; j++) {
            if (datos_consulta[j].stock > 0) this.cargarTabla(datos_consulta[j]);
          }
        });
      }
    } else if (fecha != null && fechaFinal != null && idMateriaPrima != null) {
      this.materiaPrimaService.GetConsultaMateriaPrimaF(fecha, fechaFinal, idMateriaPrima).subscribe(datos_consulta => {
        for (let j = 0; j < datos_consulta.length; j++) {
          this.cargarTabla(datos_consulta[j]);
        }
      });
    } else if (fecha != null && idMateriaPrima != null && categoria != null) {
      if (categoria != 0) {
        this.materiaPrimaService.srvObtenerListaNumero1(fecha, fecha, idMateriaPrima, categoria).subscribe(datos_materiaPrima => {
          for (let i = 0; i < datos_materiaPrima.length; i++) {
            this.cargarTabla(datos_materiaPrima[i]);
          }
        });
      } else if (categoria == 0) {
        this.materiaPrimaService.GetConsultaMateriaPrimaF(fecha, fecha, idMateriaPrima).subscribe(datos_consulta => {
          for (let j = 0; j < datos_consulta.length; j++) {
            if (datos_consulta[j].stock > 0) this.cargarTabla(datos_consulta[j]);
          }
        });
      }
    } else if (fecha != null && idMateriaPrima != null) {
      this.materiaPrimaService.GetConsultaMateriaPrimaF(fecha, fecha, idMateriaPrima).subscribe(datos_consulta => {
        for (let j = 0; j < datos_consulta.length; j++) {
          this.cargarTabla(datos_consulta[j]);
        }
      });
    } else if (fecha != null && fechaFinal != null && categoria != null) {
      if (categoria != 0) {
        this.boppService.srvObtenerLista().subscribe(datos_bopp => {
          for (let i = 0; i < datos_bopp.length; i++) {
            if (datos_bopp[i].catMP_Id == categoria) {
              this.materiaPrimaService.srvObtenerListaNumero1(fecha, fechaFinal, datos_bopp[i].bopP_Serial, categoria).subscribe(datos_consulta => {
                for (let j = 0; j < datos_consulta.length; j++) {
                  this.cargarTabla(datos_consulta[j]);
                }
              });
            }
          }
        });
      } else if (categoria == 0){
        this.boppService.srvObtenerLista().subscribe(datos_bopp => {
          for (let i = 0; i < datos_bopp.length; i++) {
            this.materiaPrimaService.GetConsultaMateriaPrimaF(fecha, fechaFinal, datos_bopp[i].bopP_Serial).subscribe(datos_consulta => {
              for (let j = 0; j < datos_consulta.length; j++) {
                if (datos_consulta[j].stock > 0) this.cargarTabla(datos_consulta[j]);
              }
            });
          }
        });
      }
    } else if (idMateriaPrima != null && categoria != null) {
      if (categoria != 0) {
        this.materiaPrimaService.srvObtenerListaNumero1(this.today, this.today, idMateriaPrima, categoria).subscribe(datos_materiaPrima => {
          for (let i = 0; i < datos_materiaPrima.length; i++) {
            this.cargarTabla(datos_materiaPrima[i]);
          }
        });
      } else if (categoria == 0) {
        this.materiaPrimaService.GetConsultaMateriaPrimaF(fecha, fecha, idMateriaPrima).subscribe(datos_consulta => {
          for (let j = 0; j < datos_consulta.length; j++) {
            if (datos_consulta[j].stock > 0) this.cargarTabla(datos_consulta[j]);
          }
        });
      }
    } else if (fecha != null && fechaFinal != null) {
      this.boppService.srvObtenerLista().subscribe(datos_bopp => {
        for (let i = 0; i < datos_bopp.length; i++) {
          this.materiaPrimaService.GetConsultaMateriaPrimaF(fecha, fechaFinal, datos_bopp[i].bopP_Serial).subscribe(datos_consulta => {
            for (let j = 0; j < datos_consulta.length; j++) {
              this.cargarTabla(datos_consulta[j]);
            }
          });
        }
      });
    } else if (fecha != null && categoria != null) {
      if (categoria != 0) {
        this.boppService.srvObtenerLista().subscribe(datos_bopp => {
          for (let i = 0; i < datos_bopp.length; i++) {
            if (datos_bopp[i].catMP_Id == categoria) {
              this.materiaPrimaService.srvObtenerListaNumero1(fecha, fecha, datos_bopp[i].bopP_Serial, categoria).subscribe(datos_consulta => {
                for (let j = 0; j < datos_consulta.length; j++) {
                  this.cargarTabla(datos_consulta[j]);
                }
              });
            }
          }
        });
      } else if (categoria == 0){
        this.boppService.srvObtenerLista().subscribe(datos_bopp => {
          for (let i = 0; i < datos_bopp.length; i++) {
            this.materiaPrimaService.GetConsultaMateriaPrimaF(this.today, this.today, datos_bopp[i].bopP_Serial).subscribe(datos_consulta => {
              for (let j = 0; j < datos_consulta.length; j++) {
                if (datos_consulta[j].stock > 0) this.cargarTabla(datos_consulta[j]);
              }
            });
          }
        });
      }
    } else if (fecha != null) {
      this.boppService.srvObtenerLista().subscribe(datos_bopp => {
        for (let i = 0; i < datos_bopp.length; i++) {
          this.materiaPrimaService.srvObtenerListaNumero2(fecha, datos_bopp[i].bopP_Serial).subscribe(datos_materiaPrima => {
            for (let j = 0; j < datos_materiaPrima.length; j++) {
              this.cargarTabla(datos_materiaPrima[j]);
            }
          });
        }
      });
    } else if (categoria != null)  {
      if (categoria != 0) {
        this.boppService.srvObtenerLista().subscribe(datos_bopp => {
          for (let i = 0; i < datos_bopp.length; i++) {
            if (datos_bopp[i].catMP_Id == categoria) {
              this.materiaPrimaService.srvObtenerListaNumero1(this.today, this.today, datos_bopp[i].bopP_Serial, categoria).subscribe(datos_consulta => {
                for (let j = 0; j < datos_consulta.length; j++) {
                  this.cargarTabla(datos_consulta[j]);
                }
              });
            }
          }
        });
      } else if (categoria == 0){
        this.boppService.srvObtenerLista().subscribe(datos_bopp => {
          for (let i = 0; i < datos_bopp.length; i++) {
            this.materiaPrimaService.GetConsultaMateriaPrimaF(this.today, this.today, datos_bopp[i].bopP_Serial).subscribe(datos_consulta => {
              for (let j = 0; j < datos_consulta.length; j++) {
                if (datos_consulta[j].stock > 0) this.cargarTabla(datos_consulta[j]);
              }
            });
          }
        });
      }
    } else if (idMateriaPrima != null) {
      this.materiaPrimaService.GetConsultaMateriaPrimaF(this.today, this.today, idMateriaPrima).subscribe(datos_consulta => {
        for (let j = 0; j < datos_consulta.length; j++) {
          this.cargarTabla(datos_consulta[j]);
        }
      });
    } else if (bodega != null) {
      this.load = false;
      if (bodega == 8) {
        // Solo mostrará BOPP
        this.boppService.srvObtenerLista().subscribe(datos_bopp => {
          for (let i = 0; i < datos_bopp.length; i++) {
            if (datos_bopp[i].bopP_Stock != 0) {
              this.materiaPrimaService.srvObtenerListaNumero2(this.today, datos_bopp[i].bopP_Serial).subscribe(datos_materiaPrima => {
                for (let j = 0; j < datos_materiaPrima.length; j++) {
                  this.cargarTabla(datos_materiaPrima[j]);
                }
              });
            }
          }
        });
      }
    } else {
      this.boppService.srvObtenerLista().subscribe(datos_bopp => {
        for (let i = 0; i < datos_bopp.length; i++) {
          this.materiaPrimaService.GetConsultaMateriaPrimaF(this.today, this.today, datos_bopp[i].bopP_Serial).subscribe(datos_consulta => {
            for (let j = 0; j < datos_consulta.length; j++) {
              this.cargarTabla(datos_consulta[j]);
            }
          });
        }
      });
    }

    setTimeout(() => { this.load = true; }, 2500);
  }

  // Funcion que limpiará los filtros utilizados en la tabla
  clear(table: Table) {
    table.clear();
  }
}
