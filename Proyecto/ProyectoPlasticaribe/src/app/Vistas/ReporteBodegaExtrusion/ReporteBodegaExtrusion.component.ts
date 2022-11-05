import { Component, Inject, Injectable, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { Table } from 'primeng/table';
import { DetallesAsgRollos_ExtrusionService } from 'src/app/Servicios/DetallesAsgRollos_Extrusion.service';
import { DtIngRollos_ExtrusionService } from 'src/app/Servicios/DtIngRollos_Extrusion.service';
import { EstadosService } from 'src/app/Servicios/estados.service';
import { ProductoService } from 'src/app/Servicios/producto.service';
import { RolesService } from 'src/app/Servicios/roles.service';
import { TipoDocumentoService } from 'src/app/Servicios/tipoDocumento.service';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-ReporteBodegaExtrusion',
  templateUrl: './ReporteBodegaExtrusion.component.html',
  styleUrls: ['./ReporteBodegaExtrusion.component.css']
})
export class ReporteBodegaExtrusionComponent implements OnInit {

  public FormConsultarFiltros !: FormGroup;
  cargando : boolean = true; //Variable para validar que salga o no la imagen de carga
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  estados : any [] = []; //Variable que almacenará los estados que pueden tener los rollos en esta bodega
  registrosConsultados : any [] = []; //Variable que va a almacenar los diferentes registros consultados

  constructor(private frmBuilder : FormBuilder,
                private rolService : RolesService,
                  @Inject(SESSION_STORAGE) private storage: WebStorageService,
                    private estadosService : EstadosService,
                      private ingRollosService : DtIngRollos_ExtrusionService,
                        private salidaRollosService : DetallesAsgRollos_ExtrusionService,) {

    this.FormConsultarFiltros = this.frmBuilder.group({
      Documento : [null, Validators.required],
      ProdNombre : ['', Validators.required],
      Rollo : ['', Validators.required ],
      tipoDoc : ['', Validators.required ],
      fechaDoc: [null, Validators.required],
      fechaFinalDoc: [null, Validators.required],
      estadoRollo: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.lecturaStorage();
    this.obtenerEstados();
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

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = '$1,';
    return number.toString().replace(exp,rep);
  }

  // Funcion que va a consultar y almacenar los estados que pueden tener los rollos en la bodega de extrusion
  obtenerEstados(){
    this.estadosService.srvObtenerListaEstados().subscribe(datos_estados => {
      for (let i = 0; i < datos_estados.length; i++) {
        if (datos_estados[i].estado_Id == 19 || datos_estados[i].estado_Id == 23) this.estados.push(datos_estados[i]);
      }
    });
  }

  //
  limpiarCampos(){
    this.cargando = false;
    this.FormConsultarFiltros.reset();
    this.registrosConsultados = [];
  }

  // Funcion que va a consultar por los filtros que se busquen
  consultarFiltros(){
    this.cargando = false;
    this.registrosConsultados = [];
    let ot : any = this.FormConsultarFiltros.value.ot;
    let fechaIni : any = this.FormConsultarFiltros.value.fechaDoc;
    let fechaFin : any = this.FormConsultarFiltros.value.fechaFinalDoc;

    if (fechaIni != null && fechaFin != null) {
      this.ingRollosService.getconsultaRollosFechas(fechaIni, fechaFin).subscribe(datos_factura => {
        for (let i = 0; i < datos_factura.length; i++) {
          this.llenarTabla(datos_factura[i]);
        }
      });
      this.salidaRollosService.getconsultaRollosFechas(fechaIni, fechaFin).subscribe(datos_factura => {
        for (let i = 0; i < datos_factura.length; i++) {
          this.llenarTabla(datos_factura[i]);
        }
      });
    } else if (ot != null) {
      this.ingRollosService.getconsultaRollosOT(ot).subscribe(datos_factura => {
        for (let i = 0; i < datos_factura.length; i++) {
          this.llenarTabla(datos_factura[i]);
        }
      });
      this.salidaRollosService.getconsultaRollosOT(ot).subscribe(datos_factura => {
        for (let i = 0; i < datos_factura.length; i++) {
          this.llenarTabla(datos_factura[i]);
        }
      });
    } else if (fechaIni != null) {
      this.ingRollosService.getconsultaRollosFechas(fechaIni, fechaIni).subscribe(datos_factura => {
        for (let i = 0; i < datos_factura.length; i++) {
          this.llenarTabla(datos_factura[i]);
        }
      });
      this.salidaRollosService.getconsultaRollosFechas(fechaIni, fechaIni).subscribe(datos_factura => {
        for (let i = 0; i < datos_factura.length; i++) {
          this.llenarTabla(datos_factura[i]);
        }
      });
    } else {
      this.ingRollosService.getconsultaRollosFechas(this.today, this.today).subscribe(datos_factura => {
        for (let i = 0; i < datos_factura.length; i++) {
          this.llenarTabla(datos_factura[i]);
        }
      });
      this.salidaRollosService.getconsultaRollosFechas(this.today, this.today).subscribe(datos_factura => {
        for (let i = 0; i < datos_factura.length; i++) {
          this.llenarTabla(datos_factura[i]);
        }
      });
    }
    setTimeout(() => { this.cargando = true; }, 2500);
  }

  // Funcion que servirá para llenar la tabla que se verá que está en la vista con la informacion que devuelve la consulta
  llenarTabla(data : any){
    let info : any = {
      Ot : data.ot,
      Fecha : data.fecha.replace('T00:00:00', ''),
      Tipo : data.tipo,
      Usuario : data.usuario,
    }
    this.registrosConsultados.push(info)
  }

  // Funcion que limpiará la tabla de cualquier filtro que se le haya aplicado
  clear(table: Table) {
    table.clear();
  }
}
