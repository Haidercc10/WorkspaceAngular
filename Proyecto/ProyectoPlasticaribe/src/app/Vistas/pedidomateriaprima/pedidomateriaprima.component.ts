import { Component, OnInit,Inject } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { RolesService } from 'src/app/Servicios/roles.service';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { EstadosService } from 'src/app/Servicios/estados.service';
import { TipoEstadosService } from 'src/app/Servicios/tipo-estados.service';
import { UnidadMedidaService } from 'src/app/Servicios/unidad-medida.service';


@Component({
  selector: 'app.pedidomateriaprima.component',
  templateUrl: './pedidomateriaprima.component.html',
  styleUrls: ['./Pedidomateriaprima.component.css']
})
export class PedidomateriaprimaComponent implements OnInit {

  serializedDate = new FormControl(new Date().toISOString());

  public FormularioPedidomateriaprima !: FormGroup;
  public FormMateriaprima!: FormGroup;
  public FormMateriaprimaretiro!: FormGroup;


  constructor( private frmBuilderPedidomateriaprima : FormBuilder,
                 private rolService : RolesService,
                  private tipoEstadoService : TipoEstadosService,
                    private estadosService : EstadosService,
                      private frmBuilderMateriaPrima : FormBuilder,
                       private unidadMedidaService : UnidadMedidaService,
                 @Inject(SESSION_STORAGE) private storage: WebStorageService
    
    
    ) {
      this.FormMateriaprima = this.frmBuilderMateriaPrima.group({
        //MateriaPrima
        MpunidadMedida: new FormControl(),
        MpId: new FormControl(),
        MpNombre: new FormControl(),
        Mpestados: new FormControl(),
        MpEstadoConsulta: new FormControl(),
        Mpbodega: new FormControl(),
        MpStock: new FormControl(),
        MpObservacion: new FormControl(),
        IngresoMateriaP: new FormControl(),
        MpingresoFecha:new FormControl(),

      });
  

     }

 // VARIABLES PARA PASAR A LOS COMBOBOX

  usuarios=[];
  estado=[];
  tipoEstado=[];
  producto=[];
  EstadosMateriaP=[];
  Nencargado=[];
  Encargado=[];
  MateriaPFechaConsulta=[];
  cliente=[];
  undMed:UnidadMedidaService[]=[];

/* Vaiables*/

storage_Id : number;
storage_Nombre : any;
storage_Rol : any;
ValidarRol : number;


  ngOnInit(): void {
    this.initForms();
    this.lecturaStorage();
    this.limpiarCamposConsulta();
  }


  initForms() {
    this.FormularioPedidomateriaprima = this.frmBuilderPedidomateriaprima.group({
      IDDetallePedido: [, Validators.required],
      IDUsuario: [, Validators.required],
      Nombre: [, Validators.required],
      NombreArea: [, Validators.required],
      Descripcion: [, Validators.required],
      Stock: [, Validators.required],
      Cantidad: [, Validators.required],
      ID: [, Validators.required],
      Turno: [, Validators.required],
      SedeCliente: [, Validators.required],
      NombreCliente: [, Validators.required],
      IDCliente: [, Validators.required],


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

  // VALIDACION PARA CAMPOS VACIOS
  validarCamposVacios() : any{
      if(this.FormularioPedidomateriaprima.valid){
        Swal.fire("Los datos se enviaron correctamente");

        this.clear();


      }else{
        Swal.fire("HAY CAMPOS VACIOS");
      }
  }


  clear() {
    console.log("clear clicked")
    this.FormularioPedidomateriaprima.reset();
  }

  //Funcion que limpia los campos de consulta
    limpiarCamposConsulta(){
      this.FormularioPedidomateriaprima.reset();
    }

     // Funcion para validar los campos vacios de las consultas
  validarCamposVaciosConsulta(){
    this.MateriaPFechaConsulta = [];
    
    
  }


  //Funcion encargada de buscar un producto por el id del producto
buscarProducto(){
   }
  

  // Funcion para llenar los datos de los productos en cada uno de los campos
 llenadoProducto(){

  }

    //Funcion que organiza los campos de la tabla de pedidos de menor a mayor
    organizacionPrecio(){
    //   this.pedidosProductos.sort((a,b)=> Number(a.pedExt_PrecioTotal) - Number(b.pedExt_PrecioTotal));
    //   const Toast = Swal.mixin({
    //     toast: true,
    //     position: 'top-end',
    //     showConfirmButton: false,
    //     timer: 2500,
    //     timerProgressBar: true,
    //     didOpen: (toast) => {
    //       toast.addEventListener('mouseenter', Swal.stopTimer)
    //       toast.addEventListener('mouseleave', Swal.resumeTimer)
    //     }
    //   });
    //   Toast.fire({
    //     icon: 'warning',
    //     title: 'Ordenado por "Precio Total" de menor a mayor'
    //   });
  }

    // Funcion que limpia los todos los campos de la vista
LimpiarCampos() {
      
    }


     // Funcion para actualizar 
     actualizarMateriaP(){
    
}  

}
