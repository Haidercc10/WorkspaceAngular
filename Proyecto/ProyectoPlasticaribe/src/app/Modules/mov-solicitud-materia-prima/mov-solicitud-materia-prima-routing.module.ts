import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { Reporte_SolicitudesMPComponent } from 'src/app/Vistas/Reporte_SolicitudesMP/Reporte_SolicitudesMP.component';

const routes: Routes = [{
  path: '',
  canActivate: [VistasPermisosGuard], 
  data: {nombre: 'Mov. Solicitud Materia Prima'}, 
  component: Reporte_SolicitudesMPComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MovSolicitudMateriaPrimaRoutingModule { }
