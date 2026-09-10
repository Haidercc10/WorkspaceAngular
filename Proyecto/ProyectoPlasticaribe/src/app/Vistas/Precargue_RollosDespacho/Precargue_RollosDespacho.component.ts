import { Component, Injectable, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { MessageService } from 'primeng/api';
import { AppComponent } from 'src/app/app.component';
import { modelDetalles_PrecargueDespacho } from 'src/app/Modelo/modelDetalles_PrecargueDespacho';
import { modelPrecargue_Despacho } from 'src/app/Modelo/modelPrecargue_Despacho';
import { CreacionPdfService } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';
import { Detalles_PrecargueDespachoService } from 'src/app/Servicios/Detalles_PrecargueDespacho/Detalles_PrecargueDespacho.service';
import { InventarioZeusService } from 'src/app/Servicios/InventarioZeus/inventario-zeus.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { Precargue_DespachoService } from 'src/app/Servicios/Precargue_Despacho/Precargue_Despacho.service';
import { Produccion_ProcesosService } from 'src/app/Servicios/Produccion_Procesos/Produccion_Procesos.service';
import { ProductoService } from 'src/app/Servicios/Productos/producto.service';
import { UtileriaService } from 'src/app/Servicios/Utileria/utileria.service';

@Injectable({
  providedIn: `root`
})

@Component({
  selector: 'app-Precargue_RollosDespacho',
  templateUrl: './Precargue_RollosDespacho.component.html',
  styleUrls: ['./Precargue_RollosDespacho.component.css']
})

export class Precargue_RollosDespachoComponent implements OnInit {

  load: boolean = false;
  modoSeleccionado: boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  form !: FormGroup;
  rollsToDispatch: any = [];
  rollsConsolidate: any = [];
  clients: any = [];
  searchIn: boolean | null = null;
  @ViewChild('dt') dt: null | undefined;
  products: any = [];
  storage_Id: number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre: any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  ValidarRol: number; //Variable que se usará en la vista para validar el tipo de rol
  editMode: boolean = false;
  rollsSelected: any = {};
  message: string = '';

  constructor(private AppComponent: AppComponent,
    private fmBuild: FormBuilder,
    private svZeus: InventarioZeusService,
    private msj: MensajesAplicacionService,
    private svProducts: ProductoService,
    private svProduction: Produccion_ProcesosService,
    private svPreload: Precargue_DespachoService,
    private svDetailsPreload: Detalles_PrecargueDespachoService,
    private PDFService: CreacionPdfService,
    private msg: MessageService,
    private utileria: UtileriaService
  ) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
    this.initForm();
  }

  ngOnInit() {
    this.lecturaStorage();
    this.focusInput(false);
  }

  ngOnDestroy(): void {
    this.focusInput(true);
  }

  // Función para mantener el puntero del mouse en un campo especifico. 
  focusInput(destroy: boolean) {
    let time = setInterval(() => {
      let preInBarsCode = document.getElementById('roll');
      if (!destroy && preInBarsCode) preInBarsCode.focus();
      else if (destroy) clearInterval(time);
    }, 30000);
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage() {
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  initForm() {
    this.form = this.fmBuild.group({
      doc: [null],
      roll: [null],
      clientStock: [false,],
      asesor: [null],
      //item : [null, Validators.required], 
      //reference : [null, Validators.required],
      idClient: [null, Validators.required],
      client: [null, Validators.required],
      observation: [null,],
    })
  }

  //*
  searchClientsByName() {
    let name = this.form.value.client;
    this.svZeus.getClientByName(name).subscribe(data => this.clients = data);
  }

  //*
  selectClient() {
    let client = this.clients.find(x => x.idcliente == this.form.value.client);
    this.form.patchValue({ 'idClient': client.idcliente, 'client': client.razoncial, 'asesor': client.idvende, });
  }

  //*
  searchProduct() {
    let nombre: string = this.form.value.reference;
    this.svProducts.obtenerItemsLike(nombre).subscribe(resp => this.products = resp);
  }

  //*
  selectedProduct() {
    let product: any = this.form.value.reference;
    this.form.patchValue({
      'item': product,
      'reference': this.products.find(x => x.prod_Id == product).prod_Nombre
    });
  }

  //*
  getItem() {
    this.load = true;
    let item: any = this.form.value.item;
    if (item) {
      this.svProducts.GetProductsById(item).subscribe(data => {
        this.form.patchValue({ 'item': item, 'reference': data[0].prod.prod_Nombre, });
        this.load = false;
      }, error => {
        this.msjs(`Error`, `No se encontró el item N° ${item}`);
        this.form.patchValue({ 'item': null, 'reference': null, });
      });
    } else this.msjs(`Advertencia`, `Debe llenar el campo ITEM`);
  }

  //*
  searchRolls() {
    let roll: number = this.form.value.roll;
    let client: any = this.form.value.idClient;
    let clientReal: any;
    let clientStock: boolean = this.form.value.clientStock;
    let count: number = 0;
    //let clients : any = this.clients.find(x => x.idcliente == client);

    if (this.form.valid) {
      this.disabledFieldRoll();
      if (roll) {
        clientStock ? clientReal = [1061, 1035] : clientReal = [client];
        if (this.rollsToDispatch.length > 0 && !clientStock) {
          if (!this.rollsToDispatch.map(x => x.idClient).includes(parseInt(client))) {
            this.msjs(`Advertencia`, `La orden de precargue solo puede tener un cliente!`);
            this.enabledFieldRoll();
            return;
          }
          this.enabledFieldRoll();
        }
        //this.load = true;

        clientReal.forEach(cr => {
          this.svProduction.getInformationDispatch(roll, cr).subscribe(data => {
            if (data) {
              let item: any = data[0].item;
              let stock: any = data[0].stock;

              if (stock > 0) {
                if (!this.rollsToDispatch.map(x => x.roll).includes(roll)) {
                  this.rollsToDispatch.unshift(data[0]);
                  this.consolidateItems();
                  this.msjs(`Confirmación`, `El rollo/bulto N° ${roll} ha sido agregado a la tabla!`);
                  this.enabledFieldRoll();
                } else {
                  this.msjs(`Advertencia`, `El rollo/bulto N° ${roll} ya se encuentra en la tabla!`);
                  this.enabledFieldRoll();
                }
                return;
              } else {
                this.msjs(`Advertencia`, `El item N° ${item} no tiene stock disponible!`);
                this.enabledFieldRoll();
                return;
              }
            } else {
              this.msjs(`Advertencia`, `El rollo/bulto N° ${roll} no se encuentra disponible!`);
              this.enabledFieldRoll();
            }
          }, error => {
            count += 1;
            if (count == clientReal.length) {
              [400, 404].includes(error.status) ? this.msjs(`Advertencia`, `El rollo/bulto N° ${roll} no se encuentra disponible!`) : this.msjs(`Error`, `Error consultando el rollo/bulto N° ${roll}`);
              this.enabledFieldRoll();
            }
          });
        });
      } else {
        this.enabledFieldRoll();
      }
    } else {
      this.msjs(`Advertencia`, `Debe llenar todos los campos`);
      this.enabledFieldRoll();
    }
  }

  disabledFieldRoll() {
    this.load = true;
    this.form.get('roll')?.disable();
  }

  enabledFieldRoll() {
    this.load = false;
    this.form.get('roll')?.enable();
    this.form.patchValue({ roll: null });
    document.getElementById('roll')?.focus();
  }

  //*
  consolidateItems() {
    this.rollsConsolidate = this.rollsToDispatch.reduce((acc, value) => {
      let find = acc.find(x => x.item == value.item);
      if (!find) acc.push(value);
      return acc;
    }, []);
  }

  //*
  qtyRollsItem = (data: any) => this.rollsToDispatch.filter(x => x.item == data.item).length;

  //*
  qtyTotalItem = (data: any) => this.rollsToDispatch.filter(x => x.item == data.item).reduce((a, b) => a += b.qty, 0);

  //*
  weightTotalItem = (data: any) => this.rollsToDispatch.filter(x => x.item == data.item).reduce((a, b) => a += b.weight, 0);

  //*
  quitRoll(data) {
    this.load = true;

    setTimeout(() => {
      this.msjs(`Advertencia`, `Se quitó el rollo N° ${data.roll} de la tabla!`);
      let index = this.rollsToDispatch.findIndex(x => x.rollo == data.roll && x.ot == data.ot);
      console.log(index);
      this.rollsToDispatch.splice(index, 1);
      this.load = false;
      this.consolidateItems();
    }, 500);
  }

  //*
  applyFilter = ($event, campo: any, table: any) => table!.filter(($event.target as HTMLInputElement).value, campo, 'contains');

  //*
  savePreload() {
    if (this.rollsToDispatch.length > 0) {
      this.load = true;
      let fechaActual: any = moment().format('YYYY-MM-DD');
      let horaActual: any = moment().format('HH:mm:ss');

      let info: modelPrecargue_Despacho = {
        Cli_Id: this.form.value.idClient,
        OF_Id: 4472, //OF GENERICA
        Pcd_FechaCrea: fechaActual,
        Pcd_HoraCrea: horaActual,
        Usua_Crea: this.storage_Id,
        Pcd_Observacion: this.form.value.observation,
        Estado_Id: 11,
        Pcd_FechaModifica: fechaActual,
        Pcd_HoraModifica: horaActual,
        Usua_Modifica: 0,
        Pcd_ObservacionModifica: '',
        Usua_Vendedor: parseInt(this.form.value.asesor),
      };

      this.onReject();
      this.svPreload.Post(info).subscribe(data => { this.saveDetailsPreload(data.pcd_Id); }, error => {
        this.msjs(`Error`, `Error guardando el encabezado del precargue de despacho | ${error.status} ${error.statusText}`);
      });
    }
  }

  //*
  saveDetailsPreload(id: number) {
    let count: number = 0;
    this.rollsToDispatch.forEach(x => {
      let info: modelDetalles_PrecargueDespacho = {
        'Pcd_Id': id,
        'Prod_Id': x.item,
        'DtlPcd_Rollo': x.roll,
        'DtlPcd_Cantidad': x.qty,
        'UndMed_Id': x.unit,
      }
      this.svDetailsPreload.Post(info).subscribe(data => {
        count += 1;
        if (count == this.rollsToDispatch.length) this.updateStatusRolls(id);
      });
    });
  }

  //*
  updateStatusRolls(id: number) {
    let rolls: Array<any> = [];
    this.rollsToDispatch.forEach(x => rolls.push({ 'of': 0, 'roll': x.roll, 'item': x.item, 'currentStatus': 19, 'newStatus': 50, 'envioZeus': true }));
    this.svProduction.putChangeStateProduction(rolls).subscribe(data => { this.createPDF(id, `creada`) }, error => {
      this.msjs(`Error`, `Error actualizando el estado de los rollos seleccionados`);
    });
  }

  clearFields() {
    this.form.reset();
    this.load = false;
  }

  clearAll() {
    this.form.reset();
    this.rollsToDispatch = [];
    this.rollsConsolidate = [];
    this.searchIn = null;
    this.load = false;
    this.editMode = false;
  }

  //* Función para acortar msjs 
  msjs(msj1: string, msj2: string) {
    this.load = false;
    switch (msj1) {
      case 'Confirmación':
        return this.msj.mensajeConfirmacion(msj1, msj2);
      case 'Advertencia':
        return this.msj.mensajeAdvertencia(msj1, msj2);
      case 'Error':
        return this.msj.mensajeError(msj1, msj2);
      default:
        return this.msj.mensajeAdvertencia(`No hay un tipo de mensaje asociado!`);
    }
  }
  /*
    getLastPreload = () => this.svPreload.getLastPreload().subscribe(data => this.form.patchValue({ 'doc': data.pcd_Id }), error => { this.msj.mensajeError(`Error`, `Error al consultar el último consecutivo del precargue.`) });
  
    searchPreload(){
      let preload : number = this.form.value.doc;
  
      if(preload){
        this.editMode = true;
        this.load = true;
        this.rollsToDispatch = [];
        this.rollsConsolidate = [];
  
        this.svDetailsPreload.getPreloadId(preload).subscribe(data => {
          if(data) {
            this.rollsToDispatch = data;
            this.rollsToDispatch.forEach(x =>{
              x.qty = x.quantity, 
              x.unit = x.presentation
            });
            this.loadInformationDispatch(data);
          } else {
            this.msjs(`Advertencia`, `No se encontró la orden de precargue N° ${preload}`);
            this.load = false;
          } 
        }, error => {
          this.msjs(`Error`, `Error al consultar la orden de precargue N° ${preload} | ${error.status} ${error.statusText}`);
          this.load = false;
        });
      }
    }
  
    loadInformationDispatch(data : any){
      this.load = false;
      this.form.patchValue({
        'idClient': data[0].idClient,
        'client': data[0].client,
        'observation': data[0].observation1,
      });
      this.consolidateItems();
    }
  
    //* Función para mostrar el msj de confirmación de eliminación de rollos
    msgDeleteRolls(data : any) {
      this.load = true;
      this.rollsSelected = {};
      this.rollsSelected = data;
      console.log(this.rollsSelected);
      this.msg.add({ severity:'warn', key:'deleteRoll', summary:'Elección', detail: `¿Está seguro que desea quitar/eliminar el rollo/bulto N° ${data.roll}?`, sticky: true});
    }
          
    onReject(key : any){
      this.load = false;
      this.msg.clear(key);
    }
  
    //* Función para eliminar rollos de una reposición
    deleteRollsFromReposition(data: any, currentStatus : any, newStatus : any){
      this.onReject('deleteRoll');
      this.load = true;
      let index : any = this.rollsToDispatch.findIndex(x => x.roll == data.roll);
      let roll : number = this.rollsSelected.rollPl;
      console.log(index, roll, newStatus, currentStatus);
      
      /*this.svDetailsPreload.Delete(roll).subscribe(dataPreload => {
        let infoRoll : any = [{'roll': data.roll, 'item': data.item, 'currentStatus' : currentStatus, 'newStatus' : newStatus, 'envioZeus' : true }]; 
        this.svProduction.putChangeStateProduction(infoRoll).subscribe(() => {
          this.msjs(`Confirmación`, `Se eliminó el rollo N° ${data.roll} de la reposición N° ${this.form.value.repo}!`);
          this.rollsToDispatch.splice(index, 1);
          this.load = false;
          this.consolidateItems();
        }, error => {
          this.msjs(`Error`, `No fue posible actualizar el estado del rollo N° ${data.roll} en producción | ${error.status} ${error.statusText}`);
          this.load = false;
        });
      }, error => {
        this.msjs(`Error`, `Error al eliminar el rollo N° ${data.roll} de la reposición N° ${this.form.value.repo} | ${error.status} ${error.statusText}`);
        this.load = false;
      });*/
  //}

  createPDF(id: number, action: string, onComplete?: () => void) {
    this.svDetailsPreload.getPreloadId(id).subscribe(data => {
      let title: string = `Orden de Precargue N° ${id}`;
      let content: any[] = this.PDFService.contentPDFPrecargue(data);
      this.PDFService.formatoPDF(title, content);
      this.msjs(`Confirmación`, `Orden de precargue N° ${id} ${action} exitosamente!. . A continuación se abrirá el PDF en una nueva pestaña.`);
      onComplete?.();
      setTimeout(() => this.clearAll(), 3000);
    }, error => {
      this.load = false;
      this.msjs(`Error`, `Error al consultar la orden de precargue N° ${id} | ${error.status} ${error.statusText}`);
      onComplete?.();
    });
  }

  // Mostrar mensaje de confirmación
  viewConfirmMessage() {
    let cliente = this.clients.find(x => x.idcliente == this.form.value.idClient).razoncial;
    this.message = `Está seguro que desea crear la orden de precargue para el cliente ${cliente}?`;
    setTimeout(() => {
      this.msg.add({ severity: 'warn', key: 'confirm', summary: 'Confirmación', detail: this.message, sticky: true });
    }, 200);
  }

  // Función para quitar mensaje confirmación.
  onReject = () => this.msg.clear('confirm');
}
