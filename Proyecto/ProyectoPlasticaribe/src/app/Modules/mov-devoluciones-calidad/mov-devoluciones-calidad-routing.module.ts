import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { MovDevolucionesCalidadComponent } from 'src/app/Vistas/mov-devoluciones-calidad/mov-devoluciones-calidad.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [VistasPermisosGuard], 
    data: {nombre: 'Movimientos Devoluciones Calidad'}, 
    component: MovDevolucionesCalidadComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MovDevolucionesCalidadRoutingModule { }
