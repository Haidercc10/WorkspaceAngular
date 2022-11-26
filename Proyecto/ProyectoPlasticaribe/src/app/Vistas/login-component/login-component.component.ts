import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsuarioService } from 'src/app/Servicios/usuario.service';
import { EmpresaService } from 'src/app/Servicios/empresa.service';
import Swal from 'sweetalert2';
import { CookieService } from 'ngx-cookie-service';
import {SESSION_STORAGE, WebStorageService} from 'ngx-webstorage-service';
import {rutaPlasticaribeAPI} from 'src/polyfills'
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-Vista-login-component',
  templateUrl: './login-component.component.html',
  styleUrls: ['./login-component.component.css']
})

export class LoginComponentComponent implements OnInit {

  public formularioUsuario !: FormGroup;
  public data:any=[];
  ruta : any;

  /* SE INSTANCIA LA VARIABLE "empresas" QUE VA A SER DE TIPO "EmpresaService" Y TAMBIEN SERÁ UN ARRAY
  AQUÍ SE GUARDARÁN LOS NOMBRES DE LAS EMPRESAS QUE HAY EN LA BASE DE DATOS */
  empresas:EmpresaService[]=[];
  empresa=[];

  constructor(private usuarioServices : UsuarioService,
                private empresaServices : EmpresaService,
                  private frmBuilderUsuario : FormBuilder,
                    private cookieServices : CookieService,
                      @Inject(SESSION_STORAGE) private storage: WebStorageService) {

    this.formularioUsuario = this.frmBuilderUsuario.group({
      Identificacion: [, Validators.required],
      Contrasena: [, Validators.required],
      Empresa: [, Validators.required],
    });
  }

  ngOnInit(): void {
    this.ruta = this.storage.get('Ruta');
    this.storage.clear();
    this.saveInLocal('Ruta', this.ruta);
    this.cargaDatosComboBox();
  }

  saveInLocal(key, val): void {
    this.storage.set(key, val);
    this.data[key]= this.storage.get(key);
  }

  // FUNCION PARA CARGAR LOS DATOS DE LAS EMPRESAS EN EL COMBOBOX DEL HTML
  cargaDatosComboBox(){
    this.empresaServices.srvObtenerLista().subscribe(datos_empresa=>{
      for (let index = 0; index < datos_empresa.length; index++) {
        /* LA SIGUIENTE LINEA DE CODIGO HARÁ QUE SE CONSULTEN LOS DATOS DE LAS EMPRESAS PARA FINALMENTE SOLO GUARDAR EL NOMBRE DE LA EMPRESA
        EN LA VARIABLE "empresas" Y ESTA VARIABLE SE LE PASARÁ EN EL HTML AL COMBOBOX QUE MOSTRARÁ LAS EMPRESAS */
        this.empresas.push(datos_empresa[index].empresa_Nombre);
      }
    }, error =>{ Swal.fire('Ocurrió un error, intentelo de nuevo'); });
  }

  // FUNCION PARA HACER VALIDACIONES DE CAMPOS VACIOS, QUE DADO ESTE CASO (EN EL QUE HAYAN CAMPOS VACIOS) SE MOSTRARÁ UN MENSAJE INFOMANDO DE ESTO.
  // SI NO HAY CAMPOS VACIOS ENTRARÍA A EL METODO Consulta()
  validarCamposVacios() : any{
    if(this.formularioUsuario.valid) this.Consulta();
    else {
      Swal.fire({
        icon: 'warning',
        title: 'Oops...',
        html:
        `<b>¡Hay Campos Vacios!</b><hr> `,
      });
    }
  }

  // FUNCION PARA LIMPIAR LOS CAMPOS DEL FORMULARIO.
  clear(){ this.formularioUsuario.reset(); }

  // FUNCION PARA HACER LA VALIDACION DE LA ENTRADA DE USUARIOS, SE VERIFICAN LOS CAMPOS DIGITADOS CON LA BASE DE DATOS.
  Consulta(){
    try {
      let empresa : string = this.formularioUsuario.value.Empresa;
      this.saveInLocal('BD', 1);

      this.usuarioServices.srvObtenerListaPorId(this.formularioUsuario.value.Identificacion).subscribe(datos_usuarios=>{
        this.empresaServices.srvObtenerLista().subscribe(datos_empresa => {
          for (let index = 0; index < datos_empresa.length; index++) {
            if (datos_empresa[index].empresa_Nombre == empresa) {
              if (this.formularioUsuario.value.Contrasena == datos_usuarios.usua_Contrasena && datos_usuarios.empresa_Id == datos_empresa[index].empresa_Id) {
                let idUsuario : number = datos_usuarios.usua_Id;
                let nombre: string = datos_usuarios.usua_Nombre;
                let rol: number = datos_usuarios.rolUsu_Id;
                // var medianoche = new Date();
                // medianoche.setHours(23,59,59,0);
                // console.log(medianoche);
                // this.cookieServices.set('Id', `${idUsuario}`, {expires: medianoche} );
                // this.cookieServices.set('Nombre', `${nombre}`, {expires: medianoche} );
                // this.cookieServices.set('Rol', `${rol}`, {expires: medianoche});

                this.saveInLocal('Id', idUsuario);
                this.saveInLocal('Nombre', nombre);
                this.saveInLocal('Rol', rol);
                this.clear();
                if (this.ruta == 'http://192.168.0.153:4600/Login'
                    || this.ruta == 'http://192.168.0.153:4600'
                    || this.ruta == 'http://192.168.0.153:4600/'
                    || this.ruta == 'http://192.168.0.85:4700/Login'
                    || this.ruta == 'http://192.168.0.85:4700'
                    || this.ruta == 'http://192.168.0.85:4700/'
                    || this.ruta == 'http://localhost:4200/Login'
                    || this.ruta == 'http://localhost:4200'
                    || this.ruta == 'http://localhost:4200/') window.location.href = "./home";
                else window.location.href = this.ruta;
                break;
              } else if (this.formularioUsuario.value.Identificacion == datos_usuarios.usua_Id && this.formularioUsuario.value.Contrasena != datos_usuarios.usua_Contrasena){
                Swal.fire({
                  icon: 'warning',
                  title: 'Oops...',
                  html:
                  `<b>¡EL número de identificacion no coincide con la contraseña!</b><hr> `,
                });
                break;
              }
              else{
                Swal.fire({
                  icon: 'warning',
                  title: 'Oops...',
                  html:
                  `<b>¡El número de identificación ${this.formularioUsuario.value.Identificacion} no se encuentra asociado a la empresa ${empresa}!</b><hr> `,
                });
                break;
              }
            }
          }
        });
      }, error =>{
        Swal.fire({
          icon: 'warning',
          title: 'Oops...',
          html:
          `<b>¡El número de identificación no se encuentra registrado!</b><hr> `,
        });
      });
    } catch (error) {
      console.log(error);
    }
  }

  consulta_insercionAsistencia(){
    if (!true){
      Swal.fire({
        icon: 'error',
        title: 'Asistencia Registrada!',
        text: 'La asistencia de la persona X el día Y ha sido registrado con éxito!'
      })
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'No se ha podido registrar su asistencia!'
      })
    }
  }
}
