import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { SolicitudMP_ExtrusionComponent } from 'src/app/Vistas/SolicitudMP_Extrusion/SolicitudMP_Extrusion.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [VistasPermisosGuard], 
    data: {nombre: 'Solicitud Material Producción'}, 
    component: SolicitudMP_ExtrusionComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SolicitudMPExtrusionRoutingModule { }
