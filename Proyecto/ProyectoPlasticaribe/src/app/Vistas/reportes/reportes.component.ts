import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { UsuarioService } from 'src/app/Servicios/usuario.service';
import { TipoEstadosService } from 'src/app/Servicios/tipo-estados.service';
import { ClientesService } from 'src/app/Servicios/clientes.service';
import { RolesService } from 'src/app/Servicios/roles.service';
import { EstadosService } from 'src/app/Servicios/estados.service';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';

@Component({
  selector: 'app.Reportes.component',
  templateUrl: './Reportes.component.html',
  styleUrls: ['./Reportes.component.css']
})
export class ReportesComponent implements OnInit {

  public formularioReportes !: FormGroup;
  public FormConsultaReportes !: FormGroup;

  // VARIABLES PARA PASAR A LOS COMBOBOX
  usuarios=[];
  estado=[];
  tipoEstado=[];
  Reportes = [];
  titulosTabla = [];
  tipoReportes=[];
  Areas =[];

/* Vaiables para rescatar los ID de estado, sedes, empresa, valorTotal */
  storage_Id : number;
  storage_Nombre : any;
  storage_Rol : any;

/* Vaiables para rescatar los ID de estado, sedes, empresa, valorTotal */
 
  pages: number = 1;

  constructor( private frmBuilderReportes: FormBuilder,
        private usuarioService: UsuarioService,
        private tipoEstadoService : TipoEstadosService,
        private rolService : RolesService,
        private clientesService :ClientesService,
        private estadosService : EstadosService,
        @Inject(SESSION_STORAGE) private storage: WebStorageService,
    ) {

    this.formularioReportes = this.frmBuilderReportes.group({

      Areas:  [, Validators.required],
      TipoReportes: [, Validators.required],
      FechaHasta: [, Validators.required],
      ReportesId: [, Validators.required],
      ReportesAreaId:[, Validators.required],
      ReportesEstadoId:[, Validators.required],
      floatingInput:[, Validators.required],
    });


  }


  ngOnInit(): void { 
    this.lecturaStorage();
    // this.estadoComboBox();
  }


  lecturaStorage(){
    this.storage_Id = this.storage.get('Id');
    this.storage_Nombre = this.storage.get('Nombre');
    let rol = this.storage.get('Rol');
    this.rolService.srvObtenerLista().subscribe(datos_roles => {
      for (let index = 0; index < datos_roles.length; index++) {
        if (datos_roles[index].rolUsu_Id == rol) {
          this.storage_Rol = datos_roles[index].rolUsu_Nombre;
        }
      }
    });
  }

   initForms(){ }

  
  clear() {
      this.formularioReportes.reset();

    }

  // VALIDACION PARA CAMPOS VACIOS Y ENVIO DE DATOS
  validarCamposVacios() : any{
      if(this.formularioReportes.valid){
        Swal.fire("Los datos se enviaron correctamente");
        this.clear();


      }else{
        Swal.fire("HAY CAMPOS VACIOS");
      }
  }
   
  LimpiarCampos() {
    this.formularioReportes.reset();
    this.FormConsultaReportes.reset();
    
  }



  // DOCUMENTO EN EXCEL 
  
  Seasons = [
    
  ];

  name = 'ExcelSheet.xlsx';
  exportToExcel(): void {
    let element = document.getElementById('season-tble');
    const worksheet: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);

    const book: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, worksheet, 'Sheet1');
    XLSX.writeFile(book, this.name);
    
  }

  // estadoComboBox(){
  //   // FORMA DE HACER QUE SOLO SE RETORNEN LOS ESTADOS CON EL TIPO DE ESTADO "1", QUE ES EL EXCLUSIOVO PARA DOCUMENTOS
  //   this.usuarioService.srvObtenerListaPorId(this.storage.get('Id')).subscribe(datos_usuarios => {
  //     this.tipoEstadoService.srvObtenerListaPorId(1).subscribe(datos_tiposEstados => {
  //       this.estadosService.srvObtenerListaEstados().subscribe(datos_estados=>{
  //         for (let index = 0; index < datos_estados.length; index++) {
  //           if (datos_tiposEstados.tpEstado_Id == datos_estados[index].tpEstado_Id) {
  //             if (datos_usuarios.rolUsu_Id == 2){
  //               if (datos_estados[index].estado_Id == 11) {
  //                 this.estado.push(datos_estados[index].estado_Nombre);
  //                 break;
  //               }
  //             } else if (datos_usuarios.rolUsu_Id == 1){
  //               this.estado.push(datos_estados[index].estado_Nombre);
  //             }
  //           }
  //         }
  //       }, error =>{ console.log("error"); });
  //     });
  //   });

  // }


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
}

