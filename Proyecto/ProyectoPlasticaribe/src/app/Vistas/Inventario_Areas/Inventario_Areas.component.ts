import { Component, Injectable, OnInit  } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { MessageService } from 'primeng/api';
import { modelInventario_Areas } from 'src/app/Modelo/modelInventario_Areas';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { Inventario_AreasService } from 'src/app/Servicios/Inventario_Areas/Inventario_Areas.service';
import { MateriaPrimaService } from 'src/app/Servicios/MateriaPrima/materiaPrima.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { ProcesosService } from 'src/app/Servicios/Procesos/procesos.service';
import { AppComponent } from 'src/app/app.component';
import { Router } from '@angular/router';
import * as fs from 'file-saver';
import { Workbook } from 'exceljs';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';

Injectable({
  providedIn: 'root'
})

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
  procesos = []; //Variable que va almacenar la información de todas las unidades de medida
  formulario !: FormGroup; //Formulario de la vista
  ordenes_trabajos : any = []; //Array que guardará las diferentes OT
  inventario : any = []; //Array que guardará la información del inventario que se está cargando
  area : string = ""; //Variable que guardará el area del usuario logueado segun su rol. 
  arrayReferencias : any = []; //Variable que guardará la información de los productos/materias primas
  nroFilas : number = 8; //Variable que guardará el numero de filas que ocupará el campo observación
  nroFilas2 : number = 0; //Variable que guardará el numero de filas que ocupará el campo observación
  registroSeleccionado : any; //Variable que guardará el registro seleccionado de la tabla
  contador : number = 0; //Variable que aumentará su valor cada vez que ingrese un registro a la tabla. 
  titulo = `Inventarios Areas`; //Variable que colocará el titulo del módulo
  labels = []; //Variable que cargará los nombres de los label de id y nombre dependiendo la ruta
  url = ``; //Variable que guardará la ruta actual
  polietilenos : any = []; //Variable que guardará el id del polietileno que se está cargando en la tabla
  subtitulo : any = ``; //Variable que guardará el subtitulo del modulo.
  urlItems = `/inventario-areas/items`; //Variable que guardará la ruta del modulo cuando se desee crear el inventario de items
  urlMateriales = `/inventario-areas/materiales`; //Variable que guardará la ruta del modulo cuando se desee crear el inventario de materias primas

  constructor(private AppComponent : AppComponent,
               private frmBuilder : FormBuilder, 
                private svcMatPrimas : MateriaPrimaService,
                  private svcBagPro : BagproService,
                    private svcProcesos : ProcesosService, 
                      private svcMsjs : MensajesAplicacionService, 
                        private svcInventario : Inventario_AreasService, 
                          private msg : MessageService, 
                            private router : Router,) {

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
    this.url = this.router.url;
    this.cargarLabels(this.url);
  }

  cargarLabels(url : any) {
    if(url == this.urlMateriales) {
      this.labels = [`Id`, `Materia Prima`];
      this.subtitulo = `Consultar Materiales en Proceso`;
    } else if(url == this.urlItems) {
      this.labels = [`Item`, `Referencia`]; 
      this.subtitulo = `Consultar OT/Referencia`;
    } 

    this.ValidarRol == 1 && url == this.urlMateriales ? this.nroFilas = 10 : 
    this.ValidarRol == 1 && url == this.urlItems ? this.nroFilas = 8 :
    this.ValidarRol != 1 && url == this.urlMateriales ? this.nroFilas = 12  : 
    this.ValidarRol != 1 && url == this.urlItems ? this.nroFilas = 10  : this.nroFilas = 8;

    this.ValidarRol == 1 ? this.nroFilas2 = 4 : this.nroFilas2 = 6;
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  //Función que cargará el area del usuario logueado
  filtrarArea(){
    if (this.ValidarRol == 3 || this.ValidarRol ==  7) {
      this.area = "EXT";
      this.titulo = `Inventario Extrusión`;
    } else if (this.ValidarRol == 8) { 
      this.area = "SELLA";
      this.titulo = `Inventario Extrusión`;
    } else if (this.ValidarRol == 63) { 
      this.area = "ROT";
      this.titulo = `Inventario Rotograbado`;
    } else if (this.ValidarRol == 62) {
      this.area = "IMP";
      this.titulo = `Inventario Impresión`;
    } else {
      this.area = null;
      this.titulo = `Inventarios Areas`;
    } 
  }

  //Función que cargará la información de las materias primas
  cargarMateriasPrimas = () => this.svcMatPrimas.getMpTintaBopp().subscribe(datos => this.arrayReferencias = datos);
   
  //Función que cargará la información de los procesos/areas
  cargarProcesos() {
    let proceso : any = [];
    this.svcProcesos.srvObtenerLista().subscribe(datos => { 
      this.procesos = datos; 
      this.procesos = this.procesos.filter(x => [`EXT`, `IMP`, `ROT`, `SELLA`].includes(x.proceso_Id))
      if(this.ValidarRol != 1) {
        proceso = this.procesos.filter(x => x.proceso_Id == this.area);
        this.formulario.patchValue({ proceso : proceso[0].proceso_Id });
      }
    }, () => this.svcMsjs.mensajeError(`Error`, `Error al cargar las areas`)); 
  }

  //Función que consultará la OT y cargará item, referencia y precio de dicha orden
  consultarOT(){
    let fecha : any = this.formulario.value.fecha;
    let ot : number = this.formulario.value.ot;
    if (fecha == null) this.svcMsjs.mensajeAdvertencia(`Advertencia`, `Debe diligenciar el campo "Fecha de Inventario"!`);
    else {
      if(ot != null) {
        this.load = true;
        this.svcBagPro.srvObtenerListaClienteOT_Item(this.formulario.value.ot).subscribe(data => { 
          if (data.length > 0) this.cargarCampos(data[0]);  
          else {
            this.load = false;
            this.svcMsjs.mensajeAdvertencia(`Advertencia`, `La OT N° ${ot} no existe!`);
            this.limpiarCampos();
          }
        }, () => this.load = false);
      } else this.svcMsjs.mensajeAdvertencia(`Advertencia`, `Debe diligenciar el campo "OT"!`); 
    } 
  }

  //Función que cargará la info de la OT en los campos del formulario
  cargarCampos(data : any) {
    this.formulario.patchValue({
      item : data.clienteItems,
      referencia : data.clienteItemsNom,
      cantidad : 0,
      precio : data.datosValorKg,
    });
    this.load = false;
  }

  //Función que enviará el registro de inventario a la tabla
  enviarRegistro(){
    let cantidad : number = this.formulario.value.cantidad;
    let precio : number = this.formulario.value.precio;
    let proceso : any = this.formulario.value.proceso;
    let id : any = this.formulario.value.item;
    let ot : any = this.formulario.value.ot == null || this.formulario.value.ot == '' ? 0 : this.formulario.value.ot;
    if(this.formulario.valid) {
      if(cantidad > 0) {
        if(proceso != null) this.cargarTabla(ot, id, cantidad, precio, proceso);
        else this.svcMsjs.mensajeAdvertencia(`Advertencia`, `Debe seleccionar un proceso válido!`);
      } else this.svcMsjs.mensajeAdvertencia(`Advertencia`, `La cantidad no puede ser 0.00, por favor verifique!`);
    } else this.svcMsjs.mensajeAdvertencia(`Advertencia`, `Debe diligenciar los campos vacíos!`);
  }

  //Función que cargará la tabla con el inventario de cada área
  cargarTabla(ot : number, id : number, cantidad : number, precio : number, proceso : any){
    let info : modelInventario_Areas = {
      'InvCodigo' : this.contador += 1,
      'OT' : ot,
      'Prod_Id' : this.url == this.urlItems ? id : 1,
      'Referencia' : this.formulario.value.referencia,
      'MatPri_Id' : this.url == this.urlMateriales ? id : 84,
      'UndMed_Id': 'Kg',
      'InvStock' : cantidad,
      'InvPrecio' : precio,
      'Subtotal' : (precio * cantidad),
      'Proceso_Id': proceso,
      'InvFecha_Inventario': moment(this.formulario.value.fecha).format('YYYY-MM-DD'),
      'InvFecha_Registro': this.today,
      'InvHora_Registro': this.hora,
      'Usua_Id': this.storage_Id,
      'InvObservacion': this.formulario.value.observacion == null ? '' : this.formulario.value.observacion,
    };
    if(this.url == this.urlItems) {
      if (!this.ordenes_trabajos.includes(info.OT)) {
        this.ordenes_trabajos.push(info.OT);
        this.inventario.push(info);
        this.limpiarCampos();
        if(this.ordenes_trabajos.includes(0)) this.ordenes_trabajos.pop();
      } else this.svcMsjs.mensajeAdvertencia(`Advertencia`, `La OT N° ${info.OT} ya existe en la tabla!`);

    } else if (this.url == this.urlMateriales) {
      if (!this.polietilenos.includes(info.MatPri_Id)) {
        this.polietilenos.push(info.MatPri_Id);
        this.inventario.push(info);
        this.limpiarCampos();
        if(this.polietilenos.includes(0)) this.polietilenos.pop();
      } else this.svcMsjs.mensajeAdvertencia(`Advertencia`, `El material ${info.Referencia} ya existe en la tabla!`);
    }
  }

  //Función que calcula el precio total de las referencias de la tabla
  precioTotal = () : number => this.inventario.reduce((a,b) => a + (b.InvPrecio * b.InvStock), 0);

  //Función que mostrará el mensaje de elección de eliminación de un registro de la tabla
  mostrarEleccion(data : any){
    this.registroSeleccionado = data;
    this.msg.add({ key: 'eleccion', severity:'warn', summary:'Elección', detail: `Está seguro que desea quitar la referencia ${data.Referencia} de la tabla?`, sticky: true});
  }

  //Función que quitará el mensaje de elección de eliminación de un registro de la tabla
  onReject = () => this.msg.clear('eleccion');

  //Función que eliminará un registro de la tabla
  eliminarRegistro(){
    this.onReject();
    this.polietilenos.splice(this.polietilenos.findIndex(x => x == this.registroSeleccionado.MatPri_Id), 1);
    this.ordenes_trabajos.splice(this.ordenes_trabajos.findIndex(x => x == this.registroSeleccionado.OT), 1);
    this.inventario.splice(this.inventario.findIndex(x => x.InvCodigo == this.registroSeleccionado.InvCodigo), 1);
    this.svcMsjs.mensajeConfirmacion(`¡Confirmación!`, `Se eliminó la referencia ${this.registroSeleccionado.Referencia} de la tabla!`);
    this.registroSeleccionado = null;
  }

  //Función que limpiará los campos del formulario
  limpiarCampos(){
    this.formulario.reset();
    this.formulario.patchValue({ cantidad : 0, });
  }  

  //Función que creará la entrada de inventario en la base de datos
  crearEntrada() {
    this.load = true;
    let esError : boolean = false;
    this.inventario.forEach(x => { 
      x.InvFecha_Registro = this.today;
      x.InvHora_Registro = this.hora;
      x.InvCodigo = 0;
      delete x.Subtotal, x.Referencia;
      this.svcInventario.Post(x).subscribe(() => esError = false, () => esError = true);
    });
    setTimeout(() => {
      this.load = false;
      (esError) ? this.svcMsjs.mensajeError(`Error`, `No se pudo crear la entrada de inventario!`) : this.svcMsjs.mensajeConfirmacion(`¡Sí!`, `Se creó la entrada de inventario de forma exitosa!`);
      this.limpiarTodo();
    }, 1000);
  }

  //Función que limpiará todos los campos del formulario y la tabla
  limpiarTodo() {
    if (this.ValidarRol == 1) this.formulario.reset();
    else this.limpiarCampos();
    this.arrayReferencias = [];
    this.inventario = [];
    this.ordenes_trabajos = [];
    this.polietilenos = [];
    this.contador = 0;
  }

  //Función que consultará las referencias de productos/materias primas por nombre
  consultarReferencia(){
    let referencia : any = this.formulario.value.referencia;
    if(referencia != null && referencia.length > 2) {
      if(this.url == this.urlItems) this.svcBagPro.LikeReferencia(referencia).subscribe(data => this.arrayReferencias = data);
      else if(this.url == this.urlMateriales) this.svcMatPrimas.GetPolietilenos(referencia).subscribe(data => this.arrayReferencias = data);
    }
  }

  //Función que consultará las referencias de productos/materias primas por Id
  consultarItem(){
    let item : any = this.formulario.value.item;
    if(this.url == this.urlItems) {
      if(item != null) {
        this.load = true;
        this.svcBagPro.srvObtenerItemsBagproXClienteItem(item).subscribe(data => {
          if(data.length != null) this.formulario.patchValue({ item : data[0].clienteItems, referencia : data[0].clienteItemsNom, precio : data[0].datosValorKg != null || data[0].datosValorKg == '' ? data[0].datosValorKg : 0, cantidad : 0 });
          else this.svcMsjs.mensajeAdvertencia(`Advertencia`, `El item ${item} no existe!`);
          this.load = false;
        }, () => {
          this.svcMsjs.mensajeAdvertencia(`Advertencia`, `No se encontró el item ${item}!`);
          this.load = false;
        });
      }
    } else if(this.url == this.urlMateriales) {
      if(item != null) {
        this.load = true;
        this.svcMatPrimas.srvObtenerListaPorId(item).subscribe(data => {
          if(typeof(data) == 'object') this.formulario.patchValue({ item : data.matPri_Id, referencia : data.matPri_Nombre, precio : data.matPri_Precio != null || data.matPri_Precio == '' ? data.matPri_Precio : 0, cantidad : 0 });
          else this.svcMsjs.mensajeAdvertencia(`Advertencia`, `El Id de material ${item} no existe!`);
          this.load = false;
        }, () => {
          this.svcMsjs.mensajeAdvertencia(`Advertencia`, `No se encontró el Id de material ${item}!`);
          this.load = false;
        });
      }
    }
  }

  //Funcion que seleccionará una referencia y cargará su id, nombre y precio 
  seleccionarReferencia(){
    let ref : any = [];
    if(this.url == this.urlItems) {
      ref = this.arrayReferencias.filter((item) => `${item.item} - ${item.referencia}` == this.formulario.value.referencia);
      this.formulario.patchValue({ item : ref[0].item, referencia : ref[0].referencia, precio : ref[0].precioKg != null ? ref[0].precioKg : 0, cantidad : 0});  
    } else if(this.url == this.urlMateriales) {
      ref = this.arrayReferencias.filter((item) => `${item.item} - ${item.referencia}` == this.formulario.value.referencia);
      this.formulario.patchValue({ item : ref[0].item, referencia : ref[0].referencia, precio : ref[0].precioKg != null ? ref[0].precioKg : 0, cantidad : 0});  
    }
  }

  //Función que exportará a excel el reporte de inventario de áreas
  exportarExcel(){
    if (this.inventario.length == 0) this.svcMsjs.mensajeAdvertencia(`Advertencia`, 'Debe cargar al menos una registro en la tabla.');
    else {
      this.load = true;
      setTimeout(() => {
        const title = `${this.titulo} - ${this.today}`;
        let header = ["OT", "Id", "Referencia", "Cantidad (Kg)", "Precio (Kg)", "Subtotal", "Área", "Observación",];
         
        let datos : any =[];
        for (const item of this.inventario) {
          const datos1  : any = [item.OT, item.Prod_Id, item.Referencia, item.InvStock, item.InvPrecio, item.Subtotal, item.Proceso_Id, item.InvObservacion];
          if(this.url == this.urlItems) datos1[1] = item.Prod_Id;
          if(this.url == this.urlMateriales) datos1[1] = item.MatPri_Id;
          datos.push(datos1);
        } 
        let workbook = new Workbook();
        const imageId1 = workbook.addImage({ base64: logoParaPdf, extension: 'png', });
        let worksheet = workbook.addWorksheet(`${this.titulo} - ${this.today}`);
        worksheet.addImage(imageId1, 'A1:B2');
        worksheet.addRow([]);
        worksheet.addRow([]);
        let headerRow = worksheet.addRow(header);
        headerRow.eachCell((cell) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'eeeeee' } }
          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }, }
          cell.font = { name: 'Calibri', family: 4, size: 12, bold: true }
          cell.alignment = { vertical: 'middle', horizontal: 'center' }
        });
        let celdas : any = [4, 5, 6,];
        let columnas : any = [1, 2, 3, 4, 5, 6, 7, 8];
        let medidas : any = [12, 12, 50, 15, 15, 15, 12, 30];
        if(this.url == this.urlItems && this.ValidarRol == 1) worksheet.mergeCells('A1:H2');
        else if (this.url == this.urlItems && this.ValidarRol != 1) worksheet.mergeCells('A1:F2');
        
        if(this.url == this.urlMateriales && this.ValidarRol == 1) worksheet.mergeCells('A1:H2');
        else if (this.url == this.urlMateriales && this.ValidarRol != 1) worksheet.mergeCells('A1:F2'); 
        datos.forEach(d => {
          let row = worksheet.addRow(d);
          row.alignment = { horizontal : 'center' }
          celdas.forEach(c => row.getCell(c).numFmt = '""#,##0.00;[Red]\-""#,##0.00');
          columnas.forEach(c => worksheet.getColumn(c).width = medidas[columnas.indexOf(c)]);
        });
        setTimeout(() => {
          if (this.url == this.urlItems && this.ValidarRol != 1) worksheet.spliceColumns(5, 2); 
          else if (this.url == this.urlMateriales && this.ValidarRol != 1) worksheet.spliceColumns(5, 2);
          worksheet.addRow([]);
          worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
          worksheet.getCell('A1').font = { name: 'Calibri', family: 4, size: 14, bold: true };
          worksheet.getCell('A1').value = title;
        
          workbook.xlsx.writeBuffer().then((data) => {
            let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            fs.saveAs(blob, `${this.titulo} - ${this.today}.xlsx`);
          });
          this.load = false;
        }, 1000);
        this.crearEntrada();
      }, 2000);
    }
  }
}
