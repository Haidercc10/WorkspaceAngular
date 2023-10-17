import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { AsignacionMateriaPrimaComponent } from 'src/app/Vistas/asignacion-materia-prima/asignacion-materia-prima.component';

const routes: Routes = [{
  path: '',
  canActivate: [VistasPermisosGuard], 
  data: {nombre: 'Asignación de Materia Prima'}, 
  component: AsignacionMateriaPrimaComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AsignacionMateriaPrimaRoutingModule { }
