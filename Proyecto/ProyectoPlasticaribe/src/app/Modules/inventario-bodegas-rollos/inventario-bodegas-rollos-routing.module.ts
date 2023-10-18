import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { Inventario_Bodegas_RollosComponent } from 'src/app/Vistas/Inventario_Bodegas_Rollos/Inventario_Bodegas_Rollos.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [VistasPermisosGuard], 
    data: {nombre: 'Inventario de Bodegas'}, 
    component: Inventario_Bodegas_RollosComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InventarioBodegasRollosRoutingModule { }
