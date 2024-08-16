import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { Asignacion_RollosOTComponent } from 'src/app/Vistas/Asignacion_RollosOT/Asignacion_RollosOT.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [VistasPermisosGuard], 
    data: { nombre: 'Asignación Rollos OT' }, 
    component: Asignacion_RollosOTComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AsignacionRollosOtRoutingModule { }
