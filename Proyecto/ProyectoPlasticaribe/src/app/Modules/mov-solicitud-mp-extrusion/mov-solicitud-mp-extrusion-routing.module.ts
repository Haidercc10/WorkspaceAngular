import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { Reporte_SolicitudMpExtrusionComponent } from 'src/app/Vistas/Reporte_SolicitudMpExtrusion/Reporte_SolicitudMpExtrusion.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [VistasPermisosGuard], 
    data: {nombre: 'Mov. Solicitud Material Producción'}, 
    component: Reporte_SolicitudMpExtrusionComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MovSolicitudMPExtrusionRoutingModule { }
