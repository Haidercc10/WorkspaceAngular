import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { Devolucion_BodegaRollosComponent } from 'src/app/Vistas/Devolucion_BodegaRollos/Devolucion_BodegaRollos.component';

const routes: Routes = [
  {
    path: '',
    component: Devolucion_BodegaRollosComponent,
    canActivate: [VistasPermisosGuard], 
    data: {nombre: 'Devolución Rollos'}, 
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DevolucionBodegaRollosRoutingModule { }
