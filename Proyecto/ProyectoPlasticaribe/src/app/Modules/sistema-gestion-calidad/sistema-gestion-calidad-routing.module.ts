import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { SistemaGestionCalidadComponent } from 'src/app/Vistas/sistema-gestion-calidad/sistema-gestion-calidad.component';

const routes: Routes = [
  {
    path: '', 
    component: SistemaGestionCalidadComponent,
    canActivate: [VistasPermisosGuard], 
    data: {nombre: 'Sistemas de Gestión'}, 
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SistemaGestionCalidadRoutingModule { }
