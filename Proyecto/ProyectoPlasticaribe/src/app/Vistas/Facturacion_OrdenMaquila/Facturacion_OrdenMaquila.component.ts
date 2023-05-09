import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import pdfMake from 'pdfmake/build/pdfmake';
import { MessageService } from 'primeng/api';
import { modelDtFacturacion_OrdenMaquila } from 'src/app/Modelo/modelDtFacturacion_OrdenMaquila';
import { modelFacturacion_OrdenMaquila } from 'src/app/Modelo/modelFacturacion_OdenMaquila';
import { modelOrdenMaquila_Facturacion } from 'src/app/Modelo/modelOrdenMaquila_Facturacion';
import { EntradaBOPPService } from 'src/app/Servicios/BOPP/entrada-BOPP.service';
import { DetalleOrdenMaquilaService } from 'src/app/Servicios/DetalleOrdenMaquila/DetalleOrdenMaquila.service';
import { DtFacturacion_OrdenMaquilaService } from 'src/app/Servicios/DtFacturacion_OrdenMaquila.ts/DtFacturacion_OrdenMaquila.service';
import { Facturacion_OrdenMaquilasService } from 'src/app/Servicios/Facturacion_OrdenMaquila/facturacion_OrdenMaquilas.service';
import { MateriaPrimaService } from 'src/app/Servicios/MateriaPrima/materiaPrima.service';
import { OrdenMaquila_FacturacionService } from 'src/app/Servicios/OrdenMaquila_Facturacion/OrdenMaquila_Facturacion.service';
import { Orden_MaquilaService } from 'src/app/Servicios/Orden_Maquila/Orden_Maquila.service';
import { TintasService } from 'src/app/Servicios/Tintas/tintas.service';
import { AppComponent } from 'src/app/app.component';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';

@Component({
  selector: 'app-Facturacion_OrdenMaquila',
  templateUrl: './Facturacion_OrdenMaquila.component.html',
  styleUrls: ['./Facturacion_OrdenMaquila.component.css']
})
export class Facturacion_OrdenMaquilaComponent implements OnInit {

  formFacturacionOrden !: FormGroup;
  cargando : boolean = false; //Variable que validará cuando se muestra el icono con la animacion de cargando y cuando no
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  materiasPrimas : any [] = []; //Variable donde se guardarán las materias primas que vienen de la orden de maquila
  materiaPrimasSeleccionadas : any [] = []; //Variable donde se guardará la informacion de las materia primas elegidas para facturar
  pesoTotal : number = 0; //Variable que almacenará ea cantidad total del peso de las materias primas eleginas
  precioTotal : number = 0; //Variable que almacenará el precio total de las materias primas elegidas
  informacionPDF : any [] = []; //Variable que almcenará la informacion de la factura consultada para crear el pdf
  documento : number = 0;
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro

  constructor(private AppComponent : AppComponent,
                private frmBuilder : FormBuilder,
                  private dtOrdenMaquilaService : DetalleOrdenMaquilaService,
                    private ordenMaquila_facService : OrdenMaquila_FacturacionService,
                      private facturacion_OMService : Facturacion_OrdenMaquilasService,
                        private dtFacturacion_OMService : DtFacturacion_OrdenMaquilaService,
                          private materiaPrimaSerive : MateriaPrimaService,
                            private tintaService : TintasService,
                              private boppService : EntradaBOPPService,
                                private ordenMaquilaService : Orden_MaquilaService,
                                  private messageService: MessageService ) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
    this.formFacturacionOrden = this.frmBuilder.group({
      OrdenMaquila : ['', Validators.required],
      Factura: [null],
      Remision : [null],
      Tercero_Id: ['', Validators.required],
      Tercero: ['', Validators.required],
      Observacion : [''],
    });
  }

  ngOnInit() {
    this.lecturaStorage();
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = '$1,';
    return number.toString().replace(exp,rep);
  }

  // Funcion que limpiará todos los campos
  limpiarTodo(){
    this.cargando = false;
    this.formFacturacionOrden.reset();
    this.materiasPrimas = [];
    this.materiaPrimasSeleccionadas = [];
    this.pesoTotal  = 0;
    this.precioTotal = 0;
    this.documento = 0;
    this.onReject();
  }

  // Funcion que va a consultar la orden de maquila
  consultarOrdenMaquila(){
    this.cargando = true;
    this.materiasPrimas = [];
    let mp : number;
    let id : number = this.formFacturacionOrden.value.OrdenMaquila;
    this.dtOrdenMaquilaService.getInfoOrdenMaquila_Id(id).subscribe(datos_orden => {
      for (let i = 0; i < datos_orden.length; i++) {
        if (datos_orden[i].mP_Id != 84) mp = datos_orden[i].mP_Id;
        else if (datos_orden[i].tinta_Id != 2001) mp = datos_orden[i].tinta_Id;
        else if (datos_orden[i].bopp_Id != 449) mp = datos_orden[i].bopp_Id
        this.ordenMaquila_facService.GetOrdenMaquilaFacturada(id, mp).subscribe(datos_Facturacuin => {
          for (let j = 0; j < datos_Facturacuin.length; j++) {
            this.formFacturacionOrden.patchValue({
              Tercero_Id: datos_Facturacuin[j].tercero_Id,
              Tercero: datos_Facturacuin[j].tercero,
            });
            let info : any = {
              Id: 0,
              Mp : 84,
              Tinta : 2001,
              Bopp: 449,
              Nombre: '',
              Cantidad: datos_Facturacuin[j].cantidad_Total,
              Cantidad_Facturada: datos_Facturacuin[j].cantidad_Facturada,
              Cantidad_Faltante: datos_Facturacuin[j].cantidad_Faltante,
              Cantidad_Faltante_Editar: datos_Facturacuin[j].cantidad_Faltante,
              Presentacion: datos_Facturacuin[j].presentacion,
              Precio: datos_Facturacuin[j].precio,
              Exits : datos_Facturacuin[j].cantidad_Faltante <= 0 ? true : false,
            }
            if (datos_Facturacuin[j].mP_Id != 84) {
              info.Id = datos_Facturacuin[j].mP_Id;
              info.Mp = info.Id;
              info.Nombre = datos_Facturacuin[j].mp;
            } else if (datos_Facturacuin[j].tinta_Id != 2001) {
              info.Id = datos_Facturacuin[j].tinta_Id;
              info.Tinta = info.Id;
              info.Nombre = datos_Facturacuin[j].tinta;
            } else if (datos_Facturacuin[j].bopp_Id != 449) {
              info.Id = datos_Facturacuin[j].bopp_Id;
              info.Bopp = info.Id;
              info.Nombre = datos_Facturacuin[j].bopp;
            }
            this.materiasPrimas.push(info);
            this.materiasPrimas.sort((a,b) => Number(a.Id) - Number(b.Id) );
            this.materiasPrimas.sort((a,b) => Number(a.Exits) - Number(b.Exits) );
          }
        }, error => { this.mostrarError(`Error`, `¡Ocurrió un error al consultar la orden de Maquila #${id}, verifique que esta existe e intentelo de nuevo!`); });
      }
    }, error => { this.mostrarError(`Error`, `¡Ocurrió un error al consultar la orden de Maquila #${id}, verifique que esta existe e intentelo de nuevo!`); });
    setTimeout(() => { this.cargando = false; }, 2000);
  }

  // Funcion que va a validar que la materia prima que se está escogiendo no tenga la cantidad faltante en 0
  validarMateriaPrima(data : any){
    this.cargando = true;
    this.materiasPrimas = [];
    for (let i = 0; i < data.length; i++) {
      if (data[i].Exits) this.materiasPrimas.push(data[i]);
    }
    this.materiaPrimasSeleccionadas.sort((a,b) => Number(a.Id) - Number(b.Id) );
    this.materiaPrimasSeleccionadas.sort((a,b) => Number(a.Exits) - Number(b.Exits) );
    this.calcularPrecio();
  }

  //Funcion que va a seleccionar una materia prima
  llenarMateriaPrima(item : any){
    this.cargando = true;
    for (let i = 0; i < this.materiasPrimas.length; i++) {
      if (this.materiasPrimas[i].Id == item.Id) {
        this.materiasPrimas.splice(i, 1);
        break;
      }
    }
    this.materiaPrimasSeleccionadas.sort((a,b) => Number(a.Id) - Number(b.Id) );
    this.materiaPrimasSeleccionadas.sort((a,b) => Number(a.Exits) - Number(b.Exits) );
    this.calcularPrecio();
  }

  // Funcion que va a quitar todos los MateriaPrima que se van a insertar
  quitarTodosMateriaPrima(item : any){
    this.cargando = true;
    this.materiasPrimas.sort((a,b) => Number(a.Id) - Number(b.Id) );
    this.materiasPrimas.sort((a,b) => Number(a.Exits) - Number(b.Exits) );
    this.materiaPrimasSeleccionadas = [];
    this.calcularPrecio();
  }

  //Funcion que va a quitar lo MateriaPrima que se van a insertar
  quitarMateriaPrima(item : any){
    this.cargando = true;
    for (let i = 0; i < this.materiaPrimasSeleccionadas.length; i++) {
      if (this.materiaPrimasSeleccionadas[i].Id == item.Id) this.materiaPrimasSeleccionadas.splice(i, 1);
    }
    this.materiasPrimas.sort((a,b) => Number(a.Id) - Number(b.Id) );
    this.materiasPrimas.sort((a,b) => Number(a.Exits) - Number(b.Exits) );
    this.calcularPrecio();
  }

  // Funcion que va a calcular la cantidad de kilos y la cantidad en consto
  calcularPrecio(){
    this.pesoTotal  = 0;
    this.precioTotal = 0;
    setTimeout(() => { this.cargando = false; }, 50);

    for (let i = 0; i < this.materiaPrimasSeleccionadas.length; i++) {
      if (!this.materiaPrimasSeleccionadas[i].Exits) {
        this.pesoTotal += this.materiaPrimasSeleccionadas[i].Cantidad_Faltante_Editar;
        this.precioTotal += (this.materiaPrimasSeleccionadas[i].Precio * this.materiaPrimasSeleccionadas[i].Cantidad_Faltante_Editar);
      }
    }
  }

  // Funcion que va a validar los campos y tablas para poder crear la facturacion
  validarDatos(){
    let factura : string = this.formFacturacionOrden.value.Factura;
    let remision : string = this.formFacturacionOrden.value.Remision
    if (this.formFacturacionOrden.valid) {
      if ((factura != null && remision == null) || (factura == null && remision != null)){
        if (this.materiaPrimasSeleccionadas.length > 0) this.crearFacturacionMaquila();
        else this.mostrarAdvertencia(`Advertencia`, `¡Debe cargar minimo una materia prima a entregar!`);
      } else this.mostrarAdvertencia(`Advertencia`, `¡Debe llenar el campo "Nro. Factura" o el campo "Nro. Remisión" para crear la facturación!`);
    } else this.mostrarAdvertencia(`Advertencia`, `¡Hay campos vacios!`);
  }

  // Funcion que va a crear el registro de facturación de orden de maquila
  crearFacturacionMaquila() {
    this.cargando = true;
    let tpDoc : string, Codigo : string;
    if (this.formFacturacionOrden.value.Factura != null) {
      tpDoc = 'FOM';
      Codigo = this.formFacturacionOrden.value.Factura;
    } else if (this.formFacturacionOrden.value.Remision != null) {
      tpDoc = 'REMOM'
      Codigo = this.formFacturacionOrden.value.Remision;
    }
    let info : modelFacturacion_OrdenMaquila = {
      TpDoc_Id : tpDoc,
      FacOM_Codigo : Codigo.toUpperCase(),
      Tercero_Id: this.formFacturacionOrden.value.Tercero_Id,
      FacOM_ValorTotal : this.precioTotal,
      FacOM_Observacion :  this.formFacturacionOrden.value.Observacion != null ? (this.formFacturacionOrden.value.Observacion).toUpperCase() : '',
      Estado_Id: 12,
      Usua_Id: this.storage_Id,
      FacOM_Fecha : moment().format('YYYY-MM-DD'),
      FacOM_Hora : moment().format('H:mm:ss'),
    }
    this.facturacion_OMService.insert(info).subscribe(datos => {
      this.crearDtFacturacionMaquila(datos.facOM_Id);
      this.crearRelacionFacturacionMaquila(datos.facOM_Id);
      this.cambiarEstadoOrden(datos.facOM_Id);
    }, error => { this.mostrarError(`Error`, `¡No se pudo guardar la facturación!`); });
  }

  // Funcion que va a guardar en la base de datos los detalles de la Facturación
  crearDtFacturacionMaquila(id : number){
    for (let i = 0; i < this.materiaPrimasSeleccionadas.length; i++) {
      let info : modelDtFacturacion_OrdenMaquila = {
        FacOM_Id : id,
        MatPri_Id : this.materiaPrimasSeleccionadas[i].Mp,
        Tinta_Id : this.materiaPrimasSeleccionadas[i].Tinta,
        Bopp_Id : this.materiaPrimasSeleccionadas[i].Bopp,
        DtFacOM_Cantidad : this.materiaPrimasSeleccionadas[i].Cantidad_Faltante_Editar,
        UndMed_Id : this.materiaPrimasSeleccionadas[i].Presentacion,
        DtFacOM_ValorUnitario : this.materiaPrimasSeleccionadas[i].Precio,
      }
      this.dtFacturacion_OMService.insert(info).subscribe(datos => { }, error => { this.mostrarError(`Error`, `¡Ocurrió un error al guardar los detalles de las materias primas de la facturación!`); });
    }
  }

  // Funcion que creará la relacion en la base de datos de la orden de maquila con la facturacion
  crearRelacionFacturacionMaquila(fac : number){
    let om : number = this.formFacturacionOrden.value.OrdenMaquila;
    let info : modelOrdenMaquila_Facturacion = {
      OM_Id : om,
      FacOM_Id : fac,
    }
    this.ordenMaquila_facService.insert(info).subscribe(datos => {
    }, error => { this.mostrarError(`Error`, `¡No se pudo crear la relación entre la Orden Maquila y la Facturación!`); });
  }

  // Funcion que va a cambiar el estado de la orden de maquila teniendo en cuenta la facturación que acaba de ingresar
  cambiarEstadoOrden(factura : number){
    let om : number = this.formFacturacionOrden.value.OrdenMaquila, mp : number, estado : number = 11, error : boolean = false;
    this.dtOrdenMaquilaService.getInfoOrdenMaquila_Id(om).subscribe(datos_orden => {
      for (let i = 0; i < datos_orden.length; i++) {
        if (datos_orden[i].mP_Id != 84) mp = datos_orden[i].mP_Id;
        else if (datos_orden[i].tinta_Id != 2001) mp = datos_orden[i].tinta_Id;
        else if (datos_orden[i].bopp_Id != 449) mp = datos_orden[i].bopp_Id
        this.ordenMaquila_facService.GetOrdenMaquilaFacturada(om, mp).subscribe(datos_Facturacuion => {
          for (let j = 0; j < datos_Facturacuion.length; j++) {
            if (datos_Facturacuion[j].cantidad_Faltante <= 0) estado = 5;
            else {
              estado = 11;
              break;
            }
          }
        }, err => { error = true; });
      }
      setTimeout(() => {
        if (!error) {
          for (let i = 0; i < datos_orden.length; i++) {
            let info : any = {
              OM_Id : om,
              Tercero_Id : datos_orden[i].tercero_Id,
              OM_ValorTotal : datos_orden[i].valor_Total,
              OM_PesoTotal : datos_orden[i].peso_Total,
              OM_Observacion : datos_orden[i].observacion,
              TpDoc_Id : 'OM',
              Estado_Id : estado,
              Usua_Id : datos_orden[i].usuario_Id,
              OM_Fecha : datos_orden[i].fecha,
              OM_Hora : datos_orden[i].hora,
            }
            this.ordenMaquilaService.put(om, info).subscribe(datos_ordenMaquila => { }, error => { this.mostrarError(`Error`, `¡Ocurrió un error al cambiar el estado de la Orden de Maquila!`); });
            break;
          }

          let tpDoc : string, Codigo : string;
          if (this.formFacturacionOrden.value.Factura != null) {
            tpDoc = 'FOM';
            Codigo = this.formFacturacionOrden.value.Factura;
          } else if (this.formFacturacionOrden.value.Remision != null) {
            tpDoc = 'REMOM'
            Codigo = this.formFacturacionOrden.value.Remision;
          }
          let info : any = {
            FacOM_Id : factura,
            TpDoc_Id : tpDoc,
            FacOM_Codigo : Codigo.toUpperCase(),
            Tercero_Id: this.formFacturacionOrden.value.Tercero_Id,
            FacOM_ValorTotal : this.precioTotal,
            FacOM_Observacion : this.formFacturacionOrden.value.Observacion != null ? (this.formFacturacionOrden.value.Observacion).toUpperCase() : '',
            Estado_Id: estado == 11 ? 12 : 13,
            Usua_Id: this.storage_Id,
            FacOM_Fecha : moment().format('YYYY-MM-DD'),
            FacOM_Hora : moment().format('H:mm:ss'),
          }
          this.facturacion_OMService.put(factura, info).subscribe(data => {})
        }
      }, 3000);
    }, err => {
      error = true;
      this.mostrarError(`Error`, `¡Ocurrió un error al cambiar el estado de la orden de maquila!`);
    });
    setTimeout(() => { this.cargando = false; this.mostrarEleccion(factura, `Advertencia`, `¡Se realizó la facturación de la orden de maquila #${om}!, ¿desea ver el detalle en pdf?`); }, 5000);
  }

  // Funcion que va a consultar la información de la factura o remisión que se acaba de crear
  buscarFacturacion(id : number){
    this.onReject();
    this.cargando = true;
    this.informacionPDF = [];
    this.dtFacturacion_OMService.GetConsultarFacturacion(id).subscribe(datos_facturacion => {
      for (let i = 0; i < datos_facturacion.length; i++) {
        let info : any = {
          Id : 0,
          Id_Mp: datos_facturacion[i].mP_Id,
          Id_Tinta: datos_facturacion[i].tinta_Id,
          Id_Bopp: datos_facturacion[i].bopp_Id,
          Nombre : '',
          Cantidad : this.formatonumeros(datos_facturacion[i].cantidad),
          "Und Medida" : datos_facturacion[i].und_Medida,
          Precio : this.formatonumeros(datos_facturacion[i].precio),
          SubTotal : this.formatonumeros(datos_facturacion[i].cantidad * datos_facturacion[i].precio),
        }
        if (info.Id_Tinta != 2001) {
          info.Id = info.Id_Tinta;
          info.Nombre = datos_facturacion[i].tinta;
        } else if (info.Id_Mp != 84) {
          info.Id = info.Id_Mp;
          info.Nombre = datos_facturacion[i].mp;
        } else if (info.Id_Bopp != 449) {
          info.Id = info.Id_Bopp;
          info.Nombre = datos_facturacion[i].bopp;
        }
        this.informacionPDF.push(info);
        this.informacionPDF.sort((a,b) => a.Nombre.localeCompare(b.Nombre));
      }
      setTimeout(() => {this.crearPDF(id); }, 2500);
    });
  }

  // Funcion que va a crear un archivo de tipo pdf de la factura o remision que se acaba de crear
  crearPDF(id : number){
    let nombre : string = this.AppComponent.storage_Nombre;
    this.dtFacturacion_OMService.GetConsultarFacturacion(id).subscribe(datos_facturacion => {
      for (let i = 0; i < datos_facturacion.length; i++) {
        const pdfDefinicion : any = {
          info: { title: `${datos_facturacion[i].tipo_Documento} N° ${datos_facturacion[i].codigo_Documento}` },
          pageSize: { width: 630, height: 760 },
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
                { image : logoParaPdf, width : 220, height : 50 },
                {
                  text: `${datos_facturacion[i].tipo_Documento} N° ${datos_facturacion[i].codigo_Documento}`,
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
                      text: `${datos_facturacion[i].empresa}`
                    },
                    {
                      border: [false, false, false, false],
                      text: `Fecha`
                    },
                    {
                      border: [false, false, false, true],
                      text: `${datos_facturacion[i].fecha.replace('T00:00:00', ``)} ${datos_facturacion[i].hora}`
                    },
                  ],
                  [
                    {
                      border: [false, false, false, false],
                      text: `NIT Empresa`
                    },
                    {
                      border: [false, false, false, true],
                      text: `${datos_facturacion[i].empresa_Id}`
                    },
                    {
                      border: [false, false, false, false],
                      text: `Ciudad`
                    },
                    {
                      border: [false, false, false, true],
                      text: `${datos_facturacion[i].empresa_Ciudad}`
                    },
                  ],
                  [
                    {
                      border: [false, false, false, false],
                      text: `Dirección`
                    },
                    {
                      border: [false, false, false, true],
                      text: `${datos_facturacion[i].empresa_Direccion}`
                    },
                    {
                      border: [false, false, false, false],
                      text: `Tipo Documento`
                    },
                    {
                      border: [false, false, false, true],
                      text: `${datos_facturacion[i].tipo_Documento}`
                    }
                  ]
                ]
              },
              layout: { defaultBorder: false, },
              fontSize: 9,
            },
            '\n \n',
            {
              text: `Usuario: ${datos_facturacion[i].usuario}\n`,
              alignment: 'left',
              style: 'header',
            },
            '\n \n',
            {
              text: `\n Información detallada del Tercero \n \n`,
              alignment: 'center',
              style: 'header'
            },
            {
              style: 'tablaCliente',
              table: {
                widths: [171, 171, 171],
                style: 'header',
                body: [
                  [
                    `Nombre: ${datos_facturacion[i].tercero}`,
                    `ID: ${datos_facturacion[i].tercero_Id}`,
                    `Tipo de ID: ${datos_facturacion[i].tipo_Id}`,
                  ],
                  [
                    `Telefono: ${datos_facturacion[i].telefono_Tercero}`,
                    `Ciudad: ${datos_facturacion[i].ciudad_Tercero}`,
                    `E-mail: ${datos_facturacion[i].correo_Tercero}`,
                  ],
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

            this.table(this.informacionPDF, ['Id', 'Nombre', 'Cantidad', 'Und Medida', 'Precio', 'SubTotal']),

            {
              style: 'tablaTotales',
              table: {
                widths: [197, '*', 50, '*', '*', 98],
                style: 'header',
                body: [
                  [
                    '',
                    '',
                    '',
                    '',
                    {
                      border: [true, false, true, true],
                      text: `Valor Total`
                    },
                    {
                      border: [false, false, true, true],
                      text: `$${this.formatonumeros(datos_facturacion[i].valor_Total)}`
                    },
                  ],
                ]
              },
              layout: { defaultBorder: false, },
              fontSize: 8,
            },
            {
              text: `\n \nObservación sobre la Orden: \n ${datos_facturacion[i].observacion}\n`,
              style: 'header',
            }
          ],
          styles: {
            header: { fontSize: 10, bold: true },
            titulo: { fontSize: 20, bold: true }
          }
        }
        const pdf = pdfMake.createPdf(pdfDefinicion);
        pdf.open();
        this.limpiarTodo();
        break;
      }
    });
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

  /** Mostrar mensaje de confirmación  */
  mostrarConfirmacion(mensaje : any, titulo?: any) {
   this.messageService.add({severity: 'success', summary: mensaje,  detail: titulo});
  }

  /** Mostrar mensaje de error  */
  mostrarError(mensaje : any, titulo?: any) {
   this.messageService.add({severity:'error', summary: mensaje, detail: titulo});
   this.cargando = false;
  }

  /** Mostrar mensaje de advertencia */
  mostrarAdvertencia(mensaje : any, titulo?: any) {
   this.messageService.add({severity:'warn', summary: mensaje, detail: titulo});
   this.cargando = false;
  }

  mostrarEleccion(item: any,  mensaje?: any, titulo?: any){
    this.documento = item;
    this.messageService.add({severity:'success', key: 'pdf', summary: mensaje, detail: titulo, sticky: true});
  }

  /** Función para quitar mensaje de elección */
  onReject(){
    this.messageService.clear('pdf');
  }
}
