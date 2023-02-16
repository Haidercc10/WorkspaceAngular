import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import pdfMake from 'pdfmake/build/pdfmake';
import { AsignacionMPService } from 'src/app/Servicios/Asignacion_MateriaPrima/asignacionMP.service';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { CategoriaMateriaPrimaService } from 'src/app/Servicios/CategoriasMateriaPrima/categoriaMateriaPrima.service';
import { DetallesAsignacionService } from 'src/app/Servicios/DetallesAsgMateriaPrima/detallesAsignacion.service';
import { MateriaPrimaService } from 'src/app/Servicios/MateriaPrima/materiaPrima.service';
import { RolesService } from 'src/app/Servicios/Roles/roles.service';
import { TipoBodegaService } from 'src/app/Servicios/TipoBodega/tipoBodega.service';
import { UsuarioService } from 'src/app/Servicios/Usuarios/usuario.service';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-reporteMpOt',
  templateUrl: './reporteMpOt.component.html',
  styleUrls: ['./reporteMpOt.component.css']
})
export class ReporteMpOtComponent implements OnInit {

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
  clienteOT : string; //Variable que va a almacenar el cliente de la ot consultada
  cantidadTotalExt : number = 0; //Variable que va a almacenar el total de la cantidad extruida en una OT
  cantidadTotalImp : number = 0; //Variable que va a almacenar el total de la cantidad impresa en una OT
  cantidadTotalDbl : number = 0; //Variable que va a almacenar el total de la cantidad doblada en una OT
  cantidadTotalRot : number = 0; //Variable que va a almacenar el total de la cantidad Rotograbado en una OT
  cantidadTotalSella : number = 0; //Variable que va a almacenar el total de la cantidad sellada en una OT
  cantidadTotalEmpaque : number = 0; //Variable que va a almacenar el total de la cantidad empacada en una OT
  cantidadTotalCorte : number = 0; //Variable que va a almacenar el total de la cantidad cortada en una OT
  cantidadTotalLaminado : number = 0; //Variable que va a almacenar el total de la cantidad cantidad Total Laminado en una OT
  cantidadTotalWiketiado : number = 0; //Variable que va a almacenar el total de la cantidad cantidad Tota wiketeada en una OT
  desp_ext : number = 0;
  desp_imp : number = 0;
  desp_rot : number = 0;
  desp_dbld : number = 0;
  desp_sella : number = 0;
  desp_emp : number = 0;
  desp_corte : number = 0;
  desp_lam : number = 0;
  desp_wik : number = 0;
  proceso : string = ''; //Variable ayudará a almacenar el proceso del cuela se está consultando la ot
  totalPorcentajePerida : number = 0; //Variable que ayudará a calcular el total de perdida en una OT
  arrayOtConsultada = [];
  porcentajeTotal : number = 0;
  totalPerdidaPorcentaje : number = 0;

  titulosTablaprocesos = [];
  titulosTablaprocesosDiferencias = [];
  ArrayProcesos : any [] = [];
  ArrayProcesosDiferencias : any [] = [];
  totalKgPedida : number = 0;
  margen : number = 0;
  totalPerdida : number = 0;
  cantidadAsignada : number = 0;

  /* CONSULTAS DE MATERIA PRIMA */
  MpConsultada = [];
  public load: boolean;
  name = 'Reporte_OT.xlsx'; //Variable que le da nombre al archivo de excel que se genera

  constructor(private materiaPrimaService : MateriaPrimaService,
                private categoriMpService : CategoriaMateriaPrimaService,
                  private tipoBodegaService : TipoBodegaService,
                    private rolService : RolesService,
                      private frmBuilderMateriaPrima : FormBuilder,
                        @Inject(SESSION_STORAGE) private storage: WebStorageService,
                          private asignacionMPService : AsignacionMPService,
                            private detallesAsignacionService : DetallesAsignacionService,
                              private bagProServices : BagproService,
                                private usuarioService : UsuarioService) {

    this.FormMateriaPrima = this.frmBuilderMateriaPrima.group({
      ot : new FormControl(),
    });
    this.load = true;
  }


  ngOnInit(): void {
    this.initForms();
    this.lecturaStorage();
    this.ColumnasTabla();
    this.ColumnasTablaProcesos();
    this.ColumnasTablaProcesosDiferencias();
  }

  initForms() {
    this.FormMateriaPrima = this.frmBuilderMateriaPrima.group({
      ot : ['', Validators.required],
    });
  }

  formatonumeros = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = '$1,';
    return number.toString().replace(exp,rep);
  }

  LimpiarCampos() {
    this.FormMateriaPrima.reset();
    this.ArrayMateriaPrima = [];
    this.valorTotal = 0;
    this.ArrayProcesos = [];
    this.ArrayProcesosDiferencias = [];
    this.totalPerdida = 0;
    this.totalPerdidaPorcentaje = 0;
    this.totalKgPedida = 0;
    this.precioOT = 0;
  }

  exportToExcel() : void {
    if (this.ArrayProcesosDiferencias.length == 0) Swal.fire("Para poder crear el archivo de Excel primero debe cargar la Orden de Trabajo en la tabla");
    else {
      let element = document.getElementById('table');
      const worksheet : XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);
      let element2 = document.getElementById('table2');
      const worksheet2 : XLSX.WorkSheet = XLSX.utils.table_to_sheet(element2);
      const book : XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(book, worksheet, 'Pagina 1');
      XLSX.utils.book_append_sheet(book, worksheet2, 'Pagina 2');
      XLSX.writeFile(book, this.name);
    }
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.storage.get('Id');
    this.storage_Nombre = this.storage.get('Nombre');
    this.ValidarRol = this.storage.get('Rol');
  }

  /* FUNCION PARA RELIZAR CONFIMACIÓN DE SALIDA */
  confimacionSalida(){
    Swal.fire({
      title: '¿Seguro que desea salir?',
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: 'Salir',
      denyButtonText: `No Salir`,
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) window.location.href = "./";
    })
  }

  //Funcion que consultara una materia prima con base a la que está seleccionada en la vista
  buscarMpSeleccionada(){

    this.ArrayMateriaPrima = [];
    this.valorTotal = 0;
    let nombreMateriaPrima : string = this.FormMateriaPrima.value.MpNombre;
    let idMateriaPrima : number; //En el HTML se pasará el nombre de la materia prima pero el input tendrá como valor el Id de la materia prima
    this.materiaPrimaSeleccionada = [];

    this.materiaPrimaService.srvObtenerLista().subscribe(datos_materiasPrimas => {
      for (let index = 0; index < datos_materiasPrimas.length; index++) {
        if (datos_materiasPrimas[index].matPri_Nombre == nombreMateriaPrima) {
          this.categoriMpService.srvObtenerListaPorId(datos_materiasPrimas[index].catMP_Id).subscribe(datos_categoria => {
            this.tipoBodegaService.srvObtenerListaPorId(datos_materiasPrimas[index].tpBod_Id).subscribe(datos_bodega => {
              this.materiaPrimaSeleccionada.push(datos_materiasPrimas[index]);
              this.categoriaMPSeleccionada = datos_categoria.catMP_Nombre;
              this.tipoBodegaMPSeleccionada = datos_bodega.tpBod_Nombre;
              this.cargarFormMpEnTablas(this.ArrayMateriaPrima, datos_materiasPrimas[index].matPri_Id, datos_materiasPrimas[index].matPri_Nombre, datos_materiasPrimas[index].matPri_Precio, datos_materiasPrimas[index].matPri_Stock, datos_materiasPrimas[index].undMed_Id)
            });
          });
        }
      }
    });
  }

  //Funcion que colocará el nombre a las columnas de la tabla en la cual se muestran los productos pedidos por los clientes
  ColumnasTabla(){
    this.titulosTabla = [];
    this.titulosTabla = [{
      oT : "OT",
      Cliente : "Cliente",
      Producto : "Producto",
      Materia_Prima : "Materia Prima",
      Proceso : "Proceso",
      mpCant : "Cant MP",
      valorMp : "Valor MP",
      porcentajeMp : "Porcentaje MP",
    }]
  }

  cargarFormMpEnTablas(formulario : any, id: number, nombre : string, precio : number, cantidad : number, undMEd : string){
    // let subtotalProd : number = precio * cantidad;

    // this.valorTotal = this.valorTotal + subtotalProd;

    // let productoExt : any = {
    //   Id : id,
    //   Nombre : nombre,
    //   Cant : cantidad,
    //   UndCant : undMEd,
    //   PrecioUnd : precio,
    //   SubTotal : subtotalProd
    // }

    // if (this.AccionBoton == "Agregar" && this.ArrayMateriaPrima.length == 0) {
    //   this.ArrayMateriaPrima.push(productoExt);

    // } else if (this.AccionBoton == "Agregar" && this.ArrayMateriaPrima.length != 0){
    //   this.ArrayMateriaPrima.push(productoExt);
    //   productoExt = [];
    // } else {
    //   for (let index = 0; index < formulario.length; index++) {
    //     if(productoExt.Id == this.ArrayMateriaPrima[index].Id) {
    //       this.ArrayMateriaPrima.splice(index, 1);
    //       this.ArrayMateriaPrima.push(productoExt);
    //       break;
    //     }
    //   }
    // }

    // this.ArrayMateriaPrima.sort((a,b)=> Number(a.Id) - Number(b.Id));
  }

  validarConsulta(){
    this.ArrayMateriaPrima = [];
    this.precioOT = 0;

    if (this.FormMateriaPrima.valid) {

    } else {
      this.materiaPrimaService.srvObtenerLista().subscribe(datos_materiasPrimas => {
        for (let index = 0; index < datos_materiasPrimas.length; index++) {
          const Toast = Swal.mixin({
            toast: true,
            position: 'center',
            showConfirmButton: false,
            timer: 1000,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.addEventListener('mouseenter', Swal.stopTimer)
              toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
          })

          Toast.fire({
            icon: 'success',
            title: 'Consulta exitosa'
          });
          // this.cargarFormMpEnTablas(this.ArrayMateriaPrima, datos_materiasPrimas[index].matPri_Id, datos_materiasPrimas[index].matPri_Nombre, datos_materiasPrimas[index].matPri_Precio, datos_materiasPrimas[index].matPri_Stock, datos_materiasPrimas[index].undMed_Id)
        }
      });
    }
  }

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

  ColumnasTablaProcesos(){
    this.titulosTablaprocesos = [];
    this.titulosTablaprocesos = [{
      ot : "Info",
      ext : "Extrusión",
      imp : "Impresión",
      rot : "Rotograbado",
      dbld : "Doblado",
      lam : "Laminado",
      emp : "Empaque",
      corte : "Corte",
      sel : "Sellado",
      wik : "Wiketiado",
    }]
  }

  ColumnasTablaProcesosDiferencias(){
    this.titulosTablaprocesosDiferencias = [];
    this.titulosTablaprocesosDiferencias = [{
      ot : "OT",
      ext_imp : "Extrusión a Impresión",
      imp_dbld : "Impresión a Doblado",
      dbld_rot : "Rotograbado a Doblado",
      dbld_sell : "Doblado a Sellado",
      total : "Totales",
    }]
  }

  //Funcin que se encargará de buscar una OT
  consultaOTBagPro(){
    let ot : number = this.FormMateriaPrima.value.ot;
    this.bagProServices.srvObtenerListaClienteOT_Item(ot).subscribe(datos_OT => {
      for (const item of datos_OT) {
        this.precioOT = item.datosvalorOt;
        this.clienteOT = item.clienteNom;
        this.margen = item.datosmargenKg;
        this.totalKgPedida = item.datosotKg;
        this.load = false;
        this.consultaProceso(ot);
      }
    });
  }

  consultaProceso(ot : number){
    let cantExtruida : number;
    let cantImpresa : number;
    let cantSellada : number;
    let cantDoblada : number;
    let cantRotograbada : number;
    let cantWiketiado : number;
    this.cantidadTotalExt = 0;
    this.cantidadTotalImp = 0;
    this.cantidadTotalDbl = 0;
    this.cantidadTotalRot = 0;
    this.cantidadTotalEmpaque = 0;
    this.cantidadTotalCorte = 0;
    this.cantidadTotalLaminado = 0;
    this.cantidadTotalSella = 0;
    this.cantidadTotalWiketiado = 0;
    this.desp_ext = 0;
    this.desp_imp = 0;
    this.desp_rot = 0;
    this.desp_dbld = 0;
    this.desp_sella = 0;
    this.desp_emp = 0;
    this.desp_corte = 0;
    this.desp_lam = 0;
    this.desp_wik = 0;

    this.bagProServices.srvObtenerListaProcExtOt(ot).subscribe(datos_procesos => {
      for (let index = 0; index < datos_procesos.length; index++) {
        if (datos_procesos[index].nomStatus == "EXTRUSION") {
          cantExtruida = datos_procesos[index].extnetokg;
          this.cantidadTotalExt = cantExtruida + this.cantidadTotalExt;
        } else if (datos_procesos[index].nomStatus == "IMPRESION") {
          cantImpresa = datos_procesos[index].extnetokg;
          this.cantidadTotalImp = cantImpresa + this.cantidadTotalImp;
        } else if (datos_procesos[index].nomStatus == "DOBLADO") {
          cantDoblada = datos_procesos[index].extnetokg;
          this.cantidadTotalDbl = cantDoblada + this.cantidadTotalDbl;
        } else if (datos_procesos[index].nomStatus == "ROTOGRABADO") {
          cantRotograbada = datos_procesos[index].extnetokg;
          this.cantidadTotalRot = cantRotograbada + this.cantidadTotalRot;
        } else if (datos_procesos[index].nomStatus == "EMPAQUE") {
          cantRotograbada = datos_procesos[index].extnetokg;
          this.cantidadTotalEmpaque = cantRotograbada + this.cantidadTotalEmpaque;
        } else if (datos_procesos[index].nomStatus == "CORTE") {
          cantRotograbada = datos_procesos[index].extnetokg;
          this.cantidadTotalCorte = cantRotograbada + this.cantidadTotalCorte;
        } else if (datos_procesos[index].nomStatus == "LAMINADO") {
          cantRotograbada = datos_procesos[index].extnetokg;
          this.cantidadTotalLaminado = cantRotograbada + this.cantidadTotalLaminado;
        }

        //DESPERDICIO
        else if (datos_procesos[index].nomStatus == "DESP_IMPRESION") {
          this.desp_imp = this.desp_imp + datos_procesos[index].extnetokg;
        } else if (datos_procesos[index].nomStatus == "DESP_ROTOGRABADO") {
          this.desp_rot = this.desp_rot + datos_procesos[index].extnetokg;
        } else if (datos_procesos[index].nomStatus == "DESP_DOBLADO") {
          this.desp_dbld = this.desp_dbld + datos_procesos[index].extnetokg;
        } else if (datos_procesos[index].nomStatus == "DESP_EMPAQUE") {
          this.desp_emp = this.desp_emp + datos_procesos[index].extnetokg;
        } else if (datos_procesos[index].nomStatus == "DESP_LAMINADO") {
          this.desp_lam = this.desp_lam + datos_procesos[index].extnetokg;
        } else if (datos_procesos[index].nomStatus == "DESP_CORTADORES") {
          this.desp_corte = this.desp_corte + datos_procesos[index].extnetokg;
        }
      }

      //DESPERDICIO EXTRUSION Y SELLADO
      this.bagProServices.srvObtenerListaDespercicios_Ot(ot).subscribe(datos_desperdicios => {
        for (let j = 0; j < datos_desperdicios.length; j++) {
          if (datos_desperdicios[j].nomStatus == "DESP_EXTRUSION") {
            this.desp_ext = this.desp_ext+ datos_desperdicios[j].extnetokg;
          } else if (datos_desperdicios[j].nomStatus == "DESP_SELLADO") {
            this.desp_sella = this.desp_sella + datos_desperdicios[j].extnetokg;
          }
        }
      });

      //SELLADO Y WIKETIADO
      this.bagProServices.srvObtenerListaProcSelladoOT(ot).subscribe(datos_selado => {
        for (let i = 0; i < datos_selado.length; i++) {
          if (datos_selado[i].nomStatus == "SELLADO") {
            cantSellada = datos_selado[i].peso;
            this.cantidadTotalSella = cantSellada + this.cantidadTotalSella;
          } else if (datos_selado[i].nomStatus == "Wiketiado") {
            cantWiketiado = datos_selado[i].peso;
            this.cantidadTotalWiketiado = cantWiketiado + this.cantidadTotalWiketiado;
          }
        }
        this.cantidadPorcPerdidaProcesoaProceso(ot);
      });
      this.cantidadMpAsignada(ot);
    });
  }

  //Funcion que calcula y guarda la cantidad de perdida que hubo de un proceso a otro
  cantidadPorcPerdidaProcesoaProceso(ot : any){
    this.ArrayProcesos = [];
    this.ArrayProcesosDiferencias = [];
    let diferenciaExt_Imp : number = 0;
    let difereciaExt_ImpPorcentaje : number = 0;

    let diferenciaImp_Dbld : number = 0;
    let difereciaImp_DbldPorcentaje : number = 0;

    let diferenciaDbld_Rot : number = 0;
    let difereciaDbld_RotPorcentaje : number = 0;

    let diferenciaDbld_Sell : number = 0;
    let difereciaDbld_SellPorcentaje : number = 0;

    if (this.cantidadTotalExt != 0 ) {
      if (this.cantidadTotalExt == 0 || this.cantidadTotalImp == 0) {
        diferenciaExt_Imp = this.cantidadTotalExt * this.cantidadTotalImp;
        difereciaExt_ImpPorcentaje = (diferenciaExt_Imp / this.cantidadTotalExt) * 100;
      } else {
        diferenciaExt_Imp = this.cantidadTotalExt - this.cantidadTotalImp;
        difereciaExt_ImpPorcentaje = (diferenciaExt_Imp / this.cantidadTotalExt) * 100;
      }

      if (this.cantidadTotalImp == 0 || this.cantidadTotalDbl == 0) {
        diferenciaImp_Dbld = this.cantidadTotalImp * this.cantidadTotalDbl;
        if (this.cantidadTotalImp == 0 && this.cantidadTotalDbl == 0) {
          difereciaImp_DbldPorcentaje = (diferenciaImp_Dbld / this.cantidadTotalExt) * 100;
        } else {
          if (this.cantidadTotalImp == 0) difereciaImp_DbldPorcentaje = (diferenciaImp_Dbld / this.cantidadTotalDbl) * 100;
          else difereciaImp_DbldPorcentaje = (diferenciaImp_Dbld / this.cantidadTotalImp) * 100;
        }
      } else {
        diferenciaImp_Dbld = this.cantidadTotalImp - this.cantidadTotalDbl;
        difereciaImp_DbldPorcentaje = (diferenciaImp_Dbld / this.cantidadTotalImp) * 100;
      }

      if (this.cantidadTotalRot == 0 || this.cantidadTotalDbl == 0) {
        diferenciaDbld_Rot = this.cantidadTotalDbl * this.cantidadTotalRot;
        if (this.cantidadTotalRot == 0 && this.cantidadTotalDbl == 0) {
          difereciaDbld_RotPorcentaje = (diferenciaDbld_Rot / this.cantidadTotalExt) * 100;
        } else {
          if (this.cantidadTotalRot == 0) difereciaDbld_RotPorcentaje = (diferenciaDbld_Rot / this.cantidadTotalDbl) * 100;
          else difereciaDbld_RotPorcentaje = (diferenciaDbld_Rot / this.cantidadTotalRot) * 100;
        }
      } else {
        diferenciaDbld_Rot = this.cantidadTotalDbl - this.cantidadTotalRot;
        difereciaDbld_RotPorcentaje = (diferenciaDbld_Rot / this.cantidadTotalRot) * 100;
      }

      if (this.cantidadTotalDbl == 0 || this.cantidadTotalSella == 0) {
        diferenciaDbld_Sell = this.cantidadTotalDbl * this.cantidadTotalSella;
        if (this.cantidadTotalDbl == 0 && this.cantidadTotalSella == 0) {
          difereciaDbld_SellPorcentaje = (diferenciaDbld_Sell / this.cantidadTotalExt) * 100;
        } else {
          if (this.cantidadTotalDbl == 0) difereciaDbld_SellPorcentaje = (diferenciaDbld_Sell / this.cantidadTotalSella) * 100;
          else difereciaDbld_SellPorcentaje = (diferenciaDbld_Sell / this.cantidadTotalDbl) * 100;
        }
      } else {
        diferenciaDbld_Sell = this.cantidadTotalDbl - this.cantidadTotalSella;
        difereciaDbld_SellPorcentaje = (diferenciaDbld_Sell / this.cantidadTotalDbl) * 100;
      }
    } else if (this.cantidadTotalImp != 0 ) {
      if (this.cantidadTotalExt == 0 || this.cantidadTotalImp == 0) {
        diferenciaExt_Imp = this.cantidadTotalExt * this.cantidadTotalImp;
        if (this.cantidadTotalExt == 0 && this.cantidadTotalImp == 0) {
          difereciaExt_ImpPorcentaje = (diferenciaImp_Dbld / this.cantidadTotalImp) * 100;
        } else {
          if (this.cantidadTotalExt == 0) difereciaExt_ImpPorcentaje = (diferenciaImp_Dbld / this.cantidadTotalImp) * 100;
          else difereciaExt_ImpPorcentaje = (diferenciaImp_Dbld / this.cantidadTotalExt) * 100;
        }
      } else {
        diferenciaExt_Imp = this.cantidadTotalExt - this.cantidadTotalImp;
        difereciaExt_ImpPorcentaje = (diferenciaExt_Imp / this.cantidadTotalExt) * 100;
      }

      if (this.cantidadTotalImp == 0 || this.cantidadTotalDbl == 0) {
        diferenciaImp_Dbld = this.cantidadTotalImp * this.cantidadTotalDbl;
        if (this.cantidadTotalImp == 0 && this.cantidadTotalDbl == 0) {
          difereciaImp_DbldPorcentaje = (diferenciaImp_Dbld / this.cantidadTotalImp) * 100;
        } else {
          if (this.cantidadTotalImp == 0) difereciaImp_DbldPorcentaje = (diferenciaImp_Dbld / this.cantidadTotalDbl) * 100;
          else difereciaImp_DbldPorcentaje = (diferenciaImp_Dbld / this.cantidadTotalImp) * 100;
        }
      } else {
        diferenciaImp_Dbld = this.cantidadTotalImp - this.cantidadTotalDbl;
        difereciaImp_DbldPorcentaje = (diferenciaImp_Dbld / this.cantidadTotalImp) * 100;
      }

      if (this.cantidadTotalRot == 0 || this.cantidadTotalDbl == 0) {
        diferenciaDbld_Rot = this.cantidadTotalDbl * this.cantidadTotalRot;
        if (this.cantidadTotalRot == 0 && this.cantidadTotalDbl == 0) {
          difereciaDbld_RotPorcentaje = (diferenciaDbld_Rot / this.cantidadTotalImp) * 100;
        } else {
          if (this.cantidadTotalRot == 0) difereciaDbld_RotPorcentaje = (diferenciaDbld_Rot / this.cantidadTotalImp) * 100;
          else difereciaDbld_RotPorcentaje = (diferenciaDbld_Rot / this.cantidadTotalRot) * 100;
        }
      } else {
        diferenciaDbld_Rot = this.cantidadTotalDbl - this.cantidadTotalRot;
        difereciaDbld_RotPorcentaje = (diferenciaDbld_Rot / this.cantidadTotalDbl) * 100;
      }

      if (this.cantidadTotalDbl == 0 || this.cantidadTotalSella == 0) {
        diferenciaDbld_Sell = this.cantidadTotalDbl * this.cantidadTotalSella;
        if (this.cantidadTotalDbl == 0 && this.cantidadTotalSella == 0) {
          difereciaDbld_SellPorcentaje = (diferenciaDbld_Sell / this.cantidadTotalImp) * 100;
        } else {
          if (this.cantidadTotalDbl == 0) difereciaDbld_SellPorcentaje = (diferenciaDbld_Sell / this.cantidadTotalImp) * 100;
          else difereciaDbld_SellPorcentaje = (diferenciaDbld_Sell / this.cantidadTotalDbl) * 100;
        }
      } else {
        diferenciaDbld_Sell = this.cantidadTotalDbl - this.cantidadTotalSella;
        difereciaDbld_SellPorcentaje = (diferenciaDbld_Sell / this.cantidadTotalDbl) * 100;
      }
    } else if (this.cantidadTotalDbl != 0 ) {
      if (this.cantidadTotalExt == 0 || this.cantidadTotalImp == 0) {
        diferenciaExt_Imp = this.cantidadTotalExt * this.cantidadTotalImp;
        if (this.cantidadTotalExt == 0 && this.cantidadTotalImp == 0) {
          difereciaExt_ImpPorcentaje = (diferenciaImp_Dbld / this.cantidadTotalDbl) * 100;
        } else {
          if (this.cantidadTotalExt == 0) difereciaExt_ImpPorcentaje = (diferenciaImp_Dbld / this.cantidadTotalImp) * 100;
          else difereciaExt_ImpPorcentaje = (diferenciaImp_Dbld / this.cantidadTotalExt) * 100;
        }
      } else {
        diferenciaExt_Imp = this.cantidadTotalExt - this.cantidadTotalImp;
        difereciaExt_ImpPorcentaje = (diferenciaExt_Imp / this.cantidadTotalExt) * 100;
      }

      if (this.cantidadTotalImp == 0 || this.cantidadTotalDbl == 0) {
        diferenciaImp_Dbld = this.cantidadTotalImp * this.cantidadTotalDbl;
        if (this.cantidadTotalImp == 0 && this.cantidadTotalDbl == 0) {
          difereciaImp_DbldPorcentaje = (diferenciaImp_Dbld / this.cantidadTotalDbl) * 100;
        } else {
          if (this.cantidadTotalImp == 0) difereciaImp_DbldPorcentaje = (diferenciaImp_Dbld / this.cantidadTotalDbl) * 100;
          else difereciaImp_DbldPorcentaje = (diferenciaImp_Dbld / this.cantidadTotalImp) * 100;
        }
      } else {
        diferenciaImp_Dbld = this.cantidadTotalImp - this.cantidadTotalDbl;
        difereciaImp_DbldPorcentaje = (diferenciaImp_Dbld / this.cantidadTotalImp) * 100;
      }

      if (this.cantidadTotalRot == 0 || this.cantidadTotalDbl == 0) {
        diferenciaDbld_Rot = this.cantidadTotalDbl * this.cantidadTotalRot;
        if (this.cantidadTotalRot == 0 && this.cantidadTotalDbl == 0) {
          difereciaDbld_RotPorcentaje = (diferenciaDbld_Rot / this.cantidadTotalDbl) * 100;
        } else {
          if (this.cantidadTotalRot == 0) difereciaDbld_RotPorcentaje = (diferenciaDbld_Rot / this.cantidadTotalImp) * 100;
          else difereciaDbld_RotPorcentaje = (diferenciaDbld_Rot / this.cantidadTotalRot) * 100;
        }
      } else {
        diferenciaDbld_Rot = this.cantidadTotalDbl - this.cantidadTotalRot;
        difereciaDbld_RotPorcentaje = (diferenciaDbld_Rot / this.cantidadTotalDbl) * 100;
      }

      if (this.cantidadTotalDbl == 0 || this.cantidadTotalSella == 0) {
        diferenciaDbld_Sell = this.cantidadTotalDbl * this.cantidadTotalSella;
        if (this.cantidadTotalDbl == 0 && this.cantidadTotalSella == 0) {
          difereciaDbld_SellPorcentaje = (diferenciaDbld_Sell / this.cantidadTotalDbl) * 100;
        } else {
          if (this.cantidadTotalDbl == 0) difereciaDbld_SellPorcentaje = (diferenciaDbld_Sell / this.cantidadTotalImp) * 100;
          else difereciaDbld_SellPorcentaje = (diferenciaDbld_Sell / this.cantidadTotalDbl) * 100;
        }
      } else {
        diferenciaDbld_Sell = this.cantidadTotalDbl - this.cantidadTotalSella;
        difereciaDbld_SellPorcentaje = (diferenciaDbld_Sell / this.cantidadTotalDbl) * 100;
      }
    } else if (this.cantidadTotalRot != 0 ) {
      if (this.cantidadTotalExt == 0 || this.cantidadTotalImp == 0) {
        diferenciaExt_Imp = this.cantidadTotalExt * this.cantidadTotalImp;
        if (this.cantidadTotalExt == 0 && this.cantidadTotalImp == 0) {
          difereciaExt_ImpPorcentaje = (diferenciaImp_Dbld / this.cantidadTotalRot) * 100;
        } else {
          if (this.cantidadTotalExt == 0) difereciaExt_ImpPorcentaje = (diferenciaImp_Dbld / this.cantidadTotalImp) * 100;
          else difereciaExt_ImpPorcentaje = (diferenciaImp_Dbld / this.cantidadTotalExt) * 100;
        }
      } else {
        diferenciaExt_Imp = this.cantidadTotalExt - this.cantidadTotalImp;
        difereciaExt_ImpPorcentaje = (diferenciaExt_Imp / this.cantidadTotalExt) * 100;
      }

      if (this.cantidadTotalImp == 0 || this.cantidadTotalDbl == 0) {
        diferenciaImp_Dbld = this.cantidadTotalImp * this.cantidadTotalDbl;
        if (this.cantidadTotalImp == 0 && this.cantidadTotalDbl == 0) {
          difereciaImp_DbldPorcentaje = (diferenciaImp_Dbld / this.cantidadTotalRot) * 100;
        } else {
          if (this.cantidadTotalImp == 0) difereciaImp_DbldPorcentaje = (diferenciaImp_Dbld / this.cantidadTotalDbl) * 100;
          else difereciaImp_DbldPorcentaje = (diferenciaImp_Dbld / this.cantidadTotalImp) * 100;
        }
      } else {
        diferenciaImp_Dbld = this.cantidadTotalImp - this.cantidadTotalDbl;
        difereciaImp_DbldPorcentaje = (diferenciaImp_Dbld / this.cantidadTotalImp) * 100;
      }

      if (this.cantidadTotalRot == 0 || this.cantidadTotalDbl == 0) {
        diferenciaDbld_Rot = this.cantidadTotalDbl * this.cantidadTotalRot;
        if (this.cantidadTotalRot == 0 && this.cantidadTotalDbl == 0) {
          difereciaDbld_RotPorcentaje = (diferenciaDbld_Rot / this.cantidadTotalRot) * 100;
        } else {
          if (this.cantidadTotalImp == 0) difereciaImp_DbldPorcentaje = (diferenciaImp_Dbld / this.cantidadTotalDbl) * 100;
          else difereciaImp_DbldPorcentaje = (diferenciaImp_Dbld / this.cantidadTotalImp) * 100;
        }
      } else {
        diferenciaDbld_Rot = this.cantidadTotalDbl - this.cantidadTotalRot;
        difereciaDbld_RotPorcentaje = (diferenciaDbld_Rot / this.cantidadTotalDbl) * 100;
      }

      if (this.cantidadTotalDbl == 0 || this.cantidadTotalSella == 0) {
        diferenciaDbld_Sell = this.cantidadTotalDbl * this.cantidadTotalSella;
        if (this.cantidadTotalDbl == 0 && this.cantidadTotalSella == 0) {
          difereciaDbld_SellPorcentaje = (diferenciaDbld_Sell / this.cantidadTotalRot) * 100;
        } else {
          if (this.cantidadTotalDbl == 0) difereciaDbld_SellPorcentaje = (diferenciaDbld_Sell / this.cantidadTotalImp) * 100;
          else difereciaDbld_SellPorcentaje = (diferenciaDbld_Sell / this.cantidadTotalDbl) * 100;
        }
      } else {
        diferenciaDbld_Sell = this.cantidadTotalDbl - this.cantidadTotalSella;
        difereciaDbld_SellPorcentaje = (diferenciaDbld_Sell / this.cantidadTotalDbl) * 100;
      }
    } else if (this.cantidadTotalSella != 0 ) {
      if (this.cantidadTotalExt == 0 || this.cantidadTotalImp == 0) {
        diferenciaExt_Imp = this.cantidadTotalExt * this.cantidadTotalImp;
        if (this.cantidadTotalExt == 0 && this.cantidadTotalImp == 0) {
          difereciaImp_DbldPorcentaje = (diferenciaImp_Dbld / this.cantidadTotalSella) * 100;
        } else {
          if (this.cantidadTotalExt == 0) difereciaExt_ImpPorcentaje = (diferenciaImp_Dbld / this.cantidadTotalImp) * 100;
          else difereciaExt_ImpPorcentaje = (diferenciaImp_Dbld / this.cantidadTotalExt) * 100;
        }
      } else {
        diferenciaExt_Imp = this.cantidadTotalExt - this.cantidadTotalImp;
        difereciaExt_ImpPorcentaje = (diferenciaExt_Imp / this.cantidadTotalExt) * 100;
      }

      if (this.cantidadTotalImp == 0 || this.cantidadTotalDbl == 0) {
        diferenciaImp_Dbld = this.cantidadTotalImp * this.cantidadTotalDbl;
        if (this.cantidadTotalImp == 0 && this.cantidadTotalDbl == 0) {
          difereciaImp_DbldPorcentaje = (diferenciaImp_Dbld / this.cantidadTotalSella) * 100;
        } else {
          if (this.cantidadTotalImp == 0) difereciaImp_DbldPorcentaje = (diferenciaImp_Dbld / this.cantidadTotalDbl) * 100;
          else difereciaImp_DbldPorcentaje = (diferenciaImp_Dbld / this.cantidadTotalImp) * 100;
        }
      } else {
        diferenciaImp_Dbld = this.cantidadTotalImp - this.cantidadTotalDbl;
        difereciaImp_DbldPorcentaje = (diferenciaImp_Dbld / this.cantidadTotalImp) * 100;
      }

      if (this.cantidadTotalRot == 0 || this.cantidadTotalDbl == 0) {
        diferenciaDbld_Rot = this.cantidadTotalDbl * this.cantidadTotalRot;
        if (this.cantidadTotalRot == 0 && this.cantidadTotalDbl == 0) {
          difereciaDbld_RotPorcentaje = (diferenciaDbld_Rot / this.cantidadTotalSella) * 100;
        } else {
          if (this.cantidadTotalImp == 0) difereciaImp_DbldPorcentaje = (diferenciaImp_Dbld / this.cantidadTotalDbl) * 100;
          else difereciaImp_DbldPorcentaje = (diferenciaImp_Dbld / this.cantidadTotalImp) * 100;
        }
      } else {
        diferenciaDbld_Rot = this.cantidadTotalDbl - this.cantidadTotalRot;
        difereciaDbld_RotPorcentaje = (diferenciaDbld_Rot / this.cantidadTotalDbl) * 100;
      }

      if (this.cantidadTotalDbl == 0 || this.cantidadTotalSella == 0) {
        diferenciaDbld_Sell = this.cantidadTotalDbl * this.cantidadTotalSella;
        if (this.cantidadTotalDbl == 0 && this.cantidadTotalSella == 0) {
          difereciaDbld_SellPorcentaje = (diferenciaDbld_Sell / this.cantidadTotalSella) * 100;
        } else {
          if (this.cantidadTotalDbl == 0) difereciaDbld_SellPorcentaje = (diferenciaDbld_Sell / this.cantidadTotalImp) * 100;
          else difereciaDbld_SellPorcentaje = (diferenciaDbld_Sell / this.cantidadTotalDbl) * 100;
        }
      } else {
        diferenciaDbld_Sell = this.cantidadTotalDbl - this.cantidadTotalSella;
        difereciaDbld_SellPorcentaje = (diferenciaDbld_Sell / this.cantidadTotalDbl) * 100;
      }
    }

    this.totalPerdida = diferenciaExt_Imp + diferenciaImp_Dbld + difereciaDbld_RotPorcentaje + diferenciaDbld_Sell;
    this.totalPerdidaPorcentaje = difereciaExt_ImpPorcentaje + difereciaImp_DbldPorcentaje + difereciaDbld_RotPorcentaje + difereciaDbld_SellPorcentaje;

    let total : number = this.cantidadTotalExt - this.cantidadTotalSella;
    let pocentaje : number = (total / this.cantidadTotalExt) * 100;


    const cant : any = {
      ot : 'Cantidad Hecha',
      ext : this.cantidadTotalExt,
      imp : this.cantidadTotalImp,
      rot : this.cantidadTotalRot,
      dbld : this.cantidadTotalDbl,
      lam : this.cantidadTotalLaminado,
      emp : this.cantidadTotalEmpaque,
      corte : this.cantidadTotalCorte,
      sel : this.cantidadTotalSella,
      wik : this.cantidadTotalWiketiado,
    }

    this.ArrayProcesos.push(cant);

    const desperdicios : any = {
      ot : 'DESPERDICIO',
      ext : this.desp_ext,
      imp : this.desp_imp,
      rot : this.desp_rot,
      dbld : this.desp_dbld,
      lam : this.desp_lam,
      emp : this.desp_emp,
      corte : this.desp_corte,
      sel : this.desp_sella,
      wik : this.desp_wik,
    }

    this.ArrayProcesos.push(desperdicios);

    const diferencias : any = {
      ot : ot,
      ext_imp : diferenciaExt_Imp,
      imp_dbld : diferenciaImp_Dbld,
      dbld_rot : diferenciaDbld_Rot,
      dbld_sell : diferenciaDbld_Sell,
      total : total,
    }

    this.ArrayProcesosDiferencias.push(diferencias);

    const diferenciasPorc : any = {
      ot : '',
      ext_imp : difereciaExt_ImpPorcentaje,
      imp_dbld : difereciaImp_DbldPorcentaje,
      dbld_rot : difereciaDbld_RotPorcentaje,
      dbld_sell : difereciaDbld_SellPorcentaje,
      total : pocentaje,
    }

    this.ArrayProcesosDiferencias.push(diferenciasPorc);
  }

  cantidadMpAsignada(ot : number){
    let cantTotalAsignadaExt : number = 0;
    let cantTotalAsignadaImp : number = 0;
    let cantTotalAsignadaDbld : number = 0;
    let cantTotalAsignadaSellado : number = 0;
    let cantTotalAsignadaCorte : number = 0;
    let cantTotalAsignadaRot : number = 0;
    let cantTotalAsignadaEmpaque : number = 0;
    let cantTotalAsignadaLaminado : number = 0;
    let cantTotalAsignadaWiketiado : number = 0;

    this.asignacionMPService.srvObtenerListaPorOt(ot).subscribe(datos_asignacion => {
      for (let asg = 0; asg < datos_asignacion.length; asg++) {
        this.detallesAsignacionService.srvObtenerListaPorAsigId(datos_asignacion[asg].asigMp_Id).subscribe(datos_detallesAsignacion => {
          for (let index = 0; index < datos_detallesAsignacion.length; index++) {
            if (datos_detallesAsignacion[index].proceso_Id == 'EXT' && datos_detallesAsignacion[index].asigMp_Id == datos_asignacion[asg].asigMp_Id) {
              cantTotalAsignadaExt = cantTotalAsignadaExt + datos_detallesAsignacion[index].dtAsigMp_Cantidad
            } else if (datos_detallesAsignacion[index].proceso_Id == 'IMP' && datos_detallesAsignacion[index].asigMp_Id == datos_asignacion[asg].asigMp_Id) {
              cantTotalAsignadaImp = cantTotalAsignadaImp + datos_detallesAsignacion[index].dtAsigMp_Cantidad
            } else if (datos_detallesAsignacion[index].proceso_Id == 'SELLA' && datos_detallesAsignacion[index].asigMp_Id == datos_asignacion[asg].asigMp_Id) {
              cantTotalAsignadaSellado = cantTotalAsignadaSellado + datos_detallesAsignacion[index].dtAsigMp_Cantidad
            } else if (datos_detallesAsignacion[index].proceso_Id == 'ROT' && datos_detallesAsignacion[index].asigMp_Id == datos_asignacion[asg].asigMp_Id) {
              cantTotalAsignadaRot = cantTotalAsignadaRot + datos_detallesAsignacion[index].dtAsigMp_Cantidad
            } else if (datos_detallesAsignacion[index].proceso_Id == 'DBLD' && datos_detallesAsignacion[index].asigMp_Id == datos_asignacion[asg].asigMp_Id) {
              cantTotalAsignadaDbld = cantTotalAsignadaDbld + datos_detallesAsignacion[index].dtAsigMp_Cantidad
            } else if (datos_detallesAsignacion[index].proceso_Id == 'CORTE' && datos_detallesAsignacion[index].asigMp_Id == datos_asignacion[asg].asigMp_Id) {
              cantTotalAsignadaCorte = cantTotalAsignadaCorte + datos_detallesAsignacion[index].dtAsigMp_Cantidad
            } else if (datos_detallesAsignacion[index].proceso_Id == 'EMP' && datos_detallesAsignacion[index].asigMp_Id == datos_asignacion[asg].asigMp_Id) {
              cantTotalAsignadaEmpaque = cantTotalAsignadaEmpaque + datos_detallesAsignacion[index].dtAsigMp_Cantidad
            } else if (datos_detallesAsignacion[index].proceso_Id == 'LAM' && datos_detallesAsignacion[index].asigMp_Id == datos_asignacion[asg].asigMp_Id) {
              cantTotalAsignadaLaminado = cantTotalAsignadaLaminado + datos_detallesAsignacion[index].dtAsigMp_Cantidad
            } else if (datos_detallesAsignacion[index].proceso_Id == 'WIKE' && datos_detallesAsignacion[index].asigMp_Id == datos_asignacion[asg].asigMp_Id) {
              cantTotalAsignadaWiketiado = cantTotalAsignadaWiketiado + datos_detallesAsignacion[index].dtAsigMp_Cantidad
            }
          }
        });
      }
      setTimeout(() => {
        const cant : any = {
          ot : 'Cantidad KG Asignada',
          ext : cantTotalAsignadaExt,
          imp : cantTotalAsignadaImp,
          rot : cantTotalAsignadaRot,
          dbld : cantTotalAsignadaDbld,
          lam : cantTotalAsignadaLaminado,
          emp : cantTotalAsignadaEmpaque,
          corte : cantTotalAsignadaCorte,
          sel : cantTotalAsignadaSellado,
          wik : cantTotalAsignadaWiketiado,
        }

        this.ArrayProcesos.push(cant);
        this.calcularPorcentajePerdida(cantTotalAsignadaExt,
          cantTotalAsignadaImp,
          cantTotalAsignadaDbld,
          cantTotalAsignadaSellado,
          cantTotalAsignadaCorte,
          cantTotalAsignadaRot,
          cantTotalAsignadaEmpaque,
          cantTotalAsignadaLaminado,
          cantTotalAsignadaWiketiado);
        this.load = true;
      }, 1000);
    });
  }

  calcularPorcentajePerdida(cantTotalAsignadaExt : number,
    cantTotalAsignadaImp : number,
    cantTotalAsignadaDbld : number,
    cantTotalAsignadaSellado : number,
    cantTotalAsignadaCorte : number,
    cantTotalAsignadaRot : number,
    cantTotalAsignadaEmpaque : number,
    cantTotalAsignadaLaminado : number,
    cantTotalAsignadaWiketiado : number){


      //Calcula la cantidad de materi prima que se perdio haciendo la orden de trabajo
      let porcentaje_perdidaExt : number = 0;
      let porcentaje_perdidaImp : number = 0;
      let porcentaje_perdidaRot : number = 0;
      let porcentaje_perdidaSell : number = 0;
      let porcentaje_perdidaDbld : number = 0;
      let porcentaje_perdidaEmp : number = 0;
      let porcentaje_perdidaLam : number = 0;
      let porcentaje_perdidaWik : number = 0;
      let porcentaje_perdidaCorte : number = 0;

      let perdidaExt : number = this.cantidadTotalExt - cantTotalAsignadaExt;

      porcentaje_perdidaExt = ((perdidaExt * 100) / cantTotalAsignadaExt);
      porcentaje_perdidaImp = ((this.cantidadTotalImp * 100) / cantTotalAsignadaImp);
      porcentaje_perdidaDbld = ((this.cantidadTotalDbl * 100) / cantTotalAsignadaDbld);
      porcentaje_perdidaSell = ((this.cantidadTotalSella * 100) / cantTotalAsignadaSellado);
      porcentaje_perdidaRot = ((this.cantidadTotalRot * 100) / cantTotalAsignadaRot);
      porcentaje_perdidaCorte = ((this.cantidadTotalCorte * 100) / cantTotalAsignadaCorte);
      porcentaje_perdidaEmp = ((this.cantidadTotalEmpaque * 100) / cantTotalAsignadaEmpaque);
      porcentaje_perdidaLam = ((this.cantidadTotalLaminado * 100) / cantTotalAsignadaLaminado);
      porcentaje_perdidaWik = ((this.cantidadTotalWiketiado * 100) / cantTotalAsignadaWiketiado);
      console.log(porcentaje_perdidaExt);
      this.porcentajeTotal

  }

  buildTableBody(data, columns) {
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

  tableAsignacion(data, columns) {
    return {
        table: {
          headerRows: 1,
          widths: ['*', '*', '*', '*'],
          body: this.buildTableBody(data, columns),
        },
        fontSize: 9,
        layout: {
          fillColor: function (rowIndex, node, columnIndex) {
            return (rowIndex == 0) ? '#CCCCCC' : null;
          }
        }
    };
  }

  mpAsignada (tipo : string){
    this.ArrayMateriaPrima = [];
    let ot : number = this.FormMateriaPrima.value.ot;
    if (tipo == 'Cantidad KG Asignada') {
      this.asignacionMPService.srvObtenerListaPorOt(ot).subscribe(datos_asignacion => {
        for (let i = 0; i < datos_asignacion.length; i++) {
          this.detallesAsignacionService.srvObtenerListaPorAsigId(datos_asignacion[i].asigMp_Id).subscribe(datos_asignacionMP => {
            for (let j = 0; j < datos_asignacionMP.length; j++) {
              this.materiaPrimaService.srvObtenerListaPorId(datos_asignacionMP[j].matPri_Id).subscribe(datos_materiaPrima => {
                const mpFactura : any = {
                  Id : datos_materiaPrima.matPri_Id,
                  Nombre : datos_materiaPrima.matPri_Nombre,
                  Cant : this.formatonumeros(datos_asignacionMP[j].dtAsigMp_Cantidad),
                  UndCant : datos_asignacionMP[j].undMed_Id,
                  Stock : datos_materiaPrima.matPri_Stock,
                  UndStock : datos_materiaPrima.undMed_Id,
                  PrecioUnd : '',
                  SubTotal : '',
                }
                this.ArrayMateriaPrima.push(mpFactura);
              });
            }
          });
          this.llenarPDFConBD(datos_asignacion[i])
          break;
        }
      });
    }
  }

  llenarPDFConBD(formulario : any){
    let id : number = formulario.asigMp_Id;
    let remisionFactura = [];

    this.asignacionMPService.srvObtenerListaPorId(id).subscribe(datos_asignacion => {
      this.detallesAsignacionService.srvObtenerLista().subscribe(datos_asignacionMP => {
        for (let index = 0; index < datos_asignacionMP.length; index++) {
          if (id === datos_asignacionMP[index].asigMp_Id) {
            this.usuarioService.srvObtenerListaPorId(datos_asignacion.usua_Id).subscribe(datos_usuario => {
              for (let mp = 0; mp < this.ArrayMateriaPrima.length; mp++) {
                let FechaEntregaDatetime = datos_asignacion.asigMp_FechaEntrega;
                let FechaEntregaNueva = FechaEntregaDatetime.indexOf("T");
                let fecharegistroFinal = FechaEntregaDatetime.substring(0, FechaEntregaNueva);
                const pdfDefinicion : any = {
                  info: {
                    title: `${datos_asignacion.asigMp_Id}`
                  },
                  content : [
                    {
                      text: `Plasticaribe S.A.S ---- Asignación de Materia Prima`,
                      alignment: 'center',
                      style: 'titulo',
                    },
                    '\n \n',
                    {
                      text: `Fecha de registro: ${fecharegistroFinal}`,
                      style: 'header',
                      alignment: 'right',
                    },
                    {
                      text: `Registrado Por: ${datos_usuario.usua_Nombre}\n`,
                      alignment: 'right',
                      style: 'header',
                    },
                    {
                      text: `\n Información la Asignación \n \n`,
                      alignment: 'center',
                      style: 'header'
                    },
                    {
                      style: 'tablaCliente',
                      table: {
                        widths: ['*', '*', '*'],
                        style: 'header',
                        body: [
                          [
                            `OT: ${datos_asignacion.asigMP_OrdenTrabajo}`,
                            `Maquina: ${datos_asignacion.asigMp_Maquina}`,
                            `Proceso : ${datos_asignacionMP[index].proceso_Id}`
                          ]
                        ]
                      },
                      layout: 'lightHorizontalLines',
                      fontSize: 12,
                    },
                    {
                      text: `\n \nObervación sobre la remisión: \n ${datos_asignacion.asigMp_Observacion}\n`,
                      style: 'header',
                    },
                    {
                      text: `\n Información detallada de Materia(s) Prima(s) asignada(s) \n `,
                      alignment: 'center',
                      style: 'header'
                    },

                    this.tableAsignacion(this.ArrayMateriaPrima, ['Id', 'Nombre', 'Cant', 'UndCant']),
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
                break;
              }
            });
          }else continue;
          break;
        }
      })
    });


  }

}
