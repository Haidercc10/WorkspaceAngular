import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppComponent } from 'src/app/app.component';
import { InventarioZeusService } from 'src/app/Servicios/InventarioZeus/inventario-zeus.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { Produccion_ProcesosService } from 'src/app/Servicios/Produccion_Procesos/Produccion_Procesos.service';
import { ProductoService } from 'src/app/Servicios/Productos/producto.service';

@Component({
  selector: 'app-Precargue_RollosDespacho',
  templateUrl: './Precargue_RollosDespacho.component.html',
  styleUrls: ['./Precargue_RollosDespacho.component.css']
})
export class Precargue_RollosDespachoComponent implements OnInit {

  load : boolean = false;
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  form !: FormGroup;
  rollsToDispatch : any = [];
  rollsConsolidate : any = [];
  clients : any = [];
  searchIn: boolean | null = null;
  @ViewChild('dt') dt : null | undefined; 
  products : any = [];

  constructor(private AppComponent : AppComponent, 
    private fmBuild : FormBuilder,
    private svZeus : InventarioZeusService,
    private msj : MensajesAplicacionService,
    private svProducts : ProductoService,
    private svProduction : Produccion_ProcesosService,
  ) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
    this.initForm();
   }

  ngOnInit() {

  }

  initForm(){
    this.form = this.fmBuild.group({
      roll : [null],
      //process : [null],
      item : [null, Validators.required], 
      reference : [null, Validators.required],
      idClient : [null, Validators.required], 
      client : [null, Validators.required],
      observation : [null,], 
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
    this.form.patchValue({ 'idClient': client.idcliente, 'client': client.razoncial, });
  }

  //*
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
    this.load = true;
    let item : any = this.form.value.item;
    if(item) {
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
  searchRolls(){
    let roll : number = this.form.value.roll;
    let item : number = this.form.value.item;
    this.load = true;

    if(this.form.valid) {
      this.svProduction.getInformationDispatch(roll, item).subscribe(data => {
        if(!this.rollsToDispatch.map(x => x.roll).includes(roll)) {
          this.rollsToDispatch.unshift(data[0]);
          this.consolidateItems();
          this.msjs(`Confirmación`, `El rollo/bulto N° ${roll} ha sido agregado a la tabla!`);
          this.form.patchValue({ roll : null });
        } else this.msjs(`Advertencia`, `El rollo/bulto N° ${roll} ya se encuentra en la tabla!`);
      }, error => {
        error.status == 400 ? this.msjs(`Advertencia`, `El rollo/bulto N° ${roll} no se encuentra disponible!`) : this.msjs(`Error`, `Error consultando el rollo/bulto N° ${roll}`);
      });
    } else this.msjs(`Advertencia`, `Debe llenar todos los campos`);
  }

  consolidateItems(){
    this.rollsConsolidate = this.rollsToDispatch.reduce((acc, value) => {
      let find = acc.find(x => x.item == value.item);
      if(!find) acc.push(value);
      return acc;
    }, []);
  }

  qtyRollsItem = (data : any) => this.rollsToDispatch.filter(x => x.item == data.item).length;

  qtyTotalItem = (data : any) => this.rollsToDispatch.filter(x => x.item == data.item).reduce((a, b) => a += b.qty, 0);

  weightTotalItem = (data : any) => this.rollsToDispatch.filter(x => x.item == data.item).reduce((a, b) => a += b.weight, 0);

  quitRoll(data){}

  applyFilter = ($event, campo : any, table : any) => table!.filter(($event.target as HTMLInputElement).value, campo, 'contains');

  savePreload(){}

  saveDetailsPreload(){}

  clearFields(){
    this.form.reset();
    this.load = false;
  }

  clearAll(){
    this.form.reset();
    this.rollsToDispatch = [];
    this.rollsConsolidate = [];
    this.searchIn = null;
    this.load = false;
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
}
