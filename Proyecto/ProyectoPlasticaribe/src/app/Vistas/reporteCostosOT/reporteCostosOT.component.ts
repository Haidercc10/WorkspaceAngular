import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BagproService } from 'src/app/Servicios/Bagpro.service';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { RolesService } from 'src/app/Servicios/roles.service';
import Swal from 'sweetalert2';
import { AsignacionMPService } from 'src/app/Servicios/asignacionMP.service';
import { DetallesAsignacionService } from 'src/app/Servicios/detallesAsignacion.service';
import { MateriaPrimaService } from 'src/app/Servicios/materiaPrima.service';
import { info } from 'console';
import pdfMake from 'pdfmake/build/pdfmake';

@Component({
  selector: 'app-reporteCostosOT',
  templateUrl: './reporteCostosOT.component.html',
  styleUrls: ['./reporteCostosOT.component.css']
})
export class ReporteCostosOTComponent implements OnInit {

  public infoOT !: FormGroup;
  public load: boolean;

  /* Vaiables*/
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  titulosTabla : any; //Variable que tendrá los titulos de la tabla de materia prima
  ArrayMateriaPrima = []; //Variable quetendrá la información de la materia prima que se asignó en la ot consultada
  ArrayMateriaPrima2 = [];
  totalMPEntregada : number = 0; //Variable que servirá pra almacenar el total de materia prima que se entregó en una OT
  ValorMPEntregada : number = 0; //Variable que almacenará el valor total de la materia entregada a una OT
  titulosTablaprocesos = []; // Variable que almacenará los titulos de la tabla en la que saldrán cada uno de los procesos
  ArrayProcesos = []; //Variable que almacenará la informacion de la cantidad en kg que se hizo en cada proceso
  cantidadTotalExt : number = 0; //Variable que va a almacenar el total de la cantidad extruida en una OT
  cantidadTotalImp : number = 0; //Variable que va a almacenar el total de la cantidad impresa en una OT
  cantidadTotalDbl : number = 0; //Variable que va a almacenar el total de la cantidad doblada en una OT
  cantidadTotalRot : number = 0; //Variable que va a almacenar el total de la cantidad Rotograbado en una OT
  cantidadTotalSella : number = 0; //Variable que va a almacenar el total de la cantidad sellada en una OT
  cantidadTotalEmpaque : number = 0; //Variable que va a almacenar el total de la cantidad empacada en una OT
  cantidadTotalCorte : number = 0; //Variable que va a almacenar el total de la cantidad cortada en una OT
  cantidadTotalLaminado : number = 0; //Variable que va a almacenar el total de la cantidad cantidad Total Laminado en una OT
  cantidadTotalWiketiado : number = 0; //Variable que va a almacenar el total de la cantidad cantidad Tota wiketeada en una OT
  valorFinalOT : number = 0; // Variable que almacenará el valor final que tendrá la ot consultada
  diferencia : number = 0; //Variable que servirá para almacenar la diferencia de el valor final de la ot y el valor estimado o inicial
  diferenciaPorcentaje : number = 0; //Variable que servirá para almacenar la diferencia en porcentaje de el valor final de la ot y el valor estimado o inicial
  cantidadSellandoUnidad : number = 0; //Varibale que calculará la cantidad total de unidades selladas, esto se en caso de que la presentación del producto sea en unidad

  // Variables globlales que almacenarán la informacion general de la orden de trabajo que se mostrará en el PDF
  ordenTrabajo : number;
  NombreCliente : string;
  idProducto : number;
  nombreProducto : string;
  cantProdSinMargenUnd : number;
  cantProdSinMargenKg : number;
  CantidadMargen : number;
  cantProdConMargenKg : number;
  presentacionProducto : string;
  valorUnitarioProdUnd : number;
  valorUnitarioProdKg : number;
  valorEstimadoOT : number;

  constructor( private frmBuilderMateriaPrima : FormBuilder,
                private bagProServices : BagproService,
                  @Inject(SESSION_STORAGE) private storage: WebStorageService,
                    private rolService : RolesService,
                      private asignacionMPService : AsignacionMPService,
                        private detallesAsignacionService : DetallesAsignacionService,
                          private materiaPrimaService : MateriaPrimaService,) {


    this.infoOT = this.frmBuilderMateriaPrima.group({
      ot : ['',Validators.required],
      cliente : ['',Validators.required],
      IdProducto : ['',Validators.required],
      NombreProducto : ['', Validators.required],
      cantProductoSinMargenUnd : ['', Validators.required],
      cantProductoSinMargenKg : ['', Validators.required],
      margenAdicional : ['', Validators.required],
      cantProductoConMargen : ['', Validators.required],
      PresentacionProducto : ['', Validators.required],
      ValorUnidadProductoUnd : ['', Validators.required],
      ValorUnidadProductoKg : ['', Validators.required],
      ValorEstimadoOt : ['', Validators.required],
    });

    this.load = true;
  }

  ngOnInit() {
    this.lecturaStorage();
    this.ColumnasTabla();
    this.ColumnasTablaProcesos();
  }

  limpiarCampos(){
    this.infoOT.reset();
    this.cantidadTotalExt = 0;
    this.cantidadTotalImp = 0;
    this.cantidadTotalDbl = 0;
    this.cantidadTotalRot = 0;
    this.cantidadTotalEmpaque = 0;
    this.cantidadTotalCorte = 0;
    this.cantidadTotalLaminado = 0;
    this.cantidadTotalSella = 0;
    this.cantidadTotalWiketiado = 0;
    this.ArrayProcesos = [];
    this.valorFinalOT = 0;
    this.ArrayMateriaPrima = [];
    this.totalMPEntregada = 0;
    this.ValorMPEntregada = 0;
    this.diferencia = 0;
    this.diferenciaPorcentaje = 0;
    this.ordenTrabajo = 0;
    this.NombreCliente = '';
    this.idProducto = 0;
    this.nombreProducto = '';
    this.cantProdSinMargenUnd = 0;
    this.cantProdSinMargenKg = 0;
    this.CantidadMargen = 0;
    this.cantProdConMargenKg = 0;
    this.presentacionProducto = '';
    this.valorUnitarioProdUnd = 0;
    this.valorUnitarioProdKg = 0;
    this.valorEstimadoOT = 0;
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

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = '$1,';
    return number.toString().replace(exp,rep);
  }

  // Funcion que llenará el Array de los titulos de la tabla de materia prima
  ColumnasTabla(){
    this.titulosTabla = [];
    this.titulosTabla = [{
      mpId : "Id",
      mpNombre : "Nombre",
      mpCantidad : "Cantidad",
      mpUndMedCant : "Presentación",
      mpPrecioU : "Precio U",
      mpSubTotal : "SubTotal",
      mpProceso : "Proceso"
    }]
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

  consultaOTBagPro(){
    this.load = false;

    let ot : number = this.infoOT.value.ot;
    let porcentajeMargen : number = 0;
    this.bagProServices.srvObtenerListaClienteOT_ItemCostos(ot).subscribe(datos_OT => {
      for (const item of datos_OT) {
        porcentajeMargen = (item.datosmargenKg / item.datoscantKg) * 100;

        this.ordenTrabajo = ot;
        this.NombreCliente = item.clienteNom;
        this.idProducto = item.clienteItems;
        this.nombreProducto = item.clienteItemsNom;
        this.cantProdSinMargenUnd = item.datoscantBolsa;
        this.cantProdSinMargenKg = item.datoscantKg;
        this.CantidadMargen = Math.round(porcentajeMargen);
        this.cantProdConMargenKg = item.datosotKg;
        this.presentacionProducto = item.ptPresentacionNom;
        this.valorUnitarioProdUnd = item.datosvalorBolsa;
        this.valorUnitarioProdKg = item.datosValorKg;
        this.valorEstimadoOT = Math.round(item.datosvalorOt);

        this.infoOT.setValue({
          ot : ot,
          cliente : item.clienteNom,
          IdProducto : item.clienteItems,
          NombreProducto : item.clienteItemsNom,
          cantProductoSinMargenUnd : item.datoscantBolsa,
          cantProductoSinMargenKg : item.datoscantKg,
          margenAdicional : Math.round(porcentajeMargen) + "%",
          cantProductoConMargen : this.formatonumeros(item.datosotKg),
          PresentacionProducto : item.ptPresentacionNom,
          ValorUnidadProductoUnd : this.formatonumeros(item.datosvalorBolsa),
          ValorUnidadProductoKg : this.formatonumeros(item.datosValorKg),
          ValorEstimadoOt : this.formatonumeros(item.datosvalorOt),
        });
        this.detallesAsignacionService.srvObtenerListaPorOT(ot).subscribe(datos_asignacionMP => {
          if (datos_asignacionMP.length == 0) Swal.fire(`La OT N° ${ot} no tiene asignaciones registradas`)
          else{
            for (let j = 0; j < datos_asignacionMP.length; j++) {
              this.llenarTablaMP(datos_asignacionMP[j]);
            }
          }
        });
        break;
      }
    });
    this.consultaProceso(ot);
  }

  // Funcion en la que se consultaran los procesos de por los que ha pasado la orden de trabajo y calculará el total de kg o unidades que se hizo en cada uno
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
      }
      //SELLADO Y WIKETIADO
      this.bagProServices.srvObtenerListaProcSelladoOT(ot).subscribe(datos_selado => {
        for (let i = 0; i < datos_selado.length; i++) {
          if (datos_selado[i].nomStatus == "SELLADO") {
            cantSellada = datos_selado[i].peso;
            this.cantidadTotalSella = cantSellada + this.cantidadTotalSella;
            this.cantidadSellandoUnidad = this.cantidadSellandoUnidad + datos_selado[i].qty;
          } else if (datos_selado[i].nomStatus == "Wiketiado") {
            cantWiketiado = datos_selado[i].peso;
            this.cantidadTotalWiketiado = cantWiketiado + this.cantidadTotalWiketiado;
          }
        }
        this.cantidadPorcPerdidaProcesoaProceso(ot);
      });
    });
  }

  //Funcion que calcula y guarda la cantidad de perdida que hubo de un proceso a otro
  cantidadPorcPerdidaProcesoaProceso(ot : any){
    this.ArrayProcesos = [];
    this.valorFinalOT = 0;
    this.diferencia = 0;
    this.diferenciaPorcentaje = 0;
    const cant : any = {
      Ot : ot,
      Ext : Math.round(this.cantidadTotalExt),
      Imp : Math.round(this.cantidadTotalImp),
      Rot : Math.round(this.cantidadTotalRot),
      Dbld : Math.round(this.cantidadTotalDbl),
      Lam : Math.round(this.cantidadTotalLaminado),
      Emp : Math.round(this.cantidadTotalEmpaque),
      Corte : Math.round(this.cantidadTotalCorte),
      Sel : Math.round(this.cantidadTotalSella),
      Wik : Math.round(this.cantidadTotalWiketiado),
    }
    this.ArrayProcesos.push(cant);
    for (const item of this.ArrayProcesos) {
      if (item.Sel == 0 && item.Corte != 0) {
        if (this.presentacionProducto == 'Kilo') this.valorFinalOT = item.Corte * this.valorUnitarioProdKg;
        else if (this.presentacionProducto == 'Unidad' || this.presentacionProducto == 'Rollo' || this.presentacionProducto == 'Paquete') {
          this.valorFinalOT = item.Corte * this.valorUnitarioProdUnd;
        }
      } else if (item.Sel != 0 && item.Corte == 0) {
        if (this.presentacionProducto == 'Kilo') this.valorFinalOT = item.Sel * this.valorUnitarioProdKg;
        else if (this.presentacionProducto == 'Unidad' || this.presentacionProducto == 'Rollo'|| this.presentacionProducto == 'Paquete') {
          this.valorFinalOT = this.cantidadSellandoUnidad * this.valorUnitarioProdUnd;
        }
      }
    }
    this.diferencia = this.valorFinalOT - this.ValorMPEntregada;
    Math.round(this.diferenciaPorcentaje = (this.diferencia / this.valorEstimadoOT) * 100);
    this.load = true;
  }

  llenarTablaMP(formulario : any){
    this.ArrayMateriaPrima = [];
    this.totalMPEntregada = 0;
    this.ValorMPEntregada = 0;

    this.materiaPrimaService.srvObtenerListaPorId(formulario.matPri_Id).subscribe(datos_materiaPrima => {
      const infoDoc : any = {
        Id : datos_materiaPrima.matPri_Id,
        Nombre : datos_materiaPrima.matPri_Nombre,
        Cantidad : formulario.sum,
        Presentacion : datos_materiaPrima.undMed_Id,
        PrecioUnd : this.formatonumeros(datos_materiaPrima.matPri_Precio),
        SubTotal : this.formatonumeros(Math.round(formulario.sum * datos_materiaPrima.matPri_Precio)),
        Proceso : formulario.proceso_Nombre,
      }

      this.totalMPEntregada = this.totalMPEntregada + infoDoc.Cantidad;
      this.ValorMPEntregada = this.ValorMPEntregada + (formulario.sum * datos_materiaPrima.matPri_Precio);
      this.ArrayMateriaPrima.push(infoDoc);
      this.ArrayMateriaPrima.sort((a,b) => a.Nombre.localeCompare(b.Nombre));
    });
    this.load = true;
  }

  // funcion que se encagará de llenar la tabla de los productos en el pdf
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

  // Funcion que genera la tabla donde se mostrará la información de los productos pedidos
  table(data, columns) {
    return {
        table: {
          headerRows: 1,
          widths: [20, 185, 40, 60, 50, 60, 40],
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

  CargarPDF(){
    if (this.ArrayMateriaPrima.length == 0) Swal.fire("Debe buscar una OT para crear el reporte")
    else {
      for (let i = 0; i < this.ArrayMateriaPrima.length; i++) {
        const pdfDefinicion : any = {
          info: {
            title: `${this.ordenTrabajo}`
          },
          content : [
            {
              text: `Plasticaribe S.A.S ---- Reporte de Orden de Trabajo`,
              alignment: 'center',
              style: 'titulo',
            },
            '\n \n',
            {
              text: `Solicitado Por: ${this.storage_Nombre}\n`,
              alignment: 'right',
              style: 'header',
            },
            {
              text: `\n Información detallada de la Orden de Trabajo \n \n`,
              alignment: 'center',
              style: 'header'
            },
            {
              table: {
                widths: [130, 220, '*'],
                style: 'header',
                body: [
                  [
                    `N°: ${this.ordenTrabajo}`,
                    `Nombre Cliente: ${this.NombreCliente}`,
                    `Valor de la OT: ${this.formatonumeros(this.valorFinalOT)}`
                  ],
                  [
                    `Id Producto: ${this.idProducto}`,
                    `Nombre Producto: ${this.nombreProducto}`,
                    `Presentación: ${this.presentacionProducto}`
                  ],
                  [
                    `Cantidad Und: ${this.formatonumeros(this.cantidadSellandoUnidad)}`,
                    `Cantidad Kg: ${this.formatonumeros(this.cantProdSinMargenKg)}`,
                    `Cantidad Margen: ${this.formatonumeros(this.CantidadMargen)}%`
                  ],
                  [
                    `Cantidad Kg Con Margen: ${this.formatonumeros(this.cantProdConMargenKg)}`,
                    `Valor Unitario Und: ${this.formatonumeros(this.valorUnitarioProdUnd)}`,
                    `Valor Unitario Kg: ${this.formatonumeros(this.valorUnitarioProdKg)}`
                  ]
                ]
              },
              layout: 'lightHorizontalLines',
              fontSize: 9,
            },
            '\n \n',
            {
              text: `\n Información detallada de Materia(s) Prima(s) Utilizada \n `,
              alignment: 'center',
              style: 'header'
            },

            this.table(this.ArrayMateriaPrima, ['Id', 'Nombre', 'Cantidad', 'Presentacion', 'PrecioUnd', 'SubTotal', 'Proceso']),

            {
              text: `\n\nValor Total Materia Prima Utilizada: $${this.formatonumeros(this.ValorMPEntregada)}`,
              alignment: 'right',
              style: 'header',
            },
            '\n \n',
            {
              text: `\n Información detallada de la Producción en cada proceso \n `,
              alignment: 'center',
              style: 'header'
            },
            {
              table: {
                widths: ['*', '*', '*'],
                style: 'header',
                body: [
                  [
                    `Extrusión: ${this.formatonumeros(Math.round(this.cantidadTotalExt))}`,
                    `Impresión: ${this.formatonumeros(Math.round(this.cantidadTotalImp))}`,
                    `Rotograbado: ${this.formatonumeros(Math.round(this.cantidadTotalRot))}`
                  ],
                  [
                    `Doblado: ${this.formatonumeros(Math.round(this.cantidadTotalDbl))}`,
                    `Laminado: ${this.formatonumeros(Math.round(this.cantidadTotalLaminado))}`,
                    `Empaque: ${this.formatonumeros(Math.round(this.cantidadTotalEmpaque))}`
                  ],
                  [
                    `Wiketiado: ${this.formatonumeros(Math.round(this.cantidadTotalWiketiado))}`,
                    `Sellado: ${this.formatonumeros(Math.round(this.cantidadTotalSella))}`,
                    `Corte: ${this.formatonumeros(Math.round(this.cantidadTotalCorte))}`
                  ],
                ]
              },

              layout: {
                fillColor: function (rowIndex, node, columnIndex) {
                  return (rowIndex % 2 === 0) ? '#CCCCCC' : null;
                }
              },
              fontSize: 9,
            },
            '\n \n',
            {
              table: {
                widths: [1,'*'],
                style: 'header',
                body: [
                  [
                    '',
                    `Valor Final de La OT: $${this.formatonumeros(this.valorFinalOT)}`,
                  ],
                  [
                    '',
                    `Diferencia de Costos La OT: $${this.formatonumeros(this.diferencia)}`,
                  ],
                  [
                    '',
                    `Porcentaje de Diferencia de Costos de La OT: ${this.formatonumeros(Math.round(this.diferenciaPorcentaje))}%`,
                  ],
                ]
              },
              layout: 'noBorders',
              fontSize: 9,
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
        break;
      }
    }
  }

}
