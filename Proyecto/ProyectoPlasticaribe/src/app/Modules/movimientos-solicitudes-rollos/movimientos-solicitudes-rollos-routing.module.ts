import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { Movimientos_SolicitudRollosComponent } from 'src/app/Vistas/Movimientos_SolicitudRollos/Movimientos_SolicitudRollos.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [VistasPermisosGuard], 
    data: {nombre: 'Movimientos Solicitudes de Rollos'},
    component : Movimientos_SolicitudRollosComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MovimientosSolicitudesRollosRoutingModule { }
