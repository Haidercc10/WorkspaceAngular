import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { SolicitudMateriaPrimaComponent } from 'src/app/Vistas/Solicitud-Materia-Prima/Solicitud-Materia-Prima.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [VistasPermisosGuard], 
    data: {nombre: 'Solicitud Materia Prima'}, 
    component: SolicitudMateriaPrimaComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SolicitudMateriaPrimaRoutingModule { }
