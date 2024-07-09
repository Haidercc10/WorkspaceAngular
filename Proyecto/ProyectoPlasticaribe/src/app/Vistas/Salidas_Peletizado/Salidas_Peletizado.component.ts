import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Table } from 'primeng/table';
import { AppComponent } from 'src/app/app.component';
import { Ingreso_PeletizadoService } from 'src/app/Servicios/Ingreso_Peletizado/Ingreso_Peletizado.service';
import { MateriaPrimaService } from 'src/app/Servicios/MateriaPrima/materiaPrima.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { UnidadMedidaService } from 'src/app/Servicios/UnidadMedida/unidad-medida.service';

@Component({
  selector: 'app-Salidas_Peletizado',
  templateUrl: './Salidas_Peletizado.component.html',
  styleUrls: ['./Salidas_Peletizado.component.css']
})
export class Salidas_PeletizadoComponent implements OnInit {

  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  load : boolean = false;
  presentations : any = []; 
  form !: FormGroup;
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  recoveries : Array<any> = [];
  peletsAvailables : Array<any> = [];
  peletsSelected : Array<any> = [];
  peletsConsolidated : Array<any> = [];
  @ViewChild('dt1') dt1 : Table | undefined;
  @ViewChild('dt2') dt2 : Table | undefined;
  @ViewChild('dt3') dt3 : Table | undefined;

  constructor(private AppComponent : AppComponent, 
    private frmBuilder : FormBuilder,
    private msj : MensajesAplicacionService,
    private svEntryPeletizado : Ingreso_PeletizadoService, 
    private svRecoveries : MateriaPrimaService, 
    private svPresentations : UnidadMedidaService,) { 
      this.modoSeleccionado = this.AppComponent.temaSeleccionado;
      this.loadForm();
  }

  ngOnInit() {
    this.lecturaStorage();
    this.getRecoveries();
    this.getPresentations();
  }

  lecturaStorage() {
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  loadForm(){
    this.form = this.frmBuilder.group({
      recoveryId : [null, Validators.required],
      recovery : [null, Validators.required],
      qty : [null, Validators.required],
      presentation : [null, Validators.required],
      observation : [null],
    });
  }

  clearFields(){
    this.load = false;
    this.form.reset();
    this.form.patchValue({ presentation : 'Kg' });
  }

  clearAll(){
    this.load = false;
    this.form.reset();
    this.peletsAvailables = [];
    this.peletsSelected = [];
    this.peletsConsolidated = [];
    this.form.patchValue({ presentation : 'Kg' });
  }

  getRecoveries = () => this.svRecoveries.srvObtenerLista().subscribe(data => { this.recoveries = data.filter(x => [10,4].includes(x.catMP_Id)) }, error => { this.msj.mensajeError(`Error al consultar las materias primas. | ${error.status} ${error.statusText}`); });
  
  getPresentations = () => this.svPresentations.srvObtenerLista().subscribe(data => this.presentations = data.filter(x => ['Kg'].includes(x.undMed_Id)), error => { this.msj.mensajeError(`Error al consultar las presentaciones. | ${error.status} ${error.statusText}`); })

  //Función para mostrar el mostrar el nombre de la materia prima en el campo
  selectRecoveries(){
    let mp : any = this.form.value.recovery;
    this.form.patchValue({ 'recoveryId': mp, 'recovery' : this.recoveries.find(x => x.matPri_Id == mp).matPri_Nombre });
  }

  searchPeletizado(){
    this.peletsAvailables = [];
    this.peletsSelected = [];
    this.peletsConsolidated = [];

    if(this.form.valid) {
      let mp : number = this.form.value.recoveryId;
      this.load = true;
      this.svEntryPeletizado.getStockPele_Details(mp).subscribe(data => {
        this.loadDataTable(data);
      }, error => {
        error.status == 400 ? this.msj.mensajeAdvertencia(`No se encontraron peletizados asociados a ${this.form.value.recovery}`) : this.msj.mensajeError(`Error consultando ${this.form.value.recovery} en la bodega de Peletizado | ${error.status}`);
        this.load = false;
      });
    } else this.msj.mensajeAdvertencia(`Debe llenar los campos requeridos`);
  }

  loadDataTable(data : any){
    data.forEach(x => {
      this.peletsAvailables.push({
        'code' : x.entries.ingPel_Id,
        'typeRecovery' : x.type_Recovery.id,
        'roll' : x.entries.rollo_Id,
        'ot' : x.entries.ot, 
        'item' : x.product.item,
        'reference' : x.product.reference,
        'weight' : x.entries.ingPel_Cantidad,
        'material' : x.material.material,
      });
    });
    this.load = false;
  }

  validateFields(){
  }

  selectPeletizados(data){
    this.load = true;
    let index : number = this.peletsAvailables.findIndex(x => x.code == data.code);
    this.peletsAvailables.splice(index, 1);
    this.consolidatePeletizado();
    setTimeout(() => this.load = false, 50);
  }

  deselectPeletizados(data){
    this.load = true;
    let index : number = this.peletsSelected.findIndex(x => x.code == data.code);
    this.peletsAvailables.splice(index, 1);
    this.consolidatePeletizado();
    setTimeout(() => this.load = false, 50);
  }

  selectAllPeletizados(){
    this.load = true;
    this.peletsSelected = this.peletsSelected.concat(this.peletsAvailables);
    this.peletsAvailables = [];
    this.consolidatePeletizado();
    setTimeout(() => this.load = false, 50);
  }

  deselectAllPeletizados(){
    this.load = true;
    this.peletsAvailables = this.peletsAvailables.concat(this.peletsSelected);
    this.peletsSelected = [];
    this.consolidatePeletizado();
    setTimeout(() => this.load = false, 50);
  }

  consolidatePeletizado(){
    this.peletsConsolidated = this.peletsSelected.reduce((a,b) => {
      if(!a.map(x => x.typeRecovery).includes(b.typeRecovery)) a = [...a, b];
      //else {
      //  let index = a.findIndex(x => x.typeRecovery == b.typeRecovery);
      //  a[index].weight += b.weight;
      //} 
      return a;
    }, []);
  }

  weightTypesRecoveries = (data) => this.peletsSelected.filter(x => x.typeRecovery == data.typeRecovery).reduce((a, b) => a += b.weight, 0);

  qtyTypesRecoveries = (data) => this.peletsSelected.filter(x => x.typeRecovery == data.typeRecovery).length;

  weightTotal = () => this.peletsSelected.reduce((a, b) => a += b.weight, 0);

  qtyTotal = () => this.peletsSelected.length;

  applyFilter = ($event, campo : any, table : any) => table!.filter(($event.target as HTMLInputElement).value, campo, 'contains');
}
