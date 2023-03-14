import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import pdfMake from 'pdfmake/build/pdfmake';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';
import { ActivosService } from 'src/app/Servicios/Activos/Activos.service';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { DesperdicioService } from 'src/app/Servicios/Desperdicio/desperdicio.service';
import { FallasTecnicasService } from 'src/app/Servicios/FallasTecnicas/FallasTecnicas.service';
import { MaterialProductoService } from 'src/app/Servicios/MaterialProducto/materialProducto.service';
import { ProcesosService } from 'src/app/Servicios/Procesos/procesos.service';
import { RolesService } from 'src/app/Servicios/Roles/roles.service';
import { UsuarioService } from 'src/app/Servicios/Usuarios/usuario.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app.desperdicio.component',
  templateUrl: './desperdicio.component.html',
  styleUrls: ['./desperdicio.component.css']
})

export class DesperdicioComponent implements OnInit {

  FormDesperdicio !: FormGroup;
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  cargando : boolean = false; //Variable que permitirá validar si debe salir o no la imagen de carga
  fallas : any [] = []; //Variable que almacenará los diferentes tipos de fallas por los que se puede dar un desperdicio
  operarios : any [] = []; //Variable que almacenará la informacion de los operarios
  procesos : any [] = []; //Variable que almacenará los procesos de produccion de la empresa
  maquinas : any [] = []; //Variable que almacenará las diferentes maquinas
  grupoDespercios : any [] = []; //Variable que almacenará los desperdicios que se vayan ingresando para mstrarlos en la tabla
  datosPdf : any [] = []; //Variable que va a almacenar los datos ingresados a la base de datos
  materiales : any [] = []; //Variable que va a tener la información de los materiales

  constructor(private frmBuilder : FormBuilder,
                private rolService : RolesService,
                  @Inject(SESSION_STORAGE) private storage: WebStorageService,
                    private bagProService : BagproService,
                      private operariosService : UsuarioService,
                        private procesosService : ProcesosService,
                          private fallasService : FallasTecnicasService,
                            private maquinasService : ActivosService,
                              private deperdicioService : DesperdicioService,
                                private materiaService : MaterialProductoService,) {

    this.FormDesperdicio = this.frmBuilder.group({
      OTDesperdicio : [null],
      IdMaquina : [null, Validators.required],
      Maquina : [null, Validators.required],
      IdOperario : [null, Validators.required],
      Operario : [null, Validators.required],
      IdProducto : [null],
      Producto : [null],
      IdTipoMaterial : [null, Validators.required],
      TipoMaterial : [null, Validators.required],
      Impreso : [null, Validators.required],
      IdTipoNoConformidad : [null, Validators.required],
      TipoNoConformidad : [null, Validators.required],
      CantidadKg : [null, Validators.required],
      Observacion : [null],
      IdArea : [null, Validators.required],
      Area : [null, Validators.required],
      Fecha : [null, Validators.required],
    });
  }

  ngOnInit() {
    this.lecturaStorage();
    this.obtenerOperarios();;
    this.obtenerFallas();
    this.obtenerMaquinas();
    this.obtenerProcesos();
    this.obtenerMateriales();
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.storage.get('Id');
    this.storage_Nombre = this.storage.get('Nombre');
    this.ValidarRol = this.storage.get('Rol');
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = '$1,';
    return number.toString().replace(exp,rep);
  }

  // Funcion que limpiará los campos del formulario
  limpiarCampos(){
    this.cargando = false;
    this.FormDesperdicio.reset();
  }

  // Funcion que va a limpiar todo
  limpiarTodo(){
    this.cargando = false;
    this.FormDesperdicio.reset();
    this.grupoDespercios = [];
  }

  // Funcion que va a consultar los operarios
  obtenerOperarios(){
    this.operariosService.getUsuarios().subscribe(datos_operarios => {
      for (let i = 0; i < datos_operarios.length; i++) {
        if (datos_operarios[i].rolUsu_Id == 59) this.operarios.push(datos_operarios[i]);
      }
    });
  }

  //Funcion que va a conultar y obtener todas las areas de la empresa
  obtenerProcesos(){
    this.procesos = [];
    this.procesosService.srvObtenerLista().subscribe(datos_procesos => {
      for (let i = 0; i < datos_procesos.length; i++) {
        if (datos_procesos[i].proceso_Codigo != 12 && datos_procesos[i].proceso_Codigo != 11 && datos_procesos[i].proceso_Codigo != 10) {
          this.procesos.push(datos_procesos[i]);
        }
      }
    });
  }

  // Funcion que va a consultar y obtener la informacion de las fallas
  obtenerFallas(){
    this.fallasService.srvObtenerLista().subscribe(datos_fallas => {
      for (let i = 0; i < datos_fallas.length; i++) {
        if (datos_fallas[i].tipoFalla_Id == 11) this.fallas.push(datos_fallas[i]);
      }
    });
  }

  // Funcion que va a consultar y obtener la informacion de las maquinas
  obtenerMaquinas(){
    this.maquinasService.GetTodo().subscribe(datos_maquinas => {
      for (let i = 0; i < datos_maquinas.length; i++) {
        if (datos_maquinas[i].tpActv_Id == 4) this.maquinas.push(datos_maquinas[i]);
      }
    });
  }

  // Funcion que va a consultar y obtener la inforamcion de los materiales
  obtenerMateriales(){
    this.materiaService.srvObtenerLista().subscribe(datos_materiales => { this.materiales = datos_materiales });
  }

  // Funcion que va a consultar el id de la falla y en su lugar colocará el nombre en el formulario
  buscarFalla(){
    this.fallasService.srvObtenerListaPorId(this.FormDesperdicio.value.TipoNoConformidad).subscribe(datos_falla => {
      this.FormDesperdicio.patchValue({
        IdTipoNoConformidad : datos_falla.falla_Id,
        TipoNoConformidad : datos_falla.falla_Nombre,
      });
    }, error => { this.mensajesError(`¡No se pudo obtener información de la "No Conformidad" seleccionada!`, error.message); });
  }

  // Funcion que va a consultar el id del operario y en su lugar colocará el nombre en el formulario
  buscarOperario(){
    this.operariosService.srvObtenerListaPorId(this.FormDesperdicio.value.Operario).subscribe(datos_operario => {
      this.FormDesperdicio.patchValue({
        IdOperario : datos_operario.usua_Id,
        Operario : datos_operario.usua_Nombre,
      });
    }, error => { this.mensajesError(`¡No se pudo obtener información del operario seleccionada!`, error.message); });
  }

  // Funcion que va a consultar el id de la maquina y en su lugar colocará el serial de la maquina
  buscarMaquina(){
    this.maquinasService.GetId(this.FormDesperdicio.value.Maquina).subscribe(datos_maquinas => {
      this.FormDesperdicio.patchValue({
        IdMaquina : datos_maquinas.actv_Id,
        Maquina : datos_maquinas.actv_Serial,
      });
    }, error => { this.mensajesError(`¡No se pudo obtener información de la maquina seleccionada!`, error.message); });
  }

  // Funcion que va a consultar el id del area y en su lugar colocará el nombre del area o proceso
  buscarProceso(){
    this.procesosService.srvObtenerListaPorId(this.FormDesperdicio.value.Area).subscribe(datos_procesos => {
      this.FormDesperdicio.patchValue({
        IdArea : datos_procesos.proceso_Id,
        Area : datos_procesos.proceso_Nombre,
      });
    }, error => { this.mensajesError(`¡No se pudo obtener información del área seleccionada!`, error.message); });
  }

  // Funcion que va a consultar el id del material y en su lugar colocará el nombre de este
  buscarMaterial(){
    this.materiaService.srvObtenerListaPorId(this.FormDesperdicio.value.TipoMaterial).subscribe(datos_material => {
      this.FormDesperdicio.patchValue({
        IdTipoMaterial : datos_material.material_Id,
        TipoMaterial : datos_material.material_Nombre,
      });
    }, error => { this.mensajesError(`¡No se pudo obtener información del material seleccionado!`, error.message); });
  }

  // Funcion que consultará la informacion de la orden de trabajo
  consultarOrdenTrabajo(){
    this.cargando = true;
    let orden : number = this.FormDesperdicio.value.OTDesperdicio;
    this.bagProService.srvObtenerListaClienteOT_Item(orden).subscribe(datos_orden => {
      if (datos_orden.length == 0) {
        this.cargando = false;
        this.mensajesError(`¡No se pudo obtener información de la orden de trabajo N° ${orden}!`);
      }
      for (let i = 0; i < datos_orden.length; i++) {
        let imp : any = datos_orden[i].impresion.trim();
        if (imp == "1") imp = "SI";
        else if (imp == "0") imp = "NO";
        this.FormDesperdicio.patchValue({
          OTDesperdicio : orden,
          IdProducto : datos_orden[i].clienteItems,
          Producto : datos_orden[i].clienteItemsNom,
          IdTipoMaterial : datos_orden[i].extMaterial,
          TipoMaterial : datos_orden[i].extMaterialNom,
          Impreso : imp,
        });
        this.cargando = false;
      }
    }, error => { this.mensajesError(`¡No se pudo obtener información de la orden de trabajo N° ${orden}!`, error.message); });
  }

  // Funcion que va a llenar la tabla con la informacion del desperdicio digitadi
  llenarTabla(){
    this.cargando = true;
    let exits : boolean = false;
    if (this.FormDesperdicio.valid) {
      if (this.FormDesperdicio.value.OTDesperdicio == null) this.FormDesperdicio.value.OTDesperdicio = 0;
      if (this.FormDesperdicio.value.Producto == null) this.FormDesperdicio.value.Producto = `No aplica`;
      if (this.FormDesperdicio.value.IdProducto == null) this.FormDesperdicio.value.IdProducto = 100163;
      let info : any = {
        Ot : this.FormDesperdicio.value.OTDesperdicio,
        IdMaquina : this.FormDesperdicio.value.IdMaquina,
        Maquina : this.FormDesperdicio.value.Maquina,
        IdItem : this.FormDesperdicio.value.IdProducto,
        Item : `${this.FormDesperdicio.value.IdProducto} - ${this.FormDesperdicio.value.Producto}`,
        IdMateria : parseInt(this.FormDesperdicio.value.IdTipoMaterial),
        Material : this.FormDesperdicio.value.TipoMaterial,
        IdOperario : this.FormDesperdicio.value.IdOperario,
        Operario : this.FormDesperdicio.value.Operario,
        IdNoConformidad : this.FormDesperdicio.value.IdTipoNoConformidad,
        NoConformidad : this.FormDesperdicio.value.TipoNoConformidad,
        Cantidad : this.FormDesperdicio.value.CantidadKg,
        Impreso : this.FormDesperdicio.value.Impreso,
        Observacion : this.FormDesperdicio.value.Observacion,
        Fecha : this.FormDesperdicio.value.Fecha,
        IdArea : this.FormDesperdicio.value.IdArea,
        Area : this.FormDesperdicio.value.Area,
      }
      this.grupoDespercios.push(info);
      this.cargando = false;
    } else this.mensajesAdvertencia(`¡Hay Campos Vacios!`);
  }

  // Funcion que va a crear el registro de desperdicio
  crearDesperdicio(){
    let error : boolean = false;
    if (this.grupoDespercios.length != 0){
      this.cargando = true;
      for (let i = 0; i < this.grupoDespercios.length; i++) {
        let observacion : any = this.grupoDespercios[i].Observacion;
        if (observacion == null) observacion = '';
        let info : any = {
          Desp_OT : this.grupoDespercios[i].Ot,
          Prod_Id : this.grupoDespercios[i].IdItem,
          Material_Id : this.grupoDespercios[i].IdMateria,
          Actv_Id : this.grupoDespercios[i].IdMaquina,
          Usua_Operario : this.grupoDespercios[i].IdOperario,
          Desp_Impresion : this.grupoDespercios[i].Impreso,
          Falla_Id : this.grupoDespercios[i].IdNoConformidad,
          Desp_PesoKg : this.grupoDespercios[i].Cantidad,
          Desp_Fecha : this.grupoDespercios[i].Fecha,
          Desp_Observacion : observacion,
          Usua_Id : this.storage_Id,
          Desp_FechaRegistro : this.today,
          Desp_HoraRegistro : moment().format('H:mm:ss'),
          Proceso_Id : this.grupoDespercios[i].IdArea,
        }
        this.deperdicioService.Insert(info).subscribe(datos_insertados => {
          Swal.fire({ icon : 'success', title : `Registro Exitoso`, text : 'Se ha ingresado el desperdicio exitosamente' });
        }, error => {
          this.mensajesError(`¡Ha ocurrido un error, no se pudo ingresar el desperdicio!`, error.message);
          error = true;
        });
      }
    } else this.mensajesAdvertencia(`¡Debe añadir minimo un registro a la tabla para crear un desperdicio!`);

    setTimeout(() => {
      if (!error) {
        this.llenarDatosPdf();
        this.limpiarTodo();
      }
    }, 2000);
  }

  // Funcion que creará un PDF del desperdicio ingresado
  crearPdf(){
    let nombre : string = this.storage.get('Nombre');
    this.deperdicioService.GetUltimoPedido().subscribe(datos_desperdicios => {
      for (let i = 0; i < datos_desperdicios.length; i++) {
        const pdfDefinicion : any = {
          info: { title: `Reporte Merma de Material - ${this.today}` },
          pageSize: { width: 630, height: 760 },
          footer: function(currentPage : any, pageCount : any) {
            return [
              {
                columns: [
                  { text: `Reporte generado por ${nombre}`, alignment: ' left', fontSize: 8, margin: [30, 0, 0, 0] },
                  { text: `Fecha Expedición Documento ${moment().format('YYYY-MM-DD')} - ${moment().format('H:mm:ss')}`, alignment: 'right', fontSize: 8 },
                  { text: `${currentPage.toString() + ' de ' + pageCount}`, alignment: 'right', fontSize: 8, margin: [0, 0, 30, 0] },
                ]
              }
            ]
          },
          content : [
            {
              columns: [
                { image : logoParaPdf, width : 220, height : 50 },
                { text: `Reporte Merma de Material`, alignment: 'right',  style: 'titulo', margin: 30 }
              ]
            },
            '\n \n',
            {
              style: 'tablaEmpresa',
              table: {
                widths: [90, '*', 90, '*'],
                style: 'header',
                body: [
                  [
                    { border: [false, false, false, false], text: `Nombre Empresa` },
                    { border: [false, false, false, true], text: `Plasticaribe S.A.S` },
                    { border: [false, false, false, false], text: `Dirección` },
                    { border: [false, false, false, true], text: `${datos_desperdicios[i].empresa_Direccion}` },
                  ],
                  [
                    { border: [false, false, false, false], text: `Ciudad` },
                    { border: [false, false, false, true], text: `${datos_desperdicios[i].empresa_Ciudad}` },
                    { border: [false, false, false, false], text: `Fecha registro` },
                    { border: [false, false, false, true], text: `${datos_desperdicios[i].desp_FechaRegistro.replace('T00:00:00', '')}` },
                  ],
                ]
              },
              layout: { defaultBorder: false, },
              fontSize: 9,
            },
            '\n \n',
            { text: `Ingresados Por:\n`, alignment: 'left', style: 'header', },
            { text: `${datos_desperdicios[i].nombreCreador}\n`, alignment: 'left', style: 'texto', },
            { text: `\n\n Información detallada de los Desperdicios \n `, alignment: 'center', style: 'header' },

            this.table(this.datosPdf, ['OT', 'Maquina', 'Item', 'Material', 'Operario', 'No_Conformidad', 'Cantidad', 'Impreso', 'Area', 'Fecha', 'Observacion']),
          ],
          styles: {
            header: { fontSize: 10, bold: true },
            texto: { fontSize: 9, },
            titulo: { fontSize: 20, bold: true }
          }
        }
        const pdf = pdfMake.createPdf(pdfDefinicion);
        pdf.open();
        this.cargando = false;
        break;
      }
    }, error => { this.mensajesError(`¡Error al consultar la información del ultimo registro!`, error.message); });
  }

  // Funcion que va a consultar los datos de desperdicio
  llenarDatosPdf(){
    this.datosPdf = [];
    this.deperdicioService.GetUltimoPedido().subscribe(datos_desperdicios => {
      for (let i = 0; i < datos_desperdicios.length; i++) {
        let info : any = {
          OT : datos_desperdicios[i].desp_OT,
          Maquina : datos_desperdicios[i].actv_Serial,
          Item : datos_desperdicios[i].prod_Id,
          Material : datos_desperdicios[i].material_Nombre,
          Operario : datos_desperdicios[i].usua_Nombre,
          No_Conformidad : datos_desperdicios[i].falla_Nombre,
          Cantidad : this.formatonumeros(datos_desperdicios[i].desp_PesoKg.toFixed()),
          Impreso : datos_desperdicios[i].desp_Impresion,
          Observacion : datos_desperdicios[i].desp_Observacion,
          Fecha : datos_desperdicios[i].desp_Fecha.replace('T00:00:00', ''),
          Area : datos_desperdicios[i].proceso_Nombre,
        }
        this.datosPdf.push(info);
      }
      setTimeout(() => { this.crearPdf(); }, 2000);
    }, error => { this.mensajesError(`¡Error al consultar la información del ultimo registro!`, error.message); });
  }

  // Funcion que se encagará de llenar la tabla del pdf
  buildTableBody(data, columns) {
    var body = [];
    body.push(columns);
    data.forEach(function(row) {
      var dataRow = [];
      columns.forEach(function(column) {
        dataRow.push(row[column].toString());
      });
      body.push(dataRow);
    });

    return body;
  }

  // Funcion que genera la tabla donde se mostrará la información
  table(data, columns) {
    return {
      table: {
        headerRows: 1,
        widths: [30, 32, 30, 30, 60, 62, 40, 30, 35, 42, 60],
        body: this.buildTableBody(data, columns),
      },
      fontSize: 8,
      layout: {
        fillColor: function (rowIndex, node, columnIndex) {
          return (rowIndex == 0) ? '#CCCCCC' : null;
        }
      }
    };
  }

  // Funcion que va a quitar un desperdicio de la tabla
  quitarDesperdicio(data){
    Swal.fire({
      title: '¿Estás seguro de eliminar el desperdicio?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        for (let i = 0; i < this.grupoDespercios.length; i++) {
          if (this.grupoDespercios[i].Ot == data.Ot && this.grupoDespercios[i].NoConformidad == data.NoConformidad) {
            this.grupoDespercios.splice(i, 1);
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
              title: `¡Se ha quitado el desperdicio de la Orden de Trabajo ${data.Ot} con la "No Conformidad" ${data.NoConformidad}!`
            });
          }
        }
      }
    });
  }

  // Funcion que pasará mensajes de advertencia
  mensajesAdvertencia(texto : string){
    Swal.fire({ icon : 'warning', title : `Advertencia`, text : texto });
    this.cargando = false;
  }

  // Funcion que enviaraá mensajes de error
  mensajesError(texto : string, error : any = ''){
    Swal.fire({ icon : 'error', title : `Opps...`, html: `<b>${texto}</b><br>` + `<spam style="color: #f00">${error}</spam>` });
    this.cargando = false;
  }
}
