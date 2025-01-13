import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { ReporteClientesComponent } from 'src/app/Vistas/reporte-clientes/reporte-clientes.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [VistasPermisosGuard], 
    data: {nombre: 'Reporte de Clientes'}, 
    component: ReporteClientesComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReporteClientesRoutingModule { }
