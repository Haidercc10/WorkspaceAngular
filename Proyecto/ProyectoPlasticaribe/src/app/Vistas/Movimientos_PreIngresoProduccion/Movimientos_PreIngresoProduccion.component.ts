import { Component, Injectable, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import moment from 'moment';
import { Table } from 'primeng/table';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { CreacionPdfService } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';
import { DtPreEntregaRollosService } from 'src/app/Servicios/DetallesPreIngresoRollosDespacho/DtPreEntregaRollos.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { ProcesosService } from 'src/app/Servicios/Procesos/procesos.service';
import { ProductoService } from 'src/app/Servicios/Productos/producto.service';
import { AppComponent } from 'src/app/app.component';
import { PreIngresoProduccion_DespachoComponent } from '../PreIngresoProduccion_Despacho/PreIngresoProduccion_Despacho.component';

@Component({
  selector: 'app-Movimientos_PreIngresoProduccion',
  templateUrl: './Movimientos_PreIngresoProduccion.component.html',
  styleUrls: ['./Movimientos_PreIngresoProduccion.component.css']
})

export class Movimientos_PreIngresoProduccionComponent implements OnInit {
  load : boolean = false;
  modeSelected: boolean;
  movements : any[] = [];
  form !: FormGroup;
  process : any = [];
  products : any = [];
  storage_Id: number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre: any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol: any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  rol: number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  @ViewChild('dt') dt : Table | undefined;
  infoTable : any = [];
  medida : string = '';
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  date : any | undefined = [new Date(), new Date()] //Variable que guardará la fecha seleccionada en el campo de rango de fechas

  constructor(private AppComponent : AppComponent,
    private frmBuild : FormBuilder,
    private svcProcess : ProcesosService,
    private svcProducts : ProductoService,
    private svcPreInProduction : DtPreEntregaRollosService,
    private svcMsjs : MensajesAplicacionService,
    private cmpPreInProduction : PreIngresoProduccion_DespachoComponent,
    ) {
    this.modeSelected = this.AppComponent.temaSeleccionado;
    this.initForm();
   }

  ngOnInit() {
    this.lecturaStorage();
    this.getProcess();
    setTimeout(() => { this.loadProcessByRol(); }, 500);
  }

  //. Inicializa el formulario
  initForm(){
    this.form = this.frmBuild.group({
      ot : [null,],
      process : [null,],
      rank : [null,],
      item : [null,],
      reference : [null,],
    });
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage() {
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.rol = this.AppComponent.storage_Rol;
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

  //. Cargar el proceso dependiendo el rol.
  loadProcessByRol(){
    if([7,85].includes(this.rol)) this.form.patchValue({ process : 'EXT' });
    else if([8,86].includes(this.rol)) this.form.patchValue({ process : 'SELLA' });
    else if([9,87].includes(this.rol)) this.form.patchValue({ process : 'EMP' });
    else this.form.patchValue({ process : null });
  }

  //. Buscará movimientos de preingreso dependiendo los filtros consultados
  searchMovements(){
    this.movements = [];
    this.infoTable = [];
    let rank : any = this.form.value.rank;
    let date1 : any = rank == null ? this.today : moment(this.form.value.rank[0]).format('YYYY-MM-DD');
    let date2 : any = ['Fecha inválida', null, undefined, ''].includes(rank == null ? rank : rank[1]) ? this.today : moment(this.form.value.rank[1]).format('YYYY-MM-DD');
     let root : any = this.validateRoot();
    this.load = true;

    this.svcPreInProduction.GetPreInProduction(date1, date2, root).subscribe(data => {
      if(data.length > 0){
        this.movements = data;
        this.infoTable = data;
        this.load = false;
      } else {
        this.svcMsjs.mensajeAdvertencia(`No se encontraron resultados de búsqueda`);
        this.load = false;
      }
    }, error => {});
  }

  //.Validar la ruta que tendrá la consulta en el API
  validateRoot(){
    let process : any = this.form.value.process;
    let ot : any = this.form.value.ot;
    let item : any = this.form.value.item;
    let root : any = ``;

    if(process != null) root += `process=${process}`;
    if(ot != null) root.length > 0 ? root += `&ot=${ot}` : root += `ot=${ot}`;
    if(item != null) root.length > 0 ? root += `&item=${item}` : root += `item=${item}`;

    if(root.length > 0) root =`?${root}`;
    return root;
  }

  //Función para limpiar campos
  clearLabels(){
    this.form.reset();
    this.movements = [];
    this.infoTable = [];
    this.load = false;
  }

  //. Función para cargar los procesos dependiendo el rol.
  getProcess = () => this.svcProcess.srvObtenerLista().subscribe(data => this.process = data.filter(x => ['EMP','SELLA','EXT'].includes(x.proceso_Id)));

  //. Función para obtener el nombre de los items
  getItems = () => this.svcProducts.obtenerItemsLike(this.form.value.reference).subscribe(data => this.products = data);

  //. Función para cargar la info del item dependiendo el que se elija.
  selectedItem(){
    this.getItems();
    this.form.patchValue({
      item : this.form.value.reference,
      reference : this.products.find(x => x.prod_Id == this.form.value.reference).prod_Nombre
    });
  }

  //. Función para filtrar la tabla. (FILTRO)
  applyFilter($event, campo : any, valorCampo : string) {
    this.dt!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);
    setTimeout(() => { if(this.dt.filteredValue) this.movements = this.dt!.filteredValue; }, 500);
    if(!this.dt.filteredValue) this.movements = this.infoTable;
  }

  //Función para calcular el total de rollos pre ingresados
  calculateTotal = () => this.movements.reduce((a, b) => a + b.cantidad, 0);

  //Función que mostrará el formato PDF.
  viewPDF(id : number) {
    this.load = true;
    this.cmpPreInProduction.createPDF(id);
    setTimeout(() => this.load = false, 3000);
  }
}
