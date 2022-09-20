import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { AsignacionProductosFacturaService } from 'src/app/Servicios/AsignacionProductosFactura.service';
import { DetallesAsignacionProductosFacturaService } from 'src/app/Servicios/DetallesAsignacionProductosFactura.service';
import { DetallesEntradaRollosService } from 'src/app/Servicios/DetallesEntradaRollos.service';
import { EntradaRollosService } from 'src/app/Servicios/EntradaRollos.service';
import { RolesService } from 'src/app/Servicios/roles.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-RollosAsignadasFactura',
  templateUrl: './RollosAsignadasFactura.component.html',
  styleUrls: ['./RollosAsignadasFactura.component.css']
})
export class RollosAsignadasFacturaComponent implements OnInit {

  public FormConsultarFactura !: FormGroup; //formulario para consultar una factura y ver los rollos que tiene asignados

  cargando : boolean = true; //Variable para validar que salga o no la imagen de carga
  today : any = new Date(); //Variable que se usará para llenar la fecha actual
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  rollos : any [] = []; //Variable que almacenará los difrentes rollos que se hicieron en la orden de trabajo

  constructor(private frmBuilderPedExterno : FormBuilder,
                private rolService : RolesService,
                  @Inject(SESSION_STORAGE) private storage: WebStorageService,
                    private dtAsgProdFactura : DetallesAsignacionProductosFacturaService,
                      private rollosService : DetallesEntradaRollosService,) {

    this.FormConsultarFactura = this.frmBuilderPedExterno.group({
      Fact_Id: [''],
      Cliente : [''],
    });
  }

  ngOnInit() {
    this.fecha();
    this.lecturaStorage();
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = '$1,';
    return number.toString().replace(exp,rep);
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
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

  // Funcion para limpiar los campos de la vista
  limpiarCampos(){
    this.FormConsultarFactura.reset();
    this.rollos = [];
    this.cargando = true;
  }

  //Funcion que traerá los diferentes rollos que se hicieron en la orden de trabajo
  consultarFactura(){
    this.rollos = [];
    let factura : string = this.FormConsultarFactura.value.Fact_Id;
    this.dtAsgProdFactura.srvObtenerListaPorCodigoFactura(factura).subscribe(datos_factura => {
      for (let i = 0; i < datos_factura.length; i++) {
        let info : any = {
          Id : datos_factura[i].rollo_Id,
          Producto : datos_factura[i].prod_Nombre,
          Cantidad : datos_factura[i].dtAsigProdFV_Cantidad,
          Presentacion : datos_factura[i].undMed_Id,
        }
        this.rollos.push(info);
        this.FormConsultarFactura.setValue({
          Fact_Id: factura,
          Cliente : datos_factura[i].cli_Nombre,
        });
      }
    });
  }

  // Funcion que cambiará el estado de los rollos a enviados
  cambiarEstado(){
    if (this.rollos.length != 0) {
      for (let i = 0; i < this.rollos.length; i++) {
        this.rollosService.srvObtenerVerificarRollo(this.rollos[i].Id).subscribe(datos_rollos => {
          for (let j = 0; j < datos_rollos.length; j++) {
            let info : any = {
              DtEntRolloProd_Codigo : datos_rollos[j].dtEntRolloProd_Codigo,
              EntRolloProd_Id : datos_rollos[j].entRolloProd_Id,
              Rollo_Id : datos_rollos[j].rollo_Id,
              DtEntRolloProd_Cantidad : datos_rollos[j].dtEntRolloProd_Cantidad,
              UndMed_Id : datos_rollos[j].undMed_Id,
              Estado_Id : 21,
            }
            this.rollosService.srvActualizar(datos_rollos[j].dtEntRolloProd_Codigo, info).subscribe(datos_rolloActuializado => {
              const Toast = Swal.mixin({
                toast: true,
                position: 'center',
                showConfirmButton: false,
                timer: 2500,
                timerProgressBar: true,
                didOpen: (toast) => {
                  toast.addEventListener('mouseenter', Swal.stopTimer)
                  toast.addEventListener('mouseleave', Swal.resumeTimer)
                }
              });
              Toast.fire({
                icon: 'success',
                title: '¡Factura confirmada, el Rollo pasa a ser enviado!'
              });
            });
          }
        });
      }
    } else Swal.fire("¡Debe cargar minimo un rollo en la tabla!");
  }

}
