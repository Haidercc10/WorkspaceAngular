import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { RolesService } from 'src/app/Servicios/roles.service';

@Component({
  selector: 'app-Reporte_Procesos_OT',
  templateUrl: './Reporte_Procesos_OT.component.html',
  styleUrls: ['./Reporte_Procesos_OT.component.css']
})
export class Reporte_Procesos_OTComponent implements OnInit {

  public formularioOT !: FormGroup;
  public page : number; //Variable que tendrá el paginado de la tabla en la que se muestran los pedidos consultados
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  today : any = new Date(); //Variable que se usará para llenar la fecha actual
  ArrayDocumento = []; //Varibale que almacenará la información que se mostrará en la tabla de vista
  load : boolean = true; //Variable que permitirá validar si debe salir o no la imagen de carga

  constructor(private frmBuilder : FormBuilder,
                @Inject(SESSION_STORAGE) private storage: WebStorageService,
                  private rolService : RolesService,) {

    this.formularioOT = this.frmBuilder.group({
      idDocumento : [''],
      fecha: [''],
      fechaFinal : [''],
      estado : [''],
      errore : [''],
    })
  }

  ngOnInit() {
    this.fecha();
    this.lecturaStorage();
    this.llenarArray();
  }

  //Funcion que colocará la fecha actual
  fecha(){
    this.today = new Date();
    var dd : any = this.today.getDate();
    var mm : any = this.today.getMonth() + 1;
    var yyyy : any = this.today.getFullYear();
    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
    this.today = yyyy + '-' + mm + '-' + dd;
  }

  /**Leer sorage para validar su rol y mostrar el usuario. */
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

  //
  consultarOT(){

  }

  //

  llenarArray(){
    for (let i = 0; i < 3; i++) {
      let info : any = {
        ot : 123,
        ext : 0,
        imp : 2,
        rot : 3,
        dbl : 4,
        lam : 5,
        cor : 6,
        emp : 7,
        sel : 8,
        wik : 9,
        cant : 2,
      }
      this.ArrayDocumento.push(info);
    }
  }
}
