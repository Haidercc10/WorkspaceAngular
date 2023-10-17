import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { ModalGenerarInventarioZeusComponent } from 'src/app/Vistas/modal-generar-inventario-zeus/modal-generar-inventario-zeus.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [VistasPermisosGuard], 
    data: {nombre: 'Producto Terminado (Zeus)'}, 
    component: ModalGenerarInventarioZeusComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InventarioZeusProductosRoutingModule { }
