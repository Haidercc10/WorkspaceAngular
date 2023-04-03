import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { MessageService } from 'primeng/api';
import { DetallesAsignacionProductosFacturaService } from 'src/app/Servicios/DetallesFacturacionRollos/DetallesAsignacionProductosFactura.service';
import { UsuarioService } from 'src/app/Servicios/Usuarios/usuario.service';

@Component({
  selector: 'app-prueba-imagen-cat-insumo',
  templateUrl: './prueba-imagen-cat-insumo.component.html',
  styleUrls: ['./prueba-imagen-cat-insumo.component.css']
})

export class PruebaImagenCatInsumoComponent implements OnInit {

  datosNumeros : any = /^[0-9]*(\.?)[ 0-9]+$/; //Variable que se utilizará para valdiar que un dato sea unicamente numerico
  public FormConsultarFactura !: FormGroup; //formulario para consultar una factura y ver los rollos que tiene asignados
  cargando : boolean = false; //Variable para validar que salga la animacion de carga
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  rollosDisponibles : any [] = []; //Variable que guardará la informacion de los rollos estan disponibles para facturar
  rollosSeleccionados : any [] = []; //Variable que guardará la informacion de los rollos que se seleccionaron para facturar
  conductores : any [] = []; //Variable que almcenará la información de los conductores

  constructor(@Inject(SESSION_STORAGE) private storage: WebStorageService,
                private frmBuilder : FormBuilder,
                  private messageService: MessageService,
                    private dtAsgProdFacturaService : DetallesAsignacionProductosFacturaService,
                      private usuariosService : UsuarioService,){

    this.FormConsultarFactura = this.frmBuilder.group({
      Fact_Id: [null, Validators.required],
      Conductor : [null, Validators.required],
      Conductor_Id : [null, Validators.required],
      PlacaCamion : [null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.lecturaStorage();
    this.obtenerCondutores();
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.storage.get('Id');
    this.storage_Nombre = this.storage.get('Nombre');
    this.ValidarRol = this.storage.get('Rol');
    this.storage_Rol = this.storage.get('Rol');
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = '$1,';
    return number.toString().replace(exp,rep);
  }

  // Funcion que va a consultar la informacion de los usuarios de tipo conductor
  obtenerCondutores(){
    this.usuariosService.GetConsdutores().subscribe(data => { this.conductores = data });
  }

  // Funcion que va a buscar el nombre del conductor
  cambiarNombreConductor(){
    let id : string = this.FormConsultarFactura.value.Conductor;
    let nuevo : any [] = this.conductores.filter((item) => item.id === id);
    this.FormConsultarFactura.patchValue({
      Conductor : nuevo[0].nombre,
      Conductor_Id : nuevo[0].id,
    });
  }

  //Funcion que traerá los diferentes rollos que se hicieron en la orden de trabajo
  consultarFactura(){
    this.rollosDisponibles = [];
    let factura : string = this.FormConsultarFactura.value.Fact_Id;
    this.dtAsgProdFacturaService.srvObtenerListaPorCodigoFactura(factura.toUpperCase()).subscribe(datos_factura => {
      if (datos_factura.length == 0) this.mensajeAdvertencia(`¡La factura ${factura} no existe!`);
      for (let i = 0; i < datos_factura.length; i++) {
        if ((datos_factura[i].estado_Id == 20 || datos_factura[i].estado_Id == 19) && datos_factura[i].asigProdFV_PlacaCamion == '') {
          let info : any = {
            Id : datos_factura[i].rollo_Id,
            IdProducto : datos_factura[i].prod_Id,
            Producto : datos_factura[i].prod_Nombre,
            Cantidad : datos_factura[i].dtAsigProdFV_Cantidad,
            Presentacion : datos_factura[i].undMed_Id,
          }
          this.rollosDisponibles.push(info);
          this.FormConsultarFactura.patchValue({
            Fact_Id: factura.toUpperCase(),
            Cliente : datos_factura[i].cli_Nombre,
          });
        }
      }
      setTimeout(() => {
        if (this.rollosDisponibles.length == 0 && datos_factura.length != 0) this.mensajeAdvertencia(`¡Todos los rollos de la factura ${factura} fueron enviados!`);
      }, 500);
    });
  }

  // Funcion que devolverá un mensaje de satisfactorio
  mensajeConfirmacion(titulo : string, mensaje : any) {
    this.messageService.add({severity:'success', summary: titulo, detail: mensaje, life: 2000});
    this.cargando = false;
  }

  // Funcion que va a devolver un mensaje de error
  mensajeError(titulo : string, mensaje : any) {
    this.messageService.add({severity:'error', summary: titulo, detail: mensaje, life: 2000});
    this.cargando = false;
  }

  // Funcion que va a devolver un mensaje de advertencia
  mensajeAdvertencia(mensaje : any) {
    this.messageService.add({severity:'warn', summary: '¡Advertencia!', detail: mensaje, life: 1500});
    this.cargando = false;
  }
}
