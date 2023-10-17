import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { PreIngresoRollosExtrusionComponent } from 'src/app/Vistas/PreIngresoRollosExtrusion/PreIngresoRollosExtrusion.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [VistasPermisosGuard], 
    data: {nombre: 'Pre Ingreso Extrusión'}, 
    component : PreIngresoRollosExtrusionComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PreIngresoExtrusionRoutingModule { }
