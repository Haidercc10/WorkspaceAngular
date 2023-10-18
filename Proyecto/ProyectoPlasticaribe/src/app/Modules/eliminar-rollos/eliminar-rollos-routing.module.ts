import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { EliminarRollos_ExtrusionComponent } from 'src/app/Vistas/EliminarRollos_Extrusion/EliminarRollos_Extrusion.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [VistasPermisosGuard], 
    data: {nombre: 'Eliminar Rollos'}, 
    component : EliminarRollos_ExtrusionComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EliminarRollosRoutingModule { }
