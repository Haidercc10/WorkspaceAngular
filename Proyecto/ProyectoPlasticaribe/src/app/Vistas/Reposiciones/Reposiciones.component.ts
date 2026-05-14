import { Component, Injectable, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import moment from 'moment';
import { createPdf } from 'pdfmake/build/pdfmake';
import { MessageService } from 'primeng/api';
import { AppComponent } from 'src/app/app.component';
import { modelDetalles_PrecargueDespacho } from 'src/app/Modelo/modelDetalles_PrecargueDespacho';
import { modelDetalles_Reposiciones } from 'src/app/Modelo/modelDetalles_Reposiciones';
import { modelPrecargue_Despacho } from 'src/app/Modelo/modelPrecargue_Despacho';
import { modelReposiciones } from 'src/app/Modelo/modelReposiciones';
import { CreacionPdfService } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';
import { Detalles_PrecargueDespachoService } from 'src/app/Servicios/Detalles_PrecargueDespacho/Detalles_PrecargueDespacho.service';
import { Detalles_ReposicionesService } from 'src/app/Servicios/Detalles_Reposiciones/Detalles_Reposiciones.service';
import { DetallesDevolucionesProductosService } from 'src/app/Servicios/DetallesDevolucionRollosFacturados/DetallesDevolucionesProductos.service';
import { DevolucionesProductosService } from 'src/app/Servicios/DevolucionesRollosFacturados/DevolucionesProductos.service';
import { FallasTecnicasService } from 'src/app/Servicios/FallasTecnicas/FallasTecnicas.service';
import { InventarioZeusService } from 'src/app/Servicios/InventarioZeus/inventario-zeus.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { Precargue_DespachoService } from 'src/app/Servicios/Precargue_Despacho/Precargue_Despacho.service';
import { Produccion_ProcesosService } from 'src/app/Servicios/Produccion_Procesos/Produccion_Procesos.service';
import { ProductoService } from 'src/app/Servicios/Productos/producto.service';
import { ReposicionesService } from 'src/app/Servicios/Reposiciones/Reposiciones.service';
import { UsuarioService } from 'src/app/Servicios/Usuarios/usuario.service';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-Reposiciones',
  templateUrl: './Reposiciones.component.html',
  styleUrls: ['./Reposiciones.component.css']
})

export class ReposicionesComponent implements OnInit, OnChanges {

  load : boolean = false;
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  form !: FormGroup;
  rollsToDispatch : any = [];
  rollsConsolidate : any = [];
  clients : any = [];
  searchIn: boolean | null = null;
  @ViewChild('dt') dt : null | undefined; 
  products : any = [];
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol
  edition : boolean = false; //
  rollsSelected : any = {};
  action : string = `Generar`;
  lastRepo : number | null = null;
  repositionForDv : boolean = false;
  fails : any = [];
  users : any = [];
  @Input() dato: any

  constructor(private AppComponent : AppComponent, 
    private fmBuild : FormBuilder,
    private svZeus : InventarioZeusService,
    private msj : MensajesAplicacionService,
    private svProducts : ProductoService,
    private svProduction : Produccion_ProcesosService,
    private svRepo : ReposicionesService,
    private svDtlRepo : Detalles_ReposicionesService,
    private svPDF : CreacionPdfService,  
    private msg : MessageService, 
    private svDetDevolutions : DetallesDevolucionesProductosService,
    private svDevolutions : DevolucionesProductosService,
    private svFails : FallasTecnicasService,
    private svUsers : UsuarioService, 
  ) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
    this.initForm();
  }

  ngOnChanges() {
    if (this.dato) {
      console.log(this.dato);
      this.form.patchValue({ 'client' : this.dato.clientes.cli_Nombre, 'idClient' : this.dato.or.cli_Id, 'dev' : this.dato.or.id, fail : 182, 'sales' : this.dato.clientes.usua_Id, });
    }
  }

  ngOnInit() {
    this.lecturaStorage();
    this.getLastReposition();
    this.getFails();
    this.getUsers();
    //this.createPDF(1, `creada`);
  }

  //*
  formatonumeros = (number : any) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  getFails = () =>  this.svFails.srvObtenerLista().subscribe(datos => { this.fails = datos.filter((item) => item.tipoFalla_Id == 25) });

  getUsers = () => this.svUsers.srvObtenerListaUsuario().subscribe(d => { this.users = d.filter(x => [100, 110, 9520, 117, 101, 3123, 1, 5, 30, 60, 111, 270, 304, 331, 435, 483, 531, 603, 713, 853].includes(x.usua_Id)); });

  getLastReposition() {
    this.svRepo.getLastReposition().subscribe(repo => { 
      this.lastRepo = repo;
      this.form.patchValue({ 'repo' : this.lastRepo }); 
    }, error => { 
      this.msj.mensajeError(`Error`, `${error.status} ${error.statusText}`); 
    })
  } 

  initForm(){
    this.form = this.fmBuild.group({
      repo : [null],
      roll : [null],
      dev : [null ],
      //process : [null],
      //item : [null, Validators.required], 
      //reference : [null, Validators.required],
      idClient : [null, Validators.required], 
      client : [null, Validators.required],
      clientStock : [false, ],
      observation : [null, Validators.required], 
      fail : [null, ],
      user : [null, ],
      sales : [null, ],
    });
  }

  //* Función para buscar clientes por nombre
  searchClientsByName() {
    let name = this.form.value.client;
    this.svZeus.getClientByName(name).subscribe(data => this.clients = data);
  }

  //* Función para seleccionar clientes
  selectClient() {
    let client = this.clients.find(x => x.idcliente == this.form.value.client);
    this.form.patchValue({ 'idClient': client.idcliente, 'client': client.razoncial, 'sales' : parseInt(client.idvende) });
  }

  //* Función para buscar productos por nombre
  searchProduct() {
    let nombre: string = this.form.value.reference;
    this.svProducts.obtenerItemsLike(nombre).subscribe(resp => this.products = resp);
  }

  //*
  selectedProduct() {
    let product : any = this.form.value.reference;
    this.form.patchValue({
      'item': product,
      'reference': this.products.find(x => x.prod_Id == product).prod_Nombre
    });
  }

  //*
  getItem(){
    let item : any = this.form.value.item;
    if(item) {
      this.load = true;
      this.svProducts.GetProductsById(item).subscribe(data => {
        this.form.patchValue({ 'item': item, 'reference': data[0].prod.prod_Nombre, });
        this.load = false;
      }, error => {
        this.msjs(`Error`, `No se encontró el item N° ${item} | ${error.status} ${error.statusText}`);
        this.form.patchValue({ 'item': null, 'reference': null, });
        this.load = false;
      });
    } else this.msjs(`Advertencia`, `Debe llenar el campo ITEM`);
  }

  //* Función para editar reposiciones.
  searchRepositions(movement? : number){
    console.log(movement);
    this.rollsToDispatch = [];
    this.rollsConsolidate = [];
    this.edition = false;
    this.action = `Generar`;
    let repo : number = !movement ? this.form.value.repo : movement;
    
    if(repo) {
      this.load = true;
      this.svDtlRepo.getRepositionId(repo).subscribe(data => {
        if((!movement && data[0].statusId == 5) || data[0].statusId == 3) {
          this.msjs(`Advertencia`, `La reposición N° ${repo} no se encuentra disponible!`);
          this.load = false;
          this.clearFields();
          return;
        } 
        this.edition = true;
        this.loadTable(data);
        this.loadClient(data[0]);
        this.consolidateItems();
        this.action = `Editar`;
      }, error => {
        this.msjs(`Error`, `Error consultando la reposición N° ${repo} | ${error.status} ${error.statusText}`);
      });
    } else this.msjs(`Advertencia`, `Debe digitar el N° de la reposición`);
  }

  //* Función para cargar tabla con los registros a editar.
  loadTable(data : any){
    data.forEach(x => {
      this.rollsToDispatch.push({
        'roll' : x.roll,
        'rollPl' : x.codeDetail,
        'item' : x.item,
        'reference' : x.reference,
        'idClient' : x.idClient,
        'client' : x.client,
        'qty' : x.quantity,
        'weight' : x.weight,
        'unit' : x.presentation,
        'ot' : x.ot,
        'processId' : x.processId,
        'process' : x.process,
        'price' : x.price,
        'inRepo' : true,
      });
    });
    this.load = false;
  }

  //* Función para cargar los datos del encabezado de la reposición
  loadClient(data : any){
    this.form.patchValue({
      'client' : data.client, 
      'idClient' : data.idClient,
      'observation' : data.observation1,
    });
  }

  loadClientReposition(data : any){
    this.form.patchValue({ 'client' : data.clientes.cli_Nombre, 'idClient' : data.or.cli_Id, 'dev' : data.or.id });
  } 

  //* Función para buscar rollo a rollo lo que se le va a reponer al cliente. 
  searchRolls(){
    let roll : number = this.form.value.roll;
    let client : any = this.form.value.idClient;
    let clientReal : any;
    let clientStock : boolean = this.form.value.clientStock;
    let count : number = 0;

    if(this.form.valid) {
      clientStock ? clientReal = [1061, 1035] : clientReal = [client];
      console.log(clientReal);
      if(this.rollsToDispatch.length > 0 && !clientStock) {
        if (!this.rollsToDispatch.map(x => x.idClient).includes(parseInt(client))) {
          this.msjs(`Advertencia`, `La reposición solo puede tener un cliente!`);
          return;
        }
      }
      this.load = true;
      clientReal.forEach(cr => {
        this.svProduction.getInformationDispatch(roll, cr).subscribe(data => {
          if(!this.rollsToDispatch.map(x => x.roll).includes(roll)) {
            this.rollsToDispatch.unshift(data[0]);
            this.consolidateItems();
            this.msjs(`Confirmación`, `El rollo/bulto N° ${roll} ha sido agregado a la tabla!`);
            this.form.patchValue({ roll : null });
          } else this.msjs(`Advertencia`, `El rollo/bulto N° ${roll} ya se encuentra en la tabla!`);
          return;
        }, error => {
          count += 1;
          if(count == clientReal.length) {
            [400, 404].includes(error.status) ? this.msjs(`Advertencia`, `El rollo/bulto N° ${roll} no se encuentra disponible!`) : this.msjs(`Error`, `Error consultando el rollo/bulto N° ${roll}`);
            this.form.patchValue({ roll : null });
          }
        });
      });
      
    } else this.msjs(`Advertencia`, `Debe llenar todos los campos!`);
  }

  //* Función para consolidar los items en la primera tabla.
  consolidateItems(){
    this.rollsConsolidate = this.rollsToDispatch.reduce((acc, value) => {
      let find = acc.find(x => x.item == value.item);
      if(!find) acc.push(value);
      return acc;
    }, []);
  }

  //*
  qtyRollsItem = (data : any) => this.rollsToDispatch.filter(x => x.item == data.item).length;

  //*
  qtyTotalItem = (data : any) => this.rollsToDispatch.filter(x => x.item == data.item).reduce((a, b) => a += b.qty, 0);

  //*
  weightTotalItem = (data : any) => this.rollsToDispatch.filter(x => x.item == data.item).reduce((a, b) => a += b.weight, 0);

  //*
  quitRoll(data){
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
  applyFilter = ($event, campo : any, table : any) => table!.filter(($event.target as HTMLInputElement).value, campo, 'contains');

  //*
  saveReposition(dev? : number){
    if(this.rollsToDispatch.length > 0) {
      this.load = true;
      let info : modelReposiciones = {
        Cli_Id: this.form.value.idClient,
        Rep_FechaCrea: moment().format('YYYY-MM-DD'),
        Rep_HoraCrea: moment().format('HH:mm:ss'),
        Usua_Crea: this.storage_Id,
        Rep_Observacion: this.form.value.observation,
        Estado_Id: 11,
        Rep_FechaSalida: moment().format('YYYY-MM-DD'),
        Rep_HoraSalida: moment().format('HH:mm:ss'),
        Usua_Salida: this.storage_Id,
        Rep_ObservacionSalida: '',
        Falla_Id : this.form.value.fail,
        Usua_Autoriza : this.form.value.user, 
        Usua_Vendedor : this.form.value.sales == undefined ? null : this.form.value.sales,
      };
      this.svRepo.Post(info).subscribe(data => { this.saveDetailsReposition(data.rep_Id, dev); }, error => { 
        this.msjs(`Error`, `Error guardando el encabezado de la reposición | ${error.status} ${error.statusText}`); 
        this.load = false;
      });
    }
  }

  //*
  saveDetailsReposition(id : number, devId? : number){
    let count : number = 0;
    this.rollsToDispatch.forEach(x => {
      let info : modelDetalles_Reposiciones = {
        'Rep_Id': id,
        'Prod_Id': x.item,
        'DtlRep_Rollo': x.roll,
        'DtlRep_Cantidad': x.qty,
        'UndMed_Id': x.unit,
      }
      this.svDtlRepo.Post(info).subscribe(data => {
        count += 1;
        if(count == this.rollsToDispatch.length) this.updateStatusRolls(id, this.rollsToDispatch, devId);
      });
    });
  }

  updateStatusDev(dev : number, repo : number){
    let status : number = 39;
    let date : any = moment().format('YYYY-MM-DD');
    let hour : string = moment().format('HH:mm:ss');

    this.svDevolutions.PutStatusDevolution(dev, status, date, hour, this.storage_Id, true, false, '').subscribe(data => {
      this.createPDF(repo, 'actualizada');
    }, error => {
      this.msjs('Error', `No fue posible actualizar el estado de la devolución N° ${dev}!`);
      this.load = false;
    });
  }

  //*
  updateStatusRolls(repo : number, bults : any, dev? : any){
    let rolls : Array<any> = [];
    bults.forEach(x => rolls.push({'of' : 0, 'roll' : x.roll, 'item' : x.item, 'currentStatus' : 19, 'newStatus' : 23, 'envioZeus' : true }));    
    this.svProduction.putChangeStateProduction(rolls).subscribe(data => { 
      dev ? this.updateDevolution(dev, repo) : this.createPDF(repo, `creada`);
    }, error => { 
      this.msjs(`Error`, `Error actualizando el estado de los rollos seleccionados | ${error.status} ${error.statusText}`); 
    });
  }

  sendAdjustmentZeus() {
    let counter : number = 0;
    let dev : number = this.form.value.dev;

    if (this.rollsConsolidate.length > 0) {
      this.load = true;
      this.rollsConsolidate.forEach(data => {
        let unity : string = data.unit == 'Kg' ? 'KLS' : data.unit == 'Und' ? 'UND' : 'PAQ';
        let qty : number = this.qtyTotalItem(data);
        let item : string = data.item; 
        let price : string = data.price;
        let detail : string = `Ajuste desde App Plasticaribe por concepto de REPOSICION al Item ${item} con cantidad de ${(-(qty))} ${unity}`;

        this.svZeus.getExistenciasProductos(data.item, unity).subscribe(dataExis => {
          if(dataExis.length == 0 || (dataExis[0].existencias < qty.toFixed(2) || !dataExis)) {
            console.log(dataExis);
            let qtyZeus : number = dataExis.length == 0 ? 0 : dataExis[0].existencias;
            console.log(qtyZeus);
            console.log(qty)
            let message : string = `La cantidad del item ${data.item} en Plasticaribe "${qty.toLocaleString()} ${unity}" es mayor al stock de Zeus "${qtyZeus.toLocaleString()} ${unity}"`
            this.msjs(`Advertencia`, message);
            return;
          } else {
            this.svProduction.sendProductionToZeus(detail, item, unity, 0, (-(qty)).toString(), price).subscribe(dataAdjusment => {
              if(dataAdjusment.body.includes('<code>SUCESS</code>')) {
                counter++;
                if(counter == this.rollsConsolidate.length) this.saveReposition(dev);
              }
            }, error => { this.msjs(`Error`, `No fue posible enviar el ajuste a Zeus | ${error.status} ${error.statusText }`); })
          }  
        }, error => { 
          console.log(3);
          this.msjs(`Error`, `No fue posible enviar el ajuste a Zeus! | ${error.status} ${error.statusText}`); 
        });
      });
    } else this.msj.mensajeAdvertencia(`Advertencia`, `No hay rollos agregados!`);  
  }

  //* Función para mostrar el msj de confirmación de eliminación de rollos
  msgDeleteRolls(data : any) {
    this.load = true;
    this.rollsSelected = {};
    this.rollsSelected = data;
    console.log(this.rollsSelected);
    this.msg.add({ severity:'warn', key:'deleteRoll', summary:'Elección', detail: `¿Está seguro que desea eliminar el rollo/bulto N° ${data.roll} de la carta N° ${this.form.value.repo}?`, sticky: true});
  }

  //* Función para eliminar rollos de una reposición
  deleteRollsFromReposition(data: any, currentStatus : any, newStatus : any){
    this.onReject('deleteRoll');
    this.load = true;
    let index : any = this.rollsToDispatch.findIndex(x => x.roll == data.roll);
    let roll : number = this.rollsSelected.rollPl;
    
    this.svDtlRepo.Delete(roll).subscribe(dataRep => {
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
    });
  }

  //? Funciones para quitar rollo de la reposición y 
  //? realizar ajuste para que vuelvan a inventario Zeus y PL 

  //* Función que hará un ajuste positivo a Zeus al rollo que se elimine de la reposición.
  sendPositiveAdjustment(data : any){
    this.onReject('deleteRoll');
    data = this.rollsSelected;

    let unity : string = data.unit == 'Kg' ? 'KLS' : data.unit == 'Und' ? 'UND' : 'PAQ';
    let qty : number = data.qty;
    let item : string = data.item; 
    let price : string = data.price;
    let detail : string = `Ajuste desde App Plasticaribe por concepto de REPOSICION al Item ${item} con cantidad de ${((qty))} ${unity}`;

    this.svProduction.sendProductionToZeus(detail, item, unity, 0, ((qty)).toString(), price).subscribe(dataAdjusment => {
      this.deleteRollsFromReposition(data, 23, 19)
    }, error => { this.msjs(`Error`, `No fue posible enviar el ajuste positivo a Zeus | ${error.status} ${error.statusText}`); })
  }

  //*Función para actualizar el estado de los rollos de agregados a la reposición 
  updateStatusRoll(data : any){
    let roll : any = [];
    roll.push({'roll' : data.roll, 'item' : data.item, 'currentStatus' : 23, 'newStatus' : 19, 'envioZeus' : true });
    this.svProduction.putChangeStateProduction(roll).subscribe(data => { 
    }, error => { 
      this.msjs(`Error`, `Error actualizando el estado de los rollos seleccionados | ${error.status} ${error.statusText}`); 
    });
  }

  //? Funciones para agregar bultos a la reposición, si hay 2 o menos items se crea ajuste en Zeus.
  addRollsToReposition(){
    let repo : any = this.form.value.repo; 
    let count : number = 0;
    let rolls : any = [];
    rolls = this.rollsToDispatch.filter(x => !x.inRepo);
    if(rolls.length > 0) {
      rolls.forEach(x => {
        let info : modelDetalles_Reposiciones = {
          'Rep_Id': repo,
          'Prod_Id': x.item,
          'DtlRep_Rollo': x.roll,
          'DtlRep_Cantidad': x.qty,
          'UndMed_Id': x.unit,
        }
        this.svDtlRepo.Post(info).subscribe(data => {
          count++
          if(rolls.length == count) this.updateStatusRolls(repo, rolls);
        }, error => {
          this.msj.mensajeError(`Error`, `Error al agregar rollos a la reposición | ${error.status} ${error.statusText}`)
        });
      });
    } else {
      this.createPDF(repo, `actualizada`);
    }
  }

  loadFunction(){
    let repo : any = this.form.value.repo; 
    if(repo) {
      let rolls : any = [];
      this.rollsToDispatch.filter(x => !x.inRepo).forEach(x => {
        if(!rolls.map(z => z.item).includes(x.item)) {
          rolls.push({
            'roll' : x.roll,
            'rollPl' : x.rollPl,
            'item' : x.item,
            'reference' : x.reference,
            'idClient' : x.idClient,
            'client' : x.client,
            'qty' : x.qty,
            'weight' : x.weight,
            'unit' : x.unit,
            'ot' : x.ot,
            'processId' : x.processId,
            'process' : x.process,
            'price' : x.price,
            'inRepo' : false,
          });
        } else {
          let index : number = rolls.findIndex(y => y.item == x.item);
          rolls[index].qty += x.qty;
        }
      });
      if(rolls.length > 0) this.adjustmentZeus(rolls);
      else this.addRollsToReposition();
    } else this.msjs(`Advertencia`, `Debe digitar un número de reposición válido!`);
  }

  adjustmentZeus(data : any){
    let count : number = 0;
    data.forEach(x => {
      let unity : string = x.unit == 'Kg' ? 'KLS' : x.unit == 'Und' ? 'UND' : 'PAQ';
      let qty : number = x.qty;
      let item : string = x.item; 
      let price : string = x.price;
      let detail : string = `Ajuste desde App Plasticaribe realizado por el usuario ${this.storage_Nombre} por concepto de REPOSICION al Item ${item} con cantidad de ${(-(qty))} ${unity}`;

      this.svProduction.sendProductionToZeus(detail, item, unity, 0, (-(qty)).toString(), price).subscribe(dataAdjusment => {
        count++
        if(data.length == count) this.addRollsToReposition();
      }, error => { this.msjs(`Error`, `No fue posible enviar el ajuste positivo a Zeus | ${error.status} ${error.statusText}`); })
    });
  }

  getItemsFromDevolution(data : any){
    this.svDetDevolutions.GetInformationDevById(data.or.id).subscribe(data => {
      console.log(data);
    }, error => {
      console.log(error);
    });
  }

  updateDevolution(dev : number, repo : number){
    this.svDevolutions.PutStatusDVForReposition(dev, repo).subscribe(data => {
      this.createPDF(repo, 'creada');
    }, error => console.log(error));
  }

  onReject(key : any){
    this.load = false;
    this.msg.clear(key);
  }

  clearFields(){
    this.form.reset();
    this.load = false;
    this.repositionForDv = false;
    this.getLastReposition();
  }

  clearAll(){
    this.form.reset();
    this.rollsToDispatch = [];
    this.rollsConsolidate = [];
    this.searchIn = null;
    this.load = false;
    this.action = `Generar`;
    this.edition = false;
    this.getLastReposition();
    this.repositionForDv = false;
  }

  //* Función para acortar msjs 
  msjs(msj1 : string, msj2 : string) {
    this.load = false;
    switch (msj1) {
      case 'Confirmación' :
        return this.msj.mensajeConfirmacion(msj1, msj2);
      case 'Advertencia' : 
        return this.msj.mensajeAdvertencia(msj1, msj2);
      case 'Error' : 
        return this.msj.mensajeError(msj1, msj2);
      default :
        return this.msj.mensajeAdvertencia(`No hay un tipo de mensaje asociado!`); 
    }
  }

  createPDF(id : number, action : string) {
    this.svDtlRepo.getRepositionId(id).subscribe(data => {
      let title: string = `Carta de Reposición N° 00${id} ${action}`; 
      let content: any[] = this.contentPDF(data);
      this.svPDF.formatoPDF(title, content);
      this.msjs(`Confirmación`, `Carta de Reposición N° ${id} ${action} exitosamente!`);
      setTimeout(() => this.clearAll(), 3000);
    }, error => this.msjs(`Error`, `Error al consultar la reposición N° ${id} | ${error.status} ${error.statusText}`));
  }

  contentPDF(data): any[] {
    let content: any[] = [];
    let consolidatedInformation: Array<any> = this.getInfoGroupedPDF(data);
    let informationProducts: Array<any> = this.getInfoDetailsPDF(data);

    content.push(this.infoDate(data[0]));
    content.push(this.infoClient(data[0]));
    //content.push(this.infoMovementPDF(data[0]));
    content.push(this.tablaGroupedPDF(consolidatedInformation));
    content.push(this.tableTotals(consolidatedInformation))
    content.push(this.tablaDetailsPDF(informationProducts));
    content.push(this.infoAtte());
    return content;
  }

  getInfoGroupedPDF(data: any): Array<any> {
    let info: Array<any> = [];
    let contador: number = 0;
    data.forEach(d => {
      if (!info.map(x => x.Item).includes(d.item)) {
        contador++;
        let cantRegistros : number = data.filter(x => x.item == d.item).length;
        let quantity: number = 0;
        let weight: number = 0;
        data.filter(x => x.item == d.item).forEach(x => {
          weight += x.weight,
          quantity += x.quantity
        });
        
        info.push({
          "#": contador,
          "Item": d.item,
          "Referencia": d.reference,
          "Rollos" : cantRegistros,
          "Peso": this.formatonumeros(weight.toFixed(2)),
          "Cantidad" : this.formatonumeros(quantity.toFixed(2)),
          "Und" : d.presentation,
        });
      }
    });
    return info;
  }

  getInfoDetailsPDF(data: any): Array<any> {
    let info: Array<any> = [];
    let count: number = 0;

    data.forEach(d => {
      count++;
      info.push({
        "#": count,
        "Rollo": d.roll,
        "OT": d.ot,
        "Item": d.item,
        "Referencia": d.reference,
        "Peso": this.formatonumeros(d.weight),
        "Cantidad" : this.formatonumeros(d.quantity), 
        "Und" : d.presentation,
      });
    });
    return info;
  }

  infoClient(data : any){
    return {
      margin : [0, 0, 0, 15],
      table: {
        widths: ['*'],
        body: [
          [
            { text: `Señor(a)(es):`, alignment: '', fontSize: 12, bold: true, border: [false, false, false, false], },
          ],
          [
            { text: `E.S.M`, alignment: '', fontSize: 11, bold: true, border: [false, false, false, false], },
          ],
          [
            { text: `${data.client}`, alignment: '', fontSize: 11, bold: true, border: [false, false, false, false], },
          ],
          [
            { text: ``, alignment: '', fontSize: 11, bold: true, border: [false, false, false, false], },
          ], 
          [
            { text: ``, alignment: '', fontSize: 11, bold: true, border: [false, false, false, false], },
          ], 
          [
            { text: `Por medio del presente documento N° 00${data.movement} por motivo de ${data.fail}, solicitado por ${data.authorize} se hace entrega de la(s) siguiente(s) referencias:`, alignment: '', fontSize: 12, border: [false, false, false, false], },
          ],
        ]
      },
    }
  }

  infoDate(data : any){
    return {
      margin : [0, 0, 0, 15],
      table: {
        widths: ['*'],
        body: [
          [
            { text: `Barranquilla, ${moment(data.date1.replace('T00:00:00', '')).format('LLLL').replace(' 0:00', '')}`, alignment: '', fontSize: 12, border: [false, false, false, false], },
          ],
        ]
      },
    }
  }

  infoAtte(){
    return {
      margin : [0, 0, 0, 0],
      table: {
        widths: ['*'],
        body: [
          [
            { text: `Atentamente:`, alignment: '', bold : true, fontSize: 12, border: [false, false, false, false], },
          ],
          [
            { text: ``, alignment: '', fontSize: 12, border: [false, false, false, false], },
          ],
          [
            { text: ``, alignment: '', fontSize: 12, border: [false, false, false, false], },
          ],
          [
            { text: ``, alignment: '', fontSize: 12, border: [false, false, false, false], },
          ],
          [
            { text: ``, alignment: '', fontSize: 12, border: [false, false, false, false], },
          ],
          [
            { text: ``, alignment: '', fontSize: 12, border: [false, false, false, false], },
          ],
          [
            { text: `_________________`, alignment: '', fontSize: 12, border: [false, false, false, false], },
          ],
          [
            { text: `GERENCIA GENERAL`, alignment: '', bold : true, fontSize: 10, border: [false, false, false, false], },
          ],
        ]
      },
    }
  }

  //Función que muestra una tabla con la información general del ingreso.
  infoMovementPDF(data : any): {} {
    let date1 : any = data.date1.replace('T00:00:00', '');
    let date2 : any = data.date2.replace('T00:00:00', '');
    
    return {
      margin : [0, 0, 0, 20],
      table: {
        widths: ['34%', '33%', '33%'],
        body: [
          [
            { text: `Información general del movimiento`, colSpan: 3, alignment: 'center', fontSize: 10, bold: true }, {}, {}
          ],
          [
            { text: `Reposición N°: ${data.movement}`}, 
            { text: `Usuario: ${data.user1}` },
            { text: `Fecha Doc: ${data.date1.replace('T00:00:00', '')} ${data.hour1}` },
          ],
          [
            { text: `Estado: ${data.status}`}, 
            { text: `Usuario Salida: ${data.user2 == 0 ? '' : data.user2}` },
            { text: `Fecha Salida: ${date1 == date2 ? '' : date2} ${data.hour1 == data.hour2 ? '' : data.hour2}` },
          ],
          [
            { text: `Observación Reposición: ${data.observation1 == null ? '' : data.observation1}`, colSpan: 3, fontSize: 9, }, {}, {}
          ],
          [
            { text: `Observación Salida.: ${data.observation2 == null ? '' : data.observation2}`, colSpan: 3, fontSize: 9, }, {}, {}
          ], 
        ]
      },
      fontSize: 9,
      layout: {
        fillColor: function (rowIndex) {
          return (rowIndex == 0) ? '#DDDDDD' : null;
        }
      }
    }
  }

  //Función que consolida la información por mat. primas
  tablaGroupedPDF(data) {
    let columns: Array<string> = ['#', 'Item', 'Referencia', 'Rollos', 'Peso', 'Cantidad', 'Und'];
    let widths: Array<string> = ['5%', '10%', '45%', '10%', '10%', '10%', '10%'];
    return {
      table: {
        headerRows: 2,
        widths: widths,
        body: this.buildTableBody1(data, columns, 'Consolidado por Item'),
      },
      fontSize: 8,
      layout: {
        fillColor: function (rowIndex) {
          return (rowIndex <= 1) ? '#DDDDDD' : null;
        }
      }
    };
  }

  //Tabla con materiales recuperados ingresados detallados
  tablaDetailsPDF(data) {
    let columns: Array<string> = ['#', 'Rollo', 'OT', 'Item', 'Referencia', 'Peso', 'Cantidad', 'Und'];
    let widths: Array<string> = ['5%', '8%', '8%', '8%', '45%', '8%', '10%', '8%'];
    return {
      margin: [0, 20, 0, 45],
      table: {
        headerRows: 2,
        widths: widths,
        body: this.buildTableBody2(data, columns, 'Información detallada de rollos/bultos'),
      },
      fontSize: 8,
      layout: {
        fillColor: function (rowIndex) {
          return (rowIndex <= 1) ? '#DDDDDD' : null;
        }
      }
    };
  }

  //Tabla con los valores totales de pesos y registros
  tableTotals(data : any){
    return {
      fontSize: 8,
      bold: false,
      table: {
        widths: ['5%', '10%', '45%', '10%', '10%', '10%', '10%'],
        body: [
          [
            { text: ``, bold : true, border: [true, false, false, true], },
            { text: ``, bold : true, border: [false, false, false, true], },
            { text: `Totales`, alignment: 'right', bold : true, border: [false, false, true, true], },
            { text: `${this.formatonumeros((data.reduce((a, b) => a += parseInt(b.Rollos), 0)))}`, bold : true, border: [false, false, true, true], },
            { text: `${this.formatonumeros((data.reduce((a, b) => a += parseFloat(b.Peso), 0)).toFixed(2))}`, bold : true, border: [false, false, true, true], },
            { text: `${this.formatonumeros((data.reduce((a, b) => a += parseFloat(b.Cantidad), 0)).toFixed(2))}`, bold : true, border: [false, false, true, true], },
            { text: ``, bold : true, border: [false, false, true, true], },
          ],
        ],
      }
    }
  }

  buildTableBody1(data, columns, title) {
    var body : any = [];
    body.push([{ colSpan: 7, text: title, bold: true, alignment: 'center', fontSize: 10 }, '', '', '', '', '', '']);
    body.push(columns);
    data.forEach(function (row) {
      var dataRow : any = [];
      columns.forEach((column) => dataRow.push(row[column].toString()));
      body.push(dataRow);
    });
    return body;
  }

  buildTableBody2(data, columns, title) {
    var body : any = [];
    body.push([{ colSpan: 8, text: title, bold: true, alignment: 'center', fontSize: 10 }, '', '', '', '', '', '', '',]);
    body.push(columns);
    data.forEach(function (row) {
      var dataRow : any = [];
      columns.forEach((column) => dataRow.push(row[column].toString()));
      body.push(dataRow);
    });
    return body;
  }

}
