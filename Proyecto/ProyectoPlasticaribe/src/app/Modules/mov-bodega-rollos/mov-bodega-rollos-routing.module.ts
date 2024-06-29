import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { Mov_BodegaRollosComponent } from 'src/app/Vistas/Mov_BodegaRollos/Mov_BodegaRollos.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [VistasPermisosGuard], 
    data: {nombre: 'Movimientos Bodega de Rollos'}, 
    component: Mov_BodegaRollosComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MovBodegaRollosRoutingModule { }
