import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { InventarioProductosPBDDComponent } from 'src/app/Vistas/Inventario-Productos-PBDD/Inventario-Productos-PBDD.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [VistasPermisosGuard], 
    data: {nombre: 'Producto Terminado'}, 
    component : InventarioProductosPBDDComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InventarioProductosRoutingModule { }
