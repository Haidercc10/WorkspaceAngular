import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { AseguramientoCalidadComponent } from 'src/app/Vistas/aseguramiento-calidad/aseguramiento-calidad.component';

const routes: Routes = [
  {
    path: '', 
    component: AseguramientoCalidadComponent,
    canActivate: [VistasPermisosGuard], 
    data: {nombre: 'Aseguramiento de la Calidad'}, 
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AseguramientoCalidadRoutingModule { }
