import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { Reporte_DesperdiciosComponent } from 'src/app/Vistas/Reporte_Desperdicios/Reporte_Desperdicios.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [VistasPermisosGuard], 
    data: {nombre: 'Reporte Desperdicio'}, 
    component: Reporte_DesperdiciosComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MovimientosDesperdiciosRoutingModule { }
