import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { Reporte_RollosDesechosComponent } from 'src/app/Vistas/Reporte_RollosDesechos/Reporte_RollosDesechos.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [VistasPermisosGuard], 
    data: {nombre: 'Reporte Rollos Eliminados'}, 
    component :Reporte_RollosDesechosComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MovRollosEliminadosRoutingModule { }
