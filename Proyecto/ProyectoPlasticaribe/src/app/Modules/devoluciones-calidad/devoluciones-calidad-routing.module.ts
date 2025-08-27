import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { DevolucionesCalidadComponent } from 'src/app/Vistas/devoluciones-calidad/devoluciones-calidad.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [VistasPermisosGuard], 
    data: {nombre: 'Devoluciones Calidad'}, 
    component : DevolucionesCalidadComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DevolucionesCalidadRoutingModule { }
