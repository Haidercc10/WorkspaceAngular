import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { AppComponent } from 'src/app/app.component';
import { ArchivosService } from 'src/app/Servicios/Archivos/Archivos.service';
import { Categorias_ArchivosService } from 'src/app/Servicios/CategoriasArchivos/Categorias_Archivos.service';
import { RolesService } from 'src/app/Servicios/Roles/roles.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-Archivos',
  templateUrl: './Archivos.component.html',
  styleUrls: ['./Archivos.component.css']
})
export class ArchivosComponent implements OnInit {

  public formularioArchivo !: FormGroup;
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number = null; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  today : any = moment().format('YYYY-MM-DD') //Variable que se usará para llenar la fecha actual
  ArrayArchivos : any [] = []; //Variable que almacenará los archivos que vienen de la base de datos
  categoriasArchivos : any [] = []; //Variable para almacenar las categorias de archivos que hay
  selectedFile: File = null;
  nombreCarpeta : string = 'D:\\Calidad\\'; //Variable que almacenará el nombre de las carpetas a las cuales se entra
  ruta : string; //Variable que almacenará el nombre de las carpetas que se estan vistando
  mover : boolean = false; //Variable que va a validar si se está moviendo un archivo o no
  copiar : boolean = false; //Variable que va a validar si se esta copiando un archivo
  rutaInicial : string; //Variable que va a almacenar la ruta inicial desde la cual se va a mover o copiar el archivo
  nombreArchivo : string; //Variable que va a almacenar el nombre del archivo que se quiere mover o copiar
  validarArchivo_Carpeta : boolean;
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro

  constructor(private frmBuilder : FormBuilder,
                private AppComponent : AppComponent,
                  private archivosService : ArchivosService,
                    private categoriaArchivosService : Categorias_ArchivosService) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
    this.formularioArchivo = this.frmBuilder.group({
      catImagen : ['', Validators.required],
      carpetaNueva : ['', Validators.required],
      CategoriaArchivos : ['', Validators.required],
    });
  }

  ngOnInit() {
    this.lecturaStorage();
    this.mostrarCarpetas();
    this.obtenerCategorias();
    this.cargarArchivos();
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  //Funcion que traerá las categorias existentes
  obtenerCategorias(){
    this.categoriasArchivos = [];
    this.categoriaArchivosService.srvObtenerLista().subscribe(datos_categorias => { this.categoriasArchivos = datos_categorias; });
  }

  //Funcion que limpiará todos los campos
  limpiarCampos(){
    this.formularioArchivo.reset();
    this.selectedFile = null;
    this.ArrayArchivos = [];
    this.ngOnInit();
  }

  //Funcion que mostrará los archivos que estan sobre la carpeta seleccionada
  cargarArchivos(ruta : string = this.AppComponent.rutaCarpetaArchivos){
    this.ArrayArchivos = [];
    this.archivosService.mostrarArchivos(ruta).subscribe(datos_archivos => {
      for (let i = 0; i < datos_archivos.length; i++) {
        let nombreArchivos : string = datos_archivos[i].replace(`${ruta}\\`,'');
        if (nombreArchivos.indexOf("~$") == -1) {
          let archivos : any = {
            archivoCarpeta : 'archivo',
            nombre : nombreArchivos,
            ruta : datos_archivos[i],
          }
          this.ArrayArchivos.push(archivos);
          this.ArrayArchivos.sort((a,b) => a.nombre.localeCompare(b.nombre));
        } else continue;
      }
    });
  }

  // Funcion que mostrará todas las subcarpetas
  mostrarCarpetas(ruta : string = this.AppComponent.rutaCarpetaArchivos){
    this.ArrayArchivos = [];
    this.nombreCarpeta = ruta;
    this.ruta = ruta.replace(`D:\\Calidad\\`, 'Calidad\\');
    this.archivosService.mostrarCarpetas(ruta).subscribe(datos_archivos => {
      for (let i = 0; i < datos_archivos.length; i++) {
        let nombreArchivos : string = datos_archivos[i].replace(`${ruta}`,'');
        nombreArchivos = nombreArchivos.replace('\\', '');
        let archivos : any = {
          archivoCarpeta : 'carpeta',
          nombre : nombreArchivos,
          ruta : datos_archivos[i],
        }
        this.ArrayArchivos.push(archivos);
        this.ArrayArchivos.sort((a,b) => a.nombre.localeCompare(b.nombre));
      }
    });
  }

  //Funcion que creará una carpeta en el servidor donde se almacenan los archivos
  crearCarpeta(){
    let nombresArchivosCarpetas : any = [];
    let nombreCarpeta : any = this.formularioArchivo.value.carpetaNueva;
    if (nombreCarpeta == '') Swal.fire("¡No se ha escrito un nombre para la carpeta!");
    else {
      for (let i = 0; i < this.ArrayArchivos.length; i++) {
        nombresArchivosCarpetas.push(this.ArrayArchivos[i].nombre);
      }
      if (nombresArchivosCarpetas.includes(`${nombreCarpeta}`)) Swal.fire("¡Ya existe una archivo o carpeta con este nombre!");
      else {
        this.nombreCarpeta = `${this.nombreCarpeta}\\${nombreCarpeta}`
        let ruta : string = this.nombreCarpeta;
        this.ruta = ruta.replace(`D:\\Calidad\\`, '');
        this.archivosService.crearCarpetas(ruta).subscribe(datos_archivo => {
          this.cargarArchivos(this.nombreCarpeta);
          this.mostrarCarpetas(this.nombreCarpeta);
          const Toast = Swal.mixin({
            toast: true,
            position: 'center',
            showConfirmButton: false,
            timer: 2200,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.addEventListener('mouseenter', Swal.stopTimer)
              toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
          });
          Toast.fire({
            icon: 'success',
            title: '¡La carpeta se ha creado con exito!'
          });
        });
      }
    }
  }

  // Funcion que toma el archivo que se subió
  onSelectFile(fileInput: any) {
    this.selectedFile = <File>fileInput.target.files[0];
  }

  //Funcion que y le pasará el archivo que se cargó y llamará a la funcion que enviará la informacion al servidor para guardar el archivo en su disco local y guardar la informacion en la base de datos
  subirArchivos(){
    let categoria = this.formularioArchivo.value.CategoriaArchivos;
    let filePath : string = this.nombreCarpeta;
    const formData = new FormData();
    formData.append('archivo', this.selectedFile);
    this.archivosService.srvGuardar(formData, this.today, categoria, this.storage_Id, filePath).subscribe(datos_archivo => {
      const Toast = Swal.mixin({
        toast: true,
        position: 'center',
        showConfirmButton: false,
        timer: 2200,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
      });
      Toast.fire({
        icon: 'success',
        title: '¡El archivo se ha guardado con exito!'
      });
      this.cargarArchivos(filePath);
      this.mostrarCarpetas(filePath);
    });
  }

  //Funcion que regresará de una en una todas las carpetas abiertas
  regresarCarpetaAnterior(){
    let ultimaRuta : any = `${this.nombreCarpeta.lastIndexOf("\\")}`;
    this.nombreCarpeta = this.nombreCarpeta.substring(0, ultimaRuta);
    if (this.nombreCarpeta != "D:\\Calidad\\" && this.nombreCarpeta != "" && this.nombreCarpeta != "D:\\" && this.nombreCarpeta != "D:" && this.nombreCarpeta != "D") {
      this.cargarArchivos(this.nombreCarpeta);
      this.mostrarCarpetas(this.nombreCarpeta);
    } else this.nombreCarpeta = "D:\\Calidad\\";
  }

  // Funcion que servirá para abrir carpetas
  abrirCarpeta(nombreCarpeta : string){
    this.nombreCarpeta = `${this.nombreCarpeta}\\${nombreCarpeta}`;
    this.ArrayArchivos = [];
    this.mostrarCarpetas(this.nombreCarpeta);
    this.cargarArchivos(this.nombreCarpeta);
  }

  /* Funcion que se encargará de pedir el nombre del archivo que se quiere descargar, luego de enviar este nombre a la otra funcion
  que se encargará de hacer la peticion al servidor y responderá con un dato blob, este dato se tomará en esta funcion nuevamente y creará  un elemento de tipo a
  que luego se encargará de realizar la descarga, luego de descargar el archivo este elemento se eliminará */
  descargarArchivos(nombre : string){
    this.archivosService.descargarArchivos(nombre, this.nombreCarpeta + "\\").subscribe( data => {
      const downloadedFile = new Blob([data.body!], { type: data.body! });
      const a = document.createElement('a');
      document.body.appendChild(a);
      a.download = nombre;
      a.href = URL.createObjectURL(downloadedFile);
      a.target = '_blank';
      a.click();
      document.body.removeChild(a);
      const Toast = Swal.mixin({
        toast: true,
        position: 'center',
        showConfirmButton: false,
        timer: 2200,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
      });
      Toast.fire({
        icon: 'success',
        title: '¡El archivo se ha descargado con exito!'
      });
    });
  }

  // Funcion que permitirá eliminar un archivo
  eliminarArchivo(ruta : string, index : any){
    Swal.fire({
      title: '¿Está seguro de eliminar este Archivo/Carpeta?',
      showDenyButton : true,
      confirmButtonText: 'Eliminar',
      denyButtonText: `No Eliminar`,
    }).then((result) => {
      if (result.isConfirmed) {
        this.archivosService.eliminarArchivos(ruta).subscribe(datos_archivos => {
          this.ArrayArchivos.splice(index, 1);
          Swal.fire("¡Archivo Eliminado!");
        });
      }
    });
  }

  //
  eliminarCarpetas(ruta : string, index : any){
    Swal.fire({
      title: '¿Está seguro de eliminar este Archivo/Carpeta?',
      showDenyButton : true,
      confirmButtonText: 'Eliminar',
      denyButtonText: `No Eliminar`,
    }).then((result) => {
      if (result.isConfirmed) {
        this.archivosService.eliminarCarpetas(ruta).subscribe(datos_archivos => {
          this.ArrayArchivos.splice(index, 1);
          Swal.fire("¡Carpeta Eliminada!");
        });
      }
    });
  }

  /*Funcion inicial que se encargará de validar si la funcion que se esta haciendo es una copia o un movimiento de un archivo,
  ademas de darle valor a la variable que declara el la ruta incial y la que declara el nombre del archivo o carpeta*/
  moverArchivoCarpeta(accion : number, ruta, nombre : string, validador : number){
    if (accion == 1) {
      Swal.fire({
        title: '¿Está seguro de copiar este Archivo/Carpeta?',
        showDenyButton : true,
        confirmButtonText: 'Copiar',
        denyButtonText: `No Copiar`,
      }).then((result) => {
        if (result.isConfirmed) {
          this.copiar = true;
          this.rutaInicial = ruta;
          this.nombreArchivo = nombre;
          if (validador == 1) this.validarArchivo_Carpeta = true;
          else this.validarArchivo_Carpeta = false;
        }
      });
    } else if (accion == 2){
      Swal.fire({
        title: '¿Está seguro de mover este Archivo/Carpeta?',
        showDenyButton : true,
        confirmButtonText: 'Mover',
        denyButtonText: `No Mover`,
      }).then((result) => {
        if (result.isConfirmed) {
          this.mover = true;
          this.rutaInicial = ruta;
          this.nombreArchivo = nombre;
          if (validador == 1) this.validarArchivo_Carpeta = true;
          else this.validarArchivo_Carpeta = false;
        }
      });
    }
  }

  /*Variable que se encargará de validar una vez mas el proceso que se va a realizar, una copia o un movimiento,
  luego validará si es un archivo o carpeta y dependiendo de eso llamará a una funcion u otra*/
  pegarArchivoCarpeta(){
    if (this.copiar) {
      if (this.validarArchivo_Carpeta) this.copiarArchivo();
      else this.copiarCarpetas();
    } else if (this.mover) {
      if (this.validarArchivo_Carpeta) this.moverCarpeta();
      else this.moverArchivo();
    }
  }

  //Funcion que calcelará el copiado y movimiento de un archivo o una carpeta
  cancelarPegadoArchivoCarpeta(){
    this.copiar = false;
    this.mover = false;
  }

  /* Funcion que va a encargarse de mover archivos de una ruta a otra, luego de moverlo lo cargará */
  moverArchivo(){
    this.archivosService.moverArchivo(this.rutaInicial, `${this.nombreCarpeta}\\${this.nombreArchivo}`).subscribe(datos_archivos => {
      setTimeout(() => {
        this.ArrayArchivos = [];
        this.mover = false;
        this.cargarArchivos(this.nombreCarpeta);
        this.mostrarCarpetas(this.nombreCarpeta);
      }, 100);
    });
  }

  // Funcion que va a encargarse de mover carpetas de una ruta a otra, luego de moverlo lo cargará
  moverCarpeta(){
    this.archivosService.moverCarpeta(this.rutaInicial, `${this.nombreCarpeta}\\${this.nombreArchivo}`).subscribe(datos_archivos => {
      setTimeout(() => {
        this.ArrayArchivos = [];
        this.mover = false;
        this.cargarArchivos(this.nombreCarpeta);
        this.mostrarCarpetas(this.nombreCarpeta);
      }, 500);
    });
  }

  //Funcion que va a encargarse de enviar al api la peticion de copiar un archivo, luego de copiarlo lo cargará
  copiarArchivo(){
    this.archivosService.copiarArchivo(`${this.rutaInicial}`, `${this.nombreCarpeta}\\${this.nombreArchivo}`).subscribe(datos_archivos => {
      this.ArrayArchivos = [];
      this.copiar = false;
      this.cargarArchivos(this.nombreCarpeta);
      this.mostrarCarpetas(this.nombreCarpeta);
    });
  }

  // Funcion que va a encargarse de enviar al api la peticion de copiar una carpeta, luego de copiarlo lo cargará
  copiarCarpetas(){
    let lengthCarpeta : any = this.rutaInicial.length;
    let Carpeta : any = this.rutaInicial.lastIndexOf("\\");
    let nombreCarpeta : string = this.rutaInicial.substring(Carpeta + 1, lengthCarpeta);
    this.archivosService.crearCarpetas(`${this.nombreCarpeta}\\${nombreCarpeta}`).subscribe(datos_archivo => {
      this.archivosService.copiarCarpeta(`${this.rutaInicial}`, `${this.nombreCarpeta}\\${nombreCarpeta}`).subscribe(datos_archivos => {
        this.ArrayArchivos = [];
        this.copiar = false;
        this.cargarArchivos(this.nombreCarpeta);
        this.mostrarCarpetas(this.nombreCarpeta);
      });
    });
  }
}
