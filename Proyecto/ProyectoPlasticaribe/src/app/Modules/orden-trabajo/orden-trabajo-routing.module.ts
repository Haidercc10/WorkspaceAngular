import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { Orden_TrabajoComponent } from 'src/app/Vistas/Orden_Trabajo/Orden_Trabajo.component';

const routes: Routes = [
  {
    path: '',
    component: Orden_TrabajoComponent,
    canActivate: [VistasPermisosGuard], 
    data: {nombre: 'Orden de Trabajo'}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrdenTrabajoRoutingModule { }
