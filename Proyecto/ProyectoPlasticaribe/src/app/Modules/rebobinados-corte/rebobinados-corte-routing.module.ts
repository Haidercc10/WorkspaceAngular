import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { Rebobinados_CorteComponent } from 'src/app/Vistas/Rebobinados_Corte/Rebobinados_Corte.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [VistasPermisosGuard], 
    data: { nombre: 'Rebobinado de Corte' }, 
    component: Rebobinados_CorteComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RebobinadosCorteRoutingModule { }
