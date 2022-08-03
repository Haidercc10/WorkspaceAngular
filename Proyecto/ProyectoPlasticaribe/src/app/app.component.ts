import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'ProyectoPlasticaribe';
  validar : number = 0;

  ngOnInit(): void {
    this.inactividad();
  }

  //Funcio para verificar la inactividad de un usuario, cuando pasa mas de 30 minutos sin actividad se cierra la sesion
  inactividad(){
    let t : any;
    window.onload = reiniciarTiempo;
    // Eventos del DOM
    document.onmousemove = reiniciarTiempo;
    document.onkeypress = reiniciarTiempo;
    document.onload = reiniciarTiempo;
    document.onmousemove = reiniciarTiempo;
    document.onmousedown = reiniciarTiempo; // aplica para una pantalla touch
    document.ontouchstart = reiniciarTiempo;
    document.onclick = reiniciarTiempo;     // aplica para un clic del touchpad
    document.onscroll = reiniciarTiempo;    // navegando con flechas del teclado
    document.onkeypress = reiniciarTiempo;

    function tiempoExcedido() {
      window.location.href = "./";
    }

    function reiniciarTiempo() {
      let estadoConexion : boolean = window.navigator.onLine;
      if (window.location.pathname != '/' && !estadoConexion) window.location.href = "./";
      clearTimeout(t);
      t = setTimeout(tiempoExcedido, 1800000);
      // 1 minuto son 60000 millisegundos
      // 30 minutos son 1800000 milisegundos
    }
  }
}
