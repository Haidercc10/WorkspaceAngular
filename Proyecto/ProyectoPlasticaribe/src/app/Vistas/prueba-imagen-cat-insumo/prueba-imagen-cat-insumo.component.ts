import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { Vistas_PermisosService } from 'src/app/Servicios/Vistas_Permisos/Vistas_Permisos.service';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-prueba-imagen-cat-insumo',
  templateUrl: './prueba-imagen-cat-insumo.component.html',
  styleUrls: ['./prueba-imagen-cat-insumo.component.css']
})

export class PruebaImagenCatInsumoComponent implements OnInit  {

  items: MenuItem[];
  cargando : boolean = false;
  categorias : any[] = [];
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente

  constructor(private AppComponent : AppComponent,
                private vistasPermisosService : Vistas_PermisosService,
                private router : Router) {    
  }
  
  ngOnInit(): void {
    this.lecturaStorage();
    this.CargarCategorias() 
  }
  lecturaStorage(){
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  CargarCategorias(){
    this.vistasPermisosService.GetCategoriasMenu(this.ValidarRol).subscribe(data => {
      this.categorias = [];
      for (let i = 0; i < data.length; i++){
        data[i].split('|').forEach(element => {
          if (this.categorias.length > 0 && element != '' && element != 'Inicio') {
            if (this.categorias.findIndex(item => item.label == element) == -1) this.categorias.push({label: element, icon: '', items: []});
          } else if (element != '' && element != 'Inicio') this.categorias.push({label: element, icon: '', items: []});
        });
      }
      this.categorias.sort((a, b) => a.label.localeCompare(b.label));
      this.categorias.unshift({label: `Inicio`, icon: 'pi pi-home', command: () => this.router.navigate(['/home'])});
      this.cargarOpcionesMenu();
    });
  }

  cargarOpcionesMenu(){
    this.categorias.forEach(element => {
      this.vistasPermisosService.Get_Vistas_Rol(this.ValidarRol, element.label).subscribe(data => {
        for (let i = 0; i < data.length; i++){
          element.items.push({ label: data[i].vp_Nombre, icon: data[i].vp_Icono_Menu, command: () => this.router.navigate([data[i].vp_Ruta]) });
        }
      });
    });
  }
}