import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { CategoriaMateriaPrimaService } from 'src/app/Servicios/categoriaMateriaPrima.service';
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

  load: boolean = true;
  public FormEntradaBOPP !: FormGroup;
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  unidadMedida = []; //Variable que almacenará las unidades de medida
  ArrayBOPP = []; //Varibale que almacenará los BOPP que estarán entrando
  categorias : any = []; //Variable que almacenará las categorias que se podrán seleccionar para la materia prima a ingresar

  constructor(@Inject(SESSION_STORAGE) private storage: WebStorageService,
                private rolService : RolesService,
                  private frmBuilder : FormBuilder,
                    private unidadMedidaService : UnidadMedidaService,
                      private entradaBOPPService : EntradaBOPPService,
                        private categoriaService : CategoriaMateriaPrimaService,) {

    this.FormEntradaBOPP = this.frmBuilder.group({
      Nombre : [''],
      serial : [''],
      cantidad : [''],
      cantidadKG : [''],
      precio : [''],
      ancho : [''],
      undMed : [''],
      Fecha : [this.today],
      Observacion : [''],
      Categoria : [''],
    });
  }

  ngOnInit() {
    this.lecturaStorage();
    this.obtenerUnidadesMedida();
    this.obtenerCategorias();
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

  // Funcion que servirá para cargar las categorias
  obtenerCategorias(){
    this.categorias = [],
    this.categoriaService.srvObtenerLista().subscribe(datos_categorias => {
      for (let i = 0; i < datos_categorias.length; i++) {
        if (datos_categorias[i].catMP_Id == 6 || datos_categorias[i].catMP_Id == 14 || datos_categorias[i].catMP_Id == 15) this.categorias.push(datos_categorias[i]);
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
      Categoria : '',
    });
    this.ArrayBOPP = [];
  }

  // funcion que va a limpiar los campos
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
      Categoria : '',
    });
  }

  //Funcion que va a cargar en la tabla el rollo que se va a crear
  cargarBOPPTabla(){
    if (this.FormEntradaBOPP.valid) {
      this.load = false;
      let serial : number = this.FormEntradaBOPP.value.serial;
      let cantidad : number = this.FormEntradaBOPP.value.cantidad;
      let cantidadKg : number = this.FormEntradaBOPP.value.cantidadKG;
      let nombre : string = this.FormEntradaBOPP.value.Nombre;
      let descripcion : string = this.FormEntradaBOPP.value.Observacion;
      let precio : number = this.FormEntradaBOPP.value.precio;
      let ancho : number = this.FormEntradaBOPP.value.ancho;
      let categoria : number = this.FormEntradaBOPP.value.Categoria;

      this.entradaBOPPService.srvObtenerListaPorSerial(serial).subscribe(datos_bopp => {
        if (datos_bopp.length != 0) {
          Swal.fire({
            icon: 'warning',
            title: 'Advertencia',
            text: "¡Ya existe un bopp con el serial ${serial}, por favor colocar un serial distinto!",
            showCloseButton: true
          });
          this.load = true;;
        } else {
          this.categoriaService.srvObtenerListaPorId(categoria).subscribe(datos_categorias => {
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
              Cat_Id : categoria,
              Cat : datos_categorias.catMP_Nombre,
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
              Categoria : '',
            });
            this.load = true;
          });
        }
      });
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: "¡Hay campos vacios!",
        showCloseButton: true
      });
    }
  }

  // funcion que crea los rollos en la tabla
  crearEntrada(){
    if (this.ArrayBOPP.length == 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: "¡Debe cargar minimo un BOPP en la tabla!",
        showCloseButton: true
      });
    } else {
      this.load = false
      for (let i = 0; i < this.ArrayBOPP.length; i++) {
        let bodega : number;
        if (this.ArrayBOPP[i].Cat_Id == 6) bodega = 8;
        else if (this.ArrayBOPP[i].Cat_Id == 14) bodega = 11;
        if (this.ArrayBOPP[i].Cat_Id == 15) bodega = 12;

        let datosBOPP : any = {
          bopP_Nombre : `${this.ArrayBOPP[i].Nombre} - ${this.ArrayBOPP[i].Serial} - ${this.ArrayBOPP[i].CantKg} - ${this.ArrayBOPP[i].Ancho}`,
          bopP_Descripcion : this.ArrayBOPP[i].Descripcion,
          bopP_Serial : this.ArrayBOPP[i].Serial,
          bopP_CantidadMicras : this.ArrayBOPP[i].Cant,
          undMed_Id : 'µm',
          catMP_Id : this.ArrayBOPP[i].Cat_Id,
          bopP_Precio : this.ArrayBOPP[i].Precio,
          tpBod_Id : bodega,
          bopP_FechaIngreso : this.today,
          bopP_Ancho : this.ArrayBOPP[i].Ancho,
          BOPP_Stock : this.ArrayBOPP[i].CantKg,
          undMed_Kg : 'Kg',
          bopP_CantidadInicialKg : this.ArrayBOPP[i].CantKg,
          Usua_Id : this.storage_Id,
          BOPP_Hora : moment().format('H:mm:ss'),
        }

        this.entradaBOPPService.srvGuardar(datosBOPP).subscribe(datos_BOPP => {
          Swal.fire({
            icon: 'success',
            title: 'Advertencia',
            text: "¡Entrada de BOPP registrada con exito!",
            showCloseButton: true
          });
          this.load = true;

          this.limpiarTodosLosCampos();
        }, error => {
          Swal.fire({
            icon: 'error',
            title: 'Opps...',
            html: `<b>¡Error al ingresar el rollo!</b><hr>` + `<spam style="color: #f00">${error}</spam>`,
            showCloseButton: true
          });
          this.load = true;
        });
      }
    }
  }

  // Funcion que va a quitar un rollo de la tabla
  quitarRollo(data : any){
    Swal.fire({
      title: '¿Estás seguro de eliminar la Materia Prima de la Asignación?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        for (let i = 0; i < this.ArrayBOPP.length; i++) {
          if (data.Serial == this.ArrayBOPP[i].Serial) this.ArrayBOPP.splice(i, 1) ;
        }
      }
    });
  }
}
