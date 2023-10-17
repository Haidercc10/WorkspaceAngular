import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { Ingreso_Rollos_ExtrusionComponent } from 'src/app/Vistas/Ingreso_Rollos_Extrusion/Ingreso_Rollos_Extrusion.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [VistasPermisosGuard], 
    data: {nombre: 'Ingreso de Rollos'}, 
    component : Ingreso_Rollos_ExtrusionComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IngresoRollosRoutingModule { }
