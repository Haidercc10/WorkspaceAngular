import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { Mantenimiento_CamionesComponent } from 'src/app/Vistas/Mantenimiento_Camiones/Mantenimiento_Camiones.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [VistasPermisosGuard], 
    data: {nombre: 'Mantenimiento de Activos'},
    component: Mantenimiento_CamionesComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MantenimientoActivosRoutingModule { }
