import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { Reporte_Procesos_OTComponent } from 'src/app/Vistas/Reporte_Procesos_OT/Reporte_Procesos_OT.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [VistasPermisosGuard], 
    data: {nombre: 'Reporte Procesos OT'}, 
    component: Reporte_Procesos_OTComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReporteProcesosOTRoutingModule { }
