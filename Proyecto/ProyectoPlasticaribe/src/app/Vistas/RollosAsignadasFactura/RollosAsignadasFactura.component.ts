import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import pdfMake from 'pdfmake/build/pdfmake';
import { AsignacionProductosFacturaService } from 'src/app/Servicios/AsignacionProductosFactura.service';
import { DetallesAsignacionProductosFacturaService } from 'src/app/Servicios/DetallesAsignacionProductosFactura.service';
import { DetallesEntradaRollosService } from 'src/app/Servicios/DetallesEntradaRollos.service';
import { EntradaRollosService } from 'src/app/Servicios/EntradaRollos.service';
import { RolesService } from 'src/app/Servicios/roles.service';
import { UsuarioService } from 'src/app/Servicios/usuario.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-RollosAsignadasFactura',
  templateUrl: './RollosAsignadasFactura.component.html',
  styleUrls: ['./RollosAsignadasFactura.component.css']
})
export class RollosAsignadasFacturaComponent implements OnInit {

  public FormConsultarFactura !: FormGroup; //formulario para consultar una factura y ver los rollos que tiene asignados

  cargando : boolean = true; //Variable para validar que salga o no la imagen de carga
  today : any = new Date(); //Variable que se usará para llenar la fecha actual
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  rollos : any [] = []; //Variable que almacenará los difrentes rollos que se hicieron en la orden de trabajo
  arrayConductor =[];  /** Array que guardará los conductores en el select input */
  rollosInsertar : any [] = []; //Variable que va a amacenar los diferentes rollos que se van a insertar
  validarRollo : any [] = []; //Variable para validará que el rollo no esté en la tabla
  check : boolean = false; //Variable que nos a ayudar para saber si un rollo ya fue seleccionado
  rollosAsignados : any [] = []; //Variable que va a almacenar los rollos que fueron asignados a la factura creada
  Total : any = 0; //Variable que va a almacenar la cantidad total de kg de los rollos asignados
  grupoProductos : any [] = []; //Variable que guardará de manera descriminada a cada producto
  Productos = [];

  constructor(private frmBuilderPedExterno : FormBuilder,
                private rolService : RolesService,
                  @Inject(SESSION_STORAGE) private storage: WebStorageService,
                    private dtAsgProdFactura : DetallesAsignacionProductosFacturaService,
                      private rollosService : DetallesEntradaRollosService,
                        private servicioUsuarios : UsuarioService,
                          private facturaService : AsignacionProductosFacturaService,) {

    this.FormConsultarFactura = this.frmBuilderPedExterno.group({
      Fact_Id: ['', Validators.required],
      Cliente : [''],
      Conductor : ['', Validators.required],
      PlacaCamion : ['', Validators.required],
    });
  }

  ngOnInit() {
    this.fecha();
    this.lecturaStorage();
    this.ObtenerUsuariosConductores();
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = '$1,';
    return number.toString().replace(exp,rep);
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

  //Funcion que colocará la fecha actual
  fecha(){
    this.today = new Date();
    var dd : any = this.today.getDate();
    var mm : any = this.today.getMonth() + 1;
    var yyyy : any = this.today.getFullYear();
    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
    this.today = yyyy + '-' + mm + '-' + dd;
  }

  // Funcion para limpiar los campos de la vista
  limpiarCampos(){
    this.FormConsultarFactura.setValue({
      Fact_Id: '',
      Cliente : '',
      Conductor : '',
      PlacaCamion : '',
    });
    this.rollos = [];
    this.rollosInsertar = [];
    this.rollosAsignados = [];
    this.Productos = [];
    this.grupoProductos = [];
    this.cargando = true;
    this.Total = 0;
    // window.location.href = "./factura-rollos-productos";
  }

  //Funcion que a mostrar los usuarios de tipo conductor
  ObtenerUsuariosConductores() {
    this.servicioUsuarios.srvObtenerListaUsuario().subscribe(registrosUsuarios => {
      for (let index = 0; index < registrosUsuarios.length; index++) {
        this.servicioUsuarios.srvObtenerListaPorIdConductor(registrosUsuarios[index].usua_Id).subscribe(registrosConductores => {
          for (let ind = 0; ind < registrosConductores.length; ind++) {
            this.arrayConductor.push(registrosConductores[ind]);
          }
        });
      }
    });
  }

  //Funcion que traerá los diferentes rollos que se hicieron en la orden de trabajo
  consultarFactura(){
    this.rollos = [];
    let factura : string = this.FormConsultarFactura.value.Fact_Id;
    this.dtAsgProdFactura.srvObtenerListaPorCodigoFactura(factura.toUpperCase()).subscribe(datos_factura => {
      if (datos_factura.length == 0) Swal.fire(`¡La factura ${factura} no existe!`);
      for (let i = 0; i < datos_factura.length; i++) {
        if (datos_factura[i].estado_Id == 20 || datos_factura[i].estado_Id == 19) {
          let info : any = {
            Id : datos_factura[i].rollo_Id,
            IdProducto : datos_factura[i].prod_Id,
            Producto : datos_factura[i].prod_Nombre,
            Cantidad : datos_factura[i].dtAsigProdFV_Cantidad,
            Presentacion : datos_factura[i].undMed_Id,
          }
          this.rollos.push(info);
          this.FormConsultarFactura.setValue({
            Fact_Id: factura.toUpperCase(),
            Cliente : datos_factura[i].cli_Nombre,
            Conductor : this.FormConsultarFactura.value.Conductor,
            PlacaCamion : this.FormConsultarFactura.value.PlacaCamion,
          });
        }
      }
      setTimeout(() => {
        if (this.rollos.length == 0 && datos_factura.length != 0) Swal.fire(`¡Todos los rollos de la factura ${factura} fueron enviados!`);
      }, 500);
    });
  }

  //Funcion que va a agregar Productos en la tabla
  cargarProducto(item : any){
    if (this.rollosInsertar.length == 0) {
      let info : any = {
        Id : item.Id,
        IdProducto : item.IdProducto,
        Producto : item.Producto,
        Cantidad : item.Cantidad,
        Presentacion : item.Presentacion,
      }
      this.Total += item.Cantidad;
      this.rollosInsertar.push(info);
      this.validarRollo.push(item.Id);
    } else {
      if (!this.validarRollo.includes(item.Id)) {
        let info : any = {
          Id : item.Id,
          IdProducto : item.IdProducto,
          Producto : item.Producto,
          Cantidad : item.Cantidad,
          Presentacion : item.Presentacion,
        }
        this.Total += item.Cantidad;
        this.rollosInsertar.push(info);
        this.validarRollo.push(item.Id);
      } else if (this.validarRollo.includes(item.Id)) {
        for (let i = 0; i < this.rollosInsertar.length; i++) {
          if (this.rollosInsertar[i].Id == item.Id) this.rollosInsertar.splice(i,1);
        }
        for (let i = 0; i < this.validarRollo.length; i++) {
          if (this.validarRollo[i] == item.Id) this.validarRollo.splice(i,1);
        }
      }
    }
    for (let i = 0; i < this.rollos.length; i++) {
      if (this.rollos[i].Id == item.Id) this.rollos.splice(i,1);
    }
    setTimeout(() => { this.GrupoProductos(); }, 500);
  }

  // Funcion que va a seleccionar todo lo que hay en la tabla
  selccionarTodo(){
    for (const item of this.rollos) {
      let info : any = {
        Ot : item.Ot,
        Id : item.Id,
        IdCliente : item.IdCliente,
        Cliente : item.Cliente,
        IdProducto : item.IdProducto,
        Producto : item.Producto,
        Cantidad : item.Cantidad,
        Presentacion : item.Presentacion,
        Estatus : item.Estatus,
        Proceso : item.Proceso,
      }
      this.Total += item.Cantidad;
      this.rollosInsertar.push(info);
      this.validarRollo.push(item.Id);
      console.log(this.rollosInsertar)
    }
    setTimeout(() => { this.rollos = []; }, 100);
    setTimeout(() => { this.GrupoProductos(); }, 500);
  }

  // Funcion que se va a encargar de quitar rollos de la tabla inferior
  quitarRollo(item : any){
    let info : any = {
      Id : item.Id,
      IdProducto : item.IdProducto,
      Producto : item.Producto,
      Cantidad : item.Cantidad,
      Presentacion : item.Presentacion,
      checkbox : true,
    }
    this.Total -= item.Cantidad;
    this.rollos.push(info);
    for (let i = 0; i < this.rollosInsertar.length; i++) {
      if (this.rollosInsertar[i].Id == item.Id) this.rollosInsertar.splice(i,1);
    }
    for (let i = 0; i < this.validarRollo.length; i++) {
      if (this.validarRollo[i] == item.Id) this.validarRollo.splice(i,1);
    }
    setTimeout(() => { this.GrupoProductos(); }, 500);
  }

  // Funcion que va a quitar todo lo que hay en la tabla
  quitarTodo(){
    for (const item of this.rollosInsertar) {
      let info : any = {
        Ot : item.Ot,
        Id : item.Id,
        IdCliente : item.IdCliente,
        Cliente : item.Cliente,
        IdProducto : item.IdProducto,
        Producto : item.Producto,
        Cantidad : item.Cantidad,
        Presentacion : item.Presentacion,
        Estatus : item.Estatus,
        Proceso : item.Proceso,
        checkbox : true,
      }
      this.rollos.push(info);
      this.Total = 0;
    }
    setTimeout(() => {
      this.rollosInsertar = [];
      this.validarRollo = [];
    }, 100);
    setTimeout(() => { this.GrupoProductos(); }, 500);
  }

  // Funcion que permitirá ver el total de lo escogido para cada producto
  GrupoProductos(){
    let producto : any = [];
    this.grupoProductos = [];
    for (let i = 0; i < this.rollosInsertar.length; i++) {
      if (!producto.includes(this.rollosInsertar[i].IdProducto)) {
        let cantidad : number = 0;
        let cantRollo : number = 0;
        for (let j = 0; j < this.rollosInsertar.length; j++) {
          if (this.rollosInsertar[i].IdProducto == this.rollosInsertar[j].IdProducto) {
            cantidad += this.rollosInsertar[j].Cantidad;
            cantRollo += 1;
          }
        }
        producto.push(this.rollosInsertar[i].IdProducto);
        let info : any = {
          Id : this.rollosInsertar[i].IdProducto,
          Nombre : this.rollosInsertar[i].Producto,
          Cantidad : this.formatonumeros(cantidad.toFixed(2)),
          Rollos: this.formatonumeros(cantRollo.toFixed(2)),
          Presentacion : this.rollosInsertar[i].Presentacion,
        }
        this.grupoProductos.push(info);
      }
    }
  }

  // Funcion que agregará el condutor y la placa del camion en que irá el pedido
  actualizarFactura(){
    if (this.FormConsultarFactura.valid) {
      this.cargando = false;
      let factura : string = this.FormConsultarFactura.value.Fact_Id;
      let conductor : number = this.FormConsultarFactura.value.Conductor;
      let placa : string = this.FormConsultarFactura.value.PlacaCamion;
      this.facturaService.srvObtenerListaPorFactura(factura).subscribe(datos_factura => {
        for (let i = 0; i < datos_factura.length; i++) {
          let info : any = {
            FacturaVta_Id : datos_factura[i].facturaVta_Id,
            NotaCredito_Id : datos_factura[i].notaCredito_Id,
            Usua_Id : datos_factura[i].usua_Id,
            AsigProdFV_Fecha : datos_factura[i].asigProdFV_Fecha,
            AsigProdFV_Observacion : datos_factura[i].asigProdFV_Observacion,
            Cli_Id : datos_factura[i].cli_Id,
            Usua_Conductor : conductor,
            AsigProdFV_PlacaCamion : placa.toUpperCase(),
            AsigProdFV_FechaEnvio : this.today,
          }
          this.facturaService.srvActualizarFactura(factura, info).subscribe(datos_facturaActualizada => { this.cambiarEstado(); }, error => {
            const Toast = Swal.mixin({
              toast: true,
              position: 'center',
              showConfirmButton: false,
              timer: 2500,
              timerProgressBar: true,
              didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer)
                toast.addEventListener('mouseleave', Swal.resumeTimer)
              }
            });
            Toast.fire({
              icon: 'error',
              title: '¡Error al despachar los rollos!'
            });
            this.cargando = true;
          });
        }
      });
    } else Swal.fire("¡Hay campos vacios!");
  }

  // Funcion que cambiará el estado de los rollos a enviados
  cambiarEstado(){
    if (this.rollosInsertar.length != 0) {
      for (let i = 0; i < this.rollosInsertar.length; i++) {
        this.rollosService.srvObtenerVerificarRollo(this.rollosInsertar[i].Id).subscribe(datos_rollos => {
          for (let j = 0; j < datos_rollos.length; j++) {
            let info : any = {
              DtEntRolloProd_Codigo : datos_rollos[j].dtEntRolloProd_Codigo,
              EntRolloProd_Id : datos_rollos[j].entRolloProd_Id,
              Rollo_Id : datos_rollos[j].rollo_Id,
              DtEntRolloProd_Cantidad : datos_rollos[j].dtEntRolloProd_Cantidad,
              undMed_Rollo : datos_rollos[j].undMed_Rollo,
              Estado_Id : 21,
              dtEntRolloProd_OT : datos_rollos[j].dtEntRolloProd_OT,
              Prod_Id : datos_rollos[j].prod_Id,
              UndMed_Prod : datos_rollos[j].undMed_Prod,
              Prod_CantPaquetesRestantes : datos_rollos[j].prod_CantPaquetesRestantes,
              Prod_CantBolsasPaquete : datos_rollos[j].prod_CantBolsasPaquete,
              Prod_CantBolsasBulto : datos_rollos[j].prod_CantBolsasBulto,
              Prod_CantBolsasRestates : datos_rollos[j].prod_CantBolsasRestates,
              Prod_CantBolsasFacturadas : datos_rollos[j].prod_CantBolsasFacturadas,
            }
            this.Total += datos_rollos[j].dtEntRolloProd_Cantidad;
            this.rollosService.srvActualizar(datos_rollos[j].dtEntRolloProd_Codigo, info).subscribe(datos_rolloActuializado => {
              const Toast = Swal.mixin({
                toast: true,
                position: 'center',
                showConfirmButton: false,
                timer: 2500,
                timerProgressBar: true,
                didOpen: (toast) => {
                  toast.addEventListener('mouseenter', Swal.stopTimer)
                  toast.addEventListener('mouseleave', Swal.resumeTimer)
                }
              });
              Toast.fire({
                icon: 'success',
                title: '¡Factura confirmada, el/los Rollo(s) pasa a ser enviado!'
              });
            }, error => {
              const Toast = Swal.mixin({
                toast: true,
                position: 'center',
                showConfirmButton: false,
                timer: 2500,
                timerProgressBar: true,
                didOpen: (toast) => {
                  toast.addEventListener('mouseenter', Swal.stopTimer)
                  toast.addEventListener('mouseleave', Swal.resumeTimer)
                }
              });
              Toast.fire({
                icon: 'error',
                title: '¡Error al despachar los rollos!'
              });
              this.cargando = true;
            });
          }
        });
      }
      if (this.rollosInsertar.length > 100) {
        setTimeout(() => {
          this.cambiarEstadoRollosNoVerificados();
          this.buscarRolloPDF();
        }, 7000);
      } else if (this.rollosInsertar.length > 70) {
        setTimeout(() => {
          this.cambiarEstadoRollosNoVerificados();
          this.buscarRolloPDF();
        }, 6000);
      } else if (this.rollosInsertar.length > 50) {
        setTimeout(() => {
          this.cambiarEstadoRollosNoVerificados();
          this.buscarRolloPDF();
        }, 5000);
      } else if (this.rollosInsertar.length > 20) {
        setTimeout(() => {
          this.cambiarEstadoRollosNoVerificados();
          this.buscarRolloPDF();
        }, 4000);
      } else {
        setTimeout(() => {
          this.cambiarEstadoRollosNoVerificados();
          this.buscarRolloPDF();
        }, 3000);
      }
    } else Swal.fire("¡Debe cargar minimo un rollo en la tabla!");
  }

  // Funcion que cambiará el estado de los rollos a enviados
  cambiarEstadoRollosNoVerificados(){
    for (let i = 0; i < this.rollos.length; i++) {
      this.rollosService.srvObtenerVerificarRollo(this.rollos[i].Id).subscribe(datos_rollos => {
        for (let j = 0; j < datos_rollos.length; j++) {
          let info : any = {
              DtEntRolloProd_Codigo : datos_rollos[j].dtEntRolloProd_Codigo,
              EntRolloProd_Id : datos_rollos[j].entRolloProd_Id,
              Rollo_Id : datos_rollos[j].rollo_Id,
              DtEntRolloProd_Cantidad : datos_rollos[j].dtEntRolloProd_Cantidad,
              undMed_Rollo : datos_rollos[j].undMed_Rollo,
              Estado_Id : 19,
              dtEntRolloProd_OT : datos_rollos[j].dtEntRolloProd_OT,
              Prod_Id : datos_rollos[j].prod_Id,
              UndMed_Prod : datos_rollos[j].undMed_Prod,
              Prod_CantPaquetesRestantes : datos_rollos[j].prod_CantPaquetesRestantes,
              Prod_CantBolsasPaquete : datos_rollos[j].prod_CantBolsasPaquete,
              Prod_CantBolsasBulto : datos_rollos[j].prod_CantBolsasBulto,
              Prod_CantBolsasRestates : datos_rollos[j].prod_CantBolsasRestates,
              Prod_CantBolsasFacturadas : datos_rollos[j].prod_CantBolsasFacturadas,
          }
          this.rollosService.srvActualizar(datos_rollos[j].dtEntRolloProd_Codigo, info).subscribe(datos_rolloActuializado => {
            const Toast = Swal.mixin({
              toast: true,
              position: 'center',
              showConfirmButton: false,
              timer: 2500,
              timerProgressBar: true,
              didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer)
                toast.addEventListener('mouseleave', Swal.resumeTimer)
              }
            });
            Toast.fire({
              icon: 'success',
              title: '¡Factura confirmada, el/los Rollo(s) pasa a ser enviado!'
            });
          });
        }
      });
    }
  }

  // Funcion que creará un pdf a base de la informacion ingresada en las asignacion de rollos a facturas
  crearPDF(){
    let factura : string = this.FormConsultarFactura.value.Fact_Id;

    this.dtAsgProdFactura.srvObtenerListaParaPDF(factura.toUpperCase()).subscribe(datos_factura => {
      for (let i = 0; i < datos_factura.length; i++) {
        for (let j = 0; j < this.rollosAsignados.length; j++) {
          const pdfDefinicion : any = {
            info: {
              title: `${factura.toUpperCase()}`
            },
            pageSize: {
              width: 630,
              height: 760
            },
            content : [
              {
                text: `Rollos de la Factura ${factura.toUpperCase()}`,
                alignment: 'right',
                style: 'titulo',
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
                        text: `Fecha`
                      },
                      {
                        border: [false, false, false, true],
                        text: `${datos_factura[i].asigProdFV_Fecha.replace('T00:00:00', '')}`
                      },
                    ],
                    [
                      {
                        border: [false, false, false, false],
                        text: `Dirección`
                      },
                      {
                        border: [false, false, false, true],
                        text: `${datos_factura[i].empresa_Direccion}`
                      },
                      {
                        border: [false, false, false, false],
                        text: `Ciudad`
                      },
                      {
                        border: [false, false, false, true],
                        text: `${datos_factura[i].empresa_Ciudad}`
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
                text: `Facturado Por: ${datos_factura[i].nombreCreador}\n`,
                alignment: 'left',
                style: 'header',
              },
              '\n \n',
              {
                text: `\n Información detallada de la Factura \n \n`,
                alignment: 'center',
                style: 'header'
              },
              {
                style: 'tablaCliente',
                table: {
                  widths: ['*', '*'],
                  style: 'header',
                  body: [
                    [
                      `Código: ${factura.toUpperCase()}`,
                      `Nota Credito: ${datos_factura[i].notaCredito_Id}`
                    ],
                    [
                      `Id Cliente: ${datos_factura[i].cli_Id}`,
                      `Nombre Cliente: ${datos_factura[i].cli_Nombre}`
                    ],
                    [
                      `Conductor: ${datos_factura[i].nombreConductor}`,
                      `Placa Camión: ${datos_factura[i].asigProdFV_PlacaCamion}`
                    ]
                  ]
                },
                layout: 'lightHorizontalLines',
                fontSize: 9,
              },
              {
                text: `\n\n Consolidado de producto(s) \n `,
                alignment: 'center',
                style: 'header'
              },
              this.table2(this.Productos, ['Producto', 'Nombre', 'Cantidad', 'Presentacion']),
              {
                text: `\n\n Información detallada de producto(s) pedido(s) \n `,
                alignment: 'center',
                style: 'header'
              },

              this.table(this.rollosAsignados, ['Rollo', 'Producto', 'Nombre', 'Cantidad', 'Presentacion']),
              {
                text: `\nCant. Total: ${this.formatonumeros(this.Total.toFixed(2))}\n`,
                alignment: 'right',
                style: 'header',
              },
              {
                text: `\n \nObervación sobre el pedido: \n ${datos_factura[i].asigProdFV_Observacion}\n`,
                style: 'header',
              }
            ],
            styles: {
              header: {
                fontSize: 10,
                bold: true
              },
              titulo: {
                fontSize: 20,
                bold: true
              }
            }
          }
          const pdf = pdfMake.createPdf(pdfDefinicion);
          pdf.open();
          this.limpiarCampos();
          break;
        }
        break;
      }
    });
  }

  // Funcion que traerá los rollos que fueron asignados a la factura creada
  buscarRolloPDF(){
    this.Total = 0;
    this.Productos = [];
    this.rollosAsignados = [];
    let factura : string = this.FormConsultarFactura.value.Fact_Id;
    this.dtAsgProdFactura.srvObtenerListaParaPDF(factura.toUpperCase()).subscribe(datos_factura => {
      for (let i = 0; i < datos_factura.length; i++) {
        let info : any = {
          Rollo : datos_factura[i].rollo_Id,
          Producto : datos_factura[i].prod_Id,
          Nombre : datos_factura[i].prod_Nombre,
          Cantidad : this.formatonumeros(datos_factura[i].dtAsigProdFV_Cantidad),
          Presentacion : datos_factura[i].undMed_Id,
        }
        this.rollosAsignados.push(info);
      }
    });

    this.dtAsgProdFactura.srvObtenerListaParaPDF2(factura.toUpperCase()).subscribe(datos_factura => {
      for (let i = 0; i < datos_factura.length; i++) {
        let info : any = {
          Producto : datos_factura[i].prod_Id,
          Nombre : datos_factura[i].prod_Nombre,
          Cantidad : this.formatonumeros(datos_factura[i].suma),
          Presentacion : datos_factura[i].undMed_Id,
        }
        this.Productos.push(info);
        this.Total += datos_factura[i].suma;
      }
    });
    setTimeout(() => { this.crearPDF(); }, 1200);
  }

  // funcion que se encagará de llenar la tabla de los productos en el pdf
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

  // Funcion que genera la tabla donde se mostrará la información de los productos pedidos
  table(data, columns) {
    return {
        table: {
          headerRows: 1,
          widths: [60, 60, 250, 70, 70],
          body: this.buildTableBody(data, columns),
        },
        fontSize: 7,
        layout: {
          fillColor: function (rowIndex, node, columnIndex) {
            return (rowIndex == 0) ? '#CCCCCC' : null;
          }
        }
    };
  }

  // Funcion que genera la tabla donde se mostrará la información de los productos pedidos
  table2(data, columns) {
    return {
        table: {
          headerRows: 1,
          widths: [60, 270, 100, 90],
          body: this.buildTableBody(data, columns),
        },
        fontSize: 7,
        layout: {
          fillColor: function (rowIndex, node, columnIndex) {
            return (rowIndex == 0) ? '#CCCCCC' : null;
          }
        }
    };
  }

}
