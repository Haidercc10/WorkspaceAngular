import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { Solicitud_Rollos_BodegasComponent } from 'src/app/Vistas/Solicitud_Rollos_Bodegas/Solicitud_Rollos_Bodegas.component';

const routes: Routes = [
  {
    path: '',
    component: Solicitud_Rollos_BodegasComponent,
    canActivate: [VistasPermisosGuard], 
    data: {nombre: 'Solicitud de Rollos'}, 
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SolicitudRollosRoutingModule { }
