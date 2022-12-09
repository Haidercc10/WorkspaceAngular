import { Component, OnInit, Injectable } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-prueba-imagen-cat-insumo',
  templateUrl: './prueba-imagen-cat-insumo.component.html',
  styleUrls: ['./prueba-imagen-cat-insumo.component.css']
})

export class PruebaImagenCatInsumoComponent implements OnInit {

  items: MenuItem[];

  ngOnInit() {
    this.items = [{
      label: 'File',
      items: [
        {label: 'New', icon: 'pi pi-plus', replaceUrl: true, url: './registro-usuario'},
        {label: 'Open', icon: 'pi pi-download'}
      ],
    },
    {
      label: 'Edit',
      items: [
        {
          label: 'Undo',
          icon: 'pi pi-refresh',
          command: () => {
            window.location.href = "./home"
          }
        },
        {label: 'Redo', icon: 'pi pi-repeat'}
      ]
    }];
  }
}
