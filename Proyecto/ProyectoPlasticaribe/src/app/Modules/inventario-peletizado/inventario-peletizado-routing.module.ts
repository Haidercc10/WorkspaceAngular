import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { Inventario_PeletizadoComponent } from 'src/app/Vistas/Inventario_Peletizado/Inventario_Peletizado.component';

const routes: Routes = [
  {
    path: '', 
    canActivate: [VistasPermisosGuard], 
    data: {nombre: 'Inventario Peletizado'}, 
    component: Inventario_PeletizadoComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InventarioPeletizadoRoutingModule { }
