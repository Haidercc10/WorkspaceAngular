import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { DetalleOrdenMaquilaService } from 'src/app/Servicios/DetalleOrdenMaquila/DetalleOrdenMaquila.service';
import { OrdenMaquila_FacturacionService } from 'src/app/Servicios/OrdenMaquila_Facturacion/OrdenMaquila_Facturacion.service';
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
                    private ordenMaquila_facService : OrdenMaquila_FacturacionService,) {

    this.formFacturacionOrden = this.frmBuilder.group({
      OrdenMaquila : ['', Validators.required],
      Factura: [''],
      Remision : [''],
      Tercero_Id: ['', Validators.required],
      Tercero: ['', Validators.required],
      Observacion : ['', Validators.required],
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
              info.Nombre = datos_Facturacuin[j].mp;
            } else if (datos_Facturacuin[j].tinta_Id != 2001) {
              info.Id = datos_Facturacuin[j].tinta_Id;
              info.Nombre = datos_Facturacuin[j].tinta;
            } else if (datos_Facturacuin[j].bopp_Id != 449) {
              info.Id = datos_Facturacuin[j].bopp_Id;
              info.Nombre = datos_Facturacuin[j].bopp;
            }
            this.materiasPrimas.push(info);
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
  llenarMateriaPrimaAIngresar(item : any){
    this.cargando = true;
    for (let i = 0; i < this.materiasPrimas.length; i++) {
      if (this.materiasPrimas[i].Id == item.Id) this.materiasPrimas.splice(i, 1);
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
  quitarMateriaPrimaAIngresar(item : any){
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
    if (this.formFacturacionOrden.valid) {
      if (this.formFacturacionOrden.value.Factura != '' || this.formFacturacionOrden.value.Remision){
        this.facturacionMaquila();
      } else this.mensajeAdvertencia(``);
    } else this.mensajeAdvertencia(`¡Hay campos vacios!`);
  }

  // funcion que va a crear el registro de facturación de orden de maquila
  facturacionMaquila() {
    this.cargando = true;
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
