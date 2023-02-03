import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { RolesService } from 'src/app/Servicios/Roles/roles.service';

@Component({
  selector: 'app-Reporte_FacturacionZeus',
  templateUrl: './Reporte_FacturacionZeus.component.html',
  styleUrls: ['./Reporte_FacturacionZeus.component.css']
})
export class Reporte_FacturacionZeusComponent implements OnInit {

  formFiltros !: FormGroup; /** Formulario de filtros de busqueda */
  arrayDocumento : any = []; /** Array para cargar la información que se verá en la vista. */
  load : boolean = false; /** Variable para indicar la espera en la carga de un proceso. */
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  arrayClientes : any = []; /** Array que contendrá la información de los clientes */
  arrayItems : any = []; /** Array que contendrá la información de los items */
  arrayVendedores : any = []; /** Array que contendrá la información de los vendedores */

  constructor(private frmBuilder : FormBuilder,
                @Inject(SESSION_STORAGE) private storage: WebStorageService,
                  private rolService : RolesService,) { }

  ngOnInit() {
    this.lecturaStorage();
  }

  /**Leer storage para validar su rol y mostrar el usuario. */
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

  // Funcion que colocará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = '$1,';
    return number.toString().replace(exp,rep);
  }

}
