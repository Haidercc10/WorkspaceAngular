import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { Mov_IngresoPeletizadoComponent } from 'src/app/Vistas/Mov_IngresoPeletizado/Mov_IngresoPeletizado.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [VistasPermisosGuard], 
    data: {nombre: 'Movimientos Peletizado'}, 
    component: Mov_IngresoPeletizadoComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MovIngresoPeletizadoRoutingModule { }
