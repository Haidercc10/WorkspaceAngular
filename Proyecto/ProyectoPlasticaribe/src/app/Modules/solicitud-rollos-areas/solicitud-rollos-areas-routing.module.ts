import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { SolicitudRollosAreasComponent } from 'src/app/Vistas/solicitud-rollos-areas/solicitud-rollos-areas.component';

const routes: Routes = [
  {
    path: '',
    component: SolicitudRollosAreasComponent,
    canActivate: [VistasPermisosGuard], 
    data: {nombre: 'Solicitud Rollos Areas'}, 
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SolicitudRollosAreasRoutingModule { }
