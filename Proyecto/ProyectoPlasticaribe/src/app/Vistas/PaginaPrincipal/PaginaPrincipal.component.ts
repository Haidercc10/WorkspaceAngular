import { AfterViewInit, Component, ElementRef, Injectable, OnDestroy, OnInit } from '@angular/core';
import moment from 'moment';
import { AppComponent } from 'src/app/app.component';
import { modelUsabilidad_Modulos } from 'src/app/Modelo/modelUsabilidad_Modulos';
import { UsabilidadModulosService } from 'src/app/Servicios/Usabilidad_Modulos/usabilidad-modulos.service';

@Injectable({  providedIn: 'root' })

@Component({
  selector: 'app-PaginaPrincipal',
  templateUrl: './PaginaPrincipal.component.html',
  styleUrls: ['./PaginaPrincipal.component.css']
})

export class PaginaPrincipalComponent implements OnInit, AfterViewInit, OnDestroy {

  private limpiarArrastreTabs : () => void; //Función que elimina los eventos de arrastre de la barra de pestañas

  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  ordenTrabajo : boolean = false; //Variable que se usará para mostrar el módulo de ordenes de trabajo
  facturacion : boolean = false; //Variable que se usará para mostrar el módulo de facturación
  materiaPrima : boolean = false; //Variable que se usará para mostrar el módulo de materia prima
  pedidos: boolean = false; //Variable que se usará para mostrar el módulo de pedidos
  facturacionVendedores : boolean = false; //Variable que se usará para mostrar el módulo de facturación vendedores
  recaudos : boolean = false; // Variable que se usará para mostrar el módulo de recaudos
  cuentasPagar : boolean = false; // Variable que se usará para mostrar el módulo de cuentas por pagar
  gerencia : boolean = false; // Variable que se usará para mostrar el módulo de gerencia
  costos : boolean = false; // Variable que se usará para mostrar el módulo de costos
  compras : boolean = false; // Variable que se usará para mostrar el módulo de compras
  inventarioAreas : boolean = false; // Variable que se usará para mostrar el módulo de inventario áreas
  calidad : boolean = false; // Variable que se usará para mostrar el módulo de calidad
  production : boolean = false; // Variable que se usará para mostrar el módulo de producción

  constructor(private AppComponent : AppComponent,
    private svUseModules : UsabilidadModulosService,
    private elementRef : ElementRef,
  ) { }

  ngOnInit() {
    this.lecturaStorage();
    this.production = true;
    this.ordenTrabajo = true;
  }

  ngAfterViewInit(): void {
    this.habilitarArrastreTabs();
  }

  //Función que permite desplazar la barra de pestañas presionando y arrastrando con el mouse (en táctil el deslizamiento es nativo)
  habilitarArrastreTabs() {
    const nav : HTMLElement = this.elementRef.nativeElement.querySelector('.p-tabview-nav-content');
    if (!nav) return;

    let presionado = false;
    let arrastro = false;
    let inicioX = 0;
    let scrollInicial = 0;

    const onMouseDown = (e : MouseEvent) => {
      if (e.button !== 0) return;
      presionado = true;
      arrastro = false;
      inicioX = e.pageX;
      scrollInicial = nav.scrollLeft;
    };

    const onMouseMove = (e : MouseEvent) => {
      if (!presionado) return;
      const desplazamiento = e.pageX - inicioX;
      if (!arrastro && Math.abs(desplazamiento) > 5) {
        arrastro = true;
        nav.classList.add('arrastrando');
      }
      if (arrastro) {
        e.preventDefault();
        nav.scrollLeft = scrollInicial - desplazamiento;
      }
    };

    const onMouseUp = () => {
      presionado = false;
      nav.classList.remove('arrastrando');
    };

    //Si hubo arrastre, se cancela el click para que no cambie de pestaña al soltar
    const onClick = (e : MouseEvent) => {
      if (arrastro) {
        e.preventDefault();
        e.stopPropagation();
        arrastro = false;
      }
    };

    //Rueda vertical del mouse desplaza la barra horizontalmente
    const onWheel = (e : WheelEvent) => {
      if (nav.scrollWidth <= nav.clientWidth || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      e.preventDefault();
      nav.scrollLeft += e.deltaY;
    };

    nav.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    nav.addEventListener('click', onClick, true);
    nav.addEventListener('wheel', onWheel, { passive: false });

    this.limpiarArrastreTabs = () => {
      nav.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      nav.removeEventListener('click', onClick, true);
      nav.removeEventListener('wheel', onWheel);
    };
  }

  ngOnDestroy(): void {
    this.limpiarArrastreTabs?.();
    this.production = false;
    this.ordenTrabajo = false;
    this.facturacion = false;
    this.materiaPrima = false;
    this.pedidos= false;
    this.facturacionVendedores = false;
    this.recaudos = false;
    this.cuentasPagar = false;
    this.gerencia = false;
    this.costos = false;
    this.compras = false;
    this.inventarioAreas = false;
    this.calidad = false;
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  //
  cambioTab(e : any) {  
    var index = e.index;
    let tab : any = e.originalEvent.srcElement.innerText;

    //Usuario administrador.
    index == 1 ? this.ordenTrabajo = true : this.ordenTrabajo = false;
    index == 2 ? this.facturacion = true : this.facturacion = false;
    index == 3 ? this.materiaPrima = true : this.materiaPrima = false;
    index == 4 ? this.pedidos = true : this.pedidos = false;
    index == 5 ? this.facturacionVendedores = true : this.facturacionVendedores = false;
    index == 6 ? this.recaudos = true : this.recaudos = false;
    index == 7 ? this.cuentasPagar = true : this.cuentasPagar = false;
    index == 8 ? this.gerencia = true : this.gerencia = false;
    index == 9 ? this.costos = true : this.costos = false;
    index == 10 ? this.compras = true : this.compras = false;
    index == 11 ? this.inventarioAreas = true : this.inventarioAreas = false;
    index == 12 ? this.calidad = true : this.calidad = false;

    //Facturación, Despacho, 
    index == 1 && [6,10,12,96,69].includes(this.ValidarRol) ? this.facturacion = true : null;
    index == 2 && [6,10,12,96].includes(this.ValidarRol) ? this.pedidos = true : null;
    index == 3 && [97,10].includes(this.ValidarRol) ? this.gerencia = true : null;

    //Calidad
    index == 4 && [5].includes(this.ValidarRol) ? this.calidad = true : null;
    index == 2 && [5].includes(this.ValidarRol) ? this.gerencia = true : null;
    index == 3 && [5].includes(this.ValidarRol) ? this.inventarioAreas = true : null;

    //Cartera
    index == 2 && [69].includes(this.ValidarRol) ? this.recaudos = true : null;
    
    //Planeación
    index == 3 && [98].includes(this.ValidarRol) ? this.materiaPrima = true : null;
    index == 4 && [98].includes(this.ValidarRol) ? this.pedidos = true : null;
    index == 5 && [98].includes(this.ValidarRol) ? this.inventarioAreas = true : null;
    
    //Jefes Extrusion/Sellado/Impresión/Rotograbado 
    index == 2 && [85,94,4,89,88,87].includes(this.ValidarRol) ? this.materiaPrima = true : null;
    index == 3 && [85,94,4,89,88,87].includes(this.ValidarRol) ? this.inventarioAreas = true : null;
    index == 4 && [85,94,4,89,88,87].includes(this.ValidarRol) ? this.calidad = true : null;
    
    //Ventas
    index == 2 && [98,103].includes(this.ValidarRol) ? this.facturacion = true : null;
    index == 3 && [2,103].includes(this.ValidarRol) ? this.pedidos = true : null;
    index == 4 && [2,103].includes(this.ValidarRol) ? this.facturacionVendedores = true : null;
    index == 5 && [2,103].includes(this.ValidarRol) ? this.recaudos = true : null;
    //index == 6 && [2].includes(this.ValidarRol) ? this.gerencia = true : null;

    index == 0 && [2].includes(this.ValidarRol) ? this.ordenTrabajo = true : null;
    index == 1 && [2].includes(this.ValidarRol) ? this.pedidos = true : null;
    index == 2 && [2].includes(this.ValidarRol) ? this.facturacionVendedores = true : null;
    index == 3 && [2].includes(this.ValidarRol) ? this.recaudos = true : null;

    
    index == 5 && [104].includes(this.ValidarRol) ? this.costos = true : null;
    index == 6 && [104].includes(this.ValidarRol) ? this.compras = true : null;
    index == 7 && [104].includes(this.ValidarRol) ? this.inventarioAreas = true : null;

    this.saveLogModule(tab);
  }

  //Funcion que guardará el log de los módulos a los que se acceda, se guardará el id del usuario, el módulo al que se accedió, la fecha y hora de acceso y la acción realizada
  saveLogModule(module : string){
    let model : modelUsabilidad_Modulos = {
      Usm_Modulo: 'Dashboard ' + module,
      Usua_Id: this.storage_Id,
      Usm_Fecha: moment().format('YYYY-MM-DD'),
      Usm_Hora: moment().format('HH:mm:ss'),
      Usm_Accion : 'Click'
    } 
    this.svUseModules.Post(model).subscribe(data => {
      //console.log(data)
    }, error => {
      console.log(error);
    })
  }
}
