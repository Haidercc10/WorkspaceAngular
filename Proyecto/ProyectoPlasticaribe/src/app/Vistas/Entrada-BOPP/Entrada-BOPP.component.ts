import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { faAnchor } from '@fortawesome/free-solid-svg-icons';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { EntradaBOPPService } from 'src/app/Servicios/entrada-BOPP.service';
import { RolesService } from 'src/app/Servicios/roles.service';
import { UnidadMedidaService } from 'src/app/Servicios/unidad-medida.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-Entrada-BOPP',
  templateUrl: './Entrada-BOPP.component.html',
  styleUrls: ['./Entrada-BOPP.component.css']
})
export class EntradaBOPPComponent implements OnInit {

  public load: boolean;
  public FormEntradaBOPP !: FormGroup;
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  today : any = new Date(); //Variable que se usará para llenar la fecha actual
  unidadMedida = []; //Variable que almacenará las unidades de medida
  ArrayBOPP = []; //Varibale que almacenará los BOPP que estarán entrando


  constructor(@Inject(SESSION_STORAGE) private storage: WebStorageService,
                private rolService : RolesService,
                  private frmBuilder : FormBuilder,
                    private unidadMedidaService : UnidadMedidaService,
                      private entradaBOPPService : EntradaBOPPService,) {

    this.FormEntradaBOPP = this.frmBuilder.group({
      Nombre : ['', Validators.required],
      serial : ['', Validators.required],
      cantidad : ['', Validators.required],
      cantidadKG : ['', Validators.required],
      precio : ['', Validators.required],
      ancho : ['', Validators.required],
      undMed : ['', Validators.required],
      Fecha : ['', Validators.required],
      Observacion : ['', Validators.required],
    });

    this.load = true;

  }

  ngOnInit() {
    this.lecturaStorage();
    this.fecha();
    this.obtenerUnidadesMedida();
  }

  //Funcion que colocará la fecha actual y la colocará en el campo de fecha de pedido
  fecha(){
    this.today = new Date();
    var dd : any = this.today.getDate();
    var mm : any = this.today.getMonth() + 1;
    var yyyy : any = this.today.getFullYear();
    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
    this.today = yyyy + '-' + mm + '-' + dd;

    this.FormEntradaBOPP = this.frmBuilder.group({
      Nombre : '',
      serial : '',
      cantidad : '',
      cantidadKG : '',
      precio : '',
      ancho : '',
      undMed : '',
      Fecha : this.today,
      Observacion : '',
    });
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

  //Funcion para  obtener las unidades de medidas
  obtenerUnidadesMedida() {
    this.unidadMedidaService.srvObtenerLista().subscribe(datos_unidadesMedida => {
      for (let i = 0; i < datos_unidadesMedida.length; i++) {
        this.unidadMedida.push(datos_unidadesMedida[i].undMed_Id);
      }
    });
  }

  // Funcion limpiará todos los campos de vista
  limpiarTodosLosCampos(){
    this.FormEntradaBOPP = this.frmBuilder.group({
      Nombre : '',
      serial : '',
      cantidad : '',
      cantidadKG : '',
      precio : '',
      ancho : '',
      undMed : '',
      Fecha : this.today,
      Observacion : '',
    });
    this.ArrayBOPP = [];
  }

  limpiarCampos(){
    this.FormEntradaBOPP = this.frmBuilder.group({
      Nombre : '',
      serial : '',
      cantidad : '',
      cantidadKG : '',
      precio : '',
      ancho : '',
      undMed : '',
      Fecha : this.today,
      Observacion : '',
    });
  }

  cargarBOPPTabla(){
    let serial : number = this.FormEntradaBOPP.value.serial;
    let cantidad : number = this.FormEntradaBOPP.value.cantidad;
    let cantidadKg : number = this.FormEntradaBOPP.value.cantidadKG;
    let nombre : string = this.FormEntradaBOPP.value.Nombre;
    let descripcion : string = this.FormEntradaBOPP.value.Observacion;
    let precio : number = this.FormEntradaBOPP.value.precio;
    let ancho : number = this.FormEntradaBOPP.value.ancho;

    let productoExt : any = {
      Serial : serial,
      Nombre : nombre,
      Descripcion : descripcion,
      Ancho : ancho,
      Cant : cantidad,
      UndCant : 'µm',
      CantKg : cantidadKg,
      UndCantKg : 'Kg',
      Precio : precio,
    }
    this.ArrayBOPP.push(productoExt);

    this.FormEntradaBOPP = this.frmBuilder.group({
      Nombre : '',
      serial : '',
      cantidad : '',
      cantidadKG : '',
      precio : '',
      ancho : '',
      undMed : '',
      Fecha : this.today,
      Observacion : '',
    });
  }

  crearEntrada(){
    if (this.ArrayBOPP.length == 0) Swal.fire("Debe cargar minimo un BOPP en la tabla");
    else {
      for (let i = 0; i < this.ArrayBOPP.length; i++) {

        let datosBOPP : any = {
          // BOPP_Nombre : `${this.ArrayBOPP[i].Nombre} - ${this.ArrayBOPP[i].Serial} - ${this.ArrayBOPP[i].CantKg} - ${this.ArrayBOPP[i].Ancho}`,
          // BOPP_Descripcion : this.ArrayBOPP[i].Descripcion,
          // BOPP_Serial : this.ArrayBOPP[i].Serial,
          // BOPP_Cantidad : this.ArrayBOPP[i].Cant,
          // UndMed_Id : 'µm',
          // CatMP_Id : 6,
          // BOPP_Precio : this.ArrayBOPP[i].Precio,
          // TpBod_Id : 8,
          // BOPP_FechaIngreso : this.today,
          // BOPP_Ancho : this.ArrayBOPP[i].Ancho,
          // BOPP_CantidadKg : this.ArrayBOPP[i].CantKg,
          // UndMed_Kg : 'Kg',
          bopP_Nombre : `${this.ArrayBOPP[i].Nombre} - ${this.ArrayBOPP[i].Serial} - ${this.ArrayBOPP[i].CantKg} - ${this.ArrayBOPP[i].Ancho}`,
          bopP_Descripcion : this.ArrayBOPP[i].Descripcion,
          bopP_Serial : this.ArrayBOPP[i].Serial,
          bopP_CantidadMicras : this.ArrayBOPP[i].Cant,
          undMed_Id : 'µm',
          catMP_Id : 6,
          bopP_Precio : this.ArrayBOPP[i].Precio,
          tpBod_Id : 8,
          bopP_FechaIngreso : this.today,
          bopP_Ancho : this.ArrayBOPP[i].Ancho,
          BOPP_Stock : this.ArrayBOPP[i].CantKg,
          undMed_Kg : 'Kg',
          bopP_CantidadInicialKg : this.ArrayBOPP[i].CantKg,
          Usua_Id : this.storage_Id,
        }

        this.entradaBOPPService.srvGuardar(datosBOPP).subscribe(datos_BOPP => {
          const Toast = Swal.mixin({
            toast: true,
            position: 'center',
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.addEventListener('mouseenter', Swal.stopTimer)
              toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
          });
          Toast.fire({
            icon: 'success',
            title: '¡Entrada de BOPP registrada con exito!'
          });

          this.ArrayBOPP = [];
          this.FormEntradaBOPP = this.frmBuilder.group({
            Nombre : '',
            serial : '',
            cantidad : '',
            cantidadKG : '',
            precio : '',
            ancho : '',
            undMed : '',
            Fecha : this.today,
            Observacion : '',
          });
        });
      }
    }
  }

}
