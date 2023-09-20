import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { modelInventario_Areas } from 'src/app/Modelo/modelInventario_Areas';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { Inventario_AreasService } from 'src/app/Servicios/Inventario_Areas/Inventario_Areas.service';
import { MateriaPrimaService } from 'src/app/Servicios/MateriaPrima/materiaPrima.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { ProcesosService } from 'src/app/Servicios/Procesos/procesos.service';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-Inventario_Areas',
  templateUrl: './Inventario_Areas.component.html',
  styleUrls: ['./Inventario_Areas.component.css']
})
export class Inventario_AreasComponent implements OnInit {

  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
 
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  hora : any = moment().format('H:mm:ss'); //Variable que se usará para llenar la hora actual 
  load : boolean = false;
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  materiasPrimas = []; //Variable que va almacenar la información de las materias primas de extrusion
  procesos = []; //Variable que va almacenar la información de todas las unidades de medida
  formulario !: FormGroup;
  ordenes_trabajos : any = [];
  inventario : any = [];
  area : string = "";
  productos : any = []; 

  constructor(private AppComponent : AppComponent,
               private frmBuilder : FormBuilder, 
                private svcMatPrimas : MateriaPrimaService,
                  private svcBagPro : BagproService,
                    private svcProcesos : ProcesosService, 
                      private svcMsjs : MensajesAplicacionService, 
                        private svcInventario : Inventario_AreasService) {

    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
    this.formulario = this.frmBuilder.group({
      fecha : [null, Validators.required],
      ot : [null,],
      item : [null, Validators.required],
      referencia : [null, Validators.required],
      cantidad : [0, Validators.required],
      precio : [null, Validators.required],
      proceso : [null, Validators.required],
      observacion : [null, ],
    });
  }

  ngOnInit() {
    this.lecturaStorage();
    this.filtrarArea();
    this.cargarProcesos();
    if([7, 3, 1].includes(this.ValidarRol)) this.cargarMateriasPrimas();
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  //Función que cargará el area del usuario logueado
  filtrarArea(){
    this.ValidarRol == 3 || this.ValidarRol ==  7 ? this.area = "EXT" : 
    this.ValidarRol == 8 ? this.area = "SELLA" :
    this.ValidarRol == 63 ? this.area = "ROT" :
    this.ValidarRol == 62 ? this.area = "IMP" : this.area = "N/A";
  }

  //Función que cargará la información de las materias primas
  cargarMateriasPrimas = () => this.svcMatPrimas.srvObtenerLista().subscribe(datos => this.materiasPrimas = datos);
   
  //Función que cargará la información de las materias primas
  cargarProcesos() {
    let proceso : any = [];
    this.svcProcesos.srvObtenerLista().subscribe(datos => { 
      this.procesos = datos; 
      proceso = this.procesos.filter(x => x.proceso_Id == this.area);
      this.formulario.patchValue({ proceso : proceso[0].proceso_Id });
    }, error => { this.svcMsjs.mensajeError(`Error`, `Error al cargar las areas`) }); 
  }

  //Función que consultará la OT y cargará item, referencia y precio de dicha orden
  consultarOT(){
    let fecha : any = this.formulario.value.fecha;
    let ot : number = this.formulario.value.ot;
    if(fecha == null) this.svcMsjs.mensajeAdvertencia(`Advertencia`, `Debe diligenciar el campo "Fecha de Inventario"!`);
    else {
      if(ot != null) {
        this.load = true;
        fecha = moment(fecha).format('YYYY-MM-DD');
        this.svcBagPro.srvObtenerListaClienteOT_Item(this.formulario.value.ot).subscribe(data => { 
          if(data.length > 0) this.cargarCampos(data[0]); 
          else {
            this.load = false;
            this.svcMsjs.mensajeAdvertencia(`Advertencia`, `La OT N° ${ot} no existe!`);
            this.limpiarCampos();
          }
        }, error => { this.load = false; });
      } else this.svcMsjs.mensajeAdvertencia(`Advertencia`, `Debe diligenciar el campo "OT"!`); 
    } 
  }

  //Función que cargará la info de la OT en los campos
  cargarCampos(data : any) {
    this.formulario.patchValue({
      item : data.clienteItems,
      referencia : data.clienteItemsNom,
      cantidad : 0,
      precio : data.datosValorKg,
    });
    this.load = false;
  }

  //Función que enviará el registro de inventario
  enviarRegistro(){
    let cantidad : number = this.formulario.value.cantidad;
    let proceso : any = this.formulario.value.proceso;
    let observacion : any = this.formulario.value.observacion == null ? '' : this.formulario.value.observacion;
    let ot : any = this.formulario.value.ot == null || this.formulario.value.ot == '' ? 0 : this.formulario.value.ot;
    
    if(this.formulario.valid) {
      if(cantidad > 0) {
        if(proceso != null && proceso != 'N/A') {
          let info : modelInventario_Areas = {
            InvCodigo : 0,
            OT: ot,
            Prod_Id: this.formulario.value.item,
            Referencia : this.formulario.value.referencia,
            MatPri_Id: 84,
            UndMed_Id: 'Kg',
            InvStock: cantidad,
            InvPrecio: this.formulario.value.precio,
            Subtotal : (this.formulario.value.precio * cantidad),
            Proceso_Id: this.formulario.value.proceso,
            InvFecha_Inventario: moment(this.formulario.value.fecha).format('YYYY-MM-DD'),
            InvFecha_Registro: this.today,
            InvHora_Registro: this.hora,
            Usua_Id: this.storage_Id,
            InvObservacion: observacion
          };
          
          if(!this.ordenes_trabajos.includes(info.OT)) {
            this.ordenes_trabajos.push(info.OT);
            this.inventario.push(info);
            this.limpiarCampos();
            if(this.ordenes_trabajos.includes(0)) this.ordenes_trabajos.pop();
          } else this.svcMsjs.mensajeAdvertencia(`Advertencia`, `La OT N° ${info.OT} ya existe en la tabla!`);
        } else this.svcMsjs.mensajeAdvertencia(`Advertencia`, `Debe seleccionar un proceso válido!`);
      } else this.svcMsjs.mensajeAdvertencia(`Advertencia`, `La cantidad no puede ser 0.00, por favor verifique!`);
    } else this.svcMsjs.mensajeAdvertencia(`Advertencia`, `Debe diligenciar todos los campos!`);
    
  }

  precioTotal(){
    let total : number = 0;
    for (const item of this.inventario) {
      total += item.InvPrecio * item.InvStock;
    } 
    return total;  
  }

  mostrarEleccion(data : any){}

  limpiarCampos(){
    this.formulario.patchValue({
      ot : null,
      item : null,
      referencia : null,
      cantidad : 0,
      precio : null,
      observacion : null,
    });
  }  

  crearEntrada() {
    this.load = true;
    let esError : boolean = false;
    this.inventario.forEach(x => { 
      x.InvFecha_Registro = this.today;
      x.InvHora_Registro = this.hora;
      delete x.Subtotal;
      delete x.Referencia;
      console.log(x);
      this.svcInventario.Post(x).subscribe(data => { esError = false }, error => { esError = true });
    });
    setTimeout(() => {
      this.load = false;
      (esError) ? this.svcMsjs.mensajeError(`Error`, `No se pudo crear la entrada de inventario!`) : this.svcMsjs.mensajeConfirmacion(`¡Sí!`, `Se creó la entrada de inventario de forma exitosa!`);
      this.limpiarTodo();
    }, 2000);
  
  }

  limpiarTodo() {
    this.formulario.patchValue({
      ot : null,
      item : null,
      referencia : null,
      cantidad : 0,
      precio : null,
      observacion : null,
    });
    this.inventario = [];
    this.ordenes_trabajos = [];
  }

  consultarReferencia(){
    let referencia : any = this.formulario.value.referencia;
    if(referencia != null && referencia.length > 2) this.svcBagPro.LikeReferencia(referencia).subscribe(data => this.productos = data);
  }

  seleccionarReferencia(){
    let ref : any = [];
    ref = this.productos.filter((item) => item.referencia == this.formulario.value.referencia);
    this.formulario.patchValue({ item : ref[0].item, referencia : ref[0].referencia, precio : ref[0].precioKg != null ? ref[0].precioKg : 0, cantidad : 0});  
  }
 
}
