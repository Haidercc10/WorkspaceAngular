import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import pdfMake from 'pdfmake/build/pdfmake';
import { AppComponent } from 'src/app/app.component';
import { ActivosService } from 'src/app/Servicios/Activos/Activos.service';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { DesperdicioService } from 'src/app/Servicios/Desperdicio/desperdicio.service';
import { FallasTecnicasService } from 'src/app/Servicios/FallasTecnicas/FallasTecnicas.service';
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

  constructor(private frmBuilder : FormBuilder,
                private rolService : RolesService,
                  @Inject(SESSION_STORAGE) private storage: WebStorageService,
                    private bagProService : BagproService,
                      private operariosService : UsuarioService,
                        private procesosService : ProcesosService,
                          private fallasService : FallasTecnicasService,
                            private maquinasService : ActivosService,
                              private deperdicioService : DesperdicioService,
                                private appComponent : AppComponent,) {

    this.FormDesperdicio = this.frmBuilder.group({
      OTDesperdicio : [null, Validators.required],
      IdMaquina : [null, Validators.required],
      Maquina : [null, Validators.required],
      IdOperario : [null, Validators.required],
      Operario : [null, Validators.required],
      IdProducto : [null, Validators.required],
      Producto : [null, Validators.required],
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
    this.obtenerOperarios();
    this.obtenerProcesos();
    this.obtenerFallas();
    this.obtenerMaquinas();
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage() {
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
    }, error => { this.mensajesError(`¡Error al concetarse con el API!`, error.message); });
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
        this.operarios.push(datos_operarios[i]);
      }
    });
  }

  //Funcion que va a conultar y obtener todas las areas de la empresa
  obtenerProcesos(){
    this.procesosService.srvObtenerLista().subscribe(datos_procesos => {
      for (let i = 0; i < datos_procesos.length; i++) {
        if (datos_procesos[i].proceso_Codigo != 12
          && datos_procesos[i].proceso_Codigo != 11
          && datos_procesos[i].proceso_Codigo != 10) this.procesos.push(datos_procesos[i]);
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
        this.maquinas.push(datos_maquinas[i]);
      }
    });
  }

  // Funcion que va a consultar el id de la falla y en su lugar colocará el nombre en el formulario
  buscarFalla(){
    this.fallasService.srvObtenerListaPorId(this.FormDesperdicio.value.TipoNoConformidad).subscribe(datos_falla => {
      this.FormDesperdicio.setValue({
        OTDesperdicio : this.FormDesperdicio.value.OTDesperdicio,
        IdMaquina : this.FormDesperdicio.value.IdMaquina,
        Maquina : this.FormDesperdicio.value.Maquina,
        IdOperario : this.FormDesperdicio.value.IdOperario,
        Operario : this.FormDesperdicio.value.Operario,
        IdProducto : this.FormDesperdicio.value.IdProducto,
        Producto : this.FormDesperdicio.value.Producto,
        IdTipoMaterial : this.FormDesperdicio.value.IdTipoMaterial,
        TipoMaterial : this.FormDesperdicio.value.TipoMaterial,
        Impreso : this.FormDesperdicio.value.Impreso,
        IdTipoNoConformidad : datos_falla.falla_Id,
        TipoNoConformidad : datos_falla.falla_Nombre,
        CantidadKg : this.FormDesperdicio.value.CantidadKg,
        Observacion : this.FormDesperdicio.value.Observacion,
        IdArea : this.FormDesperdicio.value.IdArea,
        Area : this.FormDesperdicio.value.Area,
        Fecha : this.FormDesperdicio.value.Fecha,
      });
    }, error => { this.mensajesError(`¡No se pudo obtener información de la "No Conformidad" seleccionada!`, error.message); });
  }

  // Funcion que va a consultar el id del operario y en su lugar colocará el nombre en el formulario
  buscarOperario(){
    this.operariosService.srvObtenerListaPorId(this.FormDesperdicio.value.Operario).subscribe(datos_operario => {
      this.FormDesperdicio.setValue({
        OTDesperdicio : this.FormDesperdicio.value.OTDesperdicio,
        IdMaquina : this.FormDesperdicio.value.IdMaquina,
        Maquina : this.FormDesperdicio.value.Maquina,
        IdOperario : datos_operario.usua_Id,
        Operario : datos_operario.usua_Nombre,
        IdProducto : this.FormDesperdicio.value.IdProducto,
        Producto : this.FormDesperdicio.value.Producto,
        IdTipoMaterial : this.FormDesperdicio.value.IdTipoMaterial,
        TipoMaterial : this.FormDesperdicio.value.TipoMaterial,
        Impreso : this.FormDesperdicio.value.Impreso,
        IdTipoNoConformidad : this.FormDesperdicio.value.IdTipoNoConformidad,
        TipoNoConformidad : this.FormDesperdicio.value.TipoNoConformidad,
        CantidadKg : this.FormDesperdicio.value.CantidadKg,
        Observacion : this.FormDesperdicio.value.Observacion,
        IdArea : this.FormDesperdicio.value.IdArea,
        Area : this.FormDesperdicio.value.Area,
        Fecha : this.FormDesperdicio.value.Fecha,
      });
    }, error => { this.mensajesError(`¡No se pudo obtener información del operario seleccionada!`, error.message); });
  }

  // Funcion que va a consultar el id de la maquina y en su lugar colocará el serial de la maquina
  buscarMaquina(){
    this.maquinasService.GetId(this.FormDesperdicio.value.Maquina).subscribe(datos_maquinas => {
      this.FormDesperdicio.setValue({
        OTDesperdicio : this.FormDesperdicio.value.OTDesperdicio,
        IdMaquina : datos_maquinas.actv_Id,
        Maquina : datos_maquinas.actv_Serial,
        IdOperario : this.FormDesperdicio.value.IdOperario,
        Operario : this.FormDesperdicio.value.Operario,
        IdProducto : this.FormDesperdicio.value.IdProducto,
        Producto : this.FormDesperdicio.value.Producto,
        IdTipoMaterial : this.FormDesperdicio.value.IdTipoMaterial,
        TipoMaterial : this.FormDesperdicio.value.TipoMaterial,
        Impreso : this.FormDesperdicio.value.Impreso,
        IdTipoNoConformidad : this.FormDesperdicio.value.IdTipoNoConformidad,
        TipoNoConformidad : this.FormDesperdicio.value.TipoNoConformidad,
        CantidadKg : this.FormDesperdicio.value.CantidadKg,
        Observacion : this.FormDesperdicio.value.Observacion,
        IdArea : this.FormDesperdicio.value.IdArea,
        Area : this.FormDesperdicio.value.Area,
        Fecha : this.FormDesperdicio.value.Fecha,
      });
    }, error => { this.mensajesError(`¡No se pudo obtener información de la maquina seleccionada!`, error.message); });
  }

  // Funcion que va a consultar el id del area y en su lugar colocará el nombre del area o proceso
  buscarProceso(){
    this.procesosService.srvObtenerListaPorId(this.FormDesperdicio.value.Area).subscribe(datos_procesos => {
      this.FormDesperdicio.setValue({
        OTDesperdicio : this.FormDesperdicio.value.OTDesperdicio,
        IdMaquina : this.FormDesperdicio.value.IdMaquina,
        Maquina : this.FormDesperdicio.value.Maquina,
        IdOperario : this.FormDesperdicio.value.IdOperario,
        Operario : this.FormDesperdicio.value.Operario,
        IdProducto : this.FormDesperdicio.value.IdProducto,
        Producto : this.FormDesperdicio.value.Producto,
        IdTipoMaterial : this.FormDesperdicio.value.IdTipoMaterial,
        TipoMaterial : this.FormDesperdicio.value.TipoMaterial,
        Impreso : this.FormDesperdicio.value.Impreso,
        IdTipoNoConformidad : this.FormDesperdicio.value.IdTipoNoConformidad,
        TipoNoConformidad : this.FormDesperdicio.value.TipoNoConformidad,
        CantidadKg : this.FormDesperdicio.value.CantidadKg,
        Observacion : this.FormDesperdicio.value.Observacion,
        IdArea : datos_procesos.proceso_Id,
        Area : datos_procesos.proceso_Nombre,
        Fecha : this.FormDesperdicio.value.Fecha,
      });
    }, error => { this.mensajesError(`¡No se pudo obtener información del área seleccionada!`, error.message); });
  }

  // Funcion que consultará la informacion de la orden de trabajo
  consultarOrdenTrabajo(){
    this.cargando = true;
    let orden : number = this.FormDesperdicio.value.OTDesperdicio;
    this.bagProService.srvObtenerListaClienteOT_Item(orden).subscribe(datos_orden => {
      for (let i = 0; i < datos_orden.length; i++) {
        let imp : any = datos_orden[i].impresion.trim();
        if (imp == "1") imp = "SI";
        else if (imp == "0") imp = "NO";
        this.FormDesperdicio.setValue({
          OTDesperdicio : orden,
          IdMaquina : this.FormDesperdicio.value.IdMaquina,
          Maquina : this.FormDesperdicio.value.Maquina,
          IdOperario : this.FormDesperdicio.value.IdOperario,
          Operario : this.FormDesperdicio.value.Operario,
          IdProducto : datos_orden[i].clienteItems,
          Producto : datos_orden[i].clienteItemsNom,
          IdTipoMaterial : datos_orden[i].extMaterial,
          TipoMaterial : datos_orden[i].extMaterialNom,
          Impreso : imp,
          IdTipoNoConformidad : this.FormDesperdicio.value.IdTipoNoConformidad,
          TipoNoConformidad : this.FormDesperdicio.value.TipoNoConformidad,
          CantidadKg : this.FormDesperdicio.value.CantidadKg,
          Observacion : this.FormDesperdicio.value.Observacion,
          IdArea : this.FormDesperdicio.value.IdArea,
          Area : this.FormDesperdicio.value.Area,
          Fecha : this.FormDesperdicio.value.Fecha,
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
      for (let i = 0; i < this.grupoDespercios.length; i++) {
        if (this.grupoDespercios[i].Ot == this.FormDesperdicio.value.OTDesperdicio
          && this.grupoDespercios[i].NoConformidad == this.FormDesperdicio.value.TipoNoConformidad
          && this.grupoDespercios[i].Area == this.FormDesperdicio.value.Area) {
          exits = true;
        }
      }
      setTimeout(() => {
        if (exits) this.mensajesAdvertencia(`¡Ya hay una orden de trabajo con el número ${this.FormDesperdicio.value.OTDesperdicio} y la "No Conformidad" ${this.FormDesperdicio.value.TipoNoConformidad} del área de ${this.FormDesperdicio.value.Area} en la tabla!`);
        else {
          let info : any = {
            Ot : this.FormDesperdicio.value.OTDesperdicio,
            IdMaquina : this.FormDesperdicio.value.IdMaquina,
            Maquina : this.FormDesperdicio.value.Maquina,
            IdItem : this.FormDesperdicio.value.IdProducto,
            Item : `${this.FormDesperdicio.value.IdProducto} - ${this.FormDesperdicio.value.Producto}`,
            IdMateria : parseInt(this.FormDesperdicio.value.IdTipoMaterial.trim()),
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
          this.limpiarCampos();
        }
      }, 1000);
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
    }, 10 * this.grupoDespercios.length);
  }

  // Funcion que creará un PDF del desperdicio ingresado
  crearPdf(){
    this.deperdicioService.GetUltimoPedido().subscribe(datos_desperdicios => {
      for (let i = 0; i < datos_desperdicios.length; i++) {
        const pdfDefinicion : any = {
          info: {
            title: `Reporte Merma de Material - ${this.today}`
          },
          pageSize: {
            width: 630,
            height: 760
          },
          footer: {
            columns: [
              { text: `Fecha Expedición Documento ${this.today} - ${moment().format('H:mm:ss')}`, alignment: 'right', fontSize: 8, margin: [0, 0, 20, 0] }
            ]
          },
          content : [
            {
              columns: [
                {
                  image : this.appComponent.logoParaPdf,
                  width : 100,
                  height : 80
                },
                {
                  text: `Reporte Merma de Material`,
                  alignment: 'right',
                  style: 'titulo',
                  margin: 30
                }
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
                    {
                      border: [false, false, false, false],
                      text: `Nombre Empresa`
                    },
                    {
                      border: [false, false, false, true],
                      text: `Plasticaribe S.A.S`
                    },
                    {
                      border: [false, false, false, false],
                      text: `Dirección`
                    },
                    {
                      border: [false, false, false, true],
                      text: `${datos_desperdicios[i].empresa_Direccion}`
                    },
                  ],
                  [
                    {
                      border: [false, false, false, false],
                      text: `Ciudad`
                    },
                    {
                      border: [false, false, false, true],
                      text: `${datos_desperdicios[i].empresa_Ciudad}`
                    },
                    {
                      border: [false, false, false, false],
                      text: `Fecha registro`
                    },
                    {
                      border: [false, false, false, true],
                      text: `${datos_desperdicios[i].desp_FechaRegistro.replace('T00:00:00', '')}`
                    },
                  ],
                ]
              },
              layout: {
                defaultBorder: false,
              },
              fontSize: 9,
            },
            '\n \n',
            {
              text: `Ingresados Por:\n`,
              alignment: 'left',
              style: 'header',
            },
            {
              text: `${datos_desperdicios[i].nombreCreador}\n`,
              alignment: 'left',
              style: 'texto',
            },
            {
              text: `\n\n Información detallada de los Desperdicios \n `,
              alignment: 'center',
              style: 'header'
            },

            this.table(this.datosPdf, ['OT', 'Maquina', 'Item', 'Material', 'Operario', 'No_Conformidad', 'Cantidad', 'Impreso', 'Area', 'Fecha', 'Observacion']),
          ],
          styles: {
            header: {
              fontSize: 10,
              bold: true
            },
            texto: {
              fontSize: 9,
            },
            titulo: {
              fontSize: 20,
              bold: true
            }
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
