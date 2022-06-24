import { Component, OnInit,Inject } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { RolesService } from 'src/app/Servicios/roles.service';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { MateriaPrimaService } from 'src/app/Servicios/materiaPrima.service';
import { ProveedorService } from 'src/app/Servicios/proveedor.service';
import { Observable } from 'rxjs/internal/Observable';
import {map, startWith} from 'rxjs/operators';
import { MpProveedorService } from 'src/app/Servicios/MpProveedor.service';


@Component({
  selector: 'app.pedidomateriaprima.component',
  templateUrl: './pedidomateriaprima.component.html',
  styleUrls: ['./Pedidomateriaprima.component.css']
})
export class PedidomateriaprimaComponent implements OnInit {

  public FormularioPedidomateriaprima !: FormGroup;
  public FormMateriaPrima!: FormGroup;
  public FormMateriaPrimaRetiro!: FormGroup;

  /* Vaiables*/
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente

  ultimoIdMateriaPrima : number; //Varibale que va a almacenar el id de la ultima materia prima registrada y le va a sumar 1
  nombresMateriasPrimas = [];

  constructor(private frmBuilderPedidomateriaprima : FormBuilder,
                private materiaPrimaService : MateriaPrimaService,
                  private rolService : RolesService,
                    private frmBuilderMateriaPrima : FormBuilder,
                      @Inject(SESSION_STORAGE) private storage: WebStorageService,
                        private proveedorservices : ProveedorService,
                          private proveedorMP : MpProveedorService) {

    this.FormMateriaPrima = this.frmBuilderMateriaPrima.group({
      //MateriaPrima
      MpunidadMedida: new FormControl(),
      MpId: new FormControl(),
      MpNombre: new FormControl(),
      Mpestados: new FormControl(),
      MpEstadoConsulta: new FormControl(),
      Mpbodega: new FormControl(),
      MpStock: new FormControl(),
      MpObservacion: new FormControl(),
      MpCategoria: new FormControl(),
      MpingresoFecha:new FormControl(),
      MpPrecio:new FormControl(),
    });
  }

  ngOnInit(): void {
    this.initForms();
    this.lecturaStorage();
    this.obtenerUltimoIdRegistrado();
    this.obtenerNombreMateriasPrimas();
  }

  initForms() {
    this.FormMateriaPrima = this.frmBuilderMateriaPrima.group({
      MpunidadMedida: [, Validators.required],
      MpId: [, Validators.required],
      MpNombre: [, Validators.required],
      Mpestados: [, Validators.required],
      MpEstadoConsulta: [, Validators.required],
      Mpbodega: [, Validators.required],
      MpStock: [, Validators.required],
      MpObservacion: [, Validators.required],
      MpCategoria: [, Validators.required],
      MpingresoFecha: [, Validators.required],
      MpPrecio: [, Validators.required],
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


  /* FUNCION PARA RELIZAR CONFIMACIÓN DE SALIDA */
  confimacionSalida(){
    Swal.fire({
      title: '¿Seguro que desea salir?',
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: 'Salir',
      denyButtonText: `No Salir`,
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) window.location.href = "./";
    })
  }

  // Funcion que limpia los todos los campos de la vista
  LimpiarCampos() {

  }

  //Funcion que va a recorrer las materias primas para almacenar el nombre de todas
  obtenerNombreMateriasPrimas(){
    let idMateriasPrimas = [];
    this.materiaPrimaService.srvObtenerLista().subscribe(datos_materiasPrimas => {
      for (let index = 0; index < datos_materiasPrimas.length; index++) {
        this.nombresMateriasPrimas = datos_materiasPrimas[index].matPri_Nombre;
      }
    });
  }

  //Funcion que va a recorrer las materias primas en busca de su ultimo id
  obtenerUltimoIdRegistrado(){
    let idMateriasPrimas = [];
    this.materiaPrimaService.srvObtenerLista().subscribe(datos_materiasPrimas => {
      for (let index = 0; index < datos_materiasPrimas.length; index++) {
        idMateriasPrimas = datos_materiasPrimas[index].matPri_Id;
      }
      let ultimoId : number = Math.max.apply(null, idMateriasPrimas);
      this.ultimoIdMateriaPrima = ultimoId + 1;
    });
  }

  //Funacion que crea una materia prima y la guarda en la base de datos
  CreacionMateriaPrima(){
    let nombreMateriaPrima : string;
    let descripcionMateriaPrima : string;
    let stockMateriaPrima : number;
    let undMed : string;
    let categoriaMateriaPrima : number;
    let precioMateriaPrima : number;
    let bodega : number;

    const datosMP : any = {
      MatPri_Nombre : nombreMateriaPrima,
      MatPri_Descripcion : descripcionMateriaPrima,
      MatPri_Stock : stockMateriaPrima,
      UndMed_Id : undMed,
      CatMP_Id : categoriaMateriaPrima,
      MatPri_Precio : precioMateriaPrima,
      TpBod_Id : bodega,
    }

    this.materiaPrimaService.srvGuardar(datosMP).subscribe(datos_mp_creada => {
    });

  }

  //Funcion que creará un proveedor y lo guardará en la base de datos
  CreacionProveedor(){
    let idProveedor : number;
    let TipoIdProveedor : string;
    let nombreProveedor : string;
    let tipoproveedor : number;
    let ciudadProveedor : string;
    let telefonoProveedor : string;
    let emailProveedor : string;

    const datosProveedor : any = {
      Prov_Id : idProveedor,
      TipoIdentificacion_Id : TipoIdProveedor,
      Prov_Nombre : nombreProveedor,
      TpProv_Id : tipoproveedor,
      Prov_Ciudad : ciudadProveedor,
      Prov_Telefono : telefonoProveedor,
      Prov_Email : emailProveedor,
    }

    this.proveedorservices.srvGuardar(datosProveedor).subscribe(datos_nuevoProveedor => {
      console.log(datos_nuevoProveedor);
    });
  }

  //Funcion que creará y gusradará la relación de materia prima y proveedores
  creacionMpProveedor(){
    let idMateriaPrima : number;
    let idProveedor : number;

    const datosMpProveedor = {
      Prov_Id : idProveedor,
      MatPri_Id : idMateriaPrima,
    }

    this.proveedorMP.srvGuardar(datosMpProveedor).subscribe(datos_MpProveedorCreado => {
      console.log(datos_MpProveedorCreado)
    });
  }


  // Funcion para actualizar
  actualizarMateriaP(){

  }

}
