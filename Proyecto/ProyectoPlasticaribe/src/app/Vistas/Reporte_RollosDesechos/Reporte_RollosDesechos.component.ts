import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShepherdService } from 'angular-shepherd';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import moment from 'moment';
import pdfMake from 'pdfmake/build/pdfmake';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { MaterialProductoService } from 'src/app/Servicios/MaterialProducto/materialProducto.service';
import { ProcesosService } from 'src/app/Servicios/Procesos/procesos.service';
import { ProductoService } from 'src/app/Servicios/Productos/producto.service';
import { SrvRollosEliminadosService } from 'src/app/Servicios/RollosDesechos/srvRollosEliminados.service';
import { TurnosService } from 'src/app/Servicios/Turnos/Turnos.service';
import { AppComponent } from 'src/app/app.component';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';
import Swal from 'sweetalert2';
import { defaultStepOptions, stepsReporteRollosEliminados as defaultSteps } from 'src/app/data';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';

@Component({
  selector: 'app-Reporte_RollosDesechos',
  templateUrl: './Reporte_RollosDesechos.component.html',
  styleUrls: ['./Reporte_RollosDesechos.component.css']
})
export class Reporte_RollosDesechosComponent implements OnInit {

  public formConsultaRollos !: FormGroup; /** Formulario de rollos con filtros de busqueda */
  public today : any = moment().format('YYYY-MM-DD'); /** Obtener fecha de hoy */
  public fechaAnterior : any = '2020-11-03'; /** Fecha de hoy */
  public idCliente : string;
  public validarInputClientes : any = true;
  public arrayClientes = []; /** Array que contendrá la info del cliente */
  public arrayTurnos = []; /** Array que contendrá la info de los turnos */
  public arrayMaterial = []; /** Array que contendrá la info de los materiales mat. prima */
  public arrayProductos = []; /** Array que contendrá la info de los productos */
  public validarInputNombresProductos : any = true;
  idProducto : any = 0;
  public ArrayDocumento : any [] = []; /** Array que contendrá la info cargada en la tabla de consultar un filtro */
  public arrayOperarios = []; /** Array que contendrá la info cargada en la tabla de operarios */
  public load : boolean = true; /** Carga la imagen de carga al momento de realizar una busqueda */
  _columnasSeleccionada : any [] = []; /**  */
  first = 0; /** Cantidad de Items mostrados en la tabla. */
  rows = 10;
  columnas : any[] = [];
  columnas2 : any[] = [];
  public storage_Id : number; /** Guarda el ID de la persona logueada */
  public storage_Nombre: any; /** Guarda el nombre de la persona logueada */
  public ValidarRol: number; /** valida el tipo de rol de la persona logueada */
  public storage_Rol: any; /** Guarda el rol de la persona logueada */
  public cantidadOTs : number; /** Cantidad de rollos consultados en cualquiera de los filtros */
  public arrayDataConsolidada : any = [];  /** Array que guardará la data consolidada para mostrarla en el PDF */
  public PesoTotalKg : number = 0; /** Peso total en Kg de rollos eliminados para mostrarlos en el PDF */
  public Item : any = null; /** variable ngModel que servirá para la consulta de tipo LIKE para traer nombres de productos */
  public arrayProcesos : any = [];
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro

  constructor(private formbuilder : FormBuilder,
                private servicioTurno : TurnosService,
                  private servicioMaterial : MaterialProductoService,
                    private servicioProducto : ProductoService,
                      private servicioBagPro : BagproService,
                        private servicioRollos : SrvRollosEliminadosService,
                          private AppComponent : AppComponent,
                            private servicioProcesos : ProcesosService,
                                private shepherdService: ShepherdService,
                                  private msj : MensajesAplicacionService) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
    this.formConsultaRollos = this.formbuilder.group({
      OT : [null],
      fecha : [null],
      fechaFinal : [null],
      producto: [null, Validators.required],
      id_producto : [null],
      rollo : [null],
      Proceso : [null],
    });

  }

  ngOnInit() {
    this.obtenerProcesos();
    this.lecturaStorage();
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

  /** Seleccionar el id del producto luego de seleccionar su nombre */
  selectEventProducto() {
    let expresion : any = /^[0-9]*(\.?)[ 0-9]+$/;
    this.idProducto = this.formConsultaRollos.value.producto;

    if(this.idProducto.match(expresion) != null) {
      this.servicioProducto.obtenerNombreProductos(this.formConsultaRollos.value.producto).subscribe(dataProducto => {
        this.formConsultaRollos.patchValue({
          producto: dataProducto,
          id_producto : this.idProducto,
        });
      });
    } else {
      this.msj.mensajeAdvertencia(`Advertencia`, 'Debe cargar un item válido');
      this.idProducto = 0;
    }
  }

  /** Limpiar campos de la vista */
  LimpiarCampos() {
    this.formConsultaRollos.reset();
    this.load = true;
    this.cantidadOTs = 0;
    this.ArrayDocumento = [];
  }

  /** Cargar los procesos de donde puede venir el rollo. */
  obtenerProcesos(){
    this.servicioProcesos.srvObtenerLista().subscribe(dataProcesos => { this.arrayProcesos = dataProcesos; });
  }

  /** Filtros de consulta que cargarán información en la tabla. */
  validarConsulta() {
    this.load = false;
    this.cantidadOTs = 0;
    this.ArrayDocumento = [];
    let ordenTrabajo : number = this.formConsultaRollos.value.OT
    let rolloEliminado : number = this.formConsultaRollos.value.rollo;
    let fecha1 : any = moment(this.formConsultaRollos.value.fecha).format('YYYY-MM-DD');
    let fecha2 : any  = moment(this.formConsultaRollos.value.fechaFinal).format('YYYY-MM-DD');
    let proceso : any = this.formConsultaRollos.value.Proceso;
    let productoConsulta : any = this.formConsultaRollos.value.id_producto;
    if (this.idProducto == 0) productoConsulta = null;

    if (fecha1 == 'Invalid date') fecha1 = null;
    if (fecha2 == 'Invalid date') fecha2 = null;

    if(fecha1 != null && fecha2 != null && rolloEliminado != null && productoConsulta != null && ordenTrabajo != null && proceso != null) {
      this.servicioRollos.srvObtenerListaRollosxFechasxOT(fecha1, fecha2, ordenTrabajo).subscribe(dataRollos => {
        for (let index = 0; index < dataRollos.length; index++) {
          if (dataRollos[index].rollo_Id == rolloEliminado && dataRollos[index].prod_Id == productoConsulta && dataRollos[index].proceso_Id == proceso) {
            this.parametrosTablaRollos(dataRollos[index]);
            this.cantidadOTs += 1;
          }
        }
      });
    } else if(fecha1 != null && fecha2 != null && rolloEliminado != null && productoConsulta != null && ordenTrabajo != null) {
      this.servicioRollos.srvObtenerListaRollosxFechasxRolloxItemxOT(fecha1, fecha2, rolloEliminado, this.idProducto, ordenTrabajo).subscribe(dataRollos => {
        for (let index = 0; index < dataRollos.length; index++) {
          this.parametrosTablaRollos(dataRollos[index]);
          this.cantidadOTs += 1
        }
      });
    } else if(fecha1 != null && fecha2 != null && rolloEliminado != null && productoConsulta != null && proceso != null) {
      this.servicioRollos.getRollosxFechasxRolloxItemxProceso(fecha1, fecha2, rolloEliminado, this.idProducto, proceso).subscribe(dataRollos => {
        for (let index = 0; index < dataRollos.length; index++) {
          this.parametrosTablaRollos(dataRollos[index]);
          this.cantidadOTs += 1
        }
      });
    } else if(fecha1 != null && fecha2 != null && rolloEliminado != null && ordenTrabajo != null && proceso != null) {
      this.servicioRollos.srvObtenerListaRollosxFechasxOT(fecha1, fecha2, ordenTrabajo).subscribe(dataRollos => {
        for (let index = 0; index < dataRollos.length; index++) {
          if (dataRollos[index].rollo_Id == rolloEliminado && dataRollos[index].proceso_Id == proceso) {
            this.parametrosTablaRollos(dataRollos[index]);;
            this.cantidadOTs += 1;
          }
        }
      });
    } else if(fecha1 != null && fecha2 != null && productoConsulta != null && ordenTrabajo != null && proceso != null) {
      this.servicioRollos.srvObtenerListaRollosxFechasxOT(fecha1, fecha2, ordenTrabajo).subscribe(dataRollos => {
        for (let index = 0; index < dataRollos.length; index++) {
          if (dataRollos[index].prod_Id == productoConsulta && dataRollos[index].proceso_Id == proceso) {
            this.parametrosTablaRollos(dataRollos[index]);
            this.cantidadOTs += 1;
          }
        }
      });
    } else if(fecha1 != null && rolloEliminado != null && productoConsulta != null && ordenTrabajo != null && proceso != null) {
      this.servicioRollos.srvObtenerListaRollosxOT(ordenTrabajo).subscribe(dataRollos => {
        for (let index = 0; index < dataRollos.length; index++) {
          if (dataRollos[index].rollo_FechaIngreso == fecha1 && dataRollos[index].rollo_Id == rolloEliminado && dataRollos[index].prod_Id == productoConsulta && dataRollos[index].proceso_Id == proceso) {
            this.parametrosTablaRollos(dataRollos[index]);;
            this.cantidadOTs += 1;
          }
        }
      });
    } else if(rolloEliminado != null && productoConsulta != null && ordenTrabajo != null && proceso != null) {
      this.servicioRollos.srvObtenerListaRollosxOT(ordenTrabajo).subscribe(dataRollos => {
        for (let index = 0; index < dataRollos.length; index++) {
          if (dataRollos[index].rollo_Id == rolloEliminado && dataRollos[index].prod_Id == productoConsulta && dataRollos[index].proceso_Id == proceso) {
            this.parametrosTablaRollos(dataRollos[index]);;
            this.cantidadOTs += 1;
          }
        }
      });
    } else if(fecha1 != null && productoConsulta != null && ordenTrabajo != null && proceso != null) {
      this.servicioRollos.srvObtenerListaRollosxOT(ordenTrabajo).subscribe(dataRollos => {
        for (let index = 0; index < dataRollos.length; index++) {
          if (dataRollos[index].rollo_FechaIngreso == fecha1 && dataRollos[index].prod_Id == productoConsulta && dataRollos[index].proceso_Id == proceso) {
            this.parametrosTablaRollos(dataRollos[index]);;
            this.cantidadOTs += 1;
          }
        }
      });
    } else if(fecha1 != null && fecha2 != null && ordenTrabajo != null && proceso != null) {
      this.servicioRollos.srvObtenerListaRollosxFechasxOT(fecha1, fecha2, ordenTrabajo).subscribe(dataRollos => {
        for (let index = 0; index < dataRollos.length; index++) {
          if (dataRollos[index].proceso_Id == proceso) {
            this.parametrosTablaRollos(dataRollos[index]);
            this.cantidadOTs += 1
          }
        }
      });
    } else if(fecha1 != null && fecha2 != null && rolloEliminado != null && proceso != null) {
      this.servicioRollos.getRollosxFechasxRolloxProceso(fecha1, fecha2, rolloEliminado, proceso).subscribe(dataRollos => {
        for (let index = 0; index < dataRollos.length; index++) {
          this.parametrosTablaRollos(dataRollos[index]);
          this.cantidadOTs += 1
        }
      });
    } else if(fecha1 != null && fecha2 != null && rolloEliminado != null && productoConsulta != null) {
      this.servicioRollos.srvObtenerListaRollosxFechasxRolloxItem(fecha1, fecha2, rolloEliminado, this.idProducto).subscribe(dataRollos => {
        for (let index = 0; index < dataRollos.length; index++) {
          this.parametrosTablaRollos(dataRollos[index]);
          this.cantidadOTs += 1
        }
      });
    } else if(fecha1 != null && rolloEliminado != null && ordenTrabajo != null && proceso != null) {
      this.servicioRollos.srvObtenerListaRollosxOT(ordenTrabajo).subscribe(dataRollos => {
        for (let index = 0; index < dataRollos.length; index++) {
          if (dataRollos[index].rollo_FechaIngreso == fecha1 && dataRollos[index].rollo_Id == rolloEliminado && dataRollos[index].proceso_Id == proceso) {
            this.parametrosTablaRollos(dataRollos[index]);;
            this.cantidadOTs += 1;
          }
        }
      });
    } else if(fecha1 != null && rolloEliminado != null && productoConsulta != null && proceso != null) {
      this.servicioRollos.srvObtenerListaRollosxRollo(rolloEliminado).subscribe(dataRollos => {
        for (let index = 0; index < dataRollos.length; index++) {
          if (dataRollos[index].rollo_FechaIngreso == fecha1 && dataRollos[index].prod_Id == productoConsulta && dataRollos[index].proceso_Id == proceso) {
            this.parametrosTablaRollos(dataRollos[index]);;
            this.cantidadOTs += 1;;
          }
        }
      });
    } else if(fecha1 != null && rolloEliminado != null && ordenTrabajo != null && proceso != null) {
      this.servicioRollos.srvObtenerListaRollosxOT(ordenTrabajo).subscribe(dataRollos => {
        for (let index = 0; index < dataRollos.length; index++) {
          if (dataRollos[index].rollo_FechaIngreso == fecha1 && dataRollos[index].rollo_Id == rolloEliminado && dataRollos[index].proceso_Id == proceso) {
            this.parametrosTablaRollos(dataRollos[index]);;
            this.cantidadOTs += 1;
          }
        }
      });
    } else if(fecha1 != null && rolloEliminado != null && productoConsulta != null && proceso != null) {
      this.servicioRollos.getRollosxFechasxRolloxItemxProceso(fecha1, fecha1, rolloEliminado, this.idProducto, proceso).subscribe(dataRollos => {
        if(dataRollos.length == 0) setTimeout(() => { this.rollosNoEncontrados(); }, 3000);
        else {
          for (let index = 0; index < dataRollos.length; index++) {
            this.parametrosTablaRollos(dataRollos[index]);
            this.cantidadOTs += 1
          }
        }
      });
    } else if(fecha1 != null && rolloEliminado != null && productoConsulta != null && ordenTrabajo != null) {
      this.servicioRollos.srvObtenerListaRollosxOT(ordenTrabajo).subscribe(dataRollos => {
        for (let index = 0; index < dataRollos.length; index++) {
          if (dataRollos[index].rollo_FechaIngreso == fecha1 && dataRollos[index].rollo_Id == rolloEliminado && dataRollos[index].prod_Id == productoConsulta) {
            this.parametrosTablaRollos(dataRollos[index]);;
            this.cantidadOTs += 1;
          }
        }
      });
    } else if(fecha1 != null && fecha2 != null && productoConsulta != null && proceso != null) {
      this.servicioRollos.getRollosxFechasxItemxProceso(fecha1, fecha2, this.idProducto, proceso).subscribe(dataRollos => {
        for (let index = 0; index < dataRollos.length; index++) {
          this.parametrosTablaRollos(dataRollos[index]);
          this.cantidadOTs += 1
        }
      });
    } else if(fecha1 != null && fecha2 != null && productoConsulta != null && ordenTrabajo != null) {
      this.servicioRollos.srvObtenerListaRollosxFechasxOT(fecha1, fecha2, ordenTrabajo).subscribe(dataRollos => {
        for (let index = 0; index < dataRollos.length; index++) {
          if (dataRollos[index].prod_Id == productoConsulta) {
            this.parametrosTablaRollos(dataRollos[index]);;
            this.cantidadOTs += 1;
          }
        }
      });
    } else if(fecha1 != null && fecha2 != null && rolloEliminado != null && ordenTrabajo != null) {
      this.servicioRollos.srvObtenerListaRollosxFechasxRolloxOT(fecha1, fecha2, rolloEliminado, ordenTrabajo).subscribe(dataRollos => {
        for (let index = 0; index < dataRollos.length; index++) {
          this.parametrosTablaRollos(dataRollos[index]);
          this.cantidadOTs += 1
        }
      });
    } else if(fecha1 != null && fecha2 != null && rolloEliminado != null) {
      this.servicioRollos.srvObtenerListaRollosxFechasxOT(fecha1, fecha2, ordenTrabajo).subscribe(dataRollos => {
        for (let index = 0; index < dataRollos.length; index++) {
          this.parametrosTablaRollos(dataRollos[index]);
          this.cantidadOTs += 1
        }
      });
    } else if(fecha1 != null && fecha2 != null && productoConsulta != null) {
      this.servicioRollos.srvObtenerListaRollosxFechasxItem(fecha1, fecha2, this.idProducto).subscribe(dataRollos => {
        for (let index = 0; index < dataRollos.length; index++) {
          this.parametrosTablaRollos(dataRollos[index]);
          this.cantidadOTs += 1
        }
      });
    } else if(fecha1 != null && fecha2 != null && ordenTrabajo != null) {
      this.servicioRollos.srvObtenerListaRollosxFechasxOT(fecha1, fecha2, ordenTrabajo).subscribe(dataRollos => {
        for (let index = 0; index < dataRollos.length; index++) {
          this.parametrosTablaRollos(dataRollos[index]);
          this.cantidadOTs += 1
        }
      });
    } else if(fecha1 != null && fecha2 != null && proceso != null) {
      this.servicioRollos.getRollosxFechasxProceso(fecha1, fecha2, proceso).subscribe(dataRollos => {
        for (let index = 0; index < dataRollos.length; index++) {
          this.parametrosTablaRollos(dataRollos[index]);
          this.cantidadOTs += 1
        }
      });
    } else if(fecha1 != null && rolloEliminado != null && productoConsulta != null) {
      this.servicioRollos.srvObtenerListaRollosxRollo(rolloEliminado).subscribe(dataRollos => {
        for (let index = 0; index < dataRollos.length; index++) {
          if (dataRollos[index].rollo_FechaIngreso == fecha1 && dataRollos[index].prod_Id == productoConsulta) {
            this.parametrosTablaRollos(dataRollos[index]);
            this.cantidadOTs += 1;
            }
        }
      });
    } else if(fecha1 != null && rolloEliminado != null && ordenTrabajo != null) {
      this.servicioRollos.srvObtenerListaRollosxOT(ordenTrabajo).subscribe(dataRollos => {
        for (let index = 0; index < dataRollos.length; index++) {
          if (dataRollos[index].rollo_FechaIngreso == fecha1 && dataRollos[index].rollo_Id == rolloEliminado) {
            this.parametrosTablaRollos(dataRollos[index]);
            this.cantidadOTs += 1;
          }
        }
      });
    } else if(fecha1 != null && rolloEliminado != null && proceso != null) {
      this.servicioRollos.srvObtenerListaRollosxRollo(rolloEliminado).subscribe(dataRollos => {
        for (let index = 0; index < dataRollos.length; index++) {
          if (dataRollos[index].rollo_FechaIngreso == fecha1
            && dataRollos[index].proceso_Id == proceso) {
            this.parametrosTablaRollos(dataRollos[index]);
            this.cantidadOTs += 1;
          }
        }
      });
    } else if(fecha1 != null && productoConsulta != null && ordenTrabajo != null) {
      this.servicioRollos.srvObtenerListaRollosxOT(ordenTrabajo).subscribe(dataRollos => {
        for (let index = 0; index < dataRollos.length; index++) {
          if (dataRollos[index].rollo_FechaIngreso == fecha1 && dataRollos[index].prod_Id == productoConsulta) {
            this.parametrosTablaRollos(dataRollos[index]);;
            this.cantidadOTs += 1;
          }
        }
      });
    } else if(fecha1 != null && productoConsulta != null && proceso != null) {
      this.servicioRollos.srvObtenerListaRollosxFechas(fecha1, fecha1).subscribe(dataRollos => {
        for (let index = 0; index < dataRollos.length; index++) {
          if (dataRollos[index].prod_Id == productoConsulta
            && dataRollos[index].proceso_Id == proceso) {
            this.parametrosTablaRollos(dataRollos[index]);
            this.cantidadOTs += 1;
          }
        }
      });
    } else if(rolloEliminado != null && productoConsulta != null && ordenTrabajo != null) {
      this.servicioRollos.srvObtenerListaRollosxOT(ordenTrabajo).subscribe(dataRollos => {
        for (let index = 0; index < dataRollos.length; index++) {
          if (dataRollos[index].rollo_Id == rolloEliminado && dataRollos[index].prod_Id == productoConsulta) {
            this.parametrosTablaRollos(dataRollos[index]);;
            this.cantidadOTs += 1;
          }
        }
      });
    } else if(rolloEliminado != null && productoConsulta != null && proceso != null) {
      this.servicioRollos.srvObtenerListaRollosxRollo(rolloEliminado).subscribe(dataRollos => {
        for (let index = 0; index < dataRollos.length; index++) {
          if (dataRollos[index].prod_Id == productoConsulta
            && dataRollos[index].proceso_Id == proceso) {
              this.parametrosTablaRollos(dataRollos[index]);
            this.cantidadOTs += 1;
          }
        }
      });
    } else if(rolloEliminado != null && ordenTrabajo != null && proceso != null) {
      this.servicioRollos.srvObtenerListaRollosxOT(ordenTrabajo).subscribe(dataRollos => {
        for (let index = 0; index < dataRollos.length; index++) {
          if (dataRollos[index].proceso_Id == proceso && dataRollos[index].rollo_Id == rolloEliminado) {
            this.parametrosTablaRollos(dataRollos[index]);
            this.cantidadOTs += 1;
          }
        }
      });
    } else if(fecha1 != null && fecha2 != null) {
      this.servicioRollos.srvObtenerListaRollosxFechas(fecha1, fecha2).subscribe(dataRollos => {
        for (let index = 0; index < dataRollos.length; index++) {
          this.parametrosTablaRollos(dataRollos[index]);
          this.cantidadOTs += 1;
        }
      });
    } else if(fecha1 != null && rolloEliminado != null) {
      this.servicioRollos.srvObtenerListaRollosxRollo(rolloEliminado).subscribe(dataRollos => {
        for (let index = 0; index < dataRollos.length; index++) {
          if (dataRollos[index].rollo_FechaIngreso == fecha1) {
            this.parametrosTablaRollos(dataRollos[index]);
            this.cantidadOTs += 1;
          }
        }
      });
    } else if(fecha1 != null && productoConsulta != null) {
      this.servicioRollos.srvObtenerListaRollosxFechas(fecha1, fecha2).subscribe(dataRollos => {
        for (let index = 0; index < dataRollos.length; index++) {
          if (dataRollos[index].prod_Id == productoConsulta) {
            this.parametrosTablaRollos(dataRollos[index]);
            this.cantidadOTs += 1;
          }
        }
      });
    } else if(fecha1 != null && ordenTrabajo != null) {
      this.servicioRollos.srvObtenerListaRollosxOT(ordenTrabajo).subscribe(dataRollos => {
        for (let index = 0; index < dataRollos.length; index++) {
          if (dataRollos[index].rollo_FechaIngreso == fecha1) {
            this.parametrosTablaRollos(dataRollos[index]);;
            this.cantidadOTs += 1;
          }
        }
      });
    } else if(fecha1 != null && proceso != null) {
      this.servicioRollos.srvObtenerListaRollosxFechas(fecha1, fecha2).subscribe(dataRollos => {
        for (let index = 0; index < dataRollos.length; index++) {
          if (dataRollos[index].proceso_Id == proceso) {
            this.parametrosTablaRollos(dataRollos[index]);
            this.cantidadOTs += 1;
          }
        }
      });
    } else if(rolloEliminado != null && productoConsulta != null) {
      this.servicioRollos.srvObtenerListaRollosxRollo(rolloEliminado).subscribe(dataRollos => {
        for (let index = 0; index < dataRollos.length; index++) {
          if (dataRollos[index].prod_Id == productoConsulta) {
            this.parametrosTablaRollos(dataRollos[index]);
            this.cantidadOTs += 1;
          }
        }
      });
    } else if(rolloEliminado != null && ordenTrabajo != null) {
      this.servicioRollos.srvObtenerListaRollosxOT(ordenTrabajo).subscribe(dataRollos => {
        for (let index = 0; index < dataRollos.length; index++) {
          if (dataRollos[index].rollo_Id == rolloEliminado) {
            this.parametrosTablaRollos(dataRollos[index]);;
            this.cantidadOTs += 1;
          }
        }
      });
    } else if(rolloEliminado != null && proceso != null) {
      this.servicioRollos.srvObtenerListaRollosxRollo(rolloEliminado).subscribe(dataRollos => {
        for (let index = 0; index < dataRollos.length; index++) {
          if (dataRollos[index].proceso_Id == proceso) {
            this.parametrosTablaRollos(dataRollos[index]);;
            this.cantidadOTs += 1;
          }
        }
      });
    } else if(productoConsulta != null && ordenTrabajo != null) {
      this.servicioRollos.srvObtenerListaRollosxOT(ordenTrabajo).subscribe(dataRollos => {
        for (let index = 0; index < dataRollos.length; index++) {
          if (dataRollos[index].prod_Id == productoConsulta) {
            this.parametrosTablaRollos(dataRollos[index]);;
            this.cantidadOTs += 1;
          }
        }
      });
    } else if(productoConsulta != null && proceso != null) {
      this.servicioRollos.srvObtenerListaRollosxItem(this.idProducto).subscribe(dataRollos => {
        for (let index = 0; index < dataRollos.length; index++) {
          if (dataRollos[index].proceso_Id == proceso) {
            this.parametrosTablaRollos(dataRollos[index]);
            this.cantidadOTs += 1;
          }
        }
      });
    } else if(ordenTrabajo != null && proceso != null) {
      this.servicioRollos.srvObtenerListaRollosxOT(ordenTrabajo).subscribe(dataRollos => {
        for (let index = 0; index < dataRollos.length; index++) {
          if (dataRollos[index].proceso_Id == proceso) {
            this.parametrosTablaRollos(dataRollos[index]);;
            this.cantidadOTs += 1;
          }
        }
      });
    } else if(fecha1 != null) {
      this.servicioRollos.srvObtenerListaRollosxFechas(fecha1, fecha1).subscribe(dataRollos => {
          for (let index = 0; index < dataRollos.length; index++) {
            this.parametrosTablaRollos(dataRollos[index]);
            this.cantidadOTs += 1;
        }
      });
    } else if(rolloEliminado != null) {
      this.servicioRollos.srvObtenerListaRollosxRollo(rolloEliminado).subscribe(dataRollos => {
        for (let index = 0; index < dataRollos.length; index++) {
          this.parametrosTablaRollos(dataRollos[index]);
          this.cantidadOTs += 1;
        }
      });
    } else if(productoConsulta != null) {
      this.servicioRollos.srvObtenerListaRollosxItem(this.idProducto).subscribe(dataRollos => {
        for (let index = 0; index < dataRollos.length; index++) {
          this.parametrosTablaRollos(dataRollos[index]);
          this.cantidadOTs += 1;
        }
      });
    } else if(ordenTrabajo != null) {
      this.servicioRollos.srvObtenerListaRollosxOT(ordenTrabajo).subscribe(dataRollos => {
        for (let index = 0; index < dataRollos.length; index++) {
          this.parametrosTablaRollos(dataRollos[index]);
          this.cantidadOTs += 1;
        }
      });
    } else if(proceso != null) {
      this.servicioRollos.srvObtenerListaRollosxProceso(proceso).subscribe(dataRollos => {
        for (let index = 0; index < dataRollos.length; index++) {
          if (dataRollos[index].proceso_Id == proceso) {
            this.parametrosTablaRollos(dataRollos[index]);;
            this.cantidadOTs += 1;
          }
        }
      });
    } else {
      this.servicioRollos.srvObtenerListaRollosxFechas(this.today, this.today).subscribe(dataRollos => {
        for (let index = 0; index < dataRollos.length; index++) {
          this.parametrosTablaRollos(dataRollos[index]);
          this.cantidadOTs += 1;
        }
      });
    }

    setTimeout(() => {
      if (this.cantidadOTs == 0) this.rollosNoEncontrados();
      this.load = true;
    }, 3000);
  }

  /** Mensaje que aparecerá cuando no se encuentrén resultados luego de una busqueda. */
  rollosNoEncontrados() {
    this.msj.mensajeAdvertencia(`Advertencia`, 'No se encontraron resultados de búsqueda!');
  }

  /** NO USADA: Función para cargar los turnos en el combobox de la vista */
  obtenerTurno(){
    this.servicioTurno.srvObtenerLista().subscribe(dataTurnos => { this.arrayTurnos = dataTurnos; });
  }

  /** NO USADA: Función para cargar los materiales de mat. prima en el combobox de la vista */
  obtenerMaterial(){
    this.servicioMaterial.srvObtenerLista().subscribe(dataMaterial => { this.arrayMaterial = dataMaterial; });
  }

   /** Función para cargar los productos en el datalist de la vista */
  obtenerProductos() {
    this.arrayProductos = [];
    let campoItem : string = this.formConsultaRollos.value.producto;
    if (campoItem.length > 2 && campoItem != null) this.servicioProducto.obtenerItemsLike(this.Item.trim()).subscribe(dataProducto => { this.arrayProductos = dataProducto; });
  }

  /** Campos que saldrán en la tabla al momento de consultar los filtros. */
  parametrosTablaRollos(datos) {
    let info : any = {
      Orden : datos.rollo_OT,
      Rollo : datos.rollo_Id,
      Cliente : datos.rollo_Cliente,
      Item_Id : datos.prod_Id,
      Item : datos.prod_Nombre,
      Ancho : datos.rollo_Ancho,
      Largo : datos.rollo_Largo,
      Fuelle : datos.rollo_Fuelle,
      Medida : datos.undMed_Id,
      Peso: this.formatonumeros(parseFloat(datos.rollo_PesoNeto)),
      Kg: 'Kg',
      Material : datos.material_Id,
      Calibre : datos.rollo_Calibre,
      Operario : datos.rollo_Operario,
      Fecha : datos.rollo_FechaIngreso,
      Turno: datos.turno_Nombre,
      Proceso : datos.proceso_Nombre,
      PesoNumero : parseFloat(datos.rollo_PesoNeto)
    }
    this.mostrarColumnas();
    this.ArrayDocumento.push(info);
    this.consolidarRollosEliminados();
  }

  /** Consolida la información de los rollos eliminados y la carga en el PDF */
  consolidarRollosEliminados(){
    let Ordenes : any = [];
    this.arrayDataConsolidada = [];
    this.PesoTotalKg = 0;

    for (let index = 0; index < this.ArrayDocumento.length; index++) {
      if(!Ordenes.includes(this.ArrayDocumento[index].Orden)){
        let cantidadPesos: number = 0;
        let cantRollos: number = 0;

        for (let indx = 0; indx < this.ArrayDocumento.length; indx++) {
          if(this.ArrayDocumento[indx].Orden == this.ArrayDocumento[index].Orden) {
            cantidadPesos += this.ArrayDocumento[indx].PesoNumero;
            cantRollos += 1;
          }
        }
        Ordenes.push(this.ArrayDocumento[index].Orden);
        let infoConsolidada : any = {
          OT : this.ArrayDocumento[index].Orden,
          Cliente : this.ArrayDocumento[index].Cliente,
          Item : this.ArrayDocumento[index].Item_Id,
          Nombre : this.ArrayDocumento[index].Item,
          Peso : this.formatonumeros(cantidadPesos.toFixed(2)),
          "No Rollos" : this.formatonumeros(cantRollos.toFixed(2)),
        }
        this.arrayDataConsolidada.push(infoConsolidada);
        this.PesoTotalKg += cantidadPesos;
      }
    }
  }

  /** Función que cargará los nombres de los operarios */
  obtenerOperariosExtrusion() {
    this.servicioBagPro.srvObtenerListaOperariosExtrusion().subscribe(dataOperarios => {
      for (let index = 0; index < dataOperarios.length; index++) {
        if (dataOperarios[index].nombre != 0) this.arrayOperarios.push(dataOperarios[index]);
      }
    });
  }

  /** NO USADA: Obtener nombres de Ultimos Clientes con OT*/
  obtenerUltimosClientes() {
    this.servicioBagPro.srvObtenerListaUltimosClientes(this.fechaAnterior).subscribe(dataClientes => { this.arrayClientes = dataClientes; });
  }

  /** Mostrar en la tabla las columnas elegidas en el Input-Select que se encuentra en la parte superior de la tabla. */
  mostrarColumnas() {
    this.columnas = [
      { header: 'Calibre', field: 'Calibre'},
      { header: 'Material', field: 'Material'},
      { header: 'Operario', field: 'Operario'},
      { header: 'Turno', field: 'Turno'},
    ];
  }

  // funcion que se encagará de llenar la tabla de los productos en el pdf
  buildTableBody(data, columns) {
    var body = [];
    body.push(columns);
    data.forEach(function(row) {
      var dataRow = [];
      columns.forEach(function(column) {
        dataRow.push(row[column]);
      });
      body.push(dataRow);
    });
    return body;
  }

  // Funcion que genera la tabla donde se mostrará la información detallada de los rollos consultados en el PDF
  table(data, columns) {
    return {
        table: {
          headerRows: 1,
          widths: [35, 35, '*', 35, '*', 30, 45, '*'],
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

    // Funcion que genera la tabla donde se mostrará la información consolidada de los rollos consultados en el PDF
  table2(data, columns) {
    return {
        table: {
          headerRows: 1,
          widths: [35, '*', 35, '*', 35, 30],
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

  /** Exportar reporte de rollos en PDF */
  exportarPdf() {
    let nombre : string = this.storage_Nombre;
      const pdfDefinicion : any = {
        info: {
          title: `Rollos eliminados`
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
        watermark: { text: 'PLASTICARIBE SAS', color: 'red', opacity: 0.05, bold: true, italics: false },
        content : [
          {
            columns: [
              {
                image : logoParaPdf,
                width : 220,
                height : 50
              },
              {
                text: `Plasticaribe S.A.S ---- Reporte rollos eliminados (Extrusión)`,
                alignment: 'center',
                style: 'titulo',
                margin: 30
              }
            ]
          },
          '\n \n',
          {
            text: `Fecha de creación: ${this.today}`,
            style: 'header',
            alignment: 'right',
          },
          {
            text: `Creado por: ${this.storage_Nombre}\n\n`,
            alignment: 'right',
            style: 'header',
          },
          {
            text: `\n Información consolidada de los rollos eliminados \n `,
            alignment: 'center',
            style: 'header'
          },

          this.table2(this.arrayDataConsolidada, ['OT', 'Cliente', 'Item', 'Nombre', 'Peso', 'No Rollos']),

          {
            text: `\n\n Información detallada de los rollos eliminados \n `,
            alignment: 'center',
            style: 'header'
          },

          this.table(this.ArrayDocumento, ['Orden', 'Rollo', 'Cliente', 'Item_Id', 'Item', 'Peso', 'Fecha', 'Operario']),

          {
            text: `\n\nCantidad de rollos: ${this.formatonumeros(this.cantidadOTs)}`,
            alignment: 'right',
            style: 'header',
          },
          {
            text: `\nCantidad Total Kg: ${this.formatonumeros(this.PesoTotalKg)}`,
            alignment: 'right',
            style: 'header',
          },
        ],
        styles: {
          header: {
            fontSize: 10,
            bold: true
          },
          titulo: {
            fontSize: 15,
            bold: true
          }
        }
      }
      const pdf = pdfMake.createPdf(pdfDefinicion);
      pdf.open();
      //break;
  }

  /** Exportar reporte de rollos en excel */
  exportarExcel(){
    this.load = false;
    setTimeout(() => {
      const title = `Reporte de rollos eliminados (Extrusión)`;
      const header = ["OT", "Rollo", "Cliente", "Nro. Item", "Nombre Item", "Peso", "Presentación", "Ancho", "Largo", "Fuelle", "Medida", "Material", "Calibre", "Operario", "Fecha", "Turno"]
      let datos : any =[];
      for (const item of this.ArrayDocumento) {
        const datos1  : any = [item.Orden, item.Rollo, item.Cliente, item.Item_Id, item.Item, item.Peso, item.Kg, item.Ancho, item.Largo, item.Fuelle, item.Medida, item.Material, item.Calibre, item.Operario, item.Fecha, item.Turno];
        datos.push(datos1);
      }
      let workbook = new Workbook();
      let worksheet = workbook.addWorksheet(`Reporte de rollos eliminados`);
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
      worksheet.mergeCells('A1:P2');
      worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
      datos.forEach(d => {
        let row = worksheet.addRow(d);
        let peso = row.getCell(6);
        let color = 'F1948A';

        peso.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: color }
        }

      });
      worksheet.getColumn(1).width = 10;
      worksheet.getColumn(2).width = 10;
      worksheet.getColumn(3).width = 50;
      worksheet.getColumn(4).width = 10;
      worksheet.getColumn(5).width = 50;
      worksheet.getColumn(6).width = 10;
      worksheet.getColumn(7).width = 15;
      worksheet.getColumn(8).width = 10;
      worksheet.getColumn(9).width = 10;
      worksheet.getColumn(10).width = 10;
      worksheet.getColumn(11).width = 10;
      worksheet.getColumn(12).width = 10;
      worksheet.getColumn(13).width = 10;
      worksheet.getColumn(14).width = 30;
      worksheet.getColumn(15).width = 12;
      worksheet.getColumn(16).width = 20;
      setTimeout(() => {
        workbook.xlsx.writeBuffer().then((data) => {
          let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          fs.saveAs(blob, `Reporte de rollos eliminados ${this.today}.xlsx`);
        });
        this.load = true;
      }, 1000);
    }, 3500);
    setTimeout(() => { this.msj.mensajeConfirmacion(`¡Información exportada a excel!`, 'Archivo generado con éxito!') }, 4000);
  }

  /** Elegir formato en el que desea exportar el documento. */
  elegirFormatoExportacion(){
    if (this.ArrayDocumento.length > 0) {
      Swal.fire({
        title: '¿En que formato desea exportar la información?',
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonColor : '#dc3545',
        confirmButtonText: 'Formato PDF',
        denyButtonText: `Formato Excel`,
      }).then((result) => {
        if (result.isDenied) this.exportarExcel();
        else if (result.isConfirmed) this.exportarPdf();
      });
    } else this.msj.mensajeAdvertencia(`Advertencia`, 'Debe cargar al menos un registro en la tabla.');
  }

  /** Prime NG */
  @Input() get columnasSeleccionada(): any[] {
    return this._columnasSeleccionada;
  }

  set columnasSeleccionada(val: any[]) {
    this._columnasSeleccionada = this.columnas.filter(col => val.includes(col));
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = '$1,';
    return number.toString().replace(exp,rep);
  }
}
