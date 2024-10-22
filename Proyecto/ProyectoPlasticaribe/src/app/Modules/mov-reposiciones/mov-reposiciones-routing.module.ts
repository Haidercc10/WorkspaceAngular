import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { Mov_ReposicionesComponent } from 'src/app/Vistas/Mov_Reposiciones/Mov_Reposiciones.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [VistasPermisosGuard], 
    data: {nombre: 'Movimientos Reposiciones'}, 
    component : Mov_ReposicionesComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MovReposicionesRoutingModule { }
