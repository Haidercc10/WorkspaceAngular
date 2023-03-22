import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { modelDtFacturacion_OrdenMaquila } from 'src/app/Modelo/modelDtFacturacion_OrdenMaquila';
import { modelFacturacion_OrdenMaquila } from 'src/app/Modelo/modelFacturacion_OdenMaquila';
import { modelOrdenMaquila_Facturacion } from 'src/app/Modelo/modelOrdenMaquila_Facturacion';
import { EntradaBOPPService } from 'src/app/Servicios/BOPP/entrada-BOPP.service';
import { DetalleOrdenMaquilaService } from 'src/app/Servicios/DetalleOrdenMaquila/DetalleOrdenMaquila.service';
import { DtFacturacion_OrdenMaquilaService } from 'src/app/Servicios/DtFacturacion_OrdenMaquila.ts/DtFacturacion_OrdenMaquila.service';
import { Facturacion_OrdenMaquilasService } from 'src/app/Servicios/Facturacion_OrdenMaquila/facturacion_OrdenMaquilas.service';
import { MateriaPrimaService } from 'src/app/Servicios/MateriaPrima/materiaPrima.service';
import { OrdenMaquila_FacturacionService } from 'src/app/Servicios/OrdenMaquila_Facturacion/OrdenMaquila_Facturacion.service';
import { TintasService } from 'src/app/Servicios/Tintas/tintas.service';
import Swal from 'sweetalert2';

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

  constructor(@Inject(SESSION_STORAGE) private storage: WebStorageService,
                private frmBuilder : FormBuilder,
                  private dtOrdenMaquilaService : DetalleOrdenMaquilaService,
                    private ordenMaquila_facService : OrdenMaquila_FacturacionService,
                      private facturacion_OMService : Facturacion_OrdenMaquilasService,
                        private dtFacturacion_OMService : DtFacturacion_OrdenMaquilaService,
                          private materiaPrimaSerive : MateriaPrimaService,
                            private tintaService : TintasService,
                              private boppService : EntradaBOPPService,) {

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

  // Funcion que limpiará todos los campos
  limpiarTodo(){
    this.cargando = false;
    this.formFacturacionOrden.reset();
    this.materiasPrimas = [];
    this.materiaPrimasSeleccionadas = [];
    this.pesoTotal  = 0;
    this.precioTotal = 0;
  }

  // Funcion que va a consultar la orden de maquila
  consultarOrdenMaquila(){
    this.cargando = true;
    this.materiasPrimas = [];
    let mp : number;
    let id : number = this.formFacturacionOrden.value.OrdenMaquila;
    this.dtOrdenMaquilaService.getInfoOrdenMaquila_Id(id).subscribe(datos_orden => {
      for (let i = 0; i < datos_orden.length; i++) {
        if (datos_orden[i].mP_Id != 84) mp = datos_orden[i] .mP_Id;
        else if (datos_orden[i].tinta_Id != 2001) mp = datos_orden[i].tinta_Id;
        else if (datos_orden[i].bopp_Id != 449) mp= datos_orden[i].bopp_Id
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
        }, error => { this.mensajeError(`¡Ocurrió un error al consultar la Orden de Maquila #${id}, verifique que esta existe e intentelo de nuevo!`); });
      }
    }, error => { this.mensajeError(`¡Ocurrió un error al consultar la Orden de Maquila #${id}, verifique que esta existe e intentelo de nuevo!`); });
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
    this.cargando = false;

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
        else this.mensajeAdvertencia(`¡Debe cargar minimo una materia prima a entregar!`);
      } else this.mensajeAdvertencia(`¡Debe llenar el campo "Nro. Factura" o el campo "Nro. Remisión" para crear la facturación!`);
    } else this.mensajeAdvertencia(`¡Hay campos vacios!`);
  }

  // funcion que va a crear el registro de facturación de orden de maquila
  crearFacturacionMaquila() {
    this.cargando = true;
    let tpDoc : string;
    let Codigo : string;
    if (this.formFacturacionOrden.value.Factura != null) {
      tpDoc = 'FOM';
      Codigo = this.formFacturacionOrden.value.Factura;
    } else if (this.formFacturacionOrden.value.Remision != null) {
      tpDoc = 'REMOM'
      Codigo = this.formFacturacionOrden.value.Remision;
    }
    let info : modelFacturacion_OrdenMaquila = {
      TpDoc_Id : tpDoc,
      FacOM_Codigo : Codigo,
      Tercero_Id: this.formFacturacionOrden.value.Tercero_Id,
      FacOM_ValorTotal : this.precioTotal,
      FacOM_Observacion : this.formFacturacionOrden.value.Observacion,
      Estado_Id: 11,
      Usua_Id: this.storage_Id,
    }
    this.facturacion_OMService.insert(info).subscribe(datos => {
      this.crearDtFacturacionMaquila(datos.facOM_Id);
      this.crearRelacionFacturacionMaquila(datos.facOM_Id);
    }, error => {
      this.mensajeError(`¡No se pudo guardar la facturación!`);
    });
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
      this.dtFacturacion_OMService.insert(info).subscribe(datos => {  }, error => {
        this.mensajeError(`¡Ocurrió un error al guardar los detalles de las materias primas de la facturación!`);
      });
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
      this.restarMateriaPrima();
      this.restarTinta();
      this.restarBopp();
      setTimeout(() => { this.mensajeExitoso(`Registro Exitoso`,`¡Se realizó la facuturación de la Orden de Maquila #${om}!`); }, 3000);
    }, error => { this.mensajeError(`¡No se pudo crear la relación entre la Orden Maquila y la Facturación!`); });
  }

  // Funcion que va a restar del inventario de materia prima
  restarMateriaPrima(){
    for (let i = 0; i < this.materiaPrimasSeleccionadas.length; i++) {
      if (this.materiaPrimasSeleccionadas[i].Mp != 84) {
        this.materiaPrimaSerive.srvObtenerListaPorId(this.materiaPrimasSeleccionadas[i].Mp).subscribe(datos => {
          let info : any = {
            MatPri_Id : datos.matPri_Id,
            MatPri_Nombre: datos.matPri_Nombre,
            MatPri_Descripcion: datos.matPri_Descripcion,
            MatPri_Stock : datos.matPri_Stock - this.materiaPrimasSeleccionadas[i].Cantidad_Faltante_Editar,
            UndMed_Id: datos.undMed_Id,
            CatMP_Id: datos.catMP_Id,
            MatPri_Precio: datos.matPri_Precio,
            TpBod_Id: datos.tpBod_Id,
            MatPri_Fecha : datos.matPri_Fecha,
            MatPri_Hora : datos.matPri_Hora,
          }
          this.materiaPrimaSerive.srvActualizar(this.materiaPrimasSeleccionadas[i].Mp, info).subscribe(datosActualizados => {
          });
        });
      }
    }
  }

  // Funcion que va a restar del inventario de tintas
  restarTinta(){
    for (let i = 0; i < this.materiaPrimasSeleccionadas.length; i++) {
      if (this.materiaPrimasSeleccionadas[i].Tinta != 2001) {
        this.tintaService.srvObtenerListaPorId(this.materiaPrimasSeleccionadas[i].Tinta).subscribe(datos => {
          let info : any = {
            Tinta_Id: datos.tinta_Id,
            Tinta_Nombre: datos.tinta_Nombre,
            Tinta_Descripcion: datos.tinta_Descripcion,
            Tinta_CodigoHexadecimal : datos.tinta_CodigoHexadecimal,
            Tinta_Stock: (datos.tinta_Stock - this.materiaPrimasSeleccionadas[i].Cantidad_Faltante_Editar),
            UndMed_Id : datos.undMed_Id,
            Tinta_Precio: datos.tinta_Precio,
            CatMP_Id : datos.catMP_Id,
            TpBod_Id : datos.tpBod_Id,
            Tinta_InvInicial : datos.tinta_InvInicial,
            tinta_FechaIngreso : datos.tinta_FechaIngreso,
            tinta_Hora : datos.tinta_Hora,
          }
          this.tintaService.srvActualizar(this.materiaPrimasSeleccionadas[i].Tinta, info).subscribe(datosactualizados => {
          });
        });
      }
    }
  }

  // Funcion que va a restar del inventario de  bopp
  restarBopp(){
    for (let i = 0; i < this.materiaPrimasSeleccionadas.length; i++) {
      if (this.materiaPrimasSeleccionadas[i].Bopp != 449) {
        this.boppService.srvObtenerListaPorId(this.materiaPrimasSeleccionadas[i].Bopp).subscribe(datos => {
          let info : any = {
            BOPP_Id: datos.bopP_Id,
            BOPP_Nombre: datos.bopP_Nombre,
            BOPP_Descripcion: datos.bopP_Descripcion,
            BOPP_Serial: datos.bopP_Seria,
            BOPP_CantidadMicras: datos.bopP_CantidadMicras,
            undMed_Id: datos.undMed_Id,
            catMP_Id: datos.catMP_Id,
            bopP_Precio: datos.bopP_Precio,
            tpBod_Id: datos.tpBod_Id,
            bopP_FechaIngreso: datos.bopP_FechaIngreso,
            bopP_Hora: datos.bopP_Hora,
            bopP_Ancho: datos.bopP_Ancho,
            bopP_Stock: (datos.bopP_Stock - this.materiaPrimasSeleccionadas[i].Cantidad_Faltante_Editar),
            undMed_Kg: datos.undMed_Kg,
            bopP_CantidadInicialKg: datos.bopP_CantidadInicialKg,
            usua_Id: datos.usua_Id,
          }
          this.boppService.srvActualizar(this.materiaPrimasSeleccionadas[i].Bopp, info).subscribe(dato_Actualizado => {  });
        });
      }
    }
  }

  // Funcion que va a mostrar un mensaje de que le proceso realizado (facturar) fue exitoso
  mensajeExitoso(titulo : string, mensaje : string){
    Swal.fire({ icon: 'success', title: titulo, text: mensaje });
    this.limpiarTodo();
  }

  // Funcion que mostrará un mensaje de advertencia
  mensajeAdvertencia(mensaje : string) {
    Swal.fire({ icon: 'warning', title: '¡Advertencia!', text: mensaje });
    this.cargando = false;
  }

  // Funcion que mostará un mensaje de error
  mensajeError(mensaje : string) {
    Swal.fire({ icon: 'error', title: '¡Opps...!', text: mensaje });
    this.cargando = false;
  }

}
