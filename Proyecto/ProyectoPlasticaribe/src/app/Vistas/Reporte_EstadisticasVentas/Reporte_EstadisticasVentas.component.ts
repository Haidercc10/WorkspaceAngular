import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AnyCnameRecord } from 'dns';
import moment from 'moment';
import { Table } from 'primeng/table';
import { InventarioZeusService } from 'src/app/Servicios/InventarioZeus/inventario-zeus.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { UsuarioService } from 'src/app/Servicios/Usuarios/usuario.service';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-Reporte_EstadisticasVentas',
  templateUrl: './Reporte_EstadisticasVentas.component.html',
  styleUrls: ['./Reporte_EstadisticasVentas.component.css']
})
export class Reporte_EstadisticasVentasComponent implements OnInit {
  
  form !: FormGroup;
  info : any = [];
  vendors : any = [];
  clients : any = [];
  modoSeleccionado : boolean = false;
  load : boolean = false;
  years : any = [];
  infoTable : any = [];
  @ViewChild('dt') dt : Table | undefined;

  constructor(private formBuilder : FormBuilder,
    private AppComponent : AppComponent, 
    private svcZeus : InventarioZeusService, 
    private svcUsers : UsuarioService, 
    private svcMsjs : MensajesAplicacionService,) {
    this.initForm();
   }

  ngOnInit() {
    this.getVendors();
    this.loadYears();
  }

  initForm() {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
    this.form = this.formBuilder.group({
      year : [null],
      idClient : [null],
      client : [null],
      idVendor : [null],
      vendor : [null],
    });
  }

   // Funcion que se encargará de obtener los vendedores
  getVendors(){
    this.svcUsers.GetVendedores().subscribe(resp => this.vendors = resp);
  }

  // Funcion que se encargará de colocar la información del vendedor seleccionado
  selectedVendor(){
    let vendor : any = this.form.value.vendor;
    this.form.patchValue({
      idVendor : vendor,
      vendor : this.vendors.find(x => x.usua_Id == vendor).usua_Nombre  
    });
  }

  // Funcion que se encargará de buscar los clientes
  getClients(){
    let name : string = this.form.value.client;
    this.svcZeus.LikeGetClientes(name).subscribe(resp => this.clients = resp);
  }

  // Funcion que se encargará de colocar la información de los clientes en cada uno de los campos
  selectedClient(){
    let client : any = this.form.value.client;
    this.form.patchValue({
      idClient : client,
      client : this.clients.find(x => x.idcliente == client).razoncial
    });
  }

  // Función que se encarga de cargar la estadistica de venta de los años seleccionados
  getStatictics(){
    
    let years : any = this.form.value.year;
    let idClient : string = this.form.value.idClient;
    let idVendor : string = this.form.value.idVendor;
    let url : string = ''; 
    this.load = true;

    if(idVendor != null) {
      if(idVendor.toString().length == 1) idVendor = `00${idVendor}`; 
      if(idVendor.toString().length == 2) idVendor = `0${idVendor}`; 
    } 

    if(years == null) years.push(moment().year());
    if(idVendor != null) url += `vendedor=${idVendor}`;
    if(idClient != null) url.length > 0 ? url += `&cliente=${idClient}` : url += `cliente=${idClient}`;
    if(url.length > 0) url = `?${url}`;
    console.log(years);
    for (let i = 0; i < years.length; i++) {
      this.svcZeus.getEstadisticaVentasAnio(years[i], url).subscribe(resp => {
        for (let index = 0; index < resp.length; index++) {
          let response : any[] = JSON.parse(`{${resp[index].replaceAll("'", '"')}}`);
          this.changeStringsValues(response);
          this.info.push(response);
          this.infoTable.push(response);
          setTimeout(() => { this.load = false; }, 500);
        }
      }, error => { 
        this.load = false; 
        this.svcMsjs.mensajeError("No existen resultados de búsqueda!");
      });
    }
   
  }

  //Función que se encarga de cambiar los valores string en decimales 
  changeStringsValues(data : any) {
    data.Facturado = parseFloat(data.Facturado.toString().replace(',', '.')),
    data.Devuelto = parseFloat(data.Devuelto.toString().replace(',', '.')),
    data.Total = parseFloat(data.Total.toString().replace(',', '.')),
    data.Iva = parseFloat(data.Iva.toString().replace(',', '.')),
    data.TotalMasIva = parseFloat(data.TotalMasIva.toString().replace(',', '.'))  
    return data;
  }

  //Función que limpia los campos.
  clearLabels(){
    this.form.reset();
    this.info = [];
    this.infoTable = [];
  }

  /** Función para cargar los años en el combobox de años. */
  loadYears(){
    let actualYear : number = moment().year();
    for (let i = 2019; i <= actualYear; i++) {
      this.years.push(i);
    }
    this.years.reverse();
  }

  /** Función para filtrar la tabla. */
  applyFilter($event, campo : any, valorCampo : string) {
    this.dt!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);
    setTimeout(() => {
      console.log(this.dt.filteredValue)
      if(this.dt.filteredValue != null) this.info = this.dt.filteredValue;
      if(this.dt.filteredValue == null) this.info = this.infoTable; 
      this.calculateTotal();
    }, 1000);
  }

  /** Función para calcular el total de la tabla. */
  calculateTotal = () => this.info.reduce((a, b) => a + b.TotalMasIva, 0)

  /** Función para calcular el total por año. */
  calculateTotalYear = (year : any) => this.info.filter(x => x.Anio == year).reduce((a, b) => a + b.TotalMasIva, 0)
}
