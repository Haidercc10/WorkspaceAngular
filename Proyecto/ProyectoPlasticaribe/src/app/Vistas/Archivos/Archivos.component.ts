import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShepherdService } from 'angular-shepherd';
import { File } from 'buffer';
import moment from 'moment';
import { MessageService } from 'primeng/api';
import { ArchivosService } from 'src/app/Servicios/Archivos/Archivos.service';
import { Categorias_ArchivosService } from 'src/app/Servicios/CategoriasArchivos/Categorias_Archivos.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { AppComponent } from 'src/app/app.component';
import { defaultStepOptions, stepsArchivos as defaultSteps } from 'src/app/data';

@Component({
  selector: 'app-Archivos',
  templateUrl: './Archivos.component.html',
  styleUrls: ['./Archivos.component.css']
})

export class ArchivosComponent implements OnInit {

  public formularioArchivo !: FormGroup;
  modoInvitado : boolean = true;
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number = null; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  today : any = moment().format('YYYY-MM-DD') //Variable que se usará para llenar la fecha actual
  ArrayArchivos : any [] = []; //Variable que almacenará los archivos que vienen de la base de datos
  categoriasArchivos : any [] = []; //Variable para almacenar las categorias de archivos que hay
  selectedFile: any;
  nombreCarpeta : string = 'D:\\Calidad'; //Variable que almacenará el nombre de las carpetas a las cuales se entra
  ruta : string; //Variable que almacenará el nombre de las carpetas que se estan vistando
  mover : boolean = false; //Variable que va a validar si se está moviendo un archivo o no
  copiar : boolean = false; //Variable que va a validar si se esta copiando un archivo
  rutaInicial : string; //Variable que va a almacenar la ruta inicial desde la cual se va a mover o copiar el archivo
  nombreArchivo : string = ''; //Variable que va a almacenar el nombre del archivo que se quiere mover o copiar
  validarArchivo_Carpeta : boolean;
  descargandoArchivo : boolean = false; //Variable que va a validar si el si se está descargando un archivo o carpeta
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  modal : boolean = false; /** Variable que servirá para abrir el modal de crear categorias */
  clave : string = ''; /** Palabra clave para mostrar mensajes de elección de eliminación de archivos y carpetas */
  fileSeleccionado : any; /** Archivo/Carpeta seleccionado para ser eliminado */
  rutaSeleccionada : any; /** Ruta del Archivo/Carpeta seleccionado para ser eliminado */
  accionMoverCopiar : number;
  value: number = 0;

  constructor(private frmBuilder : FormBuilder,
                private AppComponent : AppComponent,
                  private archivosService : ArchivosService,
                    private categoriaArchivosService : Categorias_ArchivosService,
                      private mensajeService : MensajesAplicacionService,
                        private messageService : MessageService,
                          private shepherdService: ShepherdService) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;

    !localStorage.getItem('user') ? this.modoInvitado = false : this.modoInvitado = true;
    
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

  // Funcion que va a hacer que se inicie el tutorial in-app
  tutorial(){
    this.shepherdService.defaultStepOptions = defaultStepOptions;
    this.shepherdService.modal = true;
    this.shepherdService.confirmCancel = false;
    this.shepherdService.addSteps(defaultSteps);
    this.shepherdService.start();
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  //Funcion que traerá las categorias existentes
  obtenerCategorias = () => this.categoriaArchivosService.srvObtenerLista().subscribe(datos_categorias => this.categoriasArchivos = datos_categorias);

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
          this.ArrayArchivos.push({
            archivoCarpeta : 'archivo',
            nombre : nombreArchivos,
            ruta : datos_archivos[i],
          });
        }
        this.ArrayArchivos.sort((a,b) => a.nombre.localeCompare(b.nombre));
      }
    });
  }

  // Funcion que mostrará todas las subcarpetas
  mostrarCarpetas(ruta : string = this.AppComponent.rutaCarpetaArchivos){
    this.ArrayArchivos = [];
    this.nombreCarpeta = ruta;
    this.ruta = ruta.replace(`D:\\Calidad`, 'Calidad');
    this.archivosService.mostrarCarpetas(ruta).subscribe(datos_archivos => {
      for (let i = 0; i < datos_archivos.length; i++) {
        this.ArrayArchivos.push({
          archivoCarpeta : 'carpeta',
          nombre : datos_archivos[i].replace(`${ruta}`,'').replace('\\', ''),
          ruta : datos_archivos[i],
        });
      }
      this.ArrayArchivos.sort((a,b) => a.nombre.localeCompare(b.nombre));
    });
  }

  //Funcion que creará una carpeta en el servidor donde se almacenan los archivos
  crearCarpeta(){
    let nombresArchivosCarpetas : any = [];
    let nombreCarpeta : any = this.formularioArchivo.value.carpetaNueva;
    if (nombreCarpeta == '') this.mensajeService.mensajeAdvertencia(`Advertencia`, `Debe diligenciar el campo nombre de carpeta`);
    else {
      this.ArrayArchivos.forEach(data => nombresArchivosCarpetas.push(data.nombre));
      if (nombresArchivosCarpetas.includes(`${nombreCarpeta}`)) this.mensajeService.mensajeAdvertencia(`Advertencia`, `Ya existe una archivo o carpeta con este nombre, debe cambiarlo!`);
      else {
        this.nombreCarpeta = `${this.nombreCarpeta}\\${nombreCarpeta}`
        this.ruta = this.nombreCarpeta.replace(`D:\\Calidad\\`, '');
        this.archivosService.crearCarpetas(this.nombreCarpeta).subscribe(() => {
          this.mensajeService.mensajeConfirmacion(`Confirmación`, `La carpeta ha sido creada exitosamente!`);
          this.cargarArchivos(this.nombreCarpeta);
          this.mostrarCarpetas(this.nombreCarpeta);
          this.formularioArchivo.reset();
        });
      }
    }
  }

  // Funcion que toma el archivo que se subió
  onSelectFile = (event: any) => this.selectedFile = <File>event.currentFiles;

  //Funcion que y le pasará el archivo que se cargó y llamará a la funcion que enviará la informacion al servidor para guardar el archivo en su disco local y guardar la informacion en la base de datos
  async subirArchivos(){
    let filePath : string = this.nombreCarpeta;
    for (let i = 0; i < this.selectedFile.length; i++) {
      const formData = new FormData();
      formData.append('archivo', this.selectedFile[i]);
      try {
        this.cargarArchivos(filePath);
        this.mostrarCarpetas(filePath);
        this.mensajeService.mensajeConfirmacion(`¡Se subió el archivo seleccionado!`, `¡Se ha subido un archivo correcatamente!`);
      } catch (error) {
        this.mensajeService.mensajeError(`Error`, `¡Ha ocurrido un error al intentar subir el archivo!`);
      }
    }
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
   * que se encargará de hacer la peticion al servidor y responderá con un dato blob, este dato se tomará en esta funcion nuevamente y creará  un elemento de tipo a
   * que luego se encargará de realizar la descarga, luego de descargar el archivo este elemento se eliminará
  */
  descargarArchivos(nombre : string, descargaCarpeta : boolean = false, carpeta : string = this.nombreCarpeta){
    this.nombreArchivo = nombre;
    this.archivosService.descargarArchivos(nombre, carpeta + "\\").subscribe(data => {
      this.descargandoArchivo = true;
      const downloadedFile = new Blob([data.body!], { type: data.body! });
      if (downloadedFile.type != ''){
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.download = nombre;
        a.href = URL.createObjectURL(downloadedFile);
        a.target = '_blank';
        a.click();
        document.body.removeChild(a);
        setTimeout(() => {
          if (descargaCarpeta == true) this.archivosService.eliminarArchivos(`${carpeta}\\${nombre}`).subscribe();
          this.descargandoArchivo = false;
          this.nombreArchivo = '';
          this.mensajeService.mensajeConfirmacion(`¡Descarga Completada!`);
        }, 2000);
      }
    });
  }

  // Funcion que va a descargar una carpeta
  descargarCarpetas(nombre : string = this.nombreCarpeta){
    let ultimaRuta : any = `${nombre.lastIndexOf("\\")}`;
    let carpeta : any = nombre.substring(ultimaRuta, nombre.length + 1);
    carpeta = carpeta.replace('\\', '');
    this.nombreArchivo = carpeta;
    this.descargandoArchivo = true;    
    this.archivosService.descargarCarpetas(carpeta, nombre).subscribe(data => {
      if (data.type != 0) this.descargarArchivos(`${carpeta}.zip`, true, nombre.substring(0, ultimaRuta));
    });
  }

  /** Función que mostrará el mensaje de elección para eliminación de archivos ó carpetas */
  mostrarEleccion1(ruta : string, index : number,  opcion : string) {
    this.clave = opcion;
    setTimeout(() => {
      if(this.clave == 'd-archivo') {
        this.rutaSeleccionada = ruta;
        this.fileSeleccionado = index;
        this.messageService.add({severity:'warn', key: this.clave, summary:'Elección', detail: `Está seguro que quiere eliminar definitivamente el archivo/carpeta?`, sticky: true});
      }
      if(this.clave == 'd-carpeta') {
        this.rutaSeleccionada = ruta;
        this.fileSeleccionado = index;
        this.messageService.add({severity:'warn', key: this.clave, summary:'Elección', detail: `Está seguro que desea eliminar la carpeta/archivo?`, sticky: true});
      }
    }, 200);
  }

  /** Función para quitar mensaje de elección */
  onReject = () => this.messageService.clear(this.clave);

  // Funcion que permitirá eliminar un archivo
  eliminarArchivo(ruta : string, index : any){
    ruta = this.rutaSeleccionada;
    index = this.fileSeleccionado;
    this.onReject();
    this.archivosService.eliminarArchivos(ruta).subscribe(() => {
      this.ArrayArchivos.splice(this.ArrayArchivos.findIndex(item => item.nombre == index.nombre), 1);
      this.mensajeService.mensajeConfirmacion(`Confirmación`, `Archivo eliminado con éxito!`);
    }, () => this.mensajeService.mensajeError(`Error`, `No fue posible eliminar el archivo`));
    this.clave = '';
  }

  // Funcion que permitirá eliminar una carpeta
  eliminarCarpetas(ruta : string, index : any){
    ruta = this.rutaSeleccionada;
    index = this.fileSeleccionado;
    this.onReject();
    this.archivosService.eliminarCarpetas(ruta).subscribe(() => {
      this.ArrayArchivos.splice(this.ArrayArchivos.findIndex(item => item.nombre == index.nombre), 1);
      this.mensajeService.mensajeConfirmacion(`Confirmación`, `Carpeta eliminada con éxito!`);
    }, () => this.mensajeService.mensajeError(`Error`, `No fue posible eliminar la carpeta`));
    this.clave = '';
  }

  /* Funcion inicial que se encargará de validar si la funcion que se esta haciendo es una copia o un movimiento de un archivo,
   * ademas de darle valor a la variable que declara el la ruta incial y la que declara el nombre del archivo o carpeta
  */
  moverArchivoCarpeta(accion : string, ruta : string, nombre : string){
    this.clave = accion;
    setTimeout(() => {
      if (this.clave == 'copiar') {
        this.rutaInicial = ruta;
        this.nombreArchivo = nombre;
        this.messageService.add({severity:'warn', key: this.clave, summary:'Elección', detail: `Está seguro que quiere copiar el archivo/carpeta?`, sticky: true});
      } else if (this.clave == 'mover'){
        this.rutaInicial = ruta;
        this.nombreArchivo = nombre;
        this.messageService.add({severity:'warn', key: this.clave, summary:'Elección', detail: `Está seguro que quiere mover este archivo/carpeta?`, sticky: true});
      }
    }, 500);
  }

  /** Función que valida la acción de confirmar la copia de un archivo, contiene su ruta y nombre */
  copyFiles(validador : number){
    this.onReject()
    this.copiar = true;
    if (validador == 1) this.validarArchivo_Carpeta = true;
    else this.validarArchivo_Carpeta = false;
    this.clave = '';
  }

  /** Función que valida la acción de confirmar el movimiento de un archivo, contiene su ruta y nombre */
  moveFiles(validador : number){
    this.onReject();
    this.mover = true;
    if (validador == 1) this.validarArchivo_Carpeta = true;
    else this.validarArchivo_Carpeta = false;
    this.clave = '';
  }

  /* Variable que se encargará de validar una vez mas el proceso que se va a realizar,
   * una copia o un movimiento, luego validará si es un archivo o carpeta y dependiendo de eso llamará a una funcion u otra
  */
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
    this.archivosService.moverArchivo(this.rutaInicial, `${this.nombreCarpeta}\\${this.nombreArchivo}`).subscribe(() => {
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
    this.archivosService.moverCarpeta(this.rutaInicial, `${this.nombreCarpeta}\\${this.nombreArchivo}`).subscribe(() => {
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
    this.archivosService.copiarArchivo(`${this.rutaInicial}`, `${this.nombreCarpeta}\\${this.nombreArchivo}`).subscribe(() => {
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
    this.archivosService.crearCarpetas(`${this.nombreCarpeta}\\${nombreCarpeta}`).subscribe(() => {
      this.archivosService.copiarCarpeta(`${this.rutaInicial}`, `${this.nombreCarpeta}\\${nombreCarpeta}`).subscribe(() => {
        this.ArrayArchivos = [];
        this.copiar = false;
        this.cargarArchivos(this.nombreCarpeta);
        this.mostrarCarpetas(this.nombreCarpeta);
      });
    });
  }
}
