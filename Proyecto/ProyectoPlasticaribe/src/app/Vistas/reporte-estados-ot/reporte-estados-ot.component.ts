import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { AsignacionMPService } from 'src/app/Servicios/asignacionMP.service';
import { BagproService } from 'src/app/Servicios/Bagpro.service';
import { DetallesAsignacionService } from 'src/app/Servicios/detallesAsignacion.service';
import { EstadosService } from 'src/app/Servicios/estados.service';
import { RolesService } from 'src/app/Servicios/roles.service';
import { TipoDocumentoService } from 'src/app/Servicios/tipoDocumento.service';
import { UsuarioService } from 'src/app/Servicios/usuario.service';
import Swal from 'sweetalert2';
import { AsignacionMateriaPrimaComponent } from '../asignacion-materia-prima/asignacion-materia-prima.component';

@Component({
  selector: 'app-reporte-estados-ot',
  templateUrl: './reporte-estados-ot.component.html',
  styleUrls: ['./reporte-estados-ot.component.css']
})
export class ReporteEstadosOTComponent implements OnInit {

  public formularioOT !: FormGroup;
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  titulosTabla = []; //Array que mostrará los encabezados de los campos de la tabla.
  tipoDocumento = []; //Variable para mostrar los distintos tipos de documentos
  valorTotal = 0;
  totalMPEntregada = 0;
  cantRestante = 0;
  kgProduciodosOT = 0;
  ArrayDocumento = [];


  constructor(
    private frmBuilder : FormBuilder,
    @Inject(SESSION_STORAGE) private storage: WebStorageService,
    private rolService : RolesService,
    private tipoDocumentoService : TipoDocumentoService,
    private bagProServices : BagproService,
    private asignacionService : AsignacionMPService,
    private asignacionMpService : DetallesAsignacionService,
    private usuariosService : UsuarioService,
    private estadosService : EstadosService )
   {
      this.formularioOT = this.frmBuilder.group({
        idDocumento : new FormControl(),
        fecha: new FormControl(),
        fechaFinal : new FormControl(),
        TipoDocumento: new FormControl(),
        estado : new FormControl(),
    });

    }
  /** Funcion que se ejecuta al iniciar dicha vista */
  ngOnInit(): void {
    this.ColumnasTabla();
    this.lecturaStorage();
    this.obtenerTipoDocumento();
  }

  /** Inicialización de formularios como requeridos */
  initForms() {
    this.formularioOT = this.frmBuilder.group({
      idDocumento : [,Validators.required],
      fecha: [, Validators.required],
      fechaFinal: [, Validators.required],
      TipoDocumento: [, Validators.required],
      estado : ['', Validators.required],
    });
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

  limpiarCampos(){
    this.formularioOT.reset();
  }

  limpiarTodo(){
    this.formularioOT.reset();
    this.ArrayDocumento = [];
  }

    //Funcion que colocará el nombre a las columnas de la tabla en la cual se muestran los productos pedidos por los clientes
    ColumnasTabla(){
      this.titulosTabla = [];
      this.titulosTabla = [{
        OT : "OT",
        OTTipoMov : "Movimiento",
        OTFecha : "Fecha Registro",
        OTUsuario : "Registrado por",
        OTEstado : "Estado OT",
        OTVer : "Ver",
      }]
    }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = '$1,';
    return number.toString().replace(exp,rep);
  }

    buscarBOPPSegunFecha() {
    }

    /** Función para cargar los diferenciar los distintos tipos de documentos */
    obtenerTipoDocumento(){
      this.tipoDocumentoService.srvObtenerLista().subscribe(datos_tiposDocumentos => {
        for (let index = 0; index < datos_tiposDocumentos.length; index++) {
          this.tipoDocumento.push(datos_tiposDocumentos[index])
        }
      });
    }

    validarConsulta(){
      let idDoc : string = this.formularioOT.value.idDocumento;
      let fecha : any = this.formularioOT.value.fecha;
      let fechaFinal : any = this.formularioOT.value.fechaFinal;
      let TipoDocumento : string = this.formularioOT.value.TipoDocumento;
      let estado : string = this.formularioOT.value.estado;

      if(idDoc != null) {
        this.bagProServices.srvObtenerListaClienteOT_Item(idDoc).subscribe(registros_OT => {
          if(registros_OT.length != 0) {
            for (let bpro = 0; bpro < registros_OT.length; bpro++) {
              this.recorrerEncabezadoAsignacionesMatPrima(idDoc);
            }
          } else {
            Swal.fire('La OT "' + idDoc + '" no existe.')
          }
        });
      }
    }

    recorrerEncabezadoAsignacionesMatPrima(OT : any){
      this.asignacionService.srvObtenerListaPorOt(OT).subscribe(registrosAsignacionesMP => {
        if(registrosAsignacionesMP.length != 0) {

          for (let asgmp = 0; asgmp < registrosAsignacionesMP.length; asgmp++) {
            if(registrosAsignacionesMP[asgmp].asigMP_OrdenTrabajo == OT) {

              this.usuariosService.srvObtenerListaPorId(registrosAsignacionesMP[asgmp].usua_Id).subscribe(registrosUsuarios => {

                this.estadosService.srvObtenerListaPorId(registrosAsignacionesMP[asgmp].estado_OrdenTrabajo).subscribe(registrosEstados => {
                  console.log(registrosEstados);
                  let estadoNombre = [];
                  estadoNombre.push(registrosEstados);

                  for (const estado of estadoNombre) {

                    if(registrosAsignacionesMP[asgmp].estado_OrdenTrabajo ==  estado.estado_Id){

                      const tablaAsigMatPrima : any = {
                        OrdTrabajo : registrosAsignacionesMP[asgmp].asigMP_OrdenTrabajo,
                        Movimiento : 'Asignación',
                        FechaRegistro : registrosAsignacionesMP[asgmp].asigMp_FechaEntrega,
                        Usuario : registrosUsuarios.usua_Nombre,
                        EstadoOT : estado.estado_Nombre
                      }
                      this.ArrayDocumento.push(tablaAsigMatPrima);
                    }
                  }
                });
              });
            }
            break;
          }
        }
      });
    }
}

/**  this.asignacionMpService.srvObtenerListaPorAsigId(registrosAsignacionesMP[asgmp].asigMp_Id).subscribe(registrosDetAsignacionesMP => {
                for (let dtAsgMP = 0; dtAsgMP < registrosDetAsignacionesMP.length; dtAsgMP++) {
 */
