import { Component, Inject, Injectable, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { MateriaPrimaService } from 'src/app/Servicios/materiaPrima.service';
import { OrdenCompra_MateriaPrimaService } from 'src/app/Servicios/OrdenCompra_MateriaPrima.service';
import { ProveedorService } from 'src/app/Servicios/proveedor.service';
import { RolesService } from 'src/app/Servicios/roles.service';
import { UnidadMedidaService } from 'src/app/Servicios/unidad-medida.service';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app.ocompra.component',
  templateUrl: './ocompra.component.html',
  styleUrls: ['./ocompra.component.css']

})
export class OcompraComponent implements OnInit {

  FormOrdenCompra : FormGroup; //Formulario principal
  FormMateriaPrima : FormGroup; //Formulario de Materia Prima

  //Llamar modales, inicializados como falsos para que no se carguen al ingresar a la pagina.
  ModalCrearProveedor: boolean = false;
  ModalCrearMateriaPrima: boolean= false;
  ModalCrearBOPP: boolean= false;
  ModalCrearTintas: boolean= false;

  cargando : boolean = false;
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  proveedores : any [] = []; //Variable que almacenará los proveedores
  materiaPrima : any [] = []; //Variable que almacenará las materias primas
  unidadesMedida : any [] = []; //Variable que va a almacenar las unidades de medida
  materiasPrimasSeleccionadas : any [] = []; //Variable que almacenará las materias primas que son escogidas para la orden de compra
  catidadTotalPeso : number = 0; //Variable que almacenará la sumatoria del peso de todas las materia primas seleccionadas
  cantidadTotalPrecio : number = 0; //Variable que almacenará la sumatoria del precio de todas las materias primas seleccionadas
  materiasPrimasSeleccionada_ID : any [] = []; //Variable que almacenará los ID de las materias primas que se han seleccionado para que no puedan ser elegidas nuevamente
  consecutivoOrdenCompra : any = 0; //Variable que almacenará el consecutivo de la orden de compra

  constructor(private frmBuilder : FormBuilder,
                private rolService : RolesService,
                  @Inject(SESSION_STORAGE) private storage: WebStorageService,
                    private proveedorService : ProveedorService,
                      private materiaPrimaService : MateriaPrimaService,
                        private undMedidaService : UnidadMedidaService,
                          private ordenCompraService : OrdenCompra_MateriaPrimaService,) {

    this.FormOrdenCompra = this.frmBuilder.group({
      ConsecutivoOrden : ['', Validators.required],
      Proveedor : ['', Validators.required],
      Id_Proveedor : [''],
      Observacion : [''],
    });

    this.FormMateriaPrima = this.frmBuilder.group({
      Id : [null, Validators.required],
      Nombre : [null, Validators.required],
      Cantidad : [null, Validators.required],
      UndMedida : [null, Validators.required],
      Precio : [null, Validators.required],
      PrecioOculto : [null, Validators.required],
    });
  }

  ngOnInit(){
    this.lecturaStorage();
    this.obtenerUnidadesMedida();
    this.obtenerMateriaPrima();
    this.generarConsecutivo();
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

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = '$1,';
    return number.toString().replace(exp,rep);
  }

  // Funcion que limpiará todos los campos de la vista
  limpiarTodo(){
    this.FormMateriaPrima.reset();
    this.FormOrdenCompra.reset();
    this.materiasPrimasSeleccionada_ID = [];
    this.materiasPrimasSeleccionadas = [];
    this.cargando = false;
    this.cantidadTotalPrecio = 0;
    this.catidadTotalPeso = 0;
    this.generarConsecutivo();
  }

  //Funcion que va a consultar los proveedores por el nombre que esten escribiendo en el campo de proveedor
  consultarProveedores(){
    this.proveedores = [];
    let nombre : string = this.FormOrdenCompra.value.Proveedor.trim();
    if (nombre != '') {
      this.proveedorService.getProveedorLike(nombre).subscribe(datos_Proveedores => {
        for (let i = 0; i < datos_Proveedores.length; i++) {
          this.proveedores.push(datos_Proveedores[i]);
        }
      });
    }
  }

  // Funcion que le va a cambiar el nombre al proveedor
  cambiarNombreProveedor(){
    let id : number = this.FormOrdenCompra.value.Proveedor;
    this.proveedorService.srvObtenerListaPorId(id).subscribe(datos_proveedor => {
      this.FormOrdenCompra = this.frmBuilder.group({
        ConsecutivoOrden : this.FormOrdenCompra.value.ConsecutivoOrden,
        Proveedor : datos_proveedor.prov_Nombre,
        Id_Proveedor : id,
        Observacion : this.FormOrdenCompra.value.Observacion,
      });
    });
  }

  // Generar Consecutivo de Orden de Compra
  generarConsecutivo(){
    this.FormOrdenCompra = this.frmBuilder.group({
      ConsecutivoOrden : this.consecutivoOrdenCompra,
      Proveedor : this.FormOrdenCompra.value.Proveedor,
      Id_Proveedor : this.FormOrdenCompra.value.Id_Proveedor,
      Observacion : this.FormOrdenCompra.value.Observacion,
    });
  }

  // Funcion que va a consultar la materia prima
  obtenerMateriaPrima(){
    this.materiaPrimaService.getMpTintaBopp().subscribe(datos_materiaPrimas => {
      for (let i = 0; i < datos_materiaPrimas.length; i++) {
        this.materiaPrima.push(datos_materiaPrimas[i]);
        this.materiaPrima.sort((a,b) => a.nombre.localeCompare(b.nombre));
      }
    });
  }

  // Funcion que va a consultar las unidades de medida
  obtenerUnidadesMedida(){
    this.undMedidaService.srvObtenerLista().subscribe(datos_undMedida => {
      for (let i = 0; i < datos_undMedida.length; i++) {
        this.unidadesMedida.push(datos_undMedida[i]);
      }
    });
  }

  //Funcion que va a mostrar el nombre de la materia prima
  cambiarNombreMateriaPrima(){
    let id : number = this.FormMateriaPrima.value.Nombre;
    this.materiaPrimaService.getInfoMpTintaBopp(id).subscribe(datos_materiaPrima => {
      for (let i = 0; i < datos_materiaPrima.length; i++) {
        this.FormMateriaPrima = this.frmBuilder.group({
          Id : datos_materiaPrima[i].id,
          Nombre : datos_materiaPrima[i].nombre,
          Cantidad : 0,
          UndMedida : datos_materiaPrima[i].undMedida,
          Precio : this.formatonumeros(parseFloat(datos_materiaPrima[i].precio).toFixed(2)),
          PrecioOculto : parseFloat(datos_materiaPrima[i].precio).toFixed(2),
        });
      }
    });
  }

  // Funcion que va a añadir la materia prima a la tabla
  cargarMateriaPrima(){
    if (this.FormMateriaPrima.valid){
      if (!this.materiasPrimasSeleccionada_ID.includes(this.FormMateriaPrima.value.Id)) {
        if (this.FormMateriaPrima.value.Cantidad > 0){
          let info : any = {
            Id: this.FormMateriaPrima.value.Id,
            Nombre : this.FormMateriaPrima.value.Nombre,
            Cantidad : this.FormMateriaPrima.value.Cantidad,
            Und_Medida : this.FormMateriaPrima.value.UndMedida,
            Precio : this.FormMateriaPrima.value.PrecioOculto,
            SubTotal : (this.FormMateriaPrima.value.Cantidad * this.FormMateriaPrima.value.PrecioOculto),
          }
          this.materiasPrimasSeleccionada_ID.push(this.FormMateriaPrima.value.Id);
          this.materiasPrimasSeleccionadas.push(info);
          this.catidadTotalPeso += this.FormMateriaPrima.value.Cantidad;
          this.cantidadTotalPrecio += (this.FormMateriaPrima.value.Cantidad * this.FormMateriaPrima.value.PrecioOculto);
          this.FormMateriaPrima.reset();
        } else Swal.fire(`¿La cantidad de la materia prima seleccionada debe ser mayor que 0!`);
      } else Swal.fire(`¡La materia prima '${this.FormMateriaPrima.value.Nombre}' ya fue seleccionada previamante!`);
    } else Swal.fire(`¡Hay campos vacios!`);
  }

  // Funcion que va a quitar la materia prima
  quitarMateriaPrima(data : any){
    Swal.fire({
      title: '¿Estás seguro de eliminar la Materia Prima de la Orden de Compra?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        for (let i = 0; i < this.materiasPrimasSeleccionadas.length; i++) {
          if (this.materiasPrimasSeleccionadas[i].Id == data.Id) {
            this.materiasPrimasSeleccionadas.splice(i, 1);
            this.catidadTotalPeso -= data.Cantidad;
            this.cantidadTotalPrecio -= data.SubTotal;
            for (let j = 0; j < this.materiasPrimasSeleccionada_ID.length; j++) {
              if (data.Id == this.materiasPrimasSeleccionada_ID[j]) this.materiasPrimasSeleccionada_ID.splice(j, 1);
            }
            const Toast = Swal.mixin({
              toast: true,
              position: 'center',
              showConfirmButton: false,
              timer: 1500,
              timerProgressBar: true,
              didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer)
                toast.addEventListener('mouseleave', Swal.resumeTimer)
              }
            });
            Toast.fire({
              icon: 'success',
              title: `¡Se ha quitado la Materia Prima ${data.Nombre} de la Orden de Compra!`
            });
          }
        }
      }
    });
  }

  // Funcion para llamar el modal que crea clientes
  LlamarModalCrearProveedor() {
    this.ModalCrearProveedor = true;
  }

  // Funcion para llamar el modal que crea clientes
  LlamarModalCrearMateriaPrima(){
    Swal.fire({
      title: '¿Qué desea crear?',
      text: "¡Presione el botón de la materia prima que quiere crear!",
      icon: 'question',
      allowOutsideClick: false,
      showCancelButton: true,
      showDenyButton: true,
      showCloseButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#3085d6',
      denyButtonColor: '#3085d6',
      confirmButtonText: 'Polietilenos',
      cancelButtonText: 'BOPP / BOPA/ Poliester',
      denyButtonText: 'Tintas / Chips / Solventes',
    }).then((result) => {
      if (result.isConfirmed) this.ModalCrearMateriaPrima = true;
      else if (result.dismiss) this.ModalCrearBOPP = true;
      else if (result.isDenied) this.ModalCrearTintas = true;
    })
  }

  // Funcion que va a validar que los campos necesarios esten llenos para crear la ORden de Compra
  validarDatosOrdenCompra(){
    if (this.FormOrdenCompra.valid) {
      if (this.materiasPrimasSeleccionadas.length > 0) this.crearOrdenCompra();
      else Swal.fire(`¡Debe escoger minimos 1 Materia Prima!`);
    } else Swal.fire(`¡Hay Campos Vacios!`);
  }

  // Funcion que va a crear la orden de compra
  crearOrdenCompra(){
    this.cargando = false;
    let info : any = {
      Usua_Id : this.storage_Id,
      Oc_Fecha : moment().format('YYYY-MM-DD'),
      Oc_Hora : moment().format("H:mm:ss"),
      Prov_Id : this.FormOrdenCompra.value.Id_Proveedor,
      Estado_Id : 11,
      Oc_ValorTotal : this.cantidadTotalPrecio,
      Oc_PesoTotal : this.catidadTotalPeso,
      TpDoc_Id : 'OCMP',
      Oc_Observacion : this.FormOrdenCompra.value.Observacion,
    }
    this.ordenCompraService.insert_OrdenCompra(info).subscribe(datos_ordenCompra => { this.crearDtOrdenCompra(); }, error => {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        html:
        '<b>¡Error al Crear la Orden de Compra!</b><hr> ' +
        `<spam style="color : #f00;">${error.message}</spam> `,
      });
      this.cargando = false;
    });
  }

  // Funcion que va a rear detalles de Orden de Compra
  crearDtOrdenCompra(){
    this.ordenCompraService.getUltimoId_OrdenCompra().subscribe(datos_ordenCompra => {
      for (let i = 0; i < datos_ordenCompra.length; i++) {
        for (let j = 0; j < this.materiasPrimasSeleccionadas.length; j++) {
        }
      }
    }, error => {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        html:
        '<b>¡Error al consultar el ultimo consecutivo de las ordenes de compra!</b><hr> ' +
        `<spam style="color : #f00;">${error.message}</spam> `,
        showCloseButton: true,
      });
      this.cargando = false;
    });
  }
}
