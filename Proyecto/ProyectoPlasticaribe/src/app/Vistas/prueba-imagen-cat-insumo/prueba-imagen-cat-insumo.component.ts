import { Component, Inject, OnInit } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { EncriptacionService } from 'src/app/Servicios/Encriptacion/Encriptacion.service';

@Component({
  selector: 'app-prueba-imagen-cat-insumo',
  templateUrl: './prueba-imagen-cat-insumo.component.html',
  styleUrls: ['./prueba-imagen-cat-insumo.component.css']
})

export class PruebaImagenCatInsumoComponent implements OnInit {

  data :any
  encriptada : any;
  desencriptada : any;
  constructor(@Inject(SESSION_STORAGE) private storage: WebStorageService,
                private encriptacionService : EncriptacionService,) { }

  ngOnInit() {
  }

  encriptar(){
    this.encriptada = this.encriptacionService.encrypt(this.data);

    this.desencriptada = this.encriptacionService.decrypt(this.encriptada);
  }
}
